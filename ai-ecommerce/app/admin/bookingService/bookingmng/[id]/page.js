'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../../../../context/AuthContext';
import {
  ArrowLeft, User, Building, Mail, Phone,Tag, MapPin,
  Briefcase, Clock, Globe, Shield, CheckCircle, XCircle,
  Star, Calendar, Award, Zap, Settings, Users, FileText,
  AlertCircle, RefreshCw, Edit, Trash2, MessageSquare,
  Wifi, WifiOff, ThumbsUp, ThumbsDown, Download, Printer,
  Share2, Bookmark, Eye, EyeOff, Lock, Unlock, Key,
  Home, Map, Truck, Video, Layers, Layout, Info,
  AlertTriangle, Check, Loader2, Camera, Image as ImageIcon,
  Link2, AtSign, Hash, FileSignature, Palette, Brush, Sparkles,
  Crown, Gem, Diamond, Gift, MessageSquare as MessageSquareIcon,
  Send, Paperclip, Smile, Grid, List, Filter,
  Search, MoreVertical, ChevronDown, ChevronUp, X,
  Building2, Shield as ShieldIcon, MapPinHouse, Globe2,
  Facebook, Instagram, Twitter, Youtube, Linkedin,
  ShieldCheck, ShieldAlert, Activity, TrendingUp,
  Calendar as CalendarIcon, Clock as ClockIcon,
  Map as MapIcon, Truck as TruckIcon, Zap as ZapIcon,
  PhoneCall, MailOpen, HeadphonesIcon, CreditCard,
  Landmark, Receipt, Store, Briefcase as BriefcaseIcon
} from 'lucide-react';

