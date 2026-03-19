




// // // // // above code is working well and fine 





// // // // // bot.js - Complete updated version with EventEmitter and WebSocket integration
// // // // import pkg from 'whatsapp-web.js';
// // // // import qrcode from 'qrcode-terminal';
// // // // import { EventEmitter } from 'events';
// // // // import dotenv from 'dotenv';
// // // // import handleMessage from "./messageHandler.js";
// // // // import fs from 'fs';
// // // // import path from 'path';
// // // // import { fileURLToPath } from 'url';

// // // // dotenv.config();

// // // // const { Client, LocalAuth } = pkg;

// // // // // ES module equivalent of __dirname
// // // // const __filename = fileURLToPath(import.meta.url);
// // // // const __dirname = path.dirname(__filename);

// // // // class WhatsAppBot extends EventEmitter {
// // // //     constructor() {
// // // //         super(); // Initialize EventEmitter

// // // //         this.client = null;
// // // //         this.isConnected = false;
// // // //         this.isAuthenticated = false;
// // // //         this.sessionPath = path.join(__dirname, 'sessions');
// // // //         this.currentQR = null;
// // // //         this.reconnectAttempts = 0;
// // // //         this.maxReconnectAttempts = 5;
// // // //         this.isInitializing = false;
// // // //         this.connectionTime = null;
// // // //         this.botInfo = null;
// // // //         this.isShuttingDown = false;

// // // //         // Initialize statistics
// // // //         this.stats = {
// // // //             totalOrders: 0,
// // // //             totalChats: 0,
// // // //             totalCustomers: new Set(),
// // // //             totalMessages: 0,
// // // //             pendingOrders: 0,
// // // //             completedOrders: 0
// // // //         };

// // // //         this.statsInterval = null;
// // // //     }

// // // //     async initialize() {
// // // //         if (this.isInitializing) {
// // // //             console.log('🔄 Bot initialization already in progress...');
// // // //             return;
// // // //         }

// // // //         this.isInitializing = true;
// // // //         this.isShuttingDown = false;

// // // //         try {
// // // //             console.log('🚀 Initializing WhatsApp E-commerce Bot...');

// // // //             // Clear any existing client
// // // //             if (this.client) {
// // // //                 await this.safeDestroyClient();
// // // //             }

// // // //             // Initialize WhatsApp client
// // // //             await this.initializeClient();

// // // //             this.reconnectAttempts = 0;
// // // //             console.log('✅ Bot initialization completed successfully');

// // // //         } catch (error) {
// // // //             console.error('❌ Bot initialization failed:', error);
// // // //             await this.handleInitializationError(error);
// // // //         } finally {
// // // //             this.isInitializing = false;
// // // //         }
// // // //     }

// // // //     initializeClient() {
// // // //         return new Promise((resolve, reject) => {
// // // //             try {
// // // //                 // Ensure session directory exists
// // // //                 if (!fs.existsSync(this.sessionPath)) {
// // // //                     fs.mkdirSync(this.sessionPath, { recursive: true });
// // // //                 }

// // // //                 console.log('📁 Session path:', this.sessionPath);

// // // //                 this.client = new Client({
// // // //                     authStrategy: new LocalAuth(),
// // // //                     puppeteer: {
// // // //                         headless: true,
// // // //                         args: [
// // // //                             '--no-sandbox',
// // // //                             '--disable-setuid-sandbox',
// // // //                             '--disable-dev-shm-usage',
// // // //                             '--disable-accelerated-2d-canvas',
// // // //                             '--no-first-run',
// // // //                             '--no-zygote',
// // // //                             '--disable-gpu',
// // // //                         ],
// // // //                         timeout: 60000,
// // // //                         ignoreHTTPSErrors: true
// // // //                     },
// // // //                 });

// // // //                 this.setupEventHandlers(resolve, reject);

// // // //                 console.log('🔧 Starting client initialization...');
// // // //                 this.client.initialize().catch(reject);

// // // //             } catch (error) {
// // // //                 reject(new Error(`Client initialization failed: ${error.message}`));
// // // //             }
// // // //         });
// // // //     }

// // // //     setupEventHandlers(resolve, reject) {
// // // //         let qrGenerated = false;
// // // //         let initializationTimeout;

// // // //         // Set initialization timeout (2 minutes)
// // // //         initializationTimeout = setTimeout(() => {
// // // //             if (!this.isConnected) {
// // // //                 const error = new Error('Client initialization timeout - taking too long to connect');
// // // //                 console.error('❌', error.message);

// // // //                 // Emit status change event
// // // //                 this.emitStatusChange({
// // // //                     connected: false,
// // // //                     status: 'error',
// // // //                     message: 'Initialization timeout - taking too long to connect'
// // // //                 });

// // // //                 reject(error);
// // // //             }
// // // //         }, 120000);

// // // //         this.client.on('qr', async (qr) => {
// // // //             clearTimeout(initializationTimeout);

// // // //             this.currentQR = qr;

// // // //             console.log('📱 QR Code generated');

// // // //             // Emit QR update event
// // // //             this.emitQRCode(qr);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 hasQR: true,
// // // //                 status: 'qr_required',
// // // //                 message: 'Scan QR code to connect WhatsApp'
// // // //             });

// // // //             if (!qrGenerated) {
// // // //                 console.log('\n📱 WhatsApp Authentication Required');
// // // //                 console.log('====================================');
// // // //                 console.log('1. Open WhatsApp on your phone');
// // // //                 console.log('2. Go to Settings → Linked Devices → Link a Device');
// // // //                 console.log('3. Scan the QR code below:\n');
// // // //                 qrcode.generate(qr, { small: true });
// // // //                 console.log('\n====================================');
// // // //                 console.log('🌐 QR code is also available on the web dashboard');
// // // //                 qrGenerated = true;
// // // //             }
// // // //         });

// // // //         this.client.on('ready', async () => {
// // // //             clearTimeout(initializationTimeout);

// // // //             this.isConnected = true;
// // // //             this.isAuthenticated = true;
// // // //             this.currentQR = null;
// // // //             this.reconnectAttempts = 0;
// // // //             this.connectionTime = new Date();

// // // //             console.log('\n✅ WhatsApp Bot Successfully Initialized');
// // // //             console.log('========================================');
// // // //             console.log('🤖 E-commerce Bot Status: ONLINE');
// // // //             console.log('📱 Phone Number: Connected');
// // // //             console.log('💼 Session: PERSISTENT');
// // // //             console.log('🛍️  Ready to process customer orders');
// // // //             console.log('========================================\n');

// // // //             this.emitStatusChange({
// // // //                 connected: true,
// // // //                 authenticated: true,
// // // //                 hasQR: false,
// // // //                 status: 'connected',
// // // //                 message: 'WhatsApp is connected and ready'
// // // //             });

// // // //             // Start stats (safe)
// // // //             this.startStatsBroadcasting();

// // // //             // 🔥 Delay bot info loading (prevents freeze)
// // // //             setTimeout(() => {
// // // //                 this.displayBotInfo().catch(err =>
// // // //                     console.log('⚠️ Bot info load skipped:', err.message)
// // // //                 );
// // // //             }, 5000);

// // // //             resolve();
// // // //         });

// // // //         this.client.on('authenticated', () => {
// // // //             this.isAuthenticated = true;
// // // //             this.currentQR = null;
// // // //             console.log('🔐 Authentication successful - Session saved');

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: true,
// // // //                 hasQR: false,
// // // //                 status: 'authenticated',
// // // //                 message: 'WhatsApp authentication successful'
// // // //             });
// // // //         });

// // // //         this.client.on('auth_failure', (error) => {
// // // //             clearTimeout(initializationTimeout);

// // // //             this.isAuthenticated = false;
// // // //             console.error('❌ Authentication failed:', error);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'auth_failed',
// // // //                 message: 'Authentication failed. New QR code will be generated.'
// // // //             });

// // // //             reject(new Error(`Authentication failed: ${error.message}`));
// // // //         });

// // // //         this.client.on('disconnected', async (reason) => {
// // // //             console.log(`🔌 Disconnected: ${reason}`);

// // // //             this.isConnected = false;
// // // //             this.isAuthenticated = false;
// // // //             this.currentQR = null;

// // // //             // Stop stats broadcasting when disconnected
// // // //             this.stopStatsBroadcasting();

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'disconnected',
// // // //                 message: `WhatsApp disconnected: ${reason}`
// // // //             });

// // // //             // Don't try to reconnect if we're shutting down or logging out
// // // //             if (this.isShuttingDown) {
// // // //                 return;
// // // //             }

// // // //             // Handle different disconnect reasons
// // // //             if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {
// // // //                 console.log('🔄 Login issue detected. Generating new QR code...');

// // // //                 // Emit status change event
// // // //                 this.emitStatusChange({
// // // //                     connected: false,
// // // //                     authenticated: false,
// // // //                     status: 'qr_required',
// // // //                     message: 'Reconnecting WhatsApp...'
// // // //                 });

// // // //                 // Clear session and restart
// // // //                 await this.clearSession();
// // // //                 setTimeout(() => {
// // // //                     this.initialize().catch(console.error);
// // // //                 }, 3000);
// // // //             } else {
// // // //                 await this.handleReconnection();
// // // //             }
// // // //         });

// // // //         this.client.on('message', async (message) => {
// // // //             if (message.from === 'status@broadcast' || message.isGroupMsg) return;

// // // //             try {
// // // //                 // Update statistics for every message
// // // //                 this.updateMessageStats(message.from);

// // // //                 // Log incoming message
// // // //                 console.log(`📨 Message from ${message.from}: ${message.body?.substring(0, 50)}...`);

// // // //                 // Emit message event
// // // //                 this.emitMessage({
// // // //                     from: message.from,
// // // //                     body: message.body,
// // // //                     timestamp: new Date().toISOString(),
// // // //                     hasMedia: message.hasMedia,
// // // //                     type: message.type
// // // //                 });

// // // //                 await handleMessage(message, this.client);
// // // //             } catch (error) {
// // // //                 console.error('❌ Message processing error:', error);
// // // //                 await this.handleMessageError(message, error);
// // // //             }
// // // //         });

// // // //         // Monitor connection state
// // // //         this.client.on('change_state', (state) => {
// // // //             console.log(`🔄 Connection state: ${state}`);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: this.isConnected,
// // // //                 authenticated: this.isAuthenticated,
// // // //                 status: 'state_change',
// // // //                 message: `Connection state: ${state}`
// // // //             });
// // // //         });

// // // //         // Loading screen events
// // // //         this.client.on('loading_screen', (percent, message) => {
// // // //             console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: this.isConnected,
// // // //                 authenticated: this.isAuthenticated,
// // // //                 status: 'loading',
// // // //                 message: `Loading: ${percent}% - ${message}`
// // // //             });
// // // //         });

// // // //         // Handle page errors
// // // //         this.client.on('page_error', (error) => {
// // // //             if (this.isShuttingDown && (
// // // //                 error.message.includes('Session closed') ||
// // // //                 error.message.includes('page has been closed') ||
// // // //                 error.message.includes('Protocol error')
// // // //             )) {
// // // //                 console.log('⚠️ Page error during shutdown (expected):', error.message);
// // // //                 return;
// // // //             }
// // // //             console.error('❌ Page error:', error);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: this.isConnected,
// // // //                 authenticated: this.isAuthenticated,
// // // //                 status: 'page_error',
// // // //                 message: `Page error: ${error.message}`
// // // //             });
// // // //         });
// // // //     }

// // // //     // ========== EVENT EMITTER METHODS ==========

// // // //     // When QR code is generated
// // // //     emitQRCode(qr) {
// // // //         this.emit('qr-update', qr);
// // // //     }

// // // //     // When status changes
// // // //     emitStatusChange(status) {
// // // //         this.emit('status-change', {
// // // //             ...status,
// // // //             timestamp: new Date().toISOString()
// // // //         });
// // // //     }

// // // //     // When message is received
// // // //     emitMessage(messageData) {
// // // //         this.emit('message', messageData);
// // // //     }

// // // //     // When order is tracked
// // // //     emitOrderUpdate(orderData) {
// // // //         this.emit('order-update', {
// // // //             ...orderData,
// // // //             timestamp: new Date().toISOString()
// // // //         });
// // // //     }

// // // //     // When stats are updated
// // // //     emitStatsUpdate(stats) {
// // // //         this.emit('stats-update', {
// // // //             ...stats,
// // // //             timestamp: new Date().toISOString()
// // // //         });
// // // //     }

// // // //     async handleReconnection() {
// // // //         if (this.reconnectAttempts >= this.maxReconnectAttempts) {
// // // //             console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'error',
// // // //                 message: 'Maximum reconnection attempts reached. Manual intervention required.'
// // // //             });

// // // //             return;
// // // //         }

// // // //         this.reconnectAttempts++;
// // // //         const delay = 5000 * this.reconnectAttempts;

// // // //         console.log(`🔄 Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

// // // //         // Emit status change event
// // // //         this.emitStatusChange({
// // // //             connected: false,
// // // //             authenticated: false,
// // // //             status: 'reconnecting',
// // // //             message: `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
// // // //         });

// // // //         setTimeout(async () => {
// // // //             try {
// // // //                 await this.initialize();
// // // //             } catch (error) {
// // // //                 console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);

// // // //                 // Emit status change event
// // // //                 this.emitStatusChange({
// // // //                     connected: false,
// // // //                     authenticated: false,
// // // //                     status: 'reconnect_failed',
// // // //                     message: `Reconnection attempt ${this.reconnectAttempts} failed`
// // // //                 });
// // // //             }
// // // //         }, delay);
// // // //     }

// // // //     async safeDestroyClient() {
// // // //         try {
// // // //             if (this.client) {
// // // //                 console.log('🛑 Safely destroying existing client...');
// // // //                 this.isShuttingDown = true;
// // // //                 await this.client.destroy();
// // // //                 this.client = null;
// // // //                 console.log('✅ Client destroyed safely');

// // // //                 // Emit status change event
// // // //                 this.emitStatusChange({
// // // //                     connected: false,
// // // //                     authenticated: false,
// // // //                     status: 'client_destroyed',
// // // //                     message: 'WhatsApp client destroyed'
// // // //                 });
// // // //             }
// // // //         } catch (error) {
// // // //             if (!error.message.includes('Session closed') &&
// // // //                 !error.message.includes('page has been closed') &&
// // // //                 !error.message.includes('Protocol error')) {
// // // //                 console.error('❌ Error destroying client:', error);

// // // //                 // Emit status change event
// // // //                 this.emitStatusChange({
// // // //                     connected: false,
// // // //                     authenticated: false,
// // // //                     status: 'error',
// // // //                     message: `Error destroying client: ${error.message}`
// // // //                 });
// // // //             } else {
// // // //                 console.log('⚠️ Client destruction error (expected):', error.message);
// // // //             }
// // // //             this.client = null;
// // // //         } finally {
// // // //             this.isShuttingDown = false;
// // // //         }
// // // //     }

// // // //     async clearSession() {
// // // //         try {
// // // //             console.log('🧹 Clearing session data...');

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'clearing_session',
// // // //                 message: 'Clearing session data...'
// // // //             });

// // // //             if (fs.existsSync(this.sessionPath)) {
// // // //                 fs.rmSync(this.sessionPath, { recursive: true, force: true });
// // // //                 console.log('✅ Session cleared successfully');

// // // //                 // Emit status change event
// // // //                 this.emitStatusChange({
// // // //                     connected: false,
// // // //                     authenticated: false,
// // // //                     status: 'session_cleared',
// // // //                     message: 'Session cleared successfully'
// // // //                 });
// // // //             }
// // // //         } catch (error) {
// // // //             console.error('❌ Error clearing session:', error);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'session_error',
// // // //                 message: `Error clearing session: ${error.message}`
// // // //             });
// // // //         }
// // // //     }

// // // //     updateMessageStats(from) {
// // // //         this.stats.totalMessages++;
// // // //         this.stats.totalCustomers.add(from);
// // // //         this.stats.totalChats = this.stats.totalCustomers.size;

// // // //         this.broadcastCurrentStats();
// // // //     }

// // // //     startStatsBroadcasting() {
// // // //         // Initial broadcast
// // // //         this.broadcastCurrentStats();

// // // //         // Set up interval for regular updates
// // // //         if (this.statsInterval) {
// // // //             clearInterval(this.statsInterval);
// // // //         }

// // // //         this.statsInterval = setInterval(() => {
// // // //             this.broadcastCurrentStats();
// // // //         }, 3000);

// // // //         console.log('📊 Started statistics broadcasting');
// // // //     }

// // // //     stopStatsBroadcasting() {
// // // //         if (this.statsInterval) {
// // // //             clearInterval(this.statsInterval);
// // // //             this.statsInterval = null;
// // // //             console.log('📊 Stopped statistics broadcasting');
// // // //         }
// // // //     }

