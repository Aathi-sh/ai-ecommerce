// // // // import express from 'express';
// // // // import cors from 'cors';
// // // // import http from 'http';
// // // // import dotenv from 'dotenv';
// // // // import bot from './whatsap/bot.js';
// // // // import { qrSocketServer } from './services/qrSocketServer.js';

// // // // dotenv.config();

// // // // const app = express();
// // // // const server = http.createServer(app);
// // // // const PORT = process.env.BOT_PORT || 3001;

// // // // // Simple and effective CORS setup
// // // // const corsOptions = {
// // // //     origin: ['http://localhost:3000', 'http://localhost:3001'],
// // // //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // //     allowedHeaders: ['Content-Type', 'Authorization'],
// // // //     credentials: true,
// // // //     optionsSuccessStatus: 200
// // // // };

// // // // // Apply CORS to all routes
// // // // app.use(cors(corsOptions));
// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // Handle OPTIONS/preflight requests manually
// // // // app.use((req, res, next) => {
// // // //     if (req.method === 'OPTIONS') {
// // // //         res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
// // // //         res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// // // //         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// // // //         res.header('Access-Control-Allow-Credentials', 'true');
// // // //         return res.status(200).end();
// // // //     }
// // // //     next();
// // // // });

// // // // // API Routes
// // // // app.get('/api/status', (req, res) => {
// // // //     try {
// // // //         const status = bot.getStatus();
// // // //         res.json({
// // // //             success: true,
// // // //             qr: bot.getCurrentQR(),
// // // //             status: status.connected ? 'connected' : 
// // // //                    bot.getCurrentQR() ? 'qr_required' : 'disconnected',
// // // //             message: status.connected ? 'WhatsApp is connected' : 
// // // //                     bot.getCurrentQR() ? 'QR code required' : 'Not connected',
// // // //             stats: status.stats,
// // // //             botInfo: status.botInfo,
// // // //             reconnectAttempts: status.reconnectAttempts
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Status Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Internal server error'
// // // //         });
// // // //     }
// // // // });

// // // // app.get('/api/qr', (req, res) => {
// // // //     try {
// // // //         const qr = bot.getCurrentQR();
// // // //         res.json({
// // // //             success: true,
// // // //             qr: qr,
// // // //             hasQr: !!qr,
// // // //             timestamp: new Date().toISOString()
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API QR Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Internal server error'
// // // //         });
// // // //     }
// // // // });

// // // // app.get('/api/stats', (req, res) => {
// // // //     try {
// // // //         const status = bot.getStatus();
// // // //         res.json({
// // // //             success: true,
// // // //             stats: status.stats,
// // // //             lastUpdated: new Date().toISOString()
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Stats Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Internal server error'
// // // //         });
// // // //     }
// // // // });

// // // // app.get('/api/bot', (req, res) => {
// // // //     try {
// // // //         const status = bot.getStatus();
// // // //         res.json({
// // // //             success: true,
// // // //             connected: status.connected,
// // // //             authenticated: status.authenticated,
// // // //             hasQR: !!bot.getCurrentQR(),
// // // //             botInfo: status.botInfo,
// // // //             stats: status.stats,
// // // //             reconnectAttempts: status.reconnectAttempts,
// // // //             uptime: status.formattedUptime
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Bot Info Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Internal server error'
// // // //         });
// // // //     }
// // // // });

// // // // app.post('/api/connect', async (req, res) => {
// // // //     try {
// // // //         await bot.initialize();
// // // //         res.json({
// // // //             success: true,
// // // //             message: 'Bot connection initiated'
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Connect Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Failed to connect bot'
// // // //         });
// // // //     }
// // // // });

// // // // app.post('/api/disconnect', async (req, res) => {
// // // //     try {
// // // //         await bot.safeDestroyClient();
// // // //         res.json({
// // // //             success: true,
// // // //             message: 'Bot disconnected successfully'
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Disconnect Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Failed to disconnect bot'
// // // //         });
// // // //     }
// // // // });

// // // // app.post('/api/restart', async (req, res) => {
// // // //     try {
// // // //         await bot.restart();
// // // //         res.json({
// // // //             success: true,
// // // //             message: 'Bot restart initiated'
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Restart Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Failed to restart bot'
// // // //         });
// // // //     }
// // // // });

// // // // app.post('/api/logout', async (req, res) => {
// // // //     try {
// // // //         await bot.logout();
// // // //         res.json({
// // // //             success: true,
// // // //             message: 'Bot logged out successfully'
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Logout Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Failed to logout bot'
// // // //         });
// // // //     }
// // // // });

// // // // app.post('/api/send-message', async (req, res) => {
// // // //     try {
// // // //         const { to, message } = req.body;
        
// // // //         if (!to || !message) {
// // // //             return res.status(400).json({
// // // //                 success: false,
// // // //                 error: 'Phone number and message are required'
// // // //             });
// // // //         }
        
// // // //         const result = await bot.sendMessage(to, message);
        
// // // //         if (result.success) {
// // // //             res.json(result);
// // // //         } else {
// // // //             res.status(500).json(result);
// // // //         }
        
// // // //     } catch (error) {
// // // //         console.error('❌ API Send Message Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Failed to send message'
// // // //         });
// // // //     }
// // // // });

// // // // app.post('/api/clear-session', async (req, res) => {
// // // //     try {
// // // //         await bot.clearSession();
// // // //         res.json({
// // // //             success: true,
// // // //             message: 'Session cleared successfully'
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Clear Session Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Failed to clear session'
// // // //         });
// // // //     }
// // // // });

// // // // app.delete('/api/clear-all', async (req, res) => {
// // // //     try {
// // // //         await bot.clearSession();
// // // //         await bot.shutdown();
        
// // // //         res.json({
// // // //             success: true,
// // // //             message: 'All sessions cleared and bot stopped'
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ API Clear All Error:', error);
// // // //         res.status(500).json({
// // // //             success: false,
// // // //             error: error.message || 'Failed to clear all sessions'
// // // //         });
// // // //     }
// // // // });

// // // // // Health check
// // // // app.get('/health', (req, res) => {
// // // //     try {
// // // //         const status = bot.getStatus();
// // // //         res.json({
// // // //             status: 'healthy',
// // // //             server: 'running',
// // // //             bot: status.connected ? 'connected' : 'disconnected',
// // // //             uptime: status.formattedUptime,
// // // //             timestamp: new Date().toISOString()
// // // //         });
// // // //     } catch (error) {
// // // //         console.error('❌ Health Check Error:', error);
// // // //         res.status(500).json({
// // // //             status: 'unhealthy',
// // // //             error: error.message || 'Server error'
// // // //         });
// // // //     }
// // // // });

// // // // // Root endpoint
// // // // app.get('/', (req, res) => {
// // // //     res.json({
// // // //         name: 'WhatsApp Bot Server',
// // // //         version: '1.0.0',
// // // //         status: 'running',
// // // //         endpoints: {
// // // //             status: '/api/status',
// // // //             qr: '/api/qr',
// // // //             stats: '/api/stats',
// // // //             bot: '/api/bot',
// // // //             health: '/health'
// // // //         },
// // // //         timestamp: new Date().toISOString()
// // // //     });
// // // // });

