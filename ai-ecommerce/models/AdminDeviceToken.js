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
    required: true,
    unique: true
  },
  fcmToken: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    type: {
      platform: String,
      browser: String,
      os: String,
      deviceType: String, // 'mobile', 'tablet', 'desktop'
      userAgent: String,
      screenResolution: String,
      manufacturer: String,
      model: String
    },
    default: {}
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
  timestamps: true
});

// Index for faster queries
deviceTokenSchema.index({ userId: 1, isActive: 1 });
deviceTokenSchema.index({ fcmToken: 1 }, { unique: true });
deviceTokenSchema.index({ lastActive: 1 });

// Clean up expired tokens (older than 30 days)
deviceTokenSchema.statics.cleanupExpiredTokens = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    lastActive: { $lt: thirtyDaysAgo }
  });
  
  console.log(`🧹 Cleaned up ${result.deletedCount} expired device tokens`);
  return result;
};

const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', deviceTokenSchema);
export default DeviceToken;