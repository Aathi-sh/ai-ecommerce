import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^\d{10,15}$/, "Please enter a valid phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    
    // ✅ FIXED: Role field with proper enum
    role: {
      type: String,
      enum: ["admin", "user", "manager"],  // Add other roles as needed
      default: "admin",  // Or "user" depending on your default
    },
    
    // ========== ADMIN NOTIFICATION SETTINGS ==========
    notificationSettings: {
      // Push notification preferences
      pushNotifications: {
        enabled: {
          type: Boolean,
          default: true,
        },
        lastUpdated: Date,
      },
      
      // Notification types preferences (for admin only)
      notificationTypes: {
        newOrders: {
          enabled: {
            type: Boolean,
            default: true,
          },
          priority: {
            type: String,
            enum: ['high', 'normal', 'low'],
            default: 'high',
          },
          sound: {
            type: Boolean,
            default: true,
          },
        },
        payments: {
          enabled: {
            type: Boolean,
            default: true,
          },
          priority: {
            type: String,
            enum: ['high', 'normal', 'low'],
            default: 'high',
          },
          sound: {
            type: Boolean,
            default: true,
          },
        },
        lowStock: {
          enabled: {
            type: Boolean,
            default: true,
          },
          priority: {
            type: String,
            enum: ['high', 'normal', 'low'],
            default: 'normal',
          },
          sound: {
            type: Boolean,
            default: true,
          },
        },
        systemAlerts: {
          enabled: {
            type: Boolean,
            default: true,
          },
          priority: {
            type: String,
            enum: ['high', 'normal', 'low'],
            default: 'high',
          },
          sound: {
            type: Boolean,
            default: true,
          },
        },
        orderUpdates: {
          enabled: {
            type: Boolean,
            default: true,
          },
          priority: {
            type: String,
            enum: ['high', 'normal', 'low'],
            default: 'normal',
          },
          sound: {
            type: Boolean,
            default: true,
          },
        },
      },
      
      // Quiet hours (do not disturb)
      quietHours: {
        enabled: {
          type: Boolean,
          default: false,
        },
        startTime: {
          type: String,
          default: "22:00", // 10 PM
        },
        endTime: {
          type: String,
          default: "08:00", // 8 AM
        },
        timezone: {
          type: String,
          default: "UTC+5:30", // IST
        },
      },
      
      // Notification display preferences
      displayPreferences: {
        showPreview: {
          type: Boolean,
          default: true,
        },
        duration: {
          type: Number,
          default: 5000, // 5 seconds
          min: 1000,
          max: 30000,
        },
        position: {
          type: String,
          enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
          default: 'top-right',
        },
        animation: {
          type: String,
          enum: ['slide', 'fade', 'scale'],
          default: 'slide',
        },
      },
      
      // Email notification preferences
      emailNotifications: {
        enabled: {
          type: Boolean,
          default: true,
        },
        frequency: {
          type: String,
          enum: ['instant', 'daily', 'weekly'],
          default: 'instant',
        },
        types: {
          summary: {
            type: Boolean,
            default: true,
          },
          alerts: {
            type: Boolean,
            default: true,
          },
          reports: {
            type: Boolean,
            default: false,
          },
        },
      },
      
      // WhatsApp notification preferences
      whatsappNotifications: {
        enabled: {
          type: Boolean,
          default: false,
        },
        phoneNumber: String,
        types: {
          urgent: {
            type: Boolean,
            default: true,
          },
          dailySummary: {
            type: Boolean,
            default: false,
          },
        },
      },
      
      settingsUpdatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    
    // ========== ADMIN SPECIFIC FIELDS ==========
    adminPreferences: {
      dashboardLayout: {
        type: String,
        enum: ['default', 'compact', 'detailed'],
        default: 'default',
      },
      defaultView: {
        type: String,
        enum: ['orders', 'payments', 'analytics', 'products'],
        default: 'orders',
      },
      refreshInterval: {
        type: Number,
        default: 30000, // 30 seconds
        min: 10000,
        max: 300000,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
    },
    
    // ========== SESSION MANAGEMENT ==========
    activeSessions: [{
      sessionId: String,
      deviceId: String,
      userAgent: String,
      ipAddress: String,
      location: String,
      loginTime: Date,
      lastActivity: Date,
      expiresAt: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active',
      },
    }],
    
    // ========== VERIFICATION & SECURITY ==========
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // ========== ACTIVITY TRACKING ==========
    lastLogin: Date,
    lastLoginIp: String,
    loginCount: {
      type: Number,
      default: 0,
    },
    lastNotificationRead: Date,
    
    // ========== AUDIT FIELDS ==========
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // ========== STATUS & META ==========
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      default: 'active',
    },
    deletedAt: Date,
    
    // ========== PERFORMANCE METRICS ==========
    metrics: {
      notificationsSent: {
        type: Number,
        default: 0,
      },
      notificationsReceived: {
        type: Number,
        default: 0,
      },
      lastNotificationMetricsUpdate: Date,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ========== INDEXES FOR PERFORMANCE ==========
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ "activeSessions.status": 1 });
userSchema.index({ role: 1, "notificationSettings.pushNotifications.enabled": 1 });
userSchema.index({ role: 1, status: 1 }); // Combined index for better performance

