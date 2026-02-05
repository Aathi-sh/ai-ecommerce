// app/page.js - Professional Dashboard with Config Management
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X,
  Settings,
  ShoppingCart,
  Calendar,
  Bell,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
  Clock,
  Check,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState('65f2b3c1a8b9c0d1e2f3a4b5'); // Demo tenant ID
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [usageStats, setUsageStats] = useState({
    users: 3,
    products: 45,
    bookings: 127,
    revenue: 24500
  });

  // Fetch config data
  useEffect(() => {
    fetchConfig();
    fetchUsageStats();
  }, [tenantId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/config?tenantId=${tenantId}`);
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
        setFormData(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Failed to load configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    // Mock usage stats - replace with actual API call
    setTimeout(() => {
      setUsageStats({
        users: Math.floor(Math.random() * 10) + 1,
        products: Math.floor(Math.random() * 100) + 20,
        bookings: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 50000) + 10000
      });
    }, 500);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          updates: formData,
          updatedBy: 'user-123' // Replace with actual user ID
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
        setEditMode(false);
        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (section, field) => {
    try {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          operation: 'toggleFeature',
          data: { featureName: field }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
        setFormData(data.data);
        toast({
          title: 'Success',
          description: `${field} ${data.data[section]?.[field] ? 'enabled' : 'disabled'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle feature',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePlanUpgrade = async (newPlan) => {
    try {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          operation: 'upgradePlan',
          data: {
            newPlan,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
        toast({
          title: 'Plan Upgraded',
          description: `Successfully upgraded to ${newPlan} plan`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upgrade plan',
        variant: 'destructive'
      });
    }
  };

  const checkLimit = async (action) => {
    try {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          operation: 'checkLimit',
          data: { 
            action, 
            currentCount: usageStats[action === 'createUser' ? 'users' : 
                          action === 'createProduct' ? 'products' : 'bookings'] 
          }
        })
      });

      const data = await response.json();
      
      if (data.success && !data.data.allowed) {
        toast({
          title: 'Limit Reached',
          description: data.data.reason,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  // Loading state
  if (loading && !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load configuration. Please try again.
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={fetchConfig}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {config.general?.appName || 'Tenant Dashboard'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={
                      config.subscription.planName === 'enterprise' ? 'default' :
                      config.subscription.planName === 'pro' ? 'secondary' :
                      config.subscription.planName === 'basic' ? 'outline' : 'destructive'
                    }
                    className="capitalize"
                  >
                    {config.subscription.planName} Plan
                  </Badge>
                  {config.isSubscriptionValid ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePlanUpgrade(
                  config.subscription.planName === 'free' ? 'basic' :
                  config.subscription.planName === 'basic' ? 'pro' :
                  config.subscription.planName === 'pro' ? 'enterprise' : 'enterprise'
                )}
                disabled={config.subscription.planName === 'enterprise'}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Upgrade Plan
              </Button>
              
              {editMode ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(config);
                      setEditMode(false);
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Configuration
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Plan Card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Plan</span>
                    <Badge className="capitalize">
                      {config.subscription.planName}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-medium ${
                      config.isSubscriptionValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {config.isSubscriptionValid ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  
                  {config.subscription.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expires</span>
                      <span className="text-sm font-medium">
                        {new Date(config.subscription.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {config.daysUntilExpiry && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Days Remaining</span>
                      <span className="text-sm font-medium">
                        {config.daysUntilExpiry} days
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { 
                    label: 'Users', 
                    value: usageStats.users, 
                    limit: config.limits.maxUsers,
                    icon: Users,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                  },
                  { 
                    label: 'Products', 
                    value: usageStats.products, 
                    limit: config.limits.maxProducts,
                    icon: Package,
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                  },
                  { 
                    label: 'Bookings', 
                    value: usageStats.bookings, 
                    limit: config.limits.maxBookingsPerMonth,
                    icon: Calendar,
                    color: 'text-purple-600',
                    bg: 'bg-purple-100'
                  },
                  { 
                    label: 'Revenue', 
                    value: `$${usageStats.revenue.toLocaleString()}`,
                    icon: DollarSign,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-100'
                  }
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${stat.bg}`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <span className="text-sm font-semibold">{stat.value}</span>
                    </div>
                    {stat.limit && (
                      <>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${stat.bg.split(' ')[1]} transition-all duration-500`}
                            style={{ width: `${Math.min((stat.value / stat.limit) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Used: {stat.value}</span>
                          <span>Limit: {stat.limit}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => checkLimit('createUser')}
                >
                  <Users className="h-4 w-4" />
                  Add User
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => checkLimit('createProduct')}
                >
                  <Package className="h-4 w-4" />
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => checkLimit('createBooking')}
                >
                  <Calendar className="h-4 w-4" />
                  Create Booking
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-white border p-1 rounded-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ecommerce" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  E-commerce
                </TabsTrigger>
                <TabsTrigger value="booking" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Booking
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="limits" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Limits
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure your application's basic settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="appName" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            App Name
                          </Label>
                          <Input
                            id="appName"
                            value={formData.general?.appName || ''}
                            onChange={(e) => handleInputChange('general', 'appName', e.target.value)}
                            disabled={!editMode}
                            placeholder="Enter your app name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="supportEmail" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Support Email
                          </Label>
                          <Input
                            id="supportEmail"
                            type="email"
                            value={formData.general?.supportEmail || ''}
                            onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                            disabled={!editMode}
                            placeholder="support@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                              id="currency"
                              value={formData.general?.currency || 'INR'}
                              onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                              disabled={!editMode}
                              maxLength={3}
                              className="uppercase"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Input
                              id="timezone"
                              value={formData.general?.timezone || 'Asia/Kolkata'}
                              onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                              disabled={!editMode}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Features Status</Label>
                          <div className="space-y-3">
                            {Object.entries(config.features).map(([feature, enabled]) => (
                              <div key={feature} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    {enabled ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <X className="h-3 w-3 text-gray-400" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium capitalize">{feature}</span>
                                </div>
                                <Switch
                                  checked={enabled}
                                  onCheckedChange={() => handleToggle('features', feature)}
                                  disabled={!editMode || (feature === 'analytics' && config.subscription.planName === 'free')}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* E-commerce Tab */}
              <TabsContent value="ecommerce" className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>E-commerce Settings</CardTitle>
                        <CardDescription>
                          Configure your online store settings
                        </CardDescription>
                      </div>
                      <Switch
                        checked={config.ecommerce.enabled}
                        onCheckedChange={() => handleToggle('ecommerce', 'enabled')}
                        disabled={!editMode}
                      />
                    </div>
                  </CardHeader>
                  
                  {config.ecommerce.enabled ? (
                    <CardContent className="space-y-6">
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="allowCOD" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Allow Cash on Delivery
                              </Label>
                              <Switch
                                id="allowCOD"
                                checked={formData.ecommerce?.allowCOD}
                                onCheckedChange={(checked) => 
                                  handleInputChange('ecommerce', 'allowCOD', checked)
                                }
                                disabled={!editMode}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="taxPercent" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Tax Percentage (%)
                              </Label>
                              <Input
                                id="taxPercent"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.ecommerce?.taxPercent || 18}
                                onChange={(e) => 
                                  handleInputChange('ecommerce', 'taxPercent', parseInt(e.target.value) || 0)
                                }
                                disabled={!editMode}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="shippingCharge" className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Shipping Charge
                              </Label>
                              <Input
                                id="shippingCharge"
                                type="number"
                                min="0"
                                value={formData.ecommerce?.shippingCharge || 0}
                                onChange={(e) => 
                                  handleInputChange('ecommerce', 'shippingCharge', parseInt(e.target.value) || 0)
                                }
                                disabled={!editMode}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-medium mb-4 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Price Preview
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Product Price</span>
                                <span className="font-medium">₹1,000.00</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax ({formData.ecommerce?.taxPercent || 18}%)</span>
                                <span className="font-medium">
                                  ₹{(1000 * (formData.ecommerce?.taxPercent || 18) / 100).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">
                                  ₹{(formData.ecommerce?.shippingCharge || 0).toFixed(2)}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between text-base font-semibold">
                                <span>Total</span>
                                <span className="text-blue-600">
                                  ₹{(
                                    1000 + 
                                    (1000 * (formData.ecommerce?.taxPercent || 18) / 100) + 
                                    (formData.ecommerce?.shippingCharge || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          E-commerce is currently disabled. Enable it to configure settings.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              {/* Booking Tab */}
              <TabsContent value="booking" className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Booking Settings</CardTitle>
                        <CardDescription>
                          Configure appointment and booking settings
                        </CardDescription>
                      </div>
                      <Switch
                        checked={config.booking.enabled}
                        onCheckedChange={() => handleToggle('booking', 'enabled')}
                        disabled={!editMode}
                      />
                    </div>
                  </CardHeader>
                  
                  {config.booking.enabled ? (
                    <CardContent className="space-y-6">
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="maxBookingsPerDay" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Max Bookings Per Day
                              </Label>
                              <Input
                                id="maxBookingsPerDay"
                                type="number"
                                min="1"
                                max="1000"
                                value={formData.booking?.maxBookingsPerDay || 50}
                                onChange={(e) => 
                                  handleInputChange('booking', 'maxBookingsPerDay', parseInt(e.target.value) || 1)
                                }
                                disabled={!editMode}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cancellationHours" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Cancellation Notice (Hours)
                              </Label>
                              <Input
                                id="cancellationHours"
                                type="number"
                                min="0"
                                max="720"
                                value={formData.booking?.cancellationHours || 24}
                                onChange={(e) => 
                                  handleInputChange('booking', 'cancellationHours', parseInt(e.target.value) || 0)
                                }
                                disabled={!editMode}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="autoApproval" className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Auto-approve Bookings
                              </Label>
                              <Switch
                                id="autoApproval"
                                checked={formData.booking?.autoApproval}
                                onCheckedChange={(checked) => 
                                  handleInputChange('booking', 'autoApproval', checked)
                                }
                                disabled={!editMode}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-medium mb-4">Booking Capacity</h4>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Daily Capacity</span>
                                  <span>0/{formData.booking?.maxBookingsPerDay || 50}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: '0%' }}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Monthly Capacity</span>
                                  <span>0/{config.limits.maxBookingsPerMonth}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-500 transition-all duration-500"
                                    style={{ width: '0%' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Booking system is currently disabled. Enable it to configure settings.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          channel: 'email',
                          icon: Mail,
                          description: 'Receive notifications via email',
                          color: 'text-blue-600',
                          bg: 'bg-blue-50',
                          border: 'border-blue-100'
                        },
                        {
                          channel: 'sms',
                          icon: Phone,
                          description: 'Receive SMS notifications',
                          color: 'text-green-600',
                          bg: 'bg-green-50',
                          border: 'border-green-100'
                        },
                        {
                          channel: 'whatsapp',
                          icon: MessageSquare,
                          description: 'Receive WhatsApp messages',
                          color: 'text-emerald-600',
                          bg: 'bg-emerald-50',
                          border: 'border-emerald-100'
                        }
                      ].map(({ channel, icon: Icon, description, color, bg, border }) => (
                        <Card key={channel} className={`border ${border}`}>
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                              <div className={`p-3 rounded-full ${bg}`}>
                                <Icon className={`h-6 w-6 ${color}`} />
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="font-semibold capitalize">{channel}</h3>
                                <p className="text-sm text-gray-600">{description}</p>
                              </div>
                              
                              <div className="w-full">
                                <Switch
                                  checked={config.notifications[channel]}
                                  onCheckedChange={() => handleToggle('notifications', channel)}
                                  disabled={!editMode || (channel === 'email' && !config.general.supportEmail)}
                                  className="mx-auto"
                                />
                              </div>
                              
                              {channel === 'email' && !config.general.supportEmail && (
                                <Alert variant="destructive" className="mt-4">
                                  <AlertDescription className="text-xs">
                                    Support email required
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Limits Tab */}
              <TabsContent value="limits" className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle>Usage Limits</CardTitle>
                    <CardDescription>
                      Current plan limits and restrictions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          name: 'Max Users',
                          value: config.limits.maxUsers,
                          icon: Users,
                          color: 'text-blue-600',
                          bg: 'bg-blue-50'
                        },
                        {
                          name: 'Max Products',
                          value: config.limits.maxProducts,
                          icon: Package,
                          color: 'text-green-600',
                          bg: 'bg-green-50'
                        },
                        {
                          name: 'Max Bookings/Month',
                          value: config.limits.maxBookingsPerMonth,
                          icon: Calendar,
                          color: 'text-purple-600',
                          bg: 'bg-purple-50'
                        }
                      ].map((limit, index) => (
                        <Card key={index} className="border">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className={`p-3 rounded-full ${limit.bg}`}>
                                <limit.icon className={`h-6 w-6 ${limit.color}`} />
                              </div>
                              <h3 className="text-sm font-medium text-gray-600">{limit.name}</h3>
                              <div className="text-2xl font-bold">{limit.value.toLocaleString()}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Separator />

                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        <h3 className="font-semibold mb-4">Plan Comparison</h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Feature</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Free</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Basic</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Pro</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Enterprise</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { feature: 'Max Users', free: 3, basic: 10, pro: 50, enterprise: 'Unlimited' },
                              { feature: 'Max Products', free: 100, basic: 1000, pro: 5000, enterprise: 100000 },
                              { feature: 'E-commerce', free: '✓', basic: '✓', pro: '✓', enterprise: '✓' },
                              { feature: 'Booking System', free: '✓', basic: '✓', pro: '✓', enterprise: '✓' },
                              { feature: 'Coupons', free: '✗', basic: '✓', pro: '✓', enterprise: '✓' },
                              { feature: 'Analytics', free: '✓', basic: '✓', pro: '✓', enterprise: '✓' },
                              { feature: 'Priority Support', free: '✗', basic: '✗', pro: '✓', enterprise: '✓' }
                            ].map((row, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm">{row.feature}</td>
                                <td className={`text-center py-3 px-4 text-sm ${
                                  config.subscription.planName === 'free' ? 'font-semibold text-blue-600' : ''
                                }`}>{row.free}</td>
                                <td className={`text-center py-3 px-4 text-sm ${
                                  config.subscription.planName === 'basic' ? 'font-semibold text-blue-600' : ''
                                }`}>{row.basic}</td>
                                <td className={`text-center py-3 px-4 text-sm ${
                                  config.subscription.planName === 'pro' ? 'font-semibold text-blue-600' : ''
                                }`}>{row.pro}</td>
                                <td className={`text-center py-3 px-4 text-sm ${
                                  config.subscription.planName === 'enterprise' ? 'font-semibold text-blue-600' : ''
                                }`}>{row.enterprise}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-8 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p>Configuration last updated: {new Date(config.updatedAt).toLocaleDateString()}</p>
              {config.updatedBy && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated by: User #{config.updatedBy}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Tenant ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{tenantId}</code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}