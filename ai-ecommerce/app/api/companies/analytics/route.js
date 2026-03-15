// app/api/companies/analytics/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db';
import Company from '@/models/Company';
import User from '@/models/user';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
    const type = searchParams.get('type');
    const range = searchParams.get('range') || 'month';

    await connectDB();

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let dateFormat = '%Y-%m-%d';
    let groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

    switch(range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        groupFormat = { $dateToString: { format: '%H:00', date: '$createdAt' } };
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Handle different analytics types
    switch(type) {
      case 'dashboard':
        return await getDashboardStats(startDate, range);
      case 'revenue':
        return await getRevenueAnalytics(startDate, range, groupFormat);
      case 'companies':
        return await getCompaniesAnalytics(startDate, range, groupFormat);
      case 'users':
        return await getUsersAnalytics(startDate, range, groupFormat);
      case 'products':
        return await getProductsAnalytics();
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid analytics type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============== DASHBOARD STATS ==============
async function getDashboardStats(startDate, range) {
  try {
    // Get main stats
    const [
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      suspendedCompanies,
      totalUsers,
      activeUsers,
      totalProducts,
      totalOrders,
      totalBookings
    ] = await Promise.all([
      Company.countDocuments({ deletedAt: null }),
      Company.countDocuments({ status: 'active', deletedAt: null }),
      Company.countDocuments({ status: 'pending', deletedAt: null }),
      Company.countDocuments({ status: 'suspended', deletedAt: null }),
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ status: 'active', deletedAt: null }),
      // Product count from company stats
      Company.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$stats.totalProducts' } } }
      ]),
      // Order count from company stats
      Company.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$stats.totalOrders' } } }
      ]),
      // Booking count from company stats
      Company.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$stats.totalBookings' } } }
      ])
    ]);

    // Get revenue
    const revenueResult = await Company.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$stats.totalRevenue' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get growth rates (compared to previous period)
    const previousPeriod = new Date(startDate);
    if (range === 'month') {
      previousPeriod.setMonth(previousPeriod.getMonth() - 1);
    } else if (range === 'quarter') {
      previousPeriod.setMonth(previousPeriod.getMonth() - 3);
    } else if (range === 'year') {
      previousPeriod.setFullYear(previousPeriod.getFullYear() - 1);
    }

    const [currentCompanies, previousCompanies] = await Promise.all([
      Company.countDocuments({ createdAt: { $gte: startDate }, deletedAt: null }),
      Company.countDocuments({ 
        createdAt: { $gte: previousPeriod, $lt: startDate }, 
        deletedAt: null 
      })
    ]);
    
    const companyGrowth = previousCompanies > 0 
      ? ((currentCompanies - previousCompanies) / previousCompanies) * 100 
      : 0;

    const [currentUsers, previousUsers] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate }, deletedAt: null }),
      User.countDocuments({ 
        createdAt: { $gte: previousPeriod, $lt: startDate }, 
        deletedAt: null 
      })
    ]);
    
    const userGrowth = previousUsers > 0 
      ? ((currentUsers - previousUsers) / previousUsers) * 100 
      : 0;

    // Calculate other metrics
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;
    
    // Churn rate (companies that became inactive)
    const churnedCompanies = await Company.countDocuments({
      status: 'inactive',
      updatedAt: { $gte: startDate },
      deletedAt: null
    });
    const churnRate = totalCompanies > 0 ? (churnedCompanies / totalCompanies) * 100 : 0;

    // Active subscriptions
    const activeSubscriptions = await Company.countDocuments({
      'subscription.status': 'active',
      deletedAt: null
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalCompanies,
        activeCompanies,
        pendingCompanies,
        suspendedCompanies,
        totalUsers: totalUsers[0]?.total || 0,
        activeUsers,
        totalProducts: totalProducts[0]?.total || 0,
        totalOrders: totalOrders[0]?.total || 0,
        totalBookings: totalBookings[0]?.total || 0,
        growthRate: parseFloat(companyGrowth.toFixed(1)),
        userGrowth: parseFloat(userGrowth.toFixed(1)),
        companyGrowth: parseFloat(companyGrowth.toFixed(1)),
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        avgOrderValue: Math.round(avgOrderValue),
        churnRate: parseFloat(churnRate.toFixed(1)),
        activeSubscriptions
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

// ============== REVENUE ANALYTICS ==============
async function getRevenueAnalytics(startDate, range, groupFormat) {
  try {
    // Get companies with revenue
    const companies = await Company.find({
      createdAt: { $gte: startDate },
      deletedAt: null,
      'stats.totalRevenue': { $gt: 0 }
    })
      .select('companyName stats.totalRevenue createdAt subscription.plan')
      .lean();

    // Group by date
    const revenueByDate = {};
    const planRevenue = {};
    const paymentMethodRevenue = {};

    companies.forEach(c => {
      let dateKey;
      if (range === 'today') {
        const hour = new Date(c.createdAt).getHours();
        dateKey = `${hour.toString().padStart(2, '0')}:00`;
      } else if (range === 'year') {
        const month = new Date(c.createdAt).toLocaleString('default', { month: 'short' });
        dateKey = month;
      } else {
        dateKey = new Date(c.createdAt).toISOString().split('T')[0];
      }

      // Revenue by date
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = { revenue: 0, orders: 0 };
      }
      revenueByDate[dateKey].revenue += c.stats?.totalRevenue || 0;
      revenueByDate[dateKey].orders += 1;

      // Revenue by plan
      const plan = c.subscription?.plan || 'free';
      if (!planRevenue[plan]) {
        planRevenue[plan] = { revenue: 0, count: 0 };
      }
      planRevenue[plan].revenue += c.stats?.totalRevenue || 0;
      planRevenue[plan].count += 1;

      // Revenue by payment method (random for demo)
      const methods = ['razorpay', 'stripe', 'bank_transfer', 'cash'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      if (!paymentMethodRevenue[method]) {
        paymentMethodRevenue[method] = 0;
      }
      paymentMethodRevenue[method] += c.stats?.totalRevenue || 0;
    });

    // Format daily/monthly data
    const formattedTrend = Object.entries(revenueByDate).map(([key, value]) => ({
      [range === 'today' ? 'date' : 'month']: key,
      revenue: value.revenue,
      orders: value.orders,
      avgOrder: Math.round(value.revenue / value.orders)
    })).sort((a, b) => {
      const aKey = a.date || a.month;
      const bKey = b.date || b.month;
      return aKey.localeCompare(bKey);
    });

    // Format plan data
    const formattedByPlan = Object.entries(planRevenue).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      revenue: data.revenue,
      count: data.count
    }));

    // Format payment method data
    const formattedByPaymentMethod = Object.entries(paymentMethodRevenue).map(([name, value]) => ({
      name,
      value
    }));

    return NextResponse.json({
      success: true,
      data: {
        daily: range === 'today' ? formattedTrend : [],
        monthly: range !== 'today' ? formattedTrend : [],
        byPlan: formattedByPlan,
        byPaymentMethod: formattedByPaymentMethod,
        byCompany: companies.slice(0, 10).map(c => ({
          name: c.companyName,
          revenue: c.stats?.totalRevenue || 0
        }))
      }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}

// ============== COMPANIES ANALYTICS ==============
async function getCompaniesAnalytics(startDate, range, groupFormat) {
  try {
    // Company growth over time
    const companyGrowth = await Company.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: groupFormat,
          new: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Companies by status
    const byStatus = await Company.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      }
    ]);

    // Companies by plan
    const byPlan = await Company.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$subscription.plan',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Top performing companies
    const topPerformers = await Company.find({ 
      status: 'active',
      deletedAt: null,
      'stats.totalRevenue': { $gt: 0 }
    })
      .sort({ 'stats.totalRevenue': -1 })
      .limit(5)
      .select('companyName stats.totalRevenue stats.totalUsers subscription.plan')
      .lean();

    // Format growth data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthData = [];

    if (range === 'year') {
      // For year, show monthly data
      months.forEach(month => {
        const found = companyGrowth.find(g => {
          const monthNum = parseInt(g._id.split('-')[1]) - 1;
          return months[monthNum] === month;
        });
        growthData.push({
          month,
          new: found?.new || 0,
          churned: 0,
          net: found?.new || 0
        });
      });
    } else {
      // For other ranges, use actual data
      companyGrowth.forEach(g => {
        let month;
        if (range === 'today') {
          month = g._id;
        } else if (range === 'week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayIndex = new Date(g._id).getDay();
          month = days[dayIndex];
        } else {
          const monthNum = parseInt(g._id.split('-')[1]) - 1;
          month = months[monthNum];
        }
        growthData.push({
          month,
          new: g.new,
          churned: 0,
          net: g.new
        });
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        growth: growthData,
        byStatus: byStatus.map(s => ({
          name: s._id,
          value: s.value
        })),
        byPlan: byPlan.map(p => ({
          name: p._id || 'free',
          value: p.value
        })),
        topPerformers: topPerformers.map((c, index) => ({
          id: c._id.toString(),
          name: c.companyName,
          revenue: c.stats?.totalRevenue || 0,
          users: c.stats?.totalUsers || 0,
          growth: Math.floor(Math.random() * 30) + 10 // Random for demo
        })),
        churned: []
      }
    });

  } catch (error) {
    console.error('Companies analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch companies analytics' },
      { status: 500 }
    );
  }
}

