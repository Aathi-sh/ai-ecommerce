







// // app/admin/masters/categories/page.js
// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '../../../../context/AuthContext';
// import { appTheme } from '../../../../src/constants/theme';
// import {
//     Folder,
//     Plus,
//     Edit2,
//     Trash2,
//     ChevronRight,
//     ChevronDown,
//     Save,
//     X,
//     Search,
//     RefreshCw,
//     Eye,
//     EyeOff,
//     AlertCircle,
//     CheckCircle,
//     FolderPlus,
//     FilePlus,
//     Menu,
//     Home,
//     Grid,
//     List,
//     MoveUp,
//     MoveDown,
//     MoreVertical,
//     Download,
//     Upload,
//     Copy,
//     Check,
//     Building2,
//     Shield,
//     AlertTriangle,
//     Layers
// } from 'lucide-react';

// export default function CategoriesPage() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const actionParam = searchParams.get('action');
//     const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
    
//     // State management
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isMobile, setIsMobile] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
//     const [showInactive, setShowInactive] = useState(false);
//     const [expandedCategories, setExpandedCategories] = useState(new Set());
//     const [editingCategory, setEditingCategory] = useState(null);
//     const [showForm, setShowForm] = useState(actionParam === 'add');
//     const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'sub'
//     const [parentCategory, setParentCategory] = useState(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         parentId: null,
//         icon: '📦',
//         isActive: true,
//         displayOrder: 0
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [apiError, setApiError] = useState(null);
//     const [stats, setStats] = useState({
//         total: 0,
//         active: 0,
//         main: 0,
//         sub: 0
//     });
//     const [mainCategories, setMainCategories] = useState([]); // For parent dropdown

//     // Redirect if not authenticated
//     useEffect(() => {
//         if (!user) {
//             router.push('/login');
//         } else if (!isCompanyAdmin && !isSuperAdmin) {
//             router.push('/dashboard');
//         }
//     }, [user, isCompanyAdmin, isSuperAdmin, router]);

//     // Mobile detection
//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 768);
//         };
        
//         checkMobile();
        
//         let resizeTimeout;
//         const handleResize = () => {
//             clearTimeout(resizeTimeout);
//             resizeTimeout = setTimeout(checkMobile, 150);
//         };
        
//         window.addEventListener('resize', handleResize);
//         return () => {
//             window.removeEventListener('resize', handleResize);
//             clearTimeout(resizeTimeout);
//         };
//     }, []);

//     // Fetch main categories for parent dropdown
//     const fetchMainCategories = useCallback(async () => {
//         if (!user?.companyId) return;
        
//         try {
//             const params = new URLSearchParams({
//                 type: 'categories',
//                 parentId: 'null',
//                 limit: '100'
//             });
            
//             const res = await fetch(`/api/masters?${params}`, {
//                 headers: getAuthHeaders()
//             });
            
//             const data = await res.json();
//             if (data.success) {
//                 setMainCategories(data.data);
//             }
//         } catch (error) {
//             console.error('Failed to fetch main categories:', error);
//         }
//     }, [user, getAuthHeaders]);

//     // Fetch categories
//     const fetchCategories = useCallback(async () => {
//         if (!user?.companyId) return;
        
//         setLoading(true);
//         setApiError(null);
        
//         try {
//             const url = `/api/masters?type=categories&format=tree${showInactive ? '&includeInactive=true' : ''}`;
//             const res = await fetch(url, {
//                 headers: getAuthHeaders()
//             });
            
//             if (!res.ok) {
//                 if (res.status === 403) {
//                     throw new Error("You don't have permission to view categories");
//                 }
//                 throw new Error(`HTTP error! status: ${res.status}`);
//             }
            
//             const data = await res.json();
            
//             if (data.success) {
//                 setCategories(data.data);
//                 if (data.pagination) {
//                     setStats({
//                         total: data.pagination.total,
//                         active: data.stats?.active || 0,
//                         main: data.stats?.main || 0,
//                         sub: data.stats?.sub || 0
//                     });
//                 }
//             } else {
//                 setErrorMessage('Failed to load categories');
//             }
//         } catch (error) {
//             console.error('Failed to fetch categories:', error);
//             setApiError(error.message);
//             setErrorMessage(error.message || 'Failed to load categories');
//         } finally {
//             setLoading(false);
//         }
//     }, [showInactive, user, getAuthHeaders]);

//     useEffect(() => {
//         if (user?.companyId) {
//             fetchCategories();
//             fetchMainCategories();
//         }
//     }, [fetchCategories, fetchMainCategories, showInactive, user]);

//     // Toggle expand/collapse
//     const toggleExpand = (categoryId) => {
//         const newExpanded = new Set(expandedCategories);
//         if (newExpanded.has(categoryId)) {
//             newExpanded.delete(categoryId);
//         } else {
//             newExpanded.add(categoryId);
//         }
//         setExpandedCategories(newExpanded);
//     };

//     // Expand all
//     const expandAll = () => {
//         const allIds = new Set();
//         const collectIds = (items) => {
//             items.forEach(item => {
//                 allIds.add(item._id);
//                 if (item.subcategories?.length) {
//                     collectIds(item.subcategories);
//                 }
//             });
//         };
//         collectIds(categories);
//         setExpandedCategories(allIds);
//     };

//     // Collapse all
//     const collapseAll = () => {
//         setExpandedCategories(new Set());
//     };

//     // Handle form input
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
        
//         // Clear error for this field
//         if (formErrors[name]) {
//             setFormErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     // Validate form
//     const validateForm = () => {
//         const errors = {};
        
//         if (!formData.name.trim()) {
//             errors.name = 'Category name is required';
//         } else if (formData.name.length < 2) {
//             errors.name = 'Name must be at least 2 characters';
//         } else if (formData.name.length > 100) {
//             errors.name = 'Name cannot exceed 100 characters';
//         }
        
//         if (formData.description && formData.description.length > 500) {
//             errors.description = 'Description cannot exceed 500 characters';
//         }
        
//         // Prevent setting self as parent during edit
//         if (formMode === 'edit' && formData.parentId === editingCategory?._id) {
//             errors.parentId = 'Category cannot be its own parent';
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     // Handle form submit
//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) return;
        
//         setIsSubmitting(true);
//         setErrorMessage('');
//         setSuccessMessage('');
//         setApiError(null);

//         try {
//             const url = formMode === 'add' || formMode === 'sub'
//                 ? '/api/masters?type=categories'
//                 : `/api/masters?type=categories&id=${editingCategory?._id}`;
            
//             const method = (formMode === 'add' || formMode === 'sub') ? 'POST' : 'PUT';

//             const res = await fetch(url, {
//                 method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...getAuthHeaders()
//                 },
//                 body: JSON.stringify({
//                     name: formData.name.trim(),
//                     description: formData.description?.trim() || '',
//                     parentId: formData.parentId,
//                     icon: formData.icon || '📦',
//                     displayOrder: formData.displayOrder || 0,
//                     isActive: formData.isActive
//                 })
//             });

//             const data = await res.json();

//             if (data.success) {
//                 setSuccessMessage(data.message);
//                 setFormData({
//                     name: '',
//                     description: '',
//                     parentId: null,
//                     icon: '📦',
//                     isActive: true,
//                     displayOrder: 0
//                 });
//                 setShowForm(false);
//                 setEditingCategory(null);
//                 setParentCategory(null);
//                 fetchCategories();
//                 fetchMainCategories();
                
//                 setTimeout(() => setSuccessMessage(''), 3000);
//             } else {
//                 if (res.status === 403) {
//                     throw new Error("You don't have permission to perform this action");
//                 }
//                 setErrorMessage(data.message || 'Failed to save category');
//             }
//         } catch (error) {
//             console.error('Error saving category:', error);
//             setApiError(error.message);
//             setErrorMessage(error.message || 'Failed to save category');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Handle edit
//     const handleEdit = (category) => {
//         setEditingCategory(category);
//         setFormData({
//             name: category.name,
//             description: category.description || '',
//             parentId: category.parentId,
//             icon: category.icon || '📦',
//             isActive: category.isActive,
//             displayOrder: category.displayOrder || 0
//         });
//         setFormMode('edit');
//         setShowForm(true);
//     };

//     // Handle delete
//     const handleDelete = async (category) => {
//         if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

//         try {
//             const res = await fetch(`/api/masters?type=categories&id=${category._id}`, {
//                 method: 'DELETE',
//                 headers: getAuthHeaders()
//             });
            
//             const data = await res.json();
            
