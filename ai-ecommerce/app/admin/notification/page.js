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
//   Eye,
//   EyeOff,
//   Download,
//   MoreVertical,
//   Calendar,
//   Mail,
//   Smartphone,
//   ExternalLink,
//   ChevronLeft,
//   ChevronRight,
//   Star,
//   Archive,
//   BellOff,
//   Loader2
// } from "lucide-react";
// import { toast, Toaster } from "react-hot-toast";
// import { useAuth } from "../../../context/authContext";
// import { useRouter } from "next/navigation";

// const NOTIFICATION_TYPES = {
//   NEW_ORDER: {
//     label: "New Order",
//     icon: "🛍️",
//     color: "bg-blue-100 text-blue-700 border-blue-200",
//     textColor: "text-blue-700",
//     bgColor: "bg-blue-50"
//   },
//   PAYMENT_RECEIVED: {
//     label: "Payment Received",
//     icon: "💰",
//     color: "bg-green-100 text-green-700 border-green-200",
//     textColor: "text-green-700",
//     bgColor: "bg-green-50"
//   },
//   PAYMENT_VERIFIED: {
//     label: "Payment Verified",
//     icon: "✅",
//     color: "bg-emerald-100 text-emerald-700 border-emerald-200",
//     textColor: "text-emerald-700",
//     bgColor: "bg-emerald-50"
//   },
//   LOW_STOCK_ALERT: {
//     label: "Low Stock",
//     icon: "📦",
//     color: "bg-amber-100 text-amber-700 border-amber-200",
//     textColor: "text-amber-700",
//     bgColor: "bg-amber-50"
//   },
//   ORDER_STATUS_CHANGED: {
//     label: "Status Update",
//     icon: "📦",
//     color: "bg-purple-100 text-purple-700 border-purple-200",
//     textColor: "text-purple-700",
//     bgColor: "bg-purple-50"
//   },
//   SYSTEM_ALERT: {
//     label: "System Alert",
//     icon: "🚨",
//     color: "bg-red-100 text-red-700 border-red-200",
//     textColor: "text-red-700",
//     bgColor: "bg-red-50"
//   },
//   ADMIN_ALERT: {
//     label: "Admin Alert",
//     icon: "🔔",
//     color: "bg-orange-100 text-orange-700 border-orange-200",
//     textColor: "text-orange-700",
//     bgColor: "bg-orange-50"
//   }
// };

// const PRIORITY_COLORS = {
//   low: "text-gray-500 bg-gray-100",
//   normal: "text-gray-700 bg-gray-200",
//   high: "text-amber-700 bg-amber-100",
//   urgent: "text-red-700 bg-red-100"
// };

// export default function NotificationPage() {
//   // State
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

//   // Auth and router
//   const { user, loading: authLoading, logout } = useAuth();
//   const router = useRouter();

//   // Refs
//   const autoRefreshRef = useRef(null);

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

//   // Fetch notifications
//   const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
//     try {
//       if (showLoading) setIsLoading(true);
//       setIsRefreshing(true);

//       // Check if user is authenticated
//       if (!user) {
//         toast.error("Please login to view notifications");
//         setIsLoading(false);
//         setIsRefreshing(false);
//         return;
//       }

//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         limit: pagination.limit.toString()
//       });

//       // Add filters
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

//       const response = await fetch(`/api/notifications?${queryParams}`);
      
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
        
//         // Calculate today's notifications
//         const today = new Date().toISOString().split('T')[0];
//         const todayCount = (data.notifications || []).filter(n => 
//           new Date(n.createdAt).toISOString().split('T')[0] === today
//         ).length;
        
//         setStats(prev => ({ ...prev, today: todayCount }));
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
//   }, [filters, pagination.limit, user, logout, router]);

//   // Initial fetch
//   useEffect(() => {
//     if (!authLoading && user) {
//       fetchNotifications();
      
//       // Set up auto-refresh every 30 seconds
//       autoRefreshRef.current = setInterval(() => {
//         if (user) {
//           fetchNotifications(pagination.page, false);
//         }
//       }, 30000);
//     }

