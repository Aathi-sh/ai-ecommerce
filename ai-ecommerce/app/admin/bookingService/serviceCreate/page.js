'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, User, Building, Mail, Phone,
  MapPin, Briefcase, Clock, Globe, Shield
} from 'lucide-react';

export default function CreateProfessionalPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
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
    
    // Documents (can be uploaded later)
    documents: {
      idProof: '',
      qualificationProof: '',
      license: ''
    }
  });

  const [specializationInput, setSpecializationInput] = useState('');
  
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

  // Types
  const types = [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'agency', label: 'Agency' }
  ];

  // Service Types
  const serviceTypes = [
    { value: 'onsite', label: 'Onsite Only' },
    { value: 'remote', label: 'Remote Only' },
    { value: 'both', label: 'Both Onsite & Remote' },
    { value: 'mobile', label: 'Mobile Service' }
  ];

  // Days of week
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Fetch users for dropdown
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?role=user&limit=50');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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
  };

  // Handle working hours changes
  const handleWorkingHoursChange = (index, field, value) => {
    const updatedHours = [...formData.workingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty service areas
      const filteredServiceAreas = formData.serviceAreas.filter(area => area.trim() !== '');
      
      const payload = {
        ...formData,
        serviceAreas: filteredServiceAreas
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
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating professional:', error);
      alert('Failed to create professional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/bookingService/bookingmng"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Professional</h1>
          <p className="text-gray-600">Create a new professional service provider</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User *
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                User will be upgraded to professional role
              </p>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., John's Beauty Salon"
              />
            </div>

            {/* Tagline */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your business"
              />
            </div>

            {/* Professional Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
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

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (years)
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specializations
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add specialization"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialization}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(index)}
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

        {/* Contact Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="text-green-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="professional@example.com"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type *
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
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

            {/* Service Areas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Areas
              </label>
              <div className="space-y-2">
                {formData.serviceAreas.map((area, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => handleServiceAreaChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Manhattan, NYC"
                    />
                    {formData.serviceAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceArea(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addServiceArea}
                  className="px-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  + Add Another Area
                </button>
              </div>
            </div>

            {/* Address Fields */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="text-gray-600" size={18} />
                <h3 className="font-medium text-gray-900">Address Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street Address"
                />
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State/Province"
                />
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ZIP/Postal Code"
                />
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-purple-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Working Hours</h2>
          </div>
          
          <div className="space-y-4">
            {formData.workingHours.map((day, index) => (
              <div key={day.day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 md:w-48">
                  <input
                    type="checkbox"
                    checked={day.isAvailable}
                    onChange={(e) => handleWorkingHoursChange(index, 'isAvailable', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="font-medium capitalize min-w-24">{day.day}</span>
                  {!day.isAvailable && (
                    <span className="text-sm text-gray-500">(Closed)</span>
                  )}
                </div>
                
                {day.isAvailable && (
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">From:</span>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">To:</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-orange-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Booking Buffer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Buffer (minutes)
              </label>
              <input
                type="number"
                name="bookingBuffer"
                value={formData.bookingBuffer}
                onChange={handleChange}
                min="0"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Time between consecutive bookings
              </p>
            </div>

            {/* Max Daily Bookings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Daily Bookings
              </label>
              <input
                type="number"
                name="maxDailyBookings"
                value={formData.maxDailyBookings}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Cancellation Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Policy
              </label>
              <select
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="flexible">Flexible (Full refund)</option>
                <option value="moderate">Moderate (Partial refund)</option>
                <option value="strict">Strict (No refund)</option>
              </select>
            </div>

            {/* WhatsApp Business ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Business ID
              </label>
              <input
                type="text"
                name="whatsappBusinessId"
                value={formData.whatsappBusinessId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Business phone number"
              />
            </div>

            {/* Auto Reply */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  name="autoReplyEnabled"
                  checked={formData.autoReplyEnabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Enable Auto-Reply on WhatsApp
                </label>
              </div>
              {formData.autoReplyEnabled && (
                <textarea
                  name="autoReplyMessage"
                  value={formData.autoReplyMessage}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Auto-reply message for WhatsApp"
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/bookingService/bookingmng"
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
            {loading ? 'Creating...' : 'Create Professional'}
          </button>
        </div>
      </form>
    </div>
  );
}