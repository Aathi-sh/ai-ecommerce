import { messaging, getToken, onMessage } from './firebase-client';
import apiService from '@/services/apiService'; // Adjust path as needed

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get or create FCM token
export const getFCMToken = async () => {
  try {
    if (!messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    // Check if we have VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      throw new Error('VAPID key not configured');
    }

    // Get current token
    const token = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: await getServiceWorkerRegistration()
    });

    if (!token) {
      console.warn('No registration token available');
      return null;
    }

    console.log('FCM Token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Get service worker registration
const getServiceWorkerRegistration = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Save token to backend using ApiService
export const saveTokenToBackend = async (token, deviceInfo = {}) => {
  try {
    console.log('📱 Saving FCM token via ApiService:', {
      tokenPreview: token.substring(0, 20) + '...',
      deviceType: deviceInfo.deviceType
    });

    const result = await apiService.saveFCMToken({
      token,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        deviceName: getDeviceName(),
        deviceType: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString(),
        ...deviceInfo,
      },
    });

    console.log('✅ Token saved successfully via ApiService:', result);
    return result;

  } catch (error) {
    console.error('❌ Error saving token via ApiService:', error);
    
    // Fallback to direct fetch if ApiService fails
    try {
      console.log('🔄 Falling back to direct fetch...');
      const response = await fetch('/api/admin/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            deviceName: getDeviceName(),
            deviceType: getDeviceType(),
            timestamp: new Date().toISOString(),
            ...deviceInfo,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save token to backend');
      }

      const data = await response.json();
      console.log('✅ Token saved via fallback:', data);
      return data;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      throw new Error('Failed to save token: ' + (fallbackError.message || 'Unknown error'));
    }
  }
};

// Delete token from backend using ApiService
export const deleteTokenFromBackend = async (token) => {
  try {
    console.log('🗑️ Deleting FCM token via ApiService:', token.substring(0, 20) + '...');

    const result = await apiService.deleteFCMToken(token);
    
    console.log('✅ Token deleted successfully via ApiService:', result);
    return result;

  } catch (error) {
    console.error('❌ Error deleting token via ApiService:', error);
    
    // Fallback to direct fetch
    try {
      console.log('🔄 Falling back to direct fetch for deletion...');
      const response = await fetch('/api/admin/fcm-token', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete token');
      }

      const data = await response.json();
      console.log('✅ Token deleted via fallback:', data);
      return data;
    } catch (fallbackError) {
      console.error('❌ Fallback deletion also failed:', fallbackError);
      // Don't throw - this is usually cleanup, so just log
      return { success: false, error: fallbackError.message };
    }
  }
};

// Setup foreground message listener
export const setupForegroundMessageListener = (callback) => {
  if (!messaging) {
    console.warn('Firebase messaging not initialized for foreground listener');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('📩 Foreground message received:', {
      title: payload.notification?.title || payload.data?.title,
      type: payload.data?.type
    });
    
    // Show notification if not already shown by service worker
    if (Notification.permission === 'granted') {
      const { title, body, icon, ...data } = payload.data || payload.notification;
      
      // Only show if not in quiet hours
      if (!isQuietHours()) {
        // Create browser notification
        const notification = new Notification(title || 'New Notification', {
          body: body || 'You have a new message',
          icon: icon || '/favicon.ico',
          data,
          tag: payload.data?.tag || 'admin-notification',
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Handle notification click (e.g., navigate to specific page)
          if (callback) callback(data);
          
          // Navigate based on notification type
          handleNotificationNavigation(data);
        };
      }
    }
    
    // Call custom callback with payload
    if (callback) callback(payload);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('fcm-notification', { detail: payload }));
  });

  return unsubscribe;
};

// Helper function to handle notification navigation
const handleNotificationNavigation = (data) => {
  const url = data?.actionUrl || data?.url;
  const type = data?.type;
  
  if (url) {
    window.location.href = url;
  } else if (type) {
    // Default navigation based on notification type
    const navigationMap = {
      'NEW_ORDER': '/admin/orders',
      'PAYMENT_UPLOADED': '/admin/payments/pending',
      'PAYMENT_VERIFIED': '/admin/payments/verified',
      'LOW_STOCK': '/admin/products/stock',
      'INVOICE_SENT': '/admin/invoices',
      'SYSTEM_ALERT': '/admin/dashboard'
    };
    
    if (navigationMap[type]) {
      window.location.href = navigationMap[type];
    }
  }
};

// Check if current time is within quiet hours
const isQuietHours = () => {
  try {
    // Get quiet hours from localStorage or default
    const settings = JSON.parse(localStorage.getItem('adminNotificationSettings') || '{}');
    const quietHours = settings.quietHours || { enabled: false, startTime: '22:00', endTime: '08:00' };
    
    if (!quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      // Normal case: quiet hours don't cross midnight
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours cross midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  } catch (error) {
    console.error('Error checking quiet hours:', error);
    return false;
  }
};

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

// Get OS
const getOS = () => {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  if (/android/i.test(ua)) return 'Android';
  if (/ios|iphone|ipad|ipod/i.test(ua)) return 'iOS';
  return 'Unknown OS';
};

// Get browser
const getBrowser = () => {
  const ua = navigator.userAgent;
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/edg/i.test(ua)) return 'Edge';
  if (/opera|opr/i.test(ua)) return 'Opera';
  return 'Unknown Browser';
};

// Refresh FCM token (call periodically)
export const refreshFCMToken = async () => {
  try {
    if (!messaging) return null;
    
    const newToken = await getFCMToken();
    if (newToken) {
      await saveTokenToBackend(newToken);
      console.log('🔄 FCM token refreshed successfully');
      return newToken;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing FCM token:', error);
    return null;
  }
};

// Get current FCM token (with caching)
let cachedToken = null;
export const getCurrentFCMToken = async () => {
  if (cachedToken) return cachedToken;
  
  cachedToken = await getFCMToken();
  return cachedToken;
};

// Clear cached token (on logout)
export const clearCachedToken = () => {
  cachedToken = null;
};