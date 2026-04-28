// import { NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json(
//         { success: false, message: "No file uploaded" },
//         { status: 400 }
//       );
//     }

//     // Validate file type
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid file type. Only JPEG, PNG, WebP, GIF are allowed." },
//         { status: 400 }
//       );
//     }

//     // Validate file size (max 5MB)
//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       return NextResponse.json(
//         { success: false, message: "File too large. Maximum size is 5MB." },
//         { status: 400 }
//       );
//     }

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Create uploads directory if it doesn't exist
//     const uploadsDir = path.join(process.cwd(), "public/uploads");
//     try {
//       await mkdir(uploadsDir, { recursive: true });
//     } catch (err) {
//       console.log("Uploads directory already exists");
//     }

//     // Generate unique filename
//     const fileExtension = path.extname(file.name);
//     const fileName = `${uuidv4()}${fileExtension}`;
//     const filePath = path.join(uploadsDir, fileName);

//     // Save file
//     await writeFile(filePath, buffer);

//     // Return public URL
//     const imageUrl = `/uploads/${fileName}`;

//     return NextResponse.json({
//       success: true,
//       message: "File uploaded successfully",
//       imageUrl: imageUrl,
//     });

//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { success: false, message: "File upload failed" },
//       { status: 500 }
//     );
//   }
// }









// ==================== FILE UPLOAD API WITH OPTIMAL CONFIGURATION ====================

import { NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp"; // Optional: for image optimization (install: npm install sharp)

// ==================== CONFIGURATION ====================
export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle large files
    responseLimit: false, // Disable response size limit
  },
};

// Server configuration for Next.js App Router
export const maxDuration = 60; // Maximum duration for serverless function (Vercel)
export const dynamic = 'force-dynamic'; // Prevent static optimization

// Image configuration
const IMAGE_CONFIG = {
  MAX_FILE_SIZE_MB: 2, // Professional standard: 2MB per image (changed from 5MB)
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2,097,152 bytes
  MAX_TOTAL_PER_PRODUCT_MB: 8, // 8MB total across all images
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
  COMPRESSION_QUALITY: 85, // 85% quality (good balance)
  MAX_DIMENSIONS: {
    width: 1920,
    height: 1920,
  },
  OPTIMIZE: true, // Enable image optimization
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Optimize image using Sharp (if available)
 * Falls back to original if Sharp not installed
 */
async function optimizeImage(buffer, originalName) {
  if (!IMAGE_CONFIG.OPTIMIZE) return buffer;
  
  try {
    // Check if sharp is available
    let sharpLib;
    try {
      sharpLib = await import('sharp');
      sharpLib = sharpLib.default;
    } catch (err) {
      console.log("Sharp not installed, skipping optimization");
      return buffer;
    }
    
    const image = sharpLib(buffer);
    const metadata = await image.metadata();
    
    // Resize if dimensions exceed limits
    let processedImage = image;
    if (metadata.width > IMAGE_CONFIG.MAX_DIMENSIONS.width || 
        metadata.height > IMAGE_CONFIG.MAX_DIMENSIONS.height) {
      processedImage = image.resize(
        IMAGE_CONFIG.MAX_DIMENSIONS.width,
        IMAGE_CONFIG.MAX_DIMENSIONS.height,
        { fit: 'inside', withoutEnlargement: true }
      );
    }
    
    // Compress based on file type
    const ext = path.extname(originalName).toLowerCase();
    let optimizedBuffer;
    
    if (ext === '.jpg' || ext === '.jpeg') {
      optimizedBuffer = await processedImage
        .jpeg({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY, progressive: true })
        .toBuffer();
    } else if (ext === '.png') {
      optimizedBuffer = await processedImage
        .png({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY, compressionLevel: 9 })
        .toBuffer();
    } else if (ext === '.webp') {
      optimizedBuffer = await processedImage
        .webp({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY })
        .toBuffer();
    } else {
      optimizedBuffer = buffer;
    }
    
    console.log(`Image optimized: ${(buffer.length / 1024).toFixed(2)}KB → ${(optimizedBuffer.length / 1024).toFixed(2)}KB`);
    return optimizedBuffer;
    
  } catch (error) {
    console.error("Image optimization failed:", error);
    return buffer; // Return original if optimization fails
  }
}

/**
 * Get file size in MB
 */
function getFileSizeMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Validate file extension
 */
function isValidExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_CONFIG.ALLOWED_EXTENSIONS.includes(ext);
}

