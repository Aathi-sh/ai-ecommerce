// app/api/user/update-name/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db';
import User from '@/models/user';
import rateLimit from '@/lib/rate-limit';

// Rate limiter: 5 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export async function PUT(request) {
  try {
    // ===== 1. RATE LIMITING =====
    try {
      await limiter.check(5, 'update_name'); // 5 attempts per minute
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            ...securityHeaders
          }
        }
      );
    }

    // ===== 2. CHECK AUTHENTICATION =====
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You must be logged in to update your profile',
          code: 'UNAUTHORIZED'
        },
        { 
          status: 401,
          headers: securityHeaders
        }
      );
    }

    // ===== 3. VALIDATE INPUT =====
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request format',
          code: 'INVALID_JSON'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    const { name } = body;

    // Professional name validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name is required',
          code: 'NAME_REQUIRED',
          field: 'name'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name must be at least 2 characters long',
          code: 'NAME_TOO_SHORT',
          field: 'name'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name must not exceed 50 characters',
          code: 'NAME_TOO_LONG',
          field: 'name'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // Validate name format (only letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmedName)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
          code: 'NAME_INVALID_CHARS',
          field: 'name'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // ===== 4. CONNECT TO DATABASE =====
    await connectDB();

    // ===== 5. CHECK IF USER EXISTS =====
    const existingUser = await User.findById(session.user.id);
    
    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User account not found',
          code: 'USER_NOT_FOUND'
        },
        { 
          status: 404,
          headers: securityHeaders
        }
      );
    }

    // ===== 6. CHECK IF NAME ACTUALLY CHANGED =====
    if (existingUser.fullName === trimmedName || existingUser.name === trimmedName) {
      return NextResponse.json({
        success: true,
        message: 'Name is already set to this value',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          name: trimmedName,
          fullName: trimmedName
        }
      }, {
        headers: securityHeaders
      });
    }

    // ===== 7. UPDATE NAME IN DATABASE =====
    const oldName = existingUser.fullName || existingUser.name;
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        fullName: trimmedName,
        name: trimmedName, // Update both fields for compatibility
        updatedAt: new Date(),
        $push: {
          nameHistory: {
            oldName: oldName,
            newName: trimmedName,
            changedAt: new Date(),
            changedBy: session.user.id,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
          }
        }
      },
      { 
        new: true,
        runValidators: true,
        select: 'fullName name email role'
      }
    );

    // ===== 8. LOG THE CHANGE FOR AUDIT =====
    console.log('📝 [NAME UPDATE] User changed name:', {
      userId: session.user.id,
      email: session.user.email,
      oldName: oldName,
      newName: trimmedName,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // ===== 9. RETURN SUCCESS RESPONSE =====
    return NextResponse.json({
      success: true,
      message: 'Name updated successfully!',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.fullName || updatedUser.name,
        fullName: updatedUser.fullName || updatedUser.name,
        role: updatedUser.role
      },
      timestamp: new Date().toISOString()
    }, {
      headers: securityHeaders
    });

  } catch (error) {
    // ===== 10. ERROR HANDLING =====
    console.error('❌ [NAME UPDATE] Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { 
        status: 500,
        headers: securityHeaders
      }
    );
  }
}

// ===== OPTIONS METHOD FOR CORS =====
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'PUT, OPTIONS',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      ...securityHeaders
    },
  });
}

// ===== GET METHOD FOR API INFO =====
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/user/update-name',
    method: 'PUT',
    description: 'Update user profile name',
    authentication: 'Required (NextAuth session)',
    rate_limit: '5 requests per minute',
    request_body: {
      name: {
        type: 'string',
        required: true,
        min_length: 2,
        max_length: 50,
        pattern: '^[a-zA-Z\\s\\-\']+$'
      }
    },
    responses: {
      200: 'Name updated successfully',
      400: 'Invalid input',
      401: 'Unauthorized',
      404: 'User not found',
      429: 'Rate limit exceeded',
      500: 'Server error'
    },
    timestamp: new Date().toISOString()
  }, {
    headers: securityHeaders
  });
}