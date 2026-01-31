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
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
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
    default: 'USD',
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
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
serviceSchema.index({ professionalId: 1, isActive: 1 });
serviceSchema.index({ category: 1, type: 1 });
serviceSchema.index({ basePrice: 1 });
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Service', serviceSchema);