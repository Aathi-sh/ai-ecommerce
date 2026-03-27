

// // bot.js - PROFESSIONAL MULTI-TENANT VERSION with LocalAuth (File-based sessions)
// // Industry standard: Supports multiple WhatsApp sessions per company with file storage

// import pkg from 'whatsapp-web.js';
// import qrcode from 'qrcode-terminal';
// import { EventEmitter } from 'events';
// import dotenv from 'dotenv';
// import handleMessage from "./messageHandler.js";
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// // ✅ REMOVED: mongoose and MongoStore imports
// // ✅ ADDED: apiService import (was already there)
// import apiService from '../services/apiService.js';

// dotenv.config();

// const { Client, LocalAuth } = pkg; // ✅ CHANGED: RemoteAuth → LocalAuth

// // ES module equivalent of __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// class WhatsAppBot extends EventEmitter {
//     constructor() {
//         super(); // Initialize EventEmitter

//         // Multi-tenant properties
//         this.companyId = null; // Current company ID
//         this.clients = new Map(); // Store multiple clients per company
        
//         // Single client properties (for backward compatibility)
//         this.client = null;
//         this.isConnected = false;
//         this.isAuthenticated = false;
        
//         // Session management
//         this.sessionPath = path.join(process.cwd(), 'sessions'); // ✅ CHANGED: Absolute path
//         // ✅ REMOVED: mongoStore and mongooseConnected
        
//         // QR properties
//         this.currentQR = null;
//         this.qrGeneratedAt = null;
//         this.qrTimeout = null;
//         this.qrExpiryTime = 60000; // 60 seconds
//         this.isWaitingForScan = false;
        
//         // Connection management
//         this.reconnectAttempts = 0;
//         this.maxReconnectAttempts = 7;
//         this.isInitializing = false;
//         this.connectionTime = null;
//         this.botInfo = null;
//         this.isShuttingDown = false;
        
//         // WebSocket tracking
//         this.qrWebSocketClients = new Set();

//         // Initialize statistics
//         this.stats = {
//             totalOrders: 0,
//             totalChats: 0,
//             totalCustomers: new Set(),
//             totalMessages: 0,
//             pendingOrders: 0,
//             completedOrders: 0
//         };

//         this.statsInterval = null;
        
//         console.log('🤖 [WhatsAppBot] Initialized with multi-tenant support (LocalAuth)');
//         console.log(`📁 Sessions will be stored in: ${this.sessionPath}`);
//     }

//     // ✅ REMOVED: connectToMongoDB() method - no longer needed

//     /**
//      * Initialize WhatsApp client for a specific company
//      * @param {string} companyId - Company ID for multi-tenant isolation
//      */
//     async initializeForCompany(companyId) {
//         if (!companyId) {
//             throw new Error('Company ID is required for multi-tenant initialization');
//         }
        
//         this.companyId = companyId;
//         console.log(`🏢 [Company:${companyId}] Initializing WhatsApp client...`);
        
//         return this.initialize();
//     }

//     async initialize() {
//         if (this.isInitializing) {
//             console.log('🔄 Bot initialization already in progress...');
//             return;
//         }

//         this.isInitializing = true;
//         this.isShuttingDown = false;

//         try {
//             console.log('🚀 Initializing WhatsApp E-commerce Bot...');

//             // ✅ REMOVED: MongoDB connection

//             // Clear any existing client
//             if (this.client) {
//                 await this.safeDestroyClient();
//             }

//             // Initialize WhatsApp client with LocalAuth
//             await this.initializeClient();

//             this.reconnectAttempts = 0;
//             console.log('✅ Bot initialization completed successfully');

//         } catch (error) {
//             console.error('❌ Bot initialization failed:', error);
//             await this.handleInitializationError(error);
//         } finally {
//             this.isInitializing = false;
//         }
//     }

//     initializeClient() {
//         console.log('\n' + '🔍'.repeat(20));
//         console.log('🔍 [DEBUG] ===== INSIDE initializeClient() =====');
//         console.log(`🔍 [DEBUG] this.companyId at START of initializeClient: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] this.sessionPath: ${this.sessionPath}`);
//         console.log('🔍'.repeat(20) + '\n');
        
//         return new Promise((resolve, reject) => {
//             try {
//                 // Ensure session directory exists for all companies
//                 if (!fs.existsSync(this.sessionPath)) {
//                     console.log(`🔍 [DEBUG] Creating main session directory: ${this.sessionPath}`);
//                     fs.mkdirSync(this.sessionPath, { recursive: true });
//                 } else {
//                     console.log(`🔍 [DEBUG] Main session directory already exists: ${this.sessionPath}`);
//                 }

//                 console.log('📁 Main session path:', this.sessionPath);
                
//                 // Generate client ID based on company - THIS IS KEY FOR MULTI-TENANT
//                 console.log(`🔍 [DEBUG] Generating clientId with this.companyId = "${this.companyId || 'null'}"`);
                
//                 const clientId = this.companyId 
//                     ? `company_${this.companyId}` 
//                     : `whatsapp-bot-${Date.now()}`;
                
//                 console.log(`🔍 [DEBUG] Generated clientId: "${clientId}"`);
//                 console.log(`🆔 Client ID: ${clientId}`);

//                 // ✅ CHANGED: Create client with LocalAuth instead of RemoteAuth
//                 console.log(`🔍 [DEBUG] Creating new Client with LocalAuth...`);
//                 console.log(`🔍 [DEBUG] LocalAuth config:`, {
//                     clientId: clientId,
//                     dataPath: this.sessionPath
//                 });
                
//                 this.client = new Client({
//                     authStrategy: new LocalAuth({
//                         clientId: clientId, // Company-specific client ID
//                         dataPath: this.sessionPath // All sessions in one folder
//                     }),
//                     puppeteer: {
//                         headless: true,
//                         args: [
//                             '--no-sandbox',
//                             '--disable-setuid-sandbox',
//                             '--disable-dev-shm-usage',
//                             '--disable-accelerated-2d-canvas',
//                             '--no-first-run',
//                             '--no-zygote',
//                             '--disable-gpu',
//                             '--disable-web-security',
//                             '--disable-features=VizDisplayCompositor',
//                             '--disable-features=TranslateUI',
//                             '--disable-ipc-flooding-protection',
//                             '--disable-renderer-backgrounding',
//                             '--disable-background-timer-throttling',
//                             '--disable-backgrounding-occluded-windows',
//                             '--disable-breakpad',
//                             '--window-size=1920,1080'
//                         ],
//                         timeout: 60000,
//                         ignoreHTTPSErrors: true
//                     },
//                     qrMaxRetries: 3,
//                     authTimeoutMs: 120000,
//                     takeoverOnConflict: true,
//                     takeoverTimeoutMs: 60000
//                 });

//                 console.log(`🔍 [DEBUG] Client object created, calling setupEventHandlers...`);
//                 this.setupEventHandlers(resolve, reject);

//                 console.log('🔧 Starting client initialization with LocalAuth...');
//                 console.log(`🔍 [DEBUG] About to call this.client.initialize()`);
                
//                 this.client.initialize().catch((error) => {
//                     console.error(`🔍 [DEBUG] client.initialize() CATCH error:`, error.message);
//                     reject(error);
//                 });

//                 console.log(`🔍 [DEBUG] client.initialize() called successfully`);

//             } catch (error) {
//                 console.error(`🔍 [DEBUG] CATCH in initializeClient:`, error.message);
//                 reject(new Error(`Client initialization failed: ${error.message}`));
//             } finally {
//                 console.log('\n' + '🔍'.repeat(20));
//                 console.log(`🔍 [DEBUG] ===== EXITING initializeClient() =====`);
//                 console.log(`🔍 [DEBUG] this.companyId at END: "${this.companyId || 'null'}"`);
//                 console.log(`🔍 [DEBUG] client created: ${this.client ? 'YES' : 'NO'}`);
//                 console.log('🔍'.repeat(20) + '\n');
//             }
//         });
//     }

//     setupEventHandlers(resolve, reject) {
//         console.log('\n' + '🔍'.repeat(30));
//         console.log('🔍 [DEBUG] ===== INSIDE setupEventHandlers() =====');
//         console.log(`🔍 [DEBUG] this.companyId at START: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] this.client exists: ${this.client ? 'YES' : 'NO'}`);
//         console.log(`🔍 [DEBUG] Current this.isConnected: ${this.isConnected}`);
//         console.log(`🔍 [DEBUG] Current this.isAuthenticated: ${this.isAuthenticated}`);
//         console.log('🔍'.repeat(30) + '\n');
        
//         let qrGenerated = false;
//         let initializationTimeout;

//         // Set initialization timeout (2 minutes)
//         initializationTimeout = setTimeout(() => {
//             console.log(`🔍 [DEBUG] TIMEOUT: 2 minutes elapsed, checking connection...`);
//             if (!this.isConnected) {
//                 const error = new Error('Client initialization timeout - taking too long to connect');
//                 console.error('❌', error.message);
//                 console.log(`🔍 [DEBUG] Rejecting with timeout error`);

//                 this.emitStatusChange({
//                     connected: false,
//                     status: 'error',
//                     message: 'Initialization timeout - taking too long to connect'
//                 });

//                 reject(error);
//             } else {
//                 console.log(`🔍 [DEBUG] Connection established, timeout cleared`);
//             }
//         }, 120000);

