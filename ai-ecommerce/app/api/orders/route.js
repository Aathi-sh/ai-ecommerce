// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import mongoose from "mongoose";

// // ✅ Helper function to format order response
// const formatOrderResponse = (order) => {
//   if (!order) return null;
  
//   const orderObj = order.toObject ? order.toObject() : order;
  
//   // Add computed fields safely
//   return {
//     ...orderObj,
//     balanceAmount: (orderObj.totalPrice || 0) - (orderObj.paidAmount || 0),
//     paymentProgress: orderObj.totalPrice > 0 
//       ? Math.round(((orderObj.paidAmount || 0) / orderObj.totalPrice) * 100) 
//       : 0,
//     items: (orderObj.items || []).map(item => ({
//       ...item,
//       totalWithGst: (item.totalAmount || 0) + (item.gstAmount || 0),
//       savings: (item.quantity || 0) * ((item.mrp || 0) - (item.price || 0))
//     }))
//   };
// };

// // ✅ GET - Retrieve orders with comprehensive filtering
// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     const orderNumber = searchParams.get("orderNumber");
//     const invoiceNumber = searchParams.get("invoice");
//     const customerPhone = searchParams.get("phone");
//     const customerName = searchParams.get("name");
//     const customerEmail = searchParams.get("email");
//     const search = searchParams.get("search"); // New search parameter
//     const status = searchParams.get("status");
//     const paymentStatus = searchParams.get("paymentStatus");
//     const fromDate = searchParams.get("fromDate");
//     const toDate = searchParams.get("toDate");
//     const minAmount = searchParams.get("minAmount");
//     const maxAmount = searchParams.get("maxAmount");
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 100);
//     const skip = (page - 1) * limit;
//     const sortBy = searchParams.get("sortBy") || "createdAt";
//     const sortOrder = searchParams.get("sortOrder") || "desc";

//     // ✅ Get single order by various identifiers
//     if (id || orderNumber || invoiceNumber) {
//       let query = {};
      
//       if (id) {
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//           return NextResponse.json(
//             { 
//               success: false, 
//               message: "Invalid order ID format",
//               error: "ID must be a 24-character hexadecimal string"
//             },
//             { status: 400 }
//           );
//         }
//         query._id = id;
//       } else if (orderNumber) {
//         query.orderNumber = orderNumber;
//       } else if (invoiceNumber) {
//         query.invoiceNumber = invoiceNumber;
//       }

//       const order = await Order.findOne(query)
//         .populate({
//           path: "items.productId",
//           model: Product,
//           select: "productName sku hsnCode imageUrls category brand mrp"
//         })
//         .lean();

//       if (!order) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Order not found",
//             error: `No order found with provided identifier`
//           },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json(
//         { 
//           success: true, 
//           message: "Order fetched successfully", 
//           data: formatOrderResponse(order)
//         },
//         { status: 200 }
//       );
//     }

//     // ✅ Build comprehensive query
//     let query = { isActive: true };

//     // Handle search parameter (searches across multiple fields)
//     if (search) {
//       const cleanSearch = search.replace(/\D/g, '');
//       if (cleanSearch.length >= 10) {
//         // If it looks like a phone number, search phone fields
//         query.$or = [
//           { phoneNumber: { $regex: cleanSearch, $options: 'i' } },
//           { secondaryPhoneNumber: { $regex: cleanSearch, $options: 'i' } },
//           { whatsappNumber: { $regex: cleanSearch, $options: 'i' } }
//         ];
//       } else {
//         // Otherwise search by name/email/order number
//         query.$or = [
//           { customerName: { $regex: search, $options: 'i' } },
//           { customerEmail: { $regex: search, $options: 'i' } },
//           { orderNumber: { $regex: search, $options: 'i' } }
//         ];
//       }
//     }

//     // Customer filters (for backward compatibility)
//     if (customerPhone && !search) {
//       const cleanPhone = customerPhone.replace(/\D/g, '');
//       if (cleanPhone.length >= 10) {
//         query.$or = [
//           { phoneNumber: { $regex: cleanPhone, $options: 'i' } },
//           { secondaryPhoneNumber: { $regex: cleanPhone, $options: 'i' } },
//           { whatsappNumber: { $regex: cleanPhone, $options: 'i' } }
//         ];
//       }
//     }

//     if (customerName && !search) {
//       const nameQuery = { customerName: { $regex: customerName.trim(), $options: 'i' } };
//       if (query.$or) {
//         query.$or.push(nameQuery);
//       } else {
//         query.customerName = { $regex: customerName.trim(), $options: 'i' };
//       }
//     }

//     if (customerEmail && !search) {
//       const emailQuery = { customerEmail: { $regex: customerEmail.trim(), $options: 'i' } };
//       if (query.$or) {
//         query.$or.push(emailQuery);
//       } else {
//         query.customerEmail = { $regex: customerEmail.trim(), $options: 'i' };
//       }
//     }

//     // Status filters
//     if (status && status !== 'all') {
//       query.status = status;
//     }

//     if (paymentStatus && paymentStatus !== 'all') {
//       query.paymentStatus = paymentStatus;
//     }

//     // Date range filter
//     if (fromDate || toDate) {
//       query.createdAt = {};
//       if (fromDate) {
//         query.createdAt.$gte = new Date(fromDate);
//       }
//       if (toDate) {
//         const endDate = new Date(toDate);
//         endDate.setHours(23, 59, 59, 999);
//         query.createdAt.$lte = endDate;
//       }
//     }

//     // Amount range filter
//     if (minAmount || maxAmount) {
//       query.totalPrice = {};
//       if (minAmount) query.totalPrice.$gte = parseFloat(minAmount);
//       if (maxAmount) query.totalPrice.$lte = parseFloat(maxAmount);
//     }

//     // Build sort options
//     let sortOptions = {};
//     const validSortFields = ['createdAt', 'totalPrice', 'orderNumber', 'customerName', 'status'];
//     const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
//     sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

//     // ✅ Execute query with aggregations
//     const [orders, total, aggregations] = await Promise.all([
//       Order.find(query)
//         .populate({
//           path: "items.productId",
//           model: Product,
//           select: "productName sku hsnCode imageUrls category brand"
//         })
//         .sort(sortOptions)
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Order.countDocuments(query),
//       Order.aggregate([
//         { $match: query },
//         {
//           $group: {
//             _id: null,
//             totalRevenue: { $sum: "$totalPrice" },
//             totalPaid: { $sum: "$paidAmount" },
//             totalPending: { $sum: { $subtract: ["$totalPrice", "$paidAmount"] } },
//             avgOrderValue: { $avg: "$totalPrice" },
//             minOrderValue: { $min: "$totalPrice" },
//             maxOrderValue: { $max: "$totalPrice" },
//             totalOrders: { $sum: 1 }
//           }
//         }
//       ])
//     ]);

//     // Format orders with computed fields
//     const formattedOrders = orders.map(formatOrderResponse);

//     const totalPages = Math.ceil(total / limit);
//     const aggregation = aggregations[0] || {};

