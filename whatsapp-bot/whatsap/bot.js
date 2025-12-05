// import pkg from 'whatsapp-web.js';
// import qrcode from 'qrcode-terminal';
// import dotenv from 'dotenv';
// import handleMessage from "../whatsap/messageHandler.js";
// import fs from 'fs';
// import path from 'path';
// import { qrSocketServer } from '../services/qrSocketServer.js';

// dotenv.config();

// const { Client, LocalAuth } = pkg;

// class WhatsAppBot {
//     constructor() {
//         this.client = null;
//         this.isConnected = false;
//         this.isAuthenticated = false;
//         this.sessionPath = './sessions';
//         this.currentQR = null;
//     }

//     async initialize() {
//         try {
//             console.log('🚀 Initializing WhatsApp E-commerce Bot...');
            
//             console.log('🔗 Connecting to Next.js APIs...');
            
//             // Initialize WhatsApp client
//             await this.initializeClient();
            
//         } catch (error) {
//             console.error('❌ Bot initialization failed:', error);
//             await this.handleInitializationError(error);
//         }
//     }

//     initializeClient() {
//         return new Promise((resolve, reject) => {
//             try {
//                 // Ensure session directory exists
//                 if (!fs.existsSync(this.sessionPath)) {
//                     fs.mkdirSync(this.sessionPath, { recursive: true });
//                 }

//                 console.log('📁 Session path:', path.resolve(this.sessionPath));
                
//                 this.client = new Client({
//                     authStrategy: new LocalAuth({
//                         clientId: "ecommerce-bot",
//                         dataPath: this.sessionPath
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
//                             '--disable-gpu'
//                         ],
//                         timeout: 60000
//                     },
//                     webVersionCache: {
//                         type: 'remote',
//                         remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
//                     }
//                 });

//                 this.setupEventHandlers(resolve, reject);
//                 this.client.initialize();

//             } catch (error) {
//                 reject(new Error(`Client initialization failed: ${error.message}`));
//             }
//         });
//     }

//     setupEventHandlers(resolve, reject) {
//         let qrGenerated = false;

//         this.client.on('qr', async (qr) => {
//             this.currentQR = qr;
            
//             // Broadcast QR to all connected frontend clients
//             qrSocketServer.broadcastQR(qr);
//             qrSocketServer.broadcastStatus('qr_required', 'Scan QR code to connect WhatsApp');
            
//             if (!qrGenerated) {
//                 console.log('\n📱 WhatsApp Authentication Required');
//                 console.log('====================================');
//                 console.log('1. Open WhatsApp on your phone');
//                 console.log('2. Go to Settings → Linked Devices → Link a Device');
//                 console.log('3. Scan the QR code below:\n');
//                 qrcode.generate(qr, { small: true });
//                 console.log('\n====================================');
//                 console.log('🌐 QR code is also available on the web dashboard');
//                 qrGenerated = true;
//             }
//         });

//         this.client.on('ready', () => {
//             this.isConnected = true;
//             this.isAuthenticated = true;
//             this.currentQR = null;
            
//             console.log('\n✅ WhatsApp Bot Successfully Initialized');
//             console.log('========================================');
//             console.log('🤖 E-commerce Bot Status: ONLINE');
//             console.log('📱 Phone Number: Connected');
//             console.log('💼 Session: PERSISTENT');
//             console.log('🔗 Connected to: Next.js APIs');
//             console.log('🛍️  Ready to process customer orders');
//             console.log('========================================\n');
            
//             // Broadcast connection status
//             qrSocketServer.broadcastStatus('connected', 'WhatsApp is connected and ready');
            
//             // Display bot information
//             this.displayBotInfo();
            
//             resolve();
//         });

//         this.client.on('authenticated', () => {
//             this.isAuthenticated = true;
//             this.currentQR = null;
//             console.log('🔐 Authentication successful - Session saved');
//             qrSocketServer.broadcastStatus('authenticated', 'WhatsApp authentication successful');
//         });

//         this.client.on('auth_failure', (error) => {
//             this.isAuthenticated = false;
//             console.error('❌ Authentication failed:', error);
//             qrSocketServer.broadcastStatus('auth_failed', 'Authentication failed. New QR code will be generated.');
//             console.log('🔄 Will attempt to generate new QR code...');
//         });

//         this.client.on('disconnected', (reason) => {
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;
            
//             console.log(`🔌 Disconnected: ${reason}`);
//             qrSocketServer.broadcastStatus('disconnected', `WhatsApp disconnected: ${reason}`);
            
//             if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {
//                 console.log('🔄 Login issue detected. Generating new QR code...');
//                 qrSocketServer.broadcastStatus('qr_required', 'Reconnecting WhatsApp...');
//             } else {
//                 console.log('🔄 Attempting to reconnect in 5 seconds...');
//                 qrSocketServer.broadcastStatus('reconnecting', 'Attempting to reconnect...');
//                 setTimeout(() => {
//                     this.initialize().catch(console.error);
//                 }, 5000);
//             }
//         });

//         this.client.on('message', async (message) => {
//             // Ignore status broadcasts and group messages
//             if (message.from === 'status@broadcast' || message.isGroupMsg) {
//                 return;
//             }
            
//             try {
//                 // Log the message with proper phone number formatting
//                 const phoneNumber = this.formatPhoneNumber(message.from);
//                 console.log(`📱 Message from ${phoneNumber}: ${message.body}`);
                
//                 await handleMessage(message, this.client);
//             } catch (error) {
//                 console.error('❌ Message processing error:', error);
//                 await this.handleMessageError(message, error);
//             }
//         });

//         // Monitor connection state
//         this.client.on('change_state', (state) => {
//             console.log(`🔄 Connection state: ${state}`);
//             qrSocketServer.broadcastStatus('state_change', `Connection state: ${state}`);
//         });

//         // Loading screen events
//         this.client.on('loading_screen', (percent, message) => {
//             console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);
//             qrSocketServer.broadcastStatus('loading', `Loading: ${percent}% - ${message}`);
//         });
//     }

//     // Format phone numbers properly for Indian numbers
//     formatPhoneNumber(whatsappId) {
//         try {
//             // Remove any suffixes like @c.us, @lid, etc.
//             let phoneNumber = whatsappId.split('@')[0];
            
//             // Handle Indian phone numbers (remove country code if present)
//             if (phoneNumber.startsWith('91') && phoneNumber.length > 10) {
//                 // Remove country code and format
//                 phoneNumber = phoneNumber.substring(2);
//             }
            
//             // Format as Indian phone number
//             if (phoneNumber.length === 10) {
//                 return `+91 ${phoneNumber.substring(0, 5)} ${phoneNumber.substring(5)}`;
//             }
            
//             return `+${phoneNumber}`;
            
//         } catch (error) {
//             return whatsappId; // Return original if formatting fails
//         }
//     }

//     // Display bot information
//     async displayBotInfo() {
//         try {
//             const info = await this.client.getInfo();
//             console.log('🤖 Bot Information:');
//             console.log('───────────────────');
//             console.log(`📱 WhatsApp: ${info.pushname || 'Connected'}`);
//             console.log(`🌐 Platform: ${info.platform || 'Unknown'}`);
//             console.log(`📊 Version: ${info.waVersion || 'Unknown'}`);
//             console.log(`🔗 API: ${process.env.NEXTJS_API_URL || 'http://localhost:3000/api'}`);
//             console.log('───────────────────\n');
            
//             // Broadcast bot info
//             qrSocketServer.broadcastStatus('bot_info', {
//                 pushname: info.pushname,
//                 platform: info.platform,
//                 version: info.waVersion
//             });
            
//         } catch (error) {
//             console.log('📊 Bot info: Connected to WhatsApp');
//         }
//     }

//     async handleInitializationError(error) {
//         console.error('❌ Initialization error:', error.message);
//         qrSocketServer.broadcastStatus('error', `Initialization error: ${error.message}`);
        
