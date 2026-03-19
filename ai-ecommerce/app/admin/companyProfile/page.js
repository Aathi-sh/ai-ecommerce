









// "use client";

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import Head from 'next/head';
// import {
//     Building2, Mail, Phone, MapPin, CreditCard, Landmark,
//     Receipt, HeadphonesIcon, Palette, Save, X, Plus,
//     Trash2, Edit2, Check, AlertCircle, Loader2, Globe,
//     Facebook, Instagram, Twitter, Youtube, Upload, Image as ImageIcon,
//     ChevronRight, Settings, Shield, DollarSign, Clock, Link2, Users,
//     Briefcase, FileText, Eye, EyeOff, Star, Heart, Gift, Award,
//     Bell, ShieldCheck, Zap, TrendingUp, Activity, Package, Truck,
//     RotateCcw, HelpCircle, MessageCircle, PhoneCall, MailOpen,
//     MapPinHouse, Building, Store, Globe2, Linkedin, TwitterIcon,
//     FileSignature, Stamp, Palette as PaletteIcon, Brush, Sparkles,
//     CheckCircle, AlertTriangle, Info, XCircle, Menu, Home,
//     Settings2, User, LogOut, ChevronLeft, Search, Filter,
//     MoreVertical, Copy, Download, Printer, Share2, Bookmark,
//     ThumbsUp, ThumbsDown, MessageSquare, Send, Camera, Video,
//     Mic, Paperclip, Smile, Calendar as CalendarIcon, ArrowLeft,
//     ArrowRight, Grid, List, RefreshCw, Filter as FilterIcon,
//     Layout, Layers, Box, Database, Shield as ShieldIcon,
//     Key, Lock, Unlock, Hash, AtSign, Link, Link2 as LinkIcon,
//     Wifi, WifiOff, Battery, BatteryCharging, Cpu, HardDrive,
//     Server, Cloud, CloudOff, Download as DownloadIcon, Upload as UploadIcon,
//     Repeat, Shuffle, Play, Pause, Square, Circle, Triangle,
//     Hexagon, Octagon, Diamond, Gem, Crown, Sparkle,
//     // ✅ ADDED: Route icon for order flow and QR code icon
//     Route, QrCode, Smartphone, CreditCard as CardIcon
// } from 'lucide-react';

// // ==================== CONSTANTS ====================
// const SECTIONS = [
//     { 
//         id: 'basic', 
//         title: 'Basic Information', 
//         icon: Building2, 
//         color: '#3b82f6',
//         description: 'Company details and contact information'
//     },
//     { 
//         id: 'payment_methods', 
//         title: 'Payment Methods', 
//         icon: CreditCard, 
//         color: '#8b5cf6',
//         description: 'UPI IDs, GPay, PhonePe, PayTM, QR codes, and bank accounts'
//     },
//     { 
//         id: 'bank', 
//         title: 'Bank Account Details', 
//         icon: Landmark, 
//         color: '#ec4899',
//         description: 'Bank information for invoice and payment references'
//     },
//     { 
//         id: 'invoice', 
//         title: 'Invoice Settings', 
//         icon: Receipt, 
//         color: '#f59e0b',
//         description: 'Configure invoice formatting and business policies'
//     },
//     { 
//         id: 'support', 
//         title: 'Customer Support', 
//         icon: HeadphonesIcon, 
//         color: '#10b981',
//         description: 'Configure support channels and availability'
//     },
//     { 
//         id: 'order_flow', 
//         title: 'Order Flow Configuration', 
//         icon: Route, 
//         color: '#6366f1',
//         description: 'WhatsApp bot order collection settings'
//     },
//     { 
//         id: 'branding', 
//         title: 'Branding & Theme', 
//         icon: Palette, 
//         color: '#f43f5e',
//         description: 'Customize your brand identity and visual appearance'
//     }
// ];

// const UPI_APPS = [
//     { value: 'gpay', label: 'Google Pay', color: '#4285F4', icon: '💚' },
//     { value: 'phonepe', label: 'PhonePe', color: '#5F259F', icon: '🟣' },
//     { value: 'paytm', label: 'Paytm', color: '#00BAF2', icon: '🔵' },
//     { value: 'bhim', label: 'BHIM', color: '#DD4B39', icon: '🔴' },
//     { value: 'amazonpay', label: 'Amazon Pay', color: '#FF9900', icon: '🟠' },
//     { value: 'other', label: 'Other', color: '#6B7280', icon: '⚫' }
// ];

// const PAYMENT_METHOD_TYPES = {
//     upi: { label: 'UPI ID', icon: CreditCard, color: '#8b5cf6' },
//     gpay: { label: 'GPay Number', icon: Smartphone, color: '#4285F4' },
//     phonepe: { label: 'PhonePe Number', icon: Smartphone, color: '#5F259F' },
//     paytm: { label: 'PayTM Number', icon: Smartphone, color: '#00BAF2' },
//     qr: { label: 'QR Code', icon: QrCode, color: '#10b981' },
//     bank: { label: 'Bank Account', icon: Landmark, color: '#ec4899' }
// };

// const BUSINESS_HOURS_DEFAULT = {
//     monday: '9:00 AM - 8:00 PM',
//     tuesday: '9:00 AM - 8:00 PM',
//     wednesday: '9:00 AM - 8:00 PM',
//     thursday: '9:00 AM - 8:00 PM',
//     friday: '9:00 AM - 8:00 PM',
//     saturday: '9:00 AM - 6:00 PM',
//     sunday: 'Closed'
// };

// const ACCOUNT_TYPES = ['Current', 'Savings', 'Business'];

// // ==================== MAIN COMPONENT ====================
// export default function CompanyProfilePage() {
//     const router = useRouter();
//     const { data: session, status } = useSession();
    
//     // State management
//     const [expandedSections, setExpandedSections] = useState(['basic']);
//     const [activeTab, setActiveTab] = useState('basic');
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [settings, setSettings] = useState(null);
//     const [errors, setErrors] = useState({});
//     const [toast, setToast] = useState({ show: false, type: '', message: '' });
    
//     // Form state for each section
//     const [formData, setFormData] = useState({
//         companyName: '',
//         legalName: '',
//         tagline: '',
//         phone: '',
//         email: '',
//         website: '',
//         address: '',
//         city: '',
//         state: '',
//         pincode: '',
//         country: 'India',
//         gstin: '',
//         pan: '',
//         cin: '',
        
//         // ===== PAYMENT METHODS =====
//         upiIds: [],
//         gpayNumbers: [],
//         phonePeNumbers: [],
//         paytmNumbers: [],
//         qrCode: {
//             imageUrl: '',
//             name: 'Payment QR Code',
//             description: '',
//             isActive: true
//         },
//         bankAccounts: [],
        
//         // Payment settings
//         paymentSettings: {
//             preferredMethod: 'any',
//             allowPartialPayments: false,
//             autoVerifyEnabled: true,
//             minConfidenceForAuto: 85,
//             paymentTimeout: 30,
//             requireTransactionId: true,
//             allowMultiplePaymentMethods: true,
//             displayOrder: ['upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank'],
//             autoVerifyThresholds: {
//                 amountTolerance: 2,
//                 timeWindow: 15,
//                 minConfidencePerField: {
//                     amount: 80,
//                     upi: 80,
//                     transactionId: 70
//                 }
//             }
//         },
        
//         // Order flow mode
//         orderFlowMode: 'long',
        
//         // Legacy bank
//         bank: {
//             name: '',
//             account: '',
//             ifsc: '',
//             branch: '',
//             accountType: 'Current Account'
//         },
        
//         // Invoice settings
//         invoiceSettings: {
//             prefix: 'INV',
//             separator: '-',
//             dateFormat: 'dd/mm/yyyy',
//             currency: '₹',
//             currencyCode: 'INR',
//             taxSystem: 'GST',
//             gstBreakdown: true,
//             showCGSTSGST: true,
//             roundAmount: true,
//             paymentTerms: 'Due on receipt',
//             deliveryTerms: '3-5 business days after payment confirmation',
//             warrantyTerms: '7 days replacement for manufacturing defects',
//             refundPolicy: 'No refunds after order processing',
//             footerNote: 'This is a computer generated invoice, no signature required.',
//             showBankDetails: true
//         },
        
//         // Support settings
//         support: {
//             email: '',
//             phone: '',
//             hours: 'Mon-Sat, 10:00 AM - 7:00 PM',
//             whatsapp: '',
//             responseTime: 'Within 30 minutes'
//         },
        
//         // Social media
//         social: {
//             facebook: '',
//             instagram: '',
//             twitter: '',
//             youtube: '',
//             linkedin: ''
//         },
        
//         // Business hours
//         businessHours: { ...BUSINESS_HOURS_DEFAULT },
        
//         // Branding
//         logo: null,
//         favicon: null,
//         signature: null,
//         stamp: null,
        
//         // Theme
//         theme: {
//             primary: '#2563eb',
//             secondary: '#4f46e5',
//             accent: '#0d9488'
//         }
//     });

//     // ===== UPI Form State =====
//     const [upiForm, setUpiForm] = useState({
//         id: '',
//         name: '',
//         appType: 'other',
//         isActive: true,
//         description: ''
//     });
//     const [editingUpiIndex, setEditingUpiIndex] = useState(-1);
//     const [showUpiForm, setShowUpiForm] = useState(false);

//     // ===== GPay Form State =====
//     const [gpayForm, setGpayForm] = useState({
//         phoneNumber: '',
//         name: '',
//         isActive: true,
//         description: ''
//     });
//     const [editingGpayIndex, setEditingGpayIndex] = useState(-1);
//     const [showGpayForm, setShowGpayForm] = useState(false);

//     // ===== PhonePe Form State =====
//     const [phonePeForm, setPhonePeForm] = useState({
//         phoneNumber: '',
//         name: '',
//         isActive: true,
//         description: ''
//     });
//     const [editingPhonePeIndex, setEditingPhonePeIndex] = useState(-1);
//     const [showPhonePeForm, setShowPhonePeForm] = useState(false);

//     // ===== PayTM Form State =====
//     const [paytmForm, setPaytmForm] = useState({
//         phoneNumber: '',
//         name: '',
//         isActive: true,
//         description: ''
//     });
//     const [editingPaytmIndex, setEditingPaytmIndex] = useState(-1);
//     const [showPaytmForm, setShowPaytmForm] = useState(false);

//     // ===== QR Code Form State =====
//     const [qrForm, setQrForm] = useState({
//         imageUrl: '',
//         name: 'Payment QR Code',
//         description: '',
//         isActive: true
//     });
//     const [showQrForm, setShowQrForm] = useState(false);
//     const [qrFile, setQrFile] = useState(null);

//     // ===== Bank Account Form State =====
//     const [bankAccountForm, setBankAccountForm] = useState({
//         accountName: '',
//         accountNumber: '',
//         bankName: '',
//         ifscCode: '',
//         branch: '',
//         accountType: 'Current',
//         isActive: true,
//         isDefault: false,
//         description: ''
//     });
//     const [editingBankIndex, setEditingBankIndex] = useState(-1);
//     const [showBankForm, setShowBankForm] = useState(false);

//     // ===== Payment Settings Form State =====
//     const [showPaymentSettings, setShowPaymentSettings] = useState(false);

//     // Fetch company settings
//     useEffect(() => {
//         fetchSettings();
//     }, []);

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
    
//     const fetchSettings = async () => {
//         try {
//             setLoading(true);
//             const res = await fetch('/api/company-settings', {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'x-company-id': session?.user?.companyId
//                 }
//             });
//             const data = await res.json();
            
//             if (data.success) {
//                 setSettings(data.data);
//                 setFormData(prev => ({
//                     ...prev,
//                     ...data.data,
//                     // Ensure arrays exist
//                     upiIds: data.data.upiIds || [],
//                     gpayNumbers: data.data.gpayNumbers || [],
//                     phonePeNumbers: data.data.phonePeNumbers || [],
//                     paytmNumbers: data.data.paytmNumbers || [],
//                     bankAccounts: data.data.bankAccounts || [],
//                     qrCode: data.data.qrCode || { 
//                         imageUrl: '', 
//                         name: 'Payment QR Code', 
//                         description: '', 
//                         isActive: true 
//                     },
//                     paymentSettings: {
//                         ...prev.paymentSettings,
//                         ...(data.data.paymentSettings || {})
//                     },
//                     orderFlowMode: data.data.orderFlowMode || 'long',
//                     businessHours: { ...BUSINESS_HOURS_DEFAULT, ...(data.data.businessHours || {}) },
//                     support: { ...prev.support, ...(data.data.support || {}) },
//                     social: { ...prev.social, ...(data.data.social || {}) },
//                     bank: { ...prev.bank, ...(data.data.bank || {}) },
//                     invoiceSettings: { ...prev.invoiceSettings, ...(data.data.invoiceSettings || {}) },
//                     theme: { ...prev.theme, ...(data.data.theme || {}) }
//                 }));
//             }
//         } catch (error) {
//             console.error('Error fetching settings:', error);
//             showToast('error', 'Failed to load company settings');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const saveSettings = async () => {
//         if (!validateForm()) return;
        
//         setSaving(true);
//         setErrors({});
        
//         try {
//             // If we have QR file, use FormData
//             if (qrFile) {
//                 const formDataToSend = new FormData();
                
//                 // Append all form data
//                 Object.keys(formData).forEach(key => {
//                     if (key === 'qrFile') return;
//                     if (typeof formData[key] === 'object') {
//                         formDataToSend.append(key, JSON.stringify(formData[key]));
//                     } else {
//                         formDataToSend.append(key, formData[key]);
//                     }
//                 });
                
//                 // Append QR file
//                 formDataToSend.append('qrCode', qrFile);
                
//                 const res = await fetch('/api/company-settings', {
//                     method: 'PUT',
//                     headers: {
//                         'x-company-id': session?.user?.companyId
//                     },
//                     body: formDataToSend
//                 });
                
//                 const data = await res.json();
                
//                 if (data.success) {
//                     setSettings(data.data);
//                     setQrFile(null);
//                     showToast('success', 'Settings saved successfully!');
//                 } else {
//                     showToast('error', data.error || 'Failed to save settings');
//                 }
//             } else {
//                 // Regular JSON request
//                 const res = await fetch('/api/company-settings', {
//                     method: 'PUT',
//                     headers: { 
//                         'Content-Type': 'application/json',
//                         'x-company-id': session?.user?.companyId
//                     },
//                     body: JSON.stringify(formData)
//                 });
                
//                 const data = await res.json();
                
//                 if (data.success) {
//                     setSettings(data.data);
//                     showToast('success', 'Settings saved successfully!');
//                 } else {
//                     showToast('error', data.error || 'Failed to save settings');
//                 }
//             }
//         } catch (error) {
//             console.error('Error saving settings:', error);
//             showToast('error', 'Network error. Please try again.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     const showToast = (type, message) => {
//         setToast({ show: true, type, message });
//     };

//     // ==================== VALIDATION ====================
    
//     const validateForm = () => {
//         const newErrors = {};
        
//         if (!formData.companyName?.trim()) {
//             newErrors.companyName = 'Company name is required';
//         }
        
//         if (!formData.phone?.trim()) {
//             newErrors.phone = 'Phone number is required';
//         } else {
//             const digits = formData.phone.replace(/\D/g, '');
//             if (digits.length < 10) {
//                 newErrors.phone = 'Enter a valid phone number';
//             }
//         }
        
//         if (!formData.email?.trim()) {
//             newErrors.email = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             newErrors.email = 'Enter a valid email address';
//         }
        
//         if (!formData.address?.trim()) {
//             newErrors.address = 'Address is required';
//         }
        
//         if (!formData.city?.trim()) {
//             newErrors.city = 'City is required';
//         }
        
//         if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
//             newErrors.gstin = 'Enter a valid GSTIN';
//         }
        
//         if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
//             newErrors.pan = 'Enter a valid PAN';
//         }
        
//         if (formData.bank?.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bank.ifsc)) {
//             newErrors.bankIfsc = 'Enter a valid IFSC code';
//         }
        
//         // Validate orderFlowMode
//         if (formData.orderFlowMode && !['long', 'short'].includes(formData.orderFlowMode)) {
//             newErrors.orderFlowMode = 'Order flow mode must be either "long" or "short"';
//         }
        
//         // Validate payment settings
//         if (formData.paymentSettings) {
//             if (formData.paymentSettings.minConfidenceForAuto && 
//                 (formData.paymentSettings.minConfidenceForAuto < 50 || 
//                  formData.paymentSettings.minConfidenceForAuto > 100)) {
//                 newErrors.minConfidence = 'Confidence threshold must be between 50 and 100';
//             }
//             if (formData.paymentSettings.paymentTimeout && 
//                 (formData.paymentSettings.paymentTimeout < 5 || 
//                  formData.paymentSettings.paymentTimeout > 60)) {
//                 newErrors.paymentTimeout = 'Payment timeout must be between 5 and 60 minutes';
//             }
//         }
        
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     // ==================== UPI FUNCTIONS ====================
    
//     const validateUpiForm = () => {
//         if (!upiForm.id.trim()) {
//             showToast('error', 'UPI ID is required');
//             return false;
//         }
//         if (!upiForm.id.includes('@')) {
//             showToast('error', 'UPI ID must include @ (e.g., name@oksbi)');
//             return false;
//         }
//         if (!upiForm.name.trim()) {
//             showToast('error', 'Display name is required');
//             return false;
//         }
        
//         const exists = formData.upiIds.some((upi, index) => 
//             upi.id.toLowerCase() === upiForm.id.toLowerCase() && index !== editingUpiIndex
//         );
        
//         if (exists) {
//             showToast('error', 'This UPI ID already exists');
//             return false;
//         }
        
//         return true;
//     };

//     const addUpiId = () => {
//         if (!validateUpiForm()) return;
        
//         const newUpi = {
//             id: upiForm.id,
//             name: upiForm.name,
//             appType: upiForm.appType,
//             isActive: upiForm.isActive,
//             description: upiForm.description,
//             createdAt: new Date().toISOString()
//         };
        
//         if (editingUpiIndex >= 0) {
//             const updated = [...formData.upiIds];
//             updated[editingUpiIndex] = newUpi;
//             setFormData({ ...formData, upiIds: updated });
//             showToast('success', 'UPI ID updated successfully');
//         } else {
//             setFormData({ ...formData, upiIds: [...formData.upiIds, newUpi] });
//             showToast('success', 'UPI ID added successfully');
//         }
        
//         setUpiForm({ id: '', name: '', appType: 'other', isActive: true, description: '' });
//         setEditingUpiIndex(-1);
//         setShowUpiForm(false);
//     };

//     const editUpi = (index) => {
//         const upi = formData.upiIds[index];
//         setUpiForm({
//             id: upi.id,
//             name: upi.name,
//             appType: upi.appType || 'other',
//             isActive: upi.isActive !== false,
//             description: upi.description || ''
//         });
//         setEditingUpiIndex(index);
//         setShowUpiForm(true);
//     };

//     const deleteUpi = (index) => {
//         const updated = formData.upiIds.filter((_, i) => i !== index);
//         setFormData({ ...formData, upiIds: updated });
//         showToast('success', 'UPI ID deleted successfully');
//     };

//     const toggleUpiStatus = (index) => {
//         const updated = [...formData.upiIds];
//         updated[index].isActive = !updated[index].isActive;
//         setFormData({ ...formData, upiIds: updated });
//         showToast('success', `UPI ID ${updated[index].isActive ? 'activated' : 'deactivated'}`);
//     };

//     // ==================== GPAY FUNCTIONS ====================
    
//     const validateGpayForm = () => {
//         if (!gpayForm.phoneNumber.trim()) {
//             showToast('error', 'Phone number is required');
//             return false;
//         }
//         const digits = gpayForm.phoneNumber.replace(/\D/g, '');
//         if (digits.length !== 10) {
//             showToast('error', 'Phone number must be exactly 10 digits');
//             return false;
//         }
//         if (!gpayForm.name.trim()) {
//             showToast('error', 'Display name is required');
//             return false;
//         }
        
//         const exists = formData.gpayNumbers.some((g, index) => 
//             g.phoneNumber.replace(/\D/g, '') === digits && index !== editingGpayIndex
//         );
        
//         if (exists) {
//             showToast('error', 'This GPay number already exists');
//             return false;
//         }
        
//         return true;
//     };

//     const addGpayNumber = () => {
//         if (!validateGpayForm()) return;
        
//         const digits = gpayForm.phoneNumber.replace(/\D/g, '');
//         const newGpay = {
//             phoneNumber: digits,
//             name: gpayForm.name,
//             upiId: `${digits}@okhdfcbank`,
//             isActive: gpayForm.isActive,
//             description: gpayForm.description,
//             createdAt: new Date().toISOString()
//         };
        
//         if (editingGpayIndex >= 0) {
//             const updated = [...formData.gpayNumbers];
//             updated[editingGpayIndex] = newGpay;
//             setFormData({ ...formData, gpayNumbers: updated });
//             showToast('success', 'GPay number updated successfully');
//         } else {
//             setFormData({ ...formData, gpayNumbers: [...formData.gpayNumbers, newGpay] });
//             showToast('success', 'GPay number added successfully');
//         }
        
//         setGpayForm({ phoneNumber: '', name: '', isActive: true, description: '' });
//         setEditingGpayIndex(-1);
//         setShowGpayForm(false);
//     };

//     const editGpay = (index) => {
//         const gpay = formData.gpayNumbers[index];
//         setGpayForm({
//             phoneNumber: gpay.phoneNumber,
//             name: gpay.name,
//             isActive: gpay.isActive !== false,
//             description: gpay.description || ''
//         });
//         setEditingGpayIndex(index);
//         setShowGpayForm(true);
//     };

//     const deleteGpay = (index) => {
//         const updated = formData.gpayNumbers.filter((_, i) => i !== index);
//         setFormData({ ...formData, gpayNumbers: updated });
//         showToast('success', 'GPay number deleted successfully');
//     };

//     const toggleGpayStatus = (index) => {
//         const updated = [...formData.gpayNumbers];
//         updated[index].isActive = !updated[index].isActive;
//         setFormData({ ...formData, gpayNumbers: updated });
//         showToast('success', `GPay number ${updated[index].isActive ? 'activated' : 'deactivated'}`);
//     };

//     // ==================== PHONEPE FUNCTIONS ====================
    
//     const validatePhonePeForm = () => {
//         if (!phonePeForm.phoneNumber.trim()) {
//             showToast('error', 'Phone number is required');
//             return false;
//         }
//         const digits = phonePeForm.phoneNumber.replace(/\D/g, '');
//         if (digits.length !== 10) {
//             showToast('error', 'Phone number must be exactly 10 digits');
//             return false;
//         }
//         if (!phonePeForm.name.trim()) {
//             showToast('error', 'Display name is required');
//             return false;
//         }
        
//         const exists = formData.phonePeNumbers.some((p, index) => 
//             p.phoneNumber.replace(/\D/g, '') === digits && index !== editingPhonePeIndex
//         );
        
//         if (exists) {
//             showToast('error', 'This PhonePe number already exists');
//             return false;
//         }
        
//         return true;
//     };

//     const addPhonePeNumber = () => {
//         if (!validatePhonePeForm()) return;
        
//         const digits = phonePeForm.phoneNumber.replace(/\D/g, '');
//         const newPhonePe = {
//             phoneNumber: digits,
//             name: phonePeForm.name,
//             upiId: `${digits}@ybl`,
//             isActive: phonePeForm.isActive,
//             description: phonePeForm.description,
//             createdAt: new Date().toISOString()
//         };
        
//         if (editingPhonePeIndex >= 0) {
//             const updated = [...formData.phonePeNumbers];
//             updated[editingPhonePeIndex] = newPhonePe;
//             setFormData({ ...formData, phonePeNumbers: updated });
//             showToast('success', 'PhonePe number updated successfully');
//         } else {
//             setFormData({ ...formData, phonePeNumbers: [...formData.phonePeNumbers, newPhonePe] });
//             showToast('success', 'PhonePe number added successfully');
//         }
        