//         // ✅ PROFESSIONAL QR HANDLER with company context
//         this.client.on('qr', async (qr) => {
//             console.log('\n' + '🔍'.repeat(20));
//             console.log(`🔍 [DEBUG] QR EVENT TRIGGERED`);
//             console.log(`🔍 [DEBUG] this.companyId in QR handler: "${this.companyId || 'null'}"`);
//             console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
//             console.log(`🔍 [DEBUG] Current this.isWaitingForScan: ${this.isWaitingForScan}`);
//             console.log(`🔍 [DEBUG] Current this.currentQR exists: ${!!this.currentQR}`);
//             console.log('🔍'.repeat(20) + '\n');
            
//             clearTimeout(initializationTimeout);
//             console.log(`🔍 [DEBUG] initializationTimeout cleared`);
            
//             // If already waiting for a scan and QR is the same, ignore
//             if (this.isWaitingForScan && this.currentQR === qr) {
//                 console.log('⏳ Already waiting for QR scan...');
//                 console.log(`🔍 [DEBUG] Ignoring duplicate QR`);
//                 return;
//             }
            
//             // If we have a valid QR and it's not expired, don't generate new one
//             if (this.currentQR && this.qrGeneratedAt && 
//                 (Date.now() - this.qrGeneratedAt < this.qrExpiryTime)) {
//                 console.log('⏳ Current QR still valid, not generating new one');
//                 console.log(`🔍 [DEBUG] Time left: ${Math.round((this.qrExpiryTime - (Date.now() - this.qrGeneratedAt))/1000)}s`);
//                 return;
//             }
            
//             // Clear previous timeout
//             if (this.qrTimeout) {
//                 console.log(`🔍 [DEBUG] Clearing previous qrTimeout`);
//                 clearTimeout(this.qrTimeout);
//                 this.qrTimeout = null;
//             }
            
//             // Store new QR
//             this.currentQR = qr;
//             this.qrGeneratedAt = Date.now();
//             this.isWaitingForScan = true;
            
//             console.log(`🔍 [DEBUG] New QR stored at ${new Date(this.qrGeneratedAt).toLocaleTimeString()}`);
//             console.log(`🔍 [DEBUG] QR expires in ${this.qrExpiryTime/1000}s`);
            
//             // Get company info for logging
//             const companyInfo = this.companyId ? `Company: ${this.companyId}` : 'Single tenant';
//             const clientIdFromStrategy = this.client?.authStrategy?.clientId || 'unknown';
            
//             console.log(`🔍 [DEBUG] companyInfo for display: "${companyInfo}"`);
//             console.log(`🔍 [DEBUG] clientId from strategy: "${clientIdFromStrategy}"`);
            
//             console.log('\n' + '='.repeat(60));
//             console.log(`📱 WHATSAPP AUTHENTICATION REQUIRED - ${companyInfo}`);
//             console.log('='.repeat(60));
//             console.log(`⏰ Generated at: ${new Date().toLocaleTimeString()}`);
//             console.log(`⌛ Expires in: ${this.qrExpiryTime/1000} seconds`);
//             console.log(`🆔 Client ID: ${clientIdFromStrategy}`);
//             console.log('='.repeat(60) + '\n');
            
//             // Show QR in terminal (only once)
//             if (!qrGenerated) {
//                 console.log(`🔍 [DEBUG] Generating QR code in terminal (first time only)`);
//                 qrcode.generate(qr, { small: true });
//                 qrGenerated = true;
                
//                 console.log('\n' + '='.repeat(60));
//                 console.log('📱 HOW TO CONNECT:');
//                 console.log('1. Open WhatsApp on your phone');
//                 console.log('2. Tap Menu (3 dots) → Linked Devices');
//                 console.log('3. Tap "Link a Device"');
//                 console.log('4. Scan the QR code above');
//                 console.log('='.repeat(60) + '\n');
//             } else {
//                 console.log(`🔍 [DEBUG] QR already generated in terminal, skipping`);
//             }

//             // Emit QR update for web dashboard with company context
//             console.log(`🔍 [DEBUG] Emitting QR update to dashboard with companyId: ${this.companyId || 'null'}`);
//             this.emitQRCode({
//                 qr: qr,
//                 expiresIn: this.qrExpiryTime/1000,
//                 generatedAt: this.qrGeneratedAt,
//                 isValid: true,
//                 companyId: this.companyId,
//                 clientId: clientIdFromStrategy
//             });

//             // Emit status change
//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 hasQR: true,
//                 status: 'qr_required',
//                 message: 'Scan QR code to connect WhatsApp',
//                 companyId: this.companyId
//             });

//             // Set timeout to expire QR
//             console.log(`🔍 [DEBUG] Setting QR expiry timeout for ${this.qrExpiryTime}ms`);
//             this.qrTimeout = setTimeout(() => {
//                 console.log(`🔍 [DEBUG] QR EXPIRY TIMEOUT TRIGGERED`);
//                 console.log(`🔍 [DEBUG] this.isWaitingForScan: ${this.isWaitingForScan}`);
//                 console.log(`🔍 [DEBUG] this.currentQR equals stored: ${this.currentQR === qr}`);
                
//                 if (this.isWaitingForScan && this.currentQR === qr) {
//                     console.log('⏰ QR code expired. Ready for new QR...');
//                     this.isWaitingForScan = false;
//                     this.currentQR = null;
//                     this.qrGeneratedAt = null;
//                     qrGenerated = false;
                    
//                     console.log(`🔍 [DEBUG] QR state reset, qrGenerated set to false`);
                    
//                     // Emit expiry to dashboard
//                     this.emitQRCode(null);
                    
//                     this.emitStatusChange({
//                         connected: false,
//                         authenticated: false,
//                         hasQR: false,
//                         status: 'qr_expired',
//                         message: 'QR code expired. Generating new one...',
//                         companyId: this.companyId
//                     });
//                 } else {
//                     console.log(`🔍 [DEBUG] QR expiry ignored - state changed`);
//                 }
//             }, this.qrExpiryTime);
//         });

//         this.client.on('ready', async () => {
//             console.log('\n' + '🔍'.repeat(20));
//             console.log(`🔍 [DEBUG] READY EVENT TRIGGERED`);
//             console.log(`🔍 [DEBUG] this.companyId in ready event: "${this.companyId || 'null'}"`);
//             console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
//             console.log('🔍'.repeat(20) + '\n');
            
//             clearTimeout(initializationTimeout);
//             console.log(`🔍 [DEBUG] initializationTimeout cleared`);

//             this.isConnected = true;
//             this.isAuthenticated = true;
//             this.currentQR = null;
//             this.isWaitingForScan = false;
//             this.qrGeneratedAt = null;
            
//             if (this.qrTimeout) {
//                 console.log(`🔍 [DEBUG] Clearing qrTimeout`);
//                 clearTimeout(this.qrTimeout);
//                 this.qrTimeout = null;
//             }
            
//             this.reconnectAttempts = 0;
//             this.connectionTime = new Date();

//             // Get client info
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             const companyInfo = this.companyId ? `Company: ${this.companyId}` : 'Single tenant';

//             console.log(`🔍 [DEBUG] READY - Client ID: ${clientId}`);
//             console.log(`🔍 [DEBUG] READY - Company Info: ${companyInfo}`);

//             console.log('\n' + '='.repeat(60));
//             console.log('✅ WHATSAPP BOT SUCCESSFULLY INITIALIZED');
//             console.log('='.repeat(60));
//             console.log(`🤖 Status: ONLINE`);
//             console.log(`🏢 ${companyInfo}`);
//             console.log(`🆔 Client ID: ${clientId}`);
//             console.log(`📱 Session: STORED ON SERVER (LocalAuth)`);
//             console.log(`📁 Session Path: ${this.sessionPath}/company_${this.companyId || 'default'}`);
//             console.log(`🛍️ Ready to process customer orders`);
//             console.log('='.repeat(60) + '\n');

//             // Store client in map for multi-tenant support
//             if (this.companyId) {
//                 console.log(`🔍 [DEBUG] Storing client in clients Map for company: ${this.companyId}`);
//                 this.clients.set(this.companyId, this.client);
//                 console.log(`🔍 [DEBUG] clients Map size now: ${this.clients.size}`);
//             } else {
//                 console.log(`🔍 [DEBUG] WARNING: No companyId, not storing in clients Map`);
//             }

//             this.emitStatusChange({
//                 connected: true,
//                 authenticated: true,
//                 hasQR: false,
//                 status: 'connected',
//                 message: 'WhatsApp is connected and ready',
//                 companyId: this.companyId,
//                 clientId: clientId
//             });

//             // Start stats (safe)
//             this.startStatsBroadcasting();

//             // Load bot info
//             setTimeout(() => {
//                 this.displayBotInfo().catch(err =>
//                     console.log('⚠️ Bot info load skipped:', err.message)
//                 );
//             }, 5000);

//             console.log(`🔍 [DEBUG] Resolving promise from ready event`);
//             resolve();
//         });

//         this.client.on('authenticated', () => {
//             console.log('\n' + '🔍'.repeat(20));
//             console.log(`🔍 [DEBUG] AUTHENTICATED EVENT TRIGGERED`);
//             console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
//             console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
//             console.log('🔍'.repeat(20) + '\n');
            
//             this.isAuthenticated = true;
//             this.isWaitingForScan = false;
//             this.currentQR = null;
//             this.qrGeneratedAt = null;
            
