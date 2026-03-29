


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
//   Mail,
//   Phone,
//   Calendar,
//   Users,
//   Package,
//   ShoppingCart,
//   MoreVertical,
//   Edit,
//   Trash2,
//   Power,
//   Eye,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Smartphone,
//   Wifi,
//   WifiOff,
//   MessageSquare,
//   MapPin,
//   Link as LinkIcon,
//   Copy,
//   LayoutGrid,
//   Table as TableIcon,
//   ArrowUpDown
// } from 'lucide-react';

// export default function CompaniesPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();
  
//   // State
//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // View mode: 'table' for desktop, 'grid' for mobile
//   const [viewMode, setViewMode] = useState('table');
  
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
//   const [whatsappFilter, setWhatsappFilter] = useState('all');
//   const [showFilters, setShowFilters] = useState(false);
  
//   // Bulk selection
//   const [selectedCompanies, setSelectedCompanies] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
  
//   // Sort
//   const [sortBy, setSortBy] = useState('createdAt');
//   const [sortOrder, setSortOrder] = useState('desc');
  
//   // Action menu
//   const [actionMenu, setActionMenu] = useState(null);
//   const [copySuccess, setCopySuccess] = useState(null);
  
//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     pending: 0,
//     suspended: 0,
//     whatsapp: { total: 0, connected: 0, disconnected: 0 },
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

//   // Auto-detect view mode based on screen size
//   useEffect(() => {
//     const handleResize = () => {
//       setViewMode(window.innerWidth < 768 ? 'grid' : 'table');
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

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

//   const copyCatalogLink = (slug) => {
//     const catalogLink = `${window.location.origin}/catalogue/products?company=${slug}`;
//     navigator.clipboard.writeText(catalogLink);
//     setCopySuccess(slug);
//     setTimeout(() => setCopySuccess(null), 2000);
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       active: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Active' },
//       pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Pending' },
//       suspended: { bg: 'bg-rose-50', text: 'text-rose-700', icon: XCircle, label: 'Suspended' },
//       inactive: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Power, label: 'Inactive' },
//     };
//     const badge = badges[status] || badges.inactive;
//     const Icon = badge.icon;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
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
//         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
//           <Smartphone className="w-3 h-3 mr-1" />
//           No Number
//         </span>
//       );
//     }
    
//     if (isConnected) {
//       return (
//         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
//           <Wifi className="w-3 h-3 mr-1" />
//           Connected
//         </span>
//       );
//     } else {
//       return (
//         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
//           <WifiOff className="w-3 h-3 mr-1" />
//           Disconnected
//         </span>
//       );
//     }
//   };

//   const getPlanBadge = (plan) => {
//     const plans = {
//       free: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Free' },
//       basic: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Basic' },
//       pro: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Pro' },
//       enterprise: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Enterprise' },
//     };
//     const planData = plans[plan] || plans.free;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${planData.bg} ${planData.text}`}>
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

//   // Modern Pagination Component
//   const ModernPagination = () => {
//     if (totalPages <= 1) return null;

//     const getPageNumbers = () => {
//       const delta = 2;
//       const range = [];
//       const rangeWithDots = [];
//       let l;

//       for (let i = 1; i <= totalPages; i++) {
//         if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
//           range.push(i);
//         }
//       }

//       range.forEach((i) => {
//         if (l) {
//           if (i - l === 2) {
//             rangeWithDots.push(l + 1);
//           } else if (i - l !== 1) {
//             rangeWithDots.push('...');
//           }
//         }
//         rangeWithDots.push(i);
//         l = i;
//       });

//       return rangeWithDots;
//     };

//     return (
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl px-4 py-3 border border-gray-100">
//         <div className="text-sm text-gray-500">
//           Showing <span className="font-medium text-gray-700">{((page - 1) * limit) + 1}</span> to{' '}
//           <span className="font-medium text-gray-700">{Math.min(page * limit, total)}</span> of{' '}
//           <span className="font-medium text-gray-700">{total}</span> companies
//         </div>
        
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//           >
//             <ChevronLeft className="w-4 h-4" />
//           </button>
          
//           <div className="flex items-center gap-1.5">
//             {getPageNumbers().map((pageNum, idx) => (
//               pageNum === '...' ? (
//                 <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
//               ) : (
//                 <button
//                   key={pageNum}
//                   onClick={() => setPage(pageNum)}
//                   className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
//                     page === pageNum
//                       ? 'bg-indigo-600 text-white shadow-sm'
//                       : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
//                   }`}
//                 >
//                   {pageNum}
//                 </button>
//               )
//             ))}
//           </div>
          
//           <button
//             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//           >
//             <ChevronRight className="w-4 h-4" />
//           </button>
          
//           <select
//             value={limit}
//             onChange={(e) => {
//               setLimit(Number(e.target.value));
//               setPage(1);
//             }}
//             className="ml-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//           >
//             <option value={10}>10 / page</option>
//             <option value={25}>25 / page</option>
//             <option value={50}>50 / page</option>
//             <option value={100}>100 / page</option>
//           </select>
//         </div>
//       </div>
//     );
//   };

//   // Company Card Component for Mobile/Grid View
//   const CompanyCard = ({ company }) => (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
//       <div className="p-5">
//         {/* Header with company name and menu */}
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
//               <Building2 className="w-6 h-6 text-indigo-600" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900">{company.companyName}</h3>
//               <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
//                 <MapPin className="w-3 h-3" />
//                 {company.address?.city || 'N/A'}, {company.address?.state || 'N/A'}
//               </div>
//             </div>
//           </div>
//           <div className="relative">
//             <button
//               onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <MoreVertical className="w-5 h-5 text-gray-400" />
//             </button>
//             {actionMenu === company.id && (
//               <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
//                 {menuItems(company)}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* WhatsApp & Status Row */}
//         <div className="flex flex-wrap gap-2 mb-4">
//           {getWhatsAppBadge(company)}
//           {getPlanBadge(company.subscription?.plan)}
//           {getStatusBadge(company.status)}
//         </div>

//         {/* Contact Info */}
//         <div className="space-y-2 mb-4">
//           <div className="flex items-center text-sm text-gray-600">
//             <Mail className="w-4 h-4 mr-2 text-gray-400" />
//             <span className="truncate">{company.companyEmail}</span>
//           </div>
//           <div className="flex items-center text-sm text-gray-600">
//             <Phone className="w-4 h-4 mr-2 text-gray-400" />
//             {company.companyPhone}
//           </div>
//           {company.whatsapp?.phoneNumber && (
//             <div className="flex items-center text-sm text-gray-600">
//               <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
//               {company.whatsapp.phoneNumber}
//             </div>
//           )}
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
//           <div className="text-center">
//             <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
//             <p className="text-sm font-semibold text-gray-900">{company.stats?.totalUsers || 0}</p>
//             <p className="text-xs text-gray-500">Users</p>
//           </div>
//           <div className="text-center">
//             <Package className="w-4 h-4 text-gray-400 mx-auto mb-1" />
//             <p className="text-sm font-semibold text-gray-900">{company.stats?.totalProducts || 0}</p>
//             <p className="text-xs text-gray-500">Products</p>
//           </div>
//           <div className="text-center">
//             <MessageSquare className="w-4 h-4 text-gray-400 mx-auto mb-1" />
//             <p className="text-sm font-semibold text-gray-900">{company.stats?.whatsapp?.totalMessages || 0}</p>
//             <p className="text-xs text-gray-500">Messages</p>
//           </div>
//         </div>