//         setPhonePeForm({ phoneNumber: '', name: '', isActive: true, description: '' });
//         setEditingPhonePeIndex(-1);
//         setShowPhonePeForm(false);
//     };

//     const editPhonePe = (index) => {
//         const phonepe = formData.phonePeNumbers[index];
//         setPhonePeForm({
//             phoneNumber: phonepe.phoneNumber,
//             name: phonepe.name,
//             isActive: phonepe.isActive !== false,
//             description: phonepe.description || ''
//         });
//         setEditingPhonePeIndex(index);
//         setShowPhonePeForm(true);
//     };

//     const deletePhonePe = (index) => {
//         const updated = formData.phonePeNumbers.filter((_, i) => i !== index);
//         setFormData({ ...formData, phonePeNumbers: updated });
//         showToast('success', 'PhonePe number deleted successfully');
//     };

//     const togglePhonePeStatus = (index) => {
//         const updated = [...formData.phonePeNumbers];
//         updated[index].isActive = !updated[index].isActive;
//         setFormData({ ...formData, phonePeNumbers: updated });
//         showToast('success', `PhonePe number ${updated[index].isActive ? 'activated' : 'deactivated'}`);
//     };

//     // ==================== PAYTM FUNCTIONS ====================
    
//     const validatePaytmForm = () => {
//         if (!paytmForm.phoneNumber.trim()) {
//             showToast('error', 'Phone number is required');
//             return false;
//         }
//         const digits = paytmForm.phoneNumber.replace(/\D/g, '');
//         if (digits.length !== 10) {
//             showToast('error', 'Phone number must be exactly 10 digits');
//             return false;
//         }
//         if (!paytmForm.name.trim()) {
//             showToast('error', 'Display name is required');
//             return false;
//         }
        
//         const exists = formData.paytmNumbers.some((p, index) => 
//             p.phoneNumber.replace(/\D/g, '') === digits && index !== editingPaytmIndex
//         );
        
//         if (exists) {
//             showToast('error', 'This PayTM number already exists');
//             return false;
//         }
        
//         return true;
//     };

//     const addPaytmNumber = () => {
//         if (!validatePaytmForm()) return;
        
//         const digits = paytmForm.phoneNumber.replace(/\D/g, '');
//         const newPaytm = {
//             phoneNumber: digits,
//             name: paytmForm.name,
//             upiId: `${digits}@paytm`,
//             isActive: paytmForm.isActive,
//             description: paytmForm.description,
//             createdAt: new Date().toISOString()
//         };
        
//         if (editingPaytmIndex >= 0) {
//             const updated = [...formData.paytmNumbers];
//             updated[editingPaytmIndex] = newPaytm;
//             setFormData({ ...formData, paytmNumbers: updated });
//             showToast('success', 'PayTM number updated successfully');
//         } else {
//             setFormData({ ...formData, paytmNumbers: [...formData.paytmNumbers, newPaytm] });
//             showToast('success', 'PayTM number added successfully');
//         }
        
//         setPaytmForm({ phoneNumber: '', name: '', isActive: true, description: '' });
//         setEditingPaytmIndex(-1);
//         setShowPaytmForm(false);
//     };

//     const editPaytm = (index) => {
//         const paytm = formData.paytmNumbers[index];
//         setPaytmForm({
//             phoneNumber: paytm.phoneNumber,
//             name: paytm.name,
//             isActive: paytm.isActive !== false,
//             description: paytm.description || ''
//         });
//         setEditingPaytmIndex(index);
//         setShowPaytmForm(true);
//     };

//     const deletePaytm = (index) => {
//         const updated = formData.paytmNumbers.filter((_, i) => i !== index);
//         setFormData({ ...formData, paytmNumbers: updated });
//         showToast('success', 'PayTM number deleted successfully');
//     };

//     const togglePaytmStatus = (index) => {
//         const updated = [...formData.paytmNumbers];
//         updated[index].isActive = !updated[index].isActive;
//         setFormData({ ...formData, paytmNumbers: updated });
//         showToast('success', `PayTM number ${updated[index].isActive ? 'activated' : 'deactivated'}`);
//     };

//     // ==================== QR CODE FUNCTIONS ====================
    
//     const handleQrFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setQrFile(file);
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setQrForm({ ...qrForm, imageUrl: reader.result });
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const saveQrCode = () => {
//         setFormData({ ...formData, qrCode: { ...qrForm } });
//         setShowQrForm(false);
//         showToast('success', 'QR code updated successfully');
//     };

//     const toggleQrStatus = () => {
//         setFormData({
//             ...formData,
//             qrCode: { ...formData.qrCode, isActive: !formData.qrCode?.isActive }
//         });
//         showToast('success', `QR code ${!formData.qrCode?.isActive ? 'activated' : 'deactivated'}`);
//     };

//     const deleteQrCode = () => {
//         if (confirm('Are you sure you want to delete the QR code?')) {
//             setFormData({
//                 ...formData,
//                 qrCode: { imageUrl: '', name: 'Payment QR Code', description: '', isActive: false }
//             });
//             setQrFile(null);
//             showToast('success', 'QR code deleted successfully');
//         }
//     };

//     // ==================== BANK ACCOUNT FUNCTIONS ====================
    
//     const validateBankAccountForm = () => {
//         if (!bankAccountForm.accountName.trim()) {
//             showToast('error', 'Account holder name is required');
//             return false;
//         }
//         if (!bankAccountForm.accountNumber.trim()) {
//             showToast('error', 'Account number is required');
//             return false;
//         }
//         if (!bankAccountForm.bankName.trim()) {
//             showToast('error', 'Bank name is required');
//             return false;
//         }
//         if (!bankAccountForm.ifscCode.trim()) {
//             showToast('error', 'IFSC code is required');
//             return false;
//         }
//         if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankAccountForm.ifscCode)) {
//             showToast('error', 'Invalid IFSC code format');
//             return false;
//         }
//         return true;
//     };

//     const addBankAccount = () => {
//         if (!validateBankAccountForm()) return;
        
//         const newBank = {
//             ...bankAccountForm,
//             createdAt: new Date().toISOString()
//         };
        
//         // If this is default, unset others
//         if (newBank.isDefault) {
//             formData.bankAccounts.forEach(acc => acc.isDefault = false);
//         }
        
//         if (editingBankIndex >= 0) {
//             const updated = [...formData.bankAccounts];
//             updated[editingBankIndex] = newBank;
//             setFormData({ ...formData, bankAccounts: updated });
//             showToast('success', 'Bank account updated successfully');
//         } else {
//             setFormData({ ...formData, bankAccounts: [...formData.bankAccounts, newBank] });
//             showToast('success', 'Bank account added successfully');
//         }
        
//         setBankAccountForm({
//             accountName: '',
//             accountNumber: '',
//             bankName: '',
//             ifscCode: '',
//             branch: '',
//             accountType: 'Current',
//             isActive: true,
//             isDefault: false,
//             description: ''
//         });
//         setEditingBankIndex(-1);
//         setShowBankForm(false);
//     };

//     const editBankAccount = (index) => {
//         const bank = formData.bankAccounts[index];
//         setBankAccountForm({
//             accountName: bank.accountName,
//             accountNumber: bank.accountNumber,
//             bankName: bank.bankName,
//             ifscCode: bank.ifscCode,
//             branch: bank.branch || '',
//             accountType: bank.accountType || 'Current',
//             isActive: bank.isActive !== false,
//             isDefault: bank.isDefault || false,
//             description: bank.description || ''
//         });
//         setEditingBankIndex(index);
//         setShowBankForm(true);
//     };

//     const deleteBankAccount = (index) => {
//         const bank = formData.bankAccounts[index];
//         if (bank.isDefault) {
//             showToast('error', 'Cannot delete default bank account');
//             return;
//         }
//         const updated = formData.bankAccounts.filter((_, i) => i !== index);
//         setFormData({ ...formData, bankAccounts: updated });
//         showToast('success', 'Bank account deleted successfully');
//     };

//     const toggleBankStatus = (index) => {
//         const updated = [...formData.bankAccounts];
//         updated[index].isActive = !updated[index].isActive;
//         setFormData({ ...formData, bankAccounts: updated });
//         showToast('success', `Bank account ${updated[index].isActive ? 'activated' : 'deactivated'}`);
//     };

//     const setDefaultBank = (index) => {
//         const updated = formData.bankAccounts.map((acc, i) => ({
//             ...acc,
//             isDefault: i === index
//         }));
//         setFormData({ ...formData, bankAccounts: updated });
//         showToast('success', 'Default bank account updated');
//     };

//     // ==================== HANDLERS ====================
    
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
        
//         if (name.includes('.')) {
//             const [parent, child] = name.split('.');
//             setFormData(prev => ({
//                 ...prev,
//                 [parent]: {
//                     ...prev[parent],
//                     [child]: type === 'checkbox' ? checked : value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }));
//         }
        
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     const handlePaymentSettingsChange = (field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             paymentSettings: {
//                 ...prev.paymentSettings,
//                 [field]: value
//             }
//         }));
//     };

//     const handleThemeChange = (colorKey, value) => {
//         setFormData(prev => ({
//             ...prev,
//             theme: { ...prev.theme, [colorKey]: value }
//         }));
//     };

//     const handleBusinessHoursChange = (day, value) => {
//         setFormData(prev => ({
//             ...prev,
//             businessHours: { ...prev.businessHours, [day]: value }
//         }));
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
//         setExpandedSections(SECTIONS.map(s => s.id));
//     };

//     const collapseAll = () => {
//         setExpandedSections([]);
//     };

//     // ==================== RENDER HELPERS ====================
    
//     const getAppIcon = (appType) => {
//         const app = UPI_APPS.find(a => a.value === appType);
//         return app?.icon || '⚫';
//     };

//     const getStatusIcon = (isActive) => {
//         return isActive ? 
//             <CheckCircle size={16} className="status-icon active" /> : 
//             <XCircle size={16} className="status-icon inactive" />;
//     };

//     const formatPhoneNumber = (phone) => {
//         if (!phone) return '';
//         const digits = phone.replace(/\D/g, '');
//         if (digits.length === 10) {
//             return `${digits.slice(0, 5)} ${digits.slice(5)}`;
//         }
//         return phone;
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
//                 <p className="loading-text">Loading company settings...</p>
//                 <style jsx>{`
//                     .loading-container {
//                         min-height: 100vh;
//                         display: flex;
//                         flex-direction: column;
//                         align-items: center;
//                         justify-content: center;
//                         background: #f1f5f9;
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
//                         border-radius: 8px;
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
//                 <title>Company Profile | LFMS</title>
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 <meta name="description" content="Manage your company information and settings" />
//             </Head>

//             <div className="company-profile">
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
//                                 <Building2 size={28} className="title-icon" />
//                                 Company Profile
//                             </h1>
//                             <p className="page-description">
//                                 Manage all your company information in one place
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
//                                 onClick={saveSettings}
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

//                 {/* Desktop Horizontal Tabs */}
//                 <div className="desktop-tabs">
//                     {SECTIONS.map(section => {
//                         const Icon = section.icon;
//                         return (
//                             <button
//                                 key={section.id}
//                                 className={`tab-button ${activeTab === section.id ? 'active' : ''}`}
//                                 onClick={() => handleTabClick(section.id)}
//                             >
//                                 <div className="tab-icon" style={{ 
//                                     backgroundColor: activeTab === section.id ? `${section.color}20` : 'transparent',
//                                     color: activeTab === section.id ? section.color : '#64748b'
//                                 }}>
//                                     <Icon size={20} />
//                                 </div>
//                                 <span className="tab-title" style={{
//                                     color: activeTab === section.id ? '#0f172a' : '#64748b',
//                                     fontWeight: activeTab === section.id ? '600' : '500'
//                                 }}>{section.title}</span>
//                                 {activeTab === section.id && (
//                                     <div className="active-indicator" style={{ backgroundColor: section.color }}></div>
//                                 )}
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {/* Main Content */}
//                 <main className="main-content">
//                     {/* Sections */}
//                     <div className="sections-container">
//                         {SECTIONS.map(section => {
//                             const Icon = section.icon;
//                             const isExpanded = expandedSections.includes(section.id);
                            
//                             return (
//                                 <div key={section.id} className={`section-card ${activeTab === section.id ? 'active' : ''}`}>
//                                     {/* Section Header */}
//                                     <div 
//                                         className="section-header"
//                                         onClick={() => toggleSection(section.id)}
//                                     >
//                                         <div className="section-header-left">
//                                             <div 
//                                                 className="section-icon"
//                                                 style={{ background: `${section.color}15`, color: section.color }}
//                                             >
//                                                 <Icon size={20} />
//                                             </div>
//                                             <div className="section-title">
//                                                 <h2>{section.title}</h2>
//                                                 <p>{section.description}</p>
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
//                                             {/* Basic Info Section */}
//                                             {section.id === 'basic' && (
//                                                 <>
//                                                     {/* Company Details */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Building size={16} />
//                                                             Company Details
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Company Name <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="companyName"
//                                                                     value={formData.companyName}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.companyName ? 'error' : ''}
//                                                                     placeholder="Enter company name"
//                                                                 />
//                                                                 {errors.companyName && <span className="error-text">{errors.companyName}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Legal Name</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="legalName"
//                                                                     value={formData.legalName}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Enter registered legal name"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Tagline</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="tagline"
//                                                                     value={formData.tagline}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Brief company description"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Contact Information */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Phone size={16} />
//                                                             Contact Information
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Phone <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="tel"
//                                                                     name="phone"
//                                                                     value={formData.phone}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.phone ? 'error' : ''}
//                                                                     placeholder="+91 98765 43210"
//                                                                 />
//                                                                 {errors.phone && <span className="error-text">{errors.phone}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Email <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="email"
//                                                                     name="email"
//                                                                     value={formData.email}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.email ? 'error' : ''}
//                                                                     placeholder="company@example.com"
//                                                                 />
//                                                                 {errors.email && <span className="error-text">{errors.email}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Website</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     name="website"
//                                                                     value={formData.website}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="https://www.example.com"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Address */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <MapPin size={16} />
//                                                             Address
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Street Address <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="address"
//                                                                     value={formData.address}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.address ? 'error' : ''}
//                                                                     placeholder="Street address, building, area"
//                                                                 />
//                                                                 {errors.address && <span className="error-text">{errors.address}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>City <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="city"
//                                                                     value={formData.city}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.city ? 'error' : ''}
//                                                                     placeholder="City"
//                                                                 />
//                                                                 {errors.city && <span className="error-text">{errors.city}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>State</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="state"
//                                                                     value={formData.state}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="State"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Pincode</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="pincode"
//                                                                     value={formData.pincode}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Pincode"
//                                                                     maxLength="6"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Country</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="country"
//                                                                     value={formData.country}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Country"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Tax & Legal */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <FileText size={16} />
//                                                             Tax & Legal Information
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>GSTIN</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="gstin"
//                                                                     value={formData.gstin}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.gstin ? 'error' : ''}
//                                                                     placeholder="27ABCDE1234F1Z5"
//                                                                     maxLength="15"
//                                                                 />
//                                                                 {errors.gstin && <span className="error-text">{errors.gstin}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>PAN</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="pan"
//                                                                     value={formData.pan}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.pan ? 'error' : ''}
//                                                                     placeholder="ABCDE1234F"
//                                                                     maxLength="10"
//                                                                 />
//                                                                 {errors.pan && <span className="error-text">{errors.pan}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>CIN</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="cin"
//                                                                     value={formData.cin}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="U12345MH2023PTC123456"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Social Media */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Globe2 size={16} />
//                                                             Social Media Links
//                                                         </h3>
//                                                         <div className="social-grid">
//                                                             <div className="form-field">
//                                                                 <label>Facebook</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     name="social.facebook"
//                                                                     value={formData.social?.facebook}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="https://facebook.com/company"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Instagram</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     name="social.instagram"
//                                                                     value={formData.social?.instagram}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="https://instagram.com/company"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Twitter</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     name="social.twitter"
//                                                                     value={formData.social?.twitter}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="https://twitter.com/company"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>LinkedIn</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     name="social.linkedin"
//                                                                     value={formData.social?.linkedin}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="https://linkedin.com/company"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>YouTube</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     name="social.youtube"
//                                                                     value={formData.social?.youtube}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="https://youtube.com/@company"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Payment Methods Section */}
//                                             {section.id === 'payment_methods' && (
//                                                 <>
//                                                     {/* UPI IDs */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <CreditCard size={16} />
//                                                             UPI IDs
//                                                         </h3>
                                                        
//                                                         {/* Add UPI Button */}
//                                                         {!showUpiForm && (
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setUpiForm({ id: '', name: '', appType: 'other', isActive: true, description: '' });
//                                                                     setEditingUpiIndex(-1);
//                                                                     setShowUpiForm(true);
//                                                                 }}
//                                                                 className="add-button"
//                                                             >
//                                                                 <Plus size={18} />
//                                                                 <span>Add New UPI ID</span>
//                                                             </button>
//                                                         )}

//                                                         {/* UPI Form */}
//                                                         {showUpiForm && (
//                                                             <div className="form-card">
//                                                                 <div className="form-card-header">
//                                                                     <h4>{editingUpiIndex >= 0 ? 'Edit UPI ID' : 'Add New UPI ID'}</h4>
//                                                                     <button
//                                                                         onClick={() => setShowUpiForm(false)}
//                                                                         className="close-btn"
//                                                                     >
//                                                                         <X size={18} />
//                                                                     </button>
//                                                                 </div>

//                                                                 <div className="form-card-body">
//                                                                     <div className="form-field">
//                                                                         <label>UPI ID <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={upiForm.id}
//                                                                             onChange={(e) => setUpiForm({ ...upiForm, id: e.target.value })}
//                                                                             placeholder="e.g., company@oksbi"
//                                                                         />
//                                                                         <span className="hint">Must include @ (e.g., name@oksbi)</span>
//                                                                     </div>

//                                                                     <div className="form-field">
//                                                                         <label>Display Name <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={upiForm.name}
//                                                                             onChange={(e) => setUpiForm({ ...upiForm, name: e.target.value })}
//                                                                             placeholder="e.g., Primary UPI"
//                                                                         />
//                                                                     </div>

//                                                                     <div className="form-field">
//                                                                         <label>App Type</label>
//                                                                         <select
//                                                                             value={upiForm.appType}
//                                                                             onChange={(e) => setUpiForm({ ...upiForm, appType: e.target.value })}
//                                                                         >
//                                                                             {UPI_APPS.map(app => (
//                                                                                 <option key={app.value} value={app.value}>
//                                                                                     {app.icon} {app.label}
//                                                                                 </option>
//                                                                             ))}
//                                                                         </select>
//                                                                     </div>

//                                                                     <div className="form-field">
//                                                                         <label>Description (Optional)</label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={upiForm.description}
//                                                                             onChange={(e) => setUpiForm({ ...upiForm, description: e.target.value })}
//                                                                             placeholder="e.g., For business payments only"
//                                                                         />
//                                                                     </div>

//                                                                     <div className="toggle-field">
//                                                                         <label className="toggle">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={upiForm.isActive}
//                                                                                 onChange={(e) => setUpiForm({ ...upiForm, isActive: e.target.checked })}
//                                                                             />
//                                                                             <span className="toggle-slider"></span>
//                                                                             <span className="toggle-label">
//                                                                                 {upiForm.isActive ? 'Active' : 'Inactive'}
//                                                                             </span>
//                                                                         </label>
//                                                                     </div>

//                                                                     <div className="form-actions">
//                                                                         <button
//                                                                             onClick={() => setShowUpiForm(false)}
//                                                                             className="btn-secondary"
//                                                                         >
//                                                                             Cancel
//                                                                         </button>
//                                                                         <button
//                                                                             onClick={addUpiId}
//                                                                             className="btn-primary"
//                                                                         >
//                                                                             {editingUpiIndex >= 0 ? 'Update' : 'Add'} UPI ID
//                                                                         </button>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         {/* UPI List */}
//                                                         <div className="items-list">
//                                                             {formData.upiIds?.length === 0 ? (
//                                                                 <div className="empty-state">
//                                                                     <CreditCard size={48} />
//                                                                     <h4>No UPI IDs added</h4>
//                                                                     <p>Add your first UPI ID to start accepting payments</p>
//                                                                 </div>
//                                                             ) : (
//                                                                 formData.upiIds.map((upi, index) => {
//                                                                     const app = UPI_APPS.find(a => a.value === upi.appType) || UPI_APPS[5];
//                                                                     return (
//                                                                         <div key={index} className="item-card">
//                                                                             <div className="item-status">
//                                                                                 {getStatusIcon(upi.isActive)}
//                                                                             </div>
//                                                                             <div className="item-details">
//                                                                                 <div className="item-title">
//                                                                                     <span className="item-id">{upi.id}</span>
//                                                                                     <span className="item-name">{upi.name}</span>
//                                                                                 </div>
//                                                                                 {upi.description && (
//                                                                                     <p className="item-description">{upi.description}</p>
//                                                                                 )}
//                                                                                 <span 
//                                                                                     className="item-badge"
//                                                                                     style={{ 
//                                                                                         background: `${app.color}15`,
//                                                                                         color: app.color,
//                                                                                     }}
//                                                                                 >
//                                                                                     {app.icon} {app.label}
//                                                                                 </span>
//                                                                             </div>
//                                                                             <div className="item-actions">
//                                                                                 <button
//                                                                                     onClick={() => toggleUpiStatus(index)}
//                                                                                     className="action-btn"
//                                                                                     title={upi.isActive ? 'Deactivate' : 'Activate'}
//                                                                                 >
//                                                                                     {upi.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
//                                                                                 </button>
//                                                                                 <button
//                                                                                     onClick={() => editUpi(index)}
//                                                                                     className="action-btn"
//                                                                                     title="Edit"
//                                                                                 >
//                                                                                     <Edit2 size={16} />
//                                                                                 </button>
//                                                                                 <button
//                                                                                     onClick={() => deleteUpi(index)}
//                                                                                     className="action-btn delete"
//                                                                                     title="Delete"
//                                                                                 >
//                                                                                     <Trash2 size={16} />
//                                                                                 </button>
//                                                                             </div>
//                                                                         </div>
//                                                                     );
//                                                                 })
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* GPay Numbers */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Smartphone size={16} />
//                                                             GPay Numbers
//                                                         </h3>
                                                        
//                                                         {!showGpayForm && (
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setGpayForm({ phoneNumber: '', name: '', isActive: true, description: '' });
//                                                                     setEditingGpayIndex(-1);
//                                                                     setShowGpayForm(true);
//                                                                 }}
//                                                                 className="add-button"
//                                                             >
//                                                                 <Plus size={18} />
//                                                                 <span>Add New GPay Number</span>
//                                                             </button>
//                                                         )}

//                                                         {showGpayForm && (
//                                                             <div className="form-card">
//                                                                 <div className="form-card-header">
//                                                                     <h4>{editingGpayIndex >= 0 ? 'Edit GPay Number' : 'Add New GPay Number'}</h4>
//                                                                     <button
//                                                                         onClick={() => setShowGpayForm(false)}
//                                                                         className="close-btn"
//                                                                     >
//                                                                         <X size={18} />
//                                                                     </button>
//                                                                 </div>
//                                                                 <div className="form-card-body">
//                                                                     <div className="form-field">
//                                                                         <label>Phone Number <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="tel"
//                                                                             value={gpayForm.phoneNumber}
//                                                                             onChange={(e) => setGpayForm({ ...gpayForm, phoneNumber: e.target.value })}
//                                                                             placeholder="9876543210"
//                                                                             maxLength="10"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Display Name <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={gpayForm.name}
//                                                                             onChange={(e) => setGpayForm({ ...gpayForm, name: e.target.value })}
//                                                                             placeholder="e.g., Primary GPay"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Description (Optional)</label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={gpayForm.description}
//                                                                             onChange={(e) => setGpayForm({ ...gpayForm, description: e.target.value })}
//                                                                             placeholder="e.g., For UPI payments"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="toggle-field">
//                                                                         <label className="toggle">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={gpayForm.isActive}
//                                                                                 onChange={(e) => setGpayForm({ ...gpayForm, isActive: e.target.checked })}
//                                                                             />
//                                                                             <span className="toggle-slider"></span>
//                                                                             <span className="toggle-label">
//                                                                                 {gpayForm.isActive ? 'Active' : 'Inactive'}
//                                                                             </span>
//                                                                         </label>
//                                                                     </div>
//                                                                     <div className="form-actions">
//                                                                         <button
//                                                                             onClick={() => setShowGpayForm(false)}
//                                                                             className="btn-secondary"
//                                                                         >
//                                                                             Cancel
//                                                                         </button>
//                                                                         <button
//                                                                             onClick={addGpayNumber}
//                                                                             className="btn-primary"
//                                                                         >
//                                                                             {editingGpayIndex >= 0 ? 'Update' : 'Add'} GPay Number
//                                                                         </button>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         <div className="items-list">
//                                                             {formData.gpayNumbers?.length === 0 ? (
//                                                                 <div className="empty-state">
//                                                                     <Smartphone size={48} />
//                                                                     <h4>No GPay numbers added</h4>
//                                                                     <p>Add GPay numbers for phone-based payments</p>
//                                                                 </div>
//                                                             ) : (
//                                                                 formData.gpayNumbers.map((gpay, index) => (
//                                                                     <div key={index} className="item-card">
//                                                                         <div className="item-status">
//                                                                             {getStatusIcon(gpay.isActive)}
//                                                                         </div>
//                                                                         <div className="item-details">
//                                                                             <div className="item-title">
//                                                                                 <span className="item-id">📞 {formatPhoneNumber(gpay.phoneNumber)}</span>
//                                                                                 <span className="item-name">{gpay.name}</span>
//                                                                             </div>
//                                                                             {gpay.description && (
//                                                                                 <p className="item-description">{gpay.description}</p>
//                                                                             )}
//                                                                             <span className="item-badge" style={{ background: '#4285F415', color: '#4285F4' }}>
//                                                                                 💚 GPay (UPI: {gpay.upiId})
//                                                                             </span>
//                                                                         </div>
//                                                                         <div className="item-actions">
//                                                                             <button
//                                                                                 onClick={() => toggleGpayStatus(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 {gpay.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => editGpay(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 <Edit2 size={16} />
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => deleteGpay(index)}
//                                                                                 className="action-btn delete"
//                                                                             >
//                                                                                 <Trash2 size={16} />
//                                                                             </button>
//                                                                         </div>
//                                                                     </div>
//                                                                 ))
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* PhonePe Numbers */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Smartphone size={16} />
//                                                             PhonePe Numbers
//                                                         </h3>
                                                        
//                                                         {!showPhonePeForm && (
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setPhonePeForm({ phoneNumber: '', name: '', isActive: true, description: '' });
//                                                                     setEditingPhonePeIndex(-1);
//                                                                     setShowPhonePeForm(true);
//                                                                 }}
//                                                                 className="add-button"
//                                                             >
//                                                                 <Plus size={18} />
//                                                                 <span>Add New PhonePe Number</span>
//                                                             </button>
//                                                         )}

//                                                         {showPhonePeForm && (
//                                                             <div className="form-card">
//                                                                 <div className="form-card-header">
//                                                                     <h4>{editingPhonePeIndex >= 0 ? 'Edit PhonePe Number' : 'Add New PhonePe Number'}</h4>
//                                                                     <button
//                                                                         onClick={() => setShowPhonePeForm(false)}
//                                                                         className="close-btn"
//                                                                     >
//                                                                         <X size={18} />
//                                                                     </button>
//                                                                 </div>
//                                                                 <div className="form-card-body">
//                                                                     <div className="form-field">
//                                                                         <label>Phone Number <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="tel"
//                                                                             value={phonePeForm.phoneNumber}
//                                                                             onChange={(e) => setPhonePeForm({ ...phonePeForm, phoneNumber: e.target.value })}
//                                                                             placeholder="9876543210"
//                                                                             maxLength="10"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Display Name <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={phonePeForm.name}
//                                                                             onChange={(e) => setPhonePeForm({ ...phonePeForm, name: e.target.value })}
//                                                                             placeholder="e.g., Primary PhonePe"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Description (Optional)</label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={phonePeForm.description}
//                                                                             onChange={(e) => setPhonePeForm({ ...phonePeForm, description: e.target.value })}
//                                                                             placeholder="e.g., For business payments"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="toggle-field">
//                                                                         <label className="toggle">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={phonePeForm.isActive}
//                                                                                 onChange={(e) => setPhonePeForm({ ...phonePeForm, isActive: e.target.checked })}
//                                                                             />
//                                                                             <span className="toggle-slider"></span>
//                                                                             <span className="toggle-label">
//                                                                                 {phonePeForm.isActive ? 'Active' : 'Inactive'}
//                                                                             </span>
//                                                                         </label>
//                                                                     </div>
//                                                                     <div className="form-actions">
//                                                                         <button
//                                                                             onClick={() => setShowPhonePeForm(false)}
//                                                                             className="btn-secondary"
//                                                                         >
//                                                                             Cancel
//                                                                         </button>
//                                                                         <button
//                                                                             onClick={addPhonePeNumber}
//                                                                             className="btn-primary"
//                                                                         >
//                                                                             {editingPhonePeIndex >= 0 ? 'Update' : 'Add'} PhonePe Number
//                                                                         </button>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         <div className="items-list">
//                                                             {formData.phonePeNumbers?.length === 0 ? (
//                                                                 <div className="empty-state">
//                                                                     <Smartphone size={48} />
//                                                                     <h4>No PhonePe numbers added</h4>
//                                                                     <p>Add PhonePe numbers for UPI payments</p>
//                                                                 </div>
//                                                             ) : (
//                                                                 formData.phonePeNumbers.map((phonepe, index) => (
//                                                                     <div key={index} className="item-card">
//                                                                         <div className="item-status">
//                                                                             {getStatusIcon(phonepe.isActive)}
//                                                                         </div>
//                                                                         <div className="item-details">
//                                                                             <div className="item-title">
//                                                                                 <span className="item-id">📞 {formatPhoneNumber(phonepe.phoneNumber)}</span>
//                                                                                 <span className="item-name">{phonepe.name}</span>
//                                                                             </div>
//                                                                             {phonepe.description && (
//                                                                                 <p className="item-description">{phonepe.description}</p>
//                                                                             )}
//                                                                             <span className="item-badge" style={{ background: '#5F259F15', color: '#5F259F' }}>
//                                                                                 🟣 PhonePe (UPI: {phonepe.upiId})
//                                                                             </span>
//                                                                         </div>
//                                                                         <div className="item-actions">
//                                                                             <button
//                                                                                 onClick={() => togglePhonePeStatus(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 {phonepe.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => editPhonePe(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 <Edit2 size={16} />
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => deletePhonePe(index)}
//                                                                                 className="action-btn delete"
//                                                                             >
//                                                                                 <Trash2 size={16} />
//                                                                             </button>
//                                                                         </div>
//                                                                     </div>
//                                                                 ))
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* PayTM Numbers */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Smartphone size={16} />
//                                                             PayTM Numbers
//                                                         </h3>
                                                        
//                                                         {!showPaytmForm && (
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setPaytmForm({ phoneNumber: '', name: '', isActive: true, description: '' });
//                                                                     setEditingPaytmIndex(-1);
//                                                                     setShowPaytmForm(true);
//                                                                 }}
//                                                                 className="add-button"
//                                                             >
//                                                                 <Plus size={18} />
//                                                                 <span>Add New PayTM Number</span>
//                                                             </button>
//                                                         )}

//                                                         {showPaytmForm && (
//                                                             <div className="form-card">
//                                                                 <div className="form-card-header">
//                                                                     <h4>{editingPaytmIndex >= 0 ? 'Edit PayTM Number' : 'Add New PayTM Number'}</h4>
//                                                                     <button
//                                                                         onClick={() => setShowPaytmForm(false)}
//                                                                         className="close-btn"
//                                                                     >
//                                                                         <X size={18} />
//                                                                     </button>
//                                                                 </div>
//                                                                 <div className="form-card-body">
//                                                                     <div className="form-field">
//                                                                         <label>Phone Number <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="tel"
//                                                                             value={paytmForm.phoneNumber}
//                                                                             onChange={(e) => setPaytmForm({ ...paytmForm, phoneNumber: e.target.value })}
//                                                                             placeholder="9876543210"
//                                                                             maxLength="10"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Display Name <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={paytmForm.name}
//                                                                             onChange={(e) => setPaytmForm({ ...paytmForm, name: e.target.value })}
//                                                                             placeholder="e.g., Primary PayTM"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Description (Optional)</label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={paytmForm.description}
//                                                                             onChange={(e) => setPaytmForm({ ...paytmForm, description: e.target.value })}
//                                                                             placeholder="e.g., For UPI payments"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="toggle-field">
//                                                                         <label className="toggle">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={paytmForm.isActive}
//                                                                                 onChange={(e) => setPaytmForm({ ...paytmForm, isActive: e.target.checked })}
//                                                                             />
//                                                                             <span className="toggle-slider"></span>
//                                                                             <span className="toggle-label">
//                                                                                 {paytmForm.isActive ? 'Active' : 'Inactive'}
//                                                                             </span>
//                                                                         </label>
//                                                                     </div>
//                                                                     <div className="form-actions">
//                                                                         <button
//                                                                             onClick={() => setShowPaytmForm(false)}
//                                                                             className="btn-secondary"
//                                                                         >
//                                                                             Cancel
//                                                                         </button>
//                                                                         <button
//                                                                             onClick={addPaytmNumber}
//                                                                             className="btn-primary"
//                                                                         >
//                                                                             {editingPaytmIndex >= 0 ? 'Update' : 'Add'} PayTM Number
//                                                                         </button>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         <div className="items-list">
//                                                             {formData.paytmNumbers?.length === 0 ? (
//                                                                 <div className="empty-state">
//                                                                     <Smartphone size={48} />
//                                                                     <h4>No PayTM numbers added</h4>
//                                                                     <p>Add PayTM numbers for payments</p>
//                                                                 </div>
//                                                             ) : (
//                                                                 formData.paytmNumbers.map((paytm, index) => (
//                                                                     <div key={index} className="item-card">
//                                                                         <div className="item-status">
//                                                                             {getStatusIcon(paytm.isActive)}
//                                                                         </div>
//                                                                         <div className="item-details">
//                                                                             <div className="item-title">
//                                                                                 <span className="item-id">📞 {formatPhoneNumber(paytm.phoneNumber)}</span>
//                                                                                 <span className="item-name">{paytm.name}</span>
//                                                                             </div>
//                                                                             {paytm.description && (
//                                                                                 <p className="item-description">{paytm.description}</p>
//                                                                             )}
//                                                                             <span className="item-badge" style={{ background: '#00BAF215', color: '#00BAF2' }}>
//                                                                                 🔵 PayTM (UPI: {paytm.upiId})
//                                                                             </span>
//                                                                         </div>
//                                                                         <div className="item-actions">
//                                                                             <button
//                                                                                 onClick={() => togglePaytmStatus(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 {paytm.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => editPaytm(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 <Edit2 size={16} />
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => deletePaytm(index)}
//                                                                                 className="action-btn delete"
//                                                                             >
//                                                                                 <Trash2 size={16} />
//                                                                             </button>
//                                                                         </div>
//                                                                     </div>
//                                                                 ))
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* QR Code */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <QrCode size={16} />
//                                                             QR Code
//                                                         </h3>
                                                        
