



// "use client";

// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   requestNotificationPermission,
//   getFCMToken,
//   saveTokenToBackend,
//   setupForegroundMessageListener,
//   getTokenStatus,
//   refreshFCMToken,
//   isNotificationSupported,
//   getNotificationPermission,
//   DeviceInfo,
// } from '@/lib/firebase/fcm-token-service';
// import { useAuth } from "../../context/AuthContext"; // ✅ Using new AuthContext
// import { useNotification } from "../../hooks/useNotification";

// const FCMTokenManager = ({ onInitialized }) => {
//   // ✅ Using new NextAuth-based AuthContext
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const { showNotification } = useNotification();
  
//   const [token, setToken] = useState(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [permissionStatus, setPermissionStatus] = useState('default');
//   const [isLoading, setIsLoading] = useState(false);
//   const [deviceInfo, setDeviceInfo] = useState({});
//   const [status, setStatus] = useState({});
  
//   // Refs to prevent multiple initializations
//   const unsubscribeRef = useRef(null);
//   const initAttemptedRef = useRef(false);
//   const isMountedRef = useRef(true);
//   const tokenSaveAttemptRef = useRef(false);
//   const retryCountRef = useRef(0);
//   const maxRetries = 3;

//   // Get comprehensive device info - memoized
//   const getDeviceInfo = useCallback(() => {
//     return DeviceInfo.getBasicInfo();
//   }, []);

//   // Handle foreground messages
//   const handleForegroundMessage = useCallback((payload) => {
//     console.log('📨 FCM Message received in manager:', payload);
    
//     // Extract notification data
//     const notificationData = payload.data || payload.notification;
    
//     if (notificationData) {
//       showNotification(
//         notificationData.title || 'New Notification',
//         notificationData.body || '',
//         'info',
//         5000
//       );
//     }
//   }, [showNotification]);

//   // ✅ UPDATED: Save token with proper NextAuth integration
//   const saveTokenWithThrottling = useCallback(async (fcmToken, deviceData) => {
//     if (tokenSaveAttemptRef.current) {
//       console.log('⏭️ Token save already in progress, skipping');
//       return { 
//         success: false, 
//         error: 'save_in_progress', 
//         message: 'Token save already in progress',
//         skipped: true 
//       };
//     }
    
//     tokenSaveAttemptRef.current = true;
    
//     try {
//       console.log('📤 Attempting to save token to backend...');
      
//       // ✅ FIXED: Use user from NextAuth context instead of localStorage
//       if (!user || !isAuthenticated) {
//         console.warn('⚠️ User not authenticated, cannot save FCM token');
//         return { 
//           success: false, 
//           error: 'User not authenticated',
//           requiresAuth: true
//         };
//       }
      
//       const saveResult = await saveTokenToBackend(fcmToken, {
//         userId: user.id,
//         userEmail: user.email,
//         userRole: user.role || 'admin',
//         userName: user.name || user.email?.split('@')[0],
//         isVerified: user.isVerified || false,
//         deviceInfo: deviceData,
//         setupTimestamp: new Date().toISOString(),
//         authProvider: 'nextauth', // ✅ Indicate we're using NextAuth
//       });
      
//       console.log('✅ Token saved to backend:', saveResult);
//       return saveResult;
//     } catch (error) {
//       console.error('❌ Failed to save token:', error);
//       return { 
//         success: false, 
//         error: error.message,
//         requiresAuth: error.message?.includes('auth') || 
//                      error.message?.includes('unauthorized') ||
//                      error.message?.includes('401') ||
//                      error.message?.includes('403')
//       };
//     } finally {
//       // Reset after a delay to prevent rapid retries
//       setTimeout(() => {
//         tokenSaveAttemptRef.current = false;
//       }, 2000);
//     }
//   }, [user, isAuthenticated]); // ✅ Updated dependencies

//   // ✅ UPDATED: Initialize FCM with NextAuth checks
//   const initFCM = useCallback(async () => {
//     // Prevent multiple initialization attempts
//     if (initAttemptedRef.current || !isMountedRef.current) {
//       console.log('⏭️ Initialization already attempted or component unmounted');
//       return;
//     }
    
//     initAttemptedRef.current = true;
    
//     try {
//       setIsLoading(true);
      
//       // ✅ Check if user is authenticated
//       if (!isAuthenticated || !user) {
//         console.warn('User not authenticated, skipping FCM initialization');
//         if (isMountedRef.current) {
//           setIsInitialized(false);
//           setIsLoading(false);
//           onInitialized?.({
//             success: false,
//             error: 'not_authenticated',
//             permission: 'denied',
//             requiresAuth: true,
//             timestamp: new Date().toISOString(),
//           });
//         }
//         return;
//       }
      
