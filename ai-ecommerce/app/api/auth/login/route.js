// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import User from "@/models/user";
// import rateLimit from "@/lib/rate-limit";

// // Rate limiter for login attempts
// const limiter = rateLimit({
//   interval: 15 * 60 * 1000, // 15 minutes
//   uniqueTokenPerInterval: 1000, // Max 1000 unique users per interval
// });

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
//     ? process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000' 
//     : '*',
//   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//   'Access-Control-Allow-Credentials': 'true',
//   'Access-Control-Max-Age': '86400',
// };

// export async function OPTIONS(request) {
//   return NextResponse.json(null, {
//     status: 200,
//     headers: corsHeaders,
//   });
// }

// export async function POST(request) {
//   try {
//     console.log("🔐 [LOGIN API] Processing login request...");

//     // Get client IP for rate limiting
//     const ip = request.headers.get('x-forwarded-for') || 
//                request.headers.get('x-real-ip') || 
//                request.ip || 
//                'unknown';
    
//     // Apply rate limiting
//     try {
//       await limiter.check(10, ip); // 10 login attempts per IP per 15 minutes
//     } catch (rateLimitError) {
//       console.warn("⚠️ [LOGIN API] Rate limit exceeded for IP:", ip);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Too many login attempts. Please try again later.",
//           code: "RATE_LIMIT_EXCEEDED",
//           retryAfter: "15 minutes",
//         },
//         {
//           status: 429,
//           headers: {
//             ...corsHeaders,
//             'Retry-After': '900',
//           },
//         }
//       );
//     }

//     // Parse request body
//     let body;
//     try {
//       body = await request.json();
//     } catch (error) {
//       console.error("❌ [LOGIN API] JSON parse error:", error);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid JSON data in request",
//           code: "INVALID_JSON",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     const { email, password, rememberMe = false } = body;

//     // Validate input
//     if (!email || !password) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email and password are required",
//           code: "CREDENTIALS_REQUIRED",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid email format",
//           code: "INVALID_EMAIL",
//           field: "email",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Connect to database
//     await connectDB();

//     // ✅ CRITICAL FIX 1: Select ALL required fields including password
//     const user = await User.findOne({ 
//       email: email.toLowerCase().trim() 
//     }).select(
//       '+password ' +              // Password field (select: false)
//       '+security.failedLoginAttempts ' +
//       'status isVerified role fullName phone _id email ' +
//       'lastLogin lastSeen lastLogout notificationSettings ' +
//       'activeSessions'
//     );

//     // For security, always return same error message
//     if (!user) {
//       console.log("❌ [LOGIN API] User not found for email:", email);
      
//       // Add small delay to prevent timing attacks
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid email or password",
//           code: "INVALID_CREDENTIALS",
//         },
//         {
//           status: 401,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // ✅ FIXED 2: Check account status with proper messages for all statuses
//     if (user.status !== 'active') {
//       const statusMessages = {
//         'inactive': 'Your account is inactive. Please contact support.',
//         'suspended': 'Your account has been suspended.',
//         'deleted': 'This account has been deleted.',
//         'pending': 'Please verify your email address before logging in.',
//         'offline': 'Your account is offline. Please contact support if this persists.'
//       };
      
//       console.log("⚠️ [LOGIN API] Non-active account attempt:", {
//         email: user.email,
//         status: user.status
//       });
      
//       // Record failed login attempt for non-active account
//       await User.findByIdAndUpdate(user._id, {
//         $inc: { 'security.failedLoginAttempts': 1 },
//         $set: { 'security.lastFailedLogin': new Date() },
//         $push: {
//           'security.loginHistory': {
//             timestamp: new Date(),
//             ip,
//             userAgent: request.headers.get('user-agent') || 'Unknown',
//             success: false,
//             reason: `Account ${user.status}`
//           }
//         }
//       });
      
//       return NextResponse.json(
//         {
//           success: false,
//           message: statusMessages[user.status] || 'Account is not active',
//           code: user.status === 'pending' ? 'EMAIL_NOT_VERIFIED' : 'ACCOUNT_INACTIVE',
//           status: user.status,
//           requiresVerification: user.status === 'pending',
//           canRequestNew: user.status === 'pending' || user.status === 'offline',
//         },
//         {
//           status: 403,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Check if email is verified
//     if (!user.isVerified) {
//       console.log("⚠️ [LOGIN API] Unverified email attempt:", user.email);
      
