
// import pkg from 'whatsapp-web.js';
// import qrcode from 'qrcode-terminal';
// import dotenv from 'dotenv';
// import handleMessage from "./messageHandler.js";
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Import qrSocketServer
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
//         this.isShuttingDown = false;
//         this.socketServerReady = false;
        
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
        
//         // Check socket server status periodically
//         this.checkSocketServer();
//     }

//     // Check if socket server is ready
//     checkSocketServer() {
//         const checkInterval = setInterval(() => {
//             if (qrSocketServer && qrSocketServer.wss) {
//                 this.socketServerReady = true;
//                 console.log('✅ WebSocket server is ready');
//                 clearInterval(checkInterval);
//             }
//         }, 1000);
//     }

//     // Safe broadcast methods
//     broadcastQR(qr) {
//         if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastQR === 'function') {
//             try {
//                 qrSocketServer.broadcastQR(qr);
//             } catch (error) {
//                 console.error('❌ Error broadcasting QR:', error);
//             }
//         }
//     }

//     broadcastStatus(status, message) {
//         if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastStatus === 'function') {
//             try {
//                 qrSocketServer.broadcastStatus(status, message);
//             } catch (error) {
//                 console.error('❌ Error broadcasting status:', error);
//             }
//         }
//     }

//     broadcastStats(stats) {
//         if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastStats === 'function') {
//             try {
//                 qrSocketServer.broadcastStats(stats);
//             } catch (error) {
//                 console.error('❌ Error broadcasting stats:', error);
//             }
//         }
//     }

//     broadcastBotInfo(info) {
//         if (this.socketServerReady && qrSocketServer && typeof qrSocketServer.broadcastBotInfo === 'function') {
//             try {
//                 qrSocketServer.broadcastBotInfo(info);
//             } catch (error) {
//                 console.error('❌ Error broadcasting bot info:', error);
//             }
//         }
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
//             console.log('📡 Socket server ready:', this.socketServerReady);
            
//             // Clear any existing client
//             if (this.client) {
//                 await this.safeDestroyClient();
//             }

//             // Initialize WhatsApp client
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
            
//             console.log('📱 QR Code generated');
//             console.log('📡 Attempting to broadcast QR. Socket ready:', this.socketServerReady);
            
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
            
//             console.log('📡 Broadcasting connection status. Socket ready:', this.socketServerReady);
            
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
            
//             // Don't try to reconnect if we're shutting down or logging out
//             if (this.isShuttingDown) {
//                 return;
//             }
            
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
//             if (this.isShuttingDown && (
//                 error.message.includes('Session closed') || 
//                 error.message.includes('page has been closed') ||
//                 error.message.includes('Protocol error')
//             )) {
//                 console.log('⚠️ Page error during shutdown (expected):', error.message);
//                 return;
//             }
//             console.error('❌ Page error:', error);
//             this.broadcastStatus('page_error', `Page error: ${error.message}`);
//         });
//     }

//     async handleReconnection() {
//         if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//             console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
//             this.broadcastStatus('error', 'Maximum reconnection attempts reached. Manual intervention required.');
//             return;
//         }

//         this.reconnectAttempts++;
//         const delay = 5000 * this.reconnectAttempts;
        
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
//                 this.isShuttingDown = true;
//                 await this.client.destroy();
//                 this.client = null;
//                 console.log('✅ Client destroyed safely');
//                 this.broadcastStatus('client_destroyed', 'WhatsApp client destroyed');
//             }
//         } catch (error) {
//             if (!error.message.includes('Session closed') && 
//                 !error.message.includes('page has been closed') &&
//                 !error.message.includes('Protocol error')) {
//                 console.error('❌ Error destroying client:', error);
//             } else {
//                 console.log('⚠️ Client destruction error (expected):', error.message);
//             }
//             this.client = null;
//         } finally {
//             this.isShuttingDown = false;
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
        
