// // "use client";

// // import React, { useState, useEffect, useCallback, useRef } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { 
// //   Bell, 
// //   BellRing, 
// //   CheckCircle, 
// //   Clock, 
// //   AlertCircle, 
// //   Filter, 
// //   Search, 
// //   RefreshCw, 
// //   Trash2,
// //   Eye,
// //   EyeOff,
// //   Download,
// //   MoreVertical,
// //   Calendar,
// //   Mail,
// //   Smartphone,
// //   ExternalLink,
// //   ChevronLeft,
// //   ChevronRight,
// //   Star,
// //   Archive,
// //   BellOff,
// //   Loader2
// // } from "lucide-react";
// // import { toast, Toaster } from "react-hot-toast";
// // import { useAuth } from "../../../context/authContext";
// // import { useRouter } from "next/navigation";

// // const NOTIFICATION_TYPES = {
// //   NEW_ORDER: {
// //     label: "New Order",
// //     icon: "🛍️",
// //     color: "bg-blue-100 text-blue-700 border-blue-200",
// //     textColor: "text-blue-700",
// //     bgColor: "bg-blue-50"
// //   },
// //   PAYMENT_RECEIVED: {
// //     label: "Payment Received",
// //     icon: "💰",
// //     color: "bg-green-100 text-green-700 border-green-200",
// //     textColor: "text-green-700",
// //     bgColor: "bg-green-50"
// //   },
// //   PAYMENT_VERIFIED: {
// //     label: "Payment Verified",
// //     icon: "✅",
// //     color: "bg-emerald-100 text-emerald-700 border-emerald-200",
// //     textColor: "text-emerald-700",
// //     bgColor: "bg-emerald-50"
// //   },
// //   LOW_STOCK_ALERT: {
// //     label: "Low Stock",
// //     icon: "📦",
// //     color: "bg-amber-100 text-amber-700 border-amber-200",
// //     textColor: "text-amber-700",
// //     bgColor: "bg-amber-50"
// //   },
// //   ORDER_STATUS_CHANGED: {
// //     label: "Status Update",
// //     icon: "📦",
// //     color: "bg-purple-100 text-purple-700 border-purple-200",
// //     textColor: "text-purple-700",
// //     bgColor: "bg-purple-50"
// //   },
// //   SYSTEM_ALERT: {
// //     label: "System Alert",
// //     icon: "🚨",
// //     color: "bg-red-100 text-red-700 border-red-200",
// //     textColor: "text-red-700",
// //     bgColor: "bg-red-50"
// //   },
// //   ADMIN_ALERT: {
// //     label: "Admin Alert",
// //     icon: "🔔",
// //     color: "bg-orange-100 text-orange-700 border-orange-200",
// //     textColor: "text-orange-700",
// //     bgColor: "bg-orange-50"
// //   }
// // };

// // const PRIORITY_COLORS = {
// //   low: "text-gray-500 bg-gray-100",
// //   normal: "text-gray-700 bg-gray-200",
// //   high: "text-amber-700 bg-amber-100",
// //   urgent: "text-red-700 bg-red-100"
// // };

// // export default function NotificationPage() {
// //   // State
// //   const [notifications, setNotifications] = useState([]);
// //   const [filteredNotifications, setFilteredNotifications] = useState([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isRefreshing, setIsRefreshing] = useState(false);
// //   const [selectedNotifications, setSelectedNotifications] = useState(new Set());
// //   const [filters, setFilters] = useState({
// //     type: "all",
// //     status: "all",
// //     priority: "all",
// //     search: "",
// //     dateRange: "all",
// //     source: "all"
// //   });
// //   const [stats, setStats] = useState({
// //     total: 0,
// //     unread: 0,
// //     today: 0,
// //     highPriority: 0,
// //     urgent: 0
// //   });
// //   const [pagination, setPagination] = useState({
// //     page: 1,
// //     limit: 20,
// //     total: 0,
// //     pages: 1
// //   });
// //   const [showFilters, setShowFilters] = useState(false);

// //   // Auth and router
// //   const { user, loading: authLoading, logout } = useAuth();
// //   const router = useRouter();

// //   // Refs
// //   const autoRefreshRef = useRef(null);

// //   // Format time
// //   const formatTime = (dateString) => {
// //     try {
// //       const date = new Date(dateString);
// //       const now = new Date();
// //       const diffMs = now - date;
// //       const diffMins = Math.floor(diffMs / 60000);
// //       const diffHours = Math.floor(diffMs / 3600000);
// //       const diffDays = Math.floor(diffMs / 86400000);
      
// //       if (diffDays > 0) return `${diffDays}d ago`;
// //       if (diffHours > 0) return `${diffHours}h ago`;
// //       if (diffMins > 0) return `${diffMins}m ago`;
// //       return 'Just now';
// //     } catch (error) {
// //       return "Recently";
// //     }
// //   };

// //   // Fetch notifications
// //   const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
// //     try {
// //       if (showLoading) setIsLoading(true);
// //       setIsRefreshing(true);

// //       // Check if user is authenticated
// //       if (!user) {
// //         toast.error("Please login to view notifications");
// //         setIsLoading(false);
// //         setIsRefreshing(false);
// //         return;
// //       }

// //       const queryParams = new URLSearchParams({
// //         page: page.toString(),
// //         limit: pagination.limit.toString()
// //       });

// //       // Add filters
// //       if (filters.type !== "all") queryParams.append("type", filters.type);
// //       if (filters.status !== "all") queryParams.append("status", filters.status);
// //       if (filters.priority !== "all") queryParams.append("priority", filters.priority);
// //       if (filters.search) queryParams.append("search", filters.search);
// //       if (filters.dateRange !== "all") {
// //         const today = new Date();
// //         if (filters.dateRange === "today") {
// //           queryParams.append("startDate", today.toISOString().split('T')[0]);
// //         } else if (filters.dateRange === "week") {
// //           const weekAgo = new Date(today);
// //           weekAgo.setDate(today.getDate() - 7);
// //           queryParams.append("startDate", weekAgo.toISOString().split('T')[0]);
// //         } else if (filters.dateRange === "month") {
// //           const monthAgo = new Date(today);
// //           monthAgo.setMonth(today.getMonth() - 1);
// //           queryParams.append("startDate", monthAgo.toISOString().split('T')[0]);
// //         }
// //       }

// //       const response = await fetch(`/api/notifications?${queryParams}`);
      
// //       if (!response.ok) {
// //         if (response.status === 401) {
// //           toast.error("Session expired. Please login again.");
// //           logout();
// //           router.push('/login');
// //           return;
// //         }
// //         throw new Error(`Failed to fetch notifications: ${response.status}`);
// //       }

// //       const data = await response.json();

// //       if (data.success) {
// //         setNotifications(data.notifications || []);
// //         setFilteredNotifications(data.notifications || []);
// //         setPagination(data.pagination || { page, limit: pagination.limit, total: 0, pages: 1 });
// //         setStats(data.statistics || { total: 0, unread: 0, highPriority: 0, urgent: 0 });
        
// //         // Calculate today's notifications
// //         const today = new Date().toISOString().split('T')[0];
// //         const todayCount = (data.notifications || []).filter(n => 
// //           new Date(n.createdAt).toISOString().split('T')[0] === today
// //         ).length;
        
// //         setStats(prev => ({ ...prev, today: todayCount }));
// //       } else {
// //         throw new Error(data.message || "Failed to load notifications");
// //       }
// //     } catch (error) {
// //       console.error("Error fetching notifications:", error);
// //       toast.error(error.message || "Failed to load notifications");
// //     } finally {
// //       setIsLoading(false);
// //       setIsRefreshing(false);
// //     }
// //   }, [filters, pagination.limit, user, logout, router]);

// //   // Initial fetch
// //   useEffect(() => {
// //     if (!authLoading && user) {
// //       fetchNotifications();
      
// //       // Set up auto-refresh every 30 seconds
// //       autoRefreshRef.current = setInterval(() => {
// //         if (user) {
// //           fetchNotifications(pagination.page, false);
// //         }
// //       }, 30000);
// //     }

// //     return () => {
// //       if (autoRefreshRef.current) {
// //         clearInterval(autoRefreshRef.current);
// //       }
// //     };
// //   }, [fetchNotifications, authLoading, user, pagination.page]);

// //   // Apply filters
// //   useEffect(() => {
// //     if (!notifications.length) return;

// //     let filtered = [...notifications];

// //     // Apply type filter
// //     if (filters.type !== "all") {
// //       filtered = filtered.filter(n => n.type === filters.type);
// //     }

// //     // Apply status filter
// //     if (filters.status !== "all") {
// //       filtered = filtered.filter(n => n.status === filters.status);
// //     }

// //     // Apply priority filter
// //     if (filters.priority !== "all") {
// //       filtered = filtered.filter(n => n.priority === filters.priority);
// //     }

// //     // Apply search filter
// //     if (filters.search) {
// //       const searchLower = filters.search.toLowerCase();
// //       filtered = filtered.filter(n =>
// //         (n.orderNumber && n.orderNumber.toLowerCase().includes(searchLower)) ||
// //         (n.customerName && n.customerName.toLowerCase().includes(searchLower)) ||
// //         (n.message && n.message.toLowerCase().includes(searchLower)) ||
// //         (n.title && n.title.toLowerCase().includes(searchLower))
// //       );
// //     }

// //     setFilteredNotifications(filtered);
// //   }, [notifications, filters]);

