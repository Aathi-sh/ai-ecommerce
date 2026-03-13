

// import { NextResponse } from "next/server";
// import { connectDB } from "@/utils/db";
// import Product from "@/models/Product";
// import Category from "@/models/Category";
// import mongoose from "mongoose";

// // Helper function to format product response with populated category data
// const formatProductResponse = (product) => {
//   const productObj = product.toObject ? product.toObject() : product;
  
//   // ✅ SAFELY extract category information
//   let categoryData = null;
//   if (productObj.category) {
//     if (typeof productObj.category === 'object' && productObj.category._id) {
//       // Already populated category object
//       categoryData = {
//         _id: productObj.category._id,
//         name: productObj.category.name || '',
//         slug: productObj.category.slug || ''
//       };
//     } else if (typeof productObj.category === 'string') {
//       // Just an ID string
//       categoryData = {
//         _id: productObj.category,
//         name: '',
//         slug: ''
//       };
//     } else {
//       // Fallback for any other format
//       categoryData = {
//         _id: String(productObj.category),
//         name: '',
//         slug: ''
//       };
//     }
//   }
  
//   // ✅ SAFELY extract subCategory information
//   let subCategoryData = null;
//   if (productObj.subCategory) {
//     if (typeof productObj.subCategory === 'object' && productObj.subCategory._id) {
//       subCategoryData = {
//         _id: productObj.subCategory._id,
//         name: productObj.subCategory.name || '',
//         slug: productObj.subCategory.slug || ''
//       };
//     } else if (typeof productObj.subCategory === 'string') {
//       subCategoryData = {
//         _id: productObj.subCategory,
//         name: '',
//         slug: ''
//       };
//     } else {
//       subCategoryData = {
//         _id: String(productObj.subCategory),
//         name: '',
//         slug: ''
//       };
//     }
//   }
  
//   // Add computed fields
//   return {
//     ...productObj,
//     formattedId: productObj.customId ? String(productObj.customId).padStart(5, '0') : null,
//     inStock: productObj.stock > 0,
//     discountPercentage: productObj.mrp && productObj.discountPrice 
//       ? Math.round(((productObj.mrp - productObj.discountPrice) / productObj.mrp) * 100)
//       : 0,
//     price: productObj.discountPrice || productObj.mrp,
    
//     // ✅ Category data in consistent format (for admin panel)
//     category: categoryData,
    
//     // ✅ Add string version for easy searching (for WhatsApp bot)
//     categoryName: categoryData ? categoryData.name : '',
//     categoryId: categoryData ? categoryData._id : null,
    
//     // ✅ SubCategory data in consistent format
//     subCategory: subCategoryData,
    
//     // ✅ String versions for easy searching
//     subCategoryName: subCategoryData ? subCategoryData.name : '',
//     subCategoryId: subCategoryData ? subCategoryData._id : null,
    
//     // ✅ Ensure all string fields are actually strings
//     productName: String(productObj.productName || ''),
//     description: String(productObj.description || ''),
//     shortDescription: String(productObj.shortDescription || ''),
//     sku: String(productObj.sku || ''),
//     hsnCode: String(productObj.hsnCode || ''),
//     brand: String(productObj.brand || '')
//   };
// };

// // ✅ Helper function to validate ObjectId
// const isValidObjectId = (id) => {
//   return mongoose.Types.ObjectId.isValid(id) && 
//          /^[0-9a-fA-F]{24}$/.test(id);
// };

// // GET: Fetch all products or single product by ID
// export async function GET(request) {
//   console.log("🚀 ===== PRODUCTS API CALLED =====");
//   console.log("Full URL:", request.url);
  
//   try {
//     await connectDB();

//     const url = new URL(request.url);
//     const searchParams = url.searchParams;
    
//     // Log ALL parameters received
//     const allParams = {};
//     for (const [key, value] of searchParams.entries()) {
//       allParams[key] = value;
//     }
//     console.log("📥 ALL RECEIVED PARAMETERS:", JSON.stringify(allParams, null, 2));
    
//     // Check parameters
//     const id = searchParams.get("id");
//     const customId = searchParams.get("customId");
//     const formattedId = searchParams.get("formattedId");
//     const sku = searchParams.get("sku");
//     const slug = searchParams.get("slug");
//     const isActive = searchParams.get("isActive");
    
//     console.log("Parameter check:", {
//       id, customId, formattedId, sku, slug, isActive
//     });
    
//     // ===== CRITICAL FIX: Check if this is a product list request =====
//     // If isActive parameter exists, this is DEFINITELY a list request
//     if (searchParams.has("isActive")) {
//       console.log("✅ Detected isActive parameter - routing to LIST products");
//       return await handleProductList(searchParams);
//     }
    
//     // Check for single product identifiers
//     const hasIdentifier = !!(id || customId || formattedId || sku || slug);
    
//     if (hasIdentifier) {
//       console.log("✅ Routing to SINGLE product fetch");
//       return await handleSingleProduct({ id, customId, formattedId, sku, slug });
//     }
    
//     // Default to list products
//     console.log("✅ No identifier - routing to LIST products (default)");
//     return await handleProductList(searchParams);
    
//   } catch (error) {
//     console.error("❌ GET Products Error:", error);
    
//     if (error.name === 'CastError') {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid ID format in query",
//           error: "Please provide valid identifiers"
//         },
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to fetch products",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // Handler for single product
// async function handleSingleProduct({ id, customId, formattedId, sku, slug }) {
//   console.log("🔍 handleSingleProduct called with:", { id, customId, formattedId, sku, slug });
  
//   // Build query
//   let query = {};
  
//   if (id && id.trim() !== '' && id !== 'null' && id !== 'undefined') {
//     if (!isValidObjectId(id)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid product ID format",
//           error: "ID must be a 24-character hexadecimal string"
//         },
//         { status: 400 }
//       );
//     }
//     query._id = id;
//   } else if (customId && customId.trim() !== '' && customId !== 'null' && customId !== 'undefined') {
//     const parsedCustomId = parseInt(customId, 10);
//     if (isNaN(parsedCustomId)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid custom ID",
//           error: "Custom ID must be a number"
//         },
//         { status: 400 }
//       );
//     }
//     query.customId = parsedCustomId;
//   } else if (formattedId && formattedId.trim() !== '' && formattedId !== 'null' && formattedId !== 'undefined') {
//     const numericId = parseInt(formattedId, 10);
//     if (isNaN(numericId)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid formatted ID",
//           error: "Formatted ID must contain a valid number"
//         },
//         { status: 400 }
//       );
//     }
//     query.customId = numericId;
//   } else if (sku && sku.trim() !== '' && sku !== 'null' && sku !== 'undefined') {
//     query.sku = sku.toUpperCase().trim();
//   } else if (slug && slug.trim() !== '' && slug !== 'null' && slug !== 'undefined') {
//     query.slug = slug.trim();
//   } else {
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "No valid identifier provided",
//         error: "Please provide a valid product identifier"
//       },
//       { status: 400 }
//     );
//   }

