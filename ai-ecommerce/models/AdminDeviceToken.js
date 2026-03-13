// import mongoose from 'mongoose';

// const deviceTokenSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   deviceId: {
//     type: String,
//     required: true
//     // REMOVED: unique: true - Device ID should only be unique per user
//   },
//   fcmToken: {
//     type: String,
//     required: true,
//     trim: true
//     // NO unique constraint - FCM tokens can be reused/refreshed
//   },
//   deviceInfo: {
//     platform: String,
//     browser: String,
//     os: String,
//     deviceType: String,
//     userAgent: String,
//     screenResolution: String,
//     manufacturer: String,
//     model: String
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   lastActive: {
//     type: Date,
//     default: Date.now
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true,
//   collection: 'devicetokens'
// });

// // ============== CORRECTED INDEXES ==============

// // 1. Compound unique index - ensures one token per user per device
// deviceTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

// // 2. Regular index for user queries
// deviceTokenSchema.index({ userId: 1, isActive: 1 });

// // 3. Regular index for token lookups (NOT UNIQUE)
// deviceTokenSchema.index({ fcmToken: 1 });

// // 4. Index for cleanup operations
// deviceTokenSchema.index({ lastActive: -1 });

// // 5. Index for createdAt queries
// deviceTokenSchema.index({ createdAt: -1 });

// // ============== STATIC METHODS (unchanged) ==============

// deviceTokenSchema.statics.cleanupExpiredTokens = async function() {
//   const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
//   const result = await this.deleteMany({
//     lastActive: { $lt: thirtyDaysAgo }
//   });
  
//   console.log(`Cleaned up ${result.deletedCount} expired device tokens`);
//   return result;
// };

// deviceTokenSchema.statics.getActiveAdminTokens = async function() {
//   const User = mongoose.model('User');
  
//   const admins = await User.find({
//     role: 'admin',
//     status: 'active',
//     'notificationSettings.pushNotifications.enabled': true
//   }).select('_id');
  
//   if (admins.length === 0) {
//     return [];
//   }
  
//   const adminIds = admins.map(admin => admin._id);
  
//   const tokens = await this.find({
//     userId: { $in: adminIds },
//     isActive: true,
//     fcmToken: { $exists: true, $ne: null, $ne: '' }
//   }).select('fcmToken');
  
//   return tokens.map(token => token.fcmToken);
// };

// const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', deviceTokenSchema);
// export default DeviceToken;




// above code without saas












import mongoose from 'mongoose';

const deviceTokenSchema = new mongoose.Schema({
  // ===== COMPANY CONTEXT (NEW) =====
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "Company ID is required"],
    index: true,
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true
  },
  fcmToken: {
    type: String,
    required: true,
    trim: true
  },
  deviceInfo: {
    platform: String,
    browser: String,
    os: String,
    deviceType: String,
    userAgent: String,
    screenResolution: String,
    manufacturer: String,
    model: String,
    appVersion: String, // NEW: Track app version
  },
  
  // ===== AUDIT TRAIL (NEW) =====
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Created by user is required"]
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // ===== TOKEN MANAGEMENT (ENHANCED) =====
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastVerified: { // NEW: Track last time token was verified
    type: Date,
    default: Date.now,
  },
  expiryDate: { // NEW: Optional token expiry
    type: Date,
    index: true,
  },
  
  // ===== TOKEN SOURCE (NEW) =====
  source: {
    type: String,
    enum: ['whatsapp', 'admin_panel', 'mobile_app', 'website'],
    default: 'admin_panel',
    index: true,
  },
  
  // ===== NOTIFICATION PREFERENCES (NEW) =====
  notificationPreferences: {
    types: {
      newOrders: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      bookings: { type: Boolean, default: true },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
    }
  },
  
  // ===== METADATA (NEW) =====
  metadata: {
    ipAddress: String,
    location: {
      country: String,
      city: String,
      timezone: String,
    },
    lastNotificationSent: Date,
    notificationCount: { type: Number, default: 0 },
    failedAttempts: { type: Number, default: 0 },
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  }
}, {
  timestamps: true,
  collection: 'devicetokens'
});