export default function ViewProfessionalPage({ params }) {
  const router = useRouter();
  const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
  const { id } = params;
  
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch professional details
  const fetchProfessional = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const query = new URLSearchParams({
        companyId: user.companyId,
        limit: '100'
      }).toString();
      
      const res = await fetch(`/api/bookingService/bookingmng?${query}`, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 403) throw new Error("You don't have permission to view this professional");
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        const found = data.data.find(p => p._id === id);
        if (found) {
          setProfessional(found);
        } else {
          setError('Professional not found');
        }
      } else {
        setError(data.error || 'Failed to fetch professional');
      }
    } catch (error) {
      console.error('Error fetching professional:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.companyId && id) {
      fetchProfessional();
    }
  }, [id, user]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      verified: { label: 'Verified', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      suspended: { label: 'Suspended', color: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statuses[status] || statuses.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'company': return <Building size={20} className="text-blue-600" />;
      case 'freelancer': return <Users size={20} className="text-green-600" />;
      case 'agency': return <Building size={20} className="text-purple-600" />;
      default: return <User size={20} className="text-gray-600" />;
    }
  };

  // Get service type badge
  const getServiceTypeBadge = (type) => {
    const types = {
      onsite: { label: 'Onsite', color: 'bg-blue-100 text-blue-800' },
      remote: { label: 'Remote', color: 'bg-purple-100 text-purple-800' },
      both: { label: 'Both', color: 'bg-green-100 text-green-800' },
      mobile: { label: 'Mobile', color: 'bg-orange-100 text-orange-800' }
    };
    const typeInfo = types[type] || types.onsite;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  // Get day label
  const getDayLabel = (day) => {
    const days = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return days[day] || day;
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading professional details...</p>
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
        <h2>Unable to load professional</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => router.back()} className="back-btn">
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button onClick={fetchProfessional} className="retry-btn">
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
            justify-content: center;
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

  if (!professional) {
    return (
      <div className="not-found-container">
        <AlertCircle size={48} className="not-found-icon" />
        <h2>Professional not found</h2>
        <p>The professional you're looking for doesn't exist or has been deleted.</p>
        <button onClick={() => router.push('/admin/bookingService/bookingmng')} className="back-btn">
          <ArrowLeft size={16} />
          Back to Professionals
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
            margin: 0 auto;
          }
          .back-btn:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{professional.businessName} | Professional Details | LFMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="view-professional-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => router.back()} className="back-button">
                <ArrowLeft size={20} />
                <span>Back to Professionals</span>
              </button>
              <div className="title-section">
                <div className="title-icon">
                  <Building size={32} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="page-title">{professional.businessName}</h1>
                  <p className="page-subtitle">{professional.tagline || 'No tagline provided'}</p>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <Link
                href={`/admin/bookingService/bookingmng/create?id=${professional._id}`}
                className="edit-btn"
              >
                <Edit size={18} />
                <span>Edit Professional</span>
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

        {/* Status Banner */}
        <div className="status-banner">
          <div className="status-item">
            <span className="status-label">Verification Status:</span>
            {getStatusBadge(professional.verificationStatus)}
          </div>
          <div className="status-item">
            <span className="status-label">Account Status:</span>
            <span className={`status-value ${professional.isActive ? 'active' : 'inactive'}`}>
              {professional.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {professional.isFeatured && (
            <div className="featured-badge">
              <Award size={14} />
              Featured
            </div>
          )}
          {professional.whatsappVerified && (
            <div className="whatsapp-badge">
              <Shield size={14} />
              WhatsApp Verified
            </div>
          )}
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
            className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact & Location
          </button>
          <button
            className={`tab ${activeTab === 'working' ? 'active' : ''}`}
            onClick={() => setActiveTab('working')}
          >
            Working Hours
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats & Settings
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
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <span className="status-label">Professional Type</span>
                    <span className="status-value capitalize">{professional.type}</span>
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-icon green">
                    <Tag size={24} />
                  </div>
                  <div>
                    <span className="status-label">Category</span>
                    <span className="status-value">{professional.category}</span>
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-icon orange">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <span className="status-label">Experience</span>
                    <span className="status-value">{professional.experience || 0} years</span>
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-icon purple">
                    <Users size={24} />
                  </div>
                  <div>
                    <span className="status-label">Services</span>
                    <span className="status-value">{professional.services?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              {professional.specialization?.length > 0 && (
                <div className="specializations-section">
                  <h3>Specializations</h3>
                  <div className="specializations-list">
                    {professional.specialization.map((spec, index) => (
                      <span key={index} className="specialization-tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Section */}
              <div className="rating-section">
                <h3>Rating & Reviews</h3>
                <div className="rating-grid">
                  <div className="rating-card">
                    <div className="rating-average">
                      <span className="rating-number">{professional.rating?.average?.toFixed(1) || '0.0'}</span>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={20}
                            className={star <= Math.round(professional.rating?.average || 0) ? 'star-filled' : 'star-empty'}
                          />
                        ))}
                      </div>
                      <span className="rating-total">{professional.rating?.totalReviews || 0} reviews</span>
                    </div>
                    <div className="rating-breakdown">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="breakdown-item">
                          <span className="breakdown-star">{star} ★</span>
                          <div className="breakdown-bar">
                            <div
                              className="breakdown-fill"
                              style={{
                                width: `${((professional.rating?.breakdown?.[star] || 0) / (professional.rating?.totalReviews || 1)) * 100}%`
                              }}
                            />
                          </div>
                          <span className="breakdown-count">{professional.rating?.breakdown?.[star] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              {professional.serviceAreas?.length > 0 && (
                <div className="service-areas-section">
                  <h3>Service Areas</h3>
                  <div className="service-areas-list">
                    {professional.serviceAreas.map((area, index) => (
                      <span key={index} className="service-area-item">
                        <MapPin size={14} />
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact & Location Tab */}
          {activeTab === 'contact' && (
            <div className="contact-tab">
              <div className="contact-grid">
                {/* Contact Details */}
                <div className="contact-card">
                  <h3>
                    <Phone size={18} />
                    Contact Details
                  </h3>
                  <div className="contact-details">
                    <div className="contact-item">
                      <Phone size={16} />
                      <div>
                        <span className="contact-label">Phone</span>
                        <span className="contact-value">{professional.phone}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <Mail size={16} />
                      <div>
                        <span className="contact-label">Email</span>
                        <span className="contact-value">{professional.email}</span>
                      </div>
                    </div>
                    {professional.whatsappBusinessId && (
                      <div className="contact-item">
                        <MessageSquare size={16} />
                        <div>
                          <span className="contact-label">WhatsApp Business</span>
                          <span className="contact-value">{professional.whatsappBusinessId}</span>
                          {professional.whatsappVerified && (
                            <span className="verified-badge">
                              <CheckCircle size={12} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="contact-card">
                  <h3>
                    <MapPin size={18} />
                    Address
                  </h3>
                  <div className="address-details">
                    {professional.address?.street && (
                      <p className="address-line">{professional.address.street}</p>
                    )}
                    <p className="address-line">
                      {[
                        professional.address?.city,
                        professional.address?.state,
                        professional.address?.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                    {professional.address?.country && (
                      <p className="address-line">{professional.address.country}</p>
                    )}
                    {!professional.address?.street && !professional.address?.city && (
                      <p className="no-address">No address provided</p>
                    )}
                  </div>
                </div>

                {/* Service Type */}
                <div className="contact-card">
                  <h3>
                    <Globe size={18} />
                    Service Configuration
                  </h3>
                  <div className="service-config">
                    <div className="config-item">
                      <span className="config-label">Service Type</span>
                      {getServiceTypeBadge(professional.serviceType)}
                    </div>
                    <div className="config-item">
                      <span className="config-label">Service Areas</span>
                      <span className="config-value">{professional.serviceAreas?.length || 0} areas</span>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                {Object.values(professional.socialMedia || {}).some(v => v) && (
                  <div className="contact-card">
                    <h3>
                      <Globe2 size={18} />
                      Social Media
                    </h3>
                    <div className="social-links">
                      {professional.socialMedia?.website && (
                        <a href={professional.socialMedia.website} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Globe2 size={16} />
                          Website
                        </a>
                      )}
                      {professional.socialMedia?.facebook && (
                        <a href={professional.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Facebook size={16} />
                          Facebook
                        </a>
                      )}
                      {professional.socialMedia?.instagram && (
                        <a href={professional.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Instagram size={16} />
                          Instagram
                        </a>
                      )}
                      {professional.socialMedia?.linkedin && (
                        <a href={professional.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Linkedin size={16} />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working Hours Tab */}
          {activeTab === 'working' && (
            <div className="working-tab">
              <div className="working-hours-grid">
                {professional.workingHours?.map((day) => (
                  <div key={day.day} className="working-hour-card">
                    <div className="day-header">
                      <span className="day-name">{getDayLabel(day.day)}</span>
                      {!day.isAvailable && (
                        <span className="closed-badge">Closed</span>
                      )}
                    </div>
                    {day.isAvailable ? (
                      <div className="time-range">
                        <Clock size={16} />
                        <span>{formatTime(day.startTime)} - {formatTime(day.endTime)}</span>
                      </div>
                    ) : (
                      <div className="closed-message">
                        <XCircle size={16} />
                        <span>Not Available</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats & Settings Tab */}
          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div className="stats-grid">
                {/* Booking Stats */}
                <div className="stats-card">
                  <h3>Booking Statistics</h3>
                  <div className="stats-list">
                    <div className="stat-row">
                      <span className="stat-name">Total Bookings</span>
                      <span className="stat-number">{professional.totalBookings || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-name">Completed Bookings</span>
                      <span className="stat-number">{professional.completedBookings || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-name">Completion Rate</span>
                      <span className="stat-number">
                        {professional.totalBookings
                          ? Math.round((professional.completedBookings / professional.totalBookings) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Settings */}
                <div className="stats-card">
                  <h3>Booking Settings</h3>
                  <div className="stats-list">
                    <div className="stat-row">
                      <span className="stat-name">Booking Buffer</span>
                      <span className="stat-number">{professional.bookingBuffer || 15} minutes</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-name">Max Daily Bookings</span>
                      <span className="stat-number">{professional.maxDailyBookings || 10}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-name">Cancellation Policy</span>
                      <span className="stat-number capitalize">{professional.cancellationPolicy || 'moderate'}</span>
                    </div>
                  </div>
                </div>

                {/* Auto Reply Settings */}
                <div className="stats-card">
                  <h3>Auto Reply Settings</h3>
                  <div className="stats-list">
                    <div className="stat-row">
                      <span className="stat-name">Auto Reply</span>
                      <span className="stat-number">
                        {professional.autoReplyEnabled ? (
                          <span className="enabled-badge">Enabled</span>
                        ) : (
                          <span className="disabled-badge">Disabled</span>
                        )}
                      </span>
                    </div>
                    {professional.autoReplyEnabled && professional.autoReplyMessage && (
                      <div className="auto-reply-message">
                        <span className="message-label">Message:</span>
                        <p className="message-text">{professional.autoReplyMessage}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="stats-card">
                  <h3>Documents</h3>
                  <div className="documents-list">
                    {professional.documents?.idProof && (
                      <div className="document-item">
                        <FileText size={16} />
                        <span>ID Proof</span>
                        <span className="document-status uploaded">Uploaded</span>
                      </div>
                    )}
                    {professional.documents?.qualificationProof && (
                      <div className="document-item">
                        <FileText size={16} />
                        <span>Qualification</span>
                        <span className="document-status uploaded">Uploaded</span>
                      </div>
                    )}
                    {professional.documents?.license && (
                      <div className="document-item">
                        <FileText size={16} />
                        <span>License</span>
                        <span className="document-status uploaded">Uploaded</span>
                      </div>
                    )}
                    {!professional.documents?.idProof && !professional.documents?.qualificationProof && !professional.documents?.license && (
                      <p className="no-documents">No documents uploaded</p>
                    )}
                  </div>
                </div>

                {/* Meta Information */}
                <div className="stats-card">
                  <h3>Meta Information</h3>
                  <div className="stats-list">
                    <div className="stat-row">
                      <span className="stat-name">Joined Date</span>
                      <span className="stat-number">{formatDate(professional.createdAt)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-name">Last Active</span>
                      <span className="stat-number">{formatDate(professional.lastActive) || 'Never'}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-name">Last Updated</span>
                      <span className="stat-number">{formatDate(professional.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .view-professional-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .view-professional-page {
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

        /* Status Banner */
        .status-banner {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .status-value {
          font-weight: 600;
        }

        .status-value.active {
          color: #10b981;
        }

        .status-value.inactive {
          color: #ef4444;
        }

        .featured-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 9999px;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .whatsapp-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 9999px;
          color: #059669;
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
          overflow-x: auto;
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
          white-space: nowrap;
          min-width: fit-content;
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
          text-transform: capitalize;
        }

        /* Specializations Section */
        .specializations-section {
          margin-bottom: 2rem;
        }

        .specializations-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 1rem 0;
        }

        .specializations-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .specialization-tag {
          padding: 0.375rem 0.75rem;
          background: #f1f5f9;
          color: #334155;
          border-radius: 9999px;
          font-size: 0.875rem;
        }

        /* Rating Section */
        .rating-section {
          margin-bottom: 2rem;
        }

        .rating-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 1rem 0;
        }

        .rating-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .rating-grid {
            grid-template-columns: 1fr;
          }
        }

        .rating-card {
          padding: 1.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .rating-average {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .rating-number {
          display: block;
          font-size: 3rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .rating-stars {
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .star-filled {
          color: #f59e0b;
          fill: #f59e0b;
        }

        .star-empty {
          color: #d1d5db;
        }

        .rating-total {
          color: #64748b;
          font-size: 0.875rem;
        }

        .rating-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .breakdown-star {
          min-width: 2rem;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .breakdown-bar {
          flex: 1;
          height: 0.5rem;
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 9999px;
        }

        .breakdown-count {
          min-width: 2rem;
          font-size: 0.875rem;
          color: #6b7280;
          text-align: right;
        }

        /* Service Areas Section */
        .service-areas-section {
          margin-bottom: 2rem;
        }

        .service-areas-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 1rem 0;
        }

        .service-areas-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .service-area-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          background: #f1f5f9;
          color: #334155;
          border-radius: 9999px;
          font-size: 0.875rem;
        }

        /* Contact Tab */
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        .contact-card {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .contact-card h3 {
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

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .contact-item svg {
          flex-shrink: 0;
          color: #9ca3af;
        }

        .contact-item div {
          flex: 1;
        }

        .contact-label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.125rem;
        }

        .contact-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.125rem;
          margin-left: 0.5rem;
          padding: 0.125rem 0.375rem;
          background: #ecfdf5;
          color: #059669;
          font-size: 0.625rem;
          font-weight: 600;
          border-radius: 9999px;
        }

        .address-details {
          line-height: 1.6;
        }

        .address-line {
          color: #1e293b;
          font-size: 0.875rem;
          margin: 0 0 0.25rem 0;
        }

        .no-address {
          color: #94a3b8;
          font-style: italic;
          margin: 0;
        }

        .service-config {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .config-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .config-label {
          font-size: 0.813rem;
          color: #64748b;
        }

        .config-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        .social-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #334155;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .social-link:hover {
          background: #f8fafc;
          border-color: #3b82f6;
        }

        /* Working Hours Tab */
        .working-hours-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .working-hours-grid {
            grid-template-columns: 1fr;
          }
        }

        .working-hour-card {
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .day-name {
          font-weight: 600;
          color: #0f172a;
        }

        .closed-badge {
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 9999px;
        }

        .time-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #334155;
          font-size: 0.875rem;
        }

        .time-range svg {
          color: #9ca3af;
        }

        .closed-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        /* Stats Tab */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stats-card {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .stats-card h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-name {
          font-size: 0.813rem;
          color: #64748b;
        }

        .stat-number {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .enabled-badge {
          padding: 0.125rem 0.375rem;
          background: #ecfdf5;
          color: #059669;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .disabled-badge {
          padding: 0.125rem 0.375rem;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .auto-reply-message {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }

        .message-label {
          display: block;
          font-size: 0.688rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .message-text {
          font-size: 0.813rem;
          color: #1e293b;
          margin: 0;
          line-height: 1.5;
        }

        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .document-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }

        .document-item svg {
          color: #9ca3af;
        }

        .document-item span:first-of-type {
          flex: 1;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .document-status {
          font-size: 0.688rem;
          font-weight: 500;
          padding: 0.125rem 0.375rem;
          background: #ecfdf5;
          color: #059669;
          border-radius: 9999px;
        }

        .no-documents {
          color: #94a3b8;
          font-style: italic;
          margin: 0;
        }

        /* Tag icon for category (add this to fix missing Tag import) */
        .tag-icon {
          color: currentColor;
        }
      `}</style>
    </>
  );
}