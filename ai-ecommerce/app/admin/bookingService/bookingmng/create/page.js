

// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Head from 'next/head';
// import { appTheme } from '../../../../../src/constants/theme';
// import {
//     ArrowLeft, Save, User, Building, Mail, Phone,
//     MapPin, Briefcase, Clock, Globe, Shield, Plus,
//     Trash2, CheckCircle, XCircle, AlertCircle, ChevronRight,
//     ChevronDown, ChevronUp, Home, Map, Truck, Zap, Settings, Users,
//     FileText, Award, Star, Wifi, Video, Calendar, Layers, Layout,
//     Info, AlertTriangle, Check, Loader2, Camera, Image as ImageIcon,
//     Link2, AtSign, Hash, FileSignature, Palette, Brush, Sparkles,
//     Crown, Gem, Diamond, Gift, ThumbsUp, ThumbsDown, MessageSquare,
//     Send, Paperclip, Smile, Grid, List, RefreshCw, Filter,
//     Search, MoreVertical, Download, Printer, Share2, Bookmark,
//     Eye, EyeOff, Lock, Unlock, Key, WifiOff, Battery, BatteryCharging,
//     Cpu, HardDrive, Server, Cloud, CloudOff, Repeat, Shuffle,
//     Play, Pause, Square, Circle, Triangle, Hexagon, Octagon,
//     Building2, CreditCard, Landmark, Receipt, HeadphonesIcon,
//     PhoneCall, MailOpen, MapPinHouse, Store, Globe2, Facebook,
//     Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
//     Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
//     Activity, TrendingUp, Briefcase as BriefcaseIcon,
//     Calendar as CalendarIcon, Clock as ClockIcon,
//     Map as MapIcon, Truck as TruckIcon, Zap as ZapIcon
// } from 'lucide-react';

// // ==================== CONSTANTS ====================
// const SECTIONS = [
//     { 
//         id: 'basic', 
//         title: 'Basic Information', 
//         icon: User, 
//         color: appTheme.colors.primary,
//         description: 'Professional details and business information'
//     },
//     { 
//         id: 'contact', 
//         title: 'Contact Information', 
//         icon: Phone, 
//         color: appTheme.colors.secondary,
//         description: 'Contact details and service areas'
//     },
//     { 
//         id: 'working', 
//         title: 'Working Hours', 
//         icon: Clock, 
//         color: appTheme.colors.warning,
//         description: 'Availability and schedule'
//     },
//     { 
//         id: 'settings', 
//         title: 'Settings & Policies', 
//         icon: Settings, 
//         color: appTheme.colors.success,
//         description: 'Booking settings and cancellation policies'
//     },
//     { 
//         id: 'documents', 
//         title: 'Documents', 
//         icon: FileText, 
//         color: appTheme.colors.info,
//         description: 'Verification documents and certifications'
//     }
// ];

// const CATEGORIES = [
//     { value: 'beauty', label: 'Beauty & Spa', icon: '💅', color: '#ec4899' },
//     { value: 'health', label: 'Health & Wellness', icon: '🏥', color: '#10b981' },
//     { value: 'consulting', label: 'Consulting', icon: '💼', color: '#3b82f6' },
//     { value: 'repair', label: 'Repair & Maintenance', icon: '🔧', color: '#f59e0b' },
//     { value: 'education', label: 'Education & Training', icon: '📚', color: '#8b5cf6' },
//     { value: 'fitness', label: 'Fitness', icon: '💪', color: '#ef4444' },
//     { value: 'other', label: 'Other', icon: '📌', color: '#6b7280' }
// ];

// const PROFESSIONAL_TYPES = [
//     { value: 'individual', label: 'Individual', icon: '👤', color: '#3b82f6' },
//     { value: 'company', label: 'Company', icon: '🏢', color: '#8b5cf6' },
//     { value: 'freelancer', label: 'Freelancer', icon: '🆓', color: '#10b981' },
//     { value: 'agency', label: 'Agency', icon: '🤝', color: '#f59e0b' }
// ];

// const SERVICE_TYPES = [
//     { value: 'onsite', label: 'Onsite Only', icon: '📍', color: '#3b82f6' },
//     { value: 'remote', label: 'Remote Only', icon: '💻', color: '#8b5cf6' },
//     { value: 'both', label: 'Both Onsite & Remote', icon: '🔄', color: '#10b981' },
//     { value: 'mobile', label: 'Mobile Service', icon: '🚗', color: '#f59e0b' }
// ];

// const CANCELLATION_POLICIES = [
//     { 
//         value: 'flexible', 
//         label: 'Flexible', 
//         description: 'Full refund up to 24 hours before booking',
//         icon: '🔄',
//         color: '#10b981'
//     },
//     { 
//         value: 'moderate', 
//         label: 'Moderate', 
//         description: '50% refund up to 12 hours before booking',
//         icon: '⚖️',
//         color: '#f59e0b'
//     },
//     { 
//         value: 'strict', 
//         label: 'Strict', 
//         description: 'No refund within 24 hours',
//         icon: '🔒',
//         color: '#ef4444'
//     }
// ];

// const DAYS = [
//     { value: 'monday', label: 'Monday' },
//     { value: 'tuesday', label: 'Tuesday' },
//     { value: 'wednesday', label: 'Wednesday' },
//     { value: 'thursday', label: 'Thursday' },
//     { value: 'friday', label: 'Friday' },
//     { value: 'saturday', label: 'Saturday' },
//     { value: 'sunday', label: 'Sunday' }
// ];

// export default function CreateBookingmngPage() {
//     const router = useRouter();
    
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);
//     // const [users, setUsers] = useState([]); // REMOVED - User selection no longer needed
//     const [expandedSections, setExpandedSections] = useState(['basic']);
//     const [activeTab, setActiveTab] = useState('basic');
//     const [toast, setToast] = useState({ show: false, type: '', message: '' });
//     const [isMobile, setIsMobile] = useState(false);
    
//     const [formData, setFormData] = useState({
//         // userId: '', // REMOVED - User selection removed
//         businessName: '',
//         tagline: '',
//         type: 'individual',
//         category: 'beauty',
//         specialization: [],
//         experience: 0,
        
//         // Contact
//         phone: '',
//         email: '',
//         address: {
//             street: '',
//             city: '',
//             state: '',
//             zipCode: '',
//             country: ''
//         },
//         serviceType: 'both',
        
//         // Working Hours
//         workingHours: [
//             { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//             { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//             { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//             { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//             { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//             { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
//             { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false }
//         ],
        
//         // Service Areas
//         serviceAreas: [''],
        
//         // WhatsApp
//         whatsappBusinessId: '',
//         autoReplyEnabled: false,
//         autoReplyMessage: 'Hello! Thank you for your message. Our team will get back to you soon.',
        
//         // Settings
//         bookingBuffer: 15,
//         maxDailyBookings: 10,
//         cancellationPolicy: 'moderate',
//         isVerified: false,
//         isFeatured: false,
        
//         // Documents
//         documents: {
//             idProof: '',
//             qualificationProof: '',
//             license: ''
//         },
        
//         // Social Media
//         socialMedia: {
//             website: '',
//             facebook: '',
//             instagram: '',
//             linkedin: ''
//         }
//     });

//     const [specializationInput, setSpecializationInput] = useState('');
//     const [errors, setErrors] = useState({});

//     // Mobile detection
//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 768);
//         };
        
//         checkMobile();
        
//         let resizeTimeout;
//         const handleResize = () => {
//             clearTimeout(resizeTimeout);
//             resizeTimeout = setTimeout(checkMobile, 150);
//         };
        
//         window.addEventListener('resize', handleResize);
//         return () => {
//             window.removeEventListener('resize', handleResize);
//             clearTimeout(resizeTimeout);
//         };
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

//     // REMOVED: fetchUsers function - No longer needed
//     // const fetchUsers = async () => { ... }

//     // REMOVED: useEffect for fetching users
//     // useEffect(() => { fetchUsers(); }, []);

//     const showToast = (type, message) => {
//         setToast({ show: true, type, message });
//     };

//     // Toggle section expansion
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

//     // Handle form input changes
//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
        
//         if (name.includes('.')) {
//             const [parent, child] = name.split('.');
//             setFormData(prev => ({
//                 ...prev,
//                 [parent]: {
//                     ...prev[parent],
//                     [child]: value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: type === 'checkbox' ? checked : value
//             }));
//         }
        
//         // Clear error for this field if it exists
//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: ''
//             }));
//         }
//     };

//     // Handle social media changes
//     const handleSocialChange = (platform, value) => {
//         setFormData(prev => ({
//             ...prev,
//             socialMedia: {
//                 ...prev.socialMedia,
//                 [platform]: value
//             }
//         }));
//     };

//     // Handle working hours changes
//     const handleWorkingHoursChange = (index, field, value) => {
//         const updatedHours = [...formData.workingHours];
//         updatedHours[index] = { ...updatedHours[index], [field]: value };
//         setFormData(prev => ({ ...prev, workingHours: updatedHours }));
//     };

//     // Toggle all working days
//     const toggleAllDays = (available) => {
//         const updatedHours = formData.workingHours.map(day => ({
//             ...day,
//             isAvailable: available
//         }));
//         setFormData(prev => ({ ...prev, workingHours: updatedHours }));
//         showToast('success', `All days ${available ? 'opened' : 'closed'}`);
//     };

//     // Handle specialization input
//     const handleAddSpecialization = () => {
//         if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
//             setFormData(prev => ({
//                 ...prev,
//                 specialization: [...prev.specialization, specializationInput.trim()]
//             }));
//             setSpecializationInput('');
//             showToast('success', 'Specialization added');
//         }
//     };

//     const handleRemoveSpecialization = (index) => {
//         setFormData(prev => ({
//             ...prev,
//             specialization: prev.specialization.filter((_, i) => i !== index)
//         }));
//         showToast('success', 'Specialization removed');
//     };

