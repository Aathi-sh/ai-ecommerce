

// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // ===== COMPANY CONTEXT =====
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, "Company ID is required"],
      index: true,
    },
    
    // ===== AUDIT TRAIL FIELDS - FIXED (removed ref: 'User') =====
    createdBy: { 
      type: String,  // Will store WhatsApp ID
      required: [true, "Created by is required"],
      index: true
    },
    updatedBy: { 
      type: String,  // Will store WhatsApp ID
      index: true
    },
    deletedBy: { 
      type: String,  // Will store WhatsApp ID
      index: true
    },
    
    // ===== SOFT DELETE =====
    deletedAt: {
      type: Date,
      index: true,
    },
    
    // Order identification
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    
    // Customer information
    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    
    // WhatsApp number for communication
    whatsappNumber: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        hsnCode: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"],
        },
        mrp: {
          type: Number,
          required: true,
          min: 0,
        },
        discountPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        gstRate: {
          type: Number,
          required: true,
          default: 18,
          min: 0,
          max: 28,
        },
        gstIncluded: {
          type: Boolean,
          default: true,
        },
        gstAmount: {
          type: Number,
          required: true,
          default: 0,
        },
        totalAmount: {
          type: Number,
          required: true,
        },
        // Track inventory at time of order
        inventorySnapshot: {
          type: Number,
          required: true,
        },
      },
    ],
    
    // Price breakdown
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGst: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "wallet", "cod"],
      required: true,
    },
    transactionId: {
      type: String,
      sparse: true,
      index: true,
    },
    paymentDetails: [ // Track multiple payments
      {
        amount: { type: Number, required: true },
        method: { type: String, enum: ["cash", "card", "upi", "bank_transfer", "wallet"] },
        transactionId: String,
        paidAt: { type: Date, default: Date.now },
        verifiedBy: { type: String }, // ← FIXED: removed ref
        verifiedAt: Date,
        notes: String,
      }
    ],
    
    // Order status (updated by admin - keep as is)
    status: {
      type: String,
      enum: [
        "pending", 
        "confirmed", 
        "processing", 
        "packed", 
        "shipped", 
        "out_for_delivery", 
        "delivered", 
        "cancelled", 
        "returned", 
        "refunded"
      ],
      default: "pending",
      index: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        comment: String,
        updatedBy: { type: String, index: true }, // ← Already fixed
      },
    ],
    
    // Contact information
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    secondaryPhoneNumber: {
      type: String,
      default: null,
    },
    
    // Address information
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
      landmark: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    sameAsShipping: {
      type: Boolean,
      default: true,
    },
    
    // Delivery information
    deliveryDate: Date,
    deliverySlot: String,
    deliveryNotes: String,
    
    // Invoice and tax
    invoiceNumber: {
      type: String,
      sparse: true,
      index: true,
    },
    invoiceGenerated: {
      type: Boolean,
      default: false,
    },
    invoiceGeneratedAt: Date,
    gstType: {
      type: String,
      enum: ["intra-state", "inter-state"],
      required: true,
    },
    placeOfSupply: String,
    
    // WhatsApp bot tracking
    source: {
      type: String,
      enum: ["whatsapp", "admin", "website", "api"],
      default: "whatsapp",
    },
    whatsappSessionId: String,
    conversationId: String,
    
    // Additional fields
    orderNotes: String,
    cancellationReason: String,
    returnReason: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundDetails: {
      refundedAt: Date,
      refundedBy: { type: String }, // ← FIXED: removed ref
      refundMethod: String,
      refundTransactionId: String,
    },
    
    // Tracking
    trackingNumber: String,
    courierName: String,
    estimatedDelivery: Date,
    actualDeliveryDate: Date,
    
    // Flags
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    isWhatsappOrder: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ========== COMPOUND INDEXES FOR COMPANY ISOLATION ==========
OrderSchema.index({ companyId: 1, orderNumber: 1 }, { unique: true, name: 'company_orderNumber_idx' });
OrderSchema.index({ companyId: 1, invoiceNumber: 1 }, { sparse: true, name: 'company_invoiceNumber_idx' });
OrderSchema.index({ companyId: 1, customerName: 1 }, { name: 'company_customerName_idx' });
OrderSchema.index({ companyId: 1, phoneNumber: 1 }, { name: 'company_phoneNumber_idx' });
OrderSchema.index({ companyId: 1, whatsappNumber: 1 }, { sparse: true, name: 'company_whatsapp_idx' });
OrderSchema.index({ companyId: 1, status: 1, paymentStatus: 1 }, { name: 'company_status_payment_idx' });
OrderSchema.index({ companyId: 1, createdAt: -1 }, { name: 'company_createdAt_idx' });
OrderSchema.index({ companyId: 1, source: 1 }, { name: 'company_source_idx' });
OrderSchema.index({ companyId: 1, isUrgent: 1, status: 1 }, { name: 'company_urgent_idx' });
OrderSchema.index({ companyId: 1, deletedAt: 1 }, { sparse: true, name: 'company_deleted_idx' });