// // // //     broadcastCurrentStats() {
// // // //         const statsData = {
// // // //             totalOrders: this.stats.totalOrders,
// // // //             totalChats: this.stats.totalChats,
// // // //             totalCustomers: this.stats.totalCustomers.size,
// // // //             totalMessages: this.stats.totalMessages,
// // // //             pendingOrders: this.stats.pendingOrders,
// // // //             completedOrders: this.stats.completedOrders,
// // // //             lastUpdated: new Date().toISOString()
// // // //         };

// // // //         // Emit stats update event
// // // //         this.emitStatsUpdate(statsData);
// // // //     }

// // // //     /**
// // // //      * FIXED: Display bot info using the correct API
// // // //      * Different versions of whatsapp-web.js use different methods
// // // //      */
// // // //     async displayBotInfo() {
// // // //         try {
// // // //             if (!this.client) {
// // // //                 console.log('📊 Bot info: Client not initialized');
// // // //                 return;
// // // //             }

// // // //             // Try multiple methods to get bot info (different versions use different APIs)
// // // //             let info = null;
            
// // // //             // Method 1: Try getInfo() (newer versions)
// // // //             if (typeof this.client.getInfo === 'function') {
// // // //                 try {
// // // //                     info = await this.client.getInfo();
// // // //                 } catch (e) {
// // // //                     console.log('📊 getInfo() failed, trying alternative methods...');
// // // //                 }
// // // //             }
            
// // // //             // Method 2: Try info property (some versions)
// // // //             if (!info && this.client.info) {
// // // //                 info = this.client.info;
// // // //             }
            
// // // //             // Method 3: Try getState() to at least get connection state
// // // //             if (!info) {
// // // //                 const state = await this.client.getState();
// // // //                 info = {
// // // //                     pushname: 'WhatsApp User',
// // // //                     platform: 'WhatsApp',
// // // //                     waVersion: 'Unknown',
// // // //                     wid: { user: 'Connected' },
// // // //                     state: state
// // // //                 };
// // // //             }

// // // //             this.botInfo = {
// // // //                 pushname: info?.pushname || 'Connected',
// // // //                 platform: info?.platform || 'WhatsApp',
// // // //                 version: info?.waVersion || info?.version || 'Unknown',
// // // //                 phoneNumber: info?.wid?.user || 'Connected',
// // // //                 connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
// // // //             };

// // // //             console.log('🤖 Bot Information:');
// // // //             console.log('───────────────────');
// // // //             console.log(`📱 WhatsApp: ${this.botInfo.pushname}`);
// // // //             console.log(`📞 Phone: ${this.botInfo.phoneNumber}`);
// // // //             console.log(`🌐 Platform: ${this.botInfo.platform}`);
// // // //             console.log(`📊 Version: ${this.botInfo.version}`);
// // // //             console.log('───────────────────\n');

// // // //         } catch (error) {
// // // //             console.log('📊 Bot info: Using default values (', error.message, ')');
// // // //             this.botInfo = {
// // // //                 pushname: 'Connected',
// // // //                 platform: 'WhatsApp',
// // // //                 version: 'Unknown',
// // // //                 phoneNumber: 'Connected',
// // // //                 connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
// // // //             };
            
// // // //             // Still show basic info
// // // //             console.log('🤖 Bot Information:');
// // // //             console.log('───────────────────');
// // // //             console.log(`📱 Status: Connected`);
// // // //             console.log(`📞 Phone: Ready`);
// // // //             console.log(`🌐 Platform: WhatsApp`);
// // // //             console.log('───────────────────\n');
// // // //         }
// // // //     }

// // // //     async handleInitializationError(error) {
// // // //         console.error('❌ Initialization error:', error.message);

// // // //         // Emit status change event
// // // //         this.emitStatusChange({
// // // //             connected: false,
// // // //             authenticated: false,
// // // //             status: 'error',
// // // //             message: `Initialization error: ${error.message}`
// // // //         });

// // // //         if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {
// // // //             console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'retrying',
// // // //                 message: 'Session issue detected. Retrying...'
// // // //             });

// // // //             await this.clearSession();

// // // //             setTimeout(() => {
// // // //                 this.initialize().catch(console.error);
// // // //             }, 10000);
// // // //         } else {
// // // //             await this.handleReconnection();
// // // //         }
// // // //     }

// // // //     async handleMessageError(message, error) {
// // // //         try {
// // // //             if (error.message.includes('Execution context was destroyed') ||
// // // //                 error.message.includes('Session closed') ||
// // // //                 error.message.includes('page has been closed')) {
// // // //                 console.log('⚠️ Message failed due to context/page closure - skipping error response');
// // // //                 return;
// // // //             }

// // // //             await message.reply(
// // // //                 '⚠️ We encountered a temporary issue. Please try your request again.'
// // // //             );

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: this.isConnected,
// // // //                 authenticated: this.isAuthenticated,
// // // //                 status: 'message_error',
// // // //                 message: `Failed to process message from ${message.from}: ${error.message}`
// // // //             });
// // // //         } catch (replyError) {
// // // //             console.error('❌ Failed to send error response:', replyError);
// // // //         }
// // // //     }

// // // //     getCurrentQR() {
// // // //         return this.currentQR;
// // // //     }

// // // //     getStatus() {
// // // //         return {
// // // //             connected: this.isConnected,
// // // //             authenticated: this.isAuthenticated,
// // // //             hasQR: !!this.currentQR,
// // // //             connectionTime: this.connectionTime,
// // // //             botInfo: this.botInfo,
// // // //             stats: {
// // // //                 totalOrders: this.stats.totalOrders,
// // // //                 totalChats: this.stats.totalChats,
// // // //                 totalCustomers: this.stats.totalCustomers.size,
// // // //                 totalMessages: this.stats.totalMessages,
// // // //                 pendingOrders: this.stats.pendingOrders,
// // // //                 completedOrders: this.stats.completedOrders
// // // //             },
// // // //             reconnectAttempts: this.reconnectAttempts,
// // // //             maxReconnectAttempts: this.maxReconnectAttempts,
// // // //             uptime: this.getUptime(),
// // // //             formattedUptime: this.getFormattedUptime()
// // // //         };
// // // //     }

// // // //     async sendMessage(phoneNumber, message) {
// // // //         try {
// // // //             if (!this.client || !this.isConnected) {
// // // //                 throw new Error('WhatsApp client not connected');
// // // //             }

// // // //             const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;

// // // //             console.log(`📤 Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
// // // //             await this.client.sendMessage(formattedNumber, message);

// // // //             console.log('✅ Message sent successfully');
// // // //             return { success: true, message: 'Message sent successfully' };

// // // //         } catch (error) {
// // // //             console.error('❌ Send message error:', error);
// // // //             return { success: false, error: error.message };
// // // //         }
// // // //     }

// // // //     async shutdown() {
// // // //         console.log('\n🛑 Initiating graceful shutdown...');

// // // //         // Emit status change event
// // // //         this.emitStatusChange({
// // // //             connected: false,
// // // //             authenticated: false,
// // // //             status: 'shutdown',
// // // //             message: 'Bot is shutting down...'
// // // //         });

// // // //         try {
// // // //             this.stopStatsBroadcasting();
// // // //             await this.safeDestroyClient();

// // // //             this.isConnected = false;
// // // //             this.isAuthenticated = false;
// // // //             this.currentQR = null;
// // // //             this.reconnectAttempts = 0;
// // // //             this.connectionTime = null;

// // // //             console.log('✅ Bot shutdown completed gracefully');

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'shutdown_complete',
// // // //                 message: 'Bot shutdown completed'
// // // //             });
// // // //         } catch (error) {
// // // //             console.error('❌ Error during shutdown:', error);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'shutdown_error',
// // // //                 message: `Error during shutdown: ${error.message}`
// // // //             });
// // // //         }
// // // //     }

// // // //     async logout() {
// // // //         console.log('\n🚪 Manual logout requested...');

// // // //         // Emit status change event
// // // //         this.emitStatusChange({
// // // //             connected: false,
// // // //             authenticated: false,
// // // //             status: 'logging_out',
// // // //             message: 'Manual logout requested...'
// // // //         });

// // // //         try {
// // // //             this.isShuttingDown = true;
// // // //             await this.safeDestroyClient();
// // // //             await this.clearSession();

// // // //             this.currentQR = null;
// // // //             this.isConnected = false;
// // // //             this.isAuthenticated = false;
// // // //             this.connectionTime = null;

// // // //             console.log('🔓 Logout completed. QR code will be required on next start.');

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'logged_out',
// // // //                 message: 'Logout completed. QR code required.'
// // // //             });

// // // //             setTimeout(() => {
// // // //                 this.isShuttingDown = false;
// // // //                 this.initialize().catch(console.error);
// // // //             }, 2000);

// // // //         } catch (error) {
// // // //             console.error('❌ Logout error:', error);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'error',
// // // //                 message: `Logout error: ${error.message}`
// // // //             });

// // // //             this.isShuttingDown = false;
// // // //         }
// // // //     }

// // // //     async restart() {
// // // //         console.log('\n🔄 Manual restart requested...');

// // // //         // Emit status change event
// // // //         this.emitStatusChange({
// // // //             connected: false,
// // // //             authenticated: false,
// // // //             status: 'restarting',
// // // //             message: 'Manual restart requested...'
// // // //         });

// // // //         try {
// // // //             await this.shutdown();
// // // //             setTimeout(async () => {
// // // //                 await this.initialize();
// // // //             }, 3000);
// // // //         } catch (error) {
// // // //             console.error('❌ Restart error:', error);

// // // //             // Emit status change event
// // // //             this.emitStatusChange({
// // // //                 connected: false,
// // // //                 authenticated: false,
// // // //                 status: 'error',
// // // //                 message: `Restart error: ${error.message}`
// // // //             });
// // // //         }
// // // //     }

// // // //     getUptime() {
// // // //         if (!this.connectionTime) return 0;
// // // //         return Math.floor((new Date() - this.connectionTime) / 1000);
// // // //     }

// // // //     getFormattedUptime() {
// // // //         const seconds = this.getUptime();
// // // //         const hours = Math.floor(seconds / 3600);
// // // //         const minutes = Math.floor((seconds % 3600) / 60);
// // // //         const secs = seconds % 60;
// // // //         return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// // // //     }

// // // //     trackNewOrder(orderData = {}) {
// // // //         this.stats.totalOrders++;

// // // //         // Emit order update event
// // // //         this.emitOrderUpdate({
// // // //             type: 'new_order',
// // // //             orderId: orderData.orderId || `order_${Date.now()}`,
// // // //             customer: orderData.customer || 'Unknown',
// // // //             totalOrders: this.stats.totalOrders,
// // // //             pendingOrders: this.stats.pendingOrders,
// // // //             completedOrders: this.stats.completedOrders
// // // //         });

// // // //         this.broadcastCurrentStats();
// // // //     }

// // // //     trackPendingOrder(orderData = {}) {
// // // //         this.stats.pendingOrders++;

// // // //         // Emit order update event
// // // //         this.emitOrderUpdate({
// // // //             type: 'pending_order',
// // // //             orderId: orderData.orderId || `order_${Date.now()}`,
// // // //             customer: orderData.customer || 'Unknown',
// // // //             totalOrders: this.stats.totalOrders,
// // // //             pendingOrders: this.stats.pendingOrders,
// // // //             completedOrders: this.stats.completedOrders
// // // //         });

// // // //         this.broadcastCurrentStats();
// // // //     }

// // // //     trackCompletedOrder(orderData = {}) {
// // // //         this.stats.completedOrders++;
// // // //         if (this.stats.pendingOrders > 0) {
// // // //             this.stats.pendingOrders--;
// // // //         }

// // // //         // Emit order update event
// // // //         this.emitOrderUpdate({
// // // //             type: 'completed_order',
// // // //             orderId: orderData.orderId || `order_${Date.now()}`,
// // // //             customer: orderData.customer || 'Unknown',
// // // //             totalOrders: this.stats.totalOrders,
// // // //             pendingOrders: this.stats.pendingOrders,
// // // //             completedOrders: this.stats.completedOrders
// // // //         });

// // // //         this.broadcastCurrentStats();
// // // //     }
// // // // }

// // // // // Create singleton instance
// // // // let botInstance = null;

// // // // function createWhatsAppBot() {
// // // //     if (!botInstance) {
// // // //         botInstance = new WhatsAppBot();
// // // //     }
// // // //     return botInstance;
// // // // }

// // // // function getWhatsAppBot() {
// // // //     if (!botInstance) {
// // // //         throw new Error('WhatsAppBot not initialized. Call createWhatsAppBot() first.');
// // // //     }
// // // //     return botInstance;
// // // // }

// // // // // Default export for backward compatibility
// // // // const bot = createWhatsAppBot();

// // // // // Start bot automatically after a delay
// // // // setTimeout(() => {
// // // //     const startBot = async (attempt = 1) => {
// // // //         try {
// // // //             console.log(`🚀 Starting WhatsApp bot (attempt ${attempt}/3)...`);
// // // //             await bot.initialize();
// // // //             console.log('✅ WhatsApp bot started successfully');

// // // //         } catch (error) {
// // // //             console.error(`❌ Bot startup failed (attempt ${attempt}):`, error);

// // // //             if (attempt < 3) {
// // // //                 console.log(`🔄 Retrying startup in 10 seconds... (${attempt + 1}/3)`);
// // // //                 setTimeout(() => startBot(attempt + 1), 10000);
// // // //             } else {
// // // //                 console.error('💥 Maximum startup attempts reached. Bot will continue in disconnected state.');
// // // //             }
// // // //         }
// // // //     };

// // // //     startBot();

// // // // }, 3000); // Wait 3 seconds for server to initialize

// // // // export { createWhatsAppBot, getWhatsAppBot };
// // // // export default bot;
















// // // // bot.js - Complete updated version with fixed QR handling
// // // import pkg from 'whatsapp-web.js';
// // // import qrcode from 'qrcode-terminal';
// // // import { EventEmitter } from 'events';
// // // import dotenv from 'dotenv';
// // // import handleMessage from "./messageHandler.js";
// // // import fs from 'fs';
// // // import path from 'path';
// // // import { fileURLToPath } from 'url';

// // // dotenv.config();

// // // const { Client, LocalAuth } = pkg;

// // // // ES module equivalent of __dirname
// // // const __filename = fileURLToPath(import.meta.url);
// // // const __dirname = path.dirname(__filename);

// // // class WhatsAppBot extends EventEmitter {
// // //     constructor() {
// // //         super(); // Initialize EventEmitter

// // //         this.client = null;
// // //         this.isConnected = false;
// // //         this.isAuthenticated = false;
// // //         this.sessionPath = path.join(__dirname, 'sessions');
// // //         this.currentQR = null;
// // //         this.qrGeneratedAt = null;
// // //         this.qrTimeout = null;
// // //         this.qrExpiryTime = 60000; // 60 seconds
// // //         this.isWaitingForScan = false;
// // //         this.reconnectAttempts = 0;
// // //         this.maxReconnectAttempts = 5;
// // //         this.isInitializing = false;
// // //         this.connectionTime = null;
// // //         this.botInfo = null;
// // //         this.isShuttingDown = false;
// // //         this.qrWebSocketClients = new Set(); // Track WebSocket clients

// // //         // Initialize statistics
// // //         this.stats = {
// // //             totalOrders: 0,
// // //             totalChats: 0,
// // //             totalCustomers: new Set(),
// // //             totalMessages: 0,
// // //             pendingOrders: 0,
// // //             completedOrders: 0
// // //         };

// // //         this.statsInterval = null;
// // //     }

// // //     async initialize() {
// // //         if (this.isInitializing) {
// // //             console.log('🔄 Bot initialization already in progress...');
// // //             return;
// // //         }

// // //         this.isInitializing = true;
// // //         this.isShuttingDown = false;

// // //         try {
// // //             console.log('🚀 Initializing WhatsApp E-commerce Bot...');

// // //             // Clear any existing client
// // //             if (this.client) {
// // //                 await this.safeDestroyClient();
// // //             }

// // //             // Initialize WhatsApp client
// // //             await this.initializeClient();

// // //             this.reconnectAttempts = 0;
// // //             console.log('✅ Bot initialization completed successfully');

// // //         } catch (error) {
// // //             console.error('❌ Bot initialization failed:', error);
// // //             await this.handleInitializationError(error);
// // //         } finally {
// // //             this.isInitializing = false;
// // //         }
// // //     }

// // //     initializeClient() {
// // //         return new Promise((resolve, reject) => {
// // //             try {
// // //                 // Ensure session directory exists
// // //                 if (!fs.existsSync(this.sessionPath)) {
// // //                     fs.mkdirSync(this.sessionPath, { recursive: true });
// // //                 }

// // //                 console.log('📁 Session path:', this.sessionPath);

// // //                this.client = new Client({
// // //     authStrategy: new LocalAuth({
// // //         clientId: 'whatsapp-bot-main', // FIXED clientId - very important!
// // //         dataPath: path.join(process.cwd(), 'sessions') // Explicit path
// // //     }),
// // //     puppeteer: {
// // //         headless: true,
// // //         args: [
// // //             '--no-sandbox',
// // //             '--disable-setuid-sandbox',
// // //             '--disable-dev-shm-usage',
// // //             '--disable-accelerated-2d-canvas',
// // //             '--no-first-run',
// // //             '--no-zygote',
// // //             '--disable-gpu',
// // //         ],
// // //     },
// // //     qrMaxRetries: 3,
// // //     authTimeoutMs: 120000,
// // // });

