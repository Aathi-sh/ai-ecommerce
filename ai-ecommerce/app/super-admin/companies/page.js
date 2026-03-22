


// // app/super-admin/companies/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { formatDistanceToNow } from 'date-fns';
// import {
//   Building2,
//   Search,
//   Plus,
//   Filter,
//   RefreshCw,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   ChevronUp,
//   Mail,
//   Phone,
//   Calendar,
//   Users,
//   Package,
//   ShoppingCart,
//   CalendarClock,
//   MoreVertical,
//   Edit,
//   Trash2,
//   Power,
//   Eye,
//   Download,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   TrendingUp,
//   TrendingDown,
//   Smartphone,
//   Wifi,
//   WifiOff,
//   MessageSquare,
//   Globe,
//   MapPin,
//   CreditCard,
//   QrCode,
// } from 'lucide-react';

// export default function CompaniesPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();
  
//   // State
//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Pagination
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
  
//   // Filters
//   const [search, setSearch] = useState('');
//   const [debouncedSearch, setDebouncedSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [planFilter, setPlanFilter] = useState('all');
//   const [whatsappFilter, setWhatsappFilter] = useState('all'); // 'all', 'connected', 'disconnected', 'pending'
//   const [showFilters, setShowFilters] = useState(false);
  
//   // Bulk selection
//   const [selectedCompanies, setSelectedCompanies] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
  
//   // Sort
//   const [sortBy, setSortBy] = useState('createdAt');
//   const [sortOrder, setSortOrder] = useState('desc');
  
//   // Action menu
//   const [actionMenu, setActionMenu] = useState(null);

//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     pending: 0,
//     suspended: 0,
//     whatsapp: {
//       total: 0,
//       connected: 0,
//       disconnected: 0
//     },
//     planDistribution: []
//   });

//   // Check authentication
//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login');
//     }
//     if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
//       router.push('/dashboard');
//     }
//   }, [status, session, router]);

//   // Debounce search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(search);
//       setPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [search]);

//   // Fetch companies
//   useEffect(() => {
//     fetchCompanies();
//   }, [page, limit, debouncedSearch, statusFilter, planFilter, whatsappFilter, sortBy, sortOrder]);

//   // Handle select all
//   useEffect(() => {
//     if (selectAll) {
//       setSelectedCompanies(companies.map(c => c.id));
//     } else {
//       setSelectedCompanies([]);
//     }
//   }, [selectAll, companies]);

//   const fetchCompanies = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: limit.toString(),
//         sortBy,
//         sortOrder,
//         ...(debouncedSearch && { search: debouncedSearch }),
//         ...(statusFilter !== 'all' && { status: statusFilter }),
//         ...(planFilter !== 'all' && { plan: planFilter }),
//       });

//       // Add WhatsApp filter
//       if (whatsappFilter === 'connected') {
//         params.append('whatsappConnected', 'true');
//       } else if (whatsappFilter === 'disconnected') {
//         params.append('whatsappConnected', 'false');
//       } else if (whatsappFilter === 'hasWhatsapp') {
//         params.append('hasWhatsapp', 'true');
//       }

//       const response = await fetch(`/api/companies?${params}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to fetch companies');
//       }

//       setCompanies(data.data || []);
//       setTotal(data.pagination?.total || 0);
//       setTotalPages(data.pagination?.pages || 0);
//       setStats(data.stats || {});
//     } catch (err) {
//       setError(err.message);
//       console.error('Fetch companies error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkAction = async (action) => {
//     if (selectedCompanies.length === 0) return;

//     const actionMessages = {
//       activate: 'activate',
//       suspend: 'suspend',
//       delete: 'delete',
//       'disconnect-whatsapp': 'disconnect WhatsApp for',
//     };

//     if (!confirm(`Are you sure you want to ${actionMessages[action]} ${selectedCompanies.length} selected companies?`)) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch('/api/companies', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action,
//           companyIds: selectedCompanies,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `Failed to ${action} companies`);
//       }

