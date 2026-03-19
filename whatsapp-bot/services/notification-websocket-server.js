


// import WebSocket from 'ws';
// import { v4 as uuidv4 } from 'uuid';
// import http from 'http';
// import axios from 'axios';

// // Import Firebase Admin (handle optional import)
// let firebaseAdmin = null;
// let firebaseEnabled = false;

// try {
//     // Try to import Firebase if available
//     const { messaging } = await import('../services/firebase/firebase-admin.js');
//     firebaseAdmin = { messaging };
//     firebaseEnabled = process.env.FIREBASE_ENABLED !== 'false';
//     console.log('🔥 Firebase notifications: ENABLED');
// } catch (error) {
//     console.log('🔥 Firebase notifications: DISABLED -', error.message);
//     firebaseEnabled = false;
// }

// class NotificationWebSocketServer {
//     constructor() {
//         this.wss = null;
//         this.server = null;
//         this.port = process.env.NOTIFICATION_WS_PORT || 3000;
//         this.nextjsApiUrl = process.env.NEXTJS_API_URL || 'http://localhost:3000';
        
//         // Client management
//         this.clients = new Map(); // clientId -> { ws, metadata }
//         this.admins = new Set(); // admin clientIds
//         this.users = new Map(); // phone -> [clientIds]
        
//         // Simple token storage (memory only - for caching)
//         this.fcmTokens = new Set(); // Cache of active FCM tokens
//         this.firebaseEnabled = firebaseEnabled;
        
//         this.stats = {
//             totalConnections: 0,
//             currentConnections: 0,
//             notificationsSent: 0,
//             firebaseNotifications: 0,
//             startedAt: null
//         };
//     }

//     // ✅ ADDED: Method that accepts port parameter
//     async start(port = null) {
//         // Use provided port or default
//         if (port) {
//             this.port = port;
//         }
//         return await this._startInternal();
//     }

//     // ✅ ADDED: Internal start method
//     async _startInternal() {
//         return new Promise((resolve, reject) => {
//             try {
//                 // Create HTTP server
//                 this.server = http.createServer((req, res) => {
//                     res.writeHead(404);
//                     res.end();
//                 });

//                 // Create WebSocket server
//                 this.wss = new WebSocket.Server({
//                     server: this.server,
//                     path: '/ws/notifications'
//                 });

//                 // Start server
//                 this.server.listen(this.port, () => {
//                     console.log('🔔 Notification WebSocket Server running');
//                     console.log(`🌐 Port: ${this.port}`);
//                     console.log(`🔥 Firebase: ${this.firebaseEnabled ? 'ENABLED' : 'DISABLED'}`);
//                     console.log(`🔗 Next.js API: ${this.nextjsApiUrl}`);
                    
//                     this.stats.startedAt = Date.now();
//                     this.setupWebSocketHandlers();
                    
//                     resolve({
//                         port: this.port,
//                         status: 'running',
//                         firebase: this.firebaseEnabled,
//                         startedAt: new Date().toISOString()
//                     });
//                 });

//                 this.server.on('error', reject);

//             } catch (error) {
//                 console.error('❌ Failed to start WebSocket server:', error);
//                 reject(error);
//             }
//         });
//     }

//     setupWebSocketHandlers() {
//         this.wss.on('connection', (ws, req) => {
//             this.handleConnection(ws, req);
//         });

//         this.wss.on('error', (error) => {
//             console.error('WebSocket error:', error.message);
//         });
//     }

//     handleConnection(ws, req) {
//         const clientId = uuidv4();
//         const ip = req.socket.remoteAddress || 'unknown';
        
//         this.stats.totalConnections++;
//         this.stats.currentConnections++;

//         console.log(`🔗 New connection: ${clientId.substring(0, 8)} from ${ip}`);

//         // Initialize client
//         const client = {
//             ws,
//             id: clientId,
//             ip,
//             connectedAt: new Date(),
//             metadata: {
//                 authenticated: false,
//                 role: null,
//                 userId: null,
//                 phoneNumber: null
//             }
//         };

//         this.clients.set(clientId, client);

//         // Send welcome message
//         this.sendToClient(clientId, {
//             type: 'CONNECTED',
//             clientId,
//             serverTime: new Date().toISOString(),
//             message: 'Connected to Notification Server'
//         });

//         // Set up event handlers
//         ws.on('message', (data) => {
//             this.handleMessage(clientId, data);
//         });

//         ws.on('close', () => {
//             this.handleDisconnection(clientId);
//         });

//         ws.on('error', (error) => {
//             console.error(`Client ${clientId.substring(0, 8)} error:`, error.message);
//             this.handleDisconnection(clientId);
//         });

//         // Request authentication after 1 second
//         setTimeout(() => {
//             if (this.clients.has(clientId)) {
//                 this.sendToClient(clientId, {
//                     type: 'AUTHENTICATE_REQUEST',
//                     message: 'Authentication required',
//                     timestamp: new Date().toISOString()
//                 });
//             }
//         }, 1000);
//     }

//     handleMessage(clientId, rawData) {
//         try {
//             const data = JSON.parse(rawData.toString());
//             const { type, ...payload } = data;

//             switch (type) {
//                 case 'AUTHENTICATE':
//                     this.handleAuthentication(clientId, payload);
//                     break;
                    
//                 case 'PING':
//                     this.sendToClient(clientId, {
//                         type: 'PONG',
//                         timestamp: new Date().toISOString()
//                     });
//                     break;
                    
//                 case 'REGISTER_FCM_TOKEN':
//                     this.handleFCMTokenRegistration(clientId, payload);
//                     break;
                    