//             if (data.success) {
//                 setSuccessMessage('Category deleted successfully');
//                 fetchCategories();
//                 fetchMainCategories();
//                 setTimeout(() => setSuccessMessage(''), 3000);
//             } else {
//                 if (data.categories) {
//                     alert(`Cannot delete: Used in products - ${data.categories.join(', ')}`);
//                 } else {
//                     alert(data.message || 'Failed to delete category');
//                 }
//             }
//         } catch (error) {
//             console.error('Delete error:', error);
//             alert('Failed to delete category');
//         }
//     };

//     // Handle add subcategory
//     const handleAddSubcategory = (parent) => {
//         setParentCategory(parent);
//         setFormData({
//             name: '',
//             description: '',
//             parentId: parent._id,
//             icon: '📦',
//             isActive: true,
//             displayOrder: 0
//         });
//         setFormMode('sub');
//         setShowForm(true);
//     };

//     // Handle toggle active status
//     const handleToggleActive = async (category) => {
//         try {
//             const res = await fetch('/api/masters?type=categories', {
//                 method: 'PATCH',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...getAuthHeaders()
//                 },
//                 body: JSON.stringify({
//                     action: 'toggle-status',
//                     id: category._id,
//                     isActive: !category.isActive
//                 })
//             });
            
//             const data = await res.json();
            
//             if (data.success) {
//                 setSuccessMessage(`Category ${data.isActive ? 'activated' : 'deactivated'} successfully`);
//                 fetchCategories();
//                 fetchMainCategories();
//                 setTimeout(() => setSuccessMessage(''), 3000);
//             } else {
//                 alert(data.message || 'Failed to toggle status');
//             }
//         } catch (error) {
//             console.error('Toggle status error:', error);
//             alert('Failed to toggle status');
//         }
//     };

//     // Handle reorder
//     const handleReorder = async (category, direction) => {
//         // This would need a more sophisticated implementation with siblings
//         alert('Drag and drop reordering coming soon!');
//     };

//     // Handle cancel form
//     const handleCancelForm = () => {
//         setShowForm(false);
//         setEditingCategory(null);
//         setParentCategory(null);
//         setFormData({
//             name: '',
//             description: '',
//             parentId: null,
//             icon: '📦',
//             isActive: true,
//             displayOrder: 0
//         });
//         setFormErrors({});
//     };

//     // Filter categories based on search
//     const filterCategories = (items, term) => {
//         if (!term) return items;
        
//         return items.filter(item => {
//             const matches = item.name.toLowerCase().includes(term.toLowerCase()) ||
//                            (item.description && item.description.toLowerCase().includes(term.toLowerCase()));
            
//             if (item.subcategories?.length) {
//                 item.subcategories = filterCategories(item.subcategories, term);
//                 return matches || item.subcategories.length > 0;
//             }
            
//             return matches;
//         });
//     };

//     const filteredCategories = searchTerm ? filterCategories([...categories], searchTerm) : categories;

//     // Render category tree
//     const renderCategoryTree = (items, level = 0) => {
//         return items.map(category => (
//             <React.Fragment key={category._id}>
//                 {/* Category Row */}
//                 <div 
//                     className="category-row"
//                     style={{
//                         ...styles.categoryRow(isMobile, level),
//                         opacity: category.isActive ? 1 : 0.6,
//                         backgroundColor: !category.isActive ? '#f9f9f9' : 'transparent'
//                     }}
//                 >
//                     <div style={styles.categoryLeft}>
//                         {/* Expand/Collapse Button */}
//                         {category.subcategories?.length > 0 ? (
//                             <button
//                                 onClick={() => toggleExpand(category._id)}
//                                 style={styles.expandButton}
//                             >
//                                 {expandedCategories.has(category._id) ? 
//                                     <ChevronDown size={isMobile ? 16 : 18} /> : 
//                                     <ChevronRight size={isMobile ? 16 : 18} />
//                                 }
//                             </button>
//                         ) : (
//                             <div style={{ width: isMobile ? 24 : 28 }} />
//                         )}
                        
//                         {/* Category Icon */}
//                         <span style={styles.categoryIcon}>{category.icon || '📦'}</span>
                        
//                         {/* Category Name and Description */}
//                         <div style={styles.categoryInfo}>
//                             <div style={styles.categoryNameWrapper}>
//                                 <span style={styles.categoryName(isMobile)}>
//                                     {category.name}
//                                 </span>
//                                 {!category.isActive && (
//                                     <span style={styles.inactiveBadge}>Inactive</span>
//                                 )}
//                                 {category.productCount > 0 && (
//                                     <span style={styles.productCountBadge}>
//                                         {category.productCount} products
//                                     </span>
//                                 )}
//                                 {/* Company badge for super admin */}
//                                 {isSuperAdmin && category.companyId && (
//                                     <span style={styles.companyBadge}>
//                                         <Building2 size={10} />
//                                         {category.companyId?.companyName || 'Company'}
//                                     </span>
//                                 )}
//                             </div>
//                             {category.description && !isMobile && (
//                                 <span style={styles.categoryDescription}>
//                                     {category.description}
//                                 </span>
//                             )}
//                         </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div style={styles.categoryActions}>
//                         <button
//                             onClick={() => handleAddSubcategory(category)}
//                             style={styles.actionButton(isMobile, '#10b981')}
//                             title="Add Subcategory"
//                         >
//                             <FilePlus size={isMobile ? 16 : 18} />
//                             {!isMobile && <span>Add Sub</span>}
//                         </button>
                        
//                         <button
//                             onClick={() => handleEdit(category)}
//                             style={styles.actionButton(isMobile, '#3b82f6')}
//                             title="Edit"
//                         >
//                             <Edit2 size={isMobile ? 16 : 18} />
//                             {!isMobile && <span>Edit</span>}
//                         </button>
                        
//                         <button
//                             onClick={() => handleToggleActive(category)}
//                             style={styles.actionButton(
//                                 isMobile, 
//                                 category.isActive ? '#f59e0b' : '#10b981'
//                             )}
//                             title={category.isActive ? 'Deactivate' : 'Activate'}
//                         >
//                             {category.isActive ? 
//                                 <EyeOff size={isMobile ? 16 : 18} /> : 
//                                 <Eye size={isMobile ? 16 : 18} />
//                             }
//                             {!isMobile && <span>{category.isActive ? 'Deactivate' : 'Activate'}</span>}
//                         </button>
                        
//                         <button
//                             onClick={() => handleDelete(category)}
//                             style={styles.actionButton(isMobile, '#ef4444')}
//                             title="Delete"
//                             disabled={category.productCount > 0}
//                         >
//                             <Trash2 size={isMobile ? 16 : 18} />
//                             {!isMobile && <span>Delete</span>}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Subcategories (if expanded) */}
//                 {expandedCategories.has(category._id) && category.subcategories?.length > 0 && (
//                     <div style={styles.subcategoriesContainer}>
//                         {renderCategoryTree(category.subcategories, level + 1)}
//                     </div>
//                 )}
//             </React.Fragment>
//         ));
//     };

//     // Render list view
//     const renderListView = () => {
//         // Flatten categories for list view
//         const flattenCategories = (items, level = 0) => {
//             let result = [];
//             items.forEach(item => {
//                 result.push({ ...item, level });
//                 if (item.subcategories?.length) {
//                     result = result.concat(flattenCategories(item.subcategories, level + 1));
//                 }
//             });
//             return result;
//         };

//         const flatList = flattenCategories(filteredCategories);

//         return flatList.map(category => (
//             <div
//                 key={category._id}
//                 style={{
//                     ...styles.listRow(isMobile),
//                     opacity: category.isActive ? 1 : 0.6,
//                     backgroundColor: !category.isActive ? '#f9f9f9' : 'transparent',
//                     paddingLeft: isMobile ? 16 + (category.level * 20) : 24 + (category.level * 24)
//                 }}
//             >
//                 <div style={styles.listLeft}>
//                     <span style={styles.categoryIcon}>{category.icon || '📦'}</span>
//                     <div style={styles.categoryInfo}>
//                         <div style={styles.categoryNameWrapper}>
//                             <span style={styles.categoryName(isMobile)}>
//                                 {'—'.repeat(category.level)} {category.name}
//                             </span>
//                             {!category.isActive && (
//                                 <span style={styles.inactiveBadge}>Inactive</span>
//                             )}
//                             {category.productCount > 0 && (
//                                 <span style={styles.productCountBadge}>
//                                     {category.productCount} products
//                                 </span>
//                             )}
//                             {isSuperAdmin && category.companyId && (
//                                 <span style={styles.companyBadge}>
//                                     <Building2 size={10} />
//                                     {category.companyId?.companyName || 'Company'}
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div style={styles.categoryActions}>
//                     <button
//                         onClick={() => handleAddSubcategory(category)}
//                         style={styles.actionButton(isMobile, '#10b981')}
//                         title="Add Subcategory"
//                     >
//                         <FilePlus size={isMobile ? 16 : 18} />
//                     </button>
                    