//       await fetchCompanies();
//       setSelectedCompanies([]);
//       setSelectAll(false);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompanyAction = async (companyId, action) => {
//     const actionMessages = {
//       activate: 'activate',
//       suspend: 'suspend',
//       delete: 'delete',
//       'disconnect-whatsapp': 'disconnect WhatsApp for',
//     };

//     if (!confirm(`Are you sure you want to ${actionMessages[action]} this company?`)) {
//       return;
//     }

//     setLoading(true);
//     try {
//       let response;
      
//       if (action === 'delete') {
//         response = await fetch(`/api/companies/${companyId}`, {
//           method: 'DELETE',
//         });
//       } else if (action === 'disconnect-whatsapp') {
//         response = await fetch(`/api/companies/${companyId}`, {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             action: 'whatsapp-status',
//             status: 'disconnected',
//             data: { reason: 'Manual disconnect by admin' }
//           }),
//         });
//       } else {
//         response = await fetch(`/api/companies/${companyId}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             status: action === 'activate' ? 'active' : 'suspended' 
//           }),
//         });
//       }

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `Failed to ${action} company`);
//       }

//       await fetchCompanies();
//       setActionMenu(null);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2, label: 'Active' },
//       pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
//       suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Suspended' },
//       inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Power, label: 'Inactive' },
//     };
//     const badge = badges[status] || badges.inactive;
//     const Icon = badge.icon;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {badge.label}
//       </span>
//     );
//   };

//   const getWhatsAppBadge = (company) => {
//     const isConnected = company.whatsapp?.isConnected;
//     const hasNumber = company.whatsapp?.phoneNumber || company.whatsappNumbers?.length > 0;
    
//     if (!hasNumber) {
//       return (
//         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//           <Smartphone className="w-3 h-3 mr-1" />
//           No Number
//         </span>
//       );
//     }
    
//     if (isConnected) {
//       return (
//         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//           <Wifi className="w-3 h-3 mr-1" />
//           Connected
//         </span>
//       );
//     } else {
//       return (
//         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//           <WifiOff className="w-3 h-3 mr-1" />
//           Disconnected
//         </span>
//       );
//     }
//   };

//   const getPlanBadge = (plan) => {
//     const plans = {
//       free: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Free' },
//       basic: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Basic' },
//       pro: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Pro' },
//       enterprise: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Enterprise' },
//     };
//     const planData = plans[plan] || plans.free;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planData.bg} ${planData.text}`}>
//         {planData.label}
//       </span>
//     );
//   };

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   if (status === 'loading' || !session) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 flex items-center">
//                 <Building2 className="w-8 h-8 mr-3 text-indigo-600" />
//                 Companies
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Manage all companies and their WhatsApp integrations
//               </p>
//             </div>
//             <button
//               onClick={() => router.push('/super-admin/companies/create')}
//               className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               New Company
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Companies</p>
//                 <p className="text-2xl font-semibold text-gray-900">{stats.total || total}</p>
//               </div>
//               <div className="p-3 bg-indigo-100 rounded-lg">
//                 <Building2 className="w-6 h-6 text-indigo-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Active</p>
//                 <p className="text-2xl font-semibold text-green-600">{stats.active || 0}</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <CheckCircle2 className="w-6 h-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">WhatsApp Connected</p>
//                 <p className="text-2xl font-semibold text-blue-600">{stats.whatsapp?.connected || 0}</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Smartphone className="w-6 h-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pending</p>
//                 <p className="text-2xl font-semibold text-yellow-600">{stats.pending || 0}</p>
//               </div>
//               <div className="p-3 bg-yellow-100 rounded-lg">
//                 <Clock className="w-6 h-6 text-yellow-600" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
//         {/* Filters and Search */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="p-4">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search companies by name, email, phone, WhatsApp number..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className={`px-4 py-2 border rounded-lg flex items-center transition-colors ${
//                     showFilters 
//                       ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
//                       : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Filter className="w-5 h-5 mr-2" />
//                   Filters
//                   {(statusFilter !== 'all' || planFilter !== 'all' || whatsappFilter !== 'all') && (
//                     <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
//                   )}
//                 </button>
//                 <button
//                   onClick={fetchCompanies}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                   disabled={loading}
//                 >
//                   <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
//                 </button>
//               </div>
//             </div>

