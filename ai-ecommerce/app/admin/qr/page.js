


// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { QRCodeSVG } from 'qrcode.react';
// import { 
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
// } from 'recharts';
// import { 
//   Wifi, WifiOff, Smartphone, LogOut, RefreshCw, Power, 
//   MessageSquare, Package, Users, BarChart3, Activity,
//   Shield, Server, Clock, CheckCircle, AlertCircle
// } from 'lucide-react';

// export default function WhatsAppDashboard() {
//   // State management
//   const [qrCode, setQrCode] = useState(null);
//   const [status, setStatus] = useState('loading');
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
//     lastUpdated: ''
//   });
//   const [botInfo, setBotInfo] = useState({
//     pushname: '',
//     platform: '',
//     version: '',
//     phoneNumber: '',
//     connectedSince: ''
//   });
//   const [activityLog, setActivityLog] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [wsConnected, setWsConnected] = useState(false);
//   const [reconnectCount, setReconnectCount] = useState(0);
//   const [wsStatus, setWsStatus] = useState('disconnected');
  
//   const wsRef = useRef(null);
//   const reconnectTimerRef = useRef(null);
//   const statsIntervalRef = useRef(null);
//   const pingIntervalRef = useRef(null);

//   // Add activity log entry
//   const addToActivityLog = useCallback((message, type = 'info') => {
//     const entry = {
//       id: Date.now(),
//       message,
//       type,
//       timestamp: new Date().toLocaleTimeString(),
//       date: new Date().toLocaleDateString()
//     };
    
//     setActivityLog(prev => [entry, ...prev.slice(0, 19)]);
//   }, []);

//   // SAFE WebSocket connection
//   const connectWebSocket = useCallback(() => {
//     // Clean up existing connection
//     if (wsRef.current) {
//       try {
//         if (wsRef.current.readyState === WebSocket.OPEN || 
//             wsRef.current.readyState === WebSocket.CONNECTING) {
//           wsRef.current.close();
//         }
//       } catch (error) {
//         console.log('⚠️ Error closing previous WebSocket:', error.message);
//       }
//       wsRef.current = null;
//     }
    
//     if (reconnectTimerRef.current) {
//       clearTimeout(reconnectTimerRef.current);
//     }
    
//     if (pingIntervalRef.current) {
//       clearInterval(pingIntervalRef.current);
//     }
    
//     try {
//       // IMPORTANT: Use the correct WebSocket URL for QR socket
//       const wsUrl = process.env.NEXT_PUBLIC_QR_WS_URL || 'ws://localhost:3001/ws/qr';
//       console.log('🔗 Connecting to QR WebSocket:', wsUrl);
//       setWsStatus('connecting');
//       addToActivityLog(`Connecting to WebSocket: ${wsUrl}`, 'info');
      
//       wsRef.current = new WebSocket(wsUrl);
      
//       wsRef.current.onopen = () => {
//         console.log('✅ QR WebSocket connected successfully');
//         setWsConnected(true);
//         setWsStatus('connected');
//         setReconnectCount(0);
//         addToActivityLog('WebSocket connected', 'success');
        
//         // Send initial identification
//         setTimeout(() => {
//           if (wsRef.current?.readyState === WebSocket.OPEN) {
//             try {
//               wsRef.current.send(JSON.stringify({ 
//                 type: 'identify', 
//                 clientName: 'Admin Dashboard' 
//               }));
//             } catch (error) {
//               console.log('❌ Error sending identification:', error.message);
//             }
//           }
//         }, 500);
        
//         // Start ping interval
//         pingIntervalRef.current = setInterval(() => {
//           if (wsRef.current?.readyState === WebSocket.OPEN) {
//             try {
//               wsRef.current.send(JSON.stringify({ type: 'ping' }));
//             } catch (error) {
//               console.log('❌ Error sending ping:', error.message);
//             }
//           }
//         }, 25000);
//       };
      
//       wsRef.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
          
//           if (data.type === 'connected' && data.endpoint === 'qr') {
//             console.log('✅ Connected to QR WebSocket endpoint');
//             addToActivityLog('Connected to QR WebSocket service', 'success');
            
//             // Request initial status
//             if (wsRef.current?.readyState === WebSocket.OPEN) {
//               setTimeout(() => {
//                 try {
//                   wsRef.current.send(JSON.stringify({ type: 'get_status' }));
//                   wsRef.current.send(JSON.stringify({ type: 'get_stats' }));
//                 } catch (error) {
//                   console.log('❌ Error requesting initial data:', error.message);
//                 }
//               }, 1000);
//             }
//           }
          
//           switch (data.type) {
//             case 'qr':
//             case 'qr_update':
//               if (data.qr) {
//                 setQrCode(data.qr);
//                 setStatus('qr_required');
//                 setStatusMessage('Scan QR code with WhatsApp to connect');
//                 addToActivityLog('QR code generated', 'info');
//               }
//               break;
              
//             case 'qr_response':
//               if (data.qr) {
//                 setQrCode(data.qr);
//                 setStatus('qr_required');
//                 setStatusMessage('Scan QR code with WhatsApp to connect');
//               }
//               break;
              
//             case 'status':
//             case 'status_update':
//               if (data.status) setStatus(data.status);
//               if (data.message) setStatusMessage(data.message);
//               if (data.connected !== undefined) {
//                 setStatus(data.connected ? 'connected' : 'disconnected');
//               }
//               if (data.qr) setQrCode(data.qr);
//               break;
              
//             case 'stats':
//             case 'stats_update':
//               if (data.stats) {
//                 setStats(prev => ({
//                   ...prev,
//                   ...data.stats,
//                   lastUpdated: new Date().toISOString()
//                 }));
//               }
//               break;
              
//             case 'bot_connected':
//               setStatus('connected');
//               setStatusMessage('WhatsApp is connected and ready');
//               setQrCode(null);
//               addToActivityLog('WhatsApp connected successfully', 'success');
//               break;
              
//             case 'bot_disconnected':
//               setStatus('disconnected');
//               setStatusMessage(`Disconnected: ${data.reason || 'Unknown reason'}`);
//               addToActivityLog(`Disconnected: ${data.reason || 'Unknown reason'}`, 'warning');
//               break;
              
//             case 'bot_info':
//               if (data.botInfo) setBotInfo(data.botInfo);
//               break;
              
//             case 'connected':
//               // Initial connection message
//               if (data.botStatus) {
//                 if (data.botStatus.qr) {
//                   setQrCode(data.botStatus.qr);
//                   setStatus('qr_required');
//                 } else if (data.botStatus.connected) {
//                   setStatus('connected');
//                   setQrCode(null);
//                 }
//               }
//               break;
              
//             case 'pong':
//               // Ping response received, connection is alive
//               break;
              
//             case 'error':
//               addToActivityLog(`Error: ${data.message || 'Unknown error'}`, 'error');
//               break;
              
//             case 'identified':
//               console.log('✅ WebSocket identification confirmed:', data.message);
//               break;
              
//             default:
//               console.log('📨 Unknown WebSocket message type:', data.type);
//           }
//         } catch (error) {
//           console.error('❌ Error parsing WebSocket message:', error);
//           addToActivityLog('Error parsing WebSocket message', 'error');
//         }
//       };
      
//       wsRef.current.onclose = (event) => {
//         console.log('🔌 QR WebSocket disconnected:', {
//           code: event.code,
//           reason: event.reason,
//           wasClean: event.wasClean
//         });
        
