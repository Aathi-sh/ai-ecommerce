import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Booking from '@/models/Bookings';
import User from '@/models/user';
import Bookingmng from '@/models/Bookingmng';
import Service from '@/models/Service';

// GET ALL Bookings with filters
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const paymentStatus = searchParams.get('paymentStatus') || 'all';
    const professionalId = searchParams.get('professionalId') || '';
    const clientId = searchParams.get('clientId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Search filter (by booking number or service name)
    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    
    // Professional filter
    if (professionalId) {
      query.professionalId = professionalId;
    }
    
    // Client filter
    if (clientId) {
      query.clientId = clientId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) {
        query.scheduledDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.scheduledDate.$lte = new Date(endDate);
      }
    }
    
    // Get total count
    const total = await Booking.countDocuments(query);
    
    // Get bookings with populated data
    const bookings = await Booking.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('clientId', 'name email phone avatar')
      .populate('professionalId', 'businessName email phone category')
      .populate('serviceId', 'name category duration basePrice')
      .lean();
    
    // Format the response data
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      clientId: booking.clientId ? {
        ...booking.clientId,
        _id: booking.clientId._id.toString()
      } : null,
      professionalId: booking.professionalId ? {
        ...booking.professionalId,
        _id: booking.professionalId._id.toString()
      } : null,
      serviceId: booking.serviceId ? {
        ...booking.serviceId,
        _id: booking.serviceId._id.toString()
      } : null,
      bookedAt: booking.bookedAt?.toISOString(),
      scheduledDate: booking.scheduledDate?.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString(),
      cancelledAt: booking.cancelledAt?.toISOString(),
      completedAt: booking.completedAt?.toISOString(),
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bookings',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// CREATE New Booking
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.clientId || !body.professionalId || !body.serviceId || !body.scheduledDate || !body.startTime || !body.endTime || !body.totalAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['clientId', 'professionalId', 'serviceId', 'scheduledDate', 'startTime', 'endTime', 'totalAmount']
        },
        { status: 400 }
      );
    }
    
    // Check if client exists
    const clientExists = await User.findById(body.clientId);
    if (!clientExists) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Check if professional exists
    const professionalExists = await Bookingmng.findById(body.professionalId);
    if (!professionalExists) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }
    
    // Check if service exists
    const serviceExists = await Service.findById(body.serviceId);
    if (!serviceExists) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Check for duplicate booking at same time
    const existingBooking = await Booking.findOne({
      professionalId: body.professionalId,
      scheduledDate: body.scheduledDate,
      startTime: body.startTime,
      status: { $nin: ['cancelled', 'completed'] }
    });
    
    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Professional already has a booking at this time' },
        { status: 409 }
      );
    }
    
    // Create booking
    const booking = new Booking({
      ...body,
      bookedAt: new Date(),
      paymentStatus: body.paymentStatus || 'pending',
      status: body.status || 'pending',
      paidAmount: body.paidAmount || 0
    });
    
    await booking.save();
    
    // Populate data for response
    await booking.populate('clientId', 'name email phone avatar');
    await booking.populate('professionalId', 'businessName email phone category');
    await booking.populate('serviceId', 'name category duration basePrice');
    
    return NextResponse.json({
      success: true,
      data: {
        ...booking.toObject(),
        _id: booking._id.toString(),
        clientId: booking.clientId ? {
          ...booking.clientId.toObject(),
          _id: booking.clientId._id.toString()
        } : null,
        professionalId: booking.professionalId ? {
          ...booking.professionalId.toObject(),
          _id: booking.professionalId._id.toString()
        } : null,
        serviceId: booking.serviceId ? {
          ...booking.serviceId.toObject(),
          _id: booking.serviceId._id.toString()
        } : null,
        bookedAt: booking.bookedAt?.toISOString(),
        scheduledDate: booking.scheduledDate?.toISOString(),
        createdAt: booking.createdAt?.toISOString(),
        updatedAt: booking.updatedAt?.toISOString()
      },
      message: 'Booking created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Booking number already exists' },
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
        error: 'Failed to create booking',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// UPDATE Booking Status
export async function PATCH(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    let updateData = { updatedAt: new Date() };
    let actionMessage = '';
    
    // Handle different actions
    switch (action) {
      case 'confirm':
        updateData = { 
          ...updateData,
          status: 'confirmed',
          confirmedAt: new Date(),
          ...body 
        };
        actionMessage = 'confirmed';
        break;
        
      case 'start':
        updateData = { 
          ...updateData,
          status: 'in_progress',
          ...body 
        };
        actionMessage = 'started';
        break;
        
      case 'complete':
        updateData = { 
          ...updateData,
          status: 'completed',
          completedAt: new Date(),
          ...body 
        };
        actionMessage = 'completed';
        break;
        
      case 'cancel':
        updateData = { 
          ...updateData,
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: body.reason || 'Cancelled by admin',
          ...body 
        };
        actionMessage = 'cancelled';
        break;
        
      case 'mark-paid':
        updateData = { 
          ...updateData,
          paymentStatus: 'paid',
          paidAmount: body.amount,
          transactionId: body.transactionId,
          ...body 
        };
        actionMessage = 'payment marked as paid';
        break;
        
      default:
        // General update
        const { _id, bookingNumber, createdAt, ...updateFields } = body;
        updateData = { ...updateData, ...updateFields };
        actionMessage = 'updated';
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('clientId', 'name email phone avatar')
    .populate('professionalId', 'businessName email phone category')
    .populate('serviceId', 'name category duration basePrice');
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...booking.toObject(),
        _id: booking._id.toString(),
        clientId: booking.clientId ? {
          ...booking.clientId.toObject(),
          _id: booking.clientId._id.toString()
        } : null,
        professionalId: booking.professionalId ? {
          ...booking.professionalId.toObject(),
          _id: booking.professionalId._id.toString()
        } : null,
        serviceId: booking.serviceId ? {
          ...booking.serviceId.toObject(),
          _id: booking.serviceId._id.toString()
        } : null,
        bookedAt: booking.bookedAt?.toISOString(),
        scheduledDate: booking.scheduledDate?.toISOString(),
        confirmedAt: booking.confirmedAt?.toISOString(),
        cancelledAt: booking.cancelledAt?.toISOString(),
        completedAt: booking.completedAt?.toISOString(),
        createdAt: booking.createdAt?.toISOString(),
        updatedAt: booking.updatedAt?.toISOString()
      },
      message: `Booking ${actionMessage} successfully`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating booking:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update booking',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE Booking
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Soft delete - mark as cancelled
    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: 'Deleted by admin',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { id: id.toString() }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete booking',
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