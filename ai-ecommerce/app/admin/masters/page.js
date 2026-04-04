'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, useProtectedFetch } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderTree,
  List,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Package,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Percent,
  Star,
  Clock,
  AlertCircle,
  AlertTriangle,
  Check,
  X,
  Save,
  Upload,
  Image,
  Hash,
  Tag,
  Box,
  Truck,
  Globe,
  Settings,
  Shield,
  Zap,
  Heart,
  Award,
  Calendar,
  Sun,
  Moon,
  Monitor,
  Palette,
  Brush,
  Sparkles,
  Crown,
  Gem,
  Gift,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Paperclip,
  Home,
  ArrowLeft,
  ArrowRight,
  Grid,
  MoreVertical,
  Download,
  Printer,
  Share2,
  Bookmark,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Wifi,
  Cpu,
  HardDrive,
  Server,
  Cloud,
  Database,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  ShoppingCart,
  CreditCard,
  Landmark,
  Receipt,
  Building2,
  Store,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Menu,
  ChevronLeft
} from 'lucide-react';

// Theme configuration
const THEMES = {
  light: {
    primary: '#4361ee',
    secondary: '#3f37c9',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    background: '#f8f9fa',
    backgroundCard: '#ffffff',
    backgroundLight: '#f8f9fa',
    textPrimary: '#1a1a2e',
    textSecondary: '#6c757d',
    border: '#e9ecef',
    hover: '#f1f3f5'
  },
  dark: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    background: '#0f172a',
    backgroundCard: '#1e293b',
    backgroundLight: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    hover: '#334155'
  }
};

