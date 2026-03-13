// app/api/notifications/route.js - FIXED WITHOUT NextAuth
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// ========== DATABASE CONNECTION ==========
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.FRONTEND_DB_NAME || 'adghwrtu419_db',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected for notifications');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// ========== NOTIFICATION SCHEMA ==========
const notificationSchema = new mongoose.Schema({
  // Basic info
  type: {
    type: String,
    required: true,
    enum: [
      'NEW_ORDER',
      'PAYMENT_RECEIVED', 
      'PAYMENT_VERIFIED',
      'LOW_STOCK_ALERT',
      'ORDER_STATUS_CHANGED',
      'SYSTEM_ALERT',
      'ADMIN_ALERT',
      
    ]
  },
  
  // Order info
  orderId: String,
  orderNumber: String,
  customerName: String,
  customerPhone: String,
  totalAmount: Number,
  
  // Notification content
  title: String,
  message: String,
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  
  // Source info
  source: {
    type: String,
    default: 'whatsapp-bot'
  },
  channel: {
    type: String,
    enum: ['dashboard', 'push', 'whatsapp', 'email'],
    default: 'dashboard'
  },
  
  // Metadata
  metadata: {
    type: Object,
    default: {}
  },
  
  // Timestamps
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  
  // Error handling
  error: String,
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Create or get model
const Notification = mongoose.models.Notification || 
  mongoose.model('Notification', notificationSchema);

// ========== HELPER FUNCTIONS ==========

// Check if user is admin (for internal use)
const isAdminUser = (userRole) => {
  return userRole && ['admin', 'superadmin', 'manager'].includes(userRole);
};

// Format notification for response
const formatNotification = (notification) => {
  return {
    id: notification._id.toString(),
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
    source: notification.source
  };
};

const formatTimeSince = (date) => {
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

// Validate API key for backend calls
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

// ========== GET USER FROM REQUEST ==========
const getUserFromRequest = async (request) => {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Parse the token (in your case, you might want to validate JWT)
      const token = authHeader.substring(7);
      
      // For now, accept any token (you should validate it properly)
      // You can implement JWT verification here
      return {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin'
      };
    }
    
    // Try to get from cookies or session (simplified)
    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
};

// ========== API ENDPOINTS ==========

// POST - Receive notifications from backend (ALLOWS API KEY AUTH)
export async function POST(request) {
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`📥 [${requestId}] POST /api/notifications - Start processing`);
  
  try {
    await connectDB();
    
    // Check API key (for backend calls)
    const apiKey = request.headers.get('x-api-key') || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    // ✅ Allow backend calls with API key, frontend requires admin session
    let isBackendCall = false;
    
    if (apiKey && isValidApiKey(apiKey)) {
      console.log(`✅ [${requestId}] Backend API key validated - allowing access`);
      isBackendCall = true;
    } else {
      // For frontend calls, require admin user from auth header
      const user = await getUserFromRequest(request);
      if (!user || !isAdminUser(user.role)) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized',
          message: 'Admin access required or valid API key needed',
          requestId
        }, { status: 401 });
      }
      console.log(`✅ [${requestId}] Admin user authenticated: ${user.email}`);
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
      test = false
    } = body;
    
    console.log(`📝 [${requestId}] Received notification:`, {
      type,
      orderNumber: data.orderNumber || order?.orderNumber,
      source,
      from: isBackendCall ? 'backend' : 'frontend'
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
    
    // Extract order data
    const orderData = data || order || {};
    
    // Create notification title and message
    let title = '';
    let message = '';
    
    switch (type) {
      case 'NEW_ORDER':
        title = '🛍️ New Order Received';
        message = `Order #${orderData.orderNumber} from ${orderData.customerName || 'Customer'} for ₹${orderData.totalPrice || orderData.totalAmount || 0}`;
        break;
      case 'PAYMENT_RECEIVED':
        title = '💰 Payment Received';
        message = `Payment of ₹${orderData.amount} received for Order #${orderData.orderNumber}`;
        break;
      case 'PAYMENT_VERIFIED':
        title = '✅ Payment Verified';
        message = `Payment for Order #${orderData.orderNumber} has been verified`;
        break;
      case 'LOW_STOCK_ALERT':
        title = '📦 Low Stock Alert';
        message = `${orderData.productName} is running low (${orderData.stock} left)`;
        break;
      case 'ORDER_STATUS_CHANGED':
        title = '📦 Order Status Updated';
        message = `Order #${orderData.orderNumber} is now ${orderData.newStatus}`;
        break;
      case 'TEST_NOTIFICATION':
        title = '🧪 Test Notification';
        message = 'This is a test notification from the system';
        break;
      default:
        title = '📢 New Notification';
        message = 'You have a new notification';
    }
    
    // Create notification in database
    const notificationData = {
      type,
      orderId: orderData._id || orderData.id,
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone || orderData.phoneNumber,
      totalAmount: orderData.totalAmount || orderData.totalPrice,
      title,
      message,
      priority,
      source,
      status: 'delivered',
      channel: 'dashboard',
      metadata: {
        test,
        requestId,
        originalData: orderData,
        receivedAt: new Date().toISOString(),
        sourceType: isBackendCall ? 'backend-api' : 'frontend-api'
      },
      deliveredAt: new Date()
    };
    
    const notification = await Notification.create(notificationData);
    
    console.log(`✅ [${requestId}] Notification stored:`, {
      id: notification._id,
      type,
      orderNumber: orderData.orderNumber,
      storedBy: isBackendCall ? 'backend' : 'frontend'
    });
    
    // Return success response
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

// GET - Fetch notifications (NO AUTH - for now)
export async function GET(request) {
  try {
    await connectDB();
    
    // For now, skip authentication - you can add it back when ready
    console.log('📋 Fetching notifications (no auth required)');
    
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const orderNumber = searchParams.get('orderNumber');
    const search = searchParams.get('search');
    
    console.log('📋 Fetching notifications with params:', {
      type,
      page,
      limit,
      search
    });
    
    // Build query
    const query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (orderNumber) query.orderNumber = orderNumber;
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filtering
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Sort by newest first by default
    const sort = { createdAt: -1 };
    
    // Get notifications and count
    const [notifications, totalCount] = await Promise.all([
      Notification.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Notification.countDocuments(query)
    ]);
    
    // Get statistics
    const stats = await Notification.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          urgentPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const statistics = stats[0] || {
      total: 0,
      unread: 0,
      highPriority: 0,
      urgentPriority: 0
    };
    
    // Calculate today's notifications
    const today = new Date().toISOString().split('T')[0];
    const todayCount = notifications.filter(n => 
      new Date(n.createdAt).toISOString().split('T')[0] === today
    ).length;
    
    statistics.today = todayCount;
    
    // Format notifications
    const formattedNotifications = notifications.map(formatNotification);
    
    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      statistics,
      metadata: {
        retrievedAt: new Date().toISOString(),
        count: formattedNotifications.length,
        filters: {
          type: type || 'all',
          status: status || 'all',
          priority: priority || 'all'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ GET notifications error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message
    }, { status: 500 });
  }
}

// PUT - Update notification (mark as read) - NO AUTH for now
export async function PUT(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing ID',
        message: 'Notification ID is required'
      }, { status: 400 });
    }
    
    const body = await request.json();
    const { status, markAsRead } = body;
    
    const update = {};
    
    if (status) {
      update.status = status;
      if (status === 'read') {
        update.readAt = new Date();
      }
    }
    
    if (markAsRead) {
      update.status = 'read';
      update.readAt = new Date();
    }
    
    if (Object.keys(update).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No updates',
        message: 'No update fields provided'
      }, { status: 400 });
    }
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).lean();
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Notification not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      notification: formatNotification(notification)
    });
    
  } catch (error) {
    console.error('❌ PUT notification error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification',
      message: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete notification - NO AUTH for now
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing ID',
        message: 'Notification ID is required'
      }, { status: 400 });
    }
    
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Notification not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
      id: notification._id
    });
    
  } catch (error) {
    console.error('❌ DELETE notification error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message
    }, { status: 500 });
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  });
}