//         // For session-related errors, wait and retry
//         if (error.message.includes('session') || error.message.includes('auth')) {
//             console.log('🔄 Session issue detected. Retrying in 10 seconds...');
//             qrSocketServer.broadcastStatus('retrying', 'Session issue detected. Retrying...');
//             setTimeout(() => {
//                 this.initialize().catch(console.error);
//             }, 10000);
//         }
//     }

//     async handleMessageError(message, error) {
//         try {
//             await message.reply(
//                 '⚠️ We encountered a temporary issue. Please try your request again.'
//             );
//         } catch (replyError) {
//             console.error('❌ Failed to send error response:', replyError);
//         }
//     }

//     // Get current QR code (for API endpoints)
//     getCurrentQR() {
//         return this.currentQR;
//     }

//     // Get connection status
//     getStatus() {
//         return {
//             connected: this.isConnected,
//             authenticated: this.isAuthenticated,
//             hasQR: !!this.currentQR
//         };
//     }

//     async shutdown() {
//         console.log('\n🛑 Initiating graceful shutdown...');
//         qrSocketServer.broadcastStatus('shutdown', 'Bot is shutting down...');
        
//         try {
//             if (this.client) {
//                 await this.client.destroy();
//                 this.client = null;
//             }
            
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;
//             console.log('✅ Bot shutdown completed gracefully');
//         } catch (error) {
//             console.error('❌ Error during shutdown:', error);
//         }
//     }

//     // Method to manually logout (clear session)
//     async logout() {
//         console.log('\n🚪 Manual logout requested...');
//         qrSocketServer.broadcastStatus('logging_out', 'Manual logout requested...');
        
//         try {
//             if (this.client) {
//                 await this.client.logout();
//             }
            
//             // Clear session files
//             if (fs.existsSync(this.sessionPath)) {
//                 fs.rmSync(this.sessionPath, { recursive: true, force: true });
//                 console.log('✅ Session cleared successfully');
//             }
            
//             this.currentQR = null;
//             console.log('🔓 Logout completed. QR code will be required on next start.');
//             qrSocketServer.broadcastStatus('logged_out', 'Logout completed. QR code required.');
//         } catch (error) {
//             console.error('❌ Logout error:', error);
//             qrSocketServer.broadcastStatus('error', `Logout error: ${error.message}`);
//         }
//     }
// }

// // Process event handlers for graceful shutdown
// process.on('SIGINT', async () => {
//     console.log('\n🛑 Received shutdown signal (SIGINT)');
//     await bot.shutdown();
//     process.exit(0);
// });

// process.on('SIGTERM', async () => {
//     console.log('\n🛑 Received termination signal (SIGTERM)');
//     await bot.shutdown();
//     process.exit(0);
// });

// // Global error handlers
// process.on('uncaughtException', (error) => {
//     console.error('❌ Uncaught Exception:', error);
//     qrSocketServer.broadcastStatus('error', `Uncaught exception: ${error.message}`);
// });

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('❌ Unhandled Rejection at:', promise);
//     console.error('Reason:', reason);
//     qrSocketServer.broadcastStatus('error', `Unhandled rejection: ${reason}`);
// });

// // Bot instance and startup
// const bot = new WhatsAppBot();

// // Initialize bot
// bot.initialize().catch((error) => {
//     console.error('❌ Bot startup failed:', error);
//     qrSocketServer.broadcastStatus('error', `Bot startup failed: ${error.message}`);
//     process.exit(1);
// });

// export default bot;



// import pkg from 'whatsapp-web.js';
// import qrcode from 'qrcode-terminal';
// import dotenv from 'dotenv';
// import handleMessage from "./messageHandler.js";
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { qrSocketServer } from '../services/qrSocketServer.js';

// dotenv.config();

// const { Client, LocalAuth } = pkg;

// // ES module equivalent of __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// class WhatsAppBot {
//     constructor() {
//         this.client = null;
//         this.isConnected = false;
//         this.isAuthenticated = false;
//         this.sessionPath = path.join(__dirname, 'sessions');
//         this.currentQR = null;
//         this.reconnectAttempts = 0;
//         this.maxReconnectAttempts = 5;
//         this.isInitializing = false;
        
//         // Initialize statistics
//         this.stats = {
//             totalOrders: 0,
//             totalChats: 0,
//             totalCustomers: new Set(),
//             totalMessages: 0
//         };
        
//         this.statsInterval = null;
//     }

//     async initialize() {
//         if (this.isInitializing) {
//             console.log('🔄 Bot initialization already in progress...');
//             return;
//         }

//         this.isInitializing = true;
        
//         try {
//             console.log('🚀 Initializing WhatsApp E-commerce Bot...');
            
//             // Clear any existing client
//             if (this.client) {
//                 await this.safeDestroyClient();
//             }

//             // Initialize WhatsApp client
//             await this.initializeClient();
            
//             this.reconnectAttempts = 0; // Reset on successful initialization
//             console.log('✅ Bot initialization completed successfully');
            
//         } catch (error) {
//             console.error('❌ Bot initialization failed:', error);
//             await this.handleInitializationError(error);
//         } finally {
//             this.isInitializing = false;
//         }
//     }

//     initializeClient() {
//         return new Promise((resolve, reject) => {
//             try {
//                 // Ensure session directory exists
//                 if (!fs.existsSync(this.sessionPath)) {
//                     fs.mkdirSync(this.sessionPath, { recursive: true });
//                 }

//                 console.log('📁 Session path:', this.sessionPath);
                
//                 this.client = new Client({
//                     authStrategy: new LocalAuth({
//                         clientId: "ecommerce-bot",
//                         dataPath: this.sessionPath
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
//                             '--single-process',
//                             '--no-zygote'
//                         ],
//                         timeout: 60000,
//                         ignoreHTTPSErrors: true
//                     },
//                     webVersionCache: {
//                         type: 'remote',
//                         remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
//                     }
//                 });

//                 this.setupEventHandlers(resolve, reject);
                
//                 console.log('🔧 Starting client initialization...');
//                 this.client.initialize().catch(reject);

//             } catch (error) {
//                 reject(new Error(`Client initialization failed: ${error.message}`));
//             }
//         });
//     }

//     setupEventHandlers(resolve, reject) {
//         let qrGenerated = false;
//         let initializationTimeout;

//         // Set initialization timeout (2 minutes)
//         initializationTimeout = setTimeout(() => {
//             if (!this.isConnected) {
//                 const error = new Error('Client initialization timeout - taking too long to connect');
//                 console.error('❌', error.message);
//                 reject(error);
//             }
//         }, 120000);

//         this.client.on('qr', async (qr) => {
//             clearTimeout(initializationTimeout);
            
//             this.currentQR = qr;
            
//             // Broadcast QR to frontend
//             qrSocketServer.broadcastQR(qr);
//             qrSocketServer.broadcastStatus('qr_required', 'Scan QR code to connect WhatsApp');
            
//             if (!qrGenerated) {
//                 console.log('\n📱 WhatsApp Authentication Required');
//                 console.log('====================================');
//                 console.log('1. Open WhatsApp on your phone');
//                 console.log('2. Go to Settings → Linked Devices → Link a Device');
//                 console.log('3. Scan the QR code below:\n');
//                 qrcode.generate(qr, { small: true });
//                 console.log('\n====================================');
//                 console.log('🌐 QR code is also available on the web dashboard');
//                 qrGenerated = true;
//             }
//         });

//         this.client.on('ready', () => {
//             clearTimeout(initializationTimeout);
            
//             this.isConnected = true;
//             this.isAuthenticated = true;
//             this.currentQR = null;
//             this.reconnectAttempts = 0;
            
//             console.log('\n✅ WhatsApp Bot Successfully Initialized');
//             console.log('========================================');
//             console.log('🤖 E-commerce Bot Status: ONLINE');
//             console.log('📱 Phone Number: Connected');
//             console.log('💼 Session: PERSISTENT');
//             console.log('🛍️  Ready to process customer orders');
//             console.log('========================================\n');
            
//             // Broadcast connection status
//             qrSocketServer.broadcastStatus('connected', 'WhatsApp is connected and ready');
            
//             // Start stats broadcasting
//             this.startStatsBroadcasting();
            
