// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import User from "@/models/user";
// import { sendEmail } from "@/utils/email";
// import crypto from "crypto";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/nextauth";

// // CORS headers configuration
// const corsHeaders = {
//   'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
//     ? process.env.FRONTEND_URL || 'http://localhost:3000' 
//     : '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//   'Access-Control-Allow-Credentials': 'true',
// };

// // Handle preflight requests
// export async function OPTIONS(request) {
//   return new NextResponse(null, {
//     status: 200,
//     headers: corsHeaders,
//   });
// }

// export async function POST(request) {
//   try {
//     console.log("📝 [REGISTER API] Starting registration process...");

//     // Prevent authenticated users from registering new accounts
//     const session = await getServerSession(authOptions);
//     if (session?.user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "You are already logged in. Please log out to create a new account.",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Parse and validate request body
//     let body;
//     try {
//       body = await request.json();
//       console.log("📋 [REGISTER API] Request body received");
//     } catch (error) {
//       console.error("❌ [REGISTER API] JSON parse error:", error);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid JSON data in request",
//           error: "JSON_PARSE_ERROR",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     const { fullName, email, phone, password, role } = body;

//     // Validate required fields
//     if (!fullName || !email || !phone || !password) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "All fields are required: fullName, email, phone, password",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid email format",
//           field: "email",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Validate phone number
//     const phoneRegex = /^\d{10,15}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Phone number must be 10-15 digits",
//           field: "phone",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Validate password strength
//     if (password.length < 6) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Password must be at least 6 characters",
//           field: "password",
//         },
//         {
//           status: 400,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Validate role
//     const allowedRoles = ['user', 'admin', 'manager'];
//     const selectedRole = role && allowedRoles.includes(role) ? role : 'user';
    
//     // Restrict admin registration in production (admins should be created manually)
//     if (process.env.NODE_ENV === 'production' && selectedRole === 'admin') {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Admin registration is restricted. Please contact support.",
//         },
//         {
//           status: 403,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Connect to database
//     try {
//       await connectDB();
//       console.log("✅ [REGISTER API] Database connected");
//     } catch (dbError) {
//       console.error("❌ [REGISTER API] Database connection error:", dbError);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Database connection failed",
//           error: "DB_CONNECTION_ERROR",
//         },
//         {
//           status: 500,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Check for existing user with email or phone
//     const existingUser = await User.findOne({
//       $or: [
//         { email: email.toLowerCase().trim() },
//         { phone: phone.trim() }
//       ]
//     });

//     if (existingUser) {
//       const field = existingUser.email === email.toLowerCase().trim() ? 'email' : 'phone';
//       return NextResponse.json(
//         {
//           success: false,
//           message: `${field === 'email' ? 'Email' : 'Phone number'} is already registered`,
//           field,
//         },
//         {
//           status: 409, // Conflict
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Create user object
//     const userData = {
//       fullName: fullName.trim(),
//       email: email.toLowerCase().trim(),
//       phone: phone.trim(),
//       password: password,
//       role: selectedRole,
//       isVerified: false, // Email verification required
//       status: 'active',
//       notificationSettings: {
//         pushNotifications: {
//           enabled: selectedRole === 'admin', // Enable by default for admins
//           lastUpdated: new Date(),
//         },
//         settingsUpdatedAt: new Date(),
//       },
//     };

//     let user;
//     try {
//       // Create user in database
//       user = await User.create(userData);
//       console.log("✅ [REGISTER API] User created successfully:", {
//         id: user._id.toString(),
//         email: user.email,
//         role: user.role
//       });
//     } catch (createError) {
//       console.error("❌ [REGISTER API] User creation error:", createError);
      
//       // Handle duplicate key errors
//       if (createError.code === 11000) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Duplicate entry detected. Please try different credentials.",
//             error: "DUPLICATE_ENTRY",
//           },
//           {
//             status: 409,
//             headers: corsHeaders,
//           }
//         );
//       }
      
//       // Handle validation errors
//       if (createError.name === 'ValidationError') {
//         const errors = Object.values(createError.errors).map(err => err.message);
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Validation failed",
//             errors,
//           },
//           {
//             status: 400,
//             headers: corsHeaders,
//           }
//         );
//       }
      
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User creation failed",
//           error: "USER_CREATION_FAILED",
//         },
//         {
//           status: 500,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Generate secure verification token
//     let verificationToken;
//     try {
//       verificationToken = crypto.randomBytes(32).toString("hex");
//       const hashedToken = crypto
//         .createHash("sha256")
//         .update(verificationToken)
//         .digest("hex");
      
