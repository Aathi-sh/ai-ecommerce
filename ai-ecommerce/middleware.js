
















// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// /**
//  * Professional Middleware for WhatsApp E-commerce Application
//  * Multi-tenant SaaS support with company isolation
//  */

// // Security headers for all responses
// const securityHeaders = {
//   'X-DNS-Prefetch-Control': 'on',
//   'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
//     ? 'max-age=31536000; includeSubDomains; preload' 
//     : 'max-age=0',
//   'X-Frame-Options': 'DENY',
//   'X-Content-Type-Options': 'nosniff',
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
//   'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
//   'X-XSS-Protection': '1; mode=block',
// };

// // Public paths that don't require authentication
// const publicPaths = [
//   '/api/setup',           // ← ADD THIS
//   '/api/setup/(.*)',
//   '/',
//   '/login',
//   '/signup',
//   '/register',
//   '/forgot-password',
//   '/reset-password',
//   '/verify-email',
//   '/auth/error',
//   '/auth/verify-request',
//   '/auth/new-user',
//   '/api/auth', // NextAuth API routes
//   '/_next/static',
//   '/_next/image',
//   '/favicon.ico',
//   '/public',
//   '/api/company-settings',
//   '/api/company-settings/(.*)',
//   '/api/config',
//   '/api/config/(.*)',  
//   '/api/whatsapp',
//   '/api/webhook',
//   '/api/orders/public',
//   '/api/products',
//   '/api/products/:path*',
//   '/api/orders',
//   '/api/orders?phone=:phone',
//   '/api/orders?orderNumber=:number',
//   '/api/orders/:id',
//   '/api/payments/verify',
//   '/api/payments/verify?orderNumber=:number',
//   '/api/payments/verify?customerPhone=:phone',
//   '/api/payments/verify?status=pending',
//   '/api/notifications',
//   '/api/notifications/webhook',
//   '/api/notifications/status/:id',
//   '/api/bookings',
//   '/api/bookings/:path*',
//   '/api/services',
//   '/api/services/:path*',
//   '/api/bookingmng',
//   '/api/bookingmng/:path*',
//   '/api/masters/:path*',
//   '/api/bookingService/service',
//   '/api/bookingService/bookingmng',
//   '/api/bookingService/bookings',
//   '/api/bookingService/bookings/:path*',
//   '/api/public/:path*',
//   '/api/whatsapp/:path*',
//   '/whatsapp-webhook',
//   '/company-inactive', // New page for inactive company
//   '/company-suspended', // New page for suspended company
//   '/subscription-expired', // New page for expired subscription


//   '/api/companies/with-whatsapp',
//   '/api/companies/by-whatsapp',
//   '/api/companies/session',
//   '/api/companies/session/(.*)',
//   '/api/company-settings',
//   '/api/company-settings/(.*)',
//   '/api/whatsapp/status',
//   '/api/whatsapp/qr',
//   '/api/whatsapp/stats',
//   '/api/health',
//   '/api/websocket-status',
//   '/api/company-settings/active',
//   '/api/company-settings/payment-methods',
// ];

// // Admin paths (accessible by super_admin and company_admin)
// const adminPaths = [
//   '/admin',
//   '/admin/dashboards',
//   '/admin/users',
//   '/admin/settings',
//   '/admin/analytics',
//   '/admin/reports',
//   '/admin/products',
//   '/admin/orders',
//   '/admin/bookings',
//   '/api/admin',
// ];

// // Super admin only paths
// const superAdminPaths = [
//   '/super-admin',
//   '/super-admin/dashboard',
//   '/super-admin/companies',
//   '/super-admin/users',
//   '/super-admin/subscriptions',
//   '/api/super-admin',
// ];

// // Manager paths (accessible by admin and manager)
// const managerPaths = [
//   '/manager',
//   '/manager/dashboard',
//   '/manager/orders',
//   '/manager/inventory',
//   '/api/manager',
// ];

// // WhatsApp-specific paths (no authentication required)
// const whatsappPaths = [
//   '/api/products/public', 
//   '/api/whatsapp/webhook', 
//   '/api/whatsapp/message',
//   '/api/orders/whatsapp', 
//   '/api/payments/verify',
//   '/api/orders',
//   '/api/payments',
//   '/api/analytics/products',
//   '/api/auth/fcm-token',
//   '/api/notifications', 
//   '/api/whatsapp/booking',
//   '/api/whatsapp/booking/:path*',
//   '/api/whatsapp/availability',
//   '/api/whatsapp/availability/:path*',
//   '/api/whatsapp/book',
//   '/api/whatsapp/book/:path*',
//   '/api/whatsapp/cancel',
//   '/api/whatsapp/cancel/:path*',
//   '/api/whatsapp/mybookings',
//   '/api/whatsapp/mybookings/:path*'
// ];

// // Authentication routes that should bypass status checks
// const authRoutes = [
//   '/api/auth/callback/credentials',
//   '/api/auth/signin',
//   '/api/auth/signin/credentials',
//   '/api/auth/session',
//   '/api/auth/csrf',
//   '/api/auth/providers',
//   '/api/auth/signout',
// ];

// // Check if path is public
// const isPublicPath = (pathname) => {
//   return publicPaths.some(path => 
//     pathname === path || 
//     pathname.startsWith(`${path}/`) ||
//     pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
//   );
// };

// // Check if path is a WhatsApp API route
// const isWhatsappPath = (pathname) => {
//   return whatsappPaths.some(path => 
//     pathname === path || 
//     pathname.startsWith(`${path}/`)
//   );
// };

// // Check if path is an authentication route
// const isAuthRoute = (pathname) => {
//   return authRoutes.some(path => 
//     pathname === path || 
//     pathname.startsWith(`${path}/`)
//   ) || pathname.startsWith('/api/auth/');
// };

// // Check if path requires admin access (super_admin or company_admin)
// const isAdminPath = (pathname) => {
//   return adminPaths.some(path => 
//     pathname === path || 
//     pathname.startsWith(`${path}/`)
//   );
// };

// // Check if path requires super admin access
// const isSuperAdminPath = (pathname) => {
//   return superAdminPaths.some(path => 
//     pathname === path || 
//     pathname.startsWith(`${path}/`)
//   );
// };

