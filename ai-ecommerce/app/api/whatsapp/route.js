// // import { NextResponse } from 'next/server';

// // // WhatsApp bot server URL
// // const BOT_SERVER_URL = 'http://localhost:3001';

// // export async function GET(request) {
// //     try {
// //         const { searchParams } = new URL(request.url);
// //         const action = searchParams.get('action');
        
// //         console.log('📱 WhatsApp API Request:', { action });
        
// //         let response;
        
// //         switch (action) {
// //             case 'status':
// //                 // Get bot status from bot server
// //                 response = await fetch(`${BOT_SERVER_URL}/api/status`);
// //                 const statusData = await response.json();
// //                 return NextResponse.json(statusData);
                
// //             case 'qr':
// //                 // Get current QR code from bot server
// //                 response = await fetch(`${BOT_SERVER_URL}/api/qr`);
// //                 const qrData = await response.json();
// //                 return NextResponse.json(qrData);
                
// //             case 'stats':
// //                 // Get bot statistics
// //                 response = await fetch(`${BOT_SERVER_URL}/api/stats`);
// //                 const statsData = await response.json();
// //                 return NextResponse.json(statsData);
                
// //             default:
// //                 // Get full bot information
// //                 response = await fetch(`${BOT_SERVER_URL}/api/bot`);
// //                 const botData = await response.json();
// //                 return NextResponse.json(botData);
// //         }
        
// //     } catch (error) {
// //         console.error('❌ WhatsApp API Error:', error);
// //         return NextResponse.json(
// //             { 
// //                 success: false, 
// //                 error: 'Failed to connect to WhatsApp bot server',
// //                 message: error.message 
// //             },
// //             { status: 500 }
// //         );
// //     }
// // }

// // export async function POST(request) {
// //     try {
// //         const body = await request.json();
// //         const { action } = body;
        
// //         console.log('📱 WhatsApp API POST Action:', action);
        
// //         let endpoint;
// //         let payload = {};
        
// //         switch (action) {
// //             case 'connect':
// //                 endpoint = '/api/connect';
// //                 break;
                
// //             case 'disconnect':
// //                 endpoint = '/api/disconnect';
// //                 break;
                
// //             case 'restart':
// //                 endpoint = '/api/restart';
// //                 break;
                
// //             case 'logout':
// //                 endpoint = '/api/logout';
// //                 break;
                
// //             case 'send_message':
// //                 endpoint = '/api/send-message';
// //                 payload = {
// //                     to: body.to,
// //                     message: body.message
// //                 };
// //                 break;
                
// //             case 'clear_session':
// //                 endpoint = '/api/clear-session';
// //                 break;
                
// //             default:
// //                 return NextResponse.json(
// //                     { success: false, error: 'Invalid action' },
// //                     { status: 400 }
// //                 );
// //         }
        
// //         // Forward request to bot server
// //         const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify(payload)
// //         });
        
// //         const data = await response.json();
// //         return NextResponse.json(data);
        
// //     } catch (error) {
// //         console.error('❌ WhatsApp API POST Error:', error);
// //         return NextResponse.json(
// //             { 
// //                 success: false, 
// //                 error: 'Failed to execute action',
// //                 message: error.message 
// //             },
// //             { status: 500 }
// //         );
// //     }
// // }

// // export async function PUT(request) {
// //     try {
// //         const body = await request.json();
// //         const { action } = body;
        
// //         if (action === 'update_settings') {
// //             // Update bot settings
// //             const response = await fetch(`${BOT_SERVER_URL}/api/settings`, {
// //                 method: 'PUT',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify(body.settings)
// //             });
            
// //             const data = await response.json();
// //             return NextResponse.json(data);
// //         }
        
// //         return NextResponse.json(
// //             { success: false, error: 'Invalid action' },
// //             { status: 400 }
// //         );
        
