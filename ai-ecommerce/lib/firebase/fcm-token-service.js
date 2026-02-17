// lib/firebase/fcm-token-service.js - UPDATED FOR NEXTAUTH
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { messaging, initializeFirebase } from './firebase-client';

// ==================== CACHE & THROTTLING MANAGEMENT ====================
let cachedFCMToken = null;
let tokenExpiryTime = null;
const TOKEN_CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

// THROTTLING VARIABLES
let lastTokenSaveTime = 0;
let lastTokenSaved = null;
const TOKEN_SAVE_THROTTLE_MS = 60000; // 60 seconds minimum between saves
let isSavingToken = false;
const TOKEN_SEND_COOLDOWN = 30000; // 30 seconds cooldown after successful save

// Device information utility
class DeviceInfo {
  static getBasicInfo() {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      deviceType: this.getDeviceType(),
      browser: this.getBrowserName(),
      browserVersion: this.getBrowserVersion(),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString(),
    };
  }

  static getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  static getBrowserName() {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    if (ua.includes('msie') || ua.includes('trident')) return 'Internet Explorer';
    
    return 'Unknown';
  }

  static getBrowserVersion() {
    const ua = navigator.userAgent;
    let version = 'Unknown';
    
    const matches = ua.match(/(chrome|firefox|safari|edg|opr|opera|msie|trident(?=\/))\/?\s*(\d+)/i);
    if (matches && matches[2]) {
      version = matches[2];
    }
    
    return version;
  }

  static getOS() {
    const ua = navigator.userAgent;
    if (/windows/i.test(ua)) return 'Windows';
    if (/macintosh|mac os x/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    if (/android/i.test(ua)) return 'Android';
    if (/ios|iphone|ipad|ipod/i.test(ua)) return 'iOS';
    return 'Unknown';
  }
}

/**
 * Check if browser supports notifications
 */
export const isNotificationSupported = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    window.isSecureContext
  );
};

/**
 * Get notification permission status
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Request notification permission with enhanced UX
 */
export const requestNotificationPermission = async (options = {}) => {
  const {
    silent = false,
    showCustomPrompt = null,
  } = options;

  if (!isNotificationSupported()) {
    throw new Error('Notifications are not supported in this browser');
  }

  const currentPermission = getNotificationPermission();

  switch (currentPermission) {
    case 'granted':
      return true;
    
    case 'denied':
      if (silent) return false;
      
      console.warn('Notification permission was previously denied by user');
      
      if (showCustomPrompt && typeof showCustomPrompt === 'function') {
        showCustomPrompt();
      }
      
      return false;
    
    case 'default':
      try {
        if (showCustomPrompt && typeof showCustomPrompt === 'function') {
          const userConsent = await showCustomPrompt();
          if (!userConsent) return false;
        }

        const permission = await Notification.requestPermission();
        
        console.log(`Notification permission: ${permission}`);
        
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    
    default:
      return false;
  }
};

/**
 * Register or get service worker
 */
const getOrRegisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser');
  }

  try {
    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (!registration) {
      console.log('🔧 Service worker not found, attempting to register...');
      
      try {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
          type: 'module',
          updateViaCache: 'none'
        });
        
        console.log('✅ Service worker registered');
        
        if (registration.installing) {
          await new Promise((resolve, reject) => {
            const worker = registration.installing;
            
            worker.addEventListener('statechange', () => {
              if (worker.state === 'activated') {
                console.log('✅ Service worker activated');
                resolve();
              } else if (worker.state === 'redundant') {
                reject(new Error('Service worker installation failed'));
              }
            });
            
            setTimeout(() => {
              resolve(); // Don't reject on timeout, just continue
            }, 5000);
          });
        }
      } catch (registerError) {
        console.error('❌ Failed to register service worker:', registerError);
        
        try {
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ Service worker registered with alternative method');
        } catch (altError) {
          throw new Error(`Service worker registration failed: ${registerError.message}`);
        }
      }
    }
    
    return registration;
  } catch (error) {
    console.error('❌ Service worker error:', error);
    throw error;
  }
};

/**
 * Get FCM token with caching and retry logic
 */