// // //                 this.setupEventHandlers(resolve, reject);

// // //                 console.log('🔧 Starting client initialization...');
// // //                 this.client.initialize().catch(reject);

// // //             } catch (error) {
// // //                 reject(new Error(`Client initialization failed: ${error.message}`));
// // //             }
// // //         });
// // //     }

// // //     setupEventHandlers(resolve, reject) {
// // //         let qrGenerated = false;
// // //         let initializationTimeout;

// // //         // Set initialization timeout (2 minutes)
// // //         initializationTimeout = setTimeout(() => {
// // //             if (!this.isConnected) {
// // //                 const error = new Error('Client initialization timeout - taking too long to connect');
// // //                 console.error('❌', error.message);

// // //                 this.emitStatusChange({
// // //                     connected: false,
// // //                     status: 'error',
// // //                     message: 'Initialization timeout - taking too long to connect'
// // //                 });

// // //                 reject(error);
// // //             }
// // //         }, 120000);

// // //         // ✅ FIXED QR HANDLER - Prevents multiple QR generations
// // //         this.client.on('qr', async (qr) => {
// // //             clearTimeout(initializationTimeout);
            
// // //             // If already waiting for a scan and QR is the same, ignore
// // //             if (this.isWaitingForScan && this.currentQR === qr) {
// // //                 console.log('⏳ Already waiting for QR scan...');
// // //                 return;
// // //             }
            
// // //             // If we have a valid QR and it's not expired, don't generate new one
// // //             if (this.currentQR && this.qrGeneratedAt && 
// // //                 (Date.now() - this.qrGeneratedAt < this.qrExpiryTime)) {
// // //                 console.log('⏳ Current QR still valid, not generating new one');
// // //                 return;
// // //             }
            
// // //             // Clear previous timeout
// // //             if (this.qrTimeout) {
// // //                 clearTimeout(this.qrTimeout);
// // //                 this.qrTimeout = null;
// // //             }
            
// // //             // Store new QR
// // //             this.currentQR = qr;
// // //             this.qrGeneratedAt = Date.now();
// // //             this.isWaitingForScan = true;
            
// // //             console.log('\n' + '='.repeat(50));
// // //             console.log('📱 NEW QR CODE GENERATED');
// // //             console.log('='.repeat(50));
// // //             console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
// // //             console.log(`⌛ Expires in: ${this.qrExpiryTime/1000} seconds`);
// // //             console.log('='.repeat(50) + '\n');
            
// // //             // Show QR in terminal (only once)
// // //             if (!qrGenerated) {
// // //                 qrcode.generate(qr, { small: true });
// // //                 qrGenerated = true;
// // //             }

// // //             // Emit QR update for web dashboard
// // //             this.emitQRCode({
// // //                 qr: qr,
// // //                 expiresIn: this.qrExpiryTime/1000,
// // //                 generatedAt: this.qrGeneratedAt,
// // //                 isValid: true
// // //             });

// // //             // Emit status change
// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 hasQR: true,
// // //                 status: 'qr_required',
// // //                 message: 'Scan QR code to connect WhatsApp'
// // //             });

// // //             // Set timeout to expire QR
// // //             this.qrTimeout = setTimeout(() => {
// // //                 if (this.isWaitingForScan && this.currentQR === qr) {
// // //                     console.log('⏰ QR code expired. Ready for new QR...');
// // //                     this.isWaitingForScan = false;
// // //                     this.currentQR = null;
// // //                     this.qrGeneratedAt = null;
// // //                     qrGenerated = false;
                    
// // //                     // Emit expiry to dashboard
// // //                     this.emitQRCode(null);
                    
// // //                     this.emitStatusChange({
// // //                         connected: false,
// // //                         authenticated: false,
// // //                         hasQR: false,
// // //                         status: 'qr_expired',
// // //                         message: 'QR code expired. Generating new one...'
// // //                     });
// // //                 }
// // //             }, this.qrExpiryTime);
// // //         });

// // //         this.client.on('ready', async () => {
// // //             clearTimeout(initializationTimeout);

// // //             this.isConnected = true;
// // //             this.isAuthenticated = true;
// // //             this.currentQR = null;
// // //             this.isWaitingForScan = false;
// // //             this.qrGeneratedAt = null;
// // //             if (this.qrTimeout) {
// // //                 clearTimeout(this.qrTimeout);
// // //                 this.qrTimeout = null;
// // //             }
// // //             this.reconnectAttempts = 0;
// // //             this.connectionTime = new Date();

// // //             console.log('\n✅ WhatsApp Bot Successfully Initialized');
// // //             console.log('========================================');
// // //             console.log('🤖 E-commerce Bot Status: ONLINE');
// // //             console.log('📱 Phone Number: Connected');
// // //             console.log('💼 Session: PERSISTENT');
// // //             console.log('🛍️  Ready to process customer orders');
// // //             console.log('========================================\n');

// // //             this.emitStatusChange({
// // //                 connected: true,
// // //                 authenticated: true,
// // //                 hasQR: false,
// // //                 status: 'connected',
// // //                 message: 'WhatsApp is connected and ready'
// // //             });

// // //             // Start stats (safe)
// // //             this.startStatsBroadcasting();

// // //             // Load bot info
// // //             setTimeout(() => {
// // //                 this.displayBotInfo().catch(err =>
// // //                     console.log('⚠️ Bot info load skipped:', err.message)
// // //                 );
// // //             }, 5000);

// // //             resolve();
// // //         });

// // //         this.client.on('authenticated', () => {
// // //             this.isAuthenticated = true;
// // //             this.isWaitingForScan = false;
// // //             this.currentQR = null;
// // //             this.qrGeneratedAt = null;
            
// // //             // Clear QR timeout
// // //             if (this.qrTimeout) {
// // //                 clearTimeout(this.qrTimeout);
// // //                 this.qrTimeout = null;
// // //             }
            
// // //             console.log('🔐 Authentication successful - Session saved');

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: true,
// // //                 hasQR: false,
// // //                 status: 'authenticated',
// // //                 message: 'WhatsApp authentication successful'
// // //             });
// // //         });

// // //         this.client.on('auth_failure', (error) => {
// // //             clearTimeout(initializationTimeout);

// // //             this.isAuthenticated = false;
// // //             this.isWaitingForScan = false;
// // //             this.currentQR = null;
// // //             console.error('❌ Authentication failed:', error);

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'auth_failed',
// // //                 message: 'Authentication failed. New QR code will be generated.'
// // //             });

// // //             reject(new Error(`Authentication failed: ${error.message}`));
// // //         });

// // //         this.client.on('disconnected', async (reason) => {
// // //             console.log(`🔌 Disconnected: ${reason}`);

// // //             this.isConnected = false;
// // //             this.isAuthenticated = false;
// // //             this.currentQR = null;
// // //             this.isWaitingForScan = false;

// // //             // Stop stats broadcasting when disconnected
// // //             this.stopStatsBroadcasting();

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'disconnected',
// // //                 message: `WhatsApp disconnected: ${reason}`
// // //             });

// // //             // Don't try to reconnect if we're shutting down or logging out
// // //             if (this.isShuttingDown) {
// // //                 return;
// // //             }

// // //             // Handle different disconnect reasons
// // //             if (reason === 'LOGOUT' || reason === 'UNAUTHORIZED') {
// // //                 console.log('🔄 Logout/Unauthorized detected. Generating new QR code...');

// // //                 this.emitStatusChange({
// // //                     connected: false,
// // //                     authenticated: false,
// // //                     status: 'qr_required',
// // //                     message: 'Reconnecting WhatsApp...'
// // //                 });

// // //                 // Clear session and restart
// // //                 await this.clearSession();
// // //                 setTimeout(() => {
// // //                     this.initialize().catch(console.error);
// // //                 }, 3000);
// // //             } else {
// // //                 await this.handleReconnection();
// // //             }
// // //         });

// // //         this.client.on('message', async (message) => {
// // //             if (message.from === 'status@broadcast' || message.isGroupMsg) return;

// // //             try {
// // //                 // Update statistics for every message
// // //                 this.updateMessageStats(message.from);

// // //                 // Log incoming message
// // //                 console.log(`📨 Message from ${message.from}: ${message.body?.substring(0, 50)}...`);

// // //                 // Emit message event
// // //                 this.emitMessage({
// // //                     from: message.from,
// // //                     body: message.body,
// // //                     timestamp: new Date().toISOString(),
// // //                     hasMedia: message.hasMedia,
// // //                     type: message.type
// // //                 });

// // //                 await handleMessage(message, this.client);
// // //             } catch (error) {
// // //                 console.error('❌ Message processing error:', error);
// // //                 await this.handleMessageError(message, error);
// // //             }
// // //         });

// // //         // Monitor connection state
// // //         this.client.on('change_state', (state) => {
// // //             console.log(`🔄 Connection state: ${state}`);
// // //             this.emitStatusChange({
// // //                 connected: this.isConnected,
// // //                 authenticated: this.isAuthenticated,
// // //                 status: 'state_change',
// // //                 message: `Connection state: ${state}`
// // //             });
// // //         });

// // //         // Loading screen events
// // //         this.client.on('loading_screen', (percent, message) => {
// // //             console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);
// // //             this.emitStatusChange({
// // //                 connected: this.isConnected,
// // //                 authenticated: this.isAuthenticated,
// // //                 status: 'loading',
// // //                 message: `Loading: ${percent}% - ${message}`
// // //             });
// // //         });

// // //         // Handle page errors
// // //         this.client.on('page_error', (error) => {
// // //             if (this.isShuttingDown && (
// // //                 error.message.includes('Session closed') ||
// // //                 error.message.includes('page has been closed') ||
// // //                 error.message.includes('Protocol error')
// // //             )) {
// // //                 console.log('⚠️ Page error during shutdown (expected):', error.message);
// // //                 return;
// // //             }
// // //             console.error('❌ Page error:', error);

// // //             this.emitStatusChange({
// // //                 connected: this.isConnected,
// // //                 authenticated: this.isAuthenticated,
// // //                 status: 'page_error',
// // //                 message: `Page error: ${error.message}`
// // //             });
// // //         });
// // //     }

// // //     // ========== EVENT EMITTER METHODS ==========

// // //     emitQRCode(qrData) {
// // //         this.emit('qr-update', qrData);
// // //     }

// // //     emitStatusChange(status) {
// // //         this.emit('status-change', {
// // //             ...status,
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     }

// // //     emitMessage(messageData) {
// // //         this.emit('message', messageData);
// // //     }

// // //     emitOrderUpdate(orderData) {
// // //         this.emit('order-update', {
// // //             ...orderData,
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     }

// // //     emitStatsUpdate(stats) {
// // //         this.emit('stats-update', {
// // //             ...stats,
// // //             timestamp: new Date().toISOString()
// // //         });
// // //     }

// // //     async handleReconnection() {
// // //         if (this.reconnectAttempts >= this.maxReconnectAttempts) {
// // //             console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'error',
// // //                 message: 'Maximum reconnection attempts reached. Manual intervention required.'
// // //             });

// // //             return;
// // //         }

// // //         this.reconnectAttempts++;
// // //         const delay = 5000 * this.reconnectAttempts;

// // //         console.log(`🔄 Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

// // //         this.emitStatusChange({
// // //             connected: false,
// // //             authenticated: false,
// // //             status: 'reconnecting',
// // //             message: `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
// // //         });

// // //         setTimeout(async () => {
// // //             try {
// // //                 await this.initialize();
// // //             } catch (error) {
// // //                 console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);

// // //                 this.emitStatusChange({
// // //                     connected: false,
// // //                     authenticated: false,
// // //                     status: 'reconnect_failed',
// // //                     message: `Reconnection attempt ${this.reconnectAttempts} failed`
// // //                 });
// // //             }
// // //         }, delay);
// // //     }

// // //     async safeDestroyClient() {
// // //         try {
// // //             if (this.client) {
// // //                 console.log('🛑 Safely destroying existing client...');
// // //                 this.isShuttingDown = true;
// // //                 await this.client.destroy();
// // //                 this.client = null;
// // //                 console.log('✅ Client destroyed safely');

// // //                 this.emitStatusChange({
// // //                     connected: false,
// // //                     authenticated: false,
// // //                     status: 'client_destroyed',
// // //                     message: 'WhatsApp client destroyed'
// // //                 });
// // //             }
// // //         } catch (error) {
// // //             if (!error.message.includes('Session closed') &&
// // //                 !error.message.includes('page has been closed') &&
// // //                 !error.message.includes('Protocol error')) {
// // //                 console.error('❌ Error destroying client:', error);

// // //                 this.emitStatusChange({
// // //                     connected: false,
// // //                     authenticated: false,
// // //                     status: 'error',
// // //                     message: `Error destroying client: ${error.message}`
// // //                 });
// // //             } else {
// // //                 console.log('⚠️ Client destruction error (expected):', error.message);
// // //             }
// // //             this.client = null;
// // //         } finally {
// // //             this.isShuttingDown = false;
// // //         }
// // //     }

// // //     async clearSession() {
// // //         try {
// // //             console.log('🧹 Clearing session data...');

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'clearing_session',
// // //                 message: 'Clearing session data...'
// // //             });

// // //             if (fs.existsSync(this.sessionPath)) {
// // //                 fs.rmSync(this.sessionPath, { recursive: true, force: true });
// // //                 console.log('✅ Session cleared successfully');

// // //                 this.emitStatusChange({
// // //                     connected: false,
// // //                     authenticated: false,
// // //                     status: 'session_cleared',
// // //                     message: 'Session cleared successfully'
// // //                 });
// // //             }
// // //         } catch (error) {
// // //             console.error('❌ Error clearing session:', error);

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'session_error',
// // //                 message: `Error clearing session: ${error.message}`
// // //             });
// // //         }
// // //     }

// // //     updateMessageStats(from) {
// // //         this.stats.totalMessages++;
// // //         this.stats.totalCustomers.add(from);
// // //         this.stats.totalChats = this.stats.totalCustomers.size;

// // //         this.broadcastCurrentStats();
// // //     }

// // //     startStatsBroadcasting() {
// // //         // Initial broadcast
// // //         this.broadcastCurrentStats();

// // //         // Set up interval for regular updates
// // //         if (this.statsInterval) {
// // //             clearInterval(this.statsInterval);
// // //         }

// // //         this.statsInterval = setInterval(() => {
// // //             this.broadcastCurrentStats();
// // //         }, 3000);

// // //         console.log('📊 Started statistics broadcasting');
// // //     }

// // //     stopStatsBroadcasting() {
// // //         if (this.statsInterval) {
// // //             clearInterval(this.statsInterval);
// // //             this.statsInterval = null;
// // //             console.log('📊 Stopped statistics broadcasting');
// // //         }
// // //     }

// // //     broadcastCurrentStats() {
// // //         const statsData = {
// // //             totalOrders: this.stats.totalOrders,
// // //             totalChats: this.stats.totalChats,
// // //             totalCustomers: this.stats.totalCustomers.size,
// // //             totalMessages: this.stats.totalMessages,
// // //             pendingOrders: this.stats.pendingOrders,
// // //             completedOrders: this.stats.completedOrders,
// // //             lastUpdated: new Date().toISOString()
// // //         };

// // //         this.emitStatsUpdate(statsData);
// // //     }

// // //     async displayBotInfo() {
// // //         try {
// // //             if (!this.client) {
// // //                 console.log('📊 Bot info: Client not initialized');
// // //                 return;
// // //             }

// // //             let info = null;
            
// // //             // Try multiple methods to get bot info
// // //             if (typeof this.client.getInfo === 'function') {
// // //                 try {
// // //                     info = await this.client.getInfo();
// // //                 } catch (e) {
// // //                     console.log('📊 getInfo() failed, trying alternative methods...');
// // //                 }
// // //             }
            
// // //             if (!info && this.client.info) {
// // //                 info = this.client.info;
// // //             }
            
// // //             if (!info) {
// // //                 const state = await this.client.getState();
// // //                 info = {
// // //                     pushname: 'WhatsApp User',
// // //                     platform: 'WhatsApp',
// // //                     waVersion: 'Unknown',
// // //                     wid: { user: 'Connected' },
// // //                     state: state
// // //                 };
// // //             }

// // //             this.botInfo = {
// // //                 pushname: info?.pushname || 'Connected',
// // //                 platform: info?.platform || 'WhatsApp',
// // //                 version: info?.waVersion || info?.version || 'Unknown',
// // //                 phoneNumber: info?.wid?.user || 'Connected',
// // //                 connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
// // //             };

