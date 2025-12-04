import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Phone number is required" 
        },
        { status: 400 }
      );
    }

    // Clean phone number for search
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneRegex = new RegExp(cleanPhone.slice(-10)); // Match last 10 digits

    // Find customer's pending orders
    const pendingOrders = await Order.find({
      phoneNumber: { $regex: phoneRegex },
      isActive: true,
      paymentStatus: { $in: ['pending', 'processing'] },
      status: { $ne: 'cancelled' }
    })
    .select('orderNumber totalPrice status paymentStatus items createdAt')
    .populate('items.productId', 'productName imageUrls price')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    console.log('👤 Customer pending payments:', {
      phone: cleanPhone,
      count: pendingOrders.length
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Customer pending payments retrieved successfully",
        data: pendingOrders
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Get customer pending payments error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to retrieve customer pending payments",
        error: error.message 
      },
      { status: 500 }
    );
  }
}