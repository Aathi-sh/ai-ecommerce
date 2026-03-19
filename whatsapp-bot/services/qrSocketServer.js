

// // // // services/qrSocketServer.js - COMPLETE CORRECTED VERSION
// // // import { WebSocketServer } from 'ws';

// // // class QRSocketServer {
// // //     constructor() {
// // //         this.wss = null;
// // //         this.clients = new Map();
// // //         this.isInitialized = false;
        
// // //         // Add throttling variables
// // //         this.lastStatsBroadcast = 0;
// // //         this.statsBroadcastInterval = 5000;
        
// // //         this.lastQrBroadcast = 0;
// // //         this.qrBroadcastInterval = 2000;
        
// // //         this.lastStatusBroadcast = 0;
// // //         this.statusBroadcastInterval = 3000;
        
// // //         // Rate limiting for connections
// // //         this.connectionAttempts = new Map();
// // //         this.maxConnectionsPerMinute = 1000;
// // //         this.connectionCounter = 0;
// // //         this.statsBroadcastCount = 0;
        
// // //         // Bot reference (will be set from server.js)
// // //         this.bot = null;
        
// // //         // Cleanup interval for old rate limit entries
// // //         this.cleanupInterval = setInterval(() => {
// // //             this.cleanupOldAttempts();
// // //         }, 60000);
// // //     }

// // //     // Set bot reference from server.js
// // //     setBot(botInstance) {
// // //         this.bot = botInstance;
// // //         console.log('🤖 Bot instance set in QR Socket Server');
// // //     }

// // //     initialize(server, botInstance = null) {
// // //         if (this.isInitialized) {
// // //             console.log('📡 WebSocket server already initialized');
// // //             return;
// // //         }

// // //         // Set bot if provided
// // //         if (botInstance) {
// // //             this.bot = botInstance;
// // //         }

// // //         try {
// // //             // Validate server is listening
// // //             if (!server.listening) {
// // //                 console.error('❌ HTTP server is not listening yet');
// // //                 return;
// // //             }

// // //             // IMPORTANT: Use path '/ws/qr' to avoid conflicts with notification server
// // //             this.wss = new WebSocketServer({ 
// // //                 server, 
// // //                 path: '/ws/qr', // CHANGED from '/ws' to '/ws/qr'
// // //                 clientTracking: true,
// // //                 perMessageDeflate: false,
// // //                 maxPayload: 1048576
// // //             });
            
// // //             this.wss.on('connection', (ws, req) => {
// // //                 this.connectionCounter++;
// // //                 const clientId = Date.now().toString() + '_' + this.connectionCounter;
// // //                 const clientIp = req.socket.remoteAddress || 'unknown';
// // //                 const userAgent = req.headers['user-agent'] || 'Unknown';
                
// // //                 // Check if localhost/development
// // //                 const isLocalhost = clientIp === '::1' || clientIp === '127.0.0.1' || 
// // //                                    clientIp.includes('localhost') || 
// // //                                    clientIp.includes('192.168.') ||
// // //                                    clientIp.includes('10.0.');
                
// // //                 // Apply rate limiting only for non-localhost connections
// // //                 if (!isLocalhost && !this.checkRateLimit(clientIp)) {
// // //                     console.log(`⛔ Rate limit exceeded for IP: ${clientIp}`);
// // //                     ws.close(1008, 'Rate limit exceeded');
// // //                     return;
// // //                 }
                
// // //                 console.log(`🔗 New QR WebSocket client: ${clientId} from ${clientIp}`);
                
// // //                 // Store client
// // //                 this.clients.set(ws, {
// // //                     id: clientId,
// // //                     connectedAt: new Date(),
// // //                     ip: clientIp,
// // //                     userAgent: userAgent,
// // //                     isAlive: true,
// // //                     isLocalhost: isLocalhost,
// // //                     authenticated: false
// // //                 });
                
// // //                 // Setup heartbeat detection
// // //                 ws.isAlive = true;
                
// // //                 ws.on('pong', () => {
// // //                     ws.isAlive = true;
// // //                 });
                
// // //                 // Send welcome message with initial bot status
// // //                 setTimeout(() => {
// // //                     if (ws.readyState === 1) { // WebSocket.OPEN
// // //                         try {
// // //                             // Get current bot status
// // //                             const botStatus = this.bot ? this.bot.getStatus() : {
// // //                                 connected: false,
// // //                                 authenticated: false,
// // //                                 hasQR: false,
// // //                                 qr: null
// // //                             };
                            
// // //                             ws.send(JSON.stringify({
// // //                                 type: 'connected',
// // //                                 message: 'Connected to WhatsApp QR WebSocket',
// // //                                 clientId: clientId,
// // //                                 serverTime: new Date().toISOString(),
// // //                                 version: '1.0.0',
// // //                                 botStatus: {
// // //                                     connected: botStatus.connected,
// // //                                     authenticated: botStatus.authenticated,
// // //                                     hasQR: !!botStatus.qr,
// // //                                     qr: botStatus.qr
// // //                                 },
// // //                                 endpoint: 'qr' // Identify this as QR socket
// // //                             }));
// // //                         } catch (error) {
// // //                             console.log(`❌ Error sending welcome to ${clientId}:`, error.message);
// // //                         }
// // //                     }
// // //                 }, 100);
                
// // //                 ws.on('message', (message) => {
// // //                     try {
// // //                         const data = JSON.parse(message.toString());
// // //                         this.handleMessage(ws, data);
// // //                     } catch (error) {
// // //                         console.error('❌ QR WebSocket message parse error:', error);
// // //                         // Send error back to client
// // //                         if (ws.readyState === 1) {
// // //                             ws.send(JSON.stringify({
// // //                                 type: 'error',
// // //                                 message: 'Invalid message format',
// // //                                 timestamp: new Date().toISOString()
// // //                             }));
// // //                         }
// // //                     }
// // //                 });
                
// // //                 ws.on('close', (code, reason) => {
// // //                     const client = this.clients.get(ws);
// // //                     const duration = client ? Date.now() - client.connectedAt.getTime() : 0;
                    
// // //                     console.log(`🔌 QR WebSocket client disconnected: ${clientId}`, { 
// // //                         code, 
// // //                         reason: reason.toString() || 'No reason',
// // //                         duration: `${duration}ms`
// // //                     });
                    
// // //                     this.clients.delete(ws);
// // //                 });
                
// // //                 ws.on('error', (error) => {
// // //                     // SAFE error logging - won't crash
// // //                     try {
// // //                         console.error(`❌ QR WebSocket error for client ${clientId}:`, error.message);
// // //                     } catch {
// // //                         console.log(`❌ QR WebSocket error for client ${clientId}`);
// // //                     }
// // //                     this.clients.delete(ws);
// // //                 });
// // //             });
            
// // //             // Setup heartbeat interval for all clients
// // //             const heartbeatInterval = setInterval(() => {
// // //                 if (!this.wss) return;
                
// // //                 this.wss.clients.forEach((ws) => {
// // //                     if (ws.isAlive === false) {
// // //                         console.log('💔 Terminating stale QR WebSocket connection');
// // //                         return ws.terminate();
// // //                     }
                    
// // //                     ws.isAlive = false;
                    
// // //                     try {
// // //                         ws.ping();
// // //                     } catch (error) {
// // //                         // Safe error handling
// // //                         try {
// // //                             console.log('❌ Error in QR WebSocket heartbeat ping:', error.message);
// // //                         } catch {
// // //                             // Ignore logging errors
// // //                         }
// // //                     }
// // //                 });
// // //             }, 30000);
            
// // //             // Clear interval on server close
// // //             this.wss.on('close', () => {
// // //                 clearInterval(heartbeatInterval);
// // //             });
            
// // //             this.isInitialized = true;
            
// // //             const address = server.address();
// // //             if (address) {
// // //                 console.log('✅ QR WebSocket server initialized successfully');
// // //                 console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws/qr`);
// // //                 console.log(`📱 Connected to bot: ${this.bot ? 'YES' : 'NO'}`);
// // //             }
            
// // //         } catch (error) {
// // //             console.error('❌ Failed to initialize QR WebSocket server:', error.message);
// // //         }
// // //     }

// // //     // Clean up old rate limit entries
// // //     cleanupOldAttempts() {
// // //         const now = Date.now();
// // //         const minuteAgo = now - 60000;
        
// // //         this.connectionAttempts.forEach((attempts, ip) => {
// // //             const recentAttempts = attempts.filter(time => time > minuteAgo);
            
// // //             if (recentAttempts.length === 0) {
// // //                 this.connectionAttempts.delete(ip);
// // //             } else {
// // //                 this.connectionAttempts.set(ip, recentAttempts);
// // //             }
// // //         });
// // //     }

// // //     // Rate limiting method
// // //     checkRateLimit(ip) {
// // //         // Allow all local connections without rate limiting
// // //         if (ip.includes('localhost') || ip.includes('127.0.0.1') || 
// // //             ip.includes('::1') || ip.includes('192.168.') || 
// // //             ip.includes('10.0.')) {
// // //             return true;
// // //         }
        
// // //         const now = Date.now();
// // //         const minuteAgo = now - 60000;
        
// // //         if (!this.connectionAttempts.has(ip)) {
// // //             this.connectionAttempts.set(ip, []);
// // //         }
        
// // //         const attempts = this.connectionAttempts.get(ip);
// // //         const recentAttempts = attempts.filter(time => time > minuteAgo);
        
// // //         this.connectionAttempts.set(ip, [...recentAttempts, now]);
        
// // //         if (recentAttempts.length >= this.maxConnectionsPerMinute) {
// // //             return false;
// // //         }
        
// // //         return true;
// // //     }

// // //     handleMessage(ws, data) {
// // //         const client = this.clients.get(ws);
        
// // //         if (!data || !data.type) {
// // //             console.log(`📨 Received malformed message from QR client ${client?.id}`);
// // //             return;
// // //         }
        
// // //         const messageType = data.type.toLowerCase();
        
// // //         switch (messageType) {
// // //             case 'ping':
// // //                 if (ws.readyState === 1) {
// // //                     ws.send(JSON.stringify({
// // //                         type: 'pong',
// // //                         timestamp: new Date().toISOString(),
// // //                         clientId: client?.id
// // //                     }));
// // //                 }
// // //                 break;
                
// // //             case 'get_status':
// // //                 if (ws.readyState === 1) {
// // //                     const status = this.bot ? this.bot.getStatus() : {
// // //                         connected: false,
// // //                         authenticated: false,
// // //                         hasQR: false,
// // //                         qr: null
// // //                     };
                    
// // //                     ws.send(JSON.stringify({
// // //                         type: 'status',
// // //                         connected: status.connected,
// // //                         authenticated: status.authenticated,
// // //                         hasQR: !!status.qr,
// // //                         qr: status.qr,
// // //                         message: status.connected ? 'WhatsApp is connected' : 
// // //                                 status.qr ? 'QR code required' : 'Not connected',
// // //                         timestamp: new Date().toISOString()
// // //                     }));
// // //                 }
// // //                 break;
                
