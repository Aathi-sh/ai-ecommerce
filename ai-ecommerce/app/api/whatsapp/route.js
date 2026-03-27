

// // app/api/whatsapp/route.js
// // SUPER PROFESSIONAL - Simple, Clean, Multi-Tenant WhatsApp API Route
// // Based on your working old code pattern + company context

// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';

// // WhatsApp bot server URL
// const BOT_SERVER_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:3001';

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
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//   'Access-Control-Allow-Credentials': 'true',
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

// // ========== GET HANDLER - SIMPLE & CLEAN ==========
// export async function GET(request) {
//     try {
//         // Check authentication
//         const session = await getServerSession(authOptions);
        
//         if (!session?.user) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Authentication required' 
//                 },
//                 { 
//                     status: 401,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         const { searchParams } = new URL(request.url);
//         const action = searchParams.get('action');
//         const companyId = searchParams.get('companyId') || session.user.companyId;
        
//         console.log('📱 WhatsApp API Request:', { 
//             action, 
//             companyId,
//             user: session.user.email 
//         });

//         // Validate company access - SIMPLE check
//         if (!companyId) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Company ID is required' 
//                 },
//                 { 
//                     status: 400,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         // Check if user has access to this company (SUPER ADMIN support)
//         const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
//         const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
//         if (!hasCompanyAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'You do not have access to this company' 
//                 },
//                 { 
//                     status: 403,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         let response;
//         let url;
        
//         // SIMPLE switch statement - just like your old working code
//         switch (action) {
//             case 'status':
//                 // Get company-specific status
//                 url = `${BOT_SERVER_URL}/api/status?companyId=${companyId}`;
//                 break;
                
//             case 'qr':
//                 // Get QR code for specific company
//                 url = `${BOT_SERVER_URL}/api/qr?companyId=${companyId}`;
//                 break;
                
//             case 'stats':
//                 // Get stats for specific company
//                 url = `${BOT_SERVER_URL}/api/stats?companyId=${companyId}`;
//                 break;
                
//             case 'activity':
//                 // Get activity log for company
//                 const limit = searchParams.get('limit') || 8;
//                 url = `${BOT_SERVER_URL}/api/activity?companyId=${companyId}&limit=${limit}`;
//                 break;
                
//             case 'session-status':
//                 // Get session status for company
//                 url = `${BOT_SERVER_URL}/api/session-status?companyId=${companyId}`;
//                 break;
                
//             case 'all-sessions':
//                 // Super admin only: get all company sessions
//                 if (!isSuperAdmin) {
//                     return NextResponse.json(
//                         { 
//                             success: false, 
//                             error: 'Super admin access required' 
//                         },
//                         { 
//                             status: 403,
//                             headers: { ...securityHeaders, ...corsHeaders }
//                         }
//                     );
//                 }
//                 url = `${BOT_SERVER_URL}/api/multi-tenant/stats`;
//                 break;
                
//             default:
//                 // Get full bot information
//                 url = `${BOT_SERVER_URL}/api/bot?companyId=${companyId}`;
//         }

//         console.log(`🔗 Forwarding to: ${url}`);

//         // Forward request to bot server - SIMPLE fetch like your old code
//         response = await fetch(url, {
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });
        
//         // Handle non-JSON responses (like HTML errors)
//         const contentType = response.headers.get('content-type');
//         if (!contentType || !contentType.includes('application/json')) {
//             const text = await response.text();
//             console.error(`❌ Non-JSON response from ${url}:`, text.substring(0, 200));
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Invalid response from bot server',
//                     status: response.status
//                 },
//                 { 
//                     status: 502,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }
        
//         const data = await response.json();
        
//         return NextResponse.json(data, {
//             headers: { ...securityHeaders, ...corsHeaders }
//         });
        
//     } catch (error) {
//         console.error('❌ WhatsApp API GET Error:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Failed to connect to WhatsApp bot server',
//                 message: error.message 
//             },
//             { 
//                 status: 500,
//                 headers: { ...securityHeaders, ...corsHeaders }
//             }
//         );
//     }
// }

// // ========== POST HANDLER - SIMPLE & CLEAN ==========
// export async function POST(request) {
//     try {
//         // Check authentication
//         const session = await getServerSession(authOptions);
        
//         if (!session?.user) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Authentication required' 
//                 },
//                 { 
//                     status: 401,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         const body = await request.json();
//         const { action, companyId: reqCompanyId, ...payload } = body;
        