//   console.log("🔍 Single product query:", query);

//   const product = await Product.findOne(query)
//     .populate({
//       path: 'category',
//       select: 'name slug',
//       options: { strict: false }
//     })
//     .populate({
//       path: 'subCategory',
//       select: 'name slug',
//       options: { strict: false }
//     })
//     .lean()
//     .catch(err => {
//       console.error("❌ Population error in single product:", err);
//       return null;
//     });
  
//   if (!product) {
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Product not found",
//         error: `No product found with provided identifier`
//       },
//       { status: 404 }
//     );
//   }

//   return NextResponse.json(
//     { 
//       success: true, 
//       message: "Product fetched successfully",
//       data: formatProductResponse(product)
//     },
//     { status: 200 }
//   );
// }

// // Handler for product list
// async function handleProductList(searchParams) {
//   console.log("📋 handleProductList called");
  
//   const isActive = searchParams.get("isActive");
//   const category = searchParams.get("category");
//   const subCategory = searchParams.get("subCategory");
//   const brand = searchParams.get("brand");
//   const search = searchParams.get("search");
//   const minPrice = searchParams.get("minPrice");
//   const maxPrice = searchParams.get("maxPrice");
//   const inStock = searchParams.get("inStock");
//   const isFeatured = searchParams.get("isFeatured");
//   const isOnSale = searchParams.get("isOnSale");
//   const lowStock = searchParams.get("lowStock");
//   const outOfStock = searchParams.get("outOfStock");
//   const sortBy = searchParams.get("sortBy") || "createdAt";
//   const sortOrder = searchParams.get("sortOrder") || "desc";
//   const limit = searchParams.get("limit") || "20";
//   const page = searchParams.get("page") || "1";
//   const fields = searchParams.get("fields");

//   console.log("📊 List filters:", {
//     isActive, category, subCategory, brand, search,
//     minPrice, maxPrice, inStock, isFeatured, isOnSale,
//     lowStock, outOfStock, sortBy, sortOrder, limit, page
//   });

//   const pageNum = parseInt(page) || 1;
//   const limitNum = Math.min(parseInt(limit) || 20, 100);
//   const skip = (pageNum - 1) * limitNum;

//   // Build query - START WITH EMPTY OBJECT
//   let query = {};

//   // Handle isActive filter
//   if (isActive === 'true') {
//     query.isActive = true;
//   } else if (isActive === 'false') {
//     query.isActive = false;
//   }
//   // If isActive is 'all' or not provided, don't add filter

//   // Low stock filter
//   if (lowStock === 'true') {
//     query.stock = { $lte: 5, $gt: 0 };
//   }

//   // Out of stock filter
//   if (outOfStock === 'true') {
//     query.stock = 0;
//   }

//   // Category filter
//   if (category && category !== 'all' && category !== 'null' && category.trim() !== '') {
//     if (isValidObjectId(category)) {
//       query.category = new mongoose.Types.ObjectId(category);
//     } else {
//       console.warn(`Invalid category ID format: ${category} - skipping filter`);
//     }
//   }
  
//   // SubCategory filter
//   if (subCategory && subCategory !== 'all' && subCategory !== 'null' && subCategory.trim() !== '') {
//     if (isValidObjectId(subCategory)) {
//       query.subCategory = new mongoose.Types.ObjectId(subCategory);
//     } else {
//       console.warn(`Invalid subCategory ID format: ${subCategory} - skipping filter`);
//     }
//   }

//   // Brand filter
//   if (brand && brand !== 'all' && brand.trim() !== '') {
//     query.brand = { $regex: brand, $options: 'i' };
//   }
  
//   // Price range filter
//   if (minPrice || maxPrice) {
//     query.discountPrice = {};
//     if (minPrice && !isNaN(parseFloat(minPrice))) {
//       query.discountPrice.$gte = parseFloat(minPrice);
//     }
//     if (maxPrice && !isNaN(parseFloat(maxPrice))) {
//       query.discountPrice.$lte = parseFloat(maxPrice);
//     }
//   }

//   // Stock filter
//   if (inStock === 'true') {
//     query.stock = { $gt: 0 };
//   }

//   // Featured/OnSale filters
//   if (isFeatured === 'true') {
//     query.isFeatured = true;
//   }

//   if (isOnSale === 'true') {
//     query.isOnSale = true;
//   }
  
//   // Text search
//   if (search && search.trim()) {
//     const searchTerm = search.trim();
//     const searchNumber = parseInt(searchTerm, 10);
//     const isNumber = !isNaN(searchNumber);
    
//     let matchingCategories = [];
//     if (searchTerm.length < 50) {
//       try {
//         const categoryResults = await Category.find({
//           $or: [
//             { name: { $regex: searchTerm, $options: 'i' } },
//             { description: { $regex: searchTerm, $options: 'i' } }
//           ]
//         }).select('_id').lean();
        
//         matchingCategories = categoryResults.map(c => c._id);
//       } catch (err) {
//         console.warn('Category search error:', err.message);
//       }
//     }
    
//     query.$or = [
//       { productName: { $regex: searchTerm, $options: 'i' } },
//       { description: { $regex: searchTerm, $options: 'i' } },
//       { shortDescription: { $regex: searchTerm, $options: 'i' } },
//       { brand: { $regex: searchTerm, $options: 'i' } },
//       { sku: { $regex: searchTerm, $options: 'i' } },
//       { hsnCode: { $regex: searchTerm, $options: 'i' } }
//     ];
    
//     if (matchingCategories.length > 0) {
//       query.$or.push({ category: { $in: matchingCategories } });
//       query.$or.push({ subCategory: { $in: matchingCategories } });
//     }
    
//     if (isNumber) {
//       query.$or.push({ customId: searchNumber });
//     }
//   }

