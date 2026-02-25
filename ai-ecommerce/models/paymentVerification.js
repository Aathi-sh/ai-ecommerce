// models/PaymentVerification.js - ENHANCED PROFESSIONAL VERSION
import mongoose from "mongoose";

const PaymentVerificationSchema = new mongoose.Schema(
  {
    // Core identifiers
    verificationId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `PV_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      }
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    customerPhone: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`
      }
    },
    customerName: {
      type: String,
      trim: true,
      default: ''
    },
    
    // Order reference
    orderReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true
    },
    
    // Order details snapshot
    orderDetails: {
      totalAmount: {
        type: Number,
        required: true,
        min: 0
      },
      subtotal: {
        type: Number,
        min: 0,
        default: 0
      },
      totalGst: {
        type: Number,
        min: 0,
        default: 0
      },
      items: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        productName: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        mrp: {
          type: Number,
          min: 0
        },
        gstRate: {
          type: Number,
          default: 18,
          min: 0,
          max: 28
        }
      }],
      shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        country: { 
          type: String, 
          default: "India" 
        },
        landmark: String,
        phoneNumber: String
      },
      customerEmail: {
        type: String,
        lowercase: true,
        trim: true
      },
      pincode: {
        type: String,
        match: /^\d{6}$/
      },
      orderDate: {
        type: Date,
        default: Date.now
      }
    },
    
    // Payment proof details
    paymentProof: {
      imageData: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true,
        enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      },
      fileName: {
        type: String,
        default: 'payment_screenshot.jpg'
      },
      fileSize: {
        type: Number,
        min: 0
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      imageHash: {
        type: String,
        index: true
      },
      imageUrl: {
        type: String
      }
    },
    
    // OCR Analysis Results
    ocrAnalysis: {
      extractedText: {
        type: String,
        required: true
      },
      confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      processedAt: {
        type: Date,
        default: Date.now
      },
      analysisTime: {
        type: Number, // in milliseconds
        min: 0
      },
      wordCount: {
        type: Number,
        default: 0,
        min: 0
      },
      extractedAmount: {
        type: Number,
        min: 0
      },
      extractedUPI: {
        type: String,
        trim: true
      },
      transactionId: {
        type: String,
        trim: true,
        index: true
      },
      extractedTime: {
        type: String
      },
      extractedDate: {
        type: String
      },
      appName: {
        type: String,
        enum: ['gpay', 'phonepe', 'paytm', 'bhim', 'amazonpay', 'other', null],
        default: null
      },
      bankName: {
        type: String,
        trim: true
      },
      rawText: {
        type: String
      },
      ocrEngine: {
        type: String,
        default: 'tesseract.js'
      },
      ocrVersion: {
        type: String,
        default: '4.0.0'
      }
    },
    
    // Payment details extracted from screenshot
    detectedPayment: {
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      upiId: {
        type: String,
        trim: true,
        index: true
      },
      transactionTime: {
        type: Date,
        index: true
      },
      transactionId: {
        type: String,
        trim: true,
        index: true
      },
      status: {
        type: String,
        enum: ["success", "failed", "pending", "unknown"],
        default: "unknown"
      },
      appName: {
        type: String,
        enum: ["gpay", "phonepe", "paytm", "bhim", "amazonpay", "other", null],
        default: null
      },
      bankName: {
        type: String,
        trim: true
      },
      senderName: {
        type: String,
        trim: true
      },
      senderUpi: {
        type: String,
        trim: true
      },
      payeeVPA: {
        type: String,
        trim: true
      },
      reference: {
        type: String,
        trim: true
      },
      remarks: {
        type: String,
        trim: true
      }
    },
    
    // Validation results
    validationResults: {
      amountMatch: {
        type: Boolean,
        default: false
      },
      upiMatch: {
        type: Boolean,
        default: false
      },
      timeValid: {
        type: Boolean,
        default: false
      },
      successIndicators: {
        type: Boolean,
        default: false
      },
      confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      matchQuality: {
        type: String,
        enum: ["exact", "close", "near", "far", "none"],
        default: "none"
      },
      amountDifference: {
        type: Number,
        default: 0
      },
      expectedAmount: {
        type: Number,
        default: 0
      },
      foundAmount: {
        type: Number,
        default: 0
      },
      validationErrors: [{
        type: String
      }],
      validationWarnings: [{
        type: String
      }],
      validatedAt: {
        type: Date
      },
      validatedBy: {
        type: String
      }
    },
    
    // Fraud detection
    fraudAnalysis: {
      isSuspicious: {
        type: Boolean,
        default: false
      },
      fraudScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      reasons: [{
        type: String
      }],
      flags: [{
        type: String
      }],
      markedAsFraud: {
        type: Boolean,
        default: false
      },
      analysisPerformedAt: {
        type: Date
      },
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low"
      },
      markedBy: {
        type: String
      },
      markedAt: {
        type: Date
      }
    },
    
    // Image analysis
    imageAnalysis: {
      isEdited: {
        type: Boolean,
        default: false
      },
      qualityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      metadata: {
        type: Object,
        default: {}
      },
      analysisPerformedAt: {
        type: Date
      },
      tamperingIndicators: [{
        type: String
      }],
      brightness: {
        type: Number
      },
      contrast: {
        type: Number
      },
      sharpness: {
        type: Number
      }
    },
    
    // Verification workflow
    status: {
      type: String,
      enum: ["pending", "processing", "verified", "rejected", "fraud", "manual_review", "requires_additional_proof"],
      default: "pending",
      index: true
    },
    
    // Verification metadata
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: String
    },
    verificationMethod: {
      type: String,
      enum: ["auto_ocr", "admin_manual", "api", "batch"],
      default: "auto_ocr"
    },
    verificationNotes: {
      type: String
    },
    verificationHistory: [{
      status: {
        type: String,
        required: true
      },
      changedBy: {
        type: String,
        required: true
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      reason: {
        type: String
      },
      metadata: {
        type: Object,
        default: {}
      }
    }],
    
    // Rejection details
    rejectedAt: {
      type: Date
    },
    rejectedBy: {
      type: String
    },
    rejectionReason: {
      type: String
    },
    rejectionCategory: {
      type: String,
      enum: ["amount_mismatch", "upi_mismatch", "old_payment", "duplicate", "fraud", "invalid_screenshot", "other"]
    },
    
    // Fraud marking details
    fraudMarkedAt: {
      type: Date
    },
    fraudMarkedBy: {
      type: String
    },
    
    // Invoice generation
    invoiceGenerated: {
      type: Boolean,
      default: false
    },
    invoiceGeneratedAt: {
      type: Date
    },
    invoiceSentAt: {
      type: Date
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    invoiceUrl: {
      type: String
    },
    invoiceData: {
      type: Object,
      default: {}
    },
    
    // Admin notes
    adminNotes: {
      type: String
    },
    customerNotes: {
      type: String
    },
    
    // Retry and follow-up
    verificationAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    lastVerificationAttempt: {
      type: Date
    },
    requiresFollowUp: {
      type: Boolean,
      default: false
    },
    followUpReason: {
      type: String
    },
    followUpDate: {
      type: Date
    },
    
    // Notifications
    notificationsSent: [{
      type: {
        type: String,
        enum: ["email", "whatsapp", "sms", "push"]
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ["sent", "failed", "pending"]
      },
      recipient: String,
      messageId: String
    }],
    
    // System fields
    createdBy: {
      type: String,
      required: false,
      default: 'system'
    },
    updatedBy: {
      type: String,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    tags: [{
      type: String,
      index: true
    }],
    metadata: {
      type: Object,
      default: {}
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30*24*60*60*1000), // 30 days
      index: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual fields
PaymentVerificationSchema.virtual('amountMatched').get(function() {
  const expected = this.orderDetails?.totalAmount || 0;
  const detected = this.detectedPayment?.amount || 0;
  return Math.abs(expected - detected) <= 5;
});

PaymentVerificationSchema.virtual('isRecentPayment').get(function() {
  if (!this.detectedPayment?.transactionTime) return false;
  const paymentTime = new Date(this.detectedPayment.transactionTime);
  const now = new Date();
  const minutesDifference = (now - paymentTime) / (1000 * 60);
  return minutesDifference <= 60; // Payment within 60 minutes
});

PaymentVerificationSchema.virtual('verificationDuration').get(function() {
  if (!this.verifiedAt) return null;
  return this.verifiedAt - this.createdAt;
});

PaymentVerificationSchema.virtual('riskScore').get(function() {
  const fraud = this.fraudAnalysis?.fraudScore || 0;
  const validationConfidence = this.validationResults?.confidenceScore || 0;
  return Math.round((fraud + (100 - validationConfidence)) / 2);
});

// Indexes for better query performance
PaymentVerificationSchema.index({ status: 1, createdAt: -1 });
PaymentVerificationSchema.index({ customerPhone: 1, createdAt: -1 });
PaymentVerificationSchema.index({ orderNumber: 1, createdAt: -1 });
PaymentVerificationSchema.index({ 'detectedPayment.transactionId': 1 });
PaymentVerificationSchema.index({ 'fraudAnalysis.isSuspicious': 1 });
PaymentVerificationSchema.index({ invoiceGenerated: 1 });
PaymentVerificationSchema.index({ tags: 1 });
PaymentVerificationSchema.index({ updatedAt: -1 });
PaymentVerificationSchema.index({ verifiedAt: -1 });
PaymentVerificationSchema.index({ rejectedAt: -1 });

// Compound indexes for common queries
PaymentVerificationSchema.index({ status: 1, isActive: 1, createdAt: -1 });
PaymentVerificationSchema.index({ orderNumber: 1, customerPhone: 1 });
PaymentVerificationSchema.index({ verificationId: 1 }, { unique: true });

// Pre-save middleware
PaymentVerificationSchema.pre('save', function(next) {
  const now = new Date();
  
  // Update timestamps based on status changes
  if (this.isModified('status')) {
    if (this.status === 'verified' && !this.verifiedAt) {
      this.verifiedAt = now;
      this.verifiedBy = this.verifiedBy || 'system';
    }
    
    if (this.status === 'rejected' && !this.rejectedAt) {
      this.rejectedAt = now;
    }
    
    if (this.status === 'fraud' && !this.fraudMarkedAt) {
      this.fraudMarkedAt = now;
      this.fraudMarkedBy = this.fraudMarkedBy || 'system';
    }
    
    // Add to history
    if (!this.verificationHistory) {
      this.verificationHistory = [];
    }
    
    this.verificationHistory.push({
      status: this.status,
      changedBy: this.updatedBy || 'system',
      changedAt: now,
      reason: `Status changed to ${this.status}`,
      metadata: {
        previousStatus: this._previousStatus || this.status
      }
    });
  }

  // Store previous status
  if (this.isModified('status')) {
    this._previousStatus = this.status;
  }

  // Generate invoice number when verified
  if (this.status === 'verified' && !this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.invoiceNumber = `INV-${year}${month}${day}-${this.orderNumber.slice(-6)}-${random}`;
    this.invoiceGenerated = true;
    this.invoiceGeneratedAt = now;
  }

  // Auto-calculate fraud risk level
  if (this.fraudAnalysis && this.fraudAnalysis.fraudScore !== undefined) {
    const score = this.fraudAnalysis.fraudScore;
    if (score >= 75) {
      this.fraudAnalysis.riskLevel = 'critical';
      this.fraudAnalysis.isSuspicious = true;
    } else if (score >= 50) {
      this.fraudAnalysis.riskLevel = 'high';
      this.fraudAnalysis.isSuspicious = true;
    } else if (score >= 25) {
      this.fraudAnalysis.riskLevel = 'medium';
    } else {
      this.fraudAnalysis.riskLevel = 'low';
    }
  }

  // Update expiresAt
  if (this.status === 'verified' || this.status === 'rejected' || this.status === 'fraud') {
    this.expiresAt = new Date(+now + 90*24*60*60*1000); // 90 days for completed verifications
  }

  // Track verification attempts
  if (this.isModified('status') && this.status === 'pending') {
    this.verificationAttempts = (this.verificationAttempts || 0) + 1;
    this.lastVerificationAttempt = now;
  }

  next();
});

// Pre-update middleware
PaymentVerificationSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update) {
    update.updatedAt = new Date();
  }
  next();
});