// ============== USERS ANALYTICS ==============
async function getUsersAnalytics(startDate, range, groupFormat) {
  try {
    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: groupFormat,
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Users by status
    const byStatus = await User.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      }
    ]);

    // Users by role
    const byRole = await User.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$role',
          value: { $sum: 1 }
        }
      }
    ]);

    // Users by company
    const byCompany = await User.aggregate([
      { $match: { deletedAt: null, companyId: { $ne: null } } },
      {
        $group: {
          _id: '$companyId',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 10 }
    ]);

    // Get company names
    const companyIds = byCompany.map(c => c._id);
    const companies = await Company.find({ _id: { $in: companyIds } })
      .select('companyName')
      .lean();
    
    const companyMap = companies.reduce((acc, c) => {
      acc[c._id.toString()] = c.companyName;
      return acc;
    }, {});

    // Format growth data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthData = [];

    if (range === 'year') {
      months.forEach(month => {
        const found = userGrowth.find(g => {
          const monthNum = parseInt(g._id.split('-')[1]) - 1;
          return months[monthNum] === month;
        });
        growthData.push({
          month,
          users: found?.users || 0
        });
      });
    } else {
      userGrowth.forEach(g => {
        let month;
        if (range === 'today') {
          month = g._id;
        } else if (range === 'week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayIndex = new Date(g._id).getDay();
          month = days[dayIndex];
        } else {
          const monthNum = parseInt(g._id.split('-')[1]) - 1;
          month = months[monthNum];
        }
        growthData.push({
          month,
          users: g.users
        });
      });
    }

    // Active vs Inactive
    const activeUsers = await User.countDocuments({ status: 'active', deletedAt: null });
    const inactiveUsers = await User.countDocuments({ 
      status: { $in: ['inactive', 'suspended', 'deleted'] }, 
      deletedAt: null 
    });

    return NextResponse.json({
      success: true,
      data: {
        growth: growthData,
        byStatus: byStatus.map(s => ({
          name: s._id,
          value: s.value
        })),
        byRole: byRole.map(r => ({
          name: r._id,
          value: r.value
        })),
        byCompany: byCompany.map(c => ({
          name: companyMap[c._id?.toString()] || 'Unknown',
          value: c.value
        })),
        activeVsInactive: {
          active: activeUsers,
          inactive: inactiveUsers
        }
      }
    });

  } catch (error) {
    console.error('Users analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users analytics' },
      { status: 500 }
    );
  }
}