// //   // Mark as read
// //   const markAsRead = useCallback(async (notificationId) => {
// //     try {
// //       const response = await fetch(`/api/notifications?id=${notificationId}`, {
// //         method: "PUT",
// //         headers: {
// //           "Content-Type": "application/json"
// //         },
// //         body: JSON.stringify({ markAsRead: true })
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         if (data.success) {
// //           // Update local state
// //           setNotifications(prev => prev.map(n =>
// //             n.id === notificationId ? { ...n, status: "read" } : n
// //           ));
          
// //           // Update stats
// //           setStats(prev => ({
// //             ...prev,
// //             unread: Math.max(0, prev.unread - 1)
// //           }));
          
// //           // Remove from selected if present
// //           setSelectedNotifications(prev => {
// //             const next = new Set(prev);
// //             next.delete(notificationId);
// //             return next;
// //           });

// //           toast.success("Marked as read");
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error marking as read:", error);
// //       toast.error("Failed to mark as read");
// //     }
// //   }, []);

// //   // Mark all as read
// //   const markAllAsRead = useCallback(async () => {
// //     try {
// //       const unreadNotifications = notifications.filter(n => n.status === "pending");
// //       if (unreadNotifications.length === 0) {
// //         toast.success("All notifications are already read");
// //         return;
// //       }

// //       const promises = unreadNotifications.map(n => markAsRead(n.id));
// //       await Promise.all(promises);
      
// //       toast.success(`Marked ${unreadNotifications.length} notifications as read`);
// //     } catch (error) {
// //       console.error("Error marking all as read:", error);
// //       toast.error("Failed to mark all as read");
// //     }
// //   }, [notifications, markAsRead]);

// //   // Delete notification
// //   const deleteNotification = useCallback(async (notificationId) => {
// //     try {
// //       const response = await fetch(`/api/notifications?id=${notificationId}`, {
// //         method: "DELETE"
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         if (data.success) {
// //           // Remove from local state
// //           setNotifications(prev => prev.filter(n => n.id !== notificationId));
          
// //           // Remove from selected
// //           setSelectedNotifications(prev => {
// //             const next = new Set(prev);
// //             next.delete(notificationId);
// //             return next;
// //           });

// //           toast.success("Notification deleted");
          
// //           // Refresh stats
// //           fetchNotifications(pagination.page, false);
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error deleting notification:", error);
// //       toast.error("Failed to delete notification");
// //     }
// //   }, [fetchNotifications, pagination.page]);

// //   // Delete selected
// //   const deleteSelected = useCallback(async () => {
// //     if (selectedNotifications.size === 0) {
// //       toast.error("No notifications selected");
// //       return;
// //     }

// //     if (!confirm(`Are you sure you want to delete ${selectedNotifications.size} notification(s)?`)) {
// //       return;
// //     }

// //     try {
// //       const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
// //       await Promise.all(promises);
      
// //       setSelectedNotifications(new Set());
// //       toast.success(`Deleted ${selectedNotifications.size} notification(s)`);
// //     } catch (error) {
// //       console.error("Error deleting selected:", error);
// //       toast.error("Failed to delete selected notifications");
// //     }
// //   }, [selectedNotifications, deleteNotification]);

// //   // Toggle selection
// //   const toggleSelection = useCallback((notificationId) => {
// //     setSelectedNotifications(prev => {
// //       const next = new Set(prev);
// //       if (next.has(notificationId)) {
// //         next.delete(notificationId);
// //       } else {
// //         next.add(notificationId);
// //       }
// //       return next;
// //     });
// //   }, []);

// //   // Select all visible
// //   const selectAllVisible = useCallback(() => {
// //     if (selectedNotifications.size === filteredNotifications.length) {
// //       // Deselect all if all are selected
// //       setSelectedNotifications(new Set());
// //     } else {
// //       // Select all visible
// //       const allIds = filteredNotifications.map(n => n.id);
// //       setSelectedNotifications(new Set(allIds));
// //     }
// //   }, [filteredNotifications, selectedNotifications.size]);

// //   // Get notification type config
// //   const getNotificationConfig = (type) => {
// //     return NOTIFICATION_TYPES[type] || {
// //       label: type,
// //       icon: "🔔",
// //       color: "bg-gray-100 text-gray-700 border-gray-200",
// //       textColor: "text-gray-700",
// //       bgColor: "bg-gray-50"
// //     };
// //   };

// //   // Handle page change
// //   const handlePageChange = (newPage) => {
// //     if (newPage >= 1 && newPage <= pagination.pages) {
// //       setPagination(prev => ({ ...prev, page: newPage }));
// //       fetchNotifications(newPage);
// //     }
// //   };

// //   // Clear all filters
// //   const clearFilters = () => {
// //     setFilters({
// //       type: "all",
// //       status: "all",
// //       priority: "all",
// //       search: "",
// //       dateRange: "all",
// //       source: "all"
// //     });
// //     setShowFilters(false);
// //   };

// //   // Redirect if not authenticated
// //   if (authLoading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen">
// //         <div className="text-center">
// //           <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
// //           <p className="text-gray-600">Loading...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!user) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen">
// //         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
// //           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
// //           <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
// //           <p className="text-gray-600 mb-6">Please login to access notifications</p>
// //           <button
// //             onClick={() => router.push('/login')}
// //             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// //           >
// //             Go to Login
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <>
// //       <Toaster position="top-right" />
// //       <div className="min-h-screen bg-gray-50 p-4 md:p-6">
// //         {/* Header */}
// //         <div className="mb-6">
// //           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
// //             <div>
// //               <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
// //                 <BellRing className="w-8 h-8 text-blue-600" />
// //                 Notifications
// //                 {user && (
// //                   <span className="text-sm font-normal text-gray-500 ml-2">
// //                     Welcome, {user.name}
// //                   </span>
// //                 )}
// //               </h1>
// //               <p className="text-gray-600 mt-1">Manage and monitor all system notifications</p>
// //             </div>
            
// //             <div className="flex items-center gap-3">
// //               <button
// //                 onClick={() => fetchNotifications(pagination.page, false)}
// //                 disabled={isRefreshing}
// //                 className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
// //               >
// //                 <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
// //                 Refresh
// //               </button>
              
// //               <button
// //                 onClick={markAllAsRead}
// //                 disabled={stats.unread === 0}
// //                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
// //               >
// //                 <CheckCircle className="w-4 h-4" />
// //                 Mark All Read
// //               </button>
// //             </div>
// //           </div>

// //           {/* Stats Cards */}
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
// //             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">Total Notifications</p>
// //                   <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
// //                 </div>
// //                 <Bell className="w-8 h-8 text-blue-500" />
// //               </div>
// //             </div>

// //             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">Unread</p>
// //                   <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
// //                 </div>
// //                 <Bell className="w-8 h-8 text-amber-500" />
// //               </div>
// //             </div>

// //             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">Today</p>
// //                   <p className="text-2xl font-bold text-green-600">{stats.today}</p>
// //                 </div>
// //                 <Calendar className="w-8 h-8 text-green-500" />
// //               </div>
// //             </div>

// //             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">High Priority</p>
// //                   <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
// //                 </div>
// //                 <AlertCircle className="w-8 h-8 text-red-500" />
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Main Content */}
// //         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
// //           {/* Toolbar */}
// //           <div className="p-4 border-b border-gray-200 bg-gray-50">
// //             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //               <div className="flex items-center gap-4">
// //                 <div className="relative flex-1 md:flex-none">
// //                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
// //                   <input
// //                     type="text"
// //                     placeholder="Search notifications..."
// //                     value={filters.search}
// //                     onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
// //                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                   />
// //                 </div>

// //                 <button
// //                   onClick={() => setShowFilters(!showFilters)}
// //                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
// //                 >
// //                   <Filter className="w-4 h-4" />
// //                   Filters
// //                   {Object.values(filters).some(v => v !== "all" && v !== "") && (
// //                     <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
// //                   )}
// //                 </button>

// //                 {selectedNotifications.size > 0 && (
// //                   <button
// //                     onClick={deleteSelected}
// //                     className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
// //                   >
// //                     <Trash2 className="w-4 h-4" />
// //                     Delete Selected ({selectedNotifications.size})
// //                   </button>
// //                 )}
// //               </div>

// //               <div className="flex items-center gap-2">
// //                 <span className="text-sm text-gray-500">
// //                   Showing {filteredNotifications.length} of {pagination.total}
// //                 </span>
// //                 <select
// //                   value={pagination.limit}
// //                   onChange={(e) => {
// //                     setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
// //                     fetchNotifications(1);
// //                   }}
// //                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
// //                 >
// //                   <option value="10">10 per page</option>
// //                   <option value="20">20 per page</option>
// //                   <option value="50">50 per page</option>
// //                   <option value="100">100 per page</option>
// //                 </select>
// //               </div>
// //             </div>

// //             {/* Filter Panel */}
// //             <AnimatePresence>
// //               {showFilters && (
// //                 <motion.div
// //                   initial={{ height: 0, opacity: 0 }}
// //                   animate={{ height: "auto", opacity: 1 }}
// //                   exit={{ height: 0, opacity: 0 }}
// //                   className="mt-4 pt-4 border-t border-gray-200"
// //                 >
// //                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Type
// //                       </label>
// //                       <select
// //                         value={filters.type}
// //                         onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
// //                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
// //                       >
// //                         <option value="all">All Types</option>
// //                         {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
// //                           <option key={key} value={key}>
// //                             {config.icon} {config.label}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Status
// //                       </label>
// //                       <select
// //                         value={filters.status}
// //                         onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
// //                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
// //                       >
// //                         <option value="all">All Status</option>
// //                         <option value="pending">Pending</option>
// //                         <option value="read">Read</option>
// //                         <option value="delivered">Delivered</option>
// //                       </select>
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Priority
// //                       </label>
// //                       <select
// //                         value={filters.priority}
// //                         onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
// //                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
// //                       >
// //                         <option value="all">All Priorities</option>
// //                         <option value="low">Low</option>
// //                         <option value="normal">Normal</option>
// //                         <option value="high">High</option>
// //                         <option value="urgent">Urgent</option>
// //                       </select>
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Date Range
// //                       </label>
// //                       <select
// //                         value={filters.dateRange}
// //                         onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
// //                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
// //                       >
// //                         <option value="all">All Time</option>
// //                         <option value="today">Today</option>
// //                         <option value="week">Last 7 Days</option>
// //                         <option value="month">Last 30 Days</option>
// //                       </select>
// //                     </div>

// //                     <div className="md:col-span-2 flex items-end gap-2">
// //                       <button
// //                         onClick={clearFilters}
// //                         className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1"
// //                       >
// //                         Clear Filters
// //                       </button>
// //                       <button
// //                         onClick={() => setShowFilters(false)}
// //                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
// //                       >
// //                         Apply Filters
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </motion.div>
// //               )}
// //             </AnimatePresence>
// //           </div>

// //           {/* Notifications List */}
// //           {isLoading ? (
// //             <div className="flex items-center justify-center p-12">
// //               <div className="text-center">
// //                 <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
// //                 <p className="text-gray-500">Loading notifications...</p>
// //               </div>
// //             </div>
// //           ) : filteredNotifications.length === 0 ? (
// //             <div className="flex flex-col items-center justify-center p-12 text-center">
// //               <BellOff className="w-16 h-16 text-gray-300 mb-4" />
// //               <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
// //               <p className="text-gray-500 max-w-md">
// //                 {filters.search || filters.type !== "all" || filters.status !== "all"
// //                   ? "No notifications match your filters. Try changing your search criteria."
// //                   : "You're all caught up! No new notifications at the moment."}
// //               </p>
// //               {(filters.search || filters.type !== "all" || filters.status !== "all") && (
// //                 <button
// //                   onClick={clearFilters}
// //                   className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
// //                 >
// //                   Clear filters to see all notifications
// //                 </button>
// //               )}
// //             </div>
// //           ) : (
// //             <>
// //               <div className="divide-y divide-gray-200">
// //                 {filteredNotifications.map((notification) => {
// //                   const config = getNotificationConfig(notification.type);
// //                   const isSelected = selectedNotifications.has(notification.id);
// //                   const isUnread = notification.status === "pending";

// //                   return (
// //                     <motion.div
// //                       key={notification.id}
// //                       initial={{ opacity: 0, y: 10 }}
// //                       animate={{ opacity: 1, y: 0 }}
// //                       className={`p-4 hover:bg-gray-50 transition-colors ${isUnread ? "bg-blue-50" : ""}`}
// //                     >
// //                       <div className="flex items-start gap-4">
// //                         {/* Selection Checkbox */}
// //                         <div className="flex-shrink-0 pt-1">
// //                           <input
// //                             type="checkbox"
// //                             checked={isSelected}
// //                             onChange={() => toggleSelection(notification.id)}
// //                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
// //                           />
// //                         </div>

// //                         {/* Notification Icon */}
// //                         <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color} border`}>
// //                           <span className="text-lg">{config.icon}</span>
// //                         </div>

// //                         {/* Content */}
// //                         <div className="flex-1 min-w-0">
// //                           <div className="flex items-start justify-between gap-2 mb-1">
// //                             <div className="flex items-center gap-2">
// //                               <h4 className="font-medium text-gray-900 truncate">
// //                                 {notification.title}
// //                               </h4>
// //                               {isUnread && (
// //                                 <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
// //                               )}
// //                             </div>
// //                             <div className="flex items-center gap-2">
// //                               <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
// //                                 {notification.priority}
// //                               </span>
// //                               <span className="text-xs text-gray-500 whitespace-nowrap">
// //                                 {formatTime(notification.createdAt)}
// //                               </span>
// //                             </div>
// //                           </div>

// //                           <p className="text-gray-600 mb-2">
// //                             {notification.message}
// //                           </p>

// //                           {/* Metadata */}
// //                           <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
// //                             {notification.orderNumber && (
// //                               <span className="flex items-center gap-1">
// //                                 <span className="font-medium">Order:</span>
// //                                 {notification.orderNumber}
// //                               </span>
// //                             )}
// //                             {notification.customerName && (
// //                               <span className="flex items-center gap-1">
// //                                 <span className="font-medium">Customer:</span>
// //                                 {notification.customerName}
// //                               </span>
// //                             )}
// //                             {notification.totalAmount && (
// //                               <span className="flex items-center gap-1">
// //                                 <span className="font-medium">Amount:</span>
// //                                 ₹{notification.totalAmount}
// //                               </span>
// //                             )}
// //                           </div>

// //                           {/* Actions */}
// //                           <div className="flex items-center gap-2 mt-3">
// //                             {isUnread && (
// //                               <button
// //                                 onClick={() => markAsRead(notification.id)}
// //                                 className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
// //                               >
// //                                 <CheckCircle className="w-3 h-3" />
// //                                 Mark as Read
// //                               </button>
// //                             )}
// //                             <button
// //                               onClick={() => deleteNotification(notification.id)}
// //                               className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 text-red-600 hover:text-red-700"
// //                             >
// //                               <Trash2 className="w-3 h-3" />
// //                               Delete
// //                             </button>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </motion.div>
// //                   );
// //                 })}
// //               </div>

// //               {/* Pagination */}
// //               {pagination.pages > 1 && (
// //                 <div className="p-4 border-t border-gray-200 bg-gray-50">
// //                   <div className="flex items-center justify-between">
// //                     <div className="text-sm text-gray-500">
// //                       Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
// //                       {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
// //                       {pagination.total} notifications
// //                     </div>
// //                     <div className="flex items-center gap-2">
// //                       <button
// //                         onClick={() => handlePageChange(pagination.page - 1)}
// //                         disabled={pagination.page === 1}
// //                         className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
// //                       >
// //                         <ChevronLeft className="w-4 h-4" />
// //                       </button>
                      
// //                       {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
// //                         let pageNum;
// //                         if (pagination.pages <= 5) {
// //                           pageNum = i + 1;
// //                         } else if (pagination.page <= 3) {
// //                           pageNum = i + 1;
// //                         } else if (pagination.page >= pagination.pages - 2) {
// //                           pageNum = pagination.pages - 4 + i;
// //                         } else {
// //                           pageNum = pagination.page - 2 + i;
// //                         }
                        
// //                         return (
// //                           <button
// //                             key={pageNum}
// //                             onClick={() => handlePageChange(pageNum)}
// //                             className={`w-8 h-8 flex items-center justify-center rounded-lg ${
// //                               pagination.page === pageNum
// //                                 ? "bg-blue-600 text-white"
// //                                 : "border border-gray-300 hover:bg-gray-50"
// //                             }`}
// //                           >
// //                             {pageNum}
// //                           </button>
// //                         );
// //                       })}
                      
// //                       <button
// //                         onClick={() => handlePageChange(pagination.page + 1)}
// //                         disabled={pagination.page === pagination.pages}
// //                         className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
// //                       >
// //                         <ChevronRight className="w-4 h-4" />
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}
// //             </>
// //           )}
// //         </div>