// // //             case 'get_qr':
// // //                 if (ws.readyState === 1) {
// // //                     const qr = this.bot ? this.bot.getCurrentQR() : null;
// // //                     ws.send(JSON.stringify({
// // //                         type: 'qr_response',
// // //                         qr: qr,
// // //                         hasQr: !!qr,
// // //                         timestamp: new Date().toISOString()
// // //                     }));
// // //                 }
// // //                 break;
                
// // //             case 'get_stats':
// // //                 if (ws.readyState === 1) {
// // //                     const stats = this.bot ? this.bot.getStatus()?.stats : {};
// // //                     ws.send(JSON.stringify({
// // //                         type: 'stats',
// // //                         stats: stats,
// // //                         timestamp: new Date().toISOString()
// // //                     }));
// // //                 }
// // //                 break;
                
// // //             case 'identify':
// // //                 if (ws.readyState === 1) {
// // //                     // Mark as authenticated
// // //                     if (client) {
// // //                         client.authenticated = true;
// // //                     }
                    
// // //                     ws.send(JSON.stringify({
// // //                         type: 'identified',
// // //                         clientId: client?.id,
// // //                         message: `QR client identified as: ${data.clientName || 'Unknown'}`,
// // //                         timestamp: new Date().toISOString()
// // //                     }));
// // //                 }
// // //                 break;
                
// // //             case 'authenticate':
// // //                 // Simple authentication for QR clients
// // //                 if (ws.readyState === 1) {
// // //                     const isValid = data.token === process.env.QR_CLIENT_TOKEN || 
// // //                                    data.token === 'dev-token-2024';
                    
// // //                     if (client) {
// // //                         client.authenticated = isValid;
// // //                     }
                    
// // //                     ws.send(JSON.stringify({
// // //                         type: isValid ? 'auth_success' : 'auth_failed',
// // //                         clientId: client?.id,
// // //                         message: isValid ? 'Authentication successful' : 'Authentication failed',
// // //                         timestamp: new Date().toISOString()
// // //                     }));
// // //                 }
// // //                 break;
                
// // //             default:
// // //                 console.log(`📨 Received ${data.type} from QR client ${client?.id}`);
// // //                 if (ws.readyState === 1) {
// // //                     ws.send(JSON.stringify({
// // //                         type: 'acknowledge',
// // //                         originalType: data.type,
// // //                         timestamp: new Date().toISOString(),
// // //                         clientId: client?.id,
// // //                         message: 'Message received'
// // //                     }));
// // //                 }
// // //         }
// // //     }

// // //     // ========== BROADCAST METHODS ==========

// // //     broadcastQR(qr) {
// // //         if (!qr) return;
        
// // //         const now = Date.now();
// // //         if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
// // //             return;
// // //         }
        
// // //         this.lastQrBroadcast = now;
// // //         this.broadcast({
// // //             type: 'qr_update',
// // //             qr: qr,
// // //             timestamp: new Date().toISOString(),
// // //             hasQr: true
// // //         });
// // //     }

// // //     broadcastStatus(status, message) {
// // //         const now = Date.now();
// // //         if (now - this.lastStatusBroadcast < this.statusBroadcastInterval && this.lastStatusBroadcast !== 0) {
// // //             return;
// // //         }
        
// // //         this.lastStatusBroadcast = now;
// // //         this.broadcast({
// // //             type: 'status_update',
// // //             status: status,
// // //             message: message || '',
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     }

// // //     broadcastStats(stats) {
// // //         if (!stats) return;
        
// // //         const now = Date.now();
// // //         if (now - this.lastStatsBroadcast < this.statsBroadcastInterval && this.lastStatsBroadcast !== 0) {
// // //             return;
// // //         }
        
// // //         this.lastStatsBroadcast = now;
// // //         this.broadcast({
// // //             type: 'stats_update',
// // //             stats: stats,
// // //             timestamp: new Date().toISOString()
// // //         }, true);
// // //     }

// // //     broadcastConnected() {
// // //         this.broadcast({
// // //             type: 'bot_connected',
// // //             message: 'WhatsApp connected successfully',
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     }

// // //     broadcastDisconnected(reason) {
// // //         this.broadcast({
// // //             type: 'bot_disconnected',
// // //             reason: reason || 'Unknown reason',
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     }

// // //     broadcast(data, suppressLog = false) {
// // //         if (!this.wss || !this.isInitialized) {
// // //             if (!suppressLog) {
// // //                 console.log('⚠️ QR WebSocket server not initialized');
// // //             }
// // //             return;
// // //         }

// // //         const message = JSON.stringify(data);
// // //         let sentCount = 0;
// // //         let errorCount = 0;
// // //         const clientsToDelete = [];

// // //         // Iterate through clients
// // //         this.clients.forEach((client, ws) => {
// // //             if (ws.readyState === 1) {
// // //                 try {
// // //                     ws.send(message);
// // //                     sentCount++;
// // //                 } catch (error) {
// // //                     if (!suppressLog) {
// // //                         try {
// // //                             console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
// // //                         } catch {
// // //                             console.log(`❌ Failed to send to QR client ${client.id}`);
// // //                         }
// // //                     }
// // //                     errorCount++;
// // //                     clientsToDelete.push(ws);
// // //                 }
// // //             } else {
// // //                 clientsToDelete.push(ws);
// // //             }
// // //         });

// // //         // Clean up dead connections
// // //         clientsToDelete.forEach(ws => {
// // //             this.clients.delete(ws);
// // //         });

// // //         if (sentCount > 0 && !suppressLog) {
// // //             console.log(`📤 QR Broadcast to ${sentCount} client(s): ${data.type}`);
// // //         }
        
// // //         if (errorCount > 0 && !suppressLog) {
// // //             console.log(`⚠️ Failed to send to ${errorCount} QR client(s)`);
// // //         }
// // //     }

// // //     // ========== UTILITY METHODS ==========

// // //     getClientCount() {
// // //         return this.clients.size;
// // //     }

// // //     getClientInfo() {
// // //         const info = [];
// // //         const now = Date.now();
        
// // //         this.clients.forEach((client, ws) => {
// // //             info.push({
// // //                 id: client.id,
// // //                 ip: client.ip,
// // //                 userAgent: client.userAgent?.substring(0, 50) || 'Unknown',
// // //                 connectedAt: client.connectedAt,
// // //                 connectionDuration: now - client.connectedAt.getTime(),
// // //                 readyState: ws.readyState,
// // //                 isAlive: ws.isAlive === true,
// // //                 isLocalhost: client.isLocalhost || false,
// // //                 authenticated: client.authenticated || false
// // //             });
// // //         });
// // //         return info;
// // //     }

// // //     getConnectionStats() {
// // //         return {
// // //             totalConnections: this.connectionCounter,
// // //             activeConnections: this.clients.size,
// // //             authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length,
// // //             localhostConnections: Array.from(this.clients.values()).filter(c => c.isLocalhost).length
// // //         };
// // //     }

// // //     close() {
// // //         if (this.wss) {
// // //             console.log('🛑 Closing QR WebSocket server...');
// // //             console.log(`Active connections: ${this.clients.size}`);
            
// // //             this.clients.forEach((client, ws) => {
// // //                 if (ws.readyState === 1) {
// // //                     ws.close(1000, 'Server shutting down');
// // //                 }
// // //             });
            
// // //             this.clients.clear();
// // //             this.wss.close();
// // //             this.isInitialized = false;
            
// // //             if (this.cleanupInterval) {
// // //                 clearInterval(this.cleanupInterval);
// // //             }
            
// // //             console.log('✅ QR WebSocket server closed gracefully');
// // //         }
// // //     }
// // // }

// // // // Create singleton instance
// // // const qrSocketServer = new QRSocketServer();
// // // export { qrSocketServer };



















// // // services/qrSocketServer.js - PROFESSIONAL MULTI-TENANT VERSION
// // // Handles QR code WebSocket connections with company isolation

// // import { WebSocketServer } from 'ws';

// // class QRSocketServer {
// //     constructor() {
// //         this.wss = null;
// //         this.clients = new Map(); // ws -> { id, companyId, metadata }
// //         this.isInitialized = false;
        
// //         // Add throttling variables
// //         this.lastStatsBroadcast = 0;
// //         this.statsBroadcastInterval = 5000;
        
// //         this.lastQrBroadcast = 0;
// //         this.qrBroadcastInterval = 2000;
        
// //         this.lastStatusBroadcast = 0;
// //         this.statusBroadcastInterval = 3000;
        
// //         // Rate limiting for connections
// //         this.connectionAttempts = new Map();
// //         this.maxConnectionsPerMinute = 1000;
// //         this.connectionCounter = 0;
// //         this.statsBroadcastCount = 0;
        
// //         // Session Manager reference (will be set from server.js)
// //         this.sessionManager = null;
        
// //         // Company-specific QR data cache
// //         this.companyQRs = new Map(); // companyId -> { qr, expiresAt }
        
// //         // Cleanup interval for old rate limit entries
// //         this.cleanupInterval = setInterval(() => {
// //             this.cleanupOldAttempts();
// //         }, 60000);
        
// //         // Cleanup expired QR codes
// //         this.qrCleanupInterval = setInterval(() => {
// //             this.cleanupExpiredQRs();
// //         }, 10000);
// //     }

// //     // Set session manager reference
// //     setSessionManager(manager) {
// //         this.sessionManager = manager;
// //         console.log('📱 Session Manager set in QR Socket Server');
// //     }

// //     initialize(server, sessionManager = null) {
// //         if (this.isInitialized) {
// //             console.log('📡 QR WebSocket server already initialized');
// //             return;
// //         }

// //         // Set session manager if provided
// //         if (sessionManager) {
// //             this.sessionManager = sessionManager;
// //         }

// //         try {
// //             // Validate server is listening
// //             if (!server.listening) {
// //                 console.error('❌ HTTP server is not listening yet');
// //                 return;
// //             }

// //             // Use path '/ws/qr' to avoid conflicts with notification server
// //             this.wss = new WebSocketServer({ 
// //                 server, 
// //                 path: '/ws/qr',
// //                 clientTracking: true,
// //                 perMessageDeflate: false,
// //                 maxPayload: 1048576
// //             });
            
// //             this.wss.on('connection', (ws, req) => {
// //                 this.handleConnection(ws, req);
// //             });
            
// //             // Setup heartbeat interval for all clients
// //             const heartbeatInterval = setInterval(() => {
// //                 if (!this.wss) return;
                
// //                 this.wss.clients.forEach((ws) => {
// //                     if (ws.isAlive === false) {
// //                         console.log('💔 Terminating stale QR WebSocket connection');
// //                         return ws.terminate();
// //                     }
                    
// //                     ws.isAlive = false;
                    
// //                     try {
// //                         ws.ping();
// //                     } catch (error) {
// //                         // Safe error handling
// //                     }
// //                 });
// //             }, 30000);
            
// //             // Clear interval on server close
// //             this.wss.on('close', () => {
// //                 clearInterval(heartbeatInterval);
// //             });
            
// //             this.isInitialized = true;
            
