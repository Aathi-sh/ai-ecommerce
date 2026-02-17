'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import {
  ArrowLeft, Save, Tag, DollarSign, Clock,
  Users, CheckCircle, XCircle, Plus, Minus, ChevronDown,
  ChevronUp, Briefcase, Settings, Shield, AlertCircle,
  Star, ThumbsUp, Calendar, Award, Zap
} from 'lucide-react';

export default function CreateServicePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: false,
    variations: false,
    addons: false,
    requirements: false,
    restrictions: false
  });
  
  const [formData, setFormData] = useState({
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

  // Categories with icons
  const categories = [
    { value: 'beauty', label: 'Beauty & Spa', icon: '💅' },
    { value: 'health', label: 'Health & Wellness', icon: '🏥' },
    { value: 'consulting', label: 'Consulting', icon: '💼' },
    { value: 'repair', label: 'Repair & Maintenance', icon: '🔧' },
    { value: 'education', label: 'Education & Training', icon: '📚' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'other', label: 'Other', icon: '📌' }
  ];

  // Service Types
  const serviceTypes = [
    { value: 'physical', label: 'Physical Service', icon: '📍' },
    { value: 'virtual', label: 'Virtual Service', icon: '💻' },
    { value: 'both', label: 'Both', icon: '🔄' }
  ];

  // Currencies
  const currencies = [
    { value: 'INR', label: '₹ INR', symbol: '₹' },
    { value: 'USD', label: '$ USD', symbol: '$' },
    { value: 'EUR', label: '€ EUR', symbol: '€' },
    { value: 'GBP', label: '£ GBP', symbol: '£' },
    { value: 'AED', label: 'د.إ AED', symbol: 'د.إ' }
  ];

  // Gender Preferences
  const genderPreferences = [
    { value: 'any', label: 'Any', icon: '👥' },
    { value: 'male', label: 'Male', icon: '👨' },
    { value: 'female', label: 'Female', icon: '👩' },
    { value: 'none', label: 'None', icon: '🚫' }
  ];

  // Duration options
  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480];

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
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
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
    }
  };

  const handleRemoveVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
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
    }
  };

  const handleRemoveAddon = (index) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

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
      const filteredRequirements = formData.clientRequirements.filter(req => req.trim() !== '');
      const filteredProvides = formData.professionalProvides.filter(prov => prov.trim() !== '');
      
      const payload = {
        ...formData,
        clientRequirements: filteredRequirements,
        professionalProvides: filteredProvides,
        totalBookings: 0,
        popularity: 0
      };

      const res = await fetch('/api/bookingService/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        alert('Service created successfully!');
        router.push('/admin/bookingService/service');
      } else {
        alert(`Error: ${data.error || 'Failed to create service'}`);
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.value === formData.currency);
    return currency?.symbol || '₹';
  };

  return (
    <>
      <Head>
        <title>Add New Service | LFMS</title>
      </Head>

      <div className="create-service-wrapper">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <Link href="/admin/bookingService/service" className="back-button">
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <div>
              <h1 className="page-title">Add New Service</h1>
              <p className="page-subtitle">Create a new service offering</p>
            </div>
          </div>
          <div className="badge draft">Draft</div>
        </div>

        {/* Mobile Tabs */}
        <div className="mobile-tabs">
          <button onClick={() => setActiveTab('basic')} className={`mobile-tab ${activeTab === 'basic' ? 'active' : ''}`}>
            <Tag size={14} /> Basic
          </button>
          <button onClick={() => setActiveTab('pricing')} className={`mobile-tab ${activeTab === 'pricing' ? 'active' : ''}`}>
            <DollarSign size={14} /> Pricing
          </button>
          <button onClick={() => setActiveTab('variations')} className={`mobile-tab ${activeTab === 'variations' ? 'active' : ''}`}>
            <Briefcase size={14} /> Variations
          </button>
          <button onClick={() => setActiveTab('addons')} className={`mobile-tab ${activeTab === 'addons' ? 'active' : ''}`}>
            <Plus size={14} /> Addons
          </button>
          <button onClick={() => setActiveTab('requirements')} className={`mobile-tab ${activeTab === 'requirements' ? 'active' : ''}`}>
            <CheckCircle size={14} /> Requirements
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Basic Information */}
          <div className={`form-section ${activeTab === 'basic' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('basic')}>
              <div className="section-title">
                <Tag size={16} />
                <h2>Basic Information</h2>
                <span className="badge required">Required</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.basic ? 'expanded' : ''}`}>
              {/* Service Name */}
              <div className="form-group">
                <label className="form-label">
                  Service Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g., Professional Haircut"
                />
                {errors.name && <p className="error-msg">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  Description <span className="required-star">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Describe the service in detail..."
                />
                {errors.description && <p className="error-msg">{errors.description}</p>}
                <p className="field-hint">Minimum 50 characters recommended</p>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category <span className="required-star">*</span></label>
                <div className="category-grid">
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

              {/* Subcategory & Type */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subcategory</label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Hair Styling"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <div className="type-cards">
                    {serviceTypes.map(type => (
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
              </div>

              {/* Tags */}
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="form-input"
                    placeholder="Add tags"
                  />
                  <button type="button" onClick={handleAddTag} className="add-btn">
                    <Plus size={16} /> Add
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
                    <p className="empty-tags">No tags added</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className={`form-section ${activeTab === 'pricing' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('pricing')}>
              <div className="section-title">
                <DollarSign size={16} />
                <h2>Pricing & Duration</h2>
                <span className="badge required">Required</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.pricing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.pricing ? 'expanded' : ''}`}>
              <div className="pricing-grid">
                {/* Base Price */}
                <div className="price-card">
                  <div className="price-header">
                    <DollarSign size={14} />
                    <h3>Base Price</h3>
                  </div>
                  <div className="price-input">
                    <span className="currency">{getCurrencySymbol()}</span>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={errors.basePrice ? 'error' : ''}
                    />
                  </div>
                  {errors.basePrice && <p className="error-msg">{errors.basePrice}</p>}
                </div>

                {/* Currency */}
                <div className="price-card">
                  <div className="price-header">
                    <Shield size={14} />
                    <h3>Currency</h3>
                  </div>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="currency-select"
                  >
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="price-card">
                  <div className="price-header">
                    <Clock size={14} />
                    <h3>Duration</h3>
                  </div>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`duration-select ${errors.duration ? 'error' : ''}`}
                  >
                    {durationOptions.map(mins => (
                      <option key={mins} value={mins}>
                        {mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`}
                      </option>
                    ))}
                  </select>
                  {errors.duration && <p className="error-msg">{errors.duration}</p>}
                </div>

                {/* Buffer Time */}
                <div className="price-card">
                  <div className="price-header">
                    <Zap size={14} />
                    <h3>Buffer Time</h3>
                  </div>
                  <div className="buffer-input">
                    <input
                      type="number"
                      name="bufferTime"
                      value={formData.bufferTime}
                      onChange={handleChange}
                      min="0"
                      step="5"
                    />
                    <span>min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variations */}
          <div className={`form-section ${activeTab === 'variations' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('variations')}>
              <div className="section-title">
                <Briefcase size={16} />
                <h2>Service Variations</h2>
                <span className="badge optional">Optional</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.variations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.variations ? 'expanded' : ''}`}>
              {/* Add Variation Form */}
              <div className="variation-form">
                <div className="variation-inputs">
                  <input
                    type="text"
                    value={variationInput.name}
                    onChange={(e) => setVariationInput(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Variation name"
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={variationInput.price}
                    onChange={(e) => setVariationInput(prev => ({ ...prev, price: e.target.value }))}
                    placeholder={`Price (${getCurrencySymbol()})`}
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                  <input
                    type="number"
                    value={variationInput.duration}
                    onChange={(e) => setVariationInput(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Extra minutes"
                    className="form-input"
                    min="0"
                    step="5"
                  />
                  <button type="button" onClick={handleAddVariation} className="add-variation-btn">
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Variations List */}
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
                      <button type="button" onClick={() => handleRemoveVariation(index)} className="remove-btn">
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Briefcase size={24} />
                    <p>No variations added</p>
                    <span>Add variations like "Premium Package" or "Express Service"</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Addons */}
          <div className={`form-section ${activeTab === 'addons' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('addons')}>
              <div className="section-title">
                <Plus size={16} />
                <h2>Add-ons</h2>
                <span className="badge optional">Optional</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.addons ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.addons ? 'expanded' : ''}`}>
              {/* Add Addon Form */}
              <div className="addon-form">
                <div className="addon-inputs">
                  <input
                    type="text"
                    value={addonInput.name}
                    onChange={(e) => setAddonInput(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Add-on name"
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={addonInput.price}
                    onChange={(e) => setAddonInput(prev => ({ ...prev, price: e.target.value }))}
                    placeholder={`Price (${getCurrencySymbol()})`}
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                  <input
                    type="text"
                    value={addonInput.description}
                    onChange={(e) => setAddonInput(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="form-input"
                  />
                  <button type="button" onClick={handleAddAddon} className="add-addon-btn">
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Addons List */}
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
                      <button type="button" onClick={() => handleRemoveAddon(index)} className="remove-btn">
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Plus size={24} />
                    <p>No add-ons added</p>
                    <span>Add optional extras customers can purchase</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className={`form-section ${activeTab === 'requirements' ? 'active' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('requirements')}>
              <div className="section-title">
                <CheckCircle size={16} />
                <h2>Requirements & Inclusions</h2>
                <span className="badge optional">Optional</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.requirements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.requirements ? 'expanded' : ''}`}>
              <div className="requirements-grid">
                {/* Client Requirements */}
                <div className="requirement-group">
                  <div className="group-header">
                    <AlertCircle size={14} />
                    <h3>Client Requirements</h3>
                    <button type="button" onClick={() => addArrayItem('clientRequirements')} className="add-group-btn">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  {formData.clientRequirements.map((req, index) => (
                    <div key={index} className="requirement-row">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleArrayChange('clientRequirements', index, e.target.value)}
                        className="form-input"
                        placeholder="What client needs to bring"
                      />
                      {formData.clientRequirements.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem('clientRequirements', index)} className="remove-row">
                          <Minus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Professional Provides */}
                <div className="requirement-group">
                  <div className="group-header">
                    <ThumbsUp size={14} />
                    <h3>Professional Provides</h3>
                    <button type="button" onClick={() => addArrayItem('professionalProvides')} className="add-group-btn">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  {formData.professionalProvides.map((prov, index) => (
                    <div key={index} className="requirement-row">
                      <input
                        type="text"
                        value={prov}
                        onChange={(e) => handleArrayChange('professionalProvides', index, e.target.value)}
                        className="form-input"
                        placeholder="What professional provides"
                      />
                      {formData.professionalProvides.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem('professionalProvides', index)} className="remove-row">
                          <Minus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Restrictions */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('restrictions')}>
              <div className="section-title">
                <Shield size={16} />
                <h2>Restrictions</h2>
                <span className="badge optional">Optional</span>
              </div>
              <button type="button" className="section-toggle">
                {expandedSections.restrictions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className={`section-content ${expandedSections.restrictions ? 'expanded' : ''}`}>
              <div className="restrictions-grid">
                {/* Advance Booking */}
                <div className="restriction-card">
                  <div className="restriction-header">
                    <Calendar size={14} />
                    <h3>Advance Booking</h3>
                  </div>
                  <div className="restriction-input-group">
                    <input
                      type="number"
                      name="advanceBooking"
                      value={formData.advanceBooking}
                      onChange={handleChange}
                      min="1"
                      max="365"
                    />
                    <span>days</span>
                  </div>
                </div>

                {/* Age Restrictions */}
                <div className="restriction-card">
                  <div className="restriction-header">
                    <Users size={14} />
                    <h3>Age Restrictions</h3>
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
                    />
                  </div>
                </div>

                {/* Gender Preference */}
                <div className="restriction-card">
                  <div className="restriction-header">
                    <Users size={14} />
                    <h3>Gender Preference</h3>
                  </div>
                  <div className="gender-options">
                    {genderPreferences.map(pref => (
                      <label key={pref.value} className={`gender-option ${formData.genderPreference === pref.value ? 'selected' : ''}`}>
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
          </div>

          {/* Status */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-title">
                <Settings size={16} />
                <h2>Service Status</h2>
              </div>
            </div>

            <div className="section-content expanded">
              <div className="status-grid">
                <label className="status-checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>
                    <CheckCircle size={14} />
                    Service is active
                  </span>
                </label>

                <label className="status-checkbox">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleChange}
                  />
                  <span>
                    <Star size={14} />
                    Mark as popular
                  </span>
                </label>

                <label className="status-checkbox">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <span>
                    <Award size={14} />
                    Feature this service
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link href="/admin/bookingService/service" className="cancel-btn">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .create-service-wrapper {
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
          padding: 6px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1e293b;
          font-size: 0.85rem;
          text-decoration: none;
          white-space: nowrap;
        }

        .back-button:hover {
          background: #f8fafc;
        }

        .page-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.8rem;
          margin: 2px 0 0;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
          background: #f1f5f9;
          color: #475569;
        }

        .badge.draft {
          background: #f1f5f9;
          color: #475569;
        }

        .badge.required {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge.optional {
          background: #f1f5f9;
          color: #475569;
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
          overflow-x: auto;
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
          font-size: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }

        .mobile-tab.active {
          background: #3b82f6;
          color: white;
        }

        /* Form Container */
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
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
          padding: 12px 16px;
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
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
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
          font-size: 0.8rem;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .required-star {
          color: #ef4444;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          background: white;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error,
        .form-select.error {
          border-color: #ef4444;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .error-msg {
          color: #ef4444;
          font-size: 0.7rem;
          margin-top: 4px;
        }

        .field-hint {
          color: #64748b;
          font-size: 0.7rem;
          margin-top: 4px;
        }

        /* Category Cards */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        @media (max-width: 1024px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 640px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 4px;
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
          font-size: 1.4rem;
        }

        .category-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #1e293b;
          text-align: center;
        }

        /* Type Cards */
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
          padding: 8px 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
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
          font-size: 1.2rem;
        }

        .type-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #1e293b;
        }

        /* Tags */
        .tag-input-group {
          display: flex;
          gap: 8px;
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
          font-size: 0.8rem;
          white-space: nowrap;
          cursor: pointer;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          font-size: 0.75rem;
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

        .empty-tags {
          color: #94a3b8;
          font-size: 0.8rem;
          margin: 4px 0;
        }

        /* Pricing */
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

        .price-card {
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .price-header {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .price-header h3 {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .price-input {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .price-input .currency {
          font-size: 1rem;
          font-weight: 600;
          color: #475569;
        }

        .price-input input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9rem;
          text-align: right;
        }

        .price-input input.error {
          border-color: #ef4444;
        }

        .currency-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .duration-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .duration-select.error {
          border-color: #ef4444;
        }

        .buffer-input {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .buffer-input input {
          width: 60px;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          text-align: center;
        }

        .buffer-input span {
          color: #64748b;
          font-size: 0.8rem;
        }

        /* Variations */
        .variation-form {
          margin-bottom: 16px;
          padding: 12px;
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
          gap: 4px;
          padding: 0 16px;
          background: #8b5cf6;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 0.8rem;
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
          padding: 10px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .variation-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .variation-name {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .variation-price {
          font-size: 0.85rem;
          color: #059669;
          font-weight: 600;
        }

        .variation-duration {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Addons */
        .addon-form {
          margin-bottom: 16px;
          padding: 12px;
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
          gap: 4px;
          padding: 0 16px;
          background: #f97316;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 0.8rem;
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
          padding: 10px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .addon-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .addon-name {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .addon-desc {
          font-size: 0.7rem;
          color: #64748b;
        }

        .addon-price {
          font-size: 0.9rem;
          font-weight: 600;
          color: #059669;
        }

        /* Requirements */
        .requirements-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .requirements-grid {
            grid-template-columns: 1fr;
          }
        }

        .requirement-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .group-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .group-header h3 {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .add-group-btn {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          color: #475569;
          font-size: 0.7rem;
          cursor: pointer;
          margin-left: auto;
        }

        .requirement-row {
          display: flex;
          gap: 6px;
        }

        .remove-row {
          padding: 0 8px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #ef4444;
          cursor: pointer;
        }

        /* Restrictions */
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
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .restriction-header {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .restriction-header h3 {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .restriction-input-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .restriction-input-group input {
          width: 80px;
          padding: 6px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          text-align: center;
        }

        .restriction-input-group span {
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
          padding: 6px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
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
          gap: 2px;
          padding: 6px 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
        }

        .gender-option input {
          position: absolute;
          opacity: 0;
        }

        .gender-option.selected {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .gender-icon {
          font-size: 1rem;
        }

        .gender-label {
          font-size: 0.65rem;
          font-weight: 500;
          color: #1e293b;
        }

        /* Status */
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
          gap: 6px;
          padding: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
        }

        .status-checkbox input {
          width: 16px;
          height: 16px;
        }

        .status-checkbox span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #1e293b;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          color: #64748b;
        }

        .empty-state svg {
          margin-bottom: 8px;
          color: #94a3b8;
        }

        .empty-state p {
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0 0 4px;
        }

        .empty-state span {
          font-size: 0.7rem;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
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
          font-size: 0.85rem;
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

        .remove-btn {
          padding: 4px;
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          border-radius: 4px;
        }

        .remove-btn:hover {
          background: #fee2e2;
        }

        .spinner {
          width: 14px;
          height: 14px;
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