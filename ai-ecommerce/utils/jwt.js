// utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return { 
      success: true, 
      data: decoded,
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return { 
      success: false, 
      error: error.message,
      expired: error.name === 'TokenExpiredError'
    };
  }
}

// Middleware function for API routes
export async function authenticateToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
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
        message: tokenResult.expired ? 'Token expired' : 'Invalid token',
        status: 401
      };
    }
    
    return {
      success: true,
      user: {
        id: tokenResult.userId,
        role: tokenResult.role,
        email: tokenResult.email,
        ...tokenResult.data
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication failed',
      status: 500
    };
  }
}