//             // Display bot information
//             this.displayBotInfo();
            
//             resolve();
//         });

//         this.client.on('authenticated', () => {
//             this.isAuthenticated = true;
//             this.currentQR = null;
//             console.log('🔐 Authentication successful - Session saved');
//             qrSocketServer.broadcastStatus('authenticated', 'WhatsApp authentication successful');
//         });

//         this.client.on('auth_failure', (error) => {
//             clearTimeout(initializationTimeout);
            
//             this.isAuthenticated = false;
//             console.error('❌ Authentication failed:', error);
//             qrSocketServer.broadcastStatus('auth_failed', 'Authentication failed. New QR code will be generated.');
            
//             reject(new Error(`Authentication failed: ${error.message}`));
//         });

//         this.client.on('disconnected', async (reason) => {
//             console.log(`🔌 Disconnected: ${reason}`);
            
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;

//             // Stop stats broadcasting when disconnected
//             this.stopStatsBroadcasting();
            
//             qrSocketServer.broadcastStatus('disconnected', `WhatsApp disconnected: ${reason}`);
            
//             // Handle different disconnect reasons
//             if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {
//                 console.log('🔄 Login issue detected. Generating new QR code...');
//                 qrSocketServer.broadcastStatus('qr_required', 'Reconnecting WhatsApp...');
                
//                 // Clear session and restart
//                 await this.clearSession();
//                 setTimeout(() => {
//                     this.initialize().catch(console.error);
//                 }, 3000);
//             } else {
//                 await this.handleReconnection();
//             }
//         });

//         this.client.on('message', async (message) => {
//             if (message.from === 'status@broadcast' || message.isGroupMsg) return;
            
//             try {
//                 // Update statistics for every message
//                 this.updateMessageStats(message.from);
                
//                 await handleMessage(message, this.client);
//             } catch (error) {
//                 console.error('❌ Message processing error:', error);
//                 await this.handleMessageError(message, error);
//             }
//         });

//         // Monitor connection state
//         this.client.on('change_state', (state) => {
//             console.log(`🔄 Connection state: ${state}`);
//             qrSocketServer.broadcastStatus('state_change', `Connection state: ${state}`);
//         });

//         // Loading screen events
//         this.client.on('loading_screen', (percent, message) => {
//             console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);
//             qrSocketServer.broadcastStatus('loading', `Loading: ${percent}% - ${message}`);
//         });

//         // Handle page errors
//         this.client.on('page_error', (error) => {
//             console.error('❌ Page error:', error);
//         });
//     }

//     async handleReconnection() {
//         if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//             console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
//             qrSocketServer.broadcastStatus('error', 'Maximum reconnection attempts reached. Manual intervention required.');
//             return;
//         }

//         this.reconnectAttempts++;
//         const delay = 5000 * this.reconnectAttempts; // Exponential backoff
        
//         console.log(`🔄 Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
//         qrSocketServer.broadcastStatus('reconnecting', `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

//         setTimeout(async () => {
//             try {
//                 await this.initialize();
//             } catch (error) {
//                 console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);
//             }
//         }, delay);
//     }

//     async safeDestroyClient() {
//         try {
//             if (this.client) {
//                 console.log('🛑 Safely destroying existing client...');
//                 await this.client.destroy();
//                 this.client = null;
//                 console.log('✅ Client destroyed safely');
//             }
//         } catch (error) {
//             console.error('❌ Error destroying client:', error);
//             this.client = null; // Force nullify even if destruction fails
//         }
//     }

//     async clearSession() {
//         try {
//             console.log('🧹 Clearing session data...');
//             if (fs.existsSync(this.sessionPath)) {
//                 fs.rmSync(this.sessionPath, { recursive: true, force: true });
//                 console.log('✅ Session cleared successfully');
//             }
//         } catch (error) {
//             console.error('❌ Error clearing session:', error);
//         }
//     }

//     // Update statistics when message is received
//     updateMessageStats(from) {
//         this.stats.totalMessages++;
//         this.stats.totalCustomers.add(from);
//         this.stats.totalChats = this.stats.totalCustomers.size;
        
//         // Broadcast updated stats immediately
//         this.broadcastCurrentStats();
//     }

//     // Method to track new orders
//     trackNewOrder() {
//         this.stats.totalOrders++;
//         this.broadcastCurrentStats();
//     }

//     // Start broadcasting stats periodically
//     startStatsBroadcasting() {
//         // Broadcast initial stats
//         this.broadcastCurrentStats();
        
//         // Update stats every 3 seconds
//         this.statsInterval = setInterval(() => {
//             this.broadcastCurrentStats();
//         }, 3000);
        
//         console.log('📊 Started statistics broadcasting');
//     }

//     // Stop broadcasting stats
//     stopStatsBroadcasting() {
//         if (this.statsInterval) {
//             clearInterval(this.statsInterval);
//             this.statsInterval = null;
//             console.log('📊 Stopped statistics broadcasting');
//         }
//     }

//     // Broadcast current statistics
//     broadcastCurrentStats() {
//         const statsData = {
//             totalOrders: this.stats.totalOrders,
//             totalChats: this.stats.totalChats,
//             totalCustomers: this.stats.totalCustomers.size,
//             totalMessages: this.stats.totalMessages,
//             lastUpdated: new Date().toISOString()
//         };
        
//         qrSocketServer.broadcastStats(statsData);
//     }

//     // Display bot information
//     async displayBotInfo() {
//         try {
//             const info = await this.client.getInfo();
//             console.log('🤖 Bot Information:');
//             console.log('───────────────────');
//             console.log(`📱 WhatsApp: ${info.pushname || 'Connected'}`);
//             console.log(`🌐 Platform: ${info.platform || 'Unknown'}`);
//             console.log(`📊 Version: ${info.waVersion || 'Unknown'}`);
//             console.log('───────────────────\n');
            
//             // Broadcast bot info
//             qrSocketServer.broadcastStatus('bot_info', {
//                 pushname: info.pushname,
//                 platform: info.platform,
//                 version: info.waVersion
//             });
            
//         } catch (error) {
//             console.log('📊 Bot info: Connected to WhatsApp');
//         }
//     }

//     async handleInitializationError(error) {
//         console.error('❌ Initialization error:', error.message);
//         qrSocketServer.broadcastStatus('error', `Initialization error: ${error.message}`);
        
//         // For session-related errors, wait and retry
//         if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {
//             console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');
//             qrSocketServer.broadcastStatus('retrying', 'Session issue detected. Retrying...');
            
//             // Clear session and retry
//             await this.clearSession();
            
//             setTimeout(() => {
//                 this.initialize().catch(console.error);
//             }, 10000);
//         } else {
//             // For other errors, use reconnection logic
//             await this.handleReconnection();
//         }
//     }

//     async handleMessageError(message, error) {
//         try {
//             // Don't send error response for context destroyed errors (user won't see it anyway)
//             if (error.message.includes('Execution context was destroyed')) {
//                 console.log('⚠️ Message failed due to context destruction - skipping error response');
//                 return;
//             }
            
//             await message.reply(
//                 '⚠️ We encountered a temporary issue. Please try your request again.'
//             );
//         } catch (replyError) {
//             console.error('❌ Failed to send error response:', replyError);
//         }
//     }

//     // Get current QR code (for API endpoints)
//     getCurrentQR() {
//         return this.currentQR;
//     }

//     // Get connection status
//     getStatus() {
//         return {
//             connected: this.isConnected,
//             authenticated: this.isAuthenticated,
//             hasQR: !!this.currentQR,
//             stats: {
//                 totalOrders: this.stats.totalOrders,
//                 totalChats: this.stats.totalChats,
//                 totalCustomers: this.stats.totalCustomers.size,
//                 totalMessages: this.stats.totalMessages
//             },
//             reconnectAttempts: this.reconnectAttempts,
//             maxReconnectAttempts: this.maxReconnectAttempts
//         };
//     }

//     async shutdown() {
//         console.log('\n🛑 Initiating graceful shutdown...');
//         qrSocketServer.broadcastStatus('shutdown', 'Bot is shutting down...');
        