//         // Use companyId from request or from session
//         const companyId = reqCompanyId || session.user.companyId;
        
//         console.log('📱 WhatsApp API POST Action:', { 
//             action, 
//             companyId,
//             user: session.user.email 
//         });

//         // Validate company access
//         if (!companyId && action !== 'clear-all') {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Company ID is required' 
//                 },
//                 { 
//                     status: 400,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         // Check if user has access to this company
//         const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
//         const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
//         if (!hasCompanyAccess && companyId) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'You do not have access to this company' 
//                 },
//                 { 
//                     status: 403,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         let endpoint;
//         let requestBody = {};
//         let method = 'POST';
        
//         // SIMPLE switch statement - just like your old working code
//         switch (action) {
//             case 'connect':
//                 // Connect specific company's WhatsApp
//                 endpoint = `/api/connect?companyId=${companyId}`;
//                 break;
                
//             case 'disconnect':
//                 // Disconnect specific company
//                 endpoint = `/api/disconnect?companyId=${companyId}`;
//                 break;
                
//             case 'restart':
//                 // Restart specific company's session
//                 endpoint = `/api/restart?companyId=${companyId}`;
//                 break;
                
//             case 'logout':
//                 // Logout specific company
//                 endpoint = `/api/logout?companyId=${companyId}`;
//                 break;
                
//             case 'send_message':
//                 // Send message from specific company
//                 endpoint = `/api/send-message`;
//                 requestBody = {
//                     to: payload.to,
//                     message: payload.message,
//                     companyId: companyId
//                 };
//                 break;
                
//             case 'refresh-qr':
//                 // Request new QR code for company
//                 endpoint = `/api/refresh-qr?companyId=${companyId}`;
//                 break;
                
//             case 'clear_session':
//                 // Clear session for specific company
//                 endpoint = `/api/clear-session?companyId=${companyId}`;
//                 break;
                
//             case 'clear-all':
//                 // Super admin only: clear all sessions
//                 if (!isSuperAdmin) {
//                     return NextResponse.json(
//                         { 
//                             success: false, 
//                             error: 'Super admin access required' 
//                         },
//                         { 
//                             status: 403,
//                             headers: { ...securityHeaders, ...corsHeaders }
//                         }
//                     );
//                 }
//                 endpoint = '/api/clear-all';
//                 break;
                
//             default:
//                 return NextResponse.json(
//                     { 
//                         success: false, 
//                         error: 'Invalid action' 
//                     },
//                     { 
//                         status: 400,
//                         headers: { ...securityHeaders, ...corsHeaders }
//                     }
//                 );
//         }
        
//         console.log(`🔗 Forwarding POST to: ${BOT_SERVER_URL}${endpoint}`);

//         // Forward request to bot server - SIMPLE fetch like your old code
//         const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
//             method: method,
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
//         });
        
//         // Handle non-JSON responses
//         const contentType = response.headers.get('content-type');
//         if (!contentType || !contentType.includes('application/json')) {
//             const text = await response.text();
//             console.error(`❌ Non-JSON response from ${endpoint}:`, text.substring(0, 200));
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Invalid response from bot server',
//                     status: response.status
//                 },
//                 { 
//                     status: 502,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }
        
//         const data = await response.json();
        
//         return NextResponse.json(data, {
//             headers: { ...securityHeaders, ...corsHeaders }
//         });
        
//     } catch (error) {
//         console.error('❌ WhatsApp API POST Error:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Failed to execute action',
//                 message: error.message 
//             },
//             { 
//                 status: 500,
//                 headers: { ...securityHeaders, ...corsHeaders }
//             }
//         );
//     }
// }

// // ========== PUT HANDLER - For settings updates ==========
// export async function PUT(request) {
//     try {
//         // Check authentication
//         const session = await getServerSession(authOptions);
        
//         if (!session?.user) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Authentication required' 
//                 },
//                 { 
//                     status: 401,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         const body = await request.json();
//         const { action, companyId, ...payload } = body;
        
//         console.log('📱 WhatsApp API PUT Action:', { 
//             action, 
//             companyId,
//             user: session.user.email 
//         });

//         // Validate company access
//         if (!companyId && !session.user.companyId) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Company ID is required' 
//                 },
//                 { 
//                     status: 400,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         const targetCompanyId = companyId || session.user.companyId;
        