// //             const address = server.address();
// //             if (address) {
// //                 console.log('✅ QR WebSocket server initialized successfully');
// //                 console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws/qr`);
// //                 console.log(`📱 Connected to Session Manager: ${this.sessionManager ? 'YES' : 'NO'}`);
// //             }
            
// //         } catch (error) {
// //             console.error('❌ Failed to initialize QR WebSocket server:', error.message);
// //         }
// //     }

// //     /**
// //      * Handle new WebSocket connection
// //      */
// //     handleConnection(ws, req) {
// //         this.connectionCounter++;
// //         const clientId = Date.now().toString() + '_' + this.connectionCounter;
// //         const clientIp = req.socket.remoteAddress || 'unknown';
// //         const userAgent = req.headers['user-agent'] || 'Unknown';
        
// //         // Extract companyId from query string (if provided)
// //         const url = new URL(req.url, `http://${req.headers.host}`);
// //         const companyId = url.searchParams.get('companyId') || null;
        
// //         console.log(`🔗 New QR WebSocket client: ${clientId} from ${clientIp} for company: ${companyId || 'unknown'}`);
        
// //         // Store client with company context
// //         this.clients.set(ws, {
// //             id: clientId,
// //             companyId: companyId,
// //             connectedAt: new Date(),
// //             ip: clientIp,
// //             userAgent: userAgent,
// //             isAlive: true,
// //             authenticated: false
// //         });
        
// //         // Setup heartbeat detection
// //         ws.isAlive = true;
        
// //         ws.on('pong', () => {
// //             ws.isAlive = true;
// //         });
        
// //         // Send welcome message with initial status
// //         setTimeout(() => {
// //             if (ws.readyState === 1) {
// //                 try {
// //                     // Get current QR for this company from session manager
// //                     let qrData = null;
// //                     if (this.sessionManager && companyId) {
// //                         const session = this.sessionManager.getSessionStatus(companyId);
// //                         qrData = session?.qrData || null;
// //                     }
                    
// //                     ws.send(JSON.stringify({
// //                         type: 'connected',
// //                         message: 'Connected to WhatsApp QR WebSocket',
// //                         clientId: clientId,
// //                         companyId: companyId,
// //                         serverTime: new Date().toISOString(),
// //                         version: '1.0.0',
// //                         qrData: qrData,
// //                         endpoint: 'qr'
// //                     }));
// //                 } catch (error) {
// //                     console.log(`❌ Error sending welcome to ${clientId}:`, error.message);
// //                 }
// //             }
// //         }, 100);
        
// //         ws.on('message', (message) => {
// //             try {
// //                 const data = JSON.parse(message.toString());
// //                 this.handleMessage(ws, data);
// //             } catch (error) {
// //                 console.error('❌ QR WebSocket message parse error:', error);
// //                 if (ws.readyState === 1) {
// //                     ws.send(JSON.stringify({
// //                         type: 'error',
// //                         message: 'Invalid message format',
// //                         timestamp: new Date().toISOString()
// //                     }));
// //                 }
// //             }
// //         });
        
// //         ws.on('close', (code, reason) => {
// //             const client = this.clients.get(ws);
// //             const duration = client ? Date.now() - client.connectedAt.getTime() : 0;
            
// //             console.log(`🔌 QR WebSocket client disconnected: ${clientId} for company: ${client?.companyId || 'unknown'}`, { 
// //                 code, 
// //                 reason: reason.toString() || 'No reason',
// //                 duration: `${duration}ms`
// //             });
            
// //             this.clients.delete(ws);
// //         });
        
// //         ws.on('error', (error) => {
// //             console.error(`❌ QR WebSocket error for client ${clientId}:`, error.message);
// //             this.clients.delete(ws);
// //         });
// //     }

// //     /**
// //      * Handle incoming messages
// //      */
// //     handleMessage(ws, data) {
// //         const client = this.clients.get(ws);
        
// //         if (!data || !data.type) {
// //             console.log(`📨 Received malformed message from QR client ${client?.id}`);
// //             return;
// //         }
        
// //         const messageType = data.type.toLowerCase();
        
// //         switch (messageType) {
// //             case 'ping':
// //                 if (ws.readyState === 1) {
// //                     ws.send(JSON.stringify({
// //                         type: 'pong',
// //                         timestamp: new Date().toISOString(),
// //                         clientId: client?.id
// //                     }));
// //                 }
// //                 break;
                
// //             case 'get_status':
// //                 if (ws.readyState === 1) {
// //                     const companyId = client?.companyId || data.companyId;
// //                     let status = { connected: false, authenticated: false, hasQR: false, qr: null };
                    
// //                     if (this.sessionManager && companyId) {
// //                         const sessionStatus = this.sessionManager.getSessionStatus(companyId);
// //                         status = {
// //                             connected: sessionStatus?.connected || false,
// //                             authenticated: sessionStatus?.status === 'connected',
// //                             hasQR: !!sessionStatus?.qrData,
// //                             qr: sessionStatus?.qrData
// //                         };
// //                     }
                    
// //                     ws.send(JSON.stringify({
// //                         type: 'status',
// //                         connected: status.connected,
// //                         authenticated: status.authenticated,
// //                         hasQR: status.hasQR,
// //                         qr: status.qr,
// //                         companyId: companyId,
// //                         message: status.connected ? 'WhatsApp is connected' : 
// //                                 status.hasQR ? 'QR code required' : 'Not connected',
// //                         timestamp: new Date().toISOString()
// //                     }));
// //                 }
// //                 break;
                
// //             case 'get_qr':
// //                 if (ws.readyState === 1) {
// //                     const companyId = client?.companyId || data.companyId;
// //                     let qr = null;
                    
// //                     if (this.sessionManager && companyId) {
// //                         const session = this.sessionManager.getSessionStatus(companyId);
// //                         qr = session?.qrData || null;
// //                     }
                    
// //                     ws.send(JSON.stringify({
// //                         type: 'qr_response',
// //                         qr: qr,
// //                         hasQr: !!qr,
// //                         companyId: companyId,
// //                         timestamp: new Date().toISOString()
// //                     }));
// //                 }
// //                 break;
                
// //             case 'get_stats':
// //                 if (ws.readyState === 1) {
// //                     const stats = this.sessionManager ? this.sessionManager.getStats() : {};
// //                     ws.send(JSON.stringify({
// //                         type: 'stats',
// //                         stats: stats,
// //                         timestamp: new Date().toISOString()
// //                     }));
// //                 }
// //                 break;
                
// //             case 'identify':
// //                 if (ws.readyState === 1) {
// //                     if (client) {
// //                         client.authenticated = true;
// //                         if (data.companyId) {
// //                             client.companyId = data.companyId;
// //                         }
// //                     }
                    
// //                     ws.send(JSON.stringify({
// //                         type: 'identified',
// //                         clientId: client?.id,
// //                         companyId: client?.companyId,
// //                         message: `QR client identified as: ${data.clientName || 'Unknown'}`,
// //                         timestamp: new Date().toISOString()
// //                     }));
// //                 }
// //                 break;
                
// //             case 'authenticate':
// //                 if (ws.readyState === 1) {
// //                     const isValid = data.token === process.env.QR_CLIENT_TOKEN || 
// //                                    data.token === 'dev-token-2024';
                    
// //                     if (client) {
// //                         client.authenticated = isValid;
// //                         if (data.companyId) {
// //                             client.companyId = data.companyId;
// //                         }
// //                     }
                    
// //                     ws.send(JSON.stringify({
// //                         type: isValid ? 'auth_success' : 'auth_failed',
// //                         clientId: client?.id,
// //                         companyId: client?.companyId,
// //                         message: isValid ? 'Authentication successful' : 'Authentication failed',
// //                         timestamp: new Date().toISOString()
// //                     }));
// //                 }
// //                 break;
                
// //             default:
// //                 console.log(`📨 Received ${data.type} from QR client ${client?.id}`);
// //                 if (ws.readyState === 1) {
// //                     ws.send(JSON.stringify({
// //                         type: 'acknowledge',
// //                         originalType: data.type,
// //                         timestamp: new Date().toISOString(),
// //                         clientId: client?.id,
// //                         message: 'Message received'
// //                     }));
// //                 }
// //         }
// //     }

// //     // ========== BROADCAST METHODS WITH COMPANY ISOLATION ==========

// //     /**
// //      * Broadcast QR code to clients for a specific company
// //      * @param {string} companyId - Company ID
// //      * @param {Object} qrData - QR code data
// //      */
// //     broadcastQR(companyId, qrData) {
// //         if (!companyId || !qrData) return;
        
// //         const now = Date.now();
// //         if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
// //             return;
// //         }
        
// //         // Store in company cache
// //         this.companyQRs.set(companyId, {
// //             qr: qrData,
// //             expiresAt: now + 60000 // 60 seconds
// //         });
        
// //         this.lastQrBroadcast = now;
        
// //         // Broadcast only to clients viewing this company
// //         this.broadcastToCompany(companyId, {
// //             type: 'qr_update',
// //             qr: qrData,
// //             companyId: companyId,
// //             timestamp: new Date().toISOString(),
// //             hasQr: true
// //         });
// //     }

// //     /**
// //      * Broadcast status update to clients for a specific company
// //      * @param {string} companyId - Company ID
// //      * @param {string} status - Status string
// //      * @param {string} message - Status message
// //      */
// //     broadcastStatus(companyId, status, message) {
// //         if (!companyId) return;
        
// //         const now = Date.now();
// //         if (now - this.lastStatusBroadcast < this.statusBroadcastInterval && this.lastStatusBroadcast !== 0) {
// //             return;
// //         }
        
// //         this.lastStatusBroadcast = now;
        
// //         this.broadcastToCompany(companyId, {
// //             type: 'status_update',
// //             status: status,
// //             message: message || '',
// //             companyId: companyId,
// //             timestamp: new Date().toISOString()
// //         });
// //     }

// //     /**
// //      * Broadcast statistics to all connected clients
// //      * @param {Object} stats - Statistics object
// //      */
// //     broadcastStats(stats) {
// //         if (!stats) return;
        
// //         const now = Date.now();
// //         if (now - this.lastStatsBroadcast < this.statsBroadcastInterval && this.lastStatsBroadcast !== 0) {
// //             return;
// //         }
        
// //         this.lastStatsBroadcast = now;
        
// //         // Broadcast to all clients (stats are global)
// //         this.broadcastToAll({
// //             type: 'stats_update',
// //             stats: stats,
// //             timestamp: new Date().toISOString()
// //         }, true);
// //     }

// //     /**
// //      * Broadcast connected status to all clients
// //      * @param {string} companyId - Company ID
// //      */
// //     broadcastConnected(companyId) {
// //         this.broadcastToCompany(companyId, {
// //             type: 'bot_connected',
// //             companyId: companyId,
// //             message: 'WhatsApp connected successfully',
// //             timestamp: new Date().toISOString()
// //         });
// //     }

