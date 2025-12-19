// firebase-client.js
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'; // ADDED getToken AND onMessage

// Firebase configuration - validate required fields
const getFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  // Validate configuration in development
  if (process.env.NODE_ENV === 'development') {
    const missingFields = Object.entries(config)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.warn('Missing Firebase configuration fields:', missingFields);
    }
  }

  return config;
};

const firebaseConfig = getFirebaseConfig();

// State variables with improved tracking
let app = null;
let messaging = null;
let isInitialized = false;
let initializationPromise = null;

// Track token calls to prevent spam
let lastTokenFetchTime = 0;
let lastTokenSentTime = 0;
let cachedToken = null;
const TOKEN_FETCH_THROTTLE_MS = 30000; // 30 seconds between token fetches
const TOKEN_SEND_THROTTLE_MS = 60000; // 60 seconds between token sends to backend

// VAPID Key for web push (optional but recommended)
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

/**
 * Initialize Firebase with error handling and retry logic
 */
export const initializeFirebase = async () => {
  if (typeof window === 'undefined') {
    return { app: null, messaging: null, isSupported: false };
  }

  // Return cached instance if already initialized
  if (isInitialized) {
    return { app, messaging, isSupported: !!messaging };
  }

  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Validate Firebase configuration
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error('Firebase configuration is incomplete');
      }

      // Initialize Firebase app
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase app initialized successfully');
      } else {
        app = getApps()[0];
      }

      // Check if messaging is supported
      const supported = await isSupported();
      
      if (supported) {
        messaging = getMessaging(app);
        console.log('✅ Firebase Messaging initialized successfully');
        
        // Setup message listener for foreground notifications
        setupForegroundMessageListener();
      } else {
        console.warn('❌ Firebase Cloud Messaging is not supported in this environment');
      }

      isInitialized = true;
      return { app, messaging, isSupported: supported };
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      
      // Reset state on error
      isInitialized = false;
      initializationPromise = null;
      
      // Provide helpful error messages
      if (error.code === 'auth/invalid-api-key') {
        console.error('Please check your Firebase API key in environment variables');
      } else if (error.code === 'app/duplicate-app') {
        console.warn('Firebase app already exists, using existing instance');
        return { app, messaging, isSupported: !!messaging };
      }
      
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Setup foreground message listener
 */
const setupForegroundMessageListener = () => {
  if (!messaging) return;
  
  try {
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      
      // Show notification to user
      if (payload.notification) {
        const { title, body, icon } = payload.notification;
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: icon || '/icon-192x192.png',
          });
        }
        
        // Also show custom in-app notification
        showInAppNotification(title, body);
      }
    });
    
    console.log('👂 Foreground message listener setup');
  } catch (error) {
    console.error('❌ Error setting up foreground message listener:', error);
  }
};

/**
 * Show in-app notification
 */
const showInAppNotification = (title, body) => {
  // Create notification element
  const notificationEl = document.createElement('div');
  notificationEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    max-width: 350px;
    animation: slideIn 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  notificationEl.innerHTML = `
    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${title}</div>
    <div style="font-size: 13px; opacity: 0.9;">${body}</div>
  `;
  
  document.body.appendChild(notificationEl);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notificationEl.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (document.body.contains(notificationEl)) {
        document.body.removeChild(notificationEl);
      }
    }, 300);
  }, 5000);
  
  // Add CSS animations
  if (!document.querySelector('#notification-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'notification-styles';
    styleEl.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }
};

/**
 * Get Firebase app instance
 */
export const getFirebaseApp = () => {
  if (!app && typeof window !== 'undefined') {
    console.warn('Firebase app not initialized. Call initializeFirebase() first.');
  }
  return app;
};

/**
 * Get Firebase messaging instance
 */
export const getFirebaseMessaging = () => {
  if (!messaging && typeof window !== 'undefined') {
    console.warn('Firebase Messaging not initialized or not supported.');
  }
  return messaging;
};

/**
 * Get or register service worker
 */