//                     <button
//                         onClick={() => handleEdit(category)}
//                         style={styles.actionButton(isMobile, '#3b82f6')}
//                         title="Edit"
//                     >
//                         <Edit2 size={isMobile ? 16 : 18} />
//                     </button>
                    
//                     <button
//                         onClick={() => handleToggleActive(category)}
//                         style={styles.actionButton(
//                             isMobile, 
//                             category.isActive ? '#f59e0b' : '#10b981'
//                         )}
//                         title={category.isActive ? 'Deactivate' : 'Activate'}
//                     >
//                         {category.isActive ? 
//                             <EyeOff size={isMobile ? 16 : 18} /> : 
//                             <Eye size={isMobile ? 16 : 18} />
//                         }
//                     </button>
                    
//                     <button
//                         onClick={() => handleDelete(category)}
//                         style={styles.actionButton(isMobile, '#ef4444')}
//                         title="Delete"
//                         disabled={category.productCount > 0}
//                     >
//                         <Trash2 size={isMobile ? 16 : 18} />
//                     </button>
//                 </div>
//             </div>
//         ));
//     };

//     // Loading state
//     if (!user) {
//         return (
//             <div style={styles.loadingContainer}>
//                 <div style={styles.spinner}></div>
//                 <p>Checking authentication...</p>
//             </div>
//         );
//     }

//     return (
//         <div style={styles.container(isMobile)}>
//             {/* Company Context Banner */}
//             <div style={styles.companyBanner}>
//                 <div style={styles.companyBannerContent}>
//                     <div style={styles.companyBannerLeft}>
//                         <Building2 size={20} color={appTheme.colors.primary} />
//                         <span style={styles.companyBannerText}>
//                             {isSuperAdmin ? 'Super Admin View' : 'Company Admin View'} - 
//                             {user?.companyName || 'Your Company'}
//                         </span>
//                     </div>
//                     {isSuperAdmin && (
//                         <div style={styles.superAdminBadge}>
//                             <Shield size={16} />
//                             Super Admin
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* API Error Message */}
//             {apiError && (
//                 <div style={styles.apiError}>
//                     <AlertTriangle size={20} />
//                     <span>{apiError}</span>
//                 </div>
//             )}

//             {/* Toast Messages */}
//             {successMessage && (
//                 <div style={styles.toast.success}>
//                     <CheckCircle size={20} />
//                     <span>{successMessage}</span>
//                     <button onClick={() => setSuccessMessage('')} style={styles.toast.close}>
//                         <X size={16} />
//                     </button>
//                 </div>
//             )}

//             {errorMessage && (
//                 <div style={styles.toast.error}>
//                     <AlertCircle size={20} />
//                     <span>{errorMessage}</span>
//                     <button onClick={() => setErrorMessage('')} style={styles.toast.close}>
//                         <X size={16} />
//                     </button>
//                 </div>
//             )}

//             {/* Header */}
//             <div style={styles.header(isMobile)}>
//                 <div>
//                     <div style={styles.titleWrapper(isMobile)}>
//                         <div style={styles.titleBar(isMobile)}></div>
//                         <h1 style={styles.title(isMobile)}>Categories Master</h1>
//                     </div>
//                     <p style={styles.subtitle(isMobile)}>
//                         Manage your product categories and subcategories for {user?.companyName || 'your company'}
//                     </p>
//                 </div>

//                 <div style={styles.headerActions}>
//                     <button
//                         onClick={() => setShowInactive(!showInactive)}
//                         style={styles.filterButton(isMobile)}
//                     >
//                         {showInactive ? <Eye size={18} /> : <EyeOff size={18} />}
//                         {!isMobile && (showInactive ? 'Hide Inactive' : 'Show Inactive')}
//                     </button>
                    
//                     <button
//                         onClick={fetchCategories}
//                         style={styles.refreshButton(isMobile)}
//                     >
//                         <RefreshCw size={18} className={loading ? 'spin' : ''} />
//                         {!isMobile && 'Refresh'}
//                     </button>
                    
//                     <button
//                         onClick={() => {
//                             setFormMode('add');
//                             setParentCategory(null);
//                             setFormData({
//                                 name: '',
//                                 description: '',
//                                 parentId: null,
//                                 icon: '📦',
//                                 isActive: true,
//                                 displayOrder: 0
//                             });
//                             setShowForm(true);
//                         }}
//                         style={styles.addButton(isMobile)}
//                     >
//                         <Plus size={18} />
//                         {!isMobile && 'Add Category'}
//                     </button>
//                 </div>
//             </div>

//             {/* Stats Cards */}
//             <div style={styles.statsGrid(isMobile)}>
//                 <div style={styles.statCard(isMobile)}>
//                     <Folder size={20} color="#3b82f6" />
//                     <div>
//                         <p style={styles.statLabel}>Total</p>
//                         <p style={styles.statValue}>{stats.total}</p>
//                     </div>
//                 </div>
//                 <div style={styles.statCard(isMobile)}>
//                     <CheckCircle size={20} color="#10b981" />
//                     <div>
//                         <p style={styles.statLabel}>Active</p>
//                         <p style={styles.statValue}>{stats.active}</p>
//                     </div>
//                 </div>
//                 <div style={styles.statCard(isMobile)}>
//                     <Folder size={20} color="#8b5cf6" />
//                     <div>
//                         <p style={styles.statLabel}>Main</p>
//                         <p style={styles.statValue}>{stats.main}</p>
//                     </div>
//                 </div>
//                 <div style={styles.statCard(isMobile)}>
//                     <Folder size={20} color="#f59e0b" />
//                     <div>
//                         <p style={styles.statLabel}>Sub</p>
//                         <p style={styles.statValue}>{stats.sub}</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Search and View Controls */}
//             <div style={styles.controls(isMobile)}>
//                 <div style={styles.searchWrapper(isMobile)}>
//                     <Search size={isMobile ? 16 : 18} color="#9ca3af" style={styles.searchIcon} />
//                     <input
//                         type="text"
//                         placeholder={isMobile ? "Search..." : "Search categories by name or description..."}
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={styles.searchInput(isMobile)}
//                     />
//                     {searchTerm && (
//                         <button
//                             onClick={() => setSearchTerm('')}
//                             style={styles.clearSearch}
//                         >
//                             ×
//                         </button>
//                     )}
//                 </div>

//                 <div style={styles.viewControls}>
//                     <button
//                         onClick={expandAll}
//                         style={styles.viewButton(isMobile)}
//                         title="Expand All"
//                     >
//                         <ChevronDown size={18} />
//                     </button>
//                     <button
//                         onClick={collapseAll}
//                         style={styles.viewButton(isMobile)}
//                         title="Collapse All"
//                     >
//                         <ChevronRight size={18} />
//                     </button>
//                     <button
//                         onClick={() => setViewMode('tree')}
//                         style={{
//                             ...styles.viewButton(isMobile),
//                             ...(viewMode === 'tree' ? styles.viewButtonActive : {})
//                         }}
//                     >
//                         <Folder size={18} />
//                     </button>
//                     <button
//                         onClick={() => setViewMode('list')}
//                         style={{
//                             ...styles.viewButton(isMobile),
//                             ...(viewMode === 'list' ? styles.viewButtonActive : {})
//                         }}
//                     >
//                         <List size={18} />
//                     </button>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div style={styles.content(isMobile)}>
//                 {loading ? (
//                     <div style={styles.loadingContainer}>
//                         <div style={styles.spinner}></div>
//                         <p>Loading categories...</p>
//                     </div>
//                 ) : filteredCategories.length === 0 ? (
//                     <div style={styles.emptyState(isMobile)}>
//                         <Folder size={isMobile ? 48 : 64} color="#d1d5db" />
//                         <h3>No categories found</h3>
//                         <p>
//                             {searchTerm 
//                                 ? 'No results match your search' 
//                                 : 'Get started by creating your first category'
//                             }
//                         </p>
//                         {!searchTerm && (
//                             <button
//                                 onClick={() => {
//                                     setFormMode('add');
//                                     setShowForm(true);
//                                 }}
//                                 style={styles.emptyStateButton}
//                             >
//                                 <Plus size={16} />
//                                 Add Category
//                             </button>
//                         )}
//                     </div>
//                 ) : (
//                     <div style={styles.categoriesContainer}>
//                         {viewMode === 'tree' ? (
//                             renderCategoryTree(filteredCategories)
//                         ) : (
//                             renderListView()
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* Add/Edit Form Modal */}
//             {showForm && (
//                 <div style={styles.modalOverlay} onClick={handleCancelForm}>
//                     <div style={styles.modal(isMobile)} onClick={(e) => e.stopPropagation()}>
//                         <div style={styles.modalHeader}>
//                             <h2 style={styles.modalTitle}>
//                                 {formMode === 'add' && 'Add New Category'}
//                                 {formMode === 'sub' && `Add Subcategory under "${parentCategory?.name}"`}
//                                 {formMode === 'edit' && `Edit "${editingCategory?.name}"`}
//                             </h2>
//                             <button onClick={handleCancelForm} style={styles.modalClose}>
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         <form onSubmit={handleSubmit} style={styles.modalForm}>
//                             <div style={styles.formGroup}>
//                                 <label style={styles.label}>
//                                     Category Name <span style={styles.required}>*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={formData.name}
//                                     onChange={handleInputChange}
//                                     placeholder="Enter category name"
//                                     style={{
//                                         ...styles.input,
//                                         borderColor: formErrors.name ? '#ef4444' : '#e5e7eb'
//                                     }}
//                                     autoFocus
//                                 />
//                                 {formErrors.name && (
//                                     <span style={styles.errorText}>{formErrors.name}</span>
//                                 )}
//                             </div>

