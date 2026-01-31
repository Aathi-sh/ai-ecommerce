import { NextResponse } from 'next/server';
import { connectDB } from '../../../../utils/db';
import Professional from '@/models/Bookingmng';
import User from '@/models/user';

// GET ALL Professionals with filters
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'email': { $regex: search, $options: 'i' } },
        { 'phone': { $regex: search, $options: 'i' } },
        { 'specialization': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.verificationStatus = status;
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Active professionals only
    query.isActive = true;
    
    // Get total count
    const total = await Professional.countDocuments(query);
    
    // Get professionals with user details
    const professionals = await Professional.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: professionals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CREATE New Professional
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if user exists
    const userExists = await User.findById(body.userId);
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if professional already exists for this user
    const existingProfessional = await Professional.findOne({ 
      userId: body.userId 
    });
    
    if (existingProfessional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile already exists for this user' },
        { status: 400 }
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
    
    // Create professional
    const professional = new Professional({
      ...body,
      whatsappVerified: false,
      autoReplyEnabled: false,
      rating: { average: 0, totalReviews: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      totalBookings: 0,
      completedBookings: 0,
      isActive: true,
      featured: false
    });
    
    await professional.save();
    
    // Update user role to professional
    await User.findByIdAndUpdate(body.userId, {
      role: 'professional',
      professionalId: professional._id
    });
    
    return NextResponse.json({
      success: true,
      data: professional,
      message: 'Professional created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating professional:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE Professional Status (for single operation via query params)
export async function PATCH(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action'); // 'verify', 'suspend', 'activate', 'feature'
    
    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing ID or action parameter' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    let updateData = {};
    
    switch (action) {
      case 'verify':
        updateData = { 
          verificationStatus: 'verified',
          ...body 
        };
        break;
        
      case 'suspend':
        updateData = { 
          verificationStatus: 'suspended',
          isActive: false,
          ...body 
        };
        break;
        
      case 'activate':
        updateData = { 
          isActive: true,
          verificationStatus: body.status || 'verified',
          ...body 
        };
        break;
        
      case 'feature':
        updateData = { 
          featured: body.featured || true,
          ...body 
        };
        break;
        
      default:
        // General update
        updateData = body;
    }
    
    const professional = await Professional.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');
    
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: professional,
      message: `Professional ${action}ed successfully`
    });
    
  } catch (error) {
    console.error('Error updating professional:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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
    const professional = await Professional.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        verificationStatus: 'suspended'
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
    await User.findByIdAndUpdate(professional.userId, {
      role: 'user',
      professionalId: null
    });
    
    return NextResponse.json({
      success: true,
      message: 'Professional deactivated successfully'
    });
    
  } catch (error) {
    console.error('Error deleting professional:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}