// whatsapp-bot/whatsapp/handlers/bookingService/bookingFlowHandler.js
// PURPOSE: User interaction ONLY - NO direct DB operations
// SIMPLIFIED - Works like products (no business lookup needed)

import bookingApiService from '../../../services/booking-api.js';
import { checkAvailability, getAvailableSlots, validateService } from './availabilityValidator.js';
import { saveBooking } from './bookingStorage.js';
import { 
    formatDate, formatTime, formatDateTime, formatCurrency,
    parseDateInput, parseTimeInput, validatePhone,
    isValidFutureDate, formatBookingStatus, formatPaymentStatus,
    calculateEndTime
} from './bookingUtils.js';

// Booking state machine - SIMPLIFIED like products
const BOOKING_STATES = {
    IDLE: 'IDLE',
    START_BOOKING: 'START_BOOKING',
    AWAITING_SERVICE: 'AWAITING_SERVICE',        // Step 1: Choose service
    AWAITING_DATE: 'AWAITING_DATE',              // Step 2: Choose date
    AWAITING_TIME: 'AWAITING_TIME',              // Step 3: Choose time
    AWAITING_CUSTOMER_NAME: 'AWAITING_CUSTOMER_NAME', // Step 4: Enter name
    AWAITING_PHONE: 'AWAITING_PHONE',             // Step 5: Enter phone
    AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION', // Step 6: Confirm
    AWAITING_CANCELLATION_CONFIRMATION: 'AWAITING_CANCELLATION_CONFIRMATION'
};

/**
 * Main booking flow handler - SIMPLIFIED like products
 */
export async function handleBookingFlow(message, client, userSession, userSessions) {
    const userMessage = message.body.trim();
    const from = message.from;

    try {
        // Initialize booking data if needed
        if (!userSession.bookingData) {
            userSession.bookingData = {};
        }

        // REMOVED: Business data check - no longer needed
        // Now works like products - just fetch all services

        // Check for cancellation at any point
        if (userSession.bookingState !== BOOKING_STATES.AWAITING_CANCELLATION_CONFIRMATION && 
            await handleCancellationRequest(message, userSession)) {
            return;
        }

        // Route based on current state - SIMPLIFIED flow
        switch (userSession.bookingState) {
            case 'START_BOOKING':
                return await showServices(message, userSession);

            case BOOKING_STATES.AWAITING_SERVICE:
                return await handleServiceSelection(message, userSession);

            case BOOKING_STATES.AWAITING_DATE:
                return await handleDateSelection(message, userSession);

            case BOOKING_STATES.AWAITING_TIME:
                return await handleTimeSelection(message, userSession);

            case BOOKING_STATES.AWAITING_CUSTOMER_NAME:
                return await handleCustomerName(message, userSession);

            case BOOKING_STATES.AWAITING_PHONE:
                return await handlePhoneInput(message, userSession);

            case BOOKING_STATES.AWAITING_CONFIRMATION:
                return await handleFinalConfirmation(message, userSession, client);

            case BOOKING_STATES.AWAITING_CANCELLATION_CONFIRMATION:
                return await handleCancellationConfirmation(message, userSession, userSessions);

            default:
                userSession.bookingState = BOOKING_STATES.IDLE;
                return await message.reply(
                    '🔄 *Session Reset*\n\n' +
                    'Type *Book* to start a new booking.'
                );
        }

    } catch (error) {
        console.error('❌ Booking flow error:', error);
        await message.reply(
            '❌ *Something went wrong*\n\n' +
            'Please try again or type *Book* to restart.'
        );
    }
}

/**
 * Handle "MyBookings" command - View user's bookings
 */
