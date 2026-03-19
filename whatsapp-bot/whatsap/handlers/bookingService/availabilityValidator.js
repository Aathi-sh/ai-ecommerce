// // whatsapp-bot/whatsapp/handlers/bookingService/availabilityValidator.js
// // PURPOSE: Validation only - uses Service + Bookingmng models (READ ONLY)
// // UPDATED for simplified single business flow
// // DOES NOT save anything to database

// import bookingApiService from '../../../services/booking-api.js';
// import { calculateSlots, isWithinWorkingHours } from './slotCalculator.js';
// import { parseDateInput, formatDate } from './bookingUtils.js';

// /**
//  * Check if a business/professional is available on a specific date/time
//  * Uses: Bookingmng model (working hours, breaks, buffer)
//  * Uses: Booking model (existing appointments)
//  * 
//  * @param {string} businessId - The ID of the business/professional
//  * @param {string} date - The date to check (YYYY-MM-DD)
//  * @param {string} startTime - The start time (HH:MM)
//  * @param {number} duration - Duration in minutes
//  * @returns {Object} Availability result
//  */
// export async function checkAvailability(businessId, date, startTime, duration) {
//     try {
//         // Step 1: Get business details from Bookingmng model
//         const business = await bookingApiService.getProfessionalById(businessId);
//         if (!business) {
//             return { available: false, reason: 'Business not found' };
//         }

//         // Step 2: Check if business is active
//         if (!business.isActive) {
//             return { available: false, reason: 'Business is not accepting bookings' };
//         }

//         // Step 3: Check working hours for that day
//         const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//         const workingDay = business.workingHours?.find(w => w.day === dayOfWeek);

//         if (!workingDay || !workingDay.isAvailable) {
//             return { 
//                 available: false, 
//                 reason: 'Business not available on this day',
//                 workingHours: null
//             };
//         }

//         // Step 4: Calculate end time
//         const endTime = calculateEndTime(startTime, duration);

//         // Step 5: Check if within working hours (considering buffer)
//         const withinHours = isWithinWorkingHours(
//             startTime, 
//             endTime, 
//             workingDay.startTime, 
//             workingDay.endTime,
//             business.bookingBuffer || 15
//         );

//         if (!withinHours) {
//             return { 
//                 available: false, 
//                 reason: 'Selected time outside working hours',
//                 workingHours: `${workingDay.startTime} - ${workingDay.endTime}`
//             };
//         }

//         // Step 6: Check max daily bookings limit from Bookingmng
//         const todayBookings = await bookingApiService.getBookingsCount(businessId, date);
//         const maxDaily = business.maxDailyBookings || 10;
        
//         if (todayBookings >= maxDaily) {
//             return { 
//                 available: false, 
//                 reason: 'Business is fully booked for the day',
//                 maxDaily,
//                 currentBookings: todayBookings
//             };
//         }

       
       
//         // All checks passed - slot is available
//         return {
//             available: true,
//             business,
//             businessName: business.businessName,
//             workingHours: `${workingDay.startTime} - ${workingDay.endTime}`,
//             bufferTime: business.bookingBuffer || 15,
//             date: formatDate(date),
//             time: startTime,
//             endTime: endTime,
//             duration: duration
//         };

//     } catch (error) {
//         console.error('❌ Check availability error:', error);
//         return { 
//             available: false, 
//             reason: 'Unable to verify availability. Please try again.' 
//         };
//     }
// }

// /**
//  * Get all available time slots for a business on a specific date
//  * Uses: Bookingmng model (working hours, breaks, buffer)
//  * Uses: Booking model (existing bookings)
//  * 
//  * @param {string} businessId - The ID of the business/professional
//  * @param {string} date - The date to check (YYYY-MM-DD)
//  * @returns {Object} Available slots with metadata
//  */
// export async function getAvailableSlots(businessId, date) {
//     console.log('🔍 ===== GET AVAILABLE SLOTS START =====');
//     console.log('📋 Input parameters:', { 
//         businessId, 
//         date,
//         dateType: typeof date,
//         parsedDate: new Date(date).toISOString()
//     });
    
//     try {
//         // Step 1: Get business from Bookingmng
//         console.log('📞 STEP 1: Fetching business with ID:', businessId);
//         const business = await bookingApiService.getProfessionalById(businessId);
        
