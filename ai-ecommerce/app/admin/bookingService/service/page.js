'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Star,
  ChevronLeft, ChevronRight, MoreVertical, AlertCircle,
  CheckCircle, XCircle, Clock, DollarSign, Tag, Briefcase,
  RefreshCw, Download, Sliders, Grid, List, MapPin,
  Calendar, Users, Award, Zap, Shield, Settings
} from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedServices, setSelectedServices] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'beauty', label: 'Beauty & Spa', icon: '💅', color: '#ec4899' },
    { value: 'health', label: 'Health & Wellness', icon: '🏥', color: '#10b981' },
    { value: 'consulting', label: 'Consulting', icon: '💼', color: '#f59e0b' },
    { value: 'repair', label: 'Repair & Maintenance', icon: '🔧', color: '#6b7280' },
    { value: 'education', label: 'Education & Training', icon: '📚', color: '#3b82f6' },
    { value: 'fitness', label: 'Fitness', icon: '💪', color: '#ef4444' },
    { value: 'other', label: 'Other', icon: '📌', color: '#8b5cf6' }
  ];

  // Service Types
  const serviceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'physical', label: 'Physical', icon: '📍' },
    { value: 'virtual', label: 'Virtual', icon: '💻' },
    { value: 'both', label: 'Both', icon: '🔄' }
  ];

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active', icon: '✅' },
    { value: 'inactive', label: 'Inactive', icon: '❌' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'basePrice', label: 'Price' },
    { value: 'duration', label: 'Duration' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'totalBookings', label: 'Bookings' }
  ];

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, [filters, pagination.page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        category: filters.category,
        type: filters.type,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const res = await fetch(`/api/bookingService/service?${params}`);
      const data = await res.json();

      if (data.success) {
        setServices(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      type: 'all',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchServices();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle service selection
  const toggleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(s => s._id));
    }
  };

  const toggleSelectService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  // Handle delete
  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const res = await fetch(`/api/bookingService/service?id=${serviceToDelete._id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        setServices(prev => prev.filter(s => s._id !== serviceToDelete._id));
        setShowDeleteModal(false);
        setServiceToDelete(null);
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedServices.map(id =>
        fetch(`/api/bookingService/service?id=${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      setServices(prev => prev.filter(s => !selectedServices.includes(s._id)));
      setSelectedServices([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete selected services');
    }
  };

  // Toggle service status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/bookingService/service?id=${id}&action=${currentStatus ? 'deactivate' : 'activate'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await res.json();

      if (data.success) {
        setServices(prev =>
          prev.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s)
        );
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get category details
  const getCategoryDetails = (categoryValue) => {
    return categories.find(c => c.value === categoryValue) || categories[categories.length - 1];
  };

  // Get service type icon
  const getTypeIcon = (type) => {
    const typeObj = serviceTypes.find(t => t.value === type);
    return typeObj?.icon || '📍';
  };

  return (
    <>
      <Head>
        <title>Services Management | LFMS</title>
      </Head>

      <div className="services-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Services</h1>
            <p className="page-subtitle">Manage your service offerings</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => router.push('/admin/bookingService/service/create')}
              className="create-btn"
            >
              <Plus size={18} />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Briefcase size={20} />
            </div>
            <div>
              <span className="stat-label">Total Services</span>
              <span className="stat-value">{pagination.total || 0}</span>
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
              <Clock size={20} />
            </div>
            <div>
              <span className="stat-label">Avg Duration</span>
              <span className="stat-value">
                {services.length > 0 
                  ? formatDuration(services.reduce((acc, s) => acc + (s.duration || 0), 0) / services.length)
                  : '0 min'}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="stat-label">Avg Price</span>
              <span className="stat-value">
                {services.length > 0
                  ? formatCurrency(services.reduce((acc, s) => acc + (s.basePrice || 0), 0) / services.length)
                  : formatCurrency(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedServices.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
            </span>
            <div className="bulk-buttons">
              <button onClick={() => setShowBulkDeleteModal(true)} className="bulk-delete">
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

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
              {Object.values(filters).filter(v => v && v !== 'all' && v !== '').length > 0 && (
                <span className="filter-badge">
                  {Object.values(filters).filter(v => v && v !== 'all' && v !== '').length}
                </span>
              )}
            </button>

            <div className="view-toggle">
              <button 
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
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

            <div className="filter-group">
              <label>Service Type</label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                {serviceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="content-area">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={48} />
              <h3>No services found</h3>
              <p>Get started by creating your first service</p>
              <button 
                onClick={() => router.push('/admin/bookingService/service/create')}
                className="create-first-btn"
              >
                <Plus size={16} />
                Add Service
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="services-grid">
              {services.map(service => {
                const category = getCategoryDetails(service.category);
                return (
                  <div key={service._id} className="service-card">
                    <div className="card-header">
                      <div className="card-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service._id)}
                          onChange={() => toggleSelectService(service._id)}
                        />
                      </div>
                      <div className="card-actions">
                        <button 
                          onClick={() => toggleStatus(service._id, service.isActive)}
                          className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}
                          title={service.isActive ? 'Active' : 'Inactive'}
                        >
                          {service.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/bookingService/service/${service._id}`)}
                          className="action-btn"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/bookingService/service/${service._id}/edit`)}
                          className="action-btn"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(service)}
                          className="action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="category-icon" style={{ backgroundColor: category.color + '20', color: category.color }}>
                        {category.icon}
                      </div>
                      <h3 className="service-name">{service.name}</h3>
                      <p className="service-description">
                        {service.description?.substring(0, 60)}...
                      </p>

                      <div className="service-meta">
                        <div className="meta-item">
                          <DollarSign size={14} />
                          <span>{formatCurrency(service.basePrice, service.currency)}</span>
                        </div>
                        <div className="meta-item">
                          <Clock size={14} />
                          <span>{formatDuration(service.duration)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="type-badge">
                            {getTypeIcon(service.type)} {service.type}
                          </span>
                        </div>
                      </div>

                      {service.tags && service.tags.length > 0 && (
                        <div className="service-tags">
                          {service.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="tag">#{tag}</span>
                          ))}
                          {service.tags.length > 3 && (
                            <span className="tag more">+{service.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <div className="stats">
                        <div className="stat" title="Bookings">
                          <Users size={14} />
                          <span>{service.totalBookings || 0}</span>
                        </div>
                        <div className="stat" title="Popularity">
                          <Award size={14} />
                          <span>{service.popularity || 0}</span>
                        </div>
                      </div>
                      <span className="date">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="services-list">
              <table className="services-table">
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedServices.length === services.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
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
                  {services.map(service => {
                    const category = getCategoryDetails(service.category);
                    return (
                      <tr key={service._id}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service._id)}
                            onChange={() => toggleSelectService(service._id)}
                          />
                        </td>
                        <td>
                          <div className="service-info">
                            <span className="service-icon">{category.icon}</span>
                            <div>
                              <div className="service-name">{service.name}</div>
                              <div className="service-sub">
                                {service.subcategory && <span>{service.subcategory}</span>}
                                {service.tags && service.tags.length > 0 && (
                                  <span>• {service.tags.slice(0, 2).join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-tag" style={{ backgroundColor: category.color + '20', color: category.color }}>
                            {category.label}
                          </span>
                        </td>
                        <td>
                          <span className="price">
                            {formatCurrency(service.basePrice, service.currency)}
                          </span>
                        </td>
                        <td>
                          <span className="duration">
                            <Clock size={12} />
                            {formatDuration(service.duration)}
                          </span>
                        </td>
                        <td>
                          <span className="bookings">
                            <Users size={12} />
                            {service.totalBookings || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button 
                              onClick={() => toggleStatus(service._id, service.isActive)}
                              className="icon-btn"
                              title={service.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {service.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button 
                              onClick={() => router.push(`/admin/bookingService/service/${service._id}`)}
                              className="icon-btn"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => router.push(`/admin/bookingService/service/${service._id}/edit`)}
                              className="icon-btn"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => confirmDelete(service)}
                              className="icon-btn delete"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="page-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <AlertCircle size={24} className="warning-icon" />
              <h3>Delete Service</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{serviceToDelete?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleDelete} className="delete-btn">
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <AlertCircle size={24} className="warning-icon" />
              <h3>Delete Selected Services</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete {selectedServices.length} selected services?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowBulkDeleteModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleBulkDelete} className="delete-btn">
                Delete {selectedServices.length} Services
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .services-page {
          width: 100%;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .page-title {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          margin: 4px 0 0;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .create-btn:hover {
          background: #2563eb;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
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
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 1.3rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* Bulk Actions */
        .bulk-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .selected-count {
          font-size: 0.9rem;
          font-weight: 500;
          color: #1e40af;
        }

        .bulk-delete {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 0.8rem;
          cursor: pointer;
        }

        /* Filters Bar */
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
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
          padding: 10px 36px 10px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .filter-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #1e293b;
          font-size: 0.9rem;
          cursor: pointer;
          position: relative;
        }

        .filter-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: #ef4444;
          border-radius: 20px;
          color: white;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: #f1f5f9;
          border-radius: 8px;
        }

        .view-btn {
          padding: 6px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
        }

        .view-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .refresh-btn {
          padding: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
        }

        /* Advanced Filters */
        .advanced-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #1e293b;
        }

        .filter-group select,
        .filter-group input {
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .price-range {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .price-range input {
          width: 80px;
        }

        .price-range span {
          color: #64748b;
        }

        .clear-filters {
          padding: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          font-size: 0.85rem;
          cursor: pointer;
          align-self: flex-end;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 16px;
          border: 3px solid #f1f5f9;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #64748b;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .empty-state svg {
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.2rem;
          color: #1e293b;
          margin: 0 0 8px;
        }

        .empty-state p {
          color: #64748b;
          margin: 0 0 20px;
        }

        .create-first-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #3b82f6;
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        /* Grid View */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
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
          border-radius: 12px;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .card-checkbox input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .card-actions {
          display: flex;
          gap: 6px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .status-badge.active {
          background: #f0fdf4;
          color: #22c55e;
        }

        .status-badge.inactive {
          background: #fef2f2;
          color: #ef4444;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
        }

        .action-btn:hover {
          background: #f1f5f9;
        }

        .action-btn.delete:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .card-body {
          padding: 16px;
        }

        .category-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 1.2rem;
          margin-bottom: 12px;
        }

        .service-name {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .service-description {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 12px;
          line-height: 1.4;
        }

        .service-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #1e293b;
        }

        .type-badge {
          text-transform: capitalize;
        }

        .service-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .tag {
          padding: 2px 6px;
          background: #f1f5f9;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #64748b;
        }

        .tag.more {
          background: #e2e8f0;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .stats {
          display: flex;
          gap: 12px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        /* List View */
        .services-list {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow-x: auto;
        }

        .services-table {
          width: 100%;
          border-collapse: collapse;
        }

        .services-table th {
          padding: 16px;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .services-table td {
          padding: 16px;
          font-size: 0.9rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .checkbox-cell {
          width: 40px;
          text-align: center;
        }

        .checkbox-cell input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .service-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .service-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 1rem;
        }

        .service-name {
          font-weight: 500;
          color: #0f172a;
        }

        .service-sub {
          font-size: 0.75rem;
          color: #64748b;
        }

        .category-tag {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .price {
          font-weight: 600;
          color: #0f172a;
        }

        .duration,
        .bookings {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 0.85rem;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: #f0fdf4;
          color: #22c55e;
        }

        .status-badge.inactive {
          background: #fef2f2;
          color: #ef4444;
        }

        .row-actions {
          display: flex;
          gap: 6px;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
        }

        .icon-btn:hover {
          background: #f1f5f9;
        }

        .icon-btn.delete:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1e293b;
          cursor: pointer;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 0.9rem;
          color: #64748b;
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
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 400px;
          max-width: 90%;
          padding: 24px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .warning-icon {
          color: #f97316;
        }

        .modal-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
        }

        .modal-body {
          margin-bottom: 24px;
        }

        .modal-body p {
          margin: 0 0 8px;
          color: #1e293b;
        }

        .warning-text {
          color: #ef4444 !important;
          font-size: 0.85rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .cancel-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
        }

        .delete-btn {
          padding: 8px 16px;
          background: #ef4444;
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}