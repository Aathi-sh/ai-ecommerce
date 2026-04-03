// // app/api/masters/route.js
// import { NextResponse } from 'next/server';
// import { connectDB } from '@/utils/db';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';
// import Category from '@/models/Category';
// import Product from '@/models/Product';
// import Company from '@/models/Company';
// import mongoose from 'mongoose';

// // ========== CONFIGURATION ==========
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
// export const maxDuration = 30;
// export const revalidate = 0;

// // ========== MASTER TYPES ==========
// const MASTER_TYPES = {
//     CATEGORIES: 'categories',
//     PRODUCTS: 'products',
//     STATS: 'stats',
//     RECENT: 'recent'
// };

// // ========== HELPER FUNCTIONS ==========

// const isValidObjectId = (id) => {
//     return mongoose.Types.ObjectId.isValid(id) && 
//            /^[0-9a-fA-F]{24}$/.test(id);
// };

// const getCompanyContext = async (request) => {
//     try {
//         // ===== PRIORITY 1: Headers (for modern frontend) =====
//         const headersCompanyId = request.headers.get('x-company-id');
//         if (headersCompanyId && isValidObjectId(headersCompanyId)) {
//             const company = await Company.findById(headersCompanyId);
//             if (company && company.status === 'active' && !company.deletedAt) {
//                 return headersCompanyId.toString();
//             }
//         }
        
//         // ===== PRIORITY 2: URL Query Parameter (explicit) =====
//         const urlCompanyId = request.nextUrl?.searchParams.get('companyId');
//         if (urlCompanyId && isValidObjectId(urlCompanyId)) {
//             const company = await Company.findById(urlCompanyId);
//             if (company && company.status === 'active' && !company.deletedAt) {
//                 return urlCompanyId.toString();
//             }
//         }
        
//         // ===== PRIORITY 3: User Session (BACKWARD COMPATIBLE) =====
//         // This ensures ALL existing admin pages work without any changes
//         const { getServerSession } = await import('next-auth');
//         const { authOptions } = await import('@/lib/nextauth');
//         const session = await getServerSession(authOptions);
        
//         if (session?.user?.companyId && isValidObjectId(session.user.companyId)) {
//             const company = await Company.findById(session.user.companyId);
//             if (company && company.status === 'active' && !company.deletedAt) {
//                 return session.user.companyId.toString();
//             }
//         }
        
//         return null;
//     } catch (error) {
//         console.error('Error getting company context:', error);
//         return null;
//     }
// };

// const getTimeAgo = (date) => {
//     const now = new Date();
//     const diffMs = now - new Date(date);
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return new Date(date).toLocaleDateString();
// };

// // ========== GET HANDLER ==========
// export async function GET(request) {
//     try {
//         await connectDB();
        
//         // Get company context
//         const companyId = await getCompanyContext(request);
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required',
//                 error: 'Missing or invalid company ID'
//             }, { status: 400 });
//         }
        
//         const { searchParams } = new URL(request.url);
//         const type = searchParams.get('type');
//         const id = searchParams.get('id');
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);
//         const skip = (page - 1) * limit;
//         const search = searchParams.get('search');
//         const status = searchParams.get('status');
//         const category = searchParams.get('category');
//         const fromDate = searchParams.get('fromDate');
//         const toDate = searchParams.get('toDate');
//         const minPrice = searchParams.get('minPrice');
//         const maxPrice = searchParams.get('maxPrice');
//         const lowStock = searchParams.get('lowStock') === 'true';
//         const format = searchParams.get('format');
//         const parentId = searchParams.get('parentId');
//         const includeInactive = searchParams.get('includeInactive') === 'true';
//         const includeDeleted = searchParams.get('includeDeleted') === 'true';

//         // ===== GET STATS FOR CATEGORIES AND PRODUCTS =====
//         if (type === MASTER_TYPES.STATS) {
//             // Category stats within company
//             const categoryQuery = { companyId, deletedAt: null };
//             const totalCategories = await Category.countDocuments(categoryQuery);
//             const activeCategories = await Category.countDocuments({ 
//                 ...categoryQuery, 
//                 isActive: true 
//             });
//             const mainCategories = await Category.countDocuments({ 
//                 ...categoryQuery, 
//                 parentId: null 
//             });
//             const subCategories = await Category.countDocuments({ 
//                 ...categoryQuery, 
//                 parentId: { $ne: null } 
//             });

//             // Product stats within company
//             const productQuery = { companyId, deletedAt: null };
//             const totalProducts = await Product.countDocuments(productQuery);
//             const activeProducts = await Product.countDocuments({ 
//                 ...productQuery, 
//                 isActive: true 
//             });
//             const lowStockProducts = await Product.countDocuments({ 
//                 ...productQuery, 
//                 stock: { $lte: 5, $gt: 0 },
//                 isActive: true 
//             });
//             const outOfStockProducts = await Product.countDocuments({ 
//                 ...productQuery, 
//                 stock: 0,
//                 isActive: true 
//             });

//             // Get category distribution within company
//             const categoryDistribution = await Product.aggregate([
//                 { $match: { 
//                     companyId: new mongoose.Types.ObjectId(companyId), 
//                     category: { $ne: null },
//                     deletedAt: null 
//                 }},
//                 { $group: {
//                     _id: '$category',
//                     count: { $sum: 1 }
//                 }},
//                 { $sort: { count: -1 } },
//                 { $limit: 5 },
//                 { $lookup: {
//                     from: 'categories',
//                     localField: '_id',
//                     foreignField: '_id',
//                     as: 'categoryInfo'
//                 }},
//                 { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
//                 { $project: {
//                     categoryName: '$categoryInfo.name',
//                     count: 1
//                 }}
//             ]);

//             return NextResponse.json({
//                 success: true,
//                 data: {
//                     categories: {
//                         total: totalCategories,
//                         active: activeCategories,
//                         inactive: totalCategories - activeCategories,
//                         main: mainCategories,
//                         sub: subCategories
//                     },
//                     products: {
//                         total: totalProducts,
//                         active: activeProducts,
//                         inactive: totalProducts - activeProducts,
//                         lowStock: lowStockProducts,
//                         outOfStock: outOfStockProducts
//                     },
//                     distribution: {
//                         topCategories: categoryDistribution
//                     }
//                 },
//                 companyId
//             });
//         }

//         // ===== GET RECENT ITEMS ACROSS CATEGORIES AND PRODUCTS =====
//         if (type === MASTER_TYPES.RECENT) {
//             const recentLimit = parseInt(searchParams.get('limit')) || 10;
            
//             const [recentCategories, recentProducts] = await Promise.all([
//                 Category.find({ 
//                     companyId, 
//                     deletedAt: null 
//                 })
//                     .sort({ createdAt: -1 })
//                     .limit(5)
//                     .select('name createdAt parentId')
//                     .lean(),
//                 Product.find({ 
//                     companyId, 
//                     deletedAt: null 
//                 })
//                     .sort({ createdAt: -1 })
//                     .limit(5)
//                     .select('productName createdAt discountPrice category subCategory')
//                     .populate('category', 'name')
//                     .populate('subCategory', 'name')
//                     .lean()
//             ]);

//             const recentItems = [
//                 ...recentCategories.map(c => ({
//                     id: c._id,
//                     title: c.name,
//                     type: c.parentId ? 'subcategory' : 'category',
//                     path: `/admin/masters/categories?id=${c._id}`,
//                     color: '#3b82f6',
//                     timeAgo: getTimeAgo(c.createdAt),
//                     createdAt: c.createdAt
//                 })),
//                 ...recentProducts.map(p => ({
//                     id: p._id,
//                     title: p.productName,
//                     type: 'product',
//                     path: `/admin/products/productForm?id=${p._id}`,
//                     color: '#10b981',
//                     timeAgo: getTimeAgo(p.createdAt),
//                     createdAt: p.createdAt,
//                     subtitle: `₹${p.discountPrice}`,
//                     category: p.category?.name || 'Uncategorized',
//                     subCategory: p.subCategory?.name || ''
//                 }))
//             ];

//             recentItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
//             return NextResponse.json({
//                 success: true,
//                 data: recentItems.slice(0, recentLimit),
//                 companyId
//             });
//         }

//         // ===== CATEGORIES =====
//         if (type === MASTER_TYPES.CATEGORIES) {
//             if (id) {
//                 if (!isValidObjectId(id)) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Invalid category ID format'
//                     }, { status: 400 });
//                 }

//                 const category = await Category.findOne({ 
//                     _id: id, 
//                     companyId,
//                     ...(includeDeleted ? {} : { deletedAt: null })
//                 })
//                     .populate({
//                         path: 'subcategories',
//                         match: { deletedAt: null },
//                         options: { sort: { displayOrder: 1, name: 1 } }
//                     })
//                     .lean();

//                 if (!category) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Category not found in this company'
//                     }, { status: 404 });
//                 }

//                 if (category.parentId) {
//                     category.parent = await Category.findOne({ 
//                         _id: category.parentId,
//                         companyId,
//                         deletedAt: null 
//                     })
//                         .select('name slug')
//                         .lean();
//                 }