export async function handleMyBookings(message, client, userSession) {
    try {
        const whatsappId = userSession.whatsappId;
        
        await message.reply('🔍 *Fetching your bookings...*');

        // Get upcoming bookings
        const upcomingBookings = await bookingApiService.getUpcomingClientBookings(whatsappId);
        
        // Get past bookings
        const pastBookings = await bookingApiService.getPastClientBookings(whatsappId);

        if (upcomingBookings.length === 0 && pastBookings.length === 0) {
            return await message.reply(
                `📭 *No Bookings Found*\n\n` +
                `You haven't made any bookings yet.\n\n` +
                `Type *Book* to schedule your first appointment! 📅`
            );
        }

        let response = `📅 *YOUR BOOKINGS*\n`;
        response += `═══════════════════\n\n`;

        // Show upcoming bookings
        if (upcomingBookings.length > 0) {
            response += `📌 *UPCOMING (${upcomingBookings.length})*\n\n`;
            
            upcomingBookings.forEach((booking, index) => {
                const status = formatBookingStatus(booking.status);
                const payment = formatPaymentStatus(booking.paymentStatus);
                
                response += `${index + 1}. *${booking.serviceName}*\n`;
                response += `   📅 ${formatDate(booking.scheduledDate)} at ${formatTime(booking.startTime)}\n`;
                response += `   👤 ${booking.professionalName || 'Professional'}\n`;
                response += `   ${status.emoji} Status: ${status.text}\n`;
                response += `   ${payment.emoji} Payment: ${payment.text}\n`;
                response += `   🆔 *${booking.bookingNumber}*\n\n`;
            });
        }

        // Show past bookings
        if (pastBookings.length > 0) {
            response += `📋 *PAST (${pastBookings.length})*\n\n`;
            
            pastBookings.slice(0, 3).forEach((booking, index) => {
                response += `• ${booking.serviceName} - ${formatDate(booking.scheduledDate)}\n`;
                response += `  ${booking.bookingNumber}\n`;
            });
            
            if (pastBookings.length > 3) {
                response += `  ... and ${pastBookings.length - 3} more\n`;
            }
            response += `\n`;
        }

        response += `💡 *Options:*\n`;
        response += `• Type *Book* for new booking\n`;
        response += `• Reply with booking number for details\n`;
        response += `• Type *Cancel BK-XXXXX* to cancel`;

        await message.reply(response);

    } catch (error) {
        console.error('❌ MyBookings error:', error);
        await message.reply('❌ Failed to fetch your bookings. Please try again.');
    }
}

// ========== SIMPLIFIED HELPER FUNCTIONS ==========

/**
 * STEP 1: Show all available services (like products)
 */
async function showServices(message, userSession) {
    await message.reply(`🔍 *Loading available services...*`);

    // Get all active services (like products)
    const services = await bookingApiService.getServices({ isActive: true });

    if (!services || services.length === 0) {
        await message.reply(
            `❌ *No Services Found*\n\n` +
            `There are no services available at the moment.\n\n` +
            `Please check back later or contact support.`
        );
        userSession.bookingState = BOOKING_STATES.IDLE;
        return;
    }

    // Store services in session
    userSession.bookingData.services = services;

    // Show services (like products listing)
    let serviceMsg = `🛎️ *Available Services*\n\n`;
    services.forEach((service, idx) => {
        serviceMsg += `${idx + 1}. *${service.name}*\n`;
        serviceMsg += `   ⏱️ Duration: ${service.duration} mins\n`;
        serviceMsg += `   💰 Price: ${formatCurrency(service.basePrice)}\n`;
        if (service.description) {
            serviceMsg += `   📝 ${service.description.substring(0, 50)}${service.description.length > 50 ? '...' : ''}\n`;
        }
        serviceMsg += `\n`;
    });
    serviceMsg += `📝 *Reply with the service number or name*\n`;
    serviceMsg += `💡 Example: "1" or "${services[0]?.name}"`;

    userSession.bookingState = BOOKING_STATES.AWAITING_SERVICE;
    
    await message.reply(serviceMsg);
}

/**
 * STEP 2: Handle service selection
 */
