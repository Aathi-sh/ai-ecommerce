
// "use client";

// import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import { useAuth } from "../../../context/AuthContext";
// import { appTheme } from "../../../src/constants/theme";
// import { useNotification } from "../../../hooks/useNotification";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar, Line, Doughnut } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function DashboardPage() {
//   const { user, loading: authLoading, isAuthenticated, session, getAuthHeaders } = useAuth();
//   const { showNotification } = useNotification();
  
//   const [orders, setOrders] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeFilter, setTimeFilter] = useState("month");
//   const [socketStatus, setSocketStatus] = useState({
//     connected: false,
//     status: 'disconnected',
//     authenticated: false,
//     error: null
//   });
//   const [notificationPermission, setNotificationPermission] = useState(
//     typeof window !== 'undefined' ? Notification.permission : 'default'
//   );
//   const [isMobile, setIsMobile] = useState(false);
//   const [isTablet, setIsTablet] = useState(false);
//   const [isDesktop, setIsDesktop] = useState(false);
  
//   const dataFetchedRef = useRef(false);
//   const fetchInProgressRef = useRef(false);
//   const isMountedRef = useRef(true);
//   const lastFetchTimeRef = useRef(0);
//   const fetchDebounceRef = useRef(null);
//   const notificationPermissionRequestedRef = useRef(false);
//   const socketEventListenerRef = useRef(null);

//   // Check screen size on mount and resize
//   useEffect(() => {
//     const checkScreenSize = () => {
//       const width = window.innerWidth;
//       setIsMobile(width < 768);
//       setIsTablet(width >= 768 && width < 992);
//       setIsDesktop(width >= 992);
//     };
    
//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
    
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, []);

//   // ==================== LISTEN FOR SOCKET EVENTS FROM LAYOUT ====================
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     console.log('📊 Dashboard: Setting up event listeners...');

//     const handleNewOrder = (event) => {
//       const orderData = event.detail;
//       console.log('📊 Dashboard: New order event received:', orderData);
      
//       // Add to notifications list
//       const newNotification = {
//         id: `temp-${Date.now()}`,
//         type: 'NEW_ORDER',
//         title: '🛍️ New Order!',
//         message: `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber}`,
//         orderNumber: orderData.orderNumber,
//         customerName: orderData.customerName,
//         totalAmount: orderData.totalPrice || 0,
//         status: 'unread',
//         createdAt: new Date().toISOString(),
//         timeSince: 'Just now',
//         source: 'socketio'
//       };
      
//       setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
      
//       // Refresh dashboard data with debounce
//       if (isMountedRef.current && !fetchInProgressRef.current) {
//         clearTimeout(fetchDebounceRef.current);
//         fetchDebounceRef.current = setTimeout(() => {
//           fetchDashboardData();
//         }, 2000);
//       }
//     };

//     const handlePaymentUpdated = (event) => {
//       console.log('📊 Dashboard: Payment updated:', event.detail);
      
//       // Refresh dashboard data
//       if (isMountedRef.current && !fetchInProgressRef.current) {
//         clearTimeout(fetchDebounceRef.current);
//         fetchDebounceRef.current = setTimeout(() => {
//           fetchDashboardData();
//         }, 2000);
//       }
//     };

//     const handleOrderStatusUpdated = (event) => {
//       console.log('📊 Dashboard: Order status updated:', event.detail);
      
//       // Refresh dashboard data
//       if (isMountedRef.current && !fetchInProgressRef.current) {
//         clearTimeout(fetchDebounceRef.current);
//         fetchDebounceRef.current = setTimeout(() => {
//           fetchDashboardData();
//         }, 2000);
//       }
//     };

//     const checkSocketStatus = () => {
//       try {
//         const { getSocketIOClient } = require('../../../lib/websocket/socketio-client');
//         const socketClient = getSocketIOClient();
//         const status = socketClient.getStatus();
        
//         setSocketStatus({
//           connected: status.isConnected,
//           authenticated: status.isAuthenticated,
//           status: status.state,
//           error: null
//         });
//       } catch (error) {
//         console.warn('Could not check socket status:', error);
//       }
//     };

//     // Set up event listeners
//     window.addEventListener('new-order-received', handleNewOrder);
//     window.addEventListener('payment-updated', handlePaymentUpdated);
//     window.addEventListener('order-status-updated', handleOrderStatusUpdated);

//     // Store reference for cleanup
//     socketEventListenerRef.current = {
//       handleNewOrder,
//       handlePaymentUpdated,
//       handleOrderStatusUpdated
//     };

//     // Check initial socket status
//     checkSocketStatus();
    
//     // Check status periodically
//     const statusInterval = setInterval(checkSocketStatus, 5000);

//     return () => {
//       // Clean up event listeners
//       if (socketEventListenerRef.current) {
//         window.removeEventListener('new-order-received', socketEventListenerRef.current.handleNewOrder);
//         window.removeEventListener('payment-updated', socketEventListenerRef.current.handlePaymentUpdated);
//         window.removeEventListener('order-status-updated', socketEventListenerRef.current.handleOrderStatusUpdated);
//       }
//       clearInterval(statusInterval);
//     };
//   }, []);

//   // ==================== NOTIFICATION PERMISSION ====================
//   useEffect(() => {
//     if (typeof window !== 'undefined' && 'Notification' in window) {
//       if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
//         notificationPermissionRequestedRef.current = true;
//       }
//       setNotificationPermission(Notification.permission);
//     }
//   }, []);

//   // ==================== FETCH NOTIFICATIONS ====================
//   const fetchNotifications = useCallback(async () => {
//     if (!isAuthenticated || !user) return;
    
