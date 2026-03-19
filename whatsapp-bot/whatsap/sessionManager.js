










// // services/sessionManager.js
// // PROFESSIONAL MULTI-TENANT SESSION MANAGER
// // Manages WhatsApp sessions for multiple companies with MongoDB storage
// // Integrated with QR WebSocket server for real-time dashboard updates
// // UPDATED: Uses API calls instead of direct model imports

// import { EventEmitter } from 'events';
// import mongoose from 'mongoose';

// import { MongoStore } from 'wwebjs-mongo';
// import qrcode from 'qrcode-terminal';
// import axios from 'axios';
// import pkg from 'whatsapp-web.js'; 
// import handleMessage from './messageHandler.js';
// import { qrSocketServer } from '../services/qrSocketServer.js'; // Your existing QR WebSocket


// const { Client, RemoteAuth } = pkg;


// class SessionManager extends EventEmitter {
//     constructor() {
//         super();
        
//         // API configuration for Next.js
//         this.apiBaseUrl = process.env.NEXTJS_API_URL || 'http://localhost:3000';
//         this.apiClient = axios.create({
//             baseURL: this.apiBaseUrl,
//             timeout: 5000,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });
        
//         // Store active sessions: Map<companyId, { client, status, info, qrData }>
//         this.sessions = new Map();
        
//         // Session timeouts and intervals
//         this.reconnectTimeouts = new Map();
//         this.monitorInterval = null;
//         this.statsInterval = null;
        
//         // Configuration
//         this.config = {
//             qrExpiryTime: 60000, // 60 seconds
//             maxReconnectAttempts: 5,
//             reconnectDelay: 5000,
//             monitorInterval: 300000, // 5 minutes
//             statsInterval: 60000, // 1 minute
//             sessionBackupInterval: 300000 // 5 minutes
//         };
        
//         // Statistics
//         this.stats = {
//             totalSessions: 0,
//             activeSessions: 0,
//             pendingSessions: 0,
//             failedSessions: 0,
//             totalMessages: 0,
//             messagesToday: 0,
//             lastResetAt: new Date()
//         };
        
//         // MongoDB connection (for session storage only)
//         this.mongoStore = null;
//         this.mongooseConnected = false;
        
//         // Reference to QR WebSocket server
//         this.qrSocketServer = qrSocketServer;
        
//         console.log('📱 [SessionManager] Initialized with API URL:', this.apiBaseUrl);
//     }

//     /**
//      * Extract data from API response
//      */
//     extractData(responseData) {
//         if (!responseData) return null;
        
//         if (responseData.success && responseData.data !== undefined) {
//             return responseData.data;
//         }
        
//         return responseData;
//     }

//     /**
//      * Initialize MongoDB connection for session storage
//      */
//     async connectToMongoDB() {
//         try {
//             const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
            
//             if (mongoose.connection.readyState === 1) {
//                 console.log('✅ [SessionManager] MongoDB already connected');
//                 this.mongooseConnected = true;
//                 return;
//             }
            
//             console.log(`🔌 [SessionManager] Connecting to MongoDB...`);
            
//             await mongoose.connect(mongoURI, {
//                 serverSelectionTimeoutMS: 5000
//             });
            
//             this.mongooseConnected = true;
//             console.log('✅ [SessionManager] MongoDB connected successfully');
            
//             // Create MongoDB store for RemoteAuth
//             this.mongoStore = new MongoStore({ mongoose });
//             console.log('📦 [SessionManager] MongoStore created');
            
//         } catch (error) {
//             this.mongooseConnected = false;
//             console.error('❌ [SessionManager] MongoDB connection failed:', error.message);
//             throw error;
//         }
//     }

//     /**
//      * Get company details from API
//      */
//     async fetchCompanyById(companyId) {
//         try {
//             console.log(`🔍 [SessionManager] Fetching company ${companyId} from API`);
            
//             const response = await this.apiClient.get(`/api/companies/${companyId}`);
//             return this.extractData(response.data);
            
//         } catch (error) {
//             console.error(`❌ [SessionManager] Failed to fetch company ${companyId}:`, error.message);
//             return null;
//         }
//     }

