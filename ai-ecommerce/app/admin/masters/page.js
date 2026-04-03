// app/admin/masters/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { appTheme } from '../../../src/constants/theme';
import {
    Folder,
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    ChevronDown,
    Save,
    X,
    Search,
    RefreshCw,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    FilePlus,
    Grid,
    List,
    Building2,
    Shield,
    AlertTriangle,
    Layers,
    Package,
} from 'lucide-react';

export default function CategoriesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const actionParam = searchParams.get('action');
    const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
    
    // State management
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('tree');
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [editingCategory, setEditingCategory] = useState(null);
    const [showForm, setShowForm] = useState(actionParam === 'add');
    const [formMode, setFormMode] = useState('add');
    const [parentCategory, setParentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: null,
        icon: '📦',
        isActive: true,
        displayOrder: 0
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [apiError, setApiError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        main: 0,
        sub: 0
    });
    const [mainCategories, setMainCategories] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (!isCompanyAdmin && !isSuperAdmin) {
            router.push('/dashboard');
        }
    }, [user, isCompanyAdmin, isSuperAdmin, router]);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(checkMobile, 150);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);

    // Fetch stats from API
    const fetchStats = useCallback(async () => {
        if (!user?.companyId) return;
        
        try {
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'stats'
            });
            
            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });
            
            const data = await res.json();
            
            if (data.success && data.data?.categories) {
                setStats({
                    total: data.data.categories.total || 0,
                    active: data.data.categories.active || 0,
                    inactive: data.data.categories.inactive || 0,
                    main: data.data.categories.main || 0,
                    sub: data.data.categories.sub || 0
                });
            } else {
                console.log('Stats response:', data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, [user, getAuthHeaders]);

    // Fetch main categories for dropdown
    const fetchMainCategories = useCallback(async () => {
        if (!user?.companyId) return;
        
        try {
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'categories',
                parentId: 'null',
                limit: '1000'
            });
            
            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });
            
            const data = await res.json();
            if (data.success) {
                setMainCategories(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch main categories:', error);
        }
    }, [user, getAuthHeaders]);

    // Fetch categories tree
    const fetchCategories = useCallback(async () => {
        if (!user?.companyId) {
            console.log('No company ID available');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setApiError(null);
        
        try {
            const url = `/api/masters?companyId=${user.companyId}&type=categories&format=tree&includeInactive=false`;
            
            const res = await fetch(url, {
                headers: getAuthHeaders()
            });
            
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("You don't have permission to view categories");
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success) {
                setCategories(data.data || []);
                // Auto-expand first level
                const firstLevelIds = new Set();
                (data.data || []).forEach(cat => {
                    firstLevelIds.add(cat._id);
                });
                setExpandedCategories(firstLevelIds);
            } else {
                setErrorMessage(data.message || 'Failed to load categories');
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setApiError(error.message);
            setErrorMessage(error.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [user, getAuthHeaders]);

    // Load all data
    const loadAllData = useCallback(async () => {
        if (user?.companyId) {
            await Promise.all([
                fetchCategories(),
                fetchMainCategories(),
                fetchStats()
            ]);
        }
    }, [fetchCategories, fetchMainCategories, fetchStats, user?.companyId]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const toggleExpand = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const expandAll = () => {
        const allIds = new Set();
        const collectIds = (items) => {
            items.forEach(item => {
                allIds.add(item._id);
                if (item.subcategories?.length) {
                    collectIds(item.subcategories);
                }
            });
        };
        collectIds(categories);
        setExpandedCategories(allIds);
    };

    const collapseAll = () => {
        setExpandedCategories(new Set());
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Category name is required';
        } else if (formData.name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (formData.name.length > 100) {
            errors.name = 'Name cannot exceed 100 characters';
        }
        
        if (formData.description && formData.description.length > 500) {
            errors.description = 'Description cannot exceed 500 characters';
        }
        
        if (formMode === 'edit' && formData.parentId === editingCategory?._id) {
            errors.parentId = 'Category cannot be its own parent';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        setApiError(null);

        try {
            const requestBody = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                parentId: formData.parentId || null,
                icon: formData.icon || '📦',
                displayOrder: formData.displayOrder || 0,
                isActive: true // Always active for new categories
            };
            
            const url = (formMode === 'add' || formMode === 'sub')
                ? `/api/masters?companyId=${user?.companyId}&type=categories`
                : `/api/masters?companyId=${user?.companyId}&type=categories&id=${editingCategory?._id}`;
            
            const method = (formMode === 'add' || formMode === 'sub') ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage(data.message);
                resetForm();
                await loadAllData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            setApiError(error.message);
            setErrorMessage(error.message || 'Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setParentCategory(null);
        setFormData({
            name: '',
            description: '',
            parentId: null,
            icon: '📦',
            isActive: true,
            displayOrder: 0
        });
        setFormErrors({});
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            parentId: category.parentId,
            icon: category.icon || '📦',
            isActive: category.isActive,
            displayOrder: category.displayOrder || 0
        });
        setFormMode('edit');
        setShowForm(true);
    };

    // Handle delete
    const handleDelete = async (category) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) return;
        
        setIsDeleting(true);
        
        try {
            const res = await fetch(`/api/masters?companyId=${user?.companyId}&type=categories&id=${category._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await res.json();
            
            if (data.success) {
                setSuccessMessage('Category deleted successfully');
                await loadAllData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(data.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete category: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddSubcategory = (parent) => {
        setParentCategory(parent);
        setFormData({
            name: '',
            description: '',
            parentId: parent._id,
            icon: '📦',
            isActive: true,
            displayOrder: 0
        });
        setFormMode('sub');
        setShowForm(true);
    };

    // Handle toggle active
    const handleToggleActive = async (category) => {
        try {
            const res = await fetch(`/api/masters?companyId=${user?.companyId}&type=categories`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    action: 'toggle-status',
                    id: category._id,
                    isActive: !category.isActive
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                setSuccessMessage(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`);
                await loadAllData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(data.message || 'Failed to toggle status');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            alert('Failed to toggle status: ' + error.message);
        }
    };

    const handleCancelForm = () => {
        resetForm();
    };

    const filterCategories = (items, term) => {
        if (!term) return items;
        
        const filtered = [];
        items.forEach(item => {
            const matches = item.name.toLowerCase().includes(term.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(term.toLowerCase()));
            
            const filteredSubs = item.subcategories?.length ? filterCategories(item.subcategories, term) : [];
            
            if (matches || filteredSubs.length > 0) {
                filtered.push({
                    ...item,
                    subcategories: filteredSubs
                });
            }
        });
        return filtered;
    };

    const filteredCategories = searchTerm ? filterCategories([...categories], searchTerm) : categories;

    const renderCategoryTree = (items, level = 0) => {
        return items.map(category => (
            <React.Fragment key={category._id}>
                <div 
                    className="category-row"
                    style={{
                        ...styles.categoryRow(isMobile, level),
                        opacity: category.isActive ? 1 : 0.6,
                        backgroundColor: !category.isActive ? '#f9f9f9' : 'transparent'
                    }}
                >
                    <div style={styles.categoryLeft}>
                        {category.subcategories?.length > 0 ? (
                            <button
                                onClick={() => toggleExpand(category._id)}
                                style={styles.expandButton}
                            >
                                {expandedCategories.has(category._id) ? 
                                    <ChevronDown size={isMobile ? 16 : 18} /> : 
                                    <ChevronRight size={isMobile ? 16 : 18} />
                                }
                            </button>
                        ) : (
                            <div style={{ width: isMobile ? 24 : 28 }} />
                        )}
                        
                        <span style={styles.categoryIcon}>{category.icon || '📦'}</span>
                        
                        <div style={styles.categoryInfo}>
                            <div style={styles.categoryNameWrapper}>
                                <span style={styles.categoryName(isMobile)}>
                                    {category.name}
                                </span>
                                {!category.isActive && (
                                    <span style={styles.inactiveBadge}>Inactive</span>
                                )}
                                {category.productCount > 0 && (
                                    <span style={styles.productCountBadge}>
                                        <Package size={10} />
                                        {category.productCount}
                                    </span>
                                )}
                                {category.subCategoryCount > 0 && (
                                    <span style={styles.subCountBadge}>
                                        <Layers size={10} />
                                        {category.subCategoryCount}
                                    </span>
                                )}
                            </div>
                            {category.description && !isMobile && (
                                <span style={styles.categoryDescription}>
                                    {category.description}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={styles.categoryActions}>
                        <button
                            onClick={() => handleAddSubcategory(category)}
                            style={styles.actionButton(isMobile, '#10b981')}
                            title="Add Subcategory"
                            disabled={!category.isActive}
                        >
                            <FilePlus size={isMobile ? 16 : 18} />
                            {!isMobile && <span>Sub</span>}
                        </button>
                        
                        <button
                            onClick={() => handleEdit(category)}
                            style={styles.actionButton(isMobile, '#3b82f6')}
                            title="Edit"
                        >
                            <Edit2 size={isMobile ? 16 : 18} />
                            {!isMobile && <span>Edit</span>}
                        </button>
                        
                        <button
                            onClick={() => handleToggleActive(category)}
                            style={styles.actionButton(
                                isMobile, 
                                category.isActive ? '#f59e0b' : '#10b981'
                            )}
                            title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                            {category.isActive ? 
                                <EyeOff size={isMobile ? 16 : 18} /> : 
                                <Eye size={isMobile ? 16 : 18} />
                            }
                            {!isMobile && <span>{category.isActive ? 'Off' : 'On'}</span>}
                        </button>
                        
                        <button
                            onClick={() => handleDelete(category)}
                            style={styles.actionButton(isMobile, '#ef4444')}
                            title="Delete"
                            disabled={category.productCount > 0 || isDeleting}
                        >
                            <Trash2 size={isMobile ? 16 : 18} />
                            {!isMobile && <span>Del</span>}
                        </button>
                    </div>
                </div>

                {expandedCategories.has(category._id) && category.subcategories?.length > 0 && (
                    <div style={styles.subcategoriesContainer}>
                        {renderCategoryTree(category.subcategories, level + 1)}
                    </div>
                )}
            </React.Fragment>
        ));
    };

    const renderListView = () => {
        const flattenCategories = (items, level = 0) => {
            let result = [];
            items.forEach(item => {
                result.push({ ...item, level });
                if (item.subcategories?.length) {
                    result = result.concat(flattenCategories(item.subcategories, level + 1));
                }
            });
            return result;
        };

        const flatList = flattenCategories(filteredCategories);

        return flatList.map(category => (
            <div
                key={category._id}
                style={{
                    ...styles.listRow(isMobile),
                    opacity: category.isActive ? 1 : 0.6,
                    backgroundColor: !category.isActive ? '#f9f9f9' : 'transparent',
                    paddingLeft: isMobile ? 16 + (category.level * 20) : 24 + (category.level * 24)
                }}
            >
                <div style={styles.listLeft}>
                    <span style={styles.categoryIcon}>{category.icon || '📦'}</span>
                    <div style={styles.categoryInfo}>
                        <div style={styles.categoryNameWrapper}>
                            <span style={styles.categoryName(isMobile)}>
                                {'—'.repeat(category.level)} {category.name}
                            </span>
                            {!category.isActive && (
                                <span style={styles.inactiveBadge}>Inactive</span>
                            )}
                            {category.productCount > 0 && (
                                <span style={styles.productCountBadge}>
                                    <Package size={10} />
                                    {category.productCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={styles.categoryActions}>
                    <button
                        onClick={() => handleAddSubcategory(category)}
                        style={styles.actionButton(isMobile, '#10b981')}
                        title="Add Subcategory"
                        disabled={!category.isActive}
                    >
                        <FilePlus size={isMobile ? 16 : 18} />
                    </button>
                    
                    <button
                        onClick={() => handleEdit(category)}
                        style={styles.actionButton(isMobile, '#3b82f6')}
                        title="Edit"
                    >
                        <Edit2 size={isMobile ? 16 : 18} />
                    </button>
                    
                    <button
                        onClick={() => handleToggleActive(category)}
                        style={styles.actionButton(
                            isMobile, 
                            category.isActive ? '#f59e0b' : '#10b981'
                        )}
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {category.isActive ? 
                            <EyeOff size={isMobile ? 16 : 18} /> : 
                            <Eye size={isMobile ? 16 : 18} />
                        }
                    </button>
                    
                    <button
                        onClick={() => handleDelete(category)}
                        style={styles.actionButton(isMobile, '#ef4444')}
                        title="Delete"
                        disabled={category.productCount > 0 || isDeleting}
                    >
                        <Trash2 size={isMobile ? 16 : 18} />
                    </button>
                </div>
            </div>
        ));
    };

    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Checking authentication...</p>
            </div>
        );
    }

    return (
        <div style={styles.container(isMobile)}>
            {/* Company Context Banner */}
            <div style={styles.companyBanner}>
                <div style={styles.companyBannerContent}>
                    <div style={styles.companyBannerLeft}>
                        <Building2 size={20} color={appTheme.colors.primary} />
                        <span style={styles.companyBannerText}>
                            {isSuperAdmin ? 'Super Admin View' : 'Company Admin View'} - 
                            {user?.companyName || 'Your Company'}
                        </span>
                    </div>
                    {isSuperAdmin && (
                        <div style={styles.superAdminBadge}>
                            <Shield size={16} />
                            Super Admin
                        </div>
                    )}
                </div>
            </div>

            {/* API Error Message */}
            {apiError && (
                <div style={styles.apiError}>
                    <AlertTriangle size={20} />
                    <span>{apiError}</span>
                    <button onClick={() => setApiError(null)} style={styles.apiErrorClose}>×</button>
                </div>
            )}

            {/* Toast Messages */}
            {successMessage && (
                <div style={styles.toast.success}>
                    <CheckCircle size={20} />
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} style={styles.toast.close}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {errorMessage && (
                <div style={styles.toast.error}>
                    <AlertCircle size={20} />
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage('')} style={styles.toast.close}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div style={styles.header(isMobile)}>
                <div>
                    <div style={styles.titleWrapper(isMobile)}>
                        <div style={styles.titleBar(isMobile)}></div>
                        <h1 style={styles.title(isMobile)}>Categories Master</h1>
                    </div>
                    <p style={styles.subtitle(isMobile)}>
                        Manage your product categories and subcategories
                    </p>
                </div>

                <div style={styles.headerActions}>
                    <button
                        onClick={loadAllData}
                        style={styles.refreshButton(isMobile)}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                        {!isMobile && 'Refresh'}
                    </button>
                    
                    <button
                        onClick={() => {
                            setFormMode('add');
                            setParentCategory(null);
                            setFormData({
                                name: '',
                                description: '',
                                parentId: null,
                                icon: '📦',
                                isActive: true,
                                displayOrder: 0
                            });
                            setShowForm(true);
                        }}
                        style={styles.addButton(isMobile)}
                    >
                        <Plus size={18} />
                        {!isMobile && 'Add Category'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid(isMobile)}>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIconBg, backgroundColor: '#3b82f620' }}>
                        <Folder size={20} color="#3b82f6" />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Categories</p>
                        <p style={styles.statValue}>{stats.total}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIconBg, backgroundColor: '#10b98120' }}>
                        <CheckCircle size={20} color="#10b981" />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Active</p>
                        <p style={styles.statValue}>{stats.active}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIconBg, backgroundColor: '#8b5cf620' }}>
                        <Folder size={20} color="#8b5cf6" />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Main Categories</p>
                        <p style={styles.statValue}>{stats.main}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIconBg, backgroundColor: '#f59e0b20' }}>
                        <Layers size={20} color="#f59e0b" />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Subcategories</p>
                        <p style={styles.statValue}>{stats.sub}</p>
                    </div>
                </div>
            </div>

            {/* Search and View Controls */}
            <div style={styles.controls(isMobile)}>
                <div style={styles.searchWrapper(isMobile)}>
                    <Search size={isMobile ? 16 : 18} color="#9ca3af" style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={isMobile ? "Search..." : "Search categories by name or description..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput(isMobile)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={styles.clearSearch}
                        >
                            ×
                        </button>
                    )}
                </div>

                <div style={styles.viewControls}>
                    <button
                        onClick={expandAll}
                        style={styles.viewButton(isMobile)}
                        title="Expand All"
                    >
                        <ChevronDown size={18} />
                    </button>
                    <button
                        onClick={collapseAll}
                        style={styles.viewButton(isMobile)}
                        title="Collapse All"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('tree')}
                        style={{
                            ...styles.viewButton(isMobile),
                            ...(viewMode === 'tree' ? styles.viewButtonActive : {})
                        }}
                        title="Tree View"
                    >
                        <Folder size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            ...styles.viewButton(isMobile),
                            ...(viewMode === 'list' ? styles.viewButtonActive : {})
                        }}
                        title="List View"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.content(isMobile)}>
                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div style={styles.emptyState(isMobile)}>
                        <Folder size={isMobile ? 48 : 64} color="#d1d5db" />
                        <h3>No categories found</h3>
                        <p>
                            {searchTerm 
                                ? 'No results match your search' 
                                : 'Get started by creating your first category'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => {
                                    setFormMode('add');
                                    setShowForm(true);
                                }}
                                style={styles.emptyStateButton}
                            >
                                <Plus size={16} />
                                Add Category
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={styles.categoriesContainer}>
                        {viewMode === 'tree' ? (
                            renderCategoryTree(filteredCategories)
                        ) : (
                            renderListView()
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div style={styles.modalOverlay} onClick={handleCancelForm}>
                    <div style={styles.modal(isMobile)} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {formMode === 'add' && 'Add New Category'}
                                {formMode === 'sub' && `Add Subcategory under "${parentCategory?.name}"`}
                                {formMode === 'edit' && `Edit "${editingCategory?.name}"`}
                            </h2>
                            <button onClick={handleCancelForm} style={styles.modalClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.modalForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Category Name <span style={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter category name"
                                    style={{
                                        ...styles.input,
                                        borderColor: formErrors.name ? '#ef4444' : '#e5e7eb'
                                    }}
                                    autoFocus
                                />
                                {formErrors.name && (
                                    <span style={styles.errorText}>{formErrors.name}</span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter category description (optional)"
                                    rows={isMobile ? 3 : 4}
                                    style={styles.textarea}
                                />
                                {formErrors.description && (
                                    <span style={styles.errorText}>{formErrors.description}</span>
                                )}
                            </div>

                            {(formMode === 'add' || formMode === 'edit') && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Parent Category</label>
                                    <select
                                        name="parentId"
                                        value={formData.parentId || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            ...styles.select,
                                            borderColor: formErrors.parentId ? '#ef4444' : '#e5e7eb'
                                        }}
                                    >
                                        <option value="">None (Main Category)</option>
                                        {mainCategories
                                            .filter(cat => formMode !== 'edit' || cat._id !== editingCategory?._id)
                                            .map(cat => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                    {formErrors.parentId && (
                                        <span style={styles.errorText}>{formErrors.parentId}</span>
                                    )}
                                    <p style={styles.helpText}>
                                        Select a parent category to create a subcategory
                                    </p>
                                </div>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Icon (Emoji)</label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleInputChange}
                                    placeholder="📦"
                                    maxLength="2"
                                    style={styles.input}
                                />
                                <p style={styles.helpText}>Enter an emoji (e.g., 📦, 👕, 📱)</p>
                            </div>

                            <div style={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={handleCancelForm}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        ...styles.submitButton,
                                        ...(isSubmitting ? styles.buttonDisabled : {})
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div style={styles.buttonSpinner}></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            {formMode === 'edit' ? 'Update' : 'Create'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}

// ========== STYLES ==========
const styles = {
    container: (isMobile) => ({
        padding: isMobile ? '12px' : '24px',
        backgroundColor: 'transparent',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
    }),

    companyBanner: {
        maxWidth: '1200px',
        margin: '0 auto 16px auto',
        padding: '0',
    },

    companyBannerContent: {
        background: '#ffffff',
        border: `1px solid ${appTheme.colors.border}30`,
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
    },

    companyBannerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },

    companyBannerText: {
        fontSize: '0.9rem',
        color: '#1f2937',
        fontWeight: '500',
    },

    superAdminBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        backgroundColor: `${appTheme.colors.warning}15`,
        border: `1px solid ${appTheme.colors.warning}30`,
        borderRadius: '20px',
        color: appTheme.colors.warning,
        fontSize: '0.75rem',
        fontWeight: '600',
    },

    apiError: {
        maxWidth: '1200px',
        margin: '0 auto 16px auto',
        padding: '12px 16px',
        background: `${appTheme.colors.error}10`,
        border: `1px solid ${appTheme.colors.error}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: appTheme.colors.error,
        fontSize: '0.9rem',
        position: 'relative',
    },

    apiErrorClose: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: appTheme.colors.error,
    },

    toast: {
        success: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            zIndex: 1100,
            animation: 'slideIn 0.3s ease',
            maxWidth: '400px',
            width: 'calc(100% - 40px)',
        },
        error: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            zIndex: 1100,
            animation: 'slideIn 0.3s ease',
            maxWidth: '400px',
            width: 'calc(100% - 40px)',
        },
        close: {
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: 'auto',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            ':hover': {
                opacity: 1,
            },
        },
    },

    header: (isMobile) => ({
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: isMobile ? '16px' : '24px',
        gap: isMobile ? '12px' : 0,
    }),

    titleWrapper: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '12px',
        marginBottom: '4px',
    }),

    titleBar: (isMobile) => ({
        width: isMobile ? '3px' : '4px',
        height: isMobile ? '24px' : '28px',
        background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
        borderRadius: '2px',
    }),

    title: (isMobile) => ({
        color: appTheme.colors.textPrimary,
        fontWeight: '700',
        fontSize: isMobile ? '1.4rem' : '1.75rem',
        margin: 0,
        lineHeight: 1.2,
    }),

    subtitle: (isMobile) => ({
        color: appTheme.colors.textSecondary,
        margin: '4px 0 0 15px',
        fontSize: isMobile ? '0.85rem' : '0.95rem',
        fontWeight: '500',
    }),

    headerActions: {
        display: 'flex',
        gap: '8px',
    },

    refreshButton: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: isMobile ? '8px 12px' : '10px 16px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        color: '#4b5563',
        fontSize: isMobile ? '13px' : '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#e5e7eb',
        },
        ':disabled': {
            opacity: 0.6,
            cursor: 'not-allowed',
        },
    }),

    addButton: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: isMobile ? '8px 12px' : '10px 16px',
        backgroundColor: appTheme.colors.primary,
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontSize: isMobile ? '13px' : '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#2563eb',
        },
    }),

    statsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '12px',
        marginBottom: isMobile ? '16px' : '24px',
    }),

    statCard: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '12px',
        padding: isMobile ? '12px' : '16px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: `1px solid ${appTheme.colors.border}30`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }),

    statIconBg: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    statLabel: {
        fontSize: '0.7rem',
        color: '#6b7280',
        marginBottom: '2px',
    },

    statValue: {
        fontSize: '1.2rem',
        fontWeight: '700',
        color: '#1f2937',
    },

    controls: (isMobile) => ({
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '16px' : '24px',
    }),

    searchWrapper: (isMobile) => ({
        position: 'relative',
        flex: 1,
    }),

    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
    },

    searchInput: (isMobile) => ({
        width: '100%',
        padding: isMobile ? '10px 12px 10px 40px' : '12px 16px 12px 44px',
        border: `1.5px solid ${appTheme.colors.border}40`,
        borderRadius: '10px',
        fontSize: isMobile ? '14px' : '15px',
        outline: 'none',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        ':focus': {
            borderColor: appTheme.colors.primary,
        },
    }),

    clearSearch: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        fontSize: '18px',
        color: '#9ca3af',
        cursor: 'pointer',
        padding: '4px 8px',
    },

    viewControls: {
        display: 'flex',
        gap: '8px',
    },

    viewButton: (isMobile) => ({
        padding: isMobile ? '8px' : '10px',
        backgroundColor: '#ffffff',
        border: `1.5px solid ${appTheme.colors.border}30`,
        borderRadius: '8px',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        minWidth: isMobile ? '36px' : '40px',
        minHeight: isMobile ? '36px' : '40px',
    }),

    viewButtonActive: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
        color: '#ffffff',
    },

    content: (isMobile) => ({
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: `1px solid ${appTheme.colors.border}30`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        overflow: 'hidden',
    }),

    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
    },

    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTopColor: appTheme.colors.primary,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
    },

    emptyState: (isMobile) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '40px 16px' : '60px 24px',
        textAlign: 'center',
        h3: {
            fontSize: isMobile ? '1.1rem' : '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '16px 0 8px 0',
        },
        p: {
            fontSize: isMobile ? '0.9rem' : '1rem',
            color: '#6b7280',
            marginBottom: '20px',
        },
    }),

    emptyStateButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: appTheme.colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: '#2563eb',
        },
    },

    categoriesContainer: {
        padding: '8px 0',
    },

    categoryRow: (isMobile, level) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '14px 24px',
        borderBottom: `1px solid ${appTheme.colors.border}20`,
        paddingLeft: isMobile ? 16 + (level * 20) : 24 + (level * 24),
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: '#f8fafc',
        },
    }),

    listRow: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '14px 24px',
        borderBottom: `1px solid ${appTheme.colors.border}20`,
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: '#f8fafc',
        },
    }),

    categoryLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
    },

    listLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
    },

    expandButton: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        ':hover': {
            backgroundColor: '#f3f4f6',
        },
    },

    categoryIcon: {
        fontSize: '1.2rem',
        marginRight: '4px',
    },

    categoryInfo: {
        flex: 1,
    },

    categoryNameWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },

    categoryName: (isMobile) => ({
        fontSize: isMobile ? '0.95rem' : '1rem',
        fontWeight: '500',
        color: '#1f2937',
    }),

    categoryDescription: {
        fontSize: '0.8rem',
        color: '#6b7280',
        marginTop: '2px',
        display: 'block',
    },

    inactiveBadge: {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '500',
    },

    productCountBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: `${appTheme.colors.primary}15`,
        color: appTheme.colors.primary,
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '500',
    },

    subCountBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#f59e0b15',
        color: '#f59e0b',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '500',
    },

    categoryActions: {
        display: 'flex',
        gap: '4px',
    },

    actionButton: (isMobile, color) => ({
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '2px' : '4px',
        padding: isMobile ? '6px' : '8px',
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: '6px',
        color: color,
        fontSize: isMobile ? '0.7rem' : '0.8rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: color,
            color: 'white',
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    }),

    subcategoriesContainer: {
        animation: 'slideDown 0.3s ease',
    },

    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },

    modal: (isMobile) => ({
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    }),

    modalHeader: {
        padding: '20px',
        borderBottom: `1px solid ${appTheme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    modalTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: 0,
    },

    modalClose: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        ':hover': {
            backgroundColor: '#f3f4f6',
        },
    },

    modalForm: {
        padding: '20px',
        overflowY: 'auto',
        maxHeight: 'calc(90vh - 80px)',
    },

    formGroup: {
        marginBottom: '16px',
    },

    label: {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '4px',
    },

    required: {
        color: '#ef4444',
    },

    input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        ':focus': {
            borderColor: appTheme.colors.primary,
            boxShadow: `0 0 0 3px ${appTheme.colors.primary}20`,
        },
    },

    select: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
        ':focus': {
            borderColor: appTheme.colors.primary,
            boxShadow: `0 0 0 3px ${appTheme.colors.primary}20`,
        },
    },

    textarea: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        ':focus': {
            borderColor: appTheme.colors.primary,
            boxShadow: `0 0 0 3px ${appTheme.colors.primary}20`,
        },
    },

    errorText: {
        fontSize: '0.75rem',
        color: '#ef4444',
        marginTop: '4px',
        display: 'block',
    },

    helpText: {
        fontSize: '0.7rem',
        color: '#6b7280',
        marginTop: '4px',
        fontStyle: 'italic',
    },

    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
    },

    cancelButton: {
        padding: '10px 16px',
        backgroundColor: 'white',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#f3f4f6',
        },
    },

    submitButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: appTheme.colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#2563eb',
        },
    },

    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        ':hover': {
            backgroundColor: appTheme.colors.primary,
        },
    },

    buttonSpinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};