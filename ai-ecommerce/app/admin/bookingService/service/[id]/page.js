'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../../../../context/AuthContext';
import {
  ArrowLeft, Tag, DollarSign, Clock, Users, Briefcase,
  CheckCircle, XCircle, Star, Calendar, Shield, Award,
  Building2, Globe, Layers, Plus, Edit, Trash2,
  AlertCircle, RefreshCw, Download, Printer, Share2,
  Mail, Phone, MapPin, FileText, Hash, List,
  ChevronRight, ChevronLeft, Loader2
} from 'lucide-react';

export default function ViewServicePage({ params }) {
  const router = useRouter();
  const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
  const { id } = params;
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch service details
  const fetchService = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const query = new URLSearchParams({
        id: id,
        companyId: user.companyId
      }).toString();
      
      const res = await fetch(`/api/bookingService/service?${query}`, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 403) throw new Error("You don't have permission to view this service");
        if (res.status === 404) throw new Error("Service not found");
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setService(data.data);
      } else {
        setError(data.error || 'Failed to fetch service');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.companyId && id) {
      fetchService();
    }
  }, [id, user]);

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
    return `${symbols[currency] || '₹'}${amount}`;
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      beauty: '💅',
      health: '🏥',
      consulting: '💼',
      repair: '🔧',
      education: '📚',
      fitness: '💪',
      other: '📌'
    };
    return icons[category] || '📌';
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const types = {
      physical: { label: 'Physical', color: 'bg-blue-100 text-blue-800' },
      virtual: { label: 'Virtual', color: 'bg-purple-100 text-purple-800' },
      both: { label: 'Both', color: 'bg-green-100 text-green-800' }
    };
    return types[type] || types.physical;
  };

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
        <p>Loading service details...</p>
        <style jsx>{`
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
          p {
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} className="error-icon" />
        <h2>Unable to load service</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => router.back()} className="back-btn">
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button onClick={fetchService} className="retry-btn">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
            background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
          }
          .error-icon {
            color: #ef4444;
            margin-bottom: 1.5rem;
          }
          h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 2rem;
          }
          .error-actions {
            display: flex;
            gap: 1rem;
          }
          .back-btn, .retry-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .back-btn {
            background: white;
            border: 1px solid #d1d5db;
            color: #374151;
          }
          .back-btn:hover {
            background: #f9fafb;
          }
          .retry-btn {
            background: #3b82f6;
            border: none;
            color: white;
          }
          .retry-btn:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="not-found-container">
        <AlertCircle size={48} className="not-found-icon" />
        <h2>Service not found</h2>
        <p>The service you're looking for doesn't exist or has been deleted.</p>
        <button onClick={() => router.push('/admin/bookingService/service')} className="back-btn">
          <ArrowLeft size={16} />
          Back to Services
        </button>
        <style jsx>{`
          .not-found-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
            background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
          }
          .not-found-icon {
            color: #f59e0b;
            margin-bottom: 1.5rem;
          }
          h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 2rem;
          }
          .back-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            border: none;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            cursor: pointer;
          }
          .back-btn:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  const typeBadge = getTypeBadge(service.type);

  return (
    <>
      <Head>
        <title>{service.name} | Service Details | LFMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="view-service-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => router.back()} className="back-button">
                <ArrowLeft size={20} />
                <span>Back to Services</span>
              </button>
              <div className="title-section">
                <div className="title-icon">
                  <span className="category-icon-large">{getCategoryIcon(service.category)}</span>
                </div>
                <div>
                  <h1 className="page-title">{service.name}</h1>
                  <p className="page-subtitle">{service.description}</p>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <Link
                href={`/admin/bookingService/service/create?id=${service._id}`}
                className="edit-btn"
              >
                <Edit size={18} />
                <span>Edit Service</span>
              </Link>
            </div>
          </div>
        </div>

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
                <Shield size={16} />
                Super Admin
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab ${activeTab === 'variations' ? 'active' : ''}`}
            onClick={() => setActiveTab('variations')}
          >
            Variations & Add-ons
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Status Cards */}
              <div className="status-cards">
                <div className="status-card">
                  <div className="status-icon blue">
                    <Tag size={24} />
                  </div>
                  <div>
                    <span className="status-label">Status</span>
                    <span className={`status-value ${service.isActive ? 'active' : 'inactive'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-icon green">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span className="status-label">Base Price</span>
                    <span className="status-value">
                      {formatCurrency(service.basePrice, service.currency)}
                    </span>
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-icon orange">
                    <Clock size={24} />
                  </div>
                  <div>
                    <span className="status-label">Duration</span>
                    <span className="status-value">
                      {formatDuration(service.duration)}
                    </span>
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-icon purple">
                    <Users size={24} />
                  </div>
                  <div>
                    <span className="status-label">Total Bookings</span>
                    <span className="status-value">{service.totalBookings || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="quick-info-grid">
                <div className="info-card">
                  <h3>Category & Type</h3>
                  <div className="info-content">
                    <div className="info-item">
                      <span className="info-label">Category</span>
                      <span className="info-value">{service.category}</span>
                    </div>
                    {service.subcategory && (
                      <div className="info-item">
                        <span className="info-label">Subcategory</span>
                        <span className="info-value">{service.subcategory}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Service Type</span>
                      <span className={`type-badge ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Booking Settings</h3>
                  <div className="info-content">
                    <div className="info-item">
                      <span className="info-label">Buffer Time</span>
                      <span className="info-value">{service.bufferTime || 0} minutes</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Advance Booking</span>
                      <span className="info-value">{service.advanceBooking || 30} days</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Restrictions</h3>
                  <div className="info-content">
                    <div className="info-item">
                      <span className="info-label">Age Range</span>
                      <span className="info-value">
                        {service.minAge || service.maxAge 
                          ? `${service.minAge || 0} - ${service.maxAge || 100} years`
                          : 'No age restrictions'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Gender Preference</span>
                      <span className="info-value capitalize">{service.genderPreference || 'any'}</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Popularity</h3>
                  <div className="info-content">
                    <div className="info-item">
                      <span className="info-label">Rating</span>
                      <span className="info-value">
                        <Star size={14} className="star-icon" />
                        {service.popularity?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Featured</span>
                      <span className="info-value">
                        {service.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Popular</span>
                      <span className="info-value">
                        {service.isPopular ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {service.tags?.length > 0 && (
                <div className="tags-section">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {service.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="details-tab">
              <div className="details-grid">
                {/* Client Requirements */}
                {service.clientRequirements?.length > 0 && (
                  <div className="details-card">
                    <h3>
                      <Users size={18} />
                      Client Requirements
                    </h3>
                    <ul className="requirements-list">
                      {service.clientRequirements.map((req, index) => (
                        <li key={index}>
                          <CheckCircle size={16} className="check-icon" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Professional Provides */}
                {service.professionalProvides?.length > 0 && (
                  <div className="details-card">
                    <h3>
                      <Briefcase size={18} />
                      Professional Provides
                    </h3>
                    <ul className="requirements-list">
                      {service.professionalProvides.map((prov, index) => (
                        <li key={index}>
                          <CheckCircle size={16} className="check-icon green" />
                          {prov}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variations & Add-ons Tab */}
          {activeTab === 'variations' && (
            <div className="variations-tab">
              {/* Variations */}
              {service.variations?.length > 0 && (
                <div className="variations-section">
                  <h3>Service Variations</h3>
                  <div className="variations-grid">
                    {service.variations.map((variation, index) => (
                      <div key={index} className="variation-card">
                        <h4>{variation.name}</h4>
                        <div className="variation-details">
                          <div className="variation-price">
                            <DollarSign size={14} />
                            +{formatCurrency(variation.price, service.currency)}
                          </div>
                          {variation.duration > 0 && (
                            <div className="variation-duration">
                              <Clock size={14} />
                              +{formatDuration(variation.duration)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {service.addons?.length > 0 && (
                <div className="addons-section">
                  <h3>Add-ons</h3>
                  <div className="addons-grid">
                    {service.addons.map((addon, index) => (
                      <div key={index} className="addon-card">
                        <div className="addon-header">
                          <h4>{addon.name}</h4>
                          <span className="addon-price">
                            +{formatCurrency(addon.price, service.currency)}
                          </span>
                        </div>
                        {addon.description && (
                          <p className="addon-description">{addon.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!service.variations?.length && !service.addons?.length) && (
                <div className="empty-state">
                  <Layers size={48} />
                  <h3>No variations or add-ons</h3>
                  <p>This service doesn't have any variations or add-ons configured.</p>
                  <Link
                    href={`/admin/bookingService/service/create?id=${service._id}`}
                    className="add-btn"
                  >
                    <Plus size={16} />
                    Add Variations
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .view-service-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .view-service-page {
            padding: 1rem;
          }
        }

        /* Header */
        .page-header {
          margin-bottom: 1.5rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
          }
        }

        .header-left {
          flex: 1;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 0;
          margin-bottom: 1rem;
        }

        .back-button:hover {
          opacity: 0.8;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .title-icon {
          width: 4rem;
          height: 4rem;
          background: #eff6ff;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .edit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .edit-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Company Banner */
        .company-banner {
          margin-bottom: 1.5rem;
        }

        .company-banner-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .company-banner-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 9999px;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Tabs */
        .tabs-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          background: white;
          padding: 0.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }

        .tab {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab:hover {
          background: #f8fafc;
          color: #334155;
        }

        .tab.active {
          background: #3b82f6;
          color: white;
        }

        /* Main Content */
        .main-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 2rem;
        }

        /* Status Cards */
        .status-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 1024px) {
          .status-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .status-cards {
            grid-template-columns: 1fr;
          }
        }

        .status-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .status-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
        }

        .status-icon.blue {
          background: #eff6ff;
          color: #3b82f6;
        }

        .status-icon.green {
          background: #f0fdf4;
          color: #10b981;
        }

        .status-icon.orange {
          background: #fff7ed;
          color: #f97316;
        }

        .status-icon.purple {
          background: #faf5ff;
          color: #a855f7;
        }

        .status-label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .status-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
        }

        .status-value.active {
          color: #10b981;
        }

        .status-value.inactive {
          color: #ef4444;
        }

        /* Quick Info Grid */
        .quick-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .quick-info-grid {
            grid-template-columns: 1fr;
          }
        }

        .info-card {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .info-card h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-size: 0.813rem;
          color: #64748b;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .type-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.688rem;
          font-weight: 600;
        }

        .star-icon {
          color: #f59e0b;
        }

        .capitalize {
          text-transform: capitalize;
        }

        /* Tags Section */
        .tags-section {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .tags-section h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 1rem 0;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background: #e2e8f0;
          color: #334155;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Details Grid */
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        .details-card {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .details-card h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .requirements-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .requirements-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .check-icon {
          flex-shrink: 0;
          color: #3b82f6;
          margin-top: 0.125rem;
        }

        .check-icon.green {
          color: #10b981;
        }

        /* Variations Section */
        .variations-section,
        .addons-section {
          margin-bottom: 2rem;
        }

        .variations-section h3,
        .addons-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 1rem 0;
        }

        .variations-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .variations-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .variations-grid {
            grid-template-columns: 1fr;
          }
        }

        .variation-card {
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .variation-card h4 {
          font-size: 0.938rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }

        .variation-details {
          display: flex;
          gap: 1rem;
        }

        .variation-price,
        .variation-duration {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.813rem;
          font-weight: 500;
        }

        .variation-price {
          color: #10b981;
        }

        .variation-duration {
          color: #64748b;
        }

        /* Addons Grid */
        .addons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .addons-grid {
            grid-template-columns: 1fr;
          }
        }

        .addon-card {
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .addon-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .addon-header h4 {
          font-size: 0.938rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .addon-price {
          font-size: 0.875rem;
          font-weight: 600;
          color: #10b981;
        }

        .addon-description {
          font-size: 0.813rem;
          color: #64748b;
          margin: 0;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
        }

        .empty-state svg {
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: #64748b;
          margin: 0 0 1.5rem 0;
        }

        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .add-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </>
  );
}