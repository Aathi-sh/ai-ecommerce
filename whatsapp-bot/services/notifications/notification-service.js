

// services/notifications/notification-service.js - COMPLETE FIXED VERSION
import apiService from "../apiService.js";

// Firebase import with fallback
let firebaseAdmin = null;
let firebaseEnabled = false;

try {
    const { messaging } = await import("../firebase/firebase-admin.js");
    firebaseAdmin = { messaging };
    firebaseEnabled = process.env.FIREBASE_ENABLED === 'true';
    console.log('✅ Firebase Admin SDK loaded successfully');
} catch (error) {
    console.log('⚠️ Firebase Admin SDK not available:', error.message);
    firebaseEnabled = false;
}

class NotificationService {
  constructor() {
    this.categories = {
      ORDER: 'order',
      PAYMENT: 'payment',
      STOCK: 'stock',
      INVOICE: 'invoice',
      SYSTEM: 'system',
      ALERT: 'alert'
    };

    this.priorities = {
      HIGH: 'high',
      NORMAL: 'normal',
      LOW: 'low',
      URGENT: 'urgent'
    };

    console.log('🔔 Notification Service Initialized:', {
      firebase: firebaseEnabled ? 'ENABLED' : 'DISABLED'
    });
  }

  /**
   * Get admin tokens via Next.js API
   */
  async getAdminTokensFromDB() {
    try {
      console.log('📱 Fetching admin FCM tokens via Next.js API...');
      
      // Use apiService to call Next.js API
      let tokenResponse;
      
      // Try different method names that might exist
      if (typeof apiService.getAdminFCMTokens === 'function') {
        tokenResponse = await apiService.getAdminFCMTokens();
      } else if (typeof apiService.saveFCMToken === 'function') {
        // If no get method, try to check if we have a different approach
        console.log('ℹ️ Using fallback method for tokens');
        // Return empty array for now - we'll handle this differently
        return [];
      } else {
        console.error('❌ No FCM token method found in apiService');
        return [];
      }
      
      console.log('🔍 Token API Response:', {
        success: tokenResponse?.success,
        count: tokenResponse?.tokens?.length || tokenResponse?.count || 0
      });

      if (!tokenResponse || (!tokenResponse.success && !Array.isArray(tokenResponse))) {
        console.warn('⚠️ No valid tokens received from API');
        return [];
      }

      // Extract token strings from API response (handle different response formats)
      let fcmTokens = [];
      
      if (Array.isArray(tokenResponse)) {
        fcmTokens = tokenResponse.map(t => t.fcmToken || t.token || t);
      } else if (tokenResponse.tokens && Array.isArray(tokenResponse.tokens)) {
        fcmTokens = tokenResponse.tokens.map(t => t.fcmToken || t.token || t);
      } else if (tokenResponse.data && Array.isArray(tokenResponse.data)) {
        fcmTokens = tokenResponse.data.map(t => t.fcmToken || t.token || t);
      }
      
      // Filter valid tokens
      const validTokens = fcmTokens.filter(token => {
        return token && typeof token === 'string' && token.trim().length > 50;
      });

      console.log(`✅ Retrieved ${validTokens.length} valid tokens from Next.js API`);
      return validTokens;

    } catch (error) {
      console.error('❌ Failed to fetch tokens from Next.js API:', error.message);
      return [];
    }
  }

