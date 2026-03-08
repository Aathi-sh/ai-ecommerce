// app/admin/masters/categories/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { appTheme } from '../../../../src/constants/theme';
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
    Check
} from 'lucide-react';

export default function CategoriesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const actionParam = searchParams.get('action');
    
    // State management
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
    const [showInactive, setShowInactive] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [editingCategory, setEditingCategory] = useState(null);
    const [showForm, setShowForm] = useState(actionParam === 'add');
    const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'sub'
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
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        main: 0,
        sub: 0
    });

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

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const url = `/api/masters?type=categories&format=tree${showInactive ? '&includeInactive=true' : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.success) {
                setCategories(data.data);
                if (data.pagination) {
                    setStats({
                        total: data.pagination.total,
                        active: data.stats?.active || 0,
                        main: data.stats?.main || 0,
                        sub: data.stats?.sub || 0
                    });
                }
            } else {
                setErrorMessage('Failed to load categories');
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setErrorMessage('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories, showInactive]);

    // Toggle expand/collapse
    const toggleExpand = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Expand all
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

    // Collapse all
    const collapseAll = () => {
        setExpandedCategories(new Set());
    };

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
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

        try {
            const url = formMode === 'add' 
                ? '/api/masters?type=categories'
                : `/api/masters?type=categories&id=${editingCategory._id}`;
            
            const method = formMode === 'add' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
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
                
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            setErrorMessage('Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit
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
        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

        try {
            const res = await fetch(`/api/masters?type=categories&id=${category._id}`, {
                method: 'DELETE'
            });
            
            const data = await res.json();
            
            if (data.success) {
                setSuccessMessage('Category deleted successfully');
                fetchCategories();
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

    // Handle add subcategory
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

    // Handle toggle active status
    const handleToggleActive = async (category) => {
        try {
            const res = await fetch('/api/masters?type=categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'toggle-status',
                    id: category._id,
                    isActive: !category.isActive
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                setSuccessMessage(`Category ${data.isActive ? 'activated' : 'deactivated'} successfully`);
                fetchCategories();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(data.message || 'Failed to toggle status');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            alert('Failed to toggle status');
        }
    };

    // Handle reorder (simple up/down for now)
    const handleReorder = async (category, direction) => {
        // This would need a more sophisticated implementation with siblings
        alert('Drag and drop reordering coming soon!');
    };

    // Handle cancel form
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

    // Filter categories based on search
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

    // Render category tree
    const renderCategoryTree = (items, level = 0) => {
        return items.map(category => (
            <React.Fragment key={category._id}>
                {/* Category Row */}
                <div 
                    className="category-row"
                    style={{
                        ...styles.categoryRow(isMobile, level),
                        opacity: category.isActive ? 1 : 0.6,
                        backgroundColor: !category.isActive ? '#f9f9f9' : 'transparent'
                    }}
                >
                    <div style={styles.categoryLeft}>
                        {/* Expand/Collapse Button */}
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
                        
                        {/* Category Icon */}
                        <span style={styles.categoryIcon}>{category.icon || '📦'}</span>
                        
                        {/* Category Name and Description */}
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
                                        {category.productCount} products
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

                    {/* Action Buttons */}
                    <div style={styles.categoryActions}>
                        <button
                            onClick={() => handleAddSubcategory(category)}
                            style={styles.actionButton(isMobile, '#10b981')}
                            title="Add Subcategory"
                        >
                            <FilePlus size={isMobile ? 16 : 18} />
                            {!isMobile && <span>Add Sub</span>}
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
                            {!isMobile && <span>{category.isActive ? 'Deactivate' : 'Activate'}</span>}
                        </button>
                        
                        <button
                            onClick={() => handleDelete(category)}
                            style={styles.actionButton(isMobile, '#ef4444')}
                            title="Delete"
                            disabled={category.productCount > 0}
                        >
                            <Trash2 size={isMobile ? 16 : 18} />
                            {!isMobile && <span>Delete</span>}
                        </button>
                    </div>
                </div>

                {/* Subcategories (if expanded) */}
                {expandedCategories.has(category._id) && category.subcategories?.length > 0 && (
                    <div style={styles.subcategoriesContainer}>
                        {renderCategoryTree(category.subcategories, level + 1)}
                    </div>
                )}
            </React.Fragment>
        ));
    };

    // Render list view
    const renderListView = () => {
        // Flatten categories for list view
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
                                    {category.productCount} products
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
                        disabled={category.productCount > 0}
                    >
                        <Trash2 size={isMobile ? 16 : 18} />
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <div style={styles.container(isMobile)}>
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
                        onClick={() => setShowInactive(!showInactive)}
                        style={styles.filterButton(isMobile)}
                    >
                        {showInactive ? <Eye size={18} /> : <EyeOff size={18} />}
                        {!isMobile && (showInactive ? 'Hide Inactive' : 'Show Inactive')}
                    </button>
                    
                    <button
                        onClick={fetchCategories}
                        style={styles.refreshButton(isMobile)}
                    >
                        <RefreshCw size={18} />
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
                    <Folder size={20} color="#3b82f6" />
                    <div>
                        <p style={styles.statLabel}>Total</p>
                        <p style={styles.statValue}>{stats.total}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <CheckCircle size={20} color="#10b981" />
                    <div>
                        <p style={styles.statLabel}>Active</p>
                        <p style={styles.statValue}>{stats.active}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <Folder size={20} color="#8b5cf6" />
                    <div>
                        <p style={styles.statLabel}>Main</p>
                        <p style={styles.statValue}>{stats.main}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <Folder size={20} color="#f59e0b" />
                    <div>
                        <p style={styles.statLabel}>Sub</p>
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
                    >
                        <Folder size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            ...styles.viewButton(isMobile),
                            ...(viewMode === 'list' ? styles.viewButtonActive : {})
                        }}
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
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    <span>Active (visible in store)</span>
                                </label>
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

            {/* Global Styles */}
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

    // Toast
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

    // Header
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

    filterButton: (isMobile) => ({
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
    }),

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

    // Stats
    statsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '12px',
        marginBottom: isMobile ? '16px' : '24px',
    }),

    statCard: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '12px',
        padding: isMobile ? '12px' : '16px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: `1px solid ${appTheme.colors.border}30`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }),

    statLabel: {
        fontSize: '0.7rem',
        color: '#6b7280',
        marginBottom: '2px',
    },

    statValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937',
    },

    // Controls
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

    // Content
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
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#2563eb',
        },
    },

    categoriesContainer: {
        padding: '8px 0',
    },

    // Category Row
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
        backgroundColor: `${appTheme.colors.primary}15`,
        color: appTheme.colors.primary,
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

    // Modal
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

    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.95rem',
        color: '#374151',
        cursor: 'pointer',
        input: {
            width: '16px',
            height: '16px',
            cursor: 'pointer',
        },
    },

    errorText: {
        fontSize: '0.75rem',
        color: '#ef4444',
        marginTop: '4px',
        display: 'block',
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