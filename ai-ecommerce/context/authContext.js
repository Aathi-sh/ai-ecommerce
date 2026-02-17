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
//  * - No custom JWT handling
//  * - No localStorage/sessionStorage auth state
//  * - Pure NextAuth integration
//  * - Role-based helper functions
//  * - Session state management
//  * - FCM notification cleanup for admin users
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

//   // Derive user from session with enhanced properties
//   const user = useMemo(() => {
//     if (!session?.user) return null;
    
//     return {
//       ...session.user,
//       id: session.user.id,
//       email: session.user.email,
//       name: session.user.name || session.user.fullName || session.user.email?.split('@')[0],
//       role: session.user.role || 'user',
//       isVerified: session.user.isVerified || false,
//       phone: session.user.phone || '',
//       isAdmin: session.user.role === 'admin',
//       isManager: session.user.role === 'manager',
//       preferences: session.user.preferences || {},
//       notificationSettings: session.user.notificationSettings || {},
//       isAuthenticated: true,
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
//           isVerified: session?.user?.isVerified,
//           status: sessionStatus
//         });

//         if (session?.user) {
//           console.log('✅ [AuthContext] User authenticated:', {
//             email: session.user.email,
//             role: session.user.role,
//             isVerified: session.user.isVerified
//           });
          
//           // Store minimal user info for non-auth features (like FCM)
//           // This is NOT for authentication, only for features that need user info
//           if (typeof window !== 'undefined') {
//             try {
//               localStorage.setItem('user_info', JSON.stringify({
//                 id: session.user.id,
//                 email: session.user.email,
//                 role: session.user.role,
//                 name: session.user.name,
//                 isAdmin: session.user.role === 'admin',
//                 isManager: session.user.role === 'manager',
//                 isVerified: session.user.isVerified,
//                 // Only store non-sensitive information
//               }));
//             } catch (e) {
//               console.warn('⚠️ [AuthContext] Could not store user info in localStorage:', e);
//             }
//           }
//         } else {
//           // Clear any cached user info on logout
//           if (typeof window !== 'undefined') {
//             localStorage.removeItem('user_info');
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
//   }, [session, sessionStatus]);

//   // Enhanced login function using NextAuth
//   const login = useCallback(async (email, password, options = {}) => {
//     try {
//       const { rememberMe = false, callbackUrl = '/' } = options;
      
//       console.log('🔐 [AuthContext] Attempting login for:', email);
      
//       // Use NextAuth's signIn function
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
        
//         if (result.error.includes('Invalid email or password')) {
//           errorMessage = 'Invalid email or password';
//         } else if (result.error.includes('verify your email')) {
//           errorMessage = 'Please verify your email address before logging in';
//           errorType = 'warning';
//         } else if (result.error.includes('inactive')) {
//           errorMessage = 'Your account is inactive. Please contact support';
//         } else if (result.error.includes('Too many requests')) {
//           errorMessage = 'Too many login attempts. Please try again later.';
//         }
        
//         return {
//           success: false,
//           error: errorMessage,
//           errorType,
//           code: result.error,
//         };
//       }

//       console.log('✅ [AuthContext] Login successful');
      
//       // Update session to get latest data
//       await updateSession();
      
//       // Wait a moment for session to update
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
          
//           // Dynamically import FCM service only when needed
//           const fcmModule = await import('@/lib/firebase/fcm-token-service');
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
//           },
//           body: JSON.stringify({ fcmToken }),
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
//         // Continue with client-side logout even if API fails
//       }
      
//       // Step 3: Clear client-side storage
//       if (typeof window !== 'undefined') {
//         try {
//           // Clear auth-related storage
//           localStorage.removeItem('user_info');
//           sessionStorage.removeItem('user');
          
//           // Clear any cached auth data
//           localStorage.removeItem('nextauth.message');
//           localStorage.removeItem('auth_token');
//           localStorage.removeItem('token_expiry');
          
//           // Clear FCM-related storage
//           localStorage.removeItem('fcm_token');
//           localStorage.removeItem('fcm_token_sent_to_server');
          
//           // Notify other tabs if needed
//           if (notifyOtherTabs) {
//             localStorage.setItem('logout_event', Date.now().toString());
//             setTimeout(() => localStorage.removeItem('logout_event'), 1000);
//           }
          
