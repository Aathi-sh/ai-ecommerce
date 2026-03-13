// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import User from "@/models/user";
// import crypto from "crypto";
// import rateLimit from "@/lib/rate-limit";

// // Rate limiter for verification attempts
// const limiter = rateLimit({
//   interval: 60 * 60 * 1000, // 1 hour
//   uniqueTokenPerInterval: 1000, // Max 1000 unique tokens per hour
// });

// // ✅ ONLY ONE GET FUNCTION - handles both verification AND API info
// export async function GET(request) {
//   try {
//     console.log("📧 [VERIFY-EMAIL API] GET request received");
    
//     // Get token from URL parameters
//     const { searchParams } = new URL(request.url);
//     const token = searchParams.get('token');
    
//     console.log("🔑 [VERIFY-EMAIL API] Token from GET:", token ? token.substring(0, 20) + '...' : 'No token');
    
//     // If token exists, process verification
//     if (token) {
//       // Create a mock request object for the POST handler
//       const mockRequest = {
//         json: async () => ({ token }),
//         headers: request.headers,
//         ip: request.headers.get('x-forwarded-for') || 'unknown'
//       };
      
//       // Call the existing POST handler
//       return POST(mockRequest);
//     }
    
//     // If no token, return API info
//     return NextResponse.json({
//       endpoint: "/api/auth/verify-email",
//       methods: {
//         GET: "Verify email via URL: /api/auth/verify-email?token=YOUR_TOKEN",
//         POST: "Verify email via JSON: { token: 'YOUR_TOKEN' }",
//         PUT: "Resend verification email",
//       },
//       status: "operational",
//       timestamp: new Date().toISOString(),
//     });
    
//   } catch (error) {
//     console.error("❌ [VERIFY-EMAIL API] GET error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Verification failed",
//         code: "VERIFICATION_FAILED",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// // POST method for programmatic verification
// export async function POST(request) {
//   try {
//     console.log("📧 [VERIFY-EMAIL API] Processing email verification request...");

//     // Parse request body
//     let body;
//     try {
//       body = await request.json();
//     } catch (error) {
//       console.error("❌ [VERIFY-EMAIL API] JSON parse error:", error);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid JSON data in request",
//           code: "INVALID_JSON",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     const { token } = body;

//     // Validate token
//     if (!token || typeof token !== 'string' || token.trim().length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Verification token is required and must be a valid string",
//           code: "TOKEN_REQUIRED",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // Trim the token
//     const cleanToken = token.trim();
//     console.log("🔑 [VERIFY-EMAIL API] Clean token:", cleanToken.substring(0, 20) + '...');

//     // Apply rate limiting based on token
//     try {
//       await limiter.check(10, cleanToken); // 10 attempts per token per hour
//     } catch (rateLimitError) {
//       console.warn("⚠️ [VERIFY-EMAIL API] Rate limit exceeded for token:", cleanToken.substring(0, 10) + '...');
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Too many verification attempts. Please request a new verification email.",
//           code: "RATE_LIMIT_EXCEEDED",
//           retryAfter: "1 hour",
//         },
//         {
//           status: 429,
//           headers: {
//             'Retry-After': '3600',
//           },
//         }
//       );
//     }

//     // Connect to database
//     await connectDB();

//     // Hash the token
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(cleanToken)
//       .digest("hex");

//     console.log("🔐 [VERIFY-EMAIL API] Hashed token:", hashedToken.substring(0, 20) + '...');

//     // Find user with valid verification token
//     const user = await User.findOne({
//       verificationToken: hashedToken,
//       verificationTokenExpires: { $gt: Date.now() }, // Token not expired
//       status: { $in: ['active', 'pending'] }, // Allow pending users
//     });

//     if (!user) {
//       console.log("❌ [VERIFY-EMAIL API] Invalid or expired verification token");
      
//       // Try to find if token was already used or expired
//       const expiredUser = await User.findOne({
//         verificationToken: hashedToken,
//       });

//       let message = "Invalid or expired verification token";
//       let code = "INVALID_TOKEN";
//       let canResend = true;

//       if (expiredUser) {
//         if (expiredUser.isVerified) {
//           message = "Email already verified. You can log in now.";
//           code = "ALREADY_VERIFIED";
//           canResend = false;
//         } else if (expiredUser.verificationTokenExpires < Date.now()) {
//           message = "Verification token has expired. Please request a new one.";
//           code = "TOKEN_EXPIRED";
//           canResend = true;
//         }
//       }

