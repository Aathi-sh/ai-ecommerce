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
// } from '@/lib/firebase/fcm-token-service';
// import { useAuth } from "../../context/authContext";
// import { useNotification } from "../../hooks/useNotification";

// const FCMTokenManager = ({ onInitialized }) => {
//   const { user } = useAuth();
//   const { showNotification } = useNotification();
  
//   const [token, setToken] = useState(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [permissionStatus, setPermissionStatus] = useState('default');
//   const [isLoading, setIsLoading] = useState(false);
//   const [deviceInfo, setDeviceInfo] = useState({});
//   const [status, setStatus] = useState({});
  
//   // CRITICAL FIX: Refs to prevent multiple initializations
//   const unsubscribeRef = useRef(null);
//   const initAttemptedRef = useRef(false);
//   const isMountedRef = useRef(true);
//   const tokenSaveAttemptRef = useRef(false);

//   // Get comprehensive device info - memoized to prevent re-creation
//   const getDeviceInfo = useCallback(() => {
//     if (typeof window === 'undefined') return {};
    
//     const ua = navigator.userAgent;
    
//     // Device type
//     let deviceType = 'desktop';
//     let deviceName = 'Unknown Device';
    
//     if (/mobile/i.test(ua)) {
//       deviceType = 'mobile';
//       deviceName = 'Mobile Device';
//     } else if (/tablet/i.test(ua)) {
//       deviceType = 'tablet';
//       deviceName = 'Tablet';
//     } else if (/mac/i.test(ua)) {
//       deviceName = 'Mac';
//     } else if (/windows/i.test(ua)) {
//       deviceName = 'Windows PC';
//     } else if (/linux/i.test(ua)) {
//       deviceName = 'Linux PC';
//     }
    
//     // Browser detection
//     let browser = 'Unknown';
//     if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
//     else if (/firefox/i.test(ua)) browser = 'Firefox';
//     else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
//     else if (/edg/i.test(ua)) browser = 'Edge';
    
//     return {
//       deviceName,
//       deviceType,
//       browser,
//       screenSize: `${window.screen.width}x${window.screen.height}`,
//       viewportSize: `${window.innerWidth}x${window.innerHeight}`,
//       userAgent: ua.substring(0, 100), // Store only first 100 chars
//       platform: navigator.platform,
//       language: navigator.language,
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       timestamp: new Date().toISOString(),
//     };
//   }, []);

//   // Handle foreground messages
//   const handleForegroundMessage = useCallback((payload) => {
//     console.log('FCM Message received in manager:', payload);
//   }, []);

//   // Save token with throttling
//   const saveTokenWithThrottling = useCallback(async (fcmToken, deviceData) => {
//     if (tokenSaveAttemptRef.current) {
//       console.log('⏭️ Token save already in progress, skipping');
//       return { success: false, error: 'save_in_progress', message: 'Token save already in progress' };
//     }
    
//     tokenSaveAttemptRef.current = true;
    
//     try {
//       console.log('📤 Attempting to save token to backend...');
//       const saveResult = await saveTokenToBackend(fcmToken, deviceData);
//       console.log('✅ Token saved to backend:', saveResult);
//       return saveResult;
//     } catch (error) {
//       console.error('❌ Failed to save token:', error);
//       return { success: false, error: error.message };
//     } finally {
//       // Reset after a delay to prevent rapid retries
//       setTimeout(() => {
//         tokenSaveAttemptRef.current = false;
//       }, 2000);
//     }
//   }, []);

//   // Initialize FCM - optimized and throttled
//   const initFCM = useCallback(async () => {
//     // CRITICAL: Prevent multiple initialization attempts
//     if (initAttemptedRef.current || !isMountedRef.current) {
//       console.log('⏭️ Initialization already attempted or component unmounted');
//       return;
//     }
    
//     initAttemptedRef.current = true;
    
//     try {
//       setIsLoading(true);
      
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
//           onInitialized?.();
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
//           'Enable notifications to receive real-time updates about orders and activities.'
//         );
        
//         if (!userConsent) {
//           if (isMountedRef.current) {
//             setIsInitialized(true);
//             setIsLoading(false);
//             onInitialized?.();
//           }
//           return;
//         }
//       }