//       // Set token with 24-hour expiry
//       user.verificationToken = hashedToken;
//       user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
//       await user.save({ validateBeforeSave: false });
//       console.log("✅ [REGISTER API] Verification token generated");
//     } catch (tokenError) {
//       console.error("❌ [REGISTER API] Token generation error:", tokenError);
      
//       // Clean up user if token generation fails
//       await User.findByIdAndDelete(user._id);
      
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Failed to generate verification token",
//           error: "TOKEN_GENERATION_FAILED",
//         },
//         {
//           status: 500,
//           headers: corsHeaders,
//         }
//       );
//     }

//     // Send verification email
//     try {
//       const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
//       const emailSent = await sendEmail({
//         to: user.email,
//         subject: "Verify Your Email Address - Steponext",
//         html: `
//           <!DOCTYPE html>
//           <html>
//           <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Email Verification</title>
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
//                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
//                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 8px;
//                 font-weight: bold;
//                 margin: 20px 0;
//               }
//               .footer {
//                 margin-top: 30px;
//                 padding-top: 20px;
//                 border-top: 1px solid #e0e0e0;
//                 color: #666;
//                 font-size: 12px;
//               }
//               .expiry-note {
//                 background: #fff3cd;
//                 border: 1px solid #ffeaa7;
//                 border-radius: 6px;
//                 padding: 12px;
//                 margin: 20px 0;
//                 color: #856404;
//               }
//             </style>
//           </head>
//           <body>
//             <div class="header">
//               <h1>Welcome to Steponext!</h1>
//             </div>
//             <div class="content">
//               <h2>Hello ${user.fullName},</h2>
//               <p>Thank you for registering with Steponext. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              
//               <div style="text-align: center;">
//                 <a href="${verificationUrl}" class="button">Verify Email Address</a>
//               </div>
              
//               <div class="expiry-note">
//                 <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you don't verify within this time, you'll need to request a new verification email.
//               </div>
              
//               <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
//               <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
//                 ${verificationUrl}
//               </p>
              
//               <p>If you didn't create an account with Steponext, please ignore this email.</p>
              
//               <div class="footer">
//                 <p>Best regards,<br>The Steponext Team</p>
//                 <p><small>This is an automated message, please do not reply to this email.</small></p>
//               </div>
//             </div>
//           </body>
//           </html>
//         `,
//         text: `Welcome to Steponext!

// Hello ${user.fullName},

// Thank you for registering with Steponext. To complete your registration and activate your account, please verify your email address by clicking the link below:

// ${verificationUrl}

// Important: This verification link will expire in 24 hours. If you don't verify within this time, you'll need to request a new verification email.

// If you didn't create an account with Steponext, please ignore this email.

// Best regards,
// The Steponext Team

// This is an automated message, please do not reply to this email.`,
//       });

//       if (!emailSent) {
//         console.warn("⚠️ [REGISTER API] Email sending failed, but user was created");
//         // Continue without throwing error - user can request new verification email
//       } else {
//         console.log("✅ [REGISTER API] Verification email sent successfully");
//       }
//     } catch (emailError) {
//       console.error("❌ [REGISTER API] Email sending error:", emailError);
//       // Continue - user can request new verification email later
//     }

//     // Prepare success response
//     const response = {
//       success: true,
//       message: "Account created successfully! Please check your email to verify your account before logging in.",
//       data: {
//         id: user._id.toString(),
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         isVerified: user.isVerified,
//         verificationRequired: true,
//       },
//       instructions: {
//         verification: "Check your email for a verification link (valid for 24 hours)",
//         nextSteps: "After verifying your email, you can log in with your credentials",
//         support: "If you don't receive the email, check your spam folder or request a new verification link",
//       },
//     };

//     console.log("✅ [REGISTER API] Registration process completed successfully");

//     return NextResponse.json(response, {
//       status: 201,
//       headers: corsHeaders,
//     });

//   } catch (error) {
//     console.error("❌ [REGISTER API] Unexpected error:", error);
    
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal server error",
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: corsHeaders,
//       }
//     );
//   }
// }

// // GET endpoint for API information and testing
// export async function GET(request) {
//   try {
//     console.log("🔧 [REGISTER API] GET request received");
    