//       return NextResponse.json(
//         {
//           success: false,
//           message,
//           code,
//           canResend,
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // Check if user is already verified
//     if (user.isVerified) {
//       console.log("⚠️ [VERIFY-EMAIL API] User already verified:", user.email);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email already verified. You can log in now.",
//           code: "ALREADY_VERIFIED",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // Update user verification status
//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpires = undefined;
//     user.status = 'active'; // Ensure user is active
//     user.emailVerifiedAt = new Date();
    
//     // If this is the first verification, set up default notification settings
//     if (!user.notificationSettings) {
//       user.notificationSettings = {
//         pushNotifications: {
//           enabled: user.role === 'admin',
//           lastUpdated: new Date(),
//         },
//         settingsUpdatedAt: new Date(),
//       };
//     }

//     await user.save({ validateBeforeSave: false });

//     console.log("✅ [VERIFY-EMAIL API] Email verified successfully for user:", user.email);

//     // Send welcome email (optional)
//     try {
//       const { sendEmail } = await import('@/utils/email');
      
//       await sendEmail({
//         to: user.email,
//         subject: "🎉 Welcome to Steponext - Email Verified Successfully!",
//         html: `
//           <!DOCTYPE html>
//           <html>
//           <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Welcome to Steponext!</title>
//           </head>
//           <body>
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//               <h2>Welcome to Steponext!</h2>
//               <p>Hello ${user.fullName},</p>
//               <p>Your email has been successfully verified!</p>
//               <p>You can now <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login">log in to your account</a>.</p>
//             </div>
//           </body>
//           </html>
//         `,
//       });
      
//       console.log("✅ [VERIFY-EMAIL API] Welcome email sent to:", user.email);
//     } catch (emailError) {
//       console.error("⚠️ [VERIFY-EMAIL API] Welcome email failed:", emailError);
//       // Continue - email failure shouldn't block verification
//     }

//     // Return success response
//     return NextResponse.json({
//       success: true,
//       message: "Email verified successfully!",
//       user: {
//         id: user._id.toString(),
//         email: user.email,
//         name: user.fullName,
//         role: user.role,
//         isVerified: true,
//       },
//       redirectTo: "/login?verified=true",
//       nextSteps: "You can now log in to your account.",
//       timestamp: new Date().toISOString(),
//     });

//   } catch (error) {
//     console.error("❌ [VERIFY-EMAIL API] Unexpected error:", error);
    
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to verify email",
//         code: "VERIFICATION_FAILED",
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// // PUT method for resending verification email
// export async function PUT(request) {
//   try {
//     console.log("📧 [VERIFY-EMAIL API] Resending verification email...");

//     // Parse request body
//     let body;
//     try {
//       body = await request.json();
//     } catch (error) {
//       console.error("❌ [VERIFY-EMAIL API] JSON parse error:", error);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid JSON data in request",
//           code: "INVALID_JSON",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     const { email } = body;

//     // Validate email
//     if (!email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email is required",
//           code: "EMAIL_REQUIRED",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // Rate limiting for resend requests
//     const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
//     try {
//       await limiter.check(3, ip); // 3 resend attempts per IP per hour
//     } catch (rateLimitError) {
//       console.warn("⚠️ [VERIFY-EMAIL API] Resend rate limit exceeded for IP:", ip);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Too many resend requests. Please try again later.",
//           code: "RATE_LIMIT_EXCEEDED",
//           retryAfter: "1 hour",
//         },
//         {
//           status: 429,
//           headers: {
//             'Retry-After': '3600',
//           },
//         }
//       );
//     }

//     // Connect to database
//     await connectDB();

//     // Find user by email
//     const user = await User.findOne({ 
//       email: email.toLowerCase().trim(),
//       isVerified: false, // Only resend for unverified users
//       status: { $in: ['active', 'pending'] },
//     });

//     // For security, always return success even if user doesn't exist or is already verified
//     if (!user) {
//       console.log("⚠️ [VERIFY-EMAIL API] User not found or already verified:", email);
//       return NextResponse.json({
//         success: true,
//         message: "If an account exists with this email and needs verification, a new link has been sent.",
//         sent: true,
//         timestamp: new Date().toISOString(),
//       });
//     }