//       const hasPermission = await requestNotificationPermission({
//         silent: true,
//         showCustomPrompt: null // We already showed our prompt
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
          
//           // Call onInitialized with token data - CRITICAL FIX ADDED HERE
//           if (isMountedRef.current) {
//             setIsInitialized(true);
//             setIsLoading(false);
//             onInitialized?.({
//               token: fcmToken,
//               saveResult,
//               deviceInfo: deviceData,
//               permission: 'granted',
//               timestamp: new Date().toISOString(),
//               success: true
//             });
//           }
          
//           // Only show success notification if save was actually successful
//           if (saveResult.success && !saveResult.skipped) {
//             showNotification(
//               'Notifications Enabled',
//               'You will now receive real-time notifications.',
//               'success',
//               3000
//             );
//           }
//         } else {
//           // No token obtained but still initialized
//           if (isMountedRef.current) {
//             setIsInitialized(true);
//             setIsLoading(false);
//             onInitialized?.({
//               error: 'No FCM token obtained',
//               deviceInfo: deviceData,
//               permission: 'granted',
//               timestamp: new Date().toISOString(),
//               success: false
//             });
//           }
//         }

//         // Setup foreground message listener
//         unsubscribeRef.current = setupForegroundMessageListener({
//           onMessageReceived: handleForegroundMessage,
//           showDefaultNotification: false,
//         });

//         // Get complete status
//         const tokenStatus = await getTokenStatus();
//         if (isMountedRef.current) {
//           setStatus(tokenStatus);
//         }
        
//         console.log('✅ FCM Token Manager initialized successfully');
//       } else {
//         // Permission denied but still initialized
//         if (isMountedRef.current) {
//           showNotification(
//             'Notifications Disabled',
//             'Enable notifications in browser settings to receive updates.',
//             'warning',
//             5000
//           );
//           setIsInitialized(true);
//           setIsLoading(false);
//           onInitialized?.({
//             error: 'Permission denied',
//             permission: 'denied',
//             timestamp: new Date().toISOString(),
//             success: false
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
//         setIsInitialized(true);
//         setIsLoading(false);
//         onInitialized?.({
//           error: error.message,
//           permission: permissionStatus,
//           timestamp: new Date().toISOString(),
//           success: false
//         });
//       }
//     } finally {
//       if (isMountedRef.current) {
//         setIsLoading(false);
//       }
//     }
//   }, [getDeviceInfo, handleForegroundMessage, onInitialized, saveTokenWithThrottling, showNotification]);

//   // Main initialization effect - FIXED
//   useEffect(() => {
//     isMountedRef.current = true;
//     initAttemptedRef.current = false;
    
//     // Only initialize if user is admin and component hasn't been initialized yet
//     if (user && user.role === 'admin' && !isInitialized && !initAttemptedRef.current) {
//       // Small delay to ensure everything is ready
//       const timer = setTimeout(() => {
//         if (isMountedRef.current && !initAttemptedRef.current) {
//           initFCM();
//         }
//       }, 1000);

//       return () => clearTimeout(timer);
//     }

//     return () => {
//       isMountedRef.current = false;
      
//       if (unsubscribeRef.current) {
//         unsubscribeRef.current();
//       }
//     };
//   }, [user, isInitialized, initFCM]);

//   // Manually request permission
//   const handleRequestPermission = async () => {
//     try {
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
          
//           await saveTokenWithThrottling(fcmToken, deviceInfo);
          
//           showNotification(
//             'Notifications Enabled',
//             'You will now receive real-time updates.',
//             'success',
//             3000
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Error requesting permission:', error);
//       showNotification(
//         'Permission Error',
//         'Could not enable notifications.',
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
//       setIsLoading(true);
//       const result = await refreshFCMToken();
      
//       if (result?.token) {
//         if (isMountedRef.current) {
//           setToken(result.token);
//         }
//         showNotification(
//           'Token Refreshed',
//           'Notification token has been updated.',
//           'success',
//           3000
//         );
//       }
//     } catch (error) {
//       console.error('Error refreshing token:', error);
//       showNotification(
//         'Refresh Failed',
//         'Could not refresh notification token.',
//         'error',
//         5000
//       );
//     } finally {
//       if (isMountedRef.current) {
//         setIsLoading(false);
//       }
//     }
//   };