//     // Handle service areas
//     const handleServiceAreaChange = (index, value) => {
//         const updatedAreas = [...formData.serviceAreas];
//         updatedAreas[index] = value;
//         setFormData(prev => ({ ...prev, serviceAreas: updatedAreas }));
//     };

//     const addServiceArea = () => {
//         setFormData(prev => ({ ...prev, serviceAreas: [...prev.serviceAreas, ''] }));
//     };

//     const removeServiceArea = (index) => {
//         if (formData.serviceAreas.length > 1) {
//             setFormData(prev => ({
//                 ...prev,
//                 serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
//             }));
//         }
//     };

//     // Validate form
//     const validateForm = () => {
//         const newErrors = {};

//         // REMOVED: userId validation
//         // if (!formData.userId) {
//         //     newErrors.userId = 'Please select a user';
//         // }

//         if (!formData.businessName.trim()) {
//             newErrors.businessName = 'Business name is required';
//         }

//         if (!formData.phone.trim()) {
//             newErrors.phone = 'Phone number is required';
//         } else {
//             const digits = formData.phone.replace(/\D/g, '');
//             if (digits.length < 10) {
//                 newErrors.phone = 'Enter a valid phone number (10 digits)';
//             }
//         }

//         if (!formData.email.trim()) {
//             newErrors.email = 'Email address is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             newErrors.email = 'Please enter a valid email';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             showToast('error', 'Please fix the errors before submitting');
//             const firstError = Object.keys(errors)[0];
//             if (firstError) {
//                 const element = document.getElementById(firstError);
//                 if (element) {
//                     element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                 }
//             }
//             return;
//         }

//         setSaving(true);

//         try {
//             // Filter out empty service areas
//             const filteredServiceAreas = formData.serviceAreas.filter(area => area && area.trim() !== '');
            
//             const payload = {
//                 ...formData,
//                 serviceAreas: filteredServiceAreas,
//                 createdAt: new Date().toISOString(),
//                 verificationStatus: 'pending',
//                 isActive: true,
//                 rating: { 
//                     average: 0, 
//                     totalReviews: 0, 
//                     breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
//                 },
//                 totalBookings: 0,
//                 completedBookings: 0
//             };

//             const res = await fetch('/api/bookingService/bookingmng', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });

//             const data = await res.json();

//             if (data.success) {
//                 showToast('success', 'Professional created successfully!');
//                 // If there's a temporary password for new user, show it
//                 if (data.tempPassword) {
//                     setTimeout(() => {
//                         alert(`New user created!\nEmail: ${formData.email}\nTemporary Password: ${data.tempPassword}\n\nPlease share this with the professional.`);
//                     }, 500);
//                 }
//                 setTimeout(() => router.push('/admin/bookingService/bookingmng'), 1500);
//             } else {
//                 showToast('error', `Error: ${data.error || 'Failed to create professional'}`);
//             }
//         } catch (error) {
//             console.error('Error creating professional:', error);
//             showToast('error', 'Failed to create professional. Please try again.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <div className="loading-grid">
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                 </div>
//                 <p className="loading-text">Loading...</p>
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

//     return (
//         <>
//             <Head>
//                 <title>Add New Professional | LFMS</title>
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//             </Head>

//             <div className="create-professional-page">
//                 {/* Toast Notification */}
//                 {toast.show && (
//                     <div className={`toast-notification ${toast.type}`}>
//                         {toast.type === 'success' ? <CheckCircle size={20} /> : 
//                          toast.type === 'error' ? <AlertCircle size={20} /> : 
//                          <AlertTriangle size={20} />}
//                         <span>{toast.message}</span>
//                     </div>
//                 )}

//                 {/* Header */}
//                 <header className="page-header">
//                     <div className="header-content">
//                         <div className="header-left">
//                             <Link href="/admin/bookingService/bookingmng" className="back-button">
//                                 <ArrowLeft size={20} />
//                                 <span>Back to Professionals</span>
//                             </Link>
//                             <h1 className="page-title">
//                                 <User size={28} className="title-icon" />
//                                 Add New Professional
//                             </h1>
//                             <p className="page-description">
//                                 Create a new service provider with complete details
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
//                                 onClick={handleSubmit}
//                                 disabled={saving}
//                                 className="save-button"
//                             >
//                                 {saving ? (
//                                     <>
//                                         <div className="button-spinner"></div>
//                                         <span>Creating...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save size={16} />
//                                         <span>Create Professional</span>
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
//                                             {/* Basic Information */}
//                                             {section.id === 'basic' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <User size={16} />
//                                                             Professional Details
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             {/* REMOVED: User Selection Dropdown */}
//                                                             {/* <div className="form-field span-2">
//                                                                 <label>Select User <span className="required">*</span></label>
//                                                                 <select ...>
//                                                                     ...
//                                                                 </select>
//                                                             </div> */}

//                                                             <div className="form-field span-2">
//                                                                 <label>Business Name <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="businessName"
//                                                                     id="businessName"
//                                                                     value={formData.businessName}
//                                                                     onChange={handleChange}
//                                                                     className={errors.businessName ? 'error' : ''}
//                                                                     placeholder="e.g., John's Beauty Salon"
//                                                                 />
//                                                                 {errors.businessName && <span className="error-text">{errors.businessName}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Tagline</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="tagline"
//                                                                     value={formData.tagline}
//                                                                     onChange={handleChange}
//                                                                     placeholder="Brief description of your business"
//                                                                 />
//                                                                 <span className="hint">A short, catchy description</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Briefcase size={16} />
//                                                             Classification
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Professional Type <span className="required">*</span></label>
//                                                                 <div className="type-cards">
//                                                                     {PROFESSIONAL_TYPES.map(type => (
//                                                                         <label 
//                                                                             key={type.value} 
//                                                                             className={`type-card ${formData.type === type.value ? 'selected' : ''}`}
//                                                                             style={{ 
//                                                                                 borderColor: formData.type === type.value ? type.color : appTheme.colors.border,
//                                                                                 background: formData.type === type.value ? `${type.color}10` : 'white'
//                                                                             }}
//                                                                         >
//                                                                             <input
//                                                                                 type="radio"
//                                                                                 name="type"
//                                                                                 value={type.value}
//                                                                                 checked={formData.type === type.value}
//                                                                                 onChange={handleChange}
//                                                                             />
//                                                                             <span className="type-icon">{type.icon}</span>
//                                                                             <span className="type-label">{type.label}</span>
//                                                                         </label>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Category <span className="required">*</span></label>
//                                                                 <div className="category-cards">
//                                                                     {CATEGORIES.map(cat => (
//                                                                         <label 
//                                                                             key={cat.value} 
//                                                                             className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}
//                                                                             style={{ 
//                                                                                 borderColor: formData.category === cat.value ? cat.color : appTheme.colors.border,
//                                                                                 background: formData.category === cat.value ? `${cat.color}10` : 'white'
//                                                                             }}
//                                                                         >
//                                                                             <input
//                                                                                 type="radio"
//                                                                                 name="category"
//                                                                                 value={cat.value}
//                                                                                 checked={formData.category === cat.value}
//                                                                                 onChange={handleChange}
//                                                                             />
//                                                                             <span className="category-icon">{cat.icon}</span>
//                                                                             <span className="category-label">{cat.label}</span>
//                                                                         </label>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Experience (years)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="experience"
//                                                                     value={formData.experience}
//                                                                     onChange={handleChange}
//                                                                     min="0"
//                                                                     max="50"
//                                                                     className="form-input"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Specializations</label>
//                                                                 <div className="specialization-group">
//                                                                     <div className="specialization-input">
//                                                                         <input
//                                                                             type="text"
//                                                                             value={specializationInput}
//                                                                             onChange={(e) => setSpecializationInput(e.target.value)}
//                                                                             placeholder="Add specialization"
//                                                                             onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
//                                                                         />
//                                                                         <button 
//                                                                             type="button" 
//                                                                             onClick={handleAddSpecialization} 
//                                                                             className="add-btn"
//                                                                         >
//                                                                             <Plus size={16} />
//                                                                             Add
//                                                                         </button>
//                                                                     </div>
//                                                                     <div className="tags">
//                                                                         {formData.specialization.map((spec, index) => (
//                                                                             <span key={index} className="tag">
//                                                                                 {spec}
//                                                                                 <button type="button" onClick={() => handleRemoveSpecialization(index)}>×</button>
//                                                                             </span>
//                                                                         ))}
//                                                                         {formData.specialization.length === 0 && (
//                                                                             <span className="no-tags">No specializations added</span>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Contact Information */}
//                                             {section.id === 'contact' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Phone size={16} />
//                                                             Contact Details
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Phone <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="tel"
//                                                                     name="phone"
//                                                                     id="phone"
//                                                                     value={formData.phone}
//                                                                     onChange={handleChange}
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
//                                                                     id="email"
//                                                                     value={formData.email}
//                                                                     onChange={handleChange}
//                                                                     className={errors.email ? 'error' : ''}
//                                                                     placeholder="professional@example.com"
//                                                                 />
//                                                                 {errors.email && <span className="error-text">{errors.email}</span>}
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <MapPin size={16} />
//                                                             Address
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Street</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="address.street"
//                                                                     value={formData.address.street}
//                                                                     onChange={handleChange}
//                                                                     placeholder="Street address"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>City</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="address.city"
//                                                                     value={formData.address.city}
//                                                                     onChange={handleChange}
//                                                                     placeholder="City"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>State</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="address.state"
//                                                                     value={formData.address.state}
//                                                                     onChange={handleChange}
//                                                                     placeholder="State"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>ZIP Code</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="address.zipCode"
//                                                                     value={formData.address.zipCode}
//                                                                     onChange={handleChange}
//                                                                     placeholder="ZIP Code"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Country</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="address.country"
//                                                                     value={formData.address.country}
//                                                                     onChange={handleChange}
//                                                                     placeholder="Country"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Globe size={16} />
//                                                             Service Configuration
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Service Type <span className="required">*</span></label>
//                                                                 <div className="service-cards">
//                                                                     {SERVICE_TYPES.map(type => (
//                                                                         <label 
//                                                                             key={type.value} 
//                                                                             className={`service-card ${formData.serviceType === type.value ? 'selected' : ''}`}
//                                                                             style={{ 
//                                                                                 borderColor: formData.serviceType === type.value ? type.color : appTheme.colors.border,
//                                                                                 background: formData.serviceType === type.value ? `${type.color}10` : 'white'
//                                                                             }}
//                                                                         >
//                                                                             <input
//                                                                                 type="radio"
//                                                                                 name="serviceType"
//                                                                                 value={type.value}
//                                                                                 checked={formData.serviceType === type.value}
//                                                                                 onChange={handleChange}
//                                                                             />
//                                                                             <span className="service-icon">{type.icon}</span>
//                                                                             <span className="service-label">{type.label}</span>
//                                                                         </label>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Service Areas</label>
//                                                                 <div className="service-areas">
//                                                                     {formData.serviceAreas.map((area, index) => (
//                                                                         <div key={index} className="service-area-input">
//                                                                             <input
//                                                                                 type="text"
//                                                                                 value={area}
//                                                                                 onChange={(e) => handleServiceAreaChange(index, e.target.value)}
//                                                                                 placeholder="e.g., Downtown"
//                                                                             />
//                                                                             {formData.serviceAreas.length > 1 && (
//                                                                                 <button 
//                                                                                     type="button" 
//                                                                                     onClick={() => removeServiceArea(index)} 
//                                                                                     className="remove-btn"
//                                                                                 >
//                                                                                     <Trash2 size={16} />
//                                                                                 </button>
//                                                                             )}
//                                                                         </div>
//                                                                     ))}
//                                                                     <button 
//                                                                         type="button" 
//                                                                         onClick={addServiceArea} 
//                                                                         className="add-area-btn"
//                                                                     >
//                                                                         <Plus size={16} /> Add Service Area
//                                                                     </button>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Globe2 size={16} />
//                                                             Social Media
//                                                         </h3>
//                                                         <div className="social-grid">
//                                                             <div className="form-field">
//                                                                 <label>Website</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     value={formData.socialMedia.website}
//                                                                     onChange={(e) => handleSocialChange('website', e.target.value)}
//                                                                     placeholder="https://example.com"
//                                                                 />
//                                                             </div>
//                                                             <div className="form-field">
//                                                                 <label>Facebook</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     value={formData.socialMedia.facebook}
//                                                                     onChange={(e) => handleSocialChange('facebook', e.target.value)}
//                                                                     placeholder="https://facebook.com/..."
//                                                                 />
//                                                             </div>
//                                                             <div className="form-field">
//                                                                 <label>Instagram</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     value={formData.socialMedia.instagram}
//                                                                     onChange={(e) => handleSocialChange('instagram', e.target.value)}
//                                                                     placeholder="https://instagram.com/..."
//                                                                 />
//                                                             </div>
//                                                             <div className="form-field">
//                                                                 <label>LinkedIn</label>
//                                                                 <input
//                                                                     type="url"
//                                                                     value={formData.socialMedia.linkedin}
//                                                                     onChange={(e) => handleSocialChange('linkedin', e.target.value)}
//                                                                     placeholder="https://linkedin.com/..."
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Working Hours */}
//                                             {section.id === 'working' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <div className="section-header">
//                                                             <h3>
//                                                                 <Clock size={16} />
//                                                                 Weekly Schedule
//                                                             </h3>
//                                                             <div className="quick-actions">
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() => toggleAllDays(true)}
//                                                                     className="quick-btn"
//                                                                     style={{ color: appTheme.colors.success }}
//                                                                 >
//                                                                     <CheckCircle size={14} />
//                                                                     Open All
//                                                                 </button>
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() => toggleAllDays(false)}
//                                                                     className="quick-btn"
//                                                                     style={{ color: appTheme.colors.error }}
//                                                                 >
//                                                                     <XCircle size={14} />
//                                                                     Close All
//                                                                 </button>
//                                                             </div>
//                                                         </div>