//         try {
//             this.stopStatsBroadcasting();
//             await this.safeDestroyClient();
            
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;
//             this.reconnectAttempts = 0;
            
//             console.log('✅ Bot shutdown completed gracefully');
//         } catch (error) {
//             console.error('❌ Error during shutdown:', error);
//         }
//     }

//     // Method to manually logout (clear session)
//     async logout() {
//         console.log('\n🚪 Manual logout requested...');
//         qrSocketServer.broadcastStatus('logging_out', 'Manual logout requested...');
        
//         try {
//             await this.safeDestroyClient();
//             await this.clearSession();
            
//             this.currentQR = null;
//             this.isConnected = false;
//             this.isAuthenticated = false;
            
//             console.log('🔓 Logout completed. QR code will be required on next start.');
//             qrSocketServer.broadcastStatus('logged_out', 'Logout completed. QR code required.');
            
//             // Restart the bot
//             setTimeout(() => {
//                 this.initialize().catch(console.error);
//             }, 2000);
            
//         } catch (error) {
//             console.error('❌ Logout error:', error);
//             qrSocketServer.broadcastStatus('error', `Logout error: ${error.message}`);
//         }
//     }
// }

// // Enhanced global error handlers
// process.on('SIGINT', async () => {
//     console.log('\n🛑 Received shutdown signal (SIGINT)');
//     await bot.shutdown();
//     process.exit(0);
// });

// process.on('SIGTERM', async () => {
//     console.log('\n🛑 Received termination signal (SIGTERM)');
//     await bot.shutdown();
//     process.exit(0);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//     console.error('❌ Uncaught Exception:', error);
//     qrSocketServer.broadcastStatus('error', `Uncaught exception: ${error.message}`);
    
//     // Don't exit for Puppeteer context errors
//     if (error.message.includes('Execution context was destroyed')) {
//         console.log('⚠️ Context error detected - continuing operation');
//         return;
//     }
// });

// // Handle unhandled rejections
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('❌ Unhandled Rejection at:', promise);
//     console.error('Reason:', reason);
    
//     // Don't log context destruction errors as critical
//     if (reason.message && reason.message.includes('Execution context was destroyed')) {
//         console.log('⚠️ Context destruction detected in promise - this is normal during reconnections');
//         return;
//     }
    
//     qrSocketServer.broadcastStatus('error', `Unhandled rejection: ${reason.message || reason}`);
// });

// // Bot instance and startup
// const bot = new WhatsAppBot();

// // Initialize bot with retry logic
// const startBot = async (attempt = 1) => {
//     try {
//         await bot.initialize();
//     } catch (error) {
//         console.error(`❌ Bot startup failed (attempt ${attempt}):`, error);
        
//         if (attempt < 3) {
//             console.log(`🔄 Retrying startup in 10 seconds... (${attempt + 1}/3)`);
//             setTimeout(() => startBot(attempt + 1), 10000);
//         } else {
//             console.error('💥 Maximum startup attempts reached. Exiting.');
//             qrSocketServer.broadcastStatus('error', 'Bot failed to start after multiple attempts');
//             process.exit(1);
//         }
//     }
// };

// // Start the bot
// startBot().catch(console.error);

// export default bot;






// import pkg from 'whatsapp-web.js';
// import qrcode from 'qrcode-terminal';
// import dotenv from 'dotenv';
// import handleMessage from "./messageHandler.js";
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { qrSocketServer } from '../services/qrSocketServer.js';

// dotenv.config();

// const { Client, LocalAuth } = pkg;

// // ES module equivalent of __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// class WhatsAppBot {
//     constructor() {
//         this.client = null;
//         this.isConnected = false;
//         this.isAuthenticated = false;
//         this.sessionPath = path.join(__dirname, 'sessions');
//         this.currentQR = null;
//         this.reconnectAttempts = 0;
//         this.maxReconnectAttempts = 5;
//         this.isInitializing = false;
//         this.connectionTime = null;
//         this.botInfo = null;
        
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
//     }

//     // Broadcast methods using the socket server
//     broadcastQR(qr) {
//         if (qrSocketServer && qrSocketServer.broadcastQR) {
//             qrSocketServer.broadcastQR(qr);
//         }
//     }

//     broadcastStatus(status, message) {
//         if (qrSocketServer && qrSocketServer.broadcastStatus) {
//             qrSocketServer.broadcastStatus(status, message);
//         }
//     }

//     broadcastStats(stats) {
//         if (qrSocketServer && qrSocketServer.broadcastStats) {
//             qrSocketServer.broadcastStats(stats);
//         }
//     }

//     broadcastBotInfo(info) {
//         if (qrSocketServer && qrSocketServer.broadcastBotInfo) {
//             qrSocketServer.broadcastBotInfo(info);
//         }
//     }

//     broadcastMessageSent(phoneNumber, message) {
//         if (qrSocketServer && qrSocketServer.broadcastMessageSent) {
//             qrSocketServer.broadcastMessageSent(phoneNumber, message);
//         }
//     }

//     broadcastMessageError(phoneNumber, error) {
//         if (qrSocketServer && qrSocketServer.broadcastMessageError) {
//             qrSocketServer.broadcastMessageError(phoneNumber, error);
//         }
//     }

//     async initialize() {
//         if (this.isInitializing) {
//             console.log('🔄 Bot initialization already in progress...');
//             return;
//         }

//         this.isInitializing = true;
        
//         try {
//             console.log('🚀 Initializing WhatsApp E-commerce Bot...');
            
//             // Clear any existing client
//             if (this.client) {
//                 await this.safeDestroyClient();
//             }

//             // Initialize WhatsApp client
//             await this.initializeClient();
            
//             this.reconnectAttempts = 0; // Reset on successful initialization
//             console.log('✅ Bot initialization completed successfully');
            
//         } catch (error) {
//             console.error('❌ Bot initialization failed:', error);
//             await this.handleInitializationError(error);
//         } finally {
//             this.isInitializing = false;
//         }
//     }

//     initializeClient() {
//         return new Promise((resolve, reject) => {
//             try {
//                 // Ensure session directory exists
//                 if (!fs.existsSync(this.sessionPath)) {
//                     fs.mkdirSync(this.sessionPath, { recursive: true });
//                 }

//                 console.log('📁 Session path:', this.sessionPath);
                
//                 this.client = new Client({
//                     authStrategy: new LocalAuth({
//                         clientId: process.env.CLIENT_ID || "ecommerce-bot",
//                         dataPath: this.sessionPath
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
//                             '--single-process'
//                         ],
//                         timeout: 60000,
//                         ignoreHTTPSErrors: true
//                     },
//                     webVersionCache: {
//                         type: 'remote',
//                         remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
//                     }
//                 });

//                 this.setupEventHandlers(resolve, reject);
                
//                 console.log('🔧 Starting client initialization...');
//                 this.client.initialize().catch(reject);

//             } catch (error) {
//                 reject(new Error(`Client initialization failed: ${error.message}`));
//             }
//         });
//     }

//     setupEventHandlers(resolve, reject) {
//         let qrGenerated = false;
//         let initializationTimeout;

//         // Set initialization timeout (2 minutes)
//         initializationTimeout = setTimeout(() => {
//             if (!this.isConnected) {
//                 const error = new Error('Client initialization timeout - taking too long to connect');
//                 console.error('❌', error.message);
//                 this.broadcastStatus('error', 'Initialization timeout - taking too long to connect');
//                 reject(error);
//             }
//         }, 120000);

//         this.client.on('qr', async (qr) => {
//             clearTimeout(initializationTimeout);
            
//             this.currentQR = qr;
            
//             // Broadcast QR to frontend
//             this.broadcastQR(qr);
//             this.broadcastStatus('qr_required', 'Scan QR code to connect WhatsApp');
            
//             if (!qrGenerated) {
//                 console.log('\n📱 WhatsApp Authentication Required');
//                 console.log('====================================');
//                 console.log('1. Open WhatsApp on your phone');
//                 console.log('2. Go to Settings → Linked Devices → Link a Device');
//                 console.log('3. Scan the QR code below:\n');
//                 qrcode.generate(qr, { small: true });
//                 console.log('\n====================================');
//                 console.log('🌐 QR code is also available on the web dashboard');
//                 qrGenerated = true;
//             }
//         });

