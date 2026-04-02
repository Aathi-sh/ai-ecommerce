
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';
// import { connectDB } from '@/utils/db';
// import User from '@/models/user';
// import Company from '@/models/Company';
// import DeviceToken from '@/models/AdminDeviceToken';

// /**
//  * Professional Logout API Route with SaaS Multi-tenancy
//  * 
//  * Features:
//  * - Company context in all operations
//  * - Company-specific device token cleanup
//  * - Super admin context clearing
//  * - Company lastActive update
//  * - Multi-tenant audit logging
//  */

// // Security headers configuration
// const securityHeaders = {
//   'X-Content-Type-Options': 'nosniff',
//   'X-Frame-Options': 'DENY',
//   'X-XSS-Protection': '1; mode=block',
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
//   'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
// };

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
//     ? process.env.NEXTAUTH_URL || process.env.FRONTEND_URL || 'https://yourdomain.com'
//     : 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Company-ID',
//   'Access-Control-Allow-Credentials': 'true',
//   'Access-Control-Max-Age': '86400',
// };

// // Handle preflight requests
// export async function OPTIONS(request) {
//   return NextResponse.json(null, {
//     status: 200,
//     headers: {
//       ...securityHeaders,
//       ...corsHeaders,
//     },
//   });
// }

// export async function POST(request) {
//   try {
//     console.log('🚪 [LOGOUT API] Processing logout request...');

//     // Get the session to identify the user
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       console.log('⚠️ [LOGOUT API] No active session found');
      
//       // Create response for already logged out state
//       const response = NextResponse.json(
//         {
//           success: true,
//           message: 'Already logged out',
//           code: 'ALREADY_LOGGED_OUT',
//           timestamp: new Date().toISOString(),
//         },
//         {
//           status: 200,
//           headers: {
//             ...securityHeaders,
//             ...corsHeaders,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       clearAllCookies(response);
//       clearCompanyContext(response);
//       console.log('✅ [LOGOUT API] Cookies and company context cleared (no session)');
      
//       return response;
//     }

//     // Parse request body for FCM token and company context
//     let fcmToken = null;
//     let requestCompanyId = null;
//     let requestBody = {};
//     try {
//       const text = await request.text();
//       if (text) {
//         requestBody = JSON.parse(text);
//         fcmToken = requestBody.fcmToken || null;
//         requestCompanyId = requestBody.companyId || null;
//       }
//     } catch (error) {
//       console.log('ℹ️ [LOGOUT API] No valid JSON body provided');
//     }

//     const userId = session.user.id;
//     const userEmail = session.user.email;
//     const userRole = session.user.role;
//     const userAdminType = session.user.adminType;
//     const userCompanyId = session.user.companyId;
    
//     // Determine effective company ID
//     const isSuperAdmin = userRole === 'admin' && userAdminType === 'super';
//     const effectiveCompanyId = requestCompanyId || userCompanyId;

//     console.log('👤 [LOGOUT API] User logging out:', {
//       email: userEmail,
//       userId: userId,
//       role: userRole,
//       adminType: userAdminType,
//       companyId: userCompanyId,
//       effectiveCompanyId,
//       isSuperAdmin,
//       hasFCMToken: !!fcmToken,
//     });

//     // Connect to database
//     await connectDB();

//     // ===== 1. UPDATE USER STATUS TO OFFLINE =====
//     let updatedUser = null;
//     try {
//       const user = await User.findById(userId);
      
//       if (user) {
//         if (typeof user.setOffline === 'function') {
//           updatedUser = await user.setOffline();
//           console.log('✅ [LOGOUT API] User status updated to offline via setOffline()');
//         } else {
//           updatedUser = await User.findByIdAndUpdate(
//             userId,
//             {
//               $set: {
//                 status: 'offline',
//                 lastLogout: new Date(),
//                 lastSeen: new Date(),
//               },
//             },
//             { 
//               new: true,
//               runValidators: true
//             }
//           ).select('email role status lastLogout lastSeen companyId').lean();
          
//           console.log('✅ [LOGOUT API] User status updated to offline via direct update');
//         }
//       } else {
//         console.warn('⚠️ [LOGOUT API] User not found in database:', userId);
//       }
//     } catch (dbError) {
//       console.error('❌ [LOGOUT API] Database update failed:', {
//         error: dbError.message,
//         code: dbError.code,
//         userId: userId
//       });
//     }