//                 default:
//                     console.log(`Unknown message type: ${type} from ${clientId.substring(0, 8)}`);
//             }
//         } catch (error) {
//             console.error(`Message parsing error from ${clientId.substring(0, 8)}:`, error.message);
//         }
//     }

//     async handleAuthentication(clientId, data) {
//         const { token, userId, role, phoneNumber, fcmToken } = data;
//         const client = this.clients.get(clientId);
        
//         if (!client) return;

//         // Simple authentication
//         const isValid = this.validateAuth(token, role);
        
//         if (isValid) {
//             client.metadata = {
//                 ...client.metadata,
//                 authenticated: true,
//                 role,
//                 userId,
//                 phoneNumber,
//                 fcmToken,
//                 authenticatedAt: new Date().toISOString()
//             };

//             // Register FCM token if provided - SAVE TO NEXT.JS DB
//             if (fcmToken && role === 'admin') {
//                 try {
//                     await this.saveFCMTokenToNextJS(fcmToken, userId, client);
//                     console.log(`📱 Admin FCM token registered and saved to Next.js DB`);
//                 } catch (error) {
//                     console.error('❌ Failed to save FCM token to Next.js:', error.message);
//                 }
//             }

//             // Register based on role
//             if (role === 'admin') {
//                 this.admins.add(clientId);
//                 console.log(`👑 Admin authenticated: ${userId || 'Unknown'} (${clientId.substring(0, 8)})`);
//             } else if (role === 'user' && phoneNumber) {
//                 if (!this.users.has(phoneNumber)) {
//                     this.users.set(phoneNumber, []);
//                 }
//                 this.users.get(phoneNumber).push(clientId);
//                 console.log(`👤 User authenticated: ${phoneNumber} (${clientId.substring(0, 8)})`);
//             }

//             this.sendToClient(clientId, {
//                 type: 'AUTHENTICATE_SUCCESS',
//                 message: 'Authentication successful',
//                 role,
//                 userId,
//                 phoneNumber,
//                 timestamp: new Date().toISOString()
//             });

//         } else {
//             this.sendToClient(clientId, {
//                 type: 'AUTHENTICATE_FAILED',
//                 message: 'Authentication failed',
//                 timestamp: new Date().toISOString()
//             });
            
//             setTimeout(() => {
//                 this.disconnectClient(clientId, 1008, 'Authentication failed');
//             }, 3000);
//         }
//     }

//     async handleFCMTokenRegistration(clientId, data) {
//         const { token, role } = data;
//         const client = this.clients.get(clientId);
        
//         if (!client || !client.metadata.authenticated) {
//             this.sendToClient(clientId, {
//                 type: 'FCM_REGISTRATION_FAILED',
//                 message: 'Authentication required'
//             });
//             return;
//         }

//         if (role === 'admin' && token) {
//             try {
//                 await this.saveFCMTokenToNextJS(token, client.metadata.userId, client);
//                 this.fcmTokens.add(token);
//                 console.log(`📱 Admin FCM token registered: ${token.substring(0, 20)}...`);
                
//                 this.sendToClient(clientId, {
//                     type: 'FCM_TOKEN_REGISTERED',
//                     message: 'FCM token registered successfully'
//                 });
//             } catch (error) {
//                 console.error('❌ Failed to register FCM token:', error.message);
//                 this.sendToClient(clientId, {
//                     type: 'FCM_REGISTRATION_FAILED',
//                     message: 'Failed to register FCM token'
//                 });
//             }
//         }
//     }

//     validateAuth(token, role) {
//         if (role === 'admin') {
//             return token === process.env.ADMIN_API_KEY;
//         } else if (role === 'user') {
//             return true; // For users, we can accept any token for now
//         }
//         return false;
//     }

//     handleDisconnection(clientId) {
//         const client = this.clients.get(clientId);
//         if (client) {
//             this.stats.currentConnections--;
            
//             console.log(`🔌 Disconnected: ${clientId.substring(0, 8)}`);

//             // Clean up from collections
//             if (client.metadata.authenticated) {
//                 if (client.metadata.role === 'admin') {
//                     this.admins.delete(clientId);
//                 } else if (client.metadata.role === 'user' && client.metadata.phoneNumber) {
//                     const userClients = this.users.get(client.metadata.phoneNumber);
//                     if (userClients) {
//                         const filtered = userClients.filter(id => id !== clientId);
//                         if (filtered.length === 0) {
//                             this.users.delete(client.metadata.phoneNumber);
//                         } else {
//                             this.users.set(client.metadata.phoneNumber, filtered);
//                         }
//                     }
//                 }
//             }

//             this.clients.delete(clientId);
//         }
//     }

//     // ========== FCM TOKEN MANAGEMENT ==========

//     async saveFCMTokenToNextJS(token, userId, client) {
//         try {
//             const response = await axios.post(`${this.nextjsApiUrl}/api/auth/fcm-token`, {
//                 token,
//                 userId,
//                 role: client.metadata.role || 'admin',
//                 deviceInfo: {
//                     userAgent: client.metadata.userAgent || '',
//                     platform: client.metadata.platform || '',
//                     ip: client.ip,
//                     connectedAt: client.connectedAt
//                 }
//             });
            
//             // Cache the token locally for faster access
//             this.fcmTokens.add(token);
            
//             return response.data;
//         } catch (error) {
//             console.error('❌ Failed to save FCM token to Next.js:', error.message);
//             throw error;
//         }
//     }

//     async getAdminFCMTokensFromNextJS() {
//         try {
//             const response = await axios.get(`${this.nextjsApiUrl}/api/auth/fcm-token?role=admin`);
//             const tokens = response.data.tokens || response.data || [];
            
