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



import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import handleMessage from "./messageHandler.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
        
        // Initialize statistics
        this.stats = {
            totalOrders: 0,
            totalChats: 0,
            totalCustomers: new Set(),
            totalMessages: 0
        };
        
        this.statsInterval = null;
    }

    async initialize() {
        if (this.isInitializing) {
            console.log('🔄 Bot initialization already in progress...');
            return;
        }

        this.isInitializing = true;
        
        try {
            console.log('🚀 Initializing WhatsApp E-commerce Bot...');
            
            // Clear any existing client
            if (this.client) {
                await this.safeDestroyClient();
            }

            // Initialize WhatsApp client
            await this.initializeClient();
            
            this.reconnectAttempts = 0; // Reset on successful initialization
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
                        clientId: "ecommerce-bot",
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
                            '--single-process',
                            '--no-zygote'
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
                reject(error);
            }
        }, 120000);

        this.client.on('qr', async (qr) => {
            clearTimeout(initializationTimeout);
            
            this.currentQR = qr;
            
            // Broadcast QR to frontend
            qrSocketServer.broadcastQR(qr);
            qrSocketServer.broadcastStatus('qr_required', 'Scan QR code to connect WhatsApp');
            
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
            
            console.log('\n✅ WhatsApp Bot Successfully Initialized');
            console.log('========================================');
            console.log('🤖 E-commerce Bot Status: ONLINE');
            console.log('📱 Phone Number: Connected');
            console.log('💼 Session: PERSISTENT');
            console.log('🛍️  Ready to process customer orders');
            console.log('========================================\n');
            
            // Broadcast connection status
            qrSocketServer.broadcastStatus('connected', 'WhatsApp is connected and ready');
            
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
            qrSocketServer.broadcastStatus('authenticated', 'WhatsApp authentication successful');
        });

        this.client.on('auth_failure', (error) => {
            clearTimeout(initializationTimeout);
            
            this.isAuthenticated = false;
            console.error('❌ Authentication failed:', error);
            qrSocketServer.broadcastStatus('auth_failed', 'Authentication failed. New QR code will be generated.');
            
            reject(new Error(`Authentication failed: ${error.message}`));
        });

        this.client.on('disconnected', async (reason) => {
            console.log(`🔌 Disconnected: ${reason}`);
            
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;

            // Stop stats broadcasting when disconnected
            this.stopStatsBroadcasting();
            
            qrSocketServer.broadcastStatus('disconnected', `WhatsApp disconnected: ${reason}`);
            
            // Handle different disconnect reasons
            if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {
                console.log('🔄 Login issue detected. Generating new QR code...');
                qrSocketServer.broadcastStatus('qr_required', 'Reconnecting WhatsApp...');
                
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
                
                await handleMessage(message, this.client);
            } catch (error) {
                console.error('❌ Message processing error:', error);
                await this.handleMessageError(message, error);
            }
        });

        // Monitor connection state
        this.client.on('change_state', (state) => {
            console.log(`🔄 Connection state: ${state}`);
            qrSocketServer.broadcastStatus('state_change', `Connection state: ${state}`);
        });

        // Loading screen events
        this.client.on('loading_screen', (percent, message) => {
            console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);
            qrSocketServer.broadcastStatus('loading', `Loading: ${percent}% - ${message}`);
        });

        // Handle page errors
        this.client.on('page_error', (error) => {
            console.error('❌ Page error:', error);
        });
    }

    async handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`💥 Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
            qrSocketServer.broadcastStatus('error', 'Maximum reconnection attempts reached. Manual intervention required.');
            return;
        }

        this.reconnectAttempts++;
        const delay = 5000 * this.reconnectAttempts; // Exponential backoff
        
        console.log(`🔄 Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        qrSocketServer.broadcastStatus('reconnecting', `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(async () => {
            try {
                await this.initialize();
            } catch (error) {
                console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);
            }
        }, delay);
    }

    async safeDestroyClient() {
        try {
            if (this.client) {
                console.log('🛑 Safely destroying existing client...');
                await this.client.destroy();
                this.client = null;
                console.log('✅ Client destroyed safely');
            }
        } catch (error) {
            console.error('❌ Error destroying client:', error);
            this.client = null; // Force nullify even if destruction fails
        }
    }

    async clearSession() {
        try {
            console.log('🧹 Clearing session data...');
            if (fs.existsSync(this.sessionPath)) {
                fs.rmSync(this.sessionPath, { recursive: true, force: true });
                console.log('✅ Session cleared successfully');
            }
        } catch (error) {
            console.error('❌ Error clearing session:', error);
        }
    }

    // Update statistics when message is received
    updateMessageStats(from) {
        this.stats.totalMessages++;
        this.stats.totalCustomers.add(from);
        this.stats.totalChats = this.stats.totalCustomers.size;
        
        // Broadcast updated stats immediately
        this.broadcastCurrentStats();
    }

    // Method to track new orders
    trackNewOrder() {
        this.stats.totalOrders++;
        this.broadcastCurrentStats();
    }

    // Start broadcasting stats periodically
    startStatsBroadcasting() {
        // Broadcast initial stats
        this.broadcastCurrentStats();
        
        // Update stats every 3 seconds
        this.statsInterval = setInterval(() => {
            this.broadcastCurrentStats();
        }, 3000);
        
        console.log('📊 Started statistics broadcasting');
    }

    // Stop broadcasting stats
    stopStatsBroadcasting() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
            console.log('📊 Stopped statistics broadcasting');
        }
    }

    // Broadcast current statistics
    broadcastCurrentStats() {
        const statsData = {
            totalOrders: this.stats.totalOrders,
            totalChats: this.stats.totalChats,
            totalCustomers: this.stats.totalCustomers.size,
            totalMessages: this.stats.totalMessages,
            lastUpdated: new Date().toISOString()
        };
        
        qrSocketServer.broadcastStats(statsData);
    }

    // Display bot information
    async displayBotInfo() {
        try {
            const info = await this.client.getInfo();
            console.log('🤖 Bot Information:');
            console.log('───────────────────');
            console.log(`📱 WhatsApp: ${info.pushname || 'Connected'}`);
            console.log(`🌐 Platform: ${info.platform || 'Unknown'}`);
            console.log(`📊 Version: ${info.waVersion || 'Unknown'}`);
            console.log('───────────────────\n');
            
            // Broadcast bot info
            qrSocketServer.broadcastStatus('bot_info', {
                pushname: info.pushname,
                platform: info.platform,
                version: info.waVersion
            });
            
        } catch (error) {
            console.log('📊 Bot info: Connected to WhatsApp');
        }
    }

    async handleInitializationError(error) {
        console.error('❌ Initialization error:', error.message);
        qrSocketServer.broadcastStatus('error', `Initialization error: ${error.message}`);
        
        // For session-related errors, wait and retry
        if (error.message.includes('session') || error.message.includes('auth') || error.message.includes('context')) {
            console.log('🔄 Session/context issue detected. Retrying in 10 seconds...');
            qrSocketServer.broadcastStatus('retrying', 'Session issue detected. Retrying...');
            
            // Clear session and retry
            await this.clearSession();
            
            setTimeout(() => {
                this.initialize().catch(console.error);
            }, 10000);
        } else {
            // For other errors, use reconnection logic
            await this.handleReconnection();
        }
    }

    async handleMessageError(message, error) {
        try {
            // Don't send error response for context destroyed errors (user won't see it anyway)
            if (error.message.includes('Execution context was destroyed')) {
                console.log('⚠️ Message failed due to context destruction - skipping error response');
                return;
            }
            
            await message.reply(
                '⚠️ We encountered a temporary issue. Please try your request again.'
            );
        } catch (replyError) {
            console.error('❌ Failed to send error response:', replyError);
        }
    }

    // Get current QR code (for API endpoints)
    getCurrentQR() {
        return this.currentQR;
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.isConnected,
            authenticated: this.isAuthenticated,
            hasQR: !!this.currentQR,
            stats: {
                totalOrders: this.stats.totalOrders,
                totalChats: this.stats.totalChats,
                totalCustomers: this.stats.totalCustomers.size,
                totalMessages: this.stats.totalMessages
            },
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }

    async shutdown() {
        console.log('\n🛑 Initiating graceful shutdown...');
        qrSocketServer.broadcastStatus('shutdown', 'Bot is shutting down...');
        
        try {
            this.stopStatsBroadcasting();
            await this.safeDestroyClient();
            
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            this.reconnectAttempts = 0;
            
            console.log('✅ Bot shutdown completed gracefully');
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }

    // Method to manually logout (clear session)
    async logout() {
        console.log('\n🚪 Manual logout requested...');
        qrSocketServer.broadcastStatus('logging_out', 'Manual logout requested...');
        
        try {
            await this.safeDestroyClient();
            await this.clearSession();
            
            this.currentQR = null;
            this.isConnected = false;
            this.isAuthenticated = false;
            
            console.log('🔓 Logout completed. QR code will be required on next start.');
            qrSocketServer.broadcastStatus('logged_out', 'Logout completed. QR code required.');
            
            // Restart the bot
            setTimeout(() => {
                this.initialize().catch(console.error);
            }, 2000);
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            qrSocketServer.broadcastStatus('error', `Logout error: ${error.message}`);
        }
    }
}

// Enhanced global error handlers
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    qrSocketServer.broadcastStatus('error', `Uncaught exception: ${error.message}`);
    
    // Don't exit for Puppeteer context errors
    if (error.message.includes('Execution context was destroyed')) {
        console.log('⚠️ Context error detected - continuing operation');
        return;
    }
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    
    // Don't log context destruction errors as critical
    if (reason.message && reason.message.includes('Execution context was destroyed')) {
        console.log('⚠️ Context destruction detected in promise - this is normal during reconnections');
        return;
    }
    
    qrSocketServer.broadcastStatus('error', `Unhandled rejection: ${reason.message || reason}`);
});

// Bot instance and startup
const bot = new WhatsAppBot();

// Initialize bot with retry logic
const startBot = async (attempt = 1) => {
    try {
        await bot.initialize();
    } catch (error) {
        console.error(`❌ Bot startup failed (attempt ${attempt}):`, error);
        
        if (attempt < 3) {
            console.log(`🔄 Retrying startup in 10 seconds... (${attempt + 1}/3)`);
            setTimeout(() => startBot(attempt + 1), 10000);
        } else {
            console.error('💥 Maximum startup attempts reached. Exiting.');
            qrSocketServer.broadcastStatus('error', 'Bot failed to start after multiple attempts');
            process.exit(1);
        }
    }
};

// Start the bot
startBot().catch(console.error);

export default bot;