// // Check if path requires manager access
// const isManagerPath = (pathname) => {
//   return managerPaths.some(path => 
//     pathname === path || 
//     pathname.startsWith(`${path}/`)
//   );
// };

// // Check if path is an API route
// const isApiRoute = (pathname) => {
//   return pathname.startsWith('/api/');
// };

// // Safe redirects for authenticated users trying to access auth pages
// const getAuthenticatedRedirectPath = (user) => {
//   if (user.isSuperAdmin) {
//     return '/super-admin/dashboard';
//   } else if (user.isAdmin) {
//     return '/admin/dashboards';
//   } else if (user.role === 'manager') {
//     return '/manager/dashboard';
//   }
//   return '/dashboards';
// };

// export async function middleware(request) {
//   const { pathname } = request.nextUrl;
  
//   // Skip middleware for static files
//   if (pathname.includes('/_next/') || 
//       pathname.includes('/public/') || 
//       pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
//     return NextResponse.next();
//   }
  
//   // Apply security headers to all responses
//   const response = NextResponse.next();
//   Object.entries(securityHeaders).forEach(([key, value]) => {
//     response.headers.set(key, value);
//   });
  
//   // SPECIAL CASE: WhatsApp API routes - NO AUTHENTICATION REQUIRED
//   if (isWhatsappPath(pathname)) {
//     console.log(`📱 [Middleware] WhatsApp API route: ${pathname} - Allowing public access`);
    
//     response.headers.set('X-Access-Type', 'whatsapp-public-api');
//     response.headers.set('Access-Control-Allow-Origin', '*');
    
//     return response;
//   }
  
//   // Get session token
//   const token = await getToken({ 
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//     secureCookie: process.env.NODE_ENV === 'production'
//   });
  
//   // Development logging
//   if (process.env.NODE_ENV === 'development') {
//     console.log(`🌐 [Middleware] ${request.method} ${pathname}`, {
//       authenticated: !!token,
//       user: token?.email,
//       role: token?.role,
//       adminType: token?.adminType,
//       companyId: token?.companyId,
//       companyStatus: token?.companyStatus,
//       status: token?.status,
//       isVerified: token?.isVerified,
//       isSuperAdmin: token?.role === 'admin' && token?.adminType === 'super',
//       isAuthRoute: isAuthRoute(pathname),
//       isWhatsappRoute: isWhatsappPath(pathname)
//     });
//   }
  
//   // Check if path is public (excluding WhatsApp which we already handled)
//   const isPublic = isPublicPath(pathname);
  
//   // CRITICAL: Allow authentication routes to bypass all checks
//   if (isAuthRoute(pathname)) {
//     console.log(`🔑 [Middleware] Auth route: ${pathname} - Allowing without status checks`);
//     return response;
//   }
  
//   // Case 1: User is authenticated but trying to access auth pages
//   if (token && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
//     console.log(`🔄 [Middleware] Redirecting authenticated user from ${pathname}`);
//     const user = enhanceUserFromToken(token);
//     const redirectPath = getAuthenticatedRedirectPath(user);
//     return NextResponse.redirect(new URL(redirectPath, request.url));
//   }
  
//   // Case 2: Path is public - allow access
//   if (isPublic) {
//     console.log(`✅ [Middleware] Public path: ${pathname}`);
//     return response;
//   }
  
//   // Case 3: Protected path but no session
//   if (!token) {
//     console.log(`❌ [Middleware] No session for protected path: ${pathname}`);
    
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    
//     if (isApiRoute(pathname)) {
//       return NextResponse.json(
//         { 
//           success: false,
//           error: 'Unauthorized',
//           message: 'Authentication required',
//           code: 'UNAUTHORIZED'
//         },
//         { 
//           status: 401,
//           headers: {
//             'Content-Type': 'application/json',
//             'WWW-Authenticate': 'Bearer realm="API"'
//           }
//         }
//       );
//     }
    
//     return NextResponse.redirect(loginUrl);
//   }
  
//   // Enhance token with computed properties
//   const user = enhanceUserFromToken(token);
  
//   // Case 4: User has session but email not verified
//   if (!user.isVerified && !pathname.includes('/verify-email')) {
//     console.log(`⚠️ [Middleware] Unverified user: ${user.email}`);
    
//     if (pathname.startsWith('/api/auth/verify') || 
//         pathname.includes('verification') ||
//         pathname === '/verify-email') {
//       return response;
//     }
    
//     const verifyUrl = new URL('/verify-email', request.url);
//     verifyUrl.searchParams.set('email', user.email);
//     verifyUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    
//     return NextResponse.redirect(verifyUrl);
//   }
  
//   // Case 5: User account status check
//   if (user.status !== 'active') {
//     console.log(`❌ [Middleware] Non-active account: ${user.email}, status: ${user.status}`);
    
//     if (isApiRoute(pathname)) {
//       return NextResponse.json(
//         { 
//           success: false,
//           error: 'Account inactive',
//           message: `Your account is ${user.status}. Please contact support.`,
//           code: 'ACCOUNT_INACTIVE',
//           status: user.status
//         },
//         { 
//           status: 403,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
    
//     const errorUrl = new URL('/auth/error', request.url);
//     errorUrl.searchParams.set('error', 'AccountInactive');
//     errorUrl.searchParams.set('status', user.status);
    
//     const redirectResponse = NextResponse.redirect(errorUrl);
    
//     const nextAuthCookies = [
//       'next-auth.session-token',
//       '__Secure-next-auth.session-token',
//       'next-auth.csrf-token',
//       '__Host-next-auth.csrf-token',
//     ];
    
//     nextAuthCookies.forEach(cookieName => {
//       redirectResponse.cookies.delete(cookieName);
//     });
    
//     return redirectResponse;
//   }
  
//   // ===== SAAS: COMPANY STATUS CHECK =====
//   // Skip company check for super admin
//   if (!user.isSuperAdmin) {
//     // Check if user has company
//     if (!user.companyId) {
//       console.log(`❌ [Middleware] User has no company: ${user.email}`);
      