//             // Update local cache
//             if (Array.isArray(tokens)) {
//                 tokens.forEach(tokenObj => {
//                     if (tokenObj.token) {
//                         this.fcmTokens.add(tokenObj.token);
//                     }
//                 });
//             }
            
//             return Array.from(this.fcmTokens);
//         } catch (error) {
//             console.error('❌ Failed to fetch FCM tokens from Next.js:', error.message);
//             // Return cached tokens as fallback
//             return Array.from(this.fcmTokens);
//         }
//     }

//     getAllAdminFCMTokens() {
//         return this.getAdminFCMTokensFromNextJS();
//     }

//     // ========== FIREBASE NOTIFICATION METHODS ==========

//     async sendFirebaseNotification(payload) {
//         if (!this.firebaseEnabled || !firebaseAdmin) {
//             return { success: false, reason: 'firebase_disabled' };
//         }

//         try {
//             const message = {
//                 notification: {
//                     title: payload.title,
//                     body: payload.body
//                 },
//                 data: {
//                     ...payload.data,
//                     type: payload.type || 'notification',
//                     timestamp: new Date().toISOString(),
//                     click_action: 'FLUTTER_NOTIFICATION_CLICK'
//                 },
//                 android: {
//                     priority: payload.priority === 'high' ? 'high' : 'normal',
//                     notification: {
//                         sound: 'default',
//                         channelId: payload.priority === 'high' ? 'high_priority' : 'default'
//                     }
//                 },
//                 apns: {
//                     payload: {
//                         aps: {
//                             sound: 'default',
//                             badge: 1
//                         }
//                     }
//                 },
//                 token: payload.token
//             };

//             const response = await firebaseAdmin.messaging.send(message);
//             this.stats.firebaseNotifications++;
            
//             console.log(`🔥 Firebase sent: ${response}`);
//             return { 
//                 success: true, 
//                 messageId: response, 
//                 channel: 'firebase' 
//             };

//         } catch (error) {
//             console.error('❌ Firebase notification error:', error.message);
            
//             // Handle specific Firebase errors
//             if (error.code === 'messaging/registration-token-not-registered' ||
//                 error.code === 'messaging/invalid-registration-token') {
//                 console.warn('Removing invalid FCM token');
//                 this.fcmTokens.delete(payload.token);
                
//                 // Also remove from Next.js DB
//                 try {
//                     await axios.delete(`${this.nextjsApiUrl}/api/auth/fcm-token`, {
//                         data: { token: payload.token }
//                     });
//                 } catch (deleteError) {
//                     console.error('Failed to delete invalid token from Next.js:', deleteError.message);
//                 }
//             }
            
//             return { 
//                 success: false, 
//                 channel: 'firebase', 
//                 error: error.message 
//             };
//         }
//     }

//     // ========== COMBINED NOTIFICATION BROADCASTING ==========

//     async broadcastNewOrder(order) {
//         this.stats.notificationsSent++;
        
//         console.log(`📢 New order: ${order.orderNumber}`);

//         const notification = {
//             type: 'NEW_ORDER',
//             order: {
//                 id: order._id,
//                 orderNumber: order.orderNumber,
//                 customerName: order.customerName,
//                 phoneNumber: order.phoneNumber,
//                 customerPhone: order.customerPhone,
//                 totalPrice: order.totalPrice,
//                 items: order.items,
//                 status: order.status,
//                 paymentStatus: order.paymentStatus,
//                 createdAt: order.createdAt,
//                 shippingAddress: order.shippingAddress,
//                 source: order.orderSource || 'whatsapp_bot'
//             },
//             timestamp: new Date().toISOString(),
//             priority: 'high'
//         };

//         // 1. WEB SOCKET (Real-time to connected admin dashboards)
//         let adminCount = 0;
//         this.admins.forEach(clientId => {
//             if (this.sendToClient(clientId, notification)) {
//                 adminCount++;
//             }
//         });

//         console.log(`📡 WebSocket: Sent to ${adminCount} admin(s)`);

//         // 2. FIREBASE PUSH (For when app is closed)
//         if (this.firebaseEnabled) {
//             try {
//                 // Get tokens from Next.js database (with local cache fallback)
//                 const adminTokens = await this.getAdminFCMTokensFromNextJS();
                
//                 // Also get from environment as fallback (for testing)
//                 const envTokens = process.env.ADMIN_FCM_TOKENS;
//                 if (envTokens && adminTokens.length === 0) {
//                     envTokens.split(',').forEach(token => {
//                         const trimmedToken = token.trim();
//                         if (trimmedToken && !adminTokens.includes(trimmedToken)) {
//                             adminTokens.push(trimmedToken);
//                         }
//                     });
//                 }

//                 if (adminTokens.length > 0) {
//                     const firebasePayload = {
//                         title: '🛍️ New Order Received',
//                         body: `${order.customerName} placed order #${order.orderNumber} for ₹${order.totalPrice}`,
//                         data: {
//                             ...notification,
//                             screen: '/orders',
//                             orderId: order._id,
//                             action: 'view_order'
//                         },
//                         type: 'NEW_ORDER',
//                         priority: 'high'
//                     };

//                     // Send to all admin devices
//                     const results = [];
//                     for (const token of adminTokens) {
//                         if (token && token.trim() !== '') {
//                             const result = await this.sendFirebaseNotification({
//                                 ...firebasePayload,
//                                 token: token.trim()
//                             });
//                             results.push(result);
//                         }
//                     }

