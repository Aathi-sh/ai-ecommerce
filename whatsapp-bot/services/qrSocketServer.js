// import { WebSocketServer } from 'ws';

// class QRSocketServer {
//     constructor() {
//         this.wss = null;
//         this.clients = new Map();
//         this.isInitialized = false;
//     }

//     initialize(server) {
//         if (this.isInitialized) {
//             console.log('📡 WebSocket server already initialized');
//             return;
//         }

//         try {
//             this.wss = new WebSocketServer({ 
//                 server, 
//                 path: '/ws',
//                 clientTracking: true
//             });
            
//             this.wss.on('connection', (ws, req) => {
//                 const clientId = Date.now().toString();
//                 const clientIp = req.socket.remoteAddress;
                
//                 console.log(`🔗 New WebSocket client connected: ${clientId} from ${clientIp}`);
                
//                 // Store client
//                 this.clients.set(ws, {
//                     id: clientId,
//                     connectedAt: new Date(),
//                     ip: clientIp
//                 });
                
//                 // Send welcome message
//                 ws.send(JSON.stringify({
//                     type: 'connected',
//                     message: 'Connected to WhatsApp bot server',
//                     clientId: clientId,
//                     timestamp: new Date().toISOString()
//                 }));
                
//                 // Setup ping interval for this client
//                 const pingInterval = setInterval(() => {
//                     if (ws.readyState === 1) { // WebSocket.OPEN
//                         try {
//                             ws.ping();
//                         } catch (error) {
//                             console.log(`❌ Error pinging client ${clientId}:`, error.message);
//                             clearInterval(pingInterval);
//                         }
//                     } else {
//                         clearInterval(pingInterval);
//                     }
//                 }, 30000); // Ping every 30 seconds
                
//                 ws.on('pong', () => {
//                     // Client is still alive
//                 });
                
//                 ws.on('message', (message) => {
//                     try {
//                         const data = JSON.parse(message);
//                         this.handleMessage(ws, data);
//                     } catch (error) {
//                         console.error('❌ WebSocket message parse error:', error);
//                     }
//                 });
                
//                 ws.on('close', (code, reason) => {
//                     console.log(`🔌 WebSocket client disconnected: ${clientId}`, { 
//                         code, 
//                         reason: reason.toString() || 'No reason provided' 
//                     });
//                     clearInterval(pingInterval);
//                     this.clients.delete(ws);
//                 });
                
//                 ws.on('error', (error) => {
//                     console.error(`❌ WebSocket error for client ${clientId}:`, error);
//                     clearInterval(pingInterval);
//                     this.clients.delete(ws);
//                 });
//             });
            
//             this.isInitialized = true;
            
//             // Get port from server address (server is already listening now)
//             const address = server.address();
//             if (address) {
//                 console.log('📡 WebSocket server initialized successfully');
//                 console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws`);
//             } else {
//                 console.log('📡 WebSocket server initialized');
//                 console.log('👥 Ready for WebSocket connections');
//             }
            
//         } catch (error) {
//             console.error('❌ Failed to initialize WebSocket server:', error);
//         }
//     }

//     handleMessage(ws, data) {
//         const client = this.clients.get(ws);
        
//         switch (data.type) {
//             case 'ping':
//                 // Respond to ping
//                 ws.send(JSON.stringify({
//                     type: 'pong',
//                     timestamp: new Date().toISOString(),
//                     clientId: client?.id
//                 }));
//                 break;
                
//             case 'get_status':
//                 // Client requesting status
//                 // You could implement status retrieval here
//                 break;
                
//             default:
//                 console.log(`📨 Received message from client ${client?.id}:`, data.type);
//         }
//     }

//     broadcastQR(qr) {
//         this.broadcast({
//             type: 'qr',
//             qr: qr,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastStatus(status, message) {
//         this.broadcast({
//             type: 'status',
//             status: status,
//             message: message,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastStats(stats) {
//         this.broadcast({
//             type: 'stats',
//             stats: stats,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastBotInfo(botInfo) {
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
//             reason: reason,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcast(data) {
//         if (!this.wss) {
//             console.log('⚠️ WebSocket server not initialized, cannot broadcast');
//             return;
//         }

//         const message = JSON.stringify(data);
//         let sentCount = 0;
//         let errorCount = 0;

//         this.clients.forEach((client, ws) => {
//             if (ws.readyState === 1) { // WebSocket.OPEN
//                 try {
//                     ws.send(message);
//                     sentCount++;
//                 } catch (error) {
//                     console.error(`❌ Failed to send to client ${client.id}:`, error.message);
//                     errorCount++;
//                     this.clients.delete(ws);
//                 }
//             } else {
//                 // Clean up closed connections
//                 this.clients.delete(ws);
//             }
//         });