//     /**
//      * Update company WhatsApp status via API
//      */
//     async updateCompanyWhatsAppStatus(companyId, statusData) {
//         try {
//             console.log(`📡 [SessionManager] Updating company ${companyId} status via API`);
            
//             const response = await this.apiClient.patch(`/api/companies/${companyId}/whatsapp-status`, statusData);
//             return this.extractData(response.data);
            
//         } catch (error) {
//             console.error(`❌ [SessionManager] Failed to update company ${companyId} status:`, error.message);
//             return null;
//         }
//     }

//     /**
//      * Initialize session manager (call once on server start)
//      */
//     async initialize() {
//         console.log('🚀 [SessionManager] Initializing...');
        
//         try {
//             // Connect to MongoDB for session storage
//             await this.connectToMongoDB();
            
//             // Restore all active sessions from database
//             await this.restoreAllSessions();
            
//             // Start monitoring
//             this.startMonitoring();
            
//             // Start statistics collection
//             this.startStatsCollection();
            
//             console.log('✅ [SessionManager] Initialized successfully');
//             console.log(`📊 Active sessions: ${this.sessions.size}`);
            
//             // Broadcast initial stats
//             this.broadcastStats();
            
//         } catch (error) {
//             console.error('❌ [SessionManager] Initialization failed:', error);
//             throw error;
//         }
//     }

//     // ========== SESSION CREATION & MANAGEMENT ==========

//     /**
//      * Initialize WhatsApp session for a company
//      * @param {string} companyId - Company ID
//      * @param {Object} options - Additional options
//      * @returns {Promise<Object>} Session client
//      */
//     async initCompanySession(companyId, options = {}) {
//         try {
//             console.log(`🏢 [Company:${companyId}] Initializing WhatsApp session...`);
            
//             // Check if session already exists
//             if (this.sessions.has(companyId)) {
//                 const existing = this.sessions.get(companyId);
//                 if (existing.client && existing.status === 'connected') {
//                     console.log(`✅ [Company:${companyId}] Session already active`);
//                     return existing.client;
//                 }
//             }

//             // Get company details from API
//             const company = await this.fetchCompanyById(companyId);
//             if (!company) {
//                 throw new Error(`Company ${companyId} not found`);
//             }

//             // Generate unique client ID for this company
//             const clientId = `company_${companyId}`;
            
//             console.log(`🆔 [Company:${companyId}] Client ID: ${clientId}`);

//             // Create WhatsApp client with RemoteAuth
//             const client = new Client({
//                 authStrategy: new RemoteAuth({
//                     store: this.mongoStore,
//                     clientId: clientId,
//                     backupSyncIntervalMs: this.config.sessionBackupInterval
//                 }),
//                 puppeteer: {
//                     headless: true,
//                     args: [
//                         '--no-sandbox',
//                         '--disable-setuid-sandbox',
//                         '--disable-dev-shm-usage',
//                         '--disable-accelerated-2d-canvas',
//                         '--no-first-run',
//                         '--no-zygote',
//                         '--disable-gpu',
//                         '--window-size=1920,1080'
//                     ],
//                     timeout: 60000,
//                     ignoreHTTPSErrors: true
//                 },
//                 qrMaxRetries: 3,
//                 authTimeoutMs: 120000,
//                 takeoverOnConflict: true,
//                 takeoverTimeoutMs: 60000
//             });

//             // Session state for this company
//             const sessionState = {
//                 client,
//                 status: 'initializing',
//                 companyId,
//                 clientId,
//                 qrData: null,
//                 qrGeneratedAt: null,
//                 qrTimeout: null,
//                 isWaitingForScan: false,
//                 reconnectAttempts: 0,
//                 connectedAt: null,
//                 info: null,
//                 messageCount: 0
//             };

//             // Store in sessions map
//             this.sessions.set(companyId, sessionState);
//             this.stats.totalSessions++;
//             this.stats.pendingSessions++;

//             // Setup event handlers for this client
//             this.setupClientHandlers(companyId, sessionState, client);

//             // Initialize client
//             console.log(`🔧 [Company:${companyId}] Starting client initialization...`);
//             await client.initialize();

//             return client;

