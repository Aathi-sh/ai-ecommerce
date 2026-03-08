// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Head from 'next/head';
// import {
//   ArrowLeft, Save, User, Building, Mail, Phone,
//   MapPin, Briefcase, Clock, Globe, Shield, Plus,
//   Trash2, CheckCircle, XCircle, AlertCircle, ChevronDown,
//   ChevronUp, Home, Map, Truck, Zap, Settings, Users,
//   FileText, Award, Star, Wifi, Video, Calendar
// } from 'lucide-react';

// export default function CreateBookingmngPage() {
//   const router = useRouter();
  
//   const [loading, setLoading] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [activeTab, setActiveTab] = useState('basic');
//   const [expandedSections, setExpandedSections] = useState({
//     basic: true,
//     contact: false,
//     working: false,
//     settings: false,
//     documents: false
//   });
  
//   const [formData, setFormData] = useState({
//     userId: '',
//     businessName: '',
//     tagline: '',
//     type: 'individual',
//     category: 'beauty',
//     specialization: [],
//     experience: 0,
    
//     // Contact
//     phone: '',
//     email: '',
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       zipCode: '',
//       country: ''
//     },
//     serviceType: 'both',
    
//     // Working Hours (default)
//     workingHours: [
//       { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//       { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//       { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//       { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//       { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true },
//       { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
//       { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false }
//     ],
    
//     // Service Areas
//     serviceAreas: [''],
    
//     // WhatsApp
//     whatsappBusinessId: '',
//     autoReplyEnabled: false,
//     autoReplyMessage: 'Hello! Thank you for your message. Our team will get back to you soon.',
    
//     // Settings
//     bookingBuffer: 15,
//     maxDailyBookings: 10,
//     cancellationPolicy: 'moderate',
//     isVerified: false,
//     isFeatured: false,
    
//     // Documents (can be uploaded later)
//     documents: {
//       idProof: '',
//       qualificationProof: '',
//       license: ''
//     },
    
//     // Social Media (optional)
//     socialMedia: {
//       website: '',
//       facebook: '',
//       instagram: '',
//       linkedin: ''
//     }
//   });

//   const [specializationInput, setSpecializationInput] = useState('');
//   const [errors, setErrors] = useState({});
  
//   // Categories
//   const categories = [
//     { value: 'beauty', label: 'Beauty & Spa', icon: '💅' },
//     { value: 'health', label: 'Health & Wellness', icon: '🏥' },
//     { value: 'consulting', label: 'Consulting', icon: '💼' },
//     { value: 'repair', label: 'Repair & Maintenance', icon: '🔧' },
//     { value: 'education', label: 'Education & Training', icon: '📚' },
//     { value: 'fitness', label: 'Fitness', icon: '💪' },
//     { value: 'other', label: 'Other', icon: '📌' }
//   ];

//   // Types
//   const types = [
//     { value: 'individual', label: 'Individual', icon: '👤' },
//     { value: 'company', label: 'Company', icon: '🏢' },
//     { value: 'freelancer', label: 'Freelancer', icon: '🆓' },
//     { value: 'agency', label: 'Agency', icon: '🤝' }
//   ];

//   // Service Types
//   const serviceTypes = [
//     { value: 'onsite', label: 'Onsite Only', icon: '📍' },
//     { value: 'remote', label: 'Remote Only', icon: '💻' },
//     { value: 'both', label: 'Both Onsite & Remote', icon: '🔄' },
//     { value: 'mobile', label: 'Mobile Service', icon: '🚗' }
//   ];

//   // Cancellation Policies
//   const cancellationPolicies = [
//     { value: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before booking', icon: '🔄' },
//     { value: 'moderate', label: 'Moderate', description: '50% refund up to 12 hours before booking', icon: '⚖️' },
//     { value: 'strict', label: 'Strict', description: 'No refund within 24 hours', icon: '🔒' }
//   ];

//   // Days of week
//   const days = [
//     { value: 'monday', label: 'Monday' },
//     { value: 'tuesday', label: 'Tuesday' },
//     { value: 'wednesday', label: 'Wednesday' },
//     { value: 'thursday', label: 'Thursday' },
//     { value: 'friday', label: 'Friday' },
//     { value: 'saturday', label: 'Saturday' },
//     { value: 'sunday', label: 'Sunday' }
//   ];

//   // Fetch users for dropdown
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch('/api/bookingService/bookingmng?role=user&limit=50');
//       const data = await res.json();
//       if (data.success) {
//         setUsers(data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   // Toggle section expansion
//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   // Handle form input changes
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: type === 'checkbox' ? checked : value
//       }));
//     }
    
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   // Handle social media changes
//   const handleSocialChange = (platform, value) => {
//     setFormData(prev => ({
//       ...prev,
//       socialMedia: {
//         ...prev.socialMedia,
//         [platform]: value
//       }
//     }));
//   };

//   // Handle working hours changes
//   const handleWorkingHoursChange = (index, field, value) => {
//     const updatedHours = [...formData.workingHours];
//     updatedHours[index] = { ...updatedHours[index], [field]: value };
//     setFormData(prev => ({ ...prev, workingHours: updatedHours }));
//   };

//   // Toggle all working days
//   const toggleAllDays = (available) => {
//     const updatedHours = formData.workingHours.map(day => ({
//       ...day,
//       isAvailable: available
//     }));
//     setFormData(prev => ({ ...prev, workingHours: updatedHours }));
//   };

//   // Handle specialization input
//   const handleAddSpecialization = () => {
//     if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         specialization: [...prev.specialization, specializationInput.trim()]
//       }));
//       setSpecializationInput('');
//     }
//   };

//   const handleRemoveSpecialization = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       specialization: prev.specialization.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle service areas
//   const handleServiceAreaChange = (index, value) => {
//     const updatedAreas = [...formData.serviceAreas];
//     updatedAreas[index] = value;
//     setFormData(prev => ({ ...prev, serviceAreas: updatedAreas }));
//   };

