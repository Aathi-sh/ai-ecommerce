
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
//   Home,
//   ShoppingCart,
//   CreditCard,
//   Shield,
//   Zap,
//   Megaphone,
//   MoreHorizontal,
//   Eye,
//   EyeOff,
//   Download,
//   Printer,
//   Star,
//   DollarSign,
//   Users,
//   AlertTriangle,
//   Info,
//   CheckCircle2,
//   XCircle,
//   Mail,
//   MessageSquare,
//   Smartphone,
//   Globe,
//   Clock3,
//   UserCheck,
//   UserX,
//   Lock,
//   Unlock,
//   Settings,
//   HelpCircle,
//   Building,
//   Send,
//   Copy,
//   ExternalLink,
//   ThumbsUp,
//   ThumbsDown,
//   Gift,
//   Award,
//   Target,
//   Flag,
//   Layers,
//   Grid,
//   List,
//   Menu,
//   Minimize2,
//   Maximize2,
//   Volume2,
//   VolumeX,
//   Play,
//   Pause,
//   SkipForward,
//   SkipBack
// } from "lucide-react";
// import { toast, Toaster } from "react-hot-toast";
// import { useAuth } from "../../../context/AuthContext";
// import { useRouter } from "next/navigation";

// // ==================== CONSTANTS ====================

// const NOTIFICATION_TYPES = {
//   NEW_ORDER: {
//     label: "New Order",
//     icon: "🛍️",
//     lucideIcon: ShoppingCart,
//     color: "bg-blue-100 text-blue-700 border-blue-200",
//     textColor: "text-blue-700",
//     bgColor: "bg-blue-50",
//     hoverColor: "hover:bg-blue-100",
//     gradient: "from-blue-500 to-blue-600",
//     lightGradient: "from-blue-400 to-blue-500",
//     animation: "bounce",
//     mobileIcon: <ShoppingCart className="w-5 h-5 text-blue-600" />
//   },
//   PAYMENT_RECEIVED: {
//     label: "Payment Received",
//     icon: "💰",
//     lucideIcon: DollarSign,
//     color: "bg-green-100 text-green-700 border-green-200",
//     textColor: "text-green-700",
//     bgColor: "bg-green-50",
//     hoverColor: "hover:bg-green-100",
//     gradient: "from-green-500 to-green-600",
//     lightGradient: "from-green-400 to-green-500",
//     animation: "pulse",
//     mobileIcon: <DollarSign className="w-5 h-5 text-green-600" />
//   },
//   PAYMENT_VERIFIED: {
//     label: "Payment Verified",
//     icon: "✅",
//     lucideIcon: CheckCircle2,
//     color: "bg-emerald-100 text-emerald-700 border-emerald-200",
//     textColor: "text-emerald-700",
//     bgColor: "bg-emerald-50",
//     hoverColor: "hover:bg-emerald-100",
//     gradient: "from-emerald-500 to-emerald-600",
//     lightGradient: "from-emerald-400 to-emerald-500",
//     animation: "pulse",
//     mobileIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
//   },
//   LOW_STOCK_ALERT: {
//     label: "Low Stock",
//     icon: "📦",
//     lucideIcon: Package,
//     color: "bg-amber-100 text-amber-700 border-amber-200",
//     textColor: "text-amber-700",
//     bgColor: "bg-amber-50",
//     hoverColor: "hover:bg-amber-100",
//     gradient: "from-amber-500 to-amber-600",
//     lightGradient: "from-amber-400 to-amber-500",
//     animation: "shake",
//     mobileIcon: <Package className="w-5 h-5 text-amber-600" />
//   },
//   ORDER_STATUS_CHANGED: {
//     label: "Status Update",
//     icon: "🔄",
//     lucideIcon: RefreshCw,
//     color: "bg-purple-100 text-purple-700 border-purple-200",
//     textColor: "text-purple-700",
//     bgColor: "bg-purple-50",
//     hoverColor: "hover:bg-purple-100",
//     gradient: "from-purple-500 to-purple-600",
//     lightGradient: "from-purple-400 to-purple-500",
//     animation: "spin",
//     mobileIcon: <RefreshCw className="w-5 h-5 text-purple-600" />
//   },
//   SYSTEM_ALERT: {
//     label: "System Alert",
//     icon: "🚨",
//     lucideIcon: AlertTriangle,
//     color: "bg-red-100 text-red-700 border-red-200",
//     textColor: "text-red-700",
//     bgColor: "bg-red-50",
//     hoverColor: "hover:bg-red-100",
//     gradient: "from-red-500 to-red-600",
//     lightGradient: "from-red-400 to-red-500",
//     animation: "pulse",
//     mobileIcon: <AlertTriangle className="w-5 h-5 text-red-600" />
//   },
//   ADMIN_ALERT: {
//     label: "Admin Alert",
//     icon: "🔔",
//     lucideIcon: Megaphone,
//     color: "bg-orange-100 text-orange-700 border-orange-200",
//     textColor: "text-orange-700",
//     bgColor: "bg-orange-50",
//     hoverColor: "hover:bg-orange-100",
//     gradient: "from-orange-500 to-orange-600",
//     lightGradient: "from-orange-400 to-orange-500",
//     animation: "ring",
//     mobileIcon: <Megaphone className="w-5 h-5 text-orange-600" />
//   },
//   TEST_NOTIFICATION: {
//     label: "Test",
//     icon: "🧪",
//     lucideIcon: Zap,
//     color: "bg-gray-100 text-gray-700 border-gray-200",
//     textColor: "text-gray-700",
//     bgColor: "bg-gray-50",
//     hoverColor: "hover:bg-gray-100",
//     gradient: "from-gray-500 to-gray-600",
//     lightGradient: "from-gray-400 to-gray-500",
//     animation: "pulse",
//     mobileIcon: <Zap className="w-5 h-5 text-gray-600" />
//   },
//   BOOKING_CONFIRMED: {
//     label: "Booking Confirmed",
//     icon: "📅",
//     lucideIcon: Calendar,
//     color: "bg-indigo-100 text-indigo-700 border-indigo-200",
//     textColor: "text-indigo-700",
//     bgColor: "bg-indigo-50",
//     hoverColor: "hover:bg-indigo-100",
//     gradient: "from-indigo-500 to-indigo-600",
//     lightGradient: "from-indigo-400 to-indigo-500",
//     animation: "bounce",
//     mobileIcon: <Calendar className="w-5 h-5 text-indigo-600" />
//   },
//   USER_REGISTERED: {
//     label: "New User",
//     icon: "👤",
//     lucideIcon: Users,
//     color: "bg-teal-100 text-teal-700 border-teal-200",
//     textColor: "text-teal-700",
//     bgColor: "bg-teal-50",
//     hoverColor: "hover:bg-teal-100",
//     gradient: "from-teal-500 to-teal-600",
//     lightGradient: "from-teal-400 to-teal-500",
//     animation: "bounce",
//     mobileIcon: <Users className="w-5 h-5 text-teal-600" />
//   },
//   WHATSAPP_DISCONNECTED: {
//     label: "WhatsApp Disconnected",
//     icon: "📱",
//     lucideIcon: MessageSquare,
//     color: "bg-pink-100 text-pink-700 border-pink-200",
//     textColor: "text-pink-700",
//     bgColor: "bg-pink-50",
//     hoverColor: "hover:bg-pink-100",
//     gradient: "from-pink-500 to-pink-600",
//     lightGradient: "from-pink-400 to-pink-500",
//     animation: "shake",
//     mobileIcon: <MessageSquare className="w-5 h-5 text-pink-600" />
//   },
//   SUBSCRIPTION_EXPIRING: {
//     label: "Subscription Expiring",
//     icon: "⚠️",
//     lucideIcon: Clock3,
//     color: "bg-yellow-100 text-yellow-700 border-yellow-200",
//     textColor: "text-yellow-700",
//     bgColor: "bg-yellow-50",
//     hoverColor: "hover:bg-yellow-100",
//     gradient: "from-yellow-500 to-yellow-600",
//     lightGradient: "from-yellow-400 to-yellow-500",
//     animation: "pulse",
//     mobileIcon: <Clock3 className="w-5 h-5 text-yellow-600" />
//   },
//   LIMIT_REACHED: {
//     label: "Limit Reached",
//     icon: "🚫",
//     lucideIcon: XCircle,
//     color: "bg-rose-100 text-rose-700 border-rose-200",
//     textColor: "text-rose-700",
//     bgColor: "bg-rose-50",
//     hoverColor: "hover:bg-rose-100",
//     gradient: "from-rose-500 to-rose-600",
//     lightGradient: "from-rose-400 to-rose-500",
//     animation: "shake",
//     mobileIcon: <XCircle className="w-5 h-5 text-rose-600" />
//   }
// };

// const PRIORITY_CONFIG = {
//   low: {
//     label: "Low",
//     color: "bg-gray-100 text-gray-700 border-gray-200",
//     icon: <Bell className="w-3 h-3" />,
//     dotColor: "bg-gray-500",
//     gradient: "from-gray-400 to-gray-500"
//   },
//   normal: {
//     label: "Normal",
//     color: "bg-blue-100 text-blue-700 border-blue-200",
//     icon: <Info className="w-3 h-3" />,
//     dotColor: "bg-blue-500",
//     gradient: "from-blue-400 to-blue-500"
//   },
//   high: {
//     label: "High",
//     color: "bg-amber-100 text-amber-700 border-amber-200",
//     icon: <AlertCircle className="w-3 h-3" />,
//     dotColor: "bg-amber-500",
//     gradient: "from-amber-400 to-amber-500"
//   },
//   urgent: {
//     label: "Urgent",
//     color: "bg-red-100 text-red-700 border-red-200 animate-pulse",
//     icon: <AlertTriangle className="w-3 h-3" />,
//     dotColor: "bg-red-500",
//     gradient: "from-red-400 to-red-500"
//   }
// };

// const STATUS_CONFIG = {
//   pending: {
//     label: "Pending",
//     icon: Clock,
//     color: "bg-yellow-100 text-yellow-700",
//     dotColor: "bg-yellow-500",
//     borderColor: "border-yellow-200"
//   },
//   sent: {
//     label: "Sent",
//     icon: Send,
//     color: "bg-blue-100 text-blue-700",
//     dotColor: "bg-blue-500",
//     borderColor: "border-blue-200"
//   },
//   delivered: {
//     label: "Delivered",
//     icon: Check,
//     color: "bg-green-100 text-green-700",
//     dotColor: "bg-green-500",
//     borderColor: "border-green-200"
//   },
//   read: {
//     label: "Read",
//     icon: Eye,
//     color: "bg-gray-100 text-gray-700",
//     dotColor: "bg-gray-500",
//     borderColor: "border-gray-200"
//   },
//   failed: {
//     label: "Failed",
//     icon: XCircle,
//     color: "bg-red-100 text-red-700",
//     dotColor: "bg-red-500",
//     borderColor: "border-red-200"
//   }
// };

// // ==================== COMPONENT ====================

// export default function NotificationPage() {
//   // ===== State =====
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
//     urgent: 0,
//     byType: {},
//     byPriority: {},
//     byStatus: {}
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
//   const [viewMode, setViewMode] = useState("list"); // list, grid, compact
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [soundEnabled, setSoundEnabled] = useState(false);
//   const [showBulkActions, setShowBulkActions] = useState(false);
//   const [bulkAction, setBulkAction] = useState("");

//   const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
//   const router = useRouter();

//   const autoRefreshRef = useRef(null);
//   const lastUpdateRef = useRef(new Date());
//   const abortControllerRef = useRef(null);
//   const notificationSoundRef = useRef(null);

//   // ===== Check if mobile =====
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
    
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // ===== Initialize sound =====
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       notificationSoundRef.current = new Audio('/sounds/notification.mp3');
//     }
    
//     const savedSoundPref = localStorage.getItem('notification_sound_enabled');
//     if (savedSoundPref) {
//       setSoundEnabled(savedSoundPref === 'true');
//     }
//   }, []);

