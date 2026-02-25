import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

// GET: Fetch all products or single product by ID
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const customId = searchParams.get("customId"); // NEW: Search by custom numeric ID
    const formattedId = searchParams.get("formattedId"); // NEW: Search by formatted ID (00123)
    const sku = searchParams.get("sku");
    const slug = searchParams.get("slug");

    // Helper function to format product response with customId
    const formatProductResponse = (product) => {
      const productObj = product.toObject ? product.toObject() : product;
      
      // Add computed fields
      return {
        ...productObj,
        formattedId: productObj.customId ? String(productObj.customId).padStart(5, '0') : null, // Add formatted ID
        inStock: productObj.stock > 0,
        discountPercentage: productObj.mrp && productObj.discountPrice 
          ? Math.round(((productObj.mrp - productObj.discountPrice) / productObj.mrp) * 100)
          : 0,
        price: productObj.discountPrice || productObj.mrp, // Current selling price
      };
    };

    // If ID parameter is provided, fetch single product
    if (id || customId || formattedId || sku || slug) {
      let query = { isActive: true };
      
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Invalid product ID format",
              error: "ID must be a 24-character hexadecimal string"
            },
            { status: 400 }
          );
        }
        query._id = id;
      } else if (customId) {
        // Search by custom numeric ID
        query.customId = parseInt(customId, 10);
      } else if (formattedId) {
        // Convert formatted ID "00123" to number 123
        query.customId = parseInt(formattedId, 10);
      } else if (sku) {
        query.sku = sku.toUpperCase();
      } else if (slug) {
        query.slug = slug;
      }

      const product = await Product.findOne(query);
      
      if (!product) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product not found",
            error: `No product found with provided identifier`
          },
          { status: 404 }
        );
      }

      // Check if product is active
      if (product.isActive === false) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product not available",
            error: "This product has been deactivated"
          },
          { status: 410 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Product fetched successfully",
          data: formatProductResponse(product)
        },
        { status: 200 }
      );
    }

    // If no ID, fetch all active products with advanced filters
    const {
      category,
      subCategory,
      brand,
      search,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      isOnSale,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit = 20,
      page = 1,
      fields // For field selection
    } = Object.fromEntries(searchParams.entries());

    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { isActive: true };
    
    // Category filters
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (subCategory) {
      query.subCategory = { $regex: subCategory, $options: 'i' };
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.discountPrice = {};
      if (minPrice) query.discountPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.discountPrice.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured/OnSale filters
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (isOnSale === 'true') {
      query.isOnSale = true;
    }
    
    // Text search - include customId in search
    if (search) {
      // Check if search is a number (for customId search)
      const searchNumber = parseInt(search, 10);
      const isNumber = !isNaN(searchNumber);
      
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { hsnCode: { $regex: search, $options: 'i' } }
      ];
      
      // Add customId search if search is a number
      if (isNumber) {
        query.$or.push({ customId: searchNumber });
      }
    }

    // Build sort options
    let sortOptions = {};
    const validSortFields = ['discountPrice', 'createdAt', 'productName', 'averageRating', 'totalReviews', 'customId'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Field selection
    let selectFields = '';
    if (fields) {
      selectFields = fields.split(',').join(' ');
    }

    // Execute query with pagination
    let productsQuery = Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (selectFields) {
      productsQuery = productsQuery.select(selectFields);
    }

    const [products, total, aggregations] = await Promise.all([
      productsQuery,
      Product.countDocuments(query),
      Product.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$discountPrice" },
            maxPrice: { $max: "$discountPrice" },
            avgPrice: { $avg: "$discountPrice" },
            totalStock: { $sum: "$stock" },
            minCustomId: { $min: "$customId" },
            maxCustomId: { $max: "$customId" }
          }
        }
      ])
    ]);

    // Format products with computed fields and formattedId
    const formattedProducts = products.map(product => ({
      ...product,
      formattedId: product.customId ? String(product.customId).padStart(5, '0') : null,
      inStock: product.stock > 0,
      discountPercentage: product.mrp && product.discountPrice 
        ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
        : 0
    }));

    const totalPages = Math.ceil(total / limitNum);
    const aggregation = aggregations[0] || {};

    return NextResponse.json(
      {
        success: true,
        message: formattedProducts.length ? "Products fetched successfully" : "No products found",
        data: formattedProducts,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        filters: {
          applied: {
            category: category || null,
            subCategory: subCategory || null,
            brand: brand || null,
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
            inStock: inStock || null,
            search: search || null
          },
          available: {
            priceRange: {
              min: aggregation.minPrice || 0,
              max: aggregation.maxPrice || 0,
              avg: aggregation.avgPrice || 0
            },
            totalStock: aggregation.totalStock || 0,
            customIdRange: {
              min: aggregation.minCustomId || 100,
              max: aggregation.maxCustomId || 100
            }
          }
        },
        sort: {
          by: sortField,
          order: sortOrder
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch products",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields for new schema
    const requiredFields = [
      'productName', 
      'category', 
      'mrp', 
      'discountPrice',
      'description', 
      'stock',
      'sku',
      'hsnCode',
      'gstRate'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields",
          error: `Required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate pricing
    if (body.mrp <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid MRP",
          error: "MRP must be greater than 0" 
        },
        { status: 400 }
      );
    }

    if (body.discountPrice > body.mrp) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid discount price",
          error: "Discount price cannot be greater than MRP" 
        },
        { status: 400 }
      );
    }

    if (body.discountPrice < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid discount price",
          error: "Discount price must be greater than or equal to 0" 
        },
        { status: 400 }
      );
    }

    // Validate stock
    if (body.stock < 0 || !Number.isInteger(body.stock)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid stock quantity",
          error: "Stock must be a non-negative integer" 
        },
        { status: 400 }
      );
    }

    // Validate GST
    if (body.gstRate < 0 || body.gstRate > 28) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid GST rate",
          error: "GST rate must be between 0 and 28" 
        },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    if (!body.slug && body.productName) {
      body.slug = body.productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Handle image URLs
    if (body.imageUrls && !Array.isArray(body.imageUrls)) {
      body.imageUrls = [body.imageUrls];
    }

    // Set default values
    if (!body.imageUrls || body.imageUrls.length === 0) {
      body.imageUrls = ['/images/default-product.jpg'];
    }

    // Check for duplicate SKU
    const existingProduct = await Product.findOne({ sku: body.sku.toUpperCase() });
    if (existingProduct) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Duplicate SKU",
          error: "A product with this SKU already exists" 
        },
        { status: 409 }
      );
    }

    // Create product - customId will be auto-generated by the model
    const product = await Product.create({
      ...body,
      sku: body.sku.toUpperCase(),
      isOnSale: body.discountPrice < body.mrp,
      margin: body.costPrice ? ((body.discountPrice - body.costPrice) / body.costPrice) * 100 : 0
    });
    
    // Format response with formattedId
    const responseData = product.toObject();
    responseData.formattedId = product.customId ? String(product.customId).padStart(5, '0') : null;
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Product created successfully", 
        data: responseData 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Product Error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: "Duplicate value",
          error: `A product with this ${field} already exists` 
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed",
          error: errors.join(', ') 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create product",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// PUT: Update a product
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id && !body.sku && !body.customId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product identifier is required",
          error: "Either _id, sku, or customId field is required for update" 
        },
        { status: 400 }
      );
    }

    // Build query based on identifier
    let query = {};
    if (body._id) {
      if (!mongoose.Types.ObjectId.isValid(body._id)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid product ID",
            error: "Invalid MongoDB ObjectId format" 
          },
          { status: 400 }
        );
      }
      query._id = body._id;
    } else if (body.customId) {
      query.customId = parseInt(body.customId, 10);
    } else {
      query.sku = body.sku.toUpperCase();
    }

    // Validate pricing if provided
    if (body.mrp !== undefined && body.mrp <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid MRP",
          error: "MRP must be greater than 0" 
        },
        { status: 400 }
      );
    }

    if (body.discountPrice !== undefined && body.mrp !== undefined && body.discountPrice > body.mrp) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid discount price",
          error: "Discount price cannot be greater than MRP" 
        },
        { status: 400 }
      );
    }

    // Validate stock if provided
    if (body.stock !== undefined && (body.stock < 0 || !Number.isInteger(body.stock))) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid stock quantity",
          error: "Stock must be a non-negative integer" 
        },
        { status: 400 }
      );
    }

    // Validate GST if provided
    if (body.gstRate !== undefined && (body.gstRate < 0 || body.gstRate > 28)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid GST rate",
          error: "GST rate must be between 0 and 28" 
        },
        { status: 400 }
      );
    }

    // Handle image URLs format
    if (body.imageUrls && !Array.isArray(body.imageUrls)) {
      body.imageUrls = [body.imageUrls];
    }

    // Update slug if product name changed
    if (body.productName && !body.slug) {
      body.slug = body.productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Update isOnSale flag
    if (body.mrp !== undefined && body.discountPrice !== undefined) {
      body.isOnSale = body.discountPrice < body.mrp;
    }

    // Calculate margin if cost price provided
    if (body.costPrice !== undefined && body.discountPrice !== undefined) {
      body.margin = ((body.discountPrice - body.costPrice) / body.costPrice) * 100;
    }

    // Prevent updating customId manually
    delete body.customId;

    const updatedProduct = await Product.findOneAndUpdate(
      query, 
      body, 
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product not found",
          error: `No product found with provided identifier` 
        },
        { status: 404 }
      );
    }

    // Format response with formattedId
    const responseData = updatedProduct.toObject();
    responseData.formattedId = updatedProduct.customId ? String(updatedProduct.customId).padStart(5, '0') : null;

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully", 
        data: responseData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT Product Error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: "Duplicate value",
          error: `A product with this ${field} already exists` 
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed",
          error: errors.join(', ') 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update product",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// PATCH: Bulk update or partial update
export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Handle bulk updates
    if (body.ids && Array.isArray(body.ids) && body.update) {
      // Validate all IDs (can be MongoDB _id or customId)
      const mongoIds = body.ids.filter(id => mongoose.Types.ObjectId.isValid(id));
      const customIds = body.ids.filter(id => !isNaN(parseInt(id, 10))).map(id => parseInt(id, 10));
      
      let query = {};
      if (mongoIds.length > 0 || customIds.length > 0) {
        query.$or = [];
        if (mongoIds.length > 0) query.$or.push({ _id: { $in: mongoIds } });
        if (customIds.length > 0) query.$or.push({ customId: { $in: customIds } });
      }

      // Perform bulk update
      const result = await Product.updateMany(
        query,
        { $set: body.update },
        { runValidators: true }
      );

      return NextResponse.json(
        { 
          success: true, 
          message: "Bulk update completed",
          data: {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
          }
        },
        { status: 200 }
      );
    }
    
    // Handle single product partial update
    if (!body._id && !body.sku && !body.customId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product identifier required",
          error: "Either _id, sku, or customId is required" 
        },
        { status: 400 }
      );
    }

    let query = {};
    if (body._id) {
      if (!mongoose.Types.ObjectId.isValid(body._id)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid product ID" 
          },
          { status: 400 }
        );
      }
      query._id = body._id;
    } else if (body.customId) {
      query.customId = parseInt(body.customId, 10);
    } else {
      query.sku = body.sku.toUpperCase();
    }

    // Remove identifier from update data
    const { _id, sku, customId, ...updateData } = body;

    const updatedProduct = await Product.findOneAndUpdate(
      query,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product not found" 
        },
        { status: 404 }
      );
    }

    // Format response with formattedId
    const responseData = updatedProduct.toObject();
    responseData.formattedId = updatedProduct.customId ? String(updatedProduct.customId).padStart(5, '0') : null;

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully", 
        data: responseData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PATCH Product Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update product",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete a product (single or bulk)
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const customId = searchParams.get("customId");
    const ids = searchParams.get("ids"); // Comma-separated IDs for bulk delete
    const permanent = searchParams.get("permanent") === 'true'; // For hard delete

    // Bulk delete
    if (ids) {
      const idArray = ids.split(',');
      
      // Separate MongoDB ObjectIds and customIds
      const mongoIds = idArray.filter(id => mongoose.Types.ObjectId.isValid(id));
      const customIds = idArray.filter(id => !isNaN(parseInt(id, 10))).map(id => parseInt(id, 10));
      
      if (mongoIds.length === 0 && customIds.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "No valid product IDs provided" 
          },
          { status: 400 }
        );
      }

      let query = {};
      if (mongoIds.length > 0 || customIds.length > 0) {
        query.$or = [];
        if (mongoIds.length > 0) query.$or.push({ _id: { $in: mongoIds } });
        if (customIds.length > 0) query.$or.push({ customId: { $in: customIds } });
      }

      if (permanent) {
        // Permanent delete
        const result = await Product.deleteMany(query);
        return NextResponse.json(
          { 
            success: true, 
            message: "Products permanently deleted",
            data: { deletedCount: result.deletedCount }
          },
          { status: 200 }
        );
      } else {
        // Soft delete
        const result = await Product.updateMany(
          query,
          { 
            $set: { 
              isActive: false,
              updatedBy: searchParams.get("updatedBy") || null
            } 
          },
          { new: true }
        );

        return NextResponse.json(
          { 
            success: true, 
            message: "Products deactivated successfully",
            data: {
              matchedCount: result.matchedCount,
              modifiedCount: result.modifiedCount
            }
          },
          { status: 200 }
        );
      }
    }

    // Single delete
    if (!id && !customId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID is required",
          error: "id or customId parameter is required for deletion" 
        },
        { status: 400 }
      );
    }

    let query = {};
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid product ID",
            error: "Invalid MongoDB ObjectId format" 
          },
          { status: 400 }
        );
      }
      query._id = id;
    } else if (customId) {
      query.customId = parseInt(customId, 10);
    }

    if (permanent) {
      // Permanent delete
      const deletedProduct = await Product.findOneAndDelete(query);
      
      if (!deletedProduct) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product not found" 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Product permanently deleted",
          data: { 
            _id: deletedProduct._id,
            customId: deletedProduct.customId,
            formattedId: deletedProduct.customId ? String(deletedProduct.customId).padStart(5, '0') : null
          }
        },
        { status: 200 }
      );
    } else {
      // Soft delete
      const deletedProduct = await Product.findOneAndUpdate(
        query,
        { 
          isActive: false,
          updatedBy: searchParams.get("updatedBy") || null
        },
        { new: true }
      );

      if (!deletedProduct) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product not found" 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Product deactivated successfully",
          data: { 
            _id: deletedProduct._id, 
            customId: deletedProduct.customId,
            formattedId: deletedProduct.customId ? String(deletedProduct.customId).padStart(5, '0') : null,
            productName: deletedProduct.productName,
            isActive: deletedProduct.isActive 
          }
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete product",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

// OPTIONS: Return allowed methods
export async function OPTIONS(request) {
  return NextResponse.json({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    description: 'Product management API with custom ID support',
    features: [
      'Search by MongoDB _id, customId, formattedId, sku, slug',
      'Advanced filtering and pagination',
      'Auto-incrementing custom IDs starting from 100',
      'Formatted IDs (00123) for display',
      'Bulk operations support'
    ]
  });
}