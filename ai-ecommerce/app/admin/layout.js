// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import Sidebar from "../../src/components/sidebar";
// import AppBar from "../../src/components/appbar";
// import { Footer } from "../../src/components/footer";
// import FCMTokenManager from "../../src/components/FCMTokenManager";
// import NotificationToast from "../../src/components/NotificationToast";
// import { useAuth } from "../../context/authContext";
// import { useNotification } from "../../hooks/useNotification";

// export default function AdminLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isClient, setIsClient] = useState(false);
  
//   const [connectionStatus, setConnectionStatus] = useState({
//     socketio: { 
//       connected: false, 
//       status: 'disconnected',
//       authenticated: false,
//       error: null
//     },
//     fcm: { 
//       ready: false, 
//       permission: 'default',
//       isInitialized: false,
//       hasToken: false,
//       error: null
//     }
//   });

//   const { user, loading: authLoading } = useAuth();
//   const { showNotification } = useNotification();
  
//   const socketInitializedRef = useRef(false);
//   const socketClientRef = useRef(null);
//   const notificationPermissionRequestedRef = useRef(false);
//   const showDevIndicators = process.env.NODE_ENV === 'development';

//   // Initialize client-side
//   useEffect(() => {
//     setIsClient(true);
    
//     // Check notification permission
//     if ('Notification' in window) {
//       setConnectionStatus(prev => ({
//         ...prev,
//         fcm: {
//           ...prev.fcm,
//           permission: Notification.permission
//         }
//       }));
//     }
//   }, []);

//   // ==================== REQUEST NOTIFICATION PERMISSION ====================
//   const handleRequestNotificationPermission = useCallback(async () => {
//     try {
//       if (window.Notification && Notification.permission === 'default') {
//         const permission = await Notification.requestPermission();
//         setConnectionStatus(prev => ({
//           ...prev,
//           fcm: {
//             ...prev.fcm,
//             permission: permission
//           }
//         }));
        
//         if (permission === 'granted') {
//           showNotification(
//             'Notifications Enabled',
//             'You will receive browser notifications for new orders',
//             'success',
//             4000
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Failed to request notification permission:', error);
//     }
//   }, [showNotification]);

//   // ==================== SINGLE SOCKET.IO INITIALIZATION ====================
//   const initializeSocketIO = useCallback(() => {
//     if (!isClient || !user || user.role !== 'admin' || socketInitializedRef.current) {
//       return;
//     }

//     console.log('🔗 LAYOUT: Initializing SINGLE Socket.IO connection...');
//     socketInitializedRef.current = true;

//     try {
//       // Dynamically import to avoid SSR issues
//       const { getSocketIOClient } = require('../../lib/websocket/socketio-client');
//       const socketClient = getSocketIOClient();
//       socketClientRef.current = socketClient;

//       // Set up connection listener
//       const handleConnectionChange = (connected) => {
//         console.log(`🔌 LAYOUT: Socket.IO ${connected ? 'connected' : 'disconnected'}`);
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             ...prev.socketio,
//             connected,
//             status: connected ? 'connected' : 'disconnected'
//           }
//         }));
//       };

//       // Set up state listener
//       const handleStateChange = (state) => {
//         console.log(`🔄 LAYOUT: Socket.IO state: ${state}`);
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             ...prev.socketio,
//             status: state,
//             connected: state === 'connected'
//           }
//         }));
//       };

//       // Set up authentication listener
//       const handleAuthenticated = (data) => {
//         console.log('✅ LAYOUT: Socket.IO authenticated');
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             ...prev.socketio,
//             authenticated: true,
//             error: null
//           }
//         }));
//       };

//       // ========== NOTIFICATION HANDLERS ==========
//       const handleNewOrder = (data) => {
//         console.log('🛍️ LAYOUT: New order received:', data);
//         const orderData = data.order || data;
        
//         // 1. Show notification using our notification hook
//         showNotification(
//           '🛍️ New Order Received!',
//           `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
//           'info',
//           5000
//         );
        
//         // 2. Show browser notification if permission granted
//         if (window.Notification && Notification.permission === 'granted') {
//           try {
//             new Notification('🛍️ New Order!', {
//               body: `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
//               icon: '/favicon.ico',
//               tag: `order-${orderData.orderNumber}`,
//               data: {
//                 orderId: orderData.id || orderData._id,
//                 orderNumber: orderData.orderNumber,
//                 type: 'NEW_ORDER'
//               }
//             });
//           } catch (notificationError) {
//             console.warn('Could not show browser notification:', notificationError);
//           }
//         }
        
//         // 3. Broadcast to ALL components via custom event
//         window.dispatchEvent(new CustomEvent('new-order-received', {
//           detail: orderData
//         }));
//       };

//       const handlePaymentUpdate = (data) => {
//         console.log('💰 LAYOUT: Payment update via Socket.IO:', data);
        
//         showNotification(
//           '💰 Payment Updated',
//           `Order #${data.orderNumber} payment is now ${data.newStatus || 'updated'}`,
//           'success',
//           4000
//         );
        
//         window.dispatchEvent(new CustomEvent('payment-updated', {
//           detail: data
//         }));
//       };

//       const handleOrderStatusUpdate = (data) => {
//         console.log('📦 LAYOUT: Order status update via Socket.IO:', data);
        
//         showNotification(
//           '📦 Order Status Updated',
//           `Order #${data.orderNumber} is now ${data.newStatus}`,
//           'info',
//           4000
//         );
        
//         window.dispatchEvent(new CustomEvent('order-status-updated', {
//           detail: data
//         }));
//       };

//       // Register listeners
//       socketClient.addConnectionListener(handleConnectionChange);
//       socketClient.addStateListener(handleStateChange);
//       socketClient.on('authenticated', handleAuthenticated);
//       socketClient.on('NEW_ORDER', handleNewOrder);
//       socketClient.on('PAYMENT_RECEIVED', handlePaymentUpdate);
//       socketClient.on('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
//       socketClient.on('FCM_TOKEN_REGISTERED', (data) => {
//         console.log('✅ LAYOUT: FCM token registered with server:', data);
//       });

//       // Connect ONLY ONCE
//       console.log('🔌 LAYOUT: Connecting Socket.IO...');
//       socketClient.connect(user);

//       // Check initial status after 3 seconds
//       setTimeout(() => {
//         const status = socketClient.getStatus();
//         console.log('📊 LAYOUT: Initial Socket.IO status:', status);
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             connected: status.isConnected,
//             authenticated: status.isAuthenticated,
//             status: status.state,
//             error: null
//           }
//         }));
//       }, 3000);

//       // Store cleanup function
//       return () => {
//         socketClient.removeConnectionListener(handleConnectionChange);
//         socketClient.removeStateListener(handleStateChange);
//         socketClient.off('authenticated', handleAuthenticated);
//         socketClient.off('NEW_ORDER', handleNewOrder);
//         socketClient.off('PAYMENT_RECEIVED', handlePaymentUpdate);
//         socketClient.off('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
//       };

