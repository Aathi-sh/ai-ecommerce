'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import {
  Search, Filter, Plus, Eye, Edit, CheckCircle, XCircle,
  Phone, Mail, MapPin, Star, Calendar, Users, Shield,
  Trash2, Clock, TrendingUp, Building, UserPlus, ChevronLeft, ChevronRight,
  Download, MoreVertical
} from 'lucide-react';

export default function BookingmngPage() {
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
  const [showFilters, setShowFilters] = useState(false);

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
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'agency', label: 'Agency' }
  ];

  // Statuses
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
    setPagination(prev => ({ ...prev, page: 1 }));
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
        fetchProfessionals();
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusObj?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusObj?.label || status}
      </span>
    );
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'company': return <Building size={16} className="text-blue-600" />;
      case 'freelancer': return <Users size={16} className="text-green-600" />;
      case 'agency': return <Building size={16} className="text-purple-600" />;
      default: return <UserPlus size={16} className="text-gray-600" />;
    }
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

  return (
    <>
      <Head>
        <title>Professionals Management | LFMS</title>
      </Head>

      <div className="professionals-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Professionals Management</h1>
              <p className="page-subtitle">Manage service professionals and their profiles</p>
            </div>
            <div className="header-actions">
              <button
                onClick={handleExport}
                className="export-button"
                title="Export Data"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <Link
                href="/admin/bookingService/bookingmng/create"
                className="add-button"
              >
                <Plus size={20} />
                <span>Add Professional</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Total Professionals</p>
                  <p className="stat-value">{pagination.total}</p>
                </div>
                <div className="stat-icon bg-blue-50">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Verified</p>
                  <p className="stat-value text-green-600">
                    {professionals.filter(p => p.verificationStatus === 'verified').length}
                  </p>
                </div>
                <div className="stat-icon bg-green-50">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Pending</p>
                  <p className="stat-value text-yellow-600">
                    {professionals.filter(p => p.verificationStatus === 'pending').length}
                  </p>
                </div>
                <div className="stat-icon bg-yellow-50">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Avg Rating</p>
                  <p className="stat-value text-purple-600">
                    {professionals.length > 0 
                      ? (professionals.reduce((sum, p) => sum + (p.rating?.average || 0), 0) / professionals.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <div className="stat-icon bg-purple-50">
                  <Star className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filters-header">
            <div className="filters-title">
              <Filter className="text-gray-500" size={20} />
              <h2 className="filters-title-text">Filters</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mobile-filters-toggle"
            >
              <Filter size={20} />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          <div className={`filters-grid ${showFilters ? 'show' : ''}`}>
            {/* Search */}
            <div className="filter-group">
              <label className="filter-label">
                Search Professionals
              </label>
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="search-input"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">
                Verification Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label className="filter-label">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="filter-group">
              <label className="filter-label">
                Professional Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
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

        {/* Professionals List */}
        <div className="professionals-list-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading professionals...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <Users className="error-icon" />
              <h3 className="error-title">Unable to load professionals</h3>
              <p className="error-message">{error}</p>
              <button
                onClick={fetchProfessionals}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          ) : professionals.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <h3 className="empty-title">No professionals found</h3>
              <p className="empty-message">
                {filters.search || filters.status !== 'all' || filters.category !== 'all' || filters.type !== 'all' 
                  ? 'Try adjusting your search filters' 
                  : 'Get started by adding your first professional'}
              </p>
              <Link
                href="/admin/bookingService/bookingmng/create"
                className="empty-action-button"
              >
                <Plus size={20} />
                Add Professional
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-container">
                <table className="professionals-table">
                  <thead>
                    <tr>
                      <th>Professional</th>
                      <th>Contact</th>
                      <th>Category & Type</th>
                      <th>Stats</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.map((professional) => (
                      <tr key={professional._id}>
                        {/* Professional Info */}
                        <td>
                          <div className="professional-info">
                            <div className="professional-avatar">
                              <Building className="text-blue-600" size={24} />
                            </div>
                            <div className="professional-details">
                              <div className="professional-name">
                                <span>{professional.businessName || 'Unnamed Business'}</span>
                                {professional.isFeatured && (
                                  <span className="featured-badge">Featured</span>
                                )}
                              </div>
                              <p className="professional-tagline">
                                {professional.tagline || 'No tagline provided'}
                              </p>
                              <div className="professional-meta">
                                <div className="rating">
                                  <Star size={14} className="text-yellow-500 fill-current" />
                                  <span>{professional.rating?.average?.toFixed(1) || '0.0'}</span>
                                  <span className="reviews">({professional.rating?.totalReviews || 0})</span>
                                </div>
                                <div className="joined-date">
                                  <Calendar size={14} />
                                  <span>Joined {formatDate(professional.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td>
                          <div className="contact-info">
                            <div className="contact-item">
                              <Phone size={16} />
                              <span>{professional.phone || 'N/A'}</span>
                            </div>
                            <div className="contact-item">
                              <Mail size={16} />
                              <span>{professional.email || 'N/A'}</span>
                            </div>
                            {professional.address?.city && (
                              <div className="contact-item">
                                <MapPin size={16} />
                                <span>{professional.address.city}, {professional.address.state || ''}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Category & Type */}
                        <td>
                          <div className="category-type">
                            <span className="category-badge">
                              {professional.category || 'Uncategorized'}
                            </span>
                            <div className="type-info">
                              {getTypeIcon(professional.type)}
                              <span className="type-text">
                                {professional.type || 'individual'}
                              </span>
                            </div>
                            <div className="experience">
                              Experience: {professional.experience || 0} year{professional.experience !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>

                        {/* Stats */}
                        <td>
                          <div className="stats-list">
                            <div className="stat-item">
                              <span>Total Bookings:</span>
                              <span className="stat-value">{professional.totalBookings || 0}</span>
                            </div>
                            <div className="stat-item">
                              <span>Completed:</span>
                              <span className="stat-value green">{professional.completedBookings || 0}</span>
                            </div>
                            <div className="stat-item">
                              <span>Services:</span>
                              <span className="stat-value blue">{professional.services?.length || 0}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <div className="status-info">
                            <div className="status-badge">
                              {getStatusBadge(professional.verificationStatus)}
                            </div>
                            <div className="active-status">
                              <div className={`status-dot ${professional.isActive ? 'active' : 'inactive'}`} />
                              <span className={`status-text ${professional.isActive ? 'active' : 'inactive'}`}>
                                {professional.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {professional.whatsappVerified && (
                              <div className="whatsapp-verified">
                                <Shield size={12} />
                                <span>WhatsApp Verified</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="actions-container">
                            <Link
                              href={`/admin/bookingService/bookingmng/${professional._id}`}
                              className="action-button view"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </Link>
                            
                            <Link
                              href={`/admin/bookingService/bookingmng/${professional._id}/edit`}
                              className="action-button edit"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            
                            {professional.verificationStatus === 'pending' && (
                              <button
                                onClick={() => handleAction(professional._id, 'verify')}
                                className="action-button verify"
                                title="Verify Professional"
                                disabled={actionLoading}
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            
                            {professional.verificationStatus === 'verified' && professional.isActive && (
                              <button
                                onClick={() => handleAction(professional._id, 'suspend', { reason: 'Admin action' })}
                                className="action-button suspend"
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
                              className="action-button delete"
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

              {/* Mobile Card View */}
              <div className="mobile-cards-container">
                {professionals.map((professional) => (
                  <div key={professional._id} className="professional-card">
                    <div className="card-header">
                      <div className="professional-avatar mobile">
                        <Building className="text-blue-600" size={20} />
                      </div>
                      <div className="professional-name-mobile">
                        <span>{professional.businessName || 'Unnamed Business'}</span>
                        <div className="mobile-badges">
                          {professional.isFeatured && (
                            <span className="featured-badge">Featured</span>
                          )}
                          {getStatusBadge(professional.verificationStatus)}
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="card-row">
                        <div className="card-label">Contact</div>
                        <div className="card-value">
                          <div className="contact-item mobile">
                            <Phone size={14} />
                            <span>{professional.phone || 'N/A'}</span>
                          </div>
                          {professional.email && (
                            <div className="contact-item mobile">
                              <Mail size={14} />
                              <span>{professional.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-row">
                        <div className="card-label">Category & Type</div>
                        <div className="card-value">
                          <div className="category-type mobile">
                            <span className="category-badge">
                              {professional.category || 'Uncategorized'}
                            </span>
                            <div className="type-info">
                              {getTypeIcon(professional.type)}
                              <span>{professional.type || 'individual'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-row">
                        <div className="card-label">Stats</div>
                        <div className="card-value">
                          <div className="stats-grid-mobile">
                            <div className="stat-mobile">
                              <span className="stat-label-mobile">Bookings</span>
                              <span className="stat-value-mobile">{professional.totalBookings || 0}</span>
                            </div>
                            <div className="stat-mobile">
                              <span className="stat-label-mobile">Rating</span>
                              <span className="stat-value-mobile">
                                <Star size={12} className="text-yellow-500 fill-current" />
                                {professional.rating?.average?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            <div className="stat-mobile">
                              <span className="stat-label-mobile">Services</span>
                              <span className="stat-value-mobile">{professional.services?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-row">
                        <div className="card-label">Status</div>
                        <div className="card-value">
                          <div className="status-info-mobile">
                            <div className="active-status">
                              <div className={`status-dot ${professional.isActive ? 'active' : 'inactive'}`} />
                              <span>{professional.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            {professional.whatsappVerified && (
                              <div className="whatsapp-verified mobile">
                                <Shield size={12} />
                                <span>WhatsApp Verified</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="mobile-actions">
                        <Link
                          href={`/admin/bookingService/bookingmng/${professional._id}`}
                          className="mobile-action-button view"
                          title="View Details"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </Link>
                        
                        <Link
                          href={`/admin/bookingService/bookingmng/${professional._id}/edit`}
                          className="mobile-action-button edit"
                          title="Edit"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            setProfessionalToDelete(professional._id);
                            setShowDeleteModal(true);
                          }}
                          className="mobile-action-button delete"
                          title="Delete Professional"
                          disabled={actionLoading}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                        
                        <div className="mobile-more-actions">
                          <button className="mobile-more-button">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing <span>{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span>{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span>{pagination.total}</span> professionals
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="pagination-button prev"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
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
                      className="pagination-button next"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-icon">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="modal-title">Delete Professional</h3>
              </div>
              <p className="modal-message">
                Are you sure you want to delete this professional? This action will deactivate their account and remove them from listings. This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProfessionalToDelete(null);
                  }}
                  className="modal-button cancel"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="modal-button delete"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="delete-spinner"></div>
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

      <style jsx>{`
        /* Container Styles */
        .professionals-container {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* Header */
        .page-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .header-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .page-title {
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          font-weight: bold;
          color: #1f2937;
          margin: 0;
          line-height: 1.2;
        }

        .page-subtitle {
          margin-top: 0.5rem;
          color: #6b7280;
          font-size: 0.95rem;
          max-width: 600px;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-button:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .add-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .add-button:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        /* Error Alert */
        .error-alert {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          color: #dc2626;
          font-size: 0.875rem;
        }

        /* Stats */
        .stats-container {
          margin-bottom: 2rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          min-width: 300px;
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            min-width: 200px;
          }
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.25rem;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: bold;
          color: #1f2937;
        }

        .stat-icon {
          padding: 0.75rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Filters */
        .filters-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .filters-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filters-title-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .mobile-filters-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        @media (min-width: 1024px) {
          .mobile-filters-toggle {
            display: none;
          }
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .filters-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .filters-grid.show {
            display: grid;
          }
        }

        @media (max-width: 1023px) {
          .filters-grid:not(.show) {
            display: none;
          }
        }

        .filter-group {
          margin-bottom: 0;
        }

        .filter-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.375rem;
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 0.75rem 0.625rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-select {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Loading State */
        .loading-container {
          padding: 3rem 1rem;
          text-align: center;
        }

        .spinner {
          display: inline-block;
          width: 3rem;
          height: 3rem;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: 1rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Error State */
        .error-state {
          padding: 3rem 1rem;
          text-align: center;
        }

        .error-icon {
          height: 4rem;
          width: 4rem;
          margin: 0 auto 1rem;
          color: #9ca3af;
        }

        .error-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .error-message {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          padding: 0.5rem 1.5rem;
          background: #3b82f6;
          color: white;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s ease;
        }

        .retry-button:hover {
          background: #2563eb;
        }

        /* Empty State */
        .empty-state {
          padding: 3rem 1rem;
          text-align: center;
        }

        .empty-icon {
          height: 4rem;
          width: 4rem;
          margin: 0 auto 1rem;
          color: #9ca3af;
        }

        .empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .empty-message {
          color: #6b7280;
          margin-bottom: 1.5rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .empty-action-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .empty-action-button:hover {
          background: #2563eb;
        }

        /* Desktop Table */
        .desktop-table-container {
          display: block;
        }

        @media (max-width: 1023px) {
          .desktop-table-container {
            display: none;
          }
        }

        .professionals-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .professionals-table th {
          background: #f9fafb;
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
        }

        .professionals-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }

        .professionals-table tr:last-child td {
          border-bottom: none;
        }

        .professionals-table tr:hover {
          background: #f9fafb;
        }

        /* Professional Info */
        .professional-info {
          display: flex;
          gap: 1rem;
        }

        .professional-avatar {
          flex-shrink: 0;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .professional-details {
          flex: 1;
          min-width: 0;
        }

        .professional-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
          flex-wrap: wrap;
        }

        .professional-name span {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.95rem;
        }

        .featured-badge {
          padding: 0.125rem 0.5rem;
          background: #fef3c7;
          color: #92400e;
          font-size: 0.625rem;
          font-weight: 600;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .professional-tagline {
          color: #6b7280;
          font-size: 0.8125rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .professional-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
        }

        .rating span:first-of-type {
          font-weight: 600;
          color: #1f2937;
        }

        .reviews {
          color: #6b7280;
        }

        .joined-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          font-size: 0.8125rem;
        }

        /* Contact Info */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-size: 0.8125rem;
        }

        .contact-item svg {
          flex-shrink: 0;
          color: #9ca3af;
        }

        /* Category & Type */
        .category-type {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 9999px;
        }

        .type-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-size: 0.8125rem;
        }

        .type-text {
          text-transform: capitalize;
          font-weight: 500;
        }

        .experience {
          color: #6b7280;
          font-size: 0.75rem;
        }

        /* Stats */
        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6b7280;
          font-size: 0.8125rem;
        }

        .stat-value {
          font-weight: 600;
          color: #1f2937;
        }

        .stat-value.green {
          color: #059669;
        }

        .stat-value.blue {
          color: #2563eb;
        }

        /* Status */
        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .active-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
        }

        .status-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
        }

        .status-dot.active {
          background: #10b981;
        }

        .status-dot.inactive {
          background: #ef4444;
        }

        .status-text.active {
          color: #059669;
          font-weight: 500;
        }

        .status-text.inactive {
          color: #dc2626;
          font-weight: 500;
        }

        .whatsapp-verified {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #059669;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Actions */
        .actions-container {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-button {
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
        }

        .action-button.view {
          color: #3b82f6;
        }

        .action-button.view:hover {
          background: #eff6ff;
        }

        .action-button.edit {
          color: #10b981;
        }

        .action-button.edit:hover {
          background: #ecfdf5;
        }

        .action-button.verify {
          color: #10b981;
        }

        .action-button.verify:hover {
          background: #ecfdf5;
        }

        .action-button.suspend {
          color: #f59e0b;
        }

        .action-button.suspend:hover {
          background: #fffbeb;
        }

        .action-button.delete {
          color: #ef4444;
        }

        .action-button.delete:hover {
          background: #fef2f2;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile Cards */
        .mobile-cards-container {
          display: none;
        }

        @media (max-width: 1023px) {
          .mobile-cards-container {
            display: block;
          }
        }

        .professional-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .professional-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .professional-avatar.mobile {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .professional-name-mobile {
          flex: 1;
          min-width: 0;
        }

        .professional-name-mobile span {
          display: block;
          font-weight: 600;
          color: #1f2937;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }

        .mobile-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .card-body {
          padding: 1rem;
        }

        .card-row {
          display: flex;
          margin-bottom: 1rem;
        }

        .card-row:last-child {
          margin-bottom: 0;
        }

        .card-label {
          width: 120px;
          flex-shrink: 0;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .card-value {
          flex: 1;
          min-width: 0;
        }

        .contact-item.mobile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-size: 0.8125rem;
          margin-bottom: 0.375rem;
        }

        .contact-item.mobile:last-child {
          margin-bottom: 0;
        }

        .category-type.mobile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .stats-grid-mobile {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .stat-mobile {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label-mobile {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .stat-value-mobile {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .status-info-mobile {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .active-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #374151;
        }

        .whatsapp-verified.mobile {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #059669;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .card-footer {
          padding: 1rem;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .mobile-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .mobile-action-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          background: white;
          cursor: pointer;
        }

        .mobile-action-button.view {
          color: #3b82f6;
        }

        .mobile-action-button.view:hover {
          background: #eff6ff;
        }

        .mobile-action-button.edit {
          color: #10b981;
        }

        .mobile-action-button.edit:hover {
          background: #ecfdf5;
        }

        .mobile-action-button.delete {
          color: #ef4444;
        }

        .mobile-action-button.delete:hover {
          background: #fef2f2;
        }

        .mobile-more-actions {
          flex-shrink: 0;
        }

        .mobile-more-button {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-more-button:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        /* Pagination */
        .pagination-container {
          margin-top: 2rem;
          padding: 1.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
        }

        .pagination-info {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .pagination-info span {
          font-weight: 600;
          color: #374151;
        }

        .pagination-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        @media (min-width: 640px) {
          .pagination-controls {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .pagination-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
          justify-content: center;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .pagination-button.prev {
          order: 1;
        }

        @media (min-width: 640px) {
          .pagination-button.prev {
            order: 0;
          }
        }

        .pagination-button.next {
          order: 3;
        }

        @media (min-width: 640px) {
          .pagination-button.next {
            order: 0;
          }
        }

        .pagination-numbers {
          order: 2;
          display: flex;
          gap: 0.25rem;
          margin: 1rem 0;
        }

        @media (min-width: 640px) {
          .pagination-numbers {
            order: 0;
            margin: 0;
          }
        }

        .pagination-number {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-number.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .pagination-number:hover:not(.active) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        /* Delete Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 50;
        }

        .modal-container {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          max-width: 28rem;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .modal-icon {
          padding: 0.5rem;
          background: #fee2e2;
          border-radius: 0.5rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-message {
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .modal-button {
          padding: 0.625rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .modal-button.cancel {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .modal-button.cancel:hover {
          background: #f9fafb;
        }

        .modal-button.delete {
          background: #dc2626;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-button.delete:hover {
          background: #b91c1c;
        }

        .delete-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Adjustments */
        @media (max-width: 640px) {
          .professionals-container {
            padding: 1rem;
          }
          
          .page-title {
            font-size: 1.5rem;
          }
          
          .header-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .export-button, .add-button {
            width: 100%;
            justify-content: center;
          }
          
          .mobile-actions {
            flex-wrap: wrap;
          }
          
          .mobile-action-button {
            flex: 0 0 calc(33.333% - 0.333rem);
          }
          
          .mobile-more-actions {
            display: none;
          }
        }
      `}</style>
    </>
  );
}