// // //             console.log('🤖 Bot Information:');
// // //             console.log('───────────────────');
// // //             console.log(`📱 WhatsApp: ${this.botInfo.pushname}`);
// // //             console.log(`📞 Phone: ${this.botInfo.phoneNumber}`);
// // //             console.log(`🌐 Platform: ${this.botInfo.platform}`);
// // //             console.log(`📊 Version: ${this.botInfo.version}`);
// // //             console.log('───────────────────\n');

// // //         } catch (error) {
// // //             console.log('📊 Bot info: Using default values (', error.message, ')');
// // //             this.botInfo = {
// // //                 pushname: 'Connected',
// // //                 platform: 'WhatsApp',
// // //                 version: 'Unknown',
// // //                 phoneNumber: 'Connected',
// // //                 connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
// // //             };
            
// // //             console.log('🤖 Bot Information:');
// // //             console.log('───────────────────');
// // //             console.log(`📱 Status: Connected`);
// // //             console.log(`📞 Phone: Ready`);
// // //             console.log(`🌐 Platform: WhatsApp`);
// // //             console.log('───────────────────\n');
// // //         }
// // //     }

// // //     async handleInitializationError(error) {
// // //         console.error('❌ Initialization error:', error.message);

// // //         this.emitStatusChange({
// // //             connected: false,
// // //             authenticated: false,
// // //             status: 'error',
// // //             message: `Initialization error: ${error.message}`
// // //         });

// // //         if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {
// // //             console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'retrying',
// // //                 message: 'Session issue detected. Retrying...'
// // //             });

// // //             await this.clearSession();

// // //             setTimeout(() => {
// // //                 this.initialize().catch(console.error);
// // //             }, 10000);
// // //         } else {
// // //             await this.handleReconnection();
// // //         }
// // //     }

// // //     async handleMessageError(message, error) {
// // //         try {
// // //             if (error.message.includes('Execution context was destroyed') ||
// // //                 error.message.includes('Session closed') ||
// // //                 error.message.includes('page has been closed')) {
// // //                 console.log('⚠️ Message failed due to context/page closure - skipping error response');
// // //                 return;
// // //             }

// // //             await message.reply(
// // //                 '⚠️ We encountered a temporary issue. Please try your request again.'
// // //             );

// // //             this.emitStatusChange({
// // //                 connected: this.isConnected,
// // //                 authenticated: this.isAuthenticated,
// // //                 status: 'message_error',
// // //                 message: `Failed to process message from ${message.from}: ${error.message}`
// // //             });
// // //         } catch (replyError) {
// // //             console.error('❌ Failed to send error response:', replyError);
// // //         }
// // //     }

// // //     // ✅ FIXED: Get current QR with expiry info
// // //     getCurrentQR() {
// // //         if (!this.currentQR || !this.isWaitingForScan) {
// // //             return null;
// // //         }
        
// // //         const timeLeft = this.qrExpiryTime - (Date.now() - this.qrGeneratedAt);
        
// // //         if (timeLeft <= 0) {
// // //             return null;
// // //         }
        
// // //         return {
// // //             qr: this.currentQR,
// // //             expiresIn: Math.max(0, Math.floor(timeLeft / 1000)),
// // //             generatedAt: this.qrGeneratedAt,
// // //             isValid: timeLeft > 0
// // //         };
// // //     }

// // //     // ✅ NEW: Register WebSocket client for QR
// // //     registerQRClient(clientId) {
// // //         this.qrWebSocketClients.add(clientId);
// // //         console.log(`🔗 New QR WebSocket client: ${clientId} (Total: ${this.qrWebSocketClients.size})`);
        
// // //         // Send current QR immediately if available
// // //         const qrData = this.getCurrentQR();
// // //         if (qrData) {
// // //             return qrData;
// // //         }
// // //         return null;
// // //     }

// // //     // ✅ NEW: Unregister WebSocket client
// // //     unregisterQRClient(clientId, code, reason, duration) {
// // //         this.qrWebSocketClients.delete(clientId);
// // //         console.log(`🔌 QR WebSocket client disconnected: ${clientId} { code: ${code}, reason: '${reason || 'No reason'}', duration: '${duration}ms' } (Remaining: ${this.qrWebSocketClients.size})`);
// // //     }

// // //     getStatus() {
// // //         return {
// // //             connected: this.isConnected,
// // //             authenticated: this.isAuthenticated,
// // //             hasQR: !!this.getCurrentQR(),
// // //             qrData: this.getCurrentQR(),
// // //             connectionTime: this.connectionTime,
// // //             botInfo: this.botInfo,
// // //             stats: {
// // //                 totalOrders: this.stats.totalOrders,
// // //                 totalChats: this.stats.totalChats,
// // //                 totalCustomers: this.stats.totalCustomers.size,
// // //                 totalMessages: this.stats.totalMessages,
// // //                 pendingOrders: this.stats.pendingOrders,
// // //                 completedOrders: this.stats.completedOrders
// // //             },
// // //             reconnectAttempts: this.reconnectAttempts,
// // //             maxReconnectAttempts: this.maxReconnectAttempts,
// // //             uptime: this.getUptime(),
// // //             formattedUptime: this.getFormattedUptime(),
// // //             activeClients: this.qrWebSocketClients.size
// // //         };
// // //     }

// // //     async sendMessage(phoneNumber, message) {
// // //         try {
// // //             if (!this.client || !this.isConnected) {
// // //                 throw new Error('WhatsApp client not connected');
// // //             }

// // //             const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;

// // //             console.log(`📤 Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
// // //             await this.client.sendMessage(formattedNumber, message);

// // //             console.log('✅ Message sent successfully');
// // //             return { success: true, message: 'Message sent successfully' };

// // //         } catch (error) {
// // //             console.error('❌ Send message error:', error);
// // //             return { success: false, error: error.message };
// // //         }
// // //     }

// // //     async shutdown() {
// // //         console.log('\n🛑 Initiating graceful shutdown...');

// // //         this.emitStatusChange({
// // //             connected: false,
// // //             authenticated: false,
// // //             status: 'shutdown',
// // //             message: 'Bot is shutting down...'
// // //         });

// // //         try {
// // //             this.stopStatsBroadcasting();
// // //             await this.safeDestroyClient();

// // //             this.isConnected = false;
// // //             this.isAuthenticated = false;
// // //             this.currentQR = null;
// // //             this.isWaitingForScan = false;
// // //             this.reconnectAttempts = 0;
// // //             this.connectionTime = null;
// // //             this.qrWebSocketClients.clear();

// // //             console.log('✅ Bot shutdown completed gracefully');

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'shutdown_complete',
// // //                 message: 'Bot shutdown completed'
// // //             });
// // //         } catch (error) {
// // //             console.error('❌ Error during shutdown:', error);

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'shutdown_error',
// // //                 message: `Error during shutdown: ${error.message}`
// // //             });
// // //         }
// // //     }

// // //     async logout() {
// // //         console.log('\n🚪 Manual logout requested...');

// // //         this.emitStatusChange({
// // //             connected: false,
// // //             authenticated: false,
// // //             status: 'logging_out',
// // //             message: 'Manual logout requested...'
// // //         });

// // //         try {
// // //             this.isShuttingDown = true;
// // //             await this.safeDestroyClient();
// // //             await this.clearSession();

// // //             this.currentQR = null;
// // //             this.isWaitingForScan = false;
// // //             this.isConnected = false;
// // //             this.isAuthenticated = false;
// // //             this.connectionTime = null;
// // //             this.qrWebSocketClients.clear();

// // //             console.log('🔓 Logout completed. QR code will be required on next start.');

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'logged_out',
// // //                 message: 'Logout completed. QR code required.'
// // //             });

// // //             setTimeout(() => {
// // //                 this.isShuttingDown = false;
// // //                 this.initialize().catch(console.error);
// // //             }, 2000);

// // //         } catch (error) {
// // //             console.error('❌ Logout error:', error);

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'error',
// // //                 message: `Logout error: ${error.message}`
// // //             });

// // //             this.isShuttingDown = false;
// // //         }
// // //     }

// // //     async restart() {
// // //         console.log('\n🔄 Manual restart requested...');

// // //         this.emitStatusChange({
// // //             connected: false,
// // //             authenticated: false,
// // //             status: 'restarting',
// // //             message: 'Manual restart requested...'
// // //         });

// // //         try {
// // //             await this.shutdown();
// // //             setTimeout(async () => {
// // //                 await this.initialize();
// // //             }, 3000);
// // //         } catch (error) {
// // //             console.error('❌ Restart error:', error);

// // //             this.emitStatusChange({
// // //                 connected: false,
// // //                 authenticated: false,
// // //                 status: 'error',
// // //                 message: `Restart error: ${error.message}`
// // //             });
// // //         }
// // //     }

// // //     getUptime() {
// // //         if (!this.connectionTime) return 0;
// // //         return Math.floor((new Date() - this.connectionTime) / 1000);
// // //     }

// // //     getFormattedUptime() {
// // //         const seconds = this.getUptime();
// // //         const hours = Math.floor(seconds / 3600);
// // //         const minutes = Math.floor((seconds % 3600) / 60);
// // //         const secs = seconds % 60;
// // //         return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// // //     }

// // //     trackNewOrder(orderData = {}) {
// // //         this.stats.totalOrders++;

// // //         this.emitOrderUpdate({
// // //             type: 'new_order',
// // //             orderId: orderData.orderId || `order_${Date.now()}`,
// // //             customer: orderData.customer || 'Unknown',
// // //             totalOrders: this.stats.totalOrders,
// // //             pendingOrders: this.stats.pendingOrders,
// // //             completedOrders: this.stats.completedOrders
// // //         });

// // //         this.broadcastCurrentStats();
// // //     }

// // //     trackPendingOrder(orderData = {}) {
// // //         this.stats.pendingOrders++;

// // //         this.emitOrderUpdate({
// // //             type: 'pending_order',
// // //             orderId: orderData.orderId || `order_${Date.now()}`,
// // //             customer: orderData.customer || 'Unknown',
// // //             totalOrders: this.stats.totalOrders,
// // //             pendingOrders: this.stats.pendingOrders,
// // //             completedOrders: this.stats.completedOrders
// // //         });

// // //         this.broadcastCurrentStats();
// // //     }

// // //     trackCompletedOrder(orderData = {}) {
// // //         this.stats.completedOrders++;
// // //         if (this.stats.pendingOrders > 0) {
// // //             this.stats.pendingOrders--;
// // //         }

// // //         this.emitOrderUpdate({
// // //             type: 'completed_order',
// // //             orderId: orderData.orderId || `order_${Date.now()}`,
// // //             customer: orderData.customer || 'Unknown',
// // //             totalOrders: this.stats.totalOrders,
// // //             pendingOrders: this.stats.pendingOrders,
// // //             completedOrders: this.stats.completedOrders
// // //         });

// // //         this.broadcastCurrentStats();
// // //     }
// // // }

// // // // Create singleton instance
// // // let botInstance = null;

// // // function createWhatsAppBot() {
// // //     if (!botInstance) {
// // //         botInstance = new WhatsAppBot();
// // //     }
// // //     return botInstance;
// // // }

// // // function getWhatsAppBot() {
// // //     if (!botInstance) {
// // //         throw new Error('WhatsAppBot not initialized. Call createWhatsAppBot() first.');
// // //     }
// // //     return botInstance;
// // // }

// // // // Default export for backward compatibility
// // // const bot = createWhatsAppBot();

// // // // Start bot automatically after a delay
// // // setTimeout(() => {
// // //     const startBot = async (attempt = 1) => {
// // //         try {
// // //             console.log(`🚀 Starting WhatsApp bot (attempt ${attempt}/3)...`);
// // //             await bot.initialize();
// // //             console.log('✅ WhatsApp bot started successfully');

// // //         } catch (error) {
// // //             console.error(`❌ Bot startup failed (attempt ${attempt}):`, error);

// // //             if (attempt < 3) {
// // //                 console.log(`🔄 Retrying startup in 10 seconds... (${attempt + 1}/3)`);
// // //                 setTimeout(() => startBot(attempt + 1), 10000);
// // //             } else {
// // //                 console.error('💥 Maximum startup attempts reached. Bot will continue in disconnected state.');
// // //             }
// // //         }
// // //     };

// // //     startBot();

// // // }, 3000); // Wait 3 seconds for server to initialize

// // // export { createWhatsAppBot, getWhatsAppBot };
// // // export default bot;





































// // bot.js - PROFESSIONAL MULTI-TENANT VERSION with RemoteAuth & MongoDB
// // Industry standard: Supports multiple WhatsApp sessions per company

// import pkg from 'whatsapp-web.js';
// import qrcode from 'qrcode-terminal';
// import { EventEmitter } from 'events';
// import dotenv from 'dotenv';
// import handleMessage from "./messageHandler.js";
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import mongoose from 'mongoose';
// import { MongoStore } from 'wwebjs-mongo';
// // Add this with your other imports at the top of bot.js
// import apiService from '../services/apiService.js';

// dotenv.config();

// const { Client, RemoteAuth } = pkg;

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
//         this.sessionPath = path.join(__dirname, 'sessions');
//         this.mongoStore = null;
//         this.mongooseConnected = false;
        
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
        
//         console.log('🤖 [WhatsAppBot] Initialized with multi-tenant support');
//     }

//     /**
//      * Initialize MongoDB connection for session storage
//      */
//     async connectToMongoDB() {
//         try {
//             const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
            
//             if (mongoose.connection.readyState === 1) {
//                 console.log('✅ [MongoDB] Already connected');
//                 this.mongooseConnected = true;
//                 return;
//             }
            
//             console.log(`🔌 [MongoDB] Connecting to ${mongoURI.split('@')[0] || 'localhost'}...`);
            
//             await mongoose.connect(mongoURI, {
//                 serverSelectionTimeoutMS: 5000
//             });
            
//             this.mongooseConnected = true;
//             console.log('✅ [MongoDB] Connected successfully');
            
//             // Create MongoDB store for RemoteAuth
//             this.mongoStore = new MongoStore({ mongoose });
//             console.log('📦 [MongoStore] Created for session storage');
            
//         } catch (error) {
//             this.mongooseConnected = false;
//             console.error('❌ [MongoDB] Connection failed:', error.message);
//             throw error;
//         }
//     }

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

//             // Connect to MongoDB first
//             await this.connectToMongoDB();

//             // Clear any existing client
//             if (this.client) {
//                 await this.safeDestroyClient();
//             }

//             // Initialize WhatsApp client with RemoteAuth
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

//  initializeClient() {
//     console.log('\n' + '🔍'.repeat(20));
//     console.log('🔍 [DEBUG] ===== INSIDE initializeClient() =====');
//     console.log(`🔍 [DEBUG] this.companyId at START of initializeClient: "${this.companyId || 'null'}"`);
//     console.log(`🔍 [DEBUG] this.mongoStore exists: ${this.mongoStore ? 'YES' : 'NO'}`);
//     console.log(`🔍 [DEBUG] this.sessionPath: ${this.sessionPath}`);
//     console.log('🔍'.repeat(20) + '\n');
    
//     return new Promise((resolve, reject) => {
//         try {
//             // Ensure session directory exists (for any local fallback)
//             if (!fs.existsSync(this.sessionPath)) {
//                 console.log(`🔍 [DEBUG] Creating session directory: ${this.sessionPath}`);
//                 fs.mkdirSync(this.sessionPath, { recursive: true });
//             } else {
//                 console.log(`🔍 [DEBUG] Session directory already exists: ${this.sessionPath}`);
//             }

//             console.log('📁 Local session path:', this.sessionPath);
            
//             // Generate client ID based on company
//             console.log(`🔍 [DEBUG] Generating clientId with this.companyId = "${this.companyId || 'null'}"`);
            
//             const clientId = this.companyId 
//                 ? `company_${this.companyId}` 
//                 : `whatsapp-bot-${Date.now()}`;
            
//             console.log(`🔍 [DEBUG] Generated clientId: "${clientId}"`);
//             console.log(`🆔 Client ID: ${clientId}`);

//             // Create client with RemoteAuth using MongoDB store
//             console.log(`🔍 [DEBUG] Creating new Client with RemoteAuth...`);
//             console.log(`🔍 [DEBUG] RemoteAuth config:`, {
//                 store: this.mongoStore ? 'MongoStore ✓' : 'NO STORE!',
//                 clientId: clientId,
//                 backupSyncIntervalMs: 300000,
//                 dataPath: path.join(process.cwd(), 'sessions')
//             });
            
//             this.client = new Client({
//                 authStrategy: new RemoteAuth({
//                     store: this.mongoStore,
//                     clientId: clientId,
//                     backupSyncIntervalMs: 300000, // Backup every 5 minutes
//                     dataPath: path.join(process.cwd(), 'sessions') // Local backup
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
//                         '--disable-web-security',
//                         '--disable-features=VizDisplayCompositor',
//                         '--disable-features=TranslateUI',
//                         '--disable-ipc-flooding-protection',
//                         '--disable-renderer-backgrounding',
//                         '--disable-background-timer-throttling',
//                         '--disable-backgrounding-occluded-windows',
//                         '--disable-breakpad',
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

//             console.log(`🔍 [DEBUG] Client object created, calling setupEventHandlers...`);
//             this.setupEventHandlers(resolve, reject);