//         } catch (error) {
//             console.error(`❌ [Company:${companyId}] Session initialization failed:`, error);
//             this.stats.failedSessions++;
//             throw error;
//         }
//     }

//     /**
//      * Setup event handlers for a WhatsApp client
//      * @param {string} companyId - Company ID
//      * @param {Object} sessionState - Session state object
//      * @param {Object} client - WhatsApp client
//      */
//     setupClientHandlers(companyId, sessionState, client) {
        
//         // ===== QR CODE HANDLER =====
//         client.on('qr', (qr) => {
//             console.log(`📱 [Company:${companyId}] QR code generated`);
            
//             // Clear previous QR timeout
//             if (sessionState.qrTimeout) {
//                 clearTimeout(sessionState.qrTimeout);
//             }
            
//             // Update session state
//             sessionState.qrData = qr;
//             sessionState.qrGeneratedAt = Date.now();
//             sessionState.isWaitingForScan = true;
//             sessionState.status = 'qr_required';
            
//             // Show QR in terminal (for debugging)
//             qrcode.generate(qr, { small: true });
            
//             // Broadcast QR via WebSocket to dashboard
//             this.broadcastQR(companyId, {
//                 qr: qr,
//                 expiresIn: this.config.qrExpiryTime / 1000,
//                 generatedAt: sessionState.qrGeneratedAt,
//                 companyId: companyId,
//                 clientId: sessionState.clientId
//             });
            
//             // Broadcast status update
//             this.broadcastStatus(companyId, {
//                 status: 'qr_required',
//                 message: 'Scan QR code to connect WhatsApp',
//                 companyId
//             });
            
//             // Set QR expiry timeout
//             sessionState.qrTimeout = setTimeout(() => {
//                 if (sessionState.isWaitingForScan && sessionState.qrData === qr) {
//                     console.log(`⏰ [Company:${companyId}] QR code expired`);
                    
//                     sessionState.isWaitingForScan = false;
//                     sessionState.qrData = null;
                    
//                     // Broadcast expiry
//                     this.broadcastQR(companyId, null);
//                     this.broadcastStatus(companyId, {
//                         status: 'qr_expired',
//                         message: 'QR code expired',
//                         companyId
//                     });
//                 }
//             }, this.config.qrExpiryTime);
//         });

//         // ===== READY HANDLER =====
//         client.on('ready', async () => {
//             console.log(`✅ [Company:${companyId}] WhatsApp client ready`);
            
//             // Update session state
//             sessionState.status = 'connected';
//             sessionState.isWaitingForScan = false;
//             sessionState.qrData = null;
//             sessionState.connectedAt = new Date();
//             sessionState.reconnectAttempts = 0;
            
//             // Clear QR timeout
//             if (sessionState.qrTimeout) {
//                 clearTimeout(sessionState.qrTimeout);
//                 sessionState.qrTimeout = null;
//             }
            
//             // Get client info
//             let phoneNumber = null;
//             let deviceInfo = null;
            
//             try {
//                 const info = await client.getInfo();
//                 sessionState.info = {
//                     pushname: info.pushname,
//                     wid: info.wid.user,
//                     platform: info.platform
//                 };
                
//                 phoneNumber = info.wid.user;
//                 deviceInfo = {
//                     platform: info.platform,
//                     pushname: info.pushname
//                 };
                
//                 console.log(`📞 [Company:${companyId}] Phone: ${info.wid.user}`);
                
//             } catch (error) {
//                 console.log(`⚠️ [Company:${companyId}] Could not get client info`);
//             }
            
//             // Update company in database via API
//             await this.updateCompanyWhatsAppStatus(companyId, {
//                 isConnected: true,
//                 connectionStatus: 'connected',
//                 connectedAt: new Date().toISOString(),
//                 clientId: sessionState.clientId,
//                 phoneNumber: phoneNumber,
//                 deviceInfo: deviceInfo,
//                 reconnectAttempts: 0
//             });
            
//             // Update statistics
//             this.stats.activeSessions++;
//             this.stats.pendingSessions--;
            
