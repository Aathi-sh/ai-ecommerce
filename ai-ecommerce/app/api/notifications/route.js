// // app/api/notifications/route.js - FIXED WITHOUT NextAuth
// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';

// // ========== DATABASE CONNECTION ==========
// const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// let isConnected = false;

// const connectDB = async () => {
//   if (isConnected) {
//     return;
//   }

//   try {
//     await mongoose.connect(MONGODB_URI, {
//       dbName: process.env.FRONTEND_DB_NAME || 'adghwrtu419_db',
//       serverSelectionTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//     });

//     isConnected = true;
//     console.log('✅ MongoDB connected for notifications');
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error.message);
//     throw new Error(`Database connection failed: ${error.message}`);
//   }
// };

// // ========== NOTIFICATION SCHEMA ==========
// const notificationSchema = new mongoose.Schema({
//   // Basic info
//   type: {
//     type: String,
//     required: true,
//     enum: [
//       'NEW_ORDER',
//       'PAYMENT_RECEIVED', 
//       'PAYMENT_VERIFIED',
//       'LOW_STOCK_ALERT',
//       'ORDER_STATUS_CHANGED',
//       'SYSTEM_ALERT',
//       'ADMIN_ALERT',
      
//     ]
//   },
  
//   // Order info
//   orderId: String,
//   orderNumber: String,
//   customerName: String,
//   customerPhone: String,
//   totalAmount: Number,
  
//   // Notification content
//   title: String,
//   message: String,
//   priority: {
//     type: String,
//     enum: ['low', 'normal', 'high', 'urgent'],
//     default: 'normal'
//   },
  
//   // Status tracking
//   status: {
//     type: String,
//     enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
//     default: 'pending'
//   },
  
//   // Source info
//   source: {
//     type: String,
//     default: 'whatsapp-bot'
//   },
//   channel: {
//     type: String,
//     enum: ['dashboard', 'push', 'whatsapp', 'email'],
//     default: 'dashboard'
//   },
  
//   // Metadata
//   metadata: {
//     type: Object,
//     default: {}
//   },
  
//   // Timestamps
//   sentAt: Date,
//   deliveredAt: Date,
//   readAt: Date,
  
//   // Error handling
//   error: String,
//   retryCount: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true,
//   collection: 'notifications'
// });

// // Create or get model
// const Notification = mongoose.models.Notification || 
//   mongoose.model('Notification', notificationSchema);

// // ========== HELPER FUNCTIONS ==========

// // Check if user is admin (for internal use)
// const isAdminUser = (userRole) => {
//   return userRole && ['admin', 'superadmin', 'manager'].includes(userRole);
// };

// // Format notification for response
// const formatNotification = (notification) => {
//   return {
//     id: notification._id.toString(),
//     type: notification.type,
//     orderNumber: notification.orderNumber,
//     title: notification.title,
//     message: notification.message,
//     priority: notification.priority,
//     status: notification.status,
//     customerName: notification.customerName,
//     totalAmount: notification.totalAmount,
//     createdAt: notification.createdAt,
//     timeSince: formatTimeSince(notification.createdAt),
//     source: notification.source
//   };
// };

// const formatTimeSince = (date) => {
//   const now = new Date();
//   const diffMs = now - new Date(date);
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHours = Math.floor(diffMs / 3600000);
//   const diffDays = Math.floor(diffMs / 86400000);
  
//   if (diffDays > 0) return `${diffDays}d ago`;
//   if (diffHours > 0) return `${diffHours}h ago`;
//   if (diffMins > 0) return `${diffMins}m ago`;
//   return 'Just now';
// };

// // Validate API key for backend calls
// const isValidApiKey = (apiKey) => {
//   if (!apiKey) return false;
  
//   const validKeys = [
//     process.env.NOTIFICATION_API_KEY,
//     process.env.ADMIN_API_KEY,
//     process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY,
//     'dev-key-2024'
//   ].filter(Boolean);
  
//   return validKeys.includes(apiKey);
// };

// // ========== GET USER FROM REQUEST ==========
// const getUserFromRequest = async (request) => {
//   try {
//     // Get authorization header
//     const authHeader = request.headers.get('authorization');
    
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       // Parse the token (in your case, you might want to validate JWT)
//       const token = authHeader.substring(7);
      
