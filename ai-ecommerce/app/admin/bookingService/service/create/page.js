// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Head from 'next/head';
// import {
//   ArrowLeft, Save, Tag, DollarSign, Clock,
//   Users, CheckCircle, XCircle, Plus, Minus, ChevronDown,
//   ChevronUp, Briefcase, Settings, Shield, AlertCircle,
//   Star, ThumbsUp, Calendar, Award, Zap
// } from 'lucide-react';

// export default function CreateServicePage() {
//   const router = useRouter();
  
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('basic');
//   const [expandedSections, setExpandedSections] = useState({
//     basic: true,
//     pricing: false,
//     variations: false,
//     addons: false,
//     requirements: false,
//     restrictions: false
//   });
  
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     category: 'beauty',
//     type: 'physical',
//     subcategory: '',
//     basePrice: 0,
//     duration: 60,
//     currency: 'INR',
    
//     tags: [],
//     clientRequirements: [''],
//     professionalProvides: [''],
//     variations: [],
//     addons: [],
//     images: [],
    
//     bufferTime: 0,
//     advanceBooking: 30,
//     minAge: null,
//     maxAge: null,
//     genderPreference: 'any',
//     isActive: true,
//     isPopular: false,
//     isFeatured: false
//   });

//   const [tagInput, setTagInput] = useState('');
//   const [variationInput, setVariationInput] = useState({ name: '', price: 0, duration: 0 });
//   const [addonInput, setAddonInput] = useState({ name: '', price: 0, description: '' });
//   const [errors, setErrors] = useState({});

//   // Categories with icons
//   const categories = [
//     { value: 'beauty', label: 'Beauty & Spa', icon: '💅' },
//     { value: 'health', label: 'Health & Wellness', icon: '🏥' },
//     { value: 'consulting', label: 'Consulting', icon: '💼' },
//     { value: 'repair', label: 'Repair & Maintenance', icon: '🔧' },
//     { value: 'education', label: 'Education & Training', icon: '📚' },
//     { value: 'fitness', label: 'Fitness', icon: '💪' },
//     { value: 'other', label: 'Other', icon: '📌' }
//   ];

//   // Service Types
//   const serviceTypes = [
//     { value: 'physical', label: 'Physical Service', icon: '📍' },
//     { value: 'virtual', label: 'Virtual Service', icon: '💻' },
//     { value: 'both', label: 'Both', icon: '🔄' }
//   ];

//   // Currencies
//   const currencies = [
//     { value: 'INR', label: '₹ INR', symbol: '₹' },
//     { value: 'USD', label: '$ USD', symbol: '$' },
//     { value: 'EUR', label: '€ EUR', symbol: '€' },
//     { value: 'GBP', label: '£ GBP', symbol: '£' },
//     { value: 'AED', label: 'د.إ AED', symbol: 'د.إ' }
//   ];

//   // Gender Preferences
//   const genderPreferences = [
//     { value: 'any', label: 'Any', icon: '👥' },
//     { value: 'male', label: 'Male', icon: '👨' },
//     { value: 'female', label: 'Female', icon: '👩' },
//     { value: 'none', label: 'None', icon: '🚫' }
//   ];

//   // Duration options
//   const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480];

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
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
    
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   // Handle array field changes
//   const handleArrayChange = (field, index, value) => {
//     const updatedArray = [...formData[field]];
//     updatedArray[index] = value;
//     setFormData(prev => ({ ...prev, [field]: updatedArray }));
//   };

//   const addArrayItem = (field) => {
//     setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
//   };

//   const removeArrayItem = (field, index) => {
//     if (formData[field].length > 1) {
//       setFormData(prev => ({
//         ...prev,
//         [field]: prev[field].filter((_, i) => i !== index)
//       }));
//     }
//   };

//   // Handle tags
//   const handleAddTag = () => {
//     if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...prev.tags, tagInput.trim()]
//       }));
//       setTagInput('');
//     }
//   };

//   const handleRemoveTag = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle variations
//   const handleAddVariation = () => {
//     if (variationInput.name.trim() && variationInput.price >= 0) {
//       setFormData(prev => ({
//         ...prev,
//         variations: [...prev.variations, { 
//           ...variationInput, 
//           price: parseFloat(variationInput.price) || 0,
//           duration: parseInt(variationInput.duration) || 0
//         }]
//       }));
//       setVariationInput({ name: '', price: 0, duration: 0 });
//     }
//   };

//   const handleRemoveVariation = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       variations: prev.variations.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle addons
//   const handleAddAddon = () => {
//     if (addonInput.name.trim() && addonInput.price >= 0) {
//       setFormData(prev => ({
//         ...prev,
//         addons: [...prev.addons, { 
//           ...addonInput, 
//           price: parseFloat(addonInput.price) || 0 
//         }]
//       }));
//       setAddonInput({ name: '', price: 0, description: '' });
//     }
//   };

//   const handleRemoveAddon = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       addons: prev.addons.filter((_, i) => i !== index)
//     }));
//   };

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = 'Service name is required';
//     }

//     if (!formData.description.trim()) {
//       newErrors.description = 'Description is required';
//     } else if (formData.description.length < 50) {
//       newErrors.description = 'Description should be at least 50 characters';
//     }

//     if (!formData.basePrice || formData.basePrice <= 0) {
//       newErrors.basePrice = 'Base price must be greater than 0';
//     }

//     if (!formData.duration || formData.duration < 15) {
//       newErrors.duration = 'Duration must be at least 15 minutes';
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
//       const filteredRequirements = formData.clientRequirements.filter(req => req.trim() !== '');
//       const filteredProvides = formData.professionalProvides.filter(prov => prov.trim() !== '');
      
//       const payload = {
//         ...formData,
//         clientRequirements: filteredRequirements,
//         professionalProvides: filteredProvides,
//         totalBookings: 0,
//         popularity: 0
//       };

//       const res = await fetch('/api/bookingService/service', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();

//       if (data.success) {
//         alert('Service created successfully!');
//         router.push('/admin/bookingService/service');
//       } else {
//         alert(`Error: ${data.error || 'Failed to create service'}`);
//       }
//     } catch (error) {
//       console.error('Error creating service:', error);
//       alert('Failed to create service. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get currency symbol
//   const getCurrencySymbol = () => {
//     const currency = currencies.find(c => c.value === formData.currency);
//     return currency?.symbol || '₹';
//   };

//   return (
//     <>
//       <Head>
//         <title>Add New Service | LFMS</title>
//       </Head>

//       <div className="create-service-wrapper">
//         {/* Header */}
//         <div className="page-header">
//           <div className="header-left">
//             <Link href="/admin/bookingService/service" className="back-button">
//               <ArrowLeft size={18} />
//               <span>Back</span>
//             </Link>
//             <div>
//               <h1 className="page-title">Add New Service</h1>
//               <p className="page-subtitle">Create a new service offering</p>
//             </div>
//           </div>
//           <div className="badge draft">Draft</div>
//         </div>

//         {/* Mobile Tabs */}
//         <div className="mobile-tabs">
//           <button onClick={() => setActiveTab('basic')} className={`mobile-tab ${activeTab === 'basic' ? 'active' : ''}`}>
//             <Tag size={14} /> Basic
//           </button>
//           <button onClick={() => setActiveTab('pricing')} className={`mobile-tab ${activeTab === 'pricing' ? 'active' : ''}`}>
//             <DollarSign size={14} /> Pricing
//           </button>
//           <button onClick={() => setActiveTab('variations')} className={`mobile-tab ${activeTab === 'variations' ? 'active' : ''}`}>
//             <Briefcase size={14} /> Variations
//           </button>
//           <button onClick={() => setActiveTab('addons')} className={`mobile-tab ${activeTab === 'addons' ? 'active' : ''}`}>
//             <Plus size={14} /> Addons
//           </button>
//           <button onClick={() => setActiveTab('requirements')} className={`mobile-tab ${activeTab === 'requirements' ? 'active' : ''}`}>
//             <CheckCircle size={14} /> Requirements
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="form-container">
//           {/* Basic Information */}
//           <div className={`form-section ${activeTab === 'basic' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('basic')}>
//               <div className="section-title">
//                 <Tag size={16} />
//                 <h2>Basic Information</h2>
//                 <span className="badge required">Required</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.basic ? 'expanded' : ''}`}>
//               {/* Service Name */}
//               <div className="form-group">
//                 <label className="form-label">
//                   Service Name <span className="required-star">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className={`form-input ${errors.name ? 'error' : ''}`}
//                   placeholder="e.g., Professional Haircut"
//                 />
//                 {errors.name && <p className="error-msg">{errors.name}</p>}
//               </div>