// ========== VIRTUAL PROPERTIES ==========
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

userSchema.virtual('activeSessionsCount').get(function() {
  if (!this.activeSessions) return 0;
  return this.activeSessions.filter(session => session.status === 'active').length;
});

// Virtual to get device tokens (populated via DeviceToken model)
userSchema.virtual('deviceTokens', {
  ref: 'DeviceToken',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});

// Virtual to get active device tokens
userSchema.virtual('activeDeviceTokens', {
  ref: 'DeviceToken',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
  match: { isActive: true }
});

// Virtual for notification stats
userSchema.virtual('notificationStats').get(function() {
  return {
    totalNotifications: this.metrics?.notificationsReceived || 0,
    lastNotificationRead: this.lastNotificationRead,
    notificationsEnabled: this.notificationSettings?.pushNotifications?.enabled || false,
  };
});

// ========== PRE-SAVE MIDDLEWARE ==========
userSchema.pre("save", async function (next) {
  // Only hash password if it's modified (or new)
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Update notification settings timestamp if modified
  if (this.isModified("notificationSettings")) {
    this.notificationSettings.settingsUpdatedAt = new Date();
  }
  
  // Update metrics timestamp if modified
  if (this.isModified("metrics")) {
    this.metrics.lastNotificationMetricsUpdate = new Date();
  }
  
  next();
});

// ========== INSTANCE METHODS ==========

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
userSchema.methods.createVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
  return token;
};

// Generate reset password token
userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
  return token;
};

// ========== NOTIFICATION SETTINGS METHODS ==========

// Check if notifications are enabled for a specific type
userSchema.methods.isNotificationEnabled = function(notificationType) {
  if (!this.isAdmin) return false;
  
  const settings = this.notificationSettings;
  if (!settings) return true; // Default to enabled if no settings
  
  // Check if push notifications are enabled globally
  if (settings.pushNotifications && !settings.pushNotifications.enabled) {
    return false;
  }
  
  // Check quiet hours
  if (settings.quietHours && settings.quietHours.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      // Normal case: quiet hours don't cross midnight
      if (currentTime >= startTime && currentTime < endTime) {
        return false;
      }
    } else {
      // Quiet hours cross midnight
      if (currentTime >= startTime || currentTime < endTime) {
        return false;
      }
    }
  }
  
  // Check specific notification type
  if (settings.notificationTypes && settings.notificationTypes[notificationType]) {
    return settings.notificationTypes[notificationType].enabled;
  }
  
  return true; // Default to enabled if type not specified
};

// Get notification priority for a type
userSchema.methods.getNotificationPriority = function(notificationType) {
  if (!this.isAdmin) return 'normal';
  
  if (this.notificationSettings?.notificationTypes?.[notificationType]) {
    return this.notificationSettings.notificationTypes[notificationType].priority;
  }
  
  return 'normal';
};