//       // Record failed login attempt for unverified account
//       await User.findByIdAndUpdate(user._id, {
//         $inc: { 'security.failedLoginAttempts': 1 },
//         $set: { 'security.lastFailedLogin': new Date() },
//         $push: {
//           'security.loginHistory': {
//             timestamp: new Date(),
//             ip,
//             userAgent: request.headers.get('user-agent') || 'Unknown',
//             success: false,
//             reason: 'Email not verified'
//           }
//         }
//       });
      
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please verify your email address before logging in",
//           code: "EMAIL_NOT_VERIFIED",
//           requiresVerification: true,
//           email: user.email,
//         },
//         {
//           status: 403,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // ✅ FIXED 3: Verify password with error handling
//     let isPasswordValid = false;
//     try {
//       isPasswordValid = await user.comparePassword(password);
//     } catch (passwordError) {
//       console.error("❌ [LOGIN API] Password comparison error:", passwordError);
//       isPasswordValid = false;
//     }

//     if (!isPasswordValid) {
//       console.log("❌ [LOGIN API] Invalid password for user:", user.email);
      
//       // ✅ Track failed login attempts
//       await User.findByIdAndUpdate(user._id, {
//         $inc: { 'security.failedLoginAttempts': 1 },
//         $set: { 'security.lastFailedLogin': new Date() },
//         $push: {
//           'security.loginHistory': {
//             timestamp: new Date(),
//             ip,
//             userAgent: request.headers.get('user-agent') || 'Unknown',
//             success: false,
//             reason: 'Invalid password'
//           }
//         }
//       });
      
//       // Add small delay to prevent timing attacks
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid email or password",
//           code: "INVALID_CREDENTIALS",
//         },
//         {
//           status: 401,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // ✅ FIXED 4: Reset failed login attempts and record successful login
//     const userAgent = request.headers.get('user-agent') || 'Unknown';
    
//     // Use the recordLogin method from your User model
//     await user.recordLogin(ip, userAgent);
    
//     // Also update lastSeen and status
//     await user.setOnline(ip, userAgent);

//     // ✅ FIXED 5: Session management (if activeSessions exists in schema)
//     const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
//     const sessionExpiry = rememberMe 
//       ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
//       : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

//     // Only add session if activeSessions field exists in schema
//     try {
//       if (user.activeSessions !== undefined) {
//         await User.findByIdAndUpdate(user._id, {
//           $push: {
//             activeSessions: {
//               sessionId,
//               userAgent,
//               ipAddress: ip,
//               loginTime: new Date(),
//               lastActivity: new Date(),
//               expiresAt: sessionExpiry,
//               rememberMe,
//               status: 'active'
//             }
//           }
//         });
//       }
//     } catch (sessionError) {
//       console.warn("⚠️ [LOGIN API] Session tracking failed (non-critical):", sessionError.message);
//     }

//     console.log("✅ [LOGIN API] Login successful for user:", {
//       email: user.email,
//       role: user.role,
//       status: user.status,
//       rememberMe
//     });

//     // ✅ FIXED 6: Prepare user response (exclude sensitive data)
//     const userResponse = {
//       id: user._id.toString(),
//       _id: user._id.toString(),
//       fullName: user.fullName,
//       name: user.fullName,
//       email: user.email,
//       role: user.role,
//       isVerified: user.isVerified,
//       phone: user.phone,
//       status: user.status,
//       isOnline: true,
//       lastLogin: user.lastLogin,
//       lastSeen: user.lastSeen,
//       hasActiveNotifications: user.notificationSettings?.pushNotifications?.enabled || false,
//     };

//     // Log successful login for security audit
//     console.log("📝 [LOGIN API] Login audit log:", {
//       email: user.email,
//       userId: user._id.toString(),
//       role: user.role,
//       ip,
//       timestamp: new Date().toISOString(),
//       userAgent,
//       rememberMe,
//       status: 'success'
//     });

//     // Return success response
//     return NextResponse.json({
//       success: true,
//       message: "Login successful",
//       user: userResponse,
//       sessionId,
//       expiresAt: sessionExpiry,
//       redirectTo: user.role === 'admin' 
//         ? '/admin/dashboards' 
//         : user.role === 'manager' 
//           ? '/manager/dashboard' 
//           : '/dashboards',
//       timestamp: new Date().toISOString(),
//     }, {
//       status: 200,
//       headers: {
//         ...corsHeaders,
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//       },
//     });

