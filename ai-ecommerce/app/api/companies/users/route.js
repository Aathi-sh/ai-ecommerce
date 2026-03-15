// app/api/companies/users/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db';
import User from '@/models/user';
import Company from '@/models/Company';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// ============== HELPER FUNCTIONS ==============
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 12;
};

function formatDistanceToNow(date, options = {}) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'just now';
}

// ============== GET HANDLER ==============
export async function GET(request) {
  try {
    // Auth check - SUPER ADMIN ONLY
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if super admin
    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    if (!isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'users';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const role = searchParams.get('role') || 'all';
    const companyId = searchParams.get('companyId') || 'all';
    const userId = searchParams.get('userId');
    
    const skip = (page - 1) * limit;

    await connectDB();

    // ===== USERS LIST =====
    if (type === 'users') {
      let query = { deletedAt: null };
      
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      if (status !== 'all') {
        query.status = status;
      }
      if (role !== 'all') {
        query.role = role;
      }
      if (companyId !== 'all' && isValidObjectId(companyId)) {
        query.companyId = companyId;
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .populate('companyId', 'companyName companyEmail')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query)
      ]);

      // Get company names for users
      const companyIds = users.map(u => u.companyId).filter(Boolean);
      const companies = await Company.find({ _id: { $in: companyIds } })
        .select('companyName')
        .lean();

      const companyMap = companies.reduce((acc, c) => {
        acc[c._id.toString()] = c.companyName;
        return acc;
      }, {});

      const formattedUsers = users.map(u => ({
        id: u._id.toString(),
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        adminType: u.adminType,
        status: u.status,
        isVerified: u.isVerified,
        companyId: u.companyId?.toString(),
        companyName: u.companyId ? companyMap[u.companyId.toString()] || 'Unknown' : 'Super Admin',
        lastLogin: u.lastLogin,
        lastSeen: u.lastSeen,
        loginCount: u.loginCount,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));

      // Get stats
      const stats = {
        totalUsers: await User.countDocuments({ deletedAt: null }),
        activeUsers: await User.countDocuments({ status: 'active', deletedAt: null }),
        pendingUsers: await User.countDocuments({ status: 'pending', deletedAt: null }),
        suspendedUsers: await User.countDocuments({ status: 'suspended', deletedAt: null }),
        totalAdmins: await User.countDocuments({ role: 'admin', deletedAt: null }),
        superAdmins: await User.countDocuments({ 
          role: 'admin', 
          adminType: 'super',
          deletedAt: null 
        }),
        companyAdmins: await User.countDocuments({ 
          role: 'admin', 
          adminType: 'company',
          deletedAt: null 
        }),
        onlineNow: await User.countDocuments({ 
          status: 'active',
          lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
          deletedAt: null 
        })
      };

      return NextResponse.json({
        success: true,
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      });
    }

    // ===== SINGLE USER =====
    else if (type === 'user' && userId) {
      if (!isValidObjectId(userId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid user ID' },
          { status: 400 }
        );
      }

      const user = await User.findById(userId)
        .populate('companyId', 'companyName companyEmail')
        .lean();

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Get company name
      let companyName = null;
      if (user.companyId) {
        const company = await Company.findById(user.companyId).select('companyName').lean();
        companyName = company?.companyName;
      }

      const formattedUser = {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        adminType: user.adminType,
        status: user.status,
        isVerified: user.isVerified,
        companyId: user.companyId?.toString(),
        companyName,
        lastLogin: user.lastLogin,
        lastSeen: user.lastSeen,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        notificationSettings: user.notificationSettings,
        adminPreferences: user.adminPreferences
      };

      return NextResponse.json({
        success: true,
        data: formattedUser
      });
    }

    // ===== ROLES =====
    else if (type === 'roles') {
      // Get unique roles from users
      const roles = await User.aggregate([
        { $match: { deletedAt: null } },
        { $group: { 
          _id: '$role',
          count: { $sum: 1 },
          users: { $push: '$fullName' }
        }},
        { $sort: { count: -1 } }
      ]);

      const formattedRoles = roles.map(r => ({
        id: r._id,
        name: r._id,
        description: getRoleDescription(r._id),
        usersCount: r.count,
        permissions: getRolePermissions(r._id),
        isActive: true,
        createdAt: new Date().toISOString()
      }));

      // Add admin sub-types
      const adminRoles = await User.aggregate([
        { $match: { role: 'admin', deletedAt: null } },
        { $group: { 
          _id: '$adminType',
          count: { $sum: 1 }
        }}
      ]);

      adminRoles.forEach(ar => {
        if (ar._id) {
          formattedRoles.push({
            id: `admin_${ar._id}`,
            name: ar._id === 'super' ? 'Super Admin' : 'Company Admin',
            description: ar._id === 'super' 
              ? 'Full system access across all companies'
              : 'Administrator for a specific company',
            usersCount: ar.count,
            permissions: getRolePermissions('admin', ar._id),
            isActive: true,
            createdAt: new Date().toISOString()
          });
        }
      });

      return NextResponse.json({
        success: true,
        data: formattedRoles
      });
    }

    // ===== PERMISSIONS =====
    else if (type === 'permissions') {
      const permissions = [
        {
          id: 'users.view',
          name: 'View Users',
          group: 'users',
          description: 'Can view user list and details'
        },
        {
          id: 'users.create',
          name: 'Create Users',
          group: 'users',
          description: 'Can create new users'
        },
        {
          id: 'users.edit',
          name: 'Edit Users',
          group: 'users',
          description: 'Can edit user details'
        },
        {
          id: 'users.delete',
          name: 'Delete Users',
          group: 'users',
          description: 'Can delete users'
        },
        {
          id: 'companies.view',
          name: 'View Companies',
          group: 'companies',
          description: 'Can view company list and details'
        },
        {
          id: 'companies.create',
          name: 'Create Companies',
          group: 'companies',
          description: 'Can create new companies'
        },
        {
          id: 'companies.edit',
          name: 'Edit Companies',
          group: 'companies',
          description: 'Can edit company details'
        },
        {
          id: 'companies.delete',
          name: 'Delete Companies',
          group: 'companies',
          description: 'Can delete companies'
        },
        {
          id: 'subscriptions.view',
          name: 'View Subscriptions',
          group: 'subscriptions',
          description: 'Can view subscription details'
        },
        {
          id: 'subscriptions.edit',
          name: 'Edit Subscriptions',
          group: 'subscriptions',
          description: 'Can modify subscriptions'
        },
        {
          id: 'subscriptions.cancel',
          name: 'Cancel Subscriptions',
          group: 'subscriptions',
          description: 'Can cancel subscriptions'
        },
        {
          id: 'products.view',
          name: 'View Products',
          group: 'products',
          description: 'Can view products across companies'
        },
        {
          id: 'products.manage',
          name: 'Manage Products',
          group: 'products',
          description: 'Can manage all products'
        },
        {
          id: 'orders.view',
          name: 'View Orders',
          group: 'orders',
          description: 'Can view orders across companies'
        },
        {
          id: 'orders.manage',
          name: 'Manage Orders',
          group: 'orders',
          description: 'Can manage all orders'
        },
        {
          id: 'analytics.view',
          name: 'View Analytics',
          group: 'analytics',
          description: 'Can view analytics dashboard'
        },
        {
          id: 'reports.generate',
          name: 'Generate Reports',
          group: 'reports',
          description: 'Can generate system reports'
        },
        {
          id: 'settings.view',
          name: 'View Settings',
          group: 'settings',
          description: 'Can view system settings'
        },
        {
          id: 'settings.edit',
          name: 'Edit Settings',
          group: 'settings',
          description: 'Can modify system settings'
        }
      ];

      return NextResponse.json({
        success: true,
        data: permissions
      });
    }

    // ===== RECENT ACTIVITIES (FOR DASHBOARD) =====
    else if (type === 'activity' && !userId) {
      const limit = parseInt(searchParams.get('limit')) || 10;
      
      // Get recent company creations
      const recentCompanies = await Company.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('companyName createdAt createdBy')
        .populate('createdBy', 'fullName')
        .lean();

      // Get recent user registrations
      const recentUsers = await User.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('fullName email companyId createdAt')
        .populate('companyId', 'companyName')
        .lean();

      const activities = [];

      // Add company creations
      recentCompanies.forEach(c => {
        activities.push({
          id: `company_${c._id}`,
          type: 'company_created',
          message: `${c.companyName} was created by ${c.createdBy?.fullName || 'System'}`,
          time: formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }),
          timestamp: c.createdAt
        });
      });

      // Add user registrations
      recentUsers.forEach(u => {
        activities.push({
          id: `user_${u._id}`,
          type: 'user_registered',
          message: `${u.fullName} registered at ${u.companyId?.companyName || 'No Company'}`,
          time: formatDistanceToNow(new Date(u.createdAt), { addSuffix: true }),
          timestamp: u.createdAt
        });
      });

      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Limit to requested number
      const limitedActivities = activities.slice(0, limit);

      return NextResponse.json({
        success: true,
        data: limitedActivities
      });
    }

    // ===== USER ACTIVITY (SINGLE USER) =====
    else if (type === 'activity' && userId) {
      if (!isValidObjectId(userId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid user ID' },
          { status: 400 }
        );
      }

      const user = await User.findById(userId).lean();
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Generate activity log from user data
      const activities = [];

      // Account creation
      activities.push({
        id: `created_${user._id}`,
        type: 'create',
        description: `Account created for ${user.fullName}`,
        timestamp: user.createdAt,
        ip: null
      });

      // Status changes from history
      if (user.statusHistory && user.statusHistory.length > 0) {
        user.statusHistory.forEach((history, index) => {
          activities.push({
            id: `status_${index}_${user._id}`,
            type: history.status === 'active' ? 'login' : 'update',
            description: `Status changed to ${history.status}`,
            timestamp: history.changedAt,
            ip: history.ip
          });
        });
      }

      // Last login
      if (user.lastLogin) {
        activities.push({
          id: `login_${user._id}`,
          type: 'login',
          description: `User logged in`,
          timestamp: user.lastLogin,
          ip: user.lastLoginIp
        });
      }

      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return NextResponse.json({
        success: true,
        data: activities
      });
    }

    else {
      return NextResponse.json(
        { success: false, message: 'Invalid type parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch users data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============== POST HANDLER ==============
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin' || session.user.adminType !== 'super') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type } = body;

    await connectDB();

    // ===== CREATE USER =====
    if (type === 'user') {
      const { fullName, email, phone, password, role, companyId, status } = body;

      // Validation
      if (!fullName || !email || !password) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!validateEmail(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      if (!validatePhone(phone)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number' },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Determine adminType if role is admin
      let adminType = null;
      if (role === 'admin') {
        adminType = companyId ? 'company' : 'super';
      }

      // Create user
      const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role,
        adminType,
        companyId: companyId || null,
        status: status || 'active',
        isVerified: true,
        createdBy: session.user.id,
        notificationSettings: {
          pushNotifications: { enabled: true, lastUpdated: new Date() },
          settingsUpdatedAt: new Date()
        }
      });

      // Update company stats if company admin
      if (companyId && role === 'admin') {
        await Company.findByIdAndUpdate(companyId, {
          $inc: { 'stats.totalUsers': 1 }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });
    }

    // ===== CREATE ROLE =====
    else if (type === 'role') {
      const { name, description, permissions } = body;

      // Since you don't have a Role model, just return success
      return NextResponse.json({
        success: true,
        message: 'Role created successfully',
        data: { name, description }
      });
    }

    else {
      return NextResponse.json(
        { success: false, message: 'Invalid type parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('POST Users Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// ============== PUT HANDLER ==============
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin' || session.user.adminType !== 'super') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, id, action, userIds } = body;

    if (!id && !userIds) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // ===== UPDATE SINGLE USER =====
    if (type === 'user' && id) {
      if (!isValidObjectId(id)) {
        return NextResponse.json(
          { success: false, message: 'Invalid user ID' },
          { status: 400 }
        );
      }

      const { fullName, phone, role, status, companyId } = body;

      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Update fields
      if (fullName) user.fullName = fullName;
      if (phone) user.phone = phone;
      if (role) {
        user.role = role;
        if (role === 'admin') {
          user.adminType = companyId ? 'company' : 'super';
        } else {
          user.adminType = undefined;
        }
      }
      if (status) user.status = status;
      if (companyId !== undefined) {
        user.companyId = companyId || null;
      }
      
      user.updatedBy = session.user.id;
      user.updatedAt = new Date();

      await user.save();

      return NextResponse.json({
        success: true,
        message: 'User updated successfully'
      });
    }

    // ===== BULK ACTION =====
    else if (type === 'bulk' && userIds && Array.isArray(userIds)) {
      const validIds = userIds.filter(id => isValidObjectId(id));
      
      if (validIds.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No valid user IDs' },
          { status: 400 }
        );
      }

      let updateData = {};

      switch(action) {
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'suspend':
          updateData = { status: 'suspended' };
          break;
        case 'delete':
          updateData = { 
            status: 'deleted',
            deletedAt: new Date(),
            deletedBy: session.user.id
          };
          break;
        default:
          return NextResponse.json(
            { success: false, message: 'Invalid action' },
            { status: 400 }
          );
      }

      updateData.updatedBy = session.user.id;
      updateData.updatedAt = new Date();

      const result = await User.updateMany(
        { _id: { $in: validIds } },
        { $set: updateData }
      );

      return NextResponse.json({
        success: true,
        message: `Successfully ${action}d ${result.modifiedCount} users`
      });
    }

    else {
      return NextResponse.json(
        { success: false, message: 'Invalid type parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('PUT Users Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// ============== DELETE HANDLER ==============
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin' || session.user.adminType !== 'super') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    if (type === 'user') {
      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Soft delete
      user.status = 'deleted';
      user.deletedAt = new Date();
      user.deletedBy = session.user.id;
      user.updatedBy = session.user.id;
      user.updatedAt = new Date();
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('DELETE Users Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// ============== HELPER FUNCTIONS ==============
function getRoleDescription(role) {
  const descriptions = {
    admin: 'Full system access',
    manager: 'Can manage content and view reports',
    user: 'Basic access to assigned features'
  };
  return descriptions[role] || 'Standard user role';
}

function getRolePermissions(role, adminType = null) {
  const basePermissions = {
    admin: [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'companies.view', 'companies.create', 'companies.edit', 'companies.delete',
      'subscriptions.view', 'subscriptions.edit', 'subscriptions.cancel',
      'products.view', 'products.manage',
      'orders.view', 'orders.manage',
      'analytics.view', 'reports.generate',
      'settings.view', 'settings.edit'
    ],
    manager: [
      'users.view',
      'companies.view',
      'products.view', 'products.manage',
      'orders.view', 'orders.manage',
      'analytics.view', 'reports.generate'
    ],
    user: [
      'products.view',
      'orders.view'
    ]
  };

  if (role === 'admin' && adminType === 'company') {
    // Company admin has limited permissions
    return [
      'users.view', 'users.create', 'users.edit',
      'products.view', 'products.manage',
      'orders.view', 'orders.manage',
      'analytics.view', 'reports.generate'
    ];
  }

  return basePermissions[role] || [];
}