//     const info = {
//       endpoint: "/api/auth/register",
//       method: "POST",
//       description: "User registration endpoint with email verification",
//       required_fields: [
//         "fullName (string, min 2 chars)",
//         "email (valid email format)",
//         "phone (10-15 digits)",
//         "password (min 6 characters)",
//       ],
//       optional_fields: [
//         "role (user, admin, manager - defaults to 'user')",
//       ],
//       security_features: [
//         "Email verification required before login",
//         "24-hour verification token expiry",
//         "Password hashing with bcrypt",
//         "Duplicate email/phone prevention",
//         "Input validation and sanitization",
//       ],
//       response_format: {
//         success: "boolean",
//         message: "string",
//         data: "object (user info)",
//         instructions: "object (next steps)",
//       },
//       status: "operational",
//       timestamp: new Date().toISOString(),
//     };

//     return NextResponse.json(info, {
//       status: 200,
//       headers: corsHeaders,
//     });
//   } catch (error) {
//     console.error("❌ [REGISTER API] GET endpoint error:", error);
    
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Error retrieving API information",
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       {
//         status: 500,
//         headers: corsHeaders,
//       }
//     );
//   }
// }









// above code is working without saas












import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import Company from "@/models/Company";
import CompanySettings from "@/models/CompanySettings";
import Counter from "@/models/Counter";
import { sendEmail } from "@/utils/email";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import mongoose from "mongoose";

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:3000' 
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle preflight requests
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    console.log("📝 [REGISTER API] Starting registration process...");

    // Prevent authenticated users from registering new accounts
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already logged in. Please log out to create a new account.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
      console.log("📋 [REGISTER API] Request body received");
    } catch (error) {
      console.error("❌ [REGISTER API] JSON parse error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON data in request",
          error: "JSON_PARSE_ERROR",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { fullName, email, phone, password, role, companyName, plan = 'free' } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required: fullName, email, phone, password",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
          field: "email",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate phone number
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number must be 10-15 digits",
          field: "phone",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
          field: "password",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate role
    const allowedRoles = ['user', 'admin', 'manager'];
    const selectedRole = role && allowedRoles.includes(role) ? role : 'user';
    
    // Restrict admin registration in production (admins should be created manually)
    if (process.env.NODE_ENV === 'production' && selectedRole === 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: "Admin registration is restricted. Please contact support.",
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Connect to database
    try {
      await connectDB();
      console.log("✅ [REGISTER API] Database connected");
    } catch (dbError) {
      console.error("❌ [REGISTER API] Database connection error:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: "DB_CONNECTION_ERROR",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Check for existing user with email or phone
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase().trim() ? 'email' : 'phone';
      return NextResponse.json(
        {
          success: false,
          message: `${field === 'email' ? 'Email' : 'Phone number'} is already registered`,
          field,
        },
        {
          status: 409, // Conflict
          headers: corsHeaders,
        }
      );
    }

    // ===== SAAS: CREATE COMPANY FOR NEW ADMIN =====
    let companyId = null;
    let adminType = null;

    if (selectedRole === 'admin') {
      // Admin registration requires company creation
      if (!companyName) {
        return NextResponse.json(
          {
            success: false,
            message: "Company name is required for admin registration",
            field: "companyName",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Check if company name already exists
      const existingCompany = await Company.findOne({ 
        companyName: companyName.trim() 
      });
      
      if (existingCompany) {
        return NextResponse.json(
          {
            success: false,
            message: "Company name already exists. Please choose a different name.",
            field: "companyName",
          },
          {
            status: 409,
            headers: corsHeaders,
          }
        );
      }

      // Start a session for transaction
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      try {
        // 1. Create company
        const company = await Company.create([{
          companyName: companyName.trim(),
          companyEmail: email.toLowerCase().trim(),
          companyPhone: phone.trim(),
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
          },
          subscription: {
            plan: plan,
            status: 'active',
            startDate: new Date(),
          },
          limits: getPlanLimits(plan),
          features: getPlanFeatures(plan),
          status: 'active',
          createdBy: 'system', // Will be updated after user creation
        }], { session: dbSession });

        companyId = company[0]._id;
        adminType = 'company'; // Regular company admin

        // 2. Create company settings
        await CompanySettings.create([{
          companyId: companyId,
          companyName: companyName.trim(),
          phone: phone.trim(),
          email: email.toLowerCase().trim(),
          address: '',
          city: '',
          createdBy: 'system',
          orderFlowMode: 'short',
        }], { session: dbSession });

        // 3. Initialize company counters
        await Counter.initializeCompanyCounters(companyId, 'system');

        console.log("✅ [REGISTER API] Company created for admin:", {
          companyId: companyId.toString(),
          companyName: companyName,
          plan: plan
        });

        await dbSession.commitTransaction();
      } catch (companyError) {
        await dbSession.abortTransaction();
        console.error("❌ [REGISTER API] Company creation error:", companyError);
        
        return NextResponse.json(
          {
            success: false,
            message: "Failed to create company. Please try again.",
            error: "COMPANY_CREATION_FAILED",
          },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      } finally {
        dbSession.endSession();
      }
    }

    // Create user object
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: password,
      role: selectedRole,
      adminType: adminType, // Only for admins
      companyId: companyId, // Only for admins and managers
      isVerified: false, // Email verification required
      status: 'pending', // Start as pending until email verified
      notificationSettings: {
        pushNotifications: {
          enabled: selectedRole === 'admin',
          lastUpdated: new Date(),
        },
        settingsUpdatedAt: new Date(),
      },
    };

    let user;
    try {
      // Create user in database
      user = await User.create(userData);
      console.log("✅ [REGISTER API] User created successfully:", {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        adminType: user.adminType,
        companyId: user.companyId?.toString()
      });

      // Update company with createdBy if this is an admin
      if (selectedRole === 'admin' && companyId) {
        await Company.findByIdAndUpdate(companyId, {
          createdBy: user._id
        });
      }

    } catch (createError) {
      console.error("❌ [REGISTER API] User creation error:", createError);
      
      // If user creation fails and company was created, we should clean up
      if (companyId) {
        await Company.findByIdAndDelete(companyId);
        await CompanySettings.findOneAndDelete({ companyId });
        console.log("🧹 [REGISTER API] Cleaned up company due to user creation failure");
      }
      
      // Handle duplicate key errors
      if (createError.code === 11000) {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate entry detected. Please try different credentials.",
            error: "DUPLICATE_ENTRY",
          },
          {
            status: 409,
            headers: corsHeaders,
          }
        );
      }
      
      // Handle validation errors
      if (createError.name === 'ValidationError') {
        const errors = Object.values(createError.errors).map(err => err.message);
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors,
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          message: "User creation failed",
          error: "USER_CREATION_FAILED",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Generate secure verification token
    let verificationToken;
    try {
      verificationToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
      
      // Set token with 24-hour expiry
      user.verificationToken = hashedToken;
      user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      await user.save({ validateBeforeSave: false });
      console.log("✅ [REGISTER API] Verification token generated");
    } catch (tokenError) {
      console.error("❌ [REGISTER API] Token generation error:", tokenError);
      
      // Clean up user if token generation fails
      await User.findByIdAndDelete(user._id);
      if (companyId) {
        await Company.findByIdAndDelete(companyId);
        await CompanySettings.findOneAndDelete({ companyId });
      }
      
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate verification token",
          error: "TOKEN_GENERATION_FAILED",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      const emailSent = await sendEmail({
        to: user.email,
        subject: "Verify Your Email Address - Steponext",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
              }
              .expiry-note {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 12px;
                margin: 20px 0;
                color: #856404;
              }
              ${selectedRole === 'admin' ? `
              .company-info {
                background: #e8f4fd;
                border: 1px solid #b8e0ff;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #0369a1;
              }
              ` : ''}
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Welcome to Steponext!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.fullName},</h2>
              <p>Thank you for registering with Steponext. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              
              ${selectedRole === 'admin' ? `
              <div class="company-info">
                <strong>🏢 Company Information:</strong><br>
                Company Name: ${companyName}<br>
                Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}<br>
                Your company has been created successfully. After verification, you can log in and start managing your business!
              </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="expiry-note">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you don't verify within this time, you'll need to request a new verification email.
              </div>
              
              <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
                ${verificationUrl}
              </p>
              
              <p>If you didn't create an account with Steponext, please ignore this email.</p>
              
              <div class="footer">
                <p>Best regards,<br>The Steponext Team</p>
                <p><small>This is an automated message, please do not reply to this email.</small></p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to Steponext!

Hello ${user.fullName},

Thank you for registering with Steponext. To complete your registration and activate your account, please verify your email address by clicking the link below:

${verificationUrl}

${selectedRole === 'admin' ? `
COMPANY INFORMATION:
Company Name: ${companyName}
Plan: ${plan}
Your company has been created successfully. After verification, you can log in and start managing your business!
` : ''}

Important: This verification link will expire in 24 hours. If you don't verify within this time, you'll need to request a new verification email.

If you didn't create an account with Steponext, please ignore this email.

Best regards,
The Steponext Team

This is an automated message, please do not reply to this email.`,
      });

      if (!emailSent) {
        console.warn("⚠️ [REGISTER API] Email sending failed, but user was created");
      } else {
        console.log("✅ [REGISTER API] Verification email sent successfully");
      }
    } catch (emailError) {
      console.error("❌ [REGISTER API] Email sending error:", emailError);
    }

    // Prepare success response
    const response = {
      success: true,
      message: selectedRole === 'admin' 
        ? "Company and account created successfully! Please check your email to verify your account."
        : "Account created successfully! Please check your email to verify your account.",
      data: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        adminType: user.adminType,
        phone: user.phone,
        isVerified: user.isVerified,
        verificationRequired: true,
        ...(selectedRole === 'admin' && {
          company: {
            id: companyId?.toString(),
            name: companyName,
            plan: plan
          }
        })
      },
      instructions: {
        verification: "Check your email for a verification link (valid for 24 hours)",
        nextSteps: selectedRole === 'admin'
          ? "After verification, log in to access your company dashboard and complete your company profile."
          : "After verifying your email, you can log in with your credentials.",
        support: "If you don't receive the email, check your spam folder or request a new verification link",
      },
    };

    console.log("✅ [REGISTER API] Registration process completed successfully");

    return NextResponse.json(response, {
      status: 201,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("❌ [REGISTER API] Unexpected error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// GET endpoint for API information and testing
export async function GET(request) {
  try {
    console.log("🔧 [REGISTER API] GET request received");
    
    const info = {
      endpoint: "/api/auth/register",
      method: "POST",
      description: "Multi-tenant user registration endpoint with company creation for admins",
      required_fields: [
        "fullName (string, min 2 chars)",
        "email (valid email format)",
        "phone (10-15 digits)",
        "password (min 6 characters)",
      ],
      optional_fields: [
        "role (user, admin, manager - defaults to 'user')",
        "companyName (required if role='admin')",
        "plan (free, basic, pro, enterprise - defaults to 'free')",
      ],
      security_features: [
        "Email verification required before login",
        "24-hour verification token expiry",
        "Password hashing with bcrypt",
        "Duplicate email/phone prevention",
        "Input validation and sanitization",
        "Company name uniqueness check",
        "Transactional database operations",
      ],
      saas_features: [
        "Automatic company creation for admin users",
        "Company settings initialization",
        "Counter initialization for new companies",
        "Plan-based limits and features",
        "Multi-tenant isolation from registration",
      ],
      response_format: {
        success: "boolean",
        message: "string",
        data: {
          id: "string",
          fullName: "string",
          email: "string",
          role: "string",
          adminType: "string (null for non-admins)",
          company: "object (for admins)",
        },
        instructions: "object (next steps)",
      },
      status: "operational",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(info, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ [REGISTER API] GET endpoint error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Error retrieving API information",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Helper function to get plan limits
function getPlanLimits(plan) {
  const limits = {
    free: {
      maxUsers: 3,
      maxProducts: 100,
      maxOrdersPerMonth: 100,
      maxBookingsPerMonth: 100,
      storageLimit: 512, // MB
    },
    basic: {
      maxUsers: 10,
      maxProducts: 1000,
      maxOrdersPerMonth: 500,
      maxBookingsPerMonth: 500,
      storageLimit: 2048, // 2GB
    },
    pro: {
      maxUsers: 50,
      maxProducts: 5000,
      maxOrdersPerMonth: 2000,
      maxBookingsPerMonth: 2000,
      storageLimit: 10240, // 10GB
    },
    enterprise: {
      maxUsers: 10000,
      maxProducts: 100000,
      maxOrdersPerMonth: 100000,
      maxBookingsPerMonth: 100000,
      storageLimit: 102400, // 100GB
    },
  };
  
  return limits[plan] || limits.free;
}

// Helper function to get plan features
function getPlanFeatures(plan) {
  const features = {
    free: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: false,
      referrals: false,
      apiAccess: false,
      multipleUsers: true,
      customDomain: false,
    },
    basic: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: true,
      referrals: false,
      apiAccess: false,
      multipleUsers: true,
      customDomain: false,
    },
    pro: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: true,
      referrals: true,
      apiAccess: true,
      multipleUsers: true,
      customDomain: false,
    },
    enterprise: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: true,
      referrals: true,
      apiAccess: true,
      multipleUsers: true,
      customDomain: true,
    },
  };
  
  return features[plan] || features.free;
}