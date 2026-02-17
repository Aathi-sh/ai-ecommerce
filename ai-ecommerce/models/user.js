// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";

// const userSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: [true, "Full name is required"],
//       trim: true,
//       minlength: [3, "Full name must be at least 3 characters"],
//       maxlength: [50, "Full name must be less than 50 characters"],
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
      
//       lowercase: true,
//       trim: true,
//       match: [
//         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//         "Please enter a valid email",
//       ],
//     },
//     phone: {
//       type: String,
//       required: [true, "Phone number is required"],
    
//       match: [/^\d{10,15}$/, "Please enter a valid phone number"],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [6, "Password must be at least 6 characters"],
//       select: false,
//     },
    
//     // Role field
//     role: {
//       type: String,
//       enum: ["admin", "user", "manager"],
//       default: "user", // Changed from admin to user as default
//     },
    
//     // ========== ADMIN NOTIFICATION SETTINGS ==========
//     notificationSettings: {
//       // Push notification preferences
//       pushNotifications: {
//         enabled: {
//           type: Boolean,
//           default: true,
//         },
//         lastUpdated: Date,
//       },
      
//       // Notification types preferences (for admin only)
//       notificationTypes: {
//         newOrders: {
//           enabled: {
//             type: Boolean,
//             default: true,
//           },
//           priority: {
//             type: String,
//             enum: ['high', 'normal', 'low'],
//             default: 'high',
//           },
//           sound: {
//             type: Boolean,
//             default: true,
//           },
//         },
//         payments: {
//           enabled: {
//             type: Boolean,
//             default: true,
//           },
//           priority: {
//             type: String,
//             enum: ['high', 'normal', 'low'],
//             default: 'high',
//           },
//           sound: {
//             type: Boolean,
//             default: true,
//           },
//         },
//         lowStock: {
//           enabled: {
//             type: Boolean,
//             default: true,
//           },
//           priority: {
//             type: String,
//             enum: ['high', 'normal', 'low'],
//             default: 'normal',
//           },
//           sound: {
//             type: Boolean,
//             default: true,
//           },
//         },
//         systemAlerts: {
//           enabled: {
//             type: Boolean,
//             default: true,
//           },
//           priority: {
//             type: String,
//             enum: ['high', 'normal', 'low'],
//             default: 'high',
//           },
//           sound: {
//             type: Boolean,
//             default: true,
//           },
//         },
//         orderUpdates: {
//           enabled: {
//             type: Boolean,
//             default: true,
//           },
//           priority: {
//             type: String,
//             enum: ['high', 'normal', 'low'],
//             default: 'normal',
//           },
//           sound: {
//             type: Boolean,
//             default: true,
//           },
//         },
//       },
      
//       // Quiet hours (do not disturb)
//       quietHours: {
//         enabled: {
//           type: Boolean,
//           default: false,
//         },
//         startTime: {
//           type: String,
//           default: "22:00", // 10 PM
//         },
//         endTime: {
//           type: String,
//           default: "08:00", // 8 AM
//         },
//         timezone: {
//           type: String,
//           default: "UTC+5:30", // IST
//         },
//       },
      
//       // Notification display preferences
//       displayPreferences: {
//         showPreview: {
//           type: Boolean,
//           default: true,
//         },
//         duration: {
//           type: Number,
//           default: 5000, // 5 seconds
//           min: 1000,
//           max: 30000,
//         },
//         position: {
//           type: String,
//           enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
//           default: 'top-right',
//         },
//         animation: {
//           type: String,
//           enum: ['slide', 'fade', 'scale'],
//           default: 'slide',
//         },
//       },
      
//       // Email notification preferences
//       emailNotifications: {
//         enabled: {
//           type: Boolean,
//           default: true,
//         },
//         frequency: {
//           type: String,
//           enum: ['instant', 'daily', 'weekly'],
//           default: 'instant',
//         },
//         types: {
//           summary: {
//             type: Boolean,
//             default: true,
//           },
//           alerts: {
//             type: Boolean,
//             default: true,
//           },
//           reports: {
//             type: Boolean,
//             default: false,
//           },
//         },
//       },
      
//       // WhatsApp notification preferences
//       whatsappNotifications: {
//         enabled: {
//           type: Boolean,
//           default: false,
//         },
//         phoneNumber: String,
//         types: {
//           urgent: {
//             type: Boolean,
//             default: true,
//           },
//           dailySummary: {
//             type: Boolean,
//             default: false,
//           },
//         },
//       },
      