//                             <div style={styles.formGroup}>
//                                 <label style={styles.label}>Description</label>
//                                 <textarea
//                                     name="description"
//                                     value={formData.description}
//                                     onChange={handleInputChange}
//                                     placeholder="Enter category description (optional)"
//                                     rows={isMobile ? 3 : 4}
//                                     style={styles.textarea}
//                                 />
//                                 {formErrors.description && (
//                                     <span style={styles.errorText}>{formErrors.description}</span>
//                                 )}
//                             </div>

//                             {/* Parent Category Dropdown - NEW */}
//                             {(formMode === 'add' || formMode === 'edit') && (
//                                 <div style={styles.formGroup}>
//                                     <label style={styles.label}>Parent Category</label>
//                                     <select
//                                         name="parentId"
//                                         value={formData.parentId || ''}
//                                         onChange={handleInputChange}
//                                         style={{
//                                             ...styles.select,
//                                             borderColor: formErrors.parentId ? '#ef4444' : '#e5e7eb'
//                                         }}
//                                     >
//                                         <option value="">None (Main Category)</option>
//                                         {mainCategories
//                                             .filter(cat => formMode !== 'edit' || cat._id !== editingCategory?._id)
//                                             .map(cat => (
//                                                 <option key={cat._id} value={cat._id}>
//                                                     {cat.name}
//                                                 </option>
//                                             ))}
//                                     </select>
//                                     {formErrors.parentId && (
//                                         <span style={styles.errorText}>{formErrors.parentId}</span>
//                                     )}
//                                     <p style={styles.helpText}>
//                                         Select a parent category to create a subcategory
//                                     </p>
//                                 </div>
//                             )}

//                             <div style={styles.formGroup}>
//                                 <label style={styles.label}>Icon (Emoji)</label>
//                                 <input
//                                     type="text"
//                                     name="icon"
//                                     value={formData.icon}
//                                     onChange={handleInputChange}
//                                     placeholder="📦"
//                                     maxLength="2"
//                                     style={styles.input}
//                                 />
//                             </div>

//                             <div style={styles.formGroup}>
//                                 <label style={styles.checkboxLabel}>
//                                     <input
//                                         type="checkbox"
//                                         name="isActive"
//                                         checked={formData.isActive}
//                                         onChange={handleInputChange}
//                                     />
//                                     <span>Active (visible in store)</span>
//                                 </label>
//                             </div>

//                             <div style={styles.modalFooter}>
//                                 <button
//                                     type="button"
//                                     onClick={handleCancelForm}
//                                     style={styles.cancelButton}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={isSubmitting}
//                                     style={{
//                                         ...styles.submitButton,
//                                         ...(isSubmitting ? styles.buttonDisabled : {})
//                                     }}
//                                 >
//                                     {isSubmitting ? (
//                                         <>
//                                             <div style={styles.buttonSpinner}></div>
//                                             Saving...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Save size={16} />
//                                             {formMode === 'edit' ? 'Update' : 'Create'}
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Global Styles */}
//             <style jsx>{`
//                 @keyframes spin {
//                     0% { transform: rotate(0deg); }
//                     100% { transform: rotate(360deg); }
//                 }
//                 @keyframes slideIn {
//                     from {
//                         transform: translateX(100%);
//                         opacity: 0;
//                     }
//                     to {
//                         transform: translateX(0);
//                         opacity: 1;
//                     }
//                 }
//                 @keyframes slideDown {
//                     from {
//                         opacity: 0;
//                         transform: translateY(-10px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateY(0);
//                     }
//                 }
//                 .spin {
//                     animation: spin 1s linear infinite;
//                 }
//             `}</style>
//         </div>
//     );
// }

// // ========== STYLES ==========
// const styles = {
//     container: (isMobile) => ({
//         padding: isMobile ? '12px' : '24px',
//         backgroundColor: 'transparent',
//         minHeight: '100vh',
//         width: '100%',
//         position: 'relative',
//     }),

//     // Company Banner
//     companyBanner: {
//         maxWidth: '1200px',
//         margin: '0 auto 16px auto',
//         padding: '0',
//     },

//     companyBannerContent: {
//         background: '#ffffff',
//         border: `1px solid ${appTheme.colors.border}30`,
//         borderRadius: '10px',
//         padding: '12px 16px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         flexWrap: 'wrap',
//         gap: '10px',
//     },

//     companyBannerLeft: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//     },

//     companyBannerText: {
//         fontSize: '0.9rem',
//         color: '#1f2937',
//         fontWeight: '500',
//     },

//     superAdminBadge: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '4px',
//         padding: '4px 10px',
//         backgroundColor: `${appTheme.colors.warning}15`,
//         border: `1px solid ${appTheme.colors.warning}30`,
//         borderRadius: '20px',
//         color: appTheme.colors.warning,
//         fontSize: '0.75rem',
//         fontWeight: '600',
//     },

//     apiError: {
//         maxWidth: '1200px',
//         margin: '0 auto 16px auto',
//         padding: '12px 16px',
//         background: `${appTheme.colors.error}10`,
//         border: `1px solid ${appTheme.colors.error}`,
//         borderRadius: '8px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         color: appTheme.colors.error,
//         fontSize: '0.9rem',
//     },

//     companyBadge: {
//         display: 'inline-flex',
//         alignItems: 'center',
//         gap: '4px',
//         padding: '2px 6px',
//         backgroundColor: `${appTheme.colors.primary}15`,
//         border: `1px solid ${appTheme.colors.primary}30`,
//         borderRadius: '4px',
//         color: appTheme.colors.primary,
//         fontSize: '0.65rem',
//         fontWeight: '500',
//     },

//     // Toast
//     toast: {
//         success: {
//             position: 'fixed',
//             top: '20px',
//             right: '20px',
//             backgroundColor: '#10b981',
//             color: 'white',
//             padding: '12px 20px',
//             borderRadius: '8px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '12px',
//             boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
//             zIndex: 1100,
//             animation: 'slideIn 0.3s ease',
//             maxWidth: '400px',
//             width: 'calc(100% - 40px)',
//         },
//         error: {
//             position: 'fixed',
//             top: '20px',
//             right: '20px',
//             backgroundColor: '#ef4444',
//             color: 'white',
//             padding: '12px 20px',
//             borderRadius: '8px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '12px',
//             boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
//             zIndex: 1100,
//             animation: 'slideIn 0.3s ease',
//             maxWidth: '400px',
//             width: 'calc(100% - 40px)',
//         },
//         close: {
//             background: 'none',
//             border: 'none',
//             color: 'white',
//             cursor: 'pointer',
//             marginLeft: 'auto',
//             padding: '4px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             opacity: 0.8,
//             ':hover': {
//                 opacity: 1,
//             },
//         },
//     },

//     // Header
//     header: (isMobile) => ({
//         display: 'flex',
//         flexDirection: isMobile ? 'column' : 'row',
//         justifyContent: 'space-between',
//         alignItems: isMobile ? 'flex-start' : 'center',
//         marginBottom: isMobile ? '16px' : '24px',
//         gap: isMobile ? '12px' : 0,
//     }),

//     titleWrapper: (isMobile) => ({
//         display: 'flex',
//         alignItems: 'center',
//         gap: isMobile ? '10px' : '12px',
//         marginBottom: '4px',
//     }),

