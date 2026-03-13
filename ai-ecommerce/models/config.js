// // models/Config.js - Complete MongoDB/Mongoose Configuration Model
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// // ==================== MONGOOSE SCHEMA ====================
// const ConfigSchema = new Schema(
//   {
//     tenantId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Tenant',
//       required: [true, 'Tenant ID is required'],
//       unique: true,
//       index: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },

//     subscription: {
//       planName: {
//         type: String,
//         enum: {
//           values: ['free', 'basic', 'pro', 'enterprise'],
//           message: '{VALUE} is not a valid plan',
//         },
//         default: 'free',
//       },
//       expiresAt: {
//         type: Date,
//         validate: {
//           validator: function (value) {
//             return !value || value > new Date();
//           },
//           message: 'Expiry date must be in the future',
//         },
//       },
//       isActive: {
//         type: Boolean,
//         default: true,
//       },
//     },

//     general: {
//       appName: {
//         type: String,
//         trim: true,
//         maxlength: [100, 'App name cannot exceed 100 characters'],
//       },
//       supportEmail: {
//         type: String,
//         trim: true,
//         lowercase: true,
//         match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
//       },
//       currency: {
//         type: String,
//         default: 'INR',
//         uppercase: true,
//         minlength: 3,
//         maxlength: 3,
//       },
//       timezone: {
//         type: String,
//         default: 'Asia/Kolkata',
//         validate: {
//           validator: function (value) {
//             try {
//               Intl.DateTimeFormat(undefined, { timeZone: value });
//               return true;
//             } catch {
//               return false;
//             }
//           },
//           message: '{VALUE} is not a valid timezone',
//         },
//       },
//     },

//     ecommerce: {
//       enabled: {
//         type: Boolean,
//         default: true,
//       },
//       allowCOD: {
//         type: Boolean,
//         default: true,
//       },
//       taxPercent: {
//         type: Number,
//         default: 18,
//         min: [0, 'Tax percentage cannot be negative'],
//         max: [100, 'Tax percentage cannot exceed 100%'],
//       },
//       shippingCharge: {
//         type: Number,
//         default: 0,
//         min: [0, 'Shipping charge cannot be negative'],
//       },
//     },

//     booking: {
//       enabled: {
//         type: Boolean,
//         default: true,
//       },
//       maxBookingsPerDay: {
//         type: Number,
//         default: 50,
//         min: [1, 'At least 1 booking per day required'],
//         max: [1000, 'Cannot exceed 1000 bookings per day'],
//       },
//       cancellationHours: {
//         type: Number,
//         default: 24,
//         min: [0, 'Cancellation hours cannot be negative'],
//         max: [720, 'Cannot exceed 720 hours (30 days)'],
//       },
//       autoApproval: {
//         type: Boolean,
//         default: false,
//       },
//     },

//     notifications: {
//       email: {
//         type: Boolean,
//         default: true,
//       },
//       sms: {
//         type: Boolean,
//         default: false,
//       },
//       whatsapp: {
//         type: Boolean,
//         default: true,
//       },
//     },

//     features: {
//       coupons: {
//         type: Boolean,
//         default: false,
//       },
//       referrals: {
//         type: Boolean,
//         default: false,
//       },
//       analytics: {
//         type: Boolean,
//         default: true,
//       },
//     },

//     limits: {
//       maxUsers: {
//         type: Number,
//         default: 5,
//         min: [1, 'At least 1 user required'],
//         max: [10000, 'Cannot exceed 10,000 users'],
//       },
//       maxProducts: {
//         type: Number,
//         default: 500,
//         min: [0, 'Product limit cannot be negative'],
//         max: [100000, 'Cannot exceed 100,000 products'],
//       },
//       maxBookingsPerMonth: {
//         type: Number,
//         default: 300,
//         min: [0, 'Booking limit cannot be negative'],
//         max: [100000, 'Cannot exceed 100,000 bookings per month'],
//       },
//     },

//     updatedBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: {
//       virtuals: true,
//       transform: function (doc, ret) {
//         ret.id = ret._id;
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//       },
//     },
//     toObject: {
//       virtuals: true,
//       transform: function (doc, ret) {
//         ret.id = ret._id;
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//       },
//     },
//   }
// );