export const getFCMToken = async (options = {}) => {
  const {
    forceRefresh = false,
    useCache = true,
    maxRetries = 2,
    skipServiceWorkerCheck = false,
  } = options;

  if (useCache && cachedFCMToken && tokenExpiryTime && Date.now() < tokenExpiryTime && !forceRefresh) {
    return cachedFCMToken;
  }

  try {
    await initializeFirebase();
    
    if (!messaging) {
      throw new Error('Firebase Messaging not available');
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      throw new Error('VAPID key not configured');
    }

    let serviceWorkerRegistration;
    if (!skipServiceWorkerCheck) {
      serviceWorkerRegistration = await getOrRegisterServiceWorker();
    }

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration,
        });

        if (token) {
          cachedFCMToken = token;
          tokenExpiryTime = Date.now() + TOKEN_CACHE_DURATION;
          
          console.log('✅ FCM Token obtained successfully');
          return token;
        }
      } catch (error) {
        lastError = error;
        
        if (error.code === 'messaging/permission-blocked') {
          throw new Error('Notification permission blocked. Please enable in browser settings.');
        }
        
        if (error.code === 'messaging/invalid-vapid-key') {
          throw new Error('Invalid VAPID key configuration');
        }
        
        if (error.code === 'messaging/failed-service-worker-registration') {
          console.warn('⚠️ Service worker registration issue, retrying...');
          if (attempt === 0) {
            return getFCMToken({ ...options, skipServiceWorkerCheck: true, attempt: attempt + 1 });
          }
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      }
    }

    throw lastError || new Error('Failed to get FCM token');
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    
    clearCachedToken();
    
    throw error;
  }
};

/**
 * Validate and prepare user data for FCM
 */