//       // For now, accept any token (you should validate it properly)
//       // You can implement JWT verification here
//       return {
//         id: 'admin-id',
//         email: 'admin@example.com',
//         role: 'admin',
//         name: 'Admin'
//       };
//     }
    
//     // Try to get from cookies or session (simplified)
//     return null;
//   } catch (error) {
//     console.error('Error getting user from request:', error);
//     return null;
//   }
// };

// // ========== API ENDPOINTS ==========

// // POST - Receive notifications from backend (ALLOWS API KEY AUTH)
// export async function POST(request) {
//   const requestId = Math.random().toString(36).substring(7);
  
//   console.log(`📥 [${requestId}] POST /api/notifications - Start processing`);
  
//   try {
//     await connectDB();
    
//     // Check API key (for backend calls)
//     const apiKey = request.headers.get('x-api-key') || 
//                   request.headers.get('authorization')?.replace('Bearer ', '');
    
//     // ✅ Allow backend calls with API key, frontend requires admin session
//     let isBackendCall = false;
    
//     if (apiKey && isValidApiKey(apiKey)) {
//       console.log(`✅ [${requestId}] Backend API key validated - allowing access`);
//       isBackendCall = true;
//     } else {
//       // For frontend calls, require admin user from auth header
//       const user = await getUserFromRequest(request);
//       if (!user || !isAdminUser(user.role)) {
//         return NextResponse.json({
//           success: false,
//           error: 'Unauthorized',
//           message: 'Admin access required or valid API key needed',
//           requestId
//         }, { status: 401 });
//       }
//       console.log(`✅ [${requestId}] Admin user authenticated: ${user.email}`);
//     }
    
//     // Parse request body
//     let body;
//     try {
//       body = await request.json();
//     } catch (error) {
//       console.error(`❌ [${requestId}] Invalid JSON:`, error.message);
//       return NextResponse.json({
//         success: false,
//         error: 'Invalid JSON',
//         message: 'Request body must be valid JSON',
//         requestId
//       }, { status: 400 });
//     }
    
//     const { 
//       type, 
//       data = {}, 
//       order, 
//       priority = 'normal',
//       source = 'whatsapp-bot',
//       test = false
//     } = body;
    
//     console.log(`📝 [${requestId}] Received notification:`, {
//       type,
//       orderNumber: data.orderNumber || order?.orderNumber,
//       source,
//       from: isBackendCall ? 'backend' : 'frontend'
//     });
    
//     // Validate required fields
//     if (!type) {
//       return NextResponse.json({
//         success: false,
//         error: 'Missing type',
//         message: 'Notification type is required',
//         requestId
//       }, { status: 400 });
//     }
    
//     // Extract order data
//     const orderData = data || order || {};
    
//     // Create notification title and message
//     let title = '';
//     let message = '';
    
//     switch (type) {
//       case 'NEW_ORDER':
//         title = '🛍️ New Order Received';
//         message = `Order #${orderData.orderNumber} from ${orderData.customerName || 'Customer'} for ₹${orderData.totalPrice || orderData.totalAmount || 0}`;
//         break;
//       case 'PAYMENT_RECEIVED':
//         title = '💰 Payment Received';
//         message = `Payment of ₹${orderData.amount} received for Order #${orderData.orderNumber}`;
//         break;
//       case 'PAYMENT_VERIFIED':
//         title = '✅ Payment Verified';
//         message = `Payment for Order #${orderData.orderNumber} has been verified`;
//         break;
//       case 'LOW_STOCK_ALERT':
//         title = '📦 Low Stock Alert';
//         message = `${orderData.productName} is running low (${orderData.stock} left)`;
//         break;
//       case 'ORDER_STATUS_CHANGED':
//         title = '📦 Order Status Updated';
//         message = `Order #${orderData.orderNumber} is now ${orderData.newStatus}`;
//         break;
//       case 'TEST_NOTIFICATION':
//         title = '🧪 Test Notification';
//         message = 'This is a test notification from the system';
//         break;
//       default:
//         title = '📢 New Notification';
//         message = 'You have a new notification';
//     }
    