// // ==================== INDEXES ====================
// ConfigSchema.index({ tenantId: 1, isActive: 1 });
// ConfigSchema.index({ 'subscription.expiresAt': 1 });
// ConfigSchema.index({ 'subscription.isActive': 1 });
// ConfigSchema.index({ createdAt: -1 });
// ConfigSchema.index({ updatedAt: -1 });

// // ==================== VIRTUAL PROPERTIES ====================
// ConfigSchema.virtual('isSubscriptionValid').get(function () {
//   const now = new Date();
//   return (
//     this.subscription.isActive &&
//     (!this.subscription.expiresAt || this.subscription.expiresAt > now)
//   );
// });

// ConfigSchema.virtual('daysUntilExpiry').get(function () {
//   if (!this.subscription.expiresAt) return null;
//   const now = new Date();
//   const diffTime = this.subscription.expiresAt.getTime() - now.getTime();
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// });

// ConfigSchema.virtual('planTier').get(function () {
//   const plans = {
//     free: 1,
//     basic: 2,
//     pro: 3,
//     enterprise: 4
//   };
//   return plans[this.subscription.planName] || 1;
// });

// // ==================== PRE-SAVE MIDDLEWARE ====================
// ConfigSchema.pre('save', function (next) {
//   // Auto-deactivate if subscription expired
//   if (this.subscription.expiresAt && this.subscription.expiresAt < new Date()) {
//     this.subscription.isActive = false;
//   }

//   // Validate that free plan has limited features
//   if (this.subscription.planName === 'free') {
//     this.limits.maxUsers = Math.min(this.limits.maxUsers, 3);
//     this.limits.maxProducts = Math.min(this.limits.maxProducts, 100);
//     this.features.coupons = false;
//     this.features.referrals = false;
//   }

//   // Ensure email is required if email notifications are enabled
//   if (this.notifications.email && !this.general.supportEmail) {
//     next(new Error('Support email is required when email notifications are enabled'));
//     return;
//   }

//   next();
// });

// ConfigSchema.pre('findOneAndUpdate', function (next) {
//   const update = this.getUpdate();
  
//   // Handle subscription expiration on update
//   if (update.$set && update.$set['subscription.expiresAt']) {
//     const expiresAt = new Date(update.$set['subscription.expiresAt']);
//     if (expiresAt < new Date()) {
//       update.$set['subscription.isActive'] = false;
//     }
//   }
  
//   next();
// });

// // ==================== STATIC METHODS ====================
// ConfigSchema.statics.findByTenantId = async function (tenantId) {
//   return this.findOne({
//     tenantId: mongoose.Types.ObjectId.isValid(tenantId) 
//       ? new mongoose.Types.ObjectId(tenantId) 
//       : tenantId,
//     isActive: true,
//   }).populate('tenantId updatedBy');
// };

// ConfigSchema.statics.isFeatureEnabled = async function (tenantId, featurePath) {
//   const config = await this.findOne(
//     { 
//       tenantId: mongoose.Types.ObjectId.isValid(tenantId) 
//         ? new mongoose.Types.ObjectId(tenantId) 
//         : tenantId, 
//       isActive: true 
//     },
//     { [featurePath]: 1 }
//   ).lean();

//   if (!config) return false;

//   const pathParts = featurePath.split('.');
//   let value = config;
//   for (const part of pathParts) {
//     value = value?.[part];
//     if (value === undefined) return false;
//   }

//   return Boolean(value);
// };

// ConfigSchema.statics.getExpiredSubscriptions = async function () {
//   return this.find({
//     'subscription.isActive': true,
//     'subscription.expiresAt': { $lt: new Date() },
//   });
// };

// ConfigSchema.statics.bulkUpdate = async function (tenantIds, updates) {
//   return this.updateMany(
//     { tenantId: { $in: tenantIds } },
//     { $set: updates },
//     { runValidators: true }
//   );
// };

// ConfigSchema.statics.getConfigWithFeatures = async function (tenantId, features = []) {
//   const config = await this.findOne({
//     tenantId: mongoose.Types.ObjectId.isValid(tenantId) 
//       ? new mongoose.Types.ObjectId(tenantId) 
//       : tenantId,
//     isActive: true,
//   }).lean();

