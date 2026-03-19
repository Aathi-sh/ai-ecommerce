// // whatsapp-bot/whatsapp/handlers/bookingService/bookingStorage.js
// // PURPOSE: ONLY this file saves to Booking model
// // UPDATED: Fixed clientId ObjectId issue - using customerPhone instead

// import bookingApiService from '../../../services/booking-api.js';
// import { calculateEndTime, generateBookingNumber } from './bookingUtils.js';

// /**
//  * Save booking to database
//  * THIS IS THE ONLY FUNCTION THAT WRITES TO BOOKING MODEL
//  * UPDATED: Uses customerPhone instead of clientId (fixes ObjectId casting error)
//  */
// export async function saveBooking(userSession, bookingData, paymentRequired = false) {
//     try {
//         const cleanPhone = userSession.cleanPhone;
//         const whatsappId = userSession.whatsappId;

//         // Generate booking number
//         const bookingNumber = generateBookingNumber();

//         // Calculate end time based on service duration
//         const endTime = calculateEndTime(
//             bookingData.time, 
//             bookingData.serviceDuration || 60
//         );

//         console.log('📝 Preparing booking data:', {
//             customerName: bookingData.customerName,
//             customerPhone: cleanPhone,
//             service: bookingData.serviceName,
//             date: bookingData.date,
//             time: bookingData.time,
//             businessId: bookingData.businessId
//         });

//         // Prepare booking data for storage - FIXED: Removed clientId, using customerPhone instead
//         const bookingToSave = {
//             // Identification
//             bookingNumber: bookingNumber,
            
//             // REMOVED: clientId - was causing ObjectId casting error
//             // Using customerPhone and customerName instead
            
//             // Business and service references
//             professionalId: bookingData.businessId, // Business ID from selected service
//             serviceId: bookingData.serviceId,
            
//             // Service snapshot (from Service model)
//             serviceName: bookingData.serviceName,
//             serviceDuration: bookingData.serviceDuration,
//             servicePrice: bookingData.servicePrice,
//             selectedAddons: bookingData.addons || [],
//             selectedVariation: bookingData.selectedVariation || null,
            
//             // Scheduling (from user input + validation)
//             scheduledDate: bookingData.date,
//             startTime: bookingData.time,
//             endTime: endTime,
//             timezone: 'Asia/Kolkata',
            
//             // Location - Simplified
//             locationType: 'professional_address',
//             address: 'Professional\'s address',
//             virtualLink: '',
            
//             // Status - based on payment requirement
//             status: paymentRequired ? 'pending' : 'confirmed',
            
//             // Payment - based on admin setting
//             totalAmount: bookingData.totalAmount || bookingData.servicePrice,
//             paymentStatus: paymentRequired ? 'pending' : 'paid',
//             paymentMethod: paymentRequired ? '' : 'none',
//             paidAmount: paymentRequired ? 0 : bookingData.totalAmount,
            
//             // Communication
//             clientNotes: bookingData.specialRequests || '',
            
//             // WhatsApp tracking
//             bookingSource: 'whatsapp',
//             whatsappSessionId: whatsappId,
//             whatsappMessageId: '',
            
//             // Customer details - FIXED: Using these instead of clientId
//             customerName: bookingData.customerName,
//             customerPhone: cleanPhone,
            
//             // Business name from bookingData
//             businessName: bookingData.businessName || '',
            
//             // Metadata
//             bookedAt: new Date().toISOString()
//         };

//         // Log booking data for debugging
//         console.log('📦 Saving booking:', {
//             bookingNumber,
//             customerName: bookingData.customerName,
//             customerPhone: cleanPhone,
//             service: bookingData.serviceName,
//             date: bookingData.date,
//             time: bookingData.time,
//             businessId: bookingData.businessId
//         });

//         // Call API to save to Booking model
//         const savedBooking = await bookingApiService.createBooking(bookingToSave);
        
//         if (!savedBooking) {
//             throw new Error('Failed to save booking');
//         }