export const prepareUserDataForFCM = (userData) => {
  // If no user data provided, try to get from localStorage (fallback)
  if (!userData) {
    try {
      if (typeof window !== 'undefined') {
        const storedUserInfo = localStorage.getItem('user_info');
        if (storedUserInfo) {
          userData = JSON.parse(storedUserInfo);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not get user info from localStorage:', e);
    }
  }

  // Validate the user data
  if (!userData || typeof userData !== 'object') {
    console.warn('⚠️ Invalid or missing user data for FCM');
    return null;
  }

  // Ensure we have the required fields
  const userId = userData.id || userData._id || userData.userId;
  if (!userId) {
    console.warn('⚠️ User data missing ID:', userData);
    return null;
  }

  return {
    id: userId,
    email: userData.email || '',
    name: userData.name || userData.fullName || userData.email?.split('@')[0] || '',
    role: userData.role || 'user',
    isVerified: userData.isVerified || false,
    isAdmin: userData.role === 'admin',
    isManager: userData.role === 'manager',
    // Include any additional data
    ...userData
  };
};

/**
 * Save FCM token to backend with NextAuth support
 */
export const saveTokenToBackend = async (token, additionalInfo = {}) => {
  const now = Date.now();
  
  // THROTTLING CHECK 1: Prevent saving if same token was saved recently
  if (lastTokenSaved === token && (now - lastTokenSaveTime) < TOKEN_SAVE_THROTTLE_MS) {
    console.log('⏭️ Skipping token save - same token saved recently');
    return { 
      success: true, 
      skipped: true, 
      message: 'Token already saved recently',
      lastSaveTime: lastTokenSaveTime
    };
  }
  
  // THROTTLING CHECK 2: Prevent concurrent saves
  if (isSavingToken) {
    console.log('⏳ Token save already in progress, skipping');
    return { 
      success: false, 
      error: 'save_in_progress',
      message: 'Token save already in progress'
    };
  }
  
  // THROTTLING CHECK 3: Global cooldown
  if ((now - lastTokenSaveTime) < TOKEN_SEND_COOLDOWN) {
    console.log('⏭️ In cooldown period, skipping save');
    return { 
      success: true, 
      skipped: true, 
      message: 'In cooldown period'
    };
  }
  
  isSavingToken = true;
  
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid FCM token');
    }

    // Get and validate user data
    const userData = prepareUserDataForFCM(additionalInfo.userData);
    
    if (!userData || !userData.id) {
      console.error('❌ No valid user data provided for FCM token save');
      throw new Error('User authentication required. Please log in first.');
    }

    console.log('✅ User found for FCM:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      isAdmin: userData.role === 'admin'
    });

    // Prepare device info
    const deviceInfo = {
      ...DeviceInfo.getBasicInfo(),
      ...additionalInfo.deviceInfo,
      os: DeviceInfo.getOS(),
    };

    console.log('📤 Attempting to save FCM token to backend...');

    // Prepare request body
    const requestBody = {
      token: token.trim(),
      deviceInfo,
      userId: userData.id,
      userEmail: userData.email,
      userName: userData.name || userData.email?.split('@')[0],
      userRole: userData.role,
      userIsVerified: userData.isVerified || false,
      isAdmin: userData.role === 'admin',
      authProvider: 'nextauth',
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };

    // Remove userData from the request body to avoid duplication
    delete requestBody.userData;

    console.log('📦 Sending request to Next.js backend...');

    const response = await fetch('/api/auth/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      credentials: 'include' // ✅ Important: Include cookies for NextAuth
    });

    const responseText = await response.text();
    
    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      throw new Error(`Server returned empty response. Status: ${response.status}`);
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
    }

    // Check if response is ok
    if (!response.ok) {
      let errorMessage = 'Unknown server error';
      if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // Check for "already exists" error
      const lowerErrorMessage = errorMessage.toLowerCase();
      if (lowerErrorMessage.includes('already exists') || 
          lowerErrorMessage.includes('token already') ||
          lowerErrorMessage.includes('duplicate') ||
          lowerErrorMessage.includes('already registered') ||
          lowerErrorMessage.includes('unique constraint')) {
        
        console.log('ℹ️ Token already exists in database, marking as success');
        
        // UPDATE THROTTLING VARIABLES ON "ALREADY EXISTS"
        lastTokenSaveTime = now;
        lastTokenSaved = token;
        isSavingToken = false;
        
        return {
          success: true,
          exists: true,
          message: 'Token already exists in database',
          token: token
        };
      }
      
      throw new Error(errorMessage);
    }

    // UPDATE THROTTLING VARIABLES ON SUCCESS
    lastTokenSaveTime = now;
    lastTokenSaved = token;
    
    console.log('✅ FCM token saved to backend successfully!');
    
    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('❌ Error saving token to backend:', error.message);
    
    // Handle specific error types
    if (error.message.includes('already exists') || 
        error.message.includes('Token already exists') ||
        error.message.includes('duplicate') ||
        error.message.includes('already registered')) {
      
      console.log('ℹ️ Token already exists in database, marking as success');
      
      // UPDATE THROTTLING VARIABLES ON "ALREADY EXISTS" ERROR
      lastTokenSaveTime = Date.now();
      lastTokenSaved = token;
      isSavingToken = false;
      
      return {
        success: true,
        exists: true,
        message: 'Token already exists in database',
        token: token
      };
    }
    
    if (error.message.includes('User authentication required') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden') ||
        error.message.includes('401') ||
        error.message.includes('403')) {
      
      console.warn('⚠️ Authentication issue - token save postponed');
      
      // Store token for later retry (temporarily in localStorage for this session only)
      if (typeof window !== 'undefined') {
        const pendingTokens = JSON.parse(localStorage.getItem('pending_fcm_tokens') || '[]');
        pendingTokens.push({
          token,
          deviceInfo: additionalInfo.deviceInfo || {},
          timestamp: Date.now(),
        });
        localStorage.setItem('pending_fcm_tokens', JSON.stringify(pendingTokens.slice(-5))); // Keep only last 5
        console.log('💾 Token stored for later retry');
      }
      
      return {
        success: false,
        error: 'auth_required',
        message: 'Token will be saved after authentication',
        requiresAuth: true,
      };
    }
    
    if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
      console.warn('🌐 Network error - will retry later');
      return {
        success: false,
        error: 'network_error',
        message: 'Network error - will retry when connection is restored',
        requiresAuth: false,
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    isSavingToken = false;
  }
};

/**
 * Process pending FCM tokens
 */
