// // app/api/companies/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';
// import { connectDB } from '@/utils/db';
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

// // Get plan features based on plan name
// const getPlanFeatures = (plan) => {
//   const features = {
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
  
//   return features[plan] || features.free;
// };

// // Format company response
// const formatCompanyResponse = (company) => {
//   const companyObj = company.toObject ? company.toObject() : company;
  
//   return {
//     ...companyObj,
//     id: companyObj._id.toString(),
//     _id: companyObj._id.toString(),
//     fullAddress: company.fullAddress,
//     isSubscriptionValid: company.isSubscriptionValid,
//     daysUntilExpiry: company.daysUntilExpiry,
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

//     if (search) {
//       query.$or = [
//         { companyName: { $regex: search, $options: 'i' } },
//         { companyEmail: { $regex: search, $options: 'i' } },
//         { companyPhone: { $regex: search, $options: 'i' } },
//         { 'address.city': { $regex: search, $options: 'i' } },
//         { 'address.state': { $regex: search, $options: 'i' } },
//       ];
//     }

//     // Build sort
//     const sort = {};
//     sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

//     // Execute queries
//     const [companies, total, stats] = await Promise.all([
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
//     ]);

//     // Format companies
//     const formattedCompanies = companies.map(company => ({
//       ...company,
//       id: company._id.toString(),
//       _id: company._id.toString(),
//       fullAddress: `${company.address?.street || ''}, ${company.address?.city || ''}, ${company.address?.state || ''} - ${company.address?.pincode || ''}`.replace(/^, |, $/g, ''),
//       isSubscriptionValid: company.subscription?.expiryDate 
//         ? new Date(company.subscription.expiryDate) > new Date() 
//         : true,
//       daysUntilExpiry: company.subscription?.expiryDate
//         ? Math.ceil((new Date(company.subscription.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
//         : null,
//     }));

//     console.log('✅ [COMPANIES API] GET successful:', {
//       count: formattedCompanies.length,
//       total,
//       page,
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
//         stats,
//         filters: {
//           applied: {
//             search: search || null,
//             status: status !== 'all' ? status : null,
//             plan: plan !== 'all' ? plan : null,
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

//     // Check for existing company with same email
//     const existingCompany = await Company.findOne({
//       $or: [
//         { companyEmail: body.companyEmail.toLowerCase().trim() },
//         { companyName: body.companyName.trim() },
//       ],
//     });

//     if (existingCompany) {
//       const field = existingCompany.companyEmail === body.companyEmail.toLowerCase().trim() 
//         ? 'companyEmail' 
//         : 'companyName';
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Company with this ${field === 'companyEmail' ? 'email' : 'name'} already exists`,
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
//       // 1. Create Company
//       const plan = body.plan || 'free';
//       const planLimits = getPlanLimits(plan);
//       const planFeatures = getPlanFeatures(plan);

//       const [company] = await Company.create([{
//         companyName: body.companyName.trim(),
//         companyEmail: body.companyEmail.toLowerCase().trim(),
//         companyPhone: body.companyPhone.replace(/\D/g, ''),
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
//           settingsUpdatedAt: new Date(),
//         },
//       }], { session: dbSession });

//       // 4. Initialize Counters for the company - WITH DEFENSIVE CHECK
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
//         adminEmail: adminUser.email,
//         plan,
//       });

//       // Populate company for response
//       const populatedCompany = await Company.findById(companyId)
//         .populate('createdBy', 'fullName email')
//         .populate('verifiedBy', 'fullName email')
//         .lean();

//       const processingTime = Date.now() - startTime;

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
//           },
//           metadata: {
//             processingTime,
//             plan,
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

//         const planLimits = getPlanLimits(data.plan);
//         const planFeatures = getPlanFeatures(data.plan);

//         updateData = {
//           'subscription.plan': data.plan,
//           limits: planLimits,
//           features: planFeatures,
//           updatedBy: session.user.id,
//           updatedAt: new Date(),
//         };

//         if (data.expiryDate) {
//           updateData['subscription.expiryDate'] = new Date(data.expiryDate);
//         }

//         result = await Company.updateMany(
//           { _id: { $in: validIds } },
//           { $set: updateData }
//         );
//         break;

//       default:
//         return NextResponse.json(
//           {
//             success: false,
//             message: 'Invalid action. Supported actions: activate, suspend, delete, change-plan',
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

// Format company response with WhatsApp fields
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

    // Check for existing company with same email/name
    const existingCompany = await Company.findOne({
      $or: [
        { companyEmail: body.companyEmail.toLowerCase().trim() },
        { companyName: body.companyName.trim() },
      ],
    });

    if (existingCompany) {
      const field = existingCompany.companyEmail === body.companyEmail.toLowerCase().trim() 
        ? 'companyEmail' 
        : 'companyName';
      return NextResponse.json(
        {
          success: false,
          message: `Company with this ${field === 'companyEmail' ? 'email' : 'name'} already exists`,
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
      // 1. Create Company with WhatsApp fields
      const plan = body.plan || 'free';
      const planLimits = getPlanLimits(plan);
      const planFeatures = getPlanFeatures(plan);

      // Generate client ID for WhatsApp
      const timestamp = Date.now();
      const clientId = body.whatsappNumber 
        ? `company_${timestamp}_${body.whatsappNumber.slice(-4)}` 
        : null;

      const [company] = await Company.create([{
        companyName: body.companyName.trim(),
        companyEmail: body.companyEmail.toLowerCase().trim(),
        companyPhone: body.companyPhone.replace(/\D/g, ''),
        
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
            message: 'Invalid action. Supported actions: activate, suspend, delete, change-plan, disconnect-whatsapp, reset-whatsapp',
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