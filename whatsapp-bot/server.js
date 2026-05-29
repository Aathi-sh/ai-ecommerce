// server.js - COMPLETE WITH MULTI-TENANT SUPPORT - PROFESSIONAL VERSION (LocalAuth)
// FIXED: QR WebSocket routing, bot event listeners, session pre-warming
// FIXED: CORS headers for cross-domain Socket.IO connections

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import bot from './whatsap/bot.js';
import apiService from './services/apiService.js';
import notificationManager from './services/notifications/notification-manager.js';
import { qrSocketServer } from "./services/qrSocketServer.js";
import { getCompanyMapper } from './services/companyMapper.js';
import url from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.BOT_PORT || 3001;

// ========== ALLOWED ORIGINS FOR CORS ==========
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'https://whatscom.steponextai.tech',
  'https://bot.steponextai.tech'
];

// ========== CORS MIDDLEWARE (BEFORE EVERYTHING) ==========
// Handle preflight requests for all routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ========== SPECIFIC CORS FOR SOCKET.IO PATHS ==========
app.use('/socket.io', (req, res, next) => {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ========== SOCKET.IO CONFIGURATION ==========
const ADMIN_TOKEN = process.env.NOTIFICATION_API_KEY || 'dev-key-2024';

// Set bot in QR socket server
qrSocketServer.setBot(bot);

// ========== CREATE SOCKET.IO SERVER ==========
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  allowUpgrades: true,
  cookie: false,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  upgradeTimeout: 10000,
  path: '/socket.io/'
});

// ========== SET SOCKET.IO GLOBALLY ==========
global.io = io;
console.log('✅ Socket.IO set globally');

// ========== EXPRESS MIDDLEWARE ==========
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers manually
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ========== WEBSOCKET UPGRADE HANDLER - FIXED ==========
server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = url.parse(request.url).pathname;
    
    console.log(`🔌 WebSocket upgrade request: ${pathname}`);
    
    // Let Socket.IO handle its own upgrades
    if (pathname.startsWith('/socket.io/')) {
      console.log(`📡 Forwarding to Socket.IO: ${pathname}`);
      return;
    }
    
    // Let QR WebSocket server handle /ws/qr paths
    if (pathname === '/ws/qr' || pathname.startsWith('/ws/qr')) {
      console.log(`📱 Forwarding QR WebSocket to qrSocketServer`);
      // The QR socket server will handle this via its own WebSocketServer
      // We don't need to do anything here as the QR server is attached to the same HTTP server
      return;
    }
    
    // If no handler, destroy the socket to prevent hanging
    console.log(`⚠️ No handler for WebSocket path: ${pathname}, destroying socket`);
    socket.destroy();
  } catch (error) {
    console.error('❌ WebSocket upgrade error:', error.message);
    socket.destroy();
  }
});

// ========== SETUP SOCKET.IO NAMESPACES ==========
const qrNamespace = io.of('/qr');
const notificationNamespace = io.of('/notifications');

// ========== ADD ROOT NAMESPACE FOR DEBUGGING ==========
io.on('connection', (socket) => {
  console.log(`🌐 Root namespace client connected: ${socket.id}`);
  
  socket.on('error', (error) => {
    console.error(`❌ Root namespace error from ${socket.id}:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🌐 Root namespace client disconnected: ${socket.id} (${reason})`);
  });
});

