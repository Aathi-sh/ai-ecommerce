


// // app/api/auth/fcm-token/route.js - COMPLETE FIXED VERSION
// import { connectDB } from "../../../../utils/db";  // Update path if different
// import DeviceToken from '../../../../models/AdminDeviceToken'; // Use your DeviceToken model
// import User from '../../../../models/user';  // Use your User model
// import crypto from 'crypto';

// // ==================== RATE LIMITING ====================
// const rateLimits = new Map();
// const RATE_LIMIT_WINDOW = 30000;
// const MAX_REQUESTS = 5;

// const checkRateLimit = (userIdentifier) => {
//   const now = Date.now();
//   let userRequests = rateLimits.get(userIdentifier) || [];
//   userRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
//   if (userRequests.length >= MAX_REQUESTS) {
//     return false;
//   }
  
//   userRequests.push(now);
//   rateLimits.set(userIdentifier, userRequests);
//   return true;
// };

// // ==================== HELPER FUNCTIONS ====================
// const findUser = async (identifier) => {
//   if (!identifier) return null;
  
//   try {
//     // Try as MongoDB ID first
//     if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
//       const user = await User.findById(identifier);
//       if (user) return user;
//     }
    
//     // Try as email
//     if (identifier.includes('@')) {
//       const user = await User.findOne({ email: identifier.toLowerCase().trim() });
//       if (user) return user;
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Error finding user:', error);
//     return null;
//   }
// };

// const generateDeviceId = (userId, userAgent, deviceInfo) => {
//   const stableId = crypto
//     .createHash('sha256')
//     .update(`${userId}-${userAgent}-${JSON.stringify({
//       platform: deviceInfo.platform || '',
//       deviceType: deviceInfo.deviceType || '',
//       browser: deviceInfo.browser || '',
//       screenSize: deviceInfo.screenSize || ''
//     })}`)
//     .digest('hex')
//     .substring(0, 32);
  
//   return stableId;
// };

// const deviceInfoChanged = (existing, newInfo) => {
//   if (!existing || !newInfo) return true;
  
//   const importantFields = ['platform', 'deviceType', 'browser', 'screenSize', 'userAgent'];
  
//   for (const field of importantFields) {
//     const existingVal = existing[field] || '';
//     const newVal = newInfo[field] || '';
    
//     if (existingVal !== newVal) {
//       return true;
//     }
//   }
  
//   return false;
// };

// // ==================== POST HANDLER (SAVE TOKEN) ====================
// export async function POST(request) {
//   try {
//     console.log('🔐 POST /api/auth/fcm-token');
    
//     let body;
//     try {
//       body = await request.json();
//     } catch (parseError) {
//       console.error('Failed to parse JSON:', parseError);
//       return Response.json({ 
//         success: false,
//         message: 'Invalid JSON in request body' 
//       }, { status: 400 });
//     }
    
//     const { token, deviceInfo = {}, userId, email, role = 'user' } = body;
    
//     // Validate required fields
//     if (!token || typeof token !== 'string' || token.trim().length < 10) {
//       console.error('Invalid token');
//       return Response.json({ 
//         success: false,
//         message: 'Valid FCM token is required' 
//       }, { status: 400 });
//     }
    
//     const userIdentifier = userId || email;
//     if (!userIdentifier) {
//       console.error('No user identifier provided');
//       return Response.json({ 
//         success: false,
//         message: 'User ID or Email is required' 
//       }, { status: 400 });
//     }
    
//     // Rate limiting
//     if (!checkRateLimit(userIdentifier)) {
//       console.log('Rate limit exceeded for:', userIdentifier);
//       return Response.json({
//         success: false,
//         message: 'Too many requests. Please wait 30 seconds.'
//       }, { status: 429 });
//     }
    
//     console.log('Looking for user:', userIdentifier);
    
//     // Connect to database
//     try {
//       await connectDB();
//     } catch (dbError) {
//       console.error('Database connection failed:', dbError);
//       return Response.json({ 
//         success: false,
//         message: 'Database connection failed' 
//       }, { status: 500 });
//     }
    
//     // Find user
//     const user = await findUser(userIdentifier);
    
//     if (!user) {
//       console.error('User not found:', userIdentifier);
//       return Response.json({ 
//         success: false,
//         message: 'User not found' 
//       }, { status: 404 });
//     }
    
//     console.log('User found:', {
//       id: user._id,
//       email: user.email,
//       role: user.role
//     });
    
