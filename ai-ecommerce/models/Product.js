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
        },
        sku: { // Stock Keeping Unit
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            uppercase: true,
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
        
        category: { 
            type: String, 
            required: [true, "Category is required"],
            index: true,
        },
        subCategory: {
            type: String,
            required: false,
        },
        brand: {
            type: String,
            required: false,
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
        },
        isFeatured: {
            type: Boolean,
            default: false,
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

// ✅ FIXED: Virtual for formatted ID - ONLY NUMBERS (00100 format)
ProductSchema.virtual('formattedId').get(function() {
    if (!this.customId) return '00000';
    // Pad with zeros to make it 5 digits
    return String(this.customId).padStart(5, '0');
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

// ✅ FIXED: Pre-save middleware with proper atomic counter increment
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
        
        // ✅ FIXED: Auto-generate customId for new products (starts from 100)
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
        
        next();
    } catch (error) {
        console.error('❌ Error in product pre-save:', error);
        next(error);
    }
});

// ✅ Post-save middleware to log creation
ProductSchema.post('save', function(doc) {
    console.log(`✅ Product saved: ${doc.productName} (ID: ${doc.formattedId})`);
});

// Indexes for better performance
ProductSchema.index({ productName: 'text', description: 'text' });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, subCategory: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ discountPrice: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ customId: 1 });

// ✅ Static method to get product by formatted ID
ProductSchema.statics.findByFormattedId = function(formattedId) {
    // Convert "00123" back to number 123
    const customId = parseInt(formattedId, 10);
    return this.findOne({ customId });
};

// ✅ Static method to get product by customId number
ProductSchema.statics.findByCustomId = function(customId) {
    return this.findOne({ customId });
};

// ✅ Static method to get next available customId
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

// ✅ Static method to get product count
ProductSchema.statics.getProductStats = async function() {
    const total = await this.countDocuments();
    const active = await this.countDocuments({ isActive: true });
    const lowStock = await this.countDocuments({ 
        stock: { $lte: 5 }, 
        stock: { $gt: 0 },
        isActive: true 
    });
    const outOfStock = await this.countDocuments({ stock: 0, isActive: true });
    
    return { total, active, lowStock, outOfStock };
};

// ✅ Instance method to get product info with formatted ID
ProductSchema.methods.getInfo = function() {
    return {
        id: this._id,
        customId: this.customId,
        formattedId: this.formattedId, // Returns "00123"
        name: this.productName,
        price: this.discountPrice,
        stock: this.stock,
        isActive: this.isActive
    };
};

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

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);