//       settingsUpdatedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
    
//     // ========== ADMIN SPECIFIC FIELDS ==========
//     adminPreferences: {
//       dashboardLayout: {
//         type: String,
//         enum: ['default', 'compact', 'detailed'],
//         default: 'default',
//       },
//       defaultView: {
//         type: String,
//         enum: ['orders', 'payments', 'analytics', 'products'],
//         default: 'orders',
//       },
//       refreshInterval: {
//         type: Number,
//         default: 30000, // 30 seconds
//         min: 10000,
//         max: 300000,
//       },
//       theme: {
//         type: String,
//         enum: ['light', 'dark', 'auto'],
//         default: 'light',
//       },
//     },
    
//     // ========== VERIFICATION & SECURITY ==========
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     verificationToken: String,
//     verificationTokenExpires: Date,
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
    
//     // ========== ACTIVITY TRACKING ==========
//     lastLogin: Date,
//     lastLoginIp: String,
//     loginCount: {
//       type: Number,
//       default: 0,
//     },
//     lastNotificationRead: Date,
//     emailVerifiedAt: Date, // Added for tracking verification time
    
//     // ========== AUDIT FIELDS ==========
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
//     // ========== STATUS & META ==========
//     status: {
//       type: String,
//       enum: ['active', 'inactive', 'suspended', 'deleted', 'pending'],
//       default: 'pending', // Changed to pending until email verification
//     },
//     deletedAt: Date,
    
//     // ========== PERFORMANCE METRICS ==========
//     metrics: {
//       notificationsSent: {
//         type: Number,
//         default: 0,
//       },
//       notificationsReceived: {
//         type: Number,
//         default: 0,
//       },
//       lastNotificationMetricsUpdate: Date,
//     },
    
//     // ========== SECURITY METRICS ==========
//     security: {
//       lastPasswordChange: Date,
//       failedLoginAttempts: {
//         type: Number,
//         default: 0,
//         select: false,
//       },
//       lastFailedLogin: Date,
//     },
//   },
//   { 
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // ========== INDEXES FOR PERFORMANCE ==========
// userSchema.index({ role: 1 });
// userSchema.index({ status: 1 });
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ phone: 1 }, { unique: true });
// userSchema.index({ role: 1, status: 1 });
// userSchema.index({ isVerified: 1 });
// userSchema.index({ "notificationSettings.pushNotifications.enabled": 1 });
// userSchema.index({ createdAt: -1 });

// // ========== VIRTUAL PROPERTIES ==========
// userSchema.virtual('isAdmin').get(function() {
//   return this.role === 'admin';
// });

// userSchema.virtual('isManager').get(function() {
//   return this.role === 'manager';
// });

// userSchema.virtual('isActive').get(function() {
//   return this.status === 'active';
// });

// // Virtual to get device tokens (populated via DeviceToken model)
// userSchema.virtual('deviceTokens', {
//   ref: 'DeviceToken',
//   localField: '_id',
//   foreignField: 'userId',
//   justOne: false,
// });

// // Virtual to get active device tokens
// userSchema.virtual('activeDeviceTokens', {
//   ref: 'DeviceToken',
//   localField: '_id',
//   foreignField: 'userId',
//   justOne: false,
//   match: { isActive: true }
// });

// // Virtual for notification stats
// userSchema.virtual('notificationStats').get(function() {
//   return {
//     totalNotifications: this.metrics?.notificationsReceived || 0,
//     lastNotificationRead: this.lastNotificationRead,
//     notificationsEnabled: this.notificationSettings?.pushNotifications?.enabled || false,
//   };
// });

// // Virtual for account age
// userSchema.virtual('accountAge').get(function() {
//   if (!this.createdAt) return 0;
//   const now = new Date();
//   const created = new Date(this.createdAt);
//   return Math.floor((now - created) / (1000 * 60 * 60 * 24)); // Days
// });

// // ========== PRE-SAVE MIDDLEWARE ==========
// userSchema.pre("save", async function (next) {
//   // Only hash password if it's modified (or new)
//   if (this.isModified("password")) {
//     try {
//       const salt = await bcrypt.genSalt(12);
//       this.password = await bcrypt.hash(this.password, salt);
      
//       // Update last password change timestamp
//       this.security.lastPasswordChange = new Date();
//     } catch (error) {
//       return next(error);
//     }
//   }
  
//   // Update notification settings timestamp if modified
//   if (this.isModified("notificationSettings")) {
//     this.notificationSettings.settingsUpdatedAt = new Date();
//   }
  
