// // whatsapp-bot/whatsapp/handlers/bookingService/slotCalculator.js
// // PURPOSE: Pure calculation logic - no API calls

// import { formatTime } from './bookingUtils.js';

// /**
//  * Convert time string to minutes
//  */
// export function timeToMinutes(time) {
//     const [hours, minutes] = time.split(':').map(Number);
//     return hours * 60 + minutes;
// }

// /**
//  * Convert minutes to time string
//  */
// export function minutesToTime(minutes) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
// }

// /**
//  * Check if a time range is within working hours
//  */
// export function isWithinWorkingHours(startTime, endTime, workStart, workEnd, buffer = 15) {
//     const start = timeToMinutes(startTime);
//     const end = timeToMinutes(endTime);
//     const workStartMin = timeToMinutes(workStart);
//     const workEndMin = timeToMinutes(workEnd);

//     return start >= workStartMin && end <= workEndMin;
// }

// /**
//  * Check if a time slot overlaps with breaks
//  */
// export function isDuringBreak(time, breaks) {
//     if (!breaks || breaks.length === 0) return false;
    
//     const timeMinutes = timeToMinutes(time);
    
//     return breaks.some(breakItem => {
//         const breakStart = timeToMinutes(breakItem.startTime);
//         const breakEnd = timeToMinutes(breakItem.endTime);
//         return timeMinutes >= breakStart && timeMinutes < breakEnd;
//     });
// }

// /**
//  * Calculate available time slots
//  * Uses: working hours, breaks, buffer time, existing bookings
//  */
// export function calculateSlots(workingDay, existingBookings, bufferMinutes, date) {
//     // ===== VALIDATION =====
//     // Check if workingDay exists and has required properties
//     if (!workingDay) {
//         console.log('❌ calculateSlots: No workingDay provided');
//         return [];
//     }
    
//     if (!workingDay.startTime || !workingDay.endTime) {
//         console.log('❌ calculateSlots: workingDay missing startTime or endTime', workingDay);
//         return [];
//     }
    
//     if (!workingDay.isAvailable) {
//         console.log('❌ calculateSlots: workingDay is not available');
//         return [];
//     }
    
//     // ===== DEBUG LOGGING =====
//     console.log('🔧 calculateSlots called with:', {
//         workingDay: {
//             start: workingDay.startTime,
//             end: workingDay.endTime,
//             isAvailable: workingDay.isAvailable,
//             hasBreaks: workingDay.breaks?.length || 0
//         },
//         existingBookingsCount: existingBookings?.length || 0,
//         bufferMinutes,
//         date
//     });
    
//     const slots = [];
    
//     // Convert working hours to minutes
//     const workStart = timeToMinutes(workingDay.startTime);
//     const workEnd = timeToMinutes(workingDay.endTime);
    
//     console.log('⏰ Working hours in minutes:', { 
//         workStart, 
//         workEnd,
//         workStartTime: workingDay.startTime,
//         workEndTime: workingDay.endTime
//     });
    
//     // Validate working hours
//     if (workStart >= workEnd) {
//         console.log('❌ Invalid working hours: start time >= end time');
//         return [];
//     }
    
//     // Convert existing bookings to occupied slots
//     const occupiedSlots = (existingBookings || []).map(booking => ({
//         start: timeToMinutes(booking.startTime),
//         end: timeToMinutes(booking.endTime)
//     }));

//     // Convert breaks to occupied slots
//     if (workingDay.breaks && workingDay.breaks.length > 0) {
//         workingDay.breaks.forEach((breakItem, index) => {
//             // Validate break times
//             if (breakItem.startTime && breakItem.endTime) {
//                 occupiedSlots.push({
//                     start: timeToMinutes(breakItem.startTime),
//                     end: timeToMinutes(breakItem.endTime),
//                     isBreak: true
//                 });
//             } else {
//                 console.log(`⚠️ Break ${index} missing start/end time:`, breakItem);
//             }
//         });
//     }

//     // Sort occupied slots by start time
//     occupiedSlots.sort((a, b) => a.start - b.start);
    
//     console.log('📊 Occupied slots:', occupiedSlots.map(o => ({
//         start: minutesToTime(o.start),
//         end: minutesToTime(o.end),
//         isBreak: o.isBreak || false
//     })));

