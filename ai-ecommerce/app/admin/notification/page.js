"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  RefreshCw, 
  Trash2,
  Eye,
  EyeOff,
  Download,
  MoreVertical,
  Calendar,
  Mail,
  Smartphone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  Archive,
  BellOff,
  Loader2
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../../context/authContext";
import { useRouter } from "next/navigation";

const NOTIFICATION_TYPES = {
  NEW_ORDER: {
    label: "New Order",
    icon: "🛍️",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50"
  },
  PAYMENT_RECEIVED: {
    label: "Payment Received",
    icon: "💰",
    color: "bg-green-100 text-green-700 border-green-200",
    textColor: "text-green-700",
    bgColor: "bg-green-50"
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    icon: "✅",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50"
  },
  LOW_STOCK_ALERT: {
    label: "Low Stock",
    icon: "📦",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50"
  },
  ORDER_STATUS_CHANGED: {
    label: "Status Update",
    icon: "📦",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50"
  },
  SYSTEM_ALERT: {
    label: "System Alert",
    icon: "🚨",
    color: "bg-red-100 text-red-700 border-red-200",
    textColor: "text-red-700",
    bgColor: "bg-red-50"
  },
  ADMIN_ALERT: {
    label: "Admin Alert",
    icon: "🔔",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50"
  }
};

const PRIORITY_COLORS = {
  low: "text-gray-500 bg-gray-100",
  normal: "text-gray-700 bg-gray-200",
  high: "text-amber-700 bg-amber-100",
  urgent: "text-red-700 bg-red-100"
};

