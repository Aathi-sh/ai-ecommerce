

// // app/admin/qr/page.js
// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { QRCodeSVG } from 'qrcode.react';
// import { useSession } from 'next-auth/react';
// import {
//   Wifi,
//   User,
//   WifiOff,
//   Smartphone,
//   LogOut,
//   RefreshCw,
//   Power,
//   MessageSquare,
//   Package,
//   Users,
//   BarChart3,
//   Activity,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Send,
//   Download,
//   DollarSign,
//   ChevronRight,
//   Maximize2,
//   Minimize2,
//   Phone,
//   Building2,
//   Radio
// } from 'lucide-react';

// // Import Socket.IO client for notifications
// import { getSocketIOClient } from '../../../lib/websocket/socketio-client';

// export default function WhatsAppDashboard() {
//   // ========== SESSION & COMPANY CONTEXT ==========
//   const { data: session, status: sessionStatus } = useSession();
//   const [companyId, setCompanyId] = useState(null);
//   const [companyName, setCompanyName] = useState('');
  
//   // ========== STATE MANAGEMENT ==========
//   const [qrCode, setQrCode] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('loading');
//   const [statusMessage, setStatusMessage] = useState('Connecting to WhatsApp service...');
//   const [stats, setStats] = useState({
//     totalOrders: 0,
//     totalChats: 0,
//     totalCustomers: 0,
//     totalMessages: 0,
//     activeChats: 0,
//     pendingOrders: 0,
//     completedOrders: 0,
//     revenue: 0,
//     revenueGrowth: 0,
//     ordersGrowth: 0,
//     customersGrowth: 0,
//     lastUpdated: null
//   });
//   const [botInfo, setBotInfo] = useState({
//     pushname: '',
//     platform: '',
//     version: '',
//     phoneNumber: '',
//     connectedSince: null,
//     lastActive: null
//   });
//   const [activityLog, setActivityLog] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showQRExpanded, setShowQRExpanded] = useState(false);
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [isMobile, setIsMobile] = useState(false);
//   const [connectionError, setConnectionError] = useState(null);
  
//   // Socket.IO state
//   const [socketStatus, setSocketStatus] = useState('disconnected');
//   const [socketAuthenticated, setSocketAuthenticated] = useState(false);
  
//   const wsRef = useRef(null);
//   const reconnectTimerRef = useRef(null);
//   const pingIntervalRef = useRef(null);
  
//   // Socket.IO client reference
//   const socketClientRef = useRef(null);

//   // ========== SAFE RENDERING UTILITY ==========
//   const safeString = (value, defaultValue = '') => {
//     if (value === null || value === undefined) return defaultValue;
//     if (typeof value === 'string') return value;
//     if (typeof value === 'number') return value.toString();
//     if (typeof value === 'boolean') return value.toString();
    
//     // If it's an object with these keys, it's the problematic one
//     if (typeof value === 'object' && value !== null) {
//       if (value.companyId && value.status && value.exists !== undefined) {
//         console.warn('Filtered out problematic status object:', value);
//         return defaultValue;
//       }
//     }
    
//     return defaultValue;
//   };

//   // ========== GET COMPANY ID FROM SESSION ==========
//   useEffect(() => {
//     if (session?.user) {
//       setCompanyId(session.user.companyId);
//       setCompanyName(session.user.companyName || 'Your Company');
//     }
//   }, [session]);

//   // ========== MOBILE DETECTION ==========
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
    
//     let resizeTimeout;
//     const handleResize = () => {
//       clearTimeout(resizeTimeout);
//       resizeTimeout = setTimeout(checkMobile, 150);
//     };
    
//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       clearTimeout(resizeTimeout);
//     };
//   }, []);

//   // ========== UTILITY FUNCTIONS ==========
//   const addToActivityLog = useCallback((message, type = 'info') => {
//     const entry = {
//       id: Date.now(),
//       message: safeString(message, 'Activity recorded'),
//       type: safeString(type, 'info'),
//       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     };
//     setActivityLog(prev => [entry, ...prev.slice(0, 7)]);
//   }, []);

//   // ========== API CALLS WITH COMPANY CONTEXT ==========
//   const fetchBotStatus = useCallback(async () => {
//     if (!companyId) return;
    
//     try {
//       const response = await fetch(`/api/whatsapp?action=status&companyId=${companyId}`);
//       const data = await response.json();
      
//       if (data.success) {
//         if (data.qr) setQrCode(data.qr);
//         if (data.status) setConnectionStatus(safeString(data.status, 'disconnected'));
//         if (data.message) setStatusMessage(safeString(data.message, 'WhatsApp service'));
        
//         if (data.botInfo && typeof data.botInfo === 'object' && !Array.isArray(data.botInfo)) {
//           setBotInfo({
//             pushname: safeString(data.botInfo.pushname, ''),
//             platform: safeString(data.botInfo.platform, 'WhatsApp Business'),
//             version: safeString(data.botInfo.version, '2.24.12'),
//             phoneNumber: safeString(data.botInfo.phoneNumber, 'Not available'),
//             connectedSince: data.botInfo.connectedSince || null,
//             lastActive: data.botInfo.lastActive || null
//           });
//         }
//       }
//     } catch (error) {
//       console.log('Failed to fetch bot status:', error.message);
//     }
//   }, [companyId]);

//   const fetchStats = useCallback(async () => {
//     if (!companyId) return;
    
//     try {
//       const response = await fetch(`/api/whatsapp?action=stats&companyId=${companyId}`);
//       const data = await response.json();
      
//       if (data.success && data.stats && typeof data.stats === 'object' && !Array.isArray(data.stats)) {
//         setStats(prev => ({
//           ...prev,
//           ...data.stats,
//           lastUpdated: new Date().toISOString()
//         }));
//       }
//     } catch (error) {
//       console.log('Failed to fetch stats:', error.message);
//     }
//   }, [companyId]);

//   const fetchRecentOrders = useCallback(async () => {
//     if (!companyId) return;
    
//     try {
//       const response = await fetch(`/api/orders?limit=5&sortBy=createdAt&sortOrder=desc&companyId=${companyId}`);
//       const data = await response.json();
      
//       if (data.success && Array.isArray(data.data)) {
//         setRecentOrders(data.data);
//       } else {
//         setRecentOrders([]);
//       }
//     } catch (error) {
//       console.log('Failed to fetch recent orders:', error.message);
//       setRecentOrders([]);
//     }
//   }, [companyId]);

//   const fetchActivityLog = useCallback(async () => {
//     if (!companyId) return;
    
//     try {
//       const response = await fetch(`/api/whatsapp/activity?limit=8&companyId=${companyId}`);
      
//       if (response.status === 404) {
//         console.log('Activity log endpoint not available - using local log only');
//         return;
//       }
      
//       const data = await response.json();
      
//       let processedActivities = [];
      
//       if (data && data.success && Array.isArray(data.activities)) {
//         processedActivities = data.activities.filter(activity => {
//           if (activity && typeof activity === 'object') {
//             if (activity.companyId && activity.status && activity.exists !== undefined) {
//               return false;
//             }
//             return true;
//           }
//           return false;
//         });
        
//         setActivityLog(prev => {
//           const combined = [...processedActivities, ...prev];
//           const unique = combined.filter((item, index, self) => 
//             index === self.findIndex(t => t.id === item.id)
//           );
//           return unique.slice(0, 8);
//         });
//       } 
//       else if (data && Array.isArray(data)) {
//         processedActivities = data.filter(activity => {
//           if (activity && typeof activity === 'object') {
//             if (activity.companyId && activity.status && activity.exists !== undefined) {
//               return false;
//             }
//             return true;
//           }
//           return false;
//         });
        
//         setActivityLog(prev => {
//           const combined = [...processedActivities, ...prev];
//           const unique = combined.filter((item, index, self) => 
//             index === self.findIndex(t => t.id === item.id)
//           );
//           return unique.slice(0, 8);
//         });
//       }
//     } catch (error) {
//       console.log('Activity log fetch error:', error.message);
//     }
//   }, [companyId]);

//   // ========== SOCKET.IO INITIALIZATION ==========
//   const initializeSocketIO = useCallback(() => {
//     if (!companyId || !session?.user) return;

//     try {
//       // Get Socket.IO client instance
//       const socketClient = getSocketIOClient();
//       socketClientRef.current = socketClient;

//       // Add state listener
//       socketClient.addStateListener((newState, oldState) => {
//         console.log(`📡 Socket state: ${oldState} → ${newState}`);
//         setSocketStatus(newState);
//       });

//       // Add connection listener
//       socketClient.addConnectionListener((connected, info) => {
//         console.log(`📡 Socket connected: ${connected}`, info);
//         if (connected) {
//           addToActivityLog('Real-time notifications connected', 'success');
//         }
//       });

//       // Listen for authentication events
//       socketClient.on('authenticated', (data) => {
//         console.log('✅ Socket authenticated:', data);
//         setSocketAuthenticated(true);
//         addToActivityLog('Real-time notifications authenticated', 'success');
//       });

//       socketClient.on('unauthorized', (data) => {
//         console.error('❌ Socket unauthorized:', data);
//         setSocketAuthenticated(false);
//         setConnectionError('Notification service authentication failed');
//       });

//       // ===== NOTIFICATION HANDLERS =====
      
//       // Handle new orders
//       socketClient.on('NEW_ORDER', (data) => {
//         console.log('📦 New order via Socket.IO:', data);
        
//         // Update activity log
//         addToActivityLog(
//           `New order: ${data.order?.orderNumber || 'Unknown'}`,
//           'success'
//         );
        
//         // Refresh data
//         fetchRecentOrders();
//         fetchStats();
        
//         // Show browser notification if supported
//         if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
//           new Notification('🛍️ New Order', {
//             body: `Order #${data.order?.orderNumber} from ${data.order?.customerName || 'Customer'}`,
//             icon: '/favicon.ico'
//           });
//         }
//       });

//       // Handle payment received
//       socketClient.on('PAYMENT_RECEIVED', (data) => {
//         console.log('💰 Payment via Socket.IO:', data);
//         addToActivityLog(
//           `Payment received: ₹${data.amount} for order #${data.orderNumber}`,
//           'success'
//         );
//         fetchStats();
//       });

//       // Handle order status changes
//       socketClient.on('ORDER_STATUS_CHANGED', (data) => {
//         console.log('📦 Order status changed via Socket.IO:', data);
//         addToActivityLog(
//           `Order #${data.orderNumber} is now ${data.newStatus}`,
//           'info'
//         );
//         fetchRecentOrders();
//       });

//       // Handle low stock alerts
//       socketClient.on('LOW_STOCK_ALERT', (data) => {
//         console.log('⚠️ Low stock alert via Socket.IO:', data);
//         addToActivityLog(
//           `Low stock: ${data.product?.productName} (${data.product?.stock} left)`,
//           'warning'
//         );
//       });

//       // Handle dashboard updates
//       socketClient.on('DASHBOARD_UPDATE', (data) => {
//         console.log('📊 Dashboard update via Socket.IO:', data);
//         if (data.type === 'order-created') {
//           fetchRecentOrders();
//           fetchStats();
//         }
//       });

//       // Connect with user context
//       socketClient.connect({
//         id: session.user.id,
//         role: session.user.role,
//         name: session.user.name || session.user.email,
//         companyId: companyId,
//         email: session.user.email,
//         autoReconnect: true
//       });

//       console.log('📡 Socket.IO client initialized and connecting');

//     } catch (error) {
//       console.error('❌ Socket.IO initialization error:', error);
//       setConnectionError('Failed to initialize notification service');
//     }
//   }, [companyId, session, addToActivityLog, fetchRecentOrders, fetchStats]);

//   // ========== WEBSOCKET CONNECTION (for QR codes) ==========
//  // ========== WEBSOCKET CONNECTION (for QR codes) ==========
// const connectWebSocket = useCallback(() => {
//   if (!companyId) return;

//   // ✅ CRITICAL: Don't reconnect if already connected or connecting
//   if (wsRef.current && 
//       (wsRef.current.readyState === WebSocket.CONNECTING || 
//        wsRef.current.readyState === WebSocket.OPEN)) {
//     console.log('⚠️ WebSocket already connected or connecting, skipping...');
//     return;
//   }

//   // Only close if it's in a bad state
//   if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSING) {
//     try {
//       wsRef.current.close();
//     } catch (error) {
//       console.log('Error closing WebSocket:', error.message);
//     }
//     wsRef.current = null;
//   }
  
//   // Clear any existing reconnect timer
//   if (reconnectTimerRef.current) {
//     clearTimeout(reconnectTimerRef.current);
//     reconnectTimerRef.current = null;
//   }

//   setConnectionError(null);
  
