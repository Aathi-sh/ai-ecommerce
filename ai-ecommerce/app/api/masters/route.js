// app/api/masters/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import Category from '@/models/Category';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// ========== MASTER TYPES ==========
const MASTER_TYPES = {
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    STATS: 'stats',
    RECENT: 'recent'
};

// ✅ Helper function to validate ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) && 
           /^[0-9a-fA-F]{24}$/.test(id);
};

// ========== GET HANDLER ==========
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);
        const skip = (page - 1) * limit;
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const lowStock = searchParams.get('lowStock') === 'true';
        const format = searchParams.get('format'); // for categories: 'tree' or 'flat'
        const parentId = searchParams.get('parentId');
        const includeInactive = searchParams.get('includeInactive') === 'true';

        // ===== GET STATS FOR CATEGORIES AND PRODUCTS =====
        if (type === MASTER_TYPES.STATS) {
            // Get category stats
            const totalCategories = await Category.countDocuments();
            const activeCategories = await Category.countDocuments({ isActive: true });
            const mainCategories = await Category.countDocuments({ parentId: null });
            const subCategories = await Category.countDocuments({ parentId: { $ne: null } });

            // Get product stats
            const totalProducts = await Product.countDocuments();
            const activeProducts = await Product.countDocuments({ isActive: true });
            const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5, $gt: 0 } });
            const outOfStockProducts = await Product.countDocuments({ stock: 0 });

            // Get category distribution
            const categoryDistribution = await Product.aggregate([
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

            return NextResponse.json({
                success: true,
                data: {
                    categories: {
                        total: totalCategories,
                        active: activeCategories,
                        inactive: totalCategories - activeCategories,
                        main: mainCategories,
                        sub: subCategories
                    },
                    products: {
                        total: totalProducts,
                        active: activeProducts,
                        inactive: totalProducts - activeProducts,
                        lowStock: lowStockProducts,
                        outOfStock: outOfStockProducts
                    },
                    distribution: {
                        topCategories: categoryDistribution
                    }
                }
            });
        }

        // ===== GET RECENT ITEMS ACROSS CATEGORIES AND PRODUCTS =====
        if (type === MASTER_TYPES.RECENT) {
            const recentLimit = parseInt(searchParams.get('limit')) || 10;
            
            const [recentCategories, recentProducts] = await Promise.all([
                Category.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('name createdAt parentId')
                    .lean(),
                Product.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('productName createdAt discountPrice category')
                    .populate('category', 'name')
                    .lean()
            ]);

            const recentItems = [
                ...recentCategories.map(c => ({
                    id: c._id,
                    title: c.name,
                    type: c.parentId ? 'subcategory' : 'category',
                    path: `/admin/masters/categories?id=${c._id}`,
                    color: '#3b82f6',
                    timeAgo: getTimeAgo(c.createdAt),
                    createdAt: c.createdAt
                })),
                ...recentProducts.map(p => ({
                    id: p._id,
                    title: p.productName,
                    type: 'product',
                    path: `/admin/masters/products?id=${p._id}`,
                    color: '#10b981',
                    timeAgo: getTimeAgo(p.createdAt),
                    createdAt: p.createdAt,
                    subtitle: `₹${p.discountPrice}`,
                    category: p.category?.name || 'Uncategorized'
                }))
            ];

            // Sort by createdAt and limit
            recentItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            return NextResponse.json({
                success: true,
                data: recentItems.slice(0, recentLimit)
            });
        }

        // ===== CATEGORIES =====
        if (type === MASTER_TYPES.CATEGORIES) {
            if (id) {
                // ✅ Validate ID
                if (!isValidObjectId(id)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid category ID format'
                    }, { status: 400 });
                }

                const category = await Category.findById(id)
                    .populate({
                        path: 'subcategories',
                        options: { sort: { displayOrder: 1, name: 1 } }
                    })
                    .lean();

                if (!category) {
                    return NextResponse.json({
                        success: false,
                        message: 'Category not found'
                    }, { status: 404 });
                }

                if (category.parentId) {
                    category.parent = await Category.findById(category.parentId)
                        .select('name slug')
                        .lean();
                }

                // Get product count for this category
                const productCount = await Product.countDocuments({ category: category._id });

                // Get subcategory count
                const subCategoryCount = await Category.countDocuments({ parentId: category._id });

                // Get full path for breadcrumb
                const path = await Category.getCategoryPath(category._id);

                return NextResponse.json({
                    success: true,
                    data: {
                        ...category,
                        productCount,
                        subCategoryCount,
                        path
                    }
                });
            }

            let query = {};
            
            if (status === 'active') query.isActive = true;
            else if (status === 'inactive') query.isActive = false;
            
            if (parentId !== undefined && parentId !== null) {
                if (parentId === 'null') {
                    query.parentId = null;
                } else if (isValidObjectId(parentId)) {
                    query.parentId = parentId;
                }
            }
            
            if (search && search.trim()) {
                const searchTerm = search.trim();
                query.$or = [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ];
            }

            const total = await Category.countDocuments(query);
            
            // Get categories with pagination
            let categories = await Category.find(query)
                .sort({ displayOrder: 1, name: 1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // Get product counts for each category
            const categoryIds = categories.map(c => c._id);
            const productCounts = await Product.aggregate([
                { $match: { category: { $in: categoryIds } } },
                { $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }}
            ]);

            // Get subcategory counts
            const subCounts = await Category.aggregate([
                { $match: { parentId: { $in: categoryIds } } },
                { $group: {
                    _id: '$parentId',
                    count: { $sum: 1 }
                }}
            ]);

            const productCountMap = {};
            productCounts.forEach(item => {
                productCountMap[item._id] = item.count;
            });

            const subCountMap = {};
            subCounts.forEach(item => {
                subCountMap[item._id] = item.count;
            });

            categories = categories.map(cat => ({
                ...cat,
                productCount: productCountMap[cat._id] || 0,
                subCategoryCount: subCountMap[cat._id] || 0
            }));

            // Tree format
            if (format === 'tree') {
                const tree = await Category.getTree(includeInactive);
                
                return NextResponse.json({
                    success: true,
                    data: tree,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                });
            }

            // Flat format with levels
            if (format === 'flat') {
                const flatList = await Category.getFlatList(includeInactive);
                
                return NextResponse.json({
                    success: true,
                    data: flatList,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                });
            }

            return NextResponse.json({
                success: true,
                data: categories,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }

        // ===== PRODUCTS =====
        if (type === MASTER_TYPES.PRODUCTS) {
            if (id) {
                // ✅ Validate ID
                if (!isValidObjectId(id)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid product ID format'
                    }, { status: 400 });
                }

                const product = await Product.findById(id)
                    .populate('category', 'name slug')
                    .populate('subCategory', 'name slug')
                    .lean();

                if (!product) {
                    return NextResponse.json({
                        success: false,
                        message: 'Product not found'
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: product
                });
            }

            // ✅ FIXED: Build query properly
            let query = {};
            
            // ✅ Handle status filter correctly
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
            // If status is 'all' or not provided, don't add isActive filter
            
            // ✅ Category filter with validation
            if (category && category !== 'all' && category !== 'null') {
                if (isValidObjectId(category)) {
                    query.category = new mongoose.Types.ObjectId(category);
                }
            }
            
            // ✅ Search with proper handling
            if (search && search.trim()) {
                const searchTerm = search.trim();
                
                // First, find category IDs that match the search term
                let matchingCategories = [];
                if (searchTerm.length < 50) {
                    try {
                        matchingCategories = await Category.find({
                            $or: [
                                { name: { $regex: searchTerm, $options: 'i' } },
                                { description: { $regex: searchTerm, $options: 'i' } }
                            ]
                        }).distinct('_id');
                    } catch (err) {
                        console.warn('Category search error:', err.message);
                    }
                }
                
                query.$or = [
                    { productName: { $regex: searchTerm, $options: 'i' } },
                    { sku: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { brand: { $regex: searchTerm, $options: 'i' } }
                ];
                
                if (matchingCategories.length > 0) {
                    query.$or.push({ category: { $in: matchingCategories } });
                    query.$or.push({ subCategory: { $in: matchingCategories } });
                }
            }

            // Price range filter
            if (minPrice || maxPrice) {
                query.discountPrice = {};
                if (minPrice && !isNaN(parseFloat(minPrice))) {
                    query.discountPrice.$gte = parseFloat(minPrice);
                }
                if (maxPrice && !isNaN(parseFloat(maxPrice))) {
                    query.discountPrice.$lte = parseFloat(maxPrice);
                }
            }

            if (lowStock) {
                query.stock = { $lte: 5, $gt: 0 };
            }

            if (fromDate || toDate) {
                query.createdAt = {};
                if (fromDate) query.createdAt.$gte = new Date(fromDate);
                if (toDate) {
                    const endDate = new Date(toDate);
                    endDate.setHours(23, 59, 59, 999);
                    query.createdAt.$lte = endDate;
                }
            }

            const total = await Product.countDocuments(query);
            const products = await Product.find(query)
                .populate('category', 'name slug')
                .populate('subCategory', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // Get summary stats
            const summary = await Product.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ['$discountPrice', '$stock'] } },
                        avgPrice: { $avg: '$discountPrice' },
                        minPrice: { $min: '$discountPrice' },
                        maxPrice: { $max: '$discountPrice' },
                        totalStock: { $sum: '$stock' }
                    }
                }
            ]);

            return NextResponse.json({
                success: true,
                data: products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                },
                summary: summary[0] || {
                    totalValue: 0,
                    avgPrice: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    totalStock: 0
                }
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid type parameter. Use: categories, products, stats, or recent'
        }, { status: 400 });

    } catch (error) {
        console.error('GET masters error:', error);
        
        // Handle specific error types
        if (error.name === 'CastError') {
            return NextResponse.json({
                success: false,
                message: 'Invalid ID format in query',
                error: 'Please provide valid identifiers'
            }, { status: 400 });
        }
        
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch data',
            error: error.message
        }, { status: 500 });
    }
}