//     // Create notification in database
//     const notificationData = {
//       type,
//       orderId: orderData._id || orderData.id,
//       orderNumber: orderData.orderNumber,
//       customerName: orderData.customerName,
//       customerPhone: orderData.customerPhone || orderData.phoneNumber,
//       totalAmount: orderData.totalAmount || orderData.totalPrice,
//       title,
//       message,
//       priority,
//       source,
//       status: 'delivered',
//       channel: 'dashboard',
//       metadata: {
//         test,
//         requestId,
//         originalData: orderData,
//         receivedAt: new Date().toISOString(),
//         sourceType: isBackendCall ? 'backend-api' : 'frontend-api'
//       },
//       deliveredAt: new Date()
//     };
    
//     const notification = await Notification.create(notificationData);
    
//     console.log(`✅ [${requestId}] Notification stored:`, {
//       id: notification._id,
//       type,
//       orderNumber: orderData.orderNumber,
//       storedBy: isBackendCall ? 'backend' : 'frontend'
//     });
    
//     // Return success response
//     return NextResponse.json({
//       success: true,
//       message: 'Notification received and stored',
//       notification: formatNotification(notification),
//       metadata: {
//         stored: true,
//         notificationId: notification._id,
//         timestamp: new Date().toISOString(),
//         requestId,
//         sourceType: isBackendCall ? 'backend' : 'frontend'
//       }
//     }, { status: 201 });
    
//   } catch (error) {
//     console.error(`❌ [${requestId}] Notification API error:`, {
//       error: error.message,
//       stack: error.stack,
//       timestamp: new Date().toISOString()
//     });
    
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to process notification',
//       message: error.message,
//       requestId,
//       metadata: {
//         timestamp: new Date().toISOString()
//       }
//     }, { status: 500 });
//   }
// }

// // GET - Fetch notifications (NO AUTH - for now)
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     // For now, skip authentication - you can add it back when ready
//     console.log('📋 Fetching notifications (no auth required)');
    
//     const { searchParams } = new URL(request.url);
//     const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const skip = (page - 1) * limit;
//     const type = searchParams.get('type');
//     const status = searchParams.get('status');
//     const priority = searchParams.get('priority');
//     const orderNumber = searchParams.get('orderNumber');
//     const search = searchParams.get('search');
    
//     console.log('📋 Fetching notifications with params:', {
//       type,
//       page,
//       limit,
//       search
//     });
    
//     // Build query
//     const query = {};
    
//     if (type && type !== 'all') {
//       query.type = type;
//     }
    
//     if (status && status !== 'all') query.status = status;
//     if (priority && priority !== 'all') query.priority = priority;
//     if (orderNumber) query.orderNumber = orderNumber;
    
//     if (search) {
//       query.$or = [
//         { orderNumber: { $regex: search, $options: 'i' } },
//         { customerName: { $regex: search, $options: 'i' } },
//         { message: { $regex: search, $options: 'i' } },
//         { title: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     // Date range filtering
//     const startDate = searchParams.get('startDate');
//     const endDate = searchParams.get('endDate');
    
//     if (startDate || endDate) {
//       query.createdAt = {};
//       if (startDate) {
//         query.createdAt.$gte = new Date(startDate);
//       }
//       if (endDate) {
//         query.createdAt.$lte = new Date(endDate);
//       }
//     }
    
//     // Sort by newest first by default
//     const sort = { createdAt: -1 };
    
//     // Get notifications and count
//     const [notifications, totalCount] = await Promise.all([
//       Notification.find(query)
//         .sort(sort)
//         .skip(skip)
//         .limit(limit)
//         .lean(),
      
//       Notification.countDocuments(query)
//     ]);
    
//     // Get statistics
//     const stats = await Notification.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: 1 },
//           unread: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           highPriority: {
//             $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
//           },
//           urgentPriority: {
//             $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
//           }
//         }
//       }
//     ]);
    
//     const statistics = stats[0] || {
//       total: 0,
//       unread: 0,
//       highPriority: 0,
//       urgentPriority: 0
//     };
    
//     // Calculate today's notifications
//     const today = new Date().toISOString().split('T')[0];
//     const todayCount = notifications.filter(n => 
//       new Date(n.createdAt).toISOString().split('T')[0] === today
//     ).length;
    
//     statistics.today = todayCount;
    
//     // Format notifications
//     const formattedNotifications = notifications.map(formatNotification);
    