//     try {
//       const response = await fetch('/api/notifications?limit=10&page=1', {
//         headers: getAuthHeaders(),
//         credentials: 'include'
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success && data.notifications) {
//           setNotifications(data.notifications.slice(0, 5));
//         }
//       }
//     } catch (error) {
//       console.warn('Failed to fetch notifications:', error);
//     }
//   }, [isAuthenticated, user, getAuthHeaders]);

//   const markNotificationAsRead = useCallback(async (notificationId) => {
//     if (!isAuthenticated) return;
    
//     try {
//       await fetch(`/api/notifications?id=${notificationId}`, {
//         method: 'PUT',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ markAsRead: true }),
//         credentials: 'include'
//       });
      
//       setNotifications(prev => 
//         prev.map(n => 
//           n.id === notificationId ? { ...n, status: 'read' } : n
//         )
//       );
//     } catch (error) {
//       console.warn('Failed to mark notification as read:', error);
//     }
//   }, [isAuthenticated, getAuthHeaders]);

//   // ==================== DATA FETCHING ====================
//   const fetchDashboardData = useCallback(async (force = false) => {
//     if (fetchInProgressRef.current) return;
    
//     const now = Date.now();
//     if (!force && now - lastFetchTimeRef.current < 30000) {
//       return;
//     }
    
//     fetchInProgressRef.current = true;
//     lastFetchTimeRef.current = now;
    
//     try {
//       if (!isMountedRef.current) return;
//       setLoading(true);
//       setError(null);
      
//       if (!isAuthenticated || !user) {
//         if (isMountedRef.current) {
//           setError("Please login to view dashboard");
//           setLoading(false);
//         }
//         return;
//       }
      
//       // Check if user is admin
//       if (user.role !== 'admin') {
//         if (isMountedRef.current) {
//           setError("Admin access required");
//           setLoading(false);
//         }
//         return;
//       }
      
//       // Get auth headers with user ID and company ID
//       const authHeaders = getAuthHeaders();
      
//       console.log('📊 Fetching dashboard data with headers:', {
//         hasAuth: !!authHeaders.Authorization,
//         hasCompanyId: !!authHeaders['x-company-id'],
//         hasUserId: !!authHeaders['x-user-id'],
//         companyId: authHeaders['x-company-id']
//       });
      
//       const fetchWithTimeout = (url, options, timeout = 10000) => {
//         return Promise.race([
//           fetch(url, {
//             ...options,
//             credentials: 'include',
//             headers: authHeaders
//           }),
//           new Promise((_, reject) =>
//             setTimeout(() => reject(new Error('Request timeout')), timeout)
//           )
//         ]);
//       };
      
//       const fetchPromises = [
//         fetchWithTimeout("/api/orders?limit=100", {}, 8000).then(async res => {
//           if (!res.ok) {
//             if (res.status === 401) {
//               throw new Error("Session expired. Please login again.");
//             }
//             if (res.status === 403) {
//               console.warn('Access denied to orders API - admin only');
//               return [];
//             }
//             const errorText = await res.text();
//             console.warn(`Orders API failed: ${res.status}`, errorText);
//             return [];
//           }
//           const data = await res.json();
//           console.log('📊 Orders fetched:', data.success ? `${data.data?.length || 0} orders` : 'failed');
//           return data.success ? (data.data || []) : [];
//         }).catch(err => {
//           console.warn('Orders fetch error:', err.message);
//           return [];
//         }),
        
//         fetchWithTimeout("/api/products?limit=100", {}, 8000).then(async res => {
//           if (!res.ok) {
//             if (res.status === 403) {
//               console.warn('Access denied to products API');
//               return [];
//             }
//             const errorText = await res.text();
//             console.warn(`Products API failed: ${res.status}`, errorText);
//             return [];
//           }
//           const data = await res.json();
//           console.log('📊 Products fetched:', data.success ? `${data.data?.length || 0} products` : 'failed');
//           return data.success ? (data.data || []) : [];
//         }).catch(err => {
//           console.warn('Products fetch error:', err.message);
//           return [];
//         }),
        
//         fetchWithTimeout("/api/users?limit=100", {}, 8000).then(async res => {
//           if (!res.ok) {
//             if (res.status === 403) {
//               console.warn('Access denied to users API');
//               return [];
//             }
//             return [];
//           }
//           const data = await res.json();
          
//           let usersArray = [];
          
//           if (data.success) {
//             if (Array.isArray(data.data)) {
//               usersArray = data.data;
//             } else if (data.data && Array.isArray(data.data.users)) {
//               usersArray = data.data.users;
//             } else if (Array.isArray(data.users)) {
//               usersArray = data.users;
//             }
//           }
//           console.log('📊 Users fetched:', usersArray.length);
//           return usersArray.filter(u => u && typeof u === 'object');
//         }).catch(err => {
//           console.warn('Users fetch error:', err.message);
//           return [];
//         })
//       ];
      
//       const [ordersData, productsData, usersData] = await Promise.allSettled(fetchPromises);
      
//       if (isMountedRef.current) {
//         const ordersResult = ordersData.status === 'fulfilled' ? ordersData.value : [];
//         const productsResult = productsData.status === 'fulfilled' ? productsData.value : [];
//         const usersResult = usersData.status === 'fulfilled' ? usersData.value : [];
        
//         console.log('📊 Dashboard data loaded:', {
//           orders: ordersResult.length,
//           products: productsResult.length,
//           users: usersResult.length
//         });
        
//         setOrders(ordersResult);
//         setProducts(productsResult);
//         setCustomers(usersResult.length > 0 ? usersResult : []);
        
//         dataFetchedRef.current = true;
        
//         fetchNotifications();
//       }
      
//     } catch (err) {
//       console.error("Fetch dashboard data error:", err);
//       if (isMountedRef.current) {
//         if (err.message.includes("Session expired")) {
//           setError("Your session has expired. Please login again.");
//         } else {
//           setError(err.message || "Failed to load dashboard data");
//         }
//       }
//     } finally {
//       if (isMountedRef.current) {
//         setLoading(false);
//         fetchInProgressRef.current = false;
//       }
//     }
//   }, [isAuthenticated, user, fetchNotifications, getAuthHeaders]);

//   // ==================== INITIALIZATION ====================
//   useEffect(() => {
//     isMountedRef.current = true;
//     dataFetchedRef.current = false;
//     fetchInProgressRef.current = false;
    
//     const initDataFetch = async () => {
//       if (!isMountedRef.current) return;
      
//       if (authLoading) return;
      
//       if (!isAuthenticated || !user) {
//         if (isMountedRef.current) {
//           setError("Please login to view dashboard");
//           setLoading(false);
//         }
//         return;
//       }
      
//       if (!dataFetchedRef.current && !fetchInProgressRef.current) {
//         await fetchDashboardData(true);
//       }
//     };
    
//     const timer = setTimeout(() => {
//       initDataFetch();
//     }, 500);
    
//     return () => {
//       clearTimeout(timer);
//       isMountedRef.current = false;
//       fetchInProgressRef.current = false;
//     };
//   }, [authLoading, isAuthenticated, user, fetchDashboardData]);

//   // ==================== AUTO REFRESH ====================
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       if (socketStatus.connected && !fetchInProgressRef.current && isMountedRef.current) {
//         fetchDashboardData();
//       }
//     }, 60000);
    
//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [socketStatus.connected, fetchDashboardData]);

//   // ==================== REQUEST NOTIFICATION PERMISSION ====================
//   const handleRequestNotificationPermission = useCallback(async () => {
//     try {
//       if (window.Notification && Notification.permission === 'default') {
//         const permission = await Notification.requestPermission();
//         setNotificationPermission(permission);
        
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

//   // ==================== DATA PROCESSING ====================
//   const filteredOrders = useMemo(() => {
//     const now = new Date();
//     return orders.filter((order) => {
//       if (!order || !order.createdAt) return false;
      
//       const orderDate = new Date(order.createdAt);
//       if (isNaN(orderDate.getTime())) return false;
      
//       switch (timeFilter) {
//         case "today":
//           return orderDate.toDateString() === now.toDateString();
//         case "week":
//           const startOfWeek = new Date(now);
//           startOfWeek.setDate(now.getDate() - now.getDay());
//           startOfWeek.setHours(0, 0, 0, 0);
//           return orderDate >= startOfWeek;
//         case "month":
//           return (
//             orderDate.getMonth() === now.getMonth() &&
//             orderDate.getFullYear() === now.getFullYear()
//           );
//         case "year":
//           return orderDate.getFullYear() === now.getFullYear();
//         default:
//           return true;
//       }
//     });
//   }, [orders, timeFilter]);

//   const totalRevenue = useMemo(() => {
//     return filteredOrders
//       .filter((o) => o && o.paymentStatus === "paid" && typeof o.totalPrice === 'number')
//       .reduce((sum, o) => sum + o.totalPrice, 0);
//   }, [filteredOrders]);

//   const totalOrders = filteredOrders.length;
//   const totalCustomers = customers.length;
//   const totalProducts = products.length;

//   const orderStatusMetrics = useMemo(() => {
//     return {
//       pending: filteredOrders.filter(o => o && o.status === "pending").length,
//       processing: filteredOrders.filter(o => o && o.status === "processing").length,
//       shipped: filteredOrders.filter(o => o && o.status === "shipped").length,
//       delivered: filteredOrders.filter(o => o && o.status === "delivered").length,
//       cancelled: filteredOrders.filter(o => o && o.status === "cancelled").length,
//     };
//   }, [filteredOrders]);

//   const topSellingProducts = useMemo(() => {
//     const productSales = {};
    
//     filteredOrders.forEach(order => {
//       if (order && order.items && Array.isArray(order.items)) {
//         order.items.forEach(item => {
//           if (!item) return;
          
//           const productName = item.productName || 'Unknown Product';
//           const productId = item.productId?._id || productName;
//           const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
//           const price = typeof item.price === 'number' ? item.price : 0;
          
//           if (!productSales[productId]) {
//             productSales[productId] = {
//               name: productName,
//               quantity: 0,
//               revenue: 0,
//               id: productId
//             };
//           }
//           productSales[productId].quantity += quantity;
//           productSales[productId].revenue += price * quantity;
//         });
//       }
//     });

//     return Object.values(productSales)
//       .sort((a, b) => b.quantity - a.quantity)
//       .slice(0, 5);
//   }, [filteredOrders]);

//   const recentOrders = useMemo(() => {
//     return filteredOrders
//       .filter(order => order && order.createdAt)
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .slice(0, 5)
//       .map(order => ({
//         _id: order._id || `order-${Math.random().toString(36).substr(2, 9)}`,
//         orderNumber: order.orderNumber || `ORD-${Math.random().toString(36).substr(2, 9)}`,
//         createdBy: order.customerName || order.email || 'Unknown Customer',
//         totalPrice: typeof order.totalPrice === 'number' ? order.totalPrice : 0,
//         status: order.status || 'pending',
//         createdAt: order.createdAt
//       }));
//   }, [filteredOrders]);

//   const revenueChartData = useMemo(() => {
//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
//     const data = Array(12).fill(0);
    
//     orders.forEach(order => {
//       if (order && order.createdAt && order.paymentStatus === "paid") {
//         const orderDate = new Date(order.createdAt);
//         const monthIndex = orderDate.getMonth();
//         data[monthIndex] += order.totalPrice || 0;
//       }
//     });
    
//     return {
//       labels: months,
//       datasets: [
//         {
//           label: "Revenue (₹)",
//           data: data,
//           borderColor: appTheme.colors.primary,
//           backgroundColor: `${appTheme.colors.primary}20`,
//           tension: 0.4,
//           fill: true,
//         },
//       ],
//     };
//   }, [orders]);

//   const ordersChartData = useMemo(() => ({
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
//     datasets: [
//       {
//         label: "Orders",
//         data: Array(12).fill(0).map((_, i) => 
//           orders.filter(order => {
//             if (!order || !order.createdAt) return false;
//             const orderDate = new Date(order.createdAt);
//             return orderDate.getMonth() === i;
//           }).length
//         ),
//         backgroundColor: appTheme.colors.secondary,
//         borderRadius: 8,
//       },
//     ],
//   }), [orders]);

//   const orderStatusData = useMemo(() => ({
//     labels: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//     datasets: [
//       {
//         data: [
//           orderStatusMetrics.pending,
//           orderStatusMetrics.processing,
//           orderStatusMetrics.shipped,
//           orderStatusMetrics.delivered,
//           orderStatusMetrics.cancelled
//         ],
//         backgroundColor: [
//           "#FF6384",
//           "#36A2EB",
//           "#FFCE56",
//           "#4BC0C0",
//           "#FF9F40"
//         ],
//         borderWidth: 2,
//         borderColor: appTheme.colors.surface,
//       },
//     ],
//   }), [orderStatusMetrics]);

//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { 
//         position: 'top',
//         labels: {
//           usePointStyle: true,
//           padding: 15,
//           font: {
//             size: isMobile ? 10 : 12
//           }
//         }
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: `${appTheme.colors.border}40`,
//         },
//         ticks: {
//           font: {
//             size: isMobile ? 9 : 11
//           }
//         }
//       },
//       x: {
//         grid: {
//           color: `${appTheme.colors.border}40`,
//         },
//         ticks: {
//           font: {
//             size: isMobile ? 9 : 11
//           }
//         }
//       },
//     },
//   }), [isMobile]);

//   const doughnutOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: isMobile ? 'right' : 'bottom',
//         labels: {
//           usePointStyle: true,
//           padding: 10,
//           font: {
//             size: isMobile ? 9 : 11
//           }
//         }
//       },
//     },
//     cutout: isMobile ? '55%' : '65%',
//   }), [isMobile]);

//   // ==================== EVENT HANDLERS ====================
//   const handleRetry = useCallback(() => {
//     setError(null);
//     dataFetchedRef.current = false;
//     fetchInProgressRef.current = false;
//     fetchDashboardData(true);
//   }, [fetchDashboardData]);

//   const handleSessionExpired = useCallback(() => {
//     if (typeof window !== 'undefined') {
//       window.location.href = '/login';
//     }
//   }, []);

//   const handleLoginRedirect = useCallback(() => {
//     window.location.href = '/login';
//   }, []);

//   const handleReconnectSocket = useCallback(() => {
//     try {
//       const { getSocketIOClient } = require('../../../lib/websocket/socketio-client');
//       const socketClient = getSocketIOClient();
//       socketClient.disconnect();
//       setTimeout(() => {
//         socketClient.connect(user);
//         showNotification(
//           'Reconnecting...',
//           'Attempting to reconnect to real-time server',
//           'info',
//           3000
//         );
//       }, 1000);
//     } catch (error) {
//       console.error('Failed to reconnect socket:', error);
//     }
//   }, [user, showNotification]);

//   const handleClearNotifications = useCallback(() => {
//     setNotifications([]);
//     showNotification(
//       'Notifications Cleared',
//       'All notifications have been cleared',
//       'success',
//       3000
//     );
//   }, [showNotification]);

//   const handleViewAllNotifications = useCallback(() => {
//     if (typeof window !== 'undefined') {
//       window.location.href = '/admin/notifications';
//     }
//   }, []);

//   // ==================== RENDER LOGIC ====================
//   if (error) {
//     const isSessionExpired = error.includes("session has expired") || error.includes("Session expired");
    
//     return (
//       <div style={{ 
//         padding: isMobile ? "20px 16px" : "40px", 
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         flexDirection: "column",
//         gap: isMobile ? "15px" : "20px",
//         textAlign: "center"
//       }}>
//         <div style={{ fontSize: isMobile ? "2.5rem" : "3rem" }}>{isSessionExpired ? "⏰" : "⚠️"}</div>
//         <h2 style={{ 
//           color: appTheme.colors.error,
//           fontSize: isMobile ? "1.3rem" : "1.5rem",
//           margin: "5px 0"
//         }}>{isSessionExpired ? "Session Expired" : "Error"}</h2>
//         <p style={{ 
//           color: appTheme.colors.textSecondary,
//           fontSize: isMobile ? "0.9rem" : "1rem",
//           lineHeight: 1.5,
//           maxWidth: "400px"
//         }}>{error}</p>
//         <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
//           {isSessionExpired ? (
//             <button
//               onClick={handleSessionExpired}
//               style={{
//                 padding: isMobile ? "10px 20px" : "12px 24px",
//                 backgroundColor: appTheme.colors.primary,
//                 color: "white",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: isMobile ? "14px" : "16px",
//                 fontWeight: "600",
//                 minWidth: "120px",
//                 minHeight: "44px"
//               }}
//             >
//               Go to Login
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={handleLoginRedirect}
//                 style={{
//                   padding: isMobile ? "10px 20px" : "12px 24px",
//                   backgroundColor: appTheme.colors.primary,
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: isMobile ? "14px" : "16px",
//                   fontWeight: "600",
//                   minWidth: "120px",
//                   minHeight: "44px"
//                 }}
//               >
//                 Go to Login
//               </button>
//               <button
//                 onClick={handleRetry}
//                 style={{
//                   padding: isMobile ? "10px 20px" : "12px 24px",
//                   backgroundColor: appTheme.colors.secondary,
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: isMobile ? "14px" : "16px",
//                   fontWeight: "600",
//                   minWidth: "120px",
//                   minHeight: "44px"
//                 }}
//               >
//                 Retry
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (loading || authLoading) {
//     return (
//       <div style={{ 
//         padding: isMobile ? "20px 16px" : "40px", 
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center"
//       }}>
//         <div style={{
//           textAlign: "center",
//           color: appTheme.colors.textSecondary
//         }}>
//           <div style={{ 
//             width: isMobile ? "50px" : "60px", 
//             height: isMobile ? "50px" : "60px", 
//             border: `4px solid ${appTheme.colors.border}`,
//             borderTop: `4px solid ${appTheme.colors.primary}`,
//             borderRadius: "50%",
//             margin: "0 auto",
//             animation: "spin 1s linear infinite"
//           }} />
//           <style>{`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}</style>
//           <p style={{ 
//             fontSize: isMobile ? "1rem" : "1.2rem", 
//             marginTop: isMobile ? "15px" : "20px" 
//           }}>Loading Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   const unreadNotifications = notifications.filter(n => n.status !== 'read').length;

//   return (
//     <div style={{ 
//       padding: isMobile ? "12px" : "24px", 
//       backgroundColor: appTheme.colors.background, 
//       minHeight: "100vh",
//       maxWidth: "100vw",
//       overflowX: "hidden",
//       boxSizing: "border-box"
//     }}>
//       {/* Header Section */}
//       <div style={{
//         display: "flex",
//         flexDirection: isMobile ? "column" : "row",
//         justifyContent: "space-between",
//         alignItems: isMobile ? "stretch" : "flex-start",
//         marginBottom: isMobile ? "16px" : "24px",
//         gap: isMobile ? "12px" : "20px",
//         width: "100%"
//       }}>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <h1 style={{ 
//             color: appTheme.colors.textPrimary, 
//             marginBottom: isMobile ? "4px" : "6px",
//             fontSize: isMobile ? "1.3rem" : "1.8rem",
//             fontWeight: "700",
//             lineHeight: 1.2,
//             wordBreak: "break-word"
//           }}>
//             Dashboard Overview
//           </h1>
//           <div style={{ 
//             display: "flex",
//             flexWrap: "wrap",
//             alignItems: "center",
//             gap: isMobile ? "6px" : "8px",
//             marginTop: isMobile ? "4px" : "6px"
//           }}>
//             <p style={{ 
//               color: appTheme.colors.textSecondary,
//               fontSize: isMobile ? "0.8rem" : "0.9rem",
//               margin: 0,
//               lineHeight: 1.3
//             }}>
//               Welcome to your e-commerce dashboard
//             </p>
            
//             {socketStatus.connected && (
//               <span style={{ 
//                 fontSize: isMobile ? "0.7rem" : "0.75rem",
//                 backgroundColor: "#10b98120",
//                 color: "#10b981",
//                 padding: "3px 8px",
//                 borderRadius: "12px",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "4px",
//                 whiteSpace: "nowrap",
//                 flexShrink: 0
//               }}>
//                 <span>🔗</span>Live
//               </span>
//             )}
            
//             {!socketStatus.connected && (
//               <button
//                 onClick={handleReconnectSocket}
//                 style={{
//                   fontSize: isMobile ? "0.7rem" : "0.75rem",
//                   backgroundColor: "#ef444420",
//                   color: "#ef4444",
//                   padding: "3px 8px",
//                   borderRadius: "12px",
//                   border: "none",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                   flexShrink: 0,
//                   minHeight: "28px"
//                 }}
//                 title="Click to reconnect"
//               >
//                 <span>❌</span>Offline
//               </button>
//             )}
            
//             {unreadNotifications > 0 && (
//               <button
//                 onClick={handleViewAllNotifications}
//                 style={{
//                   fontSize: isMobile ? "0.7rem" : "0.75rem",
//                   backgroundColor: "#f59e0b20",
//                   color: "#f59e0b",
//                   padding: "3px 8px",
//                   borderRadius: "12px",
//                   border: "none",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                   flexShrink: 0,
//                   minHeight: "28px"
//                 }}
//                 title="View notifications"
//               >
//                 <span>🔔</span>{unreadNotifications} new
//               </button>
//             )}
//           </div>
          
//           {user && (
//             <div style={{ 
//               marginTop: isMobile ? "8px" : "12px",
//               display: "flex",
//               flexWrap: "wrap",
//               alignItems: "center",
//               gap: isMobile ? "8px" : "10px",
//               fontSize: isMobile ? "0.75rem" : "0.8rem"
//             }}>
//               <span style={{ 
//                 color: appTheme.colors.textSecondary,
//                 flexShrink: 0
//               }}>
//                 Logged in as:
//               </span>
//               <span style={{ 
//                 color: appTheme.colors.primary,
//                 fontWeight: "500",
//                 wordBreak: "break-word",
//                 flex: 1,
//                 minWidth: 0
//               }}>
//                 {user.email}
//               </span>
//               <div style={{ 
//                 display: "flex",
//                 alignItems: "center",
//                 gap: isMobile ? "6px" : "8px",
//                 flexWrap: "wrap",
//                 flexShrink: 0
//               }}>
//                 <span style={{ 
//                   fontSize: "0.75rem",
//                   color: appTheme.colors.textSecondary,
//                   flexShrink: 0
//                 }}>
//                   Role:
//                 </span>
//                 <span style={{ 
//                   fontSize: isMobile ? "0.75rem" : "0.8rem",
//                   backgroundColor: user.role === 'admin' ? `${appTheme.colors.success}20` : `${appTheme.colors.info}20`,
//                   padding: "2px 8px",
//                   borderRadius: "4px",
//                   whiteSpace: "nowrap",
//                   flexShrink: 0
//                 }}>
//                   {user.role}
//                 </span>
//                 {notificationPermission === 'granted' && (
//                   <span style={{ 
//                     fontSize: isMobile ? "0.7rem" : "0.75rem",
//                     backgroundColor: `${appTheme.colors.success}20`,
//                     color: appTheme.colors.success,
//                     padding: "2px 8px",
//                     borderRadius: "4px",
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: "4px",
//                     whiteSpace: "nowrap",
//                     flexShrink: 0
//                   }}>
//                     <span>🔔</span>On
//                   </span>
//                 )}
//                 {notificationPermission === 'default' && (
//                   <button
//                     onClick={handleRequestNotificationPermission}
//                     style={{
//                       fontSize: isMobile ? "0.7rem" : "0.75rem",
//                       backgroundColor: `${appTheme.colors.primary}20`,
//                       color: appTheme.colors.primary,
//                       padding: "2px 8px",
//                       borderRadius: "4px",
//                       border: `1px solid ${appTheme.colors.primary}30`,
//                       cursor: "pointer",
//                       display: "inline-flex",
//                       alignItems: "center",
//                       gap: "4px",
//                       whiteSpace: "nowrap",
//                       minHeight: "24px",
//                       flexShrink: 0
//                     }}
//                   >
//                     <span>🔔</span>Enable
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Filters and Actions */}
//         <div style={{
//           display: "flex",
//           flexDirection: isMobile ? "row" : "row",
//           alignItems: "center",
//           gap: isMobile ? "8px" : "10px",
//           flexWrap: "wrap",
//           justifyContent: isMobile ? "space-between" : "flex-end",
//           width: isMobile ? "100%" : "auto"
//         }}>
//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             gap: isMobile ? "6px" : "8px",
//             flex: isMobile ? 1 : "none"
//           }}>
//             <label style={{ 
//               color: appTheme.colors.textSecondary,
//               fontWeight: "500",
//               fontSize: isMobile ? "0.85rem" : "0.9rem",
//               whiteSpace: "nowrap",
//               flexShrink: 0
//             }}>Period: </label>
//             <select
//               value={timeFilter}
//               onChange={(e) => setTimeFilter(e.target.value)}
//               style={{
//                 padding: isMobile ? "8px 12px" : "9px 14px",
//                 borderRadius: "8px",
//                 border: `1.5px solid ${appTheme.colors.border}`,
//                 fontFamily: appTheme.fonts.primary,
//                 backgroundColor: appTheme.colors.surface,
//                 color: appTheme.colors.textPrimary,
//                 fontSize: isMobile ? "0.85rem" : "0.9rem",
//                 cursor: "pointer",
//                 minWidth: isMobile ? "100px" : "120px",
//                 maxWidth: "100%",
//                 flex: isMobile ? 1 : "none",
//                 minHeight: "36px",
//                 appearance: "none",
//                 backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
//                 backgroundRepeat: "no-repeat",
//                 backgroundPosition: "right 8px center",
//                 backgroundSize: "16px",
//                 paddingRight: "32px"
//               }}
//             >
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//               <option value="year">This Year</option>
//             </select>
//           </div>
          
//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             gap: isMobile ? "6px" : "8px",
//             flex: isMobile ? 1 : "none",
//             justifyContent: isMobile ? "flex-end" : "flex-start"
//           }}>
//             <button
//               onClick={() => fetchDashboardData(true)}
//               style={{
//                 padding: isMobile ? "8px 12px" : "9px 14px",
//                 backgroundColor: `${appTheme.colors.primary}15`,
//                 color: appTheme.colors.primary,
//                 border: `1px solid ${appTheme.colors.primary}30`,
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: isMobile ? "0.85rem" : "0.9rem",
//                 fontWeight: "500",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "5px",
//                 whiteSpace: "nowrap",
//                 minHeight: "36px",
//                 flexShrink: 0
//               }}
//             >
//               <span>🔄</span>
//               <span style={{ display: isMobile ? "none" : "inline" }}>Refresh</span>
//             </button>
            
//             {!socketStatus.connected && (
//               <button
//                 onClick={handleReconnectSocket}
//                 style={{
//                   padding: isMobile ? "8px 12px" : "9px 14px",
//                   backgroundColor: `${appTheme.colors.error}15`,
//                   color: appTheme.colors.error,
//                   border: `1px solid ${appTheme.colors.error}30`,
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: isMobile ? "0.85rem" : "0.9rem",
//                   fontWeight: "500",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "5px",
//                   whiteSpace: "nowrap",
//                   minHeight: "36px",
//                   flexShrink: 0
//                 }}
//                 title="Reconnect to real-time server"
//               >
//                 <span>🔌</span>
//                 <span style={{ display: isMobile ? "none" : "inline" }}>Reconnect</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats Row */}
//       <div style={{ 
//         display: "grid", 
//         gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", 
//         gap: isMobile ? "12px" : "16px", 
//         marginBottom: isMobile ? "20px" : "25px"
//       }}>
//         <div style={{
//           background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
//           padding: isMobile ? "16px" : "20px",
//           borderRadius: "12px",
//           boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
//           color: "white",
//           position: "relative",
//           overflow: "hidden"
//         }}>
//           <div style={{ position: "relative", zIndex: 2 }}>
//             <div style={{ 
//               fontSize: isMobile ? "0.8rem" : "0.85rem", 
//               opacity: 0.9, 
//               marginBottom: "6px" 
//             }}>
//               Total Revenue
//             </div>
//             <div style={{ 
//               fontSize: isMobile ? "1.5rem" : "1.8rem", 
//               fontWeight: "700", 
//               marginBottom: "4px",
//               lineHeight: 1.2
//             }}>
//               ₹{totalRevenue.toLocaleString()}
//             </div>
//             <div style={{ 
//               fontSize: isMobile ? "0.75rem" : "0.8rem", 
//               opacity: 0.8 
//             }}>
//               {timeFilter === 'today' ? 'Today' : 
//                timeFilter === 'week' ? 'This Week' : 
//                timeFilter === 'month' ? 'This Month' : 'This Year'}
//             </div>
//           </div>
//         </div>
        
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "1fr",
//           gap: isMobile ? "12px" : "16px",
//           gridColumn: isMobile ? "span 1" : "auto"
//         }}>
//           <MetricCard 
//             icon="📦" 
//             title="Total Orders" 
//             value={totalOrders} 
//             color={appTheme.colors.info}
//             appTheme={appTheme}
//             isMobile={isMobile}
//           />
//           <MetricCard 
//             icon="👥" 
//             title="Total Users" 
//             value={totalCustomers} 
//             color={appTheme.colors.success}
//             appTheme={appTheme}
//             isMobile={isMobile}
//           />
//         </div>
        
//         <MetricCard 
//           icon="🛍️" 
//           title="Total Products" 
//           value={totalProducts} 
//           color={appTheme.colors.warning}
//           appTheme={appTheme}
//           isMobile={isMobile}
//         />
//       </div>

//       {/* Charts Row */}
//       <div style={{ 
//         display: "flex", 
//         flexDirection: isMobile ? "column" : "row",
//         gap: isMobile ? "16px" : "20px", 
//         marginBottom: isMobile ? "20px" : "25px"
//       }}>
//         <div style={{
//           backgroundColor: appTheme.colors.surface,
//           padding: isMobile ? "16px" : "20px",
//           borderRadius: "12px",
//           boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
//           border: `1px solid ${appTheme.colors.border}20`,
//           height: "100%",
//           flex: isMobile ? "none" : 2,
//           width: "100%"
//         }}>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: "center", 
//             marginBottom: "15px" 
//           }}>
//             <h3 style={{ 
//               color: appTheme.colors.textPrimary, 
//               margin: 0,
//               fontSize: isMobile ? "1rem" : "1.1rem"
//             }}>
//               Revenue Trend
//             </h3>
//             {socketStatus.connected && (
//               <div style={{
//                 fontSize: isMobile ? "0.65rem" : "0.7rem",
//                 padding: "3px 8px",
//                 borderRadius: "12px",
//                 backgroundColor: "#10b98120",
//                 color: "#10b981",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "4px",
//                 whiteSpace: "nowrap"
//               }}>
//                 <div style={{
//                   width: "6px",
//                   height: "6px",
//                   borderRadius: "50%",
//                   backgroundColor: "#10b981",
//                   animation: "pulse 1.5s infinite"
//                 }}></div>
//                 Live
//               </div>
//             )}
//           </div>
//           <div style={{ height: isMobile ? "220px" : "280px", width: "100%" }}>
//             <Line data={revenueChartData} options={chartOptions} />
//           </div>
//         </div>

//         <div style={{
//           backgroundColor: appTheme.colors.surface,
//           padding: isMobile ? "16px" : "20px",
//           borderRadius: "12px",
//           boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
//           border: `1px solid ${appTheme.colors.border}20`,
//           height: "100%",
//           flex: isMobile ? "none" : 1,
//           width: "100%"
//         }}>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: "center", 
//             marginBottom: "15px" 
//           }}>
//             <h3 style={{ 
//               color: appTheme.colors.textPrimary, 
//               margin: 0,
//               fontSize: isMobile ? "1rem" : "1.1rem"
//             }}>
//               Order Status
//             </h3>
//             <button
//               onClick={handleRetry}
//               style={{
//                 padding: "4px 10px",
//                 fontSize: isMobile ? "0.65rem" : "0.7rem",
//                 backgroundColor: `${appTheme.colors.primary}15`,
//                 color: appTheme.colors.primary,
//                 border: `1px solid ${appTheme.colors.primary}30`,
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 whiteSpace: "nowrap",
//                 minHeight: "24px"
//               }}
//             >
//               Update
//             </button>
//           </div>
//           <div style={{ height: isMobile ? "220px" : "280px", width: "100%" }}>
//             <Doughnut data={orderStatusData} options={doughnutOptions} />
//           </div>
//         </div>
//       </div>

//       {/* Recent Data Row */}
//       <div style={{ 
//         display: "flex", 
//         flexDirection: isMobile ? "column" : "row",
//         gap: isMobile ? "16px" : "20px",
//         marginBottom: isMobile ? "20px" : "25px"
//       }}>
//         <div style={{
//           backgroundColor: appTheme.colors.surface,
//           padding: isMobile ? "16px" : "20px",
//           borderRadius: "12px",
//           boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
//           border: `1px solid ${appTheme.colors.border}20`,
//           flex: notifications.length > 0 ? (isMobile ? "none" : 2) : 1,
//           width: "100%"
//         }}>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: "center", 
//             marginBottom: "15px" 
//           }}>
//             <h3 style={{ 
//               color: appTheme.colors.textPrimary, 
//               margin: 0,
//               fontSize: isMobile ? "1rem" : "1.1rem"
//             }}>
//               Recent Orders
//             </h3>
//             {socketStatus.connected && (
//               <div style={{
//                 fontSize: isMobile ? "0.65rem" : "0.7rem",
//                 padding: "3px 8px",
//                 borderRadius: "12px",
//                 backgroundColor: "#3b82f620",
//                 color: "#3b82f6",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "4px",
//                 whiteSpace: "nowrap"
//               }}>
//                 <span>📡</span>
//                 <span style={{ display: isMobile ? "none" : "inline" }}>Real-time</span>
//               </div>
//             )}
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//             {recentOrders.length > 0 ? recentOrders.map((order) => (
//               <div key={order._id} style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: isMobile ? "10px" : "12px",
//                 backgroundColor: `${appTheme.colors.background}50`,
//                 borderRadius: "8px",
//                 border: `1px solid ${appTheme.colors.border}15`,
//                 transition: "all 0.2s ease",
//                 ':hover': {
//                   backgroundColor: `${appTheme.colors.background}70`,
//                   transform: "translateY(-1px)",
//                   boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
//                 }
//               }}>
//                 <div style={{ flex: 1, minWidth: 0, marginRight: "10px" }}>
//                   <div style={{ 
//                     fontWeight: "600", 
//                     color: appTheme.colors.textPrimary, 
//                     fontSize: isMobile ? "0.85rem" : "0.9rem",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis"
//                   }}>
//                     #{order.orderNumber}
//                   </div>
//                   <div style={{ 
//                     fontSize: isMobile ? "0.75rem" : "0.8rem", 
//                     color: appTheme.colors.textSecondary,
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis"
//                   }}>
//                     {order.createdBy} • ₹{order.totalPrice.toLocaleString()}
//                   </div>
//                 </div>
//                 <div style={{ flexShrink: 0 }}>
//                   <StatusBadge status={order.status} appTheme={appTheme} isMobile={isMobile} />
//                 </div>
//               </div>
//             )) : (
//               <div style={{ 
//                 textAlign: "center", 
//                 padding: "20px", 
//                 color: appTheme.colors.textSecondary,
//                 fontSize: isMobile ? "0.9rem" : "1rem"
//               }}>
//                 No recent orders
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Notifications Panel */}
//         {notifications.length > 0 && (
//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: isMobile ? "16px" : "20px",
//             borderRadius: "12px",
//             boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
//             border: `1px solid ${appTheme.colors.border}20`,
//             flex: isMobile ? "none" : 1,
//             width: "100%",
//             maxWidth: "100%",
//             overflow: "hidden"
//           }}>
//             <div style={{ 
//               display: "flex", 
//               justifyContent: "space-between", 
//               alignItems: "center", 
//               marginBottom: "15px",
//               flexWrap: "wrap",
//               gap: "8px"
//             }}>
//               <h3 style={{ 
//                 color: appTheme.colors.textPrimary, 
//                 margin: 0,
//                 fontSize: isMobile ? "1rem" : "1.1rem"
//               }}>
//                 Notifications
//               </h3>
//               <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
//                 <button
//                   onClick={handleClearNotifications}
//                   style={{
//                     padding: "5px 10px",
//                     fontSize: isMobile ? "0.65rem" : "0.7rem",
//                     backgroundColor: `${appTheme.colors.error}15`,
//                     color: appTheme.colors.error,
//                     border: `1px solid ${appTheme.colors.error}30`,
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     whiteSpace: "nowrap",
//                     minHeight: "28px"
//                   }}
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={handleViewAllNotifications}
//                   style={{
//                     padding: "5px 10px",
//                     fontSize: isMobile ? "0.65rem" : "0.7rem",
//                     backgroundColor: `${appTheme.colors.primary}15`,
//                     color: appTheme.colors.primary,
//                     border: `1px solid ${appTheme.colors.primary}30`,
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     whiteSpace: "nowrap",
//                     minHeight: "28px"
//                   }}
//                 >
//                   View All
//                 </button>
//               </div>
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "100%" }}>
//               {notifications.slice(0, isMobile ? 3 : 5).map((notification) => (
//                 <div 
//                   key={notification.id} 
//                   onClick={() => markNotificationAsRead(notification.id)}
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     padding: isMobile ? "10px" : "12px",
//                     backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}10` : `${appTheme.colors.background}50`,
//                     borderRadius: "8px",
//                     border: `1px solid ${appTheme.colors.border}15`,
//                     cursor: "pointer",
//                     transition: "all 0.2s ease",
//                     ':hover': {
//                       backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}20` : `${appTheme.colors.background}70`,
//                       transform: "translateY(-1px)"
//                     },
//                     maxWidth: "100%",
//                     overflow: "hidden"
//                   }}
//                 >
//                   <div style={{ 
//                     flex: 1, 
//                     minWidth: 0, 
//                     marginRight: "8px",
//                     overflow: "hidden"
//                   }}>
//                     <div style={{ 
//                       display: "flex", 
//                       alignItems: "flex-start", 
//                       gap: "8px",
//                       marginBottom: "4px",
//                       maxWidth: "100%"
//                     }}>
//                       <div style={{
//                         fontSize: isMobile ? "0.9rem" : "1rem",
//                         flexShrink: 0,
//                         marginTop: "1px"
//                       }}>
//                         {notification.type === 'NEW_ORDER' && '🛍️'}
//                         {notification.type === 'PAYMENT_RECEIVED' && '💰'}
//                         {notification.type === 'ORDER_STATUS_CHANGED' && '📦'}
//                         {!['NEW_ORDER', 'PAYMENT_RECEIVED', 'ORDER_STATUS_CHANGED'].includes(notification.type) && '📢'}
//                       </div>
//                       <div style={{ 
//                         flex: 1,
//                         minWidth: 0
//                       }}>
//                         <div style={{ 
//                           fontWeight: notification.status !== 'read' ? "700" : "600", 
//                           color: appTheme.colors.textPrimary, 
//                           fontSize: isMobile ? "0.8rem" : "0.85rem",
//                           opacity: notification.status === 'read' ? 0.8 : 1,
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           whiteSpace: "nowrap",
//                           lineHeight: 1.3
//                         }}>
//                           {notification.title}
//                         </div>
//                         <div style={{ 
//                           fontSize: isMobile ? "0.7rem" : "0.75rem", 
//                           color: appTheme.colors.textSecondary,
//                           marginTop: "2px",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           whiteSpace: "nowrap"
//                         }}>
//                           {notification.message}
//                         </div>
//                         {notification.orderNumber && (
//                           <div style={{ 
//                             marginTop: "2px",
//                             fontSize: isMobile ? "0.65rem" : "0.7rem",
//                             color: appTheme.colors.primary,
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             whiteSpace: "nowrap"
//                           }}>
//                             Order #{notification.orderNumber}
//                           </div>
//                         )}
//                       </div>
//                       {notification.status !== 'read' && (
//                         <div style={{
//                           width: "6px",
//                           height: "6px",
//                           borderRadius: "50%",
//                           backgroundColor: appTheme.colors.warning,
//                           flexShrink: 0,
//                           marginTop: "4px"
//                         }} />
//                       )}
//                     </div>
//                   </div>
//                   <div style={{ 
//                     fontSize: isMobile ? "0.6rem" : "0.65rem", 
//                     color: appTheme.colors.textSecondary,
//                     whiteSpace: "nowrap",
//                     marginLeft: "4px",
//                     flexShrink: 0,
//                     paddingTop: "1px"
//                   }}>
//                     {notification.timeSince || 'Just now'}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Top Selling Products */}
//       <div style={{ marginTop: isMobile ? "16px" : "20px" }}>
//         <div style={{
//           backgroundColor: appTheme.colors.surface,
//           padding: isMobile ? "16px" : "20px",
//           borderRadius: "12px",
//           boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
//           border: `1px solid ${appTheme.colors.border}20`,
//           width: "100%"
//         }}>
//           <h3 style={{ 
//             marginBottom: "15px", 
//             color: appTheme.colors.textPrimary,
//             fontSize: isMobile ? "1rem" : "1.1rem"
//           }}>
//             Top Selling Products
//           </h3>
//           <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//             {topSellingProducts.length > 0 ? topSellingProducts.map((product, index) => (
//               <div key={product.id || index} style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: isMobile ? "10px" : "12px",
//                 backgroundColor: `${appTheme.colors.background}50`,
//                 borderRadius: "8px",
//                 border: `1px solid ${appTheme.colors.border}15`,
//                 transition: "all 0.2s ease",
//                 ':hover': {
//                   backgroundColor: `${appTheme.colors.background}70`,
//                   transform: "translateY(-1px)",
//                   boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
//                 }
//               }}>
//                 <div style={{ 
//                   display: "flex", 
//                   alignItems: "center", 
//                   gap: isMobile ? "10px" : "12px",
//                   flex: 1,
//                   minWidth: 0
//                 }}>
//                   <div style={{
//                     width: isMobile ? "28px" : "32px",
//                     height: isMobile ? "28px" : "32px",
//                     borderRadius: "6px",
//                     background: `linear-gradient(135deg, ${appTheme.colors.primary}20, ${appTheme.colors.secondary}20)`,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: isMobile ? "0.75rem" : "0.8rem",
//                     fontWeight: "600",
//                     color: appTheme.colors.primary,
//                     flexShrink: 0
//                   }}>
//                     {index + 1}
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ 
//                       fontWeight: "600", 
//                       color: appTheme.colors.textPrimary, 
//                       fontSize: isMobile ? "0.85rem" : "0.9rem",
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis"
//                     }}>
//                       {product.name}
//                     </div>
//                     <div style={{ 
//                       fontSize: isMobile ? "0.75rem" : "0.8rem", 
//                       color: appTheme.colors.textSecondary 
//                     }}>
//                       {product.quantity} sold
//                     </div>
//                   </div>
//                 </div>
//                 <div style={{ 
//                   fontWeight: "600", 
//                   color: appTheme.colors.primary,
//                   fontSize: isMobile ? "0.85rem" : "0.9rem",
//                   whiteSpace: "nowrap",
//                   marginLeft: "10px",
//                   flexShrink: 0
//                 }}>
//                   ₹{product.revenue.toLocaleString()}
//                 </div>
//               </div>
//             )) : (
//               <div style={{ 
//                 textAlign: "center", 
//                 padding: "20px", 
//                 color: appTheme.colors.textSecondary,
//                 fontSize: isMobile ? "0.9rem" : "1rem"
//               }}>
//                 No sales data
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
        
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         /* Improve mobile scrolling */
//         @media (max-width: 768px) {
//           body {
//             -webkit-overflow-scrolling: touch;
//             overflow-x: hidden;
//           }
          