// //         {/* Auto-refresh indicator */}
// //         {!isLoading && (
// //           <div className="mt-4 text-center">
// //             <p className="text-xs text-gray-500">
// //               Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
// //             </p>
// //           </div>
// //         )}
// //       </div>
// //     </>
// //   );
// // }




// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Bell, 
//   BellRing, 
//   CheckCircle, 
//   Clock, 
//   AlertCircle, 
//   Filter, 
//   Search, 
//   RefreshCw, 
//   Trash2,
//   Check,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   ChevronUp,
//   X,
//   BellOff,
//   Loader2,
//   Package,
//   TrendingUp,
//   Calendar,
//   Home // Remove if you don't need it anymore
// } from "lucide-react";
// import { toast, Toaster } from "react-hot-toast";
// import { useAuth } from "../../../context/AuthContext";
// import { useRouter } from "next/navigation";

// const NOTIFICATION_TYPES = {
//   NEW_ORDER: {
//     label: "New Order",
//     icon: "🛍️",
//     color: "bg-blue-100 text-blue-700 border-blue-200",
//     textColor: "text-blue-700",
//     bgColor: "bg-blue-50",
//     mobileIcon: <Package className="w-5 h-5 text-blue-600" />
//   },
//   PAYMENT_RECEIVED: {
//     label: "Payment Received",
//     icon: "💰",
//     color: "bg-green-100 text-green-700 border-green-200",
//     textColor: "text-green-700",
//     bgColor: "bg-green-50",
//     mobileIcon: <TrendingUp className="w-5 h-5 text-green-600" />
//   },
//   PAYMENT_VERIFIED: {
//     label: "Payment Verified",
//     icon: "✅",
//     color: "bg-emerald-100 text-emerald-700 border-emerald-200",
//     textColor: "text-emerald-700",
//     bgColor: "bg-emerald-50",
//     mobileIcon: <CheckCircle className="w-5 h-5 text-emerald-600" />
//   },
//   LOW_STOCK_ALERT: {
//     label: "Low Stock",
//     icon: "📦",
//     color: "bg-amber-100 text-amber-700 border-amber-200",
//     textColor: "text-amber-700",
//     bgColor: "bg-amber-50",
//     mobileIcon: <AlertCircle className="w-5 h-5 text-amber-600" />
//   },
//   ORDER_STATUS_CHANGED: {
//     label: "Status Update",
//     icon: "📦",
//     color: "bg-purple-100 text-purple-700 border-purple-200",
//     textColor: "text-purple-700",
//     bgColor: "bg-purple-50",
//     mobileIcon: <RefreshCw className="w-5 h-5 text-purple-600" />
//   },
//   SYSTEM_ALERT: {
//     label: "System Alert",
//     icon: "🚨",
//     color: "bg-red-100 text-red-700 border-red-200",
//     textColor: "text-red-700",
//     bgColor: "bg-red-50",
//     mobileIcon: <AlertCircle className="w-5 h-5 text-red-600" />
//   },
//   ADMIN_ALERT: {
//     label: "Admin Alert",
//     icon: "🔔",
//     color: "bg-orange-100 text-orange-700 border-orange-200",
//     textColor: "text-orange-700",
//     bgColor: "bg-orange-50",
//     mobileIcon: <Bell className="w-5 h-5 text-orange-600" />
//   }
// };

// const PRIORITY_COLORS = {
//   low: "bg-gray-100 text-gray-700",
//   normal: "bg-gray-200 text-gray-700",
//   high: "bg-amber-100 text-amber-700",
//   urgent: "bg-red-100 text-red-700"
// };

// export default function NotificationPage() {
//   // State - REMOVED showMobileMenu
//   const [notifications, setNotifications] = useState([]);
//   const [filteredNotifications, setFilteredNotifications] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [selectedNotifications, setSelectedNotifications] = useState(new Set());
//   const [filters, setFilters] = useState({
//     type: "all",
//     status: "all",
//     priority: "all",
//     search: "",
//     dateRange: "all",
//     source: "all"
//   });
//   const [stats, setStats] = useState({
//     total: 0,
//     unread: 0,
//     today: 0,
//     highPriority: 0,
//     urgent: 0
//   });
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 1
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [expandedNotification, setExpandedNotification] = useState(null);

//   const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
//   const router = useRouter();

//   const autoRefreshRef = useRef(null);
//   const lastUpdateRef = useRef(new Date());

//   // Check if mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
    
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Format time
//   const formatTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMins = Math.floor(diffMs / 60000);
//       const diffHours = Math.floor(diffMs / 3600000);
//       const diffDays = Math.floor(diffMs / 86400000);
      
//       if (diffDays > 0) return `${diffDays}d ago`;
//       if (diffHours > 0) return `${diffHours}h ago`;
//       if (diffMins > 0) return `${diffMins}m ago`;
//       return 'Just now';
//     } catch (error) {
//       return "Recently";
//     }
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Fetch notifications
//   const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
//     try {
//       if (showLoading) setIsLoading(true);
//       setIsRefreshing(true);

//       if (!isAuthenticated || !user) {
//         toast.error("Please login to view notifications");
//         setIsLoading(false);
//         setIsRefreshing(false);
//         return;
//       }

//       if (user.role !== 'admin') {
//         toast.error("Admin access required");
//         setIsLoading(false);
//         setIsRefreshing(false);
//         return;
//       }

//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         limit: pagination.limit.toString()
//       });

//       if (filters.type !== "all") queryParams.append("type", filters.type);
//       if (filters.status !== "all") queryParams.append("status", filters.status);
//       if (filters.priority !== "all") queryParams.append("priority", filters.priority);
//       if (filters.search) queryParams.append("search", filters.search);
//       if (filters.dateRange !== "all") {
//         const today = new Date();
//         if (filters.dateRange === "today") {
//           queryParams.append("startDate", today.toISOString().split('T')[0]);
//         } else if (filters.dateRange === "week") {
//           const weekAgo = new Date(today);
//           weekAgo.setDate(today.getDate() - 7);
//           queryParams.append("startDate", weekAgo.toISOString().split('T')[0]);
//         } else if (filters.dateRange === "month") {
//           const monthAgo = new Date(today);
//           monthAgo.setMonth(today.getMonth() - 1);
//           queryParams.append("startDate", monthAgo.toISOString().split('T')[0]);
//         }
//       }

//       const response = await fetch(`/api/notifications?${queryParams}`, {
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         if (response.status === 401) {
//           toast.error("Session expired. Please login again.");
//           logout();
//           router.push('/login');
//           return;
//         }
//         throw new Error(`Failed to fetch notifications: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         setNotifications(data.notifications || []);
//         setFilteredNotifications(data.notifications || []);
//         setPagination(data.pagination || { page, limit: pagination.limit, total: 0, pages: 1 });
//         setStats(data.statistics || { total: 0, unread: 0, highPriority: 0, urgent: 0 });
        
//         const today = new Date().toISOString().split('T')[0];
//         const todayCount = (data.notifications || []).filter(n => 
//           new Date(n.createdAt).toISOString().split('T')[0] === today
//         ).length;
        
//         setStats(prev => ({ ...prev, today: todayCount }));
//         lastUpdateRef.current = new Date();
//       } else {
//         throw new Error(data.message || "Failed to load notifications");
//       }
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//       toast.error(error.message || "Failed to load notifications");
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [filters, pagination.limit, user, isAuthenticated, logout, router]);

//   // Initial fetch
//   useEffect(() => {
//     if (!authLoading && user && isAuthenticated) {
//       fetchNotifications();
      
//       autoRefreshRef.current = setInterval(() => {
//         if (user && isAuthenticated) {
//           fetchNotifications(pagination.page, false);
//         }
//       }, 120000);
//     }

//     return () => {
//       if (autoRefreshRef.current) {
//         clearInterval(autoRefreshRef.current);
//       }
//     };
//   }, [fetchNotifications, authLoading, user, pagination.page, isAuthenticated]);

//   // Apply filters
//   useEffect(() => {
//     if (!notifications.length) return;

//     let filtered = [...notifications];

//     if (filters.type !== "all") {
//       filtered = filtered.filter(n => n.type === filters.type);
//     }

//     if (filters.status !== "all") {
//       filtered = filtered.filter(n => n.status === filters.status);
//     }

//     if (filters.priority !== "all") {
//       filtered = filtered.filter(n => n.priority === filters.priority);
//     }

//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(n =>
//         (n.orderNumber && n.orderNumber.toLowerCase().includes(searchLower)) ||
//         (n.customerName && n.customerName.toLowerCase().includes(searchLower)) ||
//         (n.message && n.message.toLowerCase().includes(searchLower)) ||
//         (n.title && n.title.toLowerCase().includes(searchLower))
//       );
//     }

//     setFilteredNotifications(filtered);
//   }, [notifications, filters]);

