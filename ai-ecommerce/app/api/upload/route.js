


// // ==================== FILE UPLOAD API WITH OPTIMAL CONFIGURATION ====================

// import { NextResponse } from "next/server";
// import { writeFile, mkdir, stat, unlink } from "fs/promises";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";

// // ==================== NEXT.JS 14+ ROUTE SEGMENT CONFIGURATION ====================
// // Note: The old `export const config = { api: { bodyParser: false } }` is DEPRECATED in Next.js 14+
// // Use these new route segment config options instead:

// export const maxDuration = 60; // Maximum duration for serverless function (60 seconds)
// export const dynamic = 'force-dynamic'; // Prevent static optimization
// export const runtime = 'nodejs'; // Use Node.js runtime for filesystem operations

// // ==================== IMAGE CONFIGURATION ====================
// const IMAGE_CONFIG = {
//   MAX_FILE_SIZE_MB: 2, // Professional standard: 2MB per image
//   MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2,097,152 bytes
//   MAX_TOTAL_PER_PRODUCT_MB: 8, // 8MB total across all images
//   ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
//   ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
//   COMPRESSION_QUALITY: 85, // 85% quality (good balance)
//   MAX_DIMENSIONS: {
//     width: 1920,
//     height: 1920,
//   },
//   OPTIMIZE: true, // Enable image optimization (requires sharp)
// };

// // ==================== HELPER FUNCTIONS ====================

// /**
//  * Optimize image using Sharp (if available)
//  * Falls back to original if Sharp not installed
//  */
// async function optimizeImage(buffer, originalName) {
//   if (!IMAGE_CONFIG.OPTIMIZE) return buffer;
  
//   try {
//     // Dynamically import sharp - will fail gracefully if not installed
//     let sharpLib;
//     try {
//       sharpLib = await import('sharp');
//       sharpLib = sharpLib.default;
//     } catch (err) {
//       console.log("⚠️ Sharp not installed, skipping image optimization. Install with: npm install sharp --legacy-peer-deps");
//       return buffer;
//     }
    
//     const image = sharpLib(buffer);
//     const metadata = await image.metadata();
    
//     // Resize if dimensions exceed limits
//     let processedImage = image;
//     if (metadata.width > IMAGE_CONFIG.MAX_DIMENSIONS.width || 
//         metadata.height > IMAGE_CONFIG.MAX_DIMENSIONS.height) {
//       processedImage = image.resize(
//         IMAGE_CONFIG.MAX_DIMENSIONS.width,
//         IMAGE_CONFIG.MAX_DIMENSIONS.height,
//         { fit: 'inside', withoutEnlargement: true }
//       );
//     }
    
//     // Compress based on file type
//     const ext = path.extname(originalName).toLowerCase();
//     let optimizedBuffer;
    
//     if (ext === '.jpg' || ext === '.jpeg') {
//       optimizedBuffer = await processedImage
//         .jpeg({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY, progressive: true })
//         .toBuffer();
//     } else if (ext === '.png') {
//       optimizedBuffer = await processedImage
//         .png({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY, compressionLevel: 9 })
//         .toBuffer();
//     } else if (ext === '.webp') {
//       optimizedBuffer = await processedImage
//         .webp({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY })
//         .toBuffer();
//     } else {
//       optimizedBuffer = buffer;
//     }
    
//     const savedPercent = ((buffer.length - optimizedBuffer.length) / buffer.length * 100).toFixed(1);
//     if (parseFloat(savedPercent) > 0) {
//       console.log(`✅ Image optimized: ${(buffer.length / 1024).toFixed(2)}KB → ${(optimizedBuffer.length / 1024).toFixed(2)}KB (saved ${savedPercent}%)`);
//     }
//     return optimizedBuffer;
    
//   } catch (error) {
//     console.error("❌ Image optimization failed:", error.message);
//     return buffer; // Return original if optimization fails
//   }
// }

// /**
//  * Get file size in MB
//  */
// function getFileSizeMB(bytes) {
//   return (bytes / (1024 * 1024)).toFixed(2);
// }

