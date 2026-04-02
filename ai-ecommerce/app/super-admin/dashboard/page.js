// // app/super-admin/dashboard/page.js
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import {
//   LayoutDashboard,
//   Building2,
//   Users,
//   DollarSign,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   Bell,
//   Settings,
//   Plus,
//   Search,
//   RefreshCw,
//   ChevronRight,
//   ChevronLeft,
//   BarChart3,
//   PieChart,
//   Award,
//   UserPlus,
//   Server,
//   AlertCircle,
//   Loader2,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   AlertTriangle,
//   Eye,
//   EyeOff,
//   Mail,
//   Phone,
//   MapPin,
//   Globe,
//   Zap,
//   Shield,
//   Wallet,
//   CalendarDays,
//   FileText,
//   Download,
//   Printer,
//   Share2,
//   Bookmark,
//   Star,
//   Heart,
//   ThumbsUp,
//   Sun,
//   Moon,
//   Cloud,
//   Wind,
//   Thermometer,
//   Lock,
//   Unlock,
//   Key,
//   Fingerprint,
//   ScanFace,
//   QrCode,
//   Camera,
//   Video,
//   LogOut,
//   Menu,
//   Home,
//   CreditCard,
//   Package,
//   ShoppingCart,
//   Calendar,
//   UserCheck,
//   UserX,
//   UserCircle,
//   ArrowUpRight,
//   ArrowDownRight,
//   MoreVertical,
//   Edit,
//   Trash2,
//   Copy,
//   Check,
//   X,
//   Save,
//   Filter,
//   DownloadCloud,
//   UploadCloud,
//   HelpCircle,
//   Info,
//   ExternalLink,
//   Link,
// } from 'lucide-react';
// import { format, formatDistanceToNow } from 'date-fns';

// // ============== STATISTICS CARD ==============
// const StatCard = ({ title, value, icon: Icon, change, changeType, color, loading, prefix = '' }) => {
//   if (loading) {
//     return (
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
//         <div className="flex items-center justify-between mb-4">
//           <div className={`p-3 rounded-lg bg-${color}-100`}>
//             <Icon className={`w-5 h-5 text-${color}-600`} />
//           </div>
//         </div>
//         <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
//         <div className="h-6 bg-gray-300 rounded w-24"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all">
//       <div className="flex items-center justify-between mb-4">
//         <div className={`p-3 rounded-lg bg-${color}-100`}>
//           <Icon className={`w-5 h-5 text-${color}-600`} />
//         </div>
//         {change !== undefined && change !== null && (
//           <div className={`flex items-center text-xs sm:text-sm ${
//             changeType === 'positive' ? 'text-green-600' : 
//             changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
//           }`}>
//             {changeType === 'positive' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
//             {changeType === 'negative' && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
//             <span>{Math.abs(change)}%</span>
//           </div>
//         )}
//       </div>
//       <div>
//         <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
//         <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
//           {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
//         </p>
//       </div>
//     </div>
//   );
// };

// // ============== NAVIGATION CARD ==============
// const NavigationCard = ({ title, description, icon: Icon, color, onClick }) => {
//   return (
//     <button
//       onClick={onClick}
//       className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md hover:border-indigo-300 transition-all text-left w-full group"
//     >
//       <div className="flex items-start">
//         <div className={`p-3 rounded-lg bg-${color}-100 group-hover:bg-${color}-200 transition-colors`}>
//           <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
//         </div>
//         <div className="ml-3 sm:ml-4 flex-1">
//           <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
//           <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>
//         </div>
//         <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
//       </div>
//     </button>
//   );
// };

// // ============== RECENT COMPANY ROW ==============
// const RecentCompanyRow = ({ company, onView }) => {
//   const getPlanColor = (plan) => {
//     switch(plan) {
//       case 'enterprise': return 'bg-purple-100 text-purple-800';
//       case 'pro': return 'bg-blue-100 text-blue-800';
//       case 'basic': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'suspended': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
//       <div className="flex items-center min-w-0 flex-1">
//         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
//           <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//         </div>
//         <div className="ml-2 sm:ml-3 min-w-0 flex-1">
//           <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{company.name}</p>
//           <p className="text-[10px] sm:text-xs text-gray-500 truncate">{company.email}</p>
//         </div>
//       </div>
//       <div className="flex items-center gap-1 sm:gap-2 ml-2">
//         <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getPlanColor(company.plan)}`}>
//           {company.plan}
//         </span>
//         <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(company.status)}`}>
//           {company.status}
//         </span>
//         <button
//           onClick={() => onView(company.id)}
//           className="p-1 hover:bg-gray-200 rounded ml-1"
//           title="View Company Details"
//         >
//           <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
//         </button>
//       </div>
//     </div>
//   );
// };

// // ============== ACTIVITY ITEM ==============
// const ActivityItem = ({ activity }) => {
//   const getIcon = () => {
//     switch(activity.type) {
//       case 'company_created': return Building2;
//       case 'user_registered': return UserPlus;
//       case 'subscription_updated': return CreditCard;
//       case 'payment_received': return DollarSign;
//       default: return Activity;
//     }
//   };

//   const getColor = () => {
//     switch(activity.type) {
//       case 'company_created': return 'bg-blue-100 text-blue-600';
//       case 'user_registered': return 'bg-green-100 text-green-600';
//       case 'subscription_updated': return 'bg-purple-100 text-purple-600';
//       case 'payment_received': return 'bg-emerald-100 text-emerald-600';
//       default: return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const Icon = getIcon();
//   const colorClass = getColor();

//   return (
//     <div className="flex items-start p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
//       <div className={`p-1.5 sm:p-2 rounded-lg ${colorClass} flex-shrink-0`}>
//         <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
//       </div>
//       <div className="ml-2 sm:ml-3 flex-1 min-w-0">
//         <p className="text-xs sm:text-sm text-gray-900 break-words">{activity.message}</p>
//         <div className="flex items-center mt-1 text-[10px] sm:text-xs text-gray-500">
//           <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
//           <span>{activity.time}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============== SYSTEM HEALTH CARD ==============
// const SystemHealthCard = ({ health }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
//       <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
//         <Server className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
//         System Health
//       </h3>
//       <div className="space-y-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <div className={`w-2 h-2 rounded-full mr-2 ${
//               health.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
//             }`} />
//             <span className="text-xs sm:text-sm text-gray-600">Status</span>
//           </div>
//           <span className="text-xs sm:text-sm font-medium text-gray-900 capitalize">{health.status}</span>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-xs sm:text-sm text-gray-600">Uptime</span>
//           <span className="text-xs sm:text-sm font-medium text-gray-900">{health.uptime}</span>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-xs sm:text-sm text-gray-600">Response Time</span>
//           <span className="text-xs sm:text-sm font-medium text-gray-900">{health.responseTime}ms</span>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-xs sm:text-sm text-gray-600">Active Sessions</span>
//           <span className="text-xs sm:text-sm font-medium text-gray-900">{health.activeSessions}</span>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-xs sm:text-sm text-gray-600">Errors (24h)</span>
//           <span className="text-xs sm:text-sm font-medium text-gray-900">{health.errors24h}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============== MAIN DASHBOARD COMPONENT ==============
// export default function SuperAdminDashboard() {
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   // State
//   const [loading, setLoading] = useState({
//     initial: true,
//     stats: true,
//     recent: true,
//     activities: true
//   });
//   const [error, setError] = useState(null);
//   const [timeRange, setTimeRange] = useState('month');
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);
  
