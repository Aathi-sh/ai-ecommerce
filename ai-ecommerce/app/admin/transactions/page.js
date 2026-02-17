// app/admin/dashboards/payments/page.js - MATCHING CREATE ORDER PAGE STYLE
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import Head from 'next/head'; 

// Status configuration
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'bg-yellow-500'
  },
  processing: {
    label: 'Processing',
    icon: '🔄',
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-500'
  },
  verified: {
    label: 'Verified',
    icon: '✅',
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500'
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-500'
  },
  fraud: {
    label: 'Fraud',
    icon: '🚨',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-700'
  },
  manual_review: {
    label: 'Manual Review',
    icon: '👁️',
    color: 'bg-purple-100 text-purple-800',
    badgeColor: 'bg-purple-500'
  }
};

// API endpoint configuration
const API_ENDPOINTS = {
  verifications: '/api/payments/verify',
  updateStatus: (id, action) => `/api/payments/verify?id=${id}&action=${action}`,
  deleteVerification: (id) => `/api/payments/verify?id=${id}`
};

export default function PaymentVerificationDashboard() {
  // Auth context
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
  
  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    verified: 0,
    rejected: 0,
    fraud: 0,
    manual_review: 0,
  });

  // ========== DATA FETCHING ==========
  
  const fetchVerifications = useCallback(async (showRefreshToast = false) => {
    try {
      setLoading(true);
      if (showRefreshToast) setIsRefreshing(true);
      
      const response = await fetch(API_ENDPOINTS.verifications);
      
      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const data = result.data || [];
        setVerifications(data);
        setFilteredVerifications(data);
        updateStatistics(data);
        
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
  }, []);

  // Update statistics
  const updateStatistics = (data) => {
    const newStats = {
      total: data.length,
      pending: data.filter(v => v.status === 'pending').length,
      processing: data.filter(v => v.status === 'processing').length,
      verified: data.filter(v => v.status === 'verified').length,
      rejected: data.filter(v => v.status === 'rejected').length,
      fraud: data.filter(v => v.status === 'fraud').length,
      manual_review: data.filter(v => v.status === 'manual_review').length,
    };
    setStats(newStats);
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
        (v.orderReference && v.orderReference.toLowerCase().includes(term))
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
        ...(actionType === 'reject' && { reason }),
        ...(actionType === 'verify' && { verifiedBy: user?.email || 'admin' })
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
        toast.success(`Payment ${STATUS_CONFIG[status].label.toLowerCase()} successfully`);
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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this verification?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.deleteVerification(id), {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Verification deleted successfully');
        fetchVerifications();
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting verification:', error);
      toast.error(error.message || 'Failed to delete verification');
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
      return date.toLocaleDateString('en-US', {
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
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getValidationStatus = (verification) => {
    const results = verification.validationResults || {};
    
    if (results.amountMatch !== undefined) {
      return results.amountMatch 
        ? { text: 'Amount Matched', color: 'text-green-600', icon: '✓' }
        : { text: 'Amount Mismatch', color: 'text-red-600', icon: '✗' };
    }
    
    return { text: 'Not Validated', color: 'text-gray-600', icon: '−' };
  };

  const getFraudRiskLevel = (verification) => {
    const analysis = verification.fraudAnalysis || {};
    
    if (analysis.isSuspicious || analysis.markedAsFraud) {
      return { level: 'High', color: 'text-red-600', icon: '⚠️' };
    }
    
    if (analysis.fraudScore > 0.5) {
      return { level: 'Medium', color: 'text-yellow-600', icon: '⚠️' };
    }
    
    return { level: 'Low', color: 'text-green-600', icon: '✓' };
  };

  // ========== COMPONENT INITIALIZATION ==========
  
  useEffect(() => {
    fetchVerifications();
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [fetchVerifications]);

  // ========== STATISTICS CARDS ==========
  
  const statCards = [
    { title: 'Total', value: stats.total, icon: '📊', color: 'bg-blue-500' },
    { title: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-500' },
    { title: 'Processing', value: stats.processing, icon: '🔄', color: 'bg-blue-400' },
    { title: 'Verified', value: stats.verified, icon: '✅', color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected, icon: '❌', color: 'bg-red-500' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '📋' },
    ...Object.entries(STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
      icon: config.icon
    }))
  ];

  // ========== RENDER ==========
  
  return (
    <>
      <Head>
        <title>Payment Verification | LFMS</title>
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
          }
        }}
      />

      <div className="payments-container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Payment Verification</h1>
          <p className="page-subtitle">
            Manage, verify, and monitor payment confirmations from customers
          </p>
        </div>

        {/* Statistics Cards - Matching Create Order Style */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div>
                  <p className="stat-label">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
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

        {/* Filters Section - Matching Create Order Style */}
        <div className="filters-section">
          {/* Search Input */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number, phone, or ID..."
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
            <button
              onClick={() => fetchVerifications(true)}
              disabled={isRefreshing}
              className="refresh-button"
            >
              <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>🔄</span>
              Refresh
            </button>
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
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No payment verifications have been submitted yet'}
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="empty-button"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Details</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVerifications.map((verification) => {
                    const validation = getValidationStatus(verification);
                    const fraudRisk = getFraudRiskLevel(verification);
                    const statusConfig = STATUS_CONFIG[verification.status] || STATUS_CONFIG.pending;
                    
                    return (
                      <tr key={verification._id}>
                        <td>
                          <div className="order-details">
                            <span className="order-number">#{verification.orderNumber}</span>
                            <span className="order-reference">Ref: {verification.orderReference || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="customer-details">
                            <span className="customer-phone">{verification.customerPhone || 'N/A'}</span>
                            <span className="customer-name">{verification.orderDetails?.customerName || 'Customer'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="payment-details">
                            <span className="payment-amount">
                              {formatCurrency(verification.detectedPayment?.amount || verification.orderDetails?.totalAmount || 0)}
                            </span>
                            <span className={`payment-status ${validation.color}`}>
                              {validation.icon} {validation.text}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="status-wrapper">
                            <span className={`status-badge ${statusConfig.color}`}>
                              <span className="status-icon">{statusConfig.icon}</span>
                              {statusConfig.label}
                            </span>
                            {verification.status !== 'verified' && (
                              <span className={`risk-level ${fraudRisk.color}`}>
                                {fraudRisk.icon} {fraudRisk.level} Risk
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="date-wrapper">
                            <span className="date-main">{formatDate(verification.createdAt)}</span>
                            <span className="date-time">{formatDateTime(verification.createdAt).split(', ')[1]}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleViewDetails(verification)}
                              className="action-button view"
                            >
                              View
                            </button>
                            {isAdmin && verification.status !== 'verified' && (
                              <button
                                onClick={() => handleDelete(verification._id)}
                                className="action-button delete"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          <div className="table-footer">
            <p className="footer-text">
              Showing {filteredVerifications.length} of {verifications.length} total verifications
            </p>
          </div>
        </div>
      </div>

      {/* Details Modal - Matching Create Order Style */}
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
                <span className="modal-id">ID: {selectedVerification._id}</span>
              </div>

              {/* Order Information Section */}
              <div className="modal-section">
                <h3 className="modal-section-title">Order Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Order Number</label>
                    <p>#{selectedVerification.orderNumber}</p>
                  </div>
                  <div className="info-item">
                    <label>Reference</label>
                    <p>{selectedVerification.orderReference || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Created At</label>
                    <p>{formatDateTime(selectedVerification.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="modal-section">
                <h3 className="modal-section-title">Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Phone Number</label>
                    <p>{selectedVerification.customerPhone || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Name</label>
                    <p>{selectedVerification.orderDetails?.customerName || 'N/A'}</p>
                  </div>
                  {selectedVerification.orderDetails?.pincode && (
                    <div className="info-item">
                      <label>Pincode</label>
                      <p>{selectedVerification.orderDetails.pincode}</p>
                    </div>
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
                      <p className="amount-value">
                        {formatCurrency(selectedVerification.orderDetails?.totalAmount || 0)}
                      </p>
                    </div>
                    {selectedVerification.detectedPayment?.amount && (
                      <div className="amount-item">
                        <label>Detected Amount</label>
                        <p className={`amount-value ${getValidationStatus(selectedVerification).color}`}>
                          {formatCurrency(selectedVerification.detectedPayment.amount)}
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
                    {selectedVerification.validationResults.confidenceScore && (
                      <div className="result-item">
                        <span className="result-label">Confidence:</span>
                        <span className="result-value">
                          {(selectedVerification.validationResults.confidenceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fraud Analysis */}
              {selectedVerification.fraudAnalysis && Object.keys(selectedVerification.fraudAnalysis).length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Risk Analysis</h3>
                  <div className="fraud-info">
                    <div className="fraud-header">
                      <span className="risk-label">Risk Level:</span>
                      <span className={`risk-value ${getFraudRiskLevel(selectedVerification).color}`}>
                        {getFraudRiskLevel(selectedVerification).icon} {getFraudRiskLevel(selectedVerification).level}
                      </span>
                      {selectedVerification.fraudAnalysis.fraudScore && (
                        <>
                          <span className="risk-label">Fraud Score:</span>
                          <span className="risk-value">
                            {(selectedVerification.fraudAnalysis.fraudScore * 100).toFixed(1)}%
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
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && selectedVerification.status !== 'verified' && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Update Status</h3>
                  
                  <div className="action-buttons-group">
                    <button
                      onClick={() => setAction('verified')}
                      className={`action-btn verify ${action === 'verified' ? 'selected' : ''}`}
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => setAction('rejected')}
                      className={`action-btn reject ${action === 'rejected' ? 'selected' : ''}`}
                    >
                      ✗ Reject
                    </button>
                    <button
                      onClick={() => setAction('fraud')}
                      className={`action-btn fraud ${action === 'fraud' ? 'selected' : ''}`}
                    >
                      🚨 Mark Fraud
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
                        placeholder="Enter rejection reason..."
                        className="reason-input"
                        required
                      />
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
                        onClick={() => handleUpdateStatus(
                          selectedVerification._id,
                          action,
                          rejectionReason
                        )}
                        disabled={action === 'rejected' && !rejectionReason.trim()}
                        className={`confirm-btn ${
                          action === 'verified' ? 'verify' :
                          action === 'rejected' ? 'reject' :
                          action === 'fraud' ? 'fraud' : ''
                        }`}
                      >
                        Confirm Update
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Main Container - Matching Create Order Page */
        .payments-container {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* Page Header - Matching Create Order */
        .page-header {
          margin-bottom: 2rem;
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

        /* Statistics Grid - Matching Create Order Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

        /* Search Input - Matching Create Order */
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

        /* Content Card - Matching Create Order Card */
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

        .refresh-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
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

        .refresh-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .refresh-icon {
          display: inline-block;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Table Container */
        .table-container {
          overflow-x: auto;
        }

        /* Data Table - Matching Create Order Input Styles */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
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
        }

        .payment-status {
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
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
        }

        .status-badge.bg-yellow-100 { background: #fef9c3; color: #854d0e; }
        .status-badge.bg-blue-100 { background: #dbeafe; color: #1e40af; }
        .status-badge.bg-green-100 { background: #dcfce7; color: #166534; }
        .status-badge.bg-red-100 { background: #fee2e2; color: #991b1b; }
        .status-badge.bg-purple-100 { background: #f3e8ff; color: #6b21a8; }

        .risk-level {
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .date-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-main {
          font-weight: 500;
        }

        .date-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
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

        .action-button.delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .action-button.delete:hover {
          background: #fecaca;
        }

        /* Table Footer */
        .table-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .footer-text {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
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

        /* Modal Styles - Matching Create Order Modal Style */
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
          max-width: 600px;
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
        }

        .status-badge-large {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
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

        .info-item label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-item p {
          margin: 0;
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 500;
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
        }

        .amount-item {
          flex: 1;
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

        .fraud-info {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 0.375rem;
          padding: 0.75rem;
        }

        .fraud-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .risk-label {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .risk-value {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .fraud-reasons {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #fee2e2;
        }

        .reasons-label {
          color: #6b7280;
          font-size: 0.75rem;
          margin: 0 0 0.25rem;
        }

        .reasons-list {
          margin: 0;
          padding-left: 1.25rem;
          color: #4b5563;
          font-size: 0.875rem;
        }

        .reasons-list li {
          margin-bottom: 0.25rem;
        }

        /* Action Buttons in Modal */
        .action-buttons-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.625rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn.verify:hover {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .action-btn.verify.selected {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .action-btn.reject:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .action-btn.reject.selected {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .action-btn.fraud:hover {
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

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .payments-container {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
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
            gap: 0.75rem;
            align-items: flex-start;
          }

          .refresh-button {
            width: 100%;
            justify-content: center;
          }

          .action-buttons-group {
            flex-direction: column;
          }

          .confirm-actions {
            flex-direction: column-reverse;
          }

          .cancel-btn,
          .confirm-btn {
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
        }
      `}</style>
    </>
  );
}