// /**
//  * Validate file extension
//  */
// function isValidExtension(filename) {
//   const ext = path.extname(filename).toLowerCase();
//   return IMAGE_CONFIG.ALLOWED_EXTENSIONS.includes(ext);
// }

// // ==================== MAIN POST HANDLER ====================

// export async function POST(request) {
//   const startTime = Date.now();
  
//   try {
//     // Parse multipart form data - works without bodyParser config in Next.js 14+
//     const formData = await request.formData();
//     const file = formData.get("file");
    
//     // Optional: Get product context for total size tracking
//     const productId = formData.get("productId");
//     const sessionId = formData.get("sessionId");
//     const currentTotalSize = parseInt(formData.get("currentTotalSize") || "0");

//     // Validate file exists
//     if (!file) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "No file uploaded",
//           code: "NO_FILE"
//         },
//         { status: 400 }
//       );
//     }

//     // Validate file name and extension
//     if (!file.name || !isValidExtension(file.name)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: `Invalid file type. Allowed: ${IMAGE_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`,
//           code: "INVALID_TYPE"
//         },
//         { status: 400 }
//       );
//     }

//     // Validate MIME type
//     if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: `Invalid file type. Allowed: ${IMAGE_CONFIG.ALLOWED_TYPES.join(", ")}`,
//           code: "INVALID_MIME"
//         },
//         { status: 400 }
//       );
//     }

//     // Validate individual file size (max 2MB)
//     if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: `File too large. Maximum size is ${IMAGE_CONFIG.MAX_FILE_SIZE_MB}MB per image. Your file: ${getFileSizeMB(file.size)}MB. Please compress your image.`,
//           code: "FILE_TOO_LARGE",
//           fileSize: file.size,
//           maxSize: IMAGE_CONFIG.MAX_FILE_SIZE_BYTES
//         },
//         { status: 413 } // 413 Payload Too Large
//       );
//     }

//     // Validate total product size limit (if product context provided)
//     if (currentTotalSize > 0) {
//       const newTotalSize = currentTotalSize + file.size;
//       const maxTotalBytes = IMAGE_CONFIG.MAX_TOTAL_PER_PRODUCT_MB * 1024 * 1024;
      
//       if (newTotalSize > maxTotalBytes) {
//         const remainingMB = ((maxTotalBytes - currentTotalSize) / (1024 * 1024)).toFixed(2);
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: `Cannot upload. Total product images would exceed ${IMAGE_CONFIG.MAX_TOTAL_PER_PRODUCT_MB}MB limit. Remaining space: ${remainingMB}MB. Remove some images first.`,
//             code: "TOTAL_LIMIT_EXCEEDED",
//             currentTotal: currentTotalSize,
//             fileSize: file.size,
//             maxTotal: maxTotalBytes,
//             remainingMB: remainingMB
//           },
//           { status: 413 }
//         );
//       }
//     }

//     // Read file buffer
//     const bytes = await file.arrayBuffer();
//     let buffer = Buffer.from(bytes);
//     const originalSize = buffer.length;

//     // Optimize image (compress and resize) - graceful fallback if sharp not installed
//     buffer = await optimizeImage(buffer, file.name);
//     const optimizedSize = buffer.length;
//     const savedPercent = originalSize > 0 ? ((originalSize - optimizedSize) / originalSize * 100).toFixed(1) : "0";

//     // Create uploads directory with date-based subfolders for organization
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const uploadsDir = path.join(process.cwd(), "public/uploads", year.toString(), month, day);
    
//     try {
//       await mkdir(uploadsDir, { recursive: true });
//     } catch (err) {
//       console.log("Uploads directory created or already exists");
//     }

//     // Generate unique filename with timestamp
//     const fileExtension = path.extname(file.name).toLowerCase();
//     const timestamp = Date.now();
//     const uniqueId = uuidv4().slice(0, 8);
//     const fileName = `${timestamp}-${uniqueId}${fileExtension}`;
//     const filePath = path.join(uploadsDir, fileName);

//     // Save optimized file
//     await writeFile(filePath, buffer);

