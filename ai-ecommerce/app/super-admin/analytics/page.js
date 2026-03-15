// app/super-admin/analytics/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Calendar,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
  Globe,
  Award,
  Zap,
  Shield,
  UserPlus,
  UserCheck,
  UserX,
  Wallet,
  CalendarDays,
  FileText,
  DownloadCloud,
  UploadCloud,
  Printer,
  Share2,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprise,
  Ghost,
  Robot,
  Cat,
  Dog,
  Bird,
  Fish,
  Bug,
  Leaf,
  Tree,
  Flower,
  Mountain,
  Sunset,
  Sunrise,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  ScanFace,
  QrCode,
  Barcode,
  Camera,
  Video,
  Mic,
  Headphones,
  Speaker,
  Volume2,
  Music,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Save,
  X,
  Menu,
  Sun,
  Moon,
  Home,
  Settings,
  Bell,
  LogOut,
  HelpCircle,
  Info,
  AlertTriangle,
  Database,
  HardDrive,
  Server,
  Cpu,
  Wifi,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Watch,
  Clock as ClockIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
} from 'recharts';

// ============== STATS CARD ==============
const StatsCard = ({ title, value, icon: Icon, change, changeType, color, loading, prefix = '', suffix = '' }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 sm:h-8 bg-gray-300 rounded w-24 sm:w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 sm:p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${color}-600`} />
        </div>
        {change !== undefined && change !== null && (
          <div className={`flex items-center text-xs sm:text-sm ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {changeType === 'positive' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </p>
      </div>
    </div>
  );
};