// // // // // Start server FIRST, then initialize WebSocket
// // // // server.listen(PORT, () => {
// // // //     console.log('========================================');
// // // //     console.log('🤖 WhatsApp Bot Server');
// // // //     console.log('========================================');
// // // //     console.log(`✅ Server running on port: ${PORT}`);
// // // //     console.log(`🔗 API URL: http://localhost:${PORT}`);
// // // //     console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
// // // //     console.log(`📊 Health: http://localhost:${PORT}/health`);
// // // //     console.log('========================================');
    
// // // //     // Initialize WebSocket server AFTER server is listening
// // // //     qrSocketServer.initialize(server);
// // // // });

// // // // // Graceful shutdown
// // // // process.on('SIGINT', async () => {
// // // //     console.log('\n🛑 Received shutdown signal (SIGINT)');
// // // //     console.log('Shutting down bot server...');
    
// // // //     try {
// // // //         await bot.shutdown();
// // // //     } catch (error) {
// // // //         console.error('Error during bot shutdown:', error);
// // // //     }
    
// // // //     server.close(() => {
// // // //         console.log('✅ Server closed gracefully');
// // // //         process.exit(0);
// // // //     });
// // // // });

// // // // process.on('SIGTERM', async () => {
// // // //     console.log('\n🛑 Received termination signal (SIGTERM)');
// // // //     console.log('Terminating bot server...');
    
// // // //     try {
// // // //         await bot.shutdown();
// // // //     } catch (error) {
// // // //         console.error('Error during bot shutdown:', error);
// // // //     }
    
// // // //     server.close(() => {
// // // //         console.log('✅ Server closed gracefully');
// // // //         process.exit(0);
// // // //     });
// // // // });

// // // // // Error handling
// // // // process.on('uncaughtException', (error) => {
// // // //     console.error('❌ Uncaught Exception:', error);
// // // // });

// // // // process.on('unhandledRejection', (reason, promise) => {
// // // //     console.error('❌ Unhandled Rejection at:', promise);
// // // //     console.error('Reason:', reason);
// // // // });

// // // // export default server;





// // // // server.js - Combined QR Socket and Notification Server
// // // import express from 'express';
// // // import cors from 'cors';
// // // import http from 'http';
// // // import { Server } from 'socket.io';
// // // import dotenv from 'dotenv';
// // // import bot from './whatsap/bot.js';

// // // dotenv.config();

// // // const app = express();
// // // const server = http.createServer(app);
// // // const PORT = process.env.BOT_PORT || 3001;

// // // // Socket.IO configuration
// // // const io = new Server(server, {
// // //   cors: {
// // //     origin: ['http://localhost:3000', 'http://localhost:3001'],
// // //     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// // //     credentials: true,
// // //     optionsSuccessStatus: 200
// // //   },
// // //   transports: ['websocket', 'polling'],
// // //   pingTimeout: 60000,
// // //   pingInterval: 25000
// // // });

// // // // Simple and effective CORS setup
// // // const corsOptions = {
// // //     origin: ['http://localhost:3000', 'http://localhost:3001'],
// // //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // //     allowedHeaders: ['Content-Type', 'Authorization'],
// // //     credentials: true,
// // //     optionsSuccessStatus: 200
// // // };

// // // // Apply CORS to all routes
// // // app.use(cors(corsOptions));
// // // app.use(express.json());
// // // app.use(express.urlencoded({ extended: true }));

// // // // Handle OPTIONS/preflight requests manually
// // // app.use((req, res, next) => {
// // //     if (req.method === 'OPTIONS') {
// // //         res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
// // //         res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// // //         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// // //         res.header('Access-Control-Allow-Credentials', 'true');
// // //         return res.status(200).end();
// // //     }
// // //     next();
// // // });

// // // // ========== QR SOCKET NAMESPACE ==========
// // // const qrNamespace = io.of('/ws/qr');

// // // qrNamespace.on('connection', (socket) => {
// // //     console.log(`🔗 QR Client connected: ${socket.id}`);
    
// // //     // Send initial status
// // //     const status = bot.getStatus();
// // //     socket.emit('qr-status', {
// // //         connected: status.connected,
// // //         authenticated: status.authenticated,
// // //         hasQR: !!bot.getCurrentQR(),
// // //         qr: bot.getCurrentQR()
// // //     });
    
// // //     // Handle client registration
// // //     socket.on('register-client', (data) => {
// // //         console.log(`📝 Client registered: ${socket.id}`, data);
// // //         socket.emit('registration-success', {
// // //             clientId: socket.id,
// // //             message: 'Client registered successfully'
// // //         });
// // //     });
    
// // //     // Handle QR request
// // //     socket.on('request-qr', () => {
// // //         const qr = bot.getCurrentQR();
// // //         if (qr) {
// // //             socket.emit('qr-update', { qr });
// // //         }
// // //     });
    
// // //     // Handle disconnect
// // //     socket.on('disconnect', () => {
// // //         console.log(`🔌 QR Client disconnected: ${socket.id}`);
// // //     });
// // // });

// // // // ========== NOTIFICATION SOCKET NAMESPACE ==========
// // // const notificationNamespace = io.of('/ws/notifications');

// // // notificationNamespace.on('connection', (socket) => {
// // //     console.log(`🔔 Notification Client connected: ${socket.id}`);
    
// // //     // Send welcome message
// // //     socket.emit('notification', {
// // //         type: 'connection',
// // //         message: 'Connected to notification server',
// // //         timestamp: new Date().toISOString()
// // //     });
    
// // //     // Handle client registration for notifications
// // //     socket.on('register-notification-client', (data) => {
// // //         console.log(`📱 Notification client registered:`, {
// // //             socketId: socket.id,
// // //             ...data
// // //         });
        
// // //         socket.emit('registration-success', {
// // //             clientId: socket.id,
// // //             type: 'notification',
// // //             message: 'Registered for notifications',
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     });
    
// // //     // Handle WhatsApp order notifications
// // //     socket.on('whatsapp-order', (orderData) => {
// // //         console.log(`📦 WhatsApp order received:`, orderData);
        
// // //         // Broadcast to all connected notification clients
// // //         notificationNamespace.emit('new-order', {
// // //             ...orderData,
// // //             id: Date.now().toString(),
// // //             timestamp: new Date().toISOString(),
// // //             socketId: socket.id
// // //         });
// // //     });
    
// // //     // Handle order status updates
// // //     socket.on('order-status-update', (updateData) => {
// // //         console.log(`🔄 Order status update:`, updateData);
        
// // //         // Broadcast status update
// // //         notificationNamespace.emit('order-updated', {
// // //             ...updateData,
// // //             updatedAt: new Date().toISOString()
// // //         });
// // //     });
    
// // //     // Handle ping
// // //     socket.on('ping', () => {
// // //         socket.emit('pong', {
// // //             timestamp: new Date().toISOString(),
// // //             serverTime: Date.now()
// // //         });
// // //     });
    
// // //     // Handle disconnect
// // //     socket.on('disconnect', (reason) => {
// // //         console.log(`🔌 Notification Client disconnected: ${socket.id}`, reason);
// // //     });
// // // });

// // // // ========== BOT EVENT HANDLERS FOR REAL-TIME UPDATES ==========
// // // bot.on('qr-update', (qr) => {
// // //     qrNamespace.emit('qr-update', { qr });
// // // });

// // // bot.on('status-change', (status) => {
// // //     qrNamespace.emit('qr-status', {
// // //         connected: status.connected,
// // //         authenticated: status.authenticated,
// // //         hasQR: !!bot.getCurrentQR(),
// // //         status: status.status,
// // //         message: status.message
// // //     });
// // // });