//     // Generate slots in buffer-minute increments
//     let currentSlot = workStart;
//     let slotCount = 0;
//     const maxSlots = 100; // Safety limit
    
//     while (currentSlot + bufferMinutes <= workEnd && slotCount < maxSlots) {
//         const slotStart = currentSlot;
//         const slotEnd = currentSlot + bufferMinutes;
        
//         // Check if slot overlaps with any occupied slot
//         const isOccupied = occupiedSlots.some(occupied => 
//             (slotStart >= occupied.start && slotStart < occupied.end) ||
//             (slotEnd > occupied.start && slotEnd <= occupied.end) ||
//             (slotStart <= occupied.start && slotEnd >= occupied.end)
//         );

//         if (!isOccupied) {
//             const timeStr = minutesToTime(slotStart);
//             slots.push({
//                 time: timeStr,
//                 displayTime: formatTime(timeStr),
//                 startMinutes: slotStart,
//                 endMinutes: slotEnd,
//                 available: true,
//                 date: date
//             });
//         }

//         currentSlot += bufferMinutes;
//         slotCount++;
//     }

//     console.log('✅ Generated slots:', {
//         total: slots.length,
//         firstFew: slots.slice(0, 3).map(s => s.displayTime),
//         workHours: `${workingDay.startTime} - ${workingDay.endTime}`,
//         buffer: bufferMinutes
//     });

//     return slots;
// }

// /**
//  * Get next available slots
//  */
// export function getNextAvailableSlots(availableSlots, count = 5) {
//     return availableSlots.slice(0, count);
// }

// /**
//  * Group slots by time of day
//  */
// export function groupSlotsByTimeOfDay(slots) {
//     const groups = {
//         morning: [],   // 6 AM - 12 PM
//         afternoon: [], // 12 PM - 5 PM
//         evening: []    // 5 PM - 10 PM
//     };

//     slots.forEach(slot => {
//         const hour = parseInt(slot.time.split(':')[0]);
        
//         if (hour >= 6 && hour < 12) {
//             groups.morning.push(slot);
//         } else if (hour >= 12 && hour < 17) {
//             groups.afternoon.push(slot);
//         } else if (hour >= 17 && hour < 22) {
//             groups.evening.push(slot);
//         }
//     });

//     return groups;
// }

// /**
//  * Check if a time slot is valid (not in past)
//  */
// export function isSlotInFuture(slotTime, date) {
//     const now = new Date();
//     const slotDate = new Date(date);
//     const [hours, minutes] = slotTime.split(':').map(Number);
    
//     slotDate.setHours(hours, minutes, 0, 0);
    
//     return slotDate > now;
// }

// /**
//  * Filter out past slots for today
//  */
// export function filterPastSlots(slots, date) {
//     const today = new Date().toISOString().split('T')[0];
    
//     // If not today, return all slots
//     if (date !== today) {
//         return slots;
//     }

//     // If today, filter out past slots
//     return slots.filter(slot => isSlotInFuture(slot.time, date));
// }

// /**
//  * Calculate duration between two times
//  */
// export function calculateDuration(startTime, endTime) {
//     const start = timeToMinutes(startTime);
//     const end = timeToMinutes(endTime);
//     return end - start;
// }

// /**
//  * Check if two time ranges overlap
//  */
// export function doTimeRangesOverlap(start1, end1, start2, end2, buffer = 0) {
//     const s1 = timeToMinutes(start1) - buffer;
//     const e1 = timeToMinutes(end1) + buffer;
//     const s2 = timeToMinutes(start2);
//     const e2 = timeToMinutes(end2);

//     return (s1 < e2) && (s2 < e1);
// }














// whatsapp-bot/whatsapp/handlers/bookingService/slotCalculator.js
// PURPOSE: Pure calculation logic - no API calls
// UPDATED: Full multi-tenant support with company-specific calculations

import { formatTime } from './bookingUtils.js';