//                                                         <div className="qr-section">
//                                                             {formData.qrCode?.imageUrl ? (
//                                                                 <div className="qr-preview">
//                                                                     <img src={formData.qrCode.imageUrl} alt="Payment QR Code" />
//                                                                     <div className="qr-info">
//                                                                         <p><strong>Name:</strong> {formData.qrCode.name}</p>
//                                                                         {formData.qrCode.description && (
//                                                                             <p><strong>Description:</strong> {formData.qrCode.description}</p>
//                                                                         )}
//                                                                         <p><strong>Status:</strong> 
//                                                                             <span className={formData.qrCode.isActive ? 'active' : 'inactive'}>
//                                                                                 {formData.qrCode.isActive ? 'Active' : 'Inactive'}
//                                                                             </span>
//                                                                         </p>
//                                                                     </div>
//                                                                     <div className="qr-actions">
//                                                                         <button
//                                                                             onClick={toggleQrStatus}
//                                                                             className="qr-action-btn"
//                                                                         >
//                                                                             {formData.qrCode.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
//                                                                             {formData.qrCode.isActive ? 'Deactivate' : 'Activate'}
//                                                                         </button>
//                                                                         <button
//                                                                             onClick={() => setShowQrForm(true)}
//                                                                             className="qr-action-btn"
//                                                                         >
//                                                                             <Edit2 size={16} />
//                                                                             Edit
//                                                                         </button>
//                                                                         <button
//                                                                             onClick={deleteQrCode}
//                                                                             className="qr-action-btn delete"
//                                                                         >
//                                                                             <Trash2 size={16} />
//                                                                             Delete
//                                                                         </button>
//                                                                     </div>
//                                                                 </div>
//                                                             ) : (
//                                                                 <button
//                                                                     onClick={() => setShowQrForm(true)}
//                                                                     className="add-qr-btn"
//                                                                 >
//                                                                     <QrCode size={32} />
//                                                                     <span>Upload QR Code</span>
//                                                                     <small>Customers can scan this QR to pay</small>
//                                                                 </button>
//                                                             )}
//                                                         </div>

//                                                         {/* QR Code Form Modal */}
//                                                         {showQrForm && (
//                                                             <div className="modal-overlay" onClick={() => setShowQrForm(false)}>
//                                                                 <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//                                                                     <div className="modal-header">
//                                                                         <h4>{formData.qrCode?.imageUrl ? 'Edit QR Code' : 'Upload QR Code'}</h4>
//                                                                         <button onClick={() => setShowQrForm(false)} className="close-btn">
//                                                                             <X size={20} />
//                                                                         </button>
//                                                                     </div>
//                                                                     <div className="modal-body">
//                                                                         <div className="form-field">
//                                                                             <label>QR Code Image</label>
//                                                                             <div className="file-upload">
//                                                                                 <input
//                                                                                     type="file"
//                                                                                     accept="image/*"
//                                                                                     onChange={handleQrFileChange}
//                                                                                     id="qr-upload"
//                                                                                 />
//                                                                                 <label htmlFor="qr-upload" className="file-label">
//                                                                                     <Upload size={20} />
//                                                                                     <span>Choose Image</span>
//                                                                                 </label>
//                                                                             </div>
//                                                                             {qrForm.imageUrl && (
//                                                                                 <div className="upload-preview">
//                                                                                     <img src={qrForm.imageUrl} alt="QR Preview" />
//                                                                                 </div>
//                                                                             )}
//                                                                         </div>
//                                                                         <div className="form-field">
//                                                                             <label>Name</label>
//                                                                             <input
//                                                                                 type="text"
//                                                                                 value={qrForm.name}
//                                                                                 onChange={(e) => setQrForm({ ...qrForm, name: e.target.value })}
//                                                                                 placeholder="e.g., Payment QR Code"
//                                                                             />
//                                                                         </div>
//                                                                         <div className="form-field">
//                                                                             <label>Description (Optional)</label>
//                                                                             <input
//                                                                                 type="text"
//                                                                                 value={qrForm.description}
//                                                                                 onChange={(e) => setQrForm({ ...qrForm, description: e.target.value })}
//                                                                                 placeholder="Brief description"
//                                                                             />
//                                                                         </div>
//                                                                         <div className="toggle-field">
//                                                                             <label className="toggle">
//                                                                                 <input
//                                                                                     type="checkbox"
//                                                                                     checked={qrForm.isActive}
//                                                                                     onChange={(e) => setQrForm({ ...qrForm, isActive: e.target.checked })}
//                                                                                 />
//                                                                                 <span className="toggle-slider"></span>
//                                                                                 <span className="toggle-label">
//                                                                                     {qrForm.isActive ? 'Active' : 'Inactive'}
//                                                                                 </span>
//                                                                             </label>
//                                                                         </div>
//                                                                         <div className="form-actions">
//                                                                             <button
//                                                                                 onClick={() => setShowQrForm(false)}
//                                                                                 className="btn-secondary"
//                                                                             >
//                                                                                 Cancel
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={saveQrCode}
//                                                                                 className="btn-primary"
//                                                                             >
//                                                                                 Save QR Code
//                                                                             </button>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                     </div>

//                                                     {/* Bank Accounts */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Landmark size={16} />
//                                                             Bank Accounts
//                                                         </h3>
                                                        
