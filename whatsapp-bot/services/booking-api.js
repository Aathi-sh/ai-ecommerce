
// whatsapp-bot/services/booking-api.js
// UPDATED: Full multi-tenant support with companyId in all API calls

import axios from 'axios';

class BookingApiService {
    constructor() {
        this.baseURL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Request interceptor with company context
        this.client.interceptors.request.use(
            (config) => {
                console.log(`📅 Booking API: ${config.method?.toUpperCase()} ${config.url}`);
                
                // Log company context if present
                if (config.params?.companyId) {
                    console.log(`🏢 Company: ${config.params.companyId}`);
                }
                if (config.data?.companyId) {
                    console.log(`🏢 Company in body: ${config.data.companyId}`);
                }
                
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ Booking API Response: ${response.status}`);
                return response;
            },
            (error) => {
                console.error('❌ Booking API Error:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.message,
                    companyId: error.config?.params?.companyId || error.config?.data?.companyId
                });
                return Promise.reject(error);
            }
        );
    }

    // ========== UTILITY METHODS ==========

    /**
     * Extract data from API response
     * Handles different response formats:
     * - { success: true, data: {...} }
     * - { data: {...} }
     * - Direct object
     */
    _extractData(responseData) {
        if (!responseData) return null;
        
        // If the API returns { success: true, data: {...} }
        if (responseData.success && responseData.data !== undefined) {
            return responseData.data;
        }
        
        // If the API returns { data: {...} }
        if (responseData.data !== undefined) {
            return responseData.data;
        }
        
        // If the API returns the object directly
        return responseData;
    }

    /**
     * Ensure response is an array
     */
    _ensureArray(responseData) {
        if (!responseData) return [];
        
        const extracted = this._extractData(responseData);
        
        if (Array.isArray(extracted)) {
            return extracted;
        }
        
        if (extracted && typeof extracted === 'object') {
            return [extracted];
        }
        
        return [];
    }

    /**
     * Clean phone number with multi-tenant support
     * @param {string} phoneNumber - Raw phone number
     * @returns {string} Cleaned phone number
     */
    cleanPhoneNumber(phoneNumber) {
        if (!phoneNumber) return '';
        
        if (phoneNumber.includes('@')) {
            const numberPart = phoneNumber.split('@')[0];
            const digits = numberPart.replace(/\D/g, '');
            
            if (digits.length === 12 && digits.startsWith('91')) {
                return digits.substring(2);
            } else if (digits.length === 10) {
                return digits;
            } else if (digits.length > 10) {
                return digits.slice(-10);
            }
            return this.cleanPhoneNumber(numberPart);
        }
        
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return cleaned.substring(2);
        } else if (cleaned.length === 10) {
            return cleaned;
        } else if (cleaned.length > 10) {
            if (cleaned.startsWith('91')) {
                return cleaned.substring(2, 12);
            }
            return cleaned.slice(-10);
        }
        
        return cleaned;
    }

    /**
     * Safe number parsing
     */
    safeNumber(value, defaultValue = 0) {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Safe to fixed with 2 decimals
     */
    safeToFixed(value, digits = 2) {
        const num = this.safeNumber(value);
        return num.toFixed(digits);
    }

    /**
     * Generate booking number with company prefix
     * @param {string} companyId - Company ID for prefix
     * @returns {string} Booking number with company prefix
     */
    _generateBookingNumber(companyId = null) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(10000 + Math.random() * 90000);
        
        // Add company prefix for multi-tenant isolation
        if (companyId) {
            const companyPrefix = String(companyId).substring(0, 4).toUpperCase();
            return `BK-${companyPrefix}-${year}${month}${day}-${random}`;
        }
        
        return `BK-${year}${month}${day}-${random}`;
    }

    // ========== SERVICE MODEL APIs (READ ONLY) WITH COMPANY CONTEXT ==========

    /**
     * Get all active services for a company
     * Used in: Show available services to user (like products in e-commerce)
     * @param {Object} filters - Query filters
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getServices(filters = {}, companyId = null) {
        try {
            const params = new URLSearchParams({
                isActive: true,
                ...filters
            });
            
            if (companyId) {
                params.append('companyId', companyId);
                console.log(`🏢 Fetching services for company: ${companyId}`);
            }
            
            const response = await this.client.get(`/api/bookingService/service?${params}`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get services error:', error);
            return [];
        }
    }

    /**
     * Get service by ID with company validation
     * Used in: Validation - Get service details (duration, price, professionalId)
     * @param {string} serviceId - Service ID
     * @param {string} companyId - Company ID for validation
     */
    async getServiceById(serviceId, companyId = null) {
        try {
            if (!serviceId) throw new Error('Service ID required');
            
            console.log(`🔍 Fetching service by ID: ${serviceId} for company: ${companyId || 'any'}`);
            
            let url = `/api/bookingService/service?id=${serviceId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            
            // Log full response for debugging
            console.log('📦 Service API response status:', response.status);
            
            // YOUR API RETURNS: { success: true, data: [serviceObject], pagination: {...} }
            if (response.data?.success && Array.isArray(response.data.data)) {
                const serviceData = response.data.data[0]; // Get the first service from array
                
                if (!serviceData) {
                    console.error('❌ No service found in data array');
                    return null;
                }
                
                // ✅ Verify service belongs to correct company
                if (companyId && serviceData.companyId && serviceData.companyId.toString() !== companyId.toString()) {
                    console.log(`⚠️ Service ${serviceId} does not belong to company ${companyId}`);
                    return null;
                }
                
                console.log('✅ Service data extracted:', {
                    id: serviceData._id,
                    name: serviceData.name,
                    isActive: serviceData.isActive,
                    professionalId: serviceData.professionalId,
                    companyId: serviceData.companyId,
                    hasProfessionalId: !!serviceData.professionalId,
                    duration: serviceData.duration,
                    basePrice: serviceData.basePrice
                });
                
                return serviceData;
            }
            
            // Fallback: Try to extract using utility method
            const extracted = this._extractData(response.data);
            
            // If extracted is an array, take first element
            if (Array.isArray(extracted)) {
                const serviceData = extracted[0];
                if (serviceData) {
                    // ✅ Verify service belongs to correct company
                    if (companyId && serviceData.companyId && serviceData.companyId.toString() !== companyId.toString()) {
                        console.log(`⚠️ Service ${serviceId} does not belong to company ${companyId}`);
                        return null;
                    }
                    
                    console.log('✅ Service data extracted from array:', {
                        id: serviceData._id,
                        name: serviceData.name,
                        isActive: serviceData.isActive,
                        professionalId: serviceData.professionalId,
                        companyId: serviceData.companyId,
                        hasProfessionalId: !!serviceData.professionalId
                    });
                    return serviceData;
                }
            }
            
            // If extracted is an object, return it directly
            if (extracted && typeof extracted === 'object') {
                // ✅ Verify service belongs to correct company
                if (companyId && extracted.companyId && extracted.companyId.toString() !== companyId.toString()) {
                    console.log(`⚠️ Service ${serviceId} does not belong to company ${companyId}`);
                    return null;
                }
                
                console.log('✅ Service data extracted as object:', {
                    id: extracted._id,
                    name: extracted.name,
                    isActive: extracted.isActive,
                    professionalId: extracted.professionalId,
                    companyId: extracted.companyId,
                    hasProfessionalId: !!extracted.professionalId
                });
                return extracted;
            }
            
            console.error('❌ No valid service data found');
            return null;
            
        } catch (error) {
            console.error('❌ Get service error:', error);
            return null;
        }
    }

    /**
     * Get services by category with company filter
     * Used in: Category-based filtering
     * @param {string} category - Category name
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getServicesByCategory(category, companyId = null) {
        try {
            let url = `/api/bookingService/service?category=${category}&isActive=true`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get services by category error:', error);
            return [];
        }
    }

    // ========== BOOKINGMNG MODEL APIs (READ ONLY) WITH COMPANY CONTEXT ==========

    /**
     * Get all active professionals/companies for a company
     * Used in: Admin panel - List all professionals
     * @param {Object} filters - Query filters
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getProfessionals(filters = {}, companyId = null) {
        try {
            const params = new URLSearchParams({
                isActive: true,
                verificationStatus: 'verified',
                ...filters
            });
            
            if (companyId) {
                params.append('companyId', companyId);
            }
            
            const response = await this.client.get(`/api/bookingService/bookingmng?${params}`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get professionals error:', error);
            return [];
        }
    }

    /**
     * Get professional by ID with company validation
     * Used in: Validation - Check working hours, buffer, max bookings
     * @param {string} professionalId - Professional ID
     * @param {string} companyId - Company ID for validation
     */
    async getProfessionalById(professionalId, companyId = null) {
        try {
            if (!professionalId) throw new Error('Professional ID required');
            
            console.log(`🔍 Fetching professional by ID: ${professionalId} for company: ${companyId || 'any'}`);
            
            let url = `/api/bookingService/bookingmng?id=${professionalId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            const professionalData = this._extractData(response.data);
            
            if (!professionalData) {
                console.error('❌ No professional data found');
                return null;
            }
            
            // Handle both array and single object responses
            const professional = Array.isArray(professionalData) ? professionalData[0] : professionalData;
            
            // ✅ Verify professional belongs to correct company
            if (companyId && professional.companyId && professional.companyId.toString() !== companyId.toString()) {
                console.log(`⚠️ Professional ${professionalId} does not belong to company ${companyId}`);
                return null;
            }
            
            console.log('✅ Professional found:', professional?.businessName);
            
            return professional;
            
        } catch (error) {
            console.error('❌ Get professional error:', error);
            return null;
        }
    }

    /**
     * Get professionals by category with company filter
     * @param {string} category - Category name
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getProfessionalsByCategory(category, companyId = null) {
        try {
            let url = `/api/bookingService/bookingmng?category=${category}&isActive=true&verificationStatus=verified`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get professionals by category error:', error);
            return [];
        }
    }

    /**
     * Get professionals by location with company filter
     * @param {string} city - City name
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getProfessionalsByLocation(city, companyId = null) {
        try {
            let url = `/api/bookingService/bookingmng?address.city=${city}&isActive=true`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get professionals by location error:', error);
            return [];
        }
    }

    /**
     * Get professional's working hours with company validation
     * @param {string} professionalId - Professional ID
     * @param {string} companyId - Company ID for validation
     */
    async getWorkingHours(professionalId, companyId = null) {
        try {
            const professional = await this.getProfessionalById(professionalId, companyId);
            return professional?.workingHours || [];
        } catch (error) {
            console.error('❌ Get working hours error:', error);
            return [];
        }
    }

    // ========== BOOKING MODEL APIs (READ + WRITE) WITH COMPANY CONTEXT ==========

    /**
     * Get bookings for a professional on a specific date with company validation
     * Used in: Availability validation - Check existing bookings
     * @param {string} professionalId - Professional ID
     * @param {string} date - Date string
     * @param {string} companyId - Company ID for validation
     */
    async getBookingsForDate(professionalId, date, companyId = null) {
        try {
            if (!professionalId || !date) return [];
            
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            let url = `/api/bookingService/bookings?professionalId=${professionalId}&scheduledDate[gte]=${startDate.toISOString()}&scheduledDate[lte]=${endDate.toISOString()}&status[ne]=cancelled`;
            
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get bookings for date error:', error);
            return [];
        }
    }

    /**
     * Get booking count for a professional on a specific date with company validation
     * Used in: Max daily bookings validation
     * @param {string} professionalId - Professional ID
     * @param {string} date - Date string
     * @param {string} companyId - Company ID for validation
     */
    async getBookingsCount(professionalId, date, companyId = null) {
        try {
            const bookings = await this.getBookingsForDate(professionalId, date, companyId);
            return bookings.length;
        } catch (error) {
            console.error('❌ Get bookings count error:', error);
            return 0;
        }
    }

    /**
     * Get bookings for a specific date and time range with company validation
     * @param {string} professionalId - Professional ID
     * @param {string} date - Date string
     * @param {string} startTime - Start time
     * @param {string} endTime - End time
     * @param {string} companyId - Company ID for validation
     */
    async getBookingsForDateTime(professionalId, date, startTime, endTime, companyId = null) {
        try {
            const startDate = new Date(date);
            startDate.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0, 0);
            const endDate = new Date(date);
            endDate.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0, 0);
            
            let url = `/api/bookingService/bookings?professionalId=${professionalId}&scheduledDate[gte]=${startDate.toISOString()}&scheduledDate[lte]=${endDate.toISOString()}&status[ne]=cancelled`;
            
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get bookings for date time error:', error);
            return [];
        }
    }

    /**
     * Check if time slot is available with company validation
     * Used in: Slot availability validation
     * @param {string} professionalId - Professional ID
     * @param {string} date - Date string
     * @param {string} startTime - Start time
     * @param {string} endTime - End time
     * @param {string} companyId - Company ID for validation
     */
    async isTimeSlotAvailable(professionalId, date, startTime, endTime, companyId = null) {
        try {
            const payload = {
                professionalId,
                date,
                startTime,
                endTime
            };
            
            if (companyId) {
                payload.companyId = companyId;
            }
            
            const response = await this.client.post('/api/bookingService/bookings/check-availability', payload);
            return this._extractData(response.data) || { available: false };
        } catch (error) {
            console.error('❌ Check time slot error:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Get client's bookings with company filter
     * Used in: "MyBookings" command
     * @param {string} customerPhone - Customer phone number
     * @param {string} status - Booking status filter
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getClientBookings(customerPhone, status = 'all', companyId = null) {
        try {
            if (!customerPhone) return [];
            
            const cleanPhone = this.cleanPhoneNumber(customerPhone);
            
            let url = `/api/bookingService/bookings?customerPhone=${cleanPhone}`;
            if (status !== 'all') {
                url += `&status=${status}`;
            }
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            url += '&sort=scheduledDate&order=1';
            
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get client bookings error:', error);
            return [];
        }
    }

    /**
     * Get upcoming bookings for client with company filter
     * Used in: "MyBookings" - Show future appointments
     * @param {string} customerPhone - Customer phone number
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getUpcomingClientBookings(customerPhone, companyId = null) {
        try {
            const today = new Date().toISOString();
            const cleanPhone = this.cleanPhoneNumber(customerPhone);
            
            let url = `/api/bookingService/bookings?customerPhone=${cleanPhone}&scheduledDate[gte]=${today}&status[in]=pending,confirmed,rescheduled&sort=scheduledDate&order=1`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get upcoming bookings error:', error);
            return [];
        }
    }

    /**
     * Get past bookings for client with company filter
     * Used in: "MyBookings" - Show history
     * @param {string} customerPhone - Customer phone number
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async getPastClientBookings(customerPhone, companyId = null) {
        try {
            const today = new Date().toISOString();
            const cleanPhone = this.cleanPhoneNumber(customerPhone);
            
            let url = `/api/bookingService/bookings?customerPhone=${cleanPhone}&scheduledDate[lt]=${today}&status[in]=completed,cancelled,no_show&sort=scheduledDate&order=-1`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get past bookings error:', error);
            return [];
        }
    }

    /**
     * Get booking by ID with company validation
     * @param {string} bookingId - Booking ID
     * @param {string} companyId - Company ID for validation
     */
    async getBookingById(bookingId, companyId = null) {
        try {
            if (!bookingId) return null;
            
            let url = `/api/bookingService/bookings?id=${bookingId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            const booking = this._extractData(response.data);
            
            // ✅ Verify booking belongs to correct company
            if (booking && companyId && booking.companyId && booking.companyId.toString() !== companyId.toString()) {
                console.log(`⚠️ Booking ${bookingId} does not belong to company ${companyId}`);
                return null;
            }
            
            return booking;
        } catch (error) {
            console.error('❌ Get booking error:', error);
            return null;
        }
    }

    /**
     * Get booking by number with company validation
     * @param {string} bookingNumber - Booking number
     * @param {string} companyId - Company ID for validation
     */
    async getBookingByNumber(bookingNumber, companyId = null) {
        try {
            if (!bookingNumber) return null;
            
            let url = `/api/bookingService/bookings?bookingNumber=${bookingNumber}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            const booking = this._extractData(response.data);
            
            // ✅ Verify booking belongs to correct company
            if (booking && companyId && booking.companyId && booking.companyId.toString() !== companyId.toString()) {
                console.log(`⚠️ Booking ${bookingNumber} does not belong to company ${companyId}`);
                return null;
            }
            
            return booking;
        } catch (error) {
            console.error('❌ Get booking by number error:', error);
            return null;
        }
    }

    /**
     * Create new booking with company context
     * THIS IS THE ONLY FUNCTION THAT WRITES TO DATABASE
     * Used in: Final step - Save booking to Booking model
     * @param {Object} bookingData - Booking data
     * @param {string} companyId - Company ID for multi-tenant isolation
     */
    async createBooking(bookingData, companyId = null) {
        try {
            // Validate required fields - Use customerName and customerPhone instead of clientId
            if (!bookingData.customerName || !bookingData.customerPhone || !bookingData.professionalId || !bookingData.serviceId) {
                console.error('❌ Missing required booking fields:', {
                    hasCustomerName: !!bookingData.customerName,
                    hasCustomerPhone: !!bookingData.customerPhone,
                    hasProfessionalId: !!bookingData.professionalId,
                    hasServiceId: !!bookingData.serviceId
                });
                throw new Error('Missing required booking fields');
            }

            console.log('📝 Creating booking:', {
                bookingNumber: bookingData.bookingNumber,
                serviceName: bookingData.serviceName,
                customerName: bookingData.customerName,
                customerPhone: bookingData.customerPhone,
                date: bookingData.scheduledDate,
                time: bookingData.startTime,
                businessId: bookingData.professionalId,
                companyId: companyId || 'default'
            });

            // ✅ Generate booking number with company prefix if not provided
            const finalBookingNumber = bookingData.bookingNumber || this._generateBookingNumber(companyId);

            // Format booking data according to schema with company context
            const formattedData = {
                // ✅ CRITICAL: Company context for multi-tenancy
                companyId: companyId || bookingData.companyId || 'default',
                
                // Identification
                bookingNumber: finalBookingNumber,
                
                // REMOVED: clientId - using customer fields instead
                professionalId: bookingData.professionalId,
                serviceId: bookingData.serviceId,
                
                // Service snapshot
                serviceName: bookingData.serviceName,
                serviceDuration: this.safeNumber(bookingData.serviceDuration),
                servicePrice: this.safeNumber(bookingData.servicePrice),
                selectedAddons: bookingData.selectedAddons || [],
                selectedVariation: bookingData.selectedVariation || null,
                
                // Scheduling
                scheduledDate: bookingData.scheduledDate,
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
                timezone: bookingData.timezone || 'Asia/Kolkata',
                
                // Location
                locationType: bookingData.locationType || 'professional_address',
                address: bookingData.address || '',
                virtualLink: bookingData.virtualLink || '',
                
                // Status
                status: bookingData.status || 'pending',
                
                // Payment
                totalAmount: this.safeNumber(bookingData.totalAmount),
                paymentStatus: bookingData.paymentStatus || 'pending',
                paymentMethod: bookingData.paymentMethod || '',
                paidAmount: this.safeNumber(bookingData.paidAmount, 0),
                
                // Communication
                clientNotes: bookingData.clientNotes || '',
                
                // WhatsApp tracking
                bookingSource: bookingData.bookingSource || 'whatsapp',
                whatsappSessionId: bookingData.whatsappSessionId || '',
                whatsappMessageId: bookingData.whatsappMessageId || '',
                
                // Customer details - these are now the primary identifiers
                customerName: bookingData.customerName,
                customerPhone: bookingData.customerPhone,
                
                // Business name (optional)
                businessName: bookingData.businessName || '',
                
                // Metadata
                bookedAt: new Date().toISOString()
            };

            console.log('📤 Sending booking data to API:', {
                bookingNumber: formattedData.bookingNumber,
                customerName: formattedData.customerName,
                customerPhone: formattedData.customerPhone,
                professionalId: formattedData.professionalId,
                serviceId: formattedData.serviceId,
                companyId: formattedData.companyId
            });

            const response = await this.client.post('/api/bookingService/bookings', formattedData);
            const savedBooking = this._extractData(response.data);
            
            console.log('✅ Booking created successfully:', {
                bookingNumber: savedBooking?.bookingNumber,
                customerName: savedBooking?.customerName,
                companyId: savedBooking?.companyId
            });
            
            return savedBooking;

        } catch (error) {
            console.error('❌ Create booking error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                companyId: companyId
            });
            throw new Error('Failed to create booking: ' + (error.message || 'Unknown error'));
        }
    }

    /**
     * Update booking status with company validation
     * Used in: Cancel booking, confirm booking
     * @param {string} bookingId - Booking ID
     * @param {string} status - New status
     * @param {string} reason - Cancellation reason
     * @param {string} companyId - Company ID for validation
     */
    async updateBookingStatus(bookingId, status, reason = '', companyId = null) {
        try {
            if (!bookingId || !status) throw new Error('Booking ID and status required');

            // First verify booking exists and belongs to company
            const booking = await this.getBookingById(bookingId, companyId);
            if (!booking) {
                throw new Error(`Booking ${bookingId} not found or does not belong to company`);
            }

            const updateData = {
                status,
                [`${status}At`]: new Date().toISOString(),
                companyId: companyId || booking.companyId
            };

            if (reason && status === 'cancelled') {
                updateData.cancellationReason = reason;
            }

            let url = `/api/bookingService/bookings?id=${bookingId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.patch(url, updateData);
            return this._extractData(response.data);
        } catch (error) {
            console.error('❌ Update booking status error:', error);
            throw new Error('Failed to update booking status');
        }
    }

    /**
     * Update booking payment with company validation
     * @param {string} bookingId - Booking ID
     * @param {Object} paymentData - Payment data
     * @param {string} companyId - Company ID for validation
     */
    async updateBookingPayment(bookingId, paymentData, companyId = null) {
        try {
            if (!bookingId) throw new Error('Booking ID required');

            // First verify booking exists and belongs to company
            const booking = await this.getBookingById(bookingId, companyId);
            if (!booking) {
                throw new Error(`Booking ${bookingId} not found or does not belong to company`);
            }

            const updateData = {
                paymentStatus: 'paid',
                paidAmount: paymentData.paidAmount || paymentData.amount,
                paymentMethod: paymentData.paymentMethod || 'online',
                transactionId: paymentData.transactionId,
                transactionReference: paymentData.reference,
                paymentVerifiedAt: new Date().toISOString(),
                paymentVerifiedBy: paymentData.verifiedBy || 'whatsapp_bot',
                status: 'confirmed',
                confirmedAt: new Date().toISOString(),
                companyId: companyId || booking.companyId
            };

            let url = `/api/bookingService/bookings?id=${bookingId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.patch(url, updateData);
            return this._extractData(response.data);
        } catch (error) {
            console.error('❌ Update booking payment error:', error);
            throw new Error('Failed to update booking payment');
        }
    }

    /**
     * Cancel booking with company validation
     * Used in: User-initiated cancellation
     * @param {string} bookingId - Booking ID
     * @param {string} reason - Cancellation reason
     * @param {string} companyId - Company ID for validation
     */
    async cancelBooking(bookingId, reason, companyId = null) {
        return this.updateBookingStatus(bookingId, 'cancelled', reason, companyId);
    }

    /**
     * Get all bookings for a company (admin use)
     * @param {string} companyId - Company ID
     * @param {Object} filters - Additional filters
     */
    async getCompanyBookings(companyId, filters = {}) {
        try {
            if (!companyId) return [];
            
            const params = new URLSearchParams({
                companyId,
                ...filters
            });
            
            const response = await this.client.get(`/api/bookingService/bookings?${params}`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get company bookings error:', error);
            return [];
        }
    }

    /**
     * Get booking statistics for a company
     * @param {string} companyId - Company ID
     * @param {string} timeframe - Timeframe (day/week/month)
     */
    async getBookingStats(companyId, timeframe = 'month') {
        try {
            const response = await this.client.get(`/api/bookingService/analytics?companyId=${companyId}&timeframe=${timeframe}`);
            return this._extractData(response.data) || {
                totalBookings: 0,
                confirmedBookings: 0,
                pendingBookings: 0,
                cancelledBookings: 0,
                totalRevenue: 0
            };
        } catch (error) {
            console.error('❌ Get booking stats error:', error);
            return {
                totalBookings: 0,
                confirmedBookings: 0,
                pendingBookings: 0,
                cancelledBookings: 0,
                totalRevenue: 0
            };
        }
    }
}

// Create and export singleton instance
const bookingApiService = new BookingApiService();
export default bookingApiService;