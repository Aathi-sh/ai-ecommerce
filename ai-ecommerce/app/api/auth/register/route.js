// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import User from "@/models/user";
// import { sendEmail } from "@/utils/email";
// import { generateToken } from "@/utils/jwt";

// export async function POST(req) {
//   try {
//     console.log("📌 Starting signup request...");

//     await connectDB();
//     console.log("📌 DB Connected");

//     const body = await req.json();
//     console.log("📌 Received Data:", body);

//     const { fullName, email, phone, password } = body;

//     // Validation
//     if (!fullName || !email || !phone || !password) {
//       console.log("❌ Validation failed");
//       return NextResponse.json(
//         { message: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     // Check existing user
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingUser) {
//       console.log("❌ User already exists");
//       return NextResponse.json(
//         { message: "Email or phone already exists" },
//         { status: 400 }
//       );
//     }

//     // Create user
//     const user = await User.create({
//       fullName,
//       email,
//       phone,
//       password,
//     });

//     console.log("📌 User created:", user._id);

//     // Token for email verification
//     const verificationToken = user.createVerificationToken();
//     await user.save({ validateBeforeSave: false });

//     console.log("📌 Verification token generated:", verificationToken);

//     const verificationUrl = `${process.env.FRONTEND_URL}/verifyEmail?token=${verificationToken}`;
//     console.log("📌 Verification URL:", verificationUrl);

//     // Send email
//     try {
//       await sendEmail({
//         to: user.email,
//         subject: "Verify Your Email",
//         html: `
//           <h2>Email Verification</h2>
//           <p>Click the link below to verify your email:</p>
//           <a href="${verificationUrl}" style="padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
//             Verify Email
//           </a>
//           <p>Or copy this link: ${verificationUrl}</p>
//         `,
//       });
//       console.log("📌 Verification email sent");
//     } catch (emailError) {
//       console.error("❌ Email sending failed:", emailError);
//       return NextResponse.json(
//         {
//           message: "Failed to send verification email",
//           error: emailError.message,
//         },
//         { status: 500 }
//       );
//     }

//     // Generate JWT token
//     const token = generateToken({ userId: user._id });
//     console.log("📌 JWT token generated");

//     return NextResponse.json(
//       {
//         message:
//           "User registered successfully. Please check your email for verification.",
//         user: {
//           id: user._id,
//           fullName: user.fullName,
//           email: user.email,
//           role: user.role,
//         },
//         token,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("❌ Registration Error:", error);

//     // Mongoose duplicate key error (11000)
//     if (error.code === 11000) {
//       return NextResponse.json(
//         {
//           message: "Duplicate field value",
//           field: Object.keys(error.keyPattern)[0],
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       {
//         message: "Server error",
//         error: error.message,
//         stack: error.stack, // 🔥 shows exact error cause
//       },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import { sendEmail } from "@/utils/email";
import { generateToken } from "@/utils/jwt";

export async function POST(req) {
  try {
    console.log("📌 Starting signup request...");

    await connectDB();
    console.log("📌 DB Connected");

    const body = await req.json();
    console.log("📌 Received Data:", body);

    // Extract data with role - if not provided, it will use model default ("user")
    const { fullName, email, phone, password, role } = body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      console.log("❌ Validation failed");
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate role if provided
    const allowedRoles = ["admin", "user", "manager"];
    if (role && !allowedRoles.includes(role)) {
      console.log("❌ Invalid role specified:", role);
      return NextResponse.json(
        { message: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      console.log("❌ User already exists");
      return NextResponse.json(
        { message: "Email or phone already exists" },
        { status: 400 }
      );
    }

    // Create user object
    const userData = {
      fullName,
      email,
      phone,
      password,
    };
    
    // Only add role if provided (otherwise model default will be used)
    if (role) {
      userData.role = role;
    }

    // Create user
    const user = await User.create(userData);
    console.log("📌 User created:", user._id, "with role:", user.role);

    // Token for email verification
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });
    console.log("📌 Verification token generated");

    const verificationUrl = `${process.env.FRONTEND_URL}/verifyEmail?token=${verificationToken}`;
    console.log("📌 Verification URL:", verificationUrl);

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Account Created Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Our Platform!</h2>
            <p>Hello ${user.fullName},</p>
            <p>Your account has been created successfully with <strong>${user.role.toUpperCase()}</strong> privileges.</p>
            <p>Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #0070f3; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; 
                      word-break: break-all;">${verificationUrl}</p>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              <h4 style="margin-top: 0;">Account Details:</h4>
              <p><strong>Name:</strong> ${user.fullName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Role:</strong> ${user.role}</p>
              <p><strong>Account Type:</strong> ${user.role === 'admin' ? 'Administrator (Full Access)' : 
                user.role === 'manager' ? 'Manager (Limited Access)' : 'User (Basic Access)'}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        `,
      });
      console.log("📌 Verification email sent");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      // Continue even if email fails
    }

    // Generate JWT token with user data
    const token = generateToken({ 
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.fullName
    });
    console.log("📌 JWT token generated for role:", user.role);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! Please check your email for verification.",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
        },
        token,
        redirectTo: user.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Registration Error:", error);
    console.error("Error stack:", error.stack);

    // Mongoose duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'email' ? 'Email' : 'Phone number';
      return NextResponse.json(
        {
          success: false,
          message: `${fieldName} is already registered. Please use a different ${fieldName}.`,
        },
        { status: 400 }
      );
    }

    // Validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        {
          success: false,
          message: messages.join(', '),
        },
        { status: 400 }
      );
    }

    // General error
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for testing
export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: "Signup API endpoint is active",
      endpoint: "/api/auth/register",
      method: "POST",
      required_fields: ["fullName", "email", "phone", "password"],
      optional_fields: ["role (admin/user/manager)"],
      note: "If role is not provided, default will be 'user'"
    },
    { status: 200 }
  );
}