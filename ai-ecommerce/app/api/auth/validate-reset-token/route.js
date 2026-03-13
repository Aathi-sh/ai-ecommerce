// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import User from "@/models/user";
// import crypto from "crypto";

// export async function GET(request) {
//   try {
//     console.log("🔍 [VALIDATE-RESET-TOKEN API] Validating reset token...");

//     // Get token from query parameters
//     const { searchParams } = new URL(request.url);
//     const token = searchParams.get('token');

//     // Validate token exists
//     if (!token) {
//       console.log("❌ [VALIDATE-RESET-TOKEN API] No token provided");
//       return NextResponse.json(
//         {
//           valid: false,
//           message: "Reset token is required",
//           code: "TOKEN_REQUIRED",
//           canRequestNew: true,
//         },
//         { status: 400 }
//       );
//     }

//     // Validate token format
//     if (typeof token !== 'string' || token.length !== 64) {
//       console.log("❌ [VALIDATE-RESET-TOKEN API] Invalid token format:", token.length);
//       return NextResponse.json(
//         {
//           valid: false,
//           message: "Invalid reset link format",
//           code: "INVALID_TOKEN_FORMAT",
//           canRequestNew: true,
//         },
//         { status: 400 }
//       );
//     }

//     // Connect to database
//     await connectDB();

//     // Hash the token (to compare with stored hash)
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     // Find user with this reset token
//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       status: 'active',
//     });

//     if (!user) {
//       console.log("❌ [VALIDATE-RESET-TOKEN API] No user found with this token");
      
//       // Check if token exists but user is inactive
//       const inactiveUser = await User.findOne({
//         resetPasswordToken: hashedToken,
//         status: { $ne: 'active' }
//       });

//       if (inactiveUser) {
//         return NextResponse.json(
//           {
//             valid: false,
//             message: "Your account is not active. Please contact support.",
//             code: "ACCOUNT_INACTIVE",
//             canRequestNew: false,
//           },
//           { status: 400 }
//         );
//       }

//       return NextResponse.json(
//         {
//           valid: false,
//           message: "Invalid reset token",
//           code: "INVALID_TOKEN",
//           canRequestNew: true,
//         },
//         { status: 400 }
//       );
//     }

//     // Check if token is expired
//     if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
//       console.log("❌ [VALIDATE-RESET-TOKEN API] Token expired for user:", user.email);
      
//       // Clean up expired token
//       await User.updateOne(
//         { _id: user._id },
//         {
//           $unset: {
//             resetPasswordToken: "",
//             resetPasswordExpires: "",
//           }
//         }
//       );

//       return NextResponse.json(
//         {
//           valid: false,
//           message: "This reset link has expired",
//           code: "TOKEN_EXPIRED",
//           canRequestNew: true,
//         },
//         { status: 400 }
//       );
//     }

//     console.log("✅ [VALIDATE-RESET-TOKEN API] Token valid for user:", {
//       email: user.email,
//       expiresAt: new Date(user.resetPasswordExpires).toISOString(),
//     });

//     // Calculate time remaining in user-friendly format
//     const timeRemainingMs = user.resetPasswordExpires - Date.now();
//     const timeRemainingMinutes = Math.floor(timeRemainingMs / 1000 / 60);
//     const timeRemainingSeconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);
    
//     let timeRemainingText = "";
//     if (timeRemainingMinutes > 60) {
//       const hours = Math.floor(timeRemainingMinutes / 60);
//       const minutes = timeRemainingMinutes % 60;
//       timeRemainingText = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
//     } else {
//       timeRemainingText = `${timeRemainingMinutes} minute${timeRemainingMinutes > 1 ? 's' : ''} ${timeRemainingSeconds} second${timeRemainingSeconds > 1 ? 's' : ''}`;
//     }

//     // Return minimal user info (for security)
//     return NextResponse.json({
//       valid: true,
//       message: "Reset token is valid",
//       user: {
//         email: user.email,
//         name: user.fullName || user.email.split('@')[0],
//       },
//       expiresAt: user.resetPasswordExpires,
//       expiresAtISO: new Date(user.resetPasswordExpires).toISOString(),
//       timeRemaining: timeRemainingText,
//       timeRemainingMinutes: timeRemainingMinutes,
//       timeRemainingSeconds: timeRemainingSeconds,
//     });

//   } catch (error) {
//     console.error("❌ [VALIDATE-RESET-TOKEN API] Unexpected error:", {
//       message: error.message,
//       stack: error.stack,
//       name: error.name
//     });
    