// //     /**
// //      * Broadcast disconnected status to all clients
// //      * @param {string} companyId - Company ID
// //      * @param {string} reason - Disconnect reason
// //      */
// //     broadcastDisconnected(companyId, reason) {
// //         this.broadcastToCompany(companyId, {
// //             type: 'bot_disconnected',
// //             companyId: companyId,
// //             reason: reason || 'Unknown reason',
// //             timestamp: new Date().toISOString()
// //         });
// //     }

// //     /**
// //      * Broadcast message to all clients of a specific company
// //      * @param {string} companyId - Company ID
// //      * @param {Object} data - Message data
// //      * @param {boolean} suppressLog - Suppress logging
// //      */
// //     broadcastToCompany(companyId, data, suppressLog = false) {
// //         if (!this.wss || !this.isInitialized) return;

// //         const message = JSON.stringify(data);
// //         let sentCount = 0;
// //         const clientsToDelete = [];

// //         this.clients.forEach((client, ws) => {
// //             // Only send to clients for this company
// //             if (client.companyId === companyId && ws.readyState === 1) {
// //                 try {
// //                     ws.send(message);
// //                     sentCount++;
// //                 } catch (error) {
// //                     if (!suppressLog) {
// //                         console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
// //                     }
// //                     clientsToDelete.push(ws);
// //                 }
// //             } else if (ws.readyState !== 1) {
// //                 clientsToDelete.push(ws);
// //             }
// //         });

// //         // Clean up dead connections
// //         clientsToDelete.forEach(ws => {
// //             this.clients.delete(ws);
// //         });

// //         if (sentCount > 0 && !suppressLog) {
// //             console.log(`📤 QR Broadcast to ${sentCount} client(s) for company ${companyId}: ${data.type}`);
// //         }
// //     }

// //     /**
// //      * Broadcast message to all clients (global)
// //      * @param {Object} data - Message data
// //      * @param {boolean} suppressLog - Suppress logging
// //      */
// //     broadcastToAll(data, suppressLog = false) {
// //         if (!this.wss || !this.isInitialized) return;

// //         const message = JSON.stringify(data);
// //         let sentCount = 0;
// //         const clientsToDelete = [];

// //         this.clients.forEach((client, ws) => {
// //             if (ws.readyState === 1) {
// //                 try {
// //                     ws.send(message);
// //                     sentCount++;
// //                 } catch (error) {
// //                     if (!suppressLog) {
// //                         console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
// //                     }
// //                     clientsToDelete.push(ws);
// //                 }
// //             } else {
// //                 clientsToDelete.push(ws);
// //             }
// //         });

// //         // Clean up dead connections
// //         clientsToDelete.forEach(ws => {
// //             this.clients.delete(ws);
// //         });

// //         if (sentCount > 0 && !suppressLog) {
// //             console.log(`📤 Global QR Broadcast to ${sentCount} client(s): ${data.type}`);
// //         }
// //     }

// //     // ========== UTILITY METHODS ==========

// //     /**
// //      * Clean up expired QR codes
// //      */
// //     cleanupExpiredQRs() {
// //         const now = Date.now();
// //         let removed = 0;
        
// //         this.companyQRs.forEach((data, companyId) => {
// //             if (data.expiresAt < now) {
// //                 this.companyQRs.delete(companyId);
// //                 removed++;
// //             }
// //         });
        
// //         if (removed > 0) {
// //             console.log(`🧹 Cleaned up ${removed} expired QR codes`);
// //         }
// //     }

// //     /**
// //      * Clean up old rate limit entries
// //      */
// //     cleanupOldAttempts() {
// //         const now = Date.now();
// //         const minuteAgo = now - 60000;
        
// //         this.connectionAttempts.forEach((attempts, ip) => {
// //             const recentAttempts = attempts.filter(time => time > minuteAgo);
            
// //             if (recentAttempts.length === 0) {
// //                 this.connectionAttempts.delete(ip);
// //             } else {
// //                 this.connectionAttempts.set(ip, recentAttempts);
// //             }
// //         });
// //     }

// //     /**
// //      * Check rate limit for IP
// //      */
// //     checkRateLimit(ip) {
// //         // Allow all local connections without rate limiting
// //         if (ip.includes('localhost') || ip.includes('127.0.0.1') || 
// //             ip.includes('::1') || ip.includes('192.168.') || 
// //             ip.includes('10.0.')) {
// //             return true;
// //         }
        
// //         const now = Date.now();
// //         const minuteAgo = now - 60000;
        
// //         if (!this.connectionAttempts.has(ip)) {
// //             this.connectionAttempts.set(ip, []);
// //         }
        
// //         const attempts = this.connectionAttempts.get(ip);
// //         const recentAttempts = attempts.filter(time => time > minuteAgo);
        
// //         this.connectionAttempts.set(ip, [...recentAttempts, now]);
        
// //         if (recentAttempts.length >= this.maxConnectionsPerMinute) {
// //             return false;
// //         }
        
// //         return true;
// //     }

// //     /**
// //      * Get client count
// //      */
// //     getClientCount() {
// //         return this.clients.size;
// //     }

// //     /**
// //      * Get client info grouped by company
// //      */
// //     getClientInfo() {
// //         const info = [];
// //         const now = Date.now();
        
// //         this.clients.forEach((client, ws) => {
// //             info.push({
// //                 id: client.id,
// //                 companyId: client.companyId,
// //                 ip: client.ip,
// //                 userAgent: client.userAgent?.substring(0, 50) || 'Unknown',
// //                 connectedAt: client.connectedAt,
// //                 connectionDuration: now - client.connectedAt.getTime(),
// //                 readyState: ws.readyState,
// //                 isAlive: ws.isAlive === true,
// //                 authenticated: client.authenticated || false
// //             });
// //         });
// //         return info;
// //     }

// //     /**
// //      * Get connection statistics
// //      */
// //     getConnectionStats() {
// //         const companies = new Map();
        
// //         this.clients.forEach(client => {
// //             const compId = client.companyId || 'unknown';
// //             companies.set(compId, (companies.get(compId) || 0) + 1);
// //         });
        
// //         return {
// //             totalConnections: this.connectionCounter,
// //             activeConnections: this.clients.size,
// //             authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length,
// //             byCompany: Object.fromEntries(companies)
// //         };
// //     }

// //     /**
// //      * Close server gracefully
// //      */
// //     close() {
// //         if (this.wss) {
// //             console.log('🛑 Closing QR WebSocket server...');
// //             console.log(`Active connections: ${this.clients.size}`);
            
// //             this.clients.forEach((client, ws) => {
// //                 if (ws.readyState === 1) {
// //                     ws.close(1000, 'Server shutting down');
// //                 }
// //             });
            
// //             this.clients.clear();
// //             this.wss.close();
// //             this.isInitialized = false;
            
// //             if (this.cleanupInterval) {
// //                 clearInterval(this.cleanupInterval);
// //             }
            
// //             if (this.qrCleanupInterval) {
// //                 clearInterval(this.qrCleanupInterval);
// //             }
            
// //             console.log('✅ QR WebSocket server closed gracefully');
// //         }
// //     }
// // }

// // // Create singleton instance
// // const qrSocketServer = new QRSocketServer();
// // export { qrSocketServer };





























// // services/qrSocketServer.js - PROFESSIONAL MULTI-TENANT VERSION - FIXED
// // Handles QR code WebSocket connections with company isolation

// import { WebSocketServer } from 'ws';
// import url from 'url'; // ✅ ADDED: For URL parsing

// class QRSocketServer {
//     constructor() {
//         this.wss = null;
//         this.clients = new Map(); // ws -> { id, companyId, metadata }
//         this.isInitialized = false;
        
//         // Add throttling variables
//         this.lastStatsBroadcast = 0;
//         this.statsBroadcastInterval = 5000;
        
//         this.lastQrBroadcast = 0;
//         this.qrBroadcastInterval = 2000;
        
//         this.lastStatusBroadcast = 0;
//         this.statusBroadcastInterval = 3000;
        
//         // Rate limiting for connections
//         this.connectionAttempts = new Map();
//         this.maxConnectionsPerMinute = 1000;
//         this.connectionCounter = 0;
//         this.statsBroadcastCount = 0;
        
//         // Session Manager reference (will be set from server.js)
//         this.sessionManager = null;
        
//         // ✅ ADDED: Bot reference for direct access
//         this.bot = null;
        
//         // ✅ ADDED: Socket.IO reference for cross-namespace communication
//         this.io = null;
        
//         // Company-specific QR data cache
//         this.companyQRs = new Map(); // companyId -> { qr, expiresAt }
        
//         // ✅ ADDED: Heartbeat interval reference
//         this.heartbeatInterval = null;
        
//         // Cleanup interval for old rate limit entries
//         this.cleanupInterval = setInterval(() => {
//             this.cleanupOldAttempts();
//         }, 60000);
        
//         // Cleanup expired QR codes
//         this.qrCleanupInterval = setInterval(() => {
//             this.cleanupExpiredQRs();
//         }, 10000);
//     }

//     // Set session manager reference
//     setSessionManager(manager) {
//         this.sessionManager = manager;
//         console.log('📱 Session Manager set in QR Socket Server');
//     }

//     // ✅ ADDED: Set bot reference
//     setBot(botInstance) {
//         this.bot = botInstance;
//         console.log('🤖 Bot set in QR Socket Server');
//     }

//     // ✅ ADDED: Set Socket.IO reference
//     setIO(ioInstance) {
//         this.io = ioInstance;
//         console.log('🔌 Socket.IO set in QR Socket Server');
//     }

//     initialize(server, bot = null, io = null) {
//         if (this.isInitialized) {
//             console.log('📡 QR WebSocket server already initialized');
//             return;
//         }

//         // Set bot and io if provided
//         if (bot) {
//             this.bot = bot;
//         }
//         if (io) {
//             this.io = io;
//         }

//         try {
//             // Validate server is listening
//             if (!server.listening) {
//                 console.error('❌ HTTP server is not listening yet');
//                 return;
//             }

//             // Use path '/ws/qr' to avoid conflicts with notification server
//             this.wss = new WebSocketServer({ 
//                 server, 
//                 path: '/ws/qr',
//                 clientTracking: true,
//                 perMessageDeflate: false,
//                 maxPayload: 1048576
//             });
            
//             this.wss.on('connection', (ws, req) => {
//                 this.handleConnection(ws, req);
//             });
            
//             // Setup heartbeat interval for all clients
//             this.heartbeatInterval = setInterval(() => {
//                 if (!this.wss) return;
                
//                 this.wss.clients.forEach((ws) => {
//                     if (ws.isAlive === false) {
//                         console.log('💔 Terminating stale QR WebSocket connection');
//                         return ws.terminate();
//                     }
                    
//                     ws.isAlive = false;
                    
//                     try {
//                         ws.ping();
//                     } catch (error) {
//                         // Safe error handling
//                     }
//                 });
//             }, 30000);
            
//             // Clear interval on server close
//             this.wss.on('close', () => {
//                 if (this.heartbeatInterval) {
//                     clearInterval(this.heartbeatInterval);
//                     this.heartbeatInterval = null;
//                 }
//             });
            
//             this.isInitialized = true;
            