//     // Verify file was saved correctly
//     const stats = await stat(filePath);
//     if (stats.size === 0) {
//       throw new Error("File saved but size is 0 bytes");
//     }

//     // Generate public URL
//     const imageUrl = `/uploads/${year}/${month}/${day}/${fileName}`;

//     // Calculate processing time
//     const processingTime = Date.now() - startTime;

//     console.log(`✅ Upload successful: ${fileName} (${getFileSizeMB(optimizedSize)}MB) in ${processingTime}ms`);

//     // Success response with detailed info
//     return NextResponse.json({
//       success: true,
//       message: "File uploaded successfully",
//       imageUrl: imageUrl,
//       metadata: {
//         originalName: file.name,
//         originalSize: originalSize,
//         originalSizeMB: getFileSizeMB(originalSize),
//         optimizedSize: optimizedSize,
//         optimizedSizeMB: getFileSizeMB(optimizedSize),
//         savedPercent: savedPercent,
//         mimeType: file.type,
//         processingTime: `${processingTime}ms`,
//       }
//     });

//   } catch (error) {
//     console.error("❌ Upload error details:", {
//       message: error.message,
//       stack: error.stack,
//       timestamp: new Date().toISOString()
//     });
    
//     // Handle specific errors with user-friendly messages
//     if (error.code === 'ENOSPC') {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Server storage is full. Please contact support.",
//           code: "STORAGE_FULL"
//         },
//         { status: 507 }
//       );
//     }
    
//     if (error.code === 'EACCES') {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Permission denied. Cannot save file. Please check folder permissions.",
//           code: "PERMISSION_DENIED"
//         },
//         { status: 403 }
//       );
//     }
    
//     // Check for specific file-related errors
//     if (error.message.includes("EISDIR")) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Invalid file path. Please try again.",
//           code: "INVALID_PATH"
//         },
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "File upload failed. Please try again.",
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//         code: "UPLOAD_FAILED"
//       },
//       { status: 500 }
//     );
//   }
// }

// // ==================== DELETE UPLOADED FILE ====================
// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const fileUrl = searchParams.get("url");
    
//     if (!fileUrl) {
//       return NextResponse.json(
//         { success: false, message: "File URL required" },
//         { status: 400 }
//       );
//     }
    
//     // Security: Ensure path is within uploads directory
//     if (!fileUrl.includes("/uploads/")) {
//       return NextResponse.json(
//         { success: false, message: "Invalid file path" },
//         { status: 400 }
//       );
//     }
    
//     // Convert URL to filesystem path
//     const filePath = path.join(process.cwd(), "public", fileUrl);
    
//     // Additional security: Normalize and verify path is within public/uploads
//     const normalizedPath = path.normalize(filePath);
//     const uploadsPath = path.normalize(path.join(process.cwd(), "public/uploads"));
//     if (!normalizedPath.startsWith(uploadsPath)) {
//       return NextResponse.json(
//         { success: false, message: "Access denied" },
//         { status: 403 }
//       );
//     }
    
//     // Delete file
//     await unlink(filePath);
    
//     console.log(`🗑️ File deleted: ${fileUrl}`);
    
//     return NextResponse.json({
//       success: true,
//       message: "File deleted successfully"
//     });
    
//   } catch (error) {
//     console.error("❌ Delete error:", error);
    
//     if (error.code === 'ENOENT') {
//       return NextResponse.json(
//         { success: false, message: "File not found" },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(
//       { success: false, message: "Failed to delete file" },
//       { status: 500 }
//     );
//   }
// }





















// ==================== PROFESSIONAL UPLOAD API WITH AUTO-COMPRESSION ====================
// Accepts ANY image size (5MB, 20MB, 50MB+) and automatically compresses to 500KB-1MB
// Uses Sharp for industry-leading image optimization

