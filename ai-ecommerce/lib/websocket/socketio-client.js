
// // lib/websocket/socket-client.js
// "use client";

// import { io } from 'socket.io-client';

// /**
//  * Production-grade Socket.IO Client for Admin Notifications
//  * PROFESSIONAL VERSION - With multi-tenant support and proper connection handling
//  */

// // ========== CONFIGURATION ==========
// const CONFIG = {
//   // Connect to your backend server on port 3001 with /notifications namespace
//   SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001',
//   NAMESPACE: '/notifications', // Must match your server.js
  
//   // Socket.IO options
//   SOCKET_OPTIONS: {
//     path: '/socket.io/', // Standard Socket.IO path
//     transports: ['polling', 'websocket'], // Polling first for compatibility
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     timeout: 20000,
//     autoConnect: false,
//     forceNew: true,
//     withCredentials: true,
//     // Compatibility options
//     allowEIO3: true,
//     allowEIO4: true,
//     upgrade: true,
//     rememberUpgrade: true,
//     // Development settings
//     secure: false,
//     rejectUnauthorized: false
//   },
  
//   // Authentication token (must match your server.js)
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
  
//   // Authentication events
//   AUTHENTICATE: 'authenticate',
//   AUTHENTICATED: 'authenticated',
//   UNAUTHORIZED: 'unauthorized',
  
//   // Notification events
//   NEW_ORDER: 'NEW_ORDER',
//   PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
//   ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
//   LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
  
//   // System events
//   PING: 'ping',
//   PONG: 'pong',
  
//   // Custom events
//   REGISTER_FCM_TOKEN: 'register-fcm-token',
//   FCM_TOKEN_REGISTERED: 'fcm-token-registered',
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
    
//     // User context - MULTI-TENANT SUPPORT
//     this.userId = null;
//     this.userRole = null;
//     this.userData = null;
//     this.companyId = null; // ✅ Company ID for multi-tenant
    
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
    
//     // Auto-reconnect flag
//     this.autoReconnect = true;
    
//     this._log('Socket.IO Client initialized');
//   }

//   // ========== PUBLIC API ==========

//   /**
//    * Connect to Socket.IO server with multi-tenant support
//    */
//   connect(user = {}) {
//     // Prevent duplicate connections
//     if (this.state === 'connected' || this.state === 'connecting') {
//       this._log('Already connected or connecting');
      
//       // If already connected but not authenticated, send authentication
//       if (this.state === 'connected' && !this.isAuthenticated && this.socket) {
//         this._log('Already connected but not authenticated - sending auth');
//         setTimeout(() => this.authenticate(), 500);
//       }
      
//       return this.socket;
//     }
    
//     // Clear any existing connection
//     this._cleanup();
    
//     // Set user context with company ID for multi-tenant
//     this.userId = user.id || user._id || 'unknown';
//     this.userRole = user.role || 'user';
//     this.userData = user;
//     this.companyId = user.companyId || null; // ✅ Store company ID
//     this.autoReconnect = user.autoReconnect !== false;
    
//     this.connectionId = `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     // Update state
//     this._setState('connecting');
//     this.stats.totalConnections++;
    
//     try {
//       // Connect to the correct URL with namespace
//       const fullUrl = `${CONFIG.SERVER_URL}${CONFIG.NAMESPACE}`;
      
//       this._log(`Connecting to ${fullUrl}`);
//       this._log(`Connection ID: ${this.connectionId}`);
//       this._log(`User ID: ${this.userId}, Role: ${this.userRole}, Company: ${this.companyId || 'ALL'}`);
      
//       // Create socket with query parameters including company ID
//       this.socket = io(fullUrl, {
//         ...CONFIG.SOCKET_OPTIONS,
//         query: {
//           userId: this.userId,
//           userRole: this.userRole,
//           companyId: this.companyId || '', // ✅ Pass company ID in query
//           connectionId: this.connectionId,
//           timestamp: Date.now().toString()
//         }
//       });
      
//       // Setup all event listeners
//       this._setupEventListeners();
      
//       // Connect
//       this.socket.connect();
      
//       return this.socket;
      
//     } catch (error) {
//       this._logError('Connection initialization failed:', error);
//       this._setState('error');
//       this._scheduleReconnect();
//       return null;
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
//       this.socket.removeAllListeners();
//       this.socket.disconnect();
//       this.socket = null;
//     }
    