//                     const successful = results.filter(r => r.success).length;
//                     console.log(`🔥 Firebase: Sent to ${successful}/${results.length} admin device(s)`);
                    
//                 } else {
//                     console.log('🔥 Firebase: No admin device tokens found');
//                 }
//             } catch (firebaseError) {
//                 console.error('Firebase notification error:', firebaseError.message);
//             }
//         }

//         // 3. Send to user who placed the order
//         if (order.customerPhone) {
//             const userNotification = {
//                 ...notification,
//                 type: 'USER_ORDER_PLACED',
//                 message: `Your order #${order.orderNumber} has been received`
//             };
            
//             const userClients = this.users.get(order.customerPhone) || [];
//             userClients.forEach(clientId => {
//                 if (this.sendToClient(clientId, userNotification)) {
//                     adminCount++;
//                 }
//             });
//         }

//         return adminCount;
//     }

//     broadcastPaymentStatus(order, oldStatus, newStatus) {
//         console.log(`💰 Payment update: ${order.orderNumber} (${oldStatus} → ${newStatus})`);

//         const notification = {
//             type: 'PAYMENT_STATUS_CHANGED',
//             orderId: order._id,
//             orderNumber: order.orderNumber,
//             oldStatus,
//             newStatus,
//             customerName: order.customerName,
//             amount: order.totalPrice,
//             timestamp: new Date().toISOString()
//         };

//         // Send to admins
//         this.admins.forEach(clientId => {
//             this.sendToClient(clientId, notification);
//         });
//     }

//     broadcastOrderStatus(order, oldStatus, newStatus) {
//         console.log(`📦 Order status: ${order.orderNumber} (${oldStatus} → ${newStatus})`);

//         const notification = {
//             type: 'ORDER_STATUS_CHANGED',
//             orderId: order._id,
//             orderNumber: order.orderNumber,
//             oldStatus,
//             newStatus,
//             customerName: order.customerName,
//             customerPhone: order.customerPhone,
//             timestamp: new Date().toISOString()
//         };

//         // Send to admins
//         this.admins.forEach(clientId => {
//             this.sendToClient(clientId, notification);
//         });
//     }

//     broadcastLowStock(product, currentStock) {
//         console.log(`⚠️ Low stock: ${product.productName} (${currentStock} left)`);

//         const notification = {
//             type: 'LOW_STOCK_ALERT',
//             productId: product._id,
//             productName: product.productName,
//             currentStock,
//             threshold: 10,
//             alertLevel: currentStock <= 5 ? 'critical' : 'warning',
//             timestamp: new Date().toISOString()
//         };

//         // Send to admins
//         this.admins.forEach(clientId => {
//             this.sendToClient(clientId, notification);
//         });
//     }

//     broadcastSystemAlert(alert) {
//         console.log(`🚨 System alert: ${alert.title}`);

//         const notification = {
//             type: 'SYSTEM_ALERT',
//             level: alert.level || 'info',
//             title: alert.title,
//             message: alert.message,
//             data: alert.data || {},
//             timestamp: new Date().toISOString()
//         };

//         // Send to admins
//         this.admins.forEach(clientId => {
//             this.sendToClient(clientId, notification);
//         });
//     }

//     // ========== UTILITY METHODS ==========

//     sendToClient(clientId, message) {
//         const client = this.clients.get(clientId);
//         if (!client || client.ws.readyState !== WebSocket.OPEN) return false;

//         try {
//             client.ws.send(JSON.stringify(message));
//             return true;
//         } catch (error) {
//             console.error(`Failed to send to ${clientId.substring(0, 8)}:`, error.message);
//             return false;
//         }
//     }

//     disconnectClient(clientId, code = 1000, reason = 'Disconnected') {
//         const client = this.clients.get(clientId);
//         if (client) {
//             try {
//                 client.ws.close(code, reason);
//             } catch (error) {
//                 // Ignore close errors
//             }
//         }
//     }

//     async stop() {
//         console.log('🛑 Stopping WebSocket Server...');
        
//         // Disconnect all clients
//         this.clients.forEach((client, clientId) => {
//             this.disconnectClient(clientId, 1001, 'Server shutdown');
//         });
        
//         // Close servers
//         if (this.wss) {
//             this.wss.close();
//         }
        
//         if (this.server) {
//             this.server.close();
//         }
        
//         console.log('✅ WebSocket Server stopped');
//     }

//     getStats() {
//         return {
//             clients: this.clients.size,
//             admins: this.admins.size,
//             users: this.users.size,
//             fcmTokens: this.fcmTokens.size,
//             notifications: this.stats.notificationsSent,
//             firebaseNotifications: this.stats.firebaseNotifications,
//             uptime: this.stats.startedAt ? Date.now() - this.stats.startedAt : 0
//         };
//     }
// }

// // Create singleton instance
// const notificationWebSocketServer = new NotificationWebSocketServer();
// export default notificationWebSocketServer;
























// services/notifications/notificationWebSocketServer.js
// PROFESSIONAL MULTI-TENANT VERSION
// WebSocket server for real-time notifications with company isolation

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import axios from 'axios';

// Import Firebase Admin (handle optional import)
let firebaseAdmin = null;
let firebaseEnabled = false;

try {
    // Try to import Firebase if available
    const { messaging } = await import('../services/firebase/firebase-admin.js');
    firebaseAdmin = { messaging };
    firebaseEnabled = process.env.FIREBASE_ENABLED !== 'false';
    console.log('🔥 Firebase notifications: ENABLED');
} catch (error) {
    console.log('🔥 Firebase notifications: DISABLED -', error.message);
    firebaseEnabled = false;
}