//   console.log("🔍 Final MongoDB query:", JSON.stringify(query, null, 2));

//   // Sort options
//   let sortOptions = {};
//   const validSortFields = ['discountPrice', 'createdAt', 'productName', 'averageRating', 'totalReviews', 'customId'];
//   const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
//   sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

//   try {
//     // First get the products without population to avoid population errors
//     const products = await Product.find(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limitNum)
//       .lean();

//     const total = await Product.countDocuments(query);
//     console.log(`📊 Found ${products.length} products (total: ${total})`);

//     // Manually populate categories with error handling
//     const populatedProducts = await Promise.all(
//       products.map(async (product) => {
//         try {
//           // Populate category if it exists and is valid
//           if (product.category && isValidObjectId(product.category)) {
//             const categoryDoc = await Category.findById(product.category)
//               .select('name slug')
//               .lean();
//             if (categoryDoc) {
//               product.category = categoryDoc;
//             }
//           } else if (product.category && !isValidObjectId(product.category)) {
//             console.warn(`Invalid category ID in product ${product._id}: ${product.category}`);
//             // Keep as string but log warning
//           }

//           // Populate subCategory if it exists and is valid
//           if (product.subCategory && isValidObjectId(product.subCategory)) {
//             const subCategoryDoc = await Category.findById(product.subCategory)
//               .select('name slug')
//               .lean();
//             if (subCategoryDoc) {
//               product.subCategory = subCategoryDoc;
//             }
//           } else if (product.subCategory && !isValidObjectId(product.subCategory)) {
//             console.warn(`Invalid subCategory ID in product ${product._id}: ${product.subCategory}`);
//             // Keep as string but log warning
//           }
//         } catch (err) {
//           console.error(`Error populating categories for product ${product._id}:`, err);
//           // Keep original values on error
//         }
//         return product;
//       })
//     );

//     // Format products with enhanced response
//     const formattedProducts = populatedProducts.map(product => formatProductResponse(product));

//     const totalPages = Math.ceil(total / limitNum);

//     return NextResponse.json(
//       {
//         success: true,
//         message: formattedProducts.length ? "Products fetched successfully" : "No products found",
//         data: formattedProducts,
//         pagination: {
//           total,
//           page: pageNum,
//           limit: limitNum,
//           totalPages,
//           hasNext: pageNum < totalPages,
//           hasPrev: pageNum > 1
//         },
//         filters: {
//           applied: {
//             isActive: isActive || null,
//             category: category || null,
//             subCategory: subCategory || null,
//             brand: brand || null,
//             minPrice: minPrice || null,
//             maxPrice: maxPrice || null,
//             inStock: inStock || null,
//             search: search || null,
//             lowStock: lowStock || null,
//             outOfStock: outOfStock || null
//           }
//         }
//       },
//       { status: 200 }
//     );
//   } catch (dbError) {
//     console.error("❌ Database error in handleProductList:", dbError);
    
//     // Return empty results instead of crashing
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Error fetching products, returning empty list",
//         data: [],
//         pagination: {
//           total: 0,
//           page: pageNum,
//           limit: limitNum,
//           totalPages: 0,
//           hasNext: false,
//           hasPrev: false
//         }
//       },
//       { status: 200 }
//     );
//   }
// }

// // POST: Create a new product
// export async function POST(request) {
//   try {
//     await connectDB();
//     const body = await request.json();

//     // Validate required fields
//     const requiredFields = [
//       'productName', 
//       'category', 
//       'mrp', 
//       'discountPrice',
//       'description', 
//       'stock',
//       'sku',
//       'hsnCode',
//       'gstRate'
//     ];
    
//     const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
    
//     if (missingFields.length > 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Missing required fields",
//           error: `Required fields: ${missingFields.join(', ')}` 
//         },
//         { status: 400 }
//       );
//     }

//     // Validate that category exists with proper ObjectId check
//     if (!isValidObjectId(body.category)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid category ID format",
//           error: "Category must be a valid ObjectId"
//         },
//         { status: 400 }
//       );
//     }

//     const categoryExists = await Category.findById(body.category);
//     if (!categoryExists) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Category not found",
//           error: "The selected category does not exist"
//         },
//         { status: 400 }
//       );
//     }

//     // Validate subCategory if provided
//     if (body.subCategory) {
//       if (!isValidObjectId(body.subCategory)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid subCategory ID format",
//             error: "SubCategory must be a valid ObjectId"
//           },
//           { status: 400 }
//         );
//       }

//       const subCategoryExists = await Category.findById(body.subCategory);
//       if (!subCategoryExists) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "SubCategory not found",
//             error: "The selected subCategory does not exist"
//           },
//           { status: 400 }
//         );
//       }

//       // Check if subCategory belongs to the selected category
//       if (subCategoryExists.parentId && 
//           subCategoryExists.parentId.toString() !== body.category.toString()) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid subCategory",
//             error: "The selected subCategory does not belong to the selected category"
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // Validate pricing
//     if (body.mrp <= 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid MRP",
//           error: "MRP must be greater than 0" 
//         },
//         { status: 400 }
//       );
//     }

//     if (body.discountPrice > body.mrp) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid discount price",
//           error: "Discount price cannot be greater than MRP" 
//         },
//         { status: 400 }
//       );
//     }

//     if (body.discountPrice < 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid discount price",
//           error: "Discount price must be greater than or equal to 0" 
//         },
//         { status: 400 }
//       );
//     }

//     // Validate stock
//     if (body.stock < 0 || !Number.isInteger(body.stock)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid stock quantity",
//           error: "Stock must be a non-negative integer" 
//         },
//         { status: 400 }
//       );
//     }

//     // Validate GST
//     if (body.gstRate < 0 || body.gstRate > 28) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid GST rate",
//           error: "GST rate must be between 0 and 28" 
//         },
//         { status: 400 }
//       );
//     }

//     // Generate slug if not provided
//     if (!body.slug && body.productName) {
//       body.slug = body.productName
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/^-|-$/g, '');
//     }

//     // Handle image URLs
//     if (body.imageUrls && !Array.isArray(body.imageUrls)) {
//       body.imageUrls = [body.imageUrls];
//     }

//     // Set default values
//     if (!body.imageUrls || body.imageUrls.length === 0) {
//       body.imageUrls = ['/images/default-product.jpg'];
//     }

