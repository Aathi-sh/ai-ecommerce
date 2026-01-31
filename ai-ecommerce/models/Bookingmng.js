const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "18:00"
  isAvailable: { type: Boolean, default: true },
  breaks: [{
    startTime: String,
    endTime: String,
    type: { type: String, enum: ['lunch', 'break', 'meeting'], default: 'break' }
  }]
});

const professionalSchema = new mongoose.Schema({
  // Basic Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    trim: true
  },
  
  // Professional Details
  type: {
    type: String,
    enum: ['individual', 'company', 'freelancer', 'agency'],
    default: 'individual'
  },
  category: {
    type: String,
    required: true,
    enum: ['beauty', 'health', 'consulting', 'repair', 'education', 'fitness', 'other']
  },
  specialization: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number, // in years
    default: 0
  },
  
  // Service & Availability
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  workingHours: [workingHoursSchema],
  serviceAreas: [{
    type: String,
    trim: true
  }],
  
  // Contact & Location
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  serviceType: {
    type: String,
    enum: ['onsite', 'remote', 'both', 'mobile'],
    default: 'both'
  },
  
  // Verification & Documents
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  documents: {
    idProof: String,
    qualificationProof: String,
    license: String,
    portfolio: [String]
  },
  
  // Ratings & Stats
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    breakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  
  // WhatsApp Integration
  whatsappBusinessId: String,
  whatsappVerified: {
    type: Boolean,
    default: false
  },
  autoReplyEnabled: {
    type: Boolean,
    default: false
  },
  autoReplyMessage: String,
  
  // Settings
  bookingBuffer: {
    type: Number, // minutes between bookings
    default: 15
  },
  maxDailyBookings: {
    type: Number,
    default: 10
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  lastActive: Date
}, {
  timestamps: true
});

// Indexes
professionalSchema.index({ userId: 1 });
professionalSchema.index({ verificationStatus: 1 });
professionalSchema.index({ category: 1, type: 1 });
professionalSchema.index({ 'address.city': 1, 'address.state': 1 });
professionalSchema.index({ rating: -1 });
professionalSchema.index({ isActive: 1 });

module.exports = mongoose.model('Professional', professionalSchema);