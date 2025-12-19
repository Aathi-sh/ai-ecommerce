// // app/api/auth/fcm-token/route.js
// import { connectDB } from '../../../../utils/db';
// import DeviceToken from '../../../../models/AdminDeviceToken';
// import User from '../../../../models/user';
// import crypto from 'crypto';

// // ==================== RATE LIMITING ====================
// const rateLimits = new Map();
// const RATE_LIMIT_WINDOW = 30000;
// const MAX_REQUESTS = 3;

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
//     let user = await User.findById(identifier);
    
//     if (!user && identifier.includes('@')) {
//       user = await User.findOne({ email: identifier.toLowerCase().trim() });
//     }
    
//     return user;
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

// // ==================== MAIN API HANDLER ====================
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
    
//     const { token, deviceInfo = {}, userId, email } = body;
    
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
//       // CRITICAL FIX: Use findOneAndUpdate with upsert
//       // This finds by userId + deviceId (not fcmToken) and updates or creates
//       const updateData = {
//         fcmToken: trimmedToken,
//         deviceInfo: enhancedDeviceInfo,
//         lastActive: new Date(),
//         isActive: true,
//       };
      
//       // Check if we need to update device info
//       const existingToken = await DeviceToken.findOne({
//         userId: user._id,
//         deviceId: deviceId
//       });
      
//       if (existingToken) {
//         const needsDeviceInfoUpdate = deviceInfoChanged(existingToken.deviceInfo, enhancedDeviceInfo);
//         if (!needsDeviceInfoUpdate) {
//           // Remove deviceInfo from update to avoid unnecessary changes
//           delete updateData.deviceInfo;
//         }
//       }
      
//       // Perform upsert operation
//       const result = await DeviceToken.findOneAndUpdate(
//         {
//           userId: user._id,
//           deviceId: deviceId
//         },
//         {
//           $set: updateData,
//           $setOnInsert: {
//             createdAt: new Date()
//           }
//         },
//         {
//           upsert: true, // Create if doesn't exist
//           new: true, // Return updated document
//           runValidators: true
//         }
//       );
      
//       console.log('Token operation successful:', result._id);
      
//       // Cleanup old tokens for this user
//       const userTokens = await DeviceToken.find({ userId: user._id })
//         .sort({ lastActive: -1 });
      
//       if (userTokens.length > 5) {
//         const tokensToDelete = userTokens.slice(5);
//         for (const tokenToDelete of tokensToDelete) {
//           await DeviceToken.findByIdAndDelete(tokenToDelete._id);
//         }
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
//         timestamp: result.lastActive
//       }, { status: action === 'created' ? 201 : 200 });
      
//     } catch (dbError) {
//       console.error('Database operation error:', dbError.message);
      
//       // Handle specific errors
//       if (dbError.code === 11000) {
//         // If we still get duplicate key, it means unique index on fcmToken exists
//         // Try to find and update the existing token with this fcmToken
//         try {
//           const existingTokenWithSameFCM = await DeviceToken.findOne({
//             fcmToken: trimmedToken
//           });
          
//           if (existingTokenWithSameFCM) {
//             // Update the existing token with new userId/deviceId
//             existingTokenWithSameFCM.userId = user._id;
//             existingTokenWithSameFCM.deviceId = deviceId;
//             existingTokenWithSameFCM.deviceInfo = enhancedDeviceInfo;
//             existingTokenWithSameFCM.lastActive = new Date();
//             await existingTokenWithSameFCM.save();
            
//             console.log('Reassociated existing token');
            
//             return Response.json({
//               success: true,
//               message: 'Token reassociated successfully',
//               action: 'reassociated',
//               deviceId: deviceId,
//               tokenId: existingTokenWithSameFCM._id
//             }, { status: 200 });
//           }
//         } catch (reassocError) {
//           console.error('Reassociation failed:', reassocError);
//         }
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

// // GET handler (unchanged)
// export async function GET(request) {
//   try {
//     const url = new URL(request.url);
//     const userId = url.searchParams.get('userId');
    
//     if (userId) {
//       await connectDB();
//       const tokens = await DeviceToken.find({ userId }).sort({ lastActive: -1 });
      
//       return Response.json({
//         success: true,
//         tokens: tokens.map(t => ({
//           id: t._id,
//           deviceId: t.deviceId,
//           lastActive: t.lastActive,
//           isActive: t.isActive,
//           deviceInfo: t.deviceInfo
//         }))
//       }, { status: 200 });
//     }
    