//     // Check for duplicate SKU
//     const existingProduct = await Product.findOne({ sku: body.sku.toUpperCase() });
//     if (existingProduct) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Duplicate SKU",
//           error: "A product with this SKU already exists" 
//         },
//         { status: 409 }
//       );
//     }

//     // Check for duplicate slug
//     const existingSlug = await Product.findOne({ slug: body.slug });
//     if (existingSlug) {
//       // Append random suffix to make slug unique
//       body.slug = `${body.slug}-${Math.random().toString(36).substring(2, 6)}`;
//     }

//     // Create product
//     const product = await Product.create({
//       ...body,
//       sku: body.sku.toUpperCase(),
//       isOnSale: body.discountPrice < body.mrp,
//       margin: body.costPrice ? ((body.discountPrice - body.costPrice) / body.costPrice) * 100 : 0
//     });
    
//     // Populate category data for response
//     await product.populate('category', 'name slug');
//     if (product.subCategory) {
//       await product.populate('subCategory', 'name slug');
//     }
    
//     // Format response
//     const responseData = formatProductResponse(product);
    
//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Product created successfully", 
//         data: responseData 
//       },
//       { status: 201 }
//     );

//   } catch (error) {
//     console.error("POST Product Error:", error);
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Duplicate value",
//           error: `A product with this ${field} already exists` 
//         },
//         { status: 409 }
//       );
//     }

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Validation failed",
//           error: errors.join(', ') 
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to create product",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // PUT: Update a product
// export async function PUT(request) {
//   try {
//     await connectDB();
//     const body = await request.json();

//     if (!body._id && !body.sku && !body.customId) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Product identifier is required",
//           error: "Either _id, sku, or customId field is required for update" 
//         },
//         { status: 400 }
//       );
//     }

//     // Build query based on identifier
//     let query = {};
//     if (body._id) {
//       if (!isValidObjectId(body._id)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid product ID",
//             error: "Invalid MongoDB ObjectId format" 
//           },
//           { status: 400 }
//         );
//       }
//       query._id = body._id;
//     } else if (body.customId) {
//       query.customId = parseInt(body.customId, 10);
//     } else {
//       query.sku = body.sku.toUpperCase();
//     }

//     // Validate category if being updated
//     if (body.category) {
//       if (!isValidObjectId(body.category)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid category ID format",
//             error: "Category must be a valid ObjectId"
//           },
//           { status: 400 }
//         );
//       }

//       const categoryExists = await Category.findById(body.category);
//       if (!categoryExists) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Category not found",
//             error: "The selected category does not exist"
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // Validate subCategory if being updated
//     if (body.subCategory) {
//       if (!isValidObjectId(body.subCategory)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid subCategory ID format",
//             error: "SubCategory must be a valid ObjectId"
//           },
//           { status: 400 }
//         );
//       }

//       const subCategoryExists = await Category.findById(body.subCategory);
//       if (!subCategoryExists) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "SubCategory not found",
//             error: "The selected subCategory does not exist"
//           },
//           { status: 400 }
//         );
//       }

//       // Check if subCategory belongs to the selected category
//       const categoryId = body.category || (await Product.findById(query._id))?.category;
//       if (categoryId && subCategoryExists.parentId && 
//           subCategoryExists.parentId.toString() !== categoryId.toString()) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid subCategory",
//             error: "The selected subCategory does not belong to the selected category"
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // Validate pricing if provided
//     if (body.mrp !== undefined && body.mrp <= 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid MRP",
//           error: "MRP must be greater than 0" 
//         },
//         { status: 400 }
//       );
//     }

//     if (body.discountPrice !== undefined && body.mrp !== undefined && body.discountPrice > body.mrp) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid discount price",
//           error: "Discount price cannot be greater than MRP" 
//         },
//         { status: 400 }
//       );
//     }

//     // Validate stock if provided
//     if (body.stock !== undefined && (body.stock < 0 || !Number.isInteger(body.stock))) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid stock quantity",
//           error: "Stock must be a non-negative integer" 
//         },
//         { status: 400 }
//       );
//     }

//     // Validate GST if provided
//     if (body.gstRate !== undefined && (body.gstRate < 0 || body.gstRate > 28)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid GST rate",
//           error: "GST rate must be between 0 and 28" 
//         },
//         { status: 400 }
//       );
//     }

//     // Handle image URLs format
//     if (body.imageUrls && !Array.isArray(body.imageUrls)) {
//       body.imageUrls = [body.imageUrls];
//     }

//     // Update slug if product name changed
//     if (body.productName && !body.slug) {
//       body.slug = body.productName
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/^-|-$/g, '');
//     }

//     // Update isOnSale flag
//     if (body.mrp !== undefined && body.discountPrice !== undefined) {
//       body.isOnSale = body.discountPrice < body.mrp;
//     }

//     // Calculate margin if cost price provided
//     if (body.costPrice !== undefined && body.discountPrice !== undefined) {
//       body.margin = ((body.discountPrice - body.costPrice) / body.costPrice) * 100;
//     }

//     // Prevent updating customId manually
//     delete body.customId;

//     const updatedProduct = await Product.findOneAndUpdate(
//       query, 
//       body, 
//       {
//         new: true,
//         runValidators: true,
//       }
//     ).populate('category', 'name slug')
//      .populate('subCategory', 'name slug');

//     if (!updatedProduct) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Product not found",
//           error: `No product found with provided identifier` 
//         },
//         { status: 404 }
//       );
//     }

//     // Format response
//     const responseData = formatProductResponse(updatedProduct);

//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Product updated successfully", 
//         data: responseData 
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("PUT Product Error:", error);
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Duplicate value",
//           error: `A product with this ${field} already exists` 
//         },
//         { status: 409 }
//       );
//     }

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Validation failed",
//           error: errors.join(', ') 
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to update product",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // PATCH: Bulk update or partial update
// export async function PATCH(request) {
//   try {
//     await connectDB();
//     const body = await request.json();
    
//     // Handle bulk updates
//     if (body.ids && Array.isArray(body.ids) && body.update) {
//       // Validate all IDs
//       const mongoIds = body.ids.filter(id => isValidObjectId(id));
//       const customIds = body.ids.filter(id => !isNaN(parseInt(id, 10))).map(id => parseInt(id, 10));
      
//       if (mongoIds.length === 0 && customIds.length === 0) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "No valid product IDs provided for bulk update"
//           },
//           { status: 400 }
//         );
//       }