//         setWsConnected(false);
//         setWsStatus('disconnected');
        
//         if (event.code !== 1000) { // Not a normal closure
//           addToActivityLog(`WebSocket disconnected: ${event.reason || 'Code ' + event.code}`, 'warning');
//         }
        
//         // Clean up ping interval
//         if (pingIntervalRef.current) {
//           clearInterval(pingIntervalRef.current);
//           pingIntervalRef.current = null;
//         }
        
//         // Auto-reconnect with exponential backoff (except for normal closures)
//         if (event.code !== 1000 && reconnectCount < 10) {
//           const delay = Math.min(3000 * Math.pow(1.5, reconnectCount), 30000);
//           const nextAttempt = reconnectCount + 1;
          
//           console.log(`🔄 Reconnecting in ${delay/1000} seconds... (Attempt ${nextAttempt})`);
          
//           reconnectTimerRef.current = setTimeout(() => {
//             console.log('🔄 Attempting WebSocket reconnection...');
//             connectWebSocket();
//           }, delay);
          
//           setReconnectCount(nextAttempt);
//         } else if (event.code === 1000) {
//           console.log('🛑 Normal WebSocket closure, not reconnecting');
//           addToActivityLog('WebSocket connection closed normally', 'info');
//         }
//       };
      
//       wsRef.current.onerror = (error) => {
//         // SAFE error handling - don't try to access error object properties
//         console.log('⚠️ WebSocket error occurred');
//         setWsConnected(false);
//         setWsStatus('error');
//       };
      
//     } catch (error) {
//       console.error('❌ WebSocket setup failed:', error.message);
//       setWsConnected(false);
//       setWsStatus('error');
//       addToActivityLog('WebSocket setup failed', 'error');
      
//       // Retry after 10 seconds
//       reconnectTimerRef.current = setTimeout(() => {
//         connectWebSocket();
//       }, 10000);
//     }
//   }, [reconnectCount, addToActivityLog]);

//   // Fetch bot status from API
//   const fetchBotStatus = useCallback(async () => {
//     try {
//       const response = await fetch('/api/whatsapp?action=status');
//       const data = await response.json();
      
//       if (data.success) {
//         if (data.qr) setQrCode(data.qr);
//         if (data.status) setStatus(data.status);
//         if (data.message) setStatusMessage(data.message);
//         if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
//         if (data.botInfo) setBotInfo(data.botInfo);
//       } else {
//         console.error('❌ API returned error:', data.error);
//         addToActivityLog(`API error: ${data.error}`, 'error');
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch bot status:', error);
//       addToActivityLog('Failed to fetch bot status', 'error');
//     }
//   }, [addToActivityLog]);

//   // Request QR code via WebSocket
//   const requestQRCode = useCallback(() => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       try {
//         wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
//         addToActivityLog('Requested QR code refresh', 'info');
//       } catch (error) {
//         console.log('❌ Error requesting QR code:', error.message);
//       }
//     } else {
//       // Fallback to API
//       fetchBotStatus();
//     }
//   }, [fetchBotStatus, addToActivityLog]);

//   // Bot control functions
//   const handleBotAction = async (action, confirmMessage = null) => {
//     if (confirmMessage && !window.confirm(confirmMessage)) {
//       return;
//     }
    
//     setIsLoading(true);
//     addToActivityLog(`Starting action: ${action}`, 'info');
    
//     try {
//       const response = await fetch('/api/whatsapp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         addToActivityLog(`Action "${action}" completed successfully`, 'success');
        
//         // Refresh status after action
//         setTimeout(() => {
//           fetchBotStatus();
//         }, 2000);
        
//         // Request updated status via WebSocket
//         if (wsRef.current?.readyState === WebSocket.OPEN) {
//           setTimeout(() => {
//             try {
//               wsRef.current.send(JSON.stringify({ type: 'get_status' }));
//             } catch (error) {
//               console.log('❌ Error requesting status update:', error.message);
//             }
//           }, 1500);
//         }
//       } else {
//         addToActivityLog(`Action "${action}" failed: ${data.error}`, 'error');
//       }
//     } catch (error) {
//       console.error(`❌ ${action} error:`, error);
//       addToActivityLog(`Action "${action}" failed: ${error.message}`, 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const sendTestMessage = async () => {
//     const phoneNumber = prompt('Enter phone number (with country code, e.g., 919876543210):');
//     if (!phoneNumber) {
//       addToActivityLog('Test message cancelled: No phone number provided', 'warning');
//       return;
//     }
    
//     const message = prompt('Enter message:');
//     if (!message) {
//       addToActivityLog('Test message cancelled: No message provided', 'warning');
//       return;
//     }
    
//     setIsLoading(true);
//     addToActivityLog(`Sending test message to ${phoneNumber}`, 'info');
    
//     try {
//       const response = await fetch('/api/whatsapp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           action: 'send_message',
//           to: phoneNumber,
//           message 
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         addToActivityLog(`Test message sent to ${phoneNumber}`, 'success');
//         alert('✅ Message sent successfully!');
//       } else {
//         addToActivityLog(`Failed to send test message: ${data.error}`, 'error');
//         alert(`❌ Failed to send message: ${data.error}`);
//       }
//     } catch (error) {
//       console.error('❌ Send message error:', error);
//       addToActivityLog('Failed to send test message', 'error');
//       alert('❌ Failed to send message. Check console for details.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Get status color and icon
//   const getStatusConfig = () => {
//     switch (status) {
//       case 'connected':
//         return { 
//           color: 'bg-green-500', 
//           icon: <Wifi className="w-5 h-5" />,
//           text: 'Connected',
//           textColor: 'text-green-600'
//         };
//       case 'qr_required':
//         return { 
//           color: 'bg-yellow-500', 
//           icon: <Smartphone className="w-5 h-5" />,
//           text: 'QR Required',
//           textColor: 'text-yellow-600'
//         };
//       case 'loading':
//       case 'connecting':
//         return { 
//           color: 'bg-blue-500', 
//           icon: <Activity className="w-5 h-5 animate-spin" />,
//           text: 'Connecting',
//           textColor: 'text-blue-600'
//         };
//       case 'disconnected':
//         return { 
//           color: 'bg-red-500', 
//           icon: <WifiOff className="w-5 h-5" />,
//           text: 'Disconnected',
//           textColor: 'text-red-600'
//         };
//       default:
//         return { 
//           color: 'bg-gray-500', 
//           icon: <Server className="w-5 h-5" />,
//           text: status,
//           textColor: 'text-gray-600'
//         };
//     }
//   };

//   // Chart data
//   const ordersData = [
//     { name: 'Total', value: stats.totalOrders, color: '#3b82f6' },
//     { name: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
//     { name: 'Completed', value: stats.completedOrders, color: '#10b981' }
//   ];

//   const messagesData = [
//     { name: 'Messages', value: stats.totalMessages, color: '#8b5cf6' },
//     { name: 'Chats', value: stats.totalChats, color: '#ef4444' },
//     { name: 'Customers', value: stats.totalCustomers, color: '#06b6d4' }
//   ];

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Never';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleTimeString();
//     } catch {
//       return 'Invalid date';
//     }
//   };

//   // Initialize
//   useEffect(() => {
//     // Start WebSocket connection with a delay
//     const wsTimeout = setTimeout(() => {
//       connectWebSocket();
//     }, 1000);
    
//     // Fetch initial status via API
//     fetchBotStatus();
    