//               {/* Description */}
//               <div className="form-group">
//                 <label className="form-label">
//                   Description <span className="required-star">*</span>
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows="3"
//                   className={`form-textarea ${errors.description ? 'error' : ''}`}
//                   placeholder="Describe the service in detail..."
//                 />
//                 {errors.description && <p className="error-msg">{errors.description}</p>}
//                 <p className="field-hint">Minimum 50 characters recommended</p>
//               </div>

//               {/* Category */}
//               <div className="form-group">
//                 <label className="form-label">Category <span className="required-star">*</span></label>
//                 <div className="category-grid">
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

//               {/* Subcategory & Type */}
//               <div className="form-row">
//                 <div className="form-group">
//                   <label className="form-label">Subcategory</label>
//                   <input
//                     type="text"
//                     name="subcategory"
//                     value={formData.subcategory}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="e.g., Hair Styling"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Service Type</label>
//                   <div className="type-cards">
//                     {serviceTypes.map(type => (
//                       <label key={type.value} className={`type-card ${formData.type === type.value ? 'selected' : ''}`}>
//                         <input
//                           type="radio"
//                           name="type"
//                           value={type.value}
//                           checked={formData.type === type.value}
//                           onChange={handleChange}
//                         />
//                         <span className="type-icon">{type.icon}</span>
//                         <span className="type-label">{type.label}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Tags */}
//               <div className="form-group">
//                 <label className="form-label">Tags</label>
//                 <div className="tag-input-group">
//                   <input
//                     type="text"
//                     value={tagInput}
//                     onChange={(e) => setTagInput(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
//                     className="form-input"
//                     placeholder="Add tags"
//                   />
//                   <button type="button" onClick={handleAddTag} className="add-btn">
//                     <Plus size={16} /> Add
//                   </button>
//                 </div>
//                 <div className="tags-list">
//                   {formData.tags.map((tag, index) => (
//                     <span key={index} className="tag">
//                       {tag}
//                       <button type="button" onClick={() => handleRemoveTag(index)}>×</button>
//                     </span>
//                   ))}
//                   {formData.tags.length === 0 && (
//                     <p className="empty-tags">No tags added</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Pricing & Duration */}
//           <div className={`form-section ${activeTab === 'pricing' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('pricing')}>
//               <div className="section-title">
//                 <DollarSign size={16} />
//                 <h2>Pricing & Duration</h2>
//                 <span className="badge required">Required</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.pricing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.pricing ? 'expanded' : ''}`}>
//               <div className="pricing-grid">
//                 {/* Base Price */}
//                 <div className="price-card">
//                   <div className="price-header">
//                     <DollarSign size={14} />
//                     <h3>Base Price</h3>
//                   </div>
//                   <div className="price-input">
//                     <span className="currency">{getCurrencySymbol()}</span>
//                     <input
//                       type="number"
//                       name="basePrice"
//                       value={formData.basePrice}
//                       onChange={handleChange}
//                       min="0"
//                       step="0.01"
//                       className={errors.basePrice ? 'error' : ''}
//                     />
//                   </div>
//                   {errors.basePrice && <p className="error-msg">{errors.basePrice}</p>}
//                 </div>

//                 {/* Currency */}
//                 <div className="price-card">
//                   <div className="price-header">
//                     <Shield size={14} />
//                     <h3>Currency</h3>
//                   </div>
//                   <select
//                     name="currency"
//                     value={formData.currency}
//                     onChange={handleChange}
//                     className="currency-select"
//                   >
//                     {currencies.map(curr => (
//                       <option key={curr.value} value={curr.value}>{curr.label}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Duration */}
//                 <div className="price-card">
//                   <div className="price-header">
//                     <Clock size={14} />
//                     <h3>Duration</h3>
//                   </div>
//                   <select
//                     name="duration"
//                     value={formData.duration}
//                     onChange={handleChange}
//                     className={`duration-select ${errors.duration ? 'error' : ''}`}
//                   >
//                     {durationOptions.map(mins => (
//                       <option key={mins} value={mins}>
//                         {mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.duration && <p className="error-msg">{errors.duration}</p>}
//                 </div>

//                 {/* Buffer Time */}
//                 <div className="price-card">
//                   <div className="price-header">
//                     <Zap size={14} />
//                     <h3>Buffer Time</h3>
//                   </div>
//                   <div className="buffer-input">
//                     <input
//                       type="number"
//                       name="bufferTime"
//                       value={formData.bufferTime}
//                       onChange={handleChange}
//                       min="0"
//                       step="5"
//                     />
//                     <span>min</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Variations */}
//           <div className={`form-section ${activeTab === 'variations' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('variations')}>
//               <div className="section-title">
//                 <Briefcase size={16} />
//                 <h2>Service Variations</h2>
//                 <span className="badge optional">Optional</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.variations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.variations ? 'expanded' : ''}`}>
//               {/* Add Variation Form */}
//               <div className="variation-form">
//                 <div className="variation-inputs">
//                   <input
//                     type="text"
//                     value={variationInput.name}
//                     onChange={(e) => setVariationInput(prev => ({ ...prev, name: e.target.value }))}
//                     placeholder="Variation name"
//                     className="form-input"
//                   />
//                   <input
//                     type="number"
//                     value={variationInput.price}
//                     onChange={(e) => setVariationInput(prev => ({ ...prev, price: e.target.value }))}
//                     placeholder={`Price (${getCurrencySymbol()})`}
//                     className="form-input"
//                     step="0.01"
//                     min="0"
//                   />
//                   <input
//                     type="number"
//                     value={variationInput.duration}
//                     onChange={(e) => setVariationInput(prev => ({ ...prev, duration: e.target.value }))}
//                     placeholder="Extra minutes"
//                     className="form-input"
//                     min="0"
//                     step="5"
//                   />
//                   <button type="button" onClick={handleAddVariation} className="add-variation-btn">
//                     <Plus size={16} /> Add
//                   </button>
//                 </div>
//               </div>

//               {/* Variations List */}
//               <div className="variations-list">
//                 {formData.variations.length > 0 ? (
//                   formData.variations.map((variation, index) => (
//                     <div key={index} className="variation-item">
//                       <div className="variation-info">
//                         <span className="variation-name">{variation.name}</span>
//                         <span className="variation-price">+{getCurrencySymbol()}{variation.price}</span>
//                         {variation.duration > 0 && (
//                           <span className="variation-duration">+{variation.duration} min</span>
//                         )}
//                       </div>
//                       <button type="button" onClick={() => handleRemoveVariation(index)} className="remove-btn">
//                         <XCircle size={16} />
//                       </button>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="empty-state">
//                     <Briefcase size={24} />
//                     <p>No variations added</p>
//                     <span>Add variations like "Premium Package" or "Express Service"</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Addons */}
//           <div className={`form-section ${activeTab === 'addons' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('addons')}>
//               <div className="section-title">
//                 <Plus size={16} />
//                 <h2>Add-ons</h2>
//                 <span className="badge optional">Optional</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.addons ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.addons ? 'expanded' : ''}`}>
//               {/* Add Addon Form */}
//               <div className="addon-form">
//                 <div className="addon-inputs">
//                   <input
//                     type="text"
//                     value={addonInput.name}
//                     onChange={(e) => setAddonInput(prev => ({ ...prev, name: e.target.value }))}
//                     placeholder="Add-on name"
//                     className="form-input"
//                   />
//                   <input
//                     type="number"
//                     value={addonInput.price}
//                     onChange={(e) => setAddonInput(prev => ({ ...prev, price: e.target.value }))}
//                     placeholder={`Price (${getCurrencySymbol()})`}
//                     className="form-input"
//                     step="0.01"
//                     min="0"
//                   />
//                   <input
//                     type="text"
//                     value={addonInput.description}
//                     onChange={(e) => setAddonInput(prev => ({ ...prev, description: e.target.value }))}
//                     placeholder="Description"
//                     className="form-input"
//                   />
//                   <button type="button" onClick={handleAddAddon} className="add-addon-btn">
//                     <Plus size={16} /> Add
//                   </button>
//                 </div>
//               </div>

