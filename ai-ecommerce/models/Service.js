const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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
  
  // 🔗 LINK TO BUSINESS/PROFESSIONAL - ADD THIS FIELD
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookingmng',  // References the business/professional
    required: true,      // Every service MUST belong to a business
    index: true          // Index for faster queries
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
    default: 'INR',  // Changed to INR for your use case
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

// Indexes - Added professionalId index
serviceSchema.index({ professionalId: 1 });  // Add this for faster lookups by business
serviceSchema.index({ category: 1, type: 1 });
serviceSchema.index({ basePrice: 1 });
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Compound index for common queries
serviceSchema.index({ professionalId: 1, isActive: 1 });  // Find active services for a business

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);