async function handleServiceSelection(message, userSession) {
    const input = message.body.trim();
    const services = userSession.bookingData.services;
    
    if (!services || services.length === 0) {
        await message.reply('❌ Session expired. Please start over with *Book*');
        userSession.bookingState = BOOKING_STATES.IDLE;
        return;
    }

    // Find selected service
    let selectedService = null;
    
    // Check by number
    if (/^\d+$/.test(input)) {
        const index = parseInt(input) - 1;
        if (index >= 0 && index < services.length) {
            selectedService = services[index];
        }
    } else {
        // Check by name (partial match)
        selectedService = services.find(s => 
            s.name.toLowerCase().includes(input.toLowerCase())
        );
    }

    if (!selectedService) {
        await message.reply(
            `❌ *Service not found*\n\n` +
            `Please select a valid service from the list.\n` +
            `Reply with the service number or name.`
        );
        return;
    }

    // Validate service is active
    const serviceValidation = await validateService(selectedService._id);
    
    if (!serviceValidation.valid) {
        await message.reply(
            `❌ *Service Unavailable*\n\n` +
            `${serviceValidation.reason}\n\n` +
            `Please choose another service.`
        );
        return;
    }

    // Store selected service
    userSession.bookingData.serviceId = selectedService._id;
    userSession.bookingData.serviceName = selectedService.name;
    userSession.bookingData.serviceDuration = selectedService.duration;
    userSession.bookingData.servicePrice = selectedService.basePrice;
    userSession.bookingData.businessId = selectedService.professionalId; // Get business ID from service

    // Show service details and ask for date
    let detailsMsg = `✅ *Selected: ${selectedService.name}*\n\n`;
    detailsMsg += `⏱️ Duration: ${selectedService.duration} minutes\n`;
    detailsMsg += `💰 Price: ${formatCurrency(selectedService.basePrice)}\n\n`;
    detailsMsg += `📅 *Now select a date:*\n\n`;
    detailsMsg += `📝 *Enter date in DD/MM/YYYY format*\n`;
    detailsMsg += `💡 Examples: "25/12/2024", "tomorrow", "today"\n\n`;
    detailsMsg += `⚠️ Bookings must be at least 24 hours in advance`;

    userSession.bookingState = BOOKING_STATES.AWAITING_DATE;
    
    await message.reply(detailsMsg);
}

/**
 * STEP 3: Handle date selection
 */
async function handleDateSelection(message, userSession) {
    const input = message.body.trim();
    
    // Parse date
    const dateStr = parseDateInput(input);
    
    if (!dateStr) {
        await message.reply(
            `❌ *Invalid Date Format*\n\n` +
            `Please use DD/MM/YYYY format.\n` +
            `💡 Examples: "25/12/2024", "tomorrow", "today"`
        );
        return;
    }

    // Check if date is valid (not in past)
    if (!isValidFutureDate(dateStr, 1)) {
        await message.reply(
            `❌ *Invalid Date*\n\n` +
            `Please select a future date (at least 24 hours in advance).`
        );
        return;
    }

    userSession.bookingData.date = dateStr;
    userSession.bookingData.formattedDate = formatDate(dateStr);

    await message.reply(`🔍 *Checking availability for ${formatDate(dateStr)}...*`);

    // Get available slots for this business
    const availability = await getAvailableSlots(
        userSession.bookingData.businessId,
        dateStr
    );

    if (!availability.available || availability.slots.length === 0) {
        await message.reply(
            `❌ *No Slots Available*\n\n` +
            `No time slots available on ${formatDate(dateStr)}.\n\n` +
            `📝 *Please choose another date*\n\n` +
            `Type *BACK* to choose another date or *CANCEL* to stop.`
        );
        return;
    }

    // Store slots in session
    userSession.bookingData.availableSlots = availability.slots;

    // Show available slots
    let slotsMsg = `⏰ *Available Time Slots*\n\n`;
    slotsMsg += `📅 ${formatDate(dateStr)}\n\n`;

    // Group slots by time of day for better display
    const morning = availability.slots.filter(s => parseInt(s.time) < 12);
    const afternoon = availability.slots.filter(s => parseInt(s.time) >= 12 && parseInt(s.time) < 17);
    const evening = availability.slots.filter(s => parseInt(s.time) >= 17);

    if (morning.length) {
        slotsMsg += `🌅 *Morning:*\n`;
        morning.slice(0, 6).forEach(s => slotsMsg += `   ${s.displayTime}\n`);
        if (morning.length > 6) slotsMsg += `   ... and ${morning.length - 6} more\n`;
        slotsMsg += `\n`;
    }

    if (afternoon.length) {
        slotsMsg += `☀️ *Afternoon:*\n`;
        afternoon.slice(0, 6).forEach(s => slotsMsg += `   ${s.displayTime}\n`);
        if (afternoon.length > 6) slotsMsg += `   ... and ${afternoon.length - 6} more\n`;
        slotsMsg += `\n`;
    }

    if (evening.length) {
        slotsMsg += `🌙 *Evening:*\n`;
        evening.slice(0, 6).forEach(s => slotsMsg += `   ${s.displayTime}\n`);
        if (evening.length > 6) slotsMsg += `   ... and ${evening.length - 6} more\n`;
        slotsMsg += `\n`;
    }

    slotsMsg += `📝 *Type the time you want*\n`;
    slotsMsg += `💡 Examples: "10:30 AM", "2pm", "14:30"\n\n`;
    slotsMsg += `💡 Type *BACK* to change date or *CANCEL* to stop`;

    userSession.bookingState = BOOKING_STATES.AWAITING_TIME;
    
    await message.reply(slotsMsg);
}