//   // Mark as read
//   const markAsRead = useCallback(async (notificationId) => {
//     try {
//       const response = await fetch(`/api/notifications?id=${notificationId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ markAsRead: true }),
//         credentials: 'include'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setNotifications(prev => prev.map(n =>
//             n.id === notificationId ? { ...n, status: "read" } : n
//           ));
          
//           setStats(prev => ({
//             ...prev,
//             unread: Math.max(0, prev.unread - 1)
//           }));
          
//           setSelectedNotifications(prev => {
//             const next = new Set(prev);
//             next.delete(notificationId);
//             return next;
//           });

//           toast.success("Marked as read");
//         }
//       }
//     } catch (error) {
//       console.error("Error marking as read:", error);
//       toast.error("Failed to mark as read");
//     }
//   }, []);

//   // Mark all as read
//   const markAllAsRead = useCallback(async () => {
//     try {
//       const unreadNotifications = notifications.filter(n => n.status === "pending");
//       if (unreadNotifications.length === 0) {
//         toast.success("All notifications are already read");
//         return;
//       }

//       const promises = unreadNotifications.map(n => markAsRead(n.id));
//       await Promise.all(promises);
      
//       toast.success(`Marked ${unreadNotifications.length} notifications as read`);
//     } catch (error) {
//       console.error("Error marking all as read:", error);
//       toast.error("Failed to mark all as read");
//     }
//   }, [notifications, markAsRead]);

//   // Delete notification
//   const deleteNotification = useCallback(async (notificationId) => {
//     try {
//       const response = await fetch(`/api/notifications?id=${notificationId}`, {
//         method: "DELETE",
//         credentials: 'include'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setNotifications(prev => prev.filter(n => n.id !== notificationId));
          
//           setSelectedNotifications(prev => {
//             const next = new Set(prev);
//             next.delete(notificationId);
//             return next;
//           });

//           toast.success("Notification deleted");
//           fetchNotifications(pagination.page, false);
//         }
//       }
//     } catch (error) {
//       console.error("Error deleting notification:", error);
//       toast.error("Failed to delete notification");
//     }
//   }, [fetchNotifications, pagination.page]);

//   // Delete selected
//   const deleteSelected = useCallback(async () => {
//     if (selectedNotifications.size === 0) {
//       toast.error("No notifications selected");
//       return;
//     }

//     if (!confirm(`Are you sure you want to delete ${selectedNotifications.size} notification(s)?`)) {
//       return;
//     }

//     try {
//       const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
//       await Promise.all(promises);
      
//       setSelectedNotifications(new Set());
//       toast.success(`Deleted ${selectedNotifications.size} notification(s)`);
//     } catch (error) {
//       console.error("Error deleting selected:", error);
//       toast.error("Failed to delete selected notifications");
//     }
//   }, [selectedNotifications, deleteNotification]);

//   // Toggle selection
//   const toggleSelection = useCallback((notificationId) => {
//     setSelectedNotifications(prev => {
//       const next = new Set(prev);
//       if (next.has(notificationId)) {
//         next.delete(notificationId);
//       } else {
//         next.add(notificationId);
//       }
//       return next;
//     });
//   }, []);

//   // Select all visible
//   const selectAllVisible = useCallback(() => {
//     if (selectedNotifications.size === filteredNotifications.length) {
//       setSelectedNotifications(new Set());
//     } else {
//       const allIds = filteredNotifications.map(n => n.id);
//       setSelectedNotifications(new Set(allIds));
//     }
//   }, [filteredNotifications, selectedNotifications.size]);

//   // Get notification type config
//   const getNotificationConfig = (type) => {
//     return NOTIFICATION_TYPES[type] || {
//       label: type,
//       icon: "🔔",
//       color: "bg-gray-100 text-gray-700 border-gray-200",
//       textColor: "text-gray-700",
//       bgColor: "bg-gray-50",
//       mobileIcon: <Bell className="w-5 h-5 text-gray-600" />
//     };
//   };

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.pages) {
//       setPagination(prev => ({ ...prev, page: newPage }));
//       fetchNotifications(newPage);
//     }
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setFilters({
//       type: "all",
//       status: "all",
//       priority: "all",
//       search: "",
//       dateRange: "all",
//       source: "all"
//     });
//     setShowFilters(false);
//     setShowMobileFilters(false);
//   };

//   // Toggle notification expansion
//   const toggleNotificationExpansion = (notificationId) => {
//     setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
//   };

//   // Mobile Filters Panel
//   const MobileFiltersPanel = () => (
//     <AnimatePresence>
//       {isMobile && showMobileFilters && (
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           className="fixed inset-0 z-50 bg-white"
//         >
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-900">Filters</h2>
//               <button
//                 onClick={() => setShowMobileFilters(false)}
//                 className="p-2"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
          
//           <div className="p-4 space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Type
//               </label>
//               <div className="grid grid-cols-2 gap-2">
//                 <button
//                   onClick={() => setFilters(prev => ({ ...prev, type: "all" }))}
//                   className={`px-4 py-3 rounded-xl text-sm font-medium ${
//                     filters.type === "all" 
//                       ? "bg-blue-600 text-white" 
//                       : "bg-gray-100 text-gray-700"
//                   }`}
//                 >
//                   All Types
//                 </button>
//                 {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
//                   <button
//                     key={key}
//                     onClick={() => setFilters(prev => ({ ...prev, type: key }))}
//                     className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
//                       filters.type === key 
//                         ? `${config.color.replace('text-', '')} border` 
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {config.mobileIcon}
//                     <span className="truncate">{config.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status
//               </label>
//               <div className="flex gap-2 overflow-x-auto pb-2">
//                 {["all", "pending", "read", "delivered"].map((status) => (
//                   <button
//                     key={status}
//                     onClick={() => setFilters(prev => ({ ...prev, status }))}
//                     className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
//                       filters.status === status 
//                         ? "bg-blue-600 text-white" 
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Priority
//               </label>
//               <div className="grid grid-cols-4 gap-2">
//                 {["all", "low", "normal", "high", "urgent"].map((priority) => (
//                   <button
//                     key={priority}
//                     onClick={() => setFilters(prev => ({ ...prev, priority }))}
//                     className={`px-3 py-2 rounded-lg text-xs font-medium text-center ${
//                       filters.priority === priority 
//                         ? priority === "all" 
//                           ? "bg-blue-600 text-white"
//                           : PRIORITY_COLORS[priority]
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {priority === "all" ? "All" : priority}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date Range
//               </label>
//               <div className="grid grid-cols-2 gap-2">
//                 {["all", "today", "week", "month"].map((range) => (
//                   <button
//                     key={range}
//                     onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
//                     className={`px-4 py-3 rounded-xl text-sm font-medium ${
//                       filters.dateRange === range 
//                         ? "bg-blue-600 text-white" 
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {range === "all" ? "All Time" : 
//                      range === "today" ? "Today" : 
//                      range === "week" ? "Last 7 Days" : "Last 30 Days"}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={clearFilters}
//                 className="py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
//               >
//                 Clear All
//               </button>
//               <button
//                 onClick={() => setShowMobileFilters(false)}
//                 className="py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );

//   // Redirect if not authenticated
//   if (authLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//           <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//         <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
//           <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <AlertCircle className="w-10 h-10 text-red-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
//           <p className="text-gray-600 mb-8">Please login to access notifications</p>
//           <button
//             onClick={() => router.push('/login')}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (user.role !== 'admin') {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//         <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
//           <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <AlertCircle className="w-10 h-10 text-amber-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-3">Admin Access Required</h2>
//           <p className="text-gray-600 mb-8">This page is only accessible to admin users</p>
//           <button
//             onClick={() => router.push('/admin/dashboards')}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster 
//         position={isMobile ? "top-center" : "top-right"}
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//             borderRadius: '10px',
//             fontSize: '14px',
//             padding: '12px 16px',
//           },
//         }}
//       />
      
//       {/* Mobile Header */}
//       {isMobile && (
//         <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between p-4">
//             <div className="flex items-center gap-3">
//               <div>
//                 <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <BellRing className="w-5 h-5 text-blue-600" />
//                   Notifications
//                 </h1>
//                 <p className="text-xs text-gray-500">
//                   {stats.unread} unread • {stats.today} today
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => fetchNotifications(pagination.page, false)}
//                 disabled={isRefreshing}
//                 className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
//               >
//                 <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
//               </button>
//               <button
//                 onClick={markAllAsRead}
//                 disabled={stats.unread === 0}
//                 className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
//               >
//                 <Check className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Mobile Search */}
//           <div className="px-4 pb-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search notifications..."
//                 value={filters.search}
//                 onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               <button
//                 onClick={() => setShowMobileFilters(!showMobileFilters)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
//               >
//                 <Filter className="w-4 h-4 text-gray-400" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isMobile ? 'pt-0' : 'p-4 md:p-6'}`}>
//         {/* Mobile Filters Panel */}
//         <MobileFiltersPanel />

//         {/* Desktop Header */}
//         {!isMobile && (
//           <>
//             {/* Header */}
//             <div className="mb-8">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
//                 <div>
//                   <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-4">
//                     <div className="relative">
//                       <BellRing className="w-10 h-10 text-blue-600" />
//                       {stats.unread > 0 && (
//                         <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                           {stats.unread > 9 ? '9+' : stats.unread}
//                         </span>
//                       )}
//                     </div>
//                     Notifications
//                     {user && (
//                       <span className="text-base font-normal text-gray-500 hidden md:inline">
//                         • Welcome, {user.name || user.email}
//                       </span>
//                     )}
//                   </h1>
//                   <p className="text-gray-600 mt-2 text-lg">Manage and monitor all system notifications</p>
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={() => fetchNotifications(pagination.page, false)}
//                     disabled={isRefreshing}
//                     className="px-5 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-3 disabled:opacity-50"
//                   >
//                     <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
//                     <span className="font-medium">Refresh</span>
//                   </button>
                  
//                   <button
//                     onClick={markAllAsRead}
//                     disabled={stats.unread === 0}
//                     className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3 disabled:opacity-50"
//                   >
//                     <CheckCircle className="w-5 h-5" />
//                     <span className="font-medium">Mark All Read</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">Total Notifications</p>
//                       <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                       <Bell className="w-6 h-6 text-blue-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full bg-blue-500 rounded-full" 
//                       style={{ width: `${Math.min((stats.total / 100) * 100, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">Unread</p>
//                       <p className="text-3xl font-bold text-amber-600">{stats.unread}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
//                       <Bell className="w-6 h-6 text-amber-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4 text-sm">
//                     <span className="text-gray-500">Priority:</span>
//                     <span className="ml-2 font-medium">
//                       {stats.highPriority} high • {stats.urgent} urgent
//                     </span>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">Today</p>
//                       <p className="text-3xl font-bold text-green-600">{stats.today}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                       <Calendar className="w-6 h-6 text-green-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4 text-sm text-gray-500">
//                     Updated: {lastUpdateRef.current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">High Priority</p>
//                       <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
//                       <AlertCircle className="w-6 h-6 text-red-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4">
//                     <span className={`px-3 py-1 text-sm font-medium rounded-full ${PRIORITY_COLORS.urgent}`}>
//                       {stats.urgent} urgent
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Desktop Filter Panel */}
//         {!isMobile && (
//           <div className="mb-6">
//             <div className="flex items-center gap-4 mb-4">
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm hover:shadow"
//               >
//                 <Filter className="w-5 h-5" />
//                 <span className="font-medium">Filters</span>
//                 {Object.values(filters).some(v => v !== "all" && v !== "") && (
//                   <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                 )}
//                 <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
//               </button>

//               {selectedNotifications.size > 0 && (
//                 <button
//                   onClick={deleteSelected}
//                   className="px-4 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all flex items-center gap-3 shadow-sm hover:shadow"
//                 >
//                   <Trash2 className="w-5 h-5" />
//                   <span className="font-medium">
//                     Delete Selected ({selectedNotifications.size})
//                   </span>
//                 </button>
//               )}

//               <div className="ml-auto flex items-center gap-4">
//                 <div className="text-sm text-gray-500">
//                   <span className="font-medium">{pagination.total}</span> total notifications
//                 </div>
//                 <select
//                   value={pagination.limit}
//                   onChange={(e) => {
//                     setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
//                     fetchNotifications(1);
//                   }}
//                   className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="10">10 per page</option>
//                   <option value="20">20 per page</option>
//                   <option value="50">50 per page</option>
//                   <option value="100">100 per page</option>
//                 </select>
//               </div>
//             </div>

//             <AnimatePresence>
//               {showFilters && (
//                 <motion.div
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Type
//                       </label>
//                       <select
//                         value={filters.type}
//                         onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="all">All Types</option>
//                         {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
//                           <option key={key} value={key}>
//                             {config.icon} {config.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Status
//                       </label>
//                       <select
//                         value={filters.status}
//                         onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="all">All Status</option>
//                         <option value="pending">Pending</option>
//                         <option value="read">Read</option>
//                         <option value="delivered">Delivered</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Priority
//                       </label>
//                       <select
//                         value={filters.priority}
//                         onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="all">All Priorities</option>
//                         <option value="low">Low</option>
//                         <option value="normal">Normal</option>
//                         <option value="high">High</option>
//                         <option value="urgent">Urgent</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Date Range
//                       </label>
//                       <select
//                         value={filters.dateRange}
//                         onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="all">All Time</option>
//                         <option value="today">Today</option>
//                         <option value="week">Last 7 Days</option>
//                         <option value="month">Last 30 Days</option>
//                       </select>
//                     </div>

//                     <div className="md:col-span-2 flex items-end gap-4">
//                       <button
//                         onClick={clearFilters}
//                         className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
//                       >
//                         Clear Filters
//                       </button>
//                       <button
//                         onClick={() => setShowFilters(false)}
//                         className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
//                       >
//                         Apply Filters
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         )}