/**
 * Convert time string to minutes
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export function timeToMinutes(time) {
    if (!time || typeof time !== 'string') {
        console.warn('⚠️ Invalid time input to timeToMinutes:', time);
        return 0;
    }
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
export function minutesToTime(minutes) {
    if (minutes < 0 || minutes >= 1440) {
        console.warn('⚠️ Minutes out of range:', minutes);
        minutes = Math.max(0, Math.min(minutes, 1439));
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Check if a time range is within working hours
 * @param {string} startTime - Start time to check
 * @param {string} endTime - End time to check
 * @param {string} workStart - Working hours start
 * @param {string} workEnd - Working hours end
 * @param {number} buffer - Buffer time in minutes
 * @returns {boolean} True if within working hours
 */
export function isWithinWorkingHours(startTime, endTime, workStart, workEnd, buffer = 15) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const workStartMin = timeToMinutes(workStart);
    const workEndMin = timeToMinutes(workEnd);

    return start >= workStartMin && end <= workEndMin;
}

/**
 * Check if a time slot overlaps with breaks
 * @param {string} time - Time to check
 * @param {Array} breaks - Array of break objects
 * @returns {boolean} True if during break
 */
export function isDuringBreak(time, breaks) {
    if (!breaks || breaks.length === 0) return false;
    
    const timeMinutes = timeToMinutes(time);
    
    return breaks.some(breakItem => {
        if (!breakItem.startTime || !breakItem.endTime) return false;
        const breakStart = timeToMinutes(breakItem.startTime);
        const breakEnd = timeToMinutes(breakItem.endTime);
        return timeMinutes >= breakStart && timeMinutes < breakEnd;
    });
}

/**
 * Calculate available time slots with multi-tenant support
 * Uses: working hours, breaks, buffer time, existing bookings
 * 
 * @param {Object} workingDay - Working hours for the day
 * @param {Array} existingBookings - Existing bookings for the day
 * @param {number} bufferMinutes - Buffer time between slots
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} companyId - Company ID for multi-tenant isolation (optional)
 * @returns {Array} Available slots
 */
export function calculateSlots(workingDay, existingBookings, bufferMinutes, date, companyId = null) {
    // ===== VALIDATION =====
    // Check if workingDay exists and has required properties
    if (!workingDay) {
        console.log('❌ calculateSlots: No workingDay provided');
        return [];
    }
    
    if (!workingDay.startTime || !workingDay.endTime) {
        console.log('❌ calculateSlots: workingDay missing startTime or endTime', workingDay);
        return [];
    }
    
    if (!workingDay.isAvailable) {
        console.log('❌ calculateSlots: workingDay is not available');
        return [];
    }
    
    // ===== DEBUG LOGGING =====
    console.log('🔧 calculateSlots called with:', {
        workingDay: {
            start: workingDay.startTime,
            end: workingDay.endTime,
            isAvailable: workingDay.isAvailable,
            hasBreaks: workingDay.breaks?.length || 0
        },
        existingBookingsCount: existingBookings?.length || 0,
        bufferMinutes,
        date,
        companyId: companyId || 'default'
    });
    
    const slots = [];
    
    // Convert working hours to minutes
    const workStart = timeToMinutes(workingDay.startTime);
    const workEnd = timeToMinutes(workingDay.endTime);
    
    console.log('⏰ Working hours in minutes:', { 
        workStart, 
        workEnd,
        workStartTime: workingDay.startTime,
        workEndTime: workingDay.endTime
    });
    
    // Validate working hours
    if (workStart >= workEnd) {
        console.log('❌ Invalid working hours: start time >= end time');
        return [];
    }
    
    // Validate buffer minutes
    if (bufferMinutes <= 0) {
        console.log('⚠️ Buffer minutes is 0 or negative, using default 15');
        bufferMinutes = 15;
    }
    
    // Convert existing bookings to occupied slots
    const occupiedSlots = (existingBookings || []).map(booking => ({
        start: timeToMinutes(booking.startTime),
        end: timeToMinutes(booking.endTime),
        bookingId: booking._id || booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        companyId: booking.companyId // Include for multi-tenant validation
    }));

    // Convert breaks to occupied slots
    if (workingDay.breaks && workingDay.breaks.length > 0) {
        workingDay.breaks.forEach((breakItem, index) => {
            // Validate break times
            if (breakItem.startTime && breakItem.endTime) {
                occupiedSlots.push({
                    start: timeToMinutes(breakItem.startTime),
                    end: timeToMinutes(breakItem.endTime),
                    isBreak: true,
                    breakName: breakItem.name || `Break ${index + 1}`
                });
            } else {
                console.log(`⚠️ Break ${index} missing start/end time:`, breakItem);
            }
        });
    }

    // Sort occupied slots by start time
    occupiedSlots.sort((a, b) => a.start - b.start);
    
    console.log('📊 Occupied slots:', occupiedSlots.map(o => ({
        start: minutesToTime(o.start),
        end: minutesToTime(o.end),
        isBreak: o.isBreak || false,
        bookingNumber: o.bookingNumber
    })));

    // Generate slots in buffer-minute increments
    let currentSlot = workStart;
    let slotCount = 0;
    const maxSlots = 100; // Safety limit
    
    while (currentSlot + bufferMinutes <= workEnd && slotCount < maxSlots) {
        const slotStart = currentSlot;
        const slotEnd = currentSlot + bufferMinutes;
        
        // Check if slot overlaps with any occupied slot
        const isOccupied = occupiedSlots.some(occupied => 
            (slotStart >= occupied.start && slotStart < occupied.end) ||
            (slotEnd > occupied.start && slotEnd <= occupied.end) ||
            (slotStart <= occupied.start && slotEnd >= occupied.end)
        );

        if (!isOccupied) {
            const timeStr = minutesToTime(slotStart);
            slots.push({
                time: timeStr,
                displayTime: formatTime(timeStr),
                startMinutes: slotStart,
                endMinutes: slotEnd,
                available: true,
                date: date,
                companyId: companyId // Store company context
            });
        }

        currentSlot += bufferMinutes;
        slotCount++;
    }

    console.log('✅ Generated slots:', {
        total: slots.length,
        firstFew: slots.slice(0, 3).map(s => s.displayTime),
        workHours: `${workingDay.startTime} - ${workingDay.endTime}`,
        buffer: bufferMinutes,
        companyId: companyId || 'default'
    });

    return slots;
}