//     // Set up fallback polling (every 30 seconds)
//     statsIntervalRef.current = setInterval(fetchBotStatus, 30000);
    
//     return () => {
//       clearTimeout(wsTimeout);
      
//       // Clean up WebSocket
//       if (wsRef.current) {
//         try {
//           if (wsRef.current.readyState === WebSocket.OPEN || 
//               wsRef.current.readyState === WebSocket.CONNECTING) {
//             wsRef.current.close(1000, 'Component unmounting');
//           }
//         } catch (error) {
//           console.log('⚠️ Error closing WebSocket on unmount:', error.message);
//         }
//         wsRef.current = null;
//       }
      
//       // Clean up timers
//       if (reconnectTimerRef.current) {
//         clearTimeout(reconnectTimerRef.current);
//       }
      
//       if (statsIntervalRef.current) {
//         clearInterval(statsIntervalRef.current);
//       }
      
//       if (pingIntervalRef.current) {
//         clearInterval(pingIntervalRef.current);
//       }
//     };
//   }, [connectWebSocket, fetchBotStatus]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 WhatsApp Business Dashboard
//               </h1>
//               <p className="text-gray-600">
//                 Manage your WhatsApp e-commerce bot with real-time monitoring
//               </p>
//             </div>
            
//             {/* Status Badge */}
//             <div className="flex items-center gap-3">
//               <div className={`w-3 h-3 rounded-full ${getStatusConfig().color} animate-pulse`}></div>
//               <div className="flex items-center gap-2">
//                 {getStatusConfig().icon}
//                 <span className={`font-semibold ${getStatusConfig().textColor}`}>
//                   {getStatusConfig().text}
//                 </span>
//               </div>
//               <div className={`px-3 py-1 rounded-full ${wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-sm font-medium`}>
//                 {wsConnected ? 'Live WS' : 'No WS'}
//               </div>
//               {reconnectCount > 0 && (
//                 <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
//                   Retry: {reconnectCount}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Connection Status Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900 mb-1">QR WebSocket Connection</h2>
//               <p className="text-gray-600">
//                 {wsConnected ? 'Connected to real-time service' : 'Connecting to WebSocket...'}
//               </p>
//               <p className="text-sm text-gray-500 mt-1">
//                 Endpoint: ws://localhost:3001/ws/qr
//               </p>
//             </div>
            
//             <div className="flex gap-2 mt-4 md:mt-0">
//               <button
//                 onClick={requestQRCode}
//                 disabled={!wsConnected || isLoading}
//                 className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh QR
//               </button>
              
//               <button
//                 onClick={() => fetchBotStatus()}
//                 disabled={isLoading}
//                 className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 API Refresh
//               </button>
//             </div>
//           </div>
          
//           {!wsConnected && (
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
//               <div className="flex items-center gap-3">
//                 <AlertCircle className="w-5 h-5 text-amber-600" />
//                 <div>
//                   <p className="text-amber-800 font-medium">WebSocket Disconnected</p>
//                   <p className="text-amber-700 text-sm">
//                     Real-time updates are disabled. Using fallback polling every 30 seconds.
//                     {reconnectCount > 0 && ` Reconnection attempts: ${reconnectCount}`}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Main Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Left Column - Connection & QR */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Connection Card */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//               <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Connection</h2>
//                   <p className="text-gray-600">{statusMessage}</p>
//                 </div>
                
//                 {/* Control Buttons */}
//                 <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
//                   <button
//                     onClick={() => handleBotAction('restart')}
//                     disabled={isLoading}
//                     className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <RefreshCw className="w-4 h-4" />
//                     Restart Bot
//                   </button>
                  
//                   <button
//                     onClick={() => handleBotAction('logout', 'Are you sure you want to logout? This will clear the session and require QR scan.')}
//                     disabled={isLoading}
//                     className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     Logout
//                   </button>
                  
//                   {status === 'connected' ? (
//                     <button
//                       onClick={() => handleBotAction('disconnect')}
//                       disabled={isLoading}
//                       className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <Power className="w-4 h-4" />
//                       Disconnect
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => handleBotAction('connect')}
//                       disabled={isLoading}
//                       className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <Wifi className="w-4 h-4" />
//                       Connect
//                     </button>
//                   )}
//                 </div>
//               </div>
              
//               {/* QR Code Display */}
//               {qrCode ? (
//                 <div className="text-center">
//                   <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 mb-6">
//                     <div className="bg-white p-6 rounded-xl shadow-inner">
//                       <QRCodeSVG 
//                         value={qrCode} 
//                         size={280}
//                         level="H"
//                         includeMargin={true}
//                         className="mx-auto"
//                       />
//                     </div>
//                   </div>
                  
//                   <h3 className="text-xl font-semibold text-gray-800 mb-4">
//                     Scan QR Code with WhatsApp
//                   </h3>
                  
//                   <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto border border-blue-100">
//                     <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
//                       <Shield className="w-5 h-5" />
//                       Connection Instructions
//                     </h4>
//                     <ol className="space-y-3 text-left">
//                       {[
//                         'Open WhatsApp on your phone',
//                         'Go to Settings → Linked Devices',
//                         'Tap "Link a Device"',
//                         'Scan the QR code above'
//                       ].map((step, index) => (
//                         <li key={index} className="flex items-center gap-3">
//                           <div className="bg-blue-100 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
//                             {index + 1}
//                           </div>
//                           <span className="text-blue-700">{step}</span>
//                         </li>
//                       ))}
//                     </ol>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
//                     <CheckCircle className="w-12 h-12 text-green-600" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                     WhatsApp is Connected
//                   </h3>
//                   <p className="text-gray-600 max-w-md mx-auto mb-8">
//                     Your WhatsApp business account is connected and ready to process orders automatically.
//                   </p>
                  
//                   {/* Connected Info */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
//                     <div className="bg-gray-50 p-4 rounded-xl">
//                       <div className="text-sm text-gray-500 mb-1">Phone Number</div>
//                       <div className="font-semibold text-gray-900">{botInfo.phoneNumber || 'Not available'}</div>
//                     </div>
//                     <div className="bg-gray-50 p-4 rounded-xl">
//                       <div className="text-sm text-gray-500 mb-1">WhatsApp Name</div>
//                       <div className="font-semibold text-gray-900">{botInfo.pushname || 'Not available'}</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             {/* Charts */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Orders Chart */}
//               <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <Package className="w-5 h-5" />
//                   Orders Overview
//                 </h3>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={ordersData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={60}
//                         outerRadius={80}
//                         paddingAngle={5}
//                         dataKey="value"
//                       >
//                         {ordersData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip 
//                         formatter={(value) => [value, 'Orders']}
//                         labelFormatter={(name) => `Category: ${name}`}
//                       />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
              
//               {/* Messages Chart */}
//               <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <MessageSquare className="w-5 h-5" />
//                   Messages Overview
//                 </h3>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={messagesData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis 
//                         dataKey="name" 
//                         angle={-45}
//                         textAnchor="end"
//                         height={60}
//                       />
//                       <YAxis />
//                       <Tooltip 
//                         formatter={(value) => [value, 'Count']}
//                       />
//                       <Bar 
//                         dataKey="value" 
//                         fill="#8884d8"
//                         radius={[4, 4, 0, 0]}
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Right Column - Stats & Actions */}
//           <div className="space-y-6">
            
