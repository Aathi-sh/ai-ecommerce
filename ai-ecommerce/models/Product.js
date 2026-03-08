// import mongoose from 'mongoose';
// import Counter from './Counter';

// const ProductSchema = new mongoose.Schema(
//     {
//         // ✅ Custom numeric ID starting from 100
//         customId: {
//             type: Number,
//             unique: true,
//             index: true,
//             min: 1,
//         },
        
//         productName: { 
//             type: String, 
//             required: [true, "Product name is required"],
//             trim: true,
//             index: true,           
//         },
//         slug: { // URL-friendly name
//             type: String,
//             required: true,
//             unique: true,
//             lowercase: true,
//         },
//         sku: { // Stock Keeping Unit
//             type: String,
//             required: [true, "SKU is required"],
//             unique: true,
//             uppercase: true,
//         },
//         hsnCode: { // HSN code for GST
//             type: String,
//             required: [true, "HSN code is required"],
//         },
//         gstRate: { // GST percentage
//             type: Number,
//             required: [true, "GST rate is required"],
//             default: 18,
//             min: 0,
//             max: 28,
//         },
        
//         category: { 
//             type: String, 
//             required: [true, "Category is required"],
//             index: true,
//         },
//         subCategory: {
//             type: String,
//             required: false,
//         },
//         brand: {
//             type: String,
//             required: false,
//         },
        
//         // Pricing
//         mrp: { // Maximum Retail Price
//             type: Number, 
//             required: [true, "MRP is required"],
//             min: 0,
//         },
//         discountPrice: { // Discounted price
//             type: Number,
//             required: [true, "Discount price is required"],
//             min: 0,
//         },
//         costPrice: { // Your cost price (for profit calculation)
//             type: Number,
//             required: false,
//             min: 0,
//         },
//         margin: { // Profit margin
//             type: Number,
//             default: 0,
//         },
//         gstIncluded: { // Whether price includes GST
//             type: Boolean,
//             default: true,
//         },
        
//         description: { 
//             type: String, 
//             required: [true, "Description is required"],
//             trim: true 
//         },
//         shortDescription: {
//             type: String,
//             required: false,
//             maxlength: 500,
//         },
        
//         // Media
//         imageUrls: { 
//             type: [String],
//             required: [true, "At least one image is required"],
//             validate: {
//                 validator: function(array) {
//                     return array.length > 0;
//                 },
//                 message: "At least one product image is required"
//             }
//         },
//         videoUrl: { // Product video
//             type: String,
//             required: false,
//         },
        
//         // Product options/variants
//         options: {
//             type: String,
//             required: false,
//         },
//         variants: [
//             {
//                 variantName: String,
//                 variantValue: String,
//                 sku: String,
//                 price: Number,
//                 stock: Number,
//                 imageUrls: [String],
//             }
//         ],
        
//         // Inventory
//         stock: {
//             type: Number,
//             required: [true, "Stock quantity is required"],
//             min: 0,
//         },
//         lowStockThreshold: {
//             type: Number,
//             default: 5,
//         },
//         trackInventory: {
//             type: Boolean,
//             default: true,
//         },
//         allowBackorder: {
//             type: Boolean,
//             default: false,
//         },
        
//         // Product specifications
//         specifications: {
//             type: Map,
//             of: String,
//         },
        
//         // SEO fields
//         metaTitle: String,
//         metaDescription: String,
//         metaKeywords: [String],
        
//         // Ratings and reviews
//         averageRating: {
//             type: Number,
//             default: 0,
//             min: 0,
//             max: 5,
//         },
//         totalReviews: {
//             type: Number,
//             default: 0,
//         },
        
//         // Flags
//         isActive: {
//             type: Boolean,
//             default: true,
//         },
//         isFeatured: {
//             type: Boolean,
//             default: false,
//         },
//         isOnSale: {
//             type: Boolean,
//             default: false,
//         },
//         isNewArrival: {
//             type: Boolean,
//             default: false,
//         },
//         isBestSeller: {
//             type: Boolean,
//             default: false,
//         },
        
//         // Tax
//         taxClass: {
//             type: String,
//             enum: ["standard", "reduced", "zero", "exempt"],
//             default: "standard",
//         },
        
//         // Shipping
//         weight: { // in kg
//             type: Number,
//             required: false,
//         },
//         dimensions: {
//             length: Number,
//             width: Number,
//             height: Number,
//             unit: { type: String, default: "cm" },
//         },
//         shippingClass: String,
        
//         // Discount and offers
//         discountStartDate: Date,
//         discountEndDate: Date,
//         maxOrderQuantity: {
//             type: Number,
//             default: 10,
//         },
        