//   const addServiceArea = () => {
//     setFormData(prev => ({ ...prev, serviceAreas: [...prev.serviceAreas, ''] }));
//   };

//   const removeServiceArea = (index) => {
//     if (formData.serviceAreas.length > 1) {
//       setFormData(prev => ({
//         ...prev,
//         serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
//       }));
//     }
//   };

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.userId) {
//       newErrors.userId = 'Please select a user';
//     }

//     if (!formData.businessName.trim()) {
//       newErrors.businessName = 'Business name is required';
//     }

//     if (!formData.phone.trim()) {
//       newErrors.phone = 'Phone number is required';
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'Email address is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       const firstError = Object.keys(errors)[0];
//       const element = document.querySelector(`[name="${firstError}"]`);
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//       return;
//     }

//     setLoading(true);

//     try {
//       // Filter out empty service areas
//       const filteredServiceAreas = formData.serviceAreas.filter(area => area.trim() !== '');
      
//       const payload = {
//         ...formData,
//         serviceAreas: filteredServiceAreas,
//         createdAt: new Date().toISOString(),
//         verificationStatus: 'pending',
//         isActive: true,
//         rating: { 
//           average: 0, 
//           totalReviews: 0, 
//           breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
//         },
//         totalBookings: 0,
//         completedBookings: 0
//       };

//       const res = await fetch('/api/bookingService/bookingmng', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();

//       if (data.success) {
//         alert('Professional created successfully!');
//         router.push('/admin/bookingService/bookingmng');
//       } else {
//         alert(`Error: ${data.error || 'Failed to create professional'}`);
//       }
//     } catch (error) {
//       console.error('Error creating professional:', error);
//       alert('Failed to create professional. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>Add New Professional | LFMS</title>
//       </Head>

//       <div className="create-professional-wrapper">
//         {/* Header */}
//         <div className="page-header">
//           <div className="header-left">
//             <Link href="/admin/bookingService/bookingmng" className="back-button">
//               <ArrowLeft size={18} />
//               <span>Back</span>
//             </Link>
//             <div>
//               <h1 className="page-title">Add New Professional</h1>
//               <p className="page-subtitle">Create a new service provider</p>
//             </div>
//           </div>
//           <div className="badge draft">Draft</div>
//         </div>

//         {/* Mobile Tabs */}
//         <div className="mobile-tabs">
//           <button onClick={() => setActiveTab('basic')} className={`mobile-tab ${activeTab === 'basic' ? 'active' : ''}`}>
//             <User size={16} /> Basic
//           </button>
//           <button onClick={() => setActiveTab('contact')} className={`mobile-tab ${activeTab === 'contact' ? 'active' : ''}`}>
//             <Phone size={16} /> Contact
//           </button>
//           <button onClick={() => setActiveTab('working')} className={`mobile-tab ${activeTab === 'working' ? 'active' : ''}`}>
//             <Clock size={16} /> Hours
//           </button>
//           <button onClick={() => setActiveTab('settings')} className={`mobile-tab ${activeTab === 'settings' ? 'active' : ''}`}>
//             <Settings size={16} /> Settings
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="form-container">
//           {/* Basic Information */}
//           <div className={`form-section ${activeTab === 'basic' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('basic')}>
//               <div className="section-title">
//                 <User size={18} />
//                 <h2>Basic Information</h2>
//                 <span className="required-badge">Required</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.basic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.basic ? 'expanded' : ''}`}>
//               {/* User Selection */}
//               <div className="form-group">
//                 <label className="form-label">
//                   Select User <span className="required-star">*</span>
//                 </label>
//                 <select
//                   name="userId"
//                   value={formData.userId}
//                   onChange={handleChange}
//                   className={`form-select ${errors.userId ? 'error' : ''}`}
//                 >
//                   <option value="">Choose a user</option>
//                   {users.map(user => (
//                     <option key={user._id} value={user._id}>
//                       {user.name} - {user.email}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.userId && <p className="error-message">{errors.userId}</p>}
//               </div>

//               {/* Business Name */}
//               <div className="form-group">
//                 <label className="form-label">
//                   Business Name <span className="required-star">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="businessName"
//                   value={formData.businessName}
//                   onChange={handleChange}
//                   className={`form-input ${errors.businessName ? 'error' : ''}`}
//                   placeholder="e.g., John's Beauty Salon"
//                 />
//                 {errors.businessName && <p className="error-message">{errors.businessName}</p>}
//               </div>

//               {/* Tagline */}
//               <div className="form-group">
//                 <label className="form-label">Tagline</label>
//                 <input
//                   type="text"
//                   name="tagline"
//                   value={formData.tagline}
//                   onChange={handleChange}
//                   className="form-input"
//                   placeholder="Brief description of your business"
//                 />
//                 <p className="field-hint">A short, catchy description</p>
//               </div>

//               {/* Professional Type */}
//               <div className="form-group">
//                 <label className="form-label">Professional Type <span className="required-star">*</span></label>
//                 <div className="type-cards">
//                   {types.map(type => (
//                     <label key={type.value} className={`type-card ${formData.type === type.value ? 'selected' : ''}`}>
//                       <input
//                         type="radio"
//                         name="type"
//                         value={type.value}
//                         checked={formData.type === type.value}
//                         onChange={handleChange}
//                       />
//                       <span className="type-icon">{type.icon}</span>
//                       <span className="type-label">{type.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Category */}
//               <div className="form-group">
//                 <label className="form-label">Category <span className="required-star">*</span></label>
//                 <div className="category-cards">
//                   {categories.map(cat => (
//                     <label key={cat.value} className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}>
//                       <input
//                         type="radio"
//                         name="category"
//                         value={cat.value}
//                         checked={formData.category === cat.value}
//                         onChange={handleChange}
//                       />
//                       <span className="category-icon">{cat.icon}</span>
//                       <span className="category-label">{cat.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Experience */}
//               <div className="form-group">
//                 <label className="form-label">Experience (years)</label>
//                 <input
//                   type="number"
//                   name="experience"
//                   value={formData.experience}
//                   onChange={handleChange}
//                   min="0"
//                   max="50"
//                   className="form-input"
//                 />
//               </div>

//               {/* Specialization */}
//               <div className="form-group">
//                 <label className="form-label">Specializations</label>
//                 <div className="specialization-group">
//                   <div className="specialization-input">
//                     <input
//                       type="text"
//                       value={specializationInput}
//                       onChange={(e) => setSpecializationInput(e.target.value)}
//                       className="form-input"
//                       placeholder="Add specialization"
//                     />
//                     <button type="button" onClick={handleAddSpecialization} className="add-btn">
//                       <Plus size={16} /> Add
//                     </button>
//                   </div>
//                   <div className="tags">
//                     {formData.specialization.map((spec, index) => (
//                       <span key={index} className="tag">
//                         {spec}
//                         <button type="button" onClick={() => handleRemoveSpecialization(index)}>×</button>
//                       </span>
//                     ))}
//                     {formData.specialization.length === 0 && (
//                       <p className="no-tags">No specializations added</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Contact Information */}
//           <div className={`form-section ${activeTab === 'contact' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('contact')}>
//               <div className="section-title">
//                 <Phone size={18} />
//                 <h2>Contact Information</h2>
//                 <span className="required-badge">Required</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.contact ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.contact ? 'expanded' : ''}`}>
//               {/* Phone & Email */}
//               <div className="form-row">
//                 <div className="form-group">
//                   <label className="form-label">Phone <span className="required-star">*</span></label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className={`form-input ${errors.phone ? 'error' : ''}`}
//                     placeholder="+91 98765 43210"
//                   />
//                   {errors.phone && <p className="error-message">{errors.phone}</p>}
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Email <span className="required-star">*</span></label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`form-input ${errors.email ? 'error' : ''}`}
//                     placeholder="professional@example.com"
//                   />
//                   {errors.email && <p className="error-message">{errors.email}</p>}
//                 </div>
//               </div>

