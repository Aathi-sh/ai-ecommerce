

// // models/Company.js - Core Company Model for Multi-tenancy with WhatsApp Support
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
//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true
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
    
//     // ===== ENHANCED WHATSAPP BUSINESS FIELDS =====
//     whatsapp: {
//       // WhatsApp Business API fields
//       businessId: { type: String, sparse: true },
//       phoneNumberId: { type: String, sparse: true },
//       accessToken: { type: String, select: false },
//       webhookSecret: { type: String, select: false },
      
//       // Connection status
//       isConnected: { type: Boolean, default: false },
//       connectedAt: Date,
//       disconnectedAt: Date,
//       connectionStatus: {
//         type: String,
//         enum: ['pending', 'connecting', 'connected', 'disconnected', 'error'],
//         default: 'pending'
//       },
      
//       // WhatsApp Web.js specific fields
//       sessionId: { 
//         type: String, 
//         sparse: true,
//         index: true 
//       }, // Links to Session model
      
//       qrCode: { type: String }, // Current QR code (temporary)
//       qrGeneratedAt: Date,
//       qrExpiresAt: Date,
      
//       // WhatsApp number information
//       phoneNumber: { 
//         type: String, 
//         sparse: true,
//         validate: {
//           validator: function(v) {
//             if (!v) return true;
//             const digits = v.replace(/\D/g, '');
//             return digits.length >= 10 && digits.length <= 12;
//           }
//         }
//       }, // The WhatsApp number this company uses
      
//       // Session management
//       clientId: { 
//         type: String, 
//         sparse: true,
//         index: true 
//       }, // Unique client ID for RemoteAuth (company_12345)
      
//       lastSyncAt: Date,
//       lastMessageAt: Date,
      
//       // Error tracking
//       lastError: String,
//       errorCount: { type: Number, default: 0 },
      
//       // Reconnection settings
//       reconnectAttempts: { type: Number, default: 0 },
//       maxReconnectAttempts: { type: Number, default: 5 },
      
//       // Session data reference
//       sessionRef: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Session'
//       }, // Reference to the Session document
      
//       // Metadata
//       deviceInfo: {
//         platform: String,
//         browser: String,
//         version: String,
//         userAgent: String
//       },
      
//       // WebSocket tracking
//       activeSocketId: String,
//       lastPingAt: Date
//     },
    
//     // ===== WHATSAPP MESSAGE ROUTING =====
//     whatsappRouting: {
//       // Map incoming messages to company
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
      
//       // Auto-response settings
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
      
//       // Fallback settings
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
      
//       // WhatsApp specific stats
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
// CompanySchema.index({ status: 1, 'subscription.status': 1 });
// CompanySchema.index({ 'subscription.expiryDate': 1 });
// CompanySchema.index({ createdAt: -1 });
// CompanySchema.index({ deletedAt: 1 });

// // ✅ NEW INDEXES FOR WHATSAPP ROUTING
// CompanySchema.index({ 'whatsapp.phoneNumber': 1 }, { sparse: true });
// CompanySchema.index({ 'whatsapp.clientId': 1 }, { unique: true, sparse: true });
// CompanySchema.index({ 'whatsapp.sessionId': 1 }, { sparse: true });
// CompanySchema.index({ 'whatsappRouting.phoneNumbers.number': 1 });

// // ============== VIRTUALS ==============

// // Virtual for checking if subscription is valid
// CompanySchema.virtual('isSubscriptionValid').get(function() {
//   const now = new Date();
//   return (
//     this.subscription.status === 'active' &&
//     (!this.subscription.expiryDate || this.subscription.expiryDate > now)
//   );
// });

// // Virtual for days until expiry
// CompanySchema.virtual('daysUntilExpiry').get(function() {
//   if (!this.subscription.expiryDate) return null;
//   const diffTime = this.subscription.expiryDate - new Date();
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// });