//   // ===== Helper Functions =====
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

//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return "Invalid date";
//     }
//   };

//   const formatRelativeTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMins = Math.floor(diffMs / 60000);
//       const diffHours = Math.floor(diffMs / 3600000);
//       const diffDays = Math.floor(diffMs / 86400000);
      
//       if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
//       if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//       if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
//       return 'Just now';
//     } catch (error) {
//       return "Recently";
//     }
//   };

//   // ===== Play notification sound =====
//   const playNotificationSound = useCallback(() => {
//     if (soundEnabled && notificationSoundRef.current) {
//       notificationSoundRef.current.play().catch(() => {});
//     }
//   }, [soundEnabled]);

//   // ===== Toggle sound =====
//   const toggleSound = useCallback(() => {
//     const newValue = !soundEnabled;
//     setSoundEnabled(newValue);
//     localStorage.setItem('notification_sound_enabled', newValue.toString());
    
//     if (newValue) {
//       playNotificationSound();
//     }
//   }, [soundEnabled, playNotificationSound]);

//   // ===== Get notification type config =====
//   const getNotificationConfig = (type) => {
//     return NOTIFICATION_TYPES[type] || {
//       label: type?.replace(/_/g, ' ') || 'Notification',
//       icon: "🔔",
//       lucideIcon: Bell,
//       color: "bg-gray-100 text-gray-700 border-gray-200",
//       textColor: "text-gray-700",
//       bgColor: "bg-gray-50",
//       hoverColor: "hover:bg-gray-100",
//       gradient: "from-gray-500 to-gray-600",
//       lightGradient: "from-gray-400 to-gray-500",
//       animation: "pulse",
//       mobileIcon: <Bell className="w-5 h-5 text-gray-600" />
//     };
//   };

//   // ===== Fetch notifications with companyId =====
//   const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
//     // Cancel previous request if exists
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     abortControllerRef.current = new AbortController();

//     try {
//       if (showLoading) setIsLoading(true);
//       setIsRefreshing(true);

//       // Check authentication
//       if (!isAuthenticated || !user) {
//         toast.error("Please login to view notifications");
//         setIsLoading(false);
//         setIsRefreshing(false);
//         return;
//       }

//       // Check admin role
//       if (user.role !== 'admin') {
//         toast.error("Admin access required");
//         setIsLoading(false);
//         setIsRefreshing(false);
//         return;
//       }

//       // ✅ Get companyId from user object (multiple possible paths)
//       const companyId = user.companyId || user.company_id || user.company?.id || user.company?.companyId;
      
//       if (!companyId) {
//         console.error("❌ No companyId found in user:", user);
//         toast.error("Company information missing. Please contact support.");
//         setIsLoading(false);
//         setIsRefreshing(false);
//         return;
//       }

//       // Build query params
//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         limit: pagination.limit.toString(),
//         sortBy: sortBy,
//         sortOrder: sortOrder
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

//       console.log(`📡 Fetching notifications for company: ${companyId}`);

//       // ✅ Add companyId to headers for SaaS isolation
//       const response = await fetch(`/api/notifications?${queryParams}`, {
//         signal: abortControllerRef.current.signal,
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-company-id': companyId // ✅ Critical for multi-tenancy
//         }
//       });
      
//       if (!response.ok) {
//         if (response.status === 401) {
//           toast.error("Session expired. Please login again.");
//           logout();
//           router.push('/login');
//           return;
//         }
//         if (response.status === 403) {
//           toast.error("You don't have permission to view these notifications");
//           return;
//         }
//         if (response.status === 404) {
//           toast.error("Company not found. Please contact support.");
//           return;
//         }
//         throw new Error(`Failed to fetch notifications: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         setNotifications(data.notifications || []);
//         setFilteredNotifications(data.notifications || []);
//         setPagination(data.pagination || { 
//           page, 
//           limit: pagination.limit, 
//           total: 0, 
//           pages: 1 
//         });
        
//         // Update stats with data from API
//         const newStats = {
//           total: data.statistics?.total || 0,
//           unread: data.statistics?.unread || 0,
//           highPriority: data.statistics?.high || 0,
//           urgent: data.statistics?.urgent || 0,
//           byType: data.statistics?.byType || {},
//           byPriority: data.statistics?.byPriority || {},
//           byStatus: data.statistics?.byStatus || {}
//         };
        
//         // Calculate today's count
//         const today = new Date().toISOString().split('T')[0];
//         const todayCount = (data.notifications || []).filter(n => 
//           new Date(n.createdAt).toISOString().split('T')[0] === today
//         ).length;
        
//         newStats.today = todayCount;
//         setStats(newStats);
        
//         lastUpdateRef.current = new Date();
        
//         console.log(`✅ Fetched ${data.notifications?.length || 0} notifications`);
//       } else {
//         throw new Error(data.message || "Failed to load notifications");
//       }
//     } catch (error) {
//       if (error.name === 'AbortError') {
//         console.log('Fetch aborted');
//         return;
//       }
//       console.error("Error fetching notifications:", error);
//       toast.error(error.message || "Failed to load notifications");
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//       abortControllerRef.current = null;
//     }
//   }, [filters, pagination.limit, sortBy, sortOrder, user, isAuthenticated, logout, router]);

//   // ===== Initial fetch =====
//   useEffect(() => {
//     if (!authLoading && user && isAuthenticated) {
//       fetchNotifications();
      
//       // Auto refresh every 2 minutes if enabled
//       if (autoRefresh) {
//         autoRefreshRef.current = setInterval(() => {
//           if (user && isAuthenticated) {
//             fetchNotifications(pagination.page, false);
//           }
//         }, 120000);
//       }
//     }

//     return () => {
//       if (autoRefreshRef.current) {
//         clearInterval(autoRefreshRef.current);
//       }
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [fetchNotifications, authLoading, user, pagination.page, isAuthenticated, autoRefresh]);

//   // ===== Apply client-side filters =====
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
//         (n.title && n.title.toLowerCase().includes(searchLower)) ||
//         (n.customerPhone && n.customerPhone.includes(searchLower)) ||
//         (n.customerEmail && n.customerEmail.toLowerCase().includes(searchLower))
//       );
//     }

//     setFilteredNotifications(filtered);
//   }, [notifications, filters]);

//   // ===== Mark as read =====
//   const markAsRead = useCallback(async (notificationId) => {
//     try {
//       const companyId = user?.companyId || user?.company_id || user?.company?.id;
      
//       const response = await fetch(`/api/notifications?id=${notificationId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "x-company-id": companyId
//         },
//         body: JSON.stringify({ markAsRead: true }),
//         credentials: 'include'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setNotifications(prev => prev.map(n =>
//             n.id === notificationId ? { ...n, status: "read", readAt: new Date().toISOString() } : n
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

//           toast.success("Marked as read", {
//             icon: '👁️',
//             duration: 2000
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error marking as read:", error);
//       toast.error("Failed to mark as read");
//     }
//   }, [user]);

//   // ===== Mark all as read =====
//   const markAllAsRead = useCallback(async () => {
//     try {
//       const unreadNotifications = notifications.filter(n => n.status !== "read");
//       if (unreadNotifications.length === 0) {
//         toast.success("All notifications are already read", {
//           icon: '✅'
//         });
//         return;
//       }

//       const companyId = user?.companyId || user?.company_id || user?.company?.id;
      
//       const response = await fetch(`/api/notifications`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           "x-company-id": companyId
//         },
//         body: JSON.stringify({ markAllAsRead: true }),
//         credentials: 'include'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setNotifications(prev => prev.map(n => ({
//           ...n,
//           status: "read",
//           readAt: new Date().toISOString()
//         })));
        
//         setStats(prev => ({
//           ...prev,
//           unread: 0
//         }));
        
//         toast.success(`Marked ${data.modifiedCount || unreadNotifications.length} notifications as read`, {
//           icon: '✅'
//         });
        
//         // Play sound if enabled
//         playNotificationSound();
//       }
//     } catch (error) {
//       console.error("Error marking all as read:", error);
//       toast.error("Failed to mark all as read");
//     }
//   }, [notifications, user, playNotificationSound]);

//   // ===== Delete notification =====
//   const deleteNotification = useCallback(async (notificationId) => {
//     try {
//       const companyId = user?.companyId || user?.company_id || user?.company?.id;
      
//       const response = await fetch(`/api/notifications?id=${notificationId}`, {
//         method: "DELETE",
//         credentials: 'include',
//         headers: {
//           "x-company-id": companyId
//         }
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

//           toast.success("Notification deleted", {
//             icon: '🗑️'
//           });
          
//           // Refresh to update stats
//           fetchNotifications(pagination.page, false);
//         }
//       }
//     } catch (error) {
//       console.error("Error deleting notification:", error);
//       toast.error("Failed to delete notification");
//     }
//   }, [fetchNotifications, pagination.page, user]);

//   // ===== Delete selected =====
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

//   // ===== Bulk action =====
//   const handleBulkAction = useCallback(async () => {
//     if (!bulkAction || selectedNotifications.size === 0) return;

//     if (bulkAction === 'markAsRead') {
//       const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
//       await Promise.all(promises);
//       toast.success(`Marked ${selectedNotifications.size} notifications as read`);
//     } else if (bulkAction === 'delete') {
//       await deleteSelected();
//     }

//     setBulkAction("");
//     setShowBulkActions(false);
//   }, [bulkAction, selectedNotifications, markAsRead, deleteSelected]);

//   // ===== Toggle selection =====
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

//   // ===== Select all visible =====
//   const selectAllVisible = useCallback(() => {
//     if (selectedNotifications.size === filteredNotifications.length) {
//       setSelectedNotifications(new Set());
//     } else {
//       const allIds = filteredNotifications.map(n => n.id);
//       setSelectedNotifications(new Set(allIds));
//     }
//   }, [filteredNotifications, selectedNotifications.size]);