//       if (isApiRoute(pathname)) {
//         return NextResponse.json(
//           { 
//             success: false,
//             error: 'No company association',
//             message: 'Your account is not associated with any company.',
//             code: 'NO_COMPANY'
//           },
//           { status: 403 }
//         );
//       }
      
//       return NextResponse.redirect(new URL('/no-company', request.url));
//     }
    
//     // Check company status
//     if (user.companyStatus !== 'active') {
//       console.log(`❌ [Middleware] Company not active: ${user.companyId}, status: ${user.companyStatus}`);
      
//       const companyErrorPage = user.companyStatus === 'suspended' ? '/company-suspended' : 
//                               user.companyStatus === 'inactive' ? '/company-inactive' : 
//                               '/company-inactive';
      
//       if (isApiRoute(pathname)) {
//         return NextResponse.json(
//           { 
//             success: false,
//             error: `Company is ${user.companyStatus}`,
//             message: `Your company account is ${user.companyStatus}. Please contact support.`,
//             code: 'COMPANY_INACTIVE',
//             companyStatus: user.companyStatus
//           },
//           { status: 403 }
//         );
//       }
      
//       return NextResponse.redirect(new URL(companyErrorPage, request.url));
//     }
    
//     // Check subscription expiry
//     if (user.subscriptionExpired) {
//       console.log(`❌ [Middleware] Company subscription expired: ${user.companyId}`);
      
//       if (isApiRoute(pathname)) {
//         return NextResponse.json(
//           { 
//             success: false,
//             error: 'Subscription expired',
//             message: 'Your company subscription has expired. Please renew to continue.',
//             code: 'SUBSCRIPTION_EXPIRED'
//           },
//           { status: 403 }
//         );
//       }
      
//       return NextResponse.redirect(new URL('/subscription-expired', request.url));
//     }
//   }
  
//   // ===== ROLE-BASED ACCESS CONTROL =====
  
//   // Super admin paths - only super admin can access
//   if (isSuperAdminPath(pathname) && !user.isSuperAdmin) {
//     console.log(`⛔ [Middleware] Non-super-admin user accessing super admin route: ${user.email}`);
    
//     if (isApiRoute(pathname)) {
//       return NextResponse.json(
//         { 
//           success: false,
//           error: 'Forbidden',
//           message: 'Super admin access required',
//           code: 'FORBIDDEN'
//         },
//         { status: 403 }
//       );
//     }
    
//     return NextResponse.redirect(new URL('/admin/dashboards', request.url));
//   }
  
//   // Admin paths - accessible by super_admin and company_admin
//   if (isAdminPath(pathname) && !user.isAdmin) {
//     console.log(`⛔ [Middleware] Non-admin user accessing admin route: ${user.email}`);
    
//     if (isApiRoute(pathname)) {
//       return NextResponse.json(
//         { 
//           success: false,
//           error: 'Forbidden',
//           message: 'Admin access required',
//           code: 'FORBIDDEN'
//         },
//         { status: 403 }
//       );
//     }
    
//     return NextResponse.redirect(new URL('/dashboards', request.url));
//   }
  
//   // Manager paths - accessible by admin, super_admin, and manager
//   if (isManagerPath(pathname) && !user.isManagerOrAdmin) {
//     console.log(`⛔ [Middleware] Unauthorized user accessing manager route: ${user.email}`);
    
//     if (isApiRoute(pathname)) {
//       return NextResponse.json(
//         { 
//           success: false,
//           error: 'Forbidden',
//           message: 'Manager or admin access required',
//           code: 'FORBIDDEN'
//         },
//         { status: 403 }
//       );
//     }
    
//     return NextResponse.redirect(new URL('/dashboards', request.url));
//   }
  
//   // Case 8: Session is valid and authorized
//   console.log(`✅ [Middleware] Authorized: ${user.email} (${user.role}) for company ${user.companyId || 'N/A'} -> ${pathname}`);
  
//   // Add user and company info to headers for API routes
//   if (isApiRoute(pathname)) {
//     const requestHeaders = new Headers(request.headers);
//     requestHeaders.set('x-user-id', user.id);
//     requestHeaders.set('x-user-role', user.role);
//     requestHeaders.set('x-user-email', user.email);
//     requestHeaders.set('x-user-status', user.status);
//     requestHeaders.set('x-user-admin-type', user.adminType || '');
    
//     // CRITICAL: Add company context for multi-tenancy
//     if (user.companyId) {
//       requestHeaders.set('x-company-id', user.companyId);
//       requestHeaders.set('x-company-name', user.companyName || '');
//       requestHeaders.set('x-company-status', user.companyStatus || '');
//     }
    
//     // For super admin, allow them to specify a company
//     if (user.isSuperAdmin) {
//       const headerCompanyId = request.headers.get('x-company-id');
//       if (headerCompanyId) {
//         requestHeaders.set('x-company-id', headerCompanyId);
//         requestHeaders.set('x-company-context', 'super-admin-switched');
//       }
//     }
    
//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
//   }
  
//   return response;
// }

// // Helper function to enhance token with computed properties
// function enhanceUserFromToken(token) {
//   const isSuperAdmin = token.role === 'admin' && token.adminType === 'super';
//   const isCompanyAdmin = token.role === 'admin' && token.adminType === 'company';
//   const isAdmin = token.role === 'admin'; // Any admin type
//   const isManager = token.role === 'manager';
//   const isManagerOrAdmin = isAdmin || isManager;
  
//   // Check if subscription expired
//   const subscriptionExpired = token.subscriptionExpiry ? 
//     new Date(token.subscriptionExpiry) < new Date() : false;
  
//   return {
//     ...token,
//     isSuperAdmin,
//     isCompanyAdmin,
//     isAdmin,
//     isManager,
//     isManagerOrAdmin,
//     subscriptionExpired,
//     // Role display name for UI
//     roleDisplay: isSuperAdmin ? 'Super Admin' : 
//                  isCompanyAdmin ? 'Company Admin' : 
//                  isManager ? 'Manager' : 'User',
//   };
// }

// // Middleware configuration
// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|public/).*)',
//   ],
// };

// // ========== EXPORTED HELPER FUNCTIONS ==========

