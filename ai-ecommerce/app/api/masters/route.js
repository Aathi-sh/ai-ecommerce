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
    return mongoose.Types.ObjectId.isValid(id) && 
           /^[0-9a-fA-F]{24}$/.test(id);
};

// ========== FIXED: SIMPLIFIED COMPANY CONTEXT ==========
const getCompanyContext = async (request) => {
    try {
        // PRIORITY 1: URL Query Parameter (what frontend sends)
        const urlCompanyId = request.nextUrl?.searchParams.get('companyId');
        if (urlCompanyId && isValidObjectId(urlCompanyId)) {
            const company = await Company.findById(urlCompanyId);
            if (company && company.status === 'active' && !company.deletedAt) {
                console.log('Company context from URL:', urlCompanyId);
                return urlCompanyId.toString();
            }
        }
        
        // PRIORITY 2: Headers
        const headersCompanyId = request.headers.get('x-company-id');
        if (headersCompanyId && isValidObjectId(headersCompanyId)) {
            const company = await Company.findById(headersCompanyId);
            if (company && company.status === 'active' && !company.deletedAt) {
                console.log('Company context from Header:', headersCompanyId);
                return headersCompanyId.toString();
            }
        }
        
        // PRIORITY 3: User Session
        const session = await getServerSession(authOptions);
        if (session?.user?.companyId && isValidObjectId(session.user.companyId)) {
            const company = await Company.findById(session.user.companyId);
            if (company && company.status === 'active' && !company.deletedAt) {
                console.log('Company context from Session:', session.user.companyId);
                return session.user.companyId.toString();
            }
        }
        
        console.log('No valid company context found');
        return null;
    } catch (error) {
        console.error('Error getting company context:', error);
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
        } else {
            console.warn('Category.updateAllProductCounts is not available');
        }
    } catch (error) {
        console.warn('Failed to update product counts:', error.message);
    }
};

// ========== GET HANDLER ==========
export async function GET(request) {
    try {
        await connectDB();
        
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required - please log in again',
                error: 'Missing or invalid company ID'
            }, { status: 400 });
        }
        
        console.log(`GET request for company: ${companyId}`);
        
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
                companyId
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
                companyId
            });
        }

        // ===== CATEGORIES =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const companyObjectId = new mongoose.Types.ObjectId(companyId);
            
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
                    companyId
                });
            }

            // Tree format
            if (format === 'tree') {
                const tree = await Category.getTree(companyId, includeInactive);
                return NextResponse.json({
                    success: true,
                    data: tree,
                    companyId
                });
            }

            // Flat format
            if (format === 'flat') {
                const flatList = await Category.getFlatList(companyId, includeInactive);
                return NextResponse.json({
                    success: true,
                    data: flatList,
                    companyId
                });
            }

            // Regular list with filters
            let query = { companyId: companyObjectId, deletedAt: null };
            
            if (status === 'active') query.isActive = true;
            else if (status === 'inactive') query.isActive = false;
            
            if (parentId === 'null' || parentId === '') {
                query.parentId = null;
            } else if (parentId && isValidObjectId(parentId)) {
                query.parentId = new mongoose.Types.ObjectId(parentId);
            }
            
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
                companyId
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
        console.error('GET masters error:', error);
        
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
        
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        console.log(`POST request for company: ${companyId}`);
        
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const body = await request.json();
        
        let userId = session?.user?.id || body.createdBy || body.userId || 'system';

        // ===== CREATE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            if (!body.name) {
                return NextResponse.json({
                    success: false,
                    message: 'Category name is required'
                }, { status: 400 });
            }

            const slug = body.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Check for existing category
            const existingQuery = {
                companyId: new mongoose.Types.ObjectId(companyId),
                name: body.name,
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

            // Verify parent belongs to same company
            if (body.parentId && isValidObjectId(body.parentId)) {
                const parentExists = await Category.findOne({
                    _id: body.parentId,
                    companyId: new mongoose.Types.ObjectId(companyId),
                    deletedAt: null
                });
                
                if (!parentExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Parent category not found in this company'
                    }, { status: 400 });
                }
            }

            const categoryData = {
                companyId: new mongoose.Types.ObjectId(companyId),
                name: body.name.trim(),
                slug: slug,
                description: body.description || '',
                parentId: (body.parentId && isValidObjectId(body.parentId)) ? new mongoose.Types.ObjectId(body.parentId) : null,
                icon: body.icon || '📦',
                displayOrder: body.displayOrder || 0,
                isActive: true,
                createdBy: userId
            };
            
            const category = await Category.create(categoryData);
            
            console.log(`✅ Category created: ${category.name} (ID: ${category._id})`);

            return NextResponse.json({
                success: true,
                message: body.parentId ? 'Subcategory created successfully' : 'Category created successfully',
                data: category
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
            
            if (!subCategory.parentId || subCategory.parentId.toString() !== body.category.toString()) {
                return NextResponse.json({
                    success: false,
                    message: 'Selected subCategory does not belong to the selected main category'
                }, { status: 400 });
            }

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

            const product = await Product.create({
                companyId: new mongoose.Types.ObjectId(companyId),
                ...body,
                sku: body.sku.toUpperCase(),
                isOnSale: parseFloat(body.discountPrice) < parseFloat(body.mrp),
                createdBy: userId
            });

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
            message: 'Invalid type parameter'
        }, { status: 400 });

    } catch (error) {
        console.error('POST masters error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({
                success: false,
                message: `${field} already exists in this company`
            }, { status: 409 });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                success: false,
                message: errors.join(', ')
            }, { status: 400 });
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

            const updated = await Category.findByIdAndUpdate(
                id,
                {
                    name: body.name || category.name,
                    description: body.description !== undefined ? body.description : category.description,
                    icon: body.icon || category.icon,
                    displayOrder: body.displayOrder !== undefined ? body.displayOrder : category.displayOrder,
                    isActive: body.isActive !== undefined ? body.isActive : category.isActive,
                    updatedBy: userId
                },
                { new: true }
            );

            await safeUpdateProductCounts(companyId);

            return NextResponse.json({
                success: true,
                message: 'Category updated successfully',
                data: updated
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

            const updated = await Product.findByIdAndUpdate(
                id,
                {
                    ...body,
                    sku: body.sku ? body.sku.toUpperCase() : product.sku,
                    isOnSale: body.discountPrice ? 
                        parseFloat(body.discountPrice) < (parseFloat(body.mrp) || parseFloat(product.mrp)) : 
                        product.isOnSale,
                    updatedBy: userId
                },
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
        console.error('PUT masters error:', error);
        
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

// ========== FIXED: DELETE HANDLER ==========
export async function DELETE(request) {
    try {
        await connectDB();
        
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        console.log(`DELETE request for company: ${companyId}`);
        
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

        // ===== FIXED: DELETE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            // First verify category exists AND belongs to this company
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
            
            console.log(`Found category to delete: ${category.name}`);
            
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
            
            console.log(`✅ Category deleted: ${category.name}`);
            
            return NextResponse.json({
                success: true,
                message: 'Category deleted successfully'
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
                message: 'Product deleted successfully'
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

// ========== PATCH HANDLER ==========
export async function PATCH(request) {
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
                    data: updated
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
                    data: updated
                });
            }
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid action or type'
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