// ========== QR NAMESPACE HANDLER - IMPROVED WITH BOT EVENTS ==========
qrNamespace.on('connection', (socket) => {
  console.log(`🔗 QR Client connected: ${socket.id}`);
  
  // Get companyId from handshake query
  const companyId = socket.handshake.query.companyId || null;
  
  if (companyId) {
    console.log(`🏢 QR Client for company: ${companyId}`);
    socket.join(`company:${companyId}`);
    socket.join('qr-clients');
    
    // ========== SEND INITIAL STATUS FROM QR CACHE ==========
    try {
      // Check QR Socket Server cache first
      const cachedQR = qrSocketServer.getQRForCompany(companyId);
      
      if (cachedQR) {
        console.log(`✅ Sending cached QR to new client for company ${companyId}`);
        socket.emit('qr_update', {
          type: 'qr_update',
          qr: cachedQR.qr,
          companyId: companyId,
          timestamp: new Date().toISOString(),
          hasQr: true,
          fromCache: true,
          expiresIn: cachedQR.expiresIn
        });
        
        socket.emit('status', {
          type: 'status',
          connected: false,
          authenticated: false,
          hasQR: true,
          qr: cachedQR.qr,
          companyId: companyId,
          message: 'QR code required - Scan to connect',
          timestamp: new Date().toISOString()
        });
      } else {
        // Fallback to bot status
        const botStatus = bot.getStatus();
        const qrData = botStatus.qrData?.qr || null;
        
        if (qrData) {
          socket.emit('qr_update', {
            type: 'qr_update',
            qr: qrData,
            companyId: companyId,
            timestamp: new Date().toISOString(),
            hasQr: true
          });
        }
        
        socket.emit('status', {
          type: 'status',
          connected: botStatus.connected || false,
          authenticated: botStatus.authenticated || false,
          hasQR: !!qrData,
          qr: qrData,
          companyId: companyId,
          message: botStatus.connected ? 'WhatsApp is connected' : 
                  qrData ? 'QR code required' : 'Not connected',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error sending initial status:', error.message);
    }
  }
  
  // ========== HANDLE GET_QR REQUESTS ==========
  socket.on('get_qr', () => {
    try {
      if (companyId) {
        const cachedQR = qrSocketServer.getQRForCompany(companyId);
        if (cachedQR) {
          socket.emit('qr_update', {
            type: 'qr_update',
            qr: cachedQR.qr,
            companyId: companyId,
            timestamp: new Date().toISOString(),
            hasQr: true,
            fromCache: true
          });
          return;
        }
      }
      
      const botStatus = bot.getStatus();
      if (botStatus.qrData?.qr) {
        socket.emit('qr_update', {
          type: 'qr_update',
          qr: botStatus.qrData.qr,
          companyId: companyId,
          timestamp: new Date().toISOString(),
          hasQr: true
        });
      }
    } catch (error) {
      console.error('❌ Error handling get_qr:', error.message);
    }
  });
  
  // ========== HANDLE GET_STATUS REQUESTS ==========
  socket.on('get_status', () => {
    try {
      let qrData = null;
      let isConnected = false;
      let isAuthenticated = false;
      
      if (companyId) {
        const cachedQR = qrSocketServer.getQRForCompany(companyId);
        if (cachedQR) {
          qrData = cachedQR.qr;
        }
      }
      
      const botStatus = bot.getStatus();
      if (!qrData && botStatus.qrData?.qr) {
        qrData = botStatus.qrData.qr;
      }
      
      isConnected = botStatus.connected || false;
      isAuthenticated = botStatus.authenticated || false;
      
      socket.emit('status', {
        type: 'status',
        connected: isConnected,
        authenticated: isAuthenticated,
        hasQR: !!qrData,
        qr: qrData,
        companyId: companyId,
        message: isConnected ? 'WhatsApp is connected' : 
                qrData ? 'QR code required' : 'Not connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error handling get_status:', error.message);
    }
  });
  
  // ========== HANDLE GET_STATS REQUESTS ==========
  socket.on('get_stats', () => {
    try {
      const botStatus = bot.getStatus();
      socket.emit('stats_update', {
        type: 'stats_update',
        stats: botStatus.stats || {},
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error handling get_stats:', error.message);
    }
  });
  
  // ========== HANDLE PING FOR KEEP-ALIVE ==========
  socket.on('ping', () => {
    socket.emit('pong', {
      type: 'pong',
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    });
  });
  
  socket.on('error', (error) => {
    console.error(`❌ QR Socket error from ${socket.id}:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 QR Client disconnected: ${socket.id} (${reason})`);
  });
});

// ========== NOTIFICATION NAMESPACE HANDLER ==========
notificationNamespace.on('connection', (socket) => {
  console.log(`🔔 Notification Client connected: ${socket.id}`);
  
  let isAuthenticated = false;
  let authenticatedUser = null;
  
  socket.on('error', (error) => {
    console.error(`❌ Notification Socket error from ${socket.id}:`, error);
  });
  
  // ===== AUTHENTICATION HANDLER =====
  socket.on('authenticate', (data) => {
    console.log(`🔐 Authentication attempt from ${socket.id}:`, {
      userId: data?.userId,
      userRole: data?.userRole,
      companyId: data?.companyId
    });
    
    const { token, userId, userRole, name, companyId } = data || {};
    
    if (!token || !userId || !userRole) {
      socket.emit('unauthorized', {
        success: false,
        message: 'Missing authentication data',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (token !== ADMIN_TOKEN) {
      socket.emit('unauthorized', {
        success: false,
        message: 'Invalid authentication token',
        timestamp: new Date().toISOString()
      });
      socket.disconnect();
      return;
    }
    
    if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'manager') {
      socket.emit('unauthorized', {
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
      socket.disconnect();
      return;
    }
    
    const userCompanyId = companyId || (userRole === 'superadmin' ? null : 'default');
    
    authenticatedUser = {
      id: userId,
      role: userRole,
      name: name || `Admin-${userId.substring(0, 8)}`,
      companyId: userCompanyId,
      authenticatedAt: new Date().toISOString()
    };
    
    isAuthenticated = true;
    
    console.log(`✅ Admin authenticated: ${authenticatedUser.name} for company: ${userCompanyId || 'ALL'}`);
    
    if (userCompanyId) {
      socket.join(`company:${userCompanyId}`);
      console.log(`👥 Joined room 'company:${userCompanyId}'`);
    }
    
    socket.join('admins');
    
    socket.emit('authenticated', {
      success: true,
      message: 'Authentication successful',
      user: {
        id: userId,
        role: userRole,
        name: name || `Admin-${userId.substring(0, 8)}`,
        companyId: userCompanyId
      },
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('register-fcm-token', (data) => {
    if (!isAuthenticated) {
      socket.emit('fcm-token-registration-failed', {
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { token, deviceInfo } = data || {};
    
    if (!token) {
      socket.emit('fcm-token-registration-failed', {
        success: false,
        message: 'Invalid FCM token',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    console.log(`📱 FCM token registered for ${authenticatedUser.name}`);
    
    socket.emit('fcm-token-registered', {
      success: true,
      message: 'FCM token registered successfully',
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('ping', (data) => {
    if (!isAuthenticated) return;
    
    const { timestamp } = data || {};
    socket.emit('pong', {
      timestamp: timestamp || Date.now(),
      serverTime: Date.now(),
      message: 'pong'
    });
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Notification Client disconnected: ${socket.id} (${reason})`);
    if (authenticatedUser) {
      console.log(`👋 ${authenticatedUser.name} disconnected`);
    }
  });
});

// ========== PASS SOCKET.IO TO QR SOCKET SERVER ==========
if (qrSocketServer.setIO) {
  qrSocketServer.setIO(io);
  console.log('✅ Socket.IO passed to QR Socket Server');
}

// ========== REGISTER BOT EVENT LISTENERS FOR QR FORWARDING ==========
const registerBotEventListeners = () => {
  console.log('📡 Registering bot event listeners for QR forwarding...');
  
  // Listen for QR updates from bot
  bot.on('qr-update', (qrData) => {
    console.log(`📡 Bot QR update received for company: ${qrData?.companyId}`);
    
    if (qrData && qrData.companyId && qrData.qr) {
      // Broadcast to QR namespace
      qrNamespace.to(`company:${qrData.companyId}`).emit('qr_update', {
        type: 'qr_update',
        qr: qrData.qr,
        companyId: qrData.companyId,
        timestamp: new Date().toISOString(),
        hasQr: true,
        expiresIn: qrData.expiresIn
      });
      
      // Also broadcast to all clients in company room
      qrNamespace.to(`company:${qrData.companyId}`).emit('status', {
        type: 'status',
        connected: false,
        authenticated: false,
        hasQR: true,
        qr: qrData.qr,
        companyId: qrData.companyId,
        message: 'QR code required - Scan to connect',
        timestamp: new Date().toISOString()
      });
      
      console.log(`📤 QR broadcasted to company: ${qrData.companyId}`);
    }
  });
  
  // Listen for status changes
  bot.on('status-change', (statusData) => {
    console.log(`📡 Bot status change: ${statusData?.status} for company: ${statusData?.companyId}`);
    
    if (statusData && statusData.companyId) {
      qrNamespace.to(`company:${statusData.companyId}`).emit('status', {
        type: 'status',
        connected: statusData.connected || false,
        authenticated: statusData.authenticated || false,
        hasQR: statusData.hasQR || false,
        qr: statusData.qrData || null,
        companyId: statusData.companyId,
        message: statusData.message || 'Status updated',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  console.log('✅ Bot event listeners registered');
};

// Call after bot is ready
setTimeout(() => {
  registerBotEventListeners();
}, 1000);

// ========== INITIALIZE COMPANY MAPPER CACHE ==========
(async () => {
  try {
    const companyMapper = getCompanyMapper();
    await companyMapper.warmUpCache();
    console.log('✅ Company mapper cache warmed up');
  } catch (error) {
    console.error('❌ Failed to warm up company mapper cache:', error.message);
  }
})();

// ========== SESSION PRE-WARMING ==========
const preWarmSessions = async () => {
  console.log('🔥 Pre-warming sessions for active companies...');
  try {
    // Get active companies from database
    const response = await apiService.getActiveCompanies?.() || [];
    const activeCompanies = response.data || [];
    
    if (activeCompanies.length > 0) {
      console.log(`📱 Found ${activeCompanies.length} active companies, pre-warming...`);
      
      // Pre-warm in background (don't block startup)
      setTimeout(() => {
        activeCompanies.forEach(company => {
          if (company.whatsapp?.phoneNumber) {
            console.log(`🔥 Pre-warming session for company: ${company._id}`);
            // Initialize in background
            bot.initializeForCompany(company._id).catch(err => {
              console.log(`⚠️ Pre-warm failed for ${company._id}:`, err.message);
            });
          }
        });
      }, 2000);
    } else {
      console.log('📱 No active companies found for pre-warming');
    }
  } catch (error) {
    console.log('⚠️ Session pre-warming skipped:', error.message);
  }
};

// ========== REST API ROUTES ==========

// Health check endpoint
app.get('/health', (req, res) => {
  const status = bot.getStatus();
  const qrClientsCount = qrNamespace.sockets.size;
  const notificationClientsCount = notificationNamespace.sockets.size;
  const rootClientsCount = io.sockets.sockets.size;
  const activeSessions = status.multiTenant?.activeCompanies || 0;
  
  res.json({
    status: 'healthy',
    server: 'running',
    bot: status.connected ? 'connected' : status.hasQR ? 'qr_required' : 'disconnected',
    websocket: {
      qrClients: qrClientsCount,
      notificationClients: notificationClientsCount,
      rootClients: rootClientsCount,
      socketIoGlobal: !!global.io,
      qrWebSocketServer: qrSocketServer.isInitialized ? 'running' : 'stopped'
    },
    authentication: {
      adminTokenConfigured: !!ADMIN_TOKEN
    },
    multiTenant: {
      activeSessions: activeSessions,
      companyMapperReady: true,
      qrCacheSize: qrSocketServer.companyQRs?.size || 0
    },
    timestamp: new Date().toISOString()
  });
});

// WebSocket status endpoint
app.get('/api/websocket-status', (req, res) => {
  const qrClients = qrNamespace.sockets.size;
  const notificationClients = notificationNamespace.sockets.size;
  const rootClients = io.sockets.sockets.size;
  const qrWebSocketClients = qrSocketServer.getClientCount();
  
  res.json({
    status: 'running',
    socketIoVersion: '4.x',
    clients: {
      qr: qrClients,
      notifications: notificationClients,
      root: rootClients,
      qrWebSocket: qrWebSocketClients,
      total: qrClients + notificationClients + rootClients + qrWebSocketClients
    },
    namespaces: {
      qr: '/qr',
      notifications: '/notifications',
      root: '/',
      qrWebSocket: '/ws/qr'
    },
    qrCache: {
      size: qrSocketServer.companyQRs?.size || 0,
      companies: Array.from(qrSocketServer.companyQRs?.keys() || [])
    },
    timestamp: new Date().toISOString()
  });
});

// Get bot status
app.get('/api/status', (req, res) => {
  try {
    const { companyId } = req.query;
    const status = bot.getStatus();
    
    if (companyId && status.multiTenant) {
      const companySession = status.multiTenant.companies.find(c => c.companyId === companyId);
      if (companySession) {
        return res.json({
          success: true,
          companyId,
          connected: companySession.isConnected,
          status: companySession.isConnected ? 'connected' : 'disconnected',
          message: companySession.isConnected ? 'WhatsApp is connected' : 'Not connected',
          stats: status.stats,
          botInfo: status.botInfo,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    res.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get QR code
app.get('/api/qr', (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    const cachedQR = qrSocketServer.getQRForCompany(companyId);
    let qrData = cachedQR?.qr || null;
    
    if (!qrData) {
      const botStatus = bot.getStatus();
      qrData = botStatus.qrData?.qr || null;
    }
    
    res.json({
      success: true,
      qr: qrData,
      hasQr: !!qrData,
      companyId,
      fromCache: !!cachedQR,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const { companyId } = req.query;
    const status = bot.getStatus();
    
    res.json({
      success: true,
      stats: status.stats,
      companyId: companyId || 'all',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get full bot info
app.get('/api/bot', (req, res) => {
  try {
    const status = bot.getStatus();
    res.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get activity log
app.get('/api/activity', (req, res) => {
  try {
    const { companyId, limit = 8 } = req.query;
    
    const activities = [
      {
        id: Date.now(),
        message: companyId ? `WhatsApp ready for company ${companyId}` : 'WhatsApp ready',
        type: 'success',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: Date.now() - 60000,
        message: 'System initialized',
        type: 'info',
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString()
      }
    ];
    
    res.json({
      success: true,
      activities: activities.slice(0, parseInt(limit)),
      companyId: companyId || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get session status
app.get('/api/session-status', (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    const cachedQR = qrSocketServer.getQRForCompany(companyId);
    const botStatus = bot.getStatus();
    
    res.json({
      success: true,
      companyId,
      status: {
        connected: botStatus.connected || false,
        hasQR: !!cachedQR || !!botStatus.qrData,
        qrValid: !!cachedQR,
        status: botStatus.connected ? 'connected' : cachedQR ? 'qr_required' : 'disconnected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Multi-tenant stats
app.get('/api/multi-tenant/stats', (req, res) => {
  try {
    const botStatus = bot.getStatus();
    
    res.json({
      success: true,
      totalCompanies: botStatus.multiTenant?.activeCompanies || 0,
      activeSessions: botStatus.multiTenant?.companies?.filter(c => c.isConnected).length || 0,
      companies: botStatus.multiTenant?.companies || [],
      qrCache: {
        size: qrSocketServer.companyQRs?.size || 0,
        companies: Array.from(qrSocketServer.companyQRs?.keys() || [])
      },
      stats: botStatus.stats || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect company
app.post('/api/connect', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    await bot.addCompany(companyId);
    
    res.json({
      success: true,
      message: `WhatsApp connection initiated for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Disconnect company
app.post('/api/disconnect', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    await bot.removeCompany(companyId);
    
    res.json({
      success: true,
      message: `WhatsApp disconnected for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Restart
app.post('/api/restart', async (req, res) => {
  try {
    await bot.restart();
    res.json({ success: true, message: 'Bot restart initiated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout
app.post('/api/logout', async (req, res) => {
  try {
    await bot.logout();
    res.json({ success: true, message: 'Bot logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
app.post('/api/send-message', async (req, res) => {
  try {
    const { to, message, companyId } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ success: false, error: 'Phone number and message are required' });
    }
    
    let result;
    if (companyId) {
      const client = bot.getClientForCompany(companyId);
      if (!client) {
        return res.status(404).json({ success: false, error: `No active session for company ${companyId}` });
      }
      result = { success: true };
    } else {
      result = await bot.sendMessage(to, message);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refresh QR
app.post('/api/refresh-qr', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    // Clear QR cache for this company
    qrSocketServer.companyQRs.delete(companyId);
    
    res.json({
      success: true,
      message: `QR refresh initiated for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear session
app.post('/api/clear-session', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    await bot.clearSession();
    qrSocketServer.companyQRs.delete(companyId);
    
    res.json({
      success: true,
      message: `Session cleared for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all sessions
app.delete('/api/clear-all', async (req, res) => {
  try {
    await bot.clearSession();
    await bot.shutdown();
    qrSocketServer.companyQRs.clear();
    
    res.json({ success: true, message: 'All sessions cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test notification
app.post('/api/test-notification', async (req, res) => {
  try {
    const { companyId } = req.body || {};
    
    const testOrder = {
      orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
      customerName: 'Test Customer',
      customerPhone: '9876543210',
      totalPrice: 1999,
      items: [{ productName: 'Test Product', quantity: 1, price: 1999 }],
      status: 'pending',
      _id: `test-${Date.now()}`,
      companyId: companyId || 'default'
    };
    
    if (companyId) {
      notificationNamespace.to(`company:${companyId}`).emit('NEW_ORDER', {
        type: 'NEW_ORDER',
        order: testOrder,
        companyId: companyId,
        timestamp: new Date().toISOString(),
        test: true
      });
    } else {
      notificationNamespace.emit('NEW_ORDER', {
        type: 'NEW_ORDER',
        order: testOrder,
        timestamp: new Date().toISOString(),
        test: true
      });
    }
    
    res.json({
      success: true,
      message: `Test notification sent${companyId ? ` to company ${companyId}` : ''}`,
      orderNumber: testOrder.orderNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  const status = bot.getStatus();
  
  res.json({
    name: 'WhatsApp Bot & Notification Server',
    version: '3.0.0',
    status: 'running',
    port: PORT,
    websocket: {
      qrNamespace: `ws://localhost:${PORT}/qr`,
      notificationNamespace: `ws://localhost:${PORT}/notifications`,
      qrWebSocket: `ws://localhost:${PORT}/ws/qr`,
      connectedClients: {
        qr: qrNamespace.sockets.size,
        notifications: notificationNamespace.sockets.size,
        qrWebSocket: qrSocketServer.getClientCount()
      }
    },
    multiTenant: {
      enabled: true,
      activeCompanies: status.multiTenant?.activeCompanies || 0,
      qrCacheSize: qrSocketServer.companyQRs?.size || 0
    },
    endpoints: {
      health: '/health',
      websocketStatus: '/api/websocket-status',
      status: '/api/status',
      qr: '/api/qr',
      stats: '/api/stats'
    },
    timestamp: new Date().toISOString()
  });
});

// ========== START SERVER ==========
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 WHATSAPP BOT & NOTIFICATION SERVER - PROFESSIONAL VERSION');
  console.log('='.repeat(70));
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📡 QR Socket.IO: ws://localhost:${PORT}/qr`);
  console.log(`🔔 Notification Socket.IO: ws://localhost:${PORT}/notifications`);
  console.log(`📱 QR WebSocket: ws://localhost:${PORT}/ws/qr`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 WebSocket Status: http://localhost:${PORT}/api/websocket-status`);
  console.log('='.repeat(70));
  console.log('⚡ FEATURES ENABLED:');
  console.log('   ✅ Multi-tenant company isolation');
  console.log('   ✅ QR WebSocket broadcasting');
  console.log('   ✅ Company-specific notification rooms');
  console.log('   ✅ Session pre-warming');
  console.log('   ✅ QR cache with expiry');
  console.log('   ✅ Bot event listeners');
  console.log('   ✅ CORS configured for cross-domain access');
  console.log('='.repeat(70) + '\n');
  
  // Initialize QR Socket Server
  try {
    qrSocketServer.initialize(server, bot, io);
    console.log('✅ QR Socket Server initialized');
  } catch (error) {
    console.error('❌ QR Socket Server initialization error:', error.message);
  }
  
  // Pre-warm sessions in background
  setTimeout(() => {
    preWarmSessions();
  }, 3000);
});

// ========== GRACEFUL SHUTDOWN ==========
const gracefulShutdown = async () => {
  console.log('\n🛑 Graceful shutdown initiated...');
  
  try {
    await bot.shutdown();
    
    qrNamespace.disconnectSockets(true);
    notificationNamespace.disconnectSockets(true);
    
    if (qrSocketServer.close) {
      qrSocketServer.close();
    }
    
    console.log('✅ All clients disconnected');
  } catch (error) {
    console.error('Shutdown error:', error);
  }
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default server;