// // Enhanced requireAuth with company context
// export async function requireAuth(request, options = {}) {
//   const { 
//     requiredRole = null, 
//     requireCompany = true,
//     requireActiveCompany = true,
//     allowSuperAdmin = true 
//   } = options;
  
//   const token = await getToken({ 
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET 
//   });
  
//   if (!token) {
//     return {
//       authorized: false,
//       error: 'Authentication required',
//       message: 'Please log in to access this resource',
//       status: 401,
//       code: 'UNAUTHORIZED'
//     };
//   }
  
//   const user = enhanceUserFromToken(token);
  
//   if (!user.isVerified) {
//     return {
//       authorized: false,
//       error: 'Email verification required',
//       message: 'Please verify your email address',
//       status: 403,
//       code: 'EMAIL_NOT_VERIFIED'
//     };
//   }
  
//   if (user.status !== 'active') {
//     return {
//       authorized: false,
//       error: 'Account is not active',
//       message: `Your account is ${user.status}. Please contact support.`,
//       status: 403,
//       code: 'ACCOUNT_INACTIVE',
//       userStatus: user.status
//     };
//   }
  
//   // Company validation (skip for super admin if allowSuperAdmin is true)
//   if (requireCompany && !user.isSuperAdmin) {
//     if (!user.companyId) {
//       return {
//         authorized: false,
//         error: 'No company association',
//         message: 'Your account is not associated with any company.',
//         status: 403,
//         code: 'NO_COMPANY'
//       };
//     }
    
//     if (requireActiveCompany && user.companyStatus !== 'active') {
//       return {
//         authorized: false,
//         error: `Company is ${user.companyStatus}`,
//         message: `Your company is ${user.companyStatus}. Please contact support.`,
//         status: 403,
//         code: 'COMPANY_INACTIVE',
//         companyStatus: user.companyStatus
//       };
//     }
    
//     if (user.subscriptionExpired) {
//       return {
//         authorized: false,
//         error: 'Subscription expired',
//         message: 'Your company subscription has expired.',
//         status: 403,
//         code: 'SUBSCRIPTION_EXPIRED'
//       };
//     }
//   }
  
//   // Role validation
//   if (requiredRole) {
//     if (requiredRole === 'super_admin' && !user.isSuperAdmin) {
//       return {
//         authorized: false,
//         error: 'Insufficient permissions',
//         message: 'Super admin access required',
//         status: 403,
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRole,
//         userRole: user.role
//       };
//     }
    
//     if (requiredRole === 'admin' && !user.isAdmin) {
//       return {
//         authorized: false,
//         error: 'Insufficient permissions',
//         message: 'Admin access required',
//         status: 403,
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRole,
//         userRole: user.role
//       };
//     }
    
//     if (requiredRole === 'manager' && !user.isManagerOrAdmin) {
//       return {
//         authorized: false,
//         error: 'Insufficient permissions',
//         message: 'Manager or admin access required',
//         status: 403,
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRole,
//         userRole: user.role
//       };
//     }
    
//     if (token.role !== requiredRole && !['super_admin', 'admin', 'manager'].includes(requiredRole)) {
//       return {
//         authorized: false,
//         error: 'Insufficient permissions',
//         message: `Required role: ${requiredRole}`,
//         status: 403,
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRole,
//         userRole: token.role
//       };
//     }
//   }
  
//   // Get company ID from request or token
//   let companyId = user.companyId;
  
//   // Super admin can specify company in headers
//   if (user.isSuperAdmin) {
//     const headerCompanyId = request.headers.get('x-company-id');
//     if (headerCompanyId) {
//       companyId = headerCompanyId;
//     }
//   }
  
//   return {
//     authorized: true,
//     user: {
//       id: token.id,
//       email: token.email,
//       name: token.name,
//       role: token.role,
//       adminType: token.adminType,
//       isVerified: token.isVerified,
//       phone: token.phone,
//       status: token.status,
//       companyId: user.companyId,
//       companyName: user.companyName,
//       companyStatus: user.companyStatus,
//       isSuperAdmin: user.isSuperAdmin,
//       isCompanyAdmin: user.isCompanyAdmin,
//       isAdmin: user.isAdmin,
//       isManager: user.isManager,
//       isManagerOrAdmin: user.isManagerOrAdmin,
//       roleDisplay: user.roleDisplay,
//     },
//     companyId,
//     code: 'AUTHORIZED'
//   };
// }

// // WhatsApp-specific auth helper
// export async function getWhatsappAuth(request) {
//   const whatsappNumber = request.headers.get('x-whatsapp-number') || 
//                         request.nextUrl.searchParams.get('whatsapp');
//   const companyId = request.headers.get('x-company-id') || 
//                    request.nextUrl.searchParams.get('companyId');
  
//   if (whatsappNumber) {
//     return {
//       authorized: true,
//       user: {
//         id: `whatsapp:${whatsappNumber}`,
//         phone: whatsappNumber,
//         role: 'user',
//         isVerified: true,
//         isWhatsappUser: true,
//         source: 'whatsapp'
//       },
//       companyId,
//       code: 'WHATSAPP_USER'
//     };
//   }
  
//   return {
//     authorized: false,
//     error: 'WhatsApp number required',
//     message: 'Please provide a WhatsApp number',
//     status: 400,
//     code: 'WHATSAPP_NUMBER_REQUIRED'
//   };
// }

// // Enhanced server auth with company context
// export async function getServerAuth(request) {
//   const token = await getToken({ 
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET 
//   });
  
//   if (!token) {
//     return null;
//   }
  
//   const user = enhanceUserFromToken(token);
  
//   return {
//     user: {
//       id: token.id,
//       email: token.email,
//       name: token.name,
//       role: token.role,
//       adminType: token.adminType,
//       isVerified: token.isVerified,
//       phone: token.phone,
//       status: token.status,
//       companyId: user.companyId,
//       companyName: user.companyName,
//       companyStatus: user.companyStatus,
//       isSuperAdmin: user.isSuperAdmin,
//       isCompanyAdmin: user.isCompanyAdmin,
//       isAdmin: user.isAdmin,
//       isManager: user.isManager,
//       isManagerOrAdmin: user.isManagerOrAdmin,
//       roleDisplay: user.roleDisplay,
//       preferences: token.preferences || {},
//       notificationSettings: token.notificationSettings || {},
//     },
//     companyId: user.companyId,
//     expires: token.exp ? new Date(token.exp * 1000).toISOString() : null,
//     sessionValid: user.status === 'active' && user.isVerified && 
//                   (user.isSuperAdmin || (user.companyStatus === 'active' && !user.subscriptionExpired))
//   };
// }

