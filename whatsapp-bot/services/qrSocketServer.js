

// import { WebSocketServer } from 'ws';

// class QRSocketServer {
//     constructor() {
//         this.wss = null;
//         this.clients = new Map();
//         this.isInitialized = false;
        
//         // Add throttling variables
//         this.lastStatsBroadcast = 0;
//         this.statsBroadcastInterval = 5000; // 5 seconds minimum between stats broadcasts
        
//         this.lastQrBroadcast = 0;
//         this.qrBroadcastInterval = 2000; // 2 seconds minimum between QR broadcasts
        
//         this.lastStatusBroadcast = 0;
//         this.statusBroadcastInterval = 3000; // 3 seconds minimum between status broadcasts
        
//         // Rate limiting for connections
//         this.connectionAttempts = new Map(); // Track connection attempts by IP
//         this.maxConnectionsPerMinute = 1000; // INCREASED from 10 to 50 for development
//         this.connectionCounter = 0;
//         this.statsBroadcastCount = 0; // Initialize missing variable
        
//         // Cleanup interval for old rate limit entries
//         this.cleanupInterval = setInterval(() => {
//             this.cleanupOldAttempts();
//         }, 60000); // Clean up every minute
//     }

//     initialize(server) {
//         if (this.isInitialized) {
//             console.log('📡 WebSocket server already initialized');
//             return;
//         }

//         try {
//             // Validate server is listening
//             if (!server.listening) {
//                 console.error('❌ HTTP server is not listening yet');
//                 return;
//             }

//             this.wss = new WebSocketServer({ 
//                 server, 
//                 path: '/ws',
//                 clientTracking: true,
//                 // Additional WebSocket options
//                 perMessageDeflate: false,
//                 maxPayload: 1048576 // 1MB max payload
//             });
            
//             // Add connection validation
//             this.wss.on('headers', (headers, req) => {
//                 // Log connection attempt for debugging
//                 const origin = req.headers.origin;
//                 const userAgent = req.headers['user-agent'] || 'Unknown';
//                 console.log(`🔍 Connection attempt from origin: ${origin}, User-Agent: ${userAgent.substring(0, 50)}...`);
//             });
            
//             this.wss.on('connection', (ws, req) => {
//                 this.connectionCounter++;
//                 const clientId = Date.now().toString() + '_' + this.connectionCounter;
//                 const clientIp = req.socket.remoteAddress || 'unknown';
//                 const userAgent = req.headers['user-agent'] || 'Unknown';
                
//                 // Check if localhost/development - DISABLE rate limiting for localhost
//                 const isLocalhost = clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === 'localhost';
                
//                 // Apply rate limiting only for non-localhost connections
//                 if (!isLocalhost && !this.checkRateLimit(clientIp)) {
//                     console.log(`⛔ Rate limit exceeded for IP: ${clientIp}. Closing connection.`);
//                     ws.close(1008, 'Rate limit exceeded. Please wait before reconnecting.');
//                     return;
//                 }
                
//                 if (isLocalhost) {
//                     console.log(`🔗 New WebSocket client connected (localhost): ${clientId} from ${clientIp}`);
//                 } else {
//                     console.log(`🔗 New WebSocket client connected: ${clientId} from ${clientIp} (User-Agent: ${userAgent.substring(0, 50)}...)`);
//                 }
                
//                 // Store client
//                 this.clients.set(ws, {
//                     id: clientId,
//                     connectedAt: new Date(),
//                     ip: clientIp,
//                     userAgent: userAgent,
//                     isAlive: true,
//                     isLocalhost: isLocalhost
//                 });
                
//                 // Setup heartbeat detection
//                 ws.isAlive = true;
                
//                 ws.on('pong', () => {
//                     ws.isAlive = true;
//                 });
                
//                 // Send welcome message with a small delay to ensure connection is ready
//                 setTimeout(() => {
//                     if (ws.readyState === 1) { // WebSocket.OPEN
//                         try {
//                             ws.send(JSON.stringify({
//                                 type: 'connected',
//                                 message: 'Connected to WhatsApp bot server',
//                                 clientId: clientId,
//                                 serverTime: new Date().toISOString(),
//                                 version: '1.0.0',
//                                 isLocalhost: isLocalhost
//                             }));
//                         } catch (error) {
//                             console.log(`❌ Error sending welcome to ${clientId}:`, error.message);
//                         }
//                     }
//                 }, 100);
                
