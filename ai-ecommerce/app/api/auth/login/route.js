// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import { generateToken } from "@/utils/jwt";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: "Email and password are required" 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email format" 
        },
        { status: 400 }
      );
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password" 
        },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status !== 'active') {
      const statusMessages = {
        'inactive': 'Account is inactive',
        'suspended': 'Account is suspended',
        'deleted': 'Account not found'
      };
      
      return NextResponse.json(
        { 
          success: false,
          message: statusMessages[user.status] || 'Account is not active' 
        },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password" 
        },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          success: false,
          message: "Please verify your email first",
          requiresVerification: true,
          userId: user._id
        },
        { status: 401 }
      );
    }

    // Create session record
    const sessionData = {
      sessionId: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userAgent: req.headers.get('user-agent') || 'Unknown',
      ipAddress: req.headers.get('x-forwarded-for') || req.ip || 'Unknown',
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Add session to user
    user.addActiveSession(sessionData);
    
    // Update last login
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    
    await user.save({ validateBeforeSave: false });

    // Generate token with more data
    const token = generateToken({ 
      userId: user._id,
      role: user.role,
      email: user.email,
      sessionId: sessionData.sessionId,
      name: user.fullName
    });

    // Prepare user response - RETURN AT ROOT LEVEL
    const userResponse = {
      id: user._id.toString(),
      _id: user._id.toString(), // Include both for compatibility
      fullName: user.fullName,
      name: user.fullName, // Include as 'name' for compatibility
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      status: user.status,
      hasActiveNotifications: user.notificationSettings?.pushNotifications?.enabled || false,
      activeSessionsCount: user.activeSessions?.filter(s => s.status === 'active').length || 0,
      lastLogin: user.lastLogin
    };

    // RETURN DATA AT ROOT LEVEL (not nested in 'data')
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token: token, // Direct token at root
      user: userResponse, // Direct user at root
      sessionId: sessionData.sessionId,
      expiresAt: sessionData.expiresAt
    });
    
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Authentication failed",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}