//   // ===== Handle page change =====
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.pages) {
//       setPagination(prev => ({ ...prev, page: newPage }));
//       fetchNotifications(newPage);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   // ===== Clear all filters =====
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
    
//     // Reset to first page
//     if (pagination.page !== 1) {
//       setPagination(prev => ({ ...prev, page: 1 }));
//       fetchNotifications(1);
//     } else {
//       fetchNotifications(1);
//     }
//   };

//   // ===== Toggle notification expansion =====
//   const toggleNotificationExpansion = (notificationId) => {
//     setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
//   };

//   // ===== Toggle sort =====
//   const toggleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
//     } else {
//       setSortBy(field);
//       setSortOrder('desc');
//     }
//     fetchNotifications(1);
//   };

//   // ===== Export notifications =====
//   const exportNotifications = () => {
//     try {
//       const dataStr = JSON.stringify(filteredNotifications, null, 2);
//       const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//       const exportFileDefaultName = `notifications_${new Date().toISOString().split('T')[0]}.json`;
      
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
      
//       toast.success(`Exported ${filteredNotifications.length} notifications`);
//     } catch (error) {
//       console.error("Export error:", error);
//       toast.error("Failed to export notifications");
//     }
//   };

//   // ===== Copy notification to clipboard =====
//   const copyToClipboard = (notification) => {
//     const text = `${notification.title}\n${notification.message}\nOrder: ${notification.orderNumber || 'N/A'}\nCustomer: ${notification.customerName || 'N/A'}\nTime: ${formatDate(notification.createdAt)}`;
//     navigator.clipboard.writeText(text);
//     toast.success("Copied to clipboard");
//   };

//   // ===== Mobile Filters Panel =====
//   const MobileFiltersPanel = () => (
//     <AnimatePresence>
//       {isMobile && showMobileFilters && (
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           className="fixed inset-0 z-50 bg-white overflow-y-auto"
//         >
//           <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
//             <div className="flex items-center justify-between p-4">
//               <h2 className="text-lg font-bold text-gray-900">Filters</h2>
//               <button
//                 onClick={() => setShowMobileFilters(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
          
//           <div className="p-4 space-y-6 pb-24">
//             {/* Search */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Search
//               </label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search notifications..."
//                   value={filters.search}
//                   onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                   className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Type */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Type
//               </label>
//               <div className="grid grid-cols-2 gap-2">
//                 <button
//                   onClick={() => setFilters(prev => ({ ...prev, type: "all" }))}
//                   className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
//                     filters.type === "all" 
//                       ? "bg-blue-600 text-white shadow-md" 
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   All Types
//                 </button>
//                 {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
//                   <button
//                     key={key}
//                     onClick={() => setFilters(prev => ({ ...prev, type: key }))}
//                     className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
//                       filters.type === key 
//                         ? `${config.color} border-2 shadow-md` 
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {config.mobileIcon}
//                     <span className="truncate">{config.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Status */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {["all", "pending", "sent", "delivered", "read", "failed"].map((status) => {
//                   const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;
//                   return (
//                     <button
//                       key={status}
//                       onClick={() => setFilters(prev => ({ ...prev, status }))}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
//                         filters.status === status 
//                           ? status === "all"
//                             ? "bg-blue-600 text-white shadow-md"
//                             : STATUS_CONFIG[status]?.color + " border-2 shadow-md"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       {status !== "all" && <StatusIcon className="w-3 h-3" />}
//                       {status === "all" ? "All" : STATUS_CONFIG[status]?.label || status}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Priority */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Priority
//               </label>
//               <div className="grid grid-cols-4 gap-2">
//                 {["all", "low", "normal", "high", "urgent"].map((priority) => (
//                   <button
//                     key={priority}
//                     onClick={() => setFilters(prev => ({ ...prev, priority }))}
//                     className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all ${
//                       filters.priority === priority 
//                         ? priority === "all" 
//                           ? "bg-blue-600 text-white shadow-md"
//                           : PRIORITY_CONFIG[priority]?.color + " border-2 shadow-md"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {priority === "all" ? "All" : priority}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Date Range */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date Range
//               </label>
//               <div className="grid grid-cols-2 gap-2">
//                 {["all", "today", "week", "month"].map((range) => (
//                   <button
//                     key={range}
//                     onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
//                     className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
//                       filters.dateRange === range 
//                         ? "bg-blue-600 text-white shadow-md" 
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {range === "all" ? "All Time" : 
//                      range === "today" ? "Today" : 
//                      range === "week" ? "Last 7 Days" : "Last 30 Days"}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Source */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Source
//               </label>
//               <select
//                 value={filters.source}
//                 onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
//                 className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Sources</option>
//                 <option value="whatsapp-bot">WhatsApp Bot</option>
//                 <option value="dashboard">Dashboard</option>
//                 <option value="system">System</option>
//                 <option value="api">API</option>
//                 <option value="cron">Scheduled</option>
//               </select>
//             </div>

//             {/* Active Filters Summary */}
//             {Object.values(filters).some(v => v !== "all" && v !== "") && (
//               <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
//                 <h3 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {filters.type !== "all" && (
//                     <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
//                       Type: {NOTIFICATION_TYPES[filters.type]?.label || filters.type}
//                     </span>
//                   )}
//                   {filters.status !== "all" && (
//                     <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
//                       Status: {STATUS_CONFIG[filters.status]?.label || filters.status}
//                     </span>
//                   )}
//                   {filters.priority !== "all" && (
//                     <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
//                       Priority: {filters.priority}
//                     </span>
//                   )}
//                   {filters.dateRange !== "all" && (
//                     <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
//                       Range: {filters.dateRange}
//                     </span>
//                   )}
//                   {filters.source !== "all" && (
//                     <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
//                       Source: {filters.source}
//                     </span>
//                   )}
//                   {filters.search && (
//                     <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
//                       Search: "{filters.search}"
//                     </span>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Bottom Action Bar */}
//           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={clearFilters}
//                 className="py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
//               >
//                 Clear All
//               </button>
//               <button
//                 onClick={() => {
//                   setShowMobileFilters(false);
//                   fetchNotifications(1);
//                 }}
//                 className="py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );

//   // ===== Loading State =====
//   if (authLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//           <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
//           <p className="mt-2 text-sm text-gray-500">Please wait</p>
//         </div>
//       </div>
//     );
//   }

//   // ===== Auth Check =====
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

//   // ===== Admin Check =====
//   if (user.role !== 'admin') {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//         <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
//           <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Shield className="w-10 h-10 text-amber-500" />
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

//   // ===== Company Check =====
//   const companyId = user.companyId || user.company_id || user.company?.id || user.company?.companyId;
//   if (!companyId) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//         <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
//           <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Building className="w-10 h-10 text-yellow-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-3">Company Setup Required</h2>
//           <p className="text-gray-600 mb-8">Your company profile needs to be set up before viewing notifications.</p>
//           <button
//             onClick={() => router.push('/admin/settings/company')}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
//           >
//             Setup Company
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
//           success: {
//             icon: '✅',
//             style: {
//               background: '#10b981',
//             },
//           },
//           error: {
//             icon: '❌',
//             style: {
//               background: '#ef4444',
//             },
//           },
//           loading: {
//             icon: <Loader2 className="w-4 h-4 animate-spin" />,
//             style: {
//               background: '#3b82f6',
//             },
//           },
//         }}
//       />
      
//       {/* Mobile Header */}
//       {isMobile && (
//         <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between p-4">
//             <div className="flex items-center gap-3">
//               <div>
//                 <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <BellRing className="w-5 h-5 text-blue-600" />
//                   Notifications
//                 </h1>
//                 <p className="text-xs text-gray-500 flex items-center gap-1">
//                   <span className={`w-2 h-2 rounded-full ${stats.unread > 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></span>
//                   {stats.unread} unread • {stats.today} today
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setAutoRefresh(!autoRefresh)}
//                 className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
//                 title={autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
//               >
//                 {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
//               </button>
//               <button
//                 onClick={toggleSound}
//                 className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
//                 title={soundEnabled ? "Sound on" : "Sound off"}
//               >
//                 {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
//               </button>
//               <button
//                 onClick={() => fetchNotifications(pagination.page, false)}
//                 disabled={isRefreshing}
//                 className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
//                 title="Refresh"
//               >
//                 <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
//               </button>
//               <button
//                 onClick={markAllAsRead}
//                 disabled={stats.unread === 0}
//                 className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
//                 title="Mark all as read"
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
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                 title="Filters"
//               >
//                 <Filter className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isMobile ? 'pt-0 pb-20' : 'p-4 md:p-6'}`}>
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
//                       <BellRing className="w-10 h-10 text-blue-600 animate-pulse-subtle" />
//                       {stats.unread > 0 && (
//                         <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
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
//                   <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
//                     <Building className="w-5 h-5" />
//                     Company: {user.companyName || user.company?.name || 'Your Company'}
//                   </p>
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   {/* Sound Toggle */}
//                   <button
//                     onClick={toggleSound}
//                     className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
//                       soundEnabled 
//                         ? 'bg-blue-100 text-blue-700 border border-blue-200' 
//                         : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
//                     }`}
//                     title={soundEnabled ? "Sound on" : "Sound off"}
//                   >
//                     {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
//                   </button>

//                   {/* Auto-refresh Toggle */}
//                   <button
//                     onClick={() => setAutoRefresh(!autoRefresh)}
//                     className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
//                       autoRefresh 
//                         ? 'bg-green-100 text-green-700 border border-green-200' 
//                         : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
//                     }`}
//                   >
//                     {autoRefresh ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
//                     <span className="font-medium">Auto-refresh</span>
//                   </button>

//                   <button
//                     onClick={() => fetchNotifications(pagination.page, false)}
//                     disabled={isRefreshing}
//                     className="px-5 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-3 disabled:opacity-50 group"
//                   >
//                     <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
//                     <span className="font-medium">Refresh</span>
//                   </button>
                  
//                   <button
//                     onClick={markAllAsRead}
//                     disabled={stats.unread === 0}
//                     className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3 disabled:opacity-50 group"
//                   >
//                     <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
//                     <span className="font-medium">Mark All Read</span>
//                   </button>

//                   <button
//                     onClick={exportNotifications}
//                     className="px-5 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-3"
//                     title="Export notifications"
//                   >
//                     <Download className="w-5 h-5" />
//                   </button>

//                   {/* View Mode Toggle */}
//                   <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm">
//                     <button
//                       onClick={() => setViewMode("list")}
//                       className={`p-3 rounded-l-xl transition-all ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
//                       title="List view"
//                     >
//                       <List className="w-5 h-5" />
//                     </button>
//                     <button
//                       onClick={() => setViewMode("grid")}
//                       className={`p-3 border-l border-gray-300 transition-all ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
//                       title="Grid view"
//                     >
//                       <Grid className="w-5 h-5" />
//                     </button>
//                     <button
//                       onClick={() => setViewMode("compact")}
//                       className={`p-3 border-l border-gray-300 rounded-r-xl transition-all ${viewMode === "compact" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
//                       title="Compact view"
//                     >
//                       <Minimize2 className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
//                 <motion.div 
//                   whileHover={{ scale: 1.02 }}
//                   className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">Total</p>
//                       <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                       <Bell className="w-6 h-6 text-blue-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
//                     <motion.div 
//                       initial={{ width: 0 }}
//                       animate={{ width: `${Math.min((stats.total / 100) * 100, 100)}%` }}
//                       transition={{ duration: 1 }}
//                       className="h-full bg-blue-500 rounded-full" 
//                     />
//                   </div>
//                 </motion.div>

//                 <motion.div 
//                   whileHover={{ scale: 1.02 }}
//                   className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">Unread</p>
//                       <p className="text-3xl font-bold text-amber-600">{stats.unread}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
//                       <BellRing className="w-6 h-6 text-amber-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4 text-sm flex items-center gap-2">
//                     <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
//                       {stats.urgent} urgent
//                     </span>
//                     <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
//                       {stats.highPriority} high
//                     </span>
//                   </div>
//                 </motion.div>

//                 <motion.div 
//                   whileHover={{ scale: 1.02 }}
//                   className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">Today</p>
//                       <p className="text-3xl font-bold text-green-600">{stats.today}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                       <Calendar className="w-6 h-6 text-green-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4 text-sm text-gray-500 flex items-center gap-1">
//                     <Clock className="w-4 h-4" />
//                     Updated: {lastUpdateRef.current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </motion.div>

//                 <motion.div 
//                   whileHover={{ scale: 1.02 }}
//                   className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">By Priority</p>
//                       <div className="flex gap-2 mt-1">
//                         <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
//                           {stats.byPriority?.urgent || 0} urgent
//                         </span>
//                         <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
//                           {stats.byPriority?.high || 0} high
//                         </span>
//                       </div>
//                     </div>
//                     <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
//                       <TrendingUp className="w-6 h-6 text-purple-600" />
//                     </div>
//                   </div>
//                   <div className="mt-4 text-sm text-gray-500">
//                     Normal: {stats.byPriority?.normal || 0} • Low: {stats.byPriority?.low || 0}
//                   </div>
//                 </motion.div>

//                 <motion.div 
//                   whileHover={{ scale: 1.02 }}
//                   className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500 font-medium mb-2">By Status</p>
//                       <div className="flex gap-2 mt-1">
//                         <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
//                           {stats.byStatus?.pending || 0} pending
//                         </span>
//                         <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
//                           {stats.byStatus?.delivered || 0} delivered
//                         </span>
//                       </div>
//                     </div>
//                     <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
//                       <Layers className="w-6 h-6 text-indigo-600" />
//                     </div>
//                   </div>
//                 </motion.div>
//               </div>

//               {/* Type Distribution */}
//               {Object.keys(stats.byType).length > 0 && (
//                 <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
//                   <h3 className="text-sm font-medium text-gray-700 mb-4">Notifications by Type</h3>
//                   <div className="flex flex-wrap gap-3">
//                     {Object.entries(stats.byType).map(([type, count]) => {
//                       const config = getNotificationConfig(type);
//                       const LucideIcon = config.lucideIcon;
//                       return (
//                         <motion.div 
//                           key={type} 
//                           whileHover={{ scale: 1.05 }}
//                           className={`px-4 py-2 rounded-xl ${config.bgColor} border ${config.color} flex items-center gap-2 shadow-sm`}
//                         >
//                           <LucideIcon className="w-4 h-4" />
//                           <span className="font-medium">{config.label}</span>
//                           <span className="ml-2 font-bold bg-white px-2 py-0.5 rounded-full text-xs">
//                             {count}
//                           </span>
//                         </motion.div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* Desktop Filter Panel */}
//         {!isMobile && (
//           <div className="mb-6">
//             <div className="flex items-center gap-4 mb-4">
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm hover:shadow group"
//               >
//                 <Filter className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
//                 <span className="font-medium">Filters</span>
//                 {Object.values(filters).some(v => v !== "all" && v !== "") && (
//                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
//                 )}
//                 <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
//               </button>

//               {selectedNotifications.size > 0 && (
//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   className="relative"
//                 >
//                   <button
//                     onClick={() => setShowBulkActions(!showBulkActions)}
//                     className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-3 shadow-sm hover:shadow"
//                   >
//                     <Layers className="w-5 h-5" />
//                     <span className="font-medium">
//                       Bulk Actions ({selectedNotifications.size})
//                     </span>
//                     <ChevronDown className={`w-4 h-4 transition-transform ${showBulkActions ? "rotate-180" : ""}`} />
//                   </button>

//                   <AnimatePresence>
//                     {showBulkActions && (
//                       <motion.div
//                         initial={{ opacity: 0, y: -10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
//                       >
//                         <button
//                           onClick={() => {
//                             setBulkAction('markAsRead');
//                             handleBulkAction();
//                           }}
//                           className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
//                         >
//                           <Eye className="w-4 h-4 text-blue-600" />
//                           <span>Mark as Read</span>
//                         </button>
//                         <button
//                           onClick={() => {
//                             setBulkAction('delete');
//                             handleBulkAction();
//                           }}
//                           className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors text-red-600"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                           <span>Delete</span>
//                         </button>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </motion.div>
//               )}

//               <div className="ml-auto flex items-center gap-4">
//                 <div className="text-sm text-gray-500 flex items-center gap-1">
//                   <Bell className="w-4 h-4" />
//                   <span className="font-medium">{pagination.total}</span> total
//                 </div>
//                 <select
//                   value={pagination.limit}
//                   onChange={(e) => {
//                     setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
//                     fetchNotifications(1);
//                   }}
//                   className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 >
//                   <option value="10">10 per page</option>
//                   <option value="20">20 per page</option>
//                   <option value="50">50 per page</option>
//                   <option value="100">100 per page</option>
//                 </select>

//                 {/* Sort Dropdown */}
//                 <select
//                   value={`${sortBy}-${sortOrder}`}
//                   onChange={(e) => {
//                     const [newSortBy, newSortOrder] = e.target.value.split('-');
//                     setSortBy(newSortBy);
//                     setSortOrder(newSortOrder);
//                     fetchNotifications(1);
//                   }}
//                   className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 >
//                   <option value="createdAt-desc">Newest First</option>
//                   <option value="createdAt-asc">Oldest First</option>
//                   <option value="priority-desc">Priority (High to Low)</option>
//                   <option value="priority-asc">Priority (Low to High)</option>
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
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                     {/* Type Filter */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
//                         <Package className="w-4 h-4" />
//                         Type
//                       </label>
//                       <select
//                         value={filters.type}
//                         onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                       >
//                         <option value="all">All Types</option>
//                         {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
//                           <option key={key} value={key}>
//                             {config.icon} {config.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Status Filter */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
//                         <Clock className="w-4 h-4" />
//                         Status
//                       </label>
//                       <select
//                         value={filters.status}
//                         onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                       >
//                         <option value="all">All Status</option>
//                         <option value="pending">Pending</option>
//                         <option value="sent">Sent</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="read">Read</option>
//                         <option value="failed">Failed</option>
//                       </select>
//                     </div>

//                     {/* Priority Filter */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
//                         <AlertCircle className="w-4 h-4" />
//                         Priority
//                       </label>
//                       <select
//                         value={filters.priority}
//                         onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                       >
//                         <option value="all">All Priorities</option>
//                         <option value="low">Low</option>
//                         <option value="normal">Normal</option>
//                         <option value="high">High</option>
//                         <option value="urgent">Urgent</option>
//                       </select>
//                     </div>

//                     {/* Date Range Filter */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
//                         <Calendar className="w-4 h-4" />
//                         Date Range
//                       </label>
//                       <select
//                         value={filters.dateRange}
//                         onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                       >
//                         <option value="all">All Time</option>
//                         <option value="today">Today</option>
//                         <option value="week">Last 7 Days</option>
//                         <option value="month">Last 30 Days</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Search Bar */}
//                   <div className="mt-6">
//                     <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
//                       <Search className="w-4 h-4" />
//                       Search
//                     </label>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                       <input
//                         type="text"
//                         placeholder="Search by order number, customer, message, phone, email..."
//                         value={filters.search}
//                         onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                         className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>

//                   {/* Filter Actions */}
//                   <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
//                     <button
//                       onClick={clearFilters}
//                       className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
//                     >
//                       <X className="w-4 h-4" />
//                       Clear Filters
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowFilters(false);
//                         fetchNotifications(1);
//                       }}
//                       className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-md"
//                     >
//                       <Check className="w-4 h-4" />
//                       Apply Filters
//                     </button>
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
//             <div className="p-6 border-b border-gray-200 bg-gray-50/50">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search notifications by order number, customer name, message, phone or email..."
//                   value={filters.search}
//                   onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                   className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                 />
//                 {filters.search && (
//                   <button
//                     onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Selection Header */}
//           {selectedNotifications.size > 0 && (
//             <div className="bg-blue-50 border-b border-blue-200 p-4 flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Check className="w-5 h-5 text-blue-600" />
//                 <span className="font-medium text-blue-700">
//                   {selectedNotifications.size} selected
//                 </span>
//                 <button
//                   onClick={selectAllVisible}
//                   className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   {selectedNotifications.size === filteredNotifications.length ? "Deselect all" : "Select all"}
//                 </button>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     Promise.all(Array.from(selectedNotifications).map(id => markAsRead(id)));
//                   }}
//                   className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm font-medium"
//                 >
//                   <Eye className="w-4 h-4" />
//                   Mark Read
//                 </button>
//                 <button
//                   onClick={deleteSelected}
//                   className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-medium"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Notifications List */}
//           {isLoading ? (
//             <div className="flex items-center justify-center p-12 md:p-16">
//               <div className="text-center">
//                 <div className="relative inline-block">
//                   <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
//                   <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                 </div>
//                 <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
//                 <p className="mt-2 text-sm text-gray-500">Fetching your latest updates</p>
//               </div>
//             </div>
//           ) : filteredNotifications.length === 0 ? (
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col items-center justify-center p-12 md:p-16 text-center"
//             >
//               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
//                 <BellOff className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">No notifications found</h3>
//               <p className="text-gray-500 max-w-md mb-6">
//                 {filters.search || filters.type !== "all" || filters.status !== "all" || filters.priority !== "all" || filters.dateRange !== "all" || filters.source !== "all"
//                   ? "No notifications match your current filters. Try adjusting your search criteria."
//                   : "You're all caught up! No new notifications at the moment."}
//               </p>
//               {(filters.search || filters.type !== "all" || filters.status !== "all" || filters.priority !== "all" || filters.dateRange !== "all" || filters.source !== "all") && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 group"
//                 >
//                   <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
//                   Clear all filters
//                 </button>
//               )}
//             </motion.div>
//           ) : (
//             <>
//               {/* View Mode Rendering */}
//               {viewMode === 'grid' && !isMobile ? (
//                 // Grid View
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//                   {filteredNotifications.map((notification, index) => {
//                     const config = getNotificationConfig(notification.type);
//                     const isSelected = selectedNotifications.has(notification.id);
//                     const isUnread = notification.status === "pending" || notification.status === "sent" || notification.status === "delivered";
//                     const LucideIcon = config.lucideIcon;
//                     const PriorityIcon = PRIORITY_CONFIG[notification.priority]?.icon;

//                     return (
//                       <motion.div
//                         key={notification.id}
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: index * 0.05 }}
//                         className={`relative p-4 rounded-xl border transition-all ${
//                           isSelected 
//                             ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/50' 
//                             : isUnread 
//                               ? 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/50' 
//                               : 'border-gray-200 hover:bg-gray-50'
//                         }`}
//                       >
//                         <div className="flex items-start gap-3">
//                           <input
//                             type="checkbox"
//                             checked={isSelected}
//                             onChange={() => toggleSelection(notification.id)}
//                             className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                           />
                          