//         // Tracking
//         createdBy: {
//             type: String,
//             ref: 'User',
//             required: [true, "Created by user is required"]
//         },
//         updatedBy: {
//             type: String,
//             ref: 'User',
//             required: false,
//         },
        
//         // Timestamps added automatically
//     },
//     { 
//         timestamps: true,
//         toJSON: { virtuals: true },
//         toObject: { virtuals: true },
//     }
// );

// // ✅ FIXED: Virtual for formatted ID - ONLY NUMBERS (00100 format)
// ProductSchema.virtual('formattedId').get(function() {
//     if (!this.customId) return '00000';
//     // Pad with zeros to make it 5 digits
//     return String(this.customId).padStart(5, '0');
// });

// // Virtual for in-stock status
// ProductSchema.virtual('inStock').get(function() {
//     return this.stock > 0;
// });

// // Virtual for discount percentage
// ProductSchema.virtual('discountPercentage').get(function() {
//     if (this.mrp && this.discountPrice) {
//         return Math.round(((this.mrp - this.discountPrice) / this.mrp) * 100);
//     }
//     return 0;
// });

// // ✅ FIXED: Pre-save middleware with proper atomic counter increment
// ProductSchema.pre('save', async function(next) {
//     try {
//         // Generate slug from product name if not provided
//         if (!this.slug && this.productName) {
//             this.slug = this.productName
//                 .toLowerCase()
//                 .replace(/[^a-z0-9]+/g, '-')
//                 .replace(/^-|-$/g, '');
//         }
        
//         // Calculate margin
//         if (this.costPrice && this.discountPrice && this.costPrice > 0) {
//             this.margin = ((this.discountPrice - this.costPrice) / this.costPrice) * 100;
//         }
        
//         // ✅ FIXED: Auto-generate customId for new products (starts from 100)
//         if (this.isNew && !this.customId) {
//             try {
//                 console.log(`🔢 Generating custom ID for new product: ${this.productName}`);
                
//                 // Use Counter.incrementCounter method
//                 const Counter = mongoose.model('Counter');
//                 const nextSeq = await Counter.incrementCounter('productId');
                
//                 this.customId = nextSeq;
//                 console.log(`✅ Generated product ID: ${this.formattedId} (${this.customId}) for: ${this.productName}`);
//             } catch (counterError) {
//                 console.error('❌ Counter operation failed:', counterError);
                
//                 // Fallback: Generate timestamp-based ID
//                 const timestamp = parseInt(Date.now().toString().slice(-6));
//                 this.customId = timestamp;
//                 console.log(`⚠️ Using fallback ID: ${this.formattedId} (${this.customId}) for: ${this.productName}`);
//             }
//         }
        
//         next();
//     } catch (error) {
//         console.error('❌ Error in product pre-save:', error);
//         next(error);
//     }
// });

// // ✅ Post-save middleware to log creation
// ProductSchema.post('save', function(doc) {
//     console.log(`✅ Product saved: ${doc.productName} (ID: ${doc.formattedId})`);
// });

// // Indexes for better performance
// ProductSchema.index({ productName: 'text', description: 'text' });
// ProductSchema.index({ sku: 1 });
// ProductSchema.index({ slug: 1 });
// ProductSchema.index({ category: 1, subCategory: 1 });
// ProductSchema.index({ isActive: 1, isFeatured: 1 });
// ProductSchema.index({ discountPrice: 1 });
// ProductSchema.index({ createdAt: -1 });
// ProductSchema.index({ customId: 1 });

// // ✅ Static method to get product by formatted ID
// ProductSchema.statics.findByFormattedId = function(formattedId) {
//     // Convert "00123" back to number 123
//     const customId = parseInt(formattedId, 10);
//     return this.findOne({ customId });
// };

// // ✅ Static method to get product by customId number
// ProductSchema.statics.findByCustomId = function(customId) {
//     return this.findOne({ customId });
// };

// // ✅ Static method to get next available customId
// ProductSchema.statics.getNextCustomId = async function() {
//     try {
//         const counter = await Counter.findOne({ name: 'productId' });
//         const nextId = counter ? counter.seq + 1 : 100;
//         return {
//             number: nextId,
//             formatted: String(nextId).padStart(5, '0')
//         };
//     } catch (error) {
//         console.error('❌ Error getting next custom ID:', error);
//         const fallback = parseInt(Date.now().toString().slice(-6));
//         return {
//             number: fallback,
//             formatted: String(fallback).padStart(5, '0')
//         };
//     }
// };