//   // Data states
//   const [stats, setStats] = useState({
//     companies: { total: 0, active: 0, pending: 0, suspended: 0, growth: 0 },
//     users: { total: 0, active: 0, growth: 0 },
//     revenue: { total: 0, growth: 0 }
//   });

//   const [recentCompanies, setRecentCompanies] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
  
//   const [systemHealth, setSystemHealth] = useState({
//     status: 'healthy',
//     uptime: '99.9%',
//     responseTime: 245,
//     activeSessions: 1256,
//     errors24h: 3
//   });

//   // Auth check
//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login');
//     }
//     if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
//       router.push('/dashboard');
//     }
//   }, [status, session, router]);

//   // Fetch dashboard data
//   const fetchDashboardData = useCallback(async () => {
//     setLoading({ initial: true, stats: true, recent: true, activities: true });
//     setError(null);

//     try {
//       // Fetch stats from analytics API
//       const statsRes = await fetch(`/api/companies/analytics?type=dashboard&range=${timeRange}`);
//       if (!statsRes.ok) throw new Error('Failed to fetch stats');
//       const statsData = await statsRes.json();
      
//       if (statsData.success) {
//         setStats({
//           companies: {
//             total: statsData.data.totalCompanies || 0,
//             active: statsData.data.activeCompanies || 0,
//             pending: statsData.data.pendingCompanies || 0,
//             suspended: statsData.data.suspendedCompanies || 0,
//             growth: statsData.data.companyGrowth || 0
//           },
//           users: {
//             total: statsData.data.totalUsers || 0,
//             active: statsData.data.activeUsers || 0,
//             growth: statsData.data.userGrowth || 0
//           },
//           revenue: {
//             total: statsData.data.totalRevenue || 0,
//             growth: statsData.data.growthRate || 0
//           }
//         });
//       }
//       setLoading(prev => ({ ...prev, stats: false }));

//       // Fetch recent companies
//       const companiesRes = await fetch('/api/companies?sort=createdAt&limit=5');
//       if (!companiesRes.ok) throw new Error('Failed to fetch companies');
//       const companiesData = await companiesRes.json();
      
//       if (companiesData.success) {
//         setRecentCompanies(companiesData.data.map(c => ({
//           id: c.id,
//           name: c.companyName,
//           email: c.companyEmail,
//           plan: c.subscription?.plan || 'free',
//           status: c.status,
//           createdAt: c.createdAt
//         })));
//       }
//       setLoading(prev => ({ ...prev, recent: false }));

//       // Fetch recent activities from users API
//       const activitiesRes = await fetch('/api/companies/users?type=activity&limit=10');
//       if (!activitiesRes.ok) throw new Error('Failed to fetch activities');
//       const activitiesData = await activitiesRes.json();
      
//       if (activitiesData.success) {
//         setRecentActivities(activitiesData.data);
//       }
//       setLoading(prev => ({ ...prev, activities: false }));

//       // Mock notifications (can be replaced with real API)
//       setNotifications([
//         {
//           id: '1',
//           title: 'New Company Registered',
//           message: 'Tech Solutions Inc just signed up',
//           time: '5 minutes ago',
//           read: false,
//           type: 'success'
//         },
//         {
//           id: '2',
//           title: 'Subscription Expiring',
//           message: 'Green Mart subscription expires in 3 days',
//           time: '1 hour ago',
//           read: false,
//           type: 'warning'
//         },
//         {
//           id: '3',
//           title: 'Payment Received',
//           message: 'Payment of ₹50,000 received from Fitness Pro',
//           time: '3 hours ago',
//           read: true,
//           type: 'success'
//         }
//       ]);
//       setUnreadCount(2);

//     } catch (err) {
//       console.error('Dashboard fetch error:', err);
//       setError(err.message);
//     } finally {
//       setLoading(prev => ({ ...prev, initial: false }));
//     }
//   }, [timeRange]);

//   // Initial fetch
//   useEffect(() => {
//     if (status === 'authenticated' && session?.user?.role === 'admin' && session?.user?.adminType === 'super') {
//       fetchDashboardData();
//     }
//   }, [status, session, fetchDashboardData]);

