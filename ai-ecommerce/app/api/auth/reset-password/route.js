import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import crypto from "crypto";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log("🔐 [RESET-PASSWORD API] Processing password reset...");

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("❌ [RESET-PASSWORD API] JSON parse error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON data in request",
          code: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    const { token, password } = body;

    // Validate input
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token is required",
          code: "TOKEN_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
          code: "PASSWORD_REQUIRED",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
          code: "PASSWORD_TOO_SHORT",
          field: "password",
        },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain uppercase, lowercase, and numbers",
          code: "PASSWORD_WEAK",
          field: "password",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Hash the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token - include password field
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      status: 'active',
    }).select('+password');

    if (!user) {
      console.log("❌ [RESET-PASSWORD API] Invalid or expired token");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset token",
          code: "INVALID_TOKEN",
          canRequestNew: true,
        },
        { status: 400 }
      );
    }

    // ✅ Check if user has a password field
    if (!user.password) {
      console.error("❌ [RESET-PASSWORD API] User has no password field:", user.email);
      return NextResponse.json(
        {
          success: false,
          message: "Account configuration error. Please contact support.",
          code: "ACCOUNT_ERROR",
        },
        { status: 500 }
      );
    }

    // ✅ Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password cannot be the same as your current password",
          code: "PASSWORD_SAME_AS_OLD",
          field: "password",
        },
        { status: 400 }
      );
    }

    // ✅ Hash new password with proper salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("🔑 [RESET-PASSWORD API] New password hash generated:", {
      email: user.email,
      hashPrefix: hashedPassword.substring(0, 20) + '...'
    });

    // ✅ CRITICAL FIX: Direct MongoDB update - COMPLETELY BYPASS Mongoose middleware
    const updateResult = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          lastPasswordChange: new Date(),
          status: 'active',
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
        $inc: {
          resetPasswordAttempts: 0,
        }
      }
    );

    console.log("✅ [RESET-PASSWORD API] Password reset successful via direct update:", {
      email: user.email,
      modifiedCount: updateResult.modifiedCount,
      matchedCount: updateResult.matchedCount
    });

    // ✅ VERIFICATION: Test if the new password works
    const verifiedUser = await User.findById(user._id).select('+password');
    const isPasswordCorrect = await bcrypt.compare(password, verifiedUser.password);
    
    console.log("🔍 [RESET-PASSWORD API] Password verification result:", {
      email: user.email,
      isPasswordCorrect: isPasswordCorrect,
      passwordExists: !!verifiedUser.password,
      hashFormat: verifiedUser.password?.substring(0, 4) || 'none'
    });

    if (!isPasswordCorrect) {
      console.error("❌ [RESET-PASSWORD API] CRITICAL: Password hash verification FAILED!");
      
      // ✅ EMERGENCY FALLBACK: Try one more time with a different approach
      console.log("⚠️ [RESET-PASSWORD API] Attempting emergency fallback...");
      
      // Get the raw User model
      const UserModel = require('@/models/user').default;
      
      // Create a new user instance with just the password
      const tempUser = new UserModel({
        _id: user._id,
        password: password
      });
      
      // Let the model's pre-save middleware hash it
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { password: tempUser.password } }
      );
      
      // Verify again
      const retryUser = await User.findById(user._id).select('+password');
      const retrySuccess = await bcrypt.compare(password, retryUser.password);
      
      console.log("🔍 [RESET-PASSWORD API] Emergency fallback result:", {
        email: user.email,
        success: retrySuccess
      });
      
      if (!retrySuccess) {
        return NextResponse.json(
          {
            success: false,
            message: "Password reset failed due to technical issue. Please try again.",
            code: "RESET_FAILED",
          },
          { status: 500 }
        );
      }
    }

    // ✅ Send confirmation email (non-blocking - don't await)
    try {
      const { sendEmail } = await import('@/utils/email');
      sendEmail({
        to: user.email,
        subject: "Password Reset Successful - Steponext",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Successful</title>
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
              .security-box {
                background: #d1fae5;
                border: 1px solid #a7f3d0;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                color: #065f46;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eaeaea;
                color: #666;
                font-size: 12px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Successful</h1>
              </div>
              <div class="content">
                <h2>Hello ${user.fullName || 'User'},</h2>
                <p>Your Steponext account password has been successfully reset.</p>
                
                <div class="security-box">
                  <h3>🔒 Security Notice</h3>
                  <p>For your security:</p>
                  <ul>
                    <li>Your password has been changed</li>
                    <li>You can now log in with your new password</li>
                    <li>If you didn't make this change, contact support immediately</li>
                  </ul>
                </div>
                
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${request.headers.get('x-forwarded-for') || request.ip || 'Unknown'}</p>
                
                <div class="footer">
                  <p>This is an automated security notification from Steponext.</p>
                  <p>For assistance, contact our support team.</p>
                  <p>© ${new Date().getFullYear()} Steponext. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Password Reset Successful - Steponext

Hello ${user.fullName || 'User'},

Your Steponext account password has been successfully reset.

🔒 Security Notice:
For your security:
• Your password has been changed
• You can now log in with your new password
• If you didn't make this change, contact support immediately

Timestamp: ${new Date().toLocaleString()}
IP Address: ${request.headers.get('x-forwarded-for') || request.ip || 'Unknown'}

This is an automated security notification from Steponext.
For assistance, contact our support team.

© ${new Date().getFullYear()} Steponext. All rights reserved.`,
      }).catch(err => {
        console.warn("⚠️ [RESET-PASSWORD API] Email sending failed (non-blocking):", err.message);
      });
    } catch (emailError) {
      console.warn("⚠️ [RESET-PASSWORD API] Email import failed:", emailError.message);
    }

    // ✅ Log the password reset for security audit
    console.log("📝 [RESET-PASSWORD API] Password reset completed:", {
      email: user.email,
      userId: user._id.toString(),
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      verificationPassed: true
    });

    // ✅ Return success response
    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      user: {
        email: user.email,
        name: user.fullName,
      },
      securityNotice: "Your password has been changed. You can now log in with your new password.",
      nextSteps: "Redirecting to login page...",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ [RESET-PASSWORD API] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset password. Please try again.",
        code: "RESET_FAILED",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for API information
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/auth/reset-password",
    method: "POST",
    description: "Reset password using valid token",
    required_fields: {
      token: "string (64-character hex token)",
      password: "string (min 6 characters, with uppercase, lowercase, numbers)"
    },
    security_features: [
      "Token validation and expiry check",
      "Password strength validation",
      "Prevents reusing old password",
      "Direct MongoDB update (bypasses middleware)",
      "Password hash verification",
      "Emergency fallback mechanism",
      "Sends security notification email",
      "Audit logging with IP tracking",
    ],
    status: "operational",
    timestamp: new Date().toISOString(),
  });
}