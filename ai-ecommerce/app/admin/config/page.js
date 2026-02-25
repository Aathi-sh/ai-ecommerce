"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import {
    Globe, ShoppingCart, Calendar, Bell,
    Award, Users, CreditCard, Package, Clock, Percent,
    DollarSign, Mail, Phone, MessageSquare, TrendingUp,
    Save, Check, AlertCircle, Loader2, ToggleLeft, ToggleRight,
    Shield, Zap, Settings, Box
} from 'lucide-react';

// ==================== CONSTANTS ====================
const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'features', label: 'Features', icon: Award },
    { id: 'limits', label: 'Limits', icon: Users },
    { id: 'subscription', label: 'Subscription', icon: CreditCard }
];

const PLANS = [
    { value: 'free', label: 'Free', color: '#6B7280' },
    { value: 'basic', label: 'Basic', color: '#3B82F6' },
    { value: 'pro', label: 'Professional', color: '#8B5CF6' },
    { value: 'enterprise', label: 'Enterprise', color: '#10B981' }
];

const CURRENCIES = [
    { value: 'INR', label: '₹ INR (Indian Rupee)' },
    { value: 'USD', label: '$ USD (US Dollar)' },
    { value: 'EUR', label: '€ EUR (Euro)' },
    { value: 'GBP', label: '£ GBP (British Pound)' }
];

const TIMEZONES = [
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles'
];

