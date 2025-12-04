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

    // If ID parameter is provided, fetch single product
    if (id) {
      // Validate if id is a valid ObjectId
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

      const product = await Product.findById(id);
      
      if (!product) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product not found",
            error: `No product found with ID: ${id}`
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
          { status: 410 } // 410 Gone - resource no longer available
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Product fetched successfully",
          data: product 
        },
        { status: 200 }
      );
    }

    // If no ID, fetch all active products with optional filters
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        message: products.length ? "Products fetched successfully" : "No products found",
        data: products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
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
        error: error.message 
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

    // Validate required fields
    const requiredFields = ['productName', 'category', 'price', 'description', 'stock'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
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

    // Validate price is positive number
    if (body.price <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid price",
          error: "Price must be greater than 0" 
        },
        { status: 400 }
      );
    }

    // Validate stock is non-negative integer
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

    // Handle image URLs - ensure array format
    if (body.imageUrls && !Array.isArray(body.imageUrls)) {
      body.imageUrls = [body.imageUrls];
    }

    // Set default values
    if (!body.imageUrls || body.imageUrls.length === 0) {
      body.imageUrls = ['/images/default-product.jpg'];
    }

    if (body.isActive === undefined) {
      body.isActive = true;
    }

    // Assign createdBy if not provided
    if (!body.createdBy) {
      body.createdBy = new mongoose.Types.ObjectId().toString();
    }

    // Create product
    const product = await Product.create(body);
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Product created successfully", 
        data: product 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Product Error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product already exists",
          error: "A product with this name already exists" 
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
        error: error.message 
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

    if (!body._id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID is required",
          error: "_id field is required for update" 
        },
        { status: 400 }
      );
    }

    // Validate if _id is a valid ObjectId
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

    // Validate price if provided
    if (body.price !== undefined && body.price <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid price",
          error: "Price must be greater than 0" 
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

    // Handle image URLs format
    if (body.imageUrls && !Array.isArray(body.imageUrls)) {
      body.imageUrls = [body.imageUrls];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      body._id, 
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
          error: `No product found with ID: ${body._id}` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully", 
        data: updatedProduct 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT Product Error:", error);
    
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
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete a product
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID is required",
          error: "id parameter is required for deletion" 
        },
        { status: 400 }
      );
    }

    // Validate if id is a valid ObjectId
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

    // Soft delete by setting isActive to false
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedProduct) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product not found",
          error: `No product found with ID: ${id}` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Product deleted successfully",
        data: { _id: deletedProduct._id, productName: deletedProduct.productName }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete product",
        error: error.message 
      },
      { status: 500 }
    );
  }
}