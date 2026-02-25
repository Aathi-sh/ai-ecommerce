import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Counter from '@/models/Counter';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ✅ GET - Fetch current counter status and history
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can view this
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get the product ID counter
    let counter = await Counter.findOne({ name: 'productId' });
    
    // If counter doesn't exist, create it with default values
    if (!counter) {
      counter = await Counter.create({
        name: 'productId',
        seq: 100,
        prefix: 'PRD',
        padding: 5,
        description: 'Product ID counter',
        createdBy: session.user.email
      });
    }

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get products with customId
    const productsWithCustomId = await Product.countDocuments({ customId: { $exists: true, $ne: null } });

    // Get min and max custom IDs
    const productStats = await Product.aggregate([
      {
        $match: { customId: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          minCustomId: { $min: '$customId' },
          maxCustomId: { $max: '$customId' },
          avgCustomId: { $avg: '$customId' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = productStats[0] || { 
      minCustomId: null, 
      maxCustomId: null, 
      avgCustomId: null, 
      count: 0 
    };

    // Format the IDs for display
    const formatId = (id) => {
      if (!id && id !== 0) return null;
      return String(id).padStart(counter.padding || 5, '0');
    };

    return NextResponse.json({
      success: true,
      data: {
        counter: {
          currentValue: counter.seq,
          formattedCurrent: counter.formattedCurrentId || formatId(counter.seq),
          nextValue: counter.seq + 1,
          formattedNext: formatId(counter.seq + 1),
          prefix: counter.prefix,
          padding: counter.padding,
          description: counter.description,
          createdAt: counter.createdAt,
          updatedAt: counter.updatedAt,
          updatedBy: counter.updatedBy
        },
        products: {
          total: totalProducts,
          withCustomId: stats.count,
          withoutCustomId: totalProducts - stats.count,
          minCustomId: stats.minCustomId,
          maxCustomId: stats.maxCustomId,
          avgCustomId: stats.avgCustomId ? Math.round(stats.avgCustomId) : null,
          minFormatted: stats.minCustomId ? formatId(stats.minCustomId) : null,
          maxFormatted: stats.maxCustomId ? formatId(stats.maxCustomId) : null
        },
        resetHistory: counter.resetHistory || [],
        canReset: true,
        defaultStart: 100,
        warnings: stats.maxCustomId >= counter.seq ? [
          `⚠️ Warning: There are products with IDs (${stats.maxCustomId}) higher than the current counter (${counter.seq}). Resetting might cause conflicts.`
        ] : []
      }
    });

  } catch (error) {
    console.error('❌ Error fetching counter status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch counter status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ✅ POST - Reset the product ID counter
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can perform reset
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { startFrom = 100, reason = 'Admin reset', force = false } = body;

    // Validate startFrom
    if (typeof startFrom !== 'number' || startFrom < 1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid start value',
          error: 'Start value must be a positive number'
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Get current counter
    let counter = await Counter.findOne({ name: 'productId' });
    
    if (!counter) {
      counter = await Counter.create({
        name: 'productId',
        seq: 100,
        prefix: 'PRD',
        padding: 5,
        description: 'Product ID counter',
        createdBy: session.user.email
      });
    }

    const oldValue = counter.seq;

    // Check if there are any products with customId >= new start value
    if (!force) {
      const productsWithHigherId = await Product.countDocuments({ 
        customId: { $gte: startFrom } 
      });

      if (productsWithHigherId > 0) {
        return NextResponse.json({
          success: false,
          message: 'Cannot reset counter',
          error: `There are ${productsWithHigherId} products with IDs >= ${startFrom}. Use force=true to override.`,
          conflicts: productsWithHigherId
        }, { status: 409 });
      }
    }

    // Get client IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Update counter
    counter.seq = startFrom;
    counter.updatedBy = session.user.email;
    counter.updatedAt = new Date();

    // Add to reset history
    counter.resetHistory.push({
      resetBy: session.user.email,
      resetAt: new Date(),
      oldValue,
      newValue: startFrom,
      reason,
      ipAddress,
      userAgent
    });

    // Keep only last 50 history entries
    if (counter.resetHistory.length > 50) {
      counter.resetHistory = counter.resetHistory.slice(-50);
    }

    await counter.save();

    // Log the reset action
    console.log(`🔄 Product ID counter reset by ${session.user.email}: ${oldValue} → ${startFrom} (Reason: ${reason})`);

    // Get updated stats
    const totalProducts = await Product.countDocuments();
    const productsWithCustomId = await Product.countDocuments({ customId: { $exists: true, $ne: null } });

    return NextResponse.json({
      success: true,
      message: `Product ID counter reset successfully`,
      data: {
        oldValue,
        newValue: startFrom,
        formattedNew: String(startFrom).padStart(counter.padding || 5, '0'),
        resetBy: session.user.email,
        resetAt: new Date(),
        reason,
        counter: {
          currentValue: counter.seq,
          nextValue: counter.seq + 1,
          formattedNext: String(counter.seq + 1).padStart(counter.padding || 5, '0'),
          totalResets: counter.resetHistory.length
        },
        stats: {
          totalProducts,
          productsWithCustomId
        }
      }
    });

  } catch (error) {
    console.error('❌ Error resetting counter:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to reset counter',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// ✅ PATCH - Update counter settings (prefix, padding, etc.)
export async function PATCH(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can update settings
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prefix, padding, description } = body;

    await connectDB();

    const counter = await Counter.findOne({ name: 'productId' });
    
    if (!counter) {
      return NextResponse.json(
        { success: false, message: 'Counter not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (prefix !== undefined) {
      if (!/^[A-Za-z]{2,5}$/.test(prefix)) {
        return NextResponse.json(
          { success: false, message: 'Prefix must be 2-5 letters only' },
          { status: 400 }
        );
      }
      counter.prefix = prefix.toUpperCase();
    }

    if (padding !== undefined) {
      const padNum = parseInt(padding);
      if (isNaN(padNum) || padNum < 3 || padNum > 10) {
        return NextResponse.json(
          { success: false, message: 'Padding must be between 3 and 10' },
          { status: 400 }
        );
      }
      counter.padding = padNum;
    }

    if (description !== undefined) {
      counter.description = description;
    }

    counter.updatedBy = session.user.email;
    await counter.save();

    return NextResponse.json({
      success: true,
      message: 'Counter settings updated',
      data: {
        prefix: counter.prefix,
        padding: counter.padding,
        description: counter.description
      }
    });

  } catch (error) {
    console.error('❌ Error updating counter settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Clear reset history (admin only)
export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can clear history
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keep = parseInt(searchParams.get('keep')) || 10; // Keep last 10 by default

    await connectDB();

    const counter = await Counter.findOne({ name: 'productId' });
    
    if (!counter) {
      return NextResponse.json(
        { success: false, message: 'Counter not found' },
        { status: 404 }
      );
    }

    // Keep only the last 'keep' entries
    const originalCount = counter.resetHistory.length;
    if (counter.resetHistory.length > keep) {
      counter.resetHistory = counter.resetHistory.slice(-keep);
      await counter.save();
    }

    return NextResponse.json({
      success: true,
      message: `Reset history cleared. Kept last ${keep} entries.`,
      data: {
        originalCount,
        newCount: counter.resetHistory.length
      }
    });

  } catch (error) {
    console.error('❌ Error clearing history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear history' },
      { status: 500 }
    );
  }
}