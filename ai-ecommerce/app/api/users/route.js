// // app/api/users/route.js
// import { connectDB } from '@/utils/db';
// import User from '@/models/user';
// import { verifyToken } from '@/utils/jwt';
// import mongoose from 'mongoose';
// import { NextResponse } from 'next/server';

// // App Router Config
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
// export const maxDuration = 30;
// export const revalidate = 0;

// // Authentication helper
// const authenticate = async (headers) => {
//   try {
//     const authHeader = headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return { success: false, error: 'No token provided', status: 401 };
//     }
    
//     const token = authHeader.split(' ')[1];
//     const decoded = verifyToken(token);
    
//     if (!decoded) {
//       return { success: false, error: 'Invalid token', status: 401 };
//     }
    
//     const user = await User.findById(decoded.userId || decoded.id)
//       .select('_id role status fullName email');
    
//     if (!user) {
//       return { success: false, error: 'User not found', status: 401 };
//     }
    
//     if (user.status !== 'active') {
//       return { success: false, error: 'Account is not active', status: 403 };
//     }
    
//     return { success: true, user };
//   } catch (error) {
//     return { success: false, error: 'Authentication failed', status: 401 };
//   }
// };

// // Check if user is admin
// const isAdmin = (user) => user && user.role === 'admin';
// const isSelf = (userId, authUser) => authUser && authUser._id.toString() === userId;

// // Response formatter
// const formatUser = (userData, includeSensitive = false) => {
//   const user = userData.toObject ? userData.toObject() : userData;
  
//   // Always remove sensitive fields
//   delete user.password;
//   delete user.resetPasswordToken;
//   delete user.resetPasswordExpires;
//   delete user.verificationToken;
  
//   // Conditionally remove sensitive info
//   if (!includeSensitive) {
//     delete user.activeSessions;
//     delete user.lastLoginIp;
//   }
  
//   // Add computed fields
//   user.isAdmin = user.role === 'admin';
//   user.notificationsEnabled = user.notificationSettings?.pushNotifications?.enabled || false;
//   user.activeSessionsCount = user.activeSessions?.filter(s => s.status === 'active').length || 0;
  
//   return user;
// };

// // ==================== GET HANDLER ====================
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     const role = searchParams.get('role');
//     const search = searchParams.get('search') || '';
//     const status = searchParams.get('status') || 'active';
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const sortBy = searchParams.get('sortBy') || 'createdAt';
//     const sortOrder = searchParams.get('sortOrder') || 'desc';
//     const startDate = searchParams.get('startDate');
//     const endDate = searchParams.get('endDate');
    
//     // Authenticate
//     const auth = await authenticate(request.headers);
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.error },
//         { status: auth.status }
//       );
//     }
    
//     const { user: authUser } = auth;
    
//     // Handle single user request
//     if (id) {
//       return await handleGetSingleUser(id, authUser);
//     }
    
//     // Handle admins request
//     if (searchParams.get('admins') === 'active') {
//       return await handleGetActiveAdmins(authUser);
//     }
    
//     // Handle list request
//     return await handleGetUsersList({
//       authUser,
//       page,
//       limit,
//       search,
//       role,
//       status,
//       sortBy,
//       sortOrder,
//       startDate,
//       endDate
//     });
    
//   } catch (error) {
//     console.error('GET /api/users error:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Server error',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

