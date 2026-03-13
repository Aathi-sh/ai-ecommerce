// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import Head from 'next/head';
// import {
//   Search, Filter, Plus, Eye, Edit, CheckCircle, XCircle,
//   Phone, Mail, MapPin, Star, Calendar, Users, Shield,
//   Trash2, Clock, TrendingUp, Building, UserPlus, ChevronLeft, ChevronRight,
//   Download, MoreVertical, AlertCircle, RefreshCw, Award, Briefcase,
//   Globe, Map, Check, AlertTriangle, Info, Home, Settings,
//   FileText, DollarSign, Percent, Hash, AtSign, Link2,
//   Grid, List, Sliders, ChevronDown, X
// } from 'lucide-react';

// export default function BookingmngPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
  
//   const [professionals, setProfessionals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({ 
//     page: 1, 
//     limit: 20, 
//     total: 0, 
//     pages: 0 
//   });
//   const [filters, setFilters] = useState({
//     search: searchParams.get('search') || '',
//     status: searchParams.get('status') || 'all',
//     category: searchParams.get('category') || 'all',
//     type: searchParams.get('type') || 'all'
//   });
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [professionalToDelete, setProfessionalToDelete] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

//   // Categories
//   const categories = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'beauty', label: 'Beauty & Spa' },
//     { value: 'health', label: 'Health & Wellness' },
//     { value: 'consulting', label: 'Consulting' },
//     { value: 'repair', label: 'Repair & Maintenance' },
//     { value: 'education', label: 'Education & Training' },
//     { value: 'fitness', label: 'Fitness' },
//     { value: 'other', label: 'Other' }
//   ];

//   // Types
//   const types = [
//     { value: 'all', label: 'All Types' },
//     { value: 'individual', label: 'Individual' },
//     { value: 'company', label: 'Company' },
//     { value: 'freelancer', label: 'Freelancer' },
//     { value: 'agency', label: 'Agency' }
//   ];

//   // Statuses
//   const statuses = [
//     { value: 'all', label: 'All Status' },
//     { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
//     { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
//     { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
//     { value: 'suspended', label: 'Suspended', color: 'bg-gray-100 text-gray-800' }
//   ];

//   // Fetch professionals
//   const fetchProfessionals = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const query = new URLSearchParams({
//         ...filters,
//         page: pagination.page,
//         limit: pagination.limit
//       }).toString();
      
//       const res = await fetch(`/api/bookingService/bookingmng?${query}`);
//       const data = await res.json();
      
//       if (data.success) {
//         setProfessionals(data.data || []);
//         setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
//       } else {
//         setError(data.error || 'Failed to fetch professionals');
//       }
//     } catch (error) {
//       console.error('Error fetching professionals:', error);
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfessionals();
//     // Update URL with filters
//     const params = new URLSearchParams(filters);
//     router.replace(`/admin/bookingService/bookingmng?${params.toString()}`, { scroll: false });
//   }, [filters, pagination.page]);

//   // Handle filter changes
//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setFilters({
//       search: '',
//       status: 'all',
//       category: 'all',
//       type: 'all'
//     });
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   // Handle professional actions
//   const handleAction = async (id, action, data = {}) => {
//     setActionLoading(true);
//     try {
//       const res = await fetch(`/api/bookingService/bookingmng?id=${id}&action=${action}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//       });
      
//       const result = await res.json();
      
//       if (result.success) {
//         alert(result.message || 'Action completed successfully');
//         fetchProfessionals();
//       } else {
//         alert(`Error: ${result.error || 'Action failed'}`);
//       }
//     } catch (error) {
//       console.error('Error performing action:', error);
//       alert('Action failed. Please try again.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Handle delete
//   const handleDelete = async () => {
//     if (!professionalToDelete) return;
    
//     setActionLoading(true);
//     try {
//       const res = await fetch(`/api/bookingService/bookingmng?id=${professionalToDelete}`, {
//         method: 'DELETE'
//       });
      
//       const result = await res.json();
      