//     return Response.json({
//       success: true,
//       message: 'FCM Token API',
//       endpoints: {
//         POST: 'Save FCM token (requires token and userId/email in body)',
//         GET: 'Get API info (add ?userId=... to get user tokens)'
//       }
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Error in GET handler:', error);
//     return Response.json({ 
//       success: false,
//       message: 'Internal server error'
//     }, { status: 500 });
//   }
// }

// // DELETE handler (unchanged)
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

// export async function OPTIONS(request) {
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





// app/api/auth/fcm-token/route.js - COMPLETE FIXED VERSION
import { connectDB } from "../../../../utils/db";  // Update path if different
import DeviceToken from '../../../../models/AdminDeviceToken'; // Use your DeviceToken model
import User from '../../../../models/user';  // Use your User model
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
    
    const { token, deviceInfo = {}, userId, email, role = 'user' } = body;
    
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
    
    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role
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
    };
    
    const deviceId = generateDeviceId(user._id.toString(), userAgent, deviceInfo);
    console.log('Generated device ID:', deviceId.substring(0, 16) + '...');
    
    const trimmedToken = token.trim();
    
    try {
      // Find by userId + deviceId
      const existingToken = await DeviceToken.findOne({
        userId: user._id,
        deviceId: deviceId
      });
      
      const updateData = {
        fcmToken: trimmedToken,
        userId: user._id,
        deviceId: deviceId,
        role: role,
        deviceInfo: enhancedDeviceInfo,
        lastActive: new Date(),
        isActive: true
      };
      
      // Perform upsert operation
      const result = await DeviceToken.findOneAndUpdate(
        { userId: user._id, deviceId: deviceId },
        { $set: updateData },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );
      
      console.log('Token operation successful:', result._id);
      
      // Cleanup old tokens for this user (keep only last 5)
      const userTokens = await DeviceToken.find({ userId: user._id })
        .sort({ lastActive: -1 });
      
      if (userTokens.length > 5) {
        const tokensToDelete = userTokens.slice(5);
        const deleteIds = tokensToDelete.map(t => t._id);
        
        await DeviceToken.deleteMany({ _id: { $in: deleteIds } });
        console.log('Cleaned up', tokensToDelete.length, 'old tokens');
      }
      
      const action = existingToken ? 'updated' : 'created';
      
      return Response.json({
        success: true,
        message: `Token ${action} successfully`,
        action: action,
        deviceId: deviceId,
        tokenId: result._id,
        userId: user._id,
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
          message: 'Token already exists',
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
    
    await connectDB();
    
    let query = {};
    
    // Filter by user ID
    if (userId) {
      query.userId = userId;
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    const tokens = await DeviceToken.find(query)
      .sort({ lastActive: -1 });
    
    // Format tokens for response
    const tokenData = tokens.map(t => ({
      id: t._id,
      fcmToken: t.fcmToken,
      deviceId: t.deviceId,
      userId: t.userId,
      role: t.role,
      lastActive: t.lastActive,
      isActive: t.isActive,
      deviceInfo: t.deviceInfo
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
    const { token, deviceId, userId, clearAll = false } = body;
    
    if (!userId) {
      return Response.json({ 
        success: false,
        message: 'User ID is required' 
      }, { status: 400 });
    }
    
    await connectDB();
    
    if (clearAll) {
      const result = await DeviceToken.deleteMany({ userId });
      console.log('Deleted all tokens for user:', userId, 'count:', result.deletedCount);
      
      return Response.json({
        success: true,
        message: `Deleted ${result.deletedCount} tokens`,
        deletedCount: result.deletedCount
      }, { status: 200 });
    } else if (token) {
      const result = await DeviceToken.findOneAndDelete({ fcmToken: token.trim(), userId });
      
      if (result) {
        return Response.json({
          success: true,
          message: 'Token deleted successfully'
        }, { status: 200 });
      } else {
        return Response.json({
          success: false,
          message: 'Token not found'
        }, { status: 404 });
      }
    } else if (deviceId) {
      const result = await DeviceToken.findOneAndDelete({ deviceId, userId });
      
      if (result) {
        return Response.json({
          success: true,
          message: 'Device token deleted successfully'
        }, { status: 200 });
      } else {
        return Response.json({
          success: false,
          message: 'Device token not found'
        }, { status: 404 });
      }
    } else {
      return Response.json({ 
        success: false,
        message: 'Specify token, deviceId, or set clearAll=true' 
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}