// // Get single user
// async function handleGetSingleUser(userId, authUser) {
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return NextResponse.json(
//       { success: false, message: 'Invalid user ID' },
//       { status: 400 }
//     );
//   }
  
//   // Check permissions - only admins or self can view
//   if (!isAdmin(authUser) && !isSelf(userId, authUser)) {
//     return NextResponse.json(
//       { success: false, message: 'Access denied' },
//       { status: 403 }
//     );
//   }
  
//   const user = await User.findById(userId)
//     .select('-password -resetPasswordToken -verificationToken');
  
//   if (!user || user.status === 'deleted') {
//     return NextResponse.json(
//       { success: false, message: 'User not found' },
//       { status: 404 }
//     );
//   }
  
//   const includeSensitive = isAdmin(authUser) || isSelf(userId, authUser);
  
//   return NextResponse.json({
//     success: true,
//     data: {
//       user: formatUser(user, includeSensitive)
//     }
//   });
// }

// // Get active admins
// async function handleGetActiveAdmins(authUser) {
//   if (!isAdmin(authUser)) {
//     return NextResponse.json(
//       { success: false, message: 'Admin access required' },
//       { status: 403 }
//     );
//   }
  
//   const admins = await User.find({
//     role: 'admin',
//     status: 'active',
//     'notificationSettings.pushNotifications.enabled': true
//   })
//   .select('fullName email phone notificationSettings adminPreferences')
//   .lean();
  
//   return NextResponse.json({
//     success: true,
//     data: {
//       admins: admins.map(admin => formatUser(admin)),
//       count: admins.length
//     }
//   });
// }

// // Get users list with filters
// async function handleGetUsersList(params) {
//   const {
//     authUser,
//     page,
//     limit,
//     search,
//     role,
//     status,
//     sortBy,
//     sortOrder,
//     startDate,
//     endDate
//   } = params;
  
//   // Build query
//   const filter = {};
  
//   // Status filter
//   if (status === 'all') {
//     filter.status = { $ne: 'deleted' };
//   } else {
//     filter.status = status;
//   }
  
//   // Role filter - only admins can see all, regular users only see themselves
//   if (role) {
//     filter.role = role;
//   } else if (!isAdmin(authUser)) {
//     // Non-admins can only see themselves
//     filter._id = authUser._id;
//   }
  
//   // Search filter
//   if (search) {
//     const searchRegex = new RegExp(search, 'i');
//     filter.$or = [
//       { fullName: searchRegex },
//       { email: searchRegex },
//       { phone: searchRegex }
//     ];
//   }
  
//   // Date range filter
//   if (startDate || endDate) {
//     filter.createdAt = {};
//     if (startDate) filter.createdAt.$gte = new Date(startDate);
//     if (endDate) filter.createdAt.$lte = new Date(endDate);
//   }
  
//   // Pagination
//   const pageNum = Math.max(1, page);
//   const limitNum = Math.min(100, Math.max(1, limit));
//   const skip = (pageNum - 1) * limitNum;
//   const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
//   // Execute queries
//   const [users, total] = await Promise.all([
//     User.find(filter)
//       .select('-password -resetPasswordToken -verificationToken')
//       .sort(sort)
//       .skip(skip)
//       .limit(limitNum)
//       .lean(),
//     User.countDocuments(filter)
//   ]);
  
//   // Format response
//   const includeSensitive = isAdmin(authUser);
//   const formattedUsers = users.map(user => formatUser(user, includeSensitive));
  
//   return NextResponse.json({
//     success: true,
//     data: {
//       users: formattedUsers,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum)
//       }
//     }
//   });
// }

// // ==================== POST HANDLER ====================
// export async function POST(request) {
//   try {
//     await connectDB();
    
//     // Parse request body
//     const body = await request.json();
//     const { fullName, email, phone, password, role = 'admin' } = body;
    
//     // Validate required fields
//     if (!fullName || !email || !phone || !password) {
//       return NextResponse.json(
//         { success: false, message: 'Missing required fields' },
//         { status: 400 }
//       );
//     }
    
//     // Validate email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email format' },
//         { status: 400 }
//       );
//     }
    
//     // Validate phone
//     const phoneRegex = /^\d{10,15}$/;
//     if (!phoneRegex.test(phone)) {
//       return NextResponse.json(
//         { success: false, message: 'Phone must be 10-15 digits' },
//         { status: 400 }
//       );
//     }
    
//     // Validate password
//     if (password.length < 6) {
//       return NextResponse.json(
//         { success: false, message: 'Password must be at least 6 characters' },
//         { status: 400 }
//       );
//     }
    
//     // Validate role - only admin is allowed
//     if (role !== 'admin') {
//       return NextResponse.json(
//         { success: false, message: 'Role must be admin' },
//         { status: 400 }
//       );
//     }
    
//     // Check if creating admin (requires existing admin privileges)
//     const auth = await authenticate(request.headers);
//     if (!auth.success || !isAdmin(auth.user)) {
//       return NextResponse.json(
//         { success: false, message: 'Admin privileges required to create users' },
//         { status: 403 }
//       );
//     }
    
//     // Check for existing user
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }]
//     });
    