const getServiceWorkerRegistration = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Try to get existing registration
    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (!registration) {
      console.log('🔧 Service worker not found, attempting to register...');
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
        type: 'module',
        updateViaCache: 'none'
      });
      
      console.log('✅ Service worker registered');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');
    }
    
    return registration;
  } catch (error) {
    console.error('❌ Service worker error:', error);
    
    // Fallback: try to register generic service worker
    try {
      console.log('🔄 Trying to register generic service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      console.log('✅ Generic service worker registered');
      return registration;
    } catch (fallbackError) {
      console.error('❌ Generic service worker also failed:', fallbackError);
      return null;
    }
  }
};

/**
 * Check if service worker file exists
 */
const checkServiceWorkerExists = async () => {
  try {
    const response = await fetch('/firebase-messaging-sw.js');
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get FCM token with throttling and caching
 */
export const getFCMToken = async (options = {}) => {
  const { forceRefresh = false, skipThrottle = false } = options;
  
  try {
    // Throttle token fetches to prevent spam
    const now = Date.now();
    if (!skipThrottle && !forceRefresh && 
        cachedToken && 
        (now - lastTokenFetchTime) < TOKEN_FETCH_THROTTLE_MS) {
      console.log('⏭️ Skipping token fetch - throttled');
      return cachedToken;
    }

    await initializeFirebase();
    
    if (!messaging) {
      throw new Error('Messaging not supported or initialized');
    }

    // Check notification permission
    if (typeof Notification === 'undefined') {
      throw new Error('Notifications not supported in this browser');
    }
    
    let permission = Notification.permission;
    
    // Request permission if not already granted/denied
    if (permission === 'default') {
      console.log('🔔 Requesting notification permission...');
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      throw new Error(`Notification permission is ${permission}`);
    }

    console.log('🔔 Notification permission granted');

    // Get service worker registration
    const serviceWorkerRegistration = await getServiceWorkerRegistration();
    if (!serviceWorkerRegistration) {
      throw new Error('Service worker not available');
    }

    // Check if service worker file exists
    const swExists = await checkServiceWorkerExists();
    if (!swExists) {
      console.warn('⚠️ firebase-messaging-sw.js not found. Some features may not work.');
    }

    // Get token with VAPID key
    const tokenOptions = {
      serviceWorkerRegistration,
    };
    
    // Only add vapidKey if it's not empty
    if (vapidKey && vapidKey.trim() !== '') {
      tokenOptions.vapidKey = vapidKey;
    }
    
    console.log('🔑 Getting FCM token with options:', tokenOptions);
    const token = await getToken(messaging, tokenOptions);

    if (!token) {
      throw new Error('No FCM token available');
    }

    // Validate token format
    if (token.length < 100) {
      console.warn('⚠️ Token seems unusually short:', token);
    }

    // Update cache and timestamp
    cachedToken = token;
    lastTokenFetchTime = now;
    
    console.log('✅ FCM Token obtained (length:', token.length, 'chars)');
    return token;
  } catch (error) {
    console.error('❌ Failed to get FCM token:', error.message);
    
    // Clear cache on error
    cachedToken = null;
    
    // Provide specific error guidance
    if (error.message.includes('permission-blocked')) {
      console.warn('Notifications are blocked. Please enable them in browser settings.');
    } else if (error.message.includes('permission-default')) {
      console.warn('Notification permission not requested yet.');
    } else if (error.message.includes('service worker')) {
      console.warn('Service worker not found. Make sure firebase-messaging-sw.js is properly registered.');
    } else if (error.message.includes('messaging/permission-blocked')) {
      console.warn('Browser has blocked notifications. Please check browser settings.');
    } else if (error.message.includes('messaging/permission-default')) {
      console.warn('Need to request notification permission first.');
    } else if (error.message.includes('messaging/unsupported-browser')) {
      console.warn('This browser does not support Firebase Cloud Messaging.');
    }
    
    throw error;
  }
};

/**
 * Enhanced version of saveTokenToBackend with proper throttling
 */
export const saveTokenToBackend = async (token, userId, email, additionalInfo = {}) => {
  const now = Date.now();
  
  // Throttle backend saves - only send once per minute
  if ((now - lastTokenSentTime) < TOKEN_SEND_THROTTLE_MS) {
    console.log('⏭️ Skipping token save to backend - throttled');
    return { success: true, skipped: true, message: 'Token save throttled' };
  }
  
  try {
    // Prepare device info
    const deviceInfo = {
      userAgent: navigator.userAgent || 'unknown',
      platform: navigator.platform || 'unknown',
      language: navigator.language || 'unknown',
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
      browser: getBrowserInfo(),
      os: getOSInfo(),
      ...additionalInfo
    };

    const requestBody = {
      token: token.trim(),
      deviceInfo,
      userId,
      email,
      userType: additionalInfo.userType || 'user',
      timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending token to backend...', {
      userId,
      email,
      tokenLength: token.length
    });
    
    const response = await fetch('/api/auth/fcm-token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend response error (${response.status}):`, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 404) {
        throw new Error('FCM token endpoint not found. Check your API route.');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to save token to backend');
    }

    // Update timestamp only on successful send
    lastTokenSentTime = now;
    
    console.log('✅ Token saved to backend successfully:', result);
    return { success: true, data: result };
    
  } catch (error) {
    console.error('❌ Error saving token to backend:', error.message);
    
    // Log to localStorage for debugging
    try {
      localStorage.setItem('fcm_error', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        userId,
        email
      }));
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Get browser information
 */
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'unknown';
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  return browser;
};

/**
 * Get OS information
 */
const getOSInfo = () => {
  const ua = navigator.userAgent;
  let os = 'unknown';
  
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return os;
};

/**
 * Setup notifications with throttling
 */
export const setupNotifications = async (userData) => {
  try {
    if (!userData || !userData.id || !userData.email) {
      throw new Error('User data required');
    }

    console.log('🔔 Setting up notifications for:', userData.email);
    
    // First ensure Firebase is initialized
    await initializeFirebase();
    
    // Get token (with throttling)
    const token = await getFCMToken();
    
    if (!token) {
      throw new Error('Failed to get FCM token');
    }

    console.log('✅ FCM token obtained for:', userData.email);
    
    // Save to backend (with throttling)
    const saveResult = await saveTokenToBackend(token, userData.id, userData.email, {
      userType: userData.role || 'user',
      setupTimestamp: new Date().toISOString(),
    });

    // Store token info in localStorage for reference
    try {
      localStorage.setItem('fcm_token_info', JSON.stringify({
        token: token.substring(0, 20) + '...', // Store only first 20 chars for security
        userId: userData.id,
        email: userData.email,
        setupTime: new Date().toISOString(),
        savedToBackend: saveResult.success
      }));
    } catch (e) {
      // Ignore localStorage errors
    }

    return {
      success: true,
      token,
      saveResult,
      message: 'Notifications setup complete'
    };
    
  } catch (error) {
    console.error('❌ Notification setup failed:', error.message);
    
    // Store error in localStorage for debugging
    try {
      localStorage.setItem('fcm_setup_error', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        userData
      }));
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete token from backend (on logout)
 */
export const deleteTokenFromBackend = async (options = {}) => {
  try {
    const { token, userId, email } = options;
    
    console.log('🗑️ Deleting FCM token from backend...');
    
    const response = await fetch('/api/auth/fcm-token', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ token, userId, email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ Token deleted from backend:', result);
    return { success: true, data: result };
    
  } catch (error) {
    console.error('❌ Error deleting token from backend:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if Firebase is ready
 */
export const isFirebaseReady = () => {
  return isInitialized && typeof window !== 'undefined';
};

/**
 * Manual initialization (optional)
 */
export const initializeManually = async () => {
  return initializeFirebase();
};

/**
 * Clear cached token
 */
export const clearCachedToken = () => {
  cachedToken = null;
  lastTokenFetchTime = 0;
  console.log('🧹 Cached FCM token cleared');
};

/**
 * Get token status
 */
export const getTokenStatus = () => {
  return {
    hasToken: !!cachedToken,
    lastFetchTime: lastTokenFetchTime,
    lastSendTime: lastTokenSentTime,
    isThrottled: (Date.now() - lastTokenFetchTime) < TOKEN_FETCH_THROTTLE_MS,
    permission: Notification.permission,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  };
};

/**
 * Request notification permission manually
 */
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, error: 'Notifications not supported' };
  }
  
  try {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted', permission };
  } catch (error) {
    return { granted: false, error: error.message };
  }
};

// ========== EXPORTS ==========
export { messaging, vapidKey, firebaseConfig };