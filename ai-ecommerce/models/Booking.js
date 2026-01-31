const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Identification
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Participants
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  
  // Service Details
  serviceName: String,
  serviceDuration: Number, // in minutes
  servicePrice: Number,
  selectedAddons: [{
    name: String,
    price: Number
  }],
  selectedVariation: {
    name: String,
    price: Number
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // "14:30"
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Location
  locationType: {
    type: String,
    enum: ['professional_address', 'client_address', 'virtual', 'other'],
    default: 'professional_address'
  },
  address: {
    type: String,
    trim: true
  },
  virtualLink: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  
  // Status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'rescheduled',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'refunded',
      'disputed'
    ],
    default: 'pending'
  },
  
  // Payment
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet', 'upi', 'other']
  },
  transactionId: String,
  paidAmount: {
    type: Number,
    default: 0
  },
  
  // Communication
  clientNotes: String,
  professionalNotes: String,
  cancellationReason: String,
  rescheduleReason: String,
  
  // WhatsApp Integration
  bookingSource: {
    type: String,
    enum: ['whatsapp', 'web', 'app', 'admin', 'phone'],
    default: 'whatsapp'
  },
  whatsappSessionId: String,
  whatsappMessageId: String,
  
  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  cancelledAt: Date,
  completedAt: Date,
  reminderSentAt: Date,
  followupSentAt: Date,
  
  // Type
  bookingType: {
    type: String,
    enum: ['instant', 'scheduled', 'recurring'],
    default: 'scheduled'
  },
  recurrence: {
    pattern: String, // daily, weekly, monthly
    endDate: Date
  },
  
  // Rating
  rated: {
    type: Boolean,
    default: false
  },
  ratingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }
}, {
  timestamps: true
});

// Generate booking number
bookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    this.bookingNumber = `BK-${year}${month}-${random}`;
  }
  next();
});

// Indexes
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ clientId: 1, status: 1 });
bookingSchema.index({ professionalId: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1, startTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingSource: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);