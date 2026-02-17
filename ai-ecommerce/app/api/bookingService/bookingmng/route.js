import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Bookingmng from '@/models/Bookingmng';
import User from '@/models/user';

// GET ALL Professionals with filters
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const type = searchParams.get('type') || 'all';
    const verification = searchParams.get('verification') || 'all';
    
    const skip = (page - 1) * limit;
    
    let query = {};

    // If role=user, fetch users for dropdown
    if (role === 'user') {
      const users = await User.find({ 
        $or: [
          { role: 'user' },
          { role: { $exists: false } }
        ]
      })
      .select('_id name email phone avatar')
      .limit(limit)
      .lean();
      
      const total = await User.countDocuments({ 
        $or: [
          { role: 'user' },
          { role: { $exists: false } }
        ]
      });

      const formattedUsers = users.map(user => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString()
      }));

      return NextResponse.json({
        success: true,
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, { status: 200 });
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }
    
    // Verification status filter
    if (verification && verification !== 'all') {
      query.verificationStatus = verification;
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Get total count
    const total = await Bookingmng.countDocuments(query);
    
    // Get professionals with user details
    const professionals = await Bookingmng.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone avatar')
      .lean();
    
    // Format the response data
    const formattedProfessionals = professionals.map(prof => ({
      ...prof,
      _id: prof._id.toString(),
      userId: prof.userId ? {
        ...prof.userId,
        _id: prof.userId._id.toString()
      } : null,
      createdAt: prof.createdAt?.toISOString(),
      updatedAt: prof.updatedAt?.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedProfessionals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch professionals',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// CREATE New Professional
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.businessName || !body.category || !body.email || !body.phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['userId', 'businessName', 'category', 'email', 'phone']
        },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const userExists = await User.findById(body.userId);
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if professional already exists for this user
    const existingProfessional = await Bookingmng.findOne({ 
      userId: body.userId 
    });
    
    if (existingProfessional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile already exists for this user' },
        { status: 409 }
      );
    }
    
    // Check for duplicate email
    const emailExists = await Bookingmng.findOne({ email: body.email });
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Set default working hours if not provided
    if (!body.workingHours || body.workingHours.length === 0) {
      body.workingHours = [
        { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
        { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false }
      ];
    }
    
    // Set default rating
    const rating = body.rating || { 
      average: 0, 
      totalReviews: 0, 
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
    };
    
    // Clean service areas - remove empty strings
    const serviceAreas = body.serviceAreas?.filter(area => area && area.trim() !== '') || [];
    
    // Create professional
    const professional = new Bookingmng({
      userId: body.userId,
      businessName: body.businessName,
      tagline: body.tagline || '',
      type: body.type || 'individual',
      category: body.category,
      specialization: body.specialization || [],
      experience: body.experience || 0,
      
      // Contact
      phone: body.phone,
      email: body.email,
      address: body.address || {
        street: '', city: '', state: '', zipCode: '', country: ''
      },
      serviceType: body.serviceType || 'both',
      serviceAreas: serviceAreas,
      
      // Working Hours
      workingHours: body.workingHours,
      
      // WhatsApp
      whatsappBusinessId: body.whatsappBusinessId || '',
      autoReplyEnabled: body.autoReplyEnabled || false,
      autoReplyMessage: body.autoReplyMessage || 'Hello! Thank you for your message. Our team will get back to you soon.',
      whatsappVerified: false,
      
      // Settings
      bookingBuffer: body.bookingBuffer || 15,
      maxDailyBookings: body.maxDailyBookings || 10,
      cancellationPolicy: body.cancellationPolicy || 'moderate',
      
      // Social Media
      socialMedia: body.socialMedia || {
        website: '', facebook: '', instagram: '', linkedin: ''
      },
      
      // Documents
      documents: body.documents || {
        idProof: '', qualificationProof: '', license: ''
      },
      
      // Status
      isActive: true,
      isVerified: body.isVerified || false,
      isFeatured: body.isFeatured || false,
      verificationStatus: 'pending',
      
      // Stats
      rating: rating,
      totalBookings: 0,
      completedBookings: 0,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await professional.save();
    
    // Update user role to professional
    await User.findByIdAndUpdate(
      body.userId, 
      { 
        role: 'professional',
        professionalId: professional._id 
      },
      { new: true }
    );
    
    // Populate user data for response
    await professional.populate('userId', 'name email phone avatar');
    
    return NextResponse.json({
      success: true,
      data: {
        ...professional.toObject(),
        _id: professional._id.toString(),
        userId: professional.userId ? {
          ...professional.userId.toObject(),
          _id: professional.userId._id.toString()
        } : null,
        createdAt: professional.createdAt.toISOString(),
        updatedAt: professional.updatedAt.toISOString()
      },
      message: 'Professional created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating professional:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `${field} already exists` },
        { status: 409 }
      );
    }
    
    // Handle validation error
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: errors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create professional',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// UPDATE Professional Status
export async function PATCH(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    let updateData = { updatedAt: new Date() };
    let actionMessage = '';
    
    // Handle different actions
    switch (action) {
      case 'verify':
        updateData = { 
          ...updateData,
          verificationStatus: 'verified',
          isVerified: true,
          isActive: true,
          ...body 
        };
        actionMessage = 'verified';
        break;
        
      case 'suspend':
        updateData = { 
          ...updateData,
          verificationStatus: 'suspended',
          isActive: false,
          ...body 
        };
        actionMessage = 'suspended';
        break;
        
      case 'activate':
        updateData = { 
          ...updateData,
          isActive: true,
          verificationStatus: body.status || 'verified',
          ...body 
        };
        actionMessage = 'activated';
        break;
        
      case 'deactivate':
        updateData = { 
          ...updateData,
          isActive: false,
          ...body 
        };
        actionMessage = 'deactivated';
        break;
        
      case 'feature':
        updateData = { 
          ...updateData,
          isFeatured: body.featured !== undefined ? body.featured : true,
          ...body 
        };
        actionMessage = 'feature updated';
        break;
        
      default:
        // General update - remove sensitive fields
        const { _id, userId, createdAt, ...updateFields } = body;
        updateData = { ...updateData, ...updateFields };
        actionMessage = 'updated';
    }
    
    const professional = await Bookingmng.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar');
    
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...professional.toObject(),
        _id: professional._id.toString(),
        userId: professional.userId ? {
          ...professional.userId.toObject(),
          _id: professional.userId._id.toString()
        } : null,
        createdAt: professional.createdAt?.toISOString(),
        updatedAt: professional.updatedAt?.toISOString()
      },
      message: `Professional ${actionMessage} successfully`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating professional:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update professional',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE Professional (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      );
    }
    
    // Soft delete - mark as inactive
    const professional = await Bookingmng.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        verificationStatus: 'suspended',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }
    
    // Remove professional role from user
    if (professional.userId) {
      await User.findByIdAndUpdate(
        professional.userId,
        { 
          role: 'user',
          professionalId: null 
        }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Professional deactivated successfully',
      data: { id: id.toString() }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting professional:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete professional',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 200,
    headers: {
      'Allow': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}