// ==================== MAIN POST HANDLER ====================

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // Parse multipart form data with larger limit
    const formData = await request.formData();
    const file = formData.get("file");
    
    // Optional: Get product context for total size tracking
    const productId = formData.get("productId");
    const sessionId = formData.get("sessionId");
    const currentTotalSize = parseInt(formData.get("currentTotalSize") || "0");

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          message: "No file uploaded",
          code: "NO_FILE"
        },
        { status: 400 }
      );
    }

    // Validate file name and extension
    if (!file.name || !isValidExtension(file.name)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid file type. Allowed: ${IMAGE_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`,
          code: "INVALID_TYPE"
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid file type. Allowed: ${IMAGE_CONFIG.ALLOWED_TYPES.join(", ")}`,
          code: "INVALID_MIME"
        },
        { status: 400 }
      );
    }

    // Validate individual file size (max 2MB)
    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { 
          success: false, 
          message: `File too large. Maximum size is ${IMAGE_CONFIG.MAX_FILE_SIZE_MB}MB per image. Your file: ${getFileSizeMB(file.size)}MB`,
          code: "FILE_TOO_LARGE",
          fileSize: file.size,
          maxSize: IMAGE_CONFIG.MAX_FILE_SIZE_BYTES
        },
        { status: 413 } // 413 Payload Too Large
      );
    }

    // Validate total product size limit (if product context provided)
    if (currentTotalSize > 0) {
      const newTotalSize = currentTotalSize + file.size;
      const maxTotalBytes = IMAGE_CONFIG.MAX_TOTAL_PER_PRODUCT_MB * 1024 * 1024;
      
      if (newTotalSize > maxTotalBytes) {
        const remainingMB = ((maxTotalBytes - currentTotalSize) / (1024 * 1024)).toFixed(2);
        return NextResponse.json(
          { 
            success: false, 
            message: `Cannot upload. Total product images would exceed ${IMAGE_CONFIG.MAX_TOTAL_PER_PRODUCT_MB}MB limit. Remaining space: ${remainingMB}MB`,
            code: "TOTAL_LIMIT_EXCEEDED",
            currentTotal: currentTotalSize,
            fileSize: file.size,
            maxTotal: maxTotalBytes,
            remainingMB: remainingMB
          },
          { status: 413 }
        );
      }
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Optimize image (compress and resize)
    const originalSize = buffer.length;
    buffer = await optimizeImage(buffer, file.name);
    const optimizedSize = buffer.length;
    const savedPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    // Create uploads directory with date-based subfolders for organization
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const uploadsDir = path.join(process.cwd(), "public/uploads", year.toString(), month);
    
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.log("Uploads directory created or already exists");
    }

    // Generate unique filename with timestamp
    const fileExtension = path.extname(file.name).toLowerCase();
    const timestamp = Date.now();
    const uniqueId = uuidv4().slice(0, 8);
    const fileName = `${timestamp}-${uniqueId}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save optimized file
    await writeFile(filePath, buffer);

    // Verify file was saved correctly
    const stats = await stat(filePath);
    if (stats.size === 0) {
      throw new Error("File saved but size is 0 bytes");
    }

    // Generate public URL
    const imageUrl = `/uploads/${year}/${month}/${fileName}`;

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Success response with detailed info
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      imageUrl: imageUrl,
      metadata: {
        originalName: file.name,
        originalSize: originalSize,
        originalSizeMB: getFileSizeMB(originalSize),
        optimizedSize: optimizedSize,
        optimizedSizeMB: getFileSizeMB(optimizedSize),
        savedPercent: savedPercent,
        mimeType: file.type,
        processingTime: `${processingTime}ms`,
        dimensions: IMAGE_CONFIG.MAX_DIMENSIONS
      }
    });

  } catch (error) {
    console.error("Upload error details:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific errors
    if (error.code === 'ENOSPC') {
      return NextResponse.json(
        { 
          success: false, 
          message: "Server storage is full. Please contact support.",
          code: "STORAGE_FULL"
        },
        { status: 507 }
      );
    }
    
    if (error.code === 'EACCES') {
      return NextResponse.json(
        { 
          success: false, 
          message: "Permission denied. Cannot save file.",
          code: "PERMISSION_DENIED"
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "File upload failed. Please try again.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: "UPLOAD_FAILED"
      },
      { status: 500 }
    );
  }
}

// ==================== OPTIONAL: DELETE UPLOADED FILE ====================
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");
    
    if (!fileUrl) {
      return NextResponse.json(
        { success: false, message: "File URL required" },
        { status: 400 }
      );
    }
    
    // Convert URL to filesystem path
    const filePath = path.join(process.cwd(), "public", fileUrl);
    
    // Security: Ensure path is within uploads directory
    if (!filePath.includes("/uploads/")) {
      return NextResponse.json(
        { success: false, message: "Invalid file path" },
        { status: 400 }
      );
    }
    
    // Delete file (implement fs.unlink)
    const { unlink } = await import("fs/promises");
    await unlink(filePath);
    
    return NextResponse.json({
      success: true,
      message: "File deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete file" },
      { status: 500 }
    );
  }
}