//             console.log('🔧 Starting client initialization with RemoteAuth...');
//             console.log(`🔍 [DEBUG] About to call this.client.initialize()`);
            
//             this.client.initialize().catch((error) => {
//                 console.error(`🔍 [DEBUG] client.initialize() CATCH error:`, error.message);
//                 reject(error);
//             });

//             console.log(`🔍 [DEBUG] client.initialize() called successfully`);

//         } catch (error) {
//             console.error(`🔍 [DEBUG] CATCH in initializeClient:`, error.message);
//             reject(new Error(`Client initialization failed: ${error.message}`));
//         } finally {
//             console.log('\n' + '🔍'.repeat(20));
//             console.log(`🔍 [DEBUG] ===== EXITING initializeClient() =====`);
//             console.log(`🔍 [DEBUG] this.companyId at END: "${this.companyId || 'null'}"`);
//             console.log(`🔍 [DEBUG] client created: ${this.client ? 'YES' : 'NO'}`);
//             console.log('🔍'.repeat(20) + '\n');
//         }
//     });
// }

// setupEventHandlers(resolve, reject) {
//     console.log('\n' + '🔍'.repeat(30));
//     console.log('🔍 [DEBUG] ===== INSIDE setupEventHandlers() =====');
//     console.log(`🔍 [DEBUG] this.companyId at START: "${this.companyId || 'null'}"`);
//     console.log(`🔍 [DEBUG] this.client exists: ${this.client ? 'YES' : 'NO'}`);
//     console.log(`🔍 [DEBUG] this.mongoStore exists: ${this.mongoStore ? 'YES' : 'NO'}`);
//     console.log(`🔍 [DEBUG] Current this.isConnected: ${this.isConnected}`);
//     console.log(`🔍 [DEBUG] Current this.isAuthenticated: ${this.isAuthenticated}`);
//     console.log('🔍'.repeat(30) + '\n');
    
//     let qrGenerated = false;
//     let initializationTimeout;

//     // Set initialization timeout (2 minutes)
//     initializationTimeout = setTimeout(() => {
//         console.log(`🔍 [DEBUG] TIMEOUT: 2 minutes elapsed, checking connection...`);
//         if (!this.isConnected) {
//             const error = new Error('Client initialization timeout - taking too long to connect');
//             console.error('❌', error.message);
//             console.log(`🔍 [DEBUG] Rejecting with timeout error`);

//             this.emitStatusChange({
//                 connected: false,
//                 status: 'error',
//                 message: 'Initialization timeout - taking too long to connect'
//             });

//             reject(error);
//         } else {
//             console.log(`🔍 [DEBUG] Connection established, timeout cleared`);
//         }
//     }, 120000);

//     // ✅ PROFESSIONAL QR HANDLER with company context
//     this.client.on('qr', async (qr) => {
//         console.log('\n' + '🔍'.repeat(20));
//         console.log(`🔍 [DEBUG] QR EVENT TRIGGERED`);
//         console.log(`🔍 [DEBUG] this.companyId in QR handler: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
//         console.log(`🔍 [DEBUG] Current this.isWaitingForScan: ${this.isWaitingForScan}`);
//         console.log(`🔍 [DEBUG] Current this.currentQR exists: ${!!this.currentQR}`);
//         console.log('🔍'.repeat(20) + '\n');
        
//         clearTimeout(initializationTimeout);
//         console.log(`🔍 [DEBUG] initializationTimeout cleared`);
        
//         // If already waiting for a scan and QR is the same, ignore
//         if (this.isWaitingForScan && this.currentQR === qr) {
//             console.log('⏳ Already waiting for QR scan...');
//             console.log(`🔍 [DEBUG] Ignoring duplicate QR`);
//             return;
//         }
        
//         // If we have a valid QR and it's not expired, don't generate new one
//         if (this.currentQR && this.qrGeneratedAt && 
//             (Date.now() - this.qrGeneratedAt < this.qrExpiryTime)) {
//             console.log('⏳ Current QR still valid, not generating new one');
//             console.log(`🔍 [DEBUG] Time left: ${Math.round((this.qrExpiryTime - (Date.now() - this.qrGeneratedAt))/1000)}s`);
//             return;
//         }
        
//         // Clear previous timeout
//         if (this.qrTimeout) {
//             console.log(`🔍 [DEBUG] Clearing previous qrTimeout`);
//             clearTimeout(this.qrTimeout);
//             this.qrTimeout = null;
//         }
        
//         // Store new QR
//         this.currentQR = qr;
//         this.qrGeneratedAt = Date.now();
//         this.isWaitingForScan = true;
        
//         console.log(`🔍 [DEBUG] New QR stored at ${new Date(this.qrGeneratedAt).toLocaleTimeString()}`);
//         console.log(`🔍 [DEBUG] QR expires in ${this.qrExpiryTime/1000}s`);
        
//         // Get company info for logging
//         const companyInfo = this.companyId ? `Company: ${this.companyId}` : 'Single tenant';
//         const clientIdFromStrategy = this.client?.authStrategy?.clientId || 'unknown';
        
//         console.log(`🔍 [DEBUG] companyInfo for display: "${companyInfo}"`);
//         console.log(`🔍 [DEBUG] clientId from strategy: "${clientIdFromStrategy}"`);
        
//         console.log('\n' + '='.repeat(60));
//         console.log(`📱 WHATSAPP AUTHENTICATION REQUIRED - ${companyInfo}`);
//         console.log('='.repeat(60));
//         console.log(`⏰ Generated at: ${new Date().toLocaleTimeString()}`);
//         console.log(`⌛ Expires in: ${this.qrExpiryTime/1000} seconds`);
//         console.log(`🆔 Client ID: ${clientIdFromStrategy}`);
//         console.log('='.repeat(60) + '\n');
        
//         // Show QR in terminal (only once)
//         if (!qrGenerated) {
//             console.log(`🔍 [DEBUG] Generating QR code in terminal (first time only)`);
//             qrcode.generate(qr, { small: true });
//             qrGenerated = true;
            
//             console.log('\n' + '='.repeat(60));
//             console.log('📱 HOW TO CONNECT:');
//             console.log('1. Open WhatsApp on your phone');
//             console.log('2. Tap Menu (3 dots) → Linked Devices');
//             console.log('3. Tap "Link a Device"');
//             console.log('4. Scan the QR code above');
//             console.log('='.repeat(60) + '\n');
//         } else {
//             console.log(`🔍 [DEBUG] QR already generated in terminal, skipping`);
//         }

//         // Emit QR update for web dashboard with company context
//         console.log(`🔍 [DEBUG] Emitting QR update to dashboard with companyId: ${this.companyId || 'null'}`);
//         this.emitQRCode({
//             qr: qr,
//             expiresIn: this.qrExpiryTime/1000,
//             generatedAt: this.qrGeneratedAt,
//             isValid: true,
//             companyId: this.companyId,
//             clientId: clientIdFromStrategy
//         });

//         // Emit status change
//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             hasQR: true,
//             status: 'qr_required',
//             message: 'Scan QR code to connect WhatsApp',
//             companyId: this.companyId
//         });

//         // Set timeout to expire QR
//         console.log(`🔍 [DEBUG] Setting QR expiry timeout for ${this.qrExpiryTime}ms`);
//         this.qrTimeout = setTimeout(() => {
//             console.log(`🔍 [DEBUG] QR EXPIRY TIMEOUT TRIGGERED`);
//             console.log(`🔍 [DEBUG] this.isWaitingForScan: ${this.isWaitingForScan}`);
//             console.log(`🔍 [DEBUG] this.currentQR equals stored: ${this.currentQR === qr}`);
            
//             if (this.isWaitingForScan && this.currentQR === qr) {
//                 console.log('⏰ QR code expired. Ready for new QR...');
//                 this.isWaitingForScan = false;
//                 this.currentQR = null;
//                 this.qrGeneratedAt = null;
//                 qrGenerated = false;
                
//                 console.log(`🔍 [DEBUG] QR state reset, qrGenerated set to false`);
                
//                 // Emit expiry to dashboard
//                 this.emitQRCode(null);
                
//                 this.emitStatusChange({
//                     connected: false,
//                     authenticated: false,
//                     hasQR: false,
//                     status: 'qr_expired',
//                     message: 'QR code expired. Generating new one...',
//                     companyId: this.companyId
//                 });
//             } else {
//                 console.log(`🔍 [DEBUG] QR expiry ignored - state changed`);
//             }
//         }, this.qrExpiryTime);
//     });

//     this.client.on('ready', async () => {
//         console.log('\n' + '🔍'.repeat(20));
//         console.log(`🔍 [DEBUG] READY EVENT TRIGGERED`);
//         console.log(`🔍 [DEBUG] this.companyId in ready event: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
//         console.log('🔍'.repeat(20) + '\n');
        
//         clearTimeout(initializationTimeout);
//         console.log(`🔍 [DEBUG] initializationTimeout cleared`);

//         this.isConnected = true;
//         this.isAuthenticated = true;
//         this.currentQR = null;
//         this.isWaitingForScan = false;
//         this.qrGeneratedAt = null;
        
//         if (this.qrTimeout) {
//             console.log(`🔍 [DEBUG] Clearing qrTimeout`);
//             clearTimeout(this.qrTimeout);
//             this.qrTimeout = null;
//         }
        
//         this.reconnectAttempts = 0;
//         this.connectionTime = new Date();

//         // Get client info
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         const companyInfo = this.companyId ? `Company: ${this.companyId}` : 'Single tenant';

//         console.log(`🔍 [DEBUG] READY - Client ID: ${clientId}`);
//         console.log(`🔍 [DEBUG] READY - Company Info: ${companyInfo}`);

//         console.log('\n' + '='.repeat(60));
//         console.log('✅ WHATSAPP BOT SUCCESSFULLY INITIALIZED');
//         console.log('='.repeat(60));
//         console.log(`🤖 Status: ONLINE`);
//         console.log(`🏢 ${companyInfo}`);
//         console.log(`🆔 Client ID: ${clientId}`);
//         console.log(`📱 Session: STORED IN MONGODB (persistent across restarts)`);
//         console.log(`🛍️ Ready to process customer orders`);
//         console.log('='.repeat(60) + '\n');

//         // Store client in map for multi-tenant support
//         if (this.companyId) {
//             console.log(`🔍 [DEBUG] Storing client in clients Map for company: ${this.companyId}`);
//             this.clients.set(this.companyId, this.client);
//             console.log(`🔍 [DEBUG] clients Map size now: ${this.clients.size}`);
//         } else {
//             console.log(`🔍 [DEBUG] WARNING: No companyId, not storing in clients Map`);
//         }

//         this.emitStatusChange({
//             connected: true,
//             authenticated: true,
//             hasQR: false,
//             status: 'connected',
//             message: 'WhatsApp is connected and ready',
//             companyId: this.companyId,
//             clientId: clientId
//         });

//         // Start stats (safe)
//         this.startStatsBroadcasting();

//         // Load bot info
//         setTimeout(() => {
//             this.displayBotInfo().catch(err =>
//                 console.log('⚠️ Bot info load skipped:', err.message)
//             );
//         }, 5000);

//         console.log(`🔍 [DEBUG] Resolving promise from ready event`);
//         resolve();
//     });

//     this.client.on('authenticated', () => {
//         console.log('\n' + '🔍'.repeat(20));
//         console.log(`🔍 [DEBUG] AUTHENTICATED EVENT TRIGGERED`);
//         console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
//         console.log('🔍'.repeat(20) + '\n');
        
//         this.isAuthenticated = true;
//         this.isWaitingForScan = false;
//         this.currentQR = null;
//         this.qrGeneratedAt = null;
        
//         // Clear QR timeout
//         if (this.qrTimeout) {
//             console.log(`🔍 [DEBUG] Clearing qrTimeout`);
//             clearTimeout(this.qrTimeout);
//             this.qrTimeout = null;
//         }
        
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         console.log(`🔐 [${clientId}] Authentication successful - Session saved to MongoDB`);

//         this.emitStatusChange({
//             connected: false,
//             authenticated: true,
//             hasQR: false,
//             status: 'authenticated',
//             message: 'WhatsApp authentication successful',
//             companyId: this.companyId,
//             clientId: clientId
//         });
//     });

//     this.client.on('auth_failure', (error) => {
//         console.log('\n' + '🔍'.repeat(20));
//         console.log(`🔍 [DEBUG] AUTH_FAILURE EVENT TRIGGERED`);
//         console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] Error:`, error);
//         console.log('🔍'.repeat(20) + '\n');
        
//         clearTimeout(initializationTimeout);
//         console.log(`🔍 [DEBUG] initializationTimeout cleared`);

//         this.isAuthenticated = false;
//         this.isWaitingForScan = false;
//         this.currentQR = null;
        
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         console.error(`❌ [${clientId}] Authentication failed:`, error);

//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             status: 'auth_failed',
//             message: `Authentication failed: ${error.message}`,
//             companyId: this.companyId,
//             clientId: clientId
//         });

//         console.log(`🔍 [DEBUG] Rejecting promise with auth failure`);
//         reject(new Error(`Authentication failed: ${error.message}`));
//     });

//     this.client.on('disconnected', async (reason) => {
//         console.log('\n' + '🔍'.repeat(20));
//         console.log(`🔍 [DEBUG] DISCONNECTED EVENT TRIGGERED`);
//         console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
//         console.log(`🔍 [DEBUG] Reason: ${reason}`);
//         console.log(`🔍 [DEBUG] this.isShuttingDown: ${this.isShuttingDown}`);
//         console.log('🔍'.repeat(20) + '\n');
        
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         console.log(`🔌 [${clientId}] Disconnected: ${reason}`);

//         this.isConnected = false;
//         this.isAuthenticated = false;
//         this.currentQR = null;
//         this.isWaitingForScan = false;

//         // Stop stats broadcasting when disconnected
//         this.stopStatsBroadcasting();

//         this.emitStatusChange({
//             connected: false,
//             authenticated: false,
//             status: 'disconnected',
//             message: `WhatsApp disconnected: ${reason}`,
//             companyId: this.companyId,
//             clientId: clientId
//         });

//         // Don't try to reconnect if we're shutting down or logging out
//         if (this.isShuttingDown) {
//             console.log(`🔍 [DEBUG] Shutting down, not reconnecting`);
//             return;
//         }

//         // Handle different disconnect reasons
//         if (reason === 'LOGOUT' || reason === 'UNAUTHORIZED') {
//             console.log(`🔄 [${clientId}] Logout/Unauthorized detected. Generating new QR code...`);
//             console.log(`🔍 [DEBUG] Will reinitialize in 3 seconds`);

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'qr_required',
//                 message: 'Reconnecting WhatsApp...',
//                 companyId: this.companyId,
//                 clientId: clientId
//             });

//             // Clear local session (MongoDB session still exists)
//             setTimeout(() => {
//                 console.log(`🔍 [DEBUG] Reinitializing after logout`);
//                 this.initialize().catch(console.error);
//             }, 3000);
//         } else {
//             console.log(`🔍 [DEBUG] Other disconnect reason, attempting reconnection`);
//             await this.handleReconnection();
//         }
//     });

//   this.client.on('message', async (message) => {
//     if (message.from === 'status@broadcast' || message.isGroupMsg) return;

//     try {
//         console.log('\n' + '🔍'.repeat(30));
//         console.log('🔍 [DEBUG] ===== MESSAGE RECEIVED =====');
//         console.log(`🔍 [DEBUG] Message FROM (customer): ${message.from}`);
//         console.log(`🔍 [DEBUG] Message TO (company number): ${message.to}`);
//         console.log(`🔍 [DEBUG] Message body: ${message.body?.substring(0, 100)}`);
//         console.log('🔍'.repeat(30) + '\n');
        
//         // ===== CRITICAL: Identify which company this message is for =====
//         // The customer messaged a specific WhatsApp number (message.to)
//         // We need to find which company owns that number
        
//         let companyId = this.companyId; // Default to current company
        
//         // If message.to exists, try to identify company from that number
//         if (message.to) {
//             console.log(`🔍 [DEBUG] Attempting to identify company from message.to: ${message.to}`);
            
//             // Extract phone number from message.to (format: 919876543210@c.us)
//             const phoneNumber = message.to.split('@')[0];
//             console.log(`🔍 [DEBUG] Extracted phone number: ${phoneNumber}`);
            
//             // Call apiService to identify company
//             if (apiService && typeof apiService.identifyCompanyFromWhatsApp === 'function') {
//                 console.log(`🔍 [DEBUG] Calling apiService.identifyCompanyFromWhatsApp...`);
//                 const identifiedCompanyId = await apiService.identifyCompanyFromWhatsApp(phoneNumber);
                
//                 if (identifiedCompanyId) {
//                     console.log(`✅ [DEBUG] Company identified: ${identifiedCompanyId}`);
//                     companyId = identifiedCompanyId;
                    