//     } catch (error) {
//       console.error('❌ LAYOUT: Failed to initialize Socket.IO:', error);
//       setConnectionStatus(prev => ({
//         ...prev,
//         socketio: {
//           ...prev.socketio,
//           error: error.message,
//           connected: false,
//           status: 'error'
//         }
//       }));
//     }
//   }, [isClient, user, showNotification]);

//   // ==================== FCM INITIALIZATION ====================
//   const handleFCMInitialized = useCallback((result) => {
//     console.log('📱 LAYOUT: FCM initialized:', result);
    
//     setConnectionStatus(prev => ({
//       ...prev,
//       fcm: {
//         ...prev.fcm,
//         isInitialized: true,
//         hasToken: !!result?.token,
//         ready: true,
//         error: result?.error || null
//       }
//     }));

//     if (result?.success) {
//       showNotification(
//         'Push Notifications Ready',
//         'You will receive notifications for new orders',
//         'success',
//         3000
//       );
      
//       // Initialize Socket.IO after FCM is ready
//       initializeSocketIO();
//     } else if (result?.error) {
//       showNotification(
//         'Push Notifications Failed',
//         result.error,
//         'error',
//         5000
//       );
      
//       // Still initialize Socket.IO even if FCM fails
//       initializeSocketIO();
//     }
//   }, [showNotification, initializeSocketIO]);

//   // ==================== INITIALIZE SOCKET WHEN READY ====================
//   useEffect(() => {
//     if (isClient && user && user.role === 'admin' && !authLoading) {
//       // Request notification permission if not done
//       if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
//         notificationPermissionRequestedRef.current = true;
//         setTimeout(() => {
//           handleRequestNotificationPermission();
//         }, 2000);
//       }
      
//       // Initialize FCM first, which will then initialize Socket.IO
//       // (FCMTokenManager will call handleFCMInitialized)
//     }
//   }, [isClient, user, authLoading, handleRequestNotificationPermission]);

//   // ==================== CLEANUP ON UNMOUNT ====================
//   useEffect(() => {
//     return () => {
//       // Cleanup socket on unmount
//       if (socketClientRef.current) {
//         socketClientRef.current.disconnect('Layout unmounting');
//       }
//     };
//   }, []);

//   // Add this useEffect
//   useEffect(() => {
//     if (isClient && user && user.role === 'admin') {
//       // Load saved notifications on page load
//       const loadSavedNotifications = async () => {
//         try {
//           const response = await fetch('/api/notifications?limit=10');
//           if (response.ok) {
//             const data = await response.json();
//             if (data.success && data.notifications) {
//               console.log(`Loaded ${data.notifications.length} saved notifications`);
//               // You could store these in context or pass to NotificationToast
//             }
//           }
//         } catch (error) {
//           console.error('Error loading saved notifications:', error);
//         }
//       };
      
//       loadSavedNotifications();
//     }
//   }, [isClient, user]);

//   // ==================== UI HANDLERS ====================
//   const handleToggleSidebar = useCallback(() => {
//     setSidebarOpen(prev => !prev);
//   }, []);

//   const handleRefresh = useCallback(() => {
//     window.location.reload();
//   }, []);

//   const handleReconnectSocket = useCallback(() => {
//     if (socketClientRef.current && user) {
//       socketClientRef.current.disconnect();
//       setTimeout(() => {
//         socketClientRef.current.connect(user);
//         showNotification(
//           'Reconnecting...',
//           'Attempting to reconnect to real-time server',
//           'info',
//           3000
//         );
//       }, 1000);
//     }
//   }, [user, showNotification]);

//   const handleEnableNotifications = useCallback(() => {
//     handleRequestNotificationPermission();
//   }, [handleRequestNotificationPermission]);

//   // ==================== RENDER LOGIC ====================
//   if (!isClient) {
//     return (
//       <div style={{
//         display: 'flex',
//         minHeight: '100vh',
//         background: '#f8f9fa'
//       }}>
//         <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
//           <div style={{
//             width: '60px',
//             height: '60px',
//             border: '4px solid #e5e7eb',
//             borderTop: '4px solid #3b82f6',
//             borderRadius: '50%',
//             margin: '0 auto 20px',
//             animation: 'spin 1s linear infinite'
//           }} />
//           <style>{`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}</style>
//           <p style={{ color: '#6b7280' }}>Loading Admin Panel...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!authLoading && !user) {
//     return (
//       <div style={{
//         display: 'flex',
//         minHeight: '100vh',
//         background: '#f8f9fa',
//         alignItems: 'center',
//         justifyContent: 'center'
//       }}>
//         <div style={{
//           textAlign: 'center',
//           padding: '40px',
//           background: 'white',
//           borderRadius: '12px',
//           boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//           maxWidth: '400px',
//           width: '100%'
//         }}>
//           <h2 style={{ color: '#374151', marginBottom: '16px' }}>
//             Admin Access Required
//           </h2>
//           <p style={{ color: '#6b7280', marginBottom: '24px' }}>
//             Please log in with admin credentials to access this page.
//           </p>
//           <button
//             onClick={() => window.location.href = '/login'}
//             style={{
//               padding: '12px 24px',
//               background: '#3b82f6',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               fontSize: '16px',
//               fontWeight: '600'
//             }}
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       display: 'flex',
//       minHeight: '100vh',
//       background: '#f8f9fa',
//       position: 'relative'
//     }}>
//       {/* Sidebar */}
//       <div style={{  
//         position: 'fixed',  
//         left: 0,  
//         top: 0,  
//         height: '100vh',  
//         width: sidebarOpen ? '240px' : '80px',  
//         transition: 'width 0.3s ease',  
//         zIndex: 1000,
//         boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
//         background: 'white'
//       }}>  
//         <Sidebar collapsed={!sidebarOpen} />  
//       </div>  

//       {/* Main Content Area */}  
//       <div   
//         style={{   
//           flex: 1,   
//           display: 'flex',   
//           flexDirection: 'column',  
//           marginLeft: sidebarOpen ? '240px' : '80px',
//           transition: 'margin-left 0.3s ease',
//           minHeight: '100vh',  
//           width: '100%',
//           position: 'relative',  
//         }}  
//       >  
//         {/* AppBar */}  
//         <div style={{ 
//           position: 'sticky', 
//           top: 0, 
//           zIndex: 1100,
//           background: 'white',
//           boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//         }}>  
//           <AppBar  
//             title="Admin Panel"  
//             onToggleSidebar={handleToggleSidebar}  
//             onRefresh={handleRefresh}  
//             connectionStatus={connectionStatus}
//             onCheckSocketIO={handleReconnectSocket}
//             onEnableNotifications={handleEnableNotifications}
//             user={user}
//           />  
//         </div>  

//         {/* Page Content */}  
//         <div style={{   
//           flex: 1,   
//           padding: '25px',  
//           background: '#f8f9fa',  
//           minHeight: 'calc(100vh - 120px)',
//           position: 'relative',  
//           zIndex: 1
//         }}>  
//           {children}  
//         </div>  

//         {/* Footer */}  
//         <Footer />  
//       </div>  