// // // bot.on('message', (messageData) => {
// // //     // Forward messages to notification namespace
// // //     notificationNamespace.emit('new-message', {
// // //         ...messageData,
// // //         timestamp: new Date().toISOString()
// // //     });
// // // });

// // // // ========== REST API ROUTES (KEPT AS IS) ==========
// // // app.get('/api/status', (req, res) => {
// // //     try {
// // //         const status = bot.getStatus();
// // //         res.json({
// // //             success: true,
// // //             qr: bot.getCurrentQR(),
// // //             status: status.connected ? 'connected' : 
// // //                    bot.getCurrentQR() ? 'qr_required' : 'disconnected',
// // //             message: status.connected ? 'WhatsApp is connected' : 
// // //                     bot.getCurrentQR() ? 'QR code required' : 'Not connected',
// // //             stats: status.stats,
// // //             botInfo: status.botInfo,
// // //             reconnectAttempts: status.reconnectAttempts
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Status Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Internal server error'
// // //         });
// // //     }
// // // });

// // // app.get('/api/qr', (req, res) => {
// // //     try {
// // //         const qr = bot.getCurrentQR();
// // //         res.json({
// // //             success: true,
// // //             qr: qr,
// // //             hasQr: !!qr,
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API QR Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Internal server error'
// // //         });
// // //     }
// // // });

// // // app.get('/api/stats', (req, res) => {
// // //     try {
// // //         const status = bot.getStatus();
// // //         res.json({
// // //             success: true,
// // //             stats: status.stats,
// // //             lastUpdated: new Date().toISOString()
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Stats Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Internal server error'
// // //         });
// // //     }
// // // });

// // // app.get('/api/bot', (req, res) => {
// // //     try {
// // //         const status = bot.getStatus();
// // //         res.json({
// // //             success: true,
// // //             connected: status.connected,
// // //             authenticated: status.authenticated,
// // //             hasQR: !!bot.getCurrentQR(),
// // //             botInfo: status.botInfo,
// // //             stats: status.stats,
// // //             reconnectAttempts: status.reconnectAttempts,
// // //             uptime: status.formattedUptime
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Bot Info Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Internal server error'
// // //         });
// // //     }
// // // });

// // // app.post('/api/connect', async (req, res) => {
// // //     try {
// // //         await bot.initialize();
// // //         res.json({
// // //             success: true,
// // //             message: 'Bot connection initiated'
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Connect Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Failed to connect bot'
// // //         });
// // //     }
// // // });

// // // app.post('/api/disconnect', async (req, res) => {
// // //     try {
// // //         await bot.safeDestroyClient();
// // //         res.json({
// // //             success: true,
// // //             message: 'Bot disconnected successfully'
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Disconnect Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Failed to disconnect bot'
// // //         });
// // //     }
// // // });

// // // app.post('/api/restart', async (req, res) => {
// // //     try {
// // //         await bot.restart();
// // //         res.json({
// // //             success: true,
// // //             message: 'Bot restart initiated'
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Restart Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Failed to restart bot'
// // //         });
// // //     }
// // // });

// // // app.post('/api/logout', async (req, res) => {
// // //     try {
// // //         await bot.logout();
// // //         res.json({
// // //             success: true,
// // //             message: 'Bot logged out successfully'
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Logout Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Failed to logout bot'
// // //         });
// // //     }
// // // });

// // // app.post('/api/send-message', async (req, res) => {
// // //     try {
// // //         const { to, message } = req.body;
        
// // //         if (!to || !message) {
// // //             return res.status(400).json({
// // //                 success: false,
// // //                 error: 'Phone number and message are required'
// // //             });
// // //         }
        
// // //         const result = await bot.sendMessage(to, message);
        
// // //         if (result.success) {
// // //             res.json(result);
// // //         } else {
// // //             res.status(500).json(result);
// // //         }
        
// // //     } catch (error) {
// // //         console.error('❌ API Send Message Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Failed to send message'
// // //         });
// // //     }
// // // });

// // // app.post('/api/clear-session', async (req, res) => {
// // //     try {
// // //         await bot.clearSession();
// // //         res.json({
// // //             success: true,
// // //             message: 'Session cleared successfully'
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Clear Session Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Failed to clear session'
// // //         });
// // //     }
// // // });

// // // app.delete('/api/clear-all', async (req, res) => {
// // //     try {
// // //         await bot.clearSession();
// // //         await bot.shutdown();
        
// // //         res.json({
// // //             success: true,
// // //             message: 'All sessions cleared and bot stopped'
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ API Clear All Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Failed to clear all sessions'
// // //         });
// // //     }
// // // });

// // // // WebSocket status endpoint
// // // app.get('/api/websocket-status', (req, res) => {
// // //     try {
// // //         const qrClients = Array.from(qrNamespace.sockets.keys());
// // //         const notificationClients = Array.from(notificationNamespace.sockets.keys());
        
// // //         res.json({
// // //             success: true,
// // //             server: 'WebSocket Server',
// // //             port: PORT,
// // //             namespaces: {
// // //                 qr: {
// // //                     path: '/ws/qr',
// // //                     connectedClients: qrClients.length,
// // //                     clientIds: qrClients
// // //                 },
// // //                 notifications: {
// // //                     path: '/ws/notifications',
// // //                     connectedClients: notificationClients.length,
// // //                     clientIds: notificationClients
// // //                 }
// // //             },
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ WebSocket Status Error:', error);
// // //         res.status(500).json({
// // //             success: false,
// // //             error: error.message || 'Internal server error'
// // //         });
// // //     }
// // // });

// // // // Health check
// // // app.get('/health', (req, res) => {
// // //     try {
// // //         const status = bot.getStatus();
// // //         const qrClients = Array.from(qrNamespace.sockets.keys());
// // //         const notificationClients = Array.from(notificationNamespace.sockets.keys());
        