//         console.log('📊 Business data received:', {
//             found: !!business,
//             businessName: business?.businessName,
//             id: business?._id,
//             isActive: business?.isActive,
//             hasWorkingHours: !!(business?.workingHours && business.workingHours.length > 0),
//             workingHoursCount: business?.workingHours?.length || 0,
//             bookingBuffer: business?.bookingBuffer,
//             maxDailyBookings: business?.maxDailyBookings
//         });
        
//         if (!business) {
//             console.log('❌ Business not found with ID:', businessId);
//             return { 
//                 available: false, 
//                 slots: [], 
//                 message: 'Business not found' 
//             };
//         }

//         // Step 2: Check if business is active
//         console.log('🔍 STEP 2: Checking if business is active');
//         if (!business.isActive) {
//             console.log('❌ Business is inactive:', business.businessName);
//             return { 
//                 available: false, 
//                 slots: [], 
//                 message: 'Business is not available' 
//             };
//         }
//         console.log('✅ Business is active');

//         // Step 3: Get working hours for the day
//         console.log('📅 STEP 3: Getting working hours for the day');
//         const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//         console.log('📅 Day of week:', dayOfWeek);
        
//         if (!business.workingHours || business.workingHours.length === 0) {
//             console.log('❌ Business has no working hours configured');
//             return { 
//                 available: false, 
//                 slots: [], 
//                 message: 'Business hours not configured',
//                 workingHours: null
//             };
//         }
        
//         console.log('📊 Available working days:', business.workingHours.map(w => ({
//             day: w.day,
//             start: w.startTime,
//             end: w.endTime,
//             isAvailable: w.isAvailable
//         })));
        
//         const workingDay = business.workingHours?.find(w => w.day === dayOfWeek);
        
//         console.log('⏰ Working day for', dayOfWeek, ':', workingDay ? {
//             day: workingDay.day,
//             startTime: workingDay.startTime,
//             endTime: workingDay.endTime,
//             isAvailable: workingDay.isAvailable,
//             hasBreaks: !!(workingDay.breaks && workingDay.breaks.length > 0),
//             breaksCount: workingDay.breaks?.length || 0
//         } : 'NOT FOUND');

//         if (!workingDay) {
//             console.log(`❌ No working hours defined for ${dayOfWeek}`);
//             return { 
//                 available: false, 
//                 slots: [], 
//                 message: `Not available on ${formatDate(date)} (no schedule)`,
//                 workingHours: null
//             };
//         }

//         if (!workingDay.isAvailable) {
//             console.log(`❌ Business is marked as unavailable on ${dayOfWeek}`);
//             return { 
//                 available: false, 
//                 slots: [], 
//                 message: `Not available on ${formatDate(date)} (day off)`,
//                 workingHours: null
//             };
//         }

//         console.log('✅ Working hours found and available');

//         // Step 4: Get existing bookings from Booking model
//         console.log('📚 STEP 4: Fetching existing bookings for date:', date);
//         const existingBookings = await bookingApiService.getBookingsForDate(businessId, date);
//         console.log(`📊 Found ${existingBookings.length} existing bookings:`);
        
//         if (existingBookings.length > 0) {
//             existingBookings.forEach((booking, index) => {
//                 console.log(`   Booking ${index + 1}:`, {
//                     start: booking.startTime,
//                     end: booking.endTime,
//                     status: booking.status
//                 });
//             });
//         }

//         // Step 5: Calculate available slots using slotCalculator
//         console.log('🧮 STEP 5: Calculating available slots');
//         const bufferTime = business.bookingBuffer || 15;
//         console.log('⏱️ Buffer time:', bufferTime, 'minutes');
        
//         console.log('📤 Calling calculateSlots with:', {
//             workingDay: {
//                 start: workingDay.startTime,
//                 end: workingDay.endTime,
//                 breaks: workingDay.breaks?.length || 0
//             },
//             existingBookingsCount: existingBookings.length,
//             bufferTime,
//             date
//         });
        
//         const slots = calculateSlots(
//             workingDay,
//             existingBookings,
//             bufferTime,
//             date
//         );

//         console.log(`✅ Generated ${slots.length} slots`);
        
//         if (slots.length > 0) {
//             console.log('🕐 First 5 slots:', slots.slice(0, 5).map(s => ({
//                 time: s.time,
//                 display: s.displayTime,
//                 start: s.startMinutes,
//                 end: s.endMinutes
//             })));
//         } else {
//             console.log('⚠️ No slots generated - checking possible reasons:');
//             console.log('   - Working hours:', workingDay.startTime, 'to', workingDay.endTime);
//             console.log('   - Buffer time:', bufferTime, 'minutes');
//             console.log('   - Existing bookings:', existingBookings.length);
            
