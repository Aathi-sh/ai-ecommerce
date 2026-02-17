import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth';

/**
 * Server-side authentication utilities
 * For use in API routes and server components
 */

// Get current user server-side
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Check if user has specific role
export async function requireRole(role) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      authorized: false,
      redirect: '/login',
    };
  }

  if (session.user.role !== role) {
    return {
      authorized: false,
      redirect: '/dashboard',
    };
  }

  return {
    authorized: true,
    user: session.user,
  };
}

// Check if user is admin
export async function requireAdmin() {
  return requireRole('admin');
}

// Check if user is manager or admin
export async function requireManager() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      authorized: false,
      redirect: '/login',
    };
  }

  if (!['admin', 'manager'].includes(session.user.role)) {
    return {
      authorized: false,
      redirect: '/dashboard',
    };
  }

  return {
    authorized: true,
    user: session.user,
  };
}

// Validate API request with role check
export async function validateApiRequest(request, requiredRole = null) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      success: false,
      error: 'Unauthorized',
      status: 401,
    };
  }

  if (!session.user.isVerified) {
    return {
      success: false,
      error: 'Email verification required',
      status: 403,
    };
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return {
      success: false,
      error: 'Insufficient permissions',
      status: 403,
    };
  }

  return {
    success: true,
    user: session.user,
  };
}

// Get user session with extended data
export async function getUserSession() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    return {
      ...session,
      user: {
        ...session.user,
        isAuthenticated: true,
        isAdmin: session.user.role === 'admin',
        isManager: session.user.role === 'manager',
        hasPermission: (permission) => {
          // Implement permission checking logic here
          // This could check against user.permissions array if you add it
          return true; // Default for now
        },
      },
    };
  } catch (error) {
    console.error('Get user session error:', error);
    return null;
  }
}

// Check if user can access specific route
export async function canAccessRoute(pathname, user) {
  if (!user) return false;
  
  const adminPaths = ['/admin', '/admin/'];
  const managerPaths = ['/manager', '/manager/'];
  
  if (pathname.startsWith('/admin')) {
    return user.role === 'admin';
  }
  
  if (pathname.startsWith('/manager')) {
    return ['admin', 'manager'].includes(user.role);
  }
  
  return true; // All other routes are accessible
}

// Logout helper for server-side
export async function serverLogout(request) {
  try {
    // This would typically clear server-side session
    // In NextAuth, sessions are handled client-side
    // This function is for any server-side cleanup
    
    return { success: true };
  } catch (error) {
    console.error('Server logout error:', error);
    return { success: false, error: error.message };
  }
}