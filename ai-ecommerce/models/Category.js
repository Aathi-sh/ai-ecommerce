// // models/Category.js
// import mongoose from 'mongoose';

// const CategorySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Category name is required'],
//         trim: true,
//         maxlength: [100, 'Name cannot exceed 100 characters'],
//         index: true
//     },
//     slug: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//         index: true
//     },
//     parentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Category',
//         default: null,
//         index: true
//     },
//     description: {
//         type: String,
//         trim: true,
//         maxlength: [500, 'Description cannot exceed 500 characters']
//     },
//     image: {
//         type: String,
//         default: null,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 // Basic URL validation
//                 return v.startsWith('http') || v.startsWith('/uploads/');
//             },
//             message: 'Image must be a valid URL or upload path'
//         }
//     },
//     icon: {
//         type: String,
//         default: '📦',
//         maxlength: [10, 'Icon cannot exceed 10 characters']
//     },
//     displayOrder: {
//         type: Number,
//         default: 0,
//         min: 0
//     },
//     isActive: {
//         type: Boolean,
//         default: true,
//         index: true
//     },
//     productCount: {
//         type: Number,
//         default: 0,
//         min: 0
//     },
//     metaTitle: {
//         type: String,
//         trim: true,
//         maxlength: [100, 'Meta title cannot exceed 100 characters']
//     },
//     metaDescription: {
//         type: String,
//         trim: true,
//         maxlength: [300, 'Meta description cannot exceed 300 characters']
//     },
//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     updatedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }
// }, {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

// // ========== VIRTUALS ==========

// // Virtual for getting full path (for breadcrumbs)
// CategorySchema.virtual('path').get(function() {
//     return this.slug.split('-').join(' ');
// });

// // Virtual for checking if it's a main category
// CategorySchema.virtual('isMainCategory').get(function() {
//     return !this.parentId;
// });

// // Virtual for getting subcategories (will be populated)
// CategorySchema.virtual('subcategories', {
//     ref: 'Category',
//     localField: '_id',
//     foreignField: 'parentId',
//     options: { sort: { displayOrder: 1, name: 1 } }
// });

// // Virtual for getting full hierarchical path
// CategorySchema.virtual('fullPath').get(async function() {
//     const path = [];
//     let current = this;
    
//     while (current) {
//         path.unshift(current.name);
//         if (!current.parentId) break;
//         current = await mongoose.model('Category').findById(current.parentId);
//     }
    
//     return path.join(' > ');
// });

// // ========== MIDDLEWARE ==========

// // Enhanced pre-save middleware with better slug generation
// CategorySchema.pre('save', async function(next) {
//     try {
//         if (this.isModified('name')) {
//             // Generate base slug from name
//             let baseSlug = this.name
//                 .toLowerCase()
//                 .replace(/[^a-z0-9]+/g, '-')
//                 .replace(/^-|-$/g, '');
            
//             // If no valid characters, use a default
//             if (!baseSlug || baseSlug.length === 0) {
//                 baseSlug = 'category';
//             }
            
//             this.slug = baseSlug;
            
//             // Check for duplicate slug
//             let slugExists = true;
//             let counter = 1;
            
//             while (slugExists) {
//                 const existing = await mongoose.model('Category').findOne({ 
//                     slug: this.slug,
//                     _id: { $ne: this._id }
//                 });
                
//                 if (!existing) {
//                     slugExists = false;
//                 } else {
//                     // Add suffix: -2, -3, etc. or random string for high counts
//                     if (counter < 10) {
//                         this.slug = `${baseSlug}-${counter}`;
//                     } else {
//                         this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
//                     }
//                     counter++;
//                 }
//             }
//         }
        
//         // Trim string fields
//         if (this.name) this.name = this.name.trim();
//         if (this.description) this.description = this.description.trim();
//         if (this.metaTitle) this.metaTitle = this.metaTitle.trim();
//         if (this.metaDescription) this.metaDescription = this.metaDescription.trim();
        
//         next();
//     } catch (error) {
//         console.error('❌ Error in category pre-save:', error);
//         next(error);
//     }
// });

// // Pre-update middleware to prevent circular references
// CategorySchema.pre('findOneAndUpdate', async function(next) {
//     try {
//         const update = this.getUpdate();
        