//         console.log('📊 Started statistics broadcasting. Socket ready:', this.socketServerReady);
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
//             lastUpdated: new Date().toISOString()
//         };
        
//         this.broadcastStats(statsData);
//     }

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
            
//             console.log('📡 Broadcasting bot info. Socket ready:', this.socketServerReady);
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
        
//         if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {
//             console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');
//             this.broadcastStatus('retrying', 'Session issue detected. Retrying...');
            
//             await this.clearSession();
            
//             setTimeout(() => {
//                 this.initialize().catch(console.error);
//             }, 10000);
//         } else {
//             await this.handleReconnection();
//         }
//     }

//     async handleMessageError(message, error) {
//         try {
//             if (error.message.includes('Execution context was destroyed') ||
//                 error.message.includes('Session closed') ||
//                 error.message.includes('page has been closed')) {
//                 console.log('⚠️ Message failed due to context/page closure - skipping error response');
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

//     getCurrentQR() {
//         return this.currentQR;
//     }

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
//             formattedUptime: this.getFormattedUptime(),
//             socketServerReady: this.socketServerReady
//         };
//     }

//     async sendMessage(phoneNumber, message) {
//         try {
//             if (!this.client || !this.isConnected) {
//                 throw new Error('WhatsApp client not connected');
//             }

//             const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
            
//             console.log(`📤 Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
//             await this.client.sendMessage(formattedNumber, message);
            
//             console.log('✅ Message sent successfully');
//             return { success: true, message: 'Message sent successfully' };
            
//         } catch (error) {
//             console.error('❌ Send message error:', error);
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

//     async logout() {
//         console.log('\n🚪 Manual logout requested...');
//         this.broadcastStatus('logging_out', 'Manual logout requested...');
        
//         try {
//             this.isShuttingDown = true;
//             await this.safeDestroyClient();
//             await this.clearSession();
            
//             this.currentQR = null;
//             this.isConnected = false;
//             this.isAuthenticated = false;
//             this.connectionTime = null;
            
//             console.log('🔓 Logout completed. QR code will be required on next start.');
//             this.broadcastStatus('logged_out', 'Logout completed. QR code required.');
            
//             setTimeout(() => {
//                 this.isShuttingDown = false;
//                 this.initialize().catch(console.error);
//             }, 2000);
            
//         } catch (error) {
//             console.error('❌ Logout error:', error);
//             this.broadcastStatus('error', `Logout error: ${error.message}`);
//             this.isShuttingDown = false;
//         }
//     }

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

//     trackNewOrder() {
//         this.stats.totalOrders++;
//         this.broadcastCurrentStats();
//     }

//     trackPendingOrder() {
//         this.stats.pendingOrders++;
//         this.broadcastCurrentStats();
//     }

//     trackCompletedOrder() {
//         this.stats.completedOrders++;
//         if (this.stats.pendingOrders > 0) {
//             this.stats.pendingOrders--;
//         }
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

// // Global error handlers
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

// // Delay bot startup to ensure WebSocket server is ready
// setTimeout(() => {
//     const startBot = async (attempt = 1) => {
//         try {
//             console.log(`🚀 Starting WhatsApp bot (attempt ${attempt}/3)...`);
//             console.log('📡 Checking WebSocket server status...');
            
//             await bot.initialize();
//             console.log('✅ WhatsApp bot started successfully');
            
//         } catch (error) {
//             console.error(`❌ Bot startup failed (attempt ${attempt}):`, error);
            
//             if (attempt < 3) {
//                 console.log(`🔄 Retrying startup in 10 seconds... (${attempt + 1}/3)`);
//                 setTimeout(() => startBot(attempt + 1), 10000);
//             } else {
//                 console.error('💥 Maximum startup attempts reached. Bot will continue in disconnected state.');
//             }
//         }
//     };
    
//     startBot();
// }, 3000); // Wait 3 seconds for WebSocket server to initialize

// export { createWhatsAppBot, getWhatsAppBot };
// export default bot;







