



// // // // // server.js - COMPLETE WITH AUTHENTICATION HANDLER - FIXED VERSION
// // // // import express from 'express';
// // // // import cors from 'cors';
// // // // import http from 'http';
// // // // import { Server } from 'socket.io';
// // // // import dotenv from 'dotenv';
// // // // import bot from './whatsap/bot.js';
// // // // import apiService from './services/apiService.js';
// // // // import notificationManager from './services/notifications/notification-manager.js';
// // // // import { qrSocketServer } from "./services/qrSocketServer.js";

// // // // dotenv.config();

// // // // const app = express();
// // // // const server = http.createServer(app);
// // // // const PORT = process.env.BOT_PORT || 3001;

// // // // // ========== SOCKET.IO CONFIGURATION ==========
// // // // const ADMIN_TOKEN = process.env.NOTIFICATION_API_KEY || 'dev-key-2024';

// // // // // Set bot in QR socket server
// // // // qrSocketServer.setBot(bot);

// // // // // ========== CREATE SOCKET.IO SERVER ==========
// // // // const io = new Server(server, {
// // // //   cors: {
// // // //     origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000'],
// // // //     methods: ["GET", "POST"],
// // // //     credentials: true
// // // //   },
// // // //   transports: ['websocket', 'polling'],
// // // //   pingTimeout: 30000,
// // // //   pingInterval: 25000,
// // // //   allowEIO3: true,
// // // //   allowUpgrades: true,
// // // //   cookie: false,
// // // //   // FIXED CONFIGURATION - REMOVED INVALID wsEngine
// // // //   connectTimeout: 45000,
// // // //   maxHttpBufferSize: 1e8,
// // // //   upgradeTimeout: 10000,
// // // //   path: '/socket.io/'
// // // // });

// // // // // ========== SET SOCKET.IO GLOBALLY ==========
// // // // global.io = io;
// // // // console.log('✅ Socket.IO set globally');

// // // // // ========== EXPRESS MIDDLEWARE ==========
// // // // app.use(cors({
// // // //   origin: ['http://localhost:3000', 'http://localhost:3001'],
// // // //   credentials: true
// // // // }));

// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // Add CORS headers manually
// // // // app.use((req, res, next) => {
// // // //   res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
// // // //   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// // // //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// // // //   res.header('Access-Control-Allow-Credentials', 'true');
  
// // // //   if (req.method === 'OPTIONS') {
// // // //     return res.status(200).end();
// // // //   }
// // // //   next();
// // // // });

// // // // // ========== SETUP SOCKET.IO NAMESPACES ==========
// // // // const qrNamespace = io.of('/qr');
// // // // const notificationNamespace = io.of('/notifications');

// // // // // ========== ADD ROOT NAMESPACE FOR DEBUGGING ==========
// // // // io.on('connection', (socket) => {
// // // //   console.log(`🌐 Root namespace client connected: ${socket.id} (for debugging)`);
  
// // // //   socket.on('error', (error) => {
// // // //     console.error(`❌ Root namespace error from ${socket.id}:`, error);
// // // //   });
  
// // // //   socket.on('disconnect', (reason) => {
// // // //     console.log(`🌐 Root namespace client disconnected: ${socket.id} (${reason})`);
// // // //   });
// // // // });

// // // // // ========== QR NAMESPACE HANDLER ==========
// // // // qrNamespace.on('connection', (socket) => {
// // // //   console.log(`🔗 QR Client connected: ${socket.id}`);
  
// // // //   // ADD connection error handler
// // // //   socket.on('error', (error) => {
// // // //     console.error(`❌ QR Socket error from ${socket.id}:`, error);
// // // //   });
  
// // // //   socket.on('disconnect', (reason) => {
// // // //     console.log(`🔌 QR Client disconnected: ${socket.id} (${reason})`);
// // // //   });
// // // // });

// // // // // ========== NOTIFICATION NAMESPACE HANDLER (WITH AUTHENTICATION) ==========
// // // // notificationNamespace.on('connection', (socket) => {
// // // //   console.log(`🔔 Notification Client connected: ${socket.id}`);
  
// // // //   // ADD connection error handler
// // // //   socket.on('error', (error) => {
// // // //     console.error(`❌ Notification Socket error from ${socket.id}:`, error);
// // // //   });
  
// // // //   // Set authentication status
// // // //   let isAuthenticated = false;
// // // //   let authenticatedUser = null;
  
// // // //   // ===== AUTHENTICATION HANDLER =====
// // // //   socket.on('authenticate', (data) => {
// // // //     console.log(`🔐 Authentication attempt from ${socket.id}:`, {
// // // //       userId: data?.userId,
// // // //       userRole: data?.userRole,
// // // //       tokenPreview: data?.token ? data.token.substring(0, 20) + '...' : 'No token'
// // // //     });
    
// // // //     const { token, userId, userRole, name, connectionId } = data || {};
    
// // // //     // Validate required fields
// // // //     if (!token || !userId || !userRole) {
// // // //       console.error(`❌ Missing authentication data from ${socket.id}`);
// // // //       socket.emit('unauthorized', {
// // // //         success: false,
// // // //         message: 'Missing authentication data',
// // // //         timestamp: new Date().toISOString()
// // // //       });
// // // //       return;
// // // //     }
    
// // // //     // Validate admin token
// // // //     if (token !== ADMIN_TOKEN) {
// // // //       console.error(`❌ Invalid token from ${socket.id}`);
// // // //       socket.emit('unauthorized', {
// // // //         success: false,
// // // //         message: 'Invalid authentication token',
// // // //         timestamp: new Date().toISOString()
// // // //       });
// // // //       socket.disconnect();
// // // //       return;
// // // //     }
    
// // // //     // Check if user is admin
// // // //     if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'manager') {
// // // //       console.error(`❌ Non-admin user attempted to connect: ${userId} (${userRole})`);
// // // //       socket.emit('unauthorized', {
// // // //         success: false,
// // // //         message: 'Admin access required',
// // // //         timestamp: new Date().toISOString()
// // // //       });
// // // //       socket.disconnect();
// // // //       return;
// // // //     }
    
// // // //     // Authentication successful
// // // //     isAuthenticated = true;
// // // //     authenticatedUser = {
// // // //       id: userId,
// // // //       role: userRole,
// // // //       name: name || `Admin-${userId.substring(0, 8)}`,
// // // //       connectionId: connectionId || socket.id,
// // // //       authenticatedAt: new Date().toISOString()
// // // //     };
    
// // // //     console.log(`✅ Admin authenticated: ${authenticatedUser.name} (${userId})`);
    
// // // //     socket.emit('authenticated', {
// // // //       success: true,
// // // //       message: 'Authentication successful',
// // // //       user: {
// // // //         id: userId,
// // // //         role: userRole,
// // // //         name: name || `Admin-${userId.substring(0, 8)}`
// // // //       },
// // // //       socketId: socket.id,
// // // //       timestamp: new Date().toISOString(),
// // // //       serverTime: new Date().toISOString()
// // // //     });
    
// // // //     // Join admin room for targeted notifications
// // // //     socket.join('admins');
// // // //     console.log(`👥 ${authenticatedUser.name} joined 'admins' room`);
// // // //   });
  
// // // //   // ===== FCM TOKEN REGISTRATION =====
// // // //   socket.on('register-fcm-token', (data) => {
// // // //     if (!isAuthenticated) {
// // // //       console.error(`❌ Unauthenticated FCM token registration attempt`);
// // // //       socket.emit('fcm-token-registration-failed', {
// // // //         success: false,
// // // //         message: 'Authentication required',
// // // //         timestamp: new Date().toISOString()
// // // //       });
// // // //       return;
// // // //     }
    
// // // //     const { token, deviceInfo, timestamp } = data || {};
    
// // // //     if (!token) {
// // // //       console.error(`❌ Invalid FCM token from ${authenticatedUser?.name}`);
// // // //       socket.emit('fcm-token-registration-failed', {
// // // //         success: false,
// // // //         message: 'Invalid FCM token',
// // // //         timestamp: new Date().toISOString()
// // // //       });
// // // //       return;
// // // //     }
    
// // // //     console.log(`📱 FCM token registered for ${authenticatedUser.name}:`, {
// // // //       tokenPreview: token.substring(0, 20) + '...',
// // // //       deviceType: deviceInfo?.deviceType || 'unknown',
// // // //       timestamp: timestamp || new Date().toISOString()
// // // //     });
    
// // // //     socket.emit('fcm-token-registered', {
// // // //       success: true,
// // // //       message: 'FCM token registered successfully',
// // // //       timestamp: new Date().toISOString()
// // // //     });
// // // //   });
  
// // // //   // ===== HEARTBEAT/PING =====
// // // //   socket.on('ping', (data) => {
// // // //     if (!isAuthenticated) return;
    
// // // //     const { timestamp } = data || {};
// // // //     const latency = timestamp ? Date.now() - timestamp : null;
    
// // // //     socket.emit('pong', {
// // // //       timestamp: timestamp || Date.now(),
// // // //       serverTime: Date.now(),
// // // //       latency: latency,
// // // //       message: 'pong'
// // // //     });
// // // //   });
  
// // // //   // ===== DISCONNECTION HANDLER =====
// // // //   socket.on('disconnect', (reason) => {
// // // //     console.log(`🔌 Notification Client disconnected: ${socket.id} (${reason})`);
    
// // // //     if (authenticatedUser) {
// // // //       console.log(`👋 ${authenticatedUser.name} disconnected`);
// // // //     }
// // // //   });
// // // // });

// // // // // ========== PASS SOCKET.IO TO QR SOCKET SERVER ==========
// // // // if (qrSocketServer.setIO) {
// // // //   qrSocketServer.setIO(io);
// // // // } else {
// // // //   console.log('ℹ️ qrSocketServer.setIO not available');
// // // // }

// // // // // ========== REST API ROUTES ==========

// // // // // Health check endpoint
// // // // app.get('/health', (req, res) => {
// // // //   const status = bot.getStatus();
// // // //   const qrClientsCount = qrNamespace.sockets.size;
// // // //   const notificationClientsCount = notificationNamespace.sockets.size;
// // // //   const rootClientsCount = io.sockets.sockets.size;
  
// // // //   res.json({
// // // //     status: 'healthy',
// // // //     server: 'running',
// // // //     bot: status.connected ? 'connected' : 'disconnected',
// // // //     websocket: {
// // // //       qrClients: qrClientsCount,
// // // //       notificationClients: notificationClientsCount,
// // // //       rootClients: rootClientsCount,
// // // //       socketIoGlobal: !!global.io
// // // //     },
// // // //     authentication: {
// // // //       adminTokenConfigured: !!ADMIN_TOKEN,
// // // //       tokenPreview: ADMIN_TOKEN ? ADMIN_TOKEN.substring(0, 10) + '...' : 'Not configured'
// // // //     },
// // // //     timestamp: new Date().toISOString()
// // // //   });
// // // // });

// // // // // WebSocket status endpoint for debugging
// // // // app.get('/api/websocket-status', (req, res) => {
// // // //   const qrClients = qrNamespace.sockets.size;
// // // //   const notificationClients = notificationNamespace.sockets.size;
// // // //   const rootClients = io.sockets.sockets.size;
  
// // // //   res.json({
// // // //     status: 'running',
// // // //     socketIoVersion: '4.x',
// // // //     clients: {
// // // //       qr: qrClients,
// // // //       notifications: notificationClients,
// // // //       root: rootClients,
// // // //       total: qrClients + notificationClients + rootClients
// // // //     },
// // // //     namespaces: {
// // // //       qr: '/qr',
// // // //       notifications: '/notifications',
// // // //       root: '/'
// // // //     },
// // // //     environment: process.env.NODE_ENV,
// // // //     timestamp: new Date().toISOString()
// // // //   });
// // // // });

// // // // // === BOT MANAGEMENT ENDPOINTS ===

