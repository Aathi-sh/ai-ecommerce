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
    FolderPlus,
    FilePlus,
    Menu,
    Home,
    Grid,
    List,
    MoveUp,
    MoveDown,
    MoreVertical,
    Download,
    Upload,
    Copy,
    Check,
    Building2,
    Shield,
    AlertTriangle,
    Layers,
    Tag,
    BarChart3,
    TrendingUp,
    Package
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
        main: 0,
        sub: 0
    });
    const [mainCategories, setMainCategories] = useState([]);

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

    // Compute stats from categories tree
    const computeStatsFromTree = useCallback((tree) => {
        let total = 0;
        let active = 0;
        let main = 0;
        let sub = 0;

        const traverse = (items, level = 0) => {
            items.forEach(item => {
                total++;
                if (item.isActive) active++;
                if (level === 0) main++;
                else sub++;
                if (item.subcategories?.length) {
                    traverse(item.subcategories, level + 1);
                }
            });
        };

        traverse(tree);
        return { total, active, main, sub };
    }, []);

    // Fetch main categories with companyId
    const fetchMainCategories = useCallback(async () => {
        if (!user?.companyId) return;

        try {
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'categories',
                parentId: 'null',
                limit: '100'
            });

            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });

            const data = await res.json();
            if (data.success) {
                setMainCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch main categories:', error);
        }
    }, [user, getAuthHeaders]);

    // Fetch categories with companyId
    const fetchCategories = useCallback(async () => {
        if (!user?.companyId) return;

        setLoading(true);
        setApiError(null);

        try {
            // Only show active categories - no showInactive toggle
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
                setCategories(data.data);

                // Compute stats from tree data
                const computedStats = computeStatsFromTree(data.data);

                if (data.pagination || data.stats) {
                    setStats({
                        total: data.pagination?.total ?? computedStats.total,
                        active: data.stats?.active ?? computedStats.active,
                        main: data.stats?.main ?? computedStats.main,
                        sub: data.stats?.sub ?? computedStats.sub
                    });
                } else {
                    setStats(computedStats);
                }
            } else {
                setErrorMessage('Failed to load categories');
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setApiError(error.message);
            setErrorMessage(error.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [user, getAuthHeaders, computeStatsFromTree]);

    useEffect(() => {
        if (user?.companyId) {
            fetchCategories();
            fetchMainCategories();
        }
    }, [fetchCategories, fetchMainCategories, user]);

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

    // Handle form submit with companyId
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        setApiError(null);

        try {
            const url = formMode === 'add' || formMode === 'sub'
                ? `/api/masters?companyId=${user?.companyId}&type=categories`
                : `/api/masters?companyId=${user?.companyId}&type=categories&id=${editingCategory?._id}`;

            const method = (formMode === 'add' || formMode === 'sub') ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description?.trim() || '',
                    parentId: formData.parentId,
                    icon: formData.icon || '📦',
                    displayOrder: formData.displayOrder || 0,
                    isActive: formData.isActive
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage(data.message);
                setFormData({
                    name: '',
                    description: '',
                    parentId: null,
                    icon: '📦',
                    isActive: true,
                    displayOrder: 0
                });
                setShowForm(false);
                setEditingCategory(null);
                setParentCategory(null);
                fetchCategories();
                fetchMainCategories();

                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                if (res.status === 403) {
                    throw new Error("You don't have permission to perform this action");
                }
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

    // Handle delete with companyId
    const handleDelete = async (category) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

        try {
            const res = await fetch(`/api/masters?companyId=${user?.companyId}&type=categories&id=${category._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage('Category deleted successfully');
                fetchCategories();
                fetchMainCategories();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                if (data.categories) {
                    alert(`Cannot delete: Used in products - ${data.categories.join(', ')}`);
                } else {
                    alert(data.message || 'Failed to delete category');
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete category');
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

    // Handle toggle active with companyId
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
                fetchCategories();
                fetchMainCategories();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(data.message || 'Failed to toggle status');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            alert('Failed to toggle status');
        }
    };

    const handleCancelForm = () => {
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

    const filterCategories = (items, term) => {
        if (!term) return items;

        return items.filter(item => {
            const matches = item.name.toLowerCase().includes(term.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(term.toLowerCase()));

            if (item.subcategories?.length) {
                item.subcategories = filterCategories(item.subcategories, term);
                return matches || item.subcategories.length > 0;
            }

            return matches;
        });
    };

    const filteredCategories = searchTerm ? filterCategories([...categories], searchTerm) : categories;

    // Count total including subcategories
    const countAllInFiltered = (items) => {
        let count = 0;
        const traverse = (list) => {
            list.forEach(item => {
                count++;
                if (item.subcategories?.length) traverse(item.subcategories);
            });
        };
        traverse(items);
        return count;
    };

    const renderCategoryTree = (items, level = 0) => {
        return items.map(category => (
            <React.Fragment key={category._id}>
                <div
                    className="category-row"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: isMobile ? '11px 14px' : '13px 20px',
                        paddingLeft: isMobile ? 14 + (level * 18) : 20 + (level * 22),
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                        opacity: category.isActive ? 1 : 0.55,
                        backgroundColor: !category.isActive ? '#fafafa' : level === 0 ? '#ffffff' : '#fdfeff',
                        borderLeft: level > 0 ? `3px solid ${level === 1 ? '#c7d2fe' : '#e0e7ff'}` : 'none',
                        cursor: 'default',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        {category.subcategories?.length > 0 ? (
                            <button
                                onClick={() => toggleExpand(category._id)}
                                style={{
                                    background: expandedCategories.has(category._id) ? '#eef2ff' : '#f8fafc',
                                    border: `1px solid ${expandedCategories.has(category._id) ? '#c7d2fe' : '#e2e8f0'}`,
                                    color: expandedCategories.has(category._id) ? '#4f46e5' : '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '6px',
                                    flexShrink: 0,
                                    width: isMobile ? 22 : 26,
                                    height: isMobile ? 22 : 26,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {expandedCategories.has(category._id) ?
                                    <ChevronDown size={isMobile ? 13 : 15} /> :
                                    <ChevronRight size={isMobile ? 13 : 15} />
                                }
                            </button>
                        ) : (
                            <div style={{ width: isMobile ? 22 : 26, flexShrink: 0 }} />
                        )}

                        <span style={{ fontSize: isMobile ? '1rem' : '1.15rem', flexShrink: 0 }}>{category.icon || '📦'}</span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: isMobile ? '0.875rem' : '0.925rem',
                                    fontWeight: level === 0 ? '600' : '500',
                                    color: level === 0 ? '#1e293b' : '#334155',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>
                                    {category.name}
                                </span>

                                {!category.isActive && (
                                    <span style={{
                                        background: '#f1f5f9',
                                        color: '#94a3b8',
                                        padding: '1px 6px',
                                        borderRadius: '20px',
                                        fontSize: '0.65rem',
                                        fontWeight: '600',
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        border: '1px solid #e2e8f0',
                                    }}>Inactive</span>
                                )}

                                {category.subcategories?.length > 0 && (
                                    <span style={{
                                        background: '#eef2ff',
                                        color: '#6366f1',
                                        padding: '1px 7px',
                                        borderRadius: '20px',
                                        fontSize: '0.65rem',
                                        fontWeight: '600',
                                        border: '1px solid #c7d2fe',
                                    }}>
                                        {category.subcategories.length} sub
                                    </span>
                                )}

                                {category.productCount > 0 && (
                                    <span style={{
                                        background: '#f0fdf4',
                                        color: '#16a34a',
                                        padding: '1px 7px',
                                        borderRadius: '20px',
                                        fontSize: '0.65rem',
                                        fontWeight: '600',
                                        border: '1px solid #bbf7d0',
                                    }}>
                                        {category.productCount} products
                                    </span>
                                )}

                                {isSuperAdmin && category.companyId && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        background: `${appTheme.colors.primary}12`,
                                        color: appTheme.colors.primary,
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.6rem',
                                        fontWeight: '500',
                                        border: `1px solid ${appTheme.colors.primary}25`,
                                    }}>
                                        <Building2 size={9} />
                                        {category.companyId?.companyName || 'Company'}
                                    </span>
                                )}
                            </div>

                            {category.description && !isMobile && (
                                <span style={{
                                    fontSize: '0.775rem',
                                    color: '#94a3b8',
                                    marginTop: '1px',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '340px',
                                }}>
                                    {category.description}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                        <button
                            onClick={() => handleAddSubcategory(category)}
                            style={actionBtnStyle(isMobile, '#10b981', '#f0fdf4', '#bbf7d0')}
                            title="Add Subcategory"
                        >
                            <FilePlus size={isMobile ? 14 : 15} />
                            {!isMobile && <span>Sub</span>}
                        </button>

                        <button
                            onClick={() => handleEdit(category)}
                            style={actionBtnStyle(isMobile, '#6366f1', '#eef2ff', '#c7d2fe')}
                            title="Edit"
                        >
                            <Edit2 size={isMobile ? 14 : 15} />
                            {!isMobile && <span>Edit</span>}
                        </button>

                        <button
                            onClick={() => handleToggleActive(category)}
                            style={actionBtnStyle(
                                isMobile,
                                category.isActive ? '#f59e0b' : '#10b981',
                                category.isActive ? '#fffbeb' : '#f0fdf4',
                                category.isActive ? '#fde68a' : '#bbf7d0'
                            )}
                            title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                            {category.isActive ?
                                <EyeOff size={isMobile ? 14 : 15} /> :
                                <Eye size={isMobile ? 14 : 15} />
                            }
                            {!isMobile && <span>{category.isActive ? 'Deactivate' : 'Activate'}</span>}
                        </button>

                        <button
                            onClick={() => handleDelete(category)}
                            style={{
                                ...actionBtnStyle(isMobile, '#ef4444', '#fef2f2', '#fecaca'),
                                opacity: category.productCount > 0 ? 0.4 : 1,
                                cursor: category.productCount > 0 ? 'not-allowed' : 'pointer',
                            }}
                            title="Delete"
                            disabled={category.productCount > 0}
                        >
                            <Trash2 size={isMobile ? 14 : 15} />
                            {!isMobile && <span>Delete</span>}
                        </button>
                    </div>
                </div>

                {expandedCategories.has(category._id) && category.subcategories?.length > 0 && (
                    <div style={{ animation: 'slideDown 0.2s ease' }}>
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '11px 14px' : '13px 20px',
                    paddingLeft: isMobile ? 14 + (category.level * 18) : 20 + (category.level * 22),
                    borderBottom: '1px solid #f1f5f9',
                    opacity: category.isActive ? 1 : 0.55,
                    backgroundColor: !category.isActive ? '#fafafa' : category.level === 0 ? '#ffffff' : '#fdfeff',
                    borderLeft: category.level > 0 ? `3px solid ${category.level === 1 ? '#c7d2fe' : '#e0e7ff'}` : 'none',
                    transition: 'background 0.15s ease',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: isMobile ? '1rem' : '1.15rem', flexShrink: 0 }}>{category.icon || '📦'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: isMobile ? '0.875rem' : '0.925rem',
                                fontWeight: category.level === 0 ? '600' : '500',
                                color: category.level === 0 ? '#1e293b' : '#334155',
                                fontFamily: "'DM Sans', sans-serif",
                            }}>
                                {'—'.repeat(category.level)} {category.name}
                            </span>

                            {!category.isActive && (
                                <span style={{
                                    background: '#f1f5f9',
                                    color: '#94a3b8',
                                    padding: '1px 6px',
                                    borderRadius: '20px',
                                    fontSize: '0.65rem',
                                    fontWeight: '600',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                    border: '1px solid #e2e8f0',
                                }}>Inactive</span>
                            )}

                            {category.productCount > 0 && (
                                <span style={{
                                    background: '#f0fdf4',
                                    color: '#16a34a',
                                    padding: '1px 7px',
                                    borderRadius: '20px',
                                    fontSize: '0.65rem',
                                    fontWeight: '600',
                                    border: '1px solid #bbf7d0',
                                }}>
                                    {category.productCount} products
                                </span>
                            )}

                            {isSuperAdmin && category.companyId && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: `${appTheme.colors.primary}12`,
                                    color: appTheme.colors.primary,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.6rem',
                                    fontWeight: '500',
                                    border: `1px solid ${appTheme.colors.primary}25`,
                                }}>
                                    <Building2 size={9} />
                                    {category.companyId?.companyName || 'Company'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                    <button
                        onClick={() => handleAddSubcategory(category)}
                        style={actionBtnStyle(isMobile, '#10b981', '#f0fdf4', '#bbf7d0')}
                        title="Add Subcategory"
                    >
                        <FilePlus size={isMobile ? 14 : 15} />
                    </button>

                    <button
                        onClick={() => handleEdit(category)}
                        style={actionBtnStyle(isMobile, '#6366f1', '#eef2ff', '#c7d2fe')}
                        title="Edit"
                    >
                        <Edit2 size={isMobile ? 14 : 15} />
                    </button>

                    <button
                        onClick={() => handleToggleActive(category)}
                        style={actionBtnStyle(
                            isMobile,
                            category.isActive ? '#f59e0b' : '#10b981',
                            category.isActive ? '#fffbeb' : '#f0fdf4',
                            category.isActive ? '#fde68a' : '#bbf7d0'
                        )}
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {category.isActive ?
                            <EyeOff size={isMobile ? 14 : 15} /> :
                            <Eye size={isMobile ? 14 : 15} />
                        }
                    </button>

                    <button
                        onClick={() => handleDelete(category)}
                        style={{
                            ...actionBtnStyle(isMobile, '#ef4444', '#fef2f2', '#fecaca'),
                            opacity: category.productCount > 0 ? 0.4 : 1,
                            cursor: category.productCount > 0 ? 'not-allowed' : 'pointer',
                        }}
                        title="Delete"
                        disabled={category.productCount > 0}
                    >
                        <Trash2 size={isMobile ? 14 : 15} />
                    </button>
                </div>
            </div>
        ));
    };

    if (!user) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px' }}>
                <div style={spinnerStyle}></div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Checking authentication...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: isMobile ? '14px' : '24px 28px', backgroundColor: 'transparent', minHeight: '100vh', width: '100%', position: 'relative' }}>

            {/* Inject Google Font */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .spin { animation: spin 1s linear infinite; }
                .category-row:hover { background-color: #f8faff !important; }
                .action-btn:hover { filter: brightness(0.92); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            `}</style>

            {/* Company Context Banner */}
            <div style={{ maxWidth: '1280px', margin: '0 auto 16px auto' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                    border: '1px solid #e0e7ff',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#eef2ff', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                            <Building2 size={16} color="#6366f1" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500', fontFamily: "'DM Sans', sans-serif" }}>
                            {isSuperAdmin ? 'Super Admin View' : 'Company Admin View'} —{' '}
                            <span style={{ color: '#6366f1', fontWeight: '600' }}>{user?.companyName || 'Your Company'}</span>
                        </span>
                    </div>
                    {isSuperAdmin && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                            border: '1px solid #fbbf24',
                            borderRadius: '20px',
                            color: '#92400e',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                        }}>
                            <Shield size={12} />
                            Super Admin
                        </div>
                    )}
                </div>
            </div>

            {/* API Error Message */}
            {apiError && (
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto 16px auto',
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    fontFamily: "'DM Sans', sans-serif",
                }}>
                    <AlertTriangle size={18} />
                    <span>{apiError}</span>
                </div>
            )}

            {/* Toast Messages */}
            {successMessage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                    zIndex: 1100,
                    animation: 'slideIn 0.3s ease',
                    maxWidth: '380px',
                    width: 'calc(100% - 40px)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: '500',
                }}>
                    <CheckCircle size={18} />
                    <span style={{ flex: 1 }}>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '2px', display: 'flex', opacity: 0.8 }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {errorMessage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
                    zIndex: 1100,
                    animation: 'slideIn 0.3s ease',
                    maxWidth: '380px',
                    width: 'calc(100% - 40px)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: '500',
                }}>
                    <AlertCircle size={18} />
                    <span style={{ flex: 1 }}>{errorMessage}</span>
                    <button onClick={() => setErrorMessage('')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '2px', display: 'flex', opacity: 0.8 }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: isMobile ? '18px' : '24px',
                gap: isMobile ? '12px' : 0,
                maxWidth: '1280px',
                margin: '0 auto',
                marginBottom: isMobile ? '18px' : '24px',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{
                            width: '4px',
                            height: isMobile ? '22px' : '28px',
                            background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                            borderRadius: '2px',
                        }} />
                        <h1 style={{
                            color: '#0f172a',
                            fontWeight: '700',
                            fontSize: isMobile ? '1.35rem' : '1.65rem',
                            margin: 0,
                            lineHeight: 1.2,
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: '-0.02em',
                        }}>
                            Categories Master
                        </h1>
                    </div>
                    <p style={{
                        color: '#94a3b8',
                        margin: '0 0 0 14px',
                        fontSize: isMobile ? '0.82rem' : '0.875rem',
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        Manage product categories for{' '}
                        <span style={{ color: '#6366f1', fontWeight: '600' }}>{user?.companyName || 'your company'}</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={fetchCategories}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: isMobile ? '8px 12px' : '9px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '9px',
                            color: '#64748b',
                            fontSize: isMobile ? '0.8rem' : '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        {!isMobile && 'Refresh'}
                    </button>

                    <button
                        onClick={() => {
                            setFormMode('add');
                            setParentCategory(null);
                            setFormData({ name: '', description: '', parentId: null, icon: '📦', isActive: true, displayOrder: 0 });
                            setShowForm(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: isMobile ? '8px 14px' : '9px 18px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '9px',
                            color: 'white',
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                            fontFamily: "'DM Sans', sans-serif",
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <Plus size={17} />
                        {!isMobile && 'Add Category'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? '10px' : '14px',
                marginBottom: isMobile ? '16px' : '22px',
                maxWidth: '1280px',
                margin: '0 auto',
                marginBottom: isMobile ? '16px' : '22px',
                animation: 'fadeIn 0.4s ease',
            }}>
                {[
                    { icon: <Layers size={20} />, label: 'Total', value: stats.total, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
                    { icon: <CheckCircle size={20} />, label: 'Active', value: stats.active, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                    { icon: <Folder size={20} />, label: 'Main', value: stats.main, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
                    { icon: <Tag size={20} />, label: 'Sub', value: stats.sub, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                ].map((stat, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '10px' : '14px',
                        padding: isMobile ? '14px' : '18px',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: `1px solid ${stat.border}`,
                        boxShadow: `0 2px 12px ${stat.color}10`,
                        transition: 'transform 0.2s ease',
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        <div style={{
                            background: stat.bg,
                            borderRadius: '10px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stat.color,
                            flexShrink: 0,
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '2px', fontWeight: '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                {stat.label}
                            </p>
                            <p style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: '700', color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>
                                {loading ? (
                                    <span style={{ display: 'inline-block', width: '2ch', height: '1em', background: '#e2e8f0', borderRadius: '4px', animation: 'spin 1.5s linear infinite', opacity: 0.5 }} />
                                ) : stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and View Controls */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '10px' : '12px',
                marginBottom: isMobile ? '14px' : '18px',
                maxWidth: '1280px',
                margin: '0 auto',
                marginBottom: isMobile ? '14px' : '18px',
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={isMobile ? 15 : 16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder={isMobile ? "Search categories..." : "Search by name or description..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: isMobile ? '9px 12px 9px 36px' : '10px 14px 10px 38px',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '9px',
                            fontSize: isMobile ? '0.85rem' : '0.875rem',
                            outline: 'none',
                            backgroundColor: '#ffffff',
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#0f172a',
                            transition: 'border-color 0.15s ease',
                            boxSizing: 'border-box',
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', color: '#94a3b8', cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}
                        >×</button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                        { action: expandAll, icon: <ChevronDown size={17} />, title: 'Expand All' },
                        { action: collapseAll, icon: <ChevronRight size={17} />, title: 'Collapse All' },
                    ].map((btn, i) => (
                        <button key={i} onClick={btn.action} title={btn.title} style={iconBtnStyle(false)}>
                            {btn.icon}
                        </button>
                    ))}
                    <div style={{ width: '1px', background: '#e2e8f0', margin: '0 2px' }} />
                    <button onClick={() => setViewMode('tree')} title="Tree View" style={iconBtnStyle(viewMode === 'tree')}>
                        <Folder size={17} />
                    </button>
                    <button onClick={() => setViewMode('list')} title="List View" style={iconBtnStyle(viewMode === 'list')}>
                        <List size={17} />
                    </button>
                </div>
            </div>

            {/* Result count when searching */}
            {searchTerm && !loading && (
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto 10px auto',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    fontFamily: "'DM Sans', sans-serif",
                    paddingLeft: '2px',
                }}>
                    {countAllInFiltered(filteredCategories)} result{countAllInFiltered(filteredCategories) !== 1 ? 's' : ''} for "{searchTerm}"
                </div>
            )}

            {/* Main Content */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e0e7ff',
                boxShadow: '0 4px 24px rgba(99, 102, 241, 0.06)',
                overflow: 'hidden',
                maxWidth: '1280px',
                margin: '0 auto',
            }}>
                {/* Table Header */}
                {!loading && filteredCategories.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: isMobile ? '12px 14px' : '14px 20px',
                        background: 'linear-gradient(135deg, #f8faff, #eef2ff)',
                        borderBottom: '1px solid #e0e7ff',
                    }}>
                        <span style={{
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            color: '#6366f1',
                            fontFamily: "'DM Sans', sans-serif",
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            Category Name
                        </span>
                        <span style={{
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            color: '#6366f1',
                            fontFamily: "'DM Sans', sans-serif",
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            Actions
                        </span>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', gap: '14px' }}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif" }}>Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '48px 20px' : '72px 24px', textAlign: 'center', gap: '12px' }}>
                        <div style={{ background: '#f1f5f9', borderRadius: '50%', padding: '20px', display: 'flex' }}>
                            <Folder size={isMobile ? 40 : 52} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: '600', color: '#1e293b', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                            {searchTerm ? 'No matching categories' : 'No categories yet'}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                            {searchTerm ? 'Try a different search term' : 'Get started by creating your first category'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => { setFormMode('add'); setShowForm(true); }}
                                style={{
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '9px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                                }}
                            >
                                <Plus size={16} />
                                Add First Category
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        {viewMode === 'tree' ? renderCategoryTree(filteredCategories) : renderListView()}
                    </div>
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)',
                    }}
                    onClick={handleCancelForm}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            maxWidth: '480px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
                            animation: 'fadeIn 0.25s ease',
                            border: '1px solid #e0e7ff',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #f8faff, #ffffff)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#eef2ff', borderRadius: '9px', padding: '8px', display: 'flex' }}>
                                    {formMode === 'edit' ? <Edit2 size={16} color="#6366f1" /> : <Plus size={16} color="#6366f1" />}
                                </div>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                                    {formMode === 'add' && 'Add New Category'}
                                    {formMode === 'sub' && `Add Sub under "${parentCategory?.name}"`}
                                    {formMode === 'edit' && `Edit "${editingCategory?.name}"`}
                                </h2>
                            </div>
                            <button
                                onClick={handleCancelForm}
                                style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '7px', display: 'flex', alignItems: 'center', borderRadius: '8px', transition: 'all 0.15s' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>

                            {/* Name */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Category Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter category name"
                                    style={{
                                        ...inputStyle,
                                        borderColor: formErrors.name ? '#ef4444' : '#e2e8f0',
                                    }}
                                    autoFocus
                                />
                                {formErrors.name && <span style={errorTextStyle}>{formErrors.name}</span>}
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter category description (optional)"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '9px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: "'DM Sans', sans-serif",
                                        color: '#0f172a',
                                        transition: 'border-color 0.15s ease',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                {formErrors.description && <span style={errorTextStyle}>{formErrors.description}</span>}
                            </div>

                            {/* Parent Category */}
                            {(formMode === 'add' || formMode === 'edit') && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Parent Category</label>
                                    <select
                                        name="parentId"
                                        value={formData.parentId || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            ...inputStyle,
                                            cursor: 'pointer',
                                            borderColor: formErrors.parentId ? '#ef4444' : '#e2e8f0',
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
                                    {formErrors.parentId && <span style={errorTextStyle}>{formErrors.parentId}</span>}
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                                        Select a parent to create a subcategory
                                    </p>
                                </div>
                            )}

                            {/* Icon */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Icon (Emoji)</label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleInputChange}
                                    placeholder="📦"
                                    maxLength="2"
                                    style={{ ...inputStyle, width: '80px', textAlign: 'center', fontSize: '1.2rem' }}
                                />
                            </div>

                            {/* Active Checkbox */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '9px',
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: '500',
                                }}>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                                    />
                                    <span>Active <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.82rem' }}>(visible in store)</span></span>
                                </label>
                            </div>

                            {/* Footer Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    type="button"
                                    onClick={handleCancelForm}
                                    style={{
                                        padding: '10px 18px',
                                        backgroundColor: '#f8fafc',
                                        color: '#374151',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '9px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        fontFamily: "'DM Sans', sans-serif",
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 22px',
                                        background: isSubmitting ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '9px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontFamily: "'DM Sans', sans-serif",
                                        boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.35)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={15} />
                                            {formMode === 'edit' ? 'Update' : 'Create'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ========== HELPER STYLE FUNCTIONS ==========

const actionBtnStyle = (isMobile, color, bg, border) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '0px' : '4px',
    padding: isMobile ? '6px' : '6px 10px',
    backgroundColor: bg,
    border: `1px solid ${border}`,
    borderRadius: '7px',
    color: color,
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
});

const iconBtnStyle = (active) => ({
    padding: '8px',
    backgroundColor: active ? '#eef2ff' : '#f8fafc',
    border: `1.5px solid ${active ? '#c7d2fe' : '#e2e8f0'}`,
    borderRadius: '8px',
    color: active ? '#6366f1' : '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    minWidth: '36px',
    minHeight: '36px',
});

const spinnerStyle = {
    width: '36px',
    height: '36px',
    border: '3px solid #e0e7ff',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
};

const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.01em',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '9px',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    color: '#0f172a',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
};

const errorTextStyle = {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '4px',
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
};