//       // ✅ Check if user is admin
//       if (user.role !== 'admin') {
//         console.log('User is not admin, skipping FCM initialization');
//         if (isMountedRef.current) {
//           setIsInitialized(false);
//           setIsLoading(false);
//           onInitialized?.({
//             success: false,
//             error: 'not_admin',
//             permission: 'denied',
//             timestamp: new Date().toISOString(),
//           });
//         }
//         return;
//       }
      
//       // Check if browser supports notifications
//       if (!isNotificationSupported()) {
//         console.warn('Browser does not support notifications');
//         if (isMountedRef.current) {
//           showNotification(
//             'Notifications Unavailable',
//             'Your browser does not support push notifications.',
//             'warning',
//             5000
//           );
//           setIsInitialized(true);
//           setIsLoading(false);
//           onInitialized?.({
//             success: false,
//             error: 'not_supported',
//             permission: 'unsupported',
//             timestamp: new Date().toISOString(),
//           });
//         }
//         return;
//       }

//       // Get current permission status
//       const currentPermission = getNotificationPermission();
//       if (isMountedRef.current) {
//         setPermissionStatus(currentPermission);
//       }

//       // Check permission and request if needed
//       if (currentPermission === 'default') {
//         // Show custom prompt before requesting browser permission
//         const userConsent = window.confirm(
//           'Enable notifications to receive real-time updates about orders and activities.\n\n' +
//           'You will receive notifications for:\n' +
//           '• New orders\n' +
//           '• Payment confirmations\n' +
//           '• Order status updates\n' +
//           '• Low stock alerts'
//         );
        
//         if (!userConsent) {
//           if (isMountedRef.current) {
//             setIsInitialized(true);
//             setIsLoading(false);
//             onInitialized?.({
//               success: false,
//               error: 'user_denied',
//               permission: 'denied',
//               timestamp: new Date().toISOString(),
//             });
//           }
//           return;
//         }
//       }

//       // Request permission
//       const hasPermission = await requestNotificationPermission({
//         silent: true,
//         showCustomPrompt: null
//       });

//       if (isMountedRef.current) {
//         setPermissionStatus(getNotificationPermission());
//       }

//       if (hasPermission) {
//         // Get device information
//         const deviceData = getDeviceInfo();
//         if (isMountedRef.current) {
//           setDeviceInfo(deviceData);
//         }

//         // Get FCM token
//         const fcmToken = await getFCMToken();
        
//         if (fcmToken) {
//           if (isMountedRef.current) {
//             setToken(fcmToken);
//           }

//           // Save token to backend with throttling
//           const saveResult = await saveTokenWithThrottling(fcmToken, deviceData);
//           console.log('📊 Token save result:', saveResult);
          
//           // Handle authentication errors
//           if (saveResult.requiresAuth) {
//             retryCountRef.current++;
            
//             if (retryCountRef.current <= maxRetries) {
//               console.log(`🔄 Authentication error, waiting to retry (${retryCountRef.current}/${maxRetries})...`);
//               // Wait and retry
//               setTimeout(() => {
//                 if (isMountedRef.current) {
//                   initAttemptedRef.current = false;
//                   initFCM();
//                 }
//               }, 3000);
//               return;
//             } else {
//               console.error('Max retries reached for authentication');
//               showNotification(
//                 'Authentication Required',
//                 'Please log in again to enable notifications.',
//                 'warning',
//                 5000
//               );
//             }
//           }
          
//           // Setup foreground message listener if save was successful
//           if (saveResult.success && !saveResult.skipped) {
//             unsubscribeRef.current = setupForegroundMessageListener({
//               onMessageReceived: handleForegroundMessage,
//               showDefaultNotification: true,
//               notificationOptions: {
//                 icon: '/favicon.ico',
//                 badge: '/favicon.ico',
//                 requireInteraction: false,
//               },
//             });

//             // Get complete status
//             const tokenStatus = await getTokenStatus();
//             if (isMountedRef.current) {
//               setStatus(tokenStatus);
//             }
//           }
          
//           // Call onInitialized callback
//           if (isMountedRef.current) {
//             setIsInitialized(saveResult.success || saveResult.skipped);
//             setIsLoading(false);
//             onInitialized?.({
//               success: saveResult.success || saveResult.skipped,
//               token: fcmToken,
//               saveResult,
//               deviceInfo: deviceData,
//               permission: 'granted',
//               timestamp: new Date().toISOString(),
//             });
//           }
          
//           // Show success notification if save was actually successful
//           if (saveResult.success && !saveResult.skipped && !saveResult.requiresAuth) {
//             showNotification(
//               'Notifications Enabled ✅',
//               'You will now receive real-time updates for new orders and activities.',
//               'success',
//               3000
//             );
//           } else if (saveResult.skipped) {
//             console.log('Token save was skipped (already in progress)');
//           }
//         } else {
//           // No token obtained
//           if (isMountedRef.current) {
//             setIsInitialized(false);
//             setIsLoading(false);
//             onInitialized?.({
//               success: false,
//               error: 'No FCM token obtained',
//               deviceInfo: deviceData,
//               permission: 'granted',
//               timestamp: new Date().toISOString(),
//             });
            
