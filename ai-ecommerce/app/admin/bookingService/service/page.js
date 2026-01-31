'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Filter, Plus, Eye, Edit, CheckCircle, XCircle,
  Tag, Clock, DollarSign, Users, Star, Image, MoreVertical,
  Trash2, ToggleLeft, ToggleRight, TrendingUp
} from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    type: searchParams.get('type') || 'all',
    professionalId: searchParams.get('professionalId') || 'all',
    status: searchParams.get('status') || 'active'
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Categories
  const categories = [
    { value: 'all', label: 'All Categories' },
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
    { value: 'all', label: 'All Types' },
    { value: 'physical', label: 'Physical' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'both', label: 'Both' }
  ];

  // Statuses
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch services and professionals
  useEffect(() => {
    fetchServices();
    fetchProfessionals();
  }, [filters, pagination.page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      }).toString();
      
      const res = await fetch(`/api/admin/services?${query}`);
      const data = await res.json();
      
      if (data.success) {
        setServices(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const res = await fetch('/api/admin/professionals?limit=100&status=verified');
      const data = await res.json();
      if (data.success) {
        setProfessionals(data.data);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle service actions
  const handleAction = async (id, action, data = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/services?id=${id}&action=${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message);
        fetchServices(); // Refresh list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert(result.message);
        fetchServices();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage all professional services</p>
        </div>
        <Link
          href="/admin/services/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Service
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search services..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Professional Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional
            </label>
            <select
              value={filters.professionalId}
              onChange={(e) => handleFilterChange('professionalId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Professionals</option>
              {professionals.map(prof => (
                <option key={prof._id} value={prof._id}>
                  {prof.businessName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-green-600">
                {services.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <ToggleRight className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-purple-600">
                {services.length > 0 
                  ? formatCurrency(
                      services.reduce((sum, s) => sum + s.basePrice, 0) / services.length,
                      services[0]?.currency || 'USD'
                    )
                  : formatCurrency(0)
                }
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-orange-600">
                {services.reduce((sum, s) => sum + (s.totalBookings || 0), 0)}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ? 'Try adjusting your search filters' : 'Get started by adding a new service'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    {/* Service Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                          {service.images?.[0]?.url ? (
                            <img
                              src={service.images[0].url}
                              alt={service.name}
                              className="h-12 w-12 object-cover rounded-lg"
                            />
                          ) : (
                            <Tag className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {service.name}
                            </p>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              service.type === 'physical' ? 'bg-blue-100 text-blue-800' :
                              service.type === 'virtual' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {service.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.tags?.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {service.tags?.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{service.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Professional */}
                    <td className="px-6 py-4">
                      {service.professionalId ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {service.professionalId.businessName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {service.professionalId.category}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {service.professionalId.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No professional</span>
                      )}
                    </td>

                    {/* Pricing & Duration */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-green-600" />
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(service.basePrice, service.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-600" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(service.duration)}
                          </span>
                        </div>
                        {service.variations?.length > 0 && (
                          <div className="text-xs text-gray-500">
                            +{service.variations.length} variations
                          </div>
                        )}
                        {service.addons?.length > 0 && (
                          <div className="text-xs text-gray-500">
                            +{service.addons.length} add-ons
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Bookings:</span>
                          <span className="font-medium">{service.totalBookings || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Popularity:</span>
                          <span className="font-medium">{service.popularity || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">
                            {new Date(service.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>
                          {service.isActive ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.category === 'beauty' ? 'bg-pink-100 text-pink-800' :
                            service.category === 'health' ? 'bg-green-100 text-green-800' :
                            service.category === 'consulting' ? 'bg-blue-100 text-blue-800' :
                            service.category === 'repair' ? 'bg-orange-100 text-orange-800' :
                            service.category === 'education' ? 'bg-purple-100 text-purple-800' :
                            service.category === 'fitness' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {service.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/services/${service._id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        <Link
                          href={`/admin/services/${service._id}/edit`}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        
                        <button
                          onClick={() => handleAction(
                            service._id,
                            service.isActive ? 'deactivate' : 'activate'
                          )}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                          title={service.isActive ? 'Deactivate' : 'Activate'}
                          disabled={actionLoading}
                        >
                          {service.isActive ? (
                            <ToggleLeft size={18} />
                          ) : (
                            <ToggleRight size={18} />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                          disabled={actionLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> services
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}