//     // Prepare device info
//     const userAgent = request.headers.get('user-agent') || 'unknown';
//     const ipAddress = request.headers.get('x-forwarded-for') || 
//                      request.headers.get('x-real-ip') || 
//                      'unknown';
    
//     const enhancedDeviceInfo = {
//       ...deviceInfo,
//       userAgent,
//       ipAddress,
//       userId: user._id.toString(),
//     };
    
//     const deviceId = generateDeviceId(user._id.toString(), userAgent, deviceInfo);
//     console.log('Generated device ID:', deviceId.substring(0, 16) + '...');
    
//     const trimmedToken = token.trim();
    
//     try {
//       // Find by userId + deviceId
//       const existingToken = await DeviceToken.findOne({
//         userId: user._id,
//         deviceId: deviceId
//       });
      
//       const updateData = {
//         fcmToken: trimmedToken,
//         userId: user._id,
//         deviceId: deviceId,
//         role: role,
//         deviceInfo: enhancedDeviceInfo,
//         lastActive: new Date(),
//         isActive: true
//       };
      
//       // Perform upsert operation
//       const result = await DeviceToken.findOneAndUpdate(
//         { userId: user._id, deviceId: deviceId },
//         { $set: updateData },
//         {
//           upsert: true,
//           new: true,
//           runValidators: true
//         }
//       );
      
//       console.log('Token operation successful:', result._id);
      
//       // Cleanup old tokens for this user (keep only last 5)
//       const userTokens = await DeviceToken.find({ userId: user._id })
//         .sort({ lastActive: -1 });
      
//       if (userTokens.length > 5) {
//         const tokensToDelete = userTokens.slice(5);
//         const deleteIds = tokensToDelete.map(t => t._id);
        
//         await DeviceToken.deleteMany({ _id: { $in: deleteIds } });
//         console.log('Cleaned up', tokensToDelete.length, 'old tokens');
//       }
      
//       const action = existingToken ? 'updated' : 'created';
      
//       return Response.json({
//         success: true,
//         message: `Token ${action} successfully`,
//         action: action,
//         deviceId: deviceId,
//         tokenId: result._id,
//         userId: user._id,
//         userRole: user.role,
//         userEmail: user.email,
//         timestamp: new Date().toISOString()
//       }, { status: action === 'created' ? 201 : 200 });
      
//     } catch (dbError) {
//       console.error('Database operation error:', dbError.message);
      
//       if (dbError.code === 11000) {
//         // Duplicate key error
//         return Response.json({
//           success: false,
//           message: 'Token already exists',
//           error: 'DUPLICATE_TOKEN'
//         }, { status: 409 });
//       }
      
//       return Response.json({ 
//         success: false,
//         message: 'Failed to save token to database',
//         error: dbError.message
//       }, { status: 500 });
//     }
    
//   } catch (error) {
//     console.error('Unhandled error:', error.message);
    
//     return Response.json({ 
//       success: false,
//       message: 'Internal server error while processing token'
//     }, { status: 500 });
//   }
// }

// // ==================== GET HANDLER (GET TOKENS) ====================
// export async function GET(request) {
//   try {
//     const url = new URL(request.url);
//     const userId = url.searchParams.get('userId');
//     const role = url.searchParams.get('role');
    
//     await connectDB();
    
//     let query = {};
    
//     // Filter by user ID
//     if (userId) {
//       query.userId = userId;
//     }
    
//     // Filter by role
//     if (role) {
//       query.role = role;
//     }
    
//     const tokens = await DeviceToken.find(query)
//       .sort({ lastActive: -1 });
    
//     // Format tokens for response
//     const tokenData = tokens.map(t => ({
//       id: t._id,
//       fcmToken: t.fcmToken,
//       deviceId: t.deviceId,
//       userId: t.userId,
//       role: t.role,
//       lastActive: t.lastActive,
//       isActive: t.isActive,
//       deviceInfo: t.deviceInfo
//     }));
    
//     // Extract just token strings
//     const tokenStrings = tokens
//       .map(t => t.fcmToken)
//       .filter(token => token && typeof token === 'string' && token.trim() !== '');
    
//     return Response.json({
//       success: true,
//       tokens: tokenData,
//       tokenStrings: tokenStrings,
//       count: tokens.length,
//       message: userId ? `Found ${tokens.length} tokens for user` : `Found ${tokens.length} tokens`,
//       timestamp: new Date().toISOString()
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error in GET handler:', error);
//     return Response.json({ 
//       success: false,
//       message: 'Internal server error'
//     }, { status: 500 });
//   }
// }