//             // Calculate total possible slots for debugging
//             const workStart = timeToMinutes(workingDay.startTime);
//             const workEnd = timeToMinutes(workingDay.endTime);
//             const totalMinutes = workEnd - workStart;
//             const possibleSlots = Math.floor(totalMinutes / bufferTime);
//             console.log('   - Total work minutes:', totalMinutes);
//             console.log('   - Possible slots without bookings:', possibleSlots);
//         }

//         // Format slots for display
//         const formattedSlots = slots.map(slot => ({
//             ...slot,
//             displayTime: formatTimeForDisplay(slot.time)
//         }));

//         console.log('📊 Final result:', {
//             available: slots.length > 0,
//             totalSlots: slots.length,
//             workingHours: `${workingDay.startTime} - ${workingDay.endTime}`,
//             bufferTime,
//             maxDailyBookings: business.maxDailyBookings || 10,
//             currentBookings: existingBookings.length,
//             businessName: business.businessName
//         });
        
//         console.log('🔍 ===== GET AVAILABLE SLOTS END =====\n');

//         return {
//             available: slots.length > 0,
//             slots: formattedSlots,
//             workingHours: `${workingDay.startTime} - ${workingDay.endTime}`,
//             date: formatDate(date),
//             bufferTime: bufferTime,
//             totalSlots: slots.length,
//             maxDailyBookings: business.maxDailyBookings || 10,
//             currentBookings: existingBookings.length,
//             businessName: business.businessName
//         };

//     } catch (error) {
//         console.error('❌ ERROR in getAvailableSlots:', error);
//         console.error('❌ Error details:', {
//             message: error.message,
//             stack: error.stack,
//             businessId,
//             date
//         });
//         return { 
//             available: false, 
//             slots: [], 
//             message: 'Unable to fetch availability. Please try again.' 
//         };
//     }
// }

// /**
//  * Validate if business can accept more bookings on a date
//  * Uses: Bookingmng model (maxDailyBookings)
//  * Uses: Booking model (current booking count)
//  * 
//  * @param {string} businessId - The ID of the business/professional
//  * @param {string} date - The date to check
//  * @returns {Object} Booking capacity info
//  */
// export async function canAcceptMoreBookings(businessId, date) {
//     try {
//         const business = await bookingApiService.getProfessionalById(businessId);
//         if (!business) {
//             return { 
//                 canAccept: false, 
//                 currentCount: 0, 
//                 maxDaily: 0, 
//                 remaining: 0,
//                 message: 'Business not found'
//             };
//         }

//         const maxDaily = business.maxDailyBookings || 10;
//         const currentCount = await bookingApiService.getBookingsCount(businessId, date);

//         return {
//             canAccept: currentCount < maxDaily,
//             currentCount,
//             maxDaily,
//             remaining: Math.max(0, maxDaily - currentCount),
//             businessName: business.businessName
//         };

//     } catch (error) {
//         console.error('❌ Can accept more bookings error:', error);
//         return { 
//             canAccept: false, 
//             currentCount: 0, 
//             maxDaily: 0, 
//             remaining: 0,
//             message: 'Unable to check availability'
//         };
//     }
// }

// /**
//  * Validate if service is active, available, and linked to a business
//  * Uses: Service model (READ ONLY)
//  * 
//  * @param {string} serviceId - The ID of the service
//  * @returns {Object} Service validation result
//  */
// export async function validateService(serviceId) {
//     try {
//         const service = await bookingApiService.getServiceById(serviceId);
        
//         if (!service) {
//             console.log('❌ Service not found:', serviceId);
//             return { 
//                 valid: false, 
//                 reason: 'Service not found' 
//             };
//         }

//         console.log('✅ Service found:', service.name);
//         console.log('📊 Service data:', {
//             id: service._id,
//             name: service.name,
//             isActive: service.isActive,
//             professionalId: service.professionalId,
//             hasProfessionalId: !!service.professionalId
//         });

//         // Check if service is active
//         if (!service.isActive) {
//             console.log('❌ Service is inactive');
//             return { 
//                 valid: false, 
//                 reason: 'Service is currently not available' 
//             };
//         }