// // Virtual for full address
// CompanySchema.virtual('fullAddress').get(function() {
//   const parts = [];
//   if (this.address?.street) parts.push(this.address.street);
//   if (this.address?.city) parts.push(this.address.city);
//   if (this.address?.state) parts.push(this.address.state);
//   if (this.address?.pincode) parts.push(this.address.pincode);
//   if (this.address?.country) parts.push(this.address.country);
//   return parts.join(', ');
// });

// // Virtual for audit info
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

// // ✅ NEW VIRTUAL: Get primary WhatsApp number
// CompanySchema.virtual('primaryWhatsappNumber').get(function() {
//   const primary = this.whatsappRouting?.phoneNumbers?.find(p => p.isPrimary && p.isActive);
//   return primary?.number || this.whatsapp?.phoneNumber;
// });

// // ✅ NEW VIRTUAL: Check if WhatsApp is connected
// CompanySchema.virtual('isWhatsAppConnected').get(function() {
//   return this.whatsapp?.isConnected === true && 
//          this.whatsapp?.connectionStatus === 'connected';
// });

// // ✅ NEW VIRTUAL: Get WhatsApp status
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
// CompanySchema.pre('save', function(next) {
//   // Auto-update status based on subscription expiry
//   if (this.subscription.expiryDate && this.subscription.expiryDate < new Date()) {
//     this.subscription.status = 'expired';
//   }
  
//   // Ensure company name is trimmed
//   if (this.companyName) {
//     this.companyName = this.companyName.trim();
//   }
  
//   // ✅ Reset daily message count if needed
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
  
//   next();
// });

// // ============== STATIC METHODS ==============

// /**
//  * Get active companies
//  */
// CompanySchema.statics.findActive = function() {
//   return this.find({ 
//     status: 'active', 
//     deletedAt: null 
//   }).sort({ createdAt: -1 });
// };

// /**
//  * Get companies with expiring subscriptions
//  */
// CompanySchema.statics.findExpiringSubscriptions = function(days = 7) {
//   const futureDate = new Date();
//   futureDate.setDate(futureDate.getDate() + days);
  
//   return this.find({
//     'subscription.status': 'active',
//     'subscription.expiryDate': { $lte: futureDate, $gt: new Date() },
//     deletedAt: null
//   });
// };

// /**
//  * Get company by email
//  */
// CompanySchema.statics.findByEmail = function(email) {
//   return this.findOne({ 
//     companyEmail: email.toLowerCase().trim(),
//     deletedAt: null 
//   });
// };

// /**
//  * Get company stats overview
//  */
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

// /**
//  * Create default settings for new company
//  */
// CompanySchema.statics.createWithSettings = async function(companyData, createdBy) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     // Create company
//     const company = await this.create([{
//       ...companyData,
//       createdBy
//     }], { session });
    
//     // Create company settings
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

// /**
//  * ✅ NEW: Find company by WhatsApp phone number
//  */
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

// /**
//  * ✅ NEW: Get all companies with WhatsApp connected
//  */
// CompanySchema.statics.findWithWhatsApp = function() {
//   return this.find({
//     'whatsapp.isConnected': true,
//     status: 'active',
//     deletedAt: null
//   });
// };

// // ============== INSTANCE METHODS ==============

// /**
//  * Check if company can add more users
//  */
// CompanySchema.methods.canAddUser = function(currentUserCount) {
//   return currentUserCount < this.limits.maxUsers;
// };

// /**
//  * Check if company can add more products
//  */
// CompanySchema.methods.canAddProduct = function(currentProductCount) {
//   return currentProductCount < this.limits.maxProducts;
// };

// /**
//  * Update usage statistics
//  */
// CompanySchema.methods.updateStats = async function(type, increment = 1) {
//   if (type === 'user') this.stats.totalUsers += increment;
//   if (type === 'product') this.stats.totalProducts += increment;
//   if (type === 'order') this.stats.totalOrders += increment;
//   if (type === 'booking') this.stats.totalBookings += increment;
  
//   this.stats.lastActive = new Date();
//   return this.save();
// };

// /**
//  * Activate company
//  */
// CompanySchema.methods.activate = async function(activatedBy) {
//   this.status = 'active';
//   this.verifiedBy = activatedBy;
//   this.verifiedAt = new Date();
//   return this.save();
// };

