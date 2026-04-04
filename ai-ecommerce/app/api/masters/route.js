// app/api/masters/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import Category from '@/models/Category';
import Product from '@/models/Product';  
import Company from '@/models/Company';
import mongoose from 'mongoose';

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// ========== DEBUG CONFIGURATION ==========
const DEBUG = process.env.NODE_ENV !== 'production'; // Auto-disable in production

// Enhanced debug logger with timestamps
const logDebug = (module, action, message, data = null) => {
    if (DEBUG) {
        const timestamp = new Date().toISOString().split('T')[1];
        console.log(`\n🔍 [${timestamp}] [DEBUG][${module}] [${action}]`);
        console.log(`   📝 ${message}`);
        if (data) {
            console.log(`   📦 Data:`, JSON.stringify(data, null, 2));
        }
    }
};

const logError = (module, action, error, context = {}) => {
    const timestamp = new Date().toISOString().split('T')[1];
    console.error(`\n❌ [${timestamp}] [ERROR][${module}] [${action}]`);
    console.error(`   📝 ${error.message}`);
    if (DEBUG) {
        console.error(`   📋 Context:`, JSON.stringify(context, null, 2));
        console.error(`   🔍 Stack:`, error.stack);
    }
};

const logInfo = (module, action, message, data = null) => {
    if (DEBUG) {
        const timestamp = new Date().toISOString().split('T')[1];
        console.log(`\n✅ [${timestamp}] [INFO][${module}] [${action}]`);
        console.log(`   📝 ${message}`);
        if (data) {
            console.log(`   📦 Data:`, JSON.stringify(data, null, 2));
        }
    }
};

// ========== MASTER TYPES ==========
const MASTER_TYPES = {
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    STATS: 'stats',
    RECENT: 'recent'
};

// ========== HELPER FUNCTIONS ==========