//             // Clear QR timeout
//             if (this.qrTimeout) {
//                 console.log(`🔍 [DEBUG] Clearing qrTimeout`);
//                 clearTimeout(this.qrTimeout);
//                 this.qrTimeout = null;
//             }
            
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             console.log(`🔐 [${clientId}] Authentication successful - Session saved to disk`);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: true,
//                 hasQR: false,
//                 status: 'authenticated',
//                 message: 'WhatsApp authentication successful',
//                 companyId: this.companyId,
//                 clientId: clientId
//             });
//         });

//         this.client.on('auth_failure', (error) => {
//             console.log('\n' + '🔍'.repeat(20));
//             console.log(`🔍 [DEBUG] AUTH_FAILURE EVENT TRIGGERED`);
//             console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
//             console.log(`🔍 [DEBUG] Error:`, error);
//             console.log('🔍'.repeat(20) + '\n');
            
//             clearTimeout(initializationTimeout);
//             console.log(`🔍 [DEBUG] initializationTimeout cleared`);

//             this.isAuthenticated = false;
//             this.isWaitingForScan = false;
//             this.currentQR = null;
            
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             console.error(`❌ [${clientId}] Authentication failed:`, error);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'auth_failed',
//                 message: `Authentication failed: ${error.message}`,
//                 companyId: this.companyId,
//                 clientId: clientId
//             });

//             console.log(`🔍 [DEBUG] Rejecting promise with auth failure`);
//             reject(new Error(`Authentication failed: ${error.message}`));
//         });

//         this.client.on('disconnected', async (reason) => {
//             console.log('\n' + '🔍'.repeat(20));
//             console.log(`🔍 [DEBUG] DISCONNECTED EVENT TRIGGERED`);
//             console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
//             console.log(`🔍 [DEBUG] Reason: ${reason}`);
//             console.log(`🔍 [DEBUG] this.isShuttingDown: ${this.isShuttingDown}`);
//             console.log('🔍'.repeat(20) + '\n');
            
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             console.log(`🔌 [${clientId}] Disconnected: ${reason}`);

//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;
//             this.isWaitingForScan = false;

//             // Stop stats broadcasting when disconnected
//             this.stopStatsBroadcasting();

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'disconnected',
//                 message: `WhatsApp disconnected: ${reason}`,
//                 companyId: this.companyId,
//                 clientId: clientId
//             });

//             // Don't try to reconnect if we're shutting down or logging out
//             if (this.isShuttingDown) {
//                 console.log(`🔍 [DEBUG] Shutting down, not reconnecting`);
//                 return;
//             }

//             // Handle different disconnect reasons
//             if (reason === 'LOGOUT' || reason === 'UNAUTHORIZED') {
//                 console.log(`🔄 [${clientId}] Logout/Unauthorized detected. Generating new QR code...`);
//                 console.log(`🔍 [DEBUG] Will reinitialize in 3 seconds`);

//                 this.emitStatusChange({
//                     connected: false,
//                     authenticated: false,
//                     status: 'qr_required',
//                     message: 'Reconnecting WhatsApp...',
//                     companyId: this.companyId,
//                     clientId: clientId
//                 });

//                 // Clear local session files
//                 setTimeout(() => {
//                     console.log(`🔍 [DEBUG] Reinitializing after logout`);
//                     this.initialize().catch(console.error);
//                 }, 3000);
//             } else {
//                 console.log(`🔍 [DEBUG] Other disconnect reason, attempting reconnection`);
//                 await this.handleReconnection();
//             }
//         });

//         this.client.on('message', async (message) => {
//             if (message.from === 'status@broadcast' || message.isGroupMsg) return;

//             try {
//                 console.log('\n' + '🔍'.repeat(30));
//                 console.log('🔍 [DEBUG] ===== MESSAGE RECEIVED =====');
//                 console.log(`🔍 [DEBUG] Message FROM (customer): ${message.from}`);
//                 console.log(`🔍 [DEBUG] Message TO (company number): ${message.to}`);
//                 console.log(`🔍 [DEBUG] Message body: ${message.body?.substring(0, 100)}`);
//                 console.log('🔍'.repeat(30) + '\n');
                
//                 // ===== CRITICAL: Identify which company this message is for =====
//                 // The customer messaged a specific WhatsApp number (message.to)
//                 // We need to find which company owns that number
                
//                 let companyId = this.companyId; // Default to current company
                
//                 // If message.to exists, try to identify company from that number
//                 if (message.to) {
//                     console.log(`🔍 [DEBUG] Attempting to identify company from message.to: ${message.to}`);
                    
//                     // Extract phone number from message.to (format: 919876543210@c.us)
//                     const phoneNumber = message.to.split('@')[0];
//                     console.log(`🔍 [DEBUG] Extracted phone number: ${phoneNumber}`);
                    
//                     // Call apiService to identify company
//                     if (apiService && typeof apiService.identifyCompanyFromWhatsApp === 'function') {
//                         console.log(`🔍 [DEBUG] Calling apiService.identifyCompanyFromWhatsApp...`);
//                         const identifiedCompanyId = await apiService.identifyCompanyFromWhatsApp(phoneNumber);
                        
//                         if (identifiedCompanyId) {
//                             console.log(`✅ [DEBUG] Company identified: ${identifiedCompanyId}`);
//                             companyId = identifiedCompanyId;
                            
//                             // Update this.companyId if it's different
//                             if (this.companyId !== identifiedCompanyId) {
//                                 console.log(`🔍 [DEBUG] Updating this.companyId from ${this.companyId || 'null'} to ${identifiedCompanyId}`);
//                                 this.companyId = identifiedCompanyId;
//                             }
//                         } else {
//                             console.log(`⚠️ [DEBUG] No company identified for phone: ${phoneNumber}`);
//                         }
//                     } else {
//                         console.log(`⚠️ [DEBUG] apiService.identifyCompanyFromWhatsApp not available`);
//                     }
//                 } else {
//                     console.log(`🔍 [DEBUG] No message.to, using current companyId: ${this.companyId || 'unknown'}`);
//                 }
                
//                 // Update statistics for every message
//                 this.updateMessageStats(message.from);

//                 // Log incoming message with company context
//                 const clientId = this.client?.authStrategy?.clientId || 'unknown';
//                 const shortMsg = message.body?.substring(0, 50) || '[No text]';
                
//                 console.log(`📨 [${clientId}] From ${message.from}: ${shortMsg}...`);
//                 console.log(`🏢 [DEBUG] Processing message for company: ${companyId || 'unknown'}`);
//                 console.log(`🔍 [DEBUG] Final companyId for this message: ${companyId || 'null'}`);

//                 // Emit message event with the identified companyId
//                 this.emitMessage({
//                     from: message.from,
//                     to: message.to,
//                     body: message.body,
//                     timestamp: new Date().toISOString(),
//                     hasMedia: message.hasMedia,
//                     type: message.type,
//                     companyId: companyId,  // Use identified companyId
//                     clientId: clientId
//                 });

//                 // Pass company context to message handler
//                 console.log(`🔍 [DEBUG] Calling handleMessage with companyId: ${companyId || 'null'}`);
//                 await handleMessage(message, this.client, companyId);
                
//                 console.log('🔍'.repeat(30));
//                 console.log('🔍 [DEBUG] ===== MESSAGE PROCESSING COMPLETE =====\n');
                
//             } catch (error) {
//                 console.error('❌ Message processing error:', error);
//                 await this.handleMessageError(message, error);
//             }
//         });

//         // Monitor connection state
//         this.client.on('change_state', (state) => {
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             console.log(`🔄 [${clientId}] Connection state: ${state}`);
//             console.log(`🔍 [DEBUG] State change for company: ${this.companyId || 'unknown'}`);
            
//             this.emitStatusChange({
//                 connected: this.isConnected,
//                 authenticated: this.isAuthenticated,
//                 status: 'state_change',
//                 message: `Connection state: ${state}`,
//                 companyId: this.companyId,
//                 clientId: clientId
//             });
//         });

//         // Loading screen events
//         this.client.on('loading_screen', (percent, message) => {
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             console.log(`📱 [${clientId}] WhatsApp loading: ${percent}% - ${message}`);
//             console.log(`🔍 [DEBUG] Loading for company: ${this.companyId || 'unknown'}`);
            
//             this.emitStatusChange({
//                 connected: this.isConnected,
//                 authenticated: this.isAuthenticated,
//                 status: 'loading',
//                 message: `Loading: ${percent}% - ${message}`,
//                 companyId: this.companyId,
//                 clientId: clientId
//             });
//         });

//         // Handle page errors
//         this.client.on('page_error', (error) => {
//             if (this.isShuttingDown && (
//                 error.message.includes('Session closed') ||
//                 error.message.includes('page has been closed') ||
//                 error.message.includes('Protocol error')
//             )) {
//                 console.log(`🔍 [DEBUG] Page error during shutdown (ignored):`, error.message);
//                 return;
//             }
            
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             console.error(`❌ [${clientId}] Page error:`, error.message);
//             console.log(`🔍 [DEBUG] Page error for company: ${this.companyId || 'unknown'}`);

//             this.emitStatusChange({
//                 connected: this.isConnected,
//                 authenticated: this.isAuthenticated,
//                 status: 'page_error',
//                 message: `Page error: ${error.message}`,
//                 companyId: this.companyId,
//                 clientId: clientId
//             });
//         });
        
//         console.log(`🔍 [DEBUG] setupEventHandlers completed, waiting for events...`);
//     }