//         console.log(`✅ Booking saved successfully: ${bookingNumber} for ${bookingData.customerName}`);

//         return {
//             success: true,
//             booking: savedBooking,
//             bookingNumber: bookingNumber,
//             message: paymentRequired ? 
//                 'Booking created. Payment required.' : 
//                 'Booking confirmed successfully!'
//         };

//     } catch (error) {
//         console.error('❌ Save booking error:', error);
//         return {
//             success: false,
//             error: error.message,
//             message: 'Failed to save booking. Please try again.'
//         };
//     }
// }

// /**
//  * Cancel user's booking
//  * Updates existing booking in Booking model
//  */
// export async function cancelUserBooking(bookingId, reason) {
//     try {
//         if (!bookingId) {
//             throw new Error('Booking ID required');
//         }

//         console.log(`🔄 Cancelling booking: ${bookingId}, Reason: ${reason}`);

//         // Call API to update booking status
//         const cancelledBooking = await bookingApiService.cancelBooking(bookingId, reason);

//         if (!cancelledBooking) {
//             throw new Error('Failed to cancel booking');
//         }

//         console.log(`✅ Booking cancelled: ${bookingId}`);

//         return {
//             success: true,
//             booking: cancelledBooking,
//             message: 'Booking cancelled successfully'
//         };

//     } catch (error) {
//         console.error('❌ Cancel booking error:', error);
//         return {
//             success: false,
//             error: error.message,
//             message: 'Failed to cancel booking'
//         };
//     }
// }

// /**
//  * Update booking payment status
//  * Updates payment info in Booking model
//  */
// export async function updateBookingPayment(bookingId, paymentData) {
//     try {
//         if (!bookingId) {
//             throw new Error('Booking ID required');
//         }

//         console.log(`💰 Updating payment for booking: ${bookingId}`);

//         // Prepare payment update
//         const updateData = {
//             paymentStatus: 'paid',
//             paidAmount: paymentData.amount,
//             paymentMethod: paymentData.method || 'online',
//             transactionId: paymentData.transactionId,
//             status: 'confirmed',
//             confirmedAt: new Date().toISOString()
//         };

//         // Call API to update booking
//         const response = await bookingApiService.client.patch(
//             `/api/bookingService/bookings?id=${bookingId}`,
//             updateData
//         );

//         const updatedBooking = bookingApiService._extractData(response.data);

//         console.log(`✅ Booking payment updated: ${bookingId}`);

//         return {
//             success: true,
//             booking: updatedBooking,
//             message: 'Payment verified and booking confirmed'
//         };

//     } catch (error) {
//         console.error('❌ Update booking payment error:', error);
//         return {
//             success: false,
//             error: error.message,
//             message: 'Failed to update payment status'
//         };
//     }
// }

// /**
//  * Get booking details by ID
//  */
// export async function getBookingById(bookingId) {
//     try {
//         if (!bookingId) return null;
        
//         const booking = await bookingApiService.getBookingById(bookingId);
//         return booking;
        
//     } catch (error) {
//         console.error('❌ Get booking error:', error);
//         return null;
//     }
// }

// /**
//  * Get booking by booking number
//  */
// export async function getBookingByNumber(bookingNumber) {
//     try {
//         if (!bookingNumber) return null;
        
//         const booking = await bookingApiService.getBookingByNumber(bookingNumber);
//         return booking;
        
//     } catch (error) {
//         console.error('❌ Get booking by number error:', error);
//         return null;
//     }
// }

// /**
//  * Add reminder sent timestamp to booking
//  */
// export async function markReminderSent(bookingId) {
//     try {
//         if (!bookingId) {
//             throw new Error('Booking ID required');
//         }

//         const response = await bookingApiService.client.patch(
//             `/api/bookingService/bookings?id=${bookingId}`,
//             { reminderSentAt: new Date().toISOString() }
//         );

//         const updatedBooking = bookingApiService._extractData(response.data);