//                                                         <div className="hours-grid">
//                                                             {formData.workingHours.map((day, index) => (
//                                                                 <div key={day.day} className="hour-card">
//                                                                     <div className="hour-header">
//                                                                         <label className="day-check">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={day.isAvailable}
//                                                                                 onChange={(e) => handleWorkingHoursChange(index, 'isAvailable', e.target.checked)}
//                                                                             />
//                                                                             <span>{DAYS.find(d => d.value === day.day)?.label}</span>
//                                                                         </label>
//                                                                         {!day.isAvailable && (
//                                                                             <span className="closed-badge">Closed</span>
//                                                                         )}
//                                                                     </div>
//                                                                     {day.isAvailable && (
//                                                                         <div className="hour-times">
//                                                                             <input
//                                                                                 type="time"
//                                                                                 value={day.startTime}
//                                                                                 onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
//                                                                             />
//                                                                             <span>to</span>
//                                                                             <input
//                                                                                 type="time"
//                                                                                 value={day.endTime}
//                                                                                 onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
//                                                                             />
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Settings & Policies */}
//                                             {section.id === 'settings' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Settings size={16} />
//                                                             Booking Settings
//                                                         </h3>
//                                                         <div className="settings-grid">
//                                                             <div className="setting-card">
//                                                                 <div className="setting-header">
//                                                                     <Clock size={16} />
//                                                                     <span>Booking Buffer</span>
//                                                                 </div>
//                                                                 <div className="setting-control">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="bookingBuffer"
//                                                                         value={formData.bookingBuffer}
//                                                                         onChange={handleChange}
//                                                                         min="0"
//                                                                         max="120"
//                                                                     />
//                                                                     <span>minutes</span>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="setting-card">
//                                                                 <div className="setting-header">
//                                                                     <Calendar size={16} />
//                                                                     <span>Max Daily Bookings</span>
//                                                                 </div>
//                                                                 <div className="setting-control">
//                                                                     <input
//                                                                         type="number"
//                                                                         name="maxDailyBookings"
//                                                                         value={formData.maxDailyBookings}
//                                                                         onChange={handleChange}
//                                                                         min="1"
//                                                                         max="50"
//                                                                     />
//                                                                     <span>bookings</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Shield size={16} />
//                                                             Cancellation Policy
//                                                         </h3>
//                                                         <div className="policy-cards">
//                                                             {CANCELLATION_POLICIES.map(policy => (
//                                                                 <label 
//                                                                     key={policy.value} 
//                                                                     className={`policy-card ${formData.cancellationPolicy === policy.value ? 'selected' : ''}`}
//                                                                     style={{ 
//                                                                         borderColor: formData.cancellationPolicy === policy.value ? policy.color : appTheme.colors.border,
//                                                                         background: formData.cancellationPolicy === policy.value ? `${policy.color}10` : 'white'
//                                                                     }}
//                                                                 >
//                                                                     <input
//                                                                         type="radio"
//                                                                         name="cancellationPolicy"
//                                                                         value={policy.value}
//                                                                         checked={formData.cancellationPolicy === policy.value}
//                                                                         onChange={handleChange}
//                                                                     />
//                                                                     <span className="policy-icon">{policy.icon}</span>
//                                                                     <div className="policy-info">
//                                                                         <span className="policy-name">{policy.label}</span>
//                                                                         <span className="policy-desc">{policy.description}</span>
//                                                                     </div>
//                                                                 </label>
//                                                             ))}
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <MessageSquare size={16} />
//                                                             WhatsApp Integration
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>WhatsApp Business Number</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="whatsappBusinessId"
//                                                                     value={formData.whatsappBusinessId}
//                                                                     onChange={handleChange}
//                                                                     placeholder="Enter WhatsApp number"
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field checkbox-field span-2">
//                                                                 <label className="checkbox-label">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name="autoReplyEnabled"
//                                                                         checked={formData.autoReplyEnabled}
//                                                                         onChange={handleChange}
//                                                                     />
//                                                                     <span>Enable Auto-Reply</span>
//                                                                 </label>
//                                                             </div>

//                                                             {formData.autoReplyEnabled && (
//                                                                 <div className="form-field span-2">
//                                                                     <label>Auto-Reply Message</label>
//                                                                     <textarea
//                                                                         name="autoReplyMessage"
//                                                                         value={formData.autoReplyMessage}
//                                                                         onChange={handleChange}
//                                                                         rows="3"
//                                                                         placeholder="Enter auto-reply message"
//                                                                     />
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <ShieldCheck size={16} />
//                                                             Admin Settings
//                                                         </h3>
//                                                         <div className="admin-checks">
//                                                             <label className="checkbox-label">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     name="isVerified"
//                                                                     checked={formData.isVerified}
//                                                                     onChange={handleChange}
//                                                                 />
//                                                                 <span>Mark as Verified</span>
//                                                             </label>
//                                                             <label className="checkbox-label">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     name="isFeatured"
//                                                                     checked={formData.isFeatured}
//                                                                     onChange={handleChange}
//                                                                 />
//                                                                 <span>Feature this Professional</span>
//                                                             </label>
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Documents */}
//                                             {section.id === 'documents' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <FileText size={16} />
//                                                             Verification Documents
//                                                         </h3>
//                                                         <div className="docs-grid">
//                                                             <div className="doc-card">
//                                                                 <Award size={24} style={{ color: appTheme.colors.primary }} />
//                                                                 <div className="doc-info">
//                                                                     <h4>ID Proof</h4>
//                                                                     <p>Government ID</p>
//                                                                 </div>
//                                                                 <button type="button" className="upload-btn">
//                                                                     <Upload size={14} />
//                                                                     Upload
//                                                                 </button>
//                                                             </div>

//                                                             <div className="doc-card">
//                                                                 <Star size={24} style={{ color: appTheme.colors.secondary }} />
//                                                                 <div className="doc-info">
//                                                                     <h4>Qualification</h4>
//                                                                     <p>Certificates</p>
//                                                                 </div>
//                                                                 <button type="button" className="upload-btn">
//                                                                     <Upload size={14} />
//                                                                     Upload
//                                                                 </button>
//                                                             </div>