// // //         res.json({
// // //             status: 'healthy',
// // //             server: 'running',
// // //             bot: status.connected ? 'connected' : 'disconnected',
// // //             websocket: {
// // //                 qrClients: qrClients.length,
// // //                 notificationClients: notificationClients.length,
// // //                 totalClients: qrClients.length + notificationClients.length
// // //             },
// // //             uptime: status.formattedUptime,
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     } catch (error) {
// // //         console.error('❌ Health Check Error:', error);
// // //         res.status(500).json({
// // //             status: 'unhealthy',
// // //             error: error.message || 'Server error'
// // //         });
// // //     }
// // // });

// // // // Root endpoint
// // // app.get('/', (req, res) => {
// // //     const qrClients = Array.from(qrNamespace.sockets.keys());
// // //     const notificationClients = Array.from(notificationNamespace.sockets.keys());
    
// // //     res.json({
// // //         name: 'WhatsApp Bot & Notification Server',
// // //         version: '2.0.0',
// // //         status: 'running',
// // //         port: PORT,
// // //         websocket: {
// // //             qrNamespace: 'ws://localhost:' + PORT + '/ws/qr',
// // //             notificationNamespace: 'ws://localhost:' + PORT + '/ws/notifications',
// // //             connectedClients: {
// // //                 qr: qrClients.length,
// // //                 notifications: notificationClients.length,
// // //                 total: qrClients.length + notificationClients.length
// // //             }
// // //         },
// // //         apiEndpoints: {
// // //             status: '/api/status',
// // //             qr: '/api/qr',
// // //             stats: '/api/stats',
// // //             bot: '/api/bot',
// // //             websocketStatus: '/api/websocket-status',
// // //             health: '/health'
// // //         },
// // //         timestamp: new Date().toISOString()
// // //     });
// // // });

// // // // Start server
// // // server.listen(PORT, () => {
// // //     console.log('='.repeat(60));
// // //     console.log('🚀 COMBINED WHATSAPP BOT & NOTIFICATION SERVER');
// // //     console.log('='.repeat(60));
// // //     console.log(`✅ Server running on port: ${PORT}`);
// // //     console.log(`🔗 API URL: http://localhost:${PORT}`);
// // //     console.log(`🔌 WebSocket QR Namespace: ws://localhost:${PORT}/ws/qr`);
// // //     console.log(`🔔 WebSocket Notification: ws://localhost:${PORT}/ws/notifications`);
// // //     console.log(`📊 Health: http://localhost:${PORT}/health`);
// // //     console.log('='.repeat(60));
// // //     console.log('📡 QR Socket: Ready for WhatsApp Web connections');
// // //     console.log('🔔 Notification Socket: Ready for order notifications');
// // //     console.log('='.repeat(60));
// // // });

// // // // Graceful shutdown
// // // process.on('SIGINT', async () => {
// // //     console.log('\n🛑 Received shutdown signal (SIGINT)');
// // //     console.log('Shutting down combined server...');
    
// // //     try {
// // //         await bot.shutdown();
        
// // //         // Close all WebSocket connections
// // //         qrNamespace.sockets.forEach(socket => socket.disconnect(true));
// // //         notificationNamespace.sockets.forEach(socket => socket.disconnect(true));
        
// // //     } catch (error) {
// // //         console.error('Error during shutdown:', error);
// // //     }
    
// // //     server.close(() => {
// // //         console.log('✅ Combined Server closed gracefully');
// // //         process.exit(0);
// // //     });
// // // });

// // // process.on('SIGTERM', async () => {
// // //     console.log('\n🛑 Received termination signal (SIGTERM)');
// // //     console.log('Terminating combined server...');
    
// // //     try {
// // //         await bot.shutdown();
        
// // //         // Close all WebSocket connections
// // //         qrNamespace.sockets.forEach(socket => socket.disconnect(true));
// // //         notificationNamespace.sockets.forEach(socket => socket.disconnect(true));
        
// // //     } catch (error) {
// // //         console.error('Error during termination:', error);
// // //     }
    
// // //     server.close(() => {
// // //         console.log('✅ Combined Server closed gracefully');
// // //         process.exit(0);
// // //     });
// // // });

// // // // Error handling
// // // process.on('uncaughtException', (error) => {
// // //     console.error('❌ Uncaught Exception:', error);
// // // });

// // // process.on('unhandledRejection', (reason, promise) => {
// // //     console.error('❌ Unhandled Rejection at:', promise);
// // //     console.error('Reason:', reason);
// // // });

// // // export default server;

// // // server.js - Complete Professional Version
// // import express from 'express';
// // import cors from 'cors';
// // import http from 'http';
// // import { Server } from 'socket.io';
// // import dotenv from 'dotenv';
// // import bot from './whatsap/bot.js';
// // import { qrSocketServer } from "./services/qrSocketServer.js";

// // dotenv.config();

// // const app = express();
// // const server = http.createServer(app);
// // const PORT = process.env.BOT_PORT || 3001;

// // // Set bot in QR socket server BEFORE initialization
// // qrSocketServer.setBot(bot);

// // // IMPORTANT: Use the correct Socket.IO configuration
// // const io = new Server(server, {
// //   cors: {
// //     origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
// //     methods: ["GET", "POST"],
// //     credentials: true
// //   },
// //   transports: ['websocket', 'polling'],
// //   pingTimeout: 60000,
// //   pingInterval: 25000,
// //   allowEIO3: true, // Important for compatibility
// //   allowUpgrades: true,
// //   cookie: false
// // });

// // // CORS setup for REST API
// // app.use(cors({
// //   origin: ['http://localhost:3000', 'http://localhost:3001'],
// //   credentials: true
// // }));

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Add CORS headers manually
// // app.use((req, res, next) => {
// //   res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
// //   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// //   res.header('Access-Control-Allow-Credentials', 'true');
  
// //   if (req.method === 'OPTIONS') {
// //     return res.status(200).end();
// //   }
// //   next();
// // });

// // // Store connected clients
// // const clients = {
// //   qr: new Map(),
// //   notifications: new Map()
// // };

// // // ========== QR NAMESPACE ==========
// // const qrNamespace = io.of('/qr');

// // qrNamespace.on('connection', (socket) => {
// //   const clientId = socket.id;
// //   const ip = socket.handshake.address;
// //   const userAgent = socket.handshake.headers['user-agent'] || 'Unknown';
  
// //   console.log(`🔗 QR Socket.IO Client connected: ${clientId} from ${ip}`);
  
// //   // Store client
// //   clients.qr.set(clientId, {
// //     socket,
// //     metadata: {
// //       ip,
// //       userAgent,
// //       connectedAt: new Date(),
// //       authenticated: true // QR clients don't need auth
// //     }
// //   });
  
// //   // Send initial status
// //   const botStatus = bot.getStatus();
// //   socket.emit('qr-status', {
// //     type: 'qr-status',
// //     connected: botStatus.connected,
// //     authenticated: botStatus.authenticated,
// //     hasQR: !!bot.getCurrentQR(),
// //     qr: bot.getCurrentQR(),
// //     timestamp: new Date().toISOString()
// //   });
  
// //   // Handle client registration
// //   socket.on('register-client', (data) => {
// //     console.log(`📝 QR Client registered: ${clientId}`);
// //     socket.emit('registration-success', {
// //       type: 'registration-success',
// //       clientId,
// //       message: 'QR client registered',
// //       timestamp: new Date().toISOString()
// //     });
// //   });
  
// //   // Handle QR request
// //   socket.on('request-qr', () => {
// //     const qr = bot.getCurrentQR();
// //     if (qr) {
// //       socket.emit('qr-update', {
// //         type: 'qr-update',
// //         qr,
// //         timestamp: new Date().toISOString()
// //       });
// //     }
// //   });
  
// //   // Handle ping
// //   socket.on('ping', () => {
// //     socket.emit('pong', {
// //       type: 'pong',
// //       timestamp: new Date().toISOString(),
// //       serverTime: Date.now()
// //     });
// //   });
  
// //   // Handle disconnect
// //   socket.on('disconnect', (reason) => {
// //     console.log(`🔌 QR Client disconnected: ${clientId} - ${reason}`);
// //     clients.qr.delete(clientId);
// //   });
// // });

// // // ========== NOTIFICATION NAMESPACE ==========
// // const notificationNamespace = io.of('/notifications');

// // notificationNamespace.on('connection', (socket) => {
// //   const clientId = socket.id;
// //   const ip = socket.handshake.address;
// //   const userAgent = socket.handshake.headers['user-agent'] || 'Unknown';
  
// //   console.log(`🔔 Notification Client connected: ${clientId} from ${ip}`);
  
// //   // Store unauthenticated client
// //   clients.notifications.set(clientId, {
// //     socket,
// //     metadata: {
// //       ip,
// //       userAgent,
// //       connectedAt: new Date(),
// //       authenticated: false,
// //       role: null,
// //       userId: null,
// //       fcmToken: null
// //     }
// //   });
  
// //   // Send welcome message
// //   socket.emit('CONNECTED', {
// //     type: 'CONNECTED',
// //     clientId,
// //     serverTime: new Date().toISOString(),
// //     message: 'Connected to notification server',
// //     requiresAuth: true
// //   });
  
// //   // Handle authentication (matching your frontend events)
// //   socket.on('AUTHENTICATE', (data) => {
// //     const { token, userId, role, name } = data;
    
// //     // Validate token (use your own logic)
// //     const isValidToken = token === process.env.ADMIN_API_KEY || 
// //                         token === 'dev-key-2024' || 
// //                         token === process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY;
    
// //     if (isValidToken) {
// //       // Update client metadata
// //       const client = clients.notifications.get(clientId);
// //       if (client) {
// //         client.metadata = {
// //           ...client.metadata,
// //           authenticated: true,
// //           role: role || 'admin',
// //           userId: userId || 'unknown',
// //           name: name || 'Admin',
// //           authenticatedAt: new Date().toISOString()
// //         };
// //       }
      
// //       console.log(`✅ Admin authenticated: ${userId || 'Unknown'} (${role})`);
      
// //       socket.emit('AUTHENTICATE_SUCCESS', {
// //         type: 'AUTHENTICATE_SUCCESS',
// //         clientId,
// //         role,
// //         userId,
// //         message: 'Authentication successful',
// //         timestamp: new Date().toISOString()
// //       });
      
// //       // Request FCM token registration
// //       setTimeout(() => {
// //         socket.emit('AUTHENTICATE_REQUEST', {
// //           type: 'AUTHENTICATE_REQUEST',
// //           message: 'Please register FCM token',
// //           timestamp: new Date().toISOString()
// //         });
// //       }, 1000);
      
// //     } else {
// //       console.log(`❌ Authentication failed for client: ${clientId}`);
// //       socket.emit('AUTHENTICATE_FAILED', {
// //         type: 'AUTHENTICATE_FAILED',
// //         message: 'Authentication failed',
// //         timestamp: new Date().toISOString()
// //       });
      
// //       // Close connection after failed auth
// //       setTimeout(() => {
// //         socket.disconnect(true);
// //       }, 3000);
// //     }
// //   });
  
// //   // Handle FCM token registration (matching your frontend)
// //   socket.on('REGISTER_FCM_TOKEN', (data) => {
// //     const { token, role } = data;
// //     const client = clients.notifications.get(clientId);
    
// //     if (client && client.metadata.authenticated) {
// //       client.metadata.fcmToken = token;
      
// //       console.log(`📱 FCM token registered for ${client.metadata.userId}: ${token?.substring(0, 20)}...`);
      
// //       socket.emit('FCM_TOKEN_REGISTERED', {
// //         type: 'FCM_TOKEN_REGISTERED',
// //         message: 'FCM token registered successfully',
// //         timestamp: new Date().toISOString()
// //       });
// //     }
// //   });
  
// //   // Handle WhatsApp orders
// //   socket.on('whatsapp-order', (orderData) => {
// //     console.log(`📦 WhatsApp order received from ${clientId}:`, orderData.orderNumber);
    
// //     // Broadcast to all authenticated admin clients
// //     clients.notifications.forEach((client, id) => {
// //       if (client.metadata.authenticated && client.metadata.role === 'admin') {
// //         client.socket.emit('NEW_ORDER', {
// //           type: 'NEW_ORDER',
// //           order: orderData,
// //           timestamp: new Date().toISOString()
// //         });
// //       }
// //     });
// //   });
  
// //   // Handle order status updates
// //   socket.on('order-status-update', (updateData) => {
// //     clients.notifications.forEach((client, id) => {
// //       if (client.metadata.authenticated) {
// //         client.socket.emit('ORDER_STATUS_CHANGED', {
// //           type: 'ORDER_STATUS_CHANGED',
// //           ...updateData,
// //           timestamp: new Date().toISOString()
// //         });
// //       }
// //     });
// //   });
  
// //   // Handle ping
// //   socket.on('PING', () => {
// //     socket.emit('PONG', {
// //       type: 'PONG',
// //       timestamp: new Date().toISOString()
// //     });
// //   });
  
// //   // Handle disconnect
// //   socket.on('disconnect', (reason) => {
// //     console.log(`🔌 Notification Client disconnected: ${clientId} - ${reason}`);
// //     clients.notifications.delete(clientId);
// //   });
  
// //   // Error handling
// //   socket.on('error', (error) => {
// //     console.error(`❌ Notification Socket error: ${error.message}`);
// //   });
// // });

// // // ========== BOT EVENT HANDLERS ==========

// // bot.on('qr-update', (qr) => {
// //   qrNamespace.emit('qr-update', {
// //     type: 'qr-update',
// //     qr,
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // bot.on('status-change', (status) => {
// //   qrNamespace.emit('qr-status', {
// //     type: 'qr-status',
// //     ...status,
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // bot.on('message', (messageData) => {
// //   // Forward to notification clients
// //   clients.notifications.forEach((client, id) => {
// //     if (client.metadata.authenticated && client.metadata.role === 'admin') {
// //       client.socket.emit('new-message', {
// //         type: 'new-message',
// //         ...messageData,
// //         timestamp: new Date().toISOString()
// //       });
// //     }
// //   });
// // });

// // bot.on('order-update', (orderData) => {
// //   // Send order notifications
// //   clients.notifications.forEach((client, id) => {
// //     if (client.metadata.authenticated && client.metadata.role === 'admin') {
// //       client.socket.emit('NEW_ORDER', {
// //         type: 'NEW_ORDER',
// //         order: orderData,
// //         timestamp: new Date().toISOString()
// //       });
// //     }
// //   });
// // });

// // // ========== REST API ROUTES ==========

// // // Health check endpoint
// // app.get('/health', (req, res) => {
// //   const status = bot.getStatus();
// //   res.json({
// //     status: 'healthy',
// //     server: 'running',
// //     bot: status.connected ? 'connected' : 'disconnected',
// //     websocket: {
// //       qrClients: clients.qr.size,
// //       notificationClients: clients.notifications.size,
// //       authenticatedAdmins: Array.from(clients.notifications.values())
// //         .filter(c => c.metadata.authenticated && c.metadata.role === 'admin').length
// //     },
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // WebSocket status endpoint
// // app.get('/api/websocket-status', (req, res) => {
// //   const qrClients = Array.from(clients.qr.keys());
// //   const notificationClients = Array.from(clients.notifications.keys());
  
// //   res.json({
// //     success: true,
// //     server: 'Socket.IO Server',
// //     port: PORT,
// //     namespaces: {
// //       qr: {
// //         path: '/qr',
// //         connectedClients: clients.qr.size,
// //         clientIds: qrClients
// //       },
// //       notifications: {
// //         path: '/notifications',
// //         connectedClients: clients.notifications.size,
// //         authenticatedClients: Array.from(clients.notifications.values())
// //           .filter(c => c.metadata.authenticated).length,
// //         clientIds: notificationClients
// //       }
// //     },
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // Send notification endpoint
// // app.post('/api/notifications/send', async (req, res) => {
// //   try {
// //     const { type, data, target = 'admins' } = req.body;
// //     let sentCount = 0;
    
// //     if (target === 'admins' || target === 'all') {
// //       clients.notifications.forEach((client, id) => {
// //         if (client.metadata.authenticated && client.metadata.role === 'admin') {
// //           client.socket.emit('notification', {
// //             type,
// //             data,
// //             timestamp: new Date().toISOString()
// //           });
// //           sentCount++;
// //         }
// //       });
// //     }
    
// //     res.json({
// //       success: true,
// //       message: `Notification sent to ${sentCount} admin(s)`,
// //       sentCount,
// //       timestamp: new Date().toISOString()
// //     });
    
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // // === YOUR EXISTING API ENDPOINTS ===

// // app.get('/api/status', (req, res) => {
// //   try {
// //     const status = bot.getStatus();
// //     res.json({
// //       success: true,
// //       qr: bot.getCurrentQR(),
// //       status: status.connected ? 'connected' : 
// //              bot.getCurrentQR() ? 'qr_required' : 'disconnected',
// //       message: status.connected ? 'WhatsApp is connected' : 
// //               bot.getCurrentQR() ? 'QR code required' : 'Not connected',
// //       stats: status.stats,
// //       botInfo: status.botInfo,
// //       reconnectAttempts: status.reconnectAttempts
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.get('/api/qr', (req, res) => {
// //   try {
// //     const qr = bot.getCurrentQR();
// //     res.json({
// //       success: true,
// //       qr: qr,
// //       hasQr: !!qr,
// //       timestamp: new Date().toISOString()
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.get('/api/stats', (req, res) => {
// //   try {
// //     const status = bot.getStatus();
// //     res.json({
// //       success: true,
// //       stats: status.stats,
// //       lastUpdated: new Date().toISOString()
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.get('/api/bot', (req, res) => {
// //   try {
// //     const status = bot.getStatus();
// //     res.json({
// //       success: true,
// //       connected: status.connected,
// //       authenticated: status.authenticated,
// //       hasQR: !!bot.getCurrentQR(),
// //       botInfo: status.botInfo,
// //       stats: status.stats,
// //       reconnectAttempts: status.reconnectAttempts,
// //       uptime: status.formattedUptime
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.post('/api/connect', async (req, res) => {
// //   try {
// //     await bot.initialize();
// //     res.json({
// //       success: true,
// //       message: 'Bot connection initiated'
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.post('/api/disconnect', async (req, res) => {
// //   try {
// //     await bot.safeDestroyClient();
// //     res.json({
// //       success: true,
// //       message: 'Bot disconnected successfully'
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.post('/api/restart', async (req, res) => {
// //   try {
// //     await bot.restart();
// //     res.json({
// //       success: true,
// //       message: 'Bot restart initiated'
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.post('/api/logout', async (req, res) => {
// //   try {
// //     await bot.logout();
// //     res.json({
// //       success: true,
// //       message: 'Bot logged out successfully'
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.post('/api/send-message', async (req, res) => {
// //   try {
// //     const { to, message } = req.body;
    
// //     if (!to || !message) {
// //       return res.status(400).json({
// //         success: false,
// //         error: 'Phone number and message are required'
// //       });
// //     }
    
// //     const result = await bot.sendMessage(to, message);
    
// //     if (result.success) {
// //       res.json(result);
// //     } else {
// //       res.status(500).json(result);
// //     }
    
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.post('/api/clear-session', async (req, res) => {
// //   try {
// //     await bot.clearSession();
// //     res.json({
// //       success: true,
// //       message: 'Session cleared successfully'
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // app.delete('/api/clear-all', async (req, res) => {
// //   try {
// //     await bot.clearSession();
// //     await bot.shutdown();
    
// //     res.json({
// //       success: true,
// //       message: 'All sessions cleared and bot stopped'
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // });

// // // Root endpoint
// // app.get('/', (req, res) => {
// //   res.json({
// //     name: 'WhatsApp Bot & Notification Server',
// //     version: '2.0.0',
// //     status: 'running',
// //     port: PORT,
// //     websocket: {
// //       qrNamespace: `http://localhost:${PORT}/qr`,
// //       notificationNamespace: `http://localhost:${PORT}/notifications`,
// //       connectedClients: {
// //         qr: clients.qr.size,
// //         notifications: clients.notifications.size,
// //         total: clients.qr.size + clients.notifications.size
// //       }
// //     },
// //     apiEndpoints: {
// //       status: '/api/status',
// //       qr: '/api/qr',
// //       stats: '/api/stats',
// //       bot: '/api/bot',
// //       websocketStatus: '/api/websocket-status',
// //       notifications: '/api/notifications/send',
// //       health: '/health'
// //     },
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // ========== START SERVER ==========
// // server.listen(PORT, () => {
// //   console.log('='.repeat(60));
// //   console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER');
// //   console.log('='.repeat(60));
// //   console.log(`✅ Server running on port: ${PORT}`);
// //   console.log(`🔗 API URL: http://localhost:${PORT}`);
// //   console.log(`📡 QR Socket.IO: http://localhost:${PORT}/qr`);
// //   console.log(`🔔 Notification Socket.IO: http://localhost:${PORT}/notifications`);
// //   console.log(`📊 Health: http://localhost:${PORT}/health`);
// //   console.log('='.repeat(60));
// //   console.log('⚡ Using Socket.IO protocol for WebSocket');
// //   console.log('🔧 Auto-reconnect & fallback polling enabled');
// //   console.log('='.repeat(60));
  
// //   // Initialize QR Socket Server AFTER server is listening
// //   qrSocketServer.initialize(server, bot);
// // });

// // // Graceful shutdown
// // process.on('SIGINT', async () => {
// //   console.log('\n🛑 Received SIGINT - Shutting down...');
  
// //   try {
// //     await bot.shutdown();
    
// //     // Disconnect all Socket.IO clients
// //     qrNamespace.disconnectSockets(true);
// //     notificationNamespace.disconnectSockets(true);
    
// //     // Close QR socket server
// //     qrSocketServer.close();
    
// //     console.log('✅ All clients disconnected');
// //   } catch (error) {
// //     console.error('Shutdown error:', error);
// //   }
  
// //   server.close(() => {
// //     console.log('✅ Server closed gracefully');
// //     process.exit(0);
// //   });
// // });

// // process.on('SIGTERM', async () => {
// //   console.log('\n🛑 Received SIGTERM - Terminating...');
  
// //   try {
// //     await bot.shutdown();
// //     qrNamespace.disconnectSockets(true);
// //     notificationNamespace.disconnectSockets(true);
// //     qrSocketServer.close();
// //   } catch (error) {
// //     console.error('Termination error:', error);
// //   }
  
// //   server.close(() => {
// //     process.exit(0);
// //   });
// // });

// // export default server;



// // server.js - Fixed with Global Socket.IO
// import express from 'express';
// import cors from 'cors';
// import http from 'http';
// import { Server } from 'socket.io'; // ADD THIS IMPORT
// import dotenv from 'dotenv';
// import bot from './whatsap/bot.js';
// import apiService from './services/apiService.js';
// import notificationManager from './services/notifications/notification-manager.js';
// import { qrSocketServer } from "./services/qrSocketServer.js";

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.BOT_PORT || 3001;

// // Set bot in QR socket server
// qrSocketServer.setBot(bot);

// // ========== CREATE SOCKET.IO SERVER HERE ==========
// // Create ONE Socket.IO server that both qrSocketServer and notification-manager will use
// const io = new Server(server, {
//   cors: {
//     origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling'],
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   allowEIO3: true,
//   allowUpgrades: true,
//   cookie: false
// });

// // ========== SET SOCKET.IO GLOBALLY ==========
// // CRITICAL: Set io globally BEFORE anything else
// global.io = io;
// console.log('✅ Socket.IO set globally');

// // CORS setup for REST API
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

// // ========== SETUP BASIC SOCKET.IO NAMESPACES ==========
// // Create namespaces that qrSocketServer will enhance
// const qrNamespace = io.of('/qr');
// const notificationNamespace = io.of('/notifications');

// // Basic connection logging
// qrNamespace.on('connection', (socket) => {
//   console.log(`🔗 QR Client connected: ${socket.id}`);
  
//   socket.on('disconnect', () => {
//     console.log(`🔌 QR Client disconnected: ${socket.id}`);
//   });
// });

// notificationNamespace.on('connection', (socket) => {
//   console.log(`🔔 Notification Client connected: ${socket.id}`);
  
//   socket.on('disconnect', () => {
//     console.log(`🔌 Notification Client disconnected: ${socket.id}`);
//   });
// });

// // ========== PASS SOCKET.IO TO QR SOCKET SERVER ==========
// // Modify qrSocketServer to use our io instance
// if (qrSocketServer.setIO) {
//   qrSocketServer.setIO(io);
// } else {
//   // If qrSocketServer doesn't have setIO method, we need to check its initialize method
//   console.log('ℹ️ qrSocketServer.setIO not available, using initialize with our io');
// }

// // ========== REST API ROUTES ==========

// // Health check endpoint
// app.get('/health', (req, res) => {
//   const status = bot.getStatus();
//   const qrClientsCount = qrNamespace.sockets.size;
//   const notificationClientsCount = notificationNamespace.sockets.size;
  
//   res.json({
//     status: 'healthy',
//     server: 'running',
//     bot: status.connected ? 'connected' : 'disconnected',
//     websocket: {
//       qrClients: qrClientsCount,
//       notificationClients: notificationClientsCount,
//       socketIoGlobal: !!global.io
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// // === YOUR EXISTING API ENDPOINTS ===

// app.get('/api/status', (req, res) => {
//   try {
//     const status = bot.getStatus();
//     res.json({
//       success: true,
//       qr: bot.getCurrentQR(),
//       status: status.connected ? 'connected' : 
//              bot.getCurrentQR() ? 'qr_required' : 'disconnected',
//       message: status.connected ? 'WhatsApp is connected' : 
//               bot.getCurrentQR() ? 'QR code required' : 'Not connected',
//       stats: status.stats,
//       botInfo: status.botInfo,
//       reconnectAttempts: status.reconnectAttempts
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.get('/api/qr', (req, res) => {
//   try {
//     const qr = bot.getCurrentQR();
//     res.json({
//       success: true,
//       qr: qr,
//       hasQr: !!qr,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.get('/api/stats', (req, res) => {
//   try {
//     const status = bot.getStatus();
//     res.json({
//       success: true,
//       stats: status.stats,
//       lastUpdated: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.get('/api/bot', (req, res) => {
//   try {
//     const status = bot.getStatus();
//     res.json({
//       success: true,
//       connected: status.connected,
//       authenticated: status.authenticated,
//       hasQR: !!bot.getCurrentQR(),
//       botInfo: status.botInfo,
//       stats: status.stats,
//       reconnectAttempts: status.reconnectAttempts,
//       uptime: status.formattedUptime
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.post('/api/connect', async (req, res) => {
//   try {
//     await bot.initialize();
//     res.json({
//       success: true,
//       message: 'Bot connection initiated'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.post('/api/disconnect', async (req, res) => {
//   try {
//     await bot.safeDestroyClient();
//     res.json({
//       success: true,
//       message: 'Bot disconnected successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.post('/api/restart', async (req, res) => {
//   try {
//     await bot.restart();
//     res.json({
//       success: true,
//       message: 'Bot restart initiated'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.post('/api/logout', async (req, res) => {
//   try {
//     await bot.logout();
//     res.json({
//       success: true,
//       message: 'Bot logged out successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// app.post('/api/send-message', async (req, res) => {
//   try {
//     const { to, message } = req.body;
    
//     if (!to || !message) {
//       return res.status(400).json({
//         success: false,
//         error: 'Phone number and message are required'
//       });
//     }
    
//     const result = await bot.sendMessage(to, message);
    
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

// app.post('/api/clear-session', async (req, res) => {
//   try {
//     await bot.clearSession();
//     res.json({
//       success: true,
//       message: 'Session cleared successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

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

// // ========== ORDER CREATION HANDLER ==========
// if (bot.on && typeof bot.on === 'function') {
//   bot.on('order-created', async (orderData) => {
//     console.log(`🛍️ New order from WhatsApp: ${orderData.orderNumber}`);
    
//     try {
//       const savedOrder = await apiService.createOrder(orderData);
      
//       if (savedOrder && savedOrder._id) {
//         console.log(`✅ Order saved to DB: ${savedOrder._id}`);
        
//         // notification-manager now has access to global.io
//         const notificationResult = await notificationManager.sendNewOrderNotification(savedOrder);
//         console.log(`📤 Notification result: ${notificationResult.success}`);
        
//         // Also emit directly to notification namespace
//         notificationNamespace.emit('NEW_ORDER', {
//           type: 'NEW_ORDER',
//           order: savedOrder,
//           timestamp: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error('❌ Order processing failed:', error.message);
//     }
//   });
// }

// // Root endpoint
// app.get('/', (req, res) => {
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
//     apiEndpoints: {
//       status: '/api/status',
//       qr: '/api/qr',
//       stats: '/api/stats',
//       bot: '/api/bot',
//       health: '/health'
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// // ========== START SERVER ==========
// server.listen(PORT, () => {
//   console.log('='.repeat(60));
//   console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER');
//   console.log('='.repeat(60));
//   console.log(`✅ Server running on port: ${PORT}`);
//   console.log(`🔗 API URL: http://localhost:${PORT}`);
//   console.log(`📡 QR Socket.IO: http://localhost:${PORT}/qr`);
//   console.log(`🔔 Notification Socket.IO: http://localhost:${PORT}/notifications`);
//   console.log(`📊 Health: http://localhost:${PORT}/health`);
//   console.log(`🌐 Global Socket.IO: ${global.io ? 'AVAILABLE ✅' : 'NOT AVAILABLE ❌'}`);
//   console.log('='.repeat(60));
//   console.log('⚡ Single Socket.IO server for both QR and Notifications');
//   console.log('🔧 notification-manager will work with global.io');
//   console.log('='.repeat(60));
  
//   // Initialize QR Socket Server with our already created io
//   // Pass false or modify qrSocketServer to NOT create its own Socket.IO
//   try {
//     qrSocketServer.initialize(server, bot, io); // Pass our io instance
//     console.log('✅ QR Socket Server initialized with existing Socket.IO');
//   } catch (error) {
//     console.error('❌ QR Socket Server initialization error:', error.message);
//   }
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('\n🛑 Received SIGINT - Shutting down...');
  
//   try {
//     await bot.shutdown();
    
//     // Disconnect all Socket.IO clients
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




// server.js - COMPLETE WITH AUTHENTICATION HANDLER - FIXED VERSION
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import bot from './whatsap/bot.js';
import apiService from './services/apiService.js';
import notificationManager from './services/notifications/notification-manager.js';
import { qrSocketServer } from "./services/qrSocketServer.js";

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
  // FIXED CONFIGURATION - REMOVED INVALID wsEngine
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

// ========== QR NAMESPACE HANDLER ==========
qrNamespace.on('connection', (socket) => {
  console.log(`🔗 QR Client connected: ${socket.id}`);
  
  // ADD connection error handler
  socket.on('error', (error) => {
    console.error(`❌ QR Socket error from ${socket.id}:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 QR Client disconnected: ${socket.id} (${reason})`);
  });
});

// ========== NOTIFICATION NAMESPACE HANDLER (WITH AUTHENTICATION) ==========
notificationNamespace.on('connection', (socket) => {
  console.log(`🔔 Notification Client connected: ${socket.id}`);
  
  // ADD connection error handler
  socket.on('error', (error) => {
    console.error(`❌ Notification Socket error from ${socket.id}:`, error);
  });
  
  // Set authentication status
  let isAuthenticated = false;
  let authenticatedUser = null;
  
  // ===== AUTHENTICATION HANDLER =====
  socket.on('authenticate', (data) => {
    console.log(`🔐 Authentication attempt from ${socket.id}:`, {
      userId: data?.userId,
      userRole: data?.userRole,
      tokenPreview: data?.token ? data.token.substring(0, 20) + '...' : 'No token'
    });
    
    const { token, userId, userRole, name, connectionId } = data || {};
    
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
    
    // Authentication successful
    isAuthenticated = true;
    authenticatedUser = {
      id: userId,
      role: userRole,
      name: name || `Admin-${userId.substring(0, 8)}`,
      connectionId: connectionId || socket.id,
      authenticatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Admin authenticated: ${authenticatedUser.name} (${userId})`);
    
    socket.emit('authenticated', {
      success: true,
      message: 'Authentication successful',
      user: {
        id: userId,
        role: userRole,
        name: name || `Admin-${userId.substring(0, 8)}`
      },
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      serverTime: new Date().toISOString()
    });
    
    // Join admin room for targeted notifications
    socket.join('admins');
    console.log(`👥 ${authenticatedUser.name} joined 'admins' room`);
  });
  
  // ===== FCM TOKEN REGISTRATION =====
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
    
    const { token, deviceInfo, timestamp } = data || {};
    
    if (!token) {
      console.error(`❌ Invalid FCM token from ${authenticatedUser?.name}`);
      socket.emit('fcm-token-registration-failed', {
        success: false,
        message: 'Invalid FCM token',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    console.log(`📱 FCM token registered for ${authenticatedUser.name}:`, {
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
      console.log(`👋 ${authenticatedUser.name} disconnected`);
    }
  });
});

// ========== PASS SOCKET.IO TO QR SOCKET SERVER ==========
if (qrSocketServer.setIO) {
  qrSocketServer.setIO(io);
} else {
  console.log('ℹ️ qrSocketServer.setIO not available');
}

// ========== REST API ROUTES ==========

// Health check endpoint
app.get('/health', (req, res) => {
  const status = bot.getStatus();
  const qrClientsCount = qrNamespace.sockets.size;
  const notificationClientsCount = notificationNamespace.sockets.size;
  const rootClientsCount = io.sockets.sockets.size;
  
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
    timestamp: new Date().toISOString()
  });
});

// WebSocket status endpoint for debugging
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

// === BOT MANAGEMENT ENDPOINTS ===

app.get('/api/status', (req, res) => {
  try {
    const status = bot.getStatus();
    res.json({
      success: true,
      qr: bot.getCurrentQR(),
      status: status.connected ? 'connected' : 
             bot.getCurrentQR() ? 'qr_required' : 'disconnected',
      message: status.connected ? 'WhatsApp is connected' : 
              bot.getCurrentQR() ? 'QR code required' : 'Not connected',
      stats: status.stats,
      botInfo: status.botInfo,
      reconnectAttempts: status.reconnectAttempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/qr', (req, res) => {
  try {
    const qr = bot.getCurrentQR();
    res.json({
      success: true,
      qr: qr,
      hasQr: !!qr,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const status = bot.getStatus();
    res.json({
      success: true,
      stats: status.stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/bot', (req, res) => {
  try {
    const status = bot.getStatus();
    res.json({
      success: true,
      connected: status.connected,
      authenticated: status.authenticated,
      hasQR: !!bot.getCurrentQR(),
      botInfo: status.botInfo,
      stats: status.stats,
      reconnectAttempts: status.reconnectAttempts,
      uptime: status.formattedUptime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/connect', async (req, res) => {
  try {
    await bot.initialize();
    res.json({
      success: true,
      message: 'Bot connection initiated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/disconnect', async (req, res) => {
  try {
    await bot.safeDestroyClient();
    res.json({
      success: true,
      message: 'Bot disconnected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/restart', async (req, res) => {
  try {
    await bot.restart();
    res.json({
      success: true,
      message: 'Bot restart initiated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    await bot.logout();
    res.json({
      success: true,
      message: 'Bot logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/send-message', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }
    
    const result = await bot.sendMessage(to, message);
    
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

app.post('/api/clear-session', async (req, res) => {
  try {
    await bot.clearSession();
    res.json({
      success: true,
      message: 'Session cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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

// ========== ORDER CREATION HANDLER ==========
if (bot.on && typeof bot.on === 'function') {
  bot.on('order-created', async (orderData) => {
    console.log(`🛍️ New order from WhatsApp: ${orderData.orderNumber}`);
    
    try {
      const savedOrder = await apiService.createOrder(orderData);
      
      if (savedOrder && savedOrder._id) {
        console.log(`✅ Order saved to DB: ${savedOrder._id}`);
        
        // Send notification via notification-manager
        const notificationResult = await notificationManager.sendNewOrderNotification(savedOrder);
        console.log(`📤 Notification result: ${notificationResult.success}`);
        
        // Also emit directly to notification namespace
        notificationNamespace.emit('NEW_ORDER', {
          type: 'NEW_ORDER',
          order: savedOrder,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
        
        // Emit to admin room for real-time updates
        notificationNamespace.to('admins').emit('dashboard-update', {
          type: 'order-created',
          order: savedOrder,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Order processing failed:', error.message);
    }
  });
}

// ========== NOTIFICATION TEST ENDPOINT ==========
app.post('/api/test-notification', async (req, res) => {
  try {
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
      _id: `test-${Date.now()}`
    };
    
    // Emit test notification
    notificationNamespace.emit('NEW_ORDER', {
      type: 'NEW_ORDER',
      order: testOrder,
      timestamp: new Date().toISOString(),
      priority: 'high',
      test: true
    });
    
    res.json({
      success: true,
      message: 'Test notification sent',
      orderNumber: testOrder.orderNumber,
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
    apiEndpoints: {
      status: '/api/status',
      qr: '/api/qr',
      stats: '/api/stats',
      bot: '/api/bot',
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
  console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER - FIXED VERSION');
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
  console.log('⚡ Single Socket.IO server for both QR and Notifications');
  console.log('🔧 notification-manager will work with global.io');
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
    
    // Disconnect all Socket.IO clients
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