//     return NextResponse.json(
//       {
//         valid: false,
//         message: "Failed to validate reset token. Please try again.",
//         code: "VALIDATION_ERROR",
//         canRequestNew: true,
//         ...(process.env.NODE_ENV === 'development' && { debug: error.message }),
//       },
//       { status: 500 }
//     );
//   }
// }

// // ✅ HEAD method for quick validation checks
// export async function HEAD(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const token = searchParams.get('token');

//     if (!token || token.length !== 64) {
//       return new Response(null, { status: 400 });
//     }

//     await connectDB();

//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() },
//       status: 'active',
//     }).select('_id');

//     if (!user) {
//       return new Response(null, { status: 404 });
//     }

//     return new Response(null, { status: 200 });

//   } catch (error) {
//     console.error("❌ [VALIDATE-RESET-TOKEN API] HEAD request error:", error);
//     return new Response(null, { status: 500 });
//   }
// }

// // ✅ POST method - Not allowed (for API clarity)
// export async function POST() {
//   return NextResponse.json(
//     {
//       error: "Method not allowed",
//       message: "GET method is required for token validation",
//       code: "METHOD_NOT_ALLOWED",
//     },
//     { status: 405 }
//   );
// }

// // ✅ PUT method - Not allowed
// export async function PUT() {
//   return NextResponse.json(
//     {
//       error: "Method not allowed",
//       message: "GET method is required for token validation",
//       code: "METHOD_NOT_ALLOWED",
//     },
//     { status: 405 }
//   );
// }

// // ✅ DELETE method - Not allowed
// export async function DELETE() {
//   return NextResponse.json(
//     {
//       error: "Method not allowed",
//       message: "GET method is required for token validation",
//       code: "METHOD_NOT_ALLOWED",
//     },
//     { status: 405 }
//   );
// }

// // ✅ PATCH method - Not allowed
// export async function PATCH() {
//   return NextResponse.json(
//     {
//       error: "Method not allowed",
//       message: "GET method is required for token validation",
//       code: "METHOD_NOT_ALLOWED",
//     },
//     { status: 405 }
//   );
// }

