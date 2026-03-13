

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

// // CORS headers for all responses
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
//   'Access-Control-Allow-Credentials': 'true',
//   'Access-Control-Max-Age': '86400',
// };

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

// // Authorization helpers
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
//         { 
//           status: auth.status,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     const { user: authUser } = auth;
    
//     // Handle single user request
//     if (id) {
//       return await handleGetSingleUser(id, authUser);
//     }
    
//     // Handle users with active notifications request
//     if (searchParams.get('notifications') === 'active') {
//       return await handleGetUsersWithActiveNotifications(authUser);
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
//       { 
//         status: 500,
//         headers: corsHeaders
//       }
//     );
//   }
// }

// // Get single user
// async function handleGetSingleUser(userId, authUser) {
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return NextResponse.json(
//       { success: false, message: 'Invalid user ID' },
//       { 
//         status: 400,
//         headers: corsHeaders
//       }
//     );
//   }
  
//   // Check permissions - only admins or self can view
//   if (!isAdmin(authUser) && !isSelf(userId, authUser)) {
//     return NextResponse.json(
//       { success: false, message: 'Access denied' },
//       { 
//         status: 403,
//         headers: corsHeaders
//       }
//     );
//   }
  
//   const user = await User.findById(userId)
//     .select('-password -resetPasswordToken -verificationToken');
  
//   if (!user || user.status === 'deleted') {
//     return NextResponse.json(
//       { success: false, message: 'User not found' },
//       { 
//         status: 404,
//         headers: corsHeaders
//       }
//     );
//   }
  
//   const includeSensitive = isAdmin(authUser) || isSelf(userId, authUser);
  
//   return NextResponse.json({
//     success: true,
//     data: {
//       user: formatUser(user, includeSensitive)
//     }
//   }, {
//     headers: corsHeaders
//   });
// }

// // Get users with active notifications
// async function handleGetUsersWithActiveNotifications(authUser) {
//   if (!isAdmin(authUser)) {
//     return NextResponse.json(
//       { success: false, message: 'Admin access required' },
//       { 
//         status: 403,
//         headers: corsHeaders
//       }
//     );
//   }
  
//   // Use the static method from User model
//   const users = await User.findUsersWithNotificationsEnabled();
  
//   return NextResponse.json({
//     success: true,
//     data: {
//       users: users.map(user => formatUser(user)),
//       count: users.length
//     }
//   }, {
//     headers: corsHeaders
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
  
//   // Role filter - all users are admins, but we can filter if needed
//   if (role && role !== 'admin') {
//     // If role is specified and not 'admin', return empty result
//     return NextResponse.json({
//       success: true,
//       data: {
//         users: [],
//         pagination: {
//           page: Math.max(1, page),
//           limit: Math.min(100, Math.max(1, limit)),
//           total: 0,
//           pages: 0
//         }
//       }
//     }, {
//       headers: corsHeaders
//     });
//   }
  
//   // All active users can see all other users (since all are admins)
//   // No need to restrict to self-view only
  
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
//   }, {
//     headers: corsHeaders
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
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Validate email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email format' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Validate phone
//     const phoneRegex = /^\d{10,15}$/;
//     if (!phoneRegex.test(phone)) {
//       return NextResponse.json(
//         { success: false, message: 'Phone must be 10-15 digits' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Validate password
//     if (password.length < 6) {
//       return NextResponse.json(
//         { success: false, message: 'Password must be at least 6 characters' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Validate role - only admin is allowed
//     if (role !== 'admin') {
//       return NextResponse.json(
//         { success: false, message: 'Role must be admin' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Check if creating admin (requires existing admin privileges)
//     const auth = await authenticate(request.headers);
//     if (!auth.success || !isAdmin(auth.user)) {
//       return NextResponse.json(
//         { success: false, message: 'Admin privileges required to create users' },
//         { 
//           status: 403,
//           headers: corsHeaders
//         }
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
//         { 
//           status: 409,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Create user
//     const user = await User.create({
//       fullName,
//       email,
//       phone,
//       password,
//       role: 'admin',
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
//     }, { 
//       status: 201,
//       headers: corsHeaders
//     });
    
//   } catch (error) {
//     console.error('POST /api/users error:', error);
    
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { success: false, message: 'Duplicate field value' },
//         { 
//           status: 409,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to create user',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { 
//         status: 500,
//         headers: corsHeaders
//       }
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
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid user ID' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Parse request body
//     const updateData = await request.json();
    
//     // Authenticate
//     const auth = await authenticate(request.headers);
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.error },
//         { 
//           status: auth.status,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     const { user: authUser } = auth;
    