// ========== POST HANDLER (CREATE) ==========
export async function POST(request) {
    try {
        await connectDB();
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const body = await request.json();

        // ===== CREATE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            if (!body.name) {
                return NextResponse.json({
                    success: false,
                    message: 'Category name is required'
                }, { status: 400 });
            }

            // ✅ Generate slug from name
            const slug = body.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Check for duplicate slug
            const existingSlug = await Category.findOne({ slug });
            const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

            if (body.parentId) {
                if (!isValidObjectId(body.parentId)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid parent category ID format'
                    }, { status: 400 });
                }
                
                const parentExists = await Category.findById(body.parentId);
                if (!parentExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Parent category not found'
                    }, { status: 400 });
                }
            }

            const existing = await Category.findOne({
                name: body.name,
                parentId: body.parentId || null
            });

            if (existing) {
                return NextResponse.json({
                    success: false,
                    message: body.parentId 
                        ? 'Subcategory already exists under this parent'
                        : 'Category already exists'
                }, { status: 409 });
            }

            const category = await Category.create({
                name: body.name,
                slug: finalSlug, // ✅ Add the generated slug
                description: body.description || '',
                parentId: body.parentId || null,
                image: body.image || null,
                icon: body.icon || '📦',
                displayOrder: body.displayOrder || 0,
                isActive: body.isActive !== false,
                metaTitle: body.metaTitle || body.name,
                metaDescription: body.metaDescription || body.description || '',
                createdBy: session?.user?.id || 'system'
            });

            return NextResponse.json({
                success: true,
                message: body.parentId ? 'Subcategory created successfully' : 'Category created successfully',
                data: category
            }, { status: 201 });
        }

        // ===== CREATE PRODUCT =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const required = ['productName', 'category', 'mrp', 'discountPrice', 'stock', 'sku', 'hsnCode', 'gstRate'];
            const missing = required.filter(field => !body[field]);
            
            if (missing.length > 0) {
                return NextResponse.json({
                    success: false,
                    message: `Missing required fields: ${missing.join(', ')}`
                }, { status: 400 });
            }

            // ✅ Validate category ID
            if (!isValidObjectId(body.category)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid category ID format'
                }, { status: 400 });
            }

            // Check category exists
            const category = await Category.findById(body.category);
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found'
                }, { status: 400 });
            }

            // Check subCategory if provided
            if (body.subCategory) {
                if (!isValidObjectId(body.subCategory)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid subCategory ID format'
                    }, { status: 400 });
                }
                
                const subCategory = await Category.findById(body.subCategory);
                if (!subCategory) {
                    return NextResponse.json({
                        success: false,
                        message: 'SubCategory not found'
                    }, { status: 400 });
                }
                
                // Verify subCategory belongs to category
                if (subCategory.parentId?.toString() !== body.category.toString()) {
                    return NextResponse.json({
                        success: false,
                        message: 'SubCategory does not belong to selected category'
                    }, { status: 400 });
                }
            }

            // Check SKU uniqueness
            const existing = await Product.findOne({ sku: body.sku.toUpperCase() });
            if (existing) {
                return NextResponse.json({
                    success: false,
                    message: 'Product with this SKU already exists'
                }, { status: 409 });
            }

            // Generate slug
            const slug = body.productName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Check slug uniqueness
            const existingSlug = await Product.findOne({ slug });
            if (existingSlug) {
                body.slug = `${slug}-${Date.now().toString().slice(-4)}`;
            } else {
                body.slug = slug;
            }

            const product = await Product.create({
                ...body,
                sku: body.sku.toUpperCase(),
                isOnSale: body.discountPrice < body.mrp,
                createdBy: session?.user?.id || 'system'
            });

            // Update product count for category
            await Category.updateAllProductCounts();

            return NextResponse.json({
                success: true,
                message: 'Product created successfully',
                data: product
            }, { status: 201 });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid type parameter'
        }, { status: 400 });

    } catch (error) {
        console.error('POST masters error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({
                success: false,
                message: `Duplicate value for ${field}`
            }, { status: 409 });
        }

        return NextResponse.json({
            success: false,
            message: 'Failed to create',
            error: error.message
        }, { status: 500 });
    }
}