//             {/* Expandable Filters */}
//             {showFilters && (
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Status
//                     </label>
//                     <select
//                       value={statusFilter}
//                       onChange={(e) => {
//                         setStatusFilter(e.target.value);
//                         setPage(1);
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="all">All Status</option>
//                       <option value="active">Active</option>
//                       <option value="pending">Pending</option>
//                       <option value="suspended">Suspended</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Plan
//                     </label>
//                     <select
//                       value={planFilter}
//                       onChange={(e) => {
//                         setPlanFilter(e.target.value);
//                         setPage(1);
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="all">All Plans</option>
//                       <option value="free">Free</option>
//                       <option value="basic">Basic</option>
//                       <option value="pro">Pro</option>
//                       <option value="enterprise">Enterprise</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       WhatsApp Status
//                     </label>
//                     <select
//                       value={whatsappFilter}
//                       onChange={(e) => {
//                         setWhatsappFilter(e.target.value);
//                         setPage(1);
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="all">All</option>
//                       <option value="connected">Connected</option>
//                       <option value="disconnected">Disconnected</option>
//                       <option value="hasWhatsapp">Has WhatsApp Number</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Sort By
//                     </label>
//                     <select
//                       value={sortBy}
//                       onChange={(e) => setSortBy(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="createdAt">Created Date</option>
//                       <option value="companyName">Company Name</option>
//                       <option value="companyEmail">Email</option>
//                       <option value="subscription.plan">Plan</option>
//                       <option value="status">Status</option>
//                       <option value="whatsapp.isConnected">WhatsApp Status</option>
//                       <option value="stats.totalUsers">Users Count</option>
//                       <option value="stats.totalProducts">Products Count</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Bulk Actions */}
//           {selectedCompanies.length > 0 && (
//             <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
//               <span className="text-sm text-indigo-700">
//                 <span className="font-medium">{selectedCompanies.length}</span> companies selected
//               </span>
//               <div className="flex gap-2 flex-wrap">
//                 <button
//                   onClick={() => handleBulkAction('activate')}
//                   className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center"
//                 >
//                   <Power className="w-4 h-4 mr-1" />
//                   Activate
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('suspend')}
//                   className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors flex items-center"
//                 >
//                   <XCircle className="w-4 h-4 mr-1" />
//                   Suspend
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('disconnect-whatsapp')}
//                   className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors flex items-center"
//                 >
//                   <WifiOff className="w-4 h-4 mr-1" />
//                   Disconnect WhatsApp
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('delete')}
//                   className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
//                 >
//                   <Trash2 className="w-4 h-4 mr-1" />
//                   Delete
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedCompanies([]);
//                     setSelectAll(false);
//                   }}
//                   className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
//             <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
//             <div>
//               <p className="text-sm font-medium text-red-800">Error loading companies</p>
//               <p className="text-sm text-red-600 mt-1">{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Companies Table */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={(e) => setSelectAll(e.target.checked)}
//                       className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                     />
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Company
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     WhatsApp
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Plan & Status
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Stats
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Created
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="8" className="px-6 py-12 text-center">
//                       <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
//                       <p className="mt-2 text-sm text-gray-500">Loading companies...</p>
//                     </td>
//                   </tr>
//                 ) : companies.length === 0 ? (
//                   <tr>
//                     <td colSpan="8" className="px-6 py-12 text-center">
//                       <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
//                       <p className="mt-2 text-sm text-gray-500">No companies found</p>
//                       <button
//                         onClick={() => router.push('/super-admin/companies/create')}
//                         className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                       >
//                         <Plus className="w-5 h-5 mr-2" />
//                         Create First Company
//                       </button>
//                     </td>
//                   </tr>
//                 ) : (
//                   companies.map((company) => (
//                     <tr key={company.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <input
//                           type="checkbox"
//                           checked={selectedCompanies.includes(company.id)}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setSelectedCompanies([...selectedCompanies, company.id]);
//                             } else {
//                               setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
//                               setSelectAll(false);
//                             }
//                           }}
//                           className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                         />
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
//                             <Building2 className="w-5 h-5 text-indigo-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">
//                               {company.companyName}
//                             </div>
//                             <div className="text-sm text-gray-500 flex items-center">
//                               <MapPin className="w-3 h-3 mr-1" />
//                               {company.address?.city || 'N/A'}, {company.address?.state || 'N/A'}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="space-y-2">
//                           {getWhatsAppBadge(company)}
//                           {company.whatsapp?.phoneNumber && (
//                             <div className="text-xs text-gray-600 flex items-center">
//                               <Smartphone className="w-3 h-3 mr-1" />
//                               {company.whatsapp.phoneNumber}
//                             </div>
//                           )}
//                           {company.whatsappNumbers?.length > 1 && (
//                             <div className="text-xs text-gray-500">
//                               +{company.whatsappNumbers.length - 1} more
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="space-y-1">
//                           <div className="flex items-center text-sm text-gray-600">
//                             <Mail className="w-4 h-4 mr-2 text-gray-400" />
//                             <span className="truncate max-w-[150px]">{company.companyEmail}</span>
//                           </div>
//                           <div className="flex items-center text-sm text-gray-600">
//                             <Phone className="w-4 h-4 mr-2 text-gray-400" />
//                             {company.companyPhone}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="space-y-2">
//                           {getPlanBadge(company.subscription?.plan)}
//                           {getStatusBadge(company.status)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="grid grid-cols-2 gap-2">
//                           <div className="flex items-center text-xs text-gray-600">
//                             <Users className="w-3 h-3 mr-1 text-gray-400" />
//                             {company.stats?.totalUsers || 0}
//                           </div>
//                           <div className="flex items-center text-xs text-gray-600">
//                             <Package className="w-3 h-3 mr-1 text-gray-400" />
//                             {company.stats?.totalProducts || 0}
//                           </div>
//                           <div className="flex items-center text-xs text-gray-600">
//                             <ShoppingCart className="w-3 h-3 mr-1 text-gray-400" />
//                             {company.stats?.totalOrders || 0}
//                           </div>
//                           <div className="flex items-center text-xs text-gray-600">
//                             <MessageSquare className="w-3 h-3 mr-1 text-gray-400" />
//                             {company.stats?.whatsapp?.totalMessages || 0}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-600">
//                           <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//                           <div>
//                             <div>{formatDate(company.createdAt)}</div>
//                             <div className="text-xs text-gray-400">
//                               {company.createdAt && formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
//                         <button
//                           onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
//                           className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
//                         >
//                           <MoreVertical className="w-5 h-5" />
//                         </button>
                        
