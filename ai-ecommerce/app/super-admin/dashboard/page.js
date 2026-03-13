// app/super-admin/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Building2,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Printer,
  Share2,
  Bell,
  Settings,
  UserPlus,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Globe,
  Mail,
  Phone,
  MapPin,
  Award,
  Zap,
  Shield,
  AlertTriangle,
  HelpCircle,
  Info,
  Moon,
  Sun,
  Sunset,
  Sunrise,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Eye as EyeIcon,
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
  Volume1,
  Volume2,
  VolumeX,
  Music,
  Disc,
  Disc3,
  Radio,
  RadioTower,
  Podcast,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Shuffle,
  Repeat,
  Repeat1,
  Infinity,
  Heart,
  HeartOff,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprise,
  Wink,
  Tongue,
  Skull,
  Ghost,
  Alien,
  Robot,
  Cat,
  Dog,
  Bird,
  Fish,
  Bug,
  Ant,
  Bee,
  Butterfly,
  Leaf,
  Tree,
  Flower,
  Mountain,
  Sunset as SunsetIcon,
  Sunrise as SunriseIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  Wind as WindIcon,
  Thermometer as ThermometerIcon,
  Droplets as DropletsIcon,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    pendingCompanies: 0,
    suspendedCompanies: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    companiesGrowth: 0,
    usersGrowth: 0,
    ordersGrowth: 0,
  });

  const [recentCompanies, setRecentCompanies] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data
      setStats({
        totalCompanies: 156,
        activeCompanies: 142,
        pendingCompanies: 8,
        suspendedCompanies: 6,
        totalUsers: 2845,
        totalProducts: 12345,
        totalOrders: 5678,
        totalBookings: 2345,
        totalRevenue: 4567890,
        revenueGrowth: 23.5,
        companiesGrowth: 12.3,
        usersGrowth: 18.7,
        ordersGrowth: 15.2,
      });

      setRecentCompanies([
        {
          id: 1,
          name: 'Tech Solutions Inc',
          email: 'info@techsolutions.com',
          plan: 'pro',
          status: 'active',
          users: 45,
          revenue: 125000,
          createdAt: '2024-01-15',
        },
        {
          id: 2,
          name: 'Green Mart',
          email: 'contact@greenmart.com',
          plan: 'basic',
          status: 'active',
          users: 12,
          revenue: 45000,
          createdAt: '2024-01-14',
        },
        {
          id: 3,
          name: 'Fitness Pro',
          email: 'support@fitnesspro.com',
          plan: 'enterprise',
          status: 'active',
          users: 78,
          revenue: 250000,
          createdAt: '2024-01-13',
        },
        {
          id: 4,
          name: 'Beauty Lounge',
          email: 'info@beautylounge.com',
          plan: 'basic',
          status: 'pending',
          users: 5,
          revenue: 15000,
          createdAt: '2024-01-12',
        },
        {
          id: 5,
          name: 'Auto Care Center',
          email: 'service@autocare.com',
          plan: 'pro',
          status: 'suspended',
          users: 23,
          revenue: 89000,
          createdAt: '2024-01-11',
        },
      ]);

      setRecentActivity([
        {
          id: 1,
          type: 'company_created',
          company: 'Tech Solutions Inc',
          user: 'John Doe',
          time: '2 minutes ago',
          icon: Building2,
          color: 'blue',
        },
        {
          id: 2,
          type: 'user_registered',
          company: 'Green Mart',
          user: 'Jane Smith',
          time: '15 minutes ago',
          icon: Users,
          color: 'green',
        },
        {
          id: 3,
          type: 'order_placed',
          company: 'Fitness Pro',
          amount: 12500,
          time: '1 hour ago',
          icon: ShoppingCart,
          color: 'purple',
        },
        {
          id: 4,
          type: 'subscription_expiring',
          company: 'Beauty Lounge',
          days: 5,
          time: '3 hours ago',
          icon: CreditCard,
          color: 'yellow',
        },
        {
          id: 5,
          type: 'company_suspended',
          company: 'Auto Care Center',
          reason: 'Payment failure',
          time: '5 hours ago',
          icon: AlertCircle,
          color: 'red',
        },
      ]);

      setChartData([
        { name: 'Mon', companies: 4, revenue: 24000 },
        { name: 'Tue', companies: 6, revenue: 32000 },
        { name: 'Wed', companies: 8, revenue: 45000 },
        { name: 'Thu', companies: 7, revenue: 38000 },
        { name: 'Fri', companies: 12, revenue: 65000 },
        { name: 'Sat', companies: 9, revenue: 42000 },
        { name: 'Sun', companies: 5, revenue: 28000 },
      ]);

      setNotifications([
        {
          id: 1,
          title: 'New Company Registration',
          message: 'Tech Solutions Inc has registered',
          time: '5 minutes ago',
          read: false,
          type: 'success',
        },
        {
          id: 2,
          title: 'Subscription Expiring',
          message: 'Beauty Lounge subscription expires in 5 days',
          time: '1 hour ago',
          read: false,
          type: 'warning',
        },
        {
          id: 3,
          title: 'Company Suspended',
          message: 'Auto Care Center has been suspended',
          time: '3 hours ago',
          read: true,
          type: 'error',
        },
      ]);
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2, label: 'Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Suspended' },
    };
    return badges[status] || badges.pending;
  };

  const getPlanBadge = (plan) => {
    const plans = {
      free: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Free' },
      basic: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Basic' },
      pro: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Pro' },
      enterprise: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Enterprise' },
    };
    return plans[plan] || plans.free;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {session?.user?.name}. Here's what's happening with your platform.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <button className="text-xs text-indigo-600 hover:text-indigo-800">
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notif.read ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Companies */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <span className={`flex items-center text-sm ${
                stats.companiesGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.companiesGrowth > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stats.companiesGrowth)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Companies</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span className="text-green-600 font-medium">{stats.activeCompanies}</span>
              <span className="mx-2">active</span>
              <span className="text-yellow-600 font-medium">{stats.pendingCompanies}</span>
              <span className="mx-2">pending</span>
              <span className="text-red-600 font-medium">{stats.suspendedCompanies}</span>
              <span>suspended</span>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                {stats.usersGrowth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Users</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full">
              <div className="h-1 w-3/4 bg-green-600 rounded-full"></div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                {stats.revenueGrowth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-gray-500">Orders: {formatNumber(stats.totalOrders)}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Bookings: {formatNumber(stats.totalBookings)}</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                8.2%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProducts)}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Products</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center text-xs text-gray-500">
                <ShoppingCart className="w-3 h-3 mr-1" />
                {formatNumber(stats.totalOrders)} orders
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {formatNumber(stats.totalBookings)} bookings
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Revenue Overview
              </h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-64">
              <div className="flex h-full items-end gap-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-indigo-100 rounded-t-lg relative group">
                      <div
                        className="bg-indigo-600 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-700"
                        style={{ height: `${(item.revenue / 65000) * 200}px` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
              Company Distribution
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium text-gray-900">{stats.activeCompanies}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(stats.activeCompanies / stats.totalCompanies) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-gray-900">{stats.pendingCompanies}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(stats.pendingCompanies / stats.totalCompanies) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Suspended</span>
                  <span className="font-medium text-gray-900">{stats.suspendedCompanies}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(stats.suspendedCompanies / stats.totalCompanies) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Plan Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Enterprise</span>
                  <span className="font-medium text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pro</span>
                  <span className="font-medium text-gray-900">52</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Basic</span>
                  <span className="font-medium text-gray-900">48</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Free</span>
                  <span className="font-medium text-gray-900">32</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Companies & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Companies */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                  Recent Companies
                </h2>
                <button
                  onClick={() => router.push('/super-admin/companies')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentCompanies.map((company) => {
                const statusBadge = getStatusBadge(company.status);
                const planBadge = getPlanBadge(company.plan);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <div key={company.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-4 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {company.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{company.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${planBadge.bg} ${planBadge.text}`}>
                            {planBadge.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusBadge.label}
                          </span>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-500 sm:hidden">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${planBadge.bg} ${planBadge.text} inline-block w-auto`}>
                        {planBadge.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {company.users} users
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {formatCurrency(company.revenue)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {company.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                const colors = {
                  blue: 'text-blue-600 bg-blue-100',
                  green: 'text-green-600 bg-green-100',
                  purple: 'text-purple-600 bg-purple-100',
                  yellow: 'text-yellow-600 bg-yellow-100',
                  red: 'text-red-600 bg-red-100',
                };
                const colorClass = colors[activity.color] || colors.blue;

                return (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.type === 'company_created' && (
                            <>New company <span className="font-medium">{activity.company}</span> created</>
                          )}
                          {activity.type === 'user_registered' && (
                            <>User <span className="font-medium">{activity.user}</span> registered at {activity.company}</>
                          )}
                          {activity.type === 'order_placed' && (
                            <>Order of <span className="font-medium">{formatCurrency(activity.amount)}</span> placed at {activity.company}</>
                          )}
                          {activity.type === 'subscription_expiring' && (
                            <><span className="font-medium">{activity.company}</span> subscription expires in {activity.days} days</>
                          )}
                          {activity.type === 'company_suspended' && (
                            <><span className="font-medium">{activity.company}</span> suspended - {activity.reason}</>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800">
                View All Activity
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/super-admin/companies/create')}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-900">Create Company</p>
                <p className="text-xs text-gray-500">Add new business</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-900">Manage Users</p>
                <p className="text-xs text-gray-500">View all users</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-900">Subscriptions</p>
                <p className="text-xs text-gray-500">Manage plans</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <Settings className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-900">System Settings</p>
                <p className="text-xs text-gray-500">Configure platform</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}