//         // CRITICAL: Check if service is linked to a business
//         if (!service.professionalId) {
//             console.log('❌ Service missing professionalId');
//             return { 
//                 valid: false, 
//                 reason: 'Service is not properly configured (missing business link)' 
//             };
//         }

//         return {
//             valid: true,
//             service: {
//                 id: service._id,
//                 name: service.name,
//                 duration: service.duration,
//                 basePrice: service.basePrice,
//                 category: service.category,
//                 type: service.type,
//                 professionalId: service.professionalId, // Include this for the booking flow
//                 addons: service.addons || []
//             }
//         };

//     } catch (error) {
//         console.error('❌ Validate service error:', error);
//         return { 
//             valid: false, 
//             reason: 'Unable to validate service. Please try again.' 
//         };
//     }
// }

// /**
//  * Get business working hours for a specific day
//  * 
//  * @param {string} businessId - The ID of the business
//  * @param {string} date - The date to check
//  * @returns {Object} Working hours for that day
//  */
// export async function getWorkingHoursForDay(businessId, date) {
//     try {
//         const business = await bookingApiService.getProfessionalById(businessId);
//         if (!business) {
//             return null;
//         }

//         const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//         const workingDay = business.workingHours?.find(w => w.day === dayOfWeek);

//         return workingDay || null;

//     } catch (error) {
//         console.error('❌ Get working hours error:', error);
//         return null;
//     }
// }

// /**
//  * Check if a specific time is within business hours
//  * 
//  * @param {string} businessId - The ID of the business
//  * @param {string} date - The date to check
//  * @param {string} time - The time to check (HH:MM)
//  * @returns {boolean} True if within working hours
//  */
// export async function isWithinBusinessHours(businessId, date, time) {
//     try {
//         const workingDay = await getWorkingHoursForDay(businessId, date);
        
//         if (!workingDay || !workingDay.isAvailable) {
//             return false;
//         }

//         const timeMinutes = timeToMinutes(time);
//         const startMinutes = timeToMinutes(workingDay.startTime);
//         const endMinutes = timeToMinutes(workingDay.endTime);

//         return timeMinutes >= startMinutes && timeMinutes <= endMinutes;

//     } catch (error) {
//         console.error('❌ Check business hours error:', error);
//         return false;
//     }
// }

// // ========== HELPER FUNCTIONS ==========

// /**
//  * Calculate end time based on start time and duration
//  */
// function calculateEndTime(startTime, durationMinutes) {
//     const [hours, minutes] = startTime.split(':').map(Number);
//     const totalMinutes = hours * 60 + minutes + durationMinutes;
//     const endHours = Math.floor(totalMinutes / 60);
//     const endMinutes = totalMinutes % 60;
//     return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
// }

// /**
//  * Convert time string to minutes
//  */
// function timeToMinutes(time) {
//     const [hours, minutes] = time.split(':').map(Number);
//     return hours * 60 + minutes;
// }

// /**
//  * Format time for display (12-hour format)
//  */
// function formatTimeForDisplay(time) {
//     const [hours, minutes] = time.split(':').map(Number);
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const displayHour = hours % 12 || 12;
//     return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
// }













// whatsapp-bot/whatsapp/handlers/bookingService/availabilityValidator.js
// PURPOSE: Validation only - uses Service + Bookingmng models (READ ONLY)
// UPDATED: Full multi-tenant support with companyId
// DOES NOT save anything to database

import bookingApiService from '../../../services/booking-api.js';
import { calculateSlots, isWithinWorkingHours } from './slotCalculator.js';
import { parseDateInput, formatDate } from './bookingUtils.js';

/**
 * Check if a business/professional is available on a specific date/time
 * Uses: Bookingmng model (working hours, breaks, buffer)
 * Uses: Booking model (existing appointments)
 * 
 * @param {string} businessId - The ID of the business/professional
 * @param {string} date - The date to check (YYYY-MM-DD)
 * @param {string} startTime - The start time (HH:MM)
 * @param {number} duration - Duration in minutes
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Object} Availability result
 */