//             // Broadcast status
//             this.broadcastStatus(companyId, {
//                 status: 'connected',
//                 message: 'WhatsApp connected successfully',
//                 companyId,
//                 info: sessionState.info
//             });
            
//             // Broadcast updated stats
//             this.broadcastStats();
//         });

//         // ===== AUTHENTICATED HANDLER =====
//         client.on('authenticated', () => {
//             console.log(`🔐 [Company:${companyId}] Authentication successful - Session saved to MongoDB`);
            
//             sessionState.status = 'authenticated';
            
//             this.broadcastStatus(companyId, {
//                 status: 'authenticated',
//                 message: 'Authentication successful',
//                 companyId
//             });
//         });

//         // ===== AUTHENTICATION FAILURE HANDLER =====
//         client.on('auth_failure', (error) => {
//             console.error(`❌ [Company:${companyId}] Authentication failed:`, error.message);
            
//             sessionState.status = 'auth_failed';
            
//             this.broadcastStatus(companyId, {
//                 status: 'auth_failed',
//                 message: `Authentication failed: ${error.message}`,
//                 companyId
//             });
//         });

//         // ===== DISCONNECTED HANDLER =====
//         client.on('disconnected', async (reason) => {
//             console.log(`🔌 [Company:${companyId}] Disconnected: ${reason}`);
            
//             sessionState.status = 'disconnected';
//             sessionState.isWaitingForScan = false;
            
//             // Update statistics
//             this.stats.activeSessions--;
            
//             // Update company in database via API
//             await this.updateCompanyWhatsAppStatus(companyId, {
//                 isConnected: false,
//                 connectionStatus: 'disconnected',
//                 disconnectedAt: new Date().toISOString(),
//                 lastError: reason
//             });
            
//             this.broadcastStatus(companyId, {
//                 status: 'disconnected',
//                 message: `Disconnected: ${reason}`,
//                 companyId
//             });
            
//             // Attempt reconnection if not a logout
//             if (reason !== 'LOGOUT' && reason !== 'UNAUTHORIZED') {
//                 await this.handleReconnection(companyId, sessionState);
//             }
//         });

//         // ===== MESSAGE HANDLER =====
//         client.on('message', async (message) => {
//             if (message.from === 'status@broadcast' || message.isGroupMsg) return;
            
//             try {
//                 // Update statistics
//                 sessionState.messageCount++;
//                 this.stats.totalMessages++;
//                 this.stats.messagesToday++;
                
//                 // Log message (shortened for privacy)
//                 const shortMsg = message.body?.substring(0, 50) || '[No text]';
//                 console.log(`📨 [Company:${companyId}] From ${message.from}: ${shortMsg}...`);
                
//                 // Emit message event for dashboard
//                 this.emit('message', {
//                     companyId,
//                     from: message.from,
//                     body: message.body,
//                     timestamp: new Date().toISOString(),
//                     hasMedia: message.hasMedia
//                 });
                
//                 // Pass to message handler with company context
//                 await handleMessage(message, client, companyId);
                
//             } catch (error) {
//                 console.error(`❌ [Company:${companyId}] Message handling error:`, error);
//             }
//         });

//         // ===== STATE CHANGE HANDLER =====
//         client.on('change_state', (state) => {
//             console.log(`🔄 [Company:${companyId}] Connection state: ${state}`);
            
//             this.broadcastStatus(companyId, {
//                 status: 'state_change',
//                 message: `Connection state: ${state}`,
//                 companyId,
//                 state
//             });
//         });

//         // ===== LOADING SCREEN HANDLER =====
//         client.on('loading_screen', (percent, message) => {
//             console.log(`📱 [Company:${companyId}] Loading: ${percent}% - ${message}`);
//         });

//         // ===== PAGE ERROR HANDLER =====
//         client.on('page_error', (error) => {
//             console.error(`❌ [Company:${companyId}] Page error:`, error.message);
//         });
//     }

//     /**
//      * Handle reconnection for a company
//      * @param {string} companyId - Company ID
//      * @param {Object} sessionState - Session state object
//      */
//     async handleReconnection(companyId, sessionState) {
//         if (sessionState.reconnectAttempts >= this.config.maxReconnectAttempts) {
//             console.error(`💥 [Company:${companyId}] Max reconnection attempts reached`);
            
