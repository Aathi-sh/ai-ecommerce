'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Tag, DollarSign, Clock, Image,
  Users, CheckCircle, XCircle, Plus, Minus
} from 'lucide-react';

export default function CreateServicePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [formData, setFormData] = useState({
    professionalId: '',
    name: '',
    description: '',
    category: 'beauty',
    type: 'physical',
    subcategory: '',
    basePrice: 0,
    duration: 60, // minutes
    currency: 'USD',
    
    // Arrays
    tags: [],
    clientRequirements: [''],
    professionalProvides: [''],
    variations: [],
    addons: [],
    images: [],
    
    // Settings
    bufferTime: 0,
    advanceBooking: 30,
    minAge: null,
    maxAge: null,
    genderPreference: 'any',
    isActive: true
  });

  const [tagInput, setTagInput] = useState('');
  const [variationInput, setVariationInput] = useState({ name: '', price: 0, duration: 0 });
  const [addonInput, setAddonInput] = useState({ name: '', price: 0, description: '' });

  // Categories
  const categories = [
    { value: 'beauty', label: 'Beauty & Spa' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'repair', label: 'Repair & Maintenance' },
    { value: 'education', label: 'Education & Training' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'other', label: 'Other' }
  ];

  // Service Types
  const serviceTypes = [
    { value: 'physical', label: 'Physical Service' },
    { value: 'virtual', label: 'Virtual Service' },
    { value: 'both', label: 'Both Physical & Virtual' }
  ];

  // Currencies
  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'AED', label: 'UAE Dirham (د.إ)' }
  ];

  // Gender Preferences
  const genderPreferences = [
    { value: 'any', label: 'Any Gender' },
    { value: 'male', label: 'Male Only' },
    { value: 'female', label: 'Female Only' },
    { value: 'none', label: 'No Preference' }
  ];

  // Fetch professionals
  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const res = await fetch('/api/bookingService/bookingmng?limit=100&status=verified');
      const data = await res.json();
      if (data.success) {
        setProfessionals(data.data);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    if (variationInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        variations: [...prev.variations, { ...variationInput }]
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
    if (addonInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, { ...addonInput }]
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty strings from arrays
      const payload = {
        ...formData,
        clientRequirements: formData.clientRequirements.filter(req => req.trim() !== ''),
        professionalProvides: formData.professionalProvides.filter(prov => prov.trim() !== '')
      };

      const res = await fetch('/api/bookingService/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        alert('Service created successfully!');
        router.push('/admin/services');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/services"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-gray-600">Create a new service offering</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Professional Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional *
              </label>
              <select
                name="professionalId"
                value={formData.professionalId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a professional</option>
                {professionals.map(prof => (
                  <option key={prof._id} value={prof._id}>
                    {prof.businessName} ({prof.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Haircut & Styling"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the service in detail..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Hair, Nails, Makeup"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {serviceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add tags (press Enter)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-blue-800 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Duration Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-green-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Pricing & Duration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  {formData.currency === 'USD' ? '$' : 
                   formData.currency === 'EUR' ? '€' :
                   formData.currency === 'GBP' ? '£' :
                   formData.currency === 'INR' ? '₹' : 'د.إ'}
                </span>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="flex-1 rounded-r-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currencies.map(currency => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="15"
                step="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 15 minutes, in 15-minute increments
              </p>
            </div>
          </div>

          {/* Buffer Time */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buffer Time (minutes)
            </label>
            <input
              type="number"
              name="bufferTime"
              value={formData.bufferTime}
              onChange={handleChange}
              min="0"
              max="120"
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time needed before/after service for preparation/cleanup
            </p>
          </div>
        </div>

        {/* Variations Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="text-purple-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Service Variations</h2>
            </div>
            <button
              type="button"
              onClick={handleAddVariation}
              className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              <Plus size={16} />
              Add Variation
            </button>
          </div>
          
          {/* Add Variation Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variation Name
              </label>
              <input
                type="text"
                value={variationInput.name}
                onChange={(e) => setVariationInput(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Premium Package"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Price
              </label>
              <input
                type="number"
                value={variationInput.price}
                onChange={(e) => setVariationInput(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Duration (min)
              </label>
              <input
                type="number"
                value={variationInput.duration}
                onChange={(e) => setVariationInput(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddVariation}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Variations List */}
          {formData.variations.length > 0 ? (
            <div className="space-y-2">
              {formData.variations.map((variation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{variation.name}</div>
                    <div className="text-sm text-gray-500">
                      +{formatCurrency(variation.price, formData.currency)} • +{variation.duration} minutes
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariation(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No variations added yet</p>
          )}
        </div>

        {/* Addons Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plus className="text-orange-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Add-ons</h2>
            </div>
            <button
              type="button"
              onClick={handleAddAddon}
              className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
            >
              <Plus size={16} />
              Add Add-on
            </button>
          </div>
          
          {/* Add Addon Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add-on Name
              </label>
              <input
                type="text"
                value={addonInput.name}
                onChange={(e) => setAddonInput(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Extra Massage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={addonInput.price}
                onChange={(e) => setAddonInput(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={addonInput.description}
                onChange={(e) => setAddonInput(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Brief description"
              />
            </div>
          </div>

          {/* Addons List */}
          {formData.addons.length > 0 ? (
            <div className="space-y-2">
              {formData.addons.map((addon, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{addon.name}</div>
                    <div className="text-sm text-gray-500">{addon.description}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(addon.price, formData.currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No add-ons added yet</p>
          )}
        </div>

        {/* Requirements Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Requirements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Client Requirements</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('clientRequirements')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Requirement
                </button>
              </div>
              <div className="space-y-2">
                {formData.clientRequirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayChange('clientRequirements', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="What client needs to bring/prepare"
                    />
                    {formData.clientRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('clientRequirements', index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Provides */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Professional Provides</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('professionalProvides')}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-2">
                {formData.professionalProvides.map((prov, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={prov}
                      onChange={(e) => handleArrayChange('professionalProvides', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="What professional provides"
                    />
                    {formData.professionalProvides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('professionalProvides', index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Restrictions Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Restrictions & Preferences</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Advance Booking */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Booking (days)
              </label>
              <input
                type="number"
                name="advanceBooking"
                value={formData.advanceBooking}
                onChange={handleChange}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Age Restrictions */}
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Age
                </label>
                <input
                  type="number"
                  name="minAge"
                  value={formData.minAge || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Age
                </label>
                <input
                  type="number"
                  name="maxAge"
                  value={formData.maxAge || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Any"
                />
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender Preference
              </label>
              <select
                name="genderPreference"
                value={formData.genderPreference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {genderPreferences.map(pref => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
                id="isActive"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900">
                Service is active and available for booking
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/services"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Creating...' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper function for currency formatting
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}