//                     // Update this.companyId if it's different
//                     if (this.companyId !== identifiedCompanyId) {
//                         console.log(`🔍 [DEBUG] Updating this.companyId from ${this.companyId || 'null'} to ${identifiedCompanyId}`);
//                         this.companyId = identifiedCompanyId;
//                     }
//                 } else {
//                     console.log(`⚠️ [DEBUG] No company identified for phone: ${phoneNumber}`);
//                 }
//             } else {
//                 console.log(`⚠️ [DEBUG] apiService.identifyCompanyFromWhatsApp not available`);
//             }
//         } else {
//             console.log(`🔍 [DEBUG] No message.to, using current companyId: ${this.companyId || 'unknown'}`);
//         }
        
//         // Update statistics for every message
//         this.updateMessageStats(message.from);

//         // Log incoming message with company context
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         const shortMsg = message.body?.substring(0, 50) || '[No text]';
        
//         console.log(`📨 [${clientId}] From ${message.from}: ${shortMsg}...`);
//         console.log(`🏢 [DEBUG] Processing message for company: ${companyId || 'unknown'}`);
//         console.log(`🔍 [DEBUG] Final companyId for this message: ${companyId || 'null'}`);

//         // Emit message event with the identified companyId
//         this.emitMessage({
//             from: message.from,
//             to: message.to,
//             body: message.body,
//             timestamp: new Date().toISOString(),
//             hasMedia: message.hasMedia,
//             type: message.type,
//             companyId: companyId,  // Use identified companyId
//             clientId: clientId
//         });

//         // Pass company context to message handler
//         console.log(`🔍 [DEBUG] Calling handleMessage with companyId: ${companyId || 'null'}`);
//         await handleMessage(message, this.client, companyId);
        
//         console.log('🔍'.repeat(30));
//         console.log('🔍 [DEBUG] ===== MESSAGE PROCESSING COMPLETE =====\n');
        
//     } catch (error) {
//         console.error('❌ Message processing error:', error);
//         await this.handleMessageError(message, error);
//     }
// });

//     // Monitor connection state
//     this.client.on('change_state', (state) => {
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         console.log(`🔄 [${clientId}] Connection state: ${state}`);
//         console.log(`🔍 [DEBUG] State change for company: ${this.companyId || 'unknown'}`);
        
//         this.emitStatusChange({
//             connected: this.isConnected,
//             authenticated: this.isAuthenticated,
//             status: 'state_change',
//             message: `Connection state: ${state}`,
//             companyId: this.companyId,
//             clientId: clientId
//         });
//     });

//     // Loading screen events
//     this.client.on('loading_screen', (percent, message) => {
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         console.log(`📱 [${clientId}] WhatsApp loading: ${percent}% - ${message}`);
//         console.log(`🔍 [DEBUG] Loading for company: ${this.companyId || 'unknown'}`);
        
//         this.emitStatusChange({
//             connected: this.isConnected,
//             authenticated: this.isAuthenticated,
//             status: 'loading',
//             message: `Loading: ${percent}% - ${message}`,
//             companyId: this.companyId,
//             clientId: clientId
//         });
//     });

//     // Handle page errors
//     this.client.on('page_error', (error) => {
//         if (this.isShuttingDown && (
//             error.message.includes('Session closed') ||
//             error.message.includes('page has been closed') ||
//             error.message.includes('Protocol error')
//         )) {
//             console.log(`🔍 [DEBUG] Page error during shutdown (ignored):`, error.message);
//             return;
//         }
        
//         const clientId = this.client?.authStrategy?.clientId || 'unknown';
//         console.error(`❌ [${clientId}] Page error:`, error.message);
//         console.log(`🔍 [DEBUG] Page error for company: ${this.companyId || 'unknown'}`);

//         this.emitStatusChange({
//             connected: this.isConnected,
//             authenticated: this.isAuthenticated,
//             status: 'page_error',
//             message: `Page error: ${error.message}`,
//             companyId: this.companyId,
//             clientId: clientId
//         });
//     });
    
//     console.log(`🔍 [DEBUG] setupEventHandlers completed, waiting for events...`);
// }

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
//   /**
//  * Initialize client for a new company
//  * @param {string} companyId - Company ID
//  */
// async addCompany(companyId) {
//     console.log('\n' + '='.repeat(60));
//     console.log(`🔍 [DEBUG] addCompany CALLED with companyId: "${companyId}"`);
//     console.log(`🔍 [DEBUG] Current this.companyId BEFORE: "${this.companyId || 'null'}"`);
//     console.log(`🔍 [DEBUG] Current clients Map size: ${this.clients.size}`);
//     console.log('='.repeat(60));

//     // Check if client already exists for this company
//     if (this.clients.has(companyId)) {
//         console.log(`🏢 [Company:${companyId}] Client already EXISTS in clients Map`);
//         console.log(`🔍 [DEBUG] Returning existing client`);
//         return this.clients.get(companyId);
//     }

//     console.log(`🏢 [Company:${companyId}] Adding NEW WhatsApp client...`);
//     console.log(`🔍 [DEBUG] No existing client found, proceeding with initialization`);
    
//     // Store previous company ID (for error recovery)
//     const previousCompany = this.companyId;
//     console.log(`🔍 [DEBUG] Stored previousCompany: "${previousCompany || 'null'}"`);
    
//     // Set the new company ID
//     this.companyId = companyId;
//     console.log(`🔍 [DEBUG] this.companyId NOW SET TO: "${this.companyId}"`);
    
//     try {
//         console.log(`🔍 [DEBUG] About to call this.initialize()...`);
//         await this.initialize();
//         console.log(`🔍 [DEBUG] this.initialize() COMPLETED successfully`);
//         console.log(`🔍 [DEBUG] this.companyId AFTER initialize: "${this.companyId}"`);
//         console.log(`🔍 [DEBUG] Client stored in clients Map for company: ${companyId}`);
        
//         return this.client;
//     } catch (error) {
//         console.error(`❌ [Company:${companyId}] Failed to initialize:`, error);
//         console.log(`🔍 [DEBUG] Restoring previousCompany: "${previousCompany || 'null'}"`);
        
//         // Restore previous company ID on error
//         this.companyId = previousCompany;
//         console.log(`🔍 [DEBUG] this.companyId RESTORED to: "${this.companyId || 'null'}"`);
        
//         throw error;
//     } finally {
//         console.log('='.repeat(60));
//         console.log(`🔍 [DEBUG] addCompany FINISHED for companyId: "${companyId}"`);
//         console.log(`🔍 [DEBUG] Final this.companyId: "${this.companyId || 'null'}"`);
//         console.log('='.repeat(60) + '\n');
//     }
// }

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
//             console.log('🧹 Clearing local session data...');

//             this.emitStatusChange({
//                 connected: false,
//                 authenticated: false,
//                 status: 'clearing_session',
//                 message: 'Clearing session data...'
//             });

//             // Clear local session files (MongoDB sessions remain)
//             if (fs.existsSync(this.sessionPath)) {
//                 fs.rmSync(this.sessionPath, { recursive: true, force: true });
//                 console.log('✅ Local session cleared successfully');

//                 this.emitStatusChange({
//                     connected: false,
//                     authenticated: false,
//                     status: 'session_cleared',
//                     message: 'Local session cleared successfully'
//                 });
//             }
            
//             // Note: MongoDB sessions are not cleared here intentionally
//             // They persist for future connections
//             console.log('📦 MongoDB session data preserved for future connections');
            
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
//             }
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

//             // Close MongoDB connection
//             if (this.mongooseConnected) {
//                 await mongoose.disconnect();
//                 console.log('📦 MongoDB disconnected');
//             }

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

//             setTimeout(() => {
//                 this.isShuttingDown = false;
//                 this.initialize().catch(console.error);
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
// Industry standard: Supports multiple WhatsApp sessions per company with file storage

import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';
import handleMessage from "./messageHandler.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// ✅ REMOVED: mongoose and MongoStore imports
// ✅ ADDED: apiService import (was already there)
import apiService from '../services/apiService.js';

dotenv.config();

