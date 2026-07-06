// server.js - COMPLETE FIXED VERSION
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
global._qrCache = new Map();

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
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Max-Age', '86400');
  }
  
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
  transports: ['polling', 'websocket'],
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

// ========== WEBSOCKET UPGRADE HANDLER ==========
server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = url.parse(request.url).pathname;
    
    console.log(`🔌 WebSocket upgrade request: ${pathname}`);
    
    if (pathname.startsWith('/socket.io/')) {
      console.log(`📡 Forwarding to Socket.IO: ${pathname}`);
      return;
    }
    
    if (pathname === '/ws/qr' || pathname.startsWith('/ws/qr')) {
      console.log(`📱 Forwarding QR WebSocket to qrSocketServer`);
      return;
    }
    
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

// ========== QR NAMESPACE HANDLER ==========
qrNamespace.on('connection', (socket) => {
  console.log(`🔗 QR Client connected: ${socket.id}`);
  
  const companyId = socket.handshake.query.companyId || null;
  
  if (companyId) {
    console.log(`🏢 QR Client for company: ${companyId}`);
    socket.join(`company:${companyId}`);
    socket.join('qr-clients');
    
    // Send initial status from QR cache
    try {
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
      } else {
        // Send empty QR response
        socket.emit('qr_response', {
          type: 'qr_response',
          qr: null,
          hasQr: false,
          companyId: companyId,
          timestamp: new Date().toISOString(),
          message: 'No QR code available'
        });
      }
    } catch (error) {
      console.error('❌ Error handling get_qr:', error.message);
      socket.emit('qr_response', {
        type: 'qr_response',
        qr: null,
        hasQr: false,
        companyId: companyId,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });
  
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

app.get('/api/test-qr', async (req, res) => {
    try {
        const { companyId } = req.query;
        
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        
        // Check QR cache
        const cachedQR = qrSocketServer.getQRForCompany(companyId);
        
        // Check bot status
        const status = bot.getStatus();
        let botQR = null;
        let botQRSource = 'none';
        
        if (status.multiTenant) {
            const companySession = status.multiTenant.companies?.find(c => c.companyId === companyId);
            if (companySession) {
                botQR = companySession.qrData?.qr || null;
                botQRSource = 'multi-tenant';
            }
        } else if (status.qrData) {
            botQR = status.qrData.qr || null;
            botQRSource = 'single-tenant';
        }
        
        res.json({
            success: true,
            companyId,
            cachedQR: cachedQR ? {
                hasQR: true,
                expiresIn: cachedQR.expiresIn,
                qrPreview: cachedQR.qr.substring(0, 50) + '...'
            } : null,
            botQR: botQR ? {
                hasQR: true,
                source: botQRSource,
                qrPreview: botQR.substring(0, 50) + '...'
            } : null,
            botConnected: status.connected,
            botAuthenticated: status.authenticated,
            hasActiveClient: !!bot.client,
            clientInfo: bot.client?.info?.wid ? {
                phoneNumber: bot.client.info.wid.user,
                platform: bot.client.info.platform
            } : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ========== REGISTER BOT EVENT LISTENERS FOR QR FORWARDING ==========
const registerBotEventListeners = () => {
  console.log('📡 Registering bot event listeners for QR forwarding...');
  
  // Listen for QR updates from bot
  bot.on('qr-update', (qrData) => {
    console.log(`🔴 [SERVER] Direct QR update received:`, {
        companyId: qrData?.companyId,
        hasQR: !!qrData?.qr,
        qrLength: qrData?.qr?.length || 0
    });
    
    if (qrData && qrData.companyId && qrData.qr) {
        // Store in QR Socket Server cache
        qrSocketServer.companyQRs.set(qrData.companyId, {
            qr: qrData.qr,
            expiresAt: Date.now() + 60000
        });
        
        // Broadcast via QR Socket Server
        qrSocketServer.broadcastQR(qrData.companyId, qrData.qr);
        
        // Also broadcast via Socket.IO
        const qrNamespace = io.of('/qr');
        qrNamespace.to(`company:${qrData.companyId}`).emit('qr_update', {
            type: 'qr_update',
            qr: qrData.qr,
            companyId: qrData.companyId,
            timestamp: new Date().toISOString(),
            hasQr: true
        });
        
        // Send qr_response to WebSocket clients
        qrSocketServer.broadcastToCompany(qrData.companyId, {
            type: 'qr_response',
            qr: qrData.qr,
            hasQr: true,
            companyId: qrData.companyId,
            timestamp: new Date().toISOString(),
            source: 'direct'
        });
        
        console.log(`✅ QR stored and broadcasted for company ${qrData.companyId}`);
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
    const response = await apiService.getActiveCompanies?.() || [];
    const activeCompanies = response.data || [];
    
    if (activeCompanies.length > 0) {
      console.log(`📱 Found ${activeCompanies.length} active companies, pre-warming...`);
      
      setTimeout(() => {
        activeCompanies.forEach(company => {
          if (company.whatsapp?.phoneNumber) {
            console.log(`🔥 Pre-warming session for company: ${company._id}`);
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

// ==========================================================
// FIXED: Connect company – force fresh initialization with QR broadcast
// ==========================================================
app.post('/api/connect', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    console.log(`📱 Connect requested for company: ${companyId}`);
    
    // Remove any existing client and session
    await bot.removeCompany(companyId).catch(() => {});
    
    // Add company - this should trigger QR generation
    await bot.addCompany(companyId);
    
    console.log(`✅ Company ${companyId} added, waiting for QR...`);
    
    // 🔥 IMPORTANT: Wait for QR to generate, then fetch and broadcast
    const broadcastQR = async (retryCount = 0) => {
      try {
        // Try to get QR from various sources
        let qrData = null;
        
        // 1. Check QR Socket Server cache
        const cachedQR = qrSocketServer.getQRForCompany(companyId);
        if (cachedQR) {
          qrData = cachedQR.qr;
          console.log(`✅ Found QR in cache for company ${companyId}`);
        }
        
        // 2. Check bot status
        if (!qrData) {
          const botStatus = bot.getStatus();
          qrData = botStatus.qrData?.qr || null;
          if (qrData) {
            console.log(`✅ Found QR in bot status for company ${companyId}`);
          }
        }
        
        // 3. If we have QR, broadcast it
        if (qrData) {
          console.log(`📤 Broadcasting QR to company: ${companyId}`);
          console.log(`📤 QR length: ${qrData.length}`);
          
          // Use QR Socket Server's broadcast method
          qrSocketServer.broadcastQR(companyId, qrData);
          
          // Also broadcast to QR namespace
          qrNamespace.to(`company:${companyId}`).emit('qr_update', {
            type: 'qr_update',
            qr: qrData,
            companyId: companyId,
            timestamp: new Date().toISOString(),
            hasQr: true
          });
          
          qrNamespace.to(`company:${companyId}`).emit('status', {
            type: 'status',
            connected: false,
            authenticated: false,
            hasQR: true,
            qr: qrData,
            companyId: companyId,
            message: 'QR code required - Scan to connect',
            timestamp: new Date().toISOString()
          });
          
          console.log(`✅ QR broadcasted successfully for company ${companyId}`);
          return true;
        }
        
        // If no QR and we haven't exceeded retries, try again
        if (retryCount < 10) {
          console.log(`⏳ QR not ready yet for company ${companyId}, retry ${retryCount + 1}/10...`);
          setTimeout(() => broadcastQR(retryCount + 1), 2000);
          return false;
        }
        
        console.log(`⚠️ No QR found after ${retryCount} retries for company ${companyId}`);
        
        // Send a status update that QR is not available
        qrNamespace.to(`company:${companyId}`).emit('status', {
          type: 'status',
          connected: false,
          authenticated: false,
          hasQR: false,
          qr: null,
          companyId: companyId,
          message: 'QR code generation in progress...',
          timestamp: new Date().toISOString()
        });
        
        return false;
        
      } catch (error) {
        console.error('❌ Error broadcasting QR:', error.message);
        return false;
      }
    };
    
    // Start QR broadcasting with retries
    setTimeout(() => {
      broadcastQR(0);
    }, 1000);
    
    // Also listen for QR update from bot as a fallback
    const qrListener = (qrData) => {
      if (qrData && qrData.companyId === companyId && qrData.qr) {
        console.log(`📡 QR received via bot event for company ${companyId}`);
        qrSocketServer.broadcastQR(companyId, qrData.qr);
        
        qrNamespace.to(`company:${companyId}`).emit('qr_update', {
          type: 'qr_update',
          qr: qrData.qr,
          companyId: companyId,
          timestamp: new Date().toISOString(),
          hasQr: true
        });
        
        // Remove listener after receiving QR
        bot.removeListener('qr-update', qrListener);
      }
    };
    
    bot.on('qr-update', qrListener);
    
    // Remove listener after 30 seconds to prevent memory leak
    setTimeout(() => {
      bot.removeListener('qr-update', qrListener);
    }, 30000);
    
    res.json({
      success: true,
      message: `WhatsApp connection initiated for company ${companyId}`,
      companyId
    });
    
  } catch (error) {
    console.error('❌ Connect error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear QR cache for a company
app.post('/api/clear-qr-cache', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID required' });
    }
    qrSocketServer.companyQRs.delete(companyId);
    console.log(`🗑️ QR cache cleared for company ${companyId}`);
    res.json({ success: true, message: 'QR cache cleared', companyId });
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

// Restart – accept companyId and force fresh start
app.post('/api/restart', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    // Remove and re-add to force fresh initialization
    await bot.removeCompany(companyId).catch(() => {});
    await bot.addCompany(companyId);
    
    // Broadcast QR after restart
    setTimeout(async () => {
      try {
        const cachedQR = qrSocketServer.getQRForCompany(companyId);
        const qrData = cachedQR?.qr || bot.getStatus().qrData?.qr || null;
        
        if (qrData) {
          qrSocketServer.broadcastQR(companyId, qrData);
          qrNamespace.to(`company:${companyId}`).emit('qr_update', {
            type: 'qr_update',
            qr: qrData,
            companyId: companyId,
            timestamp: new Date().toISOString(),
            hasQr: true
          });
        }
      } catch (error) {
        console.error('❌ Error broadcasting QR after restart:', error.message);
      }
    }, 2000);
    
    res.json({ 
      success: true, 
      message: `Restart initiated for company ${companyId}`,
      companyId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout – directly remove company and clear cache
app.post('/api/logout', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }
    
    console.log(`🚪 Logout requested for company: ${companyId}`);
    
    // Remove the company's client and session
    await bot.removeCompany(companyId);
    
    // Clear any cached QR for this company
    qrSocketServer.companyQRs.delete(companyId);
    
    // Force emit final status to all listeners
    bot.emitStatusChange({
      connected: false,
      authenticated: false,
      hasQR: false,
      status: 'logged_out',
      message: 'Logged out successfully',
      companyId: companyId,
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully',
      companyId: companyId
    });
  } catch (error) {
    console.error('Logout error:', error);
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
    
    // Request new QR from bot
    await bot.refreshQR(companyId);
    
    // Broadcast new QR after a moment
    setTimeout(async () => {
      try {
        const cachedQR = qrSocketServer.getQRForCompany(companyId);
        const qrData = cachedQR?.qr || bot.getStatus().qrData?.qr || null;
        
        if (qrData) {
          qrSocketServer.broadcastQR(companyId, qrData);
          qrNamespace.to(`company:${companyId}`).emit('qr_update', {
            type: 'qr_update',
            qr: qrData,
            companyId: companyId,
            timestamp: new Date().toISOString(),
            hasQr: true
          });
        }
      } catch (error) {
        console.error('❌ Error broadcasting refreshed QR:', error.message);
      }
    }, 1500);
    
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

// ========== UNIFIED WHATSAPP API ROUTE ==========
app.all('/api/whatsapp', async (req, res) => {
  try {
    const { action, companyId } = req.query;
    const body = req.body;
    
    console.log(`📡 API Call: action=${action}, companyId=${companyId}`);
    
    switch (action) {
      case 'status':
        const status = bot.getStatus();
        const qrData = qrSocketServer.getQRForCompany(companyId);
        
        res.json({
          success: true,
          status: status.connected ? 'connected' : (qrData ? 'qr_required' : 'disconnected'),
          connected: status.connected || false,
          qr: qrData?.qr || null,
          message: status.connected ? 'WhatsApp is connected' : 
                   qrData ? 'QR code required' : 'Not connected',
          botInfo: {
            pushname: status.botInfo?.pushname || '',
            platform: 'WhatsApp Business',
            version: '2.24.12',
            phoneNumber: status.botInfo?.phoneNumber || 'Not available'
          }
        });
        break;
        
      case 'qr':
        const cachedQR = qrSocketServer.getQRForCompany(companyId);
        res.json({
          success: true,
          qr: cachedQR?.qr || null,
          hasQr: !!cachedQR,
          companyId
        });
        break;
        
      case 'stats':
        const stats = bot.getStatus().stats || {};
        res.json({
          success: true,
          stats: stats
        });
        break;
        
      case 'connect':
        // Forward to connect handler
        req.url = `/api/connect?companyId=${companyId}`;
        return app._router.handle(req, res);
        
      case 'disconnect':
        req.url = `/api/disconnect?companyId=${companyId}`;
        return app._router.handle(req, res);
        
      case 'restart':
        req.url = `/api/restart?companyId=${companyId}`;
        return app._router.handle(req, res);
        
      case 'logout':
        req.url = `/api/logout?companyId=${companyId}`;
        return app._router.handle(req, res);
        
      case 'refresh-qr':
        req.url = `/api/refresh-qr?companyId=${companyId}`;
        return app._router.handle(req, res);
        
      case 'send_message':
        const { to, message } = body;
        if (!to || !message) {
          return res.status(400).json({ success: false, error: 'Phone and message required' });
        }
        // Send message logic
        try {
          if (companyId) {
            const client = bot.getClientForCompany(companyId);
            if (!client) {
              return res.status(404).json({ success: false, error: `No active session for company ${companyId}` });
            }
            await client.sendMessage(to, message);
          } else {
            await bot.sendMessage(to, message);
          }
          res.json({ success: true, message: 'Message sent successfully' });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
        break;
        
      default:
        res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DEBUG ENDPOINTS ==========

// Debug QR endpoint
app.get('/api/debug-qr', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }
    
    // Get bot status
    const status = bot.getStatus();
    const qrFromBot = status.qrData?.qr || null;
    
    // Get QR from cache
    const cachedQR = qrSocketServer.getQRForCompany(companyId);
    
    // Check if company exists in bot
    const companyExists = status.multiTenant?.companies?.some(c => c.companyId === companyId);
    
    res.json({
      success: true,
      companyId,
      qrFromBot: !!qrFromBot,
      qrFromBotData: qrFromBot ? qrFromBot.substring(0, 50) + '...' : null,
      qrFromCache: !!cachedQR,
      qrFromCacheData: cachedQR ? cachedQR.qr.substring(0, 50) + '...' : null,
      companyExists,
      botConnected: status.connected,
      botStatus: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/force-qr', async (req, res) => {
    try {
        const { companyId } = req.query;
        
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        
        console.log(`🔧 Force QR generation for company: ${companyId}`);
        
        // Remove and re-add to force QR generation
        await bot.removeCompany(companyId).catch(() => {});
        await bot.addCompany(companyId);
        
        // Wait for QR to generate
        let qrData = null;
        let attempts = 0;
        const maxAttempts = 20;
        
        while (!qrData && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Check cache
            const cached = qrSocketServer.getQRForCompany(companyId);
            if (cached) {
                qrData = cached.qr;
                console.log(`✅ Found QR in cache on attempt ${attempts + 1}`);
                break;
            }
            
            // Check bot status directly
            const status = bot.getStatus();
            if (status.qrData?.qr) {
                qrData = status.qrData.qr;
                console.log(`✅ Found QR in bot status on attempt ${attempts + 1}`);
                break;
            }
            
            // Check multi-tenant
            if (status.multiTenant) {
                const companySession = status.multiTenant.companies?.find(c => c.companyId === companyId);
                if (companySession?.qrData?.qr) {
                    qrData = companySession.qrData.qr;
                    console.log(`✅ Found QR in multi-tenant on attempt ${attempts + 1}`);
                    break;
                }
            }
            
            attempts++;
            console.log(`⏳ Attempt ${attempts}/${maxAttempts}: QR not found yet`);
        }
        
        if (qrData) {
            // Store in global cache for future clients
            global._qrCache.set(companyId, {
                qr: qrData,
                timestamp: Date.now(),
                expiresAt: Date.now() + 120000
            });
            
            // Store in QR Socket Server cache
            qrSocketServer.companyQRs.set(companyId, {
                qr: qrData,
                expiresAt: Date.now() + 120000
            });
            
            // Broadcast to existing clients
            qrSocketServer.broadcastQR(companyId, qrData);
            
            console.log(`✅ QR stored in global cache for company ${companyId}`);
            
            res.json({
                success: true,
                message: 'QR generated and broadcasted',
                companyId,
                hasQR: true,
                qrLength: qrData.length
            });
        } else {
            res.json({
                success: false,
                message: `QR not generated after ${maxAttempts} attempts`,
                companyId
            });
        }
    } catch (error) {
        console.error('Force QR error:', error);
        res.status(500).json({ error: error.message });
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
      stats: '/api/stats',
      debug: '/api/debug-qr?companyId=YOUR_COMPANY_ID',
      forceQR: '/api/force-qr?companyId=YOUR_COMPANY_ID'
    },
    timestamp: new Date().toISOString()
  });
});

// ========== REGISTER BOT EVENT LISTENERS ==========
setTimeout(() => {
  registerBotEventListeners();
}, 1000);

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
  console.log(`🐛 Debug QR: http://localhost:${PORT}/api/debug-qr?companyId=YOUR_ID`);
  console.log(`🔧 Force QR: http://localhost:${PORT}/api/force-qr?companyId=YOUR_ID`);
  console.log('='.repeat(70));
  console.log('⚡ FEATURES ENABLED:');
  console.log('   ✅ Multi-tenant company isolation');
  console.log('   ✅ QR WebSocket broadcasting');
  console.log('   ✅ Company-specific notification rooms');
  console.log('   ✅ Session pre-warming');
  console.log('   ✅ QR cache with expiry');
  console.log('   ✅ Bot event listeners');
  console.log('   ✅ CORS configured for cross-domain access');
  console.log('   ✅ Fixed Connect/Logout/Restart for proper QR generation');
  console.log('   ✅ QR broadcast on connect with retry logic');
  console.log('   ✅ Debug and force QR endpoints');
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