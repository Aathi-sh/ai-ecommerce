// app/admin/transactions/page.js - PROFESSIONAL 3-OCR DASHBOARD
// Industry standard: Complete payment verification management with real-time updates

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import TransactionModal from '../../../src/components/TransactionModal';

// Import our professional OCR display utilities
import {
    STATUS_CONFIG as OCR_STATUS_CONFIG,
    RISK_CONFIG,
    MATCH_CONFIG,
    ENGINE_CONFIG,
    PAYMENT_TYPE_CONFIG,
    getStatusBadgeProps,
    getRiskBadgeProps,
    getMatchBadgeProps,
    getEngineBadgeProps,
    getPaymentTypeBadgeProps,
    formatConfidence,
    formatAmount,
    formatPhoneNumber,
    formatIndianDate,
    getTimeAgo,
    extractOcrFields,
    getValidationSummary,
    getFraudSummary
} from '../../../utils/ocrDisplay';

// ==================== API ENDPOINTS ====================
const API_ENDPOINTS = {
    verifications: '/api/payments/verify',
    getVerification: (id) => `/api/payments/verify?id=${id}`,
    updateStatus: (id, action) => `/api/payments/verify?id=${id}&action=${action}`,
    deleteVerification: (id) => `/api/payments/verify?id=${id}`,
    generateInvoice: (id) => `/api/payments/verify/${id}/invoice`,
    sendNotification: (id) => `/api/payments/verify/${id}/notify`
};