//     // ✅ Get status counts for dashboard
//     const statusCounts = await Order.aggregate([
//       { $match: { isActive: true } },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//           totalAmount: { $sum: "$totalPrice" },
//           paidAmount: { $sum: "$paidAmount" }
//         }
//       }
//     ]);

//     const paymentStatusCounts = await Order.aggregate([
//       { $match: { isActive: true } },
//       {
//         $group: {
//           _id: "$paymentStatus",
//           count: { $sum: 1 },
//           totalAmount: { $sum: "$totalPrice" }
//         }
//       }
//     ]);

//     return NextResponse.json(
//       {
//         success: true,
//         message: formattedOrders.length ? "Orders fetched successfully" : "No orders found",
//         data: formattedOrders,
//         pagination: {
//           total,
//           page,
//           limit,
//           totalPages,
//           hasNext: page < totalPages,
//           hasPrev: page > 1
//         },
//         summary: {
//           revenue: {
//             total: aggregation.totalRevenue || 0,
//             paid: aggregation.totalPaid || 0,
//             pending: aggregation.totalPending || 0,
//             average: aggregation.avgOrderValue || 0,
//             min: aggregation.minOrderValue || 0,
//             max: aggregation.maxOrderValue || 0
//           },
//           counts: {
//             total: aggregation.totalOrders || 0
//           }
//         },
//         filters: {
//           applied: {
//             customerPhone: customerPhone || null,
//             customerName: customerName || null,
//             customerEmail: customerEmail || null,
//             status: status || null,
//             paymentStatus: paymentStatus || null,
//             fromDate: fromDate || null,
//             toDate: toDate || null,
//             minAmount: minAmount || null,
//             maxAmount: maxAmount || null,
//             search: search || null
//           }
//         },
//         analytics: {
//           byStatus: statusCounts,
//           byPaymentStatus: paymentStatusCounts
//         }
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("GET /api/orders Error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to fetch orders",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // ✅ POST - Create new order
// // ✅ POST - Create new order (FIXED VERSION)
// export async function POST(request) {
//   try {
//     await connectDB();
//     const body = await request.json();

//     // ✅ Validate required fields
//     const requiredFields = [
//       'customerName',
//       'customerEmail',
//       'phoneNumber',
//       'items',
//       'shippingAddress',
//       'paymentMethod',
//       'gstType'
//     ];
    
//     const missingFields = requiredFields.filter(field => !body[field]);
    
//     if (missingFields.length > 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Missing required fields",
//           error: `Required fields: ${missingFields.join(', ')}` 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate customer name
//     if (!body.customerName?.trim()) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid customer name",
//           error: "Customer name cannot be empty" 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(body.customerEmail)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid email format",
//           error: "Please provide a valid email address" 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate phone numbers
//     const cleanPhone = body.phoneNumber.replace(/\D/g, '');
//     if (cleanPhone.length !== 10) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid phone number",
//           error: "Phone number must be exactly 10 digits" 
//         },
//         { status: 400 }
//       );
//     }
//     body.phoneNumber = cleanPhone;

//     if (body.secondaryPhoneNumber) {
//       const cleanSecondary = body.secondaryPhoneNumber.replace(/\D/g, '');
//       if (cleanSecondary.length > 0 && cleanSecondary.length !== 10) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid secondary phone number",
//             error: "Secondary phone number must be exactly 10 digits if provided" 
//           },
//           { status: 400 }
//         );
//       }
//       body.secondaryPhoneNumber = cleanSecondary || null;
//     }

//     // ✅ Validate address
//     if (!body.shippingAddress?.street || !body.shippingAddress?.city || 
//         !body.shippingAddress?.state || !body.shippingAddress?.pincode) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid shipping address",
//           error: "Street, city, state, and pincode are required" 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate pincode
//     const pincodeRegex = /^\d{6}$/;
//     if (!pincodeRegex.test(body.shippingAddress.pincode)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid pincode",
//           error: "Pincode must be exactly 6 digits" 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate items array
//     if (!Array.isArray(body.items) || body.items.length === 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid items data",
//           error: "Items must be a non-empty array" 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate payment method
//     const validPaymentMethods = ['cash', 'card', 'upi', 'bank_transfer', 'wallet', 'cod'];
//     if (!validPaymentMethods.includes(body.paymentMethod)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid payment method",
//           error: `Valid methods: ${validPaymentMethods.join(', ')}` 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate GST type
//     const validGstTypes = ['intra-state', 'inter-state'];
//     if (!validGstTypes.includes(body.gstType)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid GST type",
//           error: `Valid types: ${validGstTypes.join(', ')}` 
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Comprehensive stock validation
//     console.log("🔍 Checking stock availability for order items...");
//     let subtotal = 0;
//     let totalDiscount = 0;
//     let totalGst = 0;
    
//     for (const item of body.items) {
//       const product = await Product.findById(item.productId);
      
//       if (!product) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Product not found",
//             error: `Product with ID ${item.productId} does not exist`
//           },
//           { status: 404 }
//         );
//       }

//       // Check if product is active
//       if (!product.isActive) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Product not available",
//             error: `${product.productName} is currently not available` 
//           },
//           { status: 400 }
//         );
//       }

//       // Check stock
//       if (product.stock < item.quantity) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Insufficient stock",
//             error: `${product.productName} has only ${product.stock} units available. You requested ${item.quantity} units.`
//           },
//           { status: 400 }
//         );
//       }

//       // Validate max order quantity
//       if (item.quantity > (product.maxOrderQuantity || 10)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Maximum order quantity exceeded",
//             error: `${product.productName} can only be ordered in quantities up to ${product.maxOrderQuantity || 10}` 
//           },
//           { status: 400 }
//         );
//       }

//       // Validate pricing
//       if (item.price > item.mrp) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid pricing",
//             error: `Price cannot be greater than MRP for ${product.productName}` 
//           },
//           { status: 400 }
//         );
//       }

//       // Calculate item totals
//       const itemTotal = item.quantity * item.price;
//       subtotal += itemTotal;
//       totalDiscount += item.quantity * (item.mrp - item.price);
      
//       // Calculate GST
//       let gstAmount = 0;
//       if (item.gstIncluded) {
//         const basePrice = itemTotal * 100 / (100 + item.gstRate);
//         gstAmount = itemTotal - basePrice;
//       } else {
//         gstAmount = (itemTotal * item.gstRate) / 100;
//       }
//       totalGst += gstAmount;

//       // Enrich item with product data
//       item.productName = product.productName;
//       item.sku = product.sku;
//       item.hsnCode = product.hsnCode;
//       item.gstAmount = gstAmount;
//       item.totalAmount = itemTotal;
      
//       console.log(`✅ Stock available: ${product.productName} - ${product.stock} units (Requested: ${item.quantity})`);
//     }

//     // ✅ Auto-generate order number
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     const random = Math.random().toString(36).substring(2, 8).toUpperCase();
//     body.orderNumber = `ORD-${year}${month}${day}-${random}`;

//     // ✅ Set calculated values
//     body.subtotal = subtotal;
//     body.totalDiscount = totalDiscount;
//     body.totalGst = totalGst;
//     body.totalPrice = subtotal + totalGst + (body.shippingCharge || 0);
//     body.paidAmount = body.paidAmount || 0;
//     body.balanceAmount = body.totalPrice - (body.paidAmount || 0);
    
//     // ✅ FIXED: Set payment status - PRESERVE provided status if it exists
//     // Only calculate if paymentStatus is NOT provided
//     if (!body.paymentStatus) {
//       if (body.paidAmount >= body.totalPrice) {
//         body.paymentStatus = "paid";
//       } else if (body.paidAmount > 0 && body.paidAmount < body.totalPrice) {
//         body.paymentStatus = "partial";
//       } else {
//         body.paymentStatus = "pending";
//       }
//     }
//     // If paymentStatus was provided (like from orderHandler), it will be preserved

//     // ✅ Initialize status history
//     body.statusHistory = [{
//       status: body.status || 'pending',
//       timestamp: new Date(),
//       comment: 'Order created',
//       updatedBy: body.createdBy
//     }];

//     // ✅ Set billing address if same as shipping
//     if (body.sameAsShipping && !body.billingAddress) {
//       body.billingAddress = body.shippingAddress;
//     }

//     // ✅ Create the order
//     const order = await Order.create(body);

//     // ✅ Update product stock atomically
//     console.log("📦 Updating product stock after order creation...");
    
//     for (const item of body.items) {
//       try {
//         const updatedProduct = await Product.findByIdAndUpdate(
//           item.productId,
//           { 
//             $inc: { stock: -item.quantity },
//             $set: { updatedAt: new Date() }
//           },
//           { new: true }
//         );

//         if (updatedProduct) {
//           console.log(`✅ Stock updated: ${updatedProduct.productName} - New stock: ${updatedProduct.stock}`);
          
//           // Check for low stock alert
//           if (updatedProduct.stock <= (updatedProduct.lowStockThreshold || 5)) {
//             console.warn(`⚠️ LOW STOCK ALERT: ${updatedProduct.productName} has only ${updatedProduct.stock} units left!`);
//           }
//         }
//       } catch (stockError) {
//         console.error(`❌ Error updating stock for product ${item.productId}:`, stockError);
//       }
//     }

//     // ✅ Populate the created order
//     const populatedOrder = await Order.findById(order._id)
//       .populate({
//         path: "items.productId",
//         model: Product,
//         select: "productName sku hsnCode imageUrls category brand mrp"
//       })
//       .lean();

//     // ✅ Generate invoice number
//     populatedOrder.invoiceNumber = `INV-${populatedOrder.orderNumber}-${Date.now().toString().slice(-4)}`;

//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Order created successfully", 
//         data: formatOrderResponse(populatedOrder)
//       },
//       { status: 201 }
//     );

//   } catch (error) {
//     console.error("POST /api/orders Error:", error);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Validation failed",
//           error: errors.join(', ') 
//         },
//         { status: 400 }
//       );
//     }

//     // Handle duplicate order numbers
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Duplicate order",
//           error: "An order with this number already exists. Please try again." 
//         },
//         { status: 409 }
//       );
//     }

//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to create order",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // ✅ PUT - Update order with comprehensive logic
// export async function PUT(request) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     const action = searchParams.get("action");

//     if (!id) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Order ID is required",
//           error: "Provide order ID as query parameter: ?id=ORDER_ID" 
//         },
//         { status: 400 }
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid order ID format" 
//         },
//         { status: 400 }
//       );
//     }

//     const updateData = await request.json();

//     // Get current order
//     const currentOrder = await Order.findById(id);
    
//     if (!currentOrder) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Order not found" 
//         },
//         { status: 404 }
//       );
//     }

//     // ✅ Handle specific actions
//     if (action === 'process-payment') {
//       const { amount, transactionId } = updateData;
      
//       if (!amount || amount <= 0) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid payment amount" 
//           },
//           { status: 400 }
//         );
//       }

//       const newPaidAmount = (currentOrder.paidAmount || 0) + amount;
//       const totalPrice = currentOrder.totalPrice || 0;

//       updateData.paidAmount = newPaidAmount;
//       updateData.balanceAmount = totalPrice - newPaidAmount;
      
//       if (newPaidAmount >= totalPrice) {
//         updateData.paymentStatus = "paid";
//       } else if (newPaidAmount > 0) {
//         updateData.paymentStatus = "partial";
//       }

//       if (transactionId) {
//         updateData.transactionId = transactionId;
//       }
//     }

//     // ✅ Handle payment verification from OCR
//     if (action === 'payment-verified') {
//       const { transactionId, verifiedBy } = updateData;
      
//       updateData.paidAmount = currentOrder.totalPrice;
//       updateData.balanceAmount = 0;
//       updateData.paymentStatus = "paid";
//       updateData.transactionId = transactionId || updateData.transactionId;
      
//       // Add to status history
//       if (!updateData.statusHistory) {
//         updateData.statusHistory = [];
//       }
//       updateData.statusHistory.push({
//         status: 'confirmed',
//         timestamp: new Date(),
//         comment: `Payment verified automatically. Transaction: ${transactionId || 'N/A'}`,
//         updatedBy: verifiedBy || 'auto_ocr'
//       });
//     }

//     // ✅ Validate status if provided
//     if (updateData.status) {
//       const validStatuses = [
//         'pending', 'confirmed', 'processing', 'packed', 
//         'shipped', 'out_for_delivery', 'delivered', 
//         'cancelled', 'returned', 'refunded'
//       ];
      
//       if (!validStatuses.includes(updateData.status)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid order status",
//             error: `Valid statuses: ${validStatuses.join(', ')}` 
//           },
//           { status: 400 }
//         );
//       }

//       // ✅ Handle stock restoration for cancellations
//       if (updateData.status === 'cancelled' && currentOrder.status !== 'cancelled') {
//         console.log("🔄 Order cancelled - Restoring stock...");
        
//         for (const item of currentOrder.items || []) {
//           try {
//             await Product.findByIdAndUpdate(
//               item.productId,
//               { 
//                 $inc: { stock: item.quantity },
//                 $set: { updatedAt: new Date() }
//               }
//             );
//             console.log(`↩️ Stock restored for item ${item.productName}`);
//           } catch (stockError) {
//             console.error(`❌ Error restoring stock:`, stockError);
//           }
//         }
//       }

//       // ✅ Handle stock deduction for order reactivation
//       if (currentOrder.status === 'cancelled' && 
//           updateData.status !== 'cancelled' && 
//           updateData.status !== 'pending') {
//         console.log("🔄 Order reactivated - Checking stock...");
        
//         for (const item of currentOrder.items || []) {
//           const product = await Product.findById(item.productId);
          
//           if (!product || (product.stock || 0) < item.quantity) {
//             return NextResponse.json(
//               { 
//                 success: false, 
//                 message: "Cannot reactivate order",
//                 error: `Insufficient stock for ${item.productName}` 
//               },
//               { status: 400 }
//             );
//           }

//           await Product.findByIdAndUpdate(
//             item.productId,
//             { 
//               $inc: { stock: -item.quantity },
//               $set: { updatedAt: new Date() }
//             }
//           );
//         }
//       }

//       // ✅ Add to status history
//       if (!updateData.statusHistory) {
//         updateData.statusHistory = [];
//       }
//       updateData.statusHistory.push({
//         status: updateData.status,
//         timestamp: new Date(),
//         comment: updateData.statusComment || `Status changed to ${updateData.status}`,
//         updatedBy: updateData.updatedBy
//       });
//     }

//     // ✅ Validate payment status if provided
//     if (updateData.paymentStatus) {
//       const validPaymentStatuses = ['pending', 'partial', 'paid', 'failed', 'refunded'];
//       if (!validPaymentStatuses.includes(updateData.paymentStatus)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid payment status" 
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // ✅ Recalculate totals if items changed
//     if (updateData.items) {
//       let subtotal = 0;
//       let totalDiscount = 0;
//       let totalGst = 0;

//       for (const item of updateData.items) {
//         const product = await Product.findById(item.productId);
//         if (!product) continue;

//         const itemTotal = (item.quantity || 0) * (item.price || 0);
//         subtotal += itemTotal;
//         totalDiscount += (item.quantity || 0) * ((item.mrp || 0) - (item.price || 0));

//         let gstAmount = 0;
//         if (item.gstIncluded) {
//           const basePrice = itemTotal * 100 / (100 + (item.gstRate || 18));
//           gstAmount = itemTotal - basePrice;
//         } else {
//           gstAmount = (itemTotal * (item.gstRate || 18)) / 100;
//         }
//         totalGst += gstAmount;

//         item.gstAmount = gstAmount;
//         item.totalAmount = itemTotal;
//       }

//       updateData.subtotal = subtotal;
//       updateData.totalDiscount = totalDiscount;
//       updateData.totalGst = totalGst;
//       updateData.totalPrice = subtotal + totalGst + (updateData.shippingCharge || currentOrder.shippingCharge || 0);
//       updateData.balanceAmount = (updateData.totalPrice || 0) - (updateData.paidAmount || currentOrder.paidAmount || 0);
//     }

//     // ✅ Update the order
//     const updatedOrder = await Order.findByIdAndUpdate(
//       id, 
//       { $set: updateData },
//       {
//         new: true,
//         runValidators: true,
//       }
//     ).populate({
//       path: "items.productId",
//       model: Product,
//       select: "productName sku hsnCode imageUrls category brand mrp"
//     });

//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Order updated successfully", 
//         data: formatOrderResponse(updatedOrder)
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("PUT /api/orders Error:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Validation failed",
//           error: errors.join(', ') 
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to update order",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // ✅ PATCH - Partial updates
// export async function PATCH(request) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Order ID is required" 
//         },
//         { status: 400 }
//       );
//     }

//     const updateData = await request.json();
    
//     // Only allow specific fields for PATCH
//     const allowedFields = ['status', 'paymentStatus', 'trackingNumber', 'deliveryNotes', 'orderNotes'];
//     const filteredUpdate = {};
    
//     Object.keys(updateData).forEach(key => {
//       if (allowedFields.includes(key)) {
//         filteredUpdate[key] = updateData[key];
//       }
//     });

//     if (Object.keys(filteredUpdate).length === 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "No valid fields to update" 
//         },
//         { status: 400 }
//       );
//     }

//     // Add to status history if status is being updated
//     if (filteredUpdate.status) {
//       if (!filteredUpdate.statusHistory) {
//         filteredUpdate.statusHistory = [];
//       }
//       filteredUpdate.statusHistory.push({
//         status: filteredUpdate.status,
//         timestamp: new Date(),
//         comment: updateData.statusComment || `Status updated to ${filteredUpdate.status}`,
//         updatedBy: updateData.updatedBy
//       });
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       { $set: filteredUpdate },
//       { new: true }
//     ).populate({
//       path: "items.productId",
//       model: Product,
//       select: "productName sku imageUrls"
//     });

//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Order updated successfully", 
//         data: formatOrderResponse(updatedOrder)
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("PATCH /api/orders Error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to update order",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // ✅ DELETE - Soft delete with stock restoration
// export async function DELETE(request) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     const permanent = searchParams.get("permanent") === 'true';

//     if (!id) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Order ID is required" 
//         },
//         { status: 400 }
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid order ID format" 
//         },
//         { status: 400 }
//       );
//     }

//     // Get order details before deletion
//     const order = await Order.findById(id);
    
//     if (!order) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Order not found" 
//         },
//         { status: 404 }
//       );
//     }

//     // Restore stock if order wasn't cancelled
//     if (order.status !== 'cancelled') {
//       console.log("🗑️ Deleting order - Restoring stock...");
      
//       for (const item of order.items || []) {
//         try {
//           await Product.findByIdAndUpdate(
//             item.productId,
//             { 
//               $inc: { stock: item.quantity },
//               $set: { updatedAt: new Date() }
//             }
//           );
//           console.log(`↩️ Stock restored for item ${item.productName}`);
//         } catch (stockError) {
//           console.error(`❌ Error restoring stock:`, stockError);
//         }
//       }
//     }

//     if (permanent) {
//       // Permanent delete
//       await Order.findByIdAndDelete(id);
      
//       return NextResponse.json(
//         { 
//           success: true, 
//           message: "Order permanently deleted",
//           data: { _id: id }
//         },
//         { status: 200 }
//       );
//     } else {
//       // Soft delete
//       await Order.findByIdAndUpdate(
//         id,
//         { 
//           isActive: false,
//           status: 'cancelled',
//           cancellationReason: 'Order deleted by user',
//           updatedAt: new Date()
//         }
//       );

//       return NextResponse.json(
//         { 
//           success: true, 
//           message: "Order deactivated successfully",
//           data: { _id: id }
//         },
//         { status: 200 }
//       );
//     }

//   } catch (error) {
//     console.error("DELETE /api/orders Error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to delete order",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // ✅ OPTIONS - API discovery
// export async function OPTIONS(request) {
//   return NextResponse.json({
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     description: 'Order management API with comprehensive features',
//     features: [
//       'Advanced filtering and search',
//       'Payment processing with partial payments',
//       'Stock management integration',
//       'Status history tracking',
//       'GST calculations',
//       'Invoice generation',
//       'Analytics and summaries'
//     ]
//   });
// }




// above code is without saas














// app/api/orders/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Company from "@/models/Company";
import mongoose from "mongoose";

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// ========== CONSTANTS ==========
const VALID_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed', 
  'shipped', 'out_for_delivery', 'delivered', 
  'cancelled', 'returned', 'refunded'
];

const VALID_PAYMENT_STATUSES = ['pending', 'partial', 'paid', 'failed', 'refunded'];
const VALID_PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'wallet', 'cod'];
const VALID_GST_TYPES = ['intra-state', 'inter-state'];
const VALID_SORT_FIELDS = ['createdAt', 'totalPrice', 'orderNumber', 'customerName', 'status', 'updatedAt'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ========== HELPER FUNCTIONS ==========

// ✅ Validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && 
         /^[0-9a-fA-F]{24}$/.test(id);
};

// ✅ Extract company context from request headers
const getCompanyContext = async (request) => {
  try {
    // First try to get from headers
    const companyId = request.headers.get('x-company-id');
    if (companyId && isValidObjectId(companyId)) {
      const company = await Company.findById(companyId);
      if (company) return companyId;
    }
    
    // Then try from Authorization token (you'll implement JWT decode)
    // This depends on your auth implementation
    
    return null;
  } catch (error) {
    console.error('Error getting company context:', error);
    return null;
  }
};

// ✅ Extract user ID from request (JWT or header)
const getUserId = (request, body = {}) => {
  // Try from header first
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  
  // Then try from body
  if (body.userId || body.createdBy || body.updatedBy) {
    return body.userId || body.createdBy || body.updatedBy;
  }
  
  // Then try to decode from Authorization token
  // This depends on your auth implementation
  // const token = request.headers.get('authorization')?.replace('Bearer ', '');
  // if (token) { decode token and return user id }
  
  return null;
};

// ✅ Format order response with computed fields and company context
const formatOrderResponse = (order, companyContext = null) => {
  if (!order) return null;
  
  const orderObj = order.toObject ? order.toObject() : order;
  
  // Calculate payment progress
  const totalPrice = orderObj.totalPrice || 0;
  const paidAmount = orderObj.paidAmount || 0;
  const balanceAmount = totalPrice - paidAmount;
  const paymentProgress = totalPrice > 0 ? Math.round((paidAmount / totalPrice) * 100) : 0;
  
  // Process items with computed fields
  const processedItems = (orderObj.items || []).map(item => ({
    ...item,
    totalWithGst: (item.totalAmount || 0) + (item.gstAmount || 0),
    savings: (item.quantity || 0) * ((item.mrp || 0) - (item.price || 0)),
    itemTotal: (item.quantity || 0) * (item.price || 0)
  }));
  
  // Check if overdue (delivery date passed and not delivered)
  let isOverdue = false;
  if (orderObj.deliveryDate && 
      orderObj.status !== 'delivered' && 
      orderObj.status !== 'cancelled') {
    isOverdue = new Date() > new Date(orderObj.deliveryDate);
  }
  
  return {
    ...orderObj,
    items: processedItems,
    balanceAmount,
    paymentProgress,
    isOverdue,
    formattedOrderNumber: orderObj.orderNumber,
    totalItems: processedItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    uniqueProductsCount: processedItems.length,
    paymentPercentage: paymentProgress,
    
    // Company context
    companyId: orderObj.companyId,
    isCompanyIsolated: true,
    
    // Audit info
    createdBy: orderObj.createdBy,
    updatedBy: orderObj.updatedBy,
    createdAt: orderObj.createdAt,
    updatedAt: orderObj.updatedAt,
    
    // Soft delete status
    isDeleted: !!orderObj.deletedAt,
    deletedAt: orderObj.deletedAt || null
  };
};

// ✅ Build order query with company isolation
const buildOrderQuery = (params, companyId) => {
  const {
    search,
    customerPhone,
    customerName,
    customerEmail,
    status,
    paymentStatus,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    source,
    includeDeleted = false,
    isUrgent,
    hasWhatsappNumber
  } = params;

  // Start with company filter - THIS IS CRITICAL
  let query = { companyId };

  // Handle soft delete filter
  if (!includeDeleted) {
    query.deletedAt = null;
    query.isActive = true;
  }

  // Handle search parameter (searches across multiple fields)
  if (search) {
    const cleanSearch = search.replace(/\D/g, '');
    
    // Check if it's a phone number (10 digits)
    if (cleanSearch.length === 10) {
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
        { orderNumber: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'items.productName': { $regex: search, $options: 'i' } }
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
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  // Payment status filters
  if (paymentStatus && paymentStatus !== 'all') {
    if (Array.isArray(paymentStatus)) {
      query.paymentStatus = { $in: paymentStatus };
    } else {
      query.paymentStatus = paymentStatus;
    }
  }

  // Source filter (whatsapp, admin, etc.)
  if (source && source !== 'all') {
    query.source = source;
  }

  // Urgent orders filter
  if (isUrgent === 'true') {
    query.isUrgent = true;
  }

  // WhatsApp number present filter
  if (hasWhatsappNumber === 'true') {
    query.whatsappNumber = { $exists: true, $ne: null };
  } else if (hasWhatsappNumber === 'false') {
    query.whatsappNumber = { $exists: false };
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

  return query;
};

// ✅ Validate order data
const validateOrderData = async (data, companyId, isUpdate = false) => {
  const errors = [];

  // Required fields for new orders
  if (!isUpdate) {
    const requiredFields = [
      'customerName',
      'customerEmail',
      'phoneNumber',
      'items',
      'shippingAddress',
      'paymentMethod',
      'gstType'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      errors.push(`Required fields: ${missingFields.join(', ')}`);
    }
  }

  // Validate companyId
  if (!companyId || !isValidObjectId(companyId)) {
    errors.push('Valid company ID is required');
  } else {
    const company = await Company.findById(companyId);
    if (!company) {
      errors.push('Company not found');
    }
  }

  // Validate customer name
  if (data.customerName !== undefined) {
    if (!data.customerName?.trim()) {
      errors.push('Customer name cannot be empty');
    }
  }

  // Validate email
  if (data.customerEmail !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      errors.push('Invalid email format');
    }
  }

  // Validate phone numbers
  if (data.phoneNumber !== undefined) {
    const cleanPhone = data.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      errors.push('Phone number must be exactly 10 digits');
    }
    data.phoneNumber = cleanPhone;
  }

  if (data.secondaryPhoneNumber) {
    const cleanSecondary = data.secondaryPhoneNumber.replace(/\D/g, '');
    if (cleanSecondary.length > 0 && cleanSecondary.length !== 10) {
      errors.push('Secondary phone number must be exactly 10 digits if provided');
    }
    data.secondaryPhoneNumber = cleanSecondary || null;
  }

  // Validate address
  if (data.shippingAddress) {
    if (!data.shippingAddress?.street || !data.shippingAddress?.city || 
        !data.shippingAddress?.state || !data.shippingAddress?.pincode) {
      errors.push('Street, city, state, and pincode are required in shipping address');
    } else {
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(data.shippingAddress.pincode)) {
        errors.push('Pincode must be exactly 6 digits');
      }
    }
  }

  // Validate items
  if (data.items !== undefined) {
    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.push('Items must be a non-empty array');
    } else {
      // Validate each item
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        
        if (!item.productId) {
          errors.push(`Item ${i + 1}: Product ID is required`);
        } else if (!isValidObjectId(item.productId)) {
          errors.push(`Item ${i + 1}: Invalid product ID format`);
        } else {
          // Check if product exists in this company
          const product = await Product.findOne({ 
            _id: item.productId, 
            companyId 
          });
          
          if (!product) {
            errors.push(`Item ${i + 1}: Product not found in this company`);
          } else if (!product.isActive) {
            errors.push(`Item ${i + 1}: Product ${product.productName} is not active`);
          } else if (product.stock < (item.quantity || 0)) {
            errors.push(`Item ${i + 1}: ${product.productName} has only ${product.stock} units available`);
          } else if ((item.quantity || 0) > (product.maxOrderQuantity || 10)) {
            errors.push(`Item ${i + 1}: ${product.productName} max order quantity is ${product.maxOrderQuantity || 10}`);
          }
        }

        if (!item.quantity || item.quantity < 1) {
          errors.push(`Item ${i + 1}: Valid quantity required`);
        }

        if (item.price && item.mrp && item.price > item.mrp) {
          errors.push(`Item ${i + 1}: Price cannot be greater than MRP`);
        }
      }
    }
  }

  // Validate payment method
  if (data.paymentMethod && !VALID_PAYMENT_METHODS.includes(data.paymentMethod)) {
    errors.push(`Invalid payment method. Valid methods: ${VALID_PAYMENT_METHODS.join(', ')}`);
  }

  // Validate GST type
  if (data.gstType && !VALID_GST_TYPES.includes(data.gstType)) {
    errors.push(`Invalid GST type. Valid types: ${VALID_GST_TYPES.join(', ')}`);
  }

  // Validate status if provided
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Invalid status. Valid statuses: ${VALID_STATUSES.join(', ')}`);
  }

  // Validate payment status if provided
  if (data.paymentStatus && !VALID_PAYMENT_STATUSES.includes(data.paymentStatus)) {
    errors.push(`Invalid payment status. Valid statuses: ${VALID_PAYMENT_STATUSES.join(', ')}`);
  }

  return errors;
};

// ========== GET HANDLER ==========
export async function GET(request) {
  console.log("🚀 ===== ORDERS API CALLED =====");
  
  try {
    await connectDB();

    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required",
          error: "Missing or invalid company ID"
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");
    const invoiceNumber = searchParams.get("invoice");
    const customerPhone = searchParams.get("phone");
    const customerName = searchParams.get("name");
    const customerEmail = searchParams.get("email");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const source = searchParams.get("source");
    const isUrgent = searchParams.get("isUrgent");
    const hasWhatsappNumber = searchParams.get("hasWhatsapp");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const includeDeleted = searchParams.get("includeDeleted") === 'true';
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = Math.min(parseInt(searchParams.get("limit")) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // ✅ Get single order by various identifiers
    if (id || orderNumber || invoiceNumber) {
      let query = { companyId };
      
      // Add soft delete filter
      if (!includeDeleted) {
        query.deletedAt = null;
      }
      
      if (id) {
        if (!isValidObjectId(id)) {
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
        .populate("createdBy", "fullName email")
        .populate("updatedBy", "fullName email")
        .lean();

      if (!order) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Order not found",
            error: `No order found with provided identifier in this company`
          },
          { status: 404 }
        );
      }

      // Double-check company isolation
      if (order.companyId.toString() !== companyId.toString()) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Access denied",
            error: "Order does not belong to this company"
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Order fetched successfully", 
          data: formatOrderResponse(order, companyId)
        },
        { status: 200 }
      );
    }

    // ✅ Build comprehensive query with company isolation
    const query = await buildOrderQuery({
      search,
      customerPhone,
      customerName,
      customerEmail,
      status,
      paymentStatus,
      source,
      isUrgent,
      hasWhatsappNumber,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      includeDeleted
    }, companyId);

    console.log("🔍 Order query:", JSON.stringify(query, null, 2));

    // Build sort options
    let sortOptions = {};
    const sortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // ✅ Execute query with aggregations
    const [orders, total, aggregations] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.productId",
          model: Product,
          select: "productName sku hsnCode imageUrls category brand mrp"
        })
        .populate("createdBy", "fullName email")
        .populate("updatedBy", "fullName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
      Order.aggregate([
        { $match: { ...query, companyId: new mongoose.Types.ObjectId(companyId) } },
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
    const formattedOrders = orders.map(order => formatOrderResponse(order, companyId));

    const totalPages = Math.ceil(total / limit);
    const aggregation = aggregations[0] || {};

    // ✅ Get status counts for dashboard (company-specific)
    const statusCounts = await Order.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId), deletedAt: null, isActive: true } },
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
      { $match: { companyId: new mongoose.Types.ObjectId(companyId), deletedAt: null, isActive: true } },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" }
        }
      }
    ]);

    // ✅ Get source distribution
    const sourceCounts = await Order.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId), deletedAt: null, isActive: true } },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
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
            source: source || null,
            isUrgent: isUrgent || null,
            hasWhatsappNumber: hasWhatsappNumber || null,
            fromDate: fromDate || null,
            toDate: toDate || null,
            minAmount: minAmount || null,
            maxAmount: maxAmount || null,
            search: search || null
          }
        },
        analytics: {
          byStatus: statusCounts,
          byPaymentStatus: paymentStatusCounts,
          bySource: sourceCounts
        },
        companyId
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

// ========== POST HANDLER ==========
export async function POST(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required",
          error: "Missing or invalid company ID"
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Add companyId to body
    body.companyId = companyId;

    // Get user from auth - FIXED: Use helper function
    const userId = getUserId(request, body);
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User authentication required",
          error: "User ID could not be determined. Please ensure you are logged in and your session is valid."
        },
        { status: 401 }
      );
    }
    body.createdBy = userId;

    // ===== FIX: GENERATE ORDER NUMBER AUTOMATICALLY =====
    // Format: ORD-YYYYMMDD-XXXX (daily sequence)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Find the last order for today to increment sequence
    const lastOrder = await Order.findOne({
      companyId,
      orderNumber: new RegExp(`^ORD-${dateStr}-`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSeq = parseInt(lastOrder.orderNumber.split('-')[2]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    // Set the order number
    body.orderNumber = `ORD-${dateStr}-${String(sequence).padStart(4, '0')}`;
    console.log('📦 Generated order number:', body.orderNumber);

    // Validate order data
    const validationErrors = await validateOrderData(body, companyId);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed",
          error: validationErrors.join(', ')
        },
        { status: 400 }
      );
    }

    // Clean phone numbers
    body.phoneNumber = body.phoneNumber.replace(/\D/g, '');
    if (body.secondaryPhoneNumber) {
      body.secondaryPhoneNumber = body.secondaryPhoneNumber.replace(/\D/g, '');
    }

    // Calculate totals for each item
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;
    
    for (const item of body.items) {
      const product = await Product.findOne({ 
        _id: item.productId, 
        companyId 
      });

      if (!product) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Validation failed",
            error: `Product with ID ${item.productId} not found in this company`
          },
          { status: 400 }
        );
      }

      // Take inventory snapshot
      item.inventorySnapshot = product.stock;

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

      item.gstAmount = gstAmount;
      item.totalAmount = itemTotal;
    }

    // Set calculated values
    body.subtotal = subtotal;
    body.totalDiscount = totalDiscount;
    body.totalGst = totalGst;
    body.totalPrice = subtotal + totalGst + (body.shippingCharge || 0);
    body.paidAmount = body.paidAmount || 0;
    body.balanceAmount = body.totalPrice - body.paidAmount;
    
    // Set payment status
    if (body.paidAmount >= body.totalPrice) {
      body.paymentStatus = "paid";
    } else if (body.paidAmount > 0 && body.paidAmount < body.totalPrice) {
      body.paymentStatus = "partial";
    } else {
      body.paymentStatus = "pending";
    }

    // Set source if not provided
    if (!body.source) {
      body.source = "admin"; // Default for manual orders
    }

    // Initialize status history
    body.statusHistory = [{
      status: body.status || 'pending',
      timestamp: new Date(),
      comment: 'Order created',
      updatedBy: userId
    }];

    // Initialize payment details if paid amount > 0
    if (body.paidAmount > 0) {
      body.paymentDetails = [{
        amount: body.paidAmount,
        method: body.paymentMethod,
        transactionId: body.transactionId,
        paidAt: new Date(),
        verifiedBy: userId,
        verifiedAt: new Date()
      }];
    }

    // Set billing address if same as shipping
    if (body.sameAsShipping && !body.billingAddress) {
      body.billingAddress = body.shippingAddress;
    }

    // Create the order (orderNumber is now set)
    console.log('📦 Creating order with data:', {
      orderNumber: body.orderNumber,
      companyId: body.companyId,
      totalPrice: body.totalPrice,
      itemsCount: body.items.length
    });
    
    const order = await Order.create(body);
    console.log('✅ Order created successfully:', order._id);

    // Update product stock atomically
    console.log("📦 Updating product stock after order creation...");
    
    for (const item of body.items) {
      try {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.productId, companyId },
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

    // Populate the created order
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.productId",
        model: Product,
        select: "productName sku hsnCode imageUrls category brand mrp"
      })
      .populate("createdBy", "fullName email")
      .lean();

    // Generate invoice number
    if (!populatedOrder.invoiceNumber) {
      const invoiceDate = new Date();
      const invoiceYear = invoiceDate.getFullYear();
      const invoiceMonth = (invoiceDate.getMonth() + 1).toString().padStart(2, '0');
      const invoiceSequence = await Order.countDocuments({ 
        companyId,
        invoiceNumber: { $regex: `^INV-${invoiceYear}${invoiceMonth}` }
      }) + 1;
      
      populatedOrder.invoiceNumber = `INV-${invoiceYear}${invoiceMonth}-${invoiceSequence.toString().padStart(4, '0')}`;
      
      // Update the order with invoice number
      await Order.findByIdAndUpdate(order._id, {
        invoiceNumber: populatedOrder.invoiceNumber,
        invoiceGenerated: true,
        invoiceGeneratedAt: new Date()
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Order created successfully", 
        data: formatOrderResponse(populatedOrder, companyId)
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
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: "Duplicate value",
          error: `An order with this ${field} already exists in this company` 
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

// ========== PUT HANDLER ==========
export async function PUT(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required",
          error: "Missing or invalid company ID"
        },
        { status: 400 }
      );
    }

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

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid order ID format" 
        },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Get user from auth - FIXED: Use helper function
    const userId = getUserId(request, updateData);
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User authentication required",
          error: "User ID could not be determined. Please ensure you are logged in and your session is valid."
        },
        { status: 401 }
      );
    }
    updateData.updatedBy = userId;

    // Get current order and verify company ownership
    const currentOrder = await Order.findOne({ _id: id, companyId });
    
    if (!currentOrder) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found in this company" 
        },
        { status: 404 }
      );
    }

    // ✅ Handle specific actions
    if (action === 'process-payment') {
      const { amount, transactionId, method } = updateData;
      
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

      // Add to payment details
      if (!updateData.paymentDetails) {
        updateData.paymentDetails = currentOrder.paymentDetails || [];
      }
      updateData.paymentDetails.push({
        amount,
        method: method || currentOrder.paymentMethod,
        transactionId,
        paidAt: new Date(),
        verifiedBy: userId,
        verifiedAt: new Date()
      });
    }

    // ✅ Handle payment verification from OCR
    if (action === 'payment-verified') {
      const { transactionId, verifiedBy } = updateData;
      
      updateData.paidAmount = currentOrder.totalPrice;
      updateData.balanceAmount = 0;
      updateData.paymentStatus = "paid";
      updateData.transactionId = transactionId || updateData.transactionId;
      
      // Add to payment details
      if (!updateData.paymentDetails) {
        updateData.paymentDetails = currentOrder.paymentDetails || [];
      }
      updateData.paymentDetails.push({
        amount: currentOrder.totalPrice,
        method: 'upi',
        transactionId: transactionId,
        paidAt: new Date(),
        verifiedBy: verifiedBy || userId,
        verifiedAt: new Date(),
        notes: 'Auto-verified via OCR'
      });
      
      // Add to status history
      if (!updateData.statusHistory) {
        updateData.statusHistory = [];
      }
      updateData.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        comment: `Payment verified automatically. Transaction: ${transactionId || 'N/A'}`,
        updatedBy: verifiedBy || userId
      });
    }

    // ✅ Validate status if provided
    if (updateData.status) {
      if (!VALID_STATUSES.includes(updateData.status)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid order status",
            error: `Valid statuses: ${VALID_STATUSES.join(', ')}` 
          },
          { status: 400 }
        );
      }

      // ✅ Handle stock restoration for cancellations
      if (updateData.status === 'cancelled' && currentOrder.status !== 'cancelled') {
        console.log("🔄 Order cancelled - Restoring stock...");
        
        for (const item of currentOrder.items || []) {
          try {
            await Product.findOneAndUpdate(
              { _id: item.productId, companyId },
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
          const product = await Product.findOne({ 
            _id: item.productId, 
            companyId 
          });
          
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

          await Product.findOneAndUpdate(
            { _id: item.productId, companyId },
            { 
              $inc: { stock: -item.quantity },
              $set: { updatedAt: new Date() }
            }
          );
        }
      }

      // ✅ Add to status history
      if (!updateData.statusHistory) {
        updateData.statusHistory = currentOrder.statusHistory || [];
      }
      updateData.statusHistory.push({
        status: updateData.status,
        timestamp: new Date(),
        comment: updateData.statusComment || `Status changed to ${updateData.status}`,
        updatedBy: userId
      });
    }

    // ✅ Validate payment status if provided
    if (updateData.paymentStatus && !VALID_PAYMENT_STATUSES.includes(updateData.paymentStatus)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid payment status",
          error: `Valid statuses: ${VALID_PAYMENT_STATUSES.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // ✅ Recalculate totals if items changed
    if (updateData.items) {
      let subtotal = 0;
      let totalDiscount = 0;
      let totalGst = 0;

      for (const item of updateData.items) {
        const product = await Product.findOne({ 
          _id: item.productId, 
          companyId 
        });
        
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

    // Prevent updating certain fields
    delete updateData.companyId;
    delete updateData.createdBy;
    delete updateData.orderNumber;

    // ✅ Update the order
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, companyId }, 
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "items.productId",
      model: Product,
      select: "productName sku hsnCode imageUrls category brand mrp"
    })
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email");

    return NextResponse.json(
      { 
        success: true, 
        message: "Order updated successfully", 
        data: formatOrderResponse(updatedOrder, companyId)
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

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: "Duplicate value",
          error: `An order with this ${field} already exists in this company` 
        },
        { status: 409 }
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

// ========== PATCH HANDLER ==========
export async function PATCH(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required",
          error: "Missing or invalid company ID"
        },
        { status: 400 }
      );
    }

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

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid order ID format" 
        },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Get user from auth - FIXED: Use helper function
    const userId = getUserId(request, updateData);
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User authentication required",
          error: "User ID could not be determined. Please ensure you are logged in and your session is valid."
        },
        { status: 401 }
      );
    }
    
    // Only allow specific fields for PATCH
    const allowedFields = [
      'status', 
      'paymentStatus', 
      'trackingNumber', 
      'deliveryNotes', 
      'orderNotes',
      'deliveryDate',
      'deliverySlot',
      'isUrgent',
      'statusComment'
    ];
    
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
          message: "No valid fields to update",
          error: `Allowed fields: ${allowedFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Get current order to verify ownership
    const currentOrder = await Order.findOne({ _id: id, companyId });
    
    if (!currentOrder) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found in this company" 
        },
        { status: 404 }
      );
    }

    // Add to status history if status is being updated
    if (filteredUpdate.status) {
      if (!filteredUpdate.statusHistory) {
        filteredUpdate.statusHistory = currentOrder.statusHistory || [];
      }
      filteredUpdate.statusHistory.push({
        status: filteredUpdate.status,
        timestamp: new Date(),
        comment: filteredUpdate.statusComment || `Status updated to ${filteredUpdate.status}`,
        updatedBy: userId
      });
      
      // Clean up
      delete filteredUpdate.statusComment;
    }

    // Add updated by
    filteredUpdate.updatedBy = userId;
    filteredUpdate.updatedAt = new Date();

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, companyId },
      { $set: filteredUpdate },
      { new: true }
    ).populate({
      path: "items.productId",
      model: Product,
      select: "productName sku imageUrls"
    })
    .populate("updatedBy", "fullName email");

    return NextResponse.json(
      { 
        success: true, 
        message: "Order updated successfully", 
        data: formatOrderResponse(updatedOrder, companyId)
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

// ========== DELETE HANDLER ==========
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required",
          error: "Missing or invalid company ID"
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    const permanent = searchParams.get("permanent") === 'true';
    const userId = getUserId(request, { userId: searchParams.get("userId") });

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User authentication required",
          error: "User ID is required for deletion"
        },
        { status: 401 }
      );
    }

    // Bulk delete
    if (ids) {
      const idArray = ids.split(',');
      
      const validIds = idArray.filter(id => isValidObjectId(id));
      
      if (validIds.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "No valid order IDs provided" 
          },
          { status: 400 }
        );
      }

      // Verify all orders belong to this company
      const orders = await Order.find({ 
        _id: { $in: validIds },
        companyId
      }).select('_id status items');
      
      if (orders.length !== validIds.length) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Some orders do not belong to this company",
            error: "Access denied to one or more orders"
          },
          { status: 403 }
        );
      }

      // Restore stock for each order that wasn't cancelled
      for (const order of orders) {
        if (order.status !== 'cancelled') {
          for (const item of order.items || []) {
            try {
              await Product.findOneAndUpdate(
                { _id: item.productId, companyId },
                { 
                  $inc: { stock: item.quantity },
                  $set: { updatedAt: new Date() }
                }
              );
            } catch (stockError) {
              console.error(`❌ Error restoring stock:`, stockError);
            }
          }
        }
      }

      if (permanent) {
        // Permanent delete
        const result = await Order.deleteMany({ 
          _id: { $in: validIds }, 
          companyId 
        });
        return NextResponse.json(
          { 
            success: true, 
            message: "Orders permanently deleted",
            data: { deletedCount: result.deletedCount }
          },
          { status: 200 }
        );
      } else {
        // Soft delete
        const result = await Order.updateMany(
          { _id: { $in: validIds }, companyId },
          { 
            $set: { 
              deletedAt: new Date(),
              deletedBy: userId,
              isActive: false,
              status: 'cancelled',
              cancellationReason: 'Bulk order deletion',
              updatedBy: userId,
              updatedAt: new Date()
            } 
          }
        );

        return NextResponse.json(
          { 
            success: true, 
            message: "Orders deactivated successfully",
            data: {
              matchedCount: result.matchedCount,
              modifiedCount: result.modifiedCount
            }
          },
          { status: 200 }
        );
      }
    }

    // Single delete
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order ID is required",
          error: "id parameter is required for deletion" 
        },
        { status: 400 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid order ID format" 
        },
        { status: 400 }
      );
    }

    // Get order details and verify ownership
    const order = await Order.findOne({ _id: id, companyId });
    
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Order not found in this company" 
        },
        { status: 404 }
      );
    }

    // Restore stock if order wasn't cancelled
    if (order.status !== 'cancelled') {
      console.log("🗑️ Deleting order - Restoring stock...");
      
      for (const item of order.items || []) {
        try {
          await Product.findOneAndUpdate(
            { _id: item.productId, companyId },
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
          data: { _id: id, orderNumber: order.orderNumber }
        },
        { status: 200 }
      );
    } else {
      // Soft delete
      await Order.findByIdAndUpdate(
        id,
        { 
          $set: {
            deletedAt: new Date(),
            deletedBy: userId,
            isActive: false,
            status: 'cancelled',
            cancellationReason: 'Order deleted by user',
            updatedBy: userId,
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json(
        { 
          success: true, 
          message: "Order deactivated successfully",
          data: { 
            _id: id, 
            orderNumber: order.orderNumber,
            customerName: order.customerName
          }
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

// ========== OPTIONS HANDLER ==========
export async function OPTIONS(request) {
  return NextResponse.json({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    description: 'Multi-tenant Order management API with company isolation',
    features: [
      'Company-based data isolation',
      'Advanced filtering and search',
      'Payment processing with partial payments',
      'Stock management integration',
      'Status history tracking',
      'GST calculations',
      'Invoice generation',
      'Analytics and summaries',
      'Bulk operations with company validation',
      'Soft delete with audit trail',
      'WhatsApp order tracking',
      'Urgent order flagging'
    ]
  });
}