//     // ========== MULTI-TENANT CLIENT MANAGEMENT ==========

//     /**
//      * Get client for specific company
//      * @param {string} companyId - Company ID
//      * @returns {Object} WhatsApp client
//      */
//     getClientForCompany(companyId) {
//         return this.clients.get(companyId);
//     }

//     /**
//      * Initialize client for a new company
//      * @param {string} companyId - Company ID
//      */
//     async addCompany(companyId) {
//         console.log('\n' + '='.repeat(60));
//         console.log(`🔍 [DEBUG] addCompany CALLED with companyId: "${companyId}"`);
//         console.log(`🔍 [DEBUG] Current this.companyId BEFORE: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] Current clients Map size: ${this.clients.size}`);
//         console.log('='.repeat(60));

//         // Check if client already exists for this company
//         if (this.clients.has(companyId)) {
//             console.log(`🏢 [Company:${companyId}] Client already EXISTS in clients Map`);
//             console.log(`🔍 [DEBUG] Returning existing client`);
//             return this.clients.get(companyId);
//         }

//         console.log(`🏢 [Company:${companyId}] Adding NEW WhatsApp client...`);
//         console.log(`🔍 [DEBUG] No existing client found, proceeding with initialization`);
        
//         // Store previous company ID (for error recovery)
//         const previousCompany = this.companyId;
//         console.log(`🔍 [DEBUG] Stored previousCompany: "${previousCompany || 'null'}"`);
        
//         // Set the new company ID
//         this.companyId = companyId;
//         console.log(`🔍 [DEBUG] this.companyId NOW SET TO: "${this.companyId}"`);
        
//         try {
//             console.log(`🔍 [DEBUG] About to call this.initialize()...`);
//             await this.initialize();
//             console.log(`🔍 [DEBUG] this.initialize() COMPLETED successfully`);
//             console.log(`🔍 [DEBUG] this.companyId AFTER initialize: "${this.companyId}"`);
//             console.log(`🔍 [DEBUG] Client stored in clients Map for company: ${companyId}`);
            
//             return this.client;
//         } catch (error) {
//             console.error(`❌ [Company:${companyId}] Failed to initialize:`, error);
//             console.log(`🔍 [DEBUG] Restoring previousCompany: "${previousCompany || 'null'}"`);
            
//             // Restore previous company ID on error
//             this.companyId = previousCompany;
//             console.log(`🔍 [DEBUG] this.companyId RESTORED to: "${this.companyId || 'null'}"`);
            
//             throw error;
//         } finally {
//             console.log('='.repeat(60));
//             console.log(`🔍 [DEBUG] addCompany FINISHED for companyId: "${companyId}"`);
//             console.log(`🔍 [DEBUG] Final this.companyId: "${this.companyId || 'null'}"`);
//             console.log('='.repeat(60) + '\n');
//         }
//     }

//     /**
//      * Remove client for a company
//      * @param {string} companyId - Company ID
//      */
//     async removeCompany(companyId) {
//         const client = this.clients.get(companyId);
//         if (!client) {
//             console.log(`🏢 [Company:${companyId}] No client found`);
//             return;
//         }

//         console.log(`🏢 [Company:${companyId}] Removing WhatsApp client...`);
        
//         // Store current client
//         const previousClient = this.client;
//         const previousCompany = this.companyId;
        
//         // Switch to this client for destruction
//         this.client = client;
//         this.companyId = companyId;
        
//         try {
//             await this.safeDestroyClient();
//             this.clients.delete(companyId);
            
//             // Also remove session folder if needed
//             const companySessionPath = path.join(this.sessionPath, `company_${companyId}`);
//             if (fs.existsSync(companySessionPath)) {
//                 console.log(`🗑️ Removing session folder for company ${companyId}`);
//                 fs.rmSync(companySessionPath, { recursive: true, force: true });
//             }
            
//             console.log(`✅ [Company:${companyId}] Client removed`);
//         } catch (error) {
//             console.error(`❌ [Company:${companyId}] Failed to remove:`, error);
//         } finally {
//             // Restore previous client
//             this.client = previousClient;
//             this.companyId = previousCompany;
//         }
//     }

//     /**
//      * Get all active company clients
//      */
//     getAllClients() {
//         const clients = [];
//         this.clients.forEach((client, companyId) => {
//             clients.push({
//                 companyId,
//                 clientId: client?.authStrategy?.clientId,
//                 isConnected: client?.info?.wid ? true : false
//             });
//         });
//         return clients;
//     }

//     // ========== EVENT EMITTER METHODS ==========

//     emitQRCode(qrData) {
//         this.emit('qr-update', {
//             ...qrData,
//             timestamp: new Date().toISOString()
//         });
//     }

//     emitStatusChange(status) {
//         this.emit('status-change', {
//             ...status,
//             timestamp: new Date().toISOString()
//         });
//     }

//     emitMessage(messageData) {
//         this.emit('message', messageData);
//     }

//     emitOrderUpdate(orderData) {
//         this.emit('order-update', {
//             ...orderData,
//             timestamp: new Date().toISOString()
//         });
//     }

//     emitStatsUpdate(stats) {
//         this.emit('stats-update', {
//             ...stats,
//             timestamp: new Date().toISOString()
//         });
//     }

//     async handleReconnection() {
//         if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
//             console.error(`💥 [${clientId}] Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'error',
//                 message: 'Maximum reconnection attempts reached. Manual intervention required.',
//                 companyId: this.companyId,
//                 clientId: clientId
//             });

//             return;
//         }

//         this.reconnectAttempts++;
//         const delay = 5000 * this.reconnectAttempts;
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';

//         console.log(`🔄 [${clientId}] Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             status: 'reconnecting',
//             message: `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
//             companyId: this.companyId,
//             clientId: clientId
//         });

//         setTimeout(async () => {
//             try {
//                 await this.initialize();
//             } catch (error) {
//                 console.error(`❌ [${clientId}] Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);

//                 this.emitStatusChange({
//                     connected: false,
//                     authenticated: false,
//                     status: 'reconnect_failed',
//                     message: `Reconnection attempt ${this.reconnectAttempts} failed`,
//                     companyId: this.companyId,
//                     clientId: clientId
//                 });
//             }
//         }, delay);
//     }

//     async safeDestroyClient() {
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
        
//         try {
//             if (this.client) {
//                 console.log(`🛑 [${clientId}] Safely destroying client...`);
//                 this.isShuttingDown = true;
                
//                 // Remove from clients map if present
//                 if (this.companyId) {
//                     this.clients.delete(this.companyId);
//                 }
                
//                 await this.client.destroy();
//                 this.client = null;
//                 console.log(`✅ [${clientId}] Client destroyed safely`);

//                 this.emitStatusChange({
//                     connected: false,
//                     authenticated: false,
//                     status: 'client_destroyed',
//                     message: 'WhatsApp client destroyed',
//                     companyId: this.companyId,
//                     clientId: clientId
//                 });
//             }
//         } catch (error) {
//             if (!error.message.includes('Session closed') &&
//                 !error.message.includes('page has been closed') &&
//                 !error.message.includes('Protocol error')) {
//                 console.error(`❌ [${clientId}] Error destroying client:`, error);

//                 this.emitStatusChange({
//                     connected: false,
//                     authenticated: false,
//                     status: 'error',
//                     message: `Error destroying client: ${error.message}`,
//                     companyId: this.companyId,
//                     clientId: clientId
//                 });
//             } else {
//                 console.log(`⚠️ [${clientId}] Client destruction error (expected):`, error.message);
//             }
//             this.client = null;
//         } finally {
//             this.isShuttingDown = false;
//         }
//     }

//     async clearSession() {
//         try {
//             console.log('🧹 Clearing session data...');

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'clearing_session',
//                 message: 'Clearing session data...'
//             });

//             // Clear company-specific session folder
//             if (this.companyId) {
//                 const companySessionPath = path.join(this.sessionPath, `company_${this.companyId}`);
//                 if (fs.existsSync(companySessionPath)) {
//                     fs.rmSync(companySessionPath, { recursive: true, force: true });
//                     console.log(`✅ Session cleared for company ${this.companyId}`);
//                 }
//             } else {
//                 // Clear all sessions if no company context
//                 if (fs.existsSync(this.sessionPath)) {
//                     fs.rmSync(this.sessionPath, { recursive: true, force: true });
//                     console.log('✅ All sessions cleared');
//                 }
//             }

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'session_cleared',
//                 message: 'Session cleared successfully'
//             });

//         } catch (error) {
//             console.error('❌ Error clearing session:', error);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'session_error',
//                 message: `Error clearing session: ${error.message}`
//             });
//         }
//     }

//     updateMessageStats(from) {
//         this.stats.totalMessages++;
//         this.stats.totalCustomers.add(from);
//         this.stats.totalChats = this.stats.totalCustomers.size;

//         this.broadcastCurrentStats();
//     }

//     startStatsBroadcasting() {
//         // Initial broadcast
//         this.broadcastCurrentStats();

//         // Set up interval for regular updates
//         if (this.statsInterval) {
//             clearInterval(this.statsInterval);
//         }

//         this.statsInterval = setInterval(() => {
//             this.broadcastCurrentStats();
//         }, 3000);

//         console.log('📊 Started statistics broadcasting');
//     }

//     stopStatsBroadcasting() {
//         if (this.statsInterval) {
//             clearInterval(this.statsInterval);
//             this.statsInterval = null;
//             console.log('📊 Stopped statistics broadcasting');
//         }
//     }

