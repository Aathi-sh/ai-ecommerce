'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Head from 'next/head';
import { appTheme } from "../../../src/constants/theme";
import { useAuth } from '../../../context/AuthContext';
import {
    Plus, Edit2, Trash2, Eye, EyeOff, Search, X,
    ChevronLeft, ChevronRight, RefreshCw, Download,
    Filter, Grid, List, FolderTree, FolderPlus,
    Package, ChevronDown, ChevronUp, MoreVertical,
    CheckCircle, AlertCircle, AlertTriangle, XCircle,
    Save, Upload, Image as ImageIcon, DollarSign,
    Percent, Calendar, Tag, Box, Truck, Globe,
    Settings, Shield, Zap, Star, Heart, Award,
    ShoppingCart, Clock, MapPin, Phone, Mail,
    FileText, Copy, Check, Loader2, Camera, Video, Link2, Hash,
    AtSign, FileSignature, Palette, Brush, Sparkles,
    Crown, Gem, Diamond, Gift, ThumbsUp, ThumbsDown,
    MessageSquare, Send, Paperclip, Smile, Home,
    ArrowLeft, ArrowRight, Grid as GridIcon, List as ListIcon,
    Filter as FilterIcon, Search as SearchIcon, MoreHorizontal,
    Download as DownloadIcon, Printer, Share2, Bookmark,
    Lock, Unlock, Key, Wifi, WifiOff, Battery, BatteryCharging,
    Cpu, HardDrive, Server, Cloud, CloudOff, Repeat,
    Shuffle, Play, Pause, Square, Circle, Triangle,
    Hexagon, Octagon, Building2, CreditCard, Landmark,
    Receipt, HeadphonesIcon, PhoneCall, MailOpen,
    MapPinHouse, Building, Store, Globe2, Facebook,
    Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
    Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
    Activity, TrendingUp, Users, Briefcase, Calendar as CalendarIcon,
    Menu, Layers, Layout, Info, HelpCircle, Flag
} from 'lucide-react';

// ==================== CONSTANTS ====================
const ITEMS_PER_PAGE = 10;

// Helper to validate ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Helper to get time ago
const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
};

