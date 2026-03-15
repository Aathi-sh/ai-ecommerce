// models/PaymentVerification.js - PROFESSIONAL 3-OCR MULTI-TENANT MODEL
// Industry standard: Supports PaddleOCR, EasyOCR, QR codes, UPI, phone payments

import mongoose from "mongoose";

const PaymentVerificationSchema = new mongoose.Schema(
  {
    // ===== SAAS MULTI-TENANCY =====
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, "Company ID is required"],
      index: true
    },
    
    // ===== AUDIT FIELDS =====
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    // ===== SOFT DELETE =====
    deletedAt: {
      type: Date,
      index: true,
      default: null
    },
    
    // ===== CORE IDENTIFIERS =====
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
    
    // ===== ORDER REFERENCE =====
    orderReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true
    },
    
    // ===== ORDER DETAILS SNAPSHOT =====
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
        street: String,
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
      orderDate: {
        type: Date,
        default: Date.now
      }
    },
    
    // ===== PAYMENT PROOF =====
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
    
    // ===== PROFESSIONAL 3-OCR ANALYSIS RESULTS =====
    ocrAnalysis: {
      // Core OCR data
      extractedText: {
        type: String,
        required: true
      },
      rawText: {
        type: String
      },
      
      // Overall confidence
      confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      
      // OCR engine info
      primaryEngine: {
        type: String,
        enum: ['paddle', 'easy', 'tesseract', 'qr', 'unknown'],
        default: 'paddle'
      },
      backupEngine: {
        type: String,
        enum: ['paddle', 'easy', 'tesseract', 'none'],
        default: 'none'
      },
      backupUsed: {
        type: Boolean,
        default: false
      },
      
      // Payment type detection
      paymentType: {
        type: String,
        enum: ['qr_code', 'screenshot', 'upi_text', 'phone_number', 'unknown'],
        default: 'screenshot'
      },
      
      // Performance metrics
      processingTime: {
        type: Number,
        min: 0
      },
      wordCount: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Extracted fields with per-field confidence
      extractedAmount: {
        type: Number,
        min: 0
      },
      extractedAmountConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      
      extractedUPI: {
        type: String,
        trim: true
      },
      extractedUPIConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      
      transactionId: {
        type: String,
        trim: true,
        index: true
      },
      transactionIdConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      
      paymentStatus: {
        type: String,
        enum: ['success', 'failed', 'pending', 'unknown'],
        default: 'unknown'
      },
      paymentStatusConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      
      timestamp: {
        type: Date
      },
      timestampConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      
      appName: {
        type: String,
        enum: ['gpay', 'phonepe', 'paytm', 'bhim', 'amazonpay', 'other', null],
        default: null
      },
      appNameConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      
      bankName: {
        type: String,
        trim: true
      },
      bankNameConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      
      // Word-level data for UI highlighting
      words: [{
        text: String,
        confidence: Number,
        bbox: {
          x1: Number,
          y1: Number,
          x2: Number,
          y2: Number
        }
      }],
      
      // OCR metadata
      processedAt: {
        type: Date,
        default: Date.now
      },
      ocrEngine: {
        type: String,
        default: 'paddle'
      },
      ocrVersion: {
        type: String,
        default: '4.0.0'
      }
    },
    
    // ===== DETECTED PAYMENT DETAILS =====
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
      transactionId: {
        type: String,
        trim: true,
        index: true
      },
      transactionTime: {
        type: Date,
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
    
    // ===== PROFESSIONAL VALIDATION RESULTS =====
    validationResults: {
      // Amount validation
      amountMatch: {
        type: Boolean,
        default: false
      },
      expectedAmount: {
        type: Number,
        default: 0
      },
      foundAmount: {
        type: Number,
        default: 0
      },
      amountDifference: {
        type: Number,
        default: 0
      },
      matchQuality: {
        type: String,
        enum: ["exact", "close", "near", "far", "none"],
        default: "none"
      },
      
      // UPI validation
      upiMatch: {
        type: Boolean,
        default: false
      },
      matchedUpiId: {
        type: String,
        trim: true
      },
      upiMatchType: {
        type: String,
        enum: ["exact", "partial", "contains", "none"],
        default: "none"
      },
      
      // Time validation
      timeValid: {
        type: Boolean,
        default: false
      },
      detectedTime: {
        type: Date
      },
      timeDifferenceMinutes: {
        type: Number,
        default: 0
      },
      
      // Success indicators
      successIndicators: {
        type: Boolean,
        default: false
      },
      
      // Overall confidence
      confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      
      // Errors and warnings
      validationErrors: [{
        type: String
      }],
      validationWarnings: [{
        type: String
      }],
      
      // Validation metadata
      validatedAt: {
        type: Date
      },
      validatedBy: {
        type: String
      }
    },
    
    // ===== FRAUD DETECTION =====
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
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low"
      },
      reasons: [{
        type: String
      }],
      flags: [{
        type: String
      }],
      analysisPerformedAt: {
        type: Date
      },
      markedAsFraud: {
        type: Boolean,
        default: false
      },
      markedBy: {
        type: String
      },
      markedAt: {
        type: Date
      }
    },
    
    // ===== VERIFICATION WORKFLOW =====
    status: {
      type: String,
      enum: ["pending", "processing", "verified", "rejected", "fraud", "manual_review"],
      default: "pending",
      index: true
    },
    
    // ===== VERIFICATION METADATA =====
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
      }
    }],
    
    // ===== REJECTION DETAILS =====
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
      enum: ["amount_mismatch", "upi_mismatch", "time_invalid", "duplicate", "fraud", "invalid_screenshot", "other"]
    },
    
    // ===== FRAUD MARKING =====
    fraudMarkedAt: {
      type: Date
    },
    fraudMarkedBy: {
      type: String
    },
    
    // ===== INVOICE GENERATION =====
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
      sparse: true,
      index: true
    },
    invoiceUrl: {
      type: String
    },
    
    // ===== NOTES =====
    adminNotes: {
      type: String
    },
    customerNotes: {
      type: String
    },
    
    // ===== RETRY AND FOLLOW-UP =====
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
    
    // ===== NOTIFICATIONS =====
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
    
    // ===== METADATA =====
    metadata: {
      source: {
        type: String,
        enum: ['whatsapp', 'admin', 'api', 'batch'],
        default: 'whatsapp'
      },
      requestId: String,
      ipAddress: String,
      userAgent: String,
      processingTime: Number,
      companyConfigVersion: Number
    },
    
    // ===== SYSTEM FIELDS =====
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    tags: [{
      type: String,
      index: true
    }],
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 90*24*60*60*1000), // 90 days
      index: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============== COMPREHENSIVE INDEXES ==============

