import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';
import Professional from '@/models/Professional';

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
    const professionalId = searchParams.get('professionalId') || '';
    const status = searchParams.get('status') || 'active'; // active, inactive, all
    
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
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Professional filter
    if (professionalId) {
      query.professionalId = professionalId;
    }
    
    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    // 'all' shows both active and inactive
    
    // Get total count
    const total = await Service.countDocuments(query);
    
    // Get services with professional details
    const services = await Service.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ popularity: -1, createdAt: -1 })
      .populate('professionalId', 'businessName category phone email')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CREATE New Service
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if professional exists
    const professional = await Professional.findById(body.professionalId);
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }
    
    // Set default values
    const serviceData = {
      ...body,
      isActive: true,
      totalBookings: 0,
      popularity: 0,
      tags: body.tags || [],
      clientRequirements: body.clientRequirements || [],
      professionalProvides: body.professionalProvides || [],
      variations: body.variations || [],
      addons: body.addons || [],
      images: body.images || [],
      currency: body.currency || 'USD'
    };
    
    // Create service
    const service = new Service(serviceData);
    await service.save();
    
    // Add service to professional's services array
    await Professional.findByIdAndUpdate(
      body.professionalId,
      { $push: { services: service._id } }
    );
    
    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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
    const action = searchParams.get('action'); // 'activate', 'deactivate', 'feature', 'update'
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    let updateData = {};
    
    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        break;
        
      case 'deactivate':
        updateData = { isActive: false };
        break;
        
      case 'feature':
        updateData = { featured: body.featured || true };
        break;
        
      default:
        // General update
        updateData = body;
    }
    
    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('professionalId', 'businessName category phone email');
    
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: service,
      message: action ? `Service ${action}d successfully` : 'Service updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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
    
    // Get service first to know the professional
    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Remove service from professional's services array
    await Professional.findByIdAndUpdate(
      service.professionalId,
      { $pull: { services: service._id } }
    );
    
    // Delete the service
    await Service.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}