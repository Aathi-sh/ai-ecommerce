// app/super-admin/companies/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Power,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe,
  MapPinned,
  Hash,
  Briefcase,
  Copy,
  Download,
  TrendingUp,
  TrendingDown,
  UserCircle,
  Settings,
  Shield,
  Activity,
  PieChart,
  BarChart3,
  RefreshCw,
  MoreVertical,
  Eye,
  EyeOff,
  Save,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Wallet,
  CalendarDays,
  Zap,
  Award,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  DownloadCloud,
  UploadCloud,
  Printer,
  Share2,
  Bookmark,
  Bell,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Server,
  HardDrive,
  Database,
  Cpu,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
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
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key,
  KeyRound,
  Fingerprint,
  ScanFace,
  ScanLine,
  ScanSearch,
  ScanText,
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

export default function CompanyDetailsPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = params;

  // State
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for editing
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    gstin: '',
    pan: '',
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    usage: {
      users: { current: 0, limit: 0, percentage: 0 },
      products: { current: 0, limit: 0, percentage: 0 },
      orders: { current: 0, limit: 0, percentage: 0 },
      bookings: { current: 0, limit: 0, percentage: 0 },
    }
  });

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch company data
  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  // Fetch users when tab changes to users
  useEffect(() => {
    if (activeTab === 'users' && id) {
      fetchUsers();
    }
  }, [activeTab, id, userPage, userSearch, userRoleFilter, userStatusFilter]);

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/companies/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch company');
      }

      setCompany(data.data.company);
      setStats(data.data.stats || {});
      
      // Initialize form data
      setFormData({
        companyName: data.data.company.companyName || '',
        companyEmail: data.data.company.companyEmail || '',
        companyPhone: data.data.company.companyPhone || '',
        address: {
          street: data.data.company.address?.street || '',
          city: data.data.company.address?.city || '',
          state: data.data.company.address?.state || '',
          pincode: data.data.company.address?.pincode || '',
          country: data.data.company.address?.country || 'India',
        },
        gstin: data.data.company.gstin || '',
        pan: data.data.company.pan || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: userPage.toString(),
        limit: '10',
        ...(userSearch && { search: userSearch }),
        ...(userRoleFilter !== 'all' && { role: userRoleFilter }),
        ...(userStatusFilter !== 'all' && { status: userStatusFilter }),
      });

      const response = await fetch(`/api/companies/${id}/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.data || []);
      setUserTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update company');
      }

      setCompany(data.data);
      setIsEditing(false);
      setSuccessMessage('Company updated successfully');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    setSaveLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/companies/${id}?permanent=false`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete company');
      }

      router.push('/super-admin/companies');
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    // Implement user actions (suspend, activate, delete, etc.)
    console.log('User action:', userId, action);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2, label: 'Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Suspended' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Power, label: 'Inactive' },
    };
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const plans = {
      free: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Free' },
      basic: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Basic' },
      pro: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Pro' },
      enterprise: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Enterprise' },
    };
    const planData = plans[plan] || plans.free;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planData.bg} ${planData.text}`}>
        {planData.label}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Company not found'}</p>
          <button
            onClick={() => router.push('/super-admin/companies')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/super-admin/companies')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Building2 className="w-8 h-8 mr-3 text-indigo-600" />
                  {company.companyName}
                </h1>
                <div className="mt-1 flex items-center gap-3">
                  {getStatusBadge(company.status)}
                  {getPlanBadge(company.subscription?.plan)}
                  <span className="text-sm text-gray-500">
                    Created {formatDate(company.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && activeTab === 'overview' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                    }}
                    className={`
                      py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Limit: {stats.usage?.users?.limit || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Usage</span>
                    <span>{stats.usage?.users?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (stats.usage?.users?.percentage || 0) > 90
                          ? 'bg-red-600'
                          : (stats.usage?.users?.percentage || 0) > 70
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(stats.usage?.users?.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Limit: {stats.usage?.products?.limit || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Usage</span>
                    <span>{stats.usage?.products?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (stats.usage?.products?.percentage || 0) > 90
                          ? 'bg-red-600'
                          : (stats.usage?.products?.percentage || 0) > 70
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(stats.usage?.products?.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Limit: {stats.usage?.orders?.limit || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Usage</span>
                    <span>{stats.usage?.orders?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (stats.usage?.orders?.percentage || 0) > 90
                          ? 'bg-red-600'
                          : (stats.usage?.orders?.percentage || 0) > 70
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(stats.usage?.orders?.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Limit: {stats.usage?.bookings?.limit || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Usage</span>
                    <span>{stats.usage?.bookings?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (stats.usage?.bookings?.percentage || 0) > 90
                          ? 'bg-red-600'
                          : (stats.usage?.bookings?.percentage || 0) > 70
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(stats.usage?.bookings?.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                  Company Information
                </h2>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Email
                        </label>
                        <input
                          type="email"
                          value={formData.companyEmail}
                          onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.companyPhone}
                          onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, state: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={formData.address.pincode}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, pincode: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.address.country}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, country: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GSTIN (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.gstin}
                          onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PAN (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.pan}
                          onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                      >
                        {saveLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Company Name</p>
                        <p className="text-base font-medium text-gray-900">{company.companyName}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base font-medium text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {company.companyEmail}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-base font-medium text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {company.companyPhone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-base font-medium text-gray-900 flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-1 flex-shrink-0" />
                          <span>
                            {company.address?.street}<br />
                            {company.address?.city}, {company.address?.state} - {company.address?.pincode}<br />
                            {company.address?.country}
                          </span>
                        </p>
                      </div>
                      {company.gstin && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">GSTIN</p>
                          <p className="text-base font-medium text-gray-900">{company.gstin}</p>
                        </div>
                      )}
                      {company.pan && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">PAN</p>
                          <p className="text-base font-medium text-gray-900">{company.pan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                  Recent Activity
                </h2>

                <div className="space-y-4">
                  {company.recentActivity?.users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center">
                        <UserCircle className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {user.lastSeen ? formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true }) : 'Never'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {company.recentActivity?.orders?.map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalPrice)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  Users Management
                </h2>
                <button
                  onClick={() => {/* Add user modal */}}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </button>
              </div>

              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => {
                      setUserStatusFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <Users className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserCircle className="w-6 h-6 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastSeen ? formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true }) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                              className={`mr-2 p-1 rounded ${
                                user.status === 'active'
                                  ? 'text-yellow-600 hover:bg-yellow-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {user.status === 'active' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {userTotal > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(userPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(userPage * 10, userTotal)}</span> of{' '}
                    <span className="font-medium">{userTotal}</span> users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                      className="p-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUserPage(p => p + 1)}
                      disabled={userPage * 10 >= userTotal}
                      className="p-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Subscription */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                  Current Subscription
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Plan</p>
                      <div className="mt-1">
                        {getPlanBadge(company.subscription?.plan)}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(company.subscription?.status)}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Started</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatDate(company.subscription?.startDate)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {company.subscription?.expiryDate
                          ? formatDate(company.subscription.expiryDate)
                          : 'Never'}
                      </p>
                      {company.subscription?.expiryDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {company.daysUntilExpiry} days remaining
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Auto Renew</p>
                      <p className="text-base font-medium text-gray-900">
                        {company.subscription?.autoRenew ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="text-base font-medium text-gray-900 capitalize">
                        {company.subscription?.paymentMethod || 'Monthly'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-indigo-600" />
                  Plan Features
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(company.features || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {value ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                  Usage Limits
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Users</span>
                      <span className="font-medium">
                        {stats.totalUsers} / {company.limits?.maxUsers || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min((stats.totalUsers / (company.limits?.maxUsers || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Products</span>
                      <span className="font-medium">
                        {stats.totalProducts} / {company.limits?.maxProducts || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min((stats.totalProducts / (company.limits?.maxProducts || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Orders (Monthly)</span>
                      <span className="font-medium">
                        {stats.totalOrders} / {company.limits?.maxOrdersPerMonth || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min((stats.totalOrders / (company.limits?.maxOrdersPerMonth || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Bookings (Monthly)</span>
                      <span className="font-medium">
                        {stats.totalBookings} / {company.limits?.maxBookingsPerMonth || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min((stats.totalBookings / (company.limits?.maxBookingsPerMonth || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Company Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                  Company Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Website</p>
                        <p className="text-xs text-gray-500">{company.website || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Support Email</p>
                        <p className="text-xs text-gray-500">{company.support?.email || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Support Phone</p>
                        <p className="text-xs text-gray-500">{company.support?.phone || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Business Hours</p>
                        <p className="text-xs text-gray-500">{company.businessHours || 'Not set'}</p>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-indigo-600" />
                  WhatsApp Integration
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${company.whatsapp?.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Connection Status</p>
                        <p className="text-xs text-gray-500">
                          {company.whatsapp?.isConnected ? 'Connected' : 'Not Connected'}
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                      {company.whatsapp?.isConnected ? 'Reconnect' : 'Connect'}
                    </button>
                  </div>

                  {company.whatsapp?.businessId && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Business ID</p>
                      <p className="text-sm text-gray-600">{company.whatsapp.businessId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Danger Zone
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">Suspend Company</p>
                      <p className="text-xs text-red-700">
                        Temporarily disable access for all users in this company
                      </p>
                    </div>
                    <button
                      onClick={() => handleUserAction(company.id, 'suspend')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Suspend
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">Delete Company</p>
                      <p className="text-xs text-red-700">
                        Permanently delete this company and all associated data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Company
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">{company.companyName}</span>? This action cannot be undone and all data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for date formatting
function formatDistanceToNow(date, options = {}) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}