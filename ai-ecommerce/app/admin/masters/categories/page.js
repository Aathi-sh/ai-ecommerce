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
    TrendingUp,
    TrendingDown,
    Building2,
    Shield,
    AlertTriangle,
    Layers,
    Zap,
    Star,
    Award,
    BarChart3,
    Database,
    LucideIcon
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
    const [lastUpdated, setLastUpdated] = useState(null);

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

    // Format number with Indian number system
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    };

    // Format timestamp
    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return new Date(date).toLocaleDateString();
    };

    // Fetch stats from unified masters API
    const fetchStats = useCallback(async () => {
        if (!user?.companyId) {
            setLoading(false);
            return;
        }
        
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
                setRecentItems(recentData.data || []);
            }
            
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch master stats:', error);
            setApiError(error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, getAuthHeaders]);

    // Initial load
    useEffect(() => {
        if (user?.companyId) {
            fetchStats();
        }
    }, [user?.companyId, fetchStats]);

    // Filter cards based on search
    const filteredCards = [
        {
            id: 'categories',
            title: 'Categories',
            icon: Folder,
            color: '#3b82f6',
            lightColor: '#3b82f620',
            gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            stats: stats.categories,
            fields: [
                { label: 'Total', value: stats.categories.total, icon: Database },
                { label: 'Active', value: stats.categories.active, icon: CheckCircle },
                { label: 'Main', value: stats.categories.main, icon: Folder },
                { label: 'Sub', value: stats.categories.sub, icon: Layers }
            ],
            path: '/admin/masters',
            addPath: '/admin/masters?action=add',
            description: 'Manage product categories and subcategories'
        },
        {
            id: 'products',
            title: 'Products',
            icon: Package,
            color: '#10b981',
            lightColor: '#10b98120',
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            stats: stats.products,
            fields: [
                { label: 'Total', value: stats.products.total, icon: Database },
                { label: 'Active', value: stats.products.active, icon: CheckCircle },
                { label: 'Low Stock', value: stats.products.lowStock, icon: AlertCircle },
                { label: 'Out of Stock', value: stats.products.outOfStock, icon: AlertTriangle }
            ],
            path: '/admin/products',
            addPath: '/admin/products/productForm',
            description: 'Manage your product inventory'
        }
    ].filter(card => 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Quick actions
    const quickActions = [
        { 
            id: 'add-category', 
            label: 'Add Category', 
            icon: Folder, 
            color: '#3b82f6', 
            path: '/admin/masters?action=add',
            description: 'Create a new category'
        },
        { 
            id: 'add-product', 
            label: 'Add Product', 
            icon: Package, 
            color: '#10b981', 
            path: '/admin/products/productForm',
            description: 'Add a new product'
        }
    ];

    const filteredQuickActions = quickActions.filter(action =>
        action.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get trend indicator
    const getTrendIcon = (value) => {
        if (value > 0) return <TrendingUp size={12} color="#10b981" />;
        if (value < 0) return <TrendingDown size={12} color="#ef4444" />;
        return null;
    };

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
                    {lastUpdated && (
                        <div style={styles.lastUpdated}>
                            <Clock size={14} />
                            <span>Updated {formatTimeAgo(lastUpdated)}</span>
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

            {/* Stats Overview Cards */}
            <div style={styles.statsGrid(isMobile)}>
                <div style={styles.statCard(isMobile)}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#3b82f620' }}>
                        <BarChart3 size={isMobile ? 18 : 20} color="#3b82f6" />
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
                        placeholder="Search categories, products..."
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
                        title="Grid View"
                    >
                        <Grid size={isMobile ? 16 : 18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            ...styles.viewButton(isMobile),
                            ...(viewMode === 'list' ? styles.viewButtonActive : {})
                        }}
                        title="List View"
                    >
                        <List size={isMobile ? 16 : 18} />
                    </button>
                </div>
            </div>

            {/* Masters Cards */}
            <div style={viewMode === 'grid' ? styles.cardsGrid(isMobile) : styles.cardsList(isMobile)}>
                {filteredCards.length === 0 ? (
                    <div style={styles.noResults}>
                        <Search size={48} color="#d1d5db" />
                        <h3>No results found</h3>
                        <p>Try searching for "categories" or "products"</p>
                    </div>
                ) : (
                    filteredCards.map((card) => {
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
                                        background: card.gradient
                                    }}>
                                        <Icon size={isMobile ? 22 : 26} color="white" />
                                    </div>
                                    <div style={styles.cardTitleWrapper}>
                                        <h3 style={styles.cardTitle(isMobile)}>{card.title}</h3>
                                        <p style={styles.cardDescription(isMobile)}>{card.description}</p>
                                    </div>
                                </div>

                                {/* Card Stats */}
                                <div 
                                    style={styles.cardStats(isMobile)}
                                    onClick={() => router.push(card.path)}
                                >
                                    {card.fields.map((field, index) => {
                                        const FieldIcon = field.icon;
                                        return (
                                            <div key={index} style={styles.cardStatItem(isMobile)}>
                                                <div style={styles.cardStatIconWrapper}>
                                                    <FieldIcon size={isMobile ? 12 : 14} color={card.color} />
                                                </div>
                                                <div>
                                                    <p style={styles.cardStatLabel(isMobile)}>{field.label}</p>
                                                    <p style={styles.cardStatValue(isMobile, card.color)}>
                                                        {formatNumber(field.value)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress Bar for Categories */}
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
                                                backgroundColor: '#f59e0b'
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

                                {/* Stock Status for Products */}
                                {card.id === 'products' && stats.products.total > 0 && (
                                    <div 
                                        style={styles.cardStockStatus(isMobile)}
                                        onClick={() => router.push(card.path)}
                                    >
                                        <div style={styles.stockIndicator}>
                                            <div style={{
                                                ...styles.stockBar,
                                                width: `${((stats.products.total - stats.products.outOfStock) / stats.products.total) * 100}%`,
                                                backgroundColor: '#10b981'
                                            }} />
                                        </div>
                                        <div style={styles.stockLabels}>
                                            <span style={styles.stockLabel(isMobile, '#10b981')}>
                                                In Stock: {stats.products.total - stats.products.outOfStock}
                                            </span>
                                            <span style={styles.stockLabel(isMobile, '#ef4444')}>
                                                Out of Stock: {stats.products.outOfStock}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Card Footer Actions */}
                                <div style={styles.cardFooter(isMobile)}>
                                    <button
                                        onClick={() => router.push(card.path)}
                                        style={styles.cardAction(isMobile, card.color, 'outline')}
                                    >
                                        <Eye size={isMobile ? 14 : 16} />
                                        <span>View Details</span>
                                    </button>
                                    <button
                                        onClick={() => router.push(card.addPath)}
                                        style={styles.cardAction(isMobile, card.color, 'solid')}
                                    >
                                        <Plus size={isMobile ? 14 : 16} />
                                        <span>Add New</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Quick Actions Section */}
            {filteredQuickActions.length > 0 && !searchTerm && (
                <div style={styles.quickActionsSection(isMobile)}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle(isMobile)}>Quick Actions</h2>
                        <Zap size={18} color="#f59e0b" />
                    </div>
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
                                        backgroundColor: `${action.color}15`
                                    }}>
                                        <Icon size={isMobile ? 20 : 24} color={action.color} />
                                    </div>
                                    <div>
                                        <span style={styles.quickActionLabel(isMobile)}>{action.label}</span>
                                        <span style={styles.quickActionDesc(isMobile)}>{action.description}</span>
                                    </div>
                                    <ChevronRight size={isMobile ? 16 : 18} color="#9ca3af" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {recentItems.length > 0 && !searchTerm && (
                <div style={styles.recentSection(isMobile)}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle(isMobile)}>Recent Activity</h2>
                        <Clock size={18} color="#6b7280" />
                    </div>
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
                                        backgroundColor: `${item.color}15`
                                    }}>
                                        {item.type === 'category' || item.type === 'subcategory' ? 
                                            <Folder size={isMobile ? 14 : 16} color={item.color} /> : 
                                            <Package size={isMobile ? 14 : 16} color={item.color} />
                                        }
                                    </div>
                                    <div>
                                        <p style={styles.recentItemTitle(isMobile)}>{item.title}</p>
                                        <p style={styles.recentItemMeta(isMobile)}>
                                            <span style={styles.recentItemType(item.color)}>
                                                {item.type === 'subcategory' ? 'Subcategory' : item.type}
                                            </span>
                                            <span>•</span>
                                            <span>{item.timeAgo}</span>
                                            {item.category && (
                                                <>
                                                    <span>•</span>
                                                    <span>{item.category}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={isMobile ? 16 : 18} color="#9ca3af" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {recentItems.length === 0 && !loading && !searchTerm && (
                <div style={styles.emptyRecent}>
                    <div style={styles.emptyRecentIcon}>
                        <Clock size={48} color="#d1d5db" />
                    </div>
                    <h3>No recent activity</h3>
                    <p>Start by adding categories or products to see activity here</p>
                    <div style={styles.emptyRecentActions}>
                        <button
                            onClick={() => router.push('/admin/masters?action=add')}
                            style={styles.emptyRecentButton('#3b82f6')}
                        >
                            <Plus size={16} />
                            Add Category
                        </button>
                        <button
                            onClick={() => router.push('/admin/products/productForm')}
                            style={styles.emptyRecentButton('#10b981')}
                        >
                            <Plus size={16} />
                            Add Product
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
        padding: isMobile ? '16px' : '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        width: '100%',
    }),

    companyBanner: {
        maxWidth: '1400px',
        margin: '0 auto 20px auto',
        padding: '0',
    },

    companyBannerContent: {
        background: '#ffffff',
        border: `1px solid ${appTheme.colors.border}30`,
        borderRadius: '14px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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

    lastUpdated: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        backgroundColor: '#f3f4f6',
        borderRadius: '20px',
        fontSize: '0.75rem',
        color: '#6b7280',
    },

    apiError: {
        maxWidth: '1400px',
        margin: '0 auto 16px auto',
        padding: '12px 16px',
        background: `${appTheme.colors.error}10`,
        border: `1px solid ${appTheme.colors.error}`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
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
        padding: '0 4px',
    },

    loadingContainer: (isMobile) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: isMobile ? '16px' : '24px',
        backgroundColor: '#f8fafc',
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
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
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
        padding: isMobile ? '8px 14px' : '10px 18px',
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
        ':disabled': {
            opacity: 0.6,
            cursor: 'not-allowed',
        },
    }),

    statsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '24px' : '28px',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    }),

    statCard: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '14px',
        padding: isMobile ? '14px' : '18px',
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '14px' : '16px',
        border: `1px solid ${appTheme.colors.border}30`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
    }),

    statIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    statLabel: (isMobile) => ({
        fontSize: isMobile ? '11px' : '12px',
        color: '#6b7280',
        marginBottom: '4px',
    }),

    statValue: (isMobile) => ({
        fontSize: isMobile ? '18px' : '22px',
        fontWeight: '700',
        color: '#1f2937',
    }),

    controls: (isMobile) => ({
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '20px' : '24px',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    }),

    searchWrapper: (isMobile) => ({
        position: 'relative',
        flex: 1,
    }),

    searchIcon: {
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
    },

    searchInput: (isMobile) => ({
        width: '100%',
        padding: isMobile ? '12px 12px 12px 44px' : '14px 16px 14px 48px',
        border: `1.5px solid ${appTheme.colors.border}40`,
        borderRadius: '12px',
        fontSize: isMobile ? '14px' : '15px',
        outline: 'none',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        ':focus': {
            borderColor: appTheme.colors.primary,
            boxShadow: `0 0 0 3px ${appTheme.colors.primary}20`,
        },
    }),

    clearSearch: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: '#9ca3af',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '20px',
        ':hover': {
            backgroundColor: '#f3f4f6',
        },
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
        ':hover': {
            borderColor: '#3b82f6',
            color: '#3b82f6',
        },
    }),

    viewButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        color: '#ffffff',
        ':hover': {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
        },
    },

    cardsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '28px' : '32px',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    }),

    cardsList: (isMobile) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '28px' : '32px',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    }),

    card: (isMobile) => ({
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '16px' : '20px',
        border: `1px solid ${appTheme.colors.border}30`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.3s ease',
        ':hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
        },
    }),

    listCard: (isMobile) => ({
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '14px' : '16px',
        border: `1px solid ${appTheme.colors.border}30`,
        padding: isMobile ? '16px' : '20px',
        transition: 'all 0.2s ease',
        animation: 'fadeIn 0.3s ease',
        ':hover': {
            backgroundColor: '#f8fafc',
            transform: 'translateX(4px)',
        },
    }),

    cardHeader: (isMobile) => ({
        padding: isMobile ? '18px 18px 14px' : '22px 22px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '16px',
        borderBottom: `1px solid ${appTheme.colors.border}20`,
        cursor: 'pointer',
    }),

    cardIcon: (isMobile) => ({
        width: isMobile ? '48px' : '56px',
        height: isMobile ? '48px' : '56px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    }),

    cardTitleWrapper: {
        flex: 1,
    },

    cardTitle: (isMobile) => ({
        fontSize: isMobile ? '17px' : '20px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '4px',
    }),

    cardDescription: (isMobile) => ({
        fontSize: isMobile ? '12px' : '13px',
        color: '#6b7280',
        margin: 0,
    }),

    cardStats: (isMobile) => ({
        padding: isMobile ? '14px 18px' : '18px 22px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: isMobile ? '14px' : '18px',
        cursor: 'pointer',
    }),

    cardStatItem: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    }),

    cardStatIconWrapper: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
    },

    cardStatLabel: (isMobile) => ({
        fontSize: isMobile ? '10px' : '11px',
        color: '#6b7280',
        marginBottom: '2px',
    }),

    cardStatValue: (isMobile, color) => ({
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '700',
        color: color || '#1f2937',
    }),

    cardProgress: (isMobile) => ({
        padding: isMobile ? '0 18px 14px' : '0 22px 18px',
        cursor: 'pointer',
    }),

    progressBar: {
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '8px',
        display: 'flex',
    },

    progressFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
    },

    progressLabels: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    progressLabel: (isMobile) => ({
        fontSize: isMobile ? '10px' : '11px',
        color: '#6b7280',
    }),

    cardStockStatus: (isMobile) => ({
        padding: isMobile ? '0 18px 14px' : '0 22px 18px',
        cursor: 'pointer',
    }),

    stockIndicator: {
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '8px',
    },

    stockBar: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
    },

    stockLabels: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    stockLabel: (isMobile, color) => ({
        fontSize: isMobile ? '10px' : '11px',
        color: color,
    }),

    cardFooter: (isMobile) => ({
        padding: isMobile ? '14px 18px 18px' : '18px 22px 22px',
        borderTop: `1px solid ${appTheme.colors.border}20`,
        display: 'flex',
        gap: '10px',
    }),

    cardAction: (isMobile, color, variant) => ({
        flex: 1,
        padding: isMobile ? '10px' : '12px',
        backgroundColor: variant === 'solid' ? color : 'transparent',
        border: variant === 'solid' ? 'none' : `1px solid ${color}30`,
        borderRadius: '10px',
        color: variant === 'solid' ? 'white' : color,
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: variant === 'solid' ? `${color}dd` : `${color}10`,
            transform: 'scale(0.98)',
        },
    }),

    quickActionsSection: (isMobile) => ({
        marginBottom: isMobile ? '28px' : '32px',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    }),

    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isMobile ? '14px' : '18px',
    },

    sectionTitle: (isMobile) => ({
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '600',
        color: '#1f2937',
        margin: 0,
    }),

    quickActionsGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: isMobile ? '12px' : '16px',
    }),

    quickAction: (isMobile, color) => ({
        padding: isMobile ? '14px 16px' : '16px 20px',
        backgroundColor: '#ffffff',
        border: `1px solid ${appTheme.colors.border}30`,
        borderRadius: isMobile ? '14px' : '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '16px',
        transition: 'all 0.2s ease',
        ':hover': {
            transform: 'translateX(4px)',
            borderColor: color,
            boxShadow: `0 4px 12px ${color}20`,
        },
    }),

    quickActionIcon: (isMobile) => ({
        width: isMobile ? '44px' : '52px',
        height: isMobile ? '44px' : '52px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),

    quickActionLabel: (isMobile) => ({
        fontSize: isMobile ? '14px' : '15px',
        fontWeight: '600',
        color: '#1f2937',
        display: 'block',
        marginBottom: '2px',
    }),

    quickActionDesc: (isMobile) => ({
        fontSize: isMobile ? '11px' : '12px',
        color: '#6b7280',
        display: 'block',
    }),

    recentSection: (isMobile) => ({
        marginTop: isMobile ? '28px' : '32px',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    }),

    recentList: (isMobile) => ({
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '14px' : '16px',
        border: `1px solid ${appTheme.colors.border}30`,
        overflow: 'hidden',
    }),

    recentItem: (isMobile) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '14px 16px' : '16px 20px',
        borderBottom: `1px solid ${appTheme.colors.border}20`,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':last-child': {
            borderBottom: 'none',
        },
        ':hover': {
            backgroundColor: '#f8fafc',
        },
    }),

    recentItemLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },

    recentItemIcon: (isMobile) => ({
        width: isMobile ? '36px' : '40px',
        height: isMobile ? '36px' : '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),

    recentItemTitle: (isMobile) => ({
        fontSize: isMobile ? '14px' : '15px',
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: '4px',
    }),

    recentItemMeta: (isMobile) => ({
        fontSize: isMobile ? '11px' : '12px',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
    }),

    recentItemType: (color) => ({
        color: color,
        fontWeight: '500',
        textTransform: 'capitalize',
    }),

    emptyRecent: {
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: `1px solid ${appTheme.colors.border}30`,
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
        h3: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '16px 0 8px 0',
        },
        p: {
            fontSize: '0.9rem',
            color: '#6b7280',
            marginBottom: '20px',
        },
    },

    emptyRecentIcon: {
        display: 'inline-flex',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '60px',
    },

    emptyRecentActions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
    },

    emptyRecentButton: (color) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
        borderRadius: '10px',
        color: color,
        fontSize: '0.85rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: color,
            color: 'white',
        },
    }),

    noResults: {
        textAlign: 'center',
        padding: '60px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: `1px solid ${appTheme.colors.border}30`,
        h3: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '16px 0 8px 0',
        },
        p: {
            fontSize: '0.9rem',
            color: '#6b7280',
        },
    },
};