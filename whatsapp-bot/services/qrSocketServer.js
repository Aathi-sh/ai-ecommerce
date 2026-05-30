// services/qrSocketServer.js - COMPLETE MULTI-TENANT VERSION (FIXED)
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
        
        // ✅ FIX: Track if event listeners are registered
        this.eventListenersRegistered = false;
        
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
        
        // ✅ FIX: Register event listeners immediately when bot is set
        this.registerBotEventListeners();
    }

    // ✅ NEW: Register bot event listeners for QR updates
    registerBotEventListeners() {
        if (!this.bot) {
            console.log('⚠️ Bot not set yet, will register listeners later');
            return;
        }
        
        if (this.eventListenersRegistered) {
            console.log('📡 Bot event listeners already registered');
            return;
        }
        
        console.log('📡 Registering bot event listeners for QR updates...');
        
        // Listen for QR update events from bot
        this.bot.on('qr-update', (qrData) => {
            console.log(`\n🔍 [QR Socket] Received QR update event from bot`);
            console.log(`🔍 CompanyId: ${qrData?.companyId || 'unknown'}`);
            console.log(`🔍 QR exists: ${!!qrData?.qr}`);
            
            if (qrData && qrData.companyId && qrData.qr) {
                // Broadcast to all clients for this company
                this.broadcastQR(qrData.companyId, qrData.qr);
            } else if (qrData && qrData.qr) {
                // Fallback: if no companyId, broadcast to all (single tenant mode)
                console.log(`⚠️ QR update without companyId, broadcasting to all clients`);
                this.broadcastToAll({
                    type: 'qr_update',
                    qr: qrData.qr,
                    timestamp: new Date().toISOString(),
                    hasQr: true
                });
            }
        });
        
        // Listen for status change events
        this.bot.on('status-change', (statusData) => {
            console.log(`📡 Received status change event: ${statusData?.status}`);
            
            if (statusData && statusData.companyId) {
                this.broadcastStatus(
                    statusData.companyId,
                    statusData.status,
                    statusData.message
                );
            }
        });
        
        // Listen for bot connected event
        this.bot.on('bot-connected', (data) => {
            console.log(`✅ Bot connected event received for company: ${data?.companyId}`);
            if (data && data.companyId) {
                this.broadcastConnected(data.companyId);
            }
        });
        
        // Listen for bot disconnected event
        this.bot.on('bot-disconnected', (data) => {
            console.log(`❌ Bot disconnected event received for company: ${data?.companyId}`);
            if (data && data.companyId) {
                this.broadcastDisconnected(data.companyId, data.reason);
            }
        });
        
        this.eventListenersRegistered = true;
        console.log('✅ Bot event listeners registered successfully');
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
            this.registerBotEventListeners();
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
                console.log(`📡 Bot event listeners: ${this.eventListenersRegistered ? 'YES' : 'NO'}`);
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
                    // ✅ FIX: First check our QR cache for this company
                    let qrData = null;
                    let connectionStatus = 'disconnected';
                    let isConnected = false;
                    
                    // ✅ PRIORITY 1: Check our own QR cache (most reliable)
                    if (companyId && this.companyQRs.has(companyId)) {
                        const cachedQR = this.companyQRs.get(companyId);
                        if (cachedQR.expiresAt > Date.now()) {
                            qrData = cachedQR.qr;
                            connectionStatus = 'qr_required';
                            console.log(`✅ Found QR in cache for company ${companyId}`);
                        }
                    }
                    
                    // ✅ PRIORITY 2: Try session manager if no cache hit
                    if (!qrData && this.sessionManager && companyId) {
                        const session = this.sessionManager.getSessionStatus(companyId);
                        qrData = session?.qrData || null;
                        connectionStatus = session?.status || 'disconnected';
                        isConnected = session?.connected || false;
                    } 
                    // ✅ PRIORITY 3: Fallback to bot
                    else if (!qrData && this.bot && companyId) {
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
                    
                    // ✅ If we have QR in cache, also send it as separate update
                    if (qrData) {
                        setTimeout(() => {
                            if (ws.readyState === 1) {
                                ws.send(JSON.stringify({
                                    type: 'qr_update',
                                    qr: qrData,
                                    companyId: companyId,
                                    timestamp: new Date().toISOString(),
                                    hasQr: true,
                                    fromCache: true
                                }));
                            }
                        }, 500);
                    }
                    
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
                    
                    // ✅ Check QR cache first
                    let qrData = null;
                    if (companyId && this.companyQRs.has(companyId)) {
                        const cachedQR = this.companyQRs.get(companyId);
                        if (cachedQR.expiresAt > Date.now()) {
                            qrData = cachedQR.qr;
                            status.hasQR = true;
                            status.qr = qrData;
                        }
                    }
                    
                    // Try session manager first (multi-tenant)
                    if (this.sessionManager && companyId) {
                        const sessionStatus = this.sessionManager.getSessionStatus(companyId);
                        status = {
                            connected: sessionStatus?.connected || false,
                            authenticated: sessionStatus?.status === 'connected',
                            hasQR: !!sessionStatus?.qrData || !!qrData,
                            qr: sessionStatus?.qrData || qrData
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
                                hasQR: !!botStatus.qrData || !!qrData,
                                qr: botStatus.qrData?.qr || qrData
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
                    
                    // ✅ Check QR cache first
                    if (companyId && this.companyQRs.has(companyId)) {
                        const cachedQR = this.companyQRs.get(companyId);
                        if (cachedQR.expiresAt > Date.now()) {
                            qr = cachedQR.qr;
                            console.log(`✅ Returning QR from cache for company ${companyId}`);
                        }
                    }
                    
                    // If not in cache, try other sources
                    if (!qr && this.sessionManager && companyId) {
                        const session = this.sessionManager.getSessionStatus(companyId);
                        qr = session?.qrData || null;
                    } else if (!qr && this.bot && companyId) {
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
        console.log(`\n📢 [QR Socket] broadcastQR called for company: ${companyId}`);
        console.log(`📢 QR Data length: ${qrData?.length || 0}`);
        
        if (!companyId || !qrData) {
            console.log(`⚠️ Missing companyId or qrData, skipping broadcast`);
            return;
        }
        
        const now = Date.now();
        
        // ✅ Store in company cache immediately (before throttling check)
        this.companyQRs.set(companyId, {
            qr: qrData,
            expiresAt: now + 60000 // 60 seconds
        });
        console.log(`✅ QR stored in cache for company ${companyId}, expires in 60s`);
        
        // Throttle broadcasts
        if (now - this.lastQrBroadcast < this.qrBroadcastInterval && this.lastQrBroadcast !== 0) {
            console.log(`⏱️ Throttling QR broadcast for company ${companyId} (${now - this.lastQrBroadcast}ms < ${this.qrBroadcastInterval}ms)`);
            return;
        }
        
        this.lastQrBroadcast = now;
        
        // Create message payload
        const message = {
            type: 'qr_update',
            qr: qrData,
            companyId: companyId,
            timestamp: new Date().toISOString(),
            hasQr: true,
            expiresIn: 60
        };
        
        // Broadcast only to clients viewing this company
        const sentCount = this.broadcastToCompany(companyId, message);
        console.log(`📤 QR broadcast to ${sentCount} client(s) for company ${companyId}`);
        
        // Also broadcast to Socket.IO QR namespace if available
        if (this.io) {
            try {
                const qrNamespace = this.io.of('/qr');
                qrNamespace.to(`company:${companyId}`).emit('qr_update', message);
                console.log(`📤 QR broadcast to Socket.IO for company ${companyId}`);
            } catch (error) {
                console.error(`❌ Socket.IO broadcast failed:`, error.message);
            }
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
     * @returns {number} Number of clients that received the message
     */
    broadcastToCompany(companyId, data, suppressLog = false) {
        if (!this.wss || !this.isInitialized) return 0;

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
        
        return sentCount;
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
            byCompany: Object.fromEntries(companies),
            qrCacheSize: this.companyQRs.size,
            cachedCompanies: Array.from(this.companyQRs.keys())
        };
    }

    /**
     * Get QR for a specific company (for debugging)
     */
    getQRForCompany(companyId) {
        if (!companyId) return null;
        
        const cached = this.companyQRs.get(companyId);
        if (cached && cached.expiresAt > Date.now()) {
            return {
                qr: cached.qr,
                expiresIn: Math.floor((cached.expiresAt - Date.now()) / 1000)
            };
        }
        return null;
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