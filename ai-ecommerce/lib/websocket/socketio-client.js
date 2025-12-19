"use client";

import { io } from 'socket.io-client';

/**
 * Production-grade Socket.IO Client for Admin Notifications
 * Fixed to work with your backend server.js on port 3001
 */

// ========== GLOBAL CONNECTION LOCK ==========
let globalConnectionInProgress = false;
// ============================================

// ========== CONFIGURATION ==========
const CONFIG = {
  // Backend Socket.IO server URL (Port 3001)
  SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001',
  
  // Socket.IO options - FIXED FOR YOUR BACKEND
  SOCKET_OPTIONS: {
    path: '/socket.io/',
    transports: ['polling', 'websocket'],  // Polling first for handshake
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
    forceNew: true,
    withCredentials: true,
    // Add compatibility options
    allowEIO3: true,
    allowEIO4: true,
    upgrade: true,
    rememberUpgrade: true,
    // Localhost settings
    secure: false,
    rejectUnauthorized: false
  },
  
  // Authentication - Must match your server.js ADMIN_TOKEN
  AUTH_TOKEN: process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY || 'dev-key-2024',
  
  // Heartbeat settings
  HEARTBEAT_INTERVAL: 30000,
  HEARTBEAT_TIMEOUT: 60000,
  
  // Debug
  DEBUG: process.env.NODE_ENV === 'development',
  LOG_PREFIX: '[Socket.IO]'
};

// ========== EVENT TYPES ==========
const EventTypes = {
  // Connection events
  CONNECT: 'connect',
  CONNECT_ERROR: 'connect_error',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Authentication events (MUST MATCH YOUR SERVER.JS!)
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',
  
  // Notification events (MUST MATCH YOUR SERVER.JS!)
  NEW_ORDER: 'NEW_ORDER',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
  
  // System events
  PING: 'ping',
  PONG: 'pong',
  
  // Custom events (MUST MATCH YOUR SERVER.JS!)
  REGISTER_FCM_TOKEN: 'register-fcm-token',
  FCM_TOKEN_REGISTERED: 'fcm-token-registered',
  
  // Custom dashboard events (MUST MATCH YOUR SERVER.JS!)
  DASHBOARD_UPDATE: 'dashboard-update'
};

class SocketIOClient {
  constructor() {
    // Socket instance
    this.socket = null;
    
    // Connection state
    this.state = 'disconnected';
    this.connectionId = null;
    this.isAuthenticated = false;
    
    // User context
    this.userId = null;
    this.userRole = null;
    this.userData = null;
    
    // Timers
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.reconnectTimer = null;
    
    // Event listeners
    this.eventListeners = new Map();
    this.connectionListeners = [];
    this.stateListeners = [];
    
    // Stats
    this.stats = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalEventsReceived: 0,
      totalEventsSent: 0,
      reconnectionAttempts: 0,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
      pingLatency: null
    };
    
    // Queue for offline messages
    this.messageQueue = [];
    