//                 ws.on('message', (message) => {
//                     try {
//                         const data = JSON.parse(message.toString());
//                         this.handleMessage(ws, data);
//                     } catch (error) {
//                         console.error('❌ WebSocket message parse error:', error);
//                         // Send error back to client
//                         if (ws.readyState === 1) {
//                             ws.send(JSON.stringify({
//                                 type: 'error',
//                                 message: 'Invalid message format',
//                                 timestamp: new Date().toISOString()
//                             }));
//                         }
//                     }
//                 });
                
//                 ws.on('close', (code, reason) => {
//                     const client = this.clients.get(ws);
//                     const duration = client ? Date.now() - client.connectedAt.getTime() : 0;
                    
//                     // Only log disconnections that lasted more than 5 seconds (to reduce spam)
//                     if (duration > 5000 || (code !== 1005 && code !== 1000)) {
//                         const reasonStr = reason.toString() || 'No reason provided';
//                         console.log(`🔌 WebSocket client disconnected: ${clientId}`, { 
//                             code, 
//                             reason: reasonStr,
//                             duration: `${duration}ms`,
//                             isLocalhost: client?.isLocalhost || false
//                         });
//                     }
                    
//                     this.clients.delete(ws);
//                 });
                
//                 ws.on('error', (error) => {
//                     console.error(`❌ WebSocket error for client ${clientId}:`, error.message);
//                     this.clients.delete(ws);
//                 });
//             });
            
//             // Setup heartbeat interval for all clients
//             const heartbeatInterval = setInterval(() => {
//                 this.wss.clients.forEach((ws) => {
//                     if (ws.isAlive === false) {
//                         console.log('💔 Terminating stale WebSocket connection');
//                         return ws.terminate();
//                     }
                    
//                     ws.isAlive = false;
                    
//                     // Use try-catch to prevent ping errors from crashing the server
//                     try {
//                         ws.ping();
//                     } catch (error) {
//                         console.log('❌ Error in heartbeat ping:', error.message);
//                     }
//                 });
//             }, 30000);
            
//             // Clear interval on server close
//             this.wss.on('close', () => {
//                 clearInterval(heartbeatInterval);
//                 clearInterval(this.cleanupInterval);
//             });
            
//             this.isInitialized = true;
            
//             // Get port from server address
//             const address = server.address();
//             if (address) {
//                 console.log('✅ WebSocket server initialized successfully');
//                 console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws`);
//                 console.log(`⚙️  Max connections per IP per minute: ${this.maxConnectionsPerMinute} (localhost unlimited)`);
//             } else {
//                 console.log('✅ WebSocket server initialized');
//                 console.log('👥 Ready for WebSocket connections');
//             }
            
//         } catch (error) {
//             console.error('❌ Failed to initialize WebSocket server:', error);
//             console.error('Error stack:', error.stack);
//         }
//     }

//     // NEW METHOD: Clean up old rate limit entries
//     cleanupOldAttempts() {
//         const now = Date.now();
//         const minuteAgo = now - 60000;
        
//         this.connectionAttempts.forEach((attempts, ip) => {
//             // Filter out old attempts (older than 1 minute)
//             const recentAttempts = attempts.filter(time => time > minuteAgo);
            
//             if (recentAttempts.length === 0) {
//                 // Remove IP from map if no recent attempts
//                 this.connectionAttempts.delete(ip);
//             } else {
//                 // Update with only recent attempts
//                 this.connectionAttempts.set(ip, recentAttempts);
//             }
//         });
//     }

//     // Rate limiting method - DISABLED for localhost
//     checkRateLimit(ip) {
//         // Allow all localhost connections without rate limiting
//         if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
//             return true;
//         }
        
//         const now = Date.now();
//         const minuteAgo = now - 60000; // 1 minute ago
        
//         // Get or create attempts array for this IP
//         if (!this.connectionAttempts.has(ip)) {
//             this.connectionAttempts.set(ip, []);
//         }
        
//         const attempts = this.connectionAttempts.get(ip);
        
//         // Filter attempts from the last minute
//         const recentAttempts = attempts.filter(time => time > minuteAgo);
        
//         // Update attempts
//         this.connectionAttempts.set(ip, [...recentAttempts, now]);
        
//         // Check if over limit
//         if (recentAttempts.length >= this.maxConnectionsPerMinute) {
//             return false;
//         }
        
//         return true;
//     }

