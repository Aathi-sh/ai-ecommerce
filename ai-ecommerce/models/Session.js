// models/Session.js - WhatsApp Session Storage for Multi-Tenant
// Professional implementation using @wwebjs/mongo compatible format

import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    // ===== SESSION IDENTIFIERS =====
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description: 'Unique session identifier (usually company_clientId)'
    },
    
    // ===== MULTI-TENANCY =====
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    
    // ===== SESSION DATA (ENCRYPTED) =====
    sessionData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      description: 'Encrypted WhatsApp session data'
    },
    
    // ===== SESSION METADATA =====
    metadata: {
      clientId: {
        type: String,
        required: true,
        index: true,
        description: 'Client ID used in RemoteAuth (e.g., company_12345)'
      },
      phoneNumber: {
        type: String,
        sparse: true,
        validate: {
          validator: function(v) {
            if (!v) return true;
            const digits = v.replace(/\D/g, '');
            return digits.length >= 10 && digits.length <= 12;
          }
        }
      },
      pushName: String,
      platform: String,
      browser: [String],
      deviceInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      waVersion: String,
      osVersion: String,
      battery: Number,
      plugged: Boolean
    },
    
    // ===== SESSION STATUS =====
    status: {
      type: String,
      enum: ['active', 'expired', 'disconnected', 'destroyed', 'pending'],
      default: 'active',
      index: true
    },
    
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    // ===== TIMESTAMPS =====
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000), // 90 days
      index: true
    },
    
    // ===== BACKUP & SYNC =====
    lastSyncAt: Date,
    backupVersion: {
      type: Number,
      default: 1
    },
    
    // ===== AUTHENTICATION INFO =====
    authInfo: {
      type: {
        type: String,
        enum: ['qr', 'code', 'existing']
      },
      verifiedAt: Date,
      retryCount: {
        type: Number,
        default: 0
      }
    },
    
    // ===== ERROR TRACKING =====
    errors: [{
      message: String,
      timestamp: Date,
      code: String
    }],
    
    // ===== CONNECTION HISTORY =====
    connectionHistory: [{
      status: String,
      timestamp: Date,
      reason: String,
      duration: Number
    }],
    
    // ===== WEBHOOK INFO =====
    webhookUrl: String,
    webhookSecret: String,
    
    // ===== AUDIT FIELDS =====
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // ===== SOFT DELETE =====
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // ===== CUSTOM METADATA =====
    customData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: 'sessions',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============== INDEXES ==============
SessionSchema.index({ sessionId: 1, companyId: 1 }, { unique: true });
SessionSchema.index({ 'metadata.clientId': 1 });
SessionSchema.index({ 'metadata.phoneNumber': 1 });
SessionSchema.index({ status: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
SessionSchema.index({ lastUsedAt: -1 });
SessionSchema.index({ createdAt: -1 });

// ============== VIRTUALS ==============

// Virtual for checking if session is expired
SessionSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for session age
SessionSchema.virtual('age').get(function() {
  return this.createdAt ? Date.now() - this.createdAt : 0;
});

// Virtual for time since last use
SessionSchema.virtual('idleTime').get(function() {
  return this.lastUsedAt ? Date.now() - this.lastUsedAt : 0;
});

// Virtual for formatted metadata
SessionSchema.virtual('formattedMetadata').get(function() {
  return {
    clientId: this.metadata?.clientId,
    phoneNumber: this.metadata?.phoneNumber,
    pushName: this.metadata?.pushName,
    device: this.metadata?.platform || 'Unknown',
    browser: this.metadata?.browser?.join(' ') || 'Unknown',
    waVersion: this.metadata?.waVersion || 'Unknown'
  };
});

// ============== PRE-SAVE MIDDLEWARE ==============
SessionSchema.pre('save', function(next) {
  // Update timestamps
  this.updatedAt = new Date();
  
  // Auto-expire sessions older than 90 days
  if (!this.expiresAt) {
    this.expiresAt = new Date(+new Date() + 90 * 24 * 60 * 60 * 1000);
  }
  
  // Ensure sessionId follows pattern
  if (this.metadata?.clientId && !this.sessionId) {
    this.sessionId = this.metadata.clientId;
  }
  
  next();
});

// ============== PRE-UPDATE MIDDLEWARE ==============
SessionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// ============== STATIC METHODS ==============

/**
 * Find active session by company ID
 */
SessionSchema.statics.findByCompany = function(companyId) {
  return this.findOne({
    companyId,
    status: 'active',
    isActive: true,
    deletedAt: null
  });
};

/**
 * Find session by client ID (used by RemoteAuth)
 */
SessionSchema.statics.findByClientId = function(clientId) {
  return this.findOne({
    'metadata.clientId': clientId,
    status: 'active',
    isActive: true,
    deletedAt: null
  });
};

/**
 * Find session by phone number
 */
SessionSchema.statics.findByPhoneNumber = function(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, '');
  return this.findOne({
    'metadata.phoneNumber': { $regex: digits, $options: 'i' },
    status: 'active',
    isActive: true,
    deletedAt: null
  });
};

/**
 * Get all active sessions
 */
SessionSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    isActive: true,
    deletedAt: null
  }).populate('companyId');
};