//                 // Get product count for this category within company
//                 const productCount = await Product.countDocuments({ 
//                     companyId,
//                     $or: [
//                         { category: category._id },
//                         { subCategory: category._id }
//                     ],
//                     deletedAt: null 
//                 });

//                 // Get subcategory count
//                 const subCategoryCount = await Category.countDocuments({ 
//                     companyId,
//                     parentId: category._id,
//                     deletedAt: null 
//                 });

//                 // Get full path for breadcrumb
//                 const path = await Category.getCategoryPath(companyId, category._id);

//                 return NextResponse.json({
//                     success: true,
//                     data: {
//                         ...category,
//                         productCount,
//                         subCategoryCount,
//                         path
//                     },
//                     companyId
//                 });
//             }

//             let query = { companyId, deletedAt: null };
            
//             if (status === 'active') query.isActive = true;
//             else if (status === 'inactive') query.isActive = false;
            
//             if (parentId !== undefined && parentId !== null) {
//                 if (parentId === 'null' || parentId === '') {
//                     query.parentId = null;
//                 } else if (isValidObjectId(parentId)) {
//                     // Verify parent belongs to same company
//                     const parentExists = await Category.findOne({ 
//                         _id: parentId, 
//                         companyId,
//                         deletedAt: null 
//                     });
//                     if (parentExists) {
//                         query.parentId = parentId;
//                     } else {
//                         // If parent doesn't exist, return empty result
//                         return NextResponse.json({
//                             success: true,
//                             data: [],
//                             pagination: {
//                                 total: 0,
//                                 page,
//                                 limit,
//                                 totalPages: 0
//                             },
//                             companyId
//                         });
//                     }
//                 }
//             }
            
//             if (search && search.trim()) {
//                 const searchTerm = search.trim();
//                 query.$or = [
//                     { name: { $regex: searchTerm, $options: 'i' } },
//                     { description: { $regex: searchTerm, $options: 'i' } }
//                 ];
//             }

//             const total = await Category.countDocuments(query);
            
//             let categories = await Category.find(query)
//                 .sort({ displayOrder: 1, name: 1 })
//                 .skip(skip)
//                 .limit(limit)
//                 .lean();

//             // Get product counts for each category within company (including as subCategory)
//             const categoryIds = categories.map(c => c._id);
//             const productCounts = await Product.aggregate([
//                 { $match: { 
//                     companyId: new mongoose.Types.ObjectId(companyId),
//                     $or: [
//                         { category: { $in: categoryIds } },
//                         { subCategory: { $in: categoryIds } }
//                     ],
//                     deletedAt: null 
//                 }},
//                 { $group: {
//                     _id: null,
//                     byCategory: { $push: { category: '$category', subCategory: '$subCategory' } }
//                 }}
//             ]);

//             // Get subcategory counts
//             const subCounts = await Category.aggregate([
//                 { $match: { 
//                     companyId: new mongoose.Types.ObjectId(companyId),
//                     parentId: { $in: categoryIds },
//                     deletedAt: null 
//                 }},
//                 { $group: {
//                     _id: '$parentId',
//                     count: { $sum: 1 }
//                 }}
//             ]);

//             const productCountMap = {};
//             if (productCounts.length > 0) {
//                 productCounts[0].byCategory.forEach(item => {
//                     if (item.category) productCountMap[item.category] = (productCountMap[item.category] || 0) + 1;
//                     if (item.subCategory) productCountMap[item.subCategory] = (productCountMap[item.subCategory] || 0) + 1;
//                 });
//             }

//             const subCountMap = {};
//             subCounts.forEach(item => {
//                 subCountMap[item._id] = item.count;
//             });

//             categories = categories.map(cat => ({
//                 ...cat,
//                 productCount: productCountMap[cat._id] || 0,
//                 subCategoryCount: subCountMap[cat._id] || 0
//             }));

//             // Tree format
//             if (format === 'tree') {
//                 const tree = await Category.getTree(companyId, includeInactive);
                
//                 return NextResponse.json({
//                     success: true,
//                     data: tree,
//                     pagination: {
//                         total,
//                         page,
//                         limit,
//                         totalPages: Math.ceil(total / limit)
//                     },
//                     companyId
//                 });
//             }

//             // Flat format with levels
//             if (format === 'flat') {
//                 const flatList = await Category.getFlatList(companyId, includeInactive);
                
//                 return NextResponse.json({
//                     success: true,
//                     data: flatList,
//                     pagination: {
//                         total,
//                         page,
//                         limit,
//                         totalPages: Math.ceil(total / limit)
//                     },
//                     companyId
//                 });
//             }

//             return NextResponse.json({
//                 success: true,
//                 data: categories,
//                 pagination: {
//                     total,
//                     page,
//                     limit,
//                     totalPages: Math.ceil(total / limit)
//                 },
//                 companyId
//             });
//         }

//         // ===== PRODUCTS =====
//         if (type === MASTER_TYPES.PRODUCTS) {
//             if (id) {
//                 if (!isValidObjectId(id)) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Invalid product ID format'
//                     }, { status: 400 });
//                 }

//                 const product = await Product.findOne({ 
//                     _id: id, 
//                     companyId,
//                     ...(includeDeleted ? {} : { deletedAt: null })
//                 })
//                     .populate('category', 'name slug')
//                     .populate('subCategory', 'name slug')
//                     .lean();

//                 if (!product) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Product not found in this company'
//                     }, { status: 404 });
//                 }

//                 return NextResponse.json({
//                     success: true,
//                     data: product,
//                     companyId
//                 });
//             }

//             let query = { companyId, deletedAt: null };
            
//             if (status === 'active') {
//                 query.isActive = true;
//             } else if (status === 'inactive') {
//                 query.isActive = false;
//             }
            
//             if (category && category !== 'all' && category !== 'null' && category !== '') {
//                 if (isValidObjectId(category)) {
//                     // Verify category belongs to this company
//                     const catExists = await Category.findOne({ 
//                         _id: category, 
//                         companyId,
//                         deletedAt: null 
//                     });
//                     if (catExists) {
//                         query.category = new mongoose.Types.ObjectId(category);
//                     } else {
//                         // If category doesn't exist, return empty result
//                         return NextResponse.json({
//                             success: true,
//                             data: [],
//                             pagination: {
//                                 total: 0,
//                                 page,
//                                 limit,
//                                 totalPages: 0
//                             },
//                             summary: {
//                                 totalValue: 0,
//                                 avgPrice: 0,
//                                 minPrice: 0,
//                                 maxPrice: 0,
//                                 totalStock: 0
//                             },
//                             companyId
//                         });
//                     }
//                 }
//             }
            
//             if (search && search.trim()) {
//                 const searchTerm = search.trim();
                
//                 let matchingCategories = [];
//                 if (searchTerm.length < 50) {
//                     try {
//                         matchingCategories = await Category.find({
//                             companyId,
//                             deletedAt: null,
//                             $or: [
//                                 { name: { $regex: searchTerm, $options: 'i' } },
//                                 { description: { $regex: searchTerm, $options: 'i' } }
//                             ]
//                         }).distinct('_id');
//                     } catch (err) {
//                         console.warn('Category search error:', err.message);
//                     }
//                 }
                
//                 query.$or = [
//                     { productName: { $regex: searchTerm, $options: 'i' } },
//                     { sku: { $regex: searchTerm, $options: 'i' } },
//                     { description: { $regex: searchTerm, $options: 'i' } },
//                     { brand: { $regex: searchTerm, $options: 'i' } }
//                 ];
                
//                 if (matchingCategories.length > 0) {
//                     query.$or.push({ category: { $in: matchingCategories } });
//                     query.$or.push({ subCategory: { $in: matchingCategories } });
//                 }
//             }

//             if (minPrice || maxPrice) {
//                 query.discountPrice = {};
//                 if (minPrice && !isNaN(parseFloat(minPrice))) {
//                     query.discountPrice.$gte = parseFloat(minPrice);
//                 }
//                 if (maxPrice && !isNaN(parseFloat(maxPrice))) {
//                     query.discountPrice.$lte = parseFloat(maxPrice);
//                 }
//             }

//             if (lowStock) {
//                 query.stock = { $lte: 5, $gt: 0 };
//             }

//             if (fromDate || toDate) {
//                 query.createdAt = {};
//                 if (fromDate) query.createdAt.$gte = new Date(fromDate);
//                 if (toDate) {
//                     const endDate = new Date(toDate);
//                     endDate.setHours(23, 59, 59, 999);
//                     query.createdAt.$lte = endDate;
//                 }
//             }

//             const total = await Product.countDocuments(query);
//             const products = await Product.find(query)
//                 .populate('category', 'name slug')
//                 .populate('subCategory', 'name slug')
//                 .sort({ createdAt: -1 })
//                 .skip(skip)
//                 .limit(limit)
//                 .lean();