//       {/* Notification Toast Container */}
//       <NotificationToast />

//       {/* FCM Token Manager (ONLY HERE - NOT in Dashboard) */}
//       {isClient && user && user.role === 'admin' && !authLoading && (
//         <div style={{ display: 'none' }}>
//           <FCMTokenManager onInitialized={handleFCMInitialized} />
//         </div>
//       )}

//       {/* Development indicators */}
//       {showDevIndicators && (
//         <div style={{
//           position: 'fixed',
//           bottom: '10px',
//           right: '10px',
//           background: 'rgba(0,0,0,0.8)',
//           color: 'white',
//           padding: '8px 12px',
//           borderRadius: '6px',
//           fontSize: '12px',
//           zIndex: 9999,
//           display: 'flex',
//           gap: '8px',
//           alignItems: 'center'
//         }}>
//           <span>🔗: {connectionStatus.socketio.connected ? '✅' : '❌'}</span>
//           <span>📱: {connectionStatus.fcm.ready ? '✅' : '❌'}</span>
//           <span>👤: {user ? '✅' : '❌'}</span>
//         </div>
//       )}
//     </div>
//   );
// }




// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import Sidebar from "../../src/components/sidebar";
// import AppBar from "../../src/components/appbar";
// import { Footer } from "../../src/components/footer";
// import FCMTokenManager from "../../src/components/FCMTokenManager";
// import NotificationToast from "../../src/components/NotificationToast";
// import { useAuth } from "../../context/AuthContext"; // ✅ Using YOUR new AuthContext
// import { useNotification } from "../../hooks/useNotification";
// import { useRouter } from "next/navigation";

// export default function AdminLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isClient, setIsClient] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
  
//   const [connectionStatus, setConnectionStatus] = useState({
//     socketio: { 
//       connected: false, 
//       status: 'disconnected',
//       authenticated: false,
//       error: null
//     },
//     fcm: { 
//       ready: false, 
//       permission: 'default',
//       isInitialized: false,
//       hasToken: false,
//       error: null
//     }
//   });

//   // ✅ Using YOUR new AuthContext (from your provided code)
//   const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
//   const router = useRouter();
//   const { showNotification } = useNotification();
  
//   const socketInitializedRef = useRef(false);
//   const socketClientRef = useRef(null);
//   const notificationPermissionRequestedRef = useRef(false);
//   const showDevIndicators = process.env.NODE_ENV === 'development';

//   // Initialize client-side and check mobile
//   useEffect(() => {
//     setIsClient(true);
    
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
    
//     // Check notification permission
//     if ('Notification' in window) {
//       setConnectionStatus(prev => ({
//         ...prev,
//         fcm: {
//           ...prev.fcm,
//           permission: Notification.permission
//         }
//       }));
//     }
    
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Auto-close sidebar on mobile when clicking content
//   useEffect(() => {
//     const handleClickOutside = () => {
//       if (isMobile && sidebarOpen) {
//         setSidebarOpen(false);
//       }
//     };

//     const mainContent = document.querySelector('.main-content');
//     if (mainContent) {
//       mainContent.addEventListener('click', handleClickOutside);
//     }

//     return () => {
//       if (mainContent) {
//         mainContent.removeEventListener('click', handleClickOutside);
//       }
//     };
//   }, [isMobile, sidebarOpen]);

//   // ==================== REQUEST NOTIFICATION PERMISSION ====================
//   const handleRequestNotificationPermission = useCallback(async () => {
//     try {
//       if (window.Notification && Notification.permission === 'default') {
//         const permission = await Notification.requestPermission();
//         setConnectionStatus(prev => ({
//           ...prev,
//           fcm: {
//             ...prev.fcm,
//             permission: permission
//           }
//         }));
        
//         if (permission === 'granted') {
//           showNotification(
//             'Notifications Enabled',
//             'You will receive browser notifications for new orders',
//             'success',
//             4000
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Failed to request notification permission:', error);
//     }
//   }, [showNotification]);

//   // ==================== SINGLE SOCKET.IO INITIALIZATION ====================
//   const initializeSocketIO = useCallback(() => {
//     if (!isClient || !user || user.role !== 'admin' || socketInitializedRef.current) {
//       return;
//     }

//     console.log('🔗 LAYOUT: Initializing SINGLE Socket.IO connection...');
//     socketInitializedRef.current = true;

//     try {
//       // Dynamically import to avoid SSR issues
//       const { getSocketIOClient } = require('../../lib/websocket/socketio-client');
//       const socketClient = getSocketIOClient();
//       socketClientRef.current = socketClient;

//       // Set up connection listener
//       const handleConnectionChange = (connected) => {
//         console.log(`🔌 LAYOUT: Socket.IO ${connected ? 'connected' : 'disconnected'}`);
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             ...prev.socketio,
//             connected,
//             status: connected ? 'connected' : 'disconnected'
//           }
//         }));
//       };

//       // Set up state listener
//       const handleStateChange = (state) => {
//         console.log(`🔄 LAYOUT: Socket.IO state: ${state}`);
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             ...prev.socketio,
//             status: state,
//             connected: state === 'connected'
//           }
//         }));
//       };

//       // Set up authentication listener
//       const handleAuthenticated = (data) => {
//         console.log('✅ LAYOUT: Socket.IO authenticated');
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             ...prev.socketio,
//             authenticated: true,
//             error: null
//           }
//         }));
//       };

//       // ========== NOTIFICATION HANDLERS ==========
//       const handleNewOrder = (data) => {
//         console.log('🛍️ LAYOUT: New order received:', data);
//         const orderData = data.order || data;
        
//         // 1. Show notification using our notification hook
//         showNotification(
//           '🛍️ New Order Received!',
//           `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
//           'info',
//           5000
//         );
        
//         // 2. Show browser notification if permission granted
//         if (window.Notification && Notification.permission === 'granted') {
//           try {
//             new Notification('🛍️ New Order!', {
//               body: `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
//               icon: '/favicon.ico',
//               tag: `order-${orderData.orderNumber}`,
//               data: {
//                 orderId: orderData.id || orderData._id,
//                 orderNumber: orderData.orderNumber,
//                 type: 'NEW_ORDER'
//               }
//             });
//           } catch (notificationError) {
//             console.warn('Could not show browser notification:', notificationError);
//           }
//         }
        
//         // 3. Broadcast to ALL components via custom event
//         window.dispatchEvent(new CustomEvent('new-order-received', {
//           detail: orderData
//         }));
//       };

//       const handlePaymentUpdate = (data) => {
//         console.log('💰 LAYOUT: Payment update via Socket.IO:', data);
        
//         showNotification(
//           '💰 Payment Updated',
//           `Order #${data.orderNumber} payment is now ${data.newStatus || 'updated'}`,
//           'success',
//           4000
//         );
        
//         window.dispatchEvent(new CustomEvent('payment-updated', {
//           detail: data
//         }));
//       };

//       const handleOrderStatusUpdate = (data) => {
//         console.log('📦 LAYOUT: Order status update via Socket.IO:', data);
        
