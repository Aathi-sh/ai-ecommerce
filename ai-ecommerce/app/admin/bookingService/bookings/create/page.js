// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Head from 'next/head';
// import {
//   ArrowLeft, Save, User, Building, Mail, Phone,
//   MapPin, Briefcase, Clock, Calendar, DollarSign,
//   Plus, Minus, CheckCircle, XCircle, AlertCircle,
//   Search, Filter, CreditCard, Wallet, Zap
// } from 'lucide-react';

// export default function CreateBookingPage() {
//   const router = useRouter();
  
//   const [loading, setLoading] = useState(false);
//   const [fetchingData, setFetchingData] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [professionals, setProfessionals] = useState([]);
//   const [services, setServices] = useState([]);
//   const [filteredServices, setFilteredServices] = useState([]);
//   const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  
//   const [formData, setFormData] = useState({
//     clientId: '',
//     professionalId: '',
//     serviceId: '',
    
//     // Service Details
//     serviceName: '',
//     serviceDuration: 0,
//     servicePrice: 0,
//     selectedVariation: null,
//     selectedAddons: [],
    
//     // Scheduling
//     scheduledDate: '',
//     startTime: '',
//     endTime: '',
//     timezone: 'Asia/Kolkata',
    
//     // Location
//     locationType: 'professional_address',
//     address: '',
//     virtualLink: '',
    
//     // Payment
//     totalAmount: 0,
//     paymentStatus: 'pending',
//     paymentMethod: '',
//     paidAmount: 0,
    
//     // Notes
//     clientNotes: '',
//     professionalNotes: '',
    
//     // Source
//     bookingSource: 'admin'
//   });

//   const [errors, setErrors] = useState({});
//   const [searchTerms, setSearchTerms] = useState({
//     client: '',
//     professional: '',
//     service: ''
//   });

//   // Categories
//   const locationTypes = [
//     { value: 'professional_address', label: 'Professional Address' },
//     { value: 'client_address', label: 'Client Address' },
//     { value: 'virtual', label: 'Virtual Meeting' },
//     { value: 'other', label: 'Other Location' }
//   ];

//   const paymentMethods = [
//     { value: 'cash', label: 'Cash' },
//     { value: 'card', label: 'Card' },
//     { value: 'online', label: 'Online' },
//     { value: 'wallet', label: 'Wallet' },
//     { value: 'upi', label: 'UPI' },
//     { value: 'other', label: 'Other' }
//   ];

//   const paymentStatuses = [
//     { value: 'pending', label: 'Pending' },
//     { value: 'partial', label: 'Partial' },
//     { value: 'paid', label: 'Paid' },
//     { value: 'failed', label: 'Failed' }
//   ];

//   // Fetch initial data
//   useEffect(() => {
//     fetchUsers();
//     fetchProfessionals();
//     fetchServices();
//   }, []);

//   // Filter services when professional or category changes
//   useEffect(() => {
//     if (formData.professionalId) {
//       // In a real app, you might fetch services offered by this professional
//       // For now, filter by category if professional has category
//       const professional = professionals.find(p => p._id === formData.professionalId);
//       if (professional?.category) {
//         setFilteredServices(services.filter(s => s.category === professional.category));
//       } else {
//         setFilteredServices(services);
//       }
//     } else {
//       setFilteredServices(services);
//     }
//   }, [formData.professionalId, services, professionals]);

//   // Filter professionals when service or category changes
//   useEffect(() => {
//     if (formData.serviceId) {
//       const service = services.find(s => s._id === formData.serviceId);
//       if (service?.category) {
//         setFilteredProfessionals(professionals.filter(p => p.category === service.category && p.isActive));
//       } else {
//         setFilteredProfessionals(professionals.filter(p => p.isActive));
//       }
//     } else {
//       setFilteredProfessionals(professionals.filter(p => p.isActive));
//     }
//   }, [formData.serviceId, services, professionals]);

//   // Calculate end time when start time and duration change
//   useEffect(() => {
//     if (formData.startTime && (formData.serviceDuration > 0 || formData.selectedVariation?.duration)) {
//       const duration = formData.selectedVariation?.duration || formData.serviceDuration;
//       const [hours, minutes] = formData.startTime.split(':').map(Number);
//       const totalMinutes = hours * 60 + minutes + duration;
//       const endHours = Math.floor(totalMinutes / 60);
//       const endMinutes = totalMinutes % 60;
//       const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
//       setFormData(prev => ({ ...prev, endTime }));
//     }
//   }, [formData.startTime, formData.serviceDuration, formData.selectedVariation]);

//   // Calculate total amount
//   useEffect(() => {
//     let total = formData.servicePrice || 0;
//     if (formData.selectedVariation) {
//       total = formData.selectedVariation.price;
//     }
//     if (formData.selectedAddons.length > 0) {
//       total += formData.selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
//     }
//     setFormData(prev => ({ ...prev, totalAmount: total }));
//   }, [formData.servicePrice, formData.selectedVariation, formData.selectedAddons]);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch('/api/bookingService/bookings?role=user&limit=100');
//       const data = await res.json();
//       if (data.success) {
//         setUsers(data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const fetchProfessionals = async () => {
//     setFetchingData(true);
//     try {
//       const res = await fetch('/api/bookingService/bookingmng?limit=100&status=active');
//       const data = await res.json();
//       if (data.success) {
//         setProfessionals(data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching professionals:', error);
//     } finally {
//       setFetchingData(false);
//     }
//   };

//   const fetchServices = async () => {
//     setFetchingData(true);
//     try {
//       const res = await fetch('/api/bookingService/service?limit=100&status=active');
//       const data = await res.json();
//       if (data.success) {
//         setServices(data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching services:', error);
//     } finally {
//       setFetchingData(false);
//     }
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   // Handle service selection
//   const handleServiceSelect = (service) => {
//     setFormData(prev => ({
//       ...prev,
//       serviceId: service._id,
//       serviceName: service.name,
//       serviceDuration: service.duration,
//       servicePrice: service.basePrice,
//       selectedVariation: null,
//       selectedAddons: []
//     }));
//   };

//   // Handle variation selection
//   const handleVariationSelect = (variation) => {
//     setFormData(prev => ({
//       ...prev,
//       selectedVariation: variation,
//       serviceDuration: variation.duration || prev.serviceDuration
//     }));
//   };

//   // Handle addon toggle
//   const handleAddonToggle = (addon) => {
//     setFormData(prev => {
//       const exists = prev.selectedAddons.some(a => a.name === addon.name);
//       if (exists) {
//         return {
//           ...prev,
//           selectedAddons: prev.selectedAddons.filter(a => a.name !== addon.name)
//         };
//       } else {
//         return {
//           ...prev,
//           selectedAddons: [...prev.selectedAddons, addon]
//         };
//       }
//     });
//   };

//   // Filter lists based on search
//   const filteredUsersList = users.filter(user => 
//     user.name?.toLowerCase().includes(searchTerms.client.toLowerCase()) ||
//     user.email?.toLowerCase().includes(searchTerms.client.toLowerCase()) ||
//     user.phone?.includes(searchTerms.client)
//   );

//   const filteredProfessionalsList = filteredProfessionals.filter(prof => 
//     prof.businessName?.toLowerCase().includes(searchTerms.professional.toLowerCase()) ||
//     prof.email?.toLowerCase().includes(searchTerms.professional.toLowerCase()) ||
//     prof.phone?.includes(searchTerms.professional)
//   );

