'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Filter, Plus, Eye, Edit, CheckCircle, XCircle,
  Phone, Mail, MapPin, Star, Calendar, Users, Shield,
  Trash2, Clock, TrendingUp, Building, UserPlus
} from 'lucide-react';

export default function ProfessionalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [professionals, setProfessionals] = useState([]);
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
  const [professionalToDelete, setProfessionalToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Categories and types
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

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'agency', label: 'Agency' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch professionals
  const fetchProfessionals = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      }).toString();
      
      const res = await fetch(`/api/bookingService/bookingmng?${query}`);
      const data = await res.json();
      
      if (data.success) {
        setProfessionals(data.data || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      } else {
        setError(data.error || 'Failed to fetch professionals');
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
    // Update URL with filters
    const params = new URLSearchParams(filters);
    router.replace(`/admin/bookingService/bookingmng?${params.toString()}`, { scroll: false });
  }, [filters, pagination.page]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  // Handle professional actions
  const handleAction = async (id, action, data = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookingService/bookingmng?id=${id}&action=${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message || 'Action completed successfully');
        fetchProfessionals(); // Refresh list
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
    if (!professionalToDelete) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookingService/bookingmng?id=${professionalToDelete}`, {
        method: 'DELETE'
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message || 'Professional deleted successfully');
        setShowDeleteModal(false);
        setProfessionalToDelete(null);
        fetchProfessionals();
      } else {
        alert(`Error: ${result.error || 'Delete failed'}`);
      }
    } catch (error) {
      console.error('Error deleting professional:', error);
      alert('Delete failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusObj?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusObj?.label || status}
      </span>
    );
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'company': return <Building size={14} className="text-blue-600" />;
      case 'freelancer': return <Users size={14} className="text-green-600" />;
      case 'agency': return <Building size={14} className="text-purple-600" />;
      default: return <UserPlus size={14} className="text-gray-600" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professionals Management</h1>
          <p className="text-gray-600 mt-2">Manage service professionals and their profiles</p>
        </div>
        <Link
          href="/admin/bookingService/service/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add Professional
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-gray-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Professionals
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Professionals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pagination.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={28} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {professionals.filter(p => p.verificationStatus === 'verified').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {professionals.filter(p => p.verificationStatus === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-600" size={28} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {professionals.length > 0 
                  ? (professionals.reduce((sum, p) => sum + (p.rating?.average || 0), 0) / professionals.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Star className="text-purple-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Professionals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading professionals...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load professionals</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchProfessionals}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : professionals.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No professionals found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status !== 'all' || filters.category !== 'all' || filters.type !== 'all' 
                ? 'Try adjusting your search filters' 
                : 'Get started by adding your first professional'}
            </p>
            <Link
              href="/admin/bookingService/service/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Professional
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Professional
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category & Type
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professionals.map((professional) => (
                  <tr 
                    key={professional._id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Professional Info */}
                    <td className="px-8 py-5">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center shadow-sm">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-base font-semibold text-gray-900 truncate">
                              {professional.businessName || 'Unnamed Business'}
                            </p>
                            {professional.featured && (
                              <span className="px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2 truncate">
                            {professional.tagline || 'No tagline provided'}
                          </p>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-900">
                                {professional.rating?.average?.toFixed(1) || '0.0'}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({professional.rating?.totalReviews || 0} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Joined {formatDate(professional.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-8 py-5">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 font-medium truncate">
                            {professional.phone || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate">
                            {professional.email || 'N/A'}
                          </span>
                        </div>
                        {professional.address?.city && (
                          <div className="flex items-center gap-3">
                            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {professional.address.city}, {professional.address.state || ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category & Type */}
                    <td className="px-8 py-5">
                      <div className="space-y-3">
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {professional.category || 'Uncategorized'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {getTypeIcon(professional.type)}
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {professional.type || 'individual'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Experience: {professional.experience || 0} year{professional.experience !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-8 py-5">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Bookings:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {professional.totalBookings || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Completed:</span>
                          <span className="text-sm font-semibold text-green-600">
                            {professional.completedBookings || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Services:</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {professional.services?.length || 0}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5">
                      <div className="space-y-3">
                        <div>
                          {getStatusBadge(professional.verificationStatus)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${professional.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-xs font-medium ${professional.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {professional.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {professional.whatsappVerified && (
                          <div className="flex items-center gap-1.5 text-xs text-green-600">
                            <Shield size={12} />
                            WhatsApp Verified
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/bookingService/bookingmng/${professional._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        <Link
                          href={`/admin/bookingService/bookingmng/${professional._id}/edit`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        
                        {professional.verificationStatus === 'pending' && (
                          <button
                            onClick={() => handleAction(professional._id, 'verify')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Verify Professional"
                            disabled={actionLoading}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        
                        {professional.verificationStatus === 'verified' && professional.isActive && (
                          <button
                            onClick={() => handleAction(professional._id, 'suspend', { reason: 'Admin action' })}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Suspend Professional"
                            disabled={actionLoading}
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setProfessionalToDelete(professional._id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Professional"
                          disabled={actionLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && professionals.length > 0 && pagination.pages > 1 && (
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-semibold">{pagination.total}</span> professionals
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
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
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Professional</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this professional? This action will deactivate their account and remove them from listings. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProfessionalToDelete(null);
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Professional'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}