//     if (existingUser) {
//       const field = existingUser.email === email ? 'email' : 'phone';
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: 'User already exists',
//           field
//         },
//         { status: 409 }
//       );
//     }
    
//     // Create user
//     const user = await User.create({
//       fullName,
//       email,
//       phone,
//       password,
//       role: 'admin', // Only admin role allowed
//       status: 'active',
//       notificationSettings: {
//         pushNotifications: { enabled: true },
//         notificationTypes: {
//           newOrders: { enabled: true, priority: 'high', sound: true },
//           payments: { enabled: true, priority: 'high', sound: true },
//           lowStock: { enabled: true, priority: 'normal', sound: true },
//           systemAlerts: { enabled: true, priority: 'high', sound: true },
//           orderUpdates: { enabled: true, priority: 'normal', sound: true }
//         }
//       },
//       adminPreferences: {
//         dashboardLayout: 'default',
//         defaultView: 'orders',
//         refreshInterval: 30000,
//         theme: 'light'
//       },
//       createdBy: auth.user._id
//     });
    
//     return NextResponse.json({
//       success: true,
//       message: 'Admin user created successfully',
//       data: {
//         user: formatUser(user)
//       }
//     }, { status: 201 });
    
//   } catch (error) {
//     console.error('POST /api/users error:', error);
    
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { success: false, message: 'Duplicate field value' },
//         { status: 409 }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to create user',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

// // ==================== PUT HANDLER ====================
// export async function PUT(request) {
//   try {
//     await connectDB();
    
//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'User ID is required' },
//         { status: 400 }
//       );
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid user ID' },
//         { status: 400 }
//       );
//     }
    
//     // Parse request body
//     const updateData = await request.json();
    
//     // Authenticate
//     const auth = await authenticate(request.headers);
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.error },
//         { status: auth.status }
//       );
//     }
    
//     const { user: authUser } = auth;
    
//     // Check permissions
//     const canUpdate = isAdmin(authUser) || isSelf(id, authUser);
//     if (!canUpdate) {
//       return NextResponse.json(
//         { success: false, message: 'Access denied' },
//         { status: 403 }
//       );
//     }
    
//     // Non-admins cannot update role or status
//     if (!isAdmin(authUser)) {
//       delete updateData.role;
//       delete updateData.status;
//     }
    
//     const user = await User.findById(id);
//     if (!user || user.status === 'deleted') {
//       return NextResponse.json(
//         { success: false, message: 'User not found' },
//         { status: 404 }
//       );
//     }
    
//     // Check for duplicate email/phone
//     if (updateData.email || updateData.phone) {
//       const duplicateQuery = { _id: { $ne: id } };
//       if (updateData.email) duplicateQuery.email = updateData.email;
//       if (updateData.phone) duplicateQuery.phone = updateData.phone;
      
//       const existingUser = await User.findOne(duplicateQuery);
//       if (existingUser) {
//         return NextResponse.json(
//           { success: false, message: 'Email or phone already in use' },
//           { status: 409 }
//         );
//       }
//     }
    
//     // Update notification settings if provided
//     if (updateData.notificationSettings) {
//       user.updateNotificationSettings(updateData.notificationSettings);
//       delete updateData.notificationSettings;
//     }
    
//     // Update user fields
//     Object.keys(updateData).forEach(key => {
//       if (key !== 'password' && user[key] !== undefined) {
//         user[key] = updateData[key];
//       }
//     });
    
