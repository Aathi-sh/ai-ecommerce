

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut, signIn as nextAuthSignIn } from 'next-auth/react';

/**
 * Professional Auth Context for Next.js Application
 * 
 * This context provides authentication state and methods
 * using NextAuth as the single source of truth.
 * 
 * Features:
 * - Multi-tenant SaaS support with company isolation
 * - Super admin vs company admin distinction
 * - Company context in all API calls
 * - Role-based helper functions
 * - Session state management
 * - FCM notification cleanup for admin users
 */

// Create context with default value
const AuthContext = createContext(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  // Use NextAuth session as single source of truth
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Local state for UI loading and auth processing
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null); // For super admin company switching

  // Derive user from session with enhanced properties
  const user = useMemo(() => {
    if (!session?.user) return null;
    
    return {
      ...session.user,
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.fullName || session.user.email?.split('@')[0],
      role: session.user.role || 'user',
      adminType: session.user.adminType || null, // 'super' or 'company' for admin roles
      companyId: session.user.companyId || null, // CRITICAL for multi-tenancy
      companyName: session.user.companyName || null,
      isVerified: session.user.isVerified || false,
      phone: session.user.phone || '',
      status: session.user.status || 'active',
      
      // Role helpers
      isAdmin: session.user.role === 'admin',
      isSuperAdmin: session.user.role === 'admin' && session.user.adminType === 'super',
      isCompanyAdmin: session.user.role === 'admin' && session.user.adminType === 'company',
      isManager: session.user.role === 'manager',
      isUser: session.user.role === 'user',
      
      preferences: session.user.preferences || {},
      notificationSettings: session.user.notificationSettings || {},
      isAuthenticated: true,
      isActive: session.user.status === 'active',
      
      // Company info
      hasCompany: !!session.user.companyId,
    };
  }, [session]);

  const isAuthenticated = !!user;

  // Initialize auth state when session changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (sessionStatus === 'loading') {
          setLoading(true);
          return;
        }

        console.log('🔐 [AuthContext] Session status:', {
          authenticated: !!session?.user,
          email: session?.user?.email,
          role: session?.user?.role,
          adminType: session?.user?.adminType,
          companyId: session?.user?.companyId,
          isVerified: session?.user?.isVerified,
          status: session?.user?.status,
          sessionStatus
        });

        if (session?.user) {
          console.log('✅ [AuthContext] User authenticated:', {
            email: session.user.email,
            role: session.user.role,
            adminType: session.user.adminType,
            companyId: session.user.companyId,
            isVerified: session.user.isVerified,
            status: session.user.status
          });
          
          // Store minimal user info for non-auth features
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('user_info', JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                role: session.user.role,
                adminType: session.user.adminType,
                companyId: session.user.companyId,
                companyName: session.user.companyName,
                name: session.user.name,
                isSuperAdmin: session.user.role === 'admin' && session.user.adminType === 'super',
                isCompanyAdmin: session.user.role === 'admin' && session.user.adminType === 'company',
                isVerified: session.user.isVerified,
                status: session.user.status,
                isActive: session.user.status === 'active',
              }));
            } catch (e) {
              console.warn('⚠️ [AuthContext] Could not store user info in localStorage:', e);
            }
          }

          // For super admin, check if they have a current company context
          if (user?.isSuperAdmin && typeof window !== 'undefined') {
            try {
              const savedCompany = localStorage.getItem('current_company');
              if (savedCompany) {
                setCurrentCompany(JSON.parse(savedCompany));
              }
            } catch (e) {
              console.warn('⚠️ [AuthContext] Could not restore company context:', e);
            }
          }
        } else {
          // Clear any cached user info on logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_info');
            localStorage.removeItem('current_company');
          }
          
          console.log('ℹ️ [AuthContext] No active session');
        }

        setAuthChecked(true);
      } catch (error) {
        console.error('❌ [AuthContext] Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [session, sessionStatus, user]);

  // Enhanced login function using NextAuth
  const login = useCallback(async (email, password, options = {}) => {
    try {
      const { rememberMe = false, callbackUrl = '/' } = options;
      
      console.log('🔐 [AuthContext] Attempting login for:', email);
      
      const result = await nextAuthSignIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      console.log('📋 [AuthContext] SignIn result:', result);

      if (result?.error) {
        console.error('❌ [AuthContext] Login failed:', result.error);
        
        let errorMessage = 'Authentication failed. Please try again.';
        let errorType = 'error';
        
        if (result.error === 'PENDING_VERIFICATION') {
          errorMessage = 'Please verify your email address before logging in';
          errorType = 'warning';
        } else if (result.error === 'ACCOUNT_INACTIVE') {
          errorMessage = 'Your account is inactive. Please contact support to reactivate your account';
        } else if (result.error === 'ACCOUNT_SUSPENDED') {
          errorMessage = 'Your account has been suspended. Please contact support for assistance';
        } else if (result.error === 'ACCOUNT_DELETED') {
          errorMessage = 'This account has been deleted. Please create a new account';
        } else if (result.error === 'COMPANY_INACTIVE') {
          errorMessage = 'Your company account is inactive. Please contact support';
        } else if (result.error === 'COMPANY_SUSPENDED') {
          errorMessage = 'Your company has been suspended. Please contact support';
        } else if (result.error.includes('Invalid email or password') || result.error.includes('Invalid password')) {
          errorMessage = 'Invalid email or password';
        } else if (result.error.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (result.error === 'No account found with this email') {
          errorMessage = 'No account found with this email. Please sign up';
        } else if (result.error === 'CredentialsSignin') {
          errorMessage = 'Invalid email or password';
        }
        
        return {
          success: false,
          error: errorMessage,
          errorType,
          code: result.error,
        };
      }

      console.log('✅ [AuthContext] Login successful');
      
      await updateSession();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: 'Login successful!',
        user: session?.user,
      };
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        errorType: 'error',
      };
    }
  }, [session, updateSession]);

  // Enhanced logout function with FCM cleanup and proper flow
  const logout = useCallback(async (options = {}) => {
    try {
      const { 
        redirectTo = '/login',
        clearFCM = true,
        notifyOtherTabs = true,
        callbackUrl = null
      } = options;
      
      console.log('🚪 [AuthContext] Logging out user:', user?.email);
      
      // Step 1: Get FCM token before clearing anything
      let fcmToken = null;
      if (clearFCM && user?.isAdmin) {
        try {
          console.log('🔧 [AuthContext] Getting FCM token for cleanup');
          
          const fcmModule = await import('../lib/firebase/fcm-token-service');
          fcmToken = await fcmModule.getCurrentFCMToken();
          
          if (fcmToken) {
            console.log('🔧 [AuthContext] Found FCM token:', fcmToken.substring(0, 20) + '...');
          }
        } catch (fcmError) {
          console.warn('⚠️ [AuthContext] FCM token fetch error:', fcmError);
        }
      }
      
      // Step 2: Call custom logout API for server-side cleanup
      try {
        console.log('📡 [AuthContext] Calling server logout API');
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-company-id': user?.companyId || '', // Pass company context
          },
          body: JSON.stringify({ 
            fcmToken,
            companyId: user?.companyId 
          }),
        }).then(res => {
          if (res.ok) {
            console.log('✅ [AuthContext] Server logout successful');
          } else {
            console.warn('⚠️ [AuthContext] Server logout returned non-OK status:', res.status);
          }
        }).catch(err => {
          console.warn('⚠️ [AuthContext] Server logout API call failed:', err.message);
        });
      } catch (apiError) {
        console.warn('⚠️ [AuthContext] Logout API error:', apiError);
      }
      
      // Step 3: Clear client-side storage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('user_info');
          localStorage.removeItem('current_company');
          sessionStorage.removeItem('user');
          
          localStorage.removeItem('nextauth.message');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token_expiry');
          
          localStorage.removeItem('fcm_token');
          localStorage.removeItem('fcm_token_sent_to_server');
          
          if (notifyOtherTabs) {
            localStorage.setItem('logout_event', Date.now().toString());
            setTimeout(() => localStorage.removeItem('logout_event'), 1000);
          }
          
          window.dispatchEvent(new Event('user-logged-out'));
          window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { user: null, isAuthenticated: false }
          }));
          
        } catch (storageError) {
          console.warn('⚠️ [AuthContext] Storage cleanup error:', storageError);
        }
      }
      
      // Step 4: Sign out via NextAuth
      console.log('🔐 [AuthContext] Signing out via NextAuth');
      const signOutResult = await nextAuthSignOut({ 
        redirect: false,
        callbackUrl: redirectTo,
      });
      
      // Step 5: Update session state
      await updateSession();
      
      console.log('✅ [AuthContext] User logged out successfully');
      
      // Step 6: Determine final redirect URL
      let finalRedirectUrl = redirectTo;
      if (callbackUrl) {
        finalRedirectUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      }
      
      // Step 7: Redirect
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          router.push(finalRedirectUrl);
          router.refresh();
        }, 100);
      }
      
      return {
        success: true,
        message: 'Logged out successfully',
        redirectTo: finalRedirectUrl,
        ...signOutResult
      };
    } catch (error) {
      console.error('❌ [AuthContext] Logout error:', error);
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = options.redirectTo || '/login';
      }
      
      return {
        success: false,
        error: 'Logout failed. Please try again.',
      };
    }
  }, [user, updateSession, router]);

  // Update user data (for profile updates)
  const updateUser = useCallback(async (updatedData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      console.log('🔄 [AuthContext] Updating user data');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': user.companyId || '', // Pass company context
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }
      
      await updateSession({
        ...session,
        user: {
          ...session.user,
          ...updatedData,
        },
      });
      
      console.log('✅ [AuthContext] User data updated');
      
      return {
        success: true,
        message: 'Profile updated successfully',
        data,
      };
    } catch (error) {
      console.error('❌ [AuthContext] Update user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }, [user, session, updateSession]);

  // Switch company (for super admin only)
  const switchCompany = useCallback(async (companyId, companyName) => {
    try {
      if (!user?.isSuperAdmin) {
        throw new Error('Only super admin can switch companies');
      }

      console.log('🔄 [AuthContext] Switching to company:', companyId);

      const response = await fetch('/api/auth/switch-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to switch company');
      }

      // Update session with new company context
      await updateSession({
        ...session,
        user: {
          ...session.user,
          companyId,
          companyName,
        },
      });

      // Store current company for super admin
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_company', JSON.stringify({
          id: companyId,
          name: companyName,
        }));
      }

      setCurrentCompany({ id: companyId, name: companyName });

      console.log('✅ [AuthContext] Switched to company:', companyId);

      return {
        success: true,
        message: `Switched to ${companyName}`,
      };
    } catch (error) {
      console.error('❌ [AuthContext] Switch company error:', error);
      return {
        success: false,
        error: error.message || 'Failed to switch company',
      };
    }
  }, [user, session, updateSession]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    if (!user?.role || !Array.isArray(roles)) return false;
    return roles.includes(user.role);
  }, [user]);

  // Check if user is active based on status
  const isActive = useMemo(() => {
    return user?.status === 'active';
  }, [user]);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return user?.role === 'admin';
  }, [user]);

  // Check if user is super admin
  const isSuperAdmin = useMemo(() => {
    return user?.role === 'admin' && user?.adminType === 'super';
  }, [user]);

  // Check if user is company admin
  const isCompanyAdmin = useMemo(() => {
    return user?.role === 'admin' && user?.adminType === 'company';
  }, [user]);

  // Check if user is manager or admin
  const isManagerOrAdmin = useMemo(() => {
    return ['admin', 'manager'].includes(user?.role);
  }, [user]);

  // Get company ID for API calls
  const getCompanyId = useCallback(() => {
    if (isSuperAdmin && currentCompany) {
      return currentCompany.id; // Super admin switched context
    }
    return user?.companyId; // Regular user's company
  }, [isSuperAdmin, currentCompany, user]);

  // Get headers for API calls (includes company context)
  const getAuthHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json',
    };

    const companyId = getCompanyId();
    if (companyId) {
      headers['x-company-id'] = companyId;
    }

    return headers;
  }, [getCompanyId]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 [AuthContext] Refreshing session');
      await updateSession();
      return {
        success: true,
        message: 'Session refreshed',
      };
    } catch (error) {
      console.error('❌ [AuthContext] Refresh session error:', error);
      return {
        success: false,
        error: 'Failed to refresh session',
      };
    }
  }, [updateSession]);

  // Get user permissions
  const getPermissions = useCallback(() => {
    if (!user) return [];
    
    const permissionMap = {
      super_admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products', 'manage_companies', 'switch_company'],
      company_admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products'],
      manager: ['read', 'write', 'manage_orders', 'view_reports', 'manage_inventory'],
      user: ['read', 'write_own', 'view_profile'],
    };
    
    if (user.isSuperAdmin) {
      return permissionMap.super_admin;
    }
    
    return permissionMap[user.role] || ['read'];
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    const permissions = getPermissions();
    return permissions.includes(permission);
  }, [getPermissions]);

  // Handle route protection with proper status checks
  useEffect(() => {
    if (loading || !authChecked) return;

    const handleRouteProtection = () => {
      const publicPaths = [
        '/',
        '/login',
        '/signup',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/auth/error',
        '/auth/verify-request',
        '/auth/new-user',
        '/account-inactive',
        '/account-suspended',
        '/account-pending',
        '/company-inactive', // New for company status
      ];

      const isPublicPath = publicPaths.some(path => 
        pathname === path || pathname?.startsWith(`${path}/`)
      );

      if (!isAuthenticated && !isPublicPath) {
        console.log('🔄 [AuthContext] Redirecting unauthenticated user to login from:', pathname);
        const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
        return;
      }

      if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
        console.log('🔄 [AuthContext] Redirecting authenticated user from auth page:', pathname);
        const redirectPath = user.isSuperAdmin 
          ? '/super-admin/dashboard' 
          : user.isCompanyAdmin 
            ? '/admin/dashboards' 
            : user.role === 'manager' 
              ? '/manager/dashboard' 
              : '/dashboard';
        router.push(redirectPath);
        return;
      }

      if (isAuthenticated) {
        // Check user status first
        if (user.status === 'pending') {
          console.log('🔄 [AuthContext] Redirecting pending verification user:', pathname);
          if (!pathname?.includes('/verify-email')) {
            router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
            return;
          }
        } else if (user.status === 'inactive') {
          console.log('⛔ [AuthContext] Inactive account attempted access:', pathname);
          if (!pathname?.includes('/account-inactive')) {
            router.push('/account-inactive');
            return;
          }
        } else if (user.status === 'suspended') {
          console.log('⛔ [AuthContext] Suspended account attempted access:', pathname);
          if (!pathname?.includes('/account-suspended')) {
            router.push('/account-suspended');
            return;
          }
        } else if (user.status === 'deleted') {
          console.log('⛔ [AuthContext] Deleted account attempted access:', pathname);
          logout({ notifyOtherTabs: true });
          router.push('/login?error=account_deleted');
          return;
        }

        // Company status check (for non-super-admin)
        if (!user.isSuperAdmin && user.companyId) {
          // This would require company status in session
          // You'd need to add companyStatus to session
        }

        if (user.status === 'active') {
          // Role-based route access
          if (pathname?.startsWith('/super-admin') && !user.isSuperAdmin) {
            console.log('⛔ [AuthContext] Non-super-admin user attempting to access super admin route:', pathname);
            router.push('/admin/dashboards');
            return;
          }

          if (pathname?.startsWith('/admin') && !user.isAdmin) {
            console.log('⛔ [AuthContext] Non-admin user attempting to access admin route:', pathname);
            router.push('/dashboard');
            return;
          }

          if (pathname?.startsWith('/manager') && !isManagerOrAdmin) {
            console.log('⛔ [AuthContext] Unauthorized user attempting to access manager route:', pathname);
            router.push('/dashboard');
            return;
          }
        }
      }
    };

    handleRouteProtection();
  }, [isAuthenticated, user, pathname, router, authChecked, loading, isManagerOrAdmin, logout]);

  // Listen for logout events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event) => {
      if (event.key === 'logout_event') {
        console.log('🔄 [AuthContext] Logout triggered from another tab');
        logout({ notifyOtherTabs: false });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]);

  // Listen for auth state changes from other components
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuthStateChange = (event) => {
      if (event.detail && event.detail.type === 'force-logout') {
        console.log('🔄 [AuthContext] Force logout triggered by component');
        logout();
      }
    };

    window.addEventListener('auth-state-change', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('auth-state-change', handleAuthStateChange);
    };
  }, [logout]);

  // Monitor session activity
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin || user.status !== 'active') return;

    let activityTimer;
    
    const handleUserActivity = () => {
      if (activityTimer) clearTimeout(activityTimer);
      
      activityTimer = setTimeout(async () => {
        try {
          await fetch('/api/user/activity', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId: user.id }),
          }).catch(err => console.debug('Activity update failed:', err));
        } catch (error) {
        }
      }, 60000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (activityTimer) clearTimeout(activityTimer);
    };
  }, [isAuthenticated, user, getAuthHeaders]);

  // Context value
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading: loading || sessionStatus === 'loading',
    authChecked,
    login,
    logout,
    updateUser,
    switchCompany,
    refreshSession,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isCompanyAdmin,
    isManagerOrAdmin,
    hasPermission,
    getPermissions,
    getCompanyId,
    getAuthHeaders,
    isActive,
    currentCompany,
    accountStatus: user?.status || 'unknown',
    session,
    sessionStatus,
    checkAuth: () => updateSession(),
    signIn: login,
    signOut: logout,
    requireAuth: (requiredRole = null) => {
      if (!isAuthenticated) return { authorized: false, error: 'Not authenticated' };
      if (user.status !== 'active') return { 
        authorized: false, 
        error: `Account is ${user.status}`,
        status: user.status 
      };
      if (!user.isVerified) return { authorized: false, error: 'Email not verified' };
      
      // Check company status would go here
      
      if (requiredRole) {
        if (requiredRole === 'super_admin' && !user.isSuperAdmin) {
          return { authorized: false, error: 'Super admin access required' };
        }
        if (requiredRole === 'company_admin' && !user.isCompanyAdmin) {
          return { authorized: false, error: 'Company admin access required' };
        }
        if (requiredRole === 'admin' && !user.isAdmin) {
          return { authorized: false, error: 'Admin access required' };
        }
        if (requiredRole === 'manager' && !isManagerOrAdmin) {
          return { authorized: false, error: 'Manager access required' };
        }
      }
      
      return { authorized: true, user };
    },
    canAccessRoute: (route) => {
      if (!isAuthenticated) return false;
      if (user.status !== 'active') return false;
      
      if (route.startsWith('/super-admin') && !user.isSuperAdmin) return false;
      if (route.startsWith('/admin') && !user.isAdmin) return false;
      if (route.startsWith('/manager') && !isManagerOrAdmin) return false;
      
      return true;
    }
  }), [
    user,
    isAuthenticated,
    loading,
    authChecked,
    sessionStatus,
    currentCompany,
    login,
    logout,
    updateUser,
    switchCompany,
    refreshSession,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isCompanyAdmin,
    isManagerOrAdmin,
    hasPermission,
    getPermissions,
    getCompanyId,
    getAuthHeaders,
    isActive,
    session,
    updateSession
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Higher Order Component for protecting pages
export function withAuth(Component, options = {}) {
  const { 
    requiredRole = null, 
    redirectTo = '/login',
    requireVerified = true,
    requireActive = true,
    requireCompany = true // New option for SaaS
  } = options;
  
  return function WithAuthWrapper(props) {
    const { user, loading, isAuthenticated, isSuperAdmin, isCompanyAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (loading) return;

      if (!isAuthenticated) {
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      if (requireActive && user && user.status !== 'active') {
        if (user.status === 'pending') {
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
        } else if (user.status === 'inactive') {
          router.push('/account-inactive');
        } else if (user.status === 'suspended') {
          router.push('/account-suspended');
        } else if (user.status === 'deleted') {
          router.push('/login?error=account_deleted');
        }
        return;
      }

      if (requireVerified && user && !user.isVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      // Company check for non-super-admin users
      if (requireCompany && !isSuperAdmin && !user?.companyId) {
        console.error('User has no company association');
        router.push('/login?error=no_company');
        return;
      }

      // Role-based access control
      if (requiredRole) {
        if (requiredRole === 'super_admin' && !isSuperAdmin) {
          console.warn('Super admin access required');
          router.push('/admin/dashboards');
          return;
        }
        if (requiredRole === 'company_admin' && !isCompanyAdmin) {
          console.warn('Company admin access required');
          router.push('/dashboard');
          return;
        }
        if (requiredRole === 'admin' && !user?.isAdmin) {
          console.warn('Admin access required');
          router.push('/dashboard');
          return;
        }
        if (requiredRole === 'manager' && !['admin', 'manager'].includes(user?.role)) {
          console.warn('Manager access required');
          router.push('/dashboard');
          return;
        }
      }
    }, [loading, isAuthenticated, user, requiredRole, router, pathname, requireVerified, requireActive, requireCompany, isSuperAdmin, isCompanyAdmin]);

    if (loading || !isAuthenticated) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{
              color: '#333',
              fontSize: '16px',
              margin: 0,
            }}>
              {loading ? 'Loading...' : 'Checking authentication...'}
            </p>
            {!loading && !isAuthenticated && (
              <p style={{
                color: '#666',
                fontSize: '14px',
                marginTop: '10px',
              }}>
                Redirecting to login...
              </p>
            )}
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for protected API calls with automatic token refresh and company context
export function useProtectedFetch() {
  const { user, refreshSession, logout, getAuthHeaders } = useAuth();
  
  const protectedFetch = useCallback(async (url, options = {}) => {
    try {
      // Merge headers with company context
      const headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        console.log('🔄 [useProtectedFetch] Session expired, attempting refresh');
        const refreshResult = await refreshSession();
        
        if (!refreshResult.success) {
          await logout();
          throw new Error('Session expired. Please log in again.');
        }
        
        // Retry with new session
        return await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
      }

      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'You do not have permission to perform this action.');
      }

      return response;
    } catch (error) {
      console.error('❌ [useProtectedFetch] Request failed:', error);
      throw error;
    }
  }, [refreshSession, logout, getAuthHeaders]);

  return protectedFetch;
}