//     handleMessage(ws, data) {
//         const client = this.clients.get(ws);
        
//         if (!data || !data.type) {
//             console.log(`📨 Received malformed message from client ${client?.id}`);
//             return;
//         }
        
//         switch (data.type.toLowerCase()) {
//             case 'ping':
//                 // Respond to ping
//                 if (ws.readyState === 1) {
//                     ws.send(JSON.stringify({
//                         type: 'pong',
//                         timestamp: new Date().toISOString(),
//                         clientId: client?.id
//                     }));
//                 }
//                 break;
                
//             case 'get_status':
//                 // Client requesting status
//                 if (ws.readyState === 1) {
//                     ws.send(JSON.stringify({
//                         type: 'status_response',
//                         timestamp: new Date().toISOString(),
//                         clientId: client?.id,
//                         message: 'Status request received'
//                     }));
//                 }
//                 break;
                
//             case 'get_stats':
//                 // Client requesting stats
//                 if (ws.readyState === 1) {
//                     ws.send(JSON.stringify({
//                         type: 'stats_response',
//                         timestamp: new Date().toISOString(),
//                         clientId: client?.id,
//                         message: 'Stats request received'
//                     }));
//                 }
//                 break;
                
//             case 'identify':
//                 // Client identifying itself
//                 if (ws.readyState === 1) {
//                     ws.send(JSON.stringify({
//                         type: 'identified',
//                         timestamp: new Date().toISOString(),
//                         clientId: client?.id,
//                         message: `Client identified as: ${data.clientName || 'Unknown'}`
//                     }));
//                 }
//                 break;
                
//             default:
//                 console.log(`📨 Received ${data.type} message from client ${client?.id}`);
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

//     broadcastQR(qr) {
//         if (!qr) return;
        
//         // Throttle QR broadcasts to avoid spam
//         const now = Date.now();
//         if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
//             return; // Skip if too soon since last broadcast
//         }
        
//         this.lastQrBroadcast = now;
//         this.broadcast({
//             type: 'qr',
//             qr: qr,
//             timestamp: new Date().toISOString(),
//             hasQr: true
//         });
//     }

//     broadcastStatus(status, message) {
//         // Throttle status broadcasts to avoid spam
//         const now = Date.now();
//         if (now - this.lastStatusBroadcast < this.statusBroadcastInterval && this.lastStatusBroadcast !== 0) {
//             return; // Skip if too soon since last broadcast
//         }
        