// // ==================== DELETE HANDLER ====================
// export async function DELETE(request) {
//   try {
//     const body = await request.json();
//     const { token, deviceId, userId, clearAll = false } = body;
    
//     if (!userId) {
//       return Response.json({ 
//         success: false,
//         message: 'User ID is required' 
//       }, { status: 400 });
//     }
    
//     await connectDB();
    
//     if (clearAll) {
//       const result = await DeviceToken.deleteMany({ userId });
//       console.log('Deleted all tokens for user:', userId, 'count:', result.deletedCount);
      
//       return Response.json({
//         success: true,
//         message: `Deleted ${result.deletedCount} tokens`,
//         deletedCount: result.deletedCount
//       }, { status: 200 });
//     } else if (token) {
//       const result = await DeviceToken.findOneAndDelete({ fcmToken: token.trim(), userId });
      
//       if (result) {
//         return Response.json({
//           success: true,
//           message: 'Token deleted successfully'
//         }, { status: 200 });
//       } else {
//         return Response.json({
//           success: false,
//           message: 'Token not found'
//         }, { status: 404 });
//       }
//     } else if (deviceId) {
//       const result = await DeviceToken.findOneAndDelete({ deviceId, userId });
      
//       if (result) {
//         return Response.json({
//           success: true,
//           message: 'Device token deleted successfully'
//         }, { status: 200 });
//       } else {
//         return Response.json({
//           success: false,
//           message: 'Device token not found'
//         }, { status: 404 });
//       }
//     } else {
//       return Response.json({ 
//         success: false,
//         message: 'Specify token, deviceId, or set clearAll=true' 
//       }, { status: 400 });
//     }
    
//   } catch (error) {
//     console.error('Error in DELETE handler:', error);
//     return Response.json({ 
//       success: false,
//       message: 'Internal server error'
//     }, { status: 500 });
//   }
// }

// // ==================== OPTIONS HANDLER ====================
// export async function OPTIONS() {
//   return Response.json({
//     success: true,
//     allowedMethods: ['POST', 'GET', 'DELETE', 'OPTIONS']
//   }, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     }
//   });
// }








// above code i working without saas 











// app/api/auth/fcm-token/route.js - COMPLETE FIXED VERSION WITH SAAS MULTI-TENANCY
import { connectDB } from "../../../../utils/db";
import DeviceToken from '../../../../models/AdminDeviceToken'; // Fixed import path
import User from '../../../../models/user';
import Company from '../../../../models/Company';
import crypto from 'crypto';

// ==================== RATE LIMITING ====================
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 30000;
const MAX_REQUESTS = 5;

