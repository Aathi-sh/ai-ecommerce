"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import {
    Building2, Mail, Phone, MapPin, CreditCard, Landmark,
    Receipt, HeadphonesIcon, Palette, Save, X, Plus,
    Trash2, Edit2, Check, AlertCircle, Loader2, Globe,
    Facebook, Instagram, Twitter, Youtube, Upload, Image as ImageIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
const TABS = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'upi', label: 'UPI IDs', icon: CreditCard },
    { id: 'bank', label: 'Bank Details', icon: Landmark },
    { id: 'invoice', label: 'Invoice Settings', icon: Receipt },
    { id: 'support', label: 'Support', icon: HeadphonesIcon },
    { id: 'branding', label: 'Branding', icon: Palette }
];

const UPI_APPS = [
    { value: 'gpay', label: 'Google Pay', color: '#4285F4' },
    { value: 'phonepe', label: 'PhonePe', color: '#5F259F' },
    { value: 'paytm', label: 'Paytm', color: '#00BAF2' },
    { value: 'bhim', label: 'BHIM', color: '#DD4B39' },
    { value: 'other', label: 'Other', color: '#6B7280' }
];

// ==================== MAIN COMPONENT ====================
export default function CompanyProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    // State management
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    
    // Form state for each section
    const [formData, setFormData] = useState({
        companyName: '',
        legalName: '',
        tagline: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        gstin: '',
        pan: '',
        cin: '',
        upiIds: [],
        bank: {
            name: '',
            account: '',
            ifsc: '',
            branch: '',
            accountType: 'Current Account'
        },
        invoiceSettings: {
            prefix: 'INV',
            separator: '-',
            dateFormat: 'dd/mm/yyyy',
            currency: '₹',
            currencyCode: 'INR',
            taxSystem: 'GST',
            gstBreakdown: true,
            showCGSTSGST: true,
            roundAmount: true,
            paymentTerms: 'Due on receipt',
            deliveryTerms: '3-5 business days after payment confirmation',
            warrantyTerms: '7 days replacement for manufacturing defects',
            refundPolicy: 'No refunds after order processing',
            footerNote: 'This is a computer generated invoice, no signature required.',
            showBankDetails: true
        },
        support: {
            email: '',
            phone: '',
            hours: 'Mon-Sat, 10:00 AM - 7:00 PM',
            whatsapp: '',
            responseTime: 'Within 30 minutes'
        },
        social: {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: '',
            linkedin: ''
        },
        businessHours: {
            monday: '9:00 AM - 8:00 PM',
            tuesday: '9:00 AM - 8:00 PM',
            wednesday: '9:00 AM - 8:00 PM',
            thursday: '9:00 AM - 8:00 PM',
            friday: '9:00 AM - 8:00 PM',
            saturday: '9:00 AM - 6:00 PM',
            sunday: 'Closed'
        },
        logo: null,
        favicon: null,
        signature: null,
        stamp: null,
        theme: {
            primary: '#2c3e50',
            secondary: '#34495e',
            accent: '#27ae60'
        }
    });

    // UPI form state
    const [upiForm, setUpiForm] = useState({
        id: '',
        name: '',
        appType: 'other',
        isActive: true,
        description: ''
    });
    const [editingUpiIndex, setEditingUpiIndex] = useState(-1);
    const [showUpiForm, setShowUpiForm] = useState(false);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch company settings
    useEffect(() => {
        fetchSettings();
    }, []);

    // ==================== API FUNCTIONS ====================
    
    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/company-settings');
            const data = await res.json();
            
            if (data.success) {
                setSettings(data.data);
                setFormData(prev => ({
                    ...prev,
                    ...data.data,
                    businessHours: { ...prev.businessHours, ...(data.data.businessHours || {}) },
                    support: { ...prev.support, ...(data.data.support || {}) },
                    social: { ...prev.social, ...(data.data.social || {}) },
                    bank: { ...prev.bank, ...(data.data.bank || {}) },
                    invoiceSettings: { ...prev.invoiceSettings, ...(data.data.invoiceSettings || {}) },
                    theme: { ...prev.theme, ...(data.data.theme || {}) }
                }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            alert('Failed to load company settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!validateForm()) return;
        
        setSaving(true);
        setSuccessMessage('');
        setErrors({});
        
        try {
            const res = await fetch('/api/company-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (data.success) {
                setSettings(data.data);
                setSuccessMessage('Settings saved successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(`Error: ${data.error || 'Failed to save settings'}`);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ==================== VALIDATION ====================
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.companyName?.trim()) {
            newErrors.companyName = 'Company name is required';
        }
        
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            const digits = formData.phone.replace(/\D/g, '');
            if (digits.length < 10) {
                newErrors.phone = 'Enter a valid phone number';
            }
        }
        
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }
        
        if (!formData.address?.trim()) {
            newErrors.address = 'Address is required';
        }
        
        if (!formData.city?.trim()) {
            newErrors.city = 'City is required';
        }
        
        if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
            newErrors.gstin = 'Enter a valid GSTIN';
        }
        
        if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
            newErrors.pan = 'Enter a valid PAN';
        }
        
        if (formData.bank?.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bank.ifsc)) {
            newErrors.bankIfsc = 'Enter a valid IFSC code';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ==================== UPI FUNCTIONS ====================
    
    const validateUpiForm = () => {
        if (!upiForm.id.trim()) {
            alert('UPI ID is required');
            return false;
        }
        if (!upiForm.id.includes('@')) {
            alert('UPI ID must include @ (e.g., name@oksbi)');
            return false;
        }
        if (!upiForm.name.trim()) {
            alert('Display name is required');
            return false;
        }
        
        const exists = formData.upiIds.some((upi, index) => 
            upi.id.toLowerCase() === upiForm.id.toLowerCase() && index !== editingUpiIndex
        );
        
        if (exists) {
            alert('This UPI ID already exists');
            return false;
        }
        
        return true;
    };

    const addUpiId = () => {
        if (!validateUpiForm()) return;
        
        const newUpi = {
            id: upiForm.id,
            name: upiForm.name,
            appType: upiForm.appType,
            isActive: upiForm.isActive,
            description: upiForm.description
        };
        
        if (editingUpiIndex >= 0) {
            const updated = [...formData.upiIds];
            updated[editingUpiIndex] = newUpi;
            setFormData({ ...formData, upiIds: updated });
        } else {
            setFormData({ ...formData, upiIds: [...formData.upiIds, newUpi] });
        }
        
        setUpiForm({ id: '', name: '', appType: 'other', isActive: true, description: '' });
        setEditingUpiIndex(-1);
        setShowUpiForm(false);
    };

    const editUpi = (index) => {
        const upi = formData.upiIds[index];
        setUpiForm({
            id: upi.id,
            name: upi.name,
            appType: upi.appType || 'other',
            isActive: upi.isActive !== false,
            description: upi.description || ''
        });
        setEditingUpiIndex(index);
        setShowUpiForm(true);
    };

    const deleteUpi = (index) => {
        if (confirm('Are you sure you want to delete this UPI ID?')) {
            const updated = formData.upiIds.filter((_, i) => i !== index);
            setFormData({ ...formData, upiIds: updated });
        }
    };

    const toggleUpiStatus = (index) => {
        const updated = [...formData.upiIds];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, upiIds: updated });
    };

    // ==================== HANDLERS ====================
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleThemeChange = (colorKey, value) => {
        setFormData(prev => ({
            ...prev,
            theme: { ...prev.theme, [colorKey]: value }
        }));
    };

    const handleBusinessHoursChange = (day, value) => {
        setFormData(prev => ({
            ...prev,
            businessHours: { ...prev.businessHours, [day]: value }
        }));
    };

    // ==================== RENDER ====================
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading company settings...</p>
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
                <title>Company Profile | LFMS</title>
                <meta name="description" content="Manage your company information and settings" />
            </Head>

            <div className="company-profile-container">
                {/* Header - Exactly like CreateOrderPage */}
                <div className="page-header">
                    <h1 className="page-title">Company Profile</h1>
                    <p className="page-subtitle">
                        Manage your company information, payment settings, and branding
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="success-message">
                        <Check size={20} />
                        <span>{successMessage}</span>
                    </div>
                )}

               {/* Tabs - Mobile Dropdown */}
{isMobile ? (
    <select
        className="mobile-tab-select"
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value)}
    >
        {TABS.map(tab => (
            <option key={tab.id} value={tab.id}>
                {tab.label}  {/* Fixed: removed tab.icon which was causing the error */}
            </option>
        ))}
    </select>
) : (
    <div className="tabs-container">
        {TABS.map(tab => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                </button>
            );
        })}
    </div>
)}

                {/* Form Card - Exactly like CreateOrderPage */}
                <div className="form-card">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="form-section">
                            <h2 className="form-section-title">Basic Company Information</h2>
                            
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">
                                        Company Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.companyName ? 'input-error' : ''}`}
                                        placeholder="e.g., PosterPro Store"
                                    />
                                    {errors.companyName && (
                                        <p className="form-error">{errors.companyName}</p>
                                    )}
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Legal Name</label>
                                    <input
                                        type="text"
                                        name="legalName"
                                        value={formData.legalName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., PosterPro Entertainment Private Limited"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Tagline</label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., Premium Posters & Art Prints"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Phone <span className="required">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                                        placeholder="+91 98765 43210"
                                    />
                                    {errors.phone && (
                                        <p className="form-error">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.email ? 'input-error' : ''}`}
                                        placeholder="support@posterpro.store"
                                    />
                                    {errors.email && (
                                        <p className="form-error">{errors.email}</p>
                                    )}
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="www.posterpro.store"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">
                                        Address <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.address ? 'input-error' : ''}`}
                                        placeholder="123 Business Street, Andheri East"
                                    />
                                    {errors.address && (
                                        <p className="form-error">{errors.address}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        City <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.city ? 'input-error' : ''}`}
                                        placeholder="Mumbai"
                                    />
                                    {errors.city && (
                                        <p className="form-error">{errors.city}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Maharashtra"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="400001"
                                        maxLength="6"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="India"
                                    />
                                </div>
                            </div>

                            <h3 className="subsection-title">Tax & Legal Information</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">GSTIN</label>
                                    <input
                                        type="text"
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.gstin ? 'input-error' : ''}`}
                                        placeholder="27ABCDE1234F1Z5"
                                        maxLength="15"
                                    />
                                    {errors.gstin && (
                                        <p className="form-error">{errors.gstin}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">PAN</label>
                                    <input
                                        type="text"
                                        name="pan"
                                        value={formData.pan}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.pan ? 'input-error' : ''}`}
                                        placeholder="ABCDE1234F"
                                        maxLength="10"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    {errors.pan && (
                                        <p className="form-error">{errors.pan}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">CIN</label>
                                    <input
                                        type="text"
                                        name="cin"
                                        value={formData.cin}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="U12345MH2023PTC123456"
                                    />
                                </div>
                            </div>

                            <h3 className="subsection-title">Social Media Links</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Facebook</label>
                                    <input
                                        type="url"
                                        name="social.facebook"
                                        value={formData.social?.facebook}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://facebook.com/posterpro"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Instagram</label>
                                    <input
                                        type="url"
                                        name="social.instagram"
                                        value={formData.social?.instagram}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://instagram.com/posterpro"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Twitter</label>
                                    <input
                                        type="url"
                                        name="social.twitter"
                                        value={formData.social?.twitter}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://twitter.com/posterpro"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">YouTube</label>
                                    <input
                                        type="url"
                                        name="social.youtube"
                                        value={formData.social?.youtube}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://youtube.com/@posterpro"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">LinkedIn</label>
                                    <input
                                        type="url"
                                        name="social.linkedin"
                                        value={formData.social?.linkedin}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://linkedin.com/company/posterpro"
                                    />
                                </div>
                            </div>

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    onClick={saveSettings}
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
                    )}

                    {/* UPI Tab */}
                    {activeTab === 'upi' && (
                        <div className="form-section">
                            <div className="section-header">
                                <h2 className="form-section-title">UPI Payment IDs</h2>
                                <button
                                    onClick={() => {
                                        setUpiForm({ id: '', name: '', appType: 'other', isActive: true, description: '' });
                                        setEditingUpiIndex(-1);
                                        setShowUpiForm(true);
                                    }}
                                    className="add-button"
                                >
                                    <span className="button-icon">+</span>
                                    Add UPI ID
                                </button>
                            </div>

                            <p className="section-description">
                                These UPI IDs will be used for payment verification. Customers must pay to these IDs.
                            </p>

                            {showUpiForm && (
                                <div className="upi-form-container">
                                    <h4 className="form-subtitle">
                                        {editingUpiIndex >= 0 ? 'Edit UPI ID' : 'Add New UPI ID'}
                                    </h4>

                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label className="form-label">UPI ID *</label>
                                            <input
                                                type="text"
                                                value={upiForm.id}
                                                onChange={(e) => setUpiForm({ ...upiForm, id: e.target.value })}
                                                className="form-input"
                                                placeholder="e.g., posterpro@oksbi"
                                            />
                                            <small className="input-hint">
                                                Must include @ (e.g., name@oksbi)
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Display Name *</label>
                                            <input
                                                type="text"
                                                value={upiForm.name}
                                                onChange={(e) => setUpiForm({ ...upiForm, name: e.target.value })}
                                                className="form-input"
                                                placeholder="e.g., Primary UPI"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">App Type</label>
                                            <select
                                                value={upiForm.appType}
                                                onChange={(e) => setUpiForm({ ...upiForm, appType: e.target.value })}
                                                className="form-select"
                                            >
                                                {UPI_APPS.map(app => (
                                                    <option key={app.value} value={app.value}>
                                                        {app.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label className="form-label">Description (Optional)</label>
                                            <input
                                                type="text"
                                                value={upiForm.description}
                                                onChange={(e) => setUpiForm({ ...upiForm, description: e.target.value })}
                                                className="form-input"
                                                placeholder="e.g., For GPay payments only"
                                            />
                                        </div>

                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={upiForm.isActive}
                                                    onChange={(e) => setUpiForm({ ...upiForm, isActive: e.target.checked })}
                                                />
                                                <span>Active (accept payments on this ID)</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            onClick={() => setShowUpiForm(false)}
                                            className="cancel-button"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={addUpiId}
                                            className="submit-button"
                                        >
                                            {editingUpiIndex >= 0 ? 'Update' : 'Add'} UPI ID
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="items-container">
                                {formData.upiIds?.length === 0 ? (
                                    <div className="empty-state">
                                        <CreditCard size={48} className="empty-icon" />
                                        <p>No UPI IDs added yet</p>
                                        <p className="empty-hint">Add your first UPI ID to start accepting payments</p>
                                    </div>
                                ) : (
                                    formData.upiIds.map((upi, index) => {
                                        const app = UPI_APPS.find(a => a.value === upi.appType) || UPI_APPS[4];
                                        
                                        return (
                                            <div key={index} className="item-card">
                                                <div className="item-header">
                                                    <div className="item-number">
                                                        <span className={`status-badge ${upi.isActive ? 'active' : 'inactive'}`}>
                                                            {upi.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div className="item-actions">
                                                        <button
                                                            onClick={() => editUpi(index)}
                                                            className="icon-button edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUpi(index)}
                                                            className="icon-button delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="item-details">
                                                    <div className="upi-main">
                                                        <span className="upi-id">{upi.id}</span>
                                                        <span className="upi-name">{upi.name}</span>
                                                    </div>
                                                    
                                                    {upi.description && (
                                                        <p className="upi-description">{upi.description}</p>
                                                    )}
                                                    
                                                    <div className="item-info">
                                                        <span 
                                                            className="app-badge"
                                                            style={{ backgroundColor: app.color + '20', color: app.color }}
                                                        >
                                                            {app.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="info-box">
                                <AlertCircle size={20} />
                                <div>
                                    <strong>Important:</strong> Payment verification system will check screenshots against ALL active UPI IDs above.
                                </div>
                            </div>

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    onClick={saveSettings}
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
                    )}

                    {/* Bank Details Tab */}
                    {activeTab === 'bank' && (
                        <div className="form-section">
                            <h2 className="form-section-title">Bank Account Details</h2>
                            <p className="section-description">
                                These bank details will appear on invoices for bank transfer payments.
                            </p>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Bank Name</label>
                                    <input
                                        type="text"
                                        name="bank.name"
                                        value={formData.bank?.name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., State Bank of India"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Account Number</label>
                                    <input
                                        type="text"
                                        name="bank.account"
                                        value={formData.bank?.account}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="12345678901"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="bank.ifsc"
                                        value={formData.bank?.ifsc}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.bankIfsc ? 'input-error' : ''}`}
                                        placeholder="SBIN0001234"
                                        maxLength="11"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    {errors.bankIfsc && (
                                        <p className="form-error">{errors.bankIfsc}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Branch</label>
                                    <input
                                        type="text"
                                        name="bank.branch"
                                        value={formData.bank?.branch}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Andheri East Branch"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Account Type</label>
                                    <select
                                        name="bank.accountType"
                                        value={formData.bank?.accountType}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="Current Account">Current Account</option>
                                        <option value="Savings Account">Savings Account</option>
                                        <option value="Business Account">Business Account</option>
                                    </select>
                                </div>
                            </div>

                            <div className="info-box">
                                <AlertCircle size={20} />
                                <div>
                                    <strong>Note:</strong> These details are for reference only.
                                </div>
                            </div>

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    onClick={saveSettings}
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
                    )}

                    {/* Invoice Settings Tab */}
                    {activeTab === 'invoice' && (
                        <div className="form-section">
                            <h2 className="form-section-title">Invoice Configuration</h2>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Invoice Prefix</label>
                                    <input
                                        type="text"
                                        name="invoiceSettings.prefix"
                                        value={formData.invoiceSettings?.prefix}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="INV"
                                        maxLength="5"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Separator</label>
                                    <input
                                        type="text"
                                        name="invoiceSettings.separator"
                                        value={formData.invoiceSettings?.separator}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="-"
                                        maxLength="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Date Format</label>
                                    <select
                                        name="invoiceSettings.dateFormat"
                                        value={formData.invoiceSettings?.dateFormat}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                        <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Currency Symbol</label>
                                    <input
                                        type="text"
                                        name="invoiceSettings.currency"
                                        value={formData.invoiceSettings?.currency}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="₹"
                                        maxLength="2"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Tax System</label>
                                    <select
                                        name="invoiceSettings.taxSystem"
                                        value={formData.invoiceSettings?.taxSystem}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="GST">GST (India)</option>
                                        <option value="VAT">VAT</option>
                                        <option value="None">No Tax</option>
                                    </select>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="invoiceSettings.gstBreakdown"
                                            checked={formData.invoiceSettings?.gstBreakdown}
                                            onChange={handleInputChange}
                                        />
                                        <span>Show GST breakdown</span>
                                    </label>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="invoiceSettings.showCGSTSGST"
                                            checked={formData.invoiceSettings?.showCGSTSGST}
                                            onChange={handleInputChange}
                                        />
                                        <span>Show CGST/SGST separately</span>
                                    </label>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="invoiceSettings.roundAmount"
                                            checked={formData.invoiceSettings?.roundAmount}
                                            onChange={handleInputChange}
                                        />
                                        <span>Round amounts to nearest integer</span>
                                    </label>
                                </div>
                            </div>

                            <h3 className="subsection-title">Terms & Policies</h3>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Payment Terms</label>
                                    <textarea
                                        name="invoiceSettings.paymentTerms"
                                        value={formData.invoiceSettings?.paymentTerms}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Delivery Terms</label>
                                    <textarea
                                        name="invoiceSettings.deliveryTerms"
                                        value={formData.invoiceSettings?.deliveryTerms}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Warranty Terms</label>
                                    <textarea
                                        name="invoiceSettings.warrantyTerms"
                                        value={formData.invoiceSettings?.warrantyTerms}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Refund Policy</label>
                                    <textarea
                                        name="invoiceSettings.refundPolicy"
                                        value={formData.invoiceSettings?.refundPolicy}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    onClick={saveSettings}
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
                    )}

                    {/* Support Tab */}
                    {activeTab === 'support' && (
                        <div className="form-section">
                            <h2 className="form-section-title">Customer Support Settings</h2>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Support Email</label>
                                    <input
                                        type="email"
                                        name="support.email"
                                        value={formData.support?.email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="care@posterpro.store"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Support Phone</label>
                                    <input
                                        type="tel"
                                        name="support.phone"
                                        value={formData.support?.phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        name="support.whatsapp"
                                        value={formData.support?.whatsapp}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Support Hours</label>
                                    <input
                                        type="text"
                                        name="support.hours"
                                        value={formData.support?.hours}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Mon-Sat, 10:00 AM - 7:00 PM"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Response Time</label>
                                    <input
                                        type="text"
                                        name="support.responseTime"
                                        value={formData.support?.responseTime}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Within 30 minutes"
                                    />
                                </div>
                            </div>

                            <h3 className="subsection-title">Business Hours</h3>

                            <div className="form-grid">
                                {Object.entries(formData.businessHours || {}).map(([day, hours]) => (
                                    <div key={day} className="form-group">
                                        <label className="form-label" style={{ textTransform: 'capitalize' }}>
                                            {day}
                                        </label>
                                        <input
                                            type="text"
                                            value={hours}
                                            onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                                            className="form-input"
                                            placeholder="9:00 AM - 6:00 PM"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    onClick={saveSettings}
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
                    )}

                    {/* Branding Tab */}
                    {activeTab === 'branding' && (
                        <div className="form-section">
                            <h2 className="form-section-title">Branding & Theme</h2>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Primary Color</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={formData.theme?.primary || '#2c3e50'}
                                            onChange={(e) => handleThemeChange('primary', e.target.value)}
                                            className="color-picker"
                                        />
                                        <input
                                            type="text"
                                            value={formData.theme?.primary || '#2c3e50'}
                                            onChange={(e) => handleThemeChange('primary', e.target.value)}
                                            className="form-input"
                                            style={{ width: '120px' }}
                                            placeholder="#2c3e50"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Secondary Color</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={formData.theme?.secondary || '#34495e'}
                                            onChange={(e) => handleThemeChange('secondary', e.target.value)}
                                            className="color-picker"
                                        />
                                        <input
                                            type="text"
                                            value={formData.theme?.secondary || '#34495e'}
                                            onChange={(e) => handleThemeChange('secondary', e.target.value)}
                                            className="form-input"
                                            style={{ width: '120px' }}
                                            placeholder="#34495e"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Accent Color</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={formData.theme?.accent || '#27ae60'}
                                            onChange={(e) => handleThemeChange('accent', e.target.value)}
                                            className="color-picker"
                                        />
                                        <input
                                            type="text"
                                            value={formData.theme?.accent || '#27ae60'}
                                            onChange={(e) => handleThemeChange('accent', e.target.value)}
                                            className="form-input"
                                            style={{ width: '120px' }}
                                            placeholder="#27ae60"
                                        />
                                    </div>
                                </div>
                            </div>

                            <h3 className="subsection-title">Logo & Images</h3>

                            <div className="image-upload-grid">
                                <div className="image-upload-card">
                                    <div className="image-preview">
                                        {formData.logo ? (
                                            <img src={formData.logo} alt="Logo" />
                                        ) : (
                                            <ImageIcon size={48} />
                                        )}
                                    </div>
                                    <label className="upload-button">
                                        <Upload size={16} />
                                        <span>Upload Logo</span>
                                        <input type="file" className="file-input" accept="image/*" />
                                    </label>
                                </div>

                                <div className="image-upload-card">
                                    <div className="image-preview">
                                        {formData.favicon ? (
                                            <img src={formData.favicon} alt="Favicon" />
                                        ) : (
                                            <ImageIcon size={48} />
                                        )}
                                    </div>
                                    <label className="upload-button">
                                        <Upload size={16} />
                                        <span>Upload Favicon</span>
                                        <input type="file" className="file-input" accept="image/*" />
                                    </label>
                                </div>

                                <div className="image-upload-card">
                                    <div className="image-preview">
                                        {formData.signature ? (
                                            <img src={formData.signature} alt="Signature" />
                                        ) : (
                                            <ImageIcon size={48} />
                                        )}
                                    </div>
                                    <label className="upload-button">
                                        <Upload size={16} />
                                        <span>Upload Signature</span>
                                        <input type="file" className="file-input" accept="image/*" />
                                    </label>
                                </div>

                                <div className="image-upload-card">
                                    <div className="image-preview">
                                        {formData.stamp ? (
                                            <img src={formData.stamp} alt="Stamp" />
                                        ) : (
                                            <ImageIcon size={48} />
                                        )}
                                    </div>
                                    <label className="upload-button">
                                        <Upload size={16} />
                                        <span>Upload Stamp</span>
                                        <input type="file" className="file-input" accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    onClick={saveSettings}
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
                    )}
                </div>
            </div>

            <style jsx>{`
                /* ==================== CONTAINER STYLES ==================== */
                .company-profile-container {
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

                /* ==================== TABS ==================== */
                .tabs-container {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 2rem;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow-x: auto;
                }

                .tab-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    color: #6b7280;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .tab-button:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }

                .tab-button.active {
                    background: #eef2ff;
                    color: #4f46e5;
                }

                /* Mobile Tab Select */
                .mobile-tab-select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    background: white;
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
                    margin-bottom: 1.5rem;
                }

                .subsection-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #4b5563;
                    margin: 2rem 0 1rem 0;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    gap: 1rem;
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

                @media (min-width: 1024px) {
                    .form-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                /* ==================== FORM GROUPS ==================== */
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

                /* ==================== FORM INPUTS ==================== */
                .form-input,
                .form-select,
                .form-textarea {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    transition: all 0.15s ease;
                    background: white;
                }

                .form-input:focus,
                .form-select:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .input-error {
                    border-color: #ef4444;
                }

                .input-error:focus {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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

                /* ==================== CHECKBOX ==================== */
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

                /* ==================== BUTTONS ==================== */
                .add-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: #10b981;
                    color: white;
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .add-button:hover {
                    background: #059669;
                }

                .button-icon {
                    font-size: 1rem;
                    font-weight: bold;
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

                .cancel-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    background: white;
                    color: #374151;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .cancel-button:hover {
                    background: #f9fafb;
                }

                .icon-button {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 0.375rem;
                    border: 1px solid #e5e7eb;
                    background: white;
                    color: #6b7280;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .icon-button:hover {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                }

                .icon-button.edit:hover {
                    background: #eef2ff;
                    color: #4f46e5;
                    border-color: #4f46e5;
                }

                .icon-button.delete:hover {
                    background: #fee2e2;
                    color: #dc2626;
                    border-color: #dc2626;
                }

                /* ==================== FORM ACTIONS ==================== */
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 20px;
                }

                .form-navigation {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    margin-top: 1.5rem;
                }

                /* ==================== UPI SECTION ==================== */
                .upi-form-container {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .form-subtitle {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 1rem 0;
                }

                .items-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .item-card {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 1rem;
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .item-number {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .item-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .item-details {
                    flex: 1;
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

                .upi-main {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    margin-bottom: 0.25rem;
                }

                .upi-id {
                    font-weight: 700;
                    font-size: 1rem;
                    color: #1f2937;
                    font-family: monospace;
                }

                .upi-name {
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                .upi-description {
                    font-size: 0.813rem;
                    color: #6b7280;
                    margin: 0.25rem 0;
                }

                .item-info {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 0.5rem;
                }

                .app-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.688rem;
                    font-weight: 600;
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

                /* ==================== EMPTY STATE ==================== */
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    background: #f9fafb;
                    border-radius: 0.5rem;
                    border: 2px dashed #e5e7eb;
                }

                .empty-icon {
                    color: #9ca3af;
                    margin-bottom: 1rem;
                }

                .empty-state p {
                    color: #374151;
                    font-weight: 500;
                    margin: 0 0 0.25rem 0;
                }

                .empty-hint {
                    color: #9ca3af;
                    font-size: 0.875rem;
                }

                /* ==================== COLOR INPUT ==================== */
                .color-input-group {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .color-picker {
                    width: 38px;
                    height: 38px;
                    padding: 2px;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    cursor: pointer;
                }

                /* ==================== IMAGE UPLOAD ==================== */
                .image-upload-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .image-upload-card {
                    position: relative;
                    background: #f9fafb;
                    border: 2px dashed #d1d5db;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    text-align: center;
                }

                .image-preview {
                    width: 100%;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.75rem;
                }

                .image-preview img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .image-preview svg {
                    color: #9ca3af;
                }

                .upload-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    font-size: 0.813rem;
                    color: #374151;
                    cursor: pointer;
                    position: relative;
                }

                .upload-button:hover {
                    background: #f3f4f6;
                }

                .file-input {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
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
                    .company-profile-container {
                        padding: 1rem;
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
                    
                    .form-actions {
                        flex-direction: column;
                    }
                    
                    .form-actions button {
                        width: 100%;
                    }
                    
                    .item-card {
                        padding: 0.75rem;
                    }
                    
                    .item-info {
                        flex-wrap: wrap;
                    }
                    
                    .image-upload-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .section-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .add-button {
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .upi-main {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }
                    
                    .color-input-group {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .color-picker {
                        width: 100%;
                        height: 48px;
                    }
                    
                    .color-input-group .form-input {
                        width: 100% !important;
                    }
                }
            `}</style>
        </>
    );
}