//         showNotification(
//           '📦 Order Status Updated',
//           `Order #${data.orderNumber} is now ${data.newStatus}`,
//           'info',
//           4000
//         );
        
//         window.dispatchEvent(new CustomEvent('order-status-updated', {
//           detail: data
//         }));
//       };

//       // Register listeners
//       socketClient.addConnectionListener(handleConnectionChange);
//       socketClient.addStateListener(handleStateChange);
//       socketClient.on('authenticated', handleAuthenticated);
//       socketClient.on('NEW_ORDER', handleNewOrder);
//       socketClient.on('PAYMENT_RECEIVED', handlePaymentUpdate);
//       socketClient.on('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
//       socketClient.on('FCM_TOKEN_REGISTERED', (data) => {
//         console.log('✅ LAYOUT: FCM token registered with server:', data);
//       });

//       // Connect ONLY ONCE
//       console.log('🔌 LAYOUT: Connecting Socket.IO...');
//       socketClient.connect(user);

//       // Check initial status after 3 seconds
//       setTimeout(() => {
//         const status = socketClient.getStatus();
//         console.log('📊 LAYOUT: Initial Socket.IO status:', status);
//         setConnectionStatus(prev => ({
//           ...prev,
//           socketio: {
//             connected: status.isConnected,
//             authenticated: status.isAuthenticated,
//             status: status.state,
//             error: null
//           }
//         }));
//       }, 3000);

//       // Store cleanup function
//       return () => {
//         socketClient.removeConnectionListener(handleConnectionChange);
//         socketClient.removeStateListener(handleStateChange);
//         socketClient.off('authenticated', handleAuthenticated);
//         socketClient.off('NEW_ORDER', handleNewOrder);
//         socketClient.off('PAYMENT_RECEIVED', handlePaymentUpdate);
//         socketClient.off('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
//       };

//     } catch (error) {
//       console.error('❌ LAYOUT: Failed to initialize Socket.IO:', error);
//       setConnectionStatus(prev => ({
//         ...prev,
//         socketio: {
//           ...prev.socketio,
//           error: error.message,
//           connected: false,
//           status: 'error'
//         }
//       }));
//     }
//   }, [isClient, user, showNotification]);

//   // ==================== FCM INITIALIZATION ====================
//   const handleFCMInitialized = useCallback((result) => {
//     console.log('📱 LAYOUT: FCM initialized:', result);
    
//     setConnectionStatus(prev => ({
//       ...prev,
//       fcm: {
//         ...prev.fcm,
//         isInitialized: true,
//         hasToken: !!result?.token,
//         ready: true,
//         error: result?.error || null
//       }
//     }));

//     if (result?.success) {
//       showNotification(
//         'Push Notifications Ready',
//         'You will receive notifications for new orders',
//         'success',
//         3000
//       );
      
//       // Initialize Socket.IO after FCM is ready
//       initializeSocketIO();
//     } else if (result?.error) {
//       showNotification(
//         'Push Notifications Failed',
//         result.error,
//         'error',
//         5000
//       );
      
//       // Still initialize Socket.IO even if FCM fails
//       initializeSocketIO();
//     }
//   }, [showNotification, initializeSocketIO]);

//   // ==================== INITIALIZE SOCKET WHEN READY ====================
//   useEffect(() => {
//     if (isClient && user && user.role === 'admin' && !authLoading) {
//       // Auto-close sidebar on mobile by default
//       if (isMobile) {
//         setSidebarOpen(false);
//       }
      
//       // Request notification permission if not done
//       if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
//         notificationPermissionRequestedRef.current = true;
//         setTimeout(() => {
//           handleRequestNotificationPermission();
//         }, 2000);
//       }
      
//       // Initialize FCM first, which will then initialize Socket.IO
//       // (FCMTokenManager will call handleFCMInitialized)
//     }
//   }, [isClient, user, authLoading, isMobile, handleRequestNotificationPermission]);

//   // ==================== CLEANUP ON UNMOUNT ====================
//   useEffect(() => {
//     return () => {
//       // Cleanup socket on unmount
//       if (socketClientRef.current) {
//         socketClientRef.current.disconnect('Layout unmounting');
//       }
//     };
//   }, []);

//   // Load saved notifications
//   useEffect(() => {
//     if (isClient && user && user.role === 'admin') {
//       const loadSavedNotifications = async () => {
//         try {
//           const response = await fetch('/api/notifications?limit=10');
//           if (response.ok) {
//             const data = await response.json();
//             if (data.success && data.notifications) {
//               console.log(`Loaded ${data.notifications.length} saved notifications`);
//             }
//           }
//         } catch (error) {
//           console.error('Error loading saved notifications:', error);
//         }
//       };
      
//       loadSavedNotifications();
//     }
//   }, [isClient, user]);

//   // ==================== UI HANDLERS ====================
//   const handleToggleSidebar = useCallback(() => {
//     setSidebarOpen(prev => !prev);
//   }, []);

//   const handleRefresh = useCallback(() => {
//     window.location.reload();
//   }, []);

//   const handleReconnectSocket = useCallback(() => {
//     if (socketClientRef.current && user) {
//       socketClientRef.current.disconnect();
//       setTimeout(() => {
//         socketClientRef.current.connect(user);
//         showNotification(
//           'Reconnecting...',
//           'Attempting to reconnect to real-time server',
//           'info',
//           3000
//         );
//       }, 1000);
//     }
//   }, [user, showNotification]);

//   const handleEnableNotifications = useCallback(() => {
//     handleRequestNotificationPermission();
//   }, [handleRequestNotificationPermission]);

//   const handleCloseSidebar = useCallback(() => {
//     setSidebarOpen(false);
//   }, []);

//   // ==================== NEXTAUTH LOGOUT HANDLER ====================
//   const handleLogout = useCallback(async () => {
//     try {
//       // Use the logout function from YOUR AuthContext
//       await logout({
//         redirectTo: '/login',
//         clearFCM: true,
//         notifyOtherTabs: true
//       });
      
//       // Cleanup socket connection
//       if (socketClientRef.current) {
//         socketClientRef.current.disconnect('User logging out');
//       }
      
//     } catch (error) {
//       console.error('❌ [AdminLayout] Logout error:', error);
//       // Force redirect on error
//       window.location.href = '/login';
//     }
//   }, [logout]);