// // ✅ Static method to get product count
// ProductSchema.statics.getProductStats = async function() {
//     const total = await this.countDocuments();
//     const active = await this.countDocuments({ isActive: true });
//     const lowStock = await this.countDocuments({ 
//         stock: { $lte: 5 }, 
//         stock: { $gt: 0 },
//         isActive: true 
//     });
//     const outOfStock = await this.countDocuments({ stock: 0, isActive: true });
    
//     return { total, active, lowStock, outOfStock };
// };

// // ✅ Instance method to get product info with formatted ID
// ProductSchema.methods.getInfo = function() {
//     return {
//         id: this._id,
//         customId: this.customId,
//         formattedId: this.formattedId, // Returns "00123"
//         name: this.productName,
//         price: this.discountPrice,
//         stock: this.stock,
//         isActive: this.isActive
//     };
// };

// // Ensure virtuals are included in JSON output
// ProductSchema.set('toJSON', { 
//     virtuals: true,
//     transform: function(doc, ret) {
//         delete ret.__v;
//         ret.id = ret._id;
//         // Ensure formattedId is included
//         ret.formattedId = doc.formattedId;
//         return ret;
//     }
// });

// ProductSchema.set('toObject', { 
//     virtuals: true,
//     transform: function(doc, ret) {
//         delete ret.__v;
//         ret.id = ret._id;
//         // Ensure formattedId is included
//         ret.formattedId = doc.formattedId;
//         return ret;
//     }
// });

// export default mongoose.models.Product || mongoose.model("Product", ProductSchema);


// models/Product.js
import mongoose from 'mongoose';
import Counter from './Counter';

const ProductSchema = new mongoose.Schema(
    {
        // ✅ Custom numeric ID starting from 100
        customId: {
            type: Number,
            unique: true,
            index: true,
            min: 1,
        },
        
        productName: { 
            type: String, 
            required: [true, "Product name is required"],
            trim: true,
            index: true,           
        },
        slug: { // URL-friendly name
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true, // ✅ Added index here
        },
        sku: { // Stock Keeping Unit
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            uppercase: true,
            index: true, // ✅ Added index here
        },
        hsnCode: { // HSN code for GST
            type: String,
            required: [true, "HSN code is required"],
        },
        gstRate: { // GST percentage
            type: Number,
            required: [true, "GST rate is required"],
            default: 18,
            min: 0,
            max: 28,
        },
        
        // ✅ Category as ObjectId reference to Category model
        category: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, "Category is required"],
            index: true,
        },
        
        // ✅ SubCategory as ObjectId reference to Category model
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: false,
            index: true,
        },
        
        // ✅ Brand kept as string
        brand: {
            type: String,
            required: false,
            index: true,
        },
        
        // Pricing
        mrp: { // Maximum Retail Price
            type: Number, 
            required: [true, "MRP is required"],
            min: 0,
        },
        discountPrice: { // Discounted price
            type: Number,
            required: [true, "Discount price is required"],
            min: 0,
        },
        costPrice: { // Your cost price (for profit calculation)
            type: Number,
            required: false,
            min: 0,
        },
        margin: { // Profit margin
            type: Number,
            default: 0,
        },
        gstIncluded: { // Whether price includes GST
            type: Boolean,
            default: true,
        },
        
        description: { 
            type: String, 
            required: [true, "Description is required"],
            trim: true 
        },
        shortDescription: {
            type: String,
            required: false,
            maxlength: 500,
        },
        
        // Media
        imageUrls: { 
            type: [String],
            required: [true, "At least one image is required"],
            validate: {
                validator: function(array) {
                    return array.length > 0;
                },
                message: "At least one product image is required"
            }
        },
        videoUrl: { // Product video
            type: String,
            required: false,
        },
        
        // Product options/variants
        options: {
            type: String,
            required: false,
        },
        variants: [
            {
                variantName: String,
                variantValue: String,
                sku: String,
                price: Number,
                stock: Number,
                imageUrls: [String],
            }
        ],
        
        // Inventory
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
        },
        trackInventory: {
            type: Boolean,
            default: true,
        },
        allowBackorder: {
            type: Boolean,
            default: false,
        },
        
        // Product specifications
        specifications: {
            type: Map,
            of: String,
        },
        
        // SEO fields
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
        
        // Ratings and reviews
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        
        // Flags
        isActive: {
            type: Boolean,
            default: true,
            index: true, // ✅ Added index here
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true, // ✅ Added index here
        },
        isOnSale: {
            type: Boolean,
            default: false,
        },
        isNewArrival: {
            type: Boolean,
            default: false,
        },
        isBestSeller: {
            type: Boolean,
            default: false,
        },
        
        // Tax
        taxClass: {
            type: String,
            enum: ["standard", "reduced", "zero", "exempt"],
            default: "standard",
        },
        
        // Shipping
        weight: { // in kg
            type: Number,
            required: false,
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: { type: String, default: "cm" },
        },
        shippingClass: String,
        
        // Discount and offers
        discountStartDate: Date,
        discountEndDate: Date,
        maxOrderQuantity: {
            type: Number,
            default: 10,
        },
        
        // Tracking
        createdBy: {
            type: String,
            ref: 'User',
            required: [true, "Created by user is required"]
        },
        updatedBy: {
            type: String,
            ref: 'User',
            required: false,
        },
        
        // Timestamps added automatically
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ========== VIRTUALS ==========

