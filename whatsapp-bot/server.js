import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import bot from "../whatsapp-bot/whatsap/bot.js";
import { qrSocketServer } from './services/qrSocketServer.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.BOT_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/status', (req, res) => {
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
});

app.get('/api/qr', (req, res) => {
    const qr = bot.getCurrentQR();
    res.json({
        success: true,
        qr: qr,
        hasQr: !!qr,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/stats', (req, res) => {
    const status = bot.getStatus();
    res.json({
        success: true,
        stats: status.stats,
        lastUpdated: new Date().toISOString()
    });
});

app.get('/api/bot', (req, res) => {
    const status = bot.getStatus();
    res.json({
        success: true,
        ...status
    });
});

app.post('/api/connect', async (req, res) => {
    try {
        await bot.initialize();
        res.json({
            success: true,
            message: 'Bot connection initiated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
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
        res.status(500).json({
            success: false,
            error: error.message
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
        res.status(500).json({
            success: false,
            error: error.message
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
        res.status(500).json({
            success: false,
            error: error.message
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
        res.status(500).json({
            success: false,
            error: error.message
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
        res.status(500).json({
            success: false,
            error: error.message
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    const status = bot.getStatus();
    res.json({
        status: 'healthy',
        bot: status.connected ? 'connected' : 'disconnected',
        uptime: status.formattedUptime,
        timestamp: new Date().toISOString()
    });
});

// Initialize WebSocket server
qrSocketServer.initialize(server);

// Start server
server.listen(PORT, () => {
    console.log(`🤖 WhatsApp Bot Server running on port ${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`📡 WebSocket URL: ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down bot server...');
    await bot.shutdown();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('🛑 Terminating bot server...');
    await bot.shutdown();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

export default server;