// app/api/catalog/route.js
// PROFESSIONAL CATALOG API - Multi-tenant public endpoints
// Uses your existing Product and Category models - NO CHANGES NEEDED
// Super fast with MongoDB indexes and caching

import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Company from '@/models/Company';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// Public cache headers for CDN
const cacheHeaders = {
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, max-age=600',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// ========== HELPER FUNCTIONS ==========

const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// Format product for public catalog (uses your existing Product model fields)
const formatCatalogProduct = (product, company) => {
  return {
    _id: product._id,
    customId: product.customId,
    formattedId: product.customId ? String(product.customId).padStart(5, '0') : null,
    productName: product.productName,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    brand: product.brand,
    mrp: product.mrp,
    discountPrice: product.discountPrice,
    gstRate: product.gstRate,
    imageUrls: product.imageUrls || [],
    stock: product.stock,
    inStock: product.stock > 0,
    averageRating: product.averageRating || 0,
    totalReviews: product.totalReviews || 0,
    isFeatured: product.isFeatured,
    isOnSale: product.isOnSale,
    discountPercentage: product.mrp && product.discountPrice
      ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
      : 0,
    category: product.category ? {
      _id: product.category._id,
      name: product.category.name,
      slug: product.category.slug
    } : null,
    subCategory: product.subCategory ? {
      _id: product.subCategory._id,
      name: product.subCategory.name,
      slug: product.subCategory.slug
    } : null,
    // WhatsApp number for orders (priority: catalogWhatsapp > whatsapp > companyPhone)
    whatsappNumber: company?.catalogWhatsapp || company?.whatsapp?.phoneNumber || company?.companyPhone,
    catalogLink: `${process.env.NEXT_PUBLIC_APP_URL}/catalogue/products/${product.slug}?company=${company?.slug}`,
    createdAt: product.createdAt
  };
};

// Format category for public catalog
const formatCatalogCategory = (category, withChildren = false) => {
  const formatted = {
    _id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    icon: category.icon,
    productCount: category.productCount || 0,
    isActive: category.isActive
  };
  
  if (withChildren && category.subcategories?.length) {
    formatted.subcategories = category.subcategories.map(sub => formatCatalogCategory(sub, false));
  }
  
  return formatted;
};

// ========== MAIN GET HANDLER ==========
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // ===== COMPANY CONTEXT (Multi-tenant) =====
    const companySlug = searchParams.get('company');
    if (!companySlug) {
      return NextResponse.json(
        { success: false, message: 'Company slug is required' },
        { status: 400, headers: cacheHeaders }
      );
    }
    
    // Get company by slug - using your existing Company model
    const company = await Company.findOne({ 
      slug: companySlug.toLowerCase().trim(),
      status: 'active',
      deletedAt: null
    }).select('_id companyName slug catalogWhatsapp whatsapp.phoneNumber companyPhone');
    
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Store not found' },
        { status: 404, headers: cacheHeaders }
      );
    }
    
    const companyId = company._id;
    
    // ===== PARAMETERS =====
    const type = searchParams.get('type'); // 'products', 'categories', 'product'
    const productSlug = searchParams.get('slug');
    const categoryId = searchParams.get('category');
    const subCategoryId = searchParams.get('subCategory');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const isOnSale = searchParams.get('isOnSale') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
    const skip = (page - 1) * limit;
    
    // ===== GET SINGLE PRODUCT BY SLUG =====
    if (type === 'product' && productSlug) {
      const product = await Product.findOne({
        slug: productSlug,
        companyId: companyId,
        isActive: true,
        deletedAt: null
      })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .lean();
      
      if (!product) {
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404, headers: cacheHeaders }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: formatCatalogProduct(product, company)
      }, { headers: cacheHeaders });
    }
    
    // ===== GET CATEGORIES (with hierarchy) =====
    if (type === 'categories') {
      let query = { 
        companyId: companyId,
        isActive: true,
        deletedAt: null
      };
      
      // Filter by parent category
      if (categoryId === 'null' || categoryId === '') {
        query.parentId = null;
      } else if (categoryId && isValidObjectId(categoryId)) {
        query.parentId = categoryId;
      }
      
      const categories = await Category.find(query)
        .sort({ displayOrder: 1, name: 1 })
        .lean();
      
      // Get product counts for each category
      const categoryIds = categories.map(c => c._id);
      const productCounts = await Product.aggregate([
        { $match: { 
          companyId: companyId,
          isActive: true,
          deletedAt: null,
          $or: [
            { category: { $in: categoryIds } },
            { subCategory: { $in: categoryIds } }
          ]
        }},
        { $group: {
          _id: null,
          byCategory: { $push: { category: '$category', subCategory: '$subCategory' } }
        }}
      ]);
      
      const countMap = {};
      if (productCounts.length > 0) {
        productCounts[0].byCategory.forEach(item => {
          if (item.category) countMap[item.category] = (countMap[item.category] || 0) + 1;
          if (item.subCategory) countMap[item.subCategory] = (countMap[item.subCategory] || 0) + 1;
        });
      }
      
      const formattedCategories = categories.map(cat => ({
        ...formatCatalogCategory(cat),
        productCount: countMap[cat._id] || 0
      }));
      
      return NextResponse.json({
        success: true,
        data: formattedCategories,
        company: {
          name: company.companyName,
          slug: company.slug,
          whatsapp: company.catalogWhatsapp || company.whatsapp?.phoneNumber || company.companyPhone
        }
      }, { headers: cacheHeaders });
    }
    
    // ===== GET PRODUCTS (with filters, search, pagination) =====
    if (type === 'products') {
      // Build query
      let query = { 
        companyId: companyId,
        isActive: true,
        deletedAt: null
      };
      
      // Category filter
      if (categoryId && isValidObjectId(categoryId)) {
        query.category = categoryId;
      }
      
      // SubCategory filter
      if (subCategoryId && isValidObjectId(subCategoryId)) {
        query.subCategory = subCategoryId;
      }
      
      // Search filter
      if (search && search.trim()) {
        const searchTerm = search.trim();
        query.$or = [
          { productName: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { sku: { $regex: searchTerm, $options: 'i' } }
        ];
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
      
      // Stock filter
      if (inStock) {
        query.stock = { $gt: 0 };
      }
      
      // Featured filter
      if (isFeatured) {
        query.isFeatured = true;
      }
      
      // On Sale filter
      if (isOnSale) {
        query.isOnSale = true;
      }
      
      // Sorting
      let sort = {};
      const allowedSortFields = ['createdAt', 'discountPrice', 'productName', 'averageRating'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      sort[sortField] = sortOrder;
      
      // Execute queries
      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('category', 'name slug')
          .populate('subCategory', 'name slug')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query)
      ]);
      
      const formattedProducts = products.map(p => formatCatalogProduct(p, company));
      const totalPages = Math.ceil(total / limit);
      
      return NextResponse.json({
        success: true,
        data: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        company: {
          name: company.companyName,
          slug: company.slug,
          whatsapp: company.catalogWhatsapp || company.whatsapp?.phoneNumber || company.companyPhone
        }
      }, { headers: cacheHeaders });
    }
    
    // ===== GET COMPANY INFO (for header) =====
    if (type === 'info') {
      return NextResponse.json({
        success: true,
        data: {
          _id: company._id,
          companyName: company.companyName,
          slug: company.slug,
          whatsappNumber: company.catalogWhatsapp || company.whatsapp?.phoneNumber || company.companyPhone
        }
      }, { headers: cacheHeaders });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid type. Use: products, categories, product, or info' },
      { status: 400, headers: cacheHeaders }
    );
    
  } catch (error) {
    console.error('❌ Catalog API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch catalog data' },
      { status: 500, headers: cacheHeaders }
    );
  }
}

// ========== OPTIONS HANDLER ==========
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}