//     // Check permissions
//     const canUpdate = isAdmin(authUser) || isSelf(id, authUser);
//     if (!canUpdate) {
//       return NextResponse.json(
//         { success: false, message: 'Access denied' },
//         { 
//           status: 403,
//           headers: corsHeaders
//         }
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
//         { 
//           status: 404,
//           headers: corsHeaders
//         }
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
//           { 
//             status: 409,
//             headers: corsHeaders
//           }
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
//     }, {
//       headers: corsHeaders
//     });
    
//   } catch (error) {
//     console.error('PUT /api/users error:', error);
    
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { success: false, message: 'Duplicate field value' },
//         { 
//           status: 409,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to update user',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { 
//         status: 500,
//         headers: corsHeaders
//       }
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
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid user ID' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
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
//         { 
//           status: auth.status,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     const { user: authUser } = auth;
    
//     // Check permissions
//     const canDelete = isAdmin(authUser) || isSelf(id, authUser);
//     if (!canDelete) {
//       return NextResponse.json(
//         { success: false, message: 'Access denied' },
//         { 
//           status: 403,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     // Admins can permanently delete, users can only soft delete themselves
//     if (permanent && !isAdmin(authUser)) {
//       return NextResponse.json(
//         { success: false, message: 'Admin privileges required for permanent deletion' },
//         { 
//           status: 403,
//           headers: corsHeaders
//         }
//       );
//     }
    
//     const user = await User.findById(id);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: 'User not found' },
//         { 
//           status: 404,
//           headers: corsHeaders
//         }
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
//     }, {
//       headers: corsHeaders
//     });
    
//   } catch (error) {
//     console.error('DELETE /api/users error:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to delete user',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { 
//         status: 500,
//         headers: corsHeaders
//       }
//     );
//   }
// }

// // ==================== OPTIONS HANDLER (CORS) ====================
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 200,
//     headers: corsHeaders
//   });
// }



// above code is without saas





// app/api/users/route.js
import { connectDB } from '@/utils/db';
import User from '@/models/user';
import Company from '@/models/Company';
import { verifyToken } from '@/utils/jwt';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// ========== CONSTANTS ==========
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

const ADMIN_TYPES = {
  SUPER: 'super',
  COMPANY: 'company'
};

const VALID_STATUSES = ['active', 'inactive', 'suspended', 'deleted', 'pending', 'offline'];

// ========== CORS HEADERS ==========
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With, X-Company-ID',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// ========== AUTHENTICATION HELPER ==========
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
      .select('_id role adminType companyId status fullName email');
    
    if (!user) {
      return { success: false, error: 'User not found', status: 401 };
    }
    
    if (user.status !== 'active') {
      return { success: false, error: 'Account is not active', status: 403 };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed', status: 401 };
  }
};

// ========== AUTHORIZATION HELPERS ==========
const isSuperAdmin = (user) => user && user.role === USER_ROLES.ADMIN && user.adminType === ADMIN_TYPES.SUPER;
const isCompanyAdmin = (user) => user && user.role === USER_ROLES.ADMIN && user.adminType === ADMIN_TYPES.COMPANY;
const isAdmin = (user) => user && user.role === USER_ROLES.ADMIN;
const isManager = (user) => user && user.role === USER_ROLES.MANAGER;
const isSelf = (userId, authUser) => authUser && authUser._id.toString() === userId;