//                           <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${config.color} border relative`}>
//                             <LucideIcon className="w-6 h-6" />
//                             {isUnread && (
//                               <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
//                             )}
//                           </div>

//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                               <h4 className="font-bold text-gray-900 text-sm truncate">
//                                 {notification.title}
//                               </h4>
//                               <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[notification.priority]?.color}`}>
//                                 {PriorityIcon}
//                                 <span className="ml-1">{notification.priority}</span>
//                               </span>
//                             </div>
                            
//                             <p className="text-xs text-gray-600 line-clamp-2 mb-2">
//                               {notification.message}
//                             </p>

//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center gap-2">
//                                 {notification.orderNumber && (
//                                   <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">
//                                     #{notification.orderNumber}
//                                   </span>
//                                 )}
//                                 <span className="text-xs text-gray-500 flex items-center gap-1">
//                                   <Clock className="w-3 h-3" />
//                                   {formatTime(notification.createdAt)}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <button
//                                   onClick={() => markAsRead(notification.id)}
//                                   className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
//                                   title="Mark as read"
//                                 >
//                                   <Eye className="w-3 h-3" />
//                                 </button>
//                                 <button
//                                   onClick={() => deleteNotification(notification.id)}
//                                   className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-red-600"
//                                   title="Delete"
//                                 >
//                                   <Trash2 className="w-3 h-3" />
//                                 </button>
//                                 <button
//                                   onClick={() => copyToClipboard(notification)}
//                                   className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
//                                   title="Copy"
//                                 >
//                                   <Copy className="w-3 h-3" />
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 // List/Compact View
//                 <div className="divide-y divide-gray-200">
//                   {filteredNotifications.map((notification, index) => {
//                     const config = getNotificationConfig(notification.type);
//                     const isSelected = selectedNotifications.has(notification.id);
//                     const isUnread = notification.status === "pending" || notification.status === "sent" || notification.status === "delivered";
//                     const isExpanded = expandedNotification === notification.id;
//                     const LucideIcon = config.lucideIcon;
//                     const StatusIcon = STATUS_CONFIG[notification.status]?.icon || Clock;

//                     return (
//                       <motion.div
//                         key={notification.id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.05 }}
//                         className={`p-4 md:p-6 hover:bg-gray-50 transition-all ${isUnread ? "bg-blue-50/30" : ""} ${
//                           viewMode === "compact" ? "py-3" : ""
//                         }`}
//                       >
//                         <div className="flex items-start gap-4">
//                           {/* Selection Checkbox - Desktop */}
//                           {!isMobile && (
//                             <div className="flex-shrink-0 pt-1">
//                               <input
//                                 type="checkbox"
//                                 checked={isSelected}
//                                 onChange={() => toggleSelection(notification.id)}
//                                 className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
//                               />
//                             </div>
//                           )}