//   if (!config) return null;

//   // Check each requested feature
//   const featureStatus = {};
//   features.forEach(feature => {
//     const pathParts = feature.split('.');
//     let value = config;
//     for (const part of pathParts) {
//       value = value?.[part];
//       if (value === undefined) {
//         featureStatus[feature] = false;
//         return;
//       }
//     }
//     featureStatus[feature] = Boolean(value);
//   });

//   return {
//     config,
//     features: featureStatus,
//   };
// };

// // ==================== INSTANCE METHODS ====================
// ConfigSchema.methods.isFeatureOn = function (featureName) {
//   // Check in features
//   if (featureName in this.features) {
//     return this.features[featureName];
//   }
//   // Check in notifications
//   if (featureName in this.notifications) {
//     return this.notifications[featureName];
//   }
//   // Check in other sections
//   if (featureName === 'ecommerce') return this.ecommerce.enabled;
//   if (featureName === 'booking') return this.booking.enabled;
  
//   return false;
// };

// ConfigSchema.methods.updatePlan = async function (planName, expiresAt, updatedBy) {
//   this.subscription.planName = planName;
//   if (expiresAt) this.subscription.expiresAt = expiresAt;
//   this.subscription.isActive = true;
//   if (updatedBy) this.updatedBy = updatedBy;

//   return this.save();
// };

// ConfigSchema.methods.getSummary = function () {
//   return {
//     tenantId: this.tenantId,
//     isActive: this.isActive,
//     subscription: {
//       plan: this.subscription.planName,
//       isValid: this.isSubscriptionValid,
//       expiresAt: this.subscription.expiresAt,
//       daysUntilExpiry: this.daysUntilExpiry,
//     },
//     features: {
//       ecommerce: this.ecommerce.enabled,
//       booking: this.booking.enabled,
//       analytics: this.features.analytics,
//       coupons: this.features.coupons,
//       referrals: this.features.referrals,
//     },
//     notifications: {
//       email: this.notifications.email,
//       sms: this.notifications.sms,
//       whatsapp: this.notifications.whatsapp,
//     },
//     limits: this.limits,
//     lastUpdated: this.updatedAt,
//   };
// };

// ConfigSchema.methods.canAddUser = function (currentUserCount) {
//   return currentUserCount < this.limits.maxUsers;
// };

// ConfigSchema.methods.canAddProduct = function (currentProductCount) {
//   return currentProductCount < this.limits.maxProducts;
// };

// ConfigSchema.methods.canAddBooking = function (currentBookingCount) {
//   return currentBookingCount < this.limits.maxBookingsPerMonth;
// };

// // ==================== QUERY HELPERS ====================
// ConfigSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// ConfigSchema.query.byTenant = function (tenantId) {
//   return this.where({ 
//     tenantId: mongoose.Types.ObjectId.isValid(tenantId) 
//       ? new mongoose.Types.ObjectId(tenantId) 
//       : tenantId 
//   });
// };

// ConfigSchema.query.withValidSubscription = function () {
//   return this.where({
//     'subscription.isActive': true,
//     $or: [
//       { 'subscription.expiresAt': { $exists: false } },
//       { 'subscription.expiresAt': { $gt: new Date() } }
//     ]
//   });
// };

// // ==================== MODEL CREATION ====================
// const ConfigModel = mongoose.models.Config || mongoose.model('Config', ConfigSchema);

// module.exports = ConfigModel;

// // ==================== UTILITY FUNCTIONS ====================
// module.exports.ConfigUtils = {
//   // Default configuration for new tenants
//   getDefaultConfig(tenantId) {
//     return {
//       tenantId,
//       isActive: true,
//       subscription: {
//         planName: 'free',
//         isActive: true,
//       },
//       general: {
//         currency: 'INR',
//         timezone: 'Asia/Kolkata',
//       },
//       ecommerce: {
//         enabled: true,
//         allowCOD: true,
//         taxPercent: 18,
//         shippingCharge: 0,
//       },
//       booking: {
//         enabled: true,
//         maxBookingsPerDay: 50,
//         cancellationHours: 24,
//         autoApproval: false,
//       },
//       notifications: {
//         email: true,
//         sms: false,
//         whatsapp: true,
//       },
//       features: {
//         coupons: false,
//         referrals: false,
//         analytics: true,
//       },
//       limits: {
//         maxUsers: 5,
//         maxProducts: 500,
//         maxBookingsPerMonth: 300,
//       },
//     };
//   },