//         {/* Main Content */}
//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//           {/* Desktop Search */}
//           {!isMobile && (
//             <div className="p-6 border-b border-gray-200">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search notifications by order number, customer name, or message..."
//                   value={filters.search}
//                   onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                   className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Notifications List */}
//           {isLoading ? (
//             <div className="flex items-center justify-center p-12 md:p-16">
//               <div className="text-center">
//                 <div className="relative inline-block">
//                   <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
//                   <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                 </div>
//                 <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
//                 <p className="mt-2 text-sm text-gray-500">Fetching your latest updates</p>
//               </div>
//             </div>
//           ) : filteredNotifications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-12 md:p-16 text-center">
//               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
//                 <BellOff className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">No notifications found</h3>
//               <p className="text-gray-500 max-w-md mb-6">
//                 {filters.search || filters.type !== "all" || filters.status !== "all"
//                   ? "No notifications match your current filters. Try adjusting your search criteria."
//                   : "You're all caught up! No new notifications at the moment."}
//               </p>
//               {(filters.search || filters.type !== "all" || filters.status !== "all") && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   Clear all filters to see notifications
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Mobile Selection Header */}
//               {isMobile && selectedNotifications.size > 0 && (
//                 <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <Check className="w-5 h-5 text-blue-600" />
//                       <span className="font-medium text-blue-700">
//                         {selectedNotifications.size} selected
//                       </span>
//                     </div>
//                     <button
//                       onClick={deleteSelected}
//                       className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               )}

//               <div className="divide-y divide-gray-200">
//                 {filteredNotifications.map((notification) => {
//                   const config = getNotificationConfig(notification.type);
//                   const isSelected = selectedNotifications.has(notification.id);
//                   const isUnread = notification.status === "pending";
//                   const isExpanded = expandedNotification === notification.id;

//                   return (
//                     <motion.div
//                       key={notification.id}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className={`p-4 md:p-6 hover:bg-gray-50 transition-colors ${isUnread ? "bg-blue-50/50" : ""}`}
//                     >
//                       <div className="flex items-start gap-4">
//                         {/* Selection Checkbox - Desktop */}
//                         {!isMobile && (
//                           <div className="flex-shrink-0 pt-1">
//                             <input
//                               type="checkbox"
//                               checked={isSelected}
//                               onChange={() => toggleSelection(notification.id)}
//                               className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                             />
//                           </div>
//                         )}

//                         {/* Notification Icon */}
//                         <div className={`flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl flex items-center justify-center ${config.color} border`}>
//                           {isMobile ? config.mobileIcon : <span className="text-2xl">{config.icon}</span>}
//                         </div>

//                         {/* Content */}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
//                             <div className="flex items-start gap-2 flex-1">
//                               {/* Selection Checkbox - Mobile */}
//                               {isMobile && (
//                                 <input
//                                   type="checkbox"
//                                   checked={isSelected}
//                                   onChange={() => toggleSelection(notification.id)}
//                                   className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                                 />
//                               )}
                              
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <h4 className="font-bold text-gray-900 text-base md:text-lg">
//                                     {notification.title}
//                                   </h4>
//                                   {isUnread && (
//                                     <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
//                                   )}
//                                 </div>
                                
//                                 <p className="text-gray-600 text-sm md:text-base line-clamp-2">
//                                   {notification.message}
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-3 mt-2 md:mt-0">
//                               <span className={`px-3 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
//                                 {notification.priority}
//                               </span>
//                               <span className="text-xs text-gray-500 whitespace-nowrap">
//                                 {isMobile ? formatTime(notification.createdAt) : formatDate(notification.createdAt)}
//                               </span>
//                               {isMobile && (
//                                 <button
//                                   onClick={() => toggleNotificationExpansion(notification.id)}
//                                   className="p-1"
//                                 >
//                                   <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
//                                 </button>
//                               )}
//                             </div>
//                           </div>

//                           {/* Metadata - Always visible on desktop, expandable on mobile */}
//                           {(isMobile ? isExpanded : true) && (
//                             <div className="mt-3 md:mt-4">
//                               {/* Order Details */}
//                               {(notification.orderNumber || notification.customerName || notification.totalAmount) && (
//                                 <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
//                                   {notification.orderNumber && (
//                                     <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
//                                       <span className="font-medium">Order:</span>
//                                       <span className="font-bold text-gray-900">#{notification.orderNumber}</span>
//                                     </span>
//                                   )}
//                                   {notification.customerName && (
//                                     <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
//                                       <span className="font-medium">Customer:</span>
//                                       <span className="font-bold text-gray-900">{notification.customerName}</span>
//                                     </span>
//                                   )}
//                                   {notification.totalAmount && (
//                                     <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-lg text-green-700">
//                                       <span className="font-medium">Amount:</span>
//                                       <span className="font-bold">₹{notification.totalAmount}</span>
//                                     </span>
//                                   )}
//                                 </div>
//                               )}

//                               {/* Actions */}
//                               <div className="flex flex-wrap items-center gap-2 mt-4">
//                                 {isUnread && (
//                                   <button
//                                     onClick={() => markAsRead(notification.id)}
//                                     className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
//                                   >
//                                     <CheckCircle className="w-4 h-4" />
//                                     Mark as Read
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => deleteNotification(notification.id)}
//                                   className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-red-600 hover:text-red-700"
//                                 >
//                                   <Trash2 className="w-4 h-4" />
//                                   Delete
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>

//               {/* Pagination */}
//               {pagination.pages > 1 && (
//                 <div className={`border-t border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
//                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                     <div className="text-sm text-gray-500">
//                       Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
//                       {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
//                       {pagination.total} notifications
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handlePageChange(pagination.page - 1)}
//                         disabled={pagination.page === 1}
//                         className={`${isMobile ? 'p-2' : 'p-2.5'} border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
//                       >
//                         <ChevronLeft className="w-4 h-4" />
//                       </button>
                      
//                       {/* Mobile pagination - simple */}
//                       {isMobile ? (
//                         <>
//                           <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium">
//                             {pagination.page}
//                           </span>
//                           <span className="text-gray-500">of {pagination.pages}</span>
//                         </>
//                       ) : (
//                         // Desktop pagination - full
//                         Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
//                           let pageNum;
//                           if (pagination.pages <= 5) {
//                             pageNum = i + 1;
//                           } else if (pagination.page <= 3) {
//                             pageNum = i + 1;
//                           } else if (pagination.page >= pagination.pages - 2) {
//                             pageNum = pagination.pages - 4 + i;
//                           } else {
//                             pageNum = pagination.page - 2 + i;
//                           }
                          
//                           return (
//                             <button
//                               key={pageNum}
//                               onClick={() => handlePageChange(pageNum)}
//                               className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium ${
//                                 pagination.page === pageNum
//                                   ? "bg-blue-600 text-white"
//                                   : "border border-gray-300 hover:bg-gray-50"
//                               }`}
//                             >
//                               {pageNum}
//                             </button>
//                           );
//                         })
//                       )}
                      
//                       <button
//                         onClick={() => handlePageChange(pagination.page + 1)}
//                         disabled={pagination.page === pagination.pages}
//                         className={`${isMobile ? 'p-2' : 'p-2.5'} border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
//                       >
//                         <ChevronRight className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Auto-refresh indicator */}
//         {!isLoading && !isMobile && (
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-500">
//               Auto-refreshes every 2 minutes • Last updated: {lastUpdateRef.current.toLocaleTimeString()}
//             </p>
//           </div>
//         )}

//         {/* Mobile Bottom Navigation - UPDATED */}
//         {isMobile && !showMobileFilters && (
//           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
//             <div className="flex items-center justify-around p-3">
//               <button
//                 onClick={() => setShowMobileFilters(true)}
//                 className="flex flex-col items-center p-2 text-gray-500"
//               >
//                 <Filter className="w-5 h-5" />
//                 <span className="text-xs mt-1">Filters</span>
//               </button>
//               <button
//                 onClick={() => fetchNotifications(pagination.page, false)}
//                 disabled={isRefreshing}
//                 className="flex flex-col items-center p-2 text-gray-500"
//               >
//                 <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
//                 <span className="text-xs mt-1">Refresh</span>
//               </button>
//               <button
//                 onClick={markAllAsRead}
//                 disabled={stats.unread === 0}
//                 className="flex flex-col items-center p-2 text-blue-600"
//               >
//                 <CheckCircle className="w-5 h-5" />
//                 <span className="text-xs mt-1">Mark All</span>
//               </button>
//               {filters.search || filters.type !== "all" || filters.status !== "all" ? (
//                 <button
//                   onClick={clearFilters}
//                   className="flex flex-col items-center p-2 text-gray-500"
//                 >
//                   <X className="w-5 h-5" />
//                   <span className="text-xs mt-1">Clear</span>
//                 </button>
//               ) : (
//                 <div className="flex flex-col items-center p-2 opacity-50">
//                   <Bell className="w-5 h-5" />
//                   <span className="text-xs mt-1">Alerts</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Add padding for mobile bottom nav */}
//         {isMobile && <div className="h-16"></div>}
//       </div>

//       <style jsx global>{`
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
        
//         @keyframes pulse-subtle {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.8; }
//         }
        
//         .animate-pulse-subtle {
//           animation: pulse-subtle 2s ease-in-out infinite;
//         }
        
//         /* Hide scrollbar for Chrome, Safari and Opera */
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
        
//         /* Hide scrollbar for IE, Edge and Firefox */
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
        
//         /* Custom scrollbar for desktop */
//         @media (min-width: 768px) {
//           ::-webkit-scrollbar {
//             width: 8px;
//             height: 8px;
//           }
          
//           ::-webkit-scrollbar-track {
//             background: #f1f1f1;
//             border-radius: 4px;
//           }
          
//           ::-webkit-scrollbar-thumb {
//             background: #888;
//             border-radius: 4px;
//           }
          