//     titleBar: (isMobile) => ({
//         width: isMobile ? '3px' : '4px',
//         height: isMobile ? '24px' : '28px',
//         background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
//         borderRadius: '2px',
//     }),

//     title: (isMobile) => ({
//         color: appTheme.colors.textPrimary,
//         fontWeight: '700',
//         fontSize: isMobile ? '1.4rem' : '1.75rem',
//         margin: 0,
//         lineHeight: 1.2,
//     }),

//     subtitle: (isMobile) => ({
//         color: appTheme.colors.textSecondary,
//         margin: '4px 0 0 15px',
//         fontSize: isMobile ? '0.85rem' : '0.95rem',
//         fontWeight: '500',
//     }),

//     headerActions: {
//         display: 'flex',
//         gap: '8px',
//     },

//     filterButton: (isMobile) => ({
//         display: 'flex',
//         alignItems: 'center',
//         gap: '6px',
//         padding: isMobile ? '8px 12px' : '10px 16px',
//         backgroundColor: '#f3f4f6',
//         border: '1px solid #e5e7eb',
//         borderRadius: '8px',
//         color: '#4b5563',
//         fontSize: isMobile ? '13px' : '14px',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'all 0.2s ease',
//         ':hover': {
//             backgroundColor: '#e5e7eb',
//         },
//     }),

//     refreshButton: (isMobile) => ({
//         display: 'flex',
//         alignItems: 'center',
//         gap: '6px',
//         padding: isMobile ? '8px 12px' : '10px 16px',
//         backgroundColor: '#f3f4f6',
//         border: '1px solid #e5e7eb',
//         borderRadius: '8px',
//         color: '#4b5563',
//         fontSize: isMobile ? '13px' : '14px',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'all 0.2s ease',
//         ':hover': {
//             backgroundColor: '#e5e7eb',
//         },
//     }),

//     addButton: (isMobile) => ({
//         display: 'flex',
//         alignItems: 'center',
//         gap: '6px',
//         padding: isMobile ? '8px 12px' : '10px 16px',
//         backgroundColor: appTheme.colors.primary,
//         border: 'none',
//         borderRadius: '8px',
//         color: 'white',
//         fontSize: isMobile ? '13px' : '14px',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'all 0.2s ease',
//         ':hover': {
//             backgroundColor: '#2563eb',
//         },
//     }),

//     // Stats
//     statsGrid: (isMobile) => ({
//         display: 'grid',
//         gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
//         gap: isMobile ? '10px' : '12px',
//         marginBottom: isMobile ? '16px' : '24px',
//     }),

//     statCard: (isMobile) => ({
//         display: 'flex',
//         alignItems: 'center',
//         gap: isMobile ? '8px' : '12px',
//         padding: isMobile ? '12px' : '16px',
//         backgroundColor: '#ffffff',
//         borderRadius: '10px',
//         border: `1px solid ${appTheme.colors.border}30`,
//         boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
//     }),

//     statLabel: {
//         fontSize: '0.7rem',
//         color: '#6b7280',
//         marginBottom: '2px',
//     },

//     statValue: {
//         fontSize: '1rem',
//         fontWeight: '600',
//         color: '#1f2937',
//     },

//     // Controls
//     controls: (isMobile) => ({
//         display: 'flex',
//         flexDirection: isMobile ? 'column' : 'row',
//         gap: isMobile ? '12px' : '16px',
//         marginBottom: isMobile ? '16px' : '24px',
//     }),

//     searchWrapper: (isMobile) => ({
//         position: 'relative',
//         flex: 1,
//     }),

//     searchIcon: {
//         position: 'absolute',
//         left: '12px',
//         top: '50%',
//         transform: 'translateY(-50%)',
//     },

//     searchInput: (isMobile) => ({
//         width: '100%',
//         padding: isMobile ? '10px 12px 10px 40px' : '12px 16px 12px 44px',
//         border: `1.5px solid ${appTheme.colors.border}40`,
//         borderRadius: '10px',
//         fontSize: isMobile ? '14px' : '15px',
//         outline: 'none',
//         backgroundColor: '#ffffff',
//         transition: 'all 0.2s ease',
//         ':focus': {
//             borderColor: appTheme.colors.primary,
//         },
//     }),

//     clearSearch: {
//         position: 'absolute',
//         right: '12px',
//         top: '50%',
//         transform: 'translateY(-50%)',
//         background: 'none',
//         border: 'none',
//         fontSize: '18px',
//         color: '#9ca3af',
//         cursor: 'pointer',
//         padding: '4px 8px',
//     },

//     viewControls: {
//         display: 'flex',
//         gap: '8px',
//     },

//     viewButton: (isMobile) => ({
//         padding: isMobile ? '8px' : '10px',
//         backgroundColor: '#ffffff',
//         border: `1.5px solid ${appTheme.colors.border}30`,
//         borderRadius: '8px',
//         color: '#6b7280',
//         cursor: 'pointer',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         transition: 'all 0.2s ease',
//         minWidth: isMobile ? '36px' : '40px',
//         minHeight: isMobile ? '36px' : '40px',
//     }),

//     viewButtonActive: {
//         backgroundColor: appTheme.colors.primary,
//         borderColor: appTheme.colors.primary,
//         color: '#ffffff',
//     },

//     // Content
//     content: (isMobile) => ({
//         backgroundColor: '#ffffff',
//         borderRadius: '12px',
//         border: `1px solid ${appTheme.colors.border}30`,
//         boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
//         overflow: 'hidden',
//     }),

//     loadingContainer: {
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '60px 20px',
//         textAlign: 'center',
//     },

//     spinner: {
//         width: '40px',
//         height: '40px',
//         border: '3px solid #e5e7eb',
//         borderTopColor: appTheme.colors.primary,
//         borderRadius: '50%',
//         animation: 'spin 1s linear infinite',
//         marginBottom: '16px',
//     },

//     emptyState: (isMobile) => ({
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: isMobile ? '40px 16px' : '60px 24px',
//         textAlign: 'center',
//         h3: {
//             fontSize: isMobile ? '1.1rem' : '1.25rem',
//             fontWeight: '600',
//             color: '#1f2937',
//             margin: '16px 0 8px 0',
//         },
//         p: {
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             color: '#6b7280',
//             marginBottom: '20px',
//         },
//     }),

//     emptyStateButton: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         padding: '10px 20px',
//         backgroundColor: appTheme.colors.primary,
//         color: 'white',
//         border: 'none',
//         borderRadius: '8px',
//         fontSize: '0.9rem',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'all 0.2s ease',
//         ':hover': {
//             backgroundColor: '#2563eb',
//         },
//     },

//     categoriesContainer: {
//         padding: '8px 0',
//     },

//     // Category Row
//     categoryRow: (isMobile, level) => ({
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: isMobile ? '12px 16px' : '14px 24px',
//         borderBottom: `1px solid ${appTheme.colors.border}20`,
//         paddingLeft: isMobile ? 16 + (level * 20) : 24 + (level * 24),
//         transition: 'background-color 0.2s ease',
//         cursor: 'pointer',
//         ':hover': {
//             backgroundColor: '#f8fafc',
//         },
//     }),

//     listRow: (isMobile) => ({
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: isMobile ? '12px 16px' : '14px 24px',
//         borderBottom: `1px solid ${appTheme.colors.border}20`,
//         transition: 'background-color 0.2s ease',
//         cursor: 'pointer',
//         ':hover': {
//             backgroundColor: '#f8fafc',
//         },
//     }),

//     categoryLeft: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         flex: 1,
//     },

//     listLeft: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         flex: 1,
//     },

//     expandButton: {
//         background: 'none',
//         border: 'none',
//         color: '#6b7280',
//         cursor: 'pointer',
//         padding: '4px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderRadius: '4px',
//         ':hover': {
//             backgroundColor: '#f3f4f6',
//         },
//     },

//     categoryIcon: {
//         fontSize: '1.2rem',
//         marginRight: '4px',
//     },

//     categoryInfo: {
//         flex: 1,
//     },

//     categoryNameWrapper: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         flexWrap: 'wrap',
//     },

//     categoryName: (isMobile) => ({
//         fontSize: isMobile ? '0.95rem' : '1rem',
//         fontWeight: '500',
//         color: '#1f2937',
//     }),

//     categoryDescription: {
//         fontSize: '0.8rem',
//         color: '#6b7280',
//         marginTop: '2px',
//         display: 'block',
//     },

//     inactiveBadge: {
//         backgroundColor: '#f3f4f6',
//         color: '#6b7280',
//         padding: '2px 6px',
//         borderRadius: '4px',
//         fontSize: '0.7rem',
//         fontWeight: '500',
//     },