// ============== COMPOUND INDEXES FOR COMPANY ISOLATION ==============

// 1. Compound unique index - ensures one token per user per device per company
deviceTokenSchema.index(
  { companyId: 1, userId: 1, deviceId: 1 }, 
  { 
    unique: true,
    name: 'company_user_device_unique_idx' 
  }
);

// 2. Compound index for user queries within company
deviceTokenSchema.index(
  { companyId: 1, userId: 1, isActive: 1 },
  { name: 'company_user_active_idx' }
);

// 3. Index for token lookups within company
deviceTokenSchema.index(
  { companyId: 1, fcmToken: 1 },
  { name: 'company_token_idx' }
);

// 4. Index for cleanup operations within company
deviceTokenSchema.index(
  { companyId: 1, lastActive: -1 },
  { name: 'company_lastactive_idx' }
);

// 5. Index for expiry management
deviceTokenSchema.index(
  { companyId: 1, expiryDate: 1 },
  { 
    sparse: true,
    name: 'company_expiry_idx' 
  }
);

// 6. Index for source-based queries
deviceTokenSchema.index(
  { companyId: 1, source: 1, isActive: 1 },
  { name: 'company_source_idx' }
);

// ============== VIRTUAL PROPERTIES ==============

deviceTokenSchema.virtual('isExpired').get(function() {
  return this.expiryDate && this.expiryDate < new Date();
});

deviceTokenSchema.virtual('isInactive').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return !this.isActive || this.lastActive < thirtyDaysAgo;
});

deviceTokenSchema.virtual('deviceSummary').get(function() {
  return {
    platform: this.deviceInfo?.platform || 'unknown',
    browser: this.deviceInfo?.browser || 'unknown',
    lastActive: this.lastActive,
    source: this.source
  };
});

// ============== PRE-SAVE MIDDLEWARE ==============