//   // Update metrics timestamp if modified
//   if (this.isModified("metrics")) {
//     this.metrics.lastNotificationMetricsUpdate = new Date();
//   }
  
//   // When email is verified, update status and timestamp
//   if (this.isModified("isVerified") && this.isVerified) {
//     this.emailVerifiedAt = new Date();
//     if (this.status === 'pending') {
//       this.status = 'active';
//     }
//   }
  
//   next();
// });

// // ========== INSTANCE METHODS ==========

// // Compare password method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Generate verification token
// userSchema.methods.createVerificationToken = function () {
//   const token = crypto.randomBytes(32).toString("hex");
//   this.verificationToken = crypto.createHash("sha256").update(token).digest("hex");
//   this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
//   return token;
// };

// // Generate reset password token
// userSchema.methods.createResetToken = function () {
//   const token = crypto.randomBytes(32).toString("hex");
//   this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
//   this.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
//   return token;
// };

// // Clear verification token after successful verification
// userSchema.methods.clearVerificationToken = function () {
//   this.verificationToken = undefined;
//   this.verificationTokenExpires = undefined;
//   this.isVerified = true;
//   this.emailVerifiedAt = new Date();
//   if (this.status === 'pending') {
//     this.status = 'active';
//   }
// };

// // Clear reset password token after successful reset
// userSchema.methods.clearResetToken = function () {
//   this.resetPasswordToken = undefined;
//   this.resetPasswordExpires = undefined;
//   this.security.lastPasswordChange = new Date();
// };

// // ========== NOTIFICATION SETTINGS METHODS ==========

// // Check if notifications are enabled for a specific type
// userSchema.methods.isNotificationEnabled = function(notificationType) {
//   if (!this.isAdmin) return false;
  
//   const settings = this.notificationSettings;
//   if (!settings) return true; // Default to enabled if no settings
  
//   // Check if push notifications are enabled globally
//   if (settings.pushNotifications && !settings.pushNotifications.enabled) {
//     return false;
//   }
  
//   // Check quiet hours
//   if (settings.quietHours && settings.quietHours.enabled) {
//     const now = new Date();
//     const currentTime = now.getHours() * 60 + now.getMinutes();
//     const [startHour, startMinute] = settings.quietHours.startTime.split(':').map(Number);
//     const [endHour, endMinute] = settings.quietHours.endTime.split(':').map(Number);
    
//     const startTime = startHour * 60 + startMinute;
//     const endTime = endHour * 60 + endMinute;
    
//     if (startTime <= endTime) {
//       // Normal case: quiet hours don't cross midnight
//       if (currentTime >= startTime && currentTime < endTime) {
//         return false;
//       }
//     } else {
//       // Quiet hours cross midnight
//       if (currentTime >= startTime || currentTime < endTime) {
//         return false;
//       }
//     }
//   }
  
//   // Check specific notification type
//   if (settings.notificationTypes && settings.notificationTypes[notificationType]) {
//     return settings.notificationTypes[notificationType].enabled;
//   }
  
//   return true; // Default to enabled if type not specified
// };

// // Get notification priority for a type
// userSchema.methods.getNotificationPriority = function(notificationType) {
//   if (!this.isAdmin) return 'normal';
  
//   if (this.notificationSettings?.notificationTypes?.[notificationType]) {
//     return this.notificationSettings.notificationTypes[notificationType].priority;
//   }
  
//   return 'normal';
// };

// // Get notification sound preference for a type
// userSchema.methods.getNotificationSoundPreference = function(notificationType) {
//   if (!this.isAdmin) return true;
  
//   if (this.notificationSettings?.notificationTypes?.[notificationType]) {
//     return this.notificationSettings.notificationTypes[notificationType].sound;
//   }
  
//   return true;
// };

// // Update notification settings
// userSchema.methods.updateNotificationSettings = function(updates) {
//   if (!updates || typeof updates !== 'object') {
//     throw new Error('Invalid updates object');
//   }
  
//   // Initialize if not exists
//   if (!this.notificationSettings) {
//     this.notificationSettings = {};
//   }
  
//   // Deep merge helper
//   const mergeDeep = (target, source) => {
//     for (const key in source) {
//       if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
//         if (!target[key]) target[key] = {};
//         mergeDeep(target[key], source[key]);
//       } else {
//         target[key] = source[key];
//       }
//     }
//     return target;
//   };
  
//   this.notificationSettings = mergeDeep(this.notificationSettings, updates);
//   this.notificationSettings.settingsUpdatedAt = new Date();
  
