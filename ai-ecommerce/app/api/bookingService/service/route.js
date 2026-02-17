import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Service from '@/models/Service';

// GET ALL Services with filters
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || 'all';
    
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all' && category !== '') {
      query.category = category;
    }
    
    // Type filter
    if (type && type !== 'all' && type !== '') {
      query.type = type;
    }
    
    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }
    
    // Get total count
    const total = await Service.countDocuments(query);
    
    // Get services
    const services = await Service.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    
    // Format the response data
    const formattedServices = services.map(service => ({
      ...service,
      _id: service._id.toString(),
      createdAt: service.createdAt?.toISOString(),
      updatedAt: service.updatedAt?.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedServices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch services',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// CREATE New Service
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.category || !body.basePrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['name', 'category', 'basePrice']
        },
        { status: 400 }
      );
    }
    
    // Set default values matching your Service model
    const serviceData = {
      name: body.name,
      description: body.description || '',
      category: body.category,
      type: body.type || 'physical',
      subcategory: body.subcategory || '',
      basePrice: body.basePrice,
      currency: body.currency || 'INR',
      duration: body.duration || 60,
      isActive: body.isActive !== undefined ? body.isActive : true,
      
      // Optional fields
      variations: body.variations || [],
      addons: body.addons || [],
      bufferTime: body.bufferTime || 0,
      advanceBooking: body.advanceBooking || 30,
      
      // Arrays
      images: body.images || [],
      tags: body.tags || [],
      clientRequirements: body.clientRequirements || [],
      professionalProvides: body.professionalProvides || [],
      
      // Restrictions
      minAge: body.minAge || null,
      maxAge: body.maxAge || null,
      genderPreference: body.genderPreference || 'any',
      
      // Stats (always start at 0)
      totalBookings: 0,
      popularity: 0
    };
    
    // Create service
    const service = new Service(serviceData);
    await service.save();
    
    return NextResponse.json({
      success: true,
      data: {
        ...service.toObject(),
        _id: service._id.toString(),
        createdAt: service.createdAt?.toISOString(),
        updatedAt: service.updatedAt?.toISOString()
      },
      message: 'Service created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating service:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Service with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create service',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// UPDATE Service
export async function PATCH(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    let updateData = {};
    
    // Handle different actions
    if (action === 'activate') {
      updateData = { isActive: true };
    } else if (action === 'deactivate') {
      updateData = { isActive: false };
    } else {
      // General update - remove fields that shouldn't be updated directly
      const { _id, totalBookings, popularity, createdAt, updatedAt, ...updateFields } = body;
      updateData = updateFields;
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...service.toObject(),
        _id: service._id.toString(),
        createdAt: service.createdAt?.toISOString(),
        updatedAt: service.updatedAt?.toISOString()
      },
      message: action 
        ? `Service ${action}d successfully` 
        : 'Service updated successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating service:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update service',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE Service
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the service
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
      data: { id: id.toString() }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete service',
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
      'Allow': 'GET, POST, PATCH, DELETE, OPTIONS'
    }
  });
}