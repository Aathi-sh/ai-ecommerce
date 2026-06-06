

// app/api/products/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Product from "@/models/Product";
import Counter from "@/models/Counter";
import Category from "@/models/Category";
import Company from "@/models/Company";
import mongoose from "mongoose";

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// ========== CONSTANTS ==========
const VALID_SORT_FIELDS = ['discountPrice', 'createdAt', 'productName', 'averageRating', 'totalReviews', 'customId'];
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 2000;

// ========== HELPER FUNCTIONS ==========

// ✅ Validate ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && 
         /^[0-9a-fA-F]{24}$/.test(id.toString());
};

// ✅ Check if this is a public catalog request (bypasses authentication)
const isPublicCatalogRequest = async (request) => {
  const url = new URL(request.url);
  const companySlug = url.searchParams.get('company');
  const isGetRequest = request.method === 'GET';
  
  // Only GET requests with 'company' slug (not 'companyId') are public catalog requests
  if (isGetRequest && companySlug && !url.searchParams.get('companyId')) {
    const company = await Company.findOne({ slug: companySlug, status: 'active', deletedAt: null });
    if (company) {
      return company._id.toString();
    }
  }
  return null;
};

// ✅ Extract company context from request (for admin/authenticated requests)
const getCompanyContext = async (request) => {
  try {
    // ===== PRIORITY 1: Try from headers (Admin panel uses this) =====
    const headersCompanyId = request.headers.get('x-company-id');
    if (headersCompanyId && isValidObjectId(headersCompanyId)) {
      const company = await Company.findById(headersCompanyId);
      if (company && company.status === 'active' && !company.deletedAt) {
        return headersCompanyId.toString();
      }
    }
    
    // ===== PRIORITY 2: Try from URL params 'companyId' =====
    const url = new URL(request.url);
    const urlCompanyId = url.searchParams.get('companyId');
    if (urlCompanyId && isValidObjectId(urlCompanyId)) {
      const company = await Company.findById(urlCompanyId);
      if (company && company.status === 'active' && !company.deletedAt) {
        return urlCompanyId.toString();
      }
    }
    
    // ===== PRIORITY 3: Try from request body (for POST/PUT) =====
    if (request.method !== 'GET') {
      try {
        const clone = request.clone();
        const body = await clone.json().catch(() => null);
        if (body?.companyId && isValidObjectId(body.companyId)) {
          const company = await Company.findById(body.companyId);
          if (company && company.status === 'active' && !company.deletedAt) {
            return body.companyId.toString();
          }
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
    
    // ===== PRIORITY 4: Fallback to user session (for admin panel) =====
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

// ✅ Format product response
const formatProductResponse = (product) => {
  const productObj = product.toObject ? product.toObject() : product;
  
  let categoryData = null;
  if (productObj.category) {
    if (typeof productObj.category === 'object' && productObj.category._id) {
      categoryData = {
        _id: productObj.category._id.toString(),
        name: productObj.category.name || '',
        slug: productObj.category.slug || ''
      };
    } else if (productObj.category && isValidObjectId(productObj.category)) {
      categoryData = {
        _id: productObj.category.toString(),
        name: '',
        slug: ''
      };
    }
  }
  
  let subCategoryData = null;
  if (productObj.subCategory) {
    if (typeof productObj.subCategory === 'object' && productObj.subCategory._id) {
      subCategoryData = {
        _id: productObj.subCategory._id.toString(),
        name: productObj.subCategory.name || '',
        slug: productObj.subCategory.slug || ''
      };
    } else if (productObj.subCategory && isValidObjectId(productObj.subCategory)) {
      subCategoryData = {
        _id: productObj.subCategory.toString(),
        name: '',
        slug: ''
      };
    }
  }
  
  return {
    _id: productObj._id.toString(),
    customId: productObj.customId,
    formattedId: productObj.customId ? String(productObj.customId).padStart(5, '0') : null,
    productName: productObj.productName || '',
    slug: productObj.slug || '',
    sku: productObj.sku || '',
    hsnCode: productObj.hsnCode || '',
    description: productObj.description || '',
    shortDescription: productObj.shortDescription || '',
    brand: productObj.brand || '',
    mrp: productObj.mrp || 0,
    discountPrice: productObj.discountPrice || 0,
    costPrice: productObj.costPrice,
    margin: productObj.margin,
    gstRate: productObj.gstRate || 18,
    gstIncluded: productObj.gstIncluded !== false,
    category: categoryData,
    subCategory: subCategoryData,
    imageUrls: productObj.imageUrls || [],
    videoUrl: productObj.videoUrl,
    stock: productObj.stock || 0,
    lowStockThreshold: productObj.lowStockThreshold || 5,
    trackInventory: productObj.trackInventory !== false,
    allowBackorder: productObj.allowBackorder || false,
    inStock: (productObj.stock || 0) > 0,
    discountPercentage: productObj.mrp && productObj.discountPrice && productObj.mrp > 0
      ? Math.round(((productObj.mrp - productObj.discountPrice) / productObj.mrp) * 100)
      : 0,
    price: productObj.discountPrice || productObj.mrp || 0,
    isActive: productObj.isActive !== false,
    isFeatured: productObj.isFeatured || false,
    isOnSale: productObj.isOnSale || false,
    isNewArrival: productObj.isNewArrival || false,
    isBestSeller: productObj.isBestSeller || false,
    specifications: productObj.specifications || {},
    options: productObj.options,
    variants: productObj.variants || [],
    metaTitle: productObj.metaTitle,
    metaDescription: productObj.metaDescription,
    metaKeywords: productObj.metaKeywords || [],
    weight: productObj.weight,
    dimensions: productObj.dimensions || { unit: 'cm' },
    shippingClass: productObj.shippingClass,
    maxOrderQuantity: productObj.maxOrderQuantity || 10,
    taxClass: productObj.taxClass || 'standard',
    averageRating: productObj.averageRating || 0,
    totalReviews: productObj.totalReviews || 0,
    companyId: productObj.companyId?.toString(),
    createdBy: productObj.createdBy?.toString(),
    updatedBy: productObj.updatedBy?.toString(),
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
    isDeleted: !!productObj.deletedAt,
    deletedAt: productObj.deletedAt
  };
};

// ✅ Build product query
const buildProductQuery = (params, companyId) => {
  const {
    isActive,
    category,
    subCategory,
    brand,
    search,
    minPrice,
    maxPrice,
    inStock,
    isFeatured,
    isOnSale,
    lowStock,
    outOfStock,
    includeDeleted = false
  } = params;

  let query = { companyId };

  if (!includeDeleted) {
    query.deletedAt = null;
  }

  if (isActive === 'true') {
    query.isActive = true;
  } else if (isActive === 'false') {
    query.isActive = false;
  }

  if (lowStock === 'true') {
    query.stock = { $lte: 5, $gt: 0 };
  }

  if (outOfStock === 'true') {
    query.stock = 0;
  }

  if (category && category !== 'all' && category !== 'null' && category.trim() !== '') {
    if (isValidObjectId(category)) {
      query.category = new mongoose.Types.ObjectId(category);
    }
  }
  
  if (subCategory && subCategory !== 'all' && subCategory !== 'null' && subCategory.trim() !== '') {
    if (isValidObjectId(subCategory)) {
      query.subCategory = new mongoose.Types.ObjectId(subCategory);
    }
  }

  if (brand && brand !== 'all' && brand.trim() !== '') {
    query.brand = { $regex: brand, $options: 'i' };
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

  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  if (isOnSale === 'true') {
    query.isOnSale = true;
  }
  
  if (search && search.trim()) {
    const searchTerm = search.trim();
    const searchNumber = parseInt(searchTerm, 10);
    const isNumber = !isNaN(searchNumber);
    
    query.$or = [
      { productName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { shortDescription: { $regex: searchTerm, $options: 'i' } },
      { brand: { $regex: searchTerm, $options: 'i' } },
      { sku: { $regex: searchTerm, $options: 'i' } },
      { hsnCode: { $regex: searchTerm, $options: 'i' } }
    ];
    
    if (isNumber) {
      query.$or.push({ customId: searchNumber });
    }
  }

  return query;
};

// ========== GET HANDLER ==========
export async function GET(request) {
  console.log("🚀 PRODUCTS API GET called");
  
  try {
    await connectDB();

    // ===== STEP 1: Check if this is a public catalog request =====
    const publicCompanyId = await isPublicCatalogRequest(request);
    if (publicCompanyId) {
      console.log("📱 Public catalog request - bypassing auth for company:", publicCompanyId);
      
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const limit = parseInt(searchParams.get("limit") || "50");
      const category = searchParams.get("category");
      const subCategory = searchParams.get("subCategory");
      const search = searchParams.get("search");
      
      // Build query for public catalog
      let query = { 
        companyId: publicCompanyId, 
        isActive: true, 
        deletedAt: null 
      };
      
      if (category && isValidObjectId(category)) {
        query.category = category;
      }
      
      if (subCategory && isValidObjectId(subCategory)) {
        query.subCategory = subCategory;
      }
      
      if (search && search.trim()) {
        query.$or = [
          { productName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .limit(limit)
        .lean();
      
      const formattedProducts = products.map(p => formatProductResponse(p));
      
      return NextResponse.json({
        success: true,
        data: formattedProducts,
        source: "public-catalog",
        count: formattedProducts.length
      });
    }
    
    // ===== STEP 2: Not a public request - require authentication =====
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { success: false, message: "Company context required. Please ensure you are logged in." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const id = searchParams.get("id");
    const customId = searchParams.get("customId");
    const formattedId = searchParams.get("formattedId");
    const sku = searchParams.get("sku");
    const slug = searchParams.get("slug");
    const includeDeleted = searchParams.get("includeDeleted") === 'true';
    
    if (id || customId || formattedId || sku || slug) {
      return await handleSingleProduct({ id, customId, formattedId, sku, slug }, companyId, includeDeleted);
    }
    
    return await handleProductList(searchParams, companyId, includeDeleted);
    
  } catch (error) {
    console.error("❌ GET Products Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Handler for single product
async function handleSingleProduct({ id, customId, formattedId, sku, slug }, companyId, includeDeleted = false) {
  let query = { companyId };
  
  if (!includeDeleted) {
    query.deletedAt = null;
  }
  
  if (id && id.trim() !== '' && id !== 'null' && id !== 'undefined') {
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID format" }, { status: 400 });
    }
    query._id = id;
  } else if (customId && customId.trim() !== '' && customId !== 'null' && customId !== 'undefined') {
    const parsedCustomId = parseInt(customId, 10);
    if (isNaN(parsedCustomId)) {
      return NextResponse.json({ success: false, message: "Invalid custom ID" }, { status: 400 });
    }
    query.customId = parsedCustomId;
  } else if (formattedId && formattedId.trim() !== '' && formattedId !== 'null' && formattedId !== 'undefined') {
    const numericId = parseInt(formattedId, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ success: false, message: "Invalid formatted ID" }, { status: 400 });
    }
    query.customId = numericId;
  } else if (sku && sku.trim() !== '' && sku !== 'null' && sku !== 'undefined') {
    query.sku = sku.toUpperCase().trim();
  } else if (slug && slug.trim() !== '' && slug !== 'null' && slug !== 'undefined') {
    query.slug = slug.trim();
  } else {
    return NextResponse.json({ success: false, message: "No valid identifier provided" }, { status: 400 });
  }

  const product = await Product.findOne(query)
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .lean();
  
  if (!product) {
    return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  if (product.companyId.toString() !== companyId.toString()) {
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: formatProductResponse(product) }, { status: 200 });
}

// Handler for product list
async function handleProductList(searchParams, companyId, includeDeleted = false) {
  const isActive = searchParams.get("isActive");
  const category = searchParams.get("category");
  const subCategory = searchParams.get("subCategory");
  const brand = searchParams.get("brand");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock");
  const isFeatured = searchParams.get("isFeatured");
  const isOnSale = searchParams.get("isOnSale");
  const lowStock = searchParams.get("lowStock");
  const outOfStock = searchParams.get("outOfStock");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const limit = searchParams.get("limit") || DEFAULT_LIMIT.toString();
  const page = searchParams.get("page") || "1";

  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  const query = buildProductQuery({
    isActive, category, subCategory, brand, search, minPrice, maxPrice,
    inStock, isFeatured, isOnSale, lowStock, outOfStock, includeDeleted
  }, companyId);

  let sortOptions = {};
  const sortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  try {
    const products = await Product.find(query)
      .populate({ path: 'category', select: 'name slug', options: { strictPopulate: false } })
      .populate({ path: 'subCategory', select: 'name slug', options: { strictPopulate: false } })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments(query);
    const formattedProducts = products.map(product => formatProductResponse(product));
    const totalPages = Math.ceil(total / limitNum);

    const activeCount = await Product.countDocuments({ companyId, isActive: true, deletedAt: null });
    const lowStockCount = await Product.countDocuments({ companyId, stock: { $lte: 5, $gt: 0 }, isActive: true, deletedAt: null });
    const outOfStockCount = await Product.countDocuments({ companyId, stock: 0, isActive: true, deletedAt: null });

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNext: pageNum < totalPages, hasPrev: pageNum > 1 },
      stats: { total, active: activeCount, lowStock: lowStockCount, outOfStock: outOfStockCount }
    }, { status: 200 });
  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0, hasNext: false, hasPrev: false }
    }, { status: 200 });
  }
}

// ========== POST HANDLER ==========
export async function POST(request) {
  try {
    await connectDB();
    
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json({ success: false, message: "Company context required" }, { status: 400 });
    }

    const body = await request.json();
    
    const requiredFields = ['productName', 'category', 'subCategory', 'mrp', 'discountPrice', 'description', 'stock', 'sku', 'hsnCode', 'gstRate'];
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
    if (missingFields.length > 0) {
      return NextResponse.json({ success: false, message: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    if (!isValidObjectId(body.category)) {
      return NextResponse.json({ success: false, message: "Invalid category ID format" }, { status: 400 });
    }

    const categoryExists = await Category.findOne({ _id: body.category, companyId });
    if (!categoryExists) {
      return NextResponse.json({ success: false, message: "Category does not exist in this company" }, { status: 400 });
    }

    if (!isValidObjectId(body.subCategory)) {
      return NextResponse.json({ success: false, message: "Invalid subCategory ID format" }, { status: 400 });
    }

    const subCategoryExists = await Category.findOne({ _id: body.subCategory, companyId });
    if (!subCategoryExists) {
      return NextResponse.json({ success: false, message: "SubCategory does not exist in this company" }, { status: 400 });
    }

    if (subCategoryExists.parentId?.toString() !== body.category.toString()) {
      return NextResponse.json({ success: false, message: "Selected subCategory does not belong to the selected main category" }, { status: 400 });
    }

    const existingSku = await Product.findOne({ companyId, sku: body.sku.toUpperCase() });
    if (existingSku) {
      return NextResponse.json({ success: false, message: "SKU already exists in this company" }, { status: 409 });
    }

    const productData = {
      ...body,
      companyId,
      sku: body.sku.toUpperCase(),
      isOnSale: parseFloat(body.discountPrice) < parseFloat(body.mrp),
      createdBy: body.createdBy || body.userId
    };

    const nextSeq = await Counter.incrementCounter('productId', companyId);
    productData.customId = nextSeq;

    let baseSlug = productData.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!baseSlug || baseSlug.length === 0) {
      baseSlug = `product-${Date.now()}`;
    }

    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existingProduct = await Product.findOne({ companyId, slug: finalSlug });
      if (!existingProduct) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    productData.slug = finalSlug;
    
    const product = await Product.create(productData);
    await product.populate('category', 'name slug');
    await product.populate('subCategory', 'name slug');
    
    return NextResponse.json({ success: true, message: "Product created successfully", data: formatProductResponse(product) }, { status: 201 });

  } catch (error) {
    console.error("POST Product Error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ success: false, message: `A product with this ${field} already exists` }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }
}

// ========== PUT HANDLER ==========
export async function PUT(request) {
  try {
    await connectDB();
    
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json({ success: false, message: "Company context required" }, { status: 400 });
    }

    const body = await request.json();
    
    if (!body._id) {
      return NextResponse.json({ success: false, message: "Product ID is required for update" }, { status: 400 });
    }

    if (!isValidObjectId(body._id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID format" }, { status: 400 });
    }

    const existingProduct = await Product.findOne({ _id: body._id, companyId });
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found in this company" }, { status: 404 });
    }

    if (body.subCategory) {
      if (!isValidObjectId(body.subCategory)) {
        return NextResponse.json({ success: false, message: "Invalid subCategory ID format" }, { status: 400 });
      }
      const subCategoryExists = await Category.findOne({ _id: body.subCategory, companyId });
      if (!subCategoryExists) {
        return NextResponse.json({ success: false, message: "SubCategory does not exist in this company" }, { status: 400 });
      }
      const mainCategoryId = body.category || existingProduct.category;
      if (subCategoryExists.parentId?.toString() !== mainCategoryId.toString()) {
        return NextResponse.json({ success: false, message: "Selected subCategory does not belong to the selected main category" }, { status: 400 });
      }
    }

    if (body.sku && body.sku.toUpperCase() !== existingProduct.sku) {
      const existingSku = await Product.findOne({ companyId, sku: body.sku.toUpperCase(), _id: { $ne: body._id } });
      if (existingSku) {
        return NextResponse.json({ success: false, message: "SKU already exists in this company" }, { status: 409 });
      }
    }

    const updateData = { ...body, updatedBy: body.updatedBy || body.userId, isOnSale: body.discountPrice && body.mrp ? parseFloat(body.discountPrice) < parseFloat(body.mrp) : existingProduct.isOnSale };
    delete updateData._id;
    delete updateData.companyId;
    delete updateData.createdBy;
    delete updateData.customId;

    const updatedProduct = await Product.findByIdAndUpdate(body._id, updateData, { new: true, runValidators: true })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug');

    return NextResponse.json({ success: true, message: "Product updated successfully", data: formatProductResponse(updatedProduct) }, { status: 200 });

  } catch (error) {
    console.error("PUT Product Error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ success: false, message: `A product with this ${field} already exists in this company` }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  }
}

// ========== PATCH HANDLER ==========
export async function PATCH(request) {
  try {
    await connectDB();
    
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json({ success: false, message: "Company context required" }, { status: 400 });
    }

    const body = await request.json();
    
    if (body.ids && Array.isArray(body.ids) && body.update) {
      const mongoIds = body.ids.filter(id => isValidObjectId(id));
      if (mongoIds.length === 0) {
        return NextResponse.json({ success: false, message: "No valid product IDs provided" }, { status: 400 });
      }
      const products = await Product.find({ _id: { $in: mongoIds }, companyId }).select('_id');
      if (products.length !== mongoIds.length) {
        return NextResponse.json({ success: false, message: "Some products do not belong to this company" }, { status: 403 });
      }
      if (body.update.category) {
        if (!isValidObjectId(body.update.category)) {
          return NextResponse.json({ success: false, message: "Invalid category ID format" }, { status: 400 });
        }
        const categoryExists = await Category.findOne({ _id: body.update.category, companyId });
        if (!categoryExists) {
          return NextResponse.json({ success: false, message: "Category not found in this company" }, { status: 400 });
        }
      }
      const result = await Product.updateMany(
        { _id: { $in: mongoIds }, companyId },
        { $set: { ...body.update, updatedBy: body.updatedBy || body.userId, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, message: "Bulk update completed", data: { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount } }, { status: 200 });
    }
    
    if (!body._id) {
      return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
    }

    if (!isValidObjectId(body._id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID format" }, { status: 400 });
    }

    const existingProduct = await Product.findOne({ _id: body._id, companyId });
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found in this company" }, { status: 404 });
    }

    const { _id, ...updateData } = body;
    const updatedProduct = await Product.findByIdAndUpdate(_id, { $set: updateData }, { new: true, runValidators: true })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug');

    return NextResponse.json({ success: true, message: "Product updated successfully", data: formatProductResponse(updatedProduct) }, { status: 200 });

  } catch (error) {
    console.error("PATCH Product Error:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  }
}

// ========== DELETE HANDLER ==========
export async function DELETE(request) {
  try {
    await connectDB();
    
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json({ success: false, message: "Company context required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    const permanent = searchParams.get("permanent") === 'true';

    if (ids) {
      const idArray = ids.split(',');
      const mongoIds = idArray.filter(id => isValidObjectId(id));
      if (mongoIds.length === 0) {
        return NextResponse.json({ success: false, message: "No valid product IDs provided" }, { status: 400 });
      }
      const products = await Product.find({ _id: { $in: mongoIds }, companyId }).select('_id');
      if (products.length !== mongoIds.length) {
        return NextResponse.json({ success: false, message: "Some products do not belong to this company" }, { status: 403 });
      }
      if (permanent) {
        const result = await Product.deleteMany({ _id: { $in: mongoIds }, companyId });
        return NextResponse.json({ success: true, message: "Products permanently deleted", data: { deletedCount: result.deletedCount } }, { status: 200 });
      } else {
        const result = await Product.updateMany(
          { _id: { $in: mongoIds }, companyId },
          { $set: { deletedAt: new Date(), isActive: false, updatedBy: searchParams.get("userId") } }
        );
        return NextResponse.json({ success: true, message: "Products deactivated successfully", data: { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount } }, { status: 200 });
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID format" }, { status: 400 });
    }

    const product = await Product.findOne({ _id: id, companyId });
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found in this company" }, { status: 404 });
    }

    if (permanent) {
      await Product.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: "Product permanently deleted" }, { status: 200 });
    } else {
      await Product.findByIdAndUpdate(id, { $set: { deletedAt: new Date(), isActive: false, updatedBy: searchParams.get("userId") } });
      return NextResponse.json({ success: true, message: "Product deactivated successfully" }, { status: 200 });
    }

  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  }
}

// ========== OPTIONS HANDLER ==========
export async function OPTIONS() {
  return NextResponse.json({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    description: 'Multi-tenant Product management API with company isolation'
  });
}