


// models/Company.js - Core Company Model for Multi-tenancy with WhatsApp Support
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
    
    // ===== CATALOG & MULTI-TENANT FIELDS =====
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
        },
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      }
    },
    
    // Catalog WhatsApp number (for customer orders)
    catalogWhatsapp: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          const digits = v.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 12;
        },
        message: 'Please enter a valid WhatsApp number'
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
    
    // ===== WHATSAPP BUSINESS FIELDS =====
    whatsapp: {
      businessId: { type: String, sparse: true },
      phoneNumberId: { type: String, sparse: true },
      accessToken: { type: String, select: false },
      webhookSecret: { type: String, select: false },
      isConnected: { type: Boolean, default: false },
      connectedAt: Date,
      disconnectedAt: Date,
      connectionStatus: {
        type: String,
        enum: ['pending', 'connecting', 'connected', 'disconnected', 'error'],
        default: 'pending'
      },
      sessionId: { type: String, sparse: true },
      qrCode: { type: String },
      qrGeneratedAt: Date,
      qrExpiresAt: Date,
      phoneNumber: { type: String, sparse: true },
      clientId: { type: String, sparse: true },
      lastSyncAt: Date,
      lastMessageAt: Date,
      lastError: String,
      errorCount: { type: Number, default: 0 },
      reconnectAttempts: { type: Number, default: 0 },
      maxReconnectAttempts: { type: Number, default: 5 },
      sessionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
      deviceInfo: {
        platform: String,
        browser: String,
        version: String,
        userAgent: String
      },
      activeSocketId: String,
      lastPingAt: Date
    },
    
    // ===== WHATSAPP MESSAGE ROUTING =====
    whatsappRouting: {
      phoneNumbers: [{
        number: { 
          type: String, 
          required: true,
          validate: {
            validator: function(v) {
              const digits = v.replace(/\D/g, '');
              return digits.length >= 10 && digits.length <= 12;
            }
          }
        },
        isPrimary: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        verifiedAt: Date,
        description: String
      }],
      autoResponse: {
        enabled: { type: Boolean, default: false },
        message: String,
        workingHours: {
          enabled: { type: Boolean, default: false },
          timezone: { type: String, default: 'Asia/Kolkata' },
          monday: { start: String, end: String },
          tuesday: { start: String, end: String },
          wednesday: { start: String, end: String },
          thursday: { start: String, end: String },
          friday: { start: String, end: String },
          saturday: { start: String, end: String },
          sunday: { start: String, end: String }
        }
      },
      fallback: {
        enabled: { type: Boolean, default: true },
        message: String
      }
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
      lastActive: Date,
      whatsapp: {
        totalMessages: { type: Number, default: 0 },
        totalConversations: { type: Number, default: 0 },
        totalCustomers: { type: Number, default: 0 },
        lastMessageAt: Date,
        messagesToday: { type: Number, default: 0 },
        lastResetAt: Date
      }
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
CompanySchema.index({ slug: 1 }, { unique: true });
CompanySchema.index({ status: 1, 'subscription.status': 1 });
CompanySchema.index({ 'subscription.expiryDate': 1 });
CompanySchema.index({ createdAt: -1 });
CompanySchema.index({ deletedAt: 1 });
CompanySchema.index({ 'whatsapp.phoneNumber': 1 }, { sparse: true });
CompanySchema.index({ 'whatsapp.clientId': 1 }, { unique: true, sparse: true });
CompanySchema.index({ 'whatsapp.sessionId': 1 }, { sparse: true });
CompanySchema.index({ 'whatsappRouting.phoneNumbers.number': 1 });

// ============== VIRTUALS ==============

CompanySchema.virtual('isSubscriptionValid').get(function() {
  const now = new Date();
  return (
    this.subscription.status === 'active' &&
    (!this.subscription.expiryDate || this.subscription.expiryDate > now)
  );
});

CompanySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.subscription.expiryDate) return null;
  const diffTime = this.subscription.expiryDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

CompanySchema.virtual('fullAddress').get(function() {
  const parts = [];
  if (this.address?.street) parts.push(this.address.street);
  if (this.address?.city) parts.push(this.address.city);
  if (this.address?.state) parts.push(this.address.state);
  if (this.address?.pincode) parts.push(this.address.pincode);
  if (this.address?.country) parts.push(this.address.country);
  return parts.join(', ');
});

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