// Virtual for formatted ID - ONLY NUMBERS (00100 format)
ProductSchema.virtual('formattedId').get(function() {
    if (!this.customId) return '00000';
    // Pad with zeros to make it 5 digits
    return String(this.customId).padStart(5, '0');
});

// Virtual for category name (for convenience)
ProductSchema.virtual('categoryName').get(async function() {
    if (!this.category) return null;
    const Category = mongoose.model('Category');
    const cat = await Category.findById(this.category);
    return cat ? cat.name : null;
});

// Virtual for subCategory name (for convenience)
ProductSchema.virtual('subCategoryName').get(async function() {
    if (!this.subCategory) return null;
    const Category = mongoose.model('Category');
    const subCat = await Category.findById(this.subCategory);
    return subCat ? subCat.name : null;
});

// Virtual for in-stock status
ProductSchema.virtual('inStock').get(function() {
    return this.stock > 0;
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
    if (this.mrp && this.discountPrice) {
        return Math.round(((this.mrp - this.discountPrice) / this.mrp) * 100);
    }
    return 0;
});

// ========== MIDDLEWARE ==========

// Pre-save middleware with proper atomic counter increment
ProductSchema.pre('save', async function(next) {
    try {
        // Generate slug from product name if not provided
        if (!this.slug && this.productName) {
            this.slug = this.productName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
        
        // Calculate margin
        if (this.costPrice && this.discountPrice && this.costPrice > 0) {
            this.margin = ((this.discountPrice - this.costPrice) / this.costPrice) * 100;
        }
        
        // Auto-generate customId for new products (starts from 100)
        if (this.isNew && !this.customId) {
            try {
                console.log(`🔢 Generating custom ID for new product: ${this.productName}`);
                
                // Use Counter.incrementCounter method
                const Counter = mongoose.model('Counter');
                const nextSeq = await Counter.incrementCounter('productId');
                
                this.customId = nextSeq;
                console.log(`✅ Generated product ID: ${this.formattedId} (${this.customId}) for: ${this.productName}`);
            } catch (counterError) {
                console.error('❌ Counter operation failed:', counterError);
                
                // Fallback: Generate timestamp-based ID
                const timestamp = parseInt(Date.now().toString().slice(-6));
                this.customId = timestamp;
                console.log(`⚠️ Using fallback ID: ${this.formattedId} (${this.customId}) for: ${this.productName}`);
            }
        }
        
        // Validate that category exists in Category model
        if (this.category) {
            const Category = mongoose.model('Category');
            const categoryExists = await Category.findById(this.category);
            if (!categoryExists) {
                return next(new Error(`Category with ID ${this.category} does not exist`));
            }
        }
        
        // Validate that subCategory exists in Category model (if provided)
        if (this.subCategory) {
            const Category = mongoose.model('Category');
            const subCategoryExists = await Category.findById(this.subCategory);
            if (!subCategoryExists) {
                return next(new Error(`SubCategory with ID ${this.subCategory} does not exist`));
            }
            
            // Optional: Validate that subCategory belongs to the selected category
            if (this.category) {
                const subCat = await Category.findById(this.subCategory);
                if (subCat && subCat.parentId && subCat.parentId.toString() !== this.category.toString()) {
                    console.warn(`⚠️ Warning: SubCategory ${subCat.name} does not belong to selected category`);
                }
            }
        }
        
        next();
    } catch (error) {
        console.error('❌ Error in product pre-save:', error);
        next(error);
    }
});

// Pre-update middleware to validate category/subcategory
ProductSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        
        // Check if category is being updated
        if (update.category || (update.$set && update.$set.category)) {
            const categoryId = update.category || update.$set.category;
            const Category = mongoose.model('Category');
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                return next(new Error(`Category with ID ${categoryId} does not exist`));
            }
        }
        
        // Check if subCategory is being updated
        if (update.subCategory || (update.$set && update.$set.subCategory)) {
            const subCategoryId = update.subCategory || update.$set.subCategory;
            if (subCategoryId) {
                const Category = mongoose.model('Category');
                const subCategoryExists = await Category.findById(subCategoryId);
                if (!subCategoryExists) {
                    return next(new Error(`SubCategory with ID ${subCategoryId} does not exist`));
                }
            }
        }
        
        next();
    } catch (error) {
        console.error('❌ Error in product pre-update:', error);
        next(error);
    }
});