export const processPendingFCMTokens = async (userData = null) => {
  try {
    if (typeof window === 'undefined') return { success: false, message: 'Not in browser' };
    
    const pendingTokensStr = localStorage.getItem('pending_fcm_tokens');
    
    if (!pendingTokensStr) {
      console.log('📭 No pending FCM tokens to process');
      return { success: true, processed: 0, total: 0 };
    }
    
    console.log('🔄 Processing pending FCM tokens...');
    
    // Check if we have user data (passed from component)
    const validatedUserData = prepareUserDataForFCM(userData);
    if (!validatedUserData || !validatedUserData.id) {
      console.log('⏳ User not authenticated, keeping tokens pending');
      return { success: false, message: 'User not authenticated' };
    }
    
    let successful = 0;
    let failed = 0;
    let alreadyExists = 0;
    
    // Process pending tokens
    const pendingTokens = JSON.parse(pendingTokensStr);
    if (Array.isArray(pendingTokens) && pendingTokens.length > 0) {
      for (const pending of pendingTokens) {
        try {
          const result = await saveTokenToBackend(pending.token, {
            userData: validatedUserData,
            deviceInfo: pending.deviceInfo
          });
          
          if (result && (result.success || result.exists)) {
            if (result.exists) {
              alreadyExists++;
            } else {
              successful++;
            }
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          console.error('Failed to save pending token:', error.message);
        }
      }
      
      // Remove processed tokens
      if (successful + alreadyExists > 0) {
        const remainingTokens = pendingTokens.slice(successful + alreadyExists);
        if (remainingTokens.length > 0) {
          localStorage.setItem('pending_fcm_tokens', JSON.stringify(remainingTokens));
        } else {
          localStorage.removeItem('pending_fcm_tokens');
        }
      }
    }
    
    console.log(`✅ Processed ${successful} tokens, ${alreadyExists} already existed, ${failed} failed`);
    return { 
      success: true, 
      processed: successful, 
      alreadyExists,
      failed, 
      total: successful + alreadyExists + failed 
    };
  } catch (error) {
    console.error('Error processing pending tokens:', error);
    return { success: false, error: error.message };
  }
};

// ==================== THROTTLED NOTIFICATION SETUP ====================
let lastSetupAttempt = 0;
const SETUP_COOLDOWN_MS = 60000; // 60 seconds between setup attempts

/**
 * Complete admin notification setup - WITH THROTTLING
 * userData parameter is now required
 */
export const setupAdminNotifications = async (userData, options = {}) => {
  const now = Date.now();
  
  // Throttle setup attempts
  if ((now - lastSetupAttempt) < SETUP_COOLDOWN_MS) {
    console.log('⏭️ Setup throttled - too recent');
    return {
      success: false,
      error: 'throttled',
      message: 'Setup attempt throttled. Please wait before retrying.'
    };
  }
  
  lastSetupAttempt = now;
  
  const {
    requestPermission = true,
    showCustomPrompt = null,
    onSetupComplete = null,
    onSetupError = null,
  } = options;

  try {
    console.log('🔧 Setting up admin notifications...');
    
    if (!isNotificationSupported()) {
      throw new Error('Browser does not support notifications');
    }

    // Validate user data
    const validatedUserData = prepareUserDataForFCM(userData);
    if (!validatedUserData || !validatedUserData.id) {
      throw new Error('User data required for notification setup');
    }

    if (requestPermission) {
      const hasPermission = await requestNotificationPermission({ showCustomPrompt });
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }
    }

    const token = await getFCMToken();
    if (!token) {
      throw new Error('Failed to obtain FCM token');
    }

    console.log('✅ FCM token obtained, saving to backend...');
    
    const saveResult = await saveTokenToBackend(token, {
      userData: validatedUserData,
      userType: 'admin',
      setupTimestamp: new Date().toISOString(),
    });
    
    // Handle auth required response
    if (saveResult && saveResult.requiresAuth === true) {
      console.log('⏳ Authentication required - setup will retry');
      
      // Set up retry when auth is ready
      if (typeof window !== 'undefined') {
        const handleAuthReady = () => {
          console.log('🔄 Auth ready, retrying FCM setup...');
          window.removeEventListener('auth-ready', handleAuthReady);
          
          setTimeout(() => {
            setupAdminNotifications(validatedUserData, options)
              .then(result => {
                if (onSetupComplete) onSetupComplete(result);
              })
              .catch(retryError => {
                if (onSetupError) onSetupError(retryError);
              });
          }, 5000); // Longer delay for auth retry
        };
        
        window.addEventListener('auth-ready', handleAuthReady);
      }
      
      if (onSetupError) {
        onSetupError(new Error('Authentication required. Setup will continue after login.'));
      }
      
      return {
        success: false,
        error: 'Authentication required',
        requiresAuth: true,
      };
    }
    
    // Handle already exists case
    if (saveResult && saveResult.exists === true) {
      console.log('✅ Token already exists in database, setup complete');
      
      if (onSetupComplete) {
        onSetupComplete({ token, saveResult, exists: true });
      }
      
      return {
        success: true,
        token,
        exists: true,
        saveResult,
      };
    }
    
    console.log('✅ Admin notifications setup complete');
    
    if (onSetupComplete) {
      onSetupComplete({ token, saveResult });
    }
    
    return {
      success: true,
      token,
      saveResult,
    };
  } catch (error) {
    console.error('❌ Admin notification setup failed:', error);
    
    if (onSetupError) onSetupError(error);
    
    return {
      success: false,
      error: error.message,
      requiresAuth: error.message.includes('auth') || error.message.includes('401') || error.message.includes('403'),
    };
  }
};