//     return NextResponse.json({
//       success: true,
//       notifications: formattedNotifications,
//       pagination: {
//         page,
//         limit,
//         total: totalCount,
//         pages: Math.ceil(totalCount / limit)
//       },
//       statistics,
//       metadata: {
//         retrievedAt: new Date().toISOString(),
//         count: formattedNotifications.length,
//         filters: {
//           type: type || 'all',
//           status: status || 'all',
//           priority: priority || 'all'
//         }
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ GET notifications error:', error.message);
    
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to fetch notifications',
//       message: error.message
//     }, { status: 500 });
//   }
// }

// // PUT - Update notification (mark as read) - NO AUTH for now
// export async function PUT(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json({
//         success: false,
//         error: 'Missing ID',
//         message: 'Notification ID is required'
//       }, { status: 400 });
//     }
    
//     const body = await request.json();
//     const { status, markAsRead } = body;
    
//     const update = {};
    
//     if (status) {
//       update.status = status;
//       if (status === 'read') {
//         update.readAt = new Date();
//       }
//     }
    
//     if (markAsRead) {
//       update.status = 'read';
//       update.readAt = new Date();
//     }
    
//     if (Object.keys(update).length === 0) {
//       return NextResponse.json({
//         success: false,
//         error: 'No updates',
//         message: 'No update fields provided'
//       }, { status: 400 });
//     }
    
//     const notification = await Notification.findByIdAndUpdate(
//       id,
//       update,
//       { new: true }
//     ).lean();
    
//     if (!notification) {
//       return NextResponse.json({
//         success: false,
//         error: 'Not found',
//         message: 'Notification not found'
//       }, { status: 404 });
//     }
    
//     return NextResponse.json({
//       success: true,
//       message: 'Notification updated successfully',
//       notification: formatNotification(notification)
//     });
    
//   } catch (error) {
//     console.error('❌ PUT notification error:', error.message);
    
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to update notification',
//       message: error.message
//     }, { status: 500 });
//   }
// }

// // DELETE - Delete notification - NO AUTH for now
// export async function DELETE(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json({
//         success: false,
//         error: 'Missing ID',
//         message: 'Notification ID is required'
//       }, { status: 400 });
//     }
    
//     const notification = await Notification.findByIdAndDelete(id);
    
//     if (!notification) {
//       return NextResponse.json({
//         success: false,
//         error: 'Not found',
//         message: 'Notification not found'
//       }, { status: 404 });
//     }
    
//     return NextResponse.json({
//       success: true,
//       message: 'Notification deleted successfully',
//       id: notification._id
//     });
    
//   } catch (error) {
//     console.error('❌ DELETE notification error:', error.message);
    
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to delete notification',
//       message: error.message
//     }, { status: 500 });
//   }
// }

// // OPTIONS - CORS preflight
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
//     },
//   });
// }
















// app/api/notifications/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Notification from '@/models/Notification';
import Company from '@/models/Company';
import mongoose from 'mongoose'; 

// ========== HELPER FUNCTIONS ==========

// Check if user is admin
const isAdminUser = (userRole) => {
  return userRole && ['admin', 'superadmin', 'manager'].includes(userRole);
};

// Format notification for response (preserved from your original)
const formatNotification = (notification) => {
  return {
    id: notification._id.toString(),
    companyId: notification.companyId?.toString(),
    type: notification.type,
    orderNumber: notification.orderNumber,
    title: notification.title,
    message: notification.message,
    priority: notification.priority,
    status: notification.status,
    customerName: notification.customerName,
    totalAmount: notification.totalAmount,
    createdAt: notification.createdAt,
    timeSince: formatTimeSince(notification.createdAt),
    source: notification.source,
    readAt: notification.readAt,
    deliveredAt: notification.deliveredAt,
    // Additional fields from new model
    customerPhone: notification.customerPhone,
    customerEmail: notification.customerEmail,
    link: notification.link,
    actions: notification.actions,
    isRead: notification.status === 'read' || notification.readAt !== null,
    formattedAmount: notification.totalAmount ? 
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: notification.currency || 'INR'
      }).format(notification.totalAmount) : null
  };
};

// Format time since (preserved from your original)
const formatTimeSince = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
};