//     // Handle password update
//     if (updateData.password) {
//       user.password = updateData.password;
//     }
    
//     user.updatedBy = authUser._id;
//     await user.save();
    
//     return NextResponse.json({
//       success: true,
//       message: 'User updated successfully',
//       data: {
//         user: formatUser(user, true)
//       }
//     });
    
//   } catch (error) {
//     console.error('PUT /api/users error:', error);
    
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { success: false, message: 'Duplicate field value' },
//         { status: 409 }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to update user',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

// // ==================== DELETE HANDLER ====================
// export async function DELETE(request) {
//   try {
//     await connectDB();
    
//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'User ID is required' },
//         { status: 400 }
//       );
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid user ID' },
//         { status: 400 }
//       );
//     }
    
//     // Parse request body for permanent option
//     const body = await request.json().catch(() => ({}));
//     const { permanent = false } = body;
    
//     // Authenticate
//     const auth = await authenticate(request.headers);
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.error },
//         { status: auth.status }
//       );
//     }
    
//     const { user: authUser } = auth;
    
//     // Check permissions
//     const canDelete = isAdmin(authUser) || isSelf(id, authUser);
//     if (!canDelete) {
//       return NextResponse.json(
//         { success: false, message: 'Access denied' },
//         { status: 403 }
//       );
//     }
    
//     // Admins can permanently delete, users can only soft delete themselves
//     if (permanent && !isAdmin(authUser)) {
//       return NextResponse.json(
//         { success: false, message: 'Admin privileges required for permanent deletion' },
//         { status: 403 }
//       );
//     }
    
//     const user = await User.findById(id);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: 'User not found' },
//         { status: 404 }
//       );
//     }
    
//     let message;
    
//     if (permanent && isAdmin(authUser)) {
//       // Permanent delete
//       await User.findByIdAndDelete(id);
//       message = 'User permanently deleted';
//     } else {
//       // Soft delete
//       user.status = 'deleted';
//       user.deletedAt = new Date();
//       user.updatedBy = authUser._id;
//       await user.save();
//       message = 'User deactivated';
//     }
    
//     return NextResponse.json({
//       success: true,
//       message
//     });
    
//   } catch (error) {
//     console.error('DELETE /api/users error:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to delete user',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

// // ==================== OPTIONS HANDLER (CORS) ====================
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Authorization, Content-Type',
//       'Access-Control-Allow-Credentials': 'true',
//     },
//   });
// }

// app/api/users/route.js
import { connectDB } from '@/utils/db';
import User from '@/models/user';
import { verifyToken } from '@/utils/jwt';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// App Router Config
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// Authentication helper
const authenticate = async (headers) => {
  try {
    const authHeader = headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided', status: 401 };
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, error: 'Invalid token', status: 401 };
    }
    
    const user = await User.findById(decoded.userId || decoded.id)
      .select('_id role status fullName email');
    
    if (!user) {
      return { success: false, error: 'User not found', status: 401 };
    }
    
    if (user.status !== 'active') {
      return { success: false, error: 'Account is not active', status: 403 };
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Authentication failed', status: 401 };
  }
};

// Authorization helpers
const isAdmin = (user) => user && user.role === 'admin';
const isSelf = (userId, authUser) => authUser && authUser._id.toString() === userId;

// Response formatter
const formatUser = (userData, includeSensitive = false) => {
  const user = userData.toObject ? userData.toObject() : userData;
  
  // Always remove sensitive fields
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.verificationToken;
  
  // Conditionally remove sensitive info
  if (!includeSensitive) {
    delete user.activeSessions;
    delete user.lastLoginIp;
  }
  
  // Add computed fields
  user.isAdmin = user.role === 'admin';
  user.notificationsEnabled = user.notificationSettings?.pushNotifications?.enabled || false;
  user.activeSessionsCount = user.activeSessions?.filter(s => s.status === 'active').length || 0;
  
  return user;
};