//             const summary = await Product.aggregate([
//                 { $match: { 
//                     companyId: new mongoose.Types.ObjectId(companyId),
//                     deletedAt: null,
//                     ...(category && category !== 'all' && category !== 'null' && category !== '' ? { category: new mongoose.Types.ObjectId(category) } : {})
//                 }},
//                 {
//                     $group: {
//                         _id: null,
//                         totalValue: { $sum: { $multiply: ['$discountPrice', '$stock'] } },
//                         avgPrice: { $avg: '$discountPrice' },
//                         minPrice: { $min: '$discountPrice' },
//                         maxPrice: { $max: '$discountPrice' },
//                         totalStock: { $sum: '$stock' }
//                     }
//                 }
//             ]);

//             return NextResponse.json({
//                 success: true,
//                 data: products,
//                 pagination: {
//                     total,
//                     page,
//                     limit,
//                     totalPages: Math.ceil(total / limit)
//                 },
//                 summary: summary[0] || {
//                     totalValue: 0,
//                     avgPrice: 0,
//                     minPrice: 0,
//                     maxPrice: 0,
//                     totalStock: 0
//                 },
//                 companyId
//             });
//         }

//         return NextResponse.json({
//             success: false,
//             message: 'Invalid type parameter. Use: categories, products, stats, or recent'
//         }, { status: 400 });

//     } catch (error) {
//         console.error('GET masters error:', error);
        
//         if (error.name === 'CastError') {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Invalid ID format in query',
//                 error: 'Please provide valid identifiers'
//             }, { status: 400 });
//         }
        
//         return NextResponse.json({
//             success: false,
//             message: 'Failed to fetch data',
//             error: error.message
//         }, { status: 500 });
//     }
// }

// // ========== POST HANDLER (CREATE) ==========
// export async function POST(request) {
//     try {
//         await connectDB();
        
//         const session = await getServerSession(authOptions);
//         const companyId = await getCompanyContext(request);
        
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required'
//             }, { status: 400 });
//         }
        
//         // ✅ DEBUG: Log companyId to verify it's being received
//         console.log('Creating category for company:', companyId);
        
//         const { searchParams } = new URL(request.url);
//         const type = searchParams.get('type');
//         const body = await request.json();
//         const userId = session?.user?.id || body.userId || 'system';

//         // ===== CREATE CATEGORY =====
//         if (type === MASTER_TYPES.CATEGORIES) {
//             if (!body.name) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Category name is required'
//                 }, { status: 400 });
//             }

//             // ✅ Generate slug automatically from name
//             const slug = body.name
//                 .toLowerCase()
//                 .replace(/[^a-z0-9]+/g, '-')
//                 .replace(/^-|-$/g, '');

//             // Check if category name already exists in this company
//             const existing = await Category.findOne({
//                 companyId,
//                 name: body.name,
//                 parentId: body.parentId || null,
//                 deletedAt: null
//             });

//             if (existing) {
//                 return NextResponse.json({
//                     success: false,
//                     message: body.parentId 
//                         ? 'Subcategory already exists under this parent'
//                         : 'Category already exists in this company'
//                 }, { status: 409 });
//             }

//             // Verify parent category belongs to same company
//             if (body.parentId) {
//                 if (!isValidObjectId(body.parentId)) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Invalid parent category ID format'
//                     }, { status: 400 });
//                 }
                
//                 const parentExists = await Category.findOne({ 
//                     _id: body.parentId, 
//                     companyId,
//                     deletedAt: null 
//                 });
//                 if (!parentExists) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Parent category not found in this company'
//                     }, { status: 400 });
//                 }
//             }

//             // ✅ Create category with ALL fields including slug
//             const category = await Category.create({
//                 companyId,
//                 name: body.name,
//                 slug: slug,
//                 description: body.description || '',
//                 parentId: body.parentId || null,
//                 image: body.image || null,
//                 icon: body.icon || '📦',
//                 displayOrder: body.displayOrder || 0,
//                 isActive: body.isActive !== false,
//                 metaTitle: body.metaTitle || body.name,
//                 metaDescription: body.metaDescription || body.description || '',
//                 createdBy: userId
//             });

//             return NextResponse.json({
//                 success: true,
//                 message: body.parentId ? 'Subcategory created successfully' : 'Category created successfully',
//                 data: category
//             }, { status: 201 });
//         }

//         // ===== CREATE PRODUCT =====
//         if (type === MASTER_TYPES.PRODUCTS) {
//             // Make subCategory required
//             const required = ['productName', 'category', 'subCategory', 'mrp', 'discountPrice', 'stock', 'sku', 'hsnCode', 'gstRate'];
//             const missing = required.filter(field => !body[field] && body[field] !== 0);
            
//             if (missing.length > 0) {
//                 return NextResponse.json({
//                     success: false,
//                     message: `Missing required fields: ${missing.join(', ')}`
//                 }, { status: 400 });
//             }

//             if (!isValidObjectId(body.category)) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Invalid category ID format'
//                 }, { status: 400 });
//             }

//             // Check category exists in this company
//             const category = await Category.findOne({ 
//                 _id: body.category, 
//                 companyId,
//                 deletedAt: null 
//             });
//             if (!category) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Category not found in this company'
//                 }, { status: 400 });
//             }

//             // ===== ENHANCED SUBCATEGORY VALIDATION =====
//             // Validate subCategory
//             if (!isValidObjectId(body.subCategory)) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Invalid subCategory ID format'
//                 }, { status: 400 });
//             }
            
//             // Check subCategory exists in this company
//             const subCategory = await Category.findOne({ 
//                 _id: body.subCategory, 
//                 companyId,
//                 deletedAt: null 
//             });
//             if (!subCategory) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'SubCategory not found in this company'
//                 }, { status: 400 });
//             }
            
//             // Verify subCategory belongs to selected category
//             if (!subCategory.parentId || subCategory.parentId.toString() !== body.category.toString()) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Selected subCategory does not belong to the selected main category'
//                 }, { status: 400 });
//             }

//             // Check SKU uniqueness within company
//             const existing = await Product.findOne({ 
//                 companyId,
//                 sku: body.sku.toUpperCase(),
//                 deletedAt: null 
//             });
//             if (existing) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Product with this SKU already exists in your company'
//                 }, { status: 409 });
//             }

//             const product = await Product.create({
//                 companyId,
//                 ...body,
//                 sku: body.sku.toUpperCase(),
//                 isOnSale: parseFloat(body.discountPrice) < parseFloat(body.mrp),
//                 createdBy: userId
//             });

//             // Update product counts for categories
//             await Category.updateAllProductCounts(companyId);

//             // Populate for response
//             await product.populate('category', 'name slug');
//             await product.populate('subCategory', 'name slug');

//             return NextResponse.json({
//                 success: true,
//                 message: 'Product created successfully',
//                 data: product
//             }, { status: 201 });
//         }

//         return NextResponse.json({
//             success: false,
//             message: 'Invalid type parameter'
//         }, { status: 400 });

//     } catch (error) {
//         console.error('POST masters error:', error);
        
//         if (error.code === 11000) {
//             const field = Object.keys(error.keyPattern)[0];
//             return NextResponse.json({
//                 success: false,
//                 message: `${field} already exists in this company`
//             }, { status: 409 });
//         }

//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return NextResponse.json({
//                 success: false,
//                 message: errors.join(', ')
//             }, { status: 400 });
//         }

//         return NextResponse.json({
//             success: false,
//             message: 'Failed to create',
//             error: error.message
//         }, { status: 500 });
//     }
// }

// // ========== PUT HANDLER (UPDATE) ==========
// export async function PUT(request) {
//     try {
//         await connectDB();
        
//         const session = await getServerSession(authOptions);
//         const companyId = await getCompanyContext(request);
        
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required'
//             }, { status: 400 });
//         }
        
//         const { searchParams } = new URL(request.url);
//         const type = searchParams.get('type');
//         const id = searchParams.get('id');
//         const body = await request.json();
//         const userId = session?.user?.id || body.userId || 'system';

//         if (!id) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'ID is required'
//             }, { status: 400 });
//         }

//         if (!isValidObjectId(id)) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Invalid ID format'
//             }, { status: 400 });
//         }

//         // ===== UPDATE CATEGORY =====
//         if (type === MASTER_TYPES.CATEGORIES) {
//             const category = await Category.findOne({ 
//                 _id: id, 
//                 companyId,
//                 deletedAt: null 
//             });
//             if (!category) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Category not found in this company'
//                 }, { status: 404 });
//             }

//             if (body.parentId === id) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Category cannot be its own parent'
//                 }, { status: 400 });
//             }

//             if (body.parentId) {
//                 if (!isValidObjectId(body.parentId)) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Invalid parent category ID format'
//                     }, { status: 400 });
//                 }
                
//                 const parentExists = await Category.findOne({ 
//                     _id: body.parentId, 
//                     companyId,
//                     deletedAt: null 
//                 });
//                 if (!parentExists) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Parent category not found in this company'
//                     }, { status: 400 });
//                 }

//                 // Check for circular reference
//                 const descendants = await Category.find({ 
//                     parentId: id,
//                     companyId 
//                 }).distinct('_id');
//                 if (descendants.some(d => d.toString() === body.parentId.toString())) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Cannot move category under its own subcategory'
//                     }, { status: 400 });
//                 }
//             }

