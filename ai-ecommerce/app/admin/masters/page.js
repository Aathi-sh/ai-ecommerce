// app/admin/masters/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { appTheme } from '../../../src/constants/theme';
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
    Zap
} from 'lucide-react';

export default function MastersDashboard() {
    const router = useRouter();
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
        setRefreshing(true);
        try {
            // Use your unified masters API for stats
            const res = await fetch('/api/masters?type=stats');
            const data = await res.json();
            
            if (data.success) {
                setStats(data.data);
            }

            // Fetch recent items
            const recentRes = await fetch('/api/masters?type=recent&limit=10');
            const recentData = await recentRes.json();
            if (recentData.success) {
                setRecentItems(recentData.data);
            }
        } catch (error) {
            console.error('Failed to fetch master stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

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
            path: '/admin/masters/categories',
            addPath: '/admin/masters/categories?action=add'
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
            path: '/admin/products', // Points to your existing products page
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
            path: '/admin/masters/categories?action=add' 
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
            {/* Header */}
            <div style={styles.header(isMobile)}>
                <div>
                    <div style={styles.titleWrapper(isMobile)}>
                        <div style={styles.titleBar(isMobile)}></div>
                        <h1 style={styles.title(isMobile)}>Masters Dashboard</h1>
                    </div>
                    <p style={styles.subtitle(isMobile)}>
                        Manage categories and products
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

            {/* Stats Overview */}
            <div style={styles.statsGrid(isMobile)}>
                <div style={styles.statCard(isMobile)}>
                    <div style={styles.statIcon}>
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
                    <div style={styles.statIcon}>
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
                    <div style={styles.statIcon}>
                        <Folder size={isMobile ? 18 : 20} color="#8b5cf6" />
                    </div>
                    <div>
                        <p style={styles.statLabel(isMobile)}>Categories</p>
                        <p style={styles.statValue(isMobile)}>{formatNumber(stats.categories.total)}</p>
                    </div>
                </div>
                <div style={styles.statCard(isMobile)}>
                    <div style={styles.statIcon}>
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
        backgroundColor: '#f3f4f6',
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