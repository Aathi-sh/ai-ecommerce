// models/Company.js - Core Company Model for Multi-tenancy
import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    // ===== BASIC INFORMATION =====
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      index: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    
    companyEmail: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    
    companyPhone: {
      type: String,
      required: [true, 'Company phone is required'],
      trim: true,
      validate: {
        validator: function(v) {
          const digits = v.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 12;
        },
        message: 'Please enter a valid phone number'
      }
    },
    
    // ===== COMPANY ADDRESS =====
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v) {
            return /^\d{6}$/.test(v);
          },
          message: 'Pincode must be 6 digits'
        }
      },
      country: { type: String, default: 'India' }
    },
    
    // ===== TAX INFORMATION =====
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: 'Please enter a valid GSTIN'
      }
    },
    
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
        },
        message: 'Please enter a valid PAN'
      }
    },
    
    // ===== SUBSCRIPTION & PLAN =====
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free'
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'expired', 'cancelled'],
        default: 'active'
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      expiryDate: {
        type: Date,
        validate: {
          validator: function(v) {
            return !v || v > this.startDate;
          },
          message: 'Expiry date must be after start date'
        }
      },
      autoRenew: {
        type: Boolean,
        default: true
      },
      paymentMethod: {
        type: String,
        enum: ['monthly', 'yearly', 'lifetime'],
        default: 'monthly'
      }
    },
    
    // ===== COMPANY LIMITS (Based on Subscription) =====
    limits: {
      maxUsers: {
        type: Number,
        default: 5,
        min: 1
      },
      maxProducts: {
        type: Number,
        default: 500,
        min: 0
      },
      maxOrdersPerMonth: {
        type: Number,
        default: 1000,
        min: 0
      },
      maxBookingsPerMonth: {
        type: Number,
        default: 300,
        min: 0
      },
      storageLimit: {
        type: Number, // in MB
        default: 1024, // 1GB
        min: 0
      }
    },
    
    // ===== FEATURE ACCESS =====
    features: {
      ecommerce: { type: Boolean, default: true },
      booking: { type: Boolean, default: true },
      whatsappBot: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      coupons: { type: Boolean, default: false },
      referrals: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      multipleUsers: { type: Boolean, default: true },
      customDomain: { type: Boolean, default: false }
    },
    
    // ===== WHATSAPP BUSINESS =====
    whatsapp: {
      businessId: { type: String, sparse: true },
      phoneNumberId: { type: String, sparse: true },
      accessToken: { type: String, select: false },
      webhookSecret: { type: String, select: false },
      isConnected: { type: Boolean, default: false },
      connectedAt: Date,
      qrCode: { type: String }, // For web WhatsApp
      sessionData: { type: Object } // For WhatsApp Web.js
    },
    
    // ===== BRANDING =====
    logo: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return v.startsWith('/uploads/') || v.startsWith('http');
        }
      }
    },
    favicon: String,
    primaryColor: {
      type: String,
      default: '#2c3e50',
      validate: {
        validator: function(v) {
          return /^#[0-9A-F]{6}$/i.test(v);
        }
      }
    },
    
    // ===== STATUS & VERIFICATION =====
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending',
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // ===== SUSPENSION DETAILS =====
    suspensionReason: String,
    suspendedAt: Date,
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // ===== USAGE STATISTICS =====
    stats: {
      totalUsers: { type: Number, default: 0 },
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      lastActive: Date
    },
    
    // ===== SETTINGS REFERENCE =====
    settingsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanySettings'
    },
    
    // ===== AUDIT TRAIL =====
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: Date,
    
    // ===== METADATA =====
    notes: String,
    tags: [String],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============== INDEXES ==============
CompanySchema.index({ companyEmail: 1 });
CompanySchema.index({ companyPhone: 1 });
CompanySchema.index({ status: 1, 'subscription.status': 1 });
CompanySchema.index({ 'subscription.expiryDate': 1 });
CompanySchema.index({ createdAt: -1 });
CompanySchema.index({ deletedAt: 1 });

// ============== VIRTUALS ==============

// Virtual for checking if subscription is valid
CompanySchema.virtual('isSubscriptionValid').get(function() {
  const now = new Date();
  return (
    this.subscription.status === 'active' &&
    (!this.subscription.expiryDate || this.subscription.expiryDate > now)
  );
});

// Virtual for days until expiry
CompanySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.subscription.expiryDate) return null;
  const diffTime = this.subscription.expiryDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for full address
CompanySchema.virtual('fullAddress').get(function() {
  const parts = [];
  if (this.address?.street) parts.push(this.address.street);
  if (this.address?.city) parts.push(this.address.city);
  if (this.address?.state) parts.push(this.address.state);
  if (this.address?.pincode) parts.push(this.address.pincode);
  if (this.address?.country) parts.push(this.address.country);
  return parts.join(', ');
});

// Virtual for audit info
CompanySchema.virtual('auditInfo').get(function() {
  return {
    created: {
      at: this.createdAt,
      by: this.createdBy
    },
    updated: {
      at: this.updatedAt,
      by: this.updatedBy
    },
    deleted: {
      at: this.deletedAt,
      by: this.deletedBy
    }
  };
});