    this._log('Client initialized');
  }

  // ========== PUBLIC API ==========

  /**
   * Connect to Socket.IO server - FIXED FOR YOUR BACKEND
   */
  connect(user = {}) {
    // ========== GLOBAL CONNECTION LOCK ==========
    if (globalConnectionInProgress) {
      this._log('❌ Connection already in progress globally, skipping...');
      return;
    }
    
    // Prevent duplicate connections
    if (this.state === 'connected' || this.state === 'connecting') {
      this._log('Already connected or connecting');
      return;
    }
    
    // Set global lock
    globalConnectionInProgress = true;
    // ============================================
    
    // Clear any existing connection
    this._cleanup();
    
    // Set user context
    this.userId = user.id || user._id || 'admin';
    this.userRole = user.role || 'admin';
    this.userData = user;
    this.connectionId = `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update state
    this._setState('connecting');
    this.stats.totalConnections++;
    
    try {
      // ✅ FIXED: Connect to /notifications namespace (MUST match your backend!)
      const namespace = '/notifications'; // Your backend uses this namespace
      const url = `${CONFIG.SERVER_URL}${namespace}`; // Full URL with namespace
      
      this._log(`Connecting to ${url} (/notifications namespace)`);
      
      // Create socket with initial query parameters
      this.socket = io(url, {
        ...CONFIG.SOCKET_OPTIONS,
        query: {
          userId: this.userId,
          userRole: this.userRole,
          connectionId: this.connectionId,
          timestamp: Date.now().toString()
        }
      });
      
      // Setup event listeners
      this._setupEventListeners();
      
      // ========== SET UP CONNECTION FLAG RESET ==========
      const resetConnectionFlag = () => {
        if (globalConnectionInProgress) {
          globalConnectionInProgress = false;
          this._log('✅ Global connection flag reset');
        }
      };
      
      // Override connection handlers to reset flag
      const originalHandleConnect = this._handleConnect.bind(this);
      const originalHandleConnectError = this._handleConnectError.bind(this);
      const originalHandleDisconnect = this._handleDisconnect.bind(this);
      
      // Replace handlers to include flag reset
      this.socket.on('connect', () => {
        resetConnectionFlag();
        originalHandleConnect();
      });
      
      this.socket.on('connect_error', (error) => {
        resetConnectionFlag();
        originalHandleConnectError(error);
      });
      
      this.socket.on('disconnect', (reason) => {
        resetConnectionFlag();
        originalHandleDisconnect(reason);
      });
      
      // Connect
      this.socket.connect();
      
    } catch (error) {
      // Reset flag on error
      globalConnectionInProgress = false;
      this._logError('Connection initialization failed:', error);
      this._setState('error');
      this._scheduleReconnect();
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(reason = 'Client requested disconnect') {
    this._log(`Disconnecting: ${reason}`);
    
    this._cleanupTimers();
    this._setState('disconnecting');
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this._setState('disconnected');
    this.isAuthenticated = false;
    this.stats.lastDisconnectedAt = new Date();
    
    // Reset global connection flag
    if (globalConnectionInProgress) {
      globalConnectionInProgress = false;
    }
    
    this._log('Disconnected successfully');
  }

  /**
   * Emit event to server - FIXED
   */
  emit(event, data = {}) {
    if (!this.socket || !this.socket.connected || !this.isAuthenticated) {
      this._log(`Queueing event ${event} - socket not ready`);
      this._queueMessage(event, data);
      return false;
    }
    
    try {
      const payload = {
        ...data,
        userId: this.userId,
        userRole: this.userRole,
        connectionId: this.connectionId,
        timestamp: new Date().toISOString()
      };
      
      this.socket.emit(event, payload);
      this.stats.totalEventsSent++;
      
      if (CONFIG.DEBUG) {
        this._log(`Emitted: ${event}`, {
          event: event,
          userId: this.userId,
          dataSize: JSON.stringify(payload).length
        });
      }
      
      return true;
    } catch (error) {
      this._logError(`Failed to emit ${event}:`, error);
      this._queueMessage(event, data);
      return false;
    }
  }

  /**
   * Register FCM token with server
   */
  registerFCMToken(fcmToken) {
    if (!fcmToken || typeof fcmToken !== 'string') {
      this._logError('Invalid FCM token');
      return false;
    }
    
    return this.emit(EventTypes.REGISTER_FCM_TOKEN, {
      token: fcmToken,
      deviceInfo: this._getDeviceInfo(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send authentication request - FIXED FOR YOUR BACKEND
   */
  authenticate() {
    if (!this.socket || !this.socket.connected) {
      this._logError('Cannot authenticate - socket not connected');
      return false;
    }
    
    // Your backend expects this exact format (matches server.js line 96-99)
    return this.emit(EventTypes.AUTHENTICATE, {
      token: CONFIG.AUTH_TOKEN,
      userId: this.userId,
      userRole: this.userRole,
      name: this.userData?.name || `Admin-${this.userId.substring(0, 8)}`,
      connectionId: this.connectionId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send heartbeat/ping
   */
  sendHeartbeat() {
    if (this.socket?.connected && this.isAuthenticated) {
      const pingTime = Date.now();
      
      this.emit(EventTypes.PING, { 
        timestamp: pingTime,
        userId: this.userId 
      });
      
      // Set timeout for pong response
      if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout);
      }
      
      this.heartbeatTimeout = setTimeout(() => {
        if (this.socket?.connected) {
          this._logError('Heartbeat timeout - reconnecting...');
          this.disconnect('Heartbeat timeout');
          this._scheduleReconnect();
        }
      }, CONFIG.HEARTBEAT_TIMEOUT);
    }
  }

  // ========== EVENT LISTENER SETUP ==========

  _setupEventListeners() {
    if (!this.socket) return;
    
    // Authentication events (from your server.js)
    this.socket.on(EventTypes.AUTHENTICATED, (data) => this._handleAuthenticated(data));
    this.socket.on(EventTypes.UNAUTHORIZED, (data) => this._handleUnauthorized(data));
    
    // System events
    this.socket.on(EventTypes.PONG, (data) => this._handlePong(data));
    
    // ✅ FIXED: Listen for events your backend emits
    this.socket.on(EventTypes.NEW_ORDER, (data) => this._handleNewOrder(data));
    this.socket.on(EventTypes.PAYMENT_RECEIVED, (data) => this._handlePaymentReceived(data));
    this.socket.on(EventTypes.ORDER_STATUS_CHANGED, (data) => this._handleOrderStatusChanged(data));
    this.socket.on(EventTypes.LOW_STOCK_ALERT, (data) => this._handleLowStockAlert(data));
    this.socket.on(EventTypes.DASHBOARD_UPDATE, (data) => this._handleDashboardUpdate(data));
    
    // Custom events
    this.socket.on(EventTypes.FCM_TOKEN_REGISTERED, (data) => this._handleFCMTokenRegistered(data));
  }

  // ========== EVENT HANDLERS ==========

  _handleConnect() {
    this._log('Socket.IO connected to /notifications namespace');
    this._setState('connected');
    this.stats.successfulConnections++;
    this.stats.lastConnectedAt = new Date();
    
    // Start heartbeat
    this._startHeartbeat();
    
    // Send authentication after connection - REQUIRED FOR YOUR BACKEND
    setTimeout(() => {
      if (this.socket?.connected) {
        this.authenticate();
      }
    }, 500);
    
    // Flush queued messages
    this._flushMessageQueue();
    
    // Notify connection listeners
    this._notifyConnectionChange(true);
  }

  _handleConnectError(error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown connection error';
    
    if (CONFIG.DEBUG) {
      console.log(`${CONFIG.LOG_PREFIX} ❌ Connection error: ${errorMessage}`);
    }
    
    this._setState('error');
    this.stats.failedConnections++;
    
    // Schedule reconnection
    this._scheduleReconnect();
  }

  _handleDisconnect(reason) {
    this._log(`Disconnected: ${reason}`);
    this._setState('disconnected');
    this.isAuthenticated = false;
    this.stats.lastDisconnectedAt = new Date();
    
    this._cleanupTimers();
    
    // Notify connection listeners
    this._notifyConnectionChange(false);
    
    // Schedule reconnection unless intentionally disconnected
    if (reason !== 'io client disconnect' && reason !== 'transport close') {
      this._scheduleReconnect();
    }
  }

  _handleError(error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    this._logError('Socket error:', errorMessage);
    this._setState('error');
  }

  _handleAuthenticated(data) {
    this._log('Authentication successful');
    this.isAuthenticated = true;
    
    if (CONFIG.DEBUG) {
      console.log(`${CONFIG.LOG_PREFIX} ✅ Authenticated as ${data.user?.name || this.userId}`);
    }
    
    // Register any pending FCM tokens
    this._registerPendingFCMTokens();
  }

  _handleUnauthorized(data) {
    const message = data?.message || 'Invalid credentials';
    this._logError('Authentication failed:', message);
    this.isAuthenticated = false;
    
    // Disconnect on authentication failure
    this.disconnect('Authentication failed');
  }

  _handlePong(data) {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    if (data?.timestamp) {
      const latency = Date.now() - data.timestamp;
      this.stats.pingLatency = latency;
    }
  }

  // ========== NOTIFICATION HANDLERS ==========

  _handleNewOrder(data) {
    this._log(`New order: ${data.order?.orderNumber || 'Unknown'}`);
    this._dispatchNotification('NEW_ORDER', {
      title: '🛍️ New Order Received',
      message: `Order #${data.order?.orderNumber} from ${data.order?.customerName || 'Customer'}`,
      data: data.order,
      priority: 'high',
      timestamp: new Date().toISOString()
    });
    
    // Also dispatch custom event for dashboard
    this._dispatchCustomEvent('NEW_ORDER', data);
    
    // Dispatch window event for other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('new-order-received', {
        detail: data.order || data
      }));
    }
  }

  _handlePaymentReceived(data) {
    this._log(`Payment received for order: ${data.orderNumber || 'Unknown'}`);
    this._dispatchNotification('PAYMENT_RECEIVED', {
      title: '💰 Payment Received',
      message: `Payment of ₹${data.amount} for order #${data.orderNumber}`,
      data: data,
      priority: 'high',
      timestamp: new Date().toISOString()
    });
    
    this._dispatchCustomEvent('PAYMENT_RECEIVED', data);
    
    // Dispatch window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('payment-updated', {
        detail: data
      }));
    }
  }

  _handleOrderStatusChanged(data) {
    this._log(`Order status updated: ${data.orderNumber} (${data.oldStatus} → ${data.newStatus})`);
    this._dispatchNotification('ORDER_STATUS_CHANGED', {
      title: '📦 Order Status Updated',
      message: `Order #${data.orderNumber} is now ${data.newStatus}`,
      data: data,
      priority: 'normal',
      timestamp: new Date().toISOString()
    });
    
    this._dispatchCustomEvent('ORDER_STATUS_CHANGED', data);
    
    // Dispatch window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('order-status-updated', {
        detail: data
      }));
    }
  }

  _handleLowStockAlert(data) {
    this._log(`Low stock alert: ${data.product?.productName || 'Product'}`);
    this._dispatchNotification('LOW_STOCK_ALERT', {
      title: '📦 Low Stock Alert',
      message: `${data.product?.productName} is running low (${data.product?.stock} left)`,
      data: data.product,
      priority: 'normal',
      timestamp: new Date().toISOString()
    });
    
    this._dispatchCustomEvent('LOW_STOCK_ALERT', data);
  }

  _handleDashboardUpdate(data) {
    this._log(`Dashboard update: ${data.type || 'update'}`);
    this._dispatchCustomEvent('DASHBOARD_UPDATE', data);
  }

  _handleFCMTokenRegistered(data) {
    this._log('FCM token registered with server');
    this._dispatchCustomEvent('FCM_TOKEN_REGISTERED', data);
  }

  // ========== QUEUE MANAGEMENT ==========

  _queueMessage(event, data) {
    if (this.messageQueue.length >= 50) {
      // Remove oldest message
      this.messageQueue.shift();
    }
    
    this.messageQueue.push({
      event,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
    
    this._log(`Queued: ${event} (queue size: ${this.messageQueue.length})`);
  }

  _flushMessageQueue() {
    if (this.messageQueue.length === 0 || !this.isAuthenticated) {
      return;
    }
    
    const failedMessages = [];
    
    this.messageQueue.forEach((message) => {
      const success = this.emit(message.event, message.data);
      
      if (!success && message.retryCount < 3) {
        message.retryCount++;
        failedMessages.push(message);
      }
    });
    
    this.messageQueue = failedMessages;
    
    if (failedMessages.length > 0) {
      this._log(`${failedMessages.length} messages failed to send, will retry`);
    }
  }

  // ========== TIMER MANAGEMENT ==========

  _startHeartbeat() {
    this._cleanupHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, CONFIG.HEARTBEAT_INTERVAL);
    
    this._log('Heartbeat started');
  }

  _scheduleReconnect() {
    if (this.reconnectTimer || this.state === 'connected') {
      return;
    }
    
    this.stats.reconnectionAttempts++;
    
    const delay = Math.min(1000 * Math.pow(1.5, this.stats.reconnectionAttempts), 30000);
    
    this._log(`Scheduling reconnect in ${delay}ms (attempt ${this.stats.reconnectionAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.userId) {
        this._log('Attempting reconnection...');
        this.connect(this.userData);
      }
    }, delay);
  }

  // ========== EVENT DISPATCHING ==========

  _dispatchNotification(type, payload) {
    const event = new CustomEvent('admin-notification', {
      detail: {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: payload.title,
        message: payload.message,
        data: payload.data,
        priority: payload.priority || 'normal',
        timestamp: payload.timestamp,
        duration: 5000
      }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  _dispatchCustomEvent(eventName, data) {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        this._logError(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  // ========== UTILITY METHODS ==========

  _getDeviceInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString()
    };
  }

  _registerPendingFCMTokens() {
    if (typeof window === 'undefined') return;
    
    try {
      const pendingTokens = JSON.parse(localStorage.getItem('pending_fcm_tokens') || '[]');
      
      pendingTokens.forEach(tokenData => {
        if (tokenData.token) {
          this.registerFCMToken(tokenData.token);
        }
      });
      
    } catch (error) {
      this._logError('Error registering pending tokens:', error);
    }
  }

  _setState(newState) {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      this._log(`State: ${oldState} → ${newState}`);
      
      if (this.stateListeners && this.stateListeners.length > 0) {
        this.stateListeners.forEach(listener => {
          try {
            listener(newState);
          } catch (error) {}
        });
      }
    }
  }

  _notifyConnectionChange(connected) {
    if (this.connectionListeners && this.connectionListeners.length > 0) {
      this.connectionListeners.forEach(listener => {
        try {
          listener(connected);
        } catch (error) {}
      });
    }
  }

  // ========== CLEANUP ==========

  _cleanup() {
    // Reset global connection flag
    if (globalConnectionInProgress) {
      globalConnectionInProgress = false;
    }
    
    this._cleanupTimers();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isAuthenticated = false;
  }

  _cleanupTimers() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  _cleanupHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // ========== LOGGING ==========

  _log(message, data = null) {
    if (!CONFIG.DEBUG) return;
    
    console.log(`${CONFIG.LOG_PREFIX} ${message}`);
    if (data) {
      console.log(`${CONFIG.LOG_PREFIX} Data:`, data);
    }
  }

  _logError(message, error = null) {
    if (CONFIG.DEBUG) {
      const errorMessage = error?.message || error?.toString() || error;
      console.log(`${CONFIG.LOG_PREFIX} ❌ ${message} ${errorMessage ? `- ${errorMessage}` : ''}`);
    }
  }

  // ========== GETTERS ==========

  getStatus() {
    return {
      state: this.state,
      isConnected: this.state === 'connected',
      isAuthenticated: this.isAuthenticated,
      connectionId: this.connectionId,
      userId: this.userId,
      userRole: this.userRole,
      socketId: this.socket?.id,
      socketConnected: this.socket?.connected || false,
      stats: {
        ...this.stats,
        queueSize: this.messageQueue.length,
        currentTime: new Date().toISOString()
      }
    };
  }

  // ========== EVENT LISTENER REGISTRATION ==========

  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);
    
    // Also listen on socket if connected
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  off(eventName, callback) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  addConnectionListener(callback) {
    if (!this.connectionListeners.includes(callback)) {
      this.connectionListeners.push(callback);
    }
  }

  removeConnectionListener(callback) {
    const index = this.connectionListeners.indexOf(callback);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  addStateListener(callback) {
    if (!this.stateListeners.includes(callback)) {
      this.stateListeners.push(callback);
    }
  }

  removeStateListener(callback) {
    const index = this.stateListeners.indexOf(callback);
    if (index > -1) {
      this.stateListeners.splice(index, 1);
    }
  }

  /**
   * Test connection by sending a ping
   */
  async testConnection() {
    if (!this.socket || !this.socket.connected) {
      return { success: false, message: 'Socket not connected' };
    }
    
    return new Promise((resolve) => {
      const pingTime = Date.now();
      let responded = false;
      
      const timeout = setTimeout(() => {
        if (!responded) {
          resolve({ success: false, message: 'Test timeout', latency: null });
        }
      }, 5000);
      
      this.socket.emit(EventTypes.PING, { timestamp: pingTime, test: true });
      
      this.socket.once(EventTypes.PONG, (data) => {
        responded = true;
        clearTimeout(timeout);
        const latency = Date.now() - pingTime;
        resolve({ 
          success: true, 
          message: 'Connection test successful', 
          latency,
          serverTime: data.serverTime 
        });
      });
    });
  }
}

// ========== SINGLETON EXPORT ==========
let instance = null;

export function getSocketIOClient() {
  if (!instance) {
    instance = new SocketIOClient();
    
    if (typeof window !== 'undefined') {
      const cleanup = () => {
        if (instance) {
          instance.disconnect('Page unload');
        }
      };
      
      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('pagehide', cleanup);
      window.addEventListener('unload', cleanup);
    }
  }
  
  return instance;
}

export default getSocketIOClient;










// // lib/websocket/socketio-client.js - FINAL CORRECTED VERSION
// "use client";

// import { io } from 'socket.io-client';

// /**
//  * Production-grade Socket.IO Client for Admin Notifications
//  * Fixed to work with your backend server.js on port 3001
//  */

// // ========== CONFIGURATION ==========
// const CONFIG = {
//   // Backend Socket.IO server URL (Port 3001)
//   SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001',
  
//   // Socket.IO options - FIXED FOR YOUR BACKEND
//   SOCKET_OPTIONS: {
//     path: '/socket.io/',
//     transports: ['polling', 'websocket'],  // Polling first for handshake
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     timeout: 20000,
//     autoConnect: false,
//     forceNew: true,
//     withCredentials: true,
//     // Add compatibility options
//     allowEIO3: true,
//     allowEIO4: true,
//     upgrade: true,
//     rememberUpgrade: true,
//     // Localhost settings
//     secure: false,
//     rejectUnauthorized: false
//   },
  
//   // Authentication - Must match your server.js ADMIN_TOKEN
//   AUTH_TOKEN: process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY || 'dev-key-2024',
  
//   // Heartbeat settings
//   HEARTBEAT_INTERVAL: 30000,
//   HEARTBEAT_TIMEOUT: 60000,
  
//   // Debug
//   DEBUG: process.env.NODE_ENV === 'development',
//   LOG_PREFIX: '[Socket.IO]'
// };

// // ========== EVENT TYPES ==========
// const EventTypes = {
//   // Connection events
//   CONNECT: 'connect',
//   CONNECT_ERROR: 'connect_error',
//   DISCONNECT: 'disconnect',
//   ERROR: 'error',
  
//   // Authentication events (MUST MATCH YOUR SERVER.JS!)
//   AUTHENTICATE: 'authenticate',
//   AUTHENTICATED: 'authenticated',
//   UNAUTHORIZED: 'unauthorized',
  
//   // Notification events (MUST MATCH YOUR SERVER.JS!)
//   NEW_ORDER: 'NEW_ORDER',
//   PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
//   ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
//   LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
  
//   // System events
//   PING: 'ping',
//   PONG: 'pong',
  
//   // Custom events (MUST MATCH YOUR SERVER.JS!)
//   REGISTER_FCM_TOKEN: 'register-fcm-token',
//   FCM_TOKEN_REGISTERED: 'fcm-token-registered',
  
//   // Custom dashboard events (MUST MATCH YOUR SERVER.JS!)
//   DASHBOARD_UPDATE: 'dashboard-update'
// };

// class SocketIOClient {
//   constructor() {
//     // Socket instance
//     this.socket = null;
    
//     // Connection state
//     this.state = 'disconnected';
//     this.connectionId = null;
//     this.isAuthenticated = false;
    
//     // User context
//     this.userId = null;
//     this.userRole = null;
//     this.userData = null;
    
//     // Timers
//     this.heartbeatInterval = null;
//     this.heartbeatTimeout = null;
//     this.reconnectTimer = null;
    
//     // Event listeners
//     this.eventListeners = new Map();
//     this.connectionListeners = [];
//     this.stateListeners = [];
    
//     // Stats
//     this.stats = {
//       totalConnections: 0,
//       successfulConnections: 0,
//       failedConnections: 0,
//       totalEventsReceived: 0,
//       totalEventsSent: 0,
//       reconnectionAttempts: 0,
//       lastConnectedAt: null,
//       lastDisconnectedAt: null,
//       pingLatency: null
//     };
    
//     // Queue for offline messages
//     this.messageQueue = [];
    
//     this._log('Client initialized');
//   }

//   // ========== PUBLIC API ==========

//   /**
//    * Connect to Socket.IO server - FIXED FOR YOUR BACKEND
//    */
//   connect(user = {}) {
//     // Prevent duplicate connections
//     if (this.state === 'connected' || this.state === 'connecting') {
//       this._log('Already connected or connecting');
//       return;
//     }
    
//     // Clear any existing connection
//     this._cleanup();
    
//     // Set user context
//     this.userId = user.id || user._id || 'admin';
//     this.userRole = user.role || 'admin';
//     this.userData = user;
//     this.connectionId = `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     // Update state
//     this._setState('connecting');
//     this.stats.totalConnections++;
    
//     try {
//       // ✅ FIXED: Connect to /notifications namespace (MUST match your backend!)
//       const namespace = '/notifications'; // Your backend uses this namespace
//       const url = `${CONFIG.SERVER_URL}${namespace}`; // Full URL with namespace
      
//       this._log(`Connecting to ${url} (/notifications namespace)`);
      
//       // Create socket with initial query parameters
//       this.socket = io(url, {
//         ...CONFIG.SOCKET_OPTIONS,
//         query: {
//           userId: this.userId,
//           userRole: this.userRole,
//           connectionId: this.connectionId,
//           timestamp: Date.now().toString()
//         }
//       });
      
//       // Setup event listeners
//       this._setupEventListeners();
      
//       // Connect
//       this.socket.connect();
      
//     } catch (error) {
//       this._logError('Connection initialization failed:', error);
//       this._setState('error');
//       this._scheduleReconnect();
//     }
//   }

//   /**
//    * Disconnect from server
//    */
//   disconnect(reason = 'Client requested disconnect') {
//     this._log(`Disconnecting: ${reason}`);
    
//     this._cleanupTimers();
//     this._setState('disconnecting');
    
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
    
//     this._setState('disconnected');
//     this.isAuthenticated = false;
//     this.stats.lastDisconnectedAt = new Date();
    
//     this._log('Disconnected successfully');
//   }

//   /**
//    * Emit event to server - FIXED
//    */
//   emit(event, data = {}) {
//     if (!this.socket || !this.socket.connected || !this.isAuthenticated) {
//       this._log(`Queueing event ${event} - socket not ready`);
//       this._queueMessage(event, data);
//       return false;
//     }
    
//     try {
//       const payload = {
//         ...data,
//         userId: this.userId,
//         userRole: this.userRole,
//         connectionId: this.connectionId,
//         timestamp: new Date().toISOString()
//       };
      
//       this.socket.emit(event, payload);
//       this.stats.totalEventsSent++;
      
//       if (CONFIG.DEBUG) {
//         this._log(`Emitted: ${event}`, {
//           event: event,
//           userId: this.userId,
//           dataSize: JSON.stringify(payload).length
//         });
//       }
      
//       return true;
//     } catch (error) {
//       this._logError(`Failed to emit ${event}:`, error);
//       this._queueMessage(event, data);
//       return false;
//     }
//   }

//   /**
//    * Register FCM token with server
//    */
//   registerFCMToken(fcmToken) {
//     if (!fcmToken || typeof fcmToken !== 'string') {
//       this._logError('Invalid FCM token');
//       return false;
//     }
    
//     return this.emit(EventTypes.REGISTER_FCM_TOKEN, {
//       token: fcmToken,
//       deviceInfo: this._getDeviceInfo(),
//       timestamp: new Date().toISOString()
//     });
//   }

//   /**
//    * Send authentication request - FIXED FOR YOUR BACKEND
//    */
//   authenticate() {
//     if (!this.socket || !this.socket.connected) {
//       this._logError('Cannot authenticate - socket not connected');
//       return false;
//     }
    
//     // Your backend expects this exact format (matches server.js line 96-99)
//     return this.emit(EventTypes.AUTHENTICATE, {
//       token: CONFIG.AUTH_TOKEN,
//       userId: this.userId,
//       userRole: this.userRole,
//       name: this.userData?.name || `Admin-${this.userId.substring(0, 8)}`,
//       connectionId: this.connectionId,
//       timestamp: new Date().toISOString()
//     });
//   }

//   /**
//    * Send heartbeat/ping
//    */
//   sendHeartbeat() {
//     if (this.socket?.connected && this.isAuthenticated) {
//       const pingTime = Date.now();
      
//       this.emit(EventTypes.PING, { 
//         timestamp: pingTime,
//         userId: this.userId 
//       });
      
//       // Set timeout for pong response
//       if (this.heartbeatTimeout) {
//         clearTimeout(this.heartbeatTimeout);
//       }
      
//       this.heartbeatTimeout = setTimeout(() => {
//         if (this.socket?.connected) {
//           this._logError('Heartbeat timeout - reconnecting...');
//           this.disconnect('Heartbeat timeout');
//           this._scheduleReconnect();
//         }
//       }, CONFIG.HEARTBEAT_TIMEOUT);
//     }
//   }

//   // ========== EVENT LISTENER SETUP ==========

//   _setupEventListeners() {
//     if (!this.socket) return;
    
//     // Connection events
//     this.socket.on(EventTypes.CONNECT, () => this._handleConnect());
//     this.socket.on(EventTypes.CONNECT_ERROR, (error) => this._handleConnectError(error));
//     this.socket.on(EventTypes.DISCONNECT, (reason) => this._handleDisconnect(reason));
//     this.socket.on(EventTypes.ERROR, (error) => this._handleError(error));
    
//     // Authentication events (from your server.js)
//     this.socket.on(EventTypes.AUTHENTICATED, (data) => this._handleAuthenticated(data));
//     this.socket.on(EventTypes.UNAUTHORIZED, (data) => this._handleUnauthorized(data));
    
//     // System events
//     this.socket.on(EventTypes.PONG, (data) => this._handlePong(data));
    
//     // ✅ FIXED: Listen for events your backend emits
//     this.socket.on(EventTypes.NEW_ORDER, (data) => this._handleNewOrder(data));
//     this.socket.on(EventTypes.PAYMENT_RECEIVED, (data) => this._handlePaymentReceived(data));
//     this.socket.on(EventTypes.ORDER_STATUS_CHANGED, (data) => this._handleOrderStatusChanged(data));
//     this.socket.on(EventTypes.LOW_STOCK_ALERT, (data) => this._handleLowStockAlert(data));
//     this.socket.on(EventTypes.DASHBOARD_UPDATE, (data) => this._handleDashboardUpdate(data));
    
//     // Custom events
//     this.socket.on(EventTypes.FCM_TOKEN_REGISTERED, (data) => this._handleFCMTokenRegistered(data));
//   }

//   // ========== EVENT HANDLERS ==========

//   _handleConnect() {
//     this._log('Socket.IO connected to /notifications namespace');
//     this._setState('connected');
//     this.stats.successfulConnections++;
//     this.stats.lastConnectedAt = new Date();
    
//     // Start heartbeat
//     this._startHeartbeat();
    
//     // Send authentication after connection - REQUIRED FOR YOUR BACKEND
//     setTimeout(() => {
//       if (this.socket?.connected) {
//         this.authenticate();
//       }
//     }, 500);
    
//     // Flush queued messages
//     this._flushMessageQueue();
    
//     // Notify connection listeners
//     this._notifyConnectionChange(true);
//   }

//   _handleConnectError(error) {
//     const errorMessage = error?.message || error?.toString() || 'Unknown connection error';
    
//     if (CONFIG.DEBUG) {
//       console.log(`${CONFIG.LOG_PREFIX} ❌ Connection error: ${errorMessage}`);
//     }
    
//     this._setState('error');
//     this.stats.failedConnections++;
    
//     // Schedule reconnection
//     this._scheduleReconnect();
//   }

//   _handleDisconnect(reason) {
//     this._log(`Disconnected: ${reason}`);
//     this._setState('disconnected');
//     this.isAuthenticated = false;
//     this.stats.lastDisconnectedAt = new Date();
    
//     this._cleanupTimers();
    
//     // Notify connection listeners
//     this._notifyConnectionChange(false);
    
//     // Schedule reconnection unless intentionally disconnected
//     if (reason !== 'io client disconnect' && reason !== 'transport close') {
//       this._scheduleReconnect();
//     }
//   }

//   _handleError(error) {
//     const errorMessage = error?.message || error?.toString() || 'Unknown error';
//     this._logError('Socket error:', errorMessage);
//     this._setState('error');
//   }

//   _handleAuthenticated(data) {
//     this._log('Authentication successful');
//     this.isAuthenticated = true;
    
//     if (CONFIG.DEBUG) {
//       console.log(`${CONFIG.LOG_PREFIX} ✅ Authenticated as ${data.user?.name || this.userId}`);
//     }
    
//     // Register any pending FCM tokens
//     this._registerPendingFCMTokens();
//   }

//   _handleUnauthorized(data) {
//     const message = data?.message || 'Invalid credentials';
//     this._logError('Authentication failed:', message);
//     this.isAuthenticated = false;
    
//     // Disconnect on authentication failure
//     this.disconnect('Authentication failed');
//   }

//   _handlePong(data) {
//     if (this.heartbeatTimeout) {
//       clearTimeout(this.heartbeatTimeout);
//       this.heartbeatTimeout = null;
//     }
    
//     if (data?.timestamp) {
//       const latency = Date.now() - data.timestamp;
//       this.stats.pingLatency = latency;
//     }
//   }

//   // ========== NOTIFICATION HANDLERS ==========

//   _handleNewOrder(data) {
//     this._log(`New order: ${data.order?.orderNumber || 'Unknown'}`);
//     this._dispatchNotification('NEW_ORDER', {
//       title: '🛍️ New Order Received',
//       message: `Order #${data.order?.orderNumber} from ${data.order?.customerName || 'Customer'}`,
//       data: data.order,
//       priority: 'high',
//       timestamp: new Date().toISOString()
//     });
    
//     // Also dispatch custom event for dashboard
//     this._dispatchCustomEvent('NEW_ORDER', data);
//   }

//   _handlePaymentReceived(data) {
//     this._log(`Payment received for order: ${data.orderNumber || 'Unknown'}`);
//     this._dispatchNotification('PAYMENT_RECEIVED', {
//       title: '💰 Payment Received',
//       message: `Payment of ₹${data.amount} for order #${data.orderNumber}`,
//       data: data,
//       priority: 'high',
//       timestamp: new Date().toISOString()
//     });
    
//     this._dispatchCustomEvent('PAYMENT_RECEIVED', data);
//   }

//   _handleOrderStatusChanged(data) {
//     this._log(`Order status updated: ${data.orderNumber} (${data.oldStatus} → ${data.newStatus})`);
//     this._dispatchNotification('ORDER_STATUS_CHANGED', {
//       title: '📦 Order Status Updated',
//       message: `Order #${data.orderNumber} is now ${data.newStatus}`,
//       data: data,
//       priority: 'normal',
//       timestamp: new Date().toISOString()
//     });
    
//     this._dispatchCustomEvent('ORDER_STATUS_CHANGED', data);
//   }

//   _handleLowStockAlert(data) {
//     this._log(`Low stock alert: ${data.product?.productName || 'Product'}`);
//     this._dispatchNotification('LOW_STOCK_ALERT', {
//       title: '📦 Low Stock Alert',
//       message: `${data.product?.productName} is running low (${data.product?.stock} left)`,
//       data: data.product,
//       priority: 'normal',
//       timestamp: new Date().toISOString()
//     });
    
//     this._dispatchCustomEvent('LOW_STOCK_ALERT', data);
//   }

//   _handleDashboardUpdate(data) {
//     this._log(`Dashboard update: ${data.type || 'update'}`);
//     this._dispatchCustomEvent('DASHBOARD_UPDATE', data);
//   }

//   _handleFCMTokenRegistered(data) {
//     this._log('FCM token registered with server');
//     this._dispatchCustomEvent('FCM_TOKEN_REGISTERED', data);
//   }

//   // ========== QUEUE MANAGEMENT ==========

//   _queueMessage(event, data) {
//     if (this.messageQueue.length >= 50) {
//       // Remove oldest message
//       this.messageQueue.shift();
//     }
    
//     this.messageQueue.push({
//       event,
//       data,
//       timestamp: new Date().toISOString(),
//       retryCount: 0
//     });
    
//     this._log(`Queued: ${event} (queue size: ${this.messageQueue.length})`);
//   }

//   _flushMessageQueue() {
//     if (this.messageQueue.length === 0 || !this.isAuthenticated) {
//       return;
//     }
    
//     const failedMessages = [];
    
//     this.messageQueue.forEach((message) => {
//       const success = this.emit(message.event, message.data);
      
//       if (!success && message.retryCount < 3) {
//         message.retryCount++;
//         failedMessages.push(message);
//       }
//     });
    
//     this.messageQueue = failedMessages;
    
//     if (failedMessages.length > 0) {
//       this._log(`${failedMessages.length} messages failed to send, will retry`);
//     }
//   }

//   // ========== TIMER MANAGEMENT ==========

//   _startHeartbeat() {
//     this._cleanupHeartbeat();
    
//     this.heartbeatInterval = setInterval(() => {
//       this.sendHeartbeat();
//     }, CONFIG.HEARTBEAT_INTERVAL);
    
//     this._log('Heartbeat started');
//   }

//   _scheduleReconnect() {
//     if (this.reconnectTimer || this.state === 'connected') {
//       return;
//     }
    
//     this.stats.reconnectionAttempts++;
    
//     const delay = Math.min(1000 * Math.pow(1.5, this.stats.reconnectionAttempts), 30000);
    
//     this._log(`Scheduling reconnect in ${delay}ms (attempt ${this.stats.reconnectionAttempts})`);
    
//     this.reconnectTimer = setTimeout(() => {
//       this.reconnectTimer = null;
//       if (this.userId) {
//         this._log('Attempting reconnection...');
//         this.connect(this.userData);
//       }
//     }, delay);
//   }

//   // ========== EVENT DISPATCHING ==========

//   _dispatchNotification(type, payload) {
//     const event = new CustomEvent('admin-notification', {
//       detail: {
//         id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//         type,
//         title: payload.title,
//         message: payload.message,
//         data: payload.data,
//         priority: payload.priority || 'normal',
//         timestamp: payload.timestamp,
//         duration: 5000
//       }
//     });
    
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(event);
//     }
//   }

//   _dispatchCustomEvent(eventName, data) {
//     const listeners = this.eventListeners.get(eventName) || [];
//     listeners.forEach(listener => {
//       try {
//         listener(data);
//       } catch (error) {
//         this._logError(`Error in event listener for ${eventName}:`, error);
//       }
//     });
//   }

//   // ========== UTILITY METHODS ==========

//   _getDeviceInfo() {
//     if (typeof window === 'undefined') return {};
    
//     return {
//       userAgent: navigator.userAgent,
//       platform: navigator.platform,
//       language: navigator.language,
//       screenSize: `${window.screen.width}x${window.screen.height}`,
//       timestamp: new Date().toISOString()
//     };
//   }

//   _registerPendingFCMTokens() {
//     if (typeof window === 'undefined') return;
    
//     try {
//       const pendingTokens = JSON.parse(localStorage.getItem('pending_fcm_tokens') || '[]');
      
//       pendingTokens.forEach(tokenData => {
//         if (tokenData.token) {
//           this.registerFCMToken(tokenData.token);
//         }
//       });
      
//     } catch (error) {
//       this._logError('Error registering pending tokens:', error);
//     }
//   }

//   _setState(newState) {
//     const oldState = this.state;
//     this.state = newState;
    
//     if (oldState !== newState) {
//       this._log(`State: ${oldState} → ${newState}`);
      
//       if (this.stateListeners && this.stateListeners.length > 0) {
//         this.stateListeners.forEach(listener => {
//           try {
//             listener(newState);
//           } catch (error) {}
//         });
//       }
//     }
//   }

//   _notifyConnectionChange(connected) {
//     if (this.connectionListeners && this.connectionListeners.length > 0) {
//       this.connectionListeners.forEach(listener => {
//         try {
//           listener(connected);
//         } catch (error) {}
//       });
//     }
//   }

//   // ========== CLEANUP ==========

//   _cleanup() {
//     this._cleanupTimers();
    
//     if (this.socket) {
//       this.socket.removeAllListeners();
//       this.socket.disconnect();
//       this.socket = null;
//     }
    
//     this.isAuthenticated = false;
//   }

//   _cleanupTimers() {
//     if (this.heartbeatInterval) {
//       clearInterval(this.heartbeatInterval);
//       this.heartbeatInterval = null;
//     }
    
//     if (this.heartbeatTimeout) {
//       clearTimeout(this.heartbeatTimeout);
//       this.heartbeatTimeout = null;
//     }
    
//     if (this.reconnectTimer) {
//       clearTimeout(this.reconnectTimer);
//       this.reconnectTimer = null;
//     }
//   }

//   _cleanupHeartbeat() {
//     if (this.heartbeatInterval) {
//       clearInterval(this.heartbeatInterval);
//       this.heartbeatInterval = null;
//     }
    
//     if (this.heartbeatTimeout) {
//       clearTimeout(this.heartbeatTimeout);
//       this.heartbeatTimeout = null;
//     }
//   }

//   // ========== LOGGING ==========

//   _log(message, data = null) {
//     if (!CONFIG.DEBUG) return;
    
//     console.log(`${CONFIG.LOG_PREFIX} ${message}`);
//     if (data) {
//       console.log(`${CONFIG.LOG_PREFIX} Data:`, data);
//     }
//   }

//   _logError(message, error = null) {
//     if (CONFIG.DEBUG) {
//       const errorMessage = error?.message || error?.toString() || error;
//       console.log(`${CONFIG.LOG_PREFIX} ❌ ${message} ${errorMessage ? `- ${errorMessage}` : ''}`);
//     }
//   }

//   // ========== GETTERS ==========

//   getStatus() {
//     return {
//       state: this.state,
//       isConnected: this.state === 'connected',
//       isAuthenticated: this.isAuthenticated,
//       connectionId: this.connectionId,
//       userId: this.userId,
//       userRole: this.userRole,
//       socketId: this.socket?.id,
//       socketConnected: this.socket?.connected || false,
//       stats: {
//         ...this.stats,
//         queueSize: this.messageQueue.length,
//         currentTime: new Date().toISOString()
//       }
//     };
//   }

//   // ========== EVENT LISTENER REGISTRATION ==========

//   on(eventName, callback) {
//     if (!this.eventListeners.has(eventName)) {
//       this.eventListeners.set(eventName, []);
//     }
//     this.eventListeners.get(eventName).push(callback);
    
//     // Also listen on socket if connected
//     if (this.socket) {
//       this.socket.on(eventName, callback);
//     }
//   }

//   off(eventName, callback) {
//     const listeners = this.eventListeners.get(eventName);
//     if (listeners) {
//       const index = listeners.indexOf(callback);
//       if (index > -1) {
//         listeners.splice(index, 1);
//       }
//     }
    
//     if (this.socket) {
//       this.socket.off(eventName, callback);
//     }
//   }

//   addConnectionListener(callback) {
//     if (!this.connectionListeners.includes(callback)) {
//       this.connectionListeners.push(callback);
//     }
//   }

//   removeConnectionListener(callback) {
//     const index = this.connectionListeners.indexOf(callback);
//     if (index > -1) {
//       this.connectionListeners.splice(index, 1);
//     }
//   }

//   addStateListener(callback) {
//     if (!this.stateListeners.includes(callback)) {
//       this.stateListeners.push(callback);
//     }
//   }

//   removeStateListener(callback) {
//     const index = this.stateListeners.indexOf(callback);
//     if (index > -1) {
//       this.stateListeners.splice(index, 1);
//     }
//   }

//   /**
//    * Test connection by sending a ping
//    */
//   async testConnection() {
//     if (!this.socket || !this.socket.connected) {
//       return { success: false, message: 'Socket not connected' };
//     }
    
//     return new Promise((resolve) => {
//       const pingTime = Date.now();
//       let responded = false;
      
//       const timeout = setTimeout(() => {
//         if (!responded) {
//           resolve({ success: false, message: 'Test timeout', latency: null });
//         }
//       }, 5000);
      
//       this.socket.emit(EventTypes.PING, { timestamp: pingTime, test: true });
      
//       this.socket.once(EventTypes.PONG, (data) => {
//         responded = true;
//         clearTimeout(timeout);
//         const latency = Date.now() - pingTime;
//         resolve({ 
//           success: true, 
//           message: 'Connection test successful', 
//           latency,
//           serverTime: data.serverTime 
//         });
//       });
//     });
//   }
// }

// // ========== SINGLETON EXPORT ==========
// let instance = null;

// export function getSocketIOClient() {
//   if (!instance) {
//     instance = new SocketIOClient();
    
//     if (typeof window !== 'undefined') {
//       const cleanup = () => {
//         if (instance) {
//           instance.disconnect('Page unload');
//         }
//       };
      
//       window.addEventListener('beforeunload', cleanup);
//       window.addEventListener('pagehide', cleanup);
//       window.addEventListener('unload', cleanup);
//     }
//   }
  
//   return instance;
// }

// export default getSocketIOClient;