// Get notification sound preference for a type
userSchema.methods.getNotificationSoundPreference = function(notificationType) {
  if (!this.isAdmin) return true;
  
  if (this.notificationSettings?.notificationTypes?.[notificationType]) {
    return this.notificationSettings.notificationTypes[notificationType].sound;
  }
  
  return true;
};

// Update notification settings
userSchema.methods.updateNotificationSettings = function(updates) {
  if (!updates || typeof updates !== 'object') {
    throw new Error('Invalid updates object');
  }
  
  // Initialize if not exists
  if (!this.notificationSettings) {
    this.notificationSettings = {};
  }
  
  // Deep merge helper
  const mergeDeep = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };
  
  this.notificationSettings = mergeDeep(this.notificationSettings, updates);
  this.notificationSettings.settingsUpdatedAt = new Date();
  
  if (this.notificationSettings.pushNotifications) {
    this.notificationSettings.pushNotifications.lastUpdated = new Date();
  }
  
  return this.notificationSettings;
};

// ========== SESSION MANAGEMENT METHODS ==========

// Add active session
userSchema.methods.addActiveSession = function(sessionData) {
  if (!sessionData || !sessionData.sessionId) {
    throw new Error('Invalid session data');
  }
  
  const session = {
    sessionId: sessionData.sessionId,
    deviceId: sessionData.deviceId || '',
    userAgent: sessionData.userAgent || '',
    ipAddress: sessionData.ipAddress || '',
    location: sessionData.location || '',
    loginTime: new Date(),
    lastActivity: new Date(),
    expiresAt: sessionData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    status: 'active',
  };
  
  if (!this.activeSessions) this.activeSessions = [];
  this.activeSessions.push(session);
  
  return session;
};

// Update session activity
userSchema.methods.updateSessionActivity = function(sessionId) {
  if (!this.activeSessions) return false;
  
  const sessionIndex = this.activeSessions.findIndex(s => s.sessionId === sessionId && s.status === 'active');
  if (sessionIndex === -1) return false;
  
  this.activeSessions[sessionIndex].lastActivity = new Date();
  return true;
};

// Revoke session
userSchema.methods.revokeSession = function(sessionId) {
  if (!this.activeSessions) return false;
  
  const sessionIndex = this.activeSessions.findIndex(s => s.sessionId === sessionId);
  if (sessionIndex === -1) return false;
  
  this.activeSessions[sessionIndex].status = 'revoked';
  return true;
};

// Revoke all sessions (logout from all devices)
userSchema.methods.revokeAllSessions = function() {
  if (!this.activeSessions) return 0;
  
  let revokedCount = 0;
  this.activeSessions.forEach(session => {
    if (session.status === 'active') {
      session.status = 'revoked';
      revokedCount++;
    }
  });
  
  return revokedCount;
};

// ========== STATIC METHODS ==========

// Find admin users with notification enabled
userSchema.statics.findAdminsWithNotificationsEnabled = function() {
  return this.find({
    role: 'admin',
    status: 'active',
    'notificationSettings.pushNotifications.enabled': true,
  }).select('fullName email phone notificationSettings adminPreferences');
};

// Get all admins (for bulk notifications)
userSchema.statics.getAllAdmins = function() {
  return this.find({
    role: 'admin',
    status: 'active',
  }).select('fullName email phone notificationSettings');
};

// Cleanup expired sessions (cron job)
userSchema.statics.cleanupExpiredSessions = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      'activeSessions.expiresAt': { $lt: now },
      'activeSessions.status': 'active',
    },
    {
      $set: {
        'activeSessions.$[elem].status': 'expired',
      },
    },
    {
      arrayFilters: [
        { 'elem.expiresAt': { $lt: now }, 'elem.status': 'active' },
      ],
      multi: true,
    }
  );
  
  console.log(`Cleaned up expired sessions for ${result.modifiedCount} users`);
  return result;
};

// ========== MIDDLEWARE FOR LAST LOGIN ==========
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin') && this.lastLogin) {
    this.loginCount = (this.loginCount || 0) + 1;
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;