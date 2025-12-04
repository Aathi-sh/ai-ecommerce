// models/PaymentVerification.js
import mongoose from "mongoose";

const PaymentVerificationSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerPhone: {
      type: String,
      required: true,
      index: true
    },
    
    // Order reference
    orderReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    
    // Order details snapshot
    orderDetails: {
      totalAmount: {
        type: Number,
        required: true
      },
      items: [{
        productName: String,
        quantity: Number,
        price: Number,
        productId: mongoose.Schema.Types.ObjectId
      }],
      shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" }
      },
      customerEmail: String
    },
    
    // Payment proof details
    paymentProof: {
      imageData: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      fileName: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
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
        default: 0
      },
      processedAt: {
        type: Date,
        default: Date.now
      },
      analysisTime: Number, // in milliseconds
      wordCount: Number
    },
    
    // Payment details extracted from screenshot
    detectedPayment: {
      amount: {
        type: Number,
        required: true
      },
      upiId: {
        type: String
      },
      transactionTime: {
        type: Date
      },
      transactionId: {
        type: String,
        index: true
      },
      status: {
        type: String,
        enum: ["success", "failed", "pending"],
        default: "success"
      },
      appName: {
        type: String,
        enum: ["gpay", "phonepe", "paytm", "bhim", "other", null],
        default: null
      },
      senderName: String,
      senderUpi: String
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
        default: 0
      },
      validationErrors: [{
        type: String
      }],
      warnings: [{
        type: String
      }]
    },
    
    // Fraud detection
    fraudAnalysis: {
      isSuspicious: {
        type: Boolean,
        default: false
      },
      fraudScore: {
        type: Number,
        default: 0
      },
      reasons: [{
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
        default: 0
      },
      metadata: {
        type: Object
      },
      analysisPerformedAt: {
        type: Date
      },
      tamperingIndicators: [String]
    },
    
    // Verification workflow
    status: {
      type: String,
      enum: ["pending", "processing", "verified", "rejected", "fraud", "manual_review", "requires_additional_proof"],
      default: "pending"
    },
    
    // Timestamps and audit trail
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: String
    },
    rejectedAt: {
      type: Date
    },
    rejectedBy: {
      type: String
    },
    fraudMarkedAt: {
      type: Date
    },
    fraudMarkedBy: {
      type: String
    },
    
    // Reasons and notes
    rejectionReason: {
      type: String
    },
    adminNotes: {
      type: String
    },
    customerNotes: {
      type: String
    },
    
    // Invoice generation
    invoiceGenerated: {
      type: Boolean,
      default: false
    },
    invoiceSentAt: {
      type: Date
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    invoiceData: {
      type: Object
    },
    
    // Retry and follow-up
    verificationAttempts: {
      type: Number,
      default: 0
    },
    lastVerificationAttempt: {
      type: Date
    },
    requiresFollowUp: {
      type: Boolean,
      default: false
    },
    
    // System fields
    createdBy: {
      type: String,
      required: false
    },
    updatedBy: {
      type: String,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true
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
  return Math.abs(this.detectedPayment.amount - this.orderDetails.totalAmount) <= 5;
});

PaymentVerificationSchema.virtual('isRecentPayment').get(function() {
  if (!this.detectedPayment.transactionTime) return false;
  const paymentTime = new Date(this.detectedPayment.transactionTime);
  const now = new Date();
  const hoursDifference = (now - paymentTime) / (1000 * 60 * 60);
  return hoursDifference <= 24; // Payment within 24 hours
});

PaymentVerificationSchema.virtual('verificationDuration').get(function() {
  if (!this.verifiedAt) return null;
  return this.verifiedAt - this.createdAt;
});

// Indexes for better query performance
PaymentVerificationSchema.index({ status: 1, createdAt: -1 });
PaymentVerificationSchema.index({ customerPhone: 1, createdAt: -1 });
PaymentVerificationSchema.index({ "detectedPayment.transactionId": 1 });
PaymentVerificationSchema.index({ orderNumber: 1 });
PaymentVerificationSchema.index({ "fraudAnalysis.isSuspicious": 1 });
PaymentVerificationSchema.index({ invoiceGenerated: 1 });

// Pre-save middleware
PaymentVerificationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    if (this.status === 'verified' && !this.verifiedAt) {
      this.verifiedAt = now;
      this.verifiedBy = this.verifiedBy || 'auto-verification';
    }
    
    if (this.status === 'rejected' && !this.rejectedAt) {
      this.rejectedAt = now;
    }
    
    if (this.status === 'fraud' && !this.fraudMarkedAt) {
      this.fraudMarkedAt = now;
    }
  }

  // Generate invoice number when verified
  if (this.status === 'verified' && !this.invoiceNumber) {
    this.invoiceNumber = `INV-${this.orderNumber}-${Date.now().toString().slice(-6)}`;
  }

  next();
});

// Static methods
PaymentVerificationSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber });
};

PaymentVerificationSchema.statics.findPendingVerifications = function() {
  return this.find({ status: { $in: ['pending', 'processing'] } }).sort({ createdAt: -1 });
};

PaymentVerificationSchema.statics.findByCustomerPhone = function(phone) {
  return this.find({ customerPhone: phone }).sort({ createdAt: -1 });
};

// Instance methods
PaymentVerificationSchema.methods.markAsFraud = function(reasons, markedBy = 'system') {
  this.status = 'fraud';
  this.fraudAnalysis.markedAsFraud = true;
  this.fraudAnalysis.reasons = reasons;
  this.fraudMarkedBy = markedBy;
  this.fraudMarkedAt = new Date();
  return this.save();
};

PaymentVerificationSchema.methods.requeueForVerification = function() {
  this.status = 'pending';
  this.verificationAttempts += 1;
  this.lastVerificationAttempt = new Date();
  return this.save();
};

export default mongoose.models.PaymentVerification || mongoose.model("PaymentVerification", PaymentVerificationSchema);