/**
 * Get expired sessions for cleanup
 */
SessionSchema.statics.findExpired = function() {
  return this.find({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { status: 'expired' }
    ]
  });
};

/**
 * Create or update session (used by RemoteAuth store)
 */
SessionSchema.statics.upsertSession = async function(sessionId, data) {
  const existing = await this.findOne({ sessionId });
  
  if (existing) {
    existing.sessionData = data;
    existing.updatedAt = new Date();
    existing.lastUsedAt = new Date();
    return existing.save();
  }
  
  return this.create({
    sessionId,
    sessionData: data,
    status: 'active',
    isActive: true
  });
};

/**
 * Delete expired sessions (cleanup job)
 */
SessionSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { status: 'expired' }
    ]
  });
  
  console.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
  return result;
};

// ============== INSTANCE METHODS ==============

/**
 * Mark session as active/used
 */
SessionSchema.methods.markUsed = async function() {
  this.lastUsedAt = new Date();
  this.status = 'active';
  return this.save();
};

/**
 * Mark session as expired
 */
SessionSchema.methods.markExpired = async function(reason = 'Session expired') {
  this.status = 'expired';
  this.isActive = false;
  
  if (!this.connectionHistory) this.connectionHistory = [];
  this.connectionHistory.push({
    status: 'expired',
    timestamp: new Date(),
    reason
  });
  
  return this.save();
};

/**
 * Mark session as disconnected
 */
SessionSchema.methods.markDisconnected = async function(reason = 'Disconnected') {
  this.status = 'disconnected';
  this.isActive = false;
  
  if (!this.connectionHistory) this.connectionHistory = [];
  this.connectionHistory.push({
    status: 'disconnected',
    timestamp: new Date(),
    reason
  });
  
  return this.save();
};

/**
 * Add error to session
 */
SessionSchema.methods.addError = async function(error) {
  if (!this.errors) this.errors = [];
  
  this.errors.push({
    message: error.message || String(error),
    timestamp: new Date(),
    code: error.code
  });
  
  // Keep only last 10 errors
  if (this.errors.length > 10) {
    this.errors = this.errors.slice(-10);
  }
  
  return this.save();
};

/**
 * Update session data
 */
SessionSchema.methods.updateData = async function(newData) {
  this.sessionData = newData;
  this.updatedAt = new Date();
  this.lastUsedAt = new Date();
  return this.save();
};

/**
 * Update metadata
 */
SessionSchema.methods.updateMetadata = async function(metadata) {
  this.metadata = {
    ...this.metadata,
    ...metadata
  };
  return this.save();
};

/**
 * Extend session expiry
 */
SessionSchema.methods.extendExpiry = async function(days = 30) {
  this.expiresAt = new Date(+new Date() + days * 24 * 60 * 60 * 1000);
  return this.save();
};

/**
 * Soft delete session
 */
SessionSchema.methods.softDelete = async function(deletedBy) {
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.isActive = false;
  this.status = 'destroyed';
  return this.save();
};

/**
 * Restore soft deleted session
 */
SessionSchema.methods.restore = async function() {
  this.deletedAt = null;
  this.deletedBy = null;
  this.isActive = true;
  this.status = 'active';
  return this.save();
};

/**
 * Get session summary
 */
SessionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    sessionId: this.sessionId,
    companyId: this.companyId,
    status: this.status,
    isActive: this.isActive,
    metadata: this.formattedMetadata,
    createdAt: this.createdAt,
    lastUsedAt: this.lastUsedAt,
    expiresAt: this.expiresAt,
    isExpired: this.isExpired,
    age: Math.round(this.age / 1000 / 60) + ' minutes',
    idleTime: Math.round(this.idleTime / 1000 / 60) + ' minutes'
  };
};

// ============== JSON TRANSFORM ==============
SessionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    // Remove sensitive session data from JSON output
    delete ret.sessionData;
    
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

SessionSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    // Keep session data in object form (for internal use)
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

// ============== EXPORT ==============
const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
export default Session;