//   try {
//     // IMPORTANT: baseWsUrl should be JUST the base URL (e.g., ws://localhost:3001)
//     // NOT including /ws/qr - that's added below
//     const baseWsUrl = process.env.NEXT_PUBLIC_QR_WS_URL || 'ws://localhost:3001';
//     const wsUrl = `${baseWsUrl}/ws/qr?companyId=${companyId}`;
    
//     console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
//     wsRef.current = new WebSocket(wsUrl);
    
//     wsRef.current.onopen = () => {
//       console.log('✅ WebSocket connected - WILL STAY CONNECTED');
//       setConnectionStatus('connected');
//       setStatusMessage('WhatsApp is connected and ready');
//       setConnectionError(null);
      
//       // Clear any pending reconnect timer
//       if (reconnectTimerRef.current) {
//         clearTimeout(reconnectTimerRef.current);
//         reconnectTimerRef.current = null;
//       }
      
//       setTimeout(() => {
//         if (wsRef.current?.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({ type: 'get_status' }));
//           wsRef.current.send(JSON.stringify({ type: 'get_stats' }));
//         }
//       }, 1000);
//     };
    
//     wsRef.current.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         if (data.companyId && data.companyId !== companyId) return;
        
//         switch (data.type) {
//           case 'qr':
//           case 'qr_update':
//             if (data.qr) {
//               setQrCode(data.qr);
//               setConnectionStatus('qr_required');
//               setStatusMessage('Scan QR code with WhatsApp to connect');
//             }
//             break;
            
//           case 'status':
//           case 'status_update':
//             if (data.status) setConnectionStatus(safeString(data.status, 'disconnected'));
//             if (data.message) setStatusMessage(safeString(data.message, 'WhatsApp service'));
//             if (data.qr) setQrCode(data.qr);
//             if (data.connected !== undefined) {
//               setConnectionStatus(data.connected ? 'connected' : 'disconnected');
//             }
//             break;
            
//           case 'stats':
//           case 'stats_update':
//             if (data.stats && typeof data.stats === 'object' && !Array.isArray(data.stats)) {
//               setStats(prev => ({
//                 ...prev,
//                 ...data.stats,
//                 lastUpdated: new Date().toISOString()
//               }));
//             }
//             break;
            
//           case 'bot_connected':
//             setConnectionStatus('connected');
//             setStatusMessage('WhatsApp is connected and ready');
//             setQrCode(null);
//             addToActivityLog('WhatsApp connected successfully', 'success');
//             break;
            
//           case 'bot_disconnected':
//             setConnectionStatus('disconnected');
//             setStatusMessage(`Disconnected: ${safeString(data.reason, 'Unknown reason')}`);
//             addToActivityLog(`Disconnected: ${safeString(data.reason, 'Unknown reason')}`, 'warning');
//             break;
            
//           case 'bot_info':
//             if (data.botInfo && typeof data.botInfo === 'object' && !Array.isArray(data.botInfo)) {
//               setBotInfo({
//                 pushname: safeString(data.botInfo.pushname, ''),
//                 platform: safeString(data.botInfo.platform, 'WhatsApp Business'),
//                 version: safeString(data.botInfo.version, '2.24.12'),
//                 phoneNumber: safeString(data.botInfo.phoneNumber, 'Not available'),
//                 connectedSince: data.botInfo.connectedSince || null,
//                 lastActive: data.botInfo.lastActive || null
//               });
//             }
//             break;
            
//           case 'NEW_ORDER':
//             addToActivityLog(`New order received: ${data.order?.orderNumber || 'ORD-' + Date.now()}`, 'success');
//             fetchRecentOrders();
//             fetchStats();
//             break;
            
//           case 'PAYMENT_RECEIVED':
//             addToActivityLog(`Payment received for order #${safeString(data.orderNumber, 'unknown')}`, 'success');
//             fetchStats();
//             break;
            
//           case 'ORDER_STATUS_CHANGED':
//             addToActivityLog(`Order #${safeString(data.orderNumber, 'unknown')} status changed to ${safeString(data.newStatus, 'updated')}`, 'info');
//             fetchRecentOrders();
//             break;
            
//           case 'activity':
//           case 'activity_update':
//             if (Array.isArray(data.activities)) {
//               const validActivities = data.activities.filter(act => {
//                 if (act && typeof act === 'object' && act.companyId && act.status && act.exists !== undefined) {
//                   return false;
//                 }
//                 return true;
//               });
//               setActivityLog(prev => {
//                 const combined = [...validActivities, ...prev];
//                 const unique = combined.filter((item, index, self) => 
//                   index === self.findIndex(t => t.id === item.id)
//                 );
//                 return unique.slice(0, 8);
//               });
//             } else if (data.activity) {
//               addToActivityLog(
//                 safeString(data.activity.message, 'Activity recorded'),
//                 safeString(data.activity.type, 'info')
//               );
//             }
//             break;
            
//           case 'pong':
//             // Heartbeat response - connection is healthy
//             console.log('📥 Received pong - connection healthy');
//             break;
//         }
//       } catch (error) {
//         console.log('Error parsing WebSocket message:', error.message);
//       }
//     };
    
//     wsRef.current.onclose = (event) => {
//       console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
      
//       // Only reconnect if it wasn't a normal closure (1000) 
//       // AND we're not already trying to reconnect
//       if (event.code !== 1000 && !reconnectTimerRef.current) {
//         setConnectionError('Connection lost. Reconnecting...');
        
//         // Exponential backoff: 5s, 10s, 20s, 30s max
//         const delay = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 30000);
//         reconnectAttempts++;
        
//         console.log(`🔄 Will attempt to reconnect in ${delay/1000}s (attempt ${reconnectAttempts})`);
        
//         reconnectTimerRef.current = setTimeout(() => {
//           reconnectTimerRef.current = null;
//           connectWebSocket();
//         }, delay);
//       }
//     };
    
//     wsRef.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setConnectionError('Failed to connect to WhatsApp service');
//     };
    
//   } catch (error) {
//     console.error('WebSocket setup error:', error);
//     setConnectionError('Failed to initialize connection');
//     fetchBotStatus();
    
//     // Exponential backoff for setup errors
//     const delay = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 30000);
//     reconnectAttempts++;
    
//     reconnectTimerRef.current = setTimeout(() => {
//       reconnectTimerRef.current = null;
//       connectWebSocket();
//     }, delay);
//   }
// }, [companyId, fetchBotStatus, addToActivityLog, fetchRecentOrders, fetchStats]);

//   // ========== WEBSOCKET PING INTERVAL - KEEPS CONNECTION ALIVE ==========
//   useEffect(() => {
//     if (!wsRef.current) return;
    
//     // Send ping every 25 seconds to keep connection alive
//     const pingInterval = setInterval(() => {
//       if (wsRef.current?.readyState === WebSocket.OPEN) {
//         wsRef.current.send(JSON.stringify({ type: 'ping' }));
//         console.log('📤 Sent ping to keep WebSocket alive');
//       }
//     }, 25000);
    
//     return () => clearInterval(pingInterval);
//   }, [wsRef.current]);

//   // ========== BOT CONTROL FUNCTIONS ==========
//   const handleBotAction = async (action, confirmMessage = null) => {
//     if (!companyId) {
//       alert('Company ID not found');
//       return;
//     }
    
//     if (confirmMessage && !window.confirm(confirmMessage)) return;
    
//     setIsLoading(true);
//     setConnectionError(null);
    
//     try {
//       const response = await fetch('/api/whatsapp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           action,
//           companyId 
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         await fetchBotStatus();
//         await fetchStats();
        
//         if (action === 'connect') {
//           setStatusMessage('WhatsApp connected successfully');
//           addToActivityLog('WhatsApp connected', 'success');
//         } else if (action === 'disconnect') {
//           setStatusMessage('WhatsApp disconnected');
//           addToActivityLog('WhatsApp disconnected', 'warning');
//         } else if (action === 'restart') {
//           setStatusMessage('WhatsApp service restarted');
//           addToActivityLog('WhatsApp restarted', 'info');
//         } else if (action === 'logout') {
//           setStatusMessage('Logged out successfully');
//           addToActivityLog('Logged out', 'warning');
//           setTimeout(() => {
//             if (wsRef.current?.readyState === WebSocket.OPEN) {
//               wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
//             }
//           }, 2000);
//         } else if (action === 'refresh-qr') {
//           setStatusMessage('Generating new QR code...');
//           addToActivityLog('Requested new QR code', 'info');
//         }
//       } else {
//         setConnectionError(data.error || 'Action failed');
//       }
//     } catch (error) {
//       console.error(`Action ${action} failed:`, error);
//       setConnectionError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const requestQRCode = useCallback(() => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
//     } else {
//       handleBotAction('refresh-qr');
//     }
//   }, [handleBotAction]);

//   const sendTestMessage = async () => {
//     if (!companyId) return;
    
//     const phoneNumber = prompt('Enter phone number (with country code):');
//     if (!phoneNumber) return;
    
//     const message = prompt('Enter message:');
//     if (!message) return;
    
//     setIsLoading(true);
    
//     try {
//       const response = await fetch('/api/whatsapp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           action: 'send_message',
//           companyId,
//           to: phoneNumber,
//           message
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         addToActivityLog(`Message sent to ${phoneNumber}`, 'success');
//       } else {
//         setConnectionError(data.error || 'Failed to send message');
//       }
//     } catch (error) {
//       console.error('Send message error:', error);
//       setConnectionError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ========== REQUEST NOTIFICATION PERMISSION ==========
//   const requestNotificationPermission = useCallback(() => {
//     if (typeof window !== 'undefined' && 'Notification' in window) {
//       if (Notification.permission === 'default') {
//         Notification.requestPermission().then(permission => {
//           if (permission === 'granted') {
//             addToActivityLog('Browser notifications enabled', 'success');
//           }
//         });
//       }
//     }
//   }, [addToActivityLog]);

//   // ========== INITIALIZATION ==========
//   useEffect(() => {
//     if (companyId && session?.user) {
//       // Initialize WebSocket for QR
//       connectWebSocket();
      
//       // Initialize Socket.IO for notifications
//       initializeSocketIO();
      
//       // Fetch initial data
//       fetchBotStatus();
//       fetchStats();
//       fetchRecentOrders();
//       fetchActivityLog();
      
//       // Request notification permission
//       requestNotificationPermission();
//     }
    
//     return () => {
//       if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
//       if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      
//       // DON'T close WebSocket on unmount - let it reconnect naturally
//       // Just clear timers
      
//       // Disconnect Socket.IO
//       if (socketClientRef.current) {
//         socketClientRef.current.disconnect('Component unmount');
//       }
//     };
//   }, [companyId, session, connectWebSocket, initializeSocketIO, fetchBotStatus, fetchStats, fetchRecentOrders, fetchActivityLog, requestNotificationPermission]);

//   // ========== PERIODIC REFRESH ==========
//   useEffect(() => {
//     if (!companyId) return;

//     const interval = setInterval(() => {
//       fetchStats();
//       fetchRecentOrders();
//       fetchActivityLog();
//     }, 30000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [companyId, fetchStats, fetchRecentOrders, fetchActivityLog]);

//   // ========== UTILITY FUNCTIONS ==========
//   const formatCurrency = (amount) => {
//     if (amount === undefined || amount === null) return '₹0';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatNumber = (num) => {
//     if (num === undefined || num === null) return '0';
//     return new Intl.NumberFormat('en-IN').format(num);
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMins = Math.floor((now - date) / 60000);
      
//       if (diffMins < 1) return 'Just now';
//       if (diffMins < 60) return `${diffMins}m ago`;
//       if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
//       return date.toLocaleDateString();
//     } catch {
//       return 'N/A';
//     }
//   };

//   // ========== SAFE ACTIVITY LOG RENDERER ==========
//   const renderActivityLog = () => {
//     if (!Array.isArray(activityLog) || activityLog.length === 0) {
//       return (
//         <div className="empty-state">
//           <Activity size={isMobile ? 32 : 40} />
//           <p>No recent activity</p>
//         </div>
//       );
//     }

//     return activityLog
//       .filter(log => {
//         if (log && typeof log === 'object') {
//           if (log.companyId && log.status && log.exists !== undefined) {
//             return false;
//           }
//           return true;
//         }
//         return false;
//       })
//       .map((log, index) => {
//         if (!log || typeof log !== 'object') return null;

//         const message = safeString(log.message, log.text || log.content || 'Activity recorded');
//         const type = safeString(log.type, log.level || 'info');
//         const timestamp = safeString(log.timestamp, log.time || log.date || new Date().toLocaleTimeString());
//         const id = log.id || `activity-${index}-${Date.now()}`;

//         return (
//           <div key={id} className={`activity-item type-${type}`}>
//             <p>{message}</p>
//             <span className="activity-time">{timestamp}</span>
//           </div>
//         );
//       });
//   };

