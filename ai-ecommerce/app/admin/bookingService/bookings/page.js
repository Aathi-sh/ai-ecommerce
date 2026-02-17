'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import {
  Search, Filter, Plus, Eye, Edit, CheckCircle, XCircle,
  Phone, Mail, MapPin, Star, Calendar, Users, Shield,
  Trash2, Clock, TrendingUp, Building, UserPlus, ChevronLeft, ChevronRight,
  Download, MoreVertical, DollarSign, CreditCard, AlertCircle,
  RefreshCw, Calendar as CalendarIcon, Wallet, Zap
} from 'lucide-react';

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bookings, setBookings] = useState([]);
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
    paymentStatus: searchParams.get('paymentStatus') || 'all',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Status options
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800', icon: '🔄' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: '🎉' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
    { value: 'no_show', label: 'No Show', color: 'bg-orange-100 text-orange-800', icon: '🚫' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: '💰' },
    { value: 'disputed', label: 'Disputed', color: 'bg-pink-100 text-pink-800', icon: '⚠️' }
  ];

  // Payment status options
  const paymentStatuses = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'partial', label: 'Partial', color: 'bg-orange-100 text-orange-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      }).toString();
      
      const res = await fetch(`/api/bookingService/bookings?${query}`);
      const data = await res.json();
      
      if (data.success) {
        setBookings(data.data || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      } else {
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const params = new URLSearchParams(filters);
    router.replace(`/admin/bookingService/bookings?${params.toString()}`, { scroll: false });
  }, [filters, pagination.page]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentStatus: 'all',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle booking actions
  const handleAction = async (id, action, data = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookingService/bookings?id=${id}&action=${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message || 'Action completed successfully');
        fetchBookings();
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

  // Handle delete (cancel)
  const handleDelete = async () => {
    if (!bookingToDelete) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookingService/bookings?id=${bookingToDelete}`, {
        method: 'DELETE'
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message || 'Booking cancelled successfully');
        setShowDeleteModal(false);
        setBookingToDelete(null);
        fetchBookings();
      } else {
        alert(`Error: ${result.error || 'Cancel failed'}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Cancel failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (selectedBookings.length === 0) return;
    
    setActionLoading(true);
    try {
      const promises = selectedBookings.map(id => 
        fetch(`/api/bookingService/bookings?id=${id}&action=${action}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
      );
      
      await Promise.all(promises);
      alert(`Bulk ${action} completed successfully`);
      setSelectedBookings([]);
      setShowBulkModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error in bulk action:', error);
      alert('Bulk action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(b => b._id));
    }
  };

  // Toggle select single
  const toggleSelect = (id) => {
    setSelectedBookings(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusObj?.color || 'bg-gray-100 text-gray-800'}`}>
        <span className="mr-1">{statusObj?.icon}</span>
        {statusObj?.label || status}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentBadge = (status, amount, total) => {
    const statusObj = paymentStatuses.find(s => s.value === status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusObj?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusObj?.label || status}
        {status === 'partial' && amount && total && (
          <span className="ml-1">(₹{amount}/{total})</span>
        )}
      </span>
    );
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

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
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

  // Calculate stats
  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const revenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    return { total, pending, completed, cancelled, revenue };
  };

  const stats = getStats();

  return (
    <>
      <Head>
        <title>Bookings Management | LFMS</title>
      </Head>

      <div className="bookings-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Bookings Management</h1>
              <p className="page-subtitle">Manage all customer bookings and appointments</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => window.location.reload()}
                className="refresh-button"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
              <Link
                href="/admin/bookingService/bookings/create"
                className="add-button"
              >
                <Plus size={20} />
                <span>New Booking</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Total Bookings</p>
                  <p className="stat-value">{stats.total}</p>
                </div>
                <div className="stat-icon bg-blue-50">
                  <Calendar className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Pending</p>
                  <p className="stat-value text-yellow-600">{stats.pending}</p>
                </div>
                <div className="stat-icon bg-yellow-50">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Completed</p>
                  <p className="stat-value text-green-600">{stats.completed}</p>
                </div>
                <div className="stat-icon bg-green-50">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Revenue</p>
                  <p className="stat-value text-purple-600">{formatCurrency(stats.revenue)}</p>
                </div>
                <div className="stat-icon bg-purple-50">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">
              {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''} selected
            </span>
            <div className="bulk-buttons">
              <button
                onClick={() => setShowBulkModal(true)}
                className="bulk-action-btn confirm"
              >
                <CheckCircle size={16} />
                Confirm Selected
              </button>
              <button
                onClick={() => handleBulkAction('complete')}
                className="bulk-action-btn complete"
                disabled={actionLoading}
              >
                <Zap size={16} />
                Complete
              </button>
              <button
                onClick={() => {
                  if (confirm(`Cancel ${selectedBookings.length} bookings?`)) {
                    handleBulkAction('cancel');
                  }
                }}
                className="bulk-action-btn cancel"
                disabled={actionLoading}
              >
                <XCircle size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-container">
          <div className="filters-header">
            <div className="filters-title">
              <Filter className="text-gray-500" size={20} />
              <h2 className="filters-title-text">Filters</h2>
            </div>
            <div className="filters-right">
              {(filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.startDate || filters.endDate) && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="mobile-filters-toggle"
              >
                <Filter size={20} />
                <span>{showFilters ? 'Hide' : 'Show'}</span>
              </button>
            </div>
          </div>

          <div className={`filters-grid ${showFilters ? 'show' : ''}`}>
            {/* Search */}
            <div className="filter-group full-width">
              <label className="filter-label">Search</label>
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by booking number or service..."
                  className="search-input"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Booking Status</label>
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

            {/* Payment Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="filter-select"
              >
                {paymentStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="filter-group">
              <label className="filter-label">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="filter-date"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="filter-date"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bookings-list-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle className="error-icon" />
              <h3 className="error-title">Unable to load bookings</h3>
              <p className="error-message">{error}</p>
              <button
                onClick={fetchBookings}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <Calendar className="empty-icon" />
              <h3 className="empty-title">No bookings found</h3>
              <p className="empty-message">
                {filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.startDate || filters.endDate
                  ? 'Try adjusting your search filters'
                  : 'Get started by creating your first booking'}
              </p>
              <Link
                href="/admin/bookingService/bookings/create"
                className="empty-action-button"
              >
                <Plus size={20} />
                New Booking
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedBookings.length === bookings.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Booking ID</th>
                      <th>Client</th>
                      <th>Professional</th>
                      <th>Service</th>
                      <th>Date & Time</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking._id)}
                            onChange={() => toggleSelect(booking._id)}
                          />
                        </td>
                        <td>
                          <span className="booking-number">{booking.bookingNumber}</span>
                        </td>
                        <td>
                          <div className="client-info">
                            <div className="client-avatar">
                              {booking.clientId?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="client-name">{booking.clientId?.name || 'Unknown'}</div>
                              <div className="client-contact">
                                <Phone size={12} />
                                <span>{booking.clientId?.phone || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="professional-info">
                            <div className="professional-name">{booking.professionalId?.businessName || 'Unknown'}</div>
                            <div className="professional-category">{booking.professionalId?.category || ''}</div>
                          </div>
                        </td>
                        <td>
                          <div className="service-info">
                            <div className="service-name">{booking.serviceName || booking.serviceId?.name}</div>
                            {booking.selectedVariation && (
                              <div className="service-variation">({booking.selectedVariation.name})</div>
                            )}
                            {booking.selectedAddons?.length > 0 && (
                              <div className="service-addons">+{booking.selectedAddons.length} addon(s)</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="datetime-info">
                            <div className="date">
                              <Calendar size={14} />
                              {formatDate(booking.scheduledDate)}
                            </div>
                            <div className="time">
                              <Clock size={14} />
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="amount">{formatCurrency(booking.totalAmount)}</span>
                        </td>
                        <td>
                          {getStatusBadge(booking.status)}
                        </td>
                        <td>
                          {getPaymentBadge(booking.paymentStatus, booking.paidAmount, booking.totalAmount)}
                        </td>
                        <td>
                          <div className="actions-container">
                            <Link
                              href={`/admin/bookingService/bookings/${booking._id}`}
                              className="action-button view"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </Link>
                            
                            <Link
                              href={`/admin/bookingService/bookings/${booking._id}/edit`}
                              className="action-button edit"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleAction(booking._id, 'confirm')}
                                className="action-button confirm"
                                title="Confirm Booking"
                                disabled={actionLoading}
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleAction(booking._id, 'start')}
                                className="action-button start"
                                title="Start Service"
                                disabled={actionLoading}
                              >
                                <Zap size={18} />
                              </button>
                            )}
                            
                            {booking.status === 'in_progress' && (
                              <button
                                onClick={() => handleAction(booking._id, 'complete')}
                                className="action-button complete"
                                title="Complete Booking"
                                disabled={actionLoading}
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            
                            {booking.paymentStatus === 'pending' && (
                              <button
                                onClick={() => {
                                  const amount = prompt('Enter amount paid:', booking.totalAmount);
                                  if (amount) {
                                    handleAction(booking._id, 'mark-paid', { amount: parseFloat(amount) });
                                  }
                                }}
                                className="action-button payment"
                                title="Mark as Paid"
                                disabled={actionLoading}
                              >
                                <DollarSign size={18} />
                              </button>
                            )}
                            
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  setBookingToDelete(booking._id);
                                  setShowDeleteModal(true);
                                }}
                                className="action-button cancel"
                                title="Cancel Booking"
                                disabled={actionLoading}
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-cards-container">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="card-header">
                      <div className="card-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking._id)}
                          onChange={() => toggleSelect(booking._id)}
                        />
                      </div>
                      <div className="booking-number-mobile">
                        {booking.bookingNumber}
                      </div>
                      <div className="card-status">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>

                    <div className="card-body">
                      {/* Client */}
                      <div className="card-row">
                        <div className="card-label">Client</div>
                        <div className="card-value">
                          <div className="client-info-mobile">
                            <div className="client-avatar-mobile">
                              {booking.clientId?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="client-name-mobile">{booking.clientId?.name || 'Unknown'}</div>
                              <div className="client-phone-mobile">{booking.clientId?.phone || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional */}
                      <div className="card-row">
                        <div className="card-label">Professional</div>
                        <div className="card-value">
                          <div className="professional-name-mobile">
                            {booking.professionalId?.businessName || 'Unknown'}
                          </div>
                          <div className="professional-category-mobile">
                            {booking.professionalId?.category || ''}
                          </div>
                        </div>
                      </div>

                      {/* Service */}
                      <div className="card-row">
                        <div className="card-label">Service</div>
                        <div className="card-value">
                          <div className="service-name-mobile">
                            {booking.serviceName || booking.serviceId?.name}
                          </div>
                          {booking.selectedVariation && (
                            <div className="service-variation-mobile">
                              Variation: {booking.selectedVariation.name} (+{formatCurrency(booking.selectedVariation.price)})
                            </div>
                          )}
                          {booking.selectedAddons?.length > 0 && (
                            <div className="service-addons-mobile">
                              Addons: {booking.selectedAddons.length}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="card-row">
                        <div className="card-label">When</div>
                        <div className="card-value">
                          <div className="datetime-mobile">
                            <CalendarIcon size={14} />
                            {formatDate(booking.scheduledDate)}
                          </div>
                          <div className="datetime-mobile">
                            <Clock size={14} />
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </div>

                      {/* Amount & Payment */}
                      <div className="card-row">
                        <div className="card-label">Payment</div>
                        <div className="card-value">
                          <div className="amount-mobile">
                            {formatCurrency(booking.totalAmount)}
                          </div>
                          <div className="payment-status-mobile">
                            {getPaymentBadge(booking.paymentStatus, booking.paidAmount, booking.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="mobile-actions">
                        <Link
                          href={`/admin/bookingService/bookings/${booking._id}`}
                          className="mobile-action-button view"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </Link>
                        
                        <Link
                          href={`/admin/bookingService/bookings/${booking._id}/edit`}
                          className="mobile-action-button edit"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </Link>
                        
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleAction(booking._id, 'confirm')}
                            className="mobile-action-button confirm"
                            disabled={actionLoading}
                          >
                            <CheckCircle size={16} />
                            <span>Confirm</span>
                          </button>
                        )}
                        
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => {
                              setBookingToDelete(booking._id);
                              setShowDeleteModal(true);
                            }}
                            className="mobile-action-button cancel"
                            disabled={actionLoading}
                          >
                            <XCircle size={16} />
                            <span>Cancel</span>
                          </button>
                        )}
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
                    <span>{pagination.total}</span> bookings
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

        {/* Cancel Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-icon warning">
                  <AlertCircle className="text-orange-600" size={24} />
                </div>
                <h3 className="modal-title">Cancel Booking</h3>
              </div>
              <p className="modal-message">
                Are you sure you want to cancel this booking? This action can be reversed by re-confirming the booking.
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBookingToDelete(null);
                  }}
                  className="modal-button cancel"
                  disabled={actionLoading}
                >
                  Close
                </button>
                <button
                  onClick={handleDelete}
                  className="modal-button delete"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="spinner-small"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Modal */}
        {showBulkModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-icon info">
                  <CheckCircle className="text-blue-600" size={24} />
                </div>
                <h3 className="modal-title">Confirm Bulk Action</h3>
              </div>
              <p className="modal-message">
                Are you sure you want to confirm {selectedBookings.length} selected booking{selectedBookings.length > 1 ? 's' : ''}?
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="modal-button cancel"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkAction('confirm')}
                  className="modal-button confirm"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Confirm All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bookings-container {
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
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .header-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .page-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .page-subtitle {
          margin-top: 0.25rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-button:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .add-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: #3b82f6;
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .add-button:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        /* Error Alert */
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          color: #b91c1c;
          margin-bottom: 1.5rem;
        }

        /* Stats */
        .stats-container {
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          min-width: 300px;
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
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        /* Bulk Actions */
        .bulk-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .selected-count {
          font-weight: 500;
          color: #1e40af;
        }

        .bulk-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .bulk-action-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bulk-action-btn.confirm {
          background: #dbeafe;
          color: #1e40af;
        }

        .bulk-action-btn.confirm:hover {
          background: #bfdbfe;
        }

        .bulk-action-btn.complete {
          background: #dcfce7;
          color: #166534;
        }

        .bulk-action-btn.complete:hover {
          background: #bbf7d0;
        }

        .bulk-action-btn.cancel {
          background: #fee2e2;
          color: #991b1b;
        }

        .bulk-action-btn.cancel:hover {
          background: #fecaca;
        }

        .bulk-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Filters */
        .filters-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
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
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .filters-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .clear-filters-btn {
          padding: 0.4rem 0.8rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .clear-filters-btn:hover {
          background: #e2e8f0;
        }

        .mobile-filters-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          font-size: 0.9rem;
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
          
          .filters-grid .full-width {
            grid-column: span 1;
          }
        }

        @media (max-width: 1023px) {
          .filters-grid:not(.show) {
            display: none;
          }
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .filter-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #1e293b;
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.6rem 0.75rem 0.6rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-select,
        .filter-date {
          padding: 0.6rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }

        .filter-select:focus,
        .filter-date:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Loading State */
        .loading-container {
          text-align: center;
          padding: 4rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 1rem;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #64748b;
        }

        /* Error State */
        .error-state {
          text-align: center;
          padding: 4rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .error-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          color: #ef4444;
        }

        .error-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .error-message {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          padding: 0.6rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        .retry-button:hover {
          background: #2563eb;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          color: #94a3b8;
        }

        .empty-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .empty-message {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .empty-action-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: #3b82f6;
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
        }

        /* Desktop Table */
        .desktop-table-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow-x: auto;
        }

        @media (max-width: 1023px) {
          .desktop-table-container {
            display: none;
          }
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .bookings-table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .bookings-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.9rem;
        }

        .bookings-table tr:last-child td {
          border-bottom: none;
        }

        .bookings-table tr:hover {
          background: #f8fafc;
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

        .booking-number {
          font-family: monospace;
          font-weight: 600;
          color: #0f172a;
        }

        /* Client Info */
        .client-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .client-avatar {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-weight: 600;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .client-name {
          font-weight: 500;
          color: #0f172a;
        }

        .client-contact {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #64748b;
          font-size: 0.75rem;
          margin-top: 0.2rem;
        }

        /* Professional Info */
        .professional-info {
          display: flex;
          flex-direction: column;
        }

        .professional-name {
          font-weight: 500;
          color: #0f172a;
        }

        .professional-category {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Service Info */
        .service-info {
          display: flex;
          flex-direction: column;
        }

        .service-name {
          font-weight: 500;
          color: #0f172a;
        }

        .service-variation {
          font-size: 0.75rem;
          color: #8b5cf6;
        }

        .service-addons {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Date Time */
        .datetime-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date,
        .time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #64748b;
          font-size: 0.8rem;
        }

        .amount {
          font-weight: 600;
          color: #0f172a;
        }

        /* Actions */
        .actions-container {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .action-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button.view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .action-button.edit:hover {
          background: #fef3c7;
          color: #d97706;
        }

        .action-button.confirm:hover,
        .action-button.complete:hover {
          background: #dcfce7;
          color: #059669;
        }

        .action-button.start:hover {
          background: #dbeafe;
          color: #2563eb;
        }

        .action-button.payment:hover {
          background: #f3e8ff;
          color: #9333ea;
        }

        .action-button.cancel:hover {
          background: #fee2e2;
          color: #dc2626;
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

        .booking-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .card-checkbox input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .booking-number-mobile {
          font-family: monospace;
          font-weight: 600;
          color: #0f172a;
          flex: 1;
        }

        .card-body {
          padding: 1rem;
        }

        .card-row {
          display: flex;
          margin-bottom: 0.75rem;
        }

        .card-row:last-child {
          margin-bottom: 0;
        }

        .card-label {
          width: 100px;
          flex-shrink: 0;
          color: #64748b;
          font-size: 0.8rem;
        }

        .card-value {
          flex: 1;
        }

        .client-info-mobile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .client-avatar-mobile {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-weight: 600;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .client-name-mobile {
          font-weight: 500;
          color: #0f172a;
          font-size: 0.9rem;
        }

        .client-phone-mobile {
          font-size: 0.75rem;
          color: #64748b;
        }

        .professional-name-mobile {
          font-weight: 500;
          color: #0f172a;
          font-size: 0.9rem;
        }

        .professional-category-mobile {
          font-size: 0.7rem;
          color: #64748b;
        }

        .service-name-mobile {
          font-weight: 500;
          color: #0f172a;
          font-size: 0.9rem;
        }

        .service-variation-mobile,
        .service-addons-mobile {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.2rem;
        }

        .datetime-mobile {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #64748b;
          font-size: 0.8rem;
          margin-bottom: 0.2rem;
        }

        .amount-mobile {
          font-weight: 600;
          color: #0f172a;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }

        .payment-status-mobile {
          margin-top: 0.2rem;
        }

        .card-footer {
          padding: 1rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .mobile-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .mobile-action-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          padding: 0.6rem 0;
          border: none;
          border-radius: 8px;
          background: white;
          font-size: 0.7rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .mobile-action-button.view:hover {
          background: #eff6ff;
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .mobile-action-button.edit:hover {
          background: #fef3c7;
          color: #d97706;
          border-color: #d97706;
        }

        .mobile-action-button.confirm:hover {
          background: #dcfce7;
          color: #059669;
          border-color: #059669;
        }

        .mobile-action-button.cancel:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #dc2626;
        }

        .mobile-action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Pagination */
        .pagination-container {
          margin-top: 2rem;
          padding: 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .pagination-info {
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .pagination-info span {
          font-weight: 600;
          color: #0f172a;
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
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-numbers {
          display: flex;
          gap: 0.25rem;
        }

        .pagination-number {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #64748b;
          cursor: pointer;
        }

        .pagination-number.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .pagination-number:hover:not(.active) {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1000;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 400px;
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
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .modal-icon.warning {
          background: #fffbeb;
        }

        .modal-icon.info {
          background: #eff6ff;
        }

        .modal-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .modal-message {
          color: #64748b;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .modal-button {
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .modal-button.cancel {
          background: #f1f5f9;
          color: #64748b;
        }

        .modal-button.cancel:hover {
          background: #e2e8f0;
        }

        .modal-button.delete {
          background: #ef4444;
          color: white;
        }

        .modal-button.delete:hover {
          background: #dc2626;
        }

        .modal-button.confirm {
          background: #3b82f6;
          color: white;
        }

        .modal-button.confirm:hover {
          background: #2563eb;
        }

        .modal-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .bookings-container {
            padding: 1rem;
          }
          
          .page-title {
            font-size: 1.5rem;
          }
          
          .header-actions {
            width: 100%;
          }
          
          .refresh-button {
            width: 48px;
          }
          
          .add-button {
            flex: 1;
          }
          
          .bulk-actions {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .bulk-buttons {
            width: 100%;
          }
          
          .bulk-action-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}