/**
 * Delete token from backend
 */
export const deleteTokenFromBackend = async (options = {}) => {
  const { token: specificToken, deviceId, clearAll = false, userData } = options;

  try {
    let tokenToDelete = specificToken || cachedFCMToken;

    if (!tokenToDelete && !deviceId && !clearAll) {
      throw new Error('No token specified for deletion');
    }

    // User data must be provided
    const validatedUserData = prepareUserDataForFCM(userData);
    if (!validatedUserData || !validatedUserData.id) {
      throw new Error('User data required for token deletion');
    }

    const response = await fetch('/api/auth/fcm-token', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: clearAll ? null : tokenToDelete,
        deviceId,
        clearAll,
        userId: validatedUserData.id,
      }),
    });

    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete token');
    }

    clearCachedToken();

    if (messaging && tokenToDelete) {
      try {
        await deleteToken(messaging);
        console.log('✅ Token deleted from Firebase');
      } catch (firebaseError) {
        console.warn('⚠️ Could not delete token from Firebase:', firebaseError);
      }
    }

    console.log('✅ Token deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error deleting token:', error);
    throw error;
  }
};

/**
 * Setup foreground message listener
 */
export const setupForegroundMessageListener = (callbacks = {}) => {
  if (!messaging) {
    console.warn('Messaging not available for foreground listener');
    return () => {};
  }

  const {
    onMessageReceived = null,
    onNotificationClick = null,
    onNotificationClose = null,
    showDefaultNotification = true,
    notificationOptions = {},
  } = callbacks;

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('📨 Foreground message received:', payload);
    
    if (onMessageReceived) {
      onMessageReceived(payload);
    }

    if (showDefaultNotification && Notification.permission === 'granted') {
      try {
        const notificationTitle = payload.notification?.title || 
                                 payload.data?.title || 
                                 'New Notification';
        
        const notificationBody = payload.notification?.body || 
                                payload.data?.body || 
                                '';
        
        const notificationIcon = payload.notification?.icon || 
                                payload.data?.icon || 
                                '/favicon.ico';
        
        const notification = new Notification(notificationTitle, {
          body: notificationBody,
          icon: notificationIcon,
          badge: '/favicon.ico',
          tag: payload.data?.tag || 'admin-notification',
          data: payload.data || {},
          requireInteraction: payload.data?.requireInteraction || false,
          ...notificationOptions,
        });

        notification.onclick = (event) => {
          notification.close();
          window.focus();
          
          if (onNotificationClick) {
            onNotificationClick(payload, event);
          }
          
          const clickAction = payload.notification?.clickAction || payload.data?.clickAction;
          if (clickAction) {
            window.open(clickAction, '_blank');
          }
        };

        notification.onclose = (event) => {
          if (onNotificationClose) {
            onNotificationClose(payload, event);
          }
        };
      } catch (error) {
        console.error('❌ Error creating notification:', error);
      }
    }
  });

  return unsubscribe;
};

// ==================== THROTTLED REFRESH ====================
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 120000; // 2 minutes between refreshes

/**
 * Refresh FCM token and update backend - WITH THROTTLING
 */
export const refreshFCMToken = async (userData = null) => {
  const now = Date.now();
  
  // Throttle refresh attempts
  if ((now - lastRefreshTime) < REFRESH_COOLDOWN_MS) {
    console.log('⏭️ Refresh throttled');
    return { token: cachedFCMToken, refreshSkipped: true };
  }
  
  lastRefreshTime = now;
  
  try {
    const newToken = await getFCMToken({ forceRefresh: true });
    
    if (newToken) {
      const validatedUserData = prepareUserDataForFCM(userData);
      const saveResult = await saveTokenToBackend(newToken, { userData: validatedUserData });
      console.log('🔄 FCM token refreshed successfully');
      return { token: newToken, saveResult };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error refreshing FCM token:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Authentication required')) {
      console.log('⏳ Cannot refresh token - authentication required');
      return null;
    }
    
    throw error;
  }
};