// //     } catch (error) {
// //         console.error('❌ WhatsApp API PUT Error:', error);
// //         return NextResponse.json(
// //             { 
// //                 success: false, 
// //                 error: 'Failed to update settings',
// //                 message: error.message 
// //             },
// //             { status: 500 }
// //         );
// //     }
// // }

// // export async function DELETE(request) {
// //     try {
// //         // Clear all sessions
// //         const response = await fetch(`${BOT_SERVER_URL}/api/clear-all`, {
// //             method: 'DELETE'
// //         });
        
// //         const data = await response.json();
// //         return NextResponse.json(data);
        
// //     } catch (error) {
// //         console.error('❌ WhatsApp API DELETE Error:', error);
// //         return NextResponse.json(
// //             { 
// //                 success: false, 
// //                 error: 'Failed to clear sessions',
// //                 message: error.message 
// //             },
// //             { status: 500 }
// //         );
// //     }
// // }






// // app/api/whatsapp/route.js
// // PROFESSIONAL WHATSAPP API ROUTE - Multi-tenant support
// // Handles all WhatsApp bot operations with company context

// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';

// // WhatsApp bot server URL
// const BOT_SERVER_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:3001';
// const BOT_API_KEY = process.env.WHATSAPP_BOT_API_KEY || 'dev-bot-key-2024';

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

// // ========== GET HANDLER ==========
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

//         // Validate company access
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

//         // Check if user has access to this company
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
        
//         switch (action) {
//             case 'status':
//                 // Get company-specific status - FIXED: Use query param
//                 url = `${BOT_SERVER_URL}/api/status?companyId=${companyId}`;
//                 break;
                
//             case 'qr':
//                 // Get QR code for specific company - FIXED: Use query param
//                 url = `${BOT_SERVER_URL}/api/qr?companyId=${companyId}`;
//                 break;
                
//             case 'stats':
//                 // Get stats for specific company - FIXED: Use query param
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

//         // Forward request to bot server with API key
//         response = await fetch(url, {
//             headers: {
//                 'x-api-key': BOT_API_KEY,
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

// // ========== POST HANDLER ==========
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
//         if (!companyId && action !== 'connect' && action !== 'clear-all') {
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
        
//         // Forward request to bot server with API key
//         const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
//             method: method,
//             headers: {
//                 'x-api-key': BOT_API_KEY,
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

// // ========== PUT HANDLER ==========
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
//                     'x-api-key': BOT_API_KEY,
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

// // ========== DELETE HANDLER ==========
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
//                 'x-api-key': BOT_API_KEY,
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
// SUPER PROFESSIONAL - Simple, Clean, Multi-Tenant WhatsApp API Route
// Based on your working old code pattern + company context

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
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