export async function checkAvailability(businessId, date, startTime, duration, companyId = null) {
    try {
        console.log('🔍 ===== CHECK AVAILABILITY START =====');
        console.log('📋 Input parameters:', { 
            businessId, 
            date, 
            startTime, 
            duration,
            companyId 
        });
        
        // ✅ Step 1: Get business details from Bookingmng model with company validation
        const business = await bookingApiService.getProfessionalById(businessId, companyId);
        
        console.log('📊 Business data received:', {
            found: !!business,
            businessName: business?.businessName,
            id: business?._id,
            isActive: business?.isActive,
            companyId: business?.companyId
        });
        
        if (!business) {
            console.log('❌ Business not found with ID:', businessId);
            return { available: false, reason: 'Business not found' };
        }

        // ✅ Step 2: Verify business belongs to correct company
        if (companyId && business.companyId && business.companyId.toString() !== companyId.toString()) {
            console.log('❌ Business does not belong to company:', companyId);
            return { available: false, reason: 'Business not available for this company' };
        }

        // Step 3: Check if business is active
        if (!business.isActive) {
            return { available: false, reason: 'Business is not accepting bookings' };
        }

        // Step 4: Check working hours for that day
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const workingDay = business.workingHours?.find(w => w.day === dayOfWeek);

        if (!workingDay || !workingDay.isAvailable) {
            return { 
                available: false, 
                reason: 'Business not available on this day',
                workingHours: null
            };
        }

        // Step 5: Calculate end time
        const endTime = calculateEndTime(startTime, duration);

        // Step 6: Check if within working hours (considering buffer)
        const withinHours = isWithinWorkingHours(
            startTime, 
            endTime, 
            workingDay.startTime, 
            workingDay.endTime,
            business.bookingBuffer || 15
        );

        if (!withinHours) {
            return { 
                available: false, 
                reason: 'Selected time outside working hours',
                workingHours: `${workingDay.startTime} - ${workingDay.endTime}`
            };
        }

        // Step 7: Check max daily bookings limit from Bookingmng
        const todayBookings = await bookingApiService.getBookingsCount(businessId, date, companyId);
        const maxDaily = business.maxDailyBookings || 10;
        
        if (todayBookings >= maxDaily) {
            return { 
                available: false, 
                reason: 'Business is fully booked for the day',
                maxDaily,
                currentBookings: todayBookings
            };
        }

        // Step 8: Check for time slot conflicts with existing bookings
        const existingBookings = await bookingApiService.getBookingsForDateTime(
            businessId, 
            date, 
            startTime, 
            endTime,
            companyId
        );

        if (existingBookings.length > 0) {
            return {
                available: false,
                reason: 'This time slot is already booked',
                conflictingBooking: existingBookings[0]
            };
        }

        console.log('✅ All checks passed - slot is available');
        console.log('🔍 ===== CHECK AVAILABILITY END =====\n');
        
        // All checks passed - slot is available
        return {
            available: true,
            business,
            businessName: business.businessName,
            workingHours: `${workingDay.startTime} - ${workingDay.endTime}`,
            bufferTime: business.bookingBuffer || 15,
            date: formatDate(date),
            time: startTime,
            endTime: endTime,
            duration: duration,
            companyId: business.companyId
        };

    } catch (error) {
        console.error('❌ Check availability error:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            businessId,
            date,
            startTime,
            companyId
        });
        return { 
            available: false, 
            reason: 'Unable to verify availability. Please try again.' 
        };
    }
}

/**
 * Get all available time slots for a business on a specific date
 * Uses: Bookingmng model (working hours, breaks, buffer)
 * Uses: Booking model (existing bookings)
 * 
 * @param {string} businessId - The ID of the business/professional
 * @param {string} date - The date to check (YYYY-MM-DD)
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Object} Available slots with metadata
 */
