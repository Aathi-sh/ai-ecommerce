"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../../src/components/sidebar";
import AppBar from "../../src/components/appbar";
import { Footer } from "../../src/components/footer";
import FCMTokenManager from "../../src/components/FCMTokenManager";
import NotificationToast from "../../src/components/NotificationToast";
import { useAuth } from "../../context/authContext";
import { useNotification } from "../../hooks/useNotification";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
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

  const { user, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  
  const socketInitializedRef = useRef(false);
  const socketClientRef = useRef(null);
  const notificationPermissionRequestedRef = useRef(false);
  const showDevIndicators = process.env.NODE_ENV === 'development';

  // Initialize client-side
  useEffect(() => {
    setIsClient(true);
    
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
  }, []);

  // ==================== REQUEST NOTIFICATION PERMISSION ====================
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

  // ==================== SINGLE SOCKET.IO INITIALIZATION ====================
  const initializeSocketIO = useCallback(() => {
    if (!isClient || !user || user.role !== 'admin' || socketInitializedRef.current) {
      return;
    }

    console.log('🔗 LAYOUT: Initializing SINGLE Socket.IO connection...');
    socketInitializedRef.current = true;

    try {
      // Dynamically import to avoid SSR issues
      const { getSocketIOClient } = require('../../lib/websocket/socketio-client');
      const socketClient = getSocketIOClient();
      socketClientRef.current = socketClient;

      // Set up connection listener
      const handleConnectionChange = (connected) => {
        console.log(`🔌 LAYOUT: Socket.IO ${connected ? 'connected' : 'disconnected'}`);
        setConnectionStatus(prev => ({
          ...prev,
          socketio: {
            ...prev.socketio,
            connected,
            status: connected ? 'connected' : 'disconnected'
          }
        }));
      };

      // Set up state listener
      const handleStateChange = (state) => {
        console.log(`🔄 LAYOUT: Socket.IO state: ${state}`);
        setConnectionStatus(prev => ({
          ...prev,
          socketio: {
            ...prev.socketio,
            status: state,
            connected: state === 'connected'
          }
        }));
      };

      // Set up authentication listener
      const handleAuthenticated = (data) => {
        console.log('✅ LAYOUT: Socket.IO authenticated');
        setConnectionStatus(prev => ({
          ...prev,
          socketio: {
            ...prev.socketio,
            authenticated: true,
            error: null
          }
        }));
      };

      // ========== NOTIFICATION HANDLERS ==========
      const handleNewOrder = (data) => {
        console.log('🛍️ LAYOUT: New order received:', data);
        const orderData = data.order || data;
        
        // 1. Show notification using our notification hook
        showNotification(
          '🛍️ New Order Received!',
          `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
          'info',
          5000
        );
        
        // 2. Show browser notification if permission granted
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
        
        // 3. Broadcast to ALL components via custom event
        window.dispatchEvent(new CustomEvent('new-order-received', {
          detail: orderData
        }));
      };

      const handlePaymentUpdate = (data) => {
        console.log('💰 LAYOUT: Payment update via Socket.IO:', data);
        
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
        console.log('📦 LAYOUT: Order status update via Socket.IO:', data);
        
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

      // Register listeners
      socketClient.addConnectionListener(handleConnectionChange);
      socketClient.addStateListener(handleStateChange);
      socketClient.on('authenticated', handleAuthenticated);
      socketClient.on('NEW_ORDER', handleNewOrder);
      socketClient.on('PAYMENT_RECEIVED', handlePaymentUpdate);
      socketClient.on('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
      socketClient.on('FCM_TOKEN_REGISTERED', (data) => {
        console.log('✅ LAYOUT: FCM token registered with server:', data);
      });

      // Connect ONLY ONCE
      console.log('🔌 LAYOUT: Connecting Socket.IO...');
      socketClient.connect(user);

      // Check initial status after 3 seconds
      setTimeout(() => {
        const status = socketClient.getStatus();
        console.log('📊 LAYOUT: Initial Socket.IO status:', status);
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

      // Store cleanup function
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
  }, [isClient, user, showNotification]);

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
      
      // Initialize Socket.IO after FCM is ready
      initializeSocketIO();
    } else if (result?.error) {
      showNotification(
        'Push Notifications Failed',
        result.error,
        'error',
        5000
      );
      
      // Still initialize Socket.IO even if FCM fails
      initializeSocketIO();
    }
  }, [showNotification, initializeSocketIO]);

  // ==================== INITIALIZE SOCKET WHEN READY ====================
  useEffect(() => {
    if (isClient && user && user.role === 'admin' && !authLoading) {
      // Request notification permission if not done
      if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
        notificationPermissionRequestedRef.current = true;
        setTimeout(() => {
          handleRequestNotificationPermission();
        }, 2000);
      }
      
      // Initialize FCM first, which will then initialize Socket.IO
      // (FCMTokenManager will call handleFCMInitialized)
    }
  }, [isClient, user, authLoading, handleRequestNotificationPermission]);

  // ==================== CLEANUP ON UNMOUNT ====================
  useEffect(() => {
    return () => {
      // Cleanup socket on unmount
      if (socketClientRef.current) {
        socketClientRef.current.disconnect('Layout unmounting');
      }
    };
  }, []);

  // Add this useEffect
  useEffect(() => {
    if (isClient && user && user.role === 'admin') {
      // Load saved notifications on page load
      const loadSavedNotifications = async () => {
        try {
          const response = await fetch('/api/notifications?limit=10');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.notifications) {
              console.log(`Loaded ${data.notifications.length} saved notifications`);
              // You could store these in context or pass to NotificationToast
            }
          }
        } catch (error) {
          console.error('Error loading saved notifications:', error);
        }
      };
      
      loadSavedNotifications();
    }
  }, [isClient, user]);

  // ==================== UI HANDLERS ====================
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleReconnectSocket = useCallback(() => {
    if (socketClientRef.current && user) {
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
  }, [user, showNotification]);

  const handleEnableNotifications = useCallback(() => {
    handleRequestNotificationPermission();
  }, [handleRequestNotificationPermission]);

  // ==================== RENDER LOGIC ====================
  if (!isClient) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#6b7280' }}>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '16px' }}>
            Admin Access Required
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Please log in with admin credentials to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8f9fa',
      position: 'relative'
    }}>
      {/* Sidebar */}
      <div style={{  
        position: 'fixed',  
        left: 0,  
        top: 0,  
        height: '100vh',  
        width: sidebarOpen ? '240px' : '80px',  
        transition: 'width 0.3s ease',  
        zIndex: 1000,
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        background: 'white'
      }}>  
        <Sidebar collapsed={!sidebarOpen} />  
      </div>  

      {/* Main Content Area */}  
      <div   
        style={{   
          flex: 1,   
          display: 'flex',   
          flexDirection: 'column',  
          marginLeft: sidebarOpen ? '240px' : '80px',
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',  
          width: '100%',
          position: 'relative',  
        }}  
      >  
        {/* AppBar */}  
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1100,
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>  
          <AppBar  
            title="Admin Panel"  
            onToggleSidebar={handleToggleSidebar}  
            onRefresh={handleRefresh}  
            connectionStatus={connectionStatus}
            onCheckSocketIO={handleReconnectSocket}
            onEnableNotifications={handleEnableNotifications}
            user={user}
          />  
        </div>  

        {/* Page Content */}  
        <div style={{   
          flex: 1,   
          padding: '25px',  
          background: '#f8f9fa',  
          minHeight: 'calc(100vh - 120px)',
          position: 'relative',  
          zIndex: 1
        }}>  
          {children}  
        </div>  

        {/* Footer */}  
        <Footer />  
      </div>  

      {/* Notification Toast Container */}
      <NotificationToast />

      {/* FCM Token Manager (ONLY HERE - NOT in Dashboard) */}
      {isClient && user && user.role === 'admin' && !authLoading && (
        <div style={{ display: 'none' }}>
          <FCMTokenManager onInitialized={handleFCMInitialized} />
        </div>
      )}

      {/* Development indicators */}
      {showDevIndicators && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 9999,
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span>🔗: {connectionStatus.socketio.connected ? '✅' : '❌'}</span>
          <span>📱: {connectionStatus.fcm.ready ? '✅' : '❌'}</span>
          <span>👤: {user ? '✅' : '❌'}</span>
        </div>
      )}
    </div>
  );
}

// // app/admin/layout.js - SIMPLIFIED CORRECT VERSION
// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import Sidebar from "../../src/components/sidebar";
// import AppBar from "../../src/components/appbar";
// import { Footer } from "../../src/components/footer";
// import FCMTokenManager from "../../src/components/FCMTokenManager";
// import NotificationToast from "../../src/components/NotificationToast";
// import { useAuth } from "../../context/authContext";
// import { useNotification } from "../../hooks/useNotification";

// // ✅ Simple Socket.IO wrapper to prevent conflicts with dashboard
// function SocketIOWrapper({ user, onStatusChange }) {
//   const socketRef = useRef(null);
//   const initializedRef = useRef(false);

//   useEffect(() => {
//     // Only initialize if user is admin and not already initialized
//     if (!user || user.role !== 'admin' || initializedRef.current) return;

//     console.log('🔗 Layout: Setting up Socket.IO connection...');
//     initializedRef.current = true;

//     // Dynamically import to avoid SSR issues
//     import('../../lib/websocket/socketio-client').then(({ getSocketIOClient }) => {
//       const socketClient = getSocketIOClient();
//       socketRef.current = socketClient;

//       // Connect Socket.IO
//       socketClient.connect(user);

//       // Monitor connection status
//       const checkStatus = () => {
//         if (socketClient && onStatusChange) {
//           const status = socketClient.getStatus();
//           onStatusChange({
//             connected: status.isConnected,
//             authenticated: status.isAuthenticated,
//             status: status.state
//           });
//         }
//       };

//       // Initial check
//       checkStatus();

//       // Check periodically (every 5 seconds)
//       const interval = setInterval(checkStatus, 5000);

//       return () => {
//         clearInterval(interval);
//         if (socketClient) {
//           socketClient.disconnect('Layout unmounting');
//         }
//       };
//     }).catch(error => {
//       console.error('❌ Failed to load Socket.IO client:', error);
//     });

//     return () => {
//       initializedRef.current = false;
//     };
//   }, [user, onStatusChange]);

//   return null; // This is a wrapper component, no UI
// }

// // Main export component
// export default function AdminLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isClient, setIsClient] = useState(false);
  
//   const [connectionStatus, setConnectionStatus] = useState({
//     socketio: { connected: false, status: 'disconnected' },
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
  
//   const fcmInitializedRef = useRef(false);
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

//   // Handle Socket.IO status updates
//   const handleSocketIOStatusChange = useCallback((status) => {
//     console.log('📡 Socket.IO status update:', status);
//     setConnectionStatus(prev => ({
//       ...prev,
//       socketio: {
//         connected: status.connected,
//         status: status.status,
//         authenticated: status.authenticated
//       }
//     }));

//     // Show notification when connected
//     if (status.connected && status.authenticated) {
//       showNotification(
//         'Real-time Connection Established',
//         'You are now connected to the real-time server',
//         'success',
//         3000
//       );
//     }
//   }, [showNotification]);

//   // Handle FCM initialization
//   const handleFCMInitialized = useCallback((result) => {
//     console.log('📱 FCM initialized:', result);
    
//     fcmInitializedRef.current = true;
    
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
//     } else if (result?.error) {
//       showNotification(
//         'Push Notifications Failed',
//         result.error,
//         'error',
//         5000
//       );
//     }
//   }, [showNotification]);

//   // UI Handlers
//   const handleToggleSidebar = useCallback(() => {
//     setSidebarOpen(prev => !prev);
//   }, []);

//   const handleRefresh = useCallback(() => {
//     window.location.reload();
//   }, []);

//   const handleCheckSocketIO = useCallback(() => {
//     // This is handled by the dashboard page, not layout
//     showNotification(
//       'Socket.IO Reconnection',
//       'Reconnection is managed by the dashboard',
//       'info',
//       3000
//     );
//   }, [showNotification]);

//   const handleEnableNotifications = useCallback(() => {
//     if ('Notification' in window && Notification.permission === 'default') {
//       Notification.requestPermission().then(permission => {
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
//             'You will receive browser notifications',
//             'success',
//             3000
//           );
//         }
//       });
//     }
//   }, [showNotification]);

//   // Prevent hydration issues
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

//   // Show login prompt if not authenticated
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
//             onCheckSocketIO={handleCheckSocketIO}
//             onEnableNotifications={handleEnableNotifications}
//             user={user}
//           />  
//         </div>  

//         {/* Page Content */}  
//         <main style={{   
//           flex: 1,   
//           padding: '25px',  
//           background: '#f8f9fa',  
//           minHeight: 'calc(100vh - 120px)',
//           position: 'relative',  
//           zIndex: 1
//         }}>  
//           {children}  
//         </main>  

//         {/* Footer */}  
//         <Footer />  
//       </div>  

//       {/* Notification Toast Container */}
//       <NotificationToast />

//      {/* ✅ SIMPLE Socket.IO wrapper (does NOT conflict with dashboard)   */}
//       {isClient && user && user.role === 'admin' && !authLoading && (
//         <SocketIOWrapper 
//           user={user} 
//           onStatusChange={handleSocketIOStatusChange} 
//         />
//      )}
      
//       {/* ✅ SIMPLE FCM Token Manager */}
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


