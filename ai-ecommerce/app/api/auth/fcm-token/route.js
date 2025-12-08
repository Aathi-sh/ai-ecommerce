import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import AdminDeviceToken from '@/models/AdminDeviceToken';
import User from '@/models/User';

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }

  await connectDB();

  const { method } = req;
  const adminId = session.user.id;

  switch (method) {
    case 'POST':
      return handlePostToken(req, res, adminId);
    case 'GET':
      return handleGetTokens(req, res, adminId);
    case 'DELETE':
      return handleDeleteToken(req, res, adminId);
    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

// Save FCM token
async function handlePostToken(req, res, adminId) {
  try {
    const { token, deviceInfo } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Check if admin exists and is active
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      return res.status(403).json({ error: 'Admin account not found or inactive' });
    }

    // Check if token already exists for this device
    const existingToken = await AdminDeviceToken.findOne({
      admin: adminId,
      token,
    });

    if (existingToken) {
      // Update existing token
      existingToken.lastUsed = new Date();
      existingToken.deviceInfo = {
        ...existingToken.deviceInfo,
        ...deviceInfo,
        updatedAt: new Date(),
      };
      
      // Reactivate if it was inactive/expired
      if (existingToken.status !== 'active') {
        existingToken.status = 'active';
      }
      
      await existingToken.save();
      
      return res.status(200).json({
        success: true,
        message: 'Token updated',
        token: existingToken,
      });
    }

    // Create new token record
    const newToken = await AdminDeviceToken.create({
      admin: adminId,
      token,
      deviceInfo: {
        ...deviceInfo,
        createdAt: new Date(),
      },
      status: 'active',
      lastUsed: new Date(),
    });

    // Update admin notification count
    admin.metrics = admin.metrics || {};
    admin.metrics.deviceCount = (admin.metrics.deviceCount || 0) + 1;
    await admin.save();

    return res.status(201).json({
      success: true,
      message: 'Token saved successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    return res.status(500).json({ 
      error: 'Failed to save token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get all tokens for admin
async function handleGetTokens(req, res, adminId) {
  try {
    const tokens = await AdminDeviceToken.find({
      admin: adminId,
      status: 'active',
    }).sort({ lastUsed: -1 });

    return res.status(200).json({
      success: true,
      tokens,
      count: tokens.length,
    });
  } catch (error) {
    console.error('❌ Error fetching tokens:', error);
    return res.status(500).json({ error: 'Failed to fetch tokens' });
  }
}

// Delete specific token
async function handleDeleteToken(req, res, adminId) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const result = await AdminDeviceToken.findOneAndUpdate(
      {
        admin: adminId,
        token,
      },
      {
        status: 'inactive',
        deactivatedAt: new Date(),
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Token not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Token deactivated successfully',
      token: result,
    });
  } catch (error) {
    console.error('❌ Error deleting token:', error);
    return res.status(500).json({ error: 'Failed to delete token' });
  }
}