//     return () => {
//       if (autoRefreshRef.current) {
//         clearInterval(autoRefreshRef.current);
//       }
//     };
//   }, [fetchNotifications, authLoading, user, pagination.page]);

//   // Apply filters
//   useEffect(() => {
//     if (!notifications.length) return;

//     let filtered = [...notifications];

//     // Apply type filter
//     if (filters.type !== "all") {
//       filtered = filtered.filter(n => n.type === filters.type);
//     }

//     // Apply status filter
//     if (filters.status !== "all") {
//       filtered = filtered.filter(n => n.status === filters.status);
//     }

//     // Apply priority filter
//     if (filters.priority !== "all") {
//       filtered = filtered.filter(n => n.priority === filters.priority);
//     }

//     // Apply search filter
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
//         body: JSON.stringify({ markAsRead: true })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           // Update local state
//           setNotifications(prev => prev.map(n =>
//             n.id === notificationId ? { ...n, status: "read" } : n
//           ));
          
//           // Update stats
//           setStats(prev => ({
//             ...prev,
//             unread: Math.max(0, prev.unread - 1)
//           }));
          
//           // Remove from selected if present
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
//         method: "DELETE"
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           // Remove from local state
//           setNotifications(prev => prev.filter(n => n.id !== notificationId));
          
//           // Remove from selected
//           setSelectedNotifications(prev => {
//             const next = new Set(prev);
//             next.delete(notificationId);
//             return next;
//           });

//           toast.success("Notification deleted");
          
//           // Refresh stats
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
//       // Deselect all if all are selected
//       setSelectedNotifications(new Set());
//     } else {
//       // Select all visible
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
//       bgColor: "bg-gray-50"
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
//   };

//   // Redirect if not authenticated
//   if (authLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
//           <p className="text-gray-600 mb-6">Please login to access notifications</p>
//           <button
//             onClick={() => router.push('/login')}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster position="top-right" />
//       <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
//                 <BellRing className="w-8 h-8 text-blue-600" />
//                 Notifications
//                 {user && (
//                   <span className="text-sm font-normal text-gray-500 ml-2">
//                     Welcome, {user.name}
//                   </span>
//                 )}
//               </h1>
//               <p className="text-gray-600 mt-1">Manage and monitor all system notifications</p>
//             </div>
            
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => fetchNotifications(pagination.page, false)}
//                 disabled={isRefreshing}
//                 className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
//               >
//                 <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
//                 Refresh
//               </button>
              
//               <button
//                 onClick={markAllAsRead}
//                 disabled={stats.unread === 0}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <CheckCircle className="w-4 h-4" />
//                 Mark All Read
//               </button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Notifications</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//                 </div>
//                 <Bell className="w-8 h-8 text-blue-500" />
//               </div>
//             </div>

//             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Unread</p>
//                   <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
//                 </div>
//                 <Bell className="w-8 h-8 text-amber-500" />
//               </div>
//             </div>

//             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Today</p>
//                   <p className="text-2xl font-bold text-green-600">{stats.today}</p>
//                 </div>
//                 <Calendar className="w-8 h-8 text-green-500" />
//               </div>
//             </div>

//             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">High Priority</p>
//                   <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
//                 </div>
//                 <AlertCircle className="w-8 h-8 text-red-500" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//           {/* Toolbar */}
//           <div className="p-4 border-b border-gray-200 bg-gray-50">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="relative flex-1 md:flex-none">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search notifications..."
//                     value={filters.search}
//                     onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
//                 >
//                   <Filter className="w-4 h-4" />
//                   Filters
//                   {Object.values(filters).some(v => v !== "all" && v !== "") && (
//                     <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                   )}
//                 </button>

//                 {selectedNotifications.size > 0 && (
//                   <button
//                     onClick={deleteSelected}
//                     className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                     Delete Selected ({selectedNotifications.size})
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-500">
//                   Showing {filteredNotifications.length} of {pagination.total}
//                 </span>
//                 <select
//                   value={pagination.limit}
//                   onChange={(e) => {
//                     setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
//                     fetchNotifications(1);
//                   }}
//                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 >
//                   <option value="10">10 per page</option>
//                   <option value="20">20 per page</option>
//                   <option value="50">50 per page</option>
//                   <option value="100">100 per page</option>
//                 </select>
//               </div>
//             </div>