//           // Dispatch logout event for other components
//           window.dispatchEvent(new Event('user-logged-out'));
//           window.dispatchEvent(new CustomEvent('auth-state-changed', {
//             detail: { user: null, isAuthenticated: false }
//           }));
          
//         } catch (storageError) {
//           console.warn('⚠️ [AuthContext] Storage cleanup error:', storageError);
//         }
//       }
      
//       // Step 4: Sign out via NextAuth (this clears the session cookie)
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
//           router.refresh(); // Force refresh to update server components
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
      
//       // Force redirect on error
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
      
//       // Call your API to update user data
//       const response = await fetch('/api/user/profile', {
//         method: 'PUT',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updatedData),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Update failed');
//       }
      
//       // Update session with new data
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

//   // Check if user has specific role
//   const hasRole = useCallback((role) => {
//     return user?.role === role;
//   }, [user]);

//   // Check if user has any of the specified roles
//   const hasAnyRole = useCallback((roles) => {
//     if (!user?.role || !Array.isArray(roles)) return false;
//     return roles.includes(user.role);
//   }, [user]);

//   // Check if user is admin
//   const isAdmin = useMemo(() => {
//     return user?.role === 'admin';
//   }, [user]);

//   // Check if user is manager or admin
//   const isManagerOrAdmin = useMemo(() => {
//     return ['admin', 'manager'].includes(user?.role);
//   }, [user]);

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

//   // Get user permissions (extend based on your permission system)
//   const getPermissions = useCallback(() => {
//     if (!user) return [];
    
//     // Permission mapping based on role (extend as needed)
//     const permissionMap = {
//       admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products'],
//       manager: ['read', 'write', 'manage_orders', 'view_reports', 'manage_inventory'],
//       user: ['read', 'write_own', 'view_profile'],
//     };
    
//     return permissionMap[user.role] || ['read'];
//   }, [user]);

//   // Check if user has specific permission
//   const hasPermission = useCallback((permission) => {
//     const permissions = getPermissions();
//     return permissions.includes(permission);
//   }, [getPermissions]);

//   // Handle route protection and redirects
//   useEffect(() => {
//     if (loading || !authChecked) return;

//     const handleRouteProtection = () => {
//       // Define public paths that don't require authentication
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
//       ];

//       const isPublicPath = publicPaths.some(path => 
//         pathname === path || pathname?.startsWith(`${path}/`)
//       );

//       // If user is not authenticated and trying to access protected route
//       if (!isAuthenticated && !isPublicPath) {
//         console.log('🔄 [AuthContext] Redirecting unauthenticated user to login from:', pathname);
//         const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
//         router.push(loginUrl);
//         return;
//       }

//       // If user is authenticated but trying to access auth pages
//       if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
//         console.log('🔄 [AuthContext] Redirecting authenticated user from auth page:', pathname);
//         const redirectPath = user.role === 'admin' 
//           ? '/admin/dashboards' 
//           : user.role === 'manager' 
//             ? '/manager/dashboard' 
//             : '/dashboard';
//         router.push(redirectPath);
//         return;
//       }

//       // If user is not verified and trying to access protected routes (except verification page)
//       if (isAuthenticated && !user.isVerified && !pathname?.includes('/verify-email')) {
//         console.log('🔄 [AuthContext] Redirecting unverified user to verification:', pathname);
//         router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
//         return;
//       }

//       // Role-based route protection
//       if (isAuthenticated) {
//         // Admin routes require admin role
//         if (pathname?.startsWith('/admin') && !user.isAdmin) {
//           console.log('⛔ [AuthContext] Non-admin user attempting to access admin route:', pathname);
//           router.push('/dashboards');
//           return;
//         }

//         // Manager routes require manager or admin role
//         if (pathname?.startsWith('/manager') && !user.isManagerOrAdmin) {
//           console.log('⛔ [AuthContext] Unauthorized user attempting to access manager route:', pathname);
//           router.push('/dashboard');
//           return;
//         }
//       }
//     };

//     handleRouteProtection();
//   }, [isAuthenticated, user, pathname, router, authChecked, loading]);

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

//   // Monitor session activity (optional for session extension)
//   useEffect(() => {
//     if (!isAuthenticated || !user?.isAdmin) return;

//     let activityTimer;
    