// ==================== MAIN COMPONENT ====================
export default function PaymentVerificationDashboard() {
    const router = useRouter();
    const { user, isAdmin, getAuthHeaders } = useAuth();
    
    // ===== STATE MANAGEMENT =====
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
    const [selectedRows, setSelectedRows] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    
    // Responsive state
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
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
        pendingAmount: 0,
        avgConfidence: 0
    });

    // Engine statistics
    const [engineStats, setEngineStats] = useState({});

    // Refs for intersection observer (infinite scroll)
    const observerRef = useRef();
    const lastItemRef = useRef();

    // ===== RESPONSIVE DETECTION =====
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // ===== DATA FETCHING =====
    const fetchVerifications = useCallback(async (showRefreshToast = false, page = 1) => {
        try {
            setLoading(true);
            if (showRefreshToast) setIsRefreshing(true);
            
            // Build query params
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
                sortBy,
                sortOrder
            });
            
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (dateRange.from) params.append('fromDate', dateRange.from);
            if (dateRange.to) params.append('toDate', dateRange.to);
            if (includeInactive) params.append('includeDeleted', 'true');
            
            const response = await fetch(`${API_ENDPOINTS.verifications}?${params.toString()}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                const data = result.data || [];
                
                // Handle pagination - append for infinite scroll
                if (page === 1) {
                    setVerifications(data);
                } else {
                    setVerifications(prev => [...prev, ...data]);
                }
                
                updateStatistics(data, result.stats, result.engineStats);
                
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
    }, [statusFilter, dateRange.from, dateRange.to, sortBy, sortOrder, includeInactive, getAuthHeaders]);

    // Update statistics
    const updateStatistics = (data, apiStats = null, apiEngineStats = null) => {
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
                    .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
                avgConfidence: data.length > 0 
                    ? data.reduce((sum, v) => sum + (v.ocrAnalysis?.confidenceScore || 0), 0) / data.length 
                    : 0
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
                    .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
                avgConfidence: data.length > 0 
                    ? data.reduce((sum, v) => sum + (v.ocrAnalysis?.confidenceScore || 0), 0) / data.length 
                    : 0
            });
        }

        if (apiEngineStats) {
            setEngineStats(apiEngineStats);
        }
    };

    // ===== FILTERING =====
    useEffect(() => {
        let filtered = verifications;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(v => v.status === statusFilter);
        }

        // Apply search filter with enhanced fields
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(v => {
                const ocrFields = extractOcrFields(v);
                return (
                    (v.orderNumber && v.orderNumber.toLowerCase().includes(term)) ||
                    (v.customerPhone && v.customerPhone.includes(term)) ||
                    (v.customerName && v.customerName.toLowerCase().includes(term)) ||
                    (ocrFields.upiId.value && ocrFields.upiId.value.toLowerCase().includes(term)) ||
                    (ocrFields.transactionId.value && ocrFields.transactionId.value.toLowerCase().includes(term)) ||
                    (v.detectedPayment?.transactionId && v.detectedPayment.transactionId.toLowerCase().includes(term)) ||
                    (v.ocrAnalysis?.extractedText && v.ocrAnalysis.extractedText.toLowerCase().includes(term))
                );
            });
        }

        setFilteredVerifications(filtered);
    }, [verifications, statusFilter, searchTerm]);

    // ===== INITIAL LOAD =====
    useEffect(() => {
        fetchVerifications();
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [fetchVerifications]);

    // ===== AUTO-REFRESH EVERY 30 SECONDS =====
    useEffect(() => {
        const interval = setInterval(() => {
            fetchVerifications();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [fetchVerifications]);

    // ===== INFINITE SCROLL OBSERVER =====
    useEffect(() => {
        if (loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && verifications.length < stats.total) {
                    const nextPage = Math.ceil(verifications.length / 50) + 1;
                    fetchVerifications(false, nextPage);
                }
            },
            { threshold: 0.5 }
        );

        if (lastItemRef.current) {
            observer.observe(lastItemRef.current);
        }

        return () => observer.disconnect();
    }, [loading, verifications.length, stats.total, fetchVerifications]);

    // ===== ACTIONS =====
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
                    method: 'manual',
                    confidenceScore: selectedVerification?.ocrAnalysis?.confidenceScore || 0
                }),
                ...(actionType === 'mark-fraud' && { 
                    reasons: typeof reason === 'string' ? [reason] : reason,
                    markedBy: user?.email || 'admin',
                    flags: ['admin_marked']
                })
            };

            const response = await fetch(API_ENDPOINTS.updateStatus(id, actionType), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Payment ${OCR_STATUS_CONFIG[status]?.label || status} successfully`);
                fetchVerifications(true);
                setIsModalOpen(false);
                setAction('');
                setRejectionReason('');
                setSelectedRows([]);
            } else {
                throw new Error(result.message || `Failed to ${actionType} payment`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedRows.length === 0) return;

        const actionType = bulkAction === 'verify' ? 'verify' : 
                          bulkAction === 'reject' ? 'reject' : 'mark-fraud';

        try {
            toast.loading(`Processing ${selectedRows.length} verifications...`);

            const promises = selectedRows.map(id => 
                fetch(API_ENDPOINTS.updateStatus(id, actionType), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        reason: 'Bulk action',
                        verifiedBy: user?.email || 'admin',
                        markedBy: user?.email || 'admin'
                    }),
                })
            );

            await Promise.all(promises);
            
            toast.dismiss();
            toast.success(`Successfully processed ${selectedRows.length} verifications`);
            fetchVerifications(true);
            setSelectedRows([]);
            setBulkAction('');
        } catch (error) {
            toast.dismiss();
            console.error('Bulk action error:', error);
            toast.error('Failed to process bulk action');
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
                headers: getAuthHeaders()
            });

            const result = await response.json();

            if (result.success) {
                toast.success(permanent ? 'Verification permanently deleted' : 'Verification deleted successfully');
                fetchVerifications(true);
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
                    ...getAuthHeaders()
                },
            });

            const result = await response.json();

            if (result.success) {
                toast.dismiss();
                toast.success('Invoice generated successfully');
                
                if (result.data?.invoiceUrl) {
                    window.open(result.data.invoiceUrl, '_blank');
                }
                
                fetchVerifications(true);
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
                    ...getAuthHeaders()
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

    const handleSelectRow = (id) => {
        setSelectedRows(prev => 
            prev.includes(id) 
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedRows.length === filteredVerifications.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredVerifications.map(v => v._id));
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateRange({ from: '', to: '' });
        setSortBy('createdAt');
        setSortOrder('desc');
        setIncludeInactive(false);
        setSelectedRows([]);
    };

    // ===== STATISTICS CARDS =====
    const statCards = [
        { 
            title: 'Total', 
            value: stats.total, 
            icon: '📊', 
            color: 'bg-blue-500',
            subValue: formatAmount(stats.totalAmount)
        },
        { 
            title: 'Pending', 
            value: stats.pending, 
            icon: '⏳', 
            color: 'bg-yellow-500',
            subValue: formatAmount(stats.pendingAmount)
        },
        { 
            title: 'Processing', 
            value: stats.processing, 
            icon: '🔄', 
            color: 'bg-blue-400',
            subValue: stats.processing > 0 ? formatAmount(stats.pendingAmount) : '₹0'
        },
        { 
            title: 'Verified', 
            value: stats.verified, 
            icon: '✅', 
            color: 'bg-green-500',
            subValue: formatAmount(stats.verifiedAmount)
        },
        { 
            title: 'Rejected', 
            value: stats.rejected, 
            icon: '❌', 
            color: 'bg-red-500',
            subValue: stats.rejected > 0 ? formatAmount(stats.pendingAmount) : '₹0'
        },
        { 
            title: 'Fraud', 
            value: stats.fraud, 
            icon: '🚨', 
            color: 'bg-red-700',
            subValue: stats.fraud > 0 ? formatAmount(stats.pendingAmount) : '₹0'
        }
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status', icon: '📋' },
        ...Object.entries(OCR_STATUS_CONFIG).map(([value, config]) => ({
            value,
            label: config.label,
            icon: config.icon
        }))
    ];

    const sortOptions = [
        { value: 'createdAt', label: 'Date Created' },
        { value: 'updatedAt', label: 'Last Updated' },
        { value: 'orderDetails.totalAmount', label: 'Amount' },
        { value: 'status', label: 'Status' },
        { value: 'ocrAnalysis.confidenceScore', label: 'Confidence' }
    ];

    // ===== RENDER =====
    return (
        <>
            <Head>
                <title>Payment Verification | Admin Dashboard</title>
                <meta name="description" content="Manage and verify customer payments with 3-OCR technology" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </Head>

            <Toaster 
                position={isMobile ? "top-center" : "top-right"}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1rem',
                        fontSize: isMobile ? '0.875rem' : '0.9rem',
                        maxWidth: isMobile ? '90%' : '400px'
                    },
                    success: {
                        icon: '✅',
                        style: { background: '#10b981' }
                    },
                    error: {
                        icon: '❌',
                        style: { background: '#ef4444' }
                    },
                    loading: {
                        icon: '⏳',
                        style: { background: '#3b82f6' }
                    }
                }}
            />

            <div className="payments-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Payment Verification</h1>
                        <p className="page-subtitle">
                            {stats.total} total • {stats.verified} verified • {stats.pending} pending
                        </p>
                        <div className="company-info">
                            <span className="company-name">{user?.companyName || 'Your Company'}</span>
                            <span className="role-badge">{isAdmin ? 'Admin' : 'Viewer'}</span>
                        </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="header-actions">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                            aria-label="Toggle filters"
                        >
                            <span className="btn-icon">🔍</span>
                            {!isMobile && (showFilters ? 'Hide Filters' : 'Show Filters')}
                        </button>
                        <button
                            onClick={() => fetchVerifications(true)}
                            disabled={isRefreshing}
                            className="refresh-btn"
                            aria-label="Refresh data"
                        >
                            <span className={`btn-icon ${isRefreshing ? 'spinning' : ''}`}>🔄</span>
                            {!isMobile && 'Refresh'}
                        </button>
                        {!isMobile && (
                            <button
                                onClick={resetFilters}
                                className="reset-btn"
                                aria-label="Reset filters"
                            >
                                <span className="btn-icon">🗑️</span>
                                Reset
                            </button>
                        )}
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

                {/* Engine Statistics */}
                {Object.keys(engineStats).length > 0 && !isMobile && (
                    <div className="engine-stats">
                        {Object.entries(engineStats).map(([engine, data]) => {
                            const engineConfig = ENGINE_CONFIG[engine] || ENGINE_CONFIG.paddle;
                            return (
                                <div key={engine} className="engine-stat">
                                    <span className="engine-icon">{engineConfig.icon}</span>
                                    <span className="engine-name">{engineConfig.label}</span>
                                    <span className="engine-count">{data.count}</span>
                                    <span className="engine-confidence">{Math.round(data.avgConfidence)}%</span>
                                </div>
                            );
                        })}
                    </div>
                )}

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
                                    <span className="date-separator">→</span>
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

                {/* Search and Status Filters */}
                <div className="filters-section">
                    {/* Search Input */}
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={isMobile ? "Search..." : "Search by order, phone, UPI, transaction..."}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="clear-search"
                                aria-label="Clear search"
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
                                {!isMobile && <span className="filter-label">{option.label}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedRows.length > 0 && (
                    <div className="bulk-actions-bar">
                        <span className="selected-count">{selectedRows.length} selected</span>
                        <div className="bulk-actions-group">
                            <select
                                value={bulkAction}
                                onChange={(e) => setBulkAction(e.target.value)}
                                className="bulk-select"
                            >
                                <option value="">Bulk Actions</option>
                                <option value="verify">✓ Verify Selected</option>
                                <option value="reject">✗ Reject Selected</option>
                                <option value="fraud">🚨 Mark as Fraud</option>
                            </select>
                            <button
                                onClick={handleBulkAction}
                                disabled={!bulkAction}
                                className="bulk-apply-btn"
                            >
                                Apply
                            </button>
                            <button
                                onClick={() => setSelectedRows([])}
                                className="bulk-clear-btn"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Card */}
                <div className="content-card">
                    {/* Card Header */}
                    <div className="card-header">
                        <div className="card-title-wrapper">
                            <h3 className="card-title">Payment Verifications</h3>
                            <span className="card-badge">{filteredVerifications.length}</span>
                        </div>
                        
                        {/* Select All */}
                        {filteredVerifications.length > 0 && (
                            <div className="select-all">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === filteredVerifications.length}
                                        onChange={handleSelectAll}
                                    />
                                    <span>Select All</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Table/Content */}
                    <div className="table-container">
                        {loading && verifications.length === 0 ? (
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
                            <>
                                {/* Desktop Table View */}
                                {!isMobile && (
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th className="select-col">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.length === filteredVerifications.length}
                                                            onChange={handleSelectAll}
                                                        />
                                                    </th>
                                                    <th>Order Details</th>
                                                    <th>Customer</th>
                                                    <th>Payment</th>
                                                    <th>OCR Results</th>
                                                    <th>Validation</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredVerifications.map((verification, index) => {
                                                    const ocrFields = extractOcrFields(verification);
                                                    const validation = getValidationSummary(verification);
                                                    const fraud = getFraudSummary(verification);
                                                    const confidence = formatConfidence(ocrFields.amount.confidence);
                                                    const statusConfig = OCR_STATUS_CONFIG[verification.status] || OCR_STATUS_CONFIG.pending;
                                                    const engineConfig = ENGINE_CONFIG[verification.ocrAnalysis?.primaryEngine] || ENGINE_CONFIG.paddle;
                                                    const matchConfig = MATCH_CONFIG[validation.matchQuality] || MATCH_CONFIG.none;
                                                    
                                                    return (
                                                        <tr 
                                                            key={verification._id} 
                                                            className={statusConfig.hoverColor}
                                                            ref={index === filteredVerifications.length - 1 ? lastItemRef : null}
                                                        >
                                                            <td className="select-col">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRows.includes(verification._id)}
                                                                    onChange={() => handleSelectRow(verification._id)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div className="order-details">
                                                                    <span className="order-number">#{verification.orderNumber}</span>
                                                                    <span className="order-reference">
                                                                        Ref: {verification._id.slice(-8)}
                                                                    </span>
                                                                    {ocrFields.amount.difference > 0 && (
                                                                        <span className={`amount-diff ${confidence.color}`}>
                                                                            Diff: ₹{ocrFields.amount.difference}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="customer-details">
                                                                    <span className="customer-phone">
                                                                        {formatPhoneNumber(verification.customerPhone)}
                                                                    </span>
                                                                    <span className="customer-name">
                                                                        {verification.orderDetails?.customerName || verification.customerName || 'Customer'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="payment-details">
                                                                    <span className="payment-amount">
                                                                        {formatAmount(ocrFields.amount.value)}
                                                                    </span>
                                                                    {ocrFields.upiId.value && (
                                                                        <span className="upi-id" title={ocrFields.upiId.value}>
                                                                            UPI: {ocrFields.upiId.value.split('@')[0]}@...
                                                                        </span>
                                                                    )}
                                                                    {ocrFields.transactionId.value && (
                                                                        <span className="transaction-id" title={ocrFields.transactionId.value}>
                                                                            TXN: {ocrFields.transactionId.value.slice(-8)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ocr-details">
                                                                    <div className="engine-badge" style={{ backgroundColor: engineConfig.bgColor, color: engineConfig.color }}>
                                                                        <span>{engineConfig.icon}</span>
                                                                        <span>{engineConfig.shortLabel}</span>
                                                                        {verification.ocrAnalysis?.backupUsed && (
                                                                            <span className="backup-indicator" title="Backup engine used">+</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="confidence-score" style={{ color: confidence.color }}>
                                                                        {confidence.icon} {ocrFields.amount.confidence}%
                                                                    </div>
                                                                    <div className="word-count">
                                                                        {ocrFields.wordCount} words
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="validation-details">
                                                                    <div className={`match-badge ${matchConfig.color}`} style={{ backgroundColor: matchConfig.bgColor }}>
                                                                        <span>{matchConfig.icon}</span>
                                                                        <span>{matchConfig.shortLabel}</span>
                                                                    </div>
                                                                    <div className={`risk-badge ${fraud.riskConfig.color}`} style={{ backgroundColor: fraud.riskConfig.bgColor }}>
                                                                        <span>{fraud.riskConfig.icon}</span>
                                                                        <span>{fraud.riskConfig.shortLabel}</span>
                                                                    </div>
                                                                    {validation.issues.length > 0 && (
                                                                        <span className="issue-indicator" title={validation.issues[0]}>
                                                                            ⚠️ {validation.issues.length}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="status-wrapper">
                                                                    <span className={`status-badge ${statusConfig.color}`} style={{ backgroundColor: statusConfig.bgColor }}>
                                                                        <span className="status-icon">{statusConfig.icon}</span>
                                                                        {statusConfig.shortLabel}
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
                                                                    <span className="date-main" title={formatIndianDate(verification.createdAt, true)}>
                                                                        {getTimeAgo(verification.createdAt)}
                                                                    </span>
                                                                    {verification.verifiedAt && (
                                                                        <span className="date-verified" title={formatIndianDate(verification.verifiedAt, true)}>
                                                                            ✓ {getTimeAgo(verification.verifiedAt)}
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
                                                                        👁️
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
                                                                            <button
                                                                                onClick={() => handleSendNotification(verification)}
                                                                                className="action-button notify"
                                                                                title="Send Notification"
                                                                            >
                                                                                🔔
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(verification._id, false)}
                                                                                className="action-button delete"
                                                                                title="Soft Delete"
                                                                            >
                                                                                🗑️
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

                                {/* Mobile Card View */}
                                {isMobile && (
                                    <div className="mobile-cards">
                                        {filteredVerifications.map((verification, index) => {
                                            const ocrFields = extractOcrFields(verification);
                                            const validation = getValidationSummary(verification);
                                            const fraud = getFraudSummary(verification);
                                            const confidence = formatConfidence(ocrFields.amount.confidence);
                                            const statusConfig = OCR_STATUS_CONFIG[verification.status] || OCR_STATUS_CONFIG.pending;
                                            
                                            return (
                                                <div 
                                                    key={verification._id} 
                                                    className="mobile-card"
                                                    onClick={() => handleViewDetails(verification)}
                                                    ref={index === filteredVerifications.length - 1 ? lastItemRef : null}
                                                >
                                                    <div className="mobile-card-header">
                                                        <div>
                                                            <span className="order-number">#{verification.orderNumber}</span>
                                                            <span className={`status-badge ${statusConfig.color}`}>
                                                                <span className="status-icon">{statusConfig.icon}</span>
                                                                {statusConfig.shortLabel}
                                                            </span>
                                                        </div>
                                                        <span className="date-main">{getTimeAgo(verification.createdAt)}</span>
                                                    </div>
                                                    
                                                    <div className="mobile-card-body">
                                                        <div className="mobile-row">
                                                            <span className="mobile-label">Customer:</span>
                                                            <span className="mobile-value">
                                                                {formatPhoneNumber(verification.customerPhone)}
                                                                {verification.customerName && ` • ${verification.customerName}`}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="mobile-row">
                                                            <span className="mobile-label">Amount:</span>
                                                            <span className="mobile-value">
                                                                {formatAmount(ocrFields.amount.value)}
                                                                {ocrFields.amount.difference > 0 && (
                                                                    <span className={`amount-diff ${confidence.color}`}>
                                                                        {' '}(diff ₹{ocrFields.amount.difference})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="mobile-row">
                                                            <span className="mobile-label">UPI:</span>
                                                            <span className="mobile-value upi">
                                                                {ocrFields.upiId.value || 'N/A'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="mobile-badges">
                                                            <span className={`confidence-badge`} style={{ backgroundColor: confidence.bgColor, color: confidence.color }}>
                                                                {confidence.icon} {ocrFields.amount.confidence}%
                                                            </span>
                                                            <span className={`risk-badge ${fraud.riskConfig.color}`} style={{ backgroundColor: fraud.riskConfig.bgColor }}>
                                                                {fraud.riskConfig.icon} {fraud.riskConfig.shortLabel}
                                                            </span>
                                                            {validation.issues.length > 0 && (
                                                                <span className="issue-badge">⚠️ {validation.issues.length}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mobile-card-footer">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewDetails(verification);
                                                            }}
                                                            className="mobile-action view"
                                                        >
                                                            👁️ View
                                                        </button>
                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSendNotification(verification);
                                                                    }}
                                                                    className="mobile-action notify"
                                                                >
                                                                    🔔 Notify
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(verification._id, false);
                                                                    }}
                                                                    className="mobile-action delete"
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Loading More Indicator */}
                                {loading && verifications.length > 0 && (
                                    <div className="loading-more">
                                        <div className="spinner-small"></div>
                                        <span>Loading more...</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Table Footer */}
                    {filteredVerifications.length > 0 && (
                        <div className="table-footer">
                            <p className="footer-text">
                                Showing {filteredVerifications.length} of {stats.total} total verifications
                            </p>
                            <p className="footer-total">
                                Total Amount: {formatAmount(
                                    filteredVerifications.reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0)
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                transaction={selectedVerification}
                onAction={handleUpdateStatus}
                onGenerateInvoice={handleGenerateInvoice}
                onSendNotification={handleSendNotification}
                onViewOrder={handleViewOrder}
                onDelete={handleDelete}
                isAdmin={isAdmin}
            />

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .payments-container {
                    padding: ${isMobile ? '1rem' : '1.5rem'};
                    max-width: 1600px;
                    margin: 0 auto;
                    width: 100%;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                }

                /* ==================== PAGE HEADER ==================== */
                .page-header {
                    margin-bottom: ${isMobile ? '1rem' : '1.5rem'};
                    display: flex;
                    flex-direction: ${isMobile ? 'column' : 'row'};
                    justify-content: space-between;
                    align-items: ${isMobile ? 'flex-start' : 'center'};
                    gap: ${isMobile ? '0.75rem' : '1rem'};
                    flex-wrap: wrap;
                }

                .page-title {
                    font-size: ${isMobile ? '1.5rem' : 'clamp(1.5rem, 3vw, 2rem)'};
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                    line-height: 1.2;
                }

                .page-subtitle {
                    margin-top: 0.25rem;
                    color: #6b7280;
                    font-size: ${isMobile ? '0.8rem' : '0.875rem'};
                }

                .company-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.25rem;
                }

                .company-name {
                    font-size: ${isMobile ? '0.75rem' : '0.8rem'};
                    color: #3b82f6;
                    background: #3b82f610;
                    padding: 0.2rem 0.5rem;
                    border-radius: 1rem;
                }

                .role-badge {
                    font-size: ${isMobile ? '0.7rem' : '0.75rem'};
                    color: #10b981;
                    background: #10b98110;
                    padding: 0.2rem 0.5rem;
                    border-radius: 1rem;
                }

                .header-actions {
                    display: flex;
                    gap: 0.5rem;
                    width: ${isMobile ? '100%' : 'auto'};
                }

                .filter-toggle-btn,
                .refresh-btn,
                .reset-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: ${isMobile ? '0.75rem' : '0.625rem 1rem'};
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    background: white;
                    color: #374151;
                    font-size: ${isMobile ? '0.875rem' : '0.875rem'};
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex: ${isMobile ? '1' : 'none'};
                    min-height: ${isMobile ? '44px' : 'auto'};
                }

                .filter-toggle-btn:hover,
                .refresh-btn:hover:not(:disabled),
                .reset-btn:hover {
                    background: #f9fafb;
                    border-color: #3b82f6;
                    transform: translateY(-1px);
                }

                .filter-toggle-btn.active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }

                .refresh-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-icon {
                    display: inline-block;
                    font-size: 1rem;
                }

                .spinning {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* ==================== STATISTICS GRID ==================== */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(${isMobile ? '140px' : '160px'}, 1fr));
                    gap: ${isMobile ? '0.5rem' : '0.75rem'};
                    margin-bottom: ${isMobile ? '1rem' : '1.25rem'};
                }

                .stat-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    padding: ${isMobile ? '0.75rem' : '1rem'};
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: ${isMobile ? '0.7rem' : '0.75rem'};
                    color: #6b7280;
                    margin: 0 0 0.15rem;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .stat-value {
                    font-size: ${isMobile ? '1.1rem' : '1.25rem'};
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                    line-height: 1.2;
                }

                .stat-subvalue {
                    font-size: ${isMobile ? '0.65rem' : '0.7rem'};
                    color: #6b7280;
                    margin: 0.15rem 0 0;
                }

                .stat-icon {
                    width: ${isMobile ? '2rem' : '2.25rem'};
                    height: ${isMobile ? '2rem' : '2.25rem'};
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: ${isMobile ? '1rem' : '1.1rem'};
                }

                .stat-icon.bg-blue-500 { background: #3b82f6; }
                .stat-icon.bg-yellow-500 { background: #eab308; }
                .stat-icon.bg-blue-400 { background: #60a5fa; }
                .stat-icon.bg-green-500 { background: #22c55e; }
                .stat-icon.bg-red-500 { background: #ef4444; }
                .stat-icon.bg-red-700 { background: #b91c1c; }

                .stat-progress {
                    width: 100%;
                    height: 0.25rem;
                    background: #e5e7eb;
                    border-radius: 1rem;
                    overflow: hidden;
                }

                .stat-progress-bar {
                    height: 100%;
                    border-radius: 1rem;
                    transition: width 0.3s ease;
                }

                .stat-progress-bar.bg-blue-500 { background: #3b82f6; }
                .stat-progress-bar.bg-yellow-500 { background: #eab308; }
                .stat-progress-bar.bg-blue-400 { background: #60a5fa; }
                .stat-progress-bar.bg-green-500 { background: #22c55e; }
                .stat-progress-bar.bg-red-500 { background: #ef4444; }
                .stat-progress-bar.bg-red-700 { background: #b91c1c; }

                /* ==================== ENGINE STATISTICS ==================== */
                .engine-stats {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                    padding: 0.75rem;
                    background: white;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    overflow-x: auto;
                }

                .engine-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.35rem 0.75rem;
                    background: #f9fafb;
                    border-radius: 2rem;
                    font-size: 0.8rem;
                    white-space: nowrap;
                }

                .engine-icon {
                    font-size: 0.9rem;
                }

                .engine-name {
                    font-weight: 500;
                    color: #374151;
                }

                .engine-count {
                    color: #6b7280;
                }

                .engine-confidence {
                    font-weight: 600;
                    color: #3b82f6;
                }

                /* ==================== FILTERS PANEL ==================== */
                .filters-panel {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    padding: ${isMobile ? '0.75rem' : '1rem'};
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
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
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
                    border-radius: 0.5rem;
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
                    font-size: 1rem;
                }

                .sort-order {
                    display: flex;
                    gap: 0.5rem;
                }

                .sort-order-btn {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    background: white;
                    color: #374151;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .sort-order-btn:hover {
                    background: #f9fafb;
                }

                .sort-order-btn.active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }

                /* ==================== FILTERS SECTION ==================== */
                .filters-section {
                    display: flex;
                    flex-direction: ${isMobile ? 'column' : 'row'};
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    align-items: ${isMobile ? 'stretch' : 'center'};
                }

                .search-wrapper {
                    position: relative;
                    flex: 1;
                    max-width: ${isMobile ? '100%' : '400px'};
                }

                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    font-size: 1rem;
                    pointer-events: none;
                }

                .search-input {
                    width: 100%;
                    padding: ${isMobile ? '0.875rem 2.5rem 0.875rem 2.5rem' : '0.75rem 2.5rem 0.75rem 2.5rem'};
                    border: 1px solid #d1d5db;
                    border-radius: 0.75rem;
                    font-size: ${isMobile ? '1rem' : '0.875rem'};
                    transition: all 0.2s ease;
                    background: white;
                    -webkit-appearance: none;
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
                    font-size: 1.25rem;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .clear-search:hover {
                    color: #4b5563;
                }

                .filter-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.25rem;
                    -webkit-overflow-scrolling: touch;
                }

                .filter-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.375rem;
                    padding: ${isMobile ? '0.625rem 0.75rem' : '0.5rem 0.75rem'};
                    border: 1px solid #e5e7eb;
                    border-radius: 2rem;
                    background: white;
                    color: #374151;
                    font-size: ${isMobile ? '0.875rem' : '0.8rem'};
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    min-height: ${isMobile ? '40px' : 'auto'};
                }

                .filter-button:hover {
                    background: #f9fafb;
                    border-color: #3b82f6;
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

                .filter-icon {
                    font-size: ${isMobile ? '1rem' : '0.9rem'};
                }

                .filter-label {
                    font-weight: 500;
                }

                /* ==================== BULK ACTIONS ==================== */
                .bulk-actions-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #3b82f6;
                    color: white;
                    padding: ${isMobile ? '0.75rem' : '0.75rem 1rem'};
                    border-radius: 0.75rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .selected-count {
                    font-weight: 600;
                    font-size: ${isMobile ? '0.9rem' : '1rem'};
                }

                .bulk-actions-group {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .bulk-select {
                    padding: ${isMobile ? '0.5rem' : '0.375rem 0.75rem'};
                    border-radius: 0.5rem;
                    border: none;
                    font-size: ${isMobile ? '0.875rem' : '0.8rem'};
                    background: white;
                    color: #1f2937;
                    cursor: pointer;
                }

                .bulk-apply-btn,
                .bulk-clear-btn {
                    padding: ${isMobile ? '0.5rem 1rem' : '0.375rem 1rem'};
                    border-radius: 0.5rem;
                    border: none;
                    font-size: ${isMobile ? '0.875rem' : '0.8rem'};
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bulk-apply-btn {
                    background: white;
                    color: #3b82f6;
                }

                .bulk-apply-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bulk-clear-btn {
                    background: rgba(255,255,255,0.2);
                    color: white;
                }

                .bulk-clear-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                /* ==================== CONTENT CARD ==================== */
                .content-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                    overflow: hidden;
                }

                .card-header {
                    padding: ${isMobile ? '0.75rem 1rem' : '1rem 1.5rem'};
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f9fafb;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .card-title-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .card-title {
                    font-size: ${isMobile ? '1rem' : '1.125rem'};
                    font-weight: 600;
                    color: #374151;
                    margin: 0;
                }

                .card-badge {
                    background: #e5e7eb;
                    color: #4b5563;
                    padding: 0.2rem 0.75rem;
                    border-radius: 2rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .select-all {
                    font-size: 0.875rem;
                }

                /* ==================== TABLE STYLES ==================== */
                .table-container {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .table-responsive {
                    min-width: 100%;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 1400px;
                }

                .data-table th {
                    text-align: left;
                    padding: 1rem 1rem;
                    background: #f9fafb;
                    color: #4b5563;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    border-bottom: 1px solid #e5e7eb;
                    white-space: nowrap;
                }

                .data-table td {
                    padding: 1rem 1rem;
                    color: #1f2937;
                    font-size: 0.875rem;
                    border-bottom: 1px solid #e5e7eb;
                    transition: background 0.15s ease;
                }

                .data-table tr:hover td {
                    background: #f9fafb;
                }

                .select-col {
                    width: 40px;
                    text-align: center;
                }

                .select-col input[type="checkbox"] {
                    width: 1rem;
                    height: 1rem;
                    cursor: pointer;
                }

                /* Table Cell Content */
                .order-details,
                .customer-details,
                .payment-details,
                .ocr-details,
                .validation-details,
                .status-wrapper,
                .date-wrapper,
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .order-number {
                    font-weight: 600;
                    color: #1f2937;
                }

                .order-reference {
                    font-size: 0.7rem;
                    color: #6b7280;
                }

                .amount-diff {
                    font-size: 0.65rem;
                    font-weight: 500;
                }

                .customer-phone {
                    font-weight: 500;
                }

                .customer-name {
                    font-size: 0.7rem;
                    color: #6b7280;
                }

                .payment-amount {
                    font-weight: 600;
                }

                .upi-id,
                .transaction-id {
                    font-size: 0.65rem;
                    color: #6b7280;
                    cursor: help;
                }

                .ocr-details {
                    gap: 0.35rem;
                }

                .engine-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 1rem;
                    font-size: 0.7rem;
                    font-weight: 500;
                    width: fit-content;
                }

                .backup-indicator {
                    font-size: 0.8rem;
                    margin-left: 0.15rem;
                }

                .confidence-score {
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .word-count {
                    font-size: 0.65rem;
                    color: #6b7280;
                }

                .match-badge,
                .risk-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.2rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 1rem;
                    font-size: 0.65rem;
                    font-weight: 500;
                    width: fit-content;
                }

                .issue-indicator {
                    font-size: 0.65rem;
                    color: #f59e0b;
                    cursor: help;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 1rem;
                    font-size: 0.7rem;
                    font-weight: 500;
                    width: fit-content;
                }

                .status-icon {
                    font-size: 0.8rem;
                }

                .attempt-badge {
                    font-size: 0.6rem;
                    color: #6b7280;
                    background: #f3f4f6;
                    padding: 0.1rem 0.35rem;
                    border-radius: 0.25rem;
                    width: fit-content;
                }

                .date-main {
                    font-weight: 500;
                    font-size: 0.75rem;
                }

                .date-verified {
                    font-size: 0.65rem;
                    color: #10b981;
                }

                .action-buttons {
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 0.35rem;
                }

                .action-button {
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    background: #f3f4f6;
                    color: #4b5563;
                }

                .action-button:hover {
                    transform: translateY(-1px);
                }

                .action-button.view:hover {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .action-button.invoice:hover {
                    background: #dcfce7;
                    color: #166534;
                }

                .action-button.order:hover {
                    background: #f3e8ff;
                    color: #6b21a8;
                }

                .action-button.notify:hover {
                    background: #fef9c3;
                    color: #854d0e;
                }

                .action-button.delete:hover {
                    background: #fee2e2;
                    color: #991b1b;
                }

                /* ==================== MOBILE CARDS ==================== */
                .mobile-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding: 0.75rem;
                }

                .mobile-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 1rem;
                    padding: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    transition: all 0.2s ease;
                }

                .mobile-card:active {
                    background: #f9fafb;
                }

                .mobile-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .mobile-card-header .order-number {
                    font-size: 1rem;
                    margin-right: 0.5rem;
                }

                .mobile-card-header .status-badge {
                    font-size: 0.7rem;
                }

                .mobile-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .mobile-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                }

                .mobile-label {
                    min-width: 70px;
                    color: #6b7280;
                }

                .mobile-value {
                    flex: 1;
                    color: #1f2937;
                    word-break: break-word;
                }

                .mobile-value.upi {
                    font-family: monospace;
                    font-size: 0.8rem;
                }

                .mobile-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }

                .confidence-badge,
                .risk-badge,
                .issue-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 1rem;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .mobile-card-footer {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid #e5e7eb;
                }

                .mobile-action {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    background: white;
                    color: #374151;
                    font-size: 0.75rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                }

                .mobile-action.view {
                    background: #dbeafe;
                    color: #1e40af;
                    border-color: #bfdbfe;
                }

                .mobile-action.notify {
                    background: #fef9c3;
                    color: #854d0e;
                    border-color: #fde68a;
                }

                .mobile-action.delete {
                    background: #fee2e2;
                    color: #991b1b;
                    border-color: #fecaca;
                }

                .mobile-action:active {
                    transform: scale(0.98);
                }

                /* ==================== LOADING STATES ==================== */
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 1rem;
                }

                .spinner {
                    width: 3rem;
                    height: 3rem;
                    border: 3px solid #e5e7eb;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                .spinner-small {
                    width: 1.5rem;
                    height: 1.5rem;
                    border: 2px solid #e5e7eb;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .loading-more {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    color: #6b7280;
                }

                /* ==================== EMPTY STATE ==================== */
                .empty-state {
                    text-align: center;
                    padding: ${isMobile ? '3rem 1rem' : '4rem 1rem'};
                }

                .empty-icon {
                    font-size: ${isMobile ? '3rem' : '4rem'};
                    margin-bottom: 1rem;
                    color: #d1d5db;
                }

                .empty-title {
                    font-size: ${isMobile ? '1.1rem' : '1.25rem'};
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 0.5rem;
                }

                .empty-message {
                    color: #6b7280;
                    font-size: ${isMobile ? '0.875rem' : '0.9rem'};
                    margin: 0 0 1.5rem;
                }

                .empty-button {
                    padding: 0.75rem 1.5rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    min-height: ${isMobile ? '44px' : 'auto'};
                }

                .empty-button:hover {
                    background: #2563eb;
                }

                /* ==================== TABLE FOOTER ==================== */
                .table-footer {
                    padding: ${isMobile ? '0.75rem 1rem' : '1rem 1.5rem'};
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                    display: flex;
                    flex-direction: ${isMobile ? 'column' : 'row'};
                    justify-content: space-between;
                    align-items: ${isMobile ? 'flex-start' : 'center'};
                    gap: 0.5rem;
                }

                .footer-text {
                    margin: 0;
                    color: #6b7280;
                    font-size: ${isMobile ? '0.8rem' : '0.875rem'};
                }

                .footer-total {
                    margin: 0;
                    color: #1f2937;
                    font-size: ${isMobile ? '0.9rem' : '1rem'};
                    font-weight: 600;
                }

                /* ==================== UTILITY CLASSES ==================== */
                .text-green-600 { color: #16a34a; }
                .text-red-600 { color: #dc2626; }
                .text-yellow-600 { color: #ca8a04; }
                .text-blue-600 { color: #2563eb; }
                .text-purple-600 { color: #9333ea; }
                .text-orange-600 { color: #ea580c; }

                .bg-green-50 { background: #f0fdf4; }
                .bg-red-50 { background: #fef2f2; }
                .bg-yellow-50 { background: #fefce8; }
                .bg-blue-50 { background: #eff6ff; }
                .bg-purple-50 { background: #faf5ff; }
                .bg-orange-50 { background: #fff7ed; }
            `}</style>
        </>
    );
}