//           ::-webkit-scrollbar-thumb:hover {
//             background: #555;
//           }
//         }
//       `}</style>
//     </>
//   );
// }





























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
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  BellOff,
  Loader2,
  Package,
  TrendingUp,
  Calendar,
  Home,
  ShoppingCart,
  CreditCard,
  Shield,
  Zap,
  Megaphone,
  MoreHorizontal,
  Eye,
  EyeOff,
  Download,
  Printer,
  Star,
  DollarSign,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Clock3,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Settings,
  HelpCircle,
  Building,
  Send,
  Copy,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Gift,
  Award,
  Target,
  Flag,
  Layers,
  Grid,
  List,
  Menu,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

// ==================== CONSTANTS ====================

const NOTIFICATION_TYPES = {
  NEW_ORDER: {
    label: "New Order",
    icon: "🛍️",
    lucideIcon: ShoppingCart,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    gradient: "from-blue-500 to-blue-600",
    lightGradient: "from-blue-400 to-blue-500",
    animation: "bounce",
    mobileIcon: <ShoppingCart className="w-5 h-5 text-blue-600" />
  },
  PAYMENT_RECEIVED: {
    label: "Payment Received",
    icon: "💰",
    lucideIcon: DollarSign,
    color: "bg-green-100 text-green-700 border-green-200",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100",
    gradient: "from-green-500 to-green-600",
    lightGradient: "from-green-400 to-green-500",
    animation: "pulse",
    mobileIcon: <DollarSign className="w-5 h-5 text-green-600" />
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    icon: "✅",
    lucideIcon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    hoverColor: "hover:bg-emerald-100",
    gradient: "from-emerald-500 to-emerald-600",
    lightGradient: "from-emerald-400 to-emerald-500",
    animation: "pulse",
    mobileIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
  },
  LOW_STOCK_ALERT: {
    label: "Low Stock",
    icon: "📦",
    lucideIcon: Package,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    hoverColor: "hover:bg-amber-100",
    gradient: "from-amber-500 to-amber-600",
    lightGradient: "from-amber-400 to-amber-500",
    animation: "shake",
    mobileIcon: <Package className="w-5 h-5 text-amber-600" />
  },
  ORDER_STATUS_CHANGED: {
    label: "Status Update",
    icon: "🔄",
    lucideIcon: RefreshCw,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    gradient: "from-purple-500 to-purple-600",
    lightGradient: "from-purple-400 to-purple-500",
    animation: "spin",
    mobileIcon: <RefreshCw className="w-5 h-5 text-purple-600" />
  },
  SYSTEM_ALERT: {
    label: "System Alert",
    icon: "🚨",
    lucideIcon: AlertTriangle,
    color: "bg-red-100 text-red-700 border-red-200",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    hoverColor: "hover:bg-red-100",
    gradient: "from-red-500 to-red-600",
    lightGradient: "from-red-400 to-red-500",
    animation: "pulse",
    mobileIcon: <AlertTriangle className="w-5 h-5 text-red-600" />
  },
  ADMIN_ALERT: {
    label: "Admin Alert",
    icon: "🔔",
    lucideIcon: Megaphone,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
    gradient: "from-orange-500 to-orange-600",
    lightGradient: "from-orange-400 to-orange-500",
    animation: "ring",
    mobileIcon: <Megaphone className="w-5 h-5 text-orange-600" />
  },
  TEST_NOTIFICATION: {
    label: "Test",
    icon: "🧪",
    lucideIcon: Zap,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    hoverColor: "hover:bg-gray-100",
    gradient: "from-gray-500 to-gray-600",
    lightGradient: "from-gray-400 to-gray-500",
    animation: "pulse",
    mobileIcon: <Zap className="w-5 h-5 text-gray-600" />
  },
  BOOKING_CONFIRMED: {
    label: "Booking Confirmed",
    icon: "📅",
    lucideIcon: Calendar,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-50",
    hoverColor: "hover:bg-indigo-100",
    gradient: "from-indigo-500 to-indigo-600",
    lightGradient: "from-indigo-400 to-indigo-500",
    animation: "bounce",
    mobileIcon: <Calendar className="w-5 h-5 text-indigo-600" />
  },
  USER_REGISTERED: {
    label: "New User",
    icon: "👤",
    lucideIcon: Users,
    color: "bg-teal-100 text-teal-700 border-teal-200",
    textColor: "text-teal-700",
    bgColor: "bg-teal-50",
    hoverColor: "hover:bg-teal-100",
    gradient: "from-teal-500 to-teal-600",
    lightGradient: "from-teal-400 to-teal-500",
    animation: "bounce",
    mobileIcon: <Users className="w-5 h-5 text-teal-600" />
  },
  WHATSAPP_DISCONNECTED: {
    label: "WhatsApp Disconnected",
    icon: "📱",
    lucideIcon: MessageSquare,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    textColor: "text-pink-700",
    bgColor: "bg-pink-50",
    hoverColor: "hover:bg-pink-100",
    gradient: "from-pink-500 to-pink-600",
    lightGradient: "from-pink-400 to-pink-500",
    animation: "shake",
    mobileIcon: <MessageSquare className="w-5 h-5 text-pink-600" />
  },
  SUBSCRIPTION_EXPIRING: {
    label: "Subscription Expiring",
    icon: "⚠️",
    lucideIcon: Clock3,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    hoverColor: "hover:bg-yellow-100",
    gradient: "from-yellow-500 to-yellow-600",
    lightGradient: "from-yellow-400 to-yellow-500",
    animation: "pulse",
    mobileIcon: <Clock3 className="w-5 h-5 text-yellow-600" />
  },
  LIMIT_REACHED: {
    label: "Limit Reached",
    icon: "🚫",
    lucideIcon: XCircle,
    color: "bg-rose-100 text-rose-700 border-rose-200",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    hoverColor: "hover:bg-rose-100",
    gradient: "from-rose-500 to-rose-600",
    lightGradient: "from-rose-400 to-rose-500",
    animation: "shake",
    mobileIcon: <XCircle className="w-5 h-5 text-rose-600" />
  }
};

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: <Bell className="w-3 h-3" />,
    dotColor: "bg-gray-500",
    gradient: "from-gray-400 to-gray-500"
  },
  normal: {
    label: "Normal",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Info className="w-3 h-3" />,
    dotColor: "bg-blue-500",
    gradient: "from-blue-400 to-blue-500"
  },
  high: {
    label: "High",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <AlertCircle className="w-3 h-3" />,
    dotColor: "bg-amber-500",
    gradient: "from-amber-400 to-amber-500"
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-700 border-red-200 animate-pulse",
    icon: <AlertTriangle className="w-3 h-3" />,
    dotColor: "bg-red-500",
    gradient: "from-red-400 to-red-500"
  }
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700",
    dotColor: "bg-yellow-500",
    borderColor: "border-yellow-200"
  },
  sent: {
    label: "Sent",
    icon: Send,
    color: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-500",
    borderColor: "border-blue-200"
  },
  delivered: {
    label: "Delivered",
    icon: Check,
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
    borderColor: "border-green-200"
  },
  read: {
    label: "Read",
    icon: Eye,
    color: "bg-gray-100 text-gray-700",
    dotColor: "bg-gray-500",
    borderColor: "border-gray-200"
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
    dotColor: "bg-red-500",
    borderColor: "border-red-200"
  }
};

// ==================== COMPONENT ====================