//               {/* Service Type */}
//               <div className="form-group">
//                 <label className="form-label">Service Type <span className="required-star">*</span></label>
//                 <div className="service-cards">
//                   {serviceTypes.map(type => (
//                     <label key={type.value} className={`service-card ${formData.serviceType === type.value ? 'selected' : ''}`}>
//                       <input
//                         type="radio"
//                         name="serviceType"
//                         value={type.value}
//                         checked={formData.serviceType === type.value}
//                         onChange={handleChange}
//                       />
//                       <span className="service-icon">{type.icon}</span>
//                       <span className="service-label">{type.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Service Areas */}
//               <div className="form-group">
//                 <label className="form-label">Service Areas</label>
//                 <div className="service-areas">
//                   {formData.serviceAreas.map((area, index) => (
//                     <div key={index} className="service-area-input">
//                       <input
//                         type="text"
//                         value={area}
//                         onChange={(e) => handleServiceAreaChange(index, e.target.value)}
//                         className="form-input"
//                         placeholder="e.g., Downtown"
//                       />
//                       {formData.serviceAreas.length > 1 && (
//                         <button type="button" onClick={() => removeServiceArea(index)} className="remove-btn">
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                   <button type="button" onClick={addServiceArea} className="add-area-btn">
//                     <Plus size={16} /> Add Area
//                   </button>
//                 </div>
//               </div>

//               {/* Address */}
//               <div className="form-group">
//                 <label className="form-label">Address</label>
//                 <div className="address-grid">
//                   <input
//                     type="text"
//                     name="address.street"
//                     value={formData.address.street}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="Street"
//                   />
//                   <input
//                     type="text"
//                     name="address.city"
//                     value={formData.address.city}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="City"
//                   />
//                   <input
//                     type="text"
//                     name="address.state"
//                     value={formData.address.state}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="State"
//                   />
//                   <input
//                     type="text"
//                     name="address.zipCode"
//                     value={formData.address.zipCode}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="ZIP Code"
//                   />
//                   <input
//                     type="text"
//                     name="address.country"
//                     value={formData.address.country}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="Country"
//                   />
//                 </div>
//               </div>

//               {/* Social Media */}
//               <div className="form-group">
//                 <label className="form-label">Social Media (Optional)</label>
//                 <div className="social-grid">
//                   <input
//                     type="url"
//                     value={formData.socialMedia.website}
//                     onChange={(e) => handleSocialChange('website', e.target.value)}
//                     className="form-input"
//                     placeholder="Website"
//                   />
//                   <input
//                     type="url"
//                     value={formData.socialMedia.facebook}
//                     onChange={(e) => handleSocialChange('facebook', e.target.value)}
//                     className="form-input"
//                     placeholder="Facebook"
//                   />
//                   <input
//                     type="url"
//                     value={formData.socialMedia.instagram}
//                     onChange={(e) => handleSocialChange('instagram', e.target.value)}
//                     className="form-input"
//                     placeholder="Instagram"
//                   />
//                   <input
//                     type="url"
//                     value={formData.socialMedia.linkedin}
//                     onChange={(e) => handleSocialChange('linkedin', e.target.value)}
//                     className="form-input"
//                     placeholder="LinkedIn"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Working Hours */}
//           <div className={`form-section ${activeTab === 'working' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('working')}>
//               <div className="section-title">
//                 <Clock size={18} />
//                 <h2>Working Hours</h2>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.working ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.working ? 'expanded' : ''}`}>
//               <div className="quick-actions">
//                 <button type="button" onClick={() => toggleAllDays(true)} className="quick-btn">
//                   <CheckCircle size={14} /> Open All
//                 </button>
//                 <button type="button" onClick={() => toggleAllDays(false)} className="quick-btn">
//                   <XCircle size={14} /> Close All
//                 </button>
//               </div>