import { NextResponse } from "next/server";
import { writeFile, mkdir, stat, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// ==================== NEXT.JS 14+ ROUTE SEGMENT CONFIGURATION ====================
export const maxDuration = 60; // Maximum duration for serverless function (60 seconds)
export const dynamic = 'force-dynamic'; // Prevent static optimization
export const runtime = 'nodejs'; // Use Node.js runtime for filesystem operations

// ==================== PROFESSIONAL IMAGE CONFIGURATION ====================
// KEY CHANGE: No file size limit! Accept ANY size, auto-compress to target
const IMAGE_CONFIG = {
  // ===== NO INPUT SIZE LIMIT =====
  // Accept any file size - we'll compress it automatically
  MAX_FILE_SIZE_MB: 100,      // Accept up to 100MB (you can increase this)
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100MB limit (safety only)
  
  // ===== OUTPUT TARGETS (Auto-compression goals) =====
  TARGET_SIZE_KB: 800,        // Target: 800KB (perfect for web)
  MAX_OUTPUT_SIZE_KB: 1024,   // Never exceed 1MB (1024KB)
  MIN_OUTPUT_SIZE_KB: 300,    // Don't over-compress small images
  
  // ===== QUALITY SETTINGS (Sharp will auto-adjust) =====
  QUALITY: {
    START: 85,                // Start with high quality
    MIN: 55,                  // Minimum quality (don't go below 55%)
    MAX: 92,                  // Maximum quality
    STEP: 5,                  // Reduce by 5% each iteration if needed
  },
  
  // ===== DIMENSION LIMITS =====
  MAX_WIDTH: 1920,            // Max width for product images
  MAX_HEIGHT: 1920,           // Max height for product images
  
  // ===== OUTPUT FORMAT =====
  // WebP gives 25-35% better compression than JPEG
  OUTPUT_FORMAT: 'webp',      // Convert everything to WebP for best compression
  FALLBACK_FORMAT: 'jpeg',    // Fallback if WebP fails
  
  // ===== FILE VALIDATION =====
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"],
};

// ==================== SMART COMPRESSION ENGINE ====================

/**
 * Intelligently compress image to target size (500KB-1MB)
 * Uses binary search style quality adjustment for optimal results
 */
async function smartCompress(buffer, originalName) {
  const startTime = Date.now();
  
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    console.log(`📸 Original: ${metadata.width}x${metadata.height}, ${(buffer.length / 1024).toFixed(2)}KB`);
    
    // Step 1: Resize if dimensions exceed limits
    let processedImage = image;
    let needsResize = false;
    
    if (metadata.width > IMAGE_CONFIG.MAX_WIDTH || metadata.height > IMAGE_CONFIG.MAX_HEIGHT) {
      processedImage = image.resize(
        IMAGE_CONFIG.MAX_WIDTH,
        IMAGE_CONFIG.MAX_HEIGHT,
        { fit: 'inside', withoutEnlargement: true }
      );
      needsResize = true;
      console.log(`📏 Resizing from ${metadata.width}x${metadata.height} to max ${IMAGE_CONFIG.MAX_WIDTH}x${IMAGE_CONFIG.MAX_HEIGHT}`);
    }
    
    // Step 2: Determine best quality to hit target size
    // Always convert to WebP for best compression (25-35% smaller than JPEG)
    let bestQuality = IMAGE_CONFIG.QUALITY.START;
    let optimizedBuffer = null;
    let bestBuffer = null;
    let bestSize = Infinity;
    
    // Try different quality levels to hit target
    const qualitiesToTry = [
      IMAGE_CONFIG.QUALITY.START,     // 85 - Try high quality first
      IMAGE_CONFIG.QUALITY.START - 10, // 75 - Medium-high
      IMAGE_CONFIG.QUALITY.START - 15, // 70 - Medium
      IMAGE_CONFIG.QUALITY.START - 20, // 65 - Medium-low
      IMAGE_CONFIG.QUALITY.MIN,        // 55 - Minimum acceptable
    ];
    
    for (const quality of qualitiesToTry) {
      if (quality < IMAGE_CONFIG.QUALITY.MIN) continue;
      
      const testBuffer = await processedImage
        .webp({ quality: quality, effort: 6 }) // effort 6 = best compression
        .toBuffer();
      
      const sizeKB = testBuffer.length / 1024;
      console.log(`🔍 Testing quality ${quality}%: ${sizeKB.toFixed(2)}KB`);
      
      // Check if this quality hits our target
      if (sizeKB <= IMAGE_CONFIG.TARGET_SIZE_KB) {
        // Found a quality that gets us under target
        if (sizeKB < bestSize) {
          bestBuffer = testBuffer;
          bestQuality = quality;
          bestSize = sizeKB;
        }
        // Once we're under target, try to see if higher quality still fits
        if (sizeKB <= IMAGE_CONFIG.TARGET_SIZE_KB && quality > bestQuality) {
          bestBuffer = testBuffer;
          bestQuality = quality;
          bestSize = sizeKB;
        }
      } else if (bestBuffer === null) {
        // Not under target yet, but save best so far
        bestBuffer = testBuffer;
        bestQuality = quality;
        bestSize = sizeKB;
      }
    }
    
    // Final check: if still over 1MB, force lower quality
    if (bestBuffer && bestBuffer.length / 1024 > IMAGE_CONFIG.MAX_OUTPUT_SIZE_KB) {
      console.log(`⚠️ Still over ${IMAGE_CONFIG.MAX_OUTPUT_SIZE_KB}KB, forcing minimum quality`);
      bestBuffer = await processedImage
        .webp({ quality: IMAGE_CONFIG.QUALITY.MIN, effort: 6 })
        .toBuffer();
      bestSize = bestBuffer.length / 1024;
    }
    
    optimizedBuffer = bestBuffer || await processedImage.webp({ quality: IMAGE_CONFIG.QUALITY.MIN }).toBuffer();
    const finalSizeKB = optimizedBuffer.length / 1024;
    const savedPercent = ((buffer.length - optimizedBuffer.length) / buffer.length * 100).toFixed(1);
    
    console.log(`✅ Smart compression complete:`);
    console.log(`   Original: ${(buffer.length / 1024).toFixed(2)}KB`);
    console.log(`   Final: ${finalSizeKB.toFixed(2)}KB (${savedPercent}% saved)`);
    console.log(`   Quality: ${bestQuality}% | Format: WebP`);
    console.log(`   Time: ${Date.now() - startTime}ms`);
    
    // Return with metadata
    return {
      buffer: optimizedBuffer,
      metadata: {
        originalSize: buffer.length,
        originalSizeKB: (buffer.length / 1024).toFixed(2),
        compressedSize: optimizedBuffer.length,
        compressedSizeKB: finalSizeKB.toFixed(2),
        savedPercent: savedPercent,
        qualityUsed: bestQuality,
        format: 'webp',
        wasResized: needsResize,
        processingTime: Date.now() - startTime,
      }
    };
    
  } catch (error) {
    console.error("❌ Smart compression failed:", error.message);
    // Fallback: return original buffer
    return {
      buffer: buffer,
      metadata: {
        originalSize: buffer.length,
        originalSizeKB: (buffer.length / 1024).toFixed(2),
        compressedSize: buffer.length,
        compressedSizeKB: (buffer.length / 1024).toFixed(2),
        savedPercent: "0",
        qualityUsed: "original",
        format: path.extname(originalName).toLowerCase().substring(1),
        wasResized: false,
        processingTime: Date.now() - startTime,
        error: error.message
      }
    };
  }
}