// Multi-tenancy indexes
PaymentVerificationSchema.index({ companyId: 1, verificationId: 1 }, { unique: true });
PaymentVerificationSchema.index({ companyId: 1, orderNumber: 1 });
PaymentVerificationSchema.index({ companyId: 1, customerPhone: 1, createdAt: -1 });
PaymentVerificationSchema.index({ companyId: 1, status: 1, createdAt: -1 });
PaymentVerificationSchema.index({ companyId: 1, 'detectedPayment.transactionId': 1 });
PaymentVerificationSchema.index({ companyId: 1, 'detectedPayment.upiId': 1 });
PaymentVerificationSchema.index({ companyId: 1, 'fraudAnalysis.riskLevel': 1 });
PaymentVerificationSchema.index({ companyId: 1, invoiceGenerated: 1 });
PaymentVerificationSchema.index({ companyId: 1, deletedAt: 1 });

// Performance indexes
PaymentVerificationSchema.index({ createdAt: -1 });
PaymentVerificationSchema.index({ updatedAt: -1 });
PaymentVerificationSchema.index({ verifiedAt: -1 });
PaymentVerificationSchema.index({ rejectedAt: -1 });
PaymentVerificationSchema.index({ status: 1, isActive: 1, createdAt: -1 });

// Search indexes
PaymentVerificationSchema.index({ orderNumber: 1, customerPhone: 1 });
PaymentVerificationSchema.index({ verificationId: 1 }, { unique: true });

// ============== VIRTUAL FIELDS ==============

PaymentVerificationSchema.virtual('companyContext').get(function() {
  return {
    companyId: this.companyId,
    isolated: true
  };
});

