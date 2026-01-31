



import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true, // each order has unique number
    },
    createdBy: { type: String, ref: 'User', required: false },
    updatedBy: { type: String, ref: 'User', required: false },
    
    // Customer information
    customerName: {
      type: String,
      required: true,
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
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"],
        },
        price: {
          type: Number,
          required: true, // price at the time of order
          min: 0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    
    // Contact information
    phoneNumber: {
      type: String,
      required: true,
    },
    secondaryPhoneNumber: {
      type: String,
      required: false, // optional field
      default: null,
    },
    
    // Address information
    shippingAddress: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // auto createdAt and updatedAt
);

// Avoid model overwrite in Next.js hot reload
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);