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

    const { fullName, email, phone, password } = body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      console.log("❌ Validation failed");
      return NextResponse.json(
        { message: "All fields are required" },
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

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    console.log("📌 User created:", user._id);

    // Token for email verification
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    console.log("📌 Verification token generated:", verificationToken);

    const verificationUrl = `${process.env.FRONTEND_URL}/verifyEmail?token=${verificationToken}`;
    console.log("📌 Verification URL:", verificationUrl);

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email",
        html: `
          <h2>Email Verification</h2>
          <p>Click the link below to verify your email:</p>
          <a href="${verificationUrl}" style="padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>Or copy this link: ${verificationUrl}</p>
        `,
      });
      console.log("📌 Verification email sent");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      return NextResponse.json(
        {
          message: "Failed to send verification email",
          error: emailError.message,
        },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = generateToken({ userId: user._id });
    console.log("📌 JWT token generated");

    return NextResponse.json(
      {
        message:
          "User registered successfully. Please check your email for verification.",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Registration Error:", error);

    // Mongoose duplicate key error (11000)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "Duplicate field value",
          field: Object.keys(error.keyPattern)[0],
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Server error",
        error: error.message,
        stack: error.stack, // 🔥 shows exact error cause
      },
      { status: 500 }
    );
  }
}