//   // Handle refresh
//   const handleRefresh = () => {
//     fetchDashboardData();
//   };

//   // Handle notification read
//   const handleMarkAsRead = (id) => {
//     setNotifications(prev => prev.map(n => 
//       n.id === id ? { ...n, read: true } : n
//     ));
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   };

//   const handleMarkAllAsRead = () => {
//     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//     setUnreadCount(0);
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   // Format number
//   const formatNumber = (num) => {
//     if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
//     if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
//     if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
//     return num?.toString() || '0';
//   };

//   // Navigation handlers
//   const handleNavigation = (path) => {
//     router.push(path);
//   };

//   // Loading state
//   if (status === 'loading' || loading.initial) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="text-center">
//           <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
//             <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" />
//             </div>
//           </div>
//           <p className="mt-4 text-base sm:text-lg font-medium text-gray-700">Loading Dashboard</p>
//           <p className="text-xs sm:text-sm text-gray-500">Please wait while we fetch your data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
//         <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
//           <div className="flex items-center justify-between h-14 sm:h-16">
//             {/* Left Section */}
//             <div className="flex items-center min-w-0">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="md:hidden p-2 mr-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <Menu className="w-5 h-5 text-gray-600" />
//               </button>
//               <div className="flex-shrink-0">
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//                   <LayoutDashboard className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
//                 </div>
//               </div>
//               <div className="ml-2 sm:ml-4 min-w-0">
//                 <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">Super Admin Dashboard</h1>
//                 <p className="text-xs sm:text-sm text-gray-500 truncate hidden xs:block">
//                   Welcome back, {session?.user?.name || 'Admin'}
//                 </p>
//               </div>
//             </div>

//             {/* Right Section */}
//             <div className="flex items-center space-x-1 sm:space-x-2">
//               {/* Time Range Selector */}
//               <select
//                 value={timeRange}
//                 onChange={(e) => setTimeRange(e.target.value)}
//                 className="hidden sm:block px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
//               >
//                 <option value="today">Today</option>
//                 <option value="week">This Week</option>
//                 <option value="month">This Month</option>
//                 <option value="quarter">This Quarter</option>
//                 <option value="year">This Year</option>
//               </select>

//               {/* Notifications */}
//               <div className="relative">
//                 <button
//                   onClick={() => setShowNotifications(!showNotifications)}
//                   className="relative p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <Bell className="w-5 h-5 text-gray-600" />
//                   {unreadCount > 0 && (
//                     <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//                   )}
//                 </button>

//                 {/* Notifications Dropdown */}
//                 {showNotifications && (
//                   <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
//                     <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
//                       <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
//                       {unreadCount > 0 && (
//                         <button 
//                           onClick={handleMarkAllAsRead}
//                           className="text-xs text-indigo-600 hover:text-indigo-800"
//                         >
//                           Mark all as read
//                         </button>
//                       )}
//                     </div>
//                     <div className="max-h-96 overflow-y-auto">
//                       {notifications.length === 0 ? (
//                         <div className="p-6 text-center">
//                           <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                           <p className="text-xs sm:text-sm text-gray-500">No notifications</p>
//                         </div>
//                       ) : (
//                         notifications.map(n => (
//                           <div
//                             key={n.id}
//                             className={`p-3 sm:p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer ${!n.read ? 'bg-indigo-50' : ''}`}
//                             onClick={() => handleMarkAsRead(n.id)}
//                           >
//                             <p className="text-xs sm:text-sm font-medium text-gray-900">{n.title}</p>
//                             <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{n.message}</p>
//                             <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                     <div className="p-2 border-t border-gray-200">
//                       <button 
//                         onClick={() => {
//                           setShowNotifications(false);
//                           handleNavigation('/super-admin/notifications');
//                         }}
//                         className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800"
//                       >
//                         View all notifications
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Refresh Button */}
//               <button
//                 onClick={handleRefresh}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//                 disabled={loading.stats}
//                 title="Refresh data"
//               >
//                 <RefreshCw className={`w-5 h-5 text-gray-600 ${loading.stats ? 'animate-spin' : ''}`} />
//               </button>

//               {/* Settings */}
//               <button
//                 onClick={() => handleNavigation('/admin/profile')}
//                 className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg"
//                 title="Settings"
//               >
//                 <Settings className="w-5 h-5 text-gray-600" />
//               </button>
//             </div>
//           </div>