//   // ==================== RENDER LOGIC ====================
//   if (!isClient) {
//     return (
//       <div style={{
//         display: 'flex',
//         minHeight: '100vh',
//         background: '#f8f9fa'
//       }}>
//         <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
//           <div style={{
//             width: '60px',
//             height: '60px',
//             border: '4px solid #e5e7eb',
//             borderTop: '4px solid #3b82f6',
//             borderRadius: '50%',
//             margin: '0 auto 20px',
//             animation: 'spin 1s linear infinite'
//           }} />
//           <style>{`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}</style>
//           <p style={{ color: '#6b7280' }}>Loading Admin Panel...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while auth is loading
//   if (authLoading) {
//     return (
//       <div style={{
//         display: 'flex',
//         minHeight: '100vh',
//         background: '#f8f9fa'
//       }}>
//         <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
//           <div style={{
//             width: '60px',
//             height: '60px',
//             border: '4px solid #e5e7eb',
//             borderTop: '4px solid #3b82f6',
//             borderRadius: '50%',
//             margin: '0 auto 20px',
//             animation: 'spin 1s linear infinite'
//           }} />
//           <style>{`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}</style>
//           <p style={{ color: '#6b7280' }}>Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // Redirect if not authenticated or not admin
//   if (!isAuthenticated || !user || user.role !== 'admin') {
//     // Wait for client-side to handle redirect
//     if (typeof window !== 'undefined') {
//       setTimeout(() => {
//         router.push('/login');
//       }, 100);
//     }
    
//     return (
//       <div style={{
//         display: 'flex',
//         minHeight: '100vh',
//         background: '#f8f9fa',
//         alignItems: 'center',
//         justifyContent: 'center'
//       }}>
//         <div style={{ textAlign: 'center', padding: '40px' }}>
//           <div style={{
//             width: '60px',
//             height: '60px',
//             border: '4px solid #e5e7eb',
//             borderTop: '4px solid #3b82f6',
//             borderRadius: '50%',
//             margin: '0 auto 20px',
//             animation: 'spin 1s linear infinite'
//           }} />
//           <p style={{ color: '#6b7280' }}>Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   // Sidebar width calculations
//   const sidebarWidth = isMobile ? (sidebarOpen ? '240px' : '0') : (sidebarOpen ? '240px' : '80px');
//   const mainContentMargin = isMobile ? '0' : (sidebarOpen ? '240px' : '80px');

//   return (
//     <div style={{
//       display: 'flex',
//       minHeight: '100vh',
//       background: '#f8f9fa',
//       position: 'relative'
//     }}>
//       {/* Sidebar */}
//       <div style={{  
//         position: isMobile ? 'fixed' : 'fixed',  
//         left: 0,  
//         top: 0,  
//         height: '100vh',  
//         width: sidebarWidth,  
//         transition: 'width 0.3s ease',  
//         zIndex: isMobile ? 2000 : 1000,
//         boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.2)' : '2px 0 10px rgba(0,0,0,0.1)',
//         background: 'white',
//         overflowX: 'hidden',
//         overflowY: 'auto',
//         WebkitOverflowScrolling: 'touch'
//       }}>  
//         {isMobile && sidebarOpen && (
//           <div style={{
//             position: 'absolute',
//             top: '10px',
//             right: '10px',
//             zIndex: 1001
//           }}>
//             <button
//               onClick={handleCloseSidebar}
//               style={{
//                 background: '#ef4444',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '50%',
//                 width: '32px',
//                 height: '32px',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '18px',
//                 fontWeight: 'bold'
//               }}
//             >
//               ×
//             </button>
//           </div>
//         )}
//         <Sidebar 
//           collapsed={isMobile ? false : !sidebarOpen} 
//           onItemClick={isMobile ? handleCloseSidebar : undefined}
//           onLogout={handleLogout}
//           user={user}
//         />  
//       </div>  

//       {/* Mobile Overlay */}
//       {isMobile && sidebarOpen && (
//         <div 
//           onClick={handleCloseSidebar}
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: 'rgba(0,0,0,0.5)',
//             zIndex: 1900,
//             animation: 'fadeIn 0.3s ease'
//           }}
//         />
//       )}

//       {/* Main Content Area */}  
//       <div   
//         className="main-content"
//         style={{   
//           flex: 1,   
//           display: 'flex',   
//           flexDirection: 'column',  
//           marginLeft: mainContentMargin,
//           transition: isMobile ? 'none' : 'margin-left 0.3s ease',
//           minHeight: '100vh',  
//           width: `calc(100% - ${sidebarWidth})`,
//           maxWidth: '100%',
//           overflowX: 'hidden',
//           position: 'relative',  
//         }}  
//       >  
//         {/* AppBar */}  
//         <div style={{ 
//           position: 'sticky', 
//           top: 0, 
//           zIndex: 1000,
//           background: 'white',
//           boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//         }}>  
//           <AppBar  
//             title="Admin Panel"  
//             onToggleSidebar={handleToggleSidebar}  
//             onRefresh={handleRefresh}  
//             connectionStatus={connectionStatus}
//             onCheckSocketIO={handleReconnectSocket}
//             onEnableNotifications={handleEnableNotifications}
//             user={user}
//             isMobile={isMobile}
//             sidebarOpen={sidebarOpen}
//             onLogout={handleLogout}
//           />  
//         </div>  

//         {/* Page Content */}  
//         <div style={{   
//           flex: 1,   
//           padding: isMobile ? '16px' : '24px',  
//           background: '#f8f9fa',  
//           minHeight: 'calc(100vh - 120px)',
//           position: 'relative',  
//           zIndex: 1,
//           overflowX: 'hidden',
//           maxWidth: '100%'
//         }}>  
//           {children}  
//         </div>  

//         {/* Footer */}  
//         <Footer isMobile={isMobile} />  
//       </div>  

//       {/* Notification Toast Container */}
//       <NotificationToast />

//       {/* FCM Token Manager (ONLY HERE - NOT in Dashboard) */}
//       {isClient && user && user.role === 'admin' && !authLoading && (
//         <div style={{ display: 'none' }}>
//           <FCMTokenManager onInitialized={handleFCMInitialized} />
//         </div>
//       )}

//       {/* Development indicators */}
//       {showDevIndicators && (
//         <div style={{
//           position: 'fixed',
//           bottom: isMobile ? '60px' : '10px',
//           right: isMobile ? '10px' : '10px',
//           background: 'rgba(0,0,0,0.8)',
//           color: 'white',
//           padding: '6px 10px',
//           borderRadius: '6px',
//           fontSize: isMobile ? '10px' : '12px',
//           zIndex: 9999,
//           display: 'flex',
//           gap: '6px',
//           alignItems: 'center',
//           flexWrap: 'wrap',
//           maxWidth: isMobile ? '140px' : 'auto'
//         }}>
//           <span>🔗: {connectionStatus.socketio.connected ? '✅' : '❌'}</span>
//           <span>📱: {connectionStatus.fcm.ready ? '✅' : '❌'}</span>
//           <span>👤: {user ? '✅' : '❌'}</span>
//           <span>🔐: {isAuthenticated ? '✅' : '❌'}</span>
//         </div>
//       )}

//       {/* Mobile Bottom Navigation Helper */}
//       {isMobile && (
//         <style jsx global>{`
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }
          
//           /* Improve mobile scrolling */
//           body {
//             -webkit-overflow-scrolling: touch;
//           }
          
//           /* Prevent text selection on tap */
//           * {
//             -webkit-tap-highlight-color: transparent;
//           }
          
//           /* Better touch handling */
//           button, a {
//             min-height: 44px;
//             min-width: 44px;
//           }
          