//                           {/* Notification Icon with Animation */}
//                           <motion.div 
//                             whileHover={{ scale: 1.1, rotate: config.animation === "shake" ? 10 : 0 }}
//                             className={`flex-shrink-0 ${viewMode === "compact" ? 'w-10 h-10' : 'w-14 h-14'} rounded-xl flex items-center justify-center ${config.color} border relative overflow-hidden group`}
//                           >
//                             {isMobile ? (
//                               config.mobileIcon
//                             ) : (
//                               <>
//                                 <LucideIcon className={`w-${viewMode === "compact" ? '5' : '7'} h-${viewMode === "compact" ? '5' : '7'} relative z-10`} />
//                                 <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
//                               </>
//                             )}
//                             {isUnread && (
//                               <span className={`absolute top-0 right-0 w-2 h-2 ${config.color.replace('text', 'bg')} rounded-full animate-pulse`}></span>
//                             )}
//                           </motion.div>

//                           {/* Content */}
//                           <div className="flex-1 min-w-0">
//                             <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
//                               <div className="flex items-start gap-2 flex-1">
//                                 {/* Selection Checkbox - Mobile */}
//                                 {isMobile && (
//                                   <input
//                                     type="checkbox"
//                                     checked={isSelected}
//                                     onChange={() => toggleSelection(notification.id)}
//                                     className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                                   />
//                                 )}
                                
//                                 <div className="flex-1">
//                                   <div className="flex items-center gap-2 mb-1 flex-wrap">
//                                     <h4 className={`font-bold text-gray-900 ${viewMode === "compact" ? 'text-sm' : 'text-base md:text-lg'}`}>
//                                       {notification.title}
//                                     </h4>
//                                     {isUnread && (
//                                       <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
//                                     )}
//                                     {/* Status Badge */}
//                                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[notification.status]?.color || 'bg-gray-100 text-gray-700'}`}>
//                                       <StatusIcon className="w-3 h-3" />
//                                       {STATUS_CONFIG[notification.status]?.label || notification.status}
//                                     </span>
//                                     {/* Priority Badge */}
//                                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[notification.priority]?.color}`}>
//                                       {PRIORITY_CONFIG[notification.priority]?.icon}
//                                       {notification.priority}
//                                     </span>
//                                     {/* Source Badge */}
//                                     {notification.source && (
//                                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
//                                         {notification.source === 'whatsapp-bot' ? <MessageSquare className="w-3 h-3" /> : 
//                                          notification.source === 'dashboard' ? <Bell className="w-3 h-3" /> : 
//                                          notification.source === 'system' ? <Settings className="w-3 h-3" /> : 
//                                          <Globe className="w-3 h-3" />}
//                                         {notification.source}
//                                       </span>
//                                     )}
//                                   </div>
                                  
//                                   <p className={`text-gray-600 ${viewMode === "compact" ? 'text-xs' : 'text-sm md:text-base'} line-clamp-2`}>
//                                     {notification.message}
//                                   </p>
//                                 </div>
//                               </div>

//                               <div className="flex items-center gap-3 mt-2 md:mt-0">
//                                 <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
//                                   <Clock className="w-3 h-3" />
//                                   {isMobile ? formatTime(notification.createdAt) : formatDate(notification.createdAt)}
//                                 </span>
//                                 {isMobile && (
//                                   <button
//                                     onClick={() => toggleNotificationExpansion(notification.id)}
//                                     className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
//                                   >
//                                     <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
//                                   </button>
//                                 )}
//                               </div>
//                             </div>

//                             {/* Metadata - Always visible on desktop, expandable on mobile */}
//                             {(isMobile ? isExpanded : true) && (
//                               <motion.div 
//                                 initial={isMobile ? { height: 0, opacity: 0 } : false}
//                                 animate={isMobile ? { height: "auto", opacity: 1 } : false}
//                                 className="mt-3 md:mt-4"
//                               >
//                                 {/* Order Details */}
//                                 {(notification.orderNumber || notification.customerName || notification.totalAmount || notification.customerPhone || notification.customerEmail) && (
//                                   <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
//                                     {notification.orderNumber && (
//                                       <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
//                                         <ShoppingCart className="w-3 h-3" />
//                                         <span className="font-medium">Order:</span>
//                                         <span className="font-bold text-gray-900">#{notification.orderNumber}</span>
//                                       </span>
//                                     )}
//                                     {notification.customerName && (
//                                       <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
//                                         <Users className="w-3 h-3" />
//                                         <span className="font-medium">Customer:</span>
//                                         <span className="font-bold text-gray-900">{notification.customerName}</span>
//                                       </span>
//                                     )}
//                                     {notification.totalAmount && (
//                                       <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-lg text-green-700">
//                                         <DollarSign className="w-3 h-3" />
//                                         <span className="font-medium">Amount:</span>
//                                         <span className="font-bold">₹{notification.totalAmount}</span>
//                                       </span>
//                                     )}
//                                     {notification.customerPhone && (
//                                       <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
//                                         <Smartphone className="w-3 h-3" />
//                                         <span>{notification.customerPhone}</span>
//                                       </span>
//                                     )}
//                                     {notification.customerEmail && (
//                                       <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
//                                         <Mail className="w-3 h-3" />
//                                         <span className="truncate max-w-[200px]">{notification.customerEmail}</span>
//                                       </span>
//                                     )}
//                                   </div>
//                                 )}

//                                 {/* Metadata from notification */}
//                                 {notification.metadata && Object.keys(notification.metadata).length > 0 && (
//                                   <div className="mb-3 text-xs text-gray-500 flex flex-wrap gap-2">
//                                     {Object.entries(notification.metadata).map(([key, value]) => {
//                                       if (typeof value === 'string' || typeof value === 'number') {
//                                         return (
//                                           <span key={key} className="bg-gray-100 px-2 py-1 rounded-lg">
//                                             {key}: {value.toString()}
//                                           </span>
//                                         );
//                                       }
//                                       return null;
//                                     })}
//                                   </div>
//                                 )}

//                                 {/* Actions */}
//                                 <div className="flex flex-wrap items-center gap-2 mt-4">
//                                   {isUnread && (
//                                     <motion.button
//                                       whileHover={{ scale: 1.05 }}
//                                       whileTap={{ scale: 0.95 }}
//                                       onClick={() => markAsRead(notification.id)}
//                                       className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
//                                     >
//                                       <Eye className="w-4 h-4" />
//                                       Mark as Read
//                                     </motion.button>
//                                   )}
//                                   <motion.button
//                                     whileHover={{ scale: 1.05 }}
//                                     whileTap={{ scale: 0.95 }}
//                                     onClick={() => deleteNotification(notification.id)}
//                                     className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
//                                   >
//                                     <Trash2 className="w-4 h-4" />
//                                     Delete
//                                   </motion.button>
                                  
//                                   {/* View Details Button */}
//                                   {notification.link && (
//                                     <motion.button
//                                       whileHover={{ scale: 1.05 }}
//                                       whileTap={{ scale: 0.95 }}
//                                       onClick={() => router.push(notification.link.to)}
//                                       className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
//                                     >
//                                       <Eye className="w-4 h-4" />
//                                       {notification.link.text || 'View Details'}
//                                     </motion.button>
//                                   )}

//                                   {/* Copy Button */}
//                                   <motion.button
//                                     whileHover={{ scale: 1.05 }}
//                                     whileTap={{ scale: 0.95 }}
//                                     onClick={() => copyToClipboard(notification)}
//                                     className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow"
//                                   >
//                                     <Copy className="w-4 h-4" />
//                                     Copy
//                                   </motion.button>
//                                 </div>

//                                 {/* Read Receipts */}
//                                 {notification.readByUsers && notification.readByUsers.length > 0 && (
//                                   <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
//                                     <Eye className="w-3 h-3" />
//                                     <span>Read by {notification.readByUsers.length} user{notification.readByUsers.length > 1 ? 's' : ''}</span>
//                                     {notification.readAt && (
//                                       <span>• {formatRelativeTime(notification.readAt)}</span>
//                                     )}
//                                   </div>
//                                 )}

//                                 {/* Error info if failed */}
//                                 {notification.status === 'failed' && notification.error && (
//                                   <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
//                                     <div className="flex items-center gap-2 mb-1">
//                                       <XCircle className="w-4 h-4" />
//                                       <span className="font-medium">Error:</span>
//                                     </div>
//                                     <p>{typeof notification.error === 'string' ? notification.error : notification.error.message}</p>
//                                   </div>
//                                 )}
//                               </motion.div>
//                             )}
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </div>
//               )}

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
//                         <div className="flex items-center gap-1">
//                           {pagination.page > 2 && (
//                             <>
//                               <button
//                                 onClick={() => handlePageChange(1)}
//                                 className="w-9 h-9 flex items-center justify-center rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
//                               >
//                                 1
//                               </button>
//                               {pagination.page > 3 && <span className="px-2">...</span>}
//                             </>
//                           )}
                          
//                           {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
//                             let pageNum;
//                             if (pagination.pages <= 5) {
//                               pageNum = i + 1;
//                             } else if (pagination.page <= 3) {
//                               pageNum = i + 1;
//                             } else if (pagination.page >= pagination.pages - 2) {
//                               pageNum = pagination.pages - 4 + i;
//                             } else {
//                               pageNum = pagination.page - 2 + i;
//                             }
                            
//                             return (
//                               <button
//                                 key={pageNum}
//                                 onClick={() => handlePageChange(pageNum)}
//                                 className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium transition-all ${
//                                   pagination.page === pageNum
//                                     ? "bg-blue-600 text-white shadow-md"
//                                     : "border border-gray-300 hover:bg-gray-50"
//                                 }`}
//                               >
//                                 {pageNum}
//                               </button>
//                             );
//                           })}
                          
//                           {pagination.page < pagination.pages - 1 && (
//                             <>
//                               {pagination.page < pagination.pages - 2 && <span className="px-2">...</span>}
//                               <button
//                                 onClick={() => handlePageChange(pagination.pages)}
//                                 className="w-9 h-9 flex items-center justify-center rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
//                               >
//                                 {pagination.pages}
//                               </button>
//                             </>
//                           )}
//                         </div>
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
//             <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
//               {autoRefresh ? (
//                 <>
//                   <RefreshCw className="w-4 h-4 animate-spin-slow" />
//                   Auto-refreshes every 2 minutes
//                 </>
//               ) : (
//                 <>
//                   <Pause className="w-4 h-4" />
//                   Auto-refresh paused
//                 </>
//               )}
//               • Last updated: {lastUpdateRef.current.toLocaleTimeString()}
//             </p>
//           </div>
//         )}

//         {/* Mobile Bottom Navigation */}
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
//               {selectedNotifications.size > 0 ? (
//                 <button
//                   onClick={deleteSelected}
//                   className="flex flex-col items-center p-2 text-red-600"
//                 >
//                   <Trash2 className="w-5 h-5" />
//                   <span className="text-xs mt-1">Delete ({selectedNotifications.size})</span>
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
        
//         @keyframes spin-slow {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
        
//         .animate-pulse-subtle {
//           animation: pulse-subtle 2s ease-in-out infinite;
//         }
        
//         .animate-spin-slow {
//           animation: spin-slow 3s linear infinite;
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


















