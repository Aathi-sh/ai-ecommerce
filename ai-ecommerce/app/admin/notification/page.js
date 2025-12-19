"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  ShoppingCart, 
  CreditCard, 
  Package, 
  Truck,
  Check,
  X,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  Clock,
  User,
  BellRing,
  BellOff
} from "lucide-react";
import { appTheme } from "../../../src/constants/theme";
import { useAuth } from "../../../context/authContext";
import { useNotification } from '../../../hooks/useNotification';
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const { user, getToken } = useAuth();
  const { showNotification } = useNotification();
  
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    highPriority: 0
  });
  
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);
  const pollIntervalRef = useRef(null);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingCart color={appTheme.colors.success} size={20} />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_VERIFIED':
        return <CreditCard color={appTheme.colors.info} size={20} />;
      case 'ORDER_STATUS_CHANGED':
        return <Truck color={appTheme.colors.warning} size={20} />;
      case 'LOW_STOCK_ALERT':
        return <AlertCircle color={appTheme.colors.error} size={20} />;
      case 'SYSTEM_ALERT':
      case 'ADMIN_ALERT':
        return <BellRing color={appTheme.colors.primary} size={20} />;
      default:
        return <Bell color={appTheme.colors.textSecondary} size={20} />;
    }
  };

  // Get notification color based on type/priority
  const getNotificationColor = (notification) => {
    if (notification.priority === 'urgent') return appTheme.colors.error;
    if (notification.priority === 'high') return appTheme.colors.warning;
    
    switch (notification.type) {
      case 'NEW_ORDER': return appTheme.colors.success;
      case 'PAYMENT_RECEIVED': return appTheme.colors.info;
      case 'PAYMENT_VERIFIED': return appTheme.colors.success;
      case 'ORDER_STATUS_CHANGED': return appTheme.colors.warning;
      case 'LOW_STOCK_ALERT': return appTheme.colors.error;
      default: return appTheme.colors.primary;
    }
  };

  // Format time since
  const formatTimeSince = (dateString) => {
    if (!dateString) return 'Just now';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (fetchInProgressRef.current || !user || !getToken) return;
    
    fetchInProgressRef.current = true;
    
    if (showLoading && isMountedRef.current) {
      setLoading(true);
    }
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/notifications?limit=100&page=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.notifications) {
        const notificationsWithTime = data.notifications.map(notification => ({
          ...notification,
          timeSince: formatTimeSince(notification.createdAt),
          formattedDate: formatDate(notification.createdAt)
        }));
        
        if (isMountedRef.current) {
          setNotifications(notificationsWithTime);
          setStats(data.statistics || {
            total: notificationsWithTime.length,
            unread: notificationsWithTime.filter(n => n.status !== 'read').length,
            today: notificationsWithTime.filter(n => {
              const today = new Date();
              const notifDate = new Date(n.createdAt);
              return notifDate.toDateString() === today.toDateString();
            }).length,
            highPriority: notificationsWithTime.filter(n => n.priority === 'high' || n.priority === 'urgent').length
          });
        }
      }
      
      setError(null);
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      
      if (isMountedRef.current) {
        setError(error.message);
        
        // Show error notification
        showNotification(
          'Failed to Load Notifications',
          error.message,
          'error',
          5000
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    }
  }, [user, getToken, showNotification]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAsRead: true })
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, status: 'read' } : n
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
      
    } catch (error) {
      console.error('Failed to mark as read:', error);
      showNotification(
        'Update Failed',
        'Could not mark notification as read',
        'error',
        3000
      );
    }
  }, [getToken, showNotification]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const unreadNotifications = notifications.filter(n => n.status !== 'read');
      
      // Mark each unread notification as read
      for (const notification of unreadNotifications) {
        await fetch(`/api/notifications?id=${notification.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ markAsRead: true })
        });
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' }))
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0
      }));
      
      showNotification(
        'All notifications marked as read',
        '',
        'success',
        3000
      );
      
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      showNotification(
        'Update Failed',
        'Could not mark all notifications as read',
        'error',
        3000
      );
    }
  }, [notifications, getToken, showNotification]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update stats
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          unread: deletedNotification.status !== 'read' ? Math.max(0, prev.unread - 1) : prev.unread,
          highPriority: deletedNotification.priority === 'high' || deletedNotification.priority === 'urgent' 
            ? Math.max(0, prev.highPriority - 1) 
            : prev.highPriority
        }));
      }
      
      showNotification(
        'Notification deleted',
        '',
        'success',
        3000
      );
      
    } catch (error) {
      console.error('Failed to delete notification:', error);
      showNotification(
        'Delete Failed',
        'Could not delete notification',
        'error',
        3000
      );
    }
  }, [notifications, getToken, showNotification]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }
    
    try {
      const token = getToken();
      if (!token) return;
      
      // Delete each notification
      for (const notification of notifications) {
        await fetch(`/api/notifications?id=${notification.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Clear local state
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        today: 0,
        highPriority: 0
      });
      
      showNotification(
        'All notifications cleared',
        '',
        'success',
        3000
      );
      
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      showNotification(
        'Clear Failed',
        'Could not clear all notifications',
        'error',
        3000
      );
    }
  }, [notifications, getToken, showNotification]);

  // Filter and search notifications
  useEffect(() => {
    let filtered = [...notifications];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'unread') {
        filtered = filtered.filter(n => n.status !== 'read');
      } else if (activeFilter === 'read') {
        filtered = filtered.filter(n => n.status === 'read');
      } else if (activeFilter === 'high') {
        filtered = filtered.filter(n => n.priority === 'high' || n.priority === 'urgent');
      } else {
        filtered = filtered.filter(n => n.type === activeFilter);
      }
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.message && n.message.toLowerCase().includes(query)) ||
        (n.orderNumber && n.orderNumber.toLowerCase().includes(query)) ||
        (n.customerName && n.customerName.toLowerCase().includes(query))
      );
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeFilter, searchQuery]);

  // Initialize and poll for new notifications
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    if (user) {
      fetchNotifications();
    }
    
    // Poll for new notifications every 30 seconds
    pollIntervalRef.current = setInterval(() => {
      if (user && isMountedRef.current && !fetchInProgressRef.current) {
        fetchNotifications(false); // Don't show loading on poll
      }
    }, 30000);
    
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, fetchNotifications]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchNotifications();
    showNotification(
      'Refreshing notifications...',
      '',
      'info',
      2000
    );
  }, [fetchNotifications, showNotification]);

  // Handle notification click (view order)
  const handleNotificationClick = useCallback((notification) => {
    if (notification.orderNumber) {
      // Navigate to order details
      window.location.href = `/admin/orders?search=${notification.orderNumber}`;
    } else {
      markAsRead(notification.id);
    }
  }, [markAsRead]);

  // Loading state
  if (loading && notifications.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: appTheme.colors.textSecondary
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${appTheme.colors.border}`,
          borderTop: `4px solid ${appTheme.colors.primary}`,
          borderRadius: '50%',
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontSize: '1.1rem' }}>Loading notifications...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        padding: '40px'
      }}>
        <AlertCircle size={48} color={appTheme.colors.error} />
        <h3 style={{ 
          color: appTheme.colors.error,
          margin: '20px 0 10px',
          fontSize: '1.2rem'
        }}>
          Failed to Load Notifications
        </h3>
        <p style={{ 
          color: appTheme.colors.textSecondary,
          marginBottom: '20px',
          maxWidth: '400px'
        }}>
          {error}
        </p>
        <button
          onClick={() => fetchNotifications()}
          style={{
            padding: '10px 20px',
            backgroundColor: appTheme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: appTheme.colors.textPrimary,
            marginBottom: '8px'
          }}>
            🔔 Notifications
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: '1rem'
          }}>
            Stay updated with real-time system alerts and activities
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: `${appTheme.colors.primary}15`,
              color: appTheme.colors.primary,
              border: `1px solid ${appTheme.colors.primary}30`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </motion.button>
          
          {stats.unread > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: `${appTheme.colors.success}15`,
                color: appTheme.colors.success,
                border: `1px solid ${appTheme.colors.success}30`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <Check size={16} />
              Mark All as Read ({stats.unread})
            </motion.button>
          )}
          
          {notifications.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllNotifications}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: `${appTheme.colors.error}15`,
                color: appTheme.colors.error,
                border: `1px solid ${appTheme.colors.error}30`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <Trash2 size={16} />
              Clear All
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: appTheme.colors.surface,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: appTheme.shadows.sm,
            border: `1px solid ${appTheme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: `${appTheme.colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={24} color={appTheme.colors.primary} />
          </div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              color: appTheme.colors.textSecondary,
              marginBottom: '4px'
            }}>
              Total Notifications
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: appTheme.colors.textPrimary
            }}>
              {stats.total}
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            backgroundColor: appTheme.colors.surface,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: appTheme.shadows.sm,
            border: `1px solid ${appTheme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: `${appTheme.colors.warning}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BellRing size={24} color={appTheme.colors.warning} />
          </div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              color: appTheme.colors.textSecondary,
              marginBottom: '4px'
            }}>
              Unread
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: appTheme.colors.textPrimary
            }}>
              {stats.unread}
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            backgroundColor: appTheme.colors.surface,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: appTheme.shadows.sm,
            border: `1px solid ${appTheme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: `${appTheme.colors.info}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} color={appTheme.colors.info} />
          </div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              color: appTheme.colors.textSecondary,
              marginBottom: '4px'
            }}>
              Today
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: appTheme.colors.textPrimary
            }}>
              {stats.today}
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{
            backgroundColor: appTheme.colors.surface,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: appTheme.shadows.sm,
            border: `1px solid ${appTheme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: `${appTheme.colors.error}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={24} color={appTheme.colors.error} />
          </div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              color: appTheme.colors.textSecondary,
              marginBottom: '4px'
            }}>
              High Priority
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: appTheme.colors.textPrimary
            }}>
              {stats.highPriority}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: appTheme.colors.surface,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: appTheme.shadows.sm,
        border: `1px solid ${appTheme.colors.border}`,
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color={appTheme.colors.textSecondary} />
            <span style={{
              fontWeight: '600',
              color: appTheme.colors.textPrimary
            }}>
              Filter by:
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {['all', 'unread', 'read', 'high', 'NEW_ORDER', 'PAYMENT_RECEIVED', 'LOW_STOCK_ALERT'].map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeFilter === filter ? appTheme.colors.primary : `${appTheme.colors.background}`,
                  color: activeFilter === filter ? 'white' : appTheme.colors.textPrimary,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                {filter === 'all' && 'All'}
                {filter === 'unread' && 'Unread'}
                {filter === 'read' && 'Read'}
                {filter === 'high' && 'High Priority'}
                {filter === 'NEW_ORDER' && 'New Orders'}
                {filter === 'PAYMENT_RECEIVED' && 'Payments'}
                {filter === 'LOW_STOCK_ALERT' && 'Low Stock'}
              </motion.button>
            ))}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Search size={18} color={appTheme.colors.textSecondary} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 15px',
              borderRadius: '8px',
              border: `1px solid ${appTheme.colors.border}`,
              backgroundColor: appTheme.colors.background,
              color: appTheme.colors.textPrimary,
              fontSize: '0.95rem'
            }}
          />
        </div>
      </div>

      {/* Notifications List */}
      <AnimatePresence>
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: appTheme.colors.surface,
              padding: '60px 20px',
              borderRadius: '12px',
              boxShadow: appTheme.shadows.sm,
              border: `1px solid ${appTheme.colors.border}`,
              textAlign: 'center'
            }}
          >
            <BellOff size={48} color={appTheme.colors.textSecondary} />
            <h3 style={{
              color: appTheme.colors.textPrimary,
              margin: '20px 0 10px',
              fontSize: '1.3rem'
            }}>
              No notifications found
            </h3>
            <p style={{
              color: appTheme.colors.textSecondary,
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {searchQuery || activeFilter !== 'all' 
                ? 'Try changing your search or filter criteria'
                : 'All caught up! No notifications at the moment.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: appTheme.colors.surface,
              borderRadius: '12px',
              boxShadow: appTheme.shadows.sm,
              border: `1px solid ${appTheme.colors.border}`,
              overflow: 'hidden'
            }}
          >
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  gap: '15px',
                  padding: '20px',
                  borderBottom: `1px solid ${appTheme.colors.border}`,
                  alignItems: 'flex-start',
                  backgroundColor: notification.status !== 'read' ? `${appTheme.colors.warning}08` : 'transparent',
                  cursor: notification.orderNumber ? 'pointer' : 'default',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${appTheme.colors.background}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.status !== 'read' ? `${appTheme.colors.warning}08` : 'transparent';
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Icon */}
                <div style={{ 
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: notification.status !== 'read' ? '700' : '600',
                      color: appTheme.colors.textPrimary,
                      marginBottom: '4px'
                    }}>
                      {notification.title || notification.type}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {notification.priority === 'high' && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          backgroundColor: `${appTheme.colors.error}20`,
                          color: appTheme.colors.error,
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          HIGH
                        </span>
                      )}
                      
                      {notification.priority === 'urgent' && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          backgroundColor: appTheme.colors.error,
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          URGENT
                        </span>
                      )}
                      
                      {notification.status !== 'read' && (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: appTheme.colors.warning
                        }} />
                      )}
                    </div>
                  </div>
                  
                  <p style={{
                    color: appTheme.colors.textSecondary,
                    marginBottom: '8px',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                  }}>
                    {notification.message}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                    color: appTheme.colors.textMuted,
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {notification.timeSince} • {notification.formattedDate}
                    </span>
                    
                    {notification.orderNumber && (
                      <span style={{
                        backgroundColor: `${appTheme.colors.primary}15`,
                        color: appTheme.colors.primary,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        Order #{notification.orderNumber}
                      </span>
                    )}
                    
                    {notification.customerName && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} />
                        {notification.customerName}
                      </span>
                    )}
                    
                    {notification.totalAmount && (
                      <span style={{ fontWeight: '600' }}>
                        ₹{notification.totalAmount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginLeft: '10px'
                }}>
                  {notification.status !== 'read' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: `${appTheme.colors.success}15`,
                        color: appTheme.colors.success,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: `${appTheme.colors.error}15`,
                      color: appTheme.colors.error,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Stats */}
      {filteredNotifications.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px 20px',
          backgroundColor: appTheme.colors.surface,
          borderRadius: '12px',
          boxShadow: appTheme.shadows.sm,
          border: `1px solid ${appTheme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ color: appTheme.colors.textSecondary, fontSize: '0.9rem' }}>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
          <div style={{ color: appTheme.colors.textSecondary, fontSize: '0.9rem' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}