//     this._setState('disconnected');
//     this.isAuthenticated = false;
//     this.stats.lastDisconnectedAt = new Date();
    
//     this._log('Disconnected successfully');
//   }

//   /**
//    * Emit event to server with company context
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
//         companyId: this.companyId, // ✅ Include company ID in payload
//         connectionId: this.connectionId,
//         timestamp: new Date().toISOString()
//       };
      
//       this.socket.emit(event, payload);
//       this.stats.totalEventsSent++;
      
//       if (CONFIG.DEBUG) {
//         this._log(`Emitted: ${event}`);
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
//       companyId: this.companyId // ✅ Include company ID
//     });
//   }

//   /**
//    * Send authentication request
//    */
//   authenticate() {
//     if (!this.socket || !this.socket.connected) {
//       this._logError('Cannot authenticate - socket not connected');
//       return false;
//     }
    
//     return this.emit(EventTypes.AUTHENTICATE, {
//       token: CONFIG.AUTH_TOKEN,
//       userId: this.userId,
//       userRole: this.userRole,
//       companyId: this.companyId, // ✅ Include company ID
//       name: this.userData?.name || this.userData?.email || `User-${this.userId.substring(0, 8)}`,
//       connectionId: this.connectionId
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
//         companyId: this.companyId // ✅ Include company ID
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
    
//     // Authentication events
//     this.socket.on(EventTypes.AUTHENTICATED, (data) => this._handleAuthenticated(data));
//     this.socket.on(EventTypes.UNAUTHORIZED, (data) => this._handleUnauthorized(data));
    
//     // System events
//     this.socket.on(EventTypes.PONG, (data) => this._handlePong(data));
    
//     // Notification events
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
//     this._log(`✅ Connected to ${CONFIG.SERVER_URL}${CONFIG.NAMESPACE}`);
//     this._log(`Socket ID: ${this.socket?.id}`);
//     this._setState('connected');
//     this.stats.successfulConnections++;
//     this.stats.lastConnectedAt = new Date();
    
//     // Start heartbeat
//     this._startHeartbeat();
    
//     // Send authentication after connection
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
//     this._logError('Connection error:', error.message);
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
//     if (reason !== 'io client disconnect' && this.autoReconnect) {
//       this._scheduleReconnect();
//     }
//   }

//   _handleError(error) {
//     this._logError('Socket error:', error);
//     this._setState('error');
//   }

//   _handleAuthenticated(data) {
//     this._log('✅ Authentication successful');
//     this.isAuthenticated = true;
    
//     // Store any company info from server
//     if (data?.user?.companyId) {
//       this.companyId = data.user.companyId;
//     }
    
//     // Register any pending FCM tokens
//     this._registerPendingFCMTokens();
    
//     // Dispatch authenticated event
//     this._dispatchCustomEvent('authenticated', data);
//   }

//   _handleUnauthorized(data) {
//     this._logError('Authentication failed:', data?.message);
//     this.isAuthenticated = false;
    
//     // Don't auto-reconnect on auth failure
//     this.autoReconnect = false;
//     this.disconnect('Authentication failed');
    
//     // Dispatch unauthorized event
//     this._dispatchCustomEvent('unauthorized', data);
//   }

//   _handlePong(data) {
//     if (this.heartbeatTimeout) {
//       clearTimeout(this.heartbeatTimeout);
//       this.heartbeatTimeout = null;
//     }
    
//     if (data?.timestamp) {
//       const latency = Date.now() - data.timestamp;
//       this.stats.pingLatency = latency;
//       this._log(`Heartbeat latency: ${latency}ms`);
//     }
//   }

//   // ========== NOTIFICATION HANDLERS WITH COMPANY CONTEXT ==========

//   _handleNewOrder(data) {
//     this._log(`📦 New order: ${data.order?.orderNumber || 'Unknown'} for company: ${data.companyId || 'ALL'}`);
    
//     // Dispatch notification event
//     this._dispatchNotification('NEW_ORDER', {
//       title: '🛍️ New Order Received',
//       message: `Order #${data.order?.orderNumber} from ${data.order?.customerName || 'Customer'}`,
//       data: data.order,
//       priority: 'high',
//       companyId: data.companyId
//     });
    
//     // Save to API
//     this._saveNotificationToAPI('NEW_ORDER', data.order);
    