//   // ========== LOADING STATE ==========
//   if (sessionStatus === 'loading' || !companyId) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner">
//           <RefreshCw size={48} className="spin" />
//           <p>Loading company details...</p>
//         </div>
//       </div>
//     );
//   }

//   // ========== STATUS CONFIG ==========
//   const getStatusConfig = () => {
//     const status = safeString(connectionStatus, 'disconnected');
//     switch (status) {
//       case 'connected':
//         return { color: '#10b981', text: 'Connected', icon: 'wifi' };
//       case 'qr_required':
//         return { color: '#f59e0b', text: 'QR Required', icon: 'smartphone' };
//       case 'loading':
//         return { color: '#3b82f6', text: 'Connecting', icon: 'refresh' };
//       case 'disconnected':
//         return { color: '#ef4444', text: 'Disconnected', icon: 'wifi-off' };
//       default:
//         return { color: '#6b7280', text: status, icon: 'alert' };
//     }
//   };

//   const statusConfig = getStatusConfig();

//   // ========== STAT CARDS ==========
//   const statCards = [
//     {
//       title: 'Total Orders',
//       value: formatNumber(stats.totalOrders),
//       change: stats.ordersGrowth > 0 ? `+${stats.ordersGrowth}%` : `${stats.ordersGrowth}%`,
//       icon: Package,
//       color: '#3b82f6',
//       trend: stats.ordersGrowth > 0 ? 'up' : 'down'
//     },
//     {
//       title: 'Revenue',
//       value: formatCurrency(stats.revenue),
//       change: stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}%` : `${stats.revenueGrowth}%`,
//       icon: DollarSign,
//       color: '#10b981',
//       trend: stats.revenueGrowth > 0 ? 'up' : 'down'
//     },
//     {
//       title: 'Customers',
//       value: formatNumber(stats.totalCustomers),
//       change: stats.customersGrowth > 0 ? `+${stats.customersGrowth}%` : `${stats.customersGrowth}%`,
//       icon: Users,
//       color: '#8b5cf6',
//       trend: stats.customersGrowth > 0 ? 'up' : 'down'
//     },
//     {
//       title: 'Messages',
//       value: formatNumber(stats.totalMessages),
//       change: `${Math.round((stats.totalMessages / (stats.totalCustomers || 1)) * 10) / 10}/cust`,
//       icon: MessageSquare,
//       color: '#f59e0b',
//       trend: 'neutral'
//     },
//     {
//       title: 'Active Chats',
//       value: stats.activeChats,
//       change: stats.activeChats > 0 ? 'Active' : 'Inactive',
//       icon: Activity,
//       color: '#ef4444',
//       trend: stats.activeChats > 0 ? 'up' : 'down'
//     },
//     {
//       title: 'Pending',
//       value: stats.pendingOrders,
//       change: `${Math.round((stats.pendingOrders / (stats.totalOrders || 1)) * 100)}%`,
//       icon: Clock,
//       color: '#f59e0b',
//       trend: 'neutral'
//     }
//   ];

//   return (
//     <div className={`dashboard-container ${isMobile ? 'mobile' : ''}`}>
//       {/* Page Header */}
//       <div className="dashboard-header">
//         <div>
//           <div className="title-wrapper">
//             <div className="title-bar"></div>
//             <h1>WhatsApp Dashboard</h1>
//           </div>
//           <div className="company-info">
//             <Building2 size={16} />
//             <span>{safeString(companyName, 'Your Company')}</span>
//           </div>
//           <p className="subtitle">Real-time WhatsApp business monitoring</p>
//         </div>

//         {/* Status Badges */}
//         <div className="status-wrapper">
//           {/* Socket.IO status indicator */}
//           <div className={`socket-badge ${socketAuthenticated ? 'connected' : socketStatus === 'connected' ? 'connecting' : 'disconnected'}`}>
//             <Radio size={isMobile ? 12 : 14} />
//             <span>{socketAuthenticated ? 'Live' : socketStatus === 'connected' ? 'Connecting' : 'Offline'}</span>
//           </div>
          
//           {connectionError && (
//             <div className="error-badge">
//               <AlertCircle size={isMobile ? 12 : 14} />
//               <span>{safeString(connectionError, 'Error')}</span>
//             </div>
//           )}
//           <div className={`status-badge status-${safeString(connectionStatus, 'disconnected')}`}>
//             <span className="status-dot"></span>
//             <span>{safeString(statusConfig?.text, 'Unknown')}</span>
//           </div>
//           <div className="time-badge">
//             <Clock size={isMobile ? 12 : 14} />
//             <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="stats-grid">
//         {statCards.map((stat, i) => {
//           const Icon = stat.icon;
//           return (
//             <div key={i} className="stat-card">
//               <div className="stat-header">
//                 <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
//                   <Icon size={isMobile ? 14 : 16} color={stat.color} />
//                 </div>
//                 <span className={`stat-change trend-${stat.trend}`}>
//                   {safeString(stat.change, '0%')}
//                 </span>
//               </div>
//               <p className="stat-label">{safeString(stat.title, 'Stat')}</p>
//               <p className="stat-value">{safeString(stat.value, '0')}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Main Grid */}
//       <div className="main-grid">
//         {/* Left Column */}
//         <div className="left-column">
//           {/* Connection Card */}
//           <div className="card">
//             <div className="card-header">
//               <div>
//                 <h2>WhatsApp Connection</h2>
//                 <p className="card-subtitle">{safeString(statusMessage, 'WhatsApp service')}</p>
//               </div>
//               <div className="action-buttons">
//                 <button
//                   onClick={() => handleBotAction('restart')}
//                   disabled={isLoading}
//                   className="action-button restart"
//                 >
//                   <RefreshCw size={isMobile ? 14 : 16} />
//                   {!isMobile && <span>Restart</span>}
//                 </button>
//                 <button
//                   onClick={() => handleBotAction('logout', 'Logout from WhatsApp?')}
//                   disabled={isLoading}
//                   className="action-button logout"
//                 >
//                   <LogOut size={isMobile ? 14 : 16} />
//                   {!isMobile && <span>Logout</span>}
//                 </button>
//                 {connectionStatus === 'connected' ? (
//                   <button
//                     onClick={() => handleBotAction('disconnect')}
//                     disabled={isLoading}
//                     className="action-button disconnect"
//                   >
//                     <Power size={isMobile ? 14 : 16} />
//                     {!isMobile && <span>Disconnect</span>}
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => handleBotAction('connect')}
//                     disabled={isLoading}
//                     className="action-button connect"
//                   >
//                     <Wifi size={isMobile ? 14 : 16} />
//                     {!isMobile && <span>Connect</span>}
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* QR Code Section */}
//             <div className="qr-section">
//               {qrCode ? (
//                 <div className="qr-container">
//                   <button
//                     onClick={() => setShowQRExpanded(!showQRExpanded)}
//                     className="qr-wrapper"
//                   >
//                     <div className={`qr-background ${showQRExpanded ? 'expanded' : ''}`}>
//                       <QRCodeSVG
//                         value={qrCode}
//                         size={showQRExpanded ? (isMobile ? 220 : 280) : (isMobile ? 160 : 200)}
//                         level="H"
//                         includeMargin
//                       />
//                     </div>
//                     <div className="qr-expand-button">
//                       {showQRExpanded ? <Minimize2 size={isMobile ? 14 : 16} /> : <Maximize2 size={isMobile ? 14 : 16} />}
//                     </div>
//                   </button>
//                   <h3>Scan QR Code to Connect</h3>
//                   <div className="qr-steps">
//                     {['Open WhatsApp', 'Tap Menu (⋮)', 'Linked Devices', 'Scan QR Code'].map((step, index) => (
//                       <div key={index} className="qr-step">
//                         <div className="qr-step-number">{index + 1}</div>
//                         <span>{step}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="connected-state">
//                   <div className="connected-icon">
//                     <CheckCircle size={isMobile ? 32 : 40} color="#10b981" />
//                   </div>
//                   <h3>WhatsApp is Connected</h3>
//                   <p>Your WhatsApp business account is active and ready</p>
//                   <div className="bot-info-grid">
//                     <div className="bot-info-item">
//                       <Phone size={isMobile ? 12 : 14} />
//                       <span>{safeString(botInfo.phoneNumber, 'N/A')}</span>
//                     </div>
//                     <div className="bot-info-item">
//                       <User size={isMobile ? 12 : 14} />
//                       <span>{safeString(botInfo.pushname, 'N/A')}</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Bot Info Cards */}
//           <div className="bot-info-cards">
//             <div className="bot-info-card">
//               <Smartphone size={isMobile ? 16 : 18} color="#3b82f6" />
//               <div>
//                 <p className="label">Platform</p>
//                 <p className="value">{safeString(botInfo.platform, 'N/A')}</p>
//               </div>
//             </div>
//             <div className="bot-info-card">
//               <Package size={isMobile ? 16 : 18} color="#8b5cf6" />
//               <div>
//                 <p className="label">Version</p>
//                 <p className="value">{safeString(botInfo.version, 'N/A')}</p>
//               </div>
//             </div>
//             <div className="bot-info-card">
//               <Activity size={isMobile ? 16 : 18} color="#f59e0b" />
//               <div>
//                 <p className="label">Last Active</p>
//                 <p className="value">Just now</p>
//               </div>
//             </div>
//           </div>

//           {/* Recent Orders */}
//           <div className="card">
//             <div className="card-header">
//               <h2>Recent Orders</h2>
//               <button className="view-all-button">View All</button>
//             </div>
//             <div className="orders-list">
//               {recentOrders.length > 0 ? (
//                 recentOrders.map((order, i) => (
//                   <div key={i} className="order-item">
//                     <div className="order-left">
//                       <div className={`order-icon status-${safeString(order.status, 'default')}`}>
//                         <Package size={isMobile ? 14 : 16} />
//                       </div>
//                       <div>
//                         <p className="order-number">{safeString(order.orderNumber, `ORD-${i+1}`)}</p>
//                         <p className="order-customer">{safeString(order.customerName, 'Customer')}</p>
//                       </div>
//                     </div>
//                     <div className="order-right">
//                       <p className="order-amount">₹{order.totalAmount || 0}</p>
//                       <p className="order-time">{formatTime(order.createdAt)}</p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="empty-state">
//                   <Package size={isMobile ? 32 : 40} />
//                   <p>No recent orders</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Column */}
//         <div className="right-column">
//           {/* Quick Actions */}
//           <div className="card">
//             <h2>Quick Actions</h2>
//             <div className="quick-actions-grid">
//               <button
//                 onClick={sendTestMessage}
//                 disabled={connectionStatus !== 'connected' || isLoading}
//                 className="quick-action"
//               >
//                 <Send size={isMobile ? 18 : 20} color="#3b82f6" />
//                 <span>Send Message</span>
//               </button>
//               <button
//                 onClick={requestQRCode}
//                 disabled={isLoading}
//                 className="quick-action"
//               >
//                 <RefreshCw size={isMobile ? 18 : 20} color="#10b981" />
//                 <span>Refresh QR</span>
//               </button>
//               <button
//                 onClick={() => window.open(`/api/whatsapp/export?companyId=${companyId}`, '_blank')}
//                 className="quick-action"
//               >
//                 <Download size={isMobile ? 18 : 20} color="#8b5cf6" />
//                 <span>Export</span>
//               </button>
//               <button
//                 onClick={() => window.location.href = '/admin/analytics'}
//                 className="quick-action"
//               >
//                 <BarChart3 size={isMobile ? 18 : 20} color="#f59e0b" />
//                 <span>Analytics</span>
//               </button>
//             </div>
//           </div>

//           {/* Activity Log */}
//           <div className="card">
//             <h2>Recent Activity</h2>
//             <div className="activity-log">
//               {renderActivityLog()}
//             </div>
//           </div>

//           {/* Test Message Button */}
//           <button
//             onClick={sendTestMessage}
//             disabled={connectionStatus !== 'connected' || isLoading}
//             className="test-message-button"
//           >
//             <Send size={isMobile ? 18 : 20} color="#3b82f6" />
//             <div className="test-message-content">
//               <span className="title">Send Test Message</span>
//               <span className="subtitle">Send to any WhatsApp number</span>
//             </div>
//             <ChevronRight size={isMobile ? 18 : 20} />
//           </button>
//         </div>
//       </div>

//       {/* Loading Overlay */}
//       {isLoading && (
//         <div className="loading-overlay">
//           <div className="loading-spinner">
//             <RefreshCw size={isMobile ? 24 : 32} className="spin" />
//             <p>Processing...</p>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         /* ========== GLOBAL STYLES ========== */
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.1); }
//           100% { opacity: 1; transform: scale(1); }
//         }
//         .spin {
//           animation: spin 1s linear infinite;
//         }