//           * {
//             -webkit-tap-highlight-color: transparent;
//             box-sizing: border-box;
//           }
          
//           select, button, input {
//             font-size: 16px !important; /* Prevents iOS zoom */
//             min-height: 44px !important; /* Better touch targets */
//           }
//         }
        
//         /* Desktop hover effects */
//         @media (hover: hover) and (pointer: fine) {
//           button:not(:disabled):hover {
//             transform: translateY(-1px);
//             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//           }
          
//           button:not(:disabled):active {
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// const MetricCard = ({ icon, title, value, color, appTheme, isMobile }) => (
//   <div style={{
//     backgroundColor: appTheme.colors.surface,
//     padding: isMobile ? "14px" : "18px",
//     borderRadius: "12px",
//     boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
//     border: `1px solid ${appTheme.colors.border}20`,
//     transition: "all 0.2s ease",
//     height: "100%",
//     ':hover': {
//       transform: "translateY(-2px)",
//       boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)"
//     }
//   }}>
//     <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "15px" }}>
//       <div style={{
//         width: isMobile ? "40px" : "48px",
//         height: isMobile ? "40px" : "48px",
//         borderRadius: "10px",
//         background: `${color}20`,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize: isMobile ? "1.2rem" : "1.5rem",
//         color: color,
//         flexShrink: 0
//       }}>
//         {icon}
//       </div>
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div style={{ 
//           fontSize: isMobile ? "0.8rem" : "0.85rem", 
//           color: appTheme.colors.textSecondary, 
//           marginBottom: "2px",
//           whiteSpace: "nowrap",
//           overflow: "hidden",
//           textOverflow: "ellipsis"
//         }}>
//           {title}
//         </div>
//         <div style={{ 
//           fontSize: isMobile ? "1.4rem" : "1.6rem", 
//           fontWeight: "700", 
//           color: appTheme.colors.textPrimary,
//           lineHeight: 1.2
//         }}>
//           {value}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const StatusBadge = ({ status, appTheme, isMobile }) => {
//   const getStatusConfig = (status) => {
//     switch (status) {
//       case 'delivered':
//         return { bg: `${appTheme.colors.success}20`, color: appTheme.colors.success, icon: '✓' };
//       case 'shipped':
//         return { bg: `${appTheme.colors.info}20`, color: appTheme.colors.info, icon: '🚚' };
//       case 'processing':
//         return { bg: `${appTheme.colors.warning}20`, color: appTheme.colors.warning, icon: '⏳' };
//       case 'pending':
//         return { bg: '#FF638420', color: '#FF6384', icon: '⏰' };
//       case 'cancelled':
//         return { bg: '#FF9F4020', color: '#FF9F40', icon: '❌' };
//       default:
//         return { bg: `${appTheme.colors.error}20`, color: appTheme.colors.error, icon: '❓' };
//     }
//   };
  
//   const config = getStatusConfig(status);
  
//   return (
//     <div style={{
//       padding: isMobile ? "3px 8px" : "4px 10px",
//       borderRadius: "12px",
//       fontSize: isMobile ? "0.65rem" : "0.7rem",
//       fontWeight: "600",
//       backgroundColor: config.bg,
//       color: config.color,
//       display: "flex",
//       alignItems: "center",
//       gap: "3px",
//       whiteSpace: "nowrap"
//     }}>
//       <span>{config.icon}</span>
//       <span>{isMobile ? status.substring(0, 4) : status}</span>
//     </div>
//   );
// };





























"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { appTheme } from "../../../src/constants/theme";
import { useNotification } from "../../../hooks/useNotification";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated, session, getAuthHeaders } = useAuth();
  const { showNotification } = useNotification();
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("month");
  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    status: 'disconnected',
    authenticated: false,
    error: null
  });
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const dataFetchedRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef(0);
  const fetchDebounceRef = useRef(null);
  const notificationPermissionRequestedRef = useRef(false);
  const socketEventListenerRef = useRef(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 992);
      setIsDesktop(width >= 992);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ==================== LISTEN FOR SOCKET EVENTS FROM LAYOUT ====================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('📊 Dashboard: Setting up event listeners...');

    const handleNewOrder = (event) => {
      const orderData = event.detail;
      console.log('📊 Dashboard: New order event received:', orderData);
      
      // Add to notifications list
      const newNotification = {
        id: `temp-${Date.now()}`,
        type: 'NEW_ORDER',
        title: '🛍️ New Order!',
        message: `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber}`,
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        totalAmount: orderData.totalPrice || 0,
        status: 'unread',
        createdAt: new Date().toISOString(),
        timeSince: 'Just now',
        source: 'socketio'
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
      
      // Refresh dashboard data with debounce
      if (isMountedRef.current && !fetchInProgressRef.current) {
        clearTimeout(fetchDebounceRef.current);
        fetchDebounceRef.current = setTimeout(() => {
          fetchDashboardData();
        }, 2000);
      }
    };

    const handlePaymentUpdated = (event) => {
      console.log('📊 Dashboard: Payment updated:', event.detail);
      
      // Refresh dashboard data
      if (isMountedRef.current && !fetchInProgressRef.current) {
        clearTimeout(fetchDebounceRef.current);
        fetchDebounceRef.current = setTimeout(() => {
          fetchDashboardData();
        }, 2000);
      }
    };

    const handleOrderStatusUpdated = (event) => {
      console.log('📊 Dashboard: Order status updated:', event.detail);
      
      // Refresh dashboard data
      if (isMountedRef.current && !fetchInProgressRef.current) {
        clearTimeout(fetchDebounceRef.current);
        fetchDebounceRef.current = setTimeout(() => {
          fetchDashboardData();
        }, 2000);
      }
    };

    const checkSocketStatus = () => {
      try {
        const { getSocketIOClient } = require('../../../lib/websocket/socketio-client');
        const socketClient = getSocketIOClient();
        const status = socketClient.getStatus();
        
        setSocketStatus({
          connected: status.isConnected,
          authenticated: status.isAuthenticated,
          status: status.state,
          error: null
        });
      } catch (error) {
        console.warn('Could not check socket status:', error);
      }
    };

    // Set up event listeners
    window.addEventListener('new-order-received', handleNewOrder);
    window.addEventListener('payment-updated', handlePaymentUpdated);
    window.addEventListener('order-status-updated', handleOrderStatusUpdated);

    // Store reference for cleanup
    socketEventListenerRef.current = {
      handleNewOrder,
      handlePaymentUpdated,
      handleOrderStatusUpdated
    };

    // Check initial socket status
    checkSocketStatus();
    
    // Check status periodically
    const statusInterval = setInterval(checkSocketStatus, 5000);

    return () => {
      // Clean up event listeners
      if (socketEventListenerRef.current) {
        window.removeEventListener('new-order-received', socketEventListenerRef.current.handleNewOrder);
        window.removeEventListener('payment-updated', socketEventListenerRef.current.handlePaymentUpdated);
        window.removeEventListener('order-status-updated', socketEventListenerRef.current.handleOrderStatusUpdated);
      }
      clearInterval(statusInterval);
    };
  }, []);

  // ==================== NOTIFICATION PERMISSION ====================
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
        notificationPermissionRequestedRef.current = true;
      }
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // ==================== FETCH NOTIFICATIONS ====================
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const response = await fetch('/api/notifications?limit=10&page=1', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.notifications) {
          setNotifications(data.notifications.slice(0, 5));
        }
      }
    } catch (error) {
      console.warn('Failed to fetch notifications:', error);
    }
  }, [isAuthenticated, user, getAuthHeaders]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ markAsRead: true }),
        credentials: 'include'
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, status: 'read' } : n
        )
      );
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  }, [isAuthenticated, getAuthHeaders]);

  // ==================== DATA FETCHING ====================
  const fetchDashboardData = useCallback(async (force = false) => {
    if (fetchInProgressRef.current) return;
    
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 30000) {
      return;
    }
    
    fetchInProgressRef.current = true;
    lastFetchTimeRef.current = now;
    
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated || !user) {
        if (isMountedRef.current) {
          setError("Please login to view dashboard");
          setLoading(false);
        }
        return;
      }
      
      // Check if user is admin
      if (user.role !== 'admin') {
        if (isMountedRef.current) {
          setError("Admin access required");
          setLoading(false);
        }
        return;
      }
      
      // Get auth headers with user ID and company ID
      const authHeaders = getAuthHeaders();
      
      console.log('📊 Fetching dashboard data with headers:', {
        hasAuth: !!authHeaders.Authorization,
        hasCompanyId: !!authHeaders['x-company-id'],
        hasUserId: !!authHeaders['x-user-id'],
        companyId: authHeaders['x-company-id']
      });
      
      const fetchWithTimeout = (url, options, timeout = 10000) => {
        return Promise.race([
          fetch(url, {
            ...options,
            credentials: 'include',
            headers: authHeaders
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };
      
      const fetchPromises = [
        fetchWithTimeout("/api/orders?limit=100", {}, 8000).then(async res => {
          if (!res.ok) {
            if (res.status === 401) {
              throw new Error("Session expired. Please login again.");
            }
            if (res.status === 403) {
              console.warn('Access denied to orders API - admin only');
              return [];
            }
            const errorText = await res.text();
            console.warn(`Orders API failed: ${res.status}`, errorText);
            return [];
          }
          const data = await res.json();
          console.log('📊 Orders fetched:', data.success ? `${data.data?.length || 0} orders` : 'failed');
          return data.success ? (data.data || []) : [];
        }).catch(err => {
          console.warn('Orders fetch error:', err.message);
          return [];
        }),
        
        fetchWithTimeout("/api/products?limit=100", {}, 8000).then(async res => {
          if (!res.ok) {
            if (res.status === 403) {
              console.warn('Access denied to products API');
              return [];
            }
            const errorText = await res.text();
            console.warn(`Products API failed: ${res.status}`, errorText);
            return [];
          }
          const data = await res.json();
          console.log('📊 Products fetched:', data.success ? `${data.data?.length || 0} products` : 'failed');
          return data.success ? (data.data || []) : [];
        }).catch(err => {
          console.warn('Products fetch error:', err.message);
          return [];
        }),
        
        fetchWithTimeout("/api/users?limit=100", {}, 8000).then(async res => {
          if (!res.ok) {
            if (res.status === 403) {
              console.warn('Access denied to users API');
              return [];
            }
            return [];
          }
          const data = await res.json();
          
          let usersArray = [];
          
          if (data.success) {
            if (Array.isArray(data.data)) {
              usersArray = data.data;
            } else if (data.data && Array.isArray(data.data.users)) {
              usersArray = data.data.users;
            } else if (Array.isArray(data.users)) {
              usersArray = data.users;
            }
          }
          console.log('📊 Users fetched:', usersArray.length);
          return usersArray.filter(u => u && typeof u === 'object');
        }).catch(err => {
          console.warn('Users fetch error:', err.message);
          return [];
        })
      ];
      
      const [ordersData, productsData, usersData] = await Promise.allSettled(fetchPromises);
      
      if (isMountedRef.current) {
        const ordersResult = ordersData.status === 'fulfilled' ? ordersData.value : [];
        const productsResult = productsData.status === 'fulfilled' ? productsData.value : [];
        const usersResult = usersData.status === 'fulfilled' ? usersData.value : [];
        
        console.log('📊 Dashboard data loaded:', {
          orders: ordersResult.length,
          products: productsResult.length,
          users: usersResult.length
        });
        
        setOrders(ordersResult);
        setProducts(productsResult);
        setCustomers(usersResult.length > 0 ? usersResult : []);
        
        dataFetchedRef.current = true;
        
        fetchNotifications();
      }
      
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
      if (isMountedRef.current) {
        if (err.message.includes("Session expired")) {
          setError("Your session has expired. Please login again.");
        } else {
          setError(err.message || "Failed to load dashboard data");
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    }
  }, [isAuthenticated, user, fetchNotifications, getAuthHeaders]);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    isMountedRef.current = true;
    dataFetchedRef.current = false;
    fetchInProgressRef.current = false;
    
    const initDataFetch = async () => {
      if (!isMountedRef.current) return;
      
      if (authLoading) return;
      
      if (!isAuthenticated || !user) {
        if (isMountedRef.current) {
          setError("Please login to view dashboard");
          setLoading(false);
        }
        return;
      }
      
      if (!dataFetchedRef.current && !fetchInProgressRef.current) {
        await fetchDashboardData(true);
      }
    };
    
    const timer = setTimeout(() => {
      initDataFetch();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      fetchInProgressRef.current = false;
    };
  }, [authLoading, isAuthenticated, user, fetchDashboardData]);

  // ==================== AUTO REFRESH ====================
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (socketStatus.connected && !fetchInProgressRef.current && isMountedRef.current) {
        fetchDashboardData();
      }
    }, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [socketStatus.connected, fetchDashboardData]);

  // ==================== REQUEST NOTIFICATION PERMISSION ====================
  const handleRequestNotificationPermission = useCallback(async () => {
    try {
      if (window.Notification && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
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

  // ==================== DATA PROCESSING ====================
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      if (!order || !order.createdAt) return false;
      
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return false;
      
      switch (timeFilter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return orderDate >= startOfWeek;
        case "month":
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return orderDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [orders, timeFilter]);

  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o && o.paymentStatus === "paid" && typeof o.totalPrice === 'number')
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }, [filteredOrders]);

  const totalOrders = filteredOrders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  const orderStatusMetrics = useMemo(() => {
    return {
      pending: filteredOrders.filter(o => o && o.status === "pending").length,
      processing: filteredOrders.filter(o => o && o.status === "processing").length,
      shipped: filteredOrders.filter(o => o && o.status === "shipped").length,
      delivered: filteredOrders.filter(o => o && o.status === "delivered").length,
      cancelled: filteredOrders.filter(o => o && o.status === "cancelled").length,
    };
  }, [filteredOrders]);

  const topSellingProducts = useMemo(() => {
    const productSales = {};
    
    filteredOrders.forEach(order => {
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!item) return;
          
          const productName = item.productName || 'Unknown Product';
          const productId = item.productId?._id || productName;
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          const price = typeof item.price === 'number' ? item.price : 0;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              quantity: 0,
              revenue: 0,
              id: productId
            };
          }
          productSales[productId].quantity += quantity;
          productSales[productId].revenue += price * quantity;
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredOrders]);

  const recentOrders = useMemo(() => {
    return filteredOrders
      .filter(order => order && order.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        _id: order._id || `order-${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: order.orderNumber || `ORD-${Math.random().toString(36).substr(2, 9)}`,
        createdBy: order.customerName || order.email || 'Unknown Customer',
        totalPrice: typeof order.totalPrice === 'number' ? order.totalPrice : 0,
        status: order.status || 'pending',
        createdAt: order.createdAt
      }));
  }, [filteredOrders]);

  const revenueChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const data = Array(12).fill(0);
    
    orders.forEach(order => {
      if (order && order.createdAt && order.paymentStatus === "paid") {
        const orderDate = new Date(order.createdAt);
        const monthIndex = orderDate.getMonth();
        data[monthIndex] += order.totalPrice || 0;
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: "Revenue (₹)",
          data: data,
          borderColor: appTheme.colors.primary,
          backgroundColor: `${appTheme.colors.primary}20`,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [orders]);

  const ordersChartData = useMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Orders",
        data: Array(12).fill(0).map((_, i) => 
          orders.filter(order => {
            if (!order || !order.createdAt) return false;
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === i;
          }).length
        ),
        backgroundColor: appTheme.colors.secondary,
        borderRadius: 8,
      },
    ],
  }), [orders]);

  const orderStatusData = useMemo(() => ({
    labels: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    datasets: [
      {
        data: [
          orderStatusMetrics.pending,
          orderStatusMetrics.processing,
          orderStatusMetrics.shipped,
          orderStatusMetrics.delivered,
          orderStatusMetrics.cancelled
        ],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40"
        ],
        borderWidth: 2,
        borderColor: appTheme.colors.backgroundCard,
      },
    ],
  }), [orderStatusMetrics]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: isMobile ? 10 : 12,
            family: appTheme.fonts.families.primary
          }
        }
      },
      tooltip: {
        bodyFont: {
          family: appTheme.fonts.families.primary
        },
        titleFont: {
          family: appTheme.fonts.families.primary
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: `${appTheme.colors.border}40`,
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
            family: appTheme.fonts.families.primary
          }
        }
      },
      x: {
        grid: {
          color: `${appTheme.colors.border}40`,
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
            family: appTheme.fonts.families.primary
          }
        }
      },
    },
  }), [isMobile, appTheme]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'right' : 'bottom',
        labels: {
          usePointStyle: true,
          padding: 10,
          font: {
            size: isMobile ? 9 : 11,
            family: appTheme.fonts.families.primary
          }
        }
      },
      tooltip: {
        bodyFont: {
          family: appTheme.fonts.families.primary
        },
        titleFont: {
          family: appTheme.fonts.families.primary
        }
      }
    },
    cutout: isMobile ? '55%' : '65%',
  }), [isMobile, appTheme]);

  // ==================== EVENT HANDLERS ====================
  const handleRetry = useCallback(() => {
    setError(null);
    dataFetchedRef.current = false;
    fetchInProgressRef.current = false;
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  const handleSessionExpired = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const handleLoginRedirect = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const handleReconnectSocket = useCallback(() => {
    try {
      const { getSocketIOClient } = require('../../../lib/websocket/socketio-client');
      const socketClient = getSocketIOClient();
      socketClient.disconnect();
      setTimeout(() => {
        socketClient.connect(user);
        showNotification(
          'Reconnecting...',
          'Attempting to reconnect to real-time server',
          'info',
          3000
        );
      }, 1000);
    } catch (error) {
      console.error('Failed to reconnect socket:', error);
    }
  }, [user, showNotification]);

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
    showNotification(
      'Notifications Cleared',
      'All notifications have been cleared',
      'success',
      3000
    );
  }, [showNotification]);

  const handleViewAllNotifications = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/notifications';
    }
  }, []);

  // ==================== RENDER LOGIC ====================
  if (error) {
    const isSessionExpired = error.includes("session has expired") || error.includes("Session expired");
    
    return (
      <div style={{ 
        padding: isMobile ? "20px 16px" : "40px", 
        backgroundColor: appTheme.colors.backgroundLight,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: isMobile ? "15px" : "20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: isMobile ? "2.5rem" : "3rem" }}>{isSessionExpired ? "⏰" : "⚠️"}</div>
        <h2 style={{ 
          color: appTheme.colors.error,
          fontSize: isMobile ? "1.3rem" : "1.5rem",
          margin: "5px 0",
          fontFamily: appTheme.fonts.families.primary,
          fontWeight: appTheme.fonts.weights.semibold
        }}>{isSessionExpired ? "Session Expired" : "Error"}</h2>
        <p style={{ 
          color: appTheme.colors.textSecondary,
          fontSize: isMobile ? "0.9rem" : "1rem",
          lineHeight: 1.5,
          maxWidth: "400px",
          fontFamily: appTheme.fonts.families.primary
        }}>{error}</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {isSessionExpired ? (
            <button
              onClick={handleSessionExpired}
              style={{
                padding: isMobile ? "10px 20px" : "12px 24px",
                backgroundColor: appTheme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: appTheme.radius.md,
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: appTheme.fonts.weights.semibold,
                minWidth: "120px",
                minHeight: "44px",
                fontFamily: appTheme.fonts.families.primary
              }}
            >
              Go to Login
            </button>
          ) : (
            <>
              <button
                onClick={handleLoginRedirect}
                style={{
                  padding: isMobile ? "10px 20px" : "12px 24px",
                  backgroundColor: appTheme.colors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: appTheme.radius.md,
                  cursor: "pointer",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: appTheme.fonts.weights.semibold,
                  minWidth: "120px",
                  minHeight: "44px",
                  fontFamily: appTheme.fonts.families.primary
                }}
              >
                Go to Login
              </button>
              <button
                onClick={handleRetry}
                style={{
                  padding: isMobile ? "10px 20px" : "12px 24px",
                  backgroundColor: appTheme.colors.secondary,
                  color: "white",
                  border: "none",
                  borderRadius: appTheme.radius.md,
                  cursor: "pointer",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: appTheme.fonts.weights.semibold,
                  minWidth: "120px",
                  minHeight: "44px",
                  fontFamily: appTheme.fonts.families.primary
                }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div style={{ 
        padding: isMobile ? "20px 16px" : "40px", 
        backgroundColor: appTheme.colors.backgroundLight,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          textAlign: "center",
          color: appTheme.colors.textSecondary
        }}>
          <div style={{ 
            width: isMobile ? "50px" : "60px", 
            height: isMobile ? "50px" : "60px", 
            border: `4px solid ${appTheme.colors.border}`,
            borderTop: `4px solid ${appTheme.colors.primary}`,
            borderRadius: "50%",
            margin: "0 auto",
            animation: "spin 1s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ 
            fontSize: isMobile ? "1rem" : "1.2rem", 
            marginTop: isMobile ? "15px" : "20px",
            fontFamily: appTheme.fonts.families.primary
          }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => n.status !== 'read').length;

  return (
    <div style={{ 
      padding: isMobile ? "12px" : "24px", 
      backgroundColor: appTheme.colors.backgroundLight, 
      minHeight: "100vh",
      maxWidth: "100vw",
      overflowX: "hidden",
      boxSizing: "border-box"
    }}>
      {/* Header Section */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "flex-start",
        marginBottom: isMobile ? "16px" : "24px",
        gap: isMobile ? "12px" : "20px",
        width: "100%"
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ 
            color: appTheme.colors.textPrimary, 
            marginBottom: isMobile ? "4px" : "6px",
            fontSize: isMobile ? "1.3rem" : "1.8rem",
            fontWeight: appTheme.fonts.weights.bold,
            lineHeight: 1.2,
            wordBreak: "break-word",
            fontFamily: appTheme.fonts.families.primary
          }}>
            Dashboard Overview
          </h1>
          <div style={{ 
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: isMobile ? "6px" : "8px",
            marginTop: isMobile ? "4px" : "6px"
          }}>
            <p style={{ 
              color: appTheme.colors.textSecondary,
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              margin: 0,
              lineHeight: 1.3,
              fontFamily: appTheme.fonts.families.primary
            }}>
              Welcome to your e-commerce dashboard
            </p>
            
            {socketStatus.connected && (
              <span style={{ 
                fontSize: isMobile ? "0.7rem" : "0.75rem",
                backgroundColor: "#10b98120",
                color: "#10b981",
                padding: "3px 8px",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontFamily: appTheme.fonts.families.primary
              }}>
                <span>🔗</span>Live
              </span>
            )}
            
            {!socketStatus.connected && (
              <button
                onClick={handleReconnectSocket}
                style={{
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  backgroundColor: "#ef444420",
                  color: "#ef4444",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  minHeight: "28px",
                  fontFamily: appTheme.fonts.families.primary
                }}
                title="Click to reconnect"
              >
                <span>❌</span>Offline
              </button>
            )}
            
            {unreadNotifications > 0 && (
              <button
                onClick={handleViewAllNotifications}
                style={{
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  backgroundColor: "#f59e0b20",
                  color: "#f59e0b",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  minHeight: "28px",
                  fontFamily: appTheme.fonts.families.primary
                }}
                title="View notifications"
              >
                <span>🔔</span>{unreadNotifications} new
              </button>
            )}
          </div>
          
          {user && (
            <div style={{ 
              marginTop: isMobile ? "8px" : "12px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: isMobile ? "8px" : "10px",
              fontSize: isMobile ? "0.75rem" : "0.8rem"
            }}>
              <span style={{ 
                color: appTheme.colors.textSecondary,
                flexShrink: 0,
                fontFamily: appTheme.fonts.families.primary
              }}>
                Logged in as:
              </span>
              <span style={{ 
                color: appTheme.colors.primary,
                fontWeight: appTheme.fonts.weights.medium,
                wordBreak: "break-word",
                flex: 1,
                minWidth: 0,
                fontFamily: appTheme.fonts.families.primary
              }}>
                {user.email}
              </span>
              <div style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "6px" : "8px",
                flexWrap: "wrap",
                flexShrink: 0
              }}>
                <span style={{ 
                  fontSize: "0.75rem",
                  color: appTheme.colors.textSecondary,
                  flexShrink: 0,
                  fontFamily: appTheme.fonts.families.primary
                }}>
                  Role:
                </span>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.8rem",
                  backgroundColor: user.role === 'admin' ? `${appTheme.colors.success}20` : `${appTheme.colors.info}20`,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  fontFamily: appTheme.fonts.families.primary
                }}>
                  {user.role}
                </span>
                {notificationPermission === 'granted' && (
                  <span style={{ 
                    fontSize: isMobile ? "0.7rem" : "0.75rem",
                    backgroundColor: `${appTheme.colors.success}20`,
                    color: appTheme.colors.success,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    fontFamily: appTheme.fonts.families.primary
                  }}>
                    <span>🔔</span>On
                  </span>
                )}
                {notificationPermission === 'default' && (
                  <button
                    onClick={handleRequestNotificationPermission}
                    style={{
                      fontSize: isMobile ? "0.7rem" : "0.75rem",
                      backgroundColor: `${appTheme.colors.primary}20`,
                      color: appTheme.colors.primary,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: `1px solid ${appTheme.colors.primary}30`,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap",
                      minHeight: "24px",
                      flexShrink: 0,
                      fontFamily: appTheme.fonts.families.primary
                    }}
                  >
                    <span>🔔</span>Enable
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filters and Actions */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "row",
          alignItems: "center",
          gap: isMobile ? "8px" : "10px",
          flexWrap: "wrap",
          justifyContent: isMobile ? "space-between" : "flex-end",
          width: isMobile ? "100%" : "auto"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "6px" : "8px",
            flex: isMobile ? 1 : "none"
          }}>
            <label style={{ 
              color: appTheme.colors.textSecondary,
              fontWeight: appTheme.fonts.weights.medium,
              fontSize: isMobile ? "0.85rem" : "0.9rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontFamily: appTheme.fonts.families.primary
            }}>Period: </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                padding: isMobile ? "8px 12px" : "9px 14px",
                borderRadius: appTheme.radius.md,
                border: `1.5px solid ${appTheme.colors.border}`,
                fontFamily: appTheme.fonts.families.primary,
                backgroundColor: appTheme.colors.backgroundCard,
                color: appTheme.colors.textPrimary,
                fontSize: isMobile ? "0.85rem" : "0.9rem",
                cursor: "pointer",
                minWidth: isMobile ? "100px" : "120px",
                maxWidth: "100%",
                flex: isMobile ? 1 : "none",
                minHeight: "36px",
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
                backgroundSize: "16px",
                paddingRight: "32px"
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "6px" : "8px",
            flex: isMobile ? 1 : "none",
            justifyContent: isMobile ? "flex-end" : "flex-start"
          }}>
            <button
              onClick={() => fetchDashboardData(true)}
              style={{
                padding: isMobile ? "8px 12px" : "9px 14px",
                backgroundColor: `${appTheme.colors.primary}15`,
                color: appTheme.colors.primary,
                border: `1px solid ${appTheme.colors.primary}30`,
                borderRadius: appTheme.radius.md,
                cursor: "pointer",
                fontSize: isMobile ? "0.85rem" : "0.9rem",
                fontWeight: appTheme.fonts.weights.medium,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
                minHeight: "36px",
                flexShrink: 0,
                fontFamily: appTheme.fonts.families.primary
              }}
            >
              <span>🔄</span>
              <span style={{ display: isMobile ? "none" : "inline" }}>Refresh</span>
            </button>
            
            {!socketStatus.connected && (
              <button
                onClick={handleReconnectSocket}
                style={{
                  padding: isMobile ? "8px 12px" : "9px 14px",
                  backgroundColor: `${appTheme.colors.error}15`,
                  color: appTheme.colors.error,
                  border: `1px solid ${appTheme.colors.error}30`,
                  borderRadius: appTheme.radius.md,
                  cursor: "pointer",
                  fontSize: isMobile ? "0.85rem" : "0.9rem",
                  fontWeight: appTheme.fonts.weights.medium,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  whiteSpace: "nowrap",
                  minHeight: "36px",
                  flexShrink: 0,
                  fontFamily: appTheme.fonts.families.primary
                }}
                title="Reconnect to real-time server"
              >
                <span>🔌</span>
                <span style={{ display: isMobile ? "none" : "inline" }}>Reconnect</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", 
        gap: isMobile ? "12px" : "16px", 
        marginBottom: isMobile ? "20px" : "25px"
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
          padding: isMobile ? "16px" : "20px",
          borderRadius: appTheme.radius.lg,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ 
              fontSize: isMobile ? "0.8rem" : "0.85rem", 
              opacity: 0.9, 
              marginBottom: "6px",
              fontFamily: appTheme.fonts.families.primary
            }}>
              Total Revenue
            </div>
            <div style={{ 
              fontSize: isMobile ? "1.5rem" : "1.8rem", 
              fontWeight: appTheme.fonts.weights.bold, 
              marginBottom: "4px",
              lineHeight: 1.2,
              fontFamily: appTheme.fonts.families.primary
            }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: isMobile ? "0.75rem" : "0.8rem", 
              opacity: 0.8,
              fontFamily: appTheme.fonts.families.primary
            }}>
              {timeFilter === 'today' ? 'Today' : 
               timeFilter === 'week' ? 'This Week' : 
               timeFilter === 'month' ? 'This Month' : 'This Year'}
            </div>
          </div>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "1fr",
          gap: isMobile ? "12px" : "16px",
          gridColumn: isMobile ? "span 1" : "auto"
        }}>
          <MetricCard 
            icon="📦" 
            title="Total Orders" 
            value={totalOrders} 
            color={appTheme.colors.info}
            appTheme={appTheme}
            isMobile={isMobile}
          />
          <MetricCard 
            icon="👥" 
            title="Total Users" 
            value={totalCustomers} 
            color={appTheme.colors.success}
            appTheme={appTheme}
            isMobile={isMobile}
          />
        </div>
        
        <MetricCard 
          icon="🛍️" 
          title="Total Products" 
          value={totalProducts} 
          color={appTheme.colors.warning}
          appTheme={appTheme}
          isMobile={isMobile}
        />
      </div>

      {/* Charts Row */}
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "16px" : "20px", 
        marginBottom: isMobile ? "20px" : "25px"
      }}>
        <div style={{
          backgroundColor: appTheme.colors.backgroundCard,
          padding: isMobile ? "16px" : "20px",
          borderRadius: appTheme.radius.lg,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${appTheme.colors.border}20`,
          height: "100%",
          flex: isMobile ? "none" : 2,
          width: "100%"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "15px" 
          }}>
            <h3 style={{ 
              color: appTheme.colors.textPrimary, 
              margin: 0,
              fontSize: isMobile ? "1rem" : "1.1rem",
              fontFamily: appTheme.fonts.families.primary,
              fontWeight: appTheme.fonts.weights.semibold
            }}>
              Revenue Trend
            </h3>
            {socketStatus.connected && (
              <div style={{
                fontSize: isMobile ? "0.65rem" : "0.7rem",
                padding: "3px 8px",
                borderRadius: "12px",
                backgroundColor: "#10b98120",
                color: "#10b981",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                fontFamily: appTheme.fonts.families.primary
              }}>
                <div style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  animation: "pulse 1.5s infinite"
                }}></div>
                Live
              </div>
            )}
          </div>
          <div style={{ height: isMobile ? "220px" : "280px", width: "100%" }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div style={{
          backgroundColor: appTheme.colors.backgroundCard,
          padding: isMobile ? "16px" : "20px",
          borderRadius: appTheme.radius.lg,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${appTheme.colors.border}20`,
          height: "100%",
          flex: isMobile ? "none" : 1,
          width: "100%"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "15px" 
          }}>
            <h3 style={{ 
              color: appTheme.colors.textPrimary, 
              margin: 0,
              fontSize: isMobile ? "1rem" : "1.1rem",
              fontFamily: appTheme.fonts.families.primary,
              fontWeight: appTheme.fonts.weights.semibold
            }}>
              Order Status
            </h3>
            <button
              onClick={handleRetry}
              style={{
                padding: "4px 10px",
                fontSize: isMobile ? "0.65rem" : "0.7rem",
                backgroundColor: `${appTheme.colors.primary}15`,
                color: appTheme.colors.primary,
                border: `1px solid ${appTheme.colors.primary}30`,
                borderRadius: "6px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: "24px",
                fontFamily: appTheme.fonts.families.primary
              }}
            >
              Update
            </button>
          </div>
          <div style={{ height: isMobile ? "220px" : "280px", width: "100%" }}>
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Data Row */}
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "16px" : "20px",
        marginBottom: isMobile ? "20px" : "25px"
      }}>
        <div style={{
          backgroundColor: appTheme.colors.backgroundCard,
          padding: isMobile ? "16px" : "20px",
          borderRadius: appTheme.radius.lg,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${appTheme.colors.border}20`,
          flex: notifications.length > 0 ? (isMobile ? "none" : 2) : 1,
          width: "100%"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "15px" 
          }}>
            <h3 style={{ 
              color: appTheme.colors.textPrimary, 
              margin: 0,
              fontSize: isMobile ? "1rem" : "1.1rem",
              fontFamily: appTheme.fonts.families.primary,
              fontWeight: appTheme.fonts.weights.semibold
            }}>
              Recent Orders
            </h3>
            {socketStatus.connected && (
              <div style={{
                fontSize: isMobile ? "0.65rem" : "0.7rem",
                padding: "3px 8px",
                borderRadius: "12px",
                backgroundColor: "#3b82f620",
                color: "#3b82f6",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                fontFamily: appTheme.fonts.families.primary
              }}>
                <span>📡</span>
                <span style={{ display: isMobile ? "none" : "inline" }}>Real-time</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order._id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: isMobile ? "10px" : "12px",
                backgroundColor: `${appTheme.colors.backgroundLight}50`,
                borderRadius: appTheme.radius.md,
                border: `1px solid ${appTheme.colors.border}15`,
                transition: "all 0.2s ease",
                ':hover': {
                  backgroundColor: `${appTheme.colors.backgroundLight}70`,
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }
              }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: "10px" }}>
                  <div style={{ 
                    fontWeight: appTheme.fonts.weights.semibold, 
                    color: appTheme.colors.textPrimary, 
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: appTheme.fonts.families.primary
                  }}>
                    #{order.orderNumber}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? "0.75rem" : "0.8rem", 
                    color: appTheme.colors.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: appTheme.fonts.families.primary
                  }}>
                    {order.createdBy} • ₹{order.totalPrice.toLocaleString()}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StatusBadge status={order.status} appTheme={appTheme} isMobile={isMobile} />
                </div>
              </div>
            )) : (
              <div style={{ 
                textAlign: "center", 
                padding: "20px", 
                color: appTheme.colors.textSecondary,
                fontSize: isMobile ? "0.9rem" : "1rem",
                fontFamily: appTheme.fonts.families.primary
              }}>
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div style={{
            backgroundColor: appTheme.colors.backgroundCard,
            padding: isMobile ? "16px" : "20px",
            borderRadius: appTheme.radius.lg,
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
            border: `1px solid ${appTheme.colors.border}20`,
            flex: isMobile ? "none" : 1,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "15px",
              flexWrap: "wrap",
              gap: "8px"
            }}>
              <h3 style={{ 
                color: appTheme.colors.textPrimary, 
                margin: 0,
                fontSize: isMobile ? "1rem" : "1.1rem",
                fontFamily: appTheme.fonts.families.primary,
                fontWeight: appTheme.fonts.weights.semibold
              }}>
                Notifications
              </h3>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={handleClearNotifications}
                  style={{
                    padding: "5px 10px",
                    fontSize: isMobile ? "0.65rem" : "0.7rem",
                    backgroundColor: `${appTheme.colors.error}15`,
                    color: appTheme.colors.error,
                    border: `1px solid ${appTheme.colors.error}30`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    minHeight: "28px",
                    fontFamily: appTheme.fonts.families.primary
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleViewAllNotifications}
                  style={{
                    padding: "5px 10px",
                    fontSize: isMobile ? "0.65rem" : "0.7rem",
                    backgroundColor: `${appTheme.colors.primary}15`,
                    color: appTheme.colors.primary,
                    border: `1px solid ${appTheme.colors.primary}30`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    minHeight: "28px",
                    fontFamily: appTheme.fonts.families.primary
                  }}
                >
                  View All
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "100%" }}>
              {notifications.slice(0, isMobile ? 3 : 5).map((notification) => (
                <div 
                  key={notification.id} 
                  onClick={() => markNotificationAsRead(notification.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: isMobile ? "10px" : "12px",
                    backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}10` : `${appTheme.colors.backgroundLight}50`,
                    borderRadius: appTheme.radius.md,
                    border: `1px solid ${appTheme.colors.border}15`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    ':hover': {
                      backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}20` : `${appTheme.colors.backgroundLight}70`,
                      transform: "translateY(-1px)"
                    },
                    maxWidth: "100%",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    marginRight: "8px",
                    overflow: "hidden"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "8px",
                      marginBottom: "4px",
                      maxWidth: "100%"
                    }}>
                      <div style={{
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        flexShrink: 0,
                        marginTop: "1px"
                      }}>
                        {notification.type === 'NEW_ORDER' && '🛍️'}
                        {notification.type === 'PAYMENT_RECEIVED' && '💰'}
                        {notification.type === 'ORDER_STATUS_CHANGED' && '📦'}
                        {!['NEW_ORDER', 'PAYMENT_RECEIVED', 'ORDER_STATUS_CHANGED'].includes(notification.type) && '📢'}
                      </div>
                      <div style={{ 
                        flex: 1,
                        minWidth: 0
                      }}>
                        <div style={{ 
                          fontWeight: notification.status !== 'read' ? appTheme.fonts.weights.bold : appTheme.fonts.weights.semibold, 
                          color: appTheme.colors.textPrimary, 
                          fontSize: isMobile ? "0.8rem" : "0.85rem",
                          opacity: notification.status === 'read' ? 0.8 : 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          lineHeight: 1.3,
                          fontFamily: appTheme.fonts.families.primary
                        }}>
                          {notification.title}
                        </div>
                        <div style={{ 
                          fontSize: isMobile ? "0.7rem" : "0.75rem", 
                          color: appTheme.colors.textSecondary,
                          marginTop: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: appTheme.fonts.families.primary
                        }}>
                          {notification.message}
                        </div>
                        {notification.orderNumber && (
                          <div style={{ 
                            marginTop: "2px",
                            fontSize: isMobile ? "0.65rem" : "0.7rem",
                            color: appTheme.colors.primary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: appTheme.fonts.families.primary
                          }}>
                            Order #{notification.orderNumber}
                          </div>
                        )}
                      </div>
                      {notification.status !== 'read' && (
                        <div style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: appTheme.colors.warning,
                          flexShrink: 0,
                          marginTop: "4px"
                        }} />
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? "0.6rem" : "0.65rem", 
                    color: appTheme.colors.textSecondary,
                    whiteSpace: "nowrap",
                    marginLeft: "4px",
                    flexShrink: 0,
                    paddingTop: "1px",
                    fontFamily: appTheme.fonts.families.primary
                  }}>
                    {notification.timeSince || 'Just now'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div style={{ marginTop: isMobile ? "16px" : "20px" }}>
        <div style={{
          backgroundColor: appTheme.colors.backgroundCard,
          padding: isMobile ? "16px" : "20px",
          borderRadius: appTheme.radius.lg,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${appTheme.colors.border}20`,
          width: "100%"
        }}>
          <h3 style={{ 
            marginBottom: "15px", 
            color: appTheme.colors.textPrimary,
            fontSize: isMobile ? "1rem" : "1.1rem",
            fontFamily: appTheme.fonts.families.primary,
            fontWeight: appTheme.fonts.weights.semibold
          }}>
            Top Selling Products
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topSellingProducts.length > 0 ? topSellingProducts.map((product, index) => (
              <div key={product.id || index} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: isMobile ? "10px" : "12px",
                backgroundColor: `${appTheme.colors.backgroundLight}50`,
                borderRadius: appTheme.radius.md,
                border: `1px solid ${appTheme.colors.border}15`,
                transition: "all 0.2s ease",
                ':hover': {
                  backgroundColor: `${appTheme.colors.backgroundLight}70`,
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }
              }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: isMobile ? "10px" : "12px",
                  flex: 1,
                  minWidth: 0
                }}>
                  <div style={{
                    width: isMobile ? "28px" : "32px",
                    height: isMobile ? "28px" : "32px",
                    borderRadius: "6px",
                    background: `linear-gradient(135deg, ${appTheme.colors.primary}20, ${appTheme.colors.secondary}20)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "0.75rem" : "0.8rem",
                    fontWeight: appTheme.fonts.weights.semibold,
                    color: appTheme.colors.primary,
                    flexShrink: 0,
                    fontFamily: appTheme.fonts.families.primary
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: appTheme.fonts.weights.semibold, 
                      color: appTheme.colors.textPrimary, 
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: appTheme.fonts.families.primary
                    }}>
                      {product.name}
                    </div>
                    <div style={{ 
                      fontSize: isMobile ? "0.75rem" : "0.8rem", 
                      color: appTheme.colors.textSecondary,
                      fontFamily: appTheme.fonts.families.primary
                    }}>
                      {product.quantity} sold
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontWeight: appTheme.fonts.weights.semibold, 
                  color: appTheme.colors.primary,
                  fontSize: isMobile ? "0.85rem" : "0.9rem",
                  whiteSpace: "nowrap",
                  marginLeft: "10px",
                  flexShrink: 0,
                  fontFamily: appTheme.fonts.families.primary
                }}>
                  ₹{product.revenue.toLocaleString()}
                </div>
              </div>
            )) : (
              <div style={{ 
                textAlign: "center", 
                padding: "20px", 
                color: appTheme.colors.textSecondary,
                fontSize: isMobile ? "0.9rem" : "1rem",
                fontFamily: appTheme.fonts.families.primary
              }}>
                No sales data
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Improve mobile scrolling */
        @media (max-width: 768px) {
          body {
            -webkit-overflow-scrolling: touch;
            overflow-x: hidden;
          }
          
          * {
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
          }
          
          select, button, input {
            font-size: 16px !important; /* Prevents iOS zoom */
            min-height: 44px !important; /* Better touch targets */
          }
        }
        
        /* Desktop hover effects */
        @media (hover: hover) and (pointer: fine) {
          button:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          button:not(:disabled):active {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const MetricCard = ({ icon, title, value, color, appTheme, isMobile }) => (
  <div style={{
    backgroundColor: appTheme.colors.backgroundCard,
    padding: isMobile ? "14px" : "18px",
    borderRadius: appTheme.radius.lg,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
    border: `1px solid ${appTheme.colors.border}20`,
    transition: "all 0.2s ease",
    height: "100%",
    ':hover': {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)"
    }
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "15px" }}>
      <div style={{
        width: isMobile ? "40px" : "48px",
        height: isMobile ? "40px" : "48px",
        borderRadius: "10px",
        background: `${color}20`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isMobile ? "1.2rem" : "1.5rem",
        color: color,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: isMobile ? "0.8rem" : "0.85rem", 
          color: appTheme.colors.textSecondary, 
          marginBottom: "2px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: appTheme.fonts.families.primary
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: isMobile ? "1.4rem" : "1.6rem", 
          fontWeight: appTheme.fonts.weights.bold, 
          color: appTheme.colors.textPrimary,
          lineHeight: 1.2,
          fontFamily: appTheme.fonts.families.primary
        }}>
          {value}
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status, appTheme, isMobile }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: `${appTheme.colors.success}20`, color: appTheme.colors.success, icon: '✓' };
      case 'shipped':
        return { bg: `${appTheme.colors.info}20`, color: appTheme.colors.info, icon: '🚚' };
      case 'processing':
        return { bg: `${appTheme.colors.warning}20`, color: appTheme.colors.warning, icon: '⏳' };
      case 'pending':
        return { bg: '#FF638420', color: '#FF6384', icon: '⏰' };
      case 'cancelled':
        return { bg: '#FF9F4020', color: '#FF9F40', icon: '❌' };
      default:
        return { bg: `${appTheme.colors.error}20`, color: appTheme.colors.error, icon: '❓' };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <div style={{
      padding: isMobile ? "3px 8px" : "4px 10px",
      borderRadius: "12px",
      fontSize: isMobile ? "0.65rem" : "0.7rem",
      fontWeight: appTheme.fonts.weights.semibold,
      backgroundColor: config.bg,
      color: config.color,
      display: "flex",
      alignItems: "center",
      gap: "3px",
      whiteSpace: "nowrap",
      fontFamily: appTheme.fonts.families.primary
    }}>
      <span>{config.icon}</span>
      <span>{isMobile ? status.substring(0, 4) : status}</span>
    </div>
  );
};