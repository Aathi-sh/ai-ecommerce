import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import { sendEmail } from "@/utils/email";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        message: "If email exists, password reset link will be sent"
      });
    }

    // Generate reset token
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    // Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/resetPass?token=${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>Or copy this link: ${resetUrl}</p>
      `,
    });

    return NextResponse.json({
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}