// Validate API key for backend calls (preserved from your original)
const isValidApiKey = (apiKey) => {
  if (!apiKey) return false;
  
  const validKeys = [
    process.env.NOTIFICATION_API_KEY,
    process.env.ADMIN_API_KEY,
    process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY,
    'dev-key-2024'
  ].filter(Boolean);
  
  return validKeys.includes(apiKey);
};

// Get user from request (simplified - you can replace with your actual auth)
const getUserFromRequest = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Implement your JWT verification here
      // For now, return a mock admin
      return {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin',
        companyId: request.headers.get('x-company-id')
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Get company ID from request (priority order: header > user > query)
const getCompanyIdFromRequest = async (request) => {
  try {
    // 1. Check header first (for API calls)
    const headerCompanyId = request.headers.get('x-company-id');
    if (headerCompanyId) {
      return headerCompanyId;
    }
    
    // 2. Check query parameter
    const { searchParams } = new URL(request.url);
    const queryCompanyId = searchParams.get('companyId');
    if (queryCompanyId) {
      return queryCompanyId;
    }
    
    // 3. Check from authenticated user
    const user = await getUserFromRequest(request);
    if (user?.companyId) {
      return user.companyId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting company ID:', error);
    return null;
  }
};

// Create notification title and message (preserved from your original)
const createNotificationContent = (type, orderData = {}) => {
  let title = '';
  let message = '';
  
  switch (type) {
    case 'NEW_ORDER':
      title = '🛍️ New Order Received';
      message = `Order #${orderData.orderNumber} from ${orderData.customerName || 'Customer'} for ₹${orderData.totalPrice || orderData.totalAmount || 0}`;
      break;
    case 'PAYMENT_RECEIVED':
      title = '💰 Payment Received';
      message = `Payment of ₹${orderData.amount || orderData.totalAmount} received for Order #${orderData.orderNumber}`;
      break;
    case 'PAYMENT_VERIFIED':
      title = '✅ Payment Verified';
      message = `Payment for Order #${orderData.orderNumber} has been verified`;
      break;
    case 'LOW_STOCK_ALERT':
      title = '📦 Low Stock Alert';
      message = `${orderData.productName || 'Product'} is running low (${orderData.stock || 0} left)`;
      break;
    case 'ORDER_STATUS_CHANGED':
      title = '📦 Order Status Updated';
      message = `Order #${orderData.orderNumber} is now ${orderData.newStatus || orderData.status}`;
      break;
    case 'TEST_NOTIFICATION':
      title = '🧪 Test Notification';
      message = 'This is a test notification from the system';
      break;
    case 'BOOKING_CONFIRMED':
      title = '📅 Booking Confirmed';
      message = `Booking #${orderData.bookingNumber} confirmed for ${orderData.customerName}`;
      break;
    case 'WHATSAPP_DISCONNECTED':
      title = '📱 WhatsApp Disconnected';
      message = 'WhatsApp connection has been disconnected. Please reconnect.';
      break;
    case 'SUBSCRIPTION_EXPIRING':
      title = '⚠️ Subscription Expiring Soon';
      message = `Your subscription will expire in ${orderData.days || 7} days`;
      break;
    default:
      title = '📢 New Notification';
      message = 'You have a new notification';
  }
  
  return { title, message };
};

// ========== POST - Receive notifications ==========
export async function POST(request) {
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`📥 [${requestId}] POST /api/notifications - Start processing`);
  
  try {
    await connectDB();
    
    // Check API key (for backend calls)
    const apiKey = request.headers.get('x-api-key') || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    let companyId = null;
    let userId = null;
    let isBackendCall = false;
    
    // If it's a backend call with API key
    if (apiKey && isValidApiKey(apiKey)) {
      console.log(`✅ [${requestId}] Backend API key validated`);
      isBackendCall = true;
      
      // Get company ID from header for backend calls
      companyId = request.headers.get('x-company-id');
      if (!companyId) {
        return NextResponse.json({
          success: false,
          error: 'Missing company ID',
          message: 'x-company-id header is required for backend calls',
          requestId
        }, { status: 400 });
      }
    } else {
      // For frontend calls, get from user/auth
      const user = await getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          requestId
        }, { status: 401 });
      }
      
      companyId = user.companyId;
      userId = user.id;
      
      if (!companyId) {
        return NextResponse.json({
          success: false,
          error: 'Company ID required',
          message: 'Company identification is required',
          requestId
        }, { status: 400 });
      }
    }
    
    // Verify company exists and is active
    const company = await Company.findOne({ 
      _id: companyId, 
      status: 'active',
      deletedAt: null 
    });
    
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Invalid company',
        message: 'Company not found or inactive',
        requestId
      }, { status: 404 });
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error(`❌ [${requestId}] Invalid JSON:`, error.message);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
        requestId
      }, { status: 400 });
    }
    
    const { 
      type, 
      data = {}, 
      order, 
      priority = 'normal',
      source = 'whatsapp-bot',
      channel = 'dashboard',
      test = false,
      metadata = {}
    } = body;
    
    console.log(`📝 [${requestId}] Received notification:`, {
      companyId,
      type,
      orderNumber: data.orderNumber || order?.orderNumber,
      source
    });
    
    // Validate required fields
    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Missing type',
        message: 'Notification type is required',
        requestId
      }, { status: 400 });
    }
    
    // Extract order data (support both 'data' and 'order' for backward compatibility)
    const orderData = data || order || {};
    
    // Create notification content
    const { title, message } = createNotificationContent(type, orderData);
    
    // Prepare actions based on type
    let actions = [];
    let link = null;
    
    if (orderData._id || orderData.id) {
      const orderId = orderData._id || orderData.id;
      link = {
        to: `/orders/${orderId}`,
        text: 'View Order'
      };
      
      actions = [
        {
          label: 'View Order',
          url: `/orders/${orderId}`,
          method: 'GET',
          primary: true
        }
      ];
      
      if (type === 'NEW_ORDER') {
        actions.push({
          label: 'Process Order',
          url: `/api/orders/${orderId}/process`,
          method: 'POST',
          primary: false
        });
      }
    }
    
    // Create notification in database with companyId
    const notificationData = {
      companyId,
      type,
      orderId: orderData._id || orderData.id,
      orderNumber: orderData.orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone || orderData.phoneNumber,
      customerEmail: orderData.customerEmail,
      totalAmount: orderData.totalAmount || orderData.totalPrice,
      currency: orderData.currency || 'INR',
      title,
      message,
      priority,
      source,
      channel,
      status: 'delivered',
      actions,
      link,
      metadata: {
        ...metadata,
        test,
        requestId,
        originalData: orderData,
        receivedAt: new Date().toISOString(),
        sourceType: isBackendCall ? 'backend-api' : 'frontend-api'
      },
      createdBy: userId,
      createdVia: isBackendCall ? 'api' : 'dashboard',
      deliveredAt: new Date()
    };
    
    const notification = await Notification.create(notificationData);
    
    console.log(`✅ [${requestId}] Notification stored:`, {
      id: notification._id,
      companyId,
      type,
      orderNumber: orderData.orderNumber
    });
    
    // Return success response (matching your original format)
    return NextResponse.json({
      success: true,
      message: 'Notification received and stored',
      notification: formatNotification(notification),
      metadata: {
        stored: true,
        notificationId: notification._id,
        timestamp: new Date().toISOString(),
        requestId,
        sourceType: isBackendCall ? 'backend' : 'frontend'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error(`❌ [${requestId}] Notification API error:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process notification',
      message: error.message,
      requestId,
      metadata: {
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// ========== GET - Fetch notifications with server-side pagination ==========
export async function GET(request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    await connectDB();
    
    // Get company ID from request
    const companyId = await getCompanyIdFromRequest(request);
    
    // For now, if no company ID, return error (you can adjust based on your auth)
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID required',
        message: 'Company identification is required',
        requestId
      }, { status: 401 });
    }
    
    console.log(`📋 [${requestId}] Fetching notifications for company: ${companyId}`);
    
    const { searchParams } = new URL(request.url);
    
    // ===== PAGINATION PARAMETERS =====
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(100, parseInt(searchParams.get('limit')) || 50);
    const skip = (page - 1) * limit;
    
    // ===== FILTER PARAMETERS =====
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const orderNumber = searchParams.get('orderNumber');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    // ===== DATE RANGE PARAMETERS =====
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // ===== SORTING PARAMETERS =====
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // ===== INCLUDE SOFT DELETED? =====
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    
    console.log('📋 Fetching with params:', {
      page,
      limit,
      type,
      status,
      priority,
      search,
      unreadOnly
    });
    
    // Build query with company isolation
    const query = { 
      companyId,
      ...(includeDeleted ? {} : { isDeleted: false })
    };
    
    // Apply filters
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (source && source !== 'all') {
      query.source = source;
    }
    
    if (orderNumber) {
      query.orderNumber = orderNumber;
    }
    
    if (unreadOnly) {
      query.status = { $nin: ['read', 'failed'] };
    }
    
    // Search functionality (preserved from your original)
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }
    
    // Build sort object
    const sort = { [sortBy]: sortOrder };
    // Always add secondary sort for consistency
    if (sortBy !== 'createdAt') {
      sort.createdAt = -1;
    }
    
    // Execute queries in parallel for better performance
    const [notifications, totalCount, unreadCount, stats] = await Promise.all([
      Notification.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('customerId', 'name email phone')
        .populate('orderId', 'orderNumber totalAmount')
        .lean(),
      
      Notification.countDocuments(query),
      
      Notification.countDocuments({ 
        companyId, 
        status: { $nin: ['read', 'failed'] },
        isDeleted: false 
      }),
      
      // Get quick stats
      Notification.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId), isDeleted: false } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $in: ['$status', ['pending', 'sent', 'delivered']] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }}
      ])
    ]);
    
    // Format notifications
    const formattedNotifications = notifications.map(formatNotification);
    
    // Calculate statistics (preserved from your original)
    const statistics = stats[0] || {
      total: 0,
      unread: 0,
      urgent: 0,
      high: 0
    };
    
    // Calculate today's notifications
    const today = new Date().toISOString().split('T')[0];
    const todayCount = formattedNotifications.filter(n => 
      new Date(n.createdAt).toISOString().split('T')[0] === today
    ).length;
    
    statistics.today = todayCount;
    statistics.unreadCount = unreadCount;
    
    // Return response matching your original format
    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      },
      statistics,
      metadata: {
        retrievedAt: new Date().toISOString(),
        count: formattedNotifications.length,
        requestId,
        filters: {
          type: type || 'all',
          status: status || 'all',
          priority: priority || 'all',
          source: source || 'all',
          search: search || null,
          unreadOnly,
          dateRange: startDate || endDate ? { startDate, endDate } : null
        }
      }
    });
    
  } catch (error) {
    console.error(`❌ [${requestId}] GET notifications error:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message,
      requestId
    }, { status: 500 });
  }
}

