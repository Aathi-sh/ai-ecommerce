import mongoose from 'mongoose';

const deviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true
    // REMOVED: unique: true - Device ID should only be unique per user
  },
  fcmToken: {
    type: String,
    required: true,
    trim: true
    // NO unique constraint - FCM tokens can be reused/refreshed
  },
  deviceInfo: {
    platform: String,
    browser: String,
    os: String,
    deviceType: String,
    userAgent: String,
    screenResolution: String,
    manufacturer: String,
    model: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'devicetokens'
});

// ============== CORRECTED INDEXES ==============

// 1. Compound unique index - ensures one token per user per device
deviceTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

// 2. Regular index for user queries
deviceTokenSchema.index({ userId: 1, isActive: 1 });

// 3. Regular index for token lookups (NOT UNIQUE)
deviceTokenSchema.index({ fcmToken: 1 });

// 4. Index for cleanup operations
deviceTokenSchema.index({ lastActive: -1 });

// 5. Index for createdAt queries
deviceTokenSchema.index({ createdAt: -1 });

// ============== STATIC METHODS (unchanged) ==============

deviceTokenSchema.statics.cleanupExpiredTokens = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    lastActive: { $lt: thirtyDaysAgo }
  });
  
  console.log(`Cleaned up ${result.deletedCount} expired device tokens`);
  return result;
};

deviceTokenSchema.statics.getActiveAdminTokens = async function() {
  const User = mongoose.model('User');
  
  const admins = await User.find({
    role: 'admin',
    status: 'active',
    'notificationSettings.pushNotifications.enabled': true
  }).select('_id');
  
  if (admins.length === 0) {
    return [];
  }
  
  const adminIds = admins.map(admin => admin._id);
  
  const tokens = await this.find({
    userId: { $in: adminIds },
    isActive: true,
    fcmToken: { $exists: true, $ne: null, $ne: '' }
  }).select('fcmToken');
  
  return tokens.map(token => token.fcmToken);
};

const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', deviceTokenSchema);
export default DeviceToken;