//     // Check last resend time (prevent spam)
//     const lastResendWindow = Date.now() - (5 * 60 * 1000); // 5 minutes
//     if (user.lastVerificationResend && user.lastVerificationResend > lastResendWindow) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please wait 5 minutes before requesting another verification email.",
//           code: "RESEND_COOLDOWN",
//           retryAfter: "5 minutes",
//         },
//         {
//           status: 429,
//           headers: {
//             'Retry-After': '300',
//           },
//         }
//       );
//     }

//     // Generate new verification token
//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(verificationToken)
//       .digest("hex");

//     // Update user with new token
//     user.verificationToken = hashedToken;
//     user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//     user.lastVerificationResend = new Date();
    
//     await user.save({ validateBeforeSave: false });

//     console.log("✅ [VERIFY-EMAIL API] New verification token generated for:", user.email);

//     // Send new verification email
//     try {
//       const { sendEmail } = await import('@/utils/email');
//       const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
//       await sendEmail({
//         to: user.email,
//         subject: "New Verification Link - Steponext",
//         html: `
//           <!DOCTYPE html>
//           <html>
//           <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>New Verification Link</title>
//             <style>
//               body {
//                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                 line-height: 1.6;
//                 color: #333;
//                 max-width: 600px;
//                 margin: 0 auto;
//                 padding: 20px;
//               }
//               .header {
//                 background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//                 color: white;
//                 padding: 30px;
//                 text-align: center;
//                 border-radius: 10px 10px 0 0;
//               }
//               .content {
//                 background: #f9f9f9;
//                 padding: 30px;
//                 border-radius: 0 0 10px 10px;
//               }
//               .button {
//                 display: inline-block;
//                 padding: 14px 28px;
//                 background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 8px;
//                 font-weight: bold;
//                 margin: 20px 0;
//               }
//               .info-box {
//                 background: #fffbeb;
//                 border: 1px solid #fde68a;
//                 border-radius: 8px;
//                 padding: 16px;
//                 margin: 20px 0;
//                 color: #92400e;
//               }
//             </style>
//           </head>
//           <body>
//             <div class="header">
//               <h2>New Verification Link</h2>
//             </div>
//             <div class="content">
//               <h3>Hello ${user.fullName},</h3>
//               <p>We've generated a new verification link for your Steponext account.</p>
              
//               <div style="text-align: center;">
//                 <a href="${verificationUrl}" class="button">Verify Email Now</a>
//               </div>
              
//               <div class="info-box">
//                 <strong>📝 Note:</strong>
//                 <ul style="margin: 10px 0 0 0; padding-left: 20px;">
//                   <li>This link will expire in 24 hours</li>
//                   <li>Previous verification links are no longer valid</li>
//                   <li>If you didn't request this, you can ignore this email</li>
//                 </ul>
//               </div>
              
//               <p>If the button above doesn't work, copy and paste this link:</p>
//               <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
//                 ${verificationUrl}
//               </p>
              
//               <p style="font-size: 12px; color: #666; margin-top: 30px;">
//                 This link was requested from IP: ${request.headers.get('x-forwarded-for') || 'Unknown'}<br>
//                 If this wasn't you, please secure your account.
//               </p>
//             </div>
//           </body>
//           </html>
//         `,
//         text: `New Verification Link - Steponext

// Hello ${user.fullName},

// We've generated a new verification link for your Steponext account.

// Verify Email: ${verificationUrl}

// 📝 Note:
// • This link will expire in 24 hours
// • Previous verification links are no longer valid
// • If you didn't request this, you can ignore this email

// If the link above doesn't work, copy and paste it into your browser.

// This link was requested from IP: ${request.headers.get('x-forwarded-for') || 'Unknown'}
// If this wasn't you, please secure your account.`,
//       });
      
//       console.log("✅ [VERIFY-EMAIL API] New verification email sent to:", user.email);
//     } catch (emailError) {
//       console.error("❌ [VERIFY-EMAIL API] Resend email failed:", emailError);
//       // Continue - return success for security
//     }

//     return NextResponse.json({
//       success: true,
//       message: "New verification link sent successfully",
//       sent: true,
//       expiresIn: "24 hours",
//       timestamp: new Date().toISOString(),
//     });