//               {/* Addons List */}
//               <div className="addons-list">
//                 {formData.addons.length > 0 ? (
//                   formData.addons.map((addon, index) => (
//                     <div key={index} className="addon-item">
//                       <div className="addon-info">
//                         <span className="addon-name">{addon.name}</span>
//                         {addon.description && (
//                           <span className="addon-desc">{addon.description}</span>
//                         )}
//                       </div>
//                       <div className="addon-price">
//                         +{getCurrencySymbol()}{addon.price}
//                       </div>
//                       <button type="button" onClick={() => handleRemoveAddon(index)} className="remove-btn">
//                         <XCircle size={16} />
//                       </button>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="empty-state">
//                     <Plus size={24} />
//                     <p>No add-ons added</p>
//                     <span>Add optional extras customers can purchase</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Requirements */}
//           <div className={`form-section ${activeTab === 'requirements' ? 'active' : ''}`}>
//             <div className="section-header" onClick={() => toggleSection('requirements')}>
//               <div className="section-title">
//                 <CheckCircle size={16} />
//                 <h2>Requirements & Inclusions</h2>
//                 <span className="badge optional">Optional</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.requirements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.requirements ? 'expanded' : ''}`}>
//               <div className="requirements-grid">
//                 {/* Client Requirements */}
//                 <div className="requirement-group">
//                   <div className="group-header">
//                     <AlertCircle size={14} />
//                     <h3>Client Requirements</h3>
//                     <button type="button" onClick={() => addArrayItem('clientRequirements')} className="add-group-btn">
//                       <Plus size={14} /> Add
//                     </button>
//                   </div>
//                   {formData.clientRequirements.map((req, index) => (
//                     <div key={index} className="requirement-row">
//                       <input
//                         type="text"
//                         value={req}
//                         onChange={(e) => handleArrayChange('clientRequirements', index, e.target.value)}
//                         className="form-input"
//                         placeholder="What client needs to bring"
//                       />
//                       {formData.clientRequirements.length > 1 && (
//                         <button type="button" onClick={() => removeArrayItem('clientRequirements', index)} className="remove-row">
//                           <Minus size={14} />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Professional Provides */}
//                 <div className="requirement-group">
//                   <div className="group-header">
//                     <ThumbsUp size={14} />
//                     <h3>Professional Provides</h3>
//                     <button type="button" onClick={() => addArrayItem('professionalProvides')} className="add-group-btn">
//                       <Plus size={14} /> Add
//                     </button>
//                   </div>
//                   {formData.professionalProvides.map((prov, index) => (
//                     <div key={index} className="requirement-row">
//                       <input
//                         type="text"
//                         value={prov}
//                         onChange={(e) => handleArrayChange('professionalProvides', index, e.target.value)}
//                         className="form-input"
//                         placeholder="What professional provides"
//                       />
//                       {formData.professionalProvides.length > 1 && (
//                         <button type="button" onClick={() => removeArrayItem('professionalProvides', index)} className="remove-row">
//                           <Minus size={14} />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Restrictions */}
//           <div className="form-section">
//             <div className="section-header" onClick={() => toggleSection('restrictions')}>
//               <div className="section-title">
//                 <Shield size={16} />
//                 <h2>Restrictions</h2>
//                 <span className="badge optional">Optional</span>
//               </div>
//               <button type="button" className="section-toggle">
//                 {expandedSections.restrictions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </button>
//             </div>

//             <div className={`section-content ${expandedSections.restrictions ? 'expanded' : ''}`}>
//               <div className="restrictions-grid">
//                 {/* Advance Booking */}
//                 <div className="restriction-card">
//                   <div className="restriction-header">
//                     <Calendar size={14} />
//                     <h3>Advance Booking</h3>
//                   </div>
//                   <div className="restriction-input-group">
//                     <input
//                       type="number"
//                       name="advanceBooking"
//                       value={formData.advanceBooking}
//                       onChange={handleChange}
//                       min="1"
//                       max="365"
//                     />
//                     <span>days</span>
//                   </div>
//                 </div>

//                 {/* Age Restrictions */}
//                 <div className="restriction-card">
//                   <div className="restriction-header">
//                     <Users size={14} />
//                     <h3>Age Restrictions</h3>
//                   </div>
//                   <div className="age-inputs">
//                     <input
//                       type="number"
//                       name="minAge"
//                       value={formData.minAge || ''}
//                       onChange={handleChange}
//                       placeholder="Min"
//                       min="0"
//                       max="100"
//                     />
//                     <span>to</span>
//                     <input
//                       type="number"
//                       name="maxAge"
//                       value={formData.maxAge || ''}
//                       onChange={handleChange}
//                       placeholder="Max"
//                       min="0"
//                       max="100"
//                     />
//                   </div>
//                 </div>

//                 {/* Gender Preference */}
//                 <div className="restriction-card">
//                   <div className="restriction-header">
//                     <Users size={14} />
//                     <h3>Gender Preference</h3>
//                   </div>
//                   <div className="gender-options">
//                     {genderPreferences.map(pref => (
//                       <label key={pref.value} className={`gender-option ${formData.genderPreference === pref.value ? 'selected' : ''}`}>
//                         <input
//                           type="radio"
//                           name="genderPreference"
//                           value={pref.value}
//                           checked={formData.genderPreference === pref.value}
//                           onChange={handleChange}
//                         />
//                         <span className="gender-icon">{pref.icon}</span>
//                         <span className="gender-label">{pref.label}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Status */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <Settings size={16} />
//                 <h2>Service Status</h2>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="status-grid">
//                 <label className="status-checkbox">
//                   <input
//                     type="checkbox"
//                     name="isActive"
//                     checked={formData.isActive}
//                     onChange={handleChange}
//                   />
//                   <span>
//                     <CheckCircle size={14} />
//                     Service is active
//                   </span>
//                 </label>

//                 <label className="status-checkbox">
//                   <input
//                     type="checkbox"
//                     name="isPopular"
//                     checked={formData.isPopular}
//                     onChange={handleChange}
//                   />
//                   <span>
//                     <Star size={14} />
//                     Mark as popular
//                   </span>
//                 </label>