//         /* ========== LOADING STATES ========== */
//         .loading-container {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           min-height: 100vh;
//           background-color: #f9fafb;
//         }
//         .loading-spinner {
//           background-color: #ffffff;
//           padding: 32px;
//           border-radius: 16px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 16px;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
//         }
//         .loading-spinner p {
//           font-size: 16px;
//           color: #1e293b;
//           font-weight: 500;
//           margin: 0;
//         }

//         /* ========== DASHBOARD CONTAINER ========== */
//         .dashboard-container {
//           padding: 24px;
//           background-color: transparent;
//           min-height: 100vh;
//           width: 100%;
//         }
//         .dashboard-container.mobile {
//           padding: 16px;
//         }

//         /* ========== HEADER ========== */
//         .dashboard-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//         }
//         .dashboard-container.mobile .dashboard-header {
//           flex-direction: column;
//           align-items: flex-start;
//           gap: 12px;
//           margin-bottom: 20px;
//         }
//         .title-wrapper {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           margin-bottom: 4px;
//         }
//         .dashboard-container.mobile .title-wrapper {
//           gap: 10px;
//         }
//         .title-bar {
//           width: 4px;
//           height: 28px;
//           background: linear-gradient(135deg, #3b82f6, #8b5cf6);
//           border-radius: 2px;
//         }
//         .dashboard-container.mobile .title-bar {
//           width: 3px;
//           height: 24px;
//         }
//         .title-wrapper h1 {
//           color: #1e293b;
//           font-weight: 700;
//           font-size: 1.75rem;
//           margin: 0;
//           line-height: 1.2;
//         }
//         .dashboard-container.mobile .title-wrapper h1 {
//           font-size: 1.4rem;
//         }
//         .company-info {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           margin-left: 15px;
//           margin-top: 2px;
//         }
//         .company-info span {
//           font-size: 13px;
//           color: #6b7280;
//           font-weight: 500;
//         }
//         .subtitle {
//           color: #64748b;
//           margin: 4px 0 0 15px;
//           font-size: 0.95rem;
//           font-weight: 500;
//         }
//         .dashboard-container.mobile .subtitle {
//           font-size: 0.85rem;
//         }

//         /* ========== STATUS BADGES ========== */
//         .status-wrapper {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           flex-wrap: wrap;
//         }
//         .dashboard-container.mobile .status-wrapper {
//           gap: 8px;
//         }
        
//         .socket-badge {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           padding: 6px 10px;
//           border-radius: 20px;
//           font-size: 12px;
//           background-color: #f8fafc;
//           border: 1px solid #e2e8f0;
//         }
//         .socket-badge.connected {
//           background-color: #10b98110;
//           border-color: #10b98130;
//           color: #10b981;
//         }
//         .socket-badge.connecting {
//           background-color: #f59e0b10;
//           border-color: #f59e0b30;
//           color: #f59e0b;
//         }
//         .socket-badge.disconnected {
//           background-color: #ef444410;
//           border-color: #ef444430;
//           color: #ef4444;
//         }
        
//         .error-badge {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           padding: 6px 10px;
//           background-color: #ef444410;
//           border: 1px solid #ef444430;
//           border-radius: 20px;
//         }
//         .dashboard-container.mobile .error-badge {
//           padding: 4px 8px;
//         }
//         .error-badge span {
//           color: #ef4444;
//           font-size: 13px;
//         }
//         .dashboard-container.mobile .error-badge span {
//           font-size: 12px;
//         }
//         .status-badge {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 8px 12px;
//           border-radius: 20px;
//           border: 1px solid;
//           background-color: #ffffff;
//         }
//         .dashboard-container.mobile .status-badge {
//           gap: 6px;
//           padding: 6px 10px;
//         }
//         .status-badge.status-connected {
//           border-color: #10b98140;
//           background-color: #10b98120;
//         }
//         .status-badge.status-qr_required {
//           border-color: #f59e0b40;
//           background-color: #f59e0b20;
//         }
//         .status-badge.status-loading {
//           border-color: #3b82f640;
//           background-color: #3b82f620;
//         }
//         .status-badge.status-disconnected {
//           border-color: #ef444440;
//           background-color: #ef444420;
//         }
//         .status-dot {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background-color: currentColor;
//         }
//         .status-connected .status-dot {
//           background-color: #10b981;
//           animation: pulse 2s infinite;
//         }
//         .status-qr_required .status-dot {
//           background-color: #f59e0b;
//         }
//         .status-loading .status-dot {
//           background-color: #3b82f6;
//         }
//         .status-disconnected .status-dot {
//           background-color: #ef4444;
//         }
//         .time-badge {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           padding: 8px 12px;
//           background-color: #ffffff;
//           border-radius: 20px;
//           border: 1px solid #e2e8f040;
//         }
//         .dashboard-container.mobile .time-badge {
//           padding: 6px 10px;
//         }
//         .time-badge span {
//           font-size: 13px;
//           color: #6b7280;
//         }
//         .dashboard-container.mobile .time-badge span {
//           font-size: 12px;
//         }

//         /* ========== STATS GRID ========== */
//         .stats-grid {
//           display: grid;
//           grid-template-columns: repeat(6, 1fr);
//           gap: 12px;
//           margin-bottom: 24px;
//         }
//         .dashboard-container.mobile .stats-grid {
//           grid-template-columns: repeat(2, 1fr);
//           gap: 10px;
//           margin-bottom: 20px;
//         }
//         .stat-card {
//           background-color: #ffffff;
//           padding: 14px;
//           border-radius: 12px;
//           border: 1px solid #e2e8f030;
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
//         }
//         .dashboard-container.mobile .stat-card {
//           padding: 12px;
//           border-radius: 10px;
//         }
//         .stat-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 8px;
//         }
//         .stat-icon {
//           padding: 8px;
//           border-radius: 8px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .dashboard-container.mobile .stat-icon {
//           padding: 6px;
//         }
//         .stat-change {
//           font-size: 11px;
//           font-weight: 600;
//         }
//         .dashboard-container.mobile .stat-change {
//           font-size: 10px;
//         }
//         .stat-change.trend-up {
//           color: #10b981;
//         }
//         .stat-change.trend-down {
//           color: #ef4444;
//         }
//         .stat-change.trend-neutral {
//           color: #6b7280;
//         }
//         .stat-label {
//           font-size: 12px;
//           color: #64748b;
//           margin: 0 0 2px 0;
//         }
//         .dashboard-container.mobile .stat-label {
//           font-size: 11px;
//         }
//         .stat-value {
//           font-size: 16px;
//           font-weight: 700;
//           color: #1e293b;
//           margin: 0;
//         }
//         .dashboard-container.mobile .stat-value {
//           font-size: 14px;
//         }

//         /* ========== MAIN GRID ========== */
//         .main-grid {
//           display: grid;
//           grid-template-columns: 2fr 1fr;
//           gap: 20px;
//         }
//         .dashboard-container.mobile .main-grid {
//           grid-template-columns: 1fr;
//           gap: 16px;
//         }
//         .left-column, .right-column {
//           display: flex;
//           flex-direction: column;
//           gap: 20px;
//         }
//         .dashboard-container.mobile .left-column,
//         .dashboard-container.mobile .right-column {
//           gap: 16px;
//         }

//         /* ========== CARDS ========== */
//         .card {
//           background-color: #ffffff;
//           border-radius: 16px;
//           border: 1px solid #e2e8f030;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
//           overflow: hidden;
//         }
//         .dashboard-container.mobile .card {
//           border-radius: 14px;
//         }
//         .card-header {
//           padding: 20px;
//           border-bottom: 1px solid #e2e8f030;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//         }
//         .dashboard-container.mobile .card-header {
//           padding: 16px;
//           flex-direction: column;
//           align-items: flex-start;
//           gap: 12px;
//         }
//         .card-header h2 {
//           font-size: 18px;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0;
//         }
//         .dashboard-container.mobile .card-header h2 {
//           font-size: 16px;
//         }
//         .card-subtitle {
//           font-size: 13px;
//           color: #64748b;
//           margin: 4px 0 0 0;
//         }
//         .dashboard-container.mobile .card-subtitle {
//           font-size: 12px;
//         }

//         /* ========== ACTION BUTTONS ========== */
//         .action-buttons {
//           display: flex;
//           gap: 8px;
//           flex-wrap: wrap;
//         }
//         .dashboard-container.mobile .action-buttons {
//           gap: 6px;
//         }
//         .action-button {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 14px;
//           border-radius: 8px;
//           font-size: 13px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           border: 1px solid;
//         }
//         .dashboard-container.mobile .action-button {
//           gap: 4px;
//           padding: 8px 12px;
//           font-size: 12px;
//         }
//         .action-button:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }
//         .action-button.restart {
//           background-color: #3b82f615;
//           border-color: #3b82f630;
//           color: #3b82f6;
//         }
//         .action-button.logout {
//           background-color: #f59e0b15;
//           border-color: #f59e0b30;
//           color: #f59e0b;
//         }
//         .action-button.disconnect {
//           background-color: #ef444415;
//           border-color: #ef444430;
//           color: #ef4444;
//         }
//         .action-button.connect {
//           background-color: #10b98115;
//           border-color: #10b98130;
//           color: #10b981;
//         }

//         /* ========== QR SECTION ========== */
//         .qr-section {
//           padding: 24px;
//         }
//         .dashboard-container.mobile .qr-section {
//           padding: 16px;
//         }
//         .qr-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         }
//         .qr-wrapper {
//           position: relative;
//           margin-bottom: 20px;
//           cursor: pointer;
//           background: none;
//           border: none;
//         }
//         .dashboard-container.mobile .qr-wrapper {
//           margin-bottom: 16px;
//         }
//         .qr-background {
//           background-color: #ffffff;
//           padding: 16px;
//           border-radius: 16px;
//           border: 2px dashed #3b82f640;
//           box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
//         }
//         .dashboard-container.mobile .qr-background {
//           padding: 12px;
//           border-radius: 14px;
//         }
//         .qr-background.expanded {
//           padding: 20px;
//         }
//         .qr-expand-button {
//           position: absolute;
//           top: -8px;
//           right: -8px;
//           width: 32px;
//           height: 32px;
//           background-color: #3b82f6;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #ffffff;
//           box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
//         }
//         .dashboard-container.mobile .qr-expand-button {
//           width: 28px;
//           height: 28px;
//         }
//         .qr-container h3 {
//           font-size: 18px;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0 0 16px 0;
//         }
//         .dashboard-container.mobile .qr-container h3 {
//           font-size: 16px;
//           margin-bottom: 12px;
//         }
//         .qr-steps {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 8px;
//           width: 100%;
//           max-width: 400px;
//         }
//         .dashboard-container.mobile .qr-steps {
//           gap: 6px;
//         }
//         .qr-step {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 4px;
//         }
//         .qr-step-number {
//           width: 24px;
//           height: 24px;
//           background-color: #3b82f615;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 12px;
//           font-weight: 600;
//           color: #3b82f6;
//         }
//         .dashboard-container.mobile .qr-step-number {
//           width: 22px;
//           height: 22px;
//           font-size: 11px;
//         }
//         .qr-step span {
//           font-size: 10px;
//           color: #64748b;
//           text-align: center;
//         }
//         .dashboard-container.mobile .qr-step span {
//           font-size: 9px;
//         }

//         /* ========== CONNECTED STATE ========== */
//         .connected-state {
//           text-align: center;
//           padding: 24px;
//         }
//         .dashboard-container.mobile .connected-state {
//           padding: 16px;
//         }
//         .connected-icon {
//           margin-bottom: 16px;
//         }
//         .dashboard-container.mobile .connected-icon {
//           margin-bottom: 12px;
//         }
//         .connected-state h3 {
//           font-size: 20px;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0 0 8px 0;
//         }
//         .dashboard-container.mobile .connected-state h3 {
//           font-size: 18px;
//         }
//         .connected-state p {
//           font-size: 14px;
//           color: #64748b;
//           margin: 0 0 20px 0;
//         }
//         .dashboard-container.mobile .connected-state p {
//           font-size: 13px;
//           margin-bottom: 16px;
//         }
//         .bot-info-grid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 12px;
//           max-width: 300px;
//           margin: 0 auto;
//         }
//         .dashboard-container.mobile .bot-info-grid {
//           gap: 8px;
//         }
//         .bot-info-item {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           background-color: #f8fafc;
//           padding: 10px;
//           border-radius: 8px;
//         }
//         .dashboard-container.mobile .bot-info-item {
//           padding: 8px;
//         }
//         .bot-info-item span {
//           font-size: 13px;
//           color: #1e293b;
//           font-weight: 500;
//         }
//         .dashboard-container.mobile .bot-info-item span {
//           font-size: 12px;
//         }