export async function getAvailableSlots(businessId, date, companyId = null) {
    console.log('🔍 ===== GET AVAILABLE SLOTS START =====');
    console.log('📋 Input parameters:', { 
        businessId, 
        date,
        companyId,
        dateType: typeof date,
        parsedDate: new Date(date).toISOString()
    });
    
    try {
        // ✅ Step 1: Get business from Bookingmng with company validation
        console.log('📞 STEP 1: Fetching business with ID:', businessId);
        const business = await bookingApiService.getProfessionalById(businessId, companyId);
        
        console.log('📊 Business data received:', {
            found: !!business,
            businessName: business?.businessName,
            id: business?._id,
            isActive: business?.isActive,
            companyId: business?.companyId,
            hasWorkingHours: !!(business?.workingHours && business.workingHours.length > 0),
            workingHoursCount: business?.workingHours?.length || 0,
            bookingBuffer: business?.bookingBuffer,
            maxDailyBookings: business?.maxDailyBookings
        });
        
        if (!business) {
            console.log('❌ Business not found with ID:', businessId);
            return { 
                available: false, 
                slots: [], 
                message: 'Business not found' 
            };
        }

        // ✅ Step 2: Verify business belongs to correct company
        if (companyId && business.companyId && business.companyId.toString() !== companyId.toString()) {
            console.log('❌ Business does not belong to company:', companyId);
            return { 
                available: false, 
                slots: [], 
                message: 'Business not available for this company' 
            };
        }

        // Step 3: Check if business is active
        console.log('🔍 STEP 2: Checking if business is active');
        if (!business.isActive) {
            console.log('❌ Business is inactive:', business.businessName);
            return { 
                available: false, 
                slots: [], 
                message: 'Business is not available' 
            };
        }
        console.log('✅ Business is active');

        // Step 4: Get working hours for the day
        console.log('📅 STEP 3: Getting working hours for the day');
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        console.log('📅 Day of week:', dayOfWeek);
        
        if (!business.workingHours || business.workingHours.length === 0) {
            console.log('❌ Business has no working hours configured');
            return { 
                available: false, 
                slots: [], 
                message: 'Business hours not configured',
                workingHours: null
            };
        }
        
        console.log('📊 Available working days:', business.workingHours.map(w => ({
            day: w.day,
            start: w.startTime,
            end: w.endTime,
            isAvailable: w.isAvailable
        })));
        
        const workingDay = business.workingHours?.find(w => w.day === dayOfWeek);
        
        console.log('⏰ Working day for', dayOfWeek, ':', workingDay ? {
            day: workingDay.day,
            startTime: workingDay.startTime,
            endTime: workingDay.endTime,
            isAvailable: workingDay.isAvailable,
            hasBreaks: !!(workingDay.breaks && workingDay.breaks.length > 0),
            breaksCount: workingDay.breaks?.length || 0
        } : 'NOT FOUND');

        if (!workingDay) {
            console.log(`❌ No working hours defined for ${dayOfWeek}`);
            return { 
                available: false, 
                slots: [], 
                message: `Not available on ${formatDate(date)} (no schedule)`,
                workingHours: null
            };
        }

        if (!workingDay.isAvailable) {
            console.log(`❌ Business is marked as unavailable on ${dayOfWeek}`);
            return { 
                available: false, 
                slots: [], 
                message: `Not available on ${formatDate(date)} (day off)`,
                workingHours: null
            };
        }

        console.log('✅ Working hours found and available');

        // ✅ Step 5: Get existing bookings from Booking model with company validation
        console.log('📚 STEP 4: Fetching existing bookings for date:', date);
        const existingBookings = await bookingApiService.getBookingsForDate(businessId, date, companyId);
        console.log(`📊 Found ${existingBookings.length} existing bookings:`);
        
        if (existingBookings.length > 0) {
            existingBookings.forEach((booking, index) => {
                console.log(`   Booking ${index + 1}:`, {
                    start: booking.startTime,
                    end: booking.endTime,
                    status: booking.status,
                    companyId: booking.companyId
                });
            });
        }

        // ✅ Step 6: Check max daily bookings limit
        const maxDaily = business.maxDailyBookings || 10;
        if (existingBookings.length >= maxDaily) {
            console.log(`❌ Max daily bookings (${maxDaily}) reached`);
            return {
                available: false,
                slots: [],
                message: 'Fully booked for this day',
                maxDaily,
                currentBookings: existingBookings.length
            };
        }

        // Step 7: Calculate available slots using slotCalculator
        console.log('🧮 STEP 5: Calculating available slots');
        const bufferTime = business.bookingBuffer || 15;
        console.log('⏱️ Buffer time:', bufferTime, 'minutes');
        
        console.log('📤 Calling calculateSlots with:', {
            workingDay: {
                start: workingDay.startTime,
                end: workingDay.endTime,
                breaks: workingDay.breaks?.length || 0
            },
            existingBookingsCount: existingBookings.length,
            bufferTime,
            date
        });
        
        const slots = calculateSlots(
            workingDay,
            existingBookings,
            bufferTime,
            date
        );

        console.log(`✅ Generated ${slots.length} slots`);
        
        if (slots.length > 0) {
            console.log('🕐 First 5 slots:', slots.slice(0, 5).map(s => ({
                time: s.time,
                display: s.displayTime,
                start: s.startMinutes,
                end: s.endMinutes
            })));
        } else {
            console.log('⚠️ No slots generated - checking possible reasons:');
            console.log('   - Working hours:', workingDay.startTime, 'to', workingDay.endTime);
            console.log('   - Buffer time:', bufferTime, 'minutes');
            console.log('   - Existing bookings:', existingBookings.length);
            
            // Calculate total possible slots for debugging
            const workStart = timeToMinutes(workingDay.startTime);
            const workEnd = timeToMinutes(workingDay.endTime);
            const totalMinutes = workEnd - workStart;
            const possibleSlots = Math.floor(totalMinutes / bufferTime);
            console.log('   - Total work minutes:', totalMinutes);
            console.log('   - Possible slots without bookings:', possibleSlots);
        }

        // Format slots for display
        const formattedSlots = slots.map(slot => ({
            ...slot,
            displayTime: formatTimeForDisplay(slot.time)
        }));

        console.log('📊 Final result:', {
            available: slots.length > 0,
            totalSlots: slots.length,
            workingHours: `${workingDay.startTime} - ${workingDay.endTime}`,
            bufferTime,
            maxDailyBookings: business.maxDailyBookings || 10,
            currentBookings: existingBookings.length,
            remainingSlots: Math.max(0, (business.maxDailyBookings || 10) - existingBookings.length),
            businessName: business.businessName,
            companyId: business.companyId
        });
        
        console.log('🔍 ===== GET AVAILABLE SLOTS END =====\n');

        return {
            available: slots.length > 0,
            slots: formattedSlots,
            workingHours: `${workingDay.startTime} - ${workingDay.endTime}`,
            date: formatDate(date),
            bufferTime: bufferTime,
            totalSlots: slots.length,
            maxDailyBookings: business.maxDailyBookings || 10,
            currentBookings: existingBookings.length,
            remainingSlots: Math.max(0, (business.maxDailyBookings || 10) - existingBookings.length),
            businessName: business.businessName,
            companyId: business.companyId
        };

    } catch (error) {
        console.error('❌ ERROR in getAvailableSlots:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            businessId,
            date,
            companyId
        });
        return { 
            available: false, 
            slots: [], 
            message: 'Unable to fetch availability. Please try again.' 
        };
    }
}