//   } catch (error) {
//     console.error("❌ [VERIFY-EMAIL API] Resend error:", error);
    
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to resend verification email",
//         code: "RESEND_FAILED",
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// // ✅ REMOVED the duplicate GET function from the bottom!
// // Only one GET function exists now (at the top of the file)









// above code is working without saas











import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import Company from "@/models/Company";
import crypto from "crypto";
import rateLimit from "@/lib/rate-limit";

// Rate limiter for verification attempts
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 1000, // Max 1000 unique tokens per hour
});

// GET handler - handles both verification AND API info
export async function GET(request) {
  try {
    console.log("📧 [VERIFY-EMAIL API] GET request received");
    
    // Get token from URL parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    console.log("🔑 [VERIFY-EMAIL API] Token from GET:", token ? token.substring(0, 20) + '...' : 'No token');
    
    // If token exists, process verification
    if (token) {
      // Create a mock request object for the POST handler
      const mockRequest = {
        json: async () => ({ token }),
        headers: request.headers,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      };
      
      // Call the POST handler
      return POST(mockRequest);
    }
    
    // If no token, return API info
    return NextResponse.json({
      endpoint: "/api/auth/verify-email",
      methods: {
        GET: "Verify email via URL: /api/auth/verify-email?token=YOUR_TOKEN",
        POST: "Verify email via JSON: { token: 'YOUR_TOKEN' }",
        PUT: "Resend verification email",
      },
      status: "operational",
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("❌ [VERIFY-EMAIL API] GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Verification failed",
        code: "VERIFICATION_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}

// POST method for programmatic verification
export async function POST(request) {
  try {
    console.log("📧 [VERIFY-EMAIL API] Processing email verification request...");

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("❌ [VERIFY-EMAIL API] JSON parse error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON data in request",
          code: "INVALID_JSON",
        },
        {
          status: 400,
        }
      );
    }

    const { token } = body;

    // Validate token
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification token is required and must be a valid string",
          code: "TOKEN_REQUIRED",
        },
        {
          status: 400,
        }
      );
    }

    // Trim the token
    const cleanToken = token.trim();
    console.log("🔑 [VERIFY-EMAIL API] Clean token:", cleanToken.substring(0, 20) + '...');

    // Apply rate limiting based on token
    try {
      await limiter.check(10, cleanToken); // 10 attempts per token per hour
    } catch (rateLimitError) {
      console.warn("⚠️ [VERIFY-EMAIL API] Rate limit exceeded for token:", cleanToken.substring(0, 10) + '...');
      return NextResponse.json(
        {
          success: false,
          message: "Too many verification attempts. Please request a new verification email.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: "1 hour",
        },
        {
          status: 429,
          headers: {
            'Retry-After': '3600',
          },
        }
      );
    }

    // Connect to database
    await connectDB();

    // Hash the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(cleanToken)
      .digest("hex");

    console.log("🔐 [VERIFY-EMAIL API] Hashed token:", hashedToken.substring(0, 20) + '...');

    // ===== SAAS: FIND USER WITH COMPANY CONTEXT =====
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }, // Token not expired
      status: { $in: ['active', 'pending'] }, // Allow pending users
    }).populate('companyId', 'companyName status subscription');

    if (!user) {
      console.log("❌ [VERIFY-EMAIL API] Invalid or expired verification token");
      
      // Try to find if token was already used or expired
      const expiredUser = await User.findOne({
        verificationToken: hashedToken,
      }).populate('companyId', 'companyName');

      let message = "Invalid or expired verification token";
      let code = "INVALID_TOKEN";
      let canResend = true;

      if (expiredUser) {
        if (expiredUser.isVerified) {
          message = "Email already verified. You can log in now.";
          code = "ALREADY_VERIFIED";
          canResend = false;
        } else if (expiredUser.verificationTokenExpires < Date.now()) {
          message = "Verification token has expired. Please request a new one.";
          code = "TOKEN_EXPIRED";
          canResend = true;
        }
      }

      return NextResponse.json(
        {
          success: false,
          message,
          code,
          canResend,
        },
        {
          status: 400,
        }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      console.log("⚠️ [VERIFY-EMAIL API] User already verified:", user.email);
      return NextResponse.json(
        {
          success: false,
          message: "Email already verified. You can log in now.",
          code: "ALREADY_VERIFIED",
        },
        {
          status: 400,
        }
      );
    }

    // ===== SAAS: CHECK COMPANY STATUS =====
    const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
    
    // For non-super-admin users, check company status
    if (!isSuperAdmin && user.companyId) {
      const company = user.companyId;
      
      if (!company) {
        console.log("⚠️ [VERIFY-EMAIL API] User has invalid company:", user.email);
        // Continue with verification but log warning
      } else if (company.status !== 'active') {
        console.log("⚠️ [VERIFY-EMAIL API] Company not active during verification:", {
          email: user.email,
          company: company.companyName,
          status: company.status
        });
        // Still allow verification, company status check happens at login
      }
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.status = 'active'; // Ensure user is active
    user.emailVerifiedAt = new Date();
    
    // If this is the first verification, set up default notification settings
    if (!user.notificationSettings) {
      user.notificationSettings = {
        pushNotifications: {
          enabled: user.role === 'admin',
          lastUpdated: new Date(),
        },
        settingsUpdatedAt: new Date(),
      };
    }

    await user.save({ validateBeforeSave: false });

    console.log("✅ [VERIFY-EMAIL API] Email verified successfully for user:", user.email);

    // ===== SAAS: UPDATE COMPANY IF USER IS ADMIN =====
    if (user.role === 'admin' && user.companyId && !isSuperAdmin) {
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
        console.log("✅ [VERIFY-EMAIL API] Company lastActive updated for:", user.companyId.companyName);
      } catch (companyError) {
        console.warn("⚠️ [VERIFY-EMAIL API] Failed to update company:", companyError.message);
      }
    }

    // Send welcome email with company context
    try {
      const { sendEmail } = await import('@/utils/email');
      
      await sendEmail({
        to: user.email,
        subject: "🎉 Welcome to Steponext - Email Verified Successfully!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Steponext!</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .container {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .content {
                padding: 30px;
              }
              .button {
                display: inline-block;
                padding: 14px 28px;
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
              }
              ${user.companyId && !isSuperAdmin ? `
              .company-info {
                background: #e8f4fd;
                border: 1px solid #b8e0ff;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                color: #0369a1;
              }
              ` : ''}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Welcome to Steponext!</h2>
                <p>Your email has been verified successfully</p>
              </div>
              <div class="content">
                <h3>Hello ${user.fullName},</h3>
                <p>Your email has been successfully verified!</p>
                
                ${user.companyId && !isSuperAdmin ? `
                <div class="company-info">
                  <strong>🏢 Company:</strong> ${user.companyId.companyName}<br>
                  <strong>Role:</strong> ${user.role === 'admin' ? 'Administrator' : user.role}
                </div>
                ` : ''}
                
                <p>You can now log in to your account and start using Steponext.</p>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" class="button">
                    Log In Now
                  </a>
                </div>
                
                <p style="font-size: 12px; color: #666; margin-top: 30px;">
                  If you didn't create this account, please contact support immediately.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to Steponext!

Hello ${user.fullName},

Your email has been successfully verified!

${user.companyId && !isSuperAdmin ? `
Company: ${user.companyId.companyName}
Role: ${user.role === 'admin' ? 'Administrator' : user.role}
` : ''}

You can now log in to your account: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login

If you didn't create this account, please contact support immediately.`,
      });
      
      console.log("✅ [VERIFY-EMAIL API] Welcome email sent to:", user.email);
    } catch (emailError) {
      console.error("⚠️ [VERIFY-EMAIL API] Welcome email failed:", emailError);
    }

    // Return success response with company context
    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role,
        adminType: user.adminType,
        isVerified: true,
        ...(user.companyId && !isSuperAdmin && {
          company: {
            id: user.companyId._id?.toString() || user.companyId?.toString(),
            name: user.companyId.companyName,
            status: user.companyId.status
          }
        })
      },
      redirectTo: "/login?verified=true",
      nextSteps: "You can now log in to your account.",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ [VERIFY-EMAIL API] Unexpected error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify email",
        code: "VERIFICATION_FAILED",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}