//   // Validate configuration updates
//   validateUpdates(updates) {
//     const errors = [];

//     if (updates.ecommerce && updates.ecommerce.taxPercent !== undefined) {
//       if (updates.ecommerce.taxPercent < 0 || updates.ecommerce.taxPercent > 100) {
//         errors.push('Tax percentage must be between 0 and 100');
//       }
//     }

//     if (updates.limits && updates.limits.maxUsers !== undefined) {
//       if (updates.limits.maxUsers < 1) {
//         errors.push('Maximum users must be at least 1');
//       }
//     }

//     if (updates.booking && updates.booking.cancellationHours !== undefined) {
//       if (updates.booking.cancellationHours < 0) {
//         errors.push('Cancellation hours cannot be negative');
//       }
//     }

//     if (updates.general && updates.general.supportEmail) {
//       const emailRegex = /^\S+@\S+\.\S+$/;
//       if (!emailRegex.test(updates.general.supportEmail)) {
//         errors.push('Please enter a valid email address');
//       }
//     }

//     return {
//       valid: errors.length === 0,
//       errors,
//     };
//   },

//   // Create configuration for new tenant
//   async createForTenant(tenantId, userId) {
//     const defaultConfig = this.getDefaultConfig(tenantId);
//     if (userId) {
//       defaultConfig.updatedBy = userId;
//     }

//     const config = new ConfigModel(defaultConfig);
//     return config.save();
//   },

//   // Check if tenant can perform action based on limits
//   async canPerformAction(tenantId, action, currentCount) {
//     const config = await ConfigModel.findByTenantId(tenantId);
//     if (!config || !config.isActive) {
//       return { allowed: false, reason: 'Configuration not found or inactive' };
//     }

//     if (!config.isSubscriptionValid) {
//       return { allowed: false, reason: 'Subscription expired or inactive' };
//     }

//     let limit;
//     let message;

//     switch (action) {
//       case 'createUser':
//         limit = config.limits.maxUsers;
//         message = 'Maximum user limit reached';
//         break;
//       case 'createProduct':
//         limit = config.limits.maxProducts;
//         message = 'Maximum product limit reached';
//         break;
//       case 'createBooking':
//         limit = config.limits.maxBookingsPerMonth;
//         message = 'Monthly booking limit reached';
//         break;
//       default:
//         return { allowed: false, reason: 'Invalid action' };
//     }

//     if (currentCount >= limit) {
//       return { allowed: false, reason: message };
//     }

//     return { allowed: true };
//   },

//   // Get plan limits by plan name
//   getPlanLimits(planName) {
//     const plans = {
//       free: {
//         maxUsers: 3,
//         maxProducts: 100,
//         maxBookingsPerMonth: 100,
//         features: {
//           coupons: false,
//           referrals: false,
//           analytics: true,
//         }
//       },
//       basic: {
//         maxUsers: 10,
//         maxProducts: 1000,
//         maxBookingsPerMonth: 500,
//         features: {
//           coupons: true,
//           referrals: false,
//           analytics: true,
//         }
//       },
//       pro: {
//         maxUsers: 50,
//         maxProducts: 5000,
//         maxBookingsPerMonth: 2000,
//         features: {
//           coupons: true,
//           referrals: true,
//           analytics: true,
//         }
//       },
//       enterprise: {
//         maxUsers: 10000,
//         maxProducts: 100000,
//         maxBookingsPerMonth: 100000,
//         features: {
//           coupons: true,
//           referrals: true,
//           analytics: true,
//         }
//       }
//     };

//     return plans[planName] || plans.free;
//   },

//   // Upgrade tenant to new plan
//   async upgradePlan(tenantId, newPlan, expiresAt, updatedBy) {
//     const config = await ConfigModel.findByTenantId(tenantId);
//     if (!config) {
//       throw new Error('Configuration not found');
//     }