//   if (this.notificationSettings.pushNotifications) {
//     this.notificationSettings.pushNotifications.lastUpdated = new Date();
//   }
  
//   return this.notificationSettings;
// };

// // ========== ACCOUNT MANAGEMENT METHODS ==========

// // Update user profile
// userSchema.methods.updateProfile = function(updates) {
//   const allowedUpdates = ['fullName', 'phone', 'notificationSettings', 'adminPreferences'];
  
//   allowedUpdates.forEach(field => {
//     if (updates[field] !== undefined) {
//       this[field] = updates[field];
//     }
//   });
  
//   return this;
// };

// // Suspend account
// userSchema.methods.suspendAccount = function(reason = 'Violation of terms') {
//   this.status = 'suspended';
//   this.suspendedAt = new Date();
//   this.suspensionReason = reason;
//   return this;
// };

// // Reactivate account
// userSchema.methods.reactivateAccount = function() {
//   if (this.status === 'suspended' || this.status === 'inactive') {
//     this.status = 'active';
//     this.suspendedAt = undefined;
//     this.suspensionReason = undefined;
//   }
//   return this;
// };

// // ========== STATIC METHODS ==========

// // Find admin users with notification enabled
// userSchema.statics.findAdminsWithNotificationsEnabled = function() {
//   return this.find({
//     role: 'admin',
//     status: 'active',
//     'notificationSettings.pushNotifications.enabled': true,
//   }).select('fullName email phone notificationSettings adminPreferences');
// };

// // Get all admins (for bulk notifications)
// userSchema.statics.getAllAdmins = function() {
//   return this.find({
//     role: 'admin',
//     status: 'active',
//   }).select('fullName email phone notificationSettings');
// };

// // Find user by verification token
// userSchema.statics.findByVerificationToken = function(token) {
//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//   return this.findOne({
//     verificationToken: hashedToken,
//     verificationTokenExpires: { $gt: Date.now() }
//   });
// };

// // Find user by reset token
// userSchema.statics.findByResetToken = function(token) {
//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//   return this.findOne({
//     resetPasswordToken: hashedToken,
//     resetPasswordExpires: { $gt: Date.now() }
//   });
// };

// // Find active users by role
// userSchema.statics.findActiveByRole = function(role) {
//   return this.find({
//     role: role,
//     status: 'active',
//     isVerified: true
//   });
// };

// // ========== MIDDLEWARE FOR LAST LOGIN ==========
// userSchema.pre('save', function(next) {
//   if (this.isModified('lastLogin') && this.lastLogin) {
//     this.loginCount = (this.loginCount || 0) + 1;
//   }
//   next();
// });

// const User = mongoose.models.User || mongoose.model("User", userSchema);
// export default User;





import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ========== CONSTANTS ==========
const VALID_STATUSES = ['active', 'inactive', 'suspended', 'deleted', 'pending', 'offline'];
const ACTIVE_STATUSES = ['active'];
const STATUS_DISPLAY_NAMES = {
  'active': 'Active',
  'inactive': 'Inactive',
  'suspended': 'Suspended',
  'deleted': 'Deleted',
  'pending': 'Pending Verification',
  'offline': 'Offline'
};

const ALLOWED_STATUS_TRANSITIONS = {
  'pending': ['active', 'inactive', 'deleted'],
  'active': ['inactive', 'suspended', 'deleted', 'offline'],
  'inactive': ['active', 'deleted'],
  'suspended': ['active', 'inactive', 'deleted'],
  'deleted': [],
  'offline': ['active', 'inactive']
};

const STATUS_COLORS = {
  'active': 'green',
  'inactive': 'gray',
  'suspended': 'red',
  'deleted': 'darkred',
  'pending': 'orange',
  'offline': 'gray'
};