export default function NotificationPage() {
  // ===== State =====
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
    urgent: 0,
    byType: {},
    byPriority: {},
    byStatus: {}
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list, grid, compact
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState("");

  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const autoRefreshRef = useRef(null);
  const lastUpdateRef = useRef(new Date());
  const abortControllerRef = useRef(null);
  const notificationSoundRef = useRef(null);

  // ===== Check if mobile =====
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ===== Initialize sound =====
  useEffect(() => {
    if (typeof window !== 'undefined') {
      notificationSoundRef.current = new Audio('/sounds/notification.mp3');
    }
    
    const savedSoundPref = localStorage.getItem('notification_sound_enabled');
    if (savedSoundPref) {
      setSoundEnabled(savedSoundPref === 'true');
    }
  }, []);

  // ===== Helper Functions =====
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      return 'Just now';
    } catch (error) {
      return "Recently";
    }
  };

  // ===== Play notification sound =====
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  // ===== Toggle sound =====
  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notification_sound_enabled', newValue.toString());
    
    if (newValue) {
      playNotificationSound();
    }
  }, [soundEnabled, playNotificationSound]);

  // ===== Get notification type config =====
  const getNotificationConfig = (type) => {
    return NOTIFICATION_TYPES[type] || {
      label: type?.replace(/_/g, ' ') || 'Notification',
      icon: "🔔",
      lucideIcon: Bell,
      color: "bg-gray-100 text-gray-700 border-gray-200",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
      hoverColor: "hover:bg-gray-100",
      gradient: "from-gray-500 to-gray-600",
      lightGradient: "from-gray-400 to-gray-500",
      animation: "pulse",
      mobileIcon: <Bell className="w-5 h-5 text-gray-600" />
    };
  };

  // ===== Fetch notifications with companyId =====
  const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);

      // Check authentication
      if (!isAuthenticated || !user) {
        toast.error("Please login to view notifications");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Check admin role
      if (user.role !== 'admin') {
        toast.error("Admin access required");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // ✅ Get companyId from user object (multiple possible paths)
      const companyId = user.companyId || user.company_id || user.company?.id || user.company?.companyId;
      
      if (!companyId) {
        console.error("❌ No companyId found in user:", user);
        toast.error("Company information missing. Please contact support.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Build query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      });

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

      console.log(`📡 Fetching notifications for company: ${companyId}`);

      // ✅ Add companyId to headers for SaaS isolation
      const response = await fetch(`/api/notifications?${queryParams}`, {
        signal: abortControllerRef.current.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId // ✅ Critical for multi-tenancy
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          logout();
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          toast.error("You don't have permission to view these notifications");
          return;
        }
        if (response.status === 404) {
          toast.error("Company not found. Please contact support.");
          return;
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
        setFilteredNotifications(data.notifications || []);
        setPagination(data.pagination || { 
          page, 
          limit: pagination.limit, 
          total: 0, 
          pages: 1 
        });
        
        // Update stats with data from API
        const newStats = {
          total: data.statistics?.total || 0,
          unread: data.statistics?.unread || 0,
          highPriority: data.statistics?.high || 0,
          urgent: data.statistics?.urgent || 0,
          byType: data.statistics?.byType || {},
          byPriority: data.statistics?.byPriority || {},
          byStatus: data.statistics?.byStatus || {}
        };
        
        // Calculate today's count
        const today = new Date().toISOString().split('T')[0];
        const todayCount = (data.notifications || []).filter(n => 
          new Date(n.createdAt).toISOString().split('T')[0] === today
        ).length;
        
        newStats.today = todayCount;
        setStats(newStats);
        
        lastUpdateRef.current = new Date();
        
        console.log(`✅ Fetched ${data.notifications?.length || 0} notifications`);
      } else {
        throw new Error(data.message || "Failed to load notifications");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      console.error("Error fetching notifications:", error);
      toast.error(error.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [filters, pagination.limit, sortBy, sortOrder, user, isAuthenticated, logout, router]);

  // ===== Initial fetch =====
  useEffect(() => {
    if (!authLoading && user && isAuthenticated) {
      fetchNotifications();
      
      // Auto refresh every 2 minutes if enabled
      if (autoRefresh) {
        autoRefreshRef.current = setInterval(() => {
          if (user && isAuthenticated) {
            fetchNotifications(pagination.page, false);
          }
        }, 120000);
      }
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNotifications, authLoading, user, pagination.page, isAuthenticated, autoRefresh]);

  // ===== Apply client-side filters =====
  useEffect(() => {
    if (!notifications.length) return;

    let filtered = [...notifications];

    if (filters.type !== "all") {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(n => n.status === filters.status);
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(n =>
        (n.orderNumber && n.orderNumber.toLowerCase().includes(searchLower)) ||
        (n.customerName && n.customerName.toLowerCase().includes(searchLower)) ||
        (n.message && n.message.toLowerCase().includes(searchLower)) ||
        (n.title && n.title.toLowerCase().includes(searchLower)) ||
        (n.customerPhone && n.customerPhone.includes(searchLower)) ||
        (n.customerEmail && n.customerEmail.toLowerCase().includes(searchLower))
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filters]);

  // ===== Mark as read =====
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const companyId = user?.companyId || user?.company_id || user?.company?.id;
      
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId
        },
        body: JSON.stringify({ markAsRead: true }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, status: "read", readAt: new Date().toISOString() } : n
          ));
          
          setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1)
          }));
          
          setSelectedNotifications(prev => {
            const next = new Set(prev);
            next.delete(notificationId);
            return next;
          });

          toast.success("Marked as read", {
            icon: '👁️',
            duration: 2000
          });
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  }, [user]);

  // ===== Mark all as read =====
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status !== "read");
      if (unreadNotifications.length === 0) {
        toast.success("All notifications are already read", {
          icon: '✅'
        });
        return;
      }

      const companyId = user?.companyId || user?.company_id || user?.company?.id;
      
      const response = await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId
        },
        body: JSON.stringify({ markAllAsRead: true }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(prev => prev.map(n => ({
          ...n,
          status: "read",
          readAt: new Date().toISOString()
        })));
        
        setStats(prev => ({
          ...prev,
          unread: 0
        }));
        
        toast.success(`Marked ${data.modifiedCount || unreadNotifications.length} notifications as read`, {
          icon: '✅'
        });
        
        // Play sound if enabled
        playNotificationSound();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  }, [notifications, user, playNotificationSound]);

  // ===== Delete notification =====
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const companyId = user?.companyId || user?.company_id || user?.company?.id;
      
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          "x-company-id": companyId
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
          
          setSelectedNotifications(prev => {
            const next = new Set(prev);
            next.delete(notificationId);
            return next;
          });

          toast.success("Notification deleted", {
            icon: '🗑️'
          });
          
          // Refresh to update stats
          fetchNotifications(pagination.page, false);
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  }, [fetchNotifications, pagination.page, user]);

  // ===== Delete selected =====
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

  // ===== Bulk action =====
  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedNotifications.size === 0) return;

    if (bulkAction === 'markAsRead') {
      const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
      await Promise.all(promises);
      toast.success(`Marked ${selectedNotifications.size} notifications as read`);
    } else if (bulkAction === 'delete') {
      await deleteSelected();
    }

    setBulkAction("");
    setShowBulkActions(false);
  }, [bulkAction, selectedNotifications, markAsRead, deleteSelected]);

  // ===== Toggle selection =====
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

  // ===== Select all visible =====
  const selectAllVisible = useCallback(() => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      const allIds = filteredNotifications.map(n => n.id);
      setSelectedNotifications(new Set(allIds));
    }
  }, [filteredNotifications, selectedNotifications.size]);

  // ===== Handle page change =====
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchNotifications(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ===== Clear all filters =====
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
    setShowMobileFilters(false);
    
    // Reset to first page
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchNotifications(1);
    } else {
      fetchNotifications(1);
    }
  };

  // ===== Toggle notification expansion =====
  const toggleNotificationExpansion = (notificationId) => {
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
  };

  // ===== Toggle sort =====
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    fetchNotifications(1);
  };

  // ===== Export notifications =====
  const exportNotifications = () => {
    try {
      const dataStr = JSON.stringify(filteredNotifications, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `notifications_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(`Exported ${filteredNotifications.length} notifications`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export notifications");
    }
  };

  // ===== Copy notification to clipboard =====
  const copyToClipboard = (notification) => {
    const text = `${notification.title}\n${notification.message}\nOrder: ${notification.orderNumber || 'N/A'}\nCustomer: ${notification.customerName || 'N/A'}\nTime: ${formatDate(notification.createdAt)}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // ===== Mobile Filters Panel =====
  const MobileFiltersPanel = () => (
    <AnimatePresence>
      {isMobile && showMobileFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-6 pb-24">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, type: "all" }))}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    filters.type === "all" 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Types
                </button>
                {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilters(prev => ({ ...prev, type: key }))}
                    className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      filters.type === key 
                        ? `${config.color} border-2 shadow-md` 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {config.mobileIcon}
                    <span className="truncate">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", "pending", "sent", "delivered", "read", "failed"].map((status) => {
                  const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;
                  return (
                    <button
                      key={status}
                      onClick={() => setFilters(prev => ({ ...prev, status }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        filters.status === status 
                          ? status === "all"
                            ? "bg-blue-600 text-white shadow-md"
                            : STATUS_CONFIG[status]?.color + " border-2 shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status !== "all" && <StatusIcon className="w-3 h-3" />}
                      {status === "all" ? "All" : STATUS_CONFIG[status]?.label || status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["all", "low", "normal", "high", "urgent"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilters(prev => ({ ...prev, priority }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                      filters.priority === priority 
                        ? priority === "all" 
                          ? "bg-blue-600 text-white shadow-md"
                          : PRIORITY_CONFIG[priority]?.color + " border-2 shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {priority === "all" ? "All" : priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["all", "today", "week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      filters.dateRange === range 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {range === "all" ? "All Time" : 
                     range === "today" ? "Today" : 
                     range === "week" ? "Last 7 Days" : "Last 30 Days"}
                  </button>
                ))}
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="whatsapp-bot">WhatsApp Bot</option>
                <option value="dashboard">Dashboard</option>
                <option value="system">System</option>
                <option value="api">API</option>
                <option value="cron">Scheduled</option>
              </select>
            </div>

            {/* Active Filters Summary */}
            {Object.values(filters).some(v => v !== "all" && v !== "") && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.type !== "all" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      Type: {NOTIFICATION_TYPES[filters.type]?.label || filters.type}
                    </span>
                  )}
                  {filters.status !== "all" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      Status: {STATUS_CONFIG[filters.status]?.label || filters.status}
                    </span>
                  )}
                  {filters.priority !== "all" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      Priority: {filters.priority}
                    </span>
                  )}
                  {filters.dateRange !== "all" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      Range: {filters.dateRange}
                    </span>
                  )}
                  {filters.source !== "all" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      Source: {filters.source}
                    </span>
                  )}
                  {filters.search && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      Search: "{filters.search}"
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={clearFilters}
                className="py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  setShowMobileFilters(false);
                  fetchNotifications(1);
                }}
                className="py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ===== Loading State =====
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  // ===== Auth Check =====
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-8">Please login to access notifications</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ===== Admin Check =====
  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Admin Access Required</h2>
          <p className="text-gray-600 mb-8">This page is only accessible to admin users</p>
          <button
            onClick={() => router.push('/admin/dashboards')}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ===== Company Check =====
  const companyId = user.companyId || user.company_id || user.company?.id || user.company?.companyId;
  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Company Setup Required</h2>
          <p className="text-gray-600 mb-8">Your company profile needs to be set up before viewing notifications.</p>
          <button
            onClick={() => router.push('/admin/settings/company')}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Setup Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: {
            icon: '✅',
            style: {
              background: '#10b981',
            },
          },
          error: {
            icon: '❌',
            style: {
              background: '#ef4444',
            },
          },
          loading: {
            icon: <Loader2 className="w-4 h-4 animate-spin" />,
            style: {
              background: '#3b82f6',
            },
          },
        }}
      />
      
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-blue-600" />
                  Notifications
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${stats.unread > 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></span>
                  {stats.unread} unread • {stats.today} today
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                title={autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
              >
                {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleSound}
                className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title={soundEnabled ? "Sound on" : "Sound off"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => fetchNotifications(pagination.page, false)}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isMobile ? 'pt-0 pb-20' : 'p-4 md:p-6'}`}>
        {/* Mobile Filters Panel */}
        <MobileFiltersPanel />

        {/* Desktop Header */}
        {!isMobile && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-4">
                    <div className="relative">
                      <BellRing className="w-10 h-10 text-blue-600 animate-pulse-subtle" />
                      {stats.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                          {stats.unread > 9 ? '9+' : stats.unread}
                        </span>
                      )}
                    </div>
                    Notifications
                    {user && (
                      <span className="text-base font-normal text-gray-500 hidden md:inline">
                        • Welcome, {user.name || user.email}
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Company: {user.companyName || user.company?.name || 'Your Company'}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sound Toggle */}
                  <button
                    onClick={toggleSound}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                      soundEnabled 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title={soundEnabled ? "Sound on" : "Sound off"}
                  >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>

                  {/* Auto-refresh Toggle */}
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                      autoRefresh 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {autoRefresh ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    <span className="font-medium">Auto-refresh</span>
                  </button>

                  <button
                    onClick={() => fetchNotifications(pagination.page, false)}
                    disabled={isRefreshing}
                    className="px-5 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-3 disabled:opacity-50 group"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                    <span className="font-medium">Refresh</span>
                  </button>
                  
                  <button
                    onClick={markAllAsRead}
                    disabled={stats.unread === 0}
                    className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3 disabled:opacity-50 group"
                  >
                    <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Mark All Read</span>
                  </button>

                  <button
                    onClick={exportNotifications}
                    className="px-5 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-3"
                    title="Export notifications"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-3 rounded-l-xl transition-all ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                      title="List view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-3 border-l border-gray-300 transition-all ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                      title="Grid view"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-3 border-l border-gray-300 rounded-r-xl transition-all ${viewMode === "compact" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                      title="Compact view"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">Total</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.total / 100) * 100, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-blue-500 rounded-full" 
                    />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">Unread</p>
                      <p className="text-3xl font-bold text-amber-600">{stats.unread}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <BellRing className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                      {stats.urgent} urgent
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                      {stats.highPriority} high
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">Today</p>
                      <p className="text-3xl font-bold text-green-600">{stats.today}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated: {lastUpdateRef.current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">By Priority</p>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                          {stats.byPriority?.urgent || 0} urgent
                        </span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                          {stats.byPriority?.high || 0} high
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Normal: {stats.byPriority?.normal || 0} • Low: {stats.byPriority?.low || 0}
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">By Status</p>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                          {stats.byStatus?.pending || 0} pending
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                          {stats.byStatus?.delivered || 0} delivered
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Layers className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Type Distribution */}
              {Object.keys(stats.byType).length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Notifications by Type</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(stats.byType).map(([type, count]) => {
                      const config = getNotificationConfig(type);
                      const LucideIcon = config.lucideIcon;
                      return (
                        <motion.div 
                          key={type} 
                          whileHover={{ scale: 1.05 }}
                          className={`px-4 py-2 rounded-xl ${config.bgColor} border ${config.color} flex items-center gap-2 shadow-sm`}
                        >
                          <LucideIcon className="w-4 h-4" />
                          <span className="font-medium">{config.label}</span>
                          <span className="ml-2 font-bold bg-white px-2 py-0.5 rounded-full text-xs">
                            {count}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Desktop Filter Panel */}
        {!isMobile && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm hover:shadow group"
              >
                <Filter className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                <span className="font-medium">Filters</span>
                {Object.values(filters).some(v => v !== "all" && v !== "") && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              {selectedNotifications.size > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-3 shadow-sm hover:shadow"
                  >
                    <Layers className="w-5 h-5" />
                    <span className="font-medium">
                      Bulk Actions ({selectedNotifications.size})
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showBulkActions ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showBulkActions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            setBulkAction('markAsRead');
                            handleBulkAction();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span>Mark as Read</span>
                        </button>
                        <button
                          onClick={() => {
                            setBulkAction('delete');
                            handleBulkAction();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              <div className="ml-auto flex items-center gap-4">
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium">{pagination.total}</span> total
                </div>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
                    fetchNotifications(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>

                {/* Sort Dropdown */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                    fetchNotifications(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="priority-desc">Priority (High to Low)</option>
                  <option value="priority-asc">Priority (Low to High)</option>
                </select>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="all">All Types</option>
                        {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="read">Read</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Priority
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Date Range
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                      <Search className="w-4 h-4" />
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by order number, customer, message, phone, email..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                    <button
                      onClick={() => {
                        setShowFilters(false);
                        fetchNotifications(1);
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Desktop Search */}
          {!isMobile && (
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications by order number, customer name, message, phone or email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selection Header */}
          {selectedNotifications.size > 0 && (
            <div className="bg-blue-50 border-b border-blue-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700">
                  {selectedNotifications.size} selected
                </span>
                <button
                  onClick={selectAllVisible}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedNotifications.size === filteredNotifications.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    Promise.all(Array.from(selectedNotifications).map(id => markAsRead(id)));
                  }}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Mark Read
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12 md:p-16">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
                <p className="mt-2 text-sm text-gray-500">Fetching your latest updates</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center p-12 md:p-16 text-center"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BellOff className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No notifications found</h3>
              <p className="text-gray-500 max-w-md mb-6">
                {filters.search || filters.type !== "all" || filters.status !== "all" || filters.priority !== "all" || filters.dateRange !== "all" || filters.source !== "all"
                  ? "No notifications match your current filters. Try adjusting your search criteria."
                  : "You're all caught up! No new notifications at the moment."}
              </p>
              {(filters.search || filters.type !== "all" || filters.status !== "all" || filters.priority !== "all" || filters.dateRange !== "all" || filters.source !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 group"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Clear all filters
                </button>
              )}
            </motion.div>
          ) : (
            <>
              {/* View Mode Rendering */}
              {viewMode === 'grid' && !isMobile ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredNotifications.map((notification, index) => {
                    const config = getNotificationConfig(notification.type);
                    const isSelected = selectedNotifications.has(notification.id);
                    const isUnread = notification.status === "pending" || notification.status === "sent" || notification.status === "delivered";
                    const LucideIcon = config.lucideIcon;
                    const PriorityIcon = PRIORITY_CONFIG[notification.priority]?.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative p-4 rounded-xl border transition-all ${
                          isSelected 
                            ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/50' 
                            : isUnread 
                              ? 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/50' 
                              : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(notification.id)}
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${config.color} border relative`}>
                            <LucideIcon className="w-6 h-6" />
                            {isUnread && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-sm truncate">
                                {notification.title}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[notification.priority]?.color}`}>
                                {PriorityIcon}
                                <span className="ml-1">{notification.priority}</span>
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {notification.orderNumber && (
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">
                                    #{notification.orderNumber}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => copyToClipboard(notification)}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Copy"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                // List/Compact View
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification, index) => {
                    const config = getNotificationConfig(notification.type);
                    const isSelected = selectedNotifications.has(notification.id);
                    const isUnread = notification.status === "pending" || notification.status === "sent" || notification.status === "delivered";
                    const isExpanded = expandedNotification === notification.id;
                    const LucideIcon = config.lucideIcon;
                    const StatusIcon = STATUS_CONFIG[notification.status]?.icon || Clock;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 md:p-6 hover:bg-gray-50 transition-all ${isUnread ? "bg-blue-50/30" : ""} ${
                          viewMode === "compact" ? "py-3" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Selection Checkbox - Desktop */}
                          {!isMobile && (
                            <div className="flex-shrink-0 pt-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelection(notification.id)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                          )}

                          {/* Notification Icon with Animation */}
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: config.animation === "shake" ? 10 : 0 }}
                            className={`flex-shrink-0 ${viewMode === "compact" ? 'w-10 h-10' : 'w-14 h-14'} rounded-xl flex items-center justify-center ${config.color} border relative overflow-hidden group`}
                          >
                            {isMobile ? (
                              config.mobileIcon
                            ) : (
                              <>
                                <LucideIcon className={`w-${viewMode === "compact" ? '5' : '7'} h-${viewMode === "compact" ? '5' : '7'} relative z-10`} />
                                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                              </>
                            )}
                            {isUnread && (
                              <span className={`absolute top-0 right-0 w-2 h-2 ${config.color.replace('text', 'bg')} rounded-full animate-pulse`}></span>
                            )}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                              <div className="flex items-start gap-2 flex-1">
                                {/* Selection Checkbox - Mobile */}
                                {isMobile && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelection(notification.id)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                )}
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className={`font-bold text-gray-900 ${viewMode === "compact" ? 'text-sm' : 'text-base md:text-lg'}`}>
                                      {notification.title}
                                    </h4>
                                    {isUnread && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    )}
                                    {/* Status Badge */}
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[notification.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                      <StatusIcon className="w-3 h-3" />
                                      {STATUS_CONFIG[notification.status]?.label || notification.status}
                                    </span>
                                    {/* Priority Badge */}
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[notification.priority]?.color}`}>
                                      {PRIORITY_CONFIG[notification.priority]?.icon}
                                      {notification.priority}
                                    </span>
                                    {/* Source Badge */}
                                    {notification.source && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        {notification.source === 'whatsapp-bot' ? <MessageSquare className="w-3 h-3" /> : 
                                         notification.source === 'dashboard' ? <Bell className="w-3 h-3" /> : 
                                         notification.source === 'system' ? <Settings className="w-3 h-3" /> : 
                                         <Globe className="w-3 h-3" />}
                                        {notification.source}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <p className={`text-gray-600 ${viewMode === "compact" ? 'text-xs' : 'text-sm md:text-base'} line-clamp-2`}>
                                    {notification.message}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-2 md:mt-0">
                                <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {isMobile ? formatTime(notification.createdAt) : formatDate(notification.createdAt)}
                                </span>
                                {isMobile && (
                                  <button
                                    onClick={() => toggleNotificationExpansion(notification.id)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Metadata - Always visible on desktop, expandable on mobile */}
                            {(isMobile ? isExpanded : true) && (
                              <motion.div 
                                initial={isMobile ? { height: 0, opacity: 0 } : false}
                                animate={isMobile ? { height: "auto", opacity: 1 } : false}
                                className="mt-3 md:mt-4"
                              >
                                {/* Order Details */}
                                {(notification.orderNumber || notification.customerName || notification.totalAmount || notification.customerPhone || notification.customerEmail) && (
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                                    {notification.orderNumber && (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                                        <ShoppingCart className="w-3 h-3" />
                                        <span className="font-medium">Order:</span>
                                        <span className="font-bold text-gray-900">#{notification.orderNumber}</span>
                                      </span>
                                    )}
                                    {notification.customerName && (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                                        <Users className="w-3 h-3" />
                                        <span className="font-medium">Customer:</span>
                                        <span className="font-bold text-gray-900">{notification.customerName}</span>
                                      </span>
                                    )}
                                    {notification.totalAmount && (
                                      <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-lg text-green-700">
                                        <DollarSign className="w-3 h-3" />
                                        <span className="font-medium">Amount:</span>
                                        <span className="font-bold">₹{notification.totalAmount}</span>
                                      </span>
                                    )}
                                    {notification.customerPhone && (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                                        <Smartphone className="w-3 h-3" />
                                        <span>{notification.customerPhone}</span>
                                      </span>
                                    )}
                                    {notification.customerEmail && (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate max-w-[200px]">{notification.customerEmail}</span>
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Metadata from notification */}
                                {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                  <div className="mb-3 text-xs text-gray-500 flex flex-wrap gap-2">
                                    {Object.entries(notification.metadata).map(([key, value]) => {
                                      if (typeof value === 'string' || typeof value === 'number') {
                                        return (
                                          <span key={key} className="bg-gray-100 px-2 py-1 rounded-lg">
                                            {key}: {value.toString()}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                  {isUnread && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => markAsRead(notification.id)}
                                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
                                    >
                                      <Eye className="w-4 h-4" />
                                      Mark as Read
                                    </motion.button>
                                  )}
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => deleteNotification(notification.id)}
                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </motion.button>
                                  
                                  {/* View Details Button */}
                                  {notification.link && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => router.push(notification.link.to)}
                                      className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
                                    >
                                      <Eye className="w-4 h-4" />
                                      {notification.link.text || 'View Details'}
                                    </motion.button>
                                  )}

                                  {/* Copy Button */}
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => copyToClipboard(notification)}
                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </motion.button>
                                </div>

                                {/* Read Receipts */}
                                {notification.readByUsers && notification.readByUsers.length > 0 && (
                                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                                    <Eye className="w-3 h-3" />
                                    <span>Read by {notification.readByUsers.length} user{notification.readByUsers.length > 1 ? 's' : ''}</span>
                                    {notification.readAt && (
                                      <span>• {formatRelativeTime(notification.readAt)}</span>
                                    )}
                                  </div>
                                )}

                                {/* Error info if failed */}
                                {notification.status === 'failed' && notification.error && (
                                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                                    <div className="flex items-center gap-2 mb-1">
                                      <XCircle className="w-4 h-4" />
                                      <span className="font-medium">Error:</span>
                                    </div>
                                    <p>{typeof notification.error === 'string' ? notification.error : notification.error.message}</p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className={`border-t border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} notifications
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`${isMobile ? 'p-2' : 'p-2.5'} border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {/* Mobile pagination - simple */}
                      {isMobile ? (
                        <>
                          <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium">
                            {pagination.page}
                          </span>
                          <span className="text-gray-500">of {pagination.pages}</span>
                        </>
                      ) : (
                        // Desktop pagination - full
                        <div className="flex items-center gap-1">
                          {pagination.page > 2 && (
                            <>
                              <button
                                onClick={() => handlePageChange(1)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
                              >
                                1
                              </button>
                              {pagination.page > 3 && <span className="px-2">...</span>}
                            </>
                          )}
                          
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
                                className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium transition-all ${
                                  pagination.page === pageNum
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          {pagination.page < pagination.pages - 1 && (
                            <>
                              {pagination.page < pagination.pages - 2 && <span className="px-2">...</span>}
                              <button
                                onClick={() => handlePageChange(pagination.pages)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
                              >
                                {pagination.pages}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className={`${isMobile ? 'p-2' : 'p-2.5'} border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
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
        {!isLoading && !isMobile && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              {autoRefresh ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Auto-refreshes every 2 minutes
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Auto-refresh paused
                </>
              )}
              • Last updated: {lastUpdateRef.current.toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        {isMobile && !showMobileFilters && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="flex items-center justify-around p-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex flex-col items-center p-2 text-gray-500"
              >
                <Filter className="w-5 h-5" />
                <span className="text-xs mt-1">Filters</span>
              </button>
              <button
                onClick={() => fetchNotifications(pagination.page, false)}
                disabled={isRefreshing}
                className="flex flex-col items-center p-2 text-gray-500"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="text-xs mt-1">Refresh</span>
              </button>
              <button
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="flex flex-col items-center p-2 text-blue-600"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs mt-1">Mark All</span>
              </button>
              {selectedNotifications.size > 0 ? (
                <button
                  onClick={deleteSelected}
                  className="flex flex-col items-center p-2 text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-xs mt-1">Delete ({selectedNotifications.size})</span>
                </button>
              ) : (
                <div className="flex flex-col items-center p-2 opacity-50">
                  <Bell className="w-5 h-5" />
                  <span className="text-xs mt-1">Alerts</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add padding for mobile bottom nav */}
        {isMobile && <div className="h-16"></div>}
      </div>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Custom scrollbar for desktop */
        @media (min-width: 768px) {
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        }
      `}</style>
    </>
  );
}