// app/admin/notifications/page.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Head from 'next/head';
import { appTheme } from "../../../src/constants/theme";
import { useAuth } from '../../../context/AuthContext';
import {
    Bell, BellRing, CheckCircle, Clock, AlertCircle, 
    Filter, Search, RefreshCw, Trash2, Check, ChevronLeft,
    ChevronRight, X, BellOff, Loader2, Package, TrendingUp,
    Calendar, ShoppingCart, CreditCard, Shield, Zap, Megaphone,
    Eye, EyeOff, Download, Printer, Star, DollarSign, Users,
    AlertTriangle, Info, CheckCircle2, XCircle, Mail, MessageSquare,
    Smartphone, Globe, Settings, HelpCircle, Building, Send, Copy,
    ThumbsUp, ThumbsDown, Gift, Award, Target, Flag, Layers,
    Grid, List, Minimize2, Maximize2, Volume2, VolumeX, Play, Pause,
    ArrowLeft, ChevronDown, ChevronUp, MoreHorizontal, Home,
    Clock3, UserCheck, UserX, Lock, Unlock, ExternalLink,
    Hash, AtSign, FileText, Edit2, Plus, Minus, Save, RefreshCw as RefreshIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
const NOTIFICATION_TYPES = {
    NEW_ORDER: {
        label: "New Order",
        icon: ShoppingCart,
        color: appTheme.colors.primary,
        bgColor: `${appTheme.colors.primary}15`,
        description: "New order received"
    },
    PAYMENT_RECEIVED: {
        label: "Payment Received",
        icon: DollarSign,
        color: appTheme.colors.success,
        bgColor: `${appTheme.colors.success}15`,
        description: "Payment has been received"
    },
    PAYMENT_VERIFIED: {
        label: "Payment Verified",
        icon: CheckCircle2,
        color: appTheme.colors.success,
        bgColor: `${appTheme.colors.success}15`,
        description: "Payment verified successfully"
    },
    LOW_STOCK_ALERT: {
        label: "Low Stock",
        icon: Package,
        color: appTheme.colors.warning,
        bgColor: `${appTheme.colors.warning}15`,
        description: "Product stock is running low"
    },
    ORDER_STATUS_CHANGED: {
        label: "Status Update",
        icon: RefreshCw,
        color: appTheme.colors.secondary,
        bgColor: `${appTheme.colors.secondary}15`,
        description: "Order status has been updated"
    },
    SYSTEM_ALERT: {
        label: "System Alert",
        icon: AlertTriangle,
        color: appTheme.colors.error,
        bgColor: `${appTheme.colors.error}15`,
        description: "System alert requires attention"
    },
    ADMIN_ALERT: {
        label: "Admin Alert",
        icon: Megaphone,
        color: appTheme.colors.accent,
        bgColor: `${appTheme.colors.accent}15`,
        description: "Admin notification"
    },
    BOOKING_CONFIRMED: {
        label: "Booking Confirmed",
        icon: Calendar,
        color: appTheme.colors.info,
        bgColor: `${appTheme.colors.info}15`,
        description: "Booking has been confirmed"
    },
    USER_REGISTERED: {
        label: "New User",
        icon: Users,
        color: appTheme.colors.secondary,
        bgColor: `${appTheme.colors.secondary}15`,
        description: "New user registered"
    },
    WHATSAPP_DISCONNECTED: {
        label: "WhatsApp Disconnected",
        icon: MessageSquare,
        color: appTheme.colors.error,
        bgColor: `${appTheme.colors.error}15`,
        description: "WhatsApp connection lost"
    },
    SUBSCRIPTION_EXPIRING: {
        label: "Subscription Expiring",
        icon: Clock3,
        color: appTheme.colors.warning,
        bgColor: `${appTheme.colors.warning}15`,
        description: "Subscription is about to expire"
    },
    LIMIT_REACHED: {
        label: "Limit Reached",
        icon: XCircle,
        color: appTheme.colors.error,
        bgColor: `${appTheme.colors.error}15`,
        description: "Usage limit has been reached"
    }
};

const PRIORITY_CONFIG = {
    low: {
        label: "Low",
        color: appTheme.colors.textSecondary,
        bgColor: `${appTheme.colors.textSecondary}15`,
        borderColor: appTheme.colors.border
    },
    normal: {
        label: "Normal",
        color: appTheme.colors.primary,
        bgColor: `${appTheme.colors.primary}15`,
        borderColor: appTheme.colors.primary
    },
    high: {
        label: "High",
        color: appTheme.colors.warning,
        bgColor: `${appTheme.colors.warning}15`,
        borderColor: appTheme.colors.warning
    },
    urgent: {
        label: "Urgent",
        color: appTheme.colors.error,
        bgColor: `${appTheme.colors.error}15`,
        borderColor: appTheme.colors.error
    }
};

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        icon: Clock,
        color: appTheme.colors.warning,
        bgColor: `${appTheme.colors.warning}15`
    },
    sent: {
        label: "Sent",
        icon: Send,
        color: appTheme.colors.primary,
        bgColor: `${appTheme.colors.primary}15`
    },
    delivered: {
        label: "Delivered",
        icon: Check,
        color: appTheme.colors.success,
        bgColor: `${appTheme.colors.success}15`
    },
    read: {
        label: "Read",
        icon: Eye,
        color: appTheme.colors.textSecondary,
        bgColor: `${appTheme.colors.textSecondary}15`
    },
    failed: {
        label: "Failed",
        icon: XCircle,
        color: appTheme.colors.error,
        bgColor: `${appTheme.colors.error}15`
    }
};

