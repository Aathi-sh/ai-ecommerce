import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Build query for pending payments
    let query = {
      isActive: true,
      paymentStatus: { $in: ['pending', 'processing'] },
      status: { $ne: 'cancelled' }
    };

    // Filter by phone number if provided
    if (phoneNumber) {
      // Clean phone number (remove country code, etc.)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const phoneRegex = new RegExp(cleanPhone.slice(-10)); // Last 10 digits
      query.phoneNumber = { $regex: phoneRegex };
    }

    // Get pending orders with pagination
    const [pendingOrders, total] = await Promise.all([
      Order.find(query)
        .select('orderNumber phoneNumber totalPrice status paymentStatus items createdAt shippingAddress')
        .populate('items.productId', 'productName imageUrls category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log('📦 Found pending payments:', {
      total,
      page,
      limit,
      filteredBy: phoneNumber ? 'phone' : 'all'
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Pending payments retrieved successfully",
        data: pendingOrders,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext,
          hasPrev
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Get pending payments error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to retrieve pending payments",
        error: error.message 
      },
      { status: 500 }
    );
  }
}