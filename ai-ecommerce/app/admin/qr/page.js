
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

//   // WebSocket connection with better stability
//   const connectWebSocket = useCallback(() => {
//     // Clean up existing connection
//     if (wsRef.current) {
//       if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
//         wsRef.current.close();
//       }
//     }
    
//     if (reconnectTimerRef.current) {
//       clearTimeout(reconnectTimerRef.current);
//     }
    
//     try {
//       const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
//       console.log('🔗 Connecting to WebSocket:', wsUrl);
//       setWsStatus('connecting');
      
//       wsRef.current = new WebSocket(wsUrl);
      
//       wsRef.current.onopen = () => {
//         console.log('✅ WebSocket connected successfully');
//         setWsConnected(true);
//         setWsStatus('connected');
//         setReconnectCount(0);
//         addToActivityLog('WebSocket connected', 'success');
        
//         // Send initial ping
//         wsRef.current.send(JSON.stringify({ type: 'ping' }));
//       };
      
//       wsRef.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
          
//           switch (data.type) {
//             case 'qr':
//               setQrCode(data.qr);
//               setStatus('qr_required');
//               setStatusMessage('Scan QR code with WhatsApp to connect');
//               addToActivityLog('QR code generated', 'info');
//               break;
              
//             case 'status':
//               setStatus(data.status);
//               setStatusMessage(data.message);
//               if (data.botInfo) setBotInfo(data.botInfo);
//               break;
              
//             case 'stats':
//               setStats(prev => ({
//                 ...prev,
//                 ...data.stats,
//                 lastUpdated: new Date().toISOString()
//               }));
//               break;
              
//             case 'connected':
//               setStatus('connected');
//               setStatusMessage('WhatsApp is connected and ready');
//               setQrCode(null);
//               addToActivityLog('WhatsApp connected successfully', 'success');
//               break;
              
//             case 'disconnected':
//               setStatus('disconnected');
//               setStatusMessage(`Disconnected: ${data.reason}`);
//               addToActivityLog(`Disconnected: ${data.reason}`, 'warning');
//               break;
              
//             case 'error':
//               setStatus('error');
//               setStatusMessage(data.message);
//               addToActivityLog(`Error: ${data.message}`, 'error');
//               break;
              
//             case 'pong':
//               // Ping response received, connection is alive
//               break;
              
//             default:
//               console.log('📨 Unknown WebSocket message type:', data.type);
//           }
//         } catch (error) {
//           console.error('❌ Error parsing WebSocket message:', error);
//         }
//       };
      
//       wsRef.current.onclose = (event) => {
//         console.log('🔌 WebSocket disconnected:', {
//           code: event.code,
//           reason: event.reason,
//           wasClean: event.wasClean
//         });
        
//         setWsConnected(false);
//         setWsStatus('disconnected');
//         addToActivityLog('WebSocket disconnected', 'warning');
        
//         // Don't reconnect immediately for normal closures
//         if (event.code === 1000) { // Normal closure
//           console.log('🛑 Normal WebSocket closure, not reconnecting');
//           return;
//         }
        
//         // Auto-reconnect with exponential backoff
//         const delay = Math.min(5000 * Math.pow(1.5, reconnectCount), 30000);
//         const nextAttempt = reconnectCount + 1;
        
//         console.log(`🔄 Reconnecting in ${delay/1000} seconds... (Attempt ${nextAttempt})`);
//         addToActivityLog(`WebSocket reconnecting in ${delay/1000}s (Attempt ${nextAttempt})`, 'info');
        
//         reconnectTimerRef.current = setTimeout(() => {
//           console.log('🔄 Attempting WebSocket reconnection...');
//           connectWebSocket();
//         }, delay);
        
//         setReconnectCount(nextAttempt);
//       };
      
//       wsRef.current.onerror = (error) => {
//         console.log('⚠️ WebSocket error occurred');
//         setWsConnected(false);
//         setWsStatus('error');
//       };
      
//     } catch (error) {
//       console.error('❌ WebSocket setup failed:', error);
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
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch bot status:', error);
//       addToActivityLog('Failed to fetch bot status', 'error');
//     }
//   }, [addToActivityLog]);

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
    
//     // Fetch initial status
//     fetchBotStatus();
    
//     // Set up fallback polling (every 30 seconds)
//     statsIntervalRef.current = setInterval(fetchBotStatus, 30000);
    