// ============== PRE-SAVE MIDDLEWARE ==============
CompanySchema.pre('save', function(next) {
  // Auto-update status based on subscription expiry
  if (this.subscription.expiryDate && this.subscription.expiryDate < new Date()) {
    this.subscription.status = 'expired';
  }
  
  // Ensure company name is trimmed
  if (this.companyName) {
    this.companyName = this.companyName.trim();
  }
  
  next();
});

// ============== STATIC METHODS ==============

/**
 * Get active companies
 */
CompanySchema.statics.findActive = function() {
  return this.find({ 
    status: 'active', 
    deletedAt: null 
  }).sort({ createdAt: -1 });
};

/**
 * Get companies with expiring subscriptions
 */
CompanySchema.statics.findExpiringSubscriptions = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'subscription.status': 'active',
    'subscription.expiryDate': { $lte: futureDate, $gt: new Date() },
    deletedAt: null
  });
};

/**
 * Get company by email
 */
CompanySchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    companyEmail: email.toLowerCase().trim(),
    deletedAt: null 
  });
};

/**
 * Get company stats overview
 */
CompanySchema.statics.getStats = async function() {
  const total = await this.countDocuments({ deletedAt: null });
  const active = await this.countDocuments({ 
    status: 'active', 
    deletedAt: null 
  });
  const pending = await this.countDocuments({ 
    status: 'pending', 
    deletedAt: null 
  });
  const suspended = await this.countDocuments({ 
    status: 'suspended', 
    deletedAt: null 
  });
  
  const planDistribution = await this.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
  ]);
  
  return {
    total,
    active,
    pending,
    suspended,
    planDistribution
  };
};

/**
 * Create default settings for new company
 */
CompanySchema.statics.createWithSettings = async function(companyData, createdBy) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create company
    const company = await this.create([{
      ...companyData,
      createdBy
    }], { session });
    
    // Create company settings
    const CompanySettings = mongoose.model('CompanySettings');
    await CompanySettings.create([{
      companyId: company[0]._id,
      companyName: companyData.companyName,
      phone: companyData.companyPhone,
      email: companyData.companyEmail,
      address: companyData.address?.street || '',
      city: companyData.address?.city || '',
      createdBy
    }], { session });
    
    await session.commitTransaction();
    return company[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ============== INSTANCE METHODS ==============

/**
 * Check if company can add more users
 */
CompanySchema.methods.canAddUser = function(currentUserCount) {
  return currentUserCount < this.limits.maxUsers;
};

/**
 * Check if company can add more products
 */
CompanySchema.methods.canAddProduct = function(currentProductCount) {
  return currentProductCount < this.limits.maxProducts;
};

/**
 * Update usage statistics
 */
CompanySchema.methods.updateStats = async function(type, increment = 1) {
  if (type === 'user') this.stats.totalUsers += increment;
  if (type === 'product') this.stats.totalProducts += increment;
  if (type === 'order') this.stats.totalOrders += increment;
  if (type === 'booking') this.stats.totalBookings += increment;
  
  this.stats.lastActive = new Date();
  return this.save();
};

/**
 * Activate company
 */
CompanySchema.methods.activate = async function(activatedBy) {
  this.status = 'active';
  this.verifiedBy = activatedBy;
  this.verifiedAt = new Date();
  return this.save();
};

/**
 * Suspend company
 */
CompanySchema.methods.suspend = async function(reason, suspendedBy) {
  this.status = 'suspended';
  this.suspensionReason = reason;
  this.suspendedAt = new Date();
  this.suspendedBy = suspendedBy;
  return this.save();
};

/**
 * Soft delete company
 */
CompanySchema.methods.softDelete = async function(deletedBy) {
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.status = 'inactive';
  return this.save();
};

/**
 * Restore soft deleted company
 */
CompanySchema.methods.restore = async function() {
  this.deletedAt = null;
  this.deletedBy = null;
  this.status = 'active';
  return this.save();
};

/**
 * Get company settings
 */
CompanySchema.methods.getSettings = async function() {
  const CompanySettings = mongoose.model('CompanySettings');
  return CompanySettings.findOne({ companyId: this._id });
};

/**
 * Get company summary
 */
CompanySchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.companyName,
    email: this.companyEmail,
    phone: this.companyPhone,
    address: this.fullAddress,
    status: this.status,
    plan: this.subscription.plan,
    subscriptionValid: this.isSubscriptionValid,
    daysUntilExpiry: this.daysUntilExpiry,
    limits: this.limits,
    features: this.features,
    stats: this.stats,
    createdAt: this.createdAt
  };
};

// ============== QUERY HELPERS ==============
CompanySchema.query.active = function() {
  return this.where({ 
    status: 'active', 
    deletedAt: null 
  });
};

CompanySchema.query.withValidSubscription = function() {
  return this.where({
    'subscription.status': 'active',
    $or: [
      { 'subscription.expiryDate': { $exists: false } },
      { 'subscription.expiryDate': { $gt: new Date() } }
    ],
    deletedAt: null
  });
};

// ============== JSON TRANSFORM ==============
CompanySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    // Remove sensitive data
    delete ret.whatsapp?.accessToken;
    delete ret.whatsapp?.webhookSecret;
    
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

// ============== EXPORT ==============
const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
export default Company;