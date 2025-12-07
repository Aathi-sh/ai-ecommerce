// services/notifications/notification-service.js

/**
 * Base Notification Service
 * Handles Firebase Cloud Messaging operations
 * ADMIN-ONLY notifications
 */

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
      LOW: 'low'
    };

    this.messaging = null;
    console.log('🔔 Admin Notification Service initialized');
  }

  /**
   * Lazy load Firebase messaging
   */
  async getMessaging() {
    if (!this.messaging) {
      try {
        const { messaging } = await import('../firebase/firebase-admin.js');
        this.messaging = messaging;
        console.log('✅ Firebase messaging loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load Firebase messaging:', error);
        throw new Error('Firebase messaging not available');
      }
    }
    return this.messaging;
  }

  /**
   * Get admin FCM tokens from configuration
   */
  getAdminTokens() {
    const adminTokens = process.env.ADMIN_FCM_TOKENS 
      ? process.env.ADMIN_FCM_TOKENS.split(',').filter(token => token.trim())
      : [];

    if (adminTokens.length === 0) {
      console.warn('⚠️ No admin FCM tokens configured in environment variables');
    }

    return adminTokens;
  }

  /**
   * Send push notification to admin devices
   */
  async sendPushNotification(notificationData) {
    try {
      const tokens = this.getAdminTokens();
      
      if (tokens.length === 0) {
        console.warn('⚠️ No FCM tokens available for notification');
        return { 
          success: false, 
          error: 'No admin tokens configured',
          action: 'Set ADMIN_FCM_TOKENS environment variable'
        };
      }

      const messaging = await this.getMessaging();

      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          imageUrl: notificationData.imageUrl
        },
        data: {
          type: notificationData.type || 'general',
          category: notificationData.category || this.categories.SYSTEM,
          priority: notificationData.priority || this.priorities.NORMAL,
          referenceId: notificationData.referenceId || '',
          actionUrl: notificationData.actionUrl || '',
          timestamp: new Date().toISOString(),
          ...notificationData.extraData
        },
        android: {
          priority: notificationData.priority === this.priorities.HIGH ? 'high' : 'normal',
          notification: {
            sound: 'default',
            channelId: notificationData.channelId || 'admin_channel',
            icon: notificationData.icon || 'ic_notification',
            color: notificationData.color || '#FF6B35',
            clickAction: notificationData.clickAction || 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: notificationData.badge || 1,
              category: notificationData.category || 'SYSTEM'
            }
          }
        },
        tokens: tokens
      };

      console.log(`📤 Sending push notification to admin devices:`, {
        title: notificationData.title,
        category: notificationData.category,
        referenceId: notificationData.referenceId
      });

      const response = await messaging.sendEachForMulticast(message);
      
      console.log(`✅ Admin notification sent:`, {
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return {
        success: response.successCount > 0,
        response,
        successCount: response.successCount,
        failureCount: response.failureCount,
        tokensSent: tokens.length
      };

    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Send notification to admin users
   */
  async sendAdminNotification(title, body, notificationData = {}) {
    try {
      const result = await this.sendPushNotification({
        title,
        body,
        category: notificationData.category || this.categories.SYSTEM,
        priority: notificationData.priority || this.priorities.NORMAL,
        ...notificationData
      });

      return result;

    } catch (error) {
      console.error('❌ Error in sendAdminNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification() {
    try {
      const testData = {
        title: '🔔 Test Notification',
        body: 'This is a test notification to admin devices',
        category: this.categories.SYSTEM,
        priority: this.priorities.NORMAL,
        extraData: {
          test: true,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
      };

      const result = await this.sendPushNotification(testData);

      console.log('🧪 Test notification result:', {
        success: result.success,
        tokens: this.getAdminTokens().length,
        successCount: result.successCount,
        failureCount: result.failureCount
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check Firebase connectivity and configuration
   */
  async checkConnection() {
    try {
      const tokens = this.getAdminTokens();
      
      if (tokens.length === 0) {
        return { 
          success: false, 
          message: 'No admin tokens configured',
          action: 'Set ADMIN_FCM_TOKENS in .env file'
        };
      }

      await this.getMessaging();
      
      return { 
        success: true, 
        message: 'Firebase connection is working',
        tokensConfigured: tokens.length,
        environment: process.env.NODE_ENV || 'development'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        message: 'Firebase connection failed' 
      };
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;