// Static methods
PaymentVerificationSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber, isActive: true });
};

PaymentVerificationSchema.statics.findPendingVerifications = function() {
  return this.find({ 
    status: { $in: ['pending', 'processing'] },
    isActive: true 
  }).sort({ createdAt: -1 });
};

PaymentVerificationSchema.statics.findByCustomerPhone = function(phone) {
  return this.find({ 
    customerPhone: phone,
    isActive: true 
  }).sort({ createdAt: -1 });
};

PaymentVerificationSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ 
    'detectedPayment.transactionId': transactionId,
    isActive: true 
  });
};

PaymentVerificationSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isActive: true
  }).sort({ createdAt: -1 });
};

PaymentVerificationSchema.statics.getStatistics = function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        verified: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        fraud: { $sum: { $cond: [{ $eq: ['$status', 'fraud'] }, 1, 0] } },
        totalAmount: { $sum: '$orderDetails.totalAmount' },
        verifiedAmount: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, '$orderDetails.totalAmount', 0] } }
      }
    }
  ]);
};

// Instance methods
PaymentVerificationSchema.methods.markAsVerified = function(verifiedBy = 'system', notes = '') {
  this.status = 'verified';
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy;
  this.verificationNotes = notes;
  return this.save();
};

PaymentVerificationSchema.methods.markAsRejected = function(reason, rejectedBy = 'system', category = 'other') {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectedBy = rejectedBy;
  this.rejectionReason = reason;
  this.rejectionCategory = category;
  return this.save();
};