//     const handleUserActivity = () => {
//       // Clear existing timer
//       if (activityTimer) clearTimeout(activityTimer);
      
//       // Set new timer to update last activity
//       activityTimer = setTimeout(async () => {
//         try {
//           // Optional: Update last activity in database for admin users
//           await fetch('/api/user/activity', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ userId: user.id }),
//           }).catch(err => console.debug('Activity update failed:', err));
//         } catch (error) {
//           // Silent fail for activity tracking
//         }
//       }, 60000); // Update every minute of activity
//     };

//     // Track user activity events
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
//   }, [isAuthenticated, user]);

//   // Context value
//   const contextValue = useMemo(() => ({
//     // Authentication state
//     user,
//     isAuthenticated,
//     loading: loading || sessionStatus === 'loading',
//     authChecked,
    
//     // Authentication methods
//     login,
//     logout,
//     updateUser,
//     refreshSession,
    
//     // Role and permission checks
//     hasRole,
//     hasAnyRole,
//     isAdmin: isAdmin,
//     isManagerOrAdmin: isManagerOrAdmin,
//     hasPermission,
//     getPermissions,
    
//     // NextAuth session (for advanced use cases)
//     session,
//     sessionStatus,
    
//     // Helper methods
//     checkAuth: () => updateSession(),
    
//     // Compatibility aliases
//     signIn: login,
//     signOut: logout,
    
//     // Utility functions
//     requireAuth: (requiredRole = null) => {
//       if (!isAuthenticated) return { authorized: false, error: 'Not authenticated' };
//       if (!user.isVerified) return { authorized: false, error: 'Email not verified' };
//       if (requiredRole && user.role !== requiredRole) {
//         return { authorized: false, error: `Required role: ${requiredRole}` };
//       }
//       return { authorized: true, user };
//     },
    
//     // Check if current user can access a specific route
//     canAccessRoute: (route) => {
//       if (!isAuthenticated) return false;
//       if (route.startsWith('/admin') && !isAdmin) return false;
//       if (route.startsWith('/manager') && !isManagerOrAdmin) return false;
//       return true;
//     }
//   }), [
//     user,
//     isAuthenticated,
//     loading,
//     authChecked,
//     sessionStatus,
//     login,
//     logout,
//     updateUser,
//     refreshSession,
//     hasRole,
//     hasAnyRole,
//     isAdmin,
//     isManagerOrAdmin,
//     hasPermission,
//     getPermissions,
//     session,
//     updateSession
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
//     requireVerified = true 
//   } = options;
  
//   return function WithAuthWrapper(props) {
//     const { user, loading, isAuthenticated } = useAuth();
//     const router = useRouter();
//     const pathname = usePathname();

//     useEffect(() => {
//       if (loading) return;

//       if (!isAuthenticated) {
//         router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
//         return;
//       }

//       if (requireVerified && user && !user.isVerified) {
//         router.push(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(pathname)}`);
//         return;
//       }

//       if (requiredRole && user?.role !== requiredRole) {
//         console.warn(`User role ${user?.role} does not match required role ${requiredRole}`);
//         router.push('/dashboard');
//         return;
//       }
//     }, [loading, isAuthenticated, user, requiredRole, router, pathname, requireVerified]);

//     if (loading || !isAuthenticated || (requiredRole && user?.role !== requiredRole) || (requireVerified && user && !user.isVerified)) {
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
//           <style jsx>{`
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

// // Hook for protected API calls with automatic token refresh
// export function useProtectedFetch() {
//   const { user, refreshSession, logout } = useAuth();
  
//   const protectedFetch = useCallback(async (url, options = {}) => {
//     try {
//       const response = await fetch(url, {
//         ...options,
//         headers: {
//           ...options.headers,
//           // Add any authentication headers here if needed
//         },
//       });

//       // Handle 401 Unauthorized - refresh session or logout
//       if (response.status === 401) {
//         console.log('🔄 [useProtectedFetch] Session expired, attempting refresh');
//         const refreshResult = await refreshSession();
        
//         if (!refreshResult.success) {
//           // Refresh failed, trigger logout
//           await logout();
//           throw new Error('Session expired. Please log in again.');
//         }
        
//         // Retry the request once with refreshed session
//         return await fetch(url, options);
//       }

