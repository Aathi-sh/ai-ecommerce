// // "use client";

// // import React, { useState, useEffect } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { useSession } from 'next-auth/react';
// // import Head from 'next/head';
// // import {
// //     Globe, ShoppingCart, Calendar, Bell,
// //     Award, Users, CreditCard, Package, Clock, Percent,
// //     DollarSign, Mail, Phone, MessageSquare, TrendingUp,
// //     Save, Check, AlertCircle, Loader2, ToggleLeft, ToggleRight,
// //     Shield, Zap, Settings, Box
// // } from 'lucide-react';

// // // ==================== CONSTANTS ====================
// // const TABS = [
// //     { id: 'general', label: 'General', icon: Globe },
// //     { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
// //     { id: 'booking', label: 'Booking', icon: Calendar },
// //     { id: 'notifications', label: 'Notifications', icon: Bell },
// //     { id: 'features', label: 'Features', icon: Award },
// //     { id: 'limits', label: 'Limits', icon: Users },
// //     { id: 'subscription', label: 'Subscription', icon: CreditCard }
// // ];

// // const PLANS = [
// //     { value: 'free', label: 'Free', color: '#6B7280' },
// //     { value: 'basic', label: 'Basic', color: '#3B82F6' },
// //     { value: 'pro', label: 'Professional', color: '#8B5CF6' },
// //     { value: 'enterprise', label: 'Enterprise', color: '#10B981' }
// // ];

// // const CURRENCIES = [
// //     { value: 'INR', label: '₹ INR (Indian Rupee)' },
// //     { value: 'USD', label: '$ USD (US Dollar)' },
// //     { value: 'EUR', label: '€ EUR (Euro)' },
// //     { value: 'GBP', label: '£ GBP (British Pound)' }
// // ];

// // const TIMEZONES = [
// //     'Asia/Kolkata',
// //     'Asia/Dubai',
// //     'Asia/Singapore',
// //     'Asia/Tokyo',
// //     'Australia/Sydney',
// //     'Europe/London',
// //     'Europe/Paris',
// //     'America/New_York',
// //     'America/Chicago',
// //     'America/Los_Angeles'
// // ];

// // // ==================== MAIN COMPONENT ====================
// // export default function ConfigPage() {
// //     const router = useRouter();
// //     const { data: session, status } = useSession();
    
// //     // State management
// //     const [activeTab, setActiveTab] = useState('general');
// //     const [loading, setLoading] = useState(true);
// //     const [saving, setSaving] = useState(false);
// //     const [config, setConfig] = useState(null);
// //     const [errors, setErrors] = useState({});
// //     const [successMessage, setSuccessMessage] = useState('');
// //     const [isMobile, setIsMobile] = useState(false);
// //     const [tenantId, setTenantId] = useState('');
    
// //     // Form state
// //     const [formData, setFormData] = useState({
// //         general: {
// //             appName: '',
// //             supportEmail: '',
// //             currency: 'INR',
// //             timezone: 'Asia/Kolkata'
// //         },
// //         ecommerce: {
// //             enabled: true,
// //             allowCOD: true,
// //             taxPercent: 18,
// //             shippingCharge: 0
// //         },
// //         booking: {
// //             enabled: true,
// //             maxBookingsPerDay: 50,
// //             cancellationHours: 24,
// //             autoApproval: false
// //         },
// //         notifications: {
// //             email: true,
// //             sms: false,
// //             whatsapp: true
// //         },
// //         features: {
// //             coupons: false,
// //             referrals: false,
// //             analytics: true
// //         },
// //         limits: {
// //             maxUsers: 5,
// //             maxProducts: 500,
// //             maxBookingsPerMonth: 300
// //         },
// //         subscription: {
// //             planName: 'free',
// //             expiresAt: null,
// //             isActive: true
// //         }
// //     });

// //     // Mobile detection
// //     useEffect(() => {
// //         const checkMobile = () => {
// //             setIsMobile(window.innerWidth < 768);
// //         };
        
// //         checkMobile();
// //         window.addEventListener('resize', checkMobile);
// //         return () => window.removeEventListener('resize', checkMobile);
// //     }, []);

// //     // Get tenant ID from session
// //     useEffect(() => {
// //         if (session?.user?.tenantId) {
// //             setTenantId(session.user.tenantId);
// //         } else {
// //             setTenantId('demo-tenant-id');
// //         }
// //     }, [session]);

// //     // Fetch config data
// //     useEffect(() => {
// //         if (tenantId) {
// //             fetchConfig();
// //         }
// //     }, [tenantId]);

// //     // ==================== API FUNCTIONS ====================
    
// //     const fetchConfig = async () => {
// //         try {
// //             setLoading(true);
// //             const res = await fetch(`/api/config?tenantId=${tenantId}&includeFeatures=true`);
// //             const data = await res.json();
            
// //             if (data.success) {
// //                 setConfig(data.data);
// //                 setFormData(prev => ({
// //                     ...prev,
// //                     ...data.data,
// //                     general: { ...prev.general, ...data.data.general },
// //                     ecommerce: { ...prev.ecommerce, ...data.data.ecommerce },
// //                     booking: { ...prev.booking, ...data.data.booking },
// //                     notifications: { ...prev.notifications, ...data.data.notifications },
// //                     features: { ...prev.features, ...data.data.features },
// //                     limits: { ...prev.limits, ...data.data.limits },
// //                     subscription: { ...prev.subscription, ...data.data.subscription }
// //                 }));
// //             }
// //         } catch (error) {
// //             console.error('Error fetching config:', error);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const saveConfig = async () => {
// //         if (!validateForm()) return;
        
// //         setSaving(true);
// //         setSuccessMessage('');
// //         setErrors({});
        
// //         try {
// //             const res = await fetch('/api/config', {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({
// //                     tenantId,
// //                     ...formData,
// //                     updatedBy: session?.user?.id
// //                 })
// //             });
            
// //             const data = await res.json();
            
// //             if (data.success) {
// //                 setConfig(data.data);
// //                 setSuccessMessage('Configuration saved successfully!');
// //                 setTimeout(() => setSuccessMessage(''), 3000);
// //             } else {
// //                 if (data.errors) {
// //                     setErrors(data.errors);
// //                 }
// //             }
// //         } catch (error) {
// //             console.error('Error saving config:', error);
// //         } finally {
// //             setSaving(false);
// //         }
// //     };

// //     const toggleFeature = async (featureName) => {
// //         try {
// //             const res = await fetch('/api/config', {
// //                 method: 'PATCH',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({
// //                     tenantId,
// //                     operation: 'toggleFeature',
// //                     data: {
// //                         featureName,
// //                         updatedBy: session?.user?.id
// //                     }
// //                 })
// //             });
            
// //             const data = await res.json();
            
// //             if (data.success) {
// //                 setConfig(data.data);
// //                 setFormData(prev => ({
// //                     ...prev,
// //                     ...data.data
// //                 }));
// //                 setSuccessMessage(`Feature ${featureName} toggled!`);
// //                 setTimeout(() => setSuccessMessage(''), 3000);
// //             }
// //         } catch (error) {
// //             console.error('Error toggling feature:', error);
// //         }
// //     };

// //     const updatePlan = async (planName) => {
// //         try {
// //             const res = await fetch('/api/config', {
// //                 method: 'PATCH',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({
// //                     tenantId,
// //                     operation: 'updatePlan',
// //                     data: {
// //                         planName,
// //                         updatedBy: session?.user?.id
// //                     }
// //                 })
// //             });
            
// //             const data = await res.json();
            
// //             if (data.success) {
// //                 setConfig(data.data);
// //                 setFormData(prev => ({
// //                     ...prev,
// //                     ...data.data
// //                 }));
// //                 setSuccessMessage(`Plan updated to ${planName}!`);
// //                 setTimeout(() => setSuccessMessage(''), 3000);
// //             }
// //         } catch (error) {
// //             console.error('Error updating plan:', error);
// //         }
// //     };

// //     // ==================== VALIDATION ====================
    
// //     const validateForm = () => {
// //         const newErrors = {};
        
// //         if (!formData.general?.appName?.trim()) {
// //             newErrors.appName = 'App name is required';
// //         }
        
// //         if (formData.general?.supportEmail && 
// //             !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.general.supportEmail)) {
// //             newErrors.supportEmail = 'Enter a valid email';
// //         }
        
// //         if (formData.ecommerce?.taxPercent < 0 || formData.ecommerce?.taxPercent > 100) {
// //             newErrors.taxPercent = 'Tax must be 0-100';
// //         }
        
// //         if (formData.ecommerce?.shippingCharge < 0) {
// //             newErrors.shippingCharge = 'Shipping cannot be negative';
// //         }
        
// //         if (formData.booking?.maxBookingsPerDay < 1) {
// //             newErrors.maxBookingsPerDay = 'At least 1 booking required';
// //         }
        
// //         if (formData.booking?.cancellationHours < 0) {
// //             newErrors.cancellationHours = 'Hours cannot be negative';
// //         }
        
// //         if (formData.limits?.maxUsers < 1) {
// //             newErrors.maxUsers = 'At least 1 user required';
// //         }
        
// //         setErrors(newErrors);
// //         return Object.keys(newErrors).length === 0;
// //     };

// //     // ==================== HANDLERS ====================
    
// //     const handleInputChange = (e) => {
// //         const { name, value, type, checked } = e.target;
        
// //         if (name.includes('.')) {
// //             const [section, field] = name.split('.');
// //             setFormData(prev => ({
// //                 ...prev,
// //                 [section]: {
// //                     ...prev[section],
// //                     [field]: type === 'checkbox' ? checked : 
// //                              type === 'number' ? parseFloat(value) || 0 : value
// //                 }
// //             }));
// //         }
        
// //         // Clear error
// //         const errorKey = name.split('.')[1] || name;
// //         if (errors[errorKey]) {
// //             setErrors(prev => ({ ...prev, [errorKey]: '' }));
// //         }
// //     };

// //     const handlePlanChange = (plan) => {
// //         if (plan !== formData.subscription.planName) {
// //             if (confirm(`Change to ${plan} plan?`)) {
// //                 updatePlan(plan);
// //             }
// //         }
// //     };

// //     // ==================== RENDER FUNCTIONS ====================
    
// //     const renderGeneralTab = () => (
// //         <div className="form-section">
// //             <h2 className="form-section-title">General Settings</h2>
// //             <p className="section-description">
// //                 Configure basic application settings and preferences.
// //             </p>
            
// //             <div className="form-grid">
// //                 <div className="form-group full-width">
// //                     <label className="form-label">
// //                         Application Name <span className="required">*</span>
// //                     </label>
// //                     <input
// //                         type="text"
// //                         name="general.appName"
// //                         value={formData.general?.appName}
// //                         onChange={handleInputChange}
// //                         className={`form-input ${errors.appName ? 'input-error' : ''}`}
// //                         placeholder="e.g., My Store"
// //                     />
// //                     {errors.appName && (
// //                         <p className="form-error">{errors.appName}</p>
// //                     )}
// //                 </div>

// //                 <div className="form-group full-width">
// //                     <label className="form-label">Support Email</label>
// //                     <input
// //                         type="email"
// //                         name="general.supportEmail"
// //                         value={formData.general?.supportEmail}
// //                         onChange={handleInputChange}
// //                         className={`form-input ${errors.supportEmail ? 'input-error' : ''}`}
// //                         placeholder="support@example.com"
// //                     />
// //                     {errors.supportEmail && (
// //                         <p className="form-error">{errors.supportEmail}</p>
// //                     )}
// //                     <small className="input-hint">
// //                         Used for customer support and notifications
// //                     </small>
// //                 </div>

// //                 <div className="form-group">
// //                     <label className="form-label">Currency</label>
// //                     <select
// //                         name="general.currency"
// //                         value={formData.general?.currency}
// //                         onChange={handleInputChange}
// //                         className="form-select"
// //                     >
// //                         {CURRENCIES.map(currency => (
// //                             <option key={currency.value} value={currency.value}>
// //                                 {currency.label}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 </div>

// //                 <div className="form-group">
// //                     <label className="form-label">Timezone</label>
// //                     <select
// //                         name="general.timezone"
// //                         value={formData.general?.timezone}
// //                         onChange={handleInputChange}
// //                         className="form-select"
// //                     >
// //                         {TIMEZONES.map(tz => (
// //                             <option key={tz} value={tz}>{tz}</option>
// //                         ))}
// //                     </select>
// //                 </div>
// //             </div>