// ============== PRODUCTS ANALYTICS ==============
async function getProductsAnalytics() {
  try {
    // Get all companies with product stats
    const companies = await Company.find({
      deletedAt: null,
      'stats.totalProducts': { $gt: 0 }
    })
      .select('companyName stats.totalProducts stats.totalRevenue')
      .limit(50)
      .lean();

    // Generate top selling products (simulated)
    const categories = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Toys'];
    const topSelling = companies.slice(0, 10).map((c, index) => ({
      id: `prod_${index}`,
      name: `${c.companyName} ${['Premium', 'Essential', 'Deluxe'][index % 3]} Product`,
      category: categories[index % categories.length],
      sold: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 100000) + 5000,
      stock: Math.floor(Math.random() * 200) + 10
    }));

    // Products by category
    const byCategory = categories.map(cat => ({
      name: cat,
      value: Math.floor(Math.random() * 50) + 10
    }));

    // Inventory status
    const totalProducts = companies.reduce((sum, c) => sum + (c.stats?.totalProducts || 0), 0);
    const inStock = Math.floor(totalProducts * 0.7);
    const lowStock = Math.floor(totalProducts * 0.2);
    const outOfStock = totalProducts - inStock - lowStock;

    // Stock alerts
    const stockAlerts = topSelling.slice(0, 5).map(p => ({
      name: p.name,
      category: p.category,
      stock: p.stock
    }));

    return NextResponse.json({
      success: true,
      data: {
        topSelling,
        byCategory,
        inventory: {
          inStock,
          lowStock,
          outOfStock
        },
        stockAlerts
      }
    });

  } catch (error) {
    console.error('Products analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products analytics' },
      { status: 500 }
    );
  }
}