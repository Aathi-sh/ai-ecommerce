// // app/api/bookingService/bookingmng/route.js
// import { NextResponse } from 'next/server';
// import { connectDB } from "@/utils/db";
// import Bookingmng from '@/models/Bookingmng';

// // GET ALL Professionals with filters
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 20;
//     const search = searchParams.get('search') || '';
//     const status = searchParams.get('status') || 'all';
//     const category = searchParams.get('category') || 'all';
//     const type = searchParams.get('type') || 'all';
//     const verification = searchParams.get('verification') || 'all';
//     const whatsappBusinessId = searchParams.get('whatsappBusinessId'); // For WhatsApp bot lookup
    
//     const skip = (page - 1) * limit;
    
//     let query = {};
    
//     // ===== WHATSAPP BOT LOOKUP =====
//     // When a customer messages a WhatsApp number, we need to find which business owns it
//     if (whatsappBusinessId) {
//       console.log('🔍 WhatsApp Bot looking for business with number:', whatsappBusinessId);
      
//       // Clean the WhatsApp number (remove @lid, @c.us, etc and get digits)
//       const cleanNumber = whatsappBusinessId.split('@')[0].replace(/\D/g, '');
      
//       // Search by whatsappBusinessId field (exact match or partial)
//       query = {
//         $or: [
//           { whatsappBusinessId: whatsappBusinessId },           // Exact match with @lid
//           { whatsappBusinessId: cleanNumber },                  // Exact match with digits only
//           { whatsappBusinessId: { $regex: cleanNumber } },      // Contains the number
//           { phone: cleanNumber }                                 // Also check phone field
//         ],
//         isActive: true  // Only active businesses
//       };
      
//       console.log('🔎 Search query:', JSON.stringify(query, null, 2));
      
//       // Find the business (should be one)
//       const business = await Bookingmng.findOne(query).lean();
      
//       if (!business) {
//         console.log('❌ No business found with WhatsApp number:', whatsappBusinessId);
//         return NextResponse.json({
//           success: true,
//           data: [],
//           message: 'No business found with this WhatsApp number'
//         }, { status: 200 });
//       }
      
//       console.log('✅ Business found:', business.businessName);
      
//       // Format the response
//       const formattedBusiness = {
//         ...business,
//         _id: business._id.toString(),
//         createdAt: business.createdAt?.toISOString(),
//         updatedAt: business.updatedAt?.toISOString()
//       };
      
//       return NextResponse.json({
//         success: true,
//         data: [formattedBusiness],
//         pagination: {
//           page: 1,
//           limit: 1,
//           total: 1,
//           pages: 1
//         }
//       }, { status: 200 });
//     }
    
//     // ===== ADMIN PANEL FILTERS =====
//     // Regular search filter (for admin panel)
//     if (search) {
//       query.$or = [
//         { businessName: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { specialization: { $regex: search, $options: 'i' } },
//         { tagline: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     // Status filter
//     if (status && status !== 'all') {
//       if (status === 'active') {
//         query.isActive = true;
//       } else if (status === 'inactive') {
//         query.isActive = false;
//       }
//     }
    
//     // Verification status filter
//     if (verification && verification !== 'all') {
//       query.verificationStatus = verification;
//     }
    
//     // Category filter
//     if (category && category !== 'all') {
//       query.category = category;
//     }
    
//     // Type filter
//     if (type && type !== 'all') {
//       query.type = type;
//     }
    
//     // Get total count for pagination
//     const total = await Bookingmng.countDocuments(query);
    
//     // Get professionals
//     const professionals = await Bookingmng.find(query)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 })
//       .lean();
    
//     // Format the response data
//     const formattedProfessionals = professionals.map(prof => ({
//       ...prof,
//       _id: prof._id.toString(),
//       createdAt: prof.createdAt?.toISOString(),
//       updatedAt: prof.updatedAt?.toISOString()
//     }));
    
//     return NextResponse.json({
//       success: true,
//       data: formattedProfessionals,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching professionals:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to fetch professionals',
//         message: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // CREATE New Professional
// export async function POST(request) {
//   try {
//     await connectDB();
    
//     const body = await request.json();
    
//     // Validate required fields
//     if (!body.businessName || !body.category || !body.email || !body.phone) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Missing required fields',
//           required: ['businessName', 'category', 'email', 'phone']
//         },
//         { status: 400 }
//       );
//     }

//     // Check if professional already exists with this email
//     const existingProfessional = await Bookingmng.findOne({ 
//       email: body.email 
//     });
    
//     if (existingProfessional) {
//       return NextResponse.json(
//         { success: false, error: 'Professional with this email already exists' },
//         { status: 409 }
//       );
//     }
    
