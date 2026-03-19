// // app/api/companies/[id]/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';
// import { connectDB } from '@/utils/db';
// import Company from '@/models/Company';
// import User from '@/models/user';
// import CompanySettings from '@/models/CompanySettings';
// import Product from '@/models/Product';
// import Order from '@/models/Order';
// import Bookingmng from '@/models/Bookingmng';
// import mongoose from 'mongoose';

// // ========== CONFIGURATION ==========
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
// export const maxDuration = 30;
// export const revalidate = 0;

// // Security headers
// const securityHeaders = {
//   'X-Content-Type-Options': 'nosniff',
//   'X-Frame-Options': 'DENY',
//   'X-XSS-Protection': '1; mode=block',
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
// };

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
//     ? process.env.FRONTEND_URL || process.env.NEXTAUTH_URL 
//     : 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'GET, PUT, PATCH,DELETE, OPTIONS',
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

// // Get plan limits based on plan name
// const getPlanLimits = (plan) => {
//   const limits = {
//     free: {
//       maxUsers: 3,
//       maxProducts: 100,
//       maxOrdersPerMonth: 100,
//       maxBookingsPerMonth: 100,
//       storageLimit: 512,
//     },
//     basic: {
//       maxUsers: 10,
//       maxProducts: 1000,
//       maxOrdersPerMonth: 500,
//       maxBookingsPerMonth: 500,
//       storageLimit: 2048,
//     },
//     pro: {
//       maxUsers: 50,
//       maxProducts: 5000,
//       maxOrdersPerMonth: 2000,
//       maxBookingsPerMonth: 2000,
//       storageLimit: 10240,
//     },
//     enterprise: {
//       maxUsers: 10000,
//       maxProducts: 100000,
//       maxOrdersPerMonth: 100000,
//       maxBookingsPerMonth: 100000,
//       storageLimit: 102400,
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
//       'Allow': 'GET, PUT, DELETE, OPTIONS',
//     },
//   });
// }

// // ========== GET HANDLER - Get single company by ID ==========
// export async function GET(request, { params }) {
//   try {
//     console.log('🏢 [COMPANY DETAILS API] GET request received for ID:', params.id);

//     // Check authentication
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

//     const { id } = params;

//     // ===== 🔴🔴🔴 FIX: Handle "me" endpoint for company admins =====
//     if (id === 'me') {
//       console.log('🔍 [COMPANY DETAILS API] Fetching current user\'s company');
      
//       // Check if user has a company
//       if (!session.user.companyId) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: 'No company associated with this user',
//             code: 'NO_COMPANY',
//           },
//           {
//             status: 404,
//             headers: { ...securityHeaders, ...corsHeaders },
//           }
//         );
//       }

//       await connectDB();

//       // Get company by ID from session
//       const company = await Company.findById(session.user.companyId)
//         .populate('createdBy', 'fullName email')
//         .populate('updatedBy', 'fullName email')
//         .populate('verifiedBy', 'fullName email')
//         .populate('suspendedBy', 'fullName email')
//         .lean();

//       if (!company) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: 'Company not found',
//             code: 'NOT_FOUND',
//           },
//           {
//             status: 404,
//             headers: { ...securityHeaders, ...corsHeaders },
//           }
//         );
//       }

//       // Format response
//       const formattedCompany = formatCompanyResponse(company);