// // Validate company access
// export async function validateCompanyAccess(request, resourceCompanyId) {
//   const auth = await requireAuth(request, { requireCompany: true });
  
//   if (!auth.authorized) {
//     return auth;
//   }
  
//   // Super admin can access any company
//   if (auth.user.isSuperAdmin) {
//     return {
//       ...auth,
//       companyAccess: true
//     };
//   }
  
//   // Check if user's company matches resource company
//   if (auth.companyId !== resourceCompanyId) {
//     return {
//       authorized: false,
//       error: 'Access denied',
//       message: 'You do not have access to this company\'s data',
//       status: 403,
//       code: 'COMPANY_ACCESS_DENIED'
//     };
//   }
  
//   return {
//     ...auth,
//     companyAccess: true
//   };
// }

// // Get company context from request
// export async function getCompanyContext(request) {
//   const auth = await requireAuth(request, { requireCompany: true });
  
//   if (!auth.authorized) {
//     return null;
//   }
  
//   return auth.companyId;
// }

// // Helper to check if user has specific role
// export function hasRole(user, requiredRole) {
//   if (!user) return false;
  
//   if (requiredRole === 'super_admin') {
//     return user.isSuperAdmin;
//   }
  
//   if (requiredRole === 'admin') {
//     return user.isAdmin;
//   }
  
//   if (requiredRole === 'company_admin') {
//     return user.isCompanyAdmin;
//   }
  
//   return user.role === requiredRole;
// }

// // Helper to check if user has any of the specified roles
// export function hasAnyRole(user, allowedRoles = []) {
//   if (!user) return false;
  
//   return allowedRoles.some(role => {
//     if (role === 'super_admin') return user.isSuperAdmin;
//     if (role === 'admin') return user.isAdmin;
//     if (role === 'company_admin') return user.isCompanyAdmin;
//     return user.role === role;
//   });
// }

// // Helper to check if user can access resource
// export function canAccess(user, options = {}) {
//   const { 
//     requiredStatus = 'active', 
//     requiredRoles = [],
//     requireCompany = true 
//   } = options;
  
//   if (!user) return false;
//   if (user.status !== requiredStatus) return false;
  
//   if (requireCompany && !user.isSuperAdmin) {
//     if (!user.companyId) return false;
//     if (user.companyStatus !== 'active') return false;
//     if (user.subscriptionExpired) return false;
//   }
  
//   if (requiredRoles.length > 0 && !hasAnyRole(user, requiredRoles)) return false;
  
//   return true;
// }

// // Helper to check user status
// export function isOnline(user) {
//   return user?.status === 'active';
// }

// export function isOffline(user) {
//   return user?.status === 'offline';
// }

// // Helper to get user's effective company ID
// export function getEffectiveCompanyId(user, requestCompanyId = null) {
//   if (user?.isSuperAdmin && requestCompanyId) {
//     return requestCompanyId;
//   }
//   return user?.companyId;
// }

// // Helper to check if feature is enabled for company
// export async function isFeatureEnabled(companyId, feature, request) {
//   // This would check against company settings
//   // Implementation depends on your feature flag system
//   return true;
// }
















//o(1) code 

















// middleware.js - PROFESSIONAL OPTIMIZED VERSION
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Professional Middleware for WhatsApp E-commerce Application
 * Multi-tenant SaaS support with company isolation
 * OPTIMIZED for performance with O(1) lookups and early returns
 */

// ========== SECURITY HEADERS ==========
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
    ? 'max-age=31536000; includeSubDomains; preload' 
    : 'max-age=0',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-XSS-Protection': '1; mode=block',
};

// ========== OPTIMIZED PATH CLASSIFICATION USING Set() ==========

// Static files that should bypass middleware completely
const staticPaths = new Set([
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/public',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/sw.js',
  '/workbox-',
  '/fallback-',
]);

// Authentication routes that bypass all checks
const authRoutes = new Set([
  '/api/auth/signin',
  '/api/auth/signin/credentials',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/providers',
  '/api/auth/signout',
  '/api/auth/callback/credentials',
  '/api/auth/verify-request',
  '/api/auth/error',
  '/api/auth/new-user',
]);

// ========== PUBLIC CATALOG PATHS - NO AUTH REQUIRED ==========
const catalogPublicPaths = new Set([
  // Frontend Pages
   // Frontend Pages
  '/catalogue',
  '/catalogue/products',
  '/catalogue/wishlist',
  '/catalogue/product',
  
  // API Endpoints
  '/api/products',
  '/api/categories',
  `/api/masters`,
  '/api/catalog',
]);

// WhatsApp API routes - NO AUTH REQUIRED
const whatsappPaths = new Set([
  '/api/whatsapp',
  '/api/whatsapp/webhook',
  '/api/whatsapp/message',
  '/api/whatsapp/status',
  '/api/whatsapp/qr',
  '/api/whatsapp/stats',
  '/api/whatsapp/activity',
   '/api/orders/',
  '/api/orders/public',
  '/api/orders/whatsapp',
  '/api/payments/verify',
  '/api/notifications/webhook',
  '/api/public',
  '/api/companies/with-whatsapp',
  '/api/companies/by-whatsapp',
  '/api/companies/session',
  '/api/health',
  '/api/websocket-status',
  '/api/webhook',
  '/whatsapp-webhook',
  '/api/catalog',
  '/api/catalog/:path*',
  '/catalogue',
  '/catalogue/products',
  '/catalogue/wishlist',
  '/catalogue/products/:path*',
  '/catalogue/wishlist/:path*',

]);

// Setup and config paths
const setupPaths = new Set([
  '/api/setup',
  '/api/config',
  '/api/company-settings',
]);

// Public paths (no auth required)
const publicPaths = new Set([
  '/',
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/error',
  '/auth/verify-request',
  '/auth/new-user',
  '/company-inactive',
  '/company-suspended',
  '/subscription-expired',
  '/no-company',
]);