// ✅ NEW: Virtual for catalog link
CompanySchema.virtual('catalogLink').get(function() {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/catalogue/products?company=${this.slug}`;
});

// ✅ NEW: Virtual for catalog WhatsApp number
CompanySchema.virtual('catalogWhatsappNumber').get(function() {
  return this.catalogWhatsapp || this.whatsapp?.phoneNumber || this.companyPhone;
});

CompanySchema.virtual('primaryWhatsappNumber').get(function() {
  const primary = this.whatsappRouting?.phoneNumbers?.find(p => p.isPrimary && p.isActive);
  return primary?.number || this.whatsapp?.phoneNumber;
});

CompanySchema.virtual('isWhatsAppConnected').get(function() {
  return this.whatsapp?.isConnected === true && 
         this.whatsapp?.connectionStatus === 'connected';
});

CompanySchema.virtual('whatsappStatus').get(function() {
  return {
    connected: this.isWhatsAppConnected,
    phoneNumber: this.primaryWhatsappNumber,
    status: this.whatsapp?.connectionStatus || 'disconnected',
    lastConnected: this.whatsapp?.connectedAt,
    lastMessage: this.whatsapp?.lastMessageAt,
    error: this.whatsapp?.lastError
  };
});

// ============== PRE-SAVE MIDDLEWARE ==============
CompanySchema.pre('save', async function(next) {
  // Auto-update status based on subscription expiry
  if (this.subscription.expiryDate && this.subscription.expiryDate < new Date()) {
    this.subscription.status = 'expired';
  }
  
  // Ensure company name is trimmed
  if (this.companyName) {
    this.companyName = this.companyName.trim();
  }
  
  // ✅ AUTO-GENERATE SLUG FROM COMPANY NAME
  if (!this.slug && this.companyName) {
    let baseSlug = this.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure slug is not empty
    if (!baseSlug || baseSlug.length === 0) {
      baseSlug = `company-${Date.now()}`;
    }
    
    this.slug = baseSlug;
  }
  
  // ✅ MAKE SLUG UNIQUE (if duplicate, append number)
  if (this.slug && this.isModified('slug')) {
    let slugToCheck = this.slug;
    let counter = 1;
    let exists = true;
    
    while (exists) {
      const existing = await this.constructor.findOne({ 
        slug: slugToCheck,
        _id: { $ne: this._id }
      });
      
      if (!existing) {
        exists = false;
      } else {
        slugToCheck = `${this.slug}-${counter}`;
        counter++;
      }
    }
    
    this.slug = slugToCheck;
  }
  
  // Reset daily message count if needed
  if (this.stats?.whatsapp?.lastResetAt) {
    const lastReset = new Date(this.stats.whatsapp.lastResetAt);
    const today = new Date();
    
    if (lastReset.toDateString() !== today.toDateString()) {
      if (!this.stats) this.stats = {};
      if (!this.stats.whatsapp) this.stats.whatsapp = {};
      this.stats.whatsapp.messagesToday = 0;
      this.stats.whatsapp.lastResetAt = today;
    }
  }
  
  next();
});

// ============== STATIC METHODS ==============

CompanySchema.statics.findActive = function() {
  return this.find({ 
    status: 'active', 
    deletedAt: null 
  }).sort({ createdAt: -1 });
};

CompanySchema.statics.findExpiringSubscriptions = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'subscription.status': 'active',
    'subscription.expiryDate': { $lte: futureDate, $gt: new Date() },
    deletedAt: null
  });
};

CompanySchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    companyEmail: email.toLowerCase().trim(),
    deletedAt: null 
  });
};

// ✅ NEW: Find company by slug
CompanySchema.statics.findBySlug = function(slug) {
  return this.findOne({ 
    slug: slug.toLowerCase().trim(),
    status: 'active',
    deletedAt: null 
  });
};

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

CompanySchema.statics.createWithSettings = async function(companyData, createdBy) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const company = await this.create([{
      ...companyData,
      createdBy
    }], { session });
    
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

CompanySchema.statics.findByWhatsAppNumber = async function(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, '');
  
  return this.findOne({
    $or: [
      { 'whatsapp.phoneNumber': { $regex: digits, $options: 'i' } },
      { 'whatsappRouting.phoneNumbers.number': { $regex: digits, $options: 'i' } }
    ],
    status: 'active',
    deletedAt: null
  });
};

CompanySchema.statics.findWithWhatsApp = function() {
  return this.find({
    'whatsapp.isConnected': true,
    status: 'active',
    deletedAt: null
  });
};

// ============== INSTANCE METHODS ==============

CompanySchema.methods.canAddUser = function(currentUserCount) {
  return currentUserCount < this.limits.maxUsers;
};

CompanySchema.methods.canAddProduct = function(currentProductCount) {
  return currentProductCount < this.limits.maxProducts;
};

CompanySchema.methods.updateStats = async function(type, increment = 1) {
  if (type === 'user') this.stats.totalUsers += increment;
  if (type === 'product') this.stats.totalProducts += increment;
  if (type === 'order') this.stats.totalOrders += increment;
  if (type === 'booking') this.stats.totalBookings += increment;
  
  this.stats.lastActive = new Date();
  return this.save();
};

CompanySchema.methods.activate = async function(activatedBy) {
  this.status = 'active';
  this.verifiedBy = activatedBy;
  this.verifiedAt = new Date();
  return this.save();
};

CompanySchema.methods.suspend = async function(reason, suspendedBy) {
  this.status = 'suspended';
  this.suspensionReason = reason;
  this.suspendedAt = new Date();
  this.suspendedBy = suspendedBy;
  return this.save();
};

CompanySchema.methods.softDelete = async function(deletedBy) {
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.status = 'inactive';
  return this.save();
};

CompanySchema.methods.restore = async function() {
  this.deletedAt = null;
  this.deletedBy = null;
  this.status = 'active';
  return this.save();
};

CompanySchema.methods.getSettings = async function() {
  const CompanySettings = mongoose.model('CompanySettings');
  return CompanySettings.findOne({ companyId: this._id });
};

CompanySchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.companyName,
    slug: this.slug,
    email: this.companyEmail,
    phone: this.companyPhone,
    catalogWhatsapp: this.catalogWhatsapp,
    catalogLink: this.catalogLink,
    address: this.fullAddress,
    status: this.status,
    plan: this.subscription.plan,
    subscriptionValid: this.isSubscriptionValid,
    daysUntilExpiry: this.daysUntilExpiry,
    limits: this.limits,
    features: this.features,
    stats: this.stats,
    whatsapp: this.whatsappStatus,
    createdAt: this.createdAt
  };
};

CompanySchema.methods.updateWhatsAppStatus = async function(status, data = {}) {
  this.whatsapp.connectionStatus = status;
  this.whatsapp.isConnected = status === 'connected';
  
  if (status === 'connected') {
    this.whatsapp.connectedAt = new Date();
    this.whatsapp.reconnectAttempts = 0;
    this.whatsapp.errorCount = 0;
    this.whatsapp.lastError = null;
    
    if (data.phoneNumber) {
      this.whatsapp.phoneNumber = data.phoneNumber;
    }
    
    if (data.sessionId) {
      this.whatsapp.sessionId = data.sessionId;
      this.whatsapp.sessionRef = data.sessionRef;
    }
    
    if (data.deviceInfo) {
      this.whatsapp.deviceInfo = data.deviceInfo;
    }
  } else if (status === 'disconnected' || status === 'error') {
    this.whatsapp.disconnectedAt = new Date();
    if (data.error) {
      this.whatsapp.lastError = data.error;
      this.whatsapp.errorCount = (this.whatsapp.errorCount || 0) + 1;
    }
  }
  
  return this.save();
};

CompanySchema.methods.trackWhatsAppMessage = async function() {
  if (!this.stats) this.stats = {};
  if (!this.stats.whatsapp) this.stats.whatsapp = {};
  
  this.stats.whatsapp.totalMessages = (this.stats.whatsapp.totalMessages || 0) + 1;
  this.stats.whatsapp.messagesToday = (this.stats.whatsapp.messagesToday || 0) + 1;
  this.stats.whatsapp.lastMessageAt = new Date();
  this.whatsapp.lastMessageAt = new Date();
  
  return this.save();
};

CompanySchema.methods.addWhatsAppNumber = async function(number, isPrimary = false) {
  if (!this.whatsappRouting) this.whatsappRouting = { phoneNumbers: [] };
  if (!this.whatsappRouting.phoneNumbers) this.whatsappRouting.phoneNumbers = [];
  
  const digits = number.replace(/\D/g, '');
  
  const exists = this.whatsappRouting.phoneNumbers.some(
    p => p.number.replace(/\D/g, '') === digits
  );
  
  if (exists) {
    throw new Error('WhatsApp number already added');
  }
  
  if (isPrimary) {
    this.whatsappRouting.phoneNumbers.forEach(p => p.isPrimary = false);
  }
  
  this.whatsappRouting.phoneNumbers.push({
    number: digits,
    isPrimary,
    isActive: true,
    verifiedAt: new Date()
  });
  
  return this.save();
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

CompanySchema.query.withWhatsApp = function() {
  return this.where({
    'whatsapp.isConnected': true,
    status: 'active',
    deletedAt: null
  });
};

// ============== JSON TRANSFORM ==============
CompanySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    delete ret.whatsapp?.accessToken;
    delete ret.whatsapp?.webhookSecret;
    delete ret.whatsapp?.qrCode;
    
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

// ============== EXPORT ==============
const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
export default Company;




















// // models/Company.js - Core Company Model for Multi-tenancy with WhatsApp Support & Service Type Selection
// import mongoose from 'mongoose';

// const CompanySchema = new mongoose.Schema(
//   {
//     // ===== BASIC INFORMATION =====
//     companyName: {
//       type: String,
//       required: [true, 'Company name is required'],
//       trim: true,
//       unique: true,
//       index: true,
//       maxlength: [100, 'Company name cannot exceed 100 characters']
//     },
    
//     companyEmail: {
//       type: String,
//       required: [true, 'Company email is required'],
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: function(v) {
//           return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//         },
//         message: 'Please enter a valid email address'
//       }
//     },
    
//     companyPhone: {
//       type: String,
//       required: [true, 'Company phone is required'],
//       trim: true,
//       validate: {
//         validator: function(v) {
//           const digits = v.replace(/\D/g, '');
//           return digits.length >= 10 && digits.length <= 12;
//         },
//         message: 'Please enter a valid phone number'
//       }
//     },
    
//     // ===== CATALOG & MULTI-TENANT FIELDS =====
//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: function(v) {
//           return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
//         },
//         message: 'Slug can only contain lowercase letters, numbers, and hyphens'
//       }
//     },
    
//     // Catalog WhatsApp number (for customer orders)
//     catalogWhatsapp: {
//       type: String,
//       trim: true,
//       validate: {
//         validator: function(v) {
//           if (!v) return true;
//           const digits = v.replace(/\D/g, '');
//           return digits.length >= 10 && digits.length <= 12;
//         },
//         message: 'Please enter a valid WhatsApp number'
//       }
//     },
    
//     // ===== COMPANY ADDRESS =====
//     address: {
//       street: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       pincode: { 
//         type: String, 
//         required: true,
//         validate: {
//           validator: function(v) {
//             return /^\d{6}$/.test(v);
//           },
//           message: 'Pincode must be 6 digits'
//         }
//       },
//       country: { type: String, default: 'India' }
//     },
    
//     // ===== TAX INFORMATION =====
//     gstin: {
//       type: String,
//       trim: true,
//       uppercase: true,
//       validate: {
//         validator: function(v) {
//           if (!v) return true;
//           return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
//         },
//         message: 'Please enter a valid GSTIN'
//       }
//     },
    
//     pan: {
//       type: String,
//       trim: true,
//       uppercase: true,
//       validate: {
//         validator: function(v) {
//           if (!v) return true;
//           return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
//         },
//         message: 'Please enter a valid PAN'
//       }
//     },
    
//     // ===== SUBSCRIPTION & PLAN =====
//     subscription: {
//       plan: {
//         type: String,
//         enum: ['free', 'basic', 'pro', 'enterprise'],
//         default: 'free'
//       },
//       status: {
//         type: String,
//         enum: ['active', 'inactive', 'expired', 'cancelled'],
//         default: 'active'
//       },
//       startDate: {
//         type: Date,
//         default: Date.now
//       },
//       expiryDate: {
//         type: Date,
//         validate: {
//           validator: function(v) {
//             return !v || v > this.startDate;
//           },
//           message: 'Expiry date must be after start date'
//         }
//       },
//       autoRenew: {
//         type: Boolean,
//         default: true
//       },
//       paymentMethod: {
//         type: String,
//         enum: ['monthly', 'yearly', 'lifetime'],
//         default: 'monthly'
//       }
//     },
    
//     // ===== COMPANY LIMITS (Based on Subscription) =====
//     limits: {
//       maxUsers: {
//         type: Number,
//         default: 5,
//         min: 1
//       },
//       maxProducts: {
//         type: Number,
//         default: 500,
//         min: 0
//       },
//       maxOrdersPerMonth: {
//         type: Number,
//         default: 1000,
//         min: 0
//       },
//       maxBookingsPerMonth: {
//         type: Number,
//         default: 300,
//         min: 0
//       },
//       storageLimit: {
//         type: Number, // in MB
//         default: 1024, // 1GB
//         min: 0
//       }
//     },
    
//     // ===== FEATURE ACCESS =====
//     features: {
//       ecommerce: { type: Boolean, default: true },
//       booking: { type: Boolean, default: true },
//       whatsappBot: { type: Boolean, default: true },
//       analytics: { type: Boolean, default: true },
//       coupons: { type: Boolean, default: false },
//       referrals: { type: Boolean, default: false },
//       apiAccess: { type: Boolean, default: false },
//       multipleUsers: { type: Boolean, default: true },
//       customDomain: { type: Boolean, default: false }
//     },
    
//     // ===== SERVICE TYPE & MODULE ACCESS CONTROL =====
//     // This determines which business modules this company can access
//     serviceType: {
//       type: String,
//       enum: ['ecommerce', 'booking', 'both'],
//       default: 'both',
//       required: true,
//       index: true,
//       description: 'Primary business type: ecommerce (online store), booking (appointment/service), or both'
//     },
    
//     // Audit trail for service type changes
//     serviceTypeChangedAt: {
//       type: Date,
//       default: null
//     },
//     serviceTypeChangedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       default: null
//     },
    
//     // Track service type change history
//     serviceTypeHistory: [{
//       previousType: {
//         type: String,
//         enum: ['ecommerce', 'booking', 'both']
//       },
//       newType: {
//         type: String,
//         enum: ['ecommerce', 'booking', 'both']
//       },
//       changedAt: {
//         type: Date,
//         default: Date.now
//       },
//       changedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//       },
//       reason: {
//         type: String,
//         trim: true
//       }
//     }],
    
//     // ===== WHATSAPP BUSINESS FIELDS =====
//     whatsapp: {
//       businessId: { type: String, sparse: true },
//       phoneNumberId: { type: String, sparse: true },
//       accessToken: { type: String, select: false },
//       webhookSecret: { type: String, select: false },
//       isConnected: { type: Boolean, default: false },
//       connectedAt: Date,
//       disconnectedAt: Date,
//       connectionStatus: {
//         type: String,
//         enum: ['pending', 'connecting', 'connected', 'disconnected', 'error'],
//         default: 'pending'
//       },
//       sessionId: { type: String, sparse: true },
//       qrCode: { type: String },
//       qrGeneratedAt: Date,
//       qrExpiresAt: Date,
//       phoneNumber: { type: String, sparse: true },
//       clientId: { type: String, sparse: true },
//       lastSyncAt: Date,
//       lastMessageAt: Date,
//       lastError: String,
//       errorCount: { type: Number, default: 0 },
//       reconnectAttempts: { type: Number, default: 0 },
//       maxReconnectAttempts: { type: Number, default: 5 },
//       sessionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
//       deviceInfo: {
//         platform: String,
//         browser: String,
//         version: String,
//         userAgent: String
//       },
//       activeSocketId: String,
//       lastPingAt: Date
//     },
    
//     // ===== WHATSAPP MESSAGE ROUTING =====
//     whatsappRouting: {
//       phoneNumbers: [{
//         number: { 
//           type: String, 
//           required: true,
//           validate: {
//             validator: function(v) {
//               const digits = v.replace(/\D/g, '');
//               return digits.length >= 10 && digits.length <= 12;
//             }
//           }
//         },
//         isPrimary: { type: Boolean, default: false },
//         isActive: { type: Boolean, default: true },
//         verifiedAt: Date,
//         description: String
//       }],
//       autoResponse: {
//         enabled: { type: Boolean, default: false },
//         message: String,
//         workingHours: {
//           enabled: { type: Boolean, default: false },
//           timezone: { type: String, default: 'Asia/Kolkata' },
//           monday: { start: String, end: String },
//           tuesday: { start: String, end: String },
//           wednesday: { start: String, end: String },
//           thursday: { start: String, end: String },
//           friday: { start: String, end: String },
//           saturday: { start: String, end: String },
//           sunday: { start: String, end: String }
//         }
//       },
//       fallback: {
//         enabled: { type: Boolean, default: true },
//         message: String
//       }
//     },
    
//     // ===== BRANDING =====
//     logo: {
//       type: String,
//       validate: {
//         validator: function(v) {
//           if (!v) return true;
//           return v.startsWith('/uploads/') || v.startsWith('http');
//         }
//       }
//     },
//     favicon: String,
//     primaryColor: {
//       type: String,
//       default: '#2c3e50',
//       validate: {
//         validator: function(v) {
//           return /^#[0-9A-F]{6}$/i.test(v);
//         }
//       }
//     },
    
//     // ===== STATUS & VERIFICATION =====
//     status: {
//       type: String,
//       enum: ['active', 'inactive', 'suspended', 'pending'],
//       default: 'pending',
//       index: true
//     },
//     isVerified: {
//       type: Boolean,
//       default: false
//     },
//     verifiedAt: Date,
//     verifiedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
    
//     // ===== SUSPENSION DETAILS =====
//     suspensionReason: String,
//     suspendedAt: Date,
//     suspendedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
    
//     // ===== USAGE STATISTICS =====
//     stats: {
//       totalUsers: { type: Number, default: 0 },
//       totalProducts: { type: Number, default: 0 },
//       totalOrders: { type: Number, default: 0 },
//       totalBookings: { type: Number, default: 0 },
//       totalRevenue: { type: Number, default: 0 },
//       lastActive: Date,
//       whatsapp: {
//         totalMessages: { type: Number, default: 0 },
//         totalConversations: { type: Number, default: 0 },
//         totalCustomers: { type: Number, default: 0 },
//         lastMessageAt: Date,
//         messagesToday: { type: Number, default: 0 },
//         lastResetAt: Date
//       }
//     },
    
//     // ===== SETTINGS REFERENCE =====
//     settingsId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'CompanySettings'
//     },
    
//     // ===== AUDIT TRAIL =====
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     deletedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     deletedAt: Date,
    
//     // ===== METADATA =====
//     notes: String,
//     tags: [String],
//     metadata: {
//       type: Map,
//       of: mongoose.Schema.Types.Mixed,
//       default: {}
//     }
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
//   }
// );

// // ============== INDEXES ==============
// CompanySchema.index({ companyEmail: 1 });
// CompanySchema.index({ companyPhone: 1 });
// CompanySchema.index({ slug: 1 }, { unique: true });
// CompanySchema.index({ status: 1, 'subscription.status': 1 });
// CompanySchema.index({ 'subscription.expiryDate': 1 });
// CompanySchema.index({ createdAt: -1 });
// CompanySchema.index({ deletedAt: 1 });
// CompanySchema.index({ 'whatsapp.phoneNumber': 1 }, { sparse: true });
// CompanySchema.index({ 'whatsapp.clientId': 1 }, { unique: true, sparse: true });
// CompanySchema.index({ 'whatsapp.sessionId': 1 }, { sparse: true });
// CompanySchema.index({ 'whatsappRouting.phoneNumbers.number': 1 });
// CompanySchema.index({ serviceType: 1, status: 1, deletedAt: 1 });
// CompanySchema.index({ 'features.ecommerce': 1, 'features.booking': 1 });

// // ============== VIRTUALS ==============

// CompanySchema.virtual('isSubscriptionValid').get(function() {
//   const now = new Date();
//   return (
//     this.subscription.status === 'active' &&
//     (!this.subscription.expiryDate || this.subscription.expiryDate > now)
//   );
// });

// CompanySchema.virtual('daysUntilExpiry').get(function() {
//   if (!this.subscription.expiryDate) return null;
//   const diffTime = this.subscription.expiryDate - new Date();
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// });

// CompanySchema.virtual('fullAddress').get(function() {
//   const parts = [];
//   if (this.address?.street) parts.push(this.address.street);
//   if (this.address?.city) parts.push(this.address.city);
//   if (this.address?.state) parts.push(this.address.state);
//   if (this.address?.pincode) parts.push(this.address.pincode);
//   if (this.address?.country) parts.push(this.address.country);
//   return parts.join(', ');
// });

// CompanySchema.virtual('auditInfo').get(function() {
//   return {
//     created: {
//       at: this.createdAt,
//       by: this.createdBy
//     },
//     updated: {
//       at: this.updatedAt,
//       by: this.updatedBy
//     },
//     deleted: {
//       at: this.deletedAt,
//       by: this.deletedBy
//     }
//   };
// });

// CompanySchema.virtual('catalogLink').get(function() {
//   return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/catalogue/products?company=${this.slug}`;
// });

// CompanySchema.virtual('catalogWhatsappNumber').get(function() {
//   return this.catalogWhatsapp || this.whatsapp?.phoneNumber || this.companyPhone;
// });

// CompanySchema.virtual('primaryWhatsappNumber').get(function() {
//   const primary = this.whatsappRouting?.phoneNumbers?.find(p => p.isPrimary && p.isActive);
//   return primary?.number || this.whatsapp?.phoneNumber;
// });

// CompanySchema.virtual('isWhatsAppConnected').get(function() {
//   return this.whatsapp?.isConnected === true && 
//          this.whatsapp?.connectionStatus === 'connected';
// });

// CompanySchema.virtual('whatsappStatus').get(function() {
//   return {
//     connected: this.isWhatsAppConnected,
//     phoneNumber: this.primaryWhatsappNumber,
//     status: this.whatsapp?.connectionStatus || 'disconnected',
//     lastConnected: this.whatsapp?.connectedAt,
//     lastMessage: this.whatsapp?.lastMessageAt,
//     error: this.whatsapp?.lastError
//   };
// });

// // ============== PRE-SAVE MIDDLEWARE ==============
// CompanySchema.pre('save', async function(next) {
//   // Auto-update status based on subscription expiry
//   if (this.subscription.expiryDate && this.subscription.expiryDate < new Date()) {
//     this.subscription.status = 'expired';
//   }
  
//   // Ensure company name is trimmed
//   if (this.companyName) {
//     this.companyName = this.companyName.trim();
//   }
  
//   // AUTO-GENERATE SLUG FROM COMPANY NAME
//   if (!this.slug && this.companyName) {
//     let baseSlug = this.companyName
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
    
//     // Ensure slug is not empty
//     if (!baseSlug || baseSlug.length === 0) {
//       baseSlug = `company-${Date.now()}`;
//     }
    
//     this.slug = baseSlug;
//   }
  
//   // MAKE SLUG UNIQUE (if duplicate, append number)
//   if (this.slug && this.isModified('slug')) {
//     let slugToCheck = this.slug;
//     let counter = 1;
//     let exists = true;
    
//     while (exists) {
//       const existing = await this.constructor.findOne({ 
//         slug: slugToCheck,
//         _id: { $ne: this._id }
//       });
      
//       if (!existing) {
//         exists = false;
//       } else {
//         slugToCheck = `${this.slug}-${counter}`;
//         counter++;
//       }
//     }
    
//     this.slug = slugToCheck;
//   }
  
//   // Reset daily message count if needed
//   if (this.stats?.whatsapp?.lastResetAt) {
//     const lastReset = new Date(this.stats.whatsapp.lastResetAt);
//     const today = new Date();
    
//     if (lastReset.toDateString() !== today.toDateString()) {
//       if (!this.stats) this.stats = {};
//       if (!this.stats.whatsapp) this.stats.whatsapp = {};
//       this.stats.whatsapp.messagesToday = 0;
//       this.stats.whatsapp.lastResetAt = today;
//     }
//   }
  
//   // ===== AUTO-CONFIGURE FEATURES BASED ON SERVICE TYPE =====
//   // This ensures features are always in sync with selected service type
//   if (this.isModified('serviceType')) {
//     // Initialize features if not exists
//     if (!this.features) {
//       this.features = {};
//     }
    
//     // Configure features based on service type
//     if (this.serviceType === 'ecommerce') {
//       this.features.ecommerce = true;
//       this.features.booking = false;
//     } else if (this.serviceType === 'booking') {
//       this.features.ecommerce = false;
//       this.features.booking = true;
//     } else if (this.serviceType === 'both') {
//       this.features.ecommerce = true;
//       this.features.booking = true;
//     }
    
//     // Update audit trail
//     this.serviceTypeChangedAt = new Date();
    
//     // Add to history if this is an update (not a new document)
//     if (!this.isNew && this.serviceTypeChangedBy && this.isModified('serviceType')) {
//       if (!this.serviceTypeHistory) {
//         this.serviceTypeHistory = [];
//       }
      
//       // Get previous value from the original document
//       const previousType = this._originalServiceType || this.serviceType;
      
//       this.serviceTypeHistory.push({
//         previousType: previousType,
//         newType: this.serviceType,
//         changedAt: new Date(),
//         changedBy: this.serviceTypeChangedBy,
//         reason: this.serviceTypeChangeReason || 'Service type updated by admin'
//       });
      
//       // Clear temporary fields
//       delete this.serviceTypeChangeReason;
//     }
    
//     // Store original for next comparison
//     this._originalServiceType = this.serviceType;
//   }
  
//   next();
// });

// // ============== STATIC METHODS ==============

// CompanySchema.statics.findActive = function() {
//   return this.find({ 
//     status: 'active', 
//     deletedAt: null 
//   }).sort({ createdAt: -1 });
// };

// CompanySchema.statics.findExpiringSubscriptions = function(days = 7) {
//   const futureDate = new Date();
//   futureDate.setDate(futureDate.getDate() + days);
  
//   return this.find({
//     'subscription.status': 'active',
//     'subscription.expiryDate': { $lte: futureDate, $gt: new Date() },
//     deletedAt: null
//   });
// };

// CompanySchema.statics.findByEmail = function(email) {
//   return this.findOne({ 
//     companyEmail: email.toLowerCase().trim(),
//     deletedAt: null 
//   });
// };

// CompanySchema.statics.findBySlug = function(slug) {
//   return this.findOne({ 
//     slug: slug.toLowerCase().trim(),
//     status: 'active',
//     deletedAt: null 
//   });
// };

// CompanySchema.statics.getStats = async function() {
//   const total = await this.countDocuments({ deletedAt: null });
//   const active = await this.countDocuments({ 
//     status: 'active', 
//     deletedAt: null 
//   });
//   const pending = await this.countDocuments({ 
//     status: 'pending', 
//     deletedAt: null 
//   });
//   const suspended = await this.countDocuments({ 
//     status: 'suspended', 
//     deletedAt: null 
//   });
  
//   const planDistribution = await this.aggregate([
//     { $match: { deletedAt: null } },
//     { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
//   ]);
  
//   return {
//     total,
//     active,
//     pending,
//     suspended,
//     planDistribution
//   };
// };

// CompanySchema.statics.createWithSettings = async function(companyData, createdBy) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     const company = await this.create([{
//       ...companyData,
//       createdBy
//     }], { session });
    
//     const CompanySettings = mongoose.model('CompanySettings');
//     await CompanySettings.create([{
//       companyId: company[0]._id,
//       companyName: companyData.companyName,
//       phone: companyData.companyPhone,
//       email: companyData.companyEmail,
//       address: companyData.address?.street || '',
//       city: companyData.address?.city || '',
//       createdBy
//     }], { session });
    
//     await session.commitTransaction();
//     return company[0];
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

// CompanySchema.statics.findByWhatsAppNumber = async function(phoneNumber) {
//   const digits = phoneNumber.replace(/\D/g, '');
  
//   return this.findOne({
//     $or: [
//       { 'whatsapp.phoneNumber': { $regex: digits, $options: 'i' } },
//       { 'whatsappRouting.phoneNumbers.number': { $regex: digits, $options: 'i' } }
//     ],
//     status: 'active',
//     deletedAt: null
//   });
// };

// CompanySchema.statics.findWithWhatsApp = function() {
//   return this.find({
//     'whatsapp.isConnected': true,
//     status: 'active',
//     deletedAt: null
//   });
// };

// // ===== SERVICE TYPE STATIC METHODS =====
// CompanySchema.statics.findByServiceType = function(serviceType) {
//   return this.find({ 
//     serviceType: serviceType,
//     deletedAt: null,
//     status: 'active'
//   }).sort({ createdAt: -1 });
// };

// CompanySchema.statics.findWithModuleAccess = function(module) {
//   const query = { deletedAt: null, status: 'active' };
  
//   if (module === 'ecommerce') {
//     query.serviceType = { $in: ['ecommerce', 'both'] };
//   } else if (module === 'booking') {
//     query.serviceType = { $in: ['booking', 'both'] };
//   }
  
//   return this.find(query).sort({ createdAt: -1 });
// };

// CompanySchema.statics.getServiceTypeStats = async function() {
//   const stats = await this.aggregate([
//     { $match: { deletedAt: null } },
//     {
//       $group: {
//         _id: '$serviceType',
//         count: { $sum: 1 },
//         companies: { $push: { id: '$_id', name: '$companyName', slug: '$slug' } }
//       }
//     },
//     {
//       $project: {
//         type: '$_id',
//         count: 1,
//         companies: { $slice: ['$companies', 10] },
//         _id: 0
//       }
//     }
//   ]);
  
//   const result = {
//     ecommerce: 0,
//     booking: 0,
//     both: 0,
//     total: 0
//   };
  
//   stats.forEach(stat => {
//     if (stat.type === 'ecommerce') result.ecommerce = stat.count;
//     if (stat.type === 'booking') result.booking = stat.count;
//     if (stat.type === 'both') result.both = stat.count;
//   });
  
//   result.total = result.ecommerce + result.booking + result.both;
  
//   return result;
// };

// // ============== INSTANCE METHODS ==============

// CompanySchema.methods.canAddUser = function(currentUserCount) {
//   return currentUserCount < this.limits.maxUsers;
// };

// CompanySchema.methods.canAddProduct = function(currentProductCount) {
//   return currentProductCount < this.limits.maxProducts;
// };

// CompanySchema.methods.updateStats = async function(type, increment = 1) {
//   if (type === 'user') this.stats.totalUsers += increment;
//   if (type === 'product') this.stats.totalProducts += increment;
//   if (type === 'order') this.stats.totalOrders += increment;
//   if (type === 'booking') this.stats.totalBookings += increment;
  
//   this.stats.lastActive = new Date();
//   return this.save();
// };

// CompanySchema.methods.activate = async function(activatedBy) {
//   this.status = 'active';
//   this.verifiedBy = activatedBy;
//   this.verifiedAt = new Date();
//   return this.save();
// };

// CompanySchema.methods.suspend = async function(reason, suspendedBy) {
//   this.status = 'suspended';
//   this.suspensionReason = reason;
//   this.suspendedAt = new Date();
//   this.suspendedBy = suspendedBy;
//   return this.save();
// };

// CompanySchema.methods.softDelete = async function(deletedBy) {
//   this.deletedAt = new Date();
//   this.deletedBy = deletedBy;
//   this.status = 'inactive';
//   return this.save();
// };

// CompanySchema.methods.restore = async function() {
//   this.deletedAt = null;
//   this.deletedBy = null;
//   this.status = 'active';
//   return this.save();
// };

// CompanySchema.methods.getSettings = async function() {
//   const CompanySettings = mongoose.model('CompanySettings');
//   return CompanySettings.findOne({ companyId: this._id });
// };

// CompanySchema.methods.getSummary = function() {
//   return {
//     id: this._id,
//     name: this.companyName,
//     slug: this.slug,
//     email: this.companyEmail,
//     phone: this.companyPhone,
//     catalogWhatsapp: this.catalogWhatsapp,
//     catalogLink: this.catalogLink,
//     address: this.fullAddress,
//     status: this.status,
//     plan: this.subscription.plan,
//     subscriptionValid: this.isSubscriptionValid,
//     daysUntilExpiry: this.daysUntilExpiry,
//     limits: this.limits,
//     features: this.features,
//     stats: this.stats,
//     whatsapp: this.whatsappStatus,
//     serviceConfig: this.getServiceConfig(),
//     createdAt: this.createdAt
//   };
// };

// CompanySchema.methods.updateWhatsAppStatus = async function(status, data = {}) {
//   this.whatsapp.connectionStatus = status;
//   this.whatsapp.isConnected = status === 'connected';
  
//   if (status === 'connected') {
//     this.whatsapp.connectedAt = new Date();
//     this.whatsapp.reconnectAttempts = 0;
//     this.whatsapp.errorCount = 0;
//     this.whatsapp.lastError = null;
    
//     if (data.phoneNumber) {
//       this.whatsapp.phoneNumber = data.phoneNumber;
//     }
    
//     if (data.sessionId) {
//       this.whatsapp.sessionId = data.sessionId;
//       this.whatsapp.sessionRef = data.sessionRef;
//     }
    
//     if (data.deviceInfo) {
//       this.whatsapp.deviceInfo = data.deviceInfo;
//     }
//   } else if (status === 'disconnected' || status === 'error') {
//     this.whatsapp.disconnectedAt = new Date();
//     if (data.error) {
//       this.whatsapp.lastError = data.error;
//       this.whatsapp.errorCount = (this.whatsapp.errorCount || 0) + 1;
//     }
//   }
  
//   return this.save();
// };

// CompanySchema.methods.trackWhatsAppMessage = async function() {
//   if (!this.stats) this.stats = {};
//   if (!this.stats.whatsapp) this.stats.whatsapp = {};
  
//   this.stats.whatsapp.totalMessages = (this.stats.whatsapp.totalMessages || 0) + 1;
//   this.stats.whatsapp.messagesToday = (this.stats.whatsapp.messagesToday || 0) + 1;
//   this.stats.whatsapp.lastMessageAt = new Date();
//   this.whatsapp.lastMessageAt = new Date();
  
//   return this.save();
// };

// CompanySchema.methods.addWhatsAppNumber = async function(number, isPrimary = false) {
//   if (!this.whatsappRouting) this.whatsappRouting = { phoneNumbers: [] };
//   if (!this.whatsappRouting.phoneNumbers) this.whatsappRouting.phoneNumbers = [];
  
//   const digits = number.replace(/\D/g, '');
  
//   const exists = this.whatsappRouting.phoneNumbers.some(
//     p => p.number.replace(/\D/g, '') === digits
//   );
  
//   if (exists) {
//     throw new Error('WhatsApp number already added');
//   }
  
//   if (isPrimary) {
//     this.whatsappRouting.phoneNumbers.forEach(p => p.isPrimary = false);
//   }
  
//   this.whatsappRouting.phoneNumbers.push({
//     number: digits,
//     isPrimary,
//     isActive: true,
//     verifiedAt: new Date()
//   });
  
//   return this.save();
// };

// // ===== SERVICE TYPE & MODULE ACCESS CONTROL METHODS =====

// CompanySchema.methods.isEcommerceEnabled = function() {
//   return this.serviceType === 'ecommerce' || this.serviceType === 'both';
// };

// CompanySchema.methods.isBookingEnabled = function() {
//   return this.serviceType === 'booking' || this.serviceType === 'both';
// };

// CompanySchema.methods.getEnabledModules = function() {
//   const modules = [];
//   if (this.isEcommerceEnabled()) modules.push('ecommerce');
//   if (this.isBookingEnabled()) modules.push('booking');
//   return modules;
// };

// CompanySchema.methods.canAccessModule = function(moduleName) {
//   if (moduleName === 'ecommerce') return this.isEcommerceEnabled();
//   if (moduleName === 'booking') return this.isBookingEnabled();
//   return true;
// };

// CompanySchema.methods.updateServiceType = async function(newServiceType, changedBy, reason = '') {
//   if (!['ecommerce', 'booking', 'both'].includes(newServiceType)) {
//     throw new Error('Invalid service type. Must be ecommerce, booking, or both');
//   }
  
//   const previousType = this.serviceType;
  
//   this.serviceType = newServiceType;
//   this.serviceTypeChangedBy = changedBy;
//   this.serviceTypeChangedAt = new Date();
  
//   if (!this.serviceTypeHistory) {
//     this.serviceTypeHistory = [];
//   }
  
//   this.serviceTypeHistory.push({
//     previousType: previousType,
//     newType: newServiceType,
//     changedAt: new Date(),
//     changedBy: changedBy,
//     reason: reason || `Service type changed from ${previousType} to ${newServiceType}`
//   });
  
//   if (newServiceType === 'ecommerce') {
//     this.features.ecommerce = true;
//     this.features.booking = false;
//   } else if (newServiceType === 'booking') {
//     this.features.ecommerce = false;
//     this.features.booking = true;
//   } else if (newServiceType === 'both') {
//     this.features.ecommerce = true;
//     this.features.booking = true;
//   }
  
//   return this.save();
// };

// CompanySchema.methods.getServiceConfig = function() {
//   return {
//     type: this.serviceType,
//     isEcommerce: this.isEcommerceEnabled(),
//     isBooking: this.isBookingEnabled(),
//     enabledModules: this.getEnabledModules(),
//     features: {
//       ecommerce: this.features?.ecommerce || false,
//       booking: this.features?.booking || false,
//       whatsappBot: this.features?.whatsappBot || false,
//       analytics: this.features?.analytics || false
//     },
//     lastChanged: {
//       at: this.serviceTypeChangedAt,
//       by: this.serviceTypeChangedBy
//     },
//     historyCount: this.serviceTypeHistory?.length || 0
//   };
// };

// CompanySchema.methods.canPerformOperation = function(operation) {
//   const operationModuleMap = {
//     'createProduct': 'ecommerce',
//     'updateProduct': 'ecommerce',
//     'deleteProduct': 'ecommerce',
//     'manageOrders': 'ecommerce',
//     'processPayment': 'ecommerce',
//     'manageInventory': 'ecommerce',
//     'manageCategories': 'ecommerce',
//     'manageCoupons': 'ecommerce',
//     'createBooking': 'booking',
//     'manageBookings': 'booking',
//     'manageServices': 'booking',
//     'manageAppointments': 'booking',
//     'manageSchedule': 'booking',
//     'manageStaff': 'booking',
//     'manageAvailability': 'booking'
//   };
  
//   const requiredModule = operationModuleMap[operation];
//   if (!requiredModule) return true;
  
//   return this.canAccessModule(requiredModule);
// };

// CompanySchema.methods.getFilteredMenuItems = function(allMenuItems) {
//   if (!allMenuItems || !Array.isArray(allMenuItems)) {
//     return [];
//   }
  
//   return allMenuItems.filter(menuItem => {
//     if (!menuItem.allowedFor) return true;
//     if (menuItem.allowedFor === 'common') return true;
//     if (Array.isArray(menuItem.allowedFor)) {
//       return menuItem.allowedFor.some(type => this.canAccessModule(type));
//     }
//     return this.canAccessModule(menuItem.allowedFor);
//   });
// };

// // ============== QUERY HELPERS ==============
// CompanySchema.query.active = function() {
//   return this.where({ 
//     status: 'active', 
//     deletedAt: null 
//   });
// };

// CompanySchema.query.withValidSubscription = function() {
//   return this.where({
//     'subscription.status': 'active',
//     $or: [
//       { 'subscription.expiryDate': { $exists: false } },
//       { 'subscription.expiryDate': { $gt: new Date() } }
//     ],
//     deletedAt: null
//   });
// };

// CompanySchema.query.withWhatsApp = function() {
//   return this.where({
//     'whatsapp.isConnected': true,
//     status: 'active',
//     deletedAt: null
//   });
// };

// CompanySchema.query.withServiceType = function(serviceType) {
//   return this.where({ serviceType: serviceType });
// };

// // ============== JSON TRANSFORM ==============
// CompanySchema.set('toJSON', {
//   virtuals: true,
//   transform: function(doc, ret) {
//     delete ret.__v;
//     ret.id = ret._id;
    
//     delete ret.whatsapp?.accessToken;
//     delete ret.whatsapp?.webhookSecret;
//     delete ret.whatsapp?.qrCode;
    
//     if (doc.serviceType) {
//       ret.serviceConfig = {
//         type: doc.serviceType,
//         isEcommerce: doc.isEcommerceEnabled ? doc.isEcommerceEnabled() : false,
//         isBooking: doc.isBookingEnabled ? doc.isBookingEnabled() : false,
//         enabledModules: doc.getEnabledModules ? doc.getEnabledModules() : []
//       };
//     }
    
//     if (ret.deletedAt) {
//       ret.isDeleted = true;
//     }
    
//     return ret;
//   }
// });

// // ============== EXPORT ==============
// const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
// export default Company;