//         {/* Footer with date and slug */}
//         <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
//           <div className="flex items-center">
//             <Calendar className="w-3 h-3 mr-1" />
//             {formatDate(company.createdAt)}
//           </div>
//           {company.slug && (
//             <button
//               onClick={() => copyCatalogLink(company.slug)}
//               className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
//             >
//               {copySuccess === company.slug ? (
//                 <CheckCircle2 className="w-3 h-3" />
//               ) : (
//                 <Copy className="w-3 h-3" />
//               )}
//               <span className="text-xs">Copy Link</span>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const menuItems = (company) => (
//     <>
//       <button
//         onClick={() => { router.push(`/super-admin/companies/${company.id}`); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//       >
//         <Eye className="w-4 h-4" /> View Details
//       </button>
//       <button
//         onClick={() => { router.push(`/super-admin/companies/${company.id}/edit`); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//       >
//         <Edit className="w-4 h-4" /> Edit Company
//       </button>
//       {company.slug && (
//         <button
//           onClick={() => { copyCatalogLink(company.slug); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
//         >
//           <LinkIcon className="w-4 h-4" /> Copy Catalog Link
//         </button>
//       )}
//       <button
//         onClick={() => { router.push(`/super-admin/companies/${company.id}/whatsapp`); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
//       >
//         <Smartphone className="w-4 h-4" /> WhatsApp Settings
//       </button>
//       <div className="border-t my-1"></div>
//       {company.status !== 'active' && (
//         <button
//           onClick={() => { handleCompanyAction(company.id, 'activate'); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
//         >
//           <Power className="w-4 h-4" /> Activate
//         </button>
//       )}
//       {company.status === 'active' && (
//         <button
//           onClick={() => { handleCompanyAction(company.id, 'suspend'); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
//         >
//           <XCircle className="w-4 h-4" /> Suspend
//         </button>
//       )}
//       {company.whatsapp?.isConnected && (
//         <button
//           onClick={() => { handleCompanyAction(company.id, 'disconnect-whatsapp'); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
//         >
//           <WifiOff className="w-4 h-4" /> Disconnect WhatsApp
//         </button>
//       )}
//       <button
//         onClick={() => { handleCompanyAction(company.id, 'delete'); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
//       >
//         <Trash2 className="w-4 h-4" /> Delete
//       </button>
//     </>
//   );