//   const filteredServicesList = filteredServices.filter(service => 
//     service.name?.toLowerCase().includes(searchTerms.service.toLowerCase()) ||
//     service.category?.toLowerCase().includes(searchTerms.service.toLowerCase())
//   );

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.clientId) {
//       newErrors.clientId = 'Please select a client';
//     }

//     if (!formData.professionalId) {
//       newErrors.professionalId = 'Please select a professional';
//     }

//     if (!formData.serviceId) {
//       newErrors.serviceId = 'Please select a service';
//     }

//     if (!formData.scheduledDate) {
//       newErrors.scheduledDate = 'Please select a date';
//     }

//     if (!formData.startTime) {
//       newErrors.startTime = 'Please select a start time';
//     }

//     if (formData.paymentStatus === 'partial' && (!formData.paidAmount || formData.paidAmount <= 0)) {
//       newErrors.paidAmount = 'Please enter paid amount for partial payment';
//     }

//     if (formData.locationType === 'virtual' && !formData.virtualLink) {
//       newErrors.virtualLink = 'Please enter virtual meeting link';
//     }

//     if (formData.locationType === 'other' && !formData.address) {
//       newErrors.address = 'Please enter address';
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
//       const selectedService = services.find(s => s._id === formData.serviceId);
//       const selectedProfessional = professionals.find(p => p._id === formData.professionalId);
//       const selectedClient = users.find(u => u._id === formData.clientId);

//       const payload = {
//         ...formData,
//         serviceName: selectedService?.name,
//         serviceDuration: formData.selectedVariation?.duration || selectedService?.duration,
//         bookedAt: new Date().toISOString(),
//         clientName: selectedClient?.name,
//         clientPhone: selectedClient?.phone,
//         professionalName: selectedProfessional?.businessName
//       };

//       const res = await fetch('/api/bookingService/bookings', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();

//       if (data.success) {
//         alert('Booking created successfully!');
//         router.push('/admin/bookingService/bookings');
//       } else {
//         alert(`Error: ${data.error || 'Failed to create booking'}`);
//       }
//     } catch (error) {
//       console.error('Error creating booking:', error);
//       alert('Failed to create booking. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get today's date for min attribute
//   const today = new Date().toISOString().split('T')[0];

//   return (
//     <>
//       <Head>
//         <title>Create New Booking | LFMS</title>
//       </Head>

//       <div className="create-booking-wrapper">
//         {/* Header */}
//         <div className="page-header">
//           <div className="header-left">
//             <Link href="/admin/bookingService/bookings" className="back-button">
//               <ArrowLeft size={18} />
//               <span>Back to Bookings</span>
//             </Link>
//             <div>
//               <h1 className="page-title">Create New Booking</h1>
//               <p className="page-subtitle">Schedule a new appointment for a client</p>
//             </div>
//           </div>
//           <div className="badge draft">New Booking</div>
//         </div>

//         <form onSubmit={handleSubmit} className="form-container">
//           {/* Client Selection */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <User size={18} />
//                 <h2>Select Client</h2>
//                 <span className="required-badge">Required</span>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="form-group">
//                 <label className="form-label">
//                   Search Client <span className="required-star">*</span>
//                 </label>
//                 <div className="search-box">
//                   <Search size={18} className="search-icon" />
//                   <input
//                     type="text"
//                     placeholder="Search by name, email or phone..."
//                     value={searchTerms.client}
//                     onChange={(e) => setSearchTerms(prev => ({ ...prev, client: e.target.value }))}
//                     className="search-input"
//                   />
//                 </div>

//                 <div className="selection-grid">
//                   {fetchingData ? (
//                     <div className="loading-mini">
//                       <div className="spinner-mini"></div>
//                       <span>Loading clients...</span>
//                     </div>
//                   ) : filteredUsersList.length === 0 ? (
//                     <div className="empty-mini">
//                       <User size={24} />
//                       <p>No clients found</p>
//                     </div>
//                   ) : (
//                     filteredUsersList.map(user => (
//                       <label
//                         key={user._id}
//                         className={`selection-card ${formData.clientId === user._id ? 'selected' : ''}`}
//                       >
//                         <input
//                           type="radio"
//                           name="clientId"
//                           value={user._id}
//                           checked={formData.clientId === user._id}
//                           onChange={handleChange}
//                         />
//                         <div className="selection-avatar">
//                           {user.name?.charAt(0) || 'U'}
//                         </div>
//                         <div className="selection-info">
//                           <span className="selection-name">{user.name || 'Unknown'}</span>
//                           <span className="selection-detail">{user.email}</span>
//                           <span className="selection-detail">{user.phone}</span>
//                         </div>
//                       </label>
//                     ))
//                   )}
//                 </div>
//                 {errors.clientId && <p className="error-message">{errors.clientId}</p>}
//               </div>
//             </div>
//           </div>

//           {/* Professional Selection */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <Building size={18} />
//                 <h2>Select Professional</h2>
//                 <span className="required-badge">Required</span>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="form-group">
//                 <label className="form-label">
//                   Search Professional <span className="required-star">*</span>
//                 </label>
//                 <div className="search-box">
//                   <Search size={18} className="search-icon" />
//                   <input
//                     type="text"
//                     placeholder="Search by business name, email or phone..."
//                     value={searchTerms.professional}
//                     onChange={(e) => setSearchTerms(prev => ({ ...prev, professional: e.target.value }))}
//                     className="search-input"
//                   />
//                 </div>

//                 <div className="selection-grid">
//                   {fetchingData ? (
//                     <div className="loading-mini">
//                       <div className="spinner-mini"></div>
//                       <span>Loading professionals...</span>
//                     </div>
//                   ) : filteredProfessionalsList.length === 0 ? (
//                     <div className="empty-mini">
//                       <Building size={24} />
//                       <p>No professionals found</p>
//                     </div>
//                   ) : (
//                     filteredProfessionalsList.map(prof => (
//                       <label
//                         key={prof._id}
//                         className={`selection-card ${formData.professionalId === prof._id ? 'selected' : ''}`}
//                       >
//                         <input
//                           type="radio"
//                           name="professionalId"
//                           value={prof._id}
//                           checked={formData.professionalId === prof._id}
//                           onChange={handleChange}
//                         />
//                         <div className="selection-avatar business">
//                           {prof.businessName?.charAt(0) || 'B'}
//                         </div>
//                         <div className="selection-info">
//                           <span className="selection-name">{prof.businessName || 'Unknown'}</span>
//                           <span className="selection-detail">{prof.category}</span>
//                           <span className="selection-detail">{prof.phone}</span>
//                           {prof.rating?.average > 0 && (
//                             <span className="selection-rating">★ {prof.rating.average.toFixed(1)}</span>
//                           )}
//                         </div>
//                       </label>
//                     ))
//                   )}
//                 </div>
//                 {errors.professionalId && <p className="error-message">{errors.professionalId}</p>}
//               </div>
//             </div>
//           </div>

//           {/* Service Selection */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <Briefcase size={18} />
//                 <h2>Select Service</h2>
//                 <span className="required-badge">Required</span>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="form-group">
//                 <label className="form-label">
//                   Search Service <span className="required-star">*</span>
//                 </label>
//                 <div className="search-box">
//                   <Search size={18} className="search-icon" />
//                   <input
//                     type="text"
//                     placeholder="Search by service name or category..."
//                     value={searchTerms.service}
//                     onChange={(e) => setSearchTerms(prev => ({ ...prev, service: e.target.value }))}
//                     className="search-input"
//                   />
//                 </div>

//                 <div className="services-grid">
//                   {fetchingData ? (
//                     <div className="loading-mini">
//                       <div className="spinner-mini"></div>
//                       <span>Loading services...</span>
//                     </div>
//                   ) : filteredServicesList.length === 0 ? (
//                     <div className="empty-mini">
//                       <Briefcase size={24} />
//                       <p>No services found</p>
//                     </div>
//                   ) : (
//                     filteredServicesList.map(service => (
//                       <div key={service._id} className="service-card-wrapper">
//                         <label
//                           className={`service-card ${formData.serviceId === service._id ? 'selected' : ''}`}
//                         >
//                           <input
//                             type="radio"
//                             name="serviceId"
//                             value={service._id}
//                             checked={formData.serviceId === service._id}
//                             onChange={() => handleServiceSelect(service)}
//                           />
//                           <div className="service-card-header">
//                             <span className="service-category">{service.category}</span>
//                             <span className="service-price">₹{service.basePrice}</span>
//                           </div>
//                           <h3 className="service-name">{service.name}</h3>
//                           <p className="service-description">{service.description?.substring(0, 60)}...</p>
//                           <div className="service-meta">
//                             <Clock size={14} />
//                             <span>{service.duration} min</span>
//                           </div>
//                         </label>

//                         {/* Variations */}
//                         {formData.serviceId === service._id && service.variations?.length > 0 && (
//                           <div className="variations-section">
//                             <h4>Available Variations</h4>
//                             <div className="variations-grid">
//                               {service.variations.map((variation, index) => (
//                                 <label
//                                   key={index}
//                                   className={`variation-card ${formData.selectedVariation?.name === variation.name ? 'selected' : ''}`}
//                                 >
//                                   <input
//                                     type="radio"
//                                     name="variation"
//                                     checked={formData.selectedVariation?.name === variation.name}
//                                     onChange={() => handleVariationSelect(variation)}
//                                   />
//                                   <span className="variation-name">{variation.name}</span>
//                                   <span className="variation-price">+₹{variation.price}</span>
//                                   {variation.duration > 0 && (
//                                     <span className="variation-duration">+{variation.duration} min</span>
//                                   )}
//                                 </label>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {/* Addons */}
//                         {formData.serviceId === service._id && service.addons?.length > 0 && (
//                           <div className="addons-section">
//                             <h4>Available Add-ons</h4>
//                             <div className="addons-grid">
//                               {service.addons.map((addon, index) => (
//                                 <label
//                                   key={index}
//                                   className={`addon-card ${formData.selectedAddons.some(a => a.name === addon.name) ? 'selected' : ''}`}
//                                 >
//                                   <input
//                                     type="checkbox"
//                                     checked={formData.selectedAddons.some(a => a.name === addon.name)}
//                                     onChange={() => handleAddonToggle(addon)}
//                                   />
//                                   <span className="addon-name">{addon.name}</span>
//                                   <span className="addon-price">+₹{addon.price}</span>
//                                   {addon.description && (
//                                     <span className="addon-desc">{addon.description}</span>
//                                   )}
//                                 </label>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   )}
//                 </div>
//                 {errors.serviceId && <p className="error-message">{errors.serviceId}</p>}
//               </div>
//             </div>
//           </div>

//           {/* Schedule */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <Calendar size={18} />
//                 <h2>Schedule</h2>
//                 <span className="required-badge">Required</span>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="form-row">
//                 <div className="form-group">
//                   <label className="form-label">
//                     Date <span className="required-star">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     name="scheduledDate"
//                     value={formData.scheduledDate}
//                     onChange={handleChange}
//                     min={today}
//                     className={`form-input ${errors.scheduledDate ? 'error' : ''}`}
//                   />
//                   {errors.scheduledDate && <p className="error-message">{errors.scheduledDate}</p>}
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">
//                     Start Time <span className="required-star">*</span>
//                   </label>
//                   <input
//                     type="time"
//                     name="startTime"
//                     value={formData.startTime}
//                     onChange={handleChange}
//                     className={`form-input ${errors.startTime ? 'error' : ''}`}
//                   />
//                   {errors.startTime && <p className="error-message">{errors.startTime}</p>}
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">End Time</label>
//                   <input
//                     type="time"
//                     name="endTime"
//                     value={formData.endTime}
//                     readOnly
//                     className="form-input read-only"
//                   />
//                   <p className="field-hint">Auto-calculated based on duration</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Location */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <MapPin size={18} />
//                 <h2>Location</h2>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="form-group">
//                 <label className="form-label">Location Type</label>
//                 <select
//                   name="locationType"
//                   value={formData.locationType}
//                   onChange={handleChange}
//                   className="form-select"
//                 >
//                   {locationTypes.map(type => (
//                     <option key={type.value} value={type.value}>{type.label}</option>
//                   ))}
//                 </select>
//               </div>

//               {formData.locationType === 'virtual' && (
//                 <div className="form-group">
//                   <label className="form-label">
//                     Meeting Link <span className="required-star">*</span>
//                   </label>
//                   <input
//                     type="url"
//                     name="virtualLink"
//                     value={formData.virtualLink}
//                     onChange={handleChange}
//                     placeholder="https://meet.google.com/..."
//                     className={`form-input ${errors.virtualLink ? 'error' : ''}`}
//                   />
//                   {errors.virtualLink && <p className="error-message">{errors.virtualLink}</p>}
//                 </div>
//               )}

//               {(formData.locationType === 'other' || formData.locationType === 'client_address') && (
//                 <div className="form-group">
//                   <label className="form-label">
//                     Address <span className="required-star">*</span>
//                   </label>
//                   <textarea
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     rows="3"
//                     className={`form-textarea ${errors.address ? 'error' : ''}`}
//                     placeholder="Enter complete address"
//                   />
//                   {errors.address && <p className="error-message">{errors.address}</p>}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <DollarSign size={18} />
//                 <h2>Payment Details</h2>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="payment-summary">
//                 <div className="summary-row">
//                   <span>Base Price:</span>
//                   <span>₹{formData.servicePrice || 0}</span>
//                 </div>
//                 {formData.selectedVariation && (
//                   <div className="summary-row">
//                     <span>Variation ({formData.selectedVariation.name}):</span>
//                     <span>+₹{formData.selectedVariation.price}</span>
//                   </div>
//                 )}
//                 {formData.selectedAddons.map((addon, index) => (
//                   <div key={index} className="summary-row">
//                     <span>Add-on ({addon.name}):</span>
//                     <span>+₹{addon.price}</span>
//                   </div>
//                 ))}
//                 <div className="summary-row total">
//                   <span>Total Amount:</span>
//                   <span>₹{formData.totalAmount}</span>
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label className="form-label">Payment Status</label>
//                   <select
//                     name="paymentStatus"
//                     value={formData.paymentStatus}
//                     onChange={handleChange}
//                     className="form-select"
//                   >
//                     {paymentStatuses.map(status => (
//                       <option key={status.value} value={status.value}>{status.label}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Payment Method</label>
//                   <select
//                     name="paymentMethod"
//                     value={formData.paymentMethod}
//                     onChange={handleChange}
//                     className="form-select"
//                   >
//                     <option value="">Select method</option>
//                     {paymentMethods.map(method => (
//                       <option key={method.value} value={method.value}>{method.label}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {formData.paymentStatus === 'partial' && (
//                 <div className="form-group">
//                   <label className="form-label">
//                     Paid Amount <span className="required-star">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     name="paidAmount"
//                     value={formData.paidAmount}
//                     onChange={handleChange}
//                     min="0"
//                     max={formData.totalAmount}
//                     step="1"
//                     className={`form-input ${errors.paidAmount ? 'error' : ''}`}
//                   />
//                   {errors.paidAmount && <p className="error-message">{errors.paidAmount}</p>}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="form-section">
//             <div className="section-header">
//               <div className="section-title">
//                 <AlertCircle size={18} />
//                 <h2>Additional Notes</h2>
//               </div>
//             </div>

//             <div className="section-content expanded">
//               <div className="form-group">
//                 <label className="form-label">Client Notes</label>
//                 <textarea
//                     name="clientNotes"
//                     value={formData.clientNotes}
//                     onChange={handleChange}
//                     rows="3"
//                     className="form-textarea"
//                     placeholder="Special instructions or requests from client..."
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Professional Notes</label>
//                   <textarea
//                     name="professionalNotes"
//                     value={formData.professionalNotes}
//                     onChange={handleChange}
//                     rows="3"
//                     className="form-textarea"
//                     placeholder="Internal notes for the professional..."
//                   />
//                 </div>
//               </div>
//             </div>

//           {/* Form Actions */}
//           <div className="form-actions">
//             <Link href="/admin/bookingService/bookings" className="cancel-btn">
//               Cancel
//             </Link>
//             <button type="submit" disabled={loading} className="submit-btn">
//               {loading ? (
//                 <>
//                   <span className="spinner"></span>
//                   Creating Booking...
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />
//                   Create Booking
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       <style jsx>{`
//         .create-booking-wrapper {
//           width: 100%;
//         }

//         /* Header */
//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 2rem;
//         }

//         .header-left {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .back-button {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.5rem 1rem;
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           color: #1e293b;
//           font-size: 0.9rem;
//           text-decoration: none;
//           transition: all 0.2s;
//         }

//         .back-button:hover {
//           background: #f8fafc;
//         }

//         .page-title {
//           font-size: 1.8rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
//         }

//         .page-subtitle {
//           color: #64748b;
//           font-size: 0.9rem;
//           margin: 0.25rem 0 0;
//         }

//         .badge {
//           padding: 0.4rem 1rem;
//           border-radius: 20px;
//           font-size: 0.8rem;
//           font-weight: 500;
//           background: #f1f5f9;
//           color: #475569;
//           border: 1px solid #e2e8f0;
//         }

//         .badge.draft {
//           background: #dbeafe;
//           color: #1e40af;
//           border-color: #bfdbfe;
//         }

//         /* Form Container */
//         .form-container {
//           display: flex;
//           flex-direction: column;
//           gap: 1.5rem;
//         }

//         /* Form Sections */
//         .form-section {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           overflow: hidden;
//         }

//         .section-header {
//           padding: 1.25rem 1.5rem;
//           background: #f8fafc;
//           border-bottom: 1px solid #e2e8f0;
//         }

//         .section-title {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//         }

//         .section-title svg {
//           color: #3b82f6;
//         }

//         .section-title h2 {
//           font-size: 1.1rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0;
//         }

//         .required-badge {
//           padding: 0.2rem 0.6rem;
//           background: #fee2e2;
//           color: #991b1b;
//           border-radius: 20px;
//           font-size: 0.7rem;
//           font-weight: 500;
//         }

//         .section-content {
//           padding: 1.5rem;
//         }

//         .section-content.expanded {
//           display: block;
//         }

//         /* Form Elements */
//         .form-group {
//           margin-bottom: 1.25rem;
//         }

//         .form-group:last-child {
//           margin-bottom: 0;
//         }

//         .form-row {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 1rem;
//           margin-bottom: 1rem;
//         }

//         .form-label {
//           display: block;
//           font-size: 0.9rem;
//           font-weight: 500;
//           color: #1e293b;
//           margin-bottom: 0.4rem;
//         }

//         .required-star {
//           color: #ef4444;
//         }

//         .form-input,
//         .form-select,
//         .form-textarea {
//           width: 100%;
//           padding: 0.6rem 0.75rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           font-size: 0.9rem;
//           background: white;
//           transition: all 0.2s;
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

//         .form-input.read-only {
//           background: #f8fafc;
//           color: #64748b;
//           cursor: not-allowed;
//         }

//         .form-textarea {
//           resize: vertical;
//           min-height: 80px;
//         }

//         .error-message {
//           color: #ef4444;
//           font-size: 0.8rem;
//           margin-top: 0.25rem;
//         }

//         .field-hint {
//           color: #64748b;
//           font-size: 0.75rem;
//           margin-top: 0.25rem;
//         }

//         /* Search Box */
//         .search-box {
//           position: relative;
//           margin-bottom: 1rem;
//         }

//         .search-icon {
//           position: absolute;
//           left: 0.75rem;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #94a3b8;
//         }

//         .search-input {
//           width: 100%;
//           padding: 0.6rem 0.75rem 0.6rem 2.5rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           font-size: 0.9rem;
//           background: white;
//         }

//         .search-input:focus {
//           outline: none;
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         /* Selection Grids */
//         .selection-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
//           gap: 1rem;
//           max-height: 400px;
//           overflow-y: auto;
//           padding: 0.5rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           background: #f8fafc;
//         }

//         .selection-card {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           padding: 1rem;
//           background: white;
//           border: 2px solid #e2e8f0;
//           border-radius: 10px;
//           cursor: pointer;
//           transition: all 0.2s;
//           position: relative;
//         }

//         .selection-card input {
//           position: absolute;
//           opacity: 0;
//         }

//         .selection-card.selected {
//           border-color: #3b82f6;
//           background: #eff6ff;
//         }

//         .selection-card:hover {
//           border-color: #94a3b8;
//         }

//         .selection-avatar {
//           width: 48px;
//           height: 48px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: linear-gradient(135deg, #3b82f6, #8b5cf6);
//           color: white;
//           font-weight: 600;
//           font-size: 1.2rem;
//           border-radius: 10px;
//           flex-shrink: 0;
//         }

//         .selection-avatar.business {
//           background: linear-gradient(135deg, #10b981, #059669);
//         }

//         .selection-info {
//           flex: 1;
//           min-width: 0;
//         }

//         .selection-name {
//           display: block;
//           font-weight: 600;
//           color: #0f172a;
//           margin-bottom: 0.25rem;
//         }

//         .selection-detail {
//           display: block;
//           font-size: 0.8rem;
//           color: #64748b;
//           margin-bottom: 0.1rem;
//         }

//         .selection-rating {
//           display: inline-block;
//           padding: 0.2rem 0.5rem;
//           background: #fef3c7;
//           color: #92400e;
//           font-size: 0.75rem;
//           font-weight: 500;
//           border-radius: 20px;
//           margin-top: 0.25rem;
//         }

//         /* Services Grid */
//         .services-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
//           gap: 1.5rem;
//           max-height: 600px;
//           overflow-y: auto;
//           padding: 0.5rem;
//         }

//         .service-card-wrapper {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           overflow: hidden;
//         }

//         .service-card {
//           display: block;
//           padding: 1.25rem;
//           cursor: pointer;
//           position: relative;
//           border-bottom: 1px solid #e2e8f0;
//         }

//         .service-card input {
//           position: absolute;
//           opacity: 0;
//         }

//         .service-card.selected {
//           background: #eff6ff;
//         }

//         .service-card-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 0.75rem;
//         }

//         .service-category {
//           padding: 0.2rem 0.6rem;
//           background: #f1f5f9;
//           color: #475569;
//           font-size: 0.7rem;
//           font-weight: 500;
//           border-radius: 20px;
//           text-transform: capitalize;
//         }

//         .service-price {
//           font-weight: 600;
//           color: #059669;
//           font-size: 1.1rem;
//         }

//         .service-name {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #0f172a;
//           margin: 0 0 0.5rem;
//         }

//         .service-description {
//           font-size: 0.8rem;
//           color: #64748b;
//           margin: 0 0 0.75rem;
//           line-height: 1.4;
//         }

//         .service-meta {
//           display: flex;
//           align-items: center;
//           gap: 0.25rem;
//           color: #64748b;
//           font-size: 0.8rem;
//         }

//         /* Variations & Addons */
//         .variations-section,
//         .addons-section {
//           padding: 1rem;
//           background: #f8fafc;
//         }

//         .variations-section h4,
//         .addons-section h4 {
//           font-size: 0.9rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin: 0 0 0.75rem;
//         }

//         .variations-grid,
//         .addons-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//           gap: 0.75rem;
//         }

//         .variation-card,
//         .addon-card {
//           display: flex;
//           flex-direction: column;
//           padding: 0.75rem;
//           background: white;
//           border: 2px solid #e2e8f0;
//           border-radius: 8px;
//           cursor: pointer;
//           position: relative;
//         }

//         .variation-card input,
//         .addon-card input {
//           position: absolute;
//           opacity: 0;
//         }

//         .variation-card.selected,
//         .addon-card.selected {
//           border-color: #3b82f6;
//           background: #eff6ff;
//         }

//         .variation-name,
//         .addon-name {
//           font-weight: 500;
//           color: #0f172a;
//           margin-bottom: 0.25rem;
//         }

//         .variation-price,
//         .addon-price {
//           font-size: 0.85rem;
//           font-weight: 600;
//           color: #059669;
//         }

//         .variation-duration,
//         .addon-desc {
//           font-size: 0.7rem;
//           color: #64748b;
//           margin-top: 0.25rem;
//         }

//         /* Payment Summary */
//         .payment-summary {
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           padding: 1rem;
//           margin-bottom: 1.5rem;
//         }

//         .summary-row {
//           display: flex;
//           justify-content: space-between;
//           padding: 0.5rem 0;
//           border-bottom: 1px dashed #e2e8f0;
//         }

//         .summary-row:last-child {
//           border-bottom: none;
//         }

//         .summary-row.total {
//           font-weight: 600;
//           color: #0f172a;
//           font-size: 1.1rem;
//           padding-top: 1rem;
//           margin-top: 0.5rem;
//           border-top: 2px solid #e2e8f0;
//         }

//         /* Loading States */
//         .loading-mini {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           padding: 2rem;
//           color: #64748b;
//         }

//         .spinner-mini {
//           width: 24px;
//           height: 24px;
//           border: 2px solid #e2e8f0;
//           border-top-color: #3b82f6;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//         }

//         .spinner {
//           width: 18px;
//           height: 18px;
//           border: 2px solid rgba(255,255,255,0.3);
//           border-top-color: white;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//         }

//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }

//         .empty-mini {
//           text-align: center;
//           padding: 3rem 1rem;
//           color: #64748b;
//         }

//         .empty-mini svg {
//           margin-bottom: 1rem;
//           color: #94a3b8;
//         }

//         .empty-mini p {
//           margin: 0;
//         }

//         /* Form Actions */
//         .form-actions {
//           display: flex;
//           justify-content: flex-end;
//           gap: 1rem;
//           margin-top: 1rem;
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
//           gap: 0.5rem;
//           padding: 0.75rem 2rem;
//           border-radius: 8px;
//           font-size: 0.95rem;
//           font-weight: 500;
//           text-decoration: none;
//           border: none;
//           cursor: pointer;
//           transition: all 0.2s;
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
//           color: #64748b;
//         }

//         .cancel-btn:hover {
//           background: #f8fafc;
//           color: #1e293b;
//         }

//         .submit-btn {
//           background: #3b82f6;
//           color: white;
//         }

//         .submit-btn:hover {
//           background: #2563eb;
//           transform: translateY(-1px);
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
//         }

//         .submit-btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//           transform: none;
//         }

//         /* Responsive */
//         @media (max-width: 768px) {
//           .page-header {
//             flex-direction: column;
//             align-items: flex-start;
//             gap: 1rem;
//           }

//           .header-left {
//             width: 100%;
//           }

//           .back-button {
//             white-space: nowrap;
//           }

//           .page-title {
//             font-size: 1.5rem;
//           }

//           .badge {
//             align-self: flex-start;
//           }

//           .selection-grid,
//           .services-grid {
//             grid-template-columns: 1fr;
//           }

//           .variations-grid,
//           .addons-grid {
//             grid-template-columns: 1fr 1fr;
//           }
//         }

//         @media (max-width: 480px) {
//           .variations-grid,
//           .addons-grid {
//             grid-template-columns: 1fr;
//           }
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
    MapPin, Briefcase, Clock, Calendar, DollarSign,
    Plus, Minus, CheckCircle, XCircle, AlertCircle,
    Search, Filter, CreditCard, Wallet, Zap, Layers,
    Layout, Info, AlertTriangle, Check, Loader2,
    ChevronRight, ChevronDown, ChevronUp, Home,
    Map, Truck, Settings, Users, FileText, Award,
    Star, Wifi, Video, Gift, Crown, Gem, Diamond,
    ThumbsUp, ThumbsDown, MessageSquare, Send,
    Paperclip, Smile, Grid, List, RefreshCw,
    Filter as FilterIcon, MoreVertical, Download,
    Printer, Share2, Bookmark, Eye, EyeOff,
    Lock, Unlock, Key, WifiOff, Battery, BatteryCharging,
    Cpu, HardDrive, Server, Cloud, CloudOff, Repeat,
    Shuffle, Play, Pause, Square, Circle, Triangle,
    Hexagon, Octagon, Building2, CreditCard as CreditCardIcon,
    Landmark, Receipt, HeadphonesIcon, PhoneCall,
    MailOpen, MapPinHouse, Store, Globe2, Facebook,
    Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
    Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
    Activity, TrendingUp, Briefcase as BriefcaseIcon,
    Calendar as CalendarIcon, Clock as ClockIcon,
    Map as MapIcon, Truck as TruckIcon, Zap as ZapIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
const SECTIONS = [
    { 
        id: 'client', 
        title: 'Select Client', 
        icon: User, 
        color: appTheme.colors.primary,
        description: 'Choose the client for this booking'
    },
    { 
        id: 'professional', 
        title: 'Select Professional', 
        icon: Building, 
        color: appTheme.colors.secondary,
        description: 'Choose the service provider'
    },
    { 
        id: 'service', 
        title: 'Select Service', 
        icon: Briefcase, 
        color: appTheme.colors.warning,
        description: 'Choose service, variations and addons'
    },
    { 
        id: 'schedule', 
        title: 'Schedule', 
        icon: Calendar, 
        color: appTheme.colors.success,
        description: 'Set date and time'
    },
    { 
        id: 'location', 
        title: 'Location', 
        icon: MapPin, 
        color: appTheme.colors.info,
        description: 'Set service location'
    },
    { 
        id: 'payment', 
        title: 'Payment Details', 
        icon: DollarSign, 
        color: appTheme.colors.accent,
        description: 'Payment information and summary'
    },
    { 
        id: 'notes', 
        title: 'Additional Notes', 
        icon: AlertCircle, 
        color: appTheme.colors.warning,
        description: 'Special instructions and notes'
    }
];

const LOCATION_TYPES = [
    { value: 'professional_address', label: 'Professional Address', icon: '🏢', color: '#3b82f6' },
    { value: 'client_address', label: 'Client Address', icon: '🏠', color: '#8b5cf6' },
    { value: 'virtual', label: 'Virtual Meeting', icon: '💻', color: '#10b981' },
    { value: 'other', label: 'Other Location', icon: '📍', color: '#f59e0b' }
];

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash', icon: '💵', color: '#10b981' },
    { value: 'card', label: 'Card', icon: '💳', color: '#3b82f6' },
    { value: 'online', label: 'Online', icon: '🌐', color: '#8b5cf6' },
    { value: 'wallet', label: 'Wallet', icon: '👛', color: '#f59e0b' },
    { value: 'upi', label: 'UPI', icon: '📱', color: '#ec4899' },
    { value: 'other', label: 'Other', icon: '💰', color: '#6b7280' }
];

const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pending', icon: '⏳', color: '#f59e0b' },
    { value: 'partial', label: 'Partial', icon: '💸', color: '#8b5cf6' },
    { value: 'paid', label: 'Paid', icon: '✅', color: '#10b981' },
    { value: 'failed', label: 'Failed', icon: '❌', color: '#ef4444' }
];

export default function CreateBookingPage() {
    const router = useRouter();
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [users, setUsers] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [filteredProfessionals, setFilteredProfessionals] = useState([]);
    const [expandedSections, setExpandedSections] = useState(['client']);
    const [activeTab, setActiveTab] = useState('client');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [isMobile, setIsMobile] = useState(false);
    
    const [formData, setFormData] = useState({
        clientId: '',
        professionalId: '',
        serviceId: '',
        
        // Service Details
        serviceName: '',
        serviceDuration: 0,
        servicePrice: 0,
        selectedVariation: null,
        selectedAddons: [],
        
        // Scheduling
        scheduledDate: '',
        startTime: '',
        endTime: '',
        timezone: 'Asia/Kolkata',
        
        // Location
        locationType: 'professional_address',
        address: '',
        virtualLink: '',
        
        // Payment
        totalAmount: 0,
        paymentStatus: 'pending',
        paymentMethod: '',
        paidAmount: 0,
        
        // Notes
        clientNotes: '',
        professionalNotes: '',
        
        // Source
        bookingSource: 'admin'
    });

    const [errors, setErrors] = useState({});
    const [searchTerms, setSearchTerms] = useState({
        client: '',
        professional: '',
        service: ''
    });

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

    // Fetch initial data
    useEffect(() => {
        fetchUsers();
        fetchProfessionals();
        fetchServices();
    }, []);

    // Filter services when professional or category changes
    useEffect(() => {
        if (formData.professionalId) {
            const professional = professionals.find(p => p._id === formData.professionalId);
            if (professional?.category) {
                setFilteredServices(services.filter(s => s.category === professional.category));
            } else {
                setFilteredServices(services);
            }
        } else {
            setFilteredServices(services);
        }
    }, [formData.professionalId, services, professionals]);

    // Filter professionals when service or category changes
    useEffect(() => {
        if (formData.serviceId) {
            const service = services.find(s => s._id === formData.serviceId);
            if (service?.category) {
                setFilteredProfessionals(professionals.filter(p => p.category === service.category && p.isActive));
            } else {
                setFilteredProfessionals(professionals.filter(p => p.isActive));
            }
        } else {
            setFilteredProfessionals(professionals.filter(p => p.isActive));
        }
    }, [formData.serviceId, services, professionals]);

    // Calculate end time when start time and duration change
    useEffect(() => {
        if (formData.startTime && (formData.serviceDuration > 0 || formData.selectedVariation?.duration)) {
            const duration = formData.selectedVariation?.duration || formData.serviceDuration;
            const [hours, minutes] = formData.startTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + duration;
            const endHours = Math.floor(totalMinutes / 60);
            const endMinutes = totalMinutes % 60;
            const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
            setFormData(prev => ({ ...prev, endTime }));
        }
    }, [formData.startTime, formData.serviceDuration, formData.selectedVariation]);

    // Calculate total amount
    useEffect(() => {
        let total = formData.servicePrice || 0;
        if (formData.selectedVariation) {
            total = formData.selectedVariation.price;
        }
        if (formData.selectedAddons.length > 0) {
            total += formData.selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
        }
        setFormData(prev => ({ ...prev, totalAmount: total }));
    }, [formData.servicePrice, formData.selectedVariation, formData.selectedAddons]);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/bookingService/bookings?role=user&limit=100');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('error', 'Failed to fetch users');
        }
    };

    const fetchProfessionals = async () => {
        setFetchingData(true);
        try {
            const res = await fetch('/api/bookingService/bookingmng?limit=100&status=active');
            const data = await res.json();
            if (data.success) {
                setProfessionals(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching professionals:', error);
            showToast('error', 'Failed to fetch professionals');
        } finally {
            setFetchingData(false);
        }
    };

    const fetchServices = async () => {
        setFetchingData(true);
        try {
            const res = await fetch('/api/bookingService/service?limit=100&status=active');
            const data = await res.json();
            if (data.success) {
                setServices(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            showToast('error', 'Failed to fetch services');
        } finally {
            setFetchingData(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle service selection
    const handleServiceSelect = (service) => {
        setFormData(prev => ({
            ...prev,
            serviceId: service._id,
            serviceName: service.name,
            serviceDuration: service.duration,
            servicePrice: service.basePrice,
            selectedVariation: null,
            selectedAddons: []
        }));
        showToast('success', 'Service selected');
    };

    // Handle variation selection
    const handleVariationSelect = (variation) => {
        setFormData(prev => ({
            ...prev,
            selectedVariation: variation,
            serviceDuration: variation.duration || prev.serviceDuration
        }));
        showToast('success', 'Variation selected');
    };

    // Handle addon toggle
    const handleAddonToggle = (addon) => {
        setFormData(prev => {
            const exists = prev.selectedAddons.some(a => a.name === addon.name);
            if (exists) {
                showToast('info', 'Addon removed');
                return {
                    ...prev,
                    selectedAddons: prev.selectedAddons.filter(a => a.name !== addon.name)
                };
            } else {
                showToast('success', 'Addon added');
                return {
                    ...prev,
                    selectedAddons: [...prev.selectedAddons, addon]
                };
            }
        });
    };

    // Filter lists based on search
    const filteredUsersList = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerms.client.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerms.client.toLowerCase()) ||
        user.phone?.includes(searchTerms.client)
    );

    const filteredProfessionalsList = filteredProfessionals.filter(prof => 
        prof.businessName?.toLowerCase().includes(searchTerms.professional.toLowerCase()) ||
        prof.email?.toLowerCase().includes(searchTerms.professional.toLowerCase()) ||
        prof.phone?.includes(searchTerms.professional)
    );

    const filteredServicesList = filteredServices.filter(service => 
        service.name?.toLowerCase().includes(searchTerms.service.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerms.service.toLowerCase())
    );

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.clientId) {
            newErrors.clientId = 'Please select a client';
        }

        if (!formData.professionalId) {
            newErrors.professionalId = 'Please select a professional';
        }

        if (!formData.serviceId) {
            newErrors.serviceId = 'Please select a service';
        }

        if (!formData.scheduledDate) {
            newErrors.scheduledDate = 'Please select a date';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Please select a start time';
        }

        if (formData.paymentStatus === 'partial' && (!formData.paidAmount || formData.paidAmount <= 0)) {
            newErrors.paidAmount = 'Please enter paid amount for partial payment';
        }

        if (formData.locationType === 'virtual' && !formData.virtualLink) {
            newErrors.virtualLink = 'Please enter virtual meeting link';
        }

        if (formData.locationType === 'other' && !formData.address) {
            newErrors.address = 'Please enter address';
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
            const selectedService = services.find(s => s._id === formData.serviceId);
            const selectedProfessional = professionals.find(p => p._id === formData.professionalId);
            const selectedClient = users.find(u => u._id === formData.clientId);

            const payload = {
                ...formData,
                serviceName: selectedService?.name,
                serviceDuration: formData.selectedVariation?.duration || selectedService?.duration,
                bookedAt: new Date().toISOString(),
                clientName: selectedClient?.name,
                clientPhone: selectedClient?.phone,
                professionalName: selectedProfessional?.businessName,
                professionalPhone: selectedProfessional?.phone,
                professionalEmail: selectedProfessional?.email,
                clientEmail: selectedClient?.email
            };

            const res = await fetch('/api/bookingService/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', 'Booking created successfully!');
                setTimeout(() => router.push('/admin/bookingService/bookings'), 1500);
            } else {
                showToast('error', `Error: ${data.error || 'Failed to create booking'}`);
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            showToast('error', 'Failed to create booking. Please try again.');
        } finally {
            setSaving(false);
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
        setExpandedSections(SECTIONS.map(s => s.id));
    };

    const collapseAll = () => {
        setExpandedSections([]);
    };

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];

    if (fetchingData && !users.length && !professionals.length && !services.length) {
        return (
            <div className="loading-container">
                <div className="loading-grid">
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                </div>
                <p className="loading-text">Loading booking data...</p>
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
                <title>Create New Booking | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="create-booking-page">
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
                            <Link href="/admin/bookingService/bookings" className="back-button">
                                <ArrowLeft size={20} />
                                <span>Back to Bookings</span>
                            </Link>
                            <h1 className="page-title">
                                <Calendar size={28} className="title-icon" />
                                Create New Booking
                            </h1>
                            <p className="page-description">
                                Schedule a new appointment for a client
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
                            <span className="status-badge draft">New Booking</span>
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
                                        <span>Create Booking</span>
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
                                            {/* Client Selection */}
                                            {section.id === 'client' && (
                                                <div className="form-block">
                                                    <h3>
                                                        <User size={16} />
                                                        Select Client
                                                    </h3>
                                                    <div className="form-field">
                                                        <label>Search Client <span className="required">*</span></label>
                                                        <div className="search-box">
                                                            <Search size={18} className="search-icon" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search by name, email or phone..."
                                                                value={searchTerms.client}
                                                                onChange={(e) => setSearchTerms(prev => ({ ...prev, client: e.target.value }))}
                                                                className="search-input"
                                                            />
                                                        </div>

                                                        <div className="selection-grid">
                                                            {filteredUsersList.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <User size={32} />
                                                                    <p>No clients found</p>
                                                                </div>
                                                            ) : (
                                                                filteredUsersList.map(user => (
                                                                    <label
                                                                        key={user._id}
                                                                        id={`client-${user._id}`}
                                                                        className={`selection-card ${formData.clientId === user._id ? 'selected' : ''}`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name="clientId"
                                                                            value={user._id}
                                                                            checked={formData.clientId === user._id}
                                                                            onChange={handleChange}
                                                                        />
                                                                        <div className="selection-avatar">
                                                                            {user.name?.charAt(0) || 'U'}
                                                                        </div>
                                                                        <div className="selection-info">
                                                                            <span className="selection-name">{user.name || 'Unknown'}</span>
                                                                            <span className="selection-detail">{user.email}</span>
                                                                            <span className="selection-detail">{user.phone}</span>
                                                                        </div>
                                                                    </label>
                                                                ))
                                                            )}
                                                        </div>
                                                        {errors.clientId && <span className="error-text">{errors.clientId}</span>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Professional Selection */}
                                            {section.id === 'professional' && (
                                                <div className="form-block">
                                                    <h3>
                                                        <Building size={16} />
                                                        Select Professional
                                                    </h3>
                                                    <div className="form-field">
                                                        <label>Search Professional <span className="required">*</span></label>
                                                        <div className="search-box">
                                                            <Search size={18} className="search-icon" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search by business name, email or phone..."
                                                                value={searchTerms.professional}
                                                                onChange={(e) => setSearchTerms(prev => ({ ...prev, professional: e.target.value }))}
                                                                className="search-input"
                                                            />
                                                        </div>

                                                        <div className="selection-grid">
                                                            {filteredProfessionalsList.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <Building size={32} />
                                                                    <p>No professionals found</p>
                                                                </div>
                                                            ) : (
                                                                filteredProfessionalsList.map(prof => (
                                                                    <label
                                                                        key={prof._id}
                                                                        className={`selection-card ${formData.professionalId === prof._id ? 'selected' : ''}`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name="professionalId"
                                                                            value={prof._id}
                                                                            checked={formData.professionalId === prof._id}
                                                                            onChange={handleChange}
                                                                        />
                                                                        <div className="selection-avatar business">
                                                                            {prof.businessName?.charAt(0) || 'B'}
                                                                        </div>
                                                                        <div className="selection-info">
                                                                            <span className="selection-name">{prof.businessName || 'Unknown'}</span>
                                                                            <span className="selection-detail">{prof.category}</span>
                                                                            <span className="selection-detail">{prof.phone}</span>
                                                                            {prof.rating?.average > 0 && (
                                                                                <span className="selection-rating">★ {prof.rating.average.toFixed(1)}</span>
                                                                            )}
                                                                        </div>
                                                                    </label>
                                                                ))
                                                            )}
                                                        </div>
                                                        {errors.professionalId && <span className="error-text">{errors.professionalId}</span>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Service Selection */}
                                            {section.id === 'service' && (
                                                <div className="form-block">
                                                    <h3>
                                                        <Briefcase size={16} />
                                                        Select Service
                                                    </h3>
                                                    <div className="form-field">
                                                        <label>Search Service <span className="required">*</span></label>
                                                        <div className="search-box">
                                                            <Search size={18} className="search-icon" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search by service name or category..."
                                                                value={searchTerms.service}
                                                                onChange={(e) => setSearchTerms(prev => ({ ...prev, service: e.target.value }))}
                                                                className="search-input"
                                                            />
                                                        </div>

                                                        <div className="services-grid">
                                                            {filteredServicesList.length === 0 ? (
                                                                <div className="empty-state">
                                                                    <Briefcase size={32} />
                                                                    <p>No services found</p>
                                                                </div>
                                                            ) : (
                                                                filteredServicesList.map(service => (
                                                                    <div key={service._id} className="service-card-wrapper">
                                                                        <label
                                                                            className={`service-card ${formData.serviceId === service._id ? 'selected' : ''}`}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name="serviceId"
                                                                                value={service._id}
                                                                                checked={formData.serviceId === service._id}
                                                                                onChange={() => handleServiceSelect(service)}
                                                                            />
                                                                            <div className="service-card-header">
                                                                                <span className="service-category">{service.category}</span>
                                                                                <span className="service-price">₹{service.basePrice}</span>
                                                                            </div>
                                                                            <h3 className="service-name">{service.name}</h3>
                                                                            <p className="service-description">{service.description?.substring(0, 60)}...</p>
                                                                            <div className="service-meta">
                                                                                <Clock size={14} />
                                                                                <span>{service.duration} min</span>
                                                                            </div>
                                                                        </label>

                                                                        {/* Variations */}
                                                                        {formData.serviceId === service._id && service.variations?.length > 0 && (
                                                                            <div className="variations-section">
                                                                                <h4>Available Variations</h4>
                                                                                <div className="variations-grid">
                                                                                    {service.variations.map((variation, index) => (
                                                                                        <label
                                                                                            key={index}
                                                                                            className={`variation-card ${formData.selectedVariation?.name === variation.name ? 'selected' : ''}`}
                                                                                        >
                                                                                            <input
                                                                                                type="radio"
                                                                                                name="variation"
                                                                                                checked={formData.selectedVariation?.name === variation.name}
                                                                                                onChange={() => handleVariationSelect(variation)}
                                                                                            />
                                                                                            <span className="variation-name">{variation.name}</span>
                                                                                            <span className="variation-price">+₹{variation.price}</span>
                                                                                            {variation.duration > 0 && (
                                                                                                <span className="variation-duration">+{variation.duration} min</span>
                                                                                            )}
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Addons */}
                                                                        {formData.serviceId === service._id && service.addons?.length > 0 && (
                                                                            <div className="addons-section">
                                                                                <h4>Available Add-ons</h4>
                                                                                <div className="addons-grid">
                                                                                    {service.addons.map((addon, index) => (
                                                                                        <label
                                                                                            key={index}
                                                                                            className={`addon-card ${formData.selectedAddons.some(a => a.name === addon.name) ? 'selected' : ''}`}
                                                                                        >
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={formData.selectedAddons.some(a => a.name === addon.name)}
                                                                                                onChange={() => handleAddonToggle(addon)}
                                                                                            />
                                                                                            <span className="addon-name">{addon.name}</span>
                                                                                            <span className="addon-price">+₹{addon.price}</span>
                                                                                            {addon.description && (
                                                                                                <span className="addon-desc">{addon.description}</span>
                                                                                            )}
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                        {errors.serviceId && <span className="error-text">{errors.serviceId}</span>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Schedule */}
                                            {section.id === 'schedule' && (
                                                <div className="form-block">
                                                    <h3>
                                                        <Calendar size={16} />
                                                        Schedule
                                                    </h3>
                                                    <div className="form-grid">
                                                        <div className="form-field">
                                                            <label>Date <span className="required">*</span></label>
                                                            <input
                                                                type="date"
                                                                name="scheduledDate"
                                                                id="scheduledDate"
                                                                value={formData.scheduledDate}
                                                                onChange={handleChange}
                                                                min={today}
                                                                className={errors.scheduledDate ? 'error' : ''}
                                                            />
                                                            {errors.scheduledDate && <span className="error-text">{errors.scheduledDate}</span>}
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Start Time <span className="required">*</span></label>
                                                            <input
                                                                type="time"
                                                                name="startTime"
                                                                id="startTime"
                                                                value={formData.startTime}
                                                                onChange={handleChange}
                                                                className={errors.startTime ? 'error' : ''}
                                                            />
                                                            {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                                                        </div>

                                                        <div className="form-field">
                                                            <label>End Time</label>
                                                            <input
                                                                type="time"
                                                                name="endTime"
                                                                value={formData.endTime}
                                                                readOnly
                                                                className="form-input read-only"
                                                            />
                                                            <span className="hint">Auto-calculated based on duration</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Location */}
                                            {section.id === 'location' && (
                                                <div className="form-block">
                                                    <h3>
                                                        <MapPin size={16} />
                                                        Location
                                                    </h3>
                                                    <div className="form-grid">
                                                        <div className="form-field span-2">
                                                            <label>Location Type</label>
                                                            <div className="location-cards">
                                                                {LOCATION_TYPES.map(type => (
                                                                    <label
                                                                        key={type.value}
                                                                        className={`location-card ${formData.locationType === type.value ? 'selected' : ''}`}
                                                                        style={{ 
                                                                            borderColor: formData.locationType === type.value ? type.color : appTheme.colors.border,
                                                                            background: formData.locationType === type.value ? `${type.color}10` : 'white'
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name="locationType"
                                                                            value={type.value}
                                                                            checked={formData.locationType === type.value}
                                                                            onChange={handleChange}
                                                                        />
                                                                        <span className="location-icon">{type.icon}</span>
                                                                        <span className="location-label">{type.label}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {formData.locationType === 'virtual' && (
                                                            <div className="form-field span-2">
                                                                <label>Meeting Link <span className="required">*</span></label>
                                                                <input
                                                                    type="url"
                                                                    name="virtualLink"
                                                                    id="virtualLink"
                                                                    value={formData.virtualLink}
                                                                    onChange={handleChange}
                                                                    placeholder="https://meet.google.com/..."
                                                                    className={errors.virtualLink ? 'error' : ''}
                                                                />
                                                                {errors.virtualLink && <span className="error-text">{errors.virtualLink}</span>}
                                                            </div>
                                                        )}

                                                        {(formData.locationType === 'other' || formData.locationType === 'client_address') && (
                                                            <div className="form-field span-2">
                                                                <label>Address <span className="required">*</span></label>
                                                                <textarea
                                                                    name="address"
                                                                    id="address"
                                                                    value={formData.address}
                                                                    onChange={handleChange}
                                                                    rows="3"
                                                                    className={errors.address ? 'error' : ''}
                                                                    placeholder="Enter complete address"
                                                                />
                                                                {errors.address && <span className="error-text">{errors.address}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Payment Details */}
                                            {section.id === 'payment' && (
                                                <div className="form-block">
                                                    <h3>
                                                        <DollarSign size={16} />
                                                        Payment Details
                                                    </h3>
                                                    
                                                    <div className="payment-summary">
                                                        <div className="summary-row">
                                                            <span>Base Price:</span>
                                                            <span>₹{formData.servicePrice || 0}</span>
                                                        </div>
                                                        {formData.selectedVariation && (
                                                            <div className="summary-row">
                                                                <span>Variation ({formData.selectedVariation.name}):</span>
                                                                <span>+₹{formData.selectedVariation.price}</span>
                                                            </div>
                                                        )}
                                                        {formData.selectedAddons.map((addon, index) => (
                                                            <div key={index} className="summary-row">
                                                                <span>Add-on ({addon.name}):</span>
                                                                <span>+₹{addon.price}</span>
                                                            </div>
                                                        ))}
                                                        <div className="summary-row total">
                                                            <span>Total Amount:</span>
                                                            <span>₹{formData.totalAmount}</span>
                                                        </div>
                                                    </div>

                                                    <div className="form-grid">
                                                        <div className="form-field">
                                                            <label>Payment Status</label>
                                                            <select
                                                                name="paymentStatus"
                                                                value={formData.paymentStatus}
                                                                onChange={handleChange}
                                                            >
                                                                {PAYMENT_STATUSES.map(status => (
                                                                    <option key={status.value} value={status.value}>
                                                                        {status.icon} {status.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Payment Method</label>
                                                            <select
                                                                name="paymentMethod"
                                                                value={formData.paymentMethod}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Select method</option>
                                                                {PAYMENT_METHODS.map(method => (
                                                                    <option key={method.value} value={method.value}>
                                                                        {method.icon} {method.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {formData.paymentStatus === 'partial' && (
                                                            <div className="form-field">
                                                                <label>Paid Amount <span className="required">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    name="paidAmount"
                                                                    id="paidAmount"
                                                                    value={formData.paidAmount}
                                                                    onChange={handleChange}
                                                                    min="0"
                                                                    max={formData.totalAmount}
                                                                    step="1"
                                                                    className={errors.paidAmount ? 'error' : ''}
                                                                />
                                                                {errors.paidAmount && <span className="error-text">{errors.paidAmount}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Notes */}
                                            {section.id === 'notes' && (
                                                <div className="form-block">
                                                    <h3>
                                                        <AlertCircle size={16} />
                                                        Additional Notes
                                                    </h3>
                                                    <div className="form-grid">
                                                        <div className="form-field span-2">
                                                            <label>Client Notes</label>
                                                            <textarea
                                                                name="clientNotes"
                                                                value={formData.clientNotes}
                                                                onChange={handleChange}
                                                                rows="3"
                                                                placeholder="Special instructions or requests from client..."
                                                            />
                                                        </div>

                                                        <div className="form-field span-2">
                                                            <label>Professional Notes</label>
                                                            <textarea
                                                                name="professionalNotes"
                                                                value={formData.professionalNotes}
                                                                onChange={handleChange}
                                                                rows="3"
                                                                placeholder="Internal notes for the professional..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
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
                                <span>Create Booking</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .create-booking-page {
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

                .form-field input.read-only {
                    background: #f8fafc;
                    color: #64748b;
                    cursor: not-allowed;
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

                /* ==================== SEARCH BOX ==================== */
                .search-box {
                    position: relative;
                    margin-bottom: 12px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 14px 10px 40px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.938rem;
                    background: white;
                }

                .search-input:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
                }

                /* ==================== SELECTION GRID ==================== */
                .selection-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 8px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    background: #f8fafc;
                }

                .selection-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: white;
                    border: 2px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .selection-card input {
                    position: absolute;
                    opacity: 0;
                }

                .selection-card.selected {
                    border-color: ${appTheme.colors.primary};
                    background: ${appTheme.colors.primary}10;
                }

                .selection-card:hover {
                    border-color: #94a3b8;
                }

                .selection-avatar {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary});
                    color: white;
                    font-weight: 600;
                    font-size: 1.2rem;
                    border-radius: 8px;
                    flex-shrink: 0;
                }

                .selection-avatar.business {
                    background: linear-gradient(135deg, ${appTheme.colors.success}, ${appTheme.colors.success}CC);
                }

                .selection-info {
                    flex: 1;
                    min-width: 0;
                }

                .selection-name {
                    display: block;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 4px;
                }

                .selection-detail {
                    display: block;
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 2px;
                }

                .selection-rating {
                    display: inline-block;
                    padding: 2px 6px;
                    background: #fef3c7;
                    color: #92400e;
                    font-size: 0.688rem;
                    font-weight: 500;
                    border-radius: 20px;
                    margin-top: 4px;
                }

                /* ==================== SERVICES GRID ==================== */
                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 16px;
                    max-height: 600px;
                    overflow-y: auto;
                    padding: 8px;
                }

                .service-card-wrapper {
                    background: white;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    overflow: hidden;
                }

                .service-card {
                    display: block;
                    padding: 16px;
                    cursor: pointer;
                    position: relative;
                    border-bottom: 1px solid ${appTheme.colors.border};
                }

                .service-card input {
                    position: absolute;
                    opacity: 0;
                }

                .service-card.selected {
                    background: ${appTheme.colors.primary}10;
                }

                .service-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .service-category {
                    padding: 4px 8px;
                    background: #f1f5f9;
                    color: #475569;
                    font-size: 0.688rem;
                    font-weight: 500;
                    border-radius: 20px;
                    text-transform: capitalize;
                }

                .service-price {
                    font-weight: 600;
                    color: ${appTheme.colors.success};
                    font-size: 1.1rem;
                }

                .service-name {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 8px;
                }

                .service-description {
                    font-size: 0.813rem;
                    color: #64748b;
                    margin: 0 0 12px;
                    line-height: 1.5;
                }

                .service-meta {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #64748b;
                    font-size: 0.813rem;
                }

                /* ==================== VARIATIONS & ADDONS ==================== */
                .variations-section,
                .addons-section {
                    padding: 16px;
                    background: #f8fafc;
                }

                .variations-section h4,
                .addons-section h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 12px;
                }

                .variations-grid,
                .addons-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 8px;
                }

                .variation-card,
                .addon-card {
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                    background: white;
                    border: 2px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    position: relative;
                }

                .variation-card input,
                .addon-card input {
                    position: absolute;
                    opacity: 0;
                }

                .variation-card.selected,
                .addon-card.selected {
                    border-color: ${appTheme.colors.primary};
                    background: ${appTheme.colors.primary}10;
                }

                .variation-name,
                .addon-name {
                    font-weight: 500;
                    color: #0f172a;
                    margin-bottom: 4px;
                    font-size: 0.813rem;
                }

                .variation-price,
                .addon-price {
                    font-size: 0.813rem;
                    font-weight: 600;
                    color: ${appTheme.colors.success};
                }

                .variation-duration,
                .addon-desc {
                    font-size: 0.688rem;
                    color: #64748b;
                    margin-top: 4px;
                }

                /* ==================== LOCATION CARDS ==================== */
                .location-cards {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                @media (min-width: 640px) {
                    .location-cards {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .location-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px;
                    background: white;
                    border: 2px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    position: relative;
                }

                .location-card input {
                    position: absolute;
                    opacity: 0;
                }

                .location-card.selected {
                    background: ${appTheme.colors.primary}10;
                }

                .location-icon {
                    font-size: 1.5rem;
                }

                .location-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #1e293b;
                    text-align: center;
                }

                /* ==================== PAYMENT SUMMARY ==================== */
                .payment-summary {
                    background: #f8fafc;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed ${appTheme.colors.border};
                }

                .summary-row:last-child {
                    border-bottom: none;
                }

                .summary-row.total {
                    font-weight: 600;
                    color: #0f172a;
                    font-size: 1rem;
                    padding-top: 12px;
                    margin-top: 8px;
                    border-top: 2px solid ${appTheme.colors.border};
                }

                /* ==================== EMPTY STATE ==================== */
                .empty-state {
                    text-align: center;
                    padding: 48px 24px;
                    color: #64748b;
                }

                .empty-state svg {
                    margin-bottom: 16px;
                    color: #94a3b8;
                }

                .empty-state p {
                    font-size: 0.875rem;
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

                    .selection-grid {
                        grid-template-columns: 1fr;
                    }

                    .services-grid {
                        grid-template-columns: 1fr;
                    }

                    .variations-grid,
                    .addons-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                @media (max-width: 480px) {
                    .main-content {
                        padding: 16px 16px 90px 16px;
                    }

                    .stats-grid {
                        display: none;
                    }

                    .location-cards {
                        grid-template-columns: 1fr;
                    }

                    .variations-grid,
                    .addons-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}