//     return () => {
//       clearTimeout(wsTimeout);
      
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
      
//       if (reconnectTimerRef.current) {
//         clearTimeout(reconnectTimerRef.current);
//       }
      
//       if (statsIntervalRef.current) {
//         clearInterval(statsIntervalRef.current);
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
//             </div>
//           </div>
//         </div>

//         {/* Connection Status Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900 mb-1">Connection Status</h2>
//               <p className="text-gray-600">{statusMessage}</p>
//             </div>
            
//             <div className="mt-4 md:mt-0">
//               <button
//                 onClick={() => fetchBotStatus()}
//                 disabled={isLoading}
//                 className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh Status
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
//             Last Update: {formatDate(stats.lastUpdated)}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }





'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Wifi, WifiOff, Smartphone, LogOut, RefreshCw, Power, 
  MessageSquare, Package, Users, BarChart3, Activity,
  Shield, Server, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

export default function WhatsAppDashboard() {
  // State management
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
    lastUpdated: ''
  });
  const [botInfo, setBotInfo] = useState({
    pushname: '',
    platform: '',
    version: '',
    phoneNumber: '',
    connectedSince: ''
  });
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [wsStatus, setWsStatus] = useState('disconnected');
  
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const pingIntervalRef = useRef(null);

  // Add activity log entry
  const addToActivityLog = useCallback((message, type = 'info') => {
    const entry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };
    
    setActivityLog(prev => [entry, ...prev.slice(0, 19)]);
  }, []);

  // SAFE WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN || 
            wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      } catch (error) {
        console.log('⚠️ Error closing previous WebSocket:', error.message);
      }
      wsRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    try {
      // IMPORTANT: Use the correct WebSocket URL for QR socket
      const wsUrl = process.env.NEXT_PUBLIC_QR_WS_URL || 'ws://localhost:3001/ws/qr';
      console.log('🔗 Connecting to QR WebSocket:', wsUrl);
      setWsStatus('connecting');
      addToActivityLog(`Connecting to WebSocket: ${wsUrl}`, 'info');
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ QR WebSocket connected successfully');
        setWsConnected(true);
        setWsStatus('connected');
        setReconnectCount(0);
        addToActivityLog('WebSocket connected', 'success');
        
        // Send initial identification
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({ 
                type: 'identify', 
                clientName: 'Admin Dashboard' 
              }));
            } catch (error) {
              console.log('❌ Error sending identification:', error.message);
            }
          }
        }, 500);
        
        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            } catch (error) {
              console.log('❌ Error sending ping:', error.message);
            }
          }
        }, 25000);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected' && data.endpoint === 'qr') {
            console.log('✅ Connected to QR WebSocket endpoint');
            addToActivityLog('Connected to QR WebSocket service', 'success');
            
            // Request initial status
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              setTimeout(() => {
                try {
                  wsRef.current.send(JSON.stringify({ type: 'get_status' }));
                  wsRef.current.send(JSON.stringify({ type: 'get_stats' }));
                } catch (error) {
                  console.log('❌ Error requesting initial data:', error.message);
                }
              }, 1000);
            }
          }
          
          switch (data.type) {
            case 'qr':
            case 'qr_update':
              if (data.qr) {
                setQrCode(data.qr);
                setStatus('qr_required');
                setStatusMessage('Scan QR code with WhatsApp to connect');
                addToActivityLog('QR code generated', 'info');
              }
              break;
              
            case 'qr_response':
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
              if (data.connected !== undefined) {
                setStatus(data.connected ? 'connected' : 'disconnected');
              }
              if (data.qr) setQrCode(data.qr);
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
              if (data.botInfo) setBotInfo(data.botInfo);
              break;
              
            case 'connected':
              // Initial connection message
              if (data.botStatus) {
                if (data.botStatus.qr) {
                  setQrCode(data.botStatus.qr);
                  setStatus('qr_required');
                } else if (data.botStatus.connected) {
                  setStatus('connected');
                  setQrCode(null);
                }
              }
              break;
              
            case 'pong':
              // Ping response received, connection is alive
              break;
              
            case 'error':
              addToActivityLog(`Error: ${data.message || 'Unknown error'}`, 'error');
              break;
              
            case 'identified':
              console.log('✅ WebSocket identification confirmed:', data.message);
              break;
              
            default:
              console.log('📨 Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          addToActivityLog('Error parsing WebSocket message', 'error');
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('🔌 QR WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        setWsConnected(false);
        setWsStatus('disconnected');
        
        if (event.code !== 1000) { // Not a normal closure
          addToActivityLog(`WebSocket disconnected: ${event.reason || 'Code ' + event.code}`, 'warning');
        }
        
        // Clean up ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Auto-reconnect with exponential backoff (except for normal closures)
        if (event.code !== 1000 && reconnectCount < 10) {
          const delay = Math.min(3000 * Math.pow(1.5, reconnectCount), 30000);
          const nextAttempt = reconnectCount + 1;
          
          console.log(`🔄 Reconnecting in ${delay/1000} seconds... (Attempt ${nextAttempt})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            console.log('🔄 Attempting WebSocket reconnection...');
            connectWebSocket();
          }, delay);
          
          setReconnectCount(nextAttempt);
        } else if (event.code === 1000) {
          console.log('🛑 Normal WebSocket closure, not reconnecting');
          addToActivityLog('WebSocket connection closed normally', 'info');
        }
      };
      
      wsRef.current.onerror = (error) => {
        // SAFE error handling - don't try to access error object properties
        console.log('⚠️ WebSocket error occurred');
        setWsConnected(false);
        setWsStatus('error');
      };
      
    } catch (error) {
      console.error('❌ WebSocket setup failed:', error.message);
      setWsConnected(false);
      setWsStatus('error');
      addToActivityLog('WebSocket setup failed', 'error');
      
      // Retry after 10 seconds
      reconnectTimerRef.current = setTimeout(() => {
        connectWebSocket();
      }, 10000);
    }
  }, [reconnectCount, addToActivityLog]);

  // Fetch bot status from API
  const fetchBotStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp?action=status');
      const data = await response.json();
      
      if (data.success) {
        if (data.qr) setQrCode(data.qr);
        if (data.status) setStatus(data.status);
        if (data.message) setStatusMessage(data.message);
        if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
        if (data.botInfo) setBotInfo(data.botInfo);
      } else {
        console.error('❌ API returned error:', data.error);
        addToActivityLog(`API error: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Failed to fetch bot status:', error);
      addToActivityLog('Failed to fetch bot status', 'error');
    }
  }, [addToActivityLog]);

  // Request QR code via WebSocket
  const requestQRCode = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
        addToActivityLog('Requested QR code refresh', 'info');
      } catch (error) {
        console.log('❌ Error requesting QR code:', error.message);
      }
    } else {
      // Fallback to API
      fetchBotStatus();
    }
  }, [fetchBotStatus, addToActivityLog]);

  // Bot control functions
  const handleBotAction = async (action, confirmMessage = null) => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    
    setIsLoading(true);
    addToActivityLog(`Starting action: ${action}`, 'info');
    
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToActivityLog(`Action "${action}" completed successfully`, 'success');
        
        // Refresh status after action
        setTimeout(() => {
          fetchBotStatus();
        }, 2000);
        
        // Request updated status via WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          setTimeout(() => {
            try {
              wsRef.current.send(JSON.stringify({ type: 'get_status' }));
            } catch (error) {
              console.log('❌ Error requesting status update:', error.message);
            }
          }, 1500);
        }
      } else {
        addToActivityLog(`Action "${action}" failed: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error(`❌ ${action} error:`, error);
      addToActivityLog(`Action "${action}" failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    const phoneNumber = prompt('Enter phone number (with country code, e.g., 919876543210):');
    if (!phoneNumber) {
      addToActivityLog('Test message cancelled: No phone number provided', 'warning');
      return;
    }
    
    const message = prompt('Enter message:');
    if (!message) {
      addToActivityLog('Test message cancelled: No message provided', 'warning');
      return;
    }
    
    setIsLoading(true);
    addToActivityLog(`Sending test message to ${phoneNumber}`, 'info');
    
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_message',
          to: phoneNumber,
          message 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToActivityLog(`Test message sent to ${phoneNumber}`, 'success');
        alert('✅ Message sent successfully!');
      } else {
        addToActivityLog(`Failed to send test message: ${data.error}`, 'error');
        alert(`❌ Failed to send message: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Send message error:', error);
      addToActivityLog('Failed to send test message', 'error');
      alert('❌ Failed to send message. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get status color and icon
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return { 
          color: 'bg-green-500', 
          icon: <Wifi className="w-5 h-5" />,
          text: 'Connected',
          textColor: 'text-green-600'
        };
      case 'qr_required':
        return { 
          color: 'bg-yellow-500', 
          icon: <Smartphone className="w-5 h-5" />,
          text: 'QR Required',
          textColor: 'text-yellow-600'
        };
      case 'loading':
      case 'connecting':
        return { 
          color: 'bg-blue-500', 
          icon: <Activity className="w-5 h-5 animate-spin" />,
          text: 'Connecting',
          textColor: 'text-blue-600'
        };
      case 'disconnected':
        return { 
          color: 'bg-red-500', 
          icon: <WifiOff className="w-5 h-5" />,
          text: 'Disconnected',
          textColor: 'text-red-600'
        };
      default:
        return { 
          color: 'bg-gray-500', 
          icon: <Server className="w-5 h-5" />,
          text: status,
          textColor: 'text-gray-600'
        };
    }
  };

  // Chart data
  const ordersData = [
    { name: 'Total', value: stats.totalOrders, color: '#3b82f6' },
    { name: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
    { name: 'Completed', value: stats.completedOrders, color: '#10b981' }
  ];

  const messagesData = [
    { name: 'Messages', value: stats.totalMessages, color: '#8b5cf6' },
    { name: 'Chats', value: stats.totalChats, color: '#ef4444' },
    { name: 'Customers', value: stats.totalCustomers, color: '#06b6d4' }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };

  // Initialize
  useEffect(() => {
    // Start WebSocket connection with a delay
    const wsTimeout = setTimeout(() => {
      connectWebSocket();
    }, 1000);
    
    // Fetch initial status via API
    fetchBotStatus();
    
    // Set up fallback polling (every 30 seconds)
    statsIntervalRef.current = setInterval(fetchBotStatus, 30000);
    
    return () => {
      clearTimeout(wsTimeout);
      
      // Clean up WebSocket
      if (wsRef.current) {
        try {
          if (wsRef.current.readyState === WebSocket.OPEN || 
              wsRef.current.readyState === WebSocket.CONNECTING) {
            wsRef.current.close(1000, 'Component unmounting');
          }
        } catch (error) {
          console.log('⚠️ Error closing WebSocket on unmount:', error.message);
        }
        wsRef.current = null;
      }
      
      // Clean up timers
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [connectWebSocket, fetchBotStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                WhatsApp Business Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your WhatsApp e-commerce bot with real-time monitoring
              </p>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusConfig().color} animate-pulse`}></div>
              <div className="flex items-center gap-2">
                {getStatusConfig().icon}
                <span className={`font-semibold ${getStatusConfig().textColor}`}>
                  {getStatusConfig().text}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full ${wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-sm font-medium`}>
                {wsConnected ? 'Live WS' : 'No WS'}
              </div>
              {reconnectCount > 0 && (
                <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  Retry: {reconnectCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">QR WebSocket Connection</h2>
              <p className="text-gray-600">
                {wsConnected ? 'Connected to real-time service' : 'Connecting to WebSocket...'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Endpoint: ws://localhost:3001/ws/qr
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={requestQRCode}
                disabled={!wsConnected || isLoading}
                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh QR
              </button>
              
              <button
                onClick={() => fetchBotStatus()}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                API Refresh
              </button>
            </div>
          </div>
          
          {!wsConnected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-amber-800 font-medium">WebSocket Disconnected</p>
                  <p className="text-amber-700 text-sm">
                    Real-time updates are disabled. Using fallback polling every 30 seconds.
                    {reconnectCount > 0 && ` Reconnection attempts: ${reconnectCount}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Connection & QR */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Connection Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Connection</h2>
                  <p className="text-gray-600">{statusMessage}</p>
                </div>
                
                {/* Control Buttons */}
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => handleBotAction('restart')}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restart Bot
                  </button>
                  
                  <button
                    onClick={() => handleBotAction('logout', 'Are you sure you want to logout? This will clear the session and require QR scan.')}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                  
                  {status === 'connected' ? (
                    <button
                      onClick={() => handleBotAction('disconnect')}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Power className="w-4 h-4" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBotAction('connect')}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wifi className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
              
              {/* QR Code Display */}
              {qrCode ? (
                <div className="text-center">
                  <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-inner">
                      <QRCodeSVG 
                        value={qrCode} 
                        size={280}
                        level="H"
                        includeMargin={true}
                        className="mx-auto"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Scan QR Code with WhatsApp
                  </h3>
                  
                  <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Connection Instructions
                    </h4>
                    <ol className="space-y-3 text-left">
                      {[
                        'Open WhatsApp on your phone',
                        'Go to Settings → Linked Devices',
                        'Tap "Link a Device"',
                        'Scan the QR code above'
                      ].map((step, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-blue-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    WhatsApp is Connected
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your WhatsApp business account is connected and ready to process orders automatically.
                  </p>
                  
                  {/* Connected Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                      <div className="font-semibold text-gray-900">{botInfo.phoneNumber || 'Not available'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">WhatsApp Name</div>
                      <div className="font-semibold text-gray-900">{botInfo.pushname || 'Not available'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Orders Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Orders Overview
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ordersData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Orders']}
                        labelFormatter={(name) => `Category: ${name}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Messages Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages Overview
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={messagesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Count']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            
            {/* Statistics Cards */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Real-time Statistics
              </h3>
              <div className="space-y-4">
                {[
                  { 
                    label: 'Total Orders', 
                    value: stats.totalOrders, 
                    icon: Package,
                    color: 'bg-blue-100 text-blue-600',
                    border: 'border-blue-200'
                  },
                  { 
                    label: 'Total Messages', 
                    value: stats.totalMessages, 
                    icon: MessageSquare,
                    color: 'bg-purple-100 text-purple-600',
                    border: 'border-purple-200'
                  },
                  { 
                    label: 'Total Customers', 
                    value: stats.totalCustomers, 
                    icon: Users,
                    color: 'bg-teal-100 text-teal-600',
                    border: 'border-teal-200'
                  },
                  { 
                    label: 'Pending Orders', 
                    value: stats.pendingOrders, 
                    icon: Clock,
                    color: 'bg-amber-100 text-amber-600',
                    border: 'border-amber-200'
                  },
                  { 
                    label: 'Completed Orders', 
                    value: stats.completedOrders, 
                    icon: CheckCircle,
                    color: 'bg-green-100 text-green-600',
                    border: 'border-green-200'
                  }
                ].map((stat, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-xl border ${stat.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bot Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                Bot Information
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'WhatsApp Name', value: botInfo.pushname || 'Not connected' },
                  { label: 'Phone Number', value: botInfo.phoneNumber || 'Not available' },
                  { label: 'Platform', value: botInfo.platform || 'Unknown' },
                  { label: 'Version', value: botInfo.version || 'Unknown' },
                  { label: 'Connected Since', value: botInfo.connectedSince || 'Not connected' }
                ].map((info, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{info.label}</span>
                    <span className="font-medium text-gray-900">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={sendTestMessage}
                  disabled={isLoading || status !== 'connected'}
                  className="w-full flex items-center gap-3 p-4 text-left rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Send Test Message</div>
                    <div className="text-sm text-gray-600">Send message to a number</div>
                  </div>
                </button>
                
                <button
                  onClick={() => window.open('/admin/orders', '_blank')}
                  className="w-full flex items-center gap-3 p-4 text-left rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">View Orders</div>
                    <div className="text-sm text-gray-600">Manage customer orders</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleBotAction('clear_session', 'Clear all sessions? This will log out WhatsApp.')}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-4 text-left rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Clear Session</div>
                    <div className="text-sm text-gray-600">Remove all session data</div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Activity Log */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {activityLog.length > 0 ? (
                  activityLog.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        log.type === 'error' 
                          ? 'bg-red-50 border-red-400 text-red-800' 
                          : log.type === 'success'
                          ? 'bg-green-50 border-green-400 text-green-800'
                          : log.type === 'warning'
                          ? 'bg-amber-50 border-amber-400 text-amber-800'
                          : 'bg-blue-50 border-blue-400 text-blue-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm">{log.message}</div>
                        <div className="text-xs opacity-75 whitespace-nowrap">{log.timestamp}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No activity yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>WhatsApp Business Dashboard • Professional Edition • Real-time Monitoring</p>
          <p className="mt-1">
            Bot Server: localhost:3001 • WebSocket: {wsConnected ? 'Connected' : 'Disconnected'} • 
            Last Update: {formatDate(stats.lastUpdated)} • QR Endpoint: /ws/qr
          </p>
        </div>
      </div>
    </div>
  );
}