const { Client, LocalAuth } = pkg; // ✅ CHANGED: RemoteAuth → LocalAuth

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppBot extends EventEmitter {
    constructor() {
        super(); // Initialize EventEmitter

        // Multi-tenant properties
        this.companyId = null; // Current company ID
        this.clients = new Map(); // Store multiple clients per company
        
        // Single client properties (for backward compatibility)
        this.client = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        
        // Session management
        this.sessionPath = path.join(process.cwd(), 'sessions'); // ✅ CHANGED: Absolute path
        // ✅ REMOVED: mongoStore and mongooseConnected
        
        // QR properties
        this.currentQR = null;
        this.qrGeneratedAt = null;
        this.qrTimeout = null;
        this.qrExpiryTime = 60000; // 60 seconds
        this.isWaitingForScan = false;
        
        // Connection management
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 7;
        this.isInitializing = false;
        this.connectionTime = null;
        this.botInfo = null;
        this.isShuttingDown = false;
        
        // WebSocket tracking
        this.qrWebSocketClients = new Set();

        // Initialize statistics
        this.stats = {
            totalOrders: 0,
            totalChats: 0,
            totalCustomers: new Set(),
            totalMessages: 0,
            pendingOrders: 0,
            completedOrders: 0
        };

        this.statsInterval = null;
        
        console.log('🤖 [WhatsAppBot] Initialized with multi-tenant support (LocalAuth)');
        console.log(`📁 Sessions will be stored in: ${this.sessionPath}`);
    }

    // ✅ REMOVED: connectToMongoDB() method - no longer needed

    /**
     * Initialize WhatsApp client for a specific company
     * @param {string} companyId - Company ID for multi-tenant isolation
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

            // ✅ REMOVED: MongoDB connection

            // Clear any existing client
            if (this.client) {
                await this.safeDestroyClient();
            }

            // Initialize WhatsApp client with LocalAuth
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
        console.log('🔍 [DEBUG] ===== INSIDE initializeClient() =====');
        console.log(`🔍 [DEBUG] this.companyId at START of initializeClient: "${this.companyId || 'null'}"`);
        console.log(`🔍 [DEBUG] this.sessionPath: ${this.sessionPath}`);
        console.log('🔍'.repeat(20) + '\n');
        
        return new Promise((resolve, reject) => {
            try {
                // Ensure session directory exists for all companies
                if (!fs.existsSync(this.sessionPath)) {
                    console.log(`🔍 [DEBUG] Creating main session directory: ${this.sessionPath}`);
                    fs.mkdirSync(this.sessionPath, { recursive: true });
                } else {
                    console.log(`🔍 [DEBUG] Main session directory already exists: ${this.sessionPath}`);
                }

                console.log('📁 Main session path:', this.sessionPath);
                
                // Generate client ID based on company - THIS IS KEY FOR MULTI-TENANT
                console.log(`🔍 [DEBUG] Generating clientId with this.companyId = "${this.companyId || 'null'}"`);
                
                const clientId = this.companyId 
                    ? `company_${this.companyId}` 
                    : `whatsapp-bot-${Date.now()}`;
                
                console.log(`🔍 [DEBUG] Generated clientId: "${clientId}"`);
                console.log(`🆔 Client ID: ${clientId}`);

                // ✅ CHANGED: Create client with LocalAuth instead of RemoteAuth
                console.log(`🔍 [DEBUG] Creating new Client with LocalAuth...`);
                console.log(`🔍 [DEBUG] LocalAuth config:`, {
                    clientId: clientId,
                    dataPath: this.sessionPath
                });
                
                this.client = new Client({
                    authStrategy: new LocalAuth({
                        clientId: clientId, // Company-specific client ID
                        dataPath: this.sessionPath // All sessions in one folder
                    }),
                    puppeteer: {
                        headless: true,
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
                            '--window-size=1920,1080'
                        ],
                        timeout: 60000,
                        ignoreHTTPSErrors: true
                    },
                    qrMaxRetries: 3,
                    authTimeoutMs: 120000,
                    takeoverOnConflict: true,
                    takeoverTimeoutMs: 60000
                });

                console.log(`🔍 [DEBUG] Client object created, calling setupEventHandlers...`);
                this.setupEventHandlers(resolve, reject);

                console.log('🔧 Starting client initialization with LocalAuth...');
                console.log(`🔍 [DEBUG] About to call this.client.initialize()`);
                
                this.client.initialize().catch((error) => {
                    console.error(`🔍 [DEBUG] client.initialize() CATCH error:`, error.message);
                    reject(error);
                });

                console.log(`🔍 [DEBUG] client.initialize() called successfully`);

            } catch (error) {
                console.error(`🔍 [DEBUG] CATCH in initializeClient:`, error.message);
                reject(new Error(`Client initialization failed: ${error.message}`));
            } finally {
                console.log('\n' + '🔍'.repeat(20));
                console.log(`🔍 [DEBUG] ===== EXITING initializeClient() =====`);
                console.log(`🔍 [DEBUG] this.companyId at END: "${this.companyId || 'null'}"`);
                console.log(`🔍 [DEBUG] client created: ${this.client ? 'YES' : 'NO'}`);
                console.log('🔍'.repeat(20) + '\n');
            }
        });
    }

    setupEventHandlers(resolve, reject) {
        console.log('\n' + '🔍'.repeat(30));
        console.log('🔍 [DEBUG] ===== INSIDE setupEventHandlers() =====');
        console.log(`🔍 [DEBUG] this.companyId at START: "${this.companyId || 'null'}"`);
        console.log(`🔍 [DEBUG] this.client exists: ${this.client ? 'YES' : 'NO'}`);
        console.log(`🔍 [DEBUG] Current this.isConnected: ${this.isConnected}`);
        console.log(`🔍 [DEBUG] Current this.isAuthenticated: ${this.isAuthenticated}`);
        console.log('🔍'.repeat(30) + '\n');
        
        let qrGenerated = false;
        let initializationTimeout;

        // Set initialization timeout (2 minutes)
        initializationTimeout = setTimeout(() => {
            console.log(`🔍 [DEBUG] TIMEOUT: 2 minutes elapsed, checking connection...`);
            if (!this.isConnected) {
                const error = new Error('Client initialization timeout - taking too long to connect');
                console.error('❌', error.message);
                console.log(`🔍 [DEBUG] Rejecting with timeout error`);

                this.emitStatusChange({
                    connected: false,
                    status: 'error',
                    message: 'Initialization timeout - taking too long to connect'
                });

                reject(error);
            } else {
                console.log(`🔍 [DEBUG] Connection established, timeout cleared`);
            }
        }, 120000);

        // ✅ PROFESSIONAL QR HANDLER with company context
        this.client.on('qr', async (qr) => {
            console.log('\n' + '🔍'.repeat(20));
            console.log(`🔍 [DEBUG] QR EVENT TRIGGERED`);
            console.log(`🔍 [DEBUG] this.companyId in QR handler: "${this.companyId || 'null'}"`);
            console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
            console.log(`🔍 [DEBUG] Current this.isWaitingForScan: ${this.isWaitingForScan}`);
            console.log(`🔍 [DEBUG] Current this.currentQR exists: ${!!this.currentQR}`);
            console.log('🔍'.repeat(20) + '\n');
            
            clearTimeout(initializationTimeout);
            console.log(`🔍 [DEBUG] initializationTimeout cleared`);
            
            // If already waiting for a scan and QR is the same, ignore
            if (this.isWaitingForScan && this.currentQR === qr) {
                console.log('⏳ Already waiting for QR scan...');
                console.log(`🔍 [DEBUG] Ignoring duplicate QR`);
                return;
            }
            
            // If we have a valid QR and it's not expired, don't generate new one
            if (this.currentQR && this.qrGeneratedAt && 
                (Date.now() - this.qrGeneratedAt < this.qrExpiryTime)) {
                console.log('⏳ Current QR still valid, not generating new one');
                console.log(`🔍 [DEBUG] Time left: ${Math.round((this.qrExpiryTime - (Date.now() - this.qrGeneratedAt))/1000)}s`);
                return;
            }
            
            // Clear previous timeout
            if (this.qrTimeout) {
                console.log(`🔍 [DEBUG] Clearing previous qrTimeout`);
                clearTimeout(this.qrTimeout);
                this.qrTimeout = null;
            }
            
            // Store new QR
            this.currentQR = qr;
            this.qrGeneratedAt = Date.now();
            this.isWaitingForScan = true;
            
            console.log(`🔍 [DEBUG] New QR stored at ${new Date(this.qrGeneratedAt).toLocaleTimeString()}`);
            console.log(`🔍 [DEBUG] QR expires in ${this.qrExpiryTime/1000}s`);
            
            // Get company info for logging
            const companyInfo = this.companyId ? `Company: ${this.companyId}` : 'Single tenant';
            const clientIdFromStrategy = this.client?.authStrategy?.clientId || 'unknown';
            
            console.log(`🔍 [DEBUG] companyInfo for display: "${companyInfo}"`);
            console.log(`🔍 [DEBUG] clientId from strategy: "${clientIdFromStrategy}"`);
            
            console.log('\n' + '='.repeat(60));
            console.log(`📱 WHATSAPP AUTHENTICATION REQUIRED - ${companyInfo}`);
            console.log('='.repeat(60));
            console.log(`⏰ Generated at: ${new Date().toLocaleTimeString()}`);
            console.log(`⌛ Expires in: ${this.qrExpiryTime/1000} seconds`);
            console.log(`🆔 Client ID: ${clientIdFromStrategy}`);
            console.log('='.repeat(60) + '\n');
            
            // Show QR in terminal (only once)
            if (!qrGenerated) {
                console.log(`🔍 [DEBUG] Generating QR code in terminal (first time only)`);
                qrcode.generate(qr, { small: true });
                qrGenerated = true;
                
                console.log('\n' + '='.repeat(60));
                console.log('📱 HOW TO CONNECT:');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Tap Menu (3 dots) → Linked Devices');
                console.log('3. Tap "Link a Device"');
                console.log('4. Scan the QR code above');
                console.log('='.repeat(60) + '\n');
            } else {
                console.log(`🔍 [DEBUG] QR already generated in terminal, skipping`);
            }

            // Emit QR update for web dashboard with company context
            console.log(`🔍 [DEBUG] Emitting QR update to dashboard with companyId: ${this.companyId || 'null'}`);
            this.emitQRCode({
                qr: qr,
                expiresIn: this.qrExpiryTime/1000,
                generatedAt: this.qrGeneratedAt,
                isValid: true,
                companyId: this.companyId,
                clientId: clientIdFromStrategy
            });

            // Emit status change
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                hasQR: true,
                status: 'qr_required',
                message: 'Scan QR code to connect WhatsApp',
                companyId: this.companyId
            });

            // Set timeout to expire QR
            console.log(`🔍 [DEBUG] Setting QR expiry timeout for ${this.qrExpiryTime}ms`);
            this.qrTimeout = setTimeout(() => {
                console.log(`🔍 [DEBUG] QR EXPIRY TIMEOUT TRIGGERED`);
                console.log(`🔍 [DEBUG] this.isWaitingForScan: ${this.isWaitingForScan}`);
                console.log(`🔍 [DEBUG] this.currentQR equals stored: ${this.currentQR === qr}`);
                
                if (this.isWaitingForScan && this.currentQR === qr) {
                    console.log('⏰ QR code expired. Ready for new QR...');
                    this.isWaitingForScan = false;
                    this.currentQR = null;
                    this.qrGeneratedAt = null;
                    qrGenerated = false;
                    
                    console.log(`🔍 [DEBUG] QR state reset, qrGenerated set to false`);
                    
                    // Emit expiry to dashboard
                    this.emitQRCode(null);
                    
                    this.emitStatusChange({
                        connected: false,
                        authenticated: false,
                        hasQR: false,
                        status: 'qr_expired',
                        message: 'QR code expired. Generating new one...',
                        companyId: this.companyId
                    });
                } else {
                    console.log(`🔍 [DEBUG] QR expiry ignored - state changed`);
                }
            }, this.qrExpiryTime);
        });

        this.client.on('ready', async () => {
            console.log('\n' + '🔍'.repeat(20));
            console.log(`🔍 [DEBUG] READY EVENT TRIGGERED`);
            console.log(`🔍 [DEBUG] this.companyId in ready event: "${this.companyId || 'null'}"`);
            console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
            console.log('🔍'.repeat(20) + '\n');
            
            clearTimeout(initializationTimeout);
            console.log(`🔍 [DEBUG] initializationTimeout cleared`);

            this.isConnected = true;
            this.isAuthenticated = true;
            this.currentQR = null;
            this.isWaitingForScan = false;
            this.qrGeneratedAt = null;
            
            if (this.qrTimeout) {
                console.log(`🔍 [DEBUG] Clearing qrTimeout`);
                clearTimeout(this.qrTimeout);
                this.qrTimeout = null;
            }
            
            this.reconnectAttempts = 0;
            this.connectionTime = new Date();

            // Get client info
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            const companyInfo = this.companyId ? `Company: ${this.companyId}` : 'Single tenant';

            console.log(`🔍 [DEBUG] READY - Client ID: ${clientId}`);
            console.log(`🔍 [DEBUG] READY - Company Info: ${companyInfo}`);

            console.log('\n' + '='.repeat(60));
            console.log('✅ WHATSAPP BOT SUCCESSFULLY INITIALIZED');
            console.log('='.repeat(60));
            console.log(`🤖 Status: ONLINE`);
            console.log(`🏢 ${companyInfo}`);
            console.log(`🆔 Client ID: ${clientId}`);
            console.log(`📱 Session: STORED ON SERVER (LocalAuth)`);
            console.log(`📁 Session Path: ${this.sessionPath}/company_${this.companyId || 'default'}`);
            console.log(`🛍️ Ready to process customer orders`);
            console.log('='.repeat(60) + '\n');

            // Store client in map for multi-tenant support
            if (this.companyId) {
                console.log(`🔍 [DEBUG] Storing client in clients Map for company: ${this.companyId}`);
                this.clients.set(this.companyId, this.client);
                console.log(`🔍 [DEBUG] clients Map size now: ${this.clients.size}`);
            } else {
                console.log(`🔍 [DEBUG] WARNING: No companyId, not storing in clients Map`);
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

            // Start stats (safe)
            this.startStatsBroadcasting();

            // Load bot info
            setTimeout(() => {
                this.displayBotInfo().catch(err =>
                    console.log('⚠️ Bot info load skipped:', err.message)
                );
            }, 5000);

            console.log(`🔍 [DEBUG] Resolving promise from ready event`);
            resolve();
        });

        this.client.on('authenticated', () => {
            console.log('\n' + '🔍'.repeat(20));
            console.log(`🔍 [DEBUG] AUTHENTICATED EVENT TRIGGERED`);
            console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
            console.log(`🔍 [DEBUG] this.client?.authStrategy?.clientId: "${this.client?.authStrategy?.clientId || 'unknown'}"`);
            console.log('🔍'.repeat(20) + '\n');
            
            this.isAuthenticated = true;
            this.isWaitingForScan = false;
            this.currentQR = null;
            this.qrGeneratedAt = null;
            
            // Clear QR timeout
            if (this.qrTimeout) {
                console.log(`🔍 [DEBUG] Clearing qrTimeout`);
                clearTimeout(this.qrTimeout);
                this.qrTimeout = null;
            }
            
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            console.log(`🔐 [${clientId}] Authentication successful - Session saved to disk`);

            this.emitStatusChange({
                connected: false,
                authenticated: true,
                hasQR: false,
                status: 'authenticated',
                message: 'WhatsApp authentication successful',
                companyId: this.companyId,
                clientId: clientId
            });
        });

        this.client.on('auth_failure', (error) => {
            console.log('\n' + '🔍'.repeat(20));
            console.log(`🔍 [DEBUG] AUTH_FAILURE EVENT TRIGGERED`);
            console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
            console.log(`🔍 [DEBUG] Error:`, error);
            console.log('🔍'.repeat(20) + '\n');
            
            clearTimeout(initializationTimeout);
            console.log(`🔍 [DEBUG] initializationTimeout cleared`);

            this.isAuthenticated = false;
            this.isWaitingForScan = false;
            this.currentQR = null;
            
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            console.error(`❌ [${clientId}] Authentication failed:`, error);

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'auth_failed',
                message: `Authentication failed: ${error.message}`,
                companyId: this.companyId,
                clientId: clientId
            });

            console.log(`🔍 [DEBUG] Rejecting promise with auth failure`);
            reject(new Error(`Authentication failed: ${error.message}`));
        });

        this.client.on('disconnected', async (reason) => {
            console.log('\n' + '🔍'.repeat(20));
            console.log(`🔍 [DEBUG] DISCONNECTED EVENT TRIGGERED`);
            console.log(`🔍 [DEBUG] this.companyId: "${this.companyId || 'null'}"`);
            console.log(`🔍 [DEBUG] Reason: ${reason}`);
            console.log(`🔍 [DEBUG] this.isShuttingDown: ${this.isShuttingDown}`);
            console.log('🔍'.repeat(20) + '\n');
            
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            console.log(`🔌 [${clientId}] Disconnected: ${reason}`);

            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            this.isWaitingForScan = false;

            // Stop stats broadcasting when disconnected
            this.stopStatsBroadcasting();

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'disconnected',
                message: `WhatsApp disconnected: ${reason}`,
                companyId: this.companyId,
                clientId: clientId
            });

            // Don't try to reconnect if we're shutting down or logging out
            if (this.isShuttingDown) {
                console.log(`🔍 [DEBUG] Shutting down, not reconnecting`);
                return;
            }

            // Handle different disconnect reasons
            if (reason === 'LOGOUT' || reason === 'UNAUTHORIZED') {
                console.log(`🔄 [${clientId}] Logout/Unauthorized detected. Generating new QR code...`);
                console.log(`🔍 [DEBUG] Will reinitialize in 3 seconds`);

                this.emitStatusChange({
                    connected: false,
                    authenticated: false,
                    status: 'qr_required',
                    message: 'Reconnecting WhatsApp...',
                    companyId: this.companyId,
                    clientId: clientId
                });

                // Clear local session files
                setTimeout(() => {
                    console.log(`🔍 [DEBUG] Reinitializing after logout`);
                    this.initialize().catch(console.error);
                }, 3000);
            } else {
                console.log(`🔍 [DEBUG] Other disconnect reason, attempting reconnection`);
                await this.handleReconnection();
            }
        });

        this.client.on('message', async (message) => {
            if (message.from === 'status@broadcast' || message.isGroupMsg) return;

            try {
                console.log('\n' + '🔍'.repeat(30));
                console.log('🔍 [DEBUG] ===== MESSAGE RECEIVED =====');
                console.log(`🔍 [DEBUG] Message FROM (customer): ${message.from}`);
                console.log(`🔍 [DEBUG] Message TO (company number): ${message.to}`);
                console.log(`🔍 [DEBUG] Message body: ${message.body?.substring(0, 100)}`);
                console.log('🔍'.repeat(30) + '\n');
                
                // ===== CRITICAL: Identify which company this message is for =====
                // The customer messaged a specific WhatsApp number (message.to)
                // We need to find which company owns that number
                
                let companyId = this.companyId; // Default to current company
                
                // If message.to exists, try to identify company from that number
                if (message.to) {
                    console.log(`🔍 [DEBUG] Attempting to identify company from message.to: ${message.to}`);
                    
                    // Extract phone number from message.to (format: 919876543210@c.us)
                    const phoneNumber = message.to.split('@')[0];
                    console.log(`🔍 [DEBUG] Extracted phone number: ${phoneNumber}`);
                    
                    // Call apiService to identify company
                    if (apiService && typeof apiService.identifyCompanyFromWhatsApp === 'function') {
                        console.log(`🔍 [DEBUG] Calling apiService.identifyCompanyFromWhatsApp...`);
                        const identifiedCompanyId = await apiService.identifyCompanyFromWhatsApp(phoneNumber);
                        
                        if (identifiedCompanyId) {
                            console.log(`✅ [DEBUG] Company identified: ${identifiedCompanyId}`);
                            companyId = identifiedCompanyId;
                            
                            // Update this.companyId if it's different
                            if (this.companyId !== identifiedCompanyId) {
                                console.log(`🔍 [DEBUG] Updating this.companyId from ${this.companyId || 'null'} to ${identifiedCompanyId}`);
                                this.companyId = identifiedCompanyId;
                            }
                        } else {
                            console.log(`⚠️ [DEBUG] No company identified for phone: ${phoneNumber}`);
                        }
                    } else {
                        console.log(`⚠️ [DEBUG] apiService.identifyCompanyFromWhatsApp not available`);
                    }
                } else {
                    console.log(`🔍 [DEBUG] No message.to, using current companyId: ${this.companyId || 'unknown'}`);
                }
                
                // Update statistics for every message
                this.updateMessageStats(message.from);

                // Log incoming message with company context
                const clientId = this.client?.authStrategy?.clientId || 'unknown';
                const shortMsg = message.body?.substring(0, 50) || '[No text]';
                
                console.log(`📨 [${clientId}] From ${message.from}: ${shortMsg}...`);
                console.log(`🏢 [DEBUG] Processing message for company: ${companyId || 'unknown'}`);
                console.log(`🔍 [DEBUG] Final companyId for this message: ${companyId || 'null'}`);

                // Emit message event with the identified companyId
                this.emitMessage({
                    from: message.from,
                    to: message.to,
                    body: message.body,
                    timestamp: new Date().toISOString(),
                    hasMedia: message.hasMedia,
                    type: message.type,
                    companyId: companyId,  // Use identified companyId
                    clientId: clientId
                });

                // Pass company context to message handler
                console.log(`🔍 [DEBUG] Calling handleMessage with companyId: ${companyId || 'null'}`);
                await handleMessage(message, this.client, companyId);
                
                console.log('🔍'.repeat(30));
                console.log('🔍 [DEBUG] ===== MESSAGE PROCESSING COMPLETE =====\n');
                
            } catch (error) {
                console.error('❌ Message processing error:', error);
                await this.handleMessageError(message, error);
            }
        });

        // Monitor connection state
        this.client.on('change_state', (state) => {
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            console.log(`🔄 [${clientId}] Connection state: ${state}`);
            console.log(`🔍 [DEBUG] State change for company: ${this.companyId || 'unknown'}`);
            
            this.emitStatusChange({
                connected: this.isConnected,
                authenticated: this.isAuthenticated,
                status: 'state_change',
                message: `Connection state: ${state}`,
                companyId: this.companyId,
                clientId: clientId
            });
        });

        // Loading screen events
        this.client.on('loading_screen', (percent, message) => {
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            console.log(`📱 [${clientId}] WhatsApp loading: ${percent}% - ${message}`);
            console.log(`🔍 [DEBUG] Loading for company: ${this.companyId || 'unknown'}`);
            
            this.emitStatusChange({
                connected: this.isConnected,
                authenticated: this.isAuthenticated,
                status: 'loading',
                message: `Loading: ${percent}% - ${message}`,
                companyId: this.companyId,
                clientId: clientId
            });
        });

        // Handle page errors
        this.client.on('page_error', (error) => {
            if (this.isShuttingDown && (
                error.message.includes('Session closed') ||
                error.message.includes('page has been closed') ||
                error.message.includes('Protocol error')
            )) {
                console.log(`🔍 [DEBUG] Page error during shutdown (ignored):`, error.message);
                return;
            }
            
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            console.error(`❌ [${clientId}] Page error:`, error.message);
            console.log(`🔍 [DEBUG] Page error for company: ${this.companyId || 'unknown'}`);

            this.emitStatusChange({
                connected: this.isConnected,
                authenticated: this.isAuthenticated,
                status: 'page_error',
                message: `Page error: ${error.message}`,
                companyId: this.companyId,
                clientId: clientId
            });
        });
        
        console.log(`🔍 [DEBUG] setupEventHandlers completed, waiting for events...`);
    }

    // ========== MULTI-TENANT CLIENT MANAGEMENT ==========

    /**
     * Get client for specific company
     * @param {string} companyId - Company ID
     * @returns {Object} WhatsApp client
     */
    getClientForCompany(companyId) {
        return this.clients.get(companyId);
    }

    /**
     * Initialize client for a new company
     * @param {string} companyId - Company ID
     */
    async addCompany(companyId) {
        console.log('\n' + '='.repeat(60));
        console.log(`🔍 [DEBUG] addCompany CALLED with companyId: "${companyId}"`);
        console.log(`🔍 [DEBUG] Current this.companyId BEFORE: "${this.companyId || 'null'}"`);
        console.log(`🔍 [DEBUG] Current clients Map size: ${this.clients.size}`);
        console.log('='.repeat(60));

        // Check if client already exists for this company
        if (this.clients.has(companyId)) {
            console.log(`🏢 [Company:${companyId}] Client already EXISTS in clients Map`);
            console.log(`🔍 [DEBUG] Returning existing client`);
            return this.clients.get(companyId);
        }

        console.log(`🏢 [Company:${companyId}] Adding NEW WhatsApp client...`);
        console.log(`🔍 [DEBUG] No existing client found, proceeding with initialization`);
        
        // Store previous company ID (for error recovery)
        const previousCompany = this.companyId;
        console.log(`🔍 [DEBUG] Stored previousCompany: "${previousCompany || 'null'}"`);
        
        // Set the new company ID
        this.companyId = companyId;
        console.log(`🔍 [DEBUG] this.companyId NOW SET TO: "${this.companyId}"`);
        
        try {
            console.log(`🔍 [DEBUG] About to call this.initialize()...`);
            await this.initialize();
            console.log(`🔍 [DEBUG] this.initialize() COMPLETED successfully`);
            console.log(`🔍 [DEBUG] this.companyId AFTER initialize: "${this.companyId}"`);
            console.log(`🔍 [DEBUG] Client stored in clients Map for company: ${companyId}`);
            
            return this.client;
        } catch (error) {
            console.error(`❌ [Company:${companyId}] Failed to initialize:`, error);
            console.log(`🔍 [DEBUG] Restoring previousCompany: "${previousCompany || 'null'}"`);
            
            // Restore previous company ID on error
            this.companyId = previousCompany;
            console.log(`🔍 [DEBUG] this.companyId RESTORED to: "${this.companyId || 'null'}"`);
            
            throw error;
        } finally {
            console.log('='.repeat(60));
            console.log(`🔍 [DEBUG] addCompany FINISHED for companyId: "${companyId}"`);
            console.log(`🔍 [DEBUG] Final this.companyId: "${this.companyId || 'null'}"`);
            console.log('='.repeat(60) + '\n');
        }
    }

    /**
     * Remove client for a company
     * @param {string} companyId - Company ID
     */
    async removeCompany(companyId) {
        const client = this.clients.get(companyId);
        if (!client) {
            console.log(`🏢 [Company:${companyId}] No client found`);
            return;
        }

        console.log(`🏢 [Company:${companyId}] Removing WhatsApp client...`);
        
        // Store current client
        const previousClient = this.client;
        const previousCompany = this.companyId;
        
        // Switch to this client for destruction
        this.client = client;
        this.companyId = companyId;
        
        try {
            await this.safeDestroyClient();
            this.clients.delete(companyId);
            
            // Also remove session folder if needed
            const companySessionPath = path.join(this.sessionPath, `company_${companyId}`);
            if (fs.existsSync(companySessionPath)) {
                console.log(`🗑️ Removing session folder for company ${companyId}`);
                fs.rmSync(companySessionPath, { recursive: true, force: true });
            }
            
            console.log(`✅ [Company:${companyId}] Client removed`);
        } catch (error) {
            console.error(`❌ [Company:${companyId}] Failed to remove:`, error);
        } finally {
            // Restore previous client
            this.client = previousClient;
            this.companyId = previousCompany;
        }
    }

    /**
     * Get all active company clients
     */
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

    // ========== EVENT EMITTER METHODS ==========

    emitQRCode(qrData) {
        this.emit('qr-update', {
            ...qrData,
            timestamp: new Date().toISOString()
        });
    }

    emitStatusChange(status) {
        this.emit('status-change', {
            ...status,
            timestamp: new Date().toISOString()
        });
    }

    emitMessage(messageData) {
        this.emit('message', messageData);
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

    async handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            console.error(`💥 [${clientId}] Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'error',
                message: 'Maximum reconnection attempts reached. Manual intervention required.',
                companyId: this.companyId,
                clientId: clientId
            });

            return;
        }

        this.reconnectAttempts++;
        const delay = 5000 * this.reconnectAttempts;
        const clientId = this.client?.authStrategy?.clientId || 'unknown';

        console.log(`🔄 [${clientId}] Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.emitStatusChange({
            connected: false,
            authenticated: false,
            status: 'reconnecting',
            message: `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
            companyId: this.companyId,
            clientId: clientId
        });

        setTimeout(async () => {
            try {
                await this.initialize();
            } catch (error) {
                console.error(`❌ [${clientId}] Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);

                this.emitStatusChange({
                    connected: false,
                    authenticated: false,
                    status: 'reconnect_failed',
                    message: `Reconnection attempt ${this.reconnectAttempts} failed`,
                    companyId: this.companyId,
                    clientId: clientId
                });
            }
        }, delay);
    }

    async safeDestroyClient() {
        const clientId = this.client?.authStrategy?.clientId || 'unknown';
        
        try {
            if (this.client) {
                console.log(`🛑 [${clientId}] Safely destroying client...`);
                this.isShuttingDown = true;
                
                // Remove from clients map if present
                if (this.companyId) {
                    this.clients.delete(this.companyId);
                }
                
                await this.client.destroy();
                this.client = null;
                console.log(`✅ [${clientId}] Client destroyed safely`);

                this.emitStatusChange({
                    connected: false,
                    authenticated: false,
                    status: 'client_destroyed',
                    message: 'WhatsApp client destroyed',
                    companyId: this.companyId,
                    clientId: clientId
                });
            }
        } catch (error) {
            if (!error.message.includes('Session closed') &&
                !error.message.includes('page has been closed') &&
                !error.message.includes('Protocol error')) {
                console.error(`❌ [${clientId}] Error destroying client:`, error);

                this.emitStatusChange({
                    connected: false,
                    authenticated: false,
                    status: 'error',
                    message: `Error destroying client: ${error.message}`,
                    companyId: this.companyId,
                    clientId: clientId
                });
            } else {
                console.log(`⚠️ [${clientId}] Client destruction error (expected):`, error.message);
            }
            this.client = null;
        } finally {
            this.isShuttingDown = false;
        }
    }

    async clearSession() {
        try {
            console.log('🧹 Clearing session data...');

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'clearing_session',
                message: 'Clearing session data...'
            });

            // Clear company-specific session folder
            if (this.companyId) {
                const companySessionPath = path.join(this.sessionPath, `company_${this.companyId}`);
                if (fs.existsSync(companySessionPath)) {
                    fs.rmSync(companySessionPath, { recursive: true, force: true });
                    console.log(`✅ Session cleared for company ${this.companyId}`);
                }
            } else {
                // Clear all sessions if no company context
                if (fs.existsSync(this.sessionPath)) {
                    fs.rmSync(this.sessionPath, { recursive: true, force: true });
                    console.log('✅ All sessions cleared');
                }
            }

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'session_cleared',
                message: 'Session cleared successfully'
            });

        } catch (error) {
            console.error('❌ Error clearing session:', error);

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'session_error',
                message: `Error clearing session: ${error.message}`
            });
        }
    }

    updateMessageStats(from) {
        this.stats.totalMessages++;
        this.stats.totalCustomers.add(from);
        this.stats.totalChats = this.stats.totalCustomers.size;

        this.broadcastCurrentStats();
    }

    startStatsBroadcasting() {
        // Initial broadcast
        this.broadcastCurrentStats();

        // Set up interval for regular updates
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }

        this.statsInterval = setInterval(() => {
            this.broadcastCurrentStats();
        }, 3000);

        console.log('📊 Started statistics broadcasting');
    }

    stopStatsBroadcasting() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
            console.log('📊 Stopped statistics broadcasting');
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
            lastUpdated: new Date().toISOString(),
            companyId: this.companyId,
            activeCompanies: this.clients.size
        };

        this.emitStatsUpdate(statsData);
    }

    async displayBotInfo() {
        try {
            if (!this.client) {
                console.log('📊 Bot info: Client not initialized');
                return;
            }

            let info = null;
            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            
            // Try multiple methods to get bot info
            if (typeof this.client.getInfo === 'function') {
                try {
                    info = await this.client.getInfo();
                } catch (e) {
                    // Silent fail
                }
            }
            
            if (!info && this.client.info) {
                info = this.client.info;
            }
            
            if (!info) {
                const state = await this.client.getState();
                info = {
                    pushname: 'WhatsApp User',
                    platform: 'WhatsApp',
                    waVersion: 'Unknown',
                    wid: { user: 'Connected' },
                    state: state
                };
            }

            this.botInfo = {
                pushname: info?.pushname || 'Connected',
                platform: info?.platform || 'WhatsApp',
                version: info?.waVersion || info?.version || 'Unknown',
                phoneNumber: info?.wid?.user || 'Connected',
                connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString(),
                clientId: clientId,
                companyId: this.companyId
            };

            console.log('🤖 Bot Information:');
            console.log('───────────────────');
            console.log(`📱 WhatsApp: ${this.botInfo.pushname}`);
            console.log(`📞 Phone: ${this.botInfo.phoneNumber}`);
            console.log(`🌐 Platform: ${this.botInfo.platform}`);
            console.log(`📊 Version: ${this.botInfo.version}`);
            console.log(`🏢 Company: ${this.companyId || 'Single tenant'}`);
            console.log(`🆔 Client ID: ${clientId}`);
            console.log(`📁 Session: ${this.sessionPath}/company_${this.companyId || 'default'}`);
            console.log('───────────────────\n');

        } catch (error) {
            // Silent fail
        }
    }

    async handleInitializationError(error) {
        const clientId = this.client?.authStrategy?.clientId || 'unknown';
        console.error(`❌ [${clientId}] Initialization error:`, error.message);

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`💥 [${clientId}] Max reconnection attempts (${this.maxReconnectAttempts}) reached. Manual intervention required.`);
            
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'failed',
                message: 'Max reconnection attempts reached. Please restart manually.',
                companyId: this.companyId,
                clientId: clientId
            });
            
            return;
        }

        this.emitStatusChange({
            connected: false,
            authenticated: false,
            status: 'error',
            message: `Initialization error: ${error.message}`,
            companyId: this.companyId,
            clientId: clientId
        });

        // Session/auth related errors - clear session and retry
        if (error.message.includes('session') || 
            error.message.includes('auth') || 
            error.message.includes('context') ||
            error.message.includes('Authentication') ||
            error.message.includes('credentials')) {
            
            console.log(`🔄 [${clientId}] Session/context issue detected. Clearing session and retrying in 10 seconds... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'retrying',
                message: `Session issue detected. Retrying... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`,
                companyId: this.companyId,
                clientId: clientId
            });

            try {
                await this.clearSession();
                console.log(`✅ [${clientId}] Session cleared successfully`);
            } catch (clearError) {
                console.error(`❌ [${clientId}] Failed to clear session:`, clearError.message);
            }

            this.reconnectAttempts++;

            setTimeout(() => {
                this.initialize().catch((err) => {
                    console.error(`❌ [${clientId}] Retry initialization failed:`, err.message);
                });
            }, 10000);
            
        } else {
            console.log(`🔄 [${clientId}] Non-session error. Attempting reconnection...`);
            await this.handleReconnection();
        }
    }

    async handleMessageError(message, error) {
        try {
            if (error.message.includes('Execution context was destroyed') ||
                error.message.includes('Session closed') ||
                error.message.includes('page has been closed')) {
                return;
            }

            await message.reply(
                '⚠️ We encountered a temporary issue. Please try your request again.'
            );

            const clientId = this.client?.authStrategy?.clientId || 'unknown';
            
            this.emitStatusChange({
                connected: this.isConnected,
                authenticated: this.isAuthenticated,
                status: 'message_error',
                message: `Failed to process message from ${message.from}: ${error.message}`,
                companyId: this.companyId,
                clientId: clientId
            });
        } catch (replyError) {
            // Silent fail
        }
    }

    // ✅ Get current QR with expiry info
    getCurrentQR() {
        if (!this.currentQR || !this.isWaitingForScan) {
            return null;
        }
        
        const timeLeft = this.qrExpiryTime - (Date.now() - this.qrGeneratedAt);
        
        if (timeLeft <= 0) {
            return null;
        }
        
        return {
            qr: this.currentQR,
            expiresIn: Math.max(0, Math.floor(timeLeft / 1000)),
            generatedAt: this.qrGeneratedAt,
            isValid: timeLeft > 0,
            companyId: this.companyId,
            clientId: this.client?.authStrategy?.clientId
        };
    }

    // ✅ Register WebSocket client for QR
    registerQRClient(clientId) {
        this.qrWebSocketClients.add(clientId);
        console.log(`🔗 New QR WebSocket client: ${clientId} (Total: ${this.qrWebSocketClients.size})`);
        
        // Send current QR immediately if available
        const qrData = this.getCurrentQR();
        if (qrData) {
            return qrData;
        }
        return null;
    }

    // ✅ Unregister WebSocket client
    unregisterQRClient(clientId, code, reason, duration) {
        this.qrWebSocketClients.delete(clientId);
        console.log(`🔌 QR WebSocket client disconnected: ${clientId} (Remaining: ${this.qrWebSocketClients.size})`);
    }

    getStatus() {
        const clientId = this.client?.authStrategy?.clientId || 'unknown';
        
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
                completedOrders: this.stats.completedOrders
            },
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            uptime: this.getUptime(),
            formattedUptime: this.getFormattedUptime(),
            activeClients: this.qrWebSocketClients.size,
            companyId: this.companyId,
            clientId: clientId,
            multiTenant: {
                activeCompanies: this.clients.size,
                companies: this.getAllClients()
            },
            sessionPath: `${this.sessionPath}/company_${this.companyId || 'default'}`
        };
    }

    async sendMessage(phoneNumber, message) {
        try {
            if (!this.client || !this.isConnected) {
                throw new Error('WhatsApp client not connected');
            }

            const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
            const clientId = this.client?.authStrategy?.clientId || 'unknown';

            console.log(`📤 [${clientId}] Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
            await this.client.sendMessage(formattedNumber, message);

            console.log(`✅ [${clientId}] Message sent successfully`);
            return { success: true, message: 'Message sent successfully' };

        } catch (error) {
            console.error('❌ Send message error:', error);
            return { success: false, error: error.message };
        }
    }

    async shutdown() {
        console.log('\n🛑 Initiating graceful shutdown...');

        this.emitStatusChange({
            connected: false,
            authenticated: false,
            status: 'shutdown',
            message: 'Bot is shutting down...'
        });

        try {
            this.stopStatsBroadcasting();
            
            // Shutdown all company clients
            const companies = Array.from(this.clients.keys());
            for (const companyId of companies) {
                await this.removeCompany(companyId);
            }
            
            await this.safeDestroyClient();

            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            this.isWaitingForScan = false;
            this.reconnectAttempts = 0;
            this.connectionTime = null;
            this.qrWebSocketClients.clear();

            console.log('✅ Bot shutdown completed gracefully');

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'shutdown_complete',
                message: 'Bot shutdown completed'
            });
        } catch (error) {
            console.error('❌ Error during shutdown:', error);

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'shutdown_error',
                message: `Error during shutdown: ${error.message}`
            });
        }
    }

    async logout() {
        console.log('\n🚪 Manual logout requested...');

        this.emitStatusChange({
            connected: false,
            authenticated: false,
            status: 'logging_out',
            message: 'Manual logout requested...'
        });

        // Store companyId before logout
        const currentCompanyId = this.companyId;

        try {
            this.isShuttingDown = true;
            await this.safeDestroyClient();
            await this.clearSession();

            this.currentQR = null;
            this.isWaitingForScan = false;
            this.isConnected = false;
            this.isAuthenticated = false;
            this.connectionTime = null;
            this.qrWebSocketClients.clear();

            console.log('🔓 Logout completed. QR code will be required on next start.');

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'logged_out',
                message: 'Logout completed. QR code required.'
            });

            // Re-initialize WITH the same companyId after logout
            setTimeout(() => {
                this.isShuttingDown = false;
                if (currentCompanyId) {
                    this.initializeForCompany(currentCompanyId).catch(console.error);
                } else {
                    this.initialize().catch(console.error);
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Logout error:', error);

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'error',
                message: `Logout error: ${error.message}`
            });

            this.isShuttingDown = false;
        }
    }

    async restart() {
        console.log('\n🔄 Manual restart requested...');

        this.emitStatusChange({
            connected: false,
            authenticated: false,
            status: 'restarting',
            message: 'Manual restart requested...'
        });

        try {
            await this.shutdown();
            setTimeout(async () => {
                await this.initialize();
            }, 3000);
        } catch (error) {
            console.error('❌ Restart error:', error);

            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'error',
                message: `Restart error: ${error.message}`
            });
        }
    }

    getUptime() {
        if (!this.connectionTime) return 0;
        return Math.floor((new Date() - this.connectionTime) / 1000);
    }

    getFormattedUptime() {
        const seconds = this.getUptime();
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    trackNewOrder(orderData = {}) {
        this.stats.totalOrders++;

        this.emitOrderUpdate({
            type: 'new_order',
            orderId: orderData.orderId || `order_${Date.now()}`,
            customer: orderData.customer || 'Unknown',
            totalOrders: this.stats.totalOrders,
            pendingOrders: this.stats.pendingOrders,
            completedOrders: this.stats.completedOrders,
            companyId: this.companyId
        });

        this.broadcastCurrentStats();
    }

    trackPendingOrder(orderData = {}) {
        this.stats.pendingOrders++;

        this.emitOrderUpdate({
            type: 'pending_order',
            orderId: orderData.orderId || `order_${Date.now()}`,
            customer: orderData.customer || 'Unknown',
            totalOrders: this.stats.totalOrders,
            pendingOrders: this.stats.pendingOrders,
            completedOrders: this.stats.completedOrders,
            companyId: this.companyId
        });

        this.broadcastCurrentStats();
    }

    trackCompletedOrder(orderData = {}) {
        this.stats.completedOrders++;
        if (this.stats.pendingOrders > 0) {
            this.stats.pendingOrders--;
        }

        this.emitOrderUpdate({
            type: 'completed_order',
            orderId: orderData.orderId || `order_${Date.now()}`,
            customer: orderData.customer || 'Unknown',
            totalOrders: this.stats.totalOrders,
            pendingOrders: this.stats.pendingOrders,
            completedOrders: this.stats.completedOrders,
            companyId: this.companyId
        });

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
        throw new Error('WhatsAppBot not initialized. Call createWhatsAppBot() first.');
    }
    return botInstance;
}

// Default export for backward compatibility
const bot = createWhatsAppBot();

export { createWhatsAppBot, getWhatsAppBot };
export default bot;