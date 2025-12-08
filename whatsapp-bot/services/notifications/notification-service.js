import admin from "../firebase/firebase-admin.js";
import User from '../../../ai-ecommerce/models/user.js';
import DeviceToken from '../../../ai-ecommerce/models/AdminDeviceToken.js';


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

    console.log('🔔 Admin Notification Service initialized');
  }

  /**
   * Get all active admin FCM tokens from database
   */
  async getAdminTokensFromDB() {
  try {
    console.log('🔍 Fetching admin tokens...');
    
    // Quick and safe query with timeout
    const admins = await User.find({ 
      role: 'admin', 
      status: 'active',
      'notificationSettings.pushNotifications.enabled': true 
    })
    .select('_id')
    .limit(10) // ✅ Add limit to prevent huge queries
    .maxTimeMS(3000) // ✅ MongoDB timeout (3 seconds)
    .lean(); // ✅ Faster response

    if (!admins || admins.length === 0) {
      console.log('⚠️ No active admin users found');
      return [];
    }

    const adminIds = admins.map(admin => admin._id);
    
    const deviceTokens = await DeviceToken.find({
      userId: { $in: adminIds },
      isActive: true
    })
    .select('fcmToken')
    .maxTimeMS(3000) // ✅ Another timeout
    .lean();

    const tokens = deviceTokens.map(dt => dt.fcmToken);
    
    console.log(`📱 Found ${tokens.length} active FCM tokens`);
    return tokens;

  } catch (error) {
    // ✅ LOG BUT DON'T CRASH - return empty array
    console.log('⏱️ Token fetch timed out, continuing without push notifications');
    return [];
  }
}
  /**
   * Send push notification to all admin devices
   */
  async sendPushNotification(notificationData) {
    try {
      const tokens = await this.getAdminTokensFromDB();
      
      if (tokens.length === 0) {
        console.warn('⚠️ No active FCM tokens found for admin users');
        return { 
          success: false, 
          error: 'No active admin devices found',
          action: 'Admin needs to login and enable notifications'
        };
      }

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

      console.log(`📤 Sending push notification to ${tokens.length} admin devices:`, {
        title: notificationData.title,
        category: notificationData.category,
        referenceId: notificationData.referenceId
      });

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(response.responses, tokens);
      }

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
   * Handle failed FCM tokens (mark as inactive)
   */
  async handleFailedTokens(responses, tokens) {
    try {
      const failedTokens = [];
      
      responses.forEach((response, index) => {
        if (!response.success) {
          failedTokens.push({
            token: tokens[index],
            error: response.error?.message || 'Unknown error'
          });
        }
      });

      if (failedTokens.length > 0) {
        console.log(`⚠️ ${failedTokens.length} tokens failed, marking as inactive`);
        
        // Mark failed tokens as inactive in database
        for (const failedToken of failedTokens) {
          await DeviceToken.findOneAndUpdate(
            { fcmToken: failedToken.token },
            { 
              isActive: false,
              lastActive: new Date(),
              invalidReason: failedToken.error.substring(0, 200)
            }
          );
        }
        
        console.log(`✅ Marked ${failedTokens.length} tokens as inactive`);
      }

    } catch (error) {
      console.error('❌ Error handling failed tokens:', error);
    }
  }

  /**
   * Send notification to admin users with specific notification type
   */
  async sendAdminNotification(title, body, notificationData = {}) {
    try {
      // Check if this notification type is enabled for admins
      const admins = await User.find({ 
        role: 'admin', 
        status: 'active' 
      });

      let tokens = [];
      
      // Filter admins based on notification preferences
      for (const admin of admins) {
        if (admin.isNotificationEnabled(notificationData.type)) {
          // Get this admin's active tokens
          const adminTokens = await DeviceToken.find({
            userId: admin._id,
            isActive: true
          });
          
          tokens = tokens.concat(adminTokens.map(t => t.fcmToken));
        }
      }

      if (tokens.length === 0) {
        console.log(`🔕 No admin devices found or notifications disabled for type: ${notificationData.type}`);
        return { 
          success: false, 
          message: 'No admin devices to notify or notifications disabled'
        };
      }

      const result = await admin.messaging().sendEachForMulticast({
        notification: { title, body },
        data: {
          type: notificationData.type || 'general',
          category: notificationData.category || this.categories.SYSTEM,
          ...notificationData
        },
        tokens
      });

      return {
        success: result.successCount > 0,
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalTokens: tokens.length
      };

    } catch (error) {
      console.error('❌ Error in sendAdminNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send system alert notification
   */
  async sendAlertNotification(title, body, alertData = {}) {
    return await this.sendAdminNotification(title, body, {
      ...alertData,
      type: 'SYSTEM_ALERT',
      category: this.categories.ALERT,
      priority: this.priorities.HIGH
    });
  }

  /**
   * Send test notification
   */
  async sendTestNotification(customData = {}) {
    try {
      const testData = {
        title: '🔔 Test Notification',
        body: 'This is a test notification to admin devices',
        category: this.categories.SYSTEM,
        priority: this.priorities.NORMAL,
        type: 'TEST',
        extraData: {
          test: true,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          ...customData
        }
      };

      const result = await this.sendPushNotification(testData);

      console.log('🧪 Test notification result:', {
        success: result.success,
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
      const tokens = await this.getAdminTokensFromDB();
      
      if (tokens.length === 0) {
        return { 
          success: false, 
          message: 'No active admin devices found',
          action: 'Admin needs to login from devices'
        };
      }

      // Try to send a silent test message
      await admin.messaging().sendEachForMulticast({
        data: { test: 'connection_check' },
        tokens: [tokens[0]] // Test with first token only
      });
      
      return { 
        success: true, 
        message: 'Firebase connection is working',
        activeDevices: tokens.length,
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