//           {/* Mobile Time Range */}
//           <div className="sm:hidden py-2 border-t border-gray-100">
//             <select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
//             >
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//               <option value="quarter">This Quarter</option>
//               <option value="year">This Year</option>
//             </select>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
//           <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="font-semibold text-gray-900">Menu</h2>
//               <button 
//                 onClick={() => setMobileMenuOpen(false)} 
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <X className="w-5 h-5 text-gray-600" />
//               </button>
//             </div>
//             <nav className="p-4">
//               <button
//                 onClick={() => {
//                   handleNavigation('/super-admin/dashboard');
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left p-3 bg-indigo-50 text-indigo-700 rounded-lg mb-2 font-medium"
//               >
//                 Dashboard
//               </button>
//               <button
//                 onClick={() => {
//                   handleNavigation('/super-admin/companies');
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left p-3 hover:bg-gray-100 rounded-lg mb-2 text-gray-700"
//               >
//                 Companies
//               </button>
//               <button
//                 onClick={() => {
//                   handleNavigation('/super-admin/companies/create');
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left p-3 hover:bg-gray-100 rounded-lg mb-2 text-gray-700"
//               >
//                 Create Company
//               </button>
//               <button
//                 onClick={() => {
//                   handleNavigation('/super-admin/users');
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left p-3 hover:bg-gray-100 rounded-lg mb-2 text-gray-700"
//               >
//                 Users
//               </button>
//               <button
//                 onClick={() => {
//                   handleNavigation('/super-admin/subscriptions');
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left p-3 hover:bg-gray-100 rounded-lg mb-2 text-gray-700"
//               >
//                 Subscriptions
//               </button>
//               <button
//                 onClick={() => {
//                   handleNavigation('/super-admin/analytics');
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left p-3 hover:bg-gray-100 rounded-lg mb-2 text-gray-700"
//               >
//                 Analytics
//               </button>
//               <button
//                 onClick={() => {
//                   handleNavigation( '/admin/profile');
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left p-3 hover:bg-gray-100 rounded-lg mb-2 text-gray-700"
//               >
//                 Settings
//               </button>
//             </nav>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-start">
//             <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
//             <div className="flex-1">
//               <p className="text-xs sm:text-sm font-medium text-red-800">Error loading dashboard</p>
//               <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>
//             </div>
//             <button
//               onClick={handleRefresh}
//               className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs sm:text-sm whitespace-nowrap"
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
//           <StatCard
//             title="Total Companies"
//             value={formatNumber(stats.companies.total)}
//             icon={Building2}
//             change={stats.companies.growth}
//             changeType={stats.companies.growth >= 0 ? 'positive' : 'negative'}
//             color="indigo"
//             loading={loading.stats}
//           />
//           <StatCard
//             title="Active Companies"
//             value={formatNumber(stats.companies.active)}
//             icon={Building2}
//             color="green"
//             loading={loading.stats}
//           />
//           <StatCard
//             title="Total Users"
//             value={formatNumber(stats.users.total)}
//             icon={Users}
//             change={stats.users.growth}
//             changeType={stats.users.growth >= 0 ? 'positive' : 'negative'}
//             color="blue"
//             loading={loading.stats}
//           />
//           <StatCard
//             title="Total Revenue"
//             value={formatCurrency(stats.revenue.total)}
//             icon={DollarSign}
//             change={stats.revenue.growth}
//             changeType={stats.revenue.growth >= 0 ? 'positive' : 'negative'}
//             color="purple"
//             loading={loading.stats}
//           />
//         </div>

//         {/* Quick Stats Row */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <p className="text-xs text-gray-500 mb-1">Pending Companies</p>
//             <p className="text-lg sm:text-xl font-bold text-yellow-600">{stats.companies.pending}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <p className="text-xs text-gray-500 mb-1">Suspended</p>
//             <p className="text-lg sm:text-xl font-bold text-red-600">{stats.companies.suspended}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <p className="text-xs text-gray-500 mb-1">Active Users</p>
//             <p className="text-lg sm:text-xl font-bold text-green-600">{stats.users.active}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <p className="text-xs text-gray-500 mb-1">Avg Revenue/Company</p>
//             <p className="text-lg sm:text-xl font-bold text-purple-600">
//               {stats.companies.total ? formatCurrency(stats.revenue.total / stats.companies.total) : '₹0'}
//             </p>
//           </div>
//         </div>

//         {/* Navigation Cards */}
//         <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
//           <NavigationCard
//             title="Create Company"
//             description="Add a new company to the platform"
//             icon={Building2}
//             color="indigo"
//             onClick={() => handleNavigation('/super-admin/companies/create')}
//           />
//           <NavigationCard
//             title="View Companies"
//             description="Manage all registered companies"
//             icon={Building2}
//             color="blue"
//             onClick={() => handleNavigation('/super-admin/companies')}
//           />
//           <NavigationCard
//             title="Manage Users"
//             description="View and manage all users"
//             icon={Users}
//             color="green"
//             onClick={() => handleNavigation('/super-admin/users')}
//           />
//           <NavigationCard
//             title="Subscriptions"
//             description="Manage plans and subscriptions"
//             icon={CreditCard}
//             color="purple"
//             onClick={() => handleNavigation('/super-admin/subscriptions')}
//           />
//           <NavigationCard
//             title="View Analytics"
//             description="Detailed platform analytics and reports"
//             icon={BarChart3}
//             color="orange"
//             onClick={() => handleNavigation('/super-admin/analytics')}
//           />
//         </div>

//         {/* Recent Companies & Activities */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
//           {/* Recent Companies */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//             <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
//                 <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
//                 Recent Companies
//               </h2>
//               <button
//                 onClick={() => handleNavigation('/super-admin/companies')}
//                 className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
//               >
//                 View All
//                 <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
//               </button>
//             </div>
//             <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
//               {loading.recent ? (
//                 <div className="p-6 text-center">
//                   <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600 mx-auto" />
//                   <p className="mt-2 text-xs sm:text-sm text-gray-500">Loading companies...</p>
//                 </div>
//               ) : recentCompanies.length === 0 ? (
//                 <div className="p-6 text-center">
//                   <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
//                   <p className="text-xs sm:text-sm text-gray-500">No companies found</p>
//                 </div>
//               ) : (
//                 recentCompanies.map(company => (
//                   <RecentCompanyRow
//                     key={company.id}
//                     company={company}
//                     onView={(id) => handleNavigation(`/super-admin/companies/${id}`)}
//                   />
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Recent Activities */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//             <div className="p-4 sm:p-6 border-b border-gray-200">
//               <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
//                 <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
//                 Recent Activities
//               </h2>
//             </div>
//             <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
//               {loading.activities ? (
//                 <div className="p-6 text-center">
//                   <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600 mx-auto" />
//                   <p className="mt-2 text-xs sm:text-sm text-gray-500">Loading activities...</p>
//                 </div>
//               ) : recentActivities.length === 0 ? (
//                 <div className="p-6 text-center">
//                   <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
//                   <p className="text-xs sm:text-sm text-gray-500">No recent activities</p>
//                 </div>
//               ) : (
//                 recentActivities.map(activity => (
//                   <ActivityItem key={activity.id} activity={activity} />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* System Health & Quick Tips */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//           <div className="lg:col-span-2">
//             <SystemHealthCard health={systemHealth} />
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
//             <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
//               <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
//               Quick Tips
//             </h3>
//             <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
//               <li className="flex items-start">
//                 <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
//                 <span>New companies are created with default Free plan</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
//                 <span>You can upgrade company plans from Subscriptions page</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
//                 <span>Monitor pending companies that need verification</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
//                 <span>Use Analytics page for detailed insights and reports</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
//                 <span>Check system health regularly for optimal performance</span>
//               </li>
//             </ul>
            
