// whatsapp-bot/whatsapp/handlers/bookingService/index.js

import { handleMyBookings } from './bookingFlowHandler.js';
import { handleBookingFlow } from './bookingFlowHandler.js';
import { checkAvailability, getAvailableSlots } from './availabilityValidator.js'; // REMOVED calculateAvailableSlots
import { calculateSlots, isWithinWorkingHours, timeToMinutes, minutesToTime } from './slotCalculator.js';
import { saveBooking, cancelUserBooking } from './bookingStorage.js';
import * as bookingUtils from './bookingUtils.js';

export {
    // Main flow - SIMPLIFIED version for single business
    handleBookingFlow,
    handleMyBookings,
    
    // Validation layer
    checkAvailability,
    getAvailableSlots,
    // REMOVED: calculateAvailableSlots (not exported from availabilityValidator.js)
    
    // Slot calculation utilities
    calculateSlots,
    isWithinWorkingHours,
    timeToMinutes,
    minutesToTime,
    
    // Storage layer (ONLY these write to DB)
    saveBooking,
    cancelUserBooking,
    
    // All utilities
    bookingUtils
};