// ========== PUT - Update notification ==========
export async function PUT(request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    await connectDB();
    
    // Get authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        requestId
      }, { status: 401 });
    }
    
    const companyId = user.companyId;
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID required',
        message: 'Company identification is required',
        requestId
      }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing ID',
        message: 'Notification ID is required',
        requestId
      }, { status: 400 });
    }
    
    const body = await request.json();
    const { status, markAsRead, actionTaken, actionType } = body;
    
    const update = {};
    const set = {};
    
    // Handle status updates
    if (status) {
      set.status = status;
      if (status === 'read') {
        set.readAt = new Date();
        set.readBy = user.id;
        
        // Add to readByUsers array
        update.$push = {
          readByUsers: { user: user.id, readAt: new Date() }
        };
      }
    }
    
    // Handle mark as read
    if (markAsRead) {
      set.status = 'read';
      set.readAt = new Date();
      set.readBy = user.id;
      
      update.$push = {
        readByUsers: { user: user.id, readAt: new Date() }
      };
    }
    
    // Handle action taken
    if (actionTaken) {
      set.actionTaken = true;
      set.actionBy = user.id;
      set.actionAt = new Date();
      if (actionType) set.actionType = actionType;
    }
    
    // Add audit fields
    set.updatedBy = user.id;
    set.updatedVia = 'dashboard';
    set.updatedAt = new Date();
    
    update.$set = set;
    
    if (Object.keys(update).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No updates',
        message: 'No update fields provided',
        requestId
      }, { status: 400 });
    }
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, companyId, isDeleted: false },
      update,
      { new: true }
    ).lean();
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Notification not found',
        requestId
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      notification: formatNotification(notification),
      requestId
    });
    
  } catch (error) {
    console.error(`❌ [${requestId}] PUT notification error:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification',
      message: error.message,
      requestId
    }, { status: 500 });
  }
}

// ========== PATCH - Bulk update notifications ==========
export async function PATCH(request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    await connectDB();
    
    // Get authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        requestId
      }, { status: 401 });
    }
    
    const companyId = user.companyId;
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID required',
        message: 'Company identification is required',
        requestId
      }, { status: 400 });
    }
    
    const body = await request.json();
    const { action, notificationIds, markAllAsRead } = body;
    
    let result;
    
    // Mark all as read
    if (markAllAsRead) {
      result = await Notification.updateMany(
        {
          companyId,
          'readByUsers.user': { $ne: user.id },
          status: { $ne: 'read' },
          isDeleted: false
        },
        {
          $push: { readByUsers: { user: user.id, readAt: new Date() } },
          $set: {
            status: 'read',
            readAt: new Date(),
            readBy: user.id,
            updatedBy: user.id,
            updatedVia: 'dashboard',
            updatedAt: new Date()
          }
        }
      );
      
      return NextResponse.json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
        modifiedCount: result.modifiedCount,
        requestId
      });
    }
    
    // Bulk action on specific notifications
    if (action && notificationIds && notificationIds.length > 0) {
      if (action === 'markAsRead') {
        result = await Notification.updateMany(
          {
            _id: { $in: notificationIds },
            companyId,
            isDeleted: false
          },
          {
            $push: { readByUsers: { user: user.id, readAt: new Date() } },
            $set: {
              status: 'read',
              readAt: new Date(),
              readBy: user.id,
              updatedBy: user.id,
              updatedVia: 'dashboard',
              updatedAt: new Date()
            }
          }
        );
        
        return NextResponse.json({
          success: true,
          message: `Marked ${result.modifiedCount} notifications as read`,
          modifiedCount: result.modifiedCount,
          requestId
        });
      }
      
      if (action === 'delete') {
        result = await Notification.updateMany(
          {
            _id: { $in: notificationIds },
            companyId
          },
          {
            $set: {
              deletedAt: new Date(),
              deletedBy: user.id,
              deletedVia: 'dashboard',
              isDeleted: true,
              updatedBy: user.id,
              updatedVia: 'dashboard',
              updatedAt: new Date()
            }
          }
        );
        
        return NextResponse.json({
          success: true,
          message: `Deleted ${result.modifiedCount} notifications`,
          modifiedCount: result.modifiedCount,
          requestId
        });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action',
      message: 'Please provide valid action and notification IDs',
      requestId
    }, { status: 400 });
    
  } catch (error) {
    console.error(`❌ [${requestId}] PATCH notification error:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update notifications',
      message: error.message,
      requestId
    }, { status: 500 });
  }
}