// ========== PUT HANDLER (UPDATE) ==========
export async function PUT(request) {
    try {
        await connectDB();
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        const body = await request.json();

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required'
            }, { status: 400 });
        }

        // ✅ Validate ID
        if (!isValidObjectId(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid ID format'
            }, { status: 400 });
        }

        // ===== UPDATE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const category = await Category.findById(id);
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found'
                }, { status: 404 });
            }

            // Check circular reference
            if (body.parentId === id) {
                return NextResponse.json({
                    success: false,
                    message: 'Category cannot be its own parent'
                }, { status: 400 });
            }

            // Check if parent exists
            if (body.parentId) {
                if (!isValidObjectId(body.parentId)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid parent category ID format'
                    }, { status: 400 });
                }
                
                const parentExists = await Category.findById(body.parentId);
                if (!parentExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Parent category not found'
                    }, { status: 400 });
                }

                // Check if trying to move under its own child
                const descendants = await Category.find({ parentId: id }).distinct('_id');
                if (descendants.some(d => d.toString() === body.parentId.toString())) {
                    return NextResponse.json({
                        success: false,
                        message: 'Cannot move category under its own subcategory'
                    }, { status: 400 });
                }
            }

            // Check duplicate name
            if (body.name && body.name !== category.name) {
                const duplicate = await Category.findOne({
                    name: body.name,
                    parentId: body.parentId !== undefined ? body.parentId : category.parentId,
                    _id: { $ne: id }
                });

                if (duplicate) {
                    return NextResponse.json({
                        success: false,
                        message: body.parentId 
                            ? 'Subcategory already exists under this parent'
                            : 'Category already exists'
                    }, { status: 409 });
                }
            }

            const updated = await Category.findByIdAndUpdate(
                id,
                {
                    name: body.name || category.name,
                    description: body.description !== undefined ? body.description : category.description,
                    parentId: body.parentId !== undefined ? body.parentId : category.parentId,
                    image: body.image !== undefined ? body.image : category.image,
                    icon: body.icon || category.icon,
                    displayOrder: body.displayOrder !== undefined ? body.displayOrder : category.displayOrder,
                    isActive: body.isActive !== undefined ? body.isActive : category.isActive,
                    metaTitle: body.metaTitle || category.metaTitle,
                    metaDescription: body.metaDescription !== undefined ? body.metaDescription : category.metaDescription,
                    updatedBy: session?.user?.id || 'system'
                },
                { new: true }
            );

            return NextResponse.json({
                success: true,
                message: 'Category updated successfully',
                data: updated
            });
        }

        // ===== UPDATE PRODUCT =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const product = await Product.findById(id);
            if (!product) {
                return NextResponse.json({
                    success: false,
                    message: 'Product not found'
                }, { status: 404 });
            }

            // Check SKU uniqueness if changed
            if (body.sku && body.sku !== product.sku) {
                const existing = await Product.findOne({ sku: body.sku.toUpperCase() });
                if (existing) {
                    return NextResponse.json({
                        success: false,
                        message: 'Product with this SKU already exists'
                    }, { status: 409 });
                }
            }

            // Validate category if changed
            if (body.category && body.category !== product.category?.toString()) {
                if (!isValidObjectId(body.category)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid category ID format'
                    }, { status: 400 });
                }
                
                const categoryExists = await Category.findById(body.category);
                if (!categoryExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Category not found'
                    }, { status: 400 });
                }
            }

            // Validate subCategory if changed
            if (body.subCategory) {
                if (!isValidObjectId(body.subCategory)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid subCategory ID format'
                    }, { status: 400 });
                }
                
                const subCategory = await Category.findById(body.subCategory);
                if (!subCategory) {
                    return NextResponse.json({
                        success: false,
                        message: 'SubCategory not found'
                    }, { status: 400 });
                }
                
                const categoryId = body.category || product.category;
                if (subCategory.parentId?.toString() !== categoryId?.toString()) {
                    return NextResponse.json({
                        success: false,
                        message: 'SubCategory does not belong to selected category'
                    }, { status: 400 });
                }
            }

            const updated = await Product.findByIdAndUpdate(
                id,
                {
                    ...body,
                    sku: body.sku?.toUpperCase(),
                    isOnSale: body.discountPrice ? body.discountPrice < (body.mrp || product.mrp) : product.isOnSale,
                    updatedBy: session?.user?.id || 'system'
                },
                { new: true }
            ).populate('category', 'name slug')
             .populate('subCategory', 'name slug');

            // Update product counts
            await Category.updateAllProductCounts();

            return NextResponse.json({
                success: true,
                message: 'Product updated successfully',
                data: updated
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid type parameter'
        }, { status: 400 });

    } catch (error) {
        console.error('PUT masters error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({
                success: false,
                message: `Duplicate value for ${field}`
            }, { status: 409 });
        }

        return NextResponse.json({
            success: false,
            message: 'Failed to update',
            error: error.message
        }, { status: 500 });
    }
}