//         // Check if user has access to this company
//         const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
//         const hasCompanyAccess = session.user.companyId === targetCompanyId || isSuperAdmin;
        
//         if (!hasCompanyAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'You do not have access to this company' 
//                 },
//                 { 
//                     status: 403,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }
        
//         if (action === 'update_settings') {
//             // Update bot settings for specific company
//             const response = await fetch(`${BOT_SERVER_URL}/api/settings?companyId=${targetCompanyId}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(payload.settings)
//             });
            
//             const data = await response.json();
//             return NextResponse.json(data, {
//                 headers: { ...securityHeaders, ...corsHeaders }
//             });
//         }
        
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Invalid action' 
//             },
//             { 
//                 status: 400,
//                 headers: { ...securityHeaders, ...corsHeaders }
//             }
//         );
        
//     } catch (error) {
//         console.error('❌ WhatsApp API PUT Error:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Failed to update settings',
//                 message: error.message 
//             },
//             { 
//                 status: 500,
//                 headers: { ...securityHeaders, ...corsHeaders }
//             }
//         );
//     }
// }

// // ========== DELETE HANDLER - For clearing sessions ==========
// export async function DELETE(request) {
//     try {
//         // Check authentication
//         const session = await getServerSession(authOptions);
        
//         if (!session?.user) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Authentication required' 
//                 },
//                 { 
//                     status: 401,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         const { searchParams } = new URL(request.url);
//         const companyId = searchParams.get('companyId') || session.user.companyId;
//         const sessionId = searchParams.get('sessionId');
        
//         console.log('📱 WhatsApp API DELETE Request:', { 
//             companyId, 
//             sessionId,
//             user: session.user.email 
//         });

//         // Validate access
//         if (!companyId && !sessionId) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Company ID or Session ID required' 
//                 },
//                 { 
//                     status: 400,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         // Check if user has access
//         const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
//         const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
//         if (!hasCompanyAccess && companyId) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'You do not have access to this company' 
//                 },
//                 { 
//                     status: 403,
//                     headers: { ...securityHeaders, ...corsHeaders }
//                 }
//             );
//         }

//         let endpoint;
        
//         if (sessionId) {
//             // Clear specific session
//             endpoint = `/api/sessions/${sessionId}`;
//         } else if (companyId) {
//             // Clear session for company
//             endpoint = `/api/clear-session?companyId=${companyId}`;
//         } else {
//             // Clear all sessions (super admin only)
//             if (!isSuperAdmin) {
//                 return NextResponse.json(
//                     { 
//                         success: false, 
//                         error: 'Super admin access required' 
//                     },
//                     { 
//                         status: 403,
//                         headers: { ...securityHeaders, ...corsHeaders }
//                     }
//                 );
//             }
//             endpoint = '/api/clear-all';
//         }
        
//         // Forward request to bot server
//         const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });
        
//         const data = await response.json();
        
//         return NextResponse.json(data, {
//             headers: { ...securityHeaders, ...corsHeaders }
//         });
        
//     } catch (error) {
//         console.error('❌ WhatsApp API DELETE Error:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Failed to clear sessions',
//                 message: error.message 
//             },
//             { 
//                 status: 500,
//                 headers: { ...securityHeaders, ...corsHeaders }
//             }
//         );
//     }
// }




































// app/api/whatsapp/route.js
// SUPER PROFESSIONAL - Complete Multi-Tenant WhatsApp API Route
// Optimized with caching, rate limiting, and error handling

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';

// WhatsApp bot server URL
const BOT_SERVER_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:3001';

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// ========== IN-MEMORY COMPANY CACHE ==========
const companyCache = new Map();
const CACHE_TTL = 3600000; // 1 hour
const CACHE_MAX_SIZE = 1000;

// Cache statistics
let cacheStats = {
    hits: 0,
    misses: 0,
    totalLookups: 0
};

// Clean expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    let expiredCount = 0;
    for (const [key, entry] of companyCache.entries()) {
        if (entry.expiresAt < now) {
            companyCache.delete(key);
            expiredCount++;
        }
    }
    if (expiredCount > 0) {
        console.log(`🧹 API Route cache cleaned: ${expiredCount} entries (remaining: ${companyCache.size})`);
    }
}, 300000); // Every 5 minutes

function getCachedCompany(companyId) {
    cacheStats.totalLookups++;
    const entry = companyCache.get(companyId);
    if (entry && entry.expiresAt > Date.now()) {
        cacheStats.hits++;
        return entry.data;
    }
    cacheStats.misses++;
    return null;
}