//         this.client.on('ready', () => {
//             clearTimeout(initializationTimeout);
            
//             this.isConnected = true;
//             this.isAuthenticated = true;
//             this.currentQR = null;
//             this.reconnectAttempts = 0;
//             this.connectionTime = new Date();
            
//             console.log('\n✅ WhatsApp Bot Successfully Initialized');
//             console.log('========================================');
//             console.log('🤖 E-commerce Bot Status: ONLINE');
//             console.log('📱 Phone Number: Connected');
//             console.log('💼 Session: PERSISTENT');
//             console.log('🛍️  Ready to process customer orders');
//             console.log('========================================\n');
            
//             // Broadcast connection status
//             this.broadcastStatus('connected', 'WhatsApp is connected and ready');
            
//             // Start stats broadcasting
//             this.startStatsBroadcasting();
            
//             // Display bot information
//             this.displayBotInfo();
            
//             resolve();
//         });

//         this.client.on('authenticated', () => {
//             this.isAuthenticated = true;
//             this.currentQR = null;
//             console.log('🔐 Authentication successful - Session saved');
//             this.broadcastStatus('authenticated', 'WhatsApp authentication successful');
//         });

//         this.client.on('auth_failure', (error) => {
//             clearTimeout(initializationTimeout);
            
//             this.isAuthenticated = false;
//             console.error('❌ Authentication failed:', error);
//             this.broadcastStatus('auth_failed', 'Authentication failed. New QR code will be generated.');
            
//             reject(new Error(`Authentication failed: ${error.message}`));
//         });

//         this.client.on('disconnected', async (reason) => {
//             console.log(`🔌 Disconnected: ${reason}`);
            
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;

//             // Stop stats broadcasting when disconnected
//             this.stopStatsBroadcasting();
            
//             this.broadcastStatus('disconnected', `WhatsApp disconnected: ${reason}`);
            
//             // Handle different disconnect reasons
//             if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {
//                 console.log('🔄 Login issue detected. Generating new QR code...');
//                 this.broadcastStatus('qr_required', 'Reconnecting WhatsApp...');
                
//                 // Clear session and restart
//                 await this.clearSession();
//                 setTimeout(() => {
//                     this.initialize().catch(console.error);
//                 }, 3000);
//             } else {
//                 await this.handleReconnection();
//             }
//         });

//         this.client.on('message', async (message) => {
//             if (message.from === 'status@broadcast' || message.isGroupMsg) return;
            
//             try {
//                 // Update statistics for every message
//                 this.updateMessageStats(message.from);
                
//                 // Log incoming message
//                 console.log(`📨 Message from ${message.from}: ${message.body?.substring(0, 50)}...`);
                
//                 await handleMessage(message, this.client);
//             } catch (error) {
//                 console.error('❌ Message processing error:', error);
//                 await this.handleMessageError(message, error);
//             }
//         });

//         // Monitor connection state
//         this.client.on('change_state', (state) => {
//             console.log(`🔄 Connection state: ${state}`);
//             this.broadcastStatus('state_change', `Connection state: ${state}`);
//         });

//         // Loading screen events
//         this.client.on('loading_screen', (percent, message) => {
//             console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);
//             this.broadcastStatus('loading', `Loading: ${percent}% - ${message}`);
//         });

//         // Handle page errors
//         this.client.on('page_error', (error) => {
//             console.error('❌ Page error:', error);
//             this.broadcastStatus('page_error', `Page error: ${error.message}`);
//         });

//         // Battery status
//         this.client.on('change_battery', (batteryInfo) => {
//             console.log(`🔋 Battery: ${batteryInfo.battery}% - ${batteryInfo.plugged ? 'Charging' : 'Not charging'}`);
//             this.broadcastStatus('battery', `Battery: ${batteryInfo.battery}% - ${batteryInfo.plugged ? 'Charging' : 'Not charging'}`);
//         });
//     }

//     async handleReconnection() {
//         if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//             console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
//             this.broadcastStatus('error', 'Maximum reconnection attempts reached. Manual intervention required.');
//             return;
//         }

//         this.reconnectAttempts++;
//         const delay = 5000 * this.reconnectAttempts; // Exponential backoff
        
//         console.log(`🔄 Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
//         this.broadcastStatus('reconnecting', `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

//         setTimeout(async () => {
//             try {
//                 await this.initialize();
//             } catch (error) {
//                 console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);
//                 this.broadcastStatus('reconnect_failed', `Reconnection attempt ${this.reconnectAttempts} failed`);
//             }
//         }, delay);
//     }

//     async safeDestroyClient() {
//         try {
//             if (this.client) {
//                 console.log('🛑 Safely destroying existing client...');
//                 await this.client.destroy();
//                 this.client = null;
//                 console.log('✅ Client destroyed safely');
//                 this.broadcastStatus('client_destroyed', 'WhatsApp client destroyed');
//             }
//         } catch (error) {
//             console.error('❌ Error destroying client:', error);
//             this.client = null; // Force nullify even if destruction fails
//         }
//     }

//     async clearSession() {
//         try {
//             console.log('🧹 Clearing session data...');
//             this.broadcastStatus('clearing_session', 'Clearing session data...');
            
//             if (fs.existsSync(this.sessionPath)) {
//                 fs.rmSync(this.sessionPath, { recursive: true, force: true });
//                 console.log('✅ Session cleared successfully');
//                 this.broadcastStatus('session_cleared', 'Session cleared successfully');
//             }
//         } catch (error) {
//             console.error('❌ Error clearing session:', error);
//             this.broadcastStatus('session_error', `Error clearing session: ${error.message}`);
//         }
//     }

//     // Update statistics when message is received
//     updateMessageStats(from) {
//         this.stats.totalMessages++;
//         this.stats.totalCustomers.add(from);
//         this.stats.totalChats = this.stats.totalCustomers.size;
        
//         // Broadcast updated stats immediately
//         this.broadcastCurrentStats();
//     }

//     // Method to track new orders
//     trackNewOrder() {
//         this.stats.totalOrders++;
//         this.broadcastCurrentStats();
//     }

//     // Method to track pending orders (you need to implement this based on your order system)
//     trackPendingOrder() {
//         this.stats.pendingOrders++;
//         this.broadcastCurrentStats();
//     }

//     // Method to track completed orders
//     trackCompletedOrder() {
//         this.stats.completedOrders++;
//         if (this.stats.pendingOrders > 0) {
//             this.stats.pendingOrders--;
//         }
//         this.broadcastCurrentStats();
//     }

//     // Start broadcasting stats periodically
//     startStatsBroadcasting() {
//         // Broadcast initial stats
//         this.broadcastCurrentStats();
        
//         // Update stats every 3 seconds
//         this.statsInterval = setInterval(() => {
//             this.broadcastCurrentStats();
//         }, 3000);
        
//         console.log('📊 Started statistics broadcasting');
//     }

//     // Stop broadcasting stats
//     stopStatsBroadcasting() {
//         if (this.statsInterval) {
//             clearInterval(this.statsInterval);
//             this.statsInterval = null;
//             console.log('📊 Stopped statistics broadcasting');
//         }
//     }

//     // Broadcast current statistics
//     broadcastCurrentStats() {
//         const statsData = {
//             totalOrders: this.stats.totalOrders,
//             totalChats: this.stats.totalChats,
//             totalCustomers: this.stats.totalCustomers.size,
//             totalMessages: this.stats.totalMessages,
//             pendingOrders: this.stats.pendingOrders,
//             completedOrders: this.stats.completedOrders,
//             lastUpdated: new Date().toISOString()
//         };
        
//         this.broadcastStats(statsData);
//     }

//     // Display bot information
//     async displayBotInfo() {
//         try {
//             if (!this.client) {
//                 console.log('📊 Bot info: Client not initialized');
//                 return;
//             }