//     // Set default working hours if not provided
//     if (!body.workingHours || body.workingHours.length === 0) {
//       body.workingHours = [
//         { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//         { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//         { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//         { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//         { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//         { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] },
//         { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }
//       ];
//     }
    
//     // Set default rating
//     const rating = body.rating || { 
//       average: 0, 
//       totalReviews: 0, 
//       breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
//     };
    
//     // Clean service areas - remove empty strings
//     const serviceAreas = body.serviceAreas?.filter(area => area && area.trim() !== '') || [];
    
//     // Create professional
//     const professional = new Bookingmng({
//       businessName: body.businessName,
//       tagline: body.tagline || '',
//       type: body.type || 'individual',
//       category: body.category,
//       specialization: body.specialization || [],
//       experience: body.experience || 0,
      
//       // Contact
//       phone: body.phone,
//       email: body.email,
//       address: body.address || {
//         street: '', city: '', state: '', zipCode: '', country: ''
//       },
//       serviceType: body.serviceType || 'both',
//       serviceAreas: serviceAreas,
      
//       // Working Hours
//       workingHours: body.workingHours,
      
//       // WhatsApp - THIS IS THE IMPORTANT FIELD FOR BOT LOOKUP
//       whatsappBusinessId: body.whatsappBusinessId || '',
//       autoReplyEnabled: body.autoReplyEnabled || false,
//       autoReplyMessage: body.autoReplyMessage || 'Hello! Thank you for your message. Our team will get back to you soon.',
//       whatsappVerified: false,
      
//       // Settings
//       bookingBuffer: body.bookingBuffer || 15,
//       maxDailyBookings: body.maxDailyBookings || 10,
//       cancellationPolicy: body.cancellationPolicy || 'moderate',
      
//       // Social Media
//       socialMedia: body.socialMedia || {
//         website: '', facebook: '', instagram: '', linkedin: ''
//       },
      
//       // Documents
//       documents: body.documents || {
//         idProof: '', qualificationProof: '', license: ''
//       },
      
//       // Status
//       isActive: true,
//       isVerified: body.isVerified || false,
//       isFeatured: body.isFeatured || false,
//       verificationStatus: 'pending',
      
//       // Stats
//       rating: rating,
//       totalBookings: 0,
//       completedBookings: 0,
      
//       // Timestamps
//       createdAt: new Date(),
//       updatedAt: new Date()
//     });
    
//     await professional.save();
    
//     // Prepare response data
//     const responseData = {
//       ...professional.toObject(),
//       _id: professional._id.toString(),
//       createdAt: professional.createdAt.toISOString(),
//       updatedAt: professional.updatedAt.toISOString()
//     };
    
//     return NextResponse.json({
//       success: true,
//       data: responseData,
//       message: 'Professional created successfully'
//     }, { status: 201 });
    
