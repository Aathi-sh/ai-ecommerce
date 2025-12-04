import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { connectDB } from "../utils/db.js";
import handleMessage from "./messageHandler.js";
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Client, LocalAuth } = pkg;

class WhatsAppBot {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        this.sessionPath = './whatsapp-sessions';
    }

    async initialize() {
        try {
            console.log('🚀 Initializing WhatsApp E-commerce Bot...');
            
            // Connect to database first
            await connectDB();
            console.log('✅ Database connected successfully');
            
            // Initialize WhatsApp client
            await this.initializeClient();
            
        } catch (error) {
            console.error('❌ Bot initialization failed:', error);
            await this.handleInitializationError(error);
        }
    }

    initializeClient() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure session directory exists
                if (!fs.existsSync(this.sessionPath)) {
                    fs.mkdirSync(this.sessionPath, { recursive: true });
                }

                console.log('📁 Session path:', path.resolve(this.sessionPath));
                
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
                            '--disable-gpu'
                        ],
                        timeout: 60000
                    },
                    webVersionCache: {
                        type: 'remote',
                        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
                    }
                });

                this.setupEventHandlers(resolve, reject);
                this.client.initialize();

            } catch (error) {
                reject(new Error(`Client initialization failed: ${error.message}`));
            }
        });
    }

    setupEventHandlers(resolve, reject) {
        let qrGenerated = false;

        this.client.on('qr', (qr) => {
            if (!qrGenerated) {
                console.log('\n📱 WhatsApp Authentication Required');
                console.log('====================================');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Go to Settings → Linked Devices → Link a Device');
                console.log('3. Scan the QR code below:\n');
                qrcode.generate(qr, { small: true });
                console.log('\n====================================');
                qrGenerated = true;
            }
        });

        this.client.on('ready', () => {
            this.isConnected = true;
            this.isAuthenticated = true;
            
            console.log('\n✅ WhatsApp Bot Successfully Initialized');
            console.log('========================================');
            console.log('🤖 E-commerce Bot Status: ONLINE');
            console.log('📱 Phone Number: Connected');
            console.log('💼 Session: PERSISTENT');
            console.log('🛍️  Ready to process customer orders');
            console.log('========================================\n');
            
            // Display bot information
            this.displayBotInfo();
            
            resolve();
        });

        this.client.on('authenticated', () => {
            this.isAuthenticated = true;
            console.log('🔐 Authentication successful - Session saved');
        });

        this.client.on('auth_failure', (error) => {
            this.isAuthenticated = false;
            console.error('❌ Authentication failed:', error);
            console.log('🔄 Will attempt to generate new QR code...');
        });

        this.client.on('disconnected', (reason) => {
            this.isConnected = false;
            this.isAuthenticated = false;
            
            console.log(`🔌 Disconnected: ${reason}`);
            
            if (reason === 'LOGIN_FAILURE' || reason === 'UNAUTHORIZED') {
                console.log('🔄 Login issue detected. Generating new QR code...');
            } else {
                console.log('🔄 Attempting to reconnect in 5 seconds...');
                setTimeout(() => {
                    this.initialize().catch(console.error);
                }, 5000);
            }
        });

        this.client.on('message', async (message) => {
            // Ignore status broadcasts and group messages
            if (message.from === 'status@broadcast' || message.isGroupMsg) {
                return;
            }
            
            try {
                // Log the message with proper phone number formatting
                const phoneNumber = this.formatPhoneNumber(message.from);
                console.log(`📱 Message from ${phoneNumber}: ${message.body}`);
                
                await handleMessage(message, this.client);
            } catch (error) {
                console.error('❌ Message processing error:', error);
                await this.handleMessageError(message, error);
            }
        });

        // Monitor connection state
        this.client.on('change_state', (state) => {
            console.log(`🔄 Connection state: ${state}`);
        });
    }

    // Format phone numbers properly for Indian numbers
    formatPhoneNumber(whatsappId) {
        try {
            // Remove any suffixes like @c.us, @lid, etc.
            let phoneNumber = whatsappId.split('@')[0];
            
            // Handle Indian phone numbers (remove country code if present)
            if (phoneNumber.startsWith('91') && phoneNumber.length > 10) {
                // Remove country code and format
                phoneNumber = phoneNumber.substring(2);
            }
            
            // Format as Indian phone number
            if (phoneNumber.length === 10) {
                return `+91 ${phoneNumber.substring(0, 5)} ${phoneNumber.substring(5)}`;
            }
            
            return `+${phoneNumber}`;
            
        } catch (error) {
            return whatsappId; // Return original if formatting fails
        }
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
        } catch (error) {
            console.log('📊 Bot info: Connected to WhatsApp');
        }
    }

    async handleInitializationError(error) {
        console.error('❌ Initialization error:', error.message);
        
        // For session-related errors, wait and retry
        if (error.message.includes('session') || error.message.includes('auth')) {
            console.log('🔄 Session issue detected. Retrying in 10 seconds...');
            setTimeout(() => {
                this.initialize().catch(console.error);
            }, 10000);
        }
    }

    async handleMessageError(message, error) {
        try {
            await message.reply(
                '⚠️ We encountered a temporary issue. Please try your request again.'
            );
        } catch (replyError) {
            console.error('❌ Failed to send error response:', replyError);
        }
    }

    async shutdown() {
        console.log('\n🛑 Initiating graceful shutdown...');
        
        try {
            if (this.client) {
                await this.client.destroy();
                this.client = null;
            }
            
            this.isConnected = false;
            this.isAuthenticated = false;
            console.log('✅ Bot shutdown completed gracefully');
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }

    // Method to manually logout (clear session)
    async logout() {
        console.log('\n🚪 Manual logout requested...');
        try {
            if (this.client) {
                await this.client.logout();
            }
            
            // Clear session files
            if (fs.existsSync(this.sessionPath)) {
                fs.rmSync(this.sessionPath, { recursive: true, force: true });
                console.log('✅ Session cleared successfully');
            }
            
            console.log('🔓 Logout completed. QR code will be required on next start.');
        } catch (error) {
            console.error('❌ Logout error:', error);
        }
    }
}

// Process event handlers for graceful shutdown
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

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

// Bot instance and startup
const bot = new WhatsAppBot();

// Initialize bot
bot.initialize().catch((error) => {
    console.error('❌ Bot startup failed:', error);
    process.exit(1);
});

export default bot;


