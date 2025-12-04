import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

// ✅ COMPREHENSIVE ORDERS API HANDLER
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const customerPhone = searchParams.get("customer");
    const customerName = searchParams.get("name");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const skip = (page - 1) * limit;

    // ✅ Get single order by ID
    if (id) {
      const order = await Order.findById(id).populate({
        path: "items.productId",
        model: Product,
        select: "productName price imageUrls category"
      });

      if (!order) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Order not found",
            error: `No order found with ID: ${id}`
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Order fetched successfully", 
          data: order 
        },
        { status: 200 }
      );
    }

    // ✅ Get orders by customer phone number OR name
    if (customerPhone || customerName) {
      let customerQuery = {};
      
      // If searching by phone number
      if (customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '');
        
        if (cleanPhone.length < 10 && cleanPhone.length > 0) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Invalid phone number format",
              error: "Phone number must contain at least 10 digits"
            },
            { status: 400 }
          );
        }

        if (cleanPhone.length >= 10) {
          customerQuery.$or = [
            { phoneNumber: cleanPhone },
            { phoneNumber: { $regex: cleanPhone, $options: 'i' } },
            { secondaryPhoneNumber: cleanPhone },
            { secondaryPhoneNumber: { $regex: cleanPhone, $options: 'i' } }
          ];
        }
      }
      
      // If searching by customer name
      if (customerName) {
        const cleanName = customerName.trim();
        if (cleanName.length > 0) {
          if (customerQuery.$or) {
            // Add name search to existing $or query
            customerQuery.$or.push(
              { customerName: { $regex: cleanName, $options: 'i' } }
            );
          } else {
            // Create new $or query for name
            customerQuery.$or = [
              { customerName: { $regex: cleanName, $options: 'i' } }
            ];
          }
        }
      }

      // Add status filter if provided
      if (status && status !== 'all') {
        customerQuery.status = status;
      }

      const [customerOrders, total] = await Promise.all([
        Order.find(customerQuery)
          .populate({
            path: "items.productId",
            model: Product,
            select: "productName price imageUrls category"
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(customerQuery)
      ]);

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json(
        {
          success: true,
          message: customerOrders.length 
            ? "Customer orders fetched successfully" 
            : "No orders found for this customer",
          data: customerOrders,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        { status: 200 }
      );
    }

    // ✅ Get all orders with optional filters
    let query = {};
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.productId",
          model: Product,
          select: "productName price imageUrls category"
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        message: orders.length 
          ? "Orders fetched successfully" 
          : "No orders found",
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET /api/orders Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch orders",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// ✅ CREATE NEW ORDER
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields - updated to include customerName
    const requiredFields = ['customerName', 'phoneNumber', 'items', 'totalPrice'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields",
          error: `Required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate customer name
    if (body.customerName && body.customerName.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid customer name",
          error: "Customer name cannot be empty" 
        },
        { status: 400 }
      );
    }

    // Validate phone number
    if (body.phoneNumber) {
      const cleanPhone = body.phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid phone number",
            error: "Phone number must contain at least 10 digits" 
          },
          { status: 400 }
        );
      }
    }

    // Validate secondary phone number if provided
    if (body.secondaryPhoneNumber) {
      const cleanSecondaryPhone = body.secondaryPhoneNumber.replace(/\D/g, '');
      if (cleanSecondaryPhone.length > 0 && cleanSecondaryPhone.length < 10) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid secondary phone number",
            error: "Secondary phone number must contain at least 10 digits if provided" 
          },
          { status: 400 }
        );
      }
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid items data",
          error: "Items must be a non-empty array" 
        },
        { status: 400 }
      );
    }

    // Validate total price
    if (body.totalPrice <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid total price",
          error: "Total price must be greater than 0" 
        },
        { status: 400 }
      );
    }

    // Auto-generate order number if not provided
    if (!body.orderNumber) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 5).toUpperCase();
      body.orderNumber = `ORD-${timestamp}-${random}`;
    }

    // Set default values
    if (!body.status) {
      body.status = 'pending';
    }
    if (!body.paymentStatus) {
      body.paymentStatus = 'pending';
    }

    // Clean up phone numbers (remove non-digits)
    if (body.phoneNumber) {
      body.phoneNumber = body.phoneNumber.replace(/\D/g, '');
    }
    if (body.secondaryPhoneNumber) {
      body.secondaryPhoneNumber = body.secondaryPhoneNumber.replace(/\D/g, '');
      if (body.secondaryPhoneNumber === '') {
        body.secondaryPhoneNumber = null;
      }
    }

    // Trim customer name
    if (body.customerName) {
      body.customerName = body.customerName.trim();
    }

    const order = await Order.create(body);

    // Populate the created order
    const populatedOrder = await Order.findById(order._id).populate({
      path: "items.productId",
      model: Product,
      select: "productName price imageUrls category"
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Order created successfully", 
        data: populatedOrder 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/orders Error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed",
          error: errors.join(', ') 
        },
        { status: 400 }
      );
    }

    // Handle duplicate order numbers
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order number already exists",
          error: "Please try again with a different order number" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create order",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// ✅ UPDATE ORDER BY ID
export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order ID is required",
          error: "Provide order ID as query parameter: ?id=ORDER_ID" 
        },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid order status",
            error: `Valid statuses: ${validStatuses.join(', ')}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate payment status if provided
    if (updateData.paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(updateData.paymentStatus)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid payment status",
            error: `Valid payment statuses: ${validPaymentStatuses.join(', ')}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate phone numbers if provided
    if (updateData.phoneNumber) {
      const cleanPhone = updateData.phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid phone number",
            error: "Phone number must contain at least 10 digits" 
          },
          { status: 400 }
        );
      }
      updateData.phoneNumber = cleanPhone;
    }

    if (updateData.secondaryPhoneNumber) {
      const cleanSecondaryPhone = updateData.secondaryPhoneNumber.replace(/\D/g, '');
      if (cleanSecondaryPhone.length > 0 && cleanSecondaryPhone.length < 10) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid secondary phone number",
            error: "Secondary phone number must contain at least 10 digits if provided" 
          },
          { status: 400 }
        );
      }
      updateData.secondaryPhoneNumber = cleanSecondaryPhone === '' ? null : cleanSecondaryPhone;
    }

    // Trim customer name if provided
    if (updateData.customerName) {
      updateData.customerName = updateData.customerName.trim();
      if (updateData.customerName.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid customer name",
            error: "Customer name cannot be empty" 
          },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "items.productId",
      model: Product,
      select: "productName price imageUrls category"
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found",
          error: `No order found with ID: ${id}` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Order updated successfully", 
        data: updatedOrder 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT /api/orders Error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed",
          error: errors.join(', ') 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update order",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// ✅ DELETE ORDER BY ID
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order ID is required",
          error: "Provide order ID as query parameter: ?id=ORDER_ID" 
        },
        { status: 400 }
      );
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found",
          error: `No order found with ID: ${id}` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Order deleted successfully",
        data: { 
          _id: deletedOrder._id, 
          orderNumber: deletedOrder.orderNumber,
          customerName: deletedOrder.customerName,
          phoneNumber: deletedOrder.phoneNumber,
          deletedAt: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("DELETE /api/orders Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete order",
        error: error.message 
      },
      { status: 500 }
    );
  }
}