//   // Debug info
//   const getDebugInfo = () => {
//     return {
//       initialized: isInitialized,
//       permission: permissionStatus,
//       hasToken: !!token,
//       tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
//       device: deviceInfo.deviceName,
//       browser: deviceInfo.browser,
//       isLoading,
//       ...status,
//     };
//   };

//   // Don't render anything if not admin
//   if (!user || user.role !== 'admin') return null;

//   // Only render debug info in development
//   const isDev = process.env.NODE_ENV === 'development';

//   return (
//     <div className="hidden">
//       {/* Hidden component that manages FCM tokens */}
//       {isDev && (
//         <div className="fixed bottom-20 left-2 z-50 bg-black bg-opacity-80 text-white text-xs p-2 rounded max-w-xs">
//           <div className="font-bold mb-1">FCM Debug Info</div>
//           <div className="space-y-1">
//             <div>Status: {isInitialized ? '✅ Ready' : '🔄 Initializing'}</div>
//             <div>Permission: {permissionStatus}</div>
//             <div>Token: {token ? '✅ Present' : '❌ Missing'}</div>
//             <div>Browser: {deviceInfo.browser || 'Unknown'}</div>
//             <div>Device: {deviceInfo.deviceName || 'Unknown'}</div>
            
//             {permissionStatus !== 'granted' && (
//               <button 
//                 onClick={handleRequestPermission}
//                 className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs w-full"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Processing...' : 'Enable Notifications'}
//               </button>
//             )}
            
//             {token && (
//               <button 
//                 onClick={handleRefreshToken}
//                 className="mt-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs w-full"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Refreshing...' : 'Refresh Token'}
//               </button>
//             )}
//           </div>
//         </div>
//       )}
      
//       {/* Production - completely hidden */}
//       <div className="sr-only" aria-live="polite">
//         Notifications: {permissionStatus === 'granted' ? 'Enabled' : 'Disabled'}
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
import { useAuth } from "../../context/authContext";
import { useNotification } from "../../hooks/useNotification";

