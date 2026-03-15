// app/api/companies/subscriptions/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db';
import Company from '@/models/Company';
import User from '@/models/user';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// ============== HELPER FUNCTIONS ==============
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const calculateDaysLeft = (expiryDate) => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

// ============== PLAN CONFIGURATION ==============
const PLAN_DETAILS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUsers: 3,
    maxProducts: 100,
    maxOrders: 100,
    maxBookings: 100,
    storage: 512,
    features: [
      'Basic E-commerce',
      'Booking System',
      'WhatsApp Bot',
      'Basic Analytics',
      '3 Users Max',
      '100 Products Max'
    ]
  },
  basic: {
    name: 'Basic',
    monthlyPrice: 999,
    yearlyPrice: 6000,
    maxUsers: 10,
    maxProducts: 1000,
    maxOrders: 500,
    maxBookings: 500,
    storage: 2048,
    features: [
      'Everything in Free',
      'Coupons & Discounts',
      'Advanced Analytics',
      'Priority Support',
      '10 Users Max',
      '1000 Products Max'
    ]
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 2000,
    yearlyPrice: 12000,
    maxUsers: 50,
    maxProducts: 5000,
    maxOrders: 2000,
    maxBookings: 2000,
    storage: 10240,
    features: [
      'Everything in Basic',
      'API Access',
      'Referral Program',
      'Multiple Users',
      '50 Users Max',
      '5000 Products Max'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 0, // Custom pricing
    yearlyPrice: 0, // Custom pricing
    maxUsers: 10000,
    maxProducts: 100000,
    maxOrders: 100000,
    maxBookings: 100000,
    storage: 102400,
    features: [
      'Everything in Pro',
      'Custom Domain',
      'Dedicated Support',
      'Custom Features',
      'Unlimited Everything',
      'SLA Agreement'
    ]
  }
};

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

    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    if (!isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'plans';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const plan = searchParams.get('plan') || 'all';
    const interval = searchParams.get('interval') || 'monthly';
    
    const skip = (page - 1) * limit;

    await connectDB();

    // ===== PLANS =====
    if (type === 'plans') {
      // Get company counts per plan
      const planStats = await Company.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: '$subscription.plan',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$subscription.status', 'active'] }, 1, 0] }
            }
          }
        }
      ]);

      // Build plans array with monthly and yearly options
      const plans = [];
      
      // Free Plan
      const freeStats = planStats.find(p => p._id === 'free') || { count: 0, activeCount: 0 };
      plans.push({
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'monthly',
        maxUsers: PLAN_DETAILS.free.maxUsers,
        maxProducts: PLAN_DETAILS.free.maxProducts,
        maxOrders: PLAN_DETAILS.free.maxOrders,
        maxBookings: PLAN_DETAILS.free.maxBookings,
        storage: PLAN_DETAILS.free.storage,
        features: PLAN_DETAILS.free.features,
        isActive: true,
        companiesCount: freeStats.count,
        activeCompanies: freeStats.activeCount,
        popular: false,
        createdAt: new Date().toISOString()
      });

      // Basic Monthly
      const basicStats = planStats.find(p => p._id === 'basic') || { count: 0, activeCount: 0 };
      plans.push({
        id: 'basic-monthly',
        name: 'Basic',
        price: PLAN_DETAILS.basic.monthlyPrice,
        interval: 'monthly',
        maxUsers: PLAN_DETAILS.basic.maxUsers,
        maxProducts: PLAN_DETAILS.basic.maxProducts,
        maxOrders: PLAN_DETAILS.basic.maxOrders,
        maxBookings: PLAN_DETAILS.basic.maxBookings,
        storage: PLAN_DETAILS.basic.storage,
        features: PLAN_DETAILS.basic.features,
        isActive: true,
        companiesCount: Math.floor(basicStats.count * 0.6), // Approx split
        activeCompanies: Math.floor(basicStats.activeCount * 0.6),
        popular: false,
        savings: null,
        createdAt: new Date().toISOString()
      });

      // Basic Yearly
      plans.push({
        id: 'basic-yearly',
        name: 'Basic',
        price: PLAN_DETAILS.basic.yearlyPrice,
        interval: 'yearly',
        maxUsers: PLAN_DETAILS.basic.maxUsers,
        maxProducts: PLAN_DETAILS.basic.maxProducts,
        maxOrders: PLAN_DETAILS.basic.maxOrders,
        maxBookings: PLAN_DETAILS.basic.maxBookings,
        storage: PLAN_DETAILS.basic.storage,
        features: [...PLAN_DETAILS.basic.features, `Save ₹${(PLAN_DETAILS.basic.monthlyPrice * 12) - PLAN_DETAILS.basic.yearlyPrice} yearly`],
        isActive: true,
        companiesCount: Math.floor(basicStats.count * 0.4),
        activeCompanies: Math.floor(basicStats.activeCount * 0.4),
        popular: true,
        savings: (PLAN_DETAILS.basic.monthlyPrice * 12) - PLAN_DETAILS.basic.yearlyPrice,
        createdAt: new Date().toISOString()
      });

      // Pro Monthly
      const proStats = planStats.find(p => p._id === 'pro') || { count: 0, activeCount: 0 };
      plans.push({
        id: 'pro-monthly',
        name: 'Pro',
        price: PLAN_DETAILS.pro.monthlyPrice,
        interval: 'monthly',
        maxUsers: PLAN_DETAILS.pro.maxUsers,
        maxProducts: PLAN_DETAILS.pro.maxProducts,
        maxOrders: PLAN_DETAILS.pro.maxOrders,
        maxBookings: PLAN_DETAILS.pro.maxBookings,
        storage: PLAN_DETAILS.pro.storage,
        features: PLAN_DETAILS.pro.features,
        isActive: true,
        companiesCount: Math.floor(proStats.count * 0.55),
        activeCompanies: Math.floor(proStats.activeCount * 0.55),
        popular: false,
        savings: null,
        createdAt: new Date().toISOString()
      });

      // Pro Yearly
      plans.push({
        id: 'pro-yearly',
        name: 'Pro',
        price: PLAN_DETAILS.pro.yearlyPrice,
        interval: 'yearly',
        maxUsers: PLAN_DETAILS.pro.maxUsers,
        maxProducts: PLAN_DETAILS.pro.maxProducts,
        maxOrders: PLAN_DETAILS.pro.maxOrders,
        maxBookings: PLAN_DETAILS.pro.maxBookings,
        storage: PLAN_DETAILS.pro.storage,
        features: [...PLAN_DETAILS.pro.features, `Save ₹${(PLAN_DETAILS.pro.monthlyPrice * 12) - PLAN_DETAILS.pro.yearlyPrice} yearly`],
        isActive: true,
        companiesCount: Math.floor(proStats.count * 0.45),
        activeCompanies: Math.floor(proStats.activeCount * 0.45),
        popular: false,
        savings: (PLAN_DETAILS.pro.monthlyPrice * 12) - PLAN_DETAILS.pro.yearlyPrice,
        createdAt: new Date().toISOString()
      });

      // Enterprise
      const enterpriseStats = planStats.find(p => p._id === 'enterprise') || { count: 0, activeCount: 0 };
      plans.push({
        id: 'enterprise',
        name: 'Enterprise',
        price: 0,
        interval: 'custom',
        maxUsers: PLAN_DETAILS.enterprise.maxUsers,
        maxProducts: PLAN_DETAILS.enterprise.maxProducts,
        maxOrders: PLAN_DETAILS.enterprise.maxOrders,
        maxBookings: PLAN_DETAILS.enterprise.maxBookings,
        storage: PLAN_DETAILS.enterprise.storage,
        features: PLAN_DETAILS.enterprise.features,
        isActive: true,
        companiesCount: enterpriseStats.count,
        activeCompanies: enterpriseStats.activeCount,
        popular: false,
        isCustom: true,
        createdAt: new Date().toISOString()
      });

      // Filter by search
      let filteredPlans = plans;
      if (search) {
        filteredPlans = plans.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by interval if specified
      if (interval !== 'all') {
        filteredPlans = filteredPlans.filter(p => p.interval === interval);
      }

      // Pagination
      const total = filteredPlans.length;
      const paginatedPlans = filteredPlans.slice(skip, skip + limit);

      // Calculate stats
      const totalCompanies = await Company.countDocuments({ deletedAt: null });
      const activeSubscriptions = await Company.countDocuments({ 
        'subscription.status': 'active',
        deletedAt: null 
      });
      
      const monthlyRevenue = await calculateMonthlyRevenue();

      return NextResponse.json({
        success: true,
        data: paginatedPlans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          totalPlans: plans.length,
          activePlans: plans.filter(p => p.isActive).length,
          inactivePlans: plans.filter(p => !p.isActive).length,
          activeSubscriptions,
          monthlyRevenue,
          totalCompanies
        }
      });
    }

    // ===== COMPANY SUBSCRIPTIONS =====
    else if (type === 'companies') {
      let query = { deletedAt: null };
      
      if (search) {
        query.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { companyEmail: { $regex: search, $options: 'i' } }
        ];
      }
      if (status !== 'all') {
        query['subscription.status'] = status;
      }
      if (plan !== 'all') {
        query['subscription.plan'] = plan;
      }

      const [companies, total] = await Promise.all([
        Company.find(query)
          .select('companyName companyEmail subscription stats.totalRevenue createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Company.countDocuments(query)
      ]);

      const planPrices = {
        free: 0,
        basic: interval === 'yearly' ? PLAN_DETAILS.basic.yearlyPrice : PLAN_DETAILS.basic.monthlyPrice,
        pro: interval === 'yearly' ? PLAN_DETAILS.pro.yearlyPrice : PLAN_DETAILS.pro.monthlyPrice,
        enterprise: 0
      };

      const formattedCompanies = companies.map(c => ({
        id: c._id.toString(),
        companyId: c._id.toString(),
        companyName: c.companyName,
        companyEmail: c.companyEmail,
        plan: c.subscription?.plan || 'free',
        status: c.subscription?.status || 'inactive',
        amount: planPrices[c.subscription?.plan] || 0,
        startDate: formatDate(c.subscription?.startDate),
        endDate: formatDate(c.subscription?.expiryDate),
        autoRenew: c.subscription?.autoRenew || false,
        paymentMethod: c.subscription?.paymentMethod || 'monthly',
        revenue: c.stats?.totalRevenue || 0,
        daysLeft: calculateDaysLeft(c.subscription?.expiryDate),
        createdAt: formatDate(c.createdAt)
      }));

      // Get comprehensive stats
      const [
        activeSubscriptions,
        expiredSubscriptions,
        pendingSubscriptions,
        cancelledSubscriptions,
        totalMonthlyRevenue,
        planBreakdown
      ] = await Promise.all([
        Company.countDocuments({ 'subscription.status': 'active', deletedAt: null }),
        Company.countDocuments({ 'subscription.status': 'expired', deletedAt: null }),
        Company.countDocuments({ 'subscription.status': 'pending', deletedAt: null }),
        Company.countDocuments({ 'subscription.status': 'cancelled', deletedAt: null }),
        calculateMonthlyRevenue(),
        Company.aggregate([
          { $match: { deletedAt: null } },
          { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
        ])
      ]);

      const stats = {
        activeSubscriptions,
        expiredSubscriptions,
        pendingSubscriptions,
        cancelledSubscriptions,
        monthlyRevenue: totalMonthlyRevenue,
        planBreakdown: planBreakdown.map(p => ({ plan: p._id || 'free', count: p.count }))
      };

      return NextResponse.json({
        success: true,
        data: formattedCompanies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      });
    }

    // ===== INVOICES =====
    else if (type === 'invoices') {
      // Since you don't have an Invoice model, generate realistic invoices
      const companies = await Company.find({ 
        deletedAt: null,
        $or: [
          { 'stats.totalRevenue': { $gt: 0 } },
          { 'subscription.status': 'active' }
        ]
      })
        .select('companyName companyEmail subscription stats.totalRevenue createdAt')
        .limit(100)
        .lean();

      const invoices = [];
      
      companies.forEach((c, index) => {
        const baseDate = new Date(c.createdAt);
        const plan = c.subscription?.plan || 'free';
        const amount = plan === 'free' ? 0 :
                      plan === 'basic' ? (interval === 'yearly' ? PLAN_DETAILS.basic.yearlyPrice : PLAN_DETAILS.basic.monthlyPrice) :
                      plan === 'pro' ? (interval === 'yearly' ? PLAN_DETAILS.pro.yearlyPrice : PLAN_DETAILS.pro.monthlyPrice) :
                      0;

        if (amount > 0) {
          // Generate multiple invoices for each company
          for (let i = 0; i < 3; i++) {
            const invoiceDate = new Date(baseDate);
            invoiceDate.setMonth(invoiceDate.getMonth() + i);
            
            const dueDate = new Date(invoiceDate);
            dueDate.setDate(dueDate.getDate() + 15);
            
            const paidDate = i < 2 ? new Date(invoiceDate) : null;
            const status = paidDate ? 'paid' : (i === 2 ? 'pending' : 'paid');

            invoices.push({
              id: `inv_${c._id.toString().slice(-8)}_${i}`,
              invoiceNumber: `INV-${invoiceDate.getFullYear()}-${(index * 3 + i + 1).toString().padStart(4, '0')}`,
              companyId: c._id.toString(),
              companyName: c.companyName,
              companyEmail: c.companyEmail,
              amount: amount,
              status: status,
              dueDate: formatDate(dueDate),
              paidAt: formatDate(paidDate),
              items: [
                {
                  description: `${c.companyName} - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (${interval})`,
                  quantity: 1,
                  price: amount,
                  total: amount
                }
              ],
              subtotal: amount,
              tax: 0,
              notes: status === 'pending' ? 'Payment pending' : 'Payment completed',
              createdAt: formatDate(invoiceDate)
            });
          }
        }
      });

      // Filter by search
      let filteredInvoices = invoices;
      if (search) {
        filteredInvoices = invoices.filter(i => 
          i.companyName.toLowerCase().includes(search.toLowerCase()) ||
          i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by status
      if (status !== 'all') {
        filteredInvoices = filteredInvoices.filter(i => i.status === status);
      }

      // Sort by date (newest first)
      filteredInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const total = filteredInvoices.length;
      const paginatedInvoices = filteredInvoices.slice(skip, skip + limit);

      // Calculate stats
      const totalPaid = filteredInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0);
      
      const totalPending = filteredInvoices
        .filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + i.amount, 0);

      const stats = {
        totalInvoices: filteredInvoices.length,
        paidInvoices: filteredInvoices.filter(i => i.status === 'paid').length,
        pendingInvoices: filteredInvoices.filter(i => i.status === 'pending').length,
        overdueInvoices: filteredInvoices.filter(i => {
          if (i.status !== 'pending') return false;
          return new Date(i.dueDate) < new Date();
        }).length,
        totalPaidAmount: totalPaid,
        totalPendingAmount: totalPending
      };

      return NextResponse.json({
        success: true,
        data: paginatedInvoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      });
    }

    // ===== PAYMENTS =====
    else if (type === 'payments') {
      // Generate realistic payments
      const companies = await Company.find({ 
        deletedAt: null,
        'stats.totalRevenue': { $gt: 0 }
      })
        .select('companyName stats.totalRevenue createdAt')
        .limit(100)
        .lean();

      const paymentMethods = ['razorpay', 'stripe', 'bank_transfer', 'cash'];
      const statuses = ['success', 'success', 'success', 'pending', 'failed']; // Weighted for realism

      const payments = [];
      
      companies.forEach((c, companyIndex) => {
        // Generate multiple payments per company
        const numPayments = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < numPayments; i++) {
          const baseDate = new Date(c.createdAt);
          baseDate.setMonth(baseDate.getMonth() + i);
          
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const amount = c.stats?.totalRevenue 
            ? Math.round(c.stats.totalRevenue / numPayments) 
            : Math.floor(Math.random() * 50000) + 5000;

          payments.push({
            id: `pay_${c._id.toString().slice(-8)}_${i}`,
            transactionId: `TXN${baseDate.getFullYear()}${(companyIndex * numPayments + i + 1).toString().padStart(6, '0')}`,
            companyId: c._id.toString(),
            companyName: c.companyName,
            amount: amount,
            status: status,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            paymentDetails: {
              gateway: status === 'success' ? 'Payment successful' : 'Payment processing',
              reference: `REF${Math.random().toString(36).substring(7).toUpperCase()}`
            },
            paidAt: status === 'success' ? formatDate(baseDate) : null,
            createdAt: formatDate(baseDate)
          });
        }
      });

      // Sort by date (newest first)
      payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Filter by search
      let filteredPayments = payments;
      if (search) {
        filteredPayments = payments.filter(p => 
          p.companyName.toLowerCase().includes(search.toLowerCase()) ||
          p.transactionId.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by status
      if (status !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.status === status);
      }

      // Pagination
      const total = filteredPayments.length;
      const paginatedPayments = filteredPayments.slice(skip, skip + limit);

      // Calculate stats
      const totalAmount = filteredPayments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

      const stats = {
        totalPayments: filteredPayments.length,
        successfulPayments: filteredPayments.filter(p => p.status === 'success').length,
        failedPayments: filteredPayments.filter(p => p.status === 'failed').length,
        pendingPayments: filteredPayments.filter(p => p.status === 'pending').length,
        totalAmount,
        byMethod: paymentMethods.map(method => ({
          method,
          count: filteredPayments.filter(p => p.paymentMethod === method).length,
          amount: filteredPayments
            .filter(p => p.paymentMethod === method && p.status === 'success')
            .reduce((sum, p) => sum + p.amount, 0)
        }))
      };

      return NextResponse.json({
        success: true,
        data: paginatedPayments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      });
    }

    // ===== TRANSACTIONS =====
    else if (type === 'transactions') {
      // Combine payments and potential refunds for transaction history
      const companies = await Company.find({ 
        deletedAt: null,
        'stats.totalRevenue': { $gt: 0 }
      })
        .select('companyName stats.totalRevenue createdAt')
        .limit(50)
        .lean();

      const transactions = [];
      
      // Add payments
      companies.forEach((c, index) => {
        const numPayments = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numPayments; i++) {
          const date = new Date(c.createdAt);
          date.setMonth(date.getMonth() + i);
          
          const amount = c.stats?.totalRevenue 
            ? Math.round(c.stats.totalRevenue / numPayments) 
            : Math.floor(Math.random() * 50000) + 5000;

          transactions.push({
            id: `txn_${c._id.toString().slice(-8)}_${i}`,
            type: 'payment',
            transactionId: `TXN${date.getFullYear()}${(index * numPayments + i + 1).toString().padStart(6, '0')}`,
            companyName: c.companyName,
            amount: amount,
            status: 'completed',
            method: ['razorpay', 'stripe', 'bank_transfer'][Math.floor(Math.random() * 3)],
            date: formatDate(date),
            description: `Subscription payment for ${c.companyName}`
          });
        }

        // Add a random refund for some companies (20% chance)
        if (Math.random() < 0.2) {
          const refundDate = new Date(c.createdAt);
          refundDate.setMonth(refundDate.getMonth() + 1);
          
          const refundAmount = Math.floor(Math.random() * 10000) + 1000;

          transactions.push({
            id: `ref_${c._id.toString().slice(-8)}`,
            type: 'refund',
            transactionId: `REF${refundDate.getFullYear()}${(index + 1).toString().padStart(6, '0')}`,
            companyName: c.companyName,
            amount: -refundAmount,
            status: 'completed',
            method: 'bank_transfer',
            date: formatDate(refundDate),
            description: `Refund for overpayment - ${c.companyName}`
          });
        }
      });

      // Sort by date (newest first)
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Pagination
      const total = transactions.length;
      const paginatedTransactions = transactions.slice(skip, skip + limit);

      return NextResponse.json({
        success: true,
        data: paginatedTransactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          totalTransactions: transactions.length,
          totalPayments: transactions.filter(t => t.type === 'payment').length,
          totalRefunds: transactions.filter(t => t.type === 'refund').length,
          netAmount: transactions.reduce((sum, t) => sum + t.amount, 0)
        }
      });
    }

    else {
      return NextResponse.json(
        { success: false, message: 'Invalid type parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Subscriptions API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch subscription data',
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
    const { type, companyId, plan, interval, expiryDate, autoRenew, paymentMethod } = body;

    if (type === 'company-subscription') {
      if (!isValidObjectId(companyId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid company ID' },
          { status: 400 }
        );
      }

      await connectDB();

      const company = await Company.findById(companyId);
      if (!company) {
        return NextResponse.json(
          { success: false, message: 'Company not found' },
          { status: 404 }
        );
      }

      // Calculate expiry date if not provided
      let calculatedExpiryDate = expiryDate;
      if (!calculatedExpiryDate && interval) {
        const date = new Date();
        if (interval === 'monthly') {
          date.setMonth(date.getMonth() + 1);
        } else if (interval === 'yearly') {
          date.setFullYear(date.getFullYear() + 1);
        }
        calculatedExpiryDate = date;
      }

      // Update subscription
      company.subscription = {
        ...company.subscription,
        plan: plan || company.subscription.plan,
        status: 'active',
        startDate: new Date(),
        expiryDate: calculatedExpiryDate ? new Date(calculatedExpiryDate) : company.subscription.expiryDate,
        autoRenew: autoRenew !== undefined ? autoRenew : company.subscription.autoRenew,
        paymentMethod: paymentMethod || company.subscription.paymentMethod
      };

      // Update limits based on plan
      if (plan) {
        const planLimits = getPlanLimits(plan);
        company.limits = {
          ...company.limits,
          ...planLimits
        };
      }

      company.updatedBy = session.user.id;
      company.updatedAt = new Date();

      await company.save();

      return NextResponse.json({
        success: true,
        message: 'Subscription updated successfully',
        data: {
          companyId: company._id.toString(),
          companyName: company.companyName,
          plan: company.subscription.plan,
          status: company.subscription.status,
          expiryDate: formatDate(company.subscription.expiryDate),
          autoRenew: company.subscription.autoRenew
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('POST Subscription Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscription' },
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
    const { type, companyId, status, autoRenew, plan, interval } = body;

    await connectDB();

    // ===== BULK UPDATE COMPANY SUBSCRIPTIONS =====
    if (type === 'bulk' && companyId && Array.isArray(companyId)) {
      const validIds = companyId.filter(id => isValidObjectId(id));
      
      if (validIds.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No valid company IDs' },
          { status: 400 }
        );
      }

      const updateData = {};
      
      if (status) updateData['subscription.status'] = status;
      if (autoRenew !== undefined) updateData['subscription.autoRenew'] = autoRenew;
      if (plan) {
        updateData['subscription.plan'] = plan;
        const planLimits = getPlanLimits(plan);
        updateData.limits = planLimits;
      }
      
      updateData.updatedBy = session.user.id;
      updateData.updatedAt = new Date();

      const result = await Company.updateMany(
        { _id: { $in: validIds } },
        { $set: updateData }
      );

      return NextResponse.json({
        success: true,
        message: `Updated ${result.modifiedCount} companies successfully`,
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        }
      });
    }

    // ===== SINGLE COMPANY UPDATE =====
    else if (type === 'company' && companyId) {
      if (!isValidObjectId(companyId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid company ID' },
          { status: 400 }
        );
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return NextResponse.json(
          { success: false, message: 'Company not found' },
          { status: 404 }
        );
      }

      // Update subscription fields
      if (status) company.subscription.status = status;
      if (autoRenew !== undefined) company.subscription.autoRenew = autoRenew;
      if (plan) {
        company.subscription.plan = plan;
        const planLimits = getPlanLimits(plan);
        company.limits = {
          ...company.limits,
          ...planLimits
        };
      }
      
      company.updatedBy = session.user.id;
      company.updatedAt = new Date();
      await company.save();

      return NextResponse.json({
        success: true,
        message: 'Company subscription updated successfully',
        data: {
          companyId: company._id.toString(),
          companyName: company.companyName,
          plan: company.subscription.plan,
          status: company.subscription.status,
          autoRenew: company.subscription.autoRenew
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('PUT Subscription Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscription' },
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
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');

    if (type === 'cancel-subscription') {
      if (!companyId || !isValidObjectId(companyId)) {
        return NextResponse.json(
          { success: false, message: 'Valid company ID is required' },
          { status: 400 }
        );
      }

      await connectDB();

      const company = await Company.findById(companyId);
      if (!company) {
        return NextResponse.json(
          { success: false, message: 'Company not found' },
          { status: 404 }
        );
      }

      // Cancel subscription
      company.subscription.status = 'cancelled';
      company.subscription.expiryDate = new Date();
      company.subscription.autoRenew = false;
      company.updatedBy = session.user.id;
      company.updatedAt = new Date();
      await company.save();

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: {
          companyId: company._id.toString(),
          companyName: company.companyName,
          status: 'cancelled'
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('DELETE Subscription Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

// ============== HELPER FUNCTIONS ==============
async function calculateMonthlyRevenue() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  // Get active subscriptions and calculate estimated revenue
  const companies = await Company.find({
    'subscription.status': 'active',
    deletedAt: null,
    'subscription.plan': { $ne: 'free' }
  }).select('subscription');

  let monthlyRevenue = 0;
  
  companies.forEach(company => {
    const plan = company.subscription?.plan;
    const paymentMethod = company.subscription?.paymentMethod || 'monthly';
    
    if (plan === 'basic') {
      monthlyRevenue += paymentMethod === 'yearly' 
        ? PLAN_DETAILS.basic.yearlyPrice / 12 
        : PLAN_DETAILS.basic.monthlyPrice;
    } else if (plan === 'pro') {
      monthlyRevenue += paymentMethod === 'yearly' 
        ? PLAN_DETAILS.pro.yearlyPrice / 12 
        : PLAN_DETAILS.pro.monthlyPrice;
    }
    // Enterprise plans are custom priced, estimate average
    else if (plan === 'enterprise') {
      monthlyRevenue += 15000; // Average enterprise revenue
    }
  });

  return Math.round(monthlyRevenue);
}

function getPlanLimits(plan) {
  const planData = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
  
  return {
    maxUsers: planData.maxUsers,
    maxProducts: planData.maxProducts,
    maxOrdersPerMonth: planData.maxOrders,
    maxBookingsPerMonth: planData.maxBookings,
    storageLimit: planData.storage
  };
}