// ========== COMPANY ACCESS CHECK ==========
const canAccessCompany = (user, targetCompanyId) => {
  if (!targetCompanyId) return false;
  if (isSuperAdmin(user)) return true; // Super admin can access any company
  if (isCompanyAdmin(user)) {
    return user.companyId && user.companyId.toString() === targetCompanyId.toString();
  }
  return false; // Non-admins can't access company data
};

// ========== RESPONSE FORMATTER ==========
const formatUser = (userData, includeSensitive = false, authUser = null) => {
  const user = userData.toObject ? userData.toObject() : userData;
  
  // Always remove sensitive fields
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.verificationToken;
  delete user.security?.failedLoginAttempts;
  
  // Conditionally remove sensitive info
  if (!includeSensitive) {
    delete user.lastLoginIp;
    delete user.security?.loginHistory;
  }
  
  // Add computed fields
  user.isAdmin = user.role === USER_ROLES.ADMIN;
  user.isSuperAdmin = user.role === USER_ROLES.ADMIN && user.adminType === ADMIN_TYPES.SUPER;
  user.isCompanyAdmin = user.role === USER_ROLES.ADMIN && user.adminType === ADMIN_TYPES.COMPANY;
  user.isManager = user.role === USER_ROLES.MANAGER;
  user.notificationsEnabled = user.notificationSettings?.pushNotifications?.enabled || false;
  
  // Add company context for super admins
  if (authUser && isSuperAdmin(authUser)) {
    user.companyAccess = 'all';
  }
  
  return user;
};

// ========== VALIDATION FUNCTIONS ==========
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ========== BUILD USER FILTER ==========
const buildUserFilter = (params, authUser) => {
  const {
    search,
    role,
    status,
    startDate,
    endDate,
    companyId
  } = params;

  const filter = {};

  // Company-based filtering (CRITICAL for multi-tenancy)
  if (isSuperAdmin(authUser)) {
    // Super admin can see all companies, optionally filtered by companyId
    if (companyId && validateObjectId(companyId)) {
      filter.companyId = new mongoose.Types.ObjectId(companyId);
    }
  } else if (isCompanyAdmin(authUser)) {
    // Company admin can only see their own company's users
    filter.companyId = authUser.companyId;
  } else if (isManager(authUser)) {
    // Managers can see users in their company
    filter.companyId = authUser.companyId;
    filter.role = { $in: [USER_ROLES.USER] }; // Managers can only see regular users
  } else {
    // Regular users can only see themselves
    filter._id = authUser._id;
  }

  // Status filter
  if (status) {
    if (status === 'all') {
      filter.status = { $ne: 'deleted' };
    } else if (VALID_STATUSES.includes(status)) {
      filter.status = status;
    }
  } else {
    filter.status = { $ne: 'deleted' }; // Default: exclude deleted
  }

  // Role filter (with proper permissions)
  if (role) {
    if (isSuperAdmin(authUser)) {
      // Super admin can filter by any role
      filter.role = role;
    } else if (isCompanyAdmin(authUser)) {
      // Company admin can filter by admin, manager, user
      if ([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER].includes(role)) {
        filter.role = role;
      }
    } else if (isManager(authUser)) {
      // Manager can only filter by user
      if (role === USER_ROLES.USER) {
        filter.role = role;
      }
    }
  }

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

  return filter;
};