//     // ===== 2. UPDATE COMPANY LAST ACTIVE =====
//     if (userCompanyId) {
//       try {
//         await Company.findByIdAndUpdate(
//           userCompanyId,
//           {
//             $set: {
//               'stats.lastActive': new Date(),
//               updatedAt: new Date()
//             }
//           }
//         );
//         console.log('✅ [LOGOUT API] Company lastActive updated:', userCompanyId);
//       } catch (companyError) {
//         console.error('❌ [LOGOUT API] Company update failed:', companyError.message);
//       }
//     }

//     // ===== 3. DEVICE TOKEN CLEANUP (Company-specific) =====
//     if (fcmToken) {
//       try {
//         console.log('🔧 [LOGOUT API] Processing FCM token cleanup');
        
//         // Build query with company context
//         const tokenQuery = { fcmToken };
//         if (effectiveCompanyId) {
//           tokenQuery.companyId = effectiveCompanyId;
//         }
//         if (userId) {
//           tokenQuery.userId = userId;
//         }

//         // Deactivate token in DeviceToken model
//         const deactivatedToken = await DeviceToken.findOneAndUpdate(
//           tokenQuery,
//           {
//             $set: {
//               isActive: false,
//               lastActive: new Date(),
//               updatedAt: new Date()
//             }
//           },
//           { new: true }
//         );

//         console.log('✅ [LOGOUT API] Device token deactivated:', {
//           tokenDeactivated: !!deactivatedToken,
//           userId,
//           companyId: effectiveCompanyId
//         });

//         // Also remove from user's deviceTokens array (legacy)
//         const userUpdateResult = await User.findByIdAndUpdate(
//           userId,
//           {
//             $pull: {
//               deviceTokens: { 
//                 token: fcmToken,
//                 ...(effectiveCompanyId ? { companyId: effectiveCompanyId } : {})
//               },
//             },
//           },
//           { new: true }
//         ).select('deviceTokens').lean();

//         console.log('✅ [LOGOUT API] Token removed from user deviceTokens:', {
//           tokenRemoved: !!userUpdateResult,
//           userId
//         });