const isValidObjectId = (id) => {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// FIXED: Enhanced company context with better validation
const getCompanyContext = async (request) => {
    logDebug('CompanyContext', 'Start', 'Starting company context resolution');
    
    try {
        // PRIORITY 1: URL Query Parameter
        const urlCompanyId = request.nextUrl?.searchParams.get('companyId');
        
        if (urlCompanyId && isValidObjectId(urlCompanyId)) {
            const company = await Company.findOne({
                _id: urlCompanyId,
                status: 'active',
                deletedAt: null
            });
            
            if (company) {
                logInfo('CompanyContext', 'Success', `✅ Company found from URL: ${urlCompanyId}`);
                return urlCompanyId.toString();
            }
        }
        
        // PRIORITY 2: Headers
        const headersCompanyId = request.headers.get('x-company-id');
        
        if (headersCompanyId && isValidObjectId(headersCompanyId)) {
            const company = await Company.findOne({
                _id: headersCompanyId,
                status: 'active',
                deletedAt: null
            });
            
            if (company) {
                logInfo('CompanyContext', 'Success', `✅ Company found from Header: ${headersCompanyId}`);
                return headersCompanyId.toString();
            }
        }
        
        // PRIORITY 3: User Session
        const session = await getServerSession(authOptions);
        
        if (session?.user?.companyId && isValidObjectId(session.user.companyId)) {
            const company = await Company.findOne({
                _id: session.user.companyId,
                status: 'active',
                deletedAt: null
            });
            
            if (company) {
                logInfo('CompanyContext', 'Success', `✅ Company found from Session: ${session.user.companyId}`);
                return session.user.companyId.toString();
            }
        }
        
        logError('CompanyContext', 'Resolution', new Error('No valid company context found'), {});
        return null;
    } catch (error) {
        logError('CompanyContext', 'Exception', error, {});
        return null;
    }
};

const getTimeAgo = (date) => {
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
};

// Helper function for product count update
const safeUpdateProductCounts = async (companyId) => {
    try {
        if (Category && typeof Category.updateAllProductCounts === 'function') {
            await Category.updateAllProductCounts(companyId);
        }
    } catch (error) {
        logError('ProductCount', 'Update', error, { companyId });
    }
};

// ========== GET HANDLER ==========
export async function GET(request) {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
        await connectDB();
        
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required - please log in again',
                error: 'Missing or invalid company ID',
                requestId
            }, { status: 400 });
        }
        
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
        const format = searchParams.get('format');
        const parentId = searchParams.get('parentId');
        const includeInactive = searchParams.get('includeInactive') === 'true';
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        // ===== GET STATS =====
        if (type === MASTER_TYPES.STATS) {
            const companyObjectId = new mongoose.Types.ObjectId(companyId);
            
            // Category stats
            const categoryQuery = { companyId: companyObjectId, deletedAt: null };
            const totalCategories = await Category.countDocuments(categoryQuery);
            const activeCategories = await Category.countDocuments({ ...categoryQuery, isActive: true });
            const mainCategories = await Category.countDocuments({ ...categoryQuery, parentId: null });
            const subCategories = await Category.countDocuments({ ...categoryQuery, parentId: { $ne: null } });

            // Product stats
            const productQuery = { companyId: companyObjectId, deletedAt: null };
            const totalProducts = await Product.countDocuments(productQuery);
            const activeProducts = await Product.countDocuments({ ...productQuery, isActive: true });
            const lowStockProducts = await Product.countDocuments({ ...productQuery, stock: { $lte: 5, $gt: 0 }, isActive: true });
            const outOfStockProducts = await Product.countDocuments({ ...productQuery, stock: 0, isActive: true });

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
                    }
                },
                companyId,
                requestId
            });
        }

        // ===== GET RECENT ITEMS =====
        if (type === MASTER_TYPES.RECENT) {
            const recentLimit = parseInt(searchParams.get('limit')) || 10;
            const companyObjectId = new mongoose.Types.ObjectId(companyId);
            
            const [recentCategories, recentProducts] = await Promise.all([
                Category.find({ companyId: companyObjectId, deletedAt: null })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('name createdAt parentId')
                    .lean(),
                Product.find({ companyId: companyObjectId, deletedAt: null })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('productName createdAt discountPrice category subCategory')
                    .populate('category', 'name')
                    .populate('subCategory', 'name')
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
                    path: `/admin/products/productForm?id=${p._id}`,
                    color: '#10b981',
                    timeAgo: getTimeAgo(p.createdAt),
                    createdAt: p.createdAt,
                    subtitle: `₹${p.discountPrice}`,
                    category: p.category?.name || 'Uncategorized'
                }))
            ];

            recentItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            return NextResponse.json({
                success: true,
                data: recentItems.slice(0, recentLimit),
                companyId,
                requestId
            });
        }

        // ===== CATEGORIES =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const companyObjectId = new mongoose.Types.ObjectId(companyId);
            
            // Single category by ID
            if (id) {
                if (!isValidObjectId(id)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid category ID format'
                    }, { status: 400 });
                }

                const category = await Category.findOne({ 
                    _id: id, 
                    companyId: companyObjectId,
                    ...(includeDeleted ? {} : { deletedAt: null })
                }).lean();

                if (!category) {
                    return NextResponse.json({
                        success: false,
                        message: 'Category not found in this company'
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: category,
                    companyId,
                    requestId
                });
            }

            // Tree format
            if (format === 'tree') {
                try {
                    const tree = await Category.getTree(companyId, includeInactive);
                    return NextResponse.json({
                        success: true,
                        data: tree,
                        companyId,
                        requestId
                    });
                } catch (treeError) {
                    logError('GET', 'Tree Error', treeError, { companyId, includeInactive });
                    return NextResponse.json({
                        success: false,
                        message: 'Failed to build category tree',
                        error: treeError.message
                    }, { status: 500 });
                }
            }

            // Flat format with pagination
            if (format === 'flat') {
                try {
                    const flatListResult = await Category.getFlatList(companyId, includeInactive, page, limit);
                    return NextResponse.json({
                        success: true,
                        data: flatListResult.data,
                        pagination: {
                            total: flatListResult.total,
                            page: flatListResult.page,
                            limit: flatListResult.limit,
                            totalPages: flatListResult.totalPages
                        },
                        companyId,
                        requestId
                    });
                } catch (flatError) {
                    logError('GET', 'Flat List Error', flatError, { companyId, includeInactive });
                    return NextResponse.json({
                        success: false,
                        message: 'Failed to get flat category list',
                        error: flatError.message
                    }, { status: 500 });
                }
            }

            // Regular list with filters
            let query = { companyId: companyObjectId, deletedAt: null };
            
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
            
            // FIXED: Handle parentId filter properly
            if (parentId === 'null' || parentId === '' || parentId === 'all') {
                query.parentId = null;
            } else if (parentId && isValidObjectId(parentId)) {
                query.parentId = new mongoose.Types.ObjectId(parentId);
            }
            
            // Handle search
            if (search && search.trim()) {
                const searchTerm = search.trim();
                query.$or = [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ];
            }

            const total = await Category.countDocuments(query);
            
            const categories = await Category.find(query)
                .sort({ displayOrder: 1, name: 1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return NextResponse.json({
                success: true,
                data: categories,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                },
                companyId,
                requestId
            });
        }

        // ===== PRODUCTS =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const companyObjectId = new mongoose.Types.ObjectId(companyId);
            
            if (id) {
                if (!isValidObjectId(id)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid product ID format'
                    }, { status: 400 });
                }

                const product = await Product.findOne({ 
                    _id: id, 
                    companyId: companyObjectId,
                    ...(includeDeleted ? {} : { deletedAt: null })
                })
                    .populate('category', 'name slug')
                    .populate('subCategory', 'name slug')
                    .lean();

                if (!product) {
                    return NextResponse.json({
                        success: false,
                        message: 'Product not found in this company'
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: product,
                    companyId
                });
            }

            let query = { companyId: companyObjectId, deletedAt: null };
            
            if (status === 'active') query.isActive = true;
            else if (status === 'inactive') query.isActive = false;
            
            if (category && category !== 'all' && category !== 'null' && category !== '') {
                if (isValidObjectId(category)) {
                    query.category = new mongoose.Types.ObjectId(category);
                }
            }
            
            if (search && search.trim()) {
                const searchTerm = search.trim();
                query.$or = [
                    { productName: { $regex: searchTerm, $options: 'i' } },
                    { sku: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ];
            }

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

            const total = await Product.countDocuments(query);
            const products = await Product.find(query)
                .populate('category', 'name slug')
                .populate('subCategory', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return NextResponse.json({
                success: true,
                data: products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                },
                companyId
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid type parameter. Use: categories, products, stats, or recent'
        }, { status: 400 });

    } catch (error) {
        logError('GET', 'Unhandled Exception', error, { url: request.url });
        
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
    const requestId = Math.random().toString(36).substring(7);
    
    try {
        await connectDB();
        
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const body = await request.json();
        
        let userId = session?.user?.id || body.createdBy || body.userId || 'system';

        // ===== CREATE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            if (!body.name || !body.name.trim()) {
                return NextResponse.json({
                    success: false,
                    message: 'Category name is required'
                }, { status: 400 });
            }

            const companyObjectId = new mongoose.Types.ObjectId(companyId);
            
            // ========== GENERATE UNIQUE SLUG (CRITICAL FIX) ==========
            let baseSlug = body.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            
            if (!baseSlug || baseSlug.length === 0) {
                baseSlug = 'category';
            }
            
            let finalSlug = baseSlug;
            let counter = 1;
            let isUnique = false;
            
            while (!isUnique) {
                const existingCategory = await Category.findOne({
                    companyId: companyObjectId,
                    slug: finalSlug,
                    deletedAt: null
                });
                
                if (!existingCategory) {
                    isUnique = true;
                } else {
                    finalSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
            }
            
            // ========== CHECK FOR EXISTING CATEGORY ==========
            const existingQuery = {
                companyId: companyObjectId,
                name: body.name.trim(),
                deletedAt: null
            };
            
            if (body.parentId && isValidObjectId(body.parentId)) {
                existingQuery.parentId = new mongoose.Types.ObjectId(body.parentId);
            } else {
                existingQuery.parentId = null;
            }
            
            const existing = await Category.findOne(existingQuery);
            
            if (existing) {
                return NextResponse.json({
                    success: false,
                    message: body.parentId 
                        ? 'Subcategory already exists under this parent'
                        : 'Category already exists in this company'
                }, { status: 409 });
            }

            // ========== VERIFY PARENT CATEGORY ==========
            if (body.parentId && isValidObjectId(body.parentId)) {
                const parentExists = await Category.findOne({
                    _id: body.parentId,
                    companyId: companyObjectId,
                    deletedAt: null
                });
                
                if (!parentExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Parent category not found in this company'
                    }, { status: 400 });
                }
                
                // Check depth limit (max 3 levels)
                let depth = 1;
                let currentParent = parentExists;
                while (currentParent.parentId && depth < 3) {
                    const nextParent = await Category.findOne({
                        _id: currentParent.parentId,
                        companyId: companyObjectId,
                        deletedAt: null
                    });
                    if (!nextParent) break;
                    currentParent = nextParent;
                    depth++;
                }
                
                if (depth >= 3) {
                    return NextResponse.json({
                        success: false,
                        message: 'Maximum category depth is 3 levels (Main > Sub > Sub-Sub)'
                    }, { status: 400 });
                }
            }

            // ========== CREATE CATEGORY WITH SLUG ==========
            const categoryData = {
                companyId: companyObjectId,
                name: body.name.trim(),
                slug: finalSlug,  // ← CRITICAL: Include the generated slug
                description: body.description || '',
                parentId: (body.parentId && isValidObjectId(body.parentId)) ? new mongoose.Types.ObjectId(body.parentId) : null,
                icon: body.icon || '📦',
                displayOrder: body.displayOrder || 0,
                isActive: true,
                createdBy: userId
            };
            
            console.log('📝 Creating category:', { name: categoryData.name, slug: categoryData.slug });
            
            const category = await Category.create(categoryData);
            
            console.log('✅ Category created:', { id: category._id, name: category.name, slug: category.slug });
            
            return NextResponse.json({
                success: true,
                message: body.parentId ? 'Subcategory created successfully' : 'Category created successfully',
                data: category,
                requestId
            }, { status: 201 });
        }

        // ===== CREATE PRODUCT =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const required = ['productName', 'category', 'subCategory', 'mrp', 'discountPrice', 'stock', 'sku', 'hsnCode', 'gstRate'];
            const missing = required.filter(field => !body[field] && body[field] !== 0);
            
            if (missing.length > 0) {
                return NextResponse.json({
                    success: false,
                    message: `Missing required fields: ${missing.join(', ')}`
                }, { status: 400 });
            }

            if (!isValidObjectId(body.category)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid category ID format'
                }, { status: 400 });
            }

            const category = await Category.findOne({ 
                _id: body.category, 
                companyId: new mongoose.Types.ObjectId(companyId),
                deletedAt: null 
            });
            
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found in this company'
                }, { status: 400 });
            }

            if (!isValidObjectId(body.subCategory)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid subCategory ID format'
                }, { status: 400 });
            }
            
            const subCategory = await Category.findOne({ 
                _id: body.subCategory, 
                companyId: new mongoose.Types.ObjectId(companyId),
                deletedAt: null 
            });
            
            if (!subCategory) {
                return NextResponse.json({
                    success: false,
                    message: 'SubCategory not found in this company'
                }, { status: 400 });
            }
            
            // Verify subCategory belongs to category
            if (!subCategory.parentId || subCategory.parentId.toString() !== body.category.toString()) {
                return NextResponse.json({
                    success: false,
                    message: 'Selected subCategory does not belong to the selected main category'
                }, { status: 400 });
            }

            // Check for duplicate SKU
            const existing = await Product.findOne({ 
                companyId: new mongoose.Types.ObjectId(companyId),
                sku: body.sku.toUpperCase(),
                deletedAt: null 
            });
            
            if (existing) {
                return NextResponse.json({
                    success: false,
                    message: 'Product with this SKU already exists in your company'
                }, { status: 409 });
            }

            // Create product
            const productData = {
                companyId: new mongoose.Types.ObjectId(companyId),
                productName: body.productName.trim(),
                sku: body.sku.toUpperCase().trim(),
                category: new mongoose.Types.ObjectId(body.category),
                subCategory: new mongoose.Types.ObjectId(body.subCategory),
                mrp: parseFloat(body.mrp),
                discountPrice: parseFloat(body.discountPrice),
                stock: parseInt(body.stock) || 0,
                hsnCode: body.hsnCode.trim(),
                gstRate: parseFloat(body.gstRate),
                description: body.description || '',
                isOnSale: parseFloat(body.discountPrice) < parseFloat(body.mrp),
                isActive: body.isActive !== undefined ? body.isActive : true,
                createdBy: userId
            };
            
            const product = await Product.create(productData);

            await safeUpdateProductCounts(companyId);

            await product.populate('category', 'name slug');
            await product.populate('subCategory', 'name slug');

            return NextResponse.json({
                success: true,
                message: 'Product created successfully',
                data: product
            }, { status: 201 });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid type parameter. Use: categories or products'
        }, { status: 400 });

    } catch (error) {
        console.error('❌ POST Error:', error);
        
        // Handle duplicate key error (MongoDB error code 11000)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            let message = `${field} already exists`;
            
            if (field === 'slug') message = 'Category with similar name already exists';
            if (field === 'sku') message = 'Product with this SKU already exists';
            
            return NextResponse.json({
                success: false,
                message: `${message} in this company`
            }, { status: 409 });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                success: false,
                message: errors.join(', ')
            }, { status: 400 });
        }

        // Handle other errors
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to create',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// ========== PUT HANDLER (UPDATE) ==========
export async function PUT(request) {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
        await connectDB();
        
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        const body = await request.json();
        const userId = session?.user?.id || body.userId || 'system';

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({
                success: false,
                message: 'Valid ID is required'
            }, { status: 400 });
        }

        // ===== UPDATE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const category = await Category.findOne({ 
                _id: id, 
                companyId: new mongoose.Types.ObjectId(companyId),
                deletedAt: null 
            });
            
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found in this company'
                }, { status: 404 });
            }

            // Prepare update data
            const updateData = {
                updatedBy: userId
            };
            
            if (body.name !== undefined) updateData.name = body.name.trim();
            if (body.description !== undefined) updateData.description = body.description;
            if (body.icon !== undefined) updateData.icon = body.icon;
            if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
            if (body.isActive !== undefined) updateData.isActive = body.isActive;
            if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
            if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
            
            // Handle parentId change with validation
            if (body.parentId !== undefined) {
                if (body.parentId === null || body.parentId === '' || body.parentId === 'null') {
                    updateData.parentId = null;
                } else if (isValidObjectId(body.parentId)) {
                    // Don't allow self-parent
                    if (body.parentId.toString() === id) {
                        return NextResponse.json({
                            success: false,
                            message: 'Category cannot be its own parent'
                        }, { status: 400 });
                    }
                    
                    // Check parent exists in same company
                    const newParent = await Category.findOne({
                        _id: body.parentId,
                        companyId: new mongoose.Types.ObjectId(companyId),
                        deletedAt: null
                    });
                    
                    if (!newParent) {
                        return NextResponse.json({
                            success: false,
                            message: 'Parent category not found in this company'
                        }, { status: 400 });
                    }
                    
                    // Check for circular reference
                    const descendants = await Category.getAllDescendants(companyId, id);
                    if (descendants.some(d => d.toString() === body.parentId.toString())) {
                        return NextResponse.json({
                            success: false,
                            message: 'Cannot move category under its own subcategory'
                        }, { status: 400 });
                    }
                    
                    // Check depth limit
                    let depth = 1;
                    let currentParent = newParent;
                    while (currentParent.parentId && depth < 3) {
                        const nextParent = await Category.findOne({
                            _id: currentParent.parentId,
                            companyId: new mongoose.Types.ObjectId(companyId),
                            deletedAt: null
                        });
                        if (!nextParent) break;
                        currentParent = nextParent;
                        depth++;
                    }
                    
                    if (depth >= 3) {
                        return NextResponse.json({
                            success: false,
                            message: 'Maximum category depth is 3 levels'
                        }, { status: 400 });
                    }
                    
                    updateData.parentId = new mongoose.Types.ObjectId(body.parentId);
                } else {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid parent ID format'
                    }, { status: 400 });
                }
            }
            
            const updated = await Category.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            await safeUpdateProductCounts(companyId);

            return NextResponse.json({
                success: true,
                message: 'Category updated successfully',
                data: updated,
                requestId
            });
        }

        // ===== UPDATE PRODUCT =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const product = await Product.findOne({ 
                _id: id, 
                companyId: new mongoose.Types.ObjectId(companyId),
                deletedAt: null 
            });
            
            if (!product) {
                return NextResponse.json({
                    success: false,
                    message: 'Product not found in this company'
                }, { status: 404 });
            }

            if (body.sku && body.sku !== product.sku) {
                const existing = await Product.findOne({ 
                    companyId: new mongoose.Types.ObjectId(companyId),
                    sku: body.sku.toUpperCase(),
                    deletedAt: null,
                    _id: { $ne: id }
                });
                
                if (existing) {
                    return NextResponse.json({
                        success: false,
                        message: 'Product with this SKU already exists in your company'
                    }, { status: 409 });
                }
            }

            const updateData = {
                ...body,
                sku: body.sku ? body.sku.toUpperCase() : product.sku,
                isOnSale: body.discountPrice ? 
                    parseFloat(body.discountPrice) < (parseFloat(body.mrp) || parseFloat(product.mrp)) : 
                    product.isOnSale,
                updatedBy: userId
            };
            
            // Remove undefined fields
            Object.keys(updateData).forEach(key => 
                updateData[key] === undefined && delete updateData[key]
            );

            const updated = await Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).populate('category', 'name slug')
             .populate('subCategory', 'name slug');

            await safeUpdateProductCounts(companyId);

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
        logError('PUT', 'Unhandled Exception', error, {});
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({
                success: false,
                message: `${field} already exists in this company`
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
    const requestId = Math.random().toString(36).substring(7);
    
    try {
        await connectDB();
        
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        const userId = session?.user?.id || 'system';

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({
                success: false,
                message: 'Valid ID is required'
            }, { status: 400 });
        }

        // ===== DELETE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const category = await Category.findOne({
                _id: id,
                companyId: new mongoose.Types.ObjectId(companyId),
                deletedAt: null
            });
            
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found in this company'
                }, { status: 404 });
            }
            
            // Check if category has products
            const productCount = await Product.countDocuments({
                companyId: new mongoose.Types.ObjectId(companyId),
                $or: [
                    { category: category._id },
                    { subCategory: category._id }
                ],
                deletedAt: null
            });
            
            if (productCount > 0) {
                return NextResponse.json({
                    success: false,
                    message: `Cannot delete category that has ${productCount} product(s)`
                }, { status: 409 });
            }
            
            // Check if category has subcategories
            const subCount = await Category.countDocuments({
                companyId: new mongoose.Types.ObjectId(companyId),
                parentId: category._id,
                deletedAt: null
            });
            
            if (subCount > 0) {
                return NextResponse.json({
                    success: false,
                    message: `Cannot delete category that has ${subCount} subcategory(ies)`
                }, { status: 409 });
            }
            
            // Soft delete
            await Category.updateOne(
                { _id: id },
                { 
                    deletedAt: new Date(),
                    deletedBy: userId,
                    isActive: false
                }
            );
            
            return NextResponse.json({
                success: true,
                message: 'Category deleted successfully',
                requestId
            });
        }

        // ===== DELETE PRODUCT =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const product = await Product.findOne({
                _id: id,
                companyId: new mongoose.Types.ObjectId(companyId),
                deletedAt: null
            });
            
            if (!product) {
                return NextResponse.json({
                    success: false,
                    message: 'Product not found in this company'
                }, { status: 404 });
            }
            
            await Product.updateOne(
                { _id: id },
                { 
                    deletedAt: new Date(),
                    deletedBy: userId,
                    isActive: false
                }
            );
            
            await safeUpdateProductCounts(companyId);
            
            return NextResponse.json({
                success: true,
                message: 'Product deleted successfully',
                requestId
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid type parameter'
        }, { status: 400 });

    } catch (error) {
        logError('DELETE', 'Unhandled Exception', error, {});
        return NextResponse.json({
            success: false,
            message: 'Failed to delete',
            error: error.message
        }, { status: 500 });
    }
}

