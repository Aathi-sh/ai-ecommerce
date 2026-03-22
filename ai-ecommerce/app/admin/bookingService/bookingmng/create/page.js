

// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import Head from 'next/head';
// import { useAuth } from '../../../../../context/AuthContext';
// import {
//     ArrowLeft, Save, User, Building, Mail, Phone,
//     MapPin, Briefcase, Clock, Globe, Shield, Plus,
//     Trash2, CheckCircle, XCircle, AlertCircle, ChevronRight,
//     Settings, Users, FileText, Award, Star, Calendar,
//     Info, AlertTriangle, Loader2, Camera,
//     Building2, Shield as ShieldIcon, Layers, Layout,
//     MessageSquare, ShieldCheck, Globe2, Facebook,
//     Instagram, Twitter, Youtube, Linkedin
// } from 'lucide-react';

// // ==================== CONSTANTS ====================
// const SECTIONS = [
//     { 
//         id: 'basic', 
//         title: 'Basic Information', 
//         icon: User, 
//         color: '#3b82f6',
//         description: 'Professional details and business information'
//     },
//     { 
//         id: 'contact', 
//         title: 'Contact Information', 
//         icon: Phone, 
//         color: '#10b981',
//         description: 'Contact details and service areas'
//     },
//     { 
//         id: 'working', 
//         title: 'Working Hours', 
//         icon: Clock, 
//         color: '#f59e0b',
//         description: 'Availability and schedule'
//     },
//     { 
//         id: 'settings', 
//         title: 'Settings & Policies', 
//         icon: Settings, 
//         color: '#8b5cf6',
//         description: 'Booking settings and cancellation policies'
//     },
//     { 
//         id: 'documents', 
//         title: 'Documents', 
//         icon: FileText, 
//         color: '#06b6d4',
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
//     const searchParams = useSearchParams();
//     const professionalId = searchParams.get('id');
//     const isEditing = !!professionalId;
    
//     const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
    
//     const [loading, setLoading] = useState(isEditing);
//     const [saving, setSaving] = useState(false);
//     const [expandedSections, setExpandedSections] = useState(['basic']);
//     const [activeTab, setActiveTab] = useState('basic');
//     const [toast, setToast] = useState({ show: false, type: '', message: '' });
//     const [apiError, setApiError] = useState(null);
    
//     const [formData, setFormData] = useState({
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
//             country: 'India'
//         },
//         serviceType: 'both',
        
//         // Working Hours
//         workingHours: [
//             { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//             { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//             { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//             { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//             { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//             { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] },
//             { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }
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

//     // Redirect if not authenticated
//     useEffect(() => {
//         if (!user) {
//             router.push('/login');
//         } else if (!isCompanyAdmin && !isSuperAdmin) {
//             router.push('/dashboard');
//         }
//     }, [user, isCompanyAdmin, isSuperAdmin, router]);

//     // Fetch professional data if editing
//     useEffect(() => {
//         if (isEditing && user?.companyId && professionalId) {
//             fetchProfessional();
//         }
//     }, [isEditing, professionalId, user]);

//     const fetchProfessional = async () => {
//         try {
//             setLoading(true);
            
//             const query = new URLSearchParams({
//                 companyId: user.companyId,
//                 limit: '100'
//             }).toString();
            
//             const res = await fetch(`/api/bookingService/bookingmng?${query}`, {
//                 headers: getAuthHeaders()
//             });
            
//             if (!res.ok) {
//                 throw new Error('Failed to fetch professional');
//             }
            
//             const data = await res.json();
            
//             if (data.success) {
//                 const professional = data.data.find(p => p._id === professionalId);
//                 if (professional) {
//                     setFormData({
//                         businessName: professional.businessName || '',
//                         tagline: professional.tagline || '',
//                         type: professional.type || 'individual',
//                         category: professional.category || 'beauty',
//                         specialization: professional.specialization || [],
//                         experience: professional.experience || 0,
                        
//                         phone: professional.phone || '',
//                         email: professional.email || '',
//                         address: professional.address || {
//                             street: '', city: '', state: '', zipCode: '', country: 'India'
//                         },
//                         serviceType: professional.serviceType || 'both',
                        
//                         workingHours: professional.workingHours || [
//                             { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//                             { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//                             { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//                             { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//                             { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
//                             { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] },
//                             { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }
//                         ],
                        
//                         serviceAreas: professional.serviceAreas?.length ? professional.serviceAreas : [''],
                        
//                         whatsappBusinessId: professional.whatsappBusinessId || '',
//                         autoReplyEnabled: professional.autoReplyEnabled || false,
//                         autoReplyMessage: professional.autoReplyMessage || 'Hello! Thank you for your message. Our team will get back to you soon.',
                        
//                         bookingBuffer: professional.bookingBuffer || 15,
//                         maxDailyBookings: professional.maxDailyBookings || 10,
//                         cancellationPolicy: professional.cancellationPolicy || 'moderate',
//                         isVerified: professional.isVerified || false,
//                         isFeatured: professional.isFeatured || false,
                        
//                         documents: professional.documents || {
//                             idProof: '', qualificationProof: '', license: ''
//                         },
                        
//                         socialMedia: professional.socialMedia || {
//                             website: '', facebook: '', instagram: '', linkedin: ''
//                         }
//                     });
//                     showToast('success', 'Professional loaded successfully');
//                 } else {
//                     showToast('error', 'Professional not found');
//                 }
//             }
//         } catch (error) {
//             console.error('Error fetching professional:', error);
//             showToast('error', 'Failed to load professional');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const [specializationInput, setSpecializationInput] = useState('');
//     const [errors, setErrors] = useState({});

//     // Toast auto-hide
//     useEffect(() => {
//         if (toast.show) {
//             const timer = setTimeout(() => {
//                 setToast({ show: false, type: '', message: '' });
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [toast]);

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
//         setApiError(null);

//         try {
//             const filteredServiceAreas = formData.serviceAreas.filter(area => area && area.trim() !== '');
            