//       let query = {};
//       if (mongoIds.length > 0 || customIds.length > 0) {
//         query.$or = [];
//         if (mongoIds.length > 0) query.$or.push({ _id: { $in: mongoIds } });
//         if (customIds.length > 0) query.$or.push({ customId: { $in: customIds } });
//       }

//       // Validate category if being bulk updated
//       if (body.update.category) {
//         if (!isValidObjectId(body.update.category)) {
//           return NextResponse.json(
//             { 
//               success: false, 
//               message: "Invalid category ID format for bulk update"
//             },
//             { status: 400 }
//           );
//         }
//         const categoryExists = await Category.findById(body.update.category);
//         if (!categoryExists) {
//           return NextResponse.json(
//             { 
//               success: false, 
//               message: "Category not found for bulk update"
//             },
//             { status: 400 }
//           );
//         }
//       }

//       // Perform bulk update
//       const result = await Product.updateMany(
//         query,
//         { $set: body.update },
//         { runValidators: true }
//       );

//       return NextResponse.json(
//         { 
//           success: true, 
//           message: "Bulk update completed",
//           data: {
//             matchedCount: result.matchedCount,
//             modifiedCount: result.modifiedCount
//           }
//         },
//         { status: 200 }
//       );
//     }
    
//     // Handle single product partial update
//     if (!body._id && !body.sku && !body.customId) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Product identifier required",
//           error: "Either _id, sku, or customId is required" 
//         },
//         { status: 400 }
//       );
//     }

//     let query = {};
//     if (body._id) {
//       if (!isValidObjectId(body._id)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid product ID" 
//           },
//           { status: 400 }
//         );
//       }
//       query._id = body._id;
//     } else if (body.customId) {
//       query.customId = parseInt(body.customId, 10);
//     } else {
//       query.sku = body.sku.toUpperCase();
//     }

//     // Validate category if being updated
//     if (body.category) {
//       if (!isValidObjectId(body.category)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid category ID format"
//           },
//           { status: 400 }
//         );
//       }
//       const categoryExists = await Category.findById(body.category);
//       if (!categoryExists) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Category not found"
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // Remove identifier from update data
//     const { _id, sku, customId, ...updateData } = body;

//     const updatedProduct = await Product.findOneAndUpdate(
//       query,
//       { $set: updateData },
//       {
//         new: true,
//         runValidators: true,
//       }
//     ).populate('category', 'name slug')
//      .populate('subCategory', 'name slug');

//     if (!updatedProduct) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Product not found" 
//         },
//         { status: 404 }
//       );
//     }

//     // Format response
//     const responseData = formatProductResponse(updatedProduct);

//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Product updated successfully", 
//         data: responseData 
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("PATCH Product Error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to update product",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // DELETE: Soft delete a product (single or bulk)
// export async function DELETE(request) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     const customId = searchParams.get("customId");
//     const ids = searchParams.get("ids");
//     const permanent = searchParams.get("permanent") === 'true';

//     // Bulk delete
//     if (ids) {
//       const idArray = ids.split(',');
      
//       const mongoIds = idArray.filter(id => isValidObjectId(id));
//       const customIds = idArray.filter(id => !isNaN(parseInt(id, 10))).map(id => parseInt(id, 10));
      
//       if (mongoIds.length === 0 && customIds.length === 0) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "No valid product IDs provided" 
//           },
//           { status: 400 }
//         );
//       }

//       let query = {};
//       if (mongoIds.length > 0 || customIds.length > 0) {
//         query.$or = [];
//         if (mongoIds.length > 0) query.$or.push({ _id: { $in: mongoIds } });
//         if (customIds.length > 0) query.$or.push({ customId: { $in: customIds } });
//       }

//       if (permanent) {
//         const result = await Product.deleteMany(query);
//         return NextResponse.json(
//           { 
//             success: true, 
//             message: "Products permanently deleted",
//             data: { deletedCount: result.deletedCount }
//           },
//           { status: 200 }
//         );
//       } else {
//         const result = await Product.updateMany(
//           query,
//           { 
//             $set: { 
//               isActive: false,
//               updatedBy: searchParams.get("updatedBy") || null
//             } 
//           }
//         );

//         return NextResponse.json(
//           { 
//             success: true, 
//             message: "Products deactivated successfully",
//             data: {
//               matchedCount: result.matchedCount,
//               modifiedCount: result.modifiedCount
//             }
//           },
//           { status: 200 }
//         );
//       }
//     }

//     // Single delete
//     if (!id && !customId) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Product ID is required",
//           error: "id or customId parameter is required for deletion" 
//         },
//         { status: 400 }
//       );
//     }

//     let query = {};
//     if (id) {
//       if (!isValidObjectId(id)) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Invalid product ID",
//             error: "Invalid MongoDB ObjectId format" 
//           },
//           { status: 400 }
//         );
//       }
//       query._id = id;
//     } else if (customId) {
//       query.customId = parseInt(customId, 10);
//     }

//     if (permanent) {
//       const deletedProduct = await Product.findOneAndDelete(query);
      
//       if (!deletedProduct) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Product not found" 
//           },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json(
//         { 
//           success: true, 
//           message: "Product permanently deleted",
//           data: { 
//             _id: deletedProduct._id,
//             customId: deletedProduct.customId,
//             formattedId: deletedProduct.customId ? String(deletedProduct.customId).padStart(5, '0') : null
//           }
//         },
//         { status: 200 }
//       );
//     } else {
//       const deletedProduct = await Product.findOneAndUpdate(
//         query,
//         { 
//           isActive: false,
//           updatedBy: searchParams.get("updatedBy") || null
//         },
//         { new: true }
//       );

//       if (!deletedProduct) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Product not found" 
//           },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json(
//         { 
//           success: true, 
//           message: "Product deactivated successfully",
//           data: { 
//             _id: deletedProduct._id, 
//             customId: deletedProduct.customId,
//             formattedId: deletedProduct.customId ? String(deletedProduct.customId).padStart(5, '0') : null,
//             productName: deletedProduct.productName,
//             isActive: deletedProduct.isActive 
//           }
//         },
//         { status: 200 }
//       );
//     }

//   } catch (error) {
//     console.error("DELETE Product Error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to delete product",
//         error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
//       },
//       { status: 500 }
//     );
//   }
// }

// // OPTIONS: Return allowed methods
// export async function OPTIONS(request) {
//   return NextResponse.json({
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     description: 'Product management API with category integration',
//     features: [
//       'Search by MongoDB _id, customId, formattedId, sku, slug',
//       'Advanced filtering by category, subCategory, brand, price',
//       'Category validation and population',
//       'Auto-incrementing custom IDs starting from 100',
//       'Formatted IDs (00123) for display',
//       'Bulk operations support',
//       'Category distribution analytics'
//     ]
//   });
// }




// above code is without saas






















import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Product from "@/models/Product";
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
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ========== HELPER FUNCTIONS ==========

// ✅ Validate ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && 
         /^[0-9a-fA-F]{24}$/.test(id.toString());
};

