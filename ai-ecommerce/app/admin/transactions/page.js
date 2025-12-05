// src/app/payments/verification/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  fraud: 'bg-red-100 text-red-800 border-red-200',
  manual_review: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusIcons = {
  pending: '⏳',
  processing: '🔄',
  verified: '✅',
  rejected: '❌',
  fraud: '🚨',
  manual_review: '👁️',
};

export default function PaymentVerificationDashboard() {
  const [verifications, setVerifications] = useState([]);
  const [filteredVerifications, setFilteredVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    verified: 0,
    rejected: 0,
    fraud: 0,
    manual_review: 0,
  });

  // Fetch payment verifications
  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/verify');
      
      if (!response.ok) {
        throw new Error('Failed to fetch verifications');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setVerifications(data.data);
        setFilteredVerifications(data.data);
        updateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load payment verifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update statistics
  const updateStats = (data) => {
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

  // Filter verifications based on search and status
  useEffect(() => {
    let filtered = verifications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.orderNumber.toLowerCase().includes(term) ||
        v.customerPhone.includes(term) ||
        v.orderReference.toLowerCase().includes(term)
      );
    }

    setFilteredVerifications(filtered);
  }, [verifications, statusFilter, searchTerm]);

  // Handle verification update
  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      const response = await fetch(`/api/payments/verify?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          ...(reason && { rejectionReason: reason })
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Payment ${status} successfully`);
        fetchVerifications(); // Refresh data
        setIsModalOpen(false);
        setAction('');
        setRejectionReason('');
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle verification delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this verification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/verify?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification deleted successfully');
        fetchVerifications(); // Refresh data
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting verification:', error);
      toast.error('Failed to delete verification');
    }
  };

  // Handle view details
  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
    setIsModalOpen(true);
    setAction('');
    setRejectionReason('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Get validation status
  const getValidationStatus = (verification) => {
    if (verification.validationResults?.amountMatch !== undefined) {
      return verification.validationResults.amountMatch 
        ? { text: 'Amount Matched', color: 'text-green-600', icon: '✓' }
        : { text: 'Amount Mismatch', color: 'text-red-600', icon: '✗' };
    }
    return { text: 'Not Validated', color: 'text-gray-600', icon: '−' };
  };

  // Initial fetch
  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  // Stats cards data
  const statCards = [
    { title: 'Total', value: stats.total, icon: '📊', color: 'bg-blue-500' },
    { title: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-500' },
    { title: 'Verified', value: stats.verified, icon: '✅', color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected, icon: '❌', color: 'bg-red-500' },
    { title: 'Fraud', value: stats.fraud, icon: '🚨', color: 'bg-red-700' },
  ];

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'manual_review', label: 'Manual Review' },
  ];

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Verification Dashboard
            </h1>
            <p className="text-gray-600">
              Manage and verify payment confirmations from customers
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number, phone, or reference..."
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

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === option.value
                        ? option.value === 'all'
                          ? 'bg-gray-800 text-white'
                          : statusColors[option.value].replace('text-', 'text-white ').replace('bg-', 'bg-').split(' ')[0]
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Verifications ({filteredVerifications.length})
                </h3>
                <span className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading payment verifications...</p>
                </div>
              </div>
            ) : filteredVerifications.length === 0 ? (
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
            ) : (
              /* Table */
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
                        Amount
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
                      return (
                        <tr key={verification._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-semibold text-gray-900">
                                #{verification.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                Ref: {verification.orderReference}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 font-medium">
                              {verification.customerPhone}
                            </div>
                            {verification.orderDetails?.shippingAddress && (
                              <div className="text-sm text-gray-500">
                                {verification.orderDetails.shippingAddress.city || 'N/A'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(
                                verification.detectedPayment?.amount || 
                                verification.orderDetails?.totalAmount || 
                                0
                              )}
                            </div>
                            <div className={`text-sm ${validation.color}`}>
                              {validation.icon} {validation.text}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[verification.status]}`}>
                              <span className="mr-2">{statusIcons[verification.status]}</span>
                              {getStatusText(verification.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(verification.createdAt)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(verification.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDetails(verification)}
                                className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDelete(verification._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                Delete
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
        </div>

        {/* Details Modal */}
        {isModalOpen && selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Payment Verification Details
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      ID: {selectedVerification._id}
                    </p>
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
              <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="px-8 py-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Number:</span>
                            <span className="font-medium">#{selectedVerification.orderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-medium">{selectedVerification.orderReference}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedVerification.status]}`}>
                              {getStatusText(selectedVerification.status)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium">
                              {formatDate(selectedVerification.createdAt)} at {formatTime(selectedVerification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedVerification.customerPhone}</span>
                          </div>
                          {selectedVerification.orderDetails?.shippingAddress && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Address:</span>
                                <span className="font-medium text-right">
                                  {selectedVerification.orderDetails.shippingAddress.street || ''}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">City:</span>
                                <span className="font-medium">
                                  {selectedVerification.orderDetails.shippingAddress.city || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pincode:</span>
                                <span className="font-medium">
                                  {selectedVerification.orderDetails.pincode || 'N/A'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Order Amount:</span>
                            <span className="text-2xl font-bold text-gray-900">
                              {formatCurrency(selectedVerification.orderDetails?.totalAmount || 0)}
                            </span>
                          </div>
                          {selectedVerification.detectedPayment?.amount && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Detected Amount:</span>
                              <span className={`text-xl font-bold ${
                                selectedVerification.validationResults?.amountMatch
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {formatCurrency(selectedVerification.detectedPayment.amount)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          {selectedVerification.detectedPayment?.upiId && (
                            <div className="mb-3">
                              <div className="text-gray-600 text-sm">UPI ID:</div>
                              <div className="font-medium">{selectedVerification.detectedPayment.upiId}</div>
                            </div>
                          )}
                          {selectedVerification.detectedPayment?.transactionId && (
                            <div>
                              <div className="text-gray-600 text-sm">Transaction ID:</div>
                              <div className="font-medium">{selectedVerification.detectedPayment.transactionId}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Results */}
                  {selectedVerification.validationResults && Object.keys(selectedVerification.validationResults).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-3">Amount Match:</span>
                            <span className={`font-medium ${
                              selectedVerification.validationResults.amountMatch
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {selectedVerification.validationResults.amountMatch ? '✓ Match' : '✗ Mismatch'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-3">UPI Match:</span>
                            <span className={`font-medium ${
                              selectedVerification.validationResults.upiMatch
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {selectedVerification.validationResults.upiMatch ? '✓ Match' : '✗ Mismatch'}
                            </span>
                          </div>
                          {selectedVerification.validationResults.confidenceScore && (
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-3">Confidence:</span>
                              <span className="font-medium">
                                {(selectedVerification.validationResults.confidenceScore * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                        {selectedVerification.validationResults.validationErrors?.length > 0 && (
                          <div className="mt-4">
                            <div className="text-gray-600 mb-2">Validation Errors:</div>
                            <ul className="list-disc list-inside text-red-600">
                              {selectedVerification.validationResults.validationErrors.map((error, index) => (
                                <li key={index} className="text-sm">{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fraud Analysis */}
                  {selectedVerification.fraudAnalysis && Object.keys(selectedVerification.fraudAnalysis).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Analysis</h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-3">Suspicious:</span>
                            <span className={`font-medium ${
                              selectedVerification.fraudAnalysis.isSuspicious
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {selectedVerification.fraudAnalysis.isSuspicious ? 'Yes' : 'No'}
                            </span>
                          </div>
                          {selectedVerification.fraudAnalysis.fraudScore && (
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-3">Fraud Score:</span>
                              <span className="font-medium">
                                {(selectedVerification.fraudAnalysis.fraudScore * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                        {selectedVerification.fraudAnalysis.reasons?.length > 0 && (
                          <div>
                            <div className="text-gray-600 mb-2">Reasons:</div>
                            <ul className="list-disc list-inside text-gray-700">
                              {selectedVerification.fraudAnalysis.reasons.map((reason, index) => (
                                <li key={index} className="text-sm">{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Update Status Section */}
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
                              selectedVerification._id,
                              action,
                              rejectionReason
                            )}
                            disabled={action === 'rejected' && !rejectionReason.trim()}
                            className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
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
          </div>
        )}
      </div>
    </>
  );
}