const checkRateLimit = (userIdentifier) => {
  const now = Date.now();
  let userRequests = rateLimits.get(userIdentifier) || [];
  userRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (userRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  userRequests.push(now);
  rateLimits.set(userIdentifier, userRequests);
  return true;
};

// ==================== HELPER FUNCTIONS ====================
const findUser = async (identifier) => {
  if (!identifier) return null;
  
  try {
    // Try as MongoDB ID first
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      const user = await User.findById(identifier);
      if (user) return user;
    }
    
    // Try as email
    if (identifier.includes('@')) {
      const user = await User.findOne({ email: identifier.toLowerCase().trim() });
      if (user) return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

const generateDeviceId = (userId, userAgent, deviceInfo) => {
  const stableId = crypto
    .createHash('sha256')
    .update(`${userId}-${userAgent}-${JSON.stringify({
      platform: deviceInfo.platform || '',
      deviceType: deviceInfo.deviceType || '',
      browser: deviceInfo.browser || '',
      screenSize: deviceInfo.screenSize || ''
    })}`)
    .digest('hex')
    .substring(0, 32);
  
  return stableId;
};

const deviceInfoChanged = (existing, newInfo) => {
  if (!existing || !newInfo) return true;
  
  const importantFields = ['platform', 'deviceType', 'browser', 'screenSize', 'userAgent'];
  
  for (const field of importantFields) {
    const existingVal = existing[field] || '';
    const newVal = newInfo[field] || '';
    
    if (existingVal !== newVal) {
      return true;
    }
  }
  
  return false;
};

// ==================== POST HANDLER (SAVE TOKEN) ====================
export async function POST(request) {
  try {
    console.log('🔐 POST /api/auth/fcm-token');
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return Response.json({ 
        success: false,
        message: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    const { token, deviceInfo = {}, userId, email, role = 'user', companyId } = body;
    
    // Validate required fields
    if (!token || typeof token !== 'string' || token.trim().length < 10) {
      console.error('Invalid token');
      return Response.json({ 
        success: false,
        message: 'Valid FCM token is required' 
      }, { status: 400 });
    }
    
    const userIdentifier = userId || email;
    if (!userIdentifier) {
      console.error('No user identifier provided');
      return Response.json({ 
        success: false,
        message: 'User ID or Email is required' 
      }, { status: 400 });
    }
    
    // Rate limiting
    if (!checkRateLimit(userIdentifier)) {
      console.log('Rate limit exceeded for:', userIdentifier);
      return Response.json({
        success: false,
        message: 'Too many requests. Please wait 30 seconds.'
      }, { status: 429 });
    }
    
    console.log('Looking for user:', userIdentifier);
    
    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return Response.json({ 
        success: false,
        message: 'Database connection failed' 
      }, { status: 500 });
    }
    
    // Find user
    const user = await findUser(userIdentifier);
    
    if (!user) {
      console.error('User not found:', userIdentifier);
      return Response.json({ 
        success: false,
        message: 'User not found' 
      }, { status: 404 });
    }
    
    // ===== SAAS: COMPANY VALIDATION =====
    // Get effective company ID (from request or user)
    let effectiveCompanyId = companyId || user.companyId;
    
    // If company ID is provided, verify user belongs to that company
    if (companyId && user.companyId?.toString() !== companyId) {
      console.error('Company mismatch:', { 
        userCompanyId: user.companyId,
        requestCompanyId: companyId 
      });
      return Response.json({ 
        success: false,
        message: 'Invalid company ID for this user' 
      }, { status: 403 });
    }
    
    // Check if company exists and is active
    if (effectiveCompanyId) {
      const company = await Company.findById(effectiveCompanyId).select('status');
      if (!company) {
        console.error('Company not found:', effectiveCompanyId);
        return Response.json({ 
          success: false,
          message: 'Company not found' 
        }, { status: 404 });
      }
      
      if (company.status !== 'active') {
        console.error('Company not active:', company.status);
        return Response.json({ 
          success: false,
          message: 'Company is not active' 
        }, { status: 403 });
      }
    }
    
    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      companyId: effectiveCompanyId
    });
    
    // Prepare device info
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const enhancedDeviceInfo = {
      ...deviceInfo,
      userAgent,
      ipAddress,
      userId: user._id.toString(),
      companyId: effectiveCompanyId?.toString(),
    };
    
    const deviceId = generateDeviceId(user._id.toString(), userAgent, deviceInfo);
    console.log('Generated device ID:', deviceId.substring(0, 16) + '...');
    
    const trimmedToken = token.trim();
    
    try {
      // Find by userId + deviceId + companyId
      const existingToken = await DeviceToken.findOne({
        userId: user._id,
        deviceId: deviceId,
        companyId: effectiveCompanyId
      });
      
      const updateData = {
        fcmToken: trimmedToken,
        userId: user._id,
        deviceId: deviceId,
        companyId: effectiveCompanyId, // ADDED: Company context
        role: role,
        deviceInfo: enhancedDeviceInfo,
        lastActive: new Date(),
        isActive: true,
        source: deviceInfo.source || 'admin_panel', // Track token source
        notificationPreferences: {
          ...deviceInfo.notificationPreferences,
          companyId: effectiveCompanyId
        }
      };
      
      // Perform upsert operation with company context
      const result = await DeviceToken.findOneAndUpdate(
        { 
          userId: user._id, 
          deviceId: deviceId,
          companyId: effectiveCompanyId 
        },
        { $set: updateData },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );
      
      console.log('Token operation successful:', result._id);
      
      // Cleanup old tokens for this user and company (keep only last 5 per company)
      const userTokens = await DeviceToken.find({ 
        userId: user._id,
        companyId: effectiveCompanyId 
      }).sort({ lastActive: -1 });
      
      if (userTokens.length > 5) {
        const tokensToDelete = userTokens.slice(5);
        const deleteIds = tokensToDelete.map(t => t._id);
        
        await DeviceToken.deleteMany({ _id: { $in: deleteIds } });
        console.log('Cleaned up', tokensToDelete.length, 'old tokens for company', effectiveCompanyId);
      }
      
      const action = existingToken ? 'updated' : 'created';
      
      return Response.json({
        success: true,
        message: `Token ${action} successfully`,
        action: action,
        deviceId: deviceId,
        tokenId: result._id,
        userId: user._id,
        companyId: effectiveCompanyId,
        userRole: user.role,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      }, { status: action === 'created' ? 201 : 200 });
      
    } catch (dbError) {
      console.error('Database operation error:', dbError.message);
      
      if (dbError.code === 11000) {
        // Duplicate key error
        return Response.json({
          success: false,
          message: 'Token already exists for this company',
          error: 'DUPLICATE_TOKEN'
        }, { status: 409 });
      }
      
      return Response.json({ 
        success: false,
        message: 'Failed to save token to database',
        error: dbError.message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Unhandled error:', error.message);
    
    return Response.json({ 
      success: false,
      message: 'Internal server error while processing token'
    }, { status: 500 });
  }
}

// ==================== GET HANDLER (GET TOKENS) ====================
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role');
    const companyId = url.searchParams.get('companyId');
    const active = url.searchParams.get('active') === 'true';
    
    await connectDB();
    
    let query = {};
    
    // Filter by user ID
    if (userId) {
      query.userId = userId;
    }
    
    // Filter by company ID (SAAS)
    if (companyId) {
      query.companyId = companyId;
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by active status
    if (active) {
      query.isActive = true;
    }
    
    const tokens = await DeviceToken.find(query)
      .sort({ lastActive: -1 });
    
    // Format tokens for response
    const tokenData = tokens.map(t => ({
      id: t._id,
      fcmToken: t.fcmToken,
      deviceId: t.deviceId,
      userId: t.userId,
      companyId: t.companyId, // ADDED: Company context
      role: t.role,
      lastActive: t.lastActive,
      isActive: t.isActive,
      deviceInfo: t.deviceInfo,
      source: t.source
    }));
    
    // Extract just token strings
    const tokenStrings = tokens
      .map(t => t.fcmToken)
      .filter(token => token && typeof token === 'string' && token.trim() !== '');
    
    return Response.json({
      success: true,
      tokens: tokenData,
      tokenStrings: tokenStrings,
      count: tokens.length,
      companyId: companyId || null,
      message: userId ? `Found ${tokens.length} tokens for user` : `Found ${tokens.length} tokens`,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in GET handler:', error);
    return Response.json({ 
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// ==================== DELETE HANDLER ====================
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { token, deviceId, userId, companyId, clearAll = false } = body;
    
    if (!userId) {
      return Response.json({ 
        success: false,
        message: 'User ID is required' 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Build query with company context
    let query = { userId };
    
    // Add company filter if provided (SAAS)
    if (companyId) {
      query.companyId = companyId;
    }
    
    if (clearAll) {
      // Clear all tokens for this user in this company
      const result = await DeviceToken.deleteMany(query);
      console.log('Deleted all tokens for user:', userId, 'company:', companyId, 'count:', result.deletedCount);
      
      return Response.json({
        success: true,
        message: `Deleted ${result.deletedCount} tokens`,
        deletedCount: result.deletedCount,
        companyId: companyId || null
      }, { status: 200 });
    } else if (token) {
      // Delete specific token within company
      query.fcmToken = token.trim();
      const result = await DeviceToken.findOneAndDelete(query);
      
      if (result) {
        return Response.json({
          success: true,
          message: 'Token deleted successfully'
        }, { status: 200 });
      } else {
        return Response.json({
          success: false,
          message: 'Token not found in this company'
        }, { status: 404 });
      }
    } else if (deviceId) {
      // Delete specific device within company
      query.deviceId = deviceId;
      const result = await DeviceToken.findOneAndDelete(query);
      
      if (result) {
        return Response.json({
          success: true,
          message: 'Device token deleted successfully'
        }, { status: 200 });
      } else {
        return Response.json({
          success: false,
          message: 'Device token not found in this company'
        }, { status: 404 });
      }
    } else {
      return Response.json({ 
        success: false,
        message: 'Specify token, deviceId, companyId, or set clearAll=true' 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return Response.json({ 
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// ==================== OPTIONS HANDLER ====================
export async function OPTIONS() {
  return Response.json({
    success: true,
    allowedMethods: ['POST', 'GET', 'DELETE', 'OPTIONS']
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID',
    }
  });
}