deviceTokenSchema.pre('save', function(next) {
  // Update timestamps
  this.updatedAt = new Date();
  
  // Validate company context
  if (!this.companyId) {
    return next(new Error('Company ID is required for device token'));
  }
  
  // Auto-clean empty deviceInfo fields
  if (this.deviceInfo) {
    Object.keys(this.deviceInfo).forEach(key => {
      if (this.deviceInfo[key] === undefined || this.deviceInfo[key] === null) {
        delete this.deviceInfo[key];
      }
    });
  }
  
  // Set default expiry if not set (30 days from creation)
  if (!this.expiryDate && this.isNew) {
    this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// ============== STATIC METHODS (UPDATED WITH COMPANY CONTEXT) ==============

// Cleanup expired tokens for a specific company
deviceTokenSchema.statics.cleanupExpiredTokens = async function(companyId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Delete tokens inactive for 30 days
  const inactiveResult = await this.deleteMany({
    companyId,
    lastActive: { $lt: thirtyDaysAgo }
  });
  
  // Deactivate expired tokens
  const expiredResult = await this.updateMany(
    {
      companyId,
      expiryDate: { $lt: new Date() },
      isActive: true
    },
    {
      $set: { isActive: false, updatedBy: null } // system update
    }
  );
  
  console.log(`[Company ${companyId}] Cleaned up ${inactiveResult.deletedCount} inactive tokens, ${expiredResult.modifiedCount} expired tokens`);
  
  return {
    inactiveDeleted: inactiveResult.deletedCount,
    expiredDeactivated: expiredResult.modifiedCount
  };
};

// Get active admin tokens for a specific company
deviceTokenSchema.statics.getActiveAdminTokens = async function(companyId) {
  const User = mongoose.model('User');
  
  // Find active admins in this company
  const admins = await User.find({
    companyId,
    role: 'admin',
    status: 'active',
    'notificationSettings.pushNotifications.enabled': true
  }).select('_id');
  
  if (admins.length === 0) {
    return [];
  }
  
  const adminIds = admins.map(admin => admin._id);
  
  // Get active tokens for these admins
  const tokens = await this.find({
    companyId,
    userId: { $in: adminIds },
    isActive: true,
    fcmToken: { $exists: true, $ne: null, $ne: '' },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  }).select('fcmToken userId source');
  
  return tokens.map(token => ({
    token: token.fcmToken,
    userId: token.userId,
    source: token.source
  }));
};

// NEW: Get tokens by user within company
deviceTokenSchema.statics.getUserTokens = function(companyId, userId) {
  return this.find({
    companyId,
    userId,
    isActive: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  }).sort({ lastActive: -1 });
};

// NEW: Get tokens by source within company
deviceTokenSchema.statics.getTokensBySource = function(companyId, source) {
  return this.find({
    companyId,
    source,
    isActive: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  }).populate('userId', 'fullName email');
};

// NEW: Deactivate all tokens for a user in a company
deviceTokenSchema.statics.deactivateUserTokens = async function(companyId, userId, updatedBy) {
  const result = await this.updateMany(
    { companyId, userId, isActive: true },
    { 
      $set: { 
        isActive: false,
        updatedBy,
        updatedAt: new Date()
      } 
    }
  );
  
  console.log(`[Company ${companyId}] Deactivated ${result.modifiedCount} tokens for user ${userId}`);
  return result;
};

// NEW: Verify and update token
deviceTokenSchema.statics.verifyToken = async function(companyId, fcmToken) {
  const token = await this.findOne({ companyId, fcmToken, isActive: true });
  
  if (token) {
    token.lastVerified = new Date();
    token.lastActive = new Date();
    token.metadata.lastNotificationSent = new Date();
    token.metadata.notificationCount = (token.metadata.notificationCount || 0) + 1;
    await token.save();
  }
  
  return token;
};

// ============== INSTANCE METHODS (NEW) ==============

// Check if token belongs to company
deviceTokenSchema.methods.belongsToCompany = function(companyId) {
  return this.companyId && this.companyId.toString() === companyId.toString();
};

// Update last active timestamp
deviceTokenSchema.methods.updateActivity = async function() {
  this.lastActive = new Date();
  this.metadata.lastNotificationSent = new Date();
  this.metadata.notificationCount = (this.metadata.notificationCount || 0) + 1;
  return this.save();
};

// Mark token as inactive
deviceTokenSchema.methods.deactivate = async function(updatedBy) {
  this.isActive = false;
  this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  return this.save();
};

// Update notification preferences
deviceTokenSchema.methods.updatePreferences = function(preferences) {
  if (preferences.types) {
    this.notificationPreferences.types = {
      ...this.notificationPreferences.types,
      ...preferences.types
    };
  }
  if (preferences.quietHours) {
    this.notificationPreferences.quietHours = {
      ...this.notificationPreferences.quietHours,
      ...preferences.quietHours
    };
  }
  return this.save();
};

// Refresh token expiry
deviceTokenSchema.methods.refreshExpiry = function(days = 30) {
  this.expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.lastVerified = new Date();
  return this.save();
};

// ============== QUERY HELPERS ==============

deviceTokenSchema.query.byCompany = function(companyId) {
  return this.where({ companyId });
};

deviceTokenSchema.query.active = function() {
  return this.where({ 
    isActive: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  });
};

deviceTokenSchema.query.bySource = function(source) {
  return this.where({ source });
};

deviceTokenSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

// ============== JSON TRANSFORM ==============
deviceTokenSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    // Remove sensitive fields
    delete ret.fcmToken; // Don't expose token in JSON
    
    return ret;
  }
});

deviceTokenSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    return ret;
  }
});

// ============== EXPORT ==============
const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', deviceTokenSchema);
export default DeviceToken;

