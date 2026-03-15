// app/api/super-admin/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db';
import Company from '@/models/Company';
import User from '@/models/user';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Bookingmng from '@/models/Bookingmng';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Check super admin role
    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
    if (!isSuperAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Super admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    await connectDB();

    // Get date ranges for growth calculations
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastYear = new Date(now);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch all stats in parallel with error handling
    const [
      companiesStats,
      companiesLastMonthCount,
      companiesGrowth,
      usersStats,
      usersLastMonthCount,
      usersGrowth,
      revenueStats,
      revenueLastMonth,
      revenueGrowth,
      productsStats,
      ordersStats,
      ordersLastMonthCount,
      ordersGrowth,
      bookingsStats,
      planDistribution
    ] = await Promise.allSettled([
      // Companies stats
      Company.aggregate([
        { $match: { deletedAt: null } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } }
        }}
      ]),
      
      // Companies last month count
      Company.countDocuments({ 
        createdAt: { $lte: lastMonth },
        deletedAt: null 
      }),
      
      // Companies growth calculation
      Company.aggregate([
        { $match: { 
          createdAt: { $gte: lastMonth },
          deletedAt: null 
        }},
        { $group: {
          _id: null,
          count: { $sum: 1 }
        }}
      ]),
      
      // Users stats
      User.aggregate([
        { $match: { deletedAt: null } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
        }}
      ]),
      
      // Users last month count
      User.countDocuments({ 
        createdAt: { $lte: lastMonth },
        deletedAt: null 
      }),
      
      // Users growth calculation
      User.aggregate([
        { $match: { 
          createdAt: { $gte: lastMonth },
          deletedAt: null 
        }},
        { $group: {
          _id: null,
          count: { $sum: 1 }
        }}
      ]),
      
      // Revenue stats
      Order.aggregate([
        { $match: { 
          status: 'completed', 
          deletedAt: null 
        }},
        { $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' }
        }}
      ]),
      
      // Revenue last month
      Order.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $lte: lastMonth },
          deletedAt: null 
        }},
        { $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }}
      ]),
      
      // Revenue growth
      Order.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: lastMonth },
          deletedAt: null 
        }},
        { $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }}
      ]),
      
      // Products stats
      Product.aggregate([
        { $match: { deletedAt: null } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }
        }}
      ]),
      
      // Orders stats
      Order.aggregate([
        { $match: { deletedAt: null } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }}
      ]),
      
      // Orders last month count
      Order.countDocuments({ 
        createdAt: { $lte: lastMonth },
        deletedAt: null 
      }),
      
      // Orders growth
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: lastMonth },
          deletedAt: null 
        }},
        { $group: {
          _id: null,
          count: { $sum: 1 }
        }}
      ]),
      
      // Bookings stats
      Bookingmng.aggregate([
        { $match: { deletedAt: null } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          upcoming: { $sum: { $cond: [{ $gt: ['$bookingDate', new Date()] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }}
      ]),
      
      // Plan distribution
      Company.aggregate([
        { $match: { deletedAt: null } },
        { $group: { 
          _id: '$subscription.plan', 
          count: { $sum: 1 } 
        }},
        { $sort: { count: -1 } }
      ])
    ]);

    // Extract values with fallbacks
    const companyData = companiesStats.status === 'fulfilled' ? companiesStats.value[0] || {} : {};
    const userData = usersStats.status === 'fulfilled' ? usersStats.value[0] || {} : {};
    const revenueData = revenueStats.status === 'fulfilled' ? revenueStats.value[0] || {} : {};
    const productData = productsStats.status === 'fulfilled' ? productsStats.value[0] || {} : {};
    const orderData = ordersStats.status === 'fulfilled' ? ordersStats.value[0] || {} : {};
    const bookingData = bookingsStats.status === 'fulfilled' ? bookingsStats.value[0] || {} : {};

    // Calculate growth percentages
    const companiesLastMonthCountValue = companiesLastMonthCount.status === 'fulfilled' ? companiesLastMonthCount.value || 0 : 0;
    const companiesGrowthValue = companiesGrowth.status === 'fulfilled' && companiesGrowth.value[0] ? companiesGrowth.value[0].count || 0 : 0;
    const companiesGrowthPercent = companiesLastMonthCountValue > 0 
      ? ((companiesGrowthValue / companiesLastMonthCountValue) * 100).toFixed(1)
      : 0;

    const usersLastMonthCountValue = usersLastMonthCount.status === 'fulfilled' ? usersLastMonthCount.value || 0 : 0;
    const usersGrowthValue = usersGrowth.status === 'fulfilled' && usersGrowth.value[0] ? usersGrowth.value[0].count || 0 : 0;
    const usersGrowthPercent = usersLastMonthCountValue > 0 
      ? ((usersGrowthValue / usersLastMonthCountValue) * 100).toFixed(1)
      : 0;

    const revenueLastMonthValue = revenueLastMonth.status === 'fulfilled' && revenueLastMonth.value[0] ? revenueLastMonth.value[0].total || 0 : 0;
    const revenueGrowthValue = revenueGrowth.status === 'fulfilled' && revenueGrowth.value[0] ? revenueGrowth.value[0].total || 0 : 0;
    const revenueGrowthPercent = revenueLastMonthValue > 0 
      ? ((revenueGrowthValue / revenueLastMonthValue) * 100).toFixed(1)
      : 0;

    const ordersLastMonthCountValue = ordersLastMonthCount.status === 'fulfilled' ? ordersLastMonthCount.value || 0 : 0;
    const ordersGrowthValue = ordersGrowth.status === 'fulfilled' && ordersGrowth.value[0] ? ordersGrowth.value[0].count || 0 : 0;
    const ordersGrowthPercent = ordersLastMonthCountValue > 0 
      ? ((ordersGrowthValue / ordersLastMonthCountValue) * 100).toFixed(1)
      : 0;

    // Monthly revenue
    const monthlyRevenue = revenueData.total || 0;

    // Construct response
    const response = {
      success: true,
      data: {
        companies: {
          total: companyData.total || 0,
          active: companyData.active || 0,
          pending: companyData.pending || 0,
          suspended: companyData.suspended || 0,
          growth: parseFloat(companiesGrowthPercent) || 0
        },
        users: {
          total: userData.total || 0,
          active: userData.active || 0,
          inactive: userData.inactive || 0,
          growth: parseFloat(usersGrowthPercent) || 0
        },
        revenue: {
          total: revenueData.total || 0,
          monthly: monthlyRevenue,
          growth: parseFloat(revenueGrowthPercent) || 0,
          averageOrderValue: Math.round(revenueData.avgOrderValue || 0)
        },
        products: {
          total: productData.total || 0,
          active: productData.active || 0,
          outOfStock: productData.outOfStock || 0
        },
        orders: {
          total: orderData.total || 0,
          pending: orderData.pending || 0,
          completed: orderData.completed || 0,
          cancelled: orderData.cancelled || 0,
          growth: parseFloat(ordersGrowthPercent) || 0
        },
        bookings: {
          total: bookingData.total || 0,
          upcoming: bookingData.upcoming || 0,
          completed: bookingData.completed || 0,
          cancelled: bookingData.cancelled || 0
        },
        planDistribution: planDistribution.status === 'fulfilled' ? planDistribution.value : []
      },
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );
  }
}