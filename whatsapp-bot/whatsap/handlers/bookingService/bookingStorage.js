// whatsapp-bot/whatsapp/handlers/bookingService/bookingStorage.js
// PURPOSE: ONLY this file saves to Booking model
// UPDATED: Fixed clientId ObjectId issue - using customerPhone instead

import bookingApiService from '../../../services/booking-api.js';
import { calculateEndTime, generateBookingNumber } from './bookingUtils.js';

/**
 * Save booking to database
 * THIS IS THE ONLY FUNCTION THAT WRITES TO BOOKING MODEL
 * UPDATED: Uses customerPhone instead of clientId (fixes ObjectId casting error)
 */
export async function saveBooking(userSession, bookingData, paymentRequired = false) {
    try {
        const cleanPhone = userSession.cleanPhone;
        const whatsappId = userSession.whatsappId;

        // Generate booking number
        const bookingNumber = generateBookingNumber();

        // Calculate end time based on service duration
        const endTime = calculateEndTime(
            bookingData.time, 
            bookingData.serviceDuration || 60
        );

        console.log('📝 Preparing booking data:', {
            customerName: bookingData.customerName,
            customerPhone: cleanPhone,
            service: bookingData.serviceName,
            date: bookingData.date,
            time: bookingData.time,
            businessId: bookingData.businessId
        });

        // Prepare booking data for storage - FIXED: Removed clientId, using customerPhone instead
        const bookingToSave = {
            // Identification
            bookingNumber: bookingNumber,
            
            // REMOVED: clientId - was causing ObjectId casting error
            // Using customerPhone and customerName instead
            
            // Business and service references
            professionalId: bookingData.businessId, // Business ID from selected service
            serviceId: bookingData.serviceId,
            
            // Service snapshot (from Service model)
            serviceName: bookingData.serviceName,
            serviceDuration: bookingData.serviceDuration,
            servicePrice: bookingData.servicePrice,
            selectedAddons: bookingData.addons || [],
            selectedVariation: bookingData.selectedVariation || null,
            
            // Scheduling (from user input + validation)
            scheduledDate: bookingData.date,
            startTime: bookingData.time,
            endTime: endTime,
            timezone: 'Asia/Kolkata',
            
            // Location - Simplified
            locationType: 'professional_address',
            address: 'Professional\'s address',
            virtualLink: '',
            
            // Status - based on payment requirement
            status: paymentRequired ? 'pending' : 'confirmed',
            
            // Payment - based on admin setting
            totalAmount: bookingData.totalAmount || bookingData.servicePrice,
            paymentStatus: paymentRequired ? 'pending' : 'paid',
            paymentMethod: paymentRequired ? '' : 'none',
            paidAmount: paymentRequired ? 0 : bookingData.totalAmount,
            
            // Communication
            clientNotes: bookingData.specialRequests || '',
            
            // WhatsApp tracking
            bookingSource: 'whatsapp',
            whatsappSessionId: whatsappId,
            whatsappMessageId: '',
            
            // Customer details - FIXED: Using these instead of clientId
            customerName: bookingData.customerName,
            customerPhone: cleanPhone,
            
            // Business name from bookingData
            businessName: bookingData.businessName || '',
            
            // Metadata
            bookedAt: new Date().toISOString()
        };

        // Log booking data for debugging
        console.log('📦 Saving booking:', {
            bookingNumber,
            customerName: bookingData.customerName,
            customerPhone: cleanPhone,
            service: bookingData.serviceName,
            date: bookingData.date,
            time: bookingData.time,
            businessId: bookingData.businessId
        });

        // Call API to save to Booking model
        const savedBooking = await bookingApiService.createBooking(bookingToSave);
        
        if (!savedBooking) {
            throw new Error('Failed to save booking');
        }

        console.log(`✅ Booking saved successfully: ${bookingNumber} for ${bookingData.customerName}`);

        return {
            success: true,
            booking: savedBooking,
            bookingNumber: bookingNumber,
            message: paymentRequired ? 
                'Booking created. Payment required.' : 
                'Booking confirmed successfully!'
        };

    } catch (error) {
        console.error('❌ Save booking error:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to save booking. Please try again.'
        };
    }
}

/**
 * Cancel user's booking
 * Updates existing booking in Booking model
 */
export async function cancelUserBooking(bookingId, reason) {
    try {
        if (!bookingId) {
            throw new Error('Booking ID required');
        }

        console.log(`🔄 Cancelling booking: ${bookingId}, Reason: ${reason}`);

        // Call API to update booking status
        const cancelledBooking = await bookingApiService.cancelBooking(bookingId, reason);

        if (!cancelledBooking) {
            throw new Error('Failed to cancel booking');
        }

        console.log(`✅ Booking cancelled: ${bookingId}`);

        return {
            success: true,
            booking: cancelledBooking,
            message: 'Booking cancelled successfully'
        };

    } catch (error) {
        console.error('❌ Cancel booking error:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to cancel booking'
        };
    }
}

/**
 * Update booking payment status
 * Updates payment info in Booking model
 */
export async function updateBookingPayment(bookingId, paymentData) {
    try {
        if (!bookingId) {
            throw new Error('Booking ID required');
        }

        console.log(`💰 Updating payment for booking: ${bookingId}`);

        // Prepare payment update
        const updateData = {
            paymentStatus: 'paid',
            paidAmount: paymentData.amount,
            paymentMethod: paymentData.method || 'online',
            transactionId: paymentData.transactionId,
            status: 'confirmed',
            confirmedAt: new Date().toISOString()
        };

        // Call API to update booking
        const response = await bookingApiService.client.patch(
            `/api/bookingService/bookings?id=${bookingId}`,
            updateData
        );

        const updatedBooking = bookingApiService._extractData(response.data);

        console.log(`✅ Booking payment updated: ${bookingId}`);

        return {
            success: true,
            booking: updatedBooking,
            message: 'Payment verified and booking confirmed'
        };

    } catch (error) {
        console.error('❌ Update booking payment error:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to update payment status'
        };
    }
}

/**
 * Get booking details by ID
 */
export async function getBookingById(bookingId) {
    try {
        if (!bookingId) return null;
        
        const booking = await bookingApiService.getBookingById(bookingId);
        return booking;
        
    } catch (error) {
        console.error('❌ Get booking error:', error);
        return null;
    }
}

/**
 * Get booking by booking number
 */
export async function getBookingByNumber(bookingNumber) {
    try {
        if (!bookingNumber) return null;
        
        const booking = await bookingApiService.getBookingByNumber(bookingNumber);
        return booking;
        
    } catch (error) {
        console.error('❌ Get booking by number error:', error);
        return null;
    }
}

/**
 * Add reminder sent timestamp to booking
 */
export async function markReminderSent(bookingId) {
    try {
        if (!bookingId) {
            throw new Error('Booking ID required');
        }

        const response = await bookingApiService.client.patch(
            `/api/bookingService/bookings?id=${bookingId}`,
            { reminderSentAt: new Date().toISOString() }
        );

        const updatedBooking = bookingApiService._extractData(response.data);

        console.log(`✅ Reminder marked as sent for booking: ${bookingId}`);

        return {
            success: true,
            booking: updatedBooking
        };

    } catch (error) {
        console.error('❌ Mark reminder sent error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}