// Admin paths (accessible by super_admin and company_admin)
const adminPaths = new Set([
  '/admin',
  '/admin/dashboards',
  '/admin/users',
  '/admin/settings',
  '/admin/analytics',
  '/admin/reports',
  '/admin/products',
  '/admin/orders',
  '/admin/bookings',
  '/api/admin',
]);

// Super admin only paths
const superAdminPaths = new Set([
  '/super-admin',
  '/super-admin/dashboard',
  '/super-admin/companies',
  '/super-admin/users',
  '/super-admin/subscriptions',
  '/api/super-admin',
]);

// Manager paths (accessible by admin and manager)
const managerPaths = new Set([
  '/manager',
  '/manager/dashboard',
  '/manager/orders',
  '/manager/inventory',
  '/api/manager',
]);

// ========== HELPER FUNCTIONS ==========

/**
 * Optimized path matching using startsWith for prefix routes
 */
const pathStartsWithAny = (pathname, pathSet) => {
  for (const prefix of pathSet) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }
  return false;
};

/**
 * Check if path is a static file (should bypass middleware)
 */
const isStaticFile = (pathname) => {
  return pathStartsWithAny(pathname, staticPaths) || 
         /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|pdf|webp)$/.test(pathname);
};

/**
 * Check if path is a catalog public route
 */
const isCatalogPublicPath = (pathname) => {
  // Check if path matches any in catalogPublicPaths
  if (pathStartsWithAny(pathname, catalogPublicPaths)) return true;
  
  // Check if path starts with /catalogue/ (covers all catalog pages and product details)
  if (pathname.startsWith('/catalogue/')) return true;
  
  // Check for catalog API routes
  if (pathname.startsWith('/api/catalog')) return true;
  
  return false;
};

/**
 * Check if path is a WhatsApp API route (no auth)
 */
const isWhatsappPath = (pathname) => {
  return pathStartsWithAny(pathname, whatsappPaths);
};

/**
 * Check if path is an authentication route
 */
const isAuthRoute = (pathname) => {
  return pathStartsWithAny(pathname, authRoutes) || pathname.startsWith('/api/auth/');
};

/**
 * Check if path is a setup/config route
 */
const isSetupPath = (pathname) => {
  return pathStartsWithAny(pathname, setupPaths);
};

/**
 * Check if path is public
 */
const isPublicPath = (pathname) => {
  return publicPaths.has(pathname);
};

/**
 * Check if path requires admin access
 */
const isAdminPath = (pathname) => {
  return pathStartsWithAny(pathname, adminPaths);
};

/**
 * Check if path requires super admin access
 */
const isSuperAdminPath = (pathname) => {
  return pathStartsWithAny(pathname, superAdminPaths);
};

/**
 * Check if path requires manager access
 */
const isManagerPath = (pathname) => {
  return pathStartsWithAny(pathname, managerPaths);
};

/**
 * Check if path is an API route
 */
const isApiRoute = (pathname) => {
  return pathname.startsWith('/api/');
};

/**
 * Enhance token with computed properties (cached for performance)
 */
const userCache = new Map();
const CACHE_TTL = 5000; // 5 seconds

function enhanceUserFromToken(token) {
  if (!token) return null;
  
  // Use cached version if available
  const cacheKey = token.email || token.sub;
  const cached = userCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  
  const isSuperAdmin = token.role === 'admin' && token.adminType === 'super';
  const isCompanyAdmin = token.role === 'admin' && token.adminType === 'company';
  const isAdmin = token.role === 'admin';
  const isManager = token.role === 'manager';
  const isManagerOrAdmin = isAdmin || isManager;
  
  const subscriptionExpired = token.subscriptionExpiry ? 
    new Date(token.subscriptionExpiry) < new Date() : false;
  
  const user = {
    ...token,
    isSuperAdmin,
    isCompanyAdmin,
    isAdmin,
    isManager,
    isManagerOrAdmin,
    subscriptionExpired,
    roleDisplay: isSuperAdmin ? 'Super Admin' : 
                 isCompanyAdmin ? 'Company Admin' : 
                 isManager ? 'Manager' : 'User',
  };
  
  // Cache the result
  userCache.set(cacheKey, { user, timestamp: Date.now() });
  
  return user;
}

/**
 * Get authenticated redirect path
 */
const getAuthenticatedRedirectPath = (user) => {
  if (user.isSuperAdmin) return '/super-admin/dashboard';
  if (user.isAdmin) return '/admin/dashboards';
  if (user.role === 'manager') return '/manager/dashboard';
  return '/dashboards';
};