// ========== DELETE HANDLER ==========
export async function DELETE(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        const ids = searchParams.get('ids')?.split(',');

        if (!id && !ids) {
            return NextResponse.json({
                success: false,
                message: 'ID or IDs required'
            }, { status: 400 });
        }

        // ===== DELETE CATEGORIES =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const deleteIds = ids || [id];
            
            // ✅ Validate all IDs
            const validIds = deleteIds.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid category IDs provided'
                }, { status: 400 });
            }

            // Check if categories have products
            const categoriesWithProducts = await Product.distinct('category', {
                category: { $in: validIds }
            });

            if (categoriesWithProducts.length > 0) {
                const categories = await Category.find({
                    _id: { $in: categoriesWithProducts }
                }).select('name');

                return NextResponse.json({
                    success: false,
                    message: 'Cannot delete categories that have products',
                    categories: categories.map(c => c.name)
                }, { status: 409 });
            }

            // Check if categories have subcategories
            const categoriesWithSubs = await Category.find({
                parentId: { $in: validIds }
            }).distinct('parentId');

            if (categoriesWithSubs.length > 0) {
                const categories = await Category.find({
                    _id: { $in: categoriesWithSubs }
                }).select('name');

                return NextResponse.json({
                    success: false,
                    message: 'Cannot delete categories that have subcategories',
                    categories: categories.map(c => c.name)
                }, { status: 409 });
            }

            await Category.deleteMany({ _id: { $in: validIds } });

            return NextResponse.json({
                success: true,
                message: `Successfully deleted ${validIds.length} categories`
            });
        }

        // ===== DELETE PRODUCTS =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const deleteIds = ids || [id];
            
            // ✅ Validate all IDs
            const validIds = deleteIds.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid product IDs provided'
                }, { status: 400 });
            }
            
            // Check if products are in orders
            const Order = (await import('@/models/Order')).default;
            const productsInOrders = await Order.distinct('items.productId', {
                'items.productId': { $in: validIds }
            });

            if (productsInOrders.length > 0) {
                return NextResponse.json({
                    success: false,
                    message: 'Cannot delete products that are in orders'
                }, { status: 409 });
            }

            await Product.deleteMany({ _id: { $in: validIds } });

            // Update product counts after deletion
            await Category.updateAllProductCounts();

            return NextResponse.json({
                success: true,
                message: `Successfully deleted ${validIds.length} products`
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid type parameter'
        }, { status: 400 });

    } catch (error) {
        console.error('DELETE masters error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete',
            error: error.message
        }, { status: 500 });
    }
}