const LOGIN_ERROR_MAP = {
  'pending': 'PENDING_VERIFICATION',
  'inactive': 'ACCOUNT_INACTIVE',
  'suspended': 'ACCOUNT_SUSPENDED',
  'deleted': 'ACCOUNT_DELETED',
  'offline': 'ACCOUNT_OFFLINE'
};

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
      index: true,
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
    
    role: {
      type: String,
      enum: ["admin", "user", "manager"],
      default: "user",
      index: true,
    },
    
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: 'pending',
      index: true,
    },
    
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    lastSeen: {
      type: Date,
      default: null,
    },
    
    lastLogout: {
      type: Date,
      default: null,
    },
    
    notificationSettings: {
      pushNotifications: {
        enabled: { type: Boolean, default: true },
        lastUpdated: Date,
      },
      notificationTypes: {
        newOrders: {
          enabled: { type: Boolean, default: true },
          priority: { type: String, enum: ['high', 'normal', 'low'], default: 'high' },
          sound: { type: Boolean, default: true },
        },
        payments: {
          enabled: { type: Boolean, default: true },
          priority: { type: String, enum: ['high', 'normal', 'low'], default: 'high' },
          sound: { type: Boolean, default: true },
        },
        lowStock: {
          enabled: { type: Boolean, default: true },
          priority: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
          sound: { type: Boolean, default: true },
        },
        systemAlerts: {
          enabled: { type: Boolean, default: true },
          priority: { type: String, enum: ['high', 'normal', 'low'], default: 'high' },
          sound: { type: Boolean, default: true },
        },
        orderUpdates: {
          enabled: { type: Boolean, default: true },
          priority: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
          sound: { type: Boolean, default: true },
        },
      },
      quietHours: {
        enabled: { type: Boolean, default: false },
        startTime: { type: String, default: "22:00" },
        endTime: { type: String, default: "08:00" },
        timezone: { type: String, default: "UTC+5:30" },
      },
      displayPreferences: {
        showPreview: { type: Boolean, default: true },
        duration: { type: Number, default: 5000, min: 1000, max: 30000 },
        position: { 
          type: String, 
          enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'], 
          default: 'top-right' 
        },
        animation: { 
          type: String, 
          enum: ['slide', 'fade', 'scale'], 
          default: 'slide' 
        },
      },
      emailNotifications: {
        enabled: { type: Boolean, default: true },
        frequency: { 
          type: String, 
          enum: ['instant', 'daily', 'weekly'], 
          default: 'instant' 
        },
        types: {
          summary: { type: Boolean, default: true },
          alerts: { type: Boolean, default: true },
          reports: { type: Boolean, default: false },
        },
      },
      whatsappNotifications: {
        enabled: { type: Boolean, default: false },
        phoneNumber: String,
        types: {
          urgent: { type: Boolean, default: true },
          dailySummary: { type: Boolean, default: false },
        },
      },
      settingsUpdatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    
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
        default: 30000,
        min: 10000,
        max: 300000,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
    },
    
    verificationToken: { 
      type: String, 
      index: true, 
      sparse: true 
    },
    verificationTokenExpires: Date,
    resetPasswordToken: { 
      type: String, 
      index: true, 
      sparse: true 
    },
    resetPasswordExpires: Date,
    emailVerifiedAt: Date,
    
    lastLogin: Date,
    lastLoginIp: String,
    loginCount: {
      type: Number,
      default: 0,
    },
    lastNotificationRead: Date,
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    deletedAt: {
      type: Date,
      index: { expireAfterSeconds: 2592000 }
    },
    
    statusHistory: [{
      status: { type: String, enum: VALID_STATUSES },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      changedAt: { type: Date, default: Date.now, index: -1 },
      reason: String,
      ip: String,
    }],
    
    metrics: {
      notificationsSent: { type: Number, default: 0 },
      notificationsReceived: { type: Number, default: 0 },
      lastNotificationMetricsUpdate: Date,
    },
    
    security: {
      lastPasswordChange: Date,
      failedLoginAttempts: { 
        type: Number, 
        default: 0, 
        select: false 
      },
      lastFailedLogin: Date,
      lastSuccessfulLogin: Date,
      loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ip: String,
        userAgent: String,
        success: Boolean,
      }],
    },
    
    suspensionReason: String,
    suspendedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    autoIndex: process.env.NODE_ENV !== 'production',
    minimize: true,
    strict: true,
  }
);

// ========== INDEXES ==========
userSchema.index({ email: 1 }, { unique: true, name: 'email_login_idx', background: true });
userSchema.index(
  { status: 1, isVerified: 1, role: 1 },
  { 
    name: 'active_users_idx',
    background: true,
    partialFilterExpression: { status: 'active', isVerified: true }
  }
);
userSchema.index({ verificationToken: 1 }, { sparse: true, background: true, name: 'verification_token_idx' });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true, background: true, name: 'reset_token_idx' });
userSchema.index(
  { role: 1, status: 1, isVerified: 1, 'notificationSettings.pushNotifications.enabled': 1 },
  { name: 'notification_users_idx', background: true }
);
userSchema.index({ createdAt: -1 }, { background: true, name: 'created_at_idx' });
userSchema.index({ lastSeen: -1 }, { background: true, name: 'last_seen_idx', sparse: true });