// Hook to check if user can access a specific route
export function useRouteAccess() {
  const { user, isAuthenticated, isSuperAdmin, isAdmin, isManagerOrAdmin } = useAuth();
  const router = useRouter();
  
  const canAccessRoute = useCallback((route) => {
    if (!isAuthenticated || !user) return false;
    if (user.status !== 'active') return false;
    
    if (route.startsWith('/super-admin')) {
      return isSuperAdmin;
    }
    
    if (route.startsWith('/admin')) {
      return isAdmin;
    }
    
    if (route.startsWith('/manager')) {
      return isManagerOrAdmin;
    }
    
    return true;
  }, [isAuthenticated, user, isSuperAdmin, isAdmin, isManagerOrAdmin]);
  
  const navigateIfAuthorized = useCallback((route) => {
    if (canAccessRoute(route)) {
      router.push(route);
      return true;
    }
    return false;
  }, [canAccessRoute, router]);
  
  return {
    canAccessRoute,
    navigateIfAuthorized,
  };
}

// Export context for direct usage if needed
export { AuthContext };














































// 'use client';

// import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { useSession, signOut as nextAuthSignOut, signIn as nextAuthSignIn } from 'next-auth/react';

// /**
//  * Professional Auth Context for Next.js Application
//  * 
//  * This context provides authentication state and methods
//  * using NextAuth as the single source of truth.
//  * 
//  * Features:
//  * - Multi-tenant SaaS support with company isolation
//  * - Super admin vs company admin distinction
//  * - Company context in all API calls
//  * - Role-based helper functions
//  * - Session state management
//  * - FCM notification cleanup for admin users
//  * - Service type support for module access control (ecommerce/booking)
//  */