// ========== PATCH HANDLER ==========
export async function PATCH(request) {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
        await connectDB();
        
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const body = await request.json();
        const userId = session?.user?.id || body.userId || 'system';

        // Toggle active status
        if (body.action === 'toggle-status' && body.id) {
            if (!isValidObjectId(body.id)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid ID format'
                }, { status: 400 });
            }
            
            if (type === MASTER_TYPES.CATEGORIES) {
                const category = await Category.findOne({
                    _id: body.id,
                    companyId: new mongoose.Types.ObjectId(companyId),
                    deletedAt: null
                });
                
                if (!category) {
                    return NextResponse.json({
                        success: false,
                        message: 'Category not found in this company'
                    }, { status: 404 });
                }
                
                const updated = await Category.findByIdAndUpdate(
                    body.id,
                    { 
                        isActive: body.isActive,
                        updatedBy: userId
                    },
                    { new: true }
                );
                
                return NextResponse.json({
                    success: true,
                    message: `Category ${body.isActive ? 'activated' : 'deactivated'} successfully`,
                    data: updated,
                    requestId
                });
            }
            
            if (type === MASTER_TYPES.PRODUCTS) {
                const product = await Product.findOne({
                    _id: body.id,
                    companyId: new mongoose.Types.ObjectId(companyId),
                    deletedAt: null
                });
                
                if (!product) {
                    return NextResponse.json({
                        success: false,
                        message: 'Product not found in this company'
                    }, { status: 404 });
                }
                
                const updated = await Product.findByIdAndUpdate(
                    body.id,
                    { 
                        isActive: body.isActive,
                        updatedBy: userId
                    },
                    { new: true }
                );
                
                return NextResponse.json({
                    success: true,
                    message: `Product ${body.isActive ? 'activated' : 'deactivated'} successfully`,
                    data: updated,
                    requestId
                });
            }
        }

        // Bulk operations
        if (body.action === 'bulk-update' && body.ids && Array.isArray(body.ids)) {
            const validIds = body.ids.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid IDs provided'
                }, { status: 400 });
            }
            
            if (type === MASTER_TYPES.CATEGORIES) {
                const result = await Category.updateMany(
                    {
                        _id: { $in: validIds },
                        companyId: new mongoose.Types.ObjectId(companyId),
                        deletedAt: null
                    },
                    {
                        isActive: body.isActive,
                        updatedBy: userId
                    }
                );
                
                return NextResponse.json({
                    success: true,
                    message: `${result.modifiedCount} categories updated`,
                    modifiedCount: result.modifiedCount,
                    requestId
                });
            }
            
            if (type === MASTER_TYPES.PRODUCTS) {
                const result = await Product.updateMany(
                    {
                        _id: { $in: validIds },
                        companyId: new mongoose.Types.ObjectId(companyId),
                        deletedAt: null
                    },
                    {
                        isActive: body.isActive,
                        updatedBy: userId
                    }
                );
                
                return NextResponse.json({
                    success: true,
                    message: `${result.modifiedCount} products updated`,
                    modifiedCount: result.modifiedCount,
                    requestId
                });
            }
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid action or type'
        }, { status: 400 });

    } catch (error) {
        logError('PATCH', 'Unhandled Exception', error, {});
        return NextResponse.json({
            success: false,
            message: 'Failed to update',
            error: error.message
        }, { status: 500 });
    }
}

// ========== OPTIONS HANDLER ==========
export async function OPTIONS() {
    return NextResponse.json({ 
        success: true,
        message: 'Masters API is operational'
    }, { 
        status: 200,
        headers: {
            'Allow': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID'
        }
    });
}