//                                                             <div className="doc-card">
//                                                                 <Shield size={24} style={{ color: appTheme.colors.warning }} />
//                                                                 <div className="doc-info">
//                                                                     <h4>License</h4>
//                                                                     <p>Business license</p>
//                                                                 </div>
//                                                                 <button type="button" className="upload-btn">
//                                                                     <Upload size={14} />
//                                                                     Upload
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="info-box">
//                                                         <Info size={20} />
//                                                         <p>
//                                                             <strong>Note:</strong> Documents are required for verification. Upload clear copies of each document.
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
//                         onClick={handleSubmit}
//                         disabled={saving}
//                         className="mobile-save-btn"
//                     >
//                         {saving ? (
//                             <div className="button-spinner"></div>
//                         ) : (
//                             <>
//                                 <Save size={18} />
//                                 <span>Create Professional</span>
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             <style jsx>{`
//                 /* ==================== GLOBAL STYLES ==================== */
//                 .create-professional-page {
//                     min-height: 100vh;
//                     background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                     font-family: ${appTheme.fonts.primary};
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
//                     border-left: 4px solid ${appTheme.colors.success};
//                 }

//                 .toast-notification.error {
//                     border-left: 4px solid ${appTheme.colors.error};
//                 }

//                 .toast-notification.warning {
//                     border-left: 4px solid ${appTheme.colors.warning};
//                 }

//                 .toast-notification.success svg {
//                     color: ${appTheme.colors.success};
//                 }

//                 .toast-notification.error svg {
//                     color: ${appTheme.colors.error};
//                 }

//                 .toast-notification.warning svg {
//                     color: ${appTheme.colors.warning};
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
//                     border-bottom: 1px solid ${appTheme.colors.border};
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
//                     gap: 8px;
//                 }

//                 .back-button {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     background: none;
//                     border: none;
//                     color: ${appTheme.colors.primary};
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     padding: 4px 0;
//                     transition: opacity 0.2s;
//                     width: fit-content;
//                     text-decoration: none;
//                 }

//                 .back-button:hover {
//                     opacity: 0.7;
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
//                     color: ${appTheme.colors.primary};
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
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     color: #64748b;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .header-action-btn:hover {
//                     background: #f1f5f9;
//                     color: ${appTheme.colors.primary};
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .save-button {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 10px 20px;
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
//                 }

//                 .save-button:hover {
//                     background: #2563eb;
//                     transform: translateY(-1px);
//                     box-shadow: 0 6px 16px ${appTheme.colors.primary}40;
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
//                     border-top: 1px solid ${appTheme.colors.border};
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
//                     border-bottom: 1px dashed ${appTheme.colors.border};
//                 }

//                 .form-block h3 svg {
//                     color: ${appTheme.colors.primary};
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
//                     width: 100%;
//                     padding: 10px 14px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     font-size: 0.938rem;
//                     transition: all 0.2s ease;
//                     background: white;
//                     font-family: ${appTheme.fonts.primary};
//                 }

//                 .form-field input:focus,
//                 .form-field select:focus,
//                 .form-field textarea:focus {
//                     outline: none;
//                     border-color: ${appTheme.colors.primary};
//                     box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
//                 }

//                 .form-field input.error,
//                 .form-field select.error,
//                 .form-field textarea.error {
//                     border-color: ${appTheme.colors.error};
//                 }

//                 .error-text {
//                     font-size: 0.688rem;
//                     color: ${appTheme.colors.error};
//                 }

//                 .required {
//                     color: ${appTheme.colors.error};
//                 }

//                 .hint {
//                     font-size: 0.688rem;
//                     color: #94a3b8;
//                 }

//                 /* ==================== TYPE CARDS ==================== */
//                 .type-cards {
//                     display: grid;
//                     grid-template-columns: repeat(4, 1fr);
//                     gap: 8px;
//                 }

//                 @media (max-width: 640px) {
//                     .type-cards {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 .type-card {
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 12px;
//                     background: white;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .type-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .type-card.selected {
//                     background: ${appTheme.colors.primary}10;
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .type-icon {
//                     font-size: 1.5rem;
//                 }

//                 .type-label {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #1e293b;
//                 }

//                 /* ==================== CATEGORY CARDS ==================== */
//                 .category-cards {
//                     display: grid;
//                     grid-template-columns: repeat(4, 1fr);
//                     gap: 8px;
//                 }

//                 @media (max-width: 1024px) {
//                     .category-cards {
//                         grid-template-columns: repeat(3, 1fr);
//                     }
//                 }

//                 @media (max-width: 640px) {
//                     .category-cards {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 .category-card {
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 12px;
//                     background: white;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .category-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .category-card.selected {
//                     background: ${appTheme.colors.primary}10;
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .category-icon {
//                     font-size: 1.5rem;
//                 }

//                 .category-label {
//                     font-size: 0.7rem;
//                     font-weight: 500;
//                     color: #1e293b;
//                     text-align: center;
//                 }

//                 /* ==================== SERVICE CARDS ==================== */
//                 .service-cards {
//                     display: grid;
//                     grid-template-columns: repeat(4, 1fr);
//                     gap: 8px;
//                 }

//                 @media (max-width: 640px) {
//                     .service-cards {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 .service-card {
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 12px;
//                     background: white;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .service-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .service-card.selected {
//                     background: ${appTheme.colors.primary}10;
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .service-icon {
//                     font-size: 1.5rem;
//                 }

//                 .service-label {
//                     font-size: 0.7rem;
//                     font-weight: 500;
//                     color: #1e293b;
//                     text-align: center;
//                 }

//                 /* ==================== SPECIALIZATION ==================== */
//                 .specialization-group {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 8px;
//                 }

//                 .specialization-input {
//                     display: flex;
//                     gap: 6px;
//                 }

//                 .add-btn {
//                     display: flex;
//                     align-items: center;
//                     gap: 4px;
//                     padding: 0 12px;
//                     background: ${appTheme.colors.primary}10;
//                     border: 1px solid ${appTheme.colors.primary}30;
//                     border-radius: 8px;
//                     color: ${appTheme.colors.primary};
//                     font-size: 0.85rem;
//                     white-space: nowrap;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .add-btn:hover {
//                     background: ${appTheme.colors.primary}20;
//                 }

//                 .tags {
//                     display: flex;
//                     flex-wrap: wrap;
//                     gap: 6px;
//                 }

//                 .tag {
//                     display: inline-flex;
//                     align-items: center;
//                     gap: 4px;
//                     padding: 4px 8px;
//                     background: ${appTheme.colors.primary}10;
//                     border: 1px solid ${appTheme.colors.primary}30;
//                     border-radius: 20px;
//                     font-size: 0.8rem;
//                     color: ${appTheme.colors.primary};
//                 }

//                 .tag button {
//                     border: none;
//                     background: transparent;
//                     color: ${appTheme.colors.primary};
//                     cursor: pointer;
//                     font-size: 1rem;
//                     padding: 0;
//                 }

//                 .no-tags {
//                     color: #94a3b8;
//                     font-size: 0.8rem;
//                 }

//                 /* ==================== SERVICE AREAS ==================== */
//                 .service-areas {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 6px;
//                 }

//                 .service-area-input {
//                     display: flex;
//                     gap: 6px;
//                 }

//                 .remove-btn {
//                     padding: 0 8px;
//                     background: ${appTheme.colors.error}10;
//                     border: 1px solid ${appTheme.colors.error}30;
//                     border-radius: 8px;
//                     color: ${appTheme.colors.error};
//                     cursor: pointer;
//                 }

//                 .add-area-btn {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 4px;
//                     padding: 8px;
//                     background: white;
//                     border: 1px dashed ${appTheme.colors.border};
//                     border-radius: 8px;
//                     color: #64748b;
//                     font-size: 0.85rem;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .add-area-btn:hover {
//                     border-color: ${appTheme.colors.primary};
//                     color: ${appTheme.colors.primary};
//                 }

//                 /* ==================== SOCIAL GRID ==================== */
//                 .social-grid {
//                     display: grid;
//                     grid-template-columns: repeat(2, 1fr);
//                     gap: 12px;
//                 }

//                 @media (max-width: 640px) {
//                     .social-grid {
//                         grid-template-columns: 1fr;
//                     }
//                 }

//                 /* ==================== WORKING HOURS ==================== */
//                 .section-header {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     margin-bottom: 16px;
//                 }

//                 .quick-actions {
//                     display: flex;
//                     gap: 8px;
//                 }

//                 .quick-btn {
//                     display: flex;
//                     align-items: center;
//                     gap: 4px;
//                     padding: 6px 12px;
//                     background: #f1f5f9;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 20px;
//                     font-size: 0.75rem;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .quick-btn:hover {
//                     background: #e2e8f0;
//                 }

//                 .hours-grid {
//                     display: grid;
//                     grid-template-columns: repeat(2, 1fr);
//                     gap: 12px;
//                 }

//                 @media (max-width: 640px) {
//                     .hours-grid {
//                         grid-template-columns: 1fr;
//                     }
//                 }

//                 .hour-card {
//                     padding: 12px;
//                     background: #f8fafc;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                 }

//                 .hour-header {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     margin-bottom: 8px;
//                 }

//                 .day-check {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                 }

//                 .closed-badge {
//                     font-size: 0.625rem;
//                     padding: 2px 6px;
//                     background: #f1f5f9;
//                     border-radius: 4px;
//                     color: #64748b;
//                 }

//                 .hour-times {
//                     display: flex;
//                     align-items: center;
//                     gap: 6px;
//                 }

//                 .hour-times input {
//                     flex: 1;
//                     padding: 6px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     font-size: 0.8rem;
//                 }

//                 .hour-times span {
//                     color: #64748b;
//                     font-size: 0.7rem;
//                 }

//                 /* ==================== SETTINGS GRID ==================== */
//                 .settings-grid {
//                     display: grid;
//                     grid-template-columns: repeat(2, 1fr);
//                     gap: 12px;
//                 }

//                 @media (max-width: 640px) {
//                     .settings-grid {
//                         grid-template-columns: 1fr;
//                     }
//                 }

//                 .setting-card {
//                     padding: 12px;
//                     background: #f8fafc;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                 }

//                 .setting-header {
//                     display: flex;
//                     align-items: center;
//                     gap: 6px;
//                     margin-bottom: 8px;
//                     color: #475569;
//                     font-size: 0.813rem;
//                     font-weight: 500;
//                 }

//                 .setting-control {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                 }

//                 .setting-control input {
//                     width: 80px;
//                     padding: 6px 8px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     text-align: center;
//                 }

//                 .setting-control span {
//                     font-size: 0.75rem;
//                     color: #64748b;
//                 }

//                 /* ==================== POLICY CARDS ==================== */
//                 .policy-cards {
//                     display: grid;
//                     grid-template-columns: repeat(3, 1fr);
//                     gap: 12px;
//                 }

//                 @media (max-width: 640px) {
//                     .policy-cards {
//                         grid-template-columns: 1fr;
//                     }
//                 }

//                 .policy-card {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 12px;
//                     background: white;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .policy-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .policy-card.selected {
//                     background: ${appTheme.colors.primary}10;
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .policy-icon {
//                     font-size: 1.5rem;
//                 }

//                 .policy-info {
//                     flex: 1;
//                 }

//                 .policy-name {
//                     display: block;
//                     font-size: 0.813rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                 }

//                 .policy-desc {
//                     display: block;
//                     font-size: 0.688rem;
//                     color: #64748b;
//                 }

//                 /* ==================== ADMIN CHECKS ==================== */
//                 .admin-checks {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 8px;
//                 }

//                 /* ==================== DOCUMENTS ==================== */
//                 .docs-grid {
//                     display: grid;
//                     grid-template-columns: repeat(3, 1fr);
//                     gap: 12px;
//                     margin-bottom: 16px;
//                 }

//                 @media (max-width: 640px) {
//                     .docs-grid {
//                         grid-template-columns: 1fr;
//                     }
//                 }

//                 .doc-card {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     padding: 12px;
//                     background: #f8fafc;
//                     border: 1px dashed ${appTheme.colors.border};
//                     border-radius: 8px;
//                 }

//                 .doc-info {
//                     flex: 1;
//                 }

//                 .doc-info h4 {
//                     font-size: 0.875rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0 0 2px 0;
//                 }

//                 .doc-info p {
//                     font-size: 0.688rem;
//                     color: #64748b;
//                     margin: 0;
//                 }

//                 .upload-btn {
//                     display: flex;
//                     align-items: center;
//                     gap: 4px;
//                     padding: 6px 10px;
//                     background: white;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     font-size: 0.688rem;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .upload-btn:hover {
//                     border-color: ${appTheme.colors.primary};
//                     color: ${appTheme.colors.primary};
//                 }

//                 /* ==================== INFO BOX ==================== */
//                 .info-box {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     padding: 16px;
//                     background: #eef2ff;
//                     border: 1px solid ${appTheme.colors.primary}30;
//                     border-radius: 8px;
//                 }

//                 .info-box svg {
//                     flex-shrink: 0;
//                     color: ${appTheme.colors.primary};
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
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
//                     font-size: 1rem;
//                     font-weight: 600;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     box-shadow: 0 4px 20px ${appTheme.colors.primary}40;
//                 }

//                 .mobile-save-btn:disabled {
//                     opacity: 0.6;
//                     cursor: not-allowed;
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

//                     .stats-grid {
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

//                     .form-field input,
//                     .form-field select,
//                     .form-field textarea {
//                         font-size: 16px;
//                         min-height: 48px;
//                     }

//                     .type-card,
//                     .category-card,
//                     .service-card {
//                         padding: 8px;
//                     }

//                     .hour-card {
//                         padding: 10px;
//                     }

//                     .policy-card {
//                         padding: 10px;
//                     }

//                     .doc-card {
//                         padding: 10px;
//                     }
//                 }

//                 @media (max-width: 480px) {
//                     .main-content {
//                         padding: 16px 16px 90px 16px;
//                     }

//                     .stats-grid {
//                         display: none;
//                     }

//                     .quick-actions {
//                         flex-direction: column;
//                     }

//                     .quick-btn {
//                         width: 100%;
//                         justify-content: center;
//                     }

//                     .hour-times {
//                         flex-direction: column;
//                     }

//                     .hour-times input {
//                         width: 100%;
//                     }
//                 }
//             `}</style>
//         </>
//     );
// }



























