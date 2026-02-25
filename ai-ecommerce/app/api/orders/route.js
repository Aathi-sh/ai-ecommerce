import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";

// ✅ Helper function to format order response
const formatOrderResponse = (order) => {
  if (!order) return null;
  
  const orderObj = order.toObject ? order.toObject() : order;
  
  // Add computed fields safely
  return {
    ...orderObj,
    balanceAmount: (orderObj.totalPrice || 0) - (orderObj.paidAmount || 0),
    paymentProgress: orderObj.totalPrice > 0 
      ? Math.round(((orderObj.paidAmount || 0) / orderObj.totalPrice) * 100) 
      : 0,
    items: (orderObj.items || []).map(item => ({
      ...item,
      totalWithGst: (item.totalAmount || 0) + (item.gstAmount || 0),
      savings: (item.quantity || 0) * ((item.mrp || 0) - (item.price || 0))
    }))
  };
};

// ✅ GET - Retrieve orders with comprehensive filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");
    const invoiceNumber = searchParams.get("invoice");
    const customerPhone = searchParams.get("phone");
    const customerName = searchParams.get("name");
    const customerEmail = searchParams.get("email");
    const search = searchParams.get("search"); // New search parameter
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 100);
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // ✅ Get single order by various identifiers
    if (id || orderNumber || invoiceNumber) {
      let query = {};
      
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Invalid order ID format",
              error: "ID must be a 24-character hexadecimal string"
            },
            { status: 400 }
          );
        }
        query._id = id;
      } else if (orderNumber) {
        query.orderNumber = orderNumber;
      } else if (invoiceNumber) {
        query.invoiceNumber = invoiceNumber;
      }

      const order = await Order.findOne(query)
        .populate({
          path: "items.productId",
          model: Product,
          select: "productName sku hsnCode imageUrls category brand mrp"
        })
        .lean();

      if (!order) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Order not found",
            error: `No order found with provided identifier`
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Order fetched successfully", 
          data: formatOrderResponse(order)
        },
        { status: 200 }
      );
    }

    // ✅ Build comprehensive query
    let query = { isActive: true };

    // Handle search parameter (searches across multiple fields)
    if (search) {
      const cleanSearch = search.replace(/\D/g, '');
      if (cleanSearch.length >= 10) {
        // If it looks like a phone number, search phone fields
        query.$or = [
          { phoneNumber: { $regex: cleanSearch, $options: 'i' } },
          { secondaryPhoneNumber: { $regex: cleanSearch, $options: 'i' } },
          { whatsappNumber: { $regex: cleanSearch, $options: 'i' } }
        ];
      } else {
        // Otherwise search by name/email/order number
        query.$or = [
          { customerName: { $regex: search, $options: 'i' } },
          { customerEmail: { $regex: search, $options: 'i' } },
          { orderNumber: { $regex: search, $options: 'i' } }
        ];
      }
    }

    // Customer filters (for backward compatibility)
    if (customerPhone && !search) {
      const cleanPhone = customerPhone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        query.$or = [
          { phoneNumber: { $regex: cleanPhone, $options: 'i' } },
          { secondaryPhoneNumber: { $regex: cleanPhone, $options: 'i' } },
          { whatsappNumber: { $regex: cleanPhone, $options: 'i' } }
        ];
      }
    }

    if (customerName && !search) {
      const nameQuery = { customerName: { $regex: customerName.trim(), $options: 'i' } };
      if (query.$or) {
        query.$or.push(nameQuery);
      } else {
        query.customerName = { $regex: customerName.trim(), $options: 'i' };
      }
    }

    if (customerEmail && !search) {
      const emailQuery = { customerEmail: { $regex: customerEmail.trim(), $options: 'i' } };
      if (query.$or) {
        query.$or.push(emailQuery);
      } else {
        query.customerEmail = { $regex: customerEmail.trim(), $options: 'i' };
      }
    }

    // Status filters
    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.totalPrice = {};
      if (minAmount) query.totalPrice.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalPrice.$lte = parseFloat(maxAmount);
    }

    // Build sort options
    let sortOptions = {};
    const validSortFields = ['createdAt', 'totalPrice', 'orderNumber', 'customerName', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // ✅ Execute query with aggregations
    const [orders, total, aggregations] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.productId",
          model: Product,
          select: "productName sku hsnCode imageUrls category brand"
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
      Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            totalPaid: { $sum: "$paidAmount" },
            totalPending: { $sum: { $subtract: ["$totalPrice", "$paidAmount"] } },
            avgOrderValue: { $avg: "$totalPrice" },
            minOrderValue: { $min: "$totalPrice" },
            maxOrderValue: { $max: "$totalPrice" },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format orders with computed fields
    const formattedOrders = orders.map(formatOrderResponse);

    const totalPages = Math.ceil(total / limit);
    const aggregation = aggregations[0] || {};

    // ✅ Get status counts for dashboard
    const statusCounts = await Order.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
          paidAmount: { $sum: "$paidAmount" }
        }
      }
    ]);

    const paymentStatusCounts = await Order.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" }
        }
      }
    ]);

    return NextResponse.json(
      {
        success: true,
        message: formattedOrders.length ? "Orders fetched successfully" : "No orders found",
        data: formattedOrders,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary: {
          revenue: {
            total: aggregation.totalRevenue || 0,
            paid: aggregation.totalPaid || 0,
            pending: aggregation.totalPending || 0,
            average: aggregation.avgOrderValue || 0,
            min: aggregation.minOrderValue || 0,
            max: aggregation.maxOrderValue || 0
          },
          counts: {
            total: aggregation.totalOrders || 0
          }
        },
        filters: {
          applied: {
            customerPhone: customerPhone || null,
            customerName: customerName || null,
            customerEmail: customerEmail || null,
            status: status || null,
            paymentStatus: paymentStatus || null,
            fromDate: fromDate || null,
            toDate: toDate || null,
            minAmount: minAmount || null,
            maxAmount: maxAmount || null,
            search: search || null
          }
        },
        analytics: {
          byStatus: statusCounts,
          byPaymentStatus: paymentStatusCounts
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
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// ✅ POST - Create new order
// ✅ POST - Create new order (FIXED VERSION)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // ✅ Validate required fields
    const requiredFields = [
      'customerName',
      'customerEmail',
      'phoneNumber',
      'items',
      'shippingAddress',
      'paymentMethod',
      'gstType'
    ];
    
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

    // ✅ Validate customer name
    if (!body.customerName?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid customer name",
          error: "Customer name cannot be empty" 
        },
        { status: 400 }
      );
    }

    // ✅ Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid email format",
          error: "Please provide a valid email address" 
        },
        { status: 400 }
      );
    }

    // ✅ Validate phone numbers
    const cleanPhone = body.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid phone number",
          error: "Phone number must be exactly 10 digits" 
        },
        { status: 400 }
      );
    }
    body.phoneNumber = cleanPhone;

    if (body.secondaryPhoneNumber) {
      const cleanSecondary = body.secondaryPhoneNumber.replace(/\D/g, '');
      if (cleanSecondary.length > 0 && cleanSecondary.length !== 10) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid secondary phone number",
            error: "Secondary phone number must be exactly 10 digits if provided" 
          },
          { status: 400 }
        );
      }
      body.secondaryPhoneNumber = cleanSecondary || null;
    }

    // ✅ Validate address
    if (!body.shippingAddress?.street || !body.shippingAddress?.city || 
        !body.shippingAddress?.state || !body.shippingAddress?.pincode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid shipping address",
          error: "Street, city, state, and pincode are required" 
        },
        { status: 400 }
      );
    }

    // ✅ Validate pincode
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(body.shippingAddress.pincode)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid pincode",
          error: "Pincode must be exactly 6 digits" 
        },
        { status: 400 }
      );
    }

    // ✅ Validate items array
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

    // ✅ Validate payment method
    const validPaymentMethods = ['cash', 'card', 'upi', 'bank_transfer', 'wallet', 'cod'];
    if (!validPaymentMethods.includes(body.paymentMethod)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid payment method",
          error: `Valid methods: ${validPaymentMethods.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // ✅ Validate GST type
    const validGstTypes = ['intra-state', 'inter-state'];
    if (!validGstTypes.includes(body.gstType)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid GST type",
          error: `Valid types: ${validGstTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // ✅ Comprehensive stock validation
    console.log("🔍 Checking stock availability for order items...");
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;
    
    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product not found",
            error: `Product with ID ${item.productId} does not exist`
          },
          { status: 404 }
        );
      }

      // Check if product is active
      if (!product.isActive) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product not available",
            error: `${product.productName} is currently not available` 
          },
          { status: 400 }
        );
      }

      // Check stock
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Insufficient stock",
            error: `${product.productName} has only ${product.stock} units available. You requested ${item.quantity} units.`
          },
          { status: 400 }
        );
      }

      // Validate max order quantity
      if (item.quantity > (product.maxOrderQuantity || 10)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Maximum order quantity exceeded",
            error: `${product.productName} can only be ordered in quantities up to ${product.maxOrderQuantity || 10}` 
          },
          { status: 400 }
        );
      }

      // Validate pricing
      if (item.price > item.mrp) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid pricing",
            error: `Price cannot be greater than MRP for ${product.productName}` 
          },
          { status: 400 }
        );
      }

      // Calculate item totals
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;
      totalDiscount += item.quantity * (item.mrp - item.price);
      
      // Calculate GST
      let gstAmount = 0;
      if (item.gstIncluded) {
        const basePrice = itemTotal * 100 / (100 + item.gstRate);
        gstAmount = itemTotal - basePrice;
      } else {
        gstAmount = (itemTotal * item.gstRate) / 100;
      }
      totalGst += gstAmount;

      // Enrich item with product data
      item.productName = product.productName;
      item.sku = product.sku;
      item.hsnCode = product.hsnCode;
      item.gstAmount = gstAmount;
      item.totalAmount = itemTotal;
      
      console.log(`✅ Stock available: ${product.productName} - ${product.stock} units (Requested: ${item.quantity})`);
    }

    // ✅ Auto-generate order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    body.orderNumber = `ORD-${year}${month}${day}-${random}`;

    // ✅ Set calculated values
    body.subtotal = subtotal;
    body.totalDiscount = totalDiscount;
    body.totalGst = totalGst;
    body.totalPrice = subtotal + totalGst + (body.shippingCharge || 0);
    body.paidAmount = body.paidAmount || 0;
    body.balanceAmount = body.totalPrice - (body.paidAmount || 0);
    
    // ✅ FIXED: Set payment status - PRESERVE provided status if it exists
    // Only calculate if paymentStatus is NOT provided
    if (!body.paymentStatus) {
      if (body.paidAmount >= body.totalPrice) {
        body.paymentStatus = "paid";
      } else if (body.paidAmount > 0 && body.paidAmount < body.totalPrice) {
        body.paymentStatus = "partial";
      } else {
        body.paymentStatus = "pending";
      }
    }
    // If paymentStatus was provided (like from orderHandler), it will be preserved

    // ✅ Initialize status history
    body.statusHistory = [{
      status: body.status || 'pending',
      timestamp: new Date(),
      comment: 'Order created',
      updatedBy: body.createdBy
    }];

    // ✅ Set billing address if same as shipping
    if (body.sameAsShipping && !body.billingAddress) {
      body.billingAddress = body.shippingAddress;
    }

    // ✅ Create the order
    const order = await Order.create(body);

    // ✅ Update product stock atomically
    console.log("📦 Updating product stock after order creation...");
    
    for (const item of body.items) {
      try {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.productId,
          { 
            $inc: { stock: -item.quantity },
            $set: { updatedAt: new Date() }
          },
          { new: true }
        );

        if (updatedProduct) {
          console.log(`✅ Stock updated: ${updatedProduct.productName} - New stock: ${updatedProduct.stock}`);
          
          // Check for low stock alert
          if (updatedProduct.stock <= (updatedProduct.lowStockThreshold || 5)) {
            console.warn(`⚠️ LOW STOCK ALERT: ${updatedProduct.productName} has only ${updatedProduct.stock} units left!`);
          }
        }
      } catch (stockError) {
        console.error(`❌ Error updating stock for product ${item.productId}:`, stockError);
      }
    }

    // ✅ Populate the created order
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.productId",
        model: Product,
        select: "productName sku hsnCode imageUrls category brand mrp"
      })
      .lean();

    // ✅ Generate invoice number
    populatedOrder.invoiceNumber = `INV-${populatedOrder.orderNumber}-${Date.now().toString().slice(-4)}`;

    return NextResponse.json(
      { 
        success: true, 
        message: "Order created successfully", 
        data: formatOrderResponse(populatedOrder)
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
          message: "Duplicate order",
          error: "An order with this number already exists. Please try again." 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create order",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// ✅ PUT - Update order with comprehensive logic
export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid order ID format" 
        },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get current order
    const currentOrder = await Order.findById(id);
    
    if (!currentOrder) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found" 
        },
        { status: 404 }
      );
    }

    // ✅ Handle specific actions
    if (action === 'process-payment') {
      const { amount, transactionId } = updateData;
      
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid payment amount" 
          },
          { status: 400 }
        );
      }

      const newPaidAmount = (currentOrder.paidAmount || 0) + amount;
      const totalPrice = currentOrder.totalPrice || 0;

      updateData.paidAmount = newPaidAmount;
      updateData.balanceAmount = totalPrice - newPaidAmount;
      
      if (newPaidAmount >= totalPrice) {
        updateData.paymentStatus = "paid";
      } else if (newPaidAmount > 0) {
        updateData.paymentStatus = "partial";
      }

      if (transactionId) {
        updateData.transactionId = transactionId;
      }
    }

    // ✅ Handle payment verification from OCR
    if (action === 'payment-verified') {
      const { transactionId, verifiedBy } = updateData;
      
      updateData.paidAmount = currentOrder.totalPrice;
      updateData.balanceAmount = 0;
      updateData.paymentStatus = "paid";
      updateData.transactionId = transactionId || updateData.transactionId;
      
      // Add to status history
      if (!updateData.statusHistory) {
        updateData.statusHistory = [];
      }
      updateData.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        comment: `Payment verified automatically. Transaction: ${transactionId || 'N/A'}`,
        updatedBy: verifiedBy || 'auto_ocr'
      });
    }

    // ✅ Validate status if provided
    if (updateData.status) {
      const validStatuses = [
        'pending', 'confirmed', 'processing', 'packed', 
        'shipped', 'out_for_delivery', 'delivered', 
        'cancelled', 'returned', 'refunded'
      ];
      
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

      // ✅ Handle stock restoration for cancellations
      if (updateData.status === 'cancelled' && currentOrder.status !== 'cancelled') {
        console.log("🔄 Order cancelled - Restoring stock...");
        
        for (const item of currentOrder.items || []) {
          try {
            await Product.findByIdAndUpdate(
              item.productId,
              { 
                $inc: { stock: item.quantity },
                $set: { updatedAt: new Date() }
              }
            );
            console.log(`↩️ Stock restored for item ${item.productName}`);
          } catch (stockError) {
            console.error(`❌ Error restoring stock:`, stockError);
          }
        }
      }

      // ✅ Handle stock deduction for order reactivation
      if (currentOrder.status === 'cancelled' && 
          updateData.status !== 'cancelled' && 
          updateData.status !== 'pending') {
        console.log("🔄 Order reactivated - Checking stock...");
        
        for (const item of currentOrder.items || []) {
          const product = await Product.findById(item.productId);
          
          if (!product || (product.stock || 0) < item.quantity) {
            return NextResponse.json(
              { 
                success: false, 
                message: "Cannot reactivate order",
                error: `Insufficient stock for ${item.productName}` 
              },
              { status: 400 }
            );
          }

          await Product.findByIdAndUpdate(
            item.productId,
            { 
              $inc: { stock: -item.quantity },
              $set: { updatedAt: new Date() }
            }
          );
        }
      }

      // ✅ Add to status history
      if (!updateData.statusHistory) {
        updateData.statusHistory = [];
      }
      updateData.statusHistory.push({
        status: updateData.status,
        timestamp: new Date(),
        comment: updateData.statusComment || `Status changed to ${updateData.status}`,
        updatedBy: updateData.updatedBy
      });
    }

    // ✅ Validate payment status if provided
    if (updateData.paymentStatus) {
      const validPaymentStatuses = ['pending', 'partial', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(updateData.paymentStatus)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid payment status" 
          },
          { status: 400 }
        );
      }
    }

    // ✅ Recalculate totals if items changed
    if (updateData.items) {
      let subtotal = 0;
      let totalDiscount = 0;
      let totalGst = 0;

      for (const item of updateData.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const itemTotal = (item.quantity || 0) * (item.price || 0);
        subtotal += itemTotal;
        totalDiscount += (item.quantity || 0) * ((item.mrp || 0) - (item.price || 0));

        let gstAmount = 0;
        if (item.gstIncluded) {
          const basePrice = itemTotal * 100 / (100 + (item.gstRate || 18));
          gstAmount = itemTotal - basePrice;
        } else {
          gstAmount = (itemTotal * (item.gstRate || 18)) / 100;
        }
        totalGst += gstAmount;

        item.gstAmount = gstAmount;
        item.totalAmount = itemTotal;
      }

      updateData.subtotal = subtotal;
      updateData.totalDiscount = totalDiscount;
      updateData.totalGst = totalGst;
      updateData.totalPrice = subtotal + totalGst + (updateData.shippingCharge || currentOrder.shippingCharge || 0);
      updateData.balanceAmount = (updateData.totalPrice || 0) - (updateData.paidAmount || currentOrder.paidAmount || 0);
    }

    // ✅ Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "items.productId",
      model: Product,
      select: "productName sku hsnCode imageUrls category brand mrp"
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Order updated successfully", 
        data: formatOrderResponse(updatedOrder)
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT /api/orders Error:", error);
    
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
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// ✅ PATCH - Partial updates
export async function PATCH(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order ID is required" 
        },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Only allow specific fields for PATCH
    const allowedFields = ['status', 'paymentStatus', 'trackingNumber', 'deliveryNotes', 'orderNotes'];
    const filteredUpdate = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    if (Object.keys(filteredUpdate).length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "No valid fields to update" 
        },
        { status: 400 }
      );
    }

    // Add to status history if status is being updated
    if (filteredUpdate.status) {
      if (!filteredUpdate.statusHistory) {
        filteredUpdate.statusHistory = [];
      }
      filteredUpdate.statusHistory.push({
        status: filteredUpdate.status,
        timestamp: new Date(),
        comment: updateData.statusComment || `Status updated to ${filteredUpdate.status}`,
        updatedBy: updateData.updatedBy
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: filteredUpdate },
      { new: true }
    ).populate({
      path: "items.productId",
      model: Product,
      select: "productName sku imageUrls"
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Order updated successfully", 
        data: formatOrderResponse(updatedOrder)
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PATCH /api/orders Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update order",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Soft delete with stock restoration
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === 'true';

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order ID is required" 
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid order ID format" 
        },
        { status: 400 }
      );
    }

    // Get order details before deletion
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found" 
        },
        { status: 404 }
      );
    }

    // Restore stock if order wasn't cancelled
    if (order.status !== 'cancelled') {
      console.log("🗑️ Deleting order - Restoring stock...");
      
      for (const item of order.items || []) {
        try {
          await Product.findByIdAndUpdate(
            item.productId,
            { 
              $inc: { stock: item.quantity },
              $set: { updatedAt: new Date() }
            }
          );
          console.log(`↩️ Stock restored for item ${item.productName}`);
        } catch (stockError) {
          console.error(`❌ Error restoring stock:`, stockError);
        }
      }
    }

    if (permanent) {
      // Permanent delete
      await Order.findByIdAndDelete(id);
      
      return NextResponse.json(
        { 
          success: true, 
          message: "Order permanently deleted",
          data: { _id: id }
        },
        { status: 200 }
      );
    } else {
      // Soft delete
      await Order.findByIdAndUpdate(
        id,
        { 
          isActive: false,
          status: 'cancelled',
          cancellationReason: 'Order deleted by user',
          updatedAt: new Date()
        }
      );

      return NextResponse.json(
        { 
          success: true, 
          message: "Order deactivated successfully",
          data: { _id: id }
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("DELETE /api/orders Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete order",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// ✅ OPTIONS - API discovery
export async function OPTIONS(request) {
  return NextResponse.json({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    description: 'Order management API with comprehensive features',
    features: [
      'Advanced filtering and search',
      'Payment processing with partial payments',
      'Stock management integration',
      'Status history tracking',
      'GST calculations',
      'Invoice generation',
      'Analytics and summaries'
    ]
  });
}