//             showNotification(
//               'Token Error',
//               'Could not get notification token. Please try again.',
//               'error',
//               5000
//             );
//           }
//         }
        
//         console.log('✅ FCM Token Manager initialized successfully');
//       } else {
//         // Permission denied
//         if (isMountedRef.current) {
//           showNotification(
//             'Notifications Disabled',
//             'Please enable notifications in browser settings to receive updates.',
//             'warning',
//             5000
//           );
          
//           setIsInitialized(true);
//           setIsLoading(false);
//           onInitialized?.({
//             success: false,
//             error: 'permission_denied',
//             permission: 'denied',
//             timestamp: new Date().toISOString(),
//           });
//         }
//       }
//     } catch (error) {
//       console.error('❌ FCM initialization error:', error);
      
//       if (isMountedRef.current) {
//         showNotification(
//           'Notification Setup Failed',
//           error.message || 'Could not setup notifications.',
//           'error',
//           5000
//         );
        
//         setIsInitialized(false);
//         setIsLoading(false);
//         onInitialized?.({
//           success: false,
//           error: error.message,
//           permission: permissionStatus,
//           timestamp: new Date().toISOString(),
//         });
//       }
//     }
//   }, [
//     getDeviceInfo, 
//     handleForegroundMessage, 
//     onInitialized, 
//     saveTokenWithThrottling, 
//     showNotification, 
//     isAuthenticated, 
//     user
//   ]); // ✅ Updated dependencies

//   // ✅ UPDATED: Main initialization effect with NextAuth checks
//   useEffect(() => {
//     isMountedRef.current = true;
//     initAttemptedRef.current = false;
//     retryCountRef.current = 0;
    
//     // Only initialize when:
//     // 1. Component is mounted
//     // 2. Auth is not loading
//     // 3. User is authenticated
//     // 4. User is admin
//     // 5. Component hasn't been initialized yet
//     // 6. Not already attempting initialization
//     if (
//       !authLoading && 
//       isAuthenticated && 
//       user && 
//       user.role === 'admin' && 
//       !isInitialized && 
//       !initAttemptedRef.current
//     ) {
//       // Small delay to ensure everything is ready
//       const timer = setTimeout(() => {
//         if (isMountedRef.current && !initAttemptedRef.current) {
//           console.log('🚀 Starting FCM initialization for admin user:', {
//             email: user.email,
//             role: user.role,
//             isVerified: user.isVerified
//           });
//           initFCM();
//         }
//       }, 2000); // Increased delay for better initialization

//       return () => clearTimeout(timer);
//     } else if (authLoading) {
//       console.log('⏳ Waiting for authentication to complete...');
//     } else if (!isAuthenticated) {
//       console.log('🔒 User not authenticated, skipping FCM initialization');
//     } else if (user && user.role !== 'admin') {
//       console.log('⛔ User is not admin, skipping FCM initialization');
//     }

//     return () => {
//       isMountedRef.current = false;
      
//       if (unsubscribeRef.current) {
//         unsubscribeRef.current();
//       }
//     };
//   }, [user, isInitialized, initFCM, authLoading, isAuthenticated]); // ✅ Updated dependencies

//   // Manually request permission
//   const handleRequestPermission = async () => {
//     try {
//       // ✅ Check authentication first
//       if (!isAuthenticated || !user) {
//         showNotification(
//           'Authentication Required',
//           'Please log in to enable notifications.',
//           'warning',
//           5000
//         );
//         return;
//       }
      
//       setIsLoading(true);
//       const granted = await requestNotificationPermission({
//         silent: false, // Show browser prompt
//       });
      
//       if (isMountedRef.current) {
//         setPermissionStatus(getNotificationPermission());
//       }
      
//       if (granted) {
//         const fcmToken = await getFCMToken();
//         if (fcmToken) {
//           if (isMountedRef.current) {
//             setToken(fcmToken);
//           }
          
//           const saveResult = await saveTokenWithThrottling(fcmToken, deviceInfo);
          
//           if (saveResult.success && !saveResult.skipped) {
//             showNotification(
//               'Notifications Enabled ✅',
//               'You will now receive real-time updates.',
//               'success',
//               3000
//             );
//           } else if (saveResult.requiresAuth) {
//             showNotification(
//               'Authentication Error',
//               'Please log in again to save notification token.',
//               'warning',
//               5000
//             );
//           }
//         }
//       } else {
//         showNotification(
//           'Permission Denied',
//           'Notifications were not enabled. You can enable them in browser settings.',
//           'warning',
//           5000
//         );
//       }
//     } catch (error) {
//       console.error('Error requesting permission:', error);
//       showNotification(
//         'Permission Error',
//         'Could not enable notifications: ' + error.message,
//         'error',
//         5000
//       );
//     } finally {
//       if (isMountedRef.current) {
//         setIsLoading(false);
//       }
//     }
//   };