//             const payload = {
//                 companyId: user.companyId,
//                 createdBy: user.id,
//                 businessName: formData.businessName,
//                 tagline: formData.tagline,
//                 type: formData.type,
//                 category: formData.category,
//                 specialization: formData.specialization,
//                 experience: formData.experience || 0,
//                 phone: formData.phone.replace(/\D/g, ''),
//                 email: formData.email.toLowerCase(),
//                 address: {
//                     street: formData.address.street || '',
//                     city: formData.address.city || '',
//                     state: formData.address.state || '',
//                     zipCode: formData.address.zipCode || '',
//                     country: formData.address.country || 'India'
//                 },
//                 serviceType: formData.serviceType,
//                 serviceAreas: filteredServiceAreas,
//                 workingHours: formData.workingHours,
//                 whatsappBusinessId: formData.whatsappBusinessId?.replace(/\D/g, '') || '',
//                 autoReplyEnabled: formData.autoReplyEnabled,
//                 autoReplyMessage: formData.autoReplyMessage,
//                 bookingBuffer: formData.bookingBuffer,
//                 maxDailyBookings: formData.maxDailyBookings,
//                 cancellationPolicy: formData.cancellationPolicy,
//                 isVerified: formData.isVerified,
//                 isFeatured: formData.isFeatured,
//                 documents: formData.documents,
//                 socialMedia: formData.socialMedia,
//                 verificationStatus: formData.isVerified ? 'verified' : 'pending',
//                 isActive: true
//             };

//             const url = isEditing 
//                 ? `/api/bookingService/bookingmng?id=${professionalId}&companyId=${user.companyId}`
//                 : '/api/bookingService/bookingmng';
            
//             const method = isEditing ? 'PUT' : 'POST';

//             const res = await fetch(url, {
//                 method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...getAuthHeaders()
//                 },
//                 body: JSON.stringify(payload)
//             });

//             const data = await res.json();

//             if (data.success) {
//                 showToast('success', isEditing ? 'Professional updated successfully!' : 'Professional created successfully!');
//                 setTimeout(() => router.push('/admin/bookingService/bookingmng'), 1500);
//             } else {
//                 if (res.status === 403) {
//                     throw new Error("You don't have permission");
//                 }
//                 if (res.status === 409) {
//                     throw new Error(data.error || 'Professional already exists');
//                 }
//                 throw new Error(data.error || 'Failed to save professional');
//             }
//         } catch (error) {
//             console.error('Error saving professional:', error);
//             setApiError(error.message);
//             showToast('error', error.message || 'Failed to save professional. Please try again.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     // Loading state
//     if (!user) {
//         return (
//             <div className="loading-container">
//                 <div className="spinner"></div>
//                 <p>Checking authentication...</p>
//             </div>
//         );
//     }

//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <div className="spinner"></div>
//                 <p>Loading...</p>
//             </div>
//         );
//     }

//     return (
//         <>
//             <Head>
//                 <title>{isEditing ? 'Edit Professional' : 'Add New Professional'} | LFMS</title>
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

//                 {/* Company Context Banner */}
//                 <div className="company-banner">
//                     <div className="company-banner-content">
//                         <div className="company-banner-left">
//                             <Building2 size={20} className="company-icon" />
//                             <span className="company-banner-text">
//                                 {isSuperAdmin ? 'Super Admin View' : 'Company Admin View'} - 
//                                 {user?.companyName || 'Your Company'}
//                             </span>
//                         </div>
//                         {isSuperAdmin && (
//                             <div className="super-admin-badge">
//                                 <ShieldIcon size={16} />
//                                 Super Admin
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* API Error Message */}
//                 {apiError && (
//                     <div className="api-error">
//                         <AlertCircle size={20} />
//                         <p>{apiError}</p>
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
//                                 {isEditing ? 'Edit Professional' : 'Add New Professional'}
//                             </h1>
//                             <p className="page-description">
//                                 {isEditing ? 'Update professional information' : 'Create a new service provider'} for {user?.companyName || 'your company'}
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
//                             {!isEditing && <span className="status-badge draft">Draft</span>}
//                             {isEditing && (
//                                 <span className={`status-badge ${formData.isVerified ? 'verified' : 'pending'}`}>
//                                     {formData.isVerified ? 'Verified' : 'Pending'}
//                                 </span>
//                             )}
//                             <button
//                                 onClick={handleSubmit}
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
//                                         <span>{isEditing ? 'Update Professional' : 'Create Professional'}</span>
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
//                                                                                 borderColor: formData.type === type.value ? type.color : '#e2e8f0',
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
//                                                                                 borderColor: formData.category === cat.value ? cat.color : '#e2e8f0',
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
//                                                                                 borderColor: formData.serviceType === type.value ? type.color : '#e2e8f0',
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
//                                                                     style={{ color: '#10b981' }}
//                                                                 >
//                                                                     <CheckCircle size={14} />
//                                                                     Open All
//                                                                 </button>
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() => toggleAllDays(false)}
//                                                                     className="quick-btn"
//                                                                     style={{ color: '#ef4444' }}
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
//                                                                         borderColor: formData.cancellationPolicy === policy.value ? policy.color : '#e2e8f0',
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
//                                                                 <Award size={24} style={{ color: '#3b82f6' }} />
//                                                                 <div className="doc-info">
//                                                                     <h4>ID Proof</h4>
//                                                                     <p>Government ID</p>
//                                                                 </div>
//                                                                 <button type="button" className="upload-btn">
//                                                                     <Camera size={14} />
//                                                                     Upload
//                                                                 </button>
//                                                             </div>

//                                                             <div className="doc-card">
//                                                                 <Star size={24} style={{ color: '#10b981' }} />
//                                                                 <div className="doc-info">
//                                                                     <h4>Qualification</h4>
//                                                                     <p>Certificates</p>
//                                                                 </div>
//                                                                 <button type="button" className="upload-btn">
//                                                                     <Camera size={14} />
//                                                                     Upload
//                                                                 </button>
//                                                             </div>

