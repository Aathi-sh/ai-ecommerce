
// models/Category.js
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    // ===== SAAS MULTI-TENANCY (ADDED) =====
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, "Company ID is required"],
        index: true
    },
    
    // ===== AUDIT FIELDS (UPDATED) =====
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Created by user is required"]
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedBy: { // ADDED
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // ===== SOFT DELETE (ADDED) =====
    deletedAt: {
        type: Date,
        index: true
    },
    
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
        index: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('http') || v.startsWith('/uploads/');
            },
            message: 'Image must be a valid URL or upload path'
        }
    },
    icon: {
        type: String,
        default: '📦',
        maxlength: [10, 'Icon cannot exceed 10 characters']
    },
    displayOrder: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    productCount: {
        type: Number,
        default: 0,
        min: 0
    },
    metaTitle: {
        type: String,
        trim: true,
        maxlength: [100, 'Meta title cannot exceed 100 characters']
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: [300, 'Meta description cannot exceed 300 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ========== SAAS INDEXES (ADDED) ==========
CategorySchema.index({ companyId: 1, name: 1 }, { unique: true, name: 'company_name_unique_idx' });
CategorySchema.index({ companyId: 1, slug: 1 }, { unique: true, name: 'company_slug_unique_idx' });
CategorySchema.index({ companyId: 1, parentId: 1, displayOrder: 1 }, { name: 'company_parent_order_idx' });
CategorySchema.index({ companyId: 1, isActive: 1 }, { name: 'company_active_idx' });
CategorySchema.index({ companyId: 1, deletedAt: 1 }, { sparse: true, name: 'company_deleted_idx' });

// ========== KEEP YOUR EXISTING INDEXES ==========
CategorySchema.index({ name: 'text', description: 'text' });
CategorySchema.index({ parentId: 1, displayOrder: 1 });
CategorySchema.index({ createdAt: -1 });

// ========== VIRTUALS (ADDED) ==========
CategorySchema.virtual('auditInfo').get(function() {
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

CategorySchema.virtual('companyContext').get(function() {
    return {
        companyId: this.companyId,
        isolated: true
    };
});

// ========== KEEP YOUR EXISTING VIRTUALS ==========
CategorySchema.virtual('path').get(function() {
    return this.slug.split('-').join(' ');
});

CategorySchema.virtual('isMainCategory').get(function() {
    return !this.parentId;
});

CategorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId',
    match: { deletedAt: null }, // ADDED: Only show non-deleted
    options: { sort: { displayOrder: 1, name: 1 } }
});

CategorySchema.virtual('fullPath').get(async function() {
    const path = [];
    let current = this;
    
    while (current) {
        path.unshift(current.name);
        if (!current.parentId) break;
        current = await mongoose.model('Category').findOne({ 
            _id: current.parentId,
            companyId: this.companyId // ADDED: Company filter
        });
    }
    
    return path.join(' > ');
});

// ========== PRE-SAVE MIDDLEWARE (UPDATED) ==========
CategorySchema.pre('save', async function(next) {
    try {
        // Validate companyId
        if (!this.companyId) {
            return next(new Error('Company ID is required for category'));
        }
        
        if (!this.slug || this.isModified('name')) {
            // Generate base slug from name
            let baseSlug = this.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            
            if (!baseSlug || baseSlug.length === 0) {
                baseSlug = 'category';
            }
            
            this.slug = baseSlug;
            
            // Check for duplicate slug WITHIN COMPANY
            let slugExists = true;
            let counter = 1;
            
            while (slugExists) {
                const existing = await mongoose.model('Category').findOne({ 
                    companyId: this.companyId, // ADDED: Company filter
                    slug: this.slug,
                    _id: { $ne: this._id },
                    deletedAt: null
                });
                
                if (!existing) {
                    slugExists = false;
                } else {
                    if (counter < 10) {
                        this.slug = `${baseSlug}-${counter}`;
                    } else {
                        this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
                    }
                    counter++;
                }
            }
        }
        
        // Check if parent category exists in same company
        if (this.parentId) {
            const parentExists = await mongoose.model('Category').findOne({
                _id: this.parentId,
                companyId: this.companyId,
                deletedAt: null
            });
            
            if (!parentExists) {
                return next(new Error('Parent category not found in this company'));
            }
        }
        
        // Trim string fields
        if (this.name) this.name = this.name.trim();
        if (this.description) this.description = this.description.trim();
        if (this.metaTitle) this.metaTitle = this.metaTitle.trim();
        if (this.metaDescription) this.metaDescription = this.metaDescription.trim();
        
        next();
    } catch (error) {
        console.error('❌ Error in category pre-save:', error);
        next(error);
    }
});

// ========== PRE-UPDATE MIDDLEWARE (UPDATED) ==========
CategorySchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        const query = this.getQuery();
        
        // Get companyId from query
        let companyId = query.companyId;
        if (!companyId && query._id) {
            const category = await this.model.findOne(query).select('companyId');
            companyId = category?.companyId;
        }
        
        if (!companyId) {
            return next(new Error('Company context required for category update'));
        }
        
        // Check if parentId is being updated
        if (update.parentId || (update.$set && update.$set.parentId)) {
            const parentId = update.parentId || update.$set.parentId;
            const docId = this.getQuery()._id;
            
            // Prevent setting self as parent
            if (parentId && parentId.toString() === docId.toString()) {
                return next(new Error('Category cannot be its own parent'));
            }
            
            // Verify parent exists in same company
            if (parentId) {
                const parentExists = await this.model.findOne({
                    _id: parentId,
                    companyId,
                    deletedAt: null
                });
                
                if (!parentExists) {
                    return next(new Error('Parent category not found in this company'));
                }
            }
            
            // Check for circular reference
            if (parentId) {
                const Category = mongoose.model('Category');
                const descendants = await Category.find({ 
                    parentId: docId,
                    companyId 
                }).distinct('_id');
                
                if (descendants.some(id => id.toString() === parentId.toString())) {
                    return next(new Error('Cannot move category under its own subcategory'));
                }
            }
        }
        
        next();
    } catch (error) {
        console.error('❌ Error in category pre-update:', error);
        next(error);
    }
});