// ✅ Extract company context from request
const getCompanyContext = async (request) => {
  try {
    // Try from headers first
    const headersCompanyId = request.headers.get('x-company-id');
    if (headersCompanyId && isValidObjectId(headersCompanyId)) {
      const company = await Company.findById(headersCompanyId);
      if (company) return headersCompanyId.toString();
    }
    
    // Try from URL params (for GET requests)
    const url = new URL(request.url);
    const urlCompanyId = url.searchParams.get('companyId');
    if (urlCompanyId && isValidObjectId(urlCompanyId)) {
      const company = await Company.findById(urlCompanyId);
      if (company) return urlCompanyId.toString();
    }
    
    // Try from request body (for POST/PUT)
    if (request.method !== 'GET') {
      try {
        const clone = request.clone();
        const body = await clone.json().catch(() => null);
        if (body?.companyId && isValidObjectId(body.companyId)) {
          const company = await Company.findById(body.companyId);
          if (company) return body.companyId.toString();
        }
      } catch (e) {
        // Ignore JSON parsing errors
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
  
  // Safely extract category information
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
  
  // Safely extract subCategory information
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
    
    // Pricing
    mrp: productObj.mrp || 0,
    discountPrice: productObj.discountPrice || 0,
    costPrice: productObj.costPrice,
    margin: productObj.margin,
    gstRate: productObj.gstRate || 18,
    gstIncluded: productObj.gstIncluded !== false,
    
    // Category data
    category: categoryData,
    subCategory: subCategoryData,
    
    // Media
    imageUrls: productObj.imageUrls || [],
    videoUrl: productObj.videoUrl,
    
    // Inventory
    stock: productObj.stock || 0,
    lowStockThreshold: productObj.lowStockThreshold || 5,
    trackInventory: productObj.trackInventory !== false,
    allowBackorder: productObj.allowBackorder || false,
    
    // Computed fields
    inStock: (productObj.stock || 0) > 0,
    discountPercentage: productObj.mrp && productObj.discountPrice && productObj.mrp > 0
      ? Math.round(((productObj.mrp - productObj.discountPrice) / productObj.mrp) * 100)
      : 0,
    price: productObj.discountPrice || productObj.mrp || 0,
    
    // Flags
    isActive: productObj.isActive !== false,
    isFeatured: productObj.isFeatured || false,
    isOnSale: productObj.isOnSale || false,
    isNewArrival: productObj.isNewArrival || false,
    isBestSeller: productObj.isBestSeller || false,
    
    // Specifications
    specifications: productObj.specifications || {},
    options: productObj.options,
    variants: productObj.variants || [],
    
    // SEO
    metaTitle: productObj.metaTitle,
    metaDescription: productObj.metaDescription,
    metaKeywords: productObj.metaKeywords || [],
    
    // Shipping
    weight: productObj.weight,
    dimensions: productObj.dimensions || { unit: 'cm' },
    shippingClass: productObj.shippingClass,
    maxOrderQuantity: productObj.maxOrderQuantity || 10,
    
    // Tax
    taxClass: productObj.taxClass || 'standard',
    
    // Ratings
    averageRating: productObj.averageRating || 0,
    totalReviews: productObj.totalReviews || 0,
    
    // Company & Audit
    companyId: productObj.companyId?.toString(),
    createdBy: productObj.createdBy?.toString(),
    updatedBy: productObj.updatedBy?.toString(),
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
    
    // Soft delete
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

  // Start with company filter
  let query = { companyId };

  // Handle soft delete filter
  if (!includeDeleted) {
    query.deletedAt = null;
  }

  // Handle isActive filter
  if (isActive === 'true') {
    query.isActive = true;
  } else if (isActive === 'false') {
    query.isActive = false;
  }

  // Low stock filter
  if (lowStock === 'true') {
    query.stock = { $lte: 5, $gt: 0 };
  }

  // Out of stock filter
  if (outOfStock === 'true') {
    query.stock = 0;
  }

  // Category filter
  if (category && category !== 'all' && category !== 'null' && category.trim() !== '') {
    if (isValidObjectId(category)) {
      query.category = new mongoose.Types.ObjectId(category);
    }
  }
  
  // SubCategory filter
  if (subCategory && subCategory !== 'all' && subCategory !== 'null' && subCategory.trim() !== '') {
    if (isValidObjectId(subCategory)) {
      query.subCategory = new mongoose.Types.ObjectId(subCategory);
    }
  }

  // Brand filter
  if (brand && brand !== 'all' && brand.trim() !== '') {
    query.brand = { $regex: brand, $options: 'i' };
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
  
  // Text search
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

    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required"
        },
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
    
    // Check for single product identifiers
    if (id || customId || formattedId || sku || slug) {
      return await handleSingleProduct({ id, customId, formattedId, sku, slug }, companyId, includeDeleted);
    }
    
    // Default to list products
    return await handleProductList(searchParams, companyId, includeDeleted);
    
  } catch (error) {
    console.error("❌ GET Products Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch products"
      },
      { status: 500 }
    );
  }
}

// Handler for single product
async function handleSingleProduct({ id, customId, formattedId, sku, slug }, companyId, includeDeleted = false) {
  
  // Build query with company isolation
  let query = { companyId };
  
  // Add soft delete filter
  if (!includeDeleted) {
    query.deletedAt = null;
  }
  
  if (id && id.trim() !== '' && id !== 'null' && id !== 'undefined') {
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid product ID format"
        },
        { status: 400 }
      );
    }
    query._id = id;
  } else if (customId && customId.trim() !== '' && customId !== 'null' && customId !== 'undefined') {
    const parsedCustomId = parseInt(customId, 10);
    if (isNaN(parsedCustomId)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid custom ID"
        },
        { status: 400 }
      );
    }
    query.customId = parsedCustomId;
  } else if (formattedId && formattedId.trim() !== '' && formattedId !== 'null' && formattedId !== 'undefined') {
    const numericId = parseInt(formattedId, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid formatted ID"
        },
        { status: 400 }
      );
    }
    query.customId = numericId;
  } else if (sku && sku.trim() !== '' && sku !== 'null' && sku !== 'undefined') {
    query.sku = sku.toUpperCase().trim();
  } else if (slug && slug.trim() !== '' && slug !== 'null' && slug !== 'undefined') {
    query.slug = slug.trim();
  } else {
    return NextResponse.json(
      { 
        success: false, 
        message: "No valid identifier provided"
      },
      { status: 400 }
    );
  }

  const product = await Product.findOne(query)
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .lean();
  
  if (!product) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Product not found"
      },
      { status: 404 }
    );
  }

  // Double-check company isolation
  if (product.companyId.toString() !== companyId.toString()) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Access denied"
      },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { 
      success: true, 
      data: formatProductResponse(product)
    },
    { status: 200 }
  );
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

  // Build query
  const query = buildProductQuery({
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
    includeDeleted
  }, companyId);

  // Sort options
  let sortOptions = {};
  const sortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  try {
    // Get products
    const products = await Product.find(query)
      .populate({
        path: 'category',
        select: 'name slug',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'subCategory',
        select: 'name slug',
        options: { strictPopulate: false }
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments(query);

    // Format products
    const formattedProducts = products.map(product => formatProductResponse(product));

    const totalPages = Math.ceil(total / limitNum);

    // Get stats
    const activeCount = await Product.countDocuments({ 
      companyId, 
      isActive: true, 
      deletedAt: null 
    });
    
    const lowStockCount = await Product.countDocuments({ 
      companyId, 
      stock: { $lte: 5, $gt: 0 },
      isActive: true,
      deletedAt: null 
    });
    
    const outOfStockCount = await Product.countDocuments({ 
      companyId, 
      stock: 0,
      isActive: true,
      deletedAt: null 
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedProducts,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        stats: {
          total,
          active: activeCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount
        }
      },
      { status: 200 }
    );
  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    
    return NextResponse.json(
      {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 200 }
    );
  }
}

// ========== POST HANDLER ==========
// ========== POST HANDLER ==========
export async function POST(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required"
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields - INCLUDING SUBCATEGORY
    const requiredFields = [
      'productName', 'category', 'subCategory', 'mrp', 'discountPrice',
      'description', 'stock', 'sku', 'hsnCode', 'gstRate'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!isValidObjectId(body.category)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid category ID format"
        },
        { status: 400 }
      );
    }

    // Check if category exists in this company
    const categoryExists = await Category.findOne({ 
      _id: body.category, 
      companyId 
    });
    if (!categoryExists) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Category does not exist in this company"
        },
        { status: 400 }
      );
    }

    // ===== NEW: VALIDATE SUBCATEGORY =====
    // Validate subCategory
    if (!isValidObjectId(body.subCategory)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid subCategory ID format"
        },
        { status: 400 }
      );
    }

    // Check if subCategory exists in this company
    const subCategoryExists = await Category.findOne({ 
      _id: body.subCategory, 
      companyId 
    });
    if (!subCategoryExists) {
      return NextResponse.json(
        { 
          success: false, 
          message: "SubCategory does not exist in this company"
        },
        { status: 400 }
      );
    }

    // ===== NEW: VERIFY SUBCATEGORY BELONGS TO SELECTED CATEGORY =====
    if (subCategoryExists.parentId?.toString() !== body.category.toString()) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Selected subCategory does not belong to the selected main category"
        },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const existingSku = await Product.findOne({ 
      companyId, 
      sku: body.sku.toUpperCase() 
    });
    if (existingSku) {
      return NextResponse.json(
        { 
          success: false, 
          message: "SKU already exists in this company"
        },
        { status: 409 }
      );
    }

    // Prepare product data
    const productData = {
      ...body,
      companyId,
      sku: body.sku.toUpperCase(),
      isOnSale: parseFloat(body.discountPrice) < parseFloat(body.mrp),
      createdBy: body.createdBy || body.userId
    };

    // 🔴🔴🔴 STEP 1: GENERATE CUSTOM ID
    console.log('🔢 Generating customId for company:', companyId);
    const Counter = mongoose.model('Counter');
    const nextSeq = await Counter.incrementCounter('productId', companyId);
    productData.customId = nextSeq;
    console.log('✅ Generated customId:', nextSeq);

    // 🔴🔴🔴 STEP 2: GENERATE SLUG - CRITICAL FIX
    console.log('🔤 Generating slug for product:', productData.productName);
    
    // Validate product name exists
    if (!productData.productName) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product name is required for slug generation"
        },
        { status: 400 }
      );
    }

    // ALWAYS generate slug from product name
    let baseSlug = productData.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // If base slug is empty, use timestamp
    if (!baseSlug || baseSlug.length === 0) {
      baseSlug = `product-${Date.now()}`;
    }

    console.log('📝 Base slug created:', baseSlug);

    // Make slug unique
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existingProduct = await Product.findOne({ 
        companyId, 
        slug: finalSlug 
      });
      
      if (!existingProduct) {
        break;
      }
      
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // CRITICAL: ALWAYS set the slug
    productData.slug = finalSlug;
    console.log('✅ FINAL SLUG SET TO:', productData.slug);

    // 🔴🔴🔴 STEP 3: Create product
    console.log('📦 Creating product with data:', {
      name: productData.productName,
      category: productData.category,
      subCategory: productData.subCategory,
      slug: productData.slug,
      customId: productData.customId
    });
    
    const product = await Product.create(productData);
    
    // Populate for response
    await product.populate('category', 'name slug');
    await product.populate('subCategory', 'name slug'); // Always populate subCategory
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Product created successfully", 
        data: formatProductResponse(product) 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Product Error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let errorMessage = `A product with this ${field} already exists`;
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}