// Post-save middleware to log creation
ProductSchema.post('save', function(doc) {
    console.log(`✅ Product saved: ${doc.productName} (ID: ${doc.formattedId})`);
});

// ========== INDEXES ==========
// ✅ FIXED: Removed duplicate indexes to eliminate warnings

// Text index for search (special compound index)
ProductSchema.index({ productName: 'text', description: 'text' });

// Compound indexes for efficient queries
ProductSchema.index({ category: 1, subCategory: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });

// Single field indexes (only where not already indexed in schema)
ProductSchema.index({ discountPrice: 1 });
ProductSchema.index({ createdAt: -1 });

// Note: The following fields are already indexed in the schema:
// - customId (index: true in schema)
// - productName (index: true in schema)
// - slug (index: true in schema)
// - sku (index: true in schema)
// - category (index: true in schema)
// - subCategory (index: true in schema)
// - brand (index: true in schema)
// - isActive (index: true in schema)
// - isFeatured (index: true in schema)

// ========== STATIC METHODS ==========

// Get product by formatted ID
ProductSchema.statics.findByFormattedId = function(formattedId) {
    // Convert "00123" back to number 123
    const customId = parseInt(formattedId, 10);
    return this.findOne({ customId });
};

// Get product by customId number
ProductSchema.statics.findByCustomId = function(customId) {
    return this.findOne({ customId });
};

// Get next available customId
ProductSchema.statics.getNextCustomId = async function() {
    try {
        const counter = await Counter.findOne({ name: 'productId' });
        const nextId = counter ? counter.seq + 1 : 100;
        return {
            number: nextId,
            formatted: String(nextId).padStart(5, '0')
        };
    } catch (error) {
        console.error('❌ Error getting next custom ID:', error);
        const fallback = parseInt(Date.now().toString().slice(-6));
        return {
            number: fallback,
            formatted: String(fallback).padStart(5, '0')
        };
    }
};

// Get product stats
ProductSchema.statics.getProductStats = async function() {
    const total = await this.countDocuments();
    const active = await this.countDocuments({ isActive: true });
    const lowStock = await this.countDocuments({ 
        stock: { $lte: 5 }, 
        stock: { $gt: 0 },
        isActive: true 
    });
    const outOfStock = await this.countDocuments({ stock: 0, isActive: true });
    
    // Get category distribution
    const categoryDistribution = await this.aggregate([
        { $match: { category: { $ne: null } } },
        { $group: {
            _id: '$category',
            count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryInfo'
        }},
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
        { $project: {
            categoryName: '$categoryInfo.name',
            count: 1
        }}
    ]);
    
    return { 
        total, 
        active, 
        lowStock, 
        outOfStock,
        categoryDistribution 
    };
};

// Get products by category
ProductSchema.statics.findByCategory = function(categoryId) {
    return this.find({ category: categoryId })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .sort({ createdAt: -1 });
};

// Get products by subCategory
ProductSchema.statics.findBySubCategory = function(subCategoryId) {
    return this.find({ subCategory: subCategoryId })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .sort({ createdAt: -1 });
};

// ========== INSTANCE METHODS ==========

// Get product info with formatted ID
ProductSchema.methods.getInfo = function() {
    return {
        id: this._id,
        customId: this.customId,
        formattedId: this.formattedId, // Returns "00123"
        name: this.productName,
        price: this.discountPrice,
        stock: this.stock,
        isActive: this.isActive,
        category: this.category,
        subCategory: this.subCategory
    };
};

// Get populated category info
ProductSchema.methods.getCategoryInfo = async function() {
    const Category = mongoose.model('Category');
    const catInfo = await Category.findById(this.category).select('name slug');
    const subCatInfo = this.subCategory ? 
        await Category.findById(this.subCategory).select('name slug') : null;
    
    return {
        category: catInfo,
        subCategory: subCatInfo
    };
};

// ========== JSON TRANSFORM ==========

// Ensure virtuals are included in JSON output
ProductSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        // Ensure formattedId is included
        ret.formattedId = doc.formattedId;
        return ret;
    }
});

ProductSchema.set('toObject', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        // Ensure formattedId is included
        ret.formattedId = doc.formattedId;
        return ret;
    }
});

// ========== EXPORT ==========

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);