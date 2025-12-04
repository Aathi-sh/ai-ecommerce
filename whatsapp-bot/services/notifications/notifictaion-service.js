// services/notifications/notification-service.js

class NotificationService {
  constructor() {
    this.categories = {
      ORDER: 'order',
      PAYMENT: 'payment',
      STOCK: 'stock',
      INVOICE: 'invoice',
      SYSTEM: 'system'
    };

    this.priorities = {
      HIGH: 'high',
      NORMAL: 'normal',
      LOW: 'low'
    };

    // Firebase messaging will be lazy loaded
    this.messaging = null;
    console.log('🔔 Notification Service initialized');
  }

  /**
   * Lazy load Firebase messaging to handle import issues
   */
  async getMessaging() {
    if (!this.messaging) {
      try {
        // Dynamic import to handle potential Firebase initialization issues
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
   * Send push notification to multiple devices
   */
  async sendPushNotification(tokens, notificationData) {
    try {
      if (!tokens || tokens.length === 0) {
        console.warn('⚠️ No FCM tokens provided for notification');
        return { success: false, error: 'No tokens provided' };
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
            channelId: notificationData.channelId || 'default_channel',
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
        tokens: Array.isArray(tokens) ? tokens : [tokens]
      };

      console.log(`📤 Sending push notification to ${tokens.length} device(s):`, {
        title: notificationData.title,
        category: notificationData.category
      });

      const response = await messaging.sendEachForMulticast(message);
      
      // Log results
      console.log(`✅ Push notification sent successfully:`, {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses.length
      });

      return {
        success: true,
        response,
        successCount: response.successCount,
        failureCount: response.failureCount
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
      // In production, fetch admin FCM tokens from database
      const adminTokens = process.env.ADMIN_FCM_TOKENS 
        ? process.env.ADMIN_FCM_TOKENS.split(',') 
        : [];

      if (adminTokens.length === 0) {
        console.warn('⚠️ No admin FCM tokens configured');
        return { success: false, error: 'No admin tokens configured' };
      }

      const result = await this.sendPushNotification(adminTokens, {
        title,
        body,
        category: notificationData.category || this.categories.SYSTEM,
        priority: notificationData.priority || this.priorities.HIGH,
        ...notificationData
      });

      // Log the admin notification
      await this.logNotification({
        title,
        body,
        category: notificationData.category || this.categories.SYSTEM,
        priority: notificationData.priority || this.priorities.HIGH,
        recipientType: 'admin',
        tokensCount: adminTokens.length,
        ...notificationData
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending admin notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to customer
   */
  async sendCustomerNotification(customerPhone, title, body, notificationData = {}) {
    try {
      // Fetch customer's FCM token from database
      const customerToken = await this.getCustomerFCMToken(customerPhone);
      
      if (!customerToken) {
        console.warn(`⚠️ No FCM token found for customer: ${customerPhone}`);
        return { success: false, error: 'Customer token not found' };
      }

      const result = await this.sendPushNotification([customerToken], {
        title,
        body,
        category: notificationData.category || this.categories.SYSTEM,
        priority: notificationData.priority || this.priorities.NORMAL,
        ...notificationData
      });

      // Log the customer notification
      await this.logNotification({
        title,
        body,
        category: notificationData.category || this.categories.SYSTEM,
        priority: notificationData.priority || this.priorities.NORMAL,
        recipientPhone: customerPhone,
        recipientType: 'customer',
        ...notificationData
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending customer notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get customer FCM token from database (placeholder)
   */
  async getCustomerFCMToken(customerPhone) {
    try {
      // This should query your database for customer's FCM token
      // Example: const customer = await CustomerModel.findOne({ phone: customerPhone });
      // return customer?.fcmToken;
      
      // For now, return from environment or empty
      return process.env.DEMO_FCM_TOKEN || null;
      
    } catch (error) {
      console.error('❌ Error getting customer FCM token:', error);
      return null;
    }
  }

  /**
   * Send notification to multiple customers
   */
  async broadcastToCustomers(phoneNumbers, title, body, notificationData = {}) {
    try {
      const tokens = [];
      
      for (const phone of phoneNumbers) {
        const token = await this.getCustomerFCMToken(phone);
        if (token) tokens.push(token);
      }

      if (tokens.length === 0) {
        return { success: false, error: 'No valid tokens found' };
      }

      const result = await this.sendPushNotification(tokens, {
        title,
        body,
        category: notificationData.category || this.categories.SYSTEM,
        priority: notificationData.priority || this.priorities.NORMAL,
        ...notificationData
      });

      // Log the broadcast notification
      await this.logNotification({
        title,
        body,
        category: notificationData.category || this.categories.SYSTEM,
        priority: notificationData.priority || this.priorities.NORMAL,
        recipientType: 'broadcast',
        recipientCount: phoneNumbers.length,
        tokensCount: tokens.length,
        ...notificationData
      });

      return result;

    } catch (error) {
      console.error('❌ Error broadcasting to customers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log notification to database
   */
  async logNotification(notification) {
    try {
      const logEntry = {
        ...notification,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };

      // Here you would save to your database
      // await NotificationLog.create(logEntry);
      
      console.log('📝 Notification logged:', {
        title: notification.title,
        recipient: notification.recipientPhone || notification.recipientType,
        category: notification.category
      });

      return logEntry;

    } catch (error) {
      console.error('❌ Error logging notification:', error);
      return null;
    }
  }

  /**
   * Format order information for notifications
   */
  formatOrderNotification(order) {
    return {
      title: `Order ${order.orderNumber}`,
      body: `Order placed successfully. Amount: ₹${order.totalPrice}`,
      orderNumber: order.orderNumber,
      amount: order.totalPrice,
      items: order.items?.length || 0,
      customerPhone: order.phoneNumber
    };
  }

  /**
   * Format payment information for notifications
   */
  formatPaymentNotification(payment) {
    return {
      title: `Payment ${payment.status === 'verified' ? 'Verified' : 'Pending'}`,
      body: `Payment of ₹${payment.amount || payment.orderDetails?.totalAmount} ${payment.status === 'verified' ? 'verified' : 'received'}`,
      amount: payment.amount || payment.orderDetails?.totalAmount,
      orderNumber: payment.orderNumber,
      status: payment.status,
      customerPhone: payment.customerPhone
    };
  }

  /**
   * Send test notification
   */
  async sendTestNotification() {
    try {
      const testData = {
        title: '🔔 Test Notification',
        body: 'This is a test notification from your WhatsApp Bot',
        category: this.categories.SYSTEM,
        priority: this.priorities.NORMAL,
        extraData: {
          test: true,
          timestamp: new Date().toISOString(),
          botVersion: '1.0.0'
        }
      };

      const adminTokens = process.env.ADMIN_FCM_TOKENS 
        ? process.env.ADMIN_FCM_TOKENS.split(',') 
        : [];

      if (adminTokens.length === 0) {
        return { 
          success: false, 
          error: 'No admin tokens configured. Set ADMIN_FCM_TOKENS in .env' 
        };
      }

      const result = await this.sendPushNotification(adminTokens, testData);

      console.log('🧪 Test notification sent:', result);
      return result;

    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check Firebase connectivity
   */
  async checkFirebaseConnection() {
    try {
      await this.getMessaging();
      return { 
        success: true, 
        message: 'Firebase connection is working' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        message: 'Firebase connection failed' 
      };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      // This would query your database for notification statistics
      return {
        totalSent: 0,
        successful: 0,
        failed: 0,
        byCategory: {},
        byPriority: {}
      };
    } catch (error) {
      console.error('❌ Error getting notification stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;