//             {/* Quick Links */}
//             <div className="mt-6 pt-4 border-t border-gray-200">
//               <h4 className="text-xs font-medium text-gray-500 mb-3">Quick Links</h4>
//               <div className="grid grid-cols-2 gap-2">
//                 <button
//                   onClick={() => handleNavigation('/super-admin/companies/create')}
//                   className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-xs flex items-center justify-center"
//                 >
//                   <Plus className="w-3 h-3 mr-1" />
//                   New Company
//                 </button>
//                 <button
//                   onClick={() => handleNavigation('/super-admin/users')}
//                   className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs flex items-center justify-center"
//                 >
//                   <Users className="w-3 h-3 mr-1" />
//                   Manage Users
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

















// app/super-admin/dashboard/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { appTheme } from '../../../src/constants/theme';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  Settings,
  Plus,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  PieChart,
  Award,
  UserPlus,
  Server,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Globe,
  Zap,
  Shield,
  Wallet,
  CalendarDays,
  FileText,
  Download,
  Printer,
  Share2,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  Sun,
  Moon,
  Cloud,
  Wind,
  Thermometer,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  ScanFace,
  QrCode,
  Camera,
  Video,
  LogOut,
  Menu,
  Home,
  CreditCard,
  Package,
  ShoppingCart,
  Calendar,
  UserCheck,
  UserX,
  UserCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Check,
  X,
  Save,
  Filter,
  DownloadCloud,
  UploadCloud,
  HelpCircle,
  Info,
  ExternalLink,
  Link,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// ============== STATISTICS CARD ==============
const StatCard = ({ title, value, icon: Icon, change, changeType, color, loading, prefix = '', appTheme }) => {
  if (loading) {
    return (
      <div className="rounded-xl shadow-sm border p-4 sm:p-6 animate-pulse" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        </div>
        <div className="h-4 rounded w-20 mb-2" style={{ backgroundColor: appTheme.colors.border }}></div>
        <div className="h-6 rounded w-24" style={{ backgroundColor: appTheme.colors.border }}></div>
      </div>
    );
  }

  const changeColor = changeType === 'positive' ? appTheme.colors.success : (changeType === 'negative' ? appTheme.colors.error : appTheme.colors.textSecondary);
  
  return (
    <div className="rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {change !== undefined && change !== null && (
          <div className="flex items-center text-xs sm:text-sm" style={{ color: changeColor, fontFamily: appTheme.fonts.families.primary }}>
            {changeType === 'positive' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium mb-1 truncate" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>{title}</p>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      </div>
    </div>
  );
};

// ============== NAVIGATION CARD ==============
const NavigationCard = ({ title, description, icon: Icon, color, onClick, appTheme }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all text-left w-full group"
      style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-lg bg-${color}-100 group-hover:bg-${color}-200 transition-colors`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
        </div>
        <div className="ml-3 sm:ml-4 flex-1">
          <h3 className="text-base sm:text-lg font-semibold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{title}</h3>
          <p className="text-xs sm:text-sm mt-1" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" style={{ color: appTheme.colors.textSecondary }} />
      </div>
    </button>
  );
};

// ============== RECENT COMPANY ROW ==============
const RecentCompanyRow = ({ company, onView, appTheme }) => {
  const getPlanColor = (plan) => {
    switch(plan) {
      case 'enterprise': return { bg: '#f3e8ff', text: '#7c3aed' };
      case 'pro': return { bg: '#e0f2fe', text: '#0284c7' };
      case 'basic': return { bg: '#d1fae5', text: '#10b981' };
      default: return { bg: appTheme.colors.borderLight, text: appTheme.colors.textSecondary };
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: appTheme.colors.successLight || '#d1fae5', text: appTheme.colors.success || '#10b981' };
      case 'pending': return { bg: appTheme.colors.warningLight || '#fef3c7', text: appTheme.colors.warning || '#f59e0b' };
      case 'suspended': return { bg: appTheme.colors.errorLight || '#fee2e2', text: appTheme.colors.error || '#ef4444' };
      default: return { bg: appTheme.colors.borderLight, text: appTheme.colors.textSecondary };
    }
  };

  const planColors = getPlanColor(company.plan);
  const statusColors = getStatusColor(company.status);

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 transition-colors border-b last:border-0" style={{ borderColor: appTheme.colors.borderLight }}>
      <div className="flex items-center min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})` }}>
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="ml-2 sm:ml-3 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium truncate" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{company.name}</p>
          <p className="text-[10px] sm:text-xs truncate" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>{company.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 ml-2">
        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium" style={{ backgroundColor: planColors.bg, color: planColors.text, fontFamily: appTheme.fonts.families.primary }}>
          {company.plan}
        </span>
        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium" style={{ backgroundColor: statusColors.bg, color: statusColors.text, fontFamily: appTheme.fonts.families.primary }}>
          {company.status}
        </span>
        <button
          onClick={() => onView(company.id)}
          className="p-1 rounded ml-1"
          style={{ color: appTheme.colors.textSecondary }}
          title="View Company Details"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

// ============== ACTIVITY ITEM ==============
const ActivityItem = ({ activity, appTheme }) => {
  const getIcon = () => {
    switch(activity.type) {
      case 'company_created': return Building2;
      case 'user_registered': return UserPlus;
      case 'subscription_updated': return CreditCard;
      case 'payment_received': return DollarSign;
      default: return Activity;
    }
  };

  const getColor = () => {
    switch(activity.type) {
      case 'company_created': return { bg: '#e0f2fe', text: '#0284c7' };
      case 'user_registered': return { bg: '#d1fae5', text: '#10b981' };
      case 'subscription_updated': return { bg: '#fef3c7', text: '#f59e0b' };
      case 'payment_received': return { bg: '#d1fae5', text: '#10b981' };
      default: return { bg: appTheme.colors.borderLight, text: appTheme.colors.textSecondary };
    }
  };

  const Icon = getIcon();
  const colorClass = getColor();

  return (
    <div className="flex items-start p-3 sm:p-4 transition-colors border-b last:border-0" style={{ borderColor: appTheme.colors.borderLight }}>
      <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: colorClass.bg }}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: colorClass.text }} />
      </div>
      <div className="ml-2 sm:ml-3 flex-1 min-w-0">
        <p className="text-xs sm:text-sm break-words" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{activity.message}</p>
        <div className="flex items-center mt-1 text-[10px] sm:text-xs" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
          <span>{activity.time}</span>
        </div>
      </div>
    </div>
  );
};