class NotificationWebSocketServer {
    constructor() {
        this.wss = null;
        this.server = null;
        this.port = process.env.NOTIFICATION_WS_PORT || 3000;
        this.nextjsApiUrl = process.env.NEXTJS_API_URL || 'http://localhost:3000';
        
        // Client management with company isolation
        this.clients = new Map(); // clientId -> { ws, metadata }
        
        // ✅ Company-specific admin groups
        this.companyAdmins = new Map(); // companyId -> Set<clientIds>
        
        // ✅ Company-specific user groups
        this.companyUsers = new Map(); // companyId -> Map<phone, [clientIds]>
        
        // ✅ Company-specific FCM tokens
        this.companyFCMTokens = new Map(); // companyId -> Set<tokens>
        
        // Simple token storage (memory only - for caching)
        this.fcmTokens = new Set(); // Legacy - for backward compatibility
        
        this.firebaseEnabled = firebaseEnabled;
        
        this.stats = {
            totalConnections: 0,
            currentConnections: 0,
            notificationsSent: 0,
            firebaseNotifications: 0,
            startedAt: null
        };
    }

    // ✅ ADDED: Method that accepts port parameter
    async start(port = null) {
        // Use provided port or default
        if (port) {
            this.port = port;
        }
        return await this._startInternal();
    }

    // ✅ ADDED: Internal start method
    async _startInternal() {
        return new Promise((resolve, reject) => {
            try {
                // Create HTTP server
                this.server = http.createServer((req, res) => {
                    res.writeHead(404);
                    res.end();
                });

                // Create WebSocket server
                this.wss = new WebSocket.Server({
                    server: this.server,
                    path: '/ws/notifications'
                });

                // Start server
                this.server.listen(this.port, () => {
                    console.log('🔔 Notification WebSocket Server running');
                    console.log(`🌐 Port: ${this.port}`);
                    console.log(`🔥 Firebase: ${this.firebaseEnabled ? 'ENABLED' : 'DISABLED'}`);
                    console.log(`🔗 Next.js API: ${this.nextjsApiUrl}`);
                    
                    this.stats.startedAt = Date.now();
                    this.setupWebSocketHandlers();
                    
                    resolve({
                        port: this.port,
                        status: 'running',
                        firebase: this.firebaseEnabled,
                        startedAt: new Date().toISOString()
                    });
                });

                this.server.on('error', reject);

            } catch (error) {
                console.error('❌ Failed to start WebSocket server:', error);
                reject(error);
            }
        });
    }

    setupWebSocketHandlers() {
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        this.wss.on('error', (error) => {
            console.error('WebSocket error:', error.message);
        });
    }

    handleConnection(ws, req) {
        const clientId = uuidv4();
        const ip = req.socket.remoteAddress || 'unknown';
        
        this.stats.totalConnections++;
        this.stats.currentConnections++;

        console.log(`🔗 New connection: ${clientId.substring(0, 8)} from ${ip}`);

        // Initialize client
        const client = {
            ws,
            id: clientId,
            ip,
            connectedAt: new Date(),
            metadata: {
                authenticated: false,
                role: null,
                userId: null,
                phoneNumber: null,
                companyId: null // ✅ NEW: Company context
            }
        };

        this.clients.set(clientId, client);

        // Send welcome message
        this.sendToClient(clientId, {
            type: 'CONNECTED',
            clientId,
            serverTime: new Date().toISOString(),
            message: 'Connected to Notification Server'
        });

        // Set up event handlers
        ws.on('message', (data) => {
            this.handleMessage(clientId, data);
        });

        ws.on('close', () => {
            this.handleDisconnection(clientId);
        });

        ws.on('error', (error) => {
            console.error(`Client ${clientId.substring(0, 8)} error:`, error.message);
            this.handleDisconnection(clientId);
        });

        // Request authentication after 1 second
        setTimeout(() => {
            if (this.clients.has(clientId)) {
                this.sendToClient(clientId, {
                    type: 'AUTHENTICATE_REQUEST',
                    message: 'Authentication required',
                    timestamp: new Date().toISOString()
                });
            }
        }, 1000);
    }

    handleMessage(clientId, rawData) {
        try {
            const data = JSON.parse(rawData.toString());
            const { type, ...payload } = data;

            switch (type) {
                case 'AUTHENTICATE':
                    this.handleAuthentication(clientId, payload);
                    break;
                    
                case 'PING':
                    this.sendToClient(clientId, {
                        type: 'PONG',
                        timestamp: new Date().toISOString()
                    });
                    break;
                    
                case 'REGISTER_FCM_TOKEN':
                    this.handleFCMTokenRegistration(clientId, payload);
                    break;
                    
                default:
                    console.log(`Unknown message type: ${type} from ${clientId.substring(0, 8)}`);
            }
        } catch (error) {
            console.error(`Message parsing error from ${clientId.substring(0, 8)}:`, error.message);
        }
    }