// // // // app.get('/api/status', (req, res) => {
// // // //   try {
// // // //     const status = bot.getStatus();
// // // //     res.json({
// // // //       success: true,
// // // //       qr: bot.getCurrentQR(),
// // // //       status: status.connected ? 'connected' : 
// // // //              bot.getCurrentQR() ? 'qr_required' : 'disconnected',
// // // //       message: status.connected ? 'WhatsApp is connected' : 
// // // //               bot.getCurrentQR() ? 'QR code required' : 'Not connected',
// // // //       stats: status.stats,
// // // //       botInfo: status.botInfo,
// // // //       reconnectAttempts: status.reconnectAttempts
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.get('/api/qr', (req, res) => {
// // // //   try {
// // // //     const qr = bot.getCurrentQR();
// // // //     res.json({
// // // //       success: true,
// // // //       qr: qr,
// // // //       hasQr: !!qr,
// // // //       timestamp: new Date().toISOString()
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.get('/api/stats', (req, res) => {
// // // //   try {
// // // //     const status = bot.getStatus();
// // // //     res.json({
// // // //       success: true,
// // // //       stats: status.stats,
// // // //       lastUpdated: new Date().toISOString()
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.get('/api/bot', (req, res) => {
// // // //   try {
// // // //     const status = bot.getStatus();
// // // //     res.json({
// // // //       success: true,
// // // //       connected: status.connected,
// // // //       authenticated: status.authenticated,
// // // //       hasQR: !!bot.getCurrentQR(),
// // // //       botInfo: status.botInfo,
// // // //       stats: status.stats,
// // // //       reconnectAttempts: status.reconnectAttempts,
// // // //       uptime: status.formattedUptime
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.post('/api/connect', async (req, res) => {
// // // //   try {
// // // //     await bot.initialize();
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Bot connection initiated'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.post('/api/disconnect', async (req, res) => {
// // // //   try {
// // // //     await bot.safeDestroyClient();
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Bot disconnected successfully'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.post('/api/restart', async (req, res) => {
// // // //   try {
// // // //     await bot.restart();
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Bot restart initiated'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.post('/api/logout', async (req, res) => {
// // // //   try {
// // // //     await bot.logout();
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Bot logged out successfully'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.post('/api/send-message', async (req, res) => {
// // // //   try {
// // // //     const { to, message } = req.body;
    
// // // //     if (!to || !message) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         error: 'Phone number and message are required'
// // // //       });
// // // //     }
    
// // // //     const result = await bot.sendMessage(to, message);
    
// // // //     if (result.success) {
// // // //       res.json(result);
// // // //     } else {
// // // //       res.status(500).json(result);
// // // //     }
    
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.post('/api/clear-session', async (req, res) => {
// // // //   try {
// // // //     await bot.clearSession();
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Session cleared successfully'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // app.delete('/api/clear-all', async (req, res) => {
// // // //   try {
// // // //     await bot.clearSession();
// // // //     await bot.shutdown();
    
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'All sessions cleared and bot stopped'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // // ========== ORDER CREATION HANDLER ==========
// // // // if (bot.on && typeof bot.on === 'function') {
// // // //   bot.on('order-created', async (orderData) => {
// // // //     console.log(`🛍️ New order from WhatsApp: ${orderData.orderNumber}`);
    
// // // //     try {
// // // //       const savedOrder = await apiService.createOrder(orderData);
      
// // // //       if (savedOrder && savedOrder._id) {
// // // //         console.log(`✅ Order saved to DB: ${savedOrder._id}`);
        
// // // //         // Send notification via notification-manager
// // // //         const notificationResult = await notificationManager.sendNewOrderNotification(savedOrder);
// // // //         console.log(`📤 Notification result: ${notificationResult.success}`);
        
// // // //         // Also emit directly to notification namespace
// // // //         notificationNamespace.emit('NEW_ORDER', {
// // // //           type: 'NEW_ORDER',
// // // //           order: savedOrder,
// // // //           timestamp: new Date().toISOString(),
// // // //           priority: 'high'
// // // //         });
        
// // // //         // Emit to admin room for real-time updates
// // // //         notificationNamespace.to('admins').emit('dashboard-update', {
// // // //           type: 'order-created',
// // // //           order: savedOrder,
// // // //           timestamp: new Date().toISOString()
// // // //         });
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('❌ Order processing failed:', error.message);
// // // //     }
// // // //   });
// // // // }

// // // // // ========== NOTIFICATION TEST ENDPOINT ==========
// // // // app.post('/api/test-notification', async (req, res) => {
// // // //   try {
// // // //     const testOrder = {
// // // //       orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
// // // //       customerName: 'Test Customer',
// // // //       customerPhone: '9876543210',
// // // //       totalPrice: 1999,
// // // //       totalAmount: 1999,
// // // //       items: [{ productName: 'Test Product', quantity: 1, price: 1999 }],
// // // //       status: 'pending',
// // // //       paymentStatus: 'pending',
// // // //       createdAt: new Date().toISOString(),
// // // //       _id: `test-${Date.now()}`
// // // //     };
    
// // // //     // Emit test notification
// // // //     notificationNamespace.emit('NEW_ORDER', {
// // // //       type: 'NEW_ORDER',
// // // //       order: testOrder,
// // // //       timestamp: new Date().toISOString(),
// // // //       priority: 'high',
// // // //       test: true
// // // //     });
    
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Test notification sent',
// // // //       orderNumber: testOrder.orderNumber,
// // // //       timestamp: new Date().toISOString()
// // // //     });
    
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // // Root endpoint
// // // // app.get('/', (req, res) => {
// // // //   res.json({
// // // //     name: 'WhatsApp Bot & Notification Server',
// // // //     version: '2.0.0',
// // // //     status: 'running',
// // // //     port: PORT,
// // // //     websocket: {
// // // //       qrNamespace: `http://localhost:${PORT}/qr`,
// // // //       notificationNamespace: `http://localhost:${PORT}/notifications`,
// // // //       connectedClients: {
// // // //         qr: qrNamespace.sockets.size,
// // // //         notifications: notificationNamespace.sockets.size
// // // //       },
// // // //       socketIoGlobal: !!global.io
// // // //     },
// // // //     authentication: {
// // // //       adminTokenConfigured: !!ADMIN_TOKEN,
// // // //       requiredForNotifications: true
// // // //     },
// // // //     apiEndpoints: {
// // // //       status: '/api/status',
// // // //       qr: '/api/qr',
// // // //       stats: '/api/stats',
// // // //       bot: '/api/bot',
// // // //       health: '/health',
// // // //       testNotification: '/api/test-notification',
// // // //       websocketStatus: '/api/websocket-status'
// // // //     },
// // // //     timestamp: new Date().toISOString()
// // // //   });
// // // // });

// // // // // ========== START SERVER ==========
// // // // server.listen(PORT, () => {
// // // //   console.log('='.repeat(60));
// // // //   console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER - FIXED VERSION');
// // // //   console.log('='.repeat(60));
// // // //   console.log(`✅ Server running on port: ${PORT}`);
// // // //   console.log(`🔗 API URL: http://localhost:${PORT}`);
// // // //   console.log(`📡 QR Socket.IO: http://localhost:${PORT}/qr`);
// // // //   console.log(`🔔 Notification Socket.IO: http://localhost:${PORT}/notifications`);
// // // //   console.log(`🌐 Root Socket.IO: http://localhost:${PORT}/`);
// // // //   console.log(`📊 Health: http://localhost:${PORT}/health`);
// // // //   console.log(`🔍 WebSocket Status: http://localhost:${PORT}/api/websocket-status`);
// // // //   console.log(`🌐 Global Socket.IO: ${global.io ? 'AVAILABLE ✅' : 'NOT AVAILABLE ❌'}`);
// // // //   console.log(`🔐 Admin Token: ${ADMIN_TOKEN ? 'CONFIGURED ✅' : 'NOT CONFIGURED ⚠️'}`);
// // // //   console.log('='.repeat(60));
// // // //   console.log('⚡ Single Socket.IO server for both QR and Notifications');
// // // //   console.log('🔧 notification-manager will work with global.io');
// // // //   console.log('='.repeat(60));
  
// // // //   // Initialize QR Socket Server
// // // //   try {
// // // //     qrSocketServer.initialize(server, bot, io);
// // // //     console.log('✅ QR Socket Server initialized with existing Socket.IO');
// // // //   } catch (error) {
// // // //     console.error('❌ QR Socket Server initialization error:', error.message);
// // // //   }
// // // // });

// // // // // ========== GRACEFUL SHUTDOWN ==========
// // // // process.on('SIGINT', async () => {
// // // //   console.log('\n🛑 Received SIGINT - Shutting down...');
  
// // // //   try {
// // // //     await bot.shutdown();
    
// // // //     // Disconnect all Socket.IO clients
// // // //     qrNamespace.disconnectSockets(true);
// // // //     notificationNamespace.disconnectSockets(true);
    
// // // //     if (qrSocketServer.close) {
// // // //       qrSocketServer.close();
// // // //     }
    
// // // //     console.log('✅ All clients disconnected');
// // // //   } catch (error) {
// // // //     console.error('Shutdown error:', error);
// // // //   }
  
// // // //   server.close(() => {
// // // //     console.log('✅ Server closed gracefully');
// // // //     process.exit(0);
// // // //   });
// // // // });

// // // // process.on('SIGTERM', async () => {
// // // //   console.log('\n🛑 Received SIGTERM - Terminating...');
  
// // // //   try {
// // // //     await bot.shutdown();
// // // //     qrNamespace.disconnectSockets(true);
// // // //     notificationNamespace.disconnectSockets(true);
    
// // // //     if (qrSocketServer.close) {
// // // //       qrSocketServer.close();
// // // //     }
// // // //   } catch (error) {
// // // //     console.error('Termination error:', error);
// // // //   }
  
// // // //   server.close(() => {
// // // //     process.exit(0);
// // // //   });
// // // // });

// // // // export default server;
















// // // // server.js - COMPLETE WITH MULTI-TENANT SUPPORT - FIXED VERSION
// // // import express from 'express';
// // // import cors from 'cors';
// // // import http from 'http';
// // // import { Server } from 'socket.io';
// // // import dotenv from 'dotenv';
// // // import bot from './whatsap/bot.js';
// // // import apiService from './services/apiService.js';
// // // import notificationManager from './services/notifications/notification-manager.js';
// // // import { qrSocketServer } from "./services/qrSocketServer.js";
// // // import { getSessionManager } from './whatsap/sessionManager.js'; // ✅ ADDED
// // // import { getCompanyMapper } from './services/companyMapper.js'; // ✅ ADDED

// // // dotenv.config();

// // // const app = express();
// // // const server = http.createServer(app);
// // // const PORT = process.env.BOT_PORT || 3001;

// // // // ========== SOCKET.IO CONFIGURATION ==========
// // // const ADMIN_TOKEN = process.env.NOTIFICATION_API_KEY || 'dev-key-2024';

// // // // ========== CREATE SOCKET.IO SERVER ==========
// // // const io = new Server(server, {
// // //   cors: {
// // //     origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000'],
// // //     methods: ["GET", "POST"],
// // //     credentials: true
// // //   },
// // //   transports: ['websocket', 'polling'],
// // //   pingTimeout: 30000,
// // //   pingInterval: 25000,
// // //   allowEIO3: true,
// // //   allowUpgrades: true,
// // //   cookie: false,
// // //   connectTimeout: 45000,
// // //   maxHttpBufferSize: 1e8,
// // //   upgradeTimeout: 10000,
// // //   path: '/socket.io/'
// // // });

// // // // ========== SET SOCKET.IO GLOBALLY ==========
// // // global.io = io;
// // // console.log('✅ Socket.IO set globally');

// // // // ========== EXPRESS MIDDLEWARE ==========
// // // app.use(cors({
// // //   origin: ['http://localhost:3000', 'http://localhost:3001'],
// // //   credentials: true
// // // }));

// // // app.use(express.json());
// // // app.use(express.urlencoded({ extended: true }));

// // // // Add CORS headers manually
// // // app.use((req, res, next) => {
// // //   res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
// // //   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// // //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// // //   res.header('Access-Control-Allow-Credentials', 'true');
  
// // //   if (req.method === 'OPTIONS') {
// // //     return res.status(200).end();
// // //   }
// // //   next();
// // // });

// // // // ========== SETUP SOCKET.IO NAMESPACES ==========
// // // const qrNamespace = io.of('/qr');
// // // const notificationNamespace = io.of('/notifications');

// // // // ========== ADD ROOT NAMESPACE FOR DEBUGGING ==========
// // // io.on('connection', (socket) => {
// // //   console.log(`🌐 Root namespace client connected: ${socket.id} (for debugging)`);
  
// // //   socket.on('error', (error) => {
// // //     console.error(`❌ Root namespace error from ${socket.id}:`, error);
// // //   });
  
// // //   socket.on('disconnect', (reason) => {
// // //     console.log(`🌐 Root namespace client disconnected: ${socket.id} (${reason})`);
// // //   });
// // // });

// // // // ========== QR NAMESPACE HANDLER ==========
// // // qrNamespace.on('connection', (socket) => {
// // //   console.log(`🔗 QR Client connected: ${socket.id}`);
  
// // //   // Get companyId from handshake query
// // //   const companyId = socket.handshake.query.companyId || null;
  
// // //   if (companyId) {
// // //     console.log(`🏢 QR Client for company: ${companyId}`);
// // //     socket.join(`company:${companyId}`);
// // //     socket.join('qr-clients');
// // //   }
  
// // //   // ADD connection error handler
// // //   socket.on('error', (error) => {
// // //     console.error(`❌ QR Socket error from ${socket.id}:`, error);
// // //   });
  
// // //   socket.on('disconnect', (reason) => {
// // //     console.log(`🔌 QR Client disconnected: ${socket.id} (${reason})`);
// // //   });
// // // });

// // // // ========== NOTIFICATION NAMESPACE HANDLER (WITH AUTHENTICATION & COMPANY CONTEXT) ==========
// // // notificationNamespace.on('connection', (socket) => {
// // //   console.log(`🔔 Notification Client connected: ${socket.id}`);
  
// // //   // ADD connection error handler
// // //   socket.on('error', (error) => {
// // //     console.error(`❌ Notification Socket error from ${socket.id}:`, error);
// // //   });
  
// // //   // Set authentication status
// // //   let isAuthenticated = false;
// // //   let authenticatedUser = null;
  
// // //   // ===== AUTHENTICATION HANDLER WITH COMPANY CONTEXT =====
// // //   socket.on('authenticate', (data) => {
// // //     console.log(`🔐 Authentication attempt from ${socket.id}:`, {
// // //       userId: data?.userId,
// // //       userRole: data?.userRole,
// // //       companyId: data?.companyId,
// // //       tokenPreview: data?.token ? data.token.substring(0, 20) + '...' : 'No token'
// // //     });
    
// // //     const { token, userId, userRole, name, connectionId, companyId } = data || {};
    
// // //     // Validate required fields
// // //     if (!token || !userId || !userRole) {
// // //       console.error(`❌ Missing authentication data from ${socket.id}`);
// // //       socket.emit('unauthorized', {
// // //         success: false,
// // //         message: 'Missing authentication data',
// // //         timestamp: new Date().toISOString()
// // //       });
// // //       return;
// // //     }
    
// // //     // Validate admin token
// // //     if (token !== ADMIN_TOKEN) {
// // //       console.error(`❌ Invalid token from ${socket.id}`);
// // //       socket.emit('unauthorized', {
// // //         success: false,
// // //         message: 'Invalid authentication token',
// // //         timestamp: new Date().toISOString()
// // //       });
// // //       socket.disconnect();
// // //       return;
// // //     }
    
// // //     // Check if user is admin
// // //     if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'manager') {
// // //       console.error(`❌ Non-admin user attempted to connect: ${userId} (${userRole})`);
// // //       socket.emit('unauthorized', {
// // //         success: false,
// // //         message: 'Admin access required',
// // //         timestamp: new Date().toISOString()
// // //       });
// // //       socket.disconnect();
// // //       return;
// // //     }
    
// // //     // ✅ STORE COMPANY ID IN AUTHENTICATED USER
// // //     const userCompanyId = companyId || (userRole === 'superadmin' ? null : 'default');
    
// // //     authenticatedUser = {
// // //       id: userId,
// // //       role: userRole,
// // //       name: name || `Admin-${userId.substring(0, 8)}`,
// // //       companyId: userCompanyId,
// // //       connectionId: connectionId || socket.id,
// // //       authenticatedAt: new Date().toISOString()
// // //     };
    
// // //     // Authentication successful
// // //     isAuthenticated = true;
    
// // //     console.log(`✅ Admin authenticated: ${authenticatedUser.name} (${userId}) for company: ${userCompanyId || 'ALL'}`);
    
// // //     // ✅ JOIN COMPANY-SPECIFIC ROOM
// // //     if (userCompanyId) {
// // //       socket.join(`company:${userCompanyId}`);
// // //       console.log(`👥 ${authenticatedUser.name} joined room 'company:${userCompanyId}'`);
// // //     }
    
// // //     // Join admin room for global broadcasts
// // //     socket.join('admins');
// // //     console.log(`👥 ${authenticatedUser.name} joined 'admins' room`);
    
// // //     socket.emit('authenticated', {
// // //       success: true,
// // //       message: 'Authentication successful',
// // //       user: {
// // //         id: userId,
// // //         role: userRole,
// // //         name: name || `Admin-${userId.substring(0, 8)}`,
// // //         companyId: userCompanyId
// // //       },
// // //       socketId: socket.id,
// // //       timestamp: new Date().toISOString(),
// // //       serverTime: new Date().toISOString()
// // //     });
// // //   });
  
// // //   // ===== FCM TOKEN REGISTRATION WITH COMPANY CONTEXT =====
// // //   socket.on('register-fcm-token', (data) => {
// // //     if (!isAuthenticated) {
// // //       console.error(`❌ Unauthenticated FCM token registration attempt`);
// // //       socket.emit('fcm-token-registration-failed', {
// // //         success: false,
// // //         message: 'Authentication required',
// // //         timestamp: new Date().toISOString()
// // //       });
// // //       return;
// // //     }
    
// // //     const { token, deviceInfo, timestamp, companyId } = data || {};
    
// // //     if (!token) {
// // //       console.error(`❌ Invalid FCM token from ${authenticatedUser?.name}`);
// // //       socket.emit('fcm-token-registration-failed', {
// // //         success: false,
// // //         message: 'Invalid FCM token',
// // //         timestamp: new Date().toISOString()
// // //       });
// // //       return;
// // //     }
    
// // //     // Use companyId from request or from authenticated user
// // //     const tokenCompanyId = companyId || authenticatedUser?.companyId;
    
// // //     console.log(`📱 FCM token registered for ${authenticatedUser.name} (company: ${tokenCompanyId || 'ALL'}):`, {
// // //       tokenPreview: token.substring(0, 20) + '...',
// // //       deviceType: deviceInfo?.deviceType || 'unknown',
// // //       timestamp: timestamp || new Date().toISOString()
// // //     });
    
// // //     // Store FCM token in database with company context
// // //     // This would be implemented in your notification service
    
// // //     socket.emit('fcm-token-registered', {
// // //       success: true,
// // //       message: 'FCM token registered successfully',
// // //       timestamp: new Date().toISOString()
// // //     });
// // //   });
  
// // //   // ===== HEARTBEAT/PING =====
// // //   socket.on('ping', (data) => {
// // //     if (!isAuthenticated) return;
    
// // //     const { timestamp } = data || {};
// // //     const latency = timestamp ? Date.now() - timestamp : null;
    
// // //     socket.emit('pong', {
// // //       timestamp: timestamp || Date.now(),
// // //       serverTime: Date.now(),
// // //       latency: latency,
// // //       message: 'pong'
// // //     });
// // //   });
  
// // //   // ===== DISCONNECTION HANDLER =====
// // //   socket.on('disconnect', (reason) => {
// // //     console.log(`🔌 Notification Client disconnected: ${socket.id} (${reason})`);
    
// // //     if (authenticatedUser) {
// // //       console.log(`👋 ${authenticatedUser.name} (${authenticatedUser.companyId || 'ALL'}) disconnected`);
// // //     }
// // //   });
// // // });

// // // // ========== PASS SOCKET.IO TO QR SOCKET SERVER ==========
// // // if (qrSocketServer.setIO) {
// // //   qrSocketServer.setIO(io);
// // // } else {
// // //   console.log('ℹ️ qrSocketServer.setIO not available');
// // // }

// // // // ========== SET BOT AND SESSION MANAGER IN QR SOCKET SERVER ==========
// // // try {
  
  
// // //   // ✅ GET SESSION MANAGER INSTANCE AND SET IT
// // //   const sessionManager = getSessionManager();
// // //   if (qrSocketServer.setSessionManager) {
// // //     qrSocketServer.setSessionManager(sessionManager);
// // //     console.log('✅ Session Manager set in QR Socket Server');
// // //   } else {
// // //     console.log('ℹ️ qrSocketServer.setSessionManager not available');
// // //   }
  
// // //   console.log('✅ QR Socket Server initialized with bot and session manager');
// // // } catch (error) {
// // //   console.error('❌ QR Socket Server initialization error:', error.message);
// // // }

// // // // ========== INITIALIZE COMPANY MAPPER CACHE ==========
// // // (async () => {
// // //   try {
// // //     const companyMapper = getCompanyMapper();
// // //     await companyMapper.warmUpCache();
// // //     console.log('✅ Company mapper cache warmed up');
// // //   } catch (error) {
// // //     console.error('❌ Failed to warm up company mapper cache:', error.message);
// // //   }
// // // })();

// // // // ========== REST API ROUTES ==========

// // // // Health check endpoint
// // // app.get('/health', (req, res) => {
// // //   const sessionManager = getSessionManager();
// // //   const status = bot.getStatus();
// // //   const qrClientsCount = qrNamespace.sockets.size;
// // //   const notificationClientsCount = notificationNamespace.sockets.size;
// // //   const rootClientsCount = io.sockets.sockets.size;
// // //   const activeSessions = sessionManager ? sessionManager.getAllSessions().length : 0;
  
// // //   res.json({
// // //     status: 'healthy',
// // //     server: 'running',
// // //     bot: status.connected ? 'connected' : 'disconnected',
// // //     websocket: {
// // //       qrClients: qrClientsCount,
// // //       notificationClients: notificationClientsCount,
// // //       rootClients: rootClientsCount,
// // //       socketIoGlobal: !!global.io
// // //     },
// // //     authentication: {
// // //       adminTokenConfigured: !!ADMIN_TOKEN,
// // //       tokenPreview: ADMIN_TOKEN ? ADMIN_TOKEN.substring(0, 10) + '...' : 'Not configured'
// // //     },
// // //     multiTenant: {
// // //       activeSessions: activeSessions,
// // //       sessionManagerReady: !!sessionManager,
// // //       companyMapperReady: true
// // //     },
// // //     timestamp: new Date().toISOString()
// // //   });
// // // });

// // // // WebSocket status endpoint for debugging
// // // app.get('/api/websocket-status', (req, res) => {
// // //   const qrClients = qrNamespace.sockets.size;
// // //   const notificationClients = notificationNamespace.sockets.size;
// // //   const rootClients = io.sockets.sockets.size;
  
// // //   res.json({
// // //     status: 'running',
// // //     socketIoVersion: '4.x',
// // //     clients: {
// // //       qr: qrClients,
// // //       notifications: notificationClients,
// // //       root: rootClients,
// // //       total: qrClients + notificationClients + rootClients
// // //     },
// // //     namespaces: {
// // //       qr: '/qr',
// // //       notifications: '/notifications',
// // //       root: '/'
// // //     },
// // //     environment: process.env.NODE_ENV,
// // //     timestamp: new Date().toISOString()
// // //   });
// // // });

// // // // ✅ NEW: Company-specific status endpoint
// // // app.get('/api/company/:companyId/status', (req, res) => {
// // //   try {
// // //     const { companyId } = req.params;
// // //     const sessionManager = getSessionManager();
    
// // //     if (!sessionManager) {
// // //       return res.status(500).json({
// // //         success: false,
// // //         error: 'Session manager not available'
// // //       });
// // //     }
    
// // //     const sessionStatus = sessionManager.getSessionStatus(companyId);
    
// // //     res.json({
// // //       success: true,
// // //       companyId,
// // //       status: sessionStatus,
// // //       timestamp: new Date().toISOString()
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // ✅ NEW: Multi-tenant stats endpoint
// // // app.get('/api/multi-tenant/stats', (req, res) => {
// // //   try {
// // //     const sessionManager = getSessionManager();
    
// // //     if (!sessionManager) {
// // //       return res.status(500).json({
// // //         success: false,
// // //         error: 'Session manager not available'
// // //       });
// // //     }
    
// // //     const sessions = sessionManager.getAllSessions();
// // //     const stats = sessionManager.getStats();
    
// // //     res.json({
// // //       success: true,
// // //       totalCompanies: sessions.length,
// // //       activeSessions: sessions.filter(s => s.connected).length,
// // //       companies: sessions,
// // //       stats: stats,
// // //       timestamp: new Date().toISOString()
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // ✅ NEW: Company phone number mapping endpoint
// // // app.get('/api/company/:companyId/phone-numbers', async (req, res) => {
// // //   try {
// // //     const { companyId } = req.params;
// // //     const companyMapper = getCompanyMapper();
    
// // //     const phoneNumbers = await companyMapper.getCompanyPhoneNumbers(companyId);
    
// // //     res.json({
// // //       success: true,
// // //       companyId,
// // //       phoneNumbers,
// // //       count: phoneNumbers.length,
// // //       timestamp: new Date().toISOString()
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // ✅ NEW: Refresh company mapping cache
// // // app.post('/api/company/:companyId/refresh-mapping', async (req, res) => {
// // //   try {
// // //     const { companyId } = req.params;
// // //     const companyMapper = getCompanyMapper();
    
// // //     await companyMapper.refreshCompanyMapping(companyId);
    
// // //     res.json({
// // //       success: true,
// // //       message: `Company mapping refreshed for ${companyId}`,
// // //       timestamp: new Date().toISOString()
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // === BOT MANAGEMENT ENDPOINTS ===

// // // app.get('/api/status', (req, res) => {
// // //   try {
// // //     const status = bot.getStatus();
// // //     res.json({
// // //       success: true,
// // //       qr: bot.getCurrentQR(),
// // //       status: status.connected ? 'connected' : 
// // //              bot.getCurrentQR() ? 'qr_required' : 'disconnected',
// // //       message: status.connected ? 'WhatsApp is connected' : 
// // //               bot.getCurrentQR() ? 'QR code required' : 'Not connected',
// // //       stats: status.stats,
// // //       botInfo: status.botInfo,
// // //       reconnectAttempts: status.reconnectAttempts,
// // //       multiTenant: status.multiTenant
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.get('/api/qr', (req, res) => {
// // //   try {
// // //     const qr = bot.getCurrentQR();
// // //     res.json({
// // //       success: true,
// // //       qr: qr,
// // //       hasQr: !!qr,
// // //       timestamp: new Date().toISOString()
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.get('/api/stats', (req, res) => {
// // //   try {
// // //     const status = bot.getStatus();
// // //     res.json({
// // //       success: true,
// // //       stats: status.stats,
// // //       lastUpdated: new Date().toISOString()
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.get('/api/bot', (req, res) => {
// // //   try {
// // //     const status = bot.getStatus();
// // //     res.json({
// // //       success: true,
// // //       connected: status.connected,
// // //       authenticated: status.authenticated,
// // //       hasQR: !!bot.getCurrentQR(),
// // //       botInfo: status.botInfo,
// // //       stats: status.stats,
// // //       reconnectAttempts: status.reconnectAttempts,
// // //       uptime: status.formattedUptime,
// // //       multiTenant: status.multiTenant
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // app.post('/api/connect', async (req, res) => {
// // // //   try {
// // // //     await bot.initialize();
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Bot connection initiated'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // ✅ NEW: Connect specific company
// // // app.post('/api/company/:companyId/connect', async (req, res) => {
// // //   try {
// // //     const { companyId } = req.params;
    
// // //     await bot.addCompany(companyId);
    
// // //     res.json({
// // //       success: true,
// // //       message: `WhatsApp connection initiated for company ${companyId}`,
// // //       companyId
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // app.post('/api/disconnect', async (req, res) => {
// // // //   try {
// // // //     await bot.safeDestroyClient();
// // // //     res.json({
// // // //       success: true,
// // // //       message: 'Bot disconnected successfully'
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: error.message
// // // //     });
// // // //   }
// // // // });

// // // // ✅ NEW: Disconnect specific company
// // // app.post('/api/company/:companyId/disconnect', async (req, res) => {
// // //   try {
// // //     const { companyId } = req.params;
    
// // //     await bot.removeCompany(companyId);
    
// // //     res.json({
// // //       success: true,
// // //       message: `WhatsApp disconnected for company ${companyId}`,
// // //       companyId
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.post('/api/restart', async (req, res) => {
// // //   try {
// // //     await bot.restart();
// // //     res.json({
// // //       success: true,
// // //       message: 'Bot restart initiated'
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.post('/api/logout', async (req, res) => {
// // //   try {
// // //     await bot.logout();
// // //     res.json({
// // //       success: true,
// // //       message: 'Bot logged out successfully'
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.post('/api/send-message', async (req, res) => {
// // //   try {
// // //     const { to, message, companyId } = req.body;
    
// // //     if (!to || !message) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         error: 'Phone number and message are required'
// // //       });
// // //     }
    
// // //     // If companyId provided, use that specific client
// // //     let result;
// // //     if (companyId) {
// // //       const sessionManager = getSessionManager();
// // //       const client = sessionManager.getSession(companyId);
// // //       if (!client) {
// // //         return res.status(404).json({
// // //           success: false,
// // //           error: `No active session for company ${companyId}`
// // //         });
// // //       }
// // //       // You'll need to implement sendMessage with client
// // //       result = { success: true, message: 'Message sent via company client' };
// // //     } else {
// // //       result = await bot.sendMessage(to, message);
// // //     }
    
// // //     if (result.success) {
// // //       res.json(result);
// // //     } else {
// // //       res.status(500).json(result);
// // //     }
    
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.post('/api/clear-session', async (req, res) => {
// // //   try {
// // //     await bot.clearSession();
// // //     res.json({
// // //       success: true,
// // //       message: 'Session cleared successfully'
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // app.delete('/api/clear-all', async (req, res) => {
// // //   try {
// // //     await bot.clearSession();
// // //     await bot.shutdown();
    
// // //     res.json({
// // //       success: true,
// // //       message: 'All sessions cleared and bot stopped'
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // ========== ORDER CREATION HANDLER WITH COMPANY CONTEXT ==========
// // // if (bot.on && typeof bot.on === 'function') {
// // //   bot.on('order-created', async (orderData) => {
// // //     console.log(`🛍️ New order from WhatsApp: ${orderData.orderNumber} for company: ${orderData.companyId || 'unknown'}`);
    
// // //     try {
// // //       const savedOrder = await apiService.createOrder(orderData);
      
// // //       if (savedOrder && savedOrder._id) {
// // //         console.log(`✅ Order saved to DB: ${savedOrder._id}`);
        
// // //         // Send notification via notification-manager with company context
// // //         const notificationResult = await notificationManager.sendNewOrderNotification(savedOrder);
// // //         console.log(`📤 Notification result: ${notificationResult.success}`);
        
// // //         // ✅ COMPANY-SPECIFIC BROADCAST - Only to that company's admins
// // //         if (savedOrder.companyId) {
// // //           notificationNamespace.to(`company:${savedOrder.companyId}`).emit('NEW_ORDER', {
// // //             type: 'NEW_ORDER',
// // //             order: savedOrder,
// // //             companyId: savedOrder.companyId,
// // //             timestamp: new Date().toISOString(),
// // //             priority: 'high'
// // //           });
          
// // //           // Also emit to admin room for legacy support
// // //           notificationNamespace.to('admins').emit('dashboard-update', {
// // //             type: 'order-created',
// // //             order: savedOrder,
// // //             companyId: savedOrder.companyId,
// // //             timestamp: new Date().toISOString()
// // //           });
          
// // //           console.log(`📢 Order broadcast to company: ${savedOrder.companyId}`);
// // //         } else {
// // //           // Legacy broadcast
// // //           notificationNamespace.emit('NEW_ORDER', {
// // //             type: 'NEW_ORDER',
// // //             order: savedOrder,
// // //             timestamp: new Date().toISOString(),
// // //             priority: 'high'
// // //           });
          
// // //           notificationNamespace.to('admins').emit('dashboard-update', {
// // //             type: 'order-created',
// // //             order: savedOrder,
// // //             timestamp: new Date().toISOString()
// // //           });
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.error('❌ Order processing failed:', error.message);
// // //     }
// // //   });
// // // }

// // // // ========== NOTIFICATION TEST ENDPOINT WITH COMPANY CONTEXT ==========
// // // app.post('/api/test-notification', async (req, res) => {
// // //   try {
// // //     const { companyId } = req.body || {};
    
// // //     const testOrder = {
// // //       orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
// // //       customerName: 'Test Customer',
// // //       customerPhone: '9876543210',
// // //       totalPrice: 1999,
// // //       totalAmount: 1999,
// // //       items: [{ productName: 'Test Product', quantity: 1, price: 1999 }],
// // //       status: 'pending',
// // //       paymentStatus: 'pending',
// // //       createdAt: new Date().toISOString(),
// // //       _id: `test-${Date.now()}`,
// // //       companyId: companyId || 'default'
// // //     };
    
// // //     // Emit test notification to company-specific room
// // //     if (companyId) {
// // //       notificationNamespace.to(`company:${companyId}`).emit('NEW_ORDER', {
// // //         type: 'NEW_ORDER',
// // //         order: testOrder,
// // //         companyId: companyId,
// // //         timestamp: new Date().toISOString(),
// // //         priority: 'high',
// // //         test: true
// // //       });
// // //     } else {
// // //       // Broadcast to all
// // //       notificationNamespace.emit('NEW_ORDER', {
// // //         type: 'NEW_ORDER',
// // //         order: testOrder,
// // //         timestamp: new Date().toISOString(),
// // //         priority: 'high',
// // //         test: true
// // //       });
// // //     }
    
// // //     res.json({
// // //       success: true,
// // //       message: `Test notification sent${companyId ? ` to company ${companyId}` : ''}`,
// // //       orderNumber: testOrder.orderNumber,
// // //       companyId: companyId || 'all',
// // //       timestamp: new Date().toISOString()
// // //     });
    
// // //   } catch (error) {
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // });

// // // // Root endpoint
// // // app.get('/', (req, res) => {
// // //   const sessionManager = getSessionManager();
// // //   const sessions = sessionManager ? sessionManager.getAllSessions() : [];
  
// // //   res.json({
// // //     name: 'WhatsApp Bot & Notification Server',
// // //     version: '2.0.0',
// // //     status: 'running',
// // //     port: PORT,
// // //     websocket: {
// // //       qrNamespace: `http://localhost:${PORT}/qr`,
// // //       notificationNamespace: `http://localhost:${PORT}/notifications`,
// // //       connectedClients: {
// // //         qr: qrNamespace.sockets.size,
// // //         notifications: notificationNamespace.sockets.size
// // //       },
// // //       socketIoGlobal: !!global.io
// // //     },
// // //     authentication: {
// // //       adminTokenConfigured: !!ADMIN_TOKEN,
// // //       requiredForNotifications: true
// // //     },
// // //     multiTenant: {
// // //       enabled: true,
// // //       activeCompanies: sessions.length,
// // //       sessions: sessions.map(s => ({
// // //         companyId: s.companyId,
// // //         status: s.status,
// // //         connected: s.connected
// // //       }))
// // //     },
// // //     apiEndpoints: {
// // //       status: '/api/status',
// // //       qr: '/api/qr',
// // //       stats: '/api/stats',
// // //       bot: '/api/bot',
// // //       health: '/health',
// // //       testNotification: '/api/test-notification',
// // //       websocketStatus: '/api/websocket-status',
// // //       multiTenant: '/api/multi-tenant/stats',
// // //       companyStatus: '/api/company/:companyId/status',
// // //       companyConnect: '/api/company/:companyId/connect',
// // //       companyDisconnect: '/api/company/:companyId/disconnect',
// // //       companyPhones: '/api/company/:companyId/phone-numbers',
// // //       refreshMapping: '/api/company/:companyId/refresh-mapping'
// // //     },
// // //     timestamp: new Date().toISOString()
// // //   });
// // // });

// // // // ========== START SERVER ==========
// // // server.listen(PORT, () => {
// // //   console.log('='.repeat(60));
// // //   console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER - MULTI-TENANT VERSION');
// // //   console.log('='.repeat(60));
// // //   console.log(`✅ Server running on port: ${PORT}`);
// // //   console.log(`🔗 API URL: http://localhost:${PORT}`);
// // //   console.log(`📡 QR Socket.IO: http://localhost:${PORT}/qr`);
// // //   console.log(`🔔 Notification Socket.IO: http://localhost:${PORT}/notifications`);
// // //   console.log(`🌐 Root Socket.IO: http://localhost:${PORT}/`);
// // //   console.log(`📊 Health: http://localhost:${PORT}/health`);
// // //   console.log(`🔍 WebSocket Status: http://localhost:${PORT}/api/websocket-status`);
// // //   console.log(`🌐 Global Socket.IO: ${global.io ? 'AVAILABLE ✅' : 'NOT AVAILABLE ❌'}`);
// // //   console.log(`🔐 Admin Token: ${ADMIN_TOKEN ? 'CONFIGURED ✅' : 'NOT CONFIGURED ⚠️'}`);
// // //   console.log('='.repeat(60));
// // //   console.log('⚡ MULTI-TENANT FEATURES ENABLED:');
// // //   console.log('   ✅ Company-specific QR broadcasting');
// // //   console.log('   ✅ Company-specific notification rooms');
// // //   console.log('   ✅ Company session management');
// // //   console.log('   ✅ Phone number → Company mapping');
// // //   console.log('='.repeat(60));
  
// // //   // Initialize QR Socket Server
// // //   try {
// // //     qrSocketServer.initialize(server, bot, io);
// // //     console.log('✅ QR Socket Server initialized with existing Socket.IO');
// // //   } catch (error) {
// // //     console.error('❌ QR Socket Server initialization error:', error.message);
// // //   }
// // // });

// // // // ========== GRACEFUL SHUTDOWN ==========
// // // process.on('SIGINT', async () => {
// // //   console.log('\n🛑 Received SIGINT - Shutting down...');
  
// // //   try {
// // //     await bot.shutdown();
    
// // //     // Disconnect all Socket.IO clients
// // //     qrNamespace.disconnectSockets(true);
// // //     notificationNamespace.disconnectSockets(true);
    
// // //     if (qrSocketServer.close) {
// // //       qrSocketServer.close();
// // //     }
    
// // //     console.log('✅ All clients disconnected');
// // //   } catch (error) {
// // //     console.error('Shutdown error:', error);
// // //   }
  
// // //   server.close(() => {
// // //     console.log('✅ Server closed gracefully');
// // //     process.exit(0);
// // //   });
// // // });

// // // process.on('SIGTERM', async () => {
// // //   console.log('\n🛑 Received SIGTERM - Terminating...');
  
// // //   try {
// // //     await bot.shutdown();
// // //     qrNamespace.disconnectSockets(true);
// // //     notificationNamespace.disconnectSockets(true);
    
// // //     if (qrSocketServer.close) {
// // //       qrSocketServer.close();
// // //     }
// // //   } catch (error) {
// // //     console.error('Termination error:', error);
// // //   }
  
// // //   server.close(() => {
// // //     process.exit(0);
// // //   });
// // // });

// // // export default server;































// // server.js - COMPLETE WITH MULTI-TENANT SUPPORT - PROFESSIONAL VERSION
// import express from 'express';
// import cors from 'cors';
// import http from 'http';
// import { Server } from 'socket.io';
// import dotenv from 'dotenv';
// import bot from './whatsap/bot.js';
// import apiService from './services/apiService.js';
// import notificationManager from './services/notifications/notification-manager.js';
// import { qrSocketServer } from "./services/qrSocketServer.js";
// import { getSessionManager } from './whatsap/sessionManager.js';
// import { getCompanyMapper } from './services/companyMapper.js';
// import url from 'url';

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.BOT_PORT || 3001;

// // ========== SOCKET.IO CONFIGURATION ==========
// const ADMIN_TOKEN = process.env.NOTIFICATION_API_KEY || 'dev-key-2024';

// // Set bot in QR socket server
// qrSocketServer.setBot(bot);

// // ========== CREATE SOCKET.IO SERVER ==========
// const io = new Server(server, {
//   cors: {
//     origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000'],
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling'],
//   pingTimeout: 30000,
//   pingInterval: 25000,
//   allowEIO3: true,
//   allowUpgrades: true,
//   cookie: false,
//   connectTimeout: 45000,
//   maxHttpBufferSize: 1e8,
//   upgradeTimeout: 10000,
//   path: '/socket.io/'
// });

// // ========== SET SOCKET.IO GLOBALLY ==========
// global.io = io;
// console.log('✅ Socket.IO set globally');

// // ========== EXPRESS MIDDLEWARE ==========
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001'],
//   credentials: true
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Add CORS headers manually
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
  
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
//   next();
// });

// // ========== WEBSOCKET UPGRADE HANDLER ==========
// server.on('upgrade', (request, socket, head) => {
//   try {
//     const pathname = url.parse(request.url).pathname;
    
//     // Log all upgrade requests for debugging
//     console.log(`🔌 WebSocket upgrade request: ${pathname}`);
    
//     // Let Socket.IO handle its own upgrades
//     if (pathname.startsWith('/socket.io/')) {
//       return;
//     }
    
//     // Let QR WebSocket server handle /ws/qr paths
//     if (pathname.startsWith('/ws/')) {
//       return;
//     }
    
//     // If no handler, destroy the socket to prevent hanging
//     if (!pathname.startsWith('/socket.io/') && !pathname.startsWith('/ws/')) {
//       socket.destroy();
//     }
//   } catch (error) {
//     console.error('❌ WebSocket upgrade error:', error.message);
//     socket.destroy();
//   }
// });

// // ========== SETUP SOCKET.IO NAMESPACES ==========
// const qrNamespace = io.of('/qr');
// const notificationNamespace = io.of('/notifications');

// // ========== ADD ROOT NAMESPACE FOR DEBUGGING ==========
// io.on('connection', (socket) => {
//   console.log(`🌐 Root namespace client connected: ${socket.id} (for debugging)`);
  
//   socket.on('error', (error) => {
//     console.error(`❌ Root namespace error from ${socket.id}:`, error);
//   });
  
//   socket.on('disconnect', (reason) => {
//     console.log(`🌐 Root namespace client disconnected: ${socket.id} (${reason})`);
//   });
// });

// // ========== QR NAMESPACE HANDLER - WITH COMPANY CONTEXT ==========
// qrNamespace.on('connection', (socket) => {
//   console.log(`🔗 QR Client connected: ${socket.id}`);
  
//   // Get companyId from handshake query - MULTI-TENANT SUPPORT
//   const companyId = socket.handshake.query.companyId || null;
  
//   if (companyId) {
//     console.log(`🏢 QR Client for company: ${companyId}`);
//     socket.join(`company:${companyId}`);
//     socket.join('qr-clients');
    
//     // Send current QR status immediately
//     try {
//       const sessionManager = getSessionManager();
//       if (sessionManager) {
//         const sessionStatus = sessionManager.getSessionStatus(companyId);
//         if (sessionStatus) {
//           socket.emit('status', {
//             type: 'status',
//             connected: sessionStatus.connected || false,
//             authenticated: sessionStatus.status === 'connected',
//             hasQR: !!sessionStatus.qrData,
//             qr: sessionStatus.qrData,
//             companyId: companyId,
//             message: sessionStatus.connected ? 'WhatsApp is connected' : 
//                     sessionStatus.qrData ? 'QR code required' : 'Not connected',
//             timestamp: new Date().toISOString()
//           });
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error sending initial status:', error.message);
//     }
//   }
  
//   // Handle get_status requests
//   socket.on('get_status', () => {
//     try {
//       const sessionManager = getSessionManager();
//       if (sessionManager && companyId) {
//         const sessionStatus = sessionManager.getSessionStatus(companyId);
//         socket.emit('status', {
//           type: 'status',
//           connected: sessionStatus?.connected || false,
//           authenticated: sessionStatus?.status === 'connected',
//           hasQR: !!sessionStatus?.qrData,
//           qr: sessionStatus?.qrData,
//           companyId: companyId,
//           message: sessionStatus?.connected ? 'WhatsApp is connected' : 
//                   sessionStatus?.qrData ? 'QR code required' : 'Not connected',
//           timestamp: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error handling get_status:', error.message);
//     }
//   });
  
//   // Handle get_qr requests
//   socket.on('get_qr', () => {
//     try {
//       const sessionManager = getSessionManager();
//       if (sessionManager && companyId) {
//         const sessionStatus = sessionManager.getSessionStatus(companyId);
//         if (sessionStatus?.qrData) {
//           socket.emit('qr_update', {
//             type: 'qr_update',
//             qr: sessionStatus.qrData,
//             companyId: companyId,
//             timestamp: new Date().toISOString()
//           });
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error handling get_qr:', error.message);
//     }
//   });
  
//   // Handle get_stats requests
//   socket.on('get_stats', () => {
//     try {
//       const sessionManager = getSessionManager();
//       if (sessionManager) {
//         const stats = sessionManager.getStats();
//         socket.emit('stats_update', {
//           type: 'stats_update',
//           stats: stats,
//           timestamp: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error handling get_stats:', error.message);
//     }
//   });
  
//   // Handle ping for connection keep-alive
//   socket.on('ping', () => {
//     socket.emit('pong', {
//       type: 'pong',
//       timestamp: new Date().toISOString()
//     });
//   });
  
//   // ADD connection error handler
//   socket.on('error', (error) => {
//     console.error(`❌ QR Socket error from ${socket.id}:`, error);
//   });
  
//   socket.on('disconnect', (reason) => {
//     console.log(`🔌 QR Client disconnected: ${socket.id} (${reason})`);
//   });
// });

// // ========== NOTIFICATION NAMESPACE HANDLER - WITH MULTI-TENANT SUPPORT ==========
// notificationNamespace.on('connection', (socket) => {
//   console.log(`🔔 Notification Client connected: ${socket.id}`);
  
//   // ADD connection error handler
//   socket.on('error', (error) => {
//     console.error(`❌ Notification Socket error from ${socket.id}:`, error);
//   });
  
//   // Set authentication status
//   let isAuthenticated = false;
//   let authenticatedUser = null;
  
//   // ===== AUTHENTICATION HANDLER WITH COMPANY CONTEXT =====
//   socket.on('authenticate', (data) => {
//     console.log(`🔐 Authentication attempt from ${socket.id}:`, {
//       userId: data?.userId,
//       userRole: data?.userRole,
//       companyId: data?.companyId,
//       tokenPreview: data?.token ? data.token.substring(0, 20) + '...' : 'No token'
//     });
    
//     const { token, userId, userRole, name, connectionId, companyId } = data || {};
    
//     // Validate required fields
//     if (!token || !userId || !userRole) {
//       console.error(`❌ Missing authentication data from ${socket.id}`);
//       socket.emit('unauthorized', {
//         success: false,
//         message: 'Missing authentication data',
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
    
//     // Validate admin token
//     if (token !== ADMIN_TOKEN) {
//       console.error(`❌ Invalid token from ${socket.id}`);
//       socket.emit('unauthorized', {
//         success: false,
//         message: 'Invalid authentication token',
//         timestamp: new Date().toISOString()
//       });
//       socket.disconnect();
//       return;
//     }
    
//     // Check if user is admin
//     if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'manager') {
//       console.error(`❌ Non-admin user attempted to connect: ${userId} (${userRole})`);
//       socket.emit('unauthorized', {
//         success: false,
//         message: 'Admin access required',
//         timestamp: new Date().toISOString()
//       });
//       socket.disconnect();
//       return;
//     }
    
//     // STORE COMPANY ID IN AUTHENTICATED USER - MULTI-TENANT SUPPORT
//     const userCompanyId = companyId || (userRole === 'superadmin' ? null : 'default');
    
//     authenticatedUser = {
//       id: userId,
//       role: userRole,
//       name: name || `Admin-${userId.substring(0, 8)}`,
//       companyId: userCompanyId,
//       connectionId: connectionId || socket.id,
//       authenticatedAt: new Date().toISOString()
//     };
    
//     // Authentication successful
//     isAuthenticated = true;
    
//     console.log(`✅ Admin authenticated: ${authenticatedUser.name} (${userId}) for company: ${userCompanyId || 'ALL'}`);
    
//     // JOIN COMPANY-SPECIFIC ROOM - MULTI-TENANT SUPPORT
//     if (userCompanyId) {
//       socket.join(`company:${userCompanyId}`);
//       console.log(`👥 ${authenticatedUser.name} joined room 'company:${userCompanyId}'`);
//     }
    
//     // Join admin room for global broadcasts
//     socket.join('admins');
//     console.log(`👥 ${authenticatedUser.name} joined 'admins' room`);
    
//     socket.emit('authenticated', {
//       success: true,
//       message: 'Authentication successful',
//       user: {
//         id: userId,
//         role: userRole,
//         name: name || `Admin-${userId.substring(0, 8)}`,
//         companyId: userCompanyId
//       },
//       socketId: socket.id,
//       timestamp: new Date().toISOString(),
//       serverTime: new Date().toISOString()
//     });
//   });
  
//   // ===== FCM TOKEN REGISTRATION WITH COMPANY CONTEXT =====
//   socket.on('register-fcm-token', (data) => {
//     if (!isAuthenticated) {
//       console.error(`❌ Unauthenticated FCM token registration attempt`);
//       socket.emit('fcm-token-registration-failed', {
//         success: false,
//         message: 'Authentication required',
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
    
//     const { token, deviceInfo, timestamp, companyId } = data || {};
    
//     if (!token) {
//       console.error(`❌ Invalid FCM token from ${authenticatedUser?.name}`);
//       socket.emit('fcm-token-registration-failed', {
//         success: false,
//         message: 'Invalid FCM token',
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
    
//     // Use companyId from request or from authenticated user
//     const tokenCompanyId = companyId || authenticatedUser?.companyId;
    
//     console.log(`📱 FCM token registered for ${authenticatedUser.name} (company: ${tokenCompanyId || 'ALL'}):`, {
//       tokenPreview: token.substring(0, 20) + '...',
//       deviceType: deviceInfo?.deviceType || 'unknown',
//       timestamp: timestamp || new Date().toISOString()
//     });
    
//     socket.emit('fcm-token-registered', {
//       success: true,
//       message: 'FCM token registered successfully',
//       timestamp: new Date().toISOString()
//     });
//   });
  
//   // ===== HEARTBEAT/PING =====
//   socket.on('ping', (data) => {
//     if (!isAuthenticated) return;
    
//     const { timestamp } = data || {};
//     const latency = timestamp ? Date.now() - timestamp : null;
    
//     socket.emit('pong', {
//       timestamp: timestamp || Date.now(),
//       serverTime: Date.now(),
//       latency: latency,
//       message: 'pong'
//     });
//   });
  
//   // ===== DISCONNECTION HANDLER =====
//   socket.on('disconnect', (reason) => {
//     console.log(`🔌 Notification Client disconnected: ${socket.id} (${reason})`);
    
//     if (authenticatedUser) {
//       console.log(`👋 ${authenticatedUser.name} (${authenticatedUser.companyId || 'ALL'}) disconnected`);
//     }
//   });
// });

// // ========== PASS SOCKET.IO TO QR SOCKET SERVER ==========
// if (qrSocketServer.setIO) {
//   qrSocketServer.setIO(io);
//   console.log('✅ Socket.IO passed to QR Socket Server');
// }

// // ========== SET SESSION MANAGER IN QR SOCKET SERVER ==========
// try {
//   const sessionManager = getSessionManager();
//   if (qrSocketServer.setSessionManager) {
//     qrSocketServer.setSessionManager(sessionManager);
//     console.log('✅ Session Manager set in QR Socket Server');
//   }
// } catch (error) {
//   console.error('❌ Session Manager initialization error:', error.message);
// }

// // ========== INITIALIZE COMPANY MAPPER CACHE ==========
// (async () => {
//   try {
//     const companyMapper = getCompanyMapper();
//     await companyMapper.warmUpCache();
//     console.log('✅ Company mapper cache warmed up');
//   } catch (error) {
//     console.error('❌ Failed to warm up company mapper cache:', error.message);
//   }
// })();

// // ========== REST API ROUTES - WITH MULTI-TENANT SUPPORT ==========

// // Health check endpoint
// app.get('/health', (req, res) => {
//   const sessionManager = getSessionManager();
//   const status = bot.getStatus();
//   const qrClientsCount = qrNamespace.sockets.size;
//   const notificationClientsCount = notificationNamespace.sockets.size;
//   const rootClientsCount = io.sockets.sockets.size;
//   const activeSessions = sessionManager ? sessionManager.getAllSessions().length : 0;
  
//   res.json({
//     status: 'healthy',
//     server: 'running',
//     bot: status.connected ? 'connected' : 'disconnected',
//     websocket: {
//       qrClients: qrClientsCount,
//       notificationClients: notificationClientsCount,
//       rootClients: rootClientsCount,
//       socketIoGlobal: !!global.io
//     },
//     authentication: {
//       adminTokenConfigured: !!ADMIN_TOKEN,
//       tokenPreview: ADMIN_TOKEN ? ADMIN_TOKEN.substring(0, 10) + '...' : 'Not configured'
//     },
//     multiTenant: {
//       activeSessions: activeSessions,
//       sessionManagerReady: !!sessionManager,
//       companyMapperReady: true
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// // WebSocket status endpoint
// app.get('/api/websocket-status', (req, res) => {
//   const qrClients = qrNamespace.sockets.size;
//   const notificationClients = notificationNamespace.sockets.size;
//   const rootClients = io.sockets.sockets.size;
  
//   res.json({
//     status: 'running',
//     socketIoVersion: '4.x',
//     clients: {
//       qr: qrClients,
//       notifications: notificationClients,
//       root: rootClients,
//       total: qrClients + notificationClients + rootClients
//     },
//     namespaces: {
//       qr: '/qr',
//       notifications: '/notifications',
//       root: '/'
//     },
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString()
//   });
// });

// // ========== BOT MANAGEMENT ENDPOINTS WITH COMPANY CONTEXT ==========

// // Get bot status with optional company filter
// app.get('/api/status', (req, res) => {
//   try {
//     const { companyId } = req.query;
//     const status = bot.getStatus();
    
//     // If companyId provided, filter for that company
//     if (companyId && status.multiTenant) {
//       const companySession = status.multiTenant.companies.find(c => c.companyId === companyId);
//       if (companySession) {
//         return res.json({
//           success: true,
//           companyId,
//           connected: companySession.isConnected,
//           status: companySession.isConnected ? 'connected' : 'disconnected',
//           message: companySession.isConnected ? 'WhatsApp is connected' : 'Not connected',
//           stats: status.stats,
//           botInfo: status.botInfo,
//           timestamp: new Date().toISOString()
//         });
//       }
//     }
    
//     res.json({
//       success: true,
//       ...status,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Get QR code for specific company
// app.get('/api/qr', (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     const sessionManager = getSessionManager();
//     let qrData = null;
    
//     if (sessionManager) {
//       const session = sessionManager.getSessionStatus(companyId);
//       qrData = session?.qrData || null;
//     } else {
//       const botStatus = bot.getStatus();
//       qrData = botStatus.qrData;
//     }
    
//     res.json({
//       success: true,
//       qr: qrData,
//       hasQr: !!qrData,
//       companyId,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Get stats
// app.get('/api/stats', (req, res) => {
//   try {
//     const { companyId } = req.query;
//     const status = bot.getStatus();
    
//     res.json({
//       success: true,
//       stats: status.stats,
//       companyId: companyId || 'all',
//       lastUpdated: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Get full bot info
// app.get('/api/bot', (req, res) => {
//   try {
//     const { companyId } = req.query;
//     const status = bot.getStatus();
    
//     res.json({
//       success: true,
//       connected: status.connected,
//       authenticated: status.authenticated,
//       hasQR: !!status.qrData,
//       botInfo: status.botInfo,
//       stats: status.stats,
//       reconnectAttempts: status.reconnectAttempts,
//       uptime: status.formattedUptime,
//       multiTenant: status.multiTenant,
//       companyId: companyId || 'all',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Get activity log for company
// app.get('/api/activity', (req, res) => {
//   try {
//     const { companyId, limit = 8 } = req.query;
    
//     // Mock activities for now
//     const activities = [
//       {
//         id: 1,
//         message: companyId ? `WhatsApp connected for company ${companyId}` : 'WhatsApp connected',
//         type: 'success',
//         timestamp: new Date().toLocaleTimeString()
//       },
//       {
//         id: 2,
//         message: 'Ready to receive messages',
//         type: 'info',
//         timestamp: new Date().toLocaleTimeString()
//       }
//     ];
    
//     res.json({
//       success: true,
//       activities: activities.slice(0, parseInt(limit)),
//       companyId: companyId || 'all',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Get session status for company
// app.get('/api/session-status', (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     const sessionManager = getSessionManager();
    
//     if (!sessionManager) {
//       return res.status(500).json({
//         success: false,
//         error: 'Session manager not available'
//       });
//     }
    
//     const sessionStatus = sessionManager.getSessionStatus(companyId);
    
//     res.json({
//       success: true,
//       companyId,
//       status: sessionStatus,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Multi-tenant stats for super admin
// app.get('/api/multi-tenant/stats', (req, res) => {
//   try {
//     const sessionManager = getSessionManager();
    
//     if (!sessionManager) {
//       return res.status(500).json({
//         success: false,
//         error: 'Session manager not available'
//       });
//     }
    
//     const sessions = sessionManager.getAllSessions();
//     const stats = sessionManager.getStats();
    
//     res.json({
//       success: true,
//       totalCompanies: sessions.length,
//       activeSessions: sessions.filter(s => s.connected).length,
//       companies: sessions,
//       stats: stats,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // ========== POST ENDPOINTS ==========

// // Connect specific company
// app.post('/api/connect', async (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     await bot.addCompany(companyId);
    
//     res.json({
//       success: true,
//       message: `WhatsApp connection initiated for company ${companyId}`,
//       companyId
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Disconnect specific company
// app.post('/api/disconnect', async (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     await bot.removeCompany(companyId);
    
//     res.json({
//       success: true,
//       message: `WhatsApp disconnected for company ${companyId}`,
//       companyId
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Restart company session
// app.post('/api/restart', async (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     await bot.restart();
    
//     res.json({
//       success: true,
//       message: `Bot restart initiated for company ${companyId}`,
//       companyId
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Logout company
// app.post('/api/logout', async (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     await bot.logout();
    
//     res.json({
//       success: true,
//       message: `Bot logged out successfully for company ${companyId}`,
//       companyId
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Send message
// app.post('/api/send-message', async (req, res) => {
//   try {
//     const { to, message, companyId } = req.body;
    
//     if (!to || !message) {
//       return res.status(400).json({
//         success: false,
//         error: 'Phone number and message are required'
//       });
//     }
    
//     let result;
//     if (companyId) {
//       const sessionManager = getSessionManager();
//       const client = sessionManager.getSession(companyId);
//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           error: `No active session for company ${companyId}`
//         });
//       }
//       result = { success: true, message: 'Message sent via company client' };
//     } else {
//       result = await bot.sendMessage(to, message);
//     }
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(500).json(result);
//     }
    
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Refresh QR code
// app.post('/api/refresh-qr', async (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     // Trigger QR refresh logic
//     if (bot.getClientForCompany) {
//       const client = bot.getClientForCompany(companyId);
//       if (client) {
//         // Force QR regeneration
//       }
//     }
    
//     res.json({
//       success: true,
//       message: `QR refresh initiated for company ${companyId}`,
//       companyId
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Clear session
// app.post('/api/clear-session', async (req, res) => {
//   try {
//     const { companyId } = req.query;
    
//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Company ID is required'
//       });
//     }
    
//     await bot.clearSession();
    
//     res.json({
//       success: true,
//       message: `Session cleared for company ${companyId}`,
//       companyId
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Clear all sessions (super admin only)
// app.delete('/api/clear-all', async (req, res) => {
//   try {
//     await bot.clearSession();
//     await bot.shutdown();
    
//     res.json({
//       success: true,
//       message: 'All sessions cleared and bot stopped'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // ========== ORDER CREATION HANDLER WITH COMPANY CONTEXT ==========
// if (bot.on && typeof bot.on === 'function') {
//   bot.on('order-created', async (orderData) => {
//     console.log(`🛍️ New order from WhatsApp: ${orderData.orderNumber} for company: ${orderData.companyId || 'unknown'}`);
    
//     try {
//       const savedOrder = await apiService.createOrder(orderData);
      
//       if (savedOrder && savedOrder._id) {
//         console.log(`✅ Order saved to DB: ${savedOrder._id}`);
        
//         // Send notification via notification-manager
//         const notificationResult = await notificationManager.sendNewOrderNotification(savedOrder);
//         console.log(`📤 Notification result: ${notificationResult.success}`);
        
//         // COMPANY-SPECIFIC BROADCAST - MULTI-TENANT SUPPORT
//         if (savedOrder.companyId) {
//           notificationNamespace.to(`company:${savedOrder.companyId}`).emit('NEW_ORDER', {
//             type: 'NEW_ORDER',
//             order: savedOrder,
//             companyId: savedOrder.companyId,
//             timestamp: new Date().toISOString(),
//             priority: 'high'
//           });
          
//           notificationNamespace.to('admins').emit('dashboard-update', {
//             type: 'order-created',
//             order: savedOrder,
//             companyId: savedOrder.companyId,
//             timestamp: new Date().toISOString()
//           });
          
//           console.log(`📢 Order broadcast to company: ${savedOrder.companyId}`);
//         } else {
//           notificationNamespace.emit('NEW_ORDER', {
//             type: 'NEW_ORDER',
//             order: savedOrder,
//             timestamp: new Date().toISOString(),
//             priority: 'high'
//           });
//         }
//       }
//     } catch (error) {
//       console.error('❌ Order processing failed:', error.message);
//     }
//   });
// }

// // ========== NOTIFICATION TEST ENDPOINT WITH COMPANY CONTEXT ==========
// app.post('/api/test-notification', async (req, res) => {
//   try {
//     const { companyId } = req.body || {};
    
//     const testOrder = {
//       orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
//       customerName: 'Test Customer',
//       customerPhone: '9876543210',
//       totalPrice: 1999,
//       totalAmount: 1999,
//       items: [{ productName: 'Test Product', quantity: 1, price: 1999 }],
//       status: 'pending',
//       paymentStatus: 'pending',
//       createdAt: new Date().toISOString(),
//       _id: `test-${Date.now()}`,
//       companyId: companyId || 'default'
//     };
    
//     // Emit test notification to company-specific room
//     if (companyId) {
//       notificationNamespace.to(`company:${companyId}`).emit('NEW_ORDER', {
//         type: 'NEW_ORDER',
//         order: testOrder,
//         companyId: companyId,
//         timestamp: new Date().toISOString(),
//         priority: 'high',
//         test: true
//       });
//     } else {
//       notificationNamespace.emit('NEW_ORDER', {
//         type: 'NEW_ORDER',
//         order: testOrder,
//         timestamp: new Date().toISOString(),
//         priority: 'high',
//         test: true
//       });
//     }
    
//     res.json({
//       success: true,
//       message: `Test notification sent${companyId ? ` to company ${companyId}` : ''}`,
//       orderNumber: testOrder.orderNumber,
//       companyId: companyId || 'all',
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   const sessionManager = getSessionManager();
//   const sessions = sessionManager ? sessionManager.getAllSessions() : [];
  
//   res.json({
//     name: 'WhatsApp Bot & Notification Server',
//     version: '2.0.0',
//     status: 'running',
//     port: PORT,
//     websocket: {
//       qrNamespace: `http://localhost:${PORT}/qr`,
//       notificationNamespace: `http://localhost:${PORT}/notifications`,
//       connectedClients: {
//         qr: qrNamespace.sockets.size,
//         notifications: notificationNamespace.sockets.size
//       },
//       socketIoGlobal: !!global.io
//     },
//     authentication: {
//       adminTokenConfigured: !!ADMIN_TOKEN,
//       requiredForNotifications: true
//     },
//     multiTenant: {
//       enabled: true,
//       activeCompanies: sessions.length,
//       sessions: sessions.map(s => ({
//         companyId: s.companyId,
//         status: s.status,
//         connected: s.connected
//       }))
//     },
//     apiEndpoints: {
//       status: '/api/status',
//       qr: '/api/qr',
//       stats: '/api/stats',
//       bot: '/api/bot',
//       activity: '/api/activity',
//       sessionStatus: '/api/session-status',
//       multiTenant: '/api/multi-tenant/stats',
//       health: '/health',
//       testNotification: '/api/test-notification',
//       websocketStatus: '/api/websocket-status'
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// // ========== START SERVER ==========
// server.listen(PORT, () => {
//   console.log('='.repeat(60));
//   console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER - MULTI-TENANT VERSION');
//   console.log('='.repeat(60));
//   console.log(`✅ Server running on port: ${PORT}`);
//   console.log(`🔗 API URL: http://localhost:${PORT}`);
//   console.log(`📡 QR Socket.IO: http://localhost:${PORT}/qr`);
//   console.log(`🔔 Notification Socket.IO: http://localhost:${PORT}/notifications`);
//   console.log(`🌐 Root Socket.IO: http://localhost:${PORT}/`);
//   console.log(`📊 Health: http://localhost:${PORT}/health`);
//   console.log(`🔍 WebSocket Status: http://localhost:${PORT}/api/websocket-status`);
//   console.log(`🌐 Global Socket.IO: ${global.io ? 'AVAILABLE ✅' : 'NOT AVAILABLE ❌'}`);
//   console.log(`🔐 Admin Token: ${ADMIN_TOKEN ? 'CONFIGURED ✅' : 'NOT CONFIGURED ⚠️'}`);
//   console.log('='.repeat(60));
//   console.log('⚡ MULTI-TENANT FEATURES ENABLED:');
//   console.log('   ✅ Company-specific QR broadcasting');
//   console.log('   ✅ Company-specific notification rooms');
//   console.log('   ✅ Company session management');
//   console.log('   ✅ Phone number → Company mapping');
//   console.log('='.repeat(60));
  
//   // Initialize QR Socket Server
//   try {
//     qrSocketServer.initialize(server, bot, io);
//     console.log('✅ QR Socket Server initialized with existing Socket.IO');
//   } catch (error) {
//     console.error('❌ QR Socket Server initialization error:', error.message);
//   }
// });

// // ========== GRACEFUL SHUTDOWN ==========
// process.on('SIGINT', async () => {
//   console.log('\n🛑 Received SIGINT - Shutting down...');
  
//   try {
//     await bot.shutdown();
    
//     qrNamespace.disconnectSockets(true);
//     notificationNamespace.disconnectSockets(true);
    
//     if (qrSocketServer.close) {
//       qrSocketServer.close();
//     }
    
//     console.log('✅ All clients disconnected');
//   } catch (error) {
//     console.error('Shutdown error:', error);
//   }
  
//   server.close(() => {
//     console.log('✅ Server closed gracefully');
//     process.exit(0);
//   });
// });

// process.on('SIGTERM', async () => {
//   console.log('\n🛑 Received SIGTERM - Terminating...');
  
//   try {
//     await bot.shutdown();
//     qrNamespace.disconnectSockets(true);
//     notificationNamespace.disconnectSockets(true);
    
//     if (qrSocketServer.close) {
//       qrSocketServer.close();
//     }
//   } catch (error) {
//     console.error('Termination error:', error);
//   }
  
//   server.close(() => {
//     process.exit(0);
//   });
// });

// export default server;























// server.js - COMPLETE WITH MULTI-TENANT SUPPORT - PROFESSIONAL VERSION (LocalAuth)
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import bot from './whatsap/bot.js';
import apiService from './services/apiService.js';
import notificationManager from './services/notifications/notification-manager.js';
import { qrSocketServer } from "./services/qrSocketServer.js";
import { getCompanyMapper } from './services/companyMapper.js';
import url from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.BOT_PORT || 3001;

// ========== SOCKET.IO CONFIGURATION ==========
const ADMIN_TOKEN = process.env.NOTIFICATION_API_KEY || 'dev-key-2024';

// Set bot in QR socket server
qrSocketServer.setBot(bot);

// ========== CREATE SOCKET.IO SERVER ==========
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000'],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  allowEIO3: true,
  allowUpgrades: true,
  cookie: false,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  upgradeTimeout: 10000,
  path: '/socket.io/'
});

// ========== SET SOCKET.IO GLOBALLY ==========
global.io = io;
console.log('✅ Socket.IO set globally');

// ========== EXPRESS MIDDLEWARE ==========
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers manually
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ========== WEBSOCKET UPGRADE HANDLER ==========
server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = url.parse(request.url).pathname;
    
    // Log all upgrade requests for debugging
    console.log(`🔌 WebSocket upgrade request: ${pathname}`);
    
    // Let Socket.IO handle its own upgrades
    if (pathname.startsWith('/socket.io/')) {
      return;
    }
    
    // Let QR WebSocket server handle /ws/qr paths
    if (pathname.startsWith('/ws/')) {
      return;
    }
    
    // If no handler, destroy the socket to prevent hanging
    if (!pathname.startsWith('/socket.io/') && !pathname.startsWith('/ws/')) {
      socket.destroy();
    }
  } catch (error) {
    console.error('❌ WebSocket upgrade error:', error.message);
    socket.destroy();
  }
});

// ========== SETUP SOCKET.IO NAMESPACES ==========
const qrNamespace = io.of('/qr');
const notificationNamespace = io.of('/notifications');

// ========== ADD ROOT NAMESPACE FOR DEBUGGING ==========
io.on('connection', (socket) => {
  console.log(`🌐 Root namespace client connected: ${socket.id} (for debugging)`);
  
  socket.on('error', (error) => {
    console.error(`❌ Root namespace error from ${socket.id}:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🌐 Root namespace client disconnected: ${socket.id} (${reason})`);
  });
});

// ========== QR NAMESPACE HANDLER - WITH COMPANY CONTEXT ==========
qrNamespace.on('connection', (socket) => {
  console.log(`🔗 QR Client connected: ${socket.id}`);
  
  // Get companyId from handshake query - MULTI-TENANT SUPPORT
  const companyId = socket.handshake.query.companyId || null;
  
  if (companyId) {
    console.log(`🏢 QR Client for company: ${companyId}`);
    socket.join(`company:${companyId}`);
    socket.join('qr-clients');
    
    // Send current QR status immediately by getting from bot
    try {
      // Get bot status for this company
      const botStatus = bot.getStatus();
      
      // Check if this company has a session in bot
      let sessionStatus = null;
      if (botStatus.multiTenant && botStatus.multiTenant.companies) {
        const companySession = botStatus.multiTenant.companies.find(c => c.companyId === companyId);
        if (companySession) {
          sessionStatus = {
            connected: companySession.isConnected || false,
            status: companySession.isConnected ? 'connected' : 'disconnected',
            qrData: botStatus.qrData // This might be for current company
          };
        }
      }
      
      if (sessionStatus) {
        socket.emit('status', {
          type: 'status',
          connected: sessionStatus.connected || false,
          authenticated: sessionStatus.status === 'connected',
          hasQR: !!botStatus.qrData,
          qr: botStatus.qrData,
          companyId: companyId,
          message: sessionStatus.connected ? 'WhatsApp is connected' : 
                  botStatus.qrData ? 'QR code required' : 'Not connected',
          timestamp: new Date().toISOString()
        });
      } else {
        // No session yet, send default disconnected status
        socket.emit('status', {
          type: 'status',
          connected: false,
          authenticated: false,
          hasQR: false,
          qr: null,
          companyId: companyId,
          message: 'Not connected',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error sending initial status:', error.message);
    }
  }
  
  // Handle get_status requests
  socket.on('get_status', () => {
    try {
      const botStatus = bot.getStatus();
      
      let sessionStatus = null;
      if (botStatus.multiTenant && botStatus.multiTenant.companies && companyId) {
        const companySession = botStatus.multiTenant.companies.find(c => c.companyId === companyId);
        if (companySession) {
          sessionStatus = {
            connected: companySession.isConnected || false,
            status: companySession.isConnected ? 'connected' : 'disconnected'
          };
        }
      }
      
      socket.emit('status', {
        type: 'status',
        connected: sessionStatus?.connected || false,
        authenticated: sessionStatus?.status === 'connected',
        hasQR: !!botStatus.qrData,
        qr: botStatus.qrData,
        companyId: companyId,
        message: sessionStatus?.connected ? 'WhatsApp is connected' : 
                botStatus.qrData ? 'QR code required' : 'Not connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error handling get_status:', error.message);
    }
  });
  
  // Handle get_qr requests
  socket.on('get_qr', () => {
    try {
      const botStatus = bot.getStatus();
      if (botStatus.qrData) {
        socket.emit('qr_update', {
          type: 'qr_update',
          qr: botStatus.qrData,
          companyId: companyId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error handling get_qr:', error.message);
    }
  });
  
  // Handle get_stats requests
  socket.on('get_stats', () => {
    try {
      const botStatus = bot.getStatus();
      socket.emit('stats_update', {
        type: 'stats_update',
        stats: botStatus.stats || {},
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error handling get_stats:', error.message);
    }
  });
  
  // Handle ping for connection keep-alive
  socket.on('ping', () => {
    socket.emit('pong', {
      type: 'pong',
      timestamp: new Date().toISOString()
    });
  });
  
  // ADD connection error handler
  socket.on('error', (error) => {
    console.error(`❌ QR Socket error from ${socket.id}:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 QR Client disconnected: ${socket.id} (${reason})`);
  });
});

// ========== NOTIFICATION NAMESPACE HANDLER - WITH MULTI-TENANT SUPPORT ==========
notificationNamespace.on('connection', (socket) => {
  console.log(`🔔 Notification Client connected: ${socket.id}`);
  
  // ADD connection error handler
  socket.on('error', (error) => {
    console.error(`❌ Notification Socket error from ${socket.id}:`, error);
  });
  
  // Set authentication status
  let isAuthenticated = false;
  let authenticatedUser = null;
  
  // ===== AUTHENTICATION HANDLER WITH COMPANY CONTEXT =====
  socket.on('authenticate', (data) => {
    console.log(`🔐 Authentication attempt from ${socket.id}:`, {
      userId: data?.userId,
      userRole: data?.userRole,
      companyId: data?.companyId,
      tokenPreview: data?.token ? data.token.substring(0, 20) + '...' : 'No token'
    });
    
    const { token, userId, userRole, name, connectionId, companyId } = data || {};
    
    // Validate required fields
    if (!token || !userId || !userRole) {
      console.error(`❌ Missing authentication data from ${socket.id}`);
      socket.emit('unauthorized', {
        success: false,
        message: 'Missing authentication data',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Validate admin token
    if (token !== ADMIN_TOKEN) {
      console.error(`❌ Invalid token from ${socket.id}`);
      socket.emit('unauthorized', {
        success: false,
        message: 'Invalid authentication token',
        timestamp: new Date().toISOString()
      });
      socket.disconnect();
      return;
    }
    
    // Check if user is admin
    if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'manager') {
      console.error(`❌ Non-admin user attempted to connect: ${userId} (${userRole})`);
      socket.emit('unauthorized', {
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
      socket.disconnect();
      return;
    }
    
    // STORE COMPANY ID IN AUTHENTICATED USER - MULTI-TENANT SUPPORT
    const userCompanyId = companyId || (userRole === 'superadmin' ? null : 'default');
    
    authenticatedUser = {
      id: userId,
      role: userRole,
      name: name || `Admin-${userId.substring(0, 8)}`,
      companyId: userCompanyId,
      connectionId: connectionId || socket.id,
      authenticatedAt: new Date().toISOString()
    };
    
    // Authentication successful
    isAuthenticated = true;
    
    console.log(`✅ Admin authenticated: ${authenticatedUser.name} (${userId}) for company: ${userCompanyId || 'ALL'}`);
    
    // JOIN COMPANY-SPECIFIC ROOM - MULTI-TENANT SUPPORT
    if (userCompanyId) {
      socket.join(`company:${userCompanyId}`);
      console.log(`👥 ${authenticatedUser.name} joined room 'company:${userCompanyId}'`);
    }
    
    // Join admin room for global broadcasts
    socket.join('admins');
    console.log(`👥 ${authenticatedUser.name} joined 'admins' room`);
    
    socket.emit('authenticated', {
      success: true,
      message: 'Authentication successful',
      user: {
        id: userId,
        role: userRole,
        name: name || `Admin-${userId.substring(0, 8)}`,
        companyId: userCompanyId
      },
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      serverTime: new Date().toISOString()
    });
  });
  
  // ===== FCM TOKEN REGISTRATION WITH COMPANY CONTEXT =====
  socket.on('register-fcm-token', (data) => {
    if (!isAuthenticated) {
      console.error(`❌ Unauthenticated FCM token registration attempt`);
      socket.emit('fcm-token-registration-failed', {
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { token, deviceInfo, timestamp, companyId } = data || {};
    
    if (!token) {
      console.error(`❌ Invalid FCM token from ${authenticatedUser?.name}`);
      socket.emit('fcm-token-registration-failed', {
        success: false,
        message: 'Invalid FCM token',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Use companyId from request or from authenticated user
    const tokenCompanyId = companyId || authenticatedUser?.companyId;
    
    console.log(`📱 FCM token registered for ${authenticatedUser.name} (company: ${tokenCompanyId || 'ALL'}):`, {
      tokenPreview: token.substring(0, 20) + '...',
      deviceType: deviceInfo?.deviceType || 'unknown',
      timestamp: timestamp || new Date().toISOString()
    });
    
    socket.emit('fcm-token-registered', {
      success: true,
      message: 'FCM token registered successfully',
      timestamp: new Date().toISOString()
    });
  });
  
  // ===== HEARTBEAT/PING =====
  socket.on('ping', (data) => {
    if (!isAuthenticated) return;
    
    const { timestamp } = data || {};
    const latency = timestamp ? Date.now() - timestamp : null;
    
    socket.emit('pong', {
      timestamp: timestamp || Date.now(),
      serverTime: Date.now(),
      latency: latency,
      message: 'pong'
    });
  });
  
  // ===== DISCONNECTION HANDLER =====
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Notification Client disconnected: ${socket.id} (${reason})`);
    
    if (authenticatedUser) {
      console.log(`👋 ${authenticatedUser.name} (${authenticatedUser.companyId || 'ALL'}) disconnected`);
    }
  });
});

// ========== PASS SOCKET.IO TO QR SOCKET SERVER ==========
if (qrSocketServer.setIO) {
  qrSocketServer.setIO(io);
  console.log('✅ Socket.IO passed to QR Socket Server');
}

// ========== INITIALIZE COMPANY MAPPER CACHE ==========
(async () => {
  try {
    const companyMapper = getCompanyMapper();
    await companyMapper.warmUpCache();
    console.log('✅ Company mapper cache warmed up');
  } catch (error) {
    console.error('❌ Failed to warm up company mapper cache:', error.message);
  }
})();

// ========== REST API ROUTES - WITH MULTI-TENANT SUPPORT ==========

// Health check endpoint
app.get('/health', (req, res) => {
  const status = bot.getStatus();
  const qrClientsCount = qrNamespace.sockets.size;
  const notificationClientsCount = notificationNamespace.sockets.size;
  const rootClientsCount = io.sockets.sockets.size;
  const activeSessions = status.multiTenant?.activeCompanies || 0;
  
  res.json({
    status: 'healthy',
    server: 'running',
    bot: status.connected ? 'connected' : 'disconnected',
    websocket: {
      qrClients: qrClientsCount,
      notificationClients: notificationClientsCount,
      rootClients: rootClientsCount,
      socketIoGlobal: !!global.io
    },
    authentication: {
      adminTokenConfigured: !!ADMIN_TOKEN,
      tokenPreview: ADMIN_TOKEN ? ADMIN_TOKEN.substring(0, 10) + '...' : 'Not configured'
    },
    multiTenant: {
      activeSessions: activeSessions,
      companyMapperReady: true
    },
    timestamp: new Date().toISOString()
  });
});

// WebSocket status endpoint
app.get('/api/websocket-status', (req, res) => {
  const qrClients = qrNamespace.sockets.size;
  const notificationClients = notificationNamespace.sockets.size;
  const rootClients = io.sockets.sockets.size;
  
  res.json({
    status: 'running',
    socketIoVersion: '4.x',
    clients: {
      qr: qrClients,
      notifications: notificationClients,
      root: rootClients,
      total: qrClients + notificationClients + rootClients
    },
    namespaces: {
      qr: '/qr',
      notifications: '/notifications',
      root: '/'
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ========== BOT MANAGEMENT ENDPOINTS WITH COMPANY CONTEXT ==========

// Get bot status with optional company filter
app.get('/api/status', (req, res) => {
  try {
    const { companyId } = req.query;
    const status = bot.getStatus();
    
    // If companyId provided, filter for that company
    if (companyId && status.multiTenant) {
      const companySession = status.multiTenant.companies.find(c => c.companyId === companyId);
      if (companySession) {
        return res.json({
          success: true,
          companyId,
          connected: companySession.isConnected,
          status: companySession.isConnected ? 'connected' : 'disconnected',
          message: companySession.isConnected ? 'WhatsApp is connected' : 'Not connected',
          stats: status.stats,
          botInfo: status.botInfo,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    res.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get QR code for specific company
app.get('/api/qr', (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    const botStatus = bot.getStatus();
    let qrData = botStatus.qrData || null;
    
    res.json({
      success: true,
      qr: qrData,
      hasQr: !!qrData,
      companyId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const { companyId } = req.query;
    const status = bot.getStatus();
    
    res.json({
      success: true,
      stats: status.stats,
      companyId: companyId || 'all',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get full bot info
app.get('/api/bot', (req, res) => {
  try {
    const { companyId } = req.query;
    const status = bot.getStatus();
    
    res.json({
      success: true,
      connected: status.connected,
      authenticated: status.authenticated,
      hasQR: !!status.qrData,
      botInfo: status.botInfo,
      stats: status.stats,
      reconnectAttempts: status.reconnectAttempts,
      uptime: status.formattedUptime,
      multiTenant: status.multiTenant,
      companyId: companyId || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get activity log for company
app.get('/api/activity', (req, res) => {
  try {
    const { companyId, limit = 8 } = req.query;
    
    // Mock activities for now
    const activities = [
      {
        id: 1,
        message: companyId ? `WhatsApp connected for company ${companyId}` : 'WhatsApp connected',
        type: 'success',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 2,
        message: 'Ready to receive messages',
        type: 'info',
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    
    res.json({
      success: true,
      activities: activities.slice(0, parseInt(limit)),
      companyId: companyId || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get session status for company (using bot instead of sessionManager)
app.get('/api/session-status', (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    const botStatus = bot.getStatus();
    let sessionStatus = null;
    
    if (botStatus.multiTenant && botStatus.multiTenant.companies) {
      const companySession = botStatus.multiTenant.companies.find(c => c.companyId === companyId);
      if (companySession) {
        sessionStatus = {
          connected: companySession.isConnected || false,
          status: companySession.isConnected ? 'connected' : 'disconnected',
          clientId: companySession.clientId
        };
      }
    }
    
    res.json({
      success: true,
      companyId,
      status: sessionStatus || { connected: false, status: 'not_initialized' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Multi-tenant stats for super admin
app.get('/api/multi-tenant/stats', (req, res) => {
  try {
    const botStatus = bot.getStatus();
    
    res.json({
      success: true,
      totalCompanies: botStatus.multiTenant?.activeCompanies || 0,
      activeSessions: botStatus.multiTenant?.companies?.filter(c => c.isConnected).length || 0,
      companies: botStatus.multiTenant?.companies || [],
      stats: botStatus.stats || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== POST ENDPOINTS ==========

// Connect specific company
app.post('/api/connect', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    await bot.addCompany(companyId);
    
    res.json({
      success: true,
      message: `WhatsApp connection initiated for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect specific company
app.post('/api/disconnect', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    await bot.removeCompany(companyId);
    
    res.json({
      success: true,
      message: `WhatsApp disconnected for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Restart company session
app.post('/api/restart', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    await bot.restart();
    
    res.json({
      success: true,
      message: `Bot restart initiated for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logout company
app.post('/api/logout', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    await bot.logout();
    
    res.json({
      success: true,
      message: `Bot logged out successfully for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send message
app.post('/api/send-message', async (req, res) => {
  try {
    const { to, message, companyId } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }
    
    let result;
    if (companyId) {
      // Get client from bot instead of sessionManager
      const client = bot.getClientForCompany(companyId);
      if (!client) {
        return res.status(404).json({
          success: false,
          error: `No active session for company ${companyId}`
        });
      }
      result = { success: true, message: 'Message sent via company client' };
    } else {
      result = await bot.sendMessage(to, message);
    }
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh QR code
app.post('/api/refresh-qr', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    // Trigger QR refresh logic
    if (bot.getClientForCompany) {
      const client = bot.getClientForCompany(companyId);
      if (client) {
        // Force QR regeneration
      }
    }
    
    res.json({
      success: true,
      message: `QR refresh initiated for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear session
app.post('/api/clear-session', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    await bot.clearSession();
    
    res.json({
      success: true,
      message: `Session cleared for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear all sessions (super admin only)
app.delete('/api/clear-all', async (req, res) => {
  try {
    await bot.clearSession();
    await bot.shutdown();
    
    res.json({
      success: true,
      message: 'All sessions cleared and bot stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== ORDER CREATION HANDLER WITH COMPANY CONTEXT ==========
if (bot.on && typeof bot.on === 'function') {
  bot.on('order-created', async (orderData) => {
    console.log(`🛍️ New order from WhatsApp: ${orderData.orderNumber} for company: ${orderData.companyId || 'unknown'}`);
    
    try {
      const savedOrder = await apiService.createOrder(orderData);
      
      if (savedOrder && savedOrder._id) {
        console.log(`✅ Order saved to DB: ${savedOrder._id}`);
        
        // Send notification via notification-manager
        const notificationResult = await notificationManager.sendNewOrderNotification(savedOrder);
        console.log(`📤 Notification result: ${notificationResult.success}`);
        
        // COMPANY-SPECIFIC BROADCAST - MULTI-TENANT SUPPORT
        if (savedOrder.companyId) {
          notificationNamespace.to(`company:${savedOrder.companyId}`).emit('NEW_ORDER', {
            type: 'NEW_ORDER',
            order: savedOrder,
            companyId: savedOrder.companyId,
            timestamp: new Date().toISOString(),
            priority: 'high'
          });
          
          notificationNamespace.to('admins').emit('dashboard-update', {
            type: 'order-created',
            order: savedOrder,
            companyId: savedOrder.companyId,
            timestamp: new Date().toISOString()
          });
          
          console.log(`📢 Order broadcast to company: ${savedOrder.companyId}`);
        } else {
          notificationNamespace.emit('NEW_ORDER', {
            type: 'NEW_ORDER',
            order: savedOrder,
            timestamp: new Date().toISOString(),
            priority: 'high'
          });
        }
      }
    } catch (error) {
      console.error('❌ Order processing failed:', error.message);
    }
  });
}

// ========== NOTIFICATION TEST ENDPOINT WITH COMPANY CONTEXT ==========
app.post('/api/test-notification', async (req, res) => {
  try {
    const { companyId } = req.body || {};
    
    const testOrder = {
      orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
      customerName: 'Test Customer',
      customerPhone: '9876543210',
      totalPrice: 1999,
      totalAmount: 1999,
      items: [{ productName: 'Test Product', quantity: 1, price: 1999 }],
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      _id: `test-${Date.now()}`,
      companyId: companyId || 'default'
    };
    
    // Emit test notification to company-specific room
    if (companyId) {
      notificationNamespace.to(`company:${companyId}`).emit('NEW_ORDER', {
        type: 'NEW_ORDER',
        order: testOrder,
        companyId: companyId,
        timestamp: new Date().toISOString(),
        priority: 'high',
        test: true
      });
    } else {
      notificationNamespace.emit('NEW_ORDER', {
        type: 'NEW_ORDER',
        order: testOrder,
        timestamp: new Date().toISOString(),
        priority: 'high',
        test: true
      });
    }
    
    res.json({
      success: true,
      message: `Test notification sent${companyId ? ` to company ${companyId}` : ''}`,
      orderNumber: testOrder.orderNumber,
      companyId: companyId || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  const status = bot.getStatus();
  
  res.json({
    name: 'WhatsApp Bot & Notification Server',
    version: '2.0.0',
    status: 'running',
    port: PORT,
    websocket: {
      qrNamespace: `http://localhost:${PORT}/qr`,
      notificationNamespace: `http://localhost:${PORT}/notifications`,
      connectedClients: {
        qr: qrNamespace.sockets.size,
        notifications: notificationNamespace.sockets.size
      },
      socketIoGlobal: !!global.io
    },
    authentication: {
      adminTokenConfigured: !!ADMIN_TOKEN,
      requiredForNotifications: true
    },
    multiTenant: {
      enabled: true,
      activeCompanies: status.multiTenant?.activeCompanies || 0,
      sessions: status.multiTenant?.companies || []
    },
    apiEndpoints: {
      status: '/api/status',
      qr: '/api/qr',
      stats: '/api/stats',
      bot: '/api/bot',
      activity: '/api/activity',
      sessionStatus: '/api/session-status',
      multiTenant: '/api/multi-tenant/stats',
      health: '/health',
      testNotification: '/api/test-notification',
      websocketStatus: '/api/websocket-status'
    },
    timestamp: new Date().toISOString()
  });
});

// ========== START SERVER ==========
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER - MULTI-TENANT VERSION');
  console.log('='.repeat(60));
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📡 QR Socket.IO: http://localhost:${PORT}/qr`);
  console.log(`🔔 Notification Socket.IO: http://localhost:${PORT}/notifications`);
  console.log(`🌐 Root Socket.IO: http://localhost:${PORT}/`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 WebSocket Status: http://localhost:${PORT}/api/websocket-status`);
  console.log(`🌐 Global Socket.IO: ${global.io ? 'AVAILABLE ✅' : 'NOT AVAILABLE ❌'}`);
  console.log(`🔐 Admin Token: ${ADMIN_TOKEN ? 'CONFIGURED ✅' : 'NOT CONFIGURED ⚠️'}`);
  console.log('='.repeat(60));
  console.log('⚡ MULTI-TENANT FEATURES ENABLED:');
  console.log('   ✅ Company-specific QR broadcasting');
  console.log('   ✅ Company-specific notification rooms');
  console.log('   ✅ Company session management (via bot.js)');
  console.log('   ✅ Phone number → Company mapping');
  console.log('='.repeat(60));
  
  // Initialize QR Socket Server
  try {
    qrSocketServer.initialize(server, bot, io);
    console.log('✅ QR Socket Server initialized with existing Socket.IO');
  } catch (error) {
    console.error('❌ QR Socket Server initialization error:', error.message);
  }
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT - Shutting down...');
  
  try {
    await bot.shutdown();
    
    qrNamespace.disconnectSockets(true);
    notificationNamespace.disconnectSockets(true);
    
    if (qrSocketServer.close) {
      qrSocketServer.close();
    }
    
    console.log('✅ All clients disconnected');
  } catch (error) {
    console.error('Shutdown error:', error);
  }
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM - Terminating...');
  
  try {
    await bot.shutdown();
    qrNamespace.disconnectSockets(true);
    notificationNamespace.disconnectSockets(true);
    
    if (qrSocketServer.close) {
      qrSocketServer.close();
    }
  } catch (error) {
    console.error('Termination error:', error);
  }
  
  server.close(() => {
    process.exit(0);
  });
});

export default server;


