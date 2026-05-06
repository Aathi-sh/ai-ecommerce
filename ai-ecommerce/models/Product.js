

// models/Product.js
import mongoose from 'mongoose';
import Counter from './Counter';

const ProductSchema = new mongoose.Schema(
    {
        // ===== COMPANY CONTEXT =====
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: [true, "Company ID is required"],
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        
        // ===== CUSTOM ID (AUTO-GENERATED) =====
        customId: {
            type: Number,
            required: true,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        
        // ===== AUDIT TRAIL FIELDS =====
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Created by user is required"]
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        
        // ===== SOFT DELETE =====
        deletedAt: {
            type: Date,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        
        productName: { 
            type: String, 
            required: [true, "Product name is required"],
            trim: true,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        sku: {
            type: String,
            required: [true, "SKU is required"],
            uppercase: true,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        hsnCode: {
            type: String,
            required: [true, "HSN code is required"],
        },
        gstRate: {
            type: Number,
            required: [true, "GST rate is required"],
            default: 18,
            min: 0,
            max: 28,
        },
        
        category: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, "Category is required"],
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        
        brand: {
            type: String,
            required: false,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        
        // Pricing
        mrp: {
            type: Number, 
            required: [true, "MRP is required"],
            min: 0,
        },
        discountPrice: {
            type: Number,
            required: [true, "Discount price is required"],
            min: 0,
        },
        costPrice: {
            type: Number,
            required: false,
            min: 0,
        },
        margin: {
            type: Number,
            default: 0,
        },
        gstIncluded: {
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
        videoUrl: {
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
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
        },
        isFeatured: {
            type: Boolean,
            default: false,
            // index: true,  // ✅ REMOVED - index defined in compound indexes below
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
        weight: {
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
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ========== COMPOUND INDEXES - KEEP ALL OF THESE ==========
ProductSchema.index({ companyId: 1, customId: 1 }, { unique: true });
ProductSchema.index({ companyId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ companyId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ companyId: 1, productName: 1 });
ProductSchema.index({ companyId: 1, category: 1, subCategory: 1 });
ProductSchema.index({ companyId: 1, isActive: 1, isFeatured: 1 });
ProductSchema.index({ companyId: 1, brand: 1 });
ProductSchema.index({ companyId: 1, createdAt: -1 });
ProductSchema.index({ companyId: 1, discountPrice: 1 });
ProductSchema.index({ companyId: 1, stock: 1 });
ProductSchema.index({ companyId: 1, deletedAt: 1 }, { sparse: true });

// Text index for search
ProductSchema.index({ 
    companyId: 1, 
    productName: 'text', 
    description: 'text',
    sku: 'text',
    brand: 'text'
}, {
    weights: {
        productName: 10,
        sku: 8,
        brand: 5,
        description: 3
    }
});

// ========== VIRTUALS ==========
ProductSchema.virtual('formattedId').get(function() {
    if (!this.customId) return '00000';
    return String(this.customId).padStart(5, '0');
});

ProductSchema.virtual('inStock').get(function() {
    return this.stock > 0;
});

ProductSchema.virtual('discountPercentage').get(function() {
    if (this.mrp && this.discountPrice) {
        return Math.round(((this.mrp - this.discountPrice) / this.mrp) * 100);
    }
    return 0;
});

ProductSchema.virtual('auditInfo').get(function() {
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

ProductSchema.virtual('companyContext').get(function() {
    return {
        companyId: this.companyId,
        isolated: true
    };
});

// ========== PRE-SAVE MIDDLEWARE ==========
ProductSchema.pre('save', async function(next) {
    console.log('\n🔴🔴🔴 ===== PRE-SAVE MIDDLEWARE STARTED ===== 🔴🔴🔴');
    console.log('📦 PRODUCT:', this.productName || 'UNNAMED');
    console.log('🆔 ID:', this._id);
    console.log('🆕 isNew:', this.isNew);
    console.log('🔢 has customId?', !!this.customId);
    console.log('🔢 customId value:', this.customId);
    console.log('🏢 companyId:', this.companyId?.toString());
    console.log('📝 SKU:', this.sku);
    console.log('🔤 CURRENT SLUG VALUE:', this.slug);
    
    try {
        // ===== STEP 1: Validate companyId =====
        console.log('\n🔍 STEP 1: Validating companyId');
        if (!this.companyId) {
            console.error('❌ ERROR: No companyId provided');
            return next(new Error('Company ID is required for product creation'));
        }
        console.log('✅ companyId valid:', this.companyId.toString());
        
        // ===== STEP 2: PRESERVE EXISTING SLUG - DO NOT MODIFY =====
        console.log('\n🔍 STEP 2: Checking slug');
        console.log('🔍 Current slug value in pre-save:', this.slug);

        if (this.slug) {
            console.log('✅ Slug already exists, KEEPING:', this.slug);
        } 
        else if (!this.slug && this.productName) {
            console.log('⚠️ No slug found, generating from product name');
            let baseSlug = this.productName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            
            const existingProduct = await this.constructor.findOne({
                companyId: this.companyId,
                slug: baseSlug,
                _id: { $ne: this._id }
            });
            
            if (existingProduct) {
                baseSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
            }
            
            this.slug = baseSlug;
            console.log('✅ Generated fallback slug:', this.slug);
        }

        console.log('🔍 Slug value after STEP 2:', this.slug);
        
        // ===== STEP 3: Calculate margin =====
        console.log('\n🔍 STEP 3: Calculating margin');
        if (this.costPrice && this.discountPrice && this.costPrice > 0) {
            this.margin = ((this.discountPrice - this.costPrice) / this.costPrice) * 100;
            console.log('💰 Margin calculated:', this.margin.toFixed(2) + '%');
        } else {
            console.log('💰 Margin not calculated (missing costPrice or discountPrice)');
        }
        
        // ===== STEP 4: CRITICAL - GENERATE customId =====
        console.log('\n🔍 STEP 4: Checking customId generation');
        console.log('   Condition: isNew =', this.isNew, '!customId =', !this.customId);
        
        if (this.isNew && !this.customId) {
            console.log('✅✅✅ CONDITION MET - GENERATING customId');
            console.log(`🔢 Generating custom ID for company: ${this.companyId}`);
            
            try {
                const Counter = mongoose.model('Counter');
                console.log('✅ Counter model retrieved');
                
                console.log('📞 Calling Counter.incrementCounter with:', { 
                    name: 'productId', 
                    companyId: this.companyId?.toString() 
                });
                
                const nextSeq = await Counter.incrementCounter('productId', this.companyId);
                
                console.log('📞 Counter.incrementCounter RETURNED:', nextSeq);
                
                if (nextSeq === undefined || nextSeq === null) {
                    throw new Error('Counter returned undefined');
                }
                
                this.customId = nextSeq;
                console.log(`✅✅✅ customId SET to: ${this.customId}`);
                console.log(`✅ Formatted ID will be: ${String(this.customId).padStart(5, '0')}`);
                
            } catch (counterError) {
                console.error('❌❌❌ COUNTER ERROR DETECTED ❌❌❌');
                console.error('Error name:', counterError.name);
                console.error('Error message:', counterError.message);
                
                const timestamp = parseInt(Date.now().toString().slice(-6));
                console.log('⏰ Timestamp generated:', timestamp);
                this.customId = timestamp;
                console.log(`⚠️ FALLBACK customId set to: ${this.customId}`);
            }
        } else {
            console.log('⏭️⏭️⏭️ SKIPPING customId generation:');
            console.log('   - isNew:', this.isNew);
            console.log('   - has customId:', !!this.customId);
            if (this.customId) {
                console.log('   - existing customId:', this.customId);
            }
        }
        
        // ===== STEP 5: FINAL CHECK =====
        console.log('\n🔍 STEP 5: FINAL customId value BEFORE validation:', this.customId);
        
        if (!this.customId) {
            console.error('❌❌❌ CRITICAL: customId is STILL undefined after generation!');
            this.customId = parseInt(Date.now().toString().slice(-6));
            console.log('⚠️ FORCED fallback customId:', this.customId);
        }
        
        // ===== STEP 6: Validate category =====
        console.log('\n🔍 STEP 6: Validating category');
        if (this.category) {
            console.log('🔍 Checking category:', this.category.toString());
            const Category = mongoose.model('Category');
            const categoryExists = await Category.findOne({
                _id: this.category,
                companyId: this.companyId
            });
            if (!categoryExists) {
                console.error('❌ Category not found in this company:', this.category);
                return next(new Error(`Category with ID ${this.category} does not exist in this company`));
            }
            console.log('✅ Category validated');
        } else {
            console.log('⚠️ No category to validate');
        }
        
        // ===== STEP 7: Validate subCategory =====
        console.log('\n🔍 STEP 7: Validating subCategory');
        if (this.subCategory) {
            console.log('🔍 Checking subCategory:', this.subCategory.toString());
            const Category = mongoose.model('Category');
            const subCategoryExists = await Category.findOne({
                _id: this.subCategory,
                companyId: this.companyId
            });
            if (!subCategoryExists) {
                console.error('❌ SubCategory not found in this company:', this.subCategory);
                return next(new Error(`SubCategory with ID ${this.subCategory} does not exist in this company`));
            }
            console.log('✅ SubCategory validated');
        } else {
            console.log('⚠️ No subCategory to validate');
        }
        
        // ===== STEP 8: Validate SKU uniqueness =====
        console.log('\n🔍 STEP 8: Validating SKU uniqueness');
        if (this.sku) {
            console.log('🔍 Checking SKU:', this.sku);
            const existingSku = await this.constructor.findOne({
                companyId: this.companyId,
                sku: this.sku,
                _id: { $ne: this._id }
            });
            if (existingSku) {
                console.error('❌ SKU already exists in this company:', this.sku);
                return next(new Error(`SKU ${this.sku} already exists in this company`));
            }
            console.log('✅ SKU validated');
        } else {
            console.log('⚠️ No SKU to validate');
        }
        
        // ===== STEP 9: FINAL SUMMARY =====
        console.log('\n✅✅✅ ===== PRE-SAVE MIDDLEWARE COMPLETED SUCCESSFULLY ===== ✅✅✅');
        console.log('📦 Product:', this.productName);
        console.log('🔢 Final customId:', this.customId);
        console.log('🔢 Formatted ID:', String(this.customId).padStart(5, '0'));
        console.log('🏢 Company:', this.companyId);
        console.log('🔤 FINAL SLUG VALUE:', this.slug);
        console.log('📝 SKU:', this.sku);
        console.log('🔴🔴🔴 ===== PRE-SAVE MIDDLEWARE ENDED ===== 🔴🔴🔴\n');
        
        next();
    } catch (error) {
        console.error('\n❌❌❌ ===== PRE-SAVE MIDDLEWARE CATASTROPHIC ERROR ===== ❌❌❌');
        console.error('Error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('❌❌❌ ===== ERROR END ===== ❌❌❌\n');
        next(error);
    }
});

// ========== PRE-UPDATE MIDDLEWARE ==========
ProductSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        const query = this.getQuery();
        
        let companyId = query.companyId;
        if (!companyId && query._id) {
            const product = await this.model.findOne(query).select('companyId');
            companyId = product?.companyId;
        }
        
        if (!companyId) {
            return next(new Error('Company context required for product update'));
        }
        
        // Check if category is being updated
        if (update.category || (update.$set && update.$set.category)) {
            const categoryId = update.category || update.$set.category;
            const Category = mongoose.model('Category');
            const categoryExists = await Category.findOne({
                _id: categoryId,
                companyId: companyId
            });
            if (!categoryExists) {
                return next(new Error(`Category with ID ${categoryId} does not exist in this company`));
            }
        }
        
        // Check if subCategory is being updated
        if (update.subCategory || (update.$set && update.$set.subCategory)) {
            const subCategoryId = update.subCategory || update.$set.subCategory;
            if (subCategoryId) {
                const Category = mongoose.model('Category');
                const subCategoryExists = await Category.findOne({
                    _id: subCategoryId,
                    companyId: companyId
                });
                if (!subCategoryExists) {
                    return next(new Error(`SubCategory with ID ${subCategoryId} does not exist in this company`));
                }
            }
        }
        
        // Check if SKU is being updated
        if (update.sku || (update.$set && update.$set.sku)) {
            const sku = update.sku || update.$set.sku;
            const existingSku = await this.model.findOne({
                companyId: companyId,
                sku: sku,
                _id: { $ne: query._id }
            });
            if (existingSku) {
                return next(new Error(`SKU ${sku} already exists in this company`));
            }
        }
        
        if (!query.companyId) {
            this.setQuery({ ...query, companyId: companyId });
        }
        
        next();
    } catch (error) {
        console.error('❌ Error in product pre-update:', error);
        next(error);
    }
});

// ========== POST-SAVE MIDDLEWARE ==========
ProductSchema.post('save', function(doc) {
    console.log(`✅ Product saved: ${doc.productName} (ID: ${doc.formattedId}) for company: ${doc.companyId}`);
});

// ========== STATIC METHODS ==========
ProductSchema.statics.findByFormattedId = function(companyId, formattedId) {
    const customId = parseInt(formattedId, 10);
    return this.findOne({ companyId, customId });
};

ProductSchema.statics.findByCustomId = function(companyId, customId) {
    return this.findOne({ companyId, customId });
};

ProductSchema.statics.getNextCustomId = async function(companyId) {
    try {
        const counter = await Counter.findOne({ name: `productId_${companyId}` });
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

ProductSchema.statics.getProductStats = async function(companyId) {
    const query = { companyId, deletedAt: null };
    
    const total = await this.countDocuments(query);
    const active = await this.countDocuments({ ...query, isActive: true });
    const lowStock = await this.countDocuments({ 
        ...query,
        stock: { $lte: 5 }, 
        stock: { $gt: 0 },
        isActive: true 
    });
    const outOfStock = await this.countDocuments({ 
        ...query,
        stock: 0, 
        isActive: true 
    });
    
    const categoryDistribution = await this.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId), category: { $ne: null }, deletedAt: null } },
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

ProductSchema.statics.findByCategory = function(companyId, categoryId) {
    return this.find({ companyId, category: categoryId, deletedAt: null })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .sort({ createdAt: -1 });
};

ProductSchema.statics.findBySubCategory = function(companyId, subCategoryId) {
    return this.find({ companyId, subCategory: subCategoryId, deletedAt: null })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .sort({ createdAt: -1 });
};

ProductSchema.statics.findByCompany = function(companyId, filters = {}) {
    const query = { companyId, deletedAt: null, ...filters };
    return this.find(query)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .sort({ createdAt: -1 });
};

ProductSchema.statics.search = function(companyId, searchTerm, filters = {}) {
    const query = {
        companyId,
        deletedAt: null,
        $text: { $search: searchTerm },
        ...filters
    };
    
    return this.find(query)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .sort({ score: { $meta: 'textScore' } });
};

ProductSchema.statics.getLowStockProducts = function(companyId, threshold = null) {
    const query = { 
        companyId, 
        deletedAt: null,
        isActive: true,
        $expr: { $lte: ['$stock', { $ifNull: [threshold, '$lowStockThreshold'] }] }
    };
    return this.find(query)
        .populate('category', 'name slug')
        .sort({ stock: 1 });
};

// ========== INSTANCE METHODS ==========
ProductSchema.methods.getInfo = function() {
    return {
        id: this._id,
        customId: this.customId,
        formattedId: this.formattedId,
        name: this.productName,
        price: this.discountPrice,
        stock: this.stock,
        isActive: this.isActive,
        companyId: this.companyId,
        category: this.category,
        subCategory: this.subCategory
    };
};

ProductSchema.methods.getCategoryInfo = async function() {
    const Category = mongoose.model('Category');
    const catInfo = await Category.findOne({ 
        _id: this.category,
        companyId: this.companyId 
    }).select('name slug');
    
    const subCatInfo = this.subCategory ? 
        await Category.findOne({ 
            _id: this.subCategory,
            companyId: this.companyId 
        }).select('name slug') : null;
    
    return {
        category: catInfo,
        subCategory: subCatInfo
    };
};

ProductSchema.methods.softDelete = async function(deletedBy) {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.isActive = false;
    return this.save();
};

ProductSchema.methods.restore = async function() {
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
};

ProductSchema.methods.belongsToCompany = function(companyId) {
    return this.companyId && this.companyId.toString() === companyId.toString();
};

ProductSchema.methods.updateStock = async function(quantity, updatedBy, reason = '') {
    this.stock += quantity;
    this.updatedBy = updatedBy;
    return this.save();
};

// ========== JSON TRANSFORM ==========
ProductSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        ret.formattedId = doc.formattedId;
        if (ret.deletedAt) ret.isDeleted = true;
        return ret;
    }
});

ProductSchema.set('toObject', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        ret.formattedId = doc.formattedId;
        if (ret.deletedAt) ret.isDeleted = true;
        return ret;
    }
});

// ========== EXPORT ==========
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
console.log('✅ Product model loaded successfully');

export default Product;