//     const planLimits = this.getPlanLimits(newPlan);
    
//     config.subscription.planName = newPlan;
//     if (expiresAt) config.subscription.expiresAt = expiresAt;
//     config.subscription.isActive = true;
    
//     // Update limits based on new plan
//     config.limits.maxUsers = planLimits.maxUsers;
//     config.limits.maxProducts = planLimits.maxProducts;
//     config.limits.maxBookingsPerMonth = planLimits.maxBookingsPerMonth;
    
//     // Update features
//     config.features.coupons = planLimits.features.coupons;
//     config.features.referrals = planLimits.features.referrals;
    
//     if (updatedBy) config.updatedBy = updatedBy;

//     return config.save();
//   },
// };








// above code is without saas









// models/Config.js - Complete MongoDB/Mongoose Configuration Model
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ==================== MONGOOSE SCHEMA ====================
const ConfigSchema = new Schema(
  {
    // CHANGED: tenantId -> companyId
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company', // CHANGED: Tenant -> Company
      required: [true, 'Company ID is required'],
      unique: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    subscription: {
      planName: {
        type: String,
        enum: {
          values: ['free', 'basic', 'pro', 'enterprise'],
          message: '{VALUE} is not a valid plan',
        },
        default: 'free',
      },
      expiresAt: {
        type: Date,
        validate: {
          validator: function (value) {
            return !value || value > new Date();
          },
          message: 'Expiry date must be in the future',
        },
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },

    general: {
      appName: {
        type: String,
        trim: true,
        maxlength: [100, 'App name cannot exceed 100 characters'],
      },
      supportEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      currency: {
        type: String,
        default: 'INR',
        uppercase: true,
        minlength: 3,
        maxlength: 3,
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
        validate: {
          validator: function (value) {
            try {
              Intl.DateTimeFormat(undefined, { timeZone: value });
              return true;
            } catch {
              return false;
            }
          },
          message: '{VALUE} is not a valid timezone',
        },
      },
    },

    ecommerce: {
      enabled: {
        type: Boolean,
        default: true,
      },
      allowCOD: {
        type: Boolean,
        default: true,
      },
      taxPercent: {
        type: Number,
        default: 18,
        min: [0, 'Tax percentage cannot be negative'],
        max: [100, 'Tax percentage cannot exceed 100%'],
      },
      shippingCharge: {
        type: Number,
        default: 0,
        min: [0, 'Shipping charge cannot be negative'],
      },
    },

    booking: {
      enabled: {
        type: Boolean,
        default: true,
      },
      maxBookingsPerDay: {
        type: Number,
        default: 50,
        min: [1, 'At least 1 booking per day required'],
        max: [1000, 'Cannot exceed 1000 bookings per day'],
      },
      cancellationHours: {
        type: Number,
        default: 24,
        min: [0, 'Cancellation hours cannot be negative'],
        max: [720, 'Cannot exceed 720 hours (30 days)'],
      },
      autoApproval: {
        type: Boolean,
        default: false,
      },
    },

    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      whatsapp: {
        type: Boolean,
        default: true,
      },
    },

    features: {
      coupons: {
        type: Boolean,
        default: false,
      },
      referrals: {
        type: Boolean,
        default: false,
      },
      analytics: {
        type: Boolean,
        default: true,
      },
    },

    limits: {
      maxUsers: {
        type: Number,
        default: 5,
        min: [1, 'At least 1 user required'],
        max: [10000, 'Cannot exceed 10,000 users'],
      },
      maxProducts: {
        type: Number,
        default: 500,
        min: [0, 'Product limit cannot be negative'],
        max: [100000, 'Cannot exceed 100,000 products'],
      },
      maxBookingsPerMonth: {
        type: Number,
        default: 300,
        min: [0, 'Booking limit cannot be negative'],
        max: [100000, 'Cannot exceed 100,000 bookings per month'],
      },
    },

    // KEPT: updatedBy as is
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ==================== INDEXES (UPDATED) ====================
ConfigSchema.index({ companyId: 1, isActive: 1 }); // CHANGED: tenantId -> companyId
ConfigSchema.index({ 'subscription.expiresAt': 1 });
ConfigSchema.index({ 'subscription.isActive': 1 });
ConfigSchema.index({ createdAt: -1 });
ConfigSchema.index({ updatedAt: -1 });

// ==================== VIRTUAL PROPERTIES ====================
ConfigSchema.virtual('isSubscriptionValid').get(function () {
  const now = new Date();
  return (
    this.subscription.isActive &&
    (!this.subscription.expiresAt || this.subscription.expiresAt > now)
  );
});

ConfigSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.subscription.expiresAt) return null;
  const now = new Date();
  const diffTime = this.subscription.expiresAt.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

ConfigSchema.virtual('planTier').get(function () {
  const plans = {
    free: 1,
    basic: 2,
    pro: 3,
    enterprise: 4
  };
  return plans[this.subscription.planName] || 1;
});

// ==================== PRE-SAVE MIDDLEWARE ====================
ConfigSchema.pre('save', function (next) {
  // Auto-deactivate if subscription expired
  if (this.subscription.expiresAt && this.subscription.expiresAt < new Date()) {
    this.subscription.isActive = false;
  }

  // Validate that free plan has limited features
  if (this.subscription.planName === 'free') {
    this.limits.maxUsers = Math.min(this.limits.maxUsers, 3);
    this.limits.maxProducts = Math.min(this.limits.maxProducts, 100);
    this.features.coupons = false;
    this.features.referrals = false;
  }

  // Ensure email is required if email notifications are enabled
  if (this.notifications.email && !this.general.supportEmail) {
    next(new Error('Support email is required when email notifications are enabled'));
    return;
  }

  next();
});

ConfigSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  
  // Handle subscription expiration on update
  if (update.$set && update.$set['subscription.expiresAt']) {
    const expiresAt = new Date(update.$set['subscription.expiresAt']);
    if (expiresAt < new Date()) {
      update.$set['subscription.isActive'] = false;
    }
  }
  
  next();
});

