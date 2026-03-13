// import mongoose from "mongoose";

// /**
//  * Counter Model - Manages auto-incrementing sequences
//  * Used for generating custom product IDs starting from 100
//  */
// const CounterSchema = new mongoose.Schema(
//   {
//     // Unique identifier for the counter (e.g., 'productId', 'orderId')
//     name: {
//       type: String,
//       required: [true, "Counter name is required"],
//       unique: true,
//       trim: true,
//       index: true,
//     },

//     // Current sequence value
//     seq: {
//       type: Number,
//       required: true,
//       default: 100, // Start from 100 as requested
//       min: [1, "Sequence must be at least 1"],
//     },

//     // Zero padding length (e.g., 5 for 00123)
//     padding: {
//       type: Number,
//       default: 5,
//       min: 1,
//       max: 10,
//     },

//     // Description of what this counter is for
//     description: {
//       type: String,
//       default: "Product ID counter",
//       trim: true,
//     },

//     // Reset history for audit trail
//     resetHistory: [
//       {
//         resetBy: {
//           type: String,
//           required: true,
//         },
//         resetAt: {
//           type: Date,
//           default: Date.now,
//         },
//         oldValue: {
//           type: Number,
//           required: true,
//         },
//         newValue: {
//           type: Number,
//           required: true,
//         },
//         reason: {
//           type: String,
//           required: true,
//         },
//         ipAddress: String,
//         userAgent: String,
//       },
//     ],

//     // Metadata
//     createdBy: {
//       type: String,
//       ref: "User",
//     },
//     updatedBy: {
//       type: String,
//       ref: "User",
//     },

//     // System fields
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // Virtual for formatted current ID (e.g., 00123)
// CounterSchema.virtual("formattedCurrentId").get(function () {
//   return String(this.seq).padStart(this.padding, "0");
// });

// // Virtual for next ID (current + 1)
// CounterSchema.virtual("nextId").get(function () {
//   return this.seq + 1;
// });

// // Virtual for formatted next ID
// CounterSchema.virtual("formattedNextId").get(function () {
//   const next = this.seq + 1;
//   return String(next).padStart(this.padding, "0");
// });

// // Static method to get or create counter
// CounterSchema.statics.getCounter = async function (name, startFrom = 100) {
//   let counter = await this.findOne({ name });
  
//   if (!counter) {
//     counter = await this.create({
//       name,
//       seq: startFrom,
//       padding: 5,
//     });
//     console.log(`✅ Counter created: ${name} starting from ${startFrom}`);
//   }
  
//   return counter;
// };

// // ✅ FIXED: Static method to get next sequence value - ATOMIC OPERATION ONLY
// CounterSchema.statics.getNextSequence = async function (name) {
//   try {
//     const counter = await this.findOneAndUpdate(
//       { name },
//       { $inc: { seq: 1 } },
//       { 
//         new: true, 
//         upsert: true,
//         setDefaultsOnInsert: { name, seq: 100, padding: 5 }
//       }
//     );
//     return counter.seq;
//   } catch (error) {
//     console.error(`❌ Error in getNextSequence for ${name}:`, error);
//     throw error;
//   }
// };

// // ✅ NEW: Safe increment method
// CounterSchema.statics.incrementCounter = async function (name) {
//   try {
//     console.log(`🔢 Incrementing counter: ${name}`);
    
//     const counter = await this.findOneAndUpdate(
//       { name },
//       { $inc: { seq: 1 } },
//       { 
//         new: true, 
//         upsert: true,
//         setDefaultsOnInsert: { name, seq: 100, padding: 5 }
//       }
//     );
    
//     console.log(`✅ Counter ${name} incremented to: ${counter.seq}`);
//     return counter.seq;
//   } catch (error) {
//     console.error(`❌ Error incrementing counter ${name}:`, error);
//     // Fallback to timestamp
//     const timestamp = parseInt(Date.now().toString().slice(-6));
//     return timestamp;
//   }
// };

// // Static method to reset counter
// CounterSchema.statics.resetCounter = async function (name, newValue, resetData) {
//   const { resetBy, reason, ipAddress, userAgent } = resetData;
  
//   const counter = await this.findOne({ name });
  
//   if (!counter) {
//     throw new Error(`Counter ${name} not found`);
//   }

//   const oldValue = counter.seq;

//   // Update counter
//   counter.seq = newValue;
//   counter.updatedBy = resetBy;

//   // Add to reset history
//   counter.resetHistory.push({
//     resetBy,
//     resetAt: new Date(),
//     oldValue,
//     newValue,
//     reason,
//     ipAddress,
//     userAgent,
//   });

//   await counter.save();

//   console.log(`🔄 Counter ${name} reset: ${oldValue} → ${newValue} by ${resetBy}`);

//   return {
//     counter,
//     oldValue,
//     newValue,
//     resetBy,
//     reason,
//   };
// };

// // Static method to get reset history
// CounterSchema.statics.getResetHistory = async function (name, limit = 10) {
//   const counter = await this.findOne({ name });
  