//                                                         {!showBankForm && (
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setBankAccountForm({
//                                                                         accountName: '',
//                                                                         accountNumber: '',
//                                                                         bankName: '',
//                                                                         ifscCode: '',
//                                                                         branch: '',
//                                                                         accountType: 'Current',
//                                                                         isActive: true,
//                                                                         isDefault: false,
//                                                                         description: ''
//                                                                     });
//                                                                     setEditingBankIndex(-1);
//                                                                     setShowBankForm(true);
//                                                                 }}
//                                                                 className="add-button"
//                                                             >
//                                                                 <Plus size={18} />
//                                                                 <span>Add New Bank Account</span>
//                                                             </button>
//                                                         )}

//                                                         {showBankForm && (
//                                                             <div className="form-card">
//                                                                 <div className="form-card-header">
//                                                                     <h4>{editingBankIndex >= 0 ? 'Edit Bank Account' : 'Add New Bank Account'}</h4>
//                                                                     <button
//                                                                         onClick={() => setShowBankForm(false)}
//                                                                         className="close-btn"
//                                                                     >
//                                                                         <X size={18} />
//                                                                     </button>
//                                                                 </div>
//                                                                 <div className="form-card-body">
//                                                                     <div className="form-field">
//                                                                         <label>Account Holder Name <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={bankAccountForm.accountName}
//                                                                             onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountName: e.target.value })}
//                                                                             placeholder="As per bank records"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Account Number <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={bankAccountForm.accountNumber}
//                                                                             onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountNumber: e.target.value })}
//                                                                             placeholder="Enter account number"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Bank Name <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={bankAccountForm.bankName}
//                                                                             onChange={(e) => setBankAccountForm({ ...bankAccountForm, bankName: e.target.value })}
//                                                                             placeholder="e.g., State Bank of India"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>IFSC Code <span className="required">*</span></label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={bankAccountForm.ifscCode}
//                                                                             onChange={(e) => setBankAccountForm({ ...bankAccountForm, ifscCode: e.target.value.toUpperCase() })}
//                                                                             placeholder="SBIN0001234"
//                                                                             maxLength="11"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Branch (Optional)</label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={bankAccountForm.branch}
//                                                                             onChange={(e) => setBankAccountForm({ ...bankAccountForm, branch: e.target.value })}
//                                                                             placeholder="Branch name"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Account Type</label>
//                                                                         <select
//                                                                             value={bankAccountForm.accountType}
//                                                                             onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountType: e.target.value })}
//                                                                         >
//                                                                             {ACCOUNT_TYPES.map(type => (
//                                                                                 <option key={type} value={type}>{type}</option>
//                                                                             ))}
//                                                                         </select>
//                                                                     </div>
//                                                                     <div className="form-field">
//                                                                         <label>Description (Optional)</label>
//                                                                         <input
//                                                                             type="text"
//                                                                             value={bankAccountForm.description}
//                                                                             onChange={(e) => setBankAccountForm({ ...bankAccountForm, description: e.target.value })}
//                                                                             placeholder="e.g., Main business account"
//                                                                         />
//                                                                     </div>
//                                                                     <div className="toggle-field">
//                                                                         <label className="toggle">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={bankAccountForm.isActive}
//                                                                                 onChange={(e) => setBankAccountForm({ ...bankAccountForm, isActive: e.target.checked })}
//                                                                             />
//                                                                             <span className="toggle-slider"></span>
//                                                                             <span className="toggle-label">
//                                                                                 {bankAccountForm.isActive ? 'Active' : 'Inactive'}
//                                                                             </span>
//                                                                         </label>
//                                                                     </div>
//                                                                     <div className="toggle-field">
//                                                                         <label className="toggle">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={bankAccountForm.isDefault}
//                                                                                 onChange={(e) => setBankAccountForm({ ...bankAccountForm, isDefault: e.target.checked })}
//                                                                             />
//                                                                             <span className="toggle-slider"></span>
//                                                                             <span className="toggle-label">
//                                                                                 Set as Default Account
//                                                                             </span>
//                                                                         </label>
//                                                                     </div>
//                                                                     <div className="form-actions">
//                                                                         <button
//                                                                             onClick={() => setShowBankForm(false)}
//                                                                             className="btn-secondary"
//                                                                         >
//                                                                             Cancel
//                                                                         </button>
//                                                                         <button
//                                                                             onClick={addBankAccount}
//                                                                             className="btn-primary"
//                                                                         >
//                                                                             {editingBankIndex >= 0 ? 'Update' : 'Add'} Bank Account
//                                                                         </button>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         <div className="items-list">
//                                                             {formData.bankAccounts?.length === 0 ? (
//                                                                 <div className="empty-state">
//                                                                     <Landmark size={48} />
//                                                                     <h4>No bank accounts added</h4>
//                                                                     <p>Add bank accounts for traditional transfers</p>
//                                                                 </div>
//                                                             ) : (
//                                                                 formData.bankAccounts.map((bank, index) => (
//                                                                     <div key={index} className="item-card">
//                                                                         <div className="item-status">
//                                                                             {getStatusIcon(bank.isActive)}
//                                                                             {bank.isDefault && (
//                                                                                 <span className="default-badge" title="Default Account">⭐</span>
//                                                                             )}
//                                                                         </div>
//                                                                         <div className="item-details">
//                                                                             <div className="item-title">
//                                                                                 <span className="item-id">{bank.accountName}</span>
//                                                                                 <span className="item-name">{bank.bankName}</span>
//                                                                             </div>
//                                                                             <p className="item-description">
//                                                                                 A/C: {bank.accountNumber.slice(-4)} • IFSC: {bank.ifscCode}
//                                                                             </p>
//                                                                             {bank.description && (
//                                                                                 <p className="item-description">{bank.description}</p>
//                                                                             )}
//                                                                         </div>
//                                                                         <div className="item-actions">
//                                                                             {!bank.isDefault && (
//                                                                                 <button
//                                                                                     onClick={() => setDefaultBank(index)}
//                                                                                     className="action-btn"
//                                                                                     title="Set as Default"
//                                                                                 >
//                                                                                     <Star size={16} />
//                                                                                 </button>
//                                                                             )}
//                                                                             <button
//                                                                                 onClick={() => toggleBankStatus(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 {bank.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
//                                                                             </button>
//                                                                             <button
//                                                                                 onClick={() => editBankAccount(index)}
//                                                                                 className="action-btn"
//                                                                             >
//                                                                                 <Edit2 size={16} />
//                                                                             </button>
//                                                                             {!bank.isDefault && (
//                                                                                 <button
//                                                                                     onClick={() => deleteBankAccount(index)}
//                                                                                     className="action-btn delete"
//                                                                                 >
//                                                                                     <Trash2 size={16} />
//                                                                                 </button>
//                                                                             )}
//                                                                         </div>
//                                                                     </div>
//                                                                 ))
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* Payment Settings */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Settings size={16} />
//                                                             Payment Settings
//                                                         </h3>
                                                        
//                                                         <button
//                                                             onClick={() => setShowPaymentSettings(!showPaymentSettings)}
//                                                             className="settings-toggle"
//                                                         >
//                                                             <span>Configure Payment Settings</span>
//                                                             <ChevronRight size={18} className={`chevron ${showPaymentSettings ? 'expanded' : ''}`} />
//                                                         </button>

//                                                         {showPaymentSettings && (
//                                                             <div className="payment-settings">
//                                                                 <div className="toggle-field">
//                                                                     <label className="toggle">
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             checked={formData.paymentSettings?.autoVerifyEnabled}
//                                                                             onChange={(e) => handlePaymentSettingsChange('autoVerifyEnabled', e.target.checked)}
//                                                                         />
//                                                                         <span className="toggle-slider"></span>
//                                                                         <span className="toggle-label">Enable Auto-Verification</span>
//                                                                     </label>
//                                                                 </div>

//                                                                 <div className="form-field">
//                                                                     <label>Minimum Confidence for Auto-Verify (%)</label>
//                                                                     <input
//                                                                         type="number"
//                                                                         value={formData.paymentSettings?.minConfidenceForAuto}
//                                                                         onChange={(e) => handlePaymentSettingsChange('minConfidenceForAuto', parseInt(e.target.value))}
//                                                                         min="50"
//                                                                         max="100"
//                                                                     />
//                                                                     <span className="hint">Recommended: 85%</span>
//                                                                 </div>

//                                                                 <div className="form-field">
//                                                                     <label>Payment Timeout (minutes)</label>
//                                                                     <input
//                                                                         type="number"
//                                                                         value={formData.paymentSettings?.paymentTimeout}
//                                                                         onChange={(e) => handlePaymentSettingsChange('paymentTimeout', parseInt(e.target.value))}
//                                                                         min="5"
//                                                                         max="60"
//                                                                     />
//                                                                     <span className="hint">How long customers have to complete payment</span>
//                                                                 </div>

//                                                                 <div className="form-field">
//                                                                     <label>Amount Tolerance (₹)</label>
//                                                                     <input
//                                                                         type="number"
//                                                                         value={formData.paymentSettings?.autoVerifyThresholds?.amountTolerance}
//                                                                         onChange={(e) => setFormData({
//                                                                             ...formData,
//                                                                             paymentSettings: {
//                                                                                 ...formData.paymentSettings,
//                                                                                 autoVerifyThresholds: {
//                                                                                     ...formData.paymentSettings?.autoVerifyThresholds,
//                                                                                     amountTolerance: parseInt(e.target.value)
//                                                                                 }
//                                                                             }
//                                                                         })}
//                                                                         min="0"
//                                                                         max="10"
//                                                                     />
//                                                                     <span className="hint">Allowed difference between detected and expected amount</span>
//                                                                 </div>

//                                                                 <div className="form-field">
//                                                                     <label>Time Window (minutes)</label>
//                                                                     <input
//                                                                         type="number"
//                                                                         value={formData.paymentSettings?.autoVerifyThresholds?.timeWindow}
//                                                                         onChange={(e) => setFormData({
//                                                                             ...formData,
//                                                                             paymentSettings: {
//                                                                                 ...formData.paymentSettings,
//                                                                                 autoVerifyThresholds: {
//                                                                                     ...formData.paymentSettings?.autoVerifyThresholds,
//                                                                                     timeWindow: parseInt(e.target.value)
//                                                                                 }
//                                                                             }
//                                                                         })}
//                                                                         min="5"
//                                                                         max="60"
//                                                                     />
//                                                                     <span className="hint">Maximum age of payment screenshot</span>
//                                                                 </div>

//                                                                 <div className="toggle-field">
//                                                                     <label className="toggle">
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             checked={formData.paymentSettings?.requireTransactionId}
//                                                                             onChange={(e) => handlePaymentSettingsChange('requireTransactionId', e.target.checked)}
//                                                                         />
//                                                                         <span className="toggle-slider"></span>
//                                                                         <span className="toggle-label">Require Transaction ID</span>
//                                                                     </label>
//                                                                 </div>

//                                                                 <div className="toggle-field">
//                                                                     <label className="toggle">
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             checked={formData.paymentSettings?.allowMultiplePaymentMethods}
//                                                                             onChange={(e) => handlePaymentSettingsChange('allowMultiplePaymentMethods', e.target.checked)}
//                                                                         />
//                                                                         <span className="toggle-slider"></span>
//                                                                         <span className="toggle-label">Allow Multiple Payment Methods</span>
//                                                                     </label>
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Bank Section (Legacy) */}
//                                             {section.id === 'bank' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Landmark size={16} />
//                                                             Bank Information (Legacy)
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Bank Name</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="bank.name"
//                                                                     value={formData.bank?.name}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="e.g., State Bank of India"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Account Number</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="bank.account"
//                                                                     value={formData.bank?.account}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Enter account number"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>IFSC Code</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="bank.ifsc"
//                                                                     value={formData.bank?.ifsc}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.bankIfsc ? 'error' : ''}
//                                                                     placeholder="SBIN0001234"
//                                                                     maxLength="11"
//                                                                     style={{ textTransform: 'uppercase' }}
//                                                                 />
//                                                                 {errors.bankIfsc && <span className="error-text">{errors.bankIfsc}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Branch</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="bank.branch"
//                                                                     value={formData.bank?.branch}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Branch name"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Account Type</label>
//                                                                 <select
//                                                                     name="bank.accountType"
//                                                                     value={formData.bank?.accountType}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     <option value="Current Account">Current Account</option>
//                                                                     <option value="Savings Account">Savings Account</option>
//                                                                     <option value="Business Account">Business Account</option>
//                                                                 </select>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <ShieldCheck size={20} />
//                                                         <p>
//                                                             <strong>Note:</strong> These details are for legacy support. Use Bank Accounts in Payment Methods for multiple accounts.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Invoice Section */}
//                                             {section.id === 'invoice' && (
//                                                 <>
//                                                     {/* Format Settings */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <FileText size={16} />
//                                                             Format Settings
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Invoice Prefix</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="invoiceSettings.prefix"
//                                                                     value={formData.invoiceSettings?.prefix}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="INV"
//                                                                     maxLength="5"
//                                                                     style={{ textTransform: 'uppercase' }}
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Separator</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="invoiceSettings.separator"
//                                                                     value={formData.invoiceSettings?.separator}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="-"
//                                                                     maxLength="1"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Date Format</label>
//                                                                 <select
//                                                                     name="invoiceSettings.dateFormat"
//                                                                     value={formData.invoiceSettings?.dateFormat}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     <option value="dd/mm/yyyy">DD/MM/YYYY</option>
//                                                                     <option value="mm/dd/yyyy">MM/DD/YYYY</option>
//                                                                     <option value="yyyy-mm-dd">YYYY-MM-DD</option>
//                                                                 </select>
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Currency Symbol</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="invoiceSettings.currency"
//                                                                     value={formData.invoiceSettings?.currency}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="₹"
//                                                                     maxLength="2"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Tax Settings */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <DollarSign size={16} />
//                                                             Tax Settings
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Tax System</label>
//                                                                 <select
//                                                                     name="invoiceSettings.taxSystem"
//                                                                     value={formData.invoiceSettings?.taxSystem}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     <option value="GST">GST (India)</option>
//                                                                     <option value="VAT">VAT</option>
//                                                                     <option value="None">No Tax</option>
//                                                                 </select>
//                                                             </div>
//                                                         </div>

//                                                         <div className="toggle-field">
//                                                             <label className="toggle">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     name="invoiceSettings.gstBreakdown"
//                                                                     checked={formData.invoiceSettings?.gstBreakdown}
//                                                                     onChange={handleInputChange}
//                                                                 />
//                                                                 <span className="toggle-slider"></span>
//                                                                 <span className="toggle-label">Show GST breakdown</span>
//                                                             </label>
//                                                         </div>

//                                                         <div className="toggle-field">
//                                                             <label className="toggle">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     name="invoiceSettings.showCGSTSGST"
//                                                                     checked={formData.invoiceSettings?.showCGSTSGST}
//                                                                     onChange={handleInputChange}
//                                                                 />
//                                                                 <span className="toggle-slider"></span>
//                                                                 <span className="toggle-label">Show CGST/SGST separately</span>
//                                                             </label>
//                                                         </div>

//                                                         <div className="toggle-field">
//                                                             <label className="toggle">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     name="invoiceSettings.roundAmount"
//                                                                     checked={formData.invoiceSettings?.roundAmount}
//                                                                     onChange={handleInputChange}
//                                                                 />
//                                                                 <span className="toggle-slider"></span>
//                                                                 <span className="toggle-label">Round amounts to nearest integer</span>
//                                                             </label>
//                                                         </div>
//                                                     </div>

//                                                     {/* Terms & Policies */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <FileSignature size={16} />
//                                                             Terms & Policies
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Payment Terms</label>
//                                                                 <textarea
//                                                                     name="invoiceSettings.paymentTerms"
//                                                                     value={formData.invoiceSettings?.paymentTerms}
//                                                                     onChange={handleInputChange}
//                                                                     rows="2"
//                                                                     placeholder="e.g., Due on receipt"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Delivery Terms</label>
//                                                                 <textarea
//                                                                     name="invoiceSettings.deliveryTerms"
//                                                                     value={formData.invoiceSettings?.deliveryTerms}
//                                                                     onChange={handleInputChange}
//                                                                     rows="2"
//                                                                     placeholder="e.g., 3-5 business days after payment"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Warranty Terms</label>
//                                                                 <textarea
//                                                                     name="invoiceSettings.warrantyTerms"
//                                                                     value={formData.invoiceSettings?.warrantyTerms}
//                                                                     onChange={handleInputChange}
//                                                                     rows="2"
//                                                                     placeholder="e.g., 7 days replacement for defects"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Refund Policy</label>
//                                                                 <textarea
//                                                                     name="invoiceSettings.refundPolicy"
//                                                                     value={formData.invoiceSettings?.refundPolicy}
//                                                                     onChange={handleInputChange}
//                                                                     rows="2"
//                                                                     placeholder="e.g., No refunds after order processing"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Support Section */}
//                                             {section.id === 'support' && (
//                                                 <>
//                                                     {/* Contact Channels */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <HeadphonesIcon size={16} />
//                                                             Support Channels
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Support Email</label>
//                                                                 <input
//                                                                     type="email"
//                                                                     name="support.email"
//                                                                     value={formData.support?.email}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="support@company.com"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Support Phone</label>
//                                                                 <input
//                                                                     type="tel"
//                                                                     name="support.phone"
//                                                                     value={formData.support?.phone}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="+91 98765 43210"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>WhatsApp Number</label>
//                                                                 <input
//                                                                     type="tel"
//                                                                     name="support.whatsapp"
//                                                                     value={formData.support?.whatsapp}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="+91 98765 43210"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Availability */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Clock size={16} />
//                                                             Availability
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Support Hours</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="support.hours"
//                                                                     value={formData.support?.hours}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Mon-Sat, 10:00 AM - 7:00 PM"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Response Time</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="support.responseTime"
//                                                                     value={formData.support?.responseTime}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Within 30 minutes"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Business Hours */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <CalendarIcon size={16} />
//                                                             Business Hours
//                                                         </h3>
//                                                         <div className="hours-list">
//                                                             {Object.entries(formData.businessHours || {}).map(([day, hours]) => (
//                                                                 <div key={day} className="hours-item">
//                                                                     <label className="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</label>
//                                                                     <input
//                                                                         type="text"
//                                                                         value={hours}
//                                                                         onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
//                                                                         placeholder="9:00 AM - 6:00 PM"
//                                                                     />
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Order Flow Section */}
//                                             {section.id === 'order_flow' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Route size={16} />
//                                                             WhatsApp Order Flow Configuration
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Order Collection Mode</label>
//                                                                 <div className="radio-group">
//                                                                     <label className={`radio-label ${formData.orderFlowMode === 'long' ? 'selected' : ''}`}>
//                                                                         <input
//                                                                             type="radio"
//                                                                             name="orderFlowMode"
//                                                                             value="long"
//                                                                             checked={formData.orderFlowMode === 'long'}
//                                                                             onChange={handleInputChange}
//                                                                         />
//                                                                         <div className="radio-content">
//                                                                             <div className="radio-header">
//                                                                                 <strong>Long Version (Step by Step) - Default</strong>
//                                                                                 {formData.orderFlowMode === 'long' && (
//                                                                                     <span className="active-badge">Active</span>
//                                                                                 )}
//                                                                             </div>
//                                                                             <p className="radio-description">
//                                                                                 • Collect address one field at a time (Door No → Street → Area → City → State → Pincode)<br/>
//                                                                                 • Product confirmation step before address<br/>
//                                                                                 • Final confirmation before place order<br/>
//                                                                                 • More detailed, guided process for customers
//                                                                             </p>
//                                                                             <div className="flow-preview">
//                                                                                 <span className="preview-label">Flow Preview:</span>
//                                                                                 <code>Order → Product → Confirm → Door No → Street → Area → City → State → Pincode → Final → Payment</code>
//                                                                             </div>
//                                                                         </div>
//                                                                     </label>
                                                                    
//                                                                     <label className={`radio-label ${formData.orderFlowMode === 'short' ? 'selected' : ''}`}>
//                                                                         <input
//                                                                             type="radio"
//                                                                             name="orderFlowMode"
//                                                                             value="short"
//                                                                             checked={formData.orderFlowMode === 'short'}
//                                                                             onChange={handleInputChange}
//                                                                         />
//                                                                         <div className="radio-content">
//                                                                             <div className="radio-header">
//                                                                                 <strong>Short Version (Quick Order)</strong>
//                                                                                 {formData.orderFlowMode === 'short' && (
//                                                                                     <span className="active-badge">Active</span>
//                                                                                 )}
//                                                                             </div>
//                                                                             <p className="radio-description">
//                                                                                 • Collect full address in one message<br/>
//                                                                                 • Format: Door No, Street, Area, City, State<br/>
//                                                                                 • Skip product confirmation step<br/>
//                                                                                 • Direct to place order after address<br/>
//                                                                                 • Faster checkout experience
//                                                                             </p>
//                                                                             <div className="flow-preview">
//                                                                                 <span className="preview-label">Flow Preview:</span>
//                                                                                 <code>Order → Product → Full Address → Final → Payment</code>
//                                                                             </div>
//                                                                         </div>
//                                                                     </label>
//                                                                 </div>
//                                                                 {errors.orderFlowMode && <span className="error-text">{errors.orderFlowMode}</span>}
//                                                                 <span className="hint">
//                                                                     <Info size={14} /> 
//                                                                     Choose how customers enter their shipping address during WhatsApp checkout. 
//                                                                     Long version provides step-by-step guidance, short version is faster for experienced customers.
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Info size={20} />
//                                                         <p>
//                                                             <strong>Note:</strong> Changes to order flow mode will affect how new orders are collected via WhatsApp. Existing orders continue with their original flow.
//                                                         </p>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Branding Section */}
//                                             {section.id === 'branding' && (
//                                                 <>
//                                                     {/* Theme Colors */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <PaletteIcon size={16} />
//                                                             Theme Colors
//                                                         </h3>
//                                                         <div className="colors-grid">
//                                                             <div className="color-field">
//                                                                 <label>Primary</label>
//                                                                 <div className="color-input">
//                                                                     <input
//                                                                         type="color"
//                                                                         value={formData.theme?.primary || '#2563eb'}
//                                                                         onChange={(e) => handleThemeChange('primary', e.target.value)}
//                                                                     />
//                                                                     <input
//                                                                         type="text"
//                                                                         value={formData.theme?.primary || '#2563eb'}
//                                                                         onChange={(e) => handleThemeChange('primary', e.target.value)}
//                                                                         placeholder="#2563eb"
//                                                                     />
//                                                                 </div>
//                                                             </div>

//                                                             <div className="color-field">
//                                                                 <label>Secondary</label>
//                                                                 <div className="color-input">
//                                                                     <input
//                                                                         type="color"
//                                                                         value={formData.theme?.secondary || '#4f46e5'}
//                                                                         onChange={(e) => handleThemeChange('secondary', e.target.value)}
//                                                                     />
//                                                                     <input
//                                                                         type="text"
//                                                                         value={formData.theme?.secondary || '#4f46e5'}
//                                                                         onChange={(e) => handleThemeChange('secondary', e.target.value)}
//                                                                         placeholder="#4f46e5"
//                                                                     />
//                                                                 </div>
//                                                             </div>

//                                                             <div className="color-field">
//                                                                 <label>Accent</label>
//                                                                 <div className="color-input">
//                                                                     <input
//                                                                         type="color"
//                                                                         value={formData.theme?.accent || '#0d9488'}
//                                                                         onChange={(e) => handleThemeChange('accent', e.target.value)}
//                                                                     />
//                                                                     <input
//                                                                         type="text"
//                                                                         value={formData.theme?.accent || '#0d9488'}
//                                                                         onChange={(e) => handleThemeChange('accent', e.target.value)}
//                                                                         placeholder="#0d9488"
//                                                                     />
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* Color Preview */}
//                                                         <div className="color-preview">
//                                                             <div className="preview-bar">
//                                                                 <div className="preview-segment" style={{ backgroundColor: formData.theme?.primary }}>Primary</div>
//                                                                 <div className="preview-segment" style={{ backgroundColor: formData.theme?.secondary }}>Secondary</div>
//                                                                 <div className="preview-segment" style={{ backgroundColor: formData.theme?.accent }}>Accent</div>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Brand Assets */}
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <ImageIcon size={16} />
//                                                             Brand Assets
//                                                         </h3>
//                                                         <div className="assets-grid">
//                                                             <div className="asset-card">
//                                                                 <div className="asset-preview">
//                                                                     {formData.logo ? (
//                                                                         <img src={formData.logo} alt="Logo" />
//                                                                     ) : (
//                                                                         <Building2 size={32} />
//                                                                     )}
//                                                                 </div>
//                                                                 <label className="asset-upload">
//                                                                     <Upload size={14} />
//                                                                     <span>Upload Logo</span>
//                                                                     <input type="file" accept="image/*" />
//                                                                 </label>
//                                                             </div>

//                                                             <div className="asset-card">
//                                                                 <div className="asset-preview">
//                                                                     {formData.favicon ? (
//                                                                         <img src={formData.favicon} alt="Favicon" />
//                                                                     ) : (
//                                                                         <Star size={32} />
//                                                                     )}
//                                                                 </div>
//                                                                 <label className="asset-upload">
//                                                                     <Upload size={14} />
//                                                                     <span>Upload Favicon</span>
//                                                                     <input type="file" accept="image/*" />
//                                                                 </label>
//                                                             </div>

//                                                             <div className="asset-card">
//                                                                 <div className="asset-preview">
//                                                                     {formData.signature ? (
//                                                                         <img src={formData.signature} alt="Signature" />
//                                                                     ) : (
//                                                                         <FileSignature size={32} />
//                                                                     )}
//                                                                 </div>
//                                                                 <label className="asset-upload">
//                                                                     <Upload size={14} />
//                                                                     <span>Upload Signature</span>
//                                                                     <input type="file" accept="image/*" />
//                                                                 </label>
//                                                             </div>

//                                                             <div className="asset-card">
//                                                                 <div className="asset-preview">
//                                                                     {formData.stamp ? (
//                                                                         <img src={formData.stamp} alt="Stamp" />
//                                                                     ) : (
//                                                                         <Stamp size={32} />
//                                                                     )}
//                                                                 </div>
//                                                                 <label className="asset-upload">
//                                                                     <Upload size={14} />
//                                                                     <span>Upload Stamp</span>
//                                                                     <input type="file" accept="image/*" />
//                                                                 </label>
//                                                             </div>
//                                                         </div>
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
//                         onClick={saveSettings}
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
//                 .company-profile {
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

//                 /* ==================== DESKTOP TABS ==================== */
//                 .desktop-tabs {
//                     max-width: 1200px;
//                     margin: 0 auto 24px auto;
//                     padding: 0 24px;
//                     display: none;
//                     background: white;
//                     border-bottom: 2px solid #e2e8f0;
//                 }

//                 @media (min-width: 1024px) {
//                     .desktop-tabs {
//                         display: flex;
//                         padding: 0 24px;
//                         margin: 0 auto 24px auto;
//                     }
//                 }

//                 .tab-button {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     padding: 16px 12px;
//                     background: transparent;
//                     border: none;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     white-space: nowrap;
//                     font-size: 0.875rem;
//                     position: relative;
//                     border-bottom: 2px solid transparent;
//                     margin-bottom: -2px;
//                     flex: 1;
//                     min-width: 0;
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
//                     padding: 6px;
//                     border-radius: 8px;
//                     transition: all 0.2s ease;
//                     flex-shrink: 0;
//                 }

//                 .tab-title {
//                     overflow: hidden;
//                     text-overflow: ellipsis;
//                     white-space: nowrap;
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

//                 /* ==================== SECTIONS CONTAINER ==================== */
//                 .sections-container {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 16px;
//                 }

//                 .section-card {
//                     background: white;
//                     border-radius: 8px;
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
//                     border-radius: 8px;
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

//                 .form-field label {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #475569;
//                     text-transform: uppercase;
//                     letter-spacing: 0.3px;
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
//                     display: flex;
//                     align-items: center;
//                     gap: 4px;
//                 }

//                 /* ==================== SOCIAL GRID ==================== */
//                 .social-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 16px;
//                 }

//                 @media (min-width: 640px) {
//                     .social-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 /* ==================== TOGGLE ==================== */
//                 .toggle-field {
//                     margin: 12px 0;
//                 }

//                 .toggle {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     cursor: pointer;
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

//                 .toggle-label {
//                     font-size: 0.875rem;
//                     color: #334155;
//                 }

//                 /* ==================== UPI SECTION ==================== */
//                 .add-button {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     width: 100%;
//                     padding: 14px;
//                     background: #f8fafc;
//                     border: 2px dashed #3b82f6;
//                     border-radius: 8px;
//                     color: #3b82f6;
//                     font-size: 0.938rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     margin-bottom: 20px;
//                 }

//                 .add-button:hover {
//                     background: #eef2ff;
//                     border-style: solid;
//                 }

//                 .form-card {
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     margin-bottom: 20px;
//                     overflow: hidden;
//                 }

//                 .form-card-header {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     padding: 16px 20px;
//                     background: #f8fafc;
//                     border-bottom: 1px solid #e2e8f0;
//                 }

//                 .form-card-header h4 {
//                     font-size: 0.938rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0;
//                 }

//                 .close-btn {
//                     width: 32px;
//                     height: 32px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     background: white;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     color: #64748b;
//                     cursor: pointer;
//                 }

//                 .form-card-body {
//                     padding: 20px;
//                 }

//                 .form-actions {
//                     display: flex;
//                     gap: 12px;
//                     margin-top: 20px;
//                 }

//                 .btn-primary,
//                 .btn-secondary {
//                     flex: 1;
//                     padding: 12px;
//                     border-radius: 8px;
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                 }

//                 .btn-primary {
//                     background: #3b82f6;
//                     color: white;
//                     border: none;
//                 }

//                 .btn-secondary {
//                     background: white;
//                     border: 1px solid #e2e8f0;
//                     color: #334155;
//                 }

//                 /* ==================== ITEMS LIST ==================== */
//                 .items-list {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 12px;
//                     margin-bottom: 20px;
//                 }

//                 .item-card {
//                     display: flex;
//                     align-items: center;
//                     gap: 16px;
//                     padding: 16px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                 }

//                 .item-status {
//                     display: flex;
//                     align-items: center;
//                     gap: 4px;
//                     min-width: 40px;
//                 }

//                 .status-icon.active {
//                     color: #10b981;
//                 }

//                 .status-icon.inactive {
//                     color: #94a3b8;
//                 }

//                 .default-badge {
//                     font-size: 14px;
//                 }

//                 .item-details {
//                     flex: 1;
//                 }

//                 .item-title {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     margin-bottom: 4px;
//                     flex-wrap: wrap;
//                 }

//                 .item-id {
//                     font-weight: 600;
//                     font-size: 0.938rem;
//                     color: #0f172a;
//                 }

//                 .item-name {
//                     font-size: 0.75rem;
//                     color: #64748b;
//                 }