'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../../../../context/AuthContext';
import {
    ArrowLeft, Save, User, Building, Mail, Phone,
    MapPin, Briefcase, Clock, Globe, Shield, Plus,
    Trash2, CheckCircle, XCircle, AlertCircle, ChevronRight,
    Settings, Users, FileText, Award, Star, Calendar,
    Info, AlertTriangle, Loader2, Camera,
    Building2, Shield as ShieldIcon, Layers, Layout,
    MessageSquare, ShieldCheck, Globe2, Facebook,
    Instagram, Twitter, Youtube, Linkedin
} from 'lucide-react';

// ==================== CONSTANTS ====================
const SECTIONS = [
    { 
        id: 'basic', 
        title: 'Basic Information', 
        icon: User, 
        color: '#3b82f6',
        description: 'Professional details and business information'
    },
    { 
        id: 'contact', 
        title: 'Contact Information', 
        icon: Phone, 
        color: '#10b981',
        description: 'Contact details and service areas'
    },
    { 
        id: 'working', 
        title: 'Working Hours', 
        icon: Clock, 
        color: '#f59e0b',
        description: 'Availability and schedule'
    },
    { 
        id: 'settings', 
        title: 'Settings & Policies', 
        icon: Settings, 
        color: '#8b5cf6',
        description: 'Booking settings and cancellation policies'
    },
    { 
        id: 'documents', 
        title: 'Documents', 
        icon: FileText, 
        color: '#06b6d4',
        description: 'Verification documents and certifications'
    }
];

const CATEGORIES = [
    { value: 'beauty', label: 'Beauty & Spa', icon: '💅', color: '#ec4899' },
    { value: 'health', label: 'Health & Wellness', icon: '🏥', color: '#10b981' },
    { value: 'consulting', label: 'Consulting', icon: '💼', color: '#3b82f6' },
    { value: 'repair', label: 'Repair & Maintenance', icon: '🔧', color: '#f59e0b' },
    { value: 'education', label: 'Education & Training', icon: '📚', color: '#8b5cf6' },
    { value: 'fitness', label: 'Fitness', icon: '💪', color: '#ef4444' },
    { value: 'other', label: 'Other', icon: '📌', color: '#6b7280' }
];

const PROFESSIONAL_TYPES = [
    { value: 'individual', label: 'Individual', icon: '👤', color: '#3b82f6' },
    { value: 'company', label: 'Company', icon: '🏢', color: '#8b5cf6' },
    { value: 'freelancer', label: 'Freelancer', icon: '🆓', color: '#10b981' },
    { value: 'agency', label: 'Agency', icon: '🤝', color: '#f59e0b' }
];

const SERVICE_TYPES = [
    { value: 'onsite', label: 'Onsite Only', icon: '📍', color: '#3b82f6' },
    { value: 'remote', label: 'Remote Only', icon: '💻', color: '#8b5cf6' },
    { value: 'both', label: 'Both Onsite & Remote', icon: '🔄', color: '#10b981' },
    { value: 'mobile', label: 'Mobile Service', icon: '🚗', color: '#f59e0b' }
];

const CANCELLATION_POLICIES = [
    { 
        value: 'flexible', 
        label: 'Flexible', 
        description: 'Full refund up to 24 hours before booking',
        icon: '🔄',
        color: '#10b981'
    },
    { 
        value: 'moderate', 
        label: 'Moderate', 
        description: '50% refund up to 12 hours before booking',
        icon: '⚖️',
        color: '#f59e0b'
    },
    { 
        value: 'strict', 
        label: 'Strict', 
        description: 'No refund within 24 hours',
        icon: '🔒',
        color: '#ef4444'
    }
];

const DAYS = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
];

