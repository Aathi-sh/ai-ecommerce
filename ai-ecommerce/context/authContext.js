'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { deleteTokenFromBackend, getCurrentFCMToken, processPendingFCMTokens } from '@/lib/firebase/fcm-token-service';

// Create context with default value
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Function to safely parse JSON from localStorage
  const safeParseJSON = useCallback((key) => {
    try {
      if (typeof window === 'undefined') return null;
      
      const item = localStorage.getItem(key);
      
      // Check if item exists and is not "undefined" string
      if (!item || item === 'undefined' || item === 'null') {
        if (item === 'undefined' || item === 'null') {
          localStorage.removeItem(key); // Clean up invalid data
        }
        return null;
      }
      
      // Try to parse the JSON
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage:`, error);
      console.error('Problematic data:', localStorage.getItem(key));
      localStorage.removeItem(key); // Clean up corrupted data
      return null;
    }
  }, []);

  // Dispatch auth-ready event
  const dispatchAuthReady = useCallback((userData) => {
    if (typeof window !== 'undefined') {
      console.log('📢 Dispatching auth-ready event for user:', userData?.email);
      window.dispatchEvent(new CustomEvent('auth-ready', { 
        detail: { user: userData } 
      }));
      
      // Also dispatch a simpler event for backward compatibility
      window.dispatchEvent(new Event('auth-state-changed'));
    }
  }, []);

  // Enhanced auth check with validation - only uses localStorage
  const checkAuth = useCallback(async () => {
    try {
      console.log('🔄 Checking authentication...');
      
      if (typeof window === 'undefined') {
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      
      // Check localStorage (your custom auth)
      const token = localStorage.getItem('token');
      const userData = safeParseJSON('user');
      const expiryTime = localStorage.getItem('token_expiry');
      
      // Check if token exists and is not expired
      const isExpired = expiryTime && Date.now() > parseInt(expiryTime);
      
      if (token && userData && !isExpired) {
        // Validate userData structure
        if (typeof userData === 'object' && userData !== null) {
          // Ensure required fields exist
          const validatedUserData = {
            id: userData.id || userData._id || '',
            email: userData.email || '',
            name: userData.name || '',
            role: userData.role || 'user',
            ...userData
          };
          
          setUser(validatedUserData);
          console.log('✅ User authenticated via localStorage:', validatedUserData.email);
          
          // Dispatch auth-ready event
          dispatchAuthReady(validatedUserData);
          
          setLoading(false);
          setAuthChecked(true);
          
          // Process any pending FCM tokens (only for admins)
          if (validatedUserData.role === 'admin') {
            console.log('👑 User is admin, processing pending FCM tokens...');
            setTimeout(() => {
              processPendingFCMTokens().then(result => {
                if (result?.success) {
                  console.log('✅ Processed pending FCM tokens:', result);
                }
              });
            }, 1000);
          }
          
          return;
        } else {
          console.warn('Invalid user data structure, clearing auth');
          await logout({ notifyOtherTabs: false, redirectTo: null });
        }
      } else if (isExpired) {
        // Token expired, auto logout
        console.log('Token expired, logging out...');
        await logout({ notifyOtherTabs: false, redirectTo: null });
      }
      
      // No valid auth found
      console.log('❌ No valid authentication found');
      setUser(null);
      
      // If we're on an admin page and not authenticated, redirect to login
      if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
        console.log('Redirecting to login from:', pathname);
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, [pathname, safeParseJSON, dispatchAuthReady]);

  // Initialize auth on mount and route changes
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      setLoading(false);
      setAuthChecked(true);
      return;
    }
    
    // Initial auth check
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    // Listen for storage events (e.g., login/logout from other tabs)
    const handleStorageChange = (event) => {
      if (event.key === 'token' || event.key === 'user' || event.key === 'token_expiry') {
        console.log('Storage changed:', event.key, 'Re-checking auth...');
        setTimeout(() => {
          checkAuth();
        }, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check auth when window gains focus
    const handleFocus = () => {
      setTimeout(() => {
        checkAuth();
      }, 100);
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Set up interval to check auth periodically (every 30 seconds)
    const authInterval = setInterval(() => {
      checkAuth();
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(authInterval);
    };
  }, [checkAuth]);

  // Login function with optional token expiry
  const login = useCallback(async (userData, token, options = {}) => {
    try {
      const { 
        rememberMe = true, 
        expiresIn = 24 * 60 * 60 * 1000, // Default 24 hours
        clearOldFCM = true 
      } = options;
      
      // Validate userData
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data');
      }
      
      // Ensure user has required fields
      const validatedUserData = {
        id: userData.id || userData._id || '',
        email: userData.email || '',
        name: userData.name || '',
        role: userData.role || 'user',
        ...userData
      };
      
      if (!validatedUserData.email) {
        throw new Error('User email is required');
      }
      
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token');
      }
      
      if (typeof window === 'undefined') {
        throw new Error('Cannot login on server side');
      }
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(validatedUserData));
      
      if (rememberMe) {
        const expiryTime = Date.now() + expiresIn;
        localStorage.setItem('token_expiry', expiryTime.toString());
      } else {
        // Session-only (clears on browser close)
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(validatedUserData));
        localStorage.removeItem('token_expiry');
      }
      
      // Set user in state
      setUser(validatedUserData);
      console.log('✅ User logged in:', validatedUserData.email);
      
      // Dispatch auth-ready event
      dispatchAuthReady(validatedUserData);
      
      // If clearing old FCM tokens for this user
      if (clearOldFCM && validatedUserData.role === 'admin') {
        try {
          console.log('Cleaning up old FCM tokens...');
          // Implementation would go here
        } catch (fcmError) {
          console.warn('Could not cleanup FCM tokens:', fcmError);
        }
      }
      
      // Process any pending FCM tokens (only for admins)
      if (validatedUserData.role === 'admin') {
        console.log('👑 Admin logged in, processing FCM tokens...');
        setTimeout(() => {
          processPendingFCMTokens().then(result => {
            if (result?.success) {
              console.log('✅ Processed FCM tokens after login:', result);
            }
          });
        }, 2000);
      }
      
      return { success: true, user: validatedUserData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatchAuthReady]);

  // Enhanced logout with FCM token cleanup
  const logout = useCallback(async (options = {}) => {
    const { 
      clearFCM = true, 
      redirectTo = '/login', 
      notifyOtherTabs = true 
    } = options;
    
    try {
      console.log('🔄 Logging out user...');
      
      if (typeof window === 'undefined') {
        setUser(null);
        return { success: true };
      }
      
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Clear any pending FCM tokens
      localStorage.removeItem('pending_fcm_tokens');
      
      // Clear FCM token from backend (only for admins)
      if (fcmToken && user?.role === 'admin') {
        try {
          await deleteTokenFromBackend({ token: fcmToken });
          console.log('✅ FCM token removed on logout');
        } catch (error) {
          console.warn('Could not delete FCM token:', error);
        }
      }
      
      // Update state
      setUser(null);
      console.log('✅ User logged out');
      
      // Dispatch logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-logged-out'));
      }
      
      // Notify other tabs
      if (notifyOtherTabs) {
        localStorage.setItem('logout', Date.now().toString());
      }
      
      // Redirect if redirectTo is provided
      if (redirectTo) {
        // Small delay to ensure state is updated
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
  const updateUser = useCallback((updatedData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const currentUser = { ...user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(currentUser));
      setUser(currentUser);
      console.log('✅ User data updated');
      
      // Dispatch auth-ready event for updated user
      dispatchAuthReady(currentUser);
      
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  }, [user, dispatchAuthReady]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  }, [user]);

  // Refresh token (if your backend supports it)
  const refreshToken = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'Cannot refresh token on server' };
      }
      
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'No token found' };
      
      // Call your refresh token API
      // Example:
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // 
      // if (response.ok) {
      //   const data = await response.json();
      //   localStorage.setItem('token', data.newToken);
      //   return { success: true, token: data.newToken };
      // }
      
      return { success: false, error: 'Refresh not implemented' };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: error.message };
    }
  }, []);

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

  // Handle token expiry check periodically
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    
    const checkTokenExpiry = () => {
      const expiryTime = localStorage.getItem('token_expiry');
      if (expiryTime) {
        const expiryNum = parseInt(expiryTime);
        if (!isNaN(expiryNum) && Date.now() > expiryNum) {
          console.log('Token expired during session, logging out...');
          logout({ notifyOtherTabs: false, redirectTo: '/login' });
        }
      }
    };
    
    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [user, logout]);

  // Auto-check auth when pathname changes (navigation)
  useEffect(() => {
    if (pathname && authChecked) {
      console.log('Route changed to:', pathname);
      setTimeout(() => {
        checkAuth();
      }, 100);
    }
  }, [pathname, authChecked, checkAuth]);

  // Listen for auth-ready events from other components
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleExternalAuthReady = () => {
      console.log('External auth-ready event received');
      if (user) {
        dispatchAuthReady(user);
      }
    };
    
    window.addEventListener('auth-request-ready', handleExternalAuthReady);
    
    return () => {
      window.removeEventListener('auth-request-ready', handleExternalAuthReady);
    };
  }, [user, dispatchAuthReady]);

  // Value to provide to consumers
  const contextValue = {
    user,
    login,
    logout,
    updateUser,
    refreshToken,
    hasRole,
    hasPermission,
    loading,
    authChecked,
    isAuthenticated: !!user,
    checkAuth,
    // Helper to manually trigger auth-ready event
    triggerAuthReady: () => {
      if (user) {
        dispatchAuthReady(user);
      }
    }
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
    
    // Return a safe default context instead of throwing
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
    };
  }
  
  return context;
};