//                                                             <div className="doc-card">
//                                                                 <Shield size={24} style={{ color: '#f59e0b' }} />
//                                                                 <div className="doc-info">
//                                                                     <h4>License</h4>
//                                                                     <p>Business license</p>
//                                                                 </div>
//                                                                 <button type="button" className="upload-btn">
//                                                                     <Camera size={14} />
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
//                                 <span>{isEditing ? 'Update Professional' : 'Create Professional'}</span>
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             <style jsx>{`
//                 .create-professional-page {
//                     min-height: 100vh;
//                     background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                 }

//                 .loading-container {
//                     min-height: 100vh;
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     justify-content: center;
//                     background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                 }

//                 .spinner {
//                     width: 3rem;
//                     height: 3rem;
//                     border: 3px solid #f1f5f9;
//                     border-top-color: #3b82f6;
//                     border-radius: 50%;
//                     animation: spin 1s linear infinite;
//                     margin-bottom: 1rem;
//                 }

//                 @keyframes spin {
//                     to { transform: rotate(360deg); }
//                 }

//                 .company-banner {
//                     max-width: 1200px;
//                     margin: 0 auto 16px auto;
//                     padding: 0 24px;
//                 }

//                 .company-banner-content {
//                     background: white;
//                     border: 1px solid #e5e7eb;
//                     border-radius: 8px;
//                     padding: 12px 16px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                 }

//                 .company-banner-left {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                 }

//                 .company-icon {
//                     color: #3b82f6;
//                 }

//                 .company-banner-text {
//                     font-size: 0.95rem;
//                     font-weight: 500;
//                     color: #1f2937;
//                 }

//                 .super-admin-badge {
//                     display: flex;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 4px 10px;
//                     background: #fef3c7;
//                     border: 1px solid #fde68a;
//                     border-radius: 20px;
//                     color: #92400e;
//                     font-size: 0.75rem;
//                     font-weight: 600;
//                 }

//                 .api-error {
//                     max-width: 1200px;
//                     margin: 0 auto 16px auto;
//                     padding: 0 24px;
//                     background: #fee2e2;
//                     border: 1px solid #fecaca;
//                     border-radius: 8px;
//                     padding: 12px 16px;
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     color: #b91c1c;
//                 }

//                 .api-error p {
//                     flex: 1;
//                     margin: 0;
//                 }

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

//                 .toast-notification.warning {
//                     border-left: 4px solid #f59e0b;
//                 }

//                 .toast-notification.success svg {
//                     color: #10b981;
//                 }

//                 .toast-notification.error svg {
//                     color: #ef4444;
//                 }

//                 .toast-notification.warning svg {
//                     color: #f59e0b;
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

//                 .page-header {
//                     background: white;
//                     border-bottom: 1px solid #e5e7eb;
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
//                     color: #3b82f6;
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

//                 .status-badge {
//                     padding: 6px 12px;
//                     border-radius: 30px;
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     background: #f1f5f9;
//                     color: #475569;
//                 }

//                 .status-badge.draft {
//                     background: #dbeafe;
//                     color: #1e40af;
//                 }

//                 .status-badge.verified {
//                     background: #f0fdf4;
//                     color: #059669;
//                 }

//                 .status-badge.pending {
//                     background: #fef3c7;
//                     color: #b45309;
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

//                 .main-content {
//                     max-width: 1200px;
//                     margin: 24px auto;
//                     padding: 0 24px 100px 24px;
//                 }

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

//                 .form-field input.error,
//                 .form-field select.error,
//                 .form-field textarea.error {
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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .type-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .type-card.selected {
//                     background: rgba(59, 130, 246, 0.1);
//                     border-color: #3b82f6;
//                 }

//                 .type-icon {
//                     font-size: 1.5rem;
//                 }

//                 .type-label {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #1e293b;
//                 }

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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     cursor: pointer;
//                 }

//                 .category-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .category-card.selected {
//                     background: rgba(59, 130, 246, 0.1);
//                     border-color: #3b82f6;
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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     cursor: pointer;
//                 }

//                 .service-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .service-card.selected {
//                     background: rgba(59, 130, 246, 0.1);
//                     border-color: #3b82f6;
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
//                     background: rgba(59, 130, 246, 0.1);
//                     border: 1px solid rgba(59, 130, 246, 0.3);
//                     border-radius: 8px;
//                     color: #3b82f6;
//                     font-size: 0.85rem;
//                     white-space: nowrap;
//                     cursor: pointer;
//                 }

//                 .add-btn:hover {
//                     background: rgba(59, 130, 246, 0.2);
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
//                     background: rgba(59, 130, 246, 0.1);
//                     border: 1px solid rgba(59, 130, 246, 0.3);
//                     border-radius: 20px;
//                     font-size: 0.8rem;
//                     color: #3b82f6;
//                 }

//                 .tag button {
//                     border: none;
//                     background: transparent;
//                     color: #3b82f6;
//                     cursor: pointer;
//                     font-size: 1rem;
//                     padding: 0;
//                 }

//                 .no-tags {
//                     color: #94a3b8;
//                     font-size: 0.8rem;
//                 }

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
//                     background: rgba(239, 68, 68, 0.1);
//                     border: 1px solid rgba(239, 68, 68, 0.3);
//                     border-radius: 8px;
//                     color: #ef4444;
//                     cursor: pointer;
//                 }

//                 .add-area-btn {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 4px;
//                     padding: 8px;
//                     background: white;
//                     border: 1px dashed #e2e8f0;
//                     border-radius: 8px;
//                     color: #64748b;
//                     font-size: 0.85rem;
//                     cursor: pointer;
//                 }

//                 .add-area-btn:hover {
//                     border-color: #3b82f6;
//                     color: #3b82f6;
//                 }

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
//                     border: 1px solid #e2e8f0;
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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     font-size: 0.8rem;
//                 }

//                 .hour-times span {
//                     color: #64748b;
//                     font-size: 0.7rem;
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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 20px;
//                     font-size: 0.75rem;
//                     cursor: pointer;
//                 }

//                 .quick-btn:hover {
//                     background: #e2e8f0;
//                 }

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
//                     border: 1px solid #e2e8f0;
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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     text-align: center;
//                 }

//                 .setting-control span {
//                     font-size: 0.75rem;
//                     color: #64748b;
//                 }

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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     cursor: pointer;
//                 }

//                 .policy-card input {
//                     position: absolute;
//                     opacity: 0;
//                 }

//                 .policy-card.selected {
//                     background: rgba(59, 130, 246, 0.1);
//                     border-color: #3b82f6;
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

//                 .admin-checks {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 8px;
//                 }

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
//                     border: 1px dashed #e2e8f0;
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
//                     border: 1px solid #e2e8f0;
//                     border-radius: 8px;
//                     font-size: 0.688rem;
//                     cursor: pointer;
//                 }

//                 .upload-btn:hover {
//                     border-color: #3b82f6;
//                     color: #3b82f6;
//                 }

//                 .info-box {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     padding: 16px;
//                     background: #eef2ff;
//                     border: 1px solid rgba(59, 130, 246, 0.3);
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

//                 .mobile-save-btn:disabled {
//                     opacity: 0.6;
//                     cursor: not-allowed;
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

//                     .section-title h2 {
//                         font-size: 0.938rem;
//                     }

//                     .section-title p {
//                         font-size: 0.688rem;
//                     }

//                     .section-content {
//                         padding: 0 16px 16px 16px;
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

















// app/admin/bookingService/bookingmng/create/page.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from 'next/head';
import { appTheme } from "../../../../../src/constants/theme";
import { useAuth } from '../../../../../context/AuthContext';
import {
    Save, X, ChevronRight, Layers, Layout, Info,
    CheckCircle, AlertCircle, AlertTriangle, XCircle,
    Package, DollarSign, Percent, Calendar, Tag, Box,
    Truck, Globe, Settings, Shield, Zap, Star, Heart,
    Award, ShoppingCart, Clock, MapPin, Phone, Mail,
    FileText, Edit2, Trash2, Plus, Minus, Copy,
    Check, Loader2, Camera, Video, Link2, Hash,
    AtSign, FileSignature, Palette, Brush, Sparkles,
    Crown, Gem, Diamond, Gift, ThumbsUp, ThumbsDown,
    MessageSquare, Send, Paperclip, Smile, Home,
    ArrowLeft, ArrowRight, Grid, List, RefreshCw,
    Filter, Search, MoreVertical, Download, Printer,
    Share2, Bookmark, Eye, EyeOff, Lock, Unlock,
    Key, Wifi, WifiOff, Battery, BatteryCharging,
    Cpu, HardDrive, Server, Cloud, CloudOff, Repeat,
    Shuffle, Play, Pause, Square, Circle, Triangle,
    Hexagon, Octagon, Building2, CreditCard, Landmark,
    Receipt, HeadphonesIcon, PhoneCall, MailOpen,
    MapPinHouse, Building, Store, Globe2, Facebook,
    Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
    Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
    Activity, TrendingUp, Users, Briefcase, Calendar as CalendarIcon,
    User, Mail as MailIcon, Phone as PhoneIcon, Map,
    CreditCard as CreditCardIcon, Wallet, Banknote,
    Receipt as ReceiptIcon, Package as PackageIcon,
    Truck as TruckIcon, Clock as ClockIcon, ChevronDown,
    Copy as CopyIcon, User as UserIcon, Briefcase as BriefcaseIcon,
    MapPin as MapPinIcon, Phone as PhoneIcon2, Mail as MailIcon2
} from 'lucide-react';

// ==================== CONSTANTS ====================
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

const SECTIONS = [
    { 
        id: 'basic', 
        title: 'Basic Information', 
        icon: User, 
        color: appTheme.colors.primary,
        description: 'Professional details and business information'
    },
    { 
        id: 'contact', 
        title: 'Contact Information', 
        icon: Phone, 
        color: appTheme.colors.secondary,
        description: 'Contact details and service areas'
    },
    { 
        id: 'working', 
        title: 'Working Hours', 
        icon: Clock, 
        color: appTheme.colors.warning,
        description: 'Availability and schedule'
    },
    { 
        id: 'settings', 
        title: 'Settings & Policies', 
        icon: Settings, 
        color: appTheme.colors.info,
        description: 'Booking settings and cancellation policies'
    },
    { 
        id: 'documents', 
        title: 'Documents', 
        icon: FileText, 
        color: appTheme.colors.success,
        description: 'Verification documents and certifications'
    }
];

// Helper to validate ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export default function CreateBookingProfessionalPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const professionalId = searchParams.get("id");
    
    // Refs for scrolling to error fields
    const fieldRefs = useRef({});
    
    const { user, isAuthenticated, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();

    // Redirect if not authenticated or not company admin
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (!isCompanyAdmin && !isSuperAdmin) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isCompanyAdmin, isSuperAdmin, router]);

    // State management
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    
    // State for custom ID display
    const [customId, setCustomId] = useState(null);
    const [formattedId, setFormattedId] = useState(null);

    const [formData, setFormData] = useState({
        businessName: "",
        tagline: "",
        type: "individual",
        category: "beauty",
        specialization: [],
        experience: "",
        
        // Contact
        phone: "",
        email: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "India"
        },
        serviceType: "both",
        serviceAreas: [""],
        
        // WhatsApp
        whatsappBusinessId: "",
        autoReplyEnabled: false,
        autoReplyMessage: "Hello! Thank you for your message. Our team will get back to you soon.",
        
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
        
        // Settings
        bookingBuffer: "15",
        maxDailyBookings: "10",
        cancellationPolicy: "moderate",
        isVerified: false,
        isFeatured: false,
        
        // Social Media
        socialMedia: {
            website: "",
            facebook: "",
            instagram: "",
            linkedin: ""
        },
        
        // Documents
        documents: {
            idProof: "",
            qualificationProof: "",
            license: ""
        }
    });
    
    const [specializationInput, setSpecializationInput] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [companyInfo, setCompanyInfo] = useState(null);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(checkMobile, 150);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
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

    // Fetch company info on mount
    useEffect(() => {
        if (user?.companyId) {
            fetchCompanyInfo();
        }
    }, [user]);

    // Fetch professional data if editing
    useEffect(() => {
        if (professionalId && user?.companyId) {
            setIsEditing(true);
            fetchProfessional();
        }
    }, [professionalId, user]);

    // Scroll to first error field
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            if (fieldRefs.current[firstErrorField]) {
                fieldRefs.current[firstErrorField].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [errors]);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    // Fetch company info
    const fetchCompanyInfo = async () => {
        try {
            const res = await fetch(`/api/companies/me`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setCompanyInfo(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch company info:', error);
        }
    };

    // Format custom ID to 5-digit format
    const formatCustomId = (id) => {
        if (!id && id !== 0) return null;
        return String(id).padStart(5, '0');
    };

    const fetchProfessional = async () => {
        try {
            setLoading(true);
            setApiError(null);
            
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
                    // Set custom ID if available
                    if (professional.customId) {
                        setCustomId(professional.customId);
                        setFormattedId(formatCustomId(professional.customId));
                    }

                    setFormData({
                        businessName: professional.businessName || "",
                        tagline: professional.tagline || "",
                        type: professional.type || "individual",
                        category: professional.category || "beauty",
                        specialization: professional.specialization || [],
                        experience: professional.experience?.toString() || "",
                        
                        phone: professional.phone || "",
                        email: professional.email || "",
                        address: professional.address || {
                            street: "", city: "", state: "", zipCode: "", country: "India"
                        },
                        serviceType: professional.serviceType || "both",
                        serviceAreas: professional.serviceAreas?.length ? professional.serviceAreas : [""],
                        
                        whatsappBusinessId: professional.whatsappBusinessId || "",
                        autoReplyEnabled: professional.autoReplyEnabled || false,
                        autoReplyMessage: professional.autoReplyMessage || "Hello! Thank you for your message. Our team will get back to you soon.",
                        
                        workingHours: professional.workingHours || [
                            { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true, breaks: [] },
                            { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] },
                            { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }
                        ],
                        
                        bookingBuffer: professional.bookingBuffer?.toString() || "15",
                        maxDailyBookings: professional.maxDailyBookings?.toString() || "10",
                        cancellationPolicy: professional.cancellationPolicy || "moderate",
                        isVerified: professional.isVerified || false,
                        isFeatured: professional.isFeatured || false,
                        
                        socialMedia: professional.socialMedia || {
                            website: "", facebook: "", instagram: "", linkedin: ""
                        },
                        
                        documents: professional.documents || {
                            idProof: "", qualificationProof: "", license: ""
                        }
                    });
                    
                    showToast('success', 'Professional loaded successfully');
                } else {
                    showToast('error', 'Professional not found');
                    setTimeout(() => router.push("/admin/bookingService/bookingmng"), 2000);
                }
            } else {
                showToast('error', 'Failed to fetch professional: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching professional:', error);
            setApiError(error.message);
            showToast('error', error.message || 'Failed to load professional data');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Business name validation
        if (!formData.businessName.trim()) {
            newErrors.businessName = "Business name is required";
        }

        // Phone validation
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else {
            const digits = formData.phone.replace(/\D/g, '');
            if (digits.length < 10) {
                newErrors.phone = "Enter a valid phone number (10 digits)";
            }
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Address validation
        if (!formData.address.city.trim()) {
            newErrors.addressCity = "City is required";
        }

        if (!formData.address.state.trim()) {
            newErrors.addressState = "State is required";
        }

        if (!formData.address.zipCode.trim()) {
            newErrors.addressZipCode = "ZIP code is required";
        }

        // Service areas validation
        const hasValidServiceArea = formData.serviceAreas.some(area => area && area.trim() !== "");
        if (!hasValidServiceArea) {
            newErrors.serviceAreas = "At least one service area is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
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
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
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

    // Handle specialization
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
        
        if (errors.serviceAreas) {
            setErrors(prev => ({ ...prev, serviceAreas: "" }));
        }
    };

    const addServiceArea = () => {
        setFormData(prev => ({ ...prev, serviceAreas: [...prev.serviceAreas, ""] }));
    };

    const removeServiceArea = (index) => {
        if (formData.serviceAreas.length > 1) {
            const updatedAreas = formData.serviceAreas.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, serviceAreas: updatedAreas }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showToast('error', "Please fix the errors before submitting.");
            return;
        }

        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setSaving(true);
        setApiError(null);

        try {
            const filteredServiceAreas = formData.serviceAreas.filter(area => area && area.trim() !== "");
            
            const payload = {
                companyId: user.companyId,
                createdBy: user.id,
                businessName: formData.businessName.trim(),
                tagline: formData.tagline.trim() || undefined,
                type: formData.type,
                category: formData.category,
                specialization: formData.specialization,
                experience: formData.experience ? parseInt(formData.experience) : 0,
                phone: formData.phone.replace(/\D/g, ''),
                email: formData.email.toLowerCase().trim(),
                address: {
                    street: formData.address.street.trim() || undefined,
                    city: formData.address.city.trim(),
                    state: formData.address.state.trim(),
                    zipCode: formData.address.zipCode.trim(),
                    country: formData.address.country || "India"
                },
                serviceType: formData.serviceType,
                serviceAreas: filteredServiceAreas,
                workingHours: formData.workingHours,
                whatsappBusinessId: formData.whatsappBusinessId?.replace(/\D/g, '') || undefined,
                autoReplyEnabled: formData.autoReplyEnabled,
                autoReplyMessage: formData.autoReplyEnabled ? formData.autoReplyMessage : undefined,
                bookingBuffer: parseInt(formData.bookingBuffer) || 15,
                maxDailyBookings: parseInt(formData.maxDailyBookings) || 10,
                cancellationPolicy: formData.cancellationPolicy,
                isVerified: formData.isVerified,
                isFeatured: formData.isFeatured,
                socialMedia: formData.socialMedia,
                documents: formData.documents,
                verificationStatus: formData.isVerified ? 'verified' : 'pending',
                isActive: true
            };

            if (isEditing) {
                payload._id = professionalId;
                payload.updatedBy = user.id;
            }

            const url = "/api/bookingService/bookingmng";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', isEditing ? "✅ Professional updated successfully!" : "🎉 Professional created successfully!");
                setTimeout(() => router.push("/admin/bookingService/bookingmng"), 1500);
            } else {
                if (res.status === 403) {
                    throw new Error("You don't have permission to perform this action");
                }
                if (res.status === 409) {
                    throw new Error(data.error || 'Professional already exists');
                }
                throw new Error(data.error || data.message || "Failed to save professional");
            }
        } catch (error) {
            console.error('Error saving professional:', error);
            setApiError(error.message);
            showToast('error', `❌ Failed to save: ${error.message}`);
        } finally {
            setSaving(false);
            setIsSubmitting(false);
        }
    };

    const handleBack = useCallback(() => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/admin/bookingService/bookingmng");
        }
    }, [router]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('success', 'Copied to clipboard!');
    };

    if (loading && isEditing) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading professional data...</p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            <Head>
                <title>{isEditing ? 'Edit Professional' : 'Add Professional'} | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="professional-form-page">
                {/* Toast Notification */}
                {toast.show && (
                    <div className={`toast-notification ${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : 
                         toast.type === 'error' ? <AlertCircle size={20} /> : 
                         <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <header className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <button
                                onClick={handleBack}
                                className="back-button"
                            >
                                <ArrowLeft size={20} />
                                <span>Back to Professionals</span>
                            </button>
                            <h1 className="page-title">
                                {isEditing ? 'Edit Professional' : 'Add New Professional'}
                            </h1>
                            <p className="page-description">
                                {isEditing ? 'Update professional information' : 'Fill in the details to create a new service provider'}
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || isSubmitting}
                                className="save-button"
                            >
                                {saving || isSubmitting ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>{isEditing ? 'Update Professional' : 'Save Professional'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Company Context Banner */}
                <div className="company-banner">
                    <div className="company-banner-content">
                        <div className="company-banner-left">
                            <Building2 size={18} />
                            <span>
                                {isSuperAdmin ? 'Super Admin' : 'Company Admin'} · 
                                {companyInfo?.companyName || user?.companyName || 'Your Company'}
                            </span>
                        </div>
                        {isSuperAdmin && (
                            <div className="super-admin-badge">
                                <Shield size={14} />
                                Super Admin
                            </div>
                        )}
                    </div>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <div className="api-error">
                        <AlertCircle size={18} />
                        <span>{apiError}</span>
                    </div>
                )}

                {/* Professional ID Card - Only for editing */}
                {isEditing && customId && (
                    <div className="professional-id-card">
                        <div className="professional-id-info">
                            <Hash size={20} />
                            <div>
                                <span className="professional-id-label">Professional ID</span>
                                <span className="professional-id-value">{formattedId}</span>
                            </div>
                        </div>
                        <button 
                            className="copy-button"
                            onClick={() => copyToClipboard(formattedId)}
                        >
                            <CopyIcon size={16} />
                        </button>
                    </div>
                )}

                {/* Main Content - Single Scroll Page */}
                <main className="main-content">
                    {/* Form Sections - All Visible at Once */}
                    <div className="form-sections">
                        {/* ==================== BASIC INFORMATION SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.primary}15`, color: appTheme.colors.primary }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2>Basic Information</h2>
                                        <p>Professional details and business information</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>
                                            Business Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleInputChange}
                                            className={errors.businessName ? 'error' : ''}
                                            placeholder="e.g., John's Beauty Salon"
                                            ref={el => fieldRefs.current['businessName'] = el}
                                        />
                                        {errors.businessName && <span className="error-text">{errors.businessName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Tagline</label>
                                        <input
                                            type="text"
                                            name="tagline"
                                            value={formData.tagline}
                                            onChange={handleInputChange}
                                            placeholder="Brief description of your business"
                                        />
                                        <span className="field-hint">A short, catchy description</span>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-2">
                                        <label>Professional Type <span className="required">*</span></label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                        >
                                            {PROFESSIONAL_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.icon} {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Experience (years)</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="50"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Category <span className="required">*</span></label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.icon} {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Specializations</label>
                                        <div className="input-group">
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
                                                className="icon-button"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        
                                        {formData.specialization.length > 0 && (
                                            <div className="tags-container">
                                                {formData.specialization.map((spec, index) => (
                                                    <span key={index} className="tag">
                                                        {spec}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSpecialization(index)}
                                                            className="tag-remove"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ==================== CONTACT INFORMATION SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.secondary}15`, color: appTheme.colors.secondary }}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <h2>Contact Information</h2>
                                        <p>Contact details and service areas</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Phone Number <span className="required">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={errors.phone ? 'error' : ''}
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                            ref={el => fieldRefs.current['phone'] = el}
                                        />
                                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                                    </div>

                                    <div className="form-group span-2">
                                        <label>
                                            Email Address <span className="required">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={errors.email ? 'error' : ''}
                                            placeholder="professional@example.com"
                                            ref={el => fieldRefs.current['email'] = el}
                                        />
                                        {errors.email && <span className="error-text">{errors.email}</span>}
                                    </div>
                                </div>

                                <div className="form-block">
                                    <h3>
                                        <MapPin size={16} />
                                        Address
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group span-3">
                                            <label>Street Address</label>
                                            <input
                                                type="text"
                                                name="address.street"
                                                value={formData.address.street}
                                                onChange={handleInputChange}
                                                placeholder="Door No, Building, Street, Area"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>
                                                City <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address.city"
                                                value={formData.address.city}
                                                onChange={handleInputChange}
                                                className={errors.addressCity ? 'error' : ''}
                                                placeholder="City"
                                                ref={el => fieldRefs.current['addressCity'] = el}
                                            />
                                            {errors.addressCity && <span className="error-text">{errors.addressCity}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                State <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address.state"
                                                value={formData.address.state}
                                                onChange={handleInputChange}
                                                className={errors.addressState ? 'error' : ''}
                                                placeholder="State"
                                                ref={el => fieldRefs.current['addressState'] = el}
                                            />
                                            {errors.addressState && <span className="error-text">{errors.addressState}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                ZIP Code <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address.zipCode"
                                                value={formData.address.zipCode}
                                                onChange={handleInputChange}
                                                className={errors.addressZipCode ? 'error' : ''}
                                                placeholder="ZIP Code"
                                                maxLength="6"
                                                ref={el => fieldRefs.current['addressZipCode'] = el}
                                            />
                                            {errors.addressZipCode && <span className="error-text">{errors.addressZipCode}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-block">
                                    <h3>
                                        <Globe size={16} />
                                        Service Configuration
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group span-2">
                                            <label>Service Type <span className="required">*</span></label>
                                            <select
                                                name="serviceType"
                                                value={formData.serviceType}
                                                onChange={handleInputChange}
                                            >
                                                {SERVICE_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.icon} {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group span-3">
                                            <label>
                                                Service Areas <span className="required">*</span>
                                            </label>
                                            {errors.serviceAreas && <span className="error-text">{errors.serviceAreas}</span>}
                                            
                                            {formData.serviceAreas.map((area, index) => (
                                                <div key={index} className="input-group" style={{ marginBottom: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={area}
                                                        onChange={(e) => handleServiceAreaChange(index, e.target.value)}
                                                        placeholder={`Service area ${index + 1} (e.g., Downtown)`}
                                                    />
                                                    {formData.serviceAreas.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeServiceArea(index)}
                                                            className="icon-button error"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            <button
                                                type="button"
                                                onClick={addServiceArea}
                                                className="add-button"
                                            >
                                                <Plus size={16} />
                                                <span>Add Service Area</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-block">
                                    <h3>
                                        <Globe2 size={16} />
                                        Social Media
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Website</label>
                                            <input
                                                type="url"
                                                value={formData.socialMedia.website}
                                                onChange={(e) => handleSocialChange('website', e.target.value)}
                                                placeholder="https://example.com"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Facebook</label>
                                            <input
                                                type="url"
                                                value={formData.socialMedia.facebook}
                                                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Instagram</label>
                                            <input
                                                type="url"
                                                value={formData.socialMedia.instagram}
                                                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>

                                        <div className="form-group">
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
                            </div>
                        </div>

                        {/* ==================== WORKING HOURS SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.warning}15`, color: appTheme.colors.warning }}>
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h2>Working Hours</h2>
                                        <p>Availability and schedule</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <div className="quick-actions">
                                            <button
                                                type="button"
                                                onClick={() => toggleAllDays(true)}
                                                className="quick-action-btn"
                                                style={{ color: appTheme.colors.success }}
                                            >
                                                <CheckCircle size={14} />
                                                Open All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleAllDays(false)}
                                                className="quick-action-btn"
                                                style={{ color: appTheme.colors.error }}
                                            >
                                                <XCircle size={14} />
                                                Close All
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="hours-grid">
                                    {formData.workingHours.map((day, index) => (
                                        <div key={day.day} className="hour-card">
                                            <div className="hour-header">
                                                <label className="checkbox-label">
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
                        </div>

                        {/* ==================== SETTINGS & POLICIES SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.info}15`, color: appTheme.colors.info }}>
                                        <Settings size={20} />
                                    </div>
                                    <div>
                                        <h2>Settings & Policies</h2>
                                        <p>Booking settings and cancellation policies</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-block">
                                    <h3>
                                        <Settings size={16} />
                                        Booking Settings
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Booking Buffer (minutes)</label>
                                            <input
                                                type="number"
                                                name="bookingBuffer"
                                                value={formData.bookingBuffer}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="120"
                                                placeholder="15"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Max Daily Bookings</label>
                                            <input
                                                type="number"
                                                name="maxDailyBookings"
                                                value={formData.maxDailyBookings}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="50"
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-block">
                                    <h3>
                                        <Shield size={16} />
                                        Cancellation Policy
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group span-3">
                                            <select
                                                name="cancellationPolicy"
                                                value={formData.cancellationPolicy}
                                                onChange={handleInputChange}
                                            >
                                                {CANCELLATION_POLICIES.map(policy => (
                                                    <option key={policy.value} value={policy.value}>
                                                        {policy.icon} {policy.label} - {policy.description}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-block">
                                    <h3>
                                        <MessageSquare size={16} />
                                        WhatsApp Integration
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group span-2">
                                            <label>WhatsApp Business Number</label>
                                            <input
                                                type="text"
                                                name="whatsappBusinessId"
                                                value={formData.whatsappBusinessId}
                                                onChange={handleInputChange}
                                                placeholder="Enter WhatsApp number"
                                                maxLength="10"
                                            />
                                        </div>

                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="autoReplyEnabled"
                                                    checked={formData.autoReplyEnabled}
                                                    onChange={handleInputChange}
                                                />
                                                <span>Enable Auto-Reply</span>
                                            </label>
                                        </div>
                                    </div>

                                    {formData.autoReplyEnabled && (
                                        <div className="form-row">
                                            <div className="form-group span-3">
                                                <label>Auto-Reply Message</label>
                                                <textarea
                                                    name="autoReplyMessage"
                                                    rows="3"
                                                    value={formData.autoReplyMessage}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter auto-reply message"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-block">
                                    <h3>
                                        <ShieldCheck size={16} />
                                        Admin Settings
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="isVerified"
                                                    checked={formData.isVerified}
                                                    onChange={handleInputChange}
                                                />
                                                <span>Mark as Verified</span>
                                            </label>
                                        </div>

                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="isFeatured"
                                                    checked={formData.isFeatured}
                                                    onChange={handleInputChange}
                                                />
                                                <span>Feature this Professional</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ==================== DOCUMENTS SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.success}15`, color: appTheme.colors.success }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h2>Documents</h2>
                                        <p>Verification documents and certifications</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="docs-grid">
                                    <div className="doc-card">
                                        <div className="doc-icon" style={{ color: appTheme.colors.primary }}>
                                            <Award size={24} />
                                        </div>
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
                                        <div className="doc-icon" style={{ color: appTheme.colors.success }}>
                                            <Star size={24} />
                                        </div>
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
                                        <div className="doc-icon" style={{ color: appTheme.colors.warning }}>
                                            <Shield size={24} />
                                        </div>
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

                                <div className="info-box">
                                    <Info size={20} />
                                    <p>
                                        <strong>Note:</strong> Documents are required for verification. Upload clear copies of each document.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Mobile Save Button */}
                <div className="mobile-save">
                    <button
                        onClick={handleSubmit}
                        disabled={saving || isSubmitting}
                        className="mobile-save-btn"
                    >
                        {saving || isSubmitting ? (
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
                /* ==================== GLOBAL STYLES ==================== */
                .professional-form-page {
                    min-height: 100vh;
                    background: ${appTheme.colors.backgroundLight};
                    width: 100%;
                }

                /* ==================== LOADING ==================== */
                .loading-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: ${appTheme.colors.backgroundLight};
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid ${appTheme.colors.primary}20;
                    border-top-color: ${appTheme.colors.primary};
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 16px;
                }

                .loading-text {
                    color: ${appTheme.colors.textSecondary};
                    font-size: 0.875rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
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
                    background: ${appTheme.colors.backgroundCard};
                    border-radius: ${appTheme.radius.md};
                    box-shadow: ${appTheme.shadows.lg};
                    animation: slideInRight 0.3s ease;
                    font-size: 0.875rem;
                    max-width: 400px;
                    border: 1px solid ${appTheme.colors.border};
                }

                .toast-notification.success {
                    border-left: 4px solid ${appTheme.colors.success};
                }

                .toast-notification.error {
                    border-left: 4px solid ${appTheme.colors.error};
                }

                .toast-notification.warning {
                    border-left: 4px solid ${appTheme.colors.warning};
                }

                .toast-notification.success svg {
                    color: ${appTheme.colors.success};
                }

                .toast-notification.error svg {
                    color: ${appTheme.colors.error};
                }

                .toast-notification.warning svg {
                    color: ${appTheme.colors.warning};
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
                    background: ${appTheme.colors.backgroundCard};
                    border-bottom: 1px solid ${appTheme.colors.border};
                    padding: 20px 24px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                    width: 100%;
                }

                .header-content {
                    max-width: 100%;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 24px;
                }

                .header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    color: ${appTheme.colors.primary};
                    font-size: 0.813rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 4px 0;
                    transition: opacity 0.2s;
                    width: fit-content;
                }

                .back-button:hover {
                    opacity: 0.7;
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0;
                }

                .page-description {
                    color: ${appTheme.colors.textSecondary};
                    font-size: 0.875rem;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .save-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
                }

                .save-button:hover {
                    background: ${appTheme.colors.gradientStart};
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px ${appTheme.colors.primary}40;
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

                /* ==================== COMPANY BANNER ==================== */
                .company-banner {
                    width: 100%;
                    margin: 16px 0 0 0;
                    padding: 0 24px;
                }

                .company-banner-content {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                .company-banner-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${appTheme.colors.textPrimary};
                    font-size: 0.875rem;
                }

                .company-banner-left svg {
                    color: ${appTheme.colors.primary};
                }

                .super-admin-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: ${appTheme.colors.warning}15;
                    border: 1px solid ${appTheme.colors.warning}30;
                    border-radius: 20px;
                    color: ${appTheme.colors.warning};
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                /* ==================== API ERROR ==================== */
                .api-error {
                    width: 100%;
                    margin: 16px 0 0 0;
                    padding: 0 24px;
                }

                .api-error {
                    background: ${appTheme.colors.error}10;
                    border: 1px solid ${appTheme.colors.error}30;
                    border-radius: ${appTheme.radius.md};
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${appTheme.colors.error};
                    font-size: 0.875rem;
                }

                /* ==================== PROFESSIONAL ID CARD ==================== */
                .professional-id-card {
                    background: linear-gradient(135deg, ${appTheme.colors.primary}10, ${appTheme.colors.secondary}10);
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: ${appTheme.radius.md};
                    padding: 16px;
                    margin: 16px 24px 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .professional-id-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .professional-id-info svg {
                    color: ${appTheme.colors.primary};
                }

                .professional-id-label {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    display: block;
                }

                .professional-id-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: ${appTheme.colors.primary};
                    font-family: monospace;
                    letter-spacing: 1px;
                }

                .copy-button {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: ${appTheme.radius.sm};
                    padding: 8px;
                    color: ${appTheme.colors.primary};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .copy-button:hover {
                    background: ${appTheme.colors.hover};
                }

                /* ==================== MAIN CONTENT ==================== */
                .main-content {
                    width: 100%;
                    margin: 24px 0;
                    padding: 0 24px;
                }

                /* ==================== FORM SECTIONS ==================== */
                .form-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-section {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    overflow: hidden;
                }

                .section-header {
                    padding: 20px 24px;
                    background: #fafbfc;
                    border-bottom: 1px solid ${appTheme.colors.border};
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
                    border-radius: ${appTheme.radius.md};
                }

                .section-header-left h2 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 4px 0;
                }

                .section-header-left p {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    margin: 0;
                }

                .section-content {
                    padding: 24px;
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
                    color: ${appTheme.colors.textSecondary};
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed ${appTheme.colors.border};
                }

                /* ==================== FORM LAYOUT ==================== */
                .form-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .form-row:last-child {
                    margin-bottom: 0;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group.span-2 {
                    grid-column: span 2;
                }

                .form-group.span-3 {
                    grid-column: span 3;
                }

                .form-group.checkbox-group {
                    justify-content: flex-end;
                }

                .form-group label {
                    font-size: 0.813rem;
                    font-weight: 500;
                    color: ${appTheme.colors.textPrimary};
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .field-hint {
                    font-size: 0.688rem;
                    color: ${appTheme.colors.textSecondary};
                }

                .required {
                    color: ${appTheme.colors.error};
                    margin-left: 4px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.938rem;
                    transition: all 0.2s ease;
                    background: ${appTheme.colors.backgroundCard};
                    color: ${appTheme.colors.textPrimary};
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 4px ${appTheme.colors.primary}15;
                }

                .form-group input.error,
                .form-group select.error,
                .form-group textarea.error {
                    border-color: ${appTheme.colors.error};
                }

                .error-text {
                    font-size: 0.688rem;
                    color: ${appTheme.colors.error};
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 8px 0;
                    color: ${appTheme.colors.textPrimary};
                }

                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: ${appTheme.colors.primary};
                }

                /* ==================== INPUT GROUP ==================== */
                .input-group {
                    display: flex;
                    gap: 8px;
                }

                .input-group input {
                    flex: 1;
                }

                .icon-button {
                    padding: 12px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    background: ${appTheme.colors.backgroundLight};
                    color: ${appTheme.colors.textSecondary};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-button:hover {
                    background: ${appTheme.colors.hover};
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                .icon-button.error:hover {
                    color: ${appTheme.colors.error};
                    border-color: ${appTheme.colors.error};
                }

                .add-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.813rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-top: 8px;
                }

                .add-button:hover {
                    background: ${appTheme.colors.gradientStart};
                }

                /* ==================== TAGS ==================== */
                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }

                .tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    background: ${appTheme.colors.primary}10;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: 20px;
                    font-size: 0.813rem;
                    color: ${appTheme.colors.primary};
                }

                .tag-remove {
                    background: none;
                    border: none;
                    color: ${appTheme.colors.primary};
                    font-size: 1rem;
                    cursor: pointer;
                    padding: 0 2px;
                }

                /* ==================== WORKING HOURS ==================== */
                .quick-actions {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .quick-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 20px;
                    font-size: 0.75rem;
                    cursor: pointer;
                }

                .hours-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .hour-card {
                    padding: 12px;
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                }

                .hour-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .closed-badge {
                    font-size: 0.625rem;
                    padding: 2px 6px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 4px;
                    color: ${appTheme.colors.textSecondary};
                }

                .hour-times {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hour-times input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.sm};
                    font-size: 0.813rem;
                }

                .hour-times span {
                    color: ${appTheme.colors.textSecondary};
                    font-size: 0.75rem;
                }

                /* ==================== DOCUMENTS ==================== */
                .docs-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .doc-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px dashed ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                }

                .doc-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .doc-info {
                    flex: 1;
                }

                .doc-info h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 2px 0;
                }

                .doc-info p {
                    font-size: 0.688rem;
                    color: ${appTheme.colors.textSecondary};
                    margin: 0;
                }

                .upload-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 10px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.sm};
                    font-size: 0.688rem;
                    cursor: pointer;
                }

                .upload-btn:hover {
                    border-color: ${appTheme.colors.primary};
                    color: ${appTheme.colors.primary};
                }

                /* ==================== INFO BOX ==================== */
                .info-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: ${appTheme.colors.primary}10;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: ${appTheme.radius.md};
                }

                .info-box svg {
                    flex-shrink: 0;
                    color: ${appTheme.colors.primary};
                }

                .info-box p {
                    color: ${appTheme.colors.textPrimary};
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
                    background: linear-gradient(to top, ${appTheme.colors.backgroundLight}, transparent);
                    z-index: 100;
                }

                .mobile-save-btn {
                    width: 100%;
                    padding: 16px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 20px ${appTheme.colors.primary}40;
                }

                .mobile-save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ==================== RESPONSIVE ==================== */
                @media (max-width: 1200px) {
                    .header-content,
                    .main-content,
                    .company-banner,
                    .api-error,
                    .professional-id-card {
                        padding: 0 20px;
                    }
                }

                @media (max-width: 1024px) {
                    .form-row {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .form-group.span-2,
                    .form-group.span-3 {
                        grid-column: span 2;
                    }

                    .docs-grid {
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
                        padding: 0 16px;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .save-button {
                        display: none;
                    }

                    .mobile-save {
                        display: block;
                    }

                    .page-title {
                        font-size: 1.25rem;
                    }

                    .main-content {
                        padding: 0 16px 100px 16px;
                    }

                    .professional-id-card {
                        margin: 16px 16px 0 16px;
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

                    .section-header-left h2 {
                        font-size: 0.938rem;
                    }

                    .section-header-left p {
                        font-size: 0.688rem;
                    }

                    .section-content {
                        padding: 16px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .form-group.span-2,
                    .form-group.span-3 {
                        grid-column: span 1;
                    }

                    .hours-grid {
                        grid-template-columns: 1fr;
                    }

                    .docs-grid {
                        grid-template-columns: 1fr;
                    }

                    .company-banner,
                    .api-error {
                        padding: 0 16px;
                    }
                }

                @media (max-width: 480px) {
                    .form-group label {
                        font-size: 0.75rem;
                    }

                    .form-group input,
                    .form-group select,
                    .form-group textarea {
                        font-size: 16px;
                        padding: 10px 12px;
                    }

                    .hour-times {
                        flex-direction: column;
                    }

                    .hour-times input {
                        width: 100%;
                    }

                    .quick-actions {
                        flex-direction: column;
                    }

                    .quick-action-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .doc-card {
                        padding: 10px;
                    }
                }
            `}</style>
        </>
    );
}