// ============== SYSTEM HEALTH CARD ==============
const SystemHealthCard = ({ health, appTheme }) => {
  return (
    <div className="rounded-xl shadow-sm border p-4 sm:p-6" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
      <h3 className="text-sm sm:text-base font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
        <Server className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: appTheme.colors.primary }} />
        System Health
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${health.status === 'healthy' ? 'animate-pulse' : ''}`} style={{ backgroundColor: health.status === 'healthy' ? appTheme.colors.success : appTheme.colors.warning }} />
            <span className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Status</span>
          </div>
          <span className="text-xs sm:text-sm font-medium capitalize" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{health.status}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Uptime</span>
          <span className="text-xs sm:text-sm font-medium" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{health.uptime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Response Time</span>
          <span className="text-xs sm:text-sm font-medium" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{health.responseTime}ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Active Sessions</span>
          <span className="text-xs sm:text-sm font-medium" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{health.activeSessions}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Errors (24h)</span>
          <span className="text-xs sm:text-sm font-medium" style={{ color: health.errors24h > 0 ? appTheme.colors.error : appTheme.colors.success, fontFamily: appTheme.fonts.families.primary }}>{health.errors24h}</span>
        </div>
      </div>
    </div>
  );
};

// ============== MAIN DASHBOARD COMPONENT ==============
export default function SuperAdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State
  const [loading, setLoading] = useState({
    initial: true,
    stats: true,
    recent: true,
    activities: true
  });
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data states
  const [stats, setStats] = useState({
    companies: { total: 0, active: 0, pending: 0, suspended: 0, growth: 0 },
    users: { total: 0, active: 0, growth: 0 },
    revenue: { total: 0, growth: 0 }
  });

  const [recentCompanies, setRecentCompanies] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: 245,
    activeSessions: 1256,
    errors24h: 3
  });

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading({ initial: true, stats: true, recent: true, activities: true });
    setError(null);

    try {
      // Fetch stats from analytics API
      const statsRes = await fetch(`/api/companies/analytics?type=dashboard&range=${timeRange}`);
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        setStats({
          companies: {
            total: statsData.data.totalCompanies || 0,
            active: statsData.data.activeCompanies || 0,
            pending: statsData.data.pendingCompanies || 0,
            suspended: statsData.data.suspendedCompanies || 0,
            growth: statsData.data.companyGrowth || 0
          },
          users: {
            total: statsData.data.totalUsers || 0,
            active: statsData.data.activeUsers || 0,
            growth: statsData.data.userGrowth || 0
          },
          revenue: {
            total: statsData.data.totalRevenue || 0,
            growth: statsData.data.growthRate || 0
          }
        });
      }
      setLoading(prev => ({ ...prev, stats: false }));

      // Fetch recent companies
      const companiesRes = await fetch('/api/companies?sort=createdAt&limit=5');
      if (!companiesRes.ok) throw new Error('Failed to fetch companies');
      const companiesData = await companiesRes.json();
      
      if (companiesData.success) {
        setRecentCompanies(companiesData.data.map(c => ({
          id: c.id,
          name: c.companyName,
          email: c.companyEmail,
          plan: c.subscription?.plan || 'free',
          status: c.status,
          createdAt: c.createdAt
        })));
      }
      setLoading(prev => ({ ...prev, recent: false }));

      // Fetch recent activities from users API
      const activitiesRes = await fetch('/api/companies/users?type=activity&limit=10');
      if (!activitiesRes.ok) throw new Error('Failed to fetch activities');
      const activitiesData = await activitiesRes.json();
      
      if (activitiesData.success) {
        setRecentActivities(activitiesData.data);
      }
      setLoading(prev => ({ ...prev, activities: false }));

      // Mock notifications (can be replaced with real API)
      setNotifications([
        {
          id: '1',
          title: 'New Company Registered',
          message: 'Tech Solutions Inc just signed up',
          time: '5 minutes ago',
          read: false,
          type: 'success'
        },
        {
          id: '2',
          title: 'Subscription Expiring',
          message: 'Green Mart subscription expires in 3 days',
          time: '1 hour ago',
          read: false,
          type: 'warning'
        },
        {
          id: '3',
          title: 'Payment Received',
          message: 'Payment of ₹50,000 received from Fitness Pro',
          time: '3 hours ago',
          read: true,
          type: 'success'
        }
      ]);
      setUnreadCount(2);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [timeRange]);

  // Initial fetch
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin' && session?.user?.adminType === 'super') {
      fetchDashboardData();
    }
  }, [status, session, fetchDashboardData]);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle notification read
  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  // Navigation handlers
  const handleNavigation = (path) => {
    router.push(path);
  };

  // Loading state
  if (status === 'loading' || loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 rounded-full animate-spin" style={{ borderColor: `${appTheme.colors.primary}20`, borderTopColor: appTheme.colors.primary }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" style={{ color: appTheme.colors.primary }} />
            </div>
          </div>
          <p className="mt-4 text-base sm:text-lg font-medium" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>Loading Dashboard</p>
          <p className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-20 shadow-sm" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left Section */}
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 mr-2 rounded-lg"
                style={{ color: appTheme.colors.textSecondary }}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})` }}>
                  <LayoutDashboard className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>Super Admin Dashboard</h1>
                <p className="text-xs sm:text-sm truncate hidden xs:block" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>
                  Welcome back, {session?.user?.name || 'Admin'}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="hidden sm:block px-3 py-2 border rounded-lg text-sm focus:ring-2"
                style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg"
                  style={{ color: appTheme.colors.textSecondary }}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: appTheme.colors.error }}></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl shadow-xl border z-50" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                    <div className="p-3 sm:p-4 border-b flex justify-between items-center" style={{ borderColor: appTheme.colors.border }}>
                      <h3 className="font-semibold text-sm sm:text-base" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs hover:underline" 
                          style={{ color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: appTheme.colors.textSecondary }} />
                          <p className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>No notifications</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-3 sm:p-4 border-b last:border-0 cursor-pointer ${!n.read ? 'bg-opacity-10' : ''}`}
                            style={{ backgroundColor: !n.read ? `${appTheme.colors.primary}10` : 'transparent', borderColor: appTheme.colors.borderLight }}
                            onClick={() => handleMarkAsRead(n.id)}
                          >
                            <p className="text-xs sm:text-sm font-medium" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{n.title}</p>
                            <p className="text-[10px] sm:text-xs mt-1" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>{n.message}</p>
                            <p className="text-[10px] mt-1" style={{ color: appTheme.colors.textTertiary, fontFamily: appTheme.fonts.families.primary }}>{n.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t" style={{ borderColor: appTheme.colors.border }}>
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          handleNavigation('/super-admin/notifications');
                        }}
                        className="w-full text-center text-xs hover:underline" 
                        style={{ color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary }}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg"
                style={{ color: appTheme.colors.textSecondary }}
                disabled={loading.stats}
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${loading.stats ? 'animate-spin' : ''}`} />
              </button>

              {/* Settings */}
              <button
                onClick={() => handleNavigation('/super-admin/settings')}
                className="hidden sm:block p-2 rounded-lg"
                style={{ color: appTheme.colors.textSecondary }}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Time Range */}
          <div className="sm:hidden py-2 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2"
              style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: appTheme.colors.border }}>
              <h2 className="font-semibold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>Menu</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 rounded-lg"
                style={{ color: appTheme.colors.textSecondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              <button
                onClick={() => {
                  handleNavigation('/super-admin/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg mb-2 font-medium"
                style={{ backgroundColor: `${appTheme.colors.primary}15`, color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary }}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  handleNavigation('/super-admin/companies');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg mb-2"
                style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
              >
                Companies
              </button>
              <button
                onClick={() => {
                  handleNavigation('/super-admin/companies/create');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg mb-2"
                style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
              >
                Create Company
              </button>
              <button
                onClick={() => {
                  handleNavigation('/super-admin/users');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg mb-2"
                style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
              >
                Users
              </button>
              <button
                onClick={() => {
                  handleNavigation('/super-admin/subscriptions');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg mb-2"
                style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
              >
                Subscriptions
              </button>
              <button
                onClick={() => {
                  handleNavigation('/super-admin/analytics');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg mb-2"
                style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
              >
                Analytics
              </button>
              <button
                onClick={() => {
                  handleNavigation('/admin/profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg mb-2"
                style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 border rounded-xl p-3 sm:p-4 flex items-start" style={{ backgroundColor: `${appTheme.colors.error}10`, borderColor: `${appTheme.colors.error}30` }}>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" style={{ color: appTheme.colors.error }} />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium" style={{ color: appTheme.colors.error, fontFamily: appTheme.fonts.families.primary }}>Error loading dashboard</p>
              <p className="text-xs sm:text-sm mt-1" style={{ color: appTheme.colors.error, fontFamily: appTheme.fonts.families.primary }}>{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm whitespace-nowrap"
              style={{ backgroundColor: `${appTheme.colors.error}20`, color: appTheme.colors.error, fontFamily: appTheme.fonts.families.primary }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            title="Total Companies"
            value={formatNumber(stats.companies.total)}
            icon={Building2}
            change={stats.companies.growth}
            changeType={stats.companies.growth >= 0 ? 'positive' : 'negative'}
            color="indigo"
            loading={loading.stats}
            appTheme={appTheme}
          />
          <StatCard
            title="Active Companies"
            value={formatNumber(stats.companies.active)}
            icon={Building2}
            color="green"
            loading={loading.stats}
            appTheme={appTheme}
          />
          <StatCard
            title="Total Users"
            value={formatNumber(stats.users.total)}
            icon={Users}
            change={stats.users.growth}
            changeType={stats.users.growth >= 0 ? 'positive' : 'negative'}
            color="blue"
            loading={loading.stats}
            appTheme={appTheme}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue.total)}
            icon={DollarSign}
            change={stats.revenue.growth}
            changeType={stats.revenue.growth >= 0 ? 'positive' : 'negative'}
            color="purple"
            loading={loading.stats}
            appTheme={appTheme}
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="rounded-lg shadow-sm border p-3 sm:p-4" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <p className="text-xs mb-1" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Pending Companies</p>
            <p className="text-lg sm:text-xl font-bold" style={{ color: appTheme.colors.warning, fontFamily: appTheme.fonts.families.primary }}>{stats.companies.pending}</p>
          </div>
          <div className="rounded-lg shadow-sm border p-3 sm:p-4" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <p className="text-xs mb-1" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Suspended</p>
            <p className="text-lg sm:text-xl font-bold" style={{ color: appTheme.colors.error, fontFamily: appTheme.fonts.families.primary }}>{stats.companies.suspended}</p>
          </div>
          <div className="rounded-lg shadow-sm border p-3 sm:p-4" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <p className="text-xs mb-1" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Active Users</p>
            <p className="text-lg sm:text-xl font-bold" style={{ color: appTheme.colors.success, fontFamily: appTheme.fonts.families.primary }}>{stats.users.active}</p>
          </div>
          <div className="rounded-lg shadow-sm border p-3 sm:p-4" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <p className="text-xs mb-1" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Avg Revenue/Company</p>
            <p className="text-lg sm:text-xl font-bold" style={{ color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary }}>
              {stats.companies.total ? formatCurrency(stats.revenue.total / stats.companies.total) : '₹0'}
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <NavigationCard
            title="Create Company"
            description="Add a new company to the platform"
            icon={Building2}
            color="indigo"
            onClick={() => handleNavigation('/super-admin/companies/create')}
            appTheme={appTheme}
          />
          <NavigationCard
            title="View Companies"
            description="Manage all registered companies"
            icon={Building2}
            color="blue"
            onClick={() => handleNavigation('/super-admin/companies')}
            appTheme={appTheme}
          />
          <NavigationCard
            title="Manage Users"
            description="View and manage all users"
            icon={Users}
            color="green"
            onClick={() => handleNavigation('/super-admin/users')}
            appTheme={appTheme}
          />
          <NavigationCard
            title="Subscriptions"
            description="Manage plans and subscriptions"
            icon={CreditCard}
            color="purple"
            onClick={() => handleNavigation('/super-admin/subscriptions')}
            appTheme={appTheme}
          />
          <NavigationCard
            title="View Analytics"
            description="Detailed platform analytics and reports"
            icon={BarChart3}
            color="orange"
            onClick={() => handleNavigation('/super-admin/analytics')}
            appTheme={appTheme}
          />
        </div>

        {/* Recent Companies & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Recent Companies */}
          <div className="rounded-xl shadow-sm border" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <div className="p-4 sm:p-6 border-b flex justify-between items-center" style={{ borderColor: appTheme.colors.border }}>
              <h2 className="text-sm sm:text-base font-semibold flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                Recent Companies
              </h2>
              <button
                onClick={() => handleNavigation('/super-admin/companies')}
                className="text-xs sm:text-sm flex items-center"
                style={{ color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary }}
              >
                View All
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </button>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: appTheme.colors.borderLight }}>
              {loading.recent ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto" style={{ color: appTheme.colors.primary }} />
                  <p className="mt-2 text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Loading companies...</p>
                </div>
              ) : recentCompanies.length === 0 ? (
                <div className="p-6 text-center">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3" style={{ color: appTheme.colors.textSecondary }} />
                  <p className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>No companies found</p>
                </div>
              ) : (
                recentCompanies.map(company => (
                  <RecentCompanyRow
                    key={company.id}
                    company={company}
                    onView={(id) => handleNavigation(`/super-admin/companies/${id}`)}
                    appTheme={appTheme}
                  />
                ))
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="rounded-xl shadow-sm border" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <div className="p-4 sm:p-6 border-b" style={{ borderColor: appTheme.colors.border }}>
              <h2 className="text-sm sm:text-base font-semibold flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                Recent Activities
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: appTheme.colors.borderLight }}>
              {loading.activities ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto" style={{ color: appTheme.colors.primary }} />
                  <p className="mt-2 text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Loading activities...</p>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="p-6 text-center">
                  <Activity className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3" style={{ color: appTheme.colors.textSecondary }} />
                  <p className="text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>No recent activities</p>
                </div>
              ) : (
                recentActivities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} appTheme={appTheme} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Health & Quick Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <SystemHealthCard health={systemHealth} appTheme={appTheme} />
          </div>
          <div className="rounded-xl shadow-sm border p-4 sm:p-6" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <h3 className="text-sm sm:text-base font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: appTheme.colors.primary }} />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ backgroundColor: appTheme.colors.primary }}></span>
                <span>New companies are created with default Free plan</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ backgroundColor: appTheme.colors.primary }}></span>
                <span>You can upgrade company plans from Subscriptions page</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ backgroundColor: appTheme.colors.primary }}></span>
                <span>Monitor pending companies that need verification</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ backgroundColor: appTheme.colors.primary }}></span>
                <span>Use Analytics page for detailed insights and reports</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ backgroundColor: appTheme.colors.primary }}></span>
                <span>Check system health regularly for optimal performance</span>
              </li>
            </ul>
            
            {/* Quick Links */}
            <div className="mt-6 pt-4 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
              <h4 className="text-xs font-medium mb-3" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Quick Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavigation('/super-admin/companies/create')}
                  className="p-2 rounded-lg text-xs flex items-center justify-center"
                  style={{ backgroundColor: `${appTheme.colors.primary}15`, color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  New Company
                </button>
                <button
                  onClick={() => handleNavigation('/super-admin/users')}
                  className="p-2 rounded-lg text-xs flex items-center justify-center"
                  style={{ backgroundColor: `${appTheme.colors.success}15`, color: appTheme.colors.success, fontFamily: appTheme.fonts.families.primary }}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}