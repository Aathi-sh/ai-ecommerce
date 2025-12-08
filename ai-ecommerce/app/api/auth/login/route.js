// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import User from "@/models/user";
// import { generateToken } from "@/utils/jwt";

// export async function POST(req) {
//   try {
//     await connectDB();

//     const { email, password } = await req.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { message: "Email and password are required" },
//         { status: 400 }
//       );
//     }

//     // Find user and include password
//     const user = await User.findOne({ email }).select('+password');

//     if (!user) {
//       return NextResponse.json(
//         { message: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     // Check password
//     const isPasswordValid = await user.comparePassword(password);

//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { message: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     // Check if email is verified
//     if (!user.isVerified) {
//       return NextResponse.json(
//         { message: "Please verify your email first" },
//         { status: 401 }
//       );
//     }

//     // Update last login
//     user.lastLogin = new Date();
//     await user.save({ validateBeforeSave: false });

//     // Generate token
//     const token = generateToken({ userId: user._id });

//     return NextResponse.json({
//       message: "Login successful",
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         isVerified: user.isVerified
//       },
//       token
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import User from "@/models/user";
import { generateToken } from "@/utils/jwt";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Validate input more thoroughly
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
      sessionId: sessionData.sessionId
    });

    // Prepare user response
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      hasActiveNotifications: user.notificationSettings?.pushNotifications?.enabled || false,
      activeSessionsCount: user.activeSessions?.filter(s => s.status === 'active').length || 0,
      lastLogin: user.lastLogin
    };

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
        sessionId: sessionData.sessionId,
        expiresAt: sessionData.expiresAt
      }
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