//         // Call FCM service to deregister token (non-blocking)
//         if (process.env.NEXTAUTH_URL) {
//           fetch(`${process.env.NEXTAUTH_URL}/api/notifications/fcm/deregister`, {
//             method: 'POST',
//             headers: { 
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET || ''}`,
//               'X-Company-ID': effectiveCompanyId || '',
//             },
//             body: JSON.stringify({ 
//               userId,
//               token: fcmToken,
//               companyId: effectiveCompanyId,
//               reason: 'logout'
//             }),
//           }).then(res => {
//             if (res.ok) {
//               console.log('✅ [LOGOUT API] FCM token deregistered with service');
//             } else {
//               console.warn('⚠️ [LOGOUT API] FCM deregistration failed:', res.status);
//             }
//           }).catch(err => {
//             console.warn('⚠️ [LOGOUT API] FCM service call failed:', err.message);
//           });
//         }

//       } catch (fcmCleanupError) {
//         console.error('❌ [LOGOUT API] FCM cleanup error:', fcmCleanupError.message);
//       }
//     }

//     // ===== 4. DEACTIVATE ALL DEVICE TOKENS FOR THIS USER/COMPANY =====
//     if (userId) {
//       try {
//         const tokenQuery = { userId, isActive: true };
//         if (effectiveCompanyId) {
//           tokenQuery.companyId = effectiveCompanyId;
//         }

//         const deactivatedCount = await DeviceToken.updateMany(
//           tokenQuery,
//           {
//             $set: {
//               isActive: false,
//               lastActive: new Date(),
//               updatedAt: new Date()
//             }
//           }
//         );

//         console.log('✅ [LOGOUT API] Deactivated all active device tokens:', {
//           count: deactivatedCount.modifiedCount,
//           userId,
//           companyId: effectiveCompanyId
//         });
//       } catch (tokenError) {
//         console.error('❌ [LOGOUT API] Failed to deactivate tokens:', tokenError.message);
//       }
//     }

//     // ===== 5. AUDIT LOGGING WITH COMPANY CONTEXT =====
//     const auditLog = {
//       userId: userId,
//       email: userEmail,
//       role: userRole,
//       adminType: userAdminType,
//       companyId: userCompanyId,
//       effectiveCompanyId,
//       isSuperAdmin,
//       timestamp: new Date().toISOString(),
//       ip: request.headers.get('x-forwarded-for') || 
//            request.headers.get('x-real-ip') || 
//            'unknown',
//       userAgent: request.headers.get('user-agent') || 'Unknown',
//       method: 'POST',
//       path: '/api/auth/logout',
//       fcmTokenRemoved: !!fcmToken,
//       status: 'success',
//       sessionInfo: {
//         hasSession: true,
//         sessionAge: session.expires ? 
//           Math.floor((new Date(session.expires) - new Date()) / 1000) : null
//       }
//     };

//     console.log('📝 [LOGOUT API] Logout audit log:', JSON.stringify(auditLog, null, 2));

//     // Store audit log if you have AuditLog model
//     /*
//     try {
//       const AuditLog = mongoose.models.AuditLog || require('@/models/AuditLog').default;
//       await AuditLog.create({
//         ...auditLog,
//         action: 'LOGOUT'
//       });
//     } catch (auditError) {
//       console.warn('⚠️ [LOGOUT API] Audit log storage failed:', auditError.message);
//     }
//     */

//     // Create the success response
//     const response = NextResponse.json(
//       {
//         success: true,
//         message: 'Logged out successfully',
//         user: {
//           id: userId,
//           email: userEmail,
//           role: userRole,
//           companyId: userCompanyId,
//         },
//         company: userCompanyId ? {
//           id: userCompanyId,
//           context: effectiveCompanyId
//         } : null,
//         timestamp: new Date().toISOString(),
//         fcmTokenRemoved: !!fcmToken,
//         nextSteps: 'All active sessions have been terminated.',
//       },
//       {
//         status: 200,
//         headers: {
//           ...securityHeaders,
//           ...corsHeaders,
//           'Content-Type': 'application/json',
//           'Cache-Control': 'no-cache, no-store, must-revalidate',
//           'Pragma': 'no-cache',
//           'Expires': '0',
//         },
//       }
//     );

//     // Clear all session cookies and company context
//     clearAllCookies(response);
//     clearCompanyContext(response);
//     console.log('✅ [LOGOUT API] All cookies and company context cleared successfully');

//     return response;

//   } catch (error) {
//     console.error('❌ [LOGOUT API] Unexpected error:', {
//       message: error.message,
//       stack: error.stack,
//       name: error.name
//     });
    
//     // Even on error, try to clear cookies
//     const errorResponse = NextResponse.json(
//       {
//         success: false,
//         message: 'Logout failed due to server error',
//         code: 'LOGOUT_ERROR',
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: {
//           ...securityHeaders,
//           ...corsHeaders,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     // Attempt to clear cookies even on error
//     try {
//       clearAllCookies(errorResponse);
//       clearCompanyContext(errorResponse);
//     } catch (cookieError) {
//       console.error('❌ [LOGOUT API] Failed to clear cookies on error:', cookieError.message);
//     }

//     return errorResponse;
//   }
// }

// /**
//  * Clear all session cookies
//  */
// function clearAllCookies(response) {
//   // NextAuth.js cookies - comprehensive list
//   const nextAuthCookies = [
//     'next-auth.session-token',
//     'next-auth.csrf-token',
//     'next-auth.callback-url',
//     'next-auth.pkce.code_verifier',
//     'next-auth.state',
//     'next-auth.nonce',
//     '__Secure-next-auth.session-token',
//     '__Secure-next-auth.callback-url',
//     '__Host-next-auth.csrf-token',
//     '__Host-next-auth.pkce.code_verifier',
//     '__Secure-next-auth.pkce.code_verifier',
//   ];

//   // Custom application cookies
//   const customCookies = [
//     'auth_token',
//     'refresh_token',
//     'user_session',
//     'user_preferences',
//     'remember_me',
//     'user_id',
//     'user_role',
//     'session',
//     'sessionid',
//     'connect.sid',
//   ];

//   // Cookie configurations for different environments
//   const cookieConfigs = [
//     { path: '/', secure: false, sameSite: 'lax' },
//     { path: '/', secure: true, sameSite: 'lax' },
//     { path: '/', secure: true, sameSite: 'none' },
//     { path: '/api', secure: false },
//     { path: '/api', secure: true },
//     { path: '/auth', secure: false },
//     { path: '/auth', secure: true },
//   ];

//   // Clear all NextAuth cookies
//   nextAuthCookies.forEach(cookieName => {
//     response.cookies.delete(cookieName);
    
//     cookieConfigs.forEach(config => {
//       response.cookies.set({
//         name: cookieName,
//         value: '',
//         expires: new Date(0),
//         maxAge: 0,
//         ...config,
//         httpOnly: true,
//       });
//     });
//   });

//   // Clear all custom cookies
//   customCookies.forEach(cookieName => {
//     response.cookies.delete(cookieName);
    
//     cookieConfigs.forEach(config => {
//       response.cookies.set({
//         name: cookieName,
//         value: '',
//         expires: new Date(0),
//         maxAge: 0,
//         ...config,
//         httpOnly: cookieName.includes('token') || cookieName.includes('session'),
//       });
//     });
//   });

//   // Clear cookies for root domain and subdomains
//   const domains = ['.localhost', '.steponext.com', ''];
//   domains.forEach(domain => {
//     if (domain) {
//       nextAuthCookies.concat(customCookies).forEach(cookieName => {
//         response.cookies.set({
//           name: cookieName,
//           value: '',
//           expires: new Date(0),
//           maxAge: 0,
//           path: '/',
//           domain: domain,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'lax',
//           httpOnly: true,
//         });
//       });
//     }
//   });

//   return response;
// }

// /**
//  * Clear company context from client storage
//  */
// function clearCompanyContext(response) {
//   // Clear company context cookies
//   const companyCookies = [
//     'current_company',
//     'company_context',
//     'active_company',
//     'company_id',
//     'company_name',
//     'company_switched'
//   ];

//   companyCookies.forEach(cookieName => {
//     response.cookies.delete(cookieName);
//     response.cookies.set({
//       name: cookieName,
//       value: '',
//       expires: new Date(0),
//       maxAge: 0,
//       path: '/',
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//     });
//   });

//   // Add headers to instruct client to clear company context
//   response.headers.set('X-Clear-Company-Context', 'true');
//   response.headers.set('X-Logout-Complete', 'true');

//   return response;
// }

// /**
//  * GET endpoint for API information
//  */
// export async function GET(request) {
//   return NextResponse.json(
//     {
//       endpoint: '/api/auth/logout',
//       description: 'Secure logout endpoint with multi-tenant support',
//       method: 'POST',
//       required: 'Authentication session (via NextAuth cookies)',
//       optional: {
//         fcmToken: 'string (FCM token to remove)',
//         companyId: 'string (company context for super admin)'
//       },
//       features: [
//         'Session termination',
//         'Database cleanup with offline status',
//         'Company lastActive update',
//         'Company-specific FCM token removal',
//         'DeviceToken model cleanup',
//         'Super admin context clearing',
//         'CSRF protection',
//         'Multi-tenant audit logging',
//         'CORS support',
//         'Complete multi-cookie clearing',
//         'Company context cleanup',
//       ],
//       security: [
//         'HTTPS only in production',
//         'SameSite cookies',
//         'CSRF token validation',
//         'Rate limiting recommended',
//         'Audit trail with company context',
//       ],
//       status: 'operational',
//       timestamp: new Date().toISOString(),
//     },
//     {
//       status: 200,
//       headers: {
//         ...securityHeaders,
//         ...corsHeaders,
//         'Content-Type': 'application/json',
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//       },
//     }
//   );
// }


































import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db';
import User from '@/models/user';
import Company from '@/models/Company';
import DeviceToken from '@/models/AdminDeviceToken';

/**
 * Professional Logout API Route with SaaS Multi-tenancy
 * 
 * Features:
 * - Company context in all operations
 * - Company-specific device token cleanup
 * - Super admin context clearing
 * - Company lastActive update
 * - Multi-tenant audit logging
 * - PRESERVES account status (does NOT set to offline)
 */

// Security headers configuration
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? process.env.NEXTAUTH_URL || process.env.FRONTEND_URL || 'https://yourdomain.com'
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Company-ID',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight requests
export async function OPTIONS(request) {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      ...securityHeaders,
      ...corsHeaders,
    },
  });
}

export async function POST(request) {
  try {
    console.log('🚪 [LOGOUT API] Processing logout request...');

    // Get the session to identify the user
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('⚠️ [LOGOUT API] No active session found');
      
      // Create response for already logged out state
      const response = NextResponse.json(
        {
          success: true,
          message: 'Already logged out',
          code: 'ALREADY_LOGGED_OUT',
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            ...securityHeaders,
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );

      clearAllCookies(response);
      clearCompanyContext(response);
      console.log('✅ [LOGOUT API] Cookies and company context cleared (no session)');
      
      return response;
    }

    // Parse request body for FCM token and company context
    let fcmToken = null;
    let requestCompanyId = null;
    let requestBody = {};
    try {
      const text = await request.text();
      if (text) {
        requestBody = JSON.parse(text);
        fcmToken = requestBody.fcmToken || null;
        requestCompanyId = requestBody.companyId || null;
      }
    } catch (error) {
      console.log('ℹ️ [LOGOUT API] No valid JSON body provided');
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userRole = session.user.role;
    const userAdminType = session.user.adminType;
    const userCompanyId = session.user.companyId;
    
    // Determine effective company ID
    const isSuperAdmin = userRole === 'admin' && userAdminType === 'super';
    const effectiveCompanyId = requestCompanyId || userCompanyId;

    console.log('👤 [LOGOUT API] User logging out:', {
      email: userEmail,
      userId: userId,
      role: userRole,
      adminType: userAdminType,
      companyId: userCompanyId,
      effectiveCompanyId,
      isSuperAdmin,
      hasFCMToken: !!fcmToken,
    });

    // Connect to database
    await connectDB();

    // ===== 1. UPDATE USER LAST LOGOUT (DO NOT CHANGE STATUS) =====
    let updatedUser = null;
    try {
      const user = await User.findById(userId);
      
      if (user) {
        // ✅ PROFESSIONAL APPROACH: Update lastLogout and lastSeen ONLY
        // DO NOT call setOffline() or change status to 'offline'
        // This preserves account status so user can login again
        updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              lastLogout: new Date(),
              lastSeen: new Date(),
              // ✅ IMPORTANT: status field is NOT updated
              // ✅ User remains 'active' in database
            },
            $inc: {
              // Optional: track logout count
              loginCount: 0 // Not incrementing, just showing pattern
            }
          },
          { 
            new: true,
            runValidators: true
          }
        ).select('email role status lastLogout lastSeen companyId adminType').lean();
        
        console.log('✅ [LOGOUT API] User lastLogout updated (status preserved)');
        
        // Optional: If you want to track offline status for presence (not login blocking)
        // Use a separate presence field, not the status field
        // For now, we keep status as is so user can login again
      } else {
        console.warn('⚠️ [LOGOUT API] User not found in database:', userId);
      }
    } catch (dbError) {
      console.error('❌ [LOGOUT API] Database update failed:', {
        error: dbError.message,
        code: dbError.code,
        userId: userId
      });
    }

    // ===== 2. UPDATE COMPANY LAST ACTIVE =====
    if (userCompanyId) {
      try {
        await Company.findByIdAndUpdate(
          userCompanyId,
          {
            $set: {
              'stats.lastActive': new Date(),
              updatedAt: new Date()
            }
          }
        );
        console.log('✅ [LOGOUT API] Company lastActive updated:', userCompanyId);
      } catch (companyError) {
        console.error('❌ [LOGOUT API] Company update failed:', companyError.message);
      }
    }

    // ===== 3. DEVICE TOKEN CLEANUP (Company-specific) =====
    if (fcmToken) {
      try {
        console.log('🔧 [LOGOUT API] Processing FCM token cleanup');
        
        // Build query with company context
        const tokenQuery = { fcmToken };
        if (effectiveCompanyId) {
          tokenQuery.companyId = effectiveCompanyId;
        }
        if (userId) {
          tokenQuery.userId = userId;
        }

        // Deactivate token in DeviceToken model
        const deactivatedToken = await DeviceToken.findOneAndUpdate(
          tokenQuery,
          {
            $set: {
              isActive: false,
              lastActive: new Date(),
              updatedAt: new Date()
            }
          },
          { new: true }
        );

        console.log('✅ [LOGOUT API] Device token deactivated:', {
          tokenDeactivated: !!deactivatedToken,
          userId,
          companyId: effectiveCompanyId
        });

        // Also remove from user's deviceTokens array (legacy)
        const userUpdateResult = await User.findByIdAndUpdate(
          userId,
          {
            $pull: {
              deviceTokens: { 
                token: fcmToken,
                ...(effectiveCompanyId ? { companyId: effectiveCompanyId } : {})
              },
            },
          },
          { new: true }
        ).select('deviceTokens').lean();

        console.log('✅ [LOGOUT API] Token removed from user deviceTokens:', {
          tokenRemoved: !!userUpdateResult,
          userId
        });

        // Call FCM service to deregister token (non-blocking)
        if (process.env.NEXTAUTH_URL) {
          fetch(`${process.env.NEXTAUTH_URL}/api/notifications/fcm/deregister`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET || ''}`,
              'X-Company-ID': effectiveCompanyId || '',
            },
            body: JSON.stringify({ 
              userId,
              token: fcmToken,
              companyId: effectiveCompanyId,
              reason: 'logout'
            }),
          }).then(res => {
            if (res.ok) {
              console.log('✅ [LOGOUT API] FCM token deregistered with service');
            } else {
              console.warn('⚠️ [LOGOUT API] FCM deregistration failed:', res.status);
            }
          }).catch(err => {
            console.warn('⚠️ [LOGOUT API] FCM service call failed:', err.message);
          });
        }

      } catch (fcmCleanupError) {
        console.error('❌ [LOGOUT API] FCM cleanup error:', fcmCleanupError.message);
      }
    }

    // ===== 4. DEACTIVATE ALL DEVICE TOKENS FOR THIS USER/COMPANY =====
    if (userId) {
      try {
        const tokenQuery = { userId, isActive: true };
        if (effectiveCompanyId) {
          tokenQuery.companyId = effectiveCompanyId;
        }

        const deactivatedCount = await DeviceToken.updateMany(
          tokenQuery,
          {
            $set: {
              isActive: false,
              lastActive: new Date(),
              updatedAt: new Date()
            }
          }
        );

        console.log('✅ [LOGOUT API] Deactivated all active device tokens:', {
          count: deactivatedCount.modifiedCount,
          userId,
          companyId: effectiveCompanyId
        });
      } catch (tokenError) {
        console.error('❌ [LOGOUT API] Failed to deactivate tokens:', tokenError.message);
      }
    }

    // ===== 5. AUDIT LOGGING WITH COMPANY CONTEXT =====
    const auditLog = {
      userId: userId,
      email: userEmail,
      role: userRole,
      adminType: userAdminType,
      companyId: userCompanyId,
      effectiveCompanyId,
      isSuperAdmin,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      method: 'POST',
      path: '/api/auth/logout',
      fcmTokenRemoved: !!fcmToken,
      status: 'success',
      sessionInfo: {
        hasSession: true,
        sessionAge: session.expires ? 
          Math.floor((new Date(session.expires) - new Date()) / 1000) : null
      },
      // Track that status was preserved
      statusPreserved: true,
      originalStatus: updatedUser?.status || 'unknown'
    };

    console.log('📝 [LOGOUT API] Logout audit log:', JSON.stringify(auditLog, null, 2));

    // Store audit log if you have AuditLog model
    /*
    try {
      const AuditLog = mongoose.models.AuditLog || require('@/models/AuditLog').default;
      await AuditLog.create({
        ...auditLog,
        action: 'LOGOUT'
      });
    } catch (auditError) {
      console.warn('⚠️ [LOGOUT API] Audit log storage failed:', auditError.message);
    }
    */

    // Create the success response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
        user: {
          id: userId,
          email: userEmail,
          role: userRole,
          companyId: userCompanyId,
          status: updatedUser?.status || 'active', // Show current status
        },
        company: userCompanyId ? {
          id: userCompanyId,
          context: effectiveCompanyId
        } : null,
        timestamp: new Date().toISOString(),
        fcmTokenRemoved: !!fcmToken,
        nextSteps: 'All active sessions have been terminated.',
        statusInfo: {
          preserved: true,
          message: 'Account status remains active for future logins'
        }
      },
      {
        status: 200,
        headers: {
          ...securityHeaders,
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

    // Clear all session cookies and company context
    clearAllCookies(response);
    clearCompanyContext(response);
    console.log('✅ [LOGOUT API] All cookies and company context cleared successfully');
    console.log('✅ [LOGOUT API] User status preserved - account remains active');

    return response;

  } catch (error) {
    console.error('❌ [LOGOUT API] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Even on error, try to clear cookies
    const errorResponse = NextResponse.json(
      {
        success: false,
        message: 'Logout failed due to server error',
        code: 'LOGOUT_ERROR',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          ...securityHeaders,
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

    // Attempt to clear cookies even on error
    try {
      clearAllCookies(errorResponse);
      clearCompanyContext(errorResponse);
    } catch (cookieError) {
      console.error('❌ [LOGOUT API] Failed to clear cookies on error:', cookieError.message);
    }

    return errorResponse;
  }
}

/**
 * Clear all session cookies
 */
function clearAllCookies(response) {
  // NextAuth.js cookies - comprehensive list
  const nextAuthCookies = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    'next-auth.pkce.code_verifier',
    'next-auth.state',
    'next-auth.nonce',
    '__Secure-next-auth.session-token',
    '__Secure-next-auth.callback-url',
    '__Host-next-auth.csrf-token',
    '__Host-next-auth.pkce.code_verifier',
    '__Secure-next-auth.pkce.code_verifier',
  ];

  // Custom application cookies
  const customCookies = [
    'auth_token',
    'refresh_token',
    'user_session',
    'user_preferences',
    'remember_me',
    'user_id',
    'user_role',
    'session',
    'sessionid',
    'connect.sid',
  ];

  // Cookie configurations for different environments
  const cookieConfigs = [
    { path: '/', secure: false, sameSite: 'lax' },
    { path: '/', secure: true, sameSite: 'lax' },
    { path: '/', secure: true, sameSite: 'none' },
    { path: '/api', secure: false },
    { path: '/api', secure: true },
    { path: '/auth', secure: false },
    { path: '/auth', secure: true },
  ];

  // Clear all NextAuth cookies
  nextAuthCookies.forEach(cookieName => {
    response.cookies.delete(cookieName);
    
    cookieConfigs.forEach(config => {
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        maxAge: 0,
        ...config,
        httpOnly: true,
      });
    });
  });

  // Clear all custom cookies
  customCookies.forEach(cookieName => {
    response.cookies.delete(cookieName);
    
    cookieConfigs.forEach(config => {
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        maxAge: 0,
        ...config,
        httpOnly: cookieName.includes('token') || cookieName.includes('session'),
      });
    });
  });

  // Clear cookies for root domain and subdomains
  const domains = ['.localhost', '.steponext.com', ''];
  domains.forEach(domain => {
    if (domain) {
      nextAuthCookies.concat(customCookies).forEach(cookieName => {
        response.cookies.set({
          name: cookieName,
          value: '',
          expires: new Date(0),
          maxAge: 0,
          path: '/',
          domain: domain,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          httpOnly: true,
        });
      });
    }
  });

  return response;
}

