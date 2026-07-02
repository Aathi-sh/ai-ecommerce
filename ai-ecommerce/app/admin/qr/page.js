// app/admin/qr/page.js - COMPLETE FIXED VERSION
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

// Socket.IO client for notifications
import getSocketIOClient from '../../../lib/websocket/socketio-client';

export default function WhatsAppDashboard() {
  // ========== SESSION & COMPANY ==========
  const { data: session, status: sessionStatus } = useSession();
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState('');

  // ========== CORE STATE ==========
  const [qrCode, setQrCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('loading');
  const [statusMessage, setStatusMessage] = useState('Connecting to WhatsApp service...');
  const [connectionError, setConnectionError] = useState(null);

  // ========== WEBSOCKET STATE ==========
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // ========== BOT INFO & STATS ==========
  const [botInfo, setBotInfo] = useState({
    pushname: '',
    platform: '',
    version: '',
    phoneNumber: '',
    connectedSince: null,
    lastActive: null
  });
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

  // ========== UI HELPERS ==========
  const [showQRExpanded, setShowQRExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // ========== SOCKET.IO STATE ==========
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [socketAuthenticated, setSocketAuthenticated] = useState(false);

  // ========== REFS ==========
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const socketClientRef = useRef(null);
  const isMountedRef = useRef(true);
  const initialDataFetchedRef = useRef(false);
  const isConnectingRef = useRef(false); // Prevent multiple connections
  const qrReceivedRef = useRef(false); // Track if QR was received

  // Debounce timers
  const pendingStatsRef = useRef(null);
  const pendingOrdersRef = useRef(null);
  const pendingActivityRef = useRef(null);

  // ========== SAFE STRING UTILITY ==========
  const safeString = (value, defaultValue = '') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object' && value !== null) {
      if (value.companyId && value.status && value.exists !== undefined) return defaultValue;
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    const handleResize = () => setTimeout(checkMobile, 150);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========== ACTIVITY LOG ==========
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
    if (pendingStatsRef.current) clearTimeout(pendingStatsRef.current);
    pendingStatsRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/whatsapp?action=stats&companyId=${companyId}`);
        const data = await res.json();
        if (data.success && data.stats && typeof data.stats === 'object' && !Array.isArray(data.stats) && isMountedRef.current) {
          setStats(prev => ({ ...prev, ...data.stats, lastUpdated: new Date().toISOString() }));
        }
      } catch (error) { /* silent */ }
      pendingStatsRef.current = null;
    }, 500);
  }, [companyId]);

  const debouncedFetchRecentOrders = useCallback(() => {
    if (!companyId) return;
    if (pendingOrdersRef.current) clearTimeout(pendingOrdersRef.current);
    pendingOrdersRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders?limit=5&sortBy=createdAt&sortOrder=desc&companyId=${companyId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && isMountedRef.current) {
          setRecentOrders(data.data);
        } else {
          setRecentOrders([]);
        }
      } catch (error) { /* silent */ }
      pendingOrdersRef.current = null;
    }, 500);
  }, [companyId]);

  const debouncedFetchActivityLog = useCallback(() => {
    if (!companyId) return;
    if (pendingActivityRef.current) clearTimeout(pendingActivityRef.current);
    pendingActivityRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/whatsapp/activity?limit=8&companyId=${companyId}`);
        if (res.status === 404) return;
        const data = await res.json();
        if (data && data.success && Array.isArray(data.activities) && isMountedRef.current) {
          const processed = data.activities.filter(act =>
            !(act && act.companyId && act.status && act.exists !== undefined)
          );
          setActivityLog(prev => {
            const combined = [...processed, ...prev];
            const unique = combined.filter((item, index, self) =>
              index === self.findIndex(t => t.id === item.id)
            );
            return unique.slice(0, 8);
          });
        }
      } catch (error) { /* silent */ }
      pendingActivityRef.current = null;
    }, 500);
  }, [companyId]);

  // ========== FETCH BOT STATUS ==========
  const fetchBotStatus = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/whatsapp?action=status&companyId=${companyId}`);
      const data = await res.json();
      if (data.success && isMountedRef.current) {
        if (data.qr) {
          setQrCode(data.qr);
          qrReceivedRef.current = true;
        }
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
    } catch (error) { /* silent */ }
  }, [companyId]);

  // ========== SOCKET.IO (notifications) ==========
  const initializeSocketIO = useCallback(() => {
    if (!companyId || !session?.user) return;
    try {
      const socketClient = getSocketIOClient();
      socketClientRef.current = socketClient;

      socketClient.addStateListener((newState) => {
        if (isMountedRef.current) setSocketStatus(newState);
      });

      socketClient.addConnectionListener((connected) => {
        if (connected && isMountedRef.current) {
          addToActivityLog('Real-time notifications connected', 'success');
        }
      });

      socketClient.on('authenticated', () => {
        if (isMountedRef.current) {
          setSocketAuthenticated(true);
          addToActivityLog('Real-time notifications authenticated', 'success');
        }
      });

      socketClient.on('unauthorized', () => {
        if (isMountedRef.current) {
          setSocketAuthenticated(false);
          setConnectionError('Notification service authentication failed');
        }
      });

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

  // ========== POLLING FALLBACK FOR QR ==========
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    console.log('⏳ Starting polling fallback for QR...');
    pollingIntervalRef.current = setInterval(async () => {
      if (!companyId) return;
      try {
        const res = await fetch(`/api/whatsapp?action=qr&companyId=${companyId}`);
        const data = await res.json();
        if (data.qr) {
          console.log('📱 QR received via polling');
          setQrCode(data.qr);
          qrReceivedRef.current = true;
          setConnectionStatus('qr_required');
          setStatusMessage('Scan QR code with WhatsApp to connect');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (error) { /* silent */ }
    }, 3000);
  }, [companyId]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // ========== CONNECT WEBSOCKET ==========
  const connectWebSocket = useCallback(() => {
    if (!companyId) return;
    
    // Prevent multiple connection attempts
    if (isConnectingRef.current) {
      console.log('⏳ Connection already in progress, skipping...');
      return;
    }

    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) {}
      wsRef.current = null;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    setConnectionError(null);
    isConnectingRef.current = true;

    try {
      const baseWsUrl = process.env.NEXT_PUBLIC_QR_WS_URL || 'wss://bot.steponextai.tech';
      const wsUrl = `${baseWsUrl}/ws/qr?companyId=${companyId}`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        isConnectingRef.current = false;
        if (isMountedRef.current) {
          setWsConnected(true);
          setConnectionStatus('connected');
          setStatusMessage('Connected to WhatsApp service');
          setConnectionError(null);
          setReconnectAttempts(0);
          
          // Request QR immediately
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              console.log('📤 Requesting QR on connection...');
              wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
              wsRef.current.send(JSON.stringify({ type: 'get_status' }));
              wsRef.current.send(JSON.stringify({ type: 'get_stats' }));
            }
          }, 500);
          
          // Start polling fallback after 5 seconds if no QR received
          setTimeout(() => {
            if (isMountedRef.current && !qrReceivedRef.current) {
              console.log('⏳ No QR received via WebSocket, starting polling fallback...');
              startPolling();
            }
          }, 5000);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data.type || 'unknown');
          
          if (data.companyId && data.companyId !== companyId) return;
          if (!isMountedRef.current) return;

          switch (data.type) {
            case 'qr':
            case 'qr_update':
            case 'qr_response':
              console.log('📱 QR data received:', {
                type: data.type,
                hasQr: !!data.qr,
                qrLength: data.qr?.length || 0,
                source: data.source || 'unknown'
              });
              
              if (data.qr) {
                console.log('📱 Setting QR code in state');
                setQrCode(data.qr);
                qrReceivedRef.current = true;
                setConnectionStatus('qr_required');
                setStatusMessage('Scan QR code with WhatsApp to connect');
                stopPolling();
                addToActivityLog('QR code received - Scan to connect', 'success');
              } else {
                console.log('⚠️ QR response with no QR data');
              }
              break;

            case 'connected':
              console.log('✅ Connected to QR WebSocket');
              if (data.qrData) {
                console.log('📱 QR data in welcome message');
                setQrCode(data.qrData);
                qrReceivedRef.current = true;
                setConnectionStatus('qr_required');
                setStatusMessage('Scan QR code with WhatsApp to connect');
                stopPolling();
              }
              if (data.status === 'qr_required' && data.qrData) {
                setQrCode(data.qrData);
                qrReceivedRef.current = true;
                setConnectionStatus('qr_required');
                setStatusMessage('Scan QR code with WhatsApp to connect');
                stopPolling();
              }
              break;

            case 'status':
            case 'status_update':
              console.log('📊 Status update:', data);
              if (data.status) setConnectionStatus(safeString(data.status, 'disconnected'));
              if (data.message) setStatusMessage(safeString(data.message, 'WhatsApp service'));
              if (data.qr) {
                console.log('📱 QR in status message');
                setQrCode(data.qr);
                qrReceivedRef.current = true;
                stopPolling();
              }
              if (data.connected !== undefined) {
                setConnectionStatus(data.connected ? 'connected' : 'disconnected');
              }
              if (data.status === 'disconnected' || data.status === 'logged_out' || data.status === 'logout') {
                setQrCode(null);
                qrReceivedRef.current = false;
                setConnectionStatus('disconnected');
                setStatusMessage('Logged out successfully');
                stopPolling();
              }
              if (data.authenticated && data.connected) {
                setConnectionStatus('connected');
                setStatusMessage('WhatsApp is connected and ready');
                setQrCode(null);
                qrReceivedRef.current = false;
                stopPolling();
                addToActivityLog('WhatsApp connected successfully', 'success');
              }
              break;

            case 'stats':
            case 'stats_update':
              if (data.stats && typeof data.stats === 'object' && !Array.isArray(data.stats)) {
                setStats(prev => ({ ...prev, ...data.stats, lastUpdated: new Date().toISOString() }));
              }
              break;

            case 'bot_connected':
              setConnectionStatus('connected');
              setStatusMessage('WhatsApp is connected and ready');
              setQrCode(null);
              qrReceivedRef.current = false;
              stopPolling();
              addToActivityLog('WhatsApp connected successfully', 'success');
              break;

            case 'bot_disconnected':
              setConnectionStatus('disconnected');
              setStatusMessage(`Disconnected: ${safeString(data.reason, 'Unknown reason')}`);
              setQrCode(null);
              qrReceivedRef.current = false;
              stopPolling();
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

            default:
              if (data.qr) {
                console.log('📱 QR found in unknown message type');
                setQrCode(data.qr);
                qrReceivedRef.current = true;
                setConnectionStatus('qr_required');
                setStatusMessage('Scan QR code with WhatsApp to connect');
                stopPolling();
              }
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error.message);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        isConnectingRef.current = false;
        if (isMountedRef.current) {
          setWsConnected(false);
        }
        if (event.code !== 1000 && !reconnectTimerRef.current && isMountedRef.current) {
          setConnectionError('Connection lost. Reconnecting...');
          const delay = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 30000);
          setReconnectAttempts(prev => prev + 1);
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            if (isMountedRef.current) connectWebSocket();
          }, delay);
        }
        if (!qrReceivedRef.current && isMountedRef.current) {
          startPolling();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        isConnectingRef.current = false;
        if (isMountedRef.current) {
          setConnectionError('Failed to connect to WhatsApp service');
          if (!qrReceivedRef.current) {
            startPolling();
          }
        }
        fetchBotStatus();
      };

    } catch (error) {
      console.error('WebSocket setup error:', error);
      isConnectingRef.current = false;
      if (isMountedRef.current) {
        setConnectionError('Failed to initialize connection');
        if (!qrReceivedRef.current) {
          startPolling();
        }
      }
      fetchBotStatus();
    }
  }, [companyId, fetchBotStatus, addToActivityLog, debouncedFetchRecentOrders, debouncedFetchStats, startPolling, stopPolling]);

  // ========== WEBSOCKET PING ==========
  useEffect(() => {
    if (!wsRef.current || !wsConnected) return;
    const ping = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
    pingIntervalRef.current = ping;
    return () => { clearInterval(ping); };
  }, [wsConnected]);

  // ========== CLEAR QR CACHE ON SERVER ==========
  const clearQRCache = useCallback(async () => {
    if (!companyId) return;
    try {
      const response = await fetch(`/api/clear-qr-cache?companyId=${companyId}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        console.warn('QR cache clear endpoint returned:', response.status);
      }
    } catch (error) {
      console.warn('Could not clear QR cache:', error.message);
    }
  }, [companyId]);

  // ========== FETCH QR DIRECTLY ==========
  const fetchQRDirectly = useCallback(async () => {
    if (!companyId) return false;
    
    try {
      console.log('📤 Fetching QR directly from API...');
      const response = await fetch(`http://localhost:3001/api/qr?companyId=${companyId}`);
      const data = await response.json();
      
      if (data.success && data.qr) {
        console.log('✅ QR fetched directly from API');
        setQrCode(data.qr);
        qrReceivedRef.current = true;
        setConnectionStatus('qr_required');
        setStatusMessage('Scan QR code with WhatsApp to connect');
        stopPolling();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Direct QR fetch failed:', error.message);
      return false;
    }
  }, [companyId, stopPolling]);

  // ========== BOT ACTIONS ==========
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
      // Handle connect action specially
      if (action === 'connect') {
        // Clear existing QR
        await clearQRCache();
        setQrCode(null);
        qrReceivedRef.current = false;
        setConnectionStatus('loading');
        setStatusMessage('Connecting to WhatsApp...');
        
        // Call connect API
        const response = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, companyId })
        });
        const data = await response.json();
        console.log('📡 Connect response:', data);
        
        if (data.success) {
          setStatusMessage('Connection initiated. Waiting for QR code...');
          addToActivityLog('WhatsApp connection initiated', 'info');
          
          // Request QR via WebSocket
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
            }
            fetchBotStatus();
          }, 1000);
          
          // Start polling fallback
          setTimeout(() => {
            if (!qrReceivedRef.current) {
              console.log('⏳ No QR yet, starting polling fallback...');
              startPolling();
            }
          }, 3000);
          
          // Force QR via force endpoint as fallback
          setTimeout(async () => {
            if (!qrReceivedRef.current) {
              console.log('🔧 Attempting force QR generation...');
              try {
                const forceResponse = await fetch(`http://localhost:3001/api/force-qr?companyId=${companyId}`, {
                  method: 'POST'
                });
                const forceData = await forceResponse.json();
                console.log('Force QR response:', forceData);
                
                if (forceData.success && forceData.hasQR) {
                  // Request QR again after force generation
                  setTimeout(() => {
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                      wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
                    }
                    fetchQRDirectly();
                  }, 1000);
                }
              } catch (error) {
                console.warn('Force QR failed:', error.message);
              }
            }
          }, 5000);
          
          // Final fallback: direct fetch
          setTimeout(async () => {
            if (!qrReceivedRef.current) {
              console.log('📤 Final attempt: direct QR fetch...');
              await fetchQRDirectly();
            }
          }, 8000);
        } else {
          setConnectionError(data.error || 'Connection failed');
          setStatusMessage('Connection failed. Please try again.');
        }
        
        setIsLoading(false);
        setLoadingAction(null);
        return;
      }

      // Handle other actions
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, companyId })
      });
      const data = await response.json();
      console.log('📡 Action response:', action, data);
      
      if (data.success) {
        if (action === 'disconnect') {
          setStatusMessage('WhatsApp disconnected');
          setConnectionStatus('disconnected');
          setQrCode(null);
          qrReceivedRef.current = false;
          addToActivityLog('WhatsApp disconnected', 'warning');
          stopPolling();
        } else if (action === 'restart') {
          setStatusMessage('WhatsApp service restarted');
          addToActivityLog('WhatsApp restarted', 'info');
          setQrCode(null);
          qrReceivedRef.current = false;
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
            }
            fetchBotStatus();
          }, 2000);
        } else if (action === 'logout') {
          setStatusMessage('Logged out successfully');
          setConnectionStatus('disconnected');
          setQrCode(null);
          qrReceivedRef.current = false;
          addToActivityLog('Logged out', 'warning');
          if (wsRef.current) {
            try { wsRef.current.close(); } catch (e) {}
            wsRef.current = null;
          }
          stopPolling();
          await clearQRCache();
          setTimeout(() => connectWebSocket(), 1000);
        } else if (action === 'refresh-qr') {
          setStatusMessage('Generating new QR code...');
          addToActivityLog('Requested new QR code', 'info');
          setQrCode(null);
          qrReceivedRef.current = false;
          await clearQRCache();
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
            } else {
              fetchBotStatus();
            }
          }, 500);
        }
        if (action !== 'logout' && action !== 'disconnect' && action !== 'connect') {
          await fetchBotStatus();
          debouncedFetchStats();
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

  // ========== REQUEST QR ==========
  const requestQRCode = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
    } else {
      handleBotAction('refresh-qr');
    }
  }, [handleBotAction]);

  // ========== SEND TEST MESSAGE ==========
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
        body: JSON.stringify({ action: 'send_message', companyId, to: phoneNumber, message })
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

  // ========== INITIALIZATION ==========
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
      
      // Try to fetch QR directly on load
      setTimeout(() => {
        fetchQRDirectly();
      }, 2000);
    }
    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (pendingStatsRef.current) clearTimeout(pendingStatsRef.current);
      if (pendingOrdersRef.current) clearTimeout(pendingOrdersRef.current);
      if (pendingActivityRef.current) clearTimeout(pendingActivityRef.current);
      if (socketClientRef.current) socketClientRef.current.disconnect('Component unmount');
      if (wsRef.current) { try { wsRef.current.close(); } catch(e) {} }
    };
  }, [companyId, session, connectWebSocket, initializeSocketIO, fetchBotStatus, debouncedFetchStats, debouncedFetchRecentOrders, debouncedFetchActivityLog, requestNotificationPermission, fetchQRDirectly]);

  // ========== PERIODIC REFRESH ==========
  useEffect(() => {
    if (!companyId || !initialDataFetchedRef.current) return;
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        debouncedFetchStats();
        debouncedFetchRecentOrders();
        debouncedFetchActivityLog();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [companyId, debouncedFetchStats, debouncedFetchRecentOrders, debouncedFetchActivityLog]);

  // ========== UTILITY FORMATS ==========
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
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
    } catch { return 'N/A'; }
  };

  // ========== RENDER ACTIVITY LOG ==========
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
      .filter(log => !(log && log.companyId && log.status && log.exists !== undefined))
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
      case 'connected': return { color: '#10b981', text: 'Connected', icon: 'wifi' };
      case 'qr_required': return { color: '#f59e0b', text: 'QR Required', icon: 'smartphone' };
      case 'loading': return { color: '#3b82f6', text: 'Connecting', icon: 'loader' };
      case 'disconnected': return { color: '#ef4444', text: 'Disconnected', icon: 'wifi-off' };
      default: return { color: '#6b7280', text: status, icon: 'alert' };
    }
  };
  const statusConfig = getStatusConfig();

  // ========== STAT CARDS ==========
  const statCards = [
    { title: 'Total Orders', value: formatNumber(stats.totalOrders), change: stats.ordersGrowth > 0 ? `+${stats.ordersGrowth}%` : `${stats.ordersGrowth}%`, icon: Package, color: '#3b82f6', trend: stats.ordersGrowth > 0 ? 'up' : 'down' },
    { title: 'Revenue', value: formatCurrency(stats.revenue), change: stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}%` : `${stats.revenueGrowth}%`, icon: DollarSign, color: '#10b981', trend: stats.revenueGrowth > 0 ? 'up' : 'down' },
    { title: 'Customers', value: formatNumber(stats.totalCustomers), change: stats.customersGrowth > 0 ? `+${stats.customersGrowth}%` : `${stats.customersGrowth}%`, icon: Users, color: '#8b5cf6', trend: stats.customersGrowth > 0 ? 'up' : 'down' },
    { title: 'Messages', value: formatNumber(stats.totalMessages), change: `${Math.round((stats.totalMessages / (stats.totalCustomers || 1)) * 10) / 10}/cust`, icon: MessageSquare, color: '#f59e0b', trend: 'neutral' },
    { title: 'Active Chats', value: stats.activeChats, change: stats.activeChats > 0 ? 'Active' : 'Inactive', icon: Activity, color: '#ef4444', trend: stats.activeChats > 0 ? 'up' : 'down' },
    { title: 'Pending', value: stats.pendingOrders, change: `${Math.round((stats.pendingOrders / (stats.totalOrders || 1)) * 100)}%`, icon: Clock, color: '#f59e0b', trend: 'neutral' }
  ];

  // ========== RENDER ==========
  return (
    <div className={`dashboard-container ${isMobile ? 'mobile' : ''}`}>
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
                <span className={`stat-change trend-${stat.trend}`}>{safeString(stat.change, '0%')}</span>
              </div>
              <p className="stat-label">{safeString(stat.title, 'Stat')}</p>
              <p className="stat-value">{safeString(stat.value, '0')}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        <div className="left-column">
          <div className="card">
            <div className="card-header">
              <div>
                <h2>WhatsApp Connection</h2>
                <p className="card-subtitle">{safeString(statusMessage, 'WhatsApp service')}</p>
              </div>
              <div className="action-buttons">
                <button onClick={() => handleBotAction('restart')} disabled={isLoading} className="action-button restart">
                  <RefreshCw size={isMobile ? 14 : 16} /> {!isMobile && <span>Restart</span>}
                </button>
                <button onClick={() => handleBotAction('logout', 'Logout from WhatsApp?')} disabled={isLoading} className="action-button logout">
                  <LogOut size={isMobile ? 14 : 16} /> {!isMobile && <span>Logout</span>}
                </button>
                {connectionStatus === 'connected' ? (
                  <button onClick={() => handleBotAction('disconnect')} disabled={isLoading} className="action-button disconnect">
                    <Power size={isMobile ? 14 : 16} /> {!isMobile && <span>Disconnect</span>}
                  </button>
                ) : (
                  <button onClick={() => handleBotAction('connect')} disabled={isLoading} className="action-button connect">
                    <Wifi size={isMobile ? 14 : 16} /> {!isMobile && <span>Connect</span>}
                  </button>
                )}
              </div>
            </div>

            <div className="qr-section">
              {qrCode ? (
                <div className="qr-container">
                  <button onClick={() => setShowQRExpanded(!showQRExpanded)} className="qr-wrapper">
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
                    ) : connectionStatus === 'disconnected' ? (
                      <WifiOff size={isMobile ? 32 : 40} color="#ef4444" />
                    ) : (
                      <CheckCircle size={isMobile ? 32 : 40} color="#10b981" />
                    )}
                  </div>
                  <h3>
                    {connectionStatus === 'loading' ? 'Connecting...' : 
                     connectionStatus === 'disconnected' ? 'Disconnected' :
                     'WhatsApp is ' + connectionStatus}
                  </h3>
                  <p>
                    {connectionStatus === 'loading' ? 'Establishing connection...' : 
                     connectionStatus === 'disconnected' ? 'Click "Connect" to start' :
                     'Your WhatsApp business account is ready'}
                  </p>
                  {botInfo.phoneNumber && (
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
                  )}
                </div>
              )}
            </div>
          </div>

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

        <div className="right-column">
          <div className="card">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <button onClick={sendTestMessage} disabled={connectionStatus !== 'connected' || isLoading} className="quick-action">
                <Send size={isMobile ? 18 : 20} color="#3b82f6" />
                <span>Send Message</span>
              </button>
              <button onClick={requestQRCode} disabled={isLoading} className="quick-action">
                <RefreshCw size={isMobile ? 18 : 20} color="#10b981" />
                <span>Refresh QR</span>
              </button>
              <button onClick={() => window.open(`/api/whatsapp/export?companyId=${companyId}`, '_blank')} className="quick-action">
                <Download size={isMobile ? 18 : 20} color="#8b5cf6" />
                <span>Export</span>
              </button>
              <button onClick={() => window.location.href = '/admin/analytics'} className="quick-action">
                <BarChart3 size={isMobile ? 18 : 20} color="#f59e0b" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h2>Recent Activity</h2>
            <div className="activity-log">
              {renderActivityLog()}
            </div>
          </div>

          <button onClick={sendTestMessage} disabled={connectionStatus !== 'connected' || isLoading} className="test-message-button">
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
        .spin { animation: spin 1s linear infinite; }

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
        .dashboard-container.mobile { padding: 16px; }

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
        .title-bar {
          width: 4px;
          height: 28px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }
        .title-wrapper h1 {
          color: #1e293b;
          font-weight: 700;
          font-size: 1.75rem;
          margin: 0;
          line-height: 1.2;
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
        .dashboard-container.mobile .subtitle { font-size: 0.85rem; }

        /* ========== STATUS BADGES ========== */
        .status-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dashboard-container.mobile .status-wrapper { gap: 8px; }

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
        .error-badge span {
          color: #ef4444;
          font-size: 13px;
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
        .status-qr_required .status-dot { background-color: #f59e0b; }
        .status-loading .status-dot { background-color: #3b82f6; }
        .status-disconnected .status-dot { background-color: #ef4444; }
        .time-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background-color: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f040;
        }
        .time-badge span {
          font-size: 13px;
          color: #6b7280;
        }

        /* ========== STATS GRID ========== */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
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
        .stat-change {
          font-size: 11px;
          font-weight: 600;
        }
        .stat-change.trend-up { color: #10b981; }
        .stat-change.trend-down { color: #ef4444; }
        .stat-change.trend-neutral { color: #6b7280; }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 2px 0;
        }
        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
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

        /* ========== CARDS ========== */
        .card {
          background-color: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f030;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        .card-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f030;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .card-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        .card-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        /* ========== ACTION BUTTONS ========== */
        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
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
        .qr-background {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 16px;
          border: 2px dashed #3b82f640;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }
        .qr-background.expanded { padding: 20px; }
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
        .qr-container h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 16px 0;
        }
        .qr-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: 100%;
          max-width: 400px;
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
        .qr-step span {
          font-size: 10px;
          color: #64748b;
          text-align: center;
        }

        /* ========== CONNECTED STATE ========== */
        .connected-state {
          text-align: center;
          padding: 24px;
        }
        .connected-icon { margin-bottom: 16px; }
        .connected-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }
        .connected-state p {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 20px 0;
        }
        .bot-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 300px;
          margin: 0 auto;
        }
        .bot-info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #f8fafc;
          padding: 10px;
          border-radius: 8px;
        }
        .bot-info-item span {
          font-size: 13px;
          color: #1e293b;
          font-weight: 500;
        }

        /* ========== BOT INFO CARDS ========== */
        .bot-info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
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
        .bot-info-card .label {
          font-size: 11px;
          color: #64748b;
          margin: 0 0 2px 0;
        }
        .bot-info-card .value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
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
        .orders-list { padding: 4px 0; }
        .order-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid #e2e8f020;
          transition: background-color 0.2s ease;
          cursor: pointer;
        }
        .order-item:hover { background-color: #f8fafc; }
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
        .order-icon.status-completed { background-color: #10b98120; }
        .order-icon.status-pending { background-color: #f59e0b20; }
        .order-icon.status-processing { background-color: #3b82f620; }
        .order-icon.status-default { background-color: #6b728020; }
        .order-number {
          font-size: 15px;
          font-weight: 500;
          color: #1e293b;
          margin: 0 0 2px 0;
        }
        .order-customer {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .order-right { text-align: right; }
        .order-amount {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 2px 0;
        }
        .order-time {
          font-size: 11px;
          color: #64748b;
          margin: 0;
        }

        /* ========== EMPTY STATE ========== */
        .empty-state {
          padding: 40px 24px;
          text-align: center;
        }
        .empty-state svg { color: #d1d5db; }
        .empty-state p {
          font-size: 14px;
          color: #64748b;
          margin: 12px 0 0 0;
        }

        /* ========== QUICK ACTIONS ========== */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 16px 20px 20px;
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
        .quick-action:hover { border-color: #3b82f6; }
        .quick-action span {
          font-size: 12px;
          font-weight: 500;
          color: #1e293b;
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
        .activity-time {
          font-size: 11px;
          color: #64748b;
          margin-left: 12px;
          white-space: nowrap;
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
        .test-message-button:hover { border-color: #3b82f6; }
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
        .test-message-content .subtitle {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin: 0;
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