/**
 * STEP 4: Handle time selection
 */
async function handleTimeSelection(message, userSession) {
    const input = message.body.trim().toLowerCase();
    
    console.log('⏰ ===== TIME SELECTION START =====');
    console.log('📨 User input:', input);
    console.log('📊 Current session data:', {
        businessId: userSession.bookingData.businessId,
        date: userSession.bookingData.date,
        serviceDuration: userSession.bookingData.serviceDuration,
        availableSlotsCount: userSession.bookingData.availableSlots?.length || 0
    });
    
    // Check for back command
    if (input === 'back') {
        console.log('⬅️ User wants to go back to date selection');
        userSession.bookingState = BOOKING_STATES.AWAITING_DATE;
        return await handleDateSelection(message, userSession);
    }

    // Parse time
    console.log('🔄 Parsing time input...');
    const timeStr = parseTimeInput(input);
    console.log('⏱️ Parsed time result:', {
        input,
        parsedTime: timeStr,
        isValid: !!timeStr
    });
    
    if (!timeStr) {
        console.log('❌ Invalid time format');
        await message.reply(
            `❌ *Invalid Time Format*\n\n` +
            `Please enter a valid time.\n` +
            `💡 Examples: "10:30 AM", "2pm", "14:30"`
        );
        console.log('⏰ ===== TIME SELECTION END (INVALID FORMAT) =====\n');
        return;
    }

    // Log all available slots for debugging
    console.log('📋 Available slots in session:');
    if (userSession.bookingData.availableSlots && userSession.bookingData.availableSlots.length > 0) {
        userSession.bookingData.availableSlots.forEach((slot, index) => {
            console.log(`   Slot ${index + 1}:`, {
                time: slot.time,
                displayTime: slot.displayTime,
                available: slot.available
            });
        });
    } else {
        console.log('⚠️ No available slots in session!');
    }

    // Check if selected time is in available slots
    console.log('🔍 Checking if time is in available slots...');
    const matchingSlot = userSession.bookingData.availableSlots?.find(
        slot => slot.time === timeStr
    );
    
    const isAvailable = !!matchingSlot;
    
    console.log('📊 Availability check result:', {
        timeStr,
        isAvailable,
        matchingSlot: matchingSlot ? {
            time: matchingSlot.time,
            display: matchingSlot.displayTime
        } : 'NOT FOUND'
    });

    if (!isAvailable) {
        console.log('❌ Selected time not in available slots list');
        
        // Show available times as suggestion
        const availableTimes = userSession.bookingData.availableSlots
            ?.slice(0, 5)
            .map(s => s.displayTime)
            .join(', ');
        
        await message.reply(
            `❌ *Time Not Available*\n\n` +
            `"${input}" is not available.\n\n` +
            `💡 *Available times:* ${availableTimes || 'None'}\n\n` +
            `Please select a time from the list.`
        );
        console.log('⏰ ===== TIME SELECTION END (NOT AVAILABLE) =====\n');
        return;
    }

    // Final availability check
    console.log('🔄 Performing final availability check with API...');
    console.log('📤 checkAvailability params:', {
        businessId: userSession.bookingData.businessId,
        date: userSession.bookingData.date,
        timeStr,
        duration: userSession.bookingData.serviceDuration
    });
    
    const availabilityCheck = await checkAvailability(
        userSession.bookingData.businessId,
        userSession.bookingData.date,
        timeStr,
        userSession.bookingData.serviceDuration
    );

    console.log('📊 Final availability check result:', availabilityCheck);

    if (!availabilityCheck.available) {
        console.log('❌ Slot no longer available:', availabilityCheck.reason);
        await message.reply(
            `❌ *Slot No Longer Available*\n\n` +
            `${availabilityCheck.reason || 'Please select another time.'}\n\n` +
            `🔄 Type *BACK* to see available slots again.`
        );
        console.log('⏰ ===== TIME SELECTION END (SLOT TAKEN) =====\n');
        return;
    }

    console.log('✅ Time is available, proceeding with booking');
    
    userSession.bookingData.time = timeStr;
    userSession.bookingData.formattedTime = formatTime(timeStr);

    // Calculate end time
    userSession.bookingData.endTime = calculateEndTime(
        timeStr, 
        userSession.bookingData.serviceDuration
    );
    
    console.log('📅 Booking data updated:', {
        time: userSession.bookingData.time,
        formattedTime: userSession.bookingData.formattedTime,
        endTime: userSession.bookingData.endTime
    });

    // Ask for customer name
    await message.reply(
        `👤 *Your Name*\n\n` +
        `Please enter your full name:\n\n` +
        `📝 *Example:* John Doe`
    );
    
    userSession.bookingState = BOOKING_STATES.AWAITING_CUSTOMER_NAME;
    
    console.log('✅ Moving to next state:', BOOKING_STATES.AWAITING_CUSTOMER_NAME);
    console.log('⏰ ===== TIME SELECTION END (SUCCESS) =====\n');
}