//     // Dispatch window event
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(new CustomEvent('new-order-received', {
//         detail: data.order || data
//       }));
//     }
    
//     this._dispatchCustomEvent('NEW_ORDER', data);
//   }

//   _handlePaymentReceived(data) {
//     this._log(`💰 Payment received: ${data.orderNumber} for company: ${data.companyId || 'ALL'}`);
    
//     this._dispatchNotification('PAYMENT_RECEIVED', {
//       title: '💰 Payment Received',
//       message: `Payment of ₹${data.amount} for order #${data.orderNumber}`,
//       data: data,
//       companyId: data.companyId
//     });
    
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(new CustomEvent('payment-updated', { detail: data }));
//     }
    
//     this._dispatchCustomEvent('PAYMENT_RECEIVED', data);
//   }

//   _handleOrderStatusChanged(data) {
//     this._log(`📦 Order status changed: ${data.orderNumber} to ${data.newStatus} for company: ${data.companyId || 'ALL'}`);
    
//     this._dispatchNotification('ORDER_STATUS_CHANGED', {
//       title: '📦 Order Status Updated',
//       message: `Order #${data.orderNumber} is now ${data.newStatus}`,
//       data: data,
//       companyId: data.companyId
//     });
    
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(new CustomEvent('order-status-updated', { detail: data }));
//     }
    
//     this._dispatchCustomEvent('ORDER_STATUS_CHANGED', data);
//   }

//   _handleLowStockAlert(data) {
//     this._log(`⚠️ Low stock alert: ${data.product?.productName} for company: ${data.companyId || 'ALL'}`);
    
//     this._dispatchNotification('LOW_STOCK_ALERT', {
//       title: '📦 Low Stock Alert',
//       message: `${data.product?.productName} is running low (${data.product?.stock} left)`,
//       data: data.product,
//       companyId: data.companyId
//     });
    
//     this._dispatchCustomEvent('LOW_STOCK_ALERT', data);
//   }

//   _handleDashboardUpdate(data) {
//     this._log(`📊 Dashboard update: ${data.type} for company: ${data.companyId || 'ALL'}`);
//     this._dispatchCustomEvent('DASHBOARD_UPDATE', data);
//   }

//   _handleFCMTokenRegistered(data) {
//     this._log('✅ FCM token registered');
//     this._dispatchCustomEvent('FCM_TOKEN_REGISTERED', data);
//   }

//   // ========== HELPER METHODS ==========

//   async _saveNotificationToAPI(type, data) {
//     try {
//       const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
//       await fetch('/api/notifications', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         },
//         body: JSON.stringify({
//           type,
//           data,
//           source: 'socketio',
//           companyId: this.companyId,
//           timestamp: new Date().toISOString()
//         })
//       });
//     } catch (error) {
//       console.error('Failed to save notification:', error);
//     }
//   }

//   _queueMessage(event, data) {
//     if (this.messageQueue.length >= 50) {
//       this.messageQueue.shift();
//     }
    
//     this.messageQueue.push({
//       event,
//       data,
//       timestamp: new Date().toISOString(),
//       retryCount: 0
//     });
//   }

//   _flushMessageQueue() {
//     if (this.messageQueue.length === 0 || !this.isAuthenticated) return;
    
//     const failedMessages = [];
    
//     this.messageQueue.forEach((message) => {
//       const success = this.emit(message.event, message.data);
//       if (!success && message.retryCount < 3) {
//         message.retryCount++;
//         failedMessages.push(message);
//       }
//     });
    
//     this.messageQueue = failedMessages;
//   }

//   _startHeartbeat() {
//     this._cleanupHeartbeat();
    
//     this.heartbeatInterval = setInterval(() => {
//       this.sendHeartbeat();
//     }, CONFIG.HEARTBEAT_INTERVAL);
//   }

//   _scheduleReconnect() {
//     if (this.reconnectTimer || this.state === 'connected' || !this.autoReconnect) return;
    
//     this.stats.reconnectionAttempts++;
//     const delay = Math.min(1000 * Math.pow(1.5, this.stats.reconnectionAttempts), 30000);
    
//     this._log(`Scheduling reconnect in ${delay}ms (attempt ${this.stats.reconnectionAttempts})`);
    
//     this.reconnectTimer = setTimeout(() => {
//       this.reconnectTimer = null;
//       if (this.userId && this.autoReconnect) {
//         this._log('Attempting reconnection...');
//         this.connect(this.userData);
//       }
//     }, delay);
//   }

//   _dispatchNotification(type, payload) {
//     const event = new CustomEvent('admin-notification', {
//       detail: {
//         id: `notification_${Date.now()}`,
//         type,
//         ...payload,
//         timestamp: new Date().toISOString()
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

//   _getDeviceInfo() {
//     if (typeof window === 'undefined') return {};
    
//     return {
//       userAgent: navigator.userAgent,
//       platform: navigator.platform,
//       language: navigator.language,
//       screenSize: `${window.screen.width}x${window.screen.height}`,
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
      
//       // Clear after registering
//       if (pendingTokens.length > 0) {
//         localStorage.removeItem('pending_fcm_tokens');
//       }
//     } catch (error) {
//       this._logError('Error registering pending tokens:', error);
//     }
//   }

//   _setState(newState) {
//     const oldState = this.state;
//     this.state = newState;
    
//     if (oldState !== newState) {
//       this._log(`State: ${oldState} → ${newState}`);
      
//       this.stateListeners.forEach(listener => {
//         try {
//           listener(newState, oldState);
//         } catch (error) {}
//       });
//     }
//   }

//   _notifyConnectionChange(connected) {
//     this.connectionListeners.forEach(listener => {
//       try {
//         listener(connected, {
//           userId: this.userId,
//           userRole: this.userRole,
//           companyId: this.companyId,
//           socketId: this.socket?.id
//         });
//       } catch (error) {}
//     });
//   }

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

//   _log(message, data = null) {
//     if (!CONFIG.DEBUG) return;
//     console.log(`${CONFIG.LOG_PREFIX} ${message}`, data ? data : '');
//   }

//   _logError(message, error = null) {
//     if (CONFIG.DEBUG) {
//       const errorMessage = error?.message || error?.toString() || error;
//       console.error(`${CONFIG.LOG_PREFIX} ❌ ${message}`, errorMessage ? errorMessage : '');
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
//       companyId: this.companyId,
//       socketId: this.socket?.id,
//       stats: {
//         ...this.stats,
//         queueSize: this.messageQueue.length
//       }
//     };
//   }

//   /**
//    * Get connection info for debugging
//    */
//   getConnectionInfo() {
//     return {
//       url: `${CONFIG.SERVER_URL}${CONFIG.NAMESPACE}`,
//       state: this.state,
//       socketId: this.socket?.id,
//       userId: this.userId,
//       companyId: this.companyId,
//       isAuthenticated: this.isAuthenticated,
//       transport: this.socket?.io?.engine?.transport?.name || 'unknown',
//       reconnectionAttempts: this.stats.reconnectionAttempts,
//       queueSize: this.messageQueue.length
//     };
//   }

//   // ========== EVENT LISTENER REGISTRATION ==========

//   on(eventName, callback) {
//     if (!this.eventListeners.has(eventName)) {
//       this.eventListeners.set(eventName, []);
//     }
//     this.eventListeners.get(eventName).push(callback);
    
//     if (this.socket) {
//       this.socket.on(eventName, callback);
//     }
    
//     return this; // For chaining
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
    
//     return this; // For chaining
//   }

//   /**
//    * Remove all listeners for an event
//    */
//   removeAllListeners(eventName) {
//     if (eventName) {
//       this.eventListeners.delete(eventName);
//       if (this.socket) {
//         this.socket.removeAllListeners(eventName);
//       }
//     } else {
//       this.eventListeners.clear();
//       if (this.socket) {
//         this.socket.removeAllListeners();
//       }
//     }
    
//     return this;
//   }

//   addConnectionListener(callback) {
//     if (!this.connectionListeners.includes(callback)) {
//       this.connectionListeners.push(callback);
//     }
//     return this;
//   }

//   addStateListener(callback) {
//     if (!this.stateListeners.includes(callback)) {
//       this.stateListeners.push(callback);
//     }
//     return this;
//   }

//   /**
//    * Test connection
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
//           resolve({ success: false, message: 'Timeout' });
//         }
//       }, 5000);
      
//       this.socket.emit(EventTypes.PING, { 
//         timestamp: pingTime, 
//         test: true,
//         companyId: this.companyId
//       });
      
//       this.socket.once(EventTypes.PONG, (data) => {
//         responded = true;
//         clearTimeout(timeout);
//         const latency = Date.now() - pingTime;
//         resolve({ success: true, latency, data });
//       });
//     });
//   }

//   /**
//    * Force reconnect
//    */
//   reconnect() {
//     this._log('Manual reconnect requested');
//     this.disconnect('Manual reconnect');
//     setTimeout(() => {
//       this.connect(this.userData);
//     }, 1000);
//   }

//   /**
//    * Set auto-reconnect behavior
//    */
//   setAutoReconnect(enabled) {
//     this.autoReconnect = enabled;
//     this._log(`Auto-reconnect ${enabled ? 'enabled' : 'disabled'}`);
//     return this;
//   }
// }

// // ========== SINGLETON EXPORT ==========
// let instance = null;

// export function getSocketIOClient() {
//   if (!instance) {
//     instance = new SocketIOClient();
    
//     if (typeof window !== 'undefined') {
//       window.addEventListener('beforeunload', () => {
//         if (instance) {
//           instance.disconnect('Page unload');
//         }
//       });
      
//       // Reconnect on online event
//       window.addEventListener('online', () => {
//         if (instance && instance.userId && instance.autoReconnect) {
//           instance._log('Network online - reconnecting');
//           instance.connect(instance.userData);
//         }
//       });
//     }
//   }
  
//   return instance;
// }

// export default getSocketIOClient;





















// lib/websocket/socket-client.js
"use client";

import { io } from 'socket.io-client';

/**
 * Production-grade Socket.IO Client for Admin Notifications
 * PROFESSIONAL VERSION - With multi-tenant support and proper connection handling
 * FIXED: Added proper export, reconnection logic, and error handling
 */

// ========== CONFIGURATION ==========
const CONFIG = {
  // Connect to your backend server on port 3001 with /notifications namespace
  SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001',
  NAMESPACE: '/notifications', // Must match your server.js
  
  // Socket.IO options
  SOCKET_OPTIONS: {
    path: '/socket.io/', // Standard Socket.IO path
    transports: ['polling', 'websocket'], // Polling first for compatibility
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
    forceNew: true,
    withCredentials: true,
    // Compatibility options
    allowEIO3: true,
    allowEIO4: true,
    upgrade: true,
    rememberUpgrade: true,
    // Development settings
    secure: false,
    rejectUnauthorized: false
  },
  
  // Authentication token (must match your server.js)
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
  
  // Authentication events
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',
  
  // Notification events
  NEW_ORDER: 'NEW_ORDER',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
  
  // System events
  PING: 'ping',
  PONG: 'pong',
  
  // Custom events
  REGISTER_FCM_TOKEN: 'register-fcm-token',
  FCM_TOKEN_REGISTERED: 'fcm-token-registered',
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
    
    // User context - MULTI-TENANT SUPPORT
    this.userId = null;
    this.userRole = null;
    this.userData = null;
    this.companyId = null;
    
    // Timers
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0; // ✅ FIXED: Added reconnectAttempts counter
    this.maxReconnectAttempts = 10; // ✅ FIXED: Max attempts before giving up
    
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
    
    // Auto-reconnect flag
    this.autoReconnect = true;
    
    this._log('Socket.IO Client initialized');
  }

  // ========== PUBLIC API ==========

  /**
   * Connect to Socket.IO server with multi-tenant support
   */
  connect(user = {}) {
    // Prevent duplicate connections
    if (this.state === 'connected' || this.state === 'connecting') {
      this._log('Already connected or connecting');
      
      // If already connected but not authenticated, send authentication
      if (this.state === 'connected' && !this.isAuthenticated && this.socket) {
        this._log('Already connected but not authenticated - sending auth');
        setTimeout(() => this.authenticate(), 500);
      }
      
      return this.socket;
    }
    
    // Clear any existing connection
    this._cleanup();
    
    // Reset reconnect attempts on manual connect
    this.reconnectAttempts = 0;
    
    // Set user context with company ID for multi-tenant
    this.userId = user.id || user._id || 'unknown';
    this.userRole = user.role || 'user';
    this.userData = user;
    this.companyId = user.companyId || null;
    this.autoReconnect = user.autoReconnect !== false;
    
    this.connectionId = `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update state
    this._setState('connecting');
    this.stats.totalConnections++;
    
    try {
      // Connect to the correct URL with namespace
      const fullUrl = `${CONFIG.SERVER_URL}${CONFIG.NAMESPACE}`;
      
      this._log(`Connecting to ${fullUrl}`);
      this._log(`Connection ID: ${this.connectionId}`);
      this._log(`User ID: ${this.userId}, Role: ${this.userRole}, Company: ${this.companyId || 'ALL'}`);
      
      // Create socket with query parameters including company ID
      this.socket = io(fullUrl, {
        ...CONFIG.SOCKET_OPTIONS,
        query: {
          userId: this.userId,
          userRole: this.userRole,
          companyId: this.companyId || '',
          connectionId: this.connectionId,
          timestamp: Date.now().toString()
        }
      });
      
      // Setup all event listeners
      this._setupEventListeners();
      
      // Connect
      this.socket.connect();
      
      return this.socket;
      
    } catch (error) {
      this._logError('Connection initialization failed:', error);
      this._setState('error');
      this._scheduleReconnect();
      return null;
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
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this._setState('disconnected');
    this.isAuthenticated = false;
    this.stats.lastDisconnectedAt = new Date();
    
    this._log('Disconnected successfully');
  }

  /**
   * Emit event to server with company context
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
        companyId: this.companyId,
        connectionId: this.connectionId,
        timestamp: new Date().toISOString()
      };
      
      this.socket.emit(event, payload);
      this.stats.totalEventsSent++;
      
      if (CONFIG.DEBUG) {
        this._log(`Emitted: ${event}`);
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
      companyId: this.companyId
    });
  }

  /**
   * Send authentication request
   */
  authenticate() {
    if (!this.socket || !this.socket.connected) {
      this._logError('Cannot authenticate - socket not connected');
      return false;
    }
    
    return this.emit(EventTypes.AUTHENTICATE, {
      token: CONFIG.AUTH_TOKEN,
      userId: this.userId,
      userRole: this.userRole,
      companyId: this.companyId,
      name: this.userData?.name || this.userData?.email || `User-${this.userId.substring(0, 8)}`,
      connectionId: this.connectionId
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
        companyId: this.companyId
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
    
    // Connection events
    this.socket.on(EventTypes.CONNECT, () => this._handleConnect());
    this.socket.on(EventTypes.CONNECT_ERROR, (error) => this._handleConnectError(error));
    this.socket.on(EventTypes.DISCONNECT, (reason) => this._handleDisconnect(reason));
    this.socket.on(EventTypes.ERROR, (error) => this._handleError(error));
    
    // Authentication events
    this.socket.on(EventTypes.AUTHENTICATED, (data) => this._handleAuthenticated(data));
    this.socket.on(EventTypes.UNAUTHORIZED, (data) => this._handleUnauthorized(data));
    
    // System events
    this.socket.on(EventTypes.PONG, (data) => this._handlePong(data));
    
    // Notification events
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
    this._log(`✅ Connected to ${CONFIG.SERVER_URL}${CONFIG.NAMESPACE}`);
    this._log(`Socket ID: ${this.socket?.id}`);
    this._setState('connected');
    this.stats.successfulConnections++;
    this.stats.lastConnectedAt = new Date();
    this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    
    // Start heartbeat
    this._startHeartbeat();
    
    // Send authentication after connection
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
    this._logError('Connection error:', error.message);
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
    if (reason !== 'io client disconnect' && this.autoReconnect) {
      this._scheduleReconnect();
    }
  }

  _handleError(error) {
    this._logError('Socket error:', error);
    this._setState('error');
  }

  _handleAuthenticated(data) {
    this._log('✅ Authentication successful');
    this.isAuthenticated = true;
    
    // Store any company info from server
    if (data?.user?.companyId) {
      this.companyId = data.user.companyId;
    }
    
    // Register any pending FCM tokens
    this._registerPendingFCMTokens();
    
    // Dispatch authenticated event
    this._dispatchCustomEvent('authenticated', data);
  }

  _handleUnauthorized(data) {
    this._logError('Authentication failed:', data?.message);
    this.isAuthenticated = false;
    
    // Don't auto-reconnect on auth failure
    this.autoReconnect = false;
    this.disconnect('Authentication failed');
    
    // Dispatch unauthorized event
    this._dispatchCustomEvent('unauthorized', data);
  }

  _handlePong(data) {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    if (data?.timestamp) {
      const latency = Date.now() - data.timestamp;
      this.stats.pingLatency = latency;
      this._log(`Heartbeat latency: ${latency}ms`);
    }
  }

  // ========== NOTIFICATION HANDLERS WITH COMPANY CONTEXT ==========

  _handleNewOrder(data) {
    this._log(`📦 New order: ${data.order?.orderNumber || 'Unknown'} for company: ${data.companyId || 'ALL'}`);
    this.stats.totalEventsReceived++;
    
    // Dispatch notification event
    this._dispatchNotification('NEW_ORDER', {
      title: '🛍️ New Order Received',
      message: `Order #${data.order?.orderNumber} from ${data.order?.customerName || 'Customer'}`,
      data: data.order,
      priority: 'high',
      companyId: data.companyId
    });
    
    // Save to API
    this._saveNotificationToAPI('NEW_ORDER', data.order);
    
    // Dispatch window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('new-order-received', {
        detail: data.order || data
      }));
    }
    
    this._dispatchCustomEvent('NEW_ORDER', data);
  }

  _handlePaymentReceived(data) {
    this._log(`💰 Payment received: ${data.orderNumber} for company: ${data.companyId || 'ALL'}`);
    this.stats.totalEventsReceived++;
    
    this._dispatchNotification('PAYMENT_RECEIVED', {
      title: '💰 Payment Received',
      message: `Payment of ₹${data.amount} for order #${data.orderNumber}`,
      data: data,
      companyId: data.companyId
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('payment-updated', { detail: data }));
    }
    
    this._dispatchCustomEvent('PAYMENT_RECEIVED', data);
  }

  _handleOrderStatusChanged(data) {
    this._log(`📦 Order status changed: ${data.orderNumber} to ${data.newStatus} for company: ${data.companyId || 'ALL'}`);
    this.stats.totalEventsReceived++;
    
    this._dispatchNotification('ORDER_STATUS_CHANGED', {
      title: '📦 Order Status Updated',
      message: `Order #${data.orderNumber} is now ${data.newStatus}`,
      data: data,
      companyId: data.companyId
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('order-status-updated', { detail: data }));
    }
    
    this._dispatchCustomEvent('ORDER_STATUS_CHANGED', data);
  }

  _handleLowStockAlert(data) {
    this._log(`⚠️ Low stock alert: ${data.product?.productName} for company: ${data.companyId || 'ALL'}`);
    this.stats.totalEventsReceived++;
    
    this._dispatchNotification('LOW_STOCK_ALERT', {
      title: '📦 Low Stock Alert',
      message: `${data.product?.productName} is running low (${data.product?.stock} left)`,
      data: data.product,
      companyId: data.companyId
    });
    
    this._dispatchCustomEvent('LOW_STOCK_ALERT', data);
  }

  _handleDashboardUpdate(data) {
    this._log(`📊 Dashboard update: ${data.type} for company: ${data.companyId || 'ALL'}`);
    this.stats.totalEventsReceived++;
    this._dispatchCustomEvent('DASHBOARD_UPDATE', data);
  }

  _handleFCMTokenRegistered(data) {
    this._log('✅ FCM token registered');
    this._dispatchCustomEvent('FCM_TOKEN_REGISTERED', data);
  }

  // ========== HELPER METHODS ==========

  async _saveNotificationToAPI(type, data) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          type,
          data,
          source: 'socketio',
          companyId: this.companyId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  }

  _queueMessage(event, data) {
    if (this.messageQueue.length >= 50) {
      this.messageQueue.shift();
    }
    
    this.messageQueue.push({
      event,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
  }

  _flushMessageQueue() {
    if (this.messageQueue.length === 0 || !this.isAuthenticated) return;
    
    const failedMessages = [];
    
    this.messageQueue.forEach((message) => {
      const success = this.emit(message.event, message.data);
      if (!success && message.retryCount < 3) {
        message.retryCount++;
        failedMessages.push(message);
      }
    });
    
    this.messageQueue = failedMessages;
  }

  _startHeartbeat() {
    this._cleanupHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, CONFIG.HEARTBEAT_INTERVAL);
  }

  _scheduleReconnect() {
    if (this.reconnectTimer || this.state === 'connected' || !this.autoReconnect) return;
    
    // Check max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this._logError(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      this._setState('failed');
      return;
    }
    
    this.reconnectAttempts++;
    this.stats.reconnectionAttempts = this.reconnectAttempts;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s max
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    this._log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.userId && this.autoReconnect) {
        this._log('Attempting reconnection...');
        this.connect(this.userData);
      }
    }, delay);
  }

  _dispatchNotification(type, payload) {
    const event = new CustomEvent('admin-notification', {
      detail: {
        id: `notification_${Date.now()}`,
        type,
        ...payload,
        timestamp: new Date().toISOString()
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

  _getDeviceInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
      
      // Clear after registering
      if (pendingTokens.length > 0) {
        localStorage.removeItem('pending_fcm_tokens');
      }
    } catch (error) {
      this._logError('Error registering pending tokens:', error);
    }
  }

  _setState(newState) {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      this._log(`State: ${oldState} → ${newState}`);
      
      this.stateListeners.forEach(listener => {
        try {
          listener(newState, oldState);
        } catch (error) {}
      });
    }
  }

  _notifyConnectionChange(connected) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected, {
          userId: this.userId,
          userRole: this.userRole,
          companyId: this.companyId,
          socketId: this.socket?.id
        });
      } catch (error) {}
    });
  }

  _cleanup() {
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

  _log(message, data = null) {
    if (!CONFIG.DEBUG) return;
    console.log(`${CONFIG.LOG_PREFIX} ${message}`, data ? data : '');
  }

  _logError(message, error = null) {
    if (CONFIG.DEBUG) {
      const errorMessage = error?.message || error?.toString() || error;
      console.error(`${CONFIG.LOG_PREFIX} ❌ ${message}`, errorMessage ? errorMessage : '');
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
      companyId: this.companyId,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      stats: {
        ...this.stats,
        queueSize: this.messageQueue.length
      }
    };
  }

  /**
   * Get connection info for debugging
   */
  getConnectionInfo() {
    return {
      url: `${CONFIG.SERVER_URL}${CONFIG.NAMESPACE}`,
      state: this.state,
      socketId: this.socket?.id,
      userId: this.userId,
      companyId: this.companyId,
      isAuthenticated: this.isAuthenticated,
      transport: this.socket?.io?.engine?.transport?.name || 'unknown',
      reconnectionAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      queueSize: this.messageQueue.length
    };
  }

  // ========== EVENT LISTENER REGISTRATION ==========

  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);
    
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
    
    return this;
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
    
    return this;
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.eventListeners.delete(eventName);
      if (this.socket) {
        this.socket.removeAllListeners(eventName);
      }
    } else {
      this.eventListeners.clear();
      if (this.socket) {
        this.socket.removeAllListeners();
      }
    }
    
    return this;
  }

  addConnectionListener(callback) {
    if (!this.connectionListeners.includes(callback)) {
      this.connectionListeners.push(callback);
    }
    return this;
  }

  addStateListener(callback) {
    if (!this.stateListeners.includes(callback)) {
      this.stateListeners.push(callback);
    }
    return this;
  }

  /**
   * Test connection
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
          resolve({ success: false, message: 'Timeout' });
        }
      }, 5000);
      
      this.socket.emit(EventTypes.PING, { 
        timestamp: pingTime, 
        test: true,
        companyId: this.companyId
      });
      
      this.socket.once(EventTypes.PONG, (data) => {
        responded = true;
        clearTimeout(timeout);
        const latency = Date.now() - pingTime;
        resolve({ success: true, latency, data });
      });
    });
  }

  /**
   * Force reconnect
   */
  reconnect() {
    this._log('Manual reconnect requested');
    this.reconnectAttempts = 0;
    this.disconnect('Manual reconnect');
    setTimeout(() => {
      this.connect(this.userData);
    }, 1000);
  }

  /**
   * Set auto-reconnect behavior
   */
  setAutoReconnect(enabled) {
    this.autoReconnect = enabled;
    this._log(`Auto-reconnect ${enabled ? 'enabled' : 'disabled'}`);
    return this;
  }

  /**
   * Set max reconnect attempts
   */
  setMaxReconnectAttempts(max) {
    this.maxReconnectAttempts = max;
    this._log(`Max reconnect attempts set to ${max}`);
    return this;
  }
}

// ========== SINGLETON EXPORT ==========
let instance = null;

export function getSocketIOClient() {
  if (!instance) {
    instance = new SocketIOClient();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (instance) {
          instance.disconnect('Page unload');
        }
      });
      
      // Reconnect on online event
      window.addEventListener('online', () => {
        if (instance && instance.userId && instance.autoReconnect) {
          instance._log('Network online - reconnecting');
          instance.connect(instance.userData);
        }
      });
    }
  }
  
  return instance;
}

// ✅ FIXED: Both named and default export for compatibility
export default getSocketIOClient;