//   // Manual token refresh
//   const handleRefreshToken = async () => {
//     try {
//       // ✅ Check authentication first
//       if (!isAuthenticated || !user) {
//         showNotification(
//           'Authentication Required',
//           'Please log in to refresh notification token.',
//           'warning',
//           5000
//         );
//         return;
//       }
      
//       setIsLoading(true);
//       const result = await refreshFCMToken();
      
//       if (result?.token) {
//         if (isMountedRef.current) {
//           setToken(result.token);
//         }
        
//         // Update status
//         const tokenStatus = await getTokenStatus();
//         if (isMountedRef.current) {
//           setStatus(tokenStatus);
//         }
        
//         // Save the new token
//         const saveResult = await saveTokenWithThrottling(result.token, deviceInfo);
        
//         if (saveResult.success) {
//           showNotification(
//             'Token Refreshed ✅',
//             'Notification token has been updated.',
//             'success',
//             3000
//           );
//         }
//       } else if (result?.refreshSkipped) {
//         showNotification(
//           'Token Already Fresh',
//           'Token was recently refreshed, no update needed.',
//           'info',
//           3000
//         );
//       }
//     } catch (error) {
//       console.error('Error refreshing token:', error);
//       showNotification(
//         'Refresh Failed',
//         'Could not refresh notification token: ' + error.message,
//         'error',
//         5000
//       );
//     } finally {
//       if (isMountedRef.current) {
//         setIsLoading(false);
//       }
//     }
//   };

//   // Get debug info
//   const getDebugInfo = () => {
//     return {
//       initialized: isInitialized,
//       permission: permissionStatus,
//       hasToken: !!token,
//       tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
//       device: deviceInfo.deviceName || deviceInfo.deviceType || 'Unknown',
//       browser: deviceInfo.browser || 'Unknown',
//       isLoading,
//       userInfo: user ? {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         isAuthenticated,
//         isVerified: user.isVerified
//       } : 'No user',
//       authLoading,
//       ...status,
//     };
//   };

//   // Handle re-authentication
//   const handleReauth = () => {
//     console.log('🔄 Re-authenticating and retrying token save...');
//     setIsInitialized(false);
//     initAttemptedRef.current = false;
//     retryCountRef.current = 0;
    
//     // Wait for auth state to update, then retry
//     setTimeout(() => {
//       if (isMountedRef.current) {
//         initFCM();
//       }
//     }, 2000);
//   };

//   // Don't render anything if not admin or not authenticated
//   if (!user || user.role !== 'admin' || !isAuthenticated) {
//     if (process.env.NODE_ENV === 'development') {
//       console.log('FCMTokenManager not rendering:', {
//         hasUser: !!user,
//         role: user?.role,
//         isAuthenticated,
//         isAdmin: user?.role === 'admin'
//       });
//     }
//     return null;
//   }

//   // Only render debug info in development
//   const isDev = process.env.NODE_ENV === 'development';

//   return (
//     <div className="hidden">
//       {/* Hidden component that manages FCM tokens */}
//       {isDev && (
//         <div className="fixed bottom-20 left-2 z-50 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg max-w-xs border border-gray-700 shadow-xl">
//           <div className="font-bold mb-2 text-sm flex items-center justify-between">
//             <span>🔔 FCM Debug Panel</span>
//             <button 
//               onClick={() => {
//                 console.log('FCM Debug Info:', getDebugInfo());
//                 console.log('User from AuthContext:', user);
//               }}
//               className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
//             >
//               Log Info
//             </button>
//           </div>
          
//           <div className="space-y-2">
//             <div className="flex justify-between">
//               <span>Auth Status:</span>
//               <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
//                 {isAuthenticated ? '✅ Authenticated' : '❌ Not Auth'}
//               </span>
//             </div>
            
//             <div className="flex justify-between">
//               <span>User Role:</span>
//               <span className={user.role === 'admin' ? 'text-green-400' : 'text-yellow-400'}>
//                 {user.role || 'none'}
//               </span>
//             </div>
            
//             <div className="flex justify-between">
//               <span>FCM Status:</span>
//               <span className={isInitialized ? 'text-green-400' : 'text-yellow-400'}>
//                 {isInitialized ? '✅ Ready' : '🔄 Initializing'}
//               </span>
//             </div>
            
//             <div className="flex justify-between">
//               <span>Permission:</span>
//               <span className={
//                 permissionStatus === 'granted' ? 'text-green-400' : 
//                 permissionStatus === 'denied' ? 'text-red-400' : 'text-yellow-400'
//               }>
//                 {permissionStatus}
//               </span>
//             </div>
            
//             <div className="flex justify-between">
//               <span>Token:</span>
//               <span className={token ? 'text-green-400' : 'text-red-400'}>
//                 {token ? '✅ Present' : '❌ Missing'}
//               </span>
//             </div>
            