//             const info = await this.client.getInfo();
//             this.botInfo = {
//                 pushname: info.pushname || 'Unknown',
//                 platform: info.platform || 'Unknown',
//                 version: info.waVersion || 'Unknown',
//                 phoneNumber: info.wid?.user || 'Unknown',
//                 connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
//             };
            
//             console.log('🤖 Bot Information:');
//             console.log('───────────────────');
//             console.log(`📱 WhatsApp: ${this.botInfo.pushname}`);
//             console.log(`📞 Phone: ${this.botInfo.phoneNumber}`);
//             console.log(`🌐 Platform: ${this.botInfo.platform}`);
//             console.log(`📊 Version: ${this.botInfo.version}`);
//             console.log('───────────────────\n');
            
//             // Broadcast bot info
//             this.broadcastBotInfo(this.botInfo);
            
//         } catch (error) {
//             console.log('📊 Bot info: Error getting bot info', error.message);
//             this.botInfo = {
//                 pushname: 'Connected',
//                 platform: 'Unknown',
//                 version: 'Unknown',
//                 phoneNumber: 'Unknown',
//                 connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
//             };
//             this.broadcastBotInfo(this.botInfo);
//         }
//     }

//     async handleInitializationError(error) {
//         console.error('❌ Initialization error:', error.message);
//         this.broadcastStatus('error', `Initialization error: ${error.message}`);
        
//         // For session-related errors, wait and retry
//         if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {
//             console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');
//             this.broadcastStatus('retrying', 'Session issue detected. Retrying...');
            
//             // Clear session and retry
//             await this.clearSession();
            
//             setTimeout(() => {
//                 this.initialize().catch(console.error);
//             }, 10000);
//         } else {
//             // For other errors, use reconnection logic
//             await this.handleReconnection();
//         }
//     }

//     async handleMessageError(message, error) {
//         try {
//             // Don't send error response for context destroyed errors (user won't see it anyway)
//             if (error.message.includes('Execution context was destroyed')) {
//                 console.log('⚠️ Message failed due to context destruction - skipping error response');
//                 return;
//             }
            
//             await message.reply(
//                 '⚠️ We encountered a temporary issue. Please try your request again.'
//             );
//             this.broadcastStatus('message_error', `Failed to process message from ${message.from}: ${error.message}`);
//         } catch (replyError) {
//             console.error('❌ Failed to send error response:', replyError);
//         }
//     }

//     // Get current QR code (for API endpoints)
//     getCurrentQR() {
//         return this.currentQR;
//     }

//     // Get connection status
//     getStatus() {
//         return {
//             connected: this.isConnected,
//             authenticated: this.isAuthenticated,
//             hasQR: !!this.currentQR,
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
//             formattedUptime: this.getFormattedUptime()
//         };
//     }

//     // Method to send message
//     async sendMessage(phoneNumber, message) {
//         try {
//             if (!this.client || !this.isConnected) {
//                 throw new Error('WhatsApp client not connected');
//             }

//             const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
            
//             console.log(`📤 Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
//             await this.client.sendMessage(formattedNumber, message);
            
//             console.log('✅ Message sent successfully');
//             this.broadcastMessageSent(phoneNumber, message);
//             return { success: true, message: 'Message sent successfully' };
            
//         } catch (error) {
//             console.error('❌ Send message error:', error);
//             this.broadcastMessageError(phoneNumber, error);
//             return { success: false, error: error.message };
//         }
//     }

//     async shutdown() {
//         console.log('\n🛑 Initiating graceful shutdown...');
//         this.broadcastStatus('shutdown', 'Bot is shutting down...');
        
//         try {
//             this.stopStatsBroadcasting();
//             await this.safeDestroyClient();
            
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.currentQR = null;
//             this.reconnectAttempts = 0;
//             this.connectionTime = null;
            
//             console.log('✅ Bot shutdown completed gracefully');
//             this.broadcastStatus('shutdown_complete', 'Bot shutdown completed');
//         } catch (error) {
//             console.error('❌ Error during shutdown:', error);
//             this.broadcastStatus('shutdown_error', `Error during shutdown: ${error.message}`);
//         }
//     }

//     // Method to manually logout (clear session)
//     async logout() {
//         console.log('\n🚪 Manual logout requested...');
//         this.broadcastStatus('logging_out', 'Manual logout requested...');
        
//         try {
//             await this.safeDestroyClient();
//             await this.clearSession();
            
//             this.currentQR = null;
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.connectionTime = null;
            
//             console.log('🔓 Logout completed. QR code will be required on next start.');
//             this.broadcastStatus('logged_out', 'Logout completed. QR code required.');
            
//             // Restart the bot
//             setTimeout(() => {
//                 this.initialize().catch(console.error);
//             }, 2000);
            
//         } catch (error) {
//             console.error('❌ Logout error:', error);
//             this.broadcastStatus('error', `Logout error: ${error.message}`);
//         }
//     }

//     // Method to restart the bot
//     async restart() {
//         console.log('\n🔄 Manual restart requested...');
//         this.broadcastStatus('restarting', 'Manual restart requested...');
        
//         try {
//             await this.shutdown();
//             setTimeout(async () => {
//                 await this.initialize();
//             }, 3000);
//         } catch (error) {
//             console.error('❌ Restart error:', error);
//             this.broadcastStatus('error', `Restart error: ${error.message}`);
//         }
//     }

//     // Get uptime in seconds
//     getUptime() {
//         if (!this.connectionTime) return 0;
//         return Math.floor((new Date() - this.connectionTime) / 1000);
//     }

//     // Format uptime as HH:MM:SS
//     getFormattedUptime() {
//         const seconds = this.getUptime();
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = seconds % 60;
//         return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     }
// }

// // Create bot instance as singleton
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

// // Enhanced global error handlers
// process.on('SIGINT', async () => {
//     console.log('\n🛑 Received shutdown signal (SIGINT)');
//     await bot.shutdown();
//     process.exit(0);
// });

// process.on('SIGTERM', async () => {
//     console.log('\n🛑 Received termination signal (SIGTERM)');
//     await bot.shutdown();
//     process.exit(0);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//     console.error('❌ Uncaught Exception:', error);
//     if (bot.broadcastStatus) {
//         bot.broadcastStatus('error', `Uncaught exception: ${error.message}`);
//     }
    
//     // Don't exit for Puppeteer context errors
//     if (error.message.includes('Execution context was destroyed')) {
//         console.log('⚠️ Context error detected - continuing operation');
//         return;
//     }
// });

// // Handle unhandled rejections
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('❌ Unhandled Rejection at:', promise);
//     console.error('Reason:', reason);
    
//     // Don't log context destruction errors as critical
//     if (reason.message && reason.message.includes('Execution context was destroyed')) {
//         console.log('⚠️ Context destruction detected in promise - this is normal during reconnections');
//         return;
//     }
    
//     if (bot.broadcastStatus) {
//         bot.broadcastStatus('error', `Unhandled rejection: ${reason.message || reason}`);
//     }
// });

// // Initialize bot with retry logic
// const startBot = async (attempt = 1) => {
//     try {
//         await bot.initialize();
//     } catch (error) {
//         console.error(`❌ Bot startup failed (attempt ${attempt}):`, error);
//         if (bot.broadcastStatus) {
//             bot.broadcastStatus('startup_failed', `Bot startup failed (attempt ${attempt}): ${error.message}`);
//         }
        
//         if (attempt < 3) {
//             console.log(`🔄 Retrying startup in 10 seconds... (${attempt + 1}/3)`);
//             if (bot.broadcastStatus) {
//                 bot.broadcastStatus('retrying_startup', `Retrying startup... (${attempt + 1}/3)`);
//             }
//             setTimeout(() => startBot(attempt + 1), 10000);
//         } else {
//             console.error('💥 Maximum startup attempts reached. Exiting.');
//             if (bot.broadcastStatus) {
//                 bot.broadcastStatus('startup_failed', 'Bot failed to start after multiple attempts');
//             }
//             process.exit(1);
//         }
//     }
// };

// // Start the bot
// startBot().catch(console.error);

// export { createWhatsAppBot, getWhatsAppBot };
// export default bot;

