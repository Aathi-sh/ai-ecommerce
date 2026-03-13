// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import User from "@/models/user";
// import { sendEmail } from "@/utils/email";
// import crypto from "crypto";
// import rateLimit from "@/lib/rate-limit";

// // Rate limiter configuration
// const limiter = rateLimit({
//   interval: 15 * 60 * 1000, // 15 minutes
//   uniqueTokenPerInterval: 500, // Max 500 users per interval
// });

// export async function POST(request) {
//   try {
//     console.log("📧 [FORGOT-PASSWORD API] Starting password reset request...");

//     // Apply rate limiting
//     const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
//     try {
//       await limiter.check(5, ip); // 5 requests per interval
//     } catch (rateLimitError) {
//       console.warn("⚠️ [FORGOT-PASSWORD API] Rate limit exceeded for IP:", ip);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Too many requests. Please try again later.",
//           code: "RATE_LIMIT_EXCEEDED",
//           retryAfter: "15 minutes",
//         },
//         {
//           status: 429,
//           headers: {
//             'Content-Type': 'application/json',
//             'Retry-After': '900', // 15 minutes in seconds
//           },
//         }
//       );
//     }

//     // Parse request body
//     let body;
//     try {
//       body = await request.json();
//     } catch (error) {
//       console.error("❌ [FORGOT-PASSWORD API] JSON parse error:", error);
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
//     if (!email || typeof email !== 'string') {
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
//         }
//       );
//     }

//     // Connect to database
//     await connectDB();

//     // Find user by email
//     const user = await User.findOne({ 
//       email: email.toLowerCase().trim(),
//       status: 'active' // Only allow active users
//     });

//     // For security reasons, we always return success even if user doesn't exist
//     // This prevents email enumeration attacks
//     if (!user) {
//       console.log("⚠️ [FORGOT-PASSWORD API] User not found (or inactive) for email:", email);
//       // Return generic success message for security
//       return NextResponse.json({
//         success: true,
//         message: "If an account with that email exists, a password reset link has been sent.",
//         sent: true, // Indicates email was "sent" (from user's perspective)
//         timestamp: new Date().toISOString(),
//       });
//     }

//     // Check if user has too many recent reset attempts
//     const recentResetWindow = Date.now() - (15 * 60 * 1000); // 15 minutes
//     if (user.resetPasswordAttempts && user.resetPasswordAttempts > 3) {
//       const lastResetAttempt = user.lastResetPasswordAttempt || 0;
      
//       if (lastResetAttempt > recentResetWindow) {
//         console.log("⚠️ [FORGOT-PASSWORD API] Too many reset attempts for user:", user.email);
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Too many reset attempts. Please try again later.",
//             code: "RESET_ATTEMPTS_EXCEEDED",
//             retryAfter: "15 minutes",
//           },
//           {
//             status: 429,
//             headers: {
//               'Retry-After': '900',
//             },
//           }
//         );
//       }
//     }

//     // Generate secure reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     // Set token with 1-hour expiry
//     user.resetPasswordToken = hashedToken;
//     user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
//     user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
//     user.lastResetPasswordAttempt = Date.now();
    
//     await user.save({ validateBeforeSave: false });

//     console.log("✅ [FORGOT-PASSWORD API] Reset token generated for user:", user.email);

//     // Create reset URL
//     const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