// ==================== STATIC METHODS (UPDATED) ====================
ConfigSchema.statics.findByCompanyId = async function (companyId) { // CHANGED: tenantId -> companyId
  return this.findOne({
    companyId: mongoose.Types.ObjectId.isValid(companyId) 
      ? new mongoose.Types.ObjectId(companyId) 
      : companyId,
    isActive: true,
  }).populate('companyId updatedBy'); // CHANGED: tenantId -> companyId
};

ConfigSchema.statics.isFeatureEnabled = async function (companyId, featurePath) { // CHANGED: tenantId -> companyId
  const config = await this.findOne(
    { 
      companyId: mongoose.Types.ObjectId.isValid(companyId) 
        ? new mongoose.Types.ObjectId(companyId) 
        : companyId, 
      isActive: true 
    },
    { [featurePath]: 1 }
  ).lean();

  if (!config) return false;

  const pathParts = featurePath.split('.');
  let value = config;
  for (const part of pathParts) {
    value = value?.[part];
    if (value === undefined) return false;
  }

  return Boolean(value);
};

ConfigSchema.statics.getExpiredSubscriptions = async function () {
  return this.find({
    'subscription.isActive': true,
    'subscription.expiresAt': { $lt: new Date() },
  });
};

ConfigSchema.statics.bulkUpdate = async function (companyIds, updates) { // CHANGED: tenantIds -> companyIds
  return this.updateMany(
    { companyId: { $in: companyIds } }, // CHANGED: tenantId -> companyId
    { $set: updates },
    { runValidators: true }
  );
};

ConfigSchema.statics.getConfigWithFeatures = async function (companyId, features = []) { // CHANGED: tenantId -> companyId
  const config = await this.findOne({
    companyId: mongoose.Types.ObjectId.isValid(companyId) 
      ? new mongoose.Types.ObjectId(companyId) 
      : companyId,
    isActive: true,
  }).lean();

  if (!config) return null;

  // Check each requested feature
  const featureStatus = {};
  features.forEach(feature => {
    const pathParts = feature.split('.');
    let value = config;
    for (const part of pathParts) {
      value = value?.[part];
      if (value === undefined) {
        featureStatus[feature] = false;
        return;
      }
    }
    featureStatus[feature] = Boolean(value);
  });

  return {
    config,
    features: featureStatus,
  };
};