// ========== POST-SAVE MIDDLEWARE ==========
CategorySchema.post('save', function(doc) {
    console.log(`✅ Category saved: ${doc.name} for company ${doc.companyId}`);
});

// ========== STATIC METHODS (UPDATED WITH COMPANY CONTEXT) ==========

// Get category tree for a company
CategorySchema.statics.getTree = async function(companyId, includeInactive = false) {
    const query = { 
        companyId, 
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true })
    };
    
    const categories = await this.find(query)
        .sort({ displayOrder: 1, name: 1 })
        .lean();
    
    const tree = [];
    const map = {};
    
    categories.forEach(cat => {
        map[cat._id] = { ...cat, subcategories: [] };
    });
    
    categories.forEach(cat => {
        if (cat.parentId && map[cat.parentId]) {
            map[cat.parentId].subcategories.push(map[cat._id]);
        } else if (!cat.parentId) {
            tree.push(map[cat._id]);
        }
    });
    
    return tree;
};

// Get flat list with level indicators for a company
CategorySchema.statics.getFlatList = async function(companyId, includeInactive = false) {
    const query = { 
        companyId, 
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true })
    };
    
    const categories = await this.find(query)
        .sort({ displayOrder: 1, name: 1 })
        .lean();
    
    const result = [];
    const map = {};
    
    categories.forEach(cat => {
        map[cat._id] = { ...cat, subcategories: [] };
    });
    
    categories.forEach(cat => {
        if (cat.parentId && map[cat.parentId]) {
            map[cat.parentId].subcategories.push(map[cat._id]);
        }
    });
    
    const addWithLevel = (items, level = 0) => {
        items.forEach(item => {
            result.push({ 
                ...item, 
                level,
                indent: '—'.repeat(level)
            });
            if (item.subcategories?.length) {
                addWithLevel(item.subcategories, level + 1);
            }
        });
    };
    
    const roots = categories.filter(c => !c.parentId).map(c => map[c._id]);
    addWithLevel(roots);
    
    return result;
};

