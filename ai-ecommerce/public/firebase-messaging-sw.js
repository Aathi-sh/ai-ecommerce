// firebase-messaging-sw.js - Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// ⚠️ IMPORTANT: You MUST put your actual Firebase config here
// Service workers cannot access environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDOk2jTZl5n0_cZb3skDiGfXIxnXyU0QW4", // Replace with your actual API key
  authDomain: "ai-ecommerce-4cc1e.firebaseapp.com", // Replace with your actual auth domain
  projectId: "ai-ecommerce-4cc1e", // Replace with your actual project ID
  storageBucket: "ai-ecommerce-4cc1e.firebasestorage.app", // Replace with your actual storage bucket
  messagingSenderId: "939549275544", // Replace with your actual sender ID
  appId: "1:939549275544:web:cd73a2f2dd92cf703f27ed", // Replace with your actual app ID
};

// Validate config (will show errors in console if missing)
const validateConfig = () => {
  const missing = [];
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value || value.includes('YOUR_ACTUAL')) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ FIREBASE CONFIG ERROR: Missing configuration in service worker:', missing);
    console.error('Please replace the placeholder values in firebase-messaging-sw.js with your actual Firebase config.');
  } else {
    console.log('✅ Firebase config validated successfully in service worker');
  }
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized in service worker');
  validateConfig();
} catch (error) {
  console.error('❌ Failed to initialize Firebase in service worker:', error);
}

const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;

if (!messaging) {
  console.warn('⚠️ Firebase Messaging not supported in this environment');
}

// ========== BACKGROUND MESSAGE HANDLER ==========
messaging.onBackgroundMessage((payload) => {
  console.log('📨 [Service Worker] Background message received:', payload);

  // Extract notification data
  const notificationTitle = payload.data?.title || 
                           payload.notification?.title || 
                           'Admin Notification';
  
  const notificationOptions = {
    body: payload.data?.body || 
          payload.notification?.body || 
          'You have a new message',
    icon: payload.data?.icon || 
          payload.notification?.icon || 
          '/favicon.ico',
    badge: '/favicon.ico',
    image: payload.data?.image || payload.notification?.image,
    data: payload.data || {},
    tag: payload.data?.tag || 'admin-notification',
    timestamp: payload.data?.timestamp || Date.now(),
    requireInteraction: payload.data?.requireInteraction || true,
    silent: false,
    vibrate: [200, 100, 200], // Vibration pattern for mobile devices
    actions: payload.data?.actions || [],
  };

  // Show notification
  try {
    self.registration.showNotification(notificationTitle, notificationOptions);
    console.log('📢 Notification shown from background:', notificationTitle);
  } catch (error) {
    console.error('❌ Failed to show notification:', error);
  }
});

// ========== NOTIFICATION CLICK HANDLER ==========
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [Service Worker] Notification clicked:', event.notification);
  
  // Close the notification
  event.notification.close();
  
  // Extract data from notification
  const data = event.notification.data || {};
  const notificationType = data.type || 'general';
  
  // Determine URL to open based on notification type
  let urlToOpen = '/admin/dashboard';
  
  switch (notificationType) {
    case 'NEW_ORDER':
      urlToOpen = data.orderId ? `/admin/orders/${data.orderId}` : '/admin/orders';
      break;
    case 'ORDER_UPDATED':
      urlToOpen = data.orderId ? `/admin/orders/${data.orderId}` : '/admin/orders';
      break;
    case 'NEW_USER':
      urlToOpen = data.userId ? `/admin/users/${data.userId}` : '/admin/users';
      break;
    case 'MESSAGE':
      urlToOpen = '/admin/messages';
      break;
    case 'ALERT':
      urlToOpen = '/admin/alerts';
      break;
    default:
      urlToOpen = data.url || '/admin/dashboard';
  }
  
  console.log(`🔄 Opening: ${urlToOpen} for notification type: ${notificationType}`);

  // Focus or open window
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((windowClients) => {
      // Check if there's already a window/tab open with this URL
      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen, self.location.origin);
        
        if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
          console.log('🔍 Found existing window, focusing...');
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        console.log('🆕 Opening new window...');
        return clients.openWindow(urlToOpen);
      }
    }).catch((error) => {
      console.error('❌ Error handling notification click:', error);
    })
  );
});

// ========== NOTIFICATION CLOSE HANDLER ==========
self.addEventListener('notificationclose', (event) => {
  console.log('❌ [Service Worker] Notification closed:', event.notification);
  const data = event.notification.data || {};
  
  // You could send analytics here
  console.log(`📊 Notification closed - Type: ${data.type || 'unknown'}, ID: ${data.id || 'N/A'}`);
});

// ========== PUSH SUBSCRIPTION HANDLER ==========
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 [Service Worker] Push subscription changed');
  
  event.waitUntil(
    self.registration.pushManager.getSubscription()
      .then((subscription) => {
        if (!subscription) {
          console.log('📭 No push subscription found');
          return;
        }
        
        console.log('📋 Current subscription:', subscription.endpoint);
        
        // Here you could send the new subscription to your server
        // to update the user's FCM token
        // fetch('/api/update-subscription', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ subscription })
        // });
      })
      .catch((error) => {
        console.error('❌ Error getting push subscription:', error);
      })
  );
});

// ========== SERVICE WORKER INSTALLATION ==========
self.addEventListener('install', (event) => {
  console.log('⚙️ [Service Worker] Installing...');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('✅ [Service Worker] Activated and ready');
  
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

// ========== DEBUG HELPER ==========
// Send messages to all clients (for debugging)
const sendMessageToClients = (message) => {
  clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
};

// Listen for messages from clients
self.addEventListener('message', (event) => {
  console.log('📩 [Service Worker] Message from client:', event.data);
  
  // Handle different message types
  switch (event.data.type) {
    case 'DEBUG':
      console.log('🔧 Debug info requested');
      sendMessageToClients({
        type: 'DEBUG_RESPONSE',
        data: {
          serviceWorkerVersion: '1.0.0',
          timestamp: new Date().toISOString(),
          firebaseInitialized: !!firebase.apps.length,
        }
      });
      break;
      
    case 'CHECK_SUBSCRIPTION':
      self.registration.pushManager.getSubscription()
        .then((subscription) => {
          sendMessageToClients({
            type: 'SUBSCRIPTION_STATUS',
            data: { hasSubscription: !!subscription }
          });
        });
      break;
  }
});