//               <div className="hours-grid">
//                 {formData.workingHours.map((day, index) => (
//                   <div key={day.day} className="hour-card">
//                     <div className="hour-day">
//                       <label className="day-check">
//                         <input
//                           type="checkbox"
//                           checked={day.isAvailable}
//                           onChange={(e) => handleWorkingHoursChange(index, 'isAvailable', e.target.checked)}
//                         />
//                         <span>{days.find(d => d.value === day.day)?.label}</span>
//                       </label>
//                       {!day.isAvailable && <span className="closed">Closed</span>}
//                     </div>
//                     {day.isAvailable && (
//                       <div className="hour-times">
//                         <input
//                           type="time"
//                           value={day.startTime}
//                           onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
//                         />
//                         <span>to</span>
//                         <input
//                           type="time"
//                           value={day.endTime}
//                           onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Settings */}
//           <div className={`form-section ${activeTab === 'settings' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('settings')}>
//               <div className="section-title">
//                 <Settings size={18} />
//                 <h2>Settings</h2>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.settings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.settings ? 'expanded' : ''}`}>
//               <div className="settings-grid">
//                 <div className="setting-card">
//                   <div className="setting-header">
//                     <Clock size={16} />
//                     <h3>Booking Buffer</h3>
//                   </div>
//                   <div className="setting-control">
//                     <input
//                       type="number"
//                       name="bookingBuffer"
//                       value={formData.bookingBuffer}
//                       onChange={handleChange}
//                       min="0"
//                       max="120"
//                     />
//                     <span>minutes</span>
//                   </div>
//                 </div>

//                 <div className="setting-card">
//                   <div className="setting-header">
//                     <Calendar size={16} />
//                     <h3>Max Bookings/Day</h3>
//                   </div>
//                   <div className="setting-control">
//                     <input
//                       type="number"
//                       name="maxDailyBookings"
//                       value={formData.maxDailyBookings}
//                       onChange={handleChange}
//                       min="1"
//                       max="50"
//                     />
//                     <span>bookings</span>
//                   </div>
//                 </div>

//                 <div className="setting-card full-width">
//                   <div className="setting-header">
//                     <Shield size={16} />
//                     <h3>Cancellation Policy</h3>
//                   </div>
//                   <div className="policy-cards">
//                     {cancellationPolicies.map(policy => (
//                       <label key={policy.value} className={`policy-card ${formData.cancellationPolicy === policy.value ? 'selected' : ''}`}>
//                         <input
//                           type="radio"
//                           name="cancellationPolicy"
//                           value={policy.value}
//                           checked={formData.cancellationPolicy === policy.value}
//                           onChange={handleChange}
//                         />
//                         <span className="policy-icon">{policy.icon}</span>
//                         <div>
//                           <span className="policy-name">{policy.label}</span>
//                           <span className="policy-desc">{policy.description}</span>
//                         </div>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="setting-card full-width">
//                   <div className="setting-header">
//                     <Wifi size={16} />
//                     <h3>WhatsApp</h3>
//                   </div>
//                   <input
//                     type="text"
//                     name="whatsappBusinessId"
//                     value={formData.whatsappBusinessId}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="WhatsApp Business Number"
//                   />
//                   <label className="checkbox">
//                     <input
//                       type="checkbox"
//                       name="autoReplyEnabled"
//                       checked={formData.autoReplyEnabled}
//                       onChange={handleChange}
//                     />
//                     <span>Enable Auto-Reply</span>
//                   </label>
//                   {formData.autoReplyEnabled && (
//                     <textarea
//                       name="autoReplyMessage"
//                       value={formData.autoReplyMessage}
//                       onChange={handleChange}
//                       rows="2"
//                       className="form-input"
//                       placeholder="Auto-reply message"
//                     />
//                   )}
//                 </div>

//                 <div className="setting-card full-width">
//                   <div className="setting-header">
//                     <Shield size={16} />
//                     <h3>Admin Settings</h3>
//                   </div>
//                   <div className="admin-checks">
//                     <label className="checkbox">
//                       <input
//                         type="checkbox"
//                         name="isVerified"
//                         checked={formData.isVerified}
//                         onChange={handleChange}
//                       />
//                       <span>Mark as Verified</span>
//                     </label>
//                     <label className="checkbox">
//                       <input
//                         type="checkbox"
//                         name="isFeatured"
//                         checked={formData.isFeatured}
//                         onChange={handleChange}
//                       />
//                       <span>Feature this Professional</span>
//                     </label>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Documents */}
//           <div className="form-section">
//             <div className="section-header" onClick={() => toggleSection('documents')}>
//               <div className="section-title">
//                 <FileText size={18} />
//                 <h2>Documents</h2>
//                 <span className="optional-badge">Optional</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.documents ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.documents ? 'expanded' : ''}`}>
//               <div className="docs-grid">
//                 <div className="doc-card">
//                   <Award size={24} />
//                   <div>
//                     <h4>ID Proof</h4>
//                     <p>Government ID</p>
//                   </div>
//                   <button type="button" className="upload-btn">Upload</button>
//                 </div>
//                 <div className="doc-card">
//                   <Star size={24} />
//                   <div>
//                     <h4>Qualification</h4>
//                     <p>Certificates</p>
//                   </div>
//                   <button type="button" className="upload-btn">Upload</button>
//                 </div>
//                 <div className="doc-card">
//                   <Shield size={24} />
//                   <div>
//                     <h4>License</h4>
//                     <p>Business license</p>
//                   </div>
//                   <button type="button" className="upload-btn">Upload</button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="form-actions">
//             <Link href="/admin/bookingService/bookingmng" className="cancel-btn">
//               Cancel
//             </Link>
//             <button type="submit" disabled={loading} className="submit-btn">
//               {loading ? <><span className="spinner"></span> Creating...</> : <><Save size={18} /> Create Professional</>}
//             </button>
//           </div>
//         </form>
//       </div>

