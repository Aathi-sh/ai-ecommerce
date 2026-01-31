// app/dashboard/payments/page.js - PROFESSIONAL DASHBOARD
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';

// Status configuration
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    badgeColor: 'bg-yellow-500'
  },
  processing: {
    label: 'Processing',
    icon: '🔄',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    badgeColor: 'bg-blue-500'
  },
  verified: {
    label: 'Verified',
    icon: '✅',
    color: 'bg-green-100 text-green-800 border-green-200',
    badgeColor: 'bg-green-500'
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    color: 'bg-red-100 text-red-800 border-red-200',
    badgeColor: 'bg-red-500'
  },
  fraud: {
    label: 'Fraud',
    icon: '🚨',
    color: 'bg-red-100 text-red-800 border-red-200',
    badgeColor: 'bg-red-700'
  },
  manual_review: {
    label: 'Manual Review',
    icon: '👁️',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
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
  
  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.verifications);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const data = result.data || [];
        setVerifications(data);
        setFilteredVerifications(data);
        updateStatistics(data);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error(error.message || 'Failed to load payment verifications');
    } finally {
      setLoading(false);
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
        (v.orderReference && v.orderReference.toLowerCase().includes(term)) ||
        (v._id && v._id.toLowerCase().includes(term))
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
        ...(actionType === 'verify' && { verifiedBy: 'admin' }),
        ...(actionType === 'mark-fraud' && { reasons: [reason || 'Marked as fraud'] })
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
    if (!confirm('Are you sure you want to delete this verification? This action cannot be undone.')) {
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
  }, [fetchVerifications]);

  // ========== RENDER HELPERS ==========
  
  const statCards = [
    { title: 'Total', value: stats.total, icon: '📊', color: 'bg-blue-500' },
    { title: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-500' },
    { title: 'Processing', value: stats.processing, icon: '🔄', color: 'bg-blue-400' },
    { title: 'Verified', value: stats.verified, icon: '✅', color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected, icon: '❌', color: 'bg-red-500' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...Object.entries(STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label
    }))
  ];

  // ========== RENDER COMPONENTS ==========
  
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFilters = () => (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by order number, phone, or ID..."
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-600">✕</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === option.value
                ? option.value === 'all'
                  ? 'bg-gray-800 text-white'
                  : `${STATUS_CONFIG[option.value]?.color.replace('text-', 'text-white ').replace('bg-', 'bg-').split(' ')[0]} text-white`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading payment verifications...</p>
          </div>
        </div>
      );
    }

    if (filteredVerifications.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No payment verifications found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try changing your search or filter criteria'
              : 'No payment verifications have been submitted yet'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVerifications.map((verification) => {
              const validation = getValidationStatus(verification);
              const fraudRisk = getFraudRiskLevel(verification);
              const statusConfig = STATUS_CONFIG[verification.status] || STATUS_CONFIG.pending;
              
              return (
                <tr key={verification._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-semibold text-gray-900">
                        #{verification.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        Ref: {verification.orderReference || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-medium">
                      {verification.customerPhone || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {verification.orderDetails?.customerName || 'Customer'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(verification.detectedPayment?.amount || verification.orderDetails?.totalAmount || 0)}
                    </div>
                    <div className={`text-sm ${validation.color}`}>
                      {validation.icon} {validation.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        <span className="mr-2">{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                      {verification.status !== 'verified' && (
                        <span className={`text-xs ${fraudRisk.color}`}>
                          {fraudRisk.icon} Risk: {fraudRisk.level}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(verification.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(verification.createdAt).split(', ')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(verification)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        View
                      </button>
                      {verification.status !== 'verified' && (
                        <button
                          onClick={() => handleDelete(verification._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
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
      </div>
    );
  };

  const renderModal = () => {
    if (!isModalOpen || !selectedVerification) return null;

    const verification = selectedVerification;
    const statusConfig = STATUS_CONFIG[verification.status] || STATUS_CONFIG.pending;
    const validation = getValidationStatus(verification);
    const fraudRisk = getFraudRiskLevel(verification);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Payment Verification Details
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  <span className="text-sm text-gray-600">ID: {verification._id?.substring(0, 8)}...</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setAction('');
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-8 py-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">#{verification.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium">{verification.orderReference || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDateTime(verification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{verification.customerPhone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{verification.orderDetails?.customerName || 'N/A'}</span>
                    </div>
                    {verification.orderDetails?.pincode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pincode:</span>
                        <span className="font-medium">{verification.orderDetails.pincode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Order Amount:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(verification.orderDetails?.totalAmount || 0)}
                      </span>
                    </div>
                    {verification.detectedPayment?.amount && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Detected Amount:</span>
                        <span className={`text-xl font-bold ${validation.color.replace('text-', '')}`}>
                          {formatCurrency(verification.detectedPayment.amount)}
                        </span>
                      </div>
                    )}
                    <div className={`text-sm ${validation.color}`}>
                      {validation.icon} {validation.text}
                    </div>
                  </div>
                  
                  <div>
                    {verification.detectedPayment?.upiId && (
                      <div className="mb-3">
                        <div className="text-gray-600 text-sm mb-1">UPI ID:</div>
                        <div className="font-medium bg-white px-3 py-1.5 rounded border">
                          {verification.detectedPayment.upiId}
                        </div>
                      </div>
                    )}
                    {verification.detectedPayment?.transactionId && (
                      <div>
                        <div className="text-gray-600 text-sm mb-1">Transaction ID:</div>
                        <div className="font-medium bg-white px-3 py-1.5 rounded border font-mono text-sm">
                          {verification.detectedPayment.transactionId}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Results */}
            {verification.validationResults && Object.keys(verification.validationResults).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Amount Match:</span>
                      <span className={`font-medium ${validation.color}`}>
                        {validation.icon} {validation.text}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">UPI Match:</span>
                      <span className={`font-medium ${
                        verification.validationResults.upiMatch ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {verification.validationResults.upiMatch ? '✓ Match' : '✗ Mismatch'}
                      </span>
                    </div>
                    {verification.validationResults.confidenceScore && (
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">Confidence:</span>
                        <span className="font-medium">
                          {(verification.validationResults.confidenceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fraud Analysis */}
            {verification.fraudAnalysis && Object.keys(verification.fraudAnalysis).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-3">Risk Level:</span>
                      <span className={`font-medium ${fraudRisk.color}`}>
                        {fraudRisk.icon} {fraudRisk.level}
                      </span>
                    </div>
                    {verification.fraudAnalysis.fraudScore && (
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-3">Fraud Score:</span>
                        <span className="font-medium">
                          {(verification.fraudAnalysis.fraudScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {verification.fraudAnalysis.reasons?.length > 0 && (
                    <div>
                      <div className="text-gray-600 mb-2">Risk Factors:</div>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {verification.fraudAnalysis.reasons.map((reason, index) => (
                          <li key={index} className="text-sm">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => setAction('verified')}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                      action === 'verified'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    ✓ Mark as Verified
                  </button>
                  <button
                    onClick={() => setAction('rejected')}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                      action === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    ✗ Mark as Rejected
                  </button>
                  <button
                    onClick={() => setAction('fraud')}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                      action === 'fraud'
                        ? 'bg-red-800 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    🚨 Mark as Fraud
                  </button>
                </div>

                {action === 'rejected' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {action && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setAction('');
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(
                        verification._id,
                        action,
                        rejectionReason
                      )}
                      disabled={action === 'rejected' && !rejectionReason.trim()}
                      className={`px-6 py-2.5 rounded-lg font-medium text-white transition-colors ${
                        action === 'verified' ? 'bg-green-600 hover:bg-green-700' :
                        action === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                        action === 'fraud' ? 'bg-red-800 hover:bg-red-900' :
                        'bg-blue-600 hover:bg-blue-700'
                      } ${action === 'rejected' && !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Confirm Update
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Verification Dashboard
            </h1>
            <p className="text-gray-600">
              Manage, verify, and monitor payment confirmations from customers
            </p>
          </header>

          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Filters */}
          {renderFilters()}

          {/* Main Table Card */}
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Verifications
                  <span className="ml-2 text-gray-500">({filteredVerifications.length})</span>
                </h3>
                <button
                  onClick={fetchVerifications}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Table Content */}
            {renderTable()}
          </div>

          {/* Info Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>

        {/* Details Modal */}
        {renderModal()}
      </div>
    </>
  );
}