export default function CreateBookingmngPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const professionalId = searchParams.get('id');
    const isEditing = !!professionalId;
    
    const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
    
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState(['basic']);
    const [activeTab, setActiveTab] = useState('basic');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [apiError, setApiError] = useState(null);
    
    const [formData, setFormData] = useState({
        businessName: '',
        tagline: '',
        type: 'individual',
        category: 'beauty',
        specialization: [],
        experience: 0,
        
        // Contact
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        },
        serviceType: 'both',
        
        // Working Hours
        workingHours: [
            { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
            { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
            { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
            { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
            { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
            { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] },
            { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }
        ],
        
        // Service Areas
        serviceAreas: [''],
        
        // WhatsApp
        whatsappBusinessId: '',
        autoReplyEnabled: false,
        autoReplyMessage: 'Hello! Thank you for your message. Our team will get back to you soon.',
        
        // Settings
        bookingBuffer: 15,
        maxDailyBookings: 10,
        cancellationPolicy: 'moderate',
        isVerified: false,
        isFeatured: false,
        
        // Documents
        documents: {
            idProof: '',
            qualificationProof: '',
            license: ''
        },
        
        // Social Media
        socialMedia: {
            website: '',
            facebook: '',
            instagram: '',
            linkedin: ''
        }
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (!isCompanyAdmin && !isSuperAdmin) {
            router.push('/dashboard');
        }
    }, [user, isCompanyAdmin, isSuperAdmin, router]);

    // Fetch professional data if editing
    useEffect(() => {
        if (isEditing && user?.companyId && professionalId) {
            fetchProfessional();
        }
    }, [isEditing, professionalId, user]);

    const fetchProfessional = async () => {
        try {
            setLoading(true);
            
            const query = new URLSearchParams({
                companyId: user.companyId,
                limit: '100'
            }).toString();
            
            const res = await fetch(`/api/bookingService/bookingmng?${query}`, {
                headers: getAuthHeaders()
            });
            
            if (!res.ok) {
                throw new Error('Failed to fetch professional');
            }
            
            const data = await res.json();
            
            if (data.success) {
                const professional = data.data.find(p => p._id === professionalId);
                if (professional) {
                    setFormData({
                        businessName: professional.businessName || '',
                        tagline: professional.tagline || '',
                        type: professional.type || 'individual',
                        category: professional.category || 'beauty',
                        specialization: professional.specialization || [],
                        experience: professional.experience || 0,
                        
                        phone: professional.phone || '',
                        email: professional.email || '',
                        address: professional.address || {
                            street: '', city: '', state: '', zipCode: '', country: 'India'
                        },
                        serviceType: professional.serviceType || 'both',
                        
                        workingHours: professional.workingHours || [
                            { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] },
                            { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }
                        ],
                        
                        serviceAreas: professional.serviceAreas?.length ? professional.serviceAreas : [''],
                        
                        whatsappBusinessId: professional.whatsappBusinessId || '',
                        autoReplyEnabled: professional.autoReplyEnabled || false,
                        autoReplyMessage: professional.autoReplyMessage || 'Hello! Thank you for your message. Our team will get back to you soon.',
                        
                        bookingBuffer: professional.bookingBuffer || 15,
                        maxDailyBookings: professional.maxDailyBookings || 10,
                        cancellationPolicy: professional.cancellationPolicy || 'moderate',
                        isVerified: professional.isVerified || false,
                        isFeatured: professional.isFeatured || false,
                        
                        documents: professional.documents || {
                            idProof: '', qualificationProof: '', license: ''
                        },
                        
                        socialMedia: professional.socialMedia || {
                            website: '', facebook: '', instagram: '', linkedin: ''
                        }
                    });
                    showToast('success', 'Professional loaded successfully');
                } else {
                    showToast('error', 'Professional not found');
                }
            }
        } catch (error) {
            console.error('Error fetching professional:', error);
            showToast('error', 'Failed to load professional');
        } finally {
            setLoading(false);
        }
    };

    const [specializationInput, setSpecializationInput] = useState('');
    const [errors, setErrors] = useState({});

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    // Toggle section expansion
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

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle social media changes
    const handleSocialChange = (platform, value) => {
        setFormData(prev => ({
            ...prev,
            socialMedia: {
                ...prev.socialMedia,
                [platform]: value
            }
        }));
    };

    // Handle working hours changes
    const handleWorkingHoursChange = (index, field, value) => {
        const updatedHours = [...formData.workingHours];
        updatedHours[index] = { ...updatedHours[index], [field]: value };
        setFormData(prev => ({ ...prev, workingHours: updatedHours }));
    };

    // Toggle all working days
    const toggleAllDays = (available) => {
        const updatedHours = formData.workingHours.map(day => ({
            ...day,
            isAvailable: available
        }));
        setFormData(prev => ({ ...prev, workingHours: updatedHours }));
        showToast('success', `All days ${available ? 'opened' : 'closed'}`);
    };

    // Handle specialization input
    const handleAddSpecialization = () => {
        if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
            setFormData(prev => ({
                ...prev,
                specialization: [...prev.specialization, specializationInput.trim()]
            }));
            setSpecializationInput('');
            showToast('success', 'Specialization added');
        }
    };

    const handleRemoveSpecialization = (index) => {
        setFormData(prev => ({
            ...prev,
            specialization: prev.specialization.filter((_, i) => i !== index)
        }));
        showToast('success', 'Specialization removed');
    };

    // Handle service areas
    const handleServiceAreaChange = (index, value) => {
        const updatedAreas = [...formData.serviceAreas];
        updatedAreas[index] = value;
        setFormData(prev => ({ ...prev, serviceAreas: updatedAreas }));
    };

    const addServiceArea = () => {
        setFormData(prev => ({ ...prev, serviceAreas: [...prev.serviceAreas, ''] }));
    };

    const removeServiceArea = (index) => {
        if (formData.serviceAreas.length > 1) {
            setFormData(prev => ({
                ...prev,
                serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.businessName.trim()) {
            newErrors.businessName = 'Business name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            const digits = formData.phone.replace(/\D/g, '');
            if (digits.length < 10) {
                newErrors.phone = 'Enter a valid phone number (10 digits)';
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showToast('error', 'Please fix the errors before submitting');
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                const element = document.getElementById(firstError);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        setSaving(true);
        setApiError(null);

        try {
            const filteredServiceAreas = formData.serviceAreas.filter(area => area && area.trim() !== '');
            
            const payload = {
                companyId: user.companyId,
                createdBy: user.id,
                businessName: formData.businessName,
                tagline: formData.tagline,
                type: formData.type,
                category: formData.category,
                specialization: formData.specialization,
                experience: formData.experience || 0,
                phone: formData.phone.replace(/\D/g, ''),
                email: formData.email.toLowerCase(),
                address: {
                    street: formData.address.street || '',
                    city: formData.address.city || '',
                    state: formData.address.state || '',
                    zipCode: formData.address.zipCode || '',
                    country: formData.address.country || 'India'
                },
                serviceType: formData.serviceType,
                serviceAreas: filteredServiceAreas,
                workingHours: formData.workingHours,
                whatsappBusinessId: formData.whatsappBusinessId?.replace(/\D/g, '') || '',
                autoReplyEnabled: formData.autoReplyEnabled,
                autoReplyMessage: formData.autoReplyMessage,
                bookingBuffer: formData.bookingBuffer,
                maxDailyBookings: formData.maxDailyBookings,
                cancellationPolicy: formData.cancellationPolicy,
                isVerified: formData.isVerified,
                isFeatured: formData.isFeatured,
                documents: formData.documents,
                socialMedia: formData.socialMedia,
                verificationStatus: formData.isVerified ? 'verified' : 'pending',
                isActive: true
            };

            const url = isEditing 
                ? `/api/bookingService/bookingmng?id=${professionalId}&companyId=${user.companyId}`
                : '/api/bookingService/bookingmng';
            
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', isEditing ? 'Professional updated successfully!' : 'Professional created successfully!');
                setTimeout(() => router.push('/admin/bookingService/bookingmng'), 1500);
            } else {
                if (res.status === 403) {
                    throw new Error("You don't have permission");
                }
                if (res.status === 409) {
                    throw new Error(data.error || 'Professional already exists');
                }
                throw new Error(data.error || 'Failed to save professional');
            }
        } catch (error) {
            console.error('Error saving professional:', error);
            setApiError(error.message);
            showToast('error', error.message || 'Failed to save professional. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Loading state
    if (!user) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Checking authentication...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{isEditing ? 'Edit Professional' : 'Add New Professional'} | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="create-professional-page">
                {/* Toast Notification */}
                {toast.show && (
                    <div className={`toast-notification ${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : 
                         toast.type === 'error' ? <AlertCircle size={20} /> : 
                         <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Company Context Banner */}
                <div className="company-banner">
                    <div className="company-banner-content">
                        <div className="company-banner-left">
                            <Building2 size={20} className="company-icon" />
                            <span className="company-banner-text">
                                {isSuperAdmin ? 'Super Admin View' : 'Company Admin View'} - 
                                {user?.companyName || 'Your Company'}
                            </span>
                        </div>
                        {isSuperAdmin && (
                            <div className="super-admin-badge">
                                <ShieldIcon size={16} />
                                Super Admin
                            </div>
                        )}
                    </div>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <div className="api-error">
                        <AlertCircle size={20} />
                        <p>{apiError}</p>
                    </div>
                )}

                {/* Header */}
                <header className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <Link href="/admin/bookingService/bookingmng" className="back-button">
                                <ArrowLeft size={20} />
                                <span>Back to Professionals</span>
                            </Link>
                            <h1 className="page-title">
                                <User size={28} className="title-icon" />
                                {isEditing ? 'Edit Professional' : 'Add New Professional'}
                            </h1>
                            <p className="page-description">
                                {isEditing ? 'Update professional information' : 'Create a new service provider'} for {user?.companyName || 'your company'}
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
                            {!isEditing && <span className="status-badge draft">Draft</span>}
                            {isEditing && (
                                <span className={`status-badge ${formData.isVerified ? 'verified' : 'pending'}`}>
                                    {formData.isVerified ? 'Verified' : 'Pending'}
                                </span>
                            )}
                            <button
                                onClick={handleSubmit}
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
                                        <span>{isEditing ? 'Update Professional' : 'Create Professional'}</span>
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
                                            {/* Basic Information */}
                                            {section.id === 'basic' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <User size={16} />
                                                            Professional Details
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Business Name <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="businessName"
                                                                    id="businessName"
                                                                    value={formData.businessName}
                                                                    onChange={handleChange}
                                                                    className={errors.businessName ? 'error' : ''}
                                                                    placeholder="e.g., John's Beauty Salon"
                                                                />
                                                                {errors.businessName && <span className="error-text">{errors.businessName}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Tagline</label>
                                                                <input
                                                                    type="text"
                                                                    name="tagline"
                                                                    value={formData.tagline}
                                                                    onChange={handleChange}
                                                                    placeholder="Brief description of your business"
                                                                />
                                                                <span className="hint">A short, catchy description</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Briefcase size={16} />
                                                            Classification
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Professional Type <span className="required">*</span></label>
                                                                <div className="type-cards">
                                                                    {PROFESSIONAL_TYPES.map(type => (
                                                                        <label 
                                                                            key={type.value} 
                                                                            className={`type-card ${formData.type === type.value ? 'selected' : ''}`}
                                                                            style={{ 
                                                                                borderColor: formData.type === type.value ? type.color : '#e2e8f0',
                                                                                background: formData.type === type.value ? `${type.color}10` : 'white'
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name="type"
                                                                                value={type.value}
                                                                                checked={formData.type === type.value}
                                                                                onChange={handleChange}
                                                                            />
                                                                            <span className="type-icon">{type.icon}</span>
                                                                            <span className="type-label">{type.label}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Category <span className="required">*</span></label>
                                                                <div className="category-cards">
                                                                    {CATEGORIES.map(cat => (
                                                                        <label 
                                                                            key={cat.value} 
                                                                            className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}
                                                                            style={{ 
                                                                                borderColor: formData.category === cat.value ? cat.color : '#e2e8f0',
                                                                                background: formData.category === cat.value ? `${cat.color}10` : 'white'
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name="category"
                                                                                value={cat.value}
                                                                                checked={formData.category === cat.value}
                                                                                onChange={handleChange}
                                                                            />
                                                                            <span className="category-icon">{cat.icon}</span>
                                                                            <span className="category-label">{cat.label}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Experience (years)</label>
                                                                <input
                                                                    type="number"
                                                                    name="experience"
                                                                    value={formData.experience}
                                                                    onChange={handleChange}
                                                                    min="0"
                                                                    max="50"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Specializations</label>
                                                                <div className="specialization-group">
                                                                    <div className="specialization-input">
                                                                        <input
                                                                            type="text"
                                                                            value={specializationInput}
                                                                            onChange={(e) => setSpecializationInput(e.target.value)}
                                                                            placeholder="Add specialization"
                                                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                                                                        />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={handleAddSpecialization} 
                                                                            className="add-btn"
                                                                        >
                                                                            <Plus size={16} />
                                                                            Add
                                                                        </button>
                                                                    </div>
                                                                    <div className="tags">
                                                                        {formData.specialization.map((spec, index) => (
                                                                            <span key={index} className="tag">
                                                                                {spec}
                                                                                <button type="button" onClick={() => handleRemoveSpecialization(index)}>×</button>
                                                                            </span>
                                                                        ))}
                                                                        {formData.specialization.length === 0 && (
                                                                            <span className="no-tags">No specializations added</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Contact Information */}
                                            {section.id === 'contact' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Phone size={16} />
                                                            Contact Details
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Phone <span className="required">*</span></label>
                                                                <input
                                                                    type="tel"
                                                                    name="phone"
                                                                    id="phone"
                                                                    value={formData.phone}
                                                                    onChange={handleChange}
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
                                                                    id="email"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    className={errors.email ? 'error' : ''}
                                                                    placeholder="professional@example.com"
                                                                />
                                                                {errors.email && <span className="error-text">{errors.email}</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <MapPin size={16} />
                                                            Address
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Street</label>
                                                                <input
                                                                    type="text"
                                                                    name="address.street"
                                                                    value={formData.address.street}
                                                                    onChange={handleChange}
                                                                    placeholder="Street address"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>City</label>
                                                                <input
                                                                    type="text"
                                                                    name="address.city"
                                                                    value={formData.address.city}
                                                                    onChange={handleChange}
                                                                    placeholder="City"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>State</label>
                                                                <input
                                                                    type="text"
                                                                    name="address.state"
                                                                    value={formData.address.state}
                                                                    onChange={handleChange}
                                                                    placeholder="State"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>ZIP Code</label>
                                                                <input
                                                                    type="text"
                                                                    name="address.zipCode"
                                                                    value={formData.address.zipCode}
                                                                    onChange={handleChange}
                                                                    placeholder="ZIP Code"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Country</label>
                                                                <input
                                                                    type="text"
                                                                    name="address.country"
                                                                    value={formData.address.country}
                                                                    onChange={handleChange}
                                                                    placeholder="Country"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Globe size={16} />
                                                            Service Configuration
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Service Type <span className="required">*</span></label>
                                                                <div className="service-cards">
                                                                    {SERVICE_TYPES.map(type => (
                                                                        <label 
                                                                            key={type.value} 
                                                                            className={`service-card ${formData.serviceType === type.value ? 'selected' : ''}`}
                                                                            style={{ 
                                                                                borderColor: formData.serviceType === type.value ? type.color : '#e2e8f0',
                                                                                background: formData.serviceType === type.value ? `${type.color}10` : 'white'
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name="serviceType"
                                                                                value={type.value}
                                                                                checked={formData.serviceType === type.value}
                                                                                onChange={handleChange}
                                                                            />
                                                                            <span className="service-icon">{type.icon}</span>
                                                                            <span className="service-label">{type.label}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Service Areas</label>
                                                                <div className="service-areas">
                                                                    {formData.serviceAreas.map((area, index) => (
                                                                        <div key={index} className="service-area-input">
                                                                            <input
                                                                                type="text"
                                                                                value={area}
                                                                                onChange={(e) => handleServiceAreaChange(index, e.target.value)}
                                                                                placeholder="e.g., Downtown"
                                                                            />
                                                                            {formData.serviceAreas.length > 1 && (
                                                                                <button 
                                                                                    type="button" 
                                                                                    onClick={() => removeServiceArea(index)} 
                                                                                    className="remove-btn"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={addServiceArea} 
                                                                        className="add-area-btn"
                                                                    >
                                                                        <Plus size={16} /> Add Service Area
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Globe2 size={16} />
                                                            Social Media
                                                        </h3>
                                                        <div className="social-grid">
                                                            <div className="form-field">
                                                                <label>Website</label>
                                                                <input
                                                                    type="url"
                                                                    value={formData.socialMedia.website}
                                                                    onChange={(e) => handleSocialChange('website', e.target.value)}
                                                                    placeholder="https://example.com"
                                                                />
                                                            </div>
                                                            <div className="form-field">
                                                                <label>Facebook</label>
                                                                <input
                                                                    type="url"
                                                                    value={formData.socialMedia.facebook}
                                                                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                                                    placeholder="https://facebook.com/..."
                                                                />
                                                            </div>
                                                            <div className="form-field">
                                                                <label>Instagram</label>
                                                                <input
                                                                    type="url"
                                                                    value={formData.socialMedia.instagram}
                                                                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                                                    placeholder="https://instagram.com/..."
                                                                />
                                                            </div>
                                                            <div className="form-field">
                                                                <label>LinkedIn</label>
                                                                <input
                                                                    type="url"
                                                                    value={formData.socialMedia.linkedin}
                                                                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                                                    placeholder="https://linkedin.com/..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Working Hours */}
                                            {section.id === 'working' && (
                                                <>
                                                    <div className="form-block">
                                                        <div className="section-header">
                                                            <h3>
                                                                <Clock size={16} />
                                                                Weekly Schedule
                                                            </h3>
                                                            <div className="quick-actions">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAllDays(true)}
                                                                    className="quick-btn"
                                                                    style={{ color: '#10b981' }}
                                                                >
                                                                    <CheckCircle size={14} />
                                                                    Open All
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAllDays(false)}
                                                                    className="quick-btn"
                                                                    style={{ color: '#ef4444' }}
                                                                >
                                                                    <XCircle size={14} />
                                                                    Close All
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="hours-grid">
                                                            {formData.workingHours.map((day, index) => (
                                                                <div key={day.day} className="hour-card">
                                                                    <div className="hour-header">
                                                                        <label className="day-check">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={day.isAvailable}
                                                                                onChange={(e) => handleWorkingHoursChange(index, 'isAvailable', e.target.checked)}
                                                                            />
                                                                            <span>{DAYS.find(d => d.value === day.day)?.label}</span>
                                                                        </label>
                                                                        {!day.isAvailable && (
                                                                            <span className="closed-badge">Closed</span>
                                                                        )}
                                                                    </div>
                                                                    {day.isAvailable && (
                                                                        <div className="hour-times">
                                                                            <input
                                                                                type="time"
                                                                                value={day.startTime}
                                                                                onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                                                                            />
                                                                            <span>to</span>
                                                                            <input
                                                                                type="time"
                                                                                value={day.endTime}
                                                                                onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Settings & Policies */}
                                            {section.id === 'settings' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Settings size={16} />
                                                            Booking Settings
                                                        </h3>
                                                        <div className="settings-grid">
                                                            <div className="setting-card">
                                                                <div className="setting-header">
                                                                    <Clock size={16} />
                                                                    <span>Booking Buffer</span>
                                                                </div>
                                                                <div className="setting-control">
                                                                    <input
                                                                        type="number"
                                                                        name="bookingBuffer"
                                                                        value={formData.bookingBuffer}
                                                                        onChange={handleChange}
                                                                        min="0"
                                                                        max="120"
                                                                    />
                                                                    <span>minutes</span>
                                                                </div>
                                                            </div>

                                                            <div className="setting-card">
                                                                <div className="setting-header">
                                                                    <Calendar size={16} />
                                                                    <span>Max Daily Bookings</span>
                                                                </div>
                                                                <div className="setting-control">
                                                                    <input
                                                                        type="number"
                                                                        name="maxDailyBookings"
                                                                        value={formData.maxDailyBookings}
                                                                        onChange={handleChange}
                                                                        min="1"
                                                                        max="50"
                                                                    />
                                                                    <span>bookings</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Shield size={16} />
                                                            Cancellation Policy
                                                        </h3>
                                                        <div className="policy-cards">
                                                            {CANCELLATION_POLICIES.map(policy => (
                                                                <label 
                                                                    key={policy.value} 
                                                                    className={`policy-card ${formData.cancellationPolicy === policy.value ? 'selected' : ''}`}
                                                                    style={{ 
                                                                        borderColor: formData.cancellationPolicy === policy.value ? policy.color : '#e2e8f0',
                                                                        background: formData.cancellationPolicy === policy.value ? `${policy.color}10` : 'white'
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="cancellationPolicy"
                                                                        value={policy.value}
                                                                        checked={formData.cancellationPolicy === policy.value}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <span className="policy-icon">{policy.icon}</span>
                                                                    <div className="policy-info">
                                                                        <span className="policy-name">{policy.label}</span>
                                                                        <span className="policy-desc">{policy.description}</span>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <MessageSquare size={16} />
                                                            WhatsApp Integration
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>WhatsApp Business Number</label>
                                                                <input
                                                                    type="text"
                                                                    name="whatsappBusinessId"
                                                                    value={formData.whatsappBusinessId}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter WhatsApp number"
                                                                />
                                                            </div>

                                                            <div className="form-field checkbox-field span-2">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="autoReplyEnabled"
                                                                        checked={formData.autoReplyEnabled}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <span>Enable Auto-Reply</span>
                                                                </label>
                                                            </div>

                                                            {formData.autoReplyEnabled && (
                                                                <div className="form-field span-2">
                                                                    <label>Auto-Reply Message</label>
                                                                    <textarea
                                                                        name="autoReplyMessage"
                                                                        value={formData.autoReplyMessage}
                                                                        onChange={handleChange}
                                                                        rows="3"
                                                                        placeholder="Enter auto-reply message"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <ShieldCheck size={16} />
                                                            Admin Settings
                                                        </h3>
                                                        <div className="admin-checks">
                                                            <label className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    name="isVerified"
                                                                    checked={formData.isVerified}
                                                                    onChange={handleChange}
                                                                />
                                                                <span>Mark as Verified</span>
                                                            </label>
                                                            <label className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    name="isFeatured"
                                                                    checked={formData.isFeatured}
                                                                    onChange={handleChange}
                                                                />
                                                                <span>Feature this Professional</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Documents */}
                                            {section.id === 'documents' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <FileText size={16} />
                                                            Verification Documents
                                                        </h3>
                                                        <div className="docs-grid">
                                                            <div className="doc-card">
                                                                <Award size={24} style={{ color: '#3b82f6' }} />
                                                                <div className="doc-info">
                                                                    <h4>ID Proof</h4>
                                                                    <p>Government ID</p>
                                                                </div>
                                                                <button type="button" className="upload-btn">
                                                                    <Camera size={14} />
                                                                    Upload
                                                                </button>
                                                            </div>

                                                            <div className="doc-card">
                                                                <Star size={24} style={{ color: '#10b981' }} />
                                                                <div className="doc-info">
                                                                    <h4>Qualification</h4>
                                                                    <p>Certificates</p>
                                                                </div>
                                                                <button type="button" className="upload-btn">
                                                                    <Camera size={14} />
                                                                    Upload
                                                                </button>
                                                            </div>

                                                            <div className="doc-card">
                                                                <Shield size={24} style={{ color: '#f59e0b' }} />
                                                                <div className="doc-info">
                                                                    <h4>License</h4>
                                                                    <p>Business license</p>
                                                                </div>
                                                                <button type="button" className="upload-btn">
                                                                    <Camera size={14} />
                                                                    Upload
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-box">
                                                        <Info size={20} />
                                                        <p>
                                                            <strong>Note:</strong> Documents are required for verification. Upload clear copies of each document.
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
                        onClick={handleSubmit}
                        disabled={saving}
                        className="mobile-save-btn"
                    >
                        {saving ? (
                            <div className="button-spinner"></div>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>{isEditing ? 'Update Professional' : 'Create Professional'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .create-professional-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                }

                .loading-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                }

                .spinner {
                    width: 3rem;
                    height: 3rem;
                    border: 3px solid #f1f5f9;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .company-banner {
                    max-width: 1200px;
                    margin: 0 auto 16px auto;
                    padding: 0 24px;
                }

                .company-banner-content {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .company-banner-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .company-icon {
                    color: #3b82f6;
                }

                .company-banner-text {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #1f2937;
                }

                .super-admin-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                    border-radius: 20px;
                    color: #92400e;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .api-error {
                    max-width: 1200px;
                    margin: 0 auto 16px auto;
                    padding: 0 24px;
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #b91c1c;
                }

                .api-error p {
                    flex: 1;
                    margin: 0;
                }

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

                .toast-notification.warning {
                    border-left: 4px solid #f59e0b;
                }

                .toast-notification.success svg {
                    color: #10b981;
                }

                .toast-notification.error svg {
                    color: #ef4444;
                }

                .toast-notification.warning svg {
                    color: #f59e0b;
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

                .page-header {
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
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
                    gap: 8px;
                }

                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: #3b82f6;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 4px 0;
                    transition: opacity 0.2s;
                    width: fit-content;
                    text-decoration: none;
                }

                .back-button:hover {
                    opacity: 0.7;
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

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    background: #f1f5f9;
                    color: #475569;
                }

                .status-badge.draft {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .status-badge.verified {
                    background: #f0fdf4;
                    color: #059669;
                }

                .status-badge.pending {
                    background: #fef3c7;
                    color: #b45309;
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

                .main-content {
                    max-width: 1200px;
                    margin: 24px auto;
                    padding: 0 24px 100px 24px;
                }

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
                    width: 100%;
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

                .form-field input.error,
                .form-field select.error,
                .form-field textarea.error {
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
                }

                .type-cards {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                @media (max-width: 640px) {
                    .type-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .type-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .type-card input {
                    position: absolute;
                    opacity: 0;
                }

                .type-card.selected {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: #3b82f6;
                }

                .type-icon {
                    font-size: 1.5rem;
                }

                .type-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #1e293b;
                }

                .category-cards {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                @media (max-width: 1024px) {
                    .category-cards {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .category-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .category-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .category-card input {
                    position: absolute;
                    opacity: 0;
                }

                .category-card.selected {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: #3b82f6;
                }

                .category-icon {
                    font-size: 1.5rem;
                }

                .category-label {
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: #1e293b;
                    text-align: center;
                }

                .service-cards {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                @media (max-width: 640px) {
                    .service-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .service-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .service-card input {
                    position: absolute;
                    opacity: 0;
                }

                .service-card.selected {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: #3b82f6;
                }

                .service-icon {
                    font-size: 1.5rem;
                }

                .service-label {
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: #1e293b;
                    text-align: center;
                }

                .specialization-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .specialization-input {
                    display: flex;
                    gap: 6px;
                }

                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 0 12px;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 8px;
                    color: #3b82f6;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    cursor: pointer;
                }

                .add-btn:hover {
                    background: rgba(59, 130, 246, 0.2);
                }

                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 20px;
                    font-size: 0.8rem;
                    color: #3b82f6;
                }

                .tag button {
                    border: none;
                    background: transparent;
                    color: #3b82f6;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0;
                }

                .no-tags {
                    color: #94a3b8;
                    font-size: 0.8rem;
                }

                .service-areas {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .service-area-input {
                    display: flex;
                    gap: 6px;
                }

                .remove-btn {
                    padding: 0 8px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #ef4444;
                    cursor: pointer;
                }

                .add-area-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 8px;
                    background: white;
                    border: 1px dashed #e2e8f0;
                    border-radius: 8px;
                    color: #64748b;
                    font-size: 0.85rem;
                    cursor: pointer;
                }

                .add-area-btn:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                .social-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                @media (max-width: 640px) {
                    .social-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .hours-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                @media (max-width: 640px) {
                    .hours-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .hour-card {
                    padding: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                }

                .hour-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .day-check {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .closed-badge {
                    font-size: 0.625rem;
                    padding: 2px 6px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    color: #64748b;
                }

                .hour-times {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hour-times input {
                    flex: 1;
                    padding: 6px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.8rem;
                }

                .hour-times span {
                    color: #64748b;
                    font-size: 0.7rem;
                }

                .quick-actions {
                    display: flex;
                    gap: 8px;
                }

                .quick-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    cursor: pointer;
                }

                .quick-btn:hover {
                    background: #e2e8f0;
                }

                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                @media (max-width: 640px) {
                    .settings-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .setting-card {
                    padding: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                }

                .setting-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 8px;
                    color: #475569;
                    font-size: 0.813rem;
                    font-weight: 500;
                }

                .setting-control {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .setting-control input {
                    width: 80px;
                    padding: 6px 8px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    text-align: center;
                }

                .setting-control span {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .policy-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                @media (max-width: 640px) {
                    .policy-cards {
                        grid-template-columns: 1fr;
                    }
                }

                .policy-card {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .policy-card input {
                    position: absolute;
                    opacity: 0;
                }

                .policy-card.selected {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: #3b82f6;
                }

                .policy-icon {
                    font-size: 1.5rem;
                }

                .policy-info {
                    flex: 1;
                }

                .policy-name {
                    display: block;
                    font-size: 0.813rem;
                    font-weight: 600;
                    color: #0f172a;
                }

                .policy-desc {
                    display: block;
                    font-size: 0.688rem;
                    color: #64748b;
                }

                .admin-checks {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .docs-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                @media (max-width: 640px) {
                    .docs-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .doc-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #f8fafc;
                    border: 1px dashed #e2e8f0;
                    border-radius: 8px;
                }

                .doc-info {
                    flex: 1;
                }

                .doc-info h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }

                .doc-info p {
                    font-size: 0.688rem;
                    color: #64748b;
                    margin: 0;
                }

                .upload-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 10px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.688rem;
                    cursor: pointer;
                }

                .upload-btn:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                .info-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #eef2ff;
                    border: 1px solid rgba(59, 130, 246, 0.3);
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

                .mobile-save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
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

                    .section-title h2 {
                        font-size: 0.938rem;
                    }

                    .section-title p {
                        font-size: 0.688rem;
                    }

                    .section-content {
                        padding: 0 16px 16px 16px;
                    }

                    .form-field input,
                    .form-field select,
                    .form-field textarea {
                        font-size: 16px;
                        min-height: 48px;
                    }

                    .type-card,
                    .category-card,
                    .service-card {
                        padding: 8px;
                    }

                    .hour-card {
                        padding: 10px;
                    }

                    .policy-card {
                        padding: 10px;
                    }

                    .doc-card {
                        padding: 10px;
                    }
                }

                @media (max-width: 480px) {
                    .main-content {
                        padding: 16px 16px 90px 16px;
                    }

                    .quick-actions {
                        flex-direction: column;
                    }

                    .quick-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .hour-times {
                        flex-direction: column;
                    }

                    .hour-times input {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}