PaymentVerificationSchema.methods.markAsFraud = function(reasons, markedBy = 'system', flags = []) {
  this.status = 'fraud';
  this.fraudAnalysis = {
    ...this.fraudAnalysis,
    markedAsFraud: true,
    reasons: reasons,
    flags: flags,
    markedBy: markedBy,
    markedAt: new Date(),
    isSuspicious: true,
    fraudScore: 100,
    riskLevel: 'critical'
  };
  this.fraudMarkedAt = new Date();
  this.fraudMarkedBy = markedBy;
  return this.save();
};

PaymentVerificationSchema.methods.addAdminNote = function(note, addedBy = 'admin') {
  this.adminNotes = note;
  this.updatedBy = addedBy;
  return this.save();
};

PaymentVerificationSchema.methods.requeueForVerification = function(reason = 'Manual requeue') {
  this.status = 'pending';
  this.verificationAttempts += 1;
  this.lastVerificationAttempt = new Date();
  this.verificationHistory.push({
    status: 'pending',
    changedBy: 'system',
    changedAt: new Date(),
    reason: reason
  });
  return this.save();
};

PaymentVerificationSchema.methods.updateValidationResults = function(results) {
  this.validationResults = {
    ...this.validationResults,
    ...results,
    validatedAt: new Date()
  };
  return this.save();
};

PaymentVerificationSchema.methods.addNotificationRecord = function(notification) {
  if (!this.notificationsSent) {
    this.notificationsSent = [];
  }
  this.notificationsSent.push(notification);
  return this.save();
};

PaymentVerificationSchema.methods.markInvoiceSent = function() {
  this.invoiceSentAt = new Date();
  return this.save();
};

// Ensure virtuals are included in JSON output
PaymentVerificationSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    return ret;
  }
});

PaymentVerificationSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    return ret;
  }
});

// Export model (prevent model overwrite in development)
export default mongoose.models.PaymentVerification || mongoose.model("PaymentVerification", PaymentVerificationSchema);