export default function MastersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (!isCompanyAdmin && !isSuperAdmin) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isCompanyAdmin, isSuperAdmin, router]);

    // ==================== STATE MANAGEMENT ====================
    const [loading, setLoading] = useState(true);
    const [allCategories, setAllCategories] = useState([]); // Store ALL categories
    const [categories, setCategories] = useState([]); // Filtered categories for display
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        main: 0,
        sub: 0
    });
    
    // UI State
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(ITEMS_PER_PAGE);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [parentCategories, setParentCategories] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📦',
        displayOrder: 0,
        parentId: '',
        isActive: true
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    
    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    // Toast State
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    
    // Refs
    const searchTimeoutRef = useRef(null);
    const modalRef = useRef(null);

    // ==================== HELPER FUNCTIONS ====================
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => {
            setToast({ show: false, type: '', message: '' });
        }, 3000);
    };

    // Calculate stats from categories
    const calculateStats = (categoriesList) => {
        const total = categoriesList.length;
        const active = categoriesList.filter(c => c.isActive === true).length;
        const inactive = total - active;
        const main = categoriesList.filter(c => c.level === 0 || !c.parentId).length;
        const sub = total - main;
        
        setStats({ total, active, inactive, main, sub });
    };

    // Filter categories based on search and status
    const filterCategories = useCallback((cats, search, status) => {
        let filtered = [...cats];
        
        // Apply status filter
        if (status === 'active') {
            filtered = filtered.filter(c => c.isActive === true);
        } else if (status === 'inactive') {
            filtered = filtered.filter(c => c.isActive === false);
        }
        
        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(searchLower) ||
                (c.description && c.description.toLowerCase().includes(searchLower)) ||
                (c.slug && c.slug.toLowerCase().includes(searchLower))
            );
        }
        
        setCategories(filtered);
        setCurrentPage(1);
    }, []);

    // ==================== FETCH DATA ====================
    const fetchCategories = useCallback(async () => {
        if (!user?.companyId) return;
        
        setLoading(true);
        try {
            // Fetch flat list with level indicators
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'categories',
                format: 'flat'
            });
            
            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            console.log('Fetched categories:', data);
            
            if (data.success && data.data) {
                setAllCategories(data.data);
                filterCategories(data.data, searchTerm, statusFilter);
                calculateStats(data.data);
            } else {
                showToast('error', data.message || 'Failed to load categories');
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            showToast('error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [user?.companyId, getAuthHeaders, searchTerm, statusFilter, filterCategories]);

    // Fetch parent categories (for subcategory creation) - ONLY ACTIVE MAIN CATEGORIES
    const fetchParentCategories = useCallback(async () => {
        if (!user?.companyId) return;
        
        try {
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'categories',
                format: 'flat'
            });
            
            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (data.success && data.data) {
                // Only show ACTIVE main categories as parent options
                // Also exclude the current category when editing
                const mains = data.data.filter(c => 
                    (c.level === 0 || !c.parentId) && 
                    c.isActive === true &&
                    (modalMode !== 'edit' || c._id !== selectedCategory?._id)
                );
                setParentCategories(mains);
            }
        } catch (error) {
            console.error('Failed to fetch parent categories:', error);
        }
    }, [user?.companyId, getAuthHeaders, modalMode, selectedCategory]);

    // ==================== CRUD OPERATIONS ====================
    const handleAddCategory = () => {
        setModalMode('add');
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            icon: '📦',
            displayOrder: 0,
            parentId: '',
            isActive: true
        });
        setFormErrors({});
        fetchParentCategories();
        setShowModal(true);
    };

    const handleAddSubCategory = (parentCategory) => {
        setModalMode('add');
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            icon: '📦',
            displayOrder: 0,
            parentId: parentCategory._id,
            isActive: true
        });
        setFormErrors({});
        fetchParentCategories();
        setShowModal(true);
    };

    const handleEditCategory = (category) => {
        setModalMode('edit');
        setSelectedCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            icon: category.icon || '📦',
            displayOrder: category.displayOrder || 0,
            parentId: category.parentId || '',
            isActive: category.isActive !== false
        });
        setFormErrors({});
        fetchParentCategories();
        setShowModal(true);
    };

    const handleViewCategory = (category) => {
        setModalMode('view');
        setSelectedCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            icon: category.icon || '📦',
            displayOrder: category.displayOrder || 0,
            parentId: category.parentId || '',
            isActive: category.isActive !== false
        });
        setShowModal(true);
    };

    const handleToggleStatus = async (category) => {
        try {
            const newStatus = !category.isActive;
            
            const res = await fetch(`/api/masters?type=categories`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    action: 'toggle-status',
                    id: category._id,
                    isActive: newStatus
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                showToast('success', `Category ${newStatus ? 'activated' : 'deactivated'} successfully`);
                // Refresh the entire list to get updated data
                await fetchCategories();
            } else {
                showToast('error', data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
            showToast('error', 'Failed to update status');
        }
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        
        setDeleting(true);
        try {
            const res = await fetch(`/api/masters?type=categories&id=${categoryToDelete._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await res.json();
            
            if (data.success) {
                showToast('success', 'Category deleted successfully');
                await fetchCategories();
                setShowDeleteModal(false);
                setCategoryToDelete(null);
            } else {
                showToast('error', data.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
            showToast('error', 'Failed to delete category');
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Category name is required';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        setSubmitting(true);
        
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description,
                icon: formData.icon,
                displayOrder: parseInt(formData.displayOrder) || 0,
                parentId: formData.parentId || null,
                isActive: formData.isActive
            };
            
            let url = `/api/masters?type=categories`;
            let method = 'POST';
            
            if (modalMode === 'edit' && selectedCategory) {
                method = 'PUT';
                url = `/api/masters?type=categories&id=${selectedCategory._id}`;
            }
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (data.success) {
                showToast('success', modalMode === 'add' ? 'Category created successfully' : 'Category updated successfully');
                setShowModal(false);
                await fetchCategories(); // Refresh the list
            } else {
                showToast('error', data.message || 'Failed to save category');
            }
        } catch (error) {
            console.error('Failed to save category:', error);
            showToast('error', 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (user?.companyId) {
            fetchCategories();
        }
    }, [user?.companyId, fetchCategories]);

    // Handle search with debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            filterCategories(allCategories, searchTerm, statusFilter);
        }, 300);
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, statusFilter, allCategories, filterCategories]);

    // Pagination
    const totalPages = Math.ceil(categories.length / itemsPerPage);
    const paginatedCategories = categories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Build tree structure for tree view (only show active categories based on filter)
    const buildTree = (items) => {
        const map = {};
        const roots = [];
        
        // First, filter items based on current status filter
        let filteredItems = items;
        if (statusFilter === 'active') {
            filteredItems = items.filter(item => item.isActive === true);
        } else if (statusFilter === 'inactive') {
            filteredItems = items.filter(item => item.isActive === false);
        }
        
        filteredItems.forEach(item => {
            map[item._id] = { ...item, children: [] };
        });
        
        filteredItems.forEach(item => {
            if (item.parentId && map[item.parentId]) {
                map[item.parentId].children.push(map[item._id]);
            } else if (!item.parentId) {
                roots.push(map[item._id]);
            }
        });
        
        // Sort children by displayOrder
        const sortChildren = (node) => {
            node.children.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            node.children.forEach(sortChildren);
        };
        
        roots.forEach(sortChildren);
        return roots;
    };

    const treeData = buildTree(allCategories);

    // Render tree view recursively
    const renderTree = (nodes, level = 0) => {
        return nodes.map(node => (
            <div key={node._id} className="tree-node" style={{ marginLeft: `${level * 24}px` }}>
                <div className={`tree-node-item ${!node.isActive ? 'inactive' : ''}`}>
                    <div className="tree-node-content">
                        <div className="tree-node-icon">
                            <span className="category-icon">{node.icon || '📦'}</span>
                        </div>
                        <div className="tree-node-info">
                            <div className="tree-node-name">
                                {node.name}
                                {!node.isActive && <span className="status-badge inactive">Inactive</span>}
                            </div>
                            {node.description && (
                                <div className="tree-node-description">{node.description}</div>
                            )}
                            <div className="tree-node-meta">
                                <span className="meta-item">
                                    <Hash size={12} />
                                    Order: {node.displayOrder || 0}
                                </span>
                                <span className="meta-item">
                                    <CalendarIcon size={12} />
                                    {formatDate(node.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="tree-node-actions">
                        <button
                            onClick={() => handleViewCategory(node)}
                            className="action-btn view"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={() => handleEditCategory(node)}
                            className="action-btn edit"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                        {(node.level === 0 || !node.parentId) && (
                            <button
                                onClick={() => handleAddSubCategory(node)}
                                className="action-btn add-sub"
                                title="Add Subcategory"
                            >
                                <FolderPlus size={16} />
                            </button>
                        )}
                        <button
                            onClick={() => handleToggleStatus(node)}
                            className={`action-btn ${node.isActive ? 'deactivate' : 'activate'}`}
                            title={node.isActive ? 'Deactivate' : 'Activate'}
                        >
                            {node.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                            onClick={() => handleDeleteClick(node)}
                            className="action-btn delete"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
                {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
            </div>
        ));
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Category Management | Masters | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="masters-page">
                {/* Toast Notification */}
                {toast.show && (
                    <div className={`toast-notification ${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : 
                         toast.type === 'error' ? <AlertCircle size={20} /> : 
                         <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <header className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="page-title">Category Management</h1>
                            <p className="page-description">
                                Manage your product categories and subcategories
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={handleAddCategory}
                                className="add-button"
                            >
                                <Plus size={18} />
                                <span>Add Category</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">
                            <FolderTree size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Categories</span>
                        </div>
                    </div>
                    <div className="stat-card main">
                        <div className="stat-icon">
                            <Package size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.main}</span>
                            <span className="stat-label">Main Categories</span>
                        </div>
                    </div>
                    <div className="stat-card sub">
                        <div className="stat-icon">
                            <Layers size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.sub}</span>
                            <span className="stat-label">Sub Categories</span>
                        </div>
                    </div>
                    <div className="stat-card active">
                        <div className="stat-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.active}</span>
                            <span className="stat-label">Active</span>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="filters-bar">
                    <div className="search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search categories by name, description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="clear-search">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    
                    <div className="filter-group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                    
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            title="List View"
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
                            title="Tree View"
                        >
                            <FolderTree size={18} />
                        </button>
                    </div>
                    
                    <button onClick={fetchCategories} className="refresh-btn" title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Main Content */}
                <main className="main-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading categories...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="empty-state">
                            <FolderTree size={64} strokeWidth={1.5} />
                            <h3>No Categories Found</h3>
                            <p>
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Get started by creating your first category'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <button onClick={handleAddCategory} className="empty-add-btn">
                                    <Plus size={18} />
                                    Add Category
                                </button>
                            )}
                        </div>
                    ) : viewMode === 'tree' ? (
                        <div className="tree-view">
                            <div className="tree-header">
                                <div className="tree-header-content">Category Hierarchy</div>
                                <div className="tree-header-actions">Actions</div>
                            </div>
                            <div className="tree-body">
                                {renderTree(treeData)}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table className="categories-table">
                                    <thead>
                                        <tr>
                                            <th>Icon</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Slug</th>
                                            <th>Order</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCategories.map((category) => (
                                            <tr key={category._id} className={!category.isActive ? 'inactive-row' : ''}>
                                                <td className="icon-cell">
                                                    <span className="category-icon">{category.icon || '📦'}</span>
                                                </td>
                                                <td className="name-cell">
                                                    <div className="category-name">
                                                        {category.indent && <span className="indent">{category.indent}</span>}
                                                        {category.name}
                                                    </div>
                                                    {category.description && (
                                                        <div className="category-description">{category.description}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`type-badge ${category.level === 0 ? 'main' : 'sub'}`}>
                                                        {category.level === 0 ? 'Main' : 'Sub'}
                                                    </span>
                                                </td>
                                                <td className="slug-cell">{category.slug}</td>
                                                <td>{category.displayOrder || 0}</td>
                                                <td>
                                                    <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="date-cell">
                                                    <span title={formatDate(category.createdAt)}>
                                                        {getTimeAgo(category.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        onClick={() => handleViewCategory(category)}
                                                        className="action-btn view"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
                                                        className="action-btn edit"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {(category.level === 0 || !category.parentId) && (
                                                        <button
                                                            onClick={() => handleAddSubCategory(category)}
                                                            className="action-btn add-sub"
                                                            title="Add Subcategory"
                                                        >
                                                            <FolderPlus size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleToggleStatus(category)}
                                                        className={`action-btn ${category.isActive ? 'deactivate' : 'activate'}`}
                                                        title={category.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(category)}
                                                        className="action-btn delete"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="page-btn"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>
                                    <div className="page-numbers">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="page-btn"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-container" onClick={(e) => e.stopPropagation()} ref={modalRef}>
                            <div className="modal-header">
                                <div className="modal-header-left">
                                    <div className="modal-icon">
                                        {modalMode === 'add' ? <Plus size={20} /> : 
                                         modalMode === 'edit' ? <Edit2 size={20} /> : 
                                         <Eye size={20} />}
                                    </div>
                                    <div>
                                        <h2>
                                            {modalMode === 'add' ? 'Add Category' : 
                                             modalMode === 'edit' ? 'Edit Category' : 
                                             'Category Details'}
                                        </h2>
                                        <p>
                                            {modalMode === 'add' ? 'Create a new category or subcategory' :
                                             modalMode === 'edit' ? 'Update category information' :
                                             'View category details'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="modal-close">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {/* Parent Category */}
                                    <div className="form-group">
                                        <label>
                                            Parent Category
                                            <span className="label-hint">Optional - Leave empty for main category</span>
                                        </label>
                                        <select
                                            value={formData.parentId}
                                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                            disabled={modalMode === 'view'}
                                            className={formErrors.parentId ? 'error' : ''}
                                        >
                                            <option value="">-- Main Category (No Parent) --</option>
                                            {parentCategories.map(parent => (
                                                <option key={parent._id} value={parent._id}>
                                                    {parent.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.parentId && <span className="error-text">{formErrors.parentId}</span>}
                                    </div>

                                    {/* Category Name */}
                                    <div className="form-group">
                                        <label>
                                            Category Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter category name"
                                            disabled={modalMode === 'view'}
                                            className={formErrors.name ? 'error' : ''}
                                            autoFocus
                                        />
                                        {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                                    </div>

                                    {/* Icon and Display Order */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Icon (Emoji)</label>
                                            <input
                                                type="text"
                                                value={formData.icon}
                                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                placeholder="📦"
                                                maxLength="10"
                                                disabled={modalMode === 'view'}
                                            />
                                            <span className="help-text">Use any emoji (max 10 characters)</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Display Order</label>
                                            <input
                                                type="number"
                                                value={formData.displayOrder}
                                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                                min="0"
                                                disabled={modalMode === 'view'}
                                            />
                                            <span className="help-text">Lower numbers appear first</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter category description (max 500 characters)"
                                            rows="3"
                                            maxLength="500"
                                            disabled={modalMode === 'view'}
                                        />
                                        <span className="help-text">{formData.description.length}/500 characters</span>
                                    </div>

                                    {/* Status (Only for edit/add) */}
                                    {modalMode !== 'view' && (
                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <span>Active</span>
                                            </label>
                                            <span className="help-text">Inactive categories won't appear in product forms</span>
                                        </div>
                                    )}

                                    {/* View Mode Additional Info */}
                                    {modalMode === 'view' && selectedCategory && (
                                        <div className="view-info">
                                            <div className="info-row">
                                                <span className="info-label">Slug:</span>
                                                <span className="info-value">{selectedCategory.slug}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Created:</span>
                                                <span className="info-value">{formatDate(selectedCategory.createdAt)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Last Updated:</span>
                                                <span className="info-value">{formatDate(selectedCategory.updatedAt)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Product Count:</span>
                                                <span className="info-value">{selectedCategory.productCount || 0}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                        {modalMode === 'view' ? 'Close' : 'Cancel'}
                                    </button>
                                    {modalMode !== 'view' && (
                                        <button type="submit" disabled={submitting} className="btn-primary">
                                            {submitting ? (
                                                <>
                                                    <div className="button-spinner"></div>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    <span>{modalMode === 'add' ? 'Create Category' : 'Save Changes'}</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && categoryToDelete && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-container delete-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon delete">
                                    <AlertTriangle size={24} />
                                </div>
                                <h2>Delete Category</h2>
                                <button onClick={() => setShowDeleteModal(false)} className="modal-close">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>"{categoryToDelete.name}"</strong>?</p>
                                {categoryToDelete.productCount > 0 && (
                                    <div className="warning-message">
                                        <AlertCircle size={16} />
                                        <span>This category has {categoryToDelete.productCount} product(s). It cannot be deleted until all products are removed or reassigned.</span>
                                    </div>
                                )}
                                {categoryToDelete.level === 0 && (
                                    <div className="warning-message">
                                        <AlertCircle size={16} />
                                        <span>This is a main category. All subcategories will also be deleted.</span>
                                    </div>
                                )}
                                <p className="delete-confirm-text">This action cannot be undone.</p>
                            </div>
                            
                            <div className="modal-footer">
                                <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmDelete} 
                                    disabled={deleting || categoryToDelete.productCount > 0}
                                    className="btn-danger"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            <span>Delete Category</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .masters-page {
                    min-height: 100vh;
                    background: ${appTheme.colors.backgroundLight};
                    width: 100%;
                }

                /* ==================== TOAST ==================== */
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: ${appTheme.colors.backgroundCard};
                    border-radius: ${appTheme.radius.md};
                    box-shadow: ${appTheme.shadows.lg};
                    animation: slideInRight 0.3s ease;
                    font-size: ${appTheme.fonts.sizes.sm};
                    max-width: 400px;
                    border: 1px solid ${appTheme.colors.border};
                }

                .toast-notification.success {
                    border-left: 4px solid ${appTheme.colors.success};
                }

                .toast-notification.error {
                    border-left: 4px solid ${appTheme.colors.error};
                }

                .toast-notification.warning {
                    border-left: 4px solid ${appTheme.colors.warning};
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* ==================== HEADER ==================== */
                .page-header {
                    background: ${appTheme.colors.backgroundCard};
                    border-bottom: 1px solid ${appTheme.colors.border};
                    padding: 24px 32px;
                    width: 100%;
                }

                .header-content {
                    max-width: 100%;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .page-title {
                    font-size: ${appTheme.fonts.sizes["2xl"]};
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textPrimary};
                    margin: 0;
                }

                .page-description {
                    color: ${appTheme.colors.textSecondary};
                    font-size: ${appTheme.fonts.sizes.sm};
                    margin: 0;
                }

                .add-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: ${appTheme.fonts.sizes.sm};
                    font-weight: ${appTheme.fonts.weights.medium};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .add-button:hover {
                    background: ${appTheme.colors.primaryDark};
                    transform: translateY(-1px);
                }

                /* ==================== STATS GRID ==================== */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    padding: 24px 32px;
                }

                .stat-card {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: ${appTheme.shadows.md};
                }

                .stat-icon {
                    width: 52px;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: ${appTheme.radius.md};
                    background: ${appTheme.colors.primary}10;
                    color: ${appTheme.colors.primary};
                }

                .stat-card.total .stat-icon {
                    background: ${appTheme.colors.primary}10;
                    color: ${appTheme.colors.primary};
                }

                .stat-card.main .stat-icon {
                    background: ${appTheme.colors.info}10;
                    color: ${appTheme.colors.info};
                }

                .stat-card.sub .stat-icon {
                    background: ${appTheme.colors.success}10;
                    color: ${appTheme.colors.success};
                }

                .stat-card.active .stat-icon {
                    background: ${appTheme.colors.warning}10;
                    color: ${appTheme.colors.warning};
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: ${appTheme.fonts.weights.bold};
                    color: ${appTheme.colors.textPrimary};
                }

                .stat-label {
                    font-size: ${appTheme.fonts.sizes.sm};
                    color: ${appTheme.colors.textSecondary};
                }

                /* ==================== FILTERS BAR ==================== */
                .filters-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 0 32px 24px 32px;
                    flex-wrap: wrap;
                }

                .search-wrapper {
                    flex: 1;
                    min-width: 250px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 10px 14px;
                    transition: all 0.2s ease;
                }

                .search-wrapper:focus-within {
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 3px ${appTheme.colors.primary}15;
                }

                .search-wrapper svg {
                    color: ${appTheme.colors.textSecondary};
                }

                .search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: ${appTheme.fonts.sizes.sm};
                    color: ${appTheme.colors.textPrimary};
                }

                .search-input::placeholder {
                    color: ${appTheme.colors.textSecondary};
                }

                .clear-search {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: ${appTheme.colors.textSecondary};
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: ${appTheme.radius.sm};
                }

                .clear-search:hover {
                    background: ${appTheme.colors.hover};
                }

                .filter-group {
                    display: flex;
                    gap: 10px;
                }

                .filter-select {
                    padding: 10px 14px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    background: ${appTheme.colors.backgroundCard};
                    color: ${appTheme.colors.textPrimary};
                    font-size: ${appTheme.fonts.sizes.sm};
                    cursor: pointer;
                    outline: none;
                }

                .filter-select:focus {
                    border-color: ${appTheme.colors.primary};
                }

                .view-toggle {
                    display: flex;
                    gap: 4px;
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 4px;
                }

                .toggle-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: none;
                    border-radius: ${appTheme.radius.sm};
                    cursor: pointer;
                    color: ${appTheme.colors.textSecondary};
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .toggle-btn:hover {
                    background: ${appTheme.colors.hover};
                }

                .toggle-btn.active {
                    background: ${appTheme.colors.primary};
                    color: white;
                }

                .refresh-btn {
                    padding: 10px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    cursor: pointer;
                    color: ${appTheme.colors.textSecondary};
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .refresh-btn:hover {
                    background: ${appTheme.colors.hover};
                    color: ${appTheme.colors.primary};
                }

                /* ==================== MAIN CONTENT ==================== */
                .main-content {
                    padding: 0 32px 32px 32px;
                }

                /* ==================== TABLE VIEW ==================== */
                .table-container {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    overflow-x: auto;
                }

                .categories-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .categories-table thead {
                    background: ${appTheme.colors.mutedBackground};
                    border-bottom: 1px solid ${appTheme.colors.border};
                }

                .categories-table th {
                    padding: 14px 16px;
                    text-align: left;
                    font-size: ${appTheme.fonts.sizes.sm};
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textSecondary};
                }

                .categories-table td {
                    padding: 16px;
                    border-bottom: 1px solid ${appTheme.colors.border};
                    font-size: ${appTheme.fonts.sizes.sm};
                    color: ${appTheme.colors.textPrimary};
                }

                .categories-table tbody tr:hover {
                    background: ${appTheme.colors.hover};
                }

                .inactive-row {
                    opacity: 0.7;
                    background: ${appTheme.colors.backgroundLight};
                }

                .icon-cell {
                    width: 60px;
                }

                .category-icon {
                    font-size: 24px;
                }

                .name-cell {
                    min-width: 200px;
                }

                .category-name {
                    font-weight: ${appTheme.fonts.weights.medium};
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .indent {
                    color: ${appTheme.colors.textSecondary};
                    font-family: monospace;
                }

                .category-description {
                    font-size: ${appTheme.fonts.sizes.xs};
                    color: ${appTheme.colors.textSecondary};
                    margin-top: 4px;
                }

                .type-badge {
                    display: inline-flex;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: ${appTheme.fonts.sizes.xs};
                    font-weight: ${appTheme.fonts.weights.medium};
                }

                .type-badge.main {
                    background: ${appTheme.colors.info}10;
                    color: ${appTheme.colors.info};
                }

                .type-badge.sub {
                    background: ${appTheme.colors.success}10;
                    color: ${appTheme.colors.success};
                }

                .slug-cell {
                    font-family: monospace;
                    color: ${appTheme.colors.textSecondary};
                }

                .status-badge {
                    display: inline-flex;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: ${appTheme.fonts.sizes.xs};
                    font-weight: ${appTheme.fonts.weights.medium};
                }

                .status-badge.active {
                    background: ${appTheme.colors.success}10;
                    color: ${appTheme.colors.success};
                }

                .status-badge.inactive {
                    background: ${appTheme.colors.error}10;
                    color: ${appTheme.colors.error};
                }

                .date-cell {
                    white-space: nowrap;
                    color: ${appTheme.colors.textSecondary};
                }

                .actions-cell {
                    display: flex;
                    gap: 8px;
                    white-space: nowrap;
                }

                .action-btn {
                    padding: 6px;
                    background: transparent;
                    border: none;
                    border-radius: ${appTheme.radius.sm};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn.view {
                    color: ${appTheme.colors.info};
                }

                .action-btn.view:hover {
                    background: ${appTheme.colors.info}10;
                }

                .action-btn.edit {
                    color: ${appTheme.colors.warning};
                }

                .action-btn.edit:hover {
                    background: ${appTheme.colors.warning}10;
                }

                .action-btn.add-sub {
                    color: ${appTheme.colors.success};
                }

                .action-btn.add-sub:hover {
                    background: ${appTheme.colors.success}10;
                }

                .action-btn.activate {
                    color: ${appTheme.colors.success};
                }

                .action-btn.activate:hover {
                    background: ${appTheme.colors.success}10;
                }

                .action-btn.deactivate {
                    color: ${appTheme.colors.warning};
                }

                .action-btn.deactivate:hover {
                    background: ${appTheme.colors.warning}10;
                }

                .action-btn.delete {
                    color: ${appTheme.colors.error};
                }

                .action-btn.delete:hover {
                    background: ${appTheme.colors.error}10;
                }

                /* ==================== TREE VIEW ==================== */
                .tree-view {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    overflow: hidden;
                }

                .tree-header {
                    display: flex;
                    justify-content: space-between;
                    padding: 14px 20px;
                    background: ${appTheme.colors.mutedBackground};
                    border-bottom: 1px solid ${appTheme.colors.border};
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textSecondary};
                    font-size: ${appTheme.fonts.sizes.sm};
                }

                .tree-body {
                    padding: 8px 0;
                }

                .tree-node {
                    border-bottom: 1px solid ${appTheme.colors.border};
                }

                .tree-node:last-child {
                    border-bottom: none;
                }

                .tree-node-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 20px;
                    transition: background 0.2s ease;
                }

                .tree-node-item:hover {
                    background: ${appTheme.colors.hover};
                }

                .tree-node-item.inactive {
                    opacity: 0.7;
                }

                .tree-node-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                }

                .tree-node-icon .category-icon {
                    font-size: 20px;
                }

                .tree-node-info {
                    flex: 1;
                }

                .tree-node-name {
                    font-weight: ${appTheme.fonts.weights.medium};
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .tree-node-description {
                    font-size: ${appTheme.fonts.sizes.xs};
                    color: ${appTheme.colors.textSecondary};
                    margin-top: 2px;
                }

                .tree-node-meta {
                    display: flex;
                    gap: 16px;
                    margin-top: 4px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: ${appTheme.fonts.sizes.xs};
                    color: ${appTheme.colors.textSecondary};
                }

                .tree-node-actions {
                    display: flex;
                    gap: 8px;
                }

                /* ==================== PAGINATION ==================== */
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-top: 24px;
                }

                .page-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    color: ${appTheme.colors.textPrimary};
                    font-size: ${appTheme.fonts.sizes.sm};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .page-btn:hover:not(:disabled) {
                    background: ${appTheme.colors.hover};
                    border-color: ${appTheme.colors.primary};
                }

                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .page-numbers {
                    display: flex;
                    gap: 6px;
                }

                .page-number {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    color: ${appTheme.colors.textPrimary};
                    font-size: ${appTheme.fonts.sizes.sm};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .page-number:hover {
                    background: ${appTheme.colors.hover};
                    border-color: ${appTheme.colors.primary};
                }

                .page-number.active {
                    background: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                    color: white;
                }

                /* ==================== LOADING & EMPTY STATES ==================== */
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid ${appTheme.colors.primary}20;
                    border-top-color: ${appTheme.colors.primary};
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    text-align: center;
                }

                .empty-state svg {
                    color: ${appTheme.colors.textSecondary};
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    font-size: ${appTheme.fonts.sizes.lg};
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 8px 0;
                }

                .empty-state p {
                    color: ${appTheme.colors.textSecondary};
                    margin: 0 0 20px 0;
                }

                .empty-add-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: ${appTheme.fonts.sizes.sm};
                    cursor: pointer;
                }

                /* ==================== MODAL ==================== */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-container {
                    background: ${appTheme.colors.backgroundCard};
                    border-radius: ${appTheme.radius.lg};
                    width: 90%;
                    max-width: 550px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .delete-modal {
                    max-width: 450px;
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid ${appTheme.colors.border};
                }

                .modal-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .modal-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${appTheme.colors.primary}10;
                    border-radius: ${appTheme.radius.md};
                    color: ${appTheme.colors.primary};
                }

                .modal-icon.delete {
                    background: ${appTheme.colors.error}10;
                    color: ${appTheme.colors.error};
                }

                .modal-header h2 {
                    font-size: ${appTheme.fonts.sizes.lg};
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 4px 0;
                }

                .modal-header p {
                    font-size: ${appTheme.fonts.sizes.sm};
                    color: ${appTheme.colors.textSecondary};
                    margin: 0;
                }

                .modal-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: ${appTheme.colors.textSecondary};
                    padding: 8px;
                    border-radius: ${appTheme.radius.sm};
                    transition: all 0.2s ease;
                }

                .modal-close:hover {
                    background: ${appTheme.colors.hover};
                }

                .modal-body {
                    padding: 24px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 16px 24px;
                    border-top: 1px solid ${appTheme.colors.border};
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: ${appTheme.fonts.sizes.sm};
                    font-weight: ${appTheme.fonts.weights.medium};
                    color: ${appTheme.colors.textPrimary};
                    margin-bottom: 6px;
                }

                .label-hint {
                    font-size: ${appTheme.fonts.sizes.xs};
                    font-weight: normal;
                    color: ${appTheme.colors.textSecondary};
                }

                .required {
                    color: ${appTheme.colors.error};
                    margin-left: 4px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: ${appTheme.fonts.sizes.sm};
                    background: ${appTheme.colors.backgroundCard};
                    color: ${appTheme.colors.textPrimary};
                    transition: all 0.2s ease;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 3px ${appTheme.colors.primary}15;
                }

                .form-group input.error,
                .form-group select.error,
                .form-group textarea.error {
                    border-color: ${appTheme.colors.error};
                }

                .error-text {
                    font-size: ${appTheme.fonts.sizes.xs};
                    color: ${appTheme.colors.error};
                    margin-top: 4px;
                    display: block;
                }

                .help-text {
                    font-size: ${appTheme.fonts.sizes.xs};
                    color: ${appTheme.colors.textSecondary};
                    margin-top: 4px;
                    display: block;
                }

                .checkbox-group {
                    margin-top: 16px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-weight: normal;
                }

                .checkbox-label input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .view-info {
                    background: ${appTheme.colors.mutedBackground};
                    border-radius: ${appTheme.radius.md};
                    padding: 16px;
                    margin-top: 16px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid ${appTheme.colors.border};
                }

                .info-row:last-child {
                    border-bottom: none;
                }

                .info-label {
                    font-weight: ${appTheme.fonts.weights.medium};
                    color: ${appTheme.colors.textSecondary};
                }

                .info-value {
                    color: ${appTheme.colors.textPrimary};
                    font-family: monospace;
                }

                .warning-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: ${appTheme.colors.warning}10;
                    border: 1px solid ${appTheme.colors.warning}30;
                    border-radius: ${appTheme.radius.md};
                    padding: 12px;
                    margin: 16px 0;
                    color: ${appTheme.colors.warning};
                    font-size: ${appTheme.fonts.sizes.sm};
                }

                .delete-confirm-text {
                    color: ${appTheme.colors.error};
                    font-weight: ${appTheme.fonts.weights.medium};
                    margin-top: 16px;
                }

                .btn-secondary {
                    padding: 10px 20px;
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    color: ${appTheme.colors.textPrimary};
                    font-size: ${appTheme.fonts.sizes.sm};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-secondary:hover {
                    background: ${appTheme.colors.hover};
                }

                .btn-primary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${appTheme.colors.primary};
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    color: white;
                    font-size: ${appTheme.fonts.sizes.sm};
                    font-weight: ${appTheme.fonts.weights.medium};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-primary:hover:not(:disabled) {
                    background: ${appTheme.colors.primaryDark};
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-danger {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${appTheme.colors.error};
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    color: white;
                    font-size: ${appTheme.fonts.sizes.sm};
                    font-weight: ${appTheme.fonts.weights.medium};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-danger:hover:not(:disabled) {
                    background: ${appTheme.colors.destructive};
                }

                .btn-danger:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .button-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                /* ==================== RESPONSIVE ==================== */
                @media (max-width: 1200px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .page-header {
                        padding: 16px 20px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }

                    .stats-grid {
                        padding: 16px 20px;
                        gap: 12px;
                    }

                    .filters-bar {
                        padding: 0 20px 16px 20px;
                        flex-direction: column;
                    }

                    .search-wrapper {
                        width: 100%;
                    }

                    .filter-group {
                        width: 100%;
                    }

                    .filter-select {
                        flex: 1;
                    }

                    .main-content {
                        padding: 0 20px 20px 20px;
                    }

                    .table-container {
                        overflow-x: auto;
                    }

                    .categories-table {
                        min-width: 800px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .modal-container {
                        width: 95%;
                        margin: 20px;
                    }

                    .tree-node-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }

                    .tree-node-actions {
                        width: 100%;
                        justify-content: flex-start;
                    }

                    .tree-node-content {
                        width: 100%;
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .page-title {
                        font-size: ${appTheme.fonts.sizes.xl};
                    }

                    .stat-value {
                        font-size: 22px;
                    }
                }
            `}</style>
        </>
    );
}