//     productCountBadge: {
//         backgroundColor: `${appTheme.colors.primary}15`,
//         color: appTheme.colors.primary,
//         padding: '2px 6px',
//         borderRadius: '4px',
//         fontSize: '0.7rem',
//         fontWeight: '500',
//     },

//     categoryActions: {
//         display: 'flex',
//         gap: '4px',
//     },

//     actionButton: (isMobile, color) => ({
//         display: 'flex',
//         alignItems: 'center',
//         gap: isMobile ? '2px' : '4px',
//         padding: isMobile ? '6px' : '8px',
//         backgroundColor: `${color}10`,
//         border: `1px solid ${color}30`,
//         borderRadius: '6px',
//         color: color,
//         fontSize: isMobile ? '0.7rem' : '0.8rem',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'all 0.2s ease',
//         ':hover': {
//             backgroundColor: color,
//             color: 'white',
//         },
//         ':disabled': {
//             opacity: 0.5,
//             cursor: 'not-allowed',
//         },
//     }),

//     subcategoriesContainer: {
//         animation: 'slideDown 0.3s ease',
//     },

//     // Modal
//     modalOverlay: {
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '16px',
//         zIndex: 1000,
//         backdropFilter: 'blur(4px)',
//     },

//     modal: (isMobile) => ({
//         backgroundColor: 'white',
//         borderRadius: '12px',
//         maxWidth: '500px',
//         width: '100%',
//         maxHeight: '90vh',
//         overflow: 'hidden',
//         boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
//     }),

//     modalHeader: {
//         padding: '20px',
//         borderBottom: `1px solid ${appTheme.colors.border}`,
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },

//     modalTitle: {
//         fontSize: '1.1rem',
//         fontWeight: '600',
//         color: '#1f2937',
//         margin: 0,
//     },

//     modalClose: {
//         background: 'none',
//         border: 'none',
//         color: '#6b7280',
//         cursor: 'pointer',
//         padding: '4px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderRadius: '4px',
//         ':hover': {
//             backgroundColor: '#f3f4f6',
//         },
//     },

//     modalForm: {
//         padding: '20px',
//         overflowY: 'auto',
//         maxHeight: 'calc(90vh - 80px)',
//     },

//     formGroup: {
//         marginBottom: '16px',
//     },

//     label: {
//         display: 'block',
//         fontSize: '0.85rem',
//         fontWeight: '500',
//         color: '#374151',
//         marginBottom: '4px',
//     },

//     required: {
//         color: '#ef4444',
//     },

//     input: {
//         width: '100%',
//         padding: '10px 12px',
//         border: '1px solid #e5e7eb',
//         borderRadius: '8px',
//         fontSize: '0.95rem',
//         outline: 'none',
//         transition: 'all 0.2s ease',
//         ':focus': {
//             borderColor: appTheme.colors.primary,
//             boxShadow: `0 0 0 3px ${appTheme.colors.primary}20`,
//         },
//     },

//     select: {
//         width: '100%',
//         padding: '10px 12px',
//         border: '1px solid #e5e7eb',
//         borderRadius: '8px',
//         fontSize: '0.95rem',
//         outline: 'none',
//         backgroundColor: 'white',
//         cursor: 'pointer',
//         ':focus': {
//             borderColor: appTheme.colors.primary,
//             boxShadow: `0 0 0 3px ${appTheme.colors.primary}20`,
//         },
//     },

//     textarea: {
//         width: '100%',
//         padding: '10px 12px',
//         border: '1px solid #e5e7eb',
//         borderRadius: '8px',
//         fontSize: '0.95rem',
//         outline: 'none',
//         resize: 'vertical',
//         fontFamily: 'inherit',
//         transition: 'all 0.2s ease',
//         ':focus': {
//             borderColor: appTheme.colors.primary,
//             boxShadow: `0 0 0 3px ${appTheme.colors.primary}20`,
//         },
//     },

//     checkboxLabel: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         fontSize: '0.95rem',
//         color: '#374151',
//         cursor: 'pointer',
//         input: {
//             width: '16px',
//             height: '16px',
//             cursor: 'pointer',
//         },
//     },

//     errorText: {
//         fontSize: '0.75rem',
//         color: '#ef4444',
//         marginTop: '4px',
//         display: 'block',
//     },

//     helpText: {
//         fontSize: '0.7rem',
//         color: '#6b7280',
//         marginTop: '4px',
//         fontStyle: 'italic',
//     },

//     modalFooter: {
//         display: 'flex',
//         justifyContent: 'flex-end',
//         gap: '12px',
//         marginTop: '24px',
//     },

//     cancelButton: {
//         padding: '10px 16px',
//         backgroundColor: 'white',
//         color: '#374151',
//         border: '1px solid #e5e7eb',
//         borderRadius: '8px',
//         fontSize: '0.9rem',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'all 0.2s ease',
//         ':hover': {
//             backgroundColor: '#f3f4f6',
//         },
//     },

//     submitButton: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         padding: '10px 20px',
//         backgroundColor: appTheme.colors.primary,
//         color: 'white',
//         border: 'none',
//         borderRadius: '8px',
//         fontSize: '0.9rem',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'all 0.2s ease',
//         ':hover': {
//             backgroundColor: '#2563eb',
//         },
//     },

//     buttonDisabled: {
//         opacity: 0.6,
//         cursor: 'not-allowed',
//         ':hover': {
//             backgroundColor: appTheme.colors.primary,
//         },
//     },

//     buttonSpinner: {
//         width: '16px',
//         height: '16px',
//         border: '2px solid rgba(255, 255, 255, 0.3)',
//         borderTopColor: 'white',
//         borderRadius: '50%',
//         animation: 'spin 0.8s linear infinite',
//     },
// };





















// app/admin/masters/categories/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { appTheme } from '../../../../src/constants/theme';
import {
    Folder,
    Package,
    Plus,
    Search,
    RefreshCw,
    ChevronRight,
    Grid,
    List,
    Eye,
    Globe,
    CheckCircle,
    AlertCircle,
    Clock,
    Download,
    TrendingUp,
    TrendingDown,
    Star,
    Fire,
    Award,
    Zap,
    Building2,
    Shield,
    AlertTriangle,
    Layers
} from 'lucide-react';

