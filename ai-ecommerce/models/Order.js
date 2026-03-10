import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
       // Added index for faster queries
    },
    createdBy: { type: String, ref: 'User', required: false },
    updatedBy: { type: String, ref: 'User', required: false },
    
    // Customer information
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
        sku: { // Added SKU for inventory tracking
          type: String,
          required: true,
        },
        hsnCode: { // HSN code for tax purposes
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"],
        },
        mrp: { // Maximum Retail Price
          type: Number,
          required: true,
          min: 0,
        },
        discountPrice: { // Price after discount
          type: Number,
          required: true,
          min: 0,
        },
        price: { // Final selling price (after discount)
          type: Number,
          required: true,
          min: 0,
        },
        gstRate: { // GST percentage
          type: Number,
          required: true,
          default: 18, // Default 18% GST
          min: 0,
          max: 28,
        },
        gstIncluded: { // Whether price includes GST
          type: Boolean,
          default: true,
        },
        gstAmount: { // Calculated GST amount
          type: Number,
          required: true,
          default: 0,
        },
        totalAmount: { // quantity * price
          type: Number,
          required: true,
        },
      },
    ],
    
    // Price breakdown
    subtotal: { // Total before tax and discounts
      type: Number,
      required: true,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGst: { // Total GST amount
      type: Number,
      required: true,
      default: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: { // Final amount after all calculations
      type: Number,
      required: true,
      min: 0,
    },
    
    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed", "refunded"],
      default: "pending",
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    whatsappNumber: {
        type: String,
        trim: true,
        required: false, // Not required for manual admin orders
        sparse: true, 
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
    },
    
    // Order status
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
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        comment: String,
        updatedBy: { type: String, ref: 'User' },
      },
    ],
    
    // Contact information
    phoneNumber: {
      type: String,
      required: true,
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
    billingAddress: { // Separate billing address if different
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    sameAsShipping: { // If billing address same as shipping
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
      unique: true,
      sparse: true,
    },
    invoiceGenerated: {
      type: Boolean,
      default: false,
    },
    gstType: { // Type of GST (CGST+SGST for intra-state, IGST for inter-state)
      type: String,
      enum: ["intra-state", "inter-state"],
      required: true,
    },
    
    // Additional fields
    orderNotes: String,
    cancellationReason: String,
    returnReason: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
    
    // Tracking
    trackingNumber: String,
    courierName: String,
    estimatedDelivery: Date,
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate amounts
OrderSchema.pre('save', function(next) {
  // Calculate item totals and GST
  this.items.forEach(item => {
    const itemTotal = item.quantity * item.price;
    item.totalAmount = itemTotal;
    
    if (!item.gstIncluded) {
      // Calculate GST on base price
      item.gstAmount = (itemTotal * item.gstRate) / 100;
    } else {
      // Back-calculate GST from inclusive price
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
  
  next();
});

// Indexes for better query performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerName: 1 });
OrderSchema.index({ phoneNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);