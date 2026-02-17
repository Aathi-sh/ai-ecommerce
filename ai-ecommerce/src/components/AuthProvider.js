'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, signIn } from 'next-auth/react';
import { deleteTokenFromBackend, getCurrentFCMToken, processPendingFCMTokens } from '@/lib/firebase/fcm-token-service';

// Create context with default value
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user || null;

  // Dispatch auth-ready event
  const dispatchAuthReady = useCallback((userData) => {
    if (typeof window !== 'undefined') {
      console.log('📢 Dispatching auth-ready event for user:', userData?.email);
      window.dispatchEvent(new CustomEvent('auth-ready', { 
        detail: { user: userData } 
      }));
      window.dispatchEvent(new Event('auth-state-changed'));
    }
  }, []);

  // Process FCM tokens for admin users
  const processAdminFCMTokens = useCallback(async (userData) => {
    if (userData?.role === 'admin') {
      console.log('👑 User is admin, processing pending FCM tokens...');
      setTimeout(async () => {
        try {
          const result = await processPendingFCMTokens();
          if (result?.success) {
            console.log('✅ Processed pending FCM tokens:', result);
          }
        } catch (error) {
          console.error('FCM token processing error:', error);
        }
      }, 1000);
    }
  }, []);

  // Initialize auth when session changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (status === 'loading') {
          setLoading(true);
          return;
        }

        if (session?.user) {
          // Store user data in localStorage for FCM compatibility
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              role: session.user.role,
              sessionId: session.user.sessionId
            }));
            
            if (session.user.originalToken) {
              localStorage.setItem('token', session.user.originalToken);
            }
          }

          console.log('✅ User authenticated via NextAuth:', session.user.email);
          dispatchAuthReady(session.user);
          processAdminFCMTokens(session.user);
        } else {
          // Clear localStorage on logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('token_expiry');
          }
          
          console.log('❌ No valid authentication found');
          
          // Redirect if on admin page
          if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
            console.log('Redirecting to login from:', pathname);
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        }

        setAuthChecked(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [session, status, pathname, dispatchAuthReady, processAdminFCMTokens]);

  // Login function with NextAuth
  const login = useCallback(async (email, password, options = {}) => {
    try {
      const { rememberMe = true } = options;
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      // Update session to get latest data
      await update();

      // Get user from session
      if (!session?.user) {
        return { success: false, error: 'Login failed' };
      }

      // Store expiry time for compatibility
      if (rememberMe && typeof window !== 'undefined') {
        const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        localStorage.setItem('token_expiry', expiryTime.toString());
      }

      return { success: true, user: session.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, [session, update]);

  // Enhanced logout with FCM token cleanup
  const logout = useCallback(async (options = {}) => {
    const { 
      clearFCM = true, 
      redirectTo = '/login', 
      notifyOtherTabs = true 
    } = options;
    
    try {
      console.log('🔄 Logging out user...');
      
      // Get current FCM token before clearing auth
      let fcmToken = null;
      if (clearFCM && user?.role === 'admin') {
        try {
          fcmToken = await getCurrentFCMToken();
          console.log('FCM token for cleanup:', fcmToken ? 'Found' : 'Not found');
        } catch (error) {
          console.warn('Could not get FCM token for cleanup:', error);
        }
      }
      
      // Clear auth data from all storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expiry');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('pending_fcm_tokens');
      }
      
      // Clear FCM token from backend (only for admins)
      if (fcmToken && user?.role === 'admin') {
        try {
          await deleteTokenFromBackend({ token: fcmToken });
          console.log('✅ FCM token removed on logout');
        } catch (error) {
          console.warn('Could not delete FCM token:', error);
        }
      }
      
      // Sign out from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: redirectTo 
      });
      
      console.log('✅ User logged out');
      
      // Dispatch logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-logged-out'));
      }
      
      // Notify other tabs
      if (notifyOtherTabs && typeof window !== 'undefined') {
        localStorage.setItem('logout', Date.now().toString());
      }
      
      // Redirect
      if (redirectTo) {
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 100);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Update user data
  const updateUser = useCallback(async (updatedData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      // Update session with new data
      await update({
        ...session,
        user: {
          ...session.user,
          ...updatedData
        }
      });
      
      // Also update localStorage for compatibility
      if (typeof window !== 'undefined') {
        const currentUser = { 
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ...updatedData 
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      console.log('✅ User data updated');
      dispatchAuthReady(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  }, [user, session, update, dispatchAuthReady]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  }, [user]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      // NextAuth automatically handles token refresh
      await update();
      return { success: true };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: error.message };
    }
  }, [update]);

  // Listen for logout events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleLogoutEvent = (event) => {
      if (event.key === 'logout') {
        console.log('Logout triggered from another tab');
        logout({ notifyOtherTabs: false, redirectTo: null });
      }
    };
    
    const handleExternalLogout = () => {
      console.log('Logout event received from another component');
      logout({ notifyOtherTabs: false, redirectTo: null });
    };
    
    window.addEventListener('storage', handleLogoutEvent);
    window.addEventListener('auth-logout-request', handleExternalLogout);
    
    return () => {
      window.removeEventListener('storage', handleLogoutEvent);
      window.removeEventListener('auth-logout-request', handleExternalLogout);
    };
  }, [logout]);

  // Value to provide to consumers
  const contextValue = {
    user,
    login,
    logout,
    updateUser,
    refreshToken,
    hasRole,
    hasPermission,
    loading: status === 'loading' || loading,
    authChecked,
    isAuthenticated: !!user,
    checkAuth: () => update(),
    triggerAuthReady: () => {
      if (user) {
        dispatchAuthReady(user);
      }
    },
    // NextAuth specific
    session,
    signOut,
    signIn
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth used outside AuthProvider. Returning default context.');
    
    return {
      user: null,
      login: async () => ({ success: false, error: 'AuthProvider not found' }),
      logout: async () => ({ success: false, error: 'AuthProvider not found' }),
      updateUser: () => ({ success: false, error: 'AuthProvider not found' }),
      refreshToken: async () => ({ success: false, error: 'AuthProvider not found' }),
      hasRole: () => false,
      hasPermission: () => false,
      loading: false,
      authChecked: true,
      isAuthenticated: false,
      checkAuth: async () => {},
      triggerAuthReady: () => {},
      session: null,
      signOut: async () => {},
      signIn: async () => {}
    };
  }
  
  return context;
};