//       console.log('✅ [COMPANY DETAILS API] GET successful for "me":', {
//         companyId: session.user.companyId,
//         companyName: company.companyName,
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           data: {
//             company: formattedCompany,
//           },
//           timestamp: new Date().toISOString(),
//         },
//         {
//           status: 200,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // ===== FOR ANY OTHER ID, REQUIRE SUPER ADMIN =====
//     const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
//     if (!isSuperAdmin) {
//       console.log(`⛔ [COMPANY DETAILS API] Access denied for non-super admin to ID: ${id}`);
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

//     // Validate ID format
//     if (!isValidObjectId(id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Invalid company ID format',
//           code: 'INVALID_ID',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     await connectDB();

//     // Get company with populated fields
//     const company = await Company.findById(id)
//       .populate('createdBy', 'fullName email')
//       .populate('updatedBy', 'fullName email')
//       .populate('verifiedBy', 'fullName email')
//       .populate('suspendedBy', 'fullName email')
//       .lean();

//     if (!company) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Company not found',
//           code: 'NOT_FOUND',
//         },
//         {
//           status: 404,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Get additional stats
//     const [
//       totalUsers,
//       totalProducts,
//       totalOrders,
//       totalBookings,
//       settings,
//       recentActivity
//     ] = await Promise.all([
//       User.countDocuments({ companyId: id, deletedAt: null }),
//       Product.countDocuments({ companyId: id, deletedAt: null }),
//       Order.countDocuments({ companyId: id, deletedAt: null }),
//       Bookingmng.countDocuments({ companyId: id, deletedAt: null }),
//       CompanySettings.findOne({ companyId: id }).lean(),
//       User.find({ companyId: id, lastSeen: { $exists: true } })
//         .sort({ lastSeen: -1 })
//         .limit(5)
//         .select('fullName email lastSeen role')
//         .lean(),
//     ]);

//     // Get recent orders
//     const recentOrders = await Order.find({ companyId: id, deletedAt: null })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select('orderNumber customerName totalPrice status createdAt')
//       .lean();

//     // Calculate usage percentages
//     const usage = {
//       users: {
//         current: totalUsers,
//         limit: company.limits?.maxUsers || 5,
//         percentage: company.limits?.maxUsers 
//           ? Math.round((totalUsers / company.limits.maxUsers) * 100) 
//           : 0,
//       },
//       products: {
//         current: totalProducts,
//         limit: company.limits?.maxProducts || 500,
//         percentage: company.limits?.maxProducts 
//           ? Math.round((totalProducts / company.limits.maxProducts) * 100) 
//           : 0,
//       },
//       orders: {
//         current: totalOrders,
//         limit: company.limits?.maxOrdersPerMonth || 1000,
//         percentage: company.limits?.maxOrdersPerMonth 
//           ? Math.round((totalOrders / company.limits.maxOrdersPerMonth) * 100) 
//           : 0,
//       },
//       bookings: {
//         current: totalBookings,
//         limit: company.limits?.maxBookingsPerMonth || 300,
//         percentage: company.limits?.maxBookingsPerMonth 
//           ? Math.round((totalBookings / company.limits.maxBookingsPerMonth) * 100) 
//           : 0,
//       },
//     };

//     // Format response
//     const formattedCompany = formatCompanyResponse(company);

//     console.log('✅ [COMPANY DETAILS API] GET successful:', {
//       companyId: id,
//       companyName: company.companyName,
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         data: {
//           company: formattedCompany,
//           stats: {
//             totalUsers,
//             totalProducts,
//             totalOrders,
//             totalBookings,
//             usage,
//           },
//           settings: settings || null,
//           recentActivity: {
//             users: recentActivity,
//             orders: recentOrders,
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
//     console.error('❌ [COMPANY DETAILS API] GET error:', {
//       message: error.message,
//       stack: error.stack,
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to fetch company details',
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
// // ========== PUT HANDLER - Update company ==========
// export async function PUT(request, { params }) {
//   try {
//     console.log('🏢 [COMPANY DETAILS API] PUT request received for ID:', params.id);

//     // Check authentication
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

//     const { id } = params;

//     // Validate ID
//     if (!isValidObjectId(id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Invalid company ID format',
//           code: 'INVALID_ID',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
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

//     await connectDB();

//     // Check if company exists
//     const existingCompany = await Company.findById(id);
    
//     if (!existingCompany) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Company not found',
//           code: 'NOT_FOUND',
//         },
//         {
//           status: 404,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Validate input data
//     const errors = {};

//     if (body.companyName !== undefined && !body.companyName?.trim()) {
//       errors.companyName = 'Company name cannot be empty';
//     }

//     if (body.companyEmail !== undefined) {
//       if (!body.companyEmail?.trim()) {
//         errors.companyEmail = 'Company email cannot be empty';
//       } else if (!validateEmail(body.companyEmail)) {
//         errors.companyEmail = 'Invalid email format';
//       }
//     }

//     if (body.companyPhone !== undefined) {
//       if (!body.companyPhone?.trim()) {
//         errors.companyPhone = 'Company phone cannot be empty';
//       } else if (!validatePhone(body.companyPhone)) {
//         errors.companyPhone = 'Phone must be 10-12 digits';
//       }
//     }

//     if (body.address?.pincode !== undefined && !validatePincode(body.address.pincode)) {
//       errors['address.pincode'] = 'Pincode must be 6 digits';
//     }

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

//     // Check for duplicate email/name if updating
//     if (body.companyEmail || body.companyName) {
//       const duplicateQuery = { _id: { $ne: id } };
      
//       if (body.companyEmail) {
//         duplicateQuery.companyEmail = body.companyEmail.toLowerCase().trim();
//       }
//       if (body.companyName) {
//         duplicateQuery.companyName = body.companyName.trim();
//       }

//       const existing = await Company.findOne(duplicateQuery);
      
//       if (existing) {
//         const field = existing.companyEmail === body.companyEmail?.toLowerCase().trim() 
//           ? 'companyEmail' 
//           : 'companyName';
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Company with this ${field === 'companyEmail' ? 'email' : 'name'} already exists`,
//             code: 'DUPLICATE_ENTRY',
//             field,
//           },
//           {
//             status: 409,
//             headers: { ...securityHeaders, ...corsHeaders },
//           }
//         );
//       }
//     }

//     // Handle plan change if requested
//     if (body.plan && body.plan !== existingCompany.subscription?.plan) {
//       const planLimits = getPlanLimits(body.plan);
//       const planFeatures = getPlanFeatures(body.plan);
      
//       body.limits = planLimits;
//       body.features = planFeatures;
//       body['subscription.plan'] = body.plan;
//       delete body.plan;
//     }

//     // Prepare update data
//     const updateData = {
//       ...body,
//       updatedBy: session.user.id,
//       updatedAt: new Date(),
//     };

//     // Update company
//     const updatedCompany = await Company.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { 
//         new: true,
//         runValidators: true,
//       }
//     ).populate('updatedBy', 'fullName email');

//     // Update company settings if basic info changed
//     if (body.companyName || body.companyPhone || body.companyEmail || body.address) {
//       const settingsUpdate = {};
//       if (body.companyName) settingsUpdate.companyName = body.companyName;
//       if (body.companyPhone) settingsUpdate.phone = body.companyPhone;
//       if (body.companyEmail) settingsUpdate.email = body.companyEmail;
//       if (body.address) {
//         settingsUpdate.address = body.address.street;
//         settingsUpdate.city = body.address.city;
//         settingsUpdate.state = body.address.state;
//         settingsUpdate.pincode = body.address.pincode;
//         settingsUpdate.country = body.address.country;
//       }
      
//       await CompanySettings.updateOne(
//         { companyId: id },
//         { $set: settingsUpdate }
//       );
//     }

//     console.log('✅ [COMPANY DETAILS API] PUT successful:', {
//       companyId: id,
//       companyName: updatedCompany.companyName,
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: 'Company updated successfully',
//         data: formatCompanyResponse(updatedCompany),
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 200,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   } catch (error) {
//     console.error('❌ [COMPANY DETAILS API] PUT error:', {
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
//         message: 'Failed to update company',
//         code: 'UPDATE_FAILED',
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: 500,
//         headers: { ...securityHeaders, ...corsHeaders },
//       }
//     );
//   }
// }
// // ========== PATCH HANDLER - Update WhatsApp status (for bot) ==========
// export async function PATCH(request, { params }) {
//   try {
//     console.log('📱 [COMPANY API] PATCH WhatsApp status for ID:', params.id);

//     // Parse request body
//     const body = await request.json();
//     const { action, status, data } = body; // action: 'whatsapp-status'
    
//     if (action !== 'whatsapp-status') {
//       return NextResponse.json({
//         success: false,
//         message: 'Invalid action',
//         code: 'INVALID_ACTION'
//       }, { status: 400 });
//     }

//     await connectDB();
    
//     const company = await Company.findById(params.id);
//     if (!company) {
//       return NextResponse.json({
//         success: false,
//         message: 'Company not found'
//       }, { status: 404 });
//     }

//     // Use the model's built-in method
//     await company.updateWhatsAppStatus(status, data);

//     return NextResponse.json({
//       success: true,
//       message: 'WhatsApp status updated',
//       data: {
//         companyId: company._id,
//         whatsapp: company.whatsapp
//       }
//     });

//   } catch (error) {
//     console.error('❌ [COMPANY API] PATCH error:', error);
//     return NextResponse.json({
//       success: false,
//       message: error.message
//     }, { status: 500 });
//   }
// }

// // ========== DELETE HANDLER - Delete company ==========
// export async function DELETE(request, { params }) {
//   try {
//     console.log('🏢 [COMPANY DETAILS API] DELETE request received for ID:', params.id);

//     // Check authentication
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

//     const { id } = params;
//     const { searchParams } = new URL(request.url);
//     const permanent = searchParams.get('permanent') === 'true';

//     // Validate ID
//     if (!isValidObjectId(id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Invalid company ID format',
//           code: 'INVALID_ID',
//         },
//         {
//           status: 400,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     await connectDB();

//     // Check if company exists
//     const company = await Company.findById(id);
    
//     if (!company) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Company not found',
//           code: 'NOT_FOUND',
//         },
//         {
//           status: 404,
//           headers: { ...securityHeaders, ...corsHeaders },
//         }
//       );
//     }

//     // Check if company has active data before permanent delete
//     if (permanent) {
//       const [
//         hasUsers,
//         hasProducts,
//         hasOrders,
//         hasBookings
//       ] = await Promise.all([
//         User.exists({ companyId: id }),
//         Product.exists({ companyId: id }),
//         Order.exists({ companyId: id }),
//         Bookingmng.exists({ companyId: id }),
//       ]);

//       if (hasUsers || hasProducts || hasOrders || hasBookings) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: 'Cannot permanently delete company with active data. Soft delete instead.',
//             code: 'HAS_ACTIVE_DATA',
//             data: {
//               hasUsers: !!hasUsers,
//               hasProducts: !!hasProducts,
//               hasOrders: !!hasOrders,
//               hasBookings: !!hasBookings,
//             },
//           },
//           {
//             status: 409,
//             headers: { ...securityHeaders, ...corsHeaders },
//           }
//         );
//       }

//       // Permanent delete
//       await Company.findByIdAndDelete(id);
//       await CompanySettings.deleteOne({ companyId: id });
      
//       console.log('✅ [COMPANY DETAILS API] Permanent delete successful:', {
//         companyId: id,
//         companyName: company.companyName,
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: 'Company permanently deleted',
//           data: {
//             id,
//             companyName: company.companyName,
//             permanent: true,
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
//       await company.softDelete(session.user.id);
      
//       // Also soft delete all users under this company
//       await User.updateMany(
//         { companyId: id },
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

//       console.log('✅ [COMPANY DETAILS API] Soft delete successful:', {
//         companyId: id,
//         companyName: company.companyName,
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: 'Company deactivated successfully',
//           data: {
//             id,
//             companyName: company.companyName,
//             permanent: false,
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
//     console.error('❌ [COMPANY DETAILS API] DELETE error:', {
//       message: error.message,
//       stack: error.stack,
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to delete company',
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





















// app/api/companies/[id]/route.js
// PROFESSIONAL COMPANY DETAILS API - Full WhatsApp multi-tenant support
// Handles: Get, Update, Patch (WhatsApp status), Delete company

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { connectDB } from '@/utils/db';
import Company from '@/models/Company';
import User from '@/models/user';
import CompanySettings from '@/models/CompanySettings';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Bookingmng from '@/models/Bookingmng';
import mongoose from 'mongoose';

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || process.env.NEXTAUTH_URL 
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, PUT, PATCH, DELETE, OPTIONS',
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

// Get plan limits based on plan name
const getPlanLimits = (plan) => {
  const limits = {
    free: {
      maxUsers: 3,
      maxProducts: 100,
      maxOrdersPerMonth: 100,
      maxBookingsPerMonth: 100,
      storageLimit: 512,
    },
    basic: {
      maxUsers: 10,
      maxProducts: 1000,
      maxOrdersPerMonth: 500,
      maxBookingsPerMonth: 500,
      storageLimit: 2048,
    },
    pro: {
      maxUsers: 50,
      maxProducts: 5000,
      maxOrdersPerMonth: 2000,
      maxBookingsPerMonth: 2000,
      storageLimit: 10240,
    },
    enterprise: {
      maxUsers: 10000,
      maxProducts: 100000,
      maxOrdersPerMonth: 100000,
      maxBookingsPerMonth: 100000,
      storageLimit: 102400,
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
      deviceInfo: companyObj.whatsapp.deviceInfo,
      sessionId: companyObj.whatsapp.sessionId,
      reconnectAttempts: companyObj.whatsapp.reconnectAttempts,
      errorCount: companyObj.whatsapp.errorCount
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
      'Allow': 'GET, PUT, PATCH, DELETE, OPTIONS',
    },
  });
}

// ========== GET HANDLER - Get single company by ID ==========
export async function GET(request, { params }) {
  try {
    console.log('🏢 [COMPANY DETAILS API] GET request received for ID:', params.id);

    // Check authentication
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

    const { id } = params;

    // ===== Handle "me" endpoint for company admins =====
    if (id === 'me') {
      console.log('🔍 [COMPANY DETAILS API] Fetching current user\'s company');
      
      // Check if user has a company
      if (!session.user.companyId) {
        return NextResponse.json(
          {
            success: false,
            message: 'No company associated with this user',
            code: 'NO_COMPANY',
          },
          {
            status: 404,
            headers: { ...securityHeaders, ...corsHeaders },
          }
        );
      }

      await connectDB();

      // Get company by ID from session
      const company = await Company.findById(session.user.companyId)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email')
        .populate('verifiedBy', 'fullName email')
        .populate('suspendedBy', 'fullName email')
        .lean();

      if (!company) {
        return NextResponse.json(
          {
            success: false,
            message: 'Company not found',
            code: 'NOT_FOUND',
          },
          {
            status: 404,
            headers: { ...securityHeaders, ...corsHeaders },
          }
        );
      }

      // Get WhatsApp stats
      const whatsappStats = {
        totalMessages: company.stats?.whatsapp?.totalMessages || 0,
        totalConversations: company.stats?.whatsapp?.totalConversations || 0,
        totalCustomers: company.stats?.whatsapp?.totalCustomers || 0,
        messagesToday: company.stats?.whatsapp?.messagesToday || 0,
        lastMessageAt: company.stats?.whatsapp?.lastMessageAt,
        lastResetAt: company.stats?.whatsapp?.lastResetAt
      };

      // Format response
      const formattedCompany = formatCompanyResponse(company);

      console.log('✅ [COMPANY DETAILS API] GET successful for "me":', {
        companyId: session.user.companyId,
        companyName: company.companyName,
        whatsappConnected: company.whatsapp?.isConnected
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            company: formattedCompany,
            whatsappStats
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // ===== FOR ANY OTHER ID, REQUIRE SUPER ADMIN =====
    const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
    
    if (!isSuperAdmin) {
      console.log(`⛔ [COMPANY DETAILS API] Access denied for non-super admin to ID: ${id}`);
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

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid company ID format',
          code: 'INVALID_ID',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    await connectDB();

    // Get company with populated fields
    const company = await Company.findById(id)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .populate('verifiedBy', 'fullName email')
      .populate('suspendedBy', 'fullName email')
      .lean();

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company not found',
          code: 'NOT_FOUND',
        },
        {
          status: 404,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Get additional stats
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalBookings,
      settings,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ companyId: id, deletedAt: null }),
      Product.countDocuments({ companyId: id, deletedAt: null }),
      Order.countDocuments({ companyId: id, deletedAt: null }),
      Bookingmng.countDocuments({ companyId: id, deletedAt: null }),
      CompanySettings.findOne({ companyId: id }).lean(),
      User.find({ companyId: id, lastSeen: { $exists: true } })
        .sort({ lastSeen: -1 })
        .limit(5)
        .select('fullName email lastSeen role')
        .lean(),
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ companyId: id, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customerName totalPrice status createdAt')
      .lean();

    // Calculate usage percentages
    const usage = {
      users: {
        current: totalUsers,
        limit: company.limits?.maxUsers || 5,
        percentage: company.limits?.maxUsers 
          ? Math.round((totalUsers / company.limits.maxUsers) * 100) 
          : 0,
      },
      products: {
        current: totalProducts,
        limit: company.limits?.maxProducts || 500,
        percentage: company.limits?.maxProducts 
          ? Math.round((totalProducts / company.limits.maxProducts) * 100) 
          : 0,
      },
      orders: {
        current: totalOrders,
        limit: company.limits?.maxOrdersPerMonth || 1000,
        percentage: company.limits?.maxOrdersPerMonth 
          ? Math.round((totalOrders / company.limits.maxOrdersPerMonth) * 100) 
          : 0,
      },
      bookings: {
        current: totalBookings,
        limit: company.limits?.maxBookingsPerMonth || 300,
        percentage: company.limits?.maxBookingsPerMonth 
          ? Math.round((totalBookings / company.limits.maxBookingsPerMonth) * 100) 
          : 0,
      },
    };

    // Get WhatsApp stats
    const whatsappStats = {
      totalMessages: company.stats?.whatsapp?.totalMessages || 0,
      totalConversations: company.stats?.whatsapp?.totalConversations || 0,
      totalCustomers: company.stats?.whatsapp?.totalCustomers || 0,
      messagesToday: company.stats?.whatsapp?.messagesToday || 0,
      lastMessageAt: company.stats?.whatsapp?.lastMessageAt,
      lastResetAt: company.stats?.whatsapp?.lastResetAt
    };

    // Format response
    const formattedCompany = formatCompanyResponse(company);

    console.log('✅ [COMPANY DETAILS API] GET successful:', {
      companyId: id,
      companyName: company.companyName,
      whatsappConnected: company.whatsapp?.isConnected
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          company: formattedCompany,
          stats: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalBookings,
            usage,
            whatsapp: whatsappStats
          },
          settings: settings || null,
          recentActivity: {
            users: recentActivity,
            orders: recentOrders,
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
    console.error('❌ [COMPANY DETAILS API] GET error:', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch company details',
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

// ========== PUT HANDLER - Update company ==========
export async function PUT(request, { params }) {
  try {
    console.log('🏢 [COMPANY DETAILS API] PUT request received for ID:', params.id);

    // Check authentication
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

    const { id } = params;

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid company ID format',
          code: 'INVALID_ID',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
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

    await connectDB();

    // Check if company exists
    const existingCompany = await Company.findById(id);
    
    if (!existingCompany) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company not found',
          code: 'NOT_FOUND',
        },
        {
          status: 404,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Validate input data
    const errors = {};

    if (body.companyName !== undefined && !body.companyName?.trim()) {
      errors.companyName = 'Company name cannot be empty';
    }

    if (body.companyEmail !== undefined) {
      if (!body.companyEmail?.trim()) {
        errors.companyEmail = 'Company email cannot be empty';
      } else if (!validateEmail(body.companyEmail)) {
        errors.companyEmail = 'Invalid email format';
      }
    }

    if (body.companyPhone !== undefined) {
      if (!body.companyPhone?.trim()) {
        errors.companyPhone = 'Company phone cannot be empty';
      } else if (!validatePhone(body.companyPhone)) {
        errors.companyPhone = 'Phone must be 10-12 digits';
      }
    }

    // Validate WhatsApp number if provided
    if (body.whatsappNumber !== undefined && body.whatsappNumber && !validatePhone(body.whatsappNumber)) {
      errors.whatsappNumber = 'WhatsApp number must be 10-12 digits';
    }

    if (body.address?.pincode !== undefined && !validatePincode(body.address.pincode)) {
      errors['address.pincode'] = 'Pincode must be 6 digits';
    }

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

    // Check for duplicate email/name if updating
    if (body.companyEmail || body.companyName) {
      const duplicateQuery = { _id: { $ne: id } };
      
      if (body.companyEmail) {
        duplicateQuery.companyEmail = body.companyEmail.toLowerCase().trim();
      }
      if (body.companyName) {
        duplicateQuery.companyName = body.companyName.trim();
      }

      const existing = await Company.findOne(duplicateQuery);
      
      if (existing) {
        const field = existing.companyEmail === body.companyEmail?.toLowerCase().trim() 
          ? 'companyEmail' 
          : 'companyName';
        return NextResponse.json(
          {
            success: false,
            message: `Company with this ${field === 'companyEmail' ? 'email' : 'name'} already exists`,
            code: 'DUPLICATE_ENTRY',
            field,
          },
          {
            status: 409,
            headers: { ...securityHeaders, ...corsHeaders },
          }
        );
      }
    }

    // Handle plan change if requested
    if (body.plan && body.plan !== existingCompany.subscription?.plan) {
      const planLimits = getPlanLimits(body.plan);
      const planFeatures = getPlanFeatures(body.plan);
      
      body.limits = planLimits;
      body.features = planFeatures;
      body['subscription.plan'] = body.plan;
      delete body.plan;
    }

    // Handle WhatsApp number update
    if (body.whatsappNumber && body.whatsappNumber !== existingCompany.whatsapp?.phoneNumber) {
      const cleanNumber = body.whatsappNumber.replace(/\D/g, '');
      const timestamp = Date.now();
      const clientId = `company_${timestamp}_${cleanNumber.slice(-4)}`;
      
      body.whatsapp = {
        ...existingCompany.whatsapp,
        phoneNumber: cleanNumber,
        clientId: clientId,
        isConnected: false,
        connectionStatus: 'pending'
      };
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedBy: session.user.id,
      updatedAt: new Date(),
    };

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true,
        runValidators: true,
      }
    ).populate('updatedBy', 'fullName email');

    // Update company settings if basic info changed
    if (body.companyName || body.companyPhone || body.companyEmail || body.address || body.whatsappNumber) {
      const settingsUpdate = {};
      if (body.companyName) settingsUpdate.companyName = body.companyName;
      if (body.companyPhone) settingsUpdate.phone = body.companyPhone;
      if (body.companyEmail) settingsUpdate.email = body.companyEmail;
      if (body.address) {
        settingsUpdate.address = body.address.street;
        settingsUpdate.city = body.address.city;
        settingsUpdate.state = body.address.state;
        settingsUpdate.pincode = body.address.pincode;
        settingsUpdate.country = body.address.country;
      }
      
      await CompanySettings.updateOne(
        { companyId: id },
        { $set: settingsUpdate }
      );
    }

    console.log('✅ [COMPANY DETAILS API] PUT successful:', {
      companyId: id,
      companyName: updatedCompany.companyName,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Company updated successfully',
        data: formatCompanyResponse(updatedCompany),
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('❌ [COMPANY DETAILS API] PUT error:', {
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
        message: 'Failed to update company',
        code: 'UPDATE_FAILED',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: { ...securityHeaders, ...corsHeaders },
      }
    );
  }
}

// ========== PATCH HANDLER - Update WhatsApp status (for bot) ==========
export async function PATCH(request, { params }) {
  try {
    console.log('📱 [COMPANY API] PATCH WhatsApp status for ID:', params.id);

    // Parse request body
    const body = await request.json();
    const { action, status, data } = body;
    
    // Allow both 'whatsapp-status' action or direct status update
    const isWhatsAppUpdate = action === 'whatsapp-status' || body.hasOwnProperty('status');
    
    if (!isWhatsAppUpdate) {
      return NextResponse.json({
        success: false,
        message: 'Invalid action. Use action: "whatsapp-status" or provide status field',
        code: 'INVALID_ACTION'
      }, { 
        status: 400,
        headers: { ...securityHeaders, ...corsHeaders }
      });
    }

    await connectDB();
    
    const company = await Company.findById(params.id);
    if (!company) {
      return NextResponse.json({
        success: false,
        message: 'Company not found'
      }, { 
        status: 404,
        headers: { ...securityHeaders, ...corsHeaders }
      });
    }

    // Use the status from either action or direct field
    const updateStatus = status || body.status;
    
    if (!updateStatus) {
      return NextResponse.json({
        success: false,
        message: 'Status is required'
      }, { 
        status: 400,
        headers: { ...securityHeaders, ...corsHeaders }
      });
    }

    // Use the model's built-in method
    await company.updateWhatsAppStatus(updateStatus, data || {});

    // Get updated company with populated fields
    const updatedCompany = await Company.findById(params.id)
      .select('_id companyName whatsapp')
      .lean();

    console.log('✅ [COMPANY API] WhatsApp status updated:', {
      companyId: params.id,
      status: updateStatus,
      isConnected: updatedCompany.whatsapp?.isConnected
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp status updated',
      data: {
        companyId: company._id,
        companyName: company.companyName,
        whatsapp: {
          isConnected: company.whatsapp?.isConnected,
          connectionStatus: company.whatsapp?.connectionStatus,
          phoneNumber: company.whatsapp?.phoneNumber,
          clientId: company.whatsapp?.clientId,
          connectedAt: company.whatsapp?.connectedAt,
          lastError: company.whatsapp?.lastError
        }
      }
    }, {
      headers: { ...securityHeaders, ...corsHeaders }
    });

  } catch (error) {
    console.error('❌ [COMPANY API] PATCH error:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { 
      status: 500,
      headers: { ...securityHeaders, ...corsHeaders }
    });
  }
}

// ========== DELETE HANDLER - Delete company ==========
export async function DELETE(request, { params }) {
  try {
    console.log('🏢 [COMPANY DETAILS API] DELETE request received for ID:', params.id);

    // Check authentication
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

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid company ID format',
          code: 'INVALID_ID',
        },
        {
          status: 400,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    await connectDB();

    // Check if company exists
    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company not found',
          code: 'NOT_FOUND',
        },
        {
          status: 404,
          headers: { ...securityHeaders, ...corsHeaders },
        }
      );
    }

    // Check if company has active data before permanent delete
    if (permanent) {
      const [
        hasUsers,
        hasProducts,
        hasOrders,
        hasBookings
      ] = await Promise.all([
        User.exists({ companyId: id }),
        Product.exists({ companyId: id }),
        Order.exists({ companyId: id }),
        Bookingmng.exists({ companyId: id }),
      ]);

      if (hasUsers || hasProducts || hasOrders || hasBookings) {
        return NextResponse.json(
          {
            success: false,
            message: 'Cannot permanently delete company with active data. Soft delete instead.',
            code: 'HAS_ACTIVE_DATA',
            data: {
              hasUsers: !!hasUsers,
              hasProducts: !!hasProducts,
              hasOrders: !!hasOrders,
              hasBookings: !!hasBookings,
            },
          },
          {
            status: 409,
            headers: { ...securityHeaders, ...corsHeaders },
          }
        );
      }

      // Permanent delete
      await Company.findByIdAndDelete(id);
      await CompanySettings.deleteOne({ companyId: id });
      
      console.log('✅ [COMPANY DETAILS API] Permanent delete successful:', {
        companyId: id,
        companyName: company.companyName,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Company permanently deleted',
          data: {
            id,
            companyName: company.companyName,
            permanent: true,
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
      await company.softDelete(session.user.id);
      
      // Also soft delete all users under this company
      await User.updateMany(
        { companyId: id },
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

      console.log('✅ [COMPANY DETAILS API] Soft delete successful:', {
        companyId: id,
        companyName: company.companyName,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Company deactivated successfully',
          data: {
            id,
            companyName: company.companyName,
            permanent: false,
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
    console.error('❌ [COMPANY DETAILS API] DELETE error:', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete company',
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