//             const address = server.address();
//             if (address) {
//                 console.log('✅ QR WebSocket server initialized successfully');
//                 console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws/qr`);
//                 console.log(`📱 Connected to Session Manager: ${this.sessionManager ? 'YES' : 'NO'}`);
//                 console.log(`🤖 Connected to Bot: ${this.bot ? 'YES' : 'NO'}`);
//                 console.log(`🔌 Connected to Socket.IO: ${this.io ? 'YES' : 'NO'}`);
//             }
            
//         } catch (error) {
//             console.error('❌ Failed to initialize QR WebSocket server:', error.message);
//         }
//     }

//     /**
//      * Handle new WebSocket connection
//      */
//     handleConnection(ws, req) {
//         this.connectionCounter++;
//         const clientId = Date.now().toString() + '_' + this.connectionCounter;
//         const clientIp = req.socket.remoteAddress || 'unknown';
//         const userAgent = req.headers['user-agent'] || 'Unknown';
        
//         // Extract companyId from query string (if provided)
//         const parsedUrl = url.parse(req.url, true);
//         const companyId = parsedUrl.query.companyId || null;
        
//         console.log(`🔗 New QR WebSocket client: ${clientId} from ${clientIp} for company: ${companyId || 'unknown'}`);
        
//         // Store client with company context
//         this.clients.set(ws, {
//             id: clientId,
//             companyId: companyId,
//             connectedAt: new Date(),
//             ip: clientIp,
//             userAgent: userAgent,
//             isAlive: true,
//             authenticated: false,
//             lastPing: Date.now()
//         });
        
//         // Setup heartbeat detection
//         ws.isAlive = true;
        
//         ws.on('pong', () => {
//             ws.isAlive = true;
//             const client = this.clients.get(ws);
//             if (client) {
//                 client.lastPing = Date.now();
//             }
//         });
        
//         // Send welcome message with initial status
//         setTimeout(() => {
//             if (ws.readyState === 1) {
//                 try {
//                     // Get current QR for this company from session manager
//                     let qrData = null;
//                     let connectionStatus = 'disconnected';
//                     let isConnected = false;
                    
//                     if (this.sessionManager && companyId) {
//                         const session = this.sessionManager.getSessionStatus(companyId);
//                         qrData = session?.qrData || null;
//                         connectionStatus = session?.status || 'disconnected';
//                         isConnected = session?.connected || false;
//                     } else if (this.bot && companyId) {
//                         // Fallback to bot if session manager not available
//                         const botStatus = this.bot.getStatus();
//                         if (botStatus.companyId === companyId) {
//                             qrData = botStatus.qrData?.qr || null;
//                             connectionStatus = botStatus.connected ? 'connected' : 
//                                               botStatus.hasQR ? 'qr_required' : 'disconnected';
//                             isConnected = botStatus.connected;
//                         }
//                     }
                    
//                     ws.send(JSON.stringify({
//                         type: 'connected',
//                         message: 'Connected to WhatsApp QR WebSocket',
//                         clientId: clientId,
//                         companyId: companyId,
//                         serverTime: new Date().toISOString(),
//                         version: '1.0.0',
//                         qrData: qrData,
//                         status: connectionStatus,
//                         connected: isConnected,
//                         endpoint: 'qr'
//                     }));
                    
//                     console.log(`✅ Welcome sent to QR client ${clientId} for company: ${companyId}`);
//                 } catch (error) {
//                     console.log(`❌ Error sending welcome to ${clientId}:`, error.message);
//                 }
//             }
//         }, 100);
        
//         ws.on('message', (message) => {
//             try {
//                 const data = JSON.parse(message.toString());
//                 this.handleMessage(ws, data);
//             } catch (error) {
//                 console.error('❌ QR WebSocket message parse error:', error);
//                 if (ws.readyState === 1) {
//                     ws.send(JSON.stringify({
//                         type: 'error',
//                         message: 'Invalid message format',
//                         timestamp: new Date().toISOString()
//                     }));
//                 }
//             }
//         });
        
//         ws.on('close', (code, reason) => {
//             const client = this.clients.get(ws);
//             const duration = client ? Date.now() - client.connectedAt.getTime() : 0;
            
//             console.log(`🔌 QR WebSocket client disconnected: ${clientId} for company: ${client?.companyId || 'unknown'}`, { 
//                 code, 
//                 reason: reason.toString() || 'No reason',
//                 duration: `${duration}ms`
//             });
            
//             this.clients.delete(ws);
//         });
        
//         ws.on('error', (error) => {
//             console.error(`❌ QR WebSocket error for client ${clientId}:`, error.message);
//             this.clients.delete(ws);
//         });
//     }

//     /**
//      * Handle incoming messages
//      */
//     handleMessage(ws, data) {
//         const client = this.clients.get(ws);
        
//         if (!data || !data.type) {
//             console.log(`📨 Received malformed message from QR client ${client?.id}`);
//             return;
//         }
        
//         const messageType = data.type.toLowerCase();
        
//         switch (messageType) {
//             case 'ping':
//                 if (ws.readyState === 1) {
//                     ws.send(JSON.stringify({
//                         type: 'pong',
//                         timestamp: new Date().toISOString(),
//                         clientId: client?.id,
//                         serverTime: Date.now()
//                     }));
//                 }
//                 break;
                
//             case 'get_status':
//                 if (ws.readyState === 1) {
//                     const companyId = client?.companyId || data.companyId;
//                     let status = { connected: false, authenticated: false, hasQR: false, qr: null };
//                     let message = 'Not connected';
                    
//                     if (this.sessionManager && companyId) {
//                         const sessionStatus = this.sessionManager.getSessionStatus(companyId);
//                         status = {
//                             connected: sessionStatus?.connected || false,
//                             authenticated: sessionStatus?.status === 'connected',
//                             hasQR: !!sessionStatus?.qrData,
//                             qr: sessionStatus?.qrData
//                         };
//                         message = status.connected ? 'WhatsApp is connected' : 
//                                  status.hasQR ? 'QR code required' : 'Not connected';
//                     } else if (this.bot && companyId) {
//                         const botStatus = this.bot.getStatus();
//                         if (botStatus.companyId === companyId) {
//                             status = {
//                                 connected: botStatus.connected || false,
//                                 authenticated: botStatus.authenticated || false,
//                                 hasQR: !!botStatus.qrData,
//                                 qr: botStatus.qrData?.qr || null
//                             };
//                             message = status.connected ? 'WhatsApp is connected' : 
//                                      status.hasQR ? 'QR code required' : 'Not connected';
//                         }
//                     }
                    
//                     ws.send(JSON.stringify({
//                         type: 'status',
//                         connected: status.connected,
//                         authenticated: status.authenticated,
//                         hasQR: status.hasQR,
//                         qr: status.qr,
//                         companyId: companyId,
//                         message: message,
//                         timestamp: new Date().toISOString()
//                     }));
//                 }
//                 break;
                
//             case 'get_qr':
//                 if (ws.readyState === 1) {
//                     const companyId = client?.companyId || data.companyId;
//                     let qr = null;
                    
//                     if (this.sessionManager && companyId) {
//                         const session = this.sessionManager.getSessionStatus(companyId);
//                         qr = session?.qrData || null;
//                     } else if (this.bot && companyId) {
//                         const botStatus = this.bot.getStatus();
//                         if (botStatus.companyId === companyId) {
//                             qr = botStatus.qrData?.qr || null;
//                         }
//                     }
                    
//                     ws.send(JSON.stringify({
//                         type: 'qr_response',
//                         qr: qr,
//                         hasQr: !!qr,
//                         companyId: companyId,
//                         timestamp: new Date().toISOString()
//                     }));
//                 }
//                 break;
                
//             case 'get_stats':
//                 if (ws.readyState === 1) {
//                     let stats = {};
//                     if (this.sessionManager) {
//                         stats = this.sessionManager.getStats();
//                     } else if (this.bot) {
//                         const botStatus = this.bot.getStatus();
//                         stats = botStatus.stats || {};
//                     }
                    
//                     ws.send(JSON.stringify({
//                         type: 'stats',
//                         stats: stats,
//                         timestamp: new Date().toISOString()
//                     }));
//                 }
//                 break;
                
//             case 'identify':
//                 if (ws.readyState === 1) {
//                     if (client) {
//                         client.authenticated = true;
//                         if (data.companyId) {
//                             client.companyId = data.companyId;
//                             console.log(`🏢 QR client ${client.id} identified for company: ${data.companyId}`);
//                         }
//                     }
                    
//                     ws.send(JSON.stringify({
//                         type: 'identified',
//                         clientId: client?.id,
//                         companyId: client?.companyId,
//                         message: `QR client identified as: ${data.clientName || 'Unknown'}`,
//                         timestamp: new Date().toISOString()
//                     }));
//                 }
//                 break;
                
//             case 'authenticate':
//                 if (ws.readyState === 1) {
//                     const isValid = data.token === process.env.QR_CLIENT_TOKEN || 
//                                    data.token === 'dev-token-2024' ||
//                                    data.token === process.env.NOTIFICATION_API_KEY;
                    
//                     if (client) {
//                         client.authenticated = isValid;
//                         if (data.companyId) {
//                             client.companyId = data.companyId;
//                         }
//                     }
                    
//                     ws.send(JSON.stringify({
//                         type: isValid ? 'auth_success' : 'auth_failed',
//                         clientId: client?.id,
//                         companyId: client?.companyId,
//                         message: isValid ? 'Authentication successful' : 'Authentication failed',
//                         timestamp: new Date().toISOString()
//                     }));
                    
//                     if (isValid) {
//                         console.log(`✅ QR client ${client?.id} authenticated successfully for company: ${client?.companyId}`);
//                     }
//                 }
//                 break;
                
//             default:
//                 console.log(`📨 Received ${data.type} from QR client ${client?.id}`);
//                 if (ws.readyState === 1) {
//                     ws.send(JSON.stringify({
//                         type: 'acknowledge',
//                         originalType: data.type,
//                         timestamp: new Date().toISOString(),
//                         clientId: client?.id,
//                         message: 'Message received'
//                     }));
//                 }
//         }
//     }

//     // ========== BROADCAST METHODS WITH COMPANY ISOLATION ==========

//     /**
//      * Broadcast QR code to clients for a specific company
//      * @param {string} companyId - Company ID
//      * @param {Object} qrData - QR code data
//      */
//     broadcastQR(companyId, qrData) {
//         if (!companyId || !qrData) return;
        
//         const now = Date.now();
//         if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
//             return;
//         }
        
//         // Store in company cache
//         this.companyQRs.set(companyId, {
//             qr: qrData,
//             expiresAt: now + 60000 // 60 seconds
//         });
        
//         this.lastQrBroadcast = now;
        
//         // Broadcast only to clients viewing this company
//         this.broadcastToCompany(companyId, {
//             type: 'qr_update',
//             qr: qrData,
//             companyId: companyId,
//             timestamp: new Date().toISOString(),
//             hasQr: true
//         });
        