//             <div className="pt-2 space-y-2 border-t border-gray-700">
//               {permissionStatus !== 'granted' && (
//                 <button 
//                   onClick={handleRequestPermission}
//                   className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Processing...' : '🔔 Enable Notifications'}
//                 </button>
//               )}
              
//               {token && (
//                 <button 
//                   onClick={handleRefreshToken}
//                   className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Refreshing...' : '🔄 Refresh Token'}
//                 </button>
//               )}
              
//               {status.error && status.error.includes('auth') && (
//                 <button 
//                   onClick={handleReauth}
//                   className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium transition-colors"
//                 >
//                   🔑 Re-authenticate
//                 </button>
//               )}
//             </div>
            
//             {token && (
//               <div className="mt-2 p-2 bg-gray-800 rounded text-xs break-all">
//                 <div className="text-gray-400 mb-1">Token Preview:</div>
//                 <div className="font-mono">{token.substring(0, 30)}...</div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
      
//       {/* Production - completely hidden but functional */}
//       <div className="sr-only" aria-live="polite">
//         Notifications: {permissionStatus === 'granted' ? 'Enabled' : 'Disabled'}
//         {token && ', Token: Present'}
//         {!token && ', Token: Not available'}
//       </div>
//     </div>
//   );
// };

// export default FCMTokenManager;
















"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  requestNotificationPermission,
  getFCMToken,
  saveTokenToBackend,
  setupForegroundMessageListener,
  getTokenStatus,
  refreshFCMToken,
  isNotificationSupported,
  getNotificationPermission,
  DeviceInfo,
} from '@/lib/firebase/fcm-token-service';
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../hooks/useNotification";