// ========== PATCH HANDLER (PARTIAL UPDATES) ==========
export async function PATCH(request) {
    try {
        await connectDB();
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const body = await request.json();

        // ===== TOGGLE ACTIVE STATUS =====
        if (body.action === 'toggle-status') {
            const { id, isActive } = body;

            if (!isValidObjectId(id)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid ID format'
                }, { status: 400 });
            }

            let Model;
            let modelName;
            
            if (type === MASTER_TYPES.CATEGORIES) {
                Model = Category;
                modelName = 'Category';
            } else if (type === MASTER_TYPES.PRODUCTS) {
                Model = Product;
                modelName = 'Product';
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid type for toggle'
                }, { status: 400 });
            }

            const item = await Model.findByIdAndUpdate(
                id,
                { 
                    isActive, 
                    updatedBy: session?.user?.id || 'system' 
                },
                { new: true }
            );

            if (!item) {
                return NextResponse.json({
                    success: false,
                    message: `${modelName} not found`
                }, { status: 404 });
            }

            // Update product counts if toggling category
            if (type === MASTER_TYPES.CATEGORIES) {
                await Category.updateAllProductCounts();
            }

            return NextResponse.json({
                success: true,
                message: `${modelName} ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: item
            });
        }

        // ===== BULK UPDATE =====
        if (body.action === 'bulk-update') {
            const { ids, data } = body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No IDs provided'
                }, { status: 400 });
            }

            // ✅ Validate all IDs
            const validIds = ids.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid IDs provided'
                }, { status: 400 });
            }

            let Model;
            let modelName;
            
            if (type === MASTER_TYPES.CATEGORIES) {
                Model = Category;
                modelName = 'Category';
            } else if (type === MASTER_TYPES.PRODUCTS) {
                Model = Product;
                modelName = 'Product';
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid type for bulk update'
                }, { status: 400 });
            }

            const result = await Model.updateMany(
                { _id: { $in: validIds } },
                { 
                    $set: { 
                        ...data, 
                        updatedBy: session?.user?.id || 'system' 
                    } 
                }
            );

            if (type === MASTER_TYPES.CATEGORIES) {
                await Category.updateAllProductCounts();
            }

            return NextResponse.json({
                success: true,
                message: `Successfully updated ${result.modifiedCount} ${modelName.toLowerCase()}s`
            });
        }

        // ===== REORDER CATEGORIES =====
        if (body.action === 'reorder' && type === MASTER_TYPES.CATEGORIES) {
            const { items } = body; // [{ id: '...', displayOrder: 1 }]

            if (!items || !Array.isArray(items)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid reorder data'
                }, { status: 400 });
            }

            // ✅ Validate all IDs in reorder
            const validItems = items.filter(item => isValidObjectId(item.id));
            
            if (validItems.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid category IDs for reorder'
                }, { status: 400 });
            }

            const operations = validItems.map(item => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { 
                        $set: { 
                            displayOrder: item.displayOrder,
                            updatedBy: session?.user?.id || 'system'
                        }
                    }
                }
            }));

            await Category.bulkWrite(operations);

            return NextResponse.json({
                success: true,
                message: 'Categories reordered successfully'
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('PATCH masters error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update',
            error: error.message
        }, { status: 500 });
    }
}

// ========== HELPER FUNCTION ==========
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
}

// ========== OPTIONS HANDLER ==========
export async function OPTIONS() {
    return NextResponse.json({
        success: true,
        message: 'Masters API - Categories and Products only',
        types: ['categories', 'products', 'stats', 'recent'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        description: 'Unified API for Categories and Products management',
        endpoints: {
            GET: {
                description: 'Fetch data',
                examples: [
                    '/api/masters?type=categories',
                    '/api/masters?type=categories&format=tree',
                    '/api/masters?type=products&id=123',
                    '/api/masters?type=stats',
                    '/api/masters?type=recent'
                ]
            },
            POST: {
                description: 'Create new item',
                examples: [
                    '/api/masters?type=categories -d {"name":"Electronics"}',
                    '/api/masters?type=categories -d {"name":"Mobile Phones","parentId":"cat_id"}',
                    '/api/masters?type=products -d {"productName":"iPhone","category":"123","mrp":999,"discountPrice":899,"stock":10,"sku":"IPHONE15","hsnCode":"8517","gstRate":18}'
                ]
            },
            PUT: {
                description: 'Update existing item',
                examples: [
                    '/api/masters?type=products&id=123 -d {"discountPrice":899}'
                ]
            },
            DELETE: {
                description: 'Delete single or multiple items',
                examples: [
                    '/api/masters?type=categories&id=123',
                    '/api/masters?type=products&ids=id1,id2,id3'
                ]
            },
            PATCH: {
                description: 'Partial updates',
                examples: [
                    '/api/masters?type=products -d {"action":"toggle-status","id":"123","isActive":false}',
                    '/api/masters?type=categories -d {"action":"reorder","items":[{"id":"123","displayOrder":1}]}'
                ]
            }
        }
    });
}