//         console.log(`✅ Reminder marked as sent for booking: ${bookingId}`);

//         return {
//             success: true,
//             booking: updatedBooking
//         };

//     } catch (error) {
//         console.error('❌ Mark reminder sent error:', error);
//         return { 
//             success: false, 
//             error: error.message 
//         };
//     }
// }




















// whatsapp-bot/whatsapp/handlers/bookingService/bookingStorage.js
// PURPOSE: ONLY this file saves to Booking model
// UPDATED: Full multi-tenant support with companyId
// FIXED: clientId ObjectId issue - using customerPhone instead

import bookingApiService from '../../../services/booking-api.js';
import { calculateEndTime, generateBookingNumber } from './bookingUtils.js';

/**
 * Save booking to database
 * THIS IS THE ONLY FUNCTION THAT WRITES TO BOOKING MODEL
 * UPDATED: Full multi-tenant support with companyId
 * FIXED: Uses customerPhone instead of clientId (fixes ObjectId casting error)
 * 
 * @param {Object} userSession - User session object
 * @param {Object} bookingData - Booking data collected during flow
 * @param {boolean} paymentRequired - Whether payment is required
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Object} Save result with booking details
 */
export async function saveBooking(userSession, bookingData, paymentRequired = false, companyId = null) {
    try {
        const cleanPhone = userSession.cleanPhone || bookingData.phoneNumber;
        const whatsappId = userSession.whatsappId;

        // ✅ Validate required data
        if (!bookingData.businessId) {
            throw new Error('Business ID is required');
        }

        if (!bookingData.serviceId) {
            throw new Error('Service ID is required');
        }

        if (!bookingData.customerName) {
            throw new Error('Customer name is required');
        }

        if (!cleanPhone) {
            throw new Error('Customer phone is required');
        }

        // ✅ Ensure companyId is set
        const finalCompanyId = companyId || bookingData.companyId || 'default';
        console.log(`🏢 [BookingStorage] Using companyId: ${finalCompanyId}`);

        // Generate booking number
        const bookingNumber = generateBookingNumber(finalCompanyId);

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
            businessId: bookingData.businessId,
            companyId: finalCompanyId
        });

        // Prepare booking data for storage - FIXED: Removed clientId, using customerPhone instead
        const bookingToSave = {
            // ✅ CRITICAL: Company context for multi-tenancy
            companyId: finalCompanyId,
            
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
            address: bookingData.address || 'Professional\'s address',
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
            bookedAt: new Date().toISOString(),
            
            // Audit trail
            createdBy: 'whatsapp_bot',
            createdVia: 'whatsapp'
        };

        // Log booking data for debugging
        console.log('📦 Saving booking:', {
            bookingNumber,
            customerName: bookingData.customerName,
            customerPhone: cleanPhone,
            service: bookingData.serviceName,
            date: bookingData.date,
            time: bookingData.time,
            businessId: bookingData.businessId,
            companyId: finalCompanyId,
            status: bookingToSave.status,
            paymentStatus: bookingToSave.paymentStatus
        });

        // ✅ Call API to save to Booking model with company context
        const savedBooking = await bookingApiService.createBooking(bookingToSave, finalCompanyId);
        
        if (!savedBooking) {
            throw new Error('Failed to save booking - no response from API');
        }

        console.log(`✅ Booking saved successfully: ${bookingNumber} for ${bookingData.customerName} (Company: ${finalCompanyId})`);

        return {
            success: true,
            booking: savedBooking,
            bookingNumber: bookingNumber,
            bookingId: savedBooking._id || savedBooking.id,
            message: paymentRequired ? 
                'Booking created. Payment required.' : 
                'Booking confirmed successfully!',
            companyId: finalCompanyId
        };

    } catch (error) {
        console.error('❌ Save booking error:', {
            message: error.message,
            stack: error.stack,
            customerName: bookingData?.customerName,
            businessId: bookingData?.businessId,
            companyId: companyId || bookingData?.companyId
        });
        
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
 * 
 * @param {string} bookingId - Booking ID or booking number
 * @param {string} reason - Cancellation reason
 * @param {string} companyId - Company ID for multi-tenant validation
 * @returns {Object} Cancellation result
 */
export async function cancelUserBooking(bookingId, reason, companyId = null) {
    try {
        if (!bookingId) {
            throw new Error('Booking ID required');
        }

        console.log(`🔄 Cancelling booking: ${bookingId}, Reason: ${reason}, Company: ${companyId || 'any'}`);

        // First verify booking exists and belongs to company
        let booking = await bookingApiService.getBookingById(bookingId, companyId);
        
        if (!booking) {
            // Try by booking number
            booking = await bookingApiService.getBookingByNumber(bookingId, companyId);
        }

        if (!booking) {
            throw new Error(`Booking not found: ${bookingId}`);
        }

        // ✅ Verify booking belongs to correct company
        if (companyId && booking.companyId && booking.companyId.toString() !== companyId.toString()) {
            throw new Error(`Booking ${bookingId} does not belong to company ${companyId}`);
        }

        // Call API to update booking status
        const cancelledBooking = await bookingApiService.cancelBooking(booking._id || booking.id, reason, companyId);

        if (!cancelledBooking) {
            throw new Error('Failed to cancel booking - API returned no data');
        }

        console.log(`✅ Booking cancelled: ${bookingId} for company ${companyId || booking.companyId}`);

        return {
            success: true,
            booking: cancelledBooking,
            bookingNumber: cancelledBooking.bookingNumber || bookingId,
            message: 'Booking cancelled successfully',
            companyId: companyId || booking.companyId
        };

    } catch (error) {
        console.error('❌ Cancel booking error:', {
            message: error.message,
            bookingId,
            companyId
        });
        
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
 * 
 * @param {string} bookingId - Booking ID
 * @param {Object} paymentData - Payment data
 * @param {string} companyId - Company ID for multi-tenant validation
 * @returns {Object} Update result
 */
export async function updateBookingPayment(bookingId, paymentData, companyId = null) {
    try {
        if (!bookingId) {
            throw new Error('Booking ID required');
        }

        console.log(`💰 Updating payment for booking: ${bookingId}, Company: ${companyId || 'any'}`);

        // First verify booking exists and belongs to company
        const booking = await bookingApiService.getBookingById(bookingId, companyId);
        
        if (!booking) {
            throw new Error(`Booking not found: ${bookingId}`);
        }

        // ✅ Verify booking belongs to correct company
        if (companyId && booking.companyId && booking.companyId.toString() !== companyId.toString()) {
            throw new Error(`Booking ${bookingId} does not belong to company ${companyId}`);
        }

        // Prepare payment update
        const updateData = {
            paymentStatus: 'paid',
            paidAmount: paymentData.amount || booking.totalAmount,
            paymentMethod: paymentData.method || 'online',
            transactionId: paymentData.transactionId,
            transactionReference: paymentData.reference,
            paymentVerifiedAt: new Date().toISOString(),
            paymentVerifiedBy: paymentData.verifiedBy || 'whatsapp_bot',
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            companyId: companyId || booking.companyId
        };

        // Call API to update booking
        const updatedBooking = await bookingApiService.updateBookingPayment(
            booking._id || booking.id, 
            updateData, 
            companyId
        );

        console.log(`✅ Booking payment updated: ${bookingId} for company ${companyId || booking.companyId}`);

        return {
            success: true,
            booking: updatedBooking,
            bookingNumber: updatedBooking.bookingNumber || booking.bookingNumber,
            message: 'Payment verified and booking confirmed',
            companyId: companyId || booking.companyId
        };

    } catch (error) {
        console.error('❌ Update booking payment error:', {
            message: error.message,
            bookingId,
            companyId
        });
        
        return {
            success: false,
            error: error.message,
            message: 'Failed to update payment status'
        };
    }
}

/**
 * Get booking details by ID with company validation
 * 
 * @param {string} bookingId - Booking ID
 * @param {string} companyId - Company ID for multi-tenant validation
 * @returns {Object|null} Booking object or null
 */
export async function getBookingById(bookingId, companyId = null) {
    try {
        if (!bookingId) return null;
        
        const booking = await bookingApiService.getBookingById(bookingId, companyId);
        
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
 * Get booking by booking number with company validation
 * 
 * @param {string} bookingNumber - Booking number
 * @param {string} companyId - Company ID for multi-tenant validation
 * @returns {Object|null} Booking object or null
 */
export async function getBookingByNumber(bookingNumber, companyId = null) {
    try {
        if (!bookingNumber) return null;
        
        const booking = await bookingApiService.getBookingByNumber(bookingNumber, companyId);
        
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
 * Get customer bookings by phone with company filter
 * 
 * @param {string} customerPhone - Customer phone number
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Array} List of bookings
 */
export async function getCustomerBookings(customerPhone, companyId = null) {
    try {
        if (!customerPhone) return [];
        
        const bookings = await bookingApiService.getCustomerBookings(customerPhone, companyId);
        return bookings || [];
        
    } catch (error) {
        console.error('❌ Get customer bookings error:', error);
        return [];
    }
}

/**
 * Add reminder sent timestamp to booking
 * 
 * @param {string} bookingId - Booking ID
 * @param {string} companyId - Company ID for multi-tenant validation
 * @returns {Object} Update result
 */
export async function markReminderSent(bookingId, companyId = null) {
    try {
        if (!bookingId) {
            throw new Error('Booking ID required');
        }

        console.log(`🔔 Marking reminder sent for booking: ${bookingId}, Company: ${companyId || 'any'}`);

        // First verify booking exists and belongs to company
        const booking = await bookingApiService.getBookingById(bookingId, companyId);
        
        if (!booking) {
            throw new Error(`Booking not found: ${bookingId}`);
        }

        // ✅ Verify booking belongs to correct company
        if (companyId && booking.companyId && booking.companyId.toString() !== companyId.toString()) {
            throw new Error(`Booking ${bookingId} does not belong to company ${companyId}`);
        }

        const response = await bookingApiService.client.patch(
            `/api/bookingService/bookings?id=${booking._id || booking.id}`,
            { 
                reminderSentAt: new Date().toISOString(),
                companyId: companyId || booking.companyId
            }
        );

        const updatedBooking = bookingApiService._extractData(response.data);

        console.log(`✅ Reminder marked as sent for booking: ${bookingId}`);

        return {
            success: true,
            booking: updatedBooking,
            companyId: companyId || booking.companyId
        };

    } catch (error) {
        console.error('❌ Mark reminder sent error:', {
            message: error.message,
            bookingId,
            companyId
        });
        
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Check if booking exists and is valid for a company
 * 
 * @param {string} bookingId - Booking ID or number
 * @param {string} companyId - Company ID for validation
 * @returns {Object} Validation result
 */
export async function validateBooking(bookingId, companyId = null) {
    try {
        // Try by ID first
        let booking = await getBookingById(bookingId, companyId);
        
        if (!booking) {
            // Try by booking number
            booking = await getBookingByNumber(bookingId, companyId);
        }

        if (!booking) {
            return {
                valid: false,
                reason: 'Booking not found'
            };
        }

        // Check if booking is cancelled
        if (booking.status === 'cancelled') {
            return {
                valid: false,
                reason: 'Booking has been cancelled',
                booking
            };
        }

        // Check if booking is completed
        if (booking.status === 'completed') {
            return {
                valid: false,
                reason: 'Booking is already completed',
                booking
            };
        }

        return {
            valid: true,
            booking,
            companyId: booking.companyId
        };

    } catch (error) {
        console.error('❌ Validate booking error:', error);
        return {
            valid: false,
            reason: 'Unable to validate booking'
        };
    }
}