// ============== CHART CARD ==============
const ChartCard = ({ title, icon: Icon, children, action, loading, fullWidth }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
          {title}
        </h2>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// ============== KPI CARD ==============
const KPICard = ({ label, value, change, icon: Icon, color }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-gray-600">{label}</span>
        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 text-${color}-500`} />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-base sm:text-lg font-bold text-gray-900">{value}</span>
        {change !== undefined && (
          <span className={`text-xs flex items-center ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
};

// ============== PROGRESS BAR ==============
const ProgressBar = ({ label, value, total, color, showPercent = true }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {value.toLocaleString('en-IN')} {showPercent && `(${percentage.toFixed(1)}%)`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
        <div
          className={`h-1.5 sm:h-2 rounded-full bg-${color}-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============== CUSTOM TOOLTIP ==============
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 shadow-lg rounded-lg border border-gray-200">
        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {entry.name.includes('Revenue') ? '₹' : ''}
              {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
              {entry.name.includes('Rate') ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============== MAIN COMPONENT ==============
export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State
  const [loading, setLoading] = useState({
    main: true,
    revenue: true,
    companies: true,
    users: true,
    products: true
  });
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // today, week, month, quarter, year
  const [activeTab, setActiveTab] = useState('overview'); // overview, revenue, companies, users, products

  // Data states - all initialized empty, will be filled by API
  const [mainStats, setMainStats] = useState({
    totalRevenue: 0,
    totalCompanies: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalBookings: 0,
    growthRate: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    churnRate: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0
  });

  const [revenueData, setRevenueData] = useState({
    daily: [],
    monthly: [],
    byPlan: [],
    byPaymentMethod: [],
    byCompany: []
  });

  const [companiesData, setCompaniesData] = useState({
    growth: [],
    byStatus: [],
    byPlan: [],
    topPerformers: [],
    churned: []
  });

  const [usersData, setUsersData] = useState({
    growth: [],
    byStatus: [],
    byRole: [],
    byCompany: [],
    activeVsInactive: []
  });

  const [productsData, setProductsData] = useState({
    topSelling: [],
    byCategory: [],
    inventory: [],
    stockAlerts: []
  });

  // Colors for charts
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch data when date range changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin' && session?.user?.adminType === 'super') {
      fetchAllData();
    }
  }, [dateRange, status, session]);

  const fetchAllData = useCallback(async () => {
    setLoading({
      main: true,
      revenue: true,
      companies: true,
      users: true,
      products: true
    });
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        range: dateRange
      });

      // Fetch all analytics data in parallel from your existing API
      const [
        mainRes,
        revenueRes,
        companiesRes,
        usersRes,
        productsRes
      ] = await Promise.all([
        fetch(`/api/companies/analytics?type=dashboard&${params}`),
        fetch(`/api/companies/analytics?type=revenue&${params}`),
        fetch(`/api/companies/analytics?type=companies&${params}`),
        fetch(`/api/companies/analytics?type=users&${params}`),
        fetch(`/api/companies/analytics?type=products&${params}`)
      ]);

      // Check responses
      if (!mainRes.ok) {
        const errorData = await mainRes.json();
        throw new Error(errorData.message || 'Failed to fetch main analytics');
      }
      if (!revenueRes.ok) {
        const errorData = await revenueRes.json();
        throw new Error(errorData.message || 'Failed to fetch revenue analytics');
      }
      if (!companiesRes.ok) {
        const errorData = await companiesRes.json();
        throw new Error(errorData.message || 'Failed to fetch companies analytics');
      }
      if (!usersRes.ok) {
        const errorData = await usersRes.json();
        throw new Error(errorData.message || 'Failed to fetch users analytics');
      }
      if (!productsRes.ok) {
        const errorData = await productsRes.json();
        throw new Error(errorData.message || 'Failed to fetch products analytics');
      }

      // Parse data
      const [mainData, revenueData, companiesData, usersData, productsData] = await Promise.all([
        mainRes.json(),
        revenueRes.json(),
        companiesRes.json(),
        usersRes.json(),
        productsRes.json()
      ]);

      // Update state with real data from API
      if (mainData.success) setMainStats(mainData.data);
      if (revenueData.success) setRevenueData(revenueData.data);
      if (companiesData.success) setCompaniesData(companiesData.data);
      if (usersData.success) setUsersData(usersData.data);
      if (productsData.success) setProductsData(productsData.data);

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading({
        main: false,
        revenue: false,
        companies: false,
        users: false,
        products: false
      });
    }
  }, [dateRange]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAllData();
  };

  // Handle export
  const handleExport = (type, format) => {
    let data = [];
    let filename = '';

    switch(type) {
      case 'revenue':
        data = revenueData;
        filename = `revenue_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'companies':
        data = companiesData;
        filename = `companies_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'users':
        data = usersData;
        filename = `users_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'products':
        data = productsData;
        filename = `products_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}`;
        break;
    }

    if (format === 'csv') {
      // Convert to CSV
      const csv = JSON.stringify(data, null, 2);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-base sm:text-lg font-medium text-gray-700">Loading Analytics</p>
          <p className="text-xs sm:text-sm text-gray-500">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/super-admin/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Comprehensive platform analytics & insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
                  <div className="py-1">
                    <p className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">Export As</p>
                    <button
                      onClick={() => handleExport(activeTab, 'csv')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport(activeTab, 'json')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      JSON
                    </button>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loading.main}
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading.main ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error loading analytics</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(mainStats.totalRevenue)}
            icon={DollarSign}
            change={mainStats.growthRate}
            changeType={mainStats.growthRate >= 0 ? 'positive' : 'negative'}
            color="green"
            loading={loading.main}
            prefix="₹"
          />
          <StatsCard
            title="Companies"
            value={mainStats.totalCompanies}
            icon={Building2}
            change={mainStats.companyGrowth}
            changeType="positive"
            color="indigo"
            loading={loading.main}
          />
          <StatsCard
            title="Users"
            value={mainStats.totalUsers}
            icon={Users}
            change={mainStats.userGrowth}
            changeType="positive"
            color="blue"
            loading={loading.main}
          />
          <StatsCard
            title="Orders"
            value={mainStats.totalOrders}
            icon={ShoppingCart}
            change={mainStats.orderGrowth}
            changeType="positive"
            color="purple"
            loading={loading.main}
          />
          <StatsCard
            title="Products"
            value={mainStats.totalProducts}
            icon={Package}
            color="yellow"
            loading={loading.main}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Avg Order Value"
            value={`₹${formatNumber(mainStats.avgOrderValue)}`}
            change={mainStats.avgOrderGrowth}
            icon={Wallet}
            color="green"
          />
          <KPICard
            label="Conversion Rate"
            value={`${mainStats.conversionRate}%`}
            change={mainStats.conversionGrowth}
            icon={TrendingUp}
            color="blue"
          />
          <KPICard
            label="Churn Rate"
            value={`${mainStats.churnRate}%`}
            change={-mainStats.churnRate}
            icon={UserX}
            color="red"
          />
          <KPICard
            label="Active Subs"
            value={mainStats.activeSubscriptions}
            change={mainStats.subscriptionGrowth}
            icon={CreditCard}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex px-4 sm:px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'revenue', label: 'Revenue', icon: DollarSign },
                { id: 'companies', label: 'Companies', icon: Building2 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'products', label: 'Products', icon: Package }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-4 px-4 sm:px-6 inline-flex items-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors
                      ${activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Revenue Chart */}
              <ChartCard
                title={`Revenue Trend (${dateRange})`}
                icon={LineChart}
                loading={loading.revenue}
                fullWidth
              >
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData.daily || revenueData.monthly}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey={revenueData.daily ? 'date' : 'month'} 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${formatNumber(value)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Plan */}
                <ChartCard title="Revenue by Plan" icon={PieChart} loading={loading.revenue}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData.byPlan}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {revenueData.byPlan?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                {/* Companies by Plan */}
                <ChartCard title="Companies by Plan" icon={Building2} loading={loading.companies}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={companiesData.byPlan}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4f46e5" name="Companies">
                          {companiesData.byPlan?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              {/* Top Performers */}
              <ChartCard title="Top Performing Companies" icon={Award} loading={loading.companies} fullWidth>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companiesData.topPerformers?.map((company, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-900">{company.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(company.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {company.users}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              company.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {company.growth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {Math.abs(company.growth)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </>
          )}

          {/* REVENUE TAB */}
          {activeTab === 'revenue' && (
            <>
              {/* Monthly Revenue */}
              <ChartCard title="Monthly Revenue" icon={BarChart3} loading={loading.revenue} fullWidth>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={revenueData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `₹${formatNumber(value)}`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#4f46e5" name="Revenue" />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" name="Orders" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Revenue Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Revenue by Plan" icon={PieChart} loading={loading.revenue}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData.byPlan}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="revenue"
                        >
                          {revenueData.byPlan?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Revenue by Payment Method" icon={CreditCard} loading={loading.revenue}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData.byPaymentMethod}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {revenueData.byPaymentMethod?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            </>
          )}

          {/* COMPANIES TAB */}
          {activeTab === 'companies' && (
            <>
              {/* Company Growth */}
              <ChartCard title="Company Growth" icon={TrendingUp} loading={loading.companies} fullWidth>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companiesData.growth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="new" fill="#4f46e5" name="New Companies" stackId="a" />
                      <Bar dataKey="churned" fill="#ef4444" name="Churned" stackId="a" />
                      <Bar dataKey="net" fill="#10b981" name="Net Growth" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Company Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Companies by Status" icon={Activity} loading={loading.companies}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={companiesData.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {companiesData.byStatus?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              entry.name === 'Active' ? '#10b981' :
                              entry.name === 'Pending' ? '#f59e0b' :
                              entry.name === 'Suspended' ? '#ef4444' :
                              COLORS[index % COLORS.length]
                            } />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Companies by Plan" icon={Package} loading={loading.companies}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={companiesData.byPlan}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4f46e5" name="Companies">
                          {companiesData.byPlan?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              {/* Status Breakdown */}
              <ChartCard title="Company Status Breakdown" icon={PieChart} loading={loading.companies}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {companiesData.byStatus?.map((status) => (
                    <ProgressBar
                      key={status.name}
                      label={status.name}
                      value={status.value}
                      total={mainStats.totalCompanies}
                      color={
                        status.name === 'Active' ? 'green' :
                        status.name === 'Pending' ? 'yellow' :
                        'red'
                      }
                    />
                  ))}
                </div>
              </ChartCard>
            </>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <>
              {/* User Growth */}
              <ChartCard title="User Growth" icon={Users} loading={loading.users} fullWidth>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usersData.growth}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#4f46e5" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* User Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Users by Status" icon={Activity} loading={loading.users}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={usersData.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {usersData.byStatus?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              entry.name === 'Active' ? '#10b981' :
                              entry.name === 'Inactive' ? '#9ca3af' :
                              entry.name === 'Suspended' ? '#ef4444' :
                              entry.name === 'Pending' ? '#f59e0b' :
                              COLORS[index % COLORS.length]
                            } />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Users by Role" icon={Shield} loading={loading.users}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usersData.byRole}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4f46e5" name="Users">
                          {usersData.byRole?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              {/* Active vs Inactive */}
              <ChartCard title="Active vs Inactive Users" icon={UserCheck} loading={loading.users}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{usersData.activeVsInactive?.active || 0}</div>
                    <p className="text-sm text-gray-600 mt-1">Active Users</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${((usersData.activeVsInactive?.active || 0) / mainStats.totalUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-400">{usersData.activeVsInactive?.inactive || 0}</div>
                    <p className="text-sm text-gray-600 mt-1">Inactive Users</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full bg-gray-400"
                        style={{ width: `${((usersData.activeVsInactive?.inactive || 0) / mainStats.totalUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </ChartCard>
            </>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <>
              {/* Top Selling Products */}
              <ChartCard title="Top Selling Products" icon={Package} loading={loading.products} fullWidth>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productsData.topSelling?.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {product.sold}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(product.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.stock > 100 ? 'bg-green-100 text-green-800' :
                              product.stock > 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>

              {/* Products by Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Products by Category" icon={PieChart} loading={loading.products}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productsData.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {productsData.byCategory?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Inventory Status" icon={Database} loading={loading.products}>
                  <div className="space-y-4">
                    <ProgressBar
                      label="In Stock"
                      value={productsData.inventory?.inStock || 0}
                      total={mainStats.totalProducts}
                      color="green"
                    />
                    <ProgressBar
                      label="Low Stock"
                      value={productsData.inventory?.lowStock || 0}
                      total={mainStats.totalProducts}
                      color="yellow"
                    />
                    <ProgressBar
                      label="Out of Stock"
                      value={productsData.inventory?.outOfStock || 0}
                      total={mainStats.totalProducts}
                      color="red"
                    />
                  </div>
                </ChartCard>
              </div>

              {/* Stock Alerts */}
              {productsData.stockAlerts?.length > 0 && (
                <ChartCard title="Stock Alerts" icon={AlertTriangle} loading={loading.products} fullWidth>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <h3 className="text-sm font-medium text-red-800">Low Stock Alert</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productsData.stockAlerts?.map((alert, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-600">Stock:</span>
                            <span className="text-sm font-bold text-red-600">{alert.stock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}