// //             <div className="info-box">
// //                 <Globe size={20} />
// //                 <div>
// //                     <strong>Note:</strong> These settings affect how dates, times, and currencies are displayed.
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     const renderEcommerceTab = () => (
// //         <div className="form-section">
// //             <h2 className="form-section-title">E-Commerce Settings</h2>
// //             <p className="section-description">
// //                 Configure your online store settings and payment options.
// //             </p>
            
// //             <div className="form-grid">
// //                 <div className="form-group checkbox-group full-width">
// //                     <label className="checkbox-label">
// //                         <input
// //                             type="checkbox"
// //                             name="ecommerce.enabled"
// //                             checked={formData.ecommerce?.enabled}
// //                             onChange={handleInputChange}
// //                         />
// //                         <span>Enable E-Commerce Module</span>
// //                     </label>
// //                 </div>

// //                 <div className="form-group checkbox-group full-width">
// //                     <label className="checkbox-label">
// //                         <input
// //                             type="checkbox"
// //                             name="ecommerce.allowCOD"
// //                             checked={formData.ecommerce?.allowCOD}
// //                             onChange={handleInputChange}
// //                         />
// //                         <span>Allow Cash on Delivery</span>
// //                     </label>
// //                 </div>

// //                 <div className="form-group">
// //                     <label className="form-label">Tax Percentage (%)</label>
// //                     <input
// //                         type="number"
// //                         name="ecommerce.taxPercent"
// //                         value={formData.ecommerce?.taxPercent}
// //                         onChange={handleInputChange}
// //                         min="0"
// //                         max="100"
// //                         step="0.1"
// //                         className={`form-input ${errors.taxPercent ? 'input-error' : ''}`}
// //                     />
// //                     {errors.taxPercent && (
// //                         <p className="form-error">{errors.taxPercent}</p>
// //                     )}
// //                 </div>

// //                 <div className="form-group">
// //                     <label className="form-label">Shipping Charge (₹)</label>
// //                     <input
// //                         type="number"
// //                         name="ecommerce.shippingCharge"
// //                         value={formData.ecommerce?.shippingCharge}
// //                         onChange={handleInputChange}
// //                         min="0"
// //                         step="0.01"
// //                         className={`form-input ${errors.shippingCharge ? 'input-error' : ''}`}
// //                     />
// //                     {errors.shippingCharge && (
// //                         <p className="form-error">{errors.shippingCharge}</p>
// //                     )}
// //                 </div>
// //             </div>

// //             <div className="info-box">
// //                 <ShoppingCart size={20} />
// //                 <div>
// //                     <strong>Tip:</strong> Enable COD for customers who prefer to pay on delivery.
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     const renderBookingTab = () => (
// //         <div className="form-section">
// //             <h2 className="form-section-title">Booking Settings</h2>
// //             <p className="section-description">
// //                 Configure booking and appointment settings.
// //             </p>
            
// //             <div className="form-grid">
// //                 <div className="form-group checkbox-group full-width">
// //                     <label className="checkbox-label">
// //                         <input
// //                             type="checkbox"
// //                             name="booking.enabled"
// //                             checked={formData.booking?.enabled}
// //                             onChange={handleInputChange}
// //                         />
// //                         <span>Enable Booking Module</span>
// //                     </label>
// //                 </div>

// //                 <div className="form-group checkbox-group full-width">
// //                     <label className="checkbox-label">
// //                         <input
// //                             type="checkbox"
// //                             name="booking.autoApproval"
// //                             checked={formData.booking?.autoApproval}
// //                             onChange={handleInputChange}
// //                         />
// //                         <span>Auto-approve bookings</span>
// //                     </label>
// //                 </div>

// //                 <div className="form-group">
// //                     <label className="form-label">Max Bookings Per Day</label>
// //                     <input
// //                         type="number"
// //                         name="booking.maxBookingsPerDay"
// //                         value={formData.booking?.maxBookingsPerDay}
// //                         onChange={handleInputChange}
// //                         min="1"
// //                         className={`form-input ${errors.maxBookingsPerDay ? 'input-error' : ''}`}
// //                     />
// //                     {errors.maxBookingsPerDay && (
// //                         <p className="form-error">{errors.maxBookingsPerDay}</p>
// //                     )}
// //                 </div>

// //                 <div className="form-group">
// //                     <label className="form-label">Cancellation Hours</label>
// //                     <input
// //                         type="number"
// //                         name="booking.cancellationHours"
// //                         value={formData.booking?.cancellationHours}
// //                         onChange={handleInputChange}
// //                         min="0"
// //                         className={`form-input ${errors.cancellationHours ? 'input-error' : ''}`}
// //                     />
// //                     {errors.cancellationHours && (
// //                         <p className="form-error">{errors.cancellationHours}</p>
// //                     )}
// //                 </div>
// //             </div>

// //             <div className="info-box">
// //                 <Calendar size={20} />
// //                 <div>
// //                     <strong>Note:</strong> Set cancellation hours to 0 for no-cancellation policy.
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     const renderNotificationsTab = () => (
// //         <div className="form-section">
// //             <h2 className="form-section-title">Notification Settings</h2>
// //             <p className="section-description">
// //                 Configure which notification channels are enabled.
// //             </p>
            
// //             <div className="notifications-grid">
// //                 <div className="notification-card">
// //                     <Mail size={24} className="notification-icon" />
// //                     <div className="notification-info">
// //                         <h3>Email Notifications</h3>
// //                         <p>Order confirmations and updates via email</p>
// //                     </div>
// //                     <button
// //                         onClick={() => toggleFeature('email')}
// //                         className={`toggle-button ${formData.notifications?.email ? 'active' : ''}`}
// //                     >
// //                         {formData.notifications?.email ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
// //                     </button>
// //                 </div>

// //                 <div className="notification-card">
// //                     <Phone size={24} className="notification-icon" />
// //                     <div className="notification-info">
// //                         <h3>SMS Notifications</h3>
// //                         <p>Order updates via SMS (charges may apply)</p>
// //                     </div>
// //                     <button
// //                         onClick={() => toggleFeature('sms')}
// //                         className={`toggle-button ${formData.notifications?.sms ? 'active' : ''}`}
// //                     >
// //                         {formData.notifications?.sms ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
// //                     </button>
// //                 </div>

// //                 <div className="notification-card">
// //                     <MessageSquare size={24} className="notification-icon" />
// //                     <div className="notification-info">
// //                         <h3>WhatsApp Notifications</h3>
// //                         <p>Updates via WhatsApp Business API</p>
// //                     </div>
// //                     <button
// //                         onClick={() => toggleFeature('whatsapp')}
// //                         className={`toggle-button ${formData.notifications?.whatsapp ? 'active' : ''}`}
// //                     >
// //                         {formData.notifications?.whatsapp ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
// //                     </button>
// //                 </div>
// //             </div>

// //             <div className="info-box">
// //                 <Bell size={20} />
// //                 <div>
// //                     <strong>Tip:</strong> Enable multiple channels to ensure customers never miss updates.
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     const renderFeaturesTab = () => (
// //         <div className="form-section">
// //             <h2 className="form-section-title">Feature Management</h2>
// //             <p className="section-description">
// //                 Enable or disable advanced features based on your plan.
// //             </p>
            
// //             <div className="features-grid">
// //                 <div className="feature-card">
// //                     <Percent size={24} className="feature-icon" />
// //                     <h3>Coupons & Discounts</h3>
// //                     <p className="feature-description">
// //                         Create and manage discount coupons. Available in Basic plan+.
// //                     </p>
// //                     <div className="feature-status">
// //                         <span className={`plan-badge ${formData.features?.coupons ? 'active' : 'inactive'}`}>
// //                             {formData.features?.coupons ? 'Active' : 'Inactive'}
// //                         </span>
// //                         <button
// //                             onClick={() => toggleFeature('coupons')}
// //                             className={`toggle-switch ${formData.features?.coupons ? 'active' : ''}`}
// //                             disabled={!formData.features?.coupons && formData.subscription?.planName === 'free'}
// //                         >
// //                             <span className="toggle-handle"></span>
// //                         </button>
// //                     </div>
// //                 </div>

// //                 <div className="feature-card">
// //                     <Users size={24} className="feature-icon" />
// //                     <h3>Referral Program</h3>
// //                     <p className="feature-description">
// //                         Customers can refer friends and earn rewards. Available in Pro plan+.
// //                     </p>
// //                     <div className="feature-status">
// //                         <span className={`plan-badge ${formData.features?.referrals ? 'active' : 'inactive'}`}>
// //                             {formData.features?.referrals ? 'Active' : 'Inactive'}
// //                         </span>
// //                         <button
// //                             onClick={() => toggleFeature('referrals')}
// //                             className={`toggle-switch ${formData.features?.referrals ? 'active' : ''}`}
// //                             disabled={!formData.features?.referrals && formData.subscription?.planName === 'free'}
// //                         >
// //                             <span className="toggle-handle"></span>
// //                         </button>
// //                     </div>
// //                 </div>

// //                 <div className="feature-card">
// //                     <TrendingUp size={24} className="feature-icon" />
// //                     <h3>Advanced Analytics</h3>
// //                     <p className="feature-description">
// //                         Access detailed reports and insights about your business.
// //                     </p>
// //                     <div className="feature-status">
// //                         <span className={`plan-badge ${formData.features?.analytics ? 'active' : 'inactive'}`}>
// //                             {formData.features?.analytics ? 'Active' : 'Inactive'}
// //                         </span>
// //                         <button
// //                             onClick={() => toggleFeature('analytics')}
// //                             className={`toggle-switch ${formData.features?.analytics ? 'active' : ''}`}
// //                         >
// //                             <span className="toggle-handle"></span>
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className="info-box">
// //                 <Award size={20} />
// //                 <div>
// //                     <strong>Note:</strong> Feature availability depends on your subscription plan.
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     const renderLimitsTab = () => (
// //         <div className="form-section">
// //             <h2 className="form-section-title">Usage Limits</h2>
// //             <p className="section-description">
// //                 Set maximum limits for various resources based on your plan.
// //             </p>
            
// //             <div className="limits-grid">
// //                 <div className="limit-card">
// //                     <Users size={24} className="limit-icon" />
// //                     <h3>Maximum Users</h3>
// //                     <div className="limit-input-group">
// //                         <input
// //                             type="number"
// //                             name="limits.maxUsers"
// //                             value={formData.limits?.maxUsers}
// //                             onChange={handleInputChange}
// //                             min="1"
// //                             className={`limit-input ${errors.maxUsers ? 'input-error' : ''}`}
// //                         />
// //                         <span className="limit-unit">users</span>
// //                     </div>
// //                     {errors.maxUsers && <p className="form-error">{errors.maxUsers}</p>}
// //                 </div>

// //                 <div className="limit-card">
// //                     <Package size={24} className="limit-icon" />
// //                     <h3>Maximum Products</h3>
// //                     <div className="limit-input-group">
// //                         <input
// //                             type="number"
// //                             name="limits.maxProducts"
// //                             value={formData.limits?.maxProducts}
// //                             onChange={handleInputChange}
// //                             min="0"
// //                             className={`limit-input ${errors.maxProducts ? 'input-error' : ''}`}
// //                         />
// //                         <span className="limit-unit">products</span>
// //                     </div>
// //                     {errors.maxProducts && <p className="form-error">{errors.maxProducts}</p>}
// //                 </div>

// //                 <div className="limit-card">
// //                     <Calendar size={24} className="limit-icon" />
// //                     <h3>Monthly Bookings</h3>
// //                     <div className="limit-input-group">
// //                         <input
// //                             type="number"
// //                             name="limits.maxBookingsPerMonth"
// //                             value={formData.limits?.maxBookingsPerMonth}
// //                             onChange={handleInputChange}
// //                             min="0"
// //                             className={`limit-input ${errors.maxBookingsPerMonth ? 'input-error' : ''}`}
// //                         />
// //                         <span className="limit-unit">bookings/mo</span>
// //                     </div>
// //                     {errors.maxBookingsPerMonth && <p className="form-error">{errors.maxBookingsPerMonth}</p>}
// //                 </div>
// //             </div>

// //             <div className="info-box">
// //                 <Shield size={20} />
// //                 <div>
// //                     <strong>Important:</strong> These limits are enforced across your entire account.
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     const renderSubscriptionTab = () => (
// //         <div className="form-section">
// //             <h2 className="form-section-title">Subscription Plan</h2>
// //             <p className="section-description">
// //                 Manage your subscription plan and view current limits.
// //             </p>
            
// //             <div className="plans-grid">
// //                 {PLANS.map(plan => (
// //                     <div
// //                         key={plan.value}
// //                         className={`plan-card ${formData.subscription?.planName === plan.value ? 'active' : ''}`}
// //                         onClick={() => handlePlanChange(plan.value)}
// //                     >
// //                         <div className="plan-header" style={{ borderColor: plan.color }}>
// //                             <h3>{plan.label}</h3>
// //                         </div>
// //                         <div className="plan-features">
// //                             <ul>
// //                                 <li>
// //                                     <Check size={16} />
// //                                     <span>Up to {plan.value === 'free' ? '3' : plan.value === 'basic' ? '10' : plan.value === 'pro' ? '50' : '10,000'} users</span>
// //                                 </li>
// //                                 <li>
// //                                     <Check size={16} />
// //                                     <span>Up to {plan.value === 'free' ? '100' : plan.value === 'basic' ? '1000' : plan.value === 'pro' ? '5000' : '100,000'} products</span>
// //                                 </li>
// //                                 <li>
// //                                     <Check size={16} />
// //                                     <span>{plan.value === 'free' ? '100' : plan.value === 'basic' ? '500' : plan.value === 'pro' ? '2000' : '100,000'} bookings/month</span>
// //                                 </li>
// //                                 {plan.value !== 'free' && (
// //                                     <li>
// //                                         <Check size={16} />
// //                                         <span>Coupons & Discounts</span>
// //                                     </li>
// //                                 )}
// //                                 {plan.value === 'pro' && (
// //                                     <li>
// //                                         <Check size={16} />
// //                                         <span>Referral Program</span>
// //                                     </li>
// //                                 )}
// //                                 {plan.value === 'enterprise' && (
// //                                     <li>
// //                                         <Check size={16} />
// //                                         <span>Priority Support</span>
// //                                     </li>
// //                                 )}
// //                             </ul>
// //                         </div>
// //                         <div className="plan-footer">
// //                             {formData.subscription?.planName === plan.value ? (
// //                                 <span className="current-plan-badge">Current Plan</span>
// //                             ) : (
// //                                 <button className="upgrade-button">
// //                                     {plan.value === 'free' ? 'Downgrade' : 'Upgrade'}
// //                                 </button>
// //                             )}
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>

// //             {formData.subscription?.expiresAt && (
// //                 <div className="subscription-status">
// //                     <div className="status-item">
// //                         <span className="status-label">Plan:</span>
// //                         <span className="status-value">
// //                             {PLANS.find(p => p.value === formData.subscription.planName)?.label}
// //                         </span>
// //                     </div>
// //                     <div className="status-item">
// //                         <span className="status-label">Expires:</span>
// //                         <span className="status-value">
// //                             {new Date(formData.subscription.expiresAt).toLocaleDateString()}
// //                         </span>
// //                     </div>
// //                     <div className="status-item">
// //                         <span className="status-label">Status:</span>
// //                         <span className={`status-badge ${formData.subscription.isActive ? 'active' : 'inactive'}`}>
// //                             {formData.subscription.isActive ? 'Active' : 'Expired'}
// //                         </span>
// //                     </div>
// //                 </div>
// //             )}

// //             <div className="info-box">
// //                 <Zap size={20} />
// //                 <div>
// //                     <strong>Tip:</strong> Upgrade your plan to unlock more features and higher limits.
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     // ==================== MAIN RENDER ====================
    
// //     if (loading) {
// //         return (
// //             <div className="loading-container">
// //                 <div className="spinner"></div>
// //                 <p>Loading configuration...</p>
// //                 <style jsx>{`
// //                     .loading-container {
// //                         display: flex;
// //                         flex-direction: column;
// //                         align-items: center;
// //                         justify-content: center;
// //                         min-height: 400px;
// //                         gap: 16px;
// //                     }
// //                     .spinner {
// //                         width: 40px;
// //                         height: 40px;
// //                         border: 3px solid #e5e7eb;
// //                         border-top: 3px solid #3b82f6;
// //                         border-radius: 50%;
// //                         animation: spin 1s linear infinite;
// //                     }
// //                     @keyframes spin {
// //                         0% { transform: rotate(0deg); }
// //                         100% { transform: rotate(360deg); }
// //                     }
// //                 `}</style>
// //             </div>
// //         );
// //     }

// //     return (
// //         <>
// //             <Head>
// //                 <title>Configuration | LFMS</title>
// //                 <meta name="description" content="Manage your application configuration and settings" />
// //             </Head>

// //             <div className="config-container">
// //                 {/* Header */}
// //                 <div className="page-header">
// //                     <h1 className="page-title">Configuration</h1>
// //                     <p className="page-subtitle">
// //                         Manage your application settings, features, and subscription
// //                     </p>
// //                 </div>

// //                 {/* Success Message */}
// //                 {successMessage && (
// //                     <div className="success-message">
// //                         <Check size={20} />
// //                         <span>{successMessage}</span>
// //                     </div>
// //                 )}

// //                 {/* Steps/Tabs - Same as Company Profile */}
// //                 <div className="steps-container">
// //                     {TABS.map((tab) => {
// //                         const Icon = tab.icon;
// //                         return (
// //                             <div
// //                                 key={tab.id}
// //                                 className={`step-item ${activeTab === tab.id ? 'active' : ''}`}
// //                                 onClick={() => setActiveTab(tab.id)}
// //                             >
// //                                 <div className="step-icon">
// //                                     <Icon size={isMobile ? 20 : 24} />
// //                                 </div>
// //                                 <div className="step-name">{tab.label}</div>
// //                             </div>
// //                         );
// //                     })}
// //                 </div>

// //                 {/* Form Card */}
// //                 <div className="form-card">
// //                     {activeTab === 'general' && renderGeneralTab()}
// //                     {activeTab === 'ecommerce' && renderEcommerceTab()}
// //                     {activeTab === 'booking' && renderBookingTab()}
// //                     {activeTab === 'notifications' && renderNotificationsTab()}
// //                     {activeTab === 'features' && renderFeaturesTab()}
// //                     {activeTab === 'limits' && renderLimitsTab()}
// //                     {activeTab === 'subscription' && renderSubscriptionTab()}

// //                     {/* Save Button */}
// //                     <div className="form-navigation">
// //                         <button
// //                             type="button"
// //                             onClick={saveConfig}
// //                             disabled={saving}
// //                             className="submit-button"
// //                         >
// //                             {saving ? (
// //                                 <>
// //                                     <span className="spinner"></span>
// //                                     Saving...
// //                                 </>
// //                             ) : (
// //                                 'Save Changes'
// //                             )}
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>

// //             <style jsx>{`
// //                 /* ==================== CONTAINER STYLES ==================== */
// //                 .config-container {
// //                     padding: 1.5rem;
// //                     max-width: 1200px;
// //                     margin: 0 auto;
// //                     width: 100%;
// //                 }

// //                 /* ==================== PAGE HEADER ==================== */
// //                 .page-header {
// //                     margin-bottom: 2rem;
// //                 }

// //                 .page-title {
// //                     font-size: clamp(1.5rem, 3vw, 2rem);
// //                     font-weight: bold;
// //                     color: #1f2937;
// //                     margin: 0;
// //                 }

// //                 .page-subtitle {
// //                     margin-top: 0.5rem;
// //                     color: #6b7280;
// //                     font-size: 0.95rem;
// //                 }

// //                 /* ==================== SUCCESS MESSAGE ==================== */
// //                 .success-message {
// //                     display: flex;
// //                     align-items: center;
// //                     gap: 8px;
// //                     background: #d1fae5;
// //                     color: #065f46;
// //                     padding: 12px 16px;
// //                     border-radius: 8px;
// //                     margin-bottom: 20px;
// //                     font-size: 0.95rem;
// //                     font-weight: 500;
// //                 }

// //                 /* ==================== STEPS/TABS ==================== */
// //                 .steps-container {
// //                     display: flex;
// //                     justify-content: space-between;
// //                     margin-bottom: 2rem;
// //                     padding: 1rem;
// //                     background: white;
// //                     border-radius: 0.5rem;
// //                     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
// //                     overflow-x: auto;
// //                 }

// //                 .step-item {
// //                     display: flex;
// //                     flex-direction: column;
// //                     align-items: center;
// //                     gap: 0.5rem;
// //                     flex: 1;
// //                     cursor: pointer;
// //                     opacity: 0.5;
// //                     transition: all 0.3s ease;
// //                     min-width: 80px;
// //                 }

// //                 .step-item.active {
// //                     opacity: 1;
// //                 }

// //                 .step-icon {
// //                     width: 2.5rem;
// //                     height: 2.5rem;
// //                     background: #f3f4f6;
// //                     border-radius: 50%;
// //                     display: flex;
// //                     align-items: center;
// //                     justify-content: center;
// //                     font-size: 1.25rem;
// //                     transition: all 0.3s ease;
// //                 }

// //                 .step-item.active .step-icon {
// //                     background: #3b82f6;
// //                     color: white;
// //                 }

// //                 .step-name {
// //                     font-size: 0.75rem;
// //                     font-weight: 500;
// //                     text-align: center;
// //                 }

// //                 /* ==================== FORM CARD ==================== */
// //                 .form-card {
// //                     background: white;
// //                     border-radius: 0.75rem;
// //                     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
// //                     overflow: hidden;
// //                 }

// //                 .form-section {
// //                     padding: 1.5rem;
// //                 }

// //                 .form-section-title {
// //                     font-size: 1.25rem;
// //                     font-weight: 600;
// //                     color: #374151;
// //                     margin-bottom: 0.5rem;
// //                 }

// //                 .section-description {
// //                     font-size: 0.875rem;
// //                     color: #6b7280;
// //                     margin-bottom: 1.5rem;
// //                     line-height: 1.5;
// //                 }

// //                 /* ==================== FORM GRID ==================== */
// //                 .form-grid {
// //                     display: grid;
// //                     grid-template-columns: repeat(1, 1fr);
// //                     gap: 1rem;
// //                     margin-bottom: 1rem;
// //                 }

// //                 @media (min-width: 640px) {
// //                     .form-grid {
// //                         grid-template-columns: repeat(2, 1fr);
// //                     }
// //                 }

// //                 .full-width {
// //                     grid-column: 1 / -1;
// //                 }

// //                 .form-group {
// //                     margin-bottom: 1rem;
// //                 }

// //                 .form-label {
// //                     display: block;
// //                     font-size: 0.875rem;
// //                     font-weight: 500;
// //                     color: #374151;
// //                     margin-bottom: 0.375rem;
// //                 }

// //                 .required {
// //                     color: #ef4444;
// //                     margin-left: 4px;
// //                 }

// //                 .form-input,
// //                 .form-select {
// //                     width: 100%;
// //                     padding: 0.5rem 0.75rem;
// //                     border: 1px solid #d1d5db;
// //                     border-radius: 0.375rem;
// //                     font-size: 0.875rem;
// //                     transition: all 0.15s ease;
// //                     background: white;
// //                 }

// //                 .form-input:focus,
// //                 .form-select:focus {
// //                     outline: none;
// //                     border-color: #3b82f6;
// //                     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
// //                 }

// //                 .input-error {
// //                     border-color: #ef4444;
// //                 }

// //                 .form-error {
// //                     margin-top: 0.25rem;
// //                     font-size: 0.75rem;
// //                     color: #ef4444;
// //                 }

// //                 .input-hint {
// //                     font-size: 0.7rem;
// //                     color: #9ca3af;
// //                     margin-top: 4px;
// //                     display: block;
// //                 }

// //                 .checkbox-group {
// //                     display: flex;
// //                     align-items: center;
// //                 }

// //                 .checkbox-label {
// //                     display: flex;
// //                     align-items: center;
// //                     gap: 0.5rem;
// //                     cursor: pointer;
// //                     font-size: 0.875rem;
// //                     color: #374151;
// //                 }

// //                 .checkbox-label input[type="checkbox"] {
// //                     width: 1rem;
// //                     height: 1rem;
// //                     cursor: pointer;
// //                 }

// //                 /* ==================== NOTIFICATIONS ==================== */
// //                 .notifications-grid {
// //                     display: grid;
// //                     grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
// //                     gap: 1rem;
// //                     margin-bottom: 1.5rem;
// //                 }

// //                 .notification-card {
// //                     display: flex;
// //                     align-items: center;
// //                     gap: 1rem;
// //                     padding: 1rem;
// //                     background: #f9fafb;
// //                     border: 1px solid #e5e7eb;
// //                     border-radius: 0.5rem;
// //                 }

// //                 .notification-icon {
// //                     flex-shrink: 0;
// //                     color: #4f46e5;
// //                 }

// //                 .notification-info {
// //                     flex: 1;
// //                 }

// //                 .notification-info h3 {
// //                     font-size: 0.938rem;
// //                     font-weight: 600;
// //                     color: #1f2937;
// //                     margin: 0 0 4px 0;
// //                 }

// //                 .notification-info p {
// //                     font-size: 0.75rem;
// //                     color: #6b7280;
// //                     margin: 0;
// //                 }

// //                 .toggle-button {
// //                     background: none;
// //                     border: none;
// //                     cursor: pointer;
// //                     color: #9ca3af;
// //                     transition: color 0.2s ease;
// //                 }

// //                 .toggle-button.active {
// //                     color: #4f46e5;
// //                 }

// //                 /* ==================== FEATURES ==================== */
// //                 .features-grid {
// //                     display: grid;
// //                     grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
// //                     gap: 1rem;
// //                     margin-bottom: 1.5rem;
// //                 }

// //                 .feature-card {
// //                     padding: 1.5rem;
// //                     background: #f9fafb;
// //                     border: 1px solid #e5e7eb;
// //                     border-radius: 0.5rem;
// //                 }

// //                 .feature-icon {
// //                     margin-bottom: 1rem;
// //                     color: #4f46e5;
// //                 }

// //                 .feature-card h3 {
// //                     font-size: 1rem;
// //                     font-weight: 600;
// //                     color: #1f2937;
// //                     margin: 0 0 0.5rem 0;
// //                 }

// //                 .feature-description {
// //                     font-size: 0.875rem;
// //                     color: #6b7280;
// //                     margin-bottom: 1rem;
// //                     line-height: 1.5;
// //                 }

// //                 .feature-status {
// //                     display: flex;
// //                     align-items: center;
// //                     justify-content: space-between;
// //                 }

// //                 .plan-badge {
// //                     padding: 0.25rem 0.75rem;
// //                     border-radius: 1rem;
// //                     font-size: 0.75rem;
// //                     font-weight: 600;
// //                 }

// //                 .plan-badge.active {
// //                     background: #d1fae5;
// //                     color: #065f46;
// //                 }

// //                 .plan-badge.inactive {
// //                     background: #f3f4f6;
// //                     color: #6b7280;
// //                 }

// //                 .toggle-switch {
// //                     width: 48px;
// //                     height: 24px;
// //                     background: #e5e7eb;
// //                     border-radius: 12px;
// //                     border: none;
// //                     position: relative;
// //                     cursor: pointer;
// //                     transition: background 0.2s ease;
// //                 }

// //                 .toggle-switch.active {
// //                     background: #4f46e5;
// //                 }

// //                 .toggle-switch .toggle-handle {
// //                     width: 20px;
// //                     height: 20px;
// //                     background: white;
// //                     border-radius: 50%;
// //                     position: absolute;
// //                     top: 2px;
// //                     left: 2px;
// //                     transition: transform 0.2s ease;
// //                 }

// //                 .toggle-switch.active .toggle-handle {
// //                     transform: translateX(24px);
// //                 }

// //                 /* ==================== LIMITS ==================== */
// //                 .limits-grid {
// //                     display: grid;
// //                     grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
// //                     gap: 1rem;
// //                     margin-bottom: 1.5rem;
// //                 }

// //                 .limit-card {
// //                     padding: 1.5rem;
// //                     background: #f9fafb;
// //                     border: 1px solid #e5e7eb;
// //                     border-radius: 0.5rem;
// //                     text-align: center;
// //                 }

// //                 .limit-icon {
// //                     margin-bottom: 1rem;
// //                     color: #4f46e5;
// //                 }

// //                 .limit-card h3 {
// //                     font-size: 1rem;
// //                     font-weight: 600;
// //                     color: #1f2937;
// //                     margin-bottom: 1rem;
// //                 }

// //                 .limit-input-group {
// //                     display: flex;
// //                     align-items: center;
// //                     justify-content: center;
// //                     gap: 0.5rem;
// //                 }

// //                 .limit-input {
// //                     width: 100px;
// //                     padding: 0.5rem;
// //                     border: 1px solid #d1d5db;
// //                     border-radius: 0.375rem;
// //                     font-size: 1rem;
// //                     text-align: center;
// //                 }

// //                 .limit-unit {
// //                     font-size: 0.875rem;
// //                     color: #6b7280;
// //                 }

// //                 /* ==================== PLANS ==================== */
// //                 .plans-grid {
// //                     display: grid;
// //                     grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
// //                     gap: 1rem;
// //                     margin-bottom: 1.5rem;
// //                 }

// //                 .plan-card {
// //                     background: white;
// //                     border: 2px solid #e5e7eb;
// //                     border-radius: 0.75rem;
// //                     overflow: hidden;
// //                     cursor: pointer;
// //                     transition: all 0.2s ease;
// //                 }

// //                 .plan-card:hover {
// //                     transform: translateY(-2px);
// //                     box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
// //                 }

// //                 .plan-card.active {
// //                     border-color: #4f46e5;
// //                 }

// //                 .plan-header {
// //                     padding: 1rem;
// //                     border-bottom: 2px solid;
// //                     text-align: center;
// //                 }

// //                 .plan-header h3 {
// //                     font-size: 1.125rem;
// //                     font-weight: 700;
// //                     margin: 0;
// //                 }

// //                 .plan-features {
// //                     padding: 1rem;
// //                 }

// //                 .plan-features ul {
// //                     list-style: none;
// //                     padding: 0;
// //                     margin: 0;
// //                 }

// //                 .plan-features li {
// //                     display: flex;
// //                     align-items: center;
// //                     gap: 0.5rem;
// //                     margin-bottom: 0.5rem;
// //                     font-size: 0.875rem;
// //                     color: #4b5563;
// //                 }

// //                 .plan-features li svg {
// //                     color: #10b981;
// //                     flex-shrink: 0;
// //                 }

// //                 .plan-footer {
// //                     padding: 1rem;
// //                     border-top: 1px solid #e5e7eb;
// //                     text-align: center;
// //                 }

// //                 .current-plan-badge {
// //                     display: inline-block;
// //                     padding: 0.5rem 1rem;
// //                     background: #e5e7eb;
// //                     color: #6b7280;
// //                     border-radius: 0.375rem;
// //                     font-size: 0.875rem;
// //                     font-weight: 500;
// //                 }

// //                 .upgrade-button {
// //                     width: 100%;
// //                     padding: 0.5rem;
// //                     background: #4f46e5;
// //                     color: white;
// //                     border: none;
// //                     border-radius: 0.375rem;
// //                     font-size: 0.875rem;
// //                     font-weight: 500;
// //                     cursor: pointer;
// //                     transition: background 0.2s ease;
// //                 }

// //                 .upgrade-button:hover {
// //                     background: #4338ca;
// //                 }

// //                 .subscription-status {
// //                     display: flex;
// //                     gap: 2rem;
// //                     padding: 1rem;
// //                     background: #f9fafb;
// //                     border: 1px solid #e5e7eb;
// //                     border-radius: 0.5rem;
// //                     margin-top: 1rem;
// //                     flex-wrap: wrap;
// //                 }

// //                 .status-item {
// //                     display: flex;
// //                     align-items: center;
// //                     gap: 0.5rem;
// //                 }

// //                 .status-label {
// //                     font-size: 0.875rem;
// //                     color: #6b7280;
// //                 }

// //                 .status-value {
// //                     font-size: 0.875rem;
// //                     font-weight: 600;
// //                     color: #1f2937;
// //                 }

// //                 .status-badge {
// //                     padding: 0.25rem 0.75rem;
// //                     border-radius: 1rem;
// //                     font-size: 0.75rem;
// //                     font-weight: 600;
// //                 }

// //                 .status-badge.active {
// //                     background: #d1fae5;
// //                     color: #065f46;
// //                 }

// //                 .status-badge.inactive {
// //                     background: #fee2e2;
// //                     color: #991b1b;
// //                 }

// //                 /* ==================== INFO BOX ==================== */
// //                 .info-box {
// //                     display: flex;
// //                     align-items: center;
// //                     gap: 12px;
// //                     padding: 1rem;
// //                     background: #eff6ff;
// //                     border: 1px solid #dbeafe;
// //                     border-radius: 0.5rem;
// //                     color: #1e40af;
// //                     font-size: 0.875rem;
// //                     line-height: 1.5;
// //                     margin-top: 1.5rem;
// //                 }

// //                 /* ==================== FORM NAVIGATION ==================== */
// //                 .form-navigation {
// //                     display: flex;
// //                     justify-content: flex-end;
// //                     gap: 1rem;
// //                     padding: 1.5rem;
// //                     border-top: 1px solid #e5e7eb;
// //                 }

// //                 .submit-button {
// //                     display: inline-flex;
// //                     align-items: center;
// //                     gap: 0.5rem;
// //                     padding: 0.5rem 1.5rem;
// //                     background: #3b82f6;
// //                     color: white;
// //                     border: none;
// //                     border-radius: 0.375rem;
// //                     font-size: 0.875rem;
// //                     font-weight: 500;
// //                     cursor: pointer;
// //                     transition: background-color 0.15s ease;
// //                 }

// //                 .submit-button:hover {
// //                     background: #2563eb;
// //                 }

// //                 .submit-button:disabled {
// //                     background: #93c5fd;
// //                     cursor: not-allowed;
// //                 }

// //                 /* ==================== SPINNER ==================== */
// //                 .spinner {
// //                     width: 1rem;
// //                     height: 1rem;
// //                     border: 2px solid rgba(255, 255, 255, 0.3);
// //                     border-radius: 50%;
// //                     border-top-color: white;
// //                     animation: spin 1s linear infinite;
// //                     display: inline-block;
// //                 }

// //                 @keyframes spin {
// //                     0% { transform: rotate(0deg); }
// //                     100% { transform: rotate(360deg); }
// //                 }

// //                 /* ==================== MOBILE OPTIMIZATIONS ==================== */
// //                 @media (max-width: 768px) {
// //                     .config-container {
// //                         padding: 1rem;
// //                     }
                    
// //                     .steps-container {
// //                         flex-wrap: wrap;
// //                         gap: 0.5rem;
// //                     }
                    
// //                     .step-item {
// //                         min-width: calc(33.33% - 0.5rem);
// //                     }
                    
// //                     .form-section {
// //                         padding: 1rem;
// //                     }
                    
// //                     .form-navigation {
// //                         flex-direction: column;
// //                     }
                    
// //                     .form-navigation button {
// //                         width: 100%;
// //                     }
                    
// //                     .subscription-status {
// //                         flex-direction: column;
// //                         gap: 0.5rem;
// //                     }
// //                 }

// //                 @media (max-width: 640px) {
// //                     .step-item {
// //                         min-width: calc(50% - 0.5rem);
// //                     }
                    
// //                     .form-grid {
// //                         grid-template-columns: 1fr;
// //                     }
                    
// //                     .notification-card {
// //                         flex-direction: column;
// //                         text-align: center;
// //                     }
                    
// //                     .limit-input-group {
// //                         flex-direction: column;
// //                     }
// //                 }
// //             `}</style>
// //         </>
// //     );
// // }
// // //Hr.&LIv+jfYi2.iVELP8



// "use client";

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import Head from 'next/head';
// import {
//     Globe, ShoppingCart, Calendar, Bell,
//     Award, Users, CreditCard, Package, Clock, Percent,
//     DollarSign, Mail, Phone, MessageSquare, TrendingUp,
//     Save, Check, AlertCircle, Loader2, ToggleLeft, ToggleRight,
//     Shield, Zap, Settings, Box, Building2, X, Edit2, Trash2,
//     ChevronRight, Layers, Layout, Info, ShieldCheck,
//     CheckCircle, AlertTriangle, XCircle, Eye, EyeOff,
//     Star, Heart, Gift, HeadphonesIcon, MapPin, FileText,
//     Palette, Landmark, Receipt, Camera, Video, Mic,
//     Paperclip, Smile, Calendar as CalendarIcon, ArrowLeft,
//     ArrowRight, Grid, List, RefreshCw, Filter as FilterIcon,
//     Home, Settings2, User, LogOut, ChevronLeft, Search,
//     MoreVertical, Copy, Download, Printer, Share2, Bookmark,
//     ThumbsUp, ThumbsDown, MessageSquare as MessageSquareIcon,
//     Send, Upload, Image as ImageIcon, Link2, Globe2,
//     Facebook, Instagram, Twitter, Youtube, Linkedin,
//     TwitterIcon, Linkedin as LinkedinIcon, AtSign, Hash,
//     Wifi, WifiOff, Battery, BatteryCharging, Cpu, HardDrive,
//     Server, Cloud, CloudOff, Download as DownloadIcon,
//     Upload as UploadIcon, Repeat, Shuffle, Play, Pause,
//     Square, Circle, Triangle, Hexagon, Octagon, Diamond,
//     Gem, Crown, Sparkle, Sparkles, Brush, Palette as PaletteIcon,
//     FileSignature, Stamp, HeadphonesIcon as HeadphonesIcon2,
//     PhoneCall, MailOpen, MapPinHouse, Building, Store,
//     HelpCircle, MessageCircle, RotateCcw, Activity,
//     Box as BoxIcon, Package as PackageIcon, Truck,
//     ShieldCheck as ShieldCheckIcon, Key, Lock, Unlock
// } from 'lucide-react';

// // ==================== CONSTANTS ====================
// const TABS = [
//     { 
//         id: 'general', 
//         title: 'General', 
//         icon: Globe, 
//         color: '#3b82f6',
//         description: 'Basic application settings and preferences'
//     },
//     { 
//         id: 'ecommerce', 
//         title: 'E-Commerce', 
//         icon: ShoppingCart, 
//         color: '#8b5cf6',
//         description: 'Configure online store and payment options'
//     },
//     { 
//         id: 'booking', 
//         title: 'Booking', 
//         icon: Calendar, 
//         color: '#ec4899',
//         description: 'Booking and appointment settings'
//     },
//     { 
//         id: 'notifications', 
//         title: 'Notifications', 
//         icon: Bell, 
//         color: '#f59e0b',
//         description: 'Configure notification channels'
//     },
//     { 
//         id: 'features', 
//         title: 'Features', 
//         icon: Award, 
//         color: '#10b981',
//         description: 'Enable or disable advanced features'
//     },
//     { 
//         id: 'limits', 
//         title: 'Limits', 
//         icon: Users, 
//         color: '#6366f1',
//         description: 'Set usage limits and restrictions'
//     },
//     { 
//         id: 'subscription', 
//         title: 'Subscription', 
//         icon: CreditCard, 
//         color: '#f43f5e',
//         description: 'Manage your plan and subscription'
//     }
// ];

// const PLANS = [
//     { value: 'free', label: 'Free', color: '#6B7280' },
//     { value: 'basic', label: 'Basic', color: '#3B82F6' },
//     { value: 'pro', label: 'Professional', color: '#8B5CF6' },
//     { value: 'enterprise', label: 'Enterprise', color: '#10B981' }
// ];

// const CURRENCIES = [
//     { value: 'INR', label: '₹ INR (Indian Rupee)' },
//     { value: 'USD', label: '$ USD (US Dollar)' },
//     { value: 'EUR', label: '€ EUR (Euro)' },
//     { value: 'GBP', label: '£ GBP (British Pound)' }
// ];

// const TIMEZONES = [
//     'Asia/Kolkata',
//     'Asia/Dubai',
//     'Asia/Singapore',
//     'Asia/Tokyo',
//     'Australia/Sydney',
//     'Europe/London',
//     'Europe/Paris',
//     'America/New_York',
//     'America/Chicago',
//     'America/Los_Angeles'
// ];

// // ==================== MAIN COMPONENT ====================
// export default function ConfigPage() {
//     const router = useRouter();
//     const { data: session, status } = useSession();
    
//     // State management
//     const [expandedSections, setExpandedSections] = useState(['general']);
//     const [activeTab, setActiveTab] = useState('general');
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [config, setConfig] = useState(null);
//     const [errors, setErrors] = useState({});
//     const [toast, setToast] = useState({ show: false, type: '', message: '' });
//     const [tenantId, setTenantId] = useState('');
    
//     // Form state
//     const [formData, setFormData] = useState({
//         general: {
//             appName: '',
//             supportEmail: '',
//             currency: 'INR',
//             timezone: 'Asia/Kolkata',
//             dateFormat: 'dd/mm/yyyy',
//             timeFormat: '12h'
//         },
//         ecommerce: {
//             enabled: true,
//             allowCOD: true,
//             taxPercent: 18,
//             shippingCharge: 0,
//             freeShippingThreshold: 500,
//             currencySymbol: '₹',
//             showTaxBreakdown: true,
//             enableReviews: true,
//             enableWishlist: true,
//             enableCompare: false
//         },
//         booking: {
//             enabled: true,
//             maxBookingsPerDay: 50,
//             cancellationHours: 24,
//             autoApproval: false,
//             bufferTime: 30,
//             advanceBookingDays: 30,
//             allowWeekendBooking: true,
//             maxGuestsPerBooking: 10
//         },
//         notifications: {
//             email: true,
//             sms: false,
//             whatsapp: true,
//             pushNotifications: false,
//             orderUpdates: true,
//             bookingReminders: true,
//             marketingEmails: false,
//             abandonedCart: true
//         },
//         features: {
//             coupons: false,
//             referrals: false,
//             analytics: true,
//             multiVendor: false,
//             giftCards: false,
//             loyaltyPoints: false,
//             subscriptions: false,
//             bulkDiscount: false
//         },
//         limits: {
//             maxUsers: 5,
//             maxProducts: 500,
//             maxBookingsPerMonth: 300,
//             maxCategories: 50,
//             maxImagesPerProduct: 10,
//             maxFileSize: 10,
//             storageLimit: 1024,
//             apiRateLimit: 1000
//         },
//         subscription: {
//             planName: 'free',
//             expiresAt: null,
//             isActive: true,
//             billingCycle: 'monthly',
//             autoRenew: true
//         }
//     });

//     // Get tenant ID from session
//     useEffect(() => {
//         if (session?.user?.tenantId) {
//             setTenantId(session.user.tenantId);
//         } else {
//             setTenantId('demo-tenant-id');
//         }
//     }, [session]);

//     // Fetch config data
//     useEffect(() => {
//         if (tenantId) {
//             fetchConfig();
//         }
//     }, [tenantId]);

//     // Toast auto-hide
//     useEffect(() => {
//         if (toast.show) {
//             const timer = setTimeout(() => {
//                 setToast({ show: false, type: '', message: '' });
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [toast]);

//     // ==================== API FUNCTIONS ====================
    
//     const fetchConfig = async () => {
//         try {
//             setLoading(true);
//             const res = await fetch(`/api/config?tenantId=${tenantId}&includeFeatures=true`);
//             const data = await res.json();
            
//             if (data.success) {
//                 setConfig(data.data);
//                 setFormData(prev => ({
//                     ...prev,
//                     ...data.data,
//                     general: { ...prev.general, ...data.data.general },
//                     ecommerce: { ...prev.ecommerce, ...data.data.ecommerce },
//                     booking: { ...prev.booking, ...data.data.booking },
//                     notifications: { ...prev.notifications, ...data.data.notifications },
//                     features: { ...prev.features, ...data.data.features },
//                     limits: { ...prev.limits, ...data.data.limits },
//                     subscription: { ...prev.subscription, ...data.data.subscription }
//                 }));
//             }
//         } catch (error) {
//             console.error('Error fetching config:', error);
//             showToast('error', 'Failed to load configuration');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const saveConfig = async () => {
//         if (!validateForm()) return;
        
//         setSaving(true);
//         setErrors({});
        
//         try {
//             const res = await fetch('/api/config', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     tenantId,
//                     ...formData,
//                     updatedBy: session?.user?.id
//                 })
//             });
            
//             const data = await res.json();
            
//             if (data.success) {
//                 setConfig(data.data);
//                 showToast('success', 'Configuration saved successfully!');
//             } else {
//                 showToast('error', data.error || 'Failed to save configuration');
//             }
//         } catch (error) {
//             console.error('Error saving config:', error);
//             showToast('error', 'Network error. Please try again.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     const toggleFeature = async (featureName) => {
//         try {
//             const res = await fetch('/api/config', {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     tenantId,
//                     operation: 'toggleFeature',
//                     data: {
//                         featureName,
//                         updatedBy: session?.user?.id
//                     }
//                 })
//             });
            
//             const data = await res.json();
            
//             if (data.success) {
//                 setConfig(data.data);
//                 setFormData(prev => ({
//                     ...prev,
//                     ...data.data
//                 }));
//                 showToast('success', `Feature ${featureName} toggled!`);
//             }
//         } catch (error) {
//             console.error('Error toggling feature:', error);
//             showToast('error', 'Failed to toggle feature');
//         }
//     };

//     const updatePlan = async (planName) => {
//         try {
//             const res = await fetch('/api/config', {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     tenantId,
//                     operation: 'updatePlan',
//                     data: {
//                         planName,
//                         updatedBy: session?.user?.id
//                     }
//                 })
//             });
            
//             const data = await res.json();
            
//             if (data.success) {
//                 setConfig(data.data);
//                 setFormData(prev => ({
//                     ...prev,
//                     ...data.data
//                 }));
//                 showToast('success', `Plan updated to ${planName}!`);
//             }
//         } catch (error) {
//             console.error('Error updating plan:', error);
//             showToast('error', 'Failed to update plan');
//         }
//     };

//     const showToast = (type, message) => {
//         setToast({ show: true, type, message });
//     };

//     // ==================== VALIDATION ====================
    
//     const validateForm = () => {
//         const newErrors = {};
        
//         if (!formData.general?.appName?.trim()) {
//             newErrors.appName = 'App name is required';
//         }
        
//         if (formData.general?.supportEmail && 
//             !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.general.supportEmail)) {
//             newErrors.supportEmail = 'Enter a valid email';
//         }
        
//         if (formData.ecommerce?.taxPercent < 0 || formData.ecommerce?.taxPercent > 100) {
//             newErrors.taxPercent = 'Tax must be 0-100';
//         }
        
//         if (formData.ecommerce?.shippingCharge < 0) {
//             newErrors.shippingCharge = 'Shipping cannot be negative';
//         }
        
//         if (formData.ecommerce?.freeShippingThreshold < 0) {
//             newErrors.freeShippingThreshold = 'Threshold cannot be negative';
//         }
        
//         if (formData.booking?.maxBookingsPerDay < 1) {
//             newErrors.maxBookingsPerDay = 'At least 1 booking required';
//         }
        
//         if (formData.booking?.cancellationHours < 0) {
//             newErrors.cancellationHours = 'Hours cannot be negative';
//         }
        
//         if (formData.booking?.bufferTime < 0) {
//             newErrors.bufferTime = 'Buffer time cannot be negative';
//         }
        
//         if (formData.booking?.maxGuestsPerBooking < 1) {
//             newErrors.maxGuestsPerBooking = 'At least 1 guest allowed';
//         }
        
//         if (formData.limits?.maxUsers < 1) {
//             newErrors.maxUsers = 'At least 1 user required';
//         }
        
//         if (formData.limits?.maxProducts < 0) {
//             newErrors.maxProducts = 'Products cannot be negative';
//         }
        
//         if (formData.limits?.maxImagesPerProduct < 1) {
//             newErrors.maxImagesPerProduct = 'At least 1 image allowed';
//         }
        
//         if (formData.limits?.maxFileSize < 1) {
//             newErrors.maxFileSize = 'File size must be at least 1 MB';
//         }
        
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     // ==================== HANDLERS ====================
    
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
        
//         if (name.includes('.')) {
//             const [section, field] = name.split('.');
//             setFormData(prev => ({
//                 ...prev,
//                 [section]: {
//                     ...prev[section],
//                     [field]: type === 'checkbox' ? checked : 
//                              type === 'number' ? parseFloat(value) || 0 : value
//                 }
//             }));
//         }
        
//         // Clear error
//         const errorKey = name.split('.')[1] || name;
//         if (errors[errorKey]) {
//             setErrors(prev => ({ ...prev, [errorKey]: '' }));
//         }
//     };

//     const handlePlanChange = (plan) => {
//         if (plan !== formData.subscription.planName) {
//             if (confirm(`Change to ${PLANS.find(p => p.value === plan)?.label} plan?`)) {
//                 updatePlan(plan);
//             }
//         }
//     };

//     const toggleSection = (sectionId) => {
//         setExpandedSections(prev => {
//             if (prev.includes(sectionId)) {
//                 return prev.filter(id => id !== sectionId);
//             } else {
//                 return [...prev, sectionId];
//             }
//         });
//     };

//     const handleTabClick = (tabId) => {
//         setActiveTab(tabId);
//         if (!expandedSections.includes(tabId)) {
//             setExpandedSections(prev => [...prev, tabId]);
//         }
//     };

//     const expandAll = () => {
//         setExpandedSections(TABS.map(t => t.id));
//     };

//     const collapseAll = () => {
//         setExpandedSections([]);
//     };

//     // ==================== RENDER HELPERS ====================
    
//     const getPlanColor = (planValue) => {
//         const plan = PLANS.find(p => p.value === planValue);
//         return plan?.color || '#6B7280';
//     };

//     const getStatusIcon = (isActive) => {
//         return isActive ? 
//             <CheckCircle size={16} className="status-icon active" /> : 
//             <XCircle size={16} className="status-icon inactive" />;
//     };

//     // ==================== LOADING STATE ====================
    
//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <div className="loading-grid">
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                 </div>
//                 <p className="loading-text">Loading configuration...</p>
//                 <style jsx>{`
//                     .loading-container {
//                         min-height: 100vh;
//                         display: flex;
//                         flex-direction: column;
//                         align-items: center;
//                         justify-content: center;
//                         background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                     }
//                     .loading-grid {
//                         display: grid;
//                         grid-template-columns: repeat(3, 1fr);
//                         gap: 16px;
//                         margin-bottom: 24px;
//                     }
//                     .loading-card {
//                         width: 80px;
//                         height: 80px;
//                         background: white;
//                         border-radius: 12px;
//                         animation: pulse 1.5s ease-in-out infinite;
//                     }
//                     .loading-card:nth-child(2) {
//                         animation-delay: 0.2s;
//                     }
//                     .loading-card:nth-child(3) {
//                         animation-delay: 0.4s;
//                     }
//                     @keyframes pulse {
//                         0%, 100% {
//                             opacity: 0.6;
//                             transform: scale(1);
//                         }
//                         50% {
//                             opacity: 1;
//                             transform: scale(1.05);
//                         }
//                     }
//                     .loading-text {
//                         color: #64748b;
//                         font-size: 0.875rem;
//                         font-weight: 500;
//                     }
//                 `}</style>
//             </div>
//         );
//     }

//     // ==================== MAIN RENDER ====================
    
//     return (
//         <>
//             <Head>
//                 <title>Configuration | LFMS</title>
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 <meta name="description" content="Manage your application configuration and settings" />
//             </Head>

//             <div className="config-page">
//                 {/* Toast Notification */}
//                 {toast.show && (
//                     <div className={`toast-notification ${toast.type}`}>
//                         {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
//                         <span>{toast.message}</span>
//                     </div>
//                 )}

//                 {/* Header */}
//                 <header className="page-header">
//                     <div className="header-content">
//                         <div className="header-left">
//                             <h1 className="page-title">
//                                 <Settings size={28} className="title-icon" />
//                                 Configuration
//                             </h1>
//                             <p className="page-description">
//                                 Manage all your application settings in one place
//                             </p>
//                         </div>
//                         <div className="header-actions">
//                             <button
//                                 onClick={expandAll}
//                                 className="header-action-btn"
//                                 title="Expand all sections"
//                             >
//                                 <Layers size={18} />
//                             </button>
//                             <button
//                                 onClick={collapseAll}
//                                 className="header-action-btn"
//                                 title="Collapse all sections"
//                             >
//                                 <Layout size={18} />
//                             </button>
//                             <button
//                                 onClick={saveConfig}
//                                 disabled={saving}
//                                 className="save-button"
//                             >
//                                 {saving ? (
//                                     <>
//                                         <div className="button-spinner"></div>
//                                         <span>Saving...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save size={16} />
//                                         <span>Save Changes</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </header>

//                 {/* Desktop Horizontal Tabs - More Visible with Straight Edges */}
//                 <div className="desktop-tabs">
//                     {TABS.map(tab => {
//                         const Icon = tab.icon;
//                         return (
//                             <button
//                                 key={tab.id}
//                                 className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
//                                 onClick={() => handleTabClick(tab.id)}
//                             >
//                                 <div className="tab-icon" style={{ 
//                                     backgroundColor: activeTab === tab.id ? `${tab.color}20` : 'transparent',
//                                     color: activeTab === tab.id ? tab.color : '#64748b'
//                                 }}>
//                                     <Icon size={20} />
//                                 </div>
//                                 <span className="tab-title" style={{
//                                     color: activeTab === tab.id ? '#0f172a' : '#64748b',
//                                     fontWeight: activeTab === tab.id ? '600' : '500'
//                                 }}>{tab.title}</span>
//                                 {activeTab === tab.id && (
//                                     <div className="active-indicator" style={{ backgroundColor: tab.color }}></div>
//                                 )}
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {/* Main Content */}
//                 <main className="main-content">
//                     {/* Stats Overview */}
//                     <div className="stats-grid">
//                         <div className="stat-card">
//                             <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
//                                 <Globe size={20} />
//                             </div>
//                             <div className="stat-info">
//                                 <span className="stat-value">{formData.general?.appName || 'Not set'}</span>
//                                 <span className="stat-label">App Name</span>
//                             </div>
//                         </div>
//                         <div className="stat-card">
//                             <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
//                                 <Award size={20} />
//                             </div>
//                             <div className="stat-info">
//                                 <span className="stat-value">
//                                     {PLANS.find(p => p.value === formData.subscription?.planName)?.label || 'Free'}
//                                 </span>
//                                 <span className="stat-label">Current Plan</span>
//                             </div>
//                         </div>
//                         <div className="stat-card">
//                             <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
//                                 <Users size={20} />
//                             </div>
//                             <div className="stat-info">
//                                 <span className="stat-value">{formData.limits?.maxUsers || 0}</span>
//                                 <span className="stat-label">Max Users</span>
//                             </div>
//                         </div>
//                         <div className="stat-card">
//                             <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
//                                 <Package size={20} />
//                             </div>
//                             <div className="stat-info">
//                                 <span className="stat-value">{formData.limits?.maxProducts || 0}</span>
//                                 <span className="stat-label">Max Products</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Sections */}
//                     <div className="sections-container">
//                         {TABS.map(tab => {
//                             const Icon = tab.icon;
//                             const isExpanded = expandedSections.includes(tab.id);
                            
//                             return (
//                                 <div key={tab.id} className={`section-card ${activeTab === tab.id ? 'active' : ''}`}>
//                                     {/* Section Header */}
//                                     <div 
//                                         className="section-header"
//                                         onClick={() => toggleSection(tab.id)}
//                                     >
//                                         <div className="section-header-left">
//                                             <div 
//                                                 className="section-icon"
//                                                 style={{ background: `${tab.color}15`, color: tab.color }}
//                                             >
//                                                 <Icon size={20} />
//                                             </div>
//                                             <div className="section-title">
//                                                 <h2>{tab.title}</h2>
//                                                 <p>{tab.description}</p>
//                                             </div>
//                                         </div>
//                                         <div className="section-header-right">
//                                             <ChevronRight 
//                                                 size={20} 
//                                                 className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
//                                                 style={{
//                                                     transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
//                                                     transition: 'transform 0.3s ease'
//                                                 }}
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* Section Content */}
//                                     {isExpanded && (
//                                         <div className="section-content">
//                                             {/* General Tab */}
//                                             {tab.id === 'general' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Globe size={16} />
//                                                             Basic Information
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Application Name <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="general.appName"
//                                                                     value={formData.general?.appName}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.appName ? 'error' : ''}
//                                                                     placeholder="e.g., My Store"
//                                                                 />
//                                                                 {errors.appName && <span className="error-text">{errors.appName}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Support Email</label>
//                                                                 <input
//                                                                     type="email"
//                                                                     name="general.supportEmail"
//                                                                     value={formData.general?.supportEmail}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.supportEmail ? 'error' : ''}
//                                                                     placeholder="support@example.com"
//                                                                 />
//                                                                 {errors.supportEmail && <span className="error-text">{errors.supportEmail}</span>}
//                                                                 <span className="hint">Used for customer support and notifications</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Settings size={16} />
//                                                             Regional Settings
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Currency</label>
//                                                                 <select
//                                                                     name="general.currency"
//                                                                     value={formData.general?.currency}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     {CURRENCIES.map(currency => (
//                                                                         <option key={currency.value} value={currency.value}>
//                                                                             {currency.label}
//                                                                         </option>
//                                                                     ))}
//                                                                 </select>
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Timezone</label>
//                                                                 <select
//                                                                     name="general.timezone"
//                                                                     value={formData.general?.timezone}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     {TIMEZONES.map(tz => (
//                                                                         <option key={tz} value={tz}>{tz}</option>
//                                                                     ))}
//                                                                 </select>
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Date Format</label>
//                                                                 <select
//                                                                     name="general.dateFormat"
//                                                                     value={formData.general?.dateFormat}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     <option value="dd/mm/yyyy">DD/MM/YYYY</option>
//                                                                     <option value="mm/dd/yyyy">MM/DD/YYYY</option>
//                                                                     <option value="yyyy-mm-dd">YYYY-MM-DD</option>
//                                                                 </select>
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Time Format</label>
//                                                                 <select
//                                                                     name="general.timeFormat"
//                                                                     value={formData.general?.timeFormat}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     <option value="12h">12-hour (AM/PM)</option>
//                                                                     <option value="24h">24-hour</option>
//                                                                 </select>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Info size={20} />
//                                                         <p>
//                                                             <strong>Note:</strong> These settings affect how dates, times, and currencies are displayed throughout the application.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* E-Commerce Tab */}
//                                             {tab.id === 'ecommerce' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <ShoppingCart size={16} />
//                                                             Store Settings
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="ecommerce.enabled"
//                                                                         checked={formData.ecommerce?.enabled}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Enable E-Commerce Module</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="ecommerce.allowCOD"
//                                                                         checked={formData.ecommerce?.allowCOD}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Allow Cash on Delivery</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="ecommerce.showTaxBreakdown"
//                                                                         checked={formData.ecommerce?.showTaxBreakdown}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Show Tax Breakdown</span>
//                                                                 </label>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <DollarSign size={16} />
//                                                             Pricing & Charges
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Tax Percentage (%)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="ecommerce.taxPercent"
//                                                                     value={formData.ecommerce?.taxPercent}
//                                                                     onChange={handleInputChange}
//                                                                     min="0"
//                                                                     max="100"
//                                                                     step="0.1"
//                                                                     className={errors.taxPercent ? 'error' : ''}
//                                                                 />
//                                                                 {errors.taxPercent && <span className="error-text">{errors.taxPercent}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Shipping Charge (₹)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="ecommerce.shippingCharge"
//                                                                     value={formData.ecommerce?.shippingCharge}
//                                                                     onChange={handleInputChange}
//                                                                     min="0"
//                                                                     step="0.01"
//                                                                     className={errors.shippingCharge ? 'error' : ''}
//                                                                 />
//                                                                 {errors.shippingCharge && <span className="error-text">{errors.shippingCharge}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Free Shipping Threshold (₹)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="ecommerce.freeShippingThreshold"
//                                                                     value={formData.ecommerce?.freeShippingThreshold}
//                                                                     onChange={handleInputChange}
//                                                                     min="0"
//                                                                     step="0.01"
//                                                                     className={errors.freeShippingThreshold ? 'error' : ''}
//                                                                 />
//                                                                 {errors.freeShippingThreshold && <span className="error-text">{errors.freeShippingThreshold}</span>}
//                                                                 <span className="hint">Set to 0 to disable free shipping</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Heart size={16} />
//                                                             Customer Features
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="ecommerce.enableReviews"
//                                                                         checked={formData.ecommerce?.enableReviews}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Enable Product Reviews</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="ecommerce.enableWishlist"
//                                                                         checked={formData.ecommerce?.enableWishlist}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Enable Wishlist</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="ecommerce.enableCompare"
//                                                                         checked={formData.ecommerce?.enableCompare}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Enable Product Comparison</span>
//                                                                 </label>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <ShoppingCart size={20} />
//                                                         <p>
//                                                             <strong>Tip:</strong> Enable COD for customers who prefer to pay on delivery. Free shipping can increase average order value.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Booking Tab */}
//                                             {tab.id === 'booking' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Calendar size={16} />
//                                                             Booking Settings
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field checkbox-field span-2">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="booking.enabled"
//                                                                         checked={formData.booking?.enabled}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Enable Booking Module</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field span-2">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="booking.autoApproval"
//                                                                         checked={formData.booking?.autoApproval}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Auto-approve bookings</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field span-2">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="booking.allowWeekendBooking"
//                                                                         checked={formData.booking?.allowWeekendBooking}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Allow weekend bookings</span>
//                                                                 </label>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Clock size={16} />
//                                                             Booking Limits
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Max Bookings Per Day</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="booking.maxBookingsPerDay"
//                                                                     value={formData.booking?.maxBookingsPerDay}
//                                                                     onChange={handleInputChange}
//                                                                     min="1"
//                                                                     className={errors.maxBookingsPerDay ? 'error' : ''}
//                                                                 />
//                                                                 {errors.maxBookingsPerDay && <span className="error-text">{errors.maxBookingsPerDay}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Max Guests Per Booking</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="booking.maxGuestsPerBooking"
//                                                                     value={formData.booking?.maxGuestsPerBooking}
//                                                                     onChange={handleInputChange}
//                                                                     min="1"
//                                                                     className={errors.maxGuestsPerBooking ? 'error' : ''}
//                                                                 />
//                                                                 {errors.maxGuestsPerBooking && <span className="error-text">{errors.maxGuestsPerBooking}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Cancellation Hours</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="booking.cancellationHours"
//                                                                     value={formData.booking?.cancellationHours}
//                                                                     onChange={handleInputChange}
//                                                                     min="0"
//                                                                     className={errors.cancellationHours ? 'error' : ''}
//                                                                 />
//                                                                 {errors.cancellationHours && <span className="error-text">{errors.cancellationHours}</span>}
//                                                                 <span className="hint">Hours before booking to cancel</span>
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Buffer Time (minutes)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="booking.bufferTime"
//                                                                     value={formData.booking?.bufferTime}
//                                                                     onChange={handleInputChange}
//                                                                     min="0"
//                                                                     step="5"
//                                                                     className={errors.bufferTime ? 'error' : ''}
//                                                                 />
//                                                                 {errors.bufferTime && <span className="error-text">{errors.bufferTime}</span>}
//                                                                 <span className="hint">Time between consecutive bookings</span>
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Advance Booking Days</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="booking.advanceBookingDays"
//                                                                     value={formData.booking?.advanceBookingDays}
//                                                                     onChange={handleInputChange}
//                                                                     min="1"
//                                                                     className={errors.advanceBookingDays ? 'error' : ''}
//                                                                 />
//                                                                 {errors.advanceBookingDays && <span className="error-text">{errors.advanceBookingDays}</span>}
//                                                                 <span className="hint">How far in advance customers can book</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Calendar size={20} />
//                                                         <p>
//                                                             <strong>Note:</strong> Set cancellation hours to 0 for no-cancellation policy. Buffer time prevents back-to-back bookings.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Notifications Tab */}
//                                             {tab.id === 'notifications' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Bell size={16} />
//                                                             Notification Channels
//                                                         </h3>
//                                                         <div className="notifications-grid">
//                                                             <div className="notification-card">
//                                                                 <Mail size={24} className="notification-icon" style={{ color: '#3b82f6' }} />
//                                                                 <div className="notification-info">
//                                                                     <h4>Email Notifications</h4>
//                                                                     <p>Order confirmations and updates via email</p>
//                                                                 </div>
//                                                                 <div className="toggle-field">
//                                                                     <label className="toggle">
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             name="notifications.email"
//                                                                             checked={formData.notifications?.email}
//                                                                             onChange={handleInputChange}
//                                                                         />
//                                                                         <span className="toggle-slider"></span>
//                                                                     </label>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="notification-card">
//                                                                 <Phone size={24} className="notification-icon" style={{ color: '#8b5cf6' }} />
//                                                                 <div className="notification-info">
//                                                                     <h4>SMS Notifications</h4>
//                                                                     <p>Order updates via SMS (charges may apply)</p>
//                                                                 </div>
//                                                                 <div className="toggle-field">
//                                                                     <label className="toggle">
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             name="notifications.sms"
//                                                                             checked={formData.notifications?.sms}
//                                                                             onChange={handleInputChange}
//                                                                         />
//                                                                         <span className="toggle-slider"></span>
//                                                                     </label>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="notification-card">
//                                                                 <MessageSquare size={24} className="notification-icon" style={{ color: '#10b981' }} />
//                                                                 <div className="notification-info">
//                                                                     <h4>WhatsApp Notifications</h4>
//                                                                     <p>Updates via WhatsApp Business API</p>
//                                                                 </div>
//                                                                 <div className="toggle-field">
//                                                                     <label className="toggle">
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             name="notifications.whatsapp"
//                                                                             checked={formData.notifications?.whatsapp}
//                                                                             onChange={handleInputChange}
//                                                                         />
//                                                                         <span className="toggle-slider"></span>
//                                                                     </label>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="notification-card">
//                                                                 <Zap size={24} className="notification-icon" style={{ color: '#f59e0b' }} />
//                                                                 <div className="notification-info">
//                                                                     <h4>Push Notifications</h4>
//                                                                     <p>Browser and mobile push notifications</p>
//                                                                 </div>
//                                                                 <div className="toggle-field">
//                                                                     <label className="toggle">
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             name="notifications.pushNotifications"
//                                                                             checked={formData.notifications?.pushNotifications}
//                                                                             onChange={handleInputChange}
//                                                                         />
//                                                                         <span className="toggle-slider"></span>
//                                                                     </label>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Bell size={16} />
//                                                             Notification Events
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="notifications.orderUpdates"
//                                                                         checked={formData.notifications?.orderUpdates}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Order Status Updates</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="notifications.bookingReminders"
//                                                                         checked={formData.notifications?.bookingReminders}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Booking Reminders</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="notifications.marketingEmails"
//                                                                         checked={formData.notifications?.marketingEmails}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Marketing Emails</span>
//                                                                 </label>
//                                                             </div>

//                                                             <div className="form-field checkbox-field">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="notifications.abandonedCart"
//                                                                         checked={formData.notifications?.abandonedCart}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span>Abandoned Cart Reminders</span>
//                                                                 </label>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Bell size={20} />
//                                                         <p>
//                                                             <strong>Tip:</strong> Enable multiple channels to ensure customers never miss important updates.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Features Tab */}
//                                             {tab.id === 'features' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Award size={16} />
//                                                             Available Features
//                                                         </h3>
//                                                         <div className="features-grid">
//                                                             <div className="feature-card">
//                                                                 <Percent size={24} className="feature-icon" style={{ color: '#3b82f6' }} />
//                                                                 <div className="feature-content">
//                                                                     <h4>Coupons & Discounts</h4>
//                                                                     <p>Create and manage discount coupons</p>
//                                                                 </div>
//                                                                 <div className="feature-status">
//                                                                     <span className={`plan-badge ${formData.features?.coupons ? 'active' : 'inactive'}`}>
//                                                                         {formData.features?.coupons ? 'Active' : 'Inactive'}
//                                                                     </span>
//                                                                     <button
//                                                                         onClick={() => toggleFeature('coupons')}
//                                                                         className={`toggle-switch ${formData.features?.coupons ? 'active' : ''}`}
//                                                                         disabled={!formData.features?.coupons && formData.subscription?.planName === 'free'}
//                                                                     >
//                                                                         <span className="toggle-handle"></span>
//                                                                     </button>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="feature-card">
//                                                                 <Users size={24} className="feature-icon" style={{ color: '#8b5cf6' }} />
//                                                                 <div className="feature-content">
//                                                                     <h4>Referral Program</h4>
//                                                                     <p>Customers can refer friends and earn rewards</p>
//                                                                 </div>
//                                                                 <div className="feature-status">
//                                                                     <span className={`plan-badge ${formData.features?.referrals ? 'active' : 'inactive'}`}>
//                                                                         {formData.features?.referrals ? 'Active' : 'Inactive'}
//                                                                     </span>
//                                                                     <button
//                                                                         onClick={() => toggleFeature('referrals')}
//                                                                         className={`toggle-switch ${formData.features?.referrals ? 'active' : ''}`}
//                                                                         disabled={!formData.features?.referrals && formData.subscription?.planName === 'free'}
//                                                                     >
//                                                                         <span className="toggle-handle"></span>
//                                                                     </button>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="feature-card">
//                                                                 <TrendingUp size={24} className="feature-icon" style={{ color: '#10b981' }} />
//                                                                 <div className="feature-content">
//                                                                     <h4>Advanced Analytics</h4>
//                                                                     <p>Access detailed reports and insights</p>
//                                                                 </div>
//                                                                 <div className="feature-status">
//                                                                     <span className={`plan-badge ${formData.features?.analytics ? 'active' : 'inactive'}`}>
//                                                                         {formData.features?.analytics ? 'Active' : 'Inactive'}
//                                                                     </span>
//                                                                     <button
//                                                                         onClick={() => toggleFeature('analytics')}
//                                                                         className={`toggle-switch ${formData.features?.analytics ? 'active' : ''}`}
//                                                                     >
//                                                                         <span className="toggle-handle"></span>
//                                                                     </button>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="feature-card">
//                                                                 <Store size={24} className="feature-icon" style={{ color: '#f59e0b' }} />
//                                                                 <div className="feature-content">
//                                                                     <h4>Multi-Vendor Marketplace</h4>
//                                                                     <p>Allow multiple sellers on your platform</p>
//                                                                 </div>
//                                                                 <div className="feature-status">
//                                                                     <span className={`plan-badge ${formData.features?.multiVendor ? 'active' : 'inactive'}`}>
//                                                                         {formData.features?.multiVendor ? 'Active' : 'Inactive'}
//                                                                     </span>
//                                                                     <button
//                                                                         onClick={() => toggleFeature('multiVendor')}
//                                                                         className={`toggle-switch ${formData.features?.multiVendor ? 'active' : ''}`}
//                                                                         disabled={!formData.features?.multiVendor && formData.subscription?.planName === 'free'}
//                                                                     >
//                                                                         <span className="toggle-handle"></span>
//                                                                     </button>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="feature-card">
//                                                                 <Gift size={24} className="feature-icon" style={{ color: '#ec4899' }} />
//                                                                 <div className="feature-content">
//                                                                     <h4>Gift Cards</h4>
//                                                                     <p>Sell and manage digital gift cards</p>
//                                                                 </div>
//                                                                 <div className="feature-status">
//                                                                     <span className={`plan-badge ${formData.features?.giftCards ? 'active' : 'inactive'}`}>
//                                                                         {formData.features?.giftCards ? 'Active' : 'Inactive'}
//                                                                     </span>
//                                                                     <button
//                                                                         onClick={() => toggleFeature('giftCards')}
//                                                                         className={`toggle-switch ${formData.features?.giftCards ? 'active' : ''}`}
//                                                                         disabled={!formData.features?.giftCards && formData.subscription?.planName === 'free'}
//                                                                     >
//                                                                         <span className="toggle-handle"></span>
//                                                                     </button>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="feature-card">
//                                                                 <Star size={24} className="feature-icon" style={{ color: '#f43f5e' }} />
//                                                                 <div className="feature-content">
//                                                                     <h4>Loyalty Points</h4>
//                                                                     <p>Reward customers for repeat purchases</p>
//                                                                 </div>
//                                                                 <div className="feature-status">
//                                                                     <span className={`plan-badge ${formData.features?.loyaltyPoints ? 'active' : 'inactive'}`}>
//                                                                         {formData.features?.loyaltyPoints ? 'Active' : 'Inactive'}
//                                                                     </span>
//                                                                     <button
//                                                                         onClick={() => toggleFeature('loyaltyPoints')}
//                                                                         className={`toggle-switch ${formData.features?.loyaltyPoints ? 'active' : ''}`}
//                                                                         disabled={!formData.features?.loyaltyPoints && formData.subscription?.planName === 'free'}
//                                                                     >
//                                                                         <span className="toggle-handle"></span>
//                                                                     </button>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Award size={20} />
//                                                         <p>
//                                                             <strong>Note:</strong> Feature availability depends on your subscription plan. Upgrade to access more features.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Limits Tab */}
//                                             {tab.id === 'limits' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Users size={16} />
//                                                             Resource Limits
//                                                         </h3>
//                                                         <div className="limits-grid">
//                                                             <div className="limit-card">
//                                                                 <Users size={24} className="limit-icon" style={{ color: '#3b82f6' }} />
//                                                                 <h4>Maximum Users</h4>
//                                                                 <div className="limit-input-group">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="limits.maxUsers"
//                                                                         value={formData.limits?.maxUsers}
//                                                                         onChange={handleInputChange}
//                                                                         min="1"
//                                                                         className={`limit-input ${errors.maxUsers ? 'error' : ''}`}
//                                                                     />
//                                                                     <span className="limit-unit">users</span>
//                                                                 </div>
//                                                                 {errors.maxUsers && <span className="error-text">{errors.maxUsers}</span>}
//                                                             </div>

//                                                             <div className="limit-card">
//                                                                 <Package size={24} className="limit-icon" style={{ color: '#8b5cf6' }} />
//                                                                 <h4>Maximum Products</h4>
//                                                                 <div className="limit-input-group">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="limits.maxProducts"
//                                                                         value={formData.limits?.maxProducts}
//                                                                         onChange={handleInputChange}
//                                                                         min="0"
//                                                                         className={`limit-input ${errors.maxProducts ? 'error' : ''}`}
//                                                                     />
//                                                                     <span className="limit-unit">products</span>
//                                                                 </div>
//                                                                 {errors.maxProducts && <span className="error-text">{errors.maxProducts}</span>}
//                                                             </div>

//                                                             <div className="limit-card">
//                                                                 <Calendar size={24} className="limit-icon" style={{ color: '#10b981' }} />
//                                                                 <h4>Monthly Bookings</h4>
//                                                                 <div className="limit-input-group">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="limits.maxBookingsPerMonth"
//                                                                         value={formData.limits?.maxBookingsPerMonth}
//                                                                         onChange={handleInputChange}
//                                                                         min="0"
//                                                                         className={`limit-input ${errors.maxBookingsPerMonth ? 'error' : ''}`}
//                                                                     />
//                                                                     <span className="limit-unit">bookings/mo</span>
//                                                                 </div>
//                                                                 {errors.maxBookingsPerMonth && <span className="error-text">{errors.maxBookingsPerMonth}</span>}
//                                                             </div>

//                                                             <div className="limit-card">
//                                                                 <Box size={24} className="limit-icon" style={{ color: '#f59e0b' }} />
//                                                                 <h4>Maximum Categories</h4>
//                                                                 <div className="limit-input-group">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="limits.maxCategories"
//                                                                         value={formData.limits?.maxCategories}
//                                                                         onChange={handleInputChange}
//                                                                         min="0"
//                                                                         className={`limit-input ${errors.maxCategories ? 'error' : ''}`}
//                                                                     />
//                                                                     <span className="limit-unit">categories</span>
//                                                                 </div>
//                                                                 {errors.maxCategories && <span className="error-text">{errors.maxCategories}</span>}
//                                                             </div>

//                                                             <div className="limit-card">
//                                                                 <ImageIcon size={24} className="limit-icon" style={{ color: '#ec4899' }} />
//                                                                 <h4>Images Per Product</h4>
//                                                                 <div className="limit-input-group">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="limits.maxImagesPerProduct"
//                                                                         value={formData.limits?.maxImagesPerProduct}
//                                                                         onChange={handleInputChange}
//                                                                         min="1"
//                                                                         className={`limit-input ${errors.maxImagesPerProduct ? 'error' : ''}`}
//                                                                     />
//                                                                     <span className="limit-unit">images</span>
//                                                                 </div>
//                                                                 {errors.maxImagesPerProduct && <span className="error-text">{errors.maxImagesPerProduct}</span>}
//                                                             </div>

//                                                             <div className="limit-card">
//                                                                 <HardDrive size={24} className="limit-icon" style={{ color: '#f43f5e' }} />
//                                                                 <h4>Storage Limit</h4>
//                                                                 <div className="limit-input-group">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="limits.storageLimit"
//                                                                         value={formData.limits?.storageLimit}
//                                                                         onChange={handleInputChange}
//                                                                         min="1"
//                                                                         className={`limit-input ${errors.storageLimit ? 'error' : ''}`}
//                                                                     />
//                                                                     <span className="limit-unit">MB</span>
//                                                                 </div>
//                                                                 {errors.storageLimit && <span className="error-text">{errors.storageLimit}</span>}
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Zap size={16} />
//                                                             Performance Limits
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Max File Size (MB)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="limits.maxFileSize"
//                                                                     value={formData.limits?.maxFileSize}
//                                                                     onChange={handleInputChange}
//                                                                     min="1"
//                                                                     className={errors.maxFileSize ? 'error' : ''}
//                                                                 />
//                                                                 {errors.maxFileSize && <span className="error-text">{errors.maxFileSize}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>API Rate Limit (per hour)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="limits.apiRateLimit"
//                                                                     value={formData.limits?.apiRateLimit}
//                                                                     onChange={handleInputChange}
//                                                                     min="1"
//                                                                     className={errors.apiRateLimit ? 'error' : ''}
//                                                                 />
//                                                                 {errors.apiRateLimit && <span className="error-text">{errors.apiRateLimit}</span>}
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Shield size={20} />
//                                                         <p>
//                                                             <strong>Important:</strong> These limits are enforced across your entire account. Contact support to increase limits.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Subscription Tab */}
//                                             {tab.id === 'subscription' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <CreditCard size={16} />
//                                                             Current Plan
//                                                         </h3>
//                                                         <div className="plans-grid">
//                                                             {PLANS.map(plan => (
//                                                                 <div
//                                                                     key={plan.value}
//                                                                     className={`plan-card ${formData.subscription?.planName === plan.value ? 'active' : ''}`}
//                                                                     onClick={() => handlePlanChange(plan.value)}
//                                                                 >
//                                                                     <div className="plan-header" style={{ borderColor: plan.color }}>
//                                                                         <h4>{plan.label}</h4>
//                                                                     </div>
//                                                                     <div className="plan-features">
//                                                                         <ul>
//                                                                             <li>
//                                                                                 <Check size={16} style={{ color: '#10b981' }} />
//                                                                                 <span>Up to {plan.value === 'free' ? '3' : plan.value === 'basic' ? '10' : plan.value === 'pro' ? '50' : '10,000'} users</span>
//                                                                             </li>
//                                                                             <li>
//                                                                                 <Check size={16} style={{ color: '#10b981' }} />
//                                                                                 <span>Up to {plan.value === 'free' ? '100' : plan.value === 'basic' ? '1000' : plan.value === 'pro' ? '5000' : '100,000'} products</span>
//                                                                             </li>
//                                                                             <li>
//                                                                                 <Check size={16} style={{ color: '#10b981' }} />
//                                                                                 <span>{plan.value === 'free' ? '100' : plan.value === 'basic' ? '500' : plan.value === 'pro' ? '2000' : '100,000'} bookings/month</span>
//                                                                             </li>
//                                                                             {plan.value !== 'free' && (
//                                                                                 <li>
//                                                                                     <Check size={16} style={{ color: '#10b981' }} />
//                                                                                     <span>Coupons & Discounts</span>
//                                                                                 </li>
//                                                                             )}
//                                                                             {plan.value === 'pro' && (
//                                                                                 <li>
//                                                                                     <Check size={16} style={{ color: '#10b981' }} />
//                                                                                     <span>Referral Program</span>
//                                                                                 </li>
//                                                                             )}
//                                                                             {plan.value === 'enterprise' && (
//                                                                                 <li>
//                                                                                     <Check size={16} style={{ color: '#10b981' }} />
//                                                                                     <span>Priority Support</span>
//                                                                                 </li>
//                                                                             )}
//                                                                         </ul>
//                                                                     </div>
//                                                                     <div className="plan-footer">
//                                                                         {formData.subscription?.planName === plan.value ? (
//                                                                             <span className="current-plan-badge">Current Plan</span>
//                                                                         ) : (
//                                                                             <button className="upgrade-button" style={{ background: plan.color }}>
//                                                                                 {plan.value === 'free' ? 'Downgrade' : 'Upgrade'}
//                                                                             </button>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Clock size={16} />
//                                                             Subscription Details
//                                                         </h3>
//                                                         <div className="subscription-details">
//                                                             <div className="detail-item">
//                                                                 <span className="detail-label">Billing Cycle:</span>
//                                                                 <select
//                                                                     name="subscription.billingCycle"
//                                                                     value={formData.subscription?.billingCycle}
//                                                                     onChange={handleInputChange}
//                                                                     className="detail-select"
//                                                                 >
//                                                                     <option value="monthly">Monthly</option>
//                                                                     <option value="yearly">Yearly (Save 20%)</option>
//                                                                 </select>
//                                                             </div>

//                                                             <div className="detail-item">
//                                                                 <span className="detail-label">Auto Renew:</span>
//                                                                 <label className="toggle">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="subscription.autoRenew"
//                                                                         checked={formData.subscription?.autoRenew}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                     <span className="toggle-slider"></span>
//                                                                 </label>
//                                                             </div>

//                                                             {formData.subscription?.expiresAt && (
//                                                                 <div className="detail-item">
//                                                                     <span className="detail-label">Expires On:</span>
//                                                                     <span className="detail-value">
//                                                                         {new Date(formData.subscription.expiresAt).toLocaleDateString()}
//                                                                     </span>
//                                                                 </div>
//                                                             )}

//                                                             <div className="detail-item">
//                                                                 <span className="detail-label">Status:</span>
//                                                                 <span className={`status-badge ${formData.subscription?.isActive ? 'active' : 'inactive'}`}>
//                                                                     {formData.subscription?.isActive ? 'Active' : 'Expired'}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Zap size={20} />
//                                                         <p>
//                                                             <strong>Tip:</strong> Upgrade your plan to unlock more features and higher limits. Enterprise plans include custom pricing and dedicated support.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </main>

//                 {/* Mobile Save Button */}
//                 <div className="mobile-save">
//                     <button
//                         onClick={saveConfig}
//                         disabled={saving}
//                         className="mobile-save-btn"
//                     >
//                         {saving ? (
//                             <div className="button-spinner"></div>
//                         ) : (
//                             <>
//                                 <Save size={18} />
//                                 <span>Save Changes</span>
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             <style jsx>{`
//                 /* ==================== GLOBAL STYLES ==================== */
//                 .config-page {
//                     min-height: 100vh;
//                     background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                 }

//                 /* ==================== TOAST NOTIFICATION ==================== */
//                 .toast-notification {
//                     position: fixed;
//                     top: 20px;
//                     right: 20px;
//                     z-index: 1100;
//                     display: flex;
//                     align-items: center;
//                     gap: 10px;
//                     padding: 12px 20px;
//                     background: white;
//                     border-radius: 8px;
//                     box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
//                     animation: slideInRight 0.3s ease;
//                     font-size: 0.875rem;
//                     max-width: 400px;
//                 }

//                 .toast-notification.success {
//                     border-left: 4px solid #10b981;
//                 }

//                 .toast-notification.error {
//                     border-left: 4px solid #ef4444;
//                 }

//                 .toast-notification.success svg {
//                     color: #10b981;
//                 }

//                 .toast-notification.error svg {
//                     color: #ef4444;
//                 }

//                 @keyframes slideInRight {
//                     from {
//                         transform: translateX(100%);
//                         opacity: 0;
//                     }
//                     to {
//                         transform: translateX(0);
//                         opacity: 1;
//                     }
//                 }

//                 /* ==================== HEADER ==================== */
//                 .page-header {
//                     background: white;
//                     border-bottom: 1px solid #e2e8f0;
//                     padding: 20px 24px;
//                     position: sticky;
//                     top: 0;
//                     z-index: 100;
//                     backdrop-filter: blur(10px);
//                     background: rgba(255, 255, 255, 0.95);
//                 }

//                 .header-content {
//                     max-width: 1200px;
//                     margin: 0 auto;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                 }

//                 .header-left {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 4px;
//                 }

//                 .page-title {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     font-size: 1.5rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0;
//                 }

//                 .title-icon {
//                     color: #3b82f6;
//                 }

//                 .page-description {
//                     color: #64748b;
//                     font-size: 0.875rem;
//                     margin: 0;
//                 }

//                 .header-actions {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                 }

//                 .header-action-btn {
//                     width: 40px;
//                     height: 40px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     color: #64748b;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .header-action-btn:hover {
//                     background: #f1f5f9;
//                     color: #3b82f6;
//                     border-color: #3b82f6;
//                 }

//                 .save-button {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 10px 20px;
//                     background: #3b82f6;
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//                 }

//                 .save-button:hover {
//                     background: #2563eb;
//                     transform: translateY(-1px);
//                     box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
//                 }

//                 .save-button:disabled {
//                     opacity: 0.6;
//                     cursor: not-allowed;
//                     transform: none;
//                 }

//                 .button-spinner {
//                     width: 16px;
//                     height: 16px;
//                     border: 2px solid rgba(255, 255, 255, 0.3);
//                     border-top-color: white;
//                     border-radius: 50%;
//                     animation: spin 0.8s linear infinite;
//                 }

//                 @keyframes spin {
//                     to { transform: rotate(360deg); }
//                 }

//                 /* ==================== DESKTOP TABS - STRAIGHT EDGES ==================== */
//                 .desktop-tabs {
//                     max-width: 1200px;
//                     margin: 0 auto 24px auto;
//                     padding: 0 24px;
//                     display: none;
//                     background: white;
//                     border-bottom: 2px solid #e2e8f0;
//                     gap: 4px;
//                 }

//                 @media (min-width: 1024px) {
//                     .desktop-tabs {
//                         display: flex;
//                         padding: 0;
//                         margin: 0 auto 24px auto;
//                     }
//                 }

//                 .tab-button {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 16px 20px;
//                     background: transparent;
//                     border: none;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     white-space: nowrap;
//                     font-size: 0.875rem;
//                     position: relative;
//                     border-bottom: 2px solid transparent;
//                     margin-bottom: -2px;
//                 }

//                 .tab-button:hover {
//                     background: #f8fafc;
//                 }

//                 .tab-button.active {
//                     background: #f8fafc;
//                     border-bottom: 2px solid;
//                 }

//                 .tab-icon {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     padding: 8px;
//                     border-radius: 8px;
//                     transition: all 0.2s ease;
//                 }

//                 .active-indicator {
//                     position: absolute;
//                     bottom: -2px;
//                     left: 0;
//                     right: 0;
//                     height: 2px;
//                 }

//                 /* ==================== MAIN CONTENT ==================== */
//                 .main-content {
//                     max-width: 1200px;
//                     margin: 24px auto;
//                     padding: 0 24px 100px 24px;
//                 }

//                 /* ==================== STATS GRID ==================== */
//                 .stats-grid {
//                     display: grid;
//                     grid-template-columns: repeat(4, 1fr);
//                     gap: 16px;
//                     margin-bottom: 32px;
//                 }

//                 .stat-card {
//                     background: white;
//                     border-radius: 12px;
//                     padding: 16px;
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
//                 }

//                 .stat-icon {
//                     width: 48px;
//                     height: 48px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     border-radius: 12px;
//                 }

//                 .stat-info {
//                     flex: 1;
//                     min-width: 0;
//                 }

//                 .stat-value {
//                     display: block;
//                     font-size: 0.938rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     white-space: nowrap;
//                     overflow: hidden;
//                     text-overflow: ellipsis;
//                 }

//                 .stat-label {
//                     display: block;
//                     font-size: 0.688rem;
//                     color: #64748b;
//                     margin-top: 2px;
//                 }

//                 /* ==================== SECTIONS CONTAINER ==================== */
//                 .sections-container {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 16px;
//                 }

//                 .section-card {
//                     background: white;
//                     border-radius: 12px;
//                     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
//                     overflow: hidden;
//                 }

//                 @media (min-width: 1024px) {
//                     .section-card:not(.active) {
//                         display: none;
//                     }
//                 }

//                 .section-header {
//                     padding: 20px 24px;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .section-header:hover {
//                     background: #f8fafc;
//                 }

//                 .section-header-left {
//                     display: flex;
//                     align-items: center;
//                     gap: 16px;
//                 }

//                 .section-icon {
//                     width: 44px;
//                     height: 44px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     border-radius: 12px;
//                 }

//                 .section-title h2 {
//                     font-size: 1rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0 0 4px 0;
//                 }

//                 .section-title p {
//                     font-size: 0.75rem;
//                     color: #64748b;
//                     margin: 0;
//                 }

//                 .chevron-icon {
//                     color: #94a3b8;
//                     transition: transform 0.3s ease;
//                 }

//                 .section-content {
//                     padding: 0 24px 24px 24px;
//                     border-top: 1px solid #e2e8f0;
//                     animation: slideDown 0.3s ease;
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

//                 /* ==================== FORM BLOCKS ==================== */
//                 .form-block {
//                     margin-bottom: 28px;
//                 }

//                 .form-block:last-child {
//                     margin-bottom: 0;
//                 }

//                 .form-block h3 {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     font-size: 0.875rem;
//                     font-weight: 600;
//                     color: #334155;
//                     margin: 0 0 16px 0;
//                     padding-bottom: 8px;
//                     border-bottom: 1px dashed #e2e8f0;
//                 }

//                 .form-block h3 svg {
//                     color: #3b82f6;
//                 }

//                 .form-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 16px;
//                 }

//                 @media (min-width: 640px) {
//                     .form-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 @media (min-width: 1024px) {
//                     .form-grid {
//                         grid-template-columns: repeat(3, 1fr);
//                     }
//                 }

//                 .span-2 {
//                     grid-column: 1 / -1;
//                 }

//                 .form-field {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 6px;
//                 }

//                 .form-field.checkbox-field {
//                     flex-direction: row;
//                     align-items: center;
//                     gap: 10px;
//                 }

//                 .form-field label {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #475569;
//                     text-transform: uppercase;
//                     letter-spacing: 0.3px;
//                 }

//                 .checkbox-label {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     cursor: pointer;
//                     font-size: 0.875rem;
//                     font-weight: normal;
//                     text-transform: none;
//                     color: #334155;
//                 }

//                 .checkbox-label input[type="checkbox"] {
//                     width: 18px;
//                     height: 18px;
//                     cursor: pointer;
//                 }

//                 .form-field input,
//                 .form-field select,
//                 .form-field textarea {
//                     padding: 10px 14px;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     font-size: 0.938rem;
//                     transition: all 0.2s ease;
//                     background: white;
//                 }

//                 .form-field input:focus,
//                 .form-field select:focus,
//                 .form-field textarea:focus {
//                     outline: none;
//                     border-color: #3b82f6;
//                     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//                 }

//                 .form-field input.error {
//                     border-color: #ef4444;
//                 }

//                 .error-text {
//                     font-size: 0.688rem;
//                     color: #ef4444;
//                 }

//                 .required {
//                     color: #ef4444;
//                 }

//                 .hint {
//                     font-size: 0.688rem;
//                     color: #94a3b8;
//                 }

//                 /* ==================== TOGGLE ==================== */
//                 .toggle-field {
//                     margin: 4px 0;
//                 }

//                 .toggle {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     cursor: pointer;
//                     position: relative;
//                 }

//                 .toggle input {
//                     display: none;
//                 }

//                 .toggle-slider {
//                     position: relative;
//                     width: 44px;
//                     height: 24px;
//                     background: #cbd5e1;
//                     border-radius: 12px;
//                     transition: all 0.2s ease;
//                 }

//                 .toggle-slider::before {
//                     content: '';
//                     position: absolute;
//                     top: 2px;
//                     left: 2px;
//                     width: 20px;
//                     height: 20px;
//                     background: white;
//                     border-radius: 50%;
//                     transition: all 0.2s ease;
//                 }

//                 .toggle input:checked + .toggle-slider {
//                     background: #3b82f6;
//                 }

//                 .toggle input:checked + .toggle-slider::before {
//                     left: 22px;
//                 }

//                 /* ==================== NOTIFICATIONS GRID ==================== */
//                 .notifications-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 12px;
//                     margin-bottom: 20px;
//                 }

//                 @media (min-width: 640px) {
//                     .notifications-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 .notification-card {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     padding: 16px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 12px;
//                 }

//                 .notification-icon {
//                     flex-shrink: 0;
//                 }

//                 .notification-info {
//                     flex: 1;
//                 }

//                 .notification-info h4 {
//                     font-size: 0.875rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0 0 4px 0;
//                 }

//                 .notification-info p {
//                     font-size: 0.688rem;
//                     color: #64748b;
//                     margin: 0;
//                 }

//                 /* ==================== FEATURES GRID ==================== */
//                 .features-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 12px;
//                     margin-bottom: 20px;
//                 }

//                 @media (min-width: 640px) {
//                     .features-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 @media (min-width: 1024px) {
//                     .features-grid {
//                         grid-template-columns: repeat(3, 1fr);
//                     }
//                 }

//                 .feature-card {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     padding: 16px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 12px;
//                 }

//                 .feature-icon {
//                     flex-shrink: 0;
//                 }

//                 .feature-content {
//                     flex: 1;
//                 }

//                 .feature-content h4 {
//                     font-size: 0.875rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0 0 4px 0;
//                 }

//                 .feature-content p {
//                     font-size: 0.688rem;
//                     color: #64748b;
//                     margin: 0;
//                 }

//                 .feature-status {
//                     display: flex;
//                     flex-direction: column;
//                     align-items: flex-end;
//                     gap: 6px;
//                 }

//                 .plan-badge {
//                     padding: 4px 8px;
//                     border-radius: 20px;
//                     font-size: 0.625rem;
//                     font-weight: 600;
//                     white-space: nowrap;
//                 }

//                 .plan-badge.active {
//                     background: #d1fae5;
//                     color: #065f46;
//                 }

//                 .plan-badge.inactive {
//                     background: #f1f5f9;
//                     color: #64748b;
//                 }

//                 .toggle-switch {
//                     width: 40px;
//                     height: 20px;
//                     background: #e2e8f0;
//                     border-radius: 10px;
//                     border: none;
//                     position: relative;
//                     cursor: pointer;
//                     transition: background 0.2s ease;
//                 }

//                 .toggle-switch.active {
//                     background: #3b82f6;
//                 }

//                 .toggle-switch:disabled {
//                     opacity: 0.5;
//                     cursor: not-allowed;
//                 }

//                 .toggle-handle {
//                     width: 16px;
//                     height: 16px;
//                     background: white;
//                     border-radius: 50%;
//                     position: absolute;
//                     top: 2px;
//                     left: 2px;
//                     transition: transform 0.2s ease;
//                 }

//                 .toggle-switch.active .toggle-handle {
//                     transform: translateX(20px);
//                 }

//                 /* ==================== LIMITS GRID ==================== */
//                 .limits-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 12px;
//                     margin-bottom: 20px;
//                 }

//                 @media (min-width: 640px) {
//                     .limits-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 @media (min-width: 1024px) {
//                     .limits-grid {
//                         grid-template-columns: repeat(3, 1fr);
//                     }
//                 }

//                 .limit-card {
//                     padding: 16px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 12px;
//                 }

//                 .limit-icon {
//                     margin-bottom: 12px;
//                 }

//                 .limit-card h4 {
//                     font-size: 0.813rem;
//                     font-weight: 600;
//                     color: #475569;
//                     margin: 0 0 12px 0;
//                 }

//                 .limit-input-group {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                 }

//                 .limit-input {
//                     width: 100px;
//                     padding: 8px 12px;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     font-size: 0.875rem;
//                     text-align: center;
//                 }

//                 .limit-input.error {
//                     border-color: #ef4444;
//                 }

//                 .limit-unit {
//                     font-size: 0.688rem;
//                     color: #64748b;
//                 }

//                 /* ==================== PLANS GRID ==================== */
//                 .plans-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 16px;
//                     margin-bottom: 20px;
//                 }

//                 @media (min-width: 640px) {
//                     .plans-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 @media (min-width: 1024px) {
//                     .plans-grid {
//                         grid-template-columns: repeat(4, 1fr);
//                     }
//                 }

//                 .plan-card {
//                     background: white;
//                     border: 2px solid #e2e8f0;
//                     border-radius: 12px;
//                     overflow: hidden;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .plan-card:hover {
//                     transform: translateY(-2px);
//                     box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
//                 }

//                 .plan-card.active {
//                     border-color: #3b82f6;
//                     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//                 }

//                 .plan-header {
//                     padding: 16px;
//                     border-bottom: 2px solid;
//                     text-align: center;
//                 }

//                 .plan-header h4 {
//                     font-size: 1rem;
//                     font-weight: 700;
//                     color: #0f172a;
//                     margin: 0;
//                 }

//                 .plan-features {
//                     padding: 16px;
//                 }

//                 .plan-features ul {
//                     list-style: none;
//                     padding: 0;
//                     margin: 0;
//                 }

//                 .plan-features li {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     margin-bottom: 8px;
//                     font-size: 0.75rem;
//                     color: #475569;
//                 }

//                 .plan-features li svg {
//                     flex-shrink: 0;
//                 }

//                 .plan-footer {
//                     padding: 16px;
//                     border-top: 1px solid #e2e8f0;
//                     text-align: center;
//                 }

//                 .current-plan-badge {
//                     display: inline-block;
//                     padding: 8px 16px;
//                     background: #f1f5f9;
//                     color: #64748b;
//                     border-radius: 30px;
//                     font-size: 0.75rem;
//                     font-weight: 600;
//                 }

//                 .upgrade-button {
//                     width: 100%;
//                     padding: 8px 16px;
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
//                     font-size: 0.75rem;
//                     font-weight: 600;
//                     cursor: pointer;
//                     transition: opacity 0.2s ease;
//                 }

//                 .upgrade-button:hover {
//                     opacity: 0.9;
//                 }

//                 /* ==================== SUBSCRIPTION DETAILS ==================== */
//                 .subscription-details {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 12px;
//                     padding: 16px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 12px;
//                 }

//                 .detail-item {
//                     display: flex;
//                     align-items: center;
//                     gap: 16px;
//                 }

//                 .detail-label {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #475569;
//                     min-width: 100px;
//                 }

//                 .detail-value {
//                     font-size: 0.875rem;
//                     color: #0f172a;
//                 }

//                 .detail-select {
//                     padding: 6px 12px;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 6px;
//                     font-size: 0.875rem;
//                     background: white;
//                 }

//                 .status-badge {
//                     padding: 4px 12px;
//                     border-radius: 20px;
//                     font-size: 0.688rem;
//                     font-weight: 600;
//                 }

//                 .status-badge.active {
//                     background: #d1fae5;
//                     color: #065f46;
//                 }

//                 .status-badge.inactive {
//                     background: #fee2e2;
//                     color: #991b1b;
//                 }

//                 /* ==================== INFO BOX ==================== */
//                 .info-box {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     padding: 16px;
//                     background: #eef2ff;
//                     border: 1px solid #c7d2fe;
//                     border-radius: 12px;
//                 }

//                 .info-box svg {
//                     flex-shrink: 0;
//                     color: #3b82f6;
//                 }

//                 .info-box p {
//                     color: #1e40af;
//                     font-size: 0.813rem;
//                     margin: 0;
//                 }

//                 /* ==================== MOBILE SAVE ==================== */
//                 .mobile-save {
//                     display: none;
//                     position: fixed;
//                     bottom: 0;
//                     left: 0;
//                     right: 0;
//                     padding: 16px;
//                     background: linear-gradient(to top, #f1f5f9, transparent);
//                     z-index: 100;
//                 }

//                 .mobile-save-btn {
//                     width: 100%;
//                     padding: 16px;
//                     background: #3b82f6;
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
//                     font-size: 1rem;
//                     font-weight: 600;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
//                 }

//                 /* ==================== RESPONSIVE ==================== */
//                 @media (max-width: 1024px) {
//                     .stats-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 @media (max-width: 768px) {
//                     .page-header {
//                         padding: 16px;
//                     }

//                     .header-content {
//                         flex-direction: column;
//                         gap: 16px;
//                         align-items: flex-start;
//                     }

//                     .page-title {
//                         font-size: 1.25rem;
//                     }

//                     .page-description {
//                         font-size: 0.813rem;
//                     }

//                     .header-actions {
//                         width: 100%;
//                         justify-content: flex-end;
//                     }

//                     .save-button {
//                         display: none;
//                     }

//                     .mobile-save {
//                         display: block;
//                     }

//                     .desktop-tabs {
//                         display: none;
//                     }

//                     .stats-grid {
//                         grid-template-columns: 1fr;
//                         gap: 12px;
//                     }

//                     .section-header {
//                         padding: 16px;
//                     }

//                     .section-header-left {
//                         gap: 12px;
//                     }

//                     .section-icon {
//                         width: 36px;
//                         height: 36px;
//                     }

//                     .section-icon svg {
//                         width: 18px;
//                         height: 18px;
//                     }

//                     .section-title h2 {
//                         font-size: 0.938rem;
//                     }

//                     .section-title p {
//                         font-size: 0.688rem;
//                     }

//                     .section-content {
//                         padding: 0 16px 16px 16px;
//                     }

//                     .form-block h3 {
//                         font-size: 0.813rem;
//                     }

//                     .notification-card {
//                         flex-wrap: wrap;
//                     }

//                     .feature-card {
//                         flex-wrap: wrap;
//                     }

//                     .feature-status {
//                         flex-direction: row;
//                         align-items: center;
//                         width: 100%;
//                         justify-content: space-between;
//                     }

//                     .plan-card {
//                         max-width: 300px;
//                         margin: 0 auto;
//                     }

//                     .detail-item {
//                         flex-direction: column;
//                         align-items: flex-start;
//                         gap: 4px;
//                     }
//                 }

//                 @media (max-width: 480px) {
//                     .main-content {
//                         padding: 16px 16px 90px 16px;
//                     }

//                     .stats-grid {
//                         margin-bottom: 20px;
//                     }

//                     .stat-card {
//                         padding: 12px;
//                     }

//                     .stat-icon {
//                         width: 40px;
//                         height: 40px;
//                     }

//                     .stat-icon svg {
//                         width: 18px;
//                         height: 18px;
//                     }

//                     .stat-value {
//                         font-size: 0.875rem;
//                     }

//                     .form-field input,
//                     .form-field select,
//                     .form-field textarea {
//                         padding: 8px 12px;
//                         font-size: 0.875rem;
//                     }

//                     .limit-input-group {
//                         flex-direction: column;
//                         align-items: flex-start;
//                     }

//                     .limit-input {
//                         width: 100%;
//                     }
//                 }
//             `}</style>
//         </>
//     );
// }


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
    Shield, Zap, Settings, Box, Building2, X, Edit2, Trash2,
    ChevronRight, Layers, Layout, Info, ShieldCheck,
    CheckCircle, AlertTriangle, XCircle, Eye, EyeOff,
    Star, Heart, Gift, HeadphonesIcon, MapPin, FileText,
    Palette, Landmark, Receipt, Camera, Video, Mic,
    Paperclip, Smile, Calendar as CalendarIcon, ArrowLeft,
    ArrowRight, Grid, List, RefreshCw, Filter as FilterIcon,
    Home, Settings2, User, LogOut, ChevronLeft, Search,
    MoreVertical, Copy, Download, Printer, Share2, Bookmark,
    ThumbsUp, ThumbsDown, MessageSquare as MessageSquareIcon,
    Send, Upload, Image as ImageIcon, Link2, Globe2,
    Facebook, Instagram, Twitter, Youtube, Linkedin,
    TwitterIcon, Linkedin as LinkedinIcon, AtSign, Hash,
    Wifi, WifiOff, Battery, BatteryCharging, Cpu, HardDrive,
    Server, Cloud, CloudOff, Download as DownloadIcon,
    Upload as UploadIcon, Repeat, Shuffle, Play, Pause,
    Square, Circle, Triangle, Hexagon, Octagon, Diamond,
    Gem, Crown, Sparkle, Sparkles, Brush, Palette as PaletteIcon,
    FileSignature, Stamp, HeadphonesIcon as HeadphonesIcon2,
    PhoneCall, MailOpen, MapPinHouse, Building, Store,
    HelpCircle, MessageCircle, RotateCcw, Activity,
    Box as BoxIcon, Package as PackageIcon, Truck,
    ShieldCheck as ShieldCheckIcon, Key, Lock, Unlock,
    Route, Map, Navigation
} from 'lucide-react';

// ==================== CONSTANTS ====================
const TABS = [
    { 
        id: 'general', 
        title: 'General', 
        icon: Globe, 
        color: '#3b82f6',
        description: 'Basic application settings and preferences'
    },
    { 
        id: 'ecommerce', 
        title: 'E-Commerce', 
        icon: ShoppingCart, 
        color: '#8b5cf6',
        description: 'Configure online store and payment options'
    },
    { 
        id: 'booking', 
        title: 'Booking', 
        icon: Calendar, 
        color: '#ec4899',
        description: 'Booking and appointment settings'
    },
    { 
        id: 'notifications', 
        title: 'Notifications', 
        icon: Bell, 
        color: '#f59e0b',
        description: 'Configure notification channels'
    },
    { 
        id: 'features', 
        title: 'Features', 
        icon: Award, 
        color: '#10b981',
        description: 'Enable or disable advanced features'
    },
    { 
        id: 'limits', 
        title: 'Limits', 
        icon: Users, 
        color: '#6366f1',
        description: 'Set usage limits and restrictions'
    },
    { 
        id: 'subscription', 
        title: 'Subscription', 
        icon: CreditCard, 
        color: '#f43f5e',
        description: 'Manage your plan and subscription'
    }
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
    const [expandedSections, setExpandedSections] = useState(['general']);
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState(null);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [tenantId, setTenantId] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        general: {
            appName: '',
            supportEmail: '',
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            dateFormat: 'dd/mm/yyyy',
            timeFormat: '12h'
        },
        ecommerce: {
            enabled: true,
            allowCOD: true,
            taxPercent: 18,
            shippingCharge: 0,
            freeShippingThreshold: 500,
            currencySymbol: '₹',
            showTaxBreakdown: true,
            enableReviews: true,
            enableWishlist: true,
            enableCompare: false,
            orderFlowMode: 'long' // Add this field with default value
        },
        booking: {
            enabled: true,
            maxBookingsPerDay: 50,
            cancellationHours: 24,
            autoApproval: false,
            bufferTime: 30,
            advanceBookingDays: 30,
            allowWeekendBooking: true,
            maxGuestsPerBooking: 10
        },
        notifications: {
            email: true,
            sms: false,
            whatsapp: true,
            pushNotifications: false,
            orderUpdates: true,
            bookingReminders: true,
            marketingEmails: false,
            abandonedCart: true
        },
        features: {
            coupons: false,
            referrals: false,
            analytics: true,
            multiVendor: false,
            giftCards: false,
            loyaltyPoints: false,
            subscriptions: false,
            bulkDiscount: false
        },
        limits: {
            maxUsers: 5,
            maxProducts: 500,
            maxBookingsPerMonth: 300,
            maxCategories: 50,
            maxImagesPerProduct: 10,
            maxFileSize: 10,
            storageLimit: 1024,
            apiRateLimit: 1000
        },
        subscription: {
            planName: 'free',
            expiresAt: null,
            isActive: true,
            billingCycle: 'monthly',
            autoRenew: true
        }
    });

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

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

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
            showToast('error', 'Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        if (!validateForm()) return;
        
        setSaving(true);
        setErrors({});
        
        try {
            const res = await fetch('/api/config', {
                method: 'PUT',
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
                showToast('success', 'Configuration saved successfully!');
            } else {
                showToast('error', data.error || 'Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            showToast('error', 'Network error. Please try again.');
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
                showToast('success', `Feature ${featureName} toggled!`);
            }
        } catch (error) {
            console.error('Error toggling feature:', error);
            showToast('error', 'Failed to toggle feature');
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
                showToast('success', `Plan updated to ${planName}!`);
            }
        } catch (error) {
            console.error('Error updating plan:', error);
            showToast('error', 'Failed to update plan');
        }
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
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
        
        if (formData.ecommerce?.freeShippingThreshold < 0) {
            newErrors.freeShippingThreshold = 'Threshold cannot be negative';
        }
        
        // Validate orderFlowMode
        if (formData.ecommerce?.orderFlowMode && !['long', 'short'].includes(formData.ecommerce.orderFlowMode)) {
            newErrors.orderFlowMode = 'Order flow mode must be either "long" or "short"';
        }
        
        if (formData.booking?.maxBookingsPerDay < 1) {
            newErrors.maxBookingsPerDay = 'At least 1 booking required';
        }
        
        if (formData.booking?.cancellationHours < 0) {
            newErrors.cancellationHours = 'Hours cannot be negative';
        }
        
        if (formData.booking?.bufferTime < 0) {
            newErrors.bufferTime = 'Buffer time cannot be negative';
        }
        
        if (formData.booking?.maxGuestsPerBooking < 1) {
            newErrors.maxGuestsPerBooking = 'At least 1 guest allowed';
        }
        
        if (formData.limits?.maxUsers < 1) {
            newErrors.maxUsers = 'At least 1 user required';
        }
        
        if (formData.limits?.maxProducts < 0) {
            newErrors.maxProducts = 'Products cannot be negative';
        }
        
        if (formData.limits?.maxImagesPerProduct < 1) {
            newErrors.maxImagesPerProduct = 'At least 1 image allowed';
        }
        
        if (formData.limits?.maxFileSize < 1) {
            newErrors.maxFileSize = 'File size must be at least 1 MB';
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
            if (confirm(`Change to ${PLANS.find(p => p.value === plan)?.label} plan?`)) {
                updatePlan(plan);
            }
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(id => id !== sectionId);
            } else {
                return [...prev, sectionId];
            }
        });
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (!expandedSections.includes(tabId)) {
            setExpandedSections(prev => [...prev, tabId]);
        }
    };

    const expandAll = () => {
        setExpandedSections(TABS.map(t => t.id));
    };

    const collapseAll = () => {
        setExpandedSections([]);
    };

    // ==================== RENDER HELPERS ====================
    
    const getPlanColor = (planValue) => {
        const plan = PLANS.find(p => p.value === planValue);
        return plan?.color || '#6B7280';
    };

    const getStatusIcon = (isActive) => {
        return isActive ? 
            <CheckCircle size={16} className="status-icon active" /> : 
            <XCircle size={16} className="status-icon inactive" />;
    };

    // ==================== LOADING STATE ====================
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-grid">
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                </div>
                <p className="loading-text">Loading configuration...</p>
                <style jsx>{`
                    .loading-container {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                    }
                    .loading-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                        margin-bottom: 24px;
                    }
                    .loading-card {
                        width: 80px;
                        height: 80px;
                        background: white;
                        border-radius: 12px;
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    .loading-card:nth-child(2) {
                        animation-delay: 0.2s;
                    }
                    .loading-card:nth-child(3) {
                        animation-delay: 0.4s;
                    }
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 0.6;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.05);
                        }
                    }
                    .loading-text {
                        color: #64748b;
                        font-size: 0.875rem;
                        font-weight: 500;
                    }
                `}</style>
            </div>
        );
    }

    // ==================== MAIN RENDER ====================
    
    return (
        <>
            <Head>
                <title>Configuration | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Manage your application configuration and settings" />
            </Head>

            <div className="config-page">
                {/* Toast Notification */}
                {toast.show && (
                    <div className={`toast-notification ${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <header className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="page-title">
                                <Settings size={28} className="title-icon" />
                                Configuration
                            </h1>
                            <p className="page-description">
                                Manage all your application settings in one place
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={expandAll}
                                className="header-action-btn"
                                title="Expand all sections"
                            >
                                <Layers size={18} />
                            </button>
                            <button
                                onClick={collapseAll}
                                className="header-action-btn"
                                title="Collapse all sections"
                            >
                                <Layout size={18} />
                            </button>
                            <button
                                onClick={saveConfig}
                                disabled={saving}
                                className="save-button"
                            >
                                {saving ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Desktop Horizontal Tabs - More Visible with Straight Edges */}
                <div className="desktop-tabs">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => handleTabClick(tab.id)}
                            >
                                <div className="tab-icon" style={{ 
                                    backgroundColor: activeTab === tab.id ? `${tab.color}20` : 'transparent',
                                    color: activeTab === tab.id ? tab.color : '#64748b'
                                }}>
                                    <Icon size={20} />
                                </div>
                                <span className="tab-title" style={{
                                    color: activeTab === tab.id ? '#0f172a' : '#64748b',
                                    fontWeight: activeTab === tab.id ? '600' : '500'
                                }}>{tab.title}</span>
                                {activeTab === tab.id && (
                                    <div className="active-indicator" style={{ backgroundColor: tab.color }}></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <main className="main-content">
                    {/* Stats Overview */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                                <Globe size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{formData.general?.appName || 'Not set'}</span>
                                <span className="stat-label">App Name</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                                <Award size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">
                                    {PLANS.find(p => p.value === formData.subscription?.planName)?.label || 'Free'}
                                </span>
                                <span className="stat-label">Current Plan</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                                <Users size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{formData.limits?.maxUsers || 0}</span>
                                <span className="stat-label">Max Users</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                                <Package size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{formData.limits?.maxProducts || 0}</span>
                                <span className="stat-label">Max Products</span>
                            </div>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="sections-container">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isExpanded = expandedSections.includes(tab.id);
                            
                            return (
                                <div key={tab.id} className={`section-card ${activeTab === tab.id ? 'active' : ''}`}>
                                    {/* Section Header */}
                                    <div 
                                        className="section-header"
                                        onClick={() => toggleSection(tab.id)}
                                    >
                                        <div className="section-header-left">
                                            <div 
                                                className="section-icon"
                                                style={{ background: `${tab.color}15`, color: tab.color }}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div className="section-title">
                                                <h2>{tab.title}</h2>
                                                <p>{tab.description}</p>
                                            </div>
                                        </div>
                                        <div className="section-header-right">
                                            <ChevronRight 
                                                size={20} 
                                                className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
                                                style={{
                                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s ease'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Section Content */}
                                    {isExpanded && (
                                        <div className="section-content">
                                            {/* General Tab */}
                                            {tab.id === 'general' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Globe size={16} />
                                                            Basic Information
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Application Name <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="general.appName"
                                                                    value={formData.general?.appName}
                                                                    onChange={handleInputChange}
                                                                    className={errors.appName ? 'error' : ''}
                                                                    placeholder="e.g., My Store"
                                                                />
                                                                {errors.appName && <span className="error-text">{errors.appName}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Support Email</label>
                                                                <input
                                                                    type="email"
                                                                    name="general.supportEmail"
                                                                    value={formData.general?.supportEmail}
                                                                    onChange={handleInputChange}
                                                                    className={errors.supportEmail ? 'error' : ''}
                                                                    placeholder="support@example.com"
                                                                />
                                                                {errors.supportEmail && <span className="error-text">{errors.supportEmail}</span>}
                                                                <span className="hint">Used for customer support and notifications</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Settings size={16} />
                                                            Regional Settings
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Currency</label>
                                                                <select
                                                                    name="general.currency"
                                                                    value={formData.general?.currency}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    {CURRENCIES.map(currency => (
                                                                        <option key={currency.value} value={currency.value}>
                                                                            {currency.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Timezone</label>
                                                                <select
                                                                    name="general.timezone"
                                                                    value={formData.general?.timezone}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    {TIMEZONES.map(tz => (
                                                                        <option key={tz} value={tz}>{tz}</option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Date Format</label>
                                                                <select
                                                                    name="general.dateFormat"
                                                                    value={formData.general?.dateFormat}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                                                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                                                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                                                </select>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Time Format</label>
                                                                <select
                                                                    name="general.timeFormat"
                                                                    value={formData.general?.timeFormat}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="12h">12-hour (AM/PM)</option>
                                                                    <option value="24h">24-hour</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <Info size={20} />
                                                        <p>
                                                            <strong>Note:</strong> These settings affect how dates, times, and currencies are displayed throughout the application.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* E-Commerce Tab */}
                                            {tab.id === 'ecommerce' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <ShoppingCart size={16} />
                                                            Store Settings
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field checkbox-field">
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

                                                            <div className="form-field checkbox-field">
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

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="ecommerce.showTaxBreakdown"
                                                                        checked={formData.ecommerce?.showTaxBreakdown}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Show Tax Breakdown</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <DollarSign size={16} />
                                                            Pricing & Charges
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Tax Percentage (%)</label>
                                                                <input
                                                                    type="number"
                                                                    name="ecommerce.taxPercent"
                                                                    value={formData.ecommerce?.taxPercent}
                                                                    onChange={handleInputChange}
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.1"
                                                                    className={errors.taxPercent ? 'error' : ''}
                                                                />
                                                                {errors.taxPercent && <span className="error-text">{errors.taxPercent}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Shipping Charge (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    name="ecommerce.shippingCharge"
                                                                    value={formData.ecommerce?.shippingCharge}
                                                                    onChange={handleInputChange}
                                                                    min="0"
                                                                    step="0.01"
                                                                    className={errors.shippingCharge ? 'error' : ''}
                                                                />
                                                                {errors.shippingCharge && <span className="error-text">{errors.shippingCharge}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Free Shipping Threshold (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    name="ecommerce.freeShippingThreshold"
                                                                    value={formData.ecommerce?.freeShippingThreshold}
                                                                    onChange={handleInputChange}
                                                                    min="0"
                                                                    step="0.01"
                                                                    className={errors.freeShippingThreshold ? 'error' : ''}
                                                                />
                                                                {errors.freeShippingThreshold && <span className="error-text">{errors.freeShippingThreshold}</span>}
                                                                <span className="hint">Set to 0 to disable free shipping</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* NEW: Order Flow Configuration Section */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Route size={16} />
                                                            Order Flow Configuration
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Order Collection Mode</label>
                                                                <div className="radio-group">
                                                                    <label className={`radio-label ${formData.ecommerce?.orderFlowMode === 'long' ? 'selected' : ''}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="ecommerce.orderFlowMode"
                                                                            value="long"
                                                                            checked={formData.ecommerce?.orderFlowMode === 'long'}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <div className="radio-content">
                                                                            <div className="radio-header">
                                                                                <strong>Long Version (Step by Step) - Default</strong>
                                                                                {formData.ecommerce?.orderFlowMode === 'long' && (
                                                                                    <span className="active-badge">Active</span>
                                                                                )}
                                                                            </div>
                                                                            <p className="radio-description">
                                                                                • Collect address one field at a time (Door No → Street → Area → City → State → Pincode)<br/>
                                                                                • Product confirmation step before address<br/>
                                                                                • Final confirmation before place order<br/>
                                                                                • More detailed, guided process for customers
                                                                            </p>
                                                                            <div className="flow-preview">
                                                                                <span className="preview-label">Flow Preview:</span>
                                                                                <code>Order → Product → Confirm → Door No → Street → Area → City → State → Pincode → Final → Payment</code>
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                    
                                                                    <label className={`radio-label ${formData.ecommerce?.orderFlowMode === 'short' ? 'selected' : ''}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="ecommerce.orderFlowMode"
                                                                            value="short"
                                                                            checked={formData.ecommerce?.orderFlowMode === 'short'}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <div className="radio-content">
                                                                            <div className="radio-header">
                                                                                <strong>Short Version (Quick Order)</strong>
                                                                                {formData.ecommerce?.orderFlowMode === 'short' && (
                                                                                    <span className="active-badge">Active</span>
                                                                                )}
                                                                            </div>
                                                                            <p className="radio-description">
                                                                                • Collect full address in one message<br/>
                                                                                • Format: Door No, Street, Area, City, State - Pincode<br/>
                                                                                • Skip product confirmation step<br/>
                                                                                • Direct to place order after address<br/>
                                                                                • Faster checkout experience
                                                                            </p>
                                                                            <div className="flow-preview">
                                                                                <span className="preview-label">Flow Preview:</span>
                                                                                <code>Order → Product → Full Address → Final → Payment</code>
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                                {errors.orderFlowMode && <span className="error-text">{errors.orderFlowMode}</span>}
                                                                <span className="hint">
                                                                    <Info size={14} /> 
                                                                    Choose how customers enter their shipping address during WhatsApp checkout. 
                                                                    Long version provides step-by-step guidance, short version is faster for experienced customers.
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Heart size={16} />
                                                            Customer Features
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="ecommerce.enableReviews"
                                                                        checked={formData.ecommerce?.enableReviews}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Enable Product Reviews</span>
                                                                </label>
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="ecommerce.enableWishlist"
                                                                        checked={formData.ecommerce?.enableWishlist}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Enable Wishlist</span>
                                                                </label>
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="ecommerce.enableCompare"
                                                                        checked={formData.ecommerce?.enableCompare}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Enable Product Comparison</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <ShoppingCart size={20} />
                                                        <p>
                                                            <strong>Tip:</strong> Enable COD for customers who prefer to pay on delivery. Free shipping can increase average order value.
                                                            The order flow mode affects how customers enter their address during WhatsApp checkout.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Booking Tab */}
                                            {tab.id === 'booking' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Calendar size={16} />
                                                            Booking Settings
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field checkbox-field span-2">
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

                                                            <div className="form-field checkbox-field span-2">
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

                                                            <div className="form-field checkbox-field span-2">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="booking.allowWeekendBooking"
                                                                        checked={formData.booking?.allowWeekendBooking}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Allow weekend bookings</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Clock size={16} />
                                                            Booking Limits
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Max Bookings Per Day</label>
                                                                <input
                                                                    type="number"
                                                                    name="booking.maxBookingsPerDay"
                                                                    value={formData.booking?.maxBookingsPerDay}
                                                                    onChange={handleInputChange}
                                                                    min="1"
                                                                    className={errors.maxBookingsPerDay ? 'error' : ''}
                                                                />
                                                                {errors.maxBookingsPerDay && <span className="error-text">{errors.maxBookingsPerDay}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Max Guests Per Booking</label>
                                                                <input
                                                                    type="number"
                                                                    name="booking.maxGuestsPerBooking"
                                                                    value={formData.booking?.maxGuestsPerBooking}
                                                                    onChange={handleInputChange}
                                                                    min="1"
                                                                    className={errors.maxGuestsPerBooking ? 'error' : ''}
                                                                />
                                                                {errors.maxGuestsPerBooking && <span className="error-text">{errors.maxGuestsPerBooking}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Cancellation Hours</label>
                                                                <input
                                                                    type="number"
                                                                    name="booking.cancellationHours"
                                                                    value={formData.booking?.cancellationHours}
                                                                    onChange={handleInputChange}
                                                                    min="0"
                                                                    className={errors.cancellationHours ? 'error' : ''}
                                                                />
                                                                {errors.cancellationHours && <span className="error-text">{errors.cancellationHours}</span>}
                                                                <span className="hint">Hours before booking to cancel</span>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Buffer Time (minutes)</label>
                                                                <input
                                                                    type="number"
                                                                    name="booking.bufferTime"
                                                                    value={formData.booking?.bufferTime}
                                                                    onChange={handleInputChange}
                                                                    min="0"
                                                                    step="5"
                                                                    className={errors.bufferTime ? 'error' : ''}
                                                                />
                                                                {errors.bufferTime && <span className="error-text">{errors.bufferTime}</span>}
                                                                <span className="hint">Time between consecutive bookings</span>
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Advance Booking Days</label>
                                                                <input
                                                                    type="number"
                                                                    name="booking.advanceBookingDays"
                                                                    value={formData.booking?.advanceBookingDays}
                                                                    onChange={handleInputChange}
                                                                    min="1"
                                                                    className={errors.advanceBookingDays ? 'error' : ''}
                                                                />
                                                                {errors.advanceBookingDays && <span className="error-text">{errors.advanceBookingDays}</span>}
                                                                <span className="hint">How far in advance customers can book</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <Calendar size={20} />
                                                        <p>
                                                            <strong>Note:</strong> Set cancellation hours to 0 for no-cancellation policy. Buffer time prevents back-to-back bookings.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Notifications Tab */}
                                            {tab.id === 'notifications' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Bell size={16} />
                                                            Notification Channels
                                                        </h3>
                                                        <div className="notifications-grid">
                                                            <div className="notification-card">
                                                                <Mail size={24} className="notification-icon" style={{ color: '#3b82f6' }} />
                                                                <div className="notification-info">
                                                                    <h4>Email Notifications</h4>
                                                                    <p>Order confirmations and updates via email</p>
                                                                </div>
                                                                <div className="toggle-field">
                                                                    <label className="toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="notifications.email"
                                                                            checked={formData.notifications?.email}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <span className="toggle-slider"></span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="notification-card">
                                                                <Phone size={24} className="notification-icon" style={{ color: '#8b5cf6' }} />
                                                                <div className="notification-info">
                                                                    <h4>SMS Notifications</h4>
                                                                    <p>Order updates via SMS (charges may apply)</p>
                                                                </div>
                                                                <div className="toggle-field">
                                                                    <label className="toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="notifications.sms"
                                                                            checked={formData.notifications?.sms}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <span className="toggle-slider"></span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="notification-card">
                                                                <MessageSquare size={24} className="notification-icon" style={{ color: '#10b981' }} />
                                                                <div className="notification-info">
                                                                    <h4>WhatsApp Notifications</h4>
                                                                    <p>Updates via WhatsApp Business API</p>
                                                                </div>
                                                                <div className="toggle-field">
                                                                    <label className="toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="notifications.whatsapp"
                                                                            checked={formData.notifications?.whatsapp}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <span className="toggle-slider"></span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="notification-card">
                                                                <Zap size={24} className="notification-icon" style={{ color: '#f59e0b' }} />
                                                                <div className="notification-info">
                                                                    <h4>Push Notifications</h4>
                                                                    <p>Browser and mobile push notifications</p>
                                                                </div>
                                                                <div className="toggle-field">
                                                                    <label className="toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="notifications.pushNotifications"
                                                                            checked={formData.notifications?.pushNotifications}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <span className="toggle-slider"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Bell size={16} />
                                                            Notification Events
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="notifications.orderUpdates"
                                                                        checked={formData.notifications?.orderUpdates}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Order Status Updates</span>
                                                                </label>
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="notifications.bookingReminders"
                                                                        checked={formData.notifications?.bookingReminders}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Booking Reminders</span>
                                                                </label>
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="notifications.marketingEmails"
                                                                        checked={formData.notifications?.marketingEmails}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Marketing Emails</span>
                                                                </label>
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="notifications.abandonedCart"
                                                                        checked={formData.notifications?.abandonedCart}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Abandoned Cart Reminders</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <Bell size={20} />
                                                        <p>
                                                            <strong>Tip:</strong> Enable multiple channels to ensure customers never miss important updates.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Features Tab */}
                                            {tab.id === 'features' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Award size={16} />
                                                            Available Features
                                                        </h3>
                                                        <div className="features-grid">
                                                            <div className="feature-card">
                                                                <Percent size={24} className="feature-icon" style={{ color: '#3b82f6' }} />
                                                                <div className="feature-content">
                                                                    <h4>Coupons & Discounts</h4>
                                                                    <p>Create and manage discount coupons</p>
                                                                </div>
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
                                                                <Users size={24} className="feature-icon" style={{ color: '#8b5cf6' }} />
                                                                <div className="feature-content">
                                                                    <h4>Referral Program</h4>
                                                                    <p>Customers can refer friends and earn rewards</p>
                                                                </div>
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
                                                                <TrendingUp size={24} className="feature-icon" style={{ color: '#10b981' }} />
                                                                <div className="feature-content">
                                                                    <h4>Advanced Analytics</h4>
                                                                    <p>Access detailed reports and insights</p>
                                                                </div>
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

                                                            <div className="feature-card">
                                                                <Store size={24} className="feature-icon" style={{ color: '#f59e0b' }} />
                                                                <div className="feature-content">
                                                                    <h4>Multi-Vendor Marketplace</h4>
                                                                    <p>Allow multiple sellers on your platform</p>
                                                                </div>
                                                                <div className="feature-status">
                                                                    <span className={`plan-badge ${formData.features?.multiVendor ? 'active' : 'inactive'}`}>
                                                                        {formData.features?.multiVendor ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => toggleFeature('multiVendor')}
                                                                        className={`toggle-switch ${formData.features?.multiVendor ? 'active' : ''}`}
                                                                        disabled={!formData.features?.multiVendor && formData.subscription?.planName === 'free'}
                                                                    >
                                                                        <span className="toggle-handle"></span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="feature-card">
                                                                <Gift size={24} className="feature-icon" style={{ color: '#ec4899' }} />
                                                                <div className="feature-content">
                                                                    <h4>Gift Cards</h4>
                                                                    <p>Sell and manage digital gift cards</p>
                                                                </div>
                                                                <div className="feature-status">
                                                                    <span className={`plan-badge ${formData.features?.giftCards ? 'active' : 'inactive'}`}>
                                                                        {formData.features?.giftCards ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => toggleFeature('giftCards')}
                                                                        className={`toggle-switch ${formData.features?.giftCards ? 'active' : ''}`}
                                                                        disabled={!formData.features?.giftCards && formData.subscription?.planName === 'free'}
                                                                    >
                                                                        <span className="toggle-handle"></span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="feature-card">
                                                                <Star size={24} className="feature-icon" style={{ color: '#f43f5e' }} />
                                                                <div className="feature-content">
                                                                    <h4>Loyalty Points</h4>
                                                                    <p>Reward customers for repeat purchases</p>
                                                                </div>
                                                                <div className="feature-status">
                                                                    <span className={`plan-badge ${formData.features?.loyaltyPoints ? 'active' : 'inactive'}`}>
                                                                        {formData.features?.loyaltyPoints ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => toggleFeature('loyaltyPoints')}
                                                                        className={`toggle-switch ${formData.features?.loyaltyPoints ? 'active' : ''}`}
                                                                        disabled={!formData.features?.loyaltyPoints && formData.subscription?.planName === 'free'}
                                                                    >
                                                                        <span className="toggle-handle"></span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <Award size={20} />
                                                        <p>
                                                            <strong>Note:</strong> Feature availability depends on your subscription plan. Upgrade to access more features.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Limits Tab */}
                                            {tab.id === 'limits' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Users size={16} />
                                                            Resource Limits
                                                        </h3>
                                                        <div className="limits-grid">
                                                            <div className="limit-card">
                                                                <Users size={24} className="limit-icon" style={{ color: '#3b82f6' }} />
                                                                <h4>Maximum Users</h4>
                                                                <div className="limit-input-group">
                                                                    <input
                                                                        type="number"
                                                                        name="limits.maxUsers"
                                                                        value={formData.limits?.maxUsers}
                                                                        onChange={handleInputChange}
                                                                        min="1"
                                                                        className={`limit-input ${errors.maxUsers ? 'error' : ''}`}
                                                                    />
                                                                    <span className="limit-unit">users</span>
                                                                </div>
                                                                {errors.maxUsers && <span className="error-text">{errors.maxUsers}</span>}
                                                            </div>

                                                            <div className="limit-card">
                                                                <Package size={24} className="limit-icon" style={{ color: '#8b5cf6' }} />
                                                                <h4>Maximum Products</h4>
                                                                <div className="limit-input-group">
                                                                    <input
                                                                        type="number"
                                                                        name="limits.maxProducts"
                                                                        value={formData.limits?.maxProducts}
                                                                        onChange={handleInputChange}
                                                                        min="0"
                                                                        className={`limit-input ${errors.maxProducts ? 'error' : ''}`}
                                                                    />
                                                                    <span className="limit-unit">products</span>
                                                                </div>
                                                                {errors.maxProducts && <span className="error-text">{errors.maxProducts}</span>}
                                                            </div>

                                                            <div className="limit-card">
                                                                <Calendar size={24} className="limit-icon" style={{ color: '#10b981' }} />
                                                                <h4>Monthly Bookings</h4>
                                                                <div className="limit-input-group">
                                                                    <input
                                                                        type="number"
                                                                        name="limits.maxBookingsPerMonth"
                                                                        value={formData.limits?.maxBookingsPerMonth}
                                                                        onChange={handleInputChange}
                                                                        min="0"
                                                                        className={`limit-input ${errors.maxBookingsPerMonth ? 'error' : ''}`}
                                                                    />
                                                                    <span className="limit-unit">bookings/mo</span>
                                                                </div>
                                                                {errors.maxBookingsPerMonth && <span className="error-text">{errors.maxBookingsPerMonth}</span>}
                                                            </div>

                                                            <div className="limit-card">
                                                                <Box size={24} className="limit-icon" style={{ color: '#f59e0b' }} />
                                                                <h4>Maximum Categories</h4>
                                                                <div className="limit-input-group">
                                                                    <input
                                                                        type="number"
                                                                        name="limits.maxCategories"
                                                                        value={formData.limits?.maxCategories}
                                                                        onChange={handleInputChange}
                                                                        min="0"
                                                                        className={`limit-input ${errors.maxCategories ? 'error' : ''}`}
                                                                    />
                                                                    <span className="limit-unit">categories</span>
                                                                </div>
                                                                {errors.maxCategories && <span className="error-text">{errors.maxCategories}</span>}
                                                            </div>

                                                            <div className="limit-card">
                                                                <ImageIcon size={24} className="limit-icon" style={{ color: '#ec4899' }} />
                                                                <h4>Images Per Product</h4>
                                                                <div className="limit-input-group">
                                                                    <input
                                                                        type="number"
                                                                        name="limits.maxImagesPerProduct"
                                                                        value={formData.limits?.maxImagesPerProduct}
                                                                        onChange={handleInputChange}
                                                                        min="1"
                                                                        className={`limit-input ${errors.maxImagesPerProduct ? 'error' : ''}`}
                                                                    />
                                                                    <span className="limit-unit">images</span>
                                                                </div>
                                                                {errors.maxImagesPerProduct && <span className="error-text">{errors.maxImagesPerProduct}</span>}
                                                            </div>

                                                            <div className="limit-card">
                                                                <HardDrive size={24} className="limit-icon" style={{ color: '#f43f5e' }} />
                                                                <h4>Storage Limit</h4>
                                                                <div className="limit-input-group">
                                                                    <input
                                                                        type="number"
                                                                        name="limits.storageLimit"
                                                                        value={formData.limits?.storageLimit}
                                                                        onChange={handleInputChange}
                                                                        min="1"
                                                                        className={`limit-input ${errors.storageLimit ? 'error' : ''}`}
                                                                    />
                                                                    <span className="limit-unit">MB</span>
                                                                </div>
                                                                {errors.storageLimit && <span className="error-text">{errors.storageLimit}</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Zap size={16} />
                                                            Performance Limits
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Max File Size (MB)</label>
                                                                <input
                                                                    type="number"
                                                                    name="limits.maxFileSize"
                                                                    value={formData.limits?.maxFileSize}
                                                                    onChange={handleInputChange}
                                                                    min="1"
                                                                    className={errors.maxFileSize ? 'error' : ''}
                                                                />
                                                                {errors.maxFileSize && <span className="error-text">{errors.maxFileSize}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>API Rate Limit (per hour)</label>
                                                                <input
                                                                    type="number"
                                                                    name="limits.apiRateLimit"
                                                                    value={formData.limits?.apiRateLimit}
                                                                    onChange={handleInputChange}
                                                                    min="1"
                                                                    className={errors.apiRateLimit ? 'error' : ''}
                                                                />
                                                                {errors.apiRateLimit && <span className="error-text">{errors.apiRateLimit}</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <Shield size={20} />
                                                        <p>
                                                            <strong>Important:</strong> These limits are enforced across your entire account. Contact support to increase limits.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Subscription Tab */}
                                            {tab.id === 'subscription' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <CreditCard size={16} />
                                                            Current Plan
                                                        </h3>
                                                        <div className="plans-grid">
                                                            {PLANS.map(plan => (
                                                                <div
                                                                    key={plan.value}
                                                                    className={`plan-card ${formData.subscription?.planName === plan.value ? 'active' : ''}`}
                                                                    onClick={() => handlePlanChange(plan.value)}
                                                                >
                                                                    <div className="plan-header" style={{ borderColor: plan.color }}>
                                                                        <h4>{plan.label}</h4>
                                                                    </div>
                                                                    <div className="plan-features">
                                                                        <ul>
                                                                            <li>
                                                                                <Check size={16} style={{ color: '#10b981' }} />
                                                                                <span>Up to {plan.value === 'free' ? '3' : plan.value === 'basic' ? '10' : plan.value === 'pro' ? '50' : '10,000'} users</span>
                                                                            </li>
                                                                            <li>
                                                                                <Check size={16} style={{ color: '#10b981' }} />
                                                                                <span>Up to {plan.value === 'free' ? '100' : plan.value === 'basic' ? '1000' : plan.value === 'pro' ? '5000' : '100,000'} products</span>
                                                                            </li>
                                                                            <li>
                                                                                <Check size={16} style={{ color: '#10b981' }} />
                                                                                <span>{plan.value === 'free' ? '100' : plan.value === 'basic' ? '500' : plan.value === 'pro' ? '2000' : '100,000'} bookings/month</span>
                                                                            </li>
                                                                            {plan.value !== 'free' && (
                                                                                <li>
                                                                                    <Check size={16} style={{ color: '#10b981' }} />
                                                                                    <span>Coupons & Discounts</span>
                                                                                </li>
                                                                            )}
                                                                            {plan.value === 'pro' && (
                                                                                <li>
                                                                                    <Check size={16} style={{ color: '#10b981' }} />
                                                                                    <span>Referral Program</span>
                                                                                </li>
                                                                            )}
                                                                            {plan.value === 'enterprise' && (
                                                                                <li>
                                                                                    <Check size={16} style={{ color: '#10b981' }} />
                                                                                    <span>Priority Support</span>
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="plan-footer">
                                                                        {formData.subscription?.planName === plan.value ? (
                                                                            <span className="current-plan-badge">Current Plan</span>
                                                                        ) : (
                                                                            <button className="upgrade-button" style={{ background: plan.color }}>
                                                                                {plan.value === 'free' ? 'Downgrade' : 'Upgrade'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Clock size={16} />
                                                            Subscription Details
                                                        </h3>
                                                        <div className="subscription-details">
                                                            <div className="detail-item">
                                                                <span className="detail-label">Billing Cycle:</span>
                                                                <select
                                                                    name="subscription.billingCycle"
                                                                    value={formData.subscription?.billingCycle}
                                                                    onChange={handleInputChange}
                                                                    className="detail-select"
                                                                >
                                                                    <option value="monthly">Monthly</option>
                                                                    <option value="yearly">Yearly (Save 20%)</option>
                                                                </select>
                                                            </div>

                                                            <div className="detail-item">
                                                                <span className="detail-label">Auto Renew:</span>
                                                                <label className="toggle">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="subscription.autoRenew"
                                                                        checked={formData.subscription?.autoRenew}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span className="toggle-slider"></span>
                                                                </label>
                                                            </div>

                                                            {formData.subscription?.expiresAt && (
                                                                <div className="detail-item">
                                                                    <span className="detail-label">Expires On:</span>
                                                                    <span className="detail-value">
                                                                        {new Date(formData.subscription.expiresAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="detail-item">
                                                                <span className="detail-label">Status:</span>
                                                                <span className={`status-badge ${formData.subscription?.isActive ? 'active' : 'inactive'}`}>
                                                                    {formData.subscription?.isActive ? 'Active' : 'Expired'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <Zap size={20} />
                                                        <p>
                                                            <strong>Tip:</strong> Upgrade your plan to unlock more features and higher limits. Enterprise plans include custom pricing and dedicated support.
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* Mobile Save Button */}
                <div className="mobile-save">
                    <button
                        onClick={saveConfig}
                        disabled={saving}
                        className="mobile-save-btn"
                    >
                        {saving ? (
                            <div className="button-spinner"></div>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .config-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                }

                /* ==================== TOAST NOTIFICATION ==================== */
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                    animation: slideInRight 0.3s ease;
                    font-size: 0.875rem;
                    max-width: 400px;
                }

                .toast-notification.success {
                    border-left: 4px solid #10b981;
                }

                .toast-notification.error {
                    border-left: 4px solid #ef4444;
                }

                .toast-notification.success svg {
                    color: #10b981;
                }

                .toast-notification.error svg {
                    color: #ef4444;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* ==================== HEADER ==================== */
                .page-header {
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 20px 24px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .page-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0;
                }

                .title-icon {
                    color: #3b82f6;
                }

                .page-description {
                    color: #64748b;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .header-action-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .header-action-btn:hover {
                    background: #f1f5f9;
                    color: #3b82f6;
                    border-color: #3b82f6;
                }

                .save-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .save-button:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
                }

                .save-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .button-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ==================== DESKTOP TABS - STRAIGHT EDGES ==================== */
                .desktop-tabs {
                    max-width: 1200px;
                    margin: 0 auto 24px auto;
                    padding: 0 24px;
                    display: none;
                    background: white;
                    border-bottom: 2px solid #e2e8f0;
                    gap: 4px;
                }

                @media (min-width: 1024px) {
                    .desktop-tabs {
                        display: flex;
                        padding: 0;
                        margin: 0 auto 24px auto;
                    }
                }

                .tab-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 16px 20px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    font-size: 0.875rem;
                    position: relative;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                }

                .tab-button:hover {
                    background: #f8fafc;
                }

                .tab-button.active {
                    background: #f8fafc;
                    border-bottom: 2px solid;
                }

                .tab-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .active-indicator {
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                }

                /* ==================== MAIN CONTENT ==================== */
                .main-content {
                    max-width: 1200px;
                    margin: 24px auto;
                    padding: 0 24px 100px 24px;
                }

                /* ==================== STATS GRID ==================== */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }

                .stat-info {
                    flex: 1;
                    min-width: 0;
                }

                .stat-value {
                    display: block;
                    font-size: 0.938rem;
                    font-weight: 600;
                    color: #0f172a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .stat-label {
                    display: block;
                    font-size: 0.688rem;
                    color: #64748b;
                    margin-top: 2px;
                }

                /* ==================== SECTIONS CONTAINER ==================== */
                .sections-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .section-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }

                @media (min-width: 1024px) {
                    .section-card:not(.active) {
                        display: none;
                    }
                }

                .section-header {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .section-header:hover {
                    background: #f8fafc;
                }

                .section-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .section-icon {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }

                .section-title h2 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .section-title p {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin: 0;
                }

                .chevron-icon {
                    color: #94a3b8;
                    transition: transform 0.3s ease;
                }

                .section-content {
                    padding: 0 24px 24px 24px;
                    border-top: 1px solid #e2e8f0;
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* ==================== FORM BLOCKS ==================== */
                .form-block {
                    margin-bottom: 28px;
                }

                .form-block:last-child {
                    margin-bottom: 0;
                }

                .form-block h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #334155;
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed #e2e8f0;
                }

                .form-block h3 svg {
                    color: #3b82f6;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 16px;
                }

                @media (min-width: 640px) {
                    .form-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .form-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .span-2 {
                    grid-column: 1 / -1;
                }

                .form-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-field.checkbox-field {
                    flex-direction: row;
                    align-items: center;
                    gap: 10px;
                }

                .form-field label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: normal;
                    text-transform: none;
                    color: #334155;
                }

                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .form-field input,
                .form-field select,
                .form-field textarea {
                    padding: 10px 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.938rem;
                    transition: all 0.2s ease;
                    background: white;
                }

                .form-field input:focus,
                .form-field select:focus,
                .form-field textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-field input.error {
                    border-color: #ef4444;
                }

                .error-text {
                    font-size: 0.688rem;
                    color: #ef4444;
                }

                .required {
                    color: #ef4444;
                }

                .hint {
                    font-size: 0.688rem;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* ==================== RADIO GROUP ==================== */
                .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-top: 8px;
                }

                .radio-label {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .radio-label:hover {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }

                .radio-label.selected {
                    background: #eff6ff;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .radio-label input[type="radio"] {
                    margin-top: 4px;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    accent-color: #3b82f6;
                }

                .radio-content {
                    flex: 1;
                }

                .radio-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .radio-header strong {
                    font-size: 1rem;
                    color: #0f172a;
                }

                .active-badge {
                    background: #3b82f6;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 30px;
                    font-size: 0.688rem;
                    font-weight: 600;
                }

                .radio-description {
                    margin: 0 0 12px 0;
                    color: #475569;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }

                .flow-preview {
                    background: #ffffff;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .preview-label {
                    display: block;
                    font-size: 0.688rem;
                    color: #64748b;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .flow-preview code {
                    font-size: 0.75rem;
                    color: #3b82f6;
                    background: #eff6ff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    display: inline-block;
                }

                /* ==================== TOGGLE ==================== */
                .toggle-field {
                    margin: 4px 0;
                }

                .toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    position: relative;
                }

                .toggle input {
                    display: none;
                }

                .toggle-slider {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background: #cbd5e1;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }

                .toggle-slider::before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .toggle input:checked + .toggle-slider {
                    background: #3b82f6;
                }

                .toggle input:checked + .toggle-slider::before {
                    left: 22px;
                }

                /* ==================== NOTIFICATIONS GRID ==================== */
                .notifications-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                @media (min-width: 640px) {
                    .notifications-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .notification-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                }

                .notification-icon {
                    flex-shrink: 0;
                }

                .notification-info {
                    flex: 1;
                }

                .notification-info h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .notification-info p {
                    font-size: 0.688rem;
                    color: #64748b;
                    margin: 0;
                }

                /* ==================== FEATURES GRID ==================== */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                @media (min-width: 640px) {
                    .features-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .features-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .feature-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                }

                .feature-icon {
                    flex-shrink: 0;
                }

                .feature-content {
                    flex: 1;
                }

                .feature-content h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .feature-content p {
                    font-size: 0.688rem;
                    color: #64748b;
                    margin: 0;
                }

                .feature-status {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 6px;
                }

                .plan-badge {
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-size: 0.625rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .plan-badge.active {
                    background: #d1fae5;
                    color: #065f46;
                }

                .plan-badge.inactive {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .toggle-switch {
                    width: 40px;
                    height: 20px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    border: none;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .toggle-switch.active {
                    background: #3b82f6;
                }

                .toggle-switch:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .toggle-handle {
                    width: 16px;
                    height: 16px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s ease;
                }

                .toggle-switch.active .toggle-handle {
                    transform: translateX(20px);
                }

                /* ==================== LIMITS GRID ==================== */
                .limits-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                @media (min-width: 640px) {
                    .limits-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .limits-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .limit-card {
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                }

                .limit-icon {
                    margin-bottom: 12px;
                }

                .limit-card h4 {
                    font-size: 0.813rem;
                    font-weight: 600;
                    color: #475569;
                    margin: 0 0 12px 0;
                }

                .limit-input-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .limit-input {
                    width: 100px;
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    text-align: center;
                }

                .limit-input.error {
                    border-color: #ef4444;
                }

                .limit-unit {
                    font-size: 0.688rem;
                    color: #64748b;
                }

                /* ==================== PLANS GRID ==================== */
                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                @media (min-width: 640px) {
                    .plans-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .plans-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .plan-card {
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .plan-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                }

                .plan-card.active {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .plan-header {
                    padding: 16px;
                    border-bottom: 2px solid;
                    text-align: center;
                }

                .plan-header h4 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }

                .plan-features {
                    padding: 16px;
                }

                .plan-features ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .plan-features li {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 0.75rem;
                    color: #475569;
                }

                .plan-features li svg {
                    flex-shrink: 0;
                }

                .plan-footer {
                    padding: 16px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                }

                .current-plan-badge {
                    display: inline-block;
                    padding: 8px 16px;
                    background: #f1f5f9;
                    color: #64748b;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .upgrade-button {
                    width: 100%;
                    padding: 8px 16px;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }

                .upgrade-button:hover {
                    opacity: 0.9;
                }

                /* ==================== SUBSCRIPTION DETAILS ==================== */
                .subscription-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .detail-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                    min-width: 100px;
                }

                .detail-value {
                    font-size: 0.875rem;
                    color: #0f172a;
                }

                .detail-select {
                    padding: 6px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    background: white;
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.688rem;
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
                    padding: 16px;
                    background: #eef2ff;
                    border: 1px solid #c7d2fe;
                    border-radius: 12px;
                }

                .info-box svg {
                    flex-shrink: 0;
                    color: #3b82f6;
                }

                .info-box p {
                    color: #1e40af;
                    font-size: 0.813rem;
                    margin: 0;
                }

                /* ==================== MOBILE SAVE ==================== */
                .mobile-save {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 16px;
                    background: linear-gradient(to top, #f1f5f9, transparent);
                    z-index: 100;
                }

                .mobile-save-btn {
                    width: 100%;
                    padding: 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
                }

                /* ==================== RESPONSIVE ==================== */
                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .page-header {
                        padding: 16px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }

                    .page-title {
                        font-size: 1.25rem;
                    }

                    .page-description {
                        font-size: 0.813rem;
                    }

                    .header-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }

                    .save-button {
                        display: none;
                    }

                    .mobile-save {
                        display: block;
                    }

                    .desktop-tabs {
                        display: none;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .section-header {
                        padding: 16px;
                    }

                    .section-header-left {
                        gap: 12px;
                    }

                    .section-icon {
                        width: 36px;
                        height: 36px;
                    }

                    .section-icon svg {
                        width: 18px;
                        height: 18px;
                    }

                    .section-title h2 {
                        font-size: 0.938rem;
                    }

                    .section-title p {
                        font-size: 0.688rem;
                    }

                    .section-content {
                        padding: 0 16px 16px 16px;
                    }

                    .form-block h3 {
                        font-size: 0.813rem;
                    }

                    .notification-card {
                        flex-wrap: wrap;
                    }

                    .feature-card {
                        flex-wrap: wrap;
                    }

                    .feature-status {
                        flex-direction: row;
                        align-items: center;
                        width: 100%;
                        justify-content: space-between;
                    }

                    .plan-card {
                        max-width: 300px;
                        margin: 0 auto;
                    }

                    .detail-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }

                    .radio-label {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .radio-label input[type="radio"] {
                        align-self: flex-start;
                    }

                    .radio-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .flow-preview code {
                        white-space: normal;
                        word-break: break-word;   
                    }
                }

                @media (max-width: 480px) {
                    .main-content {
                        padding: 16px 16px 90px 16px;
                    }

                    .stats-grid {
                        margin-bottom: 20px;
                    }

                    .stat-card {
                        padding: 12px;
                    }

                    .stat-icon {
                        width: 40px;
                        height: 40px;
                    }

                    .stat-icon svg {
                        width: 18px;
                        height: 18px;
                    }

                    .stat-value {
                        font-size: 0.875rem;
                    }

                    .form-field input,
                    .form-field select,
                    .form-field textarea {
                        padding: 8px 12px;
                        font-size: 0.875rem;
                    }

                    .limit-input-group {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .limit-input {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}