//       // Handle 403 Forbidden (insufficient permissions)
//       if (response.status === 403) {
//         const data = await response.json().catch(() => ({}));
//         throw new Error(data.message || 'You do not have permission to perform this action.');
//       }

//       return response;
//     } catch (error) {
//       console.error('❌ [useProtectedFetch] Request failed:', error);
//       throw error;
//     }
//   }, [refreshSession, logout]);

//   return protectedFetch;
// }

// // Hook to check if user can access a specific route
// export function useRouteAccess() {
//   const { user, isAuthenticated } = useAuth();
//   const router = useRouter();
  
//   const canAccessRoute = useCallback((route) => {
//     if (!isAuthenticated || !user) return false;
    
//     if (route.startsWith('/admin')) {
//       return user.role === 'admin';
//     }
    
//     if (route.startsWith('/manager')) {
//       return ['admin', 'manager'].includes(user.role);
//     }
    
//     return true;
//   }, [isAuthenticated, user]);
  
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
 * - No custom JWT handling
 * - No localStorage/sessionStorage auth state
 * - Pure NextAuth integration
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

  // Derive user from session with enhanced properties
  const user = useMemo(() => {
    if (!session?.user) return null;
    
    return {
      ...session.user,
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.fullName || session.user.email?.split('@')[0],
      role: session.user.role || 'user',
      isVerified: session.user.isVerified || false,
      phone: session.user.phone || '',
      status: session.user.status || 'active', // ✅ Add status from session
      isAdmin: session.user.role === 'admin',
      isManager: session.user.role === 'manager',
      preferences: session.user.preferences || {},
      notificationSettings: session.user.notificationSettings || {},
      isAuthenticated: true,
      // ✅ Fix: Use actual status from database, not virtual
      isActive: session.user.status === 'active', // Derived from status, not stored in DB
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
          isVerified: session?.user?.isVerified,
          status: session?.user?.status, // ✅ Log actual status
          isActive: session?.user?.status === 'active', // ✅ Log derived isActive
          status: sessionStatus
        });

        if (session?.user) {
          console.log('✅ [AuthContext] User authenticated:', {
            email: session.user.email,
            role: session.user.role,
            isVerified: session.user.isVerified,
            status: session.user.status, // ✅ Log actual status
            isActive: session.user.status === 'active' // ✅ Log derived isActive
          });
          
          // Store minimal user info for non-auth features (like FCM)
          // This is NOT for authentication, only for features that need user info
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('user_info', JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                role: session.user.role,
                name: session.user.name,
                isAdmin: session.user.role === 'admin',
                isManager: session.user.role === 'manager',
                isVerified: session.user.isVerified,
                status: session.user.status, // ✅ Store actual status
                isActive: session.user.status === 'active', // ✅ Store derived isActive
                // Only store non-sensitive information
              }));
            } catch (e) {
              console.warn('⚠️ [AuthContext] Could not store user info in localStorage:', e);
            }
          }
        } else {
          // Clear any cached user info on logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_info');
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
  }, [session, sessionStatus]);

  // Enhanced login function using NextAuth
  const login = useCallback(async (email, password, options = {}) => {
    try {
      const { rememberMe = false, callbackUrl = '/' } = options;
      
      console.log('🔐 [AuthContext] Attempting login for:', email);
      
      // Use NextAuth's signIn function
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
        
        // ✅ Handle all account status errors professionally
        if (result.error === 'PENDING_VERIFICATION') {
          errorMessage = 'Please verify your email address before logging in';
          errorType = 'warning';
        } else if (result.error === 'ACCOUNT_INACTIVE') {
          errorMessage = 'Your account is inactive. Please contact support to reactivate your account';
        } else if (result.error === 'ACCOUNT_SUSPENDED') {
          errorMessage = 'Your account has been suspended. Please contact support for assistance';
        } else if (result.error === 'ACCOUNT_DELETED') {
          errorMessage = 'This account has been deleted. Please create a new account';
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
      
      // Update session to get latest data
      await updateSession();
      
      // Wait a moment for session to update
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
          
          // Dynamically import FCM service only when needed
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
          },
          body: JSON.stringify({ fcmToken }),
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
        // Continue with client-side logout even if API fails
      }
      
      // Step 3: Clear client-side storage
      if (typeof window !== 'undefined') {
        try {
          // Clear auth-related storage
          localStorage.removeItem('user_info');
          sessionStorage.removeItem('user');
          
          // Clear any cached auth data
          localStorage.removeItem('nextauth.message');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token_expiry');
          
          // Clear FCM-related storage
          localStorage.removeItem('fcm_token');
          localStorage.removeItem('fcm_token_sent_to_server');
          
          // Notify other tabs if needed
          if (notifyOtherTabs) {
            localStorage.setItem('logout_event', Date.now().toString());
            setTimeout(() => localStorage.removeItem('logout_event'), 1000);
          }
          
          // Dispatch logout event for other components
          window.dispatchEvent(new Event('user-logged-out'));
          window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { user: null, isAuthenticated: false }
          }));
          
        } catch (storageError) {
          console.warn('⚠️ [AuthContext] Storage cleanup error:', storageError);
        }
      }
      
      // Step 4: Sign out via NextAuth (this clears the session cookie)
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
          router.refresh(); // Force refresh to update server components
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
      
      // Force redirect on error
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
      
      // Call your API to update user data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }
      
      // Update session with new data
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

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    if (!user?.role || !Array.isArray(roles)) return false;
    return roles.includes(user.role);
  }, [user]);

  // ✅ FIXED: Check if user is active based on status, not virtual isActive
  const isActive = useMemo(() => {
    return user?.status === 'active';
  }, [user]);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return user?.role === 'admin';
  }, [user]);

  // Check if user is manager or admin
  const isManagerOrAdmin = useMemo(() => {
    return ['admin', 'manager'].includes(user?.role);
  }, [user]);

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

  // Get user permissions (extend based on your permission system)
  const getPermissions = useCallback(() => {
    if (!user) return [];
    
    // Permission mapping based on role (extend as needed)
    const permissionMap = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'view_analytics', 'manage_products'],
      manager: ['read', 'write', 'manage_orders', 'view_reports', 'manage_inventory'],
      user: ['read', 'write_own', 'view_profile'],
    };
    
    return permissionMap[user.role] || ['read'];
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    const permissions = getPermissions();
    return permissions.includes(permission);
  }, [getPermissions]);

  // ✅ FIXED: Handle route protection with proper status checks
  useEffect(() => {
    if (loading || !authChecked) return;

    const handleRouteProtection = () => {
      // Define public paths that don't require authentication
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
        '/account-inactive', // ✅ Add page for inactive accounts
        '/account-suspended', // ✅ Add page for suspended accounts
        '/account-pending', // ✅ Add page for pending verification
      ];

      const isPublicPath = publicPaths.some(path => 
        pathname === path || pathname?.startsWith(`${path}/`)
      );

      // If user is not authenticated and trying to access protected route
      if (!isAuthenticated && !isPublicPath) {
        console.log('🔄 [AuthContext] Redirecting unauthenticated user to login from:', pathname);
        const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
        return;
      }

      // If user is authenticated but trying to access auth pages
      if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
        console.log('🔄 [AuthContext] Redirecting authenticated user from auth page:', pathname);
        const redirectPath = user.role === 'admin' 
          ? '/admin/dashboards' 
          : user.role === 'manager' 
            ? '/manager/dashboard' 
            : '/dashboard';
        router.push(redirectPath);
        return;
      }

      // ✅ FIXED: Check account status and redirect appropriately
      if (isAuthenticated) {
        // Handle different account statuses
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
          // Force logout for deleted accounts
          logout({ notifyOtherTabs: true });
          router.push('/login?error=account_deleted');
          return;
        }

        // Role-based route protection (only for active accounts)
        if (user.status === 'active') {
          // Admin routes require admin role
          if (pathname?.startsWith('/admin') && !user.isAdmin) {
            console.log('⛔ [AuthContext] Non-admin user attempting to access admin route:', pathname);
            router.push('/dashboard');
            return;
          }

          // Manager routes require manager or admin role
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

  // Monitor session activity (optional for session extension)
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin || user.status !== 'active') return;

    let activityTimer;
    
    const handleUserActivity = () => {
      // Clear existing timer
      if (activityTimer) clearTimeout(activityTimer);
      
      // Set new timer to update last activity
      activityTimer = setTimeout(async () => {
        try {
          // Optional: Update last activity in database for admin users
          await fetch('/api/user/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          }).catch(err => console.debug('Activity update failed:', err));
        } catch (error) {
          // Silent fail for activity tracking
        }
      }, 60000); // Update every minute of activity
    };

    // Track user activity events
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
  }, [isAuthenticated, user]);

  // Context value
  const contextValue = useMemo(() => ({
    // Authentication state
    user,
    isAuthenticated,
    loading: loading || sessionStatus === 'loading',
    authChecked,
    
    // Authentication methods
    login,
    logout,
    updateUser,
    refreshSession,
    
    // Role and permission checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isManagerOrAdmin,
    hasPermission,
    getPermissions,
    
    // ✅ Account status helpers
    isActive, // ✅ Derived from status, not stored in DB
    accountStatus: user?.status || 'unknown', // ✅ Direct status from DB
    
    // NextAuth session (for advanced use cases)
    session,
    sessionStatus,
    
    // Helper methods
    checkAuth: () => updateSession(),
    
    // Compatibility aliases
    signIn: login,
    signOut: logout,
    
    // Utility functions
    requireAuth: (requiredRole = null) => {
      if (!isAuthenticated) return { authorized: false, error: 'Not authenticated' };
      if (user.status !== 'active') return { 
        authorized: false, 
        error: `Account is ${user.status}`,
        status: user.status 
      };
      if (!user.isVerified) return { authorized: false, error: 'Email not verified' };
      if (requiredRole && user.role !== requiredRole) {
        return { authorized: false, error: `Required role: ${requiredRole}` };
      }
      return { authorized: true, user };
    },
    
    // Check if current user can access a specific route
    canAccessRoute: (route) => {
      if (!isAuthenticated) return false;
      if (user.status !== 'active') return false; // ✅ Only active users can access routes
      if (route.startsWith('/admin') && !isAdmin) return false;
      if (route.startsWith('/manager') && !isManagerOrAdmin) return false;
      return true;
    }
  }), [
    user,
    isAuthenticated,
    loading,
    authChecked,
    sessionStatus,
    login,
    logout,
    updateUser,
    refreshSession,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManagerOrAdmin,
    hasPermission,
    getPermissions,
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
    requireActive = true // ✅ Add option to require active account
  } = options;
  
  return function WithAuthWrapper(props) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (loading) return;

      if (!isAuthenticated) {
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      // ✅ Check if account is active
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

      if (requiredRole && user?.role !== requiredRole) {
        console.warn(`User role ${user?.role} does not match required role ${requiredRole}`);
        router.push('/dashboard');
        return;
      }
    }, [loading, isAuthenticated, user, requiredRole, router, pathname, requireVerified, requireActive]);

    if (loading || !isAuthenticated || (requiredRole && user?.role !== requiredRole) || 
        (requireVerified && user && !user.isVerified) ||
        (requireActive && user && user.status !== 'active')) {
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

// Hook for protected API calls with automatic token refresh
export function useProtectedFetch() {
  const { user, refreshSession, logout } = useAuth();
  
  const protectedFetch = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          // Add any authentication headers here if needed
        },
      });

      // Handle 401 Unauthorized - refresh session or logout
      if (response.status === 401) {
        console.log('🔄 [useProtectedFetch] Session expired, attempting refresh');
        const refreshResult = await refreshSession();
        
        if (!refreshResult.success) {
          // Refresh failed, trigger logout
          await logout();
          throw new Error('Session expired. Please log in again.');
        }
        
        // Retry the request once with refreshed session
        return await fetch(url, options);
      }

      // Handle 403 Forbidden (insufficient permissions)
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'You do not have permission to perform this action.');
      }

      return response;
    } catch (error) {
      console.error('❌ [useProtectedFetch] Request failed:', error);
      throw error;
    }
  }, [refreshSession, logout]);

  return protectedFetch;
}

// Hook to check if user can access a specific route
export function useRouteAccess() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const canAccessRoute = useCallback((route) => {
    if (!isAuthenticated || !user) return false;
    if (user.status !== 'active') return false; // ✅ Only active users can access routes
    
    if (route.startsWith('/admin')) {
      return user.role === 'admin';
    }
    
    if (route.startsWith('/manager')) {
      return ['admin', 'manager'].includes(user.role);
    }
    
    return true;
  }, [isAuthenticated, user]);
  
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