// ========== GET HANDLER - SIMPLE & CLEAN ==========
export async function GET(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Authentication required' 
                },
                { 
                    status: 401,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const companyId = searchParams.get('companyId') || session.user.companyId;
        
        console.log('📱 WhatsApp API Request:', { 
            action, 
            companyId,
            user: session.user.email 
        });

        // Validate company access - SIMPLE check
        if (!companyId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Company ID is required' 
                },
                { 
                    status: 400,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        // Check if user has access to this company (SUPER ADMIN support)
        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
        if (!hasCompanyAccess) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'You do not have access to this company' 
                },
                { 
                    status: 403,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        let response;
        let url;
        
        // SIMPLE switch statement - just like your old working code
        switch (action) {
            case 'status':
                // Get company-specific status
                url = `${BOT_SERVER_URL}/api/status?companyId=${companyId}`;
                break;
                
            case 'qr':
                // Get QR code for specific company
                url = `${BOT_SERVER_URL}/api/qr?companyId=${companyId}`;
                break;
                
            case 'stats':
                // Get stats for specific company
                url = `${BOT_SERVER_URL}/api/stats?companyId=${companyId}`;
                break;
                
            case 'activity':
                // Get activity log for company
                const limit = searchParams.get('limit') || 8;
                url = `${BOT_SERVER_URL}/api/activity?companyId=${companyId}&limit=${limit}`;
                break;
                
            case 'session-status':
                // Get session status for company
                url = `${BOT_SERVER_URL}/api/session-status?companyId=${companyId}`;
                break;
                
            case 'all-sessions':
                // Super admin only: get all company sessions
                if (!isSuperAdmin) {
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: 'Super admin access required' 
                        },
                        { 
                            status: 403,
                            headers: { ...securityHeaders, ...corsHeaders }
                        }
                    );
                }
                url = `${BOT_SERVER_URL}/api/multi-tenant/stats`;
                break;
                
            default:
                // Get full bot information
                url = `${BOT_SERVER_URL}/api/bot?companyId=${companyId}`;
        }

        console.log(`🔗 Forwarding to: ${url}`);

        // Forward request to bot server - SIMPLE fetch like your old code
        response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        // Handle non-JSON responses (like HTML errors)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`❌ Non-JSON response from ${url}:`, text.substring(0, 200));
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Invalid response from bot server',
                    status: response.status
                },
                { 
                    status: 502,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }
        
        const data = await response.json();
        
        return NextResponse.json(data, {
            headers: { ...securityHeaders, ...corsHeaders }
        });
        
    } catch (error) {
        console.error('❌ WhatsApp API GET Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to connect to WhatsApp bot server',
                message: error.message 
            },
            { 
                status: 500,
                headers: { ...securityHeaders, ...corsHeaders }
            }
        );
    }
}

// ========== POST HANDLER - SIMPLE & CLEAN ==========
export async function POST(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Authentication required' 
                },
                { 
                    status: 401,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        const body = await request.json();
        const { action, companyId: reqCompanyId, ...payload } = body;
        
        // Use companyId from request or from session
        const companyId = reqCompanyId || session.user.companyId;
        
        console.log('📱 WhatsApp API POST Action:', { 
            action, 
            companyId,
            user: session.user.email 
        });

        // Validate company access
        if (!companyId && action !== 'clear-all') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Company ID is required' 
                },
                { 
                    status: 400,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        // Check if user has access to this company
        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
        if (!hasCompanyAccess && companyId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'You do not have access to this company' 
                },
                { 
                    status: 403,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        let endpoint;
        let requestBody = {};
        let method = 'POST';
        
        // SIMPLE switch statement - just like your old working code
        switch (action) {
            case 'connect':
                // Connect specific company's WhatsApp
                endpoint = `/api/connect?companyId=${companyId}`;
                break;
                
            case 'disconnect':
                // Disconnect specific company
                endpoint = `/api/disconnect?companyId=${companyId}`;
                break;
                
            case 'restart':
                // Restart specific company's session
                endpoint = `/api/restart?companyId=${companyId}`;
                break;
                
            case 'logout':
                // Logout specific company
                endpoint = `/api/logout?companyId=${companyId}`;
                break;
                
            case 'send_message':
                // Send message from specific company
                endpoint = `/api/send-message`;
                requestBody = {
                    to: payload.to,
                    message: payload.message,
                    companyId: companyId
                };
                break;
                
            case 'refresh-qr':
                // Request new QR code for company
                endpoint = `/api/refresh-qr?companyId=${companyId}`;
                break;
                
            case 'clear_session':
                // Clear session for specific company
                endpoint = `/api/clear-session?companyId=${companyId}`;
                break;
                
            case 'clear-all':
                // Super admin only: clear all sessions
                if (!isSuperAdmin) {
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: 'Super admin access required' 
                        },
                        { 
                            status: 403,
                            headers: { ...securityHeaders, ...corsHeaders }
                        }
                    );
                }
                endpoint = '/api/clear-all';
                break;
                
            default:
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Invalid action' 
                    },
                    { 
                        status: 400,
                        headers: { ...securityHeaders, ...corsHeaders }
                    }
                );
        }
        
        console.log(`🔗 Forwarding POST to: ${BOT_SERVER_URL}${endpoint}`);

        // Forward request to bot server - SIMPLE fetch like your old code
        const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
        });
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`❌ Non-JSON response from ${endpoint}:`, text.substring(0, 200));
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Invalid response from bot server',
                    status: response.status
                },
                { 
                    status: 502,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }
        
        const data = await response.json();
        
        return NextResponse.json(data, {
            headers: { ...securityHeaders, ...corsHeaders }
        });
        
    } catch (error) {
        console.error('❌ WhatsApp API POST Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to execute action',
                message: error.message 
            },
            { 
                status: 500,
                headers: { ...securityHeaders, ...corsHeaders }
            }
        );
    }
}