/**
 * Get current cached token
 */
export const getCurrentFCMToken = async () => {
  if (cachedFCMToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedFCMToken;
  }
  
  try {
    cachedFCMToken = await getFCMToken({ useCache: false });
    return cachedFCMToken;
  } catch (error) {
    console.warn('⚠️ Could not get current FCM token:', error.message);
    return null;
  }
};

/**
 * Clear cached token
 */
export const clearCachedToken = () => {
  cachedFCMToken = null;
  tokenExpiryTime = null;
  lastTokenSaveTime = 0;
  lastTokenSaved = null;
  console.log('🧹 Cached FCM token cleared');
};

/**
 * Check if token is cached and valid
 */
export const isTokenCached = () => {
  return !!(cachedFCMToken && tokenExpiryTime && Date.now() < tokenExpiryTime);
};

/**
 * Get token status
 */
export const getTokenStatus = async () => {
  try {
    const permission = getNotificationPermission();
    const token = await getCurrentFCMToken();
    const cached = isTokenCached();
    const supported = isNotificationSupported();
    
    return {
      permission,
      hasToken: !!token,
      token: token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : null,
      isCached: cached,
      isSupported: supported,
      deviceInfo: DeviceInfo.getBasicInfo(),
      serviceWorkerReady: 'serviceWorker' in navigator,
      lastSaveTime: lastTokenSaveTime,
      lastTokenSaved: lastTokenSaved ? `${lastTokenSaved.substring(0, 20)}...` : null,
    };
  } catch (error) {
    console.warn('⚠️ Error getting token status:', error.message);
    return {
      permission: getNotificationPermission(),
      hasToken: false,
      token: null,
      isCached: false,
      isSupported: isNotificationSupported(),
      deviceInfo: DeviceInfo.getBasicInfo(),
      serviceWorkerReady: false,
      error: error.message,
    };
  }
};

/**
 * Check service worker status
 */
export const checkServiceWorkerStatus = async () => {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, registered: false, error: 'Service workers not supported' };
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    return {
      supported: true,
      registered: !!registration,
      registration: registration,
      scope: registration?.scope,
      state: registration?.active?.state || 'not-found'
    };
  } catch (error) {
    return {
      supported: true,
      registered: false,
      error: error.message
    };
  }
};

/**
 * Manual service worker registration
 */
export const registerServiceWorkerManually = async () => {
  return getOrRegisterServiceWorker();
};

/**
 * Check if user is admin (for components that need to check before calling FCM)
 */
export const isAdminUser = (userData) => {
  const validatedUserData = prepareUserDataForFCM(userData);
  return validatedUserData && validatedUserData.role === 'admin';
};

/**
 * Initialize FCM with user authentication check
 */
export const initializeFCMWithAuth = async (userData) => {
  try {
    const validatedUserData = prepareUserDataForFCM(userData);
    
    if (!validatedUserData || !validatedUserData.id) {
      console.warn('⚠️ Cannot initialize FCM - user not authenticated');
      return {
        success: false,
        error: 'User not authenticated',
        requiresAuth: true
      };
    }
    
    if (validatedUserData.role !== 'admin') {
      console.log('⏭️ Skipping FCM initialization - user is not admin');
      return {
        success: false,
        error: 'User is not admin',
        requiresAdmin: true
      };
    }
    
    // Check notification support
    if (!isNotificationSupported()) {
      return {
        success: false,
        error: 'Notifications not supported'
      };
    }
    
    // Get current permission
    const permission = getNotificationPermission();
    
    if (permission === 'granted') {
      const token = await getFCMToken();
      if (token) {
        const saveResult = await saveTokenToBackend(token, { userData: validatedUserData });
        return {
          success: true,
          token,
          saveResult,
          permission
        };
      }
    }
    
    return {
      success: false,
      permission,
      requiresPermission: permission !== 'granted'
    };
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export DeviceInfo class
export { DeviceInfo };