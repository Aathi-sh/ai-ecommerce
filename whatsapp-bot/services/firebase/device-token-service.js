import DeviceToken from "../../../ai-ecommerce/models/AdminDeviceToken.js";
import admin from './firebase-admin.js';

class DeviceTokenService {
  constructor() {
    console.log('📱 Device Token Service initialized');
  }

  /**
   * Register or update device token for a user
   */
  async registerToken(userId, deviceId, fcmToken, deviceInfo = {}) {
    try {
      if (!userId || !deviceId || !fcmToken) {
        throw new Error('User ID, Device ID, and FCM Token are required');
      }

      // Validate FCM token format
      if (!this.isValidFCMToken(fcmToken)) {
        throw new Error('Invalid FCM token format');
      }

      // Check if token already exists for this device
      const existingToken = await DeviceToken.findOne({ 
        userId, 
        deviceId 
      });

      if (existingToken) {
        // Update existing token
        existingToken.fcmToken = fcmToken;
        existingToken.deviceInfo = deviceInfo;
        existingToken.lastActive = new Date();
        existingToken.isActive = true;
        
        await existingToken.save();
        console.log(`📱 Updated FCM token for device ${deviceId} of user ${userId}`);
        return {
          success: true,
          action: 'updated',
          deviceToken: existingToken
        };
      } else {
        // Create new token
        const deviceToken = await DeviceToken.create({
          userId,
          deviceId,
          fcmToken,
          deviceInfo,
          lastActive: new Date(),
          isActive: true
        });

        console.log(`📱 Registered new FCM token for device ${deviceId} of user ${userId}`);
        return {
          success: true,
          action: 'created',
          deviceToken
        };
      }
    } catch (error) {
      console.error('❌ Error registering device token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all active tokens for a user
   */
  async getUserTokens(userId) {
    try {
      const tokens = await DeviceToken.find({
        userId,
        isActive: true
      }).sort({ lastActive: -1 });

      return {
        success: true,
        tokens,
        count: tokens.length
      };
    } catch (error) {
      console.error('❌ Error getting user tokens:', error);
      return {
        success: false,
        error: error.message,
        tokens: [],
        count: 0
      };
    }
  }

  /**
   * Get all active admin tokens
   */
  async getAdminTokens() {
    try {
      // First, get all admin users
      const User = mongoose.model('User');
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(admin => admin._id);

      // Get tokens for all admins
      const tokens = await DeviceToken.find({
        userId: { $in: adminIds },
        isActive: true
      }).sort({ lastActive: -1 });

      return {
        success: true,
        tokens,
        count: tokens.length
      };
    } catch (error) {
      console.error('❌ Error getting admin tokens:', error);
      return {
        success: false,
        error: error.message,
        tokens: [],
        count: 0
      };
    }
  }

  /**
   * Deactivate a specific device token
   */
  async deactivateToken(fcmToken) {
    try {
      const result = await DeviceToken.findOneAndUpdate(
        { fcmToken },
        { 
          isActive: false,
          lastActive: new Date()
        },
        { new: true }
      );

      if (!result) {
        return {
          success: false,
          error: 'Token not found'
        };
      }

      console.log(`📱 Deactivated token: ${fcmToken.substring(0, 20)}...`);
      return {
        success: true,
        deviceToken: result
      };
    } catch (error) {
      console.error('❌ Error deactivating token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deactivate all tokens for a device
   */
  async deactivateDevice(userId, deviceId) {
    try {
      const result = await DeviceToken.updateMany(
        { userId, deviceId },
        { 
          isActive: false,
          lastActive: new Date()
        }
      );

      console.log(`📱 Deactivated all tokens for device ${deviceId} of user ${userId}`);
      return {
        success: true,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('❌ Error deactivating device tokens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove invalid tokens from the database
   */
  async removeInvalidTokens(invalidTokens) {
    try {
      if (!Array.isArray(invalidTokens) || invalidTokens.length === 0) {
        return {
          success: true,
          removedCount: 0
        };
      }

      const result = await DeviceToken.deleteMany({
        fcmToken: { $in: invalidTokens }
      });

      console.log(`🗑️ Removed ${result.deletedCount} invalid FCM tokens`);
      return {
        success: true,
        removedCount: result.deletedCount
      };
    } catch (error) {
      console.error('❌ Error removing invalid tokens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(fcmToken) {
    try {
      await DeviceToken.findOneAndUpdate(
        { fcmToken },
        { lastActive: new Date() }
      );
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating last active:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old tokens
   */
  async cleanupOldTokens(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await DeviceToken.deleteMany({
        lastActive: { $lt: cutoffDate }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old tokens (> ${daysOld} days)`);
      return {
        success: true,
        removedCount: result.deletedCount
      };
    } catch (error) {
      console.error('❌ Error cleaning up old tokens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate FCM token format
   */
  isValidFCMToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Basic FCM token validation (can be enhanced)
    // Tokens should be quite long
    if (token.length < 100 || token.length > 500) {
      return false;
    }

    // Should not contain spaces
    if (token.includes(' ')) {
      return false;
    }

    return true;
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(userId) {
    try {
      const stats = await DeviceToken.aggregate([
        { $match: { userId, isActive: true } },
        {
          $group: {
            _id: '$deviceInfo.deviceType',
            count: { $sum: 1 },
            lastActive: { $max: '$lastActive' }
          }
        }
      ]);

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('❌ Error getting device stats:', error);
      return {
        success: false,
        error: error.message,
        stats: []
      };
    }
  }
}

// Create singleton instance
const deviceTokenService = new DeviceTokenService();
export default deviceTokenService;