// // app/api/notifications/route.js - FIXED VERSION (Option 1)
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/nextauth/route';
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
//       'TEST_NOTIFICATION'
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

// // Check if user is admin
// const isAdminUser = (session) => {
//   return session && session.user && 
//          ['admin', 'superadmin', 'manager'].includes(session.user.role);
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
    
//     // ✅ OPTION 1 IMPLEMENTED: Allow backend calls with API key, frontend requires admin session
//     let isBackendCall = false;
    
//     if (apiKey && isValidApiKey(apiKey)) {
//       console.log(`✅ [${requestId}] Backend API key validated - allowing access`);
//       isBackendCall = true;
//     } else {
//       // For frontend calls, require admin session
//       const session = await getServerSession(authOptions);
//       if (!session || !isAdminUser(session)) {
//         return NextResponse.json({
//           success: false,
//           error: 'Unauthorized',
//           message: 'Admin access required or valid API key needed',
//           requestId
//         }, { status: 401 });
//       }
//       console.log(`✅ [${requestId}] Admin user authenticated: ${session.user.email}`);
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

// // GET - Fetch notifications (for admin dashboard - REQUIRES ADMIN)
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     // Check authentication for admin access
//     const session = await getServerSession(authOptions);
    
//     if (!session || !isAdminUser(session)) {
//       return NextResponse.json({
//         success: false,
//         error: 'Unauthorized',
//         message: 'Admin access required to view notifications'
//       }, { status: 401 });
//     }
    
//     const { searchParams } = new URL(request.url);
//     const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const skip = (page - 1) * limit;
//     const type = searchParams.get('type');
//     const status = searchParams.get('status');
//     const priority = searchParams.get('priority');
//     const orderNumber = searchParams.get('orderNumber');
//     const search = searchParams.get('search');
    
//     console.log('📋 Admin fetching notifications:', {
//       user: session.user.email,
//       type,
//       page,
//       limit
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
    
//     // Format notifications
//     const formattedNotifications = notifications.map(formatNotification);
    
//     return NextResponse.json({
//       success: true,
//       user: {
//         email: session.user.email,
//         role: session.user.role,
//         name: session.user.name
//       },
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

// // PUT - Update notification (mark as read) - REQUIRES ADMIN
// export async function PUT(request) {
//   try {
//     await connectDB();
    
//     const session = await getServerSession();
    
//     if (!session || !isAdminUser(session)) {
//       return NextResponse.json({
//         success: false,
//         error: 'Unauthorized',
//         message: 'Admin access required'
//       }, { status: 401 });
//     }
    
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

// // DELETE - Delete notification - REQUIRES ADMIN
// export async function DELETE(request) {
//   try {
//     await connectDB();
    
//     const session = await getServerSession(authOptions);
    
//     if (!session || !isAdminUser(session)) {
//       return NextResponse.json({
//         success: false,
//         error: 'Unauthorized',
//         message: 'Admin access required'
//       }, { status: 401 });
//     }
    
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