//       <style jsx>{`
//         .create-professional-wrapper {
//           width: 100%;
//         }

//         /* Header */
//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 20px;
//         }

//         .header-left {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .back-button {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 12px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           color: #1e293b;
//           font-size: 0.9rem;
//           text-decoration: none;
//           white-space: nowrap;
//         }

//         .back-button:hover {
//           background: #f8fafc;
//         }

//         .page-title {
//           font-size: 1.5rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
//         }

//         .page-subtitle {
//           color: #64748b;
//           font-size: 0.85rem;
//           margin: 2px 0 0;
//         }

//         .badge {
//           padding: 4px 10px;
//           border-radius: 20px;
//           font-size: 0.7rem;
//           font-weight: 500;
//           background: #f1f5f9;
//           color: #475569;
//           border: 1px solid #e2e8f0;
//         }

//         /* Mobile Tabs */
//         .mobile-tabs {
//           display: none;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 10px;
//           padding: 4px;
//           margin-bottom: 16px;
//           gap: 4px;
//         }

//         @media (max-width: 1024px) {
//           .mobile-tabs {
//             display: flex;
//           }
//         }

//         .mobile-tab {
//           flex: 1;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 4px;
//           padding: 8px 4px;
//           border: none;
//           background: transparent;
//           color: #64748b;
//           font-size: 0.8rem;
//           border-radius: 8px;
//           cursor: pointer;
//         }

//         .mobile-tab.active {
//           background: #3b82f6;
//           color: white;
//         }

//         /* Form Container */
//         .form-container {
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         /* Form Sections */
//         .form-section {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           overflow: hidden;
//         }

//         @media (max-width: 1024px) {
//           .form-section:not(.active) {
//             display: none;
//           }
//         }

//         .section-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 14px 16px;
//           cursor: pointer;
//           background: white;
//         }

//         .section-header:hover {
//           background: #f8fafc;
//         }

//         .section-title {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .section-title svg {
//           color: #3b82f6;
//         }

//         .section-title h2 {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
//         }

//         .required-badge,
//         .optional-badge {
//           padding: 2px 8px;
//           border-radius: 20px;
//           font-size: 0.65rem;
//           font-weight: 500;
//           background: #f1f5f9;
//           color: #475569;
//         }

//         .required-badge {
//           background: #fee2e2;
//           color: #991b1b;
//         }

//         .section-toggle {
//           padding: 4px;
//           background: transparent;
//           border: none;
//           color: #64748b;
//           cursor: pointer;
//           border-radius: 4px;
//         }

//         .section-content {
//           max-height: 0;
//           padding: 0 16px;
//           overflow: hidden;
//           transition: all 0.2s;
//         }

//         .section-content.expanded {
//           max-height: 2000px;
//           padding: 16px;
//           border-top: 1px solid #e2e8f0;
//         }

//         /* Form Elements */
//         .form-group {
//           margin-bottom: 16px;
//         }

//         .form-group:last-child {
//           margin-bottom: 0;
//         }

//         .form-row {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 12px;
//           margin-bottom: 16px;
//         }

//         @media (max-width: 640px) {
//           .form-row {
//             grid-template-columns: 1fr;
//           }
//         }

//         .form-label {
//           display: block;
//           font-size: 0.85rem;
//           font-weight: 500;
//           color: #1e293b;
//           margin-bottom: 4px;
//         }

//         .required-star {
//           color: #ef4444;
//         }

//         .form-input,
//         .form-select {
//           width: 100%;
//           padding: 8px 12px;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           font-size: 0.9rem;
//           background: white;
//         }

//         .form-input:focus,
//         .form-select:focus {
//           outline: none;
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         .form-input.error,
//         .form-select.error {
//           border-color: #ef4444;
//         }

//         .error-message {
//           color: #ef4444;
//           font-size: 0.75rem;
//           margin-top: 4px;
//         }

//         .field-hint {
//           color: #64748b;
//           font-size: 0.75rem;
//           margin-top: 4px;
//         }

//         /* Type Cards */
//         .type-cards {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .type-cards {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         .type-card {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 4px;
//           padding: 12px 4px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 10px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .type-card input {
//           position: absolute;
//           opacity: 0;
//         }

//         .type-card.selected {
//           background: #eff6ff;
//           border-color: #3b82f6;
//         }

//         .type-icon {
//           font-size: 1.5rem;
//         }

//         .type-label {
//           font-size: 0.75rem;
//           font-weight: 500;
//           color: #1e293b;
//         }

//         /* Category Cards */
//         .category-cards {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 1024px) {
//           .category-cards {
//             grid-template-columns: repeat(3, 1fr);
//           }
//         }

//         @media (max-width: 640px) {
//           .category-cards {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         .category-card {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 4px;
//           padding: 12px 4px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 10px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .category-card input {
//           position: absolute;
//           opacity: 0;
//         }

//         .category-card.selected {
//           background: #eff6ff;
//           border-color: #3b82f6;
//         }

//         .category-icon {
//           font-size: 1.5rem;
//         }

//         .category-label {
//           font-size: 0.7rem;
//           font-weight: 500;
//           color: #1e293b;
//           text-align: center;
//         }

