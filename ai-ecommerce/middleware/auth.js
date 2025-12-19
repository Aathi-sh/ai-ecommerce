// middleware/auth.js
import { verifyToken } from '../utils/jwt';

export async function authMiddleware(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        message: 'No token provided',
        status: 401
      };
    }
    
    const token = authHeader.split(' ')[1];
    const tokenResult = verifyToken(token);
    
    if (!tokenResult.success) {
      return {
        success: false,
        message: tokenResult.expired ? 'Token expired. Please login again.' : 'Invalid token',
        status: 401
      };
    }
    
    return {
      success: true,
      user: {
        id: tokenResult.userId,
        role: tokenResult.role,
        email: tokenResult.email,
        sessionId: tokenResult.data?.sessionId
      }
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      message: 'Authentication failed',
      status: 500
    };
  }
}