// bot.js - Complete updated version with EventEmitter and WebSocket integration
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';
import handleMessage from "./messageHandler.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client, LocalAuth } = pkg;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppBot extends EventEmitter {
constructor() {
super(); // Initialize EventEmitter

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
                authStrategy: new LocalAuth(),
                   
                
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
                        
                    ],  
                    timeout: 60000,  
                    ignoreHTTPSErrors: true  
                },  
               
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
              
            // Emit status change event  
            this.emitStatusChange({  
                connected: false,  
                status: 'error',  
                message: 'Initialization timeout - taking too long to connect'  
            });  
              
            reject(error);  
        }  
    }, 120000);  

    this.client.on('qr', async (qr) => {  
        clearTimeout(initializationTimeout);  
          
        this.currentQR = qr;  
          
        console.log('📱 QR Code generated');  
          
        // Emit QR update event  
        this.emitQRCode(qr);  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            hasQR: true,  
            status: 'qr_required',  
            message: 'Scan QR code to connect WhatsApp'  
        });  
          
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

this.client.on('ready', async () => {
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

    this.emitStatusChange({
        connected: true,
        authenticated: true,
        hasQR: false,
        status: 'connected',
        message: 'WhatsApp is connected and ready'
    });

    // Start stats (safe)
    this.startStatsBroadcasting();

    // 🔥 Delay bot info loading (prevents freeze)
    setTimeout(() => {
        this.displayBotInfo().catch(err =>
            console.log('⚠️ Bot info load skipped:', err.message)
        );
    }, 5000);

    resolve();
}); 

    this.client.on('authenticated', () => {  
        this.isAuthenticated = true;  
        this.currentQR = null;  
        console.log('🔐 Authentication successful - Session saved');  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: true,  
            hasQR: false,  
            status: 'authenticated',  
            message: 'WhatsApp authentication successful'  
        });  
    });  

    this.client.on('auth_failure', (error) => {  
        clearTimeout(initializationTimeout);  
          
        this.isAuthenticated = false;  
        console.error('❌ Authentication failed:', error);  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            status: 'auth_failed',  
            message: 'Authentication failed. New QR code will be generated.'  
        });  
          
        reject(new Error(`Authentication failed: ${error.message}`));  
    });  

    this.client.on('disconnected', async (reason) => {  
        console.log(`🔌 Disconnected: ${reason}`);  
          
        this.isConnected = false;  
        this.isAuthenticated = false;  
        this.currentQR = null;  

        // Stop stats broadcasting when disconnected  
        this.stopStatsBroadcasting();  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            status: 'disconnected',  
            message: `WhatsApp disconnected: ${reason}`  
        });  
          
        // Don't try to reconnect if we're shutting down or logging out  
        if (this.isShuttingDown) {  
            return;  
        }  
          
        // Handle different disconnect reasons  
        if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {  
            console.log('🔄 Login issue detected. Generating new QR code...');  
              
            // Emit status change event  
            this.emitStatusChange({  
                connected: false,  
                authenticated: false,  
                status: 'qr_required',  
                message: 'Reconnecting WhatsApp...'  
            });  
              
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
              
            // Emit message event  
            this.emitMessage({  
                from: message.from,  
                body: message.body,  
                timestamp: new Date().toISOString(),  
                hasMedia: message.hasMedia,  
                type: message.type  
            });  
              
            await handleMessage(message, this.client);  
        } catch (error) {  
            console.error('❌ Message processing error:', error);  
            await this.handleMessageError(message, error);  
        }  
    });  

    // Monitor connection state  
    this.client.on('change_state', (state) => {  
        console.log(`🔄 Connection state: ${state}`);  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: this.isConnected,  
            authenticated: this.isAuthenticated,  
            status: 'state_change',  
            message: `Connection state: ${state}`  
        });  
    });  

    // Loading screen events  
    this.client.on('loading_screen', (percent, message) => {  
        console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: this.isConnected,  
            authenticated: this.isAuthenticated,  
            status: 'loading',  
            message: `Loading: ${percent}% - ${message}`  
        });  
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
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: this.isConnected,  
            authenticated: this.isAuthenticated,  
            status: 'page_error',  
            message: `Page error: ${error.message}`  
        });  
    });  
}  

