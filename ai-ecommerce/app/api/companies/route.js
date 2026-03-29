
// app/api/companies/route.js
// PROFESSIONAL COMPANIES API ROUTE - Full multi-tenant WhatsApp support
// Handles: Create, Read, Update, Delete companies with WhatsApp integration

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db.js';
import Company from '@/models/Company';
import User from '@/models/user';
import CompanySettings from '@/models/CompanySettings';
import Counter from '@/models/Counter';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import rateLimit from '@/lib/rate-limit';

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// Rate limiter for company creation
const createLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 100, // Max 100 creations per hour
});

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || process.env.NEXTAUTH_URL 
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// ========== HELPER FUNCTIONS ==========

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && 
         /^[0-9a-fA-F]{24}$/.test(id);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 12;
};

const validatePincode = (pincode) => {
  return /^\d{6}$/.test(pincode);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

// ✅ NEW: Validate slug format
const validateSlug = (slug) => {
  if (!slug) return true;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

// ✅ NEW: Generate slug from company name
const generateSlug = (name) => {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (!baseSlug || baseSlug.length === 0) {
    baseSlug = `company-${Date.now()}`;
  }
  
  return baseSlug;
};

// Get plan limits based on plan name
const getPlanLimits = (plan) => {
  const limits = {
    free: {
      maxUsers: 3,
      maxProducts: 100,
      maxOrdersPerMonth: 100,
      maxBookingsPerMonth: 100,
      storageLimit: 512, // MB
    },
    basic: {
      maxUsers: 10,
      maxProducts: 1000,
      maxOrdersPerMonth: 500,
      maxBookingsPerMonth: 500,
      storageLimit: 2048, // 2GB
    },
    pro: {
      maxUsers: 50,
      maxProducts: 5000,
      maxOrdersPerMonth: 2000,
      maxBookingsPerMonth: 2000,
      storageLimit: 10240, // 10GB
    },
    enterprise: {
      maxUsers: 10000,
      maxProducts: 100000,
      maxOrdersPerMonth: 100000,
      maxBookingsPerMonth: 100000,
      storageLimit: 102400, // 100GB
    },
  };
  
  return limits[plan] || limits.free;
};

// Get plan features based on plan name
const getPlanFeatures = (plan) => {
  const features = {
    free: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: false,
      referrals: false,
      apiAccess: false,
      multipleUsers: true,
      customDomain: false,
    },
    basic: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: true,
      referrals: false,
      apiAccess: false,
      multipleUsers: true,
      customDomain: false,
    },
    pro: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: true,
      referrals: true,
      apiAccess: true,
      multipleUsers: true,
      customDomain: false,
    },
    enterprise: {
      ecommerce: true,
      booking: true,
      whatsappBot: true,
      analytics: true,
      coupons: true,
      referrals: true,
      apiAccess: true,
      multipleUsers: true,
      customDomain: true,
    },
  };
  
  return features[plan] || features.free;
};

// Format company response with WhatsApp fields and catalog info
const formatCompanyResponse = (company) => {
  const companyObj = company.toObject ? company.toObject() : company;
  
  // Get all WhatsApp numbers
  const whatsappNumbers = [];
  
  // Add primary WhatsApp number if exists
  if (companyObj.whatsapp?.phoneNumber) {
    whatsappNumbers.push({
      number: companyObj.whatsapp.phoneNumber,
      type: 'primary',
      isConnected: companyObj.whatsapp.isConnected || false,
      status: companyObj.whatsapp.connectionStatus || 'disconnected'
    });
  }
  
  // Add routing numbers if they exist
  if (companyObj.whatsappRouting?.phoneNumbers?.length > 0) {
    companyObj.whatsappRouting.phoneNumbers.forEach(p => {
      if (p.isActive) {
        whatsappNumbers.push({
          number: p.number,
          type: p.isPrimary ? 'routing_primary' : 'routing',
          isPrimary: p.isPrimary || false,
          isActive: p.isActive,
          description: p.description,
          verifiedAt: p.verifiedAt?.toISOString()
        });
      }
    });
  }
  
  return {
    ...companyObj,
    id: companyObj._id.toString(),
    _id: companyObj._id.toString(),
    fullAddress: company.fullAddress,
    isSubscriptionValid: company.isSubscriptionValid,
    daysUntilExpiry: company.daysUntilExpiry,
    
    // ✅ NEW: Catalog fields
    slug: companyObj.slug,
    catalogWhatsapp: companyObj.catalogWhatsapp,
    catalogLink: company.catalogLink,
    
    // WhatsApp fields
    whatsapp: companyObj.whatsapp ? {
      isConnected: companyObj.whatsapp.isConnected || false,
      connectionStatus: companyObj.whatsapp.connectionStatus || 'disconnected',
      phoneNumber: companyObj.whatsapp.phoneNumber,
      clientId: companyObj.whatsapp.clientId,
      connectedAt: companyObj.whatsapp.connectedAt?.toISOString(),
      lastMessageAt: companyObj.whatsapp.lastMessageAt?.toISOString(),
      lastError: companyObj.whatsapp.lastError,
      deviceInfo: companyObj.whatsapp.deviceInfo
    } : null,
    
    whatsappNumbers,
    totalWhatsAppNumbers: whatsappNumbers.length,
    hasActiveWhatsApp: whatsappNumbers.length > 0,
    
    createdAt: companyObj.createdAt?.toISOString(),
    updatedAt: companyObj.updatedAt?.toISOString(),
    verifiedAt: companyObj.verifiedAt?.toISOString(),
    suspendedAt: companyObj.suspendedAt?.toISOString(),
    deletedAt: companyObj.deletedAt?.toISOString(),
  };
};

// ========== OPTIONS HANDLER ==========
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...securityHeaders,
      ...corsHeaders,
      'Allow': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
}

