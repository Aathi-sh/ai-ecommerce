import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    console.log('🔍 Payment rejection request:', {
      orderNumber: body.orderNumber,
      reason: body.rejectionReason
    });

    const { 
      orderNumber, 
      rejectionReason = 'Payment proof unclear or invalid' 
    } = body;

    // Validate required fields
    if (!orderNumber) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order number is required for payment rejection" 
        },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({ orderNumber, isActive: true });
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found or has been deactivated" 
        },
        { status: 404 }
      );
    }

    // Check if payment is already processed
    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { 
          success: false, 
          message: "Cannot reject payment that has already been verified" 
        },
        { status: 409 }
      );
    }

    // Update order with rejection details
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber },
      {
        status: 'pending',
        paymentStatus: 'failed',
        rejectionReason: rejectionReason,
        rejectedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('items.productId', 'productName imageUrls');

    console.log('❌ Payment rejected:', {
      orderNumber,
      reason: rejectionReason
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Payment rejected successfully",
        data: {
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          rejectionReason: updatedOrder.rejectionReason,
          rejectedAt: updatedOrder.rejectedAt,
          items: updatedOrder.items
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Payment rejection error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to reject payment",
        error: error.message 
      },
      { status: 500 }
    );
  }
}