//   if (!counter) {
//     return [];
//   }

//   return counter.resetHistory
//     .sort((a, b) => b.resetAt - a.resetAt)
//     .slice(0, limit);
// };

// // Instance method to add reset record
// CounterSchema.methods.addResetRecord = function (resetData) {
//   this.resetHistory.push({
//     ...resetData,
//     resetAt: new Date(),
//   });
//   return this.save();
// };

// // Indexes for better performance
// CounterSchema.index({ name: 1 });
// CounterSchema.index({ "resetHistory.resetAt": -1 });

// // Pre-save middleware
// CounterSchema.pre("save", function (next) {
//   // Ensure seq is never less than 1
//   if (this.seq < 1) {
//     this.seq = 1;
//   }
//   next();
// });

// // Initialize default counter if not exists
// CounterSchema.statics.initializeDefaultCounters = async function () {
//   try {
//     const counters = [
//       { name: "productId", seq: 100, padding: 5, description: "Product ID counter" },
//       { name: "orderId", seq: 1000, padding: 5, description: "Order ID counter" },
//       { name: "invoiceId", seq: 500, padding: 5, description: "Invoice ID counter" },
//     ];

//     for (const counter of counters) {
//       await this.findOneAndUpdate(
//         { name: counter.name },
//         { 
//           $setOnInsert: {
//             name: counter.name,
//             seq: counter.seq,
//             padding: counter.padding,
//             description: counter.description,
//             isActive: true
//           }
//         },
//         { upsert: true }
//       );
//     }
//     console.log("✅ Default counters initialized");
//   } catch (error) {
//     console.error("❌ Error initializing counters:", error);
//   }
// };

// // Export model (prevent model overwrite in development)
// const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

// // Initialize default counters when model is first used
// if (process.env.NODE_ENV !== "test") {
//   Counter.initializeDefaultCounters().catch(console.error);
// }

// export default Counter;







// above code is without saas








import mongoose from "mongoose";

/**
 * Counter Model - Manages auto-incrementing sequences per company
 * Used for generating custom product IDs starting from 100 for each company
 */
const CounterSchema = new mongoose.Schema(
  {
    // ===== SAAS MULTI-TENANCY =====
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true, // Always required for company-specific counters
      index: true,
    },

    // Unique identifier for the counter (e.g., 'productId')
    name: {
      type: String,
      required: [true, "Counter name is required"],
      trim: true,
      index: true,
    },

    // Current sequence value
    seq: {
      type: Number,
      required: true,
      default: 100,
      min: [1, "Sequence must be at least 1"],
    },

    // Zero padding length (e.g., 5 for 00123)
    padding: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },

    // Description of what this counter is for
    description: {
      type: String,
      default: "Product ID counter",
      trim: true,
    },

    // ===== AUDIT FIELDS =====
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// ===== COMPOUND INDEX FOR COMPANY ISOLATION =====
CounterSchema.index({ companyId: 1, name: 1 }, { 
  unique: true,
  name: 'company_counter_unique_idx' 
});

// ===== VIRTUALS =====
CounterSchema.virtual("formattedCurrentId").get(function () {
  return String(this.seq).padStart(this.padding, "0");
});

CounterSchema.virtual("nextId").get(function () {
  return this.seq + 1;
});

CounterSchema.virtual("formattedNextId").get(function () {
  const next = this.seq + 1;
  return String(next).padStart(this.padding, "0");
});

// ===== STATIC METHODS =====

/**
 * Get next sequence value for a company - ATOMIC OPERATION
 * This is the ONLY method you need for product creation
 */
CounterSchema.statics.incrementCounter = async function (name, companyId) {
  console.log('🔢 Getting next sequence for:', { name, companyId });
  
  try {
    const counter = await this.findOneAndUpdate(
      { name, companyId },
      { $inc: { seq: 1 } },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: { 
          name, 
          companyId,
          seq: 100,
          padding: 5,
          description: `${name} counter for company ${companyId}`
        }
      }
    );
    
    console.log('✅ Next sequence:', counter.seq);
    return counter.seq;
    
  } catch (error) {
    console.error('❌ Counter error:', error);
    throw error; // Let the calling function handle the error
  }
};

/**
 * Get current counter value without incrementing
 */
CounterSchema.statics.getCurrentCounter = async function (name, companyId) {
  const counter = await this.findOne({ name, companyId });
  return counter ? counter.seq : 100;
};

/**
 * Reset counter for a company (admin only)
 */
CounterSchema.statics.resetCounter = async function (name, companyId, newValue, resetBy) {
  const counter = await this.findOneAndUpdate(
    { name, companyId },
    { 
      $set: { seq: newValue, updatedBy: resetBy }
    },
    { new: true }
  );
  
  if (!counter) {
    throw new Error(`Counter ${name} for company ${companyId} not found`);
  }
  
  console.log(`🔄 Counter reset to: ${newValue}`);
  return counter;
};

// ===== SAFE MODEL REGISTRATION =====
const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

console.log('✅ Counter model loaded');

export default Counter;