  /**
   * Convert all values to strings for Firebase data payload
   */
  _stringifyFirebaseData(data) {
    const stringified = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        stringified[key] = '';
      } else if (typeof value === 'object') {
        stringified[key] = JSON.stringify(value);
      } else {
        stringified[key] = String(value);
      }
    }
    
    return stringified;
  }

  async sendPushNotification(notificationData) {
    try {
      // Check if Firebase is available
      if (!firebaseEnabled || !firebaseAdmin?.messaging) {
        console.log('⚠️ Firebase not available, skipping push notification');
        return {
          success: false,
          error: 'Firebase not configured or disabled',
          message: 'Push notifications disabled'
        };
      }

      // Get tokens via API
      const tokens = await this.getAdminTokensFromDB();
      
      if (tokens.length === 0) {
        console.log('⚠️ No FCM tokens available for admin devices');
        return { 
          success: false, 
          error: 'No active admin devices found',
          message: 'Please login as admin and enable notifications'
        };
      }

      // Create notification message with STRINGIFIED data
      const message = {
        notification: {
          title: String(notificationData.title || ''),
          body: String(notificationData.body || ''),
        },
        // CRITICAL FIX: Ensure all data values are strings
        data: this._stringifyFirebaseData({
          type: notificationData.type || 'general',
          category: notificationData.category || this.categories.SYSTEM,
          priority: notificationData.priority || this.priorities.NORMAL,
          referenceId: notificationData.referenceId || '',
          orderNumber: notificationData.orderNumber || '',
          actionUrl: notificationData.actionUrl || '',
          timestamp: new Date().toISOString(),
          ...(notificationData.extraData || {})
        }),
        android: {
          priority: notificationData.priority === this.priorities.HIGH ? 'high' : 'normal',
          notification: {
            sound: 'default',
            channelId: 'admin_channel',
            icon: 'ic_notification',
            color: '#FF6B35',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              category: 'SYSTEM'
            }
          }
        }
      };

      // Send to each token individually
      const results = [];
      let successCount = 0;
      
      for (const token of tokens) {
        try {
          const cleanToken = token.trim();
          
          // Send individual message
          const result = await firebaseAdmin.messaging.send({
            ...message,
            token: cleanToken
          });
          
          successCount++;
          results.push({
            token: cleanToken.substring(0, 20) + '...',
            success: true,
            messageId: result
          });
          
          console.log(`✅ Sent to token ${cleanToken.substring(0, 20)}...`);
          
        } catch (tokenError) {
          console.error(`❌ Failed to send to token ${token.substring(0, 20)}...:`, tokenError.message);
          
          results.push({
            token: token.substring(0, 20) + '...',
            success: false,
            error: tokenError.message
          });
        }
      }

      const failureCount = results.filter(r => !r.success).length;
      
      return {
        success: successCount > 0,
        successCount,
        failureCount,
        tokensSent: tokens.length,
        results,
        message: `Sent to ${successCount}/${tokens.length} devices`
      };

    } catch (error) {
      console.error('❌ Error sending push notification:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendNewOrderNotification(orderData) {
    try {
      console.log(`🔥 Sending Firebase push notification for order: ${orderData.orderNumber}`);
      
      // Prepare data with ALL STRINGS for Firebase
      const result = await this.sendPushNotification({
        title: `🛒 New Order #${orderData.orderNumber}`,
        body: `${orderData.customerName || 'Customer'} placed a new order for ₹${orderData.totalPrice || orderData.totalAmount || 0}`,
        type: 'NEW_ORDER',
        category: this.categories.ORDER,
        priority: this.priorities.HIGH,
        orderNumber: String(orderData.orderNumber || ''),
        referenceId: String(orderData._id || orderData.orderNumber || ''),
        extraData: {
          orderId: String(orderData._id || ''),
          orderNumber: String(orderData.orderNumber || ''),
          customerName: String(orderData.customerName || 'Customer'),
          totalAmount: String(orderData.totalAmount || orderData.totalPrice || '0'),
          source: 'whatsapp-bot',
          timestamp: new Date().toISOString(),
          status: String(orderData.status || 'pending'),
          paymentStatus: String(orderData.paymentStatus || 'pending')
        }
      });
      
      console.log(`✅ Firebase result:`, {
        success: result.success,
        devices: result.successCount || 0,
        message: result.message
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Order notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPaymentNotification(paymentData) {
    try {
      return await this.sendPushNotification({
        title: '💰 Payment Received',
        body: `₹${paymentData.amount} received for Order #${paymentData.orderNumber}`,
        type: 'PAYMENT_RECEIVED',
        category: this.categories.PAYMENT,
        priority: this.priorities.HIGH,
        orderNumber: String(paymentData.orderNumber || ''),
        extraData: {
          amount: String(paymentData.amount || '0'),
          orderNumber: String(paymentData.orderNumber || ''),
          paymentMethod: String(paymentData.paymentMethod || ''),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Payment notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendLowStockNotification(productData) {
    try {
      return await this.sendPushNotification({
        title: '📦 Low Stock Alert',
        body: `${productData.productName || productData.name} is running low (${productData.stock} left)`,
        type: 'LOW_STOCK',
        category: this.categories.STOCK,
        priority: this.priorities.NORMAL,
        extraData: {
          productName: String(productData.productName || productData.name || ''),
          stock: String(productData.stock || '0'),
          threshold: String(productData.threshold || '10'),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Low stock notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWhatsAppNotification(orderData) {
    try {
      console.log(`📱 Sending WhatsApp dashboard notification for order: ${orderData.orderNumber}`);

      let socketResult = null;
      let apiResult = null;

      // 1. Try Socket.IO first
      try {
        if (global.io && global.io.of) {
          const notificationNamespace = global.io.of('/notifications');
          
          // Emit to all clients in notifications namespace
          notificationNamespace.emit('NEW_ORDER', {
            type: 'NEW_ORDER',
            order: {
              _id: orderData._id || orderData.id || '',
              orderNumber: orderData.orderNumber || '',
              customerName: orderData.customerName || 'Customer',
              customerPhone: orderData.customerPhone || orderData.phoneNumber || '',
              totalPrice: orderData.totalPrice || orderData.totalAmount || 0,
              totalAmount: orderData.totalAmount || orderData.totalPrice || 0,
              items: orderData.items || [],
              status: orderData.status || 'pending',
              paymentStatus: orderData.paymentStatus || 'pending',
              createdAt: orderData.createdAt || new Date().toISOString()
            },
            timestamp: new Date().toISOString(),
            priority: 'high'
          });
          
          socketResult = { success: true, method: 'socket.io' };
          console.log('✅ Socket.IO notification sent');
        } else {
          console.log('⚠️ Socket.IO not available globally');
        }
      } catch (socketError) {
        console.error('❌ Socket.IO notification failed:', socketError.message);
        socketResult = { success: false, error: socketError.message };
      }

      // 2. Try Next.js API
      try {
        // Check if apiService has the method, if not use a simpler approach
        if (typeof apiService.sendNotificationToDashboard === 'function') {
          const notificationPayload = {
            type: 'NEW_ORDER',
            priority: 'urgent',
            data: {
              orderId: orderData._id || orderData.id || '',
              orderNumber: orderData.orderNumber || '',
              customerName: orderData.customerName || 'Customer',
              customerPhone: orderData.customerPhone || orderData.phoneNumber || '',
              totalAmount: orderData.totalAmount || orderData.totalPrice || 0,
              items: orderData.items || [],
              paymentStatus: orderData.paymentStatus || 'pending',
              status: orderData.status || 'pending',
              createdAt: orderData.createdAt || new Date().toISOString(),
              source: 'whatsapp-bot'
            }
          };

          const response = await apiService.sendNotificationToDashboard(notificationPayload);
          apiResult = {
            success: true,
            data: response
          };
          console.log('✅ Next.js API notification sent');
        } else {
          // Fallback: Try a simpler API call
          console.log('ℹ️ Using fallback API method');
          try {
            const response = await apiService.client.post('/api/notifications', {
              type: 'NEW_ORDER',
              order: orderData,
              timestamp: new Date().toISOString()
            });
            apiResult = { success: true, data: response.data };
          } catch (fallbackError) {
            console.log('⚠️ Fallback API also failed, dashboard may not be configured');
          }
        }
      } catch (apiError) {
        console.error('❌ Next.js API notification failed:', apiError.message);
        apiResult = { success: false, error: apiError.message };
      }

      return {
        success: socketResult?.success || apiResult?.success || false,
        orderNumber: orderData.orderNumber,
        socket: socketResult,
        api: apiResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ WhatsApp notification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendCompleteNotification(orderData) {
    try {
      console.log(`🚀 Sending complete notification for order: ${orderData.orderNumber}`);

      // 1. Send Firebase push notification
      const firebaseResult = await this.sendNewOrderNotification(orderData);
      
      // 2. Send WhatsApp/dashboard notification
      const dashboardResult = await this.sendWhatsAppNotification(orderData);

      return {
        success: firebaseResult.success || dashboardResult.success,
        orderNumber: orderData.orderNumber,
        firebase: firebaseResult,
        dashboard: dashboardResult,
        timestamp: new Date().toISOString(),
        message: 'Notifications sent through available channels'
      };

    } catch (error) {
      console.error('❌ Complete notification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendTestNotification(customData = {}) {
    try {
      const testOrderData = {
        orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
        customerName: customData.customerName || 'Test Customer',
        customerPhone: customData.customerPhone || '9876543210',
        totalAmount: customData.totalAmount || 1999,
        totalPrice: customData.totalAmount || 1999,
        items: customData.items || [{ name: 'Test Product', quantity: 1, price: 1999 }],
        paymentStatus: customData.paymentStatus || 'pending',
        status: customData.status || 'pending',
        createdAt: new Date().toISOString(),
        _id: `test-${Date.now()}`,
        ...customData
      };

      console.log('🧪 Sending test notification...');
      
      const result = await this.sendCompleteNotification(testOrderData);
      
      console.log('✅ Test notification result:', result.success);
      
      return {
        test: true,
        orderNumber: testOrderData.orderNumber,
        timestamp: new Date().toISOString(),
        result
      };
      
    } catch (error) {
      console.error('❌ Test notification failed:', error.message);
      return {
        test: true,
        success: false,
        error: error.message
      };
    }
  }

  async checkDashboardHealth() {
    try {
      if (typeof apiService.healthCheck === 'function') {
        const response = await apiService.healthCheck();
        
        return {
          healthy: response.status === 'healthy',
          dashboard: response.status,
          timestamp: new Date().toISOString(),
          details: response.data
        };
      } else {
        // Simple check - just ping the server
        try {
          const response = await fetch(`${process.env.NEXTJS_API_URL || 'http://localhost:3000'}/api/health`, {
            timeout: 5000
          });
          
          return {
            healthy: response.ok,
            dashboard: response.ok ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString()
          };
        } catch (fetchError) {
          return {
            healthy: false,
            error: fetchError.message,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error('❌ Dashboard health check failed:', error.message);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get notification status
   */
  async getNotificationStatus() {
    try {
      // Get Firebase status
      const firebaseStatus = {
        enabled: firebaseEnabled,
        messaging: !!firebaseAdmin?.messaging
      };

      // Get tokens info
      let tokenInfo = { success: false, count: 0 };
      try {
        const tokens = await this.getAdminTokensFromDB();
        tokenInfo = {
          success: true,
          count: tokens.length,
          hasTokens: tokens.length > 0
        };
      } catch (tokenError) {
        tokenInfo.error = tokenError.message;
      }

      // Check dashboard health
      const dashboardHealth = await this.checkDashboardHealth();

      return {
        firebase: firebaseStatus,
        tokens: tokenInfo,
        dashboard: dashboardHealth,
        timestamp: new Date().toISOString(),
        overallStatus: (firebaseStatus.enabled && tokenInfo.hasTokens) ? 'healthy' : 'degraded'
      };

    } catch (error) {
      console.error('❌ Error getting notification status:', error.message);
      return { 
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simple method to send notification (for backward compatibility)
   */
  async sendNotification(type, data) {
    switch (type) {
      case 'NEW_ORDER':
        return await this.sendCompleteNotification(data);
      case 'PAYMENT_RECEIVED':
        return await this.sendPaymentNotification(data);
      case 'LOW_STOCK_ALERT':
        return await this.sendLowStockNotification(data);
      case 'TEST':
        return await this.sendTestNotification(data);
      default:
        return {
          success: false,
          error: `Unknown notification type: ${type}`
        };
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;