import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import handleMessage from "./messageHandler.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import qrSocketServer
import { qrSocketServer } from '../services/qrSocketServer.js';

dotenv.config();

const { Client, LocalAuth } = pkg;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppBot {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        this.sessionPath = path.join(__dirname, 'sessions');
        this.currentQR = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isInitializing = false;
        this.connectionTime = null;
        this.botInfo = null;
        this.isShuttingDown = false;
        this.socketServerReady = false;
        
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
        
        // Check socket server status periodically
        this.checkSocketServer();
    }

    // Check if socket server is ready
    checkSocketServer() {
        const checkInterval = setInterval(() => {
            if (qrSocketServer && qrSocketServer.wss) {
                this.socketServerReady = true;
                console.log('✅ WebSocket server is ready');
                clearInterval(checkInterval);
            }
        }, 1000);
    }

    // Safe broadcast methods
    broadcastQR(qr) {
        if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastQR === 'function') {
            try {
                qrSocketServer.broadcastQR(qr);
            } catch (error) {
                console.error('❌ Error broadcasting QR:', error);
            }
        }
    }

    broadcastStatus(status, message) {
        if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastStatus === 'function') {
            try {
                qrSocketServer.broadcastStatus(status, message);
            } catch (error) {
                console.error('❌ Error broadcasting status:', error);
            }
        }
    }

    broadcastStats(stats) {
        if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastStats === 'function') {
            try {
                qrSocketServer.broadcastStats(stats);
            } catch (error) {
                console.error('❌ Error broadcasting stats:', error);
            }
        }
    }

    broadcastBotInfo(info) {
        if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastBotInfo === 'function') {
            try {
                qrSocketServer.broadcastBotInfo(info);
            } catch (error) {
                console.error('❌ Error broadcasting bot info:', error);
            }
        }
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
            console.log('📡 Socket server ready:', this.socketServerReady);
            
            // Clear any existing client
            if (this.client) {
                await this.safeDestroyClient();
            }

            // Initialize WhatsApp client
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
        return new Promise((resolve, reject) => {
            try {
                // Ensure session directory exists
                if (!fs.existsSync(this.sessionPath)) {
                    fs.mkdirSync(this.sessionPath, { recursive: true });
                }

                console.log('📁 Session path:', this.sessionPath);
                
                this.client = new Client({
                    authStrategy: new LocalAuth({
                        clientId: process.env.CLIENT_ID || "ecommerce-bot",
                        dataPath: this.sessionPath
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
                            '--single-process'
                        ],
                        timeout: 60000,
                        ignoreHTTPSErrors: true
                    },
                    webVersionCache: {
                        type: 'remote',
                        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
                    }
                });

                this.setupEventHandlers(resolve, reject);
                
                console.log('🔧 Starting client initialization...');
                this.client.initialize().catch(reject);

            } catch (error) {
                reject(new Error(`Client initialization failed: ${error.message}`));
            }
        });
    }

    setupEventHandlers(resolve, reject) {
        let qrGenerated = false;
        let initializationTimeout;

        // Set initialization timeout (2 minutes)
        initializationTimeout = setTimeout(() => {
            if (!this.isConnected) {
                const error = new Error('Client initialization timeout - taking too long to connect');
                console.error('❌', error.message);
                this.broadcastStatus('error', 'Initialization timeout - taking too long to connect');
                reject(error);
            }
        }, 120000);

        this.client.on('qr', async (qr) => {
            clearTimeout(initializationTimeout);
            
            this.currentQR = qr;
            
            console.log('📱 QR Code generated');
            console.log('📡 Attempting to broadcast QR. Socket ready:', this.socketServerReady);
            
            // Broadcast QR to frontend
            this.broadcastQR(qr);
            this.broadcastStatus('qr_required', 'Scan QR code to connect WhatsApp');
            
            if (!qrGenerated) {
                console.log('\n📱 WhatsApp Authentication Required');
                console.log('====================================');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Go to Settings → Linked Devices → Link a Device');
                console.log('3. Scan the QR code below:\n');
                qrcode.generate(qr, { small: true });
                console.log('\n====================================');
                console.log('🌐 QR code is also available on the web dashboard');
                qrGenerated = true;
            }
        });

        this.client.on('ready', () => {
            clearTimeout(initializationTimeout);
            
            this.isConnected = true;
            this.isAuthenticated = true;
            this.currentQR = null;
            this.reconnectAttempts = 0;
            this.connectionTime = new Date();
            
            console.log('\n✅ WhatsApp Bot Successfully Initialized');
            console.log('========================================');
            console.log('🤖 E-commerce Bot Status: ONLINE');
            console.log('📱 Phone Number: Connected');
            console.log('💼 Session: PERSISTENT');
            console.log('🛍️  Ready to process customer orders');
            console.log('========================================\n');
            
            console.log('📡 Broadcasting connection status. Socket ready:', this.socketServerReady);
            
            // Broadcast connection status
            this.broadcastStatus('connected', 'WhatsApp is connected and ready');
            
            // Start stats broadcasting
            this.startStatsBroadcasting();
            
            // Display bot information
            this.displayBotInfo();
            
            resolve();
        });

        this.client.on('authenticated', () => {
            this.isAuthenticated = true;
            this.currentQR = null;
            console.log('🔐 Authentication successful - Session saved');
            this.broadcastStatus('authenticated', 'WhatsApp authentication successful');
        });

        this.client.on('auth_failure', (error) => {
            clearTimeout(initializationTimeout);
            
            this.isAuthenticated = false;
            console.error('❌ Authentication failed:', error);
            this.broadcastStatus('auth_failed', 'Authentication failed. New QR code will be generated.');
            
            reject(new Error(`Authentication failed: ${error.message}`));
        });

        this.client.on('disconnected', async (reason) => {
            console.log(`🔌 Disconnected: ${reason}`);
            
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;

            // Stop stats broadcasting when disconnected
            this.stopStatsBroadcasting();
            
            this.broadcastStatus('disconnected', `WhatsApp disconnected: ${reason}`);
            
            // Don't try to reconnect if we're shutting down or logging out
            if (this.isShuttingDown) {
                return;
            }
            
            // Handle different disconnect reasons
            if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {
                console.log('🔄 Login issue detected. Generating new QR code...');
                this.broadcastStatus('qr_required', 'Reconnecting WhatsApp...');
                
                // Clear session and restart
                await this.clearSession();
                setTimeout(() => {
                    this.initialize().catch(console.error);
                }, 3000);
            } else {
                await this.handleReconnection();
            }
        });

        this.client.on('message', async (message) => {
            if (message.from === 'status@broadcast' || message.isGroupMsg) return;
            
            try {
                // Update statistics for every message
                this.updateMessageStats(message.from);
                
                // Log incoming message
                console.log(`📨 Message from ${message.from}: ${message.body?.substring(0, 50)}...`);
                
                await handleMessage(message, this.client);
            } catch (error) {
                console.error('❌ Message processing error:', error);
                await this.handleMessageError(message, error);
            }
        });

        // Monitor connection state
        this.client.on('change_state', (state) => {
            console.log(`🔄 Connection state: ${state}`);
            this.broadcastStatus('state_change', `Connection state: ${state}`);
        });

        // Loading screen events
        this.client.on('loading_screen', (percent, message) => {
            console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);
            this.broadcastStatus('loading', `Loading: ${percent}% - ${message}`);
        });

        // Handle page errors
        this.client.on('page_error', (error) => {
            if (this.isShuttingDown && (
                error.message.includes('Session closed') || 
                error.message.includes('page has been closed') ||
                error.message.includes('Protocol error')
            )) {
                console.log('⚠️ Page error during shutdown (expected):', error.message);
                return;
            }
            console.error('❌ Page error:', error);
            this.broadcastStatus('page_error', `Page error: ${error.message}`);
        });
    }

    async handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
            this.broadcastStatus('error', 'Maximum reconnection attempts reached. Manual intervention required.');
            return;
        }

        this.reconnectAttempts++;
        const delay = 5000 * this.reconnectAttempts;
        
        console.log(`🔄 Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.broadcastStatus('reconnecting', `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(async () => {
            try {
                await this.initialize();
            } catch (error) {
                console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);
                this.broadcastStatus('reconnect_failed', `Reconnection attempt ${this.reconnectAttempts} failed`);
            }
        }, delay);
    }

    async safeDestroyClient() {
        try {
            if (this.client) {
                console.log('🛑 Safely destroying existing client...');
                this.isShuttingDown = true;
                await this.client.destroy();
                this.client = null;
                console.log('✅ Client destroyed safely');
                this.broadcastStatus('client_destroyed', 'WhatsApp client destroyed');
            }
        } catch (error) {
            if (!error.message.includes('Session closed') && 
                !error.message.includes('page has been closed') &&
                !error.message.includes('Protocol error')) {
                console.error('❌ Error destroying client:', error);
            } else {
                console.log('⚠️ Client destruction error (expected):', error.message);
            }
            this.client = null;
        } finally {
            this.isShuttingDown = false;
        }
    }

    async clearSession() {
        try {
            console.log('🧹 Clearing session data...');
            this.broadcastStatus('clearing_session', 'Clearing session data...');
            
            if (fs.existsSync(this.sessionPath)) {
                fs.rmSync(this.sessionPath, { recursive: true, force: true });
                console.log('✅ Session cleared successfully');
                this.broadcastStatus('session_cleared', 'Session cleared successfully');
            }
        } catch (error) {
            console.error('❌ Error clearing session:', error);
            this.broadcastStatus('session_error', `Error clearing session: ${error.message}`);
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
        
        console.log('📊 Started statistics broadcasting. Socket ready:', this.socketServerReady);
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
            lastUpdated: new Date().toISOString()
        };
        
        this.broadcastStats(statsData);
    }

    async displayBotInfo() {
        try {
            if (!this.client) {
                console.log('📊 Bot info: Client not initialized');
                return;
            }

            const info = await this.client.getInfo();
            this.botInfo = {
                pushname: info.pushname || 'Unknown',
                platform: info.platform || 'Unknown',
                version: info.waVersion || 'Unknown',
                phoneNumber: info.wid?.user || 'Unknown',
                connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
            };
            
            console.log('🤖 Bot Information:');
            console.log('───────────────────');
            console.log(`📱 WhatsApp: ${this.botInfo.pushname}`);
            console.log(`📞 Phone: ${this.botInfo.phoneNumber}`);
            console.log(`🌐 Platform: ${this.botInfo.platform}`);
            console.log(`📊 Version: ${this.botInfo.version}`);
            console.log('───────────────────\n');
            
            console.log('📡 Broadcasting bot info. Socket ready:', this.socketServerReady);
            this.broadcastBotInfo(this.botInfo);
            
        } catch (error) {
            console.log('📊 Bot info: Error getting bot info', error.message);
            this.botInfo = {
                pushname: 'Connected',
                platform: 'Unknown',
                version: 'Unknown',
                phoneNumber: 'Unknown',
                connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()
            };
            this.broadcastBotInfo(this.botInfo);
        }
    }

    async handleInitializationError(error) {
        console.error('❌ Initialization error:', error.message);
        this.broadcastStatus('error', `Initialization error: ${error.message}`);
        
        if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {
            console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');
            this.broadcastStatus('retrying', 'Session issue detected. Retrying...');
            
            await this.clearSession();
            
            setTimeout(() => {
                this.initialize().catch(console.error);
            }, 10000);
        } else {
            await this.handleReconnection();
        }
    }

    async handleMessageError(message, error) {
        try {
            if (error.message.includes('Execution context was destroyed') ||
                error.message.includes('Session closed') ||
                error.message.includes('page has been closed')) {
                console.log('⚠️ Message failed due to context/page closure - skipping error response');
                return;
            }
            
            await message.reply(
                '⚠️ We encountered a temporary issue. Please try your request again.'
            );
            this.broadcastStatus('message_error', `Failed to process message from ${message.from}: ${error.message}`);
        } catch (replyError) {
            console.error('❌ Failed to send error response:', replyError);
        }
    }

    getCurrentQR() {
        return this.currentQR;
    }

    getStatus() {
        return {
            connected: this.isConnected,
            authenticated: this.isAuthenticated,
            hasQR: !!this.currentQR,
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
            socketServerReady: this.socketServerReady
        };
    }

    async sendMessage(phoneNumber, message) {
        try {
            if (!this.client || !this.isConnected) {
                throw new Error('WhatsApp client not connected');
            }

            const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
            
            console.log(`📤 Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
            await this.client.sendMessage(formattedNumber, message);
            
            console.log('✅ Message sent successfully');
            return { success: true, message: 'Message sent successfully' };
            
        } catch (error) {
            console.error('❌ Send message error:', error);
            return { success: false, error: error.message };
        }
    }

    async shutdown() {
        console.log('\n🛑 Initiating graceful shutdown...');
        this.broadcastStatus('shutdown', 'Bot is shutting down...');
        
        try {
            this.stopStatsBroadcasting();
            await this.safeDestroyClient();
            
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            this.reconnectAttempts = 0;
            this.connectionTime = null;
            
            console.log('✅ Bot shutdown completed gracefully');
            this.broadcastStatus('shutdown_complete', 'Bot shutdown completed');
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            this.broadcastStatus('shutdown_error', `Error during shutdown: ${error.message}`);
        }
    }

    async logout() {
        console.log('\n🚪 Manual logout requested...');
        this.broadcastStatus('logging_out', 'Manual logout requested...');
        
        try {
            this.isShuttingDown = true;
            await this.safeDestroyClient();
            await this.clearSession();
            
            this.currentQR = null;
            this.isConnected = false;
            this.isAuthenticated = false;
            this.connectionTime = null;
            
            console.log('🔓 Logout completed. QR code will be required on next start.');
            this.broadcastStatus('logged_out', 'Logout completed. QR code required.');
            
            setTimeout(() => {
                this.isShuttingDown = false;
                this.initialize().catch(console.error);
            }, 2000);
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            this.broadcastStatus('error', `Logout error: ${error.message}`);
            this.isShuttingDown = false;
        }
    }

    async restart() {
        console.log('\n🔄 Manual restart requested...');
        this.broadcastStatus('restarting', 'Manual restart requested...');
        
        try {
            await this.shutdown();
            setTimeout(async () => {
                await this.initialize();
            }, 3000);
        } catch (error) {
            console.error('❌ Restart error:', error);
            this.broadcastStatus('error', `Restart error: ${error.message}`);
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

    trackNewOrder() {
        this.stats.totalOrders++;
        this.broadcastCurrentStats();
    }

    trackPendingOrder() {
        this.stats.pendingOrders++;
        this.broadcastCurrentStats();
    }

    trackCompletedOrder() {
        this.stats.completedOrders++;
        if (this.stats.pendingOrders > 0) {
            this.stats.pendingOrders--;
        }
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

// Global error handlers
process.on('SIGINT', async () => {
    console.log('\n🛑 Received shutdown signal (SIGINT)');
    await bot.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received termination signal (SIGTERM)');
    await bot.shutdown();
    process.exit(0);
});

// Delay bot startup to ensure WebSocket server is ready
setTimeout(() => {
    const startBot = async (attempt = 1) => {
        try {
            console.log(`🚀 Starting WhatsApp bot (attempt ${attempt}/3)...`);
            console.log('📡 Checking WebSocket server status...');
            
            await bot.initialize();
            console.log('✅ WhatsApp bot started successfully');
            
        } catch (error) {
            console.error(`❌ Bot startup failed (attempt ${attempt}):`, error);
            
            if (attempt < 3) {
                console.log(`🔄 Retrying startup in 10 seconds... (${attempt + 1}/3)`);
                setTimeout(() => startBot(attempt + 1), 10000);
            } else {
                console.error('💥 Maximum startup attempts reached. Bot will continue in disconnected state.');
            }
        }
    };
    
    startBot();
}, 3000); // Wait 3 seconds for WebSocket server to initialize

export { createWhatsAppBot, getWhatsAppBot };
export default bot;