// ==================== MAIN COMPONENT ====================
export default function ConfigPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    // State management
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [tenantId, setTenantId] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        general: {
            appName: '',
            supportEmail: '',
            currency: 'INR',
            timezone: 'Asia/Kolkata'
        },
        ecommerce: {
            enabled: true,
            allowCOD: true,
            taxPercent: 18,
            shippingCharge: 0
        },
        booking: {
            enabled: true,
            maxBookingsPerDay: 50,
            cancellationHours: 24,
            autoApproval: false
        },
        notifications: {
            email: true,
            sms: false,
            whatsapp: true
        },
        features: {
            coupons: false,
            referrals: false,
            analytics: true
        },
        limits: {
            maxUsers: 5,
            maxProducts: 500,
            maxBookingsPerMonth: 300
        },
        subscription: {
            planName: 'free',
            expiresAt: null,
            isActive: true
        }
    });

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get tenant ID from session
    useEffect(() => {
        if (session?.user?.tenantId) {
            setTenantId(session.user.tenantId);
        } else {
            setTenantId('demo-tenant-id');
        }
    }, [session]);

    // Fetch config data
    useEffect(() => {
        if (tenantId) {
            fetchConfig();
        }
    }, [tenantId]);

    // ==================== API FUNCTIONS ====================
    
    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/config?tenantId=${tenantId}&includeFeatures=true`);
            const data = await res.json();
            
            if (data.success) {
                setConfig(data.data);
                setFormData(prev => ({
                    ...prev,
                    ...data.data,
                    general: { ...prev.general, ...data.data.general },
                    ecommerce: { ...prev.ecommerce, ...data.data.ecommerce },
                    booking: { ...prev.booking, ...data.data.booking },
                    notifications: { ...prev.notifications, ...data.data.notifications },
                    features: { ...prev.features, ...data.data.features },
                    limits: { ...prev.limits, ...data.data.limits },
                    subscription: { ...prev.subscription, ...data.data.subscription }
                }));
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        if (!validateForm()) return;
        
        setSaving(true);
        setSuccessMessage('');
        setErrors({});
        
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    ...formData,
                    updatedBy: session?.user?.id
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                setConfig(data.data);
                setSuccessMessage('Configuration saved successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                }
            }
        } catch (error) {
            console.error('Error saving config:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleFeature = async (featureName) => {
        try {
            const res = await fetch('/api/config', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    operation: 'toggleFeature',
                    data: {
                        featureName,
                        updatedBy: session?.user?.id
                    }
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                setConfig(data.data);
                setFormData(prev => ({
                    ...prev,
                    ...data.data
                }));
                setSuccessMessage(`Feature ${featureName} toggled!`);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error toggling feature:', error);
        }
    };

    const updatePlan = async (planName) => {
        try {
            const res = await fetch('/api/config', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    operation: 'updatePlan',
                    data: {
                        planName,
                        updatedBy: session?.user?.id
                    }
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                setConfig(data.data);
                setFormData(prev => ({
                    ...prev,
                    ...data.data
                }));
                setSuccessMessage(`Plan updated to ${planName}!`);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating plan:', error);
        }
    };

    // ==================== VALIDATION ====================
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.general?.appName?.trim()) {
            newErrors.appName = 'App name is required';
        }
        
        if (formData.general?.supportEmail && 
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.general.supportEmail)) {
            newErrors.supportEmail = 'Enter a valid email';
        }
        
        if (formData.ecommerce?.taxPercent < 0 || formData.ecommerce?.taxPercent > 100) {
            newErrors.taxPercent = 'Tax must be 0-100';
        }
        
        if (formData.ecommerce?.shippingCharge < 0) {
            newErrors.shippingCharge = 'Shipping cannot be negative';
        }
        
        if (formData.booking?.maxBookingsPerDay < 1) {
            newErrors.maxBookingsPerDay = 'At least 1 booking required';
        }
        
        if (formData.booking?.cancellationHours < 0) {
            newErrors.cancellationHours = 'Hours cannot be negative';
        }
        
        if (formData.limits?.maxUsers < 1) {
            newErrors.maxUsers = 'At least 1 user required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ==================== HANDLERS ====================
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: type === 'checkbox' ? checked : 
                             type === 'number' ? parseFloat(value) || 0 : value
                }
            }));
        }
        
        // Clear error
        const errorKey = name.split('.')[1] || name;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    const handlePlanChange = (plan) => {
        if (plan !== formData.subscription.planName) {
            if (confirm(`Change to ${plan} plan?`)) {
                updatePlan(plan);
            }
        }
    };

    // ==================== RENDER FUNCTIONS ====================
    
    const renderGeneralTab = () => (
        <div className="form-section">
            <h2 className="form-section-title">General Settings</h2>
            <p className="section-description">
                Configure basic application settings and preferences.
            </p>
            
            <div className="form-grid">
                <div className="form-group full-width">
                    <label className="form-label">
                        Application Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="general.appName"
                        value={formData.general?.appName}
                        onChange={handleInputChange}
                        className={`form-input ${errors.appName ? 'input-error' : ''}`}
                        placeholder="e.g., My Store"
                    />
                    {errors.appName && (
                        <p className="form-error">{errors.appName}</p>
                    )}
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Support Email</label>
                    <input
                        type="email"
                        name="general.supportEmail"
                        value={formData.general?.supportEmail}
                        onChange={handleInputChange}
                        className={`form-input ${errors.supportEmail ? 'input-error' : ''}`}
                        placeholder="support@example.com"
                    />
                    {errors.supportEmail && (
                        <p className="form-error">{errors.supportEmail}</p>
                    )}
                    <small className="input-hint">
                        Used for customer support and notifications
                    </small>
                </div>

                <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                        name="general.currency"
                        value={formData.general?.currency}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        {CURRENCIES.map(currency => (
                            <option key={currency.value} value={currency.value}>
                                {currency.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                        name="general.timezone"
                        value={formData.general?.timezone}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        {TIMEZONES.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="info-box">
                <Globe size={20} />
                <div>
                    <strong>Note:</strong> These settings affect how dates, times, and currencies are displayed.
                </div>
            </div>
        </div>
    );

    const renderEcommerceTab = () => (
        <div className="form-section">
            <h2 className="form-section-title">E-Commerce Settings</h2>
            <p className="section-description">
                Configure your online store settings and payment options.
            </p>
            
            <div className="form-grid">
                <div className="form-group checkbox-group full-width">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="ecommerce.enabled"
                            checked={formData.ecommerce?.enabled}
                            onChange={handleInputChange}
                        />
                        <span>Enable E-Commerce Module</span>
                    </label>
                </div>

                <div className="form-group checkbox-group full-width">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="ecommerce.allowCOD"
                            checked={formData.ecommerce?.allowCOD}
                            onChange={handleInputChange}
                        />
                        <span>Allow Cash on Delivery</span>
                    </label>
                </div>

                <div className="form-group">
                    <label className="form-label">Tax Percentage (%)</label>
                    <input
                        type="number"
                        name="ecommerce.taxPercent"
                        value={formData.ecommerce?.taxPercent}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className={`form-input ${errors.taxPercent ? 'input-error' : ''}`}
                    />
                    {errors.taxPercent && (
                        <p className="form-error">{errors.taxPercent}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Shipping Charge (₹)</label>
                    <input
                        type="number"
                        name="ecommerce.shippingCharge"
                        value={formData.ecommerce?.shippingCharge}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`form-input ${errors.shippingCharge ? 'input-error' : ''}`}
                    />
                    {errors.shippingCharge && (
                        <p className="form-error">{errors.shippingCharge}</p>
                    )}
                </div>
            </div>

            <div className="info-box">
                <ShoppingCart size={20} />
                <div>
                    <strong>Tip:</strong> Enable COD for customers who prefer to pay on delivery.
                </div>
            </div>
        </div>
    );

    const renderBookingTab = () => (
        <div className="form-section">
            <h2 className="form-section-title">Booking Settings</h2>
            <p className="section-description">
                Configure booking and appointment settings.
            </p>
            
            <div className="form-grid">
                <div className="form-group checkbox-group full-width">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="booking.enabled"
                            checked={formData.booking?.enabled}
                            onChange={handleInputChange}
                        />
                        <span>Enable Booking Module</span>
                    </label>
                </div>

                <div className="form-group checkbox-group full-width">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="booking.autoApproval"
                            checked={formData.booking?.autoApproval}
                            onChange={handleInputChange}
                        />
                        <span>Auto-approve bookings</span>
                    </label>
                </div>

                <div className="form-group">
                    <label className="form-label">Max Bookings Per Day</label>
                    <input
                        type="number"
                        name="booking.maxBookingsPerDay"
                        value={formData.booking?.maxBookingsPerDay}
                        onChange={handleInputChange}
                        min="1"
                        className={`form-input ${errors.maxBookingsPerDay ? 'input-error' : ''}`}
                    />
                    {errors.maxBookingsPerDay && (
                        <p className="form-error">{errors.maxBookingsPerDay}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Cancellation Hours</label>
                    <input
                        type="number"
                        name="booking.cancellationHours"
                        value={formData.booking?.cancellationHours}
                        onChange={handleInputChange}
                        min="0"
                        className={`form-input ${errors.cancellationHours ? 'input-error' : ''}`}
                    />
                    {errors.cancellationHours && (
                        <p className="form-error">{errors.cancellationHours}</p>
                    )}
                </div>
            </div>

            <div className="info-box">
                <Calendar size={20} />
                <div>
                    <strong>Note:</strong> Set cancellation hours to 0 for no-cancellation policy.
                </div>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="form-section">
            <h2 className="form-section-title">Notification Settings</h2>
            <p className="section-description">
                Configure which notification channels are enabled.
            </p>
            
            <div className="notifications-grid">
                <div className="notification-card">
                    <Mail size={24} className="notification-icon" />
                    <div className="notification-info">
                        <h3>Email Notifications</h3>
                        <p>Order confirmations and updates via email</p>
                    </div>
                    <button
                        onClick={() => toggleFeature('email')}
                        className={`toggle-button ${formData.notifications?.email ? 'active' : ''}`}
                    >
                        {formData.notifications?.email ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>

                <div className="notification-card">
                    <Phone size={24} className="notification-icon" />
                    <div className="notification-info">
                        <h3>SMS Notifications</h3>
                        <p>Order updates via SMS (charges may apply)</p>
                    </div>
                    <button
                        onClick={() => toggleFeature('sms')}
                        className={`toggle-button ${formData.notifications?.sms ? 'active' : ''}`}
                    >
                        {formData.notifications?.sms ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>

                <div className="notification-card">
                    <MessageSquare size={24} className="notification-icon" />
                    <div className="notification-info">
                        <h3>WhatsApp Notifications</h3>
                        <p>Updates via WhatsApp Business API</p>
                    </div>
                    <button
                        onClick={() => toggleFeature('whatsapp')}
                        className={`toggle-button ${formData.notifications?.whatsapp ? 'active' : ''}`}
                    >
                        {formData.notifications?.whatsapp ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>
            </div>

            <div className="info-box">
                <Bell size={20} />
                <div>
                    <strong>Tip:</strong> Enable multiple channels to ensure customers never miss updates.
                </div>
            </div>
        </div>
    );

    const renderFeaturesTab = () => (
        <div className="form-section">
            <h2 className="form-section-title">Feature Management</h2>
            <p className="section-description">
                Enable or disable advanced features based on your plan.
            </p>
            
            <div className="features-grid">
                <div className="feature-card">
                    <Percent size={24} className="feature-icon" />
                    <h3>Coupons & Discounts</h3>
                    <p className="feature-description">
                        Create and manage discount coupons. Available in Basic plan+.
                    </p>
                    <div className="feature-status">
                        <span className={`plan-badge ${formData.features?.coupons ? 'active' : 'inactive'}`}>
                            {formData.features?.coupons ? 'Active' : 'Inactive'}
                        </span>
                        <button
                            onClick={() => toggleFeature('coupons')}
                            className={`toggle-switch ${formData.features?.coupons ? 'active' : ''}`}
                            disabled={!formData.features?.coupons && formData.subscription?.planName === 'free'}
                        >
                            <span className="toggle-handle"></span>
                        </button>
                    </div>
                </div>

                <div className="feature-card">
                    <Users size={24} className="feature-icon" />
                    <h3>Referral Program</h3>
                    <p className="feature-description">
                        Customers can refer friends and earn rewards. Available in Pro plan+.
                    </p>
                    <div className="feature-status">
                        <span className={`plan-badge ${formData.features?.referrals ? 'active' : 'inactive'}`}>
                            {formData.features?.referrals ? 'Active' : 'Inactive'}
                        </span>
                        <button
                            onClick={() => toggleFeature('referrals')}
                            className={`toggle-switch ${formData.features?.referrals ? 'active' : ''}`}
                            disabled={!formData.features?.referrals && formData.subscription?.planName === 'free'}
                        >
                            <span className="toggle-handle"></span>
                        </button>
                    </div>
                </div>

                <div className="feature-card">
                    <TrendingUp size={24} className="feature-icon" />
                    <h3>Advanced Analytics</h3>
                    <p className="feature-description">
                        Access detailed reports and insights about your business.
                    </p>
                    <div className="feature-status">
                        <span className={`plan-badge ${formData.features?.analytics ? 'active' : 'inactive'}`}>
                            {formData.features?.analytics ? 'Active' : 'Inactive'}
                        </span>
                        <button
                            onClick={() => toggleFeature('analytics')}
                            className={`toggle-switch ${formData.features?.analytics ? 'active' : ''}`}
                        >
                            <span className="toggle-handle"></span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="info-box">
                <Award size={20} />
                <div>
                    <strong>Note:</strong> Feature availability depends on your subscription plan.
                </div>
            </div>
        </div>
    );

    const renderLimitsTab = () => (
        <div className="form-section">
            <h2 className="form-section-title">Usage Limits</h2>
            <p className="section-description">
                Set maximum limits for various resources based on your plan.
            </p>
            
            <div className="limits-grid">
                <div className="limit-card">
                    <Users size={24} className="limit-icon" />
                    <h3>Maximum Users</h3>
                    <div className="limit-input-group">
                        <input
                            type="number"
                            name="limits.maxUsers"
                            value={formData.limits?.maxUsers}
                            onChange={handleInputChange}
                            min="1"
                            className={`limit-input ${errors.maxUsers ? 'input-error' : ''}`}
                        />
                        <span className="limit-unit">users</span>
                    </div>
                    {errors.maxUsers && <p className="form-error">{errors.maxUsers}</p>}
                </div>

                <div className="limit-card">
                    <Package size={24} className="limit-icon" />
                    <h3>Maximum Products</h3>
                    <div className="limit-input-group">
                        <input
                            type="number"
                            name="limits.maxProducts"
                            value={formData.limits?.maxProducts}
                            onChange={handleInputChange}
                            min="0"
                            className={`limit-input ${errors.maxProducts ? 'input-error' : ''}`}
                        />
                        <span className="limit-unit">products</span>
                    </div>
                    {errors.maxProducts && <p className="form-error">{errors.maxProducts}</p>}
                </div>

                <div className="limit-card">
                    <Calendar size={24} className="limit-icon" />
                    <h3>Monthly Bookings</h3>
                    <div className="limit-input-group">
                        <input
                            type="number"
                            name="limits.maxBookingsPerMonth"
                            value={formData.limits?.maxBookingsPerMonth}
                            onChange={handleInputChange}
                            min="0"
                            className={`limit-input ${errors.maxBookingsPerMonth ? 'input-error' : ''}`}
                        />
                        <span className="limit-unit">bookings/mo</span>
                    </div>
                    {errors.maxBookingsPerMonth && <p className="form-error">{errors.maxBookingsPerMonth}</p>}
                </div>
            </div>

            <div className="info-box">
                <Shield size={20} />
                <div>
                    <strong>Important:</strong> These limits are enforced across your entire account.
                </div>
            </div>
        </div>
    );

    const renderSubscriptionTab = () => (
        <div className="form-section">
            <h2 className="form-section-title">Subscription Plan</h2>
            <p className="section-description">
                Manage your subscription plan and view current limits.
            </p>
            
            <div className="plans-grid">
                {PLANS.map(plan => (
                    <div
                        key={plan.value}
                        className={`plan-card ${formData.subscription?.planName === plan.value ? 'active' : ''}`}
                        onClick={() => handlePlanChange(plan.value)}
                    >
                        <div className="plan-header" style={{ borderColor: plan.color }}>
                            <h3>{plan.label}</h3>
                        </div>
                        <div className="plan-features">
                            <ul>
                                <li>
                                    <Check size={16} />
                                    <span>Up to {plan.value === 'free' ? '3' : plan.value === 'basic' ? '10' : plan.value === 'pro' ? '50' : '10,000'} users</span>
                                </li>
                                <li>
                                    <Check size={16} />
                                    <span>Up to {plan.value === 'free' ? '100' : plan.value === 'basic' ? '1000' : plan.value === 'pro' ? '5000' : '100,000'} products</span>
                                </li>
                                <li>
                                    <Check size={16} />
                                    <span>{plan.value === 'free' ? '100' : plan.value === 'basic' ? '500' : plan.value === 'pro' ? '2000' : '100,000'} bookings/month</span>
                                </li>
                                {plan.value !== 'free' && (
                                    <li>
                                        <Check size={16} />
                                        <span>Coupons & Discounts</span>
                                    </li>
                                )}
                                {plan.value === 'pro' && (
                                    <li>
                                        <Check size={16} />
                                        <span>Referral Program</span>
                                    </li>
                                )}
                                {plan.value === 'enterprise' && (
                                    <li>
                                        <Check size={16} />
                                        <span>Priority Support</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="plan-footer">
                            {formData.subscription?.planName === plan.value ? (
                                <span className="current-plan-badge">Current Plan</span>
                            ) : (
                                <button className="upgrade-button">
                                    {plan.value === 'free' ? 'Downgrade' : 'Upgrade'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {formData.subscription?.expiresAt && (
                <div className="subscription-status">
                    <div className="status-item">
                        <span className="status-label">Plan:</span>
                        <span className="status-value">
                            {PLANS.find(p => p.value === formData.subscription.planName)?.label}
                        </span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Expires:</span>
                        <span className="status-value">
                            {new Date(formData.subscription.expiresAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Status:</span>
                        <span className={`status-badge ${formData.subscription.isActive ? 'active' : 'inactive'}`}>
                            {formData.subscription.isActive ? 'Active' : 'Expired'}
                        </span>
                    </div>
                </div>
            )}

            <div className="info-box">
                <Zap size={20} />
                <div>
                    <strong>Tip:</strong> Upgrade your plan to unlock more features and higher limits.
                </div>
            </div>
        </div>
    );

    // ==================== MAIN RENDER ====================
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading configuration...</p>
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 400px;
                        gap: 16px;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid #e5e7eb;
                        border-top: 3px solid #3b82f6;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Configuration | LFMS</title>
                <meta name="description" content="Manage your application configuration and settings" />
            </Head>

            <div className="config-container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Configuration</h1>
                    <p className="page-subtitle">
                        Manage your application settings, features, and subscription
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="success-message">
                        <Check size={20} />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Steps/Tabs - Same as Company Profile */}
                <div className="steps-container">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <div
                                key={tab.id}
                                className={`step-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <div className="step-icon">
                                    <Icon size={isMobile ? 20 : 24} />
                                </div>
                                <div className="step-name">{tab.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Form Card */}
                <div className="form-card">
                    {activeTab === 'general' && renderGeneralTab()}
                    {activeTab === 'ecommerce' && renderEcommerceTab()}
                    {activeTab === 'booking' && renderBookingTab()}
                    {activeTab === 'notifications' && renderNotificationsTab()}
                    {activeTab === 'features' && renderFeaturesTab()}
                    {activeTab === 'limits' && renderLimitsTab()}
                    {activeTab === 'subscription' && renderSubscriptionTab()}

                    {/* Save Button */}
                    <div className="form-navigation">
                        <button
                            type="button"
                            onClick={saveConfig}
                            disabled={saving}
                            className="submit-button"
                        >
                            {saving ? (
                                <>
                                    <span className="spinner"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* ==================== CONTAINER STYLES ==================== */
                .config-container {
                    padding: 1.5rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                }

                /* ==================== PAGE HEADER ==================== */
                .page-header {
                    margin-bottom: 2rem;
                }

                .page-title {
                    font-size: clamp(1.5rem, 3vw, 2rem);
                    font-weight: bold;
                    color: #1f2937;
                    margin: 0;
                }

                .page-subtitle {
                    margin-top: 0.5rem;
                    color: #6b7280;
                    font-size: 0.95rem;
                }

                /* ==================== SUCCESS MESSAGE ==================== */
                .success-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #d1fae5;
                    color: #065f46;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 0.95rem;
                    font-weight: 500;
                }

                /* ==================== STEPS/TABS ==================== */
                .steps-container {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow-x: auto;
                }

                .step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                    min-width: 80px;
                }

                .step-item.active {
                    opacity: 1;
                }

                .step-icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    background: #f3f4f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    transition: all 0.3s ease;
                }

                .step-item.active .step-icon {
                    background: #3b82f6;
                    color: white;
                }

                .step-name {
                    font-size: 0.75rem;
                    font-weight: 500;
                    text-align: center;
                }

                /* ==================== FORM CARD ==================== */
                .form-card {
                    background: white;
                    border-radius: 0.75rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .form-section {
                    padding: 1.5rem;
                }

                .form-section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .section-description {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }

                /* ==================== FORM GRID ==================== */
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                @media (min-width: 640px) {
                    .form-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 0.375rem;
                }

                .required {
                    color: #ef4444;
                    margin-left: 4px;
                }

                .form-input,
                .form-select {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    transition: all 0.15s ease;
                    background: white;
                }

                .form-input:focus,
                .form-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .input-error {
                    border-color: #ef4444;
                }

                .form-error {
                    margin-top: 0.25rem;
                    font-size: 0.75rem;
                    color: #ef4444;
                }

                .input-hint {
                    font-size: 0.7rem;
                    color: #9ca3af;
                    margin-top: 4px;
                    display: block;
                }

                .checkbox-group {
                    display: flex;
                    align-items: center;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: #374151;
                }

                .checkbox-label input[type="checkbox"] {
                    width: 1rem;
                    height: 1rem;
                    cursor: pointer;
                }

                /* ==================== NOTIFICATIONS ==================== */
                .notifications-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .notification-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                }

                .notification-icon {
                    flex-shrink: 0;
                    color: #4f46e5;
                }

                .notification-info {
                    flex: 1;
                }

                .notification-info h3 {
                    font-size: 0.938rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 4px 0;
                }

                .notification-info p {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin: 0;
                }

                .toggle-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #9ca3af;
                    transition: color 0.2s ease;
                }

                .toggle-button.active {
                    color: #4f46e5;
                }

                /* ==================== FEATURES ==================== */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .feature-card {
                    padding: 1.5rem;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                }

                .feature-icon {
                    margin-bottom: 1rem;
                    color: #4f46e5;
                }

                .feature-card h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .feature-description {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }

                .feature-status {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .plan-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .plan-badge.active {
                    background: #d1fae5;
                    color: #065f46;
                }

                .plan-badge.inactive {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .toggle-switch {
                    width: 48px;
                    height: 24px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    border: none;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .toggle-switch.active {
                    background: #4f46e5;
                }

                .toggle-switch .toggle-handle {
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s ease;
                }

                .toggle-switch.active .toggle-handle {
                    transform: translateX(24px);
                }

                /* ==================== LIMITS ==================== */
                .limits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .limit-card {
                    padding: 1.5rem;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    text-align: center;
                }

                .limit-icon {
                    margin-bottom: 1rem;
                    color: #4f46e5;
                }

                .limit-card h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .limit-input-group {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .limit-input {
                    width: 100px;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    font-size: 1rem;
                    text-align: center;
                }

                .limit-unit {
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                /* ==================== PLANS ==================== */
                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .plan-card {
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .plan-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                }

                .plan-card.active {
                    border-color: #4f46e5;
                }

                .plan-header {
                    padding: 1rem;
                    border-bottom: 2px solid;
                    text-align: center;
                }

                .plan-header h3 {
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin: 0;
                }

                .plan-features {
                    padding: 1rem;
                }

                .plan-features ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .plan-features li {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                    color: #4b5563;
                }

                .plan-features li svg {
                    color: #10b981;
                    flex-shrink: 0;
                }

                .plan-footer {
                    padding: 1rem;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                }

                .current-plan-badge {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: #e5e7eb;
                    color: #6b7280;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .upgrade-button {
                    width: 100%;
                    padding: 0.5rem;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .upgrade-button:hover {
                    background: #4338ca;
                }

                .subscription-status {
                    display: flex;
                    gap: 2rem;
                    padding: 1rem;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                .status-value {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-badge.active {
                    background: #d1fae5;
                    color: #065f46;
                }

                .status-badge.inactive {
                    background: #fee2e2;
                    color: #991b1b;
                }

                /* ==================== INFO BOX ==================== */
                .info-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem;
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    border-radius: 0.5rem;
                    color: #1e40af;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    margin-top: 1.5rem;
                }

                /* ==================== FORM NAVIGATION ==================== */
                .form-navigation {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }

                .submit-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1.5rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .submit-button:hover {
                    background: #2563eb;
                }

                .submit-button:disabled {
                    background: #93c5fd;
                    cursor: not-allowed;
                }

                /* ==================== SPINNER ==================== */
                .spinner {
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* ==================== MOBILE OPTIMIZATIONS ==================== */
                @media (max-width: 768px) {
                    .config-container {
                        padding: 1rem;
                    }
                    
                    .steps-container {
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                    
                    .step-item {
                        min-width: calc(33.33% - 0.5rem);
                    }
                    
                    .form-section {
                        padding: 1rem;
                    }
                    
                    .form-navigation {
                        flex-direction: column;
                    }
                    
                    .form-navigation button {
                        width: 100%;
                    }
                    
                    .subscription-status {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }

                @media (max-width: 640px) {
                    .step-item {
                        min-width: calc(50% - 0.5rem);
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .notification-card {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .limit-input-group {
                        flex-direction: column;
                    }
                }
            `}</style>
        </>
    );
}
//Hr.&LIv+jfYi2.iVELP8