// PUT method for resending verification email
export async function PUT(request) {
  try {
    console.log("📧 [VERIFY-EMAIL API] Resending verification email...");

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("❌ [VERIFY-EMAIL API] JSON parse error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON data in request",
          code: "INVALID_JSON",
        },
        {
          status: 400,
        }
      );
    }

    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
          code: "EMAIL_REQUIRED",
        },
        {
          status: 400,
        }
      );
    }

    // Rate limiting for resend requests
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    try {
      await limiter.check(3, ip); // 3 resend attempts per IP per hour
    } catch (rateLimitError) {
      console.warn("⚠️ [VERIFY-EMAIL API] Resend rate limit exceeded for IP:", ip);
      return NextResponse.json(
        {
          success: false,
          message: "Too many resend requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: "1 hour",
        },
        {
          status: 429,
          headers: {
            'Retry-After': '3600',
          },
        }
      );
    }

    // Connect to database
    await connectDB();

    // ===== SAAS: FIND USER WITH COMPANY CONTEXT =====
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isVerified: false, // Only resend for unverified users
      status: { $in: ['active', 'pending'] },
    }).populate('companyId', 'companyName');

    // For security, always return success even if user doesn't exist or is already verified
    if (!user) {
      console.log("⚠️ [VERIFY-EMAIL API] User not found or already verified:", email);
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email and needs verification, a new link has been sent.",
        sent: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Check last resend time (prevent spam)
    const lastResendWindow = Date.now() - (5 * 60 * 1000); // 5 minutes
    if (user.lastVerificationResend && user.lastVerificationResend > lastResendWindow) {
      return NextResponse.json(
        {
          success: false,
          message: "Please wait 5 minutes before requesting another verification email.",
          code: "RESEND_COOLDOWN",
          retryAfter: "5 minutes",
        },
        {
          status: 429,
          headers: {
            'Retry-After': '300',
          },
        }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Update user with new token
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    user.lastVerificationResend = new Date();
    
    await user.save({ validateBeforeSave: false });

    console.log("✅ [VERIFY-EMAIL API] New verification token generated for:", user.email);

    // Send new verification email with company context
    try {
      const { sendEmail } = await import('@/utils/email');
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      await sendEmail({
        to: user.email,
        subject: "New Verification Link - Steponext",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Verification Link</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                padding: 14px 28px;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
              }
              .info-box {
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                color: #92400e;
              }
              ${user.companyId ? `
              .company-info {
                background: #e8f4fd;
                border: 1px solid #b8e0ff;
                border-radius: 8px;
                padding: 12px;
                margin: 20px 0;
                color: #0369a1;
              }
              ` : ''}
            </style>
          </head>
          <body>
            <div class="header">
              <h2>New Verification Link</h2>
            </div>
            <div class="content">
              <h3>Hello ${user.fullName},</h3>
              <p>We've generated a new verification link for your Steponext account.</p>
              
              ${user.companyId ? `
              <div class="company-info">
                <strong>🏢 Company:</strong> ${user.companyId.companyName}
              </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Now</a>
              </div>
              
              <div class="info-box">
                <strong>📝 Note:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This link will expire in 24 hours</li>
                  <li>Previous verification links are no longer valid</li>
                  <li>If you didn't request this, you can ignore this email</li>
                </ul>
              </div>
              
              <p>If the button above doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
                ${verificationUrl}
              </p>
              
              <p style="font-size: 12px; color: #666; margin-top: 30px;">
                This link was requested from IP: ${request.headers.get('x-forwarded-for') || 'Unknown'}<br>
                If this wasn't you, please secure your account.
              </p>
            </div>
          </body>
          </html>
        `,
        text: `New Verification Link - Steponext

Hello ${user.fullName},

${user.companyId ? `Company: ${user.companyId.companyName}\n` : ''}
We've generated a new verification link for your Steponext account.

Verify Email: ${verificationUrl}

📝 Note:
• This link will expire in 24 hours
• Previous verification links are no longer valid
• If you didn't request this, you can ignore this email

If the link above doesn't work, copy and paste it into your browser.

This link was requested from IP: ${request.headers.get('x-forwarded-for') || 'Unknown'}
If this wasn't you, please secure your account.`,
      });
      
      console.log("✅ [VERIFY-EMAIL API] New verification email sent to:", user.email);
    } catch (emailError) {
      console.error("❌ [VERIFY-EMAIL API] Resend email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "New verification link sent successfully",
      sent: true,
      expiresIn: "24 hours",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ [VERIFY-EMAIL API] Resend error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to resend verification email",
        code: "RESEND_FAILED",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}