//             this.broadcastStatus(companyId, {
//                 status: 'error',
//                 message: 'Max reconnection attempts reached',
//                 companyId
//             });
            
//             return;
//         }
        
//         sessionState.reconnectAttempts++;
//         const delay = this.config.reconnectDelay * sessionState.reconnectAttempts;
        
//         console.log(`🔄 [Company:${companyId}] Reconnecting in ${delay/1000}s (attempt ${sessionState.reconnectAttempts})`);
        
//         this.broadcastStatus(companyId, {
//             status: 'reconnecting',
//             message: `Reconnecting... (${sessionState.reconnectAttempts}/${this.config.maxReconnectAttempts})`,
//             companyId
//         });
        
//         // Clear any existing reconnect timeout
//         if (this.reconnectTimeouts.has(companyId)) {
//             clearTimeout(this.reconnectTimeouts.get(companyId));
//         }
        
//         // Set new reconnect timeout
//         const timeout = setTimeout(async () => {
//             try {
//                 await this.initCompanySession(companyId);
//             } catch (error) {
//                 console.error(`❌ [Company:${companyId}] Reconnection failed:`, error);
//             }
//         }, delay);
        
//         this.reconnectTimeouts.set(companyId, timeout);
//     }

//     /**
//      * Restore all active sessions from database via API
//      */
//     async restoreAllSessions() {
//         try {
//             console.log('🔄 [SessionManager] Restoring active sessions from database...');
            
//             // Get all companies with WhatsApp connected from API
//             const response = await this.apiClient.get('/api/companies/with-whatsapp?connected=true');
//             const companies = this.extractData(response.data) || [];
            
//             console.log(`📊 Found ${companies.length} companies with WhatsApp sessions`);
            
//             // Restore each session
//             for (const company of companies) {
//                 try {
//                     await this.initCompanySession(company._id.toString());
//                     console.log(`✅ [Company:${company._id}] Session restored`);
//                 } catch (error) {
//                     console.error(`❌ [Company:${company._id}] Failed to restore session:`, error.message);
//                 }
//             }
            
//         } catch (error) {
//             console.error('❌ [SessionManager] Failed to restore sessions:', error.message);
//         }
//     }

//     /**
//      * Get active session for a company
//      * @param {string} companyId - Company ID
//      * @returns {Object|null} Session client or null
//      */
//     getSession(companyId) {
//         const session = this.sessions.get(companyId);
//         if (session && session.status === 'connected') {
//             return session.client;
//         }
//         return null;
//     }

//     /**
//      * Get session status for a company
//      * @param {string} companyId - Company ID
//      * @returns {Object} Session status
//      */
//     getSessionStatus(companyId) {
//         const session = this.sessions.get(companyId);
//         if (!session) {
//             return {
//                 companyId,
//                 status: 'not_initialized',
//                 exists: false
//             };
//         }
        
//         return {
//             companyId,
//             status: session.status,
//             connected: session.status === 'connected',
//             hasQR: !!session.qrData,
//             qrData: session.qrData,
//             qrExpiresIn: session.qrGeneratedAt ? 
//                 Math.max(0, this.config.qrExpiryTime - (Date.now() - session.qrGeneratedAt)) / 1000 : 0,
//             connectedAt: session.connectedAt,
//             info: session.info,
//             messageCount: session.messageCount,
//             reconnectAttempts: session.reconnectAttempts,
//             clientId: session.clientId
//         };
//     }

//     /**
//      * Get all active sessions
//      * @returns {Array} List of active sessions
//      */
//     getAllSessions() {
//         const sessions = [];
//         this.sessions.forEach((session, companyId) => {
//             sessions.push({
//                 companyId,
//                 status: session.status,
//                 connected: session.status === 'connected',
//                 hasQR: !!session.qrData,
//                 connectedAt: session.connectedAt,
//                 info: session.info,
//                 messageCount: session.messageCount
//             });
//         });
//         return sessions;
//     }

//     /**
//      * Remove session for a company
//      * @param {string} companyId - Company ID
//      * @param {boolean} destroy - Whether to destroy the client
//      */
//     async removeSession(companyId, destroy = true) {
//         const session = this.sessions.get(companyId);
//         if (!session) return;
        