//     broadcastCurrentStats() {
//         const statsData = {
//             totalOrders: this.stats.totalOrders,
//             totalChats: this.stats.totalChats,
//             totalCustomers: this.stats.totalCustomers.size,
//             totalMessages: this.stats.totalMessages,
//             pendingOrders: this.stats.pendingOrders,
//             completedOrders: this.stats.completedOrders,
//             lastUpdated: new Date().toISOString(),
//             companyId: this.companyId,
//             activeCompanies: this.clients.size
//         };

//         this.emitStatsUpdate(statsData);
//     }

//     async displayBotInfo() {
//         try {
//             if (!this.client) {
//                 console.log('📊 Bot info: Client not initialized');
//                 return;
//             }

//             let info = null;
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
            
//             // Try multiple methods to get bot info
//             if (typeof this.client.getInfo === 'function') {
//                 try {
//                     info = await this.client.getInfo();
//                 } catch (e) {
//                     // Silent fail
//                 }
//             }
            
//             if (!info && this.client.info) {
//                 info = this.client.info;
//             }
            
//             if (!info) {
//                 const state = await this.client.getState();
//                 info = {
//                     pushname: 'WhatsApp User',
//                     platform: 'WhatsApp',
//                     waVersion: 'Unknown',
//                     wid: { user: 'Connected' },
//                     state: state
//                 };
//             }

//             this.botInfo = {
//                 pushname: info?.pushname || 'Connected',
//                 platform: info?.platform || 'WhatsApp',
//                 version: info?.waVersion || info?.version || 'Unknown',
//                 phoneNumber: info?.wid?.user || 'Connected',
//                 connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString(),
//                 clientId: clientId,
//                 companyId: this.companyId
//             };

//             console.log('🤖 Bot Information:');
//             console.log('───────────────────');
//             console.log(`📱 WhatsApp: ${this.botInfo.pushname}`);
//             console.log(`📞 Phone: ${this.botInfo.phoneNumber}`);
//             console.log(`🌐 Platform: ${this.botInfo.platform}`);
//             console.log(`📊 Version: ${this.botInfo.version}`);
//             console.log(`🏢 Company: ${this.companyId || 'Single tenant'}`);
//             console.log(`🆔 Client ID: ${clientId}`);
//             console.log(`📁 Session: ${this.sessionPath}/company_${this.companyId || 'default'}`);
//             console.log('───────────────────\n');

//         } catch (error) {
//             // Silent fail
//         }
//     }

//     async handleInitializationError(error) {
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         console.error(`❌ [${clientId}] Initialization error:`, error.message);

//         if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//             console.error(`💥 [${clientId}] Max reconnection attempts (${this.maxReconnectAttempts}) reached. Manual intervention required.`);
            
//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'failed',
//                 message: 'Max reconnection attempts reached. Please restart manually.',
//                 companyId: this.companyId,
//                 clientId: clientId
//             });
            
//             return;
//         }

//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             status: 'error',
//             message: `Initialization error: ${error.message}`,
//             companyId: this.companyId,
//             clientId: clientId
//         });

//         // Session/auth related errors - clear session and retry
//         if (error.message.includes('session') || 
//             error.message.includes('auth') || 
//             error.message.includes('context') ||
//             error.message.includes('Authentication') ||
//             error.message.includes('credentials')) {
            
//             console.log(`🔄 [${clientId}] Session/context issue detected. Clearing session and retrying in 10 seconds... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'retrying',
//                 message: `Session issue detected. Retrying... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`,
//                 companyId: this.companyId,
//                 clientId: clientId
//             });

//             try {
//                 await this.clearSession();
//                 console.log(`✅ [${clientId}] Session cleared successfully`);
//             } catch (clearError) {
//                 console.error(`❌ [${clientId}] Failed to clear session:`, clearError.message);
//             }

//             this.reconnectAttempts++;

//             setTimeout(() => {
//                 this.initialize().catch((err) => {
//                     console.error(`❌ [${clientId}] Retry initialization failed:`, err.message);
//                 });
//             }, 10000);
            
//         } else {
//             console.log(`🔄 [${clientId}] Non-session error. Attempting reconnection...`);
//             await this.handleReconnection();
//         }
//     }

//     async handleMessageError(message, error) {
//         try {
//             if (error.message.includes('Execution context was destroyed') ||
//                 error.message.includes('Session closed') ||
//                 error.message.includes('page has been closed')) {
//                 return;
//             }

//             await message.reply(
//                 '⚠️ We encountered a temporary issue. Please try your request again.'
//             );

//             const clientId = this.client?.authStrategy?.clientId || 'unknown';
            
//             this.emitStatusChange({
//                 connected: this.isConnected,
//                 authenticated: this.isAuthenticated,
//                 status: 'message_error',
//                 message: `Failed to process message from ${message.from}: ${error.message}`,
//                 companyId: this.companyId,
//                 clientId: clientId
//             });
//         } catch (replyError) {
//             // Silent fail
//         }
//     }

//     // ✅ Get current QR with expiry info
//     getCurrentQR() {
//         if (!this.currentQR || !this.isWaitingForScan) {
//             return null;
//         }
        
//         const timeLeft = this.qrExpiryTime - (Date.now() - this.qrGeneratedAt);
        
//         if (timeLeft <= 0) {
//             return null;
//         }
        
//         return {
//             qr: this.currentQR,
//             expiresIn: Math.max(0, Math.floor(timeLeft / 1000)),
//             generatedAt: this.qrGeneratedAt,
//             isValid: timeLeft > 0,
//             companyId: this.companyId,
//             clientId: this.client?.authStrategy?.clientId
//         };
//     }

//     // ✅ Register WebSocket client for QR
//     registerQRClient(clientId) {
//         this.qrWebSocketClients.add(clientId);
//         console.log(`🔗 New QR WebSocket client: ${clientId} (Total: ${this.qrWebSocketClients.size})`);
        
//         // Send current QR immediately if available
//         const qrData = this.getCurrentQR();
//         if (qrData) {
//             return qrData;
//         }
//         return null;
//     }

//     // ✅ Unregister WebSocket client
//     unregisterQRClient(clientId, code, reason, duration) {
//         this.qrWebSocketClients.delete(clientId);
//         console.log(`🔌 QR WebSocket client disconnected: ${clientId} (Remaining: ${this.qrWebSocketClients.size})`);
//     }

//     getStatus() {
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
        
//         return {
//             connected: this.isConnected,
//             authenticated: this.isAuthenticated,
//             hasQR: !!this.getCurrentQR(),
//             qrData: this.getCurrentQR(),
//             connectionTime: this.connectionTime,
//             botInfo: this.botInfo,
//             stats: {
//                 totalOrders: this.stats.totalOrders,
//                 totalChats: this.stats.totalChats,
//                 totalCustomers: this.stats.totalCustomers.size,
//                 totalMessages: this.stats.totalMessages,
//                 pendingOrders: this.stats.pendingOrders,
//                 completedOrders: this.stats.completedOrders
//             },
//             reconnectAttempts: this.reconnectAttempts,
//             maxReconnectAttempts: this.maxReconnectAttempts,
//             uptime: this.getUptime(),
//             formattedUptime: this.getFormattedUptime(),
//             activeClients: this.qrWebSocketClients.size,
//             companyId: this.companyId,
//             clientId: clientId,
//             multiTenant: {
//                 activeCompanies: this.clients.size,
//                 companies: this.getAllClients()
//             },
//             sessionPath: `${this.sessionPath}/company_${this.companyId || 'default'}`
//         };
//     }

//     async sendMessage(phoneNumber, message) {
//         try {
//             if (!this.client || !this.isConnected) {
//                 throw new Error('WhatsApp client not connected');
//             }

//             const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
//             const clientId = this.client?.authStrategy?.clientId || 'unknown';

//             console.log(`📤 [${clientId}] Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
//             await this.client.sendMessage(formattedNumber, message);

//             console.log(`✅ [${clientId}] Message sent successfully`);
//             return { success: true, message: 'Message sent successfully' };

//         } catch (error) {
//             console.error('❌ Send message error:', error);
//             return { success: false, error: error.message };
//         }
//     }

//     async shutdown() {
//         console.log('\n🛑 Initiating graceful shutdown...');

//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             status: 'shutdown',
//             message: 'Bot is shutting down...'
//         });

//         try {
//             this.stopStatsBroadcasting();
            
//             // Shutdown all company clients
//             const companies = Array.from(this.clients.keys());
//             for (const companyId of companies) {
//                 await this.removeCompany(companyId);
//             }
            
//             await this.safeDestroyClient();

//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;
//             this.isWaitingForScan = false;
//             this.reconnectAttempts = 0;
//             this.connectionTime = null;
//             this.qrWebSocketClients.clear();

//             console.log('✅ Bot shutdown completed gracefully');

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'shutdown_complete',
//                 message: 'Bot shutdown completed'
//             });
//         } catch (error) {
//             console.error('❌ Error during shutdown:', error);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'shutdown_error',
//                 message: `Error during shutdown: ${error.message}`
//             });
//         }
//     }

//     async logout() {
//         console.log('\n🚪 Manual logout requested...');

//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             status: 'logging_out',
//             message: 'Manual logout requested...'
//         });

//         // Store companyId before logout
//         const currentCompanyId = this.companyId;

//         try {
//             this.isShuttingDown = true;
//             await this.safeDestroyClient();
//             await this.clearSession();