//         // Check if parentId is being updated
//         if (update.parentId || (update.$set && update.$set.parentId)) {
//             const parentId = update.parentId || update.$set.parentId;
//             const docId = this.getQuery()._id;
            
//             // Prevent setting self as parent
//             if (parentId && parentId.toString() === docId.toString()) {
//                 return next(new Error('Category cannot be its own parent'));
//             }
            
//             // Check for circular reference
//             if (parentId) {
//                 // Get all descendants of the target category
//                 const Category = mongoose.model('Category');
//                 const descendants = await Category.find({ parentId: docId }).distinct('_id');
                
//                 if (descendants.some(id => id.toString() === parentId.toString())) {
//                     return next(new Error('Cannot move category under its own subcategory'));
//                 }
//             }
//         }
        
//         next();
//     } catch (error) {
//         console.error('❌ Error in category pre-update:', error);
//         next(error);
//     }
// });

// // Post-save middleware to log creation
// CategorySchema.post('save', function(doc) {
//     console.log(`✅ Category saved: ${doc.name} (${doc.isMainCategory ? 'Main' : 'Sub'})`);
// });

// // Post-remove middleware to update children
// CategorySchema.post('remove', async function(doc) {
//     try {
//         // Update any categories that had this as parent to become main categories
//         await mongoose.model('Category').updateMany(
//             { parentId: doc._id },
//             { parentId: null }
//         );
//         console.log(`✅ Updated subcategories of deleted category: ${doc.name}`);
//     } catch (error) {
//         console.error('❌ Error updating subcategories after delete:', error);
//     }
// });

// // ========== INDEXES ==========
// // ✅ FIXED: Removed duplicate indexes to eliminate warnings

// // Text index for search (this is a special compound index, not a duplicate)
// CategorySchema.index({ name: 'text', description: 'text' });

// // Compound index for efficient queries
// CategorySchema.index({ parentId: 1, displayOrder: 1 });

// // Index for sorting by creation date
// CategorySchema.index({ createdAt: -1 });

// // ========== STATIC METHODS ==========

// // Get category tree (main categories with subcategories)
// CategorySchema.statics.getTree = async function(includeInactive = false) {
//     const query = includeInactive ? {} : { isActive: true };
    
//     const categories = await this.find(query)
//         .sort({ displayOrder: 1, name: 1 })
//         .lean();
    
//     const tree = [];
//     const map = {};
    
//     categories.forEach(cat => {
//         map[cat._id] = { ...cat, subcategories: [] };
//     });
    
//     categories.forEach(cat => {
//         if (cat.parentId && map[cat.parentId]) {
//             map[cat.parentId].subcategories.push(map[cat._id]);
//         } else if (!cat.parentId) {
//             tree.push(map[cat._id]);
//         }
//     });
    
//     return tree;
// };

// // Get flat list with level indicators
// CategorySchema.statics.getFlatList = async function(includeInactive = false) {
//     const query = includeInactive ? {} : { isActive: true };
    
//     const categories = await this.find(query)
//         .sort({ displayOrder: 1, name: 1 })
//         .lean();
    
//     const result = [];
//     const map = {};
    
//     categories.forEach(cat => {
//         map[cat._id] = { ...cat, subcategories: [] };
//     });
    
//     categories.forEach(cat => {
//         if (cat.parentId && map[cat.parentId]) {
//             map[cat.parentId].subcategories.push(map[cat._id]);
//         }
//     });
    
//     const addWithLevel = (items, level = 0) => {
//         items.forEach(item => {
//             result.push({ 
//                 ...item, 
//                 level,
//                 indent: '—'.repeat(level)
//             });
//             if (item.subcategories?.length) {
//                 addWithLevel(item.subcategories, level + 1);
//             }
//         });
//     };
    
//     const roots = categories.filter(c => !c.parentId).map(c => map[c._id]);
//     addWithLevel(roots);
    
//     return result;
// };

// // Get category path (breadcrumb)
// CategorySchema.statics.getCategoryPath = async function(categoryId) {
//     const path = [];
//     let currentId = categoryId;
    
//     while (currentId) {
//         const category = await this.findById(currentId).select('name slug parentId');
//         if (!category) break;
        