// Get category path (breadcrumb) within company
CategorySchema.statics.getCategoryPath = async function(companyId, categoryId) {
    const path = [];
    let currentId = categoryId;
    
    while (currentId) {
        const category = await this.findOne({ 
            _id: currentId, 
            companyId,
            deletedAt: null 
        }).select('name slug parentId');
        
        if (!category) break;
        
        path.unshift({
            _id: category._id,
            name: category.name,
            slug: category.slug
        });
        
        currentId = category.parentId;
    }
    
    return path;
};

// Get all descendants of a category within company
CategorySchema.statics.getAllDescendants = async function(companyId, categoryId) {
    const descendants = [];
    const findDescendants = async (id) => {
        const children = await this.find({ 
            parentId: id, 
            companyId,
            deletedAt: null 
        }).select('_id');
        
        for (const child of children) {
            descendants.push(child._id);
            await findDescendants(child._id);
        }
    };
    
    await findDescendants(categoryId);
    return descendants;
};

// Find categories by company
CategorySchema.statics.findByCompany = function(companyId) {
    return this.find({ companyId, deletedAt: null });
};

// Find active categories by company
CategorySchema.statics.findActiveByCompany = function(companyId) {
    return this.find({ 
        companyId, 
        isActive: true, 
        deletedAt: null 
    }).sort({ displayOrder: 1, name: 1 });
};

// ========== INSTANCE METHODS (UPDATED) ==========

// Check if belongs to company
CategorySchema.methods.belongsToCompany = function(companyId) {
    return this.companyId && this.companyId.toString() === companyId.toString();
};

// Soft delete
CategorySchema.methods.softDelete = async function(deletedBy) {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.isActive = false;
    return this.save();
};

// Restore soft deleted
CategorySchema.methods.restore = async function() {
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
};

// Get all parent categories up to root (within company)
CategorySchema.methods.getAllParents = async function() {
    const parents = [];
    let currentId = this.parentId;
    
    while (currentId) {
        const parent = await mongoose.model('Category').findOne({ 
            _id: currentId,
            companyId: this.companyId,
            deletedAt: null
        }).select('name slug parentId');
        
        if (!parent) break;
        
        parents.unshift(parent);
        currentId = parent.parentId;
    }
    
    return parents;
};

// Get all child categories (descendants) within company
CategorySchema.methods.getAllChildren = async function() {
    const children = [];
    const findChildren = async (parentId) => {
        const directChildren = await mongoose.model('Category').find({ 
            parentId, 
            companyId: this.companyId,
            deletedAt: null
        }).select('_id name');
        
        for (const child of directChildren) {
            children.push(child);
            await findChildren(child._id);
        }
    };
    
    await findChildren(this._id);
    return children;
};

// Get product count for this category (including subcategories) within company
CategorySchema.methods.getTotalProductCount = async function() {
    const Product = mongoose.model('Product');
    
    const descendantIds = await mongoose.model('Category').getAllDescendants(this.companyId, this._id);
    const allCategoryIds = [this._id, ...descendantIds];
    
    const count = await Product.countDocuments({
        companyId: this.companyId, // ADDED: Company filter
        deletedAt: null,
        $or: [
            { category: { $in: allCategoryIds } },
            { subCategory: { $in: allCategoryIds } }
        ]
    });
    
    return count;
};

// ========== KEEP YOUR EXISTING METHODS ==========
CategorySchema.methods.toggleActive = async function() {
    this.isActive = !this.isActive;
    await this.save();
    return this.isActive;
};

CategorySchema.methods.getInfo = function() {
    return {
        id: this._id,
        name: this.name,
        slug: this.slug,
        isMain: this.isMainCategory,
        parentId: this.parentId,
        productCount: this.productCount,
        isActive: this.isActive,
        displayOrder: this.displayOrder,
        icon: this.icon,
        companyId: this.companyId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// ========== EXPORT ==========
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export default Category;