//             this.currentQR = null;
//             this.isWaitingForScan = false;
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.connectionTime = null;
//             this.qrWebSocketClients.clear();

//             console.log('🔓 Logout completed. QR code will be required on next start.');

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'logged_out',
//                 message: 'Logout completed. QR code required.'
//             });

//             // Re-initialize WITH the same companyId after logout
//             setTimeout(() => {
//                 this.isShuttingDown = false;
//                 if (currentCompanyId) {
//                     this.initializeForCompany(currentCompanyId).catch(console.error);
//                 } else {
//                     this.initialize().catch(console.error);
//                 }
//             }, 2000);

//         } catch (error) {
//             console.error('❌ Logout error:', error);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'error',
//                 message: `Logout error: ${error.message}`
//             });

//             this.isShuttingDown = false;
//         }
//     }

//     async restart() {
//         console.log('\n🔄 Manual restart requested...');

//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             status: 'restarting',
//             message: 'Manual restart requested...'
//         });

//         try {
//             await this.shutdown();
//             setTimeout(async () => {
//                 await this.initialize();
//             }, 3000);
//         } catch (error) {
//             console.error('❌ Restart error:', error);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'error',
//                 message: `Restart error: ${error.message}`
//             });
//         }
//     }

//     getUptime() {
//         if (!this.connectionTime) return 0;
//         return Math.floor((new Date() - this.connectionTime) / 1000);
//     }

//     getFormattedUptime() {
//         const seconds = this.getUptime();
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = seconds % 60;
//         return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     }

//     trackNewOrder(orderData = {}) {
//         this.stats.totalOrders++;

//         this.emitOrderUpdate({
//             type: 'new_order',
//             orderId: orderData.orderId || `order_${Date.now()}`,
//             customer: orderData.customer || 'Unknown',
//             totalOrders: this.stats.totalOrders,
//             pendingOrders: this.stats.pendingOrders,
//             completedOrders: this.stats.completedOrders,
//             companyId: this.companyId
//         });

//         this.broadcastCurrentStats();
//     }

//     trackPendingOrder(orderData = {}) {
//         this.stats.pendingOrders++;

//         this.emitOrderUpdate({
//             type: 'pending_order',
//             orderId: orderData.orderId || `order_${Date.now()}`,
//             customer: orderData.customer || 'Unknown',
//             totalOrders: this.stats.totalOrders,
//             pendingOrders: this.stats.pendingOrders,
//             completedOrders: this.stats.completedOrders,
//             companyId: this.companyId
//         });

//         this.broadcastCurrentStats();
//     }

//     trackCompletedOrder(orderData = {}) {
//         this.stats.completedOrders++;
//         if (this.stats.pendingOrders > 0) {
//             this.stats.pendingOrders--;
//         }

//         this.emitOrderUpdate({
//             type: 'completed_order',
//             orderId: orderData.orderId || `order_${Date.now()}`,
//             customer: orderData.customer || 'Unknown',
//             totalOrders: this.stats.totalOrders,
//             pendingOrders: this.stats.pendingOrders,
//             completedOrders: this.stats.completedOrders,
//             companyId: this.companyId
//         });

//         this.broadcastCurrentStats();
//     }
// }

// // Create singleton instance
// let botInstance = null;

// function createWhatsAppBot() {
//     if (!botInstance) {
//         botInstance = new WhatsAppBot();
//     }
//     return botInstance;
// }

// function getWhatsAppBot() {
//     if (!botInstance) {
//         throw new Error('WhatsAppBot not initialized. Call createWhatsAppBot() first.');
//     }
//     return botInstance;
// }

// // Default export for backward compatibility
// const bot = createWhatsAppBot();

// export { createWhatsAppBot, getWhatsAppBot };
// export default bot;


















































// bot.js - PROFESSIONAL MULTI-TENANT VERSION with LocalAuth (File-based sessions)
// OPTIMIZED: High performance, proper QR emission, handles many customers

import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';
import handleMessage from "./messageHandler.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiService from '../services/apiService.js';

dotenv.config();