// // Create context with default value
// const AuthContext = createContext(undefined);

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export function AuthProvider({ children }) {
//   // Use NextAuth session as single source of truth
//   const { data: session, status: sessionStatus, update: updateSession } = useSession();
//   const router = useRouter();
//   const pathname = usePathname();
  
//   // Local state for UI loading and auth processing
//   const [loading, setLoading] = useState(true);
//   const [authChecked, setAuthChecked] = useState(false);
//   const [currentCompany, setCurrentCompany] = useState(null); // For super admin company switching

//   // Derive user from session with enhanced properties
//   const user = useMemo(() => {
//     if (!session?.user) return null;
    
//     // ✅ NEW: Compute service type helpers
//     const companyServiceType = session.user.companyServiceType || null;
//     const isEcommerceEnabled = companyServiceType === 'ecommerce' || companyServiceType === 'both';
//     const isBookingEnabled = companyServiceType === 'booking' || companyServiceType === 'both';
    
//     return {
//       ...session.user,
//       id: session.user.id,
//       email: session.user.email,
//       name: session.user.name || session.user.fullName || session.user.email?.split('@')[0],
//       role: session.user.role || 'user',
//       adminType: session.user.adminType || null, // 'super' or 'company' for admin roles
//       companyId: session.user.companyId || null, // CRITICAL for multi-tenancy
//       companyName: session.user.companyName || null,
//       // ✅ NEW: Service type fields
//       companyServiceType: companyServiceType,
//       companyFeatures: session.user.companyFeatures || {},
//       companySlug: session.user.companySlug || null,
//       companyCatalogWhatsapp: session.user.companyCatalogWhatsapp || null,
//       isWhatsAppConnected: session.user.isWhatsAppConnected || false,
//       isVerified: session.user.isVerified || false,
//       phone: session.user.phone || '',
//       status: session.user.status || 'active',
      
//       // Role helpers
//       isAdmin: session.user.role === 'admin',
//       isSuperAdmin: session.user.role === 'admin' && session.user.adminType === 'super',
//       isCompanyAdmin: session.user.role === 'admin' && session.user.adminType === 'company',
//       isManager: session.user.role === 'manager',
//       isUser: session.user.role === 'user',
      
//       // ✅ NEW: Module access helpers (critical for sidebar filtering)
//       isEcommerceEnabled: isEcommerceEnabled,
//       isBookingEnabled: isBookingEnabled,
//       canAccessModule: (moduleName) => {
//         if (moduleName === 'ecommerce') return isEcommerceEnabled;
//         if (moduleName === 'booking') return isBookingEnabled;
//         return true; // Common modules like config, profile, dashboard
//       },
//       getEnabledModules: () => {
//         const modules = [];
//         if (isEcommerceEnabled) modules.push('ecommerce');
//         if (isBookingEnabled) modules.push('booking');
//         return modules;
//       },
//       getModuleAccessInfo: () => {
//         return {
//           type: companyServiceType,
//           isEcommerce: isEcommerceEnabled,
//           isBooking: isBookingEnabled,
//           enabledModules: isEcommerceEnabled && isBookingEnabled ? ['ecommerce', 'booking'] : 
//                           isEcommerceEnabled ? ['ecommerce'] : 
//                           isBookingEnabled ? ['booking'] : [],
//           features: session.user.companyFeatures || {}
//         };
//       },
      
//       preferences: session.user.preferences || {},
//       notificationSettings: session.user.notificationSettings || {},
//       isAuthenticated: true,
//       isActive: session.user.status === 'active',
      
//       // Company info
//       hasCompany: !!session.user.companyId,
//     };
//   }, [session]);

//   const isAuthenticated = !!user;

//   // Initialize auth state when session changes
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         if (sessionStatus === 'loading') {
//           setLoading(true);
//           return;
//         }

//         console.log('🔐 [AuthContext] Session status:', {
//           authenticated: !!session?.user,
//           email: session?.user?.email,
//           role: session?.user?.role,
//           adminType: session?.user?.adminType,
//           companyId: session?.user?.companyId,
//           serviceType: session?.user?.companyServiceType, // ✅ NEW
//           isVerified: session?.user?.isVerified,
//           status: session?.user?.status,
//           sessionStatus
//         });

//         if (session?.user) {
//           console.log('✅ [AuthContext] User authenticated:', {
//             email: session.user.email,
//             role: session.user.role,
//             adminType: session.user.adminType,
//             companyId: session.user.companyId,
//             serviceType: session.user.companyServiceType, // ✅ NEW
//             isVerified: session.user.isVerified,
//             status: session.user.status
//           });
          
//           // Store minimal user info for non-auth features
//           if (typeof window !== 'undefined') {
//             try {
//               localStorage.setItem('user_info', JSON.stringify({
//                 id: session.user.id,
//                 email: session.user.email,
//                 role: session.user.role,
//                 adminType: session.user.adminType,
//                 companyId: session.user.companyId,
//                 companyName: session.user.companyName,
//                 companyServiceType: session.user.companyServiceType, // ✅ NEW
//                 name: session.user.name,
//                 isSuperAdmin: session.user.role === 'admin' && session.user.adminType === 'super',
//                 isCompanyAdmin: session.user.role === 'admin' && session.user.adminType === 'company',
//                 isVerified: session.user.isVerified,
//                 status: session.user.status,
//                 isActive: session.user.status === 'active',
//               }));
//             } catch (e) {
//               console.warn('⚠️ [AuthContext] Could not store user info in localStorage:', e);
//             }
//           }

//           // For super admin, check if they have a current company context
//           if (user?.isSuperAdmin && typeof window !== 'undefined') {
//             try {
//               const savedCompany = localStorage.getItem('current_company');
//               if (savedCompany) {
//                 setCurrentCompany(JSON.parse(savedCompany));
//               }
//             } catch (e) {
//               console.warn('⚠️ [AuthContext] Could not restore company context:', e);
//             }
//           }
//         } else {
//           // Clear any cached user info on logout
//           if (typeof window !== 'undefined') {
//             localStorage.removeItem('user_info');
//             localStorage.removeItem('current_company');
//           }
          
//           console.log('ℹ️ [AuthContext] No active session');
//         }

//         setAuthChecked(true);
//       } catch (error) {
//         console.error('❌ [AuthContext] Initialization error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, [session, sessionStatus, user]);

//   // Enhanced login function using NextAuth
//   const login = useCallback(async (email, password, options = {}) => {
//     try {
//       const { rememberMe = false, callbackUrl = '/' } = options;
      
//       console.log('🔐 [AuthContext] Attempting login for:', email);
      
//       const result = await nextAuthSignIn('credentials', {
//         email: email.trim().toLowerCase(),
//         password,
//         redirect: false,
//         callbackUrl: callbackUrl,
//       });

//       console.log('📋 [AuthContext] SignIn result:', result);

//       if (result?.error) {
//         console.error('❌ [AuthContext] Login failed:', result.error);
        
//         let errorMessage = 'Authentication failed. Please try again.';
//         let errorType = 'error';
        
//         if (result.error === 'PENDING_VERIFICATION') {
//           errorMessage = 'Please verify your email address before logging in';
//           errorType = 'warning';
//         } else if (result.error === 'ACCOUNT_INACTIVE') {
//           errorMessage = 'Your account is inactive. Please contact support to reactivate your account';
//         } else if (result.error === 'ACCOUNT_SUSPENDED') {
//           errorMessage = 'Your account has been suspended. Please contact support for assistance';
//         } else if (result.error === 'ACCOUNT_DELETED') {
//           errorMessage = 'This account has been deleted. Please create a new account';
//         } else if (result.error === 'COMPANY_INACTIVE') {
//           errorMessage = 'Your company account is inactive. Please contact support';
//         } else if (result.error === 'COMPANY_SUSPENDED') {
//           errorMessage = 'Your company has been suspended. Please contact support';
//         } else if (result.error.includes('Invalid email or password') || result.error.includes('Invalid password')) {
//           errorMessage = 'Invalid email or password';
//         } else if (result.error.includes('Too many requests')) {
//           errorMessage = 'Too many login attempts. Please try again later.';
//         } else if (result.error === 'No account found with this email') {
//           errorMessage = 'No account found with this email. Please sign up';
//         } else if (result.error === 'CredentialsSignin') {
//           errorMessage = 'Invalid email or password';
//         }
        
//         return {
//           success: false,
//           error: errorMessage,
//           errorType,
//           code: result.error,
//         };
//       }

//       console.log('✅ [AuthContext] Login successful');
      
//       await updateSession();
      
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       return {
//         success: true,
//         message: 'Login successful!',
//         user: session?.user,
//       };
//     } catch (error) {
//       console.error('❌ [AuthContext] Login error:', error);
//       return {
//         success: false,
//         error: 'An unexpected error occurred. Please try again.',
//         errorType: 'error',
//       };
//     }
//   }, [session, updateSession]);

//   // Enhanced logout function with FCM cleanup and proper flow
//   const logout = useCallback(async (options = {}) => {
//     try {
//       const { 
//         redirectTo = '/login',
//         clearFCM = true,
//         notifyOtherTabs = true,
//         callbackUrl = null
//       } = options;
      
//       console.log('🚪 [AuthContext] Logging out user:', user?.email);
      
//       // Step 1: Get FCM token before clearing anything
//       let fcmToken = null;
//       if (clearFCM && user?.isAdmin) {
//         try {
//           console.log('🔧 [AuthContext] Getting FCM token for cleanup');
          
//           const fcmModule = await import('../lib/firebase/fcm-token-service');
//           fcmToken = await fcmModule.getCurrentFCMToken();
          
//           if (fcmToken) {
//             console.log('🔧 [AuthContext] Found FCM token:', fcmToken.substring(0, 20) + '...');
//           }
//         } catch (fcmError) {
//           console.warn('⚠️ [AuthContext] FCM token fetch error:', fcmError);
//         }
//       }
      
//       // Step 2: Call custom logout API for server-side cleanup
//       try {
//         console.log('📡 [AuthContext] Calling server logout API');
//         await fetch('/api/auth/logout', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'x-company-id': user?.companyId || '', // Pass company context
//           },
//           body: JSON.stringify({ 
//             fcmToken,
//             companyId: user?.companyId 
//           }),
//         }).then(res => {
//           if (res.ok) {
//             console.log('✅ [AuthContext] Server logout successful');
//           } else {
//             console.warn('⚠️ [AuthContext] Server logout returned non-OK status:', res.status);
//           }
//         }).catch(err => {
//           console.warn('⚠️ [AuthContext] Server logout API call failed:', err.message);
//         });
//       } catch (apiError) {
//         console.warn('⚠️ [AuthContext] Logout API error:', apiError);
//       }
      
//       // Step 3: Clear client-side storage
//       if (typeof window !== 'undefined') {
//         try {
//           localStorage.removeItem('user_info');
//           localStorage.removeItem('current_company');
//           sessionStorage.removeItem('user');
          
//           localStorage.removeItem('nextauth.message');
//           localStorage.removeItem('auth_token');
//           localStorage.removeItem('token_expiry');
          
//           localStorage.removeItem('fcm_token');
//           localStorage.removeItem('fcm_token_sent_to_server');
          
//           if (notifyOtherTabs) {
//             localStorage.setItem('logout_event', Date.now().toString());
//             setTimeout(() => localStorage.removeItem('logout_event'), 1000);
//           }
          
//           window.dispatchEvent(new Event('user-logged-out'));
//           window.dispatchEvent(new CustomEvent('auth-state-changed', {
//             detail: { user: null, isAuthenticated: false }
//           }));
          
//         } catch (storageError) {
//           console.warn('⚠️ [AuthContext] Storage cleanup error:', storageError);
//         }
//       }
      
//       // Step 4: Sign out via NextAuth
//       console.log('🔐 [AuthContext] Signing out via NextAuth');
//       const signOutResult = await nextAuthSignOut({ 
//         redirect: false,
//         callbackUrl: redirectTo,
//       });
      
//       // Step 5: Update session state
//       await updateSession();
      
//       console.log('✅ [AuthContext] User logged out successfully');
      
//       // Step 6: Determine final redirect URL
//       let finalRedirectUrl = redirectTo;
//       if (callbackUrl) {
//         finalRedirectUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
//       }
      
//       // Step 7: Redirect
//       if (typeof window !== 'undefined') {
//         setTimeout(() => {
//           router.push(finalRedirectUrl);
//           router.refresh();
//         }, 100);
//       }
      
//       return {
//         success: true,
//         message: 'Logged out successfully',
//         redirectTo: finalRedirectUrl,
//         ...signOutResult
//       };
//     } catch (error) {
//       console.error('❌ [AuthContext] Logout error:', error);
      
//       if (typeof window !== 'undefined') {
//         localStorage.clear();
//         sessionStorage.clear();
//         window.location.href = options.redirectTo || '/login';
//       }
      
//       return {
//         success: false,
//         error: 'Logout failed. Please try again.',
//       };
//     }
//   }, [user, updateSession, router]);

//   // Update user data (for profile updates)
//   const updateUser = useCallback(async (updatedData) => {
//     try {
//       if (!user) {
//         throw new Error('No user logged in');
//       }
      
//       console.log('🔄 [AuthContext] Updating user data');
      
//       const response = await fetch('/api/user/profile', {
//         method: 'PUT',
//         headers: { 
//           'Content-Type': 'application/json',
//           'x-company-id': user.companyId || '', // Pass company context
//         },
//         body: JSON.stringify(updatedData),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Update failed');
//       }
      
//       await updateSession({
//         ...session,
//         user: {
//           ...session.user,
//           ...updatedData,
//         },
//       });
      
//       console.log('✅ [AuthContext] User data updated');
      
//       return {
//         success: true,
//         message: 'Profile updated successfully',
//         data,
//       };
//     } catch (error) {
//       console.error('❌ [AuthContext] Update user error:', error);
//       return {
//         success: false,
//         error: error.message || 'Failed to update profile',
//       };
//     }
//   }, [user, session, updateSession]);

//   // Switch company (for super admin only)
//   const switchCompany = useCallback(async (companyId, companyName) => {
//     try {
//       if (!user?.isSuperAdmin) {
//         throw new Error('Only super admin can switch companies');
//       }

//       console.log('🔄 [AuthContext] Switching to company:', companyId);

//       const response = await fetch('/api/auth/switch-company', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ companyId }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to switch company');
//       }

//       // Update session with new company context
//       await updateSession({
//         ...session,
//         user: {
//           ...session.user,
//           companyId,
//           companyName,
//         },
//       });

//       // Store current company for super admin
//       if (typeof window !== 'undefined') {
//         localStorage.setItem('current_company', JSON.stringify({
//           id: companyId,
//           name: companyName,
//         }));
//       }

//       setCurrentCompany({ id: companyId, name: companyName });

//       console.log('✅ [AuthContext] Switched to company:', companyId);

//       return {
//         success: true,
//         message: `Switched to ${companyName}`,
//       };
//     } catch (error) {
//       console.error('❌ [AuthContext] Switch company error:', error);
//       return {
//         success: false,
//         error: error.message || 'Failed to switch company',
//       };
//     }
//   }, [user, session, updateSession]);

//   // Check if user has specific role
//   const hasRole = useCallback((role) => {
//     return user?.role === role;
//   }, [user]);

//   // Check if user has any of the specified roles
//   const hasAnyRole = useCallback((roles) => {
//     if (!user?.role || !Array.isArray(roles)) return false;
//     return roles.includes(user.role);
//   }, [user]);

//   // Check if user is active based on status
//   const isActive = useMemo(() => {
//     return user?.status === 'active';
//   }, [user]);

//   // Check if user is admin
//   const isAdmin = useMemo(() => {
//     return user?.role === 'admin';
//   }, [user]);

//   // Check if user is super admin
//   const isSuperAdmin = useMemo(() => {
//     return user?.role === 'admin' && user?.adminType === 'super';
//   }, [user]);

//   // Check if user is company admin
//   const isCompanyAdmin = useMemo(() => {
//     return user?.role === 'admin' && user?.adminType === 'company';
//   }, [user]);

//   // Check if user is manager or admin
//   const isManagerOrAdmin = useMemo(() => {
//     return ['admin', 'manager'].includes(user?.role);
//   }, [user]);

//   // ✅ NEW: Filter menu items based on service type
//   const filterMenuItems = useCallback((menuItems) => {
//     if (!menuItems || !Array.isArray(menuItems)) return [];
//     if (isSuperAdmin) return menuItems; // Super admin sees everything
    
//     return menuItems.filter(item => {
//       if (!item.allowedFor) return true;
//       if (item.allowedFor === 'common') return true;
//       if (item.allowedFor === 'ecommerce') return user?.isEcommerceEnabled;
//       if (item.allowedFor === 'booking') return user?.isBookingEnabled;
//       if (Array.isArray(item.allowedFor)) {
//         return item.allowedFor.some(module => {
//           if (module === 'ecommerce') return user?.isEcommerceEnabled;
//           if (module === 'booking') return user?.isBookingEnabled;
//           return true;
//         });
//       }
//       return true;
//     });
//   }, [user, isSuperAdmin]);

//   // Get company ID for API calls
//   const getCompanyId = useCallback(() => {
//     if (isSuperAdmin && currentCompany) {
//       return currentCompany.id; // Super admin switched context
//     }
//     return user?.companyId; // Regular user's company
//   }, [isSuperAdmin, currentCompany, user]);

//   // Get headers for API calls (includes company context)
//   const getAuthHeaders = useCallback(() => {
//     const headers = {
//       'Content-Type': 'application/json',
//     };

//     const companyId = getCompanyId();
//     if (companyId) {
//       headers['x-company-id'] = companyId;
//     }

//     return headers;
//   }, [getCompanyId]);

//   // Refresh session
//   const refreshSession = useCallback(async () => {
//     try {
//       console.log('🔄 [AuthContext] Refreshing session');
//       await updateSession();
//       return {
//         success: true,
//         message: 'Session refreshed',
//       };
//     } catch (error) {
//       console.error('❌ [AuthContext] Refresh session error:', error);
//       return {
//         success: false,
//         error: 'Failed to refresh session',
//       };
//     }
//   }, [updateSession]);

//   // Get user permissions
//   const getPermissions = useCallback(() => {
//     if (!user) return [];
    
//     const permissionMap = {
//       super_admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products', 'manage_companies', 'switch_company'],
//       company_admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products'],
//       manager: ['read', 'write', 'manage_orders', 'view_reports', 'manage_inventory'],
//       user: ['read', 'write_own', 'view_profile'],
//     };
    
//     if (user.isSuperAdmin) {
//       return permissionMap.super_admin;
//     }
    
//     return permissionMap[user.role] || ['read'];
//   }, [user]);

//   // Check if user has specific permission
//   const hasPermission = useCallback((permission) => {
//     const permissions = getPermissions();
//     return permissions.includes(permission);
//   }, [getPermissions]);

//   // Handle route protection with proper status checks
//   useEffect(() => {
//     if (loading || !authChecked) return;

//     const handleRouteProtection = () => {
//       const publicPaths = [
//         '/',
//         '/login',
//         '/signup',
//         '/register',
//         '/forgot-password',
//         '/reset-password',
//         '/verify-email',
//         '/auth/error',
//         '/auth/verify-request',
//         '/auth/new-user',
//         '/account-inactive',
//         '/account-suspended',
//         '/account-pending',
//         '/company-inactive', // New for company status
//       ];

//       const isPublicPath = publicPaths.some(path => 
//         pathname === path || pathname?.startsWith(`${path}/`)
//       );

//       if (!isAuthenticated && !isPublicPath) {
//         console.log('🔄 [AuthContext] Redirecting unauthenticated user to login from:', pathname);
//         const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
//         router.push(loginUrl);
//         return;
//       }

//       if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
//         console.log('🔄 [AuthContext] Redirecting authenticated user from auth page:', pathname);
//         const redirectPath = user.isSuperAdmin 
//           ? '/super-admin/dashboard' 
//           : user.isCompanyAdmin 
//             ? '/admin/dashboards' 
//             : user.role === 'manager' 
//               ? '/manager/dashboard' 
//               : '/dashboard';
//         router.push(redirectPath);
//         return;
//       }

//       if (isAuthenticated) {
//         // Check user status first
//         if (user.status === 'pending') {
//           console.log('🔄 [AuthContext] Redirecting pending verification user:', pathname);
//           if (!pathname?.includes('/verify-email')) {
//             router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
//             return;
//           }
//         } else if (user.status === 'inactive') {
//           console.log('⛔ [AuthContext] Inactive account attempted access:', pathname);
//           if (!pathname?.includes('/account-inactive')) {
//             router.push('/account-inactive');
//             return;
//           }
//         } else if (user.status === 'suspended') {
//           console.log('⛔ [AuthContext] Suspended account attempted access:', pathname);
//           if (!pathname?.includes('/account-suspended')) {
//             router.push('/account-suspended');
//             return;
//           }
//         } else if (user.status === 'deleted') {
//           console.log('⛔ [AuthContext] Deleted account attempted access:', pathname);
//           logout({ notifyOtherTabs: true });
//           router.push('/login?error=account_deleted');
//           return;
//         }

//         // ✅ NEW: Module-based route protection for ecommerce/booking
//         if (user.status === 'active') {
//           // Protect ecommerce routes
//           if (pathname?.startsWith('/admin/products') || 
//               pathname?.startsWith('/admin/orders') || 
//               pathname?.startsWith('/admin/masters') ||
//               pathname === '/admin/transactions') {
//             if (!user.isEcommerceEnabled && !user.isSuperAdmin) {
//               console.log('⛔ [AuthContext] E-commerce route blocked for non-ecommerce company:', pathname);
//               router.push('/admin/dashboards');
//               return;
//             }
//           }
          
//           // Protect booking routes
//           if (pathname?.startsWith('/admin/bookingService')) {
//             if (!user.isBookingEnabled && !user.isSuperAdmin) {
//               console.log('⛔ [AuthContext] Booking route blocked for non-booking company:', pathname);
//               router.push('/admin/dashboards');
//               return;
//             }
//           }

//           // Role-based route access
//           if (pathname?.startsWith('/super-admin') && !user.isSuperAdmin) {
//             console.log('⛔ [AuthContext] Non-super-admin user attempting to access super admin route:', pathname);
//             router.push('/admin/dashboards');
//             return;
//           }

//           if (pathname?.startsWith('/admin') && !user.isAdmin) {
//             console.log('⛔ [AuthContext] Non-admin user attempting to access admin route:', pathname);
//             router.push('/dashboard');
//             return;
//           }

//           if (pathname?.startsWith('/manager') && !isManagerOrAdmin) {
//             console.log('⛔ [AuthContext] Unauthorized user attempting to access manager route:', pathname);
//             router.push('/dashboard');
//             return;
//           }
//         }
//       }
//     };

//     handleRouteProtection();
//   }, [isAuthenticated, user, pathname, router, authChecked, loading, isManagerOrAdmin, logout]);

//   // Listen for logout events from other tabs
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const handleStorageChange = (event) => {
//       if (event.key === 'logout_event') {
//         console.log('🔄 [AuthContext] Logout triggered from another tab');
//         logout({ notifyOtherTabs: false });
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
    
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, [logout]);

//   // Listen for auth state changes from other components
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const handleAuthStateChange = (event) => {
//       if (event.detail && event.detail.type === 'force-logout') {
//         console.log('🔄 [AuthContext] Force logout triggered by component');
//         logout();
//       }
//     };

//     window.addEventListener('auth-state-change', handleAuthStateChange);
    
//     return () => {
//       window.removeEventListener('auth-state-change', handleAuthStateChange);
//     };
//   }, [logout]);

//   // Monitor session activity
//   useEffect(() => {
//     if (!isAuthenticated || !user?.isAdmin || user.status !== 'active') return;

//     let activityTimer;
    
//     const handleUserActivity = () => {
//       if (activityTimer) clearTimeout(activityTimer);
      
//       activityTimer = setTimeout(async () => {
//         try {
//           await fetch('/api/user/activity', {
//             method: 'POST',
//             headers: getAuthHeaders(),
//             body: JSON.stringify({ userId: user.id }),
//           }).catch(err => console.debug('Activity update failed:', err));
//         } catch (error) {
//         }
//       }, 60000);
//     };

//     const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
//     events.forEach(event => {
//       window.addEventListener(event, handleUserActivity, { passive: true });
//     });

//     return () => {
//       events.forEach(event => {
//         window.removeEventListener(event, handleUserActivity);
//       });
//       if (activityTimer) clearTimeout(activityTimer);
//     };
//   }, [isAuthenticated, user, getAuthHeaders]);

//   // Context value
//   const contextValue = useMemo(() => ({
//     user,
//     isAuthenticated,
//     loading: loading || sessionStatus === 'loading',
//     authChecked,
//     login,
//     logout,
//     updateUser,
//     switchCompany,
//     refreshSession,
//     hasRole,
//     hasAnyRole,
//     isAdmin,
//     isSuperAdmin,
//     isCompanyAdmin,
//     isManagerOrAdmin,
//     hasPermission,
//     getPermissions,
//     getCompanyId,
//     getAuthHeaders,
//     isActive,
//     currentCompany,
//     accountStatus: user?.status || 'unknown',
//     session,
//     sessionStatus,
//     // ✅ NEW: Service type helpers (critical for sidebar filtering)
//     companyServiceType: user?.companyServiceType || null,
//     isEcommerceEnabled: user?.isEcommerceEnabled || false,
//     isBookingEnabled: user?.isBookingEnabled || false,
//     canAccessModule: user?.canAccessModule || (() => true),
//     getEnabledModules: user?.getEnabledModules || (() => []),
//     getModuleAccessInfo: user?.getModuleAccessInfo || (() => ({})),
//     filterMenuItems, // ✅ NEW: Filter menu items by service type
//     checkAuth: () => updateSession(),
//     signIn: login,
//     signOut: logout,
//     requireAuth: (requiredRole = null) => {
//       if (!isAuthenticated) return { authorized: false, error: 'Not authenticated' };
//       if (user.status !== 'active') return { 
//         authorized: false, 
//         error: `Account is ${user.status}`,
//         status: user.status 
//       };
//       if (!user.isVerified) return { authorized: false, error: 'Email not verified' };
      
//       if (requiredRole) {
//         if (requiredRole === 'super_admin' && !user.isSuperAdmin) {
//           return { authorized: false, error: 'Super admin access required' };
//         }
//         if (requiredRole === 'company_admin' && !user.isCompanyAdmin) {
//           return { authorized: false, error: 'Company admin access required' };
//         }
//         if (requiredRole === 'admin' && !user.isAdmin) {
//           return { authorized: false, error: 'Admin access required' };
//         }
//         if (requiredRole === 'manager' && !isManagerOrAdmin) {
//           return { authorized: false, error: 'Manager access required' };
//         }
//       }
      
//       return { authorized: true, user };
//     },
//     canAccessRoute: (route) => {
//       if (!isAuthenticated) return false;
//       if (user.status !== 'active') return false;
      
//       if (route.startsWith('/super-admin') && !user.isSuperAdmin) return false;
//       if (route.startsWith('/admin') && !user.isAdmin) return false;
//       if (route.startsWith('/manager') && !isManagerOrAdmin) return false;
      
//       // ✅ NEW: Module-based route access
//       if (route.startsWith('/admin/products') || route.startsWith('/admin/orders') || route.startsWith('/admin/masters')) {
//         if (!user.isEcommerceEnabled && !user.isSuperAdmin) return false;
//       }
//       if (route.startsWith('/admin/bookingService')) {
//         if (!user.isBookingEnabled && !user.isSuperAdmin) return false;
//       }
      
//       return true;
//     }
//   }), [
//     user,
//     isAuthenticated,
//     loading,
//     authChecked,
//     sessionStatus,
//     currentCompany,
//     login,
//     logout,
//     updateUser,
//     switchCompany,
//     refreshSession,
//     hasRole,
//     hasAnyRole,
//     isAdmin,
//     isSuperAdmin,
//     isCompanyAdmin,
//     isManagerOrAdmin,
//     hasPermission,
//     getPermissions,
//     getCompanyId,
//     getAuthHeaders,
//     isActive,
//     session,
//     updateSession,
//     filterMenuItems
//   ]);

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // Higher Order Component for protecting pages
// export function withAuth(Component, options = {}) {
//   const { 
//     requiredRole = null, 
//     redirectTo = '/login',
//     requireVerified = true,
//     requireActive = true,
//     requireCompany = true, // New option for SaaS
//     requiredModule = null // ✅ NEW: Require specific module ('ecommerce', 'booking')
//   } = options;
  
//   return function WithAuthWrapper(props) {
//     const { user, loading, isAuthenticated, isSuperAdmin, isCompanyAdmin, isEcommerceEnabled, isBookingEnabled } = useAuth();
//     const router = useRouter();
//     const pathname = usePathname();

//     useEffect(() => {
//       if (loading) return;

//       if (!isAuthenticated) {
//         router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
//         return;
//       }

//       if (requireActive && user && user.status !== 'active') {
//         if (user.status === 'pending') {
//           router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
//         } else if (user.status === 'inactive') {
//           router.push('/account-inactive');
//         } else if (user.status === 'suspended') {
//           router.push('/account-suspended');
//         } else if (user.status === 'deleted') {
//           router.push('/login?error=account_deleted');
//         }
//         return;
//       }

//       if (requireVerified && user && !user.isVerified) {
//         router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
//         return;
//       }

//       // Company check for non-super-admin users
//       if (requireCompany && !isSuperAdmin && !user?.companyId) {
//         console.error('User has no company association');
//         router.push('/login?error=no_company');
//         return;
//       }

//       // ✅ NEW: Module requirement check
//       if (requiredModule && !isSuperAdmin) {
//         if (requiredModule === 'ecommerce' && !isEcommerceEnabled) {
//           console.warn('E-commerce module access required but not enabled for this company');
//           router.push('/admin/dashboards');
//           return;
//         }
//         if (requiredModule === 'booking' && !isBookingEnabled) {
//           console.warn('Booking module access required but not enabled for this company');
//           router.push('/admin/dashboards');
//           return;
//         }
//       }

//       // Role-based access control
//       if (requiredRole) {
//         if (requiredRole === 'super_admin' && !isSuperAdmin) {
//           console.warn('Super admin access required');
//           router.push('/admin/dashboards');
//           return;
//         }
//         if (requiredRole === 'company_admin' && !isCompanyAdmin) {
//           console.warn('Company admin access required');
//           router.push('/dashboard');
//           return;
//         }
//         if (requiredRole === 'admin' && !user?.isAdmin) {
//           console.warn('Admin access required');
//           router.push('/dashboard');
//           return;
//         }
//         if (requiredRole === 'manager' && !['admin', 'manager'].includes(user?.role)) {
//           console.warn('Manager access required');
//           router.push('/dashboard');
//           return;
//         }
//       }
//     }, [loading, isAuthenticated, user, requiredRole, router, pathname, requireVerified, requireActive, requireCompany, isSuperAdmin, isCompanyAdmin, isEcommerceEnabled, isBookingEnabled, requiredModule]);

//     if (loading || !isAuthenticated) {
//       return (
//         <div style={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           minHeight: '100vh',
//           backgroundColor: '#f5f5f5',
//         }}>
//           <div style={{
//             textAlign: 'center',
//             padding: '40px',
//             borderRadius: '12px',
//             backgroundColor: 'white',
//             boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//           }}>
//             <div style={{
//               width: '50px',
//               height: '50px',
//               border: '4px solid #f3f3f3',
//               borderTop: '4px solid #3498db',
//               borderRadius: '50%',
//               animation: 'spin 1s linear infinite',
//               margin: '0 auto 20px',
//             }} />
//             <p style={{
//               color: '#333',
//               fontSize: '16px',
//               margin: 0,
//             }}>
//               {loading ? 'Loading...' : 'Checking authentication...'}
//             </p>
//             {!loading && !isAuthenticated && (
//               <p style={{
//                 color: '#666',
//                 fontSize: '14px',
//                 marginTop: '10px',
//               }}>
//                 Redirecting to login...
//               </p>
//             )}
//           </div>
//           <style>{`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}</style>
//         </div>
//       );
//     }

//     return <Component {...props} />;
//   };
// }

// // Hook for protected API calls with automatic token refresh and company context
// export function useProtectedFetch() {
//   const { user, refreshSession, logout, getAuthHeaders } = useAuth();
  
//   const protectedFetch = useCallback(async (url, options = {}) => {
//     try {
//       // Merge headers with company context
//       const headers = {
//         ...getAuthHeaders(),
//         ...options.headers,
//       };

//       const response = await fetch(url, {
//         ...options,
//         headers,
//       });

//       if (response.status === 401) {
//         console.log('🔄 [useProtectedFetch] Session expired, attempting refresh');
//         const refreshResult = await refreshSession();
        
//         if (!refreshResult.success) {
//           await logout();
//           throw new Error('Session expired. Please log in again.');
//         }
        
//         // Retry with new session
//         return await fetch(url, {
//           ...options,
//           headers: {
//             ...getAuthHeaders(),
//             ...options.headers,
//           },
//         });
//       }

//       if (response.status === 403) {
//         const data = await response.json().catch(() => ({}));
//         throw new Error(data.message || 'You do not have permission to perform this action.');
//       }

//       return response;
//     } catch (error) {
//       console.error('❌ [useProtectedFetch] Request failed:', error);
//       throw error;
//     }
//   }, [refreshSession, logout, getAuthHeaders]);

//   return protectedFetch;
// }

// // ✅ NEW: Hook for module access checking (for sidebar filtering)
// export function useModuleAccess() {
//   const { user, isEcommerceEnabled, isBookingEnabled, canAccessModule, getEnabledModules, filterMenuItems } = useAuth();
  
//   const canAccess = useCallback((moduleName) => {
//     return canAccessModule(moduleName);
//   }, [canAccessModule]);
  
//   return {
//     serviceType: user?.companyServiceType || null,
//     isEcommerceEnabled,
//     isBookingEnabled,
//     canAccess,
//     getEnabledModules: getEnabledModules || (() => []),
//     filterMenuItems,
//     hasModule: (moduleName) => canAccess(moduleName),
//   };
// }

// // Hook to check if user can access a specific route
// export function useRouteAccess() {
//   const { user, isAuthenticated, isSuperAdmin, isAdmin, isManagerOrAdmin, isEcommerceEnabled, isBookingEnabled } = useAuth();
//   const router = useRouter();
  
//   const canAccessRoute = useCallback((route) => {
//     if (!isAuthenticated || !user) return false;
//     if (user.status !== 'active') return false;
    
//     if (route.startsWith('/super-admin')) {
//       return isSuperAdmin;
//     }
    
//     if (route.startsWith('/admin')) {
//       if (!isAdmin) return false;
      
//       // ✅ NEW: Module-based route access
//       if (route.startsWith('/admin/products') || route.startsWith('/admin/orders') || route.startsWith('/admin/masters')) {
//         return isEcommerceEnabled || isSuperAdmin;
//       }
//       if (route.startsWith('/admin/bookingService')) {
//         return isBookingEnabled || isSuperAdmin;
//       }
      
//       return true;
//     }
    
//     if (route.startsWith('/manager')) {
//       return isManagerOrAdmin;
//     }
    
//     return true;
//   }, [isAuthenticated, user, isSuperAdmin, isAdmin, isManagerOrAdmin, isEcommerceEnabled, isBookingEnabled]);
  
//   const navigateIfAuthorized = useCallback((route) => {
//     if (canAccessRoute(route)) {
//       router.push(route);
//       return true;
//     }
//     return false;
//   }, [canAccessRoute, router]);
  
//   return {
//     canAccessRoute,
//     navigateIfAuthorized,
//   };
// }

// // Export context for direct usage if needed
// export { AuthContext };