//         if (sentCount > 0) {
//             console.log(`📤 Broadcast to ${sentCount} client(s): ${data.type}`);
//         }
        
//         if (errorCount > 0) {
//             console.log(`⚠️ Failed to send to ${errorCount} client(s)`);
//         }
//     }

//     getClientCount() {
//         return this.clients.size;
//     }

//     getClientInfo() {
//         const info = [];
//         this.clients.forEach((client, ws) => {
//             info.push({
//                 id: client.id,
//                 ip: client.ip,
//                 connectedAt: client.connectedAt,
//                 readyState: ws.readyState,
//                 isAlive: ws.readyState === 1
//             });
//         });
//         return info;
//     }

//     close() {
//         if (this.wss) {
//             console.log('🛑 Closing WebSocket server...');
            
//             // Close all client connections
//             this.clients.forEach((client, ws) => {
//                 if (ws.readyState === 1) {
//                     ws.close(1000, 'Server shutting down');
//                 }
//             });
            
//             this.clients.clear();
//             this.wss.close();
//             this.isInitialized = false;
//             console.log('✅ WebSocket server closed');
//         }
//     }
// }

// // Create singleton instance
// const qrSocketServer = new QRSocketServer();
// export { qrSocketServer };





import { WebSocketServer } from 'ws';

class QRSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Map();
        this.isInitialized = false;
        
        // Add throttling variables
        this.lastStatsBroadcast = 0;
        this.statsBroadcastInterval = 5000; // 5 seconds minimum between stats broadcasts
        
        this.lastQrBroadcast = 0;
        this.qrBroadcastInterval = 2000; // 2 seconds minimum between QR broadcasts
        
        this.lastStatusBroadcast = 0;
        this.statusBroadcastInterval = 3000; // 3 seconds minimum between status broadcasts
        
        // Rate limiting for connections
        this.connectionAttempts = new Map(); // Track connection attempts by IP
        this.maxConnectionsPerMinute = 10; // Limit connections from same IP
        this.connectionCounter = 0;
    }

    initialize(server) {
        if (this.isInitialized) {
            console.log('📡 WebSocket server already initialized');
            return;
        }

        try {
            // Validate server is listening
            if (!server.listening) {
                console.error('❌ HTTP server is not listening yet');
                return;
            }

            this.wss = new WebSocketServer({ 
                server, 
                path: '/ws',
                clientTracking: true,
                // Additional WebSocket options
                perMessageDeflate: false,
                maxPayload: 1048576 // 1MB max payload
            });
            
            // Add connection validation
            this.wss.on('headers', (headers, req) => {
                // Log connection attempt for debugging
                const origin = req.headers.origin;
                const userAgent = req.headers['user-agent'] || 'Unknown';
                console.log(`🔍 Connection attempt from origin: ${origin}, User-Agent: ${userAgent.substring(0, 50)}...`);
            });
            
            this.wss.on('connection', (ws, req) => {
                this.connectionCounter++;
                const clientId = Date.now().toString() + '_' + this.connectionCounter;
                const clientIp = req.socket.remoteAddress || 'unknown';
                const userAgent = req.headers['user-agent'] || 'Unknown';
                
                // Check rate limit
                if (!this.checkRateLimit(clientIp)) {
                    console.log(`⛔ Rate limit exceeded for IP: ${clientIp}. Closing connection.`);
                    ws.close(1008, 'Rate limit exceeded. Please wait before reconnecting.');
                    return;
                }
                
                console.log(`🔗 New WebSocket client connected: ${clientId} from ${clientIp} (User-Agent: ${userAgent.substring(0, 50)}...)`);
                
                // Store client
                this.clients.set(ws, {
                    id: clientId,
                    connectedAt: new Date(),
                    ip: clientIp,
                    userAgent: userAgent,
                    isAlive: true
                });
                
                // Setup heartbeat detection
                ws.isAlive = true;
                
                ws.on('pong', () => {
                    ws.isAlive = true;
                });
                
                // Send welcome message with a small delay to ensure connection is ready
                setTimeout(() => {
                    if (ws.readyState === 1) { // WebSocket.OPEN
                        try {
                            ws.send(JSON.stringify({
                                type: 'connected',
                                message: 'Connected to WhatsApp bot server',
                                clientId: clientId,
                                serverTime: new Date().toISOString(),
                                version: '1.0.0'
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
                        console.error('❌ WebSocket message parse error:', error);
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
                    
                    // Only log disconnections that lasted more than 1 second (to reduce spam)
                    if (duration > 1000 || code !== 1005) {
                        console.log(`🔌 WebSocket client disconnected: ${clientId}`, { 
                            code, 
                            reason: reason.toString() || 'No reason provided',
                            duration: `${duration}ms`,
                            userAgent: client?.userAgent?.substring(0, 30) || 'Unknown'
                        });
                    }
                    
                    this.clients.delete(ws);
                });
                
                ws.on('error', (error) => {
                    console.error(`❌ WebSocket error for client ${clientId}:`, error.message);
                    this.clients.delete(ws);
                });
            });
            
            // Setup heartbeat interval for all clients
            const heartbeatInterval = setInterval(() => {
                this.wss.clients.forEach((ws) => {
                    if (ws.isAlive === false) {
                        console.log('💔 Terminating stale WebSocket connection');
                        return ws.terminate();
                    }
                    
                    ws.isAlive = false;
                    
                    // Use try-catch to prevent ping errors from crashing the server
                    try {
                        ws.ping();
                    } catch (error) {
                        console.log('❌ Error in heartbeat ping:', error.message);
                    }
                });
            }, 30000);
            
            // Clear interval on server close
            this.wss.on('close', () => {
                clearInterval(heartbeatInterval);
            });
            
            this.isInitialized = true;
            
            // Get port from server address
            const address = server.address();
            if (address) {
                console.log('✅ WebSocket server initialized successfully');
                console.log(`👥 Ready for connections at ws://localhost:${address.port}/ws`);
                console.log(`⚙️  Max connections per IP per minute: ${this.maxConnectionsPerMinute}`);
            } else {
                console.log('✅ WebSocket server initialized');
                console.log('👥 Ready for WebSocket connections');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize WebSocket server:', error);
            console.error('Error stack:', error.stack);
        }
    }

    // Rate limiting method
    checkRateLimit(ip) {
        const now = Date.now();
        const minuteAgo = now - 60000; // 1 minute ago
        
        // Get or create attempts array for this IP
        if (!this.connectionAttempts.has(ip)) {
            this.connectionAttempts.set(ip, []);
        }
        
        const attempts = this.connectionAttempts.get(ip);
        
        // Filter attempts from the last minute
        const recentAttempts = attempts.filter(time => time > minuteAgo);
        
        // Update attempts
        this.connectionAttempts.set(ip, [...recentAttempts, now]);
        
        // Check if over limit
        if (recentAttempts.length >= this.maxConnectionsPerMinute) {
            return false;
        }
        
        return true;
    }

    handleMessage(ws, data) {
        const client = this.clients.get(ws);
        
        if (!data || !data.type) {
            console.log(`📨 Received malformed message from client ${client?.id}`);
            return;
        }
        
        switch (data.type.toLowerCase()) {
            case 'ping':
                // Respond to ping
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: new Date().toISOString(),
                        clientId: client?.id
                    }));
                }
                break;
                
            case 'get_status':
                // Client requesting status
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'status_response',
                        timestamp: new Date().toISOString(),
                        clientId: client?.id,
                        message: 'Status request received'
                    }));
                }
                break;
                
            case 'get_stats':
                // Client requesting stats
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'stats_response',
                        timestamp: new Date().toISOString(),
                        clientId: client?.id,
                        message: 'Stats request received'
                    }));
                }
                break;
                
            case 'identify':
                // Client identifying itself
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'identified',
                        timestamp: new Date().toISOString(),
                        clientId: client?.id,
                        message: `Client identified as: ${data.clientName || 'Unknown'}`
                    }));
                }
                break;
                
            default:
                console.log(`📨 Received ${data.type} message from client ${client?.id}`);
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

    broadcastQR(qr) {
        if (!qr) return;
        
        // Throttle QR broadcasts to avoid spam
        const now = Date.now();
        if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
            return; // Skip if too soon since last broadcast
        }
        
        this.lastQrBroadcast = now;
        this.broadcast({
            type: 'qr',
            qr: qr,
            timestamp: new Date().toISOString(),
            hasQr: true
        });
    }

    broadcastStatus(status, message) {
        // Throttle status broadcasts to avoid spam
        const now = Date.now();
        if (now - this.lastStatusBroadcast < this.statusBroadcastInterval && this.lastStatusBroadcast !== 0) {
            return; // Skip if too soon since last broadcast
        }
        
        this.lastStatusBroadcast = now;
        this.broadcast({
            type: 'status',
            status: status,
            message: message || '',
            timestamp: new Date().toISOString()
        });
    }

    broadcastStats(stats) {
        if (!stats) return;
        
        // Throttle stats broadcasts to avoid spam
        const now = Date.now();
        if (now - this.lastStatsBroadcast < this.statsBroadcastInterval && this.lastStatsBroadcast !== 0) {
            return; // Skip if too soon since last broadcast
        }
        
        this.lastStatsBroadcast = now;
        this.broadcast({
            type: 'stats',
            stats: stats,
            timestamp: new Date().toISOString()
        }, true); // Pass true to suppress log for stats
    }

    broadcastBotInfo(botInfo) {
        if (!botInfo) return;
        
        this.broadcast({
            type: 'bot_info',
            botInfo: botInfo,
            timestamp: new Date().toISOString()
        });
    }

    broadcastConnected() {
        this.broadcast({
            type: 'connected',
            message: 'WhatsApp connected successfully',
            timestamp: new Date().toISOString()
        });
    }

    broadcastDisconnected(reason) {
        this.broadcast({
            type: 'disconnected',
            reason: reason || 'Unknown reason',
            timestamp: new Date().toISOString()
        });
    }

    broadcast(data, suppressLog = false) {
        if (!this.wss || !this.isInitialized) {
            if (!suppressLog) {
                console.log('⚠️ WebSocket server not initialized, cannot broadcast');
            }
            return;
        }

        const message = JSON.stringify(data);
        let sentCount = 0;
        let errorCount = 0;
        const clientsToDelete = [];

        // Iterate through clients
        this.clients.forEach((client, ws) => {
            if (ws.readyState === 1) { // WebSocket.OPEN
                try {
                    ws.send(message);
                    sentCount++;
                } catch (error) {
                    if (!suppressLog) {
                        console.error(`❌ Failed to send to client ${client.id}:`, error.message);
                    }
                    errorCount++;
                    clientsToDelete.push(ws);
                }
            } else {
                // Mark closed connections for cleanup
                clientsToDelete.push(ws);
            }
        });

        // Clean up dead connections
        clientsToDelete.forEach(ws => {
            this.clients.delete(ws);
        });

        // Log broadcast info (with suppression for stats)
        if (sentCount > 0 && !suppressLog) {
            console.log(`📤 Broadcast to ${sentCount} client(s): ${data.type}`);
        }
        
        if (errorCount > 0 && !suppressLog) {
            console.log(`⚠️ Failed to send to ${errorCount} client(s)`);
        }
        
        // Log stats broadcasts only every 10th time to reduce console spam
        if (data.type === 'stats' && sentCount > 0) {
            if (this.statsBroadcastCount % 10 === 0) {
                console.log(`📊 Stats broadcast to ${sentCount} client(s) (showing every 10th)`);
            }
            this.statsBroadcastCount = (this.statsBroadcastCount || 0) + 1;
        }
    }

    // Force broadcast stats (bypass throttling for important updates)
    forceBroadcastStats(stats) {
        if (!stats) return;
        
        this.lastStatsBroadcast = Date.now();
        this.broadcast({
            type: 'stats',
            stats: stats,
            timestamp: new Date().toISOString(),
            force: true
        });
    }

    // Force broadcast status (bypass throttling for important updates)
    forceBroadcastStatus(status, message) {
        this.lastStatusBroadcast = Date.now();
        this.broadcast({
            type: 'status',
            status: status,
            message: message || '',
            timestamp: new Date().toISOString(),
            force: true
        });
    }

    // Force broadcast QR (bypass throttling for important updates)
    forceBroadcastQR(qr) {
        if (!qr) return;
        
        this.lastQrBroadcast = Date.now();
        this.broadcast({
            type: 'qr',
            qr: qr,
            timestamp: new Date().toISOString(),
            force: true,
            hasQr: true
        });
    }

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
                isAlive: ws.isAlive === true
            });
        });
        return info;
    }

    getConnectionStats() {
        return {
            totalConnections: this.connectionCounter,
            activeConnections: this.clients.size,
            rateLimitMapSize: this.connectionAttempts.size
        };
    }

    close() {
        if (this.wss) {
            console.log('🛑 Closing WebSocket server...');
            console.log(`Active connections: ${this.clients.size}`);
            
            // Close all client connections with proper close code
            this.clients.forEach((client, ws) => {
                if (ws.readyState === 1) {
                    ws.close(1000, 'Server shutting down');
                }
            });
            
            this.clients.clear();
            this.wss.close();
            this.isInitialized = false;
            
            console.log('✅ WebSocket server closed gracefully');
        }
    }
}

// Create singleton instance
const qrSocketServer = new QRSocketServer();
export { qrSocketServer };