const { Client, LocalAuth } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppBot extends EventEmitter {
    constructor() {
        super();

        // Multi-tenant properties
        this.companyId = null;
        this.clients = new Map();
        
        // Single client properties
        this.client = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        
        // Session management
        this.sessionPath = path.join(process.cwd(), 'sessions');
        
        // QR properties - IMPROVED
        this.currentQR = null;
        this.qrGeneratedAt = null;
        this.qrTimeout = null;
        this.qrExpiryTime = 3000000;
        this.isWaitingForScan = false;
        this.qrGenerated = false;
        
        // Connection management
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isInitializing = false;
        this.connectionTime = null;
        this.botInfo = null;
        this.isShuttingDown = false;
        
        // WebSocket tracking
        this.qrWebSocketClients = new Set();
        
        // Performance optimizations
        this.messageQueue = new Map(); // Per-company message queue
        this.processingQueue = new Map();
        this.batchWriteQueue = [];
        this.batchWriteInterval = null;
        
        // Initialize statistics with proper defaults
        this.stats = {
            totalOrders: 0,
            totalChats: 0,
            totalCustomers: new Set(),
            totalMessages: 0,
            pendingOrders: 0,
            completedOrders: 0,
            messagesPerMinute: 0,
            lastMessageCount: 0,
            lastMessageReset: Date.now()
        };

        this.statsInterval = null;
        
        // Start batch writer
        this.startBatchWriter();
        
        console.log('🤖 [WhatsAppBot] Initialized with multi-tenant support (LocalAuth)');
        console.log(`📁 Sessions will be stored in: ${this.sessionPath}`);
        console.log(`⚡ High-performance mode: Enabled`);
    }

    startBatchWriter() {
        this.batchWriteInterval = setInterval(async () => {
            if (this.batchWriteQueue.length > 0) {
                const batch = [...this.batchWriteQueue];
                this.batchWriteQueue = [];
                
                try {
                    // Process batch writes in parallel with concurrency limit
                    const concurrency = 5;
                    for (let i = 0; i < batch.length; i += concurrency) {
                        const chunk = batch.slice(i, i + concurrency);
                        await Promise.allSettled(chunk.map(item => this.processBatchItem(item)));
                    }
                } catch (error) {
                    console.error('Batch write error:', error.message);
                }
            }
        }, 5000); // Every 5 seconds
    }

    async processBatchItem(item) {
        try {
            if (item.type === 'stats') {
                await apiService.updateStats(item.data);
            } else if (item.type === 'order') {
                await apiService.updateOrder(item.data);
            }
        } catch (error) {
            console.error('Batch item error:', error.message);
        }
    }

    // ========== QR EMISSION WITH COMPANY CONTEXT (FIXED) ==========
    emitQRCode(qrData) {
        console.log(`\n📡 [BOT] Emitting QR update for company: ${qrData?.companyId || 'unknown'}`);
        console.log(`📡 QR Data length: ${qrData?.qr?.length || 0}`);
        
        const eventData = {
            ...qrData,
            timestamp: new Date().toISOString(),
            eventType: 'qr-update'
        };
        
        // Emit to all listeners (WebSocket server)
        this.emit('qr-update', eventData);
        
        // Also emit specific company event
        if (qrData?.companyId) {
            this.emit(`qr-update:${qrData.companyId}`, eventData);
        }
        
        console.log(`✅ QR event emitted successfully`);
    }

    emitStatusChange(status) {
        const eventData = {
            ...status,
            timestamp: new Date().toISOString(),
            eventType: 'status-change'
        };
        
        this.emit('status-change', eventData);
        
        if (status.companyId) {
            this.emit(`status-change:${status.companyId}`, eventData);
        }
    }

    emitMessage(messageData) {
        this.emit('message', {
            ...messageData,
            timestamp: new Date().toISOString()
        });
    }

    emitOrderUpdate(orderData) {
        this.emit('order-update', {
            ...orderData,
            timestamp: new Date().toISOString()
        });
    }

    emitStatsUpdate(stats) {
        this.emit('stats-update', {
            ...stats,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Initialize WhatsApp client for a specific company
     */
    async initializeForCompany(companyId) {
        if (!companyId) {
            throw new Error('Company ID is required for multi-tenant initialization');
        }
        
        this.companyId = companyId;
        console.log(`🏢 [Company:${companyId}] Initializing WhatsApp client...`);
        
        return this.initialize();
    }

    async initialize() {
        if (this.isInitializing) {
            console.log('🔄 Bot initialization already in progress...');
            return;
        }

        this.isInitializing = true;
        this.isShuttingDown = false;

        try {
            console.log('🚀 Initializing WhatsApp E-commerce Bot...');

            if (this.client) {
                await this.safeDestroyClient();
            }

            await this.initializeClient();

            this.reconnectAttempts = 0;
            console.log('✅ Bot initialization completed successfully');

        } catch (error) {
            console.error('❌ Bot initialization failed:', error);
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
        }
    }

    initializeClient() {
        console.log('\n' + '🔍'.repeat(20));
        console.log(`🔍 [DEBUG] Initializing client for company: ${this.companyId || 'null'}`);
        console.log('🔍'.repeat(20) + '\n');
        
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(this.sessionPath)) {
                    fs.mkdirSync(this.sessionPath, { recursive: true });
                }

                const clientId = this.companyId 
                    ? `company_${this.companyId}` 
                    : `whatsapp-bot-${Date.now()}`;
                
                console.log(`🆔 Client ID: ${clientId}`);

                this.client = new Client({
                    authStrategy: new LocalAuth({
                        clientId: clientId,
                        dataPath: this.sessionPath
                    }),
                    puppeteer: {
                        headless: 'new',
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-accelerated-2d-canvas',
                            '--no-first-run',
                            '--no-zygote',
                            '--disable-gpu',
                            '--disable-web-security',
                            '--disable-features=VizDisplayCompositor',
                            '--disable-features=TranslateUI',
                            '--disable-ipc-flooding-protection',
                            '--disable-renderer-backgrounding',
                            '--disable-background-timer-throttling',
                            '--disable-backgrounding-occluded-windows',
                            '--disable-breakpad',
                            '--disable-sync',
                            '--disable-default-apps',
                            '--disable-extensions',
                            '--disable-component-extensions-with-background-pages',
                            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
                            '--disable-features=IsolateOrigins,site-per-process',
                            '--window-size=1920,1080',
                            '--max_old_space_size=256'
                        ],
                        timeout: 60000,
                        ignoreHTTPSErrors: true
                    },
                    qrMaxRetries: 3,
                    authTimeoutMs: 120000,
                    takeoverOnConflict: true,
                    takeoverTimeoutMs: 60000
                });

                this.setupEventHandlers(resolve, reject);
                this.client.initialize().catch(reject);

            } catch (error) {
                reject(new Error(`Client initialization failed: ${error.message}`));
            }
        });
    }

    setupEventHandlers(resolve, reject) {
        let initializationTimeout;
        let qrGeneratedFlag = false;

        initializationTimeout = setTimeout(() => {
            if (!this.isConnected) {
                const error = new Error('Client initialization timeout');
                console.error('❌', error.message);
                this.emitStatusChange({
                    connected: false,
                    status: 'error',
                    message: 'Initialization timeout'
                });
                reject(error);
            }
        }, 120000);

        // ========== QR HANDLER - CRITICAL FIX ==========
        this.client.on('qr', async (qr) => {
            console.log('\n' + '='.repeat(60));
            console.log(`📱 QR CODE GENERATED for company: ${this.companyId || 'unknown'}`);
            console.log('='.repeat(60));
            
            clearTimeout(initializationTimeout);
            
            // Store QR
            this.currentQR = qr;
            this.qrGeneratedAt = Date.now();
            this.isWaitingForScan = true;
            
            // Show QR in terminal (once)
            if (!qrGeneratedFlag) {
                qrcode.generate(qr, { small: true });
                qrGeneratedFlag = true;
                
                console.log('\n📱 HOW TO CONNECT:');
                console.log('1. Open WhatsApp → Menu → Linked Devices');
                console.log('2. Tap "Link a Device"');
                console.log('3. Scan the QR code above\n');
            }
            
            // ========== CRITICAL: EMIT QR TO WEBSOCKET ==========
            const qrData = {
                qr: qr,
                expiresIn: this.qrExpiryTime / 1000,
                generatedAt: this.qrGeneratedAt,
                isValid: true,
                companyId: this.companyId,
                clientId: this.client?.authStrategy?.clientId
            };
            
            console.log(`📡 EMITTING QR to WebSocket for company: ${this.companyId}`);
            this.emitQRCode(qrData);
            
            // Emit status change
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                hasQR: true,
                status: 'qr_required',
                message: 'Scan QR code to connect WhatsApp',
                companyId: this.companyId,
                qrData: qr
            });
            
            // Set QR expiry
            if (this.qrTimeout) clearTimeout(this.qrTimeout);
            this.qrTimeout = setTimeout(() => {
                if (this.isWaitingForScan && this.currentQR === qr) {
                    console.log('⏰ QR code expired');
                    this.isWaitingForScan = false;
                    this.currentQR = null;
                    this.qrGeneratedAt = null;
                    
                    this.emitQRCode(null);
                    this.emitStatusChange({
                        connected: false,
                        authenticated: false,
                        hasQR: false,
                        status: 'qr_expired',
                        message: 'QR code expired',
                        companyId: this.companyId
                    });
                }
            }, this.qrExpiryTime);
        });

        this.client.on('ready', async () => {
            console.log('\n' + '='.repeat(60));
            console.log(`✅ WHATSAPP CONNECTED for company: ${this.companyId || 'unknown'}`);
            console.log('='.repeat(60) + '\n');
            
            clearTimeout(initializationTimeout);

            this.isConnected = true;
            this.isAuthenticated = true;
            this.currentQR = null;
            this.isWaitingForScan = false;
            this.qrGeneratedAt = null;
            
            if (this.qrTimeout) clearTimeout(this.qrTimeout);
            
            this.reconnectAttempts = 0;
            this.connectionTime = new Date();

            const clientId = this.client?.authStrategy?.clientId || 'unknown';

            if (this.companyId) {
                this.clients.set(this.companyId, this.client);
            }

            this.emitStatusChange({
                connected: true,
                authenticated: true,
                hasQR: false,
                status: 'connected',
                message: 'WhatsApp is connected and ready',
                companyId: this.companyId,
                clientId: clientId
            });

            this.startStatsBroadcasting();
            
            setTimeout(() => {
                this.displayBotInfo().catch(() => {});
            }, 5000);

            resolve();
        });

        this.client.on('authenticated', () => {
            console.log(`🔐 Authentication successful for company: ${this.companyId || 'unknown'}`);
            
            this.isAuthenticated = true;
            this.isWaitingForScan = false;
            this.currentQR = null;
            
            if (this.qrTimeout) clearTimeout(this.qrTimeout);

            this.emitStatusChange({
                connected: false,
                authenticated: true,
                hasQR: false,
                status: 'authenticated',
                message: 'WhatsApp authentication successful',
                companyId: this.companyId
            });
        });

        this.client.on('auth_failure', (error) => {
            clearTimeout(initializationTimeout);
            console.error(`❌ Authentication failed:`, error.message);
            
            this.isAuthenticated = false;
            
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'auth_failed',
                message: `Authentication failed: ${error.message}`,
                companyId: this.companyId
            });
            
            reject(new Error(`Authentication failed: ${error.message}`));
        });

        this.client.on('disconnected', async (reason) => {
            console.log(`🔌 Disconnected: ${reason} for company: ${this.companyId || 'unknown'}`);
            
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            
            this.stopStatsBroadcasting();
            
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'disconnected',
                message: `WhatsApp disconnected: ${reason}`,
                companyId: this.companyId
            });
            
            if (this.isShuttingDown) return;
            
            if (reason === 'LOGOUT' || reason === 'UNAUTHORIZED') {
                setTimeout(() => {
                    this.initialize().catch(console.error);
                }, 3000);
            } else {
                await this.handleReconnection();
            }
        });

        // ========== MESSAGE HANDLER WITH PERFORMANCE OPTIMIZATIONS ==========
        this.client.on('message', async (message) => {
            if (message.from === 'status@broadcast' || message.isGroupMsg) return;
            
            const startTime = Date.now();
            
            try {
                let companyId = this.companyId;
                
                if (message.to) {
                    const phoneNumber = message.to.split('@')[0];
                    
                    if (apiService && typeof apiService.identifyCompanyFromWhatsApp === 'function') {
                        const identifiedCompanyId = await apiService.identifyCompanyFromWhatsApp(phoneNumber);
                        if (identifiedCompanyId) {
                            companyId = identifiedCompanyId;
                            if (this.companyId !== identifiedCompanyId) {
                                this.companyId = identifiedCompanyId;
                            }
                        }
                    }
                }
                
                // Update stats efficiently
                this.updateMessageStats(message.from);
                
                // Queue message for processing (non-blocking)
                const processMessage = async () => {
                    await handleMessage(message, this.client, companyId);
                    
                    const duration = Date.now() - startTime;
                    if (duration > 200) {
                        console.log(`⚠️ Slow message processing: ${duration}ms`);
                    }
                };
                
                // Process without blocking
                processMessage().catch(error => {
                    console.error('Message processing error:', error);
                });
                
            } catch (error) {
                console.error('Message handler error:', error);
                await this.handleMessageError(message, error);
            }
        });

        this.client.on('change_state', (state) => {
            console.log(`🔄 Connection state: ${state}`);
            this.emitStatusChange({
                connected: this.isConnected,
                authenticated: this.isAuthenticated,
                status: 'state_change',
                message: `Connection state: ${state}`,
                companyId: this.companyId
            });
        });
        
        console.log(`✅ Event handlers setup complete`);
    }

    // ========== PERFORMANCE OPTIMIZATIONS ==========
    
    updateMessageStats(from) {
        this.stats.totalMessages++;
        this.stats.totalCustomers.add(from);
        this.stats.totalChats = this.stats.totalCustomers.size;
        
        // Track messages per minute
        const now = Date.now();
        if (now - this.stats.lastMessageReset >= 60000) {
            this.stats.messagesPerMinute = this.stats.totalMessages - this.stats.lastMessageCount;
            this.stats.lastMessageCount = this.stats.totalMessages;
            this.stats.lastMessageReset = now;
        }
        
        // Throttle stats broadcast
        if (this.stats.totalMessages % 10 === 0) {
            this.broadcastCurrentStats();
        }
    }

    startStatsBroadcasting() {
        if (this.statsInterval) clearInterval(this.statsInterval);
        
        this.statsInterval = setInterval(() => {
            this.broadcastCurrentStats();
        }, 10000); // Every 10 seconds instead of 3
        
        console.log('📊 Started statistics broadcasting (10s interval)');
    }

    stopStatsBroadcasting() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
    }

    broadcastCurrentStats() {
        const statsData = {
            totalOrders: this.stats.totalOrders,
            totalChats: this.stats.totalChats,
            totalCustomers: this.stats.totalCustomers.size,
            totalMessages: this.stats.totalMessages,
            pendingOrders: this.stats.pendingOrders,
            completedOrders: this.stats.completedOrders,
            messagesPerMinute: this.stats.messagesPerMinute,
            lastUpdated: new Date().toISOString(),
            companyId: this.companyId,
            activeCompanies: this.clients.size
        };
        
        this.emitStatsUpdate(statsData);
    }

    // ========== MULTI-TENANT CLIENT MANAGEMENT ==========

    getClientForCompany(companyId) {
        return this.clients.get(companyId);
    }

    async addCompany(companyId) {
        if (this.clients.has(companyId)) {
            return this.clients.get(companyId);
        }
        
        const previousCompany = this.companyId;
        this.companyId = companyId;
        
        try {
            await this.initialize();
            return this.client;
        } catch (error) {
            this.companyId = previousCompany;
            throw error;
        }
    }

    async removeCompany(companyId) {
        const client = this.clients.get(companyId);
        if (!client) return;
        
        const previousClient = this.client;
        const previousCompany = this.companyId;
        
        this.client = client;
        this.companyId = companyId;
        
        try {
            await this.safeDestroyClient();
            this.clients.delete(companyId);
            
            const companySessionPath = path.join(this.sessionPath, `company_${companyId}`);
            if (fs.existsSync(companySessionPath)) {
                fs.rmSync(companySessionPath, { recursive: true, force: true });
            }
        } finally {
            this.client = previousClient;
            this.companyId = previousCompany;
        }
    }

    getAllClients() {
        const clients = [];
        this.clients.forEach((client, companyId) => {
            clients.push({
                companyId,
                clientId: client?.authStrategy?.clientId,
                isConnected: client?.info?.wid ? true : false
            });
        });
        return clients;
    }

    // ========== RECONNECTION AND CLEANUP ==========

    async handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`💥 Max reconnection attempts reached`);
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'error',
                message: 'Max reconnection attempts reached',
                companyId: this.companyId
            });
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(5000 * Math.pow(1.5, this.reconnectAttempts), 30000);

        console.log(`🔄 Reconnecting in ${delay/1000}s (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.emitStatusChange({
            connected: false,
            authenticated: false,
            status: 'reconnecting',
            message: `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
            companyId: this.companyId
        });

        setTimeout(async () => {
            try {
                await this.initialize();
            } catch (error) {
                console.error(`Reconnection failed:`, error.message);
            }
        }, delay);
    }

    async safeDestroyClient() {
        try {
            if (this.client) {
                console.log(`🛑 Destroying client...`);
                this.isShuttingDown = true;
                
                if (this.companyId) {
                    this.clients.delete(this.companyId);
                }
                
                await this.client.destroy();
                this.client = null;
            }
        } catch (error) {
            console.error(`Destroy error:`, error.message);
            this.client = null;
        } finally {
            this.isShuttingDown = false;
        }
    }

    async clearSession() {
        try {
            if (this.companyId) {
                const companySessionPath = path.join(this.sessionPath, `company_${this.companyId}`);
                if (fs.existsSync(companySessionPath)) {
                    fs.rmSync(companySessionPath, { recursive: true, force: true });
                    console.log(`✅ Session cleared for company ${this.companyId}`);
                }
            } else if (fs.existsSync(this.sessionPath)) {
                fs.rmSync(this.sessionPath, { recursive: true, force: true });
                console.log('✅ All sessions cleared');
            }
        } catch (error) {
            console.error('Session clear error:', error);
        }
    }

    async handleMessageError(message, error) {
        try {
            if (error.message.includes('Execution context was destroyed') ||
                error.message.includes('Session closed')) {
                return;
            }
            
            await message.reply('⚠️ Temporary issue. Please try again.');
        } catch (replyError) {
            // Silent fail
        }
    }

    async handleInitializationError(error) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'failed',
                message: 'Max reconnection attempts reached',
                companyId: this.companyId
            });
            return;
        }
        
        if (error.message.includes('session') || error.message.includes('auth')) {
            this.reconnectAttempts++;
            setTimeout(() => {
                this.initialize().catch(console.error);
            }, 10000);
        } else {
            await this.handleReconnection();
        }
    }

    // ========== UTILITY METHODS ==========

    getCurrentQR() {
        if (!this.currentQR || !this.isWaitingForScan) return null;
        
        const timeLeft = this.qrExpiryTime - (Date.now() - this.qrGeneratedAt);
        if (timeLeft <= 0) return null;
        
        return {
            qr: this.currentQR,
            expiresIn: Math.floor(timeLeft / 1000),
            generatedAt: this.qrGeneratedAt,
            isValid: true,
            companyId: this.companyId
        };
    }

    registerQRClient(clientId) {
        this.qrWebSocketClients.add(clientId);
        return this.getCurrentQR();
    }

    unregisterQRClient(clientId) {
        this.qrWebSocketClients.delete(clientId);
    }

    getStatus() {
        return {
            connected: this.isConnected,
            authenticated: this.isAuthenticated,
            hasQR: !!this.getCurrentQR(),
            qrData: this.getCurrentQR(),
            connectionTime: this.connectionTime,
            botInfo: this.botInfo,
            stats: {
                totalOrders: this.stats.totalOrders,
                totalChats: this.stats.totalChats,
                totalCustomers: this.stats.totalCustomers.size,
                totalMessages: this.stats.totalMessages,
                pendingOrders: this.stats.pendingOrders,
                completedOrders: this.stats.completedOrders,
                messagesPerMinute: this.stats.messagesPerMinute
            },
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            uptime: this.getUptime(),
            formattedUptime: this.getFormattedUptime(),
            companyId: this.companyId,
            multiTenant: {
                activeCompanies: this.clients.size,
                companies: this.getAllClients()
            }
        };
    }

    async sendMessage(phoneNumber, message) {
        try {
            if (!this.client || !this.isConnected) {
                throw new Error('WhatsApp client not connected');
            }
            
            const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
            await this.client.sendMessage(formattedNumber, message);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async displayBotInfo() {
        try {
            if (!this.client) return;
            
            let info = null;
            try {
                info = await this.client.getInfo();
            } catch (e) {}
            
            if (!info && this.client.info) info = this.client.info;
            
            this.botInfo = {
                pushname: info?.pushname || 'Connected',
                platform: info?.platform || 'WhatsApp',
                version: info?.waVersion || 'Unknown',
                phoneNumber: info?.wid?.user || 'Connected',
                connectedSince: this.connectionTime?.toISOString(),
                companyId: this.companyId
            };
        } catch (error) {}
    }

    getUptime() {
        if (!this.connectionTime) return 0;
        return Math.floor((Date.now() - this.connectionTime) / 1000);
    }

    getFormattedUptime() {
        const seconds = this.getUptime();
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    async shutdown() {
        console.log('\n🛑 Shutting down...');
        
        if (this.batchWriteInterval) {
            clearInterval(this.batchWriteInterval);
        }
        
        this.stopStatsBroadcasting();
        
        const companies = Array.from(this.clients.keys());
        for (const companyId of companies) {
            await this.removeCompany(companyId);
        }
        
        await this.safeDestroyClient();
        
        this.qrWebSocketClients.clear();
        console.log('✅ Shutdown complete');
    }

    async logout() {
        console.log('\n🚪 Logging out...');
        const currentCompanyId = this.companyId;
        
        try {
            this.isShuttingDown = true;
            await this.safeDestroyClient();
            await this.clearSession();
            
            this.currentQR = null;
            this.isWaitingForScan = false;
            this.isConnected = false;
            this.isAuthenticated = false;
            this.qrWebSocketClients.clear();
            
            setTimeout(() => {
                this.isShuttingDown = false;
                if (currentCompanyId) {
                    this.initializeForCompany(currentCompanyId).catch(console.error);
                } else {
                    this.initialize().catch(console.error);
                }
            }, 2000);
        } catch (error) {
            console.error('Logout error:', error);
            this.isShuttingDown = false;
        }
    }

    async restart() {
        console.log('\n🔄 Restarting...');
        await this.shutdown();
        setTimeout(() => this.initialize(), 3000);
    }

    trackNewOrder(orderData = {}) {
        this.stats.totalOrders++;
        this.batchWriteQueue.push({ type: 'order', data: orderData });
        this.broadcastCurrentStats();
    }

    trackPendingOrder(orderData = {}) {
        this.stats.pendingOrders++;
        this.broadcastCurrentStats();
    }

    trackCompletedOrder(orderData = {}) {
        this.stats.completedOrders++;
        if (this.stats.pendingOrders > 0) this.stats.pendingOrders--;
        this.broadcastCurrentStats();
    }
}

// Create singleton instance
let botInstance = null;

function createWhatsAppBot() {
    if (!botInstance) {
        botInstance = new WhatsAppBot();
    }
    return botInstance;
}

function getWhatsAppBot() {
    if (!botInstance) {
        throw new Error('WhatsAppBot not initialized');
    }
    return botInstance;this.qrExpiryTime = 60000;
}

const bot = createWhatsAppBot();

export { createWhatsAppBot, getWhatsAppBot };
export default bot;