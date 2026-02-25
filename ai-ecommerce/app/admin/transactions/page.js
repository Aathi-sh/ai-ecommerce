// app/admin/transactions/page.js - ENHANCED PROFESSIONAL VERSION
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Status configuration with enhanced styling
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'bg-yellow-500',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:bg-yellow-50'
  },
  processing: {
    label: 'Processing',
    icon: '🔄',
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-50'
  },
  verified: {
    label: 'Verified',
    icon: '✅',
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-50'
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-500',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-50'
  },
  fraud: {
    label: 'Fraud',
    icon: '🚨',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-700',
    borderColor: 'border-red-300',
    hoverColor: 'hover:bg-red-50'
  },
  manual_review: {
    label: 'Manual Review',
    icon: '👁️',
    color: 'bg-purple-100 text-purple-800',
    badgeColor: 'bg-purple-500',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-50'
  },
  requires_additional_proof: {
    label: 'Needs More Proof',
    icon: '📎',
    color: 'bg-orange-100 text-orange-800',
    badgeColor: 'bg-orange-500',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-50'
  }
};

// Risk level configuration
const RISK_CONFIG = {
  low: { label: 'Low Risk', icon: '✓', color: 'text-green-600', bgColor: 'bg-green-50' },
  medium: { label: 'Medium Risk', icon: '⚠️', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  high: { label: 'High Risk', icon: '🚨', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  critical: { label: 'Critical Risk', icon: '💀', color: 'text-red-600', bgColor: 'bg-red-50' }
};

// API endpoint configuration
const API_ENDPOINTS = {
  verifications: '/api/payments/verify',
  getVerification: (id) => `/api/payments/verify?id=${id}`,
  updateStatus: (id, action) => `/api/payments/verify?id=${id}&action=${action}`,
  deleteVerification: (id) => `/api/payments/verify?id=${id}`,
  generateInvoice: (id) => `/api/payments/verify/${id}/invoice`,
  sendNotification: (id) => `/api/payments/verify/${id}/notify`
};

export default function PaymentVerificationDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  // State management
  const [verifications, setVerifications] = useState([]);
  const [filteredVerifications, setFilteredVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    verified: 0,
    rejected: 0,
    fraud: 0,
    manual_review: 0,
    totalAmount: 0,
    verifiedAmount: 0,
    pendingAmount: 0
  });

  // ========== DATA FETCHING ==========
  
  const fetchVerifications = useCallback(async (showRefreshToast = false) => {
    try {
      setLoading(true);
      if (showRefreshToast) setIsRefreshing(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateRange.from) params.append('fromDate', dateRange.from);
      if (dateRange.to) params.append('toDate', dateRange.to);
      if (includeInactive) params.append('includeInactive', 'true');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await fetch(`${API_ENDPOINTS.verifications}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const data = result.data || [];
        setVerifications(data);
        setFilteredVerifications(data);
        updateStatistics(data, result.stats);
        
        if (showRefreshToast) {
          toast.success('Data refreshed successfully');
        }
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error(error.message || 'Failed to load payment verifications');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, dateRange.from, dateRange.to, sortBy, sortOrder, includeInactive]);

  // Update statistics
  const updateStatistics = (data, apiStats = null) => {
    if (apiStats) {
      setStats({
        total: apiStats.total || data.length,
        pending: apiStats.pending || data.filter(v => v.status === 'pending').length,
        processing: apiStats.processing || data.filter(v => v.status === 'processing').length,
        verified: apiStats.verified || data.filter(v => v.status === 'verified').length,
        rejected: apiStats.rejected || data.filter(v => v.status === 'rejected').length,
        fraud: apiStats.fraud || data.filter(v => v.status === 'fraud').length,
        manual_review: apiStats.manual_review || data.filter(v => v.status === 'manual_review').length,
        totalAmount: data.reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
        verifiedAmount: data.filter(v => v.status === 'verified')
          .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
        pendingAmount: data.filter(v => v.status === 'pending')
          .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0)
      });
    } else {
      setStats({
        total: data.length,
        pending: data.filter(v => v.status === 'pending').length,
        processing: data.filter(v => v.status === 'processing').length,
        verified: data.filter(v => v.status === 'verified').length,
        rejected: data.filter(v => v.status === 'rejected').length,
        fraud: data.filter(v => v.status === 'fraud').length,
        manual_review: data.filter(v => v.status === 'manual_review').length,
        totalAmount: data.reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
        verifiedAmount: data.filter(v => v.status === 'verified')
          .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
        pendingAmount: data.filter(v => v.status === 'pending')
          .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0)
      });
    }
  };

  // ========== FILTERING ==========
  
  useEffect(() => {
    let filtered = verifications;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(v => 
        (v.orderNumber && v.orderNumber.toLowerCase().includes(term)) ||
        (v.customerPhone && v.customerPhone.includes(term)) ||
        (v.orderReference && v.orderReference.toLowerCase().includes(term)) ||
        (v.detectedPayment?.transactionId && v.detectedPayment.transactionId.toLowerCase().includes(term)) ||
        (v.customerName && v.customerName.toLowerCase().includes(term))
      );
    }

    setFilteredVerifications(filtered);
  }, [verifications, statusFilter, searchTerm]);

  // ========== ACTIONS ==========
  
  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      let actionType = status;
      if (status === 'verified') actionType = 'verify';
      if (status === 'rejected') actionType = 'reject';
      if (status === 'fraud') actionType = 'mark-fraud';

      const requestBody = {
        ...(actionType === 'reject' && { reason, category: 'amount_mismatch' }),
        ...(actionType === 'verify' && { 
          verifiedBy: user?.email || 'admin',
          method: 'manual'
        }),
        ...(actionType === 'mark-fraud' && { 
          reasons: typeof reason === 'string' ? [reason] : reason,
          markedBy: user?.email || 'admin'
        })
      };

      const response = await fetch(API_ENDPOINTS.updateStatus(id, actionType), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Payment ${STATUS_CONFIG[status]?.label || status} successfully`);
        fetchVerifications();
        setIsModalOpen(false);
        setAction('');
        setRejectionReason('');
      } else {
        throw new Error(result.message || `Failed to ${actionType} payment`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id, permanent = false) => {
    if (!confirm(permanent 
      ? 'Are you sure you want to permanently delete this verification? This action cannot be undone.' 
      : 'Are you sure you want to delete this verification?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.deleteVerification(id)}${permanent ? '&permanent=true' : ''}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(permanent ? 'Verification permanently deleted' : 'Verification deleted successfully');
        fetchVerifications();
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting verification:', error);
      toast.error(error.message || 'Failed to delete verification');
    }
  };

  const handleGenerateInvoice = async (verification) => {
    try {
      toast.loading('Generating invoice...');
      
      const response = await fetch(API_ENDPOINTS.generateInvoice(verification._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss();
        toast.success('Invoice generated successfully');
        
        if (result.data?.invoiceUrl) {
          window.open(result.data.invoiceUrl, '_blank');
        }
        
        fetchVerifications();
      } else {
        throw new Error(result.message || 'Failed to generate invoice');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error generating invoice:', error);
      toast.error(error.message || 'Failed to generate invoice');
    }
  };

  const handleSendNotification = async (verification) => {
    try {
      toast.loading('Sending notification...');
      
      const response = await fetch(API_ENDPOINTS.sendNotification(verification._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss();
        toast.success('Notification sent successfully');
      } else {
        throw new Error(result.message || 'Failed to send notification');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    }
  };

  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
    setIsModalOpen(true);
    setAction('');
    setRejectionReason('');
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVerification(null);
    setAction('');
    setRejectionReason('');
    document.body.style.overflow = 'unset';
  };

  const handleViewOrder = (orderId) => {
    router.push(`/admin/orders?id=${orderId}`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setSortBy('createdAt');
    setSortOrder('desc');
    setIncludeInactive(false);
  };

  // ========== FORMATTING UTILITIES ==========
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return formatDate(dateString);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getValidationStatus = (verification) => {
    const results = verification.validationResults || {};
    const expected = results.expectedAmount || verification.orderDetails?.totalAmount || 0;
    const found = results.foundAmount || verification.detectedPayment?.amount || 0;
    const amountDiff = Math.abs(expected - found);
    
    if (amountDiff === 0) {
      return { text: 'Exact Match', color: 'text-green-600', icon: '✓' };
    } else if (amountDiff <= 2) {
      return { text: 'Close Match', color: 'text-green-500', icon: '~' };
    } else if (amountDiff <= 10) {
      return { text: 'Near Match', color: 'text-yellow-600', icon: '⚠️' };
    } else if (amountDiff > 0) {
      return { text: 'Mismatch', color: 'text-red-600', icon: '✗' };
    }
    
    return { text: 'Not Validated', color: 'text-gray-600', icon: '−' };
  };

  const getFraudRiskLevel = (verification) => {
    const analysis = verification.fraudAnalysis || {};
    const score = analysis.fraudScore || 0;
    
    if (analysis.isSuspicious || analysis.markedAsFraud || score >= 75) {
      return RISK_CONFIG.critical;
    }
    if (score >= 50) {
      return RISK_CONFIG.high;
    }
    if (score >= 25) {
      return RISK_CONFIG.medium;
    }
    return RISK_CONFIG.low;
  };

  const getAmountDifference = (verification) => {
    const expected = verification.orderDetails?.totalAmount || 0;
    const detected = verification.detectedPayment?.amount || 0;
    const diff = Math.abs(expected - detected);
    const percent = expected > 0 ? (diff / expected) * 100 : 0;
    
    return { diff, percent };
  };

  // ========== COMPONENT INITIALIZATION ==========
  
  useEffect(() => {
    fetchVerifications();
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [fetchVerifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVerifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchVerifications]);

  // ========== STATISTICS CARDS ==========
  
  const statCards = [
    { 
      title: 'Total', 
      value: stats.total, 
      icon: '📊', 
      color: 'bg-blue-500',
      subValue: formatCurrency(stats.totalAmount)
    },
    { 
      title: 'Pending', 
      value: stats.pending, 
      icon: '⏳', 
      color: 'bg-yellow-500',
      subValue: formatCurrency(stats.pendingAmount)
    },
    { 
      title: 'Processing', 
      value: stats.processing, 
      icon: '🔄', 
      color: 'bg-blue-400',
      subValue: stats.processing > 0 ? formatCurrency(stats.pendingAmount) : '₹0'
    },
    { 
      title: 'Verified', 
      value: stats.verified, 
      icon: '✅', 
      color: 'bg-green-500',
      subValue: formatCurrency(stats.verifiedAmount)
    },
    { 
      title: 'Rejected', 
      value: stats.rejected, 
      icon: '❌', 
      color: 'bg-red-500',
      subValue: stats.rejected > 0 ? formatCurrency(stats.pendingAmount) : '₹0'
    },
    { 
      title: 'Fraud', 
      value: stats.fraud, 
      icon: '🚨', 
      color: 'bg-red-700',
      subValue: stats.fraud > 0 ? formatCurrency(stats.pendingAmount) : '₹0'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '📋' },
    ...Object.entries(STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
      icon: config.icon
    }))
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'orderDetails.totalAmount', label: 'Amount' },
    { value: 'status', label: 'Status' }
  ];

  // ========== RENDER ==========
  
  return (
    <>
      <Head>
        <title>Payment Verification | PosterPro Admin</title>
        <meta name="description" content="Manage and verify customer payments" />
      </Head>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem'
          },
          success: {
            icon: '✅',
            style: {
              background: '#10b981',
            }
          },
          error: {
            icon: '❌',
            style: {
              background: '#ef4444',
            }
          },
          loading: {
            icon: '⏳',
            style: {
              background: '#3b82f6',
            }
          }
        }}
      />

      <div className="payments-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Payment Verification</h1>
            <p className="page-subtitle">
              Manage, verify, and monitor payment confirmations from customers
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="header-actions">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-toggle-btn"
            >
              <span className="btn-icon">🔍</span>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={() => fetchVerifications(true)}
              disabled={isRefreshing}
              className="refresh-btn"
            >
              <span className={`btn-icon ${isRefreshing ? 'spinning' : ''}`}>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div>
                  <p className="stat-label">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                  {stat.subValue && (
                    <p className="stat-subvalue">{stat.subValue}</p>
                  )}
                </div>
                <div className={`stat-icon ${stat.color}`}>
                  <span>{stat.icon}</span>
                </div>
              </div>
              <div className="stat-progress">
                <div 
                  className={`stat-progress-bar ${stat.color}`}
                  style={{ width: `${stats.total > 0 ? (stat.value / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <h3 className="filters-title">Advanced Filters</h3>
              <button onClick={resetFilters} className="reset-filters-btn">
                Reset All
              </button>
            </div>
            
            <div className="filters-grid">
              {/* Date Range */}
              <div className="filter-group">
                <label className="filter-label">Date Range</label>
                <div className="date-range">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="filter-input"
                    placeholder="From"
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="filter-input"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="filter-group">
                <label className="filter-label">Sort Order</label>
                <div className="sort-order">
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`sort-order-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`sort-order-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                  >
                    Oldest First
                  </button>
                </div>
              </div>

              {/* Include Inactive */}
              <div className="filter-group">
                <label className="filter-label">Options</label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                  />
                  <span>Include inactive verifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="filters-section">
          {/* Search Input */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number, phone, transaction ID..."
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="filter-buttons">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`filter-button ${
                  statusFilter === option.value
                    ? option.value === 'all'
                      ? 'active-all'
                      : `active-${option.value}`
                    : ''
                }`}
              >
                <span className="filter-icon">{option.icon}</span>
                <span className="filter-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="content-card">
          {/* Card Header */}
          <div className="card-header">
            <div className="card-title-wrapper">
              <h3 className="card-title">Payment Verifications</h3>
              <span className="card-badge">{filteredVerifications.length}</span>
            </div>
            
            {/* Bulk Actions */}
            {isAdmin && filteredVerifications.length > 0 && (
              <div className="bulk-actions">
                <button className="bulk-action-btn">
                  Bulk Verify
                </button>
                <button className="bulk-action-btn">
                  Export CSV
                </button>
              </div>
            )}
          </div>

          {/* Table/Content */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading payment verifications...</p>
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">No payment verifications found</h3>
                <p className="empty-message">
                  {searchTerm || statusFilter !== 'all' || dateRange.from || dateRange.to
                    ? 'Try adjusting your search or filter criteria'
                    : 'No payment verifications have been submitted yet'}
                </p>
                {(searchTerm || statusFilter !== 'all' || dateRange.from || dateRange.to) && (
                  <button
                    onClick={resetFilters}
                    className="empty-button"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order Details</th>
                      <th>Customer</th>
                      <th>Payment</th>
                      <th>Validation</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVerifications.map((verification) => {
                      const validation = getValidationStatus(verification);
                      const fraudRisk = getFraudRiskLevel(verification);
                      const amountDiff = getAmountDifference(verification);
                      const statusConfig = STATUS_CONFIG[verification.status] || STATUS_CONFIG.pending;
                      const timeAgo = formatTimeAgo(verification.createdAt);
                      
                      return (
                        <tr key={verification._id} className={statusConfig.hoverColor}>
                          <td>
                            <div className="order-details">
                              <span className="order-number">#{verification.orderNumber}</span>
                              <span className="order-reference">
                                Ref: {verification.orderReference?.slice(-8) || 'N/A'}
                              </span>
                              {amountDiff.diff > 0 && (
                                <span className={`amount-diff ${validation.color}`}>
                                  {validation.icon} ₹{amountDiff.diff}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="customer-details">
                              <span className="customer-phone">{verification.customerPhone || 'N/A'}</span>
                              <span className="customer-name">
                                {verification.orderDetails?.customerName || verification.customerName || 'Customer'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="payment-details">
                              <span className="payment-amount">
                                {formatCurrency(verification.detectedPayment?.amount || verification.orderDetails?.totalAmount || 0)}
                              </span>
                              {verification.detectedPayment?.transactionId && (
                                <span className="transaction-id" title={verification.detectedPayment.transactionId}>
                                  TXN: {verification.detectedPayment.transactionId.slice(-8)}
                                </span>
                              )}
                              {verification.detectedPayment?.upiId && (
                                <span className="upi-id" title={verification.detectedPayment.upiId}>
                                  UPI: {verification.detectedPayment.upiId.split('@')[0]}@...
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="validation-details">
                              <span className={`validation-badge ${validation.color}`}>
                                {validation.icon} {validation.text}
                              </span>
                              {verification.validationResults?.confidenceScore > 0 && (
                                <span className="confidence-score">
                                  Confidence: {verification.validationResults.confidenceScore}%
                                </span>
                              )}
                              <span className={`risk-badge ${fraudRisk.bgColor} ${fraudRisk.color}`}>
                                {fraudRisk.icon} {fraudRisk.label}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="status-wrapper">
                              <span className={`status-badge ${statusConfig.color}`}>
                                <span className="status-icon">{statusConfig.icon}</span>
                                {statusConfig.label}
                              </span>
                              {verification.verificationAttempts > 1 && (
                                <span className="attempt-badge" title={`${verification.verificationAttempts} attempts`}>
                                  Attempt {verification.verificationAttempts}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="date-wrapper">
                              <span className="date-main" title={formatDateTime(verification.createdAt)}>
                                {timeAgo}
                              </span>
                              {verification.verifiedAt && (
                                <span className="date-verified" title={formatDateTime(verification.verifiedAt)}>
                                  ✓ {formatTimeAgo(verification.verifiedAt)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleViewDetails(verification)}
                                className="action-button view"
                                title="View Details"
                              >
                                View
                              </button>
                              {verification.status === 'verified' && !verification.invoiceGenerated && (
                                <button
                                  onClick={() => handleGenerateInvoice(verification)}
                                  className="action-button invoice"
                                  title="Generate Invoice"
                                >
                                  📄
                                </button>
                              )}
                              {verification.orderReference && (
                                <button
                                  onClick={() => handleViewOrder(verification.orderReference)}
                                  className="action-button order"
                                  title="View Order"
                                >
                                  📦
                                </button>
                              )}
                              {isAdmin && (
                                <>
                                  {verification.status !== 'verified' && (
                                    <button
                                      onClick={() => handleDelete(verification._id, false)}
                                      className="action-button delete"
                                      title="Soft Delete"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (confirm('Permanently delete this verification?')) {
                                        handleDelete(verification._id, true);
                                      }
                                    }}
                                    className="action-button delete-permanent"
                                    title="Permanent Delete"
                                  >
                                    💀
                                  </button>
                                </>
                              )}
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

          {/* Table Footer */}
          <div className="table-footer">
            <p className="footer-text">
              Showing {filteredVerifications.length} of {verifications.length} total verifications
            </p>
            {filteredVerifications.length > 0 && (
              <p className="footer-total">
                Total Amount: {formatCurrency(
                  filteredVerifications.reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0)
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedVerification && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="modal-title">Payment Verification Details</h2>
              <button onClick={handleCloseModal} className="modal-close">✕</button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Status Badge */}
              <div className="modal-status">
                <span className={`status-badge-large ${STATUS_CONFIG[selectedVerification.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                  <span className="status-icon">{STATUS_CONFIG[selectedVerification.status]?.icon || '⏳'}</span>
                  {STATUS_CONFIG[selectedVerification.status]?.label || 'Pending'}
                </span>
                <span className="modal-id">ID: {selectedVerification._id.slice(-12)}</span>
              </div>

              {/* Order Information Section */}
              <div className="modal-section">
                <h3 className="modal-section-title">Order Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Order Number</label>
                    <p className="info-value">#{selectedVerification.orderNumber}</p>
                  </div>
                  <div className="info-item">
                    <label>Reference ID</label>
                    <p className="info-value">{selectedVerification.orderReference || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Created At</label>
                    <p className="info-value">{formatDateTime(selectedVerification.createdAt)}</p>
                  </div>
                  <div className="info-item">
                    <label>Last Updated</label>
                    <p className="info-value">{formatDateTime(selectedVerification.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="modal-section">
                <h3 className="modal-section-title">Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Phone Number</label>
                    <p className="info-value">{selectedVerification.customerPhone || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Name</label>
                    <p className="info-value">{selectedVerification.orderDetails?.customerName || selectedVerification.customerName || 'N/A'}</p>
                  </div>
                  {selectedVerification.orderDetails?.shippingAddress && (
                    <>
                      <div className="info-item full-width">
                        <label>Shipping Address</label>
                        <p className="info-value">
                          {typeof selectedVerification.orderDetails.shippingAddress === 'object' 
                            ? `${selectedVerification.orderDetails.shippingAddress.street || ''}, ${selectedVerification.orderDetails.shippingAddress.city || ''}, ${selectedVerification.orderDetails.shippingAddress.state || ''} - ${selectedVerification.orderDetails.shippingAddress.pincode || ''}`
                            : selectedVerification.orderDetails.shippingAddress}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="modal-section">
                <h3 className="modal-section-title">Payment Details</h3>
                <div className="payment-details-grid">
                  <div className="amount-info">
                    <div className="amount-item">
                      <label>Order Amount</label>
                      <p className="amount-value expected">
                        {formatCurrency(selectedVerification.orderDetails?.totalAmount || 0)}
                      </p>
                    </div>
                    {selectedVerification.detectedPayment?.amount && (
                      <div className="amount-item">
                        <label>Detected Amount</label>
                        <p className={`amount-value detected ${getValidationStatus(selectedVerification).color}`}>
                          {formatCurrency(selectedVerification.detectedPayment.amount)}
                        </p>
                      </div>
                    )}
                    {getAmountDifference(selectedVerification).diff > 0 && (
                      <div className="amount-item">
                        <label>Difference</label>
                        <p className={`amount-value diff ${getValidationStatus(selectedVerification).color}`}>
                          {formatCurrency(getAmountDifference(selectedVerification).diff)}
                          <span className="diff-percent">
                            ({getAmountDifference(selectedVerification).percent.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedVerification.detectedPayment?.upiId && (
                    <div className="payment-field">
                      <label>UPI ID</label>
                      <p className="payment-value">{selectedVerification.detectedPayment.upiId}</p>
                    </div>
                  )}
                  
                  {selectedVerification.detectedPayment?.transactionId && (
                    <div className="payment-field">
                      <label>Transaction ID</label>
                      <p className="payment-value">{selectedVerification.detectedPayment.transactionId}</p>
                    </div>
                  )}

                  {selectedVerification.detectedPayment?.transactionTime && (
                    <div className="payment-field">
                      <label>Transaction Time</label>
                      <p className="payment-value">{formatDateTime(selectedVerification.detectedPayment.transactionTime)}</p>
                    </div>
                  )}

                  {selectedVerification.detectedPayment?.appName && (
                    <div className="payment-field">
                      <label>Payment App</label>
                      <p className="payment-value capitalize">{selectedVerification.detectedPayment.appName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Results */}
              {selectedVerification.validationResults && Object.keys(selectedVerification.validationResults).length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Validation Results</h3>
                  <div className="results-grid">
                    <div className="result-item">
                      <span className="result-label">Amount Match:</span>
                      <span className={`result-value ${getValidationStatus(selectedVerification).color}`}>
                        {getValidationStatus(selectedVerification).icon} {getValidationStatus(selectedVerification).text}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">UPI Match:</span>
                      <span className={`result-value ${selectedVerification.validationResults.upiMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedVerification.validationResults.upiMatch ? '✓ Match' : '✗ Mismatch'}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Time Valid:</span>
                      <span className={`result-value ${selectedVerification.validationResults.timeValid ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedVerification.validationResults.timeValid ? '✓ Recent' : '✗ Too Old'}
                      </span>
                    </div>
                    {selectedVerification.validationResults.confidenceScore > 0 && (
                      <div className="result-item">
                        <span className="result-label">Confidence:</span>
                        <span className="result-value">
                          {selectedVerification.validationResults.confidenceScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedVerification.validationResults.validationErrors?.length > 0 && (
                    <div className="validation-errors">
                      <p className="errors-title">Errors:</p>
                      <ul className="errors-list">
                        {selectedVerification.validationResults.validationErrors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Fraud Analysis */}
              {selectedVerification.fraudAnalysis && Object.keys(selectedVerification.fraudAnalysis).length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Risk Analysis</h3>
                  <div className={`fraud-info ${getFraudRiskLevel(selectedVerification).bgColor}`}>
                    <div className="fraud-header">
                      <span className="risk-label">Risk Level:</span>
                      <span className={`risk-value ${getFraudRiskLevel(selectedVerification).color}`}>
                        {getFraudRiskLevel(selectedVerification).icon} {getFraudRiskLevel(selectedVerification).label}
                      </span>
                      {selectedVerification.fraudAnalysis.fraudScore > 0 && (
                        <>
                          <span className="risk-label">Fraud Score:</span>
                          <span className="risk-value">
                            {selectedVerification.fraudAnalysis.fraudScore}%
                          </span>
                        </>
                      )}
                    </div>
                    {selectedVerification.fraudAnalysis.reasons?.length > 0 && (
                      <div className="fraud-reasons">
                        <p className="reasons-label">Risk Factors:</p>
                        <ul className="reasons-list">
                          {selectedVerification.fraudAnalysis.reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedVerification.fraudAnalysis.flags?.length > 0 && (
                      <div className="fraud-flags">
                        <p className="flags-label">Flags:</p>
                        <div className="flags-list">
                          {selectedVerification.fraudAnalysis.flags.map((flag, index) => (
                            <span key={index} className="flag-badge">{flag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OCR Analysis */}
              {selectedVerification.ocrAnalysis?.extractedText && (
                <div className="modal-section">
                  <h3 className="modal-section-title">OCR Analysis</h3>
                  <div className="ocr-info">
                    <div className="ocr-stats">
                      <span className="ocr-stat">Confidence: {selectedVerification.ocrAnalysis.confidenceScore || 0}%</span>
                      <span className="ocr-stat">Words: {selectedVerification.ocrAnalysis.wordCount || 0}</span>
                      <span className="ocr-stat">Time: {(selectedVerification.ocrAnalysis.processingTime || 0) / 1000}s</span>
                    </div>
                    <div className="ocr-text">
                      <p className="ocr-label">Extracted Text:</p>
                      <pre className="ocr-content">
                        {selectedVerification.ocrAnalysis.extractedText}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Analysis */}
              {selectedVerification.imageAnalysis && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Image Analysis</h3>
                  <div className="image-analysis">
                    <div className="analysis-item">
                      <span className="analysis-label">Quality Score:</span>
                      <span className="analysis-value">{selectedVerification.imageAnalysis.qualityScore || 0}%</span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-label">Tampering Detected:</span>
                      <span className={`analysis-value ${selectedVerification.imageAnalysis.isEdited ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedVerification.imageAnalysis.isEdited ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedVerification.imageAnalysis.tamperingIndicators?.length > 0 && (
                      <div className="tampering-indicators">
                        <p className="indicators-label">Tampering Indicators:</p>
                        <ul className="indicators-list">
                          {selectedVerification.imageAnalysis.tamperingIndicators.map((indicator, idx) => (
                            <li key={idx}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedVerification.adminNotes && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Admin Notes</h3>
                  <div className="admin-notes">
                    <p className="notes-content">{selectedVerification.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Invoice Information */}
              {selectedVerification.invoiceGenerated && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Invoice Information</h3>
                  <div className="invoice-info">
                    <div className="invoice-item">
                      <span className="invoice-label">Invoice Number:</span>
                      <span className="invoice-value">{selectedVerification.invoiceNumber}</span>
                    </div>
                    {selectedVerification.invoiceSentAt && (
                      <div className="invoice-item">
                        <span className="invoice-label">Sent At:</span>
                        <span className="invoice-value">{formatDateTime(selectedVerification.invoiceSentAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Admin Actions</h3>
                  
                  <div className="action-buttons-group">
                    <button
                      onClick={() => setAction('verified')}
                      className={`action-btn verify ${action === 'verified' ? 'selected' : ''}`}
                      disabled={selectedVerification.status === 'verified'}
                    >
                      ✓ Verify Payment
                    </button>
                    <button
                      onClick={() => setAction('rejected')}
                      className={`action-btn reject ${action === 'rejected' ? 'selected' : ''}`}
                      disabled={selectedVerification.status === 'rejected' || selectedVerification.status === 'fraud'}
                    >
                      ✗ Reject Payment
                    </button>
                    <button
                      onClick={() => setAction('fraud')}
                      className={`action-btn fraud ${action === 'fraud' ? 'selected' : ''}`}
                      disabled={selectedVerification.status === 'fraud'}
                    >
                      🚨 Mark as Fraud
                    </button>
                  </div>

                  {action === 'rejected' && (
                    <div className="rejection-reason">
                      <label htmlFor="rejectionReason" className="reason-label">
                        Rejection Reason <span className="required">*</span>
                      </label>
                      <textarea
                        id="rejectionReason"
                        rows="3"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason (e.g., amount mismatch, invalid UPI, etc.)"
                        className="reason-input"
                        required
                      />
                    </div>
                  )}

                  {action === 'fraud' && (
                    <div className="rejection-reason">
                      <label htmlFor="fraudReason" className="reason-label">
                        Fraud Reasons <span className="required">*</span>
                      </label>
                      <textarea
                        id="fraudReason"
                        rows="3"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter fraud detection reasons (comma separated)"
                        className="reason-input"
                        required
                      />
                      <p className="reason-hint">Separate multiple reasons with commas</p>
                    </div>
                  )}

                  {action && (
                    <div className="confirm-actions">
                      <button
                        onClick={() => {
                          setAction('');
                          setRejectionReason('');
                        }}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const reasons = action === 'fraud' 
                            ? rejectionReason.split(',').map(r => r.trim()).filter(r => r)
                            : rejectionReason;
                          handleUpdateStatus(
                            selectedVerification._id,
                            action,
                            reasons
                          );
                        }}
                        disabled={(action === 'rejected' || action === 'fraud') && !rejectionReason.trim()}
                        className={`confirm-btn ${
                          action === 'verified' ? 'verify' :
                          action === 'rejected' ? 'reject' :
                          action === 'fraud' ? 'fraud' : ''
                        }`}
                      >
                        Confirm {action === 'verified' ? 'Verification' : 
                                 action === 'rejected' ? 'Rejection' : 
                                 'Fraud Mark'}
                      </button>
                    </div>
                  )}

                  {/* Additional Admin Actions */}
                  {selectedVerification.status === 'verified' && !selectedVerification.invoiceGenerated && (
                    <div className="admin-extra-actions">
                      <button
                        onClick={() => handleGenerateInvoice(selectedVerification)}
                        className="extra-action-btn"
                      >
                        📄 Generate Invoice
                      </button>
                    </div>
                  )}

                  {selectedVerification.orderReference && (
                    <div className="admin-extra-actions">
                      <button
                        onClick={() => handleViewOrder(selectedVerification.orderReference)}
                        className="extra-action-btn"
                      >
                        📦 View Full Order
                      </button>
                    </div>
                  )}

                  <div className="admin-extra-actions">
                    <button
                      onClick={() => handleSendNotification(selectedVerification)}
                      className="extra-action-btn"
                    >
                      🔔 Send Notification
                    </button>
                  </div>

                  <div className="admin-extra-actions">
                    <button
                      onClick={() => {
                        if (confirm('Permanently delete this verification?')) {
                          handleDelete(selectedVerification._id, true);
                          handleCloseModal();
                        }
                      }}
                      className="extra-action-btn delete-permanent"
                    >
                      💀 Permanent Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Main Container */
        .payments-container {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* Page Header */
        .page-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .page-subtitle {
          margin-top: 0.5rem;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .filter-toggle-btn,
        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-toggle-btn:hover,
        .refresh-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          display: inline-block;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
          line-height: 1.2;
        }

        .stat-subvalue {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0.25rem 0 0;
        }

        .stat-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .stat-icon.bg-blue-500 { background: #3b82f6; }
        .stat-icon.bg-yellow-500 { background: #eab308; }
        .stat-icon.bg-blue-400 { background: #60a5fa; }
        .stat-icon.bg-green-500 { background: #22c55e; }
        .stat-icon.bg-red-500 { background: #ef4444; }
        .stat-icon.bg-red-700 { background: #b91c1c; }

        .stat-progress {
          width: 100%;
          height: 0.375rem;
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
        }

        .stat-progress-bar {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .stat-progress-bar.bg-blue-500 { background: #3b82f6; }
        .stat-progress-bar.bg-yellow-500 { background: #eab308; }
        .stat-progress-bar.bg-blue-400 { background: #60a5fa; }
        .stat-progress-bar.bg-green-500 { background: #22c55e; }
        .stat-progress-bar.bg-red-500 { background: #ef4444; }
        .stat-progress-bar.bg-red-700 { background: #b91c1c; }

        /* Filters Panel */
        .filters-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .filters-title {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .reset-filters-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .reset-filters-btn:hover {
          text-decoration: underline;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .filter-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          background: white;
        }

        .filter-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-range .filter-input {
          flex: 1;
        }

        .date-separator {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .sort-order {
          display: flex;
          gap: 0.5rem;
        }

        .sort-order-btn {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sort-order-btn:hover {
          background: #f9fafb;
        }

        .sort-order-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        /* Filters Section */
        .filters-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .filters-section {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        /* Search Input */
        .search-wrapper {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 0.75rem 0.625rem 2.25rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
        }

        .clear-search:hover {
          color: #4b5563;
        }

        /* Filter Buttons */
        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .filter-button.active-all {
          background: #1f2937;
          color: white;
          border-color: #1f2937;
        }

        .filter-button.active-pending {
          background: #eab308;
          color: white;
          border-color: #eab308;
        }

        .filter-button.active-processing {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .filter-button.active-verified {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .filter-button.active-rejected {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .filter-button.active-fraud {
          background: #b91c1c;
          color: white;
          border-color: #b91c1c;
        }

        .filter-button.active-manual_review {
          background: #a855f7;
          color: white;
          border-color: #a855f7;
        }

        .filter-icon {
          font-size: 1rem;
        }

        .filter-label {
          font-weight: 500;
        }

        /* Content Card */
        .content-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .card-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .card-badge {
          background: #e5e7eb;
          color: #4b5563;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .bulk-actions {
          display: flex;
          gap: 0.5rem;
        }

        .bulk-action-btn {
          padding: 0.375rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background: white;
          color: #374151;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .bulk-action-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        /* Table Container */
        .table-container {
          overflow-x: auto;
        }

        .table-responsive {
          min-width: 100%;
        }

        /* Data Table */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .data-table th {
          text-align: left;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          color: #4b5563;
          font-size: 0.875rem;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .data-table td {
          padding: 1rem 1.5rem;
          color: #1f2937;
          font-size: 0.875rem;
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.15s ease;
        }

        .data-table tr:hover td {
          background: #f9fafb;
        }

        /* Table Cell Content Styles */
        .order-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .order-number {
          font-weight: 600;
          color: #1f2937;
        }

        .order-reference {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .amount-diff {
          font-size: 0.7rem;
          display: inline-flex;
          align-items: center;
          gap: 0.125rem;
        }

        .customer-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .customer-phone {
          font-weight: 500;
        }

        .customer-name {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .payment-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .payment-amount {
          font-weight: 600;
          color: #1f2937;
        }

        .transaction-id,
        .upi-id {
          font-size: 0.7rem;
          color: #6b7280;
          cursor: help;
        }

        .validation-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .validation-badge {
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .confidence-score {
          font-size: 0.7rem;
          color: #6b7280;
        }

        .risk-badge {
          font-size: 0.7rem;
          font-weight: 500;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          display: inline-block;
        }

        .status-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          width: fit-content;
        }

        .status-badge.bg-yellow-100 { background: #fef9c3; color: #854d0e; }
        .status-badge.bg-blue-100 { background: #dbeafe; color: #1e40af; }
        .status-badge.bg-green-100 { background: #dcfce7; color: #166534; }
        .status-badge.bg-red-100 { background: #fee2e2; color: #991b1b; }
        .status-badge.bg-purple-100 { background: #f3e8ff; color: #6b21a8; }
        .status-badge.bg-orange-100 { background: #ffedd5; color: #9a3412; }

        .attempt-badge {
          font-size: 0.65rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          width: fit-content;
        }

        .date-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-main {
          font-weight: 500;
          font-size: 0.75rem;
        }

        .date-verified {
          font-size: 0.7rem;
          color: #10b981;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-button.view {
          background: #dbeafe;
          color: #1e40af;
        }

        .action-button.view:hover {
          background: #bfdbfe;
        }

        .action-button.invoice {
          background: #dcfce7;
          color: #166534;
        }

        .action-button.invoice:hover {
          background: #bbf7d0;
        }

        .action-button.order {
          background: #f3e8ff;
          color: #6b21a8;
        }

        .action-button.order:hover {
          background: #e9d5ff;
        }

        .action-button.delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .action-button.delete:hover {
          background: #fecaca;
        }

        .action-button.delete-permanent {
          background: #7f1d1d;
          color: white;
        }

        .action-button.delete-permanent:hover {
          background: #991b1b;
        }

        /* Table Footer */
        .table-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-text {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .footer-total {
          margin: 0;
          color: #1f2937;
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
        }

        .spinner {
          width: 2.5rem;
          height: 2.5rem;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .loading-state p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #d1d5db;
        }

        .empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem;
        }

        .empty-message {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 1.5rem;
        }

        .empty-button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .empty-button:hover {
          background: #2563eb;
        }

        /* Modal Styles */
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
          z-index: 10000;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: white;
          border-radius: 0.75rem;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
        }

        .modal-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.15s ease;
        }

        .modal-close:hover {
          color: #4b5563;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          max-height: calc(90vh - 4rem);
        }

        .modal-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .status-badge-large {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .modal-id {
          color: #6b7280;
          font-size: 0.75rem;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .modal-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .modal-section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 1rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-item label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          margin: 0;
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 500;
          line-height: 1.5;
        }

        .payment-details-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .amount-info {
          display: flex;
          gap: 1rem;
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
          flex-wrap: wrap;
        }

        .amount-item {
          flex: 1;
          min-width: 120px;
        }

        .amount-item label {
          font-size: 0.75rem;
          color: #6b7280;
          display: block;
          margin-bottom: 0.25rem;
        }

        .amount-value {
          font-size: 1.125rem;
          font-weight: bold;
          margin: 0;
        }

        .amount-value.diff {
          font-size: 1rem;
        }

        .diff-percent {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 0.25rem;
        }

        .payment-field {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }

        .payment-field label {
          font-size: 0.75rem;
          color: #6b7280;
          display: block;
          margin-bottom: 0.25rem;
        }

        .payment-value {
          margin: 0;
          font-size: 0.875rem;
          font-family: monospace;
          word-break: break-all;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .result-value {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .text-green-600 { color: #16a34a; }
        .text-red-600 { color: #dc2626; }
        .text-yellow-600 { color: #ca8a04; }

        .validation-errors {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #fef2f2;
          border-radius: 0.375rem;
        }

        .errors-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #991b1b;
          margin: 0 0 0.5rem;
        }

        .errors-list {
          margin: 0;
          padding-left: 1.25rem;
          color: #b91c1c;
          font-size: 0.875rem;
        }

        .fraud-info {
          padding: 1rem;
          border-radius: 0.375rem;
        }

        .fraud-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .risk-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .risk-value {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .fraud-reasons,
        .fraud-flags {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .reasons-label,
        .flags-label {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 0.5rem;
        }

        .reasons-list {
          margin: 0;
          padding-left: 1.25rem;
          color: #4b5563;
          font-size: 0.875rem;
        }

        .flags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .flag-badge {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .ocr-info {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }

        .ocr-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .ocr-stat {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .ocr-text {
          margin-top: 0.75rem;
        }

        .ocr-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 0.25rem;
        }

        .ocr-content {
          margin: 0;
          padding: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          max-height: 150px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .image-analysis {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }

        .analysis-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .analysis-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .analysis-value {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .tampering-indicators {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .indicators-label {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 0.5rem;
        }

        .indicators-list {
          margin: 0;
          padding-left: 1.25rem;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .admin-notes {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }

        .notes-content {
          margin: 0;
          color: #4b5563;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .invoice-info {
          background: #f0f9ff;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }

        .invoice-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .invoice-item:last-child {
          margin-bottom: 0;
        }

        .invoice-label {
          color: #0369a1;
          font-size: 0.875rem;
        }

        .invoice-value {
          font-weight: 600;
          color: #0369a1;
          font-size: 0.875rem;
        }

        /* Action Buttons in Modal */
        .action-buttons-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          min-width: 120px;
          padding: 0.625rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.verify:hover:not(:disabled) {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .action-btn.verify.selected {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .action-btn.reject:hover:not(:disabled) {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .action-btn.reject.selected {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .action-btn.fraud:hover:not(:disabled) {
          background: #b91c1c;
          color: white;
          border-color: #b91c1c;
        }

        .action-btn.fraud.selected {
          background: #b91c1c;
          color: white;
          border-color: #b91c1c;
        }

        .rejection-reason {
          margin-bottom: 1rem;
        }

        .reason-label {
          display: block;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.375rem;
        }

        .required {
          color: #ef4444;
        }

        .reason-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          resize: vertical;
        }

        .reason-input:focus {
          outline: none;
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .reason-hint {
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .cancel-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background: white;
          color: #4b5563;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cancel-btn:hover {
          background: #f9fafb;
        }

        .confirm-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .confirm-btn.verify {
          background: #22c55e;
          color: white;
        }

        .confirm-btn.verify:hover:not(:disabled) {
          background: #16a34a;
        }

        .confirm-btn.reject {
          background: #ef4444;
          color: white;
        }

        .confirm-btn.reject:hover:not(:disabled) {
          background: #dc2626;
        }

        .confirm-btn.fraud {
          background: #b91c1c;
          color: white;
        }

        .confirm-btn.fraud:hover:not(:disabled) {
          background: #991b1b;
        }

        .admin-extra-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .extra-action-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .extra-action-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .extra-action-btn.delete-permanent {
          background: #7f1d1d;
          color: white;
          border-color: #7f1d1d;
        }

        .extra-action-btn.delete-permanent:hover {
          background: #991b1b;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .payments-container {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .header-actions {
            width: 100%;
          }

          .filter-toggle-btn,
          .refresh-btn {
            flex: 1;
          }

          .filter-buttons {
            justify-content: flex-start;
          }

          .filter-button {
            padding: 0.375rem 0.625rem;
            font-size: 0.75rem;
          }

          .filter-icon {
            font-size: 0.875rem;
          }

          .filter-label {
            display: none;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .bulk-actions {
            width: 100%;
          }

          .bulk-action-btn {
            flex: 1;
          }

          .action-buttons-group {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }

          .confirm-actions {
            flex-direction: column-reverse;
          }

          .cancel-btn,
          .confirm-btn {
            width: 100%;
          }

          .admin-extra-actions {
            flex-direction: column;
          }

          .extra-action-btn {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-section {
            flex-direction: column;
          }

          .search-wrapper {
            max-width: 100%;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .amount-info {
            flex-direction: column;
            gap: 0.5rem;
          }

          .date-range {
            flex-direction: column;
          }

          .date-range .filter-input {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}