//         /* Specialization */
//         .specialization-group {
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .specialization-input {
//           display: flex;
//           gap: 6px;
//         }

//         .add-btn {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           padding: 0 12px;
//           background: #f1f5f9;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           color: #1e293b;
//           font-size: 0.85rem;
//           white-space: nowrap;
//           cursor: pointer;
//         }

//         .tags {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 6px;
//         }

//         .tag {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 4px 8px;
//           background: #eff6ff;
//           border: 1px solid #bfdbfe;
//           border-radius: 20px;
//           font-size: 0.8rem;
//           color: #1e40af;
//         }

//         .tag button {
//           border: none;
//           background: transparent;
//           color: #1e40af;
//           cursor: pointer;
//           font-size: 1rem;
//           padding: 0;
//         }

//         .no-tags {
//           color: #94a3b8;
//           font-size: 0.8rem;
//           margin: 0;
//         }

//         /* Service Cards */
//         .service-cards {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .service-cards {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         .service-card {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 4px;
//           padding: 12px 4px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 10px;
//           cursor: pointer;
//         }

//         .service-card input {
//           position: absolute;
//           opacity: 0;
//         }

//         .service-card.selected {
//           background: #eff6ff;
//           border-color: #3b82f6;
//         }

//         .service-icon {
//           font-size: 1.5rem;
//         }

//         .service-label {
//           font-size: 0.7rem;
//           font-weight: 500;
//           color: #1e293b;
//           text-align: center;
//         }

//         /* Service Areas */
//         .service-areas {
//           display: flex;
//           flex-direction: column;
//           gap: 6px;
//         }

//         .service-area-input {
//           display: flex;
//           gap: 6px;
//         }

//         .remove-btn {
//           padding: 0 8px;
//           background: #fef2f2;
//           border: 1px solid #fecaca;
//           border-radius: 8px;
//           color: #ef4444;
//           cursor: pointer;
//         }

//         .add-area-btn {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 4px;
//           padding: 8px;
//           background: white;
//           border: 1px dashed #cbd5e1;
//           border-radius: 8px;
//           color: #64748b;
//           font-size: 0.85rem;
//           cursor: pointer;
//         }

//         /* Address Grid */
//         .address-grid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .address-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         /* Social Grid */
//         .social-grid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .social-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         /* Working Hours */
//         .quick-actions {
//           display: flex;
//           gap: 8px;
//           margin-bottom: 12px;
//         }

//         .quick-btn {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           padding: 6px 12px;
//           background: #f1f5f9;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           color: #1e293b;
//           font-size: 0.8rem;
//           cursor: pointer;
//         }

//         .hours-grid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .hours-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .hour-card {
//           padding: 10px;
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//         }

//         .hour-day {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 6px;
//         }

//         .day-check {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 0.85rem;
//           font-weight: 500;
//         }

//         .closed {
//           font-size: 0.7rem;
//           padding: 2px 6px;
//           background: #f1f5f9;
//           border-radius: 4px;
//           color: #64748b;
//         }

//         .hour-times {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .hour-times input {
//           flex: 1;
//           padding: 4px;
//           border: 1px solid #e2e8f0;
//           border-radius: 4px;
//           font-size: 0.8rem;
//         }

//         .hour-times span {
//           color: #64748b;
//           font-size: 0.7rem;
//         }

//         /* Settings */
//         .settings-grid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 12px;
//         }

//         @media (max-width: 640px) {
//           .settings-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .setting-card {
//           padding: 12px;
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//         }

//         .setting-card.full-width {
//           grid-column: span 2;
//         }

//         @media (max-width: 640px) {
//           .setting-card.full-width {
//             grid-column: span 1;
//           }
//         }

//         .setting-header {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           margin-bottom: 8px;
//         }

//         .setting-header h3 {
//           font-size: 0.85rem;
//           font-weight: 600;
//           margin: 0;
//         }

//         .setting-control {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//         }

//         .setting-control input {
//           width: 60px;
//           padding: 4px 6px;
//           border: 1px solid #e2e8f0;
//           border-radius: 4px;
//           text-align: center;
//         }

//         .setting-control span {
//           font-size: 0.8rem;
//           color: #64748b;
//         }

//         /* Policy Cards */
//         .policy-cards {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .policy-cards {
//             grid-template-columns: 1fr;
//           }
//         }

//         .policy-card {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           cursor: pointer;
//         }

//         .policy-card input {
//           position: absolute;
//           opacity: 0;
//         }

//         .policy-card.selected {
//           background: #eff6ff;
//           border-color: #3b82f6;
//         }

//         .policy-icon {
//           font-size: 1.2rem;
//         }

//         .policy-name {
//           display: block;
//           font-size: 0.8rem;
//           font-weight: 500;
//         }

//         .policy-desc {
//           display: block;
//           font-size: 0.7rem;
//           color: #64748b;
//         }

//         /* Checkbox */
//         .checkbox {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 0.85rem;
//           cursor: pointer;
//           padding: 4px 0;
//         }

//         /* Admin Checks */
//         .admin-checks {
//           display: flex;
//           flex-direction: column;
//           gap: 4px;
//         }

//         /* Documents */
//         .docs-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .docs-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .doc-card {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px;
//           background: #f8fafc;
//           border: 1px dashed #cbd5e1;
//           border-radius: 8px;
//         }

//         .doc-card svg {
//           color: #3b82f6;
//         }

//         .doc-card h4 {
//           font-size: 0.85rem;
//           font-weight: 600;
//           margin: 0;
//         }

//         .doc-card p {
//           font-size: 0.7rem;
//           color: #64748b;
//           margin: 2px 0 0;
//         }

//         .upload-btn {
//           margin-left: auto;
//           padding: 4px 8px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           font-size: 0.7rem;
//           cursor: pointer;
//         }

//         /* Form Actions */
//         .form-actions {
//           display: flex;
//           justify-content: flex-end;
//           gap: 10px;
//           margin-top: 16px;
//         }

//         @media (max-width: 640px) {
//           .form-actions {
//             flex-direction: column;
//           }
//         }

//         .cancel-btn,
//         .submit-btn {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 6px;
//           padding: 10px 24px;
//           border-radius: 8px;
//           font-size: 0.9rem;
//           font-weight: 500;
//           text-decoration: none;
//           border: none;
//           cursor: pointer;
//         }

//         @media (max-width: 640px) {
//           .cancel-btn,
//           .submit-btn {
//             width: 100%;
//           }
//         }

//         .cancel-btn {
//           background: white;
//           border: 1px solid #e2e8f0;
//           color: #475569;
//         }

//         .submit-btn {
//           background: #3b82f6;
//           color: white;
//         }

//         .submit-btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .spinner {
//           width: 16px;
//           height: 16px;
//           border: 2px solid rgba(255,255,255,0.3);
//           border-top-color: white;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//         }

//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//       `}</style>
//     </>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { appTheme } from '../../../../../src/constants/theme';
import {
    ArrowLeft, Save, User, Building, Mail, Phone,
    MapPin, Briefcase, Clock, Globe, Shield, Plus,
    Trash2, CheckCircle, XCircle, AlertCircle, ChevronRight,
    ChevronDown, ChevronUp, Home, Map, Truck, Zap, Settings, Users,
    FileText, Award, Star, Wifi, Video, Calendar, Layers, Layout,
    Info, AlertTriangle, Check, Loader2, Camera, Image as ImageIcon,
    Link2, AtSign, Hash, FileSignature, Palette, Brush, Sparkles,
    Crown, Gem, Diamond, Gift, ThumbsUp, ThumbsDown, MessageSquare,
    Send, Paperclip, Smile, Grid, List, RefreshCw, Filter,
    Search, MoreVertical, Download, Printer, Share2, Bookmark,
    Eye, EyeOff, Lock, Unlock, Key, WifiOff, Battery, BatteryCharging,
    Cpu, HardDrive, Server, Cloud, CloudOff, Repeat, Shuffle,
    Play, Pause, Square, Circle, Triangle, Hexagon, Octagon,
    Building2, CreditCard, Landmark, Receipt, HeadphonesIcon,
    PhoneCall, MailOpen, MapPinHouse, Store, Globe2, Facebook,
    Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
    Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
    Activity, TrendingUp, Briefcase as BriefcaseIcon,
    Calendar as CalendarIcon, Clock as ClockIcon,
    Map as MapIcon, Truck as TruckIcon, Zap as ZapIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
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
        color: appTheme.colors.success,
        description: 'Booking settings and cancellation policies'
    },
    { 
        id: 'documents', 
        title: 'Documents', 
        icon: FileText, 
        color: appTheme.colors.info,
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
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // const [users, setUsers] = useState([]); // REMOVED - User selection no longer needed
    const [expandedSections, setExpandedSections] = useState(['basic']);
    const [activeTab, setActiveTab] = useState('basic');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [isMobile, setIsMobile] = useState(false);
    
    const [formData, setFormData] = useState({
        // userId: '', // REMOVED - User selection removed
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
            country: ''
        },
        serviceType: 'both',
        
        // Working Hours
        workingHours: [
            { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
            { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false }
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

    const [specializationInput, setSpecializationInput] = useState('');
    const [errors, setErrors] = useState({});

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

    // REMOVED: fetchUsers function - No longer needed
    // const fetchUsers = async () => { ... }

    // REMOVED: useEffect for fetching users
    // useEffect(() => { fetchUsers(); }, []);

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
        
        // Clear error for this field if it exists
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

        // REMOVED: userId validation
        // if (!formData.userId) {
        //     newErrors.userId = 'Please select a user';
        // }

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

        try {
            // Filter out empty service areas
            const filteredServiceAreas = formData.serviceAreas.filter(area => area && area.trim() !== '');
            
            const payload = {
                ...formData,
                serviceAreas: filteredServiceAreas,
                createdAt: new Date().toISOString(),
                verificationStatus: 'pending',
                isActive: true,
                rating: { 
                    average: 0, 
                    totalReviews: 0, 
                    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
                },
                totalBookings: 0,
                completedBookings: 0
            };

            const res = await fetch('/api/bookingService/bookingmng', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', 'Professional created successfully!');
                // If there's a temporary password for new user, show it
                if (data.tempPassword) {
                    setTimeout(() => {
                        alert(`New user created!\nEmail: ${formData.email}\nTemporary Password: ${data.tempPassword}\n\nPlease share this with the professional.`);
                    }, 500);
                }
                setTimeout(() => router.push('/admin/bookingService/bookingmng'), 1500);
            } else {
                showToast('error', `Error: ${data.error || 'Failed to create professional'}`);
            }
        } catch (error) {
            console.error('Error creating professional:', error);
            showToast('error', 'Failed to create professional. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-grid">
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                </div>
                <p className="loading-text">Loading...</p>
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

    return (
        <>
            <Head>
                <title>Add New Professional | LFMS</title>
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
                                Add New Professional
                            </h1>
                            <p className="page-description">
                                Create a new service provider with complete details
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
                                onClick={handleSubmit}
                                disabled={saving}
                                className="save-button"
                            >
                                {saving ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Create Professional</span>
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
                                                            {/* REMOVED: User Selection Dropdown */}
                                                            {/* <div className="form-field span-2">
                                                                <label>Select User <span className="required">*</span></label>
                                                                <select ...>
                                                                    ...
                                                                </select>
                                                            </div> */}

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
                                                                                borderColor: formData.type === type.value ? type.color : appTheme.colors.border,
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
                                                                                borderColor: formData.category === cat.value ? cat.color : appTheme.colors.border,
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
                                                                    className="form-input"
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
                                                                                borderColor: formData.serviceType === type.value ? type.color : appTheme.colors.border,
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
                                                                    style={{ color: appTheme.colors.success }}
                                                                >
                                                                    <CheckCircle size={14} />
                                                                    Open All
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAllDays(false)}
                                                                    className="quick-btn"
                                                                    style={{ color: appTheme.colors.error }}
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
                                                                        borderColor: formData.cancellationPolicy === policy.value ? policy.color : appTheme.colors.border,
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
                                                                <Award size={24} style={{ color: appTheme.colors.primary }} />
                                                                <div className="doc-info">
                                                                    <h4>ID Proof</h4>
                                                                    <p>Government ID</p>
                                                                </div>
                                                                <button type="button" className="upload-btn">
                                                                    <Upload size={14} />
                                                                    Upload
                                                                </button>
                                                            </div>

                                                            <div className="doc-card">
                                                                <Star size={24} style={{ color: appTheme.colors.secondary }} />
                                                                <div className="doc-info">
                                                                    <h4>Qualification</h4>
                                                                    <p>Certificates</p>
                                                                </div>
                                                                <button type="button" className="upload-btn">
                                                                    <Upload size={14} />
                                                                    Upload
                                                                </button>
                                                            </div>

                                                            <div className="doc-card">
                                                                <Shield size={24} style={{ color: appTheme.colors.warning }} />
                                                                <div className="doc-info">
                                                                    <h4>License</h4>
                                                                    <p>Business license</p>
                                                                </div>
                                                                <button type="button" className="upload-btn">
                                                                    <Upload size={14} />
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
                                <span>Create Professional</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .create-professional-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                    font-family: ${appTheme.fonts.primary};
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
                    background: white;
                    border-bottom: 1px solid ${appTheme.colors.border};
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
                    color: ${appTheme.colors.primary};
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
                    color: ${appTheme.colors.primary};
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .header-action-btn:hover {
                    background: #f1f5f9;
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                .save-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
                }

                .save-button:hover {
                    background: #2563eb;
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
                    border-top: 1px solid ${appTheme.colors.border};
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
                    border-bottom: 1px dashed ${appTheme.colors.border};
                }

                .form-block h3 svg {
                    color: ${appTheme.colors.primary};
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.938rem;
                    transition: all 0.2s ease;
                    background: white;
                    font-family: ${appTheme.fonts.primary};
                }

                .form-field input:focus,
                .form-field select:focus,
                .form-field textarea:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
                }

                .form-field input.error,
                .form-field select.error,
                .form-field textarea.error {
                    border-color: ${appTheme.colors.error};
                }

                .error-text {
                    font-size: 0.688rem;
                    color: ${appTheme.colors.error};
                }

                .required {
                    color: ${appTheme.colors.error};
                }

                .hint {
                    font-size: 0.688rem;
                    color: #94a3b8;
                }

                /* ==================== TYPE CARDS ==================== */
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .type-card input {
                    position: absolute;
                    opacity: 0;
                }

                .type-card.selected {
                    background: ${appTheme.colors.primary}10;
                    border-color: ${appTheme.colors.primary};
                }

                .type-icon {
                    font-size: 1.5rem;
                }

                .type-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #1e293b;
                }

                /* ==================== CATEGORY CARDS ==================== */
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .category-card input {
                    position: absolute;
                    opacity: 0;
                }

                .category-card.selected {
                    background: ${appTheme.colors.primary}10;
                    border-color: ${appTheme.colors.primary};
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

                /* ==================== SERVICE CARDS ==================== */
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .service-card input {
                    position: absolute;
                    opacity: 0;
                }

                .service-card.selected {
                    background: ${appTheme.colors.primary}10;
                    border-color: ${appTheme.colors.primary};
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

                /* ==================== SPECIALIZATION ==================== */
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
                    background: ${appTheme.colors.primary}10;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: 8px;
                    color: ${appTheme.colors.primary};
                    font-size: 0.85rem;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .add-btn:hover {
                    background: ${appTheme.colors.primary}20;
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
                    background: ${appTheme.colors.primary}10;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    color: ${appTheme.colors.primary};
                }

                .tag button {
                    border: none;
                    background: transparent;
                    color: ${appTheme.colors.primary};
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0;
                }

                .no-tags {
                    color: #94a3b8;
                    font-size: 0.8rem;
                }

                /* ==================== SERVICE AREAS ==================== */
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
                    background: ${appTheme.colors.error}10;
                    border: 1px solid ${appTheme.colors.error}30;
                    border-radius: 8px;
                    color: ${appTheme.colors.error};
                    cursor: pointer;
                }

                .add-area-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 8px;
                    background: white;
                    border: 1px dashed ${appTheme.colors.border};
                    border-radius: 8px;
                    color: #64748b;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .add-area-btn:hover {
                    border-color: ${appTheme.colors.primary};
                    color: ${appTheme.colors.primary};
                }

                /* ==================== SOCIAL GRID ==================== */
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

                /* ==================== WORKING HOURS ==================== */
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 20px;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .quick-btn:hover {
                    background: #e2e8f0;
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
                    border: 1px solid ${appTheme.colors.border};
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.8rem;
                }

                .hour-times span {
                    color: #64748b;
                    font-size: 0.7rem;
                }

                /* ==================== SETTINGS GRID ==================== */
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
                    border: 1px solid ${appTheme.colors.border};
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    text-align: center;
                }

                .setting-control span {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                /* ==================== POLICY CARDS ==================== */
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .policy-card input {
                    position: absolute;
                    opacity: 0;
                }

                .policy-card.selected {
                    background: ${appTheme.colors.primary}10;
                    border-color: ${appTheme.colors.primary};
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

                /* ==================== ADMIN CHECKS ==================== */
                .admin-checks {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* ==================== DOCUMENTS ==================== */
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
                    border: 1px dashed ${appTheme.colors.border};
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
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.688rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
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
                    background: #eef2ff;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: 8px;
                }

                .info-box svg {
                    flex-shrink: 0;
                    color: ${appTheme.colors.primary};
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
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: 8px;
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

                    .stats-grid {
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

                    .stats-grid {
                        display: none;
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