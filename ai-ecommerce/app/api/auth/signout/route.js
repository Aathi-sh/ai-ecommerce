import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../nextauth';
import { connectDB } from '../../../../utils/db';

export async function POST(request) {
  try {
    console.log('🔐 Processing logout request');
    
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('No active session found');
      return NextResponse.json(
        { success: true, message: 'Already logged out' },
        { status: 200 }
      );
    }
    
    console.log('Logging out user:', {
      id: session.user.id,
      email: session.user.email
    });
    
    // Connect to database
    await connectDB();
    
    // If you have a User model and want to update user status
    try {
      const User = (await import('../../../../models/user')).default;
      
      await User.findByIdAndUpdate(session.user.id, {
        $set: {
          lastLogout: new Date()
        },
        $pull: {
          activeSessions: { sessionId: session.id || 'current' }
        }
      });
      
      console.log('✅ User session updated in database');
    } catch (dbError) {
      console.warn('⚠️ Could not update user in database:', dbError.message);
      // Continue anyway - logout should still work
    }
    
    // Create response
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully',
        redirectTo: '/login'
      },
      { status: 200 }
    );
    
    // Clear all auth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      'token',
      'auth-token',
      'session-token',
      'refresh-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });
    
    console.log('✅ Logout completed successfully');
    
    return response;
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Even on error, try to clear cookies
    const errorResponse = NextResponse.json(
      { 
        success: false, 
        message: 'Logout failed',
        error: error.message 
      },
      { status: 500 }
    );
    
    // Still try to clear cookies
    errorResponse.cookies.delete('next-auth.session-token');
    errorResponse.cookies.delete('token');
    
    return errorResponse;
  }
}

export async function GET(request) {
  // Handle GET requests (direct browser navigation to /api/auth/logout)
  const response = NextResponse.redirect(new URL('/login', request.url));
  
  // Clear auth cookies
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('token');
  response.cookies.delete('auth-token');
  
  return response;
}