//         console.log(`🗑️ [Company:${companyId}] Removing session...`);
        
//         // Clear reconnect timeout
//         if (this.reconnectTimeouts.has(companyId)) {
//             clearTimeout(this.reconnectTimeouts.get(companyId));
//             this.reconnectTimeouts.delete(companyId);
//         }
        
//         // Clear QR timeout
//         if (session.qrTimeout) {
//             clearTimeout(session.qrTimeout);
//         }
        
//         if (destroy && session.client) {
//             try {
//                 await session.client.destroy();
//                 console.log(`✅ [Company:${companyId}] Client destroyed`);
//             } catch (error) {
//                 console.error(`❌ [Company:${companyId}] Error destroying client:`, error.message);
//             }
//         }
        
//         // Update statistics
//         if (session.status === 'connected') {
//             this.stats.activeSessions--;
//         } else if (session.status === 'qr_required' || session.status === 'initializing') {
//             this.stats.pendingSessions--;
//         }
        
//         // Remove from map
//         this.sessions.delete(companyId);
        
//         // Update company in database via API
//         await this.updateCompanyWhatsAppStatus(companyId, {
//             isConnected: false,
//             connectionStatus: 'disconnected'
//         });
        
//         this.broadcastStats();
//     }

//     /**
//      * Disconnect all sessions (for shutdown)
//      */
//     async disconnectAll() {
//         console.log('🛑 [SessionManager] Disconnecting all sessions...');
        
//         const promises = [];
//         this.sessions.forEach((session, companyId) => {
//             promises.push(this.removeSession(companyId, true));
//         });
        
//         await Promise.all(promises);
        
//         // Clear intervals
//         if (this.monitorInterval) {
//             clearInterval(this.monitorInterval);
//             this.monitorInterval = null;
//         }
        
//         if (this.statsInterval) {
//             clearInterval(this.statsInterval);
//             this.statsInterval = null;
//         }
        
//         console.log('✅ [SessionManager] All sessions disconnected');
//     }

//     // ========== BROADCAST METHODS (using your existing QR WebSocket) ==========

//     /**
//      * Broadcast QR code to dashboard
//      * @param {string} companyId - Company ID
//      * @param {Object} qrData - QR code data
//      */
//     broadcastQR(companyId, qrData) {
//         // Use your existing qrSocketServer
//         if (this.qrSocketServer) {
//             this.qrSocketServer.broadcastQR(companyId, qrData);
//         }
        
//         // Also emit event for internal use
//         this.emit('qr-update', { companyId, qrData });
//     }

//     /**
//      * Broadcast status update to dashboard
//      * @param {string} companyId - Company ID
//      * @param {Object} statusData - Status data
//      */
//     broadcastStatus(companyId, statusData) {
//         if (this.qrSocketServer) {
//             this.qrSocketServer.broadcastStatus(companyId, statusData.status, statusData.message);
//         }
        
//         this.emit('status-change', { companyId, ...statusData });
//     }

//     /**
//      * Broadcast statistics to dashboard
//      */
//     broadcastStats() {
//         const statsData = {
//             totalSessions: this.stats.totalSessions,
//             activeSessions: this.stats.activeSessions,
//             pendingSessions: this.stats.pendingSessions,
//             failedSessions: this.stats.failedSessions,
//             totalMessages: this.stats.totalMessages,
//             messagesToday: this.stats.messagesToday,
//             sessions: this.getAllSessions(),
//             lastUpdated: new Date().toISOString()
//         };
        
//         if (this.qrSocketServer) {
//             this.qrSocketServer.broadcastStats(statsData);
//         }
        
//         this.emit('stats-update', statsData);
//     }

//     // ========== MONITORING & STATISTICS ==========

//     /**
//      * Start monitoring sessions
//      */
//     startMonitoring() {
//         if (this.monitorInterval) {
//             clearInterval(this.monitorInterval);
//         }
        
//         this.monitorInterval = setInterval(() => {
//             this.monitorSessions();
//         }, this.config.monitorInterval);
        