// Text index for search
OrderSchema.index({ 
  companyId: 1,
  orderNumber: 'text', 
  customerName: 'text', 
  phoneNumber: 'text',
  'items.productName': 'text'
}, {
  name: 'company_text_search_idx',
  weights: {
    orderNumber: 10,
    customerName: 8,
    phoneNumber: 8,
    'items.productName': 5
  }
});

// ========== VIRTUALS ==========

// Virtual for formatted order number
OrderSchema.virtual('formattedOrderNumber').get(function() {
  if (!this.orderNumber) return '';
  return this.orderNumber;
});

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for unique products count
OrderSchema.virtual('uniqueProductsCount').get(function() {
  return this.items.length;
});

// Virtual for payment completion percentage
OrderSchema.virtual('paymentPercentage').get(function() {
  if (this.totalPrice === 0) return 100;
  return Math.round((this.paidAmount / this.totalPrice) * 100);
});

// Virtual for isOverdue
OrderSchema.virtual('isOverdue').get(function() {
  if (!this.deliveryDate) return false;
  if (this.status === 'delivered' || this.status === 'cancelled') return false;
  return new Date() > this.deliveryDate;
});

// Virtual for audit info
OrderSchema.virtual('auditInfo').get(function() {
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

// Virtual for company context
OrderSchema.virtual('companyContext').get(function() {
  return {
    companyId: this.companyId,
    isolated: true
  };
});

// ========== PRE-SAVE MIDDLEWARE ==========
OrderSchema.pre('save', async function(next) {
  try {
    // Validate companyId exists
    if (!this.companyId) {
      return next(new Error('Company ID is required for order creation'));
    }
    
    // Generate order number if not provided
    if (!this.orderNumber && this.isNew) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      // Check uniqueness within company
      let orderNumber;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        orderNumber = `ORD-${year}${month}${day}-${random}`;
        const existing = await this.constructor.findOne({ 
          companyId: this.companyId,
          orderNumber 
        });
        if (!existing) isUnique = true;
        attempts++;
      }
      
      this.orderNumber = orderNumber || `ORD-${year}${month}${day}-${Date.now().toString().slice(-4)}`;
    }
    
    // Take inventory snapshot for each item
    if (this.isNew) {
      const Product = mongoose.model('Product');
      for (let item of this.items) {
        const product = await Product.findOne({ 
          _id: item.productId,
          companyId: this.companyId 
        }).select('stock');
        
        item.inventorySnapshot = product ? product.stock : 0;
        
        // Update inventory
        if (product && product.trackInventory) {
          await Product.updateOne(
            { _id: item.productId, companyId: this.companyId },
            { $inc: { stock: -item.quantity } }
          );
        }
      }
    }
    
    // Calculate item totals and GST
    this.items.forEach(item => {
      const itemTotal = item.quantity * item.price;
      item.totalAmount = itemTotal;
      
      if (!item.gstIncluded) {
        item.gstAmount = (itemTotal * item.gstRate) / 100;
      } else {
        const basePrice = itemTotal * 100 / (100 + item.gstRate);
        item.gstAmount = itemTotal - basePrice;
      }
    });
    
    // Calculate totals
    this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    this.totalGst = this.items.reduce((sum, item) => sum + item.gstAmount, 0);
    this.totalDiscount = this.items.reduce((sum, item) => sum + (item.quantity * (item.mrp - item.price)), 0);
    this.totalPrice = this.subtotal + this.totalGst + this.shippingCharge;
    this.balanceAmount = this.totalPrice - this.paidAmount;
    
    // Auto-update payment status based on amounts
    if (this.paidAmount >= this.totalPrice) {
      this.paymentStatus = "paid";
    } else if (this.paidAmount > 0 && this.paidAmount < this.totalPrice) {
      this.paymentStatus = "partial";
    }
    
    // Add to status history if status changed
    if (this.isModified('status')) {
      if (!this.statusHistory) this.statusHistory = [];
      
      const lastStatus = this.statusHistory[this.statusHistory.length - 1];
      if (!lastStatus || lastStatus.status !== this.status) {
        this.statusHistory.push({
          status: this.status,
          timestamp: new Date(),
          updatedBy: this.updatedBy || this.createdBy,
          comment: `Status changed to ${this.status}`
        });
      }
    }
    
    // Auto-update isWhatsappOrder based on source
    this.isWhatsappOrder = this.source === 'whatsapp';
    
    next();
  } catch (error) {
    console.error('Error in order pre-save:', error);
    next(error);
  }
});