// ==================== GET HANDLER ====================
export async function GET(request) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Authenticate
    const auth = await authenticate(request.headers);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { 
          status: auth.status,
          headers: corsHeaders
        }
      );
    }
    
    const { user: authUser } = auth;
    
    // Handle single user request
    if (id) {
      return await handleGetSingleUser(id, authUser);
    }
    
    // Handle users with active notifications request
    if (searchParams.get('notifications') === 'active') {
      return await handleGetUsersWithActiveNotifications(authUser);
    }
    
    // Handle list request
    return await handleGetUsersList({
      authUser,
      page,
      limit,
      search,
      role,
      status,
      sortBy,
      sortOrder,
      startDate,
      endDate
    });
    
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Get single user
async function handleGetSingleUser(userId, authUser) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid user ID' },
      { 
        status: 400,
        headers: corsHeaders
      }
    );
  }
  
  // Check permissions - only admins or self can view
  if (!isAdmin(authUser) && !isSelf(userId, authUser)) {
    return NextResponse.json(
      { success: false, message: 'Access denied' },
      { 
        status: 403,
        headers: corsHeaders
      }
    );
  }
  
  const user = await User.findById(userId)
    .select('-password -resetPasswordToken -verificationToken');
  
  if (!user || user.status === 'deleted') {
    return NextResponse.json(
      { success: false, message: 'User not found' },
      { 
        status: 404,
        headers: corsHeaders
      }
    );
  }
  
  const includeSensitive = isAdmin(authUser) || isSelf(userId, authUser);
  
  return NextResponse.json({
    success: true,
    data: {
      user: formatUser(user, includeSensitive)
    }
  }, {
    headers: corsHeaders
  });
}

// Get users with active notifications
async function handleGetUsersWithActiveNotifications(authUser) {
  if (!isAdmin(authUser)) {
    return NextResponse.json(
      { success: false, message: 'Admin access required' },
      { 
        status: 403,
        headers: corsHeaders
      }
    );
  }
  
  // Use the static method from User model
  const users = await User.findUsersWithNotificationsEnabled();
  
  return NextResponse.json({
    success: true,
    data: {
      users: users.map(user => formatUser(user)),
      count: users.length
    }
  }, {
    headers: corsHeaders
  });
}

// Get users list with filters
async function handleGetUsersList(params) {
  const {
    authUser,
    page,
    limit,
    search,
    role,
    status,
    sortBy,
    sortOrder,
    startDate,
    endDate
  } = params;
  
  // Build query
  const filter = {};
  
  // Status filter
  if (status === 'all') {
    filter.status = { $ne: 'deleted' };
  } else {
    filter.status = status;
  }
  
  // Role filter - all users are admins, but we can filter if needed
  if (role && role !== 'admin') {
    // If role is specified and not 'admin', return empty result
    return NextResponse.json({
      success: true,
      data: {
        users: [],
        pagination: {
          page: Math.max(1, page),
          limit: Math.min(100, Math.max(1, limit)),
          total: 0,
          pages: 0
        }
      }
    }, {
      headers: corsHeaders
    });
  }
  
  // All active users can see all other users (since all are admins)
  // No need to restrict to self-view only
  
  // Search filter
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }
  
  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  // Pagination
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  // Execute queries
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -resetPasswordToken -verificationToken')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter)
  ]);
  
  // Format response
  const includeSensitive = isAdmin(authUser);
  const formattedUsers = users.map(user => formatUser(user, includeSensitive));
  
  return NextResponse.json({
    success: true,
    data: {
      users: formattedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  }, {
    headers: corsHeaders
  });
}