//             if (body.name && body.name !== category.name) {
//                 const duplicate = await Category.findOne({
//                     companyId,
//                     name: body.name,
//                     parentId: body.parentId !== undefined ? body.parentId : category.parentId,
//                     _id: { $ne: id },
//                     deletedAt: null
//                 });

//                 if (duplicate) {
//                     return NextResponse.json({
//                         success: false,
//                         message: body.parentId 
//                             ? 'Subcategory already exists under this parent'
//                             : 'Category already exists in this company'
//                     }, { status: 409 });
//                 }
//             }

//             const updated = await Category.findByIdAndUpdate(
//                 id,
//                 {
//                     name: body.name || category.name,
//                     description: body.description !== undefined ? body.description : category.description,
//                     parentId: body.parentId !== undefined ? body.parentId : category.parentId,
//                     image: body.image !== undefined ? body.image : category.image,
//                     icon: body.icon || category.icon,
//                     displayOrder: body.displayOrder !== undefined ? body.displayOrder : category.displayOrder,
//                     isActive: body.isActive !== undefined ? body.isActive : category.isActive,
//                     metaTitle: body.metaTitle || category.metaTitle,
//                     metaDescription: body.metaDescription !== undefined ? body.metaDescription : category.metaDescription,
//                     updatedBy: userId
//                 },
//                 { new: true }
//             );

//             return NextResponse.json({
//                 success: true,
//                 message: 'Category updated successfully',
//                 data: updated
//             });
//         }

//         // ===== UPDATE PRODUCT =====
//         if (type === MASTER_TYPES.PRODUCTS) {
//             const product = await Product.findOne({ 
//                 _id: id, 
//                 companyId,
//                 deletedAt: null 
//             });
//             if (!product) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Product not found in this company'
//                 }, { status: 404 });
//             }

//             if (body.sku && body.sku !== product.sku) {
//                 const existing = await Product.findOne({ 
//                     companyId,
//                     sku: body.sku.toUpperCase(),
//                     deletedAt: null,
//                     _id: { $ne: id }
//                 });
//                 if (existing) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Product with this SKU already exists in your company'
//                     }, { status: 409 });
//                 }
//             }

//             // Validate category if being updated
//             if (body.category && body.category !== product.category?.toString()) {
//                 if (!isValidObjectId(body.category)) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Invalid category ID format'
//                     }, { status: 400 });
//                 }
                
//                 const categoryExists = await Category.findOne({ 
//                     _id: body.category, 
//                     companyId,
//                     deletedAt: null 
//                 });
//                 if (!categoryExists) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Category not found in this company'
//                     }, { status: 400 });
//                 }
//             }

//             // ===== ENHANCED SUBCATEGORY VALIDATION FOR UPDATE =====
//             if (body.subCategory) {
//                 if (!isValidObjectId(body.subCategory)) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Invalid subCategory ID format'
//                     }, { status: 400 });
//                 }
                
//                 const subCategory = await Category.findOne({ 
//                     _id: body.subCategory, 
//                     companyId,
//                     deletedAt: null 
//                 });
//                 if (!subCategory) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'SubCategory not found in this company'
//                     }, { status: 400 });
//                 }
                
//                 // Determine which category to check against
//                 const categoryId = body.category || product.category;
                
//                 // Verify subCategory belongs to the main category
//                 if (!subCategory.parentId || subCategory.parentId.toString() !== categoryId?.toString()) {
//                     return NextResponse.json({
//                         success: false,
//                         message: 'Selected subCategory does not belong to the selected main category'
//                     }, { status: 400 });
//                 }
//             }

//             const updated = await Product.findByIdAndUpdate(
//                 id,
//                 {
//                     ...body,
//                     sku: body.sku ? body.sku.toUpperCase() : product.sku,
//                     isOnSale: body.discountPrice ? 
//                         parseFloat(body.discountPrice) < (parseFloat(body.mrp) || parseFloat(product.mrp)) : 
//                         product.isOnSale,
//                     updatedBy: userId
//                 },
//                 { new: true, runValidators: true }
//             ).populate('category', 'name slug')
//              .populate('subCategory', 'name slug');

//             // Update product counts for categories
//             await Category.updateAllProductCounts(companyId);

//             return NextResponse.json({
//                 success: true,
//                 message: 'Product updated successfully',
//                 data: updated
//             });
//         }

//         return NextResponse.json({
//             success: false,
//             message: 'Invalid type parameter'
//         }, { status: 400 });

//     } catch (error) {
//         console.error('PUT masters error:', error);
        
//         if (error.code === 11000) {
//             const field = Object.keys(error.keyPattern)[0];
//             return NextResponse.json({
//                 success: false,
//                 message: `${field} already exists in this company`
//             }, { status: 409 });
//         }

//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return NextResponse.json({
//                 success: false,
//                 message: errors.join(', ')
//             }, { status: 400 });
//         }

//         return NextResponse.json({
//             success: false,
//             message: 'Failed to update',
//             error: error.message
//         }, { status: 500 });
//     }
// }

// // ========== DELETE HANDLER ==========
// export async function DELETE(request) {
//     try {
//         await connectDB();
        
//         const session = await getServerSession(authOptions);
//         const companyId = await getCompanyContext(request);
        
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required'
//             }, { status: 400 });
//         }
        
//         const { searchParams } = new URL(request.url);
//         const type = searchParams.get('type');
//         const id = searchParams.get('id');
//         const ids = searchParams.get('ids')?.split(',');
//         const permanent = searchParams.get('permanent') === 'true';
//         const userId = session?.user?.id || 'system';

//         if (!id && !ids) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'ID or IDs required'
//             }, { status: 400 });
//         }

//         // ===== DELETE CATEGORIES =====
//         if (type === MASTER_TYPES.CATEGORIES) {
//             const deleteIds = ids || [id];
//             const validIds = deleteIds.filter(id => isValidObjectId(id));
            
//             if (validIds.length === 0) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'No valid category IDs provided'
//                 }, { status: 400 });
//             }

//             // Verify all categories belong to this company
//             const categories = await Category.find({ 
//                 _id: { $in: validIds },
//                 companyId 
//             }).select('_id');
            
//             if (categories.length !== validIds.length) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Some categories do not belong to this company'
//                 }, { status: 403 });
//             }

//             // Check if categories have products (as category or subCategory)
//             const categoriesWithProducts = await Product.distinct('category', {
//                 companyId,
//                 $or: [
//                     { category: { $in: validIds } },
//                     { subCategory: { $in: validIds } }
//                 ],
//                 deletedAt: null
//             });

//             if (categoriesWithProducts.length > 0) {
//                 const cats = await Category.find({
//                     _id: { $in: categoriesWithProducts }
//                 }).select('name');

//                 return NextResponse.json({
//                     success: false,
//                     message: 'Cannot delete categories that have products',
//                     categories: cats.map(c => c.name)
//                 }, { status: 409 });
//             }

//             // Check if categories have subcategories
//             const categoriesWithSubs = await Category.find({
//                 companyId,
//                 parentId: { $in: validIds },
//                 deletedAt: null
//             }).distinct('parentId');

//             if (categoriesWithSubs.length > 0) {
//                 const cats = await Category.find({
//                     _id: { $in: categoriesWithSubs }
//                 }).select('name');

//                 return NextResponse.json({
//                     success: false,
//                     message: 'Cannot delete categories that have subcategories',
//                     categories: cats.map(c => c.name)
//                 }, { status: 409 });
//             }

//             if (permanent) {
//                 await Category.deleteMany({ _id: { $in: validIds }, companyId });
//             } else {
//                 await Category.updateMany(
//                     { _id: { $in: validIds }, companyId },
//                     { 
//                         deletedAt: new Date(),
//                         deletedBy: userId,
//                         isActive: false
//                     }
//                 );
//             }

//             return NextResponse.json({
//                 success: true,
//                 message: `Successfully ${permanent ? 'permanently deleted' : 'deactivated'} ${validIds.length} categories`
//             });
//         }

//         // ===== DELETE PRODUCTS =====
//         if (type === MASTER_TYPES.PRODUCTS) {
//             const deleteIds = ids || [id];
//             const validIds = deleteIds.filter(id => isValidObjectId(id));
            
//             if (validIds.length === 0) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'No valid product IDs provided'
//                 }, { status: 400 });
//             }

//             // Verify all products belong to this company
//             const products = await Product.find({ 
//                 _id: { $in: validIds },
//                 companyId 
//             }).select('_id');
            
//             if (products.length !== validIds.length) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Some products do not belong to this company'
//                 }, { status: 403 });
//             }
            
//             // Check if products are in orders
//             const Order = (await import('@/models/Order')).default;
//             const productsInOrders = await Order.distinct('items.productId', {
//                 companyId,
//                 'items.productId': { $in: validIds }
//             });

//             if (productsInOrders.length > 0) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Cannot delete products that are in orders'
//                 }, { status: 409 });
//             }