    async handleAuthentication(clientId, data) {
        const { token, userId, role, phoneNumber, fcmToken, companyId } = data;
        const client = this.clients.get(clientId);
        
        if (!client) return;

        // Simple authentication
        const isValid = this.validateAuth(token, role);
        
        if (isValid) {
            client.metadata = {
                ...client.metadata,
                authenticated: true,
                role,
                userId,
                phoneNumber,
                companyId: companyId || 'default', // ✅ Store company context
                fcmToken,
                authenticatedAt: new Date().toISOString()
            };

            // Register FCM token if provided - SAVE TO NEXT.JS DB
            if (fcmToken && role === 'admin') {
                try {
                    await this.saveFCMTokenToNextJS(fcmToken, userId, client, companyId);
                    console.log(`📱 Admin FCM token registered and saved to Next.js DB for company: ${companyId || 'default'}`);
                } catch (error) {
                    console.error('❌ Failed to save FCM token to Next.js:', error.message);
                }
            }

            // ✅ Register based on role WITH COMPANY ISOLATION
            if (role === 'admin') {
                const compId = companyId || 'default';
                if (!this.companyAdmins.has(compId)) {
                    this.companyAdmins.set(compId, new Set());
                }
                this.companyAdmins.get(compId).add(clientId);
                console.log(`👑 Admin authenticated: ${userId || 'Unknown'} for company ${compId} (${clientId.substring(0, 8)})`);
            } else if (role === 'user' && phoneNumber) {
                const compId = companyId || 'default';
                if (!this.companyUsers.has(compId)) {
                    this.companyUsers.set(compId, new Map());
                }
                const userMap = this.companyUsers.get(compId);
                if (!userMap.has(phoneNumber)) {
                    userMap.set(phoneNumber, []);
                }
                userMap.get(phoneNumber).push(clientId);
                console.log(`👤 User authenticated: ${phoneNumber} for company ${compId} (${clientId.substring(0, 8)})`);
            }

            this.sendToClient(clientId, {
                type: 'AUTHENTICATE_SUCCESS',
                message: 'Authentication successful',
                role,
                userId,
                phoneNumber,
                companyId: companyId || 'default',
                timestamp: new Date().toISOString()
            });

        } else {
            this.sendToClient(clientId, {
                type: 'AUTHENTICATE_FAILED',
                message: 'Authentication failed',
                timestamp: new Date().toISOString()
            });
            
            setTimeout(() => {
                this.disconnectClient(clientId, 1008, 'Authentication failed');
            }, 3000);
        }
    }

    async handleFCMTokenRegistration(clientId, data) {
        const { token, role, companyId } = data;
        const client = this.clients.get(clientId);
        
        if (!client || !client.metadata.authenticated) {
            this.sendToClient(clientId, {
                type: 'FCM_REGISTRATION_FAILED',
                message: 'Authentication required'
            });
            return;
        }

        if (role === 'admin' && token) {
            try {
                await this.saveFCMTokenToNextJS(token, client.metadata.userId, client, companyId);
                
                // ✅ Store in company-specific token set
                const compId = companyId || 'default';
                if (!this.companyFCMTokens.has(compId)) {
                    this.companyFCMTokens.set(compId, new Set());
                }
                this.companyFCMTokens.get(compId).add(token);
                
                // Legacy storage for backward compatibility
                this.fcmTokens.add(token);
                
                console.log(`📱 Admin FCM token registered for company ${compId}: ${token.substring(0, 20)}...`);
                
                this.sendToClient(clientId, {
                    type: 'FCM_TOKEN_REGISTERED',
                    message: 'FCM token registered successfully'
                });
            } catch (error) {
                console.error('❌ Failed to register FCM token:', error.message);
                this.sendToClient(clientId, {
                    type: 'FCM_REGISTRATION_FAILED',
                    message: 'Failed to register FCM token'
                });
            }
        }
    }

    validateAuth(token, role) {
        if (role === 'admin') {
            return token === process.env.ADMIN_API_KEY;
        } else if (role === 'user') {
            return true; // For users, we can accept any token for now
        }
        return false;
    }