//                 <label className="status-checkbox">
//                   <input
//                     type="checkbox"
//                     name="isFeatured"
//                     checked={formData.isFeatured}
//                     onChange={handleChange}
//                   />
//                   <span>
//                     <Award size={14} />
//                     Feature this service
//                   </span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="form-actions">
//             <Link href="/admin/bookingService/service" className="cancel-btn">
//               Cancel
//             </Link>
//             <button type="submit" disabled={loading} className="submit-btn">
//               {loading ? (
//                 <>
//                   <span className="spinner"></span>
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save size={16} />
//                   Create Service
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       <style jsx>{`
//         .create-service-wrapper {
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
//           padding: 6px 12px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           color: #1e293b;
//           font-size: 0.85rem;
//           text-decoration: none;
//           white-space: nowrap;
//         }

//         .back-button:hover {
//           background: #f8fafc;
//         }

//         .page-title {
//           font-size: 1.4rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
//         }

//         .page-subtitle {
//           color: #64748b;
//           font-size: 0.8rem;
//           margin: 2px 0 0;
//         }

//         .badge {
//           padding: 4px 10px;
//           border-radius: 20px;
//           font-size: 0.7rem;
//           font-weight: 500;
//           background: #f1f5f9;
//           color: #475569;
//         }

//         .badge.draft {
//           background: #f1f5f9;
//           color: #475569;
//         }

//         .badge.required {
//           background: #fee2e2;
//           color: #991b1b;
//         }

//         .badge.optional {
//           background: #f1f5f9;
//           color: #475569;
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
//           overflow-x: auto;
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
//           font-size: 0.75rem;
//           border-radius: 8px;
//           cursor: pointer;
//           white-space: nowrap;
//         }

//         .mobile-tab.active {
//           background: #3b82f6;
//           color: white;
//         }

//         /* Form Container */
//         .form-container {
//           display: flex;
//           flex-direction: column;
//           gap: 12px;
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
//           padding: 12px 16px;
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
//           font-size: 0.95rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
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
//           font-size: 0.8rem;
//           font-weight: 500;
//           color: #1e293b;
//           margin-bottom: 4px;
//         }

//         .required-star {
//           color: #ef4444;
//         }

//         .form-input,
//         .form-select,
//         .form-textarea {
//           width: 100%;
//           padding: 8px 12px;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           font-size: 0.85rem;
//           background: white;
//         }

//         .form-input:focus,
//         .form-select:focus,
//         .form-textarea:focus {
//           outline: none;
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         .form-input.error,
//         .form-select.error {
//           border-color: #ef4444;
//         }

//         .form-textarea {
//           resize: vertical;
//           min-height: 80px;
//         }

//         .error-msg {
//           color: #ef4444;
//           font-size: 0.7rem;
//           margin-top: 4px;
//         }

//         .field-hint {
//           color: #64748b;
//           font-size: 0.7rem;
//           margin-top: 4px;
//         }

//         /* Category Cards */
//         .category-grid {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 8px;
//         }

//         @media (max-width: 1024px) {
//           .category-grid {
//             grid-template-columns: repeat(3, 1fr);
//           }
//         }

//         @media (max-width: 640px) {
//           .category-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         .category-card {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 4px;
//           padding: 10px 4px;
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
//           font-size: 1.4rem;
//         }

//         .category-label {
//           font-size: 0.7rem;
//           font-weight: 500;
//           color: #1e293b;
//           text-align: center;
//         }

//         /* Type Cards */
//         .type-cards {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//         }

//         .type-card {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 4px;
//           padding: 8px 4px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           cursor: pointer;
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
//           font-size: 1.2rem;
//         }

//         .type-label {
//           font-size: 0.7rem;
//           font-weight: 500;
//           color: #1e293b;
//         }

//         /* Tags */
//         .tag-input-group {
//           display: flex;
//           gap: 8px;
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
//           font-size: 0.8rem;
//           white-space: nowrap;
//           cursor: pointer;
//         }

//         .tags-list {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 6px;
//           margin-top: 8px;
//         }

//         .tag {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 4px 8px;
//           background: #eff6ff;
//           border: 1px solid #bfdbfe;
//           border-radius: 20px;
//           font-size: 0.75rem;
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

//         .empty-tags {
//           color: #94a3b8;
//           font-size: 0.8rem;
//           margin: 4px 0;
//         }

//         /* Pricing */
//         .pricing-grid {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 12px;
//         }

//         @media (max-width: 1024px) {
//           .pricing-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }

//         @media (max-width: 640px) {
//           .pricing-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .price-card {
//           padding: 12px;
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//         }

//         .price-header {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           margin-bottom: 8px;
//         }

//         .price-header h3 {
//           font-size: 0.8rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0;
//         }

//         .price-input {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .price-input .currency {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #475569;
//         }

//         .price-input input {
//           width: 100%;
//           padding: 6px 8px;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           font-size: 0.9rem;
//           text-align: right;
//         }

//         .price-input input.error {
//           border-color: #ef4444;
//         }

//         .currency-select {
//           width: 100%;
//           padding: 6px 8px;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           font-size: 0.85rem;
//         }

//         .duration-select {
//           width: 100%;
//           padding: 6px 8px;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           font-size: 0.85rem;
//         }

//         .duration-select.error {
//           border-color: #ef4444;
//         }

//         .buffer-input {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .buffer-input input {
//           width: 60px;
//           padding: 6px 8px;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           text-align: center;
//         }

//         .buffer-input span {
//           color: #64748b;
//           font-size: 0.8rem;
//         }

//         /* Variations */
//         .variation-form {
//           margin-bottom: 16px;
//           padding: 12px;
//           background: #f8fafc;
//           border-radius: 8px;
//         }

//         .variation-inputs {
//           display: grid;
//           grid-template-columns: 2fr 1fr 1fr auto;
//           gap: 8px;
//         }

//         @media (max-width: 640px) {
//           .variation-inputs {
//             grid-template-columns: 1fr;
//           }
//         }

//         .add-variation-btn {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           padding: 0 16px;
//           background: #8b5cf6;
//           border: none;
//           border-radius: 8px;
//           color: white;
//           font-size: 0.8rem;
//           cursor: pointer;
//           white-space: nowrap;
//         }

//         .variations-list {
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .variation-item {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 10px 12px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//         }

//         .variation-info {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .variation-name {
//           font-size: 0.85rem;
//           font-weight: 500;
//         }

//         .variation-price {
//           font-size: 0.85rem;
//           color: #059669;
//           font-weight: 600;
//         }

//         .variation-duration {
//           font-size: 0.75rem;
//           color: #64748b;
//         }

//         /* Addons */
//         .addon-form {
//           margin-bottom: 16px;
//           padding: 12px;
//           background: #f8fafc;
//           border-radius: 8px;
//         }

//         .addon-inputs {
//           display: grid;
//           grid-template-columns: 1.5fr 1fr 2fr auto;
//           gap: 8px;
//         }

//         @media (max-width: 1024px) {
//           .addon-inputs {
//             grid-template-columns: 1fr;
//           }
//         }

//         .add-addon-btn {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           padding: 0 16px;
//           background: #f97316;
//           border: none;
//           border-radius: 8px;
//           color: white;
//           font-size: 0.8rem;
//           cursor: pointer;
//           white-space: nowrap;
//         }

//         .addons-list {
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .addon-item {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 10px 12px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//         }

//         .addon-info {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//         }

//         .addon-name {
//           font-size: 0.85rem;
//           font-weight: 500;
//         }

//         .addon-desc {
//           font-size: 0.7rem;
//           color: #64748b;
//         }

//         .addon-price {
//           font-size: 0.9rem;
//           font-weight: 600;
//           color: #059669;
//         }

//         /* Requirements */
//         .requirements-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 16px;
//         }

//         @media (max-width: 768px) {
//           .requirements-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .requirement-group {
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .group-header {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           margin-bottom: 4px;
//         }

//         .group-header h3 {
//           font-size: 0.8rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0;
//         }

//         .add-group-btn {
//           display: flex;
//           align-items: center;
//           gap: 2px;
//           padding: 4px 8px;
//           background: #f1f5f9;
//           border: 1px solid #e2e8f0;
//           border-radius: 4px;
//           color: #475569;
//           font-size: 0.7rem;
//           cursor: pointer;
//           margin-left: auto;
//         }

//         .requirement-row {
//           display: flex;
//           gap: 6px;
//         }

//         .remove-row {
//           padding: 0 8px;
//           background: #fee2e2;
//           border: 1px solid #fecaca;
//           border-radius: 6px;
//           color: #ef4444;
//           cursor: pointer;
//         }

//         /* Restrictions */
//         .restrictions-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 12px;
//         }

//         @media (max-width: 768px) {
//           .restrictions-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .restriction-card {
//           padding: 12px;
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//         }

//         .restriction-header {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           margin-bottom: 8px;
//         }

//         .restriction-header h3 {
//           font-size: 0.8rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0;
//         }

//         .restriction-input-group {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//         }

//         .restriction-input-group input {
//           width: 80px;
//           padding: 6px;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           text-align: center;
//         }

//         .restriction-input-group span {
//           color: #64748b;
//           font-size: 0.8rem;
//         }

//         .age-inputs {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//         }

//         .age-inputs input {
//           width: 70px;
//           padding: 6px;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           text-align: center;
//         }

//         .age-inputs span {
//           color: #64748b;
//         }

//         .gender-options {
//           display: flex;
//           gap: 6px;
//         }

//         .gender-option {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 2px;
//           padding: 6px 4px;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 6px;
//           cursor: pointer;
//         }

//         .gender-option input {
//           position: absolute;
//           opacity: 0;
//         }

//         .gender-option.selected {
//           background: #eff6ff;
//           border-color: #3b82f6;
//         }

//         .gender-icon {
//           font-size: 1rem;
//         }

//         .gender-label {
//           font-size: 0.65rem;
//           font-weight: 500;
//           color: #1e293b;
//         }

//         /* Status */
//         .status-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 12px;
//         }

//         @media (max-width: 640px) {
//           .status-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .status-checkbox {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 10px;
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           cursor: pointer;
//         }

//         .status-checkbox input {
//           width: 16px;
//           height: 16px;
//         }

//         .status-checkbox span {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 0.8rem;
//           color: #1e293b;
//         }

//         /* Empty State */
//         .empty-state {
//           text-align: center;
//           padding: 20px;
//           background: #f8fafc;
//           border-radius: 8px;
//           color: #64748b;
//         }

//         .empty-state svg {
//           margin-bottom: 8px;
//           color: #94a3b8;
//         }

//         .empty-state p {
//           font-size: 0.85rem;
//           font-weight: 500;
//           margin: 0 0 4px;
//         }

//         .empty-state span {
//           font-size: 0.7rem;
//         }

//         /* Form Actions */
//         .form-actions {
//           display: flex;
//           justify-content: flex-end;
//           gap: 12px;
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
//           font-size: 0.85rem;
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

//         .remove-btn {
//           padding: 4px;
//           background: transparent;
//           border: none;
//           color: #ef4444;
//           cursor: pointer;
//           border-radius: 4px;
//         }

//         .remove-btn:hover {
//           background: #fee2e2;
//         }

//         .spinner {
//           width: 14px;
//           height: 14px;
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
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { appTheme } from '../../../../../src/constants/theme';
import {
    ArrowLeft, Save, Tag, DollarSign, Clock,
    Users, CheckCircle, XCircle, Plus, Minus, ChevronRight,
    ChevronDown, ChevronUp, Briefcase, Settings, Shield, AlertCircle,
    Star, ThumbsUp, Calendar, Award, Zap, Layers, Layout, Info,
    AlertTriangle, Check, Loader2, Camera, Image as ImageIcon,
    Link2, AtSign, Hash, FileSignature, Palette, Brush, Sparkles,
    Crown, Gem, Diamond, Gift, MessageSquare, Send,
    Paperclip, Smile, Grid,  RefreshCw, Filter,
    Search, MoreVertical, Download, Printer, Share2, Bookmark,
    Eye, EyeOff, Lock, Unlock, Key, Wifi, WifiOff,
    Battery, BatteryCharging, Cpu, HardDrive, Server, Cloud, CloudOff,
    Repeat, Shuffle, Play, Pause, Square, Circle, Triangle,
    Hexagon, Octagon, Building2, CreditCard, Landmark,
    Receipt, HeadphonesIcon, PhoneCall, MailOpen,
    MapPinHouse, Building, Store, Globe2, Facebook,
    Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
    Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
    Activity, TrendingUp, Briefcase as BriefcaseIcon,
    Calendar as CalendarIcon, Clock as ClockIcon,
    Map as MapIcon, Truck as TruckIcon, Zap as ZapIcon,
    List, Trash2
} from 'lucide-react';

// ==================== CONSTANTS ====================
const SECTIONS = [
    { 
        id: 'basic', 
        title: 'Basic Information', 
        icon: Tag, 
        color: appTheme.colors.primary,
        description: 'Service name, category and description'
    },
    { 
        id: 'pricing', 
        title: 'Pricing & Duration', 
        icon: DollarSign, 
        color: appTheme.colors.secondary,
        description: 'Base price, currency and time settings'
    },
    { 
        id: 'variations', 
        title: 'Service Variations', 
        icon: Briefcase, 
        color: appTheme.colors.warning,
        description: 'Different versions of this service'
    },
    { 
        id: 'addons', 
        title: 'Add-ons', 
        icon: Plus, 
        color: appTheme.colors.success,
        description: 'Optional extras customers can purchase'
    },
    { 
        id: 'requirements', 
        title: 'Requirements & Inclusions', 
        icon: CheckCircle, 
        color: appTheme.colors.info,
        description: 'What clients need and professionals provide'
    },
    { 
        id: 'restrictions', 
        title: 'Restrictions', 
        icon: Shield, 
        color: appTheme.colors.accent,
        description: 'Age limits, gender preferences and booking rules'
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

const SERVICE_TYPES = [
    { value: 'physical', label: 'Physical Service', icon: '📍', color: '#3b82f6' },
    { value: 'virtual', label: 'Virtual Service', icon: '💻', color: '#8b5cf6' },
    { value: 'both', label: 'Both', icon: '🔄', color: '#10b981' }
];

const CURRENCIES = [
    { value: 'INR', label: '₹ INR', symbol: '₹', color: '#3b82f6' },
    { value: 'USD', label: '$ USD', symbol: '$', color: '#10b981' },
    { value: 'EUR', label: '€ EUR', symbol: '€', color: '#8b5cf6' },
    { value: 'GBP', label: '£ GBP', symbol: '£', color: '#f59e0b' },
    { value: 'AED', label: 'د.إ AED', symbol: 'د.إ', color: '#ec4899' }
];

const GENDER_PREFERENCES = [
    { value: 'any', label: 'Any', icon: '👥', color: '#6b7280' },
    { value: 'male', label: 'Male', icon: '👨', color: '#3b82f6' },
    { value: 'female', label: 'Female', icon: '👩', color: '#ec4899' },
    { value: 'none', label: 'None', icon: '🚫', color: '#ef4444' }
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480];

// Helper to validate ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export default function CreateServicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceId = searchParams.get('id');
    const isEditing = !!serviceId;
    
    // Refs for focus management
    const inputRefs = useRef({});
    
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState(['basic']);
    const [activeTab, setActiveTab] = useState('basic');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [isMobile, setIsMobile] = useState(false);
    
    // State for professionals dropdown
    const [professionals, setProfessionals] = useState([]);
    const [loadingProfessionals, setLoadingProfessionals] = useState(true);
    
    const [formData, setFormData] = useState({
        professionalId: '',
        name: '',
        description: '',
        category: 'beauty',
        type: 'physical',
        subcategory: '',
        basePrice: 0,
        duration: 60,
        currency: 'INR',
        
        tags: [],
        clientRequirements: [''],
        professionalProvides: [''],
        variations: [],
        addons: [],
        images: [],
        
        bufferTime: 0,
        advanceBooking: 30,
        minAge: null,
        maxAge: null,
        genderPreference: 'any',
        isActive: true,
        isPopular: false,
        isFeatured: false
    });

    const [tagInput, setTagInput] = useState('');
    const [variationInput, setVariationInput] = useState({ name: '', price: 0, duration: 0 });
    const [addonInput, setAddonInput] = useState({ name: '', price: 0, description: '' });
    const [errors, setErrors] = useState({});

    // Fetch professionals on mount
    useEffect(() => {
        fetchProfessionals();
    }, []);

    // Fetch service data if editing
    useEffect(() => {
        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const fetchProfessionals = async () => {
        try {
            setLoadingProfessionals(true);
            const res = await fetch('/api/bookingService/bookingmng?isActive=true');
            const data = await res.json();
            if (data.success) {
                setProfessionals(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching professionals:', error);
            showToast('error', 'Failed to load professionals');
        } finally {
            setLoadingProfessionals(false);
        }
    };

    const fetchService = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/bookingService/service?id=${serviceId}`);
            const data = await res.json();
            
            if (data.success) {
                const service = data.data;
                setFormData({
                    professionalId: service.professionalId || '',
                    name: service.name || '',
                    description: service.description || '',
                    category: service.category || 'beauty',
                    type: service.type || 'physical',
                    subcategory: service.subcategory || '',
                    basePrice: service.basePrice || 0,
                    duration: service.duration || 60,
                    currency: service.currency || 'INR',
                    
                    tags: service.tags || [],
                    clientRequirements: service.clientRequirements?.length ? service.clientRequirements : [''],
                    professionalProvides: service.professionalProvides?.length ? service.professionalProvides : [''],
                    variations: service.variations || [],
                    addons: service.addons || [],
                    images: service.images || [],
                    
                    bufferTime: service.bufferTime || 0,
                    advanceBooking: service.advanceBooking || 30,
                    minAge: service.minAge || null,
                    maxAge: service.maxAge || null,
                    genderPreference: service.genderPreference || 'any',
                    isActive: service.isActive !== false,
                    isPopular: service.isPopular || false,
                    isFeatured: service.isFeatured || false
                });
                showToast('success', 'Service loaded successfully');
            } else {
                showToast('error', 'Failed to load service');
            }
        } catch (error) {
            console.error('Error fetching service:', error);
            showToast('error', 'Failed to load service');
        } finally {
            setLoading(false);
        }
    };

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
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle Enter key navigation
    const handleKeyDown = (e, fieldName, nextFieldName) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextFieldName && inputRefs.current[nextFieldName]) {
                inputRefs.current[nextFieldName].focus();
            }
        }
    };

    // Register ref for input
    const setInputRef = (name, element) => {
        if (element) {
            inputRefs.current[name] = element;
        }
    };

    // Handle array field changes
    const handleArrayChange = (field, index, value) => {
        const updatedArray = [...formData[field]];
        updatedArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (field, index) => {
        if (formData[field].length > 1) {
            setFormData(prev => ({
                ...prev,
                [field]: prev[field].filter((_, i) => i !== index)
            }));
        }
    };

    // Handle tags
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
            showToast('success', 'Tag added');
        }
    };

    const handleRemoveTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
        showToast('success', 'Tag removed');
    };

    // Handle variations
    const handleAddVariation = () => {
        if (variationInput.name.trim() && variationInput.price >= 0) {
            setFormData(prev => ({
                ...prev,
                variations: [...prev.variations, { 
                    ...variationInput, 
                    price: parseFloat(variationInput.price) || 0,
                    duration: parseInt(variationInput.duration) || 0
                }]
            }));
            setVariationInput({ name: '', price: 0, duration: 0 });
            showToast('success', 'Variation added');
        }
    };

    const handleRemoveVariation = (index) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations.filter((_, i) => i !== index)
        }));
        showToast('success', 'Variation removed');
    };

    // Handle addons
    const handleAddAddon = () => {
        if (addonInput.name.trim() && addonInput.price >= 0) {
            setFormData(prev => ({
                ...prev,
                addons: [...prev.addons, { 
                    ...addonInput, 
                    price: parseFloat(addonInput.price) || 0 
                }]
            }));
            setAddonInput({ name: '', price: 0, description: '' });
            showToast('success', 'Add-on added');
        }
    };

    const handleRemoveAddon = (index) => {
        setFormData(prev => ({
            ...prev,
            addons: prev.addons.filter((_, i) => i !== index)
        }));
        showToast('success', 'Add-on removed');
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate professionalId
        if (!formData.professionalId) {
            newErrors.professionalId = 'Please select a professional/business';
        } else if (!isValidObjectId(formData.professionalId)) {
            newErrors.professionalId = 'Invalid professional ID format';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Service name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 50) {
            newErrors.description = 'Description should be at least 50 characters';
        }

        if (!formData.basePrice || formData.basePrice <= 0) {
            newErrors.basePrice = 'Base price must be greater than 0';
        }

        if (!formData.duration || formData.duration < 15) {
            newErrors.duration = 'Duration must be at least 15 minutes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission with scroll to error
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showToast('error', 'Please fix the errors before submitting');
            
            // Get the first error field
            const firstError = Object.keys(errors)[0];
            
            // Scroll to the error
            if (firstError) {
                const errorSection = getFieldSection(firstError);
                if (errorSection && !expandedSections.includes(errorSection)) {
                    setExpandedSections(prev => [...prev, errorSection]);
                    setActiveTab(errorSection);
                    
                    setTimeout(() => {
                        const element = document.getElementById(firstError);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.focus();
                        }
                    }, 300);
                } else {
                    const element = document.getElementById(firstError);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.focus();
                    }
                }
            }
            return;
        }

        setSaving(true);

        try {
            const filteredRequirements = formData.clientRequirements.filter(req => req.trim() !== '');
            const filteredProvides = formData.professionalProvides.filter(prov => prov.trim() !== '');
            
            const payload = {
                ...formData,
                clientRequirements: filteredRequirements,
                professionalProvides: filteredProvides,
                totalBookings: isEditing ? undefined : 0,
                popularity: isEditing ? undefined : 0
            };

            // Remove undefined fields
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

            const url = isEditing 
                ? `/api/bookingService/service?id=${serviceId}`
                : '/api/bookingService/service';
            
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', isEditing ? 'Service updated successfully!' : 'Service created successfully!');
                setTimeout(() => router.push('/admin/bookingService/service'), 1500);
            } else {
                showToast('error', `Error: ${data.error || 'Failed to save service'}`);
            }
        } catch (error) {
            console.error('Error saving service:', error);
            showToast('error', 'Failed to save service. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Helper to find which section a field belongs to
    const getFieldSection = (fieldName) => {
        const fieldToSection = {
            professionalId: 'basic',
            name: 'basic',
            description: 'basic',
            category: 'basic',
            type: 'basic',
            subcategory: 'basic',
            tags: 'basic',
            basePrice: 'pricing',
            currency: 'pricing',
            duration: 'pricing',
            bufferTime: 'pricing',
            variations: 'variations',
            addons: 'addons',
            clientRequirements: 'requirements',
            professionalProvides: 'requirements',
            advanceBooking: 'restrictions',
            minAge: 'restrictions',
            maxAge: 'restrictions',
            genderPreference: 'restrictions'
        };
        return fieldToSection[fieldName] || 'basic';
    };

    // Get currency symbol
    const getCurrencySymbol = () => {
        const currency = CURRENCIES.find(c => c.value === formData.currency);
        return currency?.symbol || '₹';
    };

    if (loading || loadingProfessionals) {
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
                <title>{isEditing ? 'Edit Service' : 'Add New Service'} | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="create-service-page">
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
                            <Link href="/admin/bookingService/service" className="back-button">
                                <ArrowLeft size={20} />
                                <span>Back to Services</span>
                            </Link>
                            <h1 className="page-title">
                                <Tag size={28} className="title-icon" />
                                {isEditing ? 'Edit Service' : 'Add New Service'}
                            </h1>
                            <p className="page-description">
                                {isEditing ? 'Update your service information' : 'Create a new service offering with complete details'}
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
                                <span className={`status-badge ${formData.isActive ? 'active' : 'inactive'}`}>
                                    {formData.isActive ? 'Active' : 'Inactive'}
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
                                        <span>{isEditing ? 'Update Service' : 'Create Service'}</span>
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
                                                            <Building2 size={16} />
                                                            Professional Selection
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Select Professional/Business <span className="required">*</span></label>
                                                                <select
                                                                    name="professionalId"
                                                                    id="professionalId"
                                                                    value={formData.professionalId}
                                                                    onChange={handleChange}
                                                                    className={errors.professionalId ? 'error' : ''}
                                                                    ref={(el) => setInputRef('professionalId', el)}
                                                                    onKeyDown={(e) => handleKeyDown(e, 'professionalId', 'name')}
                                                                >
                                                                    <option value="">Choose a professional</option>
                                                                    {professionals.map(pro => (
                                                                        <option key={pro._id} value={pro._id}>
                                                                            {pro.businessName} - {pro.category}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.professionalId && <span className="error-text">{errors.professionalId}</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Tag size={16} />
                                                            Basic Details
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Service Name <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    id="name"
                                                                    value={formData.name}
                                                                    onChange={handleChange}
                                                                    className={errors.name ? 'error' : ''}
                                                                    placeholder="e.g., Professional Haircut"
                                                                    ref={(el) => setInputRef('name', el)}
                                                                    onKeyDown={(e) => handleKeyDown(e, 'name', 'description')}
                                                                />
                                                                {errors.name && <span className="error-text">{errors.name}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Description <span className="required">*</span></label>
                                                                <textarea
                                                                    name="description"
                                                                    id="description"
                                                                    value={formData.description}
                                                                    onChange={handleChange}
                                                                    rows="4"
                                                                    className={errors.description ? 'error' : ''}
                                                                    placeholder="Describe the service in detail..."
                                                                    ref={(el) => setInputRef('description', el)}
                                                                />
                                                                {errors.description && <span className="error-text">{errors.description}</span>}
                                                                <span className="hint">Minimum 50 characters recommended</span>
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
                                                                <label>Subcategory</label>
                                                                <input
                                                                    type="text"
                                                                    name="subcategory"
                                                                    value={formData.subcategory}
                                                                    onChange={handleChange}
                                                                    placeholder="e.g., Hair Styling"
                                                                    ref={(el) => setInputRef('subcategory', el)}
                                                                    onKeyDown={(e) => handleKeyDown(e, 'subcategory')}
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Service Type</label>
                                                                <div className="type-cards">
                                                                    {SERVICE_TYPES.map(type => (
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
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Hash size={16} />
                                                            Tags
                                                        </h3>
                                                        <div className="form-field">
                                                            <div className="tag-input-group">
                                                                <input
                                                                    type="text"
                                                                    value={tagInput}
                                                                    onChange={(e) => setTagInput(e.target.value)}
                                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                                                    placeholder="Add tags"
                                                                />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={handleAddTag} 
                                                                    className="add-btn"
                                                                >
                                                                    <Plus size={16} />
                                                                    Add
                                                                </button>
                                                            </div>
                                                            <div className="tags-list">
                                                                {formData.tags.map((tag, index) => (
                                                                    <span key={index} className="tag">
                                                                        {tag}
                                                                        <button type="button" onClick={() => handleRemoveTag(index)}>×</button>
                                                                    </span>
                                                                ))}
                                                                {formData.tags.length === 0 && (
                                                                    <span className="no-tags">No tags added</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Pricing & Duration */}
                                            {section.id === 'pricing' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <DollarSign size={16} />
                                                            Pricing
                                                        </h3>
                                                        <div className="pricing-grid">
                                                            <div className="pricing-card">
                                                                <div className="pricing-header">
                                                                    <DollarSign size={14} />
                                                                    <span>Base Price</span>
                                                                </div>
                                                                <div className="pricing-input">
                                                                    <span className="currency-symbol">{getCurrencySymbol()}</span>
                                                                    <input
                                                                        type="number"
                                                                        name="basePrice"
                                                                        id="basePrice"
                                                                        value={formData.basePrice}
                                                                        onChange={handleChange}
                                                                        min="0"
                                                                        step="0.01"
                                                                        className={errors.basePrice ? 'error' : ''}
                                                                        ref={(el) => setInputRef('basePrice', el)}
                                                                        onKeyDown={(e) => handleKeyDown(e, 'basePrice', 'duration')}
                                                                    />
                                                                </div>
                                                                {errors.basePrice && <span className="error-text">{errors.basePrice}</span>}
                                                            </div>

                                                            <div className="pricing-card">
                                                                <div className="pricing-header">
                                                                    <Shield size={14} />
                                                                    <span>Currency</span>
                                                                </div>
                                                                <select
                                                                    name="currency"
                                                                    value={formData.currency}
                                                                    onChange={handleChange}
                                                                    className="currency-select"
                                                                    ref={(el) => setInputRef('currency', el)}
                                                                >
                                                                    {CURRENCIES.map(curr => (
                                                                        <option key={curr.value} value={curr.value}>{curr.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="pricing-card">
                                                                <div className="pricing-header">
                                                                    <Clock size={14} />
                                                                    <span>Duration</span>
                                                                </div>
                                                                <select
                                                                    name="duration"
                                                                    id="duration"
                                                                    value={formData.duration}
                                                                    onChange={handleChange}
                                                                    className={errors.duration ? 'error' : ''}
                                                                    ref={(el) => setInputRef('duration', el)}
                                                                >
                                                                    {DURATION_OPTIONS.map(mins => (
                                                                        <option key={mins} value={mins}>
                                                                            {mins >= 60 
                                                                                ? `${Math.floor(mins / 60)}h ${mins % 60}m` 
                                                                                : `${mins} min`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.duration && <span className="error-text">{errors.duration}</span>}
                                                            </div>

                                                            <div className="pricing-card">
                                                                <div className="pricing-header">
                                                                    <Zap size={14} />
                                                                    <span>Buffer Time</span>
                                                                </div>
                                                                <div className="buffer-input">
                                                                    <input
                                                                        type="number"
                                                                        name="bufferTime"
                                                                        value={formData.bufferTime}
                                                                        onChange={handleChange}
                                                                        min="0"
                                                                        step="5"
                                                                        ref={(el) => setInputRef('bufferTime', el)}
                                                                    />
                                                                    <span>min</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Variations */}
                                            {section.id === 'variations' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Briefcase size={16} />
                                                            Add Variation
                                                        </h3>
                                                        <div className="variation-form">
                                                            <div className="variation-inputs">
                                                                <input
                                                                    type="text"
                                                                    value={variationInput.name}
                                                                    onChange={(e) => setVariationInput(prev => ({ ...prev, name: e.target.value }))}
                                                                    placeholder="Variation name"
                                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariation())}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={variationInput.price}
                                                                    onChange={(e) => setVariationInput(prev => ({ ...prev, price: e.target.value }))}
                                                                    placeholder={`Price (${getCurrencySymbol()})`}
                                                                    step="0.01"
                                                                    min="0"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={variationInput.duration}
                                                                    onChange={(e) => setVariationInput(prev => ({ ...prev, duration: e.target.value }))}
                                                                    placeholder="Extra minutes"
                                                                    min="0"
                                                                    step="5"
                                                                />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={handleAddVariation} 
                                                                    className="add-variation-btn"
                                                                    style={{ background: appTheme.colors.primary }}
                                                                >
                                                                    <Plus size={16} />
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <List size={16} />
                                                            Variations List
                                                        </h3>
                                                        <div className="variations-list">
                                                            {formData.variations.length > 0 ? (
                                                                formData.variations.map((variation, index) => (
                                                                    <div key={index} className="variation-item">
                                                                        <div className="variation-info">
                                                                            <span className="variation-name">{variation.name}</span>
                                                                            <span className="variation-price">+{getCurrencySymbol()}{variation.price}</span>
                                                                            {variation.duration > 0 && (
                                                                                <span className="variation-duration">+{variation.duration} min</span>
                                                                            )}
                                                                        </div>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleRemoveVariation(index)} 
                                                                            className="remove-btn"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="empty-state">
                                                                    <Briefcase size={32} />
                                                                    <p>No variations added</p>
                                                                    <span>Add variations like "Premium Package" or "Express Service"</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Addons */}
                                            {section.id === 'addons' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Plus size={16} />
                                                            Add Add-on
                                                        </h3>
                                                        <div className="addon-form">
                                                            <div className="addon-inputs">
                                                                <input
                                                                    type="text"
                                                                    value={addonInput.name}
                                                                    onChange={(e) => setAddonInput(prev => ({ ...prev, name: e.target.value }))}
                                                                    placeholder="Add-on name"
                                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddon())}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={addonInput.price}
                                                                    onChange={(e) => setAddonInput(prev => ({ ...prev, price: e.target.value }))}
                                                                    placeholder={`Price (${getCurrencySymbol()})`}
                                                                    step="0.01"
                                                                    min="0"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={addonInput.description}
                                                                    onChange={(e) => setAddonInput(prev => ({ ...prev, description: e.target.value }))}
                                                                    placeholder="Description"
                                                                />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={handleAddAddon} 
                                                                    className="add-addon-btn"
                                                                    style={{ background: appTheme.colors.secondary }}
                                                                >
                                                                    <Plus size={16} />
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <List size={16} />
                                                            Add-ons List
                                                        </h3>
                                                        <div className="addons-list">
                                                            {formData.addons.length > 0 ? (
                                                                formData.addons.map((addon, index) => (
                                                                    <div key={index} className="addon-item">
                                                                        <div className="addon-info">
                                                                            <span className="addon-name">{addon.name}</span>
                                                                            {addon.description && (
                                                                                <span className="addon-desc">{addon.description}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="addon-price">
                                                                            +{getCurrencySymbol()}{addon.price}
                                                                        </div>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleRemoveAddon(index)} 
                                                                            className="remove-btn"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="empty-state">
                                                                    <Plus size={32} />
                                                                    <p>No add-ons added</p>
                                                                    <span>Add optional extras customers can purchase</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Requirements */}
                                            {section.id === 'requirements' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <AlertCircle size={16} />
                                                            Client Requirements
                                                        </h3>
                                                        <div className="requirements-list">
                                                            {formData.clientRequirements.map((req, index) => (
                                                                <div key={index} className="requirement-row">
                                                                    <input
                                                                        type="text"
                                                                        value={req}
                                                                        onChange={(e) => handleArrayChange('clientRequirements', index, e.target.value)}
                                                                        placeholder="What client needs to bring"
                                                                        onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                                                                    />
                                                                    {formData.clientRequirements.length > 1 && (
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => removeArrayItem('clientRequirements', index)} 
                                                                            className="remove-row-btn"
                                                                        >
                                                                            <Minus size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => addArrayItem('clientRequirements')} 
                                                                className="add-row-btn"
                                                            >
                                                                <Plus size={14} />
                                                                Add Requirement
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <ThumbsUp size={16} />
                                                            Professional Provides
                                                        </h3>
                                                        <div className="requirements-list">
                                                            {formData.professionalProvides.map((prov, index) => (
                                                                <div key={index} className="requirement-row">
                                                                    <input
                                                                        type="text"
                                                                        value={prov}
                                                                        onChange={(e) => handleArrayChange('professionalProvides', index, e.target.value)}
                                                                        placeholder="What professional provides"
                                                                        onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                                                                    />
                                                                    {formData.professionalProvides.length > 1 && (
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => removeArrayItem('professionalProvides', index)} 
                                                                            className="remove-row-btn"
                                                                        >
                                                                            <Minus size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => addArrayItem('professionalProvides')} 
                                                                className="add-row-btn"
                                                            >
                                                                <Plus size={14} />
                                                                Add Item
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Restrictions */}
                                            {section.id === 'restrictions' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Calendar size={16} />
                                                            Booking Rules
                                                        </h3>
                                                        <div className="restrictions-grid">
                                                            <div className="restriction-card">
                                                                <div className="restriction-header">
                                                                    <Calendar size={14} />
                                                                    <span>Advance Booking</span>
                                                                </div>
                                                                <div className="restriction-input">
                                                                    <input
                                                                        type="number"
                                                                        name="advanceBooking"
                                                                        value={formData.advanceBooking}
                                                                        onChange={handleChange}
                                                                        min="1"
                                                                        max="365"
                                                                        ref={(el) => setInputRef('advanceBooking', el)}
                                                                    />
                                                                    <span>days</span>
                                                                </div>
                                                            </div>

                                                            <div className="restriction-card">
                                                                <div className="restriction-header">
                                                                    <Users size={14} />
                                                                    <span>Age Restrictions</span>
                                                                </div>
                                                                <div className="age-inputs">
                                                                    <input
                                                                        type="number"
                                                                        name="minAge"
                                                                        value={formData.minAge || ''}
                                                                        onChange={handleChange}
                                                                        placeholder="Min"
                                                                        min="0"
                                                                        max="100"
                                                                        ref={(el) => setInputRef('minAge', el)}
                                                                    />
                                                                    <span>to</span>
                                                                    <input
                                                                        type="number"
                                                                        name="maxAge"
                                                                        value={formData.maxAge || ''}
                                                                        onChange={handleChange}
                                                                        placeholder="Max"
                                                                        min="0"
                                                                        max="100"
                                                                        ref={(el) => setInputRef('maxAge', el)}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="restriction-card">
                                                                <div className="restriction-header">
                                                                    <Users size={14} />
                                                                    <span>Gender Preference</span>
                                                                </div>
                                                                <div className="gender-options">
                                                                    {GENDER_PREFERENCES.map(pref => (
                                                                        <label 
                                                                            key={pref.value} 
                                                                            className={`gender-option ${formData.genderPreference === pref.value ? 'selected' : ''}`}
                                                                            style={{ 
                                                                                borderColor: formData.genderPreference === pref.value ? pref.color : appTheme.colors.border,
                                                                                background: formData.genderPreference === pref.value ? `${pref.color}10` : 'white'
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name="genderPreference"
                                                                                value={pref.value}
                                                                                checked={formData.genderPreference === pref.value}
                                                                                onChange={handleChange}
                                                                            />
                                                                            <span className="gender-icon">{pref.icon}</span>
                                                                            <span className="gender-label">{pref.label}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
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

                    {/* Status Section */}
                    <div className="status-section">
                        <div className="status-header">
                            <Settings size={20} />
                            <h3>Service Status</h3>
                        </div>
                        <div className="status-grid">
                            <label className="status-checkbox">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <CheckCircle size={18} />
                                <span>Service is active</span>
                            </label>

                            <label className="status-checkbox">
                                <input
                                    type="checkbox"
                                    name="isPopular"
                                    checked={formData.isPopular}
                                    onChange={handleChange}
                                />
                                <Star size={18} />
                                <span>Mark as popular</span>
                            </label>

                            <label className="status-checkbox">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                />
                                <Award size={18} />
                                <span>Feature this service</span>
                            </label>
                        </div>
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
                                <span>{isEditing ? 'Update Service' : 'Create Service'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .create-service-page {
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

                .status-badge.active {
                    background: #f0fdf4;
                    color: #22c55e;
                }

                .status-badge.inactive {
                    background: #fef2f2;
                    color: #ef4444;
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
                    border: 2px solid ${appTheme.colors.border};
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
                }

                .category-icon {
                    font-size: 1.5rem;
                }

                .category-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #1e293b;
                    text-align: center;
                }

                /* ==================== TYPE CARDS ==================== */
                .type-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .type-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 10px;
                    background: white;
                    border: 2px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                }

                .type-card input {
                    position: absolute;
                    opacity: 0;
                }

                .type-card.selected {
                    background: ${appTheme.colors.primary}10;
                }

                .type-icon {
                    font-size: 1.2rem;
                }

                .type-label {
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: #1e293b;
                }

                /* ==================== TAGS ==================== */
                .tag-input-group {
                    display: flex;
                    gap: 8px;
                }

                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 0 16px;
                    background: ${appTheme.colors.primary}10;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: 8px;
                    color: ${appTheme.colors.primary};
                    font-size: 0.85rem;
                    white-space: nowrap;
                    cursor: pointer;
                }

                .tags-list {
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
                    font-size: 0.75rem;
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

                /* ==================== PRICING ==================== */
                .pricing-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }

                @media (max-width: 1024px) {
                    .pricing-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .pricing-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .pricing-card {
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                }

                .pricing-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 8px;
                    color: #475569;
                    font-size: 0.813rem;
                }

                .pricing-input {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .currency-symbol {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #475569;
                }

                .pricing-input input {
                    width: 100%;
                    padding: 6px 8px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.9rem;
                    text-align: right;
                }

                .currency-select {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.85rem;
                }

                .buffer-input {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .buffer-input input {
                    width: 70px;
                    padding: 6px 8px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    text-align: center;
                }

                .buffer-input span {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                /* ==================== VARIATIONS ==================== */
                .variation-form {
                    margin-bottom: 20px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .variation-inputs {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr auto;
                    gap: 8px;
                }

                @media (max-width: 640px) {
                    .variation-inputs {
                        grid-template-columns: 1fr;
                    }
                }

                .add-variation-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 0 16px;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.85rem;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .variations-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .variation-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: white;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                }

                .variation-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .variation-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .variation-price {
                    font-size: 0.875rem;
                    color: ${appTheme.colors.success};
                    font-weight: 600;
                }

                .variation-duration {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                /* ==================== ADDONS ==================== */
                .addon-form {
                    margin-bottom: 20px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .addon-inputs {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 2fr auto;
                    gap: 8px;
                }

                @media (max-width: 1024px) {
                    .addon-inputs {
                        grid-template-columns: 1fr;
                    }
                }

                .add-addon-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 0 16px;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.85rem;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .addons-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .addon-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: white;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                }

                .addon-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .addon-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .addon-desc {
                    font-size: 0.688rem;
                    color: #64748b;
                }

                .addon-price {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: ${appTheme.colors.success};
                }

                /* ==================== REQUIREMENTS ==================== */
                .requirements-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .requirement-row {
                    display: flex;
                    gap: 8px;
                }

                .remove-row-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 10px;
                    background: ${appTheme.colors.error}10;
                    border: 1px solid ${appTheme.colors.error}30;
                    border-radius: 8px;
                    color: ${appTheme.colors.error};
                    cursor: pointer;
                }

                .add-row-btn {
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
                }

                /* ==================== RESTRICTIONS ==================== */
                .restrictions-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                @media (max-width: 768px) {
                    .restrictions-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .restriction-card {
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                }

                .restriction-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 12px;
                    color: #475569;
                }

                .restriction-input {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .restriction-input input {
                    width: 80px;
                    padding: 6px 8px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    text-align: center;
                }

                .restriction-input span {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .age-inputs {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .age-inputs input {
                    width: 70px;
                    padding: 6px 8px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    text-align: center;
                }

                .age-inputs span {
                    color: #64748b;
                }

                .gender-options {
                    display: flex;
                    gap: 6px;
                }

                .gender-option {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 4px;
                    background: white;
                    border: 2px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                }

                .gender-option input {
                    position: absolute;
                    opacity: 0;
                }

                .gender-option.selected {
                    background: ${appTheme.colors.primary}10;
                }

                .gender-icon {
                    font-size: 1rem;
                }

                .gender-label {
                    font-size: 0.688rem;
                    font-weight: 500;
                    color: #1e293b;
                }

                /* ==================== STATUS SECTION ==================== */
                .status-section {
                    background: white;
                    border-radius: 8px;
                    padding: 24px;
                    margin-top: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .status-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .status-header svg {
                    color: ${appTheme.colors.primary};
                }

                .status-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0;
                }

                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                @media (max-width: 640px) {
                    .status-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .status-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: #f8fafc;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                }

                .status-checkbox input {
                    width: 18px;
                    height: 18px;
                }

                .status-checkbox span {
                    font-size: 0.875rem;
                    color: #1e293b;
                }

                /* ==================== EMPTY STATE ==================== */
                .empty-state {
                    text-align: center;
                    padding: 32px 24px;
                    background: #f8fafc;
                    border-radius: 8px;
                    color: #64748b;
                }

                .empty-state svg {
                    margin-bottom: 12px;
                    color: #94a3b8;
                }

                .empty-state p {
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin: 0 0 4px;
                }

                .empty-state span {
                    font-size: 0.75rem;
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

                .remove-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    background: transparent;
                    border: none;
                    color: ${appTheme.colors.error};
                    cursor: pointer;
                    border-radius: 6px;
                }

                .remove-btn:hover {
                    background: ${appTheme.colors.error}10;
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

                    .category-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .type-cards {
                        grid-template-columns: 1fr;
                    }

                    .variation-inputs,
                    .addon-inputs {
                        grid-template-columns: 1fr;
                    }

                    .add-variation-btn,
                    .add-addon-btn {
                        padding: 12px;
                    }

                    .variation-info {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }

                    .restrictions-grid {
                        grid-template-columns: 1fr;
                    }

                    .gender-options {
                        flex-wrap: wrap;
                    }
                }

                @media (max-width: 480px) {
                    .main-content {
                        padding: 16px 16px 90px 16px;
                    }

                    .stats-grid {
                        display: none;
                    }

                    .tag-input-group {
                        flex-direction: column;
                    }

                    .add-btn {
                        padding: 12px;
                        justify-content: center;
                    }

                    .pricing-grid {
                        grid-template-columns: 1fr;
                    }

                    .status-grid {
                        grid-template-columns: 1fr;
                    }

                    .requirement-row {
                        flex-direction: column;
                    }

                    .remove-row-btn {
                        padding: 12px;
                    }
                }
            `}</style>
        </>
    );
}