/**
 * Validate if business can accept more bookings on a date
 * Uses: Bookingmng model (maxDailyBookings)
 * Uses: Booking model (current booking count)
 * 
 * @param {string} businessId - The ID of the business/professional
 * @param {string} date - The date to check
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Object} Booking capacity info
 */
export async function canAcceptMoreBookings(businessId, date, companyId = null) {
    try {
        const business = await bookingApiService.getProfessionalById(businessId, companyId);
        if (!business) {
            return { 
                canAccept: false, 
                currentCount: 0, 
                maxDaily: 0, 
                remaining: 0,
                message: 'Business not found'
            };
        }

        // ✅ Verify business belongs to correct company
        if (companyId && business.companyId && business.companyId.toString() !== companyId.toString()) {
            return { 
                canAccept: false, 
                currentCount: 0, 
                maxDaily: 0, 
                remaining: 0,
                message: 'Business not available for this company'
            };
        }

        const maxDaily = business.maxDailyBookings || 10;
        const currentCount = await bookingApiService.getBookingsCount(businessId, date, companyId);

        return {
            canAccept: currentCount < maxDaily,
            currentCount,
            maxDaily,
            remaining: Math.max(0, maxDaily - currentCount),
            businessName: business.businessName,
            companyId: business.companyId
        };

    } catch (error) {
        console.error('❌ Can accept more bookings error:', error);
        return { 
            canAccept: false, 
            currentCount: 0, 
            maxDaily: 0, 
            remaining: 0,
            message: 'Unable to check availability'
        };
    }
}

/**
 * Validate if service is active, available, and linked to a business
 * Uses: Service model (READ ONLY)
 * 
 * @param {string} serviceId - The ID of the service
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Object} Service validation result
 */