//             {/* Filter Panel */}
//             <AnimatePresence>
//               {showFilters && (
//                 <motion.div
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   className="mt-4 pt-4 border-t border-gray-200"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Type
//                       </label>
//                       <select
//                         value={filters.type}
//                         onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Status
//                       </label>
//                       <select
//                         value={filters.status}
//                         onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       >
//                         <option value="all">All Status</option>
//                         <option value="pending">Pending</option>
//                         <option value="read">Read</option>
//                         <option value="delivered">Delivered</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Priority
//                       </label>
//                       <select
//                         value={filters.priority}
//                         onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       >
//                         <option value="all">All Priorities</option>
//                         <option value="low">Low</option>
//                         <option value="normal">Normal</option>
//                         <option value="high">High</option>
//                         <option value="urgent">Urgent</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Date Range
//                       </label>
//                       <select
//                         value={filters.dateRange}
//                         onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       >
//                         <option value="all">All Time</option>
//                         <option value="today">Today</option>
//                         <option value="week">Last 7 Days</option>
//                         <option value="month">Last 30 Days</option>
//                       </select>
//                     </div>

//                     <div className="md:col-span-2 flex items-end gap-2">
//                       <button
//                         onClick={clearFilters}
//                         className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1"
//                       >
//                         Clear Filters
//                       </button>
//                       <button
//                         onClick={() => setShowFilters(false)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
//                       >
//                         Apply Filters
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Notifications List */}
//           {isLoading ? (
//             <div className="flex items-center justify-center p-12">
//               <div className="text-center">
//                 <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500">Loading notifications...</p>
//               </div>
//             </div>
//           ) : filteredNotifications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-12 text-center">
//               <BellOff className="w-16 h-16 text-gray-300 mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
//               <p className="text-gray-500 max-w-md">
//                 {filters.search || filters.type !== "all" || filters.status !== "all"
//                   ? "No notifications match your filters. Try changing your search criteria."
//                   : "You're all caught up! No new notifications at the moment."}
//               </p>
//               {(filters.search || filters.type !== "all" || filters.status !== "all") && (
//                 <button
//                   onClick={clearFilters}
//                   className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
//                 >
//                   Clear filters to see all notifications
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="divide-y divide-gray-200">
//                 {filteredNotifications.map((notification) => {
//                   const config = getNotificationConfig(notification.type);
//                   const isSelected = selectedNotifications.has(notification.id);
//                   const isUnread = notification.status === "pending";

//                   return (
//                     <motion.div
//                       key={notification.id}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className={`p-4 hover:bg-gray-50 transition-colors ${isUnread ? "bg-blue-50" : ""}`}
//                     >
//                       <div className="flex items-start gap-4">
//                         {/* Selection Checkbox */}
//                         <div className="flex-shrink-0 pt-1">
//                           <input
//                             type="checkbox"
//                             checked={isSelected}
//                             onChange={() => toggleSelection(notification.id)}
//                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                           />
//                         </div>

//                         {/* Notification Icon */}
//                         <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color} border`}>
//                           <span className="text-lg">{config.icon}</span>
//                         </div>

//                         {/* Content */}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start justify-between gap-2 mb-1">
//                             <div className="flex items-center gap-2">
//                               <h4 className="font-medium text-gray-900 truncate">
//                                 {notification.title}
//                               </h4>
//                               {isUnread && (
//                                 <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
//                                 {notification.priority}
//                               </span>
//                               <span className="text-xs text-gray-500 whitespace-nowrap">
//                                 {formatTime(notification.createdAt)}
//                               </span>
//                             </div>
//                           </div>

//                           <p className="text-gray-600 mb-2">
//                             {notification.message}
//                           </p>

