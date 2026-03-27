

// // app/super-admin/companies/[id]/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import {
//   Building2,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   CreditCard,
//   Users,
//   Package,
//   ShoppingCart,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Power,
//   Edit,
//   Trash2,
//   ArrowLeft,
//   Loader2,
//   AlertCircle,
//   Globe,
//   Tag,
//   Briefcase,
//   Copy,
//   TrendingUp,
//   TrendingDown,
//   UserCircle,
//   Settings,
//   Shield,
//   Activity,
//   PieChart,
//   BarChart3,
//   RefreshCw,
//   MoreVertical,
//   Save,
//   Plus,
//   Search,
//   Filter,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   ChevronUp,
//   Star,
//   Lock,
//   Unlock,
//   UserPlus,
//   UserMinus,
//   UserCheck,
//   UserX,
//   Wallet,
//   CalendarDays,
//   Zap,
//   Award,
//   AlertTriangle,
//   Info,
//   HelpCircle,
//   FileText,
//   Smartphone,
//   Wifi,
//   WifiOff,
//   MessageSquare,
//   Link as LinkIcon,
//   Copy as CopyIcon,
//   Check as CheckIcon,
//   Menu,
//   X
// } from 'lucide-react';

// export default function CompanyDetailsPage({ params }) {
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const { id } = params;

//   // State
//   const [company, setCompany] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isEditing, setIsEditing] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [saveLoading, setSaveLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [whatsappNumbers, setWhatsappNumbers] = useState([]);
//   const [showAddWhatsAppModal, setShowAddWhatsAppModal] = useState(false);
//   const [newWhatsAppNumber, setNewWhatsAppNumber] = useState('');
//   const [newWhatsAppDesc, setNewWhatsAppDesc] = useState('');
//   const [newWhatsAppPrimary, setNewWhatsAppPrimary] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   // Form state for editing
//   const [formData, setFormData] = useState({
//     companyName: '',
//     companyEmail: '',
//     companyPhone: '',
//     slug: '',
//     catalogWhatsapp: '',
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       pincode: '',
//       country: 'India',
//     },
//     gstin: '',
//     pan: '',
//   });

//   // Users state
//   const [users, setUsers] = useState([]);
//   const [usersLoading, setUsersLoading] = useState(false);
//   const [userPage, setUserPage] = useState(1);
//   const [userTotal, setUserTotal] = useState(0);
//   const [userSearch, setUserSearch] = useState('');
//   const [userRoleFilter, setUserRoleFilter] = useState('all');
//   const [userStatusFilter, setUserStatusFilter] = useState('all');

//   // Stats state
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalProducts: 0,
//     totalOrders: 0,
//     totalBookings: 0,
//     totalRevenue: 0,
//     usage: {
//       users: { current: 0, limit: 0, percentage: 0 },
//       products: { current: 0, limit: 0, percentage: 0 },
//       orders: { current: 0, limit: 0, percentage: 0 },
//       bookings: { current: 0, limit: 0, percentage: 0 },
//     },
//     whatsapp: {
//       totalMessages: 0,
//       totalConversations: 0,
//       totalCustomers: 0,
//       messagesToday: 0,
//       lastMessageAt: null,
//       lastResetAt: null
//     }
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

//   // Fetch company data
//   useEffect(() => {
//     if (id) {
//       fetchCompany();
//     }
//   }, [id]);

//   // Fetch users when tab changes to users
//   useEffect(() => {
//     if (activeTab === 'users' && id) {
//       fetchUsers();
//     }
//   }, [activeTab, id, userPage, userSearch, userRoleFilter, userStatusFilter]);

//   const fetchCompany = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`/api/companies/${id}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to fetch company');
//       }

//       setCompany(data.data.company);
//       setStats(data.data.stats || {});
      
//       // Extract WhatsApp numbers
//       const numbers = [];
//       if (data.data.company.whatsapp?.phoneNumber) {
//         numbers.push({
//           number: data.data.company.whatsapp.phoneNumber,
//           type: 'primary',
//           isConnected: data.data.company.whatsapp.isConnected || false,
//           status: data.data.company.whatsapp.connectionStatus || 'disconnected'
//         });
//       }
//       if (data.data.company.whatsappNumbers) {
//         numbers.push(...data.data.company.whatsappNumbers);
//       }
//       setWhatsappNumbers(numbers);
      
//       // Initialize form data
//       setFormData({
//         companyName: data.data.company.companyName || '',
//         companyEmail: data.data.company.companyEmail || '',
//         companyPhone: data.data.company.companyPhone || '',
//         slug: data.data.company.slug || '',
//         catalogWhatsapp: data.data.company.catalogWhatsapp || '',
//         address: {
//           street: data.data.company.address?.street || '',
//           city: data.data.company.address?.city || '',
//           state: data.data.company.address?.state || '',
//           pincode: data.data.company.address?.pincode || '',
//           country: data.data.company.address?.country || 'India',
//         },
//         gstin: data.data.company.gstin || '',
//         pan: data.data.company.pan || '',
//       });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     setUsersLoading(true);
    
//     try {
//       const params = new URLSearchParams({
//         page: userPage.toString(),
//         limit: '10',
//         ...(userSearch && { search: userSearch }),
//         ...(userRoleFilter !== 'all' && { role: userRoleFilter }),
//         ...(userStatusFilter !== 'all' && { status: userStatusFilter }),
//       });

//       const response = await fetch(`/api/companies/${id}/users?${params}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to fetch users');
//       }

//       setUsers(data.data || []);
//       setUserTotal(data.pagination?.total || 0);
//     } catch (err) {
//       console.error('Fetch users error:', err);
//     } finally {
//       setUsersLoading(false);
//     }
//   };

//   const generateSlug = (name) => {
//     if (!name) return '';
//     let slug = name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
    
//     if (!slug || slug.length === 0) {
//       slug = `company-${Date.now()}`;
//     }
    
//     return slug;
//   };

//   const handleCompanyNameChange = (e) => {
//     const name = e.target.value;
//     setFormData({
//       ...formData,
//       companyName: name,
//       slug: generateSlug(name)
//     });
//   };

//   const handleSlugChange = (e) => {
//     let slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
//     setFormData({ ...formData, slug });
//   };

//   const copyCatalogLink = () => {
//     if (!formData.slug) return;
//     const catalogLink = `${window.location.origin}/catalogue/products?company=${formData.slug}`;
//     navigator.clipboard.writeText(catalogLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleSave = async () => {
//     setSaveLoading(true);
//     setError(null);
//     setSuccessMessage('');

//     try {
//       const response = await fetch(`/api/companies/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           companyName: formData.companyName,
//           companyEmail: formData.companyEmail,
//           companyPhone: formData.companyPhone,
//           slug: formData.slug,
//           catalogWhatsapp: formData.catalogWhatsapp,
//           address: formData.address,
//           gstin: formData.gstin,
//           pan: formData.pan,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to update company');
//       }

//       setCompany(data.data);
//       setIsEditing(false);
//       setSuccessMessage('Company updated successfully');
      
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     setSaveLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`/api/companies/${id}?permanent=false`, {
//         method: 'DELETE',
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to delete company');
//       }

//       router.push('/super-admin/companies');
//     } catch (err) {
//       setError(err.message);
//       setShowDeleteConfirm(false);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleWhatsAppAction = async (action, data = {}) => {
//     setSaveLoading(true);
    
//     try {
//       const response = await fetch(`/api/companies/${id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'whatsapp-status',
//           status: action,
//           data
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || 'Failed to update WhatsApp status');
//       }

