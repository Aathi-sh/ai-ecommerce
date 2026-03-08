// whatsapp-bot/whatsapp/handlers/bookingService/slotCalculator.js
// PURPOSE: Pure calculation logic - no API calls

import { formatTime } from './bookingUtils.js';

/**
 * Convert time string to minutes
 */
export function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convert minutes to time string
 */
export function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Check if a time range is within working hours
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
 */
export function isDuringBreak(time, breaks) {
    if (!breaks || breaks.length === 0) return false;
    
    const timeMinutes = timeToMinutes(time);
    
    return breaks.some(breakItem => {
        const breakStart = timeToMinutes(breakItem.startTime);
        const breakEnd = timeToMinutes(breakItem.endTime);
        return timeMinutes >= breakStart && timeMinutes < breakEnd;
    });
}

/**
 * Calculate available time slots
 * Uses: working hours, breaks, buffer time, existing bookings
 */
export function calculateSlots(workingDay, existingBookings, bufferMinutes, date) {
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
        date
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
    
    // Convert existing bookings to occupied slots
    const occupiedSlots = (existingBookings || []).map(booking => ({
        start: timeToMinutes(booking.startTime),
        end: timeToMinutes(booking.endTime)
    }));

    // Convert breaks to occupied slots
    if (workingDay.breaks && workingDay.breaks.length > 0) {
        workingDay.breaks.forEach((breakItem, index) => {
            // Validate break times
            if (breakItem.startTime && breakItem.endTime) {
                occupiedSlots.push({
                    start: timeToMinutes(breakItem.startTime),
                    end: timeToMinutes(breakItem.endTime),
                    isBreak: true
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
        isBreak: o.isBreak || false
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
                date: date
            });
        }

        currentSlot += bufferMinutes;
        slotCount++;
    }

    console.log('✅ Generated slots:', {
        total: slots.length,
        firstFew: slots.slice(0, 3).map(s => s.displayTime),
        workHours: `${workingDay.startTime} - ${workingDay.endTime}`,
        buffer: bufferMinutes
    });

    return slots;
}

/**
 * Get next available slots
 */
export function getNextAvailableSlots(availableSlots, count = 5) {
    return availableSlots.slice(0, count);
}

/**
 * Group slots by time of day
 */
export function groupSlotsByTimeOfDay(slots) {
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
        }
    });

    return groups;
}

/**
 * Check if a time slot is valid (not in past)
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
 */
export function filterPastSlots(slots, date) {
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
 */
export function calculateDuration(startTime, endTime) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    return end - start;
}

/**
 * Check if two time ranges overlap
 */
export function doTimeRangesOverlap(start1, end1, start2, end2, buffer = 0) {
    const s1 = timeToMinutes(start1) - buffer;
    const e1 = timeToMinutes(end1) + buffer;
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);

    return (s1 < e2) && (s2 < e1);
}