//         // Also broadcast to Socket.IO QR namespace if available
//         if (this.io) {
//             const qrNamespace = this.io.of('/qr');
//             qrNamespace.to(`company:${companyId}`).emit('qr_update', {
//                 type: 'qr_update',
//                 qr: qrData,
//                 companyId: companyId,
//                 timestamp: new Date().toISOString(),
//                 hasQr: true
//             });
//         }
//     }

//     /**
//      * Broadcast status update to clients for a specific company
//      * @param {string} companyId - Company ID
//      * @param {string} status - Status string
//      * @param {string} message - Status message
//      */
//     broadcastStatus(companyId, status, message) {
//         if (!companyId) return;
        
//         const now = Date.now();
//         if (now - this.lastStatusBroadcast < this.statusBroadcastInterval && this.lastStatusBroadcast !== 0) {
//             return;
//         }
        
//         this.lastStatusBroadcast = now;
        
//         this.broadcastToCompany(companyId, {
//             type: 'status_update',
//             status: status,
//             message: message || '',
//             companyId: companyId,
//             timestamp: new Date().toISOString()
//         });
        
//         // Also broadcast to Socket.IO QR namespace if available
//         if (this.io) {
//             const qrNamespace = this.io.of('/qr');
//             qrNamespace.to(`company:${companyId}`).emit('status_update', {
//                 type: 'status_update',
//                 status: status,
//                 message: message || '',
//                 companyId: companyId,
//                 timestamp: new Date().toISOString()
//             });
//         }
//     }

//     /**
//      * Broadcast statistics to all connected clients
//      * @param {Object} stats - Statistics object
//      */
//     broadcastStats(stats) {
//         if (!stats) return;
        
//         const now = Date.now();
//         if (now - this.lastStatsBroadcast < this.statsBroadcastInterval && this.lastStatsBroadcast !== 0) {
//             return;
//         }
        
//         this.lastStatsBroadcast = now;
        
//         // Broadcast to all clients (stats are global)
//         this.broadcastToAll({
//             type: 'stats_update',
//             stats: stats,
//             timestamp: new Date().toISOString()
//         }, true);
        
//         // Also broadcast to Socket.IO QR namespace if available
//         if (this.io) {
//             const qrNamespace = this.io.of('/qr');
//             qrNamespace.emit('stats_update', {
//                 type: 'stats_update',
//                 stats: stats,
//                 timestamp: new Date().toISOString()
//             });
//         }
//     }

//     /**
//      * Broadcast connected status to all clients
//      * @param {string} companyId - Company ID
//      */
//     broadcastConnected(companyId) {
//         this.broadcastToCompany(companyId, {
//             type: 'bot_connected',
//             companyId: companyId,
//             message: 'WhatsApp connected successfully',
//             timestamp: new Date().toISOString()
//         });
        
//         // Also broadcast to Socket.IO QR namespace if available
//         if (this.io) {
//             const qrNamespace = this.io.of('/qr');
//             qrNamespace.to(`company:${companyId}`).emit('bot_connected', {
//                 type: 'bot_connected',
//                 companyId: companyId,
//                 message: 'WhatsApp connected successfully',
//                 timestamp: new Date().toISOString()
//             });
//         }
//     }

//     /**
//      * Broadcast disconnected status to all clients
//      * @param {string} companyId - Company ID
//      * @param {string} reason - Disconnect reason
//      */
//     broadcastDisconnected(companyId, reason) {
//         this.broadcastToCompany(companyId, {
//             type: 'bot_disconnected',
//             companyId: companyId,
//             reason: reason || 'Unknown reason',
//             timestamp: new Date().toISOString()
//         });
        
//         // Also broadcast to Socket.IO QR namespace if available
//         if (this.io) {
//             const qrNamespace = this.io.of('/qr');
//             qrNamespace.to(`company:${companyId}`).emit('bot_disconnected', {
//                 type: 'bot_disconnected',
//                 companyId: companyId,
//                 reason: reason || 'Unknown reason',
//                 timestamp: new Date().toISOString()
//             });
//         }
//     }

//     /**
//      * Broadcast message to all clients of a specific company
//      * @param {string} companyId - Company ID
//      * @param {Object} data - Message data
//      * @param {boolean} suppressLog - Suppress logging
//      */
//     broadcastToCompany(companyId, data, suppressLog = false) {
//         if (!this.wss || !this.isInitialized) return;

//         const message = JSON.stringify(data);
//         let sentCount = 0;
//         const clientsToDelete = [];

//         this.clients.forEach((client, ws) => {
//             // Only send to clients for this company
//             if (client.companyId === companyId && ws.readyState === 1) {
//                 try {
//                     ws.send(message);
//                     sentCount++;
//                 } catch (error) {
//                     if (!suppressLog) {
//                         console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
//                     }
//                     clientsToDelete.push(ws);
//                 }
//             } else if (ws.readyState !== 1) {
//                 clientsToDelete.push(ws);
//             }
//         });

//         // Clean up dead connections
//         clientsToDelete.forEach(ws => {
//             this.clients.delete(ws);
//         });

//         if (sentCount > 0 && !suppressLog) {
//             console.log(`📤 QR Broadcast to ${sentCount} client(s) for company ${companyId}: ${data.type}`);
//         }
//     }

//     /**
//      * Broadcast message to all clients (global)
//      * @param {Object} data - Message data
//      * @param {boolean} suppressLog - Suppress logging
//      */
//     broadcastToAll(data, suppressLog = false) {
//         if (!this.wss || !this.isInitialized) return;

//         const message = JSON.stringify(data);
//         let sentCount = 0;
//         const clientsToDelete = [];

//         this.clients.forEach((client, ws) => {
//             if (ws.readyState === 1) {
//                 try {
//                     ws.send(message);
//                     sentCount++;
//                 } catch (error) {
//                     if (!suppressLog) {
//                         console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
//                     }
//                     clientsToDelete.push(ws);
//                 }
//             } else {
//                 clientsToDelete.push(ws);
//             }
//         });

//         // Clean up dead connections
//         clientsToDelete.forEach(ws => {
//             this.clients.delete(ws);
//         });

//         if (sentCount > 0 && !suppressLog) {
//             console.log(`📤 Global QR Broadcast to ${sentCount} client(s): ${data.type}`);
//         }
//     }

//     // ========== UTILITY METHODS ==========

//     /**
//      * Clean up expired QR codes
//      */
//     cleanupExpiredQRs() {
//         const now = Date.now();
//         let removed = 0;
        
//         this.companyQRs.forEach((data, companyId) => {
//             if (data.expiresAt < now) {
//                 this.companyQRs.delete(companyId);
//                 removed++;
//             }
//         });
        
//         if (removed > 0) {
//             console.log(`🧹 Cleaned up ${removed} expired QR codes`);
//         }
//     }

//     /**
//      * Clean up old rate limit entries
//      */
//     cleanupOldAttempts() {
//         const now = Date.now();
//         const minuteAgo = now - 60000;
        
//         this.connectionAttempts.forEach((attempts, ip) => {
//             const recentAttempts = attempts.filter(time => time > minuteAgo);
            
//             if (recentAttempts.length === 0) {
//                 this.connectionAttempts.delete(ip);
//             } else {
//                 this.connectionAttempts.set(ip, recentAttempts);
//             }
//         });
//     }

//     /**
//      * Check rate limit for IP
//      */
//     checkRateLimit(ip) {
//         // Allow all local connections without rate limiting
//         if (ip.includes('localhost') || ip.includes('127.0.0.1') || 
//             ip.includes('::1') || ip.includes('192.168.') || 
//             ip.includes('10.0.')) {
//             return true;
//         }
        
//         const now = Date.now();
//         const minuteAgo = now - 60000;
        
//         if (!this.connectionAttempts.has(ip)) {
//             this.connectionAttempts.set(ip, []);
//         }
        
//         const attempts = this.connectionAttempts.get(ip);
//         const recentAttempts = attempts.filter(time => time > minuteAgo);
        
//         this.connectionAttempts.set(ip, [...recentAttempts, now]);
        
//         if (recentAttempts.length >= this.maxConnectionsPerMinute) {
//             return false;
//         }
        
//         return true;
//     }

//     /**
//      * Get client count
//      */
//     getClientCount() {
//         return this.clients.size;
//     }

//     /**
//      * Get client info grouped by company
//      */
//     getClientInfo() {
//         const info = [];
//         const now = Date.now();
        
//         this.clients.forEach((client, ws) => {
//             info.push({
//                 id: client.id,
//                 companyId: client.companyId,
//                 ip: client.ip,
//                 userAgent: client.userAgent?.substring(0, 50) || 'Unknown',
//                 connectedAt: client.connectedAt,
//                 connectionDuration: now - client.connectedAt.getTime(),
//                 readyState: ws.readyState,
//                 isAlive: ws.isAlive === true,
//                 authenticated: client.authenticated || false,
//                 lastPing: client.lastPing
//             });
//         });
//         return info;
//     }

//     /**
//      * Get connection statistics
//      */
//     getConnectionStats() {
//         const companies = new Map();
        
//         this.clients.forEach(client => {
//             const compId = client.companyId || 'unknown';
//             companies.set(compId, (companies.get(compId) || 0) + 1);
//         });
        
//         return {
//             totalConnections: this.connectionCounter,
//             activeConnections: this.clients.size,
//             authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length,
//             byCompany: Object.fromEntries(companies)
//         };
//     }

//     /**
//      * Get company-specific connection info
//      */
//     getCompanyConnections(companyId) {
//         let count = 0;
//         this.clients.forEach(client => {
//             if (client.companyId === companyId) {
//                 count++;
//             }
//         });
//         return count;
//     }

//     /**
//      * Close server gracefully
//      */
//     close() {
//         if (this.wss) {
//             console.log('🛑 Closing QR WebSocket server...');
//             console.log(`Active connections: ${this.clients.size}`);
            
//             this.clients.forEach((client, ws) => {
//                 if (ws.readyState === 1) {
//                     ws.close(1000, 'Server shutting down');
//                 }
//             });
            
//             this.clients.clear();
//             this.wss.close();
//             this.isInitialized = false;
            
//             if (this.heartbeatInterval) {
//                 clearInterval(this.heartbeatInterval);
//                 this.heartbeatInterval = null;
//             }
            
//             if (this.cleanupInterval) {
//                 clearInterval(this.cleanupInterval);
//                 this.cleanupInterval = null;
//             }
            
//             if (this.qrCleanupInterval) {
//                 clearInterval(this.qrCleanupInterval);
//                 this.qrCleanupInterval = null;
//             }
            
//             console.log('✅ QR WebSocket server closed gracefully');
//         }
//     }
// }

// // Create singleton instance
// const qrSocketServer = new QRSocketServer();
// export { qrSocketServer };




































// services/qrSocketServer.js - COMPLETE MULTI-TENANT VERSION
// Handles QR code WebSocket connections with company isolation

import { WebSocketServer } from 'ws';
import url from 'url';

class QRSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // ws -> { id, companyId, metadata }
        this.isInitialized = false;
        
        // Add throttling variables
        this.lastStatsBroadcast = 0;
        this.statsBroadcastInterval = 5000;
        
        this.lastQrBroadcast = 0;
        this.qrBroadcastInterval = 2000;
        
        this.lastStatusBroadcast = 0;
        this.statusBroadcastInterval = 3000;
        
        // Rate limiting for connections
        this.connectionAttempts = new Map();
        this.maxConnectionsPerMinute = 1000;
        this.connectionCounter = 0;
        this.statsBroadcastCount = 0;
        
        // Bot reference (will be set from server.js)
        this.bot = null;
        
        // Session Manager reference (will be set from server.js)
        this.sessionManager = null;
        
        // Socket.IO reference for cross-namespace communication
        this.io = null;
        
        // Company-specific QR data cache
        this.companyQRs = new Map(); // companyId -> { qr, expiresAt }
        
        // Heartbeat interval reference
        this.heartbeatInterval = null;
        
        // Cleanup interval for old rate limit entries
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldAttempts();
        }, 60000);
        
        // Cleanup expired QR codes
        this.qrCleanupInterval = setInterval(() => {
            this.cleanupExpiredQRs();
        }, 10000);
    }

    // Set bot reference from server.js
    setBot(botInstance) {
        this.bot = botInstance;
        console.log('🤖 Bot instance set in QR Socket Server');
    }

    // Set session manager reference
    setSessionManager(manager) {
        this.sessionManager = manager;
        console.log('📱 Session Manager set in QR Socket Server');
    }

    // Set Socket.IO reference
    setIO(ioInstance) {
        this.io = ioInstance;
        console.log('🔌 Socket.IO set in QR Socket Server');
    }

    initialize(server, botInstance = null, ioInstance = null) {
        if (this.isInitialized) {
            console.log('📡 QR WebSocket server already initialized');
            return;
        }

        // Set bot if provided
        if (botInstance) {
            this.bot = botInstance;
        }

        // Set io if provided
        if (ioInstance) {
            this.io = ioInstance;
        }

        try {
            // Validate server is listening
            if (!server.listening) {
                console.error('❌ HTTP server is not listening yet');
                return;
            }

            // IMPORTANT: Use path '/ws/qr' to avoid conflicts with notification server
            this.wss = new WebSocketServer({ 
                server, 
                path: '/ws/qr',
                clientTracking: true,
                perMessageDeflate: false,
                maxPayload: 1048576
            });
            
            this.wss.on('connection', (ws, req) => {
                this.handleConnection(ws, req);
            });
            
            // Setup heartbeat interval for all clients
            this.heartbeatInterval = setInterval(() => {
                if (!this.wss) return;
                
                this.wss.clients.forEach((ws) => {
                    if (ws.isAlive === false) {
                        console.log('💔 Terminating stale QR WebSocket connection');
                        return ws.terminate();
                    }
                    
                    ws.isAlive = false;
                    
                    try {
                        ws.ping();
                    } catch (error) {
                        // Safe error handling
                    }
                });
            }, 30000);
            
            // Clear interval on server close
            this.wss.on('close', () => {
                if (this.heartbeatInterval) {
                    clearInterval(this.heartbeatInterval);
                    this.heartbeatInterval = null;
                }
            });
            
            this.isInitialized = true;
            
            const address = server.address();
            if (address) {
                console.log('✅ QR WebSocket server initialized successfully');
                console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws/qr`);
                console.log(`📱 Connected to Bot: ${this.bot ? 'YES' : 'NO'}`);
                console.log(`📱 Connected to Session Manager: ${this.sessionManager ? 'YES' : 'NO'}`);
                console.log(`🔌 Connected to Socket.IO: ${this.io ? 'YES' : 'NO'}`);
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize QR WebSocket server:', error.message);
        }
    }

    /**
     * Handle new WebSocket connection with company context
     */
    handleConnection(ws, req) {
        this.connectionCounter++;
        const clientId = Date.now().toString() + '_' + this.connectionCounter;
        const clientIp = req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        // Extract companyId from query string - MULTI-TENANT SUPPORT
        const parsedUrl = url.parse(req.url, true);
        const companyId = parsedUrl.query.companyId || null;
        
        // Check if localhost/development
        const isLocalhost = clientIp === '::1' || clientIp === '127.0.0.1' || 
                           clientIp.includes('localhost') || 
                           clientIp.includes('192.168.') ||
                           clientIp.includes('10.0.');
        
        // Apply rate limiting only for non-localhost connections
        if (!isLocalhost && !this.checkRateLimit(clientIp)) {
            console.log(`⛔ Rate limit exceeded for IP: ${clientIp}`);
            ws.close(1008, 'Rate limit exceeded');
            return;
        }
        
        console.log(`🔗 New QR WebSocket client: ${clientId} from ${clientIp} for company: ${companyId || 'unknown'}`);
        
        // Store client with company context - MULTI-TENANT SUPPORT
        this.clients.set(ws, {
            id: clientId,
            companyId: companyId,
            connectedAt: new Date(),
            ip: clientIp,
            userAgent: userAgent,
            isAlive: true,
            isLocalhost: isLocalhost,
            authenticated: false,
            lastPing: Date.now()
        });
        
        // Setup heartbeat detection
        ws.isAlive = true;
        
        ws.on('pong', () => {
            ws.isAlive = true;
            const client = this.clients.get(ws);
            if (client) {
                client.lastPing = Date.now();
            }
        });
        
        // Send welcome message with initial status - COMPANY SPECIFIC
        setTimeout(() => {
            if (ws.readyState === 1) { // WebSocket.OPEN
                try {
                    // Get current QR for this company from session manager or bot
                    let qrData = null;
                    let connectionStatus = 'disconnected';
                    let isConnected = false;
                    
                    // Try session manager first (multi-tenant)
                    if (this.sessionManager && companyId) {
                        const session = this.sessionManager.getSessionStatus(companyId);
                        qrData = session?.qrData || null;
                        connectionStatus = session?.status || 'disconnected';
                        isConnected = session?.connected || false;
                    } 
                    // Fallback to bot (single tenant mode)
                    else if (this.bot && companyId) {
                        const botStatus = this.bot.getStatus();
                        if (botStatus.companyId === companyId) {
                            qrData = botStatus.qrData?.qr || null;
                            connectionStatus = botStatus.connected ? 'connected' : 
                                              botStatus.hasQR ? 'qr_required' : 'disconnected';
                            isConnected = botStatus.connected;
                        }
                    }
                    
                    ws.send(JSON.stringify({
                        type: 'connected',
                        message: 'Connected to WhatsApp QR WebSocket',
                        clientId: clientId,
                        companyId: companyId,
                        serverTime: new Date().toISOString(),
                        version: '1.0.0',
                        qrData: qrData,
                        status: connectionStatus,
                        connected: isConnected,
                        endpoint: 'qr'
                    }));
                    
                    console.log(`✅ Welcome sent to QR client ${clientId} for company: ${companyId}`);
                } catch (error) {
                    console.log(`❌ Error sending welcome to ${clientId}:`, error.message);
                }
            }
        }, 100);
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                this.handleMessage(ws, data);
            } catch (error) {
                console.error('❌ QR WebSocket message parse error:', error);
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format',
                        timestamp: new Date().toISOString()
                    }));
                }
            }
        });
        
        ws.on('close', (code, reason) => {
            const client = this.clients.get(ws);
            const duration = client ? Date.now() - client.connectedAt.getTime() : 0;
            
            console.log(`🔌 QR WebSocket client disconnected: ${clientId} for company: ${client?.companyId || 'unknown'}`, { 
                code, 
                reason: reason.toString() || 'No reason',
                duration: `${duration}ms`
            });
            
            this.clients.delete(ws);
        });
        
        ws.on('error', (error) => {
            console.error(`❌ QR WebSocket error for client ${clientId}:`, error.message);
            this.clients.delete(ws);
        });
    }

    /**
     * Handle incoming messages with company context
     */
    handleMessage(ws, data) {
        const client = this.clients.get(ws);
        
        if (!data || !data.type) {
            console.log(`📨 Received malformed message from QR client ${client?.id}`);
            return;
        }
        
        const messageType = data.type.toLowerCase();
        
        switch (messageType) {
            case 'ping':
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: new Date().toISOString(),
                        clientId: client?.id,
                        serverTime: Date.now()
                    }));
                }
                break;
                
            case 'get_status':
                if (ws.readyState === 1) {
                    const companyId = client?.companyId || data.companyId;
                    let status = { connected: false, authenticated: false, hasQR: false, qr: null };
                    let message = 'Not connected';
                    
                    // Try session manager first (multi-tenant)
                    if (this.sessionManager && companyId) {
                        const sessionStatus = this.sessionManager.getSessionStatus(companyId);
                        status = {
                            connected: sessionStatus?.connected || false,
                            authenticated: sessionStatus?.status === 'connected',
                            hasQR: !!sessionStatus?.qrData,
                            qr: sessionStatus?.qrData
                        };
                        message = status.connected ? 'WhatsApp is connected' : 
                                 status.hasQR ? 'QR code required' : 'Not connected';
                    } 
                    // Fallback to bot (single tenant mode)
                    else if (this.bot && companyId) {
                        const botStatus = this.bot.getStatus();
                        if (botStatus.companyId === companyId) {
                            status = {
                                connected: botStatus.connected || false,
                                authenticated: botStatus.authenticated || false,
                                hasQR: !!botStatus.qrData,
                                qr: botStatus.qrData?.qr || null
                            };
                            message = status.connected ? 'WhatsApp is connected' : 
                                     status.hasQR ? 'QR code required' : 'Not connected';
                        }
                    }
                    
                    ws.send(JSON.stringify({
                        type: 'status',
                        connected: status.connected,
                        authenticated: status.authenticated,
                        hasQR: status.hasQR,
                        qr: status.qr,
                        companyId: companyId,
                        message: message,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'get_qr':
                if (ws.readyState === 1) {
                    const companyId = client?.companyId || data.companyId;
                    let qr = null;
                    
                    if (this.sessionManager && companyId) {
                        const session = this.sessionManager.getSessionStatus(companyId);
                        qr = session?.qrData || null;
                    } else if (this.bot && companyId) {
                        const botStatus = this.bot.getStatus();
                        if (botStatus.companyId === companyId) {
                            qr = botStatus.qrData?.qr || null;
                        }
                    }
                    
                    ws.send(JSON.stringify({
                        type: 'qr_response',
                        qr: qr,
                        hasQr: !!qr,
                        companyId: companyId,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'get_stats':
                if (ws.readyState === 1) {
                    let stats = {};
                    if (this.sessionManager) {
                        stats = this.sessionManager.getStats() || {};
                    } else if (this.bot) {
                        const botStatus = this.bot.getStatus();
                        stats = botStatus.stats || {};
                    }
                    
                    ws.send(JSON.stringify({
                        type: 'stats',
                        stats: stats,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'identify':
                if (ws.readyState === 1) {
                    if (client) {
                        client.authenticated = true;
                        if (data.companyId) {
                            client.companyId = data.companyId;
                            console.log(`🏢 QR client ${client.id} identified for company: ${data.companyId}`);
                        }
                    }
                    
                    ws.send(JSON.stringify({
                        type: 'identified',
                        clientId: client?.id,
                        companyId: client?.companyId,
                        message: `QR client identified as: ${data.clientName || 'Unknown'}`,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'authenticate':
                if (ws.readyState === 1) {
                    const isValid = data.token === process.env.QR_CLIENT_TOKEN || 
                                   data.token === 'dev-token-2024' ||
                                   data.token === process.env.NOTIFICATION_API_KEY;
                    
                    if (client) {
                        client.authenticated = isValid;
                        if (data.companyId) {
                            client.companyId = data.companyId;
                        }
                    }
                    
                    ws.send(JSON.stringify({
                        type: isValid ? 'auth_success' : 'auth_failed',
                        clientId: client?.id,
                        companyId: client?.companyId,
                        message: isValid ? 'Authentication successful' : 'Authentication failed',
                        timestamp: new Date().toISOString()
                    }));
                    
                    if (isValid) {
                        console.log(`✅ QR client ${client?.id} authenticated successfully for company: ${client?.companyId}`);
                    }
                }
                break;
                
            default:
                console.log(`📨 Received ${data.type} from QR client ${client?.id}`);
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'acknowledge',
                        originalType: data.type,
                        timestamp: new Date().toISOString(),
                        clientId: client?.id,
                        message: 'Message received'
                    }));
                }
        }
    }

    // ========== BROADCAST METHODS WITH COMPANY ISOLATION ==========

    /**
     * Broadcast QR code to clients for a specific company
     */
    broadcastQR(companyId, qrData) {
        if (!companyId || !qrData) return;
        
        const now = Date.now();
        if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
            return;
        }
        
        // Store in company cache
        this.companyQRs.set(companyId, {
            qr: qrData,
            expiresAt: now + 60000 // 60 seconds
        });
        
        this.lastQrBroadcast = now;
        
        // Broadcast only to clients viewing this company
        this.broadcastToCompany(companyId, {
            type: 'qr_update',
            qr: qrData,
            companyId: companyId,
            timestamp: new Date().toISOString(),
            hasQr: true
        });
        
        // Also broadcast to Socket.IO QR namespace if available
        if (this.io) {
            const qrNamespace = this.io.of('/qr');
            qrNamespace.to(`company:${companyId}`).emit('qr_update', {
                type: 'qr_update',
                qr: qrData,
                companyId: companyId,
                timestamp: new Date().toISOString(),
                hasQr: true
            });
        }
    }

    /**
     * Broadcast status update to clients for a specific company
     */
    broadcastStatus(companyId, status, message) {
        if (!companyId) return;
        
        const now = Date.now();
        if (now - this.lastStatusBroadcast < this.statusBroadcastInterval && this.lastStatusBroadcast !== 0) {
            return;
        }
        
        this.lastStatusBroadcast = now;
        
        this.broadcastToCompany(companyId, {
            type: 'status_update',
            status: status,
            message: message || '',
            companyId: companyId,
            timestamp: new Date().toISOString()
        });
        
        // Also broadcast to Socket.IO QR namespace if available
        if (this.io) {
            const qrNamespace = this.io.of('/qr');
            qrNamespace.to(`company:${companyId}`).emit('status_update', {
                type: 'status_update',
                status: status,
                message: message || '',
                companyId: companyId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Broadcast statistics to all connected clients
     */
    broadcastStats(stats) {
        if (!stats) return;
        
        const now = Date.now();
        if (now - this.lastStatsBroadcast < this.statsBroadcastInterval && this.lastStatsBroadcast !== 0) {
            return;
        }
        
        this.lastStatsBroadcast = now;
        
        // Broadcast to all clients (stats are global)
        this.broadcastToAll({
            type: 'stats_update',
            stats: stats,
            timestamp: new Date().toISOString()
        }, true);
        
        // Also broadcast to Socket.IO QR namespace if available
        if (this.io) {
            const qrNamespace = this.io.of('/qr');
            qrNamespace.emit('stats_update', {
                type: 'stats_update',
                stats: stats,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Broadcast connected status for a company
     */
    broadcastConnected(companyId) {
        this.broadcastToCompany(companyId, {
            type: 'bot_connected',
            companyId: companyId,
            message: 'WhatsApp connected successfully',
            timestamp: new Date().toISOString()
        });
        
        // Also broadcast to Socket.IO QR namespace if available
        if (this.io) {
            const qrNamespace = this.io.of('/qr');
            qrNamespace.to(`company:${companyId}`).emit('bot_connected', {
                type: 'bot_connected',
                companyId: companyId,
                message: 'WhatsApp connected successfully',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Broadcast disconnected status for a company
     */
    broadcastDisconnected(companyId, reason) {
        this.broadcastToCompany(companyId, {
            type: 'bot_disconnected',
            companyId: companyId,
            reason: reason || 'Unknown reason',
            timestamp: new Date().toISOString()
        });
        
        // Also broadcast to Socket.IO QR namespace if available
        if (this.io) {
            const qrNamespace = this.io.of('/qr');
            qrNamespace.to(`company:${companyId}`).emit('bot_disconnected', {
                type: 'bot_disconnected',
                companyId: companyId,
                reason: reason || 'Unknown reason',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Broadcast message to all clients of a specific company
     */
    broadcastToCompany(companyId, data, suppressLog = false) {
        if (!this.wss || !this.isInitialized) return;

        const message = JSON.stringify(data);
        let sentCount = 0;
        const clientsToDelete = [];

        this.clients.forEach((client, ws) => {
            // Only send to clients for this company - MULTI-TENANT ISOLATION
            if (client.companyId === companyId && ws.readyState === 1) {
                try {
                    ws.send(message);
                    sentCount++;
                } catch (error) {
                    if (!suppressLog) {
                        console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
                    }
                    clientsToDelete.push(ws);
                }
            } else if (ws.readyState !== 1) {
                clientsToDelete.push(ws);
            }
        });

        // Clean up dead connections
        clientsToDelete.forEach(ws => {
            this.clients.delete(ws);
        });

        if (sentCount > 0 && !suppressLog) {
            console.log(`📤 QR Broadcast to ${sentCount} client(s) for company ${companyId}: ${data.type}`);
        }
    }

    /**
     * Broadcast message to all clients (global)
     */
    broadcastToAll(data, suppressLog = false) {
        if (!this.wss || !this.isInitialized) return;

        const message = JSON.stringify(data);
        let sentCount = 0;
        const clientsToDelete = [];

        this.clients.forEach((client, ws) => {
            if (ws.readyState === 1) {
                try {
                    ws.send(message);
                    sentCount++;
                } catch (error) {
                    if (!suppressLog) {
                        console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
                    }
                    clientsToDelete.push(ws);
                }
            } else {
                clientsToDelete.push(ws);
            }
        });

        // Clean up dead connections
        clientsToDelete.forEach(ws => {
            this.clients.delete(ws);
        });

        if (sentCount > 0 && !suppressLog) {
            console.log(`📤 Global QR Broadcast to ${sentCount} client(s): ${data.type}`);
        }
    }

    // ========== UTILITY METHODS ==========

    /**
     * Clean up expired QR codes
     */
    cleanupExpiredQRs() {
        const now = Date.now();
        let removed = 0;
        
        this.companyQRs.forEach((data, companyId) => {
            if (data.expiresAt < now) {
                this.companyQRs.delete(companyId);
                removed++;
            }
        });
        
        if (removed > 0) {
            console.log(`🧹 Cleaned up ${removed} expired QR codes`);
        }
    }

    /**
     * Clean up old rate limit entries
     */
    cleanupOldAttempts() {
        const now = Date.now();
        const minuteAgo = now - 60000;
        
        this.connectionAttempts.forEach((attempts, ip) => {
            const recentAttempts = attempts.filter(time => time > minuteAgo);
            
            if (recentAttempts.length === 0) {
                this.connectionAttempts.delete(ip);
            } else {
                this.connectionAttempts.set(ip, recentAttempts);
            }
        });
    }

    /**
     * Check rate limit for IP
     */
    checkRateLimit(ip) {
        // Allow all local connections without rate limiting
        if (ip.includes('localhost') || ip.includes('127.0.0.1') || 
            ip.includes('::1') || ip.includes('192.168.') || 
            ip.includes('10.0.')) {
            return true;
        }
        
        const now = Date.now();
        const minuteAgo = now - 60000;
        
        if (!this.connectionAttempts.has(ip)) {
            this.connectionAttempts.set(ip, []);
        }
        
        const attempts = this.connectionAttempts.get(ip);
        const recentAttempts = attempts.filter(time => time > minuteAgo);
        
        this.connectionAttempts.set(ip, [...recentAttempts, now]);
        
        if (recentAttempts.length >= this.maxConnectionsPerMinute) {
            return false;
        }
        
        return true;
    }

    /**
     * Get client count
     */
    getClientCount() {
        return this.clients.size;
    }

    /**
     * Get client info grouped by company
     */
    getClientInfo() {
        const info = [];
        const now = Date.now();
        
        this.clients.forEach((client, ws) => {
            info.push({
                id: client.id,
                companyId: client.companyId,
                ip: client.ip,
                userAgent: client.userAgent?.substring(0, 50) || 'Unknown',
                connectedAt: client.connectedAt,
                connectionDuration: now - client.connectedAt.getTime(),
                readyState: ws.readyState,
                isAlive: ws.isAlive === true,
                isLocalhost: client.isLocalhost || false,
                authenticated: client.authenticated || false,
                lastPing: client.lastPing
            });
        });
        return info;
    }

    /**
     * Get connection statistics
     */
    getConnectionStats() {
        const companies = new Map();
        
        this.clients.forEach(client => {
            const compId = client.companyId || 'unknown';
            companies.set(compId, (companies.get(compId) || 0) + 1);
        });
        
        return {
            totalConnections: this.connectionCounter,
            activeConnections: this.clients.size,
            authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length,
            localhostConnections: Array.from(this.clients.values()).filter(c => c.isLocalhost).length,
            byCompany: Object.fromEntries(companies)
        };
    }

    /**
     * Get company-specific connection count
     */
    getCompanyConnections(companyId) {
        let count = 0;
        this.clients.forEach(client => {
            if (client.companyId === companyId) {
                count++;
            }
        });
        return count;
    }

    /**
     * Close server gracefully
     */
    close() {
        if (this.wss) {
            console.log('🛑 Closing QR WebSocket server...');
            console.log(`Active connections: ${this.clients.size}`);
            
            this.clients.forEach((client, ws) => {
                if (ws.readyState === 1) {
                    ws.close(1000, 'Server shutting down');
                }
            });
            
            this.clients.clear();
            this.wss.close();
            this.isInitialized = false;
            
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = null;
            }
            
            if (this.qrCleanupInterval) {
                clearInterval(this.qrCleanupInterval);
                this.qrCleanupInterval = null;
            }
            
            console.log('✅ QR WebSocket server closed gracefully');
        }
    }
}

// Create singleton instance
const qrSocketServer = new QRSocketServer();
export { qrSocketServer };