//       await fetchCompany();
//       setSuccessMessage('WhatsApp status updated successfully');
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleAddWhatsAppNumber = async () => {
//     if (!newWhatsAppNumber.trim()) return;
    
//     const cleanNumber = newWhatsAppNumber.replace(/\D/g, '');
//     if (cleanNumber.length < 10 || cleanNumber.length > 12) {
//       alert('Please enter a valid 10-12 digit WhatsApp number');
//       return;
//     }

//     setSaveLoading(true);
    
//     try {
//       const response = await fetch(`/api/companies/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           additionalWhatsAppNumbers: [
//             ...(company.additionalWhatsAppNumbers || []),
//             {
//               number: cleanNumber,
//               description: newWhatsAppDesc || 'Additional WhatsApp number',
//               isPrimary: newWhatsAppPrimary
//             }
//           ]
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to add WhatsApp number');
//       }

//       await fetchCompany();
//       setShowAddWhatsAppModal(false);
//       setNewWhatsAppNumber('');
//       setNewWhatsAppDesc('');
//       setNewWhatsAppPrimary(false);
//       setSuccessMessage('WhatsApp number added successfully');
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleRemoveWhatsAppNumber = async (number) => {
//     if (!confirm('Are you sure you want to remove this WhatsApp number?')) return;

//     setSaveLoading(true);
    
//     try {
//       const response = await fetch(`/api/companies/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           additionalWhatsAppNumbers: (company.additionalWhatsAppNumbers || []).filter(
//             n => n.number !== number
//           )
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to remove WhatsApp number');
//       }

//       await fetchCompany();
//       setSuccessMessage('WhatsApp number removed successfully');
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleUserAction = async (userId, action) => {
//     console.log('User action:', userId, action);
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

//   const getWhatsAppStatusBadge = (status) => {
//     const badges = {
//       connected: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Wifi, label: 'Connected' },
//       disconnected: { bg: 'bg-gray-100', text: 'text-gray-600', icon: WifiOff, label: 'Disconnected' },
//       pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Pending' },
//       error: { bg: 'bg-rose-50', text: 'text-rose-700', icon: AlertCircle, label: 'Error' },
//     };
//     const badge = badges[status] || badges.disconnected;
//     const Icon = badge.icon;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {badge.label}
//       </span>
//     );
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

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   const formatDistanceToNow = (date) => {
//     if (!date) return 'Never';
//     const now = new Date();
//     const diffMs = now - new Date(date);
//     const diffSec = Math.floor(diffMs / 1000);
//     const diffMin = Math.floor(diffSec / 60);
//     const diffHour = Math.floor(diffMin / 60);
//     const diffDay = Math.floor(diffHour / 24);

//     if (diffDay > 0) {
//       return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
//     } else if (diffHour > 0) {
//       return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
//     } else if (diffMin > 0) {
//       return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
//     } else {
//       return 'just now';
//     }
//   };

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Building2 },
//     { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
//     { id: 'users', label: 'Users', icon: Users },
//     { id: 'subscription', label: 'Subscription', icon: CreditCard },
//     { id: 'settings', label: 'Settings', icon: Settings },
//   ];

//   if (status === 'loading' || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50/20">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
//           <p className="mt-4 text-gray-600 font-medium">Loading company details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !company) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50/20 p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
//           <AlertCircle className="w-16 h-16 text-rose-600 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
//           <p className="text-gray-600 mb-6">{error || 'Company not found'}</p>
//           <button
//             onClick={() => router.push('/super-admin/companies')}
//             className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
//           >
//             Back to Companies
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
//       {/* Modern Header */}
//       <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => router.push('/super-admin/companies')}
//                 className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 text-gray-600" />
//               </button>
//               <div>
//                 <div className="flex items-center gap-3 flex-wrap">
//                   <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                     {company.companyName}
//                   </h1>
//                   {getStatusBadge(company.status)}
//                   {getPlanBadge(company.subscription?.plan)}
//                   {company.slug && (
//                     <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
//                       <Tag className="w-3 h-3 mr-1" />
//                       {company.slug}
//                     </span>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
//                   <span>Created {formatDate(company.createdAt)}</span>
//                   {company.whatsapp?.isConnected && (
//                     <span className="inline-flex items-center text-emerald-600">
//                       <Wifi className="w-3 h-3 mr-1" />
//                       WhatsApp Connected
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               {!isEditing && activeTab === 'overview' && (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
//                 >
//                   <Edit className="w-4 h-4" />
//                   Edit
//                 </button>
//               )}
//               <button
//                 onClick={() => setShowDeleteConfirm(true)}
//                 className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
//               >
//                 <Trash2 className="w-4 h-4" />
//                 Delete
//               </button>
//             </div>
//           </div>

//           {/* Success Message */}
//           {successMessage && (
//             <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center animate-in slide-in-from-top-2">
//               <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
//               <p className="text-sm text-emerald-700">{successMessage}</p>
//             </div>
//           )}

//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center">
//               <AlertCircle className="w-5 h-5 text-rose-600 mr-2 flex-shrink-0" />
//               <p className="text-sm text-rose-700">{error}</p>
//             </div>
//           )}
//         </div>

//         {/* Modern Tabs - Responsive */}
//         <div className="border-t border-gray-200/60">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             {/* Desktop Tabs */}
//             <nav className="hidden md:flex space-x-8" aria-label="Tabs">
//               {tabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => {
//                       setActiveTab(tab.id);
//                       setIsEditing(false);
//                       setMobileMenuOpen(false);
//                     }}
//                     className={`
//                       py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-all
//                       ${activeTab === tab.id
//                         ? 'border-indigo-600 text-indigo-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                       }
//                     `}
//                   >
//                     <Icon className="w-5 h-5 mr-2" />
//                     {tab.label}
//                   </button>
//                 );
//               })}
//             </nav>

//             {/* Mobile Tabs - Dropdown */}
//             <div className="md:hidden py-2">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200"
//               >
//                 <div className="flex items-center gap-2">
//                   {tabs.find(t => t.id === activeTab)?.icon && 
//                     (() => {
//                       const Icon = tabs.find(t => t.id === activeTab).icon;
//                       return <Icon className="w-5 h-5 text-indigo-600" />;
//                     })()}
//                   <span className="font-medium text-gray-900">
//                     {tabs.find(t => t.id === activeTab)?.label}
//                   </span>
//                 </div>
//                 {mobileMenuOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//               </button>
              
//               {mobileMenuOpen && (
//                 <div className="absolute left-0 right-0 mt-2 mx-4 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
//                   {tabs.map((tab) => {
//                     const Icon = tab.icon;
//                     return (
//                       <button
//                         key={tab.id}
//                         onClick={() => {
//                           setActiveTab(tab.id);
//                           setIsEditing(false);
//                           setMobileMenuOpen(false);
//                         }}
//                         className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
//                           activeTab === tab.id
//                             ? 'bg-indigo-50 text-indigo-600'
//                             : 'text-gray-700 hover:bg-gray-50'
//                         } ${tab.id === tabs[tabs.length - 1].id ? '' : 'border-b border-gray-100'}`}
//                       >
//                         <Icon className="w-5 h-5" />
//                         <span className="font-medium">{tab.label}</span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
//         {/* Tab: Overview */}
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             {/* Modern Stats Cards */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm font-medium text-gray-500">Total Users</p>
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Users className="w-4 h-4 text-blue-600" />
//                   </div>
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
//                 <p className="text-xs text-gray-500 mt-1">Limit: {stats.usage?.users?.limit || 0}</p>
//                 <div className="mt-2">
//                   <div className="flex justify-between text-xs text-gray-600 mb-1">
//                     <span>Usage</span>
//                     <span>{stats.usage?.users?.percentage || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-1.5">
//                     <div
//                       className={`h-1.5 rounded-full transition-all ${
//                         (stats.usage?.users?.percentage || 0) > 90
//                           ? 'bg-red-500'
//                           : (stats.usage?.users?.percentage || 0) > 70
//                           ? 'bg-amber-500'
//                           : 'bg-emerald-500'
//                       }`}
//                       style={{ width: `${Math.min(stats.usage?.users?.percentage || 0, 100)}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm font-medium text-gray-500">Total Products</p>
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <Package className="w-4 h-4 text-purple-600" />
//                   </div>
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
//                 <p className="text-xs text-gray-500 mt-1">Limit: {stats.usage?.products?.limit || 0}</p>
//                 <div className="mt-2">
//                   <div className="flex justify-between text-xs text-gray-600 mb-1">
//                     <span>Usage</span>
//                     <span>{stats.usage?.products?.percentage || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-1.5">
//                     <div
//                       className={`h-1.5 rounded-full transition-all ${
//                         (stats.usage?.products?.percentage || 0) > 90
//                           ? 'bg-red-500'
//                           : (stats.usage?.products?.percentage || 0) > 70
//                           ? 'bg-amber-500'
//                           : 'bg-emerald-500'
//                       }`}
//                       style={{ width: `${Math.min(stats.usage?.products?.percentage || 0, 100)}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm font-medium text-gray-500">Total Orders</p>
//                   <div className="p-2 bg-emerald-100 rounded-lg">
//                     <ShoppingCart className="w-4 h-4 text-emerald-600" />
//                   </div>
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
//                 <p className="text-xs text-gray-500 mt-1">Limit: {stats.usage?.orders?.limit || 0}</p>
//                 <div className="mt-2">
//                   <div className="flex justify-between text-xs text-gray-600 mb-1">
//                     <span>Usage</span>
//                     <span>{stats.usage?.orders?.percentage || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-1.5">
//                     <div
//                       className={`h-1.5 rounded-full transition-all ${
//                         (stats.usage?.orders?.percentage || 0) > 90
//                           ? 'bg-red-500'
//                           : (stats.usage?.orders?.percentage || 0) > 70
//                           ? 'bg-amber-500'
//                           : 'bg-emerald-500'
//                       }`}
//                       style={{ width: `${Math.min(stats.usage?.orders?.percentage || 0, 100)}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm font-medium text-gray-500">Total Bookings</p>
//                   <div className="p-2 bg-amber-100 rounded-lg">
//                     <Calendar className="w-4 h-4 text-amber-600" />
//                   </div>
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
//                 <p className="text-xs text-gray-500 mt-1">Limit: {stats.usage?.bookings?.limit || 0}</p>
//                 <div className="mt-2">
//                   <div className="flex justify-between text-xs text-gray-600 mb-1">
//                     <span>Usage</span>
//                     <span>{stats.usage?.bookings?.percentage || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-1.5">
//                     <div
//                       className={`h-1.5 rounded-full transition-all ${
//                         (stats.usage?.bookings?.percentage || 0) > 90
//                           ? 'bg-red-500'
//                           : (stats.usage?.bookings?.percentage || 0) > 70
//                           ? 'bg-amber-500'
//                           : 'bg-emerald-500'
//                       }`}
//                       style={{ width: `${Math.min(stats.usage?.bookings?.percentage || 0, 100)}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* WhatsApp Stats Card */}
//             {company.whatsapp?.phoneNumber && (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Smartphone className="w-5 h-5 mr-2 text-indigo-600" />
//                   WhatsApp Statistics
//                 </h2>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-500">Total Messages</p>
//                     <p className="text-xl font-bold text-gray-900">{stats.whatsapp?.totalMessages || 0}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">Conversations</p>
//                     <p className="text-xl font-bold text-gray-900">{stats.whatsapp?.totalConversations || 0}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">Customers</p>
//                     <p className="text-xl font-bold text-gray-900">{stats.whatsapp?.totalCustomers || 0}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">Messages Today</p>
//                     <p className="text-xl font-bold text-gray-900">{stats.whatsapp?.messagesToday || 0}</p>
//                   </div>
//                 </div>
//                 {stats.whatsapp?.lastMessageAt && (
//                   <p className="text-xs text-gray-500 mt-3">
//                     Last message: {formatDistanceToNow(stats.whatsapp.lastMessageAt)}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Company Details with Catalog Fields */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-5 md:p-6">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
//                   Company Information
//                 </h2>

//                 {isEditing ? (
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                           Company Name
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.companyName}
//                           onChange={handleCompanyNameChange}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                           Company Email
//                         </label>
//                         <input
//                           type="email"
//                           value={formData.companyEmail}
//                           onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                           Company Phone
//                         </label>
//                         <input
//                           type="tel"
//                           value={formData.companyPhone}
//                           onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                           Catalog Slug
//                         </label>
//                         <div className="relative">
//                           <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                           <input
//                             type="text"
//                             value={formData.slug}
//                             onChange={handleSlugChange}
//                             className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                             placeholder="company-slug"
//                           />
//                         </div>
//                         <p className="mt-1 text-xs text-gray-500 break-all">
//                           URL: {window.location.origin}/catalogue/products?company={formData.slug || 'your-slug'}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                           Catalog WhatsApp (Optional)
//                         </label>
//                         <div className="relative">
//                           <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                           <input
//                             type="tel"
//                             value={formData.catalogWhatsapp}
//                             onChange={(e) => setFormData({ ...formData, catalogWhatsapp: e.target.value })}
//                             className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                             placeholder="9876543210"
//                           />
//                         </div>
//                         <p className="mt-1 text-xs text-gray-500">
//                           Separate WhatsApp for customer orders
//                         </p>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                         Street Address
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.address.street}
//                         onChange={(e) => setFormData({
//                           ...formData,
//                           address: { ...formData.address, street: e.target.value }
//                         })}
//                         className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
//                         <input
//                           type="text"
//                           value={formData.address.city}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             address: { ...formData.address, city: e.target.value }
//                           })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
//                         <input
//                           type="text"
//                           value={formData.address.state}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             address: { ...formData.address, state: e.target.value }
//                           })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
//                         <input
//                           type="text"
//                           value={formData.address.pincode}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             address: { ...formData.address, pincode: e.target.value }
//                           })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
//                         <input
//                           type="text"
//                           value={formData.address.country}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             address: { ...formData.address, country: e.target.value }
//                           })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">GSTIN (Optional)</label>
//                         <input
//                           type="text"
//                           value={formData.gstin}
//                           onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1.5">PAN (Optional)</label>
//                         <input
//                           type="text"
//                           value={formData.pan}
//                           onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
//                           className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                     </div>

//                     <div className="flex justify-end gap-3 pt-4">
//                       <button
//                         onClick={() => setIsEditing(false)}
//                         className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         onClick={handleSave}
//                         disabled={saveLoading}
//                         className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
//                       >
//                         {saveLoading ? (
//                           <>
//                             <Loader2 className="w-4 h-4 animate-spin" />
//                             Saving...
//                           </>
//                         ) : (
//                           <>
//                             <Save className="w-4 h-4" />
//                             Save Changes
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-4">
//                       <div>
//                         <p className="text-sm text-gray-500 mb-1">Company Name</p>
//                         <p className="text-base font-medium text-gray-900">{company.companyName}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500 mb-1">Email</p>
//                         <p className="text-base font-medium text-gray-900 flex items-center break-all">
//                           <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
//                           {company.companyEmail}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500 mb-1">Phone</p>
//                         <p className="text-base font-medium text-gray-900 flex items-center">
//                           <Phone className="w-4 h-4 mr-2 text-gray-400" />
//                           {company.companyPhone}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500 mb-1">Catalog Slug</p>
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded break-all">
//                             {company.slug || 'Not set'}
//                           </code>
//                           {company.slug && (
//                             <button
//                               onClick={copyCatalogLink}
//                               className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
//                               title="Copy catalog link"
//                             >
//                               {copied ? (
//                                 <CheckIcon className="w-4 h-4 text-emerald-500" />
//                               ) : (
//                                 <CopyIcon className="w-4 h-4" />
//                               )}
//                             </button>
//                           )}
//                         </div>
//                         {company.slug && (
//                           <p className="text-xs text-blue-600 mt-1 break-all">
//                             <LinkIcon className="w-3 h-3 inline mr-1" />
//                             {window.location.origin}/catalogue/products?company={company.slug}
//                           </p>
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500 mb-1">Catalog WhatsApp</p>
//                         <p className="text-base font-medium text-gray-900 flex items-center">
//                           <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
//                           {company.catalogWhatsapp || 'Not set (uses primary WhatsApp)'}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <div>
//                         <p className="text-sm text-gray-500 mb-1">Address</p>
//                         <p className="text-base font-medium text-gray-900 flex items-start">
//                           <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
//                           <span className="break-words">
//                             {company.address?.street && `${company.address.street}, `}
//                             {company.address?.city && `${company.address.city}, `}
//                             {company.address?.state && `${company.address.state} `}
//                             {company.address?.pincode && `- ${company.address.pincode}`}
//                             {company.address?.country && `\n${company.address.country}`}
//                             {!company.address?.street && !company.address?.city && !company.address?.state && 'No address provided'}
//                           </span>
//                         </p>
//                       </div>
//                       {company.gstin && (
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">GSTIN</p>
//                           <p className="text-base font-medium text-gray-900">{company.gstin}</p>
//                         </div>
//                       )}
//                       {company.pan && (
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">PAN</p>
//                           <p className="text-base font-medium text-gray-900">{company.pan}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Recent Activity */}
//             {(company.recentActivity?.users?.length > 0 || company.recentActivity?.orders?.length > 0) && (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                 <div className="p-5 md:p-6">
//                   <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                     <Activity className="w-5 h-5 mr-2 text-indigo-600" />
//                     Recent Activity
//                   </h2>

//                   <div className="space-y-3">
//                     {company.recentActivity?.users?.slice(0, 3).map((user) => (
//                       <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <UserCircle className="w-8 h-8 text-gray-400 flex-shrink-0" />
//                           <div className="min-w-0">
//                             <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
//                             <p className="text-xs text-gray-500 truncate">{user.email}</p>
//                           </div>
//                         </div>
//                         <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
//                           {user.lastSeen ? formatDistanceToNow(user.lastSeen) : 'Never'}
//                         </p>
//                       </div>
//                     ))}

//                     {company.recentActivity?.orders?.slice(0, 3).map((order) => (
//                       <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <ShoppingCart className="w-8 h-8 text-gray-400 flex-shrink-0" />
//                           <div className="min-w-0">
//                             <p className="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
//                             <p className="text-xs text-gray-500 truncate">{order.customerName}</p>
//                           </div>
//                         </div>
//                         <div className="text-right ml-2 flex-shrink-0">
//                           <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalPrice)}</p>
//                           <p className="text-xs text-gray-500">
//                             {formatDistanceToNow(order.createdAt)}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Tab: WhatsApp - Modern Responsive */}
//         {activeTab === 'whatsapp' && (
//           <div className="space-y-6">
//             {/* WhatsApp Connection Status */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-5 md:p-6">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Smartphone className="w-5 h-5 mr-2 text-indigo-600" />
//                   WhatsApp Integration
//                 </h2>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <div className="space-y-4">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl">
//                       <div className="flex items-center">
//                         <div className={`w-3 h-3 rounded-full mr-3 ${company.whatsapp?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
//                         <div>
//                           <p className="text-sm font-medium text-gray-900">Connection Status</p>
//                           <p className="text-xs text-gray-500">
//                             {company.whatsapp?.isConnected ? 'Connected and active' : 'Not connected'}
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => handleWhatsAppAction(company.whatsapp?.isConnected ? 'disconnect' : 'connect')}
//                         disabled={saveLoading}
//                         className={`px-4 py-2 text-white text-sm rounded-xl transition-all ${
//                           company.whatsapp?.isConnected 
//                             ? 'bg-rose-600 hover:bg-rose-700' 
//                             : 'bg-emerald-600 hover:bg-emerald-700'
//                         } disabled:opacity-50`}
//                       >
//                         {company.whatsapp?.isConnected ? 'Disconnect' : 'Connect'}
//                       </button>
//                     </div>

//                     {company.whatsapp?.clientId && (
//                       <div className="p-4 bg-gray-50 rounded-xl">
//                         <p className="text-sm font-medium text-gray-900 mb-1">Client ID</p>
//                         <p className="text-xs text-gray-600 font-mono break-all">{company.whatsapp.clientId}</p>
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-4">
//                     {company.whatsapp?.connectedAt && (
//                       <div className="p-4 bg-gray-50 rounded-xl">
//                         <p className="text-sm font-medium text-gray-900 mb-1">Connected Since</p>
//                         <p className="text-sm text-gray-600">{formatDate(company.whatsapp.connectedAt)}</p>
//                       </div>
//                     )}

//                     {company.whatsapp?.lastError && (
//                       <div className="p-4 bg-rose-50 rounded-xl">
//                         <p className="text-sm font-medium text-rose-900 mb-1 flex items-center">
//                           <AlertCircle className="w-4 h-4 mr-1" />
//                           Last Error
//                         </p>
//                         <p className="text-xs text-rose-600">{company.whatsapp.lastError}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* WhatsApp Numbers */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-5 md:p-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
//                   <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
//                     <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
//                     WhatsApp Numbers
//                   </h2>
//                   <button
//                     onClick={() => setShowAddWhatsAppModal(true)}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm transition-colors self-start sm:self-auto"
//                   >
//                     <Plus className="w-4 h-4" />
//                     Add Number
//                   </button>
//                 </div>

//                 <div className="space-y-3">
//                   {whatsappNumbers.map((num, index) => (
//                     <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl">
//                       <div className="flex items-start gap-3">
//                         <Smartphone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <div className="flex flex-wrap items-center gap-2">
//                             <p className="text-sm font-medium text-gray-900">{num.number}</p>
//                             {num.type === 'primary' && (
//                               <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
//                                 Primary
//                               </span>
//                             )}
//                             {num.isConnected ? (
//                               <span className="inline-flex items-center px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
//                                 <Wifi className="w-3 h-3 mr-1" />
//                                 Connected
//                               </span>
//                             ) : (
//                               <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
//                                 <WifiOff className="w-3 h-3 mr-1" />
//                                 Disconnected
//                               </span>
//                             )}
//                           </div>
//                           {num.description && (
//                             <p className="text-xs text-gray-500 mt-1">{num.description}</p>
//                           )}
//                         </div>
//                       </div>
//                       {num.type !== 'primary' && (
//                         <button
//                           onClick={() => handleRemoveWhatsAppNumber(num.number)}
//                           className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-sm transition-colors self-start sm:self-auto"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>
//                   ))}

//                   {whatsappNumbers.length === 0 && (
//                     <div className="text-center py-8">
//                       <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <p className="text-sm text-gray-500">No WhatsApp numbers configured</p>
//                       <button
//                         onClick={() => setShowAddWhatsAppModal(true)}
//                         className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
//                       >
//                         Add your first WhatsApp number
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {company.catalogWhatsapp && (
//                   <div className="mt-4 p-4 bg-blue-50 rounded-xl">
//                     <div className="flex items-start gap-2">
//                       <Smartphone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="text-sm font-medium text-blue-800">Catalog WhatsApp</p>
//                         <p className="text-sm text-blue-700">{company.catalogWhatsapp}</p>
//                         <p className="text-xs text-blue-600 mt-1">
//                           This number is used for customer orders from the catalog page.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* WhatsApp Stats */}
//             {stats.whatsapp && (stats.whatsapp.totalMessages > 0 || stats.whatsapp.totalConversations > 0) && (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                 <div className="p-5 md:p-6">
//                   <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                     <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
//                     WhatsApp Statistics
//                   </h2>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="p-3 bg-gray-50 rounded-xl text-center">
//                       <p className="text-xs text-gray-500">Total Messages</p>
//                       <p className="text-xl font-bold text-gray-900">{stats.whatsapp.totalMessages || 0}</p>
//                     </div>
//                     <div className="p-3 bg-gray-50 rounded-xl text-center">
//                       <p className="text-xs text-gray-500">Conversations</p>
//                       <p className="text-xl font-bold text-gray-900">{stats.whatsapp.totalConversations || 0}</p>
//                     </div>
//                     <div className="p-3 bg-gray-50 rounded-xl text-center">
//                       <p className="text-xs text-gray-500">Customers</p>
//                       <p className="text-xl font-bold text-gray-900">{stats.whatsapp.totalCustomers || 0}</p>
//                     </div>
//                     <div className="p-3 bg-gray-50 rounded-xl text-center">
//                       <p className="text-xs text-gray-500">Messages Today</p>
//                       <p className="text-xl font-bold text-gray-900">{stats.whatsapp.messagesToday || 0}</p>
//                     </div>
//                   </div>

//                   {stats.whatsapp.lastMessageAt && (
//                     <p className="text-xs text-gray-500 mt-4 text-center">
//                       Last message: {formatDistanceToNow(stats.whatsapp.lastMessageAt)}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Tab: Users - Modern Responsive */}
//         {activeTab === 'users' && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="p-5 md:p-6">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
//                   <Users className="w-5 h-5 mr-2 text-indigo-600" />
//                   Users Management
//                 </h2>
//                 <button
//                   onClick={() => {/* Add user modal */}}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm transition-colors self-start sm:self-auto"
//                 >
//                   <UserPlus className="w-4 h-4" />
//                   Add User
//                 </button>
//               </div>

//               {/* Filters */}
//               <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search users..."
//                     value={userSearch}
//                     onChange={(e) => {
//                       setUserSearch(e.target.value);
//                       setUserPage(1);
//                     }}
//                     className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
//                   />
//                 </div>

//                 <select
//                   value={userRoleFilter}
//                   onChange={(e) => {
//                     setUserRoleFilter(e.target.value);
//                     setUserPage(1);
//                   }}
//                   className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
//                 >
//                   <option value="all">All Roles</option>
//                   <option value="admin">Admin</option>
//                   <option value="manager">Manager</option>
//                   <option value="user">User</option>
//                 </select>

//                 <select
//                   value={userStatusFilter}
//                   onChange={(e) => {
//                     setUserStatusFilter(e.target.value);
//                     setUserPage(1);
//                   }}
//                   className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                   <option value="suspended">Suspended</option>
//                 </select>

//                 <button
//                   onClick={fetchUsers}
//                   className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm transition-colors"
//                 >
//                   <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
//                   Refresh
//                 </button>
//               </div>

//               {/* Users Cards for Mobile / Table for Desktop */}
//               <div className="block md:hidden space-y-3">
//                 {usersLoading ? (
//                   <div className="text-center py-8">
//                     <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
//                     <p className="mt-2 text-sm text-gray-500">Loading users...</p>
//                   </div>
//                 ) : users.length === 0 ? (
//                   <div className="text-center py-8">
//                     <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                     <p className="text-sm text-gray-500">No users found</p>
//                   </div>
//                 ) : (
//                   users.map((user) => (
//                     <div key={user.id} className="p-4 bg-gray-50 rounded-xl">
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
//                             <UserCircle className="w-6 h-6 text-gray-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-900">{user.fullName}</p>
//                             <p className="text-xs text-gray-500">{user.email}</p>
//                             <div className="flex flex-wrap gap-2 mt-1">
//                               <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
//                                 {user.role}
//                               </span>
//                               {getStatusBadge(user.status)}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex gap-1">
//                           <button
//                             onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
//                             className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
//                             title={user.status === 'active' ? 'Suspend' : 'Activate'}
//                           >
//                             {user.status === 'active' ? (
//                               <Lock className="w-4 h-4 text-amber-600" />
//                             ) : (
//                               <Unlock className="w-4 h-4 text-emerald-600" />
//                             )}
//                           </button>
//                           <button
//                             onClick={() => handleUserAction(user.id, 'delete')}
//                             className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-4 h-4 text-rose-600" />
//                           </button>
//                         </div>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-2">
//                         Last active: {user.lastSeen ? formatDistanceToNow(user.lastSeen) : 'Never'}
//                       </p>
//                     </div>
//                   ))
//                 )}
//               </div>

//               {/* Desktop Table */}
//               <div className="hidden md:block overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
//                       <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {usersLoading ? (
//                       <tr>
//                         <td colSpan="5" className="px-6 py-8 text-center">
//                           <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
//                           <p className="mt-2 text-sm text-gray-500">Loading users...</p>
//                         </td>
//                       </tr>
//                     ) : users.length === 0 ? (
//                       <tr>
//                         <td colSpan="5" className="px-6 py-8 text-center">
//                           <Users className="w-12 h-12 text-gray-400 mx-auto" />
//                           <p className="mt-2 text-sm text-gray-500">No users found</p>
//                         </td>
//                       </tr>
//                     ) : (
//                       users.map((user) => (
//                         <tr key={user.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
//                                 <UserCircle className="w-6 h-6 text-gray-600" />
//                               </div>
//                               <div className="ml-4">
//                                 <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
//                                 <div className="text-sm text-gray-500">{user.email}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
//                               {user.role}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {getStatusBadge(user.status)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.lastSeen ? formatDistanceToNow(user.lastSeen) : 'Never'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                             <button
//                               onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
//                               className="mr-2 p-1 rounded hover:bg-gray-100 transition-colors"
//                               title={user.status === 'active' ? 'Suspend' : 'Activate'}
//                             >
//                               {user.status === 'active' ? (
//                                 <Lock className="w-4 h-4 text-amber-600" />
//                               ) : (
//                                 <Unlock className="w-4 h-4 text-emerald-600" />
//                               )}
//                             </button>
//                             <button
//                               onClick={() => handleUserAction(user.id, 'delete')}
//                               className="p-1 rounded hover:bg-gray-100 transition-colors"
//                               title="Delete"
//                             >
//                               <Trash2 className="w-4 h-4 text-rose-600" />
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {userTotal > 0 && (
//                 <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
//                   <p className="text-sm text-gray-500 text-center sm:text-left">
//                     Showing <span className="font-medium">{(userPage - 1) * 10 + 1}</span> to{' '}
//                     <span className="font-medium">{Math.min(userPage * 10, userTotal)}</span> of{' '}
//                     <span className="font-medium">{userTotal}</span> users
//                   </p>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setUserPage(p => Math.max(1, p - 1))}
//                       disabled={userPage === 1}
//                       className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
//                     >
//                       <ChevronLeft className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => setUserPage(p => p + 1)}
//                       disabled={userPage * 10 >= userTotal}
//                       className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
//                     >
//                       <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Tab: Subscription - Modern Responsive */}
//         {activeTab === 'subscription' && (
//           <div className="space-y-6">
//             {/* Current Plan */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-5 md:p-6">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
//                   Current Subscription
//                 </h2>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-sm text-gray-500">Plan</p>
//                       <div className="mt-1">{getPlanBadge(company.subscription?.plan)}</div>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Status</p>
//                       <div className="mt-1">{getStatusBadge(company.subscription?.status)}</div>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Started</p>
//                       <p className="text-base font-medium text-gray-900">{formatDate(company.subscription?.startDate)}</p>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-sm text-gray-500">Expiry Date</p>
//                       <p className="text-base font-medium text-gray-900">
//                         {company.subscription?.expiryDate
//                           ? formatDate(company.subscription.expiryDate)
//                           : 'Never'}
//                       </p>
//                       {company.subscription?.expiryDate && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           {company.daysUntilExpiry} days remaining
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Auto Renew</p>
//                       <p className="text-base font-medium text-gray-900">
//                         {company.subscription?.autoRenew ? 'Yes' : 'No'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Payment Method</p>
//                       <p className="text-base font-medium text-gray-900 capitalize">
//                         {company.subscription?.paymentMethod || 'Monthly'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Plan Features */}
//             {company.features && Object.keys(company.features).length > 0 && (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                 <div className="p-5 md:p-6">
//                   <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                     <Award className="w-5 h-5 mr-2 text-indigo-600" />
//                     Plan Features
//                   </h2>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                     {Object.entries(company.features).map(([key, value]) => (
//                       <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                         <span className="text-sm text-gray-700 capitalize">
//                           {key.replace(/([A-Z])/g, ' $1').trim()}
//                         </span>
//                         {value ? (
//                           <CheckCircle2 className="w-5 h-5 text-emerald-600" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-gray-400" />
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Usage Limits */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-5 md:p-6">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
//                   Usage Limits
//                 </h2>

//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
//                       <span className="text-gray-600">Users</span>
//                       <span className="font-medium">{stats.totalUsers} / {company.limits?.maxUsers || 0}</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-blue-500 h-2 rounded-full transition-all"
//                         style={{ width: `${Math.min((stats.totalUsers / (company.limits?.maxUsers || 1)) * 100, 100)}%` }}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
//                       <span className="text-gray-600">Products</span>
//                       <span className="font-medium">{stats.totalProducts} / {company.limits?.maxProducts || 0}</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-purple-500 h-2 rounded-full transition-all"
//                         style={{ width: `${Math.min((stats.totalProducts / (company.limits?.maxProducts || 1)) * 100, 100)}%` }}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
//                       <span className="text-gray-600">Orders (Monthly)</span>
//                       <span className="font-medium">{stats.totalOrders} / {company.limits?.maxOrdersPerMonth || 0}</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-emerald-500 h-2 rounded-full transition-all"
//                         style={{ width: `${Math.min((stats.totalOrders / (company.limits?.maxOrdersPerMonth || 1)) * 100, 100)}%` }}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
//                       <span className="text-gray-600">Bookings (Monthly)</span>
//                       <span className="font-medium">{stats.totalBookings} / {company.limits?.maxBookingsPerMonth || 0}</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-amber-500 h-2 rounded-full transition-all"
//                         style={{ width: `${Math.min((stats.totalBookings / (company.limits?.maxBookingsPerMonth || 1)) * 100, 100)}%` }}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tab: Settings - Modern Responsive */}
//         {activeTab === 'settings' && (
//           <div className="space-y-6">
//             {/* Company Settings */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-5 md:p-6">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Settings className="w-5 h-5 mr-2 text-indigo-600" />
//                   Company Settings
//                 </h2>

//                 <div className="space-y-3">
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-start gap-3">
//                       <Globe className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">Website</p>
//                         <p className="text-xs text-gray-500 break-all">{company.website || 'Not set'}</p>
//                       </div>
//                     </div>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-800 self-start sm:self-auto">
//                       Edit
//                     </button>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-start gap-3">
//                       <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">Support Email</p>
//                         <p className="text-xs text-gray-500 break-all">{company.support?.email || 'Not set'}</p>
//                       </div>
//                     </div>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-800 self-start sm:self-auto">
//                       Edit
//                     </button>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-start gap-3">
//                       <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">Support Phone</p>
//                         <p className="text-xs text-gray-500">{company.support?.phone || 'Not set'}</p>
//                       </div>
//                     </div>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-800 self-start sm:self-auto">
//                       Edit
//                     </button>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-start gap-3">
//                       <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">Business Hours</p>
//                         <p className="text-xs text-gray-500">{company.businessHours || 'Not set'}</p>
//                       </div>
//                     </div>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-800 self-start sm:self-auto">
//                       Edit
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Danger Zone */}
//             <div className="bg-white rounded-xl shadow-sm border border-rose-200 overflow-hidden">
//               <div className="p-5 md:p-6">
//                 <h2 className="text-base md:text-lg font-semibold text-rose-600 mb-4 flex items-center">
//                   <AlertTriangle className="w-5 h-5 mr-2" />
//                   Danger Zone
//                 </h2>

//                 <div className="space-y-3">
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-rose-50 rounded-xl">
//                     <div>
//                       <p className="text-sm font-medium text-rose-900">Suspend Company</p>
//                       <p className="text-xs text-rose-700">Temporarily disable access for all users in this company</p>
//                     </div>
//                     <button
//                       onClick={() => handleUserAction(company.id, 'suspend')}
//                       className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm transition-colors self-start sm:self-auto"
//                     >
//                       Suspend
//                     </button>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-rose-50 rounded-xl">
//                     <div>
//                       <p className="text-sm font-medium text-rose-900">Delete Company</p>
//                       <p className="text-xs text-rose-700">Permanently delete this company and all associated data</p>
//                     </div>
//                     <button
//                       onClick={() => setShowDeleteConfirm(true)}
//                       className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-sm transition-colors self-start sm:self-auto"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
//             <div className="p-6">
//               <div className="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mx-auto mb-4">
//                 <AlertTriangle className="w-6 h-6 text-rose-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
//                 Delete Company
//               </h3>
//               <p className="text-sm text-gray-500 text-center mb-6">
//                 Are you sure you want to delete <span className="font-medium text-gray-900">{company.companyName}</span>? This action cannot be undone and all data will be permanently removed.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={() => setShowDeleteConfirm(false)}
//                   className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   disabled={saveLoading}
//                   className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
//                 >
//                   {saveLoading ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     'Delete'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add WhatsApp Number Modal */}
//       {showAddWhatsAppModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
//             <div className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Add WhatsApp Number</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     WhatsApp Number <span className="text-rose-500">*</span>
//                   </label>
//                   <input
//                     type="tel"
//                     value={newWhatsAppNumber}
//                     onChange={(e) => setNewWhatsAppNumber(e.target.value)}
//                     placeholder="919876543210 (with country code)"
//                     className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                   />
//                   <p className="mt-1 text-xs text-gray-500">
//                     Include country code (e.g., 91 for India)
//                   </p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Description (Optional)
//                   </label>
//                   <input
//                     type="text"
//                     value={newWhatsAppDesc}
//                     onChange={(e) => setNewWhatsAppDesc(e.target.value)}
//                     placeholder="e.g., Customer Support, Orders, etc."
//                     className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="makePrimary"
//                     checked={newWhatsAppPrimary}
//                     onChange={(e) => setNewWhatsAppPrimary(e.target.checked)}
//                     className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                   />
//                   <label htmlFor="makePrimary" className="ml-2 text-sm text-gray-700">
//                     Make this the primary WhatsApp number
//                   </label>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-3 mt-6">
//                 <button
//                   onClick={() => setShowAddWhatsAppModal(false)}
//                   className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddWhatsAppNumber}
//                   disabled={saveLoading || !newWhatsAppNumber.trim()}
//                   className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
//                 >
//                   {saveLoading ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     'Add Number'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



























// app/super-admin/companies/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { appTheme } from '../../../../src/constants/theme';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Power,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe,
  Tag,
  Briefcase,
  Copy,
  TrendingUp,
  TrendingDown,
  UserCircle,
  Settings,
  Shield,
  Activity,
  PieChart,
  BarChart3,
  RefreshCw,
  MoreVertical,
  Save,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Wallet,
  CalendarDays,
  Zap,
  Award,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  Smartphone,
  Wifi,
  WifiOff,
  MessageSquare,
  Link as LinkIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Menu,
  X
} from 'lucide-react';

export default function CompanyDetailsPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = params;

  // State
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  const [showAddWhatsAppModal, setShowAddWhatsAppModal] = useState(false);
  const [newWhatsAppNumber, setNewWhatsAppNumber] = useState('');
  const [newWhatsAppDesc, setNewWhatsAppDesc] = useState('');
  const [newWhatsAppPrimary, setNewWhatsAppPrimary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    slug: '',
    catalogWhatsapp: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    gstin: '',
    pan: '',
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    usage: {
      users: { current: 0, limit: 0, percentage: 0 },
      products: { current: 0, limit: 0, percentage: 0 },
      orders: { current: 0, limit: 0, percentage: 0 },
      bookings: { current: 0, limit: 0, percentage: 0 },
    },
    whatsapp: {
      totalMessages: 0,
      totalConversations: 0,
      totalCustomers: 0,
      messagesToday: 0,
      lastMessageAt: null,
      lastResetAt: null
    }
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

  // Fetch company data
  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  // Fetch users when tab changes to users
  useEffect(() => {
    if (activeTab === 'users' && id) {
      fetchUsers();
    }
  }, [activeTab, id, userPage, userSearch, userRoleFilter, userStatusFilter]);

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/companies/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch company');
      }

      setCompany(data.data.company);
      setStats(data.data.stats || {});
      
      // Extract WhatsApp numbers
      const numbers = [];
      if (data.data.company.whatsapp?.phoneNumber) {
        numbers.push({
          number: data.data.company.whatsapp.phoneNumber,
          type: 'primary',
          isConnected: data.data.company.whatsapp.isConnected || false,
          status: data.data.company.whatsapp.connectionStatus || 'disconnected'
        });
      }
      if (data.data.company.whatsappNumbers) {
        numbers.push(...data.data.company.whatsappNumbers);
      }
      setWhatsappNumbers(numbers);
      
      // Initialize form data
      setFormData({
        companyName: data.data.company.companyName || '',
        companyEmail: data.data.company.companyEmail || '',
        companyPhone: data.data.company.companyPhone || '',
        slug: data.data.company.slug || '',
        catalogWhatsapp: data.data.company.catalogWhatsapp || '',
        address: {
          street: data.data.company.address?.street || '',
          city: data.data.company.address?.city || '',
          state: data.data.company.address?.state || '',
          pincode: data.data.company.address?.pincode || '',
          country: data.data.company.address?.country || 'India',
        },
        gstin: data.data.company.gstin || '',
        pan: data.data.company.pan || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: userPage.toString(),
        limit: '10',
        ...(userSearch && { search: userSearch }),
        ...(userRoleFilter !== 'all' && { role: userRoleFilter }),
        ...(userStatusFilter !== 'all' && { status: userStatusFilter }),
      });

      const response = await fetch(`/api/companies/${id}/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.data || []);
      setUserTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const generateSlug = (name) => {
    if (!name) return '';
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (!slug || slug.length === 0) {
      slug = `company-${Date.now()}`;
    }
    
    return slug;
  };

  const handleCompanyNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      companyName: name,
      slug: generateSlug(name)
    });
  };

  const handleSlugChange = (e) => {
    let slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug });
  };

  const copyCatalogLink = () => {
    if (!formData.slug) return;
    const catalogLink = `${window.location.origin}/catalogue/products?company=${formData.slug}`;
    navigator.clipboard.writeText(catalogLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          slug: formData.slug,
          catalogWhatsapp: formData.catalogWhatsapp,
          address: formData.address,
          gstin: formData.gstin,
          pan: formData.pan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update company');
      }

      setCompany(data.data);
      setIsEditing(false);
      setSuccessMessage('Company updated successfully');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    setSaveLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/companies/${id}?permanent=false`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete company');
      }

      router.push('/super-admin/companies');
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleWhatsAppAction = async (action, data = {}) => {
    setSaveLoading(true);
    
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'whatsapp-status',
          status: action,
          data
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update WhatsApp status');
      }

      await fetchCompany();
      setSuccessMessage('WhatsApp status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddWhatsAppNumber = async () => {
    if (!newWhatsAppNumber.trim()) return;
    
    const cleanNumber = newWhatsAppNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 12) {
      alert('Please enter a valid 10-12 digit WhatsApp number');
      return;
    }

    setSaveLoading(true);
    
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalWhatsAppNumbers: [
            ...(company.additionalWhatsAppNumbers || []),
            {
              number: cleanNumber,
              description: newWhatsAppDesc || 'Additional WhatsApp number',
              isPrimary: newWhatsAppPrimary
            }
          ]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add WhatsApp number');
      }

      await fetchCompany();
      setShowAddWhatsAppModal(false);
      setNewWhatsAppNumber('');
      setNewWhatsAppDesc('');
      setNewWhatsAppPrimary(false);
      setSuccessMessage('WhatsApp number added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemoveWhatsAppNumber = async (number) => {
    if (!confirm('Are you sure you want to remove this WhatsApp number?')) return;

    setSaveLoading(true);
    
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalWhatsAppNumbers: (company.additionalWhatsAppNumbers || []).filter(
            n => n.number !== number
          )
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove WhatsApp number');
      }

      await fetchCompany();
      setSuccessMessage('WhatsApp number removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    console.log('User action:', userId, action);
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
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: appTheme.fonts.families.primary }}>
        <Icon className="w-3 h-3 mr-1" style={{ color: badge.text }} />
        {badge.label}
      </span>
    );
  };

  const getWhatsAppStatusBadge = (status) => {
    const badges = {
      connected: { bg: appTheme.colors.successLight || '#d1fae5', text: appTheme.colors.success || '#10b981', icon: Wifi, label: 'Connected' },
      disconnected: { bg: '#f3f4f6', text: appTheme.colors.textSecondary || '#6b7280', icon: WifiOff, label: 'Disconnected' },
      pending: { bg: appTheme.colors.warningLight || '#fef3c7', text: appTheme.colors.warning || '#f59e0b', icon: Clock, label: 'Pending' },
      error: { bg: appTheme.colors.errorLight || '#fee2e2', text: appTheme.colors.error || '#ef4444', icon: AlertCircle, label: 'Error' },
    };
    const badge = badges[status] || badges.disconnected;
    const Icon = badge.icon;
    
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: appTheme.fonts.families.primary }}>
        <Icon className="w-3 h-3 mr-1" style={{ color: badge.text }} />
        {badge.label}
      </span>
    );
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
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: planData.bg, color: planData.text, fontFamily: appTheme.fonts.families.primary }}>
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDistanceToNow = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: appTheme.colors.primary }} />
          <p className="mt-4 font-medium" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
        <div className="rounded-2xl shadow-xl p-8 max-w-md text-center" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: appTheme.colors.error }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>Error</h2>
          <p className="mb-6" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>{error || 'Company not found'}</p>
          <button
            onClick={() => router.push('/super-admin/companies')}
            className="px-6 py-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
      {/* Modern Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b shadow-sm" style={{ backgroundColor: `${appTheme.colors.backgroundCard}CC`, borderColor: appTheme.colors.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/super-admin/companies')}
                className="p-2 rounded-xl transition-colors"
                style={{ color: appTheme.colors.textSecondary }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.textPrimary}, ${appTheme.colors.primary})`, fontFamily: appTheme.fonts.families.primary }}>
                    {company.companyName}
                  </h1>
                  {getStatusBadge(company.status)}
                  {getPlanBadge(company.subscription?.plan)}
                  {company.slug && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${appTheme.colors.secondary}20`, color: appTheme.colors.secondary }}>
                      <Tag className="w-3 h-3 mr-1" />
                      {company.slug}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1 flex items-center gap-2 flex-wrap" style={{ color: appTheme.colors.textSecondary, fontFamily: appTheme.fonts.families.primary }}>
                  <span>Created {formatDate(company.createdAt)}</span>
                  {company.whatsapp?.isConnected && (
                    <span className="inline-flex items-center" style={{ color: appTheme.colors.success }}>
                      <Wifi className="w-3 h-3 mr-1" />
                      WhatsApp Connected
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && activeTab === 'overview' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                  style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                style={{ backgroundColor: appTheme.colors.error, color: 'white' }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 border rounded-xl p-3 flex items-center animate-in slide-in-from-top-2" style={{ backgroundColor: `${appTheme.colors.success}10`, borderColor: `${appTheme.colors.success}30` }}>
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: appTheme.colors.success }} />
              <p className="text-sm" style={{ color: appTheme.colors.success, fontFamily: appTheme.fonts.families.primary }}>{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 border rounded-xl p-3 flex items-center" style={{ backgroundColor: `${appTheme.colors.error}10`, borderColor: `${appTheme.colors.error}30` }}>
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: appTheme.colors.error }} />
              <p className="text-sm" style={{ color: appTheme.colors.error, fontFamily: appTheme.fonts.families.primary }}>{error}</p>
            </div>
          )}
        </div>

        {/* Modern Tabs - Responsive */}
        <div className="border-t" style={{ borderColor: appTheme.colors.borderLight }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop Tabs */}
            <nav className="hidden md:flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-all
                      ${activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                    style={activeTab === tab.id ? { borderColor: appTheme.colors.primary, color: appTheme.colors.primary } : { color: appTheme.colors.textSecondary }}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Tabs - Dropdown */}
            <div className="md:hidden py-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border"
                style={{ backgroundColor: appTheme.colors.backgroundLight, borderColor: appTheme.colors.border }}
              >
                <div className="flex items-center gap-2">
                  {tabs.find(t => t.id === activeTab)?.icon && 
                    (() => {
                      const Icon = tabs.find(t => t.id === activeTab).icon;
                      return <Icon className="w-5 h-5" style={{ color: appTheme.colors.primary }} />;
                    })()}
                  <span className="font-medium" style={{ color: appTheme.colors.textPrimary }}>
                    {tabs.find(t => t.id === activeTab)?.label}
                  </span>
                </div>
                {mobileMenuOpen ? <ChevronUp className="w-5 h-5" style={{ color: appTheme.colors.textSecondary }} /> : <ChevronDown className="w-5 h-5" style={{ color: appTheme.colors.textSecondary }} />}
              </button>
              
              {mobileMenuOpen && (
                <div className="absolute left-0 right-0 mt-2 mx-4 rounded-xl shadow-lg border z-20" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsEditing(false);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${tab.id === tabs[tabs.length - 1].id ? '' : 'border-b'}`}
                        style={{
                          backgroundColor: activeTab === tab.id ? `${appTheme.colors.primary}10` : 'transparent',
                          color: activeTab === tab.id ? appTheme.colors.primary : appTheme.colors.textPrimary,
                          borderColor: appTheme.colors.borderLight
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Modern Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl shadow-sm border p-4 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: appTheme.colors.textSecondary }}>Total Users</p>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${appTheme.colors.primary}15` }}>
                    <Users className="w-4 h-4" style={{ color: appTheme.colors.primary }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{stats.totalUsers || 0}</p>
                <p className="text-xs mt-1" style={{ color: appTheme.colors.textSecondary }}>Limit: {stats.usage?.users?.limit || 0}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1" style={{ color: appTheme.colors.textSecondary }}>
                    <span>Usage</span>
                    <span>{stats.usage?.users?.percentage || 0}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: appTheme.colors.borderLight }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(stats.usage?.users?.percentage || 0, 100)}%`,
                        backgroundColor: (stats.usage?.users?.percentage || 0) > 90 ? appTheme.colors.error : (stats.usage?.users?.percentage || 0) > 70 ? appTheme.colors.warning : appTheme.colors.success
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl shadow-sm border p-4 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: appTheme.colors.textSecondary }}>Total Products</p>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${appTheme.colors.secondary}15` }}>
                    <Package className="w-4 h-4" style={{ color: appTheme.colors.secondary }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{stats.totalProducts || 0}</p>
                <p className="text-xs mt-1" style={{ color: appTheme.colors.textSecondary }}>Limit: {stats.usage?.products?.limit || 0}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1" style={{ color: appTheme.colors.textSecondary }}>
                    <span>Usage</span>
                    <span>{stats.usage?.products?.percentage || 0}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: appTheme.colors.borderLight }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(stats.usage?.products?.percentage || 0, 100)}%`,
                        backgroundColor: (stats.usage?.products?.percentage || 0) > 90 ? appTheme.colors.error : (stats.usage?.products?.percentage || 0) > 70 ? appTheme.colors.warning : appTheme.colors.success
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl shadow-sm border p-4 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: appTheme.colors.textSecondary }}>Total Orders</p>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${appTheme.colors.success}15` }}>
                    <ShoppingCart className="w-4 h-4" style={{ color: appTheme.colors.success }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{stats.totalOrders || 0}</p>
                <p className="text-xs mt-1" style={{ color: appTheme.colors.textSecondary }}>Limit: {stats.usage?.orders?.limit || 0}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1" style={{ color: appTheme.colors.textSecondary }}>
                    <span>Usage</span>
                    <span>{stats.usage?.orders?.percentage || 0}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: appTheme.colors.borderLight }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(stats.usage?.orders?.percentage || 0, 100)}%`,
                        backgroundColor: (stats.usage?.orders?.percentage || 0) > 90 ? appTheme.colors.error : (stats.usage?.orders?.percentage || 0) > 70 ? appTheme.colors.warning : appTheme.colors.success
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl shadow-sm border p-4 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: appTheme.colors.textSecondary }}>Total Bookings</p>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${appTheme.colors.warning}15` }}>
                    <Calendar className="w-4 h-4" style={{ color: appTheme.colors.warning }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{stats.totalBookings || 0}</p>
                <p className="text-xs mt-1" style={{ color: appTheme.colors.textSecondary }}>Limit: {stats.usage?.bookings?.limit || 0}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1" style={{ color: appTheme.colors.textSecondary }}>
                    <span>Usage</span>
                    <span>{stats.usage?.bookings?.percentage || 0}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: appTheme.colors.borderLight }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(stats.usage?.bookings?.percentage || 0, 100)}%`,
                        backgroundColor: (stats.usage?.bookings?.percentage || 0) > 90 ? appTheme.colors.error : (stats.usage?.bookings?.percentage || 0) > 70 ? appTheme.colors.warning : appTheme.colors.success
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Stats Card */}
            {company.whatsapp?.phoneNumber && (
              <div className="rounded-xl shadow-sm border p-5" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                  <Smartphone className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                  WhatsApp Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Total Messages</p>
                    <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp?.totalMessages || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Conversations</p>
                    <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp?.totalConversations || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Customers</p>
                    <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp?.totalCustomers || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Messages Today</p>
                    <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp?.messagesToday || 0}</p>
                  </div>
                </div>
                {stats.whatsapp?.lastMessageAt && (
                  <p className="text-xs mt-3" style={{ color: appTheme.colors.textSecondary }}>
                    Last message: {formatDistanceToNow(stats.whatsapp.lastMessageAt)}
                  </p>
                )}
              </div>
            )}

            {/* Company Details with Catalog Fields */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
              <div className="p-5 md:p-6">
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                  <Building2 className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                  Company Information
                </h2>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Company Name</label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={handleCompanyNameChange}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Company Email</label>
                        <input
                          type="email"
                          value={formData.companyEmail}
                          onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Company Phone</label>
                        <input
                          type="tel"
                          value={formData.companyPhone}
                          onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Catalog Slug</label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={handleSlugChange}
                            className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                            style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                            placeholder="company-slug"
                          />
                        </div>
                        <p className="mt-1 text-xs break-all" style={{ color: appTheme.colors.textTertiary }}>
                          URL: {window.location.origin}/catalogue/products?company={formData.slug || 'your-slug'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Catalog WhatsApp (Optional)</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
                          <input
                            type="tel"
                            value={formData.catalogWhatsapp}
                            onChange={(e) => setFormData({ ...formData, catalogWhatsapp: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                            style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                            placeholder="9876543210"
                          />
                        </div>
                        <p className="mt-1 text-xs" style={{ color: appTheme.colors.textTertiary }}>Separate WhatsApp for customer orders</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Street Address</label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                        style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>City</label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>State</label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Pincode</label>
                        <input
                          type="text"
                          value={formData.address.pincode}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>Country</label>
                        <input
                          type="text"
                          value={formData.address.country}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>GSTIN (Optional)</label>
                        <input
                          type="text"
                          value={formData.gstin}
                          onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>PAN (Optional)</label>
                        <input
                          type="text"
                          value={formData.pan}
                          onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                          style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border rounded-xl transition-colors"
                        style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors"
                        style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                      >
                        {saveLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>Company Name</p>
                        <p className="text-base font-medium" style={{ color: appTheme.colors.textPrimary }}>{company.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>Email</p>
                        <p className="text-base font-medium flex items-center break-all" style={{ color: appTheme.colors.textPrimary }}>
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                          {company.companyEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>Phone</p>
                        <p className="text-base font-medium flex items-center" style={{ color: appTheme.colors.textPrimary }}>
                          <Phone className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
                          {company.companyPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>Catalog Slug</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-mono px-2 py-1 rounded break-all" style={{ backgroundColor: appTheme.colors.backgroundLight, color: appTheme.colors.textPrimary }}>
                            {company.slug || 'Not set'}
                          </code>
                          {company.slug && (
                            <button
                              onClick={copyCatalogLink}
                              className="p-1.5 transition-colors"
                              style={{ color: appTheme.colors.textTertiary }}
                              title="Copy catalog link"
                            >
                              {copied ? (
                                <CheckIcon className="w-4 h-4" style={{ color: appTheme.colors.success }} />
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        {company.slug && (
                          <p className="text-xs mt-1 break-all" style={{ color: appTheme.colors.primary }}>
                            <LinkIcon className="w-3 h-3 inline mr-1" />
                            {window.location.origin}/catalogue/products?company={company.slug}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>Catalog WhatsApp</p>
                        <p className="text-base font-medium flex items-center" style={{ color: appTheme.colors.textPrimary }}>
                          <Smartphone className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
                          {company.catalogWhatsapp || 'Not set (uses primary WhatsApp)'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>Address</p>
                        <p className="text-base font-medium flex items-start" style={{ color: appTheme.colors.textPrimary }}>
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                          <span className="break-words">
                            {company.address?.street && `${company.address.street}, `}
                            {company.address?.city && `${company.address.city}, `}
                            {company.address?.state && `${company.address.state} `}
                            {company.address?.pincode && `- ${company.address.pincode}`}
                            {company.address?.country && `\n${company.address.country}`}
                            {!company.address?.street && !company.address?.city && !company.address?.state && 'No address provided'}
                          </span>
                        </p>
                      </div>
                      {company.gstin && (
                        <div>
                          <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>GSTIN</p>
                          <p className="text-base font-medium" style={{ color: appTheme.colors.textPrimary }}>{company.gstin}</p>
                        </div>
                      )}
                      {company.pan && (
                        <div>
                          <p className="text-sm mb-1" style={{ color: appTheme.colors.textSecondary }}>PAN</p>
                          <p className="text-base font-medium" style={{ color: appTheme.colors.textPrimary }}>{company.pan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            {(company.recentActivity?.users?.length > 0 || company.recentActivity?.orders?.length > 0) && (
              <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <div className="p-5 md:p-6">
                  <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                    <Activity className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                    Recent Activity
                  </h2>

                  <div className="space-y-3">
                    {company.recentActivity?.users?.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: appTheme.colors.borderLight }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <UserCircle className="w-8 h-8 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: appTheme.colors.textPrimary }}>{user.fullName}</p>
                            <p className="text-xs truncate" style={{ color: appTheme.colors.textSecondary }}>{user.email}</p>
                          </div>
                        </div>
                        <p className="text-xs ml-2 flex-shrink-0" style={{ color: appTheme.colors.textSecondary }}>
                          {user.lastSeen ? formatDistanceToNow(user.lastSeen) : 'Never'}
                        </p>
                      </div>
                    ))}

                    {company.recentActivity?.orders?.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: appTheme.colors.borderLight }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <ShoppingCart className="w-8 h-8 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: appTheme.colors.textPrimary }}>{order.orderNumber}</p>
                            <p className="text-xs truncate" style={{ color: appTheme.colors.textSecondary }}>{order.customerName}</p>
                          </div>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>{formatCurrency(order.totalPrice)}</p>
                          <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>
                            {formatDistanceToNow(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: WhatsApp - Modern Responsive */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            {/* WhatsApp Connection Status */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
              <div className="p-5 md:p-6">
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                  <Smartphone className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                  WhatsApp Integration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${company.whatsapp?.isConnected ? 'animate-pulse' : ''}`} style={{ backgroundColor: company.whatsapp?.isConnected ? appTheme.colors.success : appTheme.colors.textTertiary }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>Connection Status</p>
                          <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>
                            {company.whatsapp?.isConnected ? 'Connected and active' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleWhatsAppAction(company.whatsapp?.isConnected ? 'disconnect' : 'connect')}
                        disabled={saveLoading}
                        className={`px-4 py-2 text-white text-sm rounded-xl transition-all disabled:opacity-50`}
                        style={{ backgroundColor: company.whatsapp?.isConnected ? appTheme.colors.error : appTheme.colors.success }}
                      >
                        {company.whatsapp?.isConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {company.whatsapp?.clientId && (
                      <div className="p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                        <p className="text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Client ID</p>
                        <p className="text-xs font-mono break-all" style={{ color: appTheme.colors.textSecondary }}>{company.whatsapp.clientId}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {company.whatsapp?.connectedAt && (
                      <div className="p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                        <p className="text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Connected Since</p>
                        <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>{formatDate(company.whatsapp.connectedAt)}</p>
                      </div>
                    )}

                    {company.whatsapp?.lastError && (
                      <div className="p-4 rounded-xl" style={{ backgroundColor: `${appTheme.colors.error}10` }}>
                        <p className="text-sm font-medium mb-1 flex items-center" style={{ color: appTheme.colors.error }}>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Last Error
                        </p>
                        <p className="text-xs" style={{ color: appTheme.colors.error }}>{company.whatsapp.lastError}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Numbers */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
              <div className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <h2 className="text-base md:text-lg font-semibold flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                    <MessageSquare className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                    WhatsApp Numbers
                  </h2>
                  <button
                    onClick={() => setShowAddWhatsAppModal(true)}
                    className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors self-start sm:self-auto"
                    style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Number
                  </button>
                </div>

                <div className="space-y-3">
                  {whatsappNumbers.map((num, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>{num.number}</p>
                            {num.type === 'primary' && (
                              <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${appTheme.colors.secondary}20`, color: appTheme.colors.secondary }}>
                                Primary
                              </span>
                            )}
                            {num.isConnected ? (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${appTheme.colors.success}20`, color: appTheme.colors.success }}>
                                <Wifi className="w-3 h-3 mr-1" />
                                Connected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary }}>
                                <WifiOff className="w-3 h-3 mr-1" />
                                Disconnected
                              </span>
                            )}
                          </div>
                          {num.description && (
                            <p className="text-xs mt-1" style={{ color: appTheme.colors.textSecondary }}>{num.description}</p>
                          )}
                        </div>
                      </div>
                      {num.type !== 'primary' && (
                        <button
                          onClick={() => handleRemoveWhatsAppNumber(num.number)}
                          className="px-3 py-1.5 rounded-lg text-sm transition-colors self-start sm:self-auto"
                          style={{ color: appTheme.colors.error }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}

                  {whatsappNumbers.length === 0 && (
                    <div className="text-center py-8">
                      <Smartphone className="w-12 h-12 mx-auto mb-3" style={{ color: appTheme.colors.textTertiary }} />
                      <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>No WhatsApp numbers configured</p>
                      <button
                        onClick={() => setShowAddWhatsAppModal(true)}
                        className="mt-3 text-sm hover:underline" 
                        style={{ color: appTheme.colors.primary }}
                      >
                        Add your first WhatsApp number
                      </button>
                    </div>
                  )}
                </div>

                {company.catalogWhatsapp && (
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: `${appTheme.colors.info}10` }}>
                    <div className="flex items-start gap-2">
                      <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: appTheme.colors.info }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: appTheme.colors.info }}>Catalog WhatsApp</p>
                        <p className="text-sm" style={{ color: appTheme.colors.info }}>{company.catalogWhatsapp}</p>
                        <p className="text-xs mt-1" style={{ color: appTheme.colors.info }}>
                          This number is used for customer orders from the catalog page.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp Stats */}
            {stats.whatsapp && (stats.whatsapp.totalMessages > 0 || stats.whatsapp.totalConversations > 0) && (
              <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <div className="p-5 md:p-6">
                  <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                    <BarChart3 className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                    WhatsApp Statistics
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl text-center" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                      <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Total Messages</p>
                      <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp.totalMessages || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                      <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Conversations</p>
                      <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp.totalConversations || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                      <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Customers</p>
                      <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp.totalCustomers || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                      <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>Messages Today</p>
                      <p className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>{stats.whatsapp.messagesToday || 0}</p>
                    </div>
                  </div>

                  {stats.whatsapp.lastMessageAt && (
                    <p className="text-xs mt-4 text-center" style={{ color: appTheme.colors.textSecondary }}>
                      Last message: {formatDistanceToNow(stats.whatsapp.lastMessageAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Users - Modern Responsive */}
        {activeTab === 'users' && (
          <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
            <div className="p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h2 className="text-base md:text-lg font-semibold flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                  <Users className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                  Users Management
                </h2>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors self-start sm:self-auto"
                  style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              {/* Filters */}
              <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>

                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 border rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                >
                  <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Users Cards for Mobile / Table for Desktop */}
              <div className="block md:hidden space-y-3">
                {usersLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: appTheme.colors.primary }} />
                    <p className="mt-2 text-sm" style={{ color: appTheme.colors.textSecondary }}>Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-3" style={{ color: appTheme.colors.textTertiary }} />
                    <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>No users found</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: appTheme.colors.borderLight }}>
                            <UserCircle className="w-6 h-6" style={{ color: appTheme.colors.textSecondary }} />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: appTheme.colors.textPrimary }}>{user.fullName}</p>
                            <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>{user.email}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary }}>
                                {user.role}
                              </span>
                              {getStatusBadge(user.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                            className="p-1.5 rounded-lg transition-colors"
                            title={user.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            {user.status === 'active' ? (
                              <Lock className="w-4 h-4" style={{ color: appTheme.colors.warning }} />
                            ) : (
                              <Unlock className="w-4 h-4" style={{ color: appTheme.colors.success }} />
                            )}
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="p-1.5 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" style={{ color: appTheme.colors.error }} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs mt-2" style={{ color: appTheme.colors.textSecondary }}>
                        Last active: {user.lastSeen ? formatDistanceToNow(user.lastSeen) : 'Never'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: appTheme.colors.borderLight }}>
                  <thead className="bg-opacity-50" style={{ backgroundColor: `${appTheme.colors.backgroundLight}80` }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary }}>User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary }}>Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary }}>Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary }}>Last Active</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: appTheme.colors.textSecondary }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.borderLight }}>
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: appTheme.colors.primary }} />
                          <p className="mt-2 text-sm" style={{ color: appTheme.colors.textSecondary }}>Loading users...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <Users className="w-12 h-12 mx-auto" style={{ color: appTheme.colors.textTertiary }} />
                          <p className="mt-2 text-sm" style={{ color: appTheme.colors.textSecondary }}>No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-opacity-50 transition-colors" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: appTheme.colors.borderLight }}>
                                <UserCircle className="w-6 h-6" style={{ color: appTheme.colors.textSecondary }} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>{user.fullName}</div>
                                <div className="text-sm" style={{ color: appTheme.colors.textSecondary }}>{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary }}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: appTheme.colors.textSecondary }}>
                            {user.lastSeen ? formatDistanceToNow(user.lastSeen) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                              className="mr-2 p-1 rounded transition-colors"
                              title={user.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {user.status === 'active' ? (
                                <Lock className="w-4 h-4" style={{ color: appTheme.colors.warning }} />
                              ) : (
                                <Unlock className="w-4 h-4" style={{ color: appTheme.colors.success }} />
                              )}
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" style={{ color: appTheme.colors.error }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {userTotal > 0 && (
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-center sm:text-left" style={{ color: appTheme.colors.textSecondary }}>
                    Showing <span className="font-medium" style={{ color: appTheme.colors.textPrimary }}>{(userPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium" style={{ color: appTheme.colors.textPrimary }}>{Math.min(userPage * 10, userTotal)}</span> of{' '}
                    <span className="font-medium" style={{ color: appTheme.colors.textPrimary }}>{userTotal}</span> users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                      className="p-2 border rounded-lg disabled:opacity-50 transition-colors"
                      style={{ borderColor: appTheme.colors.border }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUserPage(p => p + 1)}
                      disabled={userPage * 10 >= userTotal}
                      className="p-2 border rounded-lg disabled:opacity-50 transition-colors"
                      style={{ borderColor: appTheme.colors.border }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Subscription - Modern Responsive */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
              <div className="p-5 md:p-6">
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                  <CreditCard className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                  Current Subscription
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>Plan</p>
                      <div className="mt-1">{getPlanBadge(company.subscription?.plan)}</div>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>Status</p>
                      <div className="mt-1">{getStatusBadge(company.subscription?.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>Started</p>
                      <p className="text-base font-medium" style={{ color: appTheme.colors.textPrimary }}>{formatDate(company.subscription?.startDate)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>Expiry Date</p>
                      <p className="text-base font-medium" style={{ color: appTheme.colors.textPrimary }}>
                        {company.subscription?.expiryDate
                          ? formatDate(company.subscription.expiryDate)
                          : 'Never'}
                      </p>
                      {company.subscription?.expiryDate && (
                        <p className="text-xs mt-1" style={{ color: appTheme.colors.textSecondary }}>
                          {company.daysUntilExpiry} days remaining
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>Auto Renew</p>
                      <p className="text-base font-medium" style={{ color: appTheme.colors.textPrimary }}>
                        {company.subscription?.autoRenew ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>Payment Method</p>
                      <p className="text-base font-medium capitalize" style={{ color: appTheme.colors.textPrimary }}>
                        {company.subscription?.paymentMethod || 'Monthly'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            {company.features && Object.keys(company.features).length > 0 && (
              <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
                <div className="p-5 md:p-6">
                  <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                    <Award className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                    Plan Features
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(company.features).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                        <span className="text-sm capitalize" style={{ color: appTheme.colors.textPrimary }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {value ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: appTheme.colors.success }} />
                        ) : (
                          <XCircle className="w-5 h-5" style={{ color: appTheme.colors.textTertiary }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Usage Limits */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
              <div className="p-5 md:p-6">
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                  <BarChart3 className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                  Usage Limits
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
                      <span className="text-gray-600">Users</span>
                      <span className="font-medium">{stats.totalUsers} / {company.limits?.maxUsers || 0}</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: appTheme.colors.borderLight }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((stats.totalUsers / (company.limits?.maxUsers || 1)) * 100, 100)}%`,
                          backgroundColor: appTheme.colors.primary
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
                      <span className="text-gray-600">Products</span>
                      <span className="font-medium">{stats.totalProducts} / {company.limits?.maxProducts || 0}</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: appTheme.colors.borderLight }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((stats.totalProducts / (company.limits?.maxProducts || 1)) * 100, 100)}%`,
                          backgroundColor: appTheme.colors.secondary
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
                      <span className="text-gray-600">Orders (Monthly)</span>
                      <span className="font-medium">{stats.totalOrders} / {company.limits?.maxOrdersPerMonth || 0}</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: appTheme.colors.borderLight }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((stats.totalOrders / (company.limits?.maxOrdersPerMonth || 1)) * 100, 100)}%`,
                          backgroundColor: appTheme.colors.success
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1.5">
                      <span className="text-gray-600">Bookings (Monthly)</span>
                      <span className="font-medium">{stats.totalBookings} / {company.limits?.maxBookingsPerMonth || 0}</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: appTheme.colors.borderLight }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((stats.totalBookings / (company.limits?.maxBookingsPerMonth || 1)) * 100, 100)}%`,
                          backgroundColor: appTheme.colors.warning
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settings - Modern Responsive */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Company Settings */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
              <div className="p-5 md:p-6">
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>
                  <Settings className="w-5 h-5 mr-2" style={{ color: appTheme.colors.primary }} />
                  Company Settings
                </h2>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>Website</p>
                        <p className="text-xs break-all" style={{ color: appTheme.colors.textSecondary }}>{company.website || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm hover:underline self-start sm:self-auto" style={{ color: appTheme.colors.primary }}>
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>Support Email</p>
                        <p className="text-xs break-all" style={{ color: appTheme.colors.textSecondary }}>{company.support?.email || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm hover:underline self-start sm:self-auto" style={{ color: appTheme.colors.primary }}>
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>Support Phone</p>
                        <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>{company.support?.phone || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm hover:underline self-start sm:self-auto" style={{ color: appTheme.colors.primary }}>
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: appTheme.colors.textTertiary }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>Business Hours</p>
                        <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>{company.businessHours || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm hover:underline self-start sm:self-auto" style={{ color: appTheme.colors.primary }}>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: `${appTheme.colors.error}30` }}>
              <div className="p-5 md:p-6">
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center" style={{ color: appTheme.colors.error }}>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Danger Zone
                </h2>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: `${appTheme.colors.error}10` }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: appTheme.colors.error }}>Suspend Company</p>
                      <p className="text-xs" style={{ color: appTheme.colors.error }}>Temporarily disable access for all users in this company</p>
                    </div>
                    <button
                      onClick={() => handleUserAction(company.id, 'suspend')}
                      className="px-4 py-2 rounded-xl text-sm transition-colors self-start sm:self-auto"
                      style={{ backgroundColor: appTheme.colors.warning, color: 'white' }}
                    >
                      Suspend
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: `${appTheme.colors.error}10` }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: appTheme.colors.error }}>Delete Company</p>
                      <p className="text-xs" style={{ color: appTheme.colors.error }}>Permanently delete this company and all associated data</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-xl text-sm transition-colors self-start sm:self-auto"
                      style={{ backgroundColor: appTheme.colors.error, color: 'white' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: `${appTheme.colors.error}20` }}>
                <AlertTriangle className="w-6 h-6" style={{ color: appTheme.colors.error }} />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2" style={{ color: appTheme.colors.textPrimary }}>Delete Company</h3>
              <p className="text-sm text-center mb-6" style={{ color: appTheme.colors.textSecondary }}>
                Are you sure you want to delete <span className="font-medium" style={{ color: appTheme.colors.textPrimary }}>{company.companyName}</span>? This action cannot be undone and all data will be permanently removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border rounded-xl transition-colors"
                  style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: appTheme.colors.error, color: 'white' }}
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add WhatsApp Number Modal */}
      {showAddWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: appTheme.colors.textPrimary }}>Add WhatsApp Number</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>
                    WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newWhatsAppNumber}
                    onChange={(e) => setNewWhatsAppNumber(e.target.value)}
                    placeholder="919876543210 (with country code)"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                  />
                  <p className="mt-1 text-xs" style={{ color: appTheme.colors.textSecondary }}>
                    Include country code (e.g., 91 for India)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: appTheme.colors.textPrimary }}>
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newWhatsAppDesc}
                    onChange={(e) => setNewWhatsAppDesc(e.target.value)}
                    placeholder="e.g., Customer Support, Orders, etc."
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary, borderRadius: appTheme.radius.lg }}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="makePrimary"
                    checked={newWhatsAppPrimary}
                    onChange={(e) => setNewWhatsAppPrimary(e.target.checked)}
                    className="w-4 h-4 rounded focus:ring-indigo-500"
                    style={{ accentColor: appTheme.colors.primary }}
                  />
                  <label htmlFor="makePrimary" className="ml-2 text-sm" style={{ color: appTheme.colors.textSecondary }}>
                    Make this the primary WhatsApp number
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => setShowAddWhatsAppModal(false)}
                  className="flex-1 px-4 py-2.5 border rounded-xl transition-colors"
                  style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWhatsAppNumber}
                  disabled={saveLoading || !newWhatsAppNumber.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Add Number'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}