// ========== EVENT EMITTER METHODS ==========  
  
// When QR code is generated  
emitQRCode(qr) {  
    this.emit('qr-update', qr);  
}  
  
// When status changes  
emitStatusChange(status) {  
    this.emit('status-change', {  
        ...status,  
        timestamp: new Date().toISOString()  
    });  
}  
  
// When message is received  
emitMessage(messageData) {  
    this.emit('message', messageData);  
}  
  
// When order is tracked  
emitOrderUpdate(orderData) {  
    this.emit('order-update', {  
        ...orderData,  
        timestamp: new Date().toISOString()  
    });  
}  
  
// When stats are updated  
emitStatsUpdate(stats) {  
    this.emit('stats-update', {  
        ...stats,  
        timestamp: new Date().toISOString()  
    });  
}  

async handleReconnection() {  
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {  
        console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            status: 'error',  
            message: 'Maximum reconnection attempts reached. Manual intervention required.'  
        });  
          
        return;  
    }  

    this.reconnectAttempts++;  
    const delay = 5000 * this.reconnectAttempts;  
      
    console.log(`🔄 Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);  
      
    // Emit status change event  
    this.emitStatusChange({  
        connected: false,  
        authenticated: false,  
        status: 'reconnecting',  
        message: `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`  
    });  

    setTimeout(async () => {  
        try {  
            await this.initialize();  
        } catch (error) {  
            console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);  
              
            // Emit status change event  
            this.emitStatusChange({  
                connected: false,  
                authenticated: false,  
                status: 'reconnect_failed',  
                message: `Reconnection attempt ${this.reconnectAttempts} failed`  
            });  
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
              
            // Emit status change event  
            this.emitStatusChange({  
                connected: false,  
                authenticated: false,  
                status: 'client_destroyed',  
                message: 'WhatsApp client destroyed'  
            });  
        }  
    } catch (error) {  
        if (!error.message.includes('Session closed') &&   
            !error.message.includes('page has been closed') &&  
            !error.message.includes('Protocol error')) {  
            console.error('❌ Error destroying client:', error);  
              
            // Emit status change event  
            this.emitStatusChange({  
                connected: false,  
                authenticated: false,  
                status: 'error',  
                message: `Error destroying client: ${error.message}`  
            });  
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
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            status: 'clearing_session',  
            message: 'Clearing session data...'  
        });  
          
        if (fs.existsSync(this.sessionPath)) {  
            fs.rmSync(this.sessionPath, { recursive: true, force: true });  
            console.log('✅ Session cleared successfully');  
              
            // Emit status change event  
            this.emitStatusChange({  
                connected: false,  
                authenticated: false,  
                status: 'session_cleared',  
                message: 'Session cleared successfully'  
            });  
        }  
    } catch (error) {  
        console.error('❌ Error clearing session:', error);  
          
        // Emit status change event  
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
        lastUpdated: new Date().toISOString()  
    };  
      
    // Emit stats update event  
    this.emitStatsUpdate(statsData);  
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
          
    } catch (error) {  
        console.log('📊 Bot info: Error getting bot info', error.message);  
        this.botInfo = {  
            pushname: 'Connected',  
            platform: 'Unknown',  
            version: 'Unknown',  
            phoneNumber: 'Unknown',  
            connectedSince: this.connectionTime ? this.connectionTime.toISOString() : new Date().toISOString()  
        };  
    }  
}  

async handleInitializationError(error) {  
    console.error('❌ Initialization error:', error.message);  
      
    // Emit status change event  
    this.emitStatusChange({  
        connected: false,  
        authenticated: false,  
        status: 'error',  
        message: `Initialization error: ${error.message}`  
    });  
      
    if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {  
        console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            status: 'retrying',  
            message: 'Session issue detected. Retrying...'  
        });  
          
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
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: this.isConnected,  
            authenticated: this.isAuthenticated,  
            status: 'message_error',  
            message: `Failed to process message from ${message.from}: ${error.message}`  
        });  
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
        formattedUptime: this.getFormattedUptime()  
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
      
    // Emit status change event  
    this.emitStatusChange({  
        connected: false,  
        authenticated: false,  
        status: 'shutdown',  
        message: 'Bot is shutting down...'  
    });  
      
    try {  
        this.stopStatsBroadcasting();  
        await this.safeDestroyClient();  
          
        this.isConnected = false;  
        this.isAuthenticated = false;  
        this.currentQR = null;  
        this.reconnectAttempts = 0;  
        this.connectionTime = null;  
          
        console.log('✅ Bot shutdown completed gracefully');  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            status: 'shutdown_complete',  
            message: 'Bot shutdown completed'  
        });  
    } catch (error) {  
        console.error('❌ Error during shutdown:', error);  
          
        // Emit status change event  
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
      
    // Emit status change event  
    this.emitStatusChange({  
        connected: false,  
        authenticated: false,  
        status: 'logging_out',  
        message: 'Manual logout requested...'  
    });  
      
    try {  
        this.isShuttingDown = true;  
        await this.safeDestroyClient();  
        await this.clearSession();  
          
        this.currentQR = null;  
        this.isConnected = false;  
        this.isAuthenticated = false;  
        this.connectionTime = null;  
          
        console.log('🔓 Logout completed. QR code will be required on next start.');  
          
        // Emit status change event  
        this.emitStatusChange({  
            connected: false,  
            authenticated: false,  
            status: 'logged_out',  
            message: 'Logout completed. QR code required.'  
        });  
          
        setTimeout(() => {  
            this.isShuttingDown = false;  
            this.initialize().catch(console.error);  
        }, 2000);  
          
    } catch (error) {  
        console.error('❌ Logout error:', error);  
          
        // Emit status change event  
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
      
    // Emit status change event  
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
          
        // Emit status change event  
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
      
    // Emit order update event  
    this.emitOrderUpdate({  
        type: 'new_order',  
        orderId: orderData.orderId || `order_${Date.now()}`,  
        customer: orderData.customer || 'Unknown',  
        totalOrders: this.stats.totalOrders,  
        pendingOrders: this.stats.pendingOrders,  
        completedOrders: this.stats.completedOrders  
    });  
      
    this.broadcastCurrentStats();  
}  

trackPendingOrder(orderData = {}) {  
    this.stats.pendingOrders++;  
      
    // Emit order update event  
    this.emitOrderUpdate({  
        type: 'pending_order',  
        orderId: orderData.orderId || `order_${Date.now()}`,  
        customer: orderData.customer || 'Unknown',  
        totalOrders: this.stats.totalOrders,  
        pendingOrders: this.stats.pendingOrders,  
        completedOrders: this.stats.completedOrders  
    });  
      
    this.broadcastCurrentStats();  
}  

trackCompletedOrder(orderData = {}) {  
    this.stats.completedOrders++;  
    if (this.stats.pendingOrders > 0) {  
        this.stats.pendingOrders--;  
    }  
      
    // Emit order update event  
    this.emitOrderUpdate({  
        type: 'completed_order',  
        orderId: orderData.orderId || `order_${Date.now()}`,  
        customer: orderData.customer || 'Unknown',  
        totalOrders: this.stats.totalOrders,  
        pendingOrders: this.stats.pendingOrders,  
        completedOrders: this.stats.completedOrders  
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

// Start bot automatically after a delay
setTimeout(() => {
const startBot = async (attempt = 1) => {
try {
console.log("🚀 Starting WhatsApp bot (attempt ${attempt}/3)...");
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

}, 3000); // Wait 3 seconds for server to initialize

export { createWhatsAppBot, getWhatsAppBot };
export default bot;