//             {/* Statistics Cards */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <BarChart3 className="w-5 h-5" />
//                 Real-time Statistics
//               </h3>
//               <div className="space-y-4">
//                 {[
//                   { 
//                     label: 'Total Orders', 
//                     value: stats.totalOrders, 
//                     icon: Package,
//                     color: 'bg-blue-100 text-blue-600',
//                     border: 'border-blue-200'
//                   },
//                   { 
//                     label: 'Total Messages', 
//                     value: stats.totalMessages, 
//                     icon: MessageSquare,
//                     color: 'bg-purple-100 text-purple-600',
//                     border: 'border-purple-200'
//                   },
//                   { 
//                     label: 'Total Customers', 
//                     value: stats.totalCustomers, 
//                     icon: Users,
//                     color: 'bg-teal-100 text-teal-600',
//                     border: 'border-teal-200'
//                   },
//                   { 
//                     label: 'Pending Orders', 
//                     value: stats.pendingOrders, 
//                     icon: Clock,
//                     color: 'bg-amber-100 text-amber-600',
//                     border: 'border-amber-200'
//                   },
//                   { 
//                     label: 'Completed Orders', 
//                     value: stats.completedOrders, 
//                     icon: CheckCircle,
//                     color: 'bg-green-100 text-green-600',
//                     border: 'border-green-200'
//                   }
//                 ].map((stat, index) => (
//                   <div 
//                     key={index} 
//                     className={`flex items-center justify-between p-4 rounded-xl border ${stat.border}`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${stat.color}`}>
//                         <stat.icon className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <div className="text-2xl font-bold text-gray-900">
//                           {stat.value.toLocaleString()}
//                         </div>
//                         <div className="text-sm text-gray-600">{stat.label}</div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* Bot Info */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Server className="w-5 h-5" />
//                 Bot Information
//               </h3>
//               <div className="space-y-3">
//                 {[
//                   { label: 'WhatsApp Name', value: botInfo.pushname || 'Not connected' },
//                   { label: 'Phone Number', value: botInfo.phoneNumber || 'Not available' },
//                   { label: 'Platform', value: botInfo.platform || 'Unknown' },
//                   { label: 'Version', value: botInfo.version || 'Unknown' },
//                   { label: 'Connected Since', value: botInfo.connectedSince || 'Not connected' }
//                 ].map((info, index) => (
//                   <div key={index} className="flex justify-between items-center py-2">
//                     <span className="text-gray-600">{info.label}</span>
//                     <span className="font-medium text-gray-900">{info.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* Quick Actions */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//               <div className="space-y-3">
//                 <button
//                   onClick={sendTestMessage}
//                   disabled={isLoading || status !== 'connected'}
//                   className="w-full flex items-center gap-3 p-4 text-left rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <MessageSquare className="w-5 h-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <div className="font-medium text-gray-900">Send Test Message</div>
//                     <div className="text-sm text-gray-600">Send message to a number</div>
//                   </div>
//                 </button>
                
//                 <button
//                   onClick={() => window.open('/admin/orders', '_blank')}
//                   className="w-full flex items-center gap-3 p-4 text-left rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
//                 >
//                   <div className="p-2 bg-green-100 rounded-lg">
//                     <Package className="w-5 h-5 text-green-600" />
//                   </div>
//                   <div>
//                     <div className="font-medium text-gray-900">View Orders</div>
//                     <div className="text-sm text-gray-600">Manage customer orders</div>
//                   </div>
//                 </button>
                
//                 <button
//                   onClick={() => handleBotAction('clear_session', 'Clear all sessions? This will log out WhatsApp.')}
//                   disabled={isLoading}
//                   className="w-full flex items-center gap-3 p-4 text-left rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <div className="p-2 bg-red-100 rounded-lg">
//                     <AlertCircle className="w-5 h-5 text-red-600" />
//                   </div>
//                   <div>
//                     <div className="font-medium text-gray-900">Clear Session</div>
//                     <div className="text-sm text-gray-600">Remove all session data</div>
//                   </div>
//                 </button>
//               </div>
//             </div>
            
//             {/* Activity Log */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
//               <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
//                 {activityLog.length > 0 ? (
//                   activityLog.map((log) => (
//                     <div
//                       key={log.id}
//                       className={`p-3 rounded-lg border-l-4 ${
//                         log.type === 'error' 
//                           ? 'bg-red-50 border-red-400 text-red-800' 
//                           : log.type === 'success'
//                           ? 'bg-green-50 border-green-400 text-green-800'
//                           : log.type === 'warning'
//                           ? 'bg-amber-50 border-amber-400 text-amber-800'
//                           : 'bg-blue-50 border-blue-400 text-blue-800'
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div className="text-sm">{log.message}</div>
//                         <div className="text-xs opacity-75 whitespace-nowrap">{log.timestamp}</div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-4 text-gray-500">
//                     No activity yet
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Footer */}
//         <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
//           <p>WhatsApp Business Dashboard • Professional Edition • Real-time Monitoring</p>
//           <p className="mt-1">
//             Bot Server: localhost:3001 • WebSocket: {wsConnected ? 'Connected' : 'Disconnected'} • 
//             Last Update: {formatDate(stats.lastUpdated)} • QR Endpoint: /ws/qr
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


// abovbe code working perfectly without proper ui responsive