// ========== GET HANDLER ==========
export async function GET(request) {
  try {
    await connectDB();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');
    const notifications = searchParams.get('notifications');
    
    // Authenticate
    const auth = await authenticate(request.headers);
    if (!auth.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: auth.error,
          code: 'AUTH_FAILED'
        },
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
    if (notifications === 'active') {
      return await handleGetUsersWithActiveNotifications(authUser, companyId);
    }
    
    // Handle company users request
    if (companyId && !isSuperAdmin(authUser)) {
      // Non-super admins can only access their own company
      if (!canAccessCompany(authUser, companyId)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Access denied to this company\'s data',
            code: 'COMPANY_ACCESS_DENIED'
          },
          { 
            status: 403,
            headers: corsHeaders
          }
        );
      }
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
      endDate,
      companyId
    });
    
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        code: 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// ========== GET SINGLE USER ==========
async function handleGetSingleUser(userId, authUser) {
  // Validate ObjectId
  if (!validateObjectId(userId)) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid user ID',
        code: 'INVALID_ID'
      },
      { 
        status: 400,
        headers: corsHeaders
      }
    );
  }
  
  // Check permissions
  const isOwnProfile = isSelf(userId, authUser);
  const canViewOther = isAdmin(authUser) || isManager(authUser);
  
  if (!isOwnProfile && !canViewOther) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      },
      { 
        status: 403,
        headers: corsHeaders
      }
    );
  }
  
  // Find user
  const user = await User.findById(userId)
    .select('-password -resetPasswordToken -verificationToken -security.failedLoginAttempts');
  
  if (!user || user.status === 'deleted') {
    return NextResponse.json(
      { 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      },
      { 
        status: 404,
        headers: corsHeaders
      }
    );
  }
  
  // Check company access for non-super-admins
  if (!isSuperAdmin(authUser) && !isOwnProfile) {
    if (!canAccessCompany(authUser, user.companyId)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Access denied to this user\'s data',
          code: 'COMPANY_ACCESS_DENIED'
        },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
  }
  
  // Determine sensitivity level
  const includeSensitive = isAdmin(authUser) || isOwnProfile;
  
  // Fetch company details if user has companyId
  let companyDetails = null;
  if (user.companyId) {
    companyDetails = await Company.findById(user.companyId)
      .select('companyName status subscription')
      .lean();
  }
  
  return NextResponse.json({
    success: true,
    data: {
      user: formatUser(user, includeSensitive, authUser),
      ...(companyDetails && { company: companyDetails })
    }
  }, {
    headers: corsHeaders
  });
}

// ========== GET USERS WITH ACTIVE NOTIFICATIONS ==========
async function handleGetUsersWithActiveNotifications(authUser, companyId) {
  // Only admins can access notification settings
  if (!isAdmin(authUser)) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      },
      { 
        status: 403,
        headers: corsHeaders
      }
    );
  }
  
  let query = {
    role: USER_ROLES.ADMIN,
    status: 'active',
    isVerified: true,
    'notificationSettings.pushNotifications.enabled': true,
  };
  
  // Filter by company if specified and user has access
  if (companyId && validateObjectId(companyId)) {
    if (isSuperAdmin(authUser) || (isCompanyAdmin(authUser) && authUser.companyId.toString() === companyId)) {
      query.$or = [
        { adminType: ADMIN_TYPES.SUPER },
        { companyId: new mongoose.Types.ObjectId(companyId), adminType: ADMIN_TYPES.COMPANY }
      ];
    }
  } else if (isCompanyAdmin(authUser)) {
    // Company admin sees their company admins + all super admins
    query.$or = [
      { adminType: ADMIN_TYPES.SUPER },
      { companyId: authUser.companyId, adminType: ADMIN_TYPES.COMPANY }
    ];
  }
  
  const users = await User.find(query)
    .select('_id email fullName companyId adminType notificationSettings adminPreferences')
    .lean();
  
  return NextResponse.json({
    success: true,
    data: {
      users: users.map(user => formatUser(user, false, authUser)),
      count: users.length
    }
  }, {
    headers: corsHeaders
  });
}

// ========== GET USERS LIST ==========
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
    endDate,
    companyId
  } = params;
  
  // Build filter with company context
  const filter = buildUserFilter({
    search,
    role,
    status,
    startDate,
    endDate,
    companyId
  }, authUser);
  
  // Pagination
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));
  const skip = (pageNum - 1) * limitNum;
  
  // Sorting
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  // Execute queries
  const [users, total, companyStats] = await Promise.all([
    User.find(filter)
      .select('-password -resetPasswordToken -verificationToken -security.failedLoginAttempts')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
    isAdmin(authUser) ? getUserStats(filter) : null
  ]);
  
  // Determine sensitivity level
  const includeSensitive = isAdmin(authUser);
  
  // Format users
  const formattedUsers = users.map(user => formatUser(user, includeSensitive, authUser));
  
  return NextResponse.json({
    success: true,
    data: {
      users: formattedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      ...(companyStats && { stats: companyStats })
    }
  }, {
    headers: corsHeaders
  });
}