// ==================== INSTANCE METHODS ====================
ConfigSchema.methods.isFeatureOn = function (featureName) {
  // Check in features
  if (featureName in this.features) {
    return this.features[featureName];
  }
  // Check in notifications
  if (featureName in this.notifications) {
    return this.notifications[featureName];
  }
  // Check in other sections
  if (featureName === 'ecommerce') return this.ecommerce.enabled;
  if (featureName === 'booking') return this.booking.enabled;
  
  return false;
};

ConfigSchema.methods.updatePlan = async function (planName, expiresAt, updatedBy) {
  this.subscription.planName = planName;
  if (expiresAt) this.subscription.expiresAt = expiresAt;
  this.subscription.isActive = true;
  if (updatedBy) this.updatedBy = updatedBy;

  return this.save();
};

ConfigSchema.methods.getSummary = function () {
  return {
    companyId: this.companyId, // CHANGED: tenantId -> companyId
    isActive: this.isActive,
    subscription: {
      plan: this.subscription.planName,
      isValid: this.isSubscriptionValid,
      expiresAt: this.subscription.expiresAt,
      daysUntilExpiry: this.daysUntilExpiry,
    },
    features: {
      ecommerce: this.ecommerce.enabled,
      booking: this.booking.enabled,
      analytics: this.features.analytics,
      coupons: this.features.coupons,
      referrals: this.features.referrals,
    },
    notifications: {
      email: this.notifications.email,
      sms: this.notifications.sms,
      whatsapp: this.notifications.whatsapp,
    },
    limits: this.limits,
    lastUpdated: this.updatedAt,
  };
};

ConfigSchema.methods.canAddUser = function (currentUserCount) {
  return currentUserCount < this.limits.maxUsers;
};

ConfigSchema.methods.canAddProduct = function (currentProductCount) {
  return currentProductCount < this.limits.maxProducts;
};

ConfigSchema.methods.canAddBooking = function (currentBookingCount) {
  return currentBookingCount < this.limits.maxBookingsPerMonth;
};

// ==================== QUERY HELPERS (UPDATED) ====================
ConfigSchema.query.active = function () {
  return this.where({ isActive: true });
};

ConfigSchema.query.byCompany = function (companyId) { // CHANGED: byTenant -> byCompany
  return this.where({ 
    companyId: mongoose.Types.ObjectId.isValid(companyId) 
      ? new mongoose.Types.ObjectId(companyId) 
      : companyId 
  });
};

ConfigSchema.query.withValidSubscription = function () {
  return this.where({
    'subscription.isActive': true,
    $or: [
      { 'subscription.expiresAt': { $exists: false } },
      { 'subscription.expiresAt': { $gt: new Date() } }
    ]
  });
};

// ==================== MODEL CREATION ====================
const ConfigModel = mongoose.models.Config || mongoose.model('Config', ConfigSchema);

module.exports = ConfigModel;