/**
 * Get next available slots
 * @param {Array} availableSlots - Array of available slots
 * @param {number} count - Number of slots to return
 * @returns {Array} Next available slots
 */
export function getNextAvailableSlots(availableSlots, count = 5) {
    if (!availableSlots || !Array.isArray(availableSlots)) return [];
    return availableSlots.slice(0, count);
}

/**
 * Group slots by time of day
 * @param {Array} slots - Array of slots
 * @returns {Object} Grouped slots
 */
export function groupSlotsByTimeOfDay(slots) {
    if (!slots || !Array.isArray(slots)) {
        return { morning: [], afternoon: [], evening: [] };
    }

    const groups = {
        morning: [],   // 6 AM - 12 PM
        afternoon: [], // 12 PM - 5 PM
        evening: []    // 5 PM - 10 PM
    };

    slots.forEach(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        
        if (hour >= 6 && hour < 12) {
            groups.morning.push(slot);
        } else if (hour >= 12 && hour < 17) {
            groups.afternoon.push(slot);
        } else if (hour >= 17 && hour < 22) {
            groups.evening.push(slot);
        } else {
            // Late night/early morning slots (22:00 - 06:00)
            if (!groups.night) groups.night = [];
            groups.night.push(slot);
        }
    });

    return groups;
}

/**
 * Check if a time slot is valid (not in past)
 * @param {string} slotTime - Time in HH:MM format
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} True if slot is in future
 */
export function isSlotInFuture(slotTime, date) {
    const now = new Date();
    const slotDate = new Date(date);
    const [hours, minutes] = slotTime.split(':').map(Number);
    
    slotDate.setHours(hours, minutes, 0, 0);
    
    return slotDate > now;
}

/**
 * Filter out past slots for today
 * @param {Array} slots - Array of slots
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Filtered slots
 */
export function filterPastSlots(slots, date) {
    if (!slots || !Array.isArray(slots)) return [];
    
    const today = new Date().toISOString().split('T')[0];
    
    // If not today, return all slots
    if (date !== today) {
        return slots;
    }

    // If today, filter out past slots
    return slots.filter(slot => isSlotInFuture(slot.time, date));
}

/**
 * Calculate duration between two times
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Duration in minutes
 */
export function calculateDuration(startTime, endTime) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    return end - start;
}