//                           {/* Metadata */}
//                           <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
//                             {notification.orderNumber && (
//                               <span className="flex items-center gap-1">
//                                 <span className="font-medium">Order:</span>
//                                 {notification.orderNumber}
//                               </span>
//                             )}
//                             {notification.customerName && (
//                               <span className="flex items-center gap-1">
//                                 <span className="font-medium">Customer:</span>
//                                 {notification.customerName}
//                               </span>
//                             )}
//                             {notification.totalAmount && (
//                               <span className="flex items-center gap-1">
//                                 <span className="font-medium">Amount:</span>
//                                 ₹{notification.totalAmount}
//                               </span>
//                             )}
//                           </div>

//                           {/* Actions */}
//                           <div className="flex items-center gap-2 mt-3">
//                             {isUnread && (
//                               <button
//                                 onClick={() => markAsRead(notification.id)}
//                                 className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
//                               >
//                                 <CheckCircle className="w-3 h-3" />
//                                 Mark as Read
//                               </button>
//                             )}
//                             <button
//                               onClick={() => deleteNotification(notification.id)}
//                               className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 text-red-600 hover:text-red-700"
//                             >
//                               <Trash2 className="w-3 h-3" />
//                               Delete
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>

//               {/* Pagination */}
//               {pagination.pages > 1 && (
//                 <div className="p-4 border-t border-gray-200 bg-gray-50">
//                   <div className="flex items-center justify-between">
//                     <div className="text-sm text-gray-500">
//                       Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
//                       {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
//                       {pagination.total} notifications
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handlePageChange(pagination.page - 1)}
//                         disabled={pagination.page === 1}
//                         className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         <ChevronLeft className="w-4 h-4" />
//                       </button>
                      
//                       {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
//                         let pageNum;
//                         if (pagination.pages <= 5) {
//                           pageNum = i + 1;
//                         } else if (pagination.page <= 3) {
//                           pageNum = i + 1;
//                         } else if (pagination.page >= pagination.pages - 2) {
//                           pageNum = pagination.pages - 4 + i;
//                         } else {
//                           pageNum = pagination.page - 2 + i;
//                         }
                        
//                         return (
//                           <button
//                             key={pageNum}
//                             onClick={() => handlePageChange(pageNum)}
//                             className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                               pagination.page === pageNum
//                                 ? "bg-blue-600 text-white"
//                                 : "border border-gray-300 hover:bg-gray-50"
//                             }`}
//                           >
//                             {pageNum}
//                           </button>
//                         );
//                       })}
                      
//                       <button
//                         onClick={() => handlePageChange(pagination.page + 1)}
//                         disabled={pagination.page === pagination.pages}
//                         className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
//         {!isLoading && (
//           <div className="mt-4 text-center">
//             <p className="text-xs text-gray-500">
//               Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
//             </p>
//           </div>
//         )}
//       </div>
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
  Home // Remove if you don't need it anymore
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

const NOTIFICATION_TYPES = {
  NEW_ORDER: {
    label: "New Order",
    icon: "🛍️",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    mobileIcon: <Package className="w-5 h-5 text-blue-600" />
  },
  PAYMENT_RECEIVED: {
    label: "Payment Received",
    icon: "💰",
    color: "bg-green-100 text-green-700 border-green-200",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    mobileIcon: <TrendingUp className="w-5 h-5 text-green-600" />
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    icon: "✅",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    mobileIcon: <CheckCircle className="w-5 h-5 text-emerald-600" />
  },
  LOW_STOCK_ALERT: {
    label: "Low Stock",
    icon: "📦",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    mobileIcon: <AlertCircle className="w-5 h-5 text-amber-600" />
  },
  ORDER_STATUS_CHANGED: {
    label: "Status Update",
    icon: "📦",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    mobileIcon: <RefreshCw className="w-5 h-5 text-purple-600" />
  },
  SYSTEM_ALERT: {
    label: "System Alert",
    icon: "🚨",
    color: "bg-red-100 text-red-700 border-red-200",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    mobileIcon: <AlertCircle className="w-5 h-5 text-red-600" />
  },
  ADMIN_ALERT: {
    label: "Admin Alert",
    icon: "🔔",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    mobileIcon: <Bell className="w-5 h-5 text-orange-600" />
  }
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-gray-200 text-gray-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700"
};