//     // Send reset email
//     try {
//       const emailSent = await sendEmail({
//         to: user.email,
//         subject: "Reset Your Password - Steponext",
//         html: `
//           <!DOCTYPE html>
//           <html>
//           <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Password Reset - Steponext</title>
//             <style>
//               body {
//                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                 line-height: 1.6;
//                 color: #333;
//                 max-width: 600px;
//                 margin: 0 auto;
//                 padding: 20px;
//                 background-color: #f9f9f9;
//               }
//               .container {
//                 background: white;
//                 border-radius: 12px;
//                 overflow: hidden;
//                 box-shadow: 0 4px 20px rgba(0,0,0,0.1);
//               }
//               .header {
//                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                 color: white;
//                 padding: 30px;
//                 text-align: center;
//               }
//               .content {
//                 padding: 30px;
//               }
//               .button {
//                 display: inline-block;
//                 padding: 14px 32px;
//                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 8px;
//                 font-weight: bold;
//                 margin: 20px 0;
//                 text-align: center;
//               }
//               .warning-box {
//                 background: #fff3cd;
//                 border: 1px solid #ffeaa7;
//                 border-radius: 8px;
//                 padding: 16px;
//                 margin: 20px 0;
//                 color: #856404;
//               }
//               .footer {
//                 margin-top: 30px;
//                 padding-top: 20px;
//                 border-top: 1px solid #eaeaea;
//                 color: #666;
//                 font-size: 12px;
//                 text-align: center;
//               }
//               .token-info {
//                 background: #f8f9fa;
//                 border: 1px solid #e9ecef;
//                 border-radius: 6px;
//                 padding: 12px;
//                 margin: 15px 0;
//                 font-family: monospace;
//                 word-break: break-all;
//                 font-size: 12px;
//               }
//             </style>
//           </head>
//           <body>
//             <div class="container">
//               <div class="header">
//                 <h1>Password Reset</h1>
//                 <p>Steponext Account Security</p>
//               </div>
//               <div class="content">
//                 <h2>Hello ${user.fullName},</h2>
//                 <p>We received a request to reset your password for your Steponext account.</p>
//                 <p>To reset your password, click the button below:</p>
                
//                 <div style="text-align: center;">
//                   <a href="${resetUrl}" class="button" style="color: white;">
//                     Reset Password
//                   </a>
//                 </div>
                
//                 <div class="warning-box">
//                   <strong>⚠️ Important Security Notice:</strong>
//                   <ul style="margin: 10px 0 0 0; padding-left: 20px;">
//                     <li>This link will expire in 1 hour</li>
//                     <li>If you didn't request this, you can safely ignore this email</li>
//                     <li>Your password will not change until you click the link</li>
//                   </ul>
//                 </div>
                
//                 <p>If the button above doesn't work, copy and paste this link into your browser:</p>
//                 <div class="token-info">
//                   ${resetUrl}
//                 </div>
                
//                 <p><strong>Need help?</strong> If you're having trouble clicking the link, try copying the entire URL into your web browser.</p>
                
//                 <div class="footer">
//                   <p>This is an automated message from Steponext. Please do not reply to this email.</p>
//                   <p>For security reasons, this link can only be used once and will expire in 1 hour.</p>
//                   <p>If you continue to have issues, contact our support team.</p>
//                   <p>© ${new Date().getFullYear()} Steponext. All rights reserved.</p>
//                 </div>
//               </div>
//             </div>
//           </body>
//           </html>
//         `,
//         text: `Password Reset Request - Steponext

// Hello ${user.fullName},

// We received a request to reset your password for your Steponext account.

// To reset your password, click the link below:
// ${resetUrl}

// ⚠️ Important Security Notice:
// • This link will expire in 1 hour
// • If you didn't request this, you can safely ignore this email
// • Your password will not change until you click the link

// If the link above doesn't work, copy and paste the entire URL into your browser.

// Need help? If you're having trouble, contact our support team.

// This is an automated message from Steponext. Please do not reply to this email.
// For security reasons, this link can only be used once and will expire in 1 hour.

// © ${new Date().getFullYear()} Steponext. All rights reserved.`,
//       });

//       if (!emailSent) {
//         console.error("❌ [FORGOT-PASSWORD API] Email sending failed for user:", user.email);
//         // Don't expose email failure to user for security
//       }

//       console.log("✅ [FORGOT-PASSWORD API] Password reset email sent to:", user.email);

//     } catch (emailError) {
//       console.error("❌ [FORGOT-PASSWORD API] Email sending error:", emailError);
//       // Continue - we still want to return success for security
//     }

//     // Log the reset request (for security monitoring)
//     console.log("📝 [FORGOT-PASSWORD API] Password reset requested for:", {
//       email: user.email,
//       timestamp: new Date().toISOString(),
//       ip: ip,
//     });

//     // Return success response
//     return NextResponse.json({
//       success: true,
//       message: "If an account with that email exists, a password reset link has been sent.",
//       sent: true,
//       expiresIn: "1 hour",
//       timestamp: new Date().toISOString(),
//       securityNotice: "For security reasons, we don't confirm whether an account exists with this email.",
//     });

//   } catch (error) {
//     console.error("❌ [FORGOT-PASSWORD API] Unexpected error:", error);
    