PaymentVerificationSchema.virtual('auditInfo').get(function() {
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

PaymentVerificationSchema.virtual('amountMatched').get(function() {
  const expected = this.orderDetails?.totalAmount || 0;
  const detected = this.detectedPayment?.amount || 0;
  return Math.abs(expected - detected) <= 2;
});

PaymentVerificationSchema.virtual('isRecentPayment').get(function() {
  if (!this.detectedPayment?.transactionTime) return false;
  const paymentTime = new Date(this.detectedPayment.transactionTime);
  const now = new Date();
  const minutesDifference = (now - paymentTime) / (1000 * 60);
  return minutesDifference <= 15;
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

PaymentVerificationSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    orderNumber: this.orderNumber,
    customerPhone: this.customerPhone,
    amount: this.orderDetails?.totalAmount,
    detectedAmount: this.detectedPayment?.amount,
    status: this.status,
    confidence: this.ocrAnalysis?.confidenceScore,
    riskLevel: this.fraudAnalysis?.riskLevel,
    engine: this.ocrAnalysis?.primaryEngine,
    matchQuality: this.validationResults?.matchQuality
  };
});

// ============== PRE-SAVE MIDDLEWARE ==============

PaymentVerificationSchema.pre('save', function(next) {
  if (!this.companyId) {
    return next(new Error('Company ID is required for payment verification'));
  }
  
  const now = new Date();
  
  // Status change tracking
  if (this.isModified('status')) {
    if (this.status === 'verified' && !this.verifiedAt) {
      this.verifiedAt = now;
    }
    if (this.status === 'rejected' && !this.rejectedAt) {
      this.rejectedAt = now;
    }
    if (this.status === 'fraud' && !this.fraudMarkedAt) {
      this.fraudMarkedAt = now;
    }
    
    // Add to history
    if (!this.verificationHistory) {
      this.verificationHistory = [];
    }
    this.verificationHistory.push({
      status: this.status,
      changedBy: this.updatedBy || 'system',
      changedAt: now,
      reason: `Status changed to ${this.status}`
    });
  }

  // Auto-calculate risk level
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

  next();
});

// ============== STATIC METHODS ==============

PaymentVerificationSchema.statics.findByCompany = function(companyId) {
  return this.find({ companyId, deletedAt: null });
};

PaymentVerificationSchema.statics.findByOrderNumber = function(companyId, orderNumber) {
  return this.findOne({ companyId, orderNumber, isActive: true, deletedAt: null });
};

PaymentVerificationSchema.statics.findPendingVerifications = function(companyId) {
  return this.find({ 
    companyId,
    status: { $in: ['pending', 'processing'] },
    isActive: true,
    deletedAt: null
  }).sort({ createdAt: -1 });
};

PaymentVerificationSchema.statics.findByCustomerPhone = function(companyId, phone) {
  return this.find({ 
    companyId,
    customerPhone: phone,
    isActive: true,
    deletedAt: null
  }).sort({ createdAt: -1 });
};

PaymentVerificationSchema.statics.findByTransactionId = function(companyId, transactionId) {
  return this.findOne({ 
    companyId,
    'detectedPayment.transactionId': transactionId,
    isActive: true,
    deletedAt: null
  });
};

PaymentVerificationSchema.statics.findByDateRange = function(companyId, startDate, endDate) {
  return this.find({
    companyId,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isActive: true,
    deletedAt: null
  }).sort({ createdAt: -1 });
};

PaymentVerificationSchema.statics.getStatistics = function(companyId, startDate, endDate) {
  const match = { 
    companyId: new mongoose.Types.ObjectId(companyId), 
    deletedAt: null 
  };
  
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
        manualReview: { $sum: { $cond: [{ $eq: ['$status', 'manual_review'] }, 1, 0] } },
        totalAmount: { $sum: '$orderDetails.totalAmount' },
        verifiedAmount: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, '$orderDetails.totalAmount', 0] } },
        avgConfidence: { $avg: '$ocrAnalysis.confidenceScore' },
        avgProcessingTime: { $avg: '$ocrAnalysis.processingTime' }
      }
    }
  ]);
};

PaymentVerificationSchema.statics.getEngineStats = function(companyId) {
  return this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), deletedAt: null } },
    {
      $group: {
        _id: '$ocrAnalysis.primaryEngine',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$ocrAnalysis.confidenceScore' },
        successCount: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] 
          } 
        }
      }
    },
    {
      $project: {
        engine: '$_id',
        count: 1,
        avgConfidence: { $round: ['$avgConfidence', 1] },
        successRate: { 
          $round: [{ $multiply: [{ $divide: ['$successCount', '$count'] }, 100] }, 1] 
        }
      }
    }
  ]);
};

// ============== INSTANCE METHODS ==============

PaymentVerificationSchema.methods.belongsToCompany = function(companyId) {
  return this.companyId && this.companyId.toString() === companyId.toString();
};

PaymentVerificationSchema.methods.softDelete = async function(deletedBy) {
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.isActive = false;
  return this.save();
};

PaymentVerificationSchema.methods.restore = async function() {
  this.deletedAt = null;
  this.deletedBy = null;
  this.isActive = true;
  return this.save();
};

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

PaymentVerificationSchema.methods.updateValidationResults = function(results) {
  this.validationResults = {
    ...this.validationResults,
    ...results,
    validatedAt: new Date()
  };
  return this.save();
};

PaymentVerificationSchema.methods.getOcrSummary = function() {
  return {
    primaryEngine: this.ocrAnalysis?.primaryEngine,
    backupUsed: this.ocrAnalysis?.backupUsed,
    confidence: this.ocrAnalysis?.confidenceScore,
    amount: {
      detected: this.ocrAnalysis?.extractedAmount,
      confidence: this.ocrAnalysis?.extractedAmountConfidence
    },
    upi: {
      detected: this.ocrAnalysis?.extractedUPI,
      confidence: this.ocrAnalysis?.extractedUPIConfidence
    },
    transactionId: {
      detected: this.ocrAnalysis?.transactionId,
      confidence: this.ocrAnalysis?.transactionIdConfidence
    }
  };
};

// ============== JSON TRANSFORM ==============

PaymentVerificationSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

PaymentVerificationSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

// ============== EXPORT ==============

export default mongoose.models.PaymentVerification || mongoose.model("PaymentVerification", PaymentVerificationSchema);