export default function NotificationPage() {
  // State - REMOVED showMobileMenu
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(null);

  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const autoRefreshRef = useRef(null);
  const lastUpdateRef = useRef(new Date());

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);

      if (!isAuthenticated || !user) {
        toast.error("Please login to view notifications");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (user.role !== 'admin') {
        toast.error("Admin access required");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
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

      const response = await fetch(`/api/notifications?${queryParams}`, {
        credentials: 'include'
      });
      
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
        
        const today = new Date().toISOString().split('T')[0];
        const todayCount = (data.notifications || []).filter(n => 
          new Date(n.createdAt).toISOString().split('T')[0] === today
        ).length;
        
        setStats(prev => ({ ...prev, today: todayCount }));
        lastUpdateRef.current = new Date();
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
  }, [filters, pagination.limit, user, isAuthenticated, logout, router]);

  // Initial fetch
  useEffect(() => {
    if (!authLoading && user && isAuthenticated) {
      fetchNotifications();
      
      autoRefreshRef.current = setInterval(() => {
        if (user && isAuthenticated) {
          fetchNotifications(pagination.page, false);
        }
      }, 120000);
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchNotifications, authLoading, user, pagination.page, isAuthenticated]);

  // Apply filters
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
        body: JSON.stringify({ markAsRead: true }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, status: "read" } : n
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
        method: "DELETE",
        credentials: 'include'
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

          toast.success("Notification deleted");
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
      setSelectedNotifications(new Set());
    } else {
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
      bgColor: "bg-gray-50",
      mobileIcon: <Bell className="w-5 h-5 text-gray-600" />
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
    setShowMobileFilters(false);
  };

  // Toggle notification expansion
  const toggleNotificationExpansion = (notificationId) => {
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
  };

  // Mobile Filters Panel
  const MobileFiltersPanel = () => (
    <AnimatePresence>
      {isMobile && showMobileFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 bg-white"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, type: "all" }))}
                  className={`px-4 py-3 rounded-xl text-sm font-medium ${
                    filters.type === "all" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  All Types
                </button>
                {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilters(prev => ({ ...prev, type: key }))}
                    className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                      filters.type === key 
                        ? `${config.color.replace('text-', '')} border` 
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {config.mobileIcon}
                    <span className="truncate">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "pending", "read", "delivered"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({ ...prev, status }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      filters.status === status 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["all", "low", "normal", "high", "urgent"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilters(prev => ({ ...prev, priority }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-center ${
                      filters.priority === priority 
                        ? priority === "all" 
                          ? "bg-blue-600 text-white"
                          : PRIORITY_COLORS[priority]
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {priority === "all" ? "All" : priority}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["all", "today", "week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                    className={`px-4 py-3 rounded-xl text-sm font-medium ${
                      filters.dateRange === range 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {range === "all" ? "All Time" : 
                     range === "today" ? "Today" : 
                     range === "week" ? "Last 7 Days" : "Last 30 Days"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={clearFilters}
                className="py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

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

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
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
        }}
      />
      
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-blue-600" />
                  Notifications
                </h1>
                <p className="text-xs text-gray-500">
                  {stats.unread} unread • {stats.today} today
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotifications(pagination.page, false)}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
              >
                <Filter className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isMobile ? 'pt-0' : 'p-4 md:p-6'}`}>
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
                      <BellRing className="w-10 h-10 text-blue-600" />
                      {stats.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
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
                  <p className="text-gray-600 mt-2 text-lg">Manage and monitor all system notifications</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => fetchNotifications(pagination.page, false)}
                    disabled={isRefreshing}
                    className="px-5 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-3 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="font-medium">Refresh</span>
                  </button>
                  
                  <button
                    onClick={markAllAsRead}
                    disabled={stats.unread === 0}
                    className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3 disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Mark All Read</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">Total Notifications</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${Math.min((stats.total / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">Unread</p>
                      <p className="text-3xl font-bold text-amber-600">{stats.unread}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <span className="text-gray-500">Priority:</span>
                    <span className="ml-2 font-medium">
                      {stats.highPriority} high • {stats.urgent} urgent
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">Today</p>
                      <p className="text-3xl font-bold text-green-600">{stats.today}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Updated: {lastUpdateRef.current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">High Priority</p>
                      <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${PRIORITY_COLORS.urgent}`}>
                      {stats.urgent} urgent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Desktop Filter Panel */}
        {!isMobile && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm hover:shadow"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filters</span>
                {Object.values(filters).some(v => v !== "all" && v !== "") && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              {selectedNotifications.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="px-4 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all flex items-center gap-3 shadow-sm hover:shadow"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">
                    Delete Selected ({selectedNotifications.size})
                  </span>
                </button>
              )}

              <div className="ml-auto flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{pagination.total}</span> total notifications
                </div>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
                    fetchNotifications(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="read">Read</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Priority
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Date Range
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-end gap-4">
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Filters
                      </button>
                    </div>
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
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications by order number, customer name, or message..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12 md:p-16">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
                <p className="mt-2 text-sm text-gray-500">Fetching your latest updates</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 md:p-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BellOff className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No notifications found</h3>
              <p className="text-gray-500 max-w-md mb-6">
                {filters.search || filters.type !== "all" || filters.status !== "all"
                  ? "No notifications match your current filters. Try adjusting your search criteria."
                  : "You're all caught up! No new notifications at the moment."}
              </p>
              {(filters.search || filters.type !== "all" || filters.status !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters to see notifications
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Selection Header */}
              {isMobile && selectedNotifications.size > 0 && (
                <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-700">
                        {selectedNotifications.size} selected
                      </span>
                    </div>
                    <button
                      onClick={deleteSelected}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => {
                  const config = getNotificationConfig(notification.type);
                  const isSelected = selectedNotifications.has(notification.id);
                  const isUnread = notification.status === "pending";
                  const isExpanded = expandedNotification === notification.id;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 md:p-6 hover:bg-gray-50 transition-colors ${isUnread ? "bg-blue-50/50" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox - Desktop */}
                        {!isMobile && (
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(notification.id)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl flex items-center justify-center ${config.color} border`}>
                          {isMobile ? config.mobileIcon : <span className="text-2xl">{config.icon}</span>}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
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
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 text-base md:text-lg">
                                    {notification.title}
                                  </h4>
                                  {isUnread && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                  )}
                                </div>
                                
                                <p className="text-gray-600 text-sm md:text-base line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-2 md:mt-0">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
                                {notification.priority}
                              </span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {isMobile ? formatTime(notification.createdAt) : formatDate(notification.createdAt)}
                              </span>
                              {isMobile && (
                                <button
                                  onClick={() => toggleNotificationExpansion(notification.id)}
                                  className="p-1"
                                >
                                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Metadata - Always visible on desktop, expandable on mobile */}
                          {(isMobile ? isExpanded : true) && (
                            <div className="mt-3 md:mt-4">
                              {/* Order Details */}
                              {(notification.orderNumber || notification.customerName || notification.totalAmount) && (
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                  {notification.orderNumber && (
                                    <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                                      <span className="font-medium">Order:</span>
                                      <span className="font-bold text-gray-900">#{notification.orderNumber}</span>
                                    </span>
                                  )}
                                  {notification.customerName && (
                                    <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                                      <span className="font-medium">Customer:</span>
                                      <span className="font-bold text-gray-900">{notification.customerName}</span>
                                    </span>
                                  )}
                                  {notification.totalAmount && (
                                    <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-lg text-green-700">
                                      <span className="font-medium">Amount:</span>
                                      <span className="font-bold">₹{notification.totalAmount}</span>
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap items-center gap-2 mt-4">
                                {isUnread && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Read
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

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
                        Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
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
                              className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium ${
                                pagination.page === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })
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
            <p className="text-sm text-gray-500">
              Auto-refreshes every 2 minutes • Last updated: {lastUpdateRef.current.toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Mobile Bottom Navigation - UPDATED */}
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
              {filters.search || filters.type !== "all" || filters.status !== "all" ? (
                <button
                  onClick={clearFilters}
                  className="flex flex-col items-center p-2 text-gray-500"
                >
                  <X className="w-5 h-5" />
                  <span className="text-xs mt-1">Clear</span>
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
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
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