export default function MastersPage() {
  const { user, isAuthenticated, loading: authLoading, getCompanyId, isSuperAdmin, isCompanyAdmin } = useAuth();
  const protectedFetch = useProtectedFetch();
  const router = useRouter();

  // Theme State
  const [theme, setTheme] = useState('light');
  const colors = THEMES[theme];

  // State Management
  const [activeTab, setActiveTab] = useState('stats');
  const [viewMode, setViewMode] = useState('tree');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    icon: '📦',
    displayOrder: 0,
    isActive: true
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState({});
  const [categoryPagination, setCategoryPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Stats State
  const [stats, setStats] = useState({
    categories: { total: 0, active: 0, inactive: 0, main: 0, sub: 0 },
    products: { total: 0, active: 0, inactive: 0, lowStock: 0, outOfStock: 0 },
    recent: []
  });

  // Helper functions
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toggle tree node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // ========== CATEGORY API CALLS ==========

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = getCompanyId();
      
      if (!companyId) {
        console.warn('No company ID available');
        return;
      }

      if (viewMode === 'tree') {
        const url = `/api/masters?type=categories&companyId=${companyId}&format=tree&includeInactive=${categoryFilter === 'all'}&_t=${Date.now()}`;
        const response = await protectedFetch(url, { cache: 'no-store' });
        const result = await response.json();
        
        if (result.success) {
          setCategoryTree(result.data || []);
        }
        
        const flatResponse = await protectedFetch(
          `/api/masters?type=categories&companyId=${companyId}&format=flat&limit=1000&_t=${Date.now()}`,
          { cache: 'no-store' }
        );
        const flatResult = await flatResponse.json();
        if (flatResult.success) {
          setCategories(flatResult.data || []);
        }
      } else {
        let url = `/api/masters?type=categories&companyId=${companyId}&format=flat&page=${categoryPagination.page}&limit=${categoryPagination.limit}&_t=${Date.now()}`;
        
        if (categoryFilter === 'active') url += '&status=active';
        else if (categoryFilter === 'inactive') url += '&status=inactive';
        
        if (categorySearch) url += `&search=${encodeURIComponent(categorySearch)}`;
        
        const response = await protectedFetch(url, { cache: 'no-store' });
        const result = await response.json();
        
        if (result.success) {
          setCategories(result.data || []);
          if (result.pagination) {
            setCategoryPagination(prev => ({
              ...prev,
              total: result.pagination.total,
              totalPages: result.pagination.totalPages
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [protectedFetch, getCompanyId, viewMode, categoryFilter, categorySearch, categoryPagination.page, categoryPagination.limit]);

  const createCategory = async (formData) => {
    try {
      const response = await protectedFetch('/api/masters?type=categories', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId || null,
          icon: formData.icon,
          displayOrder: formData.displayOrder
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create category');
      }

      showSuccess(result.message || 'Category created successfully');
      setShowCategoryModal(false);
      resetCategoryForm();
      setRefreshKey(prev => prev + 1);
      fetchCategories();
      fetchStats();
      
      return result;
    } catch (err) {
      console.error('Error creating category:', err);
      showError(err.message);
      throw err;
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      const response = await protectedFetch(`/api/masters?type=categories&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update category');
      }

      showSuccess(result.message || 'Category updated successfully');
      setShowCategoryModal(false);
      resetCategoryForm();
      setRefreshKey(prev => prev + 1);
      fetchCategories();
      fetchStats();
      
      return result;
    } catch (err) {
      console.error('Error updating category:', err);
      showError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? This will also delete all subcategories.`)) {
      return;
    }

    try {
      const response = await protectedFetch(`/api/masters?type=categories&id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete category');
      }

      showSuccess(result.message || 'Category deleted successfully');
      setRefreshKey(prev => prev + 1);
      fetchCategories();
      fetchStats();
    } catch (err) {
      console.error('Error deleting category:', err);
      showError(err.message);
    }
  };

  const toggleCategoryStatus = async (id, currentStatus) => {
    try {
      const response = await protectedFetch('/api/masters?type=categories', {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'toggle-status',
          id,
          isActive: !currentStatus
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      showSuccess(result.message || `Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setRefreshKey(prev => prev + 1);
      fetchCategories();
      fetchStats();
    } catch (err) {
      console.error('Error toggling status:', err);
      showError(err.message);
    }
  };

  // ========== STATS API CALLS ==========

  const fetchStats = useCallback(async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) return;

      const response = await protectedFetch(
        `/api/masters?type=stats&companyId=${companyId}&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data);
      }

      // Fetch recent items
      const recentResponse = await protectedFetch(
        `/api/masters?type=recent&companyId=${companyId}&limit=10&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const recentResult = await recentResponse.json();
      
      if (recentResult.success && recentResult.data) {
        setStats(prev => ({ ...prev, recent: recentResult.data }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [protectedFetch, getCompanyId]);

  // ========== FORM HANDLERS ==========

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      parentId: '',
      icon: '📦',
      displayOrder: 0,
      isActive: true
    });
    setEditingCategoryId(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      icon: category.icon || '📦',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name.trim()) {
      showError('Category name is required');
      return;
    }

    if (editingCategoryId) {
      await updateCategory(editingCategoryId, categoryFormData);
    } else {
      await createCategory(categoryFormData);
    }
  };

  // Get parent categories for category form
  const getParentCategories = () => {
    return categories.filter(cat => 
      !cat.parentId && 
      (!editingCategoryId || cat._id !== editingCategoryId)
    );
  };

  // ========== RENDER FUNCTIONS ==========

 const renderStatCard = (title, icon, stats, color) => (
    <div style={{
      background: colors.backgroundCard,
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: `1px solid ${colors.border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: `2px solid ${colors.border}` }}>
        <div style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}15`,
          borderRadius: '12px',
          color: color
        }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: colors.textPrimary }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '28px', fontWeight: 'bold', color: colors.textPrimary }}>{value}</span>
            <span style={{ fontSize: '12px', color: colors.textSecondary, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {renderStatCard('Categories Overview', <Folder size={24} />, {
          total: stats.categories.total,
          active: stats.categories.active,
          main: stats.categories.main,
          sub: stats.categories.sub
        }, colors.primary)}
        
        {renderStatCard('Products Overview', <Package size={24} />, {
          total: stats.products.total,
          active: stats.products.active,
          lowStock: stats.products.lowStock,
          outOfStock: stats.products.outOfStock
        }, colors.success)}
      </div>

      {/* Recent Activity */}
      {stats.recent && stats.recent.length > 0 && (
        <div style={{
          background: colors.backgroundCard,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: `2px solid ${colors.border}` }}>
            <div style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${colors.info}15`,
              borderRadius: '12px',
              color: colors.info
            }}>
              <Clock size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: colors.textPrimary }}>Recent Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recent.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: colors.backgroundLight,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${item.color || colors.primary}15`,
                  borderRadius: '10px',
                  color: item.color || colors.primary
                }}>
                  {item.type === 'category' ? <Folder size={20} /> : <Package size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: colors.textPrimary }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>{item.timeAgo}</div>
                </div>
                <ChevronRight size={16} color={colors.textSecondary} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <button
          onClick={() => { setActiveTab('categories'); setShowCategoryModal(true); resetCategoryForm(); }}
          style={{
            padding: '16px',
            background: colors.backgroundCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: colors.primary,
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} />
          Add Category
        </button>
        <button
          onClick={() => { fetchCategories(); fetchStats(); }}
          style={{
            padding: '16px',
            background: colors.backgroundCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: colors.textSecondary,
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <RefreshCw size={18} />
          Refresh All
        </button>
      </div>
    </div>
  );

  const renderCategoryTree = (items, level = 0) => {
    if (!items || items.length === 0) {
      if (level === 0) {
        return (
          <div style={{ textAlign: 'center', padding: '60px', background: colors.backgroundCard, borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</div>
            <p style={{ color: colors.textSecondary, marginBottom: '20px' }}>No categories found</p>
            <button
              onClick={() => { setShowCategoryModal(true); resetCategoryForm(); }}
              style={{
                padding: '10px 20px',
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              Create First Category
            </button>
          </div>
        );
      }
      return null;
    }

    return items.map(item => {
      const isExpanded = expandedNodes[item._id] !== false;
      const hasChildren = item.subcategories && item.subcategories.length > 0;
      
      return (
        <div key={item._id} style={{ marginBottom: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: level === 0 ? colors.backgroundLight : colors.backgroundCard,
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            marginLeft: `${level * 30}px`,
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              {hasChildren && (
                <button
                  onClick={() => toggleNode(item._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: colors.textSecondary
                  }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              {!hasChildren && <div style={{ width: '24px' }} />}
              
              <span style={{ fontSize: '24px' }}>{item.icon || (item.parentId ? '📎' : '📂')}</span>
              
              <div>
                <div style={{ fontWeight: 500, color: colors.textPrimary }}>{item.name}</div>
                {item.description && <div style={{ fontSize: '12px', color: colors.textSecondary }}>{item.description}</div>}
              </div>
              
              {item.productCount > 0 && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  background: colors.backgroundLight,
                  borderRadius: '12px',
                  color: colors.textSecondary
                }}>
                  {item.productCount} products
                </span>
              )}
              
              {level === 0 && !item.parentId && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  background: `${colors.primary}15`,
                  color: colors.primary,
                  borderRadius: '12px'
                }}>Main</span>
              )}
              {level === 1 && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  background: `${colors.secondary}15`,
                  color: colors.secondary,
                  borderRadius: '12px'
                }}>Sub</span>
              )}
              {level === 2 && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  background: `${colors.warning}15`,
                  color: colors.warning,
                  borderRadius: '12px'
                }}>Sub-Sub</span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 500,
                background: item.isActive ? `${colors.success}15` : `${colors.danger}15`,
                color: item.isActive ? colors.success : colors.danger
              }}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
              
              <button
                onClick={() => handleEditCategory(item)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: colors.textSecondary,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Edit"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={() => toggleCategoryStatus(item._id, item.isActive)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: colors.textSecondary,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title={item.isActive ? 'Deactivate' : 'Activate'}
              >
                {item.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
              </button>
              
              <button
                onClick={() => deleteCategory(item._id, item.name)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: colors.textSecondary,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div>{renderCategoryTree(item.subcategories, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  const renderFlatCategories = () => {
    if (!categories || categories.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px', background: colors.backgroundCard, borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</div>
          <p style={{ color: colors.textSecondary, marginBottom: '20px' }}>No categories found</p>
          <button
            onClick={() => { setShowCategoryModal(true); resetCategoryForm(); }}
            style={{
              padding: '10px 20px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Create First Category
          </button>
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          background: colors.backgroundCard,
          borderRadius: '12px',
          overflow: 'hidden',
          borderCollapse: 'collapse'
        }}>
          <thead style={{ background: colors.backgroundLight, borderBottom: `2px solid ${colors.border}` }}>
            <tr>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Level</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Description</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Products</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: '12px 16px' }}>
                  {cat.level === 0 && <span style={{ padding: '2px 8px', background: `${colors.primary}15`, color: colors.primary, borderRadius: '12px', fontSize: '11px' }}>Main</span>}
                  {cat.level === 1 && <span style={{ padding: '2px 8px', background: `${colors.secondary}15`, color: colors.secondary, borderRadius: '12px', fontSize: '11px' }}>Sub</span>}
                  {cat.level === 2 && <span style={{ padding: '2px 8px', background: `${colors.warning}15`, color: colors.warning, borderRadius: '12px', fontSize: '11px' }}>Sub-Sub</span>}
                  {cat.level > 0 && <span style={{ color: colors.textSecondary, marginLeft: '8px' }}>{'—'.repeat(cat.level)}</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ marginRight: '8px', fontSize: '18px' }}>{cat.icon || '📁'}</span>
                  <span style={{ color: colors.textPrimary }}>{cat.name}</span>
                </td>
                <td style={{ padding: '12px 16px', color: colors.textSecondary, fontSize: '13px' }}>{cat.description?.substring(0, 50) || '-'}</td>
                <td style={{ padding: '12px 16px', color: colors.textPrimary }}>{cat.productCount || 0}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: cat.isActive ? `${colors.success}15` : `${colors.danger}15`,
                    color: cat.isActive ? colors.success : colors.danger
                  }}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditCategory(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: colors.textSecondary }} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => toggleCategoryStatus(cat._id, cat.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: colors.textSecondary }} title={cat.isActive ? 'Deactivate' : 'Activate'}>
                      {cat.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button onClick={() => deleteCategory(cat._id, cat.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: colors.textSecondary }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Category Modal Component
  const CategoryModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }} onClick={() => setShowCategoryModal(false)}>
      <div style={{
        background: colors.backgroundCard,
        borderRadius: '16px',
        width: '90%',
        maxWidth: '550px',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: colors.textPrimary }}>
            {editingCategoryId ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button onClick={() => setShowCategoryModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textSecondary }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleCategorySubmit}>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: colors.textPrimary }}>
                Category Name <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                type="text"
                value={categoryFormData.name}
                onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})}
                placeholder="Enter category name (e.g., Electronics, Clothing)"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: colors.backgroundLight,
                  color: colors.textPrimary
                }}
                required
                autoFocus
              />
              <small style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '4px', display: 'block' }}>
                {categoryFormData.parentId ? 'This will be a subcategory' : 'This will be a main category'}
              </small>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: colors.textPrimary }}>Parent Category (Optional)</label>
              <select
                value={categoryFormData.parentId}
                onChange={e => setCategoryFormData({...categoryFormData, parentId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: colors.backgroundLight,
                  color: colors.textPrimary
                }}
                disabled={!!editingCategoryId}
              >
                <option value="">None (Main Category)</option>
                {getParentCategories().map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {categoryFormData.parentId && (
                <small style={{ fontSize: '11px', color: colors.info, marginTop: '4px', display: 'block' }}>
                  📎 This will be created as a SUB-category
                </small>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: colors.textPrimary }}>Description</label>
              <textarea
                value={categoryFormData.description}
                onChange={e => setCategoryFormData({...categoryFormData, description: e.target.value})}
                placeholder="Enter category description"
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  background: colors.backgroundLight,
                  color: colors.textPrimary
                }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: colors.textPrimary }}>Icon</label>
                <input
                  type="text"
                  value={categoryFormData.icon}
                  onChange={e => setCategoryFormData({...categoryFormData, icon: e.target.value})}
                  placeholder="📦"
                  maxLength="10"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: colors.backgroundLight,
                    color: colors.textPrimary
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: colors.textPrimary }}>Display Order</label>
                <input
                  type="number"
                  value={categoryFormData.displayOrder}
                  onChange={e => setCategoryFormData({...categoryFormData, displayOrder: parseInt(e.target.value) || 0})}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: colors.backgroundLight,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>
            
            {editingCategoryId && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: colors.textPrimary }}>
                  <input
                    type="checkbox"
                    checked={categoryFormData.isActive}
                    onChange={e => setCategoryFormData({...categoryFormData, isActive: e.target.checked})}
                  />
                  <span>Active</span>
                </label>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 24px', borderTop: `1px solid ${colors.border}` }}>
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              style={{
                padding: '10px 20px',
                background: colors.backgroundLight,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                color: colors.textSecondary
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              {editingCategoryId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Effects
  useEffect(() => {
    if (getCompanyId()) {
      fetchStats();
    }
  }, [getCompanyId, refreshKey]);

  useEffect(() => {
    if (activeTab === 'categories' && getCompanyId()) {
      fetchCategories();
    }
  }, [activeTab, fetchCategories, viewMode, categoryFilter, categorySearch, categoryPagination.page, refreshKey]);

  // Loading state
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: colors.background }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: `4px solid ${colors.border}`, borderTop: `4px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || (!isSuperAdmin && !isCompanyAdmin)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', background: colors.background }}>
        <div style={{ textAlign: 'center', padding: '40px', background: colors.backgroundCard, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <AlertCircle size={48} color={colors.danger} style={{ marginBottom: '16px' }} />
          <h2 style={{ color: colors.textPrimary }}>Access Denied</h2>
          <p style={{ color: colors.textSecondary }}>You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '10px 20px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: colors.textPrimary }}>Masters Management</h1>
            <p style={{ margin: '4px 0 0', color: colors.textSecondary, fontSize: '14px' }}>Manage categories and track your business metrics</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                padding: '10px',
                background: colors.backgroundCard,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: colors.textPrimary,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setActiveTab('stats'); }}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'stats' ? colors.primary : colors.backgroundCard,
                  color: activeTab === 'stats' ? 'white' : colors.textSecondary,
                  border: `1px solid ${activeTab === 'stats' ? colors.primary : colors.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <BarChart3 size={16} />
                Stats
              </button>
              <button
                onClick={() => { setActiveTab('categories'); }}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'categories' ? colors.primary : colors.backgroundCard,
                  color: activeTab === 'categories' ? 'white' : colors.textSecondary,
                  border: `1px solid ${activeTab === 'categories' ? colors.primary : colors.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FolderTree size={16} />
                Categories
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: `${colors.success}15`,
            borderRadius: '10px',
            marginBottom: '20px',
            borderLeft: `4px solid ${colors.success}`
          }}>
            <CheckCircle size={20} color={colors.success} />
            <p style={{ margin: 0, flex: 1, color: colors.success }}>{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.success }}>
              <X size={18} />
            </button>
          </div>
        )}
        
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: `${colors.danger}15`,
            borderRadius: '10px',
            marginBottom: '20px',
            borderLeft: `4px solid ${colors.danger}`
          }}>
            <AlertCircle size={20} color={colors.danger} />
            <p style={{ margin: 0, flex: 1, color: colors.danger }}>{error}</p>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.danger }}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'stats' && renderStats()}

        {activeTab === 'categories' && (
          <>
            {/* Toolbar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
              alignItems: 'center',
              background: colors.backgroundCard,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={e => { setCategorySearch(e.target.value); setCategoryPagination(prev => ({ ...prev, page: 1 })); }}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: colors.backgroundLight,
                    color: colors.textPrimary
                  }}
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setCategoryPagination(prev => ({ ...prev, page: 1 })); }}
                style={{
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: colors.backgroundLight,
                  color: colors.textPrimary,
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Categories</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              
              <div style={{ display: 'flex', gap: '4px', background: colors.backgroundLight, padding: '4px', borderRadius: '10px' }}>
                <button
                  onClick={() => setViewMode('tree')}
                  style={{
                    padding: '8px 16px',
                    background: viewMode === 'tree' ? colors.backgroundCard : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: viewMode === 'tree' ? colors.primary : colors.textSecondary,
                    boxShadow: viewMode === 'tree' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <FolderTree size={16} />
                  Tree
                </button>
                <button
                  onClick={() => setViewMode('flat')}
                  style={{
                    padding: '8px 16px',
                    background: viewMode === 'flat' ? colors.backgroundCard : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: viewMode === 'flat' ? colors.primary : colors.textSecondary,
                    boxShadow: viewMode === 'flat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <List size={16} />
                  List
                </button>
              </div>
              
              <button
                onClick={() => { resetCategoryForm(); setShowCategoryModal(true); }}
                style={{
                  padding: '10px 20px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>

            {/* Categories Content */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.border}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                  <p style={{ color: colors.textSecondary }}>Loading categories...</p>
                </div>
              </div>
            ) : viewMode === 'tree' ? (
              <div style={{
                background: colors.backgroundCard,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                overflow: 'hidden',
                padding: '16px'
              }}>
                {renderCategoryTree(categoryTree)}
              </div>
            ) : (
              <>
                {renderFlatCategories()}
                {categoryPagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', padding: '16px' }}>
                    <button
                      onClick={() => setCategoryPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={categoryPagination.page === 1}
                      style={{
                        padding: '8px 16px',
                        background: colors.backgroundLight,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        cursor: categoryPagination.page === 1 ? 'not-allowed' : 'pointer',
                        opacity: categoryPagination.page === 1 ? 0.5 : 1,
                        color: colors.textPrimary
                      }}
                    >
                      Previous
                    </button>
                    <span style={{ color: colors.textSecondary }}>
                      Page {categoryPagination.page} of {categoryPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCategoryPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={categoryPagination.page === categoryPagination.totalPages}
                      style={{
                        padding: '8px 16px',
                        background: colors.backgroundLight,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        cursor: categoryPagination.page === categoryPagination.totalPages ? 'not-allowed' : 'pointer',
                        opacity: categoryPagination.page === categoryPagination.totalPages ? 0.5 : 1,
                        color: colors.textPrimary
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Modals */}
        {showCategoryModal && <CategoryModal />}
      </div>
    </div>
  );
}