//                 .item-description {
//                     font-size: 0.688rem;
//                     color: #64748b;
//                     margin: 0 0 8px 0;
//                 }

//                 .item-badge {
//                     display: inline-block;
//                     padding: 4px 10px;
//                     border-radius: 20px;
//                     font-size: 0.625rem;
//                     font-weight: 600;
//                 }

//                 .item-actions {
//                     display: flex;
//                     gap: 6px;
//                 }

//                 .action-btn {
//                     width: 34px;
//                     height: 34px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     background: white;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     color: #64748b;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .action-btn:hover {
//                     background: #f1f5f9;
//                     border-color: #3b82f6;
//                     color: #3b82f6;
//                 }

//                 .action-btn.delete:hover {
//                     background: #fee2e2;
//                     border-color: #ef4444;
//                     color: #ef4444;
//                 }

//                 /* ==================== QR SECTION ==================== */
//                 .qr-section {
//                     margin: 20px 0;
//                 }

//                 .qr-preview {
//                     display: flex;
//                     align-items: center;
//                     gap: 24px;
//                     padding: 20px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                 }

//                 .qr-preview img {
//                     width: 120px;
//                     height: 120px;
//                     object-fit: contain;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     background: white;
//                 }

//                 .qr-info {
//                     flex: 1;
//                 }

//                 .qr-info p {
//                     margin: 4px 0;
//                     font-size: 0.875rem;
//                 }

//                 .qr-info .active {
//                     color: #10b981;
//                     font-weight: 600;
//                     margin-left: 4px;
//                 }

//                 .qr-info .inactive {
//                     color: #ef4444;
//                     font-weight: 600;
//                     margin-left: 4px;
//                 }

//                 .qr-actions {
//                     display: flex;
//                     gap: 8px;
//                 }

//                 .qr-action-btn {
//                     display: flex;
//                     align-items: center;
//                     gap: 4px;
//                     padding: 8px 12px;
//                     background: white;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     font-size: 0.75rem;
//                     cursor: pointer;
//                 }

//                 .qr-action-btn.delete {
//                     color: #ef4444;
//                 }

//                 .add-qr-btn {
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     gap: 8px;
//                     width: 100%;
//                     padding: 40px;
//                     background: #f8fafc;
//                     border: 2px dashed #3b82f6;
//                     border-radius: 8px;
//                     color: #3b82f6;
//                     cursor: pointer;
//                 }

//                 .add-qr-btn small {
//                     color: #64748b;
//                 }

//                 /* ==================== MODAL ==================== */
//                 .modal-overlay {
//                     position: fixed;
//                     top: 0;
//                     left: 0;
//                     right: 0;
//                     bottom: 0;
//                     background: rgba(0, 0, 0, 0.5);
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     z-index: 1000;
//                     padding: 16px;
//                 }

//                 .modal-content {
//                     background: white;
//                     border-radius: 12px;
//                     max-width: 500px;
//                     width: 100%;
//                     max-height: 90vh;
//                     overflow-y: auto;
//                 }

//                 .modal-header {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     padding: 16px 20px;
//                     border-bottom: 1px solid #e2e8f0;
//                 }

//                 .modal-header h4 {
//                     font-size: 1rem;
//                     font-weight: 600;
//                     margin: 0;
//                 }

//                 .modal-body {
//                     padding: 20px;
//                 }

//                 .file-upload {
//                     margin-bottom: 16px;
//                 }

//                 .file-upload input {
//                     display: none;
//                 }

//                 .file-label {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     padding: 12px;
//                     background: #f8fafc;
//                     border: 2px dashed #3b82f6;
//                     border-radius: 8px;
//                     color: #3b82f6;
//                     cursor: pointer;
//                 }

//                 .upload-preview {
//                     margin-top: 16px;
//                     text-align: center;
//                 }

//                 .upload-preview img {
//                     max-width: 200px;
//                     max-height: 200px;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                 }

//                 /* ==================== PAYMENT SETTINGS ==================== */
//                 .settings-toggle {
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                     width: 100%;
//                     padding: 12px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     cursor: pointer;
//                 }

//                 .settings-toggle .chevron {
//                     transition: transform 0.3s ease;
//                 }

//                 .settings-toggle .chevron.expanded {
//                     transform: rotate(90deg);
//                 }

//                 .payment-settings {
//                     padding: 20px;
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     margin-top: 12px;
//                 }

//                 /* ==================== EMPTY STATE ==================== */
//                 .empty-state {
//                     text-align: center;
//                     padding: 48px 24px;
//                     background: #f8fafc;
//                     border-radius: 8px;
//                 }

//                 .empty-state svg {
//                     color: #94a3b8;
//                     margin-bottom: 16px;
//                 }

//                 .empty-state h4 {
//                     font-size: 0.938rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0 0 4px 0;
//                 }

//                 .empty-state p {
//                     font-size: 0.813rem;
//                     color: #64748b;
//                     margin: 0;
//                 }

//                 /* ==================== INFO BOX ==================== */
//                 .info-box {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     padding: 16px;
//                     background: #eef2ff;
//                     border: 1px solid #c7d2fe;
//                     border-radius: 8px;
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

//                 /* ==================== COLORS ==================== */
//                 .colors-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 16px;
//                     margin-bottom: 20px;
//                 }

//                 @media (min-width: 640px) {
//                     .colors-grid {
//                         grid-template-columns: repeat(3, 1fr);
//                     }
//                 }

//                 .color-field label {
//                     display: block;
//                     font-size: 0.688rem;
//                     font-weight: 500;
//                     color: #475569;
//                     margin-bottom: 6px;
//                     text-transform: uppercase;
//                     letter-spacing: 0.3px;
//                 }

//                 .color-input {
//                     display: flex;
//                     gap: 8px;
//                 }

//                 .color-input input[type="color"] {
//                     width: 42px;
//                     height: 42px;
//                     padding: 2px;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     cursor: pointer;
//                 }

//                 .color-input input[type="text"] {
//                     flex: 1;
//                     padding: 10px;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     font-size: 0.813rem;
//                     font-family: monospace;
//                 }

//                 .color-preview {
//                     margin-top: 16px;
//                 }

//                 .preview-bar {
//                     display: flex;
//                     height: 40px;
//                     border-radius: 8px;
//                     overflow: hidden;
//                 }

//                 .preview-segment {
//                     flex: 1;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     color: white;
//                     font-size: 0.625rem;
//                     font-weight: 600;
//                     text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
//                 }

//                 /* ==================== ASSETS ==================== */
//                 .assets-grid {
//                     display: grid;
//                     grid-template-columns: repeat(2, 1fr);
//                     gap: 16px;
//                 }

//                 @media (min-width: 640px) {
//                     .assets-grid {
//                         grid-template-columns: repeat(4, 1fr);
//                     }
//                 }

//                 .asset-card {
//                     background: #f8fafc;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     padding: 20px;
//                     text-align: center;
//                 }

//                 .asset-preview {
//                     height: 80px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     margin-bottom: 12px;
//                 }

//                 .asset-preview img {
//                     max-width: 100%;
//                     max-height: 100%;
//                     object-fit: contain;
//                 }

//                 .asset-preview svg {
//                     color: #94a3b8;
//                 }

//                 .asset-upload {
//                     display: inline-flex;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 8px 12px;
//                     background: white;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 30px;
//                     font-size: 0.688rem;
//                     color: #475569;
//                     cursor: pointer;
//                     position: relative;
//                 }

//                 .asset-upload input {
//                     position: absolute;
//                     top: 0;
//                     left: 0;
//                     width: 100%;
//                     height: 100%;
//                     opacity: 0;
//                     cursor: pointer;
//                 }

//                 /* ==================== HOURS ==================== */
//                 .hours-list {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 12px;
//                 }

//                 .hours-item {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 4px;
//                 }

//                 @media (min-width: 640px) {
//                     .hours-item {
//                         flex-direction: row;
//                         align-items: center;
//                         gap: 16px;
//                     }
//                 }

//                 .day-label {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #475569;
//                     text-transform: capitalize;
//                     min-width: 100px;
//                 }

//                 .hours-item input {
//                     flex: 1;
//                     padding: 10px 12px;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     font-size: 0.875rem;
//                 }

//                 /* ==================== RADIO GROUP ==================== */
//                 .radio-group {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 16px;
//                     margin-top: 8px;
//                     margin-bottom: 16px;
//                 }

//                 .radio-label {
//                     display: flex;
//                     align-items: flex-start;
//                     gap: 16px;
//                     padding: 20px;
//                     background: #f8fafc;
//                     border: 2px solid #e2e8f0;
//                     border-radius: 12px;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     position: relative;
//                 }

//                 .radio-label:hover {
//                     background: #f1f5f9;
//                     border-color: #94a3b8;
//                 }

//                 .radio-label.selected {
//                     background: #eff6ff;
//                     border-color: #3b82f6;
//                     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//                 }

//                 .radio-label input[type="radio"] {
//                     margin-top: 4px;
//                     width: 20px;
//                     height: 20px;
//                     cursor: pointer;
//                     accent-color: #3b82f6;
//                     flex-shrink: 0;
//                 }

//                 .radio-content {
//                     flex: 1;
//                 }

//                 .radio-header {
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                     margin-bottom: 8px;
//                 }

//                 .radio-header strong {
//                     font-size: 1rem;
//                     color: #0f172a;
//                 }

//                 .active-badge {
//                     background: #3b82f6;
//                     color: white;
//                     padding: 4px 12px;
//                     border-radius: 30px;
//                     font-size: 0.688rem;
//                     font-weight: 600;
//                 }

//                 .radio-description {
//                     margin: 0 0 12px 0;
//                     color: #475569;
//                     font-size: 0.875rem;
//                     line-height: 1.6;
//                 }

//                 .flow-preview {
//                     background: #ffffff;
//                     padding: 12px;
//                     border-radius: 8px;
//                     border: 1px solid #e2e8f0;
//                 }

//                 .preview-label {
//                     display: block;
//                     font-size: 0.688rem;
//                     color: #64748b;
//                     margin-bottom: 4px;
//                     text-transform: uppercase;
//                     letter-spacing: 0.5px;
//                 }

//                 .flow-preview code {
//                     font-size: 0.75rem;
//                     color: #3b82f6;
//                     background: #eff6ff;
//                     padding: 4px 8px;
//                     border-radius: 4px;
//                     display: inline-block;
//                     white-space: normal;
//                     word-break: break-word;
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
//                         display: none;
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

//                     .item-card {
//                         flex-wrap: wrap;
//                     }

//                     .item-actions {
//                         width: 100%;
//                         justify-content: flex-end;
//                     }

//                     .form-actions {
//                         flex-direction: column;
//                     }

//                     .assets-grid {
//                         grid-template-columns: 1fr;
//                     }

//                     .qr-preview {
//                         flex-direction: column;
//                         text-align: center;
//                     }

//                     .qr-actions {
//                         flex-wrap: wrap;
//                         justify-content: center;
//                     }

//                     .radio-label {
//                         flex-direction: column;
//                         gap: 12px;
//                     }

//                     .radio-label input[type="radio"] {
//                         align-self: flex-start;
//                     }

//                     .radio-header {
//                         flex-direction: column;
//                         align-items: flex-start;
//                         gap: 8px;
//                     }

//                     .flow-preview code {
//                         white-space: normal;
//                         word-break: break-word;
//                     }
//                 }

//                 @media (max-width: 480px) {
//                     .main-content {
//                         padding: 16px 16px 90px 16px;
//                     }

//                     .stats-grid {
//                         display: none;
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

//                     .hours-item {
//                         gap: 8px;
//                     }

//                     .hours-item input {
//                         padding: 8px 10px;
//                     }

//                     .item-title {
//                         flex-direction: column;
//                         align-items: flex-start;
//                     }

//                     .item-actions {
//                         flex-wrap: wrap;
//                     }

//                     .action-btn {
//                         width: 40px;
//                         height: 40px;
//                     }
//                 }
//             `}</style>
//         </>
//     );
// }

















// app/admin/company/settings/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import {
    Building2, Mail, Phone, MapPin, CreditCard, Landmark,
    Receipt, HeadphonesIcon, Palette, Save, X, Plus,
    Trash2, Edit2, Check, AlertCircle, Loader2, Globe,
    Facebook, Instagram, Twitter, Youtube, Upload, Image as ImageIcon,
    ChevronRight, Settings, Shield, DollarSign, Clock, Link2, Users,
    Briefcase, FileText, Eye, EyeOff, Star, Heart, Gift, Award,
    Bell, ShieldCheck, Zap, TrendingUp, Activity, Package, Truck,
    RotateCcw, HelpCircle, MessageCircle, PhoneCall, MailOpen,
    MapPinHouse, Building, Store, Globe2, Linkedin, TwitterIcon,
    FileSignature, Stamp, Palette as PaletteIcon, Brush, Sparkles,
    CheckCircle, AlertTriangle, Info, XCircle, Menu, Home,
    Settings2, User, LogOut, ChevronLeft, Search, Filter,
    MoreVertical, Copy, Download, Printer, Share2, Bookmark,
    ThumbsUp, ThumbsDown, MessageSquare, Send, Camera, Video,
    Mic, Paperclip, Smile, Calendar as CalendarIcon, ArrowLeft,
    ArrowRight, Grid, List, RefreshCw, Filter as FilterIcon,
    Layout, Layers, Box, Database, Shield as ShieldIcon,
    Key, Lock, Unlock, Hash, AtSign, Link, Link2 as LinkIcon,
    Wifi, WifiOff, Battery, BatteryCharging, Cpu, HardDrive,
    Server, Cloud, CloudOff, Download as DownloadIcon, Upload as UploadIcon,
    Repeat, Shuffle, Play, Pause, Square, Circle, Triangle,
    Hexagon, Octagon, Diamond, Gem, Crown, Sparkle,
    Route, QrCode, Smartphone, CreditCard as CardIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
const SECTIONS = [
    { 
        id: 'basic', 
        title: 'Basic Information', 
        icon: Building2, 
        color: '#3b82f6',
        description: 'Company details and contact information'
    },
    { 
        id: 'payment_methods', 
        title: 'Payment Methods', 
        icon: CreditCard, 
        color: '#8b5cf6',
        description: 'UPI IDs, GPay, PhonePe, PayTM, QR codes, and bank accounts'
    },
    { 
        id: 'bank', 
        title: 'Bank Account Details', 
        icon: Landmark, 
        color: '#ec4899',
        description: 'Bank information for invoice and payment references'
    },
    { 
        id: 'invoice', 
        title: 'Invoice Settings', 
        icon: Receipt, 
        color: '#f59e0b',
        description: 'Configure invoice formatting and business policies'
    },
    { 
        id: 'support', 
        title: 'Customer Support', 
        icon: HeadphonesIcon, 
        color: '#10b981',
        description: 'Configure support channels and availability'
    },
    { 
        id: 'order_flow', 
        title: 'Order Flow Configuration', 
        icon: Route, 
        color: '#6366f1',
        description: 'WhatsApp bot order collection settings'
    },
    { 
        id: 'branding', 
        title: 'Branding & Theme', 
        icon: Palette, 
        color: '#f43f5e',
        description: 'Customize your brand identity and visual appearance'
    }
];

const UPI_APPS = [
    { value: 'gpay', label: 'Google Pay', color: '#4285F4', icon: '💚' },
    { value: 'phonepe', label: 'PhonePe', color: '#5F259F', icon: '🟣' },
    { value: 'paytm', label: 'Paytm', color: '#00BAF2', icon: '🔵' },
    { value: 'bhim', label: 'BHIM', color: '#DD4B39', icon: '🔴' },
    { value: 'amazonpay', label: 'Amazon Pay', color: '#FF9900', icon: '🟠' },
    { value: 'other', label: 'Other', color: '#6B7280', icon: '⚫' }
];

const PAYMENT_METHOD_TYPES = {
    upi: { label: 'UPI ID', icon: CreditCard, color: '#8b5cf6' },
    gpay: { label: 'GPay Number', icon: Smartphone, color: '#4285F4' },
    phonepe: { label: 'PhonePe Number', icon: Smartphone, color: '#5F259F' },
    paytm: { label: 'PayTM Number', icon: Smartphone, color: '#00BAF2' },
    qr: { label: 'QR Code', icon: QrCode, color: '#10b981' },
    bank: { label: 'Bank Account', icon: Landmark, color: '#ec4899' }
};

const BUSINESS_HOURS_DEFAULT = {
    monday: '9:00 AM - 8:00 PM',
    tuesday: '9:00 AM - 8:00 PM',
    wednesday: '9:00 AM - 8:00 PM',
    thursday: '9:00 AM - 8:00 PM',
    friday: '9:00 AM - 8:00 PM',
    saturday: '9:00 AM - 6:00 PM',
    sunday: 'Closed'
};

const ACCOUNT_TYPES = ['Current', 'Savings', 'Business'];