//       if (result.success) {
//         alert(result.message || 'Professional deleted successfully');
//         setShowDeleteModal(false);
//         setProfessionalToDelete(null);
//         fetchProfessionals();
//       } else {
//         alert(`Error: ${result.error || 'Delete failed'}`);
//       }
//     } catch (error) {
//       console.error('Error deleting professional:', error);
//       alert('Delete failed. Please try again.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Get status badge
//   const getStatusBadge = (status) => {
//     const statusObj = statuses.find(s => s.value === status);
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusObj?.color || 'bg-gray-100 text-gray-800'}`}>
//         {statusObj?.label || status}
//       </span>
//     );
//   };

//   // Get type icon
//   const getTypeIcon = (type) => {
//     switch (type) {
//       case 'company': return <Building size={16} className="text-blue-600" />;
//       case 'freelancer': return <Users size={16} className="text-green-600" />;
//       case 'agency': return <Building size={16} className="text-purple-600" />;
//       default: return <UserPlus size={16} className="text-gray-600" />;
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   // Export data
//   const handleExport = () => {
//     alert('Export functionality to be implemented');
//   };

//   // Get active filter count
//   const getActiveFilterCount = () => {
//     return Object.values(filters).filter(v => v && v !== 'all' && v !== '').length;
//   };

//   return (
//     <>
//       <Head>
//         <title>Professionals Management | LFMS</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
//       </Head>

//       <div className="professionals-page">
//         {/* Header */}
//         <div className="page-header">
//           <div className="header-content">
//             <div className="header-title">
//               <h1 className="page-title">Booking Manager</h1>
//               <p className="page-subtitle">Manage service professionals and their profiles</p>
//             </div>
//             <div className="header-actions">
//               <button
//                 onClick={handleExport}
//                 className="export-btn"
//                 title="Export Data"
//               >
//                 <Download size={18} />
//                 <span>Export</span>
//               </button>
//               <Link
//                 href="/admin/bookingService/bookingmng/create"
//                 className="add-btn"
//               >
//                 <Plus size={18} />
//                 <span>Add Professional</span>
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="error-alert">
//             <AlertCircle size={20} />
//             <p>{error}</p>
//             <button onClick={fetchProfessionals} className="retry-btn">
//               <RefreshCw size={16} />
//             </button>
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="stats-grid">
//           <div className="stat-card">
//             <div className="stat-icon blue">
//               <Users size={20} />
//             </div>
//             <div>
//               <span className="stat-label">Total Professionals</span>
//               <span className="stat-value">{pagination.total}</span>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon green">
//               <CheckCircle size={20} />
//             </div>
//             <div>
//               <span className="stat-label">Verified</span>
//               <span className="stat-value">
//                 {professionals.filter(p => p.verificationStatus === 'verified').length}
//               </span>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon orange">
//               <Clock size={20} />
//             </div>
//             <div>
//               <span className="stat-label">Pending</span>
//               <span className="stat-value">
//                 {professionals.filter(p => p.verificationStatus === 'pending').length}
//               </span>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon purple">
//               <Star size={20} />
//             </div>
//             <div>
//               <span className="stat-label">Avg Rating</span>
//               <span className="stat-value">
//                 {professionals.length > 0 
//                   ? (professionals.reduce((sum, p) => sum + (p.rating?.average || 0), 0) / professionals.length).toFixed(1)
//                   : '0.0'
//                 }
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Filters Bar */}
//         <div className="filters-bar">
//           <div className="search-box">
//             <Search size={18} className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search professionals..."
//               value={filters.search}
//               onChange={(e) => handleFilterChange('search', e.target.value)}
//             />
//             {filters.search && (
//               <button onClick={() => handleFilterChange('search', '')} className="clear-search">
//                 ×
//               </button>
//             )}
//           </div>

//           <div className="filter-actions">
//             <button 
//               onClick={() => setShowFilters(!showFilters)}
//               className={`filter-btn ${showFilters ? 'active' : ''}`}
//             >
//               <Sliders size={16} />
//               <span>Filters</span>
//               {getActiveFilterCount() > 0 && (
//                 <span className="filter-badge">
//                   {getActiveFilterCount()}
//                 </span>
//               )}
//             </button>

//             <div className="view-toggle">
//               <button 
//                 onClick={() => setViewMode('grid')}
//                 className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
//                 title="Grid View"
//               >
//                 <Grid size={16} />
//               </button>
//               <button 
//                 onClick={() => setViewMode('list')}
//                 className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
//                 title="List View"
//               >
//                 <List size={16} />
//               </button>
//             </div>

//             <button onClick={fetchProfessionals} className="refresh-btn" title="Refresh">
//               <RefreshCw size={16} />
//             </button>
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         {showFilters && (
//           <div className="advanced-filters">
//             <div className="filters-header">
//               <h3>Filter Professionals</h3>
//               {getActiveFilterCount() > 0 && (
//                 <button onClick={clearFilters} className="clear-filters-btn">
//                   Clear All
//                 </button>
//               )}
//             </div>
//             <div className="filters-grid">
//               {/* Search */}
//               <div className="filter-group">
//                 <label>Search</label>
//                 <input
//                   type="text"
//                   value={filters.search}
//                   onChange={(e) => handleFilterChange('search', e.target.value)}
//                   placeholder="Name, email, phone..."
//                 />
//               </div>

//               {/* Status Filter */}
//               <div className="filter-group">
//                 <label>Status</label>
//                 <select 
//                   value={filters.status} 
//                   onChange={(e) => handleFilterChange('status', e.target.value)}
//                 >
//                   {statuses.map(status => (
//                     <option key={status.value} value={status.value}>{status.label}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Category Filter */}
//               <div className="filter-group">
//                 <label>Category</label>
//                 <select 
//                   value={filters.category} 
//                   onChange={(e) => handleFilterChange('category', e.target.value)}
//                 >
//                   {categories.map(cat => (
//                     <option key={cat.value} value={cat.value}>{cat.label}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Type Filter */}
//               <div className="filter-group">
//                 <label>Professional Type</label>
//                 <select 
//                   value={filters.type} 
//                   onChange={(e) => handleFilterChange('type', e.target.value)}
//                 >
//                   {types.map(type => (
//                     <option key={type.value} value={type.value}>{type.label}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Professionals List */}
//         <div className="content-area">
//           {loading ? (
//             <div className="loading-state">
//               <div className="spinner"></div>
//               <p>Loading professionals...</p>
//             </div>
//           ) : error ? (
//             <div className="error-state">
//               <AlertCircle size={48} />
//               <h3>Unable to load professionals</h3>
//               <p>{error}</p>
//               <button onClick={fetchProfessionals} className="retry-button">
//                 <RefreshCw size={16} />
//                 Retry
//               </button>
//             </div>
//           ) : professionals.length === 0 ? (
//             <div className="empty-state">
//               <Users size={48} />
//               <h3>No professionals found</h3>
//               <p>
//                 {getActiveFilterCount() > 0 || filters.search
//                   ? 'Try adjusting your filters or search term'
//                   : 'Get started by adding your first professional'}
//               </p>
//               <Link
//                 href="/admin/bookingService/bookingmng/create"
//                 className="create-first-btn"
//               >
//                 <Plus size={16} />
//                 Add Professional
//               </Link>
//             </div>
//           ) : (
//             <>
//               {/* Grid View */}
//               {viewMode === 'grid' && (
//                 <div className="professionals-grid">
//                   {professionals.map((professional) => (
//                     <div key={professional._id} className="professional-card">
//                       <div className="card-header">
//                         <div className="card-avatar">
//                           <Building size={24} className="text-blue-600" />
//                         </div>
//                         <div className="card-title">
//                           <h3 className="professional-name">{professional.businessName || 'Unnamed Business'}</h3>
//                           <div className="professional-badges">
//                             {professional.isFeatured && (
//                               <span className="featured-badge">
//                                 <Award size={10} />
//                                 Featured
//                               </span>
//                             )}
//                             {getStatusBadge(professional.verificationStatus)}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="card-body">
//                         <p className="professional-tagline">
//                           {professional.tagline || 'No tagline provided'}
//                         </p>

//                         <div className="professional-contact">
//                           <div className="contact-item">
//                             <Phone size={14} />
//                             <span>{professional.phone || 'N/A'}</span>
//                           </div>
//                           <div className="contact-item">
//                             <Mail size={14} />
//                             <span>{professional.email || 'N/A'}</span>
//                           </div>
//                           {professional.address?.city && (
//                             <div className="contact-item">
//                               <MapPin size={14} />
//                               <span>{professional.address.city}</span>
//                             </div>
//                           )}
//                         </div>

//                         <div className="professional-details">
//                           <div className="detail-item">
//                             <span className="detail-label">Category</span>
//                             <span className="detail-value">{professional.category || 'Uncategorized'}</span>
//                           </div>
//                           <div className="detail-item">
//                             <span className="detail-label">Type</span>
//                             <span className="detail-value type-value">
//                               {getTypeIcon(professional.type)}
//                               <span>{professional.type || 'individual'}</span>
//                             </span>
//                           </div>
//                           <div className="detail-item">
//                             <span className="detail-label">Experience</span>
//                             <span className="detail-value">{professional.experience || 0} years</span>
//                           </div>
//                         </div>

//                         <div className="professional-stats">
//                           <div className="stat">
//                             <span className="stat-num">{professional.totalBookings || 0}</span>
//                             <span className="stat-label">Bookings</span>
//                           </div>
//                           <div className="stat">
//                             <span className="stat-num">
//                               <Star size={12} className="text-yellow-500" />
//                               {professional.rating?.average?.toFixed(1) || '0.0'}
//                             </span>
//                             <span className="stat-label">Rating</span>
//                           </div>
//                           <div className="stat">
//                             <span className="stat-num">{professional.services?.length || 0}</span>
//                             <span className="stat-label">Services</span>
//                           </div>
//                         </div>

//                         <div className="professional-status">
//                           <div className="status-item">
//                             <div className={`status-dot ${professional.isActive ? 'active' : 'inactive'}`} />
//                             <span className="status-text">{professional.isActive ? 'Active' : 'Inactive'}</span>
//                           </div>
//                           {professional.whatsappVerified && (
//                             <div className="whatsapp-verified">
//                               <Shield size={12} />
//                               <span>WhatsApp Verified</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="card-footer">
//                         <div className="card-actions">
//                           <Link
//                             href={`/admin/bookingService/bookingmng/${professional._id}`}
//                             className="action-btn view"
//                             title="View Details"
//                           >
//                             <Eye size={16} />
//                             <span>View</span>
//                           </Link>
//                           <Link
//                             href={`/admin/bookingService/bookingmng/${professional._id}/edit`}
//                             className="action-btn edit"
//                             title="Edit"
//                           >
//                             <Edit size={16} />
//                             <span>Edit</span>
//                           </Link>
//                           {professional.verificationStatus === 'pending' && (
//                             <button
//                               onClick={() => handleAction(professional._id, 'verify')}
//                               className="action-btn verify"
//                               disabled={actionLoading}
//                             >
//                               <CheckCircle size={16} />
//                               <span>Verify</span>
//                             </button>
//                           )}
//                           <button
//                             onClick={() => {
//                               setProfessionalToDelete(professional._id);
//                               setShowDeleteModal(true);
//                             }}
//                             className="action-btn delete"
//                             disabled={actionLoading}
//                           >
//                             <Trash2 size={16} />
//                             <span>Delete</span>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* List View */}
//               {viewMode === 'list' && (
//                 <div className="professionals-list">
//                   <table className="professionals-table">
//                     <thead>
//                       <tr>
//                         <th>Professional</th>
//                         <th>Contact</th>
//                         <th>Category & Type</th>
//                         <th>Stats</th>
//                         <th>Status</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {professionals.map((professional) => (
//                         <tr key={professional._id}>
//                           <td>
//                             <div className="professional-info">
//                               <div className="professional-avatar">
//                                 <Building size={20} className="text-blue-600" />
//                               </div>
//                               <div>
//                                 <div className="professional-name">{professional.businessName || 'Unnamed Business'}</div>
//                                 <div className="professional-meta">
//                                   {professional.tagline && (
//                                     <span className="professional-tagline-list">
//                                       {professional.tagline.substring(0, 30)}...
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             <div className="contact-info">
//                               <div className="contact-item">
//                                 <Phone size={14} />
//                                 <span>{professional.phone || 'N/A'}</span>
//                               </div>
//                               <div className="contact-item">
//                                 <Mail size={14} />
//                                 <span>{professional.email || 'N/A'}</span>
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             <div className="category-type">
//                               <span className="category-badge">{professional.category || 'Uncategorized'}</span>
//                               <span className="type-badge">{professional.type || 'individual'}</span>
//                             </div>
//                           </td>
//                           <td>
//                             <div className="stats-list">
//                               <div>Bookings: {professional.totalBookings || 0}</div>
//                               <div>Rating: {professional.rating?.average?.toFixed(1) || '0.0'}</div>
//                             </div>
//                           </td>
//                           <td>
//                             <div className="status-info">
//                               {getStatusBadge(professional.verificationStatus)}
//                               <div className={`status-dot ${professional.isActive ? 'active' : 'inactive'}`} />
//                             </div>
//                           </td>
//                           <td>
//                             <div className="row-actions">
//                               <Link
//                                 href={`/admin/bookingService/bookingmng/${professional._id}`}
//                                 className="icon-btn"
//                                 title="View"
//                               >
//                                 <Eye size={16} />
//                               </Link>
//                               <Link
//                                 href={`/admin/bookingService/bookingmng/${professional._id}/edit`}
//                                 className="icon-btn"
//                                 title="Edit"
//                               >
//                                 <Edit size={16} />
//                               </Link>
//                               {professional.verificationStatus === 'pending' && (
//                                 <button
//                                   onClick={() => handleAction(professional._id, 'verify')}
//                                   className="icon-btn verify"
//                                   title="Verify"
//                                   disabled={actionLoading}
//                                 >
//                                   <CheckCircle size={16} />
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => {
//                                   setProfessionalToDelete(professional._id);
//                                   setShowDeleteModal(true);
//                                 }}
//                                 className="icon-btn delete"
//                                 title="Delete"
//                               >
//                                 <Trash2 size={16} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Pagination */}
//         {pagination.pages > 1 && (
//           <div className="pagination">
//             <div className="pagination-info">
//               Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//               {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
//             </div>
//             <div className="pagination-controls">
//               <button
//                 onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
//                 disabled={pagination.page === 1}
//                 className="pagination-btn"
//               >
//                 <ChevronLeft size={16} />
//               </button>
              
//               <div className="pagination-numbers">
//                 {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
//                   let pageNum;
//                   if (pagination.pages <= 5) {
//                     pageNum = i + 1;
//                   } else if (pagination.page <= 3) {
//                     pageNum = i + 1;
//                   } else if (pagination.page >= pagination.pages - 2) {
//                     pageNum = pagination.pages - 4 + i;
//                   } else {
//                     pageNum = pagination.page - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
//                       className={`pagination-number ${pagination.page === pageNum ? 'active' : ''}`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//               </div>
              
//               <button
//                 onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
//                 disabled={pagination.page >= pagination.pages}
//                 className="pagination-btn"
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Delete Modal */}
//         {showDeleteModal && (
//           <div className="modal-overlay">
//             <div className="modal">
//               <div className="modal-header">
//                 <AlertCircle size={24} className="warning-icon" />
//                 <h3>Delete Professional</h3>
//               </div>
//               <div className="modal-body">
//                 <p>Are you sure you want to delete this professional?</p>
//                 <p className="warning-text">This action cannot be undone.</p>
//               </div>
//               <div className="modal-footer">
//                 <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">
//                   Cancel
//                 </button>
//                 <button onClick={handleDelete} className="delete-btn" disabled={actionLoading}>
//                   {actionLoading ? 'Deleting...' : 'Delete Professional'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .professionals-page {
//           width: 100%;
//           padding: 1.5rem;
//         }

//         @media (max-width: 768px) {
//           .professionals-page {
//             padding: 1rem;
//           }
//         }

//         /* Header */
//         .page-header {
//           margin-bottom: 1.5rem;
//         }

//         .header-content {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }

//         @media (max-width: 768px) {
//           .header-content {
//             flex-direction: column;
//             gap: 1rem;
//             align-items: flex-start;
//           }
//         }

//         .page-title {
//           font-size: 1.8rem;
//           font-weight: 700;
//           color: #0f172a;
//           margin: 0;
//         }

//         .page-subtitle {
//           color: #64748b;
//           font-size: 0.9rem;
//           margin: 0.25rem 0 0 0;
//         }

//         .header-actions {
//           display: flex;
//           gap: 0.75rem;
//         }

//         .export-btn, .add-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.625rem 1.25rem;
//           border-radius: 0.5rem;
//           font-size: 0.9rem;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           text-decoration: none;
//         }

//         .export-btn {
//           background: white;
//           border: 1px solid #e2e8f0;
//           color: #1e293b;
//         }

//         .export-btn:hover {
//           background: #f8fafc;
//           border-color: #94a3b8;
//         }

//         .add-btn {
//           background: #3b82f6;
//           color: white;
//           border: none;
//         }

//         .add-btn:hover {
//           background: #2563eb;
//           transform: translateY(-1px);
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//         }

//         @media (max-width: 480px) {
//           .export-btn span, .add-btn span {
//             display: none;
//           }
          
//           .export-btn, .add-btn {
//             padding: 0.625rem;
//           }
//         }

//         /* Error Alert */
//         .error-alert {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 0.75rem 1rem;
//           background: #fef2f2;
//           border: 1px solid #fecaca;
//           border-radius: 0.5rem;
//           color: #dc2626;
//           margin-bottom: 1.5rem;
//         }

//         .error-alert p {
//           flex: 1;
//           margin: 0;
//         }

//         .retry-btn {
//           background: none;
//           border: none;
//           color: #dc2626;
//           cursor: pointer;
//           padding: 0.25rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 0.25rem;
//         }

//         .retry-btn:hover {
//           background: rgba(220, 38, 38, 0.1);
//         }

//         /* Stats Grid */
//         .stats-grid {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 1rem;
//           margin-bottom: 1.5rem;
//         }

//         @media (max-width: 1024px) {
//           .stats-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         @media (max-width: 640px) {
//           .stats-grid {
//             grid-template-columns: repeat(2, 1fr);
//             gap: 0.5rem;
//           }
//         }

//         .stat-card {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 1rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//         }

//         .stat-icon {
//           width: 2.5rem;
//           height: 2.5rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 0.5rem;
//         }

//         .stat-icon.blue {
//           background: #eff6ff;
//           color: #3b82f6;
//         }

//         .stat-icon.green {
//           background: #f0fdf4;
//           color: #22c55e;
//         }

//         .stat-icon.orange {
//           background: #fff7ed;
//           color: #f97316;
//         }

//         .stat-icon.purple {
//           background: #faf5ff;
//           color: #a855f7;
//         }

//         .stat-label {
//           display: block;
//           font-size: 0.75rem;
//           color: #64748b;
//           margin-bottom: 0.125rem;
//         }

//         .stat-value {
//           display: block;
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: #0f172a;
//         }

//         /* Filters Bar */
//         .filters-bar {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 1rem;
//           margin-bottom: 1rem;
//         }

//         @media (max-width: 640px) {
//           .filters-bar {
//             flex-direction: column;
//           }
//         }

//         .search-box {
//           flex: 1;
//           position: relative;
//         }

//         .search-box input {
//           width: 100%;
//           padding: 0.625rem 0.75rem 0.625rem 2.5rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.5rem;
//           font-size: 0.9rem;
//           height: 2.75rem;
//         }

//         .search-box input:focus {
//           outline: none;
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         .search-icon {
//           position: absolute;
//           left: 0.75rem;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #94a3b8;
//         }

//         .clear-search {
//           position: absolute;
//           right: 0.75rem;
//           top: 50%;
//           transform: translateY(-50%);
//           background: none;
//           border: none;
//           color: #94a3b8;
//           font-size: 1.2rem;
//           cursor: pointer;
//           padding: 0.25rem 0.5rem;
//         }

//         .clear-search:hover {
//           color: #ef4444;
//         }

//         .filter-actions {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .filter-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.625rem 1rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.5rem;
//           color: #1e293b;
//           font-size: 0.9rem;
//           cursor: pointer;
//           position: relative;
//           height: 2.75rem;
//         }

//         .filter-btn:hover {
//           background: #f8fafc;
//           border-color: #94a3b8;
//         }

//         .filter-btn.active {
//           background: #eff6ff;
//           border-color: #3b82f6;
//           color: #3b82f6;
//         }

//         .filter-badge {
//           position: absolute;
//           top: -0.5rem;
//           right: -0.5rem;
//           min-width: 1.25rem;
//           height: 1.25rem;
//           padding: 0 0.25rem;
//           background: #ef4444;
//           border-radius: 1rem;
//           color: white;
//           font-size: 0.7rem;
//           font-weight: 600;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .view-toggle {
//           display: flex;
//           gap: 0.25rem;
//           padding: 0.25rem;
//           background: #f1f5f9;
//           border-radius: 0.5rem;
//         }

//         .view-btn {
//           padding: 0.5rem;
//           background: transparent;
//           border: none;
//           border-radius: 0.375rem;
//           color: #64748b;
//           cursor: pointer;
//         }

//         .view-btn:hover {
//           color: #3b82f6;
//         }

//         .view-btn.active {
//           background: white;
//           color: #3b82f6;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.05);
//         }

//         .refresh-btn {
//           padding: 0.625rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.5rem;
//           color: #64748b;
//           cursor: pointer;
//           height: 2.75rem;
//           width: 2.75rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .refresh-btn:hover {
//           background: #f8fafc;
//           color: #3b82f6;
//           border-color: #3b82f6;
//         }

//         /* Advanced Filters */
//         .advanced-filters {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//           padding: 1.25rem;
//           margin-bottom: 1.5rem;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.05);
//         }

//         .filters-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 1rem;
//         }

//         .filters-header h3 {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
//         }

//         .clear-filters-btn {
//           background: none;
//           border: none;
//           color: #3b82f6;
//           font-size: 0.85rem;
//           font-weight: 500;
//           cursor: pointer;
//           padding: 0.25rem 0.5rem;
//         }

//         .clear-filters-btn:hover {
//           color: #2563eb;
//           text-decoration: underline;
//         }

//         .filters-grid {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 1rem;
//         }

//         @media (max-width: 1024px) {
//           .filters-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         @media (max-width: 640px) {
//           .filters-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .filter-group {
//           display: flex;
//           flex-direction: column;
//           gap: 0.375rem;
//         }

//         .filter-group label {
//           font-size: 0.75rem;
//           font-weight: 600;
//           color: #475569;
//           text-transform: uppercase;
//           letter-spacing: 0.3px;
//         }

//         .filter-group input,
//         .filter-group select {
//           padding: 0.5rem 0.75rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.375rem;
//           font-size: 0.9rem;
//           background: white;
//         }

//         .filter-group input:focus,
//         .filter-group select:focus {
//           outline: none;
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         /* Content Area */
//         .content-area {
//           min-height: 400px;
//         }

//         /* Loading State */
//         .loading-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 4rem 1rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//         }

//         .spinner {
//           width: 2.5rem;
//           height: 2.5rem;
//           border: 3px solid #f1f5f9;
//           border-top-color: #3b82f6;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//           margin-bottom: 1rem;
//         }

//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }

//         .loading-state p {
//           color: #64748b;
//         }

//         /* Error State */
//         .error-state {
//           text-align: center;
//           padding: 4rem 1rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//         }

//         .error-state svg {
//           color: #94a3b8;
//           margin-bottom: 1rem;
//         }

//         .error-state h3 {
//           font-size: 1.2rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0 0 0.5rem 0;
//         }

//         .error-state p {
//           color: #64748b;
//           margin: 0 0 1.5rem 0;
//         }

//         .retry-button {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.625rem 1.25rem;
//           background: #3b82f6;
//           color: white;
//           border: none;
//           border-radius: 0.5rem;
//           font-size: 0.9rem;
//           font-weight: 500;
//           cursor: pointer;
//         }

//         /* Empty State */
//         .empty-state {
//           text-align: center;
//           padding: 4rem 1rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//         }

//         .empty-state svg {
//           color: #94a3b8;
//           margin-bottom: 1rem;
//         }

//         .empty-state h3 {
//           font-size: 1.2rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0 0 0.5rem 0;
//         }

//         .empty-state p {
//           color: #64748b;
//           margin: 0 0 1.5rem 0;
//         }

//         .create-first-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1.5rem;
//           background: #3b82f6;
//           color: white;
//           border: none;
//           border-radius: 0.5rem;
//           font-size: 0.95rem;
//           font-weight: 500;
//           cursor: pointer;
//           text-decoration: none;
//         }

//         .create-first-btn:hover {
//           background: #2563eb;
//         }

//         /* Grid View */
//         .professionals-grid {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 1rem;
//         }

//         @media (max-width: 1400px) {
//           .professionals-grid {
//             grid-template-columns: repeat(3, 1fr);
//           }
//         }

//         @media (max-width: 1024px) {
//           .professionals-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         @media (max-width: 640px) {
//           .professionals-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .professional-card {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//           overflow: hidden;
//           transition: all 0.2s ease;
//         }

//         .professional-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 24px rgba(0,0,0,0.12);
//           border-color: #3b82f6;
//         }

//         .card-header {
//           display: flex;
//           gap: 0.75rem;
//           padding: 1rem;
//           border-bottom: 1px solid #e2e8f0;
//         }

//         .card-avatar {
//           width: 3rem;
//           height: 3rem;
//           background: #eff6ff;
//           border-radius: 0.5rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }

//         .card-title {
//           flex: 1;
//         }

//         .professional-name {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0 0 0.5rem 0;
//         }

//         .professional-badges {
//           display: flex;
//           gap: 0.375rem;
//           flex-wrap: wrap;
//         }

//         .featured-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.25rem;
//           padding: 0.125rem 0.5rem;
//           background: #fef3c7;
//           color: #92400e;
//           border-radius: 1rem;
//           font-size: 0.7rem;
//           font-weight: 600;
//         }

//         .card-body {
//           padding: 1rem;
//         }

//         .professional-tagline {
//           font-size: 0.85rem;
//           color: #64748b;
//           margin: 0 0 1rem 0;
//           line-height: 1.5;
//         }

//         .professional-contact {
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//           margin-bottom: 1rem;
//           padding-bottom: 1rem;
//           border-bottom: 1px solid #e2e8f0;
//         }

//         .contact-item {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           font-size: 0.85rem;
//           color: #334155;
//         }

//         .contact-item svg {
//           color: #94a3b8;
//           flex-shrink: 0;
//         }

//         .professional-details {
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//           margin-bottom: 1rem;
//         }

//         .detail-item {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 0.85rem;
//         }

//         .detail-label {
//           color: #64748b;
//         }

//         .detail-value {
//           font-weight: 500;
//           color: #0f172a;
//         }

//         .type-value {
//           display: flex;
//           align-items: center;
//           gap: 0.25rem;
//           text-transform: capitalize;
//         }

//         .professional-stats {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 0.5rem;
//           margin-bottom: 1rem;
//           padding: 0.75rem;
//           background: #f8fafc;
//           border-radius: 0.5rem;
//         }

//         .stat {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           text-align: center;
//         }

//         .stat-num {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #0f172a;
//           display: flex;
//           align-items: center;
//           gap: 0.125rem;
//         }

//         .stat-label {
//           font-size: 0.65rem;
//           color: #64748b;
//         }

//         .professional-status {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }

//         .status-item {
//           display: flex;
//           align-items: center;
//           gap: 0.375rem;
//         }

//         .status-dot {
//           width: 0.5rem;
//           height: 0.5rem;
//           border-radius: 50%;
//         }

//         .status-dot.active {
//           background: #22c55e;
//           box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
//         }

//         .status-dot.inactive {
//           background: #ef4444;
//           box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
//         }

//         .status-text {
//           font-size: 0.85rem;
//           font-weight: 500;
//           color: #334155;
//         }

//         .whatsapp-verified {
//           display: flex;
//           align-items: center;
//           gap: 0.25rem;
//           font-size: 0.75rem;
//           color: #22c55e;
//         }

//         .card-footer {
//           padding: 1rem;
//           background: #f8fafc;
//           border-top: 1px solid #e2e8f0;
//         }

//         .card-actions {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 0.375rem;
//         }

//         .action-btn {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 0.25rem;
//           padding: 0.5rem;
//           border-radius: 0.375rem;
//           font-size: 0.65rem;
//           font-weight: 500;
//           cursor: pointer;
//           border: none;
//           background: white;
//           text-decoration: none;
//           transition: all 0.2s ease;
//         }

//         .action-btn.view {
//           color: #3b82f6;
//         }

//         .action-btn.view:hover {
//           background: #eff6ff;
//         }

//         .action-btn.edit {
//           color: #10b981;
//         }

//         .action-btn.edit:hover {
//           background: #f0fdf4;
//         }

//         .action-btn.verify {
//           color: #10b981;
//         }

//         .action-btn.verify:hover {
//           background: #f0fdf4;
//         }

//         .action-btn.delete {
//           color: #ef4444;
//         }

//         .action-btn.delete:hover {
//           background: #fef2f2;
//         }

//         .action-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         /* List View */
//         .professionals-list {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//           overflow-x: auto;
//         }

//         .professionals-table {
//           width: 100%;
//           border-collapse: collapse;
//           min-width: 800px;
//         }

//         .professionals-table th {
//           padding: 1rem;
//           text-align: left;
//           font-size: 0.85rem;
//           font-weight: 600;
//           color: #475569;
//           background: #f8fafc;
//           border-bottom: 2px solid #e2e8f0;
//         }

//         .professionals-table td {
//           padding: 1rem;
//           font-size: 0.9rem;
//           border-bottom: 1px solid #e2e8f0;
//         }

//         .professionals-table tr:last-child td {
//           border-bottom: none;
//         }

//         .professionals-table tr:hover td {
//           background: #f8fafc;
//         }

//         .professional-info {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//         }

//         .professional-avatar {
//           width: 2.5rem;
//           height: 2.5rem;
//           background: #eff6ff;
//           border-radius: 0.5rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .professional-name {
//           font-weight: 500;
//           color: #0f172a;
//           margin-bottom: 0.25rem;
//         }

//         .professional-meta {
//           font-size: 0.75rem;
//           color: #64748b;
//         }

//         .contact-info {
//           display: flex;
//           flex-direction: column;
//           gap: 0.25rem;
//         }

//         .category-type {
//           display: flex;
//           flex-direction: column;
//           gap: 0.25rem;
//         }

//         .category-badge {
//           display: inline-block;
//           padding: 0.125rem 0.5rem;
//           background: #dbeafe;
//           color: #1e40af;
//           border-radius: 0.25rem;
//           font-size: 0.75rem;
//           font-weight: 500;
//           width: fit-content;
//         }

//         .type-badge {
//           font-size: 0.75rem;
//           color: #64748b;
//           text-transform: capitalize;
//         }

//         .stats-list {
//           display: flex;
//           flex-direction: column;
//           gap: 0.25rem;
//           font-size: 0.85rem;
//         }

//         .status-info {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .row-actions {
//           display: flex;
//           gap: 0.375rem;
//         }

//         .icon-btn {
//           width: 2.25rem;
//           height: 2.25rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border: none;
//           border-radius: 0.375rem;
//           background: transparent;
//           color: #64748b;
//           cursor: pointer;
//         }

//         .icon-btn:hover {
//           background: #f1f5f9;
//           color: #3b82f6;
//         }

//         .icon-btn.verify:hover {
//           background: #f0fdf4;
//           color: #10b981;
//         }

//         .icon-btn.delete:hover {
//           background: #fee2e2;
//           color: #ef4444;
//         }

//         /* Pagination */
//         .pagination {
//           margin-top: 2rem;
//           padding: 1rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.75rem;
//         }

//         .pagination-info {
//           text-align: center;
//           color: #64748b;
//           font-size: 0.9rem;
//           margin-bottom: 1rem;
//         }

//         .pagination-controls {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .pagination-btn {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 2.5rem;
//           height: 2.5rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.375rem;
//           color: #1e293b;
//           cursor: pointer;
//         }

//         .pagination-btn:hover:not(:disabled) {
//           background: #f1f5f9;
//           border-color: #3b82f6;
//           color: #3b82f6;
//         }

//         .pagination-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .pagination-numbers {
//           display: flex;
//           gap: 0.25rem;
//         }

//         .pagination-number {
//           min-width: 2.5rem;
//           height: 2.5rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.375rem;
//           background: white;
//           color: #1e293b;
//           cursor: pointer;
//         }

//         .pagination-number.active {
//           background: #3b82f6;
//           border-color: #3b82f6;
//           color: white;
//         }

//         .pagination-number:hover:not(.active) {
//           background: #f1f5f9;
//           border-color: #94a3b8;
//         }

//         /* Modal */
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0,0,0,0.5);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 1000;
//           backdrop-filter: blur(4px);
//         }

//         .modal {
//           background: white;
//           border-radius: 1rem;
//           width: 400px;
//           max-width: 90%;
//           padding: 1.5rem;
//           box-shadow: 0 20px 40px rgba(0,0,0,0.2);
//         }

//         .modal-header {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           margin-bottom: 1rem;
//         }

//         .warning-icon {
//           color: #f97316;
//         }

//         .modal-header h3 {
//           font-size: 1.2rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
//         }

//         .modal-body {
//           margin-bottom: 1.5rem;
//         }

//         .modal-body p {
//           margin: 0 0 0.5rem 0;
//           color: #1e293b;
//         }

//         .warning-text {
//           color: #ef4444 !important;
//           font-size: 0.85rem;
//         }

//         .modal-footer {
//           display: flex;
//           justify-content: flex-end;
//           gap: 0.75rem;
//         }

//         .cancel-btn {
//           padding: 0.625rem 1.25rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 0.375rem;
//           color: #64748b;
//           font-size: 0.9rem;
//           font-weight: 500;
//           cursor: pointer;
//         }

//         .cancel-btn:hover {
//           background: #f1f5f9;
//         }

//         .delete-btn {
//           padding: 0.625rem 1.25rem;
//           background: #ef4444;
//           border: none;
//           border-radius: 0.375rem;
//           color: white;
//           font-size: 0.9rem;
//           font-weight: 500;
//           cursor: pointer;
//         }

//         .delete-btn:hover {
//           background: #dc2626;
//         }

//         .delete-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         /* Utility Classes */
//         .text-yellow-500 {
//           color: #f59e0b;
//         }
//         .text-blue-600 {
//           color: #2563eb;
//         }
//         .text-green-600 {
//           color: #059669;
//         }
//         .text-purple-600 {
//           color: #9333ea;
//         }
//       `}</style>
//     </>
//   );
// }