// /**
//  * Suspend company
//  */
// CompanySchema.methods.suspend = async function(reason, suspendedBy) {
//   this.status = 'suspended';
//   this.suspensionReason = reason;
//   this.suspendedAt = new Date();
//   this.suspendedBy = suspendedBy;
//   return this.save();
// };

// /**
//  * Soft delete company
//  */
// CompanySchema.methods.softDelete = async function(deletedBy) {
//   this.deletedAt = new Date();
//   this.deletedBy = deletedBy;
//   this.status = 'inactive';
//   return this.save();
// };

// /**
//  * Restore soft deleted company
//  */
// CompanySchema.methods.restore = async function() {
//   this.deletedAt = null;
//   this.deletedBy = null;
//   this.status = 'active';
//   return this.save();
// };

// /**
//  * Get company settings
//  */
// CompanySchema.methods.getSettings = async function() {
//   const CompanySettings = mongoose.model('CompanySettings');
//   return CompanySettings.findOne({ companyId: this._id });
// };

// /**
//  * Get company summary
//  */
// CompanySchema.methods.getSummary = function() {
//   return {
//     id: this._id,
//     name: this.companyName,
//     email: this.companyEmail,
//     phone: this.companyPhone,
//     address: this.fullAddress,
//     status: this.status,
//     plan: this.subscription.plan,
//     subscriptionValid: this.isSubscriptionValid,
//     daysUntilExpiry: this.daysUntilExpiry,
//     limits: this.limits,
//     features: this.features,
//     stats: this.stats,
//     whatsapp: this.whatsappStatus,
//     createdAt: this.createdAt
//   };
// };

// /**
//  * ✅ NEW: Update WhatsApp connection status
//  */
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

// /**
//  * ✅ NEW: Track WhatsApp message
//  */
// CompanySchema.methods.trackWhatsAppMessage = async function() {
//   if (!this.stats) this.stats = {};
//   if (!this.stats.whatsapp) this.stats.whatsapp = {};
  
//   this.stats.whatsapp.totalMessages = (this.stats.whatsapp.totalMessages || 0) + 1;
//   this.stats.whatsapp.messagesToday = (this.stats.whatsapp.messagesToday || 0) + 1;
//   this.stats.whatsapp.lastMessageAt = new Date();
//   this.whatsapp.lastMessageAt = new Date();
  
//   return this.save();
// };

// /**
//  * ✅ NEW: Add WhatsApp routing number
//  */
// CompanySchema.methods.addWhatsAppNumber = async function(number, isPrimary = false) {
//   if (!this.whatsappRouting) this.whatsappRouting = { phoneNumbers: [] };
//   if (!this.whatsappRouting.phoneNumbers) this.whatsappRouting.phoneNumbers = [];
  
//   const digits = number.replace(/\D/g, '');
  
//   // Check if number already exists
//   const exists = this.whatsappRouting.phoneNumbers.some(
//     p => p.number.replace(/\D/g, '') === digits
//   );
  
//   if (exists) {
//     throw new Error('WhatsApp number already added');
//   }
  
//   if (isPrimary) {
//     // Set all others to not primary
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

// // ✅ NEW: Query helper for companies with WhatsApp
// CompanySchema.query.withWhatsApp = function() {
//   return this.where({
//     'whatsapp.isConnected': true,
//     status: 'active',
//     deletedAt: null
//   });
// };

// // ============== JSON TRANSFORM ==============
// CompanySchema.set('toJSON', {
//   virtuals: true,
//   transform: function(doc, ret) {
//     delete ret.__v;
//     ret.id = ret._id;
    
//     // Remove sensitive data
//     delete ret.whatsapp?.accessToken;
//     delete ret.whatsapp?.webhookSecret;
//     delete ret.whatsapp?.qrCode;
    
//     if (ret.deletedAt) {
//       ret.isDeleted = true;
//     }
    
//     return ret;
//   }
// });

// // ============== EXPORT ==============
// const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
// export default Company;























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