export default function NotificationsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
    
    // Refs
    const fieldRefs = useRef({});
    const autoRefreshRef = useRef(null);
    const abortControllerRef = useRef(null);
    
    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [selectedNotifications, setSelectedNotifications] = useState(new Set());
    const [expandedNotification, setExpandedNotification] = useState(null);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [apiError, setApiError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // list, compact
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    // Stats
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        today: 0,
        urgent: 0,
        high: 0,
        byType: {},
        byPriority: {},
        byStatus: {}
    });

    // Filters
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        priority: 'all',
        search: '',
        dateRange: 'all',
        source: 'all'
    });

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });

    // Sort
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Mobile detection
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

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (!isCompanyAdmin && !isSuperAdmin) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isCompanyAdmin, isSuperAdmin, router]);

    // Fetch company info on mount
    useEffect(() => {
        if (user?.companyId) {
            fetchCompanyInfo();
            fetchNotifications();
        }
    }, [user]);

    // Auto refresh
    useEffect(() => {
        if (autoRefresh && user?.companyId) {
            autoRefreshRef.current = setInterval(() => {
                fetchNotifications(pagination.page, false);
            }, 120000); // 2 minutes
        }

        return () => {
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
            }
        };
    }, [autoRefresh, user, pagination.page]);

    // Apply client-side filters
    useEffect(() => {
        if (!notifications.length) return;

        let filtered = [...notifications];

        // Type filter
        if (filters.type !== 'all') {
            filtered = filtered.filter(n => n.type === filters.type);
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(n => n.status === filters.status);
        }

        // Priority filter
        if (filters.priority !== 'all') {
            filtered = filtered.filter(n => n.priority === filters.priority);
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(n =>
                (n.orderNumber && n.orderNumber.toLowerCase().includes(searchLower)) ||
                (n.customerName && n.customerName.toLowerCase().includes(searchLower)) ||
                (n.message && n.message.toLowerCase().includes(searchLower)) ||
                (n.title && n.title.toLowerCase().includes(searchLower))
            );
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(n => {
                const date = new Date(n.createdAt);
                if (filters.dateRange === 'today') {
                    return date >= today;
                } else if (filters.dateRange === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    return date >= weekAgo;
                } else if (filters.dateRange === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    return date >= monthAgo;
                }
                return true;
            });
        }

        // Source filter
        if (filters.source !== 'all') {
            filtered = filtered.filter(n => n.source === filters.source);
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'createdAt') {
                return sortOrder === 'desc' 
                    ? new Date(b.createdAt) - new Date(a.createdAt)
                    : new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === 'priority') {
                const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
                const aPriority = priorityOrder[a.priority] || 0;
                const bPriority = priorityOrder[b.priority] || 0;
                return sortOrder === 'desc' ? bPriority - aPriority : aPriority - bPriority;
            }
            return 0;
        });

        setFilteredNotifications(filtered);
        setPagination(prev => ({
            ...prev,
            total: filtered.length,
            pages: Math.ceil(filtered.length / prev.limit)
        }));
    }, [notifications, filters, sortBy, sortOrder]);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    // Fetch company info
    const fetchCompanyInfo = async () => {
        try {
            const res = await fetch(`/api/companies/me`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setCompanyInfo(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch company info:', error);
        }
    };

    // Fetch notifications
    const fetchNotifications = useCallback(async (page = 1, showLoading = true) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            if (showLoading) setLoading(true);
            setRefreshing(true);
            setApiError(null);

            const companyId = user?.companyId;
            if (!companyId) {
                throw new Error('Company ID not found');
            }

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                sortBy,
                sortOrder
            });

            const res = await fetch(`/api/notifications?${queryParams}`, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'x-company-id': companyId,
                    ...getAuthHeaders()
                }
            });

            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("You don't have permission to view notifications");
                }
                throw new Error(`Failed to fetch: ${res.status}`);
            }

            const data = await res.json();

            if (data.success) {
                setNotifications(data.notifications || []);
                
                // Calculate stats
                const notifs = data.notifications || [];
                const today = new Date().toISOString().split('T')[0];
                
                const newStats = {
                    total: notifs.length,
                    unread: notifs.filter(n => n.status !== 'read').length,
                    today: notifs.filter(n => n.createdAt?.startsWith(today)).length,
                    urgent: notifs.filter(n => n.priority === 'urgent').length,
                    high: notifs.filter(n => n.priority === 'high').length,
                    byType: {},
                    byPriority: {},
                    byStatus: {}
                };

                notifs.forEach(n => {
                    newStats.byType[n.type] = (newStats.byType[n.type] || 0) + 1;
                    newStats.byPriority[n.priority] = (newStats.byPriority[n.priority] || 0) + 1;
                    newStats.byStatus[n.status] = (newStats.byStatus[n.status] || 0) + 1;
                });

                setStats(newStats);
                setPagination(prev => ({
                    ...prev,
                    page,
                    total: data.pagination?.total || notifs.length,
                    pages: data.pagination?.pages || Math.ceil(notifs.length / prev.limit)
                }));

                showToast('success', 'Notifications refreshed');
            } else {
                throw new Error(data.message || 'Failed to load notifications');
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching notifications:', error);
            setApiError(error.message);
            showToast('error', error.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
            abortControllerRef.current = null;
        }
    }, [user, pagination.limit, sortBy, sortOrder, getAuthHeaders]);

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
        } catch {
            return 'Recently';
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
        } catch {
            return 'Invalid date';
        }
    };

    // Mark as read
    const markAsRead = async (notificationId) => {
        try {
            const companyId = user?.companyId;
            const res = await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-company-id': companyId,
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ markAsRead: true })
            });

            const data = await res.json();

            if (data.success) {
                setNotifications(prev => prev.map(n =>
                    n.id === notificationId ? { ...n, status: 'read', readAt: new Date().toISOString() } : n
                ));
                setSelectedNotifications(prev => {
                    const next = new Set(prev);
                    next.delete(notificationId);
                    return next;
                });
                showToast('success', 'Marked as read');
            }
        } catch (error) {
            console.error('Error marking as read:', error);
            showToast('error', 'Failed to mark as read');
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications
                .filter(n => n.status !== 'read')
                .map(n => n.id);

            if (unreadIds.length === 0) {
                showToast('info', 'No unread notifications');
                return;
            }

            const companyId = user?.companyId;
            const res = await fetch(`/api/notifications`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-company-id': companyId,
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ markAllAsRead: true })
            });

            const data = await res.json();

            if (data.success) {
                setNotifications(prev => prev.map(n => ({
                    ...n,
                    status: 'read',
                    readAt: new Date().toISOString()
                })));
                setSelectedNotifications(new Set());
                showToast('success', `Marked ${unreadIds.length} notifications as read`);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            showToast('error', 'Failed to mark all as read');
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const companyId = user?.companyId;
            const res = await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'x-company-id': companyId,
                    ...getAuthHeaders()
                }
            });

            const data = await res.json();

            if (data.success) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                setSelectedNotifications(prev => {
                    const next = new Set(prev);
                    next.delete(notificationId);
                    return next;
                });
                showToast('success', 'Notification deleted');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            showToast('error', 'Failed to delete notification');
        }
    };

    // Delete selected
    const deleteSelected = async () => {
        if (selectedNotifications.size === 0) return;

        try {
            const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
            await Promise.all(promises);
            showToast('success', `Deleted ${selectedNotifications.size} notifications`);
            setSelectedNotifications(new Set());
        } catch (error) {
            console.error('Error deleting selected:', error);
            showToast('error', 'Failed to delete selected notifications');
        }
    };

    // Toggle selection
    const toggleSelection = (notificationId) => {
        setSelectedNotifications(prev => {
            const next = new Set(prev);
            if (next.has(notificationId)) {
                next.delete(notificationId);
            } else {
                next.add(notificationId);
            }
            return next;
        });
    };

    // Select all visible
    const selectAllVisible = () => {
        if (selectedNotifications.size === filteredNotifications.length) {
            setSelectedNotifications(new Set());
        } else {
            const allIds = filteredNotifications.map(n => n.id);
            setSelectedNotifications(new Set(allIds));
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            type: 'all',
            status: 'all',
            priority: 'all',
            search: '',
            dateRange: 'all',
            source: 'all'
        });
        setShowFilters(false);
    };

    // Get notification config
    const getNotificationConfig = (type) => {
        return NOTIFICATION_TYPES[type] || {
            label: type?.replace(/_/g, ' ') || 'Notification',
            icon: Bell,
            color: appTheme.colors.textSecondary,
            bgColor: `${appTheme.colors.textSecondary}15`,
            description: 'Notification'
        };
    };

    // Copy to clipboard
    const copyToClipboard = (notification) => {
        const text = `${notification.title || 'Notification'}\n${notification.message || ''}\nOrder: ${notification.orderNumber || 'N/A'}\nCustomer: ${notification.customerName || 'N/A'}\nTime: ${formatDate(notification.createdAt)}`;
        navigator.clipboard.writeText(text);
        showToast('success', 'Copied to clipboard');
    };

    // Handle back
    const handleBack = useCallback(() => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/admin/dashboard');
        }
    }, [router]);

    if (!isAuthenticated || !user) {
        return null;
    }

    // Get current page notifications
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

    return (
        <>
            <Head>
                <title>Notifications | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="notifications-page">
                {/* Toast Notification */}
                {toast.show && (
                    <div className={`toast-notification ${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : 
                         toast.type === 'error' ? <AlertCircle size={20} /> : 
                         <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <header className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <button
                                onClick={handleBack}
                                className="back-button"
                            >
                                <ArrowLeft size={20} />
                                <span>Back to Dashboard</span>
                            </button>
                            <h1 className="page-title">
                                <BellRing size={28} className="title-icon" />
                                Notifications
                            </h1>
                            <p className="page-description">
                                {stats.unread > 0 
                                    ? `You have ${stats.unread} unread notification${stats.unread > 1 ? 's' : ''}`
                                    : 'No new notifications'}
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`header-action-btn ${autoRefresh ? 'active' : ''}`}
                                title={autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
                            >
                                {autoRefresh ? <Play size={18} /> : <Pause size={18} />}
                            </button>
                            <button
                                onClick={() => fetchNotifications(pagination.page, false)}
                                disabled={refreshing}
                                className="header-action-btn"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                            </button>
                            <button
                                onClick={markAllAsRead}
                                disabled={stats.unread === 0}
                                className="save-button"
                            >
                                <CheckCircle size={16} />
                                <span>Mark All Read</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Company Context Banner */}
                <div className="company-banner">
                    <div className="company-banner-content">
                        <div className="company-banner-left">
                            <Building size={18} />
                            <span>
                                {isSuperAdmin ? 'Super Admin' : 'Company Admin'} · 
                                {companyInfo?.companyName || user?.companyName || 'Your Company'}
                            </span>
                        </div>
                        {isSuperAdmin && (
                            <div className="super-admin-badge">
                                <Shield size={14} />
                                Super Admin
                            </div>
                        )}
                    </div>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <div className="api-error">
                        <AlertCircle size={18} />
                        <span>{apiError}</span>
                    </div>
                )}

                {/* Main Content */}
                <main className="main-content">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: `${appTheme.colors.primary}15` }}>
                                <Bell size={20} style={{ color: appTheme.colors.primary }} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Total</span>
                                <span className="stat-value">{stats.total}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: `${appTheme.colors.warning}15` }}>
                                <BellRing size={20} style={{ color: appTheme.colors.warning }} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Unread</span>
                                <span className="stat-value">{stats.unread}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: `${appTheme.colors.success}15` }}>
                                <Calendar size={20} style={{ color: appTheme.colors.success }} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Today</span>
                                <span className="stat-value">{stats.today}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: `${appTheme.colors.error}15` }}>
                                <AlertTriangle size={20} style={{ color: appTheme.colors.error }} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Urgent</span>
                                <span className="stat-value">{stats.urgent}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <div className="filter-left">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="filter-toggle"
                            >
                                <Filter size={16} />
                                <span>Filters</span>
                                <ChevronDown size={14} className={showFilters ? 'rotated' : ''} />
                                {Object.values(filters).some(v => v !== 'all' && v !== '') && (
                                    <span className="filter-dot"></span>
                                )}
                            </button>

                            <div className="view-toggle">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={viewMode === 'list' ? 'active' : ''}
                                    title="List view"
                                >
                                    <List size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('compact')}
                                    className={viewMode === 'compact' ? 'active' : ''}
                                    title="Compact view"
                                >
                                    <Minimize2 size={16} />
                                </button>
                            </div>

                            {selectedNotifications.size > 0 && (
                                <div className="bulk-actions">
                                    <span className="selected-count">{selectedNotifications.size} selected</span>
                                    <button
                                        onClick={selectAllVisible}
                                        className="bulk-btn"
                                    >
                                        {selectedNotifications.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
                                    </button>
                                    <button
                                        onClick={deleteSelected}
                                        className="bulk-btn delete"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="filter-right">
                            <div className="search-box">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                                {filters.search && (
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                        className="clear-search"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                                    setSortBy(newSortBy);
                                    setSortOrder(newSortOrder);
                                }}
                                className="sort-select"
                            >
                                <option value="createdAt-desc">Newest first</option>
                                <option value="createdAt-asc">Oldest first</option>
                                <option value="priority-desc">Priority (High to Low)</option>
                                <option value="priority-asc">Priority (Low to High)</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="filter-panel">
                            <div className="filter-grid">
                                <div className="filter-group">
                                    <label>Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="all">All Types</option>
                                        {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="all">All Status</option>
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>Priority</label>
                                    <select
                                        value={filters.priority}
                                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                                    >
                                        <option value="all">All Priorities</option>
                                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>Date Range</label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>Source</label>
                                    <select
                                        value={filters.source}
                                        onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                                    >
                                        <option value="all">All Sources</option>
                                        <option value="whatsapp-bot">WhatsApp Bot</option>
                                        <option value="dashboard">Dashboard</option>
                                        <option value="system">System</option>
                                        <option value="api">API</option>
                                    </select>
                                </div>

                                <div className="filter-actions">
                                    <button onClick={clearFilters} className="clear-filters">
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications List */}
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading notifications...</p>
                        </div>
                    ) : currentNotifications.length === 0 ? (
                        <div className="empty-state">
                            <BellOff size={48} className="empty-icon" />
                            <h3>No notifications found</h3>
                            <p>
                                {filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all'
                                    ? 'No notifications match your filters. Try adjusting your search criteria.'
                                    : 'You\'re all caught up! No new notifications at the moment.'}
                            </p>
                            {(filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all') && (
                                <button onClick={clearFilters} className="clear-filters-btn">
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`notifications-list ${viewMode}`}>
                            {currentNotifications.map((notification, index) => {
                                const config = getNotificationConfig(notification.type);
                                const Icon = config.icon;
                                const isUnread = notification.status !== 'read';
                                const isSelected = selectedNotifications.has(notification.id);
                                const isExpanded = expandedNotification === notification.id;
                                const StatusIcon = STATUS_CONFIG[notification.status]?.icon || Clock;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${isUnread ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => !isMobile && toggleSelection(notification.id)}
                                    >
                                        <div className="notification-content">
                                            {!isMobile && (
                                                <div className="notification-checkbox" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelection(notification.id)}
                                                    />
                                                </div>
                                            )}

                                            <div className="notification-icon" style={{ background: config.bgColor }}>
                                                <Icon size={isMobile ? 18 : 20} style={{ color: config.color }} />
                                                {isUnread && <span className="unread-dot"></span>}
                                            </div>

                                            <div className="notification-details">
                                                <div className="notification-header">
                                                    <div className="notification-title-section">
                                                        <h4 className="notification-title">{notification.title || config.label}</h4>
                                                        <div className="notification-badges">
                                                            <span 
                                                                className="status-badge"
                                                                style={{ 
                                                                    background: STATUS_CONFIG[notification.status]?.bgColor,
                                                                    color: STATUS_CONFIG[notification.status]?.color
                                                                }}
                                                            >
                                                                <StatusIcon size={10} />
                                                                <span>{STATUS_CONFIG[notification.status]?.label || notification.status}</span>
                                                            </span>
                                                            <span 
                                                                className="priority-badge"
                                                                style={{ 
                                                                    background: PRIORITY_CONFIG[notification.priority]?.bgColor,
                                                                    color: PRIORITY_CONFIG[notification.priority]?.color,
                                                                    borderColor: PRIORITY_CONFIG[notification.priority]?.borderColor
                                                                }}
                                                            >
                                                                {notification.priority}
                                                            </span>
                                                            {notification.source && (
                                                                <span className="source-badge">
                                                                    {notification.source === 'whatsapp-bot' ? 'WhatsApp' : notification.source}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                                </div>

                                                <p className={`notification-message ${viewMode === 'compact' ? 'compact' : ''}`}>
                                                    {notification.message}
                                                </p>

                                                {/* Order details */}
                                                {(notification.orderNumber || notification.customerName || notification.totalAmount) && (
                                                    <div className="notification-metadata">
                                                        {notification.orderNumber && (
                                                            <span className="metadata-item">
                                                                <ShoppingCart size={12} />
                                                                #{notification.orderNumber}
                                                            </span>
                                                        )}
                                                        {notification.customerName && (
                                                            <span className="metadata-item">
                                                                <Users size={12} />
                                                                {notification.customerName}
                                                            </span>
                                                        )}
                                                        {notification.totalAmount && (
                                                            <span className="metadata-item">
                                                                <DollarSign size={12} />
                                                                ₹{notification.totalAmount}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Expandable section for mobile */}
                                                {isMobile && (
                                                    <button
                                                        className="expand-toggle"
                                                        onClick={() => setExpandedNotification(isExpanded ? null : notification.id)}
                                                    >
                                                        <ChevronDown size={16} className={isExpanded ? 'rotated' : ''} />
                                                        <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                                                    </button>
                                                )}

                                                {/* Expanded content */}
                                                {(isMobile ? isExpanded : true) && (
                                                    <div className="notification-actions">
                                                        {isUnread && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(notification.id);
                                                                }}
                                                                className="action-btn"
                                                            >
                                                                <Eye size={14} />
                                                                <span>Mark read</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(notification);
                                                            }}
                                                            className="action-btn"
                                                        >
                                                            <Copy size={14} />
                                                            <span>Copy</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="action-btn delete"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Delete</span>
                                                        </button>
                                                        {notification.link && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(notification.link);
                                                                }}
                                                                className="action-btn view"
                                                            >
                                                                <Eye size={14} />
                                                                <span>View</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <div className="pagination-info">
                                Showing {startIndex + 1} to {Math.min(endIndex, pagination.total)} of {pagination.total} notifications
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="pagination-btn"
                                >
                                    <ChevronLeft size={16} />
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
                                            className={`pagination-page ${pagination.page === pageNum ? 'active' : ''}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="pagination-btn"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Auto-refresh indicator */}
                    {!loading && (
                        <div className="refresh-indicator">
                            <RefreshCw size={12} className={autoRefresh ? 'spin' : ''} />
                            <span>
                                {autoRefresh ? 'Auto-refreshes every 2 minutes' : 'Auto-refresh paused'}
                            </span>
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .notifications-page {
                    min-height: 100vh;
                    background: ${appTheme.colors.backgroundLight};
                    width: 100%;
                }

                /* ==================== TOAST NOTIFICATION ==================== */
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: ${appTheme.colors.backgroundCard};
                    border-radius: ${appTheme.radius.md};
                    box-shadow: ${appTheme.shadows.lg};
                    animation: slideInRight 0.3s ease;
                    font-size: 0.875rem;
                    max-width: 400px;
                    border: 1px solid ${appTheme.colors.border};
                }

                .toast-notification.success {
                    border-left: 4px solid ${appTheme.colors.success};
                }

                .toast-notification.error {
                    border-left: 4px solid ${appTheme.colors.error};
                }

                .toast-notification.warning {
                    border-left: 4px solid ${appTheme.colors.warning};
                }

                .toast-notification.success svg {
                    color: ${appTheme.colors.success};
                }

                .toast-notification.error svg {
                    color: ${appTheme.colors.error};
                }

                .toast-notification.warning svg {
                    color: ${appTheme.colors.warning};
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* ==================== HEADER ==================== */
                .page-header {
                    background: ${appTheme.colors.backgroundCard};
                    border-bottom: 1px solid ${appTheme.colors.border};
                    padding: 20px 24px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                    width: 100%;
                }

                .header-content {
                    max-width: 100%;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 24px;
                }

                .header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    color: ${appTheme.colors.primary};
                    font-size: 0.813rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 4px 0;
                    transition: opacity 0.2s;
                    width: fit-content;
                }

                .back-button:hover {
                    opacity: 0.7;
                }

                .page-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0;
                }

                .title-icon {
                    color: ${appTheme.colors.primary};
                }

                .page-description {
                    color: ${appTheme.colors.textSecondary};
                    font-size: 0.875rem;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .header-action-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    color: ${appTheme.colors.textSecondary};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .header-action-btn:hover {
                    background: ${appTheme.colors.hover};
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                .header-action-btn.active {
                    background: ${appTheme.colors.primary}15;
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                .save-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
                }

                .save-button:hover {
                    background: ${appTheme.colors.gradientStart};
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px ${appTheme.colors.primary}40;
                }

                .save-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                /* ==================== COMPANY BANNER ==================== */
                .company-banner {
                    width: 100%;
                    margin: 16px 0 0 0;
                    padding: 0 24px;
                }

                .company-banner-content {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                .company-banner-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${appTheme.colors.textPrimary};
                    font-size: 0.875rem;
                }

                .company-banner-left svg {
                    color: ${appTheme.colors.primary};
                }

                .super-admin-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: ${appTheme.colors.warning}15;
                    border: 1px solid ${appTheme.colors.warning}30;
                    border-radius: 20px;
                    color: ${appTheme.colors.warning};
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                /* ==================== API ERROR ==================== */
                .api-error {
                    width: 100%;
                    margin: 16px 0 0 0;
                    padding: 0 24px;
                    background: ${appTheme.colors.error}10;
                    border: 1px solid ${appTheme.colors.error}30;
                    border-radius: ${appTheme.radius.md};
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${appTheme.colors.error};
                    font-size: 0.875rem;
                }

                /* ==================== MAIN CONTENT ==================== */
                .main-content {
                    width: 100%;
                    margin: 24px 0;
                    padding: 0 24px;
                }

                /* ==================== STATS GRID ==================== */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stat-icon {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: ${appTheme.radius.md};
                }

                .stat-info {
                    flex: 1;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    display: block;
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: ${appTheme.colors.textPrimary};
                    line-height: 1;
                }

                /* ==================== FILTER BAR ==================== */
                .filter-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .filter-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .filter-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    color: ${appTheme.colors.textPrimary};
                    cursor: pointer;
                    position: relative;
                }

                .filter-toggle svg {
                    transition: transform 0.3s ease;
                }

                .filter-toggle svg.rotated {
                    transform: rotate(180deg);
                }

                .filter-dot {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 8px;
                    height: 8px;
                    background: ${appTheme.colors.primary};
                    border-radius: 50%;
                }

                .view-toggle {
                    display: flex;
                    align-items: center;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    overflow: hidden;
                }

                .view-toggle button {
                    padding: 8px;
                    background: none;
                    border: none;
                    color: ${appTheme.colors.textSecondary};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .view-toggle button:hover {
                    background: ${appTheme.colors.hover};
                }

                .view-toggle button.active {
                    background: ${appTheme.colors.primary}15;
                    color: ${appTheme.colors.primary};
                }

                .bulk-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 12px;
                    background: ${appTheme.colors.primary}10;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: ${appTheme.radius.md};
                }

                .selected-count {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: ${appTheme.colors.primary};
                }

                .bulk-btn {
                    padding: 4px 8px;
                    background: none;
                    border: none;
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    cursor: pointer;
                    border-radius: ${appTheme.radius.sm};
                }

                .bulk-btn:hover {
                    background: ${appTheme.colors.hover};
                }

                .bulk-btn.delete {
                    color: ${appTheme.colors.error};
                }

                .bulk-btn.delete:hover {
                    background: ${appTheme.colors.error}10;
                }

                .filter-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .search-box {
                    position: relative;
                    width: 280px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: ${appTheme.colors.textSecondary};
                }

                .search-box input {
                    width: 100%;
                    padding: 8px 12px 8px 36px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    background: ${appTheme.colors.backgroundCard};
                }

                .search-box input:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 4px ${appTheme.colors.primary}15;
                }

                .clear-search {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: ${appTheme.colors.textSecondary};
                    cursor: pointer;
                    padding: 4px;
                }

                .sort-select {
                    padding: 8px 12px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    background: ${appTheme.colors.backgroundCard};
                    cursor: pointer;
                }

                .sort-select:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                }

                /* ==================== FILTER PANEL ==================== */
                .filter-panel {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .filter-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 16px;
                    align-items: end;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .filter-group label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: ${appTheme.colors.textSecondary};
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .filter-group select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    background: ${appTheme.colors.backgroundCard};
                }

                .filter-actions {
                    display: flex;
                    justify-content: flex-end;
                }

                .clear-filters {
                    padding: 10px 20px;
                    background: none;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    color: ${appTheme.colors.textPrimary};
                    cursor: pointer;
                }

                .clear-filters:hover {
                    background: ${appTheme.colors.hover};
                }

                /* ==================== NOTIFICATIONS LIST ==================== */
                .notifications-list {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    overflow: hidden;
                    margin-bottom: 20px;
                }

                .notification-item {
                    border-bottom: 1px solid ${appTheme.colors.border};
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .notification-item:last-child {
                    border-bottom: none;
                }

                .notification-item:hover {
                    background: ${appTheme.colors.hover};
                }

                .notification-item.unread {
                    background: ${appTheme.colors.primary}05;
                }

                .notification-item.selected {
                    background: ${appTheme.colors.primary}10;
                    border-left: 3px solid ${appTheme.colors.primary};
                }

                .notification-content {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                }

                .notification-checkbox {
                    display: flex;
                    align-items: flex-start;
                    padding-top: 2px;
                }

                .notification-checkbox input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .notification-icon {
                    position: relative;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: ${appTheme.radius.md};
                    flex-shrink: 0;
                }

                .unread-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    background: ${appTheme.colors.primary};
                    border: 2px solid ${appTheme.colors.backgroundCard};
                    border-radius: 50%;
                }

                .notification-details {
                    flex: 1;
                    min-width: 0;
                }

                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 6px;
                    gap: 12px;
                }

                .notification-title-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .notification-title {
                    font-size: 0.938rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0;
                }

                .notification-badges {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .status-badge,
                .priority-badge,
                .source-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 0.688rem;
                    font-weight: 500;
                }

                .priority-badge {
                    border: 1px solid transparent;
                }

                .source-badge {
                    background: ${appTheme.colors.backgroundLight};
                    color: ${appTheme.colors.textSecondary};
                }

                .notification-time {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    white-space: nowrap;
                }

                .notification-message {
                    font-size: 0.875rem;
                    color: ${appTheme.colors.textSecondary};
                    margin: 0 0 8px 0;
                    line-height: 1.5;
                }

                .notification-message.compact {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .notification-metadata {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 8px;
                }

                .metadata-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 8px;
                    background: ${appTheme.colors.backgroundLight};
                    border-radius: 20px;
                    font-size: 0.688rem;
                    color: ${appTheme.colors.textSecondary};
                }

                .expand-toggle {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: none;
                    font-size: 0.75rem;
                    color: ${appTheme.colors.primary};
                    cursor: pointer;
                    margin: 8px 0;
                }

                .expand-toggle svg {
                    transition: transform 0.3s ease;
                }

                .expand-toggle svg.rotated {
                    transform: rotate(180deg);
                }

                .notification-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }

                .action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.sm};
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textPrimary};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-btn:hover {
                    background: ${appTheme.colors.hover};
                }

                .action-btn.delete:hover {
                    background: ${appTheme.colors.error}10;
                    color: ${appTheme.colors.error};
                    border-color: ${appTheme.colors.error};
                }

                .action-btn.view:hover {
                    background: ${appTheme.colors.primary}10;
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                /* ==================== LOADING STATE ==================== */
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid ${appTheme.colors.primary}20;
                    border-top-color: ${appTheme.colors.primary};
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                /* ==================== EMPTY STATE ==================== */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    text-align: center;
                }

                .empty-icon {
                    color: ${appTheme.colors.textSecondary};
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 8px 0;
                }

                .empty-state p {
                    font-size: 0.875rem;
                    color: ${appTheme.colors.textSecondary};
                    margin: 0 0 16px 0;
                    max-width: 400px;
                }

                .clear-filters-btn {
                    padding: 8px 16px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                .clear-filters-btn:hover {
                    background: ${appTheme.colors.gradientStart};
                }

                /* ==================== PAGINATION ==================== */
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                }

                .pagination-info {
                    font-size: 0.875rem;
                    color: ${appTheme.colors.textSecondary};
                }

                .pagination-controls {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .pagination-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.sm};
                    color: ${appTheme.colors.textPrimary};
                    cursor: pointer;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .pagination-btn:hover:not(:disabled) {
                    background: ${appTheme.colors.hover};
                }

                .pagination-page {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.sm};
                    color: ${appTheme.colors.textPrimary};
                    cursor: pointer;
                    font-size: 0.875rem;
                }

                .pagination-page.active {
                    background: ${appTheme.colors.primary};
                    color: white;
                    border-color: ${appTheme.colors.primary};
                }

                .pagination-page:hover:not(.active) {
                    background: ${appTheme.colors.hover};
                }

                /* ==================== REFRESH INDICATOR ==================== */
                .refresh-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 16px;
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                }

                /* ==================== RESPONSIVE ==================== */
                @media (max-width: 1200px) {
                    .header-content,
                    .main-content,
                    .company-banner,
                    .api-error {
                        padding: 0 20px;
                    }

                    .filter-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .filter-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .page-header {
                        padding: 16px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                        padding: 0 16px;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .save-button {
                        flex: 1;
                        justify-content: center;
                    }

                    .page-title {
                        font-size: 1.25rem;
                    }

                    .main-content {
                        padding: 0 16px;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }

                    .stat-card {
                        padding: 12px;
                    }

                    .stat-icon {
                        width: 36px;
                        height: 36px;
                    }

                    .stat-value {
                        font-size: 1.25rem;
                    }

                    .filter-bar {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .filter-left {
                        justify-content: space-between;
                    }

                    .filter-right {
                        flex-direction: column;
                    }

                    .search-box {
                        width: 100%;
                    }

                    .sort-select {
                        width: 100%;
                    }

                    .filter-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .filter-actions {
                        grid-column: 1;
                    }

                    .notification-content {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .notification-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .notification-title-section {
                        width: 100%;
                    }

                    .notification-time {
                        align-self: flex-start;
                    }

                    .pagination {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .pagination-controls {
                        width: 100%;
                        justify-content: center;
                    }

                    .company-banner,
                    .api-error {
                        padding: 0 16px;
                    }
                }

                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .notification-badges {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .notification-actions {
                        flex-direction: column;
                    }

                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .bulk-actions {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </>
    );
}