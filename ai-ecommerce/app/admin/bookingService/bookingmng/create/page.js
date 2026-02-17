'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import {
  ArrowLeft, Save, User, Building, Mail, Phone,
  MapPin, Briefcase, Clock, Globe, Shield, Plus,
  Trash2, CheckCircle, XCircle, AlertCircle, ChevronDown,
  ChevronUp, Home, Map, Truck, Zap, Settings, Users,
  FileText, Award, Star, Wifi, Video, Calendar
} from 'lucide-react';

export default function CreateBookingmngPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: false,
    working: false,
    settings: false,
    documents: false
  });
  
  const [formData, setFormData] = useState({
    userId: '',
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
    
    // Working Hours (default)
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
    
    // Documents (can be uploaded later)
    documents: {
      idProof: '',
      qualificationProof: '',
      license: ''
    },
    
    // Social Media (optional)
    socialMedia: {
      website: '',
      facebook: '',
      instagram: '',
      linkedin: ''
    }
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [errors, setErrors] = useState({});
  
  // Categories
  const categories = [
    { value: 'beauty', label: 'Beauty & Spa', icon: '💅' },
    { value: 'health', label: 'Health & Wellness', icon: '🏥' },
    { value: 'consulting', label: 'Consulting', icon: '💼' },
    { value: 'repair', label: 'Repair & Maintenance', icon: '🔧' },
    { value: 'education', label: 'Education & Training', icon: '📚' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'other', label: 'Other', icon: '📌' }
  ];

  // Types
  const types = [
    { value: 'individual', label: 'Individual', icon: '👤' },
    { value: 'company', label: 'Company', icon: '🏢' },
    { value: 'freelancer', label: 'Freelancer', icon: '🆓' },
    { value: 'agency', label: 'Agency', icon: '🤝' }
  ];

  // Service Types
  const serviceTypes = [
    { value: 'onsite', label: 'Onsite Only', icon: '📍' },
    { value: 'remote', label: 'Remote Only', icon: '💻' },
    { value: 'both', label: 'Both Onsite & Remote', icon: '🔄' },
    { value: 'mobile', label: 'Mobile Service', icon: '🚗' }
  ];

  // Cancellation Policies
  const cancellationPolicies = [
    { value: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before booking', icon: '🔄' },
    { value: 'moderate', label: 'Moderate', description: '50% refund up to 12 hours before booking', icon: '⚖️' },
    { value: 'strict', label: 'Strict', description: 'No refund within 24 hours', icon: '🔒' }
  ];

  // Days of week
  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  // Fetch users for dropdown
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/bookingService/bookingmng?role=user&limit=50');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
  };

  // Handle specialization input
  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, specializationInput.trim()]
      }));
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
    }));
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

    if (!formData.userId) {
      newErrors.userId = 'Please select a user';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      // Filter out empty service areas
      const filteredServiceAreas = formData.serviceAreas.filter(area => area.trim() !== '');
      
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
        alert('Professional created successfully!');
        router.push('/admin/bookingService/bookingmng');
      } else {
        alert(`Error: ${data.error || 'Failed to create professional'}`);
      }
    } catch (error) {
      console.error('Error creating professional:', error);
      alert('Failed to create professional. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add New Professional | LFMS</title>
      </Head>

      <div className="create-professional-wrapper">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <Link href="/admin/bookingService/bookingmng" className="back-button">
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <div>
              <h1 className="page-title">Add New Professional</h1>
              <p className="page-subtitle">Create a new service provider</p>
            </div>
          </div>
          <div className="badge draft">Draft</div>
        </div>

        {/* Mobile Tabs */}
        <div className="mobile-tabs">
          <button onClick={() => setActiveTab('basic')} className={`mobile-tab ${activeTab === 'basic' ? 'active' : ''}`}>
            <User size={16} /> Basic
          </button>
          <button onClick={() => setActiveTab('contact')} className={`mobile-tab ${activeTab === 'contact' ? 'active' : ''}`}>
            <Phone size={16} /> Contact
          </button>
          <button onClick={() => setActiveTab('working')} className={`mobile-tab ${activeTab === 'working' ? 'active' : ''}`}>
            <Clock size={16} /> Hours
          </button>
          <button onClick={() => setActiveTab('settings')} className={`mobile-tab ${activeTab === 'settings' ? 'active' : ''}`}>
            <Settings size={16} /> Settings
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Basic Information */}
          <div className={`form-section ${activeTab === 'basic' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('basic')}>
              <div className="section-title">
                <User size={18} />
                <h2>Basic Information</h2>
                <span className="required-badge">Required</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.basic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.basic ? 'expanded' : ''}`}>
              {/* User Selection */}
              <div className="form-group">
                <label className="form-label">
                  Select User <span className="required-star">*</span>
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={`form-select ${errors.userId ? 'error' : ''}`}
                >
                  <option value="">Choose a user</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
                {errors.userId && <p className="error-message">{errors.userId}</p>}
              </div>

              {/* Business Name */}
              <div className="form-group">
                <label className="form-label">
                  Business Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`form-input ${errors.businessName ? 'error' : ''}`}
                  placeholder="e.g., John's Beauty Salon"
                />
                {errors.businessName && <p className="error-message">{errors.businessName}</p>}
              </div>

              {/* Tagline */}
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Brief description of your business"
                />
                <p className="field-hint">A short, catchy description</p>
              </div>

              {/* Professional Type */}
              <div className="form-group">
                <label className="form-label">Professional Type <span className="required-star">*</span></label>
                <div className="type-cards">
                  {types.map(type => (
                    <label key={type.value} className={`type-card ${formData.type === type.value ? 'selected' : ''}`}>
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

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category <span className="required-star">*</span></label>
                <div className="category-cards">
                  {categories.map(cat => (
                    <label key={cat.value} className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}>
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

              {/* Experience */}
              <div className="form-group">
                <label className="form-label">Experience (years)</label>
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

              {/* Specialization */}
              <div className="form-group">
                <label className="form-label">Specializations</label>
                <div className="specialization-group">
                  <div className="specialization-input">
                    <input
                      type="text"
                      value={specializationInput}
                      onChange={(e) => setSpecializationInput(e.target.value)}
                      className="form-input"
                      placeholder="Add specialization"
                    />
                    <button type="button" onClick={handleAddSpecialization} className="add-btn">
                      <Plus size={16} /> Add
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
                      <p className="no-tags">No specializations added</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`form-section ${activeTab === 'contact' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('contact')}>
              <div className="section-title">
                <Phone size={18} />
                <h2>Contact Information</h2>
                <span className="required-badge">Required</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.contact ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.contact ? 'expanded' : ''}`}>
              {/* Phone & Email */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone <span className="required-star">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="error-message">{errors.phone}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email <span className="required-star">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="professional@example.com"
                  />
                  {errors.email && <p className="error-message">{errors.email}</p>}
                </div>
              </div>

              {/* Service Type */}
              <div className="form-group">
                <label className="form-label">Service Type <span className="required-star">*</span></label>
                <div className="service-cards">
                  {serviceTypes.map(type => (
                    <label key={type.value} className={`service-card ${formData.serviceType === type.value ? 'selected' : ''}`}>
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

              {/* Service Areas */}
              <div className="form-group">
                <label className="form-label">Service Areas</label>
                <div className="service-areas">
                  {formData.serviceAreas.map((area, index) => (
                    <div key={index} className="service-area-input">
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => handleServiceAreaChange(index, e.target.value)}
                        className="form-input"
                        placeholder="e.g., Downtown"
                      />
                      {formData.serviceAreas.length > 1 && (
                        <button type="button" onClick={() => removeServiceArea(index)} className="remove-btn">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addServiceArea} className="add-area-btn">
                    <Plus size={16} /> Add Area
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">Address</label>
                <div className="address-grid">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Street"
                  />
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="ZIP Code"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="form-group">
                <label className="form-label">Social Media (Optional)</label>
                <div className="social-grid">
                  <input
                    type="url"
                    value={formData.socialMedia.website}
                    onChange={(e) => handleSocialChange('website', e.target.value)}
                    className="form-input"
                    placeholder="Website"
                  />
                  <input
                    type="url"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    className="form-input"
                    placeholder="Facebook"
                  />
                  <input
                    type="url"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    className="form-input"
                    placeholder="Instagram"
                  />
                  <input
                    type="url"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    className="form-input"
                    placeholder="LinkedIn"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className={`form-section ${activeTab === 'working' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('working')}>
              <div className="section-title">
                <Clock size={18} />
                <h2>Working Hours</h2>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.working ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.working ? 'expanded' : ''}`}>
              <div className="quick-actions">
                <button type="button" onClick={() => toggleAllDays(true)} className="quick-btn">
                  <CheckCircle size={14} /> Open All
                </button>
                <button type="button" onClick={() => toggleAllDays(false)} className="quick-btn">
                  <XCircle size={14} /> Close All
                </button>
              </div>

              <div className="hours-grid">
                {formData.workingHours.map((day, index) => (
                  <div key={day.day} className="hour-card">
                    <div className="hour-day">
                      <label className="day-check">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={(e) => handleWorkingHoursChange(index, 'isAvailable', e.target.checked)}
                        />
                        <span>{days.find(d => d.value === day.day)?.label}</span>
                      </label>
                      {!day.isAvailable && <span className="closed">Closed</span>}
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

          {/* Settings */}
          <div className={`form-section ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('settings')}>
              <div className="section-title">
                <Settings size={18} />
                <h2>Settings</h2>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.settings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.settings ? 'expanded' : ''}`}>
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-header">
                    <Clock size={16} />
                    <h3>Booking Buffer</h3>
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
                    <h3>Max Bookings/Day</h3>
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

                <div className="setting-card full-width">
                  <div className="setting-header">
                    <Shield size={16} />
                    <h3>Cancellation Policy</h3>
                  </div>
                  <div className="policy-cards">
                    {cancellationPolicies.map(policy => (
                      <label key={policy.value} className={`policy-card ${formData.cancellationPolicy === policy.value ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="cancellationPolicy"
                          value={policy.value}
                          checked={formData.cancellationPolicy === policy.value}
                          onChange={handleChange}
                        />
                        <span className="policy-icon">{policy.icon}</span>
                        <div>
                          <span className="policy-name">{policy.label}</span>
                          <span className="policy-desc">{policy.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="setting-card full-width">
                  <div className="setting-header">
                    <Wifi size={16} />
                    <h3>WhatsApp</h3>
                  </div>
                  <input
                    type="text"
                    name="whatsappBusinessId"
                    value={formData.whatsappBusinessId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="WhatsApp Business Number"
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      name="autoReplyEnabled"
                      checked={formData.autoReplyEnabled}
                      onChange={handleChange}
                    />
                    <span>Enable Auto-Reply</span>
                  </label>
                  {formData.autoReplyEnabled && (
                    <textarea
                      name="autoReplyMessage"
                      value={formData.autoReplyMessage}
                      onChange={handleChange}
                      rows="2"
                      className="form-input"
                      placeholder="Auto-reply message"
                    />
                  )}
                </div>

                <div className="setting-card full-width">
                  <div className="setting-header">
                    <Shield size={16} />
                    <h3>Admin Settings</h3>
                  </div>
                  <div className="admin-checks">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        name="isVerified"
                        checked={formData.isVerified}
                        onChange={handleChange}
                      />
                      <span>Mark as Verified</span>
                    </label>
                    <label className="checkbox">
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
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('documents')}>
              <div className="section-title">
                <FileText size={18} />
                <h2>Documents</h2>
                <span className="optional-badge">Optional</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.documents ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.documents ? 'expanded' : ''}`}>
              <div className="docs-grid">
                <div className="doc-card">
                  <Award size={24} />
                  <div>
                    <h4>ID Proof</h4>
                    <p>Government ID</p>
                  </div>
                  <button type="button" className="upload-btn">Upload</button>
                </div>
                <div className="doc-card">
                  <Star size={24} />
                  <div>
                    <h4>Qualification</h4>
                    <p>Certificates</p>
                  </div>
                  <button type="button" className="upload-btn">Upload</button>
                </div>
                <div className="doc-card">
                  <Shield size={24} />
                  <div>
                    <h4>License</h4>
                    <p>Business license</p>
                  </div>
                  <button type="button" className="upload-btn">Upload</button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link href="/admin/bookingService/bookingmng" className="cancel-btn">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? <><span className="spinner"></span> Creating...</> : <><Save size={18} /> Create Professional</>}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .create-professional-wrapper {
          width: 100%;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1e293b;
          font-size: 0.9rem;
          text-decoration: none;
          white-space: nowrap;
        }

        .back-button:hover {
          background: #f8fafc;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.85rem;
          margin: 2px 0 0;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        /* Mobile Tabs */
        .mobile-tabs {
          display: none;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 16px;
          gap: 4px;
        }

        @media (max-width: 1024px) {
          .mobile-tabs {
            display: flex;
          }
        }

        .mobile-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 4px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.8rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .mobile-tab.active {
          background: #3b82f6;
          color: white;
        }

        /* Form Container */
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Form Sections */
        .form-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .form-section:not(.active) {
            display: none;
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          cursor: pointer;
          background: white;
        }

        .section-header:hover {
          background: #f8fafc;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title svg {
          color: #3b82f6;
        }

        .section-title h2 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .required-badge,
        .optional-badge {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 500;
          background: #f1f5f9;
          color: #475569;
        }

        .required-badge {
          background: #fee2e2;
          color: #991b1b;
        }

        .section-toggle {
          padding: 4px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          border-radius: 4px;
        }

        .section-content {
          max-height: 0;
          padding: 0 16px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .section-content.expanded {
          max-height: 2000px;
          padding: 16px;
          border-top: 1px solid #e2e8f0;
        }

        /* Form Elements */
        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .required-star {
          color: #ef4444;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error,
        .form-select.error {
          border-color: #ef4444;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 4px;
        }

        .field-hint {
          color: #64748b;
          font-size: 0.75rem;
          margin-top: 4px;
        }

        /* Type Cards */
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
          gap: 4px;
          padding: 12px 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .type-card input {
          position: absolute;
          opacity: 0;
        }

        .type-card.selected {
          background: #eff6ff;
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

        /* Category Cards */
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
          gap: 4px;
          padding: 12px 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-card input {
          position: absolute;
          opacity: 0;
        }

        .category-card.selected {
          background: #eff6ff;
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

        /* Specialization */
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
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1e293b;
          font-size: 0.85rem;
          white-space: nowrap;
          cursor: pointer;
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
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #1e40af;
        }

        .tag button {
          border: none;
          background: transparent;
          color: #1e40af;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
        }

        .no-tags {
          color: #94a3b8;
          font-size: 0.8rem;
          margin: 0;
        }

        /* Service Cards */
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
          gap: 4px;
          padding: 12px 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
        }

        .service-card input {
          position: absolute;
          opacity: 0;
        }

        .service-card.selected {
          background: #eff6ff;
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

        /* Service Areas */
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
          background: #fef2f2;
          border: 1px solid #fecaca;
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
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          color: #64748b;
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* Address Grid */
        .address-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        @media (max-width: 640px) {
          .address-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Social Grid */
        .social-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        @media (max-width: 640px) {
          .social-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Working Hours */
        .quick-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1e293b;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .hours-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        @media (max-width: 640px) {
          .hours-grid {
            grid-template-columns: 1fr;
          }
        }

        .hour-card {
          padding: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .hour-day {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .day-check {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .closed {
          font-size: 0.7rem;
          padding: 2px 6px;
          background: #f1f5f9;
          border-radius: 4px;
          color: #64748b;
        }

        .hour-times {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hour-times input {
          flex: 1;
          padding: 4px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .hour-times span {
          color: #64748b;
          font-size: 0.7rem;
        }

        /* Settings */
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

        .setting-card.full-width {
          grid-column: span 2;
        }

        @media (max-width: 640px) {
          .setting-card.full-width {
            grid-column: span 1;
          }
        }

        .setting-header {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .setting-header h3 {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
        }

        .setting-control {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .setting-control input {
          width: 60px;
          padding: 4px 6px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          text-align: center;
        }

        .setting-control span {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Policy Cards */
        .policy-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        @media (max-width: 640px) {
          .policy-cards {
            grid-template-columns: 1fr;
          }
        }

        .policy-card {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
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
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .policy-icon {
          font-size: 1.2rem;
        }

        .policy-name {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .policy-desc {
          display: block;
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Checkbox */
        .checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 4px 0;
        }

        /* Admin Checks */
        .admin-checks {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Documents */
        .docs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        @media (max-width: 640px) {
          .docs-grid {
            grid-template-columns: 1fr;
          }
        }

        .doc-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
        }

        .doc-card svg {
          color: #3b82f6;
        }

        .doc-card h4 {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
        }

        .doc-card p {
          font-size: 0.7rem;
          color: #64748b;
          margin: 2px 0 0;
        }

        .upload-btn {
          margin-left: auto;
          padding: 4px 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.7rem;
          cursor: pointer;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }

        @media (max-width: 640px) {
          .form-actions {
            flex-direction: column;
          }
        }

        .cancel-btn,
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .cancel-btn,
          .submit-btn {
            width: 100%;
          }
        }

        .cancel-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
        }

        .submit-btn {
          background: #3b82f6;
          color: white;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}