/**
 * STEP 5: Handle customer name
 */
async function handleCustomerName(message, userSession) {
    const name = message.body.trim();
    
    if (name.length < 2) {
        await message.reply(
            `❌ *Invalid Name*\n\n` +
            `Please enter your full name (minimum 2 characters).`
        );
        return;
    }

    userSession.bookingData.customerName = name;

    // Ask for phone number
    await message.reply(
        `📱 *Phone Number*\n\n` +
        `Please enter your 10-digit mobile number:\n\n` +
        `📝 *Example:* 9876543210`
    );
    
    userSession.bookingState = BOOKING_STATES.AWAITING_PHONE;
}

/**
 * STEP 6: Handle phone input
 */
async function handlePhoneInput(message, userSession) {
    const phone = message.body.trim();
    
    if (!validatePhone(phone)) {
        await message.reply(
            `❌ *Invalid Phone Number*\n\n` +
            `Please enter a valid 10-digit mobile number.\n` +
            `📝 *Example:* 9876543210`
        );
        return;
    }

    userSession.bookingData.phoneNumber = phone;

    // Calculate total amount
    const totalAmount = userSession.bookingData.servicePrice || 0;
    
    // Check if payment required (from service settings)
    const paymentRequired = false; // Default to false for now

    // Show booking summary
    let summaryMsg = `📋 *BOOKING SUMMARY*\n`;
    summaryMsg += `═══════════════════\n\n`;
    summaryMsg += `👤 *Customer:* ${userSession.bookingData.customerName}\n`;
    summaryMsg += `📱 *Phone:* ${userSession.bookingData.phoneNumber}\n`;
    summaryMsg += `🛎️ *Service:* ${userSession.bookingData.serviceName}\n`;
    summaryMsg += `📅 *Date:* ${userSession.bookingData.formattedDate}\n`;
    summaryMsg += `⏰ *Time:* ${userSession.bookingData.formattedTime}\n`;
    summaryMsg += `⏱️ *Duration:* ${userSession.bookingData.serviceDuration} mins\n`;
    summaryMsg += `📍 *Location:* Professional's address\n\n`;
    summaryMsg += `💰 *Total:* ${formatCurrency(totalAmount)}\n\n`;

    if (paymentRequired) {
        summaryMsg += `💳 *Payment Required*\n\n`;
        summaryMsg += `✅ Type *CONFIRM & PAY* to proceed to payment\n`;
    } else {
        summaryMsg += `✅ *No Payment Required*\n\n`;
        summaryMsg += `✅ Type *CONFIRM* to book\n`;
    }
    
    summaryMsg += `❌ Type *CANCEL* to stop`;

    userSession.bookingData.paymentRequired = paymentRequired;
    userSession.bookingData.totalAmount = totalAmount;
    userSession.bookingState = BOOKING_STATES.AWAITING_CONFIRMATION;
    
    await message.reply(summaryMsg);
}

/**
 * STEP 7: Handle final confirmation
 */
