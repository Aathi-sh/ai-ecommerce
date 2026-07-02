// bot.js - PROFESSIONAL MULTI-TENANT VERSION with LocalAuth (FIXED)
// FIXED: QR emission, multi-tenant support, connection handling

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
        
        // QR properties - FIXED
        this.currentQR = null;
        this.qrGeneratedAt = null;
        this.qrTimeout = null;
        this.qrExpiryTime = 60000; // 60 seconds
        this.isWaitingForScan = false;
        this.qrGenerated = false;
        this.lastEmittedQR = null; // Track last emitted QR to avoid duplicates
        
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
        this.messageQueue = new Map();
        this.processingQueue = new Map();
        this.batchWriteQueue = [];
        this.batchWriteInterval = null;
        
        // Initialize statistics
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
                    const concurrency = 5;
                    for (let i = 0; i < batch.length; i += concurrency) {
                        const chunk = batch.slice(i, i + concurrency);
                        await Promise.allSettled(chunk.map(item => this.processBatchItem(item)));
                    }
                } catch (error) {
                    console.error('Batch write error:', error.message);
                }
            }
        }, 5000);
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
        
        // Prevent duplicate emissions of the same QR
        if (qrData?.qr === this.lastEmittedQR && qrData?.companyId === this.companyId) {
            console.log(`⏭️ Skipping duplicate QR emission`);
            return;
        }
        
        if (qrData?.qr) {
            this.lastEmittedQR = qrData.qr;
        }
        
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
        console.log(`🔍 Current state - Connected: ${this.isConnected}, Authenticated: ${this.isAuthenticated}`);
        console.log('🔍'.repeat(20) + '\n');
        
        return new Promise((resolve, reject) => {
            try {
                // Reset state before initialization
                this.isConnected = false;
                this.isAuthenticated = false;
                this.currentQR = null;
                this.isWaitingForScan = false;
                this.lastEmittedQR = null;
                
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
                    message: 'Initialization timeout',
                    companyId: this.companyId
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
            this.qrGenerated = true;
            
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
            console.log(`📡 QR Data: ${qr.substring(0, 50)}...`);
            
            // Emit QR to all listeners
            this.emitQRCode(qrData);
            
            // Also emit via the global QR update event (for Socket.IO)
            this.emit('qr-update', qrData);
            
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
                    this.qrGenerated = false;
                    
                    this.emitQRCode({ 
                        qr: null, 
                        companyId: this.companyId,
                        expired: true 
                    });
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
            this.qrGenerated = false;
            this.lastEmittedQR = null;
            
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
            this.qrGenerated = false;
            
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
            this.qrGenerated = false;
            
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
                // Clear session and wait for manual reconnect
                await this.clearSession();
            } else {
                await this.handleReconnection();
            }
        });

        // ========== MESSAGE HANDLER ==========
        this.client.on('message', async (message) => {
            if (message.from === 'status@broadcast' || message.isGroupMsg) return;
            
            if (!message.isNewMsg) {
                console.log(`⏭️ Ignoring old/unread message from ${message.from}`);
                return;
            }
            
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
                
                this.updateMessageStats(message.from);
                
                const processMessage = async () => {
                    await handleMessage(message, this.client, companyId);
                    
                    const duration = Date.now() - startTime;
                    if (duration > 200) {
                        console.log(`⚠️ Slow message processing: ${duration}ms`);
                    }
                };
                
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
        
        const now = Date.now();
        if (now - this.stats.lastMessageReset >= 60000) {
            this.stats.messagesPerMinute = this.stats.totalMessages - this.stats.lastMessageCount;
            this.stats.lastMessageCount = this.stats.totalMessages;
            this.stats.lastMessageReset = now;
        }
        
        if (this.stats.totalMessages % 10 === 0) {
            this.broadcastCurrentStats();
        }
    }

    startStatsBroadcasting() {
        if (this.statsInterval) clearInterval(this.statsInterval);
        
        this.statsInterval = setInterval(() => {
            this.broadcastCurrentStats();
        }, 10000);
        
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
            console.log(`ℹ️ Company ${companyId} already exists, returning existing client`);
            return this.clients.get(companyId);
        }
        
        // Store previous company ID
        const previousCompany = this.companyId;
        this.companyId = companyId;
        
        try {
            await this.initialize();
            // Client will be stored in the map when 'ready' event fires
            return this.client;
        } catch (error) {
            // Restore previous company ID on error
            this.companyId = previousCompany;
            throw error;
        }
    }

    async removeCompany(companyId) {
        const client = this.clients.get(companyId);
        if (!client) {
            console.log(`⚠️ No client found for company ${companyId}, skipping removal.`);
            return;
        }

        const previousClient = this.client;
        const previousCompany = this.companyId;

        this.client = client;
        this.companyId = companyId;

        try {
            // 1. Gracefully destroy the client
            await this.safeDestroyClient();

            // 2. Remove the client from the internal map
            this.clients.delete(companyId);

            // 3. Delete the session folder to force a fresh QR on next connect
            const companySessionPath = path.join(this.sessionPath, `company_${companyId}`);
            if (fs.existsSync(companySessionPath)) {
                fs.rmSync(companySessionPath, { recursive: true, force: true });
                console.log(`🗑️ Session folder deleted for company ${companyId}`);
            }

            // 4. Reset all bot state
            this.isInitializing = false;
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            this.isWaitingForScan = false;
            this.qrGenerated = false;
            this.qrGeneratedAt = null;
            this.reconnectAttempts = 0;
            this.isShuttingDown = false;
            this.lastEmittedQR = null;

            // Clear any pending QR timeout
            if (this.qrTimeout) {
                clearTimeout(this.qrTimeout);
                this.qrTimeout = null;
            }

            // Stop stats broadcasting
            this.stopStatsBroadcasting();

            console.log(`✅ Company ${companyId} removed and bot state fully reset.`);

        } catch (error) {
            console.error(`❌ Failed to remove company ${companyId}:`, error.message);
            // Even on error, reset flags to avoid stuck state
            this.isInitializing = false;
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            this.isWaitingForScan = false;
            this.qrGenerated = false;
            this.reconnectAttempts = 0;
            if (this.qrTimeout) {
                clearTimeout(this.qrTimeout);
                this.qrTimeout = null;
            }
        } finally {
            // Restore the previous client and company ID
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
                console.log(`🛑 Destroying client for company: ${this.companyId || 'unknown'}...`);
                this.isShuttingDown = true;
                
                const companyIdToRemove = this.companyId;
                
                if (companyIdToRemove) {
                    this.clients.delete(companyIdToRemove);
                }
                
                if (this.client.removeAllListeners) {
                    this.client.removeAllListeners();
                }
                
                await this.client.destroy();
                this.client = null;
                
                console.log(`✅ Client destroyed for company: ${companyIdToRemove || 'unknown'}`);
            }
        } catch (error) {
            console.error(`Destroy error:`, error.message);
            this.client = null;
        } finally {
            this.isShuttingDown = false;
        }
    }

    async hasValidSession(companyId) {
        const sessionPath = path.join(this.sessionPath, `company_${companyId}`);
        if (!fs.existsSync(sessionPath)) return false;
        
        const files = fs.readdirSync(sessionPath);
        return files.length > 0;
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
        const isActuallyConnected = this.client && 
                                   this.client.info && 
                                   this.client.info.wid && 
                                   this.isConnected;
        
        const isActuallyAuthenticated = this.client && 
                                       this.isAuthenticated && 
                                       !this.isShuttingDown;
        
        const currentQR = this.getCurrentQR();
        
        return {
            connected: isActuallyConnected,
            authenticated: isActuallyAuthenticated,
            hasQR: !!currentQR,
            qrData: currentQR,
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
            isShuttingDown: this.isShuttingDown,
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

    async refreshQR(companyId) {
        console.log(`🔄 Refreshing QR for company: ${companyId || this.companyId}`);
        
        const targetCompanyId = companyId || this.companyId;
        
        // Clear current QR
        this.currentQR = null;
        this.isWaitingForScan = false;
        this.qrGeneratedAt = null;
        this.qrGenerated = false;
        this.lastEmittedQR = null;
        
        if (this.qrTimeout) {
            clearTimeout(this.qrTimeout);
            this.qrTimeout = null;
        }
        
        // If we have a client, destroy and reinitialize
        if (this.client) {
            await this.safeDestroyClient();
            
            // Wait a moment before reinitializing
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reinitialize with the same company
            if (targetCompanyId) {
                await this.initializeForCompany(targetCompanyId);
            } else {
                await this.initialize();
            }
        } else {
            // Just initialize if no client exists
            if (targetCompanyId) {
                await this.initializeForCompany(targetCompanyId);
            } else {
                await this.initialize();
            }
        }
        
        return { success: true };
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
            
            // Clear all state
            this.isConnected = false;
            this.isAuthenticated = false;
            this.currentQR = null;
            this.isWaitingForScan = false;
            this.qrGeneratedAt = null;
            this.qrGenerated = false;
            this.lastEmittedQR = null;
            
            if (this.qrTimeout) {
                clearTimeout(this.qrTimeout);
                this.qrTimeout = null;
            }
            
            this.stopStatsBroadcasting();
            
            if (this.batchWriteInterval) {
                clearInterval(this.batchWriteInterval);
                this.batchWriteInterval = null;
            }
            
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                hasQR: false,
                status: 'logging_out',
                message: 'Logging out...',
                companyId: currentCompanyId
            });
            
            await this.safeDestroyClient();
            await this.clearSession();
            
            this.qrWebSocketClients.clear();
            this.connectionTime = null;
            this.botInfo = null;
            this.reconnectAttempts = 0;
            
            if (currentCompanyId) {
                this.clients.delete(currentCompanyId);
            }
            
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                hasQR: false,
                status: 'logged_out',
                message: 'Logged out successfully',
                companyId: currentCompanyId
            });
            
            console.log(`✅ Logout complete for company: ${currentCompanyId || 'default'}`);
            
        } catch (error) {
            console.error('Logout error:', error);
            this.emitStatusChange({
                connected: false,
                authenticated: false,
                status: 'logout_error',
                message: `Logout error: ${error.message}`,
                companyId: currentCompanyId
            });
        } finally {
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
    return botInstance;
}

const bot = createWhatsAppBot();

export { createWhatsAppBot, getWhatsAppBot };
export default bot;