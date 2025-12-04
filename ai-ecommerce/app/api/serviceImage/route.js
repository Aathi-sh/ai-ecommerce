import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { path: imagePath } = params;
    
    if (!imagePath || imagePath.length === 0) {
      return NextResponse.json(
        { error: 'Image path required' },
        { status: 400 }
      );
    }

    // Security check - prevent directory traversal
    const safePath = imagePath.join('/');
    if (safePath.includes('..') || safePath.includes('//')) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'public', 'uploads', ...imagePath);
    
    // Check if file exists and is an image
    const imageBuffer = await readFile(fullPath);
    
    // Set appropriate content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    
    const contentType = contentTypes[ext] || 'image/jpeg';
    
    // Create response with image buffer
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Image serve error:', error);
    
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Configure for App Router
export const dynamic = 'force-static';
export const runtime = 'nodejs';