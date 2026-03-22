
// import mongoose from "mongoose";

// /**
//  * Counter Model - Manages auto-incrementing sequences per company
//  * Used for generating custom product IDs starting from 100 for each company
//  */
// const CounterSchema = new mongoose.Schema(
//   {
//     // ===== SAAS MULTI-TENANCY =====
//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company",
//       required: true, // Always required for company-specific counters
//       index: true,
//     },

//     // Unique identifier for the counter (e.g., 'productId')
//     name: {
//       type: String,
//       required: [true, "Counter name is required"],
//       trim: true,
//       index: true,
//     },

//     // Current sequence value
//     seq: {
//       type: Number,
//       required: true,
//       default: 100,
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

//     // ===== AUDIT FIELDS =====
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ===== COMPOUND INDEX FOR COMPANY ISOLATION =====
// CounterSchema.index({ companyId: 1, name: 1 }, { 
//   unique: true,
//   name: 'company_counter_unique_idx' 
// });

// // ===== VIRTUALS =====
// CounterSchema.virtual("formattedCurrentId").get(function () {
//   return String(this.seq).padStart(this.padding, "0");
// });

// CounterSchema.virtual("nextId").get(function () {
//   return this.seq + 1;
// });

// CounterSchema.virtual("formattedNextId").get(function () {
//   const next = this.seq + 1;
//   return String(next).padStart(this.padding, "0");
// });

// // ===== STATIC METHODS =====

// /**
//  * Get next sequence value for a company - ATOMIC OPERATION
//  * This is the ONLY method you need for product creation
//  */
// CounterSchema.statics.incrementCounter = async function (name, companyId) {
//   console.log('🔢 Getting next sequence for:', { name, companyId });
  
//   try {
//     const counter = await this.findOneAndUpdate(
//       { name, companyId },
//       { $inc: { seq: 1 } },
//       { 
//         new: true, 
//         upsert: true,
//         setDefaultsOnInsert: { 
//           name, 
//           companyId,
//           seq: 100,
//           padding: 5,
//           description: `${name} counter for company ${companyId}`
//         }
//       }
//     );
    
//     console.log('✅ Next sequence:', counter.seq);
//     return counter.seq;
    
//   } catch (error) {
//     console.error('❌ Counter error:', error);
//     throw error;
//   }
// };

// /**
//  * Get current counter value without incrementing
//  */
// CounterSchema.statics.getCurrentCounter = async function (name, companyId) {
//   const counter = await this.findOne({ name, companyId });
//   return counter ? counter.seq : 100;
// };

// /**
//  * Reset counter for a company (admin only)
//  */
// CounterSchema.statics.resetCounter = async function (name, companyId, newValue, resetBy) {
//   const counter = await this.findOneAndUpdate(
//     { name, companyId },
//     { 
//       $set: { seq: newValue, updatedBy: resetBy }
//     },
//     { new: true }
//   );
  
//   if (!counter) {
//     throw new Error(`Counter ${name} for company ${companyId} not found`);
//   }
  
//   console.log(`🔄 Counter reset to: ${newValue}`);
//   return counter;
// };

// /**
//  * Initialize counters for a new company
//  * This is a placeholder - counters are created dynamically when first used
//  */
// CounterSchema.statics.initializeCompanyCounters = async function(companyId, createdBy = null) {
//   console.log('🔄 Counters will be created dynamically when needed for company:', companyId);
//   return true;
// };

// // ===== SAFE MODEL REGISTRATION =====
// const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

// console.log('✅ Counter model loaded');

// export default Counter;




// models/Counter.js
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
      required: false, // ✅ CHANGE: Not required - some counters may be global
      sparse: true,
    },

    // Unique identifier for the counter (e.g., 'productId')
    name: {
      type: String,
      required: [true, "Counter name is required"],
      trim: true,
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
// ✅ FIXED: Create unique index on (companyId, name) - allows null values
CounterSchema.index({ companyId: 1, name: 1 }, { 
  unique: true,
  name: 'company_counter_unique_idx',
  partialFilterExpression: { companyId: { $exists: true, $ne: null } }
});

// Also allow global counters (companyId: null)
CounterSchema.index({ name: 1 }, { 
  unique: true,
  partialFilterExpression: { companyId: null }
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
  
  // ✅ FIX: Create the filter correctly
  const filter = { 
    name: name,
    companyId: companyId || null
  };
  
  const update = {
    $inc: { seq: 1 }
  };
  
  const options = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: {
      name: name,
      companyId: companyId || null,
      seq: 100,
      padding: 5,
      description: `${name} counter${companyId ? ` for company ${companyId}` : ' (global)'}`
    }
  };
  
  try {
    const counter = await this.findOneAndUpdate(filter, update, options);
    console.log('✅ Next sequence:', counter.seq);
    return counter.seq;
  } catch (error) {
    console.error('❌ Counter error:', error);
    
    // ✅ Handle duplicate key error by retrying once
    if (error.code === 11000) {
      console.log('⚠️ Duplicate key error, retrying...');
      const counter = await this.findOneAndUpdate(filter, update, options);
      return counter.seq;
    }
    
    throw error;
  }
};

/**
 * Get current counter value without incrementing
 */
CounterSchema.statics.getCurrentCounter = async function (name, companyId) {
  const filter = { 
    name: name,
    companyId: companyId || null
  };
  const counter = await this.findOne(filter);
  return counter ? counter.seq : 100;
};

/**
 * Reset counter for a company (admin only)
 */
CounterSchema.statics.resetCounter = async function (name, companyId, newValue, resetBy) {
  const filter = { 
    name: name,
    companyId: companyId || null
  };
  
  const counter = await this.findOneAndUpdate(
    filter,
    { 
      $set: { seq: newValue, updatedBy: resetBy }
    },
    { new: true, upsert: true }
  );
  
  console.log(`🔄 Counter reset to: ${newValue}`);
  return counter;
};

/**
 * Initialize counters for a new company
 * Creates the first counter record
 */
CounterSchema.statics.initializeCompanyCounters = async function(companyId, createdBy = null) {
  console.log('🔄 Initializing counters for company:', companyId);
  
  try {
    // Create productId counter
    await this.findOneAndUpdate(
      { name: 'productId', companyId: companyId },
      { $setOnInsert: { seq: 100, padding: 5, createdBy } },
      { upsert: true, new: true }
    );
    
    console.log('✅ Counters initialized for company:', companyId);
    return true;
  } catch (error) {
    console.error('❌ Error initializing counters:', error);
    return false;
  }
};

// ===== SAFE MODEL REGISTRATION =====
const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

console.log('✅ Counter model loaded');

export default Counter;