// ========== PUT HANDLER - For settings updates ==========
export async function PUT(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Authentication required' 
                },
                { 
                    status: 401,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        const body = await request.json();
        const { action, companyId, ...payload } = body;
        
        console.log('📱 WhatsApp API PUT Action:', { 
            action, 
            companyId,
            user: session.user.email 
        });

        // Validate company access
        if (!companyId && !session.user.companyId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Company ID is required' 
                },
                { 
                    status: 400,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        const targetCompanyId = companyId || session.user.companyId;
        
        // Check if user has access to this company
        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === targetCompanyId || isSuperAdmin;
        
        if (!hasCompanyAccess) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'You do not have access to this company' 
                },
                { 
                    status: 403,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }
        
        if (action === 'update_settings') {
            // Update bot settings for specific company
            const response = await fetch(`${BOT_SERVER_URL}/api/settings?companyId=${targetCompanyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload.settings)
            });
            
            const data = await response.json();
            return NextResponse.json(data, {
                headers: { ...securityHeaders, ...corsHeaders }
            });
        }
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Invalid action' 
            },
            { 
                status: 400,
                headers: { ...securityHeaders, ...corsHeaders }
            }
        );
        
    } catch (error) {
        console.error('❌ WhatsApp API PUT Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to update settings',
                message: error.message 
            },
            { 
                status: 500,
                headers: { ...securityHeaders, ...corsHeaders }
            }
        );
    }
}

// ========== DELETE HANDLER - For clearing sessions ==========
export async function DELETE(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Authentication required' 
                },
                { 
                    status: 401,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId') || session.user.companyId;
        const sessionId = searchParams.get('sessionId');
        
        console.log('📱 WhatsApp API DELETE Request:', { 
            companyId, 
            sessionId,
            user: session.user.email 
        });

        // Validate access
        if (!companyId && !sessionId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Company ID or Session ID required' 
                },
                { 
                    status: 400,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        // Check if user has access
        const isSuperAdmin = session.user.role === 'admin' && session.user.adminType === 'super';
        const hasCompanyAccess = session.user.companyId === companyId || isSuperAdmin;
        
        if (!hasCompanyAccess && companyId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'You do not have access to this company' 
                },
                { 
                    status: 403,
                    headers: { ...securityHeaders, ...corsHeaders }
                }
            );
        }

        let endpoint;
        
        if (sessionId) {
            // Clear specific session
            endpoint = `/api/sessions/${sessionId}`;
        } else if (companyId) {
            // Clear session for company
            endpoint = `/api/clear-session?companyId=${companyId}`;
        } else {
            // Clear all sessions (super admin only)
            if (!isSuperAdmin) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Super admin access required' 
                    },
                    { 
                        status: 403,
                        headers: { ...securityHeaders, ...corsHeaders }
                    }
                );
            }
            endpoint = '/api/clear-all';
        }
        
        // Forward request to bot server
        const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        return NextResponse.json(data, {
            headers: { ...securityHeaders, ...corsHeaders }
        });
        
    } catch (error) {
        console.error('❌ WhatsApp API DELETE Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to clear sessions',
                message: error.message 
            },
            { 
                status: 500,
                headers: { ...securityHeaders, ...corsHeaders }
            }
        );
    }
}