// ==================== POST HANDLER ====================
export async function POST(request) {
  try {
    await connectDB();
    
    // Parse request body
    const body = await request.json();
    const { fullName, email, phone, password, role = 'admin' } = body;
    
    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Validate phone
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Phone must be 10-15 digits' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Validate role - only admin is allowed
    if (role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Role must be admin' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Check if creating admin (requires existing admin privileges)
    const auth = await authenticate(request.headers);
    if (!auth.success || !isAdmin(auth.user)) {
      return NextResponse.json(
        { success: false, message: 'Admin privileges required to create users' },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone';
      return NextResponse.json(
        { 
          success: false, 
          message: 'User already exists',
          field
        },
        { 
          status: 409,
          headers: corsHeaders
        }
      );
    }
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'admin',
      status: 'active',
      notificationSettings: {
        pushNotifications: { enabled: true },
        notificationTypes: {
          newOrders: { enabled: true, priority: 'high', sound: true },
          payments: { enabled: true, priority: 'high', sound: true },
          lowStock: { enabled: true, priority: 'normal', sound: true },
          systemAlerts: { enabled: true, priority: 'high', sound: true },
          orderUpdates: { enabled: true, priority: 'normal', sound: true }
        }
      },
      adminPreferences: {
        dashboardLayout: 'default',
        defaultView: 'orders',
        refreshInterval: 30000,
        theme: 'light'
      },
      createdBy: auth.user._id
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: formatUser(user)
      }
    }, { 
      status: 201,
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('POST /api/users error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Duplicate field value' },
        { 
          status: 409,
          headers: corsHeaders
        }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// ==================== PUT HANDLER ====================
export async function PUT(request) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Parse request body
    const updateData = await request.json();
    
    // Authenticate
    const auth = await authenticate(request.headers);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { 
          status: auth.status,
          headers: corsHeaders
        }
      );
    }
    
    const { user: authUser } = auth;
    
    // Check permissions
    const canUpdate = isAdmin(authUser) || isSelf(id, authUser);
    if (!canUpdate) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    // Non-admins cannot update role or status
    if (!isAdmin(authUser)) {
      delete updateData.role;
      delete updateData.status;
    }
    
    const user = await User.findById(id);
    if (!user || user.status === 'deleted') {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Check for duplicate email/phone
    if (updateData.email || updateData.phone) {
      const duplicateQuery = { _id: { $ne: id } };
      if (updateData.email) duplicateQuery.email = updateData.email;
      if (updateData.phone) duplicateQuery.phone = updateData.phone;
      
      const existingUser = await User.findOne(duplicateQuery);
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email or phone already in use' },
          { 
            status: 409,
            headers: corsHeaders
          }
        );
      }
    }
    
    // Update notification settings if provided
    if (updateData.notificationSettings) {
      user.updateNotificationSettings(updateData.notificationSettings);
      delete updateData.notificationSettings;
    }
    
    // Update user fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'password' && user[key] !== undefined) {
        user[key] = updateData[key];
      }
    });
    
    // Handle password update
    if (updateData.password) {
      user.password = updateData.password;
    }
    
    user.updatedBy = authUser._id;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: formatUser(user, true)
      }
    }, {
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('PUT /api/users error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Duplicate field value' },
        { 
          status: 409,
          headers: corsHeaders
        }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// ==================== DELETE HANDLER ====================
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Parse request body for permanent option
    const body = await request.json().catch(() => ({}));
    const { permanent = false } = body;
    
    // Authenticate
    const auth = await authenticate(request.headers);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { 
          status: auth.status,
          headers: corsHeaders
        }
      );
    }
    
    const { user: authUser } = auth;
    
    // Check permissions
    const canDelete = isAdmin(authUser) || isSelf(id, authUser);
    if (!canDelete) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    // Admins can permanently delete, users can only soft delete themselves
    if (permanent && !isAdmin(authUser)) {
      return NextResponse.json(
        { success: false, message: 'Admin privileges required for permanent deletion' },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    let message;
    
    if (permanent && isAdmin(authUser)) {
      // Permanent delete
      await User.findByIdAndDelete(id);
      message = 'User permanently deleted';
    } else {
      // Soft delete
      user.status = 'deleted';
      user.deletedAt = new Date();
      user.updatedBy = authUser._id;
      await user.save();
      message = 'User deactivated';
    }
    
    return NextResponse.json({
      success: true,
      message
    }, {
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// ==================== OPTIONS HANDLER (CORS) ====================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}