//             if (permanent) {
//                 await Product.deleteMany({ _id: { $in: validIds }, companyId });
//             } else {
//                 await Product.updateMany(
//                     { _id: { $in: validIds }, companyId },
//                     { 
//                         deletedAt: new Date(),
//                         deletedBy: userId,
//                         isActive: false
//                     }
//                 );
//             }

//             await Category.updateAllProductCounts(companyId);

//             return NextResponse.json({
//                 success: true,
//                 message: `Successfully ${permanent ? 'permanently deleted' : 'deactivated'} ${validIds.length} products`
//             });
//         }

//         return NextResponse.json({
//             success: false,
//             message: 'Invalid type parameter'
//         }, { status: 400 });

//     } catch (error) {
//         console.error('DELETE masters error:', error);
//         return NextResponse.json({
//             success: false,
//             message: 'Failed to delete',
//             error: error.message
//         }, { status: 500 });
//     }
// }

// // ========== PATCH HANDLER (PARTIAL UPDATES) ==========
// export async function PATCH(request) {
//     try {
//         await connectDB();
        
//         const session = await getServerSession(authOptions);
//         const companyId = await getCompanyContext(request);
        
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required'
//             }, { status: 400 });
//         }
        
//         const { searchParams } = new URL(request.url);
//         const type = searchParams.get('type');
//         const body = await request.json();
//         const userId = session?.user?.id || body.userId || 'system';

//         // ===== TOGGLE ACTIVE STATUS =====
//         if (body.action === 'toggle-status') {
//             const { id, isActive } = body;

//             if (!isValidObjectId(id)) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Invalid ID format'
//                 }, { status: 400 });
//             }

//             let Model;
//             let modelName;
            
//             if (type === MASTER_TYPES.CATEGORIES) {
//                 Model = Category;
//                 modelName = 'Category';
//             } else if (type === MASTER_TYPES.PRODUCTS) {
//                 Model = Product;
//                 modelName = 'Product';
//             } else {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Invalid type for toggle'
//                 }, { status: 400 });
//             }

//             // Verify item belongs to this company
//             const item = await Model.findOne({ _id: id, companyId });
//             if (!item) {
//                 return NextResponse.json({
//                     success: false,
//                     message: `${modelName} not found in this company`
//                 }, { status: 404 });
//             }

//             const updated = await Model.findByIdAndUpdate(
//                 id,
//                 { 
//                     isActive, 
//                     updatedBy: userId 
//                 },
//                 { new: true }
//             );

//             if (type === MASTER_TYPES.CATEGORIES) {
//                 await Category.updateAllProductCounts(companyId);
//             }

//             return NextResponse.json({
//                 success: true,
//                 message: `${modelName} ${isActive ? 'activated' : 'deactivated'} successfully`,
//                 data: updated
//             });
//         }

//         // ===== BULK UPDATE =====
//         if (body.action === 'bulk-update') {
//             const { ids, data } = body;

//             if (!ids || !Array.isArray(ids) || ids.length === 0) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'No IDs provided'
//                 }, { status: 400 });
//             }

//             const validIds = ids.filter(id => isValidObjectId(id));
            
//             if (validIds.length === 0) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'No valid IDs provided'
//                 }, { status: 400 });
//             }

//             // Verify all items belong to this company
//             let Model;
//             if (type === MASTER_TYPES.CATEGORIES) {
//                 Model = Category;
//             } else if (type === MASTER_TYPES.PRODUCTS) {
//                 Model = Product;
//             } else {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Invalid type for bulk update'
//                 }, { status: 400 });
//             }

//             const items = await Model.find({ 
//                 _id: { $in: validIds },
//                 companyId 
//             }).select('_id');
            
//             if (items.length !== validIds.length) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Some items do not belong to this company'
//                 }, { status: 403 });
//             }

//             const result = await Model.updateMany(
//                 { _id: { $in: validIds }, companyId },
//                 { 
//                     $set: { 
//                         ...data, 
//                         updatedBy: userId,
//                         updatedAt: new Date()
//                     } 
//                 }
//             );

//             if (type === MASTER_TYPES.CATEGORIES) {
//                 await Category.updateAllProductCounts(companyId);
//             }

//             return NextResponse.json({
//                 success: true,
//                 message: `Successfully updated ${result.modifiedCount} items`
//             });
//         }

//         // ===== REORDER CATEGORIES =====
//         if (body.action === 'reorder' && type === MASTER_TYPES.CATEGORIES) {
//             const { items } = body;

//             if (!items || !Array.isArray(items)) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Invalid reorder data'
//                 }, { status: 400 });
//             }

//             const validItems = items.filter(item => isValidObjectId(item.id));
            
//             if (validItems.length === 0) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'No valid category IDs for reorder'
//                 }, { status: 400 });
//             }

//             // Verify all categories belong to this company
//             const categoryIds = validItems.map(item => item.id);
//             const categories = await Category.find({ 
//                 _id: { $in: categoryIds },
//                 companyId 
//             }).select('_id');
            
//             if (categories.length !== validItems.length) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Some categories do not belong to this company'
//                 }, { status: 403 });
//             }

//             const operations = validItems.map(item => ({
//                 updateOne: {
//                     filter: { _id: item.id, companyId },
//                     update: { 
//                         $set: { 
//                             displayOrder: item.displayOrder,
//                             updatedBy: userId,
//                             updatedAt: new Date()
//                         }
//                     }
//                 }
//             }));

//             await Category.bulkWrite(operations);

//             return NextResponse.json({
//                 success: true,
//                 message: 'Categories reordered successfully'
//             });
//         }

//         // ===== RESTORE SOFT DELETED =====
//         if (body.action === 'restore' && type === MASTER_TYPES.CATEGORIES) {
//             const { id } = body;

//             if (!isValidObjectId(id)) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Invalid category ID'
//                 }, { status: 400 });
//             }

//             const category = await Category.findOne({ 
//                 _id: id, 
//                 companyId 
//             });
            
//             if (!category) {
//                 return NextResponse.json({
//                     success: false,
//                     message: 'Category not found in this company'
//                 }, { status: 404 });
//             }

//             await category.restore();

//             return NextResponse.json({
//                 success: true,
//                 message: 'Category restored successfully',
//                 data: category
//             });
//         }

//         return NextResponse.json({
//             success: false,
//             message: 'Invalid action'
//         }, { status: 400 });

//     } catch (error) {
//         console.error('PATCH masters error:', error);
//         return NextResponse.json({
//             success: false,
//             message: 'Failed to update',
//             error: error.message
//         }, { status: 500 });
//     }
// }

// // ========== OPTIONS HANDLER ==========
// export async function OPTIONS() {
//     return NextResponse.json({
//         success: true,
//         message: 'Multi-tenant Masters API - Categories and Products only',
//         types: ['categories', 'products', 'stats', 'recent'],
//         methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//         description: 'Unified API for Categories and Products management with company isolation',
//         endpoints: {
//             GET: {
//                 description: 'Fetch data',
//                 required: ['companyId'],
//                 examples: [
//                     '/api/masters?companyId=xxx&type=categories',
//                     '/api/masters?companyId=xxx&type=categories&format=tree',
//                     '/api/masters?companyId=xxx&type=products&id=123',
//                     '/api/masters?companyId=xxx&type=stats',
//                     '/api/masters?companyId=xxx&type=recent'
//                 ]
//             },
//             POST: {
//                 description: 'Create new item',
//                 required: ['companyId'],
//                 examples: [
//                     '/api/masters?companyId=xxx&type=categories -d {"name":"Electronics"}',
//                     '/api/masters?companyId=xxx&type=categories -d {"name":"Mobile Phones","parentId":"cat_id"}',
//                     '/api/masters?companyId=xxx&type=products -d {"productName":"iPhone","category":"cat_id","subCategory":"subcat_id","mrp":999,"discountPrice":899,"stock":10,"sku":"IPHONE15","hsnCode":"8517","gstRate":18}'
//                 ]
//             },
//             PUT: {
//                 description: 'Update existing item',
//                 required: ['companyId'],
//                 examples: [
//                     '/api/masters?companyId=xxx&type=products&id=123 -d {"discountPrice":899}'
//                 ]
//             },
//             DELETE: {
//                 description: 'Delete single or multiple items (soft delete by default)',
//                 required: ['companyId'],
//                 examples: [
//                     '/api/masters?companyId=xxx&type=categories&id=123',
//                     '/api/masters?companyId=xxx&type=products&ids=id1,id2,id3&permanent=true'
//                 ]
//             },
//             PATCH: {
//                 description: 'Partial updates',
//                 required: ['companyId'],
//                 examples: [
//                     '/api/masters?companyId=xxx&type=products -d {"action":"toggle-status","id":"123","isActive":false}',
//                     '/api/masters?companyId=xxx&type=categories -d {"action":"reorder","items":[{"id":"123","displayOrder":1}]}',
//                     '/api/masters?companyId=xxx&type=categories -d {"action":"restore","id":"123"}'
//                 ]
//             }
//         }
//     }, { 
//         status: 200,
//         headers: {
//             'Allow': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//             'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID'
//         }
//     });
// }











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
    return mongoose.Types.ObjectId.isValid(id) && 
           /^[0-9a-fA-F]{24}$/.test(id);
};