//                         {actionMenu === company.id && (
//                           <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                             <div className="py-1">
//                               <button
//                                 onClick={() => {
//                                   router.push(`/super-admin/companies/${company.id}`);
//                                   setActionMenu(null);
//                                 }}
//                                 className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
//                               >
//                                 <Eye className="w-4 h-4 mr-2" />
//                                 View Details
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   router.push(`/super-admin/companies/${company.id}/edit`);
//                                   setActionMenu(null);
//                                 }}
//                                 className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
//                               >
//                                 <Edit className="w-4 h-4 mr-2" />
//                                 Edit Company
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   router.push(`/super-admin/companies/${company.id}/whatsapp`);
//                                   setActionMenu(null);
//                                 }}
//                                 className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
//                               >
//                                 <Smartphone className="w-4 h-4 mr-2" />
//                                 WhatsApp Settings
//                               </button>
//                               <div className="border-t border-gray-200 my-1"></div>
//                               {company.status !== 'active' && (
//                                 <button
//                                   onClick={() => {
//                                     handleCompanyAction(company.id, 'activate');
//                                     setActionMenu(null);
//                                   }}
//                                   className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center"
//                                 >
//                                   <Power className="w-4 h-4 mr-2" />
//                                   Activate
//                                 </button>
//                               )}
//                               {company.status !== 'suspended' && company.status === 'active' && (
//                                 <button
//                                   onClick={() => {
//                                     handleCompanyAction(company.id, 'suspend');
//                                     setActionMenu(null);
//                                   }}
//                                   className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 flex items-center"
//                                 >
//                                   <XCircle className="w-4 h-4 mr-2" />
//                                   Suspend
//                                 </button>
//                               )}
//                               {company.whatsapp?.isConnected && (
//                                 <button
//                                   onClick={() => {
//                                     handleCompanyAction(company.id, 'disconnect-whatsapp');
//                                     setActionMenu(null);
//                                   }}
//                                   className="w-full px-4 py-2 text-left text-sm text-orange-700 hover:bg-orange-50 flex items-center"
//                                 >
//                                   <WifiOff className="w-4 h-4 mr-2" />
//                                   Disconnect WhatsApp
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => {
//                                   handleCompanyAction(company.id, 'delete');
//                                   setActionMenu(null);
//                                 }}
//                                 className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center"
//                               >
//                                 <Trash2 className="w-4 h-4 mr-2" />
//                                 Delete
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 0 && (
//             <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-700">
//                   Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
//                   <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
//                   <span className="font-medium">{total}</span> companies
//                 </span>
//                 <select
//                   value={limit}
//                   onChange={(e) => {
//                     setLimit(Number(e.target.value));
//                     setPage(1);
//                   }}
//                   className="ml-4 px-2 py-1 border border-gray-300 rounded text-sm"
//                 >
//                   <option value={10}>10 per page</option>
//                   <option value={25}>25 per page</option>
//                   <option value={50}>50 per page</option>
//                   <option value={100}>100 per page</option>
//                 </select>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(p => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>
//                 {[...Array(Math.min(5, totalPages))].map((_, i) => {
//                   let pageNum;
//                   if (totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (page <= 3) {
//                     pageNum = i + 1;
//                   } else if (page >= totalPages - 2) {
//                     pageNum = totalPages - 4 + i;
//                   } else {
//                     pageNum = page - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={i}
//                       onClick={() => setPage(pageNum)}
//                       className={`px-3 py-1 border rounded-md text-sm ${
//                         page === pageNum
//                           ? 'bg-indigo-600 text-white border-indigo-600'
//                           : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//                 <button
//                   onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                 >
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }










// above code is without ctatalogue









// app/super-admin/companies/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import {
  Building2,
  Search,
  Plus,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  Users,
  Package,
  ShoppingCart,
  CalendarClock,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Wifi,
  WifiOff,
  MessageSquare,
  Globe,
  MapPin,
  CreditCard,
  QrCode,
  Link as LinkIcon,
  Copy
} from 'lucide-react';