const FCMTokenManager = ({ onInitialized }) => {
  const { user } = useAuth();
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

  // Get comprehensive device info - memoized
  const getDeviceInfo = useCallback(() => {
    return DeviceInfo.getBasicInfo();
  }, []);

  // Handle foreground messages
  const handleForegroundMessage = useCallback((payload) => {
    console.log('📨 FCM Message received in manager:', payload);
    
    // Extract notification data
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

  // Save token with throttling - FIXED PARAMETER
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
      
      // FIXED: Pass correct parameters to saveTokenToBackend
      const saveResult = await saveTokenToBackend(fcmToken, {
        userType: user?.role || 'admin',
        setupTimestamp: new Date().toISOString(),
        ...deviceData
      });
      
      console.log('✅ Token saved to backend:', saveResult);
      return saveResult;
    } catch (error) {
      console.error('❌ Failed to save token:', error);
      return { 
        success: false, 
        error: error.message,
        requiresAuth: error.message?.includes('auth') || false
      };
    } finally {
      // Reset after a delay to prevent rapid retries
      setTimeout(() => {
        tokenSaveAttemptRef.current = false;
      }, 2000);
    }
  }, [user?.role]);

  // Initialize FCM - optimized
  const initFCM = useCallback(async () => {
    // Prevent multiple initialization attempts
    if (initAttemptedRef.current || !isMountedRef.current) {
      console.log('⏭️ Initialization already attempted or component unmounted');
      return;
    }
    
    initAttemptedRef.current = true;
    
    try {
      setIsLoading(true);
      
      // Check if browser supports notifications
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

      // Check permission and request if needed
      if (currentPermission === 'default') {
        // Show custom prompt before requesting browser permission
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

          // Save token to backend with throttling
          const saveResult = await saveTokenWithThrottling(fcmToken, deviceData);
          console.log('📊 Token save result:', saveResult);
          
          // Setup foreground message listener
          unsubscribeRef.current = setupForegroundMessageListener({
            onMessageReceived: handleForegroundMessage,
            showDefaultNotification: true,
            notificationOptions: {
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              requireInteraction: false,
            },
          });

          // Get complete status
          const tokenStatus = await getTokenStatus();
          if (isMountedRef.current) {
            setStatus(tokenStatus);
          }
          
          // Call onInitialized callback
          if (isMountedRef.current) {
            setIsInitialized(true);
            setIsLoading(false);
            onInitialized?.({
              success: true,
              token: fcmToken,
              saveResult,
              deviceInfo: deviceData,
              permission: 'granted',
              timestamp: new Date().toISOString(),
            });
          }
          
          // Show success notification if save was actually successful
          if (saveResult.success && !saveResult.skipped && !saveResult.requiresAuth) {
            showNotification(
              'Notifications Enabled ✅',
              'You will now receive real-time updates for new orders and activities.',
              'success',
              3000
            );
          } else if (saveResult.requiresAuth) {
            showNotification(
              'Authentication Required',
              'Please log in to enable notifications.',
              'warning',
              5000
            );
          }
        } else {
          // No token obtained
          if (isMountedRef.current) {
            setIsInitialized(true);
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
        
        console.log('✅ FCM Token Manager initialized successfully');
      } else {
        // Permission denied
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
        
        setIsInitialized(true);
        setIsLoading(false);
        onInitialized?.({
          success: false,
          error: error.message,
          permission: permissionStatus,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [getDeviceInfo, handleForegroundMessage, onInitialized, saveTokenWithThrottling, showNotification]);

  // Main initialization effect
  useEffect(() => {
    isMountedRef.current = true;
    initAttemptedRef.current = false;
    
    // Only initialize if user is admin and component hasn't been initialized yet
    if (user && user.role === 'admin' && !isInitialized && !initAttemptedRef.current) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        if (isMountedRef.current && !initAttemptedRef.current) {
          initFCM();
        }
      }, 1500); // Increased delay for better initialization

      return () => clearTimeout(timer);
    }

    return () => {
      isMountedRef.current = false;
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, isInitialized, initFCM]);

  // Manually request permission
  const handleRequestPermission = async () => {
    try {
      setIsLoading(true);
      const granted = await requestNotificationPermission({
        silent: false, // Show browser prompt
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
      setIsLoading(true);
      const result = await refreshFCMToken();
      
      if (result?.token) {
        if (isMountedRef.current) {
          setToken(result.token);
        }
        
        // Update status
        const tokenStatus = await getTokenStatus();
        if (isMountedRef.current) {
          setStatus(tokenStatus);
        }
        
        showNotification(
          'Token Refreshed ✅',
          'Notification token has been updated.',
          'success',
          3000
        );
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

  // Get debug info
  const getDebugInfo = () => {
    return {
      initialized: isInitialized,
      permission: permissionStatus,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      device: deviceInfo.deviceName || deviceInfo.deviceType || 'Unknown',
      browser: deviceInfo.browser || 'Unknown',
      isLoading,
      ...status,
    };
  };

  // Handle re-authentication
  const handleReauth = () => {
    console.log('🔄 Re-authenticating and retrying token save...');
    setIsInitialized(false);
    initAttemptedRef.current = false;
    
    // Wait for auth state to update, then retry
    setTimeout(() => {
      if (isMountedRef.current) {
        initFCM();
      }
    }, 2000);
  };

  // Don't render anything if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  // Only render debug info in development
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="hidden">
      {/* Hidden component that manages FCM tokens */}
      {isDev && (
        <div className="fixed bottom-20 left-2 z-50 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg max-w-xs border border-gray-700 shadow-xl">
          <div className="font-bold mb-2 text-sm flex items-center justify-between">
            <span>🔔 FCM Debug Panel</span>
            <button 
              onClick={() => console.log(getDebugInfo())}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              Log
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
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
            
            <div className="flex justify-between">
              <span>Browser:</span>
              <span>{deviceInfo.browser || 'Unknown'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Device:</span>
              <span>{deviceInfo.deviceType || 'Unknown'}</span>
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
            
            {token && (
              <div className="mt-2 p-2 bg-gray-800 rounded text-xs break-all">
                <div className="text-gray-400 mb-1">Token Preview:</div>
                <div className="font-mono">{token.substring(0, 30)}...</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Production - completely hidden but functional */}
      <div className="sr-only" aria-live="polite">
        Notifications: {permissionStatus === 'granted' ? 'Enabled' : 'Disabled'}
        {token && ', Token: Present'}
        {!token && ', Token: Not available'}
      </div>
    </div>
  );
};

export default FCMTokenManager;