function setCachedCompany(companyId, data) {
    if (companyCache.size >= CACHE_MAX_SIZE) {
        const oldestKey = companyCache.keys().next().value;
        companyCache.delete(oldestKey);
    }
    companyCache.set(companyId, {
        data: data,
        expiresAt: Date.now() + CACHE_TTL,
        cachedAt: new Date().toISOString()
    });
}

function invalidateCompanyCache(companyId) {
    if (companyCache.has(companyId)) {
        companyCache.delete(companyId);
        console.log(`🗑️ Cache invalidated for company: ${companyId}`);
    }
}

// ========== RATE LIMITING ==========
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Per company

function checkRateLimit(companyId) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    const requests = rateLimits.get(companyId) || [];
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }
    
    validRequests.push(now);
    rateLimits.set(companyId, validRequests);
    return true;
}

// Clean rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    for (const [companyId, timestamps] of rateLimits.entries()) {
        const valid = timestamps.filter(t => t > windowStart);
        if (valid.length === 0) {
            rateLimits.delete(companyId);
        } else {
            rateLimits.set(companyId, valid);
        }
    }
}, 60000);

// Security headers
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || process.env.NEXTAUTH_URL 
        : 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-company-id',
    'Access-Control-Allow-Credentials': 'true',
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

// ========== GET HANDLER - WITH CACHE & RATE LIMITING ==========
export async function GET(request) {
    const startTime = Date.now();
    
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const companyId = searchParams.get('companyId') || session.user.companyId;
        
        console.log('📱 WhatsApp API GET Request:', { action, companyId, user: session.user.email });

        // Validate company access
        if (!companyId) {
            return NextResponse.json(
                { success: false, error: 'Company ID is required' },
                { status: 400, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        // Rate limiting check
        if (!checkRateLimit(companyId)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please try again later.' },
                { status: 429, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        // Check company access
        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
        if (!hasCompanyAccess) {
            return NextResponse.json(
                { success: false, error: 'You do not have access to this company' },
                { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        // Check cache for certain actions
        let cachedData = null;
        let useCache = false;
        
        // Only cache read-only actions
        if (action === 'status' || action === 'stats' || action === 'session-status') {
            useCache = true;
            cachedData = getCachedCompany(`${companyId}:${action}`);
        }
        
        if (useCache && cachedData) {
            const duration = Date.now() - startTime;
            console.log(`✅ Cache HIT for ${action} (${duration}ms)`);
            return NextResponse.json({
                ...cachedData,
                fromCache: true,
                cacheStats: { hits: cacheStats.hits, misses: cacheStats.misses }
            }, {
                headers: { ...securityHeaders, ...corsHeaders }
            });
        }

        let response;
        let url;
        
        // SIMPLE switch statement
        switch (action) {
            case 'status':
                url = `${BOT_SERVER_URL}/api/status?companyId=${companyId}`;
                break;
                
            case 'qr':
                url = `${BOT_SERVER_URL}/api/qr?companyId=${companyId}`;
                break;
                
            case 'stats':
                url = `${BOT_SERVER_URL}/api/stats?companyId=${companyId}`;
                break;
                
            case 'activity':
                const limit = searchParams.get('limit') || 8;
                url = `${BOT_SERVER_URL}/api/activity?companyId=${companyId}&limit=${limit}`;
                break;
                
            case 'session-status':
                url = `${BOT_SERVER_URL}/api/session-status?companyId=${companyId}`;
                break;
                
            case 'all-sessions':
                if (!isSuperAdmin) {
                    return NextResponse.json(
                        { success: false, error: 'Super admin access required' },
                        { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
                    );
                }
                url = `${BOT_SERVER_URL}/api/multi-tenant/stats`;
                break;
                
            case 'cache-stats':
                if (!isSuperAdmin) {
                    return NextResponse.json(
                        { success: false, error: 'Super admin access required' },
                        { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
                    );
                }
                return NextResponse.json({
                    success: true,
                    cacheStats: {
                        hits: cacheStats.hits,
                        misses: cacheStats.misses,
                        totalLookups: cacheStats.totalLookups,
                        hitRate: cacheStats.totalLookups > 0 
                            ? ((cacheStats.hits / cacheStats.totalLookups) * 100).toFixed(1) + '%'
                            : '0%',
                        currentSize: companyCache.size,
                        maxSize: CACHE_MAX_SIZE
                    },
                    timestamp: new Date().toISOString()
                }, { headers: { ...securityHeaders, ...corsHeaders } });
                
            default:
                url = `${BOT_SERVER_URL}/api/bot?companyId=${companyId}`;
        }

        console.log(`🔗 Forwarding to: ${url}`);

        // Forward request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
            response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout - bot server not responding');
            }
            throw fetchError;
        }
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`❌ Non-JSON response from ${url}:`, text.substring(0, 200));
            return NextResponse.json(
                { success: false, error: 'Invalid response from bot server', status: response.status },
                { status: 502, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }
        
        const data = await response.json();
        
        // Cache successful responses for read-only actions
        if (useCache && data.success) {
            setCachedCompany(`${companyId}:${action}`, data);
        }
        
        const duration = Date.now() - startTime;
        console.log(`✅ API Response (${duration}ms) - ${action} for company ${companyId}`);
        
        return NextResponse.json({
            ...data,
            responseTime: duration,
            fromCache: false
        }, {
            headers: { ...securityHeaders, ...corsHeaders }
        });
        
    } catch (error) {
        console.error('❌ WhatsApp API GET Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to connect to WhatsApp bot server', message: error.message },
            { status: 500, headers: { ...securityHeaders, ...corsHeaders } }
        );
    }
}

// ========== POST HANDLER - WITH INVALIDATION ==========
export async function POST(request) {
    const startTime = Date.now();
    
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        const body = await request.json();
        const { action, companyId: reqCompanyId, ...payload } = body;
        
        const companyId = reqCompanyId || session.user.companyId;
        
        console.log('📱 WhatsApp API POST Action:', { action, companyId, user: session.user.email });

        // Validate company access
        if (!companyId && action !== 'clear-all') {
            return NextResponse.json(
                { success: false, error: 'Company ID is required' },
                { status: 400, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        // Rate limiting check
        if (companyId && !checkRateLimit(companyId)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please try again later.' },
                { status: 429, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        // Check access
        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
        if (!hasCompanyAccess && companyId) {
            return NextResponse.json(
                { success: false, error: 'You do not have access to this company' },
                { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        let endpoint;
        let requestBody = {};
        let method = 'POST';
        
        // SIMPLE switch statement
        switch (action) {
            case 'connect':
                endpoint = `/api/connect?companyId=${companyId}`;
                // Invalidate cache when connecting
                invalidateCompanyCache(`${companyId}:status`);
                invalidateCompanyCache(`${companyId}:session-status`);
                break;
                
            case 'disconnect':
                endpoint = `/api/disconnect?companyId=${companyId}`;
                invalidateCompanyCache(`${companyId}:status`);
                invalidateCompanyCache(`${companyId}:session-status`);
                break;
                
            case 'restart':
                endpoint = `/api/restart?companyId=${companyId}`;
                invalidateCompanyCache(`${companyId}:status`);
                invalidateCompanyCache(`${companyId}:session-status`);
                break;
                
            case 'logout':
                endpoint = `/api/logout?companyId=${companyId}`;
                invalidateCompanyCache(`${companyId}:status`);
                invalidateCompanyCache(`${companyId}:session-status`);
                break;
                
            case 'send_message':
                endpoint = `/api/send-message`;
                requestBody = {
                    to: payload.to,
                    message: payload.message,
                    companyId: companyId
                };
                break;
                
            case 'refresh-qr':
                endpoint = `/api/refresh-qr?companyId=${companyId}`;
                // Invalidate QR cache
                invalidateCompanyCache(`${companyId}:qr`);
                invalidateCompanyCache(`${companyId}:status`);
                break;
                
            case 'clear_session':
                endpoint = `/api/clear-session?companyId=${companyId}`;
                // Invalidate all cache for this company
                for (const key of companyCache.keys()) {
                    if (key.startsWith(`${companyId}:`)) {
                        companyCache.delete(key);
                    }
                }
                break;
                
            case 'clear-all':
                if (!isSuperAdmin) {
                    return NextResponse.json(
                        { success: false, error: 'Super admin access required' },
                        { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
                    );
                }
                endpoint = '/api/clear-all';
                // Clear all cache
                companyCache.clear();
                break;
                
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400, headers: { ...securityHeaders, ...corsHeaders } }
                );
        }
        
        console.log(`🔗 Forwarding POST to: ${BOT_SERVER_URL}${endpoint}`);

        // Forward request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`❌ Non-JSON response from ${endpoint}:`, text.substring(0, 200));
            return NextResponse.json(
                { success: false, error: 'Invalid response from bot server', status: response.status },
                { status: 502, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }
        
        const data = await response.json();
        
        const duration = Date.now() - startTime;
        console.log(`✅ POST Response (${duration}ms) - ${action} for company ${companyId}`);
        
        return NextResponse.json(data, {
            headers: { ...securityHeaders, ...corsHeaders }
        });
        
    } catch (error) {
        console.error('❌ WhatsApp API POST Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to execute action', message: error.message },
            { status: 500, headers: { ...securityHeaders, ...corsHeaders } }
        );
    }
}

// ========== PUT HANDLER - For settings updates ==========
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        const body = await request.json();
        const { action, companyId, ...payload } = body;
        
        console.log('📱 WhatsApp API PUT Action:', { action, companyId, user: session.user.email });

        if (!companyId && !session.user.companyId) {
            return NextResponse.json(
                { success: false, error: 'Company ID is required' },
                { status: 400, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        const targetCompanyId = companyId || session.user.companyId;
        
        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === targetCompanyId || isSuperAdmin;
        
        if (!hasCompanyAccess) {
            return NextResponse.json(
                { success: false, error: 'You do not have access to this company' },
                { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }
        
        if (action === 'update_settings') {
            // Invalidate cache when settings change
            invalidateCompanyCache(`${targetCompanyId}:status`);
            invalidateCompanyCache(`${targetCompanyId}:session-status`);
            
            const response = await fetch(`${BOT_SERVER_URL}/api/settings?companyId=${targetCompanyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload.settings)
            });
            
            const data = await response.json();
            return NextResponse.json(data, {
                headers: { ...securityHeaders, ...corsHeaders }
            });
        }
        
        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400, headers: { ...securityHeaders, ...corsHeaders } }
        );
        
    } catch (error) {
        console.error('❌ WhatsApp API PUT Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update settings', message: error.message },
            { status: 500, headers: { ...securityHeaders, ...corsHeaders } }
        );
    }
}

// ========== DELETE HANDLER - For clearing sessions ==========
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId') || session.user.companyId;
        const sessionId = searchParams.get('sessionId');
        
        console.log('📱 WhatsApp API DELETE Request:', { companyId, sessionId, user: session.user.email });

        if (!companyId && !sessionId) {
            return NextResponse.json(
                { success: false, error: 'Company ID or Session ID required' },
                { status: 400, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
        if (!hasCompanyAccess && companyId) {
            return NextResponse.json(
                { success: false, error: 'You do not have access to this company' },
                { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
            );
        }

        let endpoint;
        
        if (sessionId) {
            endpoint = `/api/sessions/${sessionId}`;
        } else if (companyId) {
            endpoint = `/api/clear-session?companyId=${companyId}`;
            // Invalidate all cache for this company
            for (const key of companyCache.keys()) {
                if (key.startsWith(`${companyId}:`)) {
                    companyCache.delete(key);
                }
            }
        } else {
            if (!isSuperAdmin) {
                return NextResponse.json(
                    { success: false, error: 'Super admin access required' },
                    { status: 403, headers: { ...securityHeaders, ...corsHeaders } }
                );
            }
            endpoint = '/api/clear-all';
            companyCache.clear();
        }
        
        const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        return NextResponse.json(data, {
            headers: { ...securityHeaders, ...corsHeaders }
        });
        
    } catch (error) {
        console.error('❌ WhatsApp API DELETE Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to clear sessions', message: error.message },
            { status: 500, headers: { ...securityHeaders, ...corsHeaders } }
        );
    }
}

// ========== EXPORT CACHE UTILITIES FOR DEBUGGING ==========
export const _internal = {
    getCacheStats: () => ({
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        totalLookups: cacheStats.totalLookups,
        hitRate: cacheStats.totalLookups > 0 
            ? ((cacheStats.hits / cacheStats.totalLookups) * 100).toFixed(1) + '%'
            : '0%',
        currentSize: companyCache.size,
        maxSize: CACHE_MAX_SIZE,
        ttlSeconds: CACHE_TTL / 1000
    }),
    invalidateCache: (companyId) => invalidateCompanyCache(companyId),
    clearAllCache: () => companyCache.clear()
};