// ========== POST-SAVE MIDDLEWARE ==========
OrderSchema.post('save', function(doc) {
  console.log(`✅ Order saved: ${doc.orderNumber} for company: ${doc.companyId}`);
});

// ========== STATIC METHODS ==========

// Find orders by company
OrderSchema.statics.findByCompany = function(companyId, filters = {}) {
  const query = { companyId, deletedAt: null, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

// Find order by order number within company
OrderSchema.statics.findByOrderNumber = function(companyId, orderNumber) {
  return this.findOne({ 
    companyId, 
    orderNumber,
    deletedAt: null 
  });
};

// Find orders by customer phone within company
OrderSchema.statics.findByPhone = function(companyId, phoneNumber) {
  return this.find({ 
    companyId, 
    $or: [
      { phoneNumber },
      { whatsappNumber: phoneNumber }
    ],
    deletedAt: null 
  }).sort({ createdAt: -1 });
};

// Get order statistics for a company
OrderSchema.statics.getOrderStats = async function(companyId, period = 'today') {
  const query = { companyId, deletedAt: null };
  
  // Date filtering
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  if (period === 'today') {
    query.createdAt = { $gte: startOfDay };
  } else if (period === 'week') {
    query.createdAt = { $gte: startOfWeek };
  } else if (period === 'month') {
    query.createdAt = { $gte: startOfMonth };
  }
  
  const [
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    whatsappOrders
  ] = await Promise.all([
    this.countDocuments(query),
    this.aggregate([
      { $match: { ...query, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    this.countDocuments({ ...query, status: 'pending' }),
    this.countDocuments({ ...query, status: 'delivered' }),
    this.countDocuments({ ...query, status: 'cancelled' }),
    this.countDocuments({ ...query, source: 'whatsapp' })
  ]);
  
  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    whatsappOrders,
    averageOrderValue: totalOrders ? (totalRevenue[0]?.total || 0) / totalOrders : 0
  };
};

// Get orders by status within company
OrderSchema.statics.findByStatus = function(companyId, status) {
  return this.find({ 
    companyId, 
    status,
    deletedAt: null 
  }).sort({ createdAt: -1 });
};

// Get pending payments
OrderSchema.statics.getPendingPayments = function(companyId) {
  return this.find({ 
    companyId,
    paymentStatus: { $in: ['pending', 'partial'] },
    deletedAt: null 
  }).sort({ balanceAmount: -1 });
};

// Get today's orders
OrderSchema.statics.getTodaysOrders = function(companyId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  return this.find({ 
    companyId,
    createdAt: { $gte: startOfDay },
    deletedAt: null 
  }).sort({ createdAt: -1 });
};

// ========== INSTANCE METHODS ==========

// Check if order belongs to company
OrderSchema.methods.belongsToCompany = function(companyId) {
  return this.companyId && this.companyId.toString() === companyId.toString();
};

// Update payment status with transaction tracking
OrderSchema.methods.addPayment = async function(paymentData, updatedBy) {
  if (!this.paymentDetails) this.paymentDetails = [];
  
  this.paymentDetails.push({
    ...paymentData,
    paidAt: new Date(),
    verifiedBy: updatedBy,
    verifiedAt: new Date()
  });
  
  this.paidAmount += paymentData.amount;
  this.balanceAmount = this.totalPrice - this.paidAmount;
  
  if (this.paidAmount >= this.totalPrice) {
    this.paymentStatus = "paid";
  } else if (this.paidAmount > 0) {
    this.paymentStatus = "partial";
  }
  
  this.updatedBy = updatedBy;
  return this.save();
};

// Update order status with history
OrderSchema.methods.updateStatus = async function(newStatus, updatedBy, comment = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (!this.statusHistory) this.statusHistory = [];
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    comment: comment || `Status changed from ${oldStatus} to ${newStatus}`
  });
  
  this.updatedBy = updatedBy;
  return this.save();
};

// Cancel order
OrderSchema.methods.cancel = async function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  
  // Restore inventory if needed
  if (this.isNew === false) {
    const Product = mongoose.model('Product');
    for (let item of this.items) {
      await Product.updateOne(
        { _id: item.productId, companyId: this.companyId },
        { $inc: { stock: item.quantity } }
      );
    }
  }
  
  return this.updateStatus('cancelled', cancelledBy, `Cancelled: ${reason}`);
};

// Mark as delivered
OrderSchema.methods.markDelivered = async function(deliveredBy) {
  this.status = 'delivered';
  this.actualDeliveryDate = new Date();
  return this.updateStatus('delivered', deliveredBy, 'Order delivered successfully');
};

// Generate invoice number
OrderSchema.methods.generateInvoiceNumber = async function() {
  if (this.invoiceNumber) return this.invoiceNumber;
  
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Find the last invoice number for this company
  const lastOrder = await this.constructor.findOne({
    companyId: this.companyId,
    invoiceNumber: { $regex: `^INV-${year}${month}` }
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (lastOrder && lastOrder.invoiceNumber) {
    const lastSeq = parseInt(lastOrder.invoiceNumber.split('-').pop());
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }
  
  this.invoiceNumber = `INV-${year}${month}-${sequence.toString().padStart(4, '0')}`;
  this.invoiceGenerated = true;
  this.invoiceGeneratedAt = new Date();
  
  return this.invoiceNumber;
};

// Soft delete
OrderSchema.methods.softDelete = async function(deletedBy) {
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.isActive = false;
  return this.save();
};

// Restore soft deleted order
OrderSchema.methods.restore = async function() {
  this.deletedAt = null;
  this.deletedBy = null;
  this.isActive = true;
  return this.save();
};

// Get order summary
OrderSchema.methods.getSummary = function() {
  return {
    id: this._id,
    orderNumber: this.orderNumber,
    customerName: this.customerName,
    phoneNumber: this.phoneNumber,
    totalAmount: this.totalPrice,
    paidAmount: this.paidAmount,
    balanceAmount: this.balanceAmount,
    status: this.status,
    paymentStatus: this.paymentStatus,
    itemCount: this.totalItems,
    createdAt: this.createdAt,
    source: this.source
  };
};

// ========== JSON TRANSFORM ==========
OrderSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    // Add computed fields
    ret.totalItems = doc.totalItems;
    ret.uniqueProductsCount = doc.uniqueProductsCount;
    ret.paymentPercentage = doc.paymentPercentage;
    ret.isOverdue = doc.isOverdue;
    
    // Don't return deleted orders in normal queries
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

OrderSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    ret.totalItems = doc.totalItems;
    ret.uniqueProductsCount = doc.uniqueProductsCount;
    ret.paymentPercentage = doc.paymentPercentage;
    
    if (ret.deletedAt) {
      ret.isDeleted = true;
    }
    
    return ret;
  }
});

// ========== EXPORT ==========
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);