//         /* ========== BOT INFO CARDS ========== */
//         .bot-info-cards {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 12px;
//         }
//         .dashboard-container.mobile .bot-info-cards {
//           gap: 10px;
//         }
//         .bot-info-card {
//           background-color: #ffffff;
//           padding: 14px;
//           border-radius: 12px;
//           border: 1px solid #e2e8f030;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//         }
//         .dashboard-container.mobile .bot-info-card {
//           padding: 12px;
//           border-radius: 10px;
//           gap: 8px;
//         }
//         .bot-info-card .label {
//           font-size: 11px;
//           color: #64748b;
//           margin: 0 0 2px 0;
//         }
//         .dashboard-container.mobile .bot-info-card .label {
//           font-size: 10px;
//         }
//         .bot-info-card .value {
//           font-size: 14px;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0;
//         }
//         .dashboard-container.mobile .bot-info-card .value {
//           font-size: 13px;
//         }

//         /* ========== ORDERS LIST ========== */
//         .view-all-button {
//           background: none;
//           border: none;
//           color: #3b82f6;
//           font-size: 13px;
//           font-weight: 500;
//           cursor: pointer;
//           padding: 6px 10px;
//           border-radius: 6px;
//         }
//         .dashboard-container.mobile .view-all-button {
//           font-size: 12px;
//           padding: 6px 8px;
//         }
//         .orders-list {
//           padding: 4px 0;
//         }
//         .order-item {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 14px 20px;
//           border-bottom: 1px solid #e2e8f020;
//           transition: background-color 0.2s ease;
//           cursor: pointer;
//         }
//         .order-item:hover {
//           background-color: #f8fafc;
//         }
//         .dashboard-container.mobile .order-item {
//           padding: 12px 16px;
//         }
//         .order-left {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }
//         .order-icon {
//           width: 40px;
//           height: 40px;
//           border-radius: 10px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .dashboard-container.mobile .order-icon {
//           width: 36px;
//           height: 36px;
//         }
//         .order-icon.status-completed {
//           background-color: #10b98120;
//         }
//         .order-icon.status-pending {
//           background-color: #f59e0b20;
//         }
//         .order-icon.status-processing {
//           background-color: #3b82f620;
//         }
//         .order-icon.status-default {
//           background-color: #6b728020;
//         }
//         .order-number {
//           font-size: 15px;
//           font-weight: 500;
//           color: #1e293b;
//           margin: 0 0 2px 0;
//         }
//         .dashboard-container.mobile .order-number {
//           font-size: 14px;
//         }
//         .order-customer {
//           font-size: 12px;
//           color: #64748b;
//           margin: 0;
//         }
//         .dashboard-container.mobile .order-customer {
//           font-size: 11px;
//         }
//         .order-right {
//           text-align: right;
//         }
//         .order-amount {
//           font-size: 15px;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0 0 2px 0;
//         }
//         .dashboard-container.mobile .order-amount {
//           font-size: 14px;
//         }
//         .order-time {
//           font-size: 11px;
//           color: #64748b;
//           margin: 0;
//         }
//         .dashboard-container.mobile .order-time {
//           font-size: 10px;
//         }

//         /* ========== EMPTY STATE ========== */
//         .empty-state {
//           padding: 40px 24px;
//           text-align: center;
//         }
//         .dashboard-container.mobile .empty-state {
//           padding: 32px 16px;
//         }
//         .empty-state svg {
//           color: #d1d5db;
//         }
//         .empty-state p {
//           font-size: 14px;
//           color: #64748b;
//           margin: 12px 0 0 0;
//         }
//         .dashboard-container.mobile .empty-state p {
//           font-size: 13px;
//         }

//         /* ========== QUICK ACTIONS ========== */
//         .quick-actions-grid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 10px;
//           padding: 16px 20px 20px;
//         }
//         .dashboard-container.mobile .quick-actions-grid {
//           gap: 8px;
//           padding: 12px 16px 16px;
//         }
//         .quick-action {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 8px;
//           padding: 16px 10px;
//           background-color: #f8fafc;
//           border: 1px solid #e2e8f030;
//           border-radius: 10px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }
//         .quick-action:hover {
//           border-color: #3b82f6;
//         }
//         .dashboard-container.mobile .quick-action {
//           gap: 6px;
//           padding: 14px 8px;
//         }
//         .quick-action span {
//           font-size: 12px;
//           font-weight: 500;
//           color: #1e293b;
//         }
//         .dashboard-container.mobile .quick-action span {
//           font-size: 11px;
//         }

//         /* ========== ACTIVITY LOG ========== */
//         .activity-log {
//           padding: 8px 0;
//           min-height: 200px;
//         }
//         .activity-item {
//           padding: 14px 20px;
//           border-bottom: 1px solid #e2e8f020;
//           border-left-width: 3px;
//           border-left-style: solid;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }
//         .dashboard-container.mobile .activity-item {
//           padding: 12px 16px;
//         }
//         .activity-item.type-success {
//           background-color: #10b98110;
//           border-left-color: #10b981;
//         }
//         .activity-item.type-warning {
//           background-color: #f59e0b10;
//           border-left-color: #f59e0b;
//         }
//         .activity-item.type-error {
//           background-color: #ef444410;
//           border-left-color: #ef4444;
//         }
//         .activity-item.type-info {
//           background-color: #3b82f610;
//           border-left-color: #3b82f6;
//         }
//         .activity-item p {
//           font-size: 13px;
//           color: #1e293b;
//           margin: 0;
//           flex: 1;
//         }
//         .dashboard-container.mobile .activity-item p {
//           font-size: 12px;
//         }
//         .activity-time {
//           font-size: 11px;
//           color: #64748b;
//           margin-left: 12px;
//           white-space: nowrap;
//         }
//         .dashboard-container.mobile .activity-time {
//           font-size: 10px;
//         }

//         /* ========== TEST MESSAGE BUTTON ========== */
//         .test-message-button {
//           display: flex;
//           align-items: center;
//           gap: 14px;
//           padding: 16px 20px;
//           background-color: #ffffff;
//           border: 1px solid #e2e8f030;
//           border-radius: 14px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           width: 100%;
//         }
//         .test-message-button:hover {
//           border-color: #3b82f6;
//         }
//         .dashboard-container.mobile .test-message-button {
//           gap: 12px;
//           padding: 14px 16px;
//           border-radius: 12px;
//         }
//         .test-message-button:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }
//         .test-message-content {
//           flex: 1;
//           text-align: left;
//         }
//         .test-message-content .title {
//           display: block;
//           font-size: 15px;
//           font-weight: 500;
//           color: #1e293b;
//           margin-bottom: 2px;
//         }
//         .dashboard-container.mobile .test-message-content .title {
//           font-size: 14px;
//         }
//         .test-message-content .subtitle {
//           display: block;
//           font-size: 12px;
//           color: #64748b;
//           margin: 0;
//         }
//         .dashboard-container.mobile .test-message-content .subtitle {
//           font-size: 11px;
//         }

//         /* ========== LOADING OVERLAY ========== */
//         .loading-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background-color: rgba(0, 0, 0, 0.3);
//           backdrop-filter: blur(4px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 9999;
//         }
//         .loading-overlay .loading-spinner {
//           background-color: #ffffff;
//           padding: 32px;
//           border-radius: 16px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 16px;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
//         }
//         .dashboard-container.mobile .loading-overlay .loading-spinner {
//           padding: 24px;
//           gap: 12px;
//         }
//         .loading-overlay .loading-spinner p {
//           font-size: 16px;
//           color: #1e293b;
//           font-weight: 500;
//           margin: 0;
//         }
//         .dashboard-container.mobile .loading-overlay .loading-spinner p {
//           font-size: 14px;
//         }
//       `}</style>
//     </div>
//   );
// }






// app/admin/qr/page.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from 'next-auth/react';
import {
  Wifi,
  User,
  WifiOff,
  Smartphone,
  LogOut,
  RefreshCw,
  Power,
  MessageSquare,
  Package,
  Users,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  DollarSign,
  ChevronRight,
  Maximize2,
  Minimize2,
  Phone,
  Building2,
  Radio,
  Loader2
} from 'lucide-react';

// Import Socket.IO client for notifications
import getSocketIOClient from '../../../lib/websocket/socketio-client';