// ========== DELETE - Soft delete notification ==========
export async function DELETE(request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    await connectDB();
    
    // Get authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        requestId
      }, { status: 401 });
    }
    
    const companyId = user.companyId;
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID required',
        message: 'Company identification is required',
        requestId
      }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing ID',
        message: 'Notification ID is required',
        requestId
      }, { status: 400 });
    }
    
    let notification;
    
    if (permanent) {
      // Permanent delete (only for admins maybe)
      if (!isAdminUser(user.role)) {
        return NextResponse.json({
          success: false,
          error: 'Forbidden',
          message: 'Admin access required for permanent deletion',
          requestId
        }, { status: 403 });
      }
      
      notification = await Notification.findOneAndDelete({
        _id: id,
        companyId
      });
    } else {
      // Soft delete
      notification = await Notification.findOneAndUpdate(
        { _id: id, companyId, isDeleted: false },
        {
          $set: {
            deletedAt: new Date(),
            deletedBy: user.id,
            deletedVia: 'dashboard',
            isDeleted: true,
            updatedBy: user.id,
            updatedVia: 'dashboard',
            updatedAt: new Date()
          }
        },
        { new: true }
      );
    }
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Notification not found',
        requestId
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: permanent ? 'Notification permanently deleted' : 'Notification moved to trash',
      id: notification._id,
      requestId
    });
    
  } catch (error) {
    console.error(`❌ [${requestId}] DELETE notification error:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message,
      requestId
    }, { status: 500 });
  }
}

// ========== OPTIONS - CORS preflight ==========
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-company-id',
      'Access-Control-Max-Age': '86400',
    },
  });
}