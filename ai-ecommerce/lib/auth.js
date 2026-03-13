// import { getServerSession } from 'next-auth';
// import { authOptions } from './nextauth';

// /**
//  * Server-side authentication utilities
//  * For use in API routes and server components
//  */

// // Get current user server-side
// export async function getCurrentUser() {
//   try {
//     const session = await getServerSession(authOptions);
//     return session?.user || null;
//   } catch (error) {
//     console.error('Get current user error:', error);
//     return null;
//   }
// }

// // Check if user has specific role
// export async function requireRole(role) {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user) {
//     return {
//       authorized: false,
//       redirect: '/login',
//     };
//   }

//   if (session.user.role !== role) {
//     return {
//       authorized: false,
//       redirect: '/dashboard',
//     };
//   }

//   return {
//     authorized: true,
//     user: session.user,
//   };
// }

// // Check if user is admin
// export async function requireAdmin() {
//   return requireRole('admin');
// }

// // Check if user is manager or admin
// export async function requireManager() {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user) {
//     return {
//       authorized: false,
//       redirect: '/login',
//     };
//   }

//   if (!['admin', 'manager'].includes(session.user.role)) {
//     return {
//       authorized: false,
//       redirect: '/dashboard',
//     };
//   }

//   return {
//     authorized: true,
//     user: session.user,
//   };
// }

// // Validate API request with role check
// export async function validateApiRequest(request, requiredRole = null) {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user) {
//     return {
//       success: false,
//       error: 'Unauthorized',
//       status: 401,
//     };
//   }

//   if (!session.user.isVerified) {
//     return {
//       success: false,
//       error: 'Email verification required',
//       status: 403,
//     };
//   }

//   if (requiredRole && session.user.role !== requiredRole) {
//     return {
//       success: false,
//       error: 'Insufficient permissions',
//       status: 403,
//     };
//   }

//   return {
//     success: true,
//     user: session.user,
//   };
// }

// // Get user session with extended data
// export async function getUserSession() {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       return null;
//     }

//     return {
//       ...session,
//       user: {
//         ...session.user,
//         isAuthenticated: true,
//         isAdmin: session.user.role === 'admin',
//         isManager: session.user.role === 'manager',
//         hasPermission: (permission) => {
//           // Implement permission checking logic here
//           // This could check against user.permissions array if you add it
//           return true; // Default for now
//         },
//       },
//     };
//   } catch (error) {
//     console.error('Get user session error:', error);
//     return null;
//   }
// }

// // Check if user can access specific route
// export async function canAccessRoute(pathname, user) {
//   if (!user) return false;
  
//   const adminPaths = ['/admin', '/admin/'];
//   const managerPaths = ['/manager', '/manager/'];
  
//   if (pathname.startsWith('/admin')) {
//     return user.role === 'admin';
//   }
  
//   if (pathname.startsWith('/manager')) {
//     return ['admin', 'manager'].includes(user.role);
//   }
  
//   return true; // All other routes are accessible
// }

// // Logout helper for server-side
// export async function serverLogout(request) {
//   try {
//     // This would typically clear server-side session
//     // In NextAuth, sessions are handled client-side
//     // This function is for any server-side cleanup
    
//     return { success: true };
//   } catch (error) {
//     console.error('Server logout error:', error);
//     return { success: false, error: error.message };
//   }
// }







// above code is working without saas











// utils/auth-server.js
import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth';
import Company from '@/models/Company';

/**
 * Server-side authentication utilities
 * For use in API routes and server components
 * Multi-tenant SaaS support with company isolation
 */