export async function validateService(serviceId, companyId = null) {
    try {
        console.log('🔍 Validating service:', { serviceId, companyId });
        
        const service = await bookingApiService.getServiceById(serviceId, companyId);
        
        if (!service) {
            console.log('❌ Service not found:', serviceId);
            return { 
                valid: false, 
                reason: 'Service not found' 
            };
        }

        console.log('✅ Service found:', service.name);
        console.log('📊 Service data:', {
            id: service._id,
            name: service.name,
            isActive: service.isActive,
            professionalId: service.professionalId,
            companyId: service.companyId,
            hasProfessionalId: !!service.professionalId
        });

        // ✅ Verify service belongs to correct company
        if (companyId && service.companyId && service.companyId.toString() !== companyId.toString()) {
            console.log('❌ Service does not belong to company:', companyId);
            return { 
                valid: false, 
                reason: 'Service not available for this company' 
            };
        }

        // Check if service is active
        if (!service.isActive) {
            console.log('❌ Service is inactive');
            return { 
                valid: false, 
                reason: 'Service is currently not available' 
            };
        }

        // CRITICAL: Check if service is linked to a business
        if (!service.professionalId) {
            console.log('❌ Service missing professionalId');
            return { 
                valid: false, 
                reason: 'Service is not properly configured (missing business link)' 
            };
        }

        return {
            valid: true,
            service: {
                id: service._id,
                name: service.name,
                duration: service.duration,
                basePrice: service.basePrice,
                category: service.category,
                type: service.type,
                professionalId: service.professionalId, // Include this for the booking flow
                companyId: service.companyId,
                addons: service.addons || []
            }
        };

    } catch (error) {
        console.error('❌ Validate service error:', error);
        return { 
            valid: false, 
            reason: 'Unable to validate service. Please try again.' 
        };
    }
}

/**
 * Get business working hours for a specific day
 * 
 * @param {string} businessId - The ID of the business
 * @param {string} date - The date to check
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Object} Working hours for that day
 */
export async function getWorkingHoursForDay(businessId, date, companyId = null) {
    try {
        const business = await bookingApiService.getProfessionalById(businessId, companyId);
        if (!business) {
            return null;
        }

        // ✅ Verify business belongs to correct company
        if (companyId && business.companyId && business.companyId.toString() !== companyId.toString()) {
            console.log('❌ Business does not belong to company:', companyId);
            return null;
        }

        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const workingDay = business.workingHours?.find(w => w.day === dayOfWeek);

        return workingDay || null;

    } catch (error) {
        console.error('❌ Get working hours error:', error);
        return null;
    }
}

/**
 * Check if a specific time is within business hours
 * 
 * @param {string} businessId - The ID of the business
 * @param {string} date - The date to check
 * @param {string} time - The time to check (HH:MM)
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {boolean} True if within working hours
 */
export async function isWithinBusinessHours(businessId, date, time, companyId = null) {
    try {
        const workingDay = await getWorkingHoursForDay(businessId, date, companyId);
        
        if (!workingDay || !workingDay.isAvailable) {
            return false;
        }

        const timeMinutes = timeToMinutes(time);
        const startMinutes = timeToMinutes(workingDay.startTime);
        const endMinutes = timeToMinutes(workingDay.endTime);

        return timeMinutes >= startMinutes && timeMinutes <= endMinutes;

    } catch (error) {
        console.error('❌ Check business hours error:', error);
        return false;
    }
}

/**
 * Validate if a booking can be made for a specific time
 * 
 * @param {string} businessId - The ID of the business
 * @param {string} date - The date to check
 * @param {string} startTime - The start time (HH:MM)
 * @param {number} duration - Duration in minutes
 * @param {string} companyId - Company ID for multi-tenant isolation
 * @returns {Object} Validation result
 */
export async function validateBookingTime(businessId, date, startTime, duration, companyId = null) {
    try {
        // Check availability
        const availability = await checkAvailability(businessId, date, startTime, duration, companyId);
        
        if (!availability.available) {
            return {
                valid: false,
                reason: availability.reason,
                details: availability
            };
        }

        // Check if business can accept more bookings
        const capacity = await canAcceptMoreBookings(businessId, date, companyId);
        
        if (!capacity.canAccept) {
            return {
                valid: false,
                reason: 'Maximum daily bookings reached',
                details: capacity
            };
        }

        return {
            valid: true,
            details: {
                ...availability,
                capacity
            }
        };

    } catch (error) {
        console.error('❌ Validate booking time error:', error);
        return {
            valid: false,
            reason: 'Unable to validate booking time'
        };
    }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

/**
 * Convert time string to minutes
 */
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Format time for display (12-hour format)
 */
function formatTimeForDisplay(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}