export default function NotificationPage() {
  // State
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all",
    search: "",
    dateRange: "all",
    source: "all"
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    highPriority: 0,
    urgent: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  // Auth and router
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Refs
  const autoRefreshRef = useRef(null);

  // Format time
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return 'Just now';
    } catch (error) {
      return "Recently";
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);

      // Check if user is authenticated
      if (!user) {
        toast.error("Please login to view notifications");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      // Add filters
      if (filters.type !== "all") queryParams.append("type", filters.type);
      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.priority !== "all") queryParams.append("priority", filters.priority);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.dateRange !== "all") {
        const today = new Date();
        if (filters.dateRange === "today") {
          queryParams.append("startDate", today.toISOString().split('T')[0]);
        } else if (filters.dateRange === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          queryParams.append("startDate", weekAgo.toISOString().split('T')[0]);
        } else if (filters.dateRange === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          queryParams.append("startDate", monthAgo.toISOString().split('T')[0]);
        }
      }

      const response = await fetch(`/api/notifications?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          logout();
          router.push('/login');
          return;
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
        setFilteredNotifications(data.notifications || []);
        setPagination(data.pagination || { page, limit: pagination.limit, total: 0, pages: 1 });
        setStats(data.statistics || { total: 0, unread: 0, highPriority: 0, urgent: 0 });
        
        // Calculate today's notifications
        const today = new Date().toISOString().split('T')[0];
        const todayCount = (data.notifications || []).filter(n => 
          new Date(n.createdAt).toISOString().split('T')[0] === today
        ).length;
        
        setStats(prev => ({ ...prev, today: todayCount }));
      } else {
        throw new Error(data.message || "Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error(error.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, pagination.limit, user, logout, router]);

  // Initial fetch
  useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications();
      
      // Set up auto-refresh every 30 seconds
      autoRefreshRef.current = setInterval(() => {
        if (user) {
          fetchNotifications(pagination.page, false);
        }
      }, 30000);
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchNotifications, authLoading, user, pagination.page]);

  // Apply filters
  useEffect(() => {
    if (!notifications.length) return;

    let filtered = [...notifications];

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(n => n.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(n =>
        (n.orderNumber && n.orderNumber.toLowerCase().includes(searchLower)) ||
        (n.customerName && n.customerName.toLowerCase().includes(searchLower)) ||
        (n.message && n.message.toLowerCase().includes(searchLower)) ||
        (n.title && n.title.toLowerCase().includes(searchLower))
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filters]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ markAsRead: true })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, status: "read" } : n
          ));
          
          // Update stats
          setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1)
          }));
          
          // Remove from selected if present
          setSelectedNotifications(prev => {
            const next = new Set(prev);
            next.delete(notificationId);
            return next;
          });

          toast.success("Marked as read");
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === "pending");
      if (unreadNotifications.length === 0) {
        toast.success("All notifications are already read");
        return;
      }

      const promises = unreadNotifications.map(n => markAsRead(n.id));
      await Promise.all(promises);
      
      toast.success(`Marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  }, [notifications, markAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove from local state
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
          
          // Remove from selected
          setSelectedNotifications(prev => {
            const next = new Set(prev);
            next.delete(notificationId);
            return next;
          });

          toast.success("Notification deleted");
          
          // Refresh stats
          fetchNotifications(pagination.page, false);
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  }, [fetchNotifications, pagination.page]);

  // Delete selected
  const deleteSelected = useCallback(async () => {
    if (selectedNotifications.size === 0) {
      toast.error("No notifications selected");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedNotifications.size} notification(s)?`)) {
      return;
    }

    try {
      const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
      await Promise.all(promises);
      
      setSelectedNotifications(new Set());
      toast.success(`Deleted ${selectedNotifications.size} notification(s)`);
    } catch (error) {
      console.error("Error deleting selected:", error);
      toast.error("Failed to delete selected notifications");
    }
  }, [selectedNotifications, deleteNotification]);

  // Toggle selection
  const toggleSelection = useCallback((notificationId) => {
    setSelectedNotifications(prev => {
      const next = new Set(prev);
      if (next.has(notificationId)) {
        next.delete(notificationId);
      } else {
        next.add(notificationId);
      }
      return next;
    });
  }, []);

  // Select all visible
  const selectAllVisible = useCallback(() => {
    if (selectedNotifications.size === filteredNotifications.length) {
      // Deselect all if all are selected
      setSelectedNotifications(new Set());
    } else {
      // Select all visible
      const allIds = filteredNotifications.map(n => n.id);
      setSelectedNotifications(new Set(allIds));
    }
  }, [filteredNotifications, selectedNotifications.size]);

  // Get notification type config
  const getNotificationConfig = (type) => {
    return NOTIFICATION_TYPES[type] || {
      label: type,
      icon: "🔔",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50"
    };
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchNotifications(newPage);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      priority: "all",
      search: "",
      dateRange: "all",
      source: "all"
    });
    setShowFilters(false);
  };

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to access notifications</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BellRing className="w-8 h-8 text-blue-600" />
                Notifications
                {user && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    Welcome, {user.name}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">Manage and monitor all system notifications</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchNotifications(pagination.page, false)}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              
              <button
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Read
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unread</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
                </div>
                <Bell className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {Object.values(filters).some(v => v !== "all" && v !== "") && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>

                {selectedNotifications.size > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedNotifications.size})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredNotifications.length} of {pagination.total}
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
                    fetchNotifications(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">All Types</option>
                        {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="read">Read</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-end gap-2">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <BellOff className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500 max-w-md">
                {filters.search || filters.type !== "all" || filters.status !== "all"
                  ? "No notifications match your filters. Try changing your search criteria."
                  : "You're all caught up! No new notifications at the moment."}
              </p>
              {(filters.search || filters.type !== "all" || filters.status !== "all") && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
                >
                  Clear filters to see all notifications
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => {
                  const config = getNotificationConfig(notification.type);
                  const isSelected = selectedNotifications.has(notification.id);
                  const isUnread = notification.status === "pending";

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors ${isUnread ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(notification.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color} border`}>
                          <span className="text-lg">{config.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {isUnread && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
                                {notification.priority}
                              </span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            {notification.orderNumber && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Order:</span>
                                {notification.orderNumber}
                              </span>
                            )}
                            {notification.customerName && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Customer:</span>
                                {notification.customerName}
                              </span>
                            )}
                            {notification.totalAmount && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Amount:</span>
                                ₹{notification.totalAmount}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            {isUnread && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} notifications
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                              pagination.page === pageNum
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Auto-refresh indicator */}
        {!isLoading && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </>
  );
}