//         this.lastStatusBroadcast = now;
//         this.broadcast({
//             type: 'status',
//             status: status,
//             message: message || '',
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastStats(stats) {
//         if (!stats) return;
        
//         // Throttle stats broadcasts to avoid spam
//         const now = Date.now();
//         if (now - this.lastStatsBroadcast < this.statsBroadcastInterval && this.lastStatsBroadcast !== 0) {
//             return; // Skip if too soon since last broadcast
//         }
        
//         this.lastStatsBroadcast = now;
//         this.broadcast({
//             type: 'stats',
//             stats: stats,
//             timestamp: new Date().toISOString()
//         }, true); // Pass true to suppress log for stats
//     }

//     broadcastBotInfo(botInfo) {
//         if (!botInfo) return;
        
//         this.broadcast({
//             type: 'bot_info',
//             botInfo: botInfo,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastConnected() {
//         this.broadcast({
//             type: 'connected',
//             message: 'WhatsApp connected successfully',
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastDisconnected(reason) {
//         this.broadcast({
//             type: 'disconnected',
//             reason: reason || 'Unknown reason',
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcast(data, suppressLog = false) {
//         if (!this.wss || !this.isInitialized) {
//             if (!suppressLog) {
//                 console.log('⚠️ WebSocket server not initialized, cannot broadcast');
//             }
//             return;
//         }

//         const message = JSON.stringify(data);
//         let sentCount = 0;
//         let errorCount = 0;
//         const clientsToDelete = [];

//         // Iterate through clients
//         this.clients.forEach((client, ws) => {
//             if (ws.readyState === 1) { // WebSocket.OPEN
//                 try {
//                     ws.send(message);
//                     sentCount++;
//                 } catch (error) {
//                     if (!suppressLog) {
//                         console.error(`❌ Failed to send to client ${client.id}:`, error.message);
//                     }
//                     errorCount++;
//                     clientsToDelete.push(ws);
//                 }
//             } else {
//                 // Mark closed connections for cleanup
//                 clientsToDelete.push(ws);
//             }
//         });

//         // Clean up dead connections
//         clientsToDelete.forEach(ws => {
//             this.clients.delete(ws);
//         });

//         // Log broadcast info (with suppression for stats)
//         if (sentCount > 0 && !suppressLog) {
//             console.log(`📤 Broadcast to ${sentCount} client(s): ${data.type}`);
//         }
        
//         if (errorCount > 0 && !suppressLog) {
//             console.log(`⚠️ Failed to send to ${errorCount} client(s)`);
//         }
        
//         // Log stats broadcasts only every 10th time to reduce console spam
//         if (data.type === 'stats' && sentCount > 0) {
//             if (this.statsBroadcastCount % 10 === 0) {
//                 console.log(`📊 Stats broadcast to ${sentCount} client(s) (showing every 10th)`);
//             }
//             this.statsBroadcastCount = (this.statsBroadcastCount || 0) + 1;
//         }
//     }

//     // Force broadcast stats (bypass throttling for important updates)
//     forceBroadcastStats(stats) {
//         if (!stats) return;
        
//         this.lastStatsBroadcast = Date.now();
//         this.broadcast({
//             type: 'stats',
//             stats: stats,
//             timestamp: new Date().toISOString(),
//             force: true
//         });
//     }

//     // Force broadcast status (bypass throttling for important updates)
//     forceBroadcastStatus(status, message) {
//         this.lastStatusBroadcast = Date.now();
//         this.broadcast({
//             type: 'status',
//             status: status,
//             message: message || '',
//             timestamp: new Date().toISOString(),
//             force: true
//         });
//     }

//     // Force broadcast QR (bypass throttling for important updates)
//     forceBroadcastQR(qr) {
//         if (!qr) return;
        
//         this.lastQrBroadcast = Date.now();
//         this.broadcast({
//             type: 'qr',
//             qr: qr,
//             timestamp: new Date().toISOString(),
//             force: true,
//             hasQr: true
//         });
//     }

//     getClientCount() {
//         return this.clients.size;
//     }

//     getClientInfo() {
//         const info = [];
//         const now = Date.now();
        
//         this.clients.forEach((client, ws) => {
//             info.push({
//                 id: client.id,
//                 ip: client.ip,
//                 userAgent: client.userAgent?.substring(0, 50) || 'Unknown',
//                 connectedAt: client.connectedAt,
//                 connectionDuration: now - client.connectedAt.getTime(),
//                 readyState: ws.readyState,
//                 isAlive: ws.isAlive === true,
//                 isLocalhost: client.isLocalhost || false
//             });
//         });
//         return info;
//     }

//     getConnectionStats() {
//         return {
//             totalConnections: this.connectionCounter,
//             activeConnections: this.clients.size,
//             rateLimitMapSize: this.connectionAttempts.size,
//             localhostConnections: Array.from(this.clients.values()).filter(c => c.isLocalhost).length
//         };
//     }

//     close() {
//         if (this.wss) {
//             console.log('🛑 Closing WebSocket server...');
//             console.log(`Active connections: ${this.clients.size}`);
            
//             // Close all client connections with proper close code
//             this.clients.forEach((client, ws) => {
//                 if (ws.readyState === 1) {
//                     ws.close(1000, 'Server shutting down');
//                 }
//             });
            
//             this.clients.clear();
//             this.wss.close();
//             this.isInitialized = false;
//             clearInterval(this.cleanupInterval);
            
//             console.log('✅ WebSocket server closed gracefully');
//         }
//     }
// }

// // Create singleton instance
// const qrSocketServer = new QRSocketServer();
// export { qrSocketServer };



// services/qrSocketServer.js - COMPLETE CORRECTED VERSION
import { WebSocketServer } from 'ws';

class QRSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Map();
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
        
        // Cleanup interval for old rate limit entries
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldAttempts();
        }, 60000);
    }

    // Set bot reference from server.js
    setBot(botInstance) {
        this.bot = botInstance;
        console.log('🤖 Bot instance set in QR Socket Server');
    }

    initialize(server, botInstance = null) {
        if (this.isInitialized) {
            console.log('📡 WebSocket server already initialized');
            return;
        }

        // Set bot if provided
        if (botInstance) {
            this.bot = botInstance;
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
                path: '/ws/qr', // CHANGED from '/ws' to '/ws/qr'
                clientTracking: true,
                perMessageDeflate: false,
                maxPayload: 1048576
            });
            
            this.wss.on('connection', (ws, req) => {
                this.connectionCounter++;
                const clientId = Date.now().toString() + '_' + this.connectionCounter;
                const clientIp = req.socket.remoteAddress || 'unknown';
                const userAgent = req.headers['user-agent'] || 'Unknown';
                
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
                
                console.log(`🔗 New QR WebSocket client: ${clientId} from ${clientIp}`);
                
                // Store client
                this.clients.set(ws, {
                    id: clientId,
                    connectedAt: new Date(),
                    ip: clientIp,
                    userAgent: userAgent,
                    isAlive: true,
                    isLocalhost: isLocalhost,
                    authenticated: false
                });
                
                // Setup heartbeat detection
                ws.isAlive = true;
                
                ws.on('pong', () => {
                    ws.isAlive = true;
                });
                
                // Send welcome message with initial bot status
                setTimeout(() => {
                    if (ws.readyState === 1) { // WebSocket.OPEN
                        try {
                            // Get current bot status
                            const botStatus = this.bot ? this.bot.getStatus() : {
                                connected: false,
                                authenticated: false,
                                hasQR: false,
                                qr: null
                            };
                            
                            ws.send(JSON.stringify({
                                type: 'connected',
                                message: 'Connected to WhatsApp QR WebSocket',
                                clientId: clientId,
                                serverTime: new Date().toISOString(),
                                version: '1.0.0',
                                botStatus: {
                                    connected: botStatus.connected,
                                    authenticated: botStatus.authenticated,
                                    hasQR: !!botStatus.qr,
                                    qr: botStatus.qr
                                },
                                endpoint: 'qr' // Identify this as QR socket
                            }));
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
                        // Send error back to client
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
                    
                    console.log(`🔌 QR WebSocket client disconnected: ${clientId}`, { 
                        code, 
                        reason: reason.toString() || 'No reason',
                        duration: `${duration}ms`
                    });
                    
                    this.clients.delete(ws);
                });
                
                ws.on('error', (error) => {
                    // SAFE error logging - won't crash
                    try {
                        console.error(`❌ QR WebSocket error for client ${clientId}:`, error.message);
                    } catch {
                        console.log(`❌ QR WebSocket error for client ${clientId}`);
                    }
                    this.clients.delete(ws);
                });
            });
            
            // Setup heartbeat interval for all clients
            const heartbeatInterval = setInterval(() => {
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
                        try {
                            console.log('❌ Error in QR WebSocket heartbeat ping:', error.message);
                        } catch {
                            // Ignore logging errors
                        }
                    }
                });
            }, 30000);
            
            // Clear interval on server close
            this.wss.on('close', () => {
                clearInterval(heartbeatInterval);
            });
            
            this.isInitialized = true;
            
            const address = server.address();
            if (address) {
                console.log('✅ QR WebSocket server initialized successfully');
                console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws/qr`);
                console.log(`📱 Connected to bot: ${this.bot ? 'YES' : 'NO'}`);
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize QR WebSocket server:', error.message);
        }
    }

    // Clean up old rate limit entries
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

    // Rate limiting method
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
                        clientId: client?.id
                    }));
                }
                break;
                
            case 'get_status':
                if (ws.readyState === 1) {
                    const status = this.bot ? this.bot.getStatus() : {
                        connected: false,
                        authenticated: false,
                        hasQR: false,
                        qr: null
                    };
                    
                    ws.send(JSON.stringify({
                        type: 'status',
                        connected: status.connected,
                        authenticated: status.authenticated,
                        hasQR: !!status.qr,
                        qr: status.qr,
                        message: status.connected ? 'WhatsApp is connected' : 
                                status.qr ? 'QR code required' : 'Not connected',
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'get_qr':
                if (ws.readyState === 1) {
                    const qr = this.bot ? this.bot.getCurrentQR() : null;
                    ws.send(JSON.stringify({
                        type: 'qr_response',
                        qr: qr,
                        hasQr: !!qr,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'get_stats':
                if (ws.readyState === 1) {
                    const stats = this.bot ? this.bot.getStatus()?.stats : {};
                    ws.send(JSON.stringify({
                        type: 'stats',
                        stats: stats,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'identify':
                if (ws.readyState === 1) {
                    // Mark as authenticated
                    if (client) {
                        client.authenticated = true;
                    }
                    
                    ws.send(JSON.stringify({
                        type: 'identified',
                        clientId: client?.id,
                        message: `QR client identified as: ${data.clientName || 'Unknown'}`,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
                
            case 'authenticate':
                // Simple authentication for QR clients
                if (ws.readyState === 1) {
                    const isValid = data.token === process.env.QR_CLIENT_TOKEN || 
                                   data.token === 'dev-token-2024';
                    
                    if (client) {
                        client.authenticated = isValid;
                    }
                    
                    ws.send(JSON.stringify({
                        type: isValid ? 'auth_success' : 'auth_failed',
                        clientId: client?.id,
                        message: isValid ? 'Authentication successful' : 'Authentication failed',
                        timestamp: new Date().toISOString()
                    }));
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

    // ========== BROADCAST METHODS ==========

    broadcastQR(qr) {
        if (!qr) return;
        
        const now = Date.now();
        if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
            return;
        }
        
        this.lastQrBroadcast = now;
        this.broadcast({
            type: 'qr_update',
            qr: qr,
            timestamp: new Date().toISOString(),
            hasQr: true
        });
    }

    broadcastStatus(status, message) {
        const now = Date.now();
        if (now - this.lastStatusBroadcast < this.statusBroadcastInterval && this.lastStatusBroadcast !== 0) {
            return;
        }
        
        this.lastStatusBroadcast = now;
        this.broadcast({
            type: 'status_update',
            status: status,
            message: message || '',
            timestamp: new Date().toISOString()
        });
    }

    broadcastStats(stats) {
        if (!stats) return;
        
        const now = Date.now();
        if (now - this.lastStatsBroadcast < this.statsBroadcastInterval && this.lastStatsBroadcast !== 0) {
            return;
        }
        
        this.lastStatsBroadcast = now;
        this.broadcast({
            type: 'stats_update',
            stats: stats,
            timestamp: new Date().toISOString()
        }, true);
    }

    broadcastConnected() {
        this.broadcast({
            type: 'bot_connected',
            message: 'WhatsApp connected successfully',
            timestamp: new Date().toISOString()
        });
    }

    broadcastDisconnected(reason) {
        this.broadcast({
            type: 'bot_disconnected',
            reason: reason || 'Unknown reason',
            timestamp: new Date().toISOString()
        });
    }

    broadcast(data, suppressLog = false) {
        if (!this.wss || !this.isInitialized) {
            if (!suppressLog) {
                console.log('⚠️ QR WebSocket server not initialized');
            }
            return;
        }

        const message = JSON.stringify(data);
        let sentCount = 0;
        let errorCount = 0;
        const clientsToDelete = [];

        // Iterate through clients
        this.clients.forEach((client, ws) => {
            if (ws.readyState === 1) {
                try {
                    ws.send(message);
                    sentCount++;
                } catch (error) {
                    if (!suppressLog) {
                        try {
                            console.error(`❌ Failed to send to QR client ${client.id}:`, error.message);
                        } catch {
                            console.log(`❌ Failed to send to QR client ${client.id}`);
                        }
                    }
                    errorCount++;
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
            console.log(`📤 QR Broadcast to ${sentCount} client(s): ${data.type}`);
        }
        
        if (errorCount > 0 && !suppressLog) {
            console.log(`⚠️ Failed to send to ${errorCount} QR client(s)`);
        }
    }

    // ========== UTILITY METHODS ==========

    getClientCount() {
        return this.clients.size;
    }

    getClientInfo() {
        const info = [];
        const now = Date.now();
        
        this.clients.forEach((client, ws) => {
            info.push({
                id: client.id,
                ip: client.ip,
                userAgent: client.userAgent?.substring(0, 50) || 'Unknown',
                connectedAt: client.connectedAt,
                connectionDuration: now - client.connectedAt.getTime(),
                readyState: ws.readyState,
                isAlive: ws.isAlive === true,
                isLocalhost: client.isLocalhost || false,
                authenticated: client.authenticated || false
            });
        });
        return info;
    }

    getConnectionStats() {
        return {
            totalConnections: this.connectionCounter,
            activeConnections: this.clients.size,
            authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length,
            localhostConnections: Array.from(this.clients.values()).filter(c => c.isLocalhost).length
        };
    }

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
            
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
            }
            
            console.log('✅ QR WebSocket server closed gracefully');
        }
    }
}

// Create singleton instance
const qrSocketServer = new QRSocketServer();
export { qrSocketServer };