// Get current user server-side with company context
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    // Enhance user with computed properties
    return {
      ...session.user,
      isAuthenticated: true,
      isAdmin: session.user.role === 'admin',
      isSuperAdmin: session.user.role === 'admin' && session.user.adminType === 'super',
      isCompanyAdmin: session.user.role === 'admin' && session.user.adminType === 'company',
      isManager: session.user.role === 'manager',
      hasCompany: !!session.user.companyId,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Check if user has specific role (with company context)
export async function requireRole(role, options = {}) {
  const { requireCompany = true, requireActive = true } = options;
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      authorized: false,
      redirect: '/login',
      error: 'Not authenticated',
    };
  }

  // Check account status
  if (requireActive && session.user.status !== 'active') {
    return {
      authorized: false,
      redirect: `/${session.user.status === 'pending' ? 'verify-email' : `account-${session.user.status}`}`,
      error: `Account is ${session.user.status}`,
    };
  }

  // Check company exists and is active (for non-super-admin)
  if (!session.user.isSuperAdmin && requireCompany) {
    if (!session.user.companyId) {
      return {
        authorized: false,
        redirect: '/login?error=no_company',
        error: 'No company association',
      };
    }

    // Optional: Check company status in database
    try {
      const company = await Company.findById(session.user.companyId).select('status');
      if (company && company.status !== 'active') {
        return {
          authorized: false,
          redirect: '/company-inactive',
          error: `Company is ${company.status}`,
        };
      }
    } catch (error) {
      console.error('Company check error:', error);
    }
  }

  // Check role
  if (role) {
    if (role === 'super_admin' && !session.user.isSuperAdmin) {
      return {
        authorized: false,
        redirect: '/admin/dashboards',
        error: 'Super admin access required',
      };
    }
    
    if (role === 'company_admin' && !session.user.isCompanyAdmin) {
      return {
        authorized: false,
        redirect: '/dashboard',
        error: 'Company admin access required',
      };
    }
    
    if (role === 'admin' && !session.user.isAdmin) {
      return {
        authorized: false,
        redirect: '/dashboard',
        error: 'Admin access required',
      };
    }
    
    if (role === 'manager' && !['admin', 'manager'].includes(session.user.role)) {
      return {
        authorized: false,
        redirect: '/dashboard',
        error: 'Manager access required',
      };
    }
    
    if (session.user.role !== role && !['super_admin', 'company_admin'].includes(role)) {
      return {
        authorized: false,
        redirect: '/dashboard',
        error: `Required role: ${role}`,
      };
    }
  }

  return {
    authorized: true,
    user: session.user,
    companyId: session.user.companyId,
    isSuperAdmin: session.user.isSuperAdmin,
  };
}

// Check if user is admin (any admin type)
export async function requireAdmin(options = {}) {
  return requireRole('admin', options);
}

// Check if user is super admin
export async function requireSuperAdmin(options = {}) {
  return requireRole('super_admin', options);
}

// Check if user is company admin
export async function requireCompanyAdmin(options = {}) {
  return requireRole('company_admin', options);
}

// Check if user is manager or admin
export async function requireManager(options = {}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      authorized: false,
      redirect: '/login',
    };
  }

  if (session.user.status !== 'active') {
    return {
      authorized: false,
      redirect: `/${session.user.status === 'pending' ? 'verify-email' : `account-${session.user.status}`}`,
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
    companyId: session.user.companyId,
  };
}

// Validate API request with role and company check
export async function validateApiRequest(request, options = {}) {
  const { 
    requiredRole = null, 
    requireCompany = true,
    requireActive = true,
    requireVerified = true 
  } = options;

  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      success: false,
      error: 'Unauthorized',
      status: 401,
    };
  }

  // Check verification
  if (requireVerified && !session.user.isVerified) {
    return {
      success: false,
      error: 'Email verification required',
      status: 403,
    };
  }

  // Check account status
  if (requireActive && session.user.status !== 'active') {
    return {
      success: false,
      error: `Account is ${session.user.status}`,
      status: 403,
      redirect: `/${session.user.status === 'pending' ? 'verify-email' : `account-${session.user.status}`}`,
    };
  }

  // Check company context (for non-super-admin)
  const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
  
  if (!isSuperAdmin && requireCompany) {
    if (!session.user.companyId) {
      return {
        success: false,
        error: 'No company association',
        status: 403,
      };
    }

    // Validate company status from database
    try {
      const company = await Company.findById(session.user.companyId).select('status');
      if (!company) {
        return {
          success: false,
          error: 'Company not found',
          status: 404,
        };
      }
      if (company.status !== 'active') {
        return {
          success: false,
          error: `Company is ${company.status}`,
          status: 403,
        };
      }
    } catch (error) {
      console.error('Company validation error:', error);
    }
  }

  // Role validation
  if (requiredRole) {
    if (requiredRole === 'super_admin' && !isSuperAdmin) {
      return {
        success: false,
        error: 'Super admin access required',
        status: 403,
      };
    }
    
    if (requiredRole === 'company_admin' && !(session.user.role === 'admin' && session.user.adminType === 'company')) {
      return {
        success: false,
        error: 'Company admin access required',
        status: 403,
      };
    }
    
    if (requiredRole === 'admin' && session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Admin access required',
        status: 403,
      };
    }
    
    if (requiredRole === 'manager' && !['admin', 'manager'].includes(session.user.role)) {
      return {
        success: false,
        error: 'Manager access required',
        status: 403,
      };
    }
    
    if (session.user.role !== requiredRole && !['super_admin', 'company_admin'].includes(requiredRole)) {
      return {
        success: false,
        error: `Required role: ${requiredRole}`,
        status: 403,
      };
    }
  }

  // Get company ID from request or session
  let companyId = session.user.companyId;
  
  // For super admin, they might specify a company in headers
  if (isSuperAdmin) {
    const headerCompanyId = request.headers.get('x-company-id');
    if (headerCompanyId) {
      // Verify the company exists
      const company = await Company.findById(headerCompanyId).select('_id');
      if (company) {
        companyId = headerCompanyId;
      }
    }
  }

  return {
    success: true,
    user: session.user,
    companyId,
    isSuperAdmin,
    headers: {
      'x-company-id': companyId,
    },
  };
}

