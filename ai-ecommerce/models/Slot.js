const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // "09:00"
    required: true
  },
  endTime: {
    type: String, // "10:00"
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked', 'break'],
    default: 'available'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  type: {
    type: String,
    enum: ['working_hours', 'break_time', 'custom_availability', 'emergency'],
    default: 'custom_availability'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String, // "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"
  }
}, {
  timestamps: true
});

// Index for fast availability queries
slotSchema.index({ professionalId: 1, date: 1, status: 1 });
slotSchema.index({ professionalId: 1, date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Slot', slotSchema);