// app/admin/whatsapp/page.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { appTheme } from '../../../src/constants/theme';
import {
  Wifi,
  User ,
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
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  Settings,
  DollarSign,
  ChevronRight,
  Maximize2,
  Minimize2,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';

export default function WhatsAppDashboard() {
  // ========== STATE MANAGEMENT ==========
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('loading');
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
  const [showQRExpanded, setShowQRExpanded] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const pingIntervalRef = useRef(null);

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

  // ========== WEBSOCKET CONNECTION ==========
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (error) {
        console.log('Error closing WebSocket:', error.message);
      }
      wsRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    
    try {
      const wsUrl = process.env.NEXT_PUBLIC_QR_WS_URL || 'ws://localhost:3000/ws/qr';
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setStatus('connected');
        setStatusMessage('WhatsApp is connected and ready');
        
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'get_status' }));
            wsRef.current.send(JSON.stringify({ type: 'get_stats' }));
          }
        }, 1000);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'qr':
            case 'qr_update':
              if (data.qr) {
                setQrCode(data.qr);
                setStatus('qr_required');
                setStatusMessage('Scan QR code with WhatsApp to connect');
              }
              break;
              
            case 'status':
            case 'status_update':
              if (data.status) setStatus(data.status);
              if (data.message) setStatusMessage(data.message);
              if (data.qr) setQrCode(data.qr);
              if (data.connected !== undefined) {
                setStatus(data.connected ? 'connected' : 'disconnected');
              }
              break;
              
            case 'stats':
            case 'stats_update':
              if (data.stats) {
                setStats(prev => ({
                  ...prev,
                  ...data.stats,
                  lastUpdated: new Date().toISOString()
                }));
              }
              break;
              
            case 'bot_connected':
              setStatus('connected');
              setStatusMessage('WhatsApp is connected and ready');
              setQrCode(null);
              addToActivityLog('WhatsApp connected successfully', 'success');
              break;
              
            case 'bot_disconnected':
              setStatus('disconnected');
              setStatusMessage(`Disconnected: ${data.reason || 'Unknown reason'}`);
              addToActivityLog(`Disconnected: ${data.reason || 'Unknown reason'}`, 'warning');
              break;
              
            case 'bot_info':
              if (data.botInfo) {
                setBotInfo({
                  pushname: data.botInfo.pushname || '',
                  platform: data.botInfo.platform || 'WhatsApp Business',
                  version: data.botInfo.version || '2.24.12',
                  phoneNumber: data.botInfo.phoneNumber || 'Not available',
                  connectedSince: data.botInfo.connectedSince || null,
                  lastActive: data.botInfo.lastActive || null
                });
              }
              break;
              
            case 'NEW_ORDER':
              addToActivityLog(`New order received: ${data.order?.orderNumber || 'ORD-' + Date.now()}`, 'success');
              fetchRecentOrders();
              fetchStats();
              break;
              
            case 'PAYMENT_RECEIVED':
              addToActivityLog(`Payment received for order #${data.orderNumber}`, 'success');
              fetchStats();
              break;
              
            case 'ORDER_STATUS_CHANGED':
              addToActivityLog(`Order #${data.orderNumber} status changed to ${data.newStatus}`, 'info');
              fetchRecentOrders();
              break;
              
            case 'pong':
              break;
              
            default:
              break;
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error.message);
        }
      };
      
      wsRef.current.onclose = (event) => {
        if (event.code !== 1000) {
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };
      
      wsRef.current.onerror = () => {
        // Silent error handling
      };
      
    } catch (error) {
      console.log('WebSocket setup failed:', error.message);
      fetchBotStatus();
      
      reconnectTimerRef.current = setTimeout(() => {
        connectWebSocket();
      }, 10000);
    }
  }, []);

  // ========== API CALLS ==========
  const fetchBotStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp?action=status');
      const data = await response.json();
      
      if (data.success) {
        if (data.qr) setQrCode(data.qr);
        if (data.status) setStatus(data.status);
        if (data.message) setStatusMessage(data.message);
        if (data.botInfo) {
          setBotInfo({
            pushname: data.botInfo.pushname || '',
            platform: data.botInfo.platform || 'WhatsApp Business',
            version: data.botInfo.version || '2.24.12',
            phoneNumber: data.botInfo.phoneNumber || 'Not available',
            connectedSince: data.botInfo.connectedSince || null,
            lastActive: data.botInfo.lastActive || null
          });
        }
      }
    } catch (error) {
      console.log('Failed to fetch bot status:', error.message);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(prev => ({
          ...prev,
          ...data.stats,
          lastUpdated: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.log('Failed to fetch stats:', error.message);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders?limit=5&sortBy=createdAt&sortOrder=desc');
      const data = await response.json();
      
      if (data.success) {
        setRecentOrders(data.data || []);
      }
    } catch (error) {
      console.log('Failed to fetch recent orders:', error.message);
    }
  }, []);

  const fetchActivityLog = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/activity?limit=8');
      const data = await response.json();
      
      if (data.success) {
        setActivityLog(data.activities || []);
      }
    } catch (error) {
      console.log('Failed to fetch activity log:', error.message);
    }
  }, []);

  // ========== BOT CONTROL FUNCTIONS ==========
  const handleBotAction = async (action, confirmMessage = null) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBotStatus();
        await fetchStats();
        
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
        }
      }
    } catch (error) {
      console.log(`Action ${action} failed:`, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestQRCode = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
    } else {
      fetchBotStatus();
    }
  }, [fetchBotStatus]);

  const sendTestMessage = async () => {
    const phoneNumber = prompt('Enter phone number (with country code):');
    if (!phoneNumber) return;
    
    const message = prompt('Enter message:');
    if (!message) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToActivityLog(`Message sent to ${phoneNumber}`, 'success');
      }
    } catch (error) {
      console.log('Send message error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== UTILITY FUNCTIONS ==========
  const addToActivityLog = useCallback((message, type = 'info') => {
    const entry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActivityLog(prev => [entry, ...prev.slice(0, 7)]);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: '#10b981',
          bgColor: '#10b98120',
          icon: <Wifi className="w-4 h-4" style={{ color: '#10b981' }} />,
          text: 'Connected',
          textColor: '#10b981'
        };
      case 'qr_required':
        return {
          color: '#f59e0b',
          bgColor: '#f59e0b20',
          icon: <Smartphone className="w-4 h-4" style={{ color: '#f59e0b' }} />,
          text: 'QR Required',
          textColor: '#f59e0b'
        };
      case 'loading':
        return {
          color: '#3b82f6',
          bgColor: '#3b82f620',
          icon: <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#3b82f6' }} />,
          text: 'Connecting',
          textColor: '#3b82f6'
        };
      case 'disconnected':
        return {
          color: '#ef4444',
          bgColor: '#ef444420',
          icon: <WifiOff className="w-4 h-4" style={{ color: '#ef4444' }} />,
          text: 'Disconnected',
          textColor: '#ef4444'
        };
      default:
        return {
          color: '#6b7280',
          bgColor: '#6b728020',
          icon: <AlertCircle className="w-4 h-4" style={{ color: '#6b7280' }} />,
          text: status,
          textColor: '#6b7280'
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const statusConfig = getStatusConfig();

  // ========== INITIALIZATION ==========
  useEffect(() => {
    connectWebSocket();
    fetchBotStatus();
    fetchStats();
    fetchRecentOrders();
    fetchActivityLog();

    const interval = setInterval(() => {
      fetchStats();
      fetchRecentOrders();
      fetchActivityLog();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket, fetchBotStatus, fetchStats, fetchRecentOrders, fetchActivityLog]);

  // ========== STAT CARDS ==========
  const statCards = [
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      change: stats.ordersGrowth > 0 ? `+${stats.ordersGrowth}%` : `${stats.ordersGrowth}%`,
      icon: Package,
      bgColor: '#3b82f620',
      iconColor: '#3b82f6',
      trend: stats.ordersGrowth > 0 ? 'up' : 'down'
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      change: stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}%` : `${stats.revenueGrowth}%`,
      icon: DollarSign,
      bgColor: '#10b98120',
      iconColor: '#10b981',
      trend: stats.revenueGrowth > 0 ? 'up' : 'down'
    },
    {
      title: 'Customers',
      value: formatNumber(stats.totalCustomers),
      change: stats.customersGrowth > 0 ? `+${stats.customersGrowth}%` : `${stats.customersGrowth}%`,
      icon: Users,
      bgColor: '#8b5cf620',
      iconColor: '#8b5cf6',
      trend: stats.customersGrowth > 0 ? 'up' : 'down'
    },
    {
      title: 'Messages',
      value: formatNumber(stats.totalMessages),
      change: `${Math.round((stats.totalMessages / (stats.totalCustomers || 1)) * 10) / 10}/cust`,
      icon: MessageSquare,
      bgColor: '#f59e0b20',
      iconColor: '#f59e0b',
      trend: 'neutral'
    },
    {
      title: 'Active Chats',
      value: stats.activeChats,
      change: stats.activeChats > 0 ? 'Active' : 'Inactive',
      icon: Activity,
      bgColor: '#ef444420',
      iconColor: '#ef4444',
      trend: stats.activeChats > 0 ? 'up' : 'down'
    },
    {
      title: 'Pending',
      value: stats.pendingOrders,
      change: `${Math.round((stats.pendingOrders / (stats.totalOrders || 1)) * 100)}%`,
      icon: Clock,
      bgColor: '#f59e0b20',
      iconColor: '#f59e0b',
      trend: 'neutral'
    }
  ];

  return (
    <div style={styles.container(isMobile)}>
      {/* Page Header */}
      <div style={styles.header(isMobile)}>
        <div>
          <div style={styles.titleWrapper(isMobile)}>
            <div style={styles.titleBar(isMobile)}></div>
            <h1 style={styles.title(isMobile)}>WhatsApp Dashboard</h1>
          </div>
          <p style={styles.subtitle(isMobile)}>
            Real-time WhatsApp business monitoring
          </p>
        </div>

        {/* Status Badge */}
        <div style={styles.statusWrapper(isMobile)}>
          <div style={{
            ...styles.statusBadge(isMobile),
            backgroundColor: statusConfig.bgColor,
            borderColor: `${statusConfig.color}40`,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusConfig.color,
              animation: status === 'connected' ? 'pulse 2s infinite' : 'none',
            }} />
            <span style={{ color: statusConfig.color, fontSize: isMobile ? '13px' : '14px', fontWeight: '500' }}>
              {statusConfig.text}
            </span>
          </div>
          <div style={styles.timeBadge(isMobile)}>
            <Clock size={isMobile ? 12 : 14} color="#6b7280" />
            <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#6b7280' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid(isMobile)}>
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={styles.statCard(isMobile)}>
              <div style={styles.statHeader}>
                <div style={{
                  ...styles.statIcon(isMobile),
                  backgroundColor: stat.bgColor,
                }}>
                  <Icon size={isMobile ? 14 : 16} color={stat.iconColor} />
                </div>
                <span style={{
                  ...styles.statChange(isMobile),
                  color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : '#6b7280',
                }}>
                  {stat.change}
                </span>
              </div>
              <p style={styles.statLabel(isMobile)}>{stat.title}</p>
              <p style={styles.statValue(isMobile)}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid(isMobile)}>
        {/* Left Column - QR & Connection */}
        <div style={styles.leftColumn(isMobile)}>
          {/* Connection Card */}
          <div style={styles.card(isMobile)}>
            <div style={styles.cardHeader(isMobile)}>
              <div>
                <h2 style={styles.cardTitle(isMobile)}>WhatsApp Connection</h2>
                <p style={styles.cardSubtitle(isMobile)}>{statusMessage}</p>
              </div>
              <div style={styles.actionButtons(isMobile)}>
                <button
                  onClick={() => handleBotAction('restart')}
                  disabled={isLoading}
                  style={styles.actionButton(isMobile, '#3b82f6', isLoading)}
                >
                  <RefreshCw size={isMobile ? 14 : 16} />
                  {!isMobile && <span>Restart</span>}
                </button>
                <button
                  onClick={() => handleBotAction('logout', 'Logout from WhatsApp?')}
                  disabled={isLoading}
                  style={styles.actionButton(isMobile, '#f59e0b', isLoading)}
                >
                  <LogOut size={isMobile ? 14 : 16} />
                  {!isMobile && <span>Logout</span>}
                </button>
                {status === 'connected' ? (
                  <button
                    onClick={() => handleBotAction('disconnect')}
                    disabled={isLoading}
                    style={styles.actionButton(isMobile, '#ef4444', isLoading)}
                  >
                    <Power size={isMobile ? 14 : 16} />
                    {!isMobile && <span>Disconnect</span>}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBotAction('connect')}
                    disabled={isLoading}
                    style={styles.actionButton(isMobile, '#10b981', isLoading)}
                  >
                    <Wifi size={isMobile ? 14 : 16} />
                    {!isMobile && <span>Connect</span>}
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Section */}
            <div style={styles.qrSection(isMobile)}>
              {qrCode ? (
                <div style={styles.qrContainer(isMobile)}>
                  <button
                    onClick={() => setShowQRExpanded(!showQRExpanded)}
                    style={styles.qrWrapper(isMobile)}
                  >
                    <div style={styles.qrBackground(isMobile)}>
                      <QRCodeSVG
                        value={qrCode}
                        size={showQRExpanded ? (isMobile ? 220 : 280) : (isMobile ? 160 : 200)}
                        level="H"
                        includeMargin
                        style={styles.qrCode}
                      />
                    </div>
                    <div style={styles.qrExpandButton(isMobile)}>
                      {showQRExpanded ? <Minimize2 size={isMobile ? 14 : 16} /> : <Maximize2 size={isMobile ? 14 : 16} />}
                    </div>
                  </button>
                  <h3 style={styles.qrTitle(isMobile)}>Scan QR Code to Connect</h3>
                  <div style={styles.qrSteps(isMobile)}>
                    {[
                      'Open WhatsApp',
                      'Tap Menu (⋮)',
                      'Linked Devices',
                      'Scan QR Code'
                    ].map((step, index) => (
                      <div key={index} style={styles.qrStep(isMobile)}>
                        <div style={styles.qrStepNumber(isMobile)}>{index + 1}</div>
                        <span style={styles.qrStepText(isMobile)}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={styles.connectedState(isMobile)}>
                  <div style={styles.connectedIcon(isMobile)}>
                    <CheckCircle size={isMobile ? 32 : 40} color="#10b981" />
                  </div>
                  <h3 style={styles.connectedTitle(isMobile)}>WhatsApp is Connected</h3>
                  <p style={styles.connectedText(isMobile)}>
                    Your WhatsApp business account is active and ready
                  </p>
                  <div style={styles.botInfoGrid(isMobile)}>
                    <div style={styles.botInfoItem(isMobile)}>
                      <Phone size={isMobile ? 12 : 14} color="#6b7280" />
                      <span style={styles.botInfoLabel(isMobile)}>{botInfo.phoneNumber || 'N/A'}</span>
                    </div>
                    <div style={styles.botInfoItem(isMobile)}>
                      <User size={isMobile ? 12 : 14} color="#6b7280" />
                      <span style={styles.botInfoLabel(isMobile)}>{botInfo.pushname || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bot Info Cards */}
          <div style={styles.botInfoCards(isMobile)}>
            <div style={styles.botInfoCard(isMobile)}>
              <Smartphone size={isMobile ? 16 : 18} color="#3b82f6" />
              <div>
                <p style={styles.botInfoCardLabel(isMobile)}>Platform</p>
                <p style={styles.botInfoCardValue(isMobile)}>{botInfo.platform || 'N/A'}</p>
              </div>
            </div>
            <div style={styles.botInfoCard(isMobile)}>
              <Package size={isMobile ? 16 : 18} color="#8b5cf6" />
              <div>
                <p style={styles.botInfoCardLabel(isMobile)}>Version</p>
                <p style={styles.botInfoCardValue(isMobile)}>{botInfo.version || 'N/A'}</p>
              </div>
            </div>
            <div style={styles.botInfoCard(isMobile)}>
              <Activity size={isMobile ? 16 : 18} color="#f59e0b" />
              <div>
                <p style={styles.botInfoCardLabel(isMobile)}>Last Active</p>
                <p style={styles.botInfoCardValue(isMobile)}>Just now</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={styles.card(isMobile)}>
            <div style={styles.cardHeader(isMobile)}>
              <h2 style={styles.cardTitle(isMobile)}>Recent Orders</h2>
              <button style={styles.viewAllButton(isMobile)}>View All</button>
            </div>
            <div style={styles.ordersList}>
              {recentOrders.length > 0 ? (
                recentOrders.map((order, i) => (
                  <div key={i} style={styles.orderItem(isMobile)}>
                    <div style={styles.orderLeft}>
                      <div style={{
                        ...styles.orderIcon(isMobile),
                        backgroundColor: order.status === 'completed' ? '#10b98120' :
                                      order.status === 'pending' ? '#f59e0b20' :
                                      order.status === 'processing' ? '#3b82f620' :
                                      '#6b728020'
                      }}>
                        <Package size={isMobile ? 14 : 16} color={
                          order.status === 'completed' ? '#10b981' :
                          order.status === 'pending' ? '#f59e0b' :
                          order.status === 'processing' ? '#3b82f6' :
                          '#6b7280'
                        } />
                      </div>
                      <div>
                        <p style={styles.orderNumber(isMobile)}>{order.orderNumber || `ORD-${i+1}`}</p>
                        <p style={styles.orderCustomer(isMobile)}>{order.customerName || 'Customer'}</p>
                      </div>
                    </div>
                    <div style={styles.orderRight}>
                      <p style={styles.orderAmount(isMobile)}>₹{order.totalAmount || 0}</p>
                      <p style={styles.orderTime(isMobile)}>{formatTime(order.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState(isMobile)}>
                  <Package size={isMobile ? 32 : 40} color="#d1d5db" />
                  <p style={styles.emptyStateText(isMobile)}>No recent orders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div style={styles.rightColumn(isMobile)}>
          {/* Quick Actions */}
          <div style={styles.card(isMobile)}>
            <h2 style={styles.cardTitle(isMobile)}>Quick Actions</h2>
            <div style={styles.quickActionsGrid(isMobile)}>
              <button
                onClick={sendTestMessage}
                disabled={status !== 'connected' || isLoading}
                style={styles.quickAction(isMobile)}
              >
                <Send size={isMobile ? 18 : 20} color="#3b82f6" />
                <span style={styles.quickActionLabel(isMobile)}>Send Message</span>
              </button>
              <button
                onClick={requestQRCode}
                style={styles.quickAction(isMobile)}
              >
                <RefreshCw size={isMobile ? 18 : 20} color="#10b981" />
                <span style={styles.quickActionLabel(isMobile)}>Refresh QR</span>
              </button>
              <button
                onClick={() => window.open('/api/whatsapp/export', '_blank')}
                style={styles.quickAction(isMobile)}
              >
                <Download size={isMobile ? 18 : 20} color="#8b5cf6" />
                <span style={styles.quickActionLabel(isMobile)}>Export</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/analytics'}
                style={styles.quickAction(isMobile)}
              >
                <BarChart3 size={isMobile ? 18 : 20} color="#f59e0b" />
                <span style={styles.quickActionLabel(isMobile)}>Analytics</span>
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div style={styles.card(isMobile)}>
            <h2 style={styles.cardTitle(isMobile)}>Recent Activity</h2>
            <div style={styles.activityLog}>
              {activityLog.length > 0 ? (
                activityLog.map((log) => (
                  <div key={log.id} style={{
                    ...styles.activityItem(isMobile),
                    backgroundColor: log.type === 'success' ? '#10b98110' :
                                   log.type === 'warning' ? '#f59e0b10' :
                                   log.type === 'error' ? '#ef444410' :
                                   '#3b82f610',
                    borderLeftColor: log.type === 'success' ? '#10b981' :
                                    log.type === 'warning' ? '#f59e0b' :
                                    log.type === 'error' ? '#ef4444' :
                                    '#3b82f6',
                  }}>
                    <p style={styles.activityMessage(isMobile)}>{log.message}</p>
                    <span style={styles.activityTime(isMobile)}>{log.timestamp}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState(isMobile)}>
                  <Activity size={isMobile ? 32 : 40} color="#d1d5db" />
                  <p style={styles.emptyStateText(isMobile)}>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Message Button */}
          <button
            onClick={sendTestMessage}
            disabled={status !== 'connected' || isLoading}
            style={styles.testMessageButton(isMobile)}
          >
            <Send size={isMobile ? 18 : 20} color="#3b82f6" />
            <div style={styles.testMessageContent(isMobile)}>
              <span style={styles.testMessageTitle(isMobile)}>Send Test Message</span>
              <span style={styles.testMessageSubtitle(isMobile)}>Send to any WhatsApp number</span>
            </div>
            <ChevronRight size={isMobile ? 18 : 20} color="#9ca3af" />
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner(isMobile)}>
            <RefreshCw size={isMobile ? 24 : 32} className="spin" />
            <p style={styles.loadingText(isMobile)}>Processing...</p>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: (isMobile) => ({
    padding: isMobile ? '16px' : '24px',
    backgroundColor: 'transparent',
    minHeight: '100vh',
    width: '100%',
  }),

  header: (isMobile) => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? '20px' : '24px',
    gap: isMobile ? '12px' : 0,
  }),

  titleWrapper: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '10px' : '12px',
    marginBottom: '4px',
  }),

  titleBar: (isMobile) => ({
    width: isMobile ? '3px' : '4px',
    height: isMobile ? '24px' : '28px',
    background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
    borderRadius: '2px',
  }),

  title: (isMobile) => ({
    color: appTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: isMobile ? '1.4rem' : '1.75rem',
    margin: 0,
    lineHeight: 1.2,
  }),

  subtitle: (isMobile) => ({
    color: appTheme.colors.textSecondary,
    margin: '4px 0 0 15px',
    fontSize: isMobile ? '0.85rem' : '0.95rem',
    fontWeight: '500',
  }),

  statusWrapper: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
  }),

  statusBadge: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '8px',
    padding: isMobile ? '6px 10px' : '8px 12px',
    borderRadius: '20px',
    border: '1px solid',
    backgroundColor: '#ffffff',
  }),

  timeBadge: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: isMobile ? '6px 10px' : '8px 12px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: `1px solid ${appTheme.colors.border}40`,
  }),

  statsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
    gap: isMobile ? '10px' : '12px',
    marginBottom: isMobile ? '20px' : '24px',
  }),

  statCard: (isMobile) => ({
    backgroundColor: '#ffffff',
    padding: isMobile ? '12px' : '14px',
    borderRadius: isMobile ? '10px' : '12px',
    border: `1px solid ${appTheme.colors.border}30`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
  }),

  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },

  statIcon: (isMobile) => ({
    padding: isMobile ? '6px' : '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  statChange: (isMobile) => ({
    fontSize: isMobile ? '10px' : '11px',
    fontWeight: '600',
  }),

  statLabel: (isMobile) => ({
    fontSize: isMobile ? '11px' : '12px',
    color: appTheme.colors.textSecondary,
    marginBottom: '2px',
  }),

  statValue: (isMobile) => ({
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '700',
    color: appTheme.colors.textPrimary,
  }),

  mainGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
    gap: isMobile ? '16px' : '20px',
  }),

  leftColumn: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '16px' : '20px',
  }),

  rightColumn: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '16px' : '20px',
  }),

  card: (isMobile) => ({
    backgroundColor: '#ffffff',
    borderRadius: isMobile ? '14px' : '16px',
    border: `1px solid ${appTheme.colors.border}30`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  }),

  cardHeader: (isMobile) => ({
    padding: isMobile ? '16px' : '20px',
    borderBottom: `1px solid ${appTheme.colors.border}30`,
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: isMobile ? '12px' : 0,
  }),

  cardTitle: (isMobile) => ({
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    color: appTheme.colors.textPrimary,
    margin: 0,
  }),

  cardSubtitle: (isMobile) => ({
    fontSize: isMobile ? '12px' : '13px',
    color: appTheme.colors.textSecondary,
    marginTop: '4px',
  }),

  actionButtons: (isMobile) => ({
    display: 'flex',
    gap: isMobile ? '6px' : '8px',
    flexWrap: 'wrap',
  }),

  actionButton: (isMobile, color, disabled) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '6px',
    padding: isMobile ? '8px 12px' : '8px 14px',
    backgroundColor: `${color}15`,
    border: `1px solid ${color}30`,
    borderRadius: '8px',
    color: color,
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
  }),

  qrSection: (isMobile) => ({
    padding: isMobile ? '16px' : '24px',
  }),

  qrContainer: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),

  qrWrapper: (isMobile) => ({
    position: 'relative',
    marginBottom: isMobile ? '16px' : '20px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  }),

  qrBackground: (isMobile) => ({
    backgroundColor: '#ffffff',
    padding: isMobile ? '12px' : '16px',
    borderRadius: isMobile ? '14px' : '16px',
    border: `2px dashed ${appTheme.colors.primary}40`,
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
  }),

  qrCode: {
    display: 'block',
  },

  qrExpandButton: (isMobile) => ({
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: isMobile ? '28px' : '32px',
    height: isMobile ? '28px' : '32px',
    backgroundColor: appTheme.colors.primary,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
  }),

  qrTitle: (isMobile) => ({
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    color: appTheme.colors.textPrimary,
    marginBottom: isMobile ? '12px' : '16px',
  }),

  qrSteps: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: isMobile ? '6px' : '8px',
    width: '100%',
    maxWidth: '400px',
  }),

  qrStep: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  }),

  qrStepNumber: (isMobile) => ({
    width: isMobile ? '22px' : '24px',
    height: isMobile ? '22px' : '24px',
    backgroundColor: `${appTheme.colors.primary}15`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isMobile ? '11px' : '12px',
    fontWeight: '600',
    color: appTheme.colors.primary,
  }),

  qrStepText: (isMobile) => ({
    fontSize: isMobile ? '9px' : '10px',
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
  }),

  connectedState: (isMobile) => ({
    textAlign: 'center',
    padding: isMobile ? '16px' : '24px',
  }),

  connectedIcon: (isMobile) => ({
    marginBottom: isMobile ? '12px' : '16px',
  }),

  connectedTitle: (isMobile) => ({
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '600',
    color: appTheme.colors.textPrimary,
    marginBottom: '8px',
  }),

  connectedText: (isMobile) => ({
    fontSize: isMobile ? '13px' : '14px',
    color: appTheme.colors.textSecondary,
    marginBottom: isMobile ? '16px' : '20px',
  }),

  botInfoGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: isMobile ? '8px' : '12px',
    maxWidth: '300px',
    margin: '0 auto',
  }),

  botInfoItem: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: appTheme.colors.background,
    padding: isMobile ? '8px' : '10px',
    borderRadius: '8px',
  }),

  botInfoLabel: (isMobile) => ({
    fontSize: isMobile ? '12px' : '13px',
    color: appTheme.colors.textPrimary,
    fontWeight: '500',
  }),

  botInfoCards: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: isMobile ? '10px' : '12px',
  }),

  botInfoCard: (isMobile) => ({
    backgroundColor: '#ffffff',
    padding: isMobile ? '12px' : '14px',
    borderRadius: isMobile ? '10px' : '12px',
    border: `1px solid ${appTheme.colors.border}30`,
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '10px',
  }),

  botInfoCardLabel: (isMobile) => ({
    fontSize: isMobile ? '10px' : '11px',
    color: appTheme.colors.textSecondary,
    marginBottom: '2px',
  }),

  botInfoCardValue: (isMobile) => ({
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '600',
    color: appTheme.colors.textPrimary,
  }),

  viewAllButton: (isMobile) => ({
    background: 'none',
    border: 'none',
    color: appTheme.colors.primary,
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: isMobile ? '6px 8px' : '6px 10px',
    borderRadius: '6px',
  }),

  ordersList: {
    padding: '4px 0',
  },

  orderItem: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '12px 16px' : '14px 20px',
    borderBottom: `1px solid ${appTheme.colors.border}20`,
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: `${appTheme.colors.background}80`,
    },
  }),

  orderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  orderIcon: (isMobile) => ({
    width: isMobile ? '36px' : '40px',
    height: isMobile ? '36px' : '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  orderNumber: (isMobile) => ({
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '500',
    color: appTheme.colors.textPrimary,
    marginBottom: '2px',
  }),

  orderCustomer: (isMobile) => ({
    fontSize: isMobile ? '11px' : '12px',
    color: appTheme.colors.textSecondary,
  }),

  orderRight: {
    textAlign: 'right',
  },

  orderAmount: (isMobile) => ({
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '600',
    color: appTheme.colors.textPrimary,
    marginBottom: '2px',
  }),

  orderTime: (isMobile) => ({
    fontSize: isMobile ? '10px' : '11px',
    color: appTheme.colors.textSecondary,
  }),

  emptyState: (isMobile) => ({
    padding: isMobile ? '32px 16px' : '40px 24px',
    textAlign: 'center',
  }),

  emptyStateText: (isMobile) => ({
    fontSize: isMobile ? '13px' : '14px',
    color: appTheme.colors.textSecondary,
    marginTop: '12px',
  }),

  quickActionsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: isMobile ? '8px' : '10px',
    padding: isMobile ? '12px 16px 16px' : '16px 20px 20px',
  }),

  quickAction: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: isMobile ? '6px' : '8px',
    padding: isMobile ? '14px 8px' : '16px 10px',
    backgroundColor: appTheme.colors.background,
    border: `1px solid ${appTheme.colors.border}30`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
  }),

  quickActionLabel: (isMobile) => ({
    fontSize: isMobile ? '11px' : '12px',
    fontWeight: '500',
    color: appTheme.colors.textPrimary,
  }),

  activityLog: {
    padding: '8px 0',
  },

  activityItem: (isMobile) => ({
    padding: isMobile ? '12px 16px' : '14px 20px',
    borderBottom: `1px solid ${appTheme.colors.border}20`,
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  activityMessage: (isMobile) => ({
    fontSize: isMobile ? '12px' : '13px',
    color: appTheme.colors.textPrimary,
    flex: 1,
  }),

  activityTime: (isMobile) => ({
    fontSize: isMobile ? '10px' : '11px',
    color: appTheme.colors.textSecondary,
    marginLeft: '12px',
  }),

  testMessageButton: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '12px' : '14px',
    padding: isMobile ? '14px 16px' : '16px 20px',
    backgroundColor: '#ffffff',
    border: `1px solid ${appTheme.colors.border}30`,
    borderRadius: isMobile ? '12px' : '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    WebkitTapHighlightColor: 'transparent',
    ':hover': {
      borderColor: appTheme.colors.primary,
    },
  }),

  testMessageContent: (isMobile) => ({
    flex: 1,
    textAlign: 'left',
  }),

  testMessageTitle: (isMobile) => ({
    display: 'block',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '500',
    color: appTheme.colors.textPrimary,
    marginBottom: '2px',
  }),

  testMessageSubtitle: (isMobile) => ({
    display: 'block',
    fontSize: isMobile ? '11px' : '12px',
    color: appTheme.colors.textSecondary,
  }),

  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },

  loadingSpinner: (isMobile) => ({
    backgroundColor: '#ffffff',
    padding: isMobile ? '24px' : '32px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  }),

  loadingText: (isMobile) => ({
    fontSize: isMobile ? '14px' : '16px',
    color: appTheme.colors.textPrimary,
    fontWeight: '500',
  }),
};