const FCMTokenManager = ({ onInitialized }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [status, setStatus] = useState({});
  
  // Refs to prevent multiple initializations
  const unsubscribeRef = useRef(null);
  const initAttemptedRef = useRef(false);
  const isMountedRef = useRef(true);
  const tokenSaveAttemptRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Get comprehensive device info
  const getDeviceInfo = useCallback(() => {
    return DeviceInfo.getBasicInfo();
  }, []);

  // Handle foreground messages
  const handleForegroundMessage = useCallback((payload) => {
    console.log('📨 FCM Message received in manager:', payload);
    
    const notificationData = payload.data || payload.notification;
    
    if (notificationData) {
      showNotification(
        notificationData.title || 'New Notification',
        notificationData.body || '',
        'info',
        5000
      );
    }
  }, [showNotification]);

  // ✅ FIXED: Save token with companyId and proper user structure
  const saveTokenWithThrottling = useCallback(async (fcmToken, deviceData) => {
    if (tokenSaveAttemptRef.current) {
      console.log('⏭️ Token save already in progress, skipping');
      return { 
        success: false, 
        error: 'save_in_progress', 
        message: 'Token save already in progress',
        skipped: true 
      };
    }
    
    tokenSaveAttemptRef.current = true;
    
    try {
      console.log('📤 Attempting to save token to backend...');
      
      if (!user || !isAuthenticated) {
        console.warn('⚠️ User not authenticated, cannot save FCM token');
        return { 
          success: false, 
          error: 'User not authenticated',
          requiresAuth: true
        };
      }

      // ✅ CRITICAL: Extract companyId from user object
      // This depends on how your AuthContext structures the user
      // Common patterns:
      const companyId = user.companyId || user.company_id || user.company?.id;
      
      if (!companyId) {
        console.error('❌ No companyId found in user object:', user);
        return {
          success: false,
          error: 'Company ID not found',
          requiresAuth: true
        };
      }
      
      const saveResult = await saveTokenToBackend(fcmToken, {
        // User info
        userId: user.id,
        userEmail: user.email,
        userRole: user.role || 'admin',
        userName: user.name || user.email?.split('@')[0],
        isVerified: user.isVerified || false,
        
        // ✅ CRITICAL: Add companyId for SaaS multi-tenancy
        companyId: companyId,
        
        // Device info
        deviceInfo: deviceData,
        setupTimestamp: new Date().toISOString(),
        authProvider: 'nextauth',
        
        // Additional metadata for debugging
        metadata: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      });
      
      console.log('✅ Token saved to backend:', saveResult);
      return saveResult;
    } catch (error) {
      console.error('❌ Failed to save token:', error);
      return { 
        success: false, 
        error: error.message,
        requiresAuth: error.message?.includes('auth') || 
                     error.message?.includes('unauthorized') ||
                     error.message?.includes('401') ||
                     error.message?.includes('403') ||
                     error.message?.includes('company') // ✅ Add company error check
      };
    } finally {
      setTimeout(() => {
        tokenSaveAttemptRef.current = false;
      }, 2000);
    }
  }, [user, isAuthenticated]);

  // ✅ FIXED: Initialize FCM with company check
  const initFCM = useCallback(async () => {
    if (initAttemptedRef.current || !isMountedRef.current) {
      console.log('⏭️ Initialization already attempted or component unmounted');
      return;
    }
    
    initAttemptedRef.current = true;
    
    try {
      setIsLoading(true);
      
      // Check authentication
      if (!isAuthenticated || !user) {
        console.warn('User not authenticated, skipping FCM initialization');
        if (isMountedRef.current) {
          setIsInitialized(false);
          setIsLoading(false);
          onInitialized?.({
            success: false,
            error: 'not_authenticated',
            permission: 'denied',
            requiresAuth: true,
            timestamp: new Date().toISOString(),
          });
        }
        return;
      }
      
      // Check if user is admin
      if (user.role !== 'admin') {
        console.log('User is not admin, skipping FCM initialization');
        if (isMountedRef.current) {
          setIsInitialized(false);
          setIsLoading(false);
          onInitialized?.({
            success: false,
            error: 'not_admin',
            permission: 'denied',
            timestamp: new Date().toISOString(),
          });
        }
        return;
      }

      // ✅ NEW: Check for companyId
      const companyId = user.companyId || user.company_id || user.company?.id;
      if (!companyId) {
        console.error('❌ Company ID missing for admin user:', user);
        showNotification(
          'Company Information Missing',
          'Please contact support to set up your company profile.',
          'error',
          5000
        );
        if (isMountedRef.current) {
          setIsInitialized(false);
          setIsLoading(false);
          onInitialized?.({
            success: false,
            error: 'company_id_missing',
            permission: 'denied',
            timestamp: new Date().toISOString(),
          });
        }
        return;
      }
      
      // Check browser support
      if (!isNotificationSupported()) {
        console.warn('Browser does not support notifications');
        if (isMountedRef.current) {
          showNotification(
            'Notifications Unavailable',
            'Your browser does not support push notifications.',
            'warning',
            5000
          );
          setIsInitialized(true);
          setIsLoading(false);
          onInitialized?.({
            success: false,
            error: 'not_supported',
            permission: 'unsupported',
            timestamp: new Date().toISOString(),
          });
        }
        return;
      }

      // Get current permission status
      const currentPermission = getNotificationPermission();
      if (isMountedRef.current) {
        setPermissionStatus(currentPermission);
      }

      // Check permission
      if (currentPermission === 'default') {
        const userConsent = window.confirm(
          'Enable notifications to receive real-time updates about orders and activities.\n\n' +
          'You will receive notifications for:\n' +
          '• New orders\n' +
          '• Payment confirmations\n' +
          '• Order status updates\n' +
          '• Low stock alerts'
        );
        
        if (!userConsent) {
          if (isMountedRef.current) {
            setIsInitialized(true);
            setIsLoading(false);
            onInitialized?.({
              success: false,
              error: 'user_denied',
              permission: 'denied',
              timestamp: new Date().toISOString(),
            });
          }
          return;
        }
      }

      // Request permission
      const hasPermission = await requestNotificationPermission({
        silent: true,
        showCustomPrompt: null
      });

      if (isMountedRef.current) {
        setPermissionStatus(getNotificationPermission());
      }

      if (hasPermission) {
        // Get device information
        const deviceData = getDeviceInfo();
        if (isMountedRef.current) {
          setDeviceInfo(deviceData);
        }

        // Get FCM token
        const fcmToken = await getFCMToken();
        
        if (fcmToken) {
          if (isMountedRef.current) {
            setToken(fcmToken);
          }

          // Save token to backend with companyId
          const saveResult = await saveTokenWithThrottling(fcmToken, deviceData);
          console.log('📊 Token save result:', saveResult);
          
          // Handle errors
          if (saveResult.requiresAuth) {
            retryCountRef.current++;
            
            if (retryCountRef.current <= maxRetries) {
              console.log(`🔄 Authentication error, waiting to retry (${retryCountRef.current}/${maxRetries})...`);
              setTimeout(() => {
                if (isMountedRef.current) {
                  initAttemptedRef.current = false;
                  initFCM();
                }
              }, 3000);
              return;
            } else {
              console.error('Max retries reached for authentication');
              showNotification(
                'Authentication Required',
                'Please log in again to enable notifications.',
                'warning',
                5000
              );
            }
          }
          
          // Setup foreground message listener if save was successful
          if (saveResult.success && !saveResult.skipped) {
            unsubscribeRef.current = setupForegroundMessageListener({
              onMessageReceived: handleForegroundMessage,
              showDefaultNotification: true,
              notificationOptions: {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                requireInteraction: false,
              },
            });

            const tokenStatus = await getTokenStatus();
            if (isMountedRef.current) {
              setStatus(tokenStatus);
            }
          }
          
          // Call onInitialized callback
          if (isMountedRef.current) {
            setIsInitialized(saveResult.success || saveResult.skipped);
            setIsLoading(false);
            onInitialized?.({
              success: saveResult.success || saveResult.skipped,
              token: fcmToken,
              saveResult,
              deviceInfo: deviceData,
              permission: 'granted',
              companyId: companyId,
              timestamp: new Date().toISOString(),
            });
          }
          
          if (saveResult.success && !saveResult.skipped && !saveResult.requiresAuth) {
            showNotification(
              'Notifications Enabled ✅',
              'You will now receive real-time updates for new orders and activities.',
              'success',
              3000
            );
          }
        } else {
          if (isMountedRef.current) {
            setIsInitialized(false);
            setIsLoading(false);
            onInitialized?.({
              success: false,
              error: 'No FCM token obtained',
              deviceInfo: deviceData,
              permission: 'granted',
              timestamp: new Date().toISOString(),
            });
            
            showNotification(
              'Token Error',
              'Could not get notification token. Please try again.',
              'error',
              5000
            );
          }
        }
      } else {
        if (isMountedRef.current) {
          showNotification(
            'Notifications Disabled',
            'Please enable notifications in browser settings to receive updates.',
            'warning',
            5000
          );
          
          setIsInitialized(true);
          setIsLoading(false);
          onInitialized?.({
            success: false,
            error: 'permission_denied',
            permission: 'denied',
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('❌ FCM initialization error:', error);
      
      if (isMountedRef.current) {
        showNotification(
          'Notification Setup Failed',
          error.message || 'Could not setup notifications.',
          'error',
          5000
        );
        
        setIsInitialized(false);
        setIsLoading(false);
        onInitialized?.({
          success: false,
          error: error.message,
          permission: permissionStatus,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [
    getDeviceInfo, 
    handleForegroundMessage, 
    onInitialized, 
    saveTokenWithThrottling, 
    showNotification, 
    isAuthenticated, 
    user,
    permissionStatus
  ]);

  // ✅ FIXED: Main initialization effect with company check
  useEffect(() => {
    isMountedRef.current = true;
    initAttemptedRef.current = false;
    retryCountRef.current = 0;
    
    // Log user structure for debugging
    if (process.env.NODE_ENV === 'development' && user) {
      console.log('👤 User object structure:', {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        company_id: user.company_id,
        company: user.company,
        hasCompanyId: !!(user.companyId || user.company_id || user.company?.id)
      });
    }
    
    // Only initialize when:
    if (
      !authLoading && 
      isAuthenticated && 
      user && 
      user.role === 'admin' && 
      !isInitialized && 
      !initAttemptedRef.current
    ) {
      // ✅ Check for companyId before initializing
      const companyId = user.companyId || user.company_id || user.company?.id;
      if (!companyId) {
        console.warn('⏳ User authenticated but companyId missing, waiting...');
        // Don't initialize yet - maybe company data loads later
        return;
      }
      
      const timer = setTimeout(() => {
        if (isMountedRef.current && !initAttemptedRef.current) {
          console.log('🚀 Starting FCM initialization for admin user:', {
            email: user.email,
            role: user.role,
            companyId: companyId
          });
          initFCM();
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else if (authLoading) {
      console.log('⏳ Waiting for authentication to complete...');
    } else if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping FCM initialization');
    } else if (user && user.role !== 'admin') {
      console.log('⛔ User is not admin, skipping FCM initialization');
    }

    return () => {
      isMountedRef.current = false;
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, isInitialized, initFCM, authLoading, isAuthenticated]);

  // Manual request permission
  const handleRequestPermission = async () => {
    try {
      if (!isAuthenticated || !user) {
        showNotification(
          'Authentication Required',
          'Please log in to enable notifications.',
          'warning',
          5000
        );
        return;
      }

      // ✅ Check companyId
      const companyId = user.companyId || user.company_id || user.company?.id;
      if (!companyId) {
        showNotification(
          'Company Setup Required',
          'Your company profile needs to be set up first.',
          'warning',
          5000
        );
        return;
      }
      
      setIsLoading(true);
      const granted = await requestNotificationPermission({
        silent: false,
      });
      
      if (isMountedRef.current) {
        setPermissionStatus(getNotificationPermission());
      }
      
      if (granted) {
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          if (isMountedRef.current) {
            setToken(fcmToken);
          }
          
          const saveResult = await saveTokenWithThrottling(fcmToken, deviceInfo);
          
          if (saveResult.success && !saveResult.skipped) {
            showNotification(
              'Notifications Enabled ✅',
              'You will now receive real-time updates.',
              'success',
              3000
            );
          } else if (saveResult.requiresAuth) {
            showNotification(
              'Authentication Error',
              'Please log in again to save notification token.',
              'warning',
              5000
            );
          }
        }
      } else {
        showNotification(
          'Permission Denied',
          'Notifications were not enabled. You can enable them in browser settings.',
          'warning',
          5000
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      showNotification(
        'Permission Error',
        'Could not enable notifications: ' + error.message,
        'error',
        5000
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Manual token refresh
  const handleRefreshToken = async () => {
    try {
      if (!isAuthenticated || !user) {
        showNotification(
          'Authentication Required',
          'Please log in to refresh notification token.',
          'warning',
          5000
        );
        return;
      }

      // ✅ Check companyId
      const companyId = user.companyId || user.company_id || user.company?.id;
      if (!companyId) {
        showNotification(
          'Company Setup Required',
          'Your company profile needs to be set up first.',
          'warning',
          5000
        );
        return;
      }
      
      setIsLoading(true);
      const result = await refreshFCMToken();
      
      if (result?.token) {
        if (isMountedRef.current) {
          setToken(result.token);
        }
        
        const tokenStatus = await getTokenStatus();
        if (isMountedRef.current) {
          setStatus(tokenStatus);
        }
        
        const saveResult = await saveTokenWithThrottling(result.token, deviceInfo);
        
        if (saveResult.success) {
          showNotification(
            'Token Refreshed ✅',
            'Notification token has been updated.',
            'success',
            3000
          );
        }
      } else if (result?.refreshSkipped) {
        showNotification(
          'Token Already Fresh',
          'Token was recently refreshed, no update needed.',
          'info',
          3000
        );
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      showNotification(
        'Refresh Failed',
        'Could not refresh notification token: ' + error.message,
        'error',
        5000
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Get debug info with company details
  const getDebugInfo = () => {
    const companyId = user?.companyId || user?.company_id || user?.company?.id;
    
    return {
      initialized: isInitialized,
      permission: permissionStatus,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      device: deviceInfo.deviceName || deviceInfo.deviceType || 'Unknown',
      browser: deviceInfo.browser || 'Unknown',
      isLoading,
      userInfo: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        isAuthenticated,
        companyId: companyId || 'MISSING!', // ✅ Show company status
      } : 'No user',
      authLoading,
      ...status,
    };
  };

  // Handle re-authentication
  const handleReauth = () => {
    console.log('🔄 Re-authenticating and retrying token save...');
    setIsInitialized(false);
    initAttemptedRef.current = false;
    retryCountRef.current = 0;
    
    setTimeout(() => {
      if (isMountedRef.current) {
        initFCM();
      }
    }, 2000);
  };

  // Don't render if not admin or not authenticated
  if (!user || user.role !== 'admin' || !isAuthenticated) {
    if (process.env.NODE_ENV === 'development') {
      console.log('FCMTokenManager not rendering:', {
        hasUser: !!user,
        role: user?.role,
        isAuthenticated,
        isAdmin: user?.role === 'admin'
      });
    }
    return null;
  }

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="hidden">
      {/* Debug panel (development only) */}
      {isDev && (
        <div className="fixed bottom-20 left-2 z-50 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg max-w-xs border border-gray-700 shadow-xl">
          <div className="font-bold mb-2 text-sm flex items-center justify-between">
            <span>🔔 FCM Debug Panel</span>
            <button 
              onClick={() => {
                console.log('FCM Debug Info:', getDebugInfo());
                console.log('User from AuthContext:', user);
              }}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              Log Info
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Auth Status:</span>
              <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {isAuthenticated ? '✅ Authenticated' : '❌ Not Auth'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Company ID:</span>
              <span className={
                (user.companyId || user.company_id || user.company?.id) 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }>
                {(user.companyId || user.company_id || user.company?.id) 
                  ? '✅ Present' 
                  : '❌ Missing!'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>User Role:</span>
              <span className={user.role === 'admin' ? 'text-green-400' : 'text-yellow-400'}>
                {user.role || 'none'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FCM Status:</span>
              <span className={isInitialized ? 'text-green-400' : 'text-yellow-400'}>
                {isInitialized ? '✅ Ready' : '🔄 Initializing'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Permission:</span>
              <span className={
                permissionStatus === 'granted' ? 'text-green-400' : 
                permissionStatus === 'denied' ? 'text-red-400' : 'text-yellow-400'
              }>
                {permissionStatus}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Token:</span>
              <span className={token ? 'text-green-400' : 'text-red-400'}>
                {token ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            
            <div className="pt-2 space-y-2 border-t border-gray-700">
              {permissionStatus !== 'granted' && (
                <button 
                  onClick={handleRequestPermission}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : '🔔 Enable Notifications'}
                </button>
              )}
              
              {token && (
                <button 
                  onClick={handleRefreshToken}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Refreshing...' : '🔄 Refresh Token'}
                </button>
              )}
              
              {status.error && status.error.includes('auth') && (
                <button 
                  onClick={handleReauth}
                  className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium transition-colors"
                >
                  🔑 Re-authenticate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Production - completely hidden but functional */}
      <div className="sr-only" aria-live="polite">
        Notifications: {permissionStatus === 'granted' ? 'Enabled' : 'Disabled'}
      </div>
    </div>
  );
};

export default FCMTokenManager;