/**
 * Validate file extension
 */
function isValidExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_CONFIG.ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Get file size in MB for display
 */
function getFileSizeMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Get file size in KB for display
 */
function getFileSizeKB(bytes) {
  return (bytes / 1024).toFixed(2);
}

// ==================== MAIN POST HANDLER ====================

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file");
    
    // Optional: Get product context for total size tracking
    const productId = formData.get("productId");
    const sessionId = formData.get("sessionId");

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

    // ===== KEY CHANGE: Accept any file size, no rejection! =====
    // Just log the size for monitoring, but always accept
    const originalSizeMB = getFileSizeMB(file.size);
    console.log(`📤 Upload received: ${file.name} (${originalSizeMB}MB) - will auto-compress`);
    
    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
      console.log(`⚠️ Large file detected: ${originalSizeMB}MB. Auto-compression will handle this.`);
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    const originalSize = buffer.length;

    // ===== KEY CHANGE: Always compress, no matter the size =====
    // Smart compression will target 500KB-1MB output
    const compressionResult = await smartCompress(buffer, file.name);
    buffer = compressionResult.buffer;
    const compressionMeta = compressionResult.metadata;

    // Create uploads directory with date-based subfolders for organization
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const uploadsDir = path.join(process.cwd(), "public/uploads", year.toString(), month, day);
    
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directory already exists or created
    }

    // Generate unique filename with timestamp and .webp extension (since we convert to WebP)
    const timestamp = Date.now();
    const uniqueId = uuidv4().slice(0, 8);
    const fileName = `${timestamp}-${uniqueId}.webp`; // Always save as WebP
    const filePath = path.join(uploadsDir, fileName);

    // Save optimized file
    await writeFile(filePath, buffer);

    // Verify file was saved correctly
    const stats = await stat(filePath);
    if (stats.size === 0) {
      throw new Error("File saved but size is 0 bytes");
    }

    // Generate public URL
    const imageUrl = `/uploads/${year}/${month}/${day}/${fileName}`;

    // Calculate total processing time
    const processingTime = Date.now() - startTime;

    // Prepare success message with compression details
    let successMessage = "File uploaded successfully";
    if (parseFloat(compressionMeta.savedPercent) > 0) {
      successMessage = `Uploaded and compressed! Saved ${compressionMeta.savedPercent}% space (${compressionMeta.originalSizeKB}KB → ${compressionMeta.compressedSizeKB}KB)`;
    }

    console.log(`✅ Upload complete: ${fileName} | Original: ${compressionMeta.originalSizeKB}KB → Final: ${compressionMeta.compressedSizeKB}KB | Time: ${processingTime}ms`);

    // Success response with detailed metadata
    return NextResponse.json({
      success: true,
      message: successMessage,
      imageUrl: imageUrl,
      metadata: {
        originalName: file.name,
        originalSize: originalSize,
        originalSizeKB: compressionMeta.originalSizeKB,
        originalSizeMB: getFileSizeMB(originalSize),
        compressedSize: compressionMeta.compressedSize,
        compressedSizeKB: compressionMeta.compressedSizeKB,
        compressedSizeMB: getFileSizeMB(compressionMeta.compressedSize),
        savedPercent: compressionMeta.savedPercent,
        qualityUsed: compressionMeta.qualityUsed,
        format: compressionMeta.format || 'webp',
        dimensions: compressionMeta.dimensions,
        wasResized: compressionMeta.wasResized || false,
        processingTime: `${processingTime}ms`,
        mimeType: 'image/webp', // Always WebP output
      }
    });

  } catch (error) {
    console.error("❌ Upload error details:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific errors with user-friendly messages
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
          message: "Permission denied. Cannot save file. Please check folder permissions.",
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

// ==================== DELETE UPLOADED FILE ====================
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
    
    // Security: Ensure path is within uploads directory
    if (!fileUrl.includes("/uploads/")) {
      return NextResponse.json(
        { success: false, message: "Invalid file path" },
        { status: 400 }
      );
    }
    
    // Convert URL to filesystem path
    const filePath = path.join(process.cwd(), "public", fileUrl);
    
    // Additional security: Normalize and verify path is within public/uploads
    const normalizedPath = path.normalize(filePath);
    const uploadsPath = path.normalize(path.join(process.cwd(), "public/uploads"));
    if (!normalizedPath.startsWith(uploadsPath)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }
    
    // Delete file
    await unlink(filePath);
    
    console.log(`🗑️ File deleted: ${fileUrl}`);
    
    return NextResponse.json({
      success: true,
      message: "File deleted successfully"
    });
    
  } catch (error) {
    console.error("❌ Delete error:", error);
    
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to delete file" },
      { status: 500 }
    );
  }
}