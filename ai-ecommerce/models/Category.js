// models/Category.js
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    // ===== SAAS MULTI-TENANCY =====
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, "Company ID is required"],
        index: true
    },
    
    // ===== AUDIT FIELDS =====
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Created by user is required"]
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // ===== SOFT DELETE =====
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

// ========== INDEXES ==========
CategorySchema.index({ companyId: 1, name: 1 }, { unique: true, name: 'company_name_unique_idx' });
CategorySchema.index({ companyId: 1, slug: 1 }, { unique: true, name: 'company_slug_unique_idx' });
CategorySchema.index({ companyId: 1, parentId: 1, displayOrder: 1 }, { name: 'company_parent_order_idx' });
CategorySchema.index({ companyId: 1, isActive: 1 }, { name: 'company_active_idx' });
CategorySchema.index({ companyId: 1, deletedAt: 1 }, { sparse: true, name: 'company_deleted_idx' });
CategorySchema.index({ name: 'text', description: 'text' });
CategorySchema.index({ parentId: 1, displayOrder: 1 });
CategorySchema.index({ createdAt: -1 });

// ========== VIRTUALS ==========
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
    match: { deletedAt: null },
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
            companyId: this.companyId,
            deletedAt: null
        });
    }
    
    return path.join(' > ');
});

// ========== PRE-SAVE MIDDLEWARE ==========
CategorySchema.pre('save', async function(next) {
    try {
        if (!this.companyId) {
            return next(new Error('Company ID is required for category'));
        }
        
        if (!this.slug || this.isModified('name')) {
            let baseSlug = this.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            
            if (!baseSlug || baseSlug.length === 0) {
                baseSlug = 'category';
            }
            
            this.slug = baseSlug;
            
            let slugExists = true;
            let counter = 1;
            
            while (slugExists) {
                const existing = await mongoose.model('Category').findOne({ 
                    companyId: this.companyId,
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

// ========== PRE-UPDATE MIDDLEWARE ==========
CategorySchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        const query = this.getQuery();
        
        let companyId = query.companyId;
        if (!companyId && query._id) {
            const category = await this.model.findOne(query).select('companyId');
            companyId = category?.companyId;
        }
        
        if (!companyId) {
            return next(new Error('Company context required for category update'));
        }
        
        if (update.parentId || (update.$set && update.$set.parentId)) {
            const parentId = update.parentId || update.$set.parentId;
            const docId = this.getQuery()._id;
            
            if (parentId && parentId.toString() === docId.toString()) {
                return next(new Error('Category cannot be its own parent'));
            }
            
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

// ========== STATIC METHODS ==========

// Update all product counts for categories
CategorySchema.statics.updateAllProductCounts = async function(companyId) {
    try {
        if (!companyId) {
            console.log('No companyId provided to updateAllProductCounts');
            return false;
        }
        
        const categories = await this.find({ 
            companyId, 
            deletedAt: null 
        }).select('_id');
        
        if (categories.length === 0) {
            console.log(`No categories found for company ${companyId}`);
            return true;
        }
        
        const Product = mongoose.model('Product');
        
        let updatedCount = 0;
        for (const category of categories) {
            const productCount = await Product.countDocuments({
                companyId,
                $or: [
                    { category: category._id },
                    { subCategory: category._id }
                ],
                deletedAt: null
            });
            
            await this.updateOne(
                { _id: category._id },
                { productCount }
            );
            updatedCount++;
        }
        
        console.log(`✅ Updated product counts for ${updatedCount} categories in company ${companyId}`);
        return true;
    } catch (error) {
        console.error('❌ Error in updateAllProductCounts:', error);
        return false;
    }
};

// ========== FIXED: Get category tree for a company ==========
CategorySchema.statics.getTree = async function(companyId, includeInactive = false) {
    // CRITICAL FIX: Validate companyId
    if (!companyId) {
        console.error('❌ getTree called without companyId');
        return [];
    }
    
    try {
        // Convert companyId to ObjectId if it's a string
        const companyObjectId = typeof companyId === 'string' 
            ? new mongoose.Types.ObjectId(companyId) 
            : companyId;
        
        const query = { 
            companyId: companyObjectId, 
            deletedAt: null
        };
        
        const categories = await this.find(query)
            .sort({ displayOrder: 1, name: 1 })
            .lean();
        
        if (categories.length === 0) {
            return [];
        }
        
        // Build map of all categories
        const map = {};
        categories.forEach(cat => {
            map[cat._id.toString()] = { 
                ...cat, 
                _id: cat._id,
                subcategories: []
            };
        });
        
        // Build tree structure
        const tree = [];
        
        categories.forEach(cat => {
            const catId = cat._id.toString();
            const isVisible = includeInactive ? true : cat.isActive === true;
            
            if (cat.parentId && map[cat.parentId.toString()]) {
                if (isVisible) {
                    map[cat.parentId.toString()].subcategories.push(map[catId]);
                }
            } else if (!cat.parentId) {
                if (isVisible) {
                    tree.push(map[catId]);
                }
            }
        });
        
        // Recursively sort subcategories
        const sortSubcategories = (nodes) => {
            nodes.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            nodes.forEach(node => {
                if (node.subcategories && node.subcategories.length > 0) {
                    sortSubcategories(node.subcategories);
                }
            });
            return nodes;
        };
        
        return sortSubcategories(tree);
    } catch (error) {
        console.error('❌ Error in getTree:', error);
        return [];
    }
};

// ========== FIXED: Get flat list with level indicators ==========
CategorySchema.statics.getFlatList = async function(companyId, includeInactive = false) {
    if (!companyId) {
        console.error('❌ getFlatList called without companyId');
        return [];
    }
    
    try {
        const tree = await this.getTree(companyId, includeInactive);
        
        const buildFlatList = (items, level = 0, result = []) => {
            for (const item of items) {
                result.push({ 
                    ...item, 
                    level,
                    indent: '—'.repeat(level)
                });
                if (item.subcategories && item.subcategories.length > 0) {
                    buildFlatList(item.subcategories, level + 1, result);
                }
            }
            return result;
        };
        
        return buildFlatList(tree);
    } catch (error) {
        console.error('❌ Error in getFlatList:', error);
        return [];
    }
};

// Get category path (breadcrumb) within company
CategorySchema.statics.getCategoryPath = async function(companyId, categoryId) {
    if (!companyId || !categoryId) {
        return [];
    }
    
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
    if (!companyId || !categoryId) {
        return [];
    }
    
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
    if (!companyId) return [];
    return this.find({ companyId, deletedAt: null });
};

// Find active categories by company
CategorySchema.statics.findActiveByCompany = function(companyId) {
    if (!companyId) return [];
    return this.find({ 
        companyId, 
        isActive: true, 
        deletedAt: null 
    }).sort({ displayOrder: 1, name: 1 });
};

// ========== INSTANCE METHODS ==========

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
        companyId: this.companyId,
        deletedAt: null,
        $or: [
            { category: { $in: allCategoryIds } },
            { subCategory: { $in: allCategoryIds } }
        ]
    });
    
    return count;
};

// Toggle active status
CategorySchema.methods.toggleActive = async function() {
    this.isActive = !this.isActive;
    await this.save();
    return this.isActive;
};

// Get category info
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