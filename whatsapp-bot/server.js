import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import bot from './whatsap/bot.js';
import { qrSocketServer } from './services/qrSocketServer.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.BOT_PORT || 3001;

// Simple and effective CORS setup
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS to all routes
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle OPTIONS/preflight requests manually
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(200).end();
    }
    next();
});

// API Routes
app.get('/api/status', (req, res) => {
    try {
        const status = bot.getStatus();
        res.json({
            success: true,
            qr: bot.getCurrentQR(),
            status: status.connected ? 'connected' : 
                   bot.getCurrentQR() ? 'qr_required' : 'disconnected',
            message: status.connected ? 'WhatsApp is connected' : 
                    bot.getCurrentQR() ? 'QR code required' : 'Not connected',
            stats: status.stats,
            botInfo: status.botInfo,
            reconnectAttempts: status.reconnectAttempts
        });
    } catch (error) {
        console.error('❌ API Status Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

app.get('/api/qr', (req, res) => {
    try {
        const qr = bot.getCurrentQR();
        res.json({
            success: true,
            qr: qr,
            hasQr: !!qr,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ API QR Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

app.get('/api/stats', (req, res) => {
    try {
        const status = bot.getStatus();
        res.json({
            success: true,
            stats: status.stats,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ API Stats Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

app.get('/api/bot', (req, res) => {
    try {
        const status = bot.getStatus();
        res.json({
            success: true,
            connected: status.connected,
            authenticated: status.authenticated,
            hasQR: !!bot.getCurrentQR(),
            botInfo: status.botInfo,
            stats: status.stats,
            reconnectAttempts: status.reconnectAttempts,
            uptime: status.formattedUptime
        });
    } catch (error) {
        console.error('❌ API Bot Info Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

app.post('/api/connect', async (req, res) => {
    try {
        await bot.initialize();
        res.json({
            success: true,
            message: 'Bot connection initiated'
        });
    } catch (error) {
        console.error('❌ API Connect Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to connect bot'
        });
    }
});

app.post('/api/disconnect', async (req, res) => {
    try {
        await bot.safeDestroyClient();
        res.json({
            success: true,
            message: 'Bot disconnected successfully'
        });
    } catch (error) {
        console.error('❌ API Disconnect Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to disconnect bot'
        });
    }
});

app.post('/api/restart', async (req, res) => {
    try {
        await bot.restart();
        res.json({
            success: true,
            message: 'Bot restart initiated'
        });
    } catch (error) {
        console.error('❌ API Restart Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to restart bot'
        });
    }
});

app.post('/api/logout', async (req, res) => {
    try {
        await bot.logout();
        res.json({
            success: true,
            message: 'Bot logged out successfully'
        });
    } catch (error) {
        console.error('❌ API Logout Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to logout bot'
        });
    }
});

app.post('/api/send-message', async (req, res) => {
    try {
        const { to, message } = req.body;
        
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and message are required'
            });
        }
        
        const result = await bot.sendMessage(to, message);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
        
    } catch (error) {
        console.error('❌ API Send Message Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send message'
        });
    }
});

app.post('/api/clear-session', async (req, res) => {
    try {
        await bot.clearSession();
        res.json({
            success: true,
            message: 'Session cleared successfully'
        });
    } catch (error) {
        console.error('❌ API Clear Session Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to clear session'
        });
    }
});

app.delete('/api/clear-all', async (req, res) => {
    try {
        await bot.clearSession();
        await bot.shutdown();
        
        res.json({
            success: true,
            message: 'All sessions cleared and bot stopped'
        });
    } catch (error) {
        console.error('❌ API Clear All Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to clear all sessions'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    try {
        const status = bot.getStatus();
        res.json({
            status: 'healthy',
            server: 'running',
            bot: status.connected ? 'connected' : 'disconnected',
            uptime: status.formattedUptime,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Health Check Error:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message || 'Server error'
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'WhatsApp Bot Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            status: '/api/status',
            qr: '/api/qr',
            stats: '/api/stats',
            bot: '/api/bot',
            health: '/health'
        },
        timestamp: new Date().toISOString()
    });
});

// Start server FIRST, then initialize WebSocket
server.listen(PORT, () => {
    console.log('========================================');
    console.log('🤖 WhatsApp Bot Server');
    console.log('========================================');
    console.log(`✅ Server running on port: ${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log('========================================');
    
    // Initialize WebSocket server AFTER server is listening
    qrSocketServer.initialize(server);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received shutdown signal (SIGINT)');
    console.log('Shutting down bot server...');
    
    try {
        await bot.shutdown();
    } catch (error) {
        console.error('Error during bot shutdown:', error);
    }
    
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received termination signal (SIGTERM)');
    console.log('Terminating bot server...');
    
    try {
        await bot.shutdown();
    } catch (error) {
        console.error('Error during bot shutdown:', error);
    }
    
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

export default server;