//         console.log('📊 [SessionManager] Monitoring started');
//     }

//     /**
//      * Monitor sessions health
//      */
//     monitorSessions() {
//         let connected = 0;
//         let pending = 0;
//         let disconnected = 0;
        
//         this.sessions.forEach((session, companyId) => {
//             if (session.status === 'connected') connected++;
//             else if (session.status === 'qr_required' || session.status === 'initializing') pending++;
//             else disconnected++;
//         });
        
//         console.log('📊 [SessionManager] Session health check:');
//         console.log(`   ✅ Connected: ${connected}`);
//         console.log(`   ⏳ Pending: ${pending}`);
//         console.log(`   ❌ Disconnected: ${disconnected}`);
        
//         // Update stats
//         this.stats.activeSessions = connected;
//         this.stats.pendingSessions = pending;
        
//         this.broadcastStats();
//     }

//     /**
//      * Start statistics collection
//      */
//     startStatsCollection() {
//         if (this.statsInterval) {
//             clearInterval(this.statsInterval);
//         }
        
//         this.statsInterval = setInterval(() => {
//             this.collectStats();
//         }, this.config.statsInterval);
//     }

//     /**
//      * Collect and broadcast statistics
//      */
//     collectStats() {
//         // Reset daily counters if needed
//         const now = new Date();
//         if (now.toDateString() !== this.stats.lastResetAt.toDateString()) {
//             this.stats.messagesToday = 0;
//             this.stats.lastResetAt = now;
//         }
        
//         this.broadcastStats();
//     }

//     /**
//      * Get manager statistics
//      * @returns {Object} Statistics
//      */
//     getStats() {
//         return {
//             ...this.stats,
//             sessions: this.getAllSessions()
//         };
//     }

//     /**
//      * Get session info for a specific company
//      * @param {string} companyId - Company ID
//      * @returns {Object} Session info
//      */
//     getBookingSessionInfo(companyId) {
//         const session = this.sessions.get(companyId);
//         if (!session) return null;
        
//         return {
//             companyId,
//             status: session.status,
//             connected: session.status === 'connected',
//             lastMessageAt: session.lastBookingMessageAt || session.connectedAt,
//             messageCount: session.bookingMessageCount || 0,
//             totalBookings: session.totalBookings || 0
//         };
//     }

//     /**
//      * Track booking message for a company
//      * @param {string} companyId - Company ID
//      */
//     trackBookingMessage(companyId) {
//         const session = this.sessions.get(companyId);
//         if (session) {
//             session.bookingMessageCount = (session.bookingMessageCount || 0) + 1;
//             session.lastBookingMessageAt = new Date();
//         }
//     }

//     /**
//      * Track booking created for a company
//      * @param {string} companyId - Company ID
//      */
//     trackBookingCreated(companyId) {
//         const session = this.sessions.get(companyId);
//         if (session) {
//             session.totalBookings = (session.totalBookings || 0) + 1;
//         }
//     }

//     /**
//      * Clean up resources (call on shutdown)
//      */
//     async cleanup() {
//         console.log('🧹 [SessionManager] Cleaning up...');
        
//         await this.disconnectAll();
        
//         if (this.mongooseConnected) {
//             await mongoose.disconnect();
//             console.log('📦 MongoDB disconnected');
//         }
        
//         console.log('✅ [SessionManager] Cleanup complete');
//     }

//     /**
//      * Check API health
//      */
//     async healthCheck() {
//         try {
//             const response = await this.apiClient.get('/api/health');
//             return {
//                 status: 'healthy',
//                 apiUrl: this.apiBaseUrl,
//                 sessions: this.sessions.size,
//                 stats: this.getStats()
//             };
//         } catch (error) {
//             return {
//                 status: 'unhealthy',
//                 apiUrl: this.apiBaseUrl,
//                 error: error.message,
//                 sessions: this.sessions.size
//             };
//         }
//     }
// }

// // Create singleton instance
// let sessionManagerInstance = null;

// export function getSessionManager() {
//     if (!sessionManagerInstance) {
//         sessionManagerInstance = new SessionManager();
//     }
//     return sessionManagerInstance;
// }

// export default getSessionManager;