//   } catch (error) {
//     console.error('Error creating professional:', error);
    
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return NextResponse.json(
//         { success: false, error: `${field} already exists` },
//         { status: 409 }
//       );
//     }
    
//     // Handle validation error
//     if (error.name === 'ValidationError') {
//       const errors = {};
//       for (let field in error.errors) {
//         errors[field] = error.errors[field].message;
//       }
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Validation failed',
//           details: errors
//         },
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to create professional',
//         message: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // UPDATE Professional Status
// export async function PATCH(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     const action = searchParams.get('action');
    
//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: 'Professional ID is required' },
//         { status: 400 }
//       );
//     }
    
//     const body = await request.json();
    
//     let updateData = { updatedAt: new Date() };
//     let actionMessage = '';
    
//     // Handle different actions
//     switch (action) {
//       case 'verify':
//         updateData = { 
//           ...updateData,
//           verificationStatus: 'verified',
//           isVerified: true,
//           isActive: true,
//           ...body 
//         };
//         actionMessage = 'verified';
//         break;
        
//       case 'suspend':
//         updateData = { 
//           ...updateData,
//           verificationStatus: 'suspended',
//           isActive: false,
//           ...body 
//         };
//         actionMessage = 'suspended';
//         break;
        
//       case 'activate':
//         updateData = { 
//           ...updateData,
//           isActive: true,
//           verificationStatus: body.status || 'verified',
//           ...body 
//         };
//         actionMessage = 'activated';
//         break;
        
//       case 'deactivate':
//         updateData = { 
//           ...updateData,
//           isActive: false,
//           ...body 
//         };
//         actionMessage = 'deactivated';
//         break;
        
//       case 'feature':
//         updateData = { 
//           ...updateData,
//           isFeatured: body.featured !== undefined ? body.featured : true,
//           ...body 
//         };
//         actionMessage = 'feature updated';
//         break;
        
//       default:
//         // General update - remove sensitive fields
//         const { _id, createdAt, ...updateFields } = body;
//         updateData = { ...updateData, ...updateFields };
//         actionMessage = 'updated';
//     }
    
//     const professional = await Bookingmng.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).lean();
    
//     if (!professional) {
//       return NextResponse.json(
//         { success: false, error: 'Professional not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({
//       success: true,
//       data: {
//         ...professional,
//         _id: professional._id.toString(),
//         createdAt: professional.createdAt?.toISOString(),
//         updatedAt: professional.updatedAt?.toISOString()
//       },
//       message: `Professional ${actionMessage} successfully`
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error updating professional:', error);
    
//     if (error.name === 'ValidationError') {
//       return NextResponse.json(
//         { success: false, error: 'Validation failed', details: error.errors },
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to update professional',
//         message: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // DELETE Professional (soft delete)
// export async function DELETE(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     const permanent = searchParams.get('permanent') === 'true';
    
//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: 'Professional ID is required' },
//         { status: 400 }
//       );
//     }
    
//     if (permanent) {
//       // Permanent delete (use with caution)
//       const professional = await Bookingmng.findByIdAndDelete(id);
      
//       if (!professional) {
//         return NextResponse.json(
//           { success: false, error: 'Professional not found' },
//           { status: 404 }
//         );
//       }
      
//       return NextResponse.json({
//         success: true,
//         message: 'Professional permanently deleted',
//         data: { id: id.toString() }
//       }, { status: 200 });
      
//     } else {
//       // Soft delete - mark as inactive
//       const professional = await Bookingmng.findByIdAndUpdate(
//         id,
//         { 
//           isActive: false,
//           verificationStatus: 'suspended',
//           updatedAt: new Date()
//         },
//         { new: true }
//       );
      
//       if (!professional) {
//         return NextResponse.json(
//           { success: false, error: 'Professional not found' },
//           { status: 404 }
//         );
//       }
      
//       return NextResponse.json({
//         success: true,
//         message: 'Professional deactivated successfully',
//         data: { id: id.toString() }
//       }, { status: 200 });
//     }
    
//   } catch (error) {
//     console.error('Error deleting professional:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to delete professional',
//         message: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET Single Professional by ID
// export async function PUT(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: 'Professional ID is required' },
//         { status: 400 }
//       );
//     }
    
//     const professional = await Bookingmng.findById(id).lean();
    
//     if (!professional) {
//       return NextResponse.json(
//         { success: false, error: 'Professional not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({
//       success: true,
//       data: {
//         ...professional,
//         _id: professional._id.toString(),
//         createdAt: professional.createdAt?.toISOString(),
//         updatedAt: professional.updatedAt?.toISOString()
//       }
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching professional:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to fetch professional',
//         message: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // OPTIONS request for CORS
// export async function OPTIONS() {
//   return NextResponse.json({}, { 
//     status: 200,
//     headers: {
//       'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization'
//     }
//   });
// }




// above code is without saas












// app/api/bookingService/bookingmng/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Bookingmng from '@/models/Bookingmng';
import mongoose from 'mongoose';

// ===== CONFIGURATION =====
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// ===== HELPER FUNCTIONS =====
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && 
         /^[0-9a-fA-F]{24}$/.test(id);
};