export default function WhatsAppDashboard() {
  // ========== SESSION & COMPANY CONTEXT ==========
  const { data: session, status: sessionStatus } = useSession();
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  
  // ========== STATE MANAGEMENT ==========
  const [qrCode, setQrCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('loading');
  const [statusMessage, setStatusMessage] = useState('Connecting to WhatsApp service...');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalChats: 0,
    totalCustomers: 0,
    totalMessages: 0,
    activeChats: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    lastUpdated: null
  });
  const [botInfo, setBotInfo] = useState({
    pushname: '',
    platform: '',
    version: '',
    phoneNumber: '',
    connectedSince: null,
    lastActive: null
  });
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [showQRExpanded, setShowQRExpanded] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Socket.IO state
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [socketAuthenticated, setSocketAuthenticated] = useState(false);
  
  // Refs
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const socketClientRef = useRef(null);
  const isMountedRef = useRef(true);
  const initialDataFetchedRef = useRef(false);
  const apiCallTimeoutRef = useRef(null);
  
  // Debounced fetch functions to prevent multiple API calls
  const pendingStatsRef = useRef(null);
  const pendingOrdersRef = useRef(null);
  const pendingActivityRef = useRef(null);

  // ========== SAFE RENDERING UTILITY ==========
  const safeString = (value, defaultValue = '') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    
    if (typeof value === 'object' && value !== null) {
      if (value.companyId && value.status && value.exists !== undefined) {
        return defaultValue;
      }
    }
    
    return defaultValue;
  };

  // ========== GET COMPANY ID FROM SESSION ==========
  useEffect(() => {
    if (session?.user) {
      setCompanyId(session.user.companyId);
      setCompanyName(session.user.companyName || 'Your Company');
    }
  }, [session]);

  // ========== MOBILE DETECTION ==========
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // ========== UTILITY FUNCTIONS ==========
  const addToActivityLog = useCallback((message, type = 'info') => {
    const entry = {
      id: Date.now(),
      message: safeString(message, 'Activity recorded'),
      type: safeString(type, 'info'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActivityLog(prev => [entry, ...prev.slice(0, 7)]);
  }, []);

  // ========== DEBOUNCED API CALLS ==========
  const debouncedFetchStats = useCallback(() => {
    if (!companyId) return;
    
    if (pendingStatsRef.current) {
      clearTimeout(pendingStatsRef.current);
    }
    
    pendingStatsRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/whatsapp?action=stats&companyId=${companyId}`);
        const data = await response.json();
        
        if (data.success && data.stats && typeof data.stats === 'object' && !Array.isArray(data.stats) && isMountedRef.current) {
          setStats(prev => ({
            ...prev,
            ...data.stats,
            lastUpdated: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.log('Failed to fetch stats:', error.message);
      }
      pendingStatsRef.current = null;
    }, 500);
  }, [companyId]);

  const debouncedFetchRecentOrders = useCallback(() => {
    if (!companyId) return;
    
    if (pendingOrdersRef.current) {
      clearTimeout(pendingOrdersRef.current);
    }
    
    pendingOrdersRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/orders?limit=5&sortBy=createdAt&sortOrder=desc&companyId=${companyId}`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data) && isMountedRef.current) {
          setRecentOrders(data.data);
        } else {
          setRecentOrders([]);
        }
      } catch (error) {
        console.log('Failed to fetch recent orders:', error.message);
        setRecentOrders([]);
      }
      pendingOrdersRef.current = null;
    }, 500);
  }, [companyId]);

  const debouncedFetchActivityLog = useCallback(() => {
    if (!companyId) return;
    
    if (pendingActivityRef.current) {
      clearTimeout(pendingActivityRef.current);
    }
    
    pendingActivityRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/whatsapp/activity?limit=8&companyId=${companyId}`);
        
        if (response.status === 404) {
          return;
        }
        
        const data = await response.json();
        
        if (data && data.success && Array.isArray(data.activities) && isMountedRef.current) {
          const processedActivities = data.activities.filter(activity => {
            if (activity && typeof activity === 'object') {
              if (activity.companyId && activity.status && activity.exists !== undefined) {
                return false;
              }
              return true;
            }
            return false;
          });
          
          setActivityLog(prev => {
            const combined = [...processedActivities, ...prev];
            const unique = combined.filter((item, index, self) => 
              index === self.findIndex(t => t.id === item.id)
            );
            return unique.slice(0, 8);
          });
        }
      } catch (error) {
        console.log('Activity log fetch error:', error.message);
      }
      pendingActivityRef.current = null;
    }, 500);
  }, [companyId]);

  const fetchBotStatus = useCallback(async () => {
    if (!companyId) return;
    
    try {
      const response = await fetch(`/api/whatsapp?action=status&companyId=${companyId}`);
      const data = await response.json();
      
      if (data.success && isMountedRef.current) {
        if (data.qr) setQrCode(data.qr);
        if (data.status) setConnectionStatus(safeString(data.status, 'disconnected'));
        if (data.message) setStatusMessage(safeString(data.message, 'WhatsApp service'));
        
        if (data.botInfo && typeof data.botInfo === 'object' && !Array.isArray(data.botInfo)) {
          setBotInfo({
            pushname: safeString(data.botInfo.pushname, ''),
            platform: safeString(data.botInfo.platform, 'WhatsApp Business'),
            version: safeString(data.botInfo.version, '2.24.12'),
            phoneNumber: safeString(data.botInfo.phoneNumber, 'Not available'),
            connectedSince: data.botInfo.connectedSince || null,
            lastActive: data.botInfo.lastActive || null
          });
        }
      }
    } catch (error) {
      console.log('Failed to fetch bot status:', error.message);
    }
  }, [companyId]);

  // ========== SOCKET.IO INITIALIZATION ==========
  const initializeSocketIO = useCallback(() => {
    if (!companyId || !session?.user) return;

    try {
      const socketClient = getSocketIOClient();
      socketClientRef.current = socketClient;

      socketClient.addStateListener((newState, oldState) => {
        if (isMountedRef.current) {
          setSocketStatus(newState);
        }
      });

      socketClient.addConnectionListener((connected, info) => {
        if (connected && isMountedRef.current) {
          addToActivityLog('Real-time notifications connected', 'success');
        }
      });

      socketClient.on('authenticated', (data) => {
        if (isMountedRef.current) {
          setSocketAuthenticated(true);
          addToActivityLog('Real-time notifications authenticated', 'success');
        }
      });

      socketClient.on('unauthorized', (data) => {
        if (isMountedRef.current) {
          setSocketAuthenticated(false);
          setConnectionError('Notification service authentication failed');
        }
      });

      // Notification handlers - use debounced updates
      socketClient.on('NEW_ORDER', (data) => {
        if (isMountedRef.current) {
          addToActivityLog(`New order: ${data.order?.orderNumber || 'Unknown'}`, 'success');
          debouncedFetchRecentOrders();
          debouncedFetchStats();
          
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🛍️ New Order', {
              body: `Order #${data.order?.orderNumber} from ${data.order?.customerName || 'Customer'}`,
              icon: '/favicon.ico'
            });
          }
        }
      });

      socketClient.on('PAYMENT_RECEIVED', (data) => {
        if (isMountedRef.current) {
          addToActivityLog(`Payment received: ₹${data.amount} for order #${data.orderNumber}`, 'success');
          debouncedFetchStats();
        }
      });

      socketClient.on('ORDER_STATUS_CHANGED', (data) => {
        if (isMountedRef.current) {
          addToActivityLog(`Order #${data.orderNumber} is now ${data.newStatus}`, 'info');
          debouncedFetchRecentOrders();
        }
      });

      socketClient.on('LOW_STOCK_ALERT', (data) => {
        if (isMountedRef.current) {
          addToActivityLog(`Low stock: ${data.product?.productName} (${data.product?.stock} left)`, 'warning');
        }
      });

      socketClient.on('DASHBOARD_UPDATE', (data) => {
        if (data.type === 'order-created' && isMountedRef.current) {
          debouncedFetchRecentOrders();
          debouncedFetchStats();
        }
      });

      socketClient.connect({
        id: session.user.id,
        role: session.user.role,
        name: session.user.name || session.user.email,
        companyId: companyId,
        email: session.user.email,
        autoReconnect: true
      });

    } catch (error) {
      console.error('❌ Socket.IO initialization error:', error);
      if (isMountedRef.current) {
        setConnectionError('Failed to initialize notification service');
      }
    }
  }, [companyId, session, addToActivityLog, debouncedFetchRecentOrders, debouncedFetchStats]);

  // ========== WEBSOCKET CONNECTION FOR QR CODES ==========
  const connectWebSocket = useCallback(() => {
    if (!companyId) return;

    if (wsRef.current && 
        (wsRef.current.readyState === WebSocket.CONNECTING || 
         wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSING) {
      try {
        wsRef.current.close();
      } catch (error) {
        console.log('Error closing WebSocket:', error.message);
      }
      wsRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (isMountedRef.current) {
      setConnectionError(null);
    }
    
    try {
      const baseWsUrl = process.env.NEXT_PUBLIC_QR_WS_URL || 'ws://localhost:3001';
      const wsUrl = `${baseWsUrl}/ws/qr?companyId=${companyId}`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        if (isMountedRef.current) {
          setWsConnected(true);
          setConnectionStatus('connected');
          setStatusMessage('WhatsApp is connected and ready');
          setConnectionError(null);
          setReconnectAttempts(0);
        }
        
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'get_status' }));
            wsRef.current.send(JSON.stringify({ type: 'get_stats' }));
            wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
          }
        }, 500);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.companyId && data.companyId !== companyId) return;
          
          if (!isMountedRef.current) return;
          
          switch (data.type) {
            case 'qr':
            case 'qr_update':
              if (data.qr) {
                setQrCode(data.qr);
                setConnectionStatus('qr_required');
                setStatusMessage('Scan QR code with WhatsApp to connect');
              }
              break;
              
            case 'status':
            case 'status_update':
              if (data.status) setConnectionStatus(safeString(data.status, 'disconnected'));
              if (data.message) setStatusMessage(safeString(data.message, 'WhatsApp service'));
              if (data.qr) setQrCode(data.qr);
              if (data.connected !== undefined) {
                setConnectionStatus(data.connected ? 'connected' : 'disconnected');
              }
              break;
              
            case 'stats':
            case 'stats_update':
              if (data.stats && typeof data.stats === 'object' && !Array.isArray(data.stats)) {
                setStats(prev => ({
                  ...prev,
                  ...data.stats,
                  lastUpdated: new Date().toISOString()
                }));
              }
              break;
              
            case 'bot_connected':
              setConnectionStatus('connected');
              setStatusMessage('WhatsApp is connected and ready');
              setQrCode(null);
              addToActivityLog('WhatsApp connected successfully', 'success');
              break;
              
            case 'bot_disconnected':
              setConnectionStatus('disconnected');
              setStatusMessage(`Disconnected: ${safeString(data.reason, 'Unknown reason')}`);
              addToActivityLog(`Disconnected: ${safeString(data.reason, 'Unknown reason')}`, 'warning');
              break;
              
            case 'bot_info':
              if (data.botInfo && typeof data.botInfo === 'object' && !Array.isArray(data.botInfo)) {
                setBotInfo({
                  pushname: safeString(data.botInfo.pushname, ''),
                  platform: safeString(data.botInfo.platform, 'WhatsApp Business'),
                  version: safeString(data.botInfo.version, '2.24.12'),
                  phoneNumber: safeString(data.botInfo.phoneNumber, 'Not available'),
                  connectedSince: data.botInfo.connectedSince || null,
                  lastActive: data.botInfo.lastActive || null
                });
              }
              break;
              
            case 'NEW_ORDER':
              addToActivityLog(`New order received: ${data.order?.orderNumber || 'ORD-' + Date.now()}`, 'success');
              debouncedFetchRecentOrders();
              debouncedFetchStats();
              break;
              
            case 'PAYMENT_RECEIVED':
              addToActivityLog(`Payment received for order #${safeString(data.orderNumber, 'unknown')}`, 'success');
              debouncedFetchStats();
              break;
              
            case 'ORDER_STATUS_CHANGED':
              addToActivityLog(`Order #${safeString(data.orderNumber, 'unknown')} status changed to ${safeString(data.newStatus, 'updated')}`, 'info');
              debouncedFetchRecentOrders();
              break;
              
            case 'pong':
              break;
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error.message);
        }
      };
      
      wsRef.current.onclose = (event) => {
        if (isMountedRef.current) {
          setWsConnected(false);
        }
        
        if (event.code !== 1000 && !reconnectTimerRef.current && isMountedRef.current) {
          if (isMountedRef.current) {
            setConnectionError('Connection lost. Reconnecting...');
          }
          
          const delay = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 30000);
          setReconnectAttempts(prev => prev + 1);
          
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            if (isMountedRef.current) {
              connectWebSocket();
            }
          }, delay);
        }
      };
      
      wsRef.current.onerror = (error) => {
        if (isMountedRef.current) {
          setConnectionError('Failed to connect to WhatsApp service');
        }
        fetchBotStatus();
      };
      
    } catch (error) {
      console.error('WebSocket setup error:', error);
      if (isMountedRef.current) {
        setConnectionError('Failed to initialize connection');
      }
      fetchBotStatus();
    }
  }, [companyId, fetchBotStatus, addToActivityLog, debouncedFetchRecentOrders, debouncedFetchStats, reconnectAttempts]);

  // ========== WEBSOCKET PING INTERVAL ==========
  useEffect(() => {
    if (!wsRef.current || !wsConnected) return;
    
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
    
    pingIntervalRef.current = pingInterval;
    
    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [wsConnected]);

  // ========== BOT CONTROL FUNCTIONS ==========
  const handleBotAction = async (action, confirmMessage = null) => {
    if (!companyId) {
      alert('Company ID not found');
      return;
    }
    
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    
    setIsLoading(true);
    setLoadingAction(action);
    setConnectionError(null);
    
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          companyId 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBotStatus();
        debouncedFetchStats();
        
        if (action === 'connect') {
          setStatusMessage('WhatsApp connected successfully');
          addToActivityLog('WhatsApp connected', 'success');
        } else if (action === 'disconnect') {
          setStatusMessage('WhatsApp disconnected');
          addToActivityLog('WhatsApp disconnected', 'warning');
        } else if (action === 'restart') {
          setStatusMessage('WhatsApp service restarted');
          addToActivityLog('WhatsApp restarted', 'info');
        } else if (action === 'logout') {
          setStatusMessage('Logged out successfully');
          addToActivityLog('Logged out', 'warning');
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
            }
          }, 2000);
        } else if (action === 'refresh-qr') {
          setStatusMessage('Generating new QR code...');
          addToActivityLog('Requested new QR code', 'info');
        }
      } else {
        setConnectionError(data.error || 'Action failed');
      }
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      setConnectionError(error.message);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const requestQRCode = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
    } else {
      handleBotAction('refresh-qr');
    }
  }, [handleBotAction]);

  const sendTestMessage = async () => {
    if (!companyId) return;
    
    const phoneNumber = prompt('Enter phone number (with country code):');
    if (!phoneNumber) return;
    
    const message = prompt('Enter message:');
    if (!message) return;
    
    setIsLoading(true);
    setLoadingAction('send_message');
    
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_message',
          companyId,
          to: phoneNumber,
          message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToActivityLog(`Message sent to ${phoneNumber}`, 'success');
      } else {
        setConnectionError(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      setConnectionError(error.message);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // ========== REQUEST NOTIFICATION PERMISSION ==========
  const requestNotificationPermission = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            addToActivityLog('Browser notifications enabled', 'success');
          }
        });
      }
    }
  }, [addToActivityLog]);

  // ========== INITIALIZATION - ONLY ONCE ==========
  useEffect(() => {
    isMountedRef.current = true;
    
    if (companyId && session?.user && !initialDataFetchedRef.current) {
      initialDataFetchedRef.current = true;
      
      connectWebSocket();
      initializeSocketIO();
      fetchBotStatus();
      debouncedFetchStats();
      debouncedFetchRecentOrders();
      debouncedFetchActivityLog();
      requestNotificationPermission();
    }
    
    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (pendingStatsRef.current) clearTimeout(pendingStatsRef.current);
      if (pendingOrdersRef.current) clearTimeout(pendingOrdersRef.current);
      if (pendingActivityRef.current) clearTimeout(pendingActivityRef.current);
      if (socketClientRef.current) {
        socketClientRef.current.disconnect('Component unmount');
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [companyId, session, connectWebSocket, initializeSocketIO, fetchBotStatus, debouncedFetchStats, debouncedFetchRecentOrders, debouncedFetchActivityLog, requestNotificationPermission]);

  // ========== PERIODIC REFRESH - ONLY EVERY 30 SECONDS ==========
  useEffect(() => {
    if (!companyId || !initialDataFetchedRef.current) return;

    const interval = setInterval(() => {
      if (isMountedRef.current) {
        debouncedFetchStats();
        debouncedFetchRecentOrders();
        debouncedFetchActivityLog();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [companyId, debouncedFetchStats, debouncedFetchRecentOrders, debouncedFetchActivityLog]);

  // ========== UTILITY FUNCTIONS ==========
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMins = Math.floor((now - date) / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // ========== SAFE ACTIVITY LOG RENDERER ==========
  const renderActivityLog = () => {
    if (!Array.isArray(activityLog) || activityLog.length === 0) {
      return (
        <div className="empty-state">
          <Activity size={isMobile ? 32 : 40} />
          <p>No recent activity</p>
        </div>
      );
    }

    return activityLog
      .filter(log => {
        if (log && typeof log === 'object') {
          if (log.companyId && log.status && log.exists !== undefined) {
            return false;
          }
          return true;
        }
        return false;
      })
      .map((log, index) => {
        if (!log || typeof log !== 'object') return null;

        const message = safeString(log.message, log.text || log.content || 'Activity recorded');
        const type = safeString(log.type, log.level || 'info');
        const timestamp = safeString(log.timestamp, log.time || log.date || new Date().toLocaleTimeString());
        const id = log.id || `activity-${index}-${Date.now()}`;

        return (
          <div key={id} className={`activity-item type-${type}`}>
            <p>{message}</p>
            <span className="activity-time">{timestamp}</span>
          </div>
        );
      });
  };

  // ========== LOADING STATE ==========
  if (sessionStatus === 'loading' || !companyId) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <Loader2 size={48} className="spin" />
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  // ========== STATUS CONFIG ==========
  const getStatusConfig = () => {
    const status = safeString(connectionStatus, 'disconnected');
    switch (status) {
      case 'connected':
        return { color: '#10b981', text: 'Connected', icon: 'wifi' };
      case 'qr_required':
        return { color: '#f59e0b', text: 'QR Required', icon: 'smartphone' };
      case 'loading':
        return { color: '#3b82f6', text: 'Connecting', icon: 'loader' };
      case 'disconnected':
        return { color: '#ef4444', text: 'Disconnected', icon: 'wifi-off' };
      default:
        return { color: '#6b7280', text: status, icon: 'alert' };
    }
  };

  const statusConfig = getStatusConfig();

  // ========== STAT CARDS ==========
  const statCards = [
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      change: stats.ordersGrowth > 0 ? `+${stats.ordersGrowth}%` : `${stats.ordersGrowth}%`,
      icon: Package,
      color: '#3b82f6',
      trend: stats.ordersGrowth > 0 ? 'up' : 'down'
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      change: stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}%` : `${stats.revenueGrowth}%`,
      icon: DollarSign,
      color: '#10b981',
      trend: stats.revenueGrowth > 0 ? 'up' : 'down'
    },
    {
      title: 'Customers',
      value: formatNumber(stats.totalCustomers),
      change: stats.customersGrowth > 0 ? `+${stats.customersGrowth}%` : `${stats.customersGrowth}%`,
      icon: Users,
      color: '#8b5cf6',
      trend: stats.customersGrowth > 0 ? 'up' : 'down'
    },
    {
      title: 'Messages',
      value: formatNumber(stats.totalMessages),
      change: `${Math.round((stats.totalMessages / (stats.totalCustomers || 1)) * 10) / 10}/cust`,
      icon: MessageSquare,
      color: '#f59e0b',
      trend: 'neutral'
    },
    {
      title: 'Active Chats',
      value: stats.activeChats,
      change: stats.activeChats > 0 ? 'Active' : 'Inactive',
      icon: Activity,
      color: '#ef4444',
      trend: stats.activeChats > 0 ? 'up' : 'down'
    },
    {
      title: 'Pending',
      value: stats.pendingOrders,
      change: `${Math.round((stats.pendingOrders / (stats.totalOrders || 1)) * 100)}%`,
      icon: Clock,
      color: '#f59e0b',
      trend: 'neutral'
    }
  ];

  return (
    <div className={`dashboard-container ${isMobile ? 'mobile' : ''}`}>
      {/* Loading Overlay - Only shows when action is loading */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner-small">
            <Loader2 size={24} className="spin" />
            <p>{loadingAction === 'connect' ? 'Connecting...' : 
                  loadingAction === 'disconnect' ? 'Disconnecting...' :
                  loadingAction === 'restart' ? 'Restarting...' :
                  loadingAction === 'logout' ? 'Logging out...' :
                  loadingAction === 'send_message' ? 'Sending message...' : 'Processing...'}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <div className="title-wrapper">
            <div className="title-bar"></div>
            <h1>WhatsApp Dashboard</h1>
          </div>
          <div className="company-info">
            <Building2 size={16} />
            <span>{safeString(companyName, 'Your Company')}</span>
          </div>
          <p className="subtitle">Real-time WhatsApp business monitoring</p>
        </div>

        {/* Status Badges */}
        <div className="status-wrapper">
          <div className={`socket-badge ${socketAuthenticated ? 'connected' : socketStatus === 'connected' ? 'connecting' : 'disconnected'}`}>
            <Radio size={isMobile ? 12 : 14} />
            <span>{socketAuthenticated ? 'Live' : socketStatus === 'connected' ? 'Connecting' : 'Offline'}</span>
          </div>
          
          {connectionError && (
            <div className="error-badge">
              <AlertCircle size={isMobile ? 12 : 14} />
              <span>{safeString(connectionError, 'Error')}</span>
            </div>
          )}
          <div className={`status-badge status-${safeString(connectionStatus, 'disconnected')}`}>
            <span className="status-dot"></span>
            <span>{safeString(statusConfig?.text, 'Unknown')}</span>
          </div>
          <div className="time-badge">
            <Clock size={isMobile ? 12 : 14} />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                  <Icon size={isMobile ? 14 : 16} color={stat.color} />
                </div>
                <span className={`stat-change trend-${stat.trend}`}>
                  {safeString(stat.change, '0%')}
                </span>
              </div>
              <p className="stat-label">{safeString(stat.title, 'Stat')}</p>
              <p className="stat-value">{safeString(stat.value, '0')}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Connection Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>WhatsApp Connection</h2>
                <p className="card-subtitle">{safeString(statusMessage, 'WhatsApp service')}</p>
              </div>
              <div className="action-buttons">
                <button
                  onClick={() => handleBotAction('restart')}
                  disabled={isLoading}
                  className="action-button restart"
                >
                  <RefreshCw size={isMobile ? 14 : 16} />
                  {!isMobile && <span>Restart</span>}
                </button>
                <button
                  onClick={() => handleBotAction('logout', 'Logout from WhatsApp?')}
                  disabled={isLoading}
                  className="action-button logout"
                >
                  <LogOut size={isMobile ? 14 : 16} />
                  {!isMobile && <span>Logout</span>}
                </button>
                {connectionStatus === 'connected' ? (
                  <button
                    onClick={() => handleBotAction('disconnect')}
                    disabled={isLoading}
                    className="action-button disconnect"
                  >
                    <Power size={isMobile ? 14 : 16} />
                    {!isMobile && <span>Disconnect</span>}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBotAction('connect')}
                    disabled={isLoading}
                    className="action-button connect"
                  >
                    <Wifi size={isMobile ? 14 : 16} />
                    {!isMobile && <span>Connect</span>}
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Section */}
            <div className="qr-section">
              {qrCode ? (
                <div className="qr-container">
                  <button
                    onClick={() => setShowQRExpanded(!showQRExpanded)}
                    className="qr-wrapper"
                  >
                    <div className={`qr-background ${showQRExpanded ? 'expanded' : ''}`}>
                      <QRCodeSVG
                        value={qrCode}
                        size={showQRExpanded ? (isMobile ? 220 : 280) : (isMobile ? 160 : 200)}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <div className="qr-expand-button">
                      {showQRExpanded ? <Minimize2 size={isMobile ? 14 : 16} /> : <Maximize2 size={isMobile ? 14 : 16} />}
                    </div>
                  </button>
                  <h3>Scan QR Code to Connect</h3>
                  <div className="qr-steps">
                    {['Open WhatsApp', 'Tap Menu (⋮)', 'Linked Devices', 'Scan QR Code'].map((step, index) => (
                      <div key={index} className="qr-step">
                        <div className="qr-step-number">{index + 1}</div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="connected-state">
                  <div className="connected-icon">
                    {connectionStatus === 'loading' ? (
                      <Loader2 size={isMobile ? 32 : 40} className="spin" color="#3b82f6" />
                    ) : (
                      <CheckCircle size={isMobile ? 32 : 40} color="#10b981" />
                    )}
                  </div>
                  <h3>{connectionStatus === 'loading' ? 'Connecting...' : 'WhatsApp is Connected'}</h3>
                  <p>{connectionStatus === 'loading' ? 'Establishing connection...' : 'Your WhatsApp business account is active and ready'}</p>
                  <div className="bot-info-grid">
                    <div className="bot-info-item">
                      <Phone size={isMobile ? 12 : 14} />
                      <span>{safeString(botInfo.phoneNumber, 'N/A')}</span>
                    </div>
                    <div className="bot-info-item">
                      <User size={isMobile ? 12 : 14} />
                      <span>{safeString(botInfo.pushname, 'N/A')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bot Info Cards */}
          <div className="bot-info-cards">
            <div className="bot-info-card">
              <Smartphone size={isMobile ? 16 : 18} color="#3b82f6" />
              <div>
                <p className="label">Platform</p>
                <p className="value">{safeString(botInfo.platform, 'N/A')}</p>
              </div>
            </div>
            <div className="bot-info-card">
              <Package size={isMobile ? 16 : 18} color="#8b5cf6" />
              <div>
                <p className="label">Version</p>
                <p className="value">{safeString(botInfo.version, 'N/A')}</p>
              </div>
            </div>
            <div className="bot-info-card">
              <Activity size={isMobile ? 16 : 18} color="#f59e0b" />
              <div>
                <p className="label">Last Active</p>
                <p className="value">Just now</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h2>Recent Orders</h2>
              <button className="view-all-button">View All</button>
            </div>
            <div className="orders-list">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, i) => (
                  <div key={i} className="order-item">
                    <div className="order-left">
                      <div className={`order-icon status-${safeString(order.status, 'default')}`}>
                        <Package size={isMobile ? 14 : 16} />
                      </div>
                      <div>
                        <p className="order-number">{safeString(order.orderNumber, `ORD-${i+1}`)}</p>
                        <p className="order-customer">{safeString(order.customerName, 'Customer')}</p>
                      </div>
                    </div>
                    <div className="order-right">
                      <p className="order-amount">₹{order.totalAmount || 0}</p>
                      <p className="order-time">{formatTime(order.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Package size={isMobile ? 32 : 40} />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Quick Actions */}
          <div className="card">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <button
                onClick={sendTestMessage}
                disabled={connectionStatus !== 'connected' || isLoading}
                className="quick-action"
              >
                <Send size={isMobile ? 18 : 20} color="#3b82f6" />
                <span>Send Message</span>
              </button>
              <button
                onClick={requestQRCode}
                disabled={isLoading}
                className="quick-action"
              >
                <RefreshCw size={isMobile ? 18 : 20} color="#10b981" />
                <span>Refresh QR</span>
              </button>
              <button
                onClick={() => window.open(`/api/whatsapp/export?companyId=${companyId}`, '_blank')}
                className="quick-action"
              >
                <Download size={isMobile ? 18 : 20} color="#8b5cf6" />
                <span>Export</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/analytics'}
                className="quick-action"
              >
                <BarChart3 size={isMobile ? 18 : 20} color="#f59e0b" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="card">
            <h2>Recent Activity</h2>
            <div className="activity-log">
              {renderActivityLog()}
            </div>
          </div>

          {/* Test Message Button */}
          <button
            onClick={sendTestMessage}
            disabled={connectionStatus !== 'connected' || isLoading}
            className="test-message-button"
          >
            <Send size={isMobile ? 18 : 20} color="#3b82f6" />
            <div className="test-message-content">
              <span className="title">Send Test Message</span>
              <span className="subtitle">Send to any WhatsApp number</span>
            </div>
            <ChevronRight size={isMobile ? 18 : 20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        /* ========== ANIMATIONS ========== */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }

        /* ========== LOADING STATES ========== */
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f9fafb;
        }
        .loading-spinner {
          background-color: #ffffff;
          padding: 32px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .loading-spinner p {
          font-size: 16px;
          color: #1e293b;
          font-weight: 500;
          margin: 0;
        }
        
        .loading-spinner-small {
          background-color: #ffffff;
          padding: 20px 32px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .loading-spinner-small p {
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
          margin: 0;
        }

        /* ========== DASHBOARD CONTAINER ========== */
        .dashboard-container {
          padding: 24px;
          background-color: transparent;
          min-height: 100vh;
          width: 100%;
        }
        .dashboard-container.mobile {
          padding: 16px;
        }

        /* ========== HEADER ========== */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .dashboard-container.mobile .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
        }
        .title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }
        .dashboard-container.mobile .title-wrapper {
          gap: 10px;
        }
        .title-bar {
          width: 4px;
          height: 28px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }
        .dashboard-container.mobile .title-bar {
          width: 3px;
          height: 24px;
        }
        .title-wrapper h1 {
          color: #1e293b;
          font-weight: 700;
          font-size: 1.75rem;
          margin: 0;
          line-height: 1.2;
        }
        .dashboard-container.mobile .title-wrapper h1 {
          font-size: 1.4rem;
        }
        .company-info {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 15px;
          margin-top: 2px;
        }
        .company-info span {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }
        .subtitle {
          color: #64748b;
          margin: 4px 0 0 15px;
          font-size: 0.95rem;
          font-weight: 500;
        }
        .dashboard-container.mobile .subtitle {
          font-size: 0.85rem;
        }

        /* ========== STATUS BADGES ========== */
        .status-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dashboard-container.mobile .status-wrapper {
          gap: 8px;
        }
        
        .socket-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .socket-badge.connected {
          background-color: #10b98110;
          border-color: #10b98130;
          color: #10b981;
        }
        .socket-badge.connecting {
          background-color: #f59e0b10;
          border-color: #f59e0b30;
          color: #f59e0b;
        }
        .socket-badge.disconnected {
          background-color: #ef444410;
          border-color: #ef444430;
          color: #ef4444;
        }
        
        .error-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background-color: #ef444410;
          border: 1px solid #ef444430;
          border-radius: 20px;
        }
        .dashboard-container.mobile .error-badge {
          padding: 4px 8px;
        }
        .error-badge span {
          color: #ef4444;
          font-size: 13px;
        }
        .dashboard-container.mobile .error-badge span {
          font-size: 12px;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid;
          background-color: #ffffff;
        }
        .dashboard-container.mobile .status-badge {
          gap: 6px;
          padding: 6px 10px;
        }
        .status-badge.status-connected {
          border-color: #10b98140;
          background-color: #10b98120;
        }
        .status-badge.status-qr_required {
          border-color: #f59e0b40;
          background-color: #f59e0b20;
        }
        .status-badge.status-loading {
          border-color: #3b82f640;
          background-color: #3b82f620;
        }
        .status-badge.status-disconnected {
          border-color: #ef444440;
          background-color: #ef444420;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: currentColor;
        }
        .status-connected .status-dot {
          background-color: #10b981;
          animation: pulse 2s infinite;
        }
        .status-qr_required .status-dot {
          background-color: #f59e0b;
        }
        .status-loading .status-dot {
          background-color: #3b82f6;
        }
        .status-disconnected .status-dot {
          background-color: #ef4444;
        }
        .time-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background-color: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f040;
        }
        .dashboard-container.mobile .time-badge {
          padding: 6px 10px;
        }
        .time-badge span {
          font-size: 13px;
          color: #6b7280;
        }
        .dashboard-container.mobile .time-badge span {
          font-size: 12px;
        }

        /* ========== STATS GRID ========== */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
        }
        .stat-card {
          background-color: #ffffff;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f030;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .dashboard-container.mobile .stat-card {
          padding: 12px;
          border-radius: 10px;
        }
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .stat-icon {
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dashboard-container.mobile .stat-icon {
          padding: 6px;
        }
        .stat-change {
          font-size: 11px;
          font-weight: 600;
        }
        .dashboard-container.mobile .stat-change {
          font-size: 10px;
        }
        .stat-change.trend-up {
          color: #10b981;
        }
        .stat-change.trend-down {
          color: #ef4444;
        }
        .stat-change.trend-neutral {
          color: #6b7280;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 2px 0;
        }
        .dashboard-container.mobile .stat-label {
          font-size: 11px;
        }
        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .dashboard-container.mobile .stat-value {
          font-size: 14px;
        }

        /* ========== MAIN GRID ========== */
        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        .left-column, .right-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dashboard-container.mobile .left-column,
        .dashboard-container.mobile .right-column {
          gap: 16px;
        }

        /* ========== CARDS ========== */
        .card {
          background-color: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f030;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        .dashboard-container.mobile .card {
          border-radius: 14px;
        }
        .card-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f030;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .dashboard-container.mobile .card-header {
          padding: 16px;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .card-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        .dashboard-container.mobile .card-header h2 {
          font-size: 16px;
        }
        .card-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
        }
        .dashboard-container.mobile .card-subtitle {
          font-size: 12px;
        }

        /* ========== ACTION BUTTONS ========== */
        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dashboard-container.mobile .action-buttons {
          gap: 6px;
        }
        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
          background: none;
        }
        .dashboard-container.mobile .action-button {
          gap: 4px;
          padding: 8px 12px;
          font-size: 12px;
        }
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-button.restart {
          background-color: #3b82f615;
          border-color: #3b82f630;
          color: #3b82f6;
        }
        .action-button.logout {
          background-color: #f59e0b15;
          border-color: #f59e0b30;
          color: #f59e0b;
        }
        .action-button.disconnect {
          background-color: #ef444415;
          border-color: #ef444430;
          color: #ef4444;
        }
        .action-button.connect {
          background-color: #10b98115;
          border-color: #10b98130;
          color: #10b981;
        }

        /* ========== QR SECTION ========== */
        .qr-section {
          padding: 24px;
        }
        .dashboard-container.mobile .qr-section {
          padding: 16px;
        }
        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .qr-wrapper {
          position: relative;
          margin-bottom: 20px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .dashboard-container.mobile .qr-wrapper {
          margin-bottom: 16px;
        }
        .qr-background {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 16px;
          border: 2px dashed #3b82f640;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }
        .dashboard-container.mobile .qr-background {
          padding: 12px;
          border-radius: 14px;
        }
        .qr-background.expanded {
          padding: 20px;
        }
        .qr-expand-button {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 32px;
          height: 32px;
          background-color: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        }
        .dashboard-container.mobile .qr-expand-button {
          width: 28px;
          height: 28px;
        }
        .qr-container h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 16px 0;
        }
        .dashboard-container.mobile .qr-container h3 {
          font-size: 16px;
          margin-bottom: 12px;
        }
        .qr-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: 100%;
          max-width: 400px;
        }
        @media (max-width: 480px) {
          .qr-steps {
            gap: 4px;
          }
        }
        .qr-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .qr-step-number {
          width: 24px;
          height: 24px;
          background-color: #3b82f615;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #3b82f6;
        }
        .dashboard-container.mobile .qr-step-number {
          width: 22px;
          height: 22px;
          font-size: 11px;
        }
        .qr-step span {
          font-size: 10px;
          color: #64748b;
          text-align: center;
        }
        .dashboard-container.mobile .qr-step span {
          font-size: 9px;
        }

        /* ========== CONNECTED STATE ========== */
        .connected-state {
          text-align: center;
          padding: 24px;
        }
        .dashboard-container.mobile .connected-state {
          padding: 16px;
        }
        .connected-icon {
          margin-bottom: 16px;
        }
        .dashboard-container.mobile .connected-icon {
          margin-bottom: 12px;
        }
        .connected-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }
        .dashboard-container.mobile .connected-state h3 {
          font-size: 18px;
        }
        .connected-state p {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 20px 0;
        }
        .dashboard-container.mobile .connected-state p {
          font-size: 13px;
          margin-bottom: 16px;
        }
        .bot-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 300px;
          margin: 0 auto;
        }
        .dashboard-container.mobile .bot-info-grid {
          gap: 8px;
        }
        .bot-info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #f8fafc;
          padding: 10px;
          border-radius: 8px;
        }
        .dashboard-container.mobile .bot-info-item {
          padding: 8px;
        }
        .bot-info-item span {
          font-size: 13px;
          color: #1e293b;
          font-weight: 500;
        }
        .dashboard-container.mobile .bot-info-item span {
          font-size: 12px;
        }

        /* ========== BOT INFO CARDS ========== */
        .bot-info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 480px) {
          .bot-info-cards {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
        .bot-info-card {
          background-color: #ffffff;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f030;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dashboard-container.mobile .bot-info-card {
          padding: 12px;
          border-radius: 10px;
          gap: 8px;
        }
        .bot-info-card .label {
          font-size: 11px;
          color: #64748b;
          margin: 0 0 2px 0;
        }
        .dashboard-container.mobile .bot-info-card .label {
          font-size: 10px;
        }
        .bot-info-card .value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        .dashboard-container.mobile .bot-info-card .value {
          font-size: 13px;
        }

        /* ========== ORDERS LIST ========== */
        .view-all-button {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
        }
        .dashboard-container.mobile .view-all-button {
          font-size: 12px;
          padding: 6px 8px;
        }
        .orders-list {
          padding: 4px 0;
        }
        .order-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid #e2e8f020;
          transition: background-color 0.2s ease;
          cursor: pointer;
        }
        .order-item:hover {
          background-color: #f8fafc;
        }
        .dashboard-container.mobile .order-item {
          padding: 12px 16px;
        }
        .order-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .order-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dashboard-container.mobile .order-icon {
          width: 36px;
          height: 36px;
        }
        .order-icon.status-completed {
          background-color: #10b98120;
        }
        .order-icon.status-pending {
          background-color: #f59e0b20;
        }
        .order-icon.status-processing {
          background-color: #3b82f620;
        }
        .order-icon.status-default {
          background-color: #6b728020;
        }
        .order-number {
          font-size: 15px;
          font-weight: 500;
          color: #1e293b;
          margin: 0 0 2px 0;
        }
        .dashboard-container.mobile .order-number {
          font-size: 14px;
        }
        .order-customer {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .dashboard-container.mobile .order-customer {
          font-size: 11px;
        }
        .order-right {
          text-align: right;
        }
        .order-amount {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 2px 0;
        }
        .dashboard-container.mobile .order-amount {
          font-size: 14px;
        }
        .order-time {
          font-size: 11px;
          color: #64748b;
          margin: 0;
        }
        .dashboard-container.mobile .order-time {
          font-size: 10px;
        }

        /* ========== EMPTY STATE ========== */
        .empty-state {
          padding: 40px 24px;
          text-align: center;
        }
        .dashboard-container.mobile .empty-state {
          padding: 32px 16px;
        }
        .empty-state svg {
          color: #d1d5db;
        }
        .empty-state p {
          font-size: 14px;
          color: #64748b;
          margin: 12px 0 0 0;
        }
        .dashboard-container.mobile .empty-state p {
          font-size: 13px;
        }

        /* ========== QUICK ACTIONS ========== */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 16px 20px 20px;
        }
        @media (max-width: 480px) {
          .quick-actions-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 10px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f030;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .quick-action:hover {
          border-color: #3b82f6;
        }
        .dashboard-container.mobile .quick-action {
          gap: 6px;
          padding: 14px 8px;
        }
        .quick-action span {
          font-size: 12px;
          font-weight: 500;
          color: #1e293b;
        }
        .dashboard-container.mobile .quick-action span {
          font-size: 11px;
        }

        /* ========== ACTIVITY LOG ========== */
        .activity-log {
          padding: 8px 0;
          min-height: 200px;
        }
        .activity-item {
          padding: 14px 20px;
          border-bottom: 1px solid #e2e8f020;
          border-left-width: 3px;
          border-left-style: solid;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dashboard-container.mobile .activity-item {
          padding: 12px 16px;
        }
        .activity-item.type-success {
          background-color: #10b98110;
          border-left-color: #10b981;
        }
        .activity-item.type-warning {
          background-color: #f59e0b10;
          border-left-color: #f59e0b;
        }
        .activity-item.type-error {
          background-color: #ef444410;
          border-left-color: #ef4444;
        }
        .activity-item.type-info {
          background-color: #3b82f610;
          border-left-color: #3b82f6;
        }
        .activity-item p {
          font-size: 13px;
          color: #1e293b;
          margin: 0;
          flex: 1;
        }
        .dashboard-container.mobile .activity-item p {
          font-size: 12px;
        }
        .activity-time {
          font-size: 11px;
          color: #64748b;
          margin-left: 12px;
          white-space: nowrap;
        }
        .dashboard-container.mobile .activity-time {
          font-size: 10px;
        }

        /* ========== TEST MESSAGE BUTTON ========== */
        .test-message-button {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background-color: #ffffff;
          border: 1px solid #e2e8f030;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        .test-message-button:hover {
          border-color: #3b82f6;
        }
        .dashboard-container.mobile .test-message-button {
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
        }
        .test-message-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .test-message-content {
          flex: 1;
          text-align: left;
        }
        .test-message-content .title {
          display: block;
          font-size: 15px;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 2px;
        }
        .dashboard-container.mobile .test-message-content .title {
          font-size: 14px;
        }
        .test-message-content .subtitle {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .dashboard-container.mobile .test-message-content .subtitle {
          font-size: 11px;
        }

        /* ========== LOADING OVERLAY ========== */
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
      `}</style>
    </div>
  );
}