// ==================== UTILITY FUNCTIONS (UPDATED) ====================
module.exports.ConfigUtils = {
  // Default configuration for new companies (CHANGED: tenants -> companies)
  getDefaultConfig(companyId) { // CHANGED: tenantId -> companyId
    return {
      companyId, // CHANGED: tenantId -> companyId
      isActive: true,
      subscription: {
        planName: 'free',
        isActive: true,
      },
      general: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      },
      ecommerce: {
        enabled: true,
        allowCOD: true,
        taxPercent: 18,
        shippingCharge: 0,
      },
      booking: {
        enabled: true,
        maxBookingsPerDay: 50,
        cancellationHours: 24,
        autoApproval: false,
      },
      notifications: {
        email: true,
        sms: false,
        whatsapp: true,
      },
      features: {
        coupons: false,
        referrals: false,
        analytics: true,
      },
      limits: {
        maxUsers: 5,
        maxProducts: 500,
        maxBookingsPerMonth: 300,
      },
    };
  },

  // Validate configuration updates
  validateUpdates(updates) {
    const errors = [];

    if (updates.ecommerce && updates.ecommerce.taxPercent !== undefined) {
      if (updates.ecommerce.taxPercent < 0 || updates.ecommerce.taxPercent > 100) {
        errors.push('Tax percentage must be between 0 and 100');
      }
    }

    if (updates.limits && updates.limits.maxUsers !== undefined) {
      if (updates.limits.maxUsers < 1) {
        errors.push('Maximum users must be at least 1');
      }
    }

    if (updates.booking && updates.booking.cancellationHours !== undefined) {
      if (updates.booking.cancellationHours < 0) {
        errors.push('Cancellation hours cannot be negative');
      }
    }

    if (updates.general && updates.general.supportEmail) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(updates.general.supportEmail)) {
        errors.push('Please enter a valid email address');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Create configuration for new company (CHANGED: tenant -> company)
  async createForCompany(companyId, userId) { // CHANGED: createForTenant -> createForCompany
    const defaultConfig = this.getDefaultConfig(companyId);
    if (userId) {
      defaultConfig.updatedBy = userId;
    }

    const config = new ConfigModel(defaultConfig);
    return config.save();
  },

  // Check if company can perform action based on limits (CHANGED: tenant -> company)
  async canPerformAction(companyId, action, currentCount) { // CHANGED: tenantId -> companyId
    const config = await ConfigModel.findByCompanyId(companyId); // CHANGED: findByTenantId -> findByCompanyId
    if (!config || !config.isActive) {
      return { allowed: false, reason: 'Configuration not found or inactive' };
    }

    if (!config.isSubscriptionValid) {
      return { allowed: false, reason: 'Subscription expired or inactive' };
    }

    let limit;
    let message;

    switch (action) {
      case 'createUser':
        limit = config.limits.maxUsers;
        message = 'Maximum user limit reached';
        break;
      case 'createProduct':
        limit = config.limits.maxProducts;
        message = 'Maximum product limit reached';
        break;
      case 'createBooking':
        limit = config.limits.maxBookingsPerMonth;
        message = 'Monthly booking limit reached';
        break;
      default:
        return { allowed: false, reason: 'Invalid action' };
    }

    if (currentCount >= limit) {
      return { allowed: false, reason: message };
    }

    return { allowed: true };
  },

  // Get plan limits by plan name
  getPlanLimits(planName) {
    const plans = {
      free: {
        maxUsers: 3,
        maxProducts: 100,
        maxBookingsPerMonth: 100,
        features: {
          coupons: false,
          referrals: false,
          analytics: true,
        }
      },
      basic: {
        maxUsers: 10,
        maxProducts: 1000,
        maxBookingsPerMonth: 500,
        features: {
          coupons: true,
          referrals: false,
          analytics: true,
        }
      },
      pro: {
        maxUsers: 50,
        maxProducts: 5000,
        maxBookingsPerMonth: 2000,
        features: {
          coupons: true,
          referrals: true,
          analytics: true,
        }
      },
      enterprise: {
        maxUsers: 10000,
        maxProducts: 100000,
        maxBookingsPerMonth: 100000,
        features: {
          coupons: true,
          referrals: true,
          analytics: true,
        }
      }
    };

    return plans[planName] || plans.free;
  },

  // Upgrade company to new plan (CHANGED: tenant -> company)
  async upgradePlan(companyId, newPlan, expiresAt, updatedBy) { // CHANGED: tenantId -> companyId
    const config = await ConfigModel.findByCompanyId(companyId); // CHANGED: findByTenantId -> findByCompanyId
    if (!config) {
      throw new Error('Configuration not found');
    }

    const planLimits = this.getPlanLimits(newPlan);
    
    config.subscription.planName = newPlan;
    if (expiresAt) config.subscription.expiresAt = expiresAt;
    config.subscription.isActive = true;
    
    // Update limits based on new plan
    config.limits.maxUsers = planLimits.maxUsers;
    config.limits.maxProducts = planLimits.maxProducts;
    config.limits.maxBookingsPerMonth = planLimits.maxBookingsPerMonth;
    
    // Update features
    config.features.coupons = planLimits.features.coupons;
    config.features.referrals = planLimits.features.referrals;
    
    if (updatedBy) config.updatedBy = updatedBy;

    return config.save();
  },
};