// ========== PUT HANDLER ==========
export async function PUT(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required"
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    if (!body._id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID is required for update"
        },
        { status: 400 }
      );
    }

    if (!isValidObjectId(body._id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid product ID format"
        },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to this company
    const existingProduct = await Product.findOne({ 
      _id: body._id, 
      companyId 
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product not found in this company"
        },
        { status: 404 }
      );
    }

    // ===== NEW: VALIDATE SUBCATEGORY IF BEING UPDATED =====
    if (body.subCategory) {
      // Validate subCategory ID format
      if (!isValidObjectId(body.subCategory)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid subCategory ID format"
          },
          { status: 400 }
        );
      }

      // Check if subCategory exists in this company
      const subCategoryExists = await Category.findOne({ 
        _id: body.subCategory, 
        companyId 
      });
      if (!subCategoryExists) {
        return NextResponse.json(
          { 
            success: false, 
            message: "SubCategory does not exist in this company"
          },
          { status: 400 }
        );
      }

      // Determine which category to check against
      const mainCategoryId = body.category || existingProduct.category;
      
      // Verify subCategory belongs to the main category
      if (subCategoryExists.parentId?.toString() !== mainCategoryId.toString()) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Selected subCategory does not belong to the selected main category"
          },
          { status: 400 }
        );
      }
    }

    // Check SKU uniqueness if being updated
    if (body.sku && body.sku.toUpperCase() !== existingProduct.sku) {
      const existingSku = await Product.findOne({ 
        companyId, 
        sku: body.sku.toUpperCase(),
        _id: { $ne: body._id }
      });
      if (existingSku) {
        return NextResponse.json(
          { 
            success: false, 
            message: "SKU already exists in this company"
          },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedBy: body.updatedBy || body.userId,
      isOnSale: body.discountPrice && body.mrp ? 
                parseFloat(body.discountPrice) < parseFloat(body.mrp) : 
                existingProduct.isOnSale
    };
    
    delete updateData._id;
    delete updateData.companyId;
    delete updateData.createdBy;
    delete updateData.customId;

    const updatedProduct = await Product.findByIdAndUpdate(
      body._id, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    ).populate('category', 'name slug')
     .populate({
        path: 'subCategory',
        select: 'name slug',
        options: { strictPopulate: false }
      });

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully", 
        data: formatProductResponse(updatedProduct)
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT Product Error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: `A product with this ${field} already exists in this company`
        },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: errors.join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update product"
      },
      { status: 500 }
    );
  }
}