//   if (status === 'loading' || !session) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50/20">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
//           <p className="mt-4 text-gray-600 font-medium">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
//       {/* Modern Sticky Header */}
//       <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center">
//                 <Building2 className="w-7 h-7 mr-2 text-indigo-500" />
//                 Companies
//               </h1>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Manage all companies, catalog links, and WhatsApp integrations
//               </p>
//             </div>
//             <button
//               onClick={() => router.push('/super-admin/companies/create')}
//               className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95"
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               New Company
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {[
//             { label: 'Total Companies', value: stats.total || total, icon: Building2, color: 'indigo' },
//             { label: 'Active', value: stats.active || 0, icon: CheckCircle2, color: 'emerald' },
//             { label: 'WhatsApp Connected', value: stats.whatsapp?.connected || 0, icon: Smartphone, color: 'blue' },
//             { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'amber' },
//             { label: 'Catalog Links', value: companies.filter(c => c.slug).length, icon: LinkIcon, color: 'purple' }
//           ].map((stat, idx) => (
//             <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all hover:border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
//                   <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
//                 </div>
//                 <div className={`p-2.5 bg-${stat.color}-100 rounded-xl`}>
//                   <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
//         {/* Search and Filter Bar */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
//           <div className="p-4">
//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by name, email, phone, slug..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className={`px-4 py-2.5 border rounded-xl flex items-center gap-2 transition-all ${
//                     showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Filter className="w-4 h-4" />
//                   <span className="hidden sm:inline">Filters</span>
//                   {(statusFilter !== 'all' || planFilter !== 'all' || whatsappFilter !== 'all') && (
//                     <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
//                   )}
//                 </button>
//                 <button
//                   onClick={fetchCompanies}
//                   className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
//                   disabled={loading}
//                 >
//                   <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                 </button>
//                 {/* View Toggle - Mobile only */}
//                 <div className="md:hidden flex items-center border border-gray-200 rounded-xl overflow-hidden">
//                   <button
//                     onClick={() => setViewMode('grid')}
//                     className={`p-2.5 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
//                   >
//                     <LayoutGrid className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={() => setViewMode('table')}
//                     className={`p-2.5 ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
//                   >
//                     <TableIcon className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Expandable Filters */}
//             {showFilters && (
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
//                     <select
//                       value={statusFilter}
//                       onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="all">All Status</option>
//                       <option value="active">Active</option>
//                       <option value="pending">Pending</option>
//                       <option value="suspended">Suspended</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan</label>
//                     <select
//                       value={planFilter}
//                       onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="all">All Plans</option>
//                       <option value="free">Free</option>
//                       <option value="basic">Basic</option>
//                       <option value="pro">Pro</option>
//                       <option value="enterprise">Enterprise</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Status</label>
//                     <select
//                       value={whatsappFilter}
//                       onChange={(e) => { setWhatsappFilter(e.target.value); setPage(1); }}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="all">All</option>
//                       <option value="connected">Connected</option>
//                       <option value="disconnected">Disconnected</option>
//                       <option value="hasWhatsapp">Has WhatsApp Number</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort By</label>
//                     <select
//                       value={sortBy}
//                       onChange={(e) => setSortBy(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="createdAt">Created Date</option>
//                       <option value="companyName">Company Name</option>
//                       <option value="companyEmail">Email</option>
//                       <option value="slug">Slug</option>
//                       <option value="status">Status</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Bulk Actions Bar */}
//           {selectedCompanies.length > 0 && (
//             <div className="px-4 py-3 bg-indigo-50/80 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
//               <span className="text-sm text-indigo-700 font-medium">
//                 {selectedCompanies.length} company{selectedCompanies.length !== 1 ? 'ies' : ''} selected
//               </span>
//               <div className="flex gap-2 flex-wrap">
//                 <button onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-1 transition-colors">
//                   <Power className="w-3.5 h-3.5" /> Activate
//                 </button>
//                 <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 flex items-center gap-1 transition-colors">
//                   <XCircle className="w-3.5 h-3.5" /> Suspend
//                 </button>
//                 <button onClick={() => handleBulkAction('disconnect-whatsapp')} className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 flex items-center gap-1 transition-colors">
//                   <WifiOff className="w-3.5 h-3.5" /> Disconnect WhatsApp
//                 </button>
//                 <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1 transition-colors">
//                   <Trash2 className="w-3.5 h-3.5" /> Delete
//                 </button>
//                 <button onClick={() => { setSelectedCompanies([]); setSelectAll(false); }} className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
//                   Clear
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start">
//             <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 mr-3 flex-shrink-0" />
//             <div>
//               <p className="text-sm font-medium text-rose-800">Error loading companies</p>
//               <p className="text-sm text-rose-600 mt-0.5">{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Companies Display */}
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
//             <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
//             <p className="mt-3 text-gray-500 font-medium">Loading companies...</p>
//           </div>
//         ) : companies.length === 0 ? (
//           <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
//             <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 mb-4">No companies found</p>
//             <button onClick={() => router.push('/super-admin/companies/create')} className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
//               <Plus className="w-4 h-4 mr-2" /> Create First Company
//             </button>
//           </div>
//         ) : viewMode === 'grid' ? (
//           // Mobile/Tablet Card Grid View
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {companies.map(company => (
//               <CompanyCard key={company.id} company={company} />
//             ))}
//           </div>
//         ) : (
//           // Desktop Table View
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50/50">
//                 <tr>
//                   <th className="px-6 py-4 w-10">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={(e) => setSelectAll(e.target.checked)}
//                       className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
//                     />
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan & Status</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {companies.map(company => (
//                   <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
//                     <td className="px-6 py-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedCompanies.includes(company.id)}
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setSelectedCompanies([...selectedCompanies, company.id]);
//                           } else {
//                             setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
//                             setSelectAll(false);
//                           }
//                         }}
//                         className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
//                       />
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
//                           <Building2 className="w-5 h-5 text-indigo-600" />
//                         </div>
//                         <div>
//                           <p className="font-medium text-gray-900">{company.companyName}</p>
//                           <p className="text-xs text-gray-500 flex items-center mt-0.5">
//                             <MapPin className="w-3 h-3 mr-1" />
//                             {company.address?.city || 'N/A'}
//                           </p>
//                           {company.slug && (
//                             <button
//                               onClick={() => copyCatalogLink(company.slug)}
//                               className="text-xs text-indigo-600 flex items-center gap-1 mt-1 hover:text-indigo-700"
//                             >
//                               {copySuccess === company.slug ? (
//                                 <CheckCircle2 className="w-3 h-3" />
//                               ) : (
//                                 <Copy className="w-3 h-3" />
//                               )}
//                               Copy Link
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">{getWhatsAppBadge(company)}</td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-1 text-sm text-gray-600">
//                           <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
//                           <span className="truncate max-w-[180px]">{company.companyEmail}</span>
//                         </div>
//                         <div className="flex items-center gap-1 text-sm text-gray-600">
//                           <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
//                           {company.companyPhone}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1.5">
//                         {getPlanBadge(company.subscription?.plan)}
//                         {getStatusBadge(company.status)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex gap-3 text-sm">
//                         <div className="flex items-center gap-1">
//                           <Users className="w-4 h-4 text-gray-400" />
//                           <span>{company.stats?.totalUsers || 0}</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Package className="w-4 h-4 text-gray-400" />
//                           <span>{company.stats?.totalProducts || 0}</span>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
//                       <div className="flex items-center gap-1">
//                         <Calendar className="w-3.5 h-3.5" />
//                         {formatDate(company.createdAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-right relative">
//                       <button
//                         onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
//                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                       >
//                         <MoreVertical className="w-5 h-5 text-gray-400" />
//                       </button>
//                       {actionMenu === company.id && (
//                         <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
//                           {menuItems(company)}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Modern Pagination - Only shows when needed */}
//         <div className="mt-6">
//           <ModernPagination />
//         </div>
//       </div>
//     </div>
//   );
// }










// app/super-admin/companies/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { appTheme } from '../../../src/constants/theme';
import {
  Building2,
  Search,
  Plus,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Users,
  Package,
  ShoppingCart,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Wifi,
  WifiOff,
  MessageSquare,
  MapPin,
  Link as LinkIcon,
  Copy,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown
} from 'lucide-react';

export default function CompaniesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View mode: 'table' for desktop, 'grid' for mobile
  const [viewMode, setViewMode] = useState('table');
  
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
  const [whatsappFilter, setWhatsappFilter] = useState('all');
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
    whatsapp: { total: 0, connected: 0, disconnected: 0 },
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

  // Auto-detect view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? 'grid' : 'table');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const copyCatalogLink = (slug) => {
    const catalogLink = `${window.location.origin}/catalogue/products?company=${slug}`;
    navigator.clipboard.writeText(catalogLink);
    setCopySuccess(slug);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: appTheme.colors.successLight || '#d1fae5', text: appTheme.colors.success || '#10b981', icon: CheckCircle2, label: 'Active' },
      pending: { bg: appTheme.colors.warningLight || '#fef3c7', text: appTheme.colors.warning || '#f59e0b', icon: Clock, label: 'Pending' },
      suspended: { bg: appTheme.colors.errorLight || '#fee2e2', text: appTheme.colors.error || '#ef4444', icon: XCircle, label: 'Suspended' },
      inactive: { bg: '#f3f4f6', text: appTheme.colors.textSecondary || '#6b7280', icon: Power, label: 'Inactive' },
    };
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;
    
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
        <Icon className="w-3 h-3 mr-1" style={{ color: badge.text }} />
        {badge.label}
      </span>
    );
  };

  const getWhatsAppBadge = (company) => {
    const isConnected = company.whatsapp?.isConnected;
    const hasNumber = company.whatsapp?.phoneNumber || company.whatsappNumbers?.length > 0;
    
    if (!hasNumber) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#f3f4f6', color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
          <Smartphone className="w-3 h-3 mr-1" />
          No Number
        </span>
      );
    }
    
    if (isConnected) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: appTheme.colors.successLight || '#d1fae5', color: appTheme.colors.success || '#10b981', fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
          <Wifi className="w-3 h-3 mr-1" />
          Connected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: appTheme.colors.warningLight || '#fef3c7', color: appTheme.colors.warning || '#f59e0b', fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
          <WifiOff className="w-3 h-3 mr-1" />
          Disconnected
        </span>
      );
    }
  };

  const getPlanBadge = (plan) => {
    const plans = {
      free: { bg: '#f3f4f6', text: appTheme.colors.textSecondary || '#6b7280', label: 'Free' },
      basic: { bg: appTheme.colors.infoLight || '#e0f2fe', text: appTheme.colors.info || '#0284c7', label: 'Basic' },
      pro: { bg: appTheme.colors.primaryLight || '#eef2ff', text: appTheme.colors.primary || '#4f46e5', label: 'Pro' },
      enterprise: { bg: '#ede9fe', text: '#7c3aed', label: 'Enterprise' },
    };
    const planData = plans[plan] || plans.free;
    
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: planData.bg, color: planData.text, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
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

  // Modern Pagination Component
  const ModernPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
          range.push(i);
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
        <div className="text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}>
          Showing <span className="font-medium" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.medium }}>{((page - 1) * limit) + 1}</span> to{' '}
          <span className="font-medium" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.medium }}>{Math.min(page * limit, total)}</span> of{' '}
          <span className="font-medium" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.medium }}>{total}</span> companies
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border transition-all"
            style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, backgroundColor: appTheme.colors.backgroundCard, borderRadius: appTheme.radius.md }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {getPageNumbers().map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`dots-${idx}`} className="px-2" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum ? 'text-white shadow-sm' : 'border'
                  }`}
                  style={page === pageNum ? { backgroundColor: appTheme.colors.primary, color: 'white', borderRadius: appTheme.radius.md } : { borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, backgroundColor: appTheme.colors.backgroundCard, borderRadius: appTheme.radius.md }}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border transition-all"
            style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, backgroundColor: appTheme.colors.backgroundCard, borderRadius: appTheme.radius.md }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="ml-2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, borderRadius: appTheme.radius.md }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>
    );
  };

  // Company Card Component for Mobile/Grid View
  const CompanyCard = ({ company }) => (
    <div className="overflow-hidden hover:shadow-md transition-all duration-200" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl, borderWidth: '1px', borderStyle: 'solid' }}>
      <div className="p-5">
        {/* Header with company name and menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.primary}20, ${appTheme.colors.primary}40)`, borderRadius: appTheme.radius.lg }}>
              <Building2 className="w-6 h-6" style={{ color: appTheme.colors.primary }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.base }}>{company.companyName}</h3>
              <div className="flex items-center gap-1 mt-0.5" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>
                <MapPin className="w-3 h-3" />
                {company.address?.city || 'N/A'}, {company.address?.state || 'N/A'}
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.md }}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {actionMenu === company.id && (
              <div className="absolute right-0 mt-2 w-56 shadow-lg border z-20 py-1" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
                {menuItems(company)}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp & Status Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getWhatsAppBadge(company)}
          {getPlanBadge(company.subscription?.plan)}
          {getStatusBadge(company.status)}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
            <Mail className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
            <span className="truncate" style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyEmail}</span>
          </div>
          <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
            <Phone className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
            <span style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyPhone}</span>
          </div>
          {company.whatsapp?.phoneNumber && (
            <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
              <Smartphone className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
              <span style={{ fontFamily: appTheme.fonts.families.primary }}>{company.whatsapp.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
          <div className="text-center">
            <Users className="w-4 h-4 mx-auto mb-1" style={{ color: appTheme.colors.textTertiary }} />
            <p className="text-sm font-semibold" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.sm }}>{company.stats?.totalUsers || 0}</p>
            <p className="text-xs" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>Users</p>
          </div>
          <div className="text-center">
            <Package className="w-4 h-4 mx-auto mb-1" style={{ color: appTheme.colors.textTertiary }} />
            <p className="text-sm font-semibold" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.sm }}>{company.stats?.totalProducts || 0}</p>
            <p className="text-xs" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>Products</p>
          </div>
          <div className="text-center">
            <MessageSquare className="w-4 h-4 mx-auto mb-1" style={{ color: appTheme.colors.textTertiary }} />
            <p className="text-sm font-semibold" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.sm }}>{company.stats?.whatsapp?.totalMessages || 0}</p>
            <p className="text-xs" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>Messages</p>
          </div>
        </div>

        {/* Footer with date and slug */}
        <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(company.createdAt)}
          </div>
          {company.slug && (
            <button
              onClick={() => copyCatalogLink(company.slug)}
              className="flex items-center gap-1 hover:underline"
              style={{ color: appTheme.colors.primary, fontSize: appTheme.fonts.sizes.xs }}
            >
              {copySuccess === company.slug ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>Copy Link</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const menuItems = (company) => (
    <>
      <button
        onClick={() => { router.push(`/super-admin/companies/${company.id}`); setActionMenu(null); }}
        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
        style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
      >
        <Eye className="w-4 h-4" /> View Details
      </button>
      <button
        onClick={() => { router.push(`/super-admin/companies/${company.id}/edit`); setActionMenu(null); }}
        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
        style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
      >
        <Edit className="w-4 h-4" /> Edit Company
      </button>
      {company.slug && (
        <button
          onClick={() => { copyCatalogLink(company.slug); setActionMenu(null); }}
          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-purple-50"
          style={{ color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
        >
          <LinkIcon className="w-4 h-4" /> Copy Catalog Link
        </button>
      )}
      <button
        onClick={() => { router.push(`/super-admin/companies/${company.id}/whatsapp`); setActionMenu(null); }}
        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-blue-50"
        style={{ color: appTheme.colors.info, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
      >
        <Smartphone className="w-4 h-4" /> WhatsApp Settings
      </button>
      <div className="border-t my-1" style={{ borderColor: appTheme.colors.border }}></div>
      {company.status !== 'active' && (
        <button
          onClick={() => { handleCompanyAction(company.id, 'activate'); setActionMenu(null); }}
          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-emerald-50"
          style={{ color: appTheme.colors.success, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
        >
          <Power className="w-4 h-4" /> Activate
        </button>
      )}
      {company.status === 'active' && (
        <button
          onClick={() => { handleCompanyAction(company.id, 'suspend'); setActionMenu(null); }}
          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-amber-50"
          style={{ color: appTheme.colors.warning, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
        >
          <XCircle className="w-4 h-4" /> Suspend
        </button>
      )}
      {company.whatsapp?.isConnected && (
        <button
          onClick={() => { handleCompanyAction(company.id, 'disconnect-whatsapp'); setActionMenu(null); }}
          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-orange-50"
          style={{ color: appTheme.colors.warning, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
        >
          <WifiOff className="w-4 h-4" /> Disconnect WhatsApp
        </button>
      )}
      <button
        onClick={() => { handleCompanyAction(company.id, 'delete'); setActionMenu(null); }}
        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50"
        style={{ color: appTheme.colors.error, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
      >
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </>
  );

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: appTheme.colors.primary }} />
          <p className="mt-4 font-medium" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.base }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
      {/* Modern Sticky Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b shadow-sm" style={{ backgroundColor: `${appTheme.colors.backgroundCard}CC`, borderColor: appTheme.colors.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent flex items-center" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.textPrimary}, ${appTheme.colors.primary})`, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.bold }}>
                <Building2 className="w-7 h-7 mr-2" style={{ color: appTheme.colors.primary }} />
                Companies
              </h1>
              <p className="text-sm mt-0.5" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}>
                Manage all companies, catalog links, and WhatsApp integrations
              </p>
            </div>
            <button
              onClick={() => router.push('/super-admin/companies/create')}
              className="inline-flex items-center px-5 py-2.5 transition-all shadow-sm hover:shadow-md active:scale-95"
              style={{ backgroundColor: appTheme.colors.primary, color: 'white', borderRadius: appTheme.radius.xl }}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Company
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Companies', value: stats.total || total, icon: Building2, color: appTheme.colors.primary },
            { label: 'Active', value: stats.active || 0, icon: CheckCircle2, color: appTheme.colors.success },
            { label: 'WhatsApp Connected', value: stats.whatsapp?.connected || 0, icon: Smartphone, color: appTheme.colors.info },
            { label: 'Pending', value: stats.pending || 0, icon: Clock, color: appTheme.colors.warning },
            { label: 'Catalog Links', value: companies.filter(c => c.slug).length, icon: LinkIcon, color: appTheme.colors.secondary }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl, borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.bold, fontSize: appTheme.fonts.sizes["2xl"] }}>{stat.value}</p>
                </div>
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${stat.color}15`, borderRadius: appTheme.radius.lg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Search and Filter Bar */}
        <div className="shadow-sm border mb-6" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: appTheme.colors.textTertiary }} />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border focus:ring-2 focus:border-transparent transition-all"
                  style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 border rounded-xl flex items-center gap-2 transition-all ${
                    showFilters ? 'bg-opacity-10 border-opacity-30' : ''
                  }`}
                  style={showFilters ? { backgroundColor: `${appTheme.colors.primary}10`, borderColor: `${appTheme.colors.primary}30`, color: appTheme.colors.primary, borderRadius: appTheme.radius.lg } : { borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.lg }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline" style={{ fontSize: appTheme.fonts.sizes.sm }}>Filters</span>
                  {(statusFilter !== 'all' || planFilter !== 'all' || whatsappFilter !== 'all') && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: appTheme.colors.primary }}></span>
                  )}
                </button>
                <button
                  onClick={fetchCompanies}
                  className="px-4 py-2.5 border rounded-xl transition-all"
                  style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.lg }}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                {/* View Toggle - Mobile only */}
                <div className="md:hidden flex items-center border rounded-xl overflow-hidden" style={{ borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 ${viewMode === 'grid' ? 'bg-opacity-10' : ''}`}
                    style={viewMode === 'grid' ? { backgroundColor: `${appTheme.colors.primary}10`, color: appTheme.colors.primary } : { color: appTheme.colors.textSecondary }}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2.5 ${viewMode === 'table' ? 'bg-opacity-10' : ''}`}
                    style={viewMode === 'table' ? { backgroundColor: `${appTheme.colors.primary}10`, color: appTheme.colors.primary } : { color: appTheme.colors.textSecondary }}
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
                      style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Plan</label>
                    <select
                      value={planFilter}
                      onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
                      style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
                    >
                      <option value="all">All Plans</option>
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>WhatsApp Status</label>
                    <select
                      value={whatsappFilter}
                      onChange={(e) => { setWhatsappFilter(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
                      style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
                    >
                      <option value="all">All</option>
                      <option value="connected">Connected</option>
                      <option value="disconnected">Disconnected</option>
                      <option value="hasWhatsapp">Has WhatsApp Number</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
                      style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
                    >
                      <option value="createdAt">Created Date</option>
                      <option value="companyName">Company Name</option>
                      <option value="companyEmail">Email</option>
                      <option value="slug">Slug</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {selectedCompanies.length > 0 && (
            <div className="px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: `${appTheme.colors.primary}10`, borderColor: `${appTheme.colors.primary}30` }}>
              <span className="text-sm font-medium" style={{ color: appTheme.colors.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>
                {selectedCompanies.length} company{selectedCompanies.length !== 1 ? 'ies' : ''} selected
              </span>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.success, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
                  <Power className="w-3.5 h-3.5" /> Activate
                </button>
                <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.warning, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
                  <XCircle className="w-3.5 h-3.5" /> Suspend
                </button>
                <button onClick={() => handleBulkAction('disconnect-whatsapp')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.warning, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
                  <WifiOff className="w-3.5 h-3.5" /> Disconnect WhatsApp
                </button>
                <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.error, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button onClick={() => { setSelectedCompanies([]); setSelectAll(false); }} className="px-3 py-1.5 text-white text-sm rounded-lg transition-colors" style={{ backgroundColor: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 border rounded-xl p-4 flex items-start" style={{ backgroundColor: `${appTheme.colors.error}10`, borderColor: `${appTheme.colors.error}30`, borderRadius: appTheme.radius.xl }}>
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: appTheme.colors.error }} />
            <div>
              <p className="text-sm font-medium" style={{ color: appTheme.colors.error, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Error loading companies</p>
              <p className="text-sm mt-0.5" style={{ color: appTheme.colors.error, fontSize: appTheme.fonts.sizes.sm }}>{error}</p>
            </div>
          </div>
        )}

        {/* Companies Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: appTheme.colors.primary }} />
            <p className="mt-3 font-medium" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.base }}>Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-xl border py-16 text-center" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
            <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: appTheme.colors.textTertiary }} />
            <p className="mb-4" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.base }}>No companies found</p>
            <button onClick={() => router.push('/super-admin/companies/create')} className="inline-flex items-center px-5 py-2.5 rounded-xl transition-colors" style={{ backgroundColor: appTheme.colors.primary, color: 'white', borderRadius: appTheme.radius.xl }}>
              <Plus className="w-4 h-4 mr-2" /> Create First Company
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Mobile/Tablet Card Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          // Desktop Table View
          <div className="rounded-xl shadow-sm border overflow-hidden overflow-x-auto" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
            <table className="min-w-full divide-y" style={{ borderColor: appTheme.colors.border }}>
              <thead className="bg-opacity-50" style={{ backgroundColor: `${appTheme.colors.backgroundLight}80` }}>
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => setSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-indigo-500"
                      style={{ accentColor: appTheme.colors.primary }}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>WhatsApp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Plan & Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Stats</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Created</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: appTheme.colors.borderLight }}>
                {companies.map(company => (
                  <tr key={company.id} className="transition-colors" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
                    <td className="px-6 py-4">
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
                        className="w-4 h-4 rounded focus:ring-indigo-500"
                        style={{ accentColor: appTheme.colors.primary }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${appTheme.colors.primary}15`, borderRadius: appTheme.radius.lg }}>
                          <Building2 className="w-5 h-5" style={{ color: appTheme.colors.primary }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.medium, fontSize: appTheme.fonts.sizes.sm }}>{company.companyName}</p>
                          <p className="text-xs flex items-center mt-0.5" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>
                            <MapPin className="w-3 h-3 mr-1" />
                            {company.address?.city || 'N/A'}
                          </p>
                          {company.slug && (
                            <button
                              onClick={() => copyCatalogLink(company.slug)}
                              className="text-xs flex items-center gap-1 mt-1 hover:underline"
                              style={{ color: appTheme.colors.primary, fontSize: appTheme.fonts.sizes.xs }}
                            >
                              {copySuccess === company.slug ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy Link
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getWhatsAppBadge(company)}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                          <span className="truncate max-w-[180px]" style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyEmail}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                          <span style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {getPlanBadge(company.subscription?.plan)}
                        {getStatusBadge(company.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 text-sm" style={{ fontSize: appTheme.fonts.sizes.sm }}>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
                          <span style={{ color: appTheme.colors.textPrimary }}>{company.stats?.totalUsers || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
                          <span style={{ color: appTheme.colors.textPrimary }}>{company.stats?.totalProducts || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(company.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.md }}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {actionMenu === company.id && (
                        <div className="absolute right-0 mt-2 w-56 shadow-lg border z-20 py-1" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
                          {menuItems(company)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modern Pagination - Only shows when needed */}
        <div className="mt-6">
          <ModernPagination />
        </div>
      </div>
    </div>
  );
}

































































// // app/super-admin/companies/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { formatDistanceToNow } from 'date-fns';
// import { appTheme } from '../../../src/constants/theme';
// import {
//   Building2,
//   Search,
//   Plus,
//   Filter,
//   RefreshCw,
//   ChevronLeft,
//   ChevronRight,
//   Mail,
//   Phone,
//   Calendar,
//   Users,
//   Package,
//   ShoppingCart,
//   MoreVertical,
//   Edit,
//   Trash2,
//   Power,
//   Eye,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Smartphone,
//   Wifi,
//   WifiOff,
//   MessageSquare,
//   MapPin,
//   Link as LinkIcon,
//   Copy,
//   LayoutGrid,
//   Table as TableIcon,
//   ArrowUpDown,
//   Store,
//   CalendarDays,
//   Layers
// } from 'lucide-react';

// export default function CompaniesPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();
  
//   // State
//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // View mode: 'table' for desktop, 'grid' for mobile
//   const [viewMode, setViewMode] = useState('table');
  
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
//   const [serviceTypeFilter, setServiceTypeFilter] = useState('all'); // ✅ NEW: Service type filter
//   const [whatsappFilter, setWhatsappFilter] = useState('all');
//   const [showFilters, setShowFilters] = useState(false);
  
//   // Bulk selection
//   const [selectedCompanies, setSelectedCompanies] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
  
//   // Sort
//   const [sortBy, setSortBy] = useState('createdAt');
//   const [sortOrder, setSortOrder] = useState('desc');
  
//   // Action menu
//   const [actionMenu, setActionMenu] = useState(null);
//   const [copySuccess, setCopySuccess] = useState(null);
  
//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     pending: 0,
//     suspended: 0,
//     whatsapp: { total: 0, connected: 0, disconnected: 0 },
//     serviceTypes: { ecommerce: 0, booking: 0, both: 0 }, // ✅ NEW: Service type stats
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

//   // Auto-detect view mode based on screen size
//   useEffect(() => {
//     const handleResize = () => {
//       setViewMode(window.innerWidth < 768 ? 'grid' : 'table');
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

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
//   }, [page, limit, debouncedSearch, statusFilter, planFilter, serviceTypeFilter, whatsappFilter, sortBy, sortOrder]);

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
//         ...(serviceTypeFilter !== 'all' && { serviceType: serviceTypeFilter }), // ✅ NEW: Add service type filter
//       });

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

//   // ✅ NEW: Get service type badge
//   const getServiceTypeBadge = (serviceType) => {
//     const types = {
//       ecommerce: { bg: appTheme.colors.primaryLight || '#eef2ff', text: appTheme.colors.primary || '#4f46e5', icon: Store, label: 'E-Commerce' },
//       booking: { bg: appTheme.colors.infoLight || '#e0f2fe', text: appTheme.colors.info || '#0284c7', icon: CalendarDays, label: 'Booking' },
//       both: { bg: '#ede9fe', text: '#7c3aed', icon: Layers, label: 'Both' },
//     };
//     const type = types[serviceType] || types.ecommerce;
//     const Icon = type.icon;
    
//     return (
//       <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: type.bg, color: type.text, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
//         <Icon className="w-3 h-3 mr-1" />
//         {type.label}
//       </span>
//     );
//   };

//   const copyCatalogLink = (slug) => {
//     const catalogLink = `${window.location.origin}/catalogue/products?company=${slug}`;
//     navigator.clipboard.writeText(catalogLink);
//     setCopySuccess(slug);
//     setTimeout(() => setCopySuccess(null), 2000);
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       active: { bg: appTheme.colors.successLight || '#d1fae5', text: appTheme.colors.success || '#10b981', icon: CheckCircle2, label: 'Active' },
//       pending: { bg: appTheme.colors.warningLight || '#fef3c7', text: appTheme.colors.warning || '#f59e0b', icon: Clock, label: 'Pending' },
//       suspended: { bg: appTheme.colors.errorLight || '#fee2e2', text: appTheme.colors.error || '#ef4444', icon: XCircle, label: 'Suspended' },
//       inactive: { bg: '#f3f4f6', text: appTheme.colors.textSecondary || '#6b7280', icon: Power, label: 'Inactive' },
//     };
//     const badge = badges[status] || badges.inactive;
//     const Icon = badge.icon;
    
//     return (
//       <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
//         <Icon className="w-3 h-3 mr-1" style={{ color: badge.text }} />
//         {badge.label}
//       </span>
//     );
//   };

//   const getWhatsAppBadge = (company) => {
//     const isConnected = company.whatsapp?.isConnected;
//     const hasNumber = company.whatsapp?.phoneNumber || company.whatsappNumbers?.length > 0;
    
//     if (!hasNumber) {
//       return (
//         <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#f3f4f6', color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
//           <Smartphone className="w-3 h-3 mr-1" />
//           No Number
//         </span>
//       );
//     }
    
//     if (isConnected) {
//       return (
//         <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: appTheme.colors.successLight || '#d1fae5', color: appTheme.colors.success || '#10b981', fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
//           <Wifi className="w-3 h-3 mr-1" />
//           Connected
//         </span>
//       );
//     } else {
//       return (
//         <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: appTheme.colors.warningLight || '#fef3c7', color: appTheme.colors.warning || '#f59e0b', fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
//           <WifiOff className="w-3 h-3 mr-1" />
//           Disconnected
//         </span>
//       );
//     }
//   };

//   const getPlanBadge = (plan) => {
//     const plans = {
//       free: { bg: '#f3f4f6', text: appTheme.colors.textSecondary || '#6b7280', label: 'Free' },
//       basic: { bg: appTheme.colors.infoLight || '#e0f2fe', text: appTheme.colors.info || '#0284c7', label: 'Basic' },
//       pro: { bg: appTheme.colors.primaryLight || '#eef2ff', text: appTheme.colors.primary || '#4f46e5', label: 'Pro' },
//       enterprise: { bg: '#ede9fe', text: '#7c3aed', label: 'Enterprise' },
//     };
//     const planData = plans[plan] || plans.free;
    
//     return (
//       <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: planData.bg, color: planData.text, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>
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

//   // Modern Pagination Component
//   const ModernPagination = () => {
//     if (totalPages <= 1) return null;

//     const getPageNumbers = () => {
//       const delta = 2;
//       const range = [];
//       const rangeWithDots = [];
//       let l;

//       for (let i = 1; i <= totalPages; i++) {
//         if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
//           range.push(i);
//         }
//       }

//       range.forEach((i) => {
//         if (l) {
//           if (i - l === 2) {
//             rangeWithDots.push(l + 1);
//           } else if (i - l !== 1) {
//             rangeWithDots.push('...');
//           }
//         }
//         rangeWithDots.push(i);
//         l = i;
//       });

//       return rangeWithDots;
//     };

//     return (
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
//         <div className="text-sm" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}>
//           Showing <span className="font-medium" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.medium }}>{((page - 1) * limit) + 1}</span> to{' '}
//           <span className="font-medium" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.medium }}>{Math.min(page * limit, total)}</span> of{' '}
//           <span className="font-medium" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.medium }}>{total}</span> companies
//         </div>
        
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className="p-2 border transition-all"
//             style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, backgroundColor: appTheme.colors.backgroundCard, borderRadius: appTheme.radius.md }}
//           >
//             <ChevronLeft className="w-4 h-4" />
//           </button>
          
//           <div className="flex items-center gap-1.5">
//             {getPageNumbers().map((pageNum, idx) => (
//               pageNum === '...' ? (
//                 <span key={`dots-${idx}`} className="px-2" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>...</span>
//               ) : (
//                 <button
//                   key={pageNum}
//                   onClick={() => setPage(pageNum)}
//                   className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
//                     page === pageNum ? 'text-white shadow-sm' : 'border'
//                   }`}
//                   style={page === pageNum ? { backgroundColor: appTheme.colors.primary, color: 'white', borderRadius: appTheme.radius.md } : { borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, backgroundColor: appTheme.colors.backgroundCard, borderRadius: appTheme.radius.md }}
//                 >
//                   {pageNum}
//                 </button>
//               )
//             ))}
//           </div>
          
//           <button
//             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className="p-2 border transition-all"
//             style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, backgroundColor: appTheme.colors.backgroundCard, borderRadius: appTheme.radius.md }}
//           >
//             <ChevronRight className="w-4 h-4" />
//           </button>
          
//           <select
//             value={limit}
//             onChange={(e) => {
//               setLimit(Number(e.target.value));
//               setPage(1);
//             }}
//             className="ml-2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, borderRadius: appTheme.radius.md }}
//           >
//             <option value={10}>10 / page</option>
//             <option value={25}>25 / page</option>
//             <option value={50}>50 / page</option>
//             <option value={100}>100 / page</option>
//           </select>
//         </div>
//       </div>
//     );
//   };

//   // Company Card Component for Mobile/Grid View
//   const CompanyCard = ({ company }) => (
//     <div className="overflow-hidden hover:shadow-md transition-all duration-200" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl, borderWidth: '1px', borderStyle: 'solid' }}>
//       <div className="p-5">
//         {/* Header with company name and menu */}
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.primary}20, ${appTheme.colors.primary}40)`, borderRadius: appTheme.radius.lg }}>
//               <Building2 className="w-6 h-6" style={{ color: appTheme.colors.primary }} />
//             </div>
//             <div>
//               <h3 className="font-semibold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.base }}>{company.companyName}</h3>
//               <div className="flex items-center gap-1 mt-0.5" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>
//                 <MapPin className="w-3 h-3" />
//                 {company.address?.city || 'N/A'}, {company.address?.state || 'N/A'}
//               </div>
//             </div>
//           </div>
//           <div className="relative">
//             <button
//               onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
//               className="p-2 rounded-lg transition-colors"
//               style={{ color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.md }}
//             >
//               <MoreVertical className="w-5 h-5" />
//             </button>
//             {actionMenu === company.id && (
//               <div className="absolute right-0 mt-2 w-56 shadow-lg border z-20 py-1" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
//                 {menuItems(company)}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Service Type & WhatsApp & Status Row */}
//         <div className="flex flex-wrap gap-2 mb-4">
//           {getServiceTypeBadge(company.serviceType)} {/* ✅ NEW: Service type badge */}
//           {getWhatsAppBadge(company)}
//           {getPlanBadge(company.subscription?.plan)}
//           {getStatusBadge(company.status)}
//         </div>

//         {/* Contact Info */}
//         <div className="space-y-2 mb-4">
//           <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
//             <Mail className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
//             <span className="truncate" style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyEmail}</span>
//           </div>
//           <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
//             <Phone className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
//             <span style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyPhone}</span>
//           </div>
//           {company.whatsapp?.phoneNumber && (
//             <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
//               <Smartphone className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
//               <span style={{ fontFamily: appTheme.fonts.families.primary }}>{company.whatsapp.phoneNumber}</span>
//             </div>
//           )}
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-3 gap-3 py-3 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
//           <div className="text-center">
//             <Users className="w-4 h-4 mx-auto mb-1" style={{ color: appTheme.colors.textTertiary }} />
//             <p className="text-sm font-semibold" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.sm }}>{company.stats?.totalUsers || 0}</p>
//             <p className="text-xs" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>Users</p>
//           </div>
//           <div className="text-center">
//             <Package className="w-4 h-4 mx-auto mb-1" style={{ color: appTheme.colors.textTertiary }} />
//             <p className="text-sm font-semibold" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.sm }}>{company.stats?.totalProducts || 0}</p>
//             <p className="text-xs" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>Products</p>
//           </div>
//           <div className="text-center">
//             <MessageSquare className="w-4 h-4 mx-auto mb-1" style={{ color: appTheme.colors.textTertiary }} />
//             <p className="text-sm font-semibold" style={{ color: appTheme.colors.textPrimary, fontWeight: appTheme.fonts.weights.semibold, fontSize: appTheme.fonts.sizes.sm }}>{company.stats?.whatsapp?.totalMessages || 0}</p>
//             <p className="text-xs" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>Messages</p>
//           </div>
//         </div>

//         {/* Footer with date and slug */}
//         <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>
//           <div className="flex items-center">
//             <Calendar className="w-3 h-3 mr-1" />
//             {formatDate(company.createdAt)}
//           </div>
//           {company.slug && (
//             <button
//               onClick={() => copyCatalogLink(company.slug)}
//               className="flex items-center gap-1 hover:underline"
//               style={{ color: appTheme.colors.primary, fontSize: appTheme.fonts.sizes.xs }}
//             >
//               {copySuccess === company.slug ? (
//                 <CheckCircle2 className="w-3 h-3" />
//               ) : (
//                 <Copy className="w-3 h-3" />
//               )}
//               <span>Copy Link</span>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const menuItems = (company) => (
//     <>
//       <button
//         onClick={() => { router.push(`/super-admin/companies/${company.id}`); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
//         style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//       >
//         <Eye className="w-4 h-4" /> View Details
//       </button>
//       <button
//         onClick={() => { router.push(`/super-admin/companies/${company.id}/edit`); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
//         style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//       >
//         <Edit className="w-4 h-4" /> Edit Company
//       </button>
//       {company.slug && (
//         <button
//           onClick={() => { copyCatalogLink(company.slug); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-purple-50"
//           style={{ color: appTheme.colors.primary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//         >
//           <LinkIcon className="w-4 h-4" /> Copy Catalog Link
//         </button>
//       )}
//       <button
//         onClick={() => { router.push(`/super-admin/companies/${company.id}/whatsapp`); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-blue-50"
//         style={{ color: appTheme.colors.info, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//       >
//         <Smartphone className="w-4 h-4" /> WhatsApp Settings
//       </button>
//       <div className="border-t my-1" style={{ borderColor: appTheme.colors.border }}></div>
//       {company.status !== 'active' && (
//         <button
//           onClick={() => { handleCompanyAction(company.id, 'activate'); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-emerald-50"
//           style={{ color: appTheme.colors.success, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//         >
//           <Power className="w-4 h-4" /> Activate
//         </button>
//       )}
//       {company.status === 'active' && (
//         <button
//           onClick={() => { handleCompanyAction(company.id, 'suspend'); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-amber-50"
//           style={{ color: appTheme.colors.warning, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//         >
//           <XCircle className="w-4 h-4" /> Suspend
//         </button>
//       )}
//       {company.whatsapp?.isConnected && (
//         <button
//           onClick={() => { handleCompanyAction(company.id, 'disconnect-whatsapp'); setActionMenu(null); }}
//           className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-orange-50"
//           style={{ color: appTheme.colors.warning, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//         >
//           <WifiOff className="w-4 h-4" /> Disconnect WhatsApp
//         </button>
//       )}
//       <button
//         onClick={() => { handleCompanyAction(company.id, 'delete'); setActionMenu(null); }}
//         className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50"
//         style={{ color: appTheme.colors.error, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}
//       >
//         <Trash2 className="w-4 h-4" /> Delete
//       </button>
//     </>
//   );

//   if (status === 'loading' || !session) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: appTheme.colors.primary }} />
//           <p className="mt-4 font-medium" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.base }}>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
//       {/* Modern Sticky Header */}
//       <div className="sticky top-0 z-30 backdrop-blur-md border-b shadow-sm" style={{ backgroundColor: `${appTheme.colors.backgroundCard}CC`, borderColor: appTheme.colors.border }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent flex items-center" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.textPrimary}, ${appTheme.colors.primary})`, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.bold }}>
//                 <Building2 className="w-7 h-7 mr-2" style={{ color: appTheme.colors.primary }} />
//                 Companies
//               </h1>
//               <p className="text-sm mt-0.5" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm }}>
//                 Manage all companies, service types, catalog links, and WhatsApp integrations
//               </p>
//             </div>
//             <button
//               onClick={() => router.push('/super-admin/companies/create')}
//               className="inline-flex items-center px-5 py-2.5 transition-all shadow-sm hover:shadow-md active:scale-95"
//               style={{ backgroundColor: appTheme.colors.primary, color: 'white', borderRadius: appTheme.radius.xl }}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               New Company
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//           {[
//             { label: 'Total Companies', value: stats.total || total, icon: Building2, color: appTheme.colors.primary },
//             { label: 'Active', value: stats.active || 0, icon: CheckCircle2, color: appTheme.colors.success },
//             { label: 'WhatsApp Connected', value: stats.whatsapp?.connected || 0, icon: Smartphone, color: appTheme.colors.info },
//             { label: 'E-Commerce', value: stats.serviceTypes?.ecommerce || 0, icon: Store, color: appTheme.colors.primary }, // ✅ NEW
//             { label: 'Booking', value: stats.serviceTypes?.booking || 0, icon: CalendarDays, color: appTheme.colors.info }, // ✅ NEW
//             { label: 'Both', value: stats.serviceTypes?.both || 0, icon: Layers, color: '#7c3aed' } // ✅ NEW
//           ].map((stat, idx) => (
//             <div key={idx} className="p-4 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl, borderWidth: '1px', borderStyle: 'solid' }}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wide" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs }}>{stat.label}</p>
//                   <p className="text-2xl font-bold mt-1" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.bold, fontSize: appTheme.fonts.sizes["2xl"] }}>{stat.value}</p>
//                 </div>
//                 <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${stat.color}15`, borderRadius: appTheme.radius.lg }}>
//                   <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
//         {/* Search and Filter Bar */}
//         <div className="shadow-sm border mb-6" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
//           <div className="p-4">
//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: appTheme.colors.textTertiary }} />
//                 <input
//                   type="text"
//                   placeholder="Search by name, email, phone, slug..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 border focus:ring-2 focus:border-transparent transition-all"
//                   style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className={`px-4 py-2.5 border rounded-xl flex items-center gap-2 transition-all ${
//                     showFilters ? 'bg-opacity-10 border-opacity-30' : ''
//                   }`}
//                   style={showFilters ? { backgroundColor: `${appTheme.colors.primary}10`, borderColor: `${appTheme.colors.primary}30`, color: appTheme.colors.primary, borderRadius: appTheme.radius.lg } : { borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.lg }}
//                 >
//                   <Filter className="w-4 h-4" />
//                   <span className="hidden sm:inline" style={{ fontSize: appTheme.fonts.sizes.sm }}>Filters</span>
//                   {(statusFilter !== 'all' || planFilter !== 'all' || serviceTypeFilter !== 'all' || whatsappFilter !== 'all') && (
//                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: appTheme.colors.primary }}></span>
//                   )}
//                 </button>
//                 <button
//                   onClick={fetchCompanies}
//                   className="px-4 py-2.5 border rounded-xl transition-all"
//                   style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.lg }}
//                   disabled={loading}
//                 >
//                   <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                 </button>
//                 {/* View Toggle - Mobile only */}
//                 <div className="md:hidden flex items-center border rounded-xl overflow-hidden" style={{ borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
//                   <button
//                     onClick={() => setViewMode('grid')}
//                     className={`p-2.5 ${viewMode === 'grid' ? 'bg-opacity-10' : ''}`}
//                     style={viewMode === 'grid' ? { backgroundColor: `${appTheme.colors.primary}10`, color: appTheme.colors.primary } : { color: appTheme.colors.textSecondary }}
//                   >
//                     <LayoutGrid className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={() => setViewMode('table')}
//                     className={`p-2.5 ${viewMode === 'table' ? 'bg-opacity-10' : ''}`}
//                     style={viewMode === 'table' ? { backgroundColor: `${appTheme.colors.primary}10`, color: appTheme.colors.primary } : { color: appTheme.colors.textSecondary }}
//                   >
//                     <TableIcon className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Expandable Filters */}
//             {showFilters && (
//               <div className="mt-4 pt-4 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Status</label>
//                     <select
//                       value={statusFilter}
//                       onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
//                       className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
//                       style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
//                     >
//                       <option value="all">All Status</option>
//                       <option value="active">Active</option>
//                       <option value="pending">Pending</option>
//                       <option value="suspended">Suspended</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Plan</label>
//                     <select
//                       value={planFilter}
//                       onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
//                       className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
//                       style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
//                     >
//                       <option value="all">All Plans</option>
//                       <option value="free">Free</option>
//                       <option value="basic">Basic</option>
//                       <option value="pro">Pro</option>
//                       <option value="enterprise">Enterprise</option>
//                     </select>
//                   </div>
//                   {/* ✅ NEW: Service Type Filter */}
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Service Type</label>
//                     <select
//                       value={serviceTypeFilter}
//                       onChange={(e) => { setServiceTypeFilter(e.target.value); setPage(1); }}
//                       className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
//                       style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
//                     >
//                       <option value="all">All Types</option>
//                       <option value="ecommerce">E-Commerce Only</option>
//                       <option value="booking">Booking Only</option>
//                       <option value="both">Both</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>WhatsApp Status</label>
//                     <select
//                       value={whatsappFilter}
//                       onChange={(e) => { setWhatsappFilter(e.target.value); setPage(1); }}
//                       className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
//                       style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
//                     >
//                       <option value="all">All</option>
//                       <option value="connected">Connected</option>
//                       <option value="disconnected">Disconnected</option>
//                       <option value="hasWhatsapp">Has WhatsApp Number</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Sort By</label>
//                     <select
//                       value={sortBy}
//                       onChange={(e) => setSortBy(e.target.value)}
//                       className="w-full px-3 py-2 border focus:ring-2 focus:ring-indigo-500"
//                       style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.lg }}
//                     >
//                       <option value="createdAt">Created Date</option>
//                       <option value="companyName">Company Name</option>
//                       <option value="companyEmail">Email</option>
//                       <option value="slug">Slug</option>
//                       <option value="status">Status</option>
//                       <option value="serviceType">Service Type</option> {/* ✅ NEW */}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Bulk Actions Bar */}
//           {selectedCompanies.length > 0 && (
//             <div className="px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: `${appTheme.colors.primary}10`, borderColor: `${appTheme.colors.primary}30` }}>
//               <span className="text-sm font-medium" style={{ color: appTheme.colors.primary, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>
//                 {selectedCompanies.length} company{selectedCompanies.length !== 1 ? 'ies' : ''} selected
//               </span>
//               <div className="flex gap-2 flex-wrap">
//                 <button onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.success, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
//                   <Power className="w-3.5 h-3.5" /> Activate
//                 </button>
//                 <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.warning, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
//                   <XCircle className="w-3.5 h-3.5" /> Suspend
//                 </button>
//                 <button onClick={() => handleBulkAction('disconnect-whatsapp')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.warning, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
//                   <WifiOff className="w-3.5 h-3.5" /> Disconnect WhatsApp
//                 </button>
//                 <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: appTheme.colors.error, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
//                   <Trash2 className="w-3.5 h-3.5" /> Delete
//                 </button>
//                 <button onClick={() => { setSelectedCompanies([]); setSelectAll(false); }} className="px-3 py-1.5 text-white text-sm rounded-lg transition-colors" style={{ backgroundColor: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm, borderRadius: appTheme.radius.md }}>
//                   Clear
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 border rounded-xl p-4 flex items-start" style={{ backgroundColor: `${appTheme.colors.error}10`, borderColor: `${appTheme.colors.error}30`, borderRadius: appTheme.radius.xl }}>
//             <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: appTheme.colors.error }} />
//             <div>
//               <p className="text-sm font-medium" style={{ color: appTheme.colors.error, fontSize: appTheme.fonts.sizes.sm, fontWeight: appTheme.fonts.weights.medium }}>Error loading companies</p>
//               <p className="text-sm mt-0.5" style={{ color: appTheme.colors.error, fontSize: appTheme.fonts.sizes.sm }}>{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Companies Display */}
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-20 rounded-xl border" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
//             <Loader2 className="w-10 h-10 animate-spin" style={{ color: appTheme.colors.primary }} />
//             <p className="mt-3 font-medium" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.base }}>Loading companies...</p>
//           </div>
//         ) : companies.length === 0 ? (
//           <div className="rounded-xl border py-16 text-center" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
//             <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: appTheme.colors.textTertiary }} />
//             <p className="mb-4" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.base }}>No companies found</p>
//             <button onClick={() => router.push('/super-admin/companies/create')} className="inline-flex items-center px-5 py-2.5 rounded-xl transition-colors" style={{ backgroundColor: appTheme.colors.primary, color: 'white', borderRadius: appTheme.radius.xl }}>
//               <Plus className="w-4 h-4 mr-2" /> Create First Company
//             </button>
//           </div>
//         ) : viewMode === 'grid' ? (
//           // Mobile/Tablet Card Grid View
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {companies.map(company => (
//               <CompanyCard key={company.id} company={company} />
//             ))}
//           </div>
//         ) : (
//           // Desktop Table View
//           <div className="rounded-xl shadow-sm border overflow-hidden overflow-x-auto" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.xl }}>
//             <table className="min-w-full divide-y" style={{ borderColor: appTheme.colors.border }}>
//               <thead className="bg-opacity-50" style={{ backgroundColor: `${appTheme.colors.backgroundLight}80` }}>
//                 <tr>
//                   <th className="px-6 py-4 w-10">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={(e) => setSelectAll(e.target.checked)}
//                       className="w-4 h-4 rounded focus:ring-indigo-500"
//                       style={{ accentColor: appTheme.colors.primary }}
//                     />
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Company</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Service Type</th> {/* ✅ NEW */}
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>WhatsApp</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Contact</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Plan & Status</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Stats</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Created</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary, fontSize: appTheme.fonts.sizes.xs, fontWeight: appTheme.fonts.weights.semibold }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y" style={{ borderColor: appTheme.colors.borderLight }}>
//                 {companies.map(company => (
//                   <tr key={company.id} className="transition-colors" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
//                     <td className="px-6 py-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedCompanies.includes(company.id)}
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setSelectedCompanies([...selectedCompanies, company.id]);
//                           } else {
//                             setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
//                             setSelectAll(false);
//                           }
//                         }}
//                         className="w-4 h-4 rounded focus:ring-indigo-500"
//                         style={{ accentColor: appTheme.colors.primary }}
//                       />
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${appTheme.colors.primary}15`, borderRadius: appTheme.radius.lg }}>
//                           <Building2 className="w-5 h-5" style={{ color: appTheme.colors.primary }} />
//                         </div>
//                         <div>
//                           <p className="font-medium" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary, fontWeight: appTheme.fonts.weights.medium, fontSize: appTheme.fonts.sizes.sm }}>{company.companyName}</p>
//                           <p className="text-xs flex items-center mt-0.5" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.xs }}>
//                             <MapPin className="w-3 h-3 mr-1" />
//                             {company.address?.city || 'N/A'}
//                           </p>
//                           {company.slug && (
//                             <button
//                               onClick={() => copyCatalogLink(company.slug)}
//                               className="text-xs flex items-center gap-1 mt-1 hover:underline"
//                               style={{ color: appTheme.colors.primary, fontSize: appTheme.fonts.sizes.xs }}
//                             >
//                               {copySuccess === company.slug ? (
//                                 <CheckCircle2 className="w-3 h-3" />
//                               ) : (
//                                 <Copy className="w-3 h-3" />
//                               )}
//                               Copy Link
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">{getServiceTypeBadge(company.serviceType)}</td> {/* ✅ NEW */}
//                     <td className="px-6 py-4">{getWhatsAppBadge(company)}</td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-1 text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
//                           <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
//                           <span className="truncate max-w-[180px]" style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyEmail}</span>
//                         </div>
//                         <div className="flex items-center gap-1 text-sm" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
//                           <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
//                           <span style={{ fontFamily: appTheme.fonts.families.primary }}>{company.companyPhone}</span>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1.5">
//                         {getPlanBadge(company.subscription?.plan)}
//                         {getStatusBadge(company.status)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex gap-3 text-sm" style={{ fontSize: appTheme.fonts.sizes.sm }}>
//                         <div className="flex items-center gap-1">
//                           <Users className="w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
//                           <span style={{ color: appTheme.colors.textPrimary }}>{company.stats?.totalUsers || 0}</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Package className="w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
//                           <span style={{ color: appTheme.colors.textPrimary }}>{company.stats?.totalProducts || 0}</span>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: appTheme.colors.textSecondary, fontSize: appTheme.fonts.sizes.sm }}>
//                       <div className="flex items-center gap-1">
//                         <Calendar className="w-3.5 h-3.5" />
//                         {formatDate(company.createdAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-right relative">
//                       <button
//                         onClick={() => setActionMenu(actionMenu === company.id ? null : company.id)}
//                         className="p-2 rounded-lg transition-colors"
//                         style={{ color: appTheme.colors.textSecondary, borderRadius: appTheme.radius.md }}
//                       >
//                         <MoreVertical className="w-5 h-5" />
//                       </button>
//                       {actionMenu === company.id && (
//                         <div className="absolute right-0 mt-2 w-56 shadow-lg border z-20 py-1" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border, borderRadius: appTheme.radius.lg }}>
//                           {menuItems(company)}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Modern Pagination - Only shows when needed */}
//         <div className="mt-6">
//           <ModernPagination />
//         </div>
//       </div>
//     </div>
//   );
// }