//           /* Hide scrollbars but keep functionality */
//           ::-webkit-scrollbar {
//             width: 4px;
//             height: 4px;
//           }
          
//           ::-webkit-scrollbar-track {
//             background: #f1f1f1;
//           }
          
//           ::-webkit-scrollbar-thumb {
//             background: #888;
//             border-radius: 2px;
//           }
          
//           ::-webkit-scrollbar-thumb:hover {
//             background: #555;
//           }
//         `}</style>
//       )}
//     </div>
//   );
// }






"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../../src/components/sidebar";
import AppBar from "../../src/components/appbar";
import { Footer } from "../../src/components/footer";
import FCMTokenManager from "../../src/components/FCMTokenManager";
import NotificationToast from "../../src/components/NotificationToast";
import { useAuth } from '../../context/AuthContext';
import { useNotification } from "../../hooks/useNotification";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const [connectionStatus, setConnectionStatus] = useState({
    socketio: { 
      connected: false, 
      status: 'disconnected',
      authenticated: false,
      error: null
    },
    fcm: { 
      ready: false, 
      permission: 'default',
      isInitialized: false,
      hasToken: false,
      error: null
    }
  });

  // ✅ CORRECT: Properly using useAuth hook
  const { 
    user, 
    loading: authLoading, 
    logout, 
    isAuthenticated,
    isActive,           // ✅ Added: Check if account is active
    accountStatus,      // ✅ Added: Get account status
    hasRole,           // ✅ Added: Role checking
    refreshSession     // ✅ Added: Session refresh capability
  } = useAuth();
  
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const socketInitializedRef = useRef(false);
  const socketClientRef = useRef(null);
  const notificationPermissionRequestedRef = useRef(false);
  const showDevIndicators = process.env.NODE_ENV === 'development';
  const resizeTimeoutRef = useRef(null);
  const authCheckPerformedRef = useRef(false);

  // ==================== AUTHENTICATION CHECK ====================
  useEffect(() => {
    // Prevent multiple checks
    if (authCheckPerformedRef.current || authLoading) return;
    
    const checkAuth = async () => {
      authCheckPerformedRef.current = true;
      
      // Wait for auth to be checked
      if (authLoading) return;
      
      // If not authenticated or not admin, redirect
      if (!isAuthenticated || !user) {
        console.log('🔐 [AdminLayout] Not authenticated, redirecting to login');
        router.replace('/login?callbackUrl=/admin/dashboards');
        return;
      }
      
      // ✅ Check if account is active
      if (!isActive) {
        console.log('🔐 [AdminLayout] Account not active:', accountStatus);
        
        // Redirect based on account status
        if (accountStatus === 'pending') {
          router.replace(`/verify-email?email=${encodeURIComponent(user.email)}&callbackUrl=/admin/dashboards`);
        } else if (accountStatus === 'inactive') {
          router.replace('/account-inactive');
        } else if (accountStatus === 'suspended') {
          router.replace('/account-suspended');
        } else if (accountStatus === 'deleted') {
          // Force logout for deleted accounts
          await logout({ notifyOtherTabs: true });
          router.replace('/login?error=account_deleted');
        }
        return;
      }
      
      // Check if user has admin role
      if (!hasRole('admin')) {
        console.log('🔐 [AdminLayout] User is not admin, redirecting to dashboard');
        router.replace('/dashboard');
        return;
      }
      
      console.log('🔐 [AdminLayout] Authentication verified:', {
        email: user.email,
        role: user.role,
        status: accountStatus,
        isActive
      });
    };
    
    checkAuth();
  }, [isAuthenticated, user, authLoading, router, hasRole, isActive, accountStatus, logout]);

  // ==================== DEVICE DETECTION ====================
  const checkDevice = useCallback(() => {
    if (!isClient) return;
    
    const width = window.innerWidth;
    
    // Mobile: < 768px, Tablet: 768px - 1024px, Desktop: > 1024px
    const mobile = width < 768;
    const tablet = width >= 768 && width <= 1024;
    
    setIsMobile(mobile);
    setIsTablet(tablet);
    
    // Auto-collapse sidebar on mobile
    if (mobile) {
      setSidebarCollapsed(true);
    } else if (tablet) {
      setSidebarCollapsed(false);
    }
  }, [isClient]);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    setIsClient(true);
    checkDevice();
    
    // Debounced resize handler
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(checkDevice, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Check notification permission
    if ('Notification' in window) {
      setConnectionStatus(prev => ({
        ...prev,
        fcm: {
          ...prev.fcm,
          permission: Notification.permission
        }
      }));
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [checkDevice]);

  // ==================== SIDEBAR TOGGLE LOGIC ====================
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  // Close sidebar on mobile when clicking outside or content
  useEffect(() => {
    if (!isMobile || sidebarCollapsed) return;

    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.sidebar-container');
      const toggleButtons = document.querySelectorAll('.sidebar-toggle, .menu-toggle');
      
      let isClickInsideSidebar = sidebar?.contains(e.target);
      let isClickOnToggle = false;
      
      toggleButtons.forEach(button => {
        if (button.contains(e.target)) {
          isClickOnToggle = true;
        }
      });

      if (!isClickInsideSidebar && !isClickOnToggle) {
        setSidebarCollapsed(true);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, sidebarCollapsed]);

  // ==================== NOTIFICATION PERMISSION ====================
  const handleRequestNotificationPermission = useCallback(async () => {
    try {
      if (window.Notification && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setConnectionStatus(prev => ({
          ...prev,
          fcm: {
            ...prev.fcm,
            permission: permission
          }
        }));
        
        if (permission === 'granted') {
          showNotification(
            'Notifications Enabled',
            'You will receive browser notifications for new orders',
            'success',
            4000
          );
        }
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }, [showNotification]);

  // ==================== SOCKET.IO INITIALIZATION ====================
  const initializeSocketIO = useCallback(() => {
    // ✅ Only initialize if user is authenticated, active, and admin
    if (!isClient || !user || !isActive || !hasRole('admin') || socketInitializedRef.current) {
      return;
    }

    console.log('🔗 LAYOUT: Initializing Socket.IO connection...');
    socketInitializedRef.current = true;

    try {
      const { getSocketIOClient } = require('../../lib/websocket/socketio-client');
      const socketClient = getSocketIOClient();
      socketClientRef.current = socketClient;

      // Set up connection listener
      const handleConnectionChange = (connected) => {
        setConnectionStatus(prev => ({
          ...prev,
          socketio: {
            ...prev.socketio,
            connected,
            status: connected ? 'connected' : 'disconnected'
          }
        }));
      };

      const handleStateChange = (state) => {
        setConnectionStatus(prev => ({
          ...prev,
          socketio: {
            ...prev.socketio,
            status: state,
            connected: state === 'connected'
          }
        }));
      };

      const handleAuthenticated = (data) => {
        setConnectionStatus(prev => ({
          ...prev,
          socketio: {
            ...prev.socketio,
            authenticated: true,
            error: null
          }
        }));
      };

      const handleNewOrder = (data) => {
        const orderData = data.order || data;
        
        showNotification(
          '🛍️ New Order Received!',
          `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
          'info',
          5000
        );
        
        if (window.Notification && Notification.permission === 'granted') {
          try {
            new Notification('🛍️ New Order!', {
              body: `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
              icon: '/favicon.ico',
              tag: `order-${orderData.orderNumber}`,
              data: {
                orderId: orderData.id || orderData._id,
                orderNumber: orderData.orderNumber,
                type: 'NEW_ORDER'
              }
            });
          } catch (notificationError) {
            console.warn('Could not show browser notification:', notificationError);
          }
        }
        
        window.dispatchEvent(new CustomEvent('new-order-received', {
          detail: orderData
        }));
      };

      const handlePaymentUpdate = (data) => {
        showNotification(
          '💰 Payment Updated',
          `Order #${data.orderNumber} payment is now ${data.newStatus || 'updated'}`,
          'success',
          4000
        );
        
        window.dispatchEvent(new CustomEvent('payment-updated', {
          detail: data
        }));
      };

      const handleOrderStatusUpdate = (data) => {
        showNotification(
          '📦 Order Status Updated',
          `Order #${data.orderNumber} is now ${data.newStatus}`,
          'info',
          4000
        );
        
        window.dispatchEvent(new CustomEvent('order-status-updated', {
          detail: data
        }));
      };

      socketClient.addConnectionListener(handleConnectionChange);
      socketClient.addStateListener(handleStateChange);
      socketClient.on('authenticated', handleAuthenticated);
      socketClient.on('NEW_ORDER', handleNewOrder);
      socketClient.on('PAYMENT_RECEIVED', handlePaymentUpdate);
      socketClient.on('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
      socketClient.on('FCM_TOKEN_REGISTERED', (data) => {
        console.log('✅ LAYOUT: FCM token registered with server:', data);
      });

      socketClient.connect(user);

      setTimeout(() => {
        const status = socketClient.getStatus();
        setConnectionStatus(prev => ({
          ...prev,
          socketio: {
            connected: status.isConnected,
            authenticated: status.isAuthenticated,
            status: status.state,
            error: null
          }
        }));
      }, 3000);

      return () => {
        socketClient.removeConnectionListener(handleConnectionChange);
        socketClient.removeStateListener(handleStateChange);
        socketClient.off('authenticated', handleAuthenticated);
        socketClient.off('NEW_ORDER', handleNewOrder);
        socketClient.off('PAYMENT_RECEIVED', handlePaymentUpdate);
        socketClient.off('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
      };

    } catch (error) {
      console.error('❌ LAYOUT: Failed to initialize Socket.IO:', error);
      setConnectionStatus(prev => ({
        ...prev,
        socketio: {
          ...prev.socketio,
          error: error.message,
          connected: false,
          status: 'error'
        }
      }));
    }
  }, [isClient, user, isActive, hasRole, showNotification]);

  // ==================== FCM INITIALIZATION ====================
  const handleFCMInitialized = useCallback((result) => {
    console.log('📱 LAYOUT: FCM initialized:', result);
    
    setConnectionStatus(prev => ({
      ...prev,
      fcm: {
        ...prev.fcm,
        isInitialized: true,
        hasToken: !!result?.token,
        ready: true,
        error: result?.error || null
      }
    }));

    if (result?.success) {
      showNotification(
        'Push Notifications Ready',
        'You will receive notifications for new orders',
        'success',
        3000
      );
      initializeSocketIO();
    } else if (result?.error) {
      showNotification(
        'Push Notifications Failed',
        result.error,
        'error',
        5000
      );
      initializeSocketIO();
    }
  }, [showNotification, initializeSocketIO]);

  // ==================== AUTO-INITIALIZATION ====================
  useEffect(() => {
    // ✅ Only proceed if user is authenticated, active, and admin
    if (isClient && user && isActive && hasRole('admin') && !authLoading) {
      if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
        notificationPermissionRequestedRef.current = true;
        setTimeout(() => {
          handleRequestNotificationPermission();
        }, 2000);
      }
    }
  }, [isClient, user, authLoading, handleRequestNotificationPermission, isActive, hasRole]);

  // ==================== CLEANUP ====================
  useEffect(() => {
    return () => {
      if (socketClientRef.current) {
        socketClientRef.current.disconnect('Layout unmounting');
      }
    };
  }, []);

  // ==================== OTHER HANDLERS ====================
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleReconnectSocket = useCallback(() => {
    if (socketClientRef.current && user && isActive) {
      socketClientRef.current.disconnect();
      setTimeout(() => {
        socketClientRef.current.connect(user);
        showNotification(
          'Reconnecting...',
          'Attempting to reconnect to real-time server',
          'info',
          3000
        );
      }, 1000);
    }
  }, [user, showNotification, isActive]);

  const handleEnableNotifications = useCallback(() => {
    handleRequestNotificationPermission();
  }, [handleRequestNotificationPermission]);

  const handleLogout = useCallback(async () => {
    try {
      await logout({
        redirectTo: '/login',
        clearFCM: true,
        notifyOtherTabs: true
      });
      
      if (socketClientRef.current) {
        socketClientRef.current.disconnect('User logging out');
      }
      
    } catch (error) {
      console.error('❌ [AdminLayout] Logout error:', error);
      window.location.href = '/login';
    }
  }, [logout]);

  // ==================== RESPONSIVE SIDEBAR LOGIC ====================
  const getSidebarWidth = () => {
    if (isMobile) {
      return sidebarCollapsed ? '0px' : '85vw';
    } else if (isTablet) {
      return sidebarCollapsed ? '70px' : '220px';
    } else {
      return sidebarCollapsed ? '80px' : '240px';
    }
  };

  const getMainContentMargin = () => {
    if (isMobile) {
      return '0px';
    } else if (isTablet) {
      return sidebarCollapsed ? '70px' : '220px';
    } else {
      return sidebarCollapsed ? '80px' : '240px';
    }
  };

  // ==================== RENDER LOGIC ====================
  
  // Show loading state while auth is being checked
  if (authLoading || !authCheckPerformedRef.current) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8f9fa;
          }
          .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          p {
            color: #6b7280;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  // Show loading for initial client render
  if (!isClient) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Admin Panel...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8f9fa;
          }
          .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          p {
            color: #6b7280;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated or not admin, show redirect message
  // (actual redirect happens in useEffect)
  if (!isAuthenticated || !user || !hasRole('admin') || !isActive) {
    return (
      <div className="redirect-container">
        <div className="spinner"></div>
        <p>
          {!isAuthenticated && 'Redirecting to login...'}
          {isAuthenticated && !hasRole('admin') && 'You do not have permission to access this area...'}
          {isAuthenticated && hasRole('admin') && !isActive && `Account is ${accountStatus}...`}
        </p>
        <style jsx>{`
          .redirect-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8f9fa;
          }
          .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          p {
            color: #6b7280;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  const sidebarWidth = getSidebarWidth();
  const mainContentMargin = getMainContentMargin();

  return (
    <>
      {/* Head Component for Viewport Meta Tag */}
      {isClient && (
        <Head>
          <meta 
            name="viewport" 
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
          />
        </Head>
      )}

      <div className="admin-layout-container">
        {/* Sidebar */}
        <div 
          className="sidebar-container"
          style={{  
            position: isMobile ? 'fixed' : 'fixed',  
            left: 0,  
            top: 0,  
            height: '100vh',  
            width: sidebarWidth,  
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',  
            zIndex: isMobile ? 2000 : 1000,
            boxShadow: isMobile && !sidebarCollapsed ? '4px 0 20px rgba(0,0,0,0.15)' : '2px 0 10px rgba(0,0,0,0.08)',
            background: 'white',
            overflowX: 'hidden',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}  
        >  
          {isMobile && !sidebarCollapsed && (
            <div className="mobile-sidebar-close">
              <button
                className="sidebar-toggle"
                onClick={handleToggleSidebar}
                aria-label="Close sidebar"
              >
                ×
              </button>
            </div>
          )}
          <Sidebar 
            collapsed={sidebarCollapsed}
            onCollapseChange={handleSidebarCollapse}
            isMobile={isMobile}
            isTablet={isTablet}
            user={user} // ✅ Pass user to Sidebar if needed
          />  
        </div>  

        {/* Mobile Overlay */}
        {isMobile && !sidebarCollapsed && (
          <div 
            className="mobile-overlay"
            onClick={() => setSidebarCollapsed(true)}
            onTouchStart={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Main Content Area */}  
        <div   
          className="main-content"
          style={{   
            flex: 1,   
            display: 'flex',   
            flexDirection: 'column',  
            marginLeft: mainContentMargin,
            transition: isMobile ? 'none' : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '100vh',  
            width: `calc(100% - ${mainContentMargin})`,
            maxWidth: '100%',
            overflowX: 'hidden',
            position: 'relative',  
          }}  
        >  
          {/* AppBar */}  
          <div className="appbar-container">  
            <AppBar  
              title="Admin Panel"  
              onToggleSidebar={handleToggleSidebar}  
              onRefresh={handleRefresh}  
              connectionStatus={connectionStatus}
              onCheckSocketIO={handleReconnectSocket}
              onEnableNotifications={handleEnableNotifications}
              onLogout={handleLogout} // ✅ Pass logout handler
              user={user}
              isMobile={isMobile}
              isTablet={isTablet}
              sidebarCollapsed={sidebarCollapsed}
            />  
          </div>  

          {/* Page Content */}  
          <main className="page-content">  
            {children}  
          </main>  

          {/* Footer */}  
          <Footer isMobile={isMobile} isTablet={isTablet} />  
        </div>  

        {/* Notification Toast Container */}
        <NotificationToast />

        {/* FCM Token Manager - Only render for admin users */}
        {isClient && user && hasRole('admin') && isActive && !authLoading && (
          <div style={{ display: 'none' }}>
            <FCMTokenManager onInitialized={handleFCMInitialized} />
          </div>
        )}

        {/* Development indicators */}
        {showDevIndicators && (
          <div className="dev-indicators">
            <span>🔗: {connectionStatus.socketio.connected ? '✅' : '❌'}</span>
            <span>📱: {connectionStatus.fcm.ready ? '✅' : '❌'}</span>
            <span>👤: {user ? '✅' : '❌'}</span>
            <span>🔐: {isAuthenticated ? '✅' : '❌'}</span>
            <span>⭐: {hasRole('admin') ? '✅' : '❌'}</span>
            <span>💚: {isActive ? '✅' : '❌'}</span>
            <span>📱: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</span>
          </div>
        )}

        {/* Global Styles */}
        <style jsx global>{`
          /* CSS Reset for mobile */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          html {
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            overflow-x: hidden;
            width: 100%;
            position: relative;
          }

          /* Admin Layout Styles */
          .admin-layout-container {
            display: flex;
            min-height: 100vh;
            background: #f8f9fa;
            position: relative;
            width: 100%;
            overflow-x: hidden;
          }

          /* Mobile Sidebar Close Button */
          .mobile-sidebar-close {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 1001;
          }

          .mobile-sidebar-close button {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
          }

          .mobile-sidebar-close button:active {
            transform: scale(0.95);
            background: #dc2626;
          }

          /* Mobile Overlay */
          .mobile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1900;
            animation: fadeIn 0.3s ease;
            backdrop-filter: blur(2px);
          }

          /* AppBar Container */
          .appbar-container {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            width: 100%;
          }

          /* Page Content */
          .page-content {
            flex: 1;
            padding: clamp(12px, 3vw, 24px);
            background: #f8f9fa;
            min-height: calc(100vh - 120px);
            position: relative;
            z-index: 1;
            overflow-x: hidden;
            width: 100%;
            max-width: 100%;
          }

          /* Development Indicators */
          .dev-indicators {
            position: fixed;
            bottom: ${isMobile ? '70px' : '10px'};
            right: ${isMobile ? '10px' : '10px'};
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: ${isMobile ? '10px' : '12px'};
            z-index: 9999;
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            max-width: ${isMobile ? '200px' : 'auto'};
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .dev-indicators span {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            white-space: nowrap;
          }

          /* Animations */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          /* Touch Device Optimizations */
          @media (hover: none) and (pointer: coarse) {
            /* Increase touch targets for mobile */
            button, 
            a, 
            [role="button"] {
              min-height: 44px;
              min-width: 44px;
              padding: 12px;
            }

            /* Prevent text selection on tap */
            .sidebar-container,
            .mobile-sidebar-close {
              user-select: none;
              -webkit-user-select: none;
            }

            /* Smooth scrolling on iOS */
            .sidebar-container {
              -webkit-overflow-scrolling: touch;
            }
          }

          /* Responsive Typography */
          @media (max-width: 480px) {
            html {
              font-size: 14px;
            }
          }

          @media (max-width: 360px) {
            html {
              font-size: 13px;
            }
          }

          /* Safe Area Insets for Notch Phones */
          @supports (padding: max(0px)) {
            .mobile-sidebar-close {
              top: max(12px, env(safe-area-inset-top));
              right: max(12px, env(safe-area-inset-right));
            }

            .dev-indicators {
              bottom: max(${isMobile ? '70px' : '10px'}, env(safe-area-inset-bottom));
              right: max(10px, env(safe-area-inset-right));
            }
          }

          /* Print Styles */
          @media print {
            .sidebar-container,
            .appbar-container,
            .dev-indicators,
            .mobile-overlay {
              display: none !important;
            }

            .main-content {
              margin-left: 0 !important;
              width: 100% !important;
            }

            .page-content {
              padding: 20px !important;
              background: white !important;
            }
          }
        `}</style>

        {/* Inline critical styles for immediate rendering */}
        <style jsx global>{`
          /* Critical above-the-fold styles */
          @media (max-width: 767px) {
            .admin-layout-container {
              flex-direction: column;
            }
            
            .main-content {
              width: 100% !important;
              margin-left: 0 !important;
            }
            
            .page-content {
              padding: 12px !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}