// ========== VIRTUAL PROPERTIES ==========
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

userSchema.virtual('isManager').get(function() {
  return this.role === 'manager';
});

userSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.isVerified === true;
});

userSchema.virtual('isOnline').get(function() {
  return this.status === 'active';
});

userSchema.virtual('isOffline').get(function() {
  return this.status === 'offline';
});

userSchema.virtual('statusDisplayName').get(function() {
  return STATUS_DISPLAY_NAMES[this.status] || this.status;
});

userSchema.virtual('statusColor').get(function() {
  return STATUS_COLORS[this.status] || 'gray';
});

userSchema.virtual('isLocked').get(function() {
  return ['suspended', 'deleted', 'inactive'].includes(this.status);
});

userSchema.virtual('deviceTokens', {
  ref: 'DeviceToken',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});

userSchema.virtual('activeDeviceTokens', {
  ref: 'DeviceToken',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
  match: { isActive: true }
});

userSchema.virtual('notificationStats').get(function() {
  return {
    totalNotifications: this.metrics?.notificationsReceived || 0,
    lastNotificationRead: this.lastNotificationRead,
    notificationsEnabled: this.notificationSettings?.pushNotifications?.enabled || false,
  };
});

userSchema.virtual('accountAge').get(function() {
  if (!this.createdAt) return 0;
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// ========== PRE-SAVE MIDDLEWARE ==========
userSchema.pre("save", async function(next) {
  try {
    // ✅ Validate status
    if (this.status && !VALID_STATUSES.includes(this.status)) {
      const error = new Error(`Invalid status value: ${this.status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
      error.code = 'INVALID_STATUS_VALUE';
      return next(error);
    }

    // ✅ Validate status transition
    if (this.isModified('status')) {
      const originalDoc = await this.constructor.findById(this._id).select('status');
      const oldStatus = originalDoc?.status || this.status;
      
      if (oldStatus && oldStatus !== this.status) {
        const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[oldStatus] || [];
        if (!allowedTransitions.includes(this.status) && oldStatus !== 'deleted') {
          const error = new Error(`Invalid status transition: ${oldStatus} → ${this.status}`);
          error.code = 'INVALID_STATUS_TRANSITION';
          return next(error);
        }
      }
    }

    // ✅ CRITICAL FIX: Hash password ONLY if it's a plain text password
    // This prevents double-hashing which was breaking password reset
    if (this.isModified("password")) {
      // Check if password is already bcrypt hashed
      const isAlreadyHashed = this.password.startsWith('$2a$') || 
                             this.password.startsWith('$2b$') || 
                             this.password.startsWith('$2y$');
      
      if (!isAlreadyHashed) {
        console.log(`🔐 [User Model] Hashing plain text password for: ${this.email || 'new user'}`);
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        if (!this.security) this.security = {};
        this.security.lastPasswordChange = new Date();
      } else {
        console.log(`✅ [User Model] Password already hashed, skipping: ${this.email || 'new user'}`);
      }
    }
    
    // ✅ Update notification settings timestamp
    if (this.isModified("notificationSettings")) {
      this.notificationSettings.settingsUpdatedAt = new Date();
    }
    
    // ✅ Auto-verify when email verified
    if (this.isModified("isVerified") && this.isVerified) {
      this.emailVerifiedAt = new Date();
      if (this.status === 'pending') {
        this.status = 'active';
        if (!this.statusHistory) this.statusHistory = [];
        this.statusHistory.push({
          status: 'active',
          changedBy: this._id,
          changedAt: new Date(),
          reason: 'Email verified'
        });
      }
    }
    
    // ✅ Auto-update lastSeen when status changes to active
    if (this.isModified('status') && this.status === 'active') {
      this.lastSeen = new Date();
    }
    
    // ✅ Limit history arrays
    if (this.statusHistory && this.statusHistory.length > 20) {
      this.statusHistory = this.statusHistory.slice(-20);
    }
    if (this.security?.loginHistory && this.security.loginHistory.length > 50) {
      this.security.loginHistory = this.security.loginHistory.slice(-50);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ========== INSTANCE METHODS ==========
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error(`❌ [User Model] Password comparison error:`, error.message);
    return false;
  }
};

userSchema.methods.createVerificationToken = function() {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.createResetToken = function() {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpires = Date.now() + 3600000;
  return token;
};

userSchema.methods.clearVerificationToken = function() {
  this.verificationToken = undefined;
  this.verificationTokenExpires = undefined;
  this.isVerified = true;
  this.emailVerifiedAt = new Date();
  if (this.status === 'pending') {
    this.status = 'active';
    if (!this.statusHistory) this.statusHistory = [];
    this.statusHistory.push({
      status: 'active',
      changedBy: this._id,
      changedAt: new Date(),
      reason: 'Email verified'
    });
  }
};

userSchema.methods.clearResetToken = function() {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
  if (!this.security) this.security = {};
  this.security.lastPasswordChange = new Date();
};

userSchema.methods.canLogin = function() {
  return this.status === 'active' && this.isVerified === true;
};

userSchema.methods.setOffline = async function() {
  this.status = 'offline';
  this.lastLogout = new Date();
  this.lastSeen = new Date();
  
  if (!this.statusHistory) this.statusHistory = [];
  this.statusHistory.push({
    status: 'offline',
    changedBy: this._id,
    changedAt: new Date(),
    reason: 'User logged out'
  });
  
  await this.save();
  return this;
};

userSchema.methods.setOnline = async function(ip, userAgent) {
  const wasOffline = this.status === 'offline';
  this.status = 'active';
  this.lastSeen = new Date();
  
  if (wasOffline) {
    if (!this.statusHistory) this.statusHistory = [];
    this.statusHistory.push({
      status: 'active',
      changedBy: this._id,
      changedAt: new Date(),
      reason: 'User logged in',
      ip
    });
  }
  
  await this.save();
  return this;
};

userSchema.methods.getLoginErrorMessage = function() {
  if (!this.isVerified) return 'PENDING_VERIFICATION';
  return LOGIN_ERROR_MAP[this.status] || 'ACCOUNT_INACTIVE';
};

userSchema.methods.changeStatus = async function(newStatus, options = {}) {
  const { changedBy, reason, ip } = options;
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  const oldStatus = this.status;
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[oldStatus] || [];
  if (!allowedTransitions.includes(newStatus) && oldStatus !== newStatus && oldStatus !== 'deleted') {
    throw new Error(`Cannot change status from ${oldStatus} to ${newStatus}`);
  }
  this.status = newStatus;
  if (!this.statusHistory) this.statusHistory = [];
  this.statusHistory.push({
    status: newStatus,
    changedBy: changedBy || this._id,
    changedAt: new Date(),
    reason: reason || `Status changed from ${oldStatus} to ${newStatus}`,
    ip
  });
  if (newStatus === 'deleted') {
    this.deletedAt = new Date();
  }
  if (newStatus === 'active') {
    this.lastSeen = new Date();
  }
  if (newStatus === 'offline') {
    this.lastLogout = new Date();
    this.lastSeen = new Date();
  }
  await this.save();
  return this;
};

userSchema.methods.recordLogin = async function(ip, userAgent) {
  await this.constructor.updateOne(
    { _id: this._id },
    {
      $set: {
        lastLogin: new Date(),
        lastLoginIp: ip,
        'security.failedLoginAttempts': 0,
        'security.lastSuccessfulLogin': new Date(),
        status: 'active',
        lastSeen: new Date()
      },
      $inc: { loginCount: 1 },
      $push: {
        'security.loginHistory': {
          timestamp: new Date(),
          ip,
          userAgent,
          success: true
        }
      }
    }
  );
  this.lastLogin = new Date();
  this.lastLoginIp = ip;
  this.loginCount = (this.loginCount || 0) + 1;
  this.status = 'active';
  this.lastSeen = new Date();
  if (!this.security) this.security = {};
  this.security.failedLoginAttempts = 0;
  this.security.lastSuccessfulLogin = new Date();
};

userSchema.methods.recordFailedLogin = async function(ip, userAgent) {
  await this.constructor.updateOne(
    { _id: this._id },
    {
      $inc: { 'security.failedLoginAttempts': 1 },
      $set: { 'security.lastFailedLogin': new Date() },
      $push: {
        'security.loginHistory': {
          timestamp: new Date(),
          ip,
          userAgent,
          success: false
        }
      }
    }
  );
  const currentAttempts = (this.security?.failedLoginAttempts || 0) + 1;
  if (currentAttempts >= 5 && this.status === 'active') {
    await this.constructor.updateOne(
      { _id: this._id, status: 'active' },
      {
        $set: {
          status: 'suspended',
          suspensionReason: 'Too many failed login attempts',
          suspendedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: 'suspended',
            changedAt: new Date(),
            reason: 'Auto-suspended: Too many failed login attempts',
            ip
          }
        }
      }
    );
    this.status = 'suspended';
  }
};

// ========== NOTIFICATION METHODS ==========
userSchema.methods.isNotificationEnabled = function(notificationType) {
  if (!this.isAdmin) return false;
  const settings = this.notificationSettings;
  if (!settings) return true;
  if (settings.pushNotifications && !settings.pushNotifications.enabled) return false;
  
  if (settings.quietHours?.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    if (startTime <= endTime) {
      if (currentTime >= startTime && currentTime < endTime) return false;
    } else {
      if (currentTime >= startTime || currentTime < endTime) return false;
    }
  }
  
  if (settings.notificationTypes?.[notificationType]) {
    return settings.notificationTypes[notificationType].enabled;
  }
  return true;
};

userSchema.methods.getNotificationPriority = function(notificationType) {
  if (!this.isAdmin) return 'normal';
  return this.notificationSettings?.notificationTypes?.[notificationType]?.priority || 'normal';
};

userSchema.methods.getNotificationSoundPreference = function(notificationType) {
  if (!this.isAdmin) return true;
  return this.notificationSettings?.notificationTypes?.[notificationType]?.sound ?? true;
};

userSchema.methods.updateNotificationSettings = function(updates) {
  if (!updates || typeof updates !== 'object') {
    throw new Error('Invalid updates object');
  }
  if (!this.notificationSettings) this.notificationSettings = {};
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

// ========== ACCOUNT MANAGEMENT METHODS ==========
userSchema.methods.updateProfile = function(updates) {
  const allowedUpdates = ['fullName', 'phone', 'notificationSettings', 'adminPreferences'];
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      this[field] = updates[field];
    }
  });
  return this;
};

userSchema.methods.suspendAccount = function(reason = 'Violation of terms', changedBy = null, ip = null) {
  return this.changeStatus('suspended', { reason, changedBy, ip });
};

userSchema.methods.reactivateAccount = function(reason = 'Account reactivated', changedBy = null, ip = null) {
  if (this.status === 'suspended' || this.status === 'inactive') {
    return this.changeStatus('active', { reason, changedBy, ip });
  }
  return this;
};

userSchema.methods.updateLastSeen = async function() {
  this.lastSeen = new Date();
  await this.save();
  return this;
};

// ========== STATIC METHODS ==========
userSchema.statics.findForLogin = function(email) {
  return this.findOne(
    { email: email.toLowerCase().trim() },
    '_id email password role status isVerified fullName phone loginCount security.failedLoginAttempts lastSeen lastLogout'
  ).select('+password +security.failedLoginAttempts');
};

userSchema.statics.findAdminsWithNotificationsEnabled = function() {
  return this.find({
    role: 'admin',
    status: 'active',
    isVerified: true,
    'notificationSettings.pushNotifications.enabled': true,
  })
  .select('_id email fullName notificationSettings adminPreferences')
  .lean()
  .cursor();
};

userSchema.statics.getAllAdmins = function() {
  return this.find({
    role: 'admin',
    status: 'active',
    isVerified: true,
  })
  .select('_id email fullName phone')
  .lean()
  .cursor();
};

userSchema.statics.findByVerificationToken = function(token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() }
  });
};

userSchema.statics.findByResetToken = function(token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
};

userSchema.statics.findActiveByRole = function(role) {
  return this.find({
    role: role,
    status: 'active',
    isVerified: true
  }).select('_id email fullName');
};

userSchema.statics.findOnlineUsers = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.find({
    status: 'active',
    lastSeen: { $gte: fiveMinutesAgo }
  }).select('_id email fullName role lastSeen');
};

// ========== QUERY HELPERS ==========
userSchema.query.active = function() {
  return this.where({ status: 'active', isVerified: true });
};

userSchema.query.pending = function() {
  return this.where({ status: 'pending' });
};

userSchema.query.suspended = function() {
  return this.where({ status: 'suspended' });
};

userSchema.query.offline = function() {
  return this.where({ status: 'offline' });
};

userSchema.query.verified = function() {
  return this.where({ isVerified: true });
};

userSchema.query.admins = function() {
  return this.where({ role: 'admin' });
};

// ========== CREATE MODEL ==========
const User = mongoose.models.User || mongoose.model("User", userSchema);

// 🔥 ENSURE INDEXES IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
  User.syncIndexes().catch(err => {
    console.error('Error syncing indexes:', err);
  });
}

export default User;