'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../../../context/AuthContext';
import {
  Search, Filter, Plus, Eye, Edit, CheckCircle, XCircle,
  Phone, Mail, MapPin, Star, Calendar, Users, Shield,
  Trash2, Clock, TrendingUp, Building, UserPlus, ChevronLeft, ChevronRight,
  Download, MoreVertical, AlertCircle, RefreshCw, Award, Briefcase,
  Globe, Map, Check, AlertTriangle, Info, Home, Settings,
  FileText, DollarSign, Percent, Hash, AtSign, Link2,
  Grid, List, Sliders, ChevronDown, X, Tag, Clock as ClockIcon,
  DollarSign as DollarSignIcon, Layers, Building2
} from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 20, 
    total: 0, 
    pages: 0 
  });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    category: searchParams.get('category') || 'all',
    type: searchParams.get('type') || 'all'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [apiError, setApiError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (!isCompanyAdmin && !isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [user, isCompanyAdmin, isSuperAdmin, router]);

  // Categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'beauty', label: 'Beauty & Spa' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'repair', label: 'Repair & Maintenance' },
    { value: 'education', label: 'Education & Training' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'other', label: 'Other' }
  ];

  // Types
  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'physical', label: 'Physical' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'both', label: 'Both' }
  ];

  // Statuses
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch services
  const fetchServices = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    setError('');
    setApiError(null);
    
    try {
      const query = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        companyId: user.companyId
      }).toString();
      
      console.log('Fetching services from:', `/api/bookingService/service?${query}`);
      
      const res = await fetch(`/api/bookingService/service?${query}`, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You don't have permission to view these services");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setServices(data.data || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
        console.log('Fetched services:', data.data.length);
      } else {
        setError(data.error || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setApiError(error.message);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchServices();
      // Update URL with filters
      const params = new URLSearchParams(filters);
      router.replace(`/admin/bookingService/service?${params.toString()}`, { scroll: false });
    }
  }, [filters.search, filters.status, filters.category, filters.type, pagination.page, user]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      type: 'all'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle service actions
  const handleAction = async (id, action, data = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookingService/service?id=${id}&companyId=${user?.companyId}&action=${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ ...data, userId: user?.id })
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message || 'Action completed successfully');
        fetchServices();
      } else {
        alert(`Error: ${result.error || 'Action failed'}`);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!serviceToDelete) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookingService/service?id=${serviceToDelete}&companyId=${user?.companyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message || 'Service deleted successfully');
        setShowDeleteModal(false);
        setServiceToDelete(null);
        fetchServices();
      } else {
        alert(`Error: ${result.error || 'Delete failed'}`);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Delete failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'virtual': return <Globe size={16} className="text-purple-600" />;
      case 'both': return <Layers size={16} className="text-blue-600" />;
      default: return <Briefcase size={16} className="text-green-600" />;
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      beauty: '💅',
      health: '🏥',
      consulting: '💼',
      repair: '🔧',
      education: '📚',
      fitness: '💪',
      other: '📌'
    };
    return icons[category] || '📌';
  };

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
    return `${symbols[currency] || '₹'}${amount}`;
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Export data
  const handleExport = () => {
    alert('Export functionality to be implemented');
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v && v !== 'all' && v !== '').length;
  };

  // Loading state
  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Checking authentication...</p>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
          }
          .spinner {
            width: 3rem;
            height: 3rem;
            border: 3px solid #f1f5f9;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-text {
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Services Management | LFMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
      </Head>

      <div className="services-page">
        {/* Company Context Banner */}
        <div className="company-banner">
          <div className="company-banner-content">
            <div className="company-banner-left">
              <Building2 size={20} className="company-icon" />
              <span className="company-banner-text">
                {isSuperAdmin ? 'Super Admin View' : 'Company Admin View'} - 
                {user?.companyName || 'Your Company'}
              </span>
            </div>
            {isSuperAdmin && (
              <div className="super-admin-badge">
                <Shield size={16} />
                Super Admin
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-title">
              <h1 className="page-title">Services Manager</h1>
              <p className="page-subtitle">
                Manage service offerings and their details for {user?.companyName || 'your company'}
              </p>
            </div>
            <div className="header-actions">
              <button
                onClick={handleExport}
                className="export-btn"
                title="Export Data"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
              <Link
                href="/admin/bookingService/service/create"
                className="add-btn"
              >
                <Plus size={18} />
                <span>Add Service</span>
              </Link>
            </div>
          </div>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="api-error">
            <AlertCircle size={20} />
            <p>{apiError}</p>
            <button onClick={fetchServices} className="retry-btn">
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && !apiError && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <p>{error}</p>
            <button onClick={fetchServices} className="retry-btn">
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Tag size={20} />
            </div>
            <div>
              <span className="stat-label">Total Services</span>
              <span className="stat-value">{pagination.total}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="stat-label">Active</span>
              <span className="stat-value">
                {services.filter(s => s.isActive).length}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <ClockIcon size={20} />
            </div>
            <div>
              <span className="stat-label">Avg Duration</span>
              <span className="stat-value">
                {services.length > 0 
                  ? formatDuration(Math.round(services.reduce((sum, s) => sum + (s.duration || 0), 0) / services.length))
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <DollarSignIcon size={20} />
            </div>
            <div>
              <span className="stat-label">Avg Price</span>
              <span className="stat-value">
                {services.length > 0 
                  ? formatCurrency(Math.round(services.reduce((sum, s) => sum + (s.basePrice || 0), 0) / services.length))
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search services..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            {filters.search && (
              <button onClick={() => handleFilterChange('search', '')} className="clear-search">
                ×
              </button>
            )}
          </div>

          <div className="filter-actions">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-btn ${showFilters ? 'active' : ''}`}
            >
              <Sliders size={16} />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="filter-badge">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            <div className="view-toggle">
              <button 
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>

            <button onClick={fetchServices} className="refresh-btn" title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filters-header">
              <h3>Filter Services</h3>
              {getActiveFilterCount() > 0 && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All
                </button>
              )}
            </div>
            <div className="filters-grid">
              {/* Search */}
              <div className="filter-group">
                <label>Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Name, description, tags..."
                />
              </div>

              {/* Status Filter */}
              <div className="filter-group">
                <label>Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label>Category</label>
                <select 
                  value={filters.category} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="filter-group">
                <label>Service Type</label>
                <select 
                  value={filters.type} 
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="content-area">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading services...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle size={48} />
              <h3>Unable to load services</h3>
              <p>{error}</p>
              <button onClick={fetchServices} className="retry-button">
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <Tag size={48} />
              <h3>No services found</h3>
              <p>
                {getActiveFilterCount() > 0 || filters.search
                  ? 'Try adjusting your filters or search term'
                  : 'Get started by adding your first service'}
              </p>
              <Link
                href="/admin/bookingService/service/create"
                className="create-first-btn"
              >
                <Plus size={16} />
                Add Service
              </Link>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="services-grid">
                  {services.map((service) => (
                    <div key={service._id} className="service-card">
                      <div className="card-header">
                        <div className="card-avatar">
                          <span className="category-icon-large">{getCategoryIcon(service.category)}</span>
                        </div>
                        <div className="card-title">
                          <h3 className="service-name">{service.name}</h3>
                          <div className="service-badges">
                            {service.isPopular && (
                              <span className="popular-badge">
                                <TrendingUp size={10} />
                                Popular
                              </span>
                            )}
                            {getStatusBadge(service.isActive)}
                          </div>
                        </div>
                      </div>

                      <div className="card-body">
                        <p className="service-description">
                          {service.description?.substring(0, 80)}...
                        </p>

                        <div className="service-details">
                          <div className="detail-item">
                            <span className="detail-label">Category</span>
                            <span className="detail-value">{service.category}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Type</span>
                            <span className="detail-value type-value">
                              {getTypeIcon(service.type)}
                              <span>{service.type}</span>
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Price</span>
                            <span className="detail-value price-value">
                              {formatCurrency(service.basePrice, service.currency)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Duration</span>
                            <span className="detail-value">
                              {formatDuration(service.duration)}
                            </span>
                          </div>
                        </div>

                        {service.variations?.length > 0 && (
                          <div className="service-variations">
                            <span className="variations-label">
                              <Briefcase size={12} />
                              {service.variations.length} variation(s)
                            </span>
                          </div>
                        )}

                        {service.tags?.length > 0 && (
                          <div className="service-tags">
                            {service.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="tag">#{tag}</span>
                            ))}
                            {service.tags.length > 3 && (
                              <span className="tag-more">+{service.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div className="service-stats">
                          <div className="stat">
                            <span className="stat-num">{service.totalBookings || 0}</span>
                            <span className="stat-label">Bookings</span>
                          </div>
                          <div className="stat">
                            <span className="stat-num">
                              <Star size={12} className="text-yellow-500" />
                              {service.popularity?.toFixed(1) || '0.0'}
                            </span>
                            <span className="stat-label">Rating</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="card-actions">
                          <Link
                            href={`/admin/bookingService/service/${service._id}`}
                            className="action-btn view"
                            title="View Details"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </Link>
                          <Link
                            href={`/admin/bookingService/service/create?id=${service._id}`}
                            className="action-btn edit"
                            title="Edit"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => {
                              if (service.isActive) {
                                handleAction(service._id, 'deactivate');
                              } else {
                                handleAction(service._id, 'activate');
                              }
                            }}
                            className={`action-btn ${service.isActive ? 'deactivate' : 'activate'}`}
                            disabled={actionLoading}
                          >
                            {service.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            <span>{service.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setServiceToDelete(service._id);
                              setShowDeleteModal(true);
                            }}
                            className="action-btn delete"
                            disabled={actionLoading}
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="services-list">
                  <table className="services-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Bookings</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr key={service._id}>
                          <td>
                            <div className="service-info">
                              <div className="service-avatar">
                                <span className="category-icon">{getCategoryIcon(service.category)}</span>
                              </div>
                              <div>
                                <div className="service-name">{service.name}</div>
                                <div className="service-meta">
                                  {service.description?.substring(0, 30)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="category-badge">{service.category}</span>
                          </td>
                          <td>
                            <span className="price-value">{formatCurrency(service.basePrice, service.currency)}</span>
                          </td>
                          <td>
                            <span className="duration-value">{formatDuration(service.duration)}</span>
                          </td>
                          <td>
                            <span className="bookings-value">{service.totalBookings || 0}</span>
                          </td>
                          <td>
                            {getStatusBadge(service.isActive)}
                          </td>
                          <td>
                            <div className="row-actions">
                              <Link
                                href={`/admin/bookingService/service/${service._id}`}
                                className="icon-btn"
                                title="View"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                href={`/admin/bookingService/service/create?id=${service._id}`}
                                className="icon-btn"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => {
                                  setServiceToDelete(service._id);
                                  setShowDeleteModal(true);
                                }}
                                className="icon-btn delete"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="pagination-numbers">
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
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`pagination-number ${pagination.page === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="pagination-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <AlertCircle size={24} className="warning-icon" />
                <h3>Delete Service</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this service?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleDelete} className="delete-btn" disabled={actionLoading}>
                  {actionLoading ? 'Deleting...' : 'Delete Service'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .services-page {
          width: 100%;
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .services-page {
            padding: 1rem;
          }
        }

        /* Company Banner */
        .company-banner {
          margin-bottom: 1.5rem;
        }

        .company-banner-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .company-banner-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .company-icon {
          color: #3b82f6;
        }

        .company-banner-text {
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f2937;
        }

        .super-admin-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 9999px;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* API Error */
        .api-error {
          margin-bottom: 1.5rem;
          padding: 1rem 1.5rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #b91c1c;
        }

        .api-error p {
          flex: 1;
          margin: 0;
        }

        /* Header */
        .page-header {
          margin-bottom: 1.5rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0.25rem 0 0 0;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .export-btn, .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .export-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .export-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .add-btn {
          background: #3b82f6;
          color: white;
          border: none;
        }

        .add-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 480px) {
          .export-btn span, .add-btn span {
            display: none;
          }
          
          .export-btn, .add-btn {
            padding: 0.625rem;
          }
        }

        /* Error Alert */
        .error-alert {
          margin-bottom: 1.5rem;
          padding: 1rem 1.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #dc2626;
        }

        .error-alert p {
          flex: 1;
          margin: 0;
        }

        .retry-btn {
          background: none;
          border: none;
          color: currentColor;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
        }

        .retry-btn:hover {
          background: rgba(0,0,0,0.05);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .stat-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
        }

        .stat-icon.blue {
          background: #eff6ff;
          color: #3b82f6;
        }

        .stat-icon.green {
          background: #f0fdf4;
          color: #22c55e;
        }

        .stat-icon.orange {
          background: #fff7ed;
          color: #f97316;
        }

        .stat-icon.purple {
          background: #faf5ff;
          color: #a855f7;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.125rem;
        }

        .stat-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* Filters Bar */
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 640px) {
          .filters-bar {
            flex-direction: column;
          }
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 0.625rem 0.75rem 0.625rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          height: 2.75rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .clear-search:hover {
          color: #ef4444;
        }

        .filter-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #1e293b;
          font-size: 0.9rem;
          cursor: pointer;
          position: relative;
          height: 2.75rem;
        }

        .filter-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .filter-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .filter-badge {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          min-width: 1.25rem;
          height: 1.25rem;
          padding: 0 0.25rem;
          background: #ef4444;
          border-radius: 1rem;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-toggle {
          display: flex;
          gap: 0.25rem;
          padding: 0.25rem;
          background: #f1f5f9;
          border-radius: 0.5rem;
        }

        .view-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 0.375rem;
          color: #64748b;
          cursor: pointer;
        }

        .view-btn:hover {
          color: #3b82f6;
        }

        .view-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .refresh-btn {
          padding: 0.625rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #64748b;
          cursor: pointer;
          height: 2.75rem;
          width: 2.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:hover {
          background: #f8fafc;
          color: #3b82f6;
          border-color: #3b82f6;
        }

        /* Advanced Filters */
        .advanced-filters {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .filters-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .clear-filters-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .clear-filters-btn:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .filter-group input,
        .filter-group select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.9rem;
          background: white;
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Content Area */
        .content-area {
          min-height: 400px;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .spinner {
          width: 2.5rem;
          height: 2.5rem;
          border: 3px solid #f1f5f9;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #64748b;
        }

        /* Error State */
        .error-state {
          text-align: center;
          padding: 4rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .error-state svg {
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .error-state h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .error-state p {
          color: #64748b;
          margin: 0 0 1.5rem 0;
        }

        .retry-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .empty-state svg {
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: #64748b;
          margin: 0 0 1.5rem 0;
        }

        .create-first-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .create-first-btn:hover {
          background: #2563eb;
        }

        /* Grid View */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1400px) {
          .services-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .services-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .services-grid {
            grid-template-columns: 1fr;
          }
        }

        .service-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border-color: #3b82f6;
        }

        .card-header {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .card-avatar {
          width: 3rem;
          height: 3rem;
          background: #eff6ff;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .category-icon-large {
          font-size: 1.5rem;
        }

        .card-title {
          flex: 1;
        }

        .service-name {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }

        .service-badges {
          display: flex;
          gap: 0.375rem;
          flex-wrap: wrap;
        }

        .popular-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.125rem 0.5rem;
          background: #fef3c7;
          color: #92400e;
          border-radius: 1rem;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .card-body {
          padding: 1rem;
        }

        .service-description {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .service-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .detail-label {
          color: #64748b;
        }

        .detail-value {
          font-weight: 500;
          color: #0f172a;
        }

        .type-value {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .price-value {
          color: #10b981;
          font-weight: 600;
        }

        .service-variations {
          margin-bottom: 0.5rem;
        }

        .variations-label {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .service-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .tag {
          font-size: 0.65rem;
          padding: 0.125rem 0.375rem;
          background: #f1f5f9;
          color: #334155;
          border-radius: 1rem;
        }

        .tag-more {
          font-size: 0.65rem;
          padding: 0.125rem 0.375rem;
          color: #64748b;
        }

        .service-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 0.5rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-num {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.125rem;
        }

        .stat-label {
          font-size: 0.65rem;
          color: #64748b;
        }

        .text-yellow-500 {
          color: #f59e0b;
        }

        .card-footer {
          padding: 1rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .card-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.375rem;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.65rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: white;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .action-btn.view {
          color: #3b82f6;
        }

        .action-btn.view:hover {
          background: #eff6ff;
        }

        .action-btn.edit {
          color: #10b981;
        }

        .action-btn.edit:hover {
          background: #f0fdf4;
        }

        .action-btn.activate {
          color: #10b981;
        }

        .action-btn.activate:hover {
          background: #f0fdf4;
        }

        .action-btn.deactivate {
          color: #f97316;
        }

        .action-btn.deactivate:hover {
          background: #fff7ed;
        }

        .action-btn.delete {
          color: #ef4444;
        }

        .action-btn.delete:hover {
          background: #fef2f2;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* List View */
        .services-list {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow-x: auto;
        }

        .services-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .services-table th {
          padding: 1rem;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }

        .services-table td {
          padding: 1rem;
          font-size: 0.9rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .services-table tr:last-child td {
          border-bottom: none;
        }

        .services-table tr:hover td {
          background: #f8fafc;
        }

        .service-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .service-avatar {
          width: 2.5rem;
          height: 2.5rem;
          background: #eff6ff;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-icon {
          font-size: 1.2rem;
        }

        .service-name {
          font-weight: 500;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .service-meta {
          font-size: 0.75rem;
          color: #64748b;
        }

        .category-badge {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .price-value {
          font-weight: 600;
          color: #10b981;
        }

        .duration-value {
          color: #64748b;
        }

        .bookings-value {
          font-weight: 500;
        }

        .row-actions {
          display: flex;
          gap: 0.375rem;
        }

        .icon-btn {
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 0.375rem;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .icon-btn:hover {
          background: #f1f5f9;
          color: #3b82f6;
        }

        .icon-btn.delete:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        /* Pagination */
        .pagination {
          margin-top: 2rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .pagination-info {
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          color: #1e293b;
          cursor: pointer;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-numbers {
          display: flex;
          gap: 0.25rem;
        }

        .pagination-number {
          min-width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background: white;
          color: #1e293b;
          cursor: pointer;
        }

        .pagination-number.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .pagination-number:hover:not(.active) {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal {
          background: white;
          border-radius: 1rem;
          width: 400px;
          max-width: 90%;
          padding: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .warning-icon {
          color: #f97316;
        }

        .modal-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .modal-body {
          margin-bottom: 1.5rem;
        }

        .modal-body p {
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .warning-text {
          color: #ef4444 !important;
          font-size: 0.85rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .cancel-btn {
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background: #f1f5f9;
        }

        .delete-btn {
          padding: 0.625rem 1.25rem;
          background: #ef4444;
          border: none;
          border-radius: 0.375rem;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}