export default function CompaniesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [whatsappFilter, setWhatsappFilter] = useState('all'); // 'all', 'connected', 'disconnected', 'pending'
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk selection
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Sort
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Action menu
  const [actionMenu, setActionMenu] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    whatsapp: {
      total: 0,
      connected: 0,
      disconnected: 0
    },
    planDistribution: []
  });

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, [page, limit, debouncedSearch, statusFilter, planFilter, whatsappFilter, sortBy, sortOrder]);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedCompanies(companies.map(c => c.id));
    } else {
      setSelectedCompanies([]);
    }
  }, [selectAll, companies]);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(planFilter !== 'all' && { plan: planFilter }),
      });

      // Add WhatsApp filter
      if (whatsappFilter === 'connected') {
        params.append('whatsappConnected', 'true');
      } else if (whatsappFilter === 'disconnected') {
        params.append('whatsappConnected', 'false');
      } else if (whatsappFilter === 'hasWhatsapp') {
        params.append('hasWhatsapp', 'true');
      }

      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch companies');
      }

      setCompanies(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 0);
      setStats(data.stats || {});
    } catch (err) {
      setError(err.message);
      console.error('Fetch companies error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCompanies.length === 0) return;

    const actionMessages = {
      activate: 'activate',
      suspend: 'suspend',
      delete: 'delete',
      'disconnect-whatsapp': 'disconnect WhatsApp for',
    };

    if (!confirm(`Are you sure you want to ${actionMessages[action]} ${selectedCompanies.length} selected companies?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          companyIds: selectedCompanies,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} companies`);
      }

      await fetchCompanies();
      setSelectedCompanies([]);
      setSelectAll(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyAction = async (companyId, action) => {
    const actionMessages = {
      activate: 'activate',
      suspend: 'suspend',
      delete: 'delete',
      'disconnect-whatsapp': 'disconnect WhatsApp for',
    };

    if (!confirm(`Are you sure you want to ${actionMessages[action]} this company?`)) {
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (action === 'delete') {
        response = await fetch(`/api/companies/${companyId}`, {
          method: 'DELETE',
        });
      } else if (action === 'disconnect-whatsapp') {
        response = await fetch(`/api/companies/${companyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'whatsapp-status',
            status: 'disconnected',
            data: { reason: 'Manual disconnect by admin' }
          }),
        });
      } else {
        response = await fetch(`/api/companies/${companyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: action === 'activate' ? 'active' : 'suspended' 
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} company`);
      }

      await fetchCompanies();
      setActionMenu(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Copy catalog link to clipboard
  const copyCatalogLink = (slug) => {
    const catalogLink = `${window.location.origin}/catalogue/products?company=${slug}`;
    navigator.clipboard.writeText(catalogLink);
    setCopySuccess(slug);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2, label: 'Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Suspended' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Power, label: 'Inactive' },
    };
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const getWhatsAppBadge = (company) => {
    const isConnected = company.whatsapp?.isConnected;
    const hasNumber = company.whatsapp?.phoneNumber || company.whatsappNumbers?.length > 0;
    
    if (!hasNumber) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Smartphone className="w-3 h-3 mr-1" />
          No Number
        </span>
      );
    }
    
    if (isConnected) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Wifi className="w-3 h-3 mr-1" />
          Connected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <WifiOff className="w-3 h-3 mr-1" />
          Disconnected
        </span>
      );
    }
  };

  const getPlanBadge = (plan) => {
    const plans = {
      free: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Free' },
      basic: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Basic' },
      pro: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Pro' },
      enterprise: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Enterprise' },
    };
    const planData = plans[plan] || plans.free;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planData.bg} ${planData.text}`}>
        {planData.label}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building2 className="w-8 h-8 mr-3 text-indigo-600" />
                Companies
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all companies, their catalog links, and WhatsApp integrations
              </p>
            </div>
            <button
              onClick={() => router.push('/super-admin/companies/create')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Company
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total || total}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp Connected</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.whatsapp?.connected || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* ✅ NEW: Total Catalog Links Stat */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Catalog Links</p>
                <p className="text-2xl font-semibold text-purple-600">{companies.filter(c => c.slug).length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <LinkIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies by name, email, phone, slug, WhatsApp number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 border rounded-lg flex items-center transition-colors ${
                    showFilters 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  {(statusFilter !== 'all' || planFilter !== 'all' || whatsappFilter !== 'all') && (
                    <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={fetchCompanies}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan
                    </label>
                    <select
                      value={planFilter}
                      onChange={(e) => {
                        setPlanFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Plans</option>
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Status
                    </label>
                    <select
                      value={whatsappFilter}
                      onChange={(e) => {
                        setWhatsappFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="connected">Connected</option>
                      <option value="disconnected">Disconnected</option>
                      <option value="hasWhatsapp">Has WhatsApp Number</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="createdAt">Created Date</option>
                      <option value="companyName">Company Name</option>
                      <option value="companyEmail">Email</option>
                      <option value="slug">Slug</option>
                      <option value="subscription.plan">Plan</option>
                      <option value="status">Status</option>
                      <option value="whatsapp.isConnected">WhatsApp Status</option>
                      <option value="stats.totalUsers">Users Count</option>
                      <option value="stats.totalProducts">Products Count</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedCompanies.length > 0 && (
            <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-indigo-700">
                <span className="font-medium">{selectedCompanies.length}</span> companies selected
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Power className="w-4 h-4 mr-1" />
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Suspend
                </button>
                <button
                  onClick={() => handleBulkAction('disconnect-whatsapp')}
                  className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors flex items-center"
                >
                  <WifiOff className="w-4 h-4 mr-1" />
                  Disconnect WhatsApp
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSelectedCompanies([]);
                    setSelectAll(false);
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error loading companies</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => setSelectAll(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Catalog
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan & Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">Loading companies...</p>
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">No companies found</p>
                      <button
                        onClick={() => router.push('/super-admin/companies/create')}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create First Company
                      </button>
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanies([...selectedCompanies, company.id]);
                            } else {
                              setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                              setSelectAll(false);
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {company.companyName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {company.address?.city || 'N/A'}, {company.address?.state || 'N/A'}
                            </div>
                            {/* ✅ NEW: Display slug and catalog link */}
                            {company.slug && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-xs text-gray-400">Slug:</span>
                                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                  {company.slug}
                                </code>
                                <button
                                  onClick={() => copyCatalogLink(company.slug)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Copy catalog link"
                                >
                                  {copySuccess === company.slug ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            )}
                            {/* ✅ NEW: Display catalog WhatsApp number */}
                            {company.catalogWhatsapp && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Smartphone className="w-3 h-3 mr-1 text-green-500" />
                                Catalog: {company.catalogWhatsapp}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getWhatsAppBadge(company)}
                          {company.whatsapp?.phoneNumber && (
                            <div className="text-xs text-gray-600 flex items-center">
                              <Smartphone className="w-3 h-3 mr-1" />
                              {company.whatsapp.phoneNumber}
                            </div>
                          )}
                          {company.whatsappNumbers?.length > 1 && (
                            <div className="text-xs text-gray-500">
                              +{company.whatsappNumbers.length - 1} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-[150px]">{company.companyEmail}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {company.companyPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getPlanBadge(company.subscription?.plan)}
                          {getStatusBadge(company.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center text-xs text-gray-600">
                            <Users className="w-3 h-3 mr-1 text-gray-400" />
                            {company.stats?.totalUsers || 0}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Package className="w-3 h-3 mr-1 text-gray-400" />
                            {company.stats?.totalProducts || 0}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <ShoppingCart className="w-3 h-3 mr-1 text-gray-400" />
                            {company.stats?.totalOrders || 0}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <MessageSquare className="w-3 h-3 mr-1 text-gray-400" />
                            {company.stats?.whatsapp?.totalMessages || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div>{formatDate(company.createdAt)}</div>
                            <div className="text-xs text-gray-400">
                              {company.createdAt && formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {actionMenu === company.id && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  router.push(`/super-admin/companies/${company.id}`);
                                  setActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  router.push(`/super-admin/companies/${company.id}/edit`);
                                  setActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Company
                              </button>
                              {/* ✅ NEW: Copy Catalog Link */}
                              {company.slug && (
                                <button
                                  onClick={() => {
                                    copyCatalogLink(company.slug);
                                    setActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-purple-700 hover:bg-purple-50 flex items-center"
                                >
                                  <LinkIcon className="w-4 h-4 mr-2" />
                                  Copy Catalog Link
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  router.push(`/super-admin/companies/${company.id}/whatsapp`);
                                  setActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center"
                              >
                                <Smartphone className="w-4 h-4 mr-2" />
                                WhatsApp Settings
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              {company.status !== 'active' && (
                                <button
                                  onClick={() => {
                                    handleCompanyAction(company.id, 'activate');
                                    setActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center"
                                >
                                  <Power className="w-4 h-4 mr-2" />
                                  Activate
                                </button>
                              )}
                              {company.status !== 'suspended' && company.status === 'active' && (
                                <button
                                  onClick={() => {
                                    handleCompanyAction(company.id, 'suspend');
                                    setActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 flex items-center"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Suspend
                                </button>
                              )}
                              {company.whatsapp?.isConnected && (
                                <button
                                  onClick={() => {
                                    handleCompanyAction(company.id, 'disconnect-whatsapp');
                                    setActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-orange-700 hover:bg-orange-50 flex items-center"
                                >
                                  <WifiOff className="w-4 h-4 mr-2" />
                                  Disconnect WhatsApp
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleCompanyAction(company.id, 'delete');
                                  setActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> companies
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="ml-4 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        page === pageNum
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}