export default function MastersDashboard() {
    const router = useRouter();
    const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [stats, setStats] = useState({
        categories: { total: 0, active: 0, main: 0, sub: 0 },
        products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 }
    });
    const [recentItems, setRecentItems] = useState([]);
    const [apiError, setApiError] = useState(null);

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

    // Fetch stats from unified masters API
    const fetchStats = useCallback(async () => {
        if (!user?.companyId) return;
        
        setRefreshing(true);
        setApiError(null);
        
        try {
            // Fetch stats with companyId
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'stats'
            });
            
            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });
            
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("You don't have permission to view these stats");
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success && data.data) {
                setStats({
                    categories: {
                        total: data.data.categories?.total || 0,
                        active: data.data.categories?.active || 0,
                        main: data.data.categories?.main || 0,
                        sub: data.data.categories?.sub || 0
                    },
                    products: {
                        total: data.data.products?.total || 0,
                        active: data.data.products?.active || 0,
                        lowStock: data.data.products?.lowStock || 0,
                        outOfStock: data.data.products?.outOfStock || 0
                    }
                });
            }

            // Fetch recent items with companyId
            const recentParams = new URLSearchParams({
                companyId: user.companyId,
                type: 'recent',
                limit: '10'
            });
            
            const recentRes = await fetch(`/api/masters?${recentParams}`, {
                headers: getAuthHeaders()
            });
            const recentData = await recentRes.json();
            if (recentData.success) {
                setRecentItems(recentData.data);
            }
        } catch (error) {
            console.error('Failed to fetch master stats:', error);
            setApiError(error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, getAuthHeaders]);

    useEffect(() => {
        if (user?.companyId) {
            fetchStats();
            
            // Refresh every 30 seconds
            const interval = setInterval(fetchStats, 30000000);
            return () => clearInterval(interval);
        }
    }, [user, fetchStats]);

    // Format number with Indian number system
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    };

    // Filter cards based on search
    const filteredCards = [
        {
            id: 'categories',
            title: 'Categories',
            icon: Folder,
            color: '#3b82f6',
            lightColor: '#3b82f620',
            stats: stats.categories,
            fields: [
                { label: 'Total', value: stats.categories.total },
                { label: 'Active', value: stats.categories.active },
                { label: 'Main', value: stats.categories.main },
                { label: 'Sub', value: stats.categories.sub }
            ],
            path: '/admin/masters',
            addPath: '/admin/masters?action=add'
        },
        {
            id: 'products',
            title: 'Products',
            icon: Package,
            color: '#10b981',
            lightColor: '#10b98120',
            stats: stats.products,
            fields: [
                { label: 'Total', value: stats.products.total },
                { label: 'Active', value: stats.products.active },
                { label: 'Low Stock', value: stats.products.lowStock },
                { label: 'Out of Stock', value: stats.products.outOfStock }
            ],
            path: '/admin/products',
            addPath: '/admin/products/productForm'
        }
    ].filter(card => 
        card.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Quick actions
    const quickActions = [
        { 
            id: 'add-category', 
            label: 'Add Category', 
            icon: Folder, 
            color: '#3b82f6', 
            path: '/admin/masters?action=add' 
        },
        { 
            id: 'add-product', 
            label: 'Add Product', 
            icon: Package, 
            color: '#10b981', 
            path: '/admin/products/productForm' 
        }
    ];

    const filteredQuickActions = quickActions.filter(action =>
        action.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Loading state
    if (!user) {
        return (
            <div style={styles.loadingContainer(isMobile)}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText(isMobile)}>Checking authentication...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.loadingContainer(isMobile)}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText(isMobile)}>Loading masters dashboard...</p>
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
                </div>
            )}

            {/* Header */}
            <div style={styles.header(isMobile)}>
                <div>
                    <div style={styles.titleWrapper(isMobile)}>
                        <div style={styles.titleBar(isMobile)}></div>
                        <h1 style={styles.title(isMobile)}>Masters Dashboard</h1>
                    </div>
                    <p style={styles.subtitle(isMobile)}>
                        Manage categories and products for {user?.companyName || 'your company'}
                    </p>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    style={styles.refreshButton(isMobile)}
                >
                    <RefreshCw size={isMobile ? 16 : 18} style={{
                        animation: refreshing ? 'spin 1s linear infinite' : 'none'
                    }} />
                    {!isMobile && <span>Refresh</span>}
                </button>
            </div>

            {/* Stats Overview - Improved with better visuals */}
            <div style={styles.statsGrid(isMobile)}>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#3b82f620' }}>
                        <Globe size={isMobile ? 18 : 20} color="#3b82f6" />
                    </div>
                    <div>
                        <p style={styles.statLabel(isMobile)}>Total Items</p>
                        <p style={styles.statValue(isMobile)}>
                            {formatNumber(stats.categories.total + stats.products.total)}
                        </p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#10b98120' }}>
                        <CheckCircle size={isMobile ? 18 : 20} color="#10b981" />
                    </div>
                    <div>
                        <p style={styles.statLabel(isMobile)}>Active Items</p>
                        <p style={styles.statValue(isMobile)}>
                            {formatNumber(stats.categories.active + stats.products.active)}
                        </p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#8b5cf620' }}>
                        <Folder size={isMobile ? 18 : 20} color="#8b5cf6" />
                    </div>
                    <div>
                        <p style={styles.statLabel(isMobile)}>Categories</p>
                        <p style={styles.statValue(isMobile)}>{formatNumber(stats.categories.total)}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#f59e0b20' }}>
                        <Package size={isMobile ? 18 : 20} color="#f59e0b" />
                    </div>
                    <div>
                        <p style={styles.statLabel(isMobile)}>Products</p>
                        <p style={styles.statValue(isMobile)}>{formatNumber(stats.products.total)}</p>
                    </div>
                </div>
            </div>

            {/* Search and View Toggle */}
            <div style={styles.controls(isMobile)}>
                <div style={styles.searchWrapper(isMobile)}>
                    <Search size={isMobile ? 16 : 18} color="#9ca3af" style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search masters..."
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

                <div style={styles.viewToggle}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            ...styles.viewButton(isMobile),
                            ...(viewMode === 'grid' ? styles.viewButtonActive : {})
                        }}
                    >
                        <Grid size={isMobile ? 16 : 18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            ...styles.viewButton(isMobile),
                            ...(viewMode === 'list' ? styles.viewButtonActive : {})
                        }}
                    >
                        <List size={isMobile ? 16 : 18} />
                    </button>
                </div>
            </div>

            {/* Masters Cards Grid */}
            <div style={viewMode === 'grid' ? styles.cardsGrid(isMobile) : styles.cardsList(isMobile)}>
                {filteredCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.id}
                            style={viewMode === 'grid' ? styles.card(isMobile) : styles.listCard(isMobile)}
                        >
                            {/* Card Header */}
                            <div 
                                style={styles.cardHeader(isMobile)}
                                onClick={() => router.push(card.path)}
                            >
                                <div style={{
                                    ...styles.cardIcon(isMobile),
                                    backgroundColor: card.lightColor
                                }}>
                                    <Icon size={isMobile ? 20 : 24} color={card.color} />
                                </div>
                                <div style={styles.cardTitleWrapper}>
                                    <h3 style={styles.cardTitle(isMobile)}>{card.title}</h3>
                                    <span style={styles.cardBadge(isMobile, card.color)}>
                                        {card.stats.total} total
                                    </span>
                                </div>
                            </div>

                            {/* Card Stats */}
                            <div 
                                style={styles.cardStats(isMobile)}
                                onClick={() => router.push(card.path)}
                            >
                                {card.fields.map((field, index) => (
                                    <div key={index} style={styles.cardStatItem(isMobile)}>
                                        <p style={styles.cardStatLabel(isMobile)}>{field.label}</p>
                                        <p style={styles.cardStatValue(isMobile)}>
                                            {formatNumber(field.value)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Category Breakdown (only for categories) */}
                            {card.id === 'categories' && stats.categories.total > 0 && (
                                <div 
                                    style={styles.cardProgress(isMobile)}
                                    onClick={() => router.push(card.path)}
                                >
                                    <div style={styles.progressBar}>
                                        <div style={{
                                            ...styles.progressFill,
                                            width: `${(stats.categories.main / stats.categories.total) * 100}%`,
                                            backgroundColor: '#8b5cf6'
                                        }} />
                                        <div style={{
                                            ...styles.progressFill,
                                            width: `${(stats.categories.sub / stats.categories.total) * 100}%`,
                                            backgroundColor: '#f59e0b',
                                            marginLeft: `${(stats.categories.main / stats.categories.total) * 100}%`
                                        }} />
                                    </div>
                                    <div style={styles.progressLabels}>
                                        <span style={styles.progressLabel(isMobile)}>
                                            Main: {stats.categories.main}
                                        </span>
                                        <span style={styles.progressLabel(isMobile)}>
                                            Sub: {stats.categories.sub}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Product Progress Bar (only for products) */}
                            {card.id === 'products' && stats.products.total > 0 && (
                                <div 
                                    style={styles.cardProgress(isMobile)}
                                    onClick={() => router.push(card.path)}
                                >
                                    <div style={styles.progressBar}>
                                        <div style={{
                                            ...styles.progressFill,
                                            width: `${(stats.products.active / stats.products.total) * 100}%`,
                                            backgroundColor: card.color
                                        }} />
                                    </div>
                                    <div style={styles.progressLabels}>
                                        <span style={styles.progressLabel(isMobile)}>
                                            {Math.round((stats.products.active / stats.products.total) * 100)}% Active
                                        </span>
                                        <span style={styles.progressLabel(isMobile)}>
                                            {stats.products.lowStock} Low Stock
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Card Footer Actions */}
                            <div style={styles.cardFooter(isMobile)}>
                                <button
                                    onClick={() => router.push(card.path)}
                                    style={styles.cardAction(isMobile, card.color)}
                                >
                                    <Eye size={isMobile ? 14 : 16} />
                                    <span>View</span>
                                </button>
                                <button
                                    onClick={() => router.push(card.addPath)}
                                    style={styles.cardAction(isMobile, '#10b981')}
                                >
                                    <Plus size={isMobile ? 14 : 16} />
                                    <span>Add</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions Section */}
            {filteredQuickActions.length > 0 && (
                <div style={styles.quickActionsSection(isMobile)}>
                    <h2 style={styles.sectionTitle(isMobile)}>Quick Actions</h2>
                    <div style={styles.quickActionsGrid(isMobile)}>
                        {filteredQuickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => router.push(action.path)}
                                    style={styles.quickAction(isMobile, action.color)}
                                >
                                    <div style={{
                                        ...styles.quickActionIcon(isMobile),
                                        backgroundColor: `${action.color}20`
                                    }}>
                                        <Icon size={isMobile ? 18 : 20} color={action.color} />
                                    </div>
                                    <span style={styles.quickActionLabel(isMobile)}>{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {recentItems.length > 0 && (
                <div style={styles.recentSection(isMobile)}>
                    <h2 style={styles.sectionTitle(isMobile)}>Recent Activity</h2>
                    <div style={styles.recentList(isMobile)}>
                        {recentItems.map((item, index) => (
                            <div
                                key={index}
                                style={styles.recentItem(isMobile)}
                                onClick={() => router.push(item.path)}
                            >
                                <div style={styles.recentItemLeft}>
                                    <div style={{
                                        ...styles.recentItemIcon(isMobile),
                                        backgroundColor: `${item.color}20`
                                    }}>
                                        {item.type === 'category' || item.type === 'subcategory' ? 
                                            <Folder size={isMobile ? 14 : 16} color={item.color} /> : 
                                            <Package size={isMobile ? 14 : 16} color={item.color} />
                                        }
                                    </div>
                                    <div>
                                        <p style={styles.recentItemTitle(isMobile)}>{item.title}</p>
                                        <p style={styles.recentItemMeta(isMobile)}>
                                            {item.timeAgo} • {item.type === 'subcategory' ? 'subcategory' : item.type}
                                            {item.category && ` • ${item.category}`}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={isMobile ? 16 : 18} color="#9ca3af" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Global Styles */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ========== STYLES ==========
const styles = {
    container: (isMobile) => ({
        padding: isMobile ? '16px' : '24px',
        backgroundColor: 'transparent',
        minHeight: '100vh',
        width: '100%',
    }),

    companyBanner: {
        maxWidth: '1200px',
        margin: '0 auto 20px auto',
        padding: '0',
    },

    companyBannerContent: {
        background: '#ffffff',
        border: `1px solid ${appTheme.colors.border}30`,
        borderRadius: '12px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
    },

    companyBannerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },

    companyBannerText: {
        fontSize: '0.95rem',
        color: appTheme.colors.textPrimary,
        fontWeight: '500',
    },

    superAdminBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: `${appTheme.colors.warning}15`,
        border: `1px solid ${appTheme.colors.warning}30`,
        borderRadius: '20px',
        color: appTheme.colors.warning,
        fontSize: '0.8rem',
        fontWeight: '600',
    },

    apiError: {
        maxWidth: '1200px',
        margin: '0 auto 16px auto',
        padding: '12px 16px',
        background: `${appTheme.colors.error}10`,
        border: `1px solid ${appTheme.colors.error}`,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: appTheme.colors.error,
        fontSize: '0.9rem',
    },

    loadingContainer: (isMobile) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: isMobile ? '16px' : '24px',
    }),

    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
    },

    loadingText: (isMobile) => ({
        fontSize: isMobile ? '14px' : '16px',
        color: '#6b7280',
    }),

    header: (isMobile) => ({
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: isMobile ? '20px' : '24px',
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

    refreshButton: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isMobile ? '8px 12px' : '10px 16px',
        backgroundColor: '#ffffff',
        border: `1px solid ${appTheme.colors.border}30`,
        borderRadius: '10px',
        color: appTheme.colors.textSecondary,
        fontSize: isMobile ? '13px' : '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#f8f9fa',
            borderColor: appTheme.colors.primary,
        },
    }),

    statsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '12px',
        marginBottom: isMobile ? '20px' : '24px',
    }),

    statCard: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '12px',
        padding: isMobile ? '12px' : '16px',
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '10px' : '12px',
        border: `1px solid ${appTheme.colors.border}30`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
    }),

    statIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    statLabel: (isMobile) => ({
        fontSize: isMobile ? '11px' : '12px',
        color: '#6b7280',
        marginBottom: '2px',
    }),

    statValue: (isMobile) => ({
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '700',
        color: '#1f2937',
    }),

    controls: (isMobile) => ({
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '20px' : '24px',
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
        padding: isMobile ? '12px 12px 12px 40px' : '12px 16px 12px 44px',
        border: `1.5px solid ${appTheme.colors.border}40`,
        borderRadius: isMobile ? '10px' : '12px',
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

    viewToggle: {
        display: 'flex',
        gap: '8px',
    },

    viewButton: (isMobile) => ({
        padding: isMobile ? '10px' : '12px',
        backgroundColor: '#ffffff',
        border: `1.5px solid ${appTheme.colors.border}30`,
        borderRadius: '10px',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    }),

    viewButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        color: '#ffffff',
    },

    cardsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '24px' : '32px',
    }),

    cardsList: (isMobile) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '24px' : '32px',
    }),

    card: (isMobile) => ({
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '14px' : '16px',
        border: `1px solid ${appTheme.colors.border}30`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
    }),

    listCard: (isMobile) => ({
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '12px' : '14px',
        border: `1px solid ${appTheme.colors.border}30`,
        padding: isMobile ? '14px' : '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#f8f9fa',
        },
    }),

    cardHeader: (isMobile) => ({
        padding: isMobile ? '16px 16px 12px' : '20px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '12px',
        borderBottom: `1px solid ${appTheme.colors.border}20`,
        cursor: 'pointer',
    }),

    cardIcon: (isMobile) => ({
        width: isMobile ? '40px' : '48px',
        height: isMobile ? '40px' : '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),

    cardTitleWrapper: {
        flex: 1,
    },

    cardTitle: (isMobile) => ({
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '2px',
    }),

    cardBadge: (isMobile, color) => ({
        display: 'inline-block',
        padding: isMobile ? '2px 8px' : '4px 10px',
        backgroundColor: `${color}15`,
        color: color,
        borderRadius: '20px',
        fontSize: isMobile ? '10px' : '11px',
        fontWeight: '500',
    }),

    cardStats: (isMobile) => ({
        padding: isMobile ? '12px 16px' : '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: isMobile ? '12px' : '16px',
        cursor: 'pointer',
    }),

    cardStatItem: (isMobile) => ({
        textAlign: 'center',
    }),

    cardStatLabel: (isMobile) => ({
        fontSize: isMobile ? '10px' : '11px',
        color: '#6b7280',
        marginBottom: '4px',
    }),

    cardStatValue: (isMobile) => ({
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '700',
        color: '#1f2937',
    }),

    cardProgress: (isMobile) => ({
        padding: isMobile ? '0 16px 12px' : '0 20px 16px',
        cursor: 'pointer',
    }),

    progressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: '#e5e7eb',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '6px',
        display: 'flex',
    },

    progressFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
    },

    progressLabels: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    progressLabel: (isMobile) => ({
        fontSize: isMobile ? '9px' : '10px',
        color: '#6b7280',
    }),

    cardFooter: (isMobile) => ({
        padding: isMobile ? '12px 16px 16px' : '16px 20px 20px',
        borderTop: `1px solid ${appTheme.colors.border}20`,
        display: 'flex',
        gap: '8px',
    }),

    cardAction: (isMobile, color) => ({
        flex: 1,
        padding: isMobile ? '8px' : '10px',
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: '8px',
        color: color,
        fontSize: isMobile ? '11px' : '12px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: color,
            color: '#ffffff',
        },
    }),

    quickActionsSection: (isMobile) => ({
        marginBottom: isMobile ? '24px' : '32px',
    }),

    sectionTitle: (isMobile) => ({
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: isMobile ? '12px' : '16px',
    }),

    quickActionsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
        gap: isMobile ? '12px' : '16px',
        maxWidth: isMobile ? '100%' : '400px',
    }),

    quickAction: (isMobile, color) => ({
        padding: isMobile ? '16px' : '20px',
        backgroundColor: '#ffffff',
        border: `1px solid ${appTheme.colors.border}30`,
        borderRadius: isMobile ? '12px' : '14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? '8px' : '10px',
        transition: 'all 0.2s ease',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            borderColor: color,
        },
    }),

    quickActionIcon: (isMobile) => ({
        width: isMobile ? '40px' : '48px',
        height: isMobile ? '40px' : '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),

    quickActionLabel: (isMobile) => ({
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: '500',
        color: '#1f2937',
    }),

    recentSection: (isMobile) => ({
        marginTop: isMobile ? '24px' : '32px',
    }),

    recentList: (isMobile) => ({
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '12px' : '14px',
        border: `1px solid ${appTheme.colors.border}30`,
        overflow: 'hidden',
    }),

    recentItem: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '14px 20px',
        borderBottom: `1px solid ${appTheme.colors.border}20`,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':last-child': {
            borderBottom: 'none',
        },
        ':hover': {
            backgroundColor: '#f8f9fa',
        },
    }),

    recentItemLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },

    recentItemIcon: (isMobile) => ({
        width: isMobile ? '32px' : '36px',
        height: isMobile ? '32px' : '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),

    recentItemTitle: (isMobile) => ({
        fontSize: isMobile ? '13px' : '14px',
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: '2px',
    }),

    recentItemMeta: (isMobile) => ({
        fontSize: isMobile ? '10px' : '11px',
        color: '#6b7280',
    }),
};