const getCompanyContext = async (request) => {
    try {
        // ===== PRIORITY 1: Headers (for modern frontend) =====
        const headersCompanyId = request.headers.get('x-company-id');
        if (headersCompanyId && isValidObjectId(headersCompanyId)) {
            const company = await Company.findById(headersCompanyId);
            if (company && company.status === 'active' && !company.deletedAt) {
                return headersCompanyId.toString();
            }
        }
        
        // ===== PRIORITY 2: URL Query Parameter (explicit) =====
        const urlCompanyId = request.nextUrl?.searchParams.get('companyId');
        if (urlCompanyId && isValidObjectId(urlCompanyId)) {
            const company = await Company.findById(urlCompanyId);
            if (company && company.status === 'active' && !company.deletedAt) {
                return urlCompanyId.toString();
            }
        }
        
        // ===== PRIORITY 3: User Session (BACKWARD COMPATIBLE) =====
        // This ensures ALL existing admin pages work without any changes
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('@/lib/nextauth');
        const session = await getServerSession(authOptions);
        
        if (session?.user?.companyId && isValidObjectId(session.user.companyId)) {
            const company = await Company.findById(session.user.companyId);
            if (company && company.status === 'active' && !company.deletedAt) {
                return session.user.companyId.toString();
            }
        }
        
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

// ========== HELPER FUNCTION FOR PRODUCT COUNT UPDATE ==========
const safeUpdateProductCounts = async (companyId) => {
    try {
        if (Category && typeof Category.updateAllProductCounts === 'function') {
            await Category.updateAllProductCounts(companyId);
        } else {
            console.warn('Category.updateAllProductCounts is not available');
        }
    } catch (error) {
        console.warn('Failed to update product counts:', error.message);
        // Don't throw - just log, so it doesn't break the main operation
    }
};

// ========== GET HANDLER ==========
export async function GET(request) {
    try {
        await connectDB();
        
        // Get company context
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'Missing or invalid company ID'
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

        // ===== GET STATS FOR CATEGORIES AND PRODUCTS =====
        if (type === MASTER_TYPES.STATS) {
            // Category stats within company
            const categoryQuery = { companyId, deletedAt: null };
            const totalCategories = await Category.countDocuments(categoryQuery);
            const activeCategories = await Category.countDocuments({ 
                ...categoryQuery, 
                isActive: true 
            });
            const mainCategories = await Category.countDocuments({ 
                ...categoryQuery, 
                parentId: null 
            });
            const subCategories = await Category.countDocuments({ 
                ...categoryQuery, 
                parentId: { $ne: null } 
            });

            // Product stats within company
            const productQuery = { companyId, deletedAt: null };
            const totalProducts = await Product.countDocuments(productQuery);
            const activeProducts = await Product.countDocuments({ 
                ...productQuery, 
                isActive: true 
            });
            const lowStockProducts = await Product.countDocuments({ 
                ...productQuery, 
                stock: { $lte: 5, $gt: 0 },
                isActive: true 
            });
            const outOfStockProducts = await Product.countDocuments({ 
                ...productQuery, 
                stock: 0,
                isActive: true 
            });

            // Get category distribution within company
            const categoryDistribution = await Product.aggregate([
                { $match: { 
                    companyId: new mongoose.Types.ObjectId(companyId), 
                    category: { $ne: null },
                    deletedAt: null 
                }},
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
                },
                companyId
            });
        }

        // ===== GET RECENT ITEMS ACROSS CATEGORIES AND PRODUCTS =====
        if (type === MASTER_TYPES.RECENT) {
            const recentLimit = parseInt(searchParams.get('limit')) || 10;
            
            const [recentCategories, recentProducts] = await Promise.all([
                Category.find({ 
                    companyId, 
                    deletedAt: null 
                })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('name createdAt parentId')
                    .lean(),
                Product.find({ 
                    companyId, 
                    deletedAt: null 
                })
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
                    category: p.category?.name || 'Uncategorized',
                    subCategory: p.subCategory?.name || ''
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
            if (id) {
                if (!isValidObjectId(id)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid category ID format'
                    }, { status: 400 });
                }

                const category = await Category.findOne({ 
                    _id: id, 
                    companyId,
                    ...(includeDeleted ? {} : { deletedAt: null })
                })
                    .populate({
                        path: 'subcategories',
                        match: { deletedAt: null },
                        options: { sort: { displayOrder: 1, name: 1 } }
                    })
                    .lean();

                if (!category) {
                    return NextResponse.json({
                        success: false,
                        message: 'Category not found in this company'
                    }, { status: 404 });
                }

                if (category.parentId) {
                    category.parent = await Category.findOne({ 
                        _id: category.parentId,
                        companyId,
                        deletedAt: null 
                    })
                        .select('name slug')
                        .lean();
                }

                // Get product count for this category within company
                const productCount = await Product.countDocuments({ 
                    companyId,
                    $or: [
                        { category: category._id },
                        { subCategory: category._id }
                    ],
                    deletedAt: null 
                });

                // Get subcategory count
                const subCategoryCount = await Category.countDocuments({ 
                    companyId,
                    parentId: category._id,
                    deletedAt: null 
                });

                // Get full path for breadcrumb
                const path = await Category.getCategoryPath(companyId, category._id);

                return NextResponse.json({
                    success: true,
                    data: {
                        ...category,
                        productCount,
                        subCategoryCount,
                        path
                    },
                    companyId
                });
            }

            let query = { companyId, deletedAt: null };
            
            if (status === 'active') query.isActive = true;
            else if (status === 'inactive') query.isActive = false;
            
            if (parentId !== undefined && parentId !== null) {
                if (parentId === 'null' || parentId === '') {
                    query.parentId = null;
                } else if (isValidObjectId(parentId)) {
                    // Verify parent belongs to same company
                    const parentExists = await Category.findOne({ 
                        _id: parentId, 
                        companyId,
                        deletedAt: null 
                    });
                    if (parentExists) {
                        query.parentId = parentId;
                    } else {
                        // If parent doesn't exist, return empty result
                        return NextResponse.json({
                            success: true,
                            data: [],
                            pagination: {
                                total: 0,
                                page,
                                limit,
                                totalPages: 0
                            },
                            companyId
                        });
                    }
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
            
            let categories = await Category.find(query)
                .sort({ displayOrder: 1, name: 1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // Get product counts for each category within company (including as subCategory)
            const categoryIds = categories.map(c => c._id);
            const productCounts = await Product.aggregate([
                { $match: { 
                    companyId: new mongoose.Types.ObjectId(companyId),
                    $or: [
                        { category: { $in: categoryIds } },
                        { subCategory: { $in: categoryIds } }
                    ],
                    deletedAt: null 
                }},
                { $group: {
                    _id: null,
                    byCategory: { $push: { category: '$category', subCategory: '$subCategory' } }
                }}
            ]);

            // Get subcategory counts
            const subCounts = await Category.aggregate([
                { $match: { 
                    companyId: new mongoose.Types.ObjectId(companyId),
                    parentId: { $in: categoryIds },
                    deletedAt: null 
                }},
                { $group: {
                    _id: '$parentId',
                    count: { $sum: 1 }
                }}
            ]);

            const productCountMap = {};
            if (productCounts.length > 0) {
                productCounts[0].byCategory.forEach(item => {
                    if (item.category) productCountMap[item.category] = (productCountMap[item.category] || 0) + 1;
                    if (item.subCategory) productCountMap[item.subCategory] = (productCountMap[item.subCategory] || 0) + 1;
                });
            }

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
                const tree = await Category.getTree(companyId, includeInactive);
                
                return NextResponse.json({
                    success: true,
                    data: tree,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    },
                    companyId
                });
            }

            // Flat format with levels
            if (format === 'flat') {
                const flatList = await Category.getFlatList(companyId, includeInactive);
                
                return NextResponse.json({
                    success: true,
                    data: flatList,
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
            if (id) {
                if (!isValidObjectId(id)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid product ID format'
                    }, { status: 400 });
                }

                const product = await Product.findOne({ 
                    _id: id, 
                    companyId,
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

            let query = { companyId, deletedAt: null };
            
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
            
            if (category && category !== 'all' && category !== 'null' && category !== '') {
                if (isValidObjectId(category)) {
                    // Verify category belongs to this company
                    const catExists = await Category.findOne({ 
                        _id: category, 
                        companyId,
                        deletedAt: null 
                    });
                    if (catExists) {
                        query.category = new mongoose.Types.ObjectId(category);
                    } else {
                        // If category doesn't exist, return empty result
                        return NextResponse.json({
                            success: true,
                            data: [],
                            pagination: {
                                total: 0,
                                page,
                                limit,
                                totalPages: 0
                            },
                            summary: {
                                totalValue: 0,
                                avgPrice: 0,
                                minPrice: 0,
                                maxPrice: 0,
                                totalStock: 0
                            },
                            companyId
                        });
                    }
                }
            }
            
            if (search && search.trim()) {
                const searchTerm = search.trim();
                
                let matchingCategories = [];
                if (searchTerm.length < 50) {
                    try {
                        matchingCategories = await Category.find({
                            companyId,
                            deletedAt: null,
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

            const summary = await Product.aggregate([
                { $match: { 
                    companyId: new mongoose.Types.ObjectId(companyId),
                    deletedAt: null,
                    ...(category && category !== 'all' && category !== 'null' && category !== '' ? { category: new mongoose.Types.ObjectId(category) } : {})
                }},
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
        
        const session = await getServerSession(authOptions);
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        // ✅ DEBUG: Log companyId to verify it's being received
        console.log('Creating category for company:', companyId);
        
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const body = await request.json();
        
        // ✅ FIX: Properly handle userId - try multiple sources
        let userId = session?.user?.id || body.createdBy || body.userId;
        
        // ✅ If still no userId, try to find an admin user for this company
        if (!userId || userId === 'system') {
            try {
                const User = mongoose.model('User');
                const adminUser = await User.findOne({ 
                    companyId: companyId,
                    role: { $in: ['admin', 'superadmin'] }
                }).select('_id');
                
                if (adminUser) {
                    userId = adminUser._id;
                    console.log('Using found admin user ID:', userId);
                } else {
                    // Last resort - use a dummy ID but log warning
                    console.warn('No admin user found for company, using system fallback');
                    userId = 'system';
                }
            } catch (userError) {
                console.warn('Could not find admin user:', userError.message);
                userId = 'system';
            }
        }

        // ===== CREATE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            if (!body.name) {
                return NextResponse.json({
                    success: false,
                    message: 'Category name is required'
                }, { status: 400 });
            }

            // ✅ Generate slug automatically from name
            const slug = body.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Check if category name already exists in this company
            const existing = await Category.findOne({
                companyId,
                name: body.name,
                parentId: body.parentId || null,
                deletedAt: null
            });

            if (existing) {
                return NextResponse.json({
                    success: false,
                    message: body.parentId 
                        ? 'Subcategory already exists under this parent'
                        : 'Category already exists in this company'
                }, { status: 409 });
            }

            // Verify parent category belongs to same company
            if (body.parentId) {
                if (!isValidObjectId(body.parentId)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid parent category ID format'
                    }, { status: 400 });
                }
                
                const parentExists = await Category.findOne({ 
                    _id: body.parentId, 
                    companyId,
                    deletedAt: null 
                });
                if (!parentExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Parent category not found in this company'
                    }, { status: 400 });
                }
            }

            // ✅ FIXED: Explicitly set isActive to true for new categories
            const isActive = body.isActive === undefined ? true : body.isActive;
            
            // ✅ Create category with ALL fields
            const categoryData = {
                companyId,
                name: body.name,
                slug: slug,
                description: body.description || '',
                parentId: body.parentId || null,
                image: body.image || null,
                icon: body.icon || '📦',
                displayOrder: body.displayOrder || 0,
                isActive: isActive,
                metaTitle: body.metaTitle || body.name,
                metaDescription: body.metaDescription || body.description || '',
                createdBy: userId
            };
            
            console.log('Creating category with data:', { ...categoryData, createdBy: userId });
            
            const category = await Category.create(categoryData);

            console.log(`✅ Category created: ${category.name} (ID: ${category._id}) with isActive: ${category.isActive}`);

            return NextResponse.json({
                success: true,
                message: body.parentId ? 'Subcategory created successfully' : 'Category created successfully',
                data: category
            }, { status: 201 });
        }

        // ===== CREATE PRODUCT =====
        if (type === MASTER_TYPES.PRODUCTS) {
            // Make subCategory required
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

            // Check category exists in this company
            const category = await Category.findOne({ 
                _id: body.category, 
                companyId,
                deletedAt: null 
            });
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found in this company'
                }, { status: 400 });
            }

            // ===== ENHANCED SUBCATEGORY VALIDATION =====
            // Validate subCategory
            if (!isValidObjectId(body.subCategory)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid subCategory ID format'
                }, { status: 400 });
            }
            
            // Check subCategory exists in this company
            const subCategory = await Category.findOne({ 
                _id: body.subCategory, 
                companyId,
                deletedAt: null 
            });
            if (!subCategory) {
                return NextResponse.json({
                    success: false,
                    message: 'SubCategory not found in this company'
                }, { status: 400 });
            }
            
            // Verify subCategory belongs to selected category
            if (!subCategory.parentId || subCategory.parentId.toString() !== body.category.toString()) {
                return NextResponse.json({
                    success: false,
                    message: 'Selected subCategory does not belong to the selected main category'
                }, { status: 400 });
            }

            // Check SKU uniqueness within company
            const existing = await Product.findOne({ 
                companyId,
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
                companyId,
                ...body,
                sku: body.sku.toUpperCase(),
                isOnSale: parseFloat(body.discountPrice) < parseFloat(body.mrp),
                createdBy: userId
            });

            // Update product counts for categories (safe)
            await safeUpdateProductCounts(companyId);

            // Populate for response
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
        
        const session = await getServerSession(authOptions);
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        const body = await request.json();
        const userId = session?.user?.id || body.userId || 'system';

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required'
            }, { status: 400 });
        }

        if (!isValidObjectId(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid ID format'
            }, { status: 400 });
        }

        // ===== UPDATE CATEGORY =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const category = await Category.findOne({ 
                _id: id, 
                companyId,
                deletedAt: null 
            });
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found in this company'
                }, { status: 404 });
            }

            if (body.parentId === id) {
                return NextResponse.json({
                    success: false,
                    message: 'Category cannot be its own parent'
                }, { status: 400 });
            }

            if (body.parentId) {
                if (!isValidObjectId(body.parentId)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid parent category ID format'
                    }, { status: 400 });
                }
                
                const parentExists = await Category.findOne({ 
                    _id: body.parentId, 
                    companyId,
                    deletedAt: null 
                });
                if (!parentExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Parent category not found in this company'
                    }, { status: 400 });
                }

                // Check for circular reference
                const descendants = await Category.find({ 
                    parentId: id,
                    companyId 
                }).distinct('_id');
                if (descendants.some(d => d.toString() === body.parentId.toString())) {
                    return NextResponse.json({
                        success: false,
                        message: 'Cannot move category under its own subcategory'
                    }, { status: 400 });
                }
            }

            if (body.name && body.name !== category.name) {
                const duplicate = await Category.findOne({
                    companyId,
                    name: body.name,
                    parentId: body.parentId !== undefined ? body.parentId : category.parentId,
                    _id: { $ne: id },
                    deletedAt: null
                });

                if (duplicate) {
                    return NextResponse.json({
                        success: false,
                        message: body.parentId 
                            ? 'Subcategory already exists under this parent'
                            : 'Category already exists in this company'
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
                    updatedBy: userId
                },
                { new: true }
            );

            // Update product counts (safe)
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
                companyId,
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
                    companyId,
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

            // Validate category if being updated
            if (body.category && body.category !== product.category?.toString()) {
                if (!isValidObjectId(body.category)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid category ID format'
                    }, { status: 400 });
                }
                
                const categoryExists = await Category.findOne({ 
                    _id: body.category, 
                    companyId,
                    deletedAt: null 
                });
                if (!categoryExists) {
                    return NextResponse.json({
                        success: false,
                        message: 'Category not found in this company'
                    }, { status: 400 });
                }
            }

            // ===== ENHANCED SUBCATEGORY VALIDATION FOR UPDATE =====
            if (body.subCategory) {
                if (!isValidObjectId(body.subCategory)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid subCategory ID format'
                    }, { status: 400 });
                }
                
                const subCategory = await Category.findOne({ 
                    _id: body.subCategory, 
                    companyId,
                    deletedAt: null 
                });
                if (!subCategory) {
                    return NextResponse.json({
                        success: false,
                        message: 'SubCategory not found in this company'
                    }, { status: 400 });
                }
                
                // Determine which category to check against
                const categoryId = body.category || product.category;
                
                // Verify subCategory belongs to the main category
                if (!subCategory.parentId || subCategory.parentId.toString() !== categoryId?.toString()) {
                    return NextResponse.json({
                        success: false,
                        message: 'Selected subCategory does not belong to the selected main category'
                    }, { status: 400 });
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

            // Update product counts for categories (safe)
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

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                success: false,
                message: errors.join(', ')
            }, { status: 400 });
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
        
        const session = await getServerSession(authOptions);
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        const ids = searchParams.get('ids')?.split(',');
        const permanent = searchParams.get('permanent') === 'true';
        const userId = session?.user?.id || 'system';

        if (!id && !ids) {
            return NextResponse.json({
                success: false,
                message: 'ID or IDs required'
            }, { status: 400 });
        }

        // ===== DELETE CATEGORIES =====
        if (type === MASTER_TYPES.CATEGORIES) {
            const deleteIds = ids || [id];
            const validIds = deleteIds.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid category IDs provided'
                }, { status: 400 });
            }

            // Verify all categories belong to this company
            const categories = await Category.find({ 
                _id: { $in: validIds },
                companyId 
            }).select('_id');
            
            if (categories.length !== validIds.length) {
                return NextResponse.json({
                    success: false,
                    message: 'Some categories do not belong to this company'
                }, { status: 403 });
            }

            // Check if categories have products (as category or subCategory)
            const categoriesWithProducts = await Product.distinct('category', {
                companyId,
                $or: [
                    { category: { $in: validIds } },
                    { subCategory: { $in: validIds } }
                ],
                deletedAt: null
            });

            if (categoriesWithProducts.length > 0) {
                const cats = await Category.find({
                    _id: { $in: categoriesWithProducts }
                }).select('name');

                return NextResponse.json({
                    success: false,
                    message: 'Cannot delete categories that have products',
                    categories: cats.map(c => c.name)
                }, { status: 409 });
            }

            // Check if categories have subcategories
            const categoriesWithSubs = await Category.find({
                companyId,
                parentId: { $in: validIds },
                deletedAt: null
            }).distinct('parentId');

            if (categoriesWithSubs.length > 0) {
                const cats = await Category.find({
                    _id: { $in: categoriesWithSubs }
                }).select('name');

                return NextResponse.json({
                    success: false,
                    message: 'Cannot delete categories that have subcategories',
                    categories: cats.map(c => c.name)
                }, { status: 409 });
            }

            if (permanent) {
                await Category.deleteMany({ _id: { $in: validIds }, companyId });
            } else {
                await Category.updateMany(
                    { _id: { $in: validIds }, companyId },
                    { 
                        deletedAt: new Date(),
                        deletedBy: userId,
                        isActive: false
                    }
                );
            }

            return NextResponse.json({
                success: true,
                message: `Successfully ${permanent ? 'permanently deleted' : 'deactivated'} ${validIds.length} categories`
            });
        }

        // ===== DELETE PRODUCTS =====
        if (type === MASTER_TYPES.PRODUCTS) {
            const deleteIds = ids || [id];
            const validIds = deleteIds.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid product IDs provided'
                }, { status: 400 });
            }

            // Verify all products belong to this company
            const products = await Product.find({ 
                _id: { $in: validIds },
                companyId 
            }).select('_id');
            
            if (products.length !== validIds.length) {
                return NextResponse.json({
                    success: false,
                    message: 'Some products do not belong to this company'
                }, { status: 403 });
            }
            
            // Check if products are in orders
            const Order = (await import('@/models/Order')).default;
            const productsInOrders = await Order.distinct('items.productId', {
                companyId,
                'items.productId': { $in: validIds }
            });

            if (productsInOrders.length > 0) {
                return NextResponse.json({
                    success: false,
                    message: 'Cannot delete products that are in orders'
                }, { status: 409 });
            }

            if (permanent) {
                await Product.deleteMany({ _id: { $in: validIds }, companyId });
            } else {
                await Product.updateMany(
                    { _id: { $in: validIds }, companyId },
                    { 
                        deletedAt: new Date(),
                        deletedBy: userId,
                        isActive: false
                    }
                );
            }

            // Update product counts for categories (safe)
            await safeUpdateProductCounts(companyId);

            return NextResponse.json({
                success: true,
                message: `Successfully ${permanent ? 'permanently deleted' : 'deactivated'} ${validIds.length} products`
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
        const companyId = await getCompanyContext(request);
        
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required'
            }, { status: 400 });
        }
        
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const body = await request.json();
        const userId = session?.user?.id || body.userId || 'system';

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

            // Verify item belongs to this company
            const item = await Model.findOne({ _id: id, companyId });
            if (!item) {
                return NextResponse.json({
                    success: false,
                    message: `${modelName} not found in this company`
                }, { status: 404 });
            }

            const updated = await Model.findByIdAndUpdate(
                id,
                { 
                    isActive, 
                    updatedBy: userId 
                },
                { new: true }
            );

            // Update product counts for categories (safe) - but only for categories
            if (type === MASTER_TYPES.CATEGORIES) {
                await safeUpdateProductCounts(companyId);
            }

            return NextResponse.json({
                success: true,
                message: `${modelName} ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: updated
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

            const validIds = ids.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid IDs provided'
                }, { status: 400 });
            }

            // Verify all items belong to this company
            let Model;
            if (type === MASTER_TYPES.CATEGORIES) {
                Model = Category;
            } else if (type === MASTER_TYPES.PRODUCTS) {
                Model = Product;
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid type for bulk update'
                }, { status: 400 });
            }

            const items = await Model.find({ 
                _id: { $in: validIds },
                companyId 
            }).select('_id');
            
            if (items.length !== validIds.length) {
                return NextResponse.json({
                    success: false,
                    message: 'Some items do not belong to this company'
                }, { status: 403 });
            }

            const result = await Model.updateMany(
                { _id: { $in: validIds }, companyId },
                { 
                    $set: { 
                        ...data, 
                        updatedBy: userId,
                        updatedAt: new Date()
                    } 
                }
            );

            if (type === MASTER_TYPES.CATEGORIES) {
                await safeUpdateProductCounts(companyId);
            }

            return NextResponse.json({
                success: true,
                message: `Successfully updated ${result.modifiedCount} items`
            });
        }

        // ===== REORDER CATEGORIES =====
        if (body.action === 'reorder' && type === MASTER_TYPES.CATEGORIES) {
            const { items } = body;

            if (!items || !Array.isArray(items)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid reorder data'
                }, { status: 400 });
            }

            const validItems = items.filter(item => isValidObjectId(item.id));
            
            if (validItems.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No valid category IDs for reorder'
                }, { status: 400 });
            }

            // Verify all categories belong to this company
            const categoryIds = validItems.map(item => item.id);
            const categories = await Category.find({ 
                _id: { $in: categoryIds },
                companyId 
            }).select('_id');
            
            if (categories.length !== validItems.length) {
                return NextResponse.json({
                    success: false,
                    message: 'Some categories do not belong to this company'
                }, { status: 403 });
            }

            const operations = validItems.map(item => ({
                updateOne: {
                    filter: { _id: item.id, companyId },
                    update: { 
                        $set: { 
                            displayOrder: item.displayOrder,
                            updatedBy: userId,
                            updatedAt: new Date()
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

        // ===== RESTORE SOFT DELETED =====
        if (body.action === 'restore' && type === MASTER_TYPES.CATEGORIES) {
            const { id } = body;

            if (!isValidObjectId(id)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid category ID'
                }, { status: 400 });
            }

            const category = await Category.findOne({ 
                _id: id, 
                companyId 
            });
            
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'Category not found in this company'
                }, { status: 404 });
            }

            await category.restore();

            // Update product counts after restore (safe)
            await safeUpdateProductCounts(companyId);

            return NextResponse.json({
                success: true,
                message: 'Category restored successfully',
                data: category
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

// ========== OPTIONS HANDLER ==========
export async function OPTIONS() {
    return NextResponse.json({
        success: true,
        message: 'Multi-tenant Masters API - Categories and Products only',
        types: ['categories', 'products', 'stats', 'recent'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        description: 'Unified API for Categories and Products management with company isolation',
        endpoints: {
            GET: {
                description: 'Fetch data',
                required: ['companyId'],
                examples: [
                    '/api/masters?companyId=xxx&type=categories',
                    '/api/masters?companyId=xxx&type=categories&format=tree',
                    '/api/masters?companyId=xxx&type=products&id=123',
                    '/api/masters?companyId=xxx&type=stats',
                    '/api/masters?companyId=xxx&type=recent'
                ]
            },
            POST: {
                description: 'Create new item',
                required: ['companyId'],
                examples: [
                    '/api/masters?companyId=xxx&type=categories -d {"name":"Electronics"}',
                    '/api/masters?companyId=xxx&type=categories -d {"name":"Mobile Phones","parentId":"cat_id"}',
                    '/api/masters?companyId=xxx&type=products -d {"productName":"iPhone","category":"cat_id","subCategory":"subcat_id","mrp":999,"discountPrice":899,"stock":10,"sku":"IPHONE15","hsnCode":"8517","gstRate":18}'
                ]
            },
            PUT: {
                description: 'Update existing item',
                required: ['companyId'],
                examples: [
                    '/api/masters?companyId=xxx&type=products&id=123 -d {"discountPrice":899}'
                ]
            },
            DELETE: {
                description: 'Delete single or multiple items (soft delete by default)',
                required: ['companyId'],
                examples: [
                    '/api/masters?companyId=xxx&type=categories&id=123',
                    '/api/masters?companyId=xxx&type=products&ids=id1,id2,id3&permanent=true'
                ]
            },
            PATCH: {
                description: 'Partial updates',
                required: ['companyId'],
                examples: [
                    '/api/masters?companyId=xxx&type=products -d {"action":"toggle-status","id":"123","isActive":false}',
                    '/api/masters?companyId=xxx&type=categories -d {"action":"reorder","items":[{"id":"123","displayOrder":1}]}',
                    '/api/masters?companyId=xxx&type=categories -d {"action":"restore","id":"123"}'
                ]
            }
        }
    }, { 
        status: 200,
        headers: {
            'Allow': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID'
        }
    });
}