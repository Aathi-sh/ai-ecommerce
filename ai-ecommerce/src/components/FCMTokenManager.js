import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  getFCMToken,
  saveTokenToBackend,
  setupForegroundMessageListener,
  deleteTokenFromBackend,
} from '@/lib/firebase/fcm-token-service';
import { useAuth } from '@/contexts/AuthContext';

const FCMTokenManager = () => {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  // Initialize FCM on component mount
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const initFCM = async () => {
      try {
        // Check notification permission
        const permission = await requestNotificationPermission();
        setPermissionStatus(Notification.permission);

        if (permission) {
          // Get FCM token
          const fcmToken = await getFCMToken();
          if (fcmToken) {
            setToken(fcmToken);

            // Save token to backend with device info
            await saveTokenToBackend(fcmToken, {
              deviceName: getDeviceName(),
              deviceType: getDeviceType(),
              screenSize: `${window.screen.width}x${window.screen.height}`,
            });
          }

          // Setup foreground message listener
          const unsubscribe = setupForegroundMessageListener((payload) => {
            console.log('Notification received:', payload);
            // Handle notification (e.g., show toast, update state)
            if (payload.data?.type === 'NEW_ORDER') {
              // Refresh orders list or show specific alert
              console.log('New order notification:', payload.data);
            }
          });

          setIsInitialized(true);

          // Cleanup on unmount
          return () => {
            if (unsubscribe) unsubscribe();
            // Optionally delete token when user logs out
            if (fcmToken) {
              // deleteTokenFromBackend(fcmToken);
            }
          };
        }
      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };

    initFCM();
  }, [user]);

  // Get device name
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile Device';
    if (/tablet/i.test(ua)) return 'Tablet';
    if (/mac/i.test(ua)) return 'Mac';
    if (/windows/i.test(ua)) return 'Windows PC';
    if (/linux/i.test(ua)) return 'Linux PC';
    return 'Unknown Device';
  };

  // Get device type
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  // Manually request permission
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(Notification.permission);
    
    if (granted) {
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        setToken(fcmToken);
        await saveTokenToBackend(fcmToken);
      }
    }
  };

  // Manual token refresh
  const handleRefreshToken = async () => {
    if (!messaging) return;
    
    try {
      const newToken = await getFCMToken();
      if (newToken && newToken !== token) {
        setToken(newToken);
        await saveTokenToBackend(newToken);
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="hidden">
      {/* Hidden component that manages FCM tokens */}
      <div className="text-xs text-gray-500">
        Notification Permission: {permissionStatus}
        {token && (
          <div>Token: {token.substring(0, 20)}...</div>
        )}
        {permissionStatus !== 'granted' && (
          <button onClick={handleRequestPermission}>
            Enable Notifications
          </button>
        )}
      </div>
    </div>
  );
};

export default FCMTokenManager;