async function handleFinalConfirmation(message, userSession, client) {
    const input = message.body.trim().toLowerCase();
    
    if (input === 'confirm' || input === 'confirm & pay') {
        
        // Set professional address as default location
        userSession.bookingData.locationType = 'professional_address';
        userSession.bookingData.address = 'Professional\'s address';

        // Check if payment required
        if (userSession.bookingData.paymentRequired) {
            // Save booking with pending status
            const saveResult = await saveBooking(
                userSession, 
                userSession.bookingData, 
                true // payment required
            );

            if (!saveResult.success) {
                await message.reply(
                    `❌ *Booking Failed*\n\n` +
                    `${saveResult.message}\n\n` +
                    `Please try again or contact support.`
                );
                return;
            }

            userSession.bookingData.bookingNumber = saveResult.bookingNumber;
            userSession.bookingData.bookingId = saveResult.booking._id;

            // Show payment instructions
            await showPaymentInstructions(message, userSession, saveResult.booking);
            // Payment would be handled by separate payment handler
            
        } else {
            // Save booking with confirmed status
            const saveResult = await saveBooking(
                userSession, 
                userSession.bookingData, 
                false // no payment required
            );

            if (!saveResult.success) {
                await message.reply(
                    `❌ *Booking Failed*\n\n` +
                    `${saveResult.message}\n\n` +
                    `Please try again or contact support.`
                );
                return;
            }

            // Send confirmation
            await sendBookingConfirmation(message, userSession, saveResult.booking);
            
            // Reset session
            userSession.bookingState = BOOKING_STATES.IDLE;
            userSession.bookingData = {};
        }
        
    } else if (input === 'cancel') {
        await message.reply(
            `❌ *Booking Cancelled*\n\n` +
            `Your booking has been cancelled.\n` +
            `Type *Book* to start again.`
        );
        userSession.bookingState = BOOKING_STATES.IDLE;
        userSession.bookingData = {};
    } else {
        await message.reply(
            `❓ *Please type CONFIRM to book or CANCEL to stop*`
        );
    }
}

/**
 * Show payment instructions
 */
async function showPaymentInstructions(message, userSession, booking) {
    const paymentMsg = 
        `💰 *PAYMENT REQUIRED*\n\n` +
        `Booking #: ${booking.bookingNumber}\n` +
        `Amount: ${formatCurrency(booking.totalAmount)}\n\n` +
        `💳 *UPI Payment:*\n` +
        `📱 UPI ID: merchant@okhdfcbank\n\n` +
        `🔢 *Important:*\n` +
        `• Pay exact amount: ${formatCurrency(booking.totalAmount)}\n` +
        `• Add note: "${booking.bookingNumber}"\n` +
        `• Keep screenshot after payment\n\n` +
        `📸 *Send payment screenshot here*\n\n` +
        `⏱️ *Booking will be confirmed after payment verification*`;

    await message.reply(paymentMsg);
}

/**
 * Send booking confirmation
 */
async function sendBookingConfirmation(message, userSession, booking) {
    const confirmMsg = 
        `✅ *BOOKING CONFIRMED!*\n\n` +
        `Booking #: ${booking.bookingNumber}\n` +
        `Service: ${booking.serviceName}\n` +
        `Date: ${userSession.bookingData.formattedDate}\n` +
        `Time: ${userSession.bookingData.formattedTime}\n` +
        `Location: Professional's address\n\n` +
        `📱 You'll receive a reminder before your booking.\n` +
        `❌ To cancel, reply with "CANCEL ${booking.bookingNumber}"\n\n` +
        `Thank you for choosing us! 🎉`;

    await message.reply(confirmMsg);
}

/**
 * Handle cancellation request
 */
async function handleCancellationRequest(message, userSession) {
    const userMessage = message.body.trim().toLowerCase();
    
    if (userMessage.includes('cancel') && 
        !userMessage.includes('confirm') && 
        userSession.bookingState !== BOOKING_STATES.AWAITING_CANCELLATION_CONFIRMATION) {
        
        await message.reply(
            `🛑 *Cancel Booking Process?*\n\n` +
            `Are you sure you want to cancel?\n\n` +
            `✅ Type *YES* to confirm cancellation\n` +
            `❌ Type *NO* to continue`
        );
        
        userSession.previousState = userSession.bookingState;
        userSession.bookingState = BOOKING_STATES.AWAITING_CANCELLATION_CONFIRMATION;
        return true;
    }
    
    return false;
}

/**
 * Handle cancellation confirmation
 */
async function handleCancellationConfirmation(message, userSession, userSessions) {
    const response = message.body.trim().toLowerCase();
    
    if (response === 'yes' || response === 'y') {
        await message.reply(
            `❌ *Booking Process Cancelled*\n\n` +
            `Your booking has been cancelled.\n` +
            `Type *Book* to start again.`
        );
        
        userSession.bookingState = BOOKING_STATES.IDLE;
        userSession.bookingData = {};
        
    } else if (response === 'no' || response === 'n') {
        userSession.bookingState = userSession.previousState || BOOKING_STATES.AWAITING_CONFIRMATION;
        delete userSession.previousState;
        
        await message.reply(`✅ *Continuing your booking...*`);
        
    } else {
        await message.reply(
            `❓ Please type *YES* to cancel or *NO* to continue.`
        );
    }
}