// ========== MAIN MIDDLEWARE FUNCTION ==========

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();
  
  // ===== EARLY RETURN: Static files bypass middleware completely =====
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }
  
  // Apply security headers to all responses
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // ===== EARLY RETURN: CATALOG PUBLIC PATHS - NO AUTH REQUIRED =====
  if (isCatalogPublicPath(pathname)) {
    console.log(`📱 [Middleware] Catalog public: ${pathname} - ${Date.now() - startTime}ms`);
    response.headers.set('X-Access-Type', 'catalog-public');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  }
  
  // ===== EARLY RETURN: WhatsApp API routes - FASTEST PATH =====
  if (isWhatsappPath(pathname)) {
    console.log(`📱 [Middleware] WhatsApp API: ${pathname} - ${Date.now() - startTime}ms`);
    response.headers.set('X-Access-Type', 'whatsapp-public-api');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
  
  // ===== EARLY RETURN: Auth routes bypass all checks =====
  if (isAuthRoute(pathname)) {
    console.log(`🔑 [Middleware] Auth route: ${pathname} - ${Date.now() - startTime}ms`);
    return response;
  }
  
  // ===== EARLY RETURN: Setup/Config paths =====
  if (isSetupPath(pathname)) {
    console.log(`⚙️ [Middleware] Setup path: ${pathname} - ${Date.now() - startTime}ms`);
    return response;
  }
  
  // Get session token (cached by NextAuth)
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });
  
  // Development logging (can be disabled in production)
  if (process.env.NODE_ENV === 'development' && !isPublicPath(pathname)) {
    console.log(`🌐 [Middleware] ${request.method} ${pathname} - ${Date.now() - startTime}ms`, {
      authenticated: !!token,
      user: token?.email,
      role: token?.role,
      adminType: token?.adminType,
    });
  }
  
  // ===== CHECK PUBLIC PATHS =====
  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from auth pages
    if (token && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
      console.log(`🔄 [Middleware] Redirecting authenticated user from ${pathname}`);
      const user = enhanceUserFromToken(token);
      const redirectPath = getAuthenticatedRedirectPath(user);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    console.log(`✅ [Middleware] Public path: ${pathname} - ${Date.now() - startTime}ms`);
    return response;
  }
  
  // ===== PROTECTED ROUTES - AUTHENTICATION REQUIRED =====
  if (!token) {
    console.log(`❌ [Middleware] No session for protected path: ${pathname}`);
    
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer realm="API"'
          }
        }
      );
    }
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }
  
  // Enhance token with computed properties (cached)
  const user = enhanceUserFromToken(token);
  
  // ===== USER VERIFICATION CHECK =====
  if (!user.isVerified && !pathname.includes('/verify-email')) {
    console.log(`⚠️ [Middleware] Unverified user: ${user.email}`);
    
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email not verified',
          message: 'Please verify your email address',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }
    
    const verifyUrl = new URL('/verify-email', request.url);
    verifyUrl.searchParams.set('email', user.email);
    verifyUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(verifyUrl);
  }
  
  // ===== USER STATUS CHECK =====
  if (user.status !== 'active') {
    console.log(`❌ [Middleware] Non-active account: ${user.email}, status: ${user.status}`);
    
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Account inactive',
          message: `Your account is ${user.status}. Please contact support.`,
          code: 'ACCOUNT_INACTIVE',
          status: user.status
        },
        { status: 403 }
      );
    }
    
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('error', 'AccountInactive');
    errorUrl.searchParams.set('status', user.status);
    
    const redirectResponse = NextResponse.redirect(errorUrl);
    
    // Clear auth cookies
    ['next-auth.session-token', '__Secure-next-auth.session-token', 
     'next-auth.csrf-token', '__Host-next-auth.csrf-token'].forEach(cookieName => {
      redirectResponse.cookies.delete(cookieName);
    });
    
    return redirectResponse;
  }
  
  // ===== COMPANY STATUS CHECK (skip for super admin) =====
  if (!user.isSuperAdmin) {
    if (!user.companyId) {
      console.log(`❌ [Middleware] User has no company: ${user.email}`);
      
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No company association',
            message: 'Your account is not associated with any company.',
            code: 'NO_COMPANY'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL('/no-company', request.url));
    }
    
    if (user.companyStatus !== 'active') {
      console.log(`❌ [Middleware] Company not active: ${user.companyId}, status: ${user.companyStatus}`);
      
      const companyErrorPage = user.companyStatus === 'suspended' ? '/company-suspended' : 
                              user.companyStatus === 'inactive' ? '/company-inactive' : 
                              '/company-inactive';
      
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { 
            success: false,
            error: `Company is ${user.companyStatus}`,
            message: `Your company account is ${user.companyStatus}. Please contact support.`,
            code: 'COMPANY_INACTIVE',
            companyStatus: user.companyStatus
          },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL(companyErrorPage, request.url));
    }
    
    if (user.subscriptionExpired) {
      console.log(`❌ [Middleware] Company subscription expired: ${user.companyId}`);
      
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Subscription expired',
            message: 'Your company subscription has expired. Please renew to continue.',
            code: 'SUBSCRIPTION_EXPIRED'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL('/subscription-expired', request.url));
    }
  }
  
  // ===== ROLE-BASED ACCESS CONTROL =====
  
  // Super admin paths
  if (isSuperAdminPath(pathname) && !user.isSuperAdmin) {
    console.log(`⛔ [Middleware] Non-super-admin accessing super admin route`);
    
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Super admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }
    
    return NextResponse.redirect(new URL('/admin/dashboards', request.url));
  }
  
  // Admin paths
  if (isAdminPath(pathname) && !user.isAdmin) {
    console.log(`⛔ [Middleware] Non-admin accessing admin route`);
    
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }
    
    return NextResponse.redirect(new URL('/dashboards', request.url));
  }
  
  // Manager paths
  if (isManagerPath(pathname) && !user.isManagerOrAdmin) {
    console.log(`⛔ [Middleware] Unauthorized user accessing manager route`);
    
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Manager or admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }
    
    return NextResponse.redirect(new URL('/dashboards', request.url));
  }
  
  // ===== AUTHORIZED: Add user context to headers for API routes =====
  console.log(`✅ [Middleware] Authorized: ${user.email} (${user.role}) -> ${pathname} - ${Date.now() - startTime}ms`);
  
  if (isApiRoute(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-status', user.status);
    requestHeaders.set('x-user-admin-type', user.adminType || '');
    
    // Add company context for multi-tenancy
    if (user.companyId) {
      requestHeaders.set('x-company-id', user.companyId);
      requestHeaders.set('x-company-name', user.companyName || '');
      requestHeaders.set('x-company-status', user.companyStatus || '');
    }
    
    // Super admin can specify company in headers
    if (user.isSuperAdmin) {
      const headerCompanyId = request.headers.get('x-company-id');
      if (headerCompanyId) {
        requestHeaders.set('x-company-id', headerCompanyId);
        requestHeaders.set('x-company-context', 'super-admin-switched');
      }
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return response;
}

// ========== CLEANUP CACHE INTERVAL ==========
// Clear user cache every minute to prevent memory leaks
setInterval(() => {
  userCache.clear();
  console.log('🧹 [Middleware] User cache cleared');
}, 60000);

// ========== MIDDLEWARE CONFIGURATION ==========
export const config = {
  matcher: [
    // Only run on these paths (exclude static files)
    '/api/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
    '/manager/:path*',
    '/catalogue/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

// ========== EXPORTED HELPER FUNCTIONS ==========

export async function requireAuth(request, options = {}) {
  const { 
    requiredRole = null, 
    requireCompany = true,
    requireActiveCompany = true,
    allowSuperAdmin = true 
  } = options;
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) {
    return {
      authorized: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource',
      status: 401,
      code: 'UNAUTHORIZED'
    };
  }
  
  const user = enhanceUserFromToken(token);
  
  if (!user.isVerified) {
    return {
      authorized: false,
      error: 'Email verification required',
      message: 'Please verify your email address',
      status: 403,
      code: 'EMAIL_NOT_VERIFIED'
    };
  }
  
  if (user.status !== 'active') {
    return {
      authorized: false,
      error: 'Account is not active',
      message: `Your account is ${user.status}. Please contact support.`,
      status: 403,
      code: 'ACCOUNT_INACTIVE',
      userStatus: user.status
    };
  }
  
  if (requireCompany && !user.isSuperAdmin) {
    if (!user.companyId) {
      return {
        authorized: false,
        error: 'No company association',
        message: 'Your account is not associated with any company.',
        status: 403,
        code: 'NO_COMPANY'
      };
    }
    
    if (requireActiveCompany && user.companyStatus !== 'active') {
      return {
        authorized: false,
        error: `Company is ${user.companyStatus}`,
        message: `Your company is ${user.companyStatus}. Please contact support.`,
        status: 403,
        code: 'COMPANY_INACTIVE',
        companyStatus: user.companyStatus
      };
    }
    
    if (user.subscriptionExpired) {
      return {
        authorized: false,
        error: 'Subscription expired',
        message: 'Your company subscription has expired.',
        status: 403,
        code: 'SUBSCRIPTION_EXPIRED'
      };
    }
  }
  
  if (requiredRole) {
    if (requiredRole === 'super_admin' && !user.isSuperAdmin) {
      return {
        authorized: false,
        error: 'Insufficient permissions',
        message: 'Super admin access required',
        status: 403,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole,
        userRole: user.role
      };
    }
    
    if (requiredRole === 'admin' && !user.isAdmin) {
      return {
        authorized: false,
        error: 'Insufficient permissions',
        message: 'Admin access required',
        status: 403,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole,
        userRole: user.role
      };
    }
    
    if (requiredRole === 'manager' && !user.isManagerOrAdmin) {
      return {
        authorized: false,
        error: 'Insufficient permissions',
        message: 'Manager or admin access required',
        status: 403,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole,
        userRole: user.role
      };
    }
  }
  
  let companyId = user.companyId;
  
  if (user.isSuperAdmin) {
    const headerCompanyId = request.headers.get('x-company-id');
    if (headerCompanyId) {
      companyId = headerCompanyId;
    }
  }
  
  return {
    authorized: true,
    user,
    companyId,
    code: 'AUTHORIZED'
  };
}

export async function getWhatsappAuth(request) {
  const whatsappNumber = request.headers.get('x-whatsapp-number') || 
                        request.nextUrl.searchParams.get('whatsapp');
  const companyId = request.headers.get('x-company-id') || 
                   request.nextUrl.searchParams.get('companyId');
  
  if (whatsappNumber) {
    return {
      authorized: true,
      user: {
        id: `whatsapp:${whatsappNumber}`,
        phone: whatsappNumber,
        role: 'user',
        isVerified: true,
        isWhatsappUser: true,
        source: 'whatsapp'
      },
      companyId,
      code: 'WHATSAPP_USER'
    };
  }
  
  return {
    authorized: false,
    error: 'WhatsApp number required',
    message: 'Please provide a WhatsApp number',
    status: 400,
    code: 'WHATSAPP_NUMBER_REQUIRED'
  };
}

export async function getServerAuth(request) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) return null;
  
  const user = enhanceUserFromToken(token);
  
  return {
    user,
    companyId: user.companyId,
    expires: token.exp ? new Date(token.exp * 1000).toISOString() : null,
    sessionValid: user.status === 'active' && user.isVerified && 
                  (user.isSuperAdmin || (user.companyStatus === 'active' && !user.subscriptionExpired))
  };
}

export async function validateCompanyAccess(request, resourceCompanyId) {
  const auth = await requireAuth(request, { requireCompany: true });
  
  if (!auth.authorized) return auth;
  
  if (auth.user.isSuperAdmin) {
    return { ...auth, companyAccess: true };
  }
  
  if (auth.companyId !== resourceCompanyId) {
    return {
      authorized: false,
      error: 'Access denied',
      message: 'You do not have access to this company\'s data',
      status: 403,
      code: 'COMPANY_ACCESS_DENIED'
    };
  }
  
  return { ...auth, companyAccess: true };
}

export async function getCompanyContext(request) {
  const auth = await requireAuth(request, { requireCompany: true });
  return auth.authorized ? auth.companyId : null;
}

export function hasRole(user, requiredRole) {
  if (!user) return false;
  
  if (requiredRole === 'super_admin') return user.isSuperAdmin;
  if (requiredRole === 'admin') return user.isAdmin;
  if (requiredRole === 'company_admin') return user.isCompanyAdmin;
  return user.role === requiredRole;
}

export function hasAnyRole(user, allowedRoles = []) {
  if (!user) return false;
  
  return allowedRoles.some(role => {
    if (role === 'super_admin') return user.isSuperAdmin;
    if (role === 'admin') return user.isAdmin;
    if (role === 'company_admin') return user.isCompanyAdmin;
    return user.role === role;
  });
}

export function canAccess(user, options = {}) {
  const { 
    requiredStatus = 'active', 
    requiredRoles = [],
    requireCompany = true 
  } = options;
  
  if (!user) return false;
  if (user.status !== requiredStatus) return false;
  
  if (requireCompany && !user.isSuperAdmin) {
    if (!user.companyId) return false;
    if (user.companyStatus !== 'active') return false;
    if (user.subscriptionExpired) return false;
  }
  
  if (requiredRoles.length > 0 && !hasAnyRole(user, requiredRoles)) return false;
  
  return true;
}

export function isOnline(user) {
  return user?.status === 'active';
}

export function isOffline(user) {
  return user?.status === 'offline';
}

export function getEffectiveCompanyId(user, requestCompanyId = null) {
  if (user?.isSuperAdmin && requestCompanyId) return requestCompanyId;
  return user?.companyId;
}