// ========== PATCH HANDLER ==========
export async function PATCH(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required"
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Handle bulk updates
    if (body.ids && Array.isArray(body.ids) && body.update) {
      const mongoIds = body.ids.filter(id => isValidObjectId(id));
      
      if (mongoIds.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "No valid product IDs provided"
          },
          { status: 400 }
        );
      }

      // Verify all products belong to this company
      const products = await Product.find({ 
        _id: { $in: mongoIds },
        companyId
      }).select('_id');
      
      if (products.length !== mongoIds.length) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Some products do not belong to this company"
          },
          { status: 403 }
        );
      }

      // Validate category if being bulk updated
      if (body.update.category) {
        if (!isValidObjectId(body.update.category)) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Invalid category ID format"
            },
            { status: 400 }
          );
        }
        const categoryExists = await Category.findOne({ 
          _id: body.update.category, 
          companyId 
        });
        if (!categoryExists) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Category not found in this company"
            },
            { status: 400 }
          );
        }
      }

      // Perform bulk update
      const result = await Product.updateMany(
        { _id: { $in: mongoIds }, companyId },
        { 
          $set: { 
            ...body.update,
            updatedBy: body.updatedBy || body.userId,
            updatedAt: new Date()
          } 
        }
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
    if (!body._id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID required"
        },
        { status: 400 }
      );
    }

    if (!isValidObjectId(body._id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid product ID format"
        },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to this company
    const existingProduct = await Product.findOne({ 
      _id: body._id, 
      companyId 
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product not found in this company"
        },
        { status: 404 }
      );
    }

    // Remove identifier from update data
    const { _id, ...updateData } = body;

    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).populate('category', 'name slug')
      .populate({
        path: 'subCategory',
        select: 'name slug',
        options: { strictPopulate: false }
      });

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully", 
        data: formatProductResponse(updatedProduct)
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PATCH Product Error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: errors.join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update product"
      },
      { status: 500 }
    );
  }
}

// ========== DELETE HANDLER ==========
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get company context
    const companyId = await getCompanyContext(request);
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company context required"
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    const permanent = searchParams.get("permanent") === 'true';

    // Bulk delete
    if (ids) {
      const idArray = ids.split(',');
      const mongoIds = idArray.filter(id => isValidObjectId(id));
      
      if (mongoIds.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "No valid product IDs provided" 
          },
          { status: 400 }
        );
      }

      // Verify all products belong to this company
      const products = await Product.find({ 
        _id: { $in: mongoIds },
        companyId
      }).select('_id');
      
      if (products.length !== mongoIds.length) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Some products do not belong to this company"
          },
          { status: 403 }
        );
      }

      if (permanent) {
        const result = await Product.deleteMany({ 
          _id: { $in: mongoIds }, 
          companyId 
        });
        return NextResponse.json(
          { 
            success: true, 
            message: "Products permanently deleted",
            data: { deletedCount: result.deletedCount }
          },
          { status: 200 }
        );
      } else {
        const result = await Product.updateMany(
          { _id: { $in: mongoIds }, companyId },
          { 
            $set: { 
              deletedAt: new Date(),
              isActive: false,
              updatedBy: searchParams.get("userId")
            } 
          }
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
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID is required"
        },
        { status: 400 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid product ID format"
        },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to this company
    const product = await Product.findOne({ _id: id, companyId });
    if (!product) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product not found in this company"
        },
        { status: 404 }
      );
    }

    if (permanent) {
      await Product.findByIdAndDelete(id);
      return NextResponse.json(
        { 
          success: true, 
          message: "Product permanently deleted"
        },
        { status: 200 }
      );
    } else {
      await Product.findByIdAndUpdate(
        id,
        { 
          $set: {
            deletedAt: new Date(),
            isActive: false,
            updatedBy: searchParams.get("userId")
          }
        }
      );

      return NextResponse.json(
        { 
          success: true, 
          message: "Product deactivated successfully"
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete product"
      },
      { status: 500 }
    );
  }
}

// ========== OPTIONS HANDLER ==========
export async function OPTIONS() {
  return NextResponse.json({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    description: 'Multi-tenant Product management API with company isolation'
  });
}