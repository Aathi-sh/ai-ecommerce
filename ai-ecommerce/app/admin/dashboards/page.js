
"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuth } from '../../../context/authContext';
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
  const { user, loading: authLoading, isAuthenticated } = useAuth();
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
  
  const dataFetchedRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef(0);
  const fetchDebounceRef = useRef(null);
  const notificationPermissionRequestedRef = useRef(false);
  const socketEventListenerRef = useRef(null);

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
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
    if (!isAuthenticated || !user || user.role !== 'admin') return;
    
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch('/api/notifications?limit=10&page=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
  }, [isAuthenticated, user, getToken]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAsRead: true })
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, status: 'read' } : n
        )
      );
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  }, [getToken]);

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
      
      const token = getToken();
      if (!token) {
        console.error('No token found');
        if (isMountedRef.current) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
        }
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const fetchWithTimeout = (url, options, timeout = 10000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };
      
      const fetchPromises = [
        fetchWithTimeout("/api/orders", { 
          headers,
          credentials: 'include'
        }, 8000).then(async res => {
          if (!res.ok) {
            if (res.status === 401) {
              throw new Error("Session expired. Please login again.");
            }
            const errorText = await res.text();
            console.warn(`Orders API failed: ${res.status}`, errorText);
            throw new Error(`Failed to load orders: ${res.status}`);
          }
          const data = await res.json();
          return data.success ? (data.data || []) : [];
        }),
        
        fetchWithTimeout("/api/products", { 
          headers,
          credentials: 'include'
        }, 8000).then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            console.warn(`Products API failed: ${res.status}`, errorText);
            throw new Error(`Failed to load products: ${res.status}`);
          }
          const data = await res.json();
          return data.success ? (data.data || []) : [];
        }),
        
        fetchWithTimeout("/api/users", { 
          headers,
          credentials: 'include'
        }, 8000).then(async res => {
          if (!res.ok) {
            if (res.status === 403) {
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
          return usersArray.filter(u => u && typeof u === 'object');
        })
      ];
      
      const [ordersData, productsData, usersData] = await Promise.allSettled(fetchPromises);
      
      if (isMountedRef.current) {
        const ordersResult = ordersData.status === 'fulfilled' ? ordersData.value : [];
        const productsResult = productsData.status === 'fulfilled' ? productsData.value : [];
        const usersResult = usersData.status === 'fulfilled' ? usersData.value : [];
        
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
  }, [isAuthenticated, user, getToken, fetchNotifications]);

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
      
      const token = getToken();
      
      if (!dataFetchedRef.current && !fetchInProgressRef.current && token) {
        await fetchDashboardData();
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
  }, [authLoading, isAuthenticated, user, getToken, fetchDashboardData]);

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

  // ==================== DATA PROCESSING (Keep your existing code) ====================
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
    const currentMonth = new Date().getMonth();
    
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
  }, [orders, appTheme.colors.primary]);

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
  }), [orders, appTheme.colors.secondary]);

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
        borderColor: appTheme.colors.surface,
      },
    ],
  }), [orderStatusMetrics, appTheme.colors.surface]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: `${appTheme.colors.border}40`,
        }
      },
      x: {
        grid: {
          color: `${appTheme.colors.border}40`,
        }
      },
    },
  }), [appTheme.colors.border]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
    },
    cutout: '65%',
  }), []);

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
        padding: "40px", 
        backgroundColor: appTheme.colors.background,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ fontSize: "3rem" }}>{isSessionExpired ? "⏰" : "⚠️"}</div>
        <h2 style={{ color: appTheme.colors.error }}>{isSessionExpired ? "Session Expired" : "Error"}</h2>
        <p style={{ color: appTheme.colors.textSecondary }}>{error}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          {isSessionExpired ? (
            <button
              onClick={handleSessionExpired}
              style={{
                padding: "12px 24px",
                backgroundColor: appTheme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600"
              }}
            >
              Go to Login
            </button>
          ) : (
            <>
              <button
                onClick={handleLoginRedirect}
                style={{
                  padding: "12px 24px",
                  backgroundColor: appTheme.colors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600"
                }}
              >
                Go to Login
              </button>
              <button
                onClick={handleRetry}
                style={{
                  padding: "12px 24px",
                  backgroundColor: appTheme.colors.secondary,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600"
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
        padding: "40px", 
        backgroundColor: appTheme.colors.background,
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
            width: "60px", 
            height: "60px", 
            border: `4px solid ${appTheme.colors.border}`,
            borderTop: `4px solid ${appTheme.colors.primary}`,
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 1s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontSize: "1.2rem", marginTop: "15px" }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => n.status !== 'read').length;

  return (
    <div style={{ 
      padding: "30px", 
      backgroundColor: appTheme.colors.background, 
      minHeight: "100vh"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <h1 style={{ 
            color: appTheme.colors.textPrimary, 
            marginBottom: "8px",
            fontSize: "2rem",
            fontWeight: "700"
          }}>
            Dashboard Overview
          </h1>
          <p style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: "1rem"
          }}>
            Welcome to your e-commerce dashboard
            {socketStatus.connected && (
              <span style={{ 
                marginLeft: "10px",
                fontSize: "0.8rem",
                backgroundColor: "#10b98120",
                color: "#10b981",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span>🔗</span>Live Updates
              </span>
            )}
            {!socketStatus.connected && (
              <span style={{ 
                marginLeft: "10px",
                fontSize: "0.8rem",
                backgroundColor: "#ef444420",
                color: "#ef4444",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer"
              }}
              onClick={handleReconnectSocket}
              title="Click to reconnect"
              >
                <span>❌</span>Offline
              </span>
            )}
            {unreadNotifications > 0 && (
              <span style={{ 
                marginLeft: "10px",
                fontSize: "0.8rem",
                backgroundColor: "#f59e0b20",
                color: "#f59e0b",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer"
              }}
              onClick={handleViewAllNotifications}
              title="View notifications"
              >
                <span>🔔</span>{unreadNotifications} new
              </span>
            )}
          </p>
          {user && (
            <div style={{ marginTop: "5px" }}>
              <p style={{ 
                fontSize: "0.9rem", 
                color: appTheme.colors.primary,
                marginBottom: "2px"
              }}>
                Logged in as: {user.email}
              </p>
              <p style={{ 
                fontSize: "0.8rem", 
                color: appTheme.colors.textSecondary,
              }}>
                Role: <span style={{ 
                  backgroundColor: user.role === 'admin' ? `${appTheme.colors.success}20` : `${appTheme.colors.info}20`,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  marginLeft: "5px"
                }}>
                  {user.role}
                </span>
                {notificationPermission === 'granted' && (
                  <span style={{ 
                    marginLeft: "10px",
                    backgroundColor: `${appTheme.colors.success}20`,
                    color: appTheme.colors.success,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <span>🔔</span>Notifications On
                  </span>
                )}
                {notificationPermission === 'default' && (
                  <button
                    onClick={handleRequestNotificationPermission}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: `${appTheme.colors.primary}20`,
                      color: appTheme.colors.primary,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: `1px solid ${appTheme.colors.primary}30`,
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>🔔</span>Enable Notifications
                  </button>
                )}
              </p>
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <label style={{ 
            color: appTheme.colors.textSecondary,
            fontWeight: "500"
          }}>Period: </label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: `1.5px solid ${appTheme.colors.border}`,
              fontFamily: appTheme.fonts.primary,
              backgroundColor: appTheme.colors.surface,
              color: appTheme.colors.textPrimary,
              fontSize: "0.9rem",
              cursor: "pointer",
              minWidth: "120px"
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => fetchDashboardData(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: `${appTheme.colors.primary}15`,
              color: appTheme.colors.primary,
              border: `1px solid ${appTheme.colors.primary}30`,
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            🔄 Refresh Data
          </button>
          {!socketStatus.connected && (
            <button
              onClick={handleReconnectSocket}
              style={{
                padding: "8px 16px",
                backgroundColor: `${appTheme.colors.error}15`,
                color: appTheme.colors.error,
                border: `1px solid ${appTheme.colors.error}30`,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
              title="Reconnect to real-time server"
            >
              🔌 Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px"
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "8px" }}>Total Revenue</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              {timeFilter === 'today' ? 'Today' : 
               timeFilter === 'week' ? 'This Week' : 
               timeFilter === 'month' ? 'This Month' : 'This Year'}
            </div>
          </div>
        </div>
        
        <MetricCard 
          icon="📦" 
          title="Total Orders" 
          value={totalOrders} 
          color={appTheme.colors.info}
          appTheme={appTheme}
        />
        <MetricCard 
          icon="👥" 
          title="Total Users" 
          value={totalCustomers} 
          color={appTheme.colors.success}
          appTheme={appTheme}
        />
        <MetricCard 
          icon="🛍️" 
          title="Total Products" 
          value={totalProducts} 
          color={appTheme.colors.warning}
          appTheme={appTheme}
        />
      </div>

      {/* Charts Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
              Revenue Trend
            </h3>
            {socketStatus.connected && (
              <div style={{
                fontSize: "0.7rem",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "#10b98120",
                color: "#10b981",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
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
          <div style={{ height: "300px" }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
              Order Status
            </h3>
            <button
              onClick={handleRetry}
              style={{
                padding: "4px 12px",
                fontSize: "0.7rem",
                backgroundColor: `${appTheme.colors.primary}15`,
                color: appTheme.colors.primary,
                border: `1px solid ${appTheme.colors.primary}30`,
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Update
            </button>
          </div>
          <div style={{ height: "300px" }}>
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Data Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr 1fr", 
        gap: "20px" 
      }}>
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
          gridColumn: notifications.length > 0 ? "span 2" : "span 3"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
              Recent Orders
            </h3>
            {socketStatus.connected && (
              <div style={{
                fontSize: "0.7rem",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "#3b82f620",
                color: "#3b82f6",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span>📡</span>Real-time
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order._id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                backgroundColor: `${appTheme.colors.background}50`,
                borderRadius: "8px",
                border: `1px solid ${appTheme.colors.border}20`,
                transition: "all 0.2s ease",
                ":hover": {
                  backgroundColor: `${appTheme.colors.background}70`,
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }
              }}>
                <div>
                  <div style={{ fontWeight: "600", color: appTheme.colors.textPrimary, fontSize: "0.9rem" }}>
                    #{order.orderNumber}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: appTheme.colors.textSecondary }}>
                    {order.createdBy} • ₹{order.totalPrice.toLocaleString()}
                  </div>
                </div>
                <StatusBadge status={order.status} appTheme={appTheme} />
              </div>
            )) : (
              <div style={{ 
                textAlign: "center", 
                padding: "20px", 
                color: appTheme.colors.textSecondary 
              }}>
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div style={{
            backgroundColor: appTheme.colors.surface,
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: `1px solid ${appTheme.colors.border}30`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
                Recent Notifications
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleClearNotifications}
                  style={{
                    padding: "4px 12px",
                    fontSize: "0.7rem",
                    backgroundColor: `${appTheme.colors.error}15`,
                    color: appTheme.colors.error,
                    border: `1px solid ${appTheme.colors.error}30`,
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleViewAllNotifications}
                  style={{
                    padding: "4px 12px",
                    fontSize: "0.7rem",
                    backgroundColor: `${appTheme.colors.primary}15`,
                    color: appTheme.colors.primary,
                    border: `1px solid ${appTheme.colors.primary}30`,
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  View All
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  onClick={() => markNotificationAsRead(notification.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "12px",
                    backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}10` : `${appTheme.colors.background}50`,
                    borderRadius: "8px",
                    border: `1px solid ${appTheme.colors.border}20`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    ":hover": {
                      backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}20` : `${appTheme.colors.background}70`,
                      transform: "translateY(-1px)"
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      marginBottom: "4px" 
                    }}>
                      <div style={{
                        fontSize: "1rem"
                      }}>
                        {notification.type === 'NEW_ORDER' && '🛍️'}
                        {notification.type === 'PAYMENT_RECEIVED' && '💰'}
                        {notification.type === 'ORDER_STATUS_CHANGED' && '📦'}
                        {!['NEW_ORDER', 'PAYMENT_RECEIVED', 'ORDER_STATUS_CHANGED'].includes(notification.type) && '📢'}
                      </div>
                      <div style={{ 
                        fontWeight: notification.status !== 'read' ? "700" : "600", 
                        color: appTheme.colors.textPrimary, 
                        fontSize: "0.85rem",
                        opacity: notification.status === 'read' ? 0.8 : 1
                      }}>
                        {notification.title}
                      </div>
                      {notification.status !== 'read' && (
                        <div style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: appTheme.colors.warning,
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                    <div style={{ 
                      fontSize: "0.75rem", 
                      color: appTheme.colors.textSecondary,
                      marginLeft: "24px"
                    }}>
                      {notification.message}
                      {notification.orderNumber && (
                        <div style={{ 
                          marginTop: "4px",
                          fontSize: "0.7rem",
                          color: appTheme.colors.primary
                        }}>
                          Order #{notification.orderNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: "0.65rem", 
                    color: appTheme.colors.textSecondary,
                    whiteSpace: "nowrap",
                    marginLeft: "8px"
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
      <div style={{ marginTop: "20px" }}>
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <h3 style={{ marginBottom: "20px", color: appTheme.colors.textPrimary }}>
            Top Selling Products
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topSellingProducts.length > 0 ? topSellingProducts.map((product, index) => (
              <div key={product.id || index} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                backgroundColor: `${appTheme.colors.background}50`,
                borderRadius: "8px",
                border: `1px solid ${appTheme.colors.border}20`,
                transition: "all 0.2s ease",
                ":hover": {
                  backgroundColor: `${appTheme.colors.background}70`,
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: `linear-gradient(135deg, ${appTheme.colors.primary}20, ${appTheme.colors.secondary}20)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: appTheme.colors.primary
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", color: appTheme.colors.textPrimary, fontSize: "0.9rem" }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
                      {product.quantity} sold
                    </div>
                  </div>
              </div>
                <div style={{ 
                  fontWeight: "600", 
                  color: appTheme.colors.primary,
                  fontSize: "0.9rem"
                }}>
                  ₹{product.revenue.toLocaleString()}
              </div>
              </div>
            )) : (
              <div style={{ 
                textAlign: "center", 
                padding: "20px", 
                color: appTheme.colors.textSecondary 
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
      `}</style>
    </div>
  );
}

const MetricCard = ({ icon, title, value, color, appTheme }) => (
  <div style={{
    backgroundColor: appTheme.colors.surface,
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: `1px solid ${appTheme.colors.border}30`,
    transition: "all 0.2s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)"
    }
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: `${color}20`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        color: color
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.9rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
          {title}
        </div>
        <div style={{ fontSize: "1.8rem", fontWeight: "700", color: appTheme.colors.textPrimary }}>
          {value}
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status, appTheme }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: `${appTheme.colors.success}20`, color: appTheme.colors.success, icon: '✓' };
      case 'shipped':
        return { bg: `${appTheme.colors.info}20`, color: appTheme.colors.info, icon: '🚚' };
      case 'processing':
        return { bg: `${appTheme.colors.warning}20`, color: appTheme.colors.warning, icon: '⏳' };
      default:
        return { bg: `${appTheme.colors.error}20`, color: appTheme.colors.error, icon: '❌' };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <div style={{
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "0.7rem",
      fontWeight: "600",
      backgroundColor: config.bg,
      color: config.color,
      display: "flex",
      alignItems: "center",
      gap: "4px"
    }}>
      <span>{config.icon}</span>
      <span>{status}</span>
    </div>
  );
};














// "use client";
// import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import { useAuth } from '../../../context/authContext';
// import { appTheme } from "../../../src/constants/theme";
// import { getSocketIOClient } from '../../../lib/websocket/socketio-client'; 
// // ✅ ADD THESE CRITICAL IMPORTS:
// import FCMTokenManager from '@/src/components/FCMTokenManager';
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
//   const { user, loading: authLoading, isAuthenticated } = useAuth();
//   // ✅ ADD NOTIFICATION HOOK:
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
//   const [fcmInitialized, setFcmInitialized] = useState(false);
  
//   const dataFetchedRef = useRef(false);
//   const fetchInProgressRef = useRef(false);
//   const isMountedRef = useRef(true);
//   const socketClientRef = useRef(null);
//   const lastFetchTimeRef = useRef(0);
//   const fetchDebounceRef = useRef(null);
//   const notificationPermissionRequestedRef = useRef(false);

//   const getToken = useCallback(() => {
//     if (typeof window === 'undefined') return null;
//     return localStorage.getItem('token');
//   }, []);

//   // ==================== NOTIFICATION PERMISSION ====================
//   useEffect(() => {
//     if (typeof window !== 'undefined' && 'Notification' in window) {
//       if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
//         notificationPermissionRequestedRef.current = true;
//         // We'll request permission later with better user context
//       }
//       setNotificationPermission(Notification.permission);
//     }
//   }, []);

//   // ==================== NOTIFICATION INTEGRATION ====================
//   const fetchNotifications = useCallback(async () => {
//     if (!isAuthenticated || !user || user.role !== 'admin') return;
    
//     const token = getToken();
//     if (!token) return;
    
//     try {
//       const response = await fetch('/api/notifications?limit=10&page=1', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success && data.notifications) {
//           setNotifications(data.notifications.slice(0, 5)); // Show only 5 most recent
//         }
//       }
//     } catch (error) {
//       console.warn('Failed to fetch notifications:', error);
//     }
//   }, [isAuthenticated, user, getToken]);

//   const markNotificationAsRead = useCallback(async (notificationId) => {
//     const token = getToken();
//     if (!token) return;
    
//     try {
//       await fetch(`/api/notifications?id=${notificationId}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ markAsRead: true })
//       });
      
//       // Update local state
//       setNotifications(prev => 
//         prev.map(n => 
//           n.id === notificationId ? { ...n, status: 'read' } : n
//         )
//       );
//     } catch (error) {
//       console.warn('Failed to mark notification as read:', error);
//     }
//   }, [getToken]);

//   // ==================== SOCKET.IO INTEGRATION - CORRECTED ====================
//   const initializeSocketIO = useCallback(() => {
//     if (!user || user.role !== 'admin') return;
    
//     console.log('🔗 Initializing Socket.IO connection for dashboard...');
    
//     try {
//       // Initialize Socket.IO client
//       const socketClient = getSocketIOClient();
//       socketClientRef.current = socketClient;
      
//       // Set up connection listeners
//       socketClient.addConnectionListener((connected) => {
//         console.log(`🔌 Socket.IO ${connected ? 'connected' : 'disconnected'}`);
//         setSocketStatus(prev => ({
//           ...prev,
//           connected,
//           status: connected ? 'connected' : 'disconnected'
//         }));
//       });
      
//       // Set up state listeners
//       socketClient.addStateListener((state) => {
//         console.log(`🔄 Socket.IO state changed: ${state}`);
//         setSocketStatus(prev => ({
//           ...prev,
//           status: state,
//           connected: state === 'connected'
//         }));
//       });
      
//       // ✅ FIXED: Handle authentication events
//       const handleAuthenticated = (data) => {
//         console.log('✅ Socket.IO authenticated:', data.user?.name || user.email);
//         setSocketStatus(prev => ({
//           ...prev,
//           authenticated: true,
//           error: null
//         }));
        
//         // Show notification
//         showNotification(
//           'Real-time Connection Established',
//           'You will receive live order notifications',
//           'success',
//           3000
//         );
//       };
      
//       const handleUnauthorized = (data) => {
//         console.error('❌ Socket.IO authentication failed:', data.message);
//         setSocketStatus(prev => ({
//           ...prev,
//           authenticated: false,
//           error: data.message || 'Authentication failed'
//         }));
        
//         showNotification(
//           'Connection Authentication Failed',
//           'Please refresh the page or check your permissions',
//           'error',
//           5000
//         );
//       };
      
//       // Handle new orders from Socket.IO
//       const handleNewOrder = async (data) => {
//         console.log('🛍️ Real-time order received via Socket.IO:', data.order || data);
        
//         const orderData = data.order || data;
        
//         // Show notification using our notification hook
//         showNotification(
//           '🛍️ New Order Received!',
//           `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber} for ₹${orderData.totalPrice || 0}`,
//           'info',
//           5000
//         );
        
//         // Also show browser notification if permission granted
//         if (window.Notification && notificationPermission === 'granted') {
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
        
//         // Add to notifications list
//         const newNotification = {
//           id: `temp-${Date.now()}`,
//           type: 'NEW_ORDER',
//           title: '🛍️ New Order!',
//           message: `${orderData.customerName || 'Customer'} placed order #${orderData.orderNumber}`,
//           orderNumber: orderData.orderNumber,
//           customerName: orderData.customerName,
//           totalAmount: orderData.totalPrice || 0,
//           status: 'delivered',
//           priority: 'high',
//           createdAt: new Date().toISOString(),
//           timeSince: 'Just now',
//           source: 'socketio'
//         };
        
//         setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        
//         // Refresh dashboard data with debounce
//         if (isMountedRef.current && !fetchInProgressRef.current) {
//           clearTimeout(fetchDebounceRef.current);
//           fetchDebounceRef.current = setTimeout(() => {
//             fetchDashboardData();
//           }, 2000); // Debounce to avoid rapid refreshes
//         }
//       };

//       // Handle payment updates
//       const handlePaymentUpdate = (data) => {
//         console.log('💰 Payment update via Socket.IO:', data);
        
//         showNotification(
//           '💰 Payment Updated',
//           `Order #${data.orderNumber} payment is now ${data.newStatus || 'updated'}`,
//           'success',
//           4000
//         );
        
//         // Debounced refresh
//         if (isMountedRef.current && !fetchInProgressRef.current) {
//           clearTimeout(fetchDebounceRef.current);
//           fetchDebounceRef.current = setTimeout(() => {
//             fetchDashboardData();
//           }, 2000);
//         }
//       };

//       // Handle order status updates
//       const handleOrderStatusUpdate = (data) => {
//         console.log('📦 Order status update via Socket.IO:', data);
        
//         showNotification(
//           '📦 Order Status Updated',
//           `Order #${data.orderNumber} is now ${data.newStatus}`,
//           'info',
//           4000
//         );
        
//         // Debounced refresh
//         if (isMountedRef.current && !fetchInProgressRef.current) {
//           clearTimeout(fetchDebounceRef.current);
//           fetchDebounceRef.current = setTimeout(() => {
//             fetchDashboardData();
//           }, 2000);
//         }
//       };

//       // Handle dashboard updates
//       const handleDashboardUpdate = (data) => {
//         console.log('📊 Dashboard update via Socket.IO:', data);
        
//         if (data.type === 'order-created') {
//           // Already handled by NEW_ORDER, but we can still refresh
//           fetchDashboardData();
//         }
//       };
      
//       // Handle FCM token registration confirmation
//       const handleFCMTokenRegistered = (data) => {
//         console.log('✅ FCM token registered with server:', data);
//         showNotification(
//           'Push Notifications Enabled',
//           'You will receive notifications on your device',
//           'success',
//           3000
//         );
//       };

//       // Register Socket.IO handlers
//       socketClient.on('authenticated', handleAuthenticated);
//       socketClient.on('unauthorized', handleUnauthorized);
//       socketClient.on('NEW_ORDER', handleNewOrder);
//       socketClient.on('PAYMENT_RECEIVED', handlePaymentUpdate);
//       socketClient.on('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
//       socketClient.on('DASHBOARD_UPDATE', handleDashboardUpdate);
//       socketClient.on('FCM_TOKEN_REGISTERED', handleFCMTokenRegistered);
      
//       // Connect Socket.IO
//       console.log('🔌 Connecting Socket.IO with user:', {
//         id: user._id || user.id,
//         email: user.email,
//         role: user.role
//       });
//       socketClient.connect(user);
      
//       // Check connection status after 3 seconds
//       setTimeout(() => {
//         const status = socketClient.getStatus();
//         console.log('📊 Initial Socket.IO status:', status);
//         setSocketStatus({
//           connected: status.isConnected,
//           authenticated: status.isAuthenticated,
//           status: status.state,
//           error: null
//         });
//       }, 3000);
      
//       return () => {
//         // Clean up Socket.IO handlers
//         socketClient.off('authenticated', handleAuthenticated);
//         socketClient.off('unauthorized', handleUnauthorized);
//         socketClient.off('NEW_ORDER', handleNewOrder);
//         socketClient.off('PAYMENT_RECEIVED', handlePaymentUpdate);
//         socketClient.off('ORDER_STATUS_CHANGED', handleOrderStatusUpdate);
//         socketClient.off('DASHBOARD_UPDATE', handleDashboardUpdate);
//         socketClient.off('FCM_TOKEN_REGISTERED', handleFCMTokenRegistered);
//       };
      
//     } catch (error) {
//       console.error('❌ Failed to initialize Socket.IO:', error);
//       setSocketStatus(prev => ({
//         ...prev,
//         error: error.message,
//         connected: false,
//         status: 'error'
//       }));
      
//       showNotification(
//         'WebSocket Connection Failed',
//         'Real-time updates are unavailable. Please refresh the page.',
//         'error',
//         5000
//       );
//     }
//   }, [user, notificationPermission, showNotification]);

//   // ==================== FCM TOKEN MANAGER CALLBACK ====================
//   const handleFCMInitialized = useCallback((result) => {
//     console.log('📱 FCM Token Manager initialized:', result);
//     setFcmInitialized(true);
    
//     if (result.success) {
//       // ✅ Connect Socket.IO after FCM is ready
//       if (user && user.role === 'admin') {
//         setTimeout(() => {
//           initializeSocketIO();
//         }, 1000);
//       }
//     }
//   }, [user, initializeSocketIO]);

//   // ==================== DATA FETCHING ====================
//   const fetchDashboardData = useCallback(async (force = false) => {
//     // Prevent multiple simultaneous fetches
//     if (fetchInProgressRef.current) return;
    
//     // Implement caching - don't fetch if last fetch was less than 30 seconds ago (unless forced)
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
      
//       const token = getToken();
//       if (!token) {
//         console.error('No token found');
//         if (isMountedRef.current) {
//           setError("Authentication token not found. Please login again.");
//           setLoading(false);
//         }
//         return;
//       }
      
//       const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       };
      
//       const fetchWithTimeout = (url, options, timeout = 10000) => {
//         return Promise.race([
//           fetch(url, options),
//           new Promise((_, reject) =>
//             setTimeout(() => reject(new Error('Request timeout')), timeout)
//           )
//         ]);
//       };
      
//       const fetchPromises = [
//         fetchWithTimeout("/api/orders", { 
//           headers,
//           credentials: 'include'
//         }, 8000).then(async res => {
//           if (!res.ok) {
//             if (res.status === 401) {
//               throw new Error("Session expired. Please login again.");
//             }
//             const errorText = await res.text();
//             console.warn(`Orders API failed: ${res.status}`, errorText);
//             throw new Error(`Failed to load orders: ${res.status}`);
//           }
//           const data = await res.json();
//           return data.success ? (data.data || []) : [];
//         }),
        
//         fetchWithTimeout("/api/products", { 
//           headers,
//           credentials: 'include'
//         }, 8000).then(async res => {
//           if (!res.ok) {
//             const errorText = await res.text();
//             console.warn(`Products API failed: ${res.status}`, errorText);
//             throw new Error(`Failed to load products: ${res.status}`);
//           }
//           const data = await res.json();
//           return data.success ? (data.data || []) : [];
//         }),
        
//         fetchWithTimeout("/api/users", { 
//           headers,
//           credentials: 'include'
//         }, 8000).then(async res => {
//           if (!res.ok) {
//             if (res.status === 403) {
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
//           return usersArray.filter(u => u && typeof u === 'object');
//         })
//       ];
      
//       const [ordersData, productsData, usersData] = await Promise.allSettled(fetchPromises);
      
//       if (isMountedRef.current) {
//         const ordersResult = ordersData.status === 'fulfilled' ? ordersData.value : [];
//         const productsResult = productsData.status === 'fulfilled' ? productsData.value : [];
//         const usersResult = usersData.status === 'fulfilled' ? usersData.value : [];
        
//         setOrders(ordersResult);
//         setProducts(productsResult);
//         setCustomers(usersResult.length > 0 ? usersResult : []);
        
//         dataFetchedRef.current = true;
        
//         // Also fetch notifications
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
//   }, [isAuthenticated, user, getToken, fetchNotifications]);

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
      
//       const token = getToken();
      
//       if (!dataFetchedRef.current && !fetchInProgressRef.current && token) {
//         await fetchDashboardData();
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
//   }, [authLoading, isAuthenticated, user, getToken, fetchDashboardData]);

//   // ==================== SOCKET.IO EFFECT ====================
//   useEffect(() => {
//     // Only initialize Socket.IO if user is admin and FCM is ready
//     if (user && user.role === 'admin' && fcmInitialized) {
//       initializeSocketIO();
//     }
    
//     return () => {
//       // Cleanup Socket.IO on unmount
//       if (socketClientRef.current) {
//         socketClientRef.current.disconnect('Component unmounting');
//       }
//     };
//   }, [user, fcmInitialized, initializeSocketIO]);

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
//     const currentMonth = new Date().getMonth();
    
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
//   }, [orders, appTheme.colors.primary]);

//   const ordersChartData = useMemo(() => {
//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
//     const data = Array(12).fill(0);
    
//     orders.forEach(order => {
//       if (order && order.createdAt) {
//         const orderDate = new Date(order.createdAt);
//         const monthIndex = orderDate.getMonth();
//         data[monthIndex] += 1;
//       }
//     });
    
//     return {
//       labels: months,
//       datasets: [
//         {
//           label: "Orders",
//           data: data,
//           backgroundColor: appTheme.colors.secondary,
//           borderRadius: 8,
//         },
//       ],
//     };
//   }, [orders, appTheme.colors.secondary]);

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
//   }), [orderStatusMetrics, appTheme.colors.surface]);

//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { 
//         position: 'top',
//         labels: {
//           usePointStyle: true,
//           padding: 15,
//         }
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: `${appTheme.colors.border}40`,
//         }
//       },
//       x: {
//         grid: {
//           color: `${appTheme.colors.border}40`,
//         }
//       },
//     },
//   }), [appTheme.colors.border]);

//   const doughnutOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           usePointStyle: true,
//           padding: 15,
//         }
//       },
//     },
//     cutout: '65%',
//   }), []);

//   // ==================== EVENT HANDLERS ====================
//   const handleRetry = useCallback(() => {
//     setError(null);
//     dataFetchedRef.current = false;
//     fetchInProgressRef.current = false;
//     fetchDashboardData(true); // Force refresh
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

//   // ==================== AUTO REFRESH ====================
//   useEffect(() => {
//     // Only refresh every 60 seconds if connected
//     const intervalId = setInterval(() => {
//       if (socketStatus.connected && !fetchInProgressRef.current && isMountedRef.current) {
//         fetchDashboardData();
//       }
//     }, 60000); // 60 seconds
    
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

//   // ==================== RENDER LOGIC ====================
//   if (error) {
//     const isSessionExpired = error.includes("session has expired") || error.includes("Session expired");
    
//     return (
//       <div style={{ 
//         padding: "40px", 
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         flexDirection: "column",
//         gap: "20px"
//       }}>
//         <div style={{ fontSize: "3rem" }}>{isSessionExpired ? "⏰" : "⚠️"}</div>
//         <h2 style={{ color: appTheme.colors.error }}>{isSessionExpired ? "Session Expired" : "Error"}</h2>
//         <p style={{ color: appTheme.colors.textSecondary }}>{error}</p>
//         <div style={{ display: "flex", gap: "10px" }}>
//           {isSessionExpired ? (
//             <button
//               onClick={handleSessionExpired}
//               style={{
//                 padding: "12px 24px",
//                 backgroundColor: appTheme.colors.primary,
//                 color: "white",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "16px",
//                 fontWeight: "600"
//               }}
//             >
//               Go to Login
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={handleLoginRedirect}
//                 style={{
//                   padding: "12px 24px",
//                   backgroundColor: appTheme.colors.primary,
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: "16px",
//                   fontWeight: "600"
//                 }}
//               >
//                 Go to Login
//               </button>
//               <button
//                 onClick={handleRetry}
//                 style={{
//                   padding: "12px 24px",
//                   backgroundColor: appTheme.colors.secondary,
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: "16px",
//                   fontWeight: "600"
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
//         padding: "40px", 
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
//             width: "60px", 
//             height: "60px", 
//             border: `4px solid ${appTheme.colors.border}`,
//             borderTop: `4px solid ${appTheme.colors.primary}`,
//             borderRadius: "50%",
//             margin: "0 auto 20px",
//             animation: "spin 1s linear infinite"
//           }} />
//           <style>{`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}</style>
//           <p style={{ fontSize: "1.2rem", marginTop: "15px" }}>Loading Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   const unreadNotifications = notifications.filter(n => n.status !== 'read').length;

//   return (
//     <>
//       {/* ✅ ADD FCM TOKEN MANAGER (Hidden but functional) */}
//       <FCMTokenManager onInitialized={handleFCMInitialized} />
      
//       <div style={{ 
//         padding: "30px", 
//         backgroundColor: appTheme.colors.background, 
//         minHeight: "100vh"
//       }}>
//         <div style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           marginBottom: "30px",
//           flexWrap: "wrap",
//           gap: "20px"
//         }}>
//           <div>
//             <h1 style={{ 
//               color: appTheme.colors.textPrimary, 
//               marginBottom: "8px",
//               fontSize: "2rem",
//               fontWeight: "700"
//             }}>
//               Dashboard Overview
//             </h1>
//             <p style={{ 
//               color: appTheme.colors.textSecondary,
//               fontSize: "1rem"
//             }}>
//               Welcome to your e-commerce dashboard
//               {socketStatus.connected && (
//                 <span style={{ 
//                   marginLeft: "10px",
//                   fontSize: "0.8rem",
//                   backgroundColor: "#10b98120",
//                   color: "#10b981",
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "4px"
//                 }}>
//                   <span>🔗</span>Live Updates
//                 </span>
//               )}
//               {!socketStatus.connected && (
//                 <span style={{ 
//                   marginLeft: "10px",
//                   fontSize: "0.8rem",
//                   backgroundColor: "#ef444420",
//                   color: "#ef4444",
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "4px",
//                   cursor: "pointer"
//                 }}
//                 onClick={handleReconnectSocket}
//                 title="Click to reconnect"
//                 >
//                   <span>❌</span>Offline
//                 </span>
//               )}
//               {unreadNotifications > 0 && (
//                 <span style={{ 
//                   marginLeft: "10px",
//                   fontSize: "0.8rem",
//                   backgroundColor: "#f59e0b20",
//                   color: "#f59e0b",
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "4px",
//                   cursor: "pointer"
//                 }}
//                 onClick={handleViewAllNotifications}
//                 title="View notifications"
//                 >
//                   <span>🔔</span>{unreadNotifications} new
//                 </span>
//               )}
//             </p>
//             {user && (
//               <div style={{ marginTop: "5px" }}>
//                 <p style={{ 
//                   fontSize: "0.9rem", 
//                   color: appTheme.colors.primary,
//                   marginBottom: "2px"
//                 }}>
//                   Logged in as: {user.email}
//                 </p>
//                 <p style={{ 
//                   fontSize: "0.8rem", 
//                   color: appTheme.colors.textSecondary,
//                 }}>
//                   Role: <span style={{ 
//                     backgroundColor: user.role === 'admin' ? `${appTheme.colors.success}20` : `${appTheme.colors.info}20`,
//                     padding: "2px 6px",
//                     borderRadius: "4px",
//                     marginLeft: "5px"
//                   }}>
//                     {user.role}
//                   </span>
//                   {notificationPermission === 'granted' && (
//                     <span style={{ 
//                       marginLeft: "10px",
//                       backgroundColor: `${appTheme.colors.success}20`,
//                       color: appTheme.colors.success,
//                       padding: "2px 6px",
//                       borderRadius: "4px",
//                       display: "inline-flex",
//                       alignItems: "center",
//                       gap: "4px"
//                     }}>
//                       <span>🔔</span>Notifications On
//                     </span>
//                   )}
//                   {notificationPermission === 'default' && (
//                     <button
//                       onClick={handleRequestNotificationPermission}
//                       style={{
//                         marginLeft: "10px",
//                         backgroundColor: `${appTheme.colors.primary}20`,
//                         color: appTheme.colors.primary,
//                         padding: "2px 6px",
//                         borderRadius: "4px",
//                         border: `1px solid ${appTheme.colors.primary}30`,
//                         cursor: "pointer",
//                         fontSize: "0.7rem",
//                         display: "inline-flex",
//                         alignItems: "center",
//                         gap: "4px"
//                       }}
//                     >
//                       <span>🔔</span>Enable Notifications
//                     </button>
//                   )}
//                 </p>
//               </div>
//             )}
//           </div>

//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "12px",
//             flexWrap: "wrap"
//           }}>
//             <label style={{ 
//               color: appTheme.colors.textSecondary,
//               fontWeight: "500"
//             }}>Period: </label>
//             <select
//               value={timeFilter}
//               onChange={(e) => setTimeFilter(e.target.value)}
//               style={{
//                 padding: "10px 16px",
//                 borderRadius: "10px",
//                 border: `1.5px solid ${appTheme.colors.border}`,
//                 fontFamily: appTheme.fonts.primary,
//                 backgroundColor: appTheme.colors.surface,
//                 color: appTheme.colors.textPrimary,
//                 fontSize: "0.9rem",
//                 cursor: "pointer",
//                 minWidth: "120px"
//               }}
//             >
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//               <option value="year">This Year</option>
//             </select>
//             <button
//               onClick={() => fetchDashboardData(true)}
//               style={{
//                 padding: "8px 16px",
//                 backgroundColor: `${appTheme.colors.primary}15`,
//                 color: appTheme.colors.primary,
//                 border: `1px solid ${appTheme.colors.primary}30`,
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "0.9rem",
//                 fontWeight: "500",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "5px"
//               }}
//             >
//               🔄 Refresh Data
//             </button>
//             {!socketStatus.connected && (
//               <button
//                 onClick={handleReconnectSocket}
//                 style={{
//                   padding: "8px 16px",
//                   backgroundColor: `${appTheme.colors.error}15`,
//                   color: appTheme.colors.error,
//                   border: `1px solid ${appTheme.colors.error}30`,
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: "0.9rem",
//                   fontWeight: "500",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "5px"
//                 }}
//                 title="Reconnect to real-time server"
//               >
//                 🔌 Reconnect
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Quick Stats Row */}
//         <div style={{ 
//           display: "grid", 
//           gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
//           gap: "20px", 
//           marginBottom: "30px"
//         }}>
//           <div style={{
//             background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
//             padding: "25px",
//             borderRadius: "16px",
//             boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
//             color: "white",
//             position: "relative",
//             overflow: "hidden"
//           }}>
//             <div style={{ position: "relative", zIndex: 2 }}>
//               <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "8px" }}>Total Revenue</div>
//               <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>
//                 ₹{totalRevenue.toLocaleString()}
//               </div>
//               <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
//                 {timeFilter === 'today' ? 'Today' : 
//                  timeFilter === 'week' ? 'This Week' : 
//                  timeFilter === 'month' ? 'This Month' : 'This Year'}
//               </div>
//             </div>
//           </div>
          
//           <MetricCard 
//             icon="📦" 
//             title="Total Orders" 
//             value={totalOrders} 
//             color={appTheme.colors.info}
//             appTheme={appTheme}
//           />
//           <MetricCard 
//             icon="👥" 
//             title="Total Users" 
//             value={totalCustomers} 
//             color={appTheme.colors.success}
//             appTheme={appTheme}
//           />
//           <MetricCard 
//             icon="🛍️" 
//             title="Total Products" 
//             value={totalProducts} 
//             color={appTheme.colors.warning}
//             appTheme={appTheme}
//           />
//         </div>

//         {/* Charts Row */}
//         <div style={{ 
//           display: "grid", 
//           gridTemplateColumns: "2fr 1fr", 
//           gap: "20px", 
//           marginBottom: "30px" 
//         }}>
//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: "25px",
//             borderRadius: "16px",
//             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
//             border: `1px solid ${appTheme.colors.border}30`,
//           }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//               <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
//                 Revenue Trend
//               </h3>
//               {socketStatus.connected && (
//                 <div style={{
//                   fontSize: "0.7rem",
//                   padding: "2px 8px",
//                   borderRadius: "12px",
//                   backgroundColor: "#10b98120",
//                   color: "#10b981",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "4px"
//                 }}>
//                   <div style={{
//                     width: "6px",
//                     height: "6px",
//                     borderRadius: "50%",
//                     backgroundColor: "#10b981",
//                     animation: "pulse 1.5s infinite"
//                   }}></div>
//                   Live
//                 </div>
//               )}
//             </div>
//             <div style={{ height: "300px" }}>
//               <Line data={revenueChartData} options={chartOptions} />
//             </div>
//           </div>

//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: "25px",
//             borderRadius: "16px",
//             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
//             border: `1px solid ${appTheme.colors.border}30`,
//           }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//               <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
//                 Order Status
//               </h3>
//               <button
//                 onClick={handleRetry}
//                 style={{
//                   padding: "4px 12px",
//                   fontSize: "0.7rem",
//                   backgroundColor: `${appTheme.colors.primary}15`,
//                   color: appTheme.colors.primary,
//                   border: `1px solid ${appTheme.colors.primary}30`,
//                   borderRadius: "6px",
//                   cursor: "pointer"
//                 }}
//               >
//                 Update
//               </button>
//             </div>
//             <div style={{ height: "300px" }}>
//               <Doughnut data={orderStatusData} options={doughnutOptions} />
//             </div>
//           </div>
//         </div>

//         {/* Recent Data Row */}
//         <div style={{ 
//           display: "grid", 
//           gridTemplateColumns: "1fr 1fr 1fr", 
//           gap: "20px" 
//         }}>
//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: "25px",
//             borderRadius: "16px",
//             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
//             border: `1px solid ${appTheme.colors.border}30`,
//             gridColumn: notifications.length > 0 ? "span 2" : "span 3"
//           }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//               <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
//                 Recent Orders
//               </h3>
//               {socketStatus.connected && (
//                 <div style={{
//                   fontSize: "0.7rem",
//                   padding: "2px 8px",
//                   borderRadius: "12px",
//                   backgroundColor: "#3b82f620",
//                   color: "#3b82f6",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "4px"
//                 }}>
//                   <span>📡</span>Real-time
//                 </div>
//               )}
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//               {recentOrders.length > 0 ? recentOrders.map((order) => (
//                 <div key={order._id} style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   padding: "12px",
//                   backgroundColor: `${appTheme.colors.background}50`,
//                   borderRadius: "8px",
//                   border: `1px solid ${appTheme.colors.border}20`,
//                   transition: "all 0.2s ease",
//                   ":hover": {
//                     backgroundColor: `${appTheme.colors.background}70`,
//                     transform: "translateY(-1px)",
//                     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
//                   }
//                 }}>
//                   <div>
//                     <div style={{ fontWeight: "600", color: appTheme.colors.textPrimary, fontSize: "0.9rem" }}>
//                       #{order.orderNumber}
//                     </div>
//                     <div style={{ fontSize: "0.8rem", color: appTheme.colors.textSecondary }}>
//                       {order.createdBy} • ₹{order.totalPrice.toLocaleString()}
//                     </div>
//                   </div>
//                   <StatusBadge status={order.status} appTheme={appTheme} />
//                 </div>
//               )) : (
//                 <div style={{ 
//                   textAlign: "center", 
//                   padding: "20px", 
//                   color: appTheme.colors.textSecondary 
//                 }}>
//                   No recent orders
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Notifications Panel (only shown if there are notifications) */}
//           {notifications.length > 0 && (
//             <div style={{
//               backgroundColor: appTheme.colors.surface,
//               padding: "25px",
//               borderRadius: "16px",
//               boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
//               border: `1px solid ${appTheme.colors.border}30`,
//             }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//                 <h3 style={{ color: appTheme.colors.textPrimary, margin: 0 }}>
//                   Recent Notifications
//                 </h3>
//                 <div style={{ display: "flex", gap: "8px" }}>
//                   <button
//                     onClick={handleClearNotifications}
//                     style={{
//                       padding: "4px 12px",
//                       fontSize: "0.7rem",
//                       backgroundColor: `${appTheme.colors.error}15`,
//                       color: appTheme.colors.error,
//                       border: `1px solid ${appTheme.colors.error}30`,
//                       borderRadius: "6px",
//                       cursor: "pointer"
//                     }}
//                   >
//                     Clear
//                   </button>
//                   <button
//                     onClick={handleViewAllNotifications}
//                     style={{
//                       padding: "4px 12px",
//                       fontSize: "0.7rem",
//                       backgroundColor: `${appTheme.colors.primary}15`,
//                       color: appTheme.colors.primary,
//                       border: `1px solid ${appTheme.colors.primary}30`,
//                       borderRadius: "6px",
//                       cursor: "pointer"
//                     }}
//                   >
//                     View All
//                   </button>
//                 </div>
//               </div>
//               <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//                 {notifications.map((notification) => (
//                   <div 
//                     key={notification.id} 
//                     onClick={() => markNotificationAsRead(notification.id)}
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "flex-start",
//                       padding: "12px",
//                       backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}10` : `${appTheme.colors.background}50`,
//                       borderRadius: "8px",
//                       border: `1px solid ${appTheme.colors.border}20`,
//                       cursor: "pointer",
//                       transition: "all 0.2s ease",
//                       ":hover": {
//                         backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}20` : `${appTheme.colors.background}70`,
//                         transform: "translateY(-1px)"
//                       }
//                     }}
//                   >
//                     <div style={{ flex: 1 }}>
//                       <div style={{ 
//                         display: "flex", 
//                         alignItems: "center", 
//                         gap: "8px",
//                         marginBottom: "4px" 
//                       }}>
//                         <div style={{
//                           fontSize: "1rem"
//                         }}>
//                           {notification.type === 'NEW_ORDER' && '🛍️'}
//                           {notification.type === 'PAYMENT_RECEIVED' && '💰'}
//                           {notification.type === 'ORDER_STATUS_CHANGED' && '📦'}
//                           {!['NEW_ORDER', 'PAYMENT_RECEIVED', 'ORDER_STATUS_CHANGED'].includes(notification.type) && '📢'}
//                         </div>
//                         <div style={{ 
//                           fontWeight: notification.status !== 'read' ? "700" : "600", 
//                           color: appTheme.colors.textPrimary, 
//                           fontSize: "0.85rem",
//                           opacity: notification.status === 'read' ? 0.8 : 1
//                         }}>
//                           {notification.title}
//                         </div>
//                         {notification.status !== 'read' && (
//                           <div style={{
//                             width: "8px",
//                             height: "8px",
//                             borderRadius: "50%",
//                             backgroundColor: appTheme.colors.warning,
//                             flexShrink: 0
//                           }} />
//                         )}
//                       </div>
//                       <div style={{ 
//                         fontSize: "0.75rem", 
//                         color: appTheme.colors.textSecondary,
//                         marginLeft: "24px"
//                       }}>
//                         {notification.message}
//                         {notification.orderNumber && (
//                           <div style={{ 
//                             marginTop: "4px",
//                             fontSize: "0.7rem",
//                             color: appTheme.colors.primary
//                           }}>
//                             Order #{notification.orderNumber}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     <div style={{ 
//                       fontSize: "0.65rem", 
//                       color: appTheme.colors.textSecondary,
//                       whiteSpace: "nowrap",
//                       marginLeft: "8px"
//                     }}>
//                       {notification.timeSince || 'Just now'}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Top Selling Products */}
//         <div style={{ marginTop: "20px" }}>
//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: "25px",
//             borderRadius: "16px",
//             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
//             border: `1px solid ${appTheme.colors.border}30`,
//           }}>
//             <h3 style={{ marginBottom: "20px", color: appTheme.colors.textPrimary }}>
//               Top Selling Products
//             </h3>
//             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//               {topSellingProducts.length > 0 ? topSellingProducts.map((product, index) => (
//                 <div key={product.id || index} style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   padding: "12px",
//                   backgroundColor: `${appTheme.colors.background}50`,
//                   borderRadius: "8px",
//                   border: `1px solid ${appTheme.colors.border}20`,
//                   transition: "all 0.2s ease",
//                   ":hover": {
//                     backgroundColor: `${appTheme.colors.background}70`,
//                     transform: "translateY(-1px)",
//                     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
//                   }
//                 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                     <div style={{
//                       width: "32px",
//                       height: "32px",
//                       borderRadius: "6px",
//                       background: `linear-gradient(135deg, ${appTheme.colors.primary}20, ${appTheme.colors.secondary}20)`,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontSize: "0.8rem",
//                       fontWeight: "600",
//                       color: appTheme.colors.primary
//                     }}>
//                       {index + 1}
//                     </div>
//                     <div>
//                       <div style={{ fontWeight: "600", color: appTheme.colors.textPrimary, fontSize: "0.9rem" }}>
//                         {product.name}
//                       </div>
//                       <div style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
//                         {product.quantity} sold
//                       </div>
//                     </div>
//                 </div>
//                   <div style={{ 
//                     fontWeight: "600", 
//                     color: appTheme.colors.primary,
//                     fontSize: "0.9rem"
//                   }}>
//                     ₹{product.revenue.toLocaleString()}
//                 </div>
//                 </div>
//               )) : (
//                 <div style={{ 
//                   textAlign: "center", 
//                   padding: "20px", 
//                   color: appTheme.colors.textSecondary 
//                 }}>
//                   No sales data
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <style jsx global>{`
//           @keyframes pulse {
//             0%, 100% { opacity: 1; }
//             50% { opacity: 0.5; }
//           }
//         `}</style>
//       </div>
//     </>
//   );
// }

// const MetricCard = ({ icon, title, value, color, appTheme }) => (
//   <div style={{
//     backgroundColor: appTheme.colors.surface,
//     padding: "25px",
//     borderRadius: "16px",
//     boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
//     border: `1px solid ${appTheme.colors.border}30`,
//     transition: "all 0.2s ease",
//     ":hover": {
//       transform: "translateY(-2px)",
//       boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)"
//     }
//   }}>
//     <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//       <div style={{
//         width: "48px",
//         height: "48px",
//         borderRadius: "12px",
//         background: `${color}20`,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize: "1.5rem",
//         color: color
//       }}>
//         {icon}
//       </div>
//       <div>
//         <div style={{ fontSize: "0.9rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
//           {title}
//         </div>
//         <div style={{ fontSize: "1.8rem", fontWeight: "700", color: appTheme.colors.textPrimary }}>
//           {value}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const StatusBadge = ({ status, appTheme }) => {
//   const getStatusConfig = (status) => {
//     switch (status) {
//       case 'delivered':
//         return { bg: `${appTheme.colors.success}20`, color: appTheme.colors.success, icon: '✓' };
//       case 'shipped':
//         return { bg: `${appTheme.colors.info}20`, color: appTheme.colors.info, icon: '🚚' };
//       case 'processing':
//         return { bg: `${appTheme.colors.warning}20`, color: appTheme.colors.warning, icon: '⏳' };
//       default:
//         return { bg: `${appTheme.colors.error}20`, color: appTheme.colors.error, icon: '❌' };
//     }
//   };
  
//   const config = getStatusConfig(status);
  
//   return (
//     <div style={{
//       padding: "4px 12px",
//       borderRadius: "20px",
//       fontSize: "0.7rem",
//       fontWeight: "600",
//       backgroundColor: config.bg,
//       color: config.color,
//       display: "flex",
//       alignItems: "center",
//       gap: "4px"
//     }}>
//       <span>{config.icon}</span>
//       <span>{status}</span>
//     </div>
//   );
// };