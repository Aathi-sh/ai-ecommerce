// app/super-admin/subscriptions/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  Package,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  TrendingDown,
  TrendingUp,
  Database,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Building2,
  Users,
  FileText,
  Filter,
  Save,
  Play,
  Pause,
  AlertTriangle,
  Info,
  Globe,
  Mail,
  Phone,
  MapPin,
  Copy,
  Check,
  X,
  Printer,
  Share2,
  Bookmark,
  Star,
  Zap,
  Shield,
  Award,
  Heart,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Bell,
  UserCircle,
  Home,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  DownloadCloud,
  UploadCloud,
  QrCode,
  Barcode,
  Camera,
  Video,
  Mic,
  Headphones,
  Speaker,
  Volume2,
  Music,
  Stop,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
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
  ScanFace
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// ============== STATS CARD ==============
const StatsCard = ({ title, value, icon: Icon, change, changeType, color, loading, prefix = '' }) => {
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
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">{title}</p>
    </div>
  );
};

// ============== PLAN CARD ==============
const PlanCard = ({ plan, onEdit, onDelete, onActivate, onDeactivate }) => {
  const getPlanColor = (name) => {
    switch(name?.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'basic': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanIcon = (name) => {
    switch(name?.toLowerCase()) {
      case 'enterprise': return <Award className="w-5 h-5 text-purple-600" />;
      case 'pro': return <Zap className="w-5 h-5 text-blue-600" />;
      case 'basic': return <Star className="w-5 h-5 text-green-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriceDisplay = () => {
    if (plan.name?.toLowerCase() === 'free') {
      return <span className="text-2xl font-bold text-gray-900">Free</span>;
    }
    if (plan.name?.toLowerCase() === 'enterprise') {
      return <span className="text-2xl font-bold text-gray-900">Custom</span>;
    }
    
    return (
      <>
        <span className="text-2xl font-bold text-indigo-600">₹{plan.price?.toLocaleString('en-IN')}</span>
        <span className="text-sm font-normal text-gray-500 ml-1">
          {plan.interval === 'monthly' ? '/mo' : plan.interval === 'yearly' ? '/yr' : `/${plan.interval}`}
        </span>
      </>
    );
  };

  const getSavingsText = () => {
    if (plan.savings && plan.savings > 0) {
      return (
        <p className="text-xs text-green-600 font-medium mt-1">
          Save ₹{plan.savings.toLocaleString('en-IN')} yearly
        </p>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${plan.isActive ? 'border-indigo-500' : 'border-gray-200'} p-4 sm:p-6 hover:shadow-lg transition-all relative overflow-hidden`}>
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          Popular
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${getPlanColor(plan.name)}`}>
            {getPlanIcon(plan.name)}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 ml-3 capitalize">{plan.name}</h3>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {plan.isActive ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
          {plan.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline">
          {getPriceDisplay()}
        </div>
        {getSavingsText()}
        <p className="text-xs text-gray-500 mt-2">{plan.companiesCount || 0} companies on this plan</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">Max Users: {plan.maxUsers?.toLocaleString() || 'Unlimited'}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">Max Products: {plan.maxProducts?.toLocaleString() || 'Unlimited'}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">Orders/Month: {plan.maxOrders?.toLocaleString() || 'Unlimited'}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">Bookings/Month: {plan.maxBookings?.toLocaleString() || 'Unlimited'}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">Storage: {plan.storage ? `${plan.storage}GB` : 'Unlimited'}</span>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
        {plan.features?.slice(0, 4).map((feature, index) => (
          <div key={index} className="flex items-center text-xs text-gray-600">
            <CheckCircle2 className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
            <span className="truncate">{feature}</span>
          </div>
        ))}
        {plan.features?.length > 4 && (
          <p className="text-xs text-gray-400 mt-1">+{plan.features.length - 4} more features</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex gap-1 sm:gap-2">
          {plan.isActive ? (
            <button onClick={() => onDeactivate(plan)} className="p-1.5 sm:p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Deactivate">
              <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          ) : (
            <button onClick={() => onActivate(plan)} className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Activate">
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
          <button onClick={() => onEdit(plan)} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => onDelete(plan)} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== SUBSCRIPTION TABLE ROW ==============
const SubscriptionRow = ({ subscription, onView, onEdit }) => {
  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    return `${days} days left`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{subscription.companyName}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{subscription.companyEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
          subscription.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
          subscription.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
          subscription.plan === 'basic' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {subscription.plan}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(subscription.status)}`}>
          {subscription.status === 'active' && <Play className="w-3 h-3 mr-1" />}
          {subscription.status === 'expired' && <XCircle className="w-3 h-3 mr-1" />}
          {subscription.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
          {subscription.status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
          {subscription.status}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        ₹{subscription.amount?.toLocaleString('en-IN')}
      </td>
      <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900">{subscription.startDate ? format(new Date(subscription.startDate), 'dd MMM yyyy') : '-'}</div>
        <div className="text-[10px] sm:text-xs text-gray-500">{subscription.endDate ? format(new Date(subscription.endDate), 'dd MMM yyyy') : '-'}</div>
      </td>
      <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`text-xs sm:text-sm ${
          subscription.status === 'expired' ? 'text-red-600' : 
          subscription.status === 'active' ? 'text-green-600' : 'text-gray-600'
        }`}>
          {subscription.daysLeft ? getDaysLeft(subscription.endDate) : '-'}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(subscription)} className="text-indigo-600 hover:text-indigo-900 mr-2" title="View Company">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(subscription)} className="text-blue-600 hover:text-blue-900" title="Edit Subscription">
          <Edit className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// ============== INVOICE ROW ==============
const InvoiceRow = ({ invoice, onDownload, onView }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
        {invoice.invoiceNumber}
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[120px] sm:max-w-none">{invoice.companyName}</div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {invoice.status}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        ₹{invoice.amount?.toLocaleString('en-IN')}
      </td>
      <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : '-'}
      </td>
      <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        {invoice.paidAt ? format(new Date(invoice.paidAt), 'dd MMM yyyy') : '-'}
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(invoice)} className="text-indigo-600 hover:text-indigo-900 mr-2" title="View Invoice">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => onDownload(invoice)} className="text-green-600 hover:text-green-900" title="Download">
          <Download className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// ============== PAYMENT ROW ==============
const PaymentRow = ({ payment }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
        <span className="truncate block max-w-[100px] sm:max-w-none">{payment.transactionId}</span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">{payment.companyName}</div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
          payment.status === 'success' ? 'bg-green-100 text-green-800' :
          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {payment.status}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        ₹{payment.amount?.toLocaleString('en-IN')}
      </td>
      <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        {payment.paymentMethod}
      </td>
      <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        {payment.paidAt ? format(new Date(payment.paidAt), 'dd MMM yyyy') : '-'}
      </td>
    </tr>
  );
};

// ============== MAIN COMPONENT ==============
export default function SubscriptionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');
  const [interval, setInterval] = useState('monthly'); // monthly/yearly for plans view
  
  // Data states
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    totalCompanies: 0
  });

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    interval: 'monthly',
    maxUsers: '',
    maxProducts: '',
    maxOrders: '',
    maxBookings: '',
    storage: '',
    features: [],
    isActive: true
  });
  const [newFeature, setNewFeature] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type: activeTab,
        page: page.toString(),
        limit: limit.toString(),
        interval: interval,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(planFilter !== 'all' && { plan: planFilter })
      });

      const response = await fetch(`/api/companies/subscriptions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch data');
      }

      // Update state based on active tab
      switch(activeTab) {
        case 'plans':
          setPlans(data.data || []);
          setStats(data.stats || {});
          setTotal(data.pagination?.total || 0);
          break;
        case 'companies':
          setSubscriptions(data.data || []);
          setStats(data.stats || {});
          setTotal(data.pagination?.total || 0);
          break;
        case 'invoices':
          setInvoices(data.data || []);
          setStats(data.stats || {});
          setTotal(data.pagination?.total || 0);
          break;
        case 'payments':
          setPayments(data.data || []);
          setStats(data.stats || {});
          setTotal(data.pagination?.total || 0);
          break;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit, interval, search, statusFilter, planFilter]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin' && session?.user?.adminType === 'super') {
      fetchData();
    }
  }, [status, session, fetchData]);

  // Plan CRUD operations
  const handleCreatePlan = async () => {
    try {
      const response = await fetch('/api/companies/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          ...planForm,
          price: parseFloat(planForm.price),
          maxUsers: parseInt(planForm.maxUsers) || null,
          maxProducts: parseInt(planForm.maxProducts) || null,
          maxOrders: parseInt(planForm.maxOrders) || null,
          maxBookings: parseInt(planForm.maxBookings) || null,
          storage: parseInt(planForm.storage) || null
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowPlanModal(false);
      resetPlanForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      const response = await fetch(`/api/companies/subscriptions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          id: selectedPlan.id,
          ...planForm,
          price: parseFloat(planForm.price)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowPlanModal(false);
      setSelectedPlan(null);
      resetPlanForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePlan = async () => {
    try {
      const response = await fetch(`/api/companies/subscriptions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          id: selectedPlan.id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowDeleteConfirm(false);
      setSelectedPlan(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActivatePlan = async (plan) => {
    try {
      const response = await fetch(`/api/companies/subscriptions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          id: plan.id,
          isActive: true
        })
      });

      if (!response.ok) throw new Error('Failed to activate plan');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeactivatePlan = async (plan) => {
    try {
      const response = await fetch(`/api/companies/subscriptions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          id: plan.id,
          isActive: false
        })
      });

      if (!response.ok) throw new Error('Failed to deactivate plan');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      price: '',
      interval: 'monthly',
      maxUsers: '',
      maxProducts: '',
      maxOrders: '',
      maxBookings: '',
      storage: '',
      features: [],
      isActive: true
    });
    setNewFeature('');
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPlanForm({
        ...planForm,
        features: [...planForm.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setPlanForm({
      ...planForm,
      features: planForm.features.filter((_, i) => i !== index)
    });
  };

  const handleExport = (format) => {
    let data = [];
    let filename = '';

    switch(activeTab) {
      case 'plans':
        data = plans;
        filename = 'plans_export';
        break;
      case 'companies':
        data = subscriptions;
        filename = 'subscriptions_export';
        break;
      case 'invoices':
        data = invoices;
        filename = 'invoices_export';
        break;
      case 'payments':
        data = payments;
        filename = 'payments_export';
        break;
    }

    filename = `${filename}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(item => Object.values(item).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
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

  const tabs = [
    { id: 'plans', label: 'Plans', icon: Package, count: stats.totalPlans },
    { id: 'companies', label: 'Subscriptions', icon: Building2, count: stats.activeSubscriptions },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: stats.pendingInvoices },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: payments.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/super-admin/dashboard')}
                className="mr-2 sm:mr-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">Manage plans, subscriptions, invoices & payments</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {activeTab === 'plans' && (
                <button
                  onClick={() => {
                    resetPlanForm();
                    setSelectedPlan(null);
                    setShowPlanModal(true);
                  }}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">New</span> Plan
                </button>
              )}
              {(activeTab === 'invoices' || activeTab === 'payments' || activeTab === 'companies') && (
                <div className="relative group">
                  <button className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center text-xs sm:text-sm">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Export</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-36 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
                    <button onClick={() => handleExport('csv')} className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      CSV
                    </button>
                    <button onClick={() => handleExport('json')} className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      JSON
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={fetchData}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <StatsCard
            title="Total Plans"
            value={stats.totalPlans || 0}
            icon={Package}
            color="indigo"
            loading={loading}
          />
          <StatsCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions || 0}
            icon={Building2}
            change={12.5}
            changeType="positive"
            color="green"
            loading={loading}
          />
          <StatsCard
            title="Monthly Revenue"
            value={stats.monthlyRevenue || 0}
            icon={DollarSign}
            change={8.3}
            changeType="positive"
            color="purple"
            loading={loading}
            prefix="₹"
          />
          <StatsCard
            title="Pending Invoices"
            value={stats.pendingInvoices || 0}
            icon={FileText}
            change={-5.2}
            changeType="negative"
            color="yellow"
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex px-2 sm:px-4" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setPage(1);
                      setSearch('');
                    }}
                    className={`
                      py-3 sm:py-4 px-3 sm:px-6 inline-flex items-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors
                      ${activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">{tab.label}</span>
                    <span className="xs:hidden">{tab.label.slice(0, 3)}</span>
                    {tab.count > 0 && (
                      <span className={`ml-1 sm:ml-2 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                />
              </div>
              
              {activeTab === 'plans' && (
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="monthly">Monthly Plans</option>
                  <option value="yearly">Yearly Plans</option>
                  <option value="all">All Plans</option>
                </select>
              )}

              {activeTab === 'companies' && (
                <>
                  <select
                    value={planFilter}
                    onChange={(e) => {
                      setPlanFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </>
              )}

              {(activeTab === 'invoices' || activeTab === 'payments') && (
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="success">Success</option>
                </select>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-600 break-words">{error}</p>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                {/* Plans Grid */}
                {activeTab === 'plans' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {plans.length === 0 ? (
                      <div className="col-span-full text-center py-8 sm:py-12">
                        <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm sm:text-base text-gray-500">No plans found</p>
                        <button
                          onClick={() => {
                            resetPlanForm();
                            setSelectedPlan(null);
                            setShowPlanModal(true);
                          }}
                          className="mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center text-xs sm:text-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Create First Plan
                        </button>
                      </div>
                    ) : (
                      plans.map(plan => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          onEdit={(p) => {
                            setSelectedPlan(p);
                            setPlanForm({
                              name: p.name,
                              price: p.price,
                              interval: p.interval,
                              maxUsers: p.maxUsers,
                              maxProducts: p.maxProducts,
                              maxOrders: p.maxOrders,
                              maxBookings: p.maxBookings,
                              storage: p.storage,
                              features: p.features || [],
                              isActive: p.isActive
                            });
                            setShowPlanModal(true);
                          }}
                          onDelete={(p) => {
                            setSelectedPlan(p);
                            setShowDeleteConfirm(true);
                          }}
                          onActivate={handleActivatePlan}
                          onDeactivate={handleDeactivatePlan}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* Subscriptions Table */}
                {activeTab === 'companies' && (
                  <div className="overflow-x-auto -mx-3 sm:-mx-6">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Company</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Plan</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Time Left</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {subscriptions.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-3 sm:px-6 py-4 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                                No subscriptions found
                              </td>
                            </tr>
                          ) : (
                            subscriptions.map(sub => (
                              <SubscriptionRow
                                key={sub.id}
                                subscription={sub}
                                onView={(s) => router.push(`/super-admin/companies/${s.companyId}`)}
                                onEdit={(s) => router.push(`/super-admin/companies/${s.companyId}/subscription`)}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Invoices Table */}
                {activeTab === 'invoices' && (
                  <div className="overflow-x-auto -mx-3 sm:-mx-6">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Company</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Paid On</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoices.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-3 sm:px-6 py-4 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                                No invoices found
                              </td>
                            </tr>
                          ) : (
                            invoices.map(invoice => (
                              <InvoiceRow
                                key={invoice.id}
                                invoice={invoice}
                                onView={(i) => {
                                  setSelectedInvoice(i);
                                  setShowInvoiceModal(true);
                                }}
                                onDownload={(i) => {
                                  // Implement download functionality
                                  console.log('Download invoice:', i.id);
                                }}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payments Table */}
                {activeTab === 'payments' && (
                  <div className="overflow-x-auto -mx-3 sm:-mx-6">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Transaction</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Company</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-3 sm:px-6 py-4 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                                No payments found
                              </td>
                            </tr>
                          ) : (
                            payments.map(payment => (
                              <PaymentRow key={payment.id} payment={payment} />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {total > limit && (
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                    </p>
                    <div className="flex gap-2 order-1 sm:order-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm">Page {page}</span>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * limit >= total}
                        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="e.g., Basic, Pro, Enterprise"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Billing Interval</label>
                  <select
                    value={planForm.interval}
                    onChange={(e) => setPlanForm({...planForm, interval: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Users</label>
                  <input
                    type="number"
                    value={planForm.maxUsers}
                    onChange={(e) => setPlanForm({...planForm, maxUsers: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Products</label>
                  <input
                    type="number"
                    value={planForm.maxProducts}
                    onChange={(e) => setPlanForm({...planForm, maxProducts: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Orders/Month</label>
                  <input
                    type="number"
                    value={planForm.maxOrders}
                    onChange={(e) => setPlanForm({...planForm, maxOrders: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Bookings/Month</label>
                  <input
                    type="number"
                    value={planForm.maxBookings}
                    onChange={(e) => setPlanForm({...planForm, maxBookings: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Storage (GB)</label>
                  <input
                    type="number"
                    value={planForm.storage}
                    onChange={(e) => setPlanForm({...planForm, storage: e.target.value})}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <button
                    onClick={addFeature}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs sm:text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {planForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-700 truncate">{feature}</span>
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded ml-2 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={planForm.isActive}
                  onChange={(e) => setPlanForm({...planForm, isActive: e.target.checked})}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="ml-2 text-xs sm:text-sm text-gray-700">
                  Active (available for new subscriptions)
                </label>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan(null);
                  resetPlanForm();
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={selectedPlan ? handleUpdatePlan : handleCreatePlan}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs sm:text-sm"
              >
                {selectedPlan ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full mx-auto mb-3 sm:mb-4">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Plan
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6">
                Are you sure you want to delete the "{selectedPlan.name}" plan? This action cannot be undone.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePlan}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Invoice {selectedInvoice.invoiceNumber}</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Company</h3>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedInvoice.companyName}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedInvoice.companyEmail}</p>
                </div>
                <div className="text-left sm:text-right">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    selectedInvoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Invoice Date</h3>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {selectedInvoice.createdAt ? format(new Date(selectedInvoice.createdAt), 'dd MMM yyyy') : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {selectedInvoice.dueDate ? format(new Date(selectedInvoice.dueDate), 'dd MMM yyyy') : '-'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Invoice Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500">Description</th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500">Price</th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-900">{item.description}</td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">₹{item.price?.toLocaleString('en-IN')}</td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">₹{item.total?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-gray-200">
                      <tr>
                        <td colSpan="3" className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">₹{selectedInvoice.subtotal?.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 text-right">Tax:</td>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">₹{selectedInvoice.tax?.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold text-gray-900 text-right">Total:</td>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold text-indigo-600 text-right">₹{selectedInvoice.amount?.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Notes</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => window.open(`/api/companies/invoices/${selectedInvoice.id}/download`)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Download
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center text-xs sm:text-sm"
                >
                  <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}