// // ✅ OPTIONS method - For CORS
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: {
//       'Allow': 'GET, HEAD, OPTIONS',
//       'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       'Access-Control-Max-Age': '86400',
//     },
//   });
// }








// above code is working without saas








import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import Company from "@/models/Company";
import crypto from "crypto";

export async function GET(request) {
  try {
    console.log("🔍 [VALIDATE-RESET-TOKEN API] Validating reset token...");

    // Get token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate token exists
    if (!token) {
      console.log("❌ [VALIDATE-RESET-TOKEN API] No token provided");
      return NextResponse.json(
        {
          valid: false,
          message: "Reset token is required",
          code: "TOKEN_REQUIRED",
          canRequestNew: true,
        },
        { status: 400 }
      );
    }

    // Validate token format
    if (typeof token !== 'string' || token.length !== 64) {
      console.log("❌ [VALIDATE-RESET-TOKEN API] Invalid token format:", token.length);
      return NextResponse.json(
        {
          valid: false,
          message: "Invalid reset link format",
          code: "INVALID_TOKEN_FORMAT",
          canRequestNew: true,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Hash the token (to compare with stored hash)
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // ===== SAAS: FIND USER WITH COMPANY CONTEXT =====
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      status: 'active',
    }).populate('companyId', 'companyName status subscription');

    if (!user) {
      console.log("❌ [VALIDATE-RESET-TOKEN API] No user found with this token");
      
      // Check if token exists but user is inactive
      const inactiveUser = await User.findOne({
        resetPasswordToken: hashedToken,
        status: { $ne: 'active' }
      }).populate('companyId', 'companyName');

      if (inactiveUser) {
        return NextResponse.json(
          {
            valid: false,
            message: "Your account is not active. Please contact support.",
            code: "ACCOUNT_INACTIVE",
            canRequestNew: false,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          valid: false,
          message: "Invalid reset token",
          code: "INVALID_TOKEN",
          canRequestNew: true,
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      console.log("❌ [VALIDATE-RESET-TOKEN API] Token expired for user:", user.email);
      
      // Clean up expired token
      await User.updateOne(
        { _id: user._id },
        {
          $unset: {
            resetPasswordToken: "",
            resetPasswordExpires: "",
          }
        }
      );

      return NextResponse.json(
        {
          valid: false,
          message: "This reset link has expired",
          code: "TOKEN_EXPIRED",
          canRequestNew: true,
        },
        { status: 400 }
      );
    }

    // ===== SAAS: CHECK COMPANY STATUS =====
    const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
    
    // For non-super-admin users, check company status
    if (!isSuperAdmin && user.companyId) {
      const company = user.companyId;
      
      if (!company) {
        console.log("⚠️ [VALIDATE-RESET-TOKEN API] User has invalid company:", user.email);
        // Token is still valid, but warn
      } else if (company.status !== 'active') {
        console.log("⚠️ [VALIDATE-RESET-TOKEN API] Company not active:", {
          email: user.email,
          company: company.companyName,
          status: company.status
        });

        // Return warning but still allow reset (company check happens at login)
        // This ensures users can reset password even if company is temporarily inactive
      }

      // Check subscription expiry (warning only)
      if (company.subscription?.expiryDate && new Date(company.subscription.expiryDate) < new Date()) {
        console.log("⚠️ [VALIDATE-RESET-TOKEN API] Company subscription expired:", company.companyName);
        // Still allow reset
      }
    }

    console.log("✅ [VALIDATE-RESET-TOKEN API] Token valid for user:", {
      email: user.email,
      role: user.role,
      adminType: user.adminType,
      companyId: user.companyId?._id?.toString(),
      expiresAt: new Date(user.resetPasswordExpires).toISOString(),
    });

    // Calculate time remaining in user-friendly format
    const timeRemainingMs = user.resetPasswordExpires - Date.now();
    const timeRemainingMinutes = Math.floor(timeRemainingMs / 1000 / 60);
    const timeRemainingSeconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);
    
    let timeRemainingText = "";
    if (timeRemainingMinutes > 60) {
      const hours = Math.floor(timeRemainingMinutes / 60);
      const minutes = timeRemainingMinutes % 60;
      timeRemainingText = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      timeRemainingText = `${timeRemainingMinutes} minute${timeRemainingMinutes > 1 ? 's' : ''} ${timeRemainingSeconds} second${timeRemainingSeconds > 1 ? 's' : ''}`;
    }

    // ===== SAAS: UPDATE COMPANY LAST ACTIVE (optional) =====
    if (!isSuperAdmin && user.companyId) {
      try {
        await Company.findByIdAndUpdate(
          user.companyId._id || user.companyId,
          {
            $set: {
              'stats.lastActive': new Date(),
              updatedAt: new Date()
            }
          }
        ).catch(() => {}); // Non-blocking
      } catch (companyError) {
        // Ignore errors
      }
    }

    // Return minimal user info with company context
    return NextResponse.json({
      valid: true,
      message: "Reset token is valid",
      user: {
        email: user.email,
        name: user.fullName || user.email.split('@')[0],
        role: user.role,
        ...(user.companyId && !isSuperAdmin && {
          company: {
            id: user.companyId._id?.toString() || user.companyId?.toString(),
            name: user.companyId.companyName,
            status: user.companyId.status
          }
        })
      },
      expiresAt: user.resetPasswordExpires,
      expiresAtISO: new Date(user.resetPasswordExpires).toISOString(),
      timeRemaining: timeRemainingText,
      timeRemainingMinutes: timeRemainingMinutes,
      timeRemainingSeconds: timeRemainingSeconds,
    });

  } catch (error) {
    console.error("❌ [VALIDATE-RESET-TOKEN API] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      {
        valid: false,
        message: "Failed to validate reset token. Please try again.",
        code: "VALIDATION_ERROR",
        canRequestNew: true,
        ...(process.env.NODE_ENV === 'development' && { debug: error.message }),
      },
      { status: 500 }
    );
  }
}

// HEAD method for quick validation checks
export async function HEAD(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || token.length !== 64) {
      return new Response(null, { status: 400 });
    }

    await connectDB();

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // ===== SAAS: FIND USER WITH COMPANY CONTEXT =====
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      status: 'active',
    }).populate('companyId', 'status');

    if (!user) {
      return new Response(null, { status: 404 });
    }

    // ===== SAAS: QUICK COMPANY CHECK =====
    const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
    
    if (!isSuperAdmin && user.companyId) {
      // If company is inactive, still return 200 for token validation
      // Company status check happens at login/reset
    }

    return new Response(null, { status: 200 });

  } catch (error) {
    console.error("❌ [VALIDATE-RESET-TOKEN API] HEAD request error:", error);
    return new Response(null, { status: 500 });
  }
}

// POST method - Not allowed
export async function POST() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "GET method is required for token validation",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}

// PUT method - Not allowed
export async function PUT() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "GET method is required for token validation",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}

// DELETE method - Not allowed
export async function DELETE() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "GET method is required for token validation",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}

// PATCH method - Not allowed
export async function PATCH() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "GET method is required for token validation",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}

// OPTIONS method - For CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID',
      'Access-Control-Max-Age': '86400',
    },
  });
}