/**
 * Check if two time ranges overlap
 * @param {string} start1 - First slot start
 * @param {string} end1 - First slot end
 * @param {string} start2 - Second slot start
 * @param {string} end2 - Second slot end
 * @param {number} buffer - Buffer time in minutes
 * @returns {boolean} True if ranges overlap
 */
export function doTimeRangesOverlap(start1, end1, start2, end2, buffer = 0) {
    const s1 = timeToMinutes(start1) - buffer;
    const e1 = timeToMinutes(end1) + buffer;
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);

    return (s1 < e2) && (s2 < e1);
}

/**
 * Merge consecutive available slots
 * @param {Array} slots - Array of slots
 * @returns {Array} Merged slots
 */
export function mergeConsecutiveSlots(slots) {
    if (!slots || slots.length === 0) return [];
    
    const merged = [];
    let currentGroup = {
        start: slots[0].time,
        end: slots[0].time,
        count: 1,
        slots: [slots[0]]
    };

    for (let i = 1; i < slots.length; i++) {
        const prevEnd = slots[i-1].endMinutes;
        const currStart = slots[i].startMinutes;
        
        if (currStart === prevEnd) {
            // Consecutive slot
            currentGroup.end = slots[i].time;
            currentGroup.count++;
            currentGroup.slots.push(slots[i]);
        } else {
            // Gap found, push current group and start new
            merged.push(currentGroup);
            currentGroup = {
                start: slots[i].time,
                end: slots[i].time,
                count: 1,
                slots: [slots[i]]
            };
        }
    }
    merged.push(currentGroup);

    return merged;
}

/**
 * Format time range for display
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {string} Formatted range
 */
export function formatTimeRange(startTime, endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Calculate total available minutes in a day
 * @param {Object} workingDay - Working day object
 * @param {Array} existingBookings - Existing bookings
 * @param {number} bufferMinutes - Buffer time
 * @returns {number} Total available minutes
 */
export function calculateTotalAvailableMinutes(workingDay, existingBookings, bufferMinutes) {
    if (!workingDay || !workingDay.isAvailable) return 0;
    
    const workStart = timeToMinutes(workingDay.startTime);
    const workEnd = timeToMinutes(workingDay.endTime);
    const totalWorkMinutes = workEnd - workStart;
    
    // Subtract occupied minutes
    let occupiedMinutes = 0;
    if (existingBookings && existingBookings.length > 0) {
        existingBookings.forEach(booking => {
            const start = timeToMinutes(booking.startTime);
            const end = timeToMinutes(booking.endTime);
            occupiedMinutes += (end - start);
        });
    }
    
    // Subtract break minutes
    if (workingDay.breaks && workingDay.breaks.length > 0) {
        workingDay.breaks.forEach(breakItem => {
            if (breakItem.startTime && breakItem.endTime) {
                const breakStart = timeToMinutes(breakItem.startTime);
                const breakEnd = timeToMinutes(breakItem.endTime);
                occupiedMinutes += (breakEnd - breakStart);
            }
        });
    }
    
    // Available minutes = total work minutes - occupied minutes
    // Then divide by buffer to get number of slots, then multiply back
    const availableMinutes = Math.max(0, totalWorkMinutes - occupiedMinutes);
    const numberOfSlots = Math.floor(availableMinutes / bufferMinutes);
    
    return numberOfSlots * bufferMinutes;
}

/**
 * Get slot statistics
 * @param {Array} slots - Array of slots
 * @returns {Object} Slot statistics
 */
export function getSlotStats(slots) {
    if (!slots || slots.length === 0) {
        return {
            total: 0,
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        };
    }

    const groups = groupSlotsByTimeOfDay(slots);
    
    return {
        total: slots.length,
        morning: groups.morning?.length || 0,
        afternoon: groups.afternoon?.length || 0,
        evening: groups.evening?.length || 0,
        night: groups.night?.length || 0
    };
}

// Export all functions as default object
export default {
    timeToMinutes,
    minutesToTime,
    isWithinWorkingHours,
    isDuringBreak,
    calculateSlots,
    getNextAvailableSlots,
    groupSlotsByTimeOfDay,
    isSlotInFuture,
    filterPastSlots,
    calculateDuration,
    doTimeRangesOverlap,
    mergeConsecutiveSlots,
    formatTimeRange,
    calculateTotalAvailableMinutes,
    getSlotStats
};