// ===== GET ALL Professionals with filters =====
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const type = searchParams.get('type') || 'all';
    const verification = searchParams.get('verification') || 'all';
    const whatsappBusinessId = searchParams.get('whatsappBusinessId'); // For WhatsApp bot lookup
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Start with company filter - REQUIRED for SaaS
    let query = { companyId };
    
    // Handle soft delete filter
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    
    // ===== WHATSAPP BOT LOOKUP =====
    if (whatsappBusinessId) {
      console.log('🔍 WhatsApp Bot looking for business with number:', whatsappBusinessId);
      
      // Clean the WhatsApp number (remove @lid, @c.us, etc and get digits)
      const cleanNumber = whatsappBusinessId.split('@')[0].replace(/\D/g, '');
      
      // Search by whatsappBusinessId field within this company
      query = {
        companyId, // Keep company filter
        $or: [
          { whatsappBusinessId: whatsappBusinessId },
          { whatsappBusinessId: cleanNumber },
          { whatsappBusinessId: { $regex: cleanNumber } },
          { phone: cleanNumber }
        ],
        isActive: true,
        deletedAt: null
      };
      
      console.log('🔎 Search query:', JSON.stringify(query, null, 2));
      
      // Find the business (should be one)
      const business = await Bookingmng.findOne(query).lean();
      
      if (!business) {
        console.log('❌ No business found with WhatsApp number:', whatsappBusinessId);
        return NextResponse.json({
          success: true,
          data: [],
          message: 'No business found with this WhatsApp number'
        });
      }
      
      console.log('✅ Business found:', business.businessName);
      
      return NextResponse.json({
        success: true,
        data: [business],
        pagination: {
          page: 1,
          limit: 1,
          total: 1,
          pages: 1
        }
      });
    }
    
    // ===== ADMIN PANEL FILTERS =====
    // Regular search filter (for admin panel)
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
    
    // Get total count for pagination
    const total = await Bookingmng.countDocuments(query);
    
    // Get professionals
    const professionals = await Bookingmng.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
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
      { 
        success: false, 
        error: 'Failed to fetch professionals',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// ===== CREATE New Professional =====
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const companyId = body.companyId; // REQUIRED for SaaS
    
    // Validate companyId
    if (!companyId || !isValidObjectId(companyId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid companyId is required' 
        },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.businessName || !body.category || !body.email || !body.phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['businessName', 'category', 'email', 'phone', 'companyId']
        },
        { status: 400 }
      );
    }

    // Check if professional already exists in this company
    const existingProfessional = await Bookingmng.findOne({ 
      companyId,
      email: body.email 
    });
    
    if (existingProfessional) {
      return NextResponse.json(
        { success: false, error: 'Professional with this email already exists in this company' },
        { status: 409 }
      );
    }
    
    // Check phone uniqueness within company
    const existingPhone = await Bookingmng.findOne({ 
      companyId,
      phone: body.phone 
    });
    
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'Professional with this phone already exists in this company' },
        { status: 409 }
      );
    }
    
    // Set default working hours if not provided
    if (!body.workingHours || body.workingHours.length === 0) {
      body.workingHours = [
        { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
        { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
        { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
        { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
        { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
        { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] },
        { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }
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
    
    // Create professional with company context
    const professional = new Bookingmng({
      companyId, // REQUIRED for SaaS
      createdBy: body.createdBy || body.userId, // Audit field
      
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
      completedBookings: 0
    });
    
    await professional.save();
    
    return NextResponse.json({
      success: true,
      data: professional,
      message: 'Professional created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating professional:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `${field} already exists in this company` },
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

// ===== UPDATE Professional =====
export async function PUT(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
    
    if (!id || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Professional ID and companyId are required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(id) || !isValidObjectId(companyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Check if professional exists and belongs to this company
    const existing = await Bookingmng.findOne({ _id: id, companyId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Professional not found in this company' },
        { status: 404 }
      );
    }
    
    // Remove fields that shouldn't be updated directly
    delete body._id;
    delete body.companyId;
    delete body.createdBy;
    delete body.createdAt;
    
    // Add audit field
    body.updatedBy = body.updatedBy || body.userId;
    
    const professional = await Bookingmng.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).lean();
    
    return NextResponse.json({
      success: true,
      data: professional,
      message: 'Professional updated successfully'
    });
    
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

// ===== UPDATE Professional Status (PATCH) =====
export async function PATCH(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
    const action = searchParams.get('action');
    
    if (!id || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Professional ID and companyId are required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(id) || !isValidObjectId(companyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Check if professional exists and belongs to this company
    const existing = await Bookingmng.findOne({ _id: id, companyId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Professional not found in this company' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    let updateData = { 
      updatedAt: new Date(),
      updatedBy: body.updatedBy || body.userId 
    };
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
        const { _id, companyId: _, createdBy, createdAt, ...updateFields } = body;
        updateData = { ...updateData, ...updateFields };
        actionMessage = 'updated';
    }
    
    const professional = await Bookingmng.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();
    
    return NextResponse.json({
      success: true,
      data: professional,
      message: `Professional ${actionMessage} successfully`
    });
    
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

// ===== DELETE Professional (soft delete) =====
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
    const userId = searchParams.get('userId'); // For audit
    const permanent = searchParams.get('permanent') === 'true';
    
    if (!id || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Professional ID and companyId are required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(id) || !isValidObjectId(companyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Check if professional exists and belongs to this company
    const existing = await Bookingmng.findOne({ _id: id, companyId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Professional not found in this company' },
        { status: 404 }
      );
    }
    
    if (permanent) {
      // Permanent delete (use with caution)
      await Bookingmng.findByIdAndDelete(id);
      
      return NextResponse.json({
        success: true,
        message: 'Professional permanently deleted'
      });
      
    } else {
      // Soft delete
      await Bookingmng.findByIdAndUpdate(
        id,
        { 
          deletedAt: new Date(),
          updatedBy: userId,
          isActive: false,
          verificationStatus: 'suspended'
        }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Professional deactivated successfully'
      });
    }
    
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

// ===== OPTIONS request for CORS =====
export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 200,
    headers: {
      'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID'
    }
  });
}