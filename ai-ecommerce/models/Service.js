
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // ===== SAAS MULTI-TENANCY (ADDED) =====
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  
  // ===== AUDIT FIELDS (ADDED) =====
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date,
    index: true
  },
  
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // 🔗 LINK TO BUSINESS/PROFESSIONAL
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookingmng',
    required: true,
    index: true
  },
  
  // Category & Type
  category: {
    type: String,
    enum: ['beauty', 'health', 'consulting', 'repair', 'education', 'fitness', 'other'],
    required: true
  },
  type: {
    type: String,
    enum: ['physical', 'virtual', 'both'],
    default: 'physical'
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Pricing & Duration
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'AED']
  },
  
  // Variations/Addons
  variations: [{
    name: String,
    price: Number,
    duration: Number // additional minutes
  }],
  addons: [{
    name: String,
    price: Number,
    description: String
  }],
  
  // Availability
  isActive: {
    type: Boolean,
    default: true
  },
  bufferTime: {
    type: Number, // minutes before/after
    default: 0
  },
  advanceBooking: {
    type: Number, // days in advance
    default: 30
  },
  
  // Media
  images: [{
    url: String,
    caption: String,
    isPrimary: Boolean
  }],
  videoUrl: String,
  
  // Requirements
  clientRequirements: [{
    type: String,
    trim: true
  }],
  professionalProvides: [{
    type: String,
    trim: true
  }],
  
  // Restrictions
  minAge: Number,
  maxAge: Number,
  genderPreference: {
    type: String,
    enum: ['male', 'female', 'any', 'none'],
    default: 'any'
  },
  
  // Stats
  totalBookings: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [String],
  notes: String
}, {
  timestamps: true  // This automatically adds createdAt and updatedAt
});

// ===== SAAS INDEXES (ADDED) =====
serviceSchema.index({ companyId: 1, name: 1 }, { unique: true }); // Service name unique per company
serviceSchema.index({ companyId: 1, professionalId: 1 });
serviceSchema.index({ companyId: 1, isActive: 1 });
serviceSchema.index({ companyId: 1, category: 1 });
serviceSchema.index({ companyId: 1, basePrice: 1 });

// ===== KEEP YOUR EXISTING INDEXES =====
serviceSchema.index({ professionalId: 1 });
serviceSchema.index({ category: 1, type: 1 });
serviceSchema.index({ basePrice: 1 });
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ professionalId: 1, isActive: 1 });

// ===== BASIC SAAS METHODS (ADDED) =====
serviceSchema.statics.findByCompany = function(companyId) {
  return this.find({ companyId, deletedAt: null });
};

serviceSchema.statics.findByProfessional = function(companyId, professionalId) {
  return this.find({ 
    companyId, 
    professionalId, 
    deletedAt: null 
  });
};

serviceSchema.methods.belongsToCompany = function(companyId) {
  return this.companyId && this.companyId.toString() === companyId.toString();
};

serviceSchema.methods.softDelete = async function(deletedBy) {
  this.deletedAt = new Date();
  this.updatedBy = deletedBy;
  return this.save();
};

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);