//   } catch (error) {
//     console.error("❌ [LOGIN API] Unexpected error:", {
//       message: error.message,
//       stack: error.stack,
//       name: error.name
//     });
    
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Authentication failed. Please try again.",
//         code: "AUTHENTICATION_FAILED",
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: corsHeaders,
//       }
//     );
//   }
// }

// // GET endpoint for API information
// export async function GET() {
//   return NextResponse.json({
//     endpoint: "/api/auth/login",
//     method: "POST",
//     description: "User authentication endpoint",
//     required_fields: {
//       email: "string (valid email format)",
//       password: "string"
//     },
//     optional_fields: {
//       rememberMe: "boolean (default: false)"
//     },
//     security_features: [
//       "Rate limiting (10 attempts per 15 minutes per IP)",
//       "Secure password hashing with bcrypt",
//       "Session management",
//       "Account status validation (active/inactive/suspended/deleted/pending/offline)",
//       "Email verification check",
//       "Failed login attempt tracking",
//       "Login history recording",
//       "Security audit logging",
//       "Timing attack protection",
//     ],
//     response_format: {
//       success: "boolean",
//       message: "string",
//       user: "object",
//       sessionId: "string",
//       expiresAt: "ISO string",
//       redirectTo: "string",
//       timestamp: "ISO string",
//     },
//     error_codes: {
//       "INVALID_JSON": "Invalid request data",
//       "RATE_LIMIT_EXCEEDED": "Too many login attempts",
//       "CREDENTIALS_REQUIRED": "Email and password required",
//       "INVALID_EMAIL": "Invalid email format",
//       "INVALID_CREDENTIALS": "Invalid email or password",
//       "ACCOUNT_INACTIVE": "Account is not active",
//       "EMAIL_NOT_VERIFIED": "Email verification required",
//       "AUTHENTICATION_FAILED": "Server error during authentication",
//     },
//     status: "operational",
//     timestamp: new Date().toISOString(),
//   }, {
//     headers: corsHeaders,
//   });
// }









// above code is working without saas

















import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import Company from "@/models/Company";
import rateLimit from "@/lib/rate-limit";