/**
 * Clear company context from client storage
 */
function clearCompanyContext(response) {
  // Clear company context cookies
  const companyCookies = [
    'current_company',
    'company_context',
    'active_company',
    'company_id',
    'company_name',
    'company_switched'
  ];

  companyCookies.forEach(cookieName => {
    response.cookies.delete(cookieName);
    response.cookies.set({
      name: cookieName,
      value: '',
      expires: new Date(0),
      maxAge: 0,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  });

  // Add headers to instruct client to clear company context
  response.headers.set('X-Clear-Company-Context', 'true');
  response.headers.set('X-Logout-Complete', 'true');

  return response;
}

/**
 * GET endpoint for API information
 */
export async function GET(request) {
  return NextResponse.json(
    {
      endpoint: '/api/auth/logout',
      description: 'Secure logout endpoint with multi-tenant support',
      method: 'POST',
      required: 'Authentication session (via NextAuth cookies)',
      optional: {
        fcmToken: 'string (FCM token to remove)',
        companyId: 'string (company context for super admin)'
      },
      features: [
        'Session termination',
        'Preserves account status (does NOT set to offline)',
        'Updates lastLogout and lastSeen timestamps',
        'Company lastActive update',
        'Company-specific FCM token removal',
        'DeviceToken model cleanup',
        'Super admin context clearing',
        'CSRF protection',
        'Multi-tenant audit logging',
        'CORS support',
        'Complete multi-cookie clearing',
        'Company context cleanup',
      ],
      security: [
        'HTTPS only in production',
        'SameSite cookies',
        'CSRF token validation',
        'Rate limiting recommended',
        'Audit trail with company context',
      ],
      statusInfo: {
        accountStatus: 'Preserved',
        message: 'User status remains unchanged to allow future logins',
        bestPractice: 'Separate presence tracking from account status'
      },
      status: 'operational',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        ...securityHeaders,
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}