// ========== GET HANDLER - List all companies (Super Admin only) ==========
export async function GET(request) {
  try {
    console.log('🏢 [COMPANIES API] GET request received');

    // Check authentication and super admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        {
          status: 401,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Check if user is super admin
    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Super admin access required',
          code: 'FORBIDDEN',
        },
        {
          status: 403,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const plan = searchParams.get('plan') || 'all';
    const whatsappConnected = searchParams.get('whatsappConnected'); // 'true' or 'false'
    const hasWhatsapp = searchParams.get('hasWhatsapp'); // 'true' or 'false'
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (!includeDeleted) {
      query.deletedAt = null;
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (plan !== 'all') {
      query['subscription.plan'] = plan;
    }

    // WhatsApp filters
    if (whatsappConnected === 'true') {
      query['whatsapp.isConnected'] = true;
      query['whatsapp.connectionStatus'] = 'connected';
    } else if (whatsappConnected === 'false') {
      query['whatsapp.isConnected'] = false;
    }

    if (hasWhatsapp === 'true') {
      query.$or = [
        { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
        { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
      ];
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { companyEmail: { $regex: search, $options: 'i' } },
        { companyPhone: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }, // ✅ Search by slug
        { 'whatsapp.phoneNumber': { $regex: search, $options: 'i' } },
        { 'whatsappRouting.phoneNumbers.number': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [companies, total, stats] = await Promise.all([
      Company.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email')
        .populate('verifiedBy', 'fullName email')
        .lean(),
      Company.countDocuments(query),
      Company.getStats(),
    ]);

    // Format companies with WhatsApp info
    const formattedCompanies = companies.map(company => formatCompanyResponse(company));

    // Get WhatsApp stats
    const whatsappStats = {
      total: await Company.countDocuments({ 
        $or: [
          { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
          { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
        ],
        deletedAt: null 
      }),
      connected: await Company.countDocuments({ 
        'whatsapp.isConnected': true, 
        'whatsapp.connectionStatus': 'connected',
        deletedAt: null 
      }),
      disconnected: await Company.countDocuments({ 
        'whatsapp.isConnected': false,
        $or: [
          { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
          { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
        ],
        deletedAt: null 
      })
    };

    console.log('✅ [COMPANIES API] GET successful:', {
      count: formattedCompanies.length,
      total,
      page,
      whatsappConnected: whatsappStats.connected
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedCompanies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        stats: {
          ...stats,
          whatsapp: whatsappStats
        },
        filters: {
          applied: {
            search: search || null,
            status: status !== 'all' ? status : null,
            plan: plan !== 'all' ? plan : null,
            whatsappConnected: whatsappConnected || null,
            hasWhatsapp: hasWhatsapp || null,
            includeDeleted,
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('❌ [COMPANIES API] GET error:', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch companies',
        code: 'FETCH_FAILED',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  }
}

// ========== POST HANDLER - Create new company with admin user ==========
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    console.log('🏢 [COMPANIES API] POST request received');

    // Check authentication and super admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        {
          status: 401,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Check if user is super admin
    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Super admin access required to create companies',
          code: 'FORBIDDEN',
        },
        {
          status: 403,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Apply rate limiting
    try {
      await createLimiter.check(10, session.user.id); // 10 creations per hour per super admin
    } catch (rateLimitError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many company creation attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: '1 hour',
        },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            ...corsHeaders,
            'Retry-After': '3600',
          },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON data in request',
          code: 'INVALID_JSON',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // ===== VALIDATE COMPANY DATA =====
    const errors = {};

    // Company details validation
    if (!body.companyName?.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!body.companyEmail?.trim()) {
      errors.companyEmail = 'Company email is required';
    } else if (!validateEmail(body.companyEmail)) {
      errors.companyEmail = 'Invalid email format';
    }

    if (!body.companyPhone?.trim()) {
      errors.companyPhone = 'Company phone is required';
    } else if (!validatePhone(body.companyPhone)) {
      errors.companyPhone = 'Phone must be 10-12 digits';
    }

    // ✅ NEW: Slug validation (auto-generate if not provided)
    let finalSlug = body.slug;
    if (!finalSlug && body.companyName) {
      finalSlug = generateSlug(body.companyName);
    }
    
    if (finalSlug && !validateSlug(finalSlug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    // ✅ NEW: Catalog WhatsApp validation
    if (body.catalogWhatsapp && !validatePhone(body.catalogWhatsapp)) {
      errors.catalogWhatsapp = 'Catalog WhatsApp number must be 10-12 digits';
    }

    // WhatsApp number validation
    if (body.whatsappNumber && !validatePhone(body.whatsappNumber)) {
      errors.whatsappNumber = 'WhatsApp number must be 10-12 digits';
    }

    // Additional WhatsApp numbers validation
    if (body.additionalWhatsAppNumbers?.length > 0) {
      body.additionalWhatsAppNumbers.forEach((num, index) => {
        if (!validatePhone(num.number)) {
          errors[`additionalWhatsAppNumbers[${index}].number`] = 'Invalid WhatsApp number format';
        }
      });
    }

    // Address validation
    if (!body.address?.street?.trim()) {
      errors['address.street'] = 'Street address is required';
    }
    if (!body.address?.city?.trim()) {
      errors['address.city'] = 'City is required';
    }
    if (!body.address?.state?.trim()) {
      errors['address.state'] = 'State is required';
    }
    if (!body.address?.pincode?.trim()) {
      errors['address.pincode'] = 'Pincode is required';
    } else if (!validatePincode(body.address.pincode)) {
      errors['address.pincode'] = 'Pincode must be 6 digits';
    }

    // Admin user validation
    if (!body.adminName?.trim()) {
      errors.adminName = 'Admin name is required';
    }

    if (!body.adminEmail?.trim()) {
      errors.adminEmail = 'Admin email is required';
    } else if (!validateEmail(body.adminEmail)) {
      errors.adminEmail = 'Invalid admin email format';
    }

    if (!body.adminPassword?.trim()) {
      errors.adminPassword = 'Admin password is required';
    } else if (!validatePassword(body.adminPassword)) {
      errors.adminPassword = 'Password must be at least 6 characters';
    }

    if (!body.adminPhone?.trim()) {
      errors.adminPhone = 'Admin phone is required';
    } else if (!validatePhone(body.adminPhone)) {
      errors.adminPhone = 'Admin phone must be 10-12 digits';
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_FAILED',
          errors,
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    await connectDB();

    // Check for existing company with same email/name/slug
    const existingCompany = await Company.findOne({
      $or: [
        { companyEmail: body.companyEmail.toLowerCase().trim() },
        { companyName: body.companyName.trim() },
        { slug: finalSlug }
      ],
    });

    if (existingCompany) {
      let field = '';
      if (existingCompany.companyEmail === body.companyEmail.toLowerCase().trim()) {
        field = 'companyEmail';
      } else if (existingCompany.companyName === body.companyName.trim()) {
        field = 'companyName';
      } else if (existingCompany.slug === finalSlug) {
        field = 'slug';
      }
      
      return NextResponse.json(
        {
          success: false,
          message: `Company with this ${field === 'companyEmail' ? 'email' : field === 'companyName' ? 'name' : 'slug'} already exists`,
          code: 'COMPANY_EXISTS',
          field,
        },
        {
          status: 409,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Check for existing admin user with same email
    const existingUser = await User.findOne({
      email: body.adminEmail.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin user with this email already exists',
          code: 'ADMIN_EXISTS',
          field: 'adminEmail',
        },
        {
          status: 409,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Start MongoDB session for transaction
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // 1. Create Company with WhatsApp fields and NEW catalog fields
      const plan = body.plan || 'free';
      const planLimits = getPlanLimits(plan);
      const planFeatures = getPlanFeatures(plan);

      // Generate client ID for WhatsApp
      const timestamp = Date.now();
      const clientId = body.whatsappNumber 
        ? `company_${timestamp}_${body.whatsappNumber.slice(-4)}` 
        : null;

      // ✅ Ensure slug is unique
      let uniqueSlug = finalSlug;
      let slugCounter = 1;
      let slugExists = true;
      
      while (slugExists) {
        const existing = await Company.findOne({ slug: uniqueSlug });
        if (!existing) {
          slugExists = false;
        } else {
          uniqueSlug = `${finalSlug}-${slugCounter}`;
          slugCounter++;
        }
      }

      const [company] = await Company.create([{
        companyName: body.companyName.trim(),
        companyEmail: body.companyEmail.toLowerCase().trim(),
        companyPhone: body.companyPhone.replace(/\D/g, ''),
        
        // ✅ NEW: Catalog fields
        slug: uniqueSlug,
        catalogWhatsapp: body.catalogWhatsapp ? body.catalogWhatsapp.replace(/\D/g, '') : null,
        
        // WhatsApp configuration
        whatsapp: {
          phoneNumber: body.whatsappNumber ? body.whatsappNumber.replace(/\D/g, '') : null,
          isConnected: false,
          connectionStatus: 'pending',
          clientId: clientId,
          maxReconnectAttempts: 5,
          reconnectAttempts: 0,
          errorCount: 0
        },
        
        // WhatsApp routing numbers
        whatsappRouting: {
          phoneNumbers: body.additionalWhatsAppNumbers?.map((num, index) => ({
            number: num.number.replace(/\D/g, ''),
            isPrimary: num.isPrimary || false,
            isActive: true,
            description: num.description || `WhatsApp number ${index + 1}`,
            verifiedAt: new Date()
          })) || [],
          autoResponse: {
            enabled: false,
            workingHours: {
              enabled: false,
              timezone: 'Asia/Kolkata'
            }
          },
          fallback: {
            enabled: true
          }
        },
        
        address: {
          street: body.address.street.trim(),
          city: body.address.city.trim(),
          state: body.address.state.trim(),
          pincode: body.address.pincode.trim(),
          country: body.address.country || 'India',
        },
        gstin: body.gstin?.toUpperCase().trim(),
        pan: body.pan?.toUpperCase().trim(),
        subscription: {
          plan,
          status: 'active',
          startDate: new Date(),
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
          autoRenew: body.autoRenew !== false,
          paymentMethod: body.paymentMethod || 'monthly',
        },
        limits: planLimits,
        features: planFeatures,
        status: 'active',
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: session.user.id,
        createdBy: session.user.id,
        notes: body.notes || '',
        tags: body.tags || [],
        
        // Initialize stats
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalBookings: 0,
          totalRevenue: 0,
          whatsapp: {
            totalMessages: 0,
            totalConversations: 0,
            totalCustomers: 0,
            messagesToday: 0,
            lastResetAt: new Date()
          }
        }
      }], { session: dbSession });

      const companyId = company._id;

      // 2. Create Company Settings
      await CompanySettings.create([{
        companyId,
        companyName: body.companyName.trim(),
        phone: body.companyPhone.replace(/\D/g, ''),
        email: body.companyEmail.toLowerCase().trim(),
        address: body.address.street.trim(),
        city: body.address.city.trim(),
        state: body.address.state.trim(),
        pincode: body.address.pincode.trim(),
        country: body.address.country || 'India',
        createdBy: session.user.id,
        orderFlowMode: 'short',
        
        // Initialize payment settings
        upiIds: body.whatsappNumber ? [{
          id: `${body.whatsappNumber.replace(/\D/g, '').slice(-10)}@okhdfcbank`,
          name: 'Primary UPI',
          appType: 'other',
          isActive: true,
          description: 'Auto-generated UPI ID',
          createdAt: new Date()
        }] : [],
        
        paymentSettings: {
          preferredMethod: 'upi',
          allowPartialPayments: false,
          autoVerifyEnabled: true,
          minConfidenceForAuto: 85,
          paymentTimeout: 30,
          requireTransactionId: true,
          allowMultiplePaymentMethods: true
        }
      }], { session: dbSession });

      // 3. Create Admin User
      const hashedPassword = await bcrypt.hash(body.adminPassword, 12);

      const [adminUser] = await User.create([{
        fullName: body.adminName.trim(),
        email: body.adminEmail.toLowerCase().trim(),
        phone: body.adminPhone.replace(/\D/g, ''),
        password: hashedPassword,
        role: 'admin',
        adminType: 'company',
        companyId,
        isVerified: true,
        status: 'active',
        emailVerifiedAt: new Date(),
        createdBy: session.user.id,
        notificationSettings: {
          pushNotifications: { enabled: true, lastUpdated: new Date() },
          notificationTypes: {
            newOrders: { enabled: true, priority: 'high', sound: true },
            payments: { enabled: true, priority: 'high', sound: true },
            lowStock: { enabled: true, priority: 'normal', sound: true },
            systemAlerts: { enabled: true, priority: 'high', sound: true },
            orderUpdates: { enabled: true, priority: 'normal', sound: true }
          },
          settingsUpdatedAt: new Date(),
        },
      }], { session: dbSession });

      // 4. Initialize Counters for the company
      if (typeof Counter.initializeCompanyCounters === 'function') {
        await Counter.initializeCompanyCounters(companyId, adminUser._id);
        console.log('✅ Counters initialized for company:', companyId);
      } else {
        console.log('⚠️ Counter.initializeCompanyCounters not available - counters will be created on-demand');
      }

      // Update company with createdBy as the admin user
      company.createdBy = adminUser._id;
      await company.save({ session: dbSession });

      await dbSession.commitTransaction();

      console.log('✅ [COMPANIES API] Company created successfully:', {
        companyId: companyId.toString(),
        companyName: company.companyName,
        slug: company.slug,
        catalogWhatsapp: company.catalogWhatsapp,
        adminEmail: adminUser.email,
        plan,
        whatsappNumber: body.whatsappNumber || 'Not provided',
        additionalNumbers: body.additionalWhatsAppNumbers?.length || 0
      });

      // Populate company for response
      const populatedCompany = await Company.findById(companyId)
        .populate('createdBy', 'fullName email')
        .populate('verifiedBy', 'fullName email')
        .lean();

      const processingTime = Date.now() - startTime;

      // Format WhatsApp numbers for response
      const whatsappNumbers = [];
      if (body.whatsappNumber) {
        whatsappNumbers.push({
          number: body.whatsappNumber,
          type: 'primary',
          isPrimary: true
        });
      }
      if (body.additionalWhatsAppNumbers) {
        whatsappNumbers.push(...body.additionalWhatsAppNumbers);
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Company created successfully',
          data: {
            company: formatCompanyResponse(populatedCompany),
            admin: {
              id: adminUser._id.toString(),
              name: adminUser.fullName,
              email: adminUser.email,
              phone: adminUser.phone,
            },
            whatsapp: {
              primaryNumber: body.whatsappNumber,
              additionalNumbers: body.additionalWhatsAppNumbers || [],
              clientId: clientId,
              totalNumbers: whatsappNumbers.length
            },
            // ✅ NEW: Catalog info
            catalog: {
              slug: company.slug,
              link: company.catalogLink,
              whatsapp: company.catalogWhatsapp
            }
          },
          metadata: {
            processingTime,
            plan,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 201,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    } catch (transactionError) {
      await dbSession.abortTransaction();
      throw transactionError;
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error('❌ [COMPANIES API] POST error:', {
      message: error.message,
      stack: error.stack,
    });

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate value for ${field}`,
          code: 'DUPLICATE_KEY',
          field,
        },
        {
          status: 409,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_FAILED',
          errors,
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create company',
        code: 'CREATE_FAILED',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  }
}

// ========== PUT HANDLER - Bulk operations ==========
export async function PUT(request) {
  try {
    console.log('🏢 [COMPANIES API] PUT request received');

    // Check authentication and super admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        {
          status: 401,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Super admin access required',
          code: 'FORBIDDEN',
        },
        {
          status: 403,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    await connectDB();

    const body = await request.json();
    const { action, companyIds, data } = body;

    if (!action || !companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Action and company IDs are required',
          code: 'INVALID_REQUEST',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Validate all company IDs
    const validIds = companyIds.filter(id => isValidObjectId(id));
    
    if (validIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid company IDs provided',
          code: 'INVALID_IDS',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    let updateData = {};
    let result;

    switch (action) {
      case 'activate':
        updateData = {
          status: 'active',
          updatedBy: session.user.id,
          updatedAt: new Date(),
        };
        result = await Company.updateMany(
          { _id: { $in: validIds } },
          { $set: updateData }
        );
        break;

      case 'suspend':
        updateData = {
          status: 'suspended',
          suspendedAt: new Date(),
          suspendedBy: session.user.id,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        };
        result = await Company.updateMany(
          { _id: { $in: validIds } },
          { $set: updateData }
        );
        break;

      case 'delete':
        // Soft delete
        updateData = {
          deletedAt: new Date(),
          deletedBy: session.user.id,
          status: 'inactive',
          updatedBy: session.user.id,
          updatedAt: new Date(),
        };
        result = await Company.updateMany(
          { _id: { $in: validIds } },
          { $set: updateData }
        );
        break;

      case 'change-plan':
        if (!data?.plan) {
          return NextResponse.json(
            {
              success: false,
              message: 'Plan is required for change-plan action',
              code: 'PLAN_REQUIRED',
            },
            { status: 400 }
          );
        }

        const planLimits = getPlanLimits(data.plan);
        const planFeatures = getPlanFeatures(data.plan);

        updateData = {
          'subscription.plan': data.plan,
          limits: planLimits,
          features: planFeatures,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        };

        if (data.expiryDate) {
          updateData['subscription.expiryDate'] = new Date(data.expiryDate);
        }

        result = await Company.updateMany(
          { _id: { $in: validIds } },
          { $set: updateData }
        );
        break;

      // ✅ NEW: Update catalog settings
      case 'update-catalog':
        if (data.slug) {
          if (!validateSlug(data.slug)) {
            return NextResponse.json(
              {
                success: false,
                message: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens',
                code: 'INVALID_SLUG',
              },
              { status: 400 }
            );
          }
          updateData.slug = data.slug;
        }
        
        if (data.catalogWhatsapp) {
          if (!validatePhone(data.catalogWhatsapp)) {
            return NextResponse.json(
              {
                success: false,
                message: 'Invalid catalog WhatsApp number',
                code: 'INVALID_WHATSAPP',
              },
              { status: 400 }
            );
          }
          updateData.catalogWhatsapp = data.catalogWhatsapp.replace(/\D/g, '');
        }
        
        updateData.updatedBy = session.user.id;
        updateData.updatedAt = new Date();
        
        result = await Company.updateMany(
          { _id: { $in: validIds } },
          { $set: updateData }
        );
        break;

      // WhatsApp bulk operations
      case 'disconnect-whatsapp':
        updateData = {
          'whatsapp.isConnected': false,
          'whatsapp.connectionStatus': 'disconnected',
          'whatsapp.disconnectedAt': new Date(),
          updatedBy: session.user.id,
          updatedAt: new Date(),
        };
        result = await Company.updateMany(
          { _id: { $in: validIds } },
          { $set: updateData }
        );
        break;

      case 'reset-whatsapp':
        updateData = {
          'whatsapp.isConnected': false,
          'whatsapp.connectionStatus': 'pending',
          'whatsapp.reconnectAttempts': 0,
          'whatsapp.errorCount': 0,
          'whatsapp.lastError': null,
          'whatsapp.disconnectedAt': null,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        };
        result = await Company.updateMany(
          { _id: { $in: validIds } },
          { $set: updateData }
        );
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid action. Supported actions: activate, suspend, delete, change-plan, update-catalog, disconnect-whatsapp, reset-whatsapp',
            code: 'INVALID_ACTION',
          },
          {
            status: 400,
            headers: { ...securityHeaders, ...corsHeaders },
          }
        );
    }

    console.log('✅ [COMPANIES API] Bulk operation successful:', {
      action,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully performed ${action} on ${result.modifiedCount} companies`,
        data: {
          action,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          companyIds: validIds,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('❌ [COMPANIES API] PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to perform bulk operation',
        code: 'BULK_OPERATION_FAILED',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  }
}

// ========== DELETE HANDLER - Bulk delete (soft delete) ==========
export async function DELETE(request) {
  try {
    console.log('🏢 [COMPANIES API] DELETE request received');

    // Check authentication and super admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        {
          status: 401,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Super admin access required',
          code: 'FORBIDDEN',
        },
        {
          status: 403,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const permanent = searchParams.get('permanent') === 'true';

    if (!ids) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company IDs are required',
          code: 'IDS_REQUIRED',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    const companyIds = ids.split(',').filter(id => id.trim());
    const validIds = companyIds.filter(id => isValidObjectId(id));

    if (validIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid company IDs provided',
          code: 'INVALID_IDS',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    await connectDB();

    if (permanent) {
      // Permanent delete (use with caution)
      const result = await Company.deleteMany({ _id: { $in: validIds } });
      
      console.log('✅ [COMPANIES API] Permanent delete successful:', {
        deletedCount: result.deletedCount,
      });

      return NextResponse.json(
        {
          success: true,
          message: `Successfully deleted ${result.deletedCount} companies permanently`,
          data: {
            deletedCount: result.deletedCount,
            companyIds: validIds,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    } else {
      // Soft delete
      const result = await Company.updateMany(
        { _id: { $in: validIds } },
        {
          $set: {
            deletedAt: new Date(),
            deletedBy: session.user.id,
            status: 'inactive',
            'whatsapp.isConnected': false,
            'whatsapp.connectionStatus': 'disconnected',
            updatedBy: session.user.id,
            updatedAt: new Date(),
          },
        }
      );

      console.log('✅ [COMPANIES API] Soft delete successful:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      });

      return NextResponse.json(
        {
          success: true,
          message: `Successfully deactivated ${result.modifiedCount} companies`,
          data: {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            companyIds: validIds,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }
  } catch (error) {
    console.error('❌ [COMPANIES API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete companies',
        code: 'DELETE_FAILED',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  }
}























// // app/api/companies/route.js
// // PROFESSIONAL COMPANIES API ROUTE - Full multi-tenant WhatsApp support with Service Type Selection
// // Handles: Create, Read, Update, Delete companies with WhatsApp integration and service type management

// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';
// import { connectDB } from '@/utils/db.js';
// import Company from '@/models/Company';
// import User from '@/models/user';
// import CompanySettings from '@/models/CompanySettings';
// import Counter from '@/models/Counter';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import rateLimit from '@/lib/rate-limit';

// // ========== CONFIGURATION ==========
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
// export const maxDuration = 30;
// export const revalidate = 0;

// // Rate limiter for company creation
// const createLimiter = rateLimit({
//   interval: 60 * 60 * 1000, // 1 hour
//   uniqueTokenPerInterval: 100, // Max 100 creations per hour
// });

// // Security headers
// const securityHeaders = {
//   'X-Content-Type-Options': 'nosniff',
//   'X-Frame-Options': 'DENY',
//   'X-XSS-Protection': '1; mode=block',
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
//   'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
// };

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
//     ? process.env.FRONTEND_URL || process.env.NEXTAUTH_URL 
//     : 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//   'Access-Control-Allow-Credentials': 'true',
//   'Access-Control-Max-Age': '86400',
// };

// // ========== HELPER FUNCTIONS ==========

// const isValidObjectId = (id) => {
//   return mongoose.Types.ObjectId.isValid(id) && 
//          /^[0-9a-fA-F]{24}$/.test(id);
// };

// const validateEmail = (email) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// const validatePhone = (phone) => {
//   const digits = phone.replace(/\D/g, '');
//   return digits.length >= 10 && digits.length <= 12;
// };

// const validatePincode = (pincode) => {
//   return /^\d{6}$/.test(pincode);
// };

// const validatePassword = (password) => {
//   return password.length >= 6;
// };

// // ✅ NEW: Validate slug format
// const validateSlug = (slug) => {
//   if (!slug) return true;
//   return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
// };

// // ✅ NEW: Validate service type
// const validateServiceType = (serviceType) => {
//   return ['ecommerce', 'booking', 'both'].includes(serviceType);
// };

// // ✅ NEW: Generate slug from company name
// const generateSlug = (name) => {
//   let baseSlug = name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-|-$/g, '');
  
//   if (!baseSlug || baseSlug.length === 0) {
//     baseSlug = `company-${Date.now()}`;
//   }
  
//   return baseSlug;
// };

// // Get plan limits based on plan name
// const getPlanLimits = (plan) => {
//   const limits = {
//     free: {
//       maxUsers: 3,
//       maxProducts: 100,
//       maxOrdersPerMonth: 100,
//       maxBookingsPerMonth: 100,
//       storageLimit: 512, // MB
//     },
//     basic: {
//       maxUsers: 10,
//       maxProducts: 1000,
//       maxOrdersPerMonth: 500,
//       maxBookingsPerMonth: 500,
//       storageLimit: 2048, // 2GB
//     },
//     pro: {
//       maxUsers: 50,
//       maxProducts: 5000,
//       maxOrdersPerMonth: 2000,
//       maxBookingsPerMonth: 2000,
//       storageLimit: 10240, // 10GB
//     },
//     enterprise: {
//       maxUsers: 10000,
//       maxProducts: 100000,
//       maxOrdersPerMonth: 100000,
//       maxBookingsPerMonth: 100000,
//       storageLimit: 102400, // 100GB
//     },
//   };
  
//   return limits[plan] || limits.free;
// };

// // Get plan features based on plan name and service type
// const getPlanFeatures = (plan, serviceType = 'both') => {
//   const baseFeatures = {
//     free: {
//       ecommerce: true,
//       booking: true,
//       whatsappBot: true,
//       analytics: true,
//       coupons: false,
//       referrals: false,
//       apiAccess: false,
//       multipleUsers: true,
//       customDomain: false,
//     },
//     basic: {
//       ecommerce: true,
//       booking: true,
//       whatsappBot: true,
//       analytics: true,
//       coupons: true,
//       referrals: false,
//       apiAccess: false,
//       multipleUsers: true,
//       customDomain: false,
//     },
//     pro: {
//       ecommerce: true,
//       booking: true,
//       whatsappBot: true,
//       analytics: true,
//       coupons: true,
//       referrals: true,
//       apiAccess: true,
//       multipleUsers: true,
//       customDomain: false,
//     },
//     enterprise: {
//       ecommerce: true,
//       booking: true,
//       whatsappBot: true,
//       analytics: true,
//       coupons: true,
//       referrals: true,
//       apiAccess: true,
//       multipleUsers: true,
//       customDomain: true,
//     },
//   };
  
//   const features = baseFeatures[plan] || baseFeatures.free;
  
//   // Override based on service type
//   if (serviceType === 'ecommerce') {
//     features.booking = false;
//   } else if (serviceType === 'booking') {
//     features.ecommerce = false;
//   }
  
//   return features;
// };

// // Format company response with WhatsApp fields and catalog info
// const formatCompanyResponse = (company) => {
//   const companyObj = company.toObject ? company.toObject() : company;
  
//   // Get all WhatsApp numbers
//   const whatsappNumbers = [];
  
//   // Add primary WhatsApp number if exists
//   if (companyObj.whatsapp?.phoneNumber) {
//     whatsappNumbers.push({
//       number: companyObj.whatsapp.phoneNumber,
//       type: 'primary',
//       isConnected: companyObj.whatsapp.isConnected || false,
//       status: companyObj.whatsapp.connectionStatus || 'disconnected'
//     });
//   }
  
//   // Add routing numbers if they exist
//   if (companyObj.whatsappRouting?.phoneNumbers?.length > 0) {
//     companyObj.whatsappRouting.phoneNumbers.forEach(p => {
//       if (p.isActive) {
//         whatsappNumbers.push({
//           number: p.number,
//           type: p.isPrimary ? 'routing_primary' : 'routing',
//           isPrimary: p.isPrimary || false,
//           isActive: p.isActive,
//           description: p.description,
//           verifiedAt: p.verifiedAt?.toISOString()
//         });
//       }
//     });
//   }
  
//   return {
//     ...companyObj,
//     id: companyObj._id.toString(),
//     _id: companyObj._id.toString(),
//     fullAddress: company.fullAddress,
//     isSubscriptionValid: company.isSubscriptionValid,
//     daysUntilExpiry: company.daysUntilExpiry,
    
//     // ✅ NEW: Catalog fields
//     slug: companyObj.slug,
//     catalogWhatsapp: companyObj.catalogWhatsapp,
//     catalogLink: company.catalogLink,
    
//     // ✅ NEW: Service type fields
//     serviceType: companyObj.serviceType,
//     serviceConfig: company.getServiceConfig ? company.getServiceConfig() : {
//       type: companyObj.serviceType,
//       isEcommerce: companyObj.serviceType === 'ecommerce' || companyObj.serviceType === 'both',
//       isBooking: companyObj.serviceType === 'booking' || companyObj.serviceType === 'both',
//       enabledModules: companyObj.serviceType === 'ecommerce' ? ['ecommerce'] : 
//                       companyObj.serviceType === 'booking' ? ['booking'] : 
//                       ['ecommerce', 'booking']
//     },
    
//     // WhatsApp fields
//     whatsapp: companyObj.whatsapp ? {
//       isConnected: companyObj.whatsapp.isConnected || false,
//       connectionStatus: companyObj.whatsapp.connectionStatus || 'disconnected',
//       phoneNumber: companyObj.whatsapp.phoneNumber,
//       clientId: companyObj.whatsapp.clientId,
//       connectedAt: companyObj.whatsapp.connectedAt?.toISOString(),
//       lastMessageAt: companyObj.whatsapp.lastMessageAt?.toISOString(),
//       lastError: companyObj.whatsapp.lastError,
//       deviceInfo: companyObj.whatsapp.deviceInfo
//     } : null,
    
//     whatsappNumbers,
//     totalWhatsAppNumbers: whatsappNumbers.length,
//     hasActiveWhatsApp: whatsappNumbers.length > 0,
    
//     createdAt: companyObj.createdAt?.toISOString(),
//     updatedAt: companyObj.updatedAt?.toISOString(),
//     verifiedAt: companyObj.verifiedAt?.toISOString(),
//     suspendedAt: companyObj.suspendedAt?.toISOString(),
//     deletedAt: companyObj.deletedAt?.toISOString(),
//   };
// };

// // ========== OPTIONS HANDLER ==========
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: {
//       ...securityHeaders,
//       ...corsHeaders,
//       'Allow': 'GET, POST, PUT, DELETE, OPTIONS',
//     },
//   });
// }

// // ========== GET HANDLER - List all companies (Super Admin only) ==========
// export async function GET(request) {
//   try {
//     console.log('🏢 [COMPANIES API] GET request received');

//     // Check authentication and super admin role
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Authentication required',
//           code: 'UNAUTHORIZED',
//         },
//         {
//           status: 401,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Check if user is super admin
//     const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
//     if (!isSuperAdmin) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Super admin access required',
//           code: 'FORBIDDEN',
//         },
//         {
//           status: 403,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     await connectDB();

//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
//     const search = searchParams.get('search') || '';
//     const status = searchParams.get('status') || 'all';
//     const plan = searchParams.get('plan') || 'all';
//     const serviceType = searchParams.get('serviceType') || 'all'; // ✅ NEW: Filter by service type
//     const whatsappConnected = searchParams.get('whatsappConnected'); // 'true' or 'false'
//     const hasWhatsapp = searchParams.get('hasWhatsapp'); // 'true' or 'false'
//     const sortBy = searchParams.get('sortBy') || 'createdAt';
//     const sortOrder = searchParams.get('sortOrder') || 'desc';
//     const includeDeleted = searchParams.get('includeDeleted') === 'true';

//     const skip = (page - 1) * limit;

//     // Build query
//     let query = {};
    
//     if (!includeDeleted) {
//       query.deletedAt = null;
//     }

//     if (status !== 'all') {
//       query.status = status;
//     }

//     if (plan !== 'all') {
//       query['subscription.plan'] = plan;
//     }

//     // ✅ NEW: Filter by service type
//     if (serviceType !== 'all') {
//       query.serviceType = serviceType;
//     }

//     // WhatsApp filters
//     if (whatsappConnected === 'true') {
//       query['whatsapp.isConnected'] = true;
//       query['whatsapp.connectionStatus'] = 'connected';
//     } else if (whatsappConnected === 'false') {
//       query['whatsapp.isConnected'] = false;
//     }

//     if (hasWhatsapp === 'true') {
//       query.$or = [
//         { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
//         { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
//       ];
//     }

//     if (search) {
//       query.$or = [
//         { companyName: { $regex: search, $options: 'i' } },
//         { companyEmail: { $regex: search, $options: 'i' } },
//         { companyPhone: { $regex: search, $options: 'i' } },
//         { slug: { $regex: search, $options: 'i' } },
//         { serviceType: { $regex: search, $options: 'i' } }, // ✅ NEW: Search by service type
//         { 'whatsapp.phoneNumber': { $regex: search, $options: 'i' } },
//         { 'whatsappRouting.phoneNumbers.number': { $regex: search, $options: 'i' } },
//         { 'address.city': { $regex: search, $options: 'i' } },
//         { 'address.state': { $regex: search, $options: 'i' } },
//       ];
//     }

//     // Build sort
//     const sort = {};
//     sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

//     // Execute queries
//     const [companies, total, stats, serviceTypeStats] = await Promise.all([
//       Company.find(query)
//         .sort(sort)
//         .skip(skip)
//         .limit(limit)
//         .populate('createdBy', 'fullName email')
//         .populate('updatedBy', 'fullName email')
//         .populate('verifiedBy', 'fullName email')
//         .lean(),
//       Company.countDocuments(query),
//       Company.getStats(),
//       Company.getServiceTypeStats(), // ✅ NEW: Get service type statistics
//     ]);

//     // Format companies with WhatsApp info
//     const formattedCompanies = companies.map(company => formatCompanyResponse(company));

//     // Get WhatsApp stats
//     const whatsappStats = {
//       total: await Company.countDocuments({ 
//         $or: [
//           { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
//           { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
//         ],
//         deletedAt: null 
//       }),
//       connected: await Company.countDocuments({ 
//         'whatsapp.isConnected': true, 
//         'whatsapp.connectionStatus': 'connected',
//         deletedAt: null 
//       }),
//       disconnected: await Company.countDocuments({ 
//         'whatsapp.isConnected': false,
//         $or: [
//           { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
//           { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
//         ],
//         deletedAt: null 
//       })
//     };

//     console.log('✅ [COMPANIES API] GET successful:', {
//       count: formattedCompanies.length,
//       total,
//       page,
//       whatsappConnected: whatsappStats.connected,
//       serviceTypeStats
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         data: formattedCompanies,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit),
//           hasNext: page < Math.ceil(total / limit),
//           hasPrev: page > 1,
//         },
//         stats: {
//           ...stats,
//           whatsapp: whatsappStats,
//           serviceTypes: serviceTypeStats // ✅ NEW: Include service type stats
//         },
//         filters: {
//           applied: {
//             search: search || null,
//             status: status !== 'all' ? status : null,
//             plan: plan !== 'all' ? plan : null,
//             serviceType: serviceType !== 'all' ? serviceType : null, // ✅ NEW
//             whatsappConnected: whatsappConnected || null,
//             hasWhatsapp: hasWhatsapp || null,
//             includeDeleted,
//           },
//         },
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 200,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   } catch (error) {
//     console.error('❌ [COMPANIES API] GET error:', {
//       message: error.message,
//       stack: error.stack,
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to fetch companies',
//         code: 'FETCH_FAILED',
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   }
// }

// // ========== POST HANDLER - Create new company with admin user ==========
// export async function POST(request) {
//   const startTime = Date.now();
  
//   try {
//     console.log('🏢 [COMPANIES API] POST request received');

//     // Check authentication and super admin role
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Authentication required',
//           code: 'UNAUTHORIZED',
//         },
//         {
//           status: 401,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Check if user is super admin
//     const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
//     if (!isSuperAdmin) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Super admin access required to create companies',
//           code: 'FORBIDDEN',
//         },
//         {
//           status: 403,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Apply rate limiting
//     try {
//       await createLimiter.check(10, session.user.id); // 10 creations per hour per super admin
//     } catch (rateLimitError) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Too many company creation attempts. Please try again later.',
//           code: 'RATE_LIMIT_EXCEEDED',
//           retryAfter: '1 hour',
//         },
//         {
//           status: 429,
//           headers: {
//             ...securityHeaders,
//             ...corsHeaders,
//             'Retry-After': '3600',
//           },
//         }
//       );
//     }

//     // Parse request body
//     let body;
//     try {
//       body = await request.json();
//     } catch (error) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Invalid JSON data in request',
//           code: 'INVALID_JSON',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // ===== VALIDATE COMPANY DATA =====
//     const errors = {};

//     // Company details validation
//     if (!body.companyName?.trim()) {
//       errors.companyName = 'Company name is required';
//     }

//     if (!body.companyEmail?.trim()) {
//       errors.companyEmail = 'Company email is required';
//     } else if (!validateEmail(body.companyEmail)) {
//       errors.companyEmail = 'Invalid email format';
//     }

//     if (!body.companyPhone?.trim()) {
//       errors.companyPhone = 'Company phone is required';
//     } else if (!validatePhone(body.companyPhone)) {
//       errors.companyPhone = 'Phone must be 10-12 digits';
//     }

//     // ✅ NEW: Service type validation
//     let finalServiceType = body.serviceType || 'both';
//     if (!validateServiceType(finalServiceType)) {
//       errors.serviceType = 'Service type must be ecommerce, booking, or both';
//     }

//     // ✅ NEW: Slug validation (auto-generate if not provided)
//     let finalSlug = body.slug;
//     if (!finalSlug && body.companyName) {
//       finalSlug = generateSlug(body.companyName);
//     }
    
//     if (finalSlug && !validateSlug(finalSlug)) {
//       errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
//     }

//     // ✅ NEW: Catalog WhatsApp validation
//     if (body.catalogWhatsapp && !validatePhone(body.catalogWhatsapp)) {
//       errors.catalogWhatsapp = 'Catalog WhatsApp number must be 10-12 digits';
//     }

//     // WhatsApp number validation
//     if (body.whatsappNumber && !validatePhone(body.whatsappNumber)) {
//       errors.whatsappNumber = 'WhatsApp number must be 10-12 digits';
//     }

//     // Additional WhatsApp numbers validation
//     if (body.additionalWhatsAppNumbers?.length > 0) {
//       body.additionalWhatsAppNumbers.forEach((num, index) => {
//         if (!validatePhone(num.number)) {
//           errors[`additionalWhatsAppNumbers[${index}].number`] = 'Invalid WhatsApp number format';
//         }
//       });
//     }

//     // Address validation
//     if (!body.address?.street?.trim()) {
//       errors['address.street'] = 'Street address is required';
//     }
//     if (!body.address?.city?.trim()) {
//       errors['address.city'] = 'City is required';
//     }
//     if (!body.address?.state?.trim()) {
//       errors['address.state'] = 'State is required';
//     }
//     if (!body.address?.pincode?.trim()) {
//       errors['address.pincode'] = 'Pincode is required';
//     } else if (!validatePincode(body.address.pincode)) {
//       errors['address.pincode'] = 'Pincode must be 6 digits';
//     }

//     // Admin user validation
//     if (!body.adminName?.trim()) {
//       errors.adminName = 'Admin name is required';
//     }

//     if (!body.adminEmail?.trim()) {
//       errors.adminEmail = 'Admin email is required';
//     } else if (!validateEmail(body.adminEmail)) {
//       errors.adminEmail = 'Invalid admin email format';
//     }

//     if (!body.adminPassword?.trim()) {
//       errors.adminPassword = 'Admin password is required';
//     } else if (!validatePassword(body.adminPassword)) {
//       errors.adminPassword = 'Password must be at least 6 characters';
//     }

//     if (!body.adminPhone?.trim()) {
//       errors.adminPhone = 'Admin phone is required';
//     } else if (!validatePhone(body.adminPhone)) {
//       errors.adminPhone = 'Admin phone must be 10-12 digits';
//     }

//     // Return validation errors if any
//     if (Object.keys(errors).length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Validation failed',
//           code: 'VALIDATION_FAILED',
//           errors,
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     await connectDB();

//     // Check for existing company with same email/name/slug
//     const existingCompany = await Company.findOne({
//       $or: [
//         { companyEmail: body.companyEmail.toLowerCase().trim() },
//         { companyName: body.companyName.trim() },
//         { slug: finalSlug }
//       ],
//     });

//     if (existingCompany) {
//       let field = '';
//       if (existingCompany.companyEmail === body.companyEmail.toLowerCase().trim()) {
//         field = 'companyEmail';
//       } else if (existingCompany.companyName === body.companyName.trim()) {
//         field = 'companyName';
//       } else if (existingCompany.slug === finalSlug) {
//         field = 'slug';
//       }
      
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Company with this ${field === 'companyEmail' ? 'email' : field === 'companyName' ? 'name' : 'slug'} already exists`,
//           code: 'COMPANY_EXISTS',
//           field,
//         },
//         {
//           status: 409,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Check for existing admin user with same email
//     const existingUser = await User.findOne({
//       email: body.adminEmail.toLowerCase().trim(),
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Admin user with this email already exists',
//           code: 'ADMIN_EXISTS',
//           field: 'adminEmail',
//         },
//         {
//           status: 409,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Start MongoDB session for transaction
//     const dbSession = await mongoose.startSession();
//     dbSession.startTransaction();

//     try {
//       // 1. Create Company with WhatsApp fields, NEW catalog fields, and SERVICE TYPE
//       const plan = body.plan || 'free';
//       const planLimits = getPlanLimits(plan);
//       const planFeatures = getPlanFeatures(plan, finalServiceType); // ✅ Pass service type

//       // Generate client ID for WhatsApp
//       const timestamp = Date.now();
//       const clientId = body.whatsappNumber 
//         ? `company_${timestamp}_${body.whatsappNumber.slice(-4)}` 
//         : null;

//       // ✅ Ensure slug is unique
//       let uniqueSlug = finalSlug;
//       let slugCounter = 1;
//       let slugExists = true;
      
//       while (slugExists) {
//         const existing = await Company.findOne({ slug: uniqueSlug });
//         if (!existing) {
//           slugExists = false;
//         } else {
//           uniqueSlug = `${finalSlug}-${slugCounter}`;
//           slugCounter++;
//         }
//       }

//       const [company] = await Company.create([{
//         companyName: body.companyName.trim(),
//         companyEmail: body.companyEmail.toLowerCase().trim(),
//         companyPhone: body.companyPhone.replace(/\D/g, ''),
        
//         // ✅ NEW: Catalog fields
//         slug: uniqueSlug,
//         catalogWhatsapp: body.catalogWhatsapp ? body.catalogWhatsapp.replace(/\D/g, '') : null,
        
//         // ✅ NEW: Service type field (CRITICAL)
//         serviceType: finalServiceType,
//         serviceTypeChangedAt: new Date(),
//         serviceTypeChangedBy: session.user.id,
        
//         // WhatsApp configuration
//         whatsapp: {
//           phoneNumber: body.whatsappNumber ? body.whatsappNumber.replace(/\D/g, '') : null,
//           isConnected: false,
//           connectionStatus: 'pending',
//           clientId: clientId,
//           maxReconnectAttempts: 5,
//           reconnectAttempts: 0,
//           errorCount: 0
//         },
        
//         // WhatsApp routing numbers
//         whatsappRouting: {
//           phoneNumbers: body.additionalWhatsAppNumbers?.map((num, index) => ({
//             number: num.number.replace(/\D/g, ''),
//             isPrimary: num.isPrimary || false,
//             isActive: true,
//             description: num.description || `WhatsApp number ${index + 1}`,
//             verifiedAt: new Date()
//           })) || [],
//           autoResponse: {
//             enabled: false,
//             workingHours: {
//               enabled: false,
//               timezone: 'Asia/Kolkata'
//             }
//           },
//           fallback: {
//             enabled: true
//           }
//         },
        
//         address: {
//           street: body.address.street.trim(),
//           city: body.address.city.trim(),
//           state: body.address.state.trim(),
//           pincode: body.address.pincode.trim(),
//           country: body.address.country || 'India',
//         },
//         gstin: body.gstin?.toUpperCase().trim(),
//         pan: body.pan?.toUpperCase().trim(),
//         subscription: {
//           plan,
//           status: 'active',
//           startDate: new Date(),
//           expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
//           autoRenew: body.autoRenew !== false,
//           paymentMethod: body.paymentMethod || 'monthly',
//         },
//         limits: planLimits,
//         features: planFeatures,
//         status: 'active',
//         isVerified: true,
//         verifiedAt: new Date(),
//         verifiedBy: session.user.id,
//         createdBy: session.user.id,
//         notes: body.notes || '',
//         tags: body.tags || [],
        
//         // Initialize stats
//         stats: {
//           totalUsers: 0,
//           totalProducts: 0,
//           totalOrders: 0,
//           totalBookings: 0,
//           totalRevenue: 0,
//           whatsapp: {
//             totalMessages: 0,
//             totalConversations: 0,
//             totalCustomers: 0,
//             messagesToday: 0,
//             lastResetAt: new Date()
//           }
//         }
//       }], { session: dbSession });

//       const companyId = company._id;

//       // 2. Create Company Settings
//       await CompanySettings.create([{
//         companyId,
//         companyName: body.companyName.trim(),
//         phone: body.companyPhone.replace(/\D/g, ''),
//         email: body.companyEmail.toLowerCase().trim(),
//         address: body.address.street.trim(),
//         city: body.address.city.trim(),
//         state: body.address.state.trim(),
//         pincode: body.address.pincode.trim(),
//         country: body.address.country || 'India',
//         createdBy: session.user.id,
//         orderFlowMode: 'short',
        
//         // Initialize payment settings
//         upiIds: body.whatsappNumber ? [{
//           id: `${body.whatsappNumber.replace(/\D/g, '').slice(-10)}@okhdfcbank`,
//           name: 'Primary UPI',
//           appType: 'other',
//           isActive: true,
//           description: 'Auto-generated UPI ID',
//           createdAt: new Date()
//         }] : [],
        
//         paymentSettings: {
//           preferredMethod: 'upi',
//           allowPartialPayments: false,
//           autoVerifyEnabled: true,
//           minConfidenceForAuto: 85,
//           paymentTimeout: 30,
//           requireTransactionId: true,
//           allowMultiplePaymentMethods: true
//         }
//       }], { session: dbSession });

//       // 3. Create Admin User
//       const hashedPassword = await bcrypt.hash(body.adminPassword, 12);

//       const [adminUser] = await User.create([{
//         fullName: body.adminName.trim(),
//         email: body.adminEmail.toLowerCase().trim(),
//         phone: body.adminPhone.replace(/\D/g, ''),
//         password: hashedPassword,
//         role: 'admin',
//         adminType: 'company',
//         companyId,
//         isVerified: true,
//         status: 'active',
//         emailVerifiedAt: new Date(),
//         createdBy: session.user.id,
//         notificationSettings: {
//           pushNotifications: { enabled: true, lastUpdated: new Date() },
//           notificationTypes: {
//             newOrders: { enabled: true, priority: 'high', sound: true },
//             payments: { enabled: true, priority: 'high', sound: true },
//             lowStock: { enabled: true, priority: 'normal', sound: true },
//             systemAlerts: { enabled: true, priority: 'high', sound: true },
//             orderUpdates: { enabled: true, priority: 'normal', sound: true }
//           },
//           settingsUpdatedAt: new Date(),
//         },
//       }], { session: dbSession });

//       // 4. Initialize Counters for the company
//       if (typeof Counter.initializeCompanyCounters === 'function') {
//         await Counter.initializeCompanyCounters(companyId, adminUser._id);
//         console.log('✅ Counters initialized for company:', companyId);
//       } else {
//         console.log('⚠️ Counter.initializeCompanyCounters not available - counters will be created on-demand');
//       }

//       // Update company with createdBy as the admin user
//       company.createdBy = adminUser._id;
//       await company.save({ session: dbSession });

//       await dbSession.commitTransaction();

//       console.log('✅ [COMPANIES API] Company created successfully:', {
//         companyId: companyId.toString(),
//         companyName: company.companyName,
//         slug: company.slug,
//         serviceType: company.serviceType, // ✅ NEW: Log service type
//         catalogWhatsapp: company.catalogWhatsapp,
//         adminEmail: adminUser.email,
//         plan,
//         whatsappNumber: body.whatsappNumber || 'Not provided',
//         additionalNumbers: body.additionalWhatsAppNumbers?.length || 0
//       });

//       // Populate company for response
//       const populatedCompany = await Company.findById(companyId)
//         .populate('createdBy', 'fullName email')
//         .populate('verifiedBy', 'fullName email')
//         .lean();

//       const processingTime = Date.now() - startTime;

//       // Format WhatsApp numbers for response
//       const whatsappNumbers = [];
//       if (body.whatsappNumber) {
//         whatsappNumbers.push({
//           number: body.whatsappNumber,
//           type: 'primary',
//           isPrimary: true
//         });
//       }
//       if (body.additionalWhatsAppNumbers) {
//         whatsappNumbers.push(...body.additionalWhatsAppNumbers);
//       }

//       return NextResponse.json(
//         {
//           success: true,
//           message: 'Company created successfully',
//           data: {
//             company: formatCompanyResponse(populatedCompany),
//             admin: {
//               id: adminUser._id.toString(),
//               name: adminUser.fullName,
//               email: adminUser.email,
//               phone: adminUser.phone,
//             },
//             whatsapp: {
//               primaryNumber: body.whatsappNumber,
//               additionalNumbers: body.additionalWhatsAppNumbers || [],
//               clientId: clientId,
//               totalNumbers: whatsappNumbers.length
//             },
//             // ✅ NEW: Service type info
//             serviceType: {
//               type: company.serviceType,
//               description: company.serviceType === 'ecommerce' ? 'E-Commerce Only' :
//                           company.serviceType === 'booking' ? 'Booking Service Only' :
//                           'Both E-Commerce and Booking Services',
//               features: planFeatures
//             },
//             // ✅ NEW: Catalog info
//             catalog: {
//               slug: company.slug,
//               link: company.catalogLink,
//               whatsapp: company.catalogWhatsapp
//             }
//           },
//           metadata: {
//             processingTime,
//             plan,
//             serviceType: company.serviceType
//           },
//           timestamp: new Date().toISOString(),
//         },
//         {
//           status: 201,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     } catch (transactionError) {
//       await dbSession.abortTransaction();
//       throw transactionError;
//     } finally {
//       dbSession.endSession();
//     }
//   } catch (error) {
//     console.error('❌ [COMPANIES API] POST error:', {
//       message: error.message,
//       stack: error.stack,
//     });

//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Duplicate value for ${field}`,
//           code: 'DUPLICATE_KEY',
//           field,
//         },
//         {
//           status: 409,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errors = {};
//       for (let field in error.errors) {
//         errors[field] = error.errors[field].message;
//       }
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Validation failed',
//           code: 'VALIDATION_FAILED',
//           errors,
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to create company',
//         code: 'CREATE_FAILED',
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   }
// }

// // ========== PUT HANDLER - Bulk operations ==========
// export async function PUT(request) {
//   try {
//     console.log('🏢 [COMPANIES API] PUT request received');

//     // Check authentication and super admin role
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Authentication required',
//           code: 'UNAUTHORIZED',
//         },
//         {
//           status: 401,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
//     if (!isSuperAdmin) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Super admin access required',
//           code: 'FORBIDDEN',
//         },
//         {
//           status: 403,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     await connectDB();

//     const body = await request.json();
//     const { action, companyIds, data } = body;

//     if (!action || !companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Action and company IDs are required',
//           code: 'INVALID_REQUEST',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Validate all company IDs
//     const validIds = companyIds.filter(id => isValidObjectId(id));
    
//     if (validIds.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'No valid company IDs provided',
//           code: 'INVALID_IDS',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     let updateData = {};
//     let result;

//     switch (action) {
//       case 'activate':
//         updateData = {
//           status: 'active',
//           updatedBy: session.user.id,
//           updatedAt: new Date(),
//         };
//         result = await Company.updateMany(
//           { _id: { $in: validIds } },
//           { $set: updateData }
//         );
//         break;

//       case 'suspend':
//         updateData = {
//           status: 'suspended',
//           suspendedAt: new Date(),
//           suspendedBy: session.user.id,
//           updatedBy: session.user.id,
//           updatedAt: new Date(),
//         };
//         result = await Company.updateMany(
//           { _id: { $in: validIds } },
//           { $set: updateData }
//         );
//         break;

//       case 'delete':
//         // Soft delete
//         updateData = {
//           deletedAt: new Date(),
//           deletedBy: session.user.id,
//           status: 'inactive',
//           updatedBy: session.user.id,
//           updatedAt: new Date(),
//         };
//         result = await Company.updateMany(
//           { _id: { $in: validIds } },
//           { $set: updateData }
//         );
//         break;

//       case 'change-plan':
//         if (!data?.plan) {
//           return NextResponse.json(
//             {
//               success: false,
//               message: 'Plan is required for change-plan action',
//               code: 'PLAN_REQUIRED',
//             },
//             { status: 400 }
//           );
//         }

//         // Get current companies to know their service type
//         const companies = await Company.find({ _id: { $in: validIds } }).select('serviceType');
//         const planLimits = getPlanLimits(data.plan);
        
//         // Update each company individually to handle different service types
//         const updatePromises = companies.map(async (company) => {
//           const planFeatures = getPlanFeatures(data.plan, company.serviceType);
//           return Company.updateOne(
//             { _id: company._id },
//             {
//               $set: {
//                 'subscription.plan': data.plan,
//                 limits: planLimits,
//                 features: planFeatures,
//                 updatedBy: session.user.id,
//                 updatedAt: new Date(),
//                 ...(data.expiryDate && { 'subscription.expiryDate': new Date(data.expiryDate) })
//               }
//             }
//           );
//         });
        
//         const updateResults = await Promise.all(updatePromises);
//         result = {
//           matchedCount: updateResults.reduce((sum, r) => sum + (r.matchedCount || 0), 0),
//           modifiedCount: updateResults.reduce((sum, r) => sum + (r.modifiedCount || 0), 0)
//         };
//         break;

//       // ✅ NEW: Update service type
//       case 'change-service-type':
//         if (!data?.serviceType) {
//           return NextResponse.json(
//             {
//               success: false,
//               message: 'Service type is required for change-service-type action',
//               code: 'SERVICE_TYPE_REQUIRED',
//             },
//             { status: 400 }
//           );
//         }
        
//         if (!validateServiceType(data.serviceType)) {
//           return NextResponse.json(
//             {
//               success: false,
//               message: 'Invalid service type. Must be ecommerce, booking, or both',
//               code: 'INVALID_SERVICE_TYPE',
//             },
//             { status: 400 }
//           );
//         }
        
//         const serviceUpdatePromises = validIds.map(async (id) => {
//           const company = await Company.findById(id);
//           if (company) {
//             return company.updateServiceType(data.serviceType, session.user.id, data.reason || 'Updated by super admin');
//           }
//           return null;
//         });
        
//         const serviceResults = await Promise.all(serviceUpdatePromises);
//         result = {
//           matchedCount: serviceResults.filter(r => r !== null).length,
//           modifiedCount: serviceResults.filter(r => r !== null).length
//         };
//         break;

//       // ✅ NEW: Update catalog settings
//       case 'update-catalog':
//         if (data.slug) {
//           if (!validateSlug(data.slug)) {
//             return NextResponse.json(
//               {
//                 success: false,
//                 message: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens',
//                 code: 'INVALID_SLUG',
//               },
//               { status: 400 }
//             );
//           }
//           updateData.slug = data.slug;
//         }
        
//         if (data.catalogWhatsapp) {
//           if (!validatePhone(data.catalogWhatsapp)) {
//             return NextResponse.json(
//               {
//                 success: false,
//                 message: 'Invalid catalog WhatsApp number',
//                 code: 'INVALID_WHATSAPP',
//               },
//               { status: 400 }
//             );
//           }
//           updateData.catalogWhatsapp = data.catalogWhatsapp.replace(/\D/g, '');
//         }
        
//         updateData.updatedBy = session.user.id;
//         updateData.updatedAt = new Date();
        
//         result = await Company.updateMany(
//           { _id: { $in: validIds } },
//           { $set: updateData }
//         );
//         break;

//       // WhatsApp bulk operations
//       case 'disconnect-whatsapp':
//         updateData = {
//           'whatsapp.isConnected': false,
//           'whatsapp.connectionStatus': 'disconnected',
//           'whatsapp.disconnectedAt': new Date(),
//           updatedBy: session.user.id,
//           updatedAt: new Date(),
//         };
//         result = await Company.updateMany(
//           { _id: { $in: validIds } },
//           { $set: updateData }
//         );
//         break;

//       case 'reset-whatsapp':
//         updateData = {
//           'whatsapp.isConnected': false,
//           'whatsapp.connectionStatus': 'pending',
//           'whatsapp.reconnectAttempts': 0,
//           'whatsapp.errorCount': 0,
//           'whatsapp.lastError': null,
//           'whatsapp.disconnectedAt': null,
//           updatedBy: session.user.id,
//           updatedAt: new Date(),
//         };
//         result = await Company.updateMany(
//           { _id: { $in: validIds } },
//           { $set: updateData }
//         );
//         break;

//       default:
//         return NextResponse.json(
//           {
//             success: false,
//             message: 'Invalid action. Supported actions: activate, suspend, delete, change-plan, change-service-type, update-catalog, disconnect-whatsapp, reset-whatsapp',
//             code: 'INVALID_ACTION',
//           },
//           {
//             status: 400,
//             headers: { ...securityHeaders, ...corsHeaders },
//           }
//         );
//     }

//     console.log('✅ [COMPANIES API] Bulk operation successful:', {
//       action,
//       matchedCount: result.matchedCount,
//       modifiedCount: result.modifiedCount,
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: `Successfully performed ${action} on ${result.modifiedCount} companies`,
//         data: {
//           action,
//           matchedCount: result.matchedCount,
//           modifiedCount: result.modifiedCount,
//           companyIds: validIds,
//         },
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 200,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   } catch (error) {
//     console.error('❌ [COMPANIES API] PUT error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to perform bulk operation',
//         code: 'BULK_OPERATION_FAILED',
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   }
// }

// // ========== DELETE HANDLER - Bulk delete (soft delete) ==========
// export async function DELETE(request) {
//   try {
//     console.log('🏢 [COMPANIES API] DELETE request received');

//     // Check authentication and super admin role
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Authentication required',
//           code: 'UNAUTHORIZED',
//         },
//         {
//           status: 401,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
//     if (!isSuperAdmin) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Super admin access required',
//           code: 'FORBIDDEN',
//         },
//         {
//           status: 403,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const ids = searchParams.get('ids');
//     const permanent = searchParams.get('permanent') === 'true';

//     if (!ids) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Company IDs are required',
//           code: 'IDS_REQUIRED',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     const companyIds = ids.split(',').filter(id => id.trim());
//     const validIds = companyIds.filter(id => isValidObjectId(id));

//     if (validIds.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'No valid company IDs provided',
//           code: 'INVALID_IDS',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     await connectDB();

//     if (permanent) {
//       // Permanent delete (use with caution)
//       const result = await Company.deleteMany({ _id: { $in: validIds } });
      
//       console.log('✅ [COMPANIES API] Permanent delete successful:', {
//         deletedCount: result.deletedCount,
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: `Successfully deleted ${result.deletedCount} companies permanently`,
//           data: {
//             deletedCount: result.deletedCount,
//             companyIds: validIds,
//           },
//           timestamp: new Date().toISOString(),
//         },
//         {
//           status: 200,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     } else {
//       // Soft delete
//       const result = await Company.updateMany(
//         { _id: { $in: validIds } },
//         {
//           $set: {
//             deletedAt: new Date(),
//             deletedBy: session.user.id,
//             status: 'inactive',
//             'whatsapp.isConnected': false,
//             'whatsapp.connectionStatus': 'disconnected',
//             updatedBy: session.user.id,
//             updatedAt: new Date(),
//           },
//         }
//       );

//       console.log('✅ [COMPANIES API] Soft delete successful:', {
//         matchedCount: result.matchedCount,
//         modifiedCount: result.modifiedCount,
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: `Successfully deactivated ${result.modifiedCount} companies`,
//           data: {
//             matchedCount: result.matchedCount,
//             modifiedCount: result.modifiedCount,
//             companyIds: validIds,
//           },
//           timestamp: new Date().toISOString(),
//         },
//         {
//           status: 200,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }
//   } catch (error) {
//     console.error('❌ [COMPANIES API] DELETE error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to delete companies',
//         code: 'DELETE_FAILED',
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   }
// }