// ========== GET USER STATS ==========
async function getUserStats(filter) {
  const stats = await User.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: stats.reduce((acc, curr) => acc + curr.count, 0),
    byStatus: {}
  };
  
  stats.forEach(stat => {
    result.byStatus[stat._id] = stat.count;
  });
  
  return result;
}

// ========== POST HANDLER ==========
export async function POST(request) {
  try {
    await connectDB();
    
    // Parse request body
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      password, 
      role = USER_ROLES.ADMIN,
      adminType = ADMIN_TYPES.COMPANY,
      companyId,
      notificationSettings,
      adminPreferences
    } = body;
    
    // Validate required fields
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!password) missingFields.push('password');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields',
          code: 'MISSING_FIELDS',
          fields: missingFields
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Validate phone
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Phone must be 10-15 digits',
          code: 'INVALID_PHONE'
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Validate password
    if (!validatePassword(password)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 6 characters',
          code: 'INVALID_PASSWORD'
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Authenticate
    const auth = await authenticate(request.headers);
    if (!auth.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: auth.error,
          code: 'AUTH_FAILED'
        },
        { 
          status: auth.status,
          headers: corsHeaders
        }
      );
    }
    
    const { user: authUser } = auth;
    
    // Validate role permissions
    if (role === USER_ROLES.ADMIN) {
      // Only admins can create other admins
      if (!isAdmin(authUser)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Admin privileges required to create admin users',
            code: 'ADMIN_REQUIRED'
          },
          { 
            status: 403,
            headers: corsHeaders
          }
        );
      }
      
      // Validate adminType
      if (adminType === ADMIN_TYPES.SUPER) {
        // Only super admin can create other super admins
        if (!isSuperAdmin(authUser)) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Super admin privileges required to create super admin',
              code: 'SUPER_ADMIN_REQUIRED'
            },
            { 
              status: 403,
              headers: corsHeaders
            }
          );
        }
      }
    }
    
    // Validate companyId
    let targetCompanyId = companyId;
    
    if (role === USER_ROLES.ADMIN && adminType === ADMIN_TYPES.COMPANY) {
      // Company admin must have companyId
      if (!targetCompanyId) {
        if (isCompanyAdmin(authUser)) {
          // If company admin is creating another admin, use their company
          targetCompanyId = authUser.companyId;
        } else {
          return NextResponse.json(
            { 
              success: false, 
              message: 'companyId is required for company admin',
              code: 'COMPANY_ID_REQUIRED'
            },
            { 
              status: 400,
              headers: corsHeaders
            }
          );
        }
      }
      
      // Verify company exists
      const company = await Company.findById(targetCompanyId);
      if (!company) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Company not found',
            code: 'COMPANY_NOT_FOUND'
          },
          { 
            status: 404,
            headers: corsHeaders
          }
        );
      }
      
      // Check if user has access to this company
      if (!canAccessCompany(authUser, targetCompanyId)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Access denied to this company',
            code: 'COMPANY_ACCESS_DENIED'
          },
          { 
            status: 403,
            headers: corsHeaders
          }
        );
      }
    } else if (role === USER_ROLES.MANAGER || role === USER_ROLES.USER) {
      // Managers and users must be created under a company
      if (!targetCompanyId) {
        if (isCompanyAdmin(authUser) || isManager(authUser)) {
          targetCompanyId = authUser.companyId;
        } else {
          return NextResponse.json(
            { 
              success: false, 
              message: 'companyId is required for non-admin users',
              code: 'COMPANY_ID_REQUIRED'
            },
            { 
              status: 400,
              headers: corsHeaders
            }
          );
        }
      }
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
          message: `${field} already in use`,
          code: 'DUPLICATE_FIELD',
          field
        },
        { 
          status: 409,
          headers: corsHeaders
        }
      );
    }
    
    // Create user
    const userData = {
      fullName,
      email,
      phone,
      password,
      role,
      status: 'active',
      isVerified: true,
      createdBy: authUser._id,
      notificationSettings: notificationSettings || {
        pushNotifications: { enabled: true },
        notificationTypes: {
          newOrders: { enabled: true, priority: 'high', sound: true },
          payments: { enabled: true, priority: 'high', sound: true },
          lowStock: { enabled: true, priority: 'normal', sound: true },
          systemAlerts: { enabled: true, priority: 'high', sound: true },
          orderUpdates: { enabled: true, priority: 'normal', sound: true }
        }
      },
      adminPreferences: adminPreferences || {
        dashboardLayout: 'default',
        defaultView: 'orders',
        refreshInterval: 30000,
        theme: 'light'
      }
    };
    
    // Add adminType for admin users
    if (role === USER_ROLES.ADMIN) {
      userData.adminType = adminType || ADMIN_TYPES.COMPANY;
    }
    
    // Add companyId for non-super-admin users
    if (targetCompanyId && !(role === USER_ROLES.ADMIN && userData.adminType === ADMIN_TYPES.SUPER)) {
      userData.companyId = targetCompanyId;
    }
    
    const user = await User.create(userData);
    
    // Log activity for audit
    console.log(`User created: ${user._id} by ${authUser._id} (Role: ${role}, Company: ${targetCompanyId || 'N/A'})`);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        user: formatUser(user, true, authUser)
      }
    }, { 
      status: 201,
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('POST /api/users error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: `${field} already in use`,
          code: 'DUPLICATE_FIELD',
          field
        },
        { 
          status: 409,
          headers: corsHeaders
        }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create user',
        code: 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// ========== PUT HANDLER ==========
export async function PUT(request) {
  try {
    await connectDB();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User ID is required',
          code: 'ID_REQUIRED'
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    if (!validateObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid user ID',
          code: 'INVALID_ID'
        },
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
        { 
          success: false, 
          message: auth.error,
          code: 'AUTH_FAILED'
        },
        { 
          status: auth.status,
          headers: corsHeaders
        }
      );
    }
    
    const { user: authUser } = auth;
    
    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser || targetUser.status === 'deleted') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Check permissions
    const isOwnProfile = isSelf(id, authUser);
    const canUpdateOther = isAdmin(authUser);
    
    if (!isOwnProfile && !canUpdateOther) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    // Check company access for non-super-admins
    if (!isSuperAdmin(authUser) && !isOwnProfile) {
      if (!canAccessCompany(authUser, targetUser.companyId)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Access denied to this user\'s data',
            code: 'COMPANY_ACCESS_DENIED'
          },
          { 
            status: 403,
            headers: corsHeaders
          }
        );
      }
    }
    
    // Restrict updates based on role
    const restrictedFields = [];
    
    if (!isSuperAdmin(authUser)) {
      // Non-super admins cannot change adminType
      if (updateData.adminType && updateData.adminType !== targetUser.adminType) {
        restrictedFields.push('adminType');
        delete updateData.adminType;
      }
      
      // Non-super admins cannot change companyId
      if (updateData.companyId && updateData.companyId.toString() !== targetUser.companyId?.toString()) {
        restrictedFields.push('companyId');
        delete updateData.companyId;
      }
    }
    
    if (!isAdmin(authUser)) {
      // Non-admins cannot change role or status
      if (updateData.role && updateData.role !== targetUser.role) {
        restrictedFields.push('role');
        delete updateData.role;
      }
      if (updateData.status && updateData.status !== targetUser.status) {
        restrictedFields.push('status');
        delete updateData.status;
      }
    }
    
    // Check for duplicate email/phone
    if (updateData.email || updateData.phone) {
      const duplicateQuery = { _id: { $ne: id } };
      if (updateData.email) duplicateQuery.email = updateData.email;
      if (updateData.phone) duplicateQuery.phone = updateData.phone;
      
      const existingUser = await User.findOne(duplicateQuery);
      if (existingUser) {
        const field = existingUser.email === updateData.email ? 'email' : 'phone';
        return NextResponse.json(
          { 
            success: false, 
            message: `${field} already in use`,
            code: 'DUPLICATE_FIELD',
            field
          },
          { 
            status: 409,
            headers: corsHeaders
          }
        );
      }
    }
    
    // Handle notification settings update
    if (updateData.notificationSettings) {
      targetUser.updateNotificationSettings(updateData.notificationSettings);
      delete updateData.notificationSettings;
    }
    
    // Update user fields
    let hasChanges = false;
    Object.keys(updateData).forEach(key => {
      if (key !== 'password' && targetUser[key] !== undefined && targetUser[key] !== updateData[key]) {
        targetUser[key] = updateData[key];
        hasChanges = true;
      }
    });
    
    // Handle password update
    if (updateData.password) {
      targetUser.password = updateData.password;
      hasChanges = true;
    }
    
    if (hasChanges) {
      targetUser.updatedBy = authUser._id;
      await targetUser.save();
    }
    
    return NextResponse.json({
      success: true,
      message: hasChanges ? 'User updated successfully' : 'No changes detected',
      data: {
        user: formatUser(targetUser, true, authUser),
        ...(restrictedFields.length > 0 && { 
          warning: `Some fields were not updated due to permission restrictions: ${restrictedFields.join(', ')}` 
        })
      }
    }, {
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('PUT /api/users error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: `${field} already in use`,
          code: 'DUPLICATE_FIELD',
          field
        },
        { 
          status: 409,
          headers: corsHeaders
        }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update user',
        code: 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// ========== DELETE HANDLER ==========
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User ID is required',
          code: 'ID_REQUIRED'
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    if (!validateObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid user ID',
          code: 'INVALID_ID'
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { permanent = false, reason = '' } = body;
    
    // Authenticate
    const auth = await authenticate(request.headers);
    if (!auth.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: auth.error,
          code: 'AUTH_FAILED'
        },
        { 
          status: auth.status,
          headers: corsHeaders
        }
      );
    }
    
    const { user: authUser } = auth;
    
    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Check permissions
    const isOwnProfile = isSelf(id, authUser);
    const canDeleteOther = isAdmin(authUser);
    
    if (!isOwnProfile && !canDeleteOther) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    // Check company access for non-super-admins
    if (!isSuperAdmin(authUser) && !isOwnProfile) {
      if (!canAccessCompany(authUser, targetUser.companyId)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Access denied to this user\'s data',
            code: 'COMPANY_ACCESS_DENIED'
          },
          { 
            status: 403,
            headers: corsHeaders
          }
        );
      }
    }
    
    // Prevent deleting own account if not super admin
    if (isOwnProfile && !isSuperAdmin(authUser) && permanent) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot permanently delete your own account',
          code: 'SELF_DELETE_FORBIDDEN'
        },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    // Prevent deleting last super admin
    if (targetUser.isSuperAdmin) {
      const superAdminCount = await User.countDocuments({
        role: USER_ROLES.ADMIN,
        adminType: ADMIN_TYPES.SUPER,
        status: { $ne: 'deleted' }
      });
      
      if (superAdminCount <= 1 && !permanent) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Cannot delete the last super admin',
            code: 'LAST_SUPER_ADMIN'
          },
          { 
            status: 403,
            headers: corsHeaders
          }
        );
      }
    }
    
    let message;
    let data = {};
    
    if (permanent && isAdmin(authUser)) {
      // Permanent delete (admin only)
      await User.findByIdAndDelete(id);
      message = 'User permanently deleted';
      data.permanent = true;
      
      // Log audit
      console.log(`User permanently deleted: ${id} by ${authUser._id}`);
    } else {
      // Soft delete
      await targetUser.softDelete(authUser._id, reason || 'User deleted');
      message = 'User deactivated successfully';
      data.permanent = false;
      
      // Log audit
      console.log(`User soft deleted: ${id} by ${authUser._id}${reason ? ` (Reason: ${reason})` : ''}`);
    }
    
    return NextResponse.json({
      success: true,
      message,
      data
    }, {
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete user',
        code: 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// ========== OPTIONS HANDLER (CORS) ==========
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}