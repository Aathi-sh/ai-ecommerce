import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token
    const user = await User.findOne({
      verificationToken: hashedToken
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.json({
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}