// Get user session with extended data and company context
export async function getUserSession() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    const isCompanyAdmin = session.user.role === 'admin' && session.user.adminType === 'company';

    return {
      ...session,
      user: {
        ...session.user,
        isAuthenticated: true,
        isAdmin: session.user.role === 'admin',
        isSuperAdmin,
        isCompanyAdmin,
        isManager: session.user.role === 'manager',
        hasCompany: !!session.user.companyId,
        hasPermission: (permission) => {
          const permissions = {
            super_admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products', 'manage_companies', 'switch_company'],
            company_admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products'],
            manager: ['read', 'write', 'manage_orders', 'view_reports', 'manage_inventory'],
            user: ['read', 'write_own', 'view_profile'],
          };
          
          const userPermissions = isSuperAdmin 
            ? permissions.super_admin 
            : permissions[session.user.role] || ['read'];
            
          return userPermissions.includes(permission);
        },
      },
      company: {
        id: session.user.companyId,
        name: session.user.companyName,
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
  const superAdminPaths = ['/super-admin', '/super-admin/'];
  const managerPaths = ['/manager', '/manager/'];
  
  const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
  const isCompanyAdmin = user.role === 'admin' && user.adminType === 'company';
  
  if (pathname.startsWith('/super-admin')) {
    return isSuperAdmin;
  }
  
  if (pathname.startsWith('/admin')) {
    return isSuperAdmin || isCompanyAdmin;
  }
  
  if (pathname.startsWith('/manager')) {
    return ['admin', 'manager'].includes(user.role);
  }
  
  return true; // All other routes are accessible
}

// Get company context for API requests
export async function getCompanyContext(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
  
  // Super admin can specify company in headers
  if (isSuperAdmin) {
    const headerCompanyId = request.headers.get('x-company-id');
    if (headerCompanyId) {
      return headerCompanyId;
    }
  }
  
  return session.user.companyId;
}

// Validate that user owns the company resource
export async function validateCompanyAccess(resourceCompanyId, options = {}) {
  const { requireSuperAdmin = false } = options;
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      success: false,
      error: 'Unauthorized',
      status: 401,
    };
  }

  const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
  
  // Super admin can access any company (if not restricted)
  if (isSuperAdmin && !requireSuperAdmin) {
    return {
      success: true,
      user: session.user,
      companyId: resourceCompanyId,
    };
  }

  // Check if user's company matches resource company
  if (session.user.companyId?.toString() !== resourceCompanyId?.toString()) {
    return {
      success: false,
      error: 'Access denied to this company\'s data',
      status: 403,
    };
  }

  return {
    success: true,
    user: session.user,
    companyId: session.user.companyId,
  };
}

// Logout helper for server-side (cleans up session)
export async function serverLogout(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      const { headers } = request;
      const fcmToken = headers.get('x-fcm-token');
      const companyId = headers.get('x-company-id') || session.user.companyId;

      // Clean up device tokens if FCM token provided
      if (fcmToken && session.user.isAdmin) {
        try {
          const DeviceToken = (await import('@/models/DeviceToken')).default;
          await DeviceToken.updateOne(
            { fcmToken, companyId, userId: session.user.id },
            { isActive: false, lastActive: new Date() }
          );
          console.log('✅ Device token deactivated on logout');
        } catch (error) {
          console.warn('⚠️ Failed to deactivate device token:', error);
        }
      }
    }

    return { 
      success: true,
      message: 'Server logout successful' 
    };
  } catch (error) {
    console.error('Server logout error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Check company status (for API routes)
export async function checkCompanyStatus(companyId) {
  try {
    if (!companyId) {
      return {
        valid: false,
        error: 'No company ID provided',
      };
    }

    const company = await Company.findById(companyId).select('status subscription');
    
    if (!company) {
      return {
        valid: false,
        error: 'Company not found',
      };
    }

    if (company.status !== 'active') {
      return {
        valid: false,
        error: `Company is ${company.status}`,
        status: company.status,
      };
    }

    // Check subscription if needed
    const now = new Date();
    if (company.subscription?.expiryDate && company.subscription.expiryDate < now) {
      return {
        valid: false,
        error: 'Company subscription expired',
        status: 'expired',
      };
    }

    return {
      valid: true,
      company,
    };
  } catch (error) {
    console.error('Company status check error:', error);
    return {
      valid: false,
      error: 'Error checking company status',
    };
  }
}

// Get user permissions server-side
export async function getUserPermissions(userId, companyId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return [];
    }

    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
    if (isSuperAdmin) {
      return ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products', 'manage_companies', 'switch_company'];
    }

    const permissionMap = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products'],
      manager: ['read', 'write', 'manage_orders', 'view_reports', 'manage_inventory'],
      user: ['read', 'write_own', 'view_profile'],
    };

    return permissionMap[session.user.role] || ['read'];
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}
