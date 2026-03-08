// whatsapp-bot/services/booking-api.js
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

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                console.log(`📅 Booking API: ${config.method?.toUpperCase()} ${config.url}`);
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
                    message: error.message
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

    safeNumber(value, defaultValue = 0) {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    safeToFixed(value, digits = 2) {
        const num = this.safeNumber(value);
        return num.toFixed(digits);
    }

    // ========== SERVICE MODEL APIs (READ ONLY) ==========

    /**
     * Get all active services
     * Used in: Show available services to user (like products in e-commerce)
     */
    async getServices(filters = {}) {
        try {
            const params = new URLSearchParams({
                isActive: true,
                ...filters
            });
            const response = await this.client.get(`/api/bookingService/service?${params}`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get services error:', error);
            return [];
        }
    }

    /**
     * Get service by ID
     * Used in: Validation - Get service details (duration, price, professionalId)
     */
async getServiceById(serviceId) {
    try {
        if (!serviceId) throw new Error('Service ID required');
        
        console.log(`🔍 Fetching service by ID: ${serviceId}`);
        
        const response = await this.client.get(`/api/bookingService/service?id=${serviceId}`);
        
        // Log full response for debugging
        console.log('📦 Service API response status:', response.status);
        
        // YOUR API RETURNS: { success: true, data: [serviceObject], pagination: {...} }
        if (response.data?.success && Array.isArray(response.data.data)) {
            const serviceData = response.data.data[0]; // Get the first service from array
            
            if (!serviceData) {
                console.error('❌ No service found in data array');
                return null;
            }
            
            console.log('✅ Service data extracted:', {
                id: serviceData._id,
                name: serviceData.name,
                isActive: serviceData.isActive,
                professionalId: serviceData.professionalId,
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
                console.log('✅ Service data extracted from array:', {
                    id: serviceData._id,
                    name: serviceData.name,
                    isActive: serviceData.isActive,
                    professionalId: serviceData.professionalId,
                    hasProfessionalId: !!serviceData.professionalId
                });
                return serviceData;
            }
        }
        
        // If extracted is an object, return it directly
        if (extracted && typeof extracted === 'object') {
            console.log('✅ Service data extracted as object:', {
                id: extracted._id,
                name: extracted.name,
                isActive: extracted.isActive,
                professionalId: extracted.professionalId,
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
     * Get services by category
     * Used in: Category-based filtering
     */
    async getServicesByCategory(category) {
        try {
            const response = await this.client.get(`/api/bookingService/service?category=${category}&isActive=true`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get services by category error:', error);
            return [];
        }
    }

    // ========== BOOKINGMNG MODEL APIs (READ ONLY) ==========

    /**
     * Get all active professionals/companies
     * Used in: Admin panel - List all professionals
     */
    async getProfessionals(filters = {}) {
        try {
            const params = new URLSearchParams({
                isActive: true,
                verificationStatus: 'verified',
                ...filters
            });
            const response = await this.client.get(`/api/bookingService/bookingmng?${params}`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get professionals error:', error);
            return [];
        }
    }

    /**
     * Get professional by ID
     * Used in: Validation - Check working hours, buffer, max bookings
     */
    async getProfessionalById(professionalId) {
        try {
            if (!professionalId) throw new Error('Professional ID required');
            
            console.log(`🔍 Fetching professional by ID: ${professionalId}`);
            
            const response = await this.client.get(`/api/bookingService/bookingmng?id=${professionalId}`);
            const professionalData = this._extractData(response.data);
            
            if (!professionalData) {
                console.error('❌ No professional data found');
                return null;
            }
            
            // Handle both array and single object responses
            const professional = Array.isArray(professionalData) ? professionalData[0] : professionalData;
            
            console.log('✅ Professional found:', professional?.businessName);
            
            return professional;
            
        } catch (error) {
            console.error('❌ Get professional error:', error);
            return null;
        }
    }

    /**
     * Get professionals by category
     * Used in: Category-based professional listing
     */
    async getProfessionalsByCategory(category) {
        try {
            const response = await this.client.get(`/api/bookingService/bookingmng?category=${category}&isActive=true&verificationStatus=verified`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get professionals by category error:', error);
            return [];
        }
    }

    /**
     * Get professionals by location
     * Used in: Location-based filtering
     */
    async getProfessionalsByLocation(city) {
        try {
            const response = await this.client.get(`/api/bookingService/bookingmng?address.city=${city}&isActive=true`);
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get professionals by location error:', error);
            return [];
        }
    }

    /**
     * Get professional's working hours
     * Used in: Availability calculation
     */
    async getWorkingHours(professionalId) {
        try {
            const professional = await this.getProfessionalById(professionalId);
            return professional?.workingHours || [];
        } catch (error) {
            console.error('❌ Get working hours error:', error);
            return [];
        }
    }

    // ========== BOOKING MODEL APIs (READ + WRITE) ==========

    /**
     * Get bookings for a professional on a specific date
     * Used in: Availability validation - Check existing bookings
     */
    async getBookingsForDate(professionalId, date) {
        try {
            if (!professionalId || !date) return [];
            
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            const response = await this.client.get(
                `/api/bookingService/bookings?professionalId=${professionalId}&scheduledDate[gte]=${startDate.toISOString()}&scheduledDate[lte]=${endDate.toISOString()}&status[ne]=cancelled`
            );
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get bookings for date error:', error);
            return [];
        }
    }

    /**
     * Get booking count for a professional on a specific date
     * Used in: Max daily bookings validation
     */
    async getBookingsCount(professionalId, date) {
        try {
            const bookings = await this.getBookingsForDate(professionalId, date);
            return bookings.length;
        } catch (error) {
            console.error('❌ Get bookings count error:', error);
            return 0;
        }
    }

    /**
     * Check if time slot is available
     * Used in: Slot availability validation
     */
    async isTimeSlotAvailable(professionalId, date, startTime, endTime) {
        try {
            const response = await this.client.post('/api/bookingService/bookings/check-availability', {
                professionalId,
                date,
                startTime,
                endTime
            });
            return this._extractData(response.data) || { available: false };
        } catch (error) {
            console.error('❌ Check time slot error:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Get client's bookings
     * Used in: "MyBookings" command
     */
    async getClientBookings(clientId, status = 'all') {
        try {
            if (!clientId) return [];
            
            let url = `/api/bookingService/bookings?clientId=${clientId}`;
            if (status !== 'all') {
                url += `&status=${status}`;
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
     * Get upcoming bookings for client
     * Used in: "MyBookings" - Show future appointments
     */
    async getUpcomingClientBookings(clientId) {
        try {
            const today = new Date().toISOString();
            const response = await this.client.get(
                `/api/bookingService/bookings?clientId=${clientId}&scheduledDate[gte]=${today}&status[in]=pending,confirmed,rescheduled&sort=scheduledDate&order=1`
            );
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get upcoming bookings error:', error);
            return [];
        }
    }

    /**
     * Get past bookings for client
     * Used in: "MyBookings" - Show history
     */
    async getPastClientBookings(clientId) {
        try {
            const today = new Date().toISOString();
            const response = await this.client.get(
                `/api/bookingService/bookings?clientId=${clientId}&scheduledDate[lt]=${today}&status[in]=completed,cancelled,no_show&sort=scheduledDate&order=-1`
            );
            return this._ensureArray(response.data);
        } catch (error) {
            console.error('❌ Get past bookings error:', error);
            return [];
        }
    }

    /**
     * Get booking by ID
     * Used in: View single booking details
     */
    async getBookingById(bookingId) {
        try {
            if (!bookingId) return null;
            const response = await this.client.get(`/api/bookingService/bookings?id=${bookingId}`);
            return this._extractData(response.data);
        } catch (error) {
            console.error('❌ Get booking error:', error);
            return null;
        }
    }

    /**
     * Get booking by number
     * Used in: Quick lookup by booking number
     */
    async getBookingByNumber(bookingNumber) {
        try {
            if (!bookingNumber) return null;
            const response = await this.client.get(`/api/bookingService/bookings?bookingNumber=${bookingNumber}`);
            return this._extractData(response.data);
        } catch (error) {
            console.error('❌ Get booking by number error:', error);
            return null;
        }
    }

    /**
     * Create new booking
     * THIS IS THE ONLY FUNCTION THAT WRITES TO DATABASE
     * Used in: Final step - Save booking to Booking model
     */
 async createBooking(bookingData) {
    try {
        // Validate required fields - UPDATED: Use customerName and customerPhone instead of clientId
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
            businessId: bookingData.professionalId
        });

        // Format booking data according to schema
        const formattedData = {
            // Identification
            bookingNumber: bookingData.bookingNumber || this._generateBookingNumber(),
            
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
            serviceId: formattedData.serviceId
        });

        const response = await this.client.post('/api/bookingService/bookings', formattedData);
        const savedBooking = this._extractData(response.data);
        
        console.log('✅ Booking created successfully:', {
            bookingNumber: savedBooking?.bookingNumber,
            customerName: savedBooking?.customerName
        });
        
        return savedBooking;

    } catch (error) {
        console.error('❌ Create booking error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw new Error('Failed to create booking: ' + (error.message || 'Unknown error'));
    }
}

    /**
     * Update booking status
     * Used in: Cancel booking, confirm booking
     */
    async updateBookingStatus(bookingId, status, reason = '') {
        try {
            if (!bookingId || !status) throw new Error('Booking ID and status required');

            const updateData = {
                status,
                [`${status}At`]: new Date().toISOString()
            };

            if (reason && status === 'cancelled') {
                updateData.cancellationReason = reason;
            }

            const response = await this.client.patch(`/api/bookingService/bookings?id=${bookingId}`, updateData);
            return this._extractData(response.data);
        } catch (error) {
            console.error('❌ Update booking status error:', error);
            throw new Error('Failed to update booking status');
        }
    }

    /**
     * Cancel booking
     * Used in: User-initiated cancellation
     */
    async cancelBooking(bookingId, reason) {
        return this.updateBookingStatus(bookingId, 'cancelled', reason);
    }

    // ========== PRIVATE METHODS ==========

    _generateBookingNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(10000 + Math.random() * 90000);
        return `BK-${year}${month}${day}-${random}`;
    }
}

// Create and export singleton instance
const bookingApiService = new BookingApiService();
export default bookingApiService;