// ==================== MAIN COMPONENT ====================
export default function CompanyProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    // State management
    const [expandedSections, setExpandedSections] = useState(['basic']);
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    
    // File states for brand assets
    const [qrFile, setQrFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [stampFile, setStampFile] = useState(null);
    
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
        
        // ===== PAYMENT METHODS =====
        upiIds: [],
        gpayNumbers: [],
        phonePeNumbers: [],
        paytmNumbers: [],
        qrCode: {
            imageUrl: '',
            name: 'Payment QR Code',
            description: '',
            isActive: true
        },
        bankAccounts: [],
        
        // Payment settings
        paymentSettings: {
            preferredMethod: 'any',
            allowPartialPayments: false,
            autoVerifyEnabled: true,
            minConfidenceForAuto: 85,
            paymentTimeout: 30,
            requireTransactionId: true,
            allowMultiplePaymentMethods: true,
            displayOrder: ['upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank'],
            autoVerifyThresholds: {
                amountTolerance: 2,
                timeWindow: 15,
                minConfidencePerField: {
                    amount: 80,
                    upi: 80,
                    transactionId: 70
                }
            }
        },
        
        // Order flow mode
        orderFlowMode: 'long',
        
        // Legacy bank
        bank: {
            name: '',
            account: '',
            ifsc: '',
            branch: '',
            accountType: 'Current Account'
        },
        
        // Invoice settings
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
        
        // Support settings
        support: {
            email: '',
            phone: '',
            hours: 'Mon-Sat, 10:00 AM - 7:00 PM',
            whatsapp: '',
            responseTime: 'Within 30 minutes'
        },
        
        // Social media
        social: {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: '',
            linkedin: ''
        },
        
        // Business hours
        businessHours: { ...BUSINESS_HOURS_DEFAULT },
        
        // Branding
        logo: null,
        favicon: null,
        signature: null,
        stamp: null,
        
        // Theme
        theme: {
            primary: '#2563eb',
            secondary: '#4f46e5',
            accent: '#0d9488'
        }
    });

    // ===== UPI Form State =====
    const [upiForm, setUpiForm] = useState({
        id: '',
        name: '',
        appType: 'other',
        isActive: true,
        description: ''
    });
    const [editingUpiIndex, setEditingUpiIndex] = useState(-1);
    const [showUpiForm, setShowUpiForm] = useState(false);

    // ===== GPay Form State =====
    const [gpayForm, setGpayForm] = useState({
        phoneNumber: '',
        name: '',
        isActive: true,
        description: ''
    });
    const [editingGpayIndex, setEditingGpayIndex] = useState(-1);
    const [showGpayForm, setShowGpayForm] = useState(false);

    // ===== PhonePe Form State =====
    const [phonePeForm, setPhonePeForm] = useState({
        phoneNumber: '',
        name: '',
        isActive: true,
        description: ''
    });
    const [editingPhonePeIndex, setEditingPhonePeIndex] = useState(-1);
    const [showPhonePeForm, setShowPhonePeForm] = useState(false);

    // ===== PayTM Form State =====
    const [paytmForm, setPaytmForm] = useState({
        phoneNumber: '',
        name: '',
        isActive: true,
        description: ''
    });
    const [editingPaytmIndex, setEditingPaytmIndex] = useState(-1);
    const [showPaytmForm, setShowPaytmForm] = useState(false);

    // ===== QR Code Form State =====
    const [qrForm, setQrForm] = useState({
        imageUrl: '',
        name: 'Payment QR Code',
        description: '',
        isActive: true
    });
    const [showQrForm, setShowQrForm] = useState(false);

    // ===== Bank Account Form State =====
    const [bankAccountForm, setBankAccountForm] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branch: '',
        accountType: 'Current',
        isActive: true,
        isDefault: false,
        description: ''
    });
    const [editingBankIndex, setEditingBankIndex] = useState(-1);
    const [showBankForm, setShowBankForm] = useState(false);

    // ===== Payment Settings Form State =====
    const [showPaymentSettings, setShowPaymentSettings] = useState(false);

    // Fetch company settings
    useEffect(() => {
        fetchSettings();
    }, []);

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // ==================== HELPER FUNCTIONS ====================
    
    const validatePhoneNumber = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 10;
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 10) {
            return `${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
        return phone;
    };

    const getAppIcon = (appType) => {
        const app = UPI_APPS.find(a => a.value === appType);
        return app?.icon || '⚫';
    };

    const getStatusIcon = (isActive) => {
        return isActive ? 
            <CheckCircle size={16} className="status-icon active" /> : 
            <XCircle size={16} className="status-icon inactive" />;
    };

    // ==================== API FUNCTIONS ====================
    
    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/company-settings', {
                headers: {
                    'Content-Type': 'application/json',
                    'x-company-id': session?.user?.companyId
                }
            });
            const data = await res.json();
            
            if (data.success) {
                setSettings(data.data);
                setFormData(prev => ({
                    ...prev,
                    ...data.data,
                    // Ensure arrays exist
                    upiIds: data.data.upiIds || [],
                    gpayNumbers: data.data.gpayNumbers || [],
                    phonePeNumbers: data.data.phonePeNumbers || [],
                    paytmNumbers: data.data.paytmNumbers || [],
                    bankAccounts: data.data.bankAccounts || [],
                    qrCode: data.data.qrCode || { 
                        imageUrl: '', 
                        name: 'Payment QR Code', 
                        description: '', 
                        isActive: true 
                    },
                    paymentSettings: {
                        ...prev.paymentSettings,
                        ...(data.data.paymentSettings || {})
                    },
                    orderFlowMode: data.data.orderFlowMode || 'long',
                    businessHours: { ...BUSINESS_HOURS_DEFAULT, ...(data.data.businessHours || {}) },
                    support: { ...prev.support, ...(data.data.support || {}) },
                    social: { ...prev.social, ...(data.data.social || {}) },
                    bank: { ...prev.bank, ...(data.data.bank || {}) },
                    invoiceSettings: { ...prev.invoiceSettings, ...(data.data.invoiceSettings || {}) },
                    theme: { ...prev.theme, ...(data.data.theme || {}) }
                }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showToast('error', 'Failed to load company settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!validateForm()) return;
        
        setSaving(true);
        setErrors({});
        
        try {
            // Check if we have any files to upload
            const hasFiles = qrFile || logoFile || faviconFile || signatureFile || stampFile;
            
            if (hasFiles) {
                const formDataToSend = new FormData();
                
                // Append all form data (stringify objects)
                Object.keys(formData).forEach(key => {
                    if (['logo', 'favicon', 'signature', 'stamp', 'qrCode'].includes(key)) return;
                    if (typeof formData[key] === 'object') {
                        formDataToSend.append(key, JSON.stringify(formData[key]));
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                });
                
                // Append files
                if (qrFile) formDataToSend.append('qrCode', qrFile);
                if (logoFile) formDataToSend.append('logo', logoFile);
                if (faviconFile) formDataToSend.append('favicon', faviconFile);
                if (signatureFile) formDataToSend.append('signature', signatureFile);
                if (stampFile) formDataToSend.append('stamp', stampFile);
                
                const res = await fetch('/api/company-settings', {
                    method: 'PUT',
                    headers: {
                        'x-company-id': session?.user?.companyId
                    },
                    body: formDataToSend
                });
                
                const data = await res.json();
                
                if (data.success) {
                    setSettings(data.data);
                    // Clear file states
                    setQrFile(null);
                    setLogoFile(null);
                    setFaviconFile(null);
                    setSignatureFile(null);
                    setStampFile(null);
                    showToast('success', 'Settings saved successfully!');
                } else {
                    showToast('error', data.error || 'Failed to save settings');
                }
            } else {
                // Regular JSON request
                const res = await fetch('/api/company-settings', {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-company-id': session?.user?.companyId
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await res.json();
                
                if (data.success) {
                    setSettings(data.data);
                    showToast('success', 'Settings saved successfully!');
                } else {
                    showToast('error', data.error || 'Failed to save settings');
                }
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
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
        
        // Validate orderFlowMode
        if (formData.orderFlowMode && !['long', 'short'].includes(formData.orderFlowMode)) {
            newErrors.orderFlowMode = 'Order flow mode must be either "long" or "short"';
        }
        
        // Validate payment settings
        if (formData.paymentSettings) {
            if (formData.paymentSettings.minConfidenceForAuto && 
                (formData.paymentSettings.minConfidenceForAuto < 50 || 
                 formData.paymentSettings.minConfidenceForAuto > 100)) {
                newErrors.minConfidence = 'Confidence threshold must be between 50 and 100';
            }
            if (formData.paymentSettings.paymentTimeout && 
                (formData.paymentSettings.paymentTimeout < 5 || 
                 formData.paymentSettings.paymentTimeout > 60)) {
                newErrors.paymentTimeout = 'Payment timeout must be between 5 and 60 minutes';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ==================== UPI FUNCTIONS ====================
    
    const validateUpiForm = () => {
        if (!upiForm.id.trim()) {
            showToast('error', 'UPI ID is required');
            return false;
        }
        if (!upiForm.id.includes('@')) {
            showToast('error', 'UPI ID must include @ (e.g., name@oksbi)');
            return false;
        }
        if (!upiForm.name.trim()) {
            showToast('error', 'Display name is required');
            return false;
        }
        
        const exists = formData.upiIds.some((upi, index) => 
            upi.id.toLowerCase() === upiForm.id.toLowerCase() && index !== editingUpiIndex
        );
        
        if (exists) {
            showToast('error', 'This UPI ID already exists');
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
            description: upiForm.description,
            createdAt: new Date().toISOString()
        };
        
        if (editingUpiIndex >= 0) {
            const updated = [...formData.upiIds];
            updated[editingUpiIndex] = newUpi;
            setFormData({ ...formData, upiIds: updated });
            showToast('success', 'UPI ID updated successfully');
        } else {
            setFormData({ ...formData, upiIds: [...formData.upiIds, newUpi] });
            showToast('success', 'UPI ID added successfully');
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
        const updated = formData.upiIds.filter((_, i) => i !== index);
        setFormData({ ...formData, upiIds: updated });
        showToast('success', 'UPI ID deleted successfully');
    };

    const toggleUpiStatus = (index) => {
        const updated = [...formData.upiIds];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, upiIds: updated });
        showToast('success', `UPI ID ${updated[index].isActive ? 'activated' : 'deactivated'}`);
    };

    // ==================== GPAY FUNCTIONS ====================
    
    const validateGpayForm = () => {
        if (!gpayForm.phoneNumber.trim()) {
            showToast('error', 'Phone number is required');
            return false;
        }
        if (!validatePhoneNumber(gpayForm.phoneNumber)) {
            showToast('error', 'Phone number must be exactly 10 digits');
            return false;
        }
        if (!gpayForm.name.trim()) {
            showToast('error', 'Display name is required');
            return false;
        }
        
        const digits = gpayForm.phoneNumber.replace(/\D/g, '');
        const exists = formData.gpayNumbers.some((g, index) => 
            g.phoneNumber.replace(/\D/g, '') === digits && index !== editingGpayIndex
        );
        
        if (exists) {
            showToast('error', 'This GPay number already exists');
            return false;
        }
        
        return true;
    };

    const addGpayNumber = () => {
        if (!validateGpayForm()) return;
        
        const digits = gpayForm.phoneNumber.replace(/\D/g, '');
        const newGpay = {
            phoneNumber: digits,
            name: gpayForm.name,
            upiId: `${digits}@okhdfcbank`,
            isActive: gpayForm.isActive,
            description: gpayForm.description,
            createdAt: new Date().toISOString()
        };
        
        if (editingGpayIndex >= 0) {
            const updated = [...formData.gpayNumbers];
            updated[editingGpayIndex] = newGpay;
            setFormData({ ...formData, gpayNumbers: updated });
            showToast('success', 'GPay number updated successfully');
        } else {
            setFormData({ ...formData, gpayNumbers: [...formData.gpayNumbers, newGpay] });
            showToast('success', 'GPay number added successfully');
        }
        
        setGpayForm({ phoneNumber: '', name: '', isActive: true, description: '' });
        setEditingGpayIndex(-1);
        setShowGpayForm(false);
    };

    const editGpay = (index) => {
        const gpay = formData.gpayNumbers[index];
        setGpayForm({
            phoneNumber: gpay.phoneNumber,
            name: gpay.name,
            isActive: gpay.isActive !== false,
            description: gpay.description || ''
        });
        setEditingGpayIndex(index);
        setShowGpayForm(true);
    };

    const deleteGpay = (index) => {
        const updated = formData.gpayNumbers.filter((_, i) => i !== index);
        setFormData({ ...formData, gpayNumbers: updated });
        showToast('success', 'GPay number deleted successfully');
    };

    const toggleGpayStatus = (index) => {
        const updated = [...formData.gpayNumbers];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, gpayNumbers: updated });
        showToast('success', `GPay number ${updated[index].isActive ? 'activated' : 'deactivated'}`);
    };

    // ==================== PHONEPE FUNCTIONS ====================
    
    const validatePhonePeForm = () => {
        if (!phonePeForm.phoneNumber.trim()) {
            showToast('error', 'Phone number is required');
            return false;
        }
        if (!validatePhoneNumber(phonePeForm.phoneNumber)) {
            showToast('error', 'Phone number must be exactly 10 digits');
            return false;
        }
        if (!phonePeForm.name.trim()) {
            showToast('error', 'Display name is required');
            return false;
        }
        
        const digits = phonePeForm.phoneNumber.replace(/\D/g, '');
        const exists = formData.phonePeNumbers.some((p, index) => 
            p.phoneNumber.replace(/\D/g, '') === digits && index !== editingPhonePeIndex
        );
        
        if (exists) {
            showToast('error', 'This PhonePe number already exists');
            return false;
        }
        
        return true;
    };

    const addPhonePeNumber = () => {
        if (!validatePhonePeForm()) return;
        
        const digits = phonePeForm.phoneNumber.replace(/\D/g, '');
        const newPhonePe = {
            phoneNumber: digits,
            name: phonePeForm.name,
            upiId: `${digits}@ybl`,
            isActive: phonePeForm.isActive,
            description: phonePeForm.description,
            createdAt: new Date().toISOString()
        };
        
        if (editingPhonePeIndex >= 0) {
            const updated = [...formData.phonePeNumbers];
            updated[editingPhonePeIndex] = newPhonePe;
            setFormData({ ...formData, phonePeNumbers: updated });
            showToast('success', 'PhonePe number updated successfully');
        } else {
            setFormData({ ...formData, phonePeNumbers: [...formData.phonePeNumbers, newPhonePe] });
            showToast('success', 'PhonePe number added successfully');
        }
        
        setPhonePeForm({ phoneNumber: '', name: '', isActive: true, description: '' });
        setEditingPhonePeIndex(-1);
        setShowPhonePeForm(false);
    };

    const editPhonePe = (index) => {
        const phonepe = formData.phonePeNumbers[index];
        setPhonePeForm({
            phoneNumber: phonepe.phoneNumber,
            name: phonepe.name,
            isActive: phonepe.isActive !== false,
            description: phonepe.description || ''
        });
        setEditingPhonePeIndex(index);
        setShowPhonePeForm(true);
    };

    const deletePhonePe = (index) => {
        const updated = formData.phonePeNumbers.filter((_, i) => i !== index);
        setFormData({ ...formData, phonePeNumbers: updated });
        showToast('success', 'PhonePe number deleted successfully');
    };

    const togglePhonePeStatus = (index) => {
        const updated = [...formData.phonePeNumbers];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, phonePeNumbers: updated });
        showToast('success', `PhonePe number ${updated[index].isActive ? 'activated' : 'deactivated'}`);
    };

    // ==================== PAYTM FUNCTIONS ====================
    
    const validatePaytmForm = () => {
        if (!paytmForm.phoneNumber.trim()) {
            showToast('error', 'Phone number is required');
            return false;
        }
        if (!validatePhoneNumber(paytmForm.phoneNumber)) {
            showToast('error', 'Phone number must be exactly 10 digits');
            return false;
        }
        if (!paytmForm.name.trim()) {
            showToast('error', 'Display name is required');
            return false;
        }
        
        const digits = paytmForm.phoneNumber.replace(/\D/g, '');
        const exists = formData.paytmNumbers.some((p, index) => 
            p.phoneNumber.replace(/\D/g, '') === digits && index !== editingPaytmIndex
        );
        
        if (exists) {
            showToast('error', 'This PayTM number already exists');
            return false;
        }
        
        return true;
    };

    const addPaytmNumber = () => {
        if (!validatePaytmForm()) return;
        
        const digits = paytmForm.phoneNumber.replace(/\D/g, '');
        const newPaytm = {
            phoneNumber: digits,
            name: paytmForm.name,
            upiId: `${digits}@paytm`,
            isActive: paytmForm.isActive,
            description: paytmForm.description,
            createdAt: new Date().toISOString()
        };
        
        if (editingPaytmIndex >= 0) {
            const updated = [...formData.paytmNumbers];
            updated[editingPaytmIndex] = newPaytm;
            setFormData({ ...formData, paytmNumbers: updated });
            showToast('success', 'PayTM number updated successfully');
        } else {
            setFormData({ ...formData, paytmNumbers: [...formData.paytmNumbers, newPaytm] });
            showToast('success', 'PayTM number added successfully');
        }
        
        setPaytmForm({ phoneNumber: '', name: '', isActive: true, description: '' });
        setEditingPaytmIndex(-1);
        setShowPaytmForm(false);
    };

    const editPaytm = (index) => {
        const paytm = formData.paytmNumbers[index];
        setPaytmForm({
            phoneNumber: paytm.phoneNumber,
            name: paytm.name,
            isActive: paytm.isActive !== false,
            description: paytm.description || ''
        });
        setEditingPaytmIndex(index);
        setShowPaytmForm(true);
    };

    const deletePaytm = (index) => {
        const updated = formData.paytmNumbers.filter((_, i) => i !== index);
        setFormData({ ...formData, paytmNumbers: updated });
        showToast('success', 'PayTM number deleted successfully');
    };

    const togglePaytmStatus = (index) => {
        const updated = [...formData.paytmNumbers];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, paytmNumbers: updated });
        showToast('success', `PayTM number ${updated[index].isActive ? 'activated' : 'deactivated'}`);
    };

    // ==================== QR CODE FUNCTIONS ====================
    
    const handleQrFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setQrFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrForm({ ...qrForm, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const saveQrCode = () => {
        setFormData({ ...formData, qrCode: { ...qrForm } });
        setShowQrForm(false);
        showToast('success', 'QR code updated successfully');
    };

    const toggleQrStatus = () => {
        setFormData({
            ...formData,
            qrCode: { ...formData.qrCode, isActive: !formData.qrCode?.isActive }
        });
        showToast('success', `QR code ${!formData.qrCode?.isActive ? 'activated' : 'deactivated'}`);
    };

    const deleteQrCode = () => {
        if (confirm('Are you sure you want to delete the QR code?')) {
            setFormData({
                ...formData,
                qrCode: { imageUrl: '', name: 'Payment QR Code', description: '', isActive: false }
            });
            setQrFile(null);
            showToast('success', 'QR code deleted successfully');
        }
    };

    // ==================== BANK ACCOUNT FUNCTIONS ====================
    
    const validateBankAccountForm = () => {
        if (!bankAccountForm.accountName.trim()) {
            showToast('error', 'Account holder name is required');
            return false;
        }
        if (!bankAccountForm.accountNumber.trim()) {
            showToast('error', 'Account number is required');
            return false;
        }
        if (!bankAccountForm.bankName.trim()) {
            showToast('error', 'Bank name is required');
            return false;
        }
        if (!bankAccountForm.ifscCode.trim()) {
            showToast('error', 'IFSC code is required');
            return false;
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankAccountForm.ifscCode)) {
            showToast('error', 'Invalid IFSC code format');
            return false;
        }
        return true;
    };

    const addBankAccount = () => {
        if (!validateBankAccountForm()) return;
        
        const newBank = {
            ...bankAccountForm,
            createdAt: new Date().toISOString()
        };
        
        if (editingBankIndex >= 0) {
            const updated = [...formData.bankAccounts];
            updated[editingBankIndex] = newBank;
            setFormData({ ...formData, bankAccounts: updated });
            showToast('success', 'Bank account updated successfully');
        } else {
            // If this is default, unset others
            if (newBank.isDefault) {
                const updatedAccounts = formData.bankAccounts.map(acc => ({
                    ...acc,
                    isDefault: false
                }));
                setFormData({ 
                    ...formData, 
                    bankAccounts: [...updatedAccounts, newBank] 
                });
            } else {
                setFormData({ 
                    ...formData, 
                    bankAccounts: [...formData.bankAccounts, newBank] 
                });
            }
            showToast('success', 'Bank account added successfully');
        }
        
        setBankAccountForm({
            accountName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            branch: '',
            accountType: 'Current',
            isActive: true,
            isDefault: false,
            description: ''
        });
        setEditingBankIndex(-1);
        setShowBankForm(false);
    };

    const editBankAccount = (index) => {
        const bank = formData.bankAccounts[index];
        setBankAccountForm({
            accountName: bank.accountName,
            accountNumber: bank.accountNumber,
            bankName: bank.bankName,
            ifscCode: bank.ifscCode,
            branch: bank.branch || '',
            accountType: bank.accountType || 'Current',
            isActive: bank.isActive !== false,
            isDefault: bank.isDefault || false,
            description: bank.description || ''
        });
        setEditingBankIndex(index);
        setShowBankForm(true);
    };

    const deleteBankAccount = (index) => {
        const bank = formData.bankAccounts[index];
        if (bank.isDefault) {
            showToast('error', 'Cannot delete default bank account');
            return;
        }
        const updated = formData.bankAccounts.filter((_, i) => i !== index);
        setFormData({ ...formData, bankAccounts: updated });
        showToast('success', 'Bank account deleted successfully');
    };

    const toggleBankStatus = (index) => {
        const updated = [...formData.bankAccounts];
        updated[index].isActive = !updated[index].isActive;
        setFormData({ ...formData, bankAccounts: updated });
        showToast('success', `Bank account ${updated[index].isActive ? 'activated' : 'deactivated'}`);
    };

    const setDefaultBank = (index) => {
        const updated = formData.bankAccounts.map((acc, i) => ({
            ...acc,
            isDefault: i === index
        }));
        setFormData({ ...formData, bankAccounts: updated });
        showToast('success', 'Default bank account updated');
    };

    // ==================== BRAND ASSET FUNCTIONS ====================
    
    const handleAssetUpload = (type, e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Set file state based on type
        switch(type) {
            case 'logo':
                setLogoFile(file);
                break;
            case 'favicon':
                setFaviconFile(file);
                break;
            case 'signature':
                setSignatureFile(file);
                break;
            case 'stamp':
                setStampFile(file);
                break;
        }
        
        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                [type]: reader.result
            }));
        };
        reader.readAsDataURL(file);
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

    const handlePaymentSettingsChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            paymentSettings: {
                ...prev.paymentSettings,
                [field]: value
            }
        }));
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
        setExpandedSections(SECTIONS.map(s => s.id));
    };

    const collapseAll = () => {
        setExpandedSections([]);
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
                <p className="loading-text">Loading company settings...</p>
                <style jsx>{`
                    .loading-container {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #f1f5f9;
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
                        border-radius: 8px;
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
                <title>Company Profile | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Manage your company information and settings" />
            </Head>

            <div className="company-profile">
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
                                <Building2 size={28} className="title-icon" />
                                Company Profile
                            </h1>
                            <p className="page-description">
                                Manage all your company information in one place
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
                                onClick={saveSettings}
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

                {/* Desktop Horizontal Tabs */}
                <div className="desktop-tabs">
                    {SECTIONS.map(section => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                className={`tab-button ${activeTab === section.id ? 'active' : ''}`}
                                onClick={() => handleTabClick(section.id)}
                            >
                                <div className="tab-icon" style={{ 
                                    backgroundColor: activeTab === section.id ? `${section.color}20` : 'transparent',
                                    color: activeTab === section.id ? section.color : '#64748b'
                                }}>
                                    <Icon size={20} />
                                </div>
                                <span className="tab-title" style={{
                                    color: activeTab === section.id ? '#0f172a' : '#64748b',
                                    fontWeight: activeTab === section.id ? '600' : '500'
                                }}>{section.title}</span>
                                {activeTab === section.id && (
                                    <div className="active-indicator" style={{ backgroundColor: section.color }}></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <main className="main-content">
                    {/* Sections */}
                    <div className="sections-container">
                        {SECTIONS.map(section => {
                            const Icon = section.icon;
                            const isExpanded = expandedSections.includes(section.id);
                            
                            return (
                                <div key={section.id} className={`section-card ${activeTab === section.id ? 'active' : ''}`}>
                                    {/* Section Header */}
                                    <div 
                                        className="section-header"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <div className="section-header-left">
                                            <div 
                                                className="section-icon"
                                                style={{ background: `${section.color}15`, color: section.color }}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div className="section-title">
                                                <h2>{section.title}</h2>
                                                <p>{section.description}</p>
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
                                            {/* Basic Info Section */}
                                            {section.id === 'basic' && (
                                                <>
                                                    {/* Company Details */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Building size={16} />
                                                            Company Details
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Company Name <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="companyName"
                                                                    value={formData.companyName}
                                                                    onChange={handleInputChange}
                                                                    className={errors.companyName ? 'error' : ''}
                                                                    placeholder="Enter company name"
                                                                />
                                                                {errors.companyName && <span className="error-text">{errors.companyName}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Legal Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="legalName"
                                                                    value={formData.legalName}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Enter registered legal name"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Tagline</label>
                                                                <input
                                                                    type="text"
                                                                    name="tagline"
                                                                    value={formData.tagline}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Brief company description"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Contact Information */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Phone size={16} />
                                                            Contact Information
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Phone <span className="required">*</span></label>
                                                                <input
                                                                    type="tel"
                                                                    name="phone"
                                                                    value={formData.phone}
                                                                    onChange={handleInputChange}
                                                                    className={errors.phone ? 'error' : ''}
                                                                    placeholder="+91 98765 43210"
                                                                />
                                                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Email <span className="required">*</span></label>
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    value={formData.email}
                                                                    onChange={handleInputChange}
                                                                    className={errors.email ? 'error' : ''}
                                                                    placeholder="company@example.com"
                                                                />
                                                                {errors.email && <span className="error-text">{errors.email}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Website</label>
                                                                <input
                                                                    type="url"
                                                                    name="website"
                                                                    value={formData.website}
                                                                    onChange={handleInputChange}
                                                                    placeholder="https://www.example.com"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Address */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <MapPin size={16} />
                                                            Address
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Street Address <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="address"
                                                                    value={formData.address}
                                                                    onChange={handleInputChange}
                                                                    className={errors.address ? 'error' : ''}
                                                                    placeholder="Street address, building, area"
                                                                />
                                                                {errors.address && <span className="error-text">{errors.address}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>City <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="city"
                                                                    value={formData.city}
                                                                    onChange={handleInputChange}
                                                                    className={errors.city ? 'error' : ''}
                                                                    placeholder="City"
                                                                />
                                                                {errors.city && <span className="error-text">{errors.city}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>State</label>
                                                                <input
                                                                    type="text"
                                                                    name="state"
                                                                    value={formData.state}
                                                                    onChange={handleInputChange}
                                                                    placeholder="State"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Pincode</label>
                                                                <input
                                                                    type="text"
                                                                    name="pincode"
                                                                    value={formData.pincode}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Pincode"
                                                                    maxLength="6"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Country</label>
                                                                <input
                                                                    type="text"
                                                                    name="country"
                                                                    value={formData.country}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Country"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tax & Legal */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <FileText size={16} />
                                                            Tax & Legal Information
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>GSTIN</label>
                                                                <input
                                                                    type="text"
                                                                    name="gstin"
                                                                    value={formData.gstin}
                                                                    onChange={handleInputChange}
                                                                    className={errors.gstin ? 'error' : ''}
                                                                    placeholder="27ABCDE1234F1Z5"
                                                                    maxLength="15"
                                                                />
                                                                {errors.gstin && <span className="error-text">{errors.gstin}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>PAN</label>
                                                                <input
                                                                    type="text"
                                                                    name="pan"
                                                                    value={formData.pan}
                                                                    onChange={handleInputChange}
                                                                    className={errors.pan ? 'error' : ''}
                                                                    placeholder="ABCDE1234F"
                                                                    maxLength="10"
                                                                />
                                                                {errors.pan && <span className="error-text">{errors.pan}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>CIN</label>
                                                                <input
                                                                    type="text"
                                                                    name="cin"
                                                                    value={formData.cin}
                                                                    onChange={handleInputChange}
                                                                    placeholder="U12345MH2023PTC123456"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Social Media */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Globe2 size={16} />
                                                            Social Media Links
                                                        </h3>
                                                        <div className="social-grid">
                                                            <div className="form-field">
                                                                <label>Facebook</label>
                                                                <input
                                                                    type="url"
                                                                    name="social.facebook"
                                                                    value={formData.social?.facebook}
                                                                    onChange={handleInputChange}
                                                                    placeholder="https://facebook.com/company"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Instagram</label>
                                                                <input
                                                                    type="url"
                                                                    name="social.instagram"
                                                                    value={formData.social?.instagram}
                                                                    onChange={handleInputChange}
                                                                    placeholder="https://instagram.com/company"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Twitter</label>
                                                                <input
                                                                    type="url"
                                                                    name="social.twitter"
                                                                    value={formData.social?.twitter}
                                                                    onChange={handleInputChange}
                                                                    placeholder="https://twitter.com/company"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>LinkedIn</label>
                                                                <input
                                                                    type="url"
                                                                    name="social.linkedin"
                                                                    value={formData.social?.linkedin}
                                                                    onChange={handleInputChange}
                                                                    placeholder="https://linkedin.com/company"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>YouTube</label>
                                                                <input
                                                                    type="url"
                                                                    name="social.youtube"
                                                                    value={formData.social?.youtube}
                                                                    onChange={handleInputChange}
                                                                    placeholder="https://youtube.com/@company"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Payment Methods Section */}
                                            {section.id === 'payment_methods' && (
                                                <>
                                                    {/* UPI IDs */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <CreditCard size={16} />
                                                            UPI IDs
                                                        </h3>
                                                        
                                                        {/* Add UPI Button */}
                                                        {!showUpiForm && (
                                                            <button
                                                                onClick={() => {
                                                                    setUpiForm({ id: '', name: '', appType: 'other', isActive: true, description: '' });
                                                                    setEditingUpiIndex(-1);
                                                                    setShowUpiForm(true);
                                                                }}
                                                                className="add-button"
                                                            >
                                                                <Plus size={18} />
                                                                <span>Add New UPI ID</span>
                                                            </button>
                                                        )}

                                                        {/* UPI Form */}
                                                        {showUpiForm && (
                                                            <div className="form-card">
                                                                <div className="form-card-header">
                                                                    <h4>{editingUpiIndex >= 0 ? 'Edit UPI ID' : 'Add New UPI ID'}</h4>
                                                                    <button
                                                                        onClick={() => setShowUpiForm(false)}
                                                                        className="close-btn"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>

                                                                <div className="form-card-body">
                                                                    <div className="form-field">
                                                                        <label>UPI ID <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={upiForm.id}
                                                                            onChange={(e) => setUpiForm({ ...upiForm, id: e.target.value })}
                                                                            placeholder="e.g., company@oksbi"
                                                                        />
                                                                        <span className="hint">Must include @ (e.g., name@oksbi)</span>
                                                                    </div>

                                                                    <div className="form-field">
                                                                        <label>Display Name <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={upiForm.name}
                                                                            onChange={(e) => setUpiForm({ ...upiForm, name: e.target.value })}
                                                                            placeholder="e.g., Primary UPI"
                                                                        />
                                                                    </div>

                                                                    <div className="form-field">
                                                                        <label>App Type</label>
                                                                        <select
                                                                            value={upiForm.appType}
                                                                            onChange={(e) => setUpiForm({ ...upiForm, appType: e.target.value })}
                                                                        >
                                                                            {UPI_APPS.map(app => (
                                                                                <option key={app.value} value={app.value}>
                                                                                    {app.icon} {app.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    <div className="form-field">
                                                                        <label>Description (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={upiForm.description}
                                                                            onChange={(e) => setUpiForm({ ...upiForm, description: e.target.value })}
                                                                            placeholder="e.g., For business payments only"
                                                                        />
                                                                    </div>

                                                                    <div className="toggle-field">
                                                                        <label className="toggle">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={upiForm.isActive}
                                                                                onChange={(e) => setUpiForm({ ...upiForm, isActive: e.target.checked })}
                                                                            />
                                                                            <span className="toggle-slider"></span>
                                                                            <span className="toggle-label">
                                                                                {upiForm.isActive ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </label>
                                                                    </div>

                                                                    <div className="form-actions">
                                                                        <button
                                                                            onClick={() => setShowUpiForm(false)}
                                                                            className="btn-secondary"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={addUpiId}
                                                                            className="btn-primary"
                                                                        >
                                                                            {editingUpiIndex >= 0 ? 'Update' : 'Add'} UPI ID
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* UPI List */}
                                                        <div className="items-list">
                                                            {formData.upiIds?.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <CreditCard size={48} />
                                                                    <h4>No UPI IDs added</h4>
                                                                    <p>Add your first UPI ID to start accepting payments</p>
                                                                </div>
                                                            ) : (
                                                                formData.upiIds.map((upi, index) => {
                                                                    const app = UPI_APPS.find(a => a.value === upi.appType) || UPI_APPS[5];
                                                                    return (
                                                                        <div key={index} className="item-card">
                                                                            <div className="item-status">
                                                                                {getStatusIcon(upi.isActive)}
                                                                            </div>
                                                                            <div className="item-details">
                                                                                <div className="item-title">
                                                                                    <span className="item-id">{upi.id}</span>
                                                                                    <span className="item-name">{upi.name}</span>
                                                                                </div>
                                                                                {upi.description && (
                                                                                    <p className="item-description">{upi.description}</p>
                                                                                )}
                                                                                <span 
                                                                                    className="item-badge"
                                                                                    style={{ 
                                                                                        background: `${app.color}15`,
                                                                                        color: app.color,
                                                                                    }}
                                                                                >
                                                                                    {app.icon} {app.label}
                                                                                </span>
                                                                            </div>
                                                                            <div className="item-actions">
                                                                                <button
                                                                                    onClick={() => toggleUpiStatus(index)}
                                                                                    className="action-btn"
                                                                                    title={upi.isActive ? 'Deactivate' : 'Activate'}
                                                                                >
                                                                                    {upi.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => editUpi(index)}
                                                                                    className="action-btn"
                                                                                    title="Edit"
                                                                                >
                                                                                    <Edit2 size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => deleteUpi(index)}
                                                                                    className="action-btn delete"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* GPay Numbers */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Smartphone size={16} />
                                                            GPay Numbers
                                                        </h3>
                                                        
                                                        {!showGpayForm && (
                                                            <button
                                                                onClick={() => {
                                                                    setGpayForm({ phoneNumber: '', name: '', isActive: true, description: '' });
                                                                    setEditingGpayIndex(-1);
                                                                    setShowGpayForm(true);
                                                                }}
                                                                className="add-button"
                                                            >
                                                                <Plus size={18} />
                                                                <span>Add New GPay Number</span>
                                                            </button>
                                                        )}

                                                        {showGpayForm && (
                                                            <div className="form-card">
                                                                <div className="form-card-header">
                                                                    <h4>{editingGpayIndex >= 0 ? 'Edit GPay Number' : 'Add New GPay Number'}</h4>
                                                                    <button
                                                                        onClick={() => setShowGpayForm(false)}
                                                                        className="close-btn"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>
                                                                <div className="form-card-body">
                                                                    <div className="form-field">
                                                                        <label>Phone Number <span className="required">*</span></label>
                                                                        <input
                                                                            type="tel"
                                                                            value={gpayForm.phoneNumber}
                                                                            onChange={(e) => setGpayForm({ ...gpayForm, phoneNumber: e.target.value })}
                                                                            placeholder="9876543210"
                                                                            maxLength="10"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Display Name <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={gpayForm.name}
                                                                            onChange={(e) => setGpayForm({ ...gpayForm, name: e.target.value })}
                                                                            placeholder="e.g., Primary GPay"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Description (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={gpayForm.description}
                                                                            onChange={(e) => setGpayForm({ ...gpayForm, description: e.target.value })}
                                                                            placeholder="e.g., For UPI payments"
                                                                        />
                                                                    </div>
                                                                    <div className="toggle-field">
                                                                        <label className="toggle">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={gpayForm.isActive}
                                                                                onChange={(e) => setGpayForm({ ...gpayForm, isActive: e.target.checked })}
                                                                            />
                                                                            <span className="toggle-slider"></span>
                                                                            <span className="toggle-label">
                                                                                {gpayForm.isActive ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="form-actions">
                                                                        <button
                                                                            onClick={() => setShowGpayForm(false)}
                                                                            className="btn-secondary"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={addGpayNumber}
                                                                            className="btn-primary"
                                                                        >
                                                                            {editingGpayIndex >= 0 ? 'Update' : 'Add'} GPay Number
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="items-list">
                                                            {formData.gpayNumbers?.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <Smartphone size={48} />
                                                                    <h4>No GPay numbers added</h4>
                                                                    <p>Add GPay numbers for phone-based payments</p>
                                                                </div>
                                                            ) : (
                                                                formData.gpayNumbers.map((gpay, index) => (
                                                                    <div key={index} className="item-card">
                                                                        <div className="item-status">
                                                                            {getStatusIcon(gpay.isActive)}
                                                                        </div>
                                                                        <div className="item-details">
                                                                            <div className="item-title">
                                                                                <span className="item-id">📞 {formatPhoneNumber(gpay.phoneNumber)}</span>
                                                                                <span className="item-name">{gpay.name}</span>
                                                                            </div>
                                                                            {gpay.description && (
                                                                                <p className="item-description">{gpay.description}</p>
                                                                            )}
                                                                            <span className="item-badge" style={{ background: '#4285F415', color: '#4285F4' }}>
                                                                                💚 GPay (UPI: {gpay.upiId})
                                                                            </span>
                                                                        </div>
                                                                        <div className="item-actions">
                                                                            <button
                                                                                onClick={() => toggleGpayStatus(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                {gpay.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => editGpay(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => deleteGpay(index)}
                                                                                className="action-btn delete"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* PhonePe Numbers */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Smartphone size={16} />
                                                            PhonePe Numbers
                                                        </h3>
                                                        
                                                        {!showPhonePeForm && (
                                                            <button
                                                                onClick={() => {
                                                                    setPhonePeForm({ phoneNumber: '', name: '', isActive: true, description: '' });
                                                                    setEditingPhonePeIndex(-1);
                                                                    setShowPhonePeForm(true);
                                                                }}
                                                                className="add-button"
                                                            >
                                                                <Plus size={18} />
                                                                <span>Add New PhonePe Number</span>
                                                            </button>
                                                        )}

                                                        {showPhonePeForm && (
                                                            <div className="form-card">
                                                                <div className="form-card-header">
                                                                    <h4>{editingPhonePeIndex >= 0 ? 'Edit PhonePe Number' : 'Add New PhonePe Number'}</h4>
                                                                    <button
                                                                        onClick={() => setShowPhonePeForm(false)}
                                                                        className="close-btn"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>
                                                                <div className="form-card-body">
                                                                    <div className="form-field">
                                                                        <label>Phone Number <span className="required">*</span></label>
                                                                        <input
                                                                            type="tel"
                                                                            value={phonePeForm.phoneNumber}
                                                                            onChange={(e) => setPhonePeForm({ ...phonePeForm, phoneNumber: e.target.value })}
                                                                            placeholder="9876543210"
                                                                            maxLength="10"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Display Name <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={phonePeForm.name}
                                                                            onChange={(e) => setPhonePeForm({ ...phonePeForm, name: e.target.value })}
                                                                            placeholder="e.g., Primary PhonePe"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Description (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={phonePeForm.description}
                                                                            onChange={(e) => setPhonePeForm({ ...phonePeForm, description: e.target.value })}
                                                                            placeholder="e.g., For business payments"
                                                                        />
                                                                    </div>
                                                                    <div className="toggle-field">
                                                                        <label className="toggle">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={phonePeForm.isActive}
                                                                                onChange={(e) => setPhonePeForm({ ...phonePeForm, isActive: e.target.checked })}
                                                                            />
                                                                            <span className="toggle-slider"></span>
                                                                            <span className="toggle-label">
                                                                                {phonePeForm.isActive ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="form-actions">
                                                                        <button
                                                                            onClick={() => setShowPhonePeForm(false)}
                                                                            className="btn-secondary"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={addPhonePeNumber}
                                                                            className="btn-primary"
                                                                        >
                                                                            {editingPhonePeIndex >= 0 ? 'Update' : 'Add'} PhonePe Number
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="items-list">
                                                            {formData.phonePeNumbers?.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <Smartphone size={48} />
                                                                    <h4>No PhonePe numbers added</h4>
                                                                    <p>Add PhonePe numbers for UPI payments</p>
                                                                </div>
                                                            ) : (
                                                                formData.phonePeNumbers.map((phonepe, index) => (
                                                                    <div key={index} className="item-card">
                                                                        <div className="item-status">
                                                                            {getStatusIcon(phonepe.isActive)}
                                                                        </div>
                                                                        <div className="item-details">
                                                                            <div className="item-title">
                                                                                <span className="item-id">📞 {formatPhoneNumber(phonepe.phoneNumber)}</span>
                                                                                <span className="item-name">{phonepe.name}</span>
                                                                            </div>
                                                                            {phonepe.description && (
                                                                                <p className="item-description">{phonepe.description}</p>
                                                                            )}
                                                                            <span className="item-badge" style={{ background: '#5F259F15', color: '#5F259F' }}>
                                                                                🟣 PhonePe (UPI: {phonepe.upiId})
                                                                            </span>
                                                                        </div>
                                                                        <div className="item-actions">
                                                                            <button
                                                                                onClick={() => togglePhonePeStatus(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                {phonepe.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => editPhonePe(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => deletePhonePe(index)}
                                                                                className="action-btn delete"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* PayTM Numbers */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Smartphone size={16} />
                                                            PayTM Numbers
                                                        </h3>
                                                        
                                                        {!showPaytmForm && (
                                                            <button
                                                                onClick={() => {
                                                                    setPaytmForm({ phoneNumber: '', name: '', isActive: true, description: '' });
                                                                    setEditingPaytmIndex(-1);
                                                                    setShowPaytmForm(true);
                                                                }}
                                                                className="add-button"
                                                            >
                                                                <Plus size={18} />
                                                                <span>Add New PayTM Number</span>
                                                            </button>
                                                        )}

                                                        {showPaytmForm && (
                                                            <div className="form-card">
                                                                <div className="form-card-header">
                                                                    <h4>{editingPaytmIndex >= 0 ? 'Edit PayTM Number' : 'Add New PayTM Number'}</h4>
                                                                    <button
                                                                        onClick={() => setShowPaytmForm(false)}
                                                                        className="close-btn"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>
                                                                <div className="form-card-body">
                                                                    <div className="form-field">
                                                                        <label>Phone Number <span className="required">*</span></label>
                                                                        <input
                                                                            type="tel"
                                                                            value={paytmForm.phoneNumber}
                                                                            onChange={(e) => setPaytmForm({ ...paytmForm, phoneNumber: e.target.value })}
                                                                            placeholder="9876543210"
                                                                            maxLength="10"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Display Name <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={paytmForm.name}
                                                                            onChange={(e) => setPaytmForm({ ...paytmForm, name: e.target.value })}
                                                                            placeholder="e.g., Primary PayTM"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Description (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={paytmForm.description}
                                                                            onChange={(e) => setPaytmForm({ ...paytmForm, description: e.target.value })}
                                                                            placeholder="e.g., For UPI payments"
                                                                        />
                                                                    </div>
                                                                    <div className="toggle-field">
                                                                        <label className="toggle">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={paytmForm.isActive}
                                                                                onChange={(e) => setPaytmForm({ ...paytmForm, isActive: e.target.checked })}
                                                                            />
                                                                            <span className="toggle-slider"></span>
                                                                            <span className="toggle-label">
                                                                                {paytmForm.isActive ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="form-actions">
                                                                        <button
                                                                            onClick={() => setShowPaytmForm(false)}
                                                                            className="btn-secondary"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={addPaytmNumber}
                                                                            className="btn-primary"
                                                                        >
                                                                            {editingPaytmIndex >= 0 ? 'Update' : 'Add'} PayTM Number
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="items-list">
                                                            {formData.paytmNumbers?.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <Smartphone size={48} />
                                                                    <h4>No PayTM numbers added</h4>
                                                                    <p>Add PayTM numbers for payments</p>
                                                                </div>
                                                            ) : (
                                                                formData.paytmNumbers.map((paytm, index) => (
                                                                    <div key={index} className="item-card">
                                                                        <div className="item-status">
                                                                            {getStatusIcon(paytm.isActive)}
                                                                        </div>
                                                                        <div className="item-details">
                                                                            <div className="item-title">
                                                                                <span className="item-id">📞 {formatPhoneNumber(paytm.phoneNumber)}</span>
                                                                                <span className="item-name">{paytm.name}</span>
                                                                            </div>
                                                                            {paytm.description && (
                                                                                <p className="item-description">{paytm.description}</p>
                                                                            )}
                                                                            <span className="item-badge" style={{ background: '#00BAF215', color: '#00BAF2' }}>
                                                                                🔵 PayTM (UPI: {paytm.upiId})
                                                                            </span>
                                                                        </div>
                                                                        <div className="item-actions">
                                                                            <button
                                                                                onClick={() => togglePaytmStatus(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                {paytm.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => editPaytm(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => deletePaytm(index)}
                                                                                className="action-btn delete"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* QR Code */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <QrCode size={16} />
                                                            QR Code
                                                        </h3>
                                                        
                                                        <div className="qr-section">
                                                            {formData.qrCode?.imageUrl ? (
                                                                <div className="qr-preview">
                                                                    <img src={formData.qrCode.imageUrl} alt="Payment QR Code" />
                                                                    <div className="qr-info">
                                                                        <p><strong>Name:</strong> {formData.qrCode.name}</p>
                                                                        {formData.qrCode.description && (
                                                                            <p><strong>Description:</strong> {formData.qrCode.description}</p>
                                                                        )}
                                                                        <p><strong>Status:</strong> 
                                                                            <span className={formData.qrCode.isActive ? 'active' : 'inactive'}>
                                                                                {formData.qrCode.isActive ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="qr-actions">
                                                                        <button
                                                                            onClick={toggleQrStatus}
                                                                            className="qr-action-btn"
                                                                        >
                                                                            {formData.qrCode.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                            {formData.qrCode.isActive ? 'Deactivate' : 'Activate'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setShowQrForm(true)}
                                                                            className="qr-action-btn"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={deleteQrCode}
                                                                            className="qr-action-btn delete"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setShowQrForm(true)}
                                                                    className="add-qr-btn"
                                                                >
                                                                    <QrCode size={32} />
                                                                    <span>Upload QR Code</span>
                                                                    <small>Customers can scan this QR to pay</small>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* QR Code Form Modal */}
                                                        {showQrForm && (
                                                            <div className="modal-overlay" onClick={() => setShowQrForm(false)}>
                                                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="modal-header">
                                                                        <h4>{formData.qrCode?.imageUrl ? 'Edit QR Code' : 'Upload QR Code'}</h4>
                                                                        <button onClick={() => setShowQrForm(false)} className="close-btn">
                                                                            <X size={20} />
                                                                        </button>
                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <div className="form-field">
                                                                            <label>QR Code Image</label>
                                                                            <div className="file-upload">
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={handleQrFileChange}
                                                                                    id="qr-upload"
                                                                                />
                                                                                <label htmlFor="qr-upload" className="file-label">
                                                                                    <Upload size={20} />
                                                                                    <span>Choose Image</span>
                                                                                </label>
                                                                            </div>
                                                                            {qrForm.imageUrl && (
                                                                                <div className="upload-preview">
                                                                                    <img src={qrForm.imageUrl} alt="QR Preview" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="form-field">
                                                                            <label>Name</label>
                                                                            <input
                                                                                type="text"
                                                                                value={qrForm.name}
                                                                                onChange={(e) => setQrForm({ ...qrForm, name: e.target.value })}
                                                                                placeholder="e.g., Payment QR Code"
                                                                            />
                                                                        </div>
                                                                        <div className="form-field">
                                                                            <label>Description (Optional)</label>
                                                                            <input
                                                                                type="text"
                                                                                value={qrForm.description}
                                                                                onChange={(e) => setQrForm({ ...qrForm, description: e.target.value })}
                                                                                placeholder="Brief description"
                                                                            />
                                                                        </div>
                                                                        <div className="toggle-field">
                                                                            <label className="toggle">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={qrForm.isActive}
                                                                                    onChange={(e) => setQrForm({ ...qrForm, isActive: e.target.checked })}
                                                                                />
                                                                                <span className="toggle-slider"></span>
                                                                                <span className="toggle-label">
                                                                                    {qrForm.isActive ? 'Active' : 'Inactive'}
                                                                                </span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-actions">
                                                                            <button
                                                                                onClick={() => setShowQrForm(false)}
                                                                                className="btn-secondary"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={saveQrCode}
                                                                                className="btn-primary"
                                                                            >
                                                                                Save QR Code
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bank Accounts */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Landmark size={16} />
                                                            Bank Accounts
                                                        </h3>
                                                        
                                                        {!showBankForm && (
                                                            <button
                                                                onClick={() => {
                                                                    setBankAccountForm({
                                                                        accountName: '',
                                                                        accountNumber: '',
                                                                        bankName: '',
                                                                        ifscCode: '',
                                                                        branch: '',
                                                                        accountType: 'Current',
                                                                        isActive: true,
                                                                        isDefault: false,
                                                                        description: ''
                                                                    });
                                                                    setEditingBankIndex(-1);
                                                                    setShowBankForm(true);
                                                                }}
                                                                className="add-button"
                                                            >
                                                                <Plus size={18} />
                                                                <span>Add New Bank Account</span>
                                                            </button>
                                                        )}

                                                        {showBankForm && (
                                                            <div className="form-card">
                                                                <div className="form-card-header">
                                                                    <h4>{editingBankIndex >= 0 ? 'Edit Bank Account' : 'Add New Bank Account'}</h4>
                                                                    <button
                                                                        onClick={() => setShowBankForm(false)}
                                                                        className="close-btn"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>
                                                                <div className="form-card-body">
                                                                    <div className="form-field">
                                                                        <label>Account Holder Name <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={bankAccountForm.accountName}
                                                                            onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountName: e.target.value })}
                                                                            placeholder="As per bank records"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Account Number <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={bankAccountForm.accountNumber}
                                                                            onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountNumber: e.target.value })}
                                                                            placeholder="Enter account number"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Bank Name <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={bankAccountForm.bankName}
                                                                            onChange={(e) => setBankAccountForm({ ...bankAccountForm, bankName: e.target.value })}
                                                                            placeholder="e.g., State Bank of India"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>IFSC Code <span className="required">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={bankAccountForm.ifscCode}
                                                                            onChange={(e) => setBankAccountForm({ ...bankAccountForm, ifscCode: e.target.value.toUpperCase() })}
                                                                            placeholder="SBIN0001234"
                                                                            maxLength="11"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Branch (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={bankAccountForm.branch}
                                                                            onChange={(e) => setBankAccountForm({ ...bankAccountForm, branch: e.target.value })}
                                                                            placeholder="Branch name"
                                                                        />
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Account Type</label>
                                                                        <select
                                                                            value={bankAccountForm.accountType}
                                                                            onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountType: e.target.value })}
                                                                        >
                                                                            {ACCOUNT_TYPES.map(type => (
                                                                                <option key={type} value={type}>{type}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="form-field">
                                                                        <label>Description (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={bankAccountForm.description}
                                                                            onChange={(e) => setBankAccountForm({ ...bankAccountForm, description: e.target.value })}
                                                                            placeholder="e.g., Main business account"
                                                                        />
                                                                    </div>
                                                                    <div className="toggle-field">
                                                                        <label className="toggle">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={bankAccountForm.isActive}
                                                                                onChange={(e) => setBankAccountForm({ ...bankAccountForm, isActive: e.target.checked })}
                                                                            />
                                                                            <span className="toggle-slider"></span>
                                                                            <span className="toggle-label">
                                                                                {bankAccountForm.isActive ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="toggle-field">
                                                                        <label className="toggle">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={bankAccountForm.isDefault}
                                                                                onChange={(e) => setBankAccountForm({ ...bankAccountForm, isDefault: e.target.checked })}
                                                                            />
                                                                            <span className="toggle-slider"></span>
                                                                            <span className="toggle-label">
                                                                                Set as Default Account
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="form-actions">
                                                                        <button
                                                                            onClick={() => setShowBankForm(false)}
                                                                            className="btn-secondary"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={addBankAccount}
                                                                            className="btn-primary"
                                                                        >
                                                                            {editingBankIndex >= 0 ? 'Update' : 'Add'} Bank Account
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="items-list">
                                                            {formData.bankAccounts?.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <Landmark size={48} />
                                                                    <h4>No bank accounts added</h4>
                                                                    <p>Add bank accounts for traditional transfers</p>
                                                                </div>
                                                            ) : (
                                                                formData.bankAccounts.map((bank, index) => (
                                                                    <div key={index} className="item-card">
                                                                        <div className="item-status">
                                                                            {getStatusIcon(bank.isActive)}
                                                                            {bank.isDefault && (
                                                                                <span className="default-badge" title="Default Account">⭐</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="item-details">
                                                                            <div className="item-title">
                                                                                <span className="item-id">{bank.accountName}</span>
                                                                                <span className="item-name">{bank.bankName}</span>
                                                                            </div>
                                                                            <p className="item-description">
                                                                                A/C: {bank.accountNumber.slice(-4)} • IFSC: {bank.ifscCode}
                                                                            </p>
                                                                            {bank.description && (
                                                                                <p className="item-description">{bank.description}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="item-actions">
                                                                            {!bank.isDefault && (
                                                                                <button
                                                                                    onClick={() => setDefaultBank(index)}
                                                                                    className="action-btn"
                                                                                    title="Set as Default"
                                                                                >
                                                                                    <Star size={16} />
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => toggleBankStatus(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                {bank.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => editBankAccount(index)}
                                                                                className="action-btn"
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                            {!bank.isDefault && (
                                                                                <button
                                                                                    onClick={() => deleteBankAccount(index)}
                                                                                    className="action-btn delete"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Payment Settings */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Settings size={16} />
                                                            Payment Settings
                                                        </h3>
                                                        
                                                        <button
                                                            onClick={() => setShowPaymentSettings(!showPaymentSettings)}
                                                            className="settings-toggle"
                                                        >
                                                            <span>Configure Payment Settings</span>
                                                            <ChevronRight size={18} className={`chevron ${showPaymentSettings ? 'expanded' : ''}`} />
                                                        </button>

                                                        {showPaymentSettings && (
                                                            <div className="payment-settings">
                                                                <div className="toggle-field">
                                                                    <label className="toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.paymentSettings?.autoVerifyEnabled}
                                                                            onChange={(e) => handlePaymentSettingsChange('autoVerifyEnabled', e.target.checked)}
                                                                        />
                                                                        <span className="toggle-slider"></span>
                                                                        <span className="toggle-label">Enable Auto-Verification</span>
                                                                    </label>
                                                                </div>

                                                                <div className="form-field">
                                                                    <label>Minimum Confidence for Auto-Verify (%)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={formData.paymentSettings?.minConfidenceForAuto}
                                                                        onChange={(e) => handlePaymentSettingsChange('minConfidenceForAuto', parseInt(e.target.value))}
                                                                        min="50"
                                                                        max="100"
                                                                    />
                                                                    <span className="hint">Recommended: 85%</span>
                                                                </div>

                                                                <div className="form-field">
                                                                    <label>Payment Timeout (minutes)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={formData.paymentSettings?.paymentTimeout}
                                                                        onChange={(e) => handlePaymentSettingsChange('paymentTimeout', parseInt(e.target.value))}
                                                                        min="5"
                                                                        max="60"
                                                                    />
                                                                    <span className="hint">How long customers have to complete payment</span>
                                                                </div>

                                                                <div className="form-field">
                                                                    <label>Amount Tolerance (₹)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={formData.paymentSettings?.autoVerifyThresholds?.amountTolerance}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            paymentSettings: {
                                                                                ...formData.paymentSettings,
                                                                                autoVerifyThresholds: {
                                                                                    ...formData.paymentSettings?.autoVerifyThresholds,
                                                                                    amountTolerance: parseInt(e.target.value)
                                                                                }
                                                                            }
                                                                        })}
                                                                        min="0"
                                                                        max="10"
                                                                    />
                                                                    <span className="hint">Allowed difference between detected and expected amount</span>
                                                                </div>

                                                                <div className="form-field">
                                                                    <label>Time Window (minutes)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={formData.paymentSettings?.autoVerifyThresholds?.timeWindow}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            paymentSettings: {
                                                                                ...formData.paymentSettings,
                                                                                autoVerifyThresholds: {
                                                                                    ...formData.paymentSettings?.autoVerifyThresholds,
                                                                                    timeWindow: parseInt(e.target.value)
                                                                                }
                                                                            }
                                                                        })}
                                                                        min="5"
                                                                        max="60"
                                                                    />
                                                                    <span className="hint">Maximum age of payment screenshot</span>
                                                                </div>

                                                                <div className="toggle-field">
                                                                    <label className="toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.paymentSettings?.requireTransactionId}
                                                                            onChange={(e) => handlePaymentSettingsChange('requireTransactionId', e.target.checked)}
                                                                        />
                                                                        <span className="toggle-slider"></span>
                                                                        <span className="toggle-label">Require Transaction ID</span>
                                                                    </label>
                                                                </div>

                                                                <div className="toggle-field">
                                                                    <label className="toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.paymentSettings?.allowMultiplePaymentMethods}
                                                                            onChange={(e) => handlePaymentSettingsChange('allowMultiplePaymentMethods', e.target.checked)}
                                                                        />
                                                                        <span className="toggle-slider"></span>
                                                                        <span className="toggle-label">Allow Multiple Payment Methods</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* Bank Section (Legacy) */}
                                            {section.id === 'bank' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Landmark size={16} />
                                                            Bank Information (Legacy)
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Bank Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="bank.name"
                                                                    value={formData.bank?.name}
                                                                    onChange={handleInputChange}
                                                                    placeholder="e.g., State Bank of India"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Account Number</label>
                                                                <input
                                                                    type="text"
                                                                    name="bank.account"
                                                                    value={formData.bank?.account}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Enter account number"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>IFSC Code</label>
                                                                <input
                                                                    type="text"
                                                                    name="bank.ifsc"
                                                                    value={formData.bank?.ifsc}
                                                                    onChange={handleInputChange}
                                                                    className={errors.bankIfsc ? 'error' : ''}
                                                                    placeholder="SBIN0001234"
                                                                    maxLength="11"
                                                                    style={{ textTransform: 'uppercase' }}
                                                                />
                                                                {errors.bankIfsc && <span className="error-text">{errors.bankIfsc}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Branch</label>
                                                                <input
                                                                    type="text"
                                                                    name="bank.branch"
                                                                    value={formData.bank?.branch}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Branch name"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Account Type</label>
                                                                <select
                                                                    name="bank.accountType"
                                                                    value={formData.bank?.accountType}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="Current Account">Current Account</option>
                                                                    <option value="Savings Account">Savings Account</option>
                                                                    <option value="Business Account">Business Account</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <ShieldCheck size={20} />
                                                        <p>
                                                            <strong>Note:</strong> These details are for legacy support. Use Bank Accounts in Payment Methods for multiple accounts.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Invoice Section */}
                                            {section.id === 'invoice' && (
                                                <>
                                                    {/* Format Settings */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <FileText size={16} />
                                                            Format Settings
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Invoice Prefix</label>
                                                                <input
                                                                    type="text"
                                                                    name="invoiceSettings.prefix"
                                                                    value={formData.invoiceSettings?.prefix}
                                                                    onChange={handleInputChange}
                                                                    placeholder="INV"
                                                                    maxLength="5"
                                                                    style={{ textTransform: 'uppercase' }}
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Separator</label>
                                                                <input
                                                                    type="text"
                                                                    name="invoiceSettings.separator"
                                                                    value={formData.invoiceSettings?.separator}
                                                                    onChange={handleInputChange}
                                                                    placeholder="-"
                                                                    maxLength="1"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Date Format</label>
                                                                <select
                                                                    name="invoiceSettings.dateFormat"
                                                                    value={formData.invoiceSettings?.dateFormat}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                                                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                                                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                                                </select>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Currency Symbol</label>
                                                                <input
                                                                    type="text"
                                                                    name="invoiceSettings.currency"
                                                                    value={formData.invoiceSettings?.currency}
                                                                    onChange={handleInputChange}
                                                                    placeholder="₹"
                                                                    maxLength="2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tax Settings */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <DollarSign size={16} />
                                                            Tax Settings
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Tax System</label>
                                                                <select
                                                                    name="invoiceSettings.taxSystem"
                                                                    value={formData.invoiceSettings?.taxSystem}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="GST">GST (India)</option>
                                                                    <option value="VAT">VAT</option>
                                                                    <option value="None">No Tax</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="toggle-field">
                                                            <label className="toggle">
                                                                <input
                                                                    type="checkbox"
                                                                    name="invoiceSettings.gstBreakdown"
                                                                    checked={formData.invoiceSettings?.gstBreakdown}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <span className="toggle-slider"></span>
                                                                <span className="toggle-label">Show GST breakdown</span>
                                                            </label>
                                                        </div>

                                                        <div className="toggle-field">
                                                            <label className="toggle">
                                                                <input
                                                                    type="checkbox"
                                                                    name="invoiceSettings.showCGSTSGST"
                                                                    checked={formData.invoiceSettings?.showCGSTSGST}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <span className="toggle-slider"></span>
                                                                <span className="toggle-label">Show CGST/SGST separately</span>
                                                            </label>
                                                        </div>

                                                        <div className="toggle-field">
                                                            <label className="toggle">
                                                                <input
                                                                    type="checkbox"
                                                                    name="invoiceSettings.roundAmount"
                                                                    checked={formData.invoiceSettings?.roundAmount}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <span className="toggle-slider"></span>
                                                                <span className="toggle-label">Round amounts to nearest integer</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Terms & Policies */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <FileSignature size={16} />
                                                            Terms & Policies
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Payment Terms</label>
                                                                <textarea
                                                                    name="invoiceSettings.paymentTerms"
                                                                    value={formData.invoiceSettings?.paymentTerms}
                                                                    onChange={handleInputChange}
                                                                    rows="2"
                                                                    placeholder="e.g., Due on receipt"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Delivery Terms</label>
                                                                <textarea
                                                                    name="invoiceSettings.deliveryTerms"
                                                                    value={formData.invoiceSettings?.deliveryTerms}
                                                                    onChange={handleInputChange}
                                                                    rows="2"
                                                                    placeholder="e.g., 3-5 business days after payment"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Warranty Terms</label>
                                                                <textarea
                                                                    name="invoiceSettings.warrantyTerms"
                                                                    value={formData.invoiceSettings?.warrantyTerms}
                                                                    onChange={handleInputChange}
                                                                    rows="2"
                                                                    placeholder="e.g., 7 days replacement for defects"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Refund Policy</label>
                                                                <textarea
                                                                    name="invoiceSettings.refundPolicy"
                                                                    value={formData.invoiceSettings?.refundPolicy}
                                                                    onChange={handleInputChange}
                                                                    rows="2"
                                                                    placeholder="e.g., No refunds after order processing"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Support Section */}
                                            {section.id === 'support' && (
                                                <>
                                                    {/* Contact Channels */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <HeadphonesIcon size={16} />
                                                            Support Channels
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Support Email</label>
                                                                <input
                                                                    type="email"
                                                                    name="support.email"
                                                                    value={formData.support?.email}
                                                                    onChange={handleInputChange}
                                                                    placeholder="support@company.com"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Support Phone</label>
                                                                <input
                                                                    type="tel"
                                                                    name="support.phone"
                                                                    value={formData.support?.phone}
                                                                    onChange={handleInputChange}
                                                                    placeholder="+91 98765 43210"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>WhatsApp Number</label>
                                                                <input
                                                                    type="tel"
                                                                    name="support.whatsapp"
                                                                    value={formData.support?.whatsapp}
                                                                    onChange={handleInputChange}
                                                                    placeholder="+91 98765 43210"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Availability */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <Clock size={16} />
                                                            Availability
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Support Hours</label>
                                                                <input
                                                                    type="text"
                                                                    name="support.hours"
                                                                    value={formData.support?.hours}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Mon-Sat, 10:00 AM - 7:00 PM"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Response Time</label>
                                                                <input
                                                                    type="text"
                                                                    name="support.responseTime"
                                                                    value={formData.support?.responseTime}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Within 30 minutes"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Business Hours */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <CalendarIcon size={16} />
                                                            Business Hours
                                                        </h3>
                                                        <div className="hours-list">
                                                            {Object.entries(formData.businessHours || {}).map(([day, hours]) => (
                                                                <div key={day} className="hours-item">
                                                                    <label className="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                                                                    <input
                                                                        type="text"
                                                                        value={hours}
                                                                        onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                                                                        placeholder="9:00 AM - 6:00 PM"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Order Flow Section */}
                                            {section.id === 'order_flow' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Route size={16} />
                                                            WhatsApp Order Flow Configuration
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Order Collection Mode</label>
                                                                <div className="radio-group">
                                                                    <label className={`radio-label ${formData.orderFlowMode === 'long' ? 'selected' : ''}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="orderFlowMode"
                                                                            value="long"
                                                                            checked={formData.orderFlowMode === 'long'}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <div className="radio-content">
                                                                            <div className="radio-header">
                                                                                <strong>Long Version (Step by Step) - Default</strong>
                                                                                {formData.orderFlowMode === 'long' && (
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
                                                                    
                                                                    <label className={`radio-label ${formData.orderFlowMode === 'short' ? 'selected' : ''}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="orderFlowMode"
                                                                            value="short"
                                                                            checked={formData.orderFlowMode === 'short'}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        <div className="radio-content">
                                                                            <div className="radio-header">
                                                                                <strong>Short Version (Quick Order)</strong>
                                                                                {formData.orderFlowMode === 'short' && (
                                                                                    <span className="active-badge">Active</span>
                                                                                )}
                                                                            </div>
                                                                            <p className="radio-description">
                                                                                • Collect full address in one message<br/>
                                                                                • Format: Door No, Street, Area, City, State<br/>
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

                                                    <div className="info-box">
                                                        <Info size={20} />
                                                        <p>
                                                            <strong>Note:</strong> Changes to order flow mode will affect how new orders are collected via WhatsApp. Existing orders continue with their original flow.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Branding Section */}
                                            {section.id === 'branding' && (
                                                <>
                                                    {/* Theme Colors */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <PaletteIcon size={16} />
                                                            Theme Colors
                                                        </h3>
                                                        <div className="colors-grid">
                                                            <div className="color-field">
                                                                <label>Primary</label>
                                                                <div className="color-input">
                                                                    <input
                                                                        type="color"
                                                                        value={formData.theme?.primary || '#2563eb'}
                                                                        onChange={(e) => handleThemeChange('primary', e.target.value)}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={formData.theme?.primary || '#2563eb'}
                                                                        onChange={(e) => handleThemeChange('primary', e.target.value)}
                                                                        placeholder="#2563eb"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="color-field">
                                                                <label>Secondary</label>
                                                                <div className="color-input">
                                                                    <input
                                                                        type="color"
                                                                        value={formData.theme?.secondary || '#4f46e5'}
                                                                        onChange={(e) => handleThemeChange('secondary', e.target.value)}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={formData.theme?.secondary || '#4f46e5'}
                                                                        onChange={(e) => handleThemeChange('secondary', e.target.value)}
                                                                        placeholder="#4f46e5"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="color-field">
                                                                <label>Accent</label>
                                                                <div className="color-input">
                                                                    <input
                                                                        type="color"
                                                                        value={formData.theme?.accent || '#0d9488'}
                                                                        onChange={(e) => handleThemeChange('accent', e.target.value)}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={formData.theme?.accent || '#0d9488'}
                                                                        onChange={(e) => handleThemeChange('accent', e.target.value)}
                                                                        placeholder="#0d9488"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Color Preview */}
                                                        <div className="color-preview">
                                                            <div className="preview-bar">
                                                                <div className="preview-segment" style={{ backgroundColor: formData.theme?.primary }}>Primary</div>
                                                                <div className="preview-segment" style={{ backgroundColor: formData.theme?.secondary }}>Secondary</div>
                                                                <div className="preview-segment" style={{ backgroundColor: formData.theme?.accent }}>Accent</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Brand Assets */}
                                                    <div className="form-block">
                                                        <h3>
                                                            <ImageIcon size={16} />
                                                            Brand Assets
                                                        </h3>
                                                        <div className="assets-grid">
                                                            <div className="asset-card">
                                                                <div className="asset-preview">
                                                                    {formData.logo ? (
                                                                        <img src={formData.logo} alt="Logo" />
                                                                    ) : (
                                                                        <Building2 size={32} />
                                                                    )}
                                                                </div>
                                                                <label className="asset-upload">
                                                                    <Upload size={14} />
                                                                    <span>Upload Logo</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        onChange={(e) => handleAssetUpload('logo', e)}
                                                                    />
                                                                </label>
                                                            </div>

                                                            <div className="asset-card">
                                                                <div className="asset-preview">
                                                                    {formData.favicon ? (
                                                                        <img src={formData.favicon} alt="Favicon" />
                                                                    ) : (
                                                                        <Star size={32} />
                                                                    )}
                                                                </div>
                                                                <label className="asset-upload">
                                                                    <Upload size={14} />
                                                                    <span>Upload Favicon</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        onChange={(e) => handleAssetUpload('favicon', e)}
                                                                    />
                                                                </label>
                                                            </div>

                                                            <div className="asset-card">
                                                                <div className="asset-preview">
                                                                    {formData.signature ? (
                                                                        <img src={formData.signature} alt="Signature" />
                                                                    ) : (
                                                                        <FileSignature size={32} />
                                                                    )}
                                                                </div>
                                                                <label className="asset-upload">
                                                                    <Upload size={14} />
                                                                    <span>Upload Signature</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        onChange={(e) => handleAssetUpload('signature', e)}
                                                                    />
                                                                </label>
                                                            </div>

                                                            <div className="asset-card">
                                                                <div className="asset-preview">
                                                                    {formData.stamp ? (
                                                                        <img src={formData.stamp} alt="Stamp" />
                                                                    ) : (
                                                                        <Stamp size={32} />
                                                                    )}
                                                                </div>
                                                                <label className="asset-upload">
                                                                    <Upload size={14} />
                                                                    <span>Upload Stamp</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        onChange={(e) => handleAssetUpload('stamp', e)}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
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
                        onClick={saveSettings}
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
                .company-profile {
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

                /* ==================== DESKTOP TABS ==================== */
                .desktop-tabs {
                    max-width: 1200px;
                    margin: 0 auto 24px auto;
                    padding: 0 24px;
                    display: none;
                    background: white;
                    border-bottom: 2px solid #e2e8f0;
                }

                @media (min-width: 1024px) {
                    .desktop-tabs {
                        display: flex;
                        padding: 0 24px;
                        margin: 0 auto 24px auto;
                    }
                }

                .tab-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px 12px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    font-size: 0.875rem;
                    position: relative;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                    flex: 1;
                    min-width: 0;
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
                    padding: 6px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .tab-title {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
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

                /* ==================== SECTIONS CONTAINER ==================== */
                .sections-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .section-card {
                    background: white;
                    border-radius: 8px;
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
                    border-radius: 8px;
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

                .form-field label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
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

                /* ==================== SOCIAL GRID ==================== */
                .social-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 16px;
                }

                @media (min-width: 640px) {
                    .social-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                /* ==================== TOGGLE ==================== */
                .toggle-field {
                    margin: 12px 0;
                }

                .toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
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

                .toggle-label {
                    font-size: 0.875rem;
                    color: #334155;
                }

                /* ==================== UPI SECTION ==================== */
                .add-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    background: #f8fafc;
                    border: 2px dashed #3b82f6;
                    border-radius: 8px;
                    color: #3b82f6;
                    font-size: 0.938rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 20px;
                }

                .add-button:hover {
                    background: #eef2ff;
                    border-style: solid;
                }

                .form-card {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    overflow: hidden;
                }

                .form-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }

                .form-card-header h4 {
                    font-size: 0.938rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0;
                }

                .close-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                }

                .form-card-body {
                    padding: 20px;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .btn-primary,
                .btn-secondary {
                    flex: 1;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                    border: none;
                }

                .btn-secondary {
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #334155;
                }

                /* ==================== ITEMS LIST ==================== */
                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .item-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                }

                .item-status {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    min-width: 40px;
                }

                .status-icon.active {
                    color: #10b981;
                }

                .status-icon.inactive {
                    color: #94a3b8;
                }

                .default-badge {
                    font-size: 14px;
                }

                .item-details {
                    flex: 1;
                }

                .item-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                    flex-wrap: wrap;
                }

                .item-id {
                    font-weight: 600;
                    font-size: 0.938rem;
                    color: #0f172a;
                }

                .item-name {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .item-description {
                    font-size: 0.688rem;
                    color: #64748b;
                    margin: 0 0 8px 0;
                }

                .item-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.625rem;
                    font-weight: 600;
                }

                .item-actions {
                    display: flex;
                    gap: 6px;
                }

                .action-btn {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-btn:hover {
                    background: #f1f5f9;
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                .action-btn.delete:hover {
                    background: #fee2e2;
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* ==================== QR SECTION ==================== */
                .qr-section {
                    margin: 20px 0;
                }

                .qr-preview {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 20px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                }

                .qr-preview img {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                }

                .qr-info {
                    flex: 1;
                }

                .qr-info p {
                    margin: 4px 0;
                    font-size: 0.875rem;
                }

                .qr-info .active {
                    color: #10b981;
                    font-weight: 600;
                    margin-left: 4px;
                }

                .qr-info .inactive {
                    color: #ef4444;
                    font-weight: 600;
                    margin-left: 4px;
                }

                .qr-actions {
                    display: flex;
                    gap: 8px;
                }

                .qr-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    cursor: pointer;
                }

                .qr-action-btn.delete {
                    color: #ef4444;
                }

                .add-qr-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 40px;
                    background: #f8fafc;
                    border: 2px dashed #3b82f6;
                    border-radius: 8px;
                    color: #3b82f6;
                    cursor: pointer;
                }

                .add-qr-btn small {
                    color: #64748b;
                }

                /* ==================== MODAL ==================== */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 16px;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .modal-header h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                }

                .modal-body {
                    padding: 20px;
                }

                .file-upload {
                    margin-bottom: 16px;
                }

                .file-upload input {
                    display: none;
                }

                .file-label {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    background: #f8fafc;
                    border: 2px dashed #3b82f6;
                    border-radius: 8px;
                    color: #3b82f6;
                    cursor: pointer;
                }

                .upload-preview {
                    margin-top: 16px;
                    text-align: center;
                }

                .upload-preview img {
                    max-width: 200px;
                    max-height: 200px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                }

                /* ==================== PAYMENT SETTINGS ==================== */
                .settings-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .settings-toggle .chevron {
                    transition: transform 0.3s ease;
                }

                .settings-toggle .chevron.expanded {
                    transform: rotate(90deg);
                }

                .payment-settings {
                    padding: 20px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-top: 12px;
                }

                /* ==================== EMPTY STATE ==================== */
                .empty-state {
                    text-align: center;
                    padding: 48px 24px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .empty-state svg {
                    color: #94a3b8;
                    margin-bottom: 16px;
                }

                .empty-state h4 {
                    font-size: 0.938rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .empty-state p {
                    font-size: 0.813rem;
                    color: #64748b;
                    margin: 0;
                }

                /* ==================== INFO BOX ==================== */
                .info-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #eef2ff;
                    border: 1px solid #c7d2fe;
                    border-radius: 8px;
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

                /* ==================== COLORS ==================== */
                .colors-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                @media (min-width: 640px) {
                    .colors-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .color-field label {
                    display: block;
                    font-size: 0.688rem;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .color-input {
                    display: flex;
                    gap: 8px;
                }

                .color-input input[type="color"] {
                    width: 42px;
                    height: 42px;
                    padding: 2px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .color-input input[type="text"] {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.813rem;
                    font-family: monospace;
                }

                .color-preview {
                    margin-top: 16px;
                }

                .preview-bar {
                    display: flex;
                    height: 40px;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .preview-segment {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.625rem;
                    font-weight: 600;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }

                /* ==================== ASSETS ==================== */
                .assets-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                @media (min-width: 640px) {
                    .assets-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .asset-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                }

                .asset-preview {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                }

                .asset-preview img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .asset-preview svg {
                    color: #94a3b8;
                }

                .asset-upload {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 30px;
                    font-size: 0.688rem;
                    color: #475569;
                    cursor: pointer;
                    position: relative;
                }

                .asset-upload input {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }

                /* ==================== HOURS ==================== */
                .hours-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .hours-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                @media (min-width: 640px) {
                    .hours-item {
                        flex-direction: row;
                        align-items: center;
                        gap: 16px;
                    }
                }

                .day-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                    text-transform: capitalize;
                    min-width: 100px;
                }

                .hours-item input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                }

                /* ==================== RADIO GROUP ==================== */
                .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-top: 8px;
                    margin-bottom: 16px;
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
                    flex-shrink: 0;
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
                    white-space: normal;
                    word-break: break-word;
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
                        display: none;
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

                    .item-card {
                        flex-wrap: wrap;
                    }

                    .item-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .assets-grid {
                        grid-template-columns: 1fr;
                    }

                    .qr-preview {
                        flex-direction: column;
                        text-align: center;
                    }

                    .qr-actions {
                        flex-wrap: wrap;
                        justify-content: center;
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
                        display: none;
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

                    .hours-item {
                        gap: 8px;
                    }

                    .hours-item input {
                        padding: 8px 10px;
                    }

                    .item-title {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .item-actions {
                        flex-wrap: wrap;
                    }

                    .action-btn {
                        width: 40px;
                        height: 40px;
                    }
                }
            `}</style>
        </>
    );
}