    handleDisconnection(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            this.stats.currentConnections--;
            
            console.log(`🔌 Disconnected: ${clientId.substring(0, 8)}`);

            // Clean up from collections with company context
            if (client.metadata.authenticated) {
                const { role, phoneNumber, companyId } = client.metadata;
                const compId = companyId || 'default';
                
                if (role === 'admin') {
                    const adminSet = this.companyAdmins.get(compId);
                    if (adminSet) {
                        adminSet.delete(clientId);
                        if (adminSet.size === 0) {
                            this.companyAdmins.delete(compId);
                        }
                    }
                } else if (role === 'user' && phoneNumber) {
                    const userMap = this.companyUsers.get(compId);
                    if (userMap) {
                        const userClients = userMap.get(phoneNumber);
                        if (userClients) {
                            const filtered = userClients.filter(id => id !== clientId);
                            if (filtered.length === 0) {
                                userMap.delete(phoneNumber);
                            } else {
                                userMap.set(phoneNumber, filtered);
                            }
                        }
                        if (userMap.size === 0) {
                            this.companyUsers.delete(compId);
                        }
                    }
                }
            }

            this.clients.delete(clientId);
        }
    }

    // ========== FCM TOKEN MANAGEMENT ==========

    async saveFCMTokenToNextJS(token, userId, client, companyId) {
        try {
            const response = await axios.post(`${this.nextjsApiUrl}/api/auth/fcm-token`, {
                token,
                userId,
                companyId: companyId || 'default', // ✅ Include companyId
                role: client.metadata.role || 'admin',
                deviceInfo: {
                    userAgent: client.metadata.userAgent || '',
                    platform: client.metadata.platform || '',
                    ip: client.ip,
                    connectedAt: client.connectedAt
                }
            });
            
            // Cache the token locally for faster access
            this.fcmTokens.add(token);
            
            return response.data;
        } catch (error) {
            console.error('❌ Failed to save FCM token to Next.js:', error.message);
            throw error;
        }
    }

    async getAdminFCMTokensFromNextJS(companyId = null) {
        try {
            const url = companyId 
                ? `${this.nextjsApiUrl}/api/auth/fcm-token?role=admin&companyId=${companyId}`
                : `${this.nextjsApiUrl}/api/auth/fcm-token?role=admin`;
                
            const response = await axios.get(url);
            const tokens = response.data.tokens || response.data || [];
            
            // Update company-specific cache
            if (companyId && Array.isArray(tokens)) {
                if (!this.companyFCMTokens.has(companyId)) {
                    this.companyFCMTokens.set(companyId, new Set());
                }
                const tokenSet = this.companyFCMTokens.get(companyId);
                tokens.forEach(tokenObj => {
                    if (tokenObj.token) {
                        tokenSet.add(tokenObj.token);
                    }
                });
            }
            
            return companyId 
                ? Array.from(this.companyFCMTokens.get(companyId) || [])
                : Array.from(this.fcmTokens);
        } catch (error) {
            console.error('❌ Failed to fetch FCM tokens from Next.js:', error.message);
            // Return cached tokens as fallback
            return companyId 
                ? Array.from(this.companyFCMTokens.get(companyId) || [])
                : Array.from(this.fcmTokens);
        }
    }

    getAllAdminFCMTokens(companyId = null) {
        return this.getAdminFCMTokensFromNextJS(companyId);
    }

    // ========== FIREBASE NOTIFICATION METHODS ==========

    async sendFirebaseNotification(payload) {
        if (!this.firebaseEnabled || !firebaseAdmin) {
            return { success: false, reason: 'firebase_disabled' };
        }

        try {
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: {
                    ...payload.data,
                    type: payload.type || 'notification',
                    companyId: payload.companyId || 'default',
                    timestamp: new Date().toISOString(),
                    click_action: 'FLUTTER_NOTIFICATION_CLICK'
                },
                android: {
                    priority: payload.priority === 'high' ? 'high' : 'normal',
                    notification: {
                        sound: 'default',
                        channelId: payload.priority === 'high' ? 'high_priority' : 'default'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                },
                token: payload.token
            };

            const response = await firebaseAdmin.messaging.send(message);
            this.stats.firebaseNotifications++;
            
            console.log(`🔥 Firebase sent: ${response}`);
            return { 
                success: true, 
                messageId: response, 
                channel: 'firebase' 
            };

        } catch (error) {
            console.error('❌ Firebase notification error:', error.message);
            
            // Handle specific Firebase errors
            if (error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/invalid-registration-token') {
                console.warn('Removing invalid FCM token');
                this.fcmTokens.delete(payload.token);
                
                // Remove from company-specific cache
                if (payload.companyId) {
                    const tokenSet = this.companyFCMTokens.get(payload.companyId);
                    if (tokenSet) {
                        tokenSet.delete(payload.token);
                    }
                }
                
                // Also remove from Next.js DB
                try {
                    await axios.delete(`${this.nextjsApiUrl}/api/auth/fcm-token`, {
                        data: { token: payload.token }
                    });
                } catch (deleteError) {
                    console.error('Failed to delete invalid token from Next.js:', deleteError.message);
                }
            }
            
            return { 
                success: false, 
                channel: 'firebase', 
                error: error.message 
            };
        }
    }

    // ========== COMBINED NOTIFICATION BROADCASTING WITH COMPANY ISOLATION ==========

    async broadcastNewOrder(order) {
        this.stats.notificationsSent++;
        
        const companyId = order.companyId || 'default';
        
        console.log(`📢 New order: ${order.orderNumber} for company: ${companyId}`);

        const notification = {
            type: 'NEW_ORDER',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                phoneNumber: order.phoneNumber,
                customerPhone: order.customerPhone,
                totalPrice: order.totalPrice,
                items: order.items,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                shippingAddress: order.shippingAddress,
                source: order.orderSource || 'whatsapp_bot',
                companyId: companyId
            },
            companyId: companyId,
            timestamp: new Date().toISOString(),
            priority: 'high'
        };

        // 1. WEB SOCKET (Send only to admins of THIS company)
        let adminCount = 0;
        const companyAdminSet = this.companyAdmins.get(companyId);
        if (companyAdminSet) {
            companyAdminSet.forEach(clientId => {
                if (this.sendToClient(clientId, notification)) {
                    adminCount++;
                }
            });
        }

        console.log(`📡 WebSocket: Sent to ${adminCount} admin(s) for company ${companyId}`);

        // 2. FIREBASE PUSH (Send only to THIS company's admins)
        if (this.firebaseEnabled) {
            try {
                // Get tokens for THIS company
                const adminTokens = await this.getAdminFCMTokensFromNextJS(companyId);
                
                // Also check company-specific cache
                const cachedTokens = this.companyFCMTokens.get(companyId) || new Set();
                const allTokens = [...new Set([...adminTokens, ...cachedTokens])];

                if (allTokens.length > 0) {
                    const firebasePayload = {
                        title: '🛍️ New Order Received',
                        body: `${order.customerName} placed order #${order.orderNumber} for ₹${order.totalPrice}`,
                        data: {
                            ...notification,
                            screen: '/orders',
                            orderId: order._id,
                            action: 'view_order'
                        },
                        type: 'NEW_ORDER',
                        companyId: companyId,
                        priority: 'high'
                    };

                    // Send to all admin devices for this company
                    const results = [];
                    for (const token of allTokens) {
                        if (token && token.trim() !== '') {
                            const result = await this.sendFirebaseNotification({
                                ...firebasePayload,
                                token: token.trim()
                            });
                            results.push(result);
                        }
                    }

                    const successful = results.filter(r => r.success).length;
                    console.log(`🔥 Firebase: Sent to ${successful}/${results.length} admin device(s) for company ${companyId}`);
                    
                } else {
                    console.log(`🔥 Firebase: No admin device tokens found for company ${companyId}`);
                }
            } catch (firebaseError) {
                console.error('Firebase notification error:', firebaseError.message);
            }
        }

        // 3. Send to user who placed the order (scoped to company)
        if (order.customerPhone) {
            const userNotification = {
                ...notification,
                type: 'USER_ORDER_PLACED',
                message: `Your order #${order.orderNumber} has been received`
            };
            
            const userMap = this.companyUsers.get(companyId);
            if (userMap) {
                const userClients = userMap.get(order.customerPhone) || [];
                userClients.forEach(clientId => {
                    this.sendToClient(clientId, userNotification);
                });
            }
        }

        return adminCount;
    }

    broadcastPaymentStatus(order, oldStatus, newStatus) {
        const companyId = order.companyId || 'default';
        
        console.log(`💰 Payment update: ${order.orderNumber} (${oldStatus} → ${newStatus}) for company ${companyId}`);

        const notification = {
            type: 'PAYMENT_STATUS_CHANGED',
            orderId: order._id,
            orderNumber: order.orderNumber,
            oldStatus,
            newStatus,
            customerName: order.customerName,
            amount: order.totalPrice,
            companyId: companyId,
            timestamp: new Date().toISOString()
        };

        // Send to admins of THIS company
        const companyAdminSet = this.companyAdmins.get(companyId);
        if (companyAdminSet) {
            companyAdminSet.forEach(clientId => {
                this.sendToClient(clientId, notification);
            });
        }
    }

    broadcastOrderStatus(order, oldStatus, newStatus) {
        const companyId = order.companyId || 'default';
        
        console.log(`📦 Order status: ${order.orderNumber} (${oldStatus} → ${newStatus}) for company ${companyId}`);

        const notification = {
            type: 'ORDER_STATUS_CHANGED',
            orderId: order._id,
            orderNumber: order.orderNumber,
            oldStatus,
            newStatus,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            companyId: companyId,
            timestamp: new Date().toISOString()
        };

        // Send to admins of THIS company
        const companyAdminSet = this.companyAdmins.get(companyId);
        if (companyAdminSet) {
            companyAdminSet.forEach(clientId => {
                this.sendToClient(clientId, notification);
            });
        }
    }

    broadcastLowStock(product, currentStock) {
        const companyId = product.companyId || 'default';
        
        console.log(`⚠️ Low stock: ${product.productName} (${currentStock} left) for company ${companyId}`);

        const notification = {
            type: 'LOW_STOCK_ALERT',
            productId: product._id,
            productName: product.productName,
            currentStock,
            threshold: 10,
            alertLevel: currentStock <= 5 ? 'critical' : 'warning',
            companyId: companyId,
            timestamp: new Date().toISOString()
        };

        // Send to admins of THIS company
        const companyAdminSet = this.companyAdmins.get(companyId);
        if (companyAdminSet) {
            companyAdminSet.forEach(clientId => {
                this.sendToClient(clientId, notification);
            });
        }
    }

    broadcastSystemAlert(alert, companyId = 'default') {
        console.log(`🚨 System alert for company ${companyId}: ${alert.title}`);

        const notification = {
            type: 'SYSTEM_ALERT',
            level: alert.level || 'info',
            title: alert.title,
            message: alert.message,
            data: alert.data || {},
            companyId: companyId,
            timestamp: new Date().toISOString()
        };

        // Send to admins of THIS company
        const companyAdminSet = this.companyAdmins.get(companyId);
        if (companyAdminSet) {
            companyAdminSet.forEach(clientId => {
                this.sendToClient(clientId, notification);
            });
        }
    }

    // ========== UTILITY METHODS ==========

    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client || client.ws.readyState !== WebSocket.OPEN) return false;

        try {
            client.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error(`Failed to send to ${clientId.substring(0, 8)}:`, error.message);
            return false;
        }
    }

    disconnectClient(clientId, code = 1000, reason = 'Disconnected') {
        const client = this.clients.get(clientId);
        if (client) {
            try {
                client.ws.close(code, reason);
            } catch (error) {
                // Ignore close errors
            }
        }
    }

    async stop() {
        console.log('🛑 Stopping WebSocket Server...');
        
        // Disconnect all clients
        this.clients.forEach((client, clientId) => {
            this.disconnectClient(clientId, 1001, 'Server shutdown');
        });
        
        // Close servers
        if (this.wss) {
            this.wss.close();
        }
        
        if (this.server) {
            this.server.close();
        }
        
        console.log('✅ WebSocket Server stopped');
    }

    getStats() {
        return {
            clients: this.clients.size,
            companies: {
                total: this.companyAdmins.size,
                adminCount: Array.from(this.companyAdmins.values()).reduce((sum, set) => sum + set.size, 0),
                userCount: Array.from(this.companyUsers.values()).reduce((sum, map) => sum + map.size, 0)
            },
            admins: Array.from(this.companyAdmins.values()).reduce((sum, set) => sum + set.size, 0),
            users: Array.from(this.companyUsers.values()).reduce((sum, map) => sum + map.size, 0),
            fcmTokens: this.fcmTokens.size,
            companyFCMTokens: Array.from(this.companyFCMTokens.values()).reduce((sum, set) => sum + set.size, 0),
            notifications: this.stats.notificationsSent,
            firebaseNotifications: this.stats.firebaseNotifications,
            uptime: this.stats.startedAt ? Date.now() - this.stats.startedAt : 0
        };
    }
}

// Create singleton instance
const notificationWebSocketServer = new NotificationWebSocketServer();
export default notificationWebSocketServer;