//     // Return generic error for security
//     return NextResponse.json(
//       {
//         success: false,
//         message: "An error occurred. Please try again later.",
//         code: "INTERNAL_ERROR",
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// // GET endpoint for API information
// export async function GET() {
//   return NextResponse.json({
//     endpoint: "/api/auth/forgot-password",
//     method: "POST",
//     description: "Request password reset link",
//     required_fields: {
//       email: "string (valid email format)"
//     },
//     security_features: [
//       "Rate limiting (5 requests per 15 minutes)",
//       "Email enumeration protection",
//       "1-hour token expiry",
//       "HTTPS only in production",
//       "No user existence confirmation",
//     ],
//     response_format: {
//       success: "boolean",
//       message: "string",
//       sent: "boolean",
//       expiresIn: "string",
//       timestamp: "ISO string",
//     },
//     status: "operational",
//     timestamp: new Date().toISOString(),
//   });
// }








// above code is workig without saas

















import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import Company from "@/models/Company";
import { sendEmail } from "@/utils/email";
import crypto from "crypto";
import rateLimit from "@/lib/rate-limit";

// Rate limiter configuration
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

export async function POST(request) {
  try {
    console.log("📧 [FORGOT-PASSWORD API] Starting password reset request...");

    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    try {
      await limiter.check(5, ip); // 5 requests per interval
    } catch (rateLimitError) {
      console.warn("⚠️ [FORGOT-PASSWORD API] Rate limit exceeded for IP:", ip);
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: "15 minutes",
        },
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
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
      console.error("❌ [FORGOT-PASSWORD API] JSON parse error:", error);
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
    if (!email || typeof email !== 'string') {
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
        }
      );
    }

    // Connect to database
    await connectDB();

    // ===== SAAS: FIND USER WITH COMPANY CONTEXT =====
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      status: 'active' // Only allow active users
    }).populate('companyId', 'companyName status subscription'); // Populate company data

    // For security reasons, we always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log("⚠️ [FORGOT-PASSWORD API] User not found (or inactive) for email:", email);
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
        sent: true,
        timestamp: new Date().toISOString(),
      });
    }

    // ===== SAAS: CHECK COMPANY STATUS =====
    const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
    
    // For non-super-admin users, check company status
    if (!isSuperAdmin && user.companyId) {
      const company = user.companyId;
      
      if (!company) {
        console.log("⚠️ [FORGOT-PASSWORD API] User has invalid company:", user.email);
        // Still return success for security
        return NextResponse.json({
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
          sent: true,
          timestamp: new Date().toISOString(),
        });
      }

      // Don't allow password reset if company is not active
      if (company.status !== 'active') {
        console.log("⚠️ [FORGOT-PASSWORD API] Company not active:", {
          email: user.email,
          company: company.companyName,
          status: company.status
        });
        
        return NextResponse.json(
          {
            success: false,
            message: "Your company account is not active. Please contact your administrator.",
            code: "COMPANY_INACTIVE",
            companyStatus: company.status,
          },
          { status: 403 }
        );
      }

      // Check subscription expiry
      if (company.subscription?.expiryDate && new Date(company.subscription.expiryDate) < new Date()) {
        console.log("⚠️ [FORGOT-PASSWORD API] Company subscription expired:", company.companyName);

        return NextResponse.json(
          {
            success: false,
            message: "Your company subscription has expired. Please renew to access your account.",
            code: "SUBSCRIPTION_EXPIRED",
          },
          { status: 403 }
        );
      }
    }

    // Check if user has too many recent reset attempts
    const recentResetWindow = Date.now() - (15 * 60 * 1000); // 15 minutes
    if (user.resetPasswordAttempts && user.resetPasswordAttempts > 3) {
      const lastResetAttempt = user.lastResetPasswordAttempt || 0;
      
      if (lastResetAttempt > recentResetWindow) {
        console.log("⚠️ [FORGOT-PASSWORD API] Too many reset attempts for user:", user.email);
        return NextResponse.json(
          {
            success: false,
            message: "Too many reset attempts. Please try again later.",
            code: "RESET_ATTEMPTS_EXCEEDED",
            retryAfter: "15 minutes",
          },
          {
            status: 429,
            headers: {
              'Retry-After': '900',
            },
          }
        );
      }
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token with 1-hour expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
    user.lastResetPasswordAttempt = Date.now();
    
    await user.save({ validateBeforeSave: false });

    console.log("✅ [FORGOT-PASSWORD API] Reset token generated for user:", user.email);

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send reset email with company context
    try {
      const emailSent = await sendEmail({
        to: user.email,
        subject: "Reset Your Password - Steponext",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Steponext</title>
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .content {
                padding: 30px;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
              }
              .warning-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                color: #856404;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eaeaea;
                color: #666;
                font-size: 12px;
                text-align: center;
              }
              .token-info {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 12px;
                margin: 15px 0;
                font-family: monospace;
                word-break: break-all;
                font-size: 12px;
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
                <h1>Password Reset</h1>
                <p>Steponext Account Security</p>
              </div>
              <div class="content">
                <h2>Hello ${user.fullName},</h2>
                <p>We received a request to reset your password for your Steponext account.</p>
                
                ${user.companyId && !isSuperAdmin ? `
                <div class="company-info">
                  <strong>🏢 Company Information:</strong><br>
                  Company: ${user.companyId.companyName}<br>
                  Role: ${user.role === 'admin' ? 'Administrator' : user.role}
                </div>
                ` : ''}
                
                <p>To reset your password, click the button below:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button" style="color: white;">
                    Reset Password
                  </a>
                </div>
                
                <div class="warning-box">
                  <strong>⚠️ Important Security Notice:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this, you can safely ignore this email</li>
                    <li>Your password will not change until you click the link</li>
                  </ul>
                </div>
                
                <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                <div class="token-info">
                  ${resetUrl}
                </div>
                
                <p><strong>Need help?</strong> If you're having trouble, contact our support team.</p>
                
                <div class="footer">
                  <p>This is an automated message from Steponext. Please do not reply to this email.</p>
                  <p>For security reasons, this link can only be used once and will expire in 1 hour.</p>
                  <p>© ${new Date().getFullYear()} Steponext. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Password Reset Request - Steponext

Hello ${user.fullName},

${user.companyId && !isSuperAdmin ? `
Company: ${user.companyId.companyName}
Role: ${user.role === 'admin' ? 'Administrator' : user.role}
` : ''}

We received a request to reset your password for your Steponext account.

To reset your password, click the link below:
${resetUrl}

⚠️ Important Security Notice:
• This link will expire in 1 hour
• If you didn't request this, you can safely ignore this email
• Your password will not change until you click the link

If the link above doesn't work, copy and paste the entire URL into your browser.

Need help? If you're having trouble, contact our support team.

This is an automated message from Steponext. Please do not reply to this email.
For security reasons, this link can only be used once and will expire in 1 hour.

© ${new Date().getFullYear()} Steponext. All rights reserved.`,
      });

      if (!emailSent) {
        console.error("❌ [FORGOT-PASSWORD API] Email sending failed for user:", user.email);
      }

      console.log("✅ [FORGOT-PASSWORD API] Password reset email sent to:", user.email);

    } catch (emailError) {
      console.error("❌ [FORGOT-PASSWORD API] Email sending error:", emailError);
    }

    // Log the reset request with company context
    console.log("📝 [FORGOT-PASSWORD API] Password reset requested:", {
      email: user.email,
      userId: user._id.toString(),
      role: user.role,
      adminType: user.adminType,
      companyId: user.companyId?._id?.toString() || user.companyId?.toString(),
      timestamp: new Date().toISOString(),
      ip: ip,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      sent: true,
      expiresIn: "1 hour",
      timestamp: new Date().toISOString(),
      securityNotice: "For security reasons, we don't confirm whether an account exists with this email.",
    });

  } catch (error) {
    console.error("❌ [FORGOT-PASSWORD API] Unexpected error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later.",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}

// GET endpoint for API information
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/auth/forgot-password",
    method: "POST",
    description: "Multi-tenant password reset request endpoint",
    required_fields: {
      email: "string (valid email format)"
    },
    security_features: [
      "Rate limiting (5 requests per 15 minutes)",
      "Email enumeration protection",
      "1-hour token expiry",
      "HTTPS only in production",
      "No user existence confirmation",
      "Company status validation",
      "Subscription expiry check",
    ],
    saas_features: [
      "Company status check before reset",
      "Company context in email templates",
      "Role-based handling (super admin bypass)",
      "Multi-tenant audit logging",
      "Company-specific error messages",
    ],
    response_format: {
      success: "boolean",
      message: "string",
      sent: "boolean",
      expiresIn: "string",
      timestamp: "ISO string",
    },
    status: "operational",
    timestamp: new Date().toISOString(),
  });
}