//         path.unshift({
//             _id: category._id,
//             name: category.name,
//             slug: category.slug
//         });
        
//         currentId = category.parentId;
//     }
    
//     return path;
// };

// // Get all descendants of a category
// CategorySchema.statics.getAllDescendants = async function(categoryId) {
//     const descendants = [];
//     const findDescendants = async (id) => {
//         const children = await this.find({ parentId: id }).select('_id');
//         for (const child of children) {
//             descendants.push(child._id);
//             await findDescendants(child._id);
//         }
//     };
    
//     await findDescendants(categoryId);
//     return descendants;
// };

// // Update product counts for all categories
// CategorySchema.statics.updateAllProductCounts = async function() {
//     const Product = mongoose.model('Product');
    
//     // Get counts for categories
//     const categoryCounts = await Product.aggregate([
//         { $match: { category: { $ne: null } } },
//         { $group: {
//             _id: '$category',
//             count: { $sum: 1 }
//         }}
//     ]);
    
//     // Get counts for subcategories
//     const subCategoryCounts = await Product.aggregate([
//         { $match: { subCategory: { $ne: null } } },
//         { $group: {
//             _id: '$subCategory',
//             count: { $sum: 1 }
//         }}
//     ]);
    
//     // Combine counts
//     const allCounts = {};
//     categoryCounts.forEach(item => { allCounts[item._id] = (allCounts[item._id] || 0) + item.count; });
//     subCategoryCounts.forEach(item => { allCounts[item._id] = (allCounts[item._id] || 0) + item.count; });
    
//     // Update all categories
//     const operations = Object.entries(allCounts).map(([id, count]) => ({
//         updateOne: {
//             filter: { _id: id },
//             update: { productCount: count }
//         }
//     }));
    
//     if (operations.length > 0) {
//         await this.bulkWrite(operations);
//     }
    
//     // Reset count for categories with no products
//     await this.updateMany(
//         { _id: { $nin: Object.keys(allCounts) } },
//         { productCount: 0 }
//     );
    
//     return { updated: operations.length };
// };

// // ========== INSTANCE METHODS ==========

// // Get all parent categories up to root
// CategorySchema.methods.getAllParents = async function() {
//     const parents = [];
//     let currentId = this.parentId;
    
//     while (currentId) {
//         const parent = await mongoose.model('Category').findById(currentId)
//             .select('name slug parentId');
//         if (!parent) break;
        
//         parents.unshift(parent);
//         currentId = parent.parentId;
//     }
    
//     return parents;
// };

// // Get all child categories (descendants)
// CategorySchema.methods.getAllChildren = async function() {
//     const children = [];
//     const findChildren = async (parentId) => {
//         const directChildren = await mongoose.model('Category').find({ parentId })
//             .select('_id name');
        
//         for (const child of directChildren) {
//             children.push(child);
//             await findChildren(child._id);
//         }
//     };
    
//     await findChildren(this._id);
//     return children;
// };

// // Get product count for this category (including subcategories)
// CategorySchema.methods.getTotalProductCount = async function() {
//     const Product = mongoose.model('Product');
    
//     // Get all descendant category IDs
//     const descendantIds = await mongoose.model('Category').getAllDescendants(this._id);
//     const allCategoryIds = [this._id, ...descendantIds];
    
//     // Count products in this category or any subcategory
//     const count = await Product.countDocuments({
//         $or: [
//             { category: { $in: allCategoryIds } },
//             { subCategory: { $in: allCategoryIds } }
//         ]
//     });
    
//     return count;
// };

// // Toggle active status
// CategorySchema.methods.toggleActive = async function() {
//     this.isActive = !this.isActive;
//     await this.save();
//     return this.isActive;
// };

// // Get category info with formatted data
// CategorySchema.methods.getInfo = function() {
//     return {
//         id: this._id,
//         name: this.name,
//         slug: this.slug,
//         isMain: this.isMainCategory,
//         parentId: this.parentId,
//         productCount: this.productCount,
//         isActive: this.isActive,
//         displayOrder: this.displayOrder,
//         icon: this.icon,
//         createdAt: this.createdAt,
//         updatedAt: this.updatedAt
//     };
// };

// // ========== EXPORT ==========

// // Check if model already exists to prevent overwrite
// const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// export default Category;






// above code is without saas










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