// Rate limiter for login attempts
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 1000, // Max 1000 unique users per interval
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000' 
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS(request) {
  return NextResponse.json(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    console.log("🔐 [LOGIN API] Processing login request...");

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               request.ip || 
               'unknown';
    
    // Apply rate limiting
    try {
      await limiter.check(10, ip); // 10 login attempts per IP per 15 minutes
    } catch (rateLimitError) {
      console.warn("⚠️ [LOGIN API] Rate limit exceeded for IP:", ip);
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: "15 minutes",
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': '900',
          },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("❌ [LOGIN API] JSON parse error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON data in request",
          code: "INVALID_JSON",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { email, password, rememberMe = false } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
          code: "CREDENTIALS_REQUIRED",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
          code: "INVALID_EMAIL",
          field: "email",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Connect to database
    await connectDB();

    // ===== FIND USER WITH COMPANY DATA =====
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select(
      '+password ' +              // Password field (select: false)
      '+security.failedLoginAttempts ' +
      'status isVerified role fullName phone _id email ' +
      'lastLogin lastSeen lastLogout notificationSettings ' +
      'activeSessions adminType companyId' // Added adminType and companyId
    ).populate('companyId', 'companyName status subscription'); // Populate company data

    // For security, always return same error message
    if (!user) {
      console.log("❌ [LOGIN API] User not found for email:", email);
      
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // ===== CHECK ACCOUNT STATUS =====
    if (user.status !== 'active') {
      const statusMessages = {
        'inactive': 'Your account is inactive. Please contact support.',
        'suspended': 'Your account has been suspended.',
        'deleted': 'This account has been deleted.',
        'pending': 'Please verify your email address before logging in.',
        'offline': 'Your account is offline. Please contact support if this persists.'
      };
      
      console.log("⚠️ [LOGIN API] Non-active account attempt:", {
        email: user.email,
        status: user.status
      });
      
      // Record failed login attempt for non-active account
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'security.failedLoginAttempts': 1 },
        $set: { 'security.lastFailedLogin': new Date() },
        $push: {
          'security.loginHistory': {
            timestamp: new Date(),
            ip,
            userAgent: request.headers.get('user-agent') || 'Unknown',
            success: false,
            reason: `Account ${user.status}`
          }
        }
      });
      
      return NextResponse.json(
        {
          success: false,
          message: statusMessages[user.status] || 'Account is not active',
          code: user.status === 'pending' ? 'EMAIL_NOT_VERIFIED' : 'ACCOUNT_INACTIVE',
          status: user.status,
          requiresVerification: user.status === 'pending',
          canRequestNew: user.status === 'pending' || user.status === 'offline',
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      console.log("⚠️ [LOGIN API] Unverified email attempt:", user.email);
      
      // Record failed login attempt for unverified account
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'security.failedLoginAttempts': 1 },
        $set: { 'security.lastFailedLogin': new Date() },
        $push: {
          'security.loginHistory': {
            timestamp: new Date(),
            ip,
            userAgent: request.headers.get('user-agent') || 'Unknown',
            success: false,
            reason: 'Email not verified'
          }
        }
      });
      
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email address before logging in",
          code: "EMAIL_NOT_VERIFIED",
          requiresVerification: true,
          email: user.email,
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // ===== SAAS: CHECK COMPANY STATUS (for non-super-admin) =====
    const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
    
    if (!isSuperAdmin && user.companyId) {
      const company = user.companyId; // Already populated
      
      if (!company) {
        console.log("❌ [LOGIN API] Company not found for user:", user.email);
        
        return NextResponse.json(
          {
            success: false,
            message: "Your account is not associated with a valid company.",
            code: "COMPANY_NOT_FOUND",
          },
          { status: 403, headers: corsHeaders }
        );
      }

      // Check company status
      if (company.status !== 'active') {
        console.log("⚠️ [LOGIN API] Company not active:", {
          company: company.companyName,
          status: company.status
        });

        const companyStatusMessages = {
          'inactive': 'Your company account is inactive. Please contact support.',
          'suspended': 'Your company has been suspended.',
          'pending': 'Your company is pending approval.'
        };

        return NextResponse.json(
          {
            success: false,
            message: companyStatusMessages[company.status] || 'Company account is not active',
            code: `COMPANY_${company.status.toUpperCase()}`,
            companyStatus: company.status,
          },
          { status: 403, headers: corsHeaders }
        );
      }

      // Check subscription expiry
      if (company.subscription?.expiryDate && new Date(company.subscription.expiryDate) < new Date()) {
        console.log("⚠️ [LOGIN API] Company subscription expired:", company.companyName);

        return NextResponse.json(
          {
            success: false,
            message: "Your company subscription has expired. Please renew to continue.",
            code: "SUBSCRIPTION_EXPIRED",
          },
          { status: 403, headers: corsHeaders }
        );
      }
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (passwordError) {
      console.error("❌ [LOGIN API] Password comparison error:", passwordError);
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      console.log("❌ [LOGIN API] Invalid password for user:", user.email);
      
      // Track failed login attempts
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'security.failedLoginAttempts': 1 },
        $set: { 'security.lastFailedLogin': new Date() },
        $push: {
          'security.loginHistory': {
            timestamp: new Date(),
            ip,
            userAgent: request.headers.get('user-agent') || 'Unknown',
            success: false,
            reason: 'Invalid password'
          }
        }
      });
      
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Reset failed login attempts and record successful login
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Use the recordLogin method from your User model
    await user.recordLogin(ip, userAgent);
    
    // Also update lastSeen and status
    await user.setOnline(ip, userAgent);

    // Session management
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const sessionExpiry = rememberMe 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Only add session if activeSessions field exists in schema
    try {
      if (user.activeSessions !== undefined) {
        await User.findByIdAndUpdate(user._id, {
          $push: {
            activeSessions: {
              sessionId,
              userAgent,
              ipAddress: ip,
              loginTime: new Date(),
              lastActivity: new Date(),
              expiresAt: sessionExpiry,
              rememberMe,
              status: 'active'
            }
          }
        });
      }
    } catch (sessionError) {
      console.warn("⚠️ [LOGIN API] Session tracking failed (non-critical):", sessionError.message);
    }

    // ===== UPDATE COMPANY LAST ACTIVE =====
    if (user.companyId) {
      try {
        await Company.findByIdAndUpdate(
          user.companyId._id || user.companyId,
          {
            $set: {
              'stats.lastActive': new Date(),
              updatedAt: new Date()
            }
          }
        );
      } catch (companyError) {
        console.warn("⚠️ [LOGIN API] Failed to update company lastActive:", companyError.message);
      }
    }

    console.log("✅ [LOGIN API] Login successful for user:", {
      email: user.email,
      role: user.role,
      adminType: user.adminType,
      companyId: user.companyId?._id || user.companyId,
      status: user.status,
      rememberMe
    });

    // ===== PREPARE USER RESPONSE WITH COMPANY CONTEXT =====
    const userResponse = {
      id: user._id.toString(),
      _id: user._id.toString(),
      fullName: user.fullName,
      name: user.fullName,
      email: user.email,
      role: user.role,
      adminType: user.adminType || null,
      isVerified: user.isVerified,
      phone: user.phone,
      status: user.status,
      isOnline: true,
      lastLogin: user.lastLogin,
      lastSeen: user.lastSeen,
      hasActiveNotifications: user.notificationSettings?.pushNotifications?.enabled || false,
      
      // ===== SAAS: COMPANY CONTEXT =====
      companyId: user.companyId?._id?.toString() || user.companyId?.toString() || null,
      companyName: user.companyId?.companyName || null,
      companyStatus: user.companyId?.status || null,
      
      // ===== ROLE HELPERS =====
      isAdmin: user.role === 'admin',
      isSuperAdmin: user.role === 'admin' && user.adminType === 'super',
      isCompanyAdmin: user.role === 'admin' && user.adminType === 'company',
      isManager: user.role === 'manager',
    };

    // Log successful login for security audit
    console.log("📝 [LOGIN API] Login audit log:", {
      email: user.email,
      userId: user._id.toString(),
      role: user.role,
      adminType: user.adminType,
      companyId: user.companyId?._id?.toString() || user.companyId?.toString(),
      ip,
      timestamp: new Date().toISOString(),
      userAgent,
      rememberMe,
      status: 'success'
    });

    // Determine redirect path based on role
    let redirectTo = '/dashboards';
    if (userResponse.isSuperAdmin) {
      redirectTo = '/super-admin/dashboard';
    } else if (userResponse.isCompanyAdmin) {
      redirectTo = '/admin/dashboards';
    } else if (user.role === 'manager') {
      redirectTo = '/manager/dashboard';
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userResponse,
      sessionId,
      expiresAt: sessionExpiry,
      redirectTo,
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error("❌ [LOGIN API] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed. Please try again.",
        code: "AUTHENTICATION_FAILED",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// GET endpoint for API information
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/auth/login",
    method: "POST",
    description: "Multi-tenant user authentication endpoint",
    required_fields: {
      email: "string (valid email format)",
      password: "string"
    },
    optional_fields: {
      rememberMe: "boolean (default: false)"
    },
    security_features: [
      "Rate limiting (10 attempts per 15 minutes per IP)",
      "Secure password hashing with bcrypt",
      "Session management",
      "Account status validation (active/inactive/suspended/deleted/pending/offline)",
      "Email verification check",
      "Failed login attempt tracking",
      "Login history recording",
      "Security audit logging",
      "Timing attack protection",
      "Company status validation",
      "Subscription expiry check",
      "Multi-tenant isolation",
    ],
    saas_features: [
      "Company validation during login",
      "Company status check (active/inactive/suspended/pending)",
      "Subscription expiry validation",
      "Super admin vs company admin distinction",
      "Company context in user response",
      "Role-based redirects (super-admin, admin, manager)",
    ],
    response_format: {
      success: "boolean",
      message: "string",
      user: {
        id: "string",
        email: "string",
        role: "string",
        adminType: "string (super/company)",
        companyId: "string",
        companyName: "string",
        companyStatus: "string",
        isSuperAdmin: "boolean",
        isCompanyAdmin: "boolean",
        // ... other user fields
      },
      sessionId: "string",
      expiresAt: "ISO string",
      redirectTo: "string",
      timestamp: "ISO string",
    },
    error_codes: {
      "INVALID_JSON": "Invalid request data",
      "RATE_LIMIT_EXCEEDED": "Too many login attempts",
      "CREDENTIALS_REQUIRED": "Email and password required",
      "INVALID_EMAIL": "Invalid email format",
      "INVALID_CREDENTIALS": "Invalid email or password",
      "ACCOUNT_INACTIVE": "Account is not active",
      "EMAIL_NOT_VERIFIED": "Email verification required",
      "COMPANY_NOT_FOUND": "Company not found",
      "COMPANY_INACTIVE": "Company is inactive",
      "COMPANY_SUSPENDED": "Company is suspended",
      "COMPANY_PENDING": "Company pending approval",
      "SUBSCRIPTION_EXPIRED": "Company subscription expired",
      "AUTHENTICATION_FAILED": "Server error during authentication",
    },
    status: "operational",
    timestamp: new Date().toISOString(),
  }, {
    headers: corsHeaders,
  });
}