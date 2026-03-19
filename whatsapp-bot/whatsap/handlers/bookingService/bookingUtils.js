// // whatsapp-bot/whatsapp/handlers/bookingService/bookingUtils.js
// import bookingApiService from '../../../services/booking-api.js';

// /**
//  * Safe number parsing
//  */
// export const safeNumber = (value, defaultValue = 0) => {
//     if (value === null || value === undefined) return defaultValue;
//     if (typeof value === 'number') return value;
//     const parsed = parseFloat(value);
//     return isNaN(parsed) ? defaultValue : parsed;
// };

// export const safeToFixed = (value, digits = 2) => {
//     const num = safeNumber(value);
//     return num.toFixed(digits);
// };

// /**
//  * Generate booking number
//  */
// export const generateBookingNumber = () => {
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const random = Math.floor(10000 + Math.random() * 90000);
//     return `BK-${year}${month}${day}-${random}`;
// };

// /**
//  * Format currency
//  */
// export const formatCurrency = (amount, currency = 'INR') => {
//     const num = safeNumber(amount);
//     return new Intl.NumberFormat('en-IN', {
//         style: 'currency',
//         currency: currency,
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 2
//     }).format(num);
// };

// /**
//  * Clean phone number
//  */
// export const cleanPhoneNumber = (phoneNumber) => {
//     if (!phoneNumber) return '';
    
//     if (phoneNumber.includes('@')) {
//         const numberPart = phoneNumber.split('@')[0];
//         const digits = numberPart.replace(/\D/g, '');
        
//         if (digits.length === 12 && digits.startsWith('91')) {
//             return digits.substring(2);
//         } else if (digits.length === 10) {
//             return digits;
//         } else if (digits.length > 10) {
//             return digits.slice(-10);
//         }
//     }
    
//     const cleaned = phoneNumber.replace(/\D/g, '');
    
//     if (cleaned.length === 12 && cleaned.startsWith('91')) {
//         return cleaned.substring(2);
//     } else if (cleaned.length === 10) {
//         return cleaned;
//     } else if (cleaned.length > 10) {
//         if (cleaned.startsWith('91')) {
//             return cleaned.substring(2, 12);
//         }
//         return cleaned.slice(-10);
//     }
    
//     return cleaned;
// };

// /**
//  * Validate phone number
//  */
// export const validatePhone = (phone) => {
//     const cleaned = cleanPhoneNumber(phone);
//     return cleaned.length === 10;
// };

// /**
//  * Format date for display
//  */
// export const formatDate = (dateInput) => {
//     if (!dateInput) return 'N/A';
    
//     try {
//         const date = new Date(dateInput);
//         if (isNaN(date.getTime())) return 'N/A';
        
//         return date.toLocaleDateString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric'
//         });
//     } catch (error) {
//         return 'N/A';
//     }
// };

// /**
//  * Format time for display (12-hour format)
//  */
// export const formatTime = (timeInput) => {
//     if (!timeInput) return 'N/A';
    
//     try {
//         // Handle "HH:MM" format
//         if (typeof timeInput === 'string' && timeInput.includes(':')) {
//             const [hours, minutes] = timeInput.split(':').map(Number);
//             const period = hours >= 12 ? 'PM' : 'AM';
//             const displayHour = hours % 12 || 12;
//             return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
//         }
        
//         // Handle Date object
//         const date = new Date(timeInput);
//         if (isNaN(date.getTime())) return 'N/A';
        
//         return date.toLocaleTimeString('en-IN', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//         });
//     } catch (error) {
//         return 'N/A';
//     }
// };

// /**
//  * Format date and time together
//  */
// export const formatDateTime = (dateInput, timeInput) => {
//     return `${formatDate(dateInput)} at ${formatTime(timeInput)}`;
// };

// /**
//  * Parse date from user input
//  */
// export const parseDateInput = (input) => {
//     const lower = input.toLowerCase().trim();
    
//     // Handle "today", "tomorrow"
//     if (lower === 'today') {
//         const date = new Date();
//         return date.toISOString().split('T')[0];
//     }
    
//     if (lower === 'tomorrow') {
//         const date = new Date();
//         date.setDate(date.getDate() + 1);
//         return date.toISOString().split('T')[0];
//     }

//     // DD/MM/YYYY or DD-MM-YYYY
//     const datePattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
//     const match = input.match(datePattern);
    
//     if (match) {
//         const day = parseInt(match[1]);
//         const month = parseInt(match[2]) - 1;
//         const year = parseInt(match[3]);
        
//         const date = new Date(year, month, day);
//         if (!isNaN(date.getTime())) {
//             return date.toISOString().split('T')[0];
//         }
//     }

//     return null;
// };

// /**
//  * Parse time from user input
//  */
// export const parseTimeInput = (input) => {
//     const lower = input.toLowerCase().trim();
    
//     // Handle "2pm", "2:30pm", "14:30" formats
//     const patterns = [
//         /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i,
//         /^(\d{1,2})[.:](\d{2})\s*(am|pm)?$/i
//     ];

//     for (const pattern of patterns) {
//         const match = lower.match(pattern);
//         if (match) {
//             let hours = parseInt(match[1]);
//             const minutes = match[2] ? parseInt(match[2]) : 0;
//             const period = match[3]?.toLowerCase();

//             if (period === 'pm' && hours < 12) hours += 12;
//             if (period === 'am' && hours === 12) hours = 0;

//             if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
//                 return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
//             }
//         }
//     }

//     return null;
// };

// /**
//  * Calculate end time based on start time and duration
//  */
// export const calculateEndTime = (startTime, durationMinutes) => {
//     const [hours, minutes] = startTime.split(':').map(Number);
//     const totalMinutes = hours * 60 + minutes + durationMinutes;
//     const endHours = Math.floor(totalMinutes / 60);
//     const endMinutes = totalMinutes % 60;
//     return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
// };

// /**
//  * Check if date is valid (not in past)
//  */
// export const isValidFutureDate = (dateString, minDaysAdvance = 1) => {
//     const date = new Date(dateString);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const minDate = new Date(today);
//     minDate.setDate(minDate.getDate() + minDaysAdvance);
    
//     return date >= minDate;
// };

// /**
//  * Format booking status with emoji
//  */
// export const formatBookingStatus = (status) => {
//     const statusMap = {
//         'pending': { emoji: '⏳', text: 'PENDING' },
//         'confirmed': { emoji: '✅', text: 'CONFIRMED' },
//         'rescheduled': { emoji: '🔄', text: 'RESCHEDULED' },
//         'in_progress': { emoji: '⚙️', text: 'IN PROGRESS' },
//         'completed': { emoji: '🎉', text: 'COMPLETED' },
//         'cancelled': { emoji: '❌', text: 'CANCELLED' },
//         'no_show': { emoji: '🚫', text: 'NO SHOW' },
//         'refunded': { emoji: '💸', text: 'REFUNDED' },
//         'disputed': { emoji: '⚠️', text: 'DISPUTED' }
//     };
    
//     return statusMap[status?.toLowerCase()] || { emoji: '📋', text: status?.toUpperCase() || 'UNKNOWN' };
// };

// /**
//  * Format payment status with emoji
//  */
// export const formatPaymentStatus = (status) => {
//     const statusMap = {
//         'pending': { emoji: '⏳', text: 'PENDING' },
//         'partial': { emoji: '💰', text: 'PARTIAL' },
//         'paid': { emoji: '✅', text: 'PAID' },
//         'failed': { emoji: '❌', text: 'FAILED' },
//         'refunded': { emoji: '💸', text: 'REFUNDED' }
//     };
    
//     return statusMap[status?.toLowerCase()] || { emoji: '💳', text: status?.toUpperCase() || 'UNKNOWN' };
// };

// /**
//  * Format service type for display
//  */
// export const formatServiceType = (type) => {
//     const types = {
//         'physical': '📍 In-Person',
//         'virtual': '💻 Online',
//         'both': '📍 In-Person or 💻 Online'
//     };
//     return types[type] || type;
// };

// /**
//  * Format professional type for display
//  */
// export const formatProfessionalType = (type) => {
//     const types = {
//         'individual': '👤 Individual',
//         'company': '🏢 Company',
//         'freelancer': '👨‍💼 Freelancer',
//         'agency': '🏛️ Agency'
//     };
//     return types[type] || type;
// };

// /**
//  * Format duration in minutes to readable format
//  */
// export const formatDuration = (minutes) => {
//     if (!minutes) return 'N/A';
    
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
    
//     if (hours === 0) {
//         return `${mins} min${mins !== 1 ? 's' : ''}`;
//     } else if (mins === 0) {
//         return `${hours} hour${hours !== 1 ? 's' : ''}`;
//     } else {
//         return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
//     }
// };

// /**
//  * Format address from object to string
//  */
// export const formatAddress = (addressObj) => {
//     if (!addressObj) return 'Not provided';
//     if (typeof addressObj === 'string') return addressObj;
    
//     const parts = [];
//     if (addressObj.street) parts.push(addressObj.street);
//     if (addressObj.city) parts.push(addressObj.city);
//     if (addressObj.state) parts.push(addressObj.state);
//     if (addressObj.zipCode) parts.push(addressObj.zipCode);
//     if (addressObj.country) parts.push(addressObj.country);
    
//     return parts.join(', ');
// };

// /**
//  * Create session key for user
//  */
// export const createSessionKey = (from, context = 'booking') => {
//     return `${context}_${cleanPhoneNumber(from)}`;
// };

// /**
//  * Cleanup old sessions
//  */
// export const cleanupSessions = (sessionsMap, maxAge = 2 * 60 * 60 * 1000) => {
//     const now = Date.now();
//     for (const [key, session] of sessionsMap.entries()) {
//         if (now - (session.lastActivity || 0) > maxAge) {
//             sessionsMap.delete(key);
//         }
//     }
// };

// /**
//  * Truncate text with ellipsis
//  */
// export const truncateText = (text, maxLength = 50) => {
//     if (!text) return '';
//     if (text.length <= maxLength) return text;
//     return text.substring(0, maxLength) + '...';
// };

// /**
//  * Check if time is within range
//  */
// export const isTimeInRange = (time, startTime, endTime) => {
//     const timeMin = timeToMinutes(time);
//     const startMin = timeToMinutes(startTime);
//     const endMin = timeToMinutes(endTime);
    
//     return timeMin >= startMin && timeMin <= endMin;
// };

// /**
//  * Convert time string to minutes (internal helper)
//  */
// const timeToMinutes = (time) => {
//     const [hours, minutes] = time.split(':').map(Number);
//     return hours * 60 + minutes;
// };

// /**
//  * Get day of week from date
//  */
// export const getDayOfWeek = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
// };

// /**
//  * Check if two time slots overlap
//  */
// export const doSlotsOverlap = (start1, end1, start2, end2, buffer = 0) => {
//     const s1 = timeToMinutes(start1) - buffer;
//     const e1 = timeToMinutes(end1) + buffer;
//     const s2 = timeToMinutes(start2);
//     const e2 = timeToMinutes(end2);

//     return (s1 < e2) && (s2 < e1);
// };

// /**
//  * Extract time components
//  */
// export const extractTimeComponents = (timeString) => {
//     const [hours, minutes] = timeString.split(':').map(Number);
//     return { hours, minutes };
// };

// /**
//  * Add minutes to time
//  */
// export const addMinutesToTime = (timeString, minutesToAdd) => {
//     const { hours, minutes } = extractTimeComponents(timeString);
//     const totalMinutes = hours * 60 + minutes + minutesToAdd;
//     const newHours = Math.floor(totalMinutes / 60) % 24;
//     const newMinutes = totalMinutes % 60;
//     return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
// };

// /**
//  * Get current time in HH:MM format
//  */
// export const getCurrentTime = () => {
//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = now.getMinutes();
//     return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
// };

// /**
//  * Get current date in YYYY-MM-DD format
//  */
// export const getCurrentDate = () => {
//     return new Date().toISOString().split('T')[0];
// };

// /**
//  * Check if a date is today
//  */
// export const isToday = (dateString) => {
//     const today = getCurrentDate();
//     return dateString === today;
// };

// /**
//  * Check if a date is tomorrow
//  */
// export const isTomorrow = (dateString) => {
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const tomorrowStr = tomorrow.toISOString().split('T')[0];
//     return dateString === tomorrowStr;
// };

// /**
//  * Get relative day description
//  */
// export const getRelativeDay = (dateString) => {
//     if (isToday(dateString)) return 'Today';
//     if (isTomorrow(dateString)) return 'Tomorrow';
//     return formatDate(dateString);
// };

// // Export all functions as default object as well
// export default {
//     safeNumber,
//     safeToFixed,
//     generateBookingNumber,
//     formatCurrency,
//     cleanPhoneNumber,
//     validatePhone,
//     formatDate,
//     formatTime,
//     formatDateTime,
//     parseDateInput,
//     parseTimeInput,
//     calculateEndTime,
//     isValidFutureDate,
//     formatBookingStatus,
//     formatPaymentStatus,
//     formatServiceType,
//     formatProfessionalType,
//     formatDuration,
//     formatAddress,
//     createSessionKey,
//     cleanupSessions,
//     truncateText,
//     isTimeInRange,
//     getDayOfWeek,
//     doSlotsOverlap,
//     extractTimeComponents,
//     addMinutesToTime,
//     getCurrentTime,
//     getCurrentDate,
//     isToday,
//     isTomorrow,
//     getRelativeDay
// };






















// whatsapp-bot/whatsapp/handlers/bookingService/bookingUtils.js
// UPDATED: Full multi-tenant support with company context
import bookingApiService from '../../../services/booking-api.js';

/**
 * Safe number parsing
 */
export const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

export const safeToFixed = (value, digits = 2) => {
    const num = safeNumber(value);
    return num.toFixed(digits);
};

/**
 * Generate booking number with company prefix for multi-tenant isolation
 * @param {string} companyId - Company ID for prefix
 * @returns {string} Booking number with company prefix
 */
export const generateBookingNumber = (companyId = null) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    
    // Add company prefix for multi-tenant isolation
    if (companyId) {
        // Use first 4 chars of companyId as prefix
        const companyPrefix = String(companyId).substring(0, 4).toUpperCase();
        return `BK-${companyPrefix}-${year}${month}${day}-${random}`;
    }
    
    return `BK-${year}${month}${day}-${random}`;
};

/**
 * Format currency with company-specific settings (optional)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} companyId - Company ID for company-specific formatting
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'INR', companyId = null) => {
    const num = safeNumber(amount);
    
    // You could add company-specific formatting here
    // For example, different currency symbols per company
    
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
};

/**
 * Clean phone number with multi-tenant support
 * @param {string} phoneNumber - Raw phone number
 * @param {string} companyId - Company ID for company-specific phone formats
 * @returns {string} Cleaned phone number
 */
export const cleanPhoneNumber = (phoneNumber, companyId = null) => {
    if (!phoneNumber) return '';
    
    // Handle WhatsApp ID format (number@lid)
    if (phoneNumber.includes('@')) {
        const numberPart = phoneNumber.split('@')[0];
        const digits = numberPart.replace(/\D/g, '');
        
        // Indian format with country code
        if (digits.length === 12 && digits.startsWith('91')) {
            return digits.substring(2);
        }
        // Direct 10-digit
        else if (digits.length === 10) {
            return digits;
        }
        // Longer than 10 digits - take last 10
        else if (digits.length > 10) {
            // Check if it starts with 91 (Indian format)
            if (digits.startsWith('91')) {
                return digits.substring(2, 12);
            }
            return digits.slice(-10);
        }
    }
    
    // Handle raw number strings
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Indian number with country code
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return cleaned.substring(2);
    }
    // Direct 10-digit
    else if (cleaned.length === 10) {
        return cleaned;
    }
    // US number with country code
    else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return cleaned.substring(1);
    }
    // Longer than 10 digits - take last 10
    else if (cleaned.length > 10) {
        if (cleaned.startsWith('91')) {
            return cleaned.substring(2, 12);
        }
        return cleaned.slice(-10);
    }
    
    return cleaned;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone) => {
    const cleaned = cleanPhoneNumber(phone);
    return cleaned.length === 10;
};

/**
 * Format date for display
 * @param {string|Date} dateInput - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'N/A';
        
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Format time for display (12-hour format)
 * @param {string} timeInput - Time to format (HH:MM)
 * @returns {string} Formatted time
 */
export const formatTime = (timeInput) => {
    if (!timeInput) return 'N/A';
    
    try {
        // Handle "HH:MM" format
        if (typeof timeInput === 'string' && timeInput.includes(':')) {
            const [hours, minutes] = timeInput.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours % 12 || 12;
            return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
        }
        
        // Handle Date object
        const date = new Date(timeInput);
        if (isNaN(date.getTime())) return 'N/A';
        
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Format date and time together
 */
export const formatDateTime = (dateInput, timeInput) => {
    return `${formatDate(dateInput)} at ${formatTime(timeInput)}`;
};

/**
 * Parse date from user input
 * @param {string} input - User input (today, tomorrow, DD/MM/YYYY)
 * @returns {string|null} ISO date string or null
 */
export const parseDateInput = (input) => {
    const lower = input.toLowerCase().trim();
    
    // Handle "today", "tomorrow"
    if (lower === 'today') {
        const date = new Date();
        return date.toISOString().split('T')[0];
    }
    
    if (lower === 'tomorrow') {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const datePattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const match = input.match(datePattern);
    
    if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = parseInt(match[3]);
        
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }

    return null;
};

/**
 * Parse time from user input
 * @param {string} input - User input (2pm, 2:30pm, 14:30)
 * @returns {string|null} Time in HH:MM format or null
 */
export const parseTimeInput = (input) => {
    const lower = input.toLowerCase().trim();
    
    // Handle "2pm", "2:30pm", "14:30" formats
    const patterns = [
        /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i,
        /^(\d{1,2})[.:](\d{2})\s*(am|pm)?$/i
    ];

    for (const pattern of patterns) {
        const match = lower.match(pattern);
        if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const period = match[3]?.toLowerCase();

            if (period === 'pm' && hours < 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;

            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
        }
    }

    return null;
};

/**
 * Calculate end time based on start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} End time in HH:MM format
 */
export const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

/**
 * Check if date is valid (not in past)
 * @param {string} dateString - Date to check
 * @param {number} minDaysAdvance - Minimum days in advance
 * @returns {boolean} True if valid future date
 */
export const isValidFutureDate = (dateString, minDaysAdvance = 1) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + minDaysAdvance);
    
    return date >= minDate;
};

/**
 * Format booking status with emoji
 * @param {string} status - Booking status
 * @returns {Object} Status object with emoji and text
 */
export const formatBookingStatus = (status) => {
    const statusMap = {
        'pending': { emoji: '⏳', text: 'PENDING' },
        'confirmed': { emoji: '✅', text: 'CONFIRMED' },
        'rescheduled': { emoji: '🔄', text: 'RESCHEDULED' },
        'in_progress': { emoji: '⚙️', text: 'IN PROGRESS' },
        'completed': { emoji: '🎉', text: 'COMPLETED' },
        'cancelled': { emoji: '❌', text: 'CANCELLED' },
        'no_show': { emoji: '🚫', text: 'NO SHOW' },
        'refunded': { emoji: '💸', text: 'REFUNDED' },
        'disputed': { emoji: '⚠️', text: 'DISPUTED' }
    };
    
    return statusMap[status?.toLowerCase()] || { emoji: '📋', text: status?.toUpperCase() || 'UNKNOWN' };
};

/**
 * Format payment status with emoji
 * @param {string} status - Payment status
 * @returns {Object} Status object with emoji and text
 */
export const formatPaymentStatus = (status) => {
    const statusMap = {
        'pending': { emoji: '⏳', text: 'PENDING' },
        'partial': { emoji: '💰', text: 'PARTIAL' },
        'paid': { emoji: '✅', text: 'PAID' },
        'failed': { emoji: '❌', text: 'FAILED' },
        'refunded': { emoji: '💸', text: 'REFUNDED' }
    };
    
    return statusMap[status?.toLowerCase()] || { emoji: '💳', text: status?.toUpperCase() || 'UNKNOWN' };
};

/**
 * Format service type for display
 * @param {string} type - Service type
 * @returns {string} Formatted service type
 */
export const formatServiceType = (type) => {
    const types = {
        'physical': '📍 In-Person',
        'virtual': '💻 Online',
        'both': '📍 In-Person or 💻 Online'
    };
    return types[type] || type;
};

/**
 * Format professional type for display
 * @param {string} type - Professional type
 * @returns {string} Formatted professional type
 */
export const formatProfessionalType = (type) => {
    const types = {
        'individual': '👤 Individual',
        'company': '🏢 Company',
        'freelancer': '👨‍💼 Freelancer',
        'agency': '🏛️ Agency'
    };
    return types[type] || type;
};

/**
 * Format duration in minutes to readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins} min${mins !== 1 ? 's' : ''}`;
    } else if (mins === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
    }
};

/**
 * Format address from object to string
 * @param {Object|string} addressObj - Address object or string
 * @returns {string} Formatted address
 */
export const formatAddress = (addressObj) => {
    if (!addressObj) return 'Not provided';
    if (typeof addressObj === 'string') return addressObj;
    
    const parts = [];
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.state) parts.push(addressObj.state);
    if (addressObj.zipCode || addressObj.pincode) parts.push(addressObj.zipCode || addressObj.pincode);
    if (addressObj.country) parts.push(addressObj.country);
    
    return parts.join(', ');
};

/**
 * Create session key for user with company context
 * @param {string} from - WhatsApp from ID
 * @param {string} companyId - Company ID for isolation
 * @param {string} context - Session context
 * @returns {string} Session key
 */
export const createSessionKey = (from, companyId = null, context = 'booking') => {
    const cleanPhone = cleanPhoneNumber(from);
    if (companyId) {
        return `${context}_${companyId}_${cleanPhone}`;
    }
    return `${context}_${cleanPhone}`;
};

/**
 * Cleanup old sessions
 * @param {Map} sessionsMap - Sessions map
 * @param {number} maxAge - Maximum age in ms
 */
export const cleanupSessions = (sessionsMap, maxAge = 2 * 60 * 60 * 1000) => {
    const now = Date.now();
    for (const [key, session] of sessionsMap.entries()) {
        if (now - (session.lastActivity || 0) > maxAge) {
            sessionsMap.delete(key);
        }
    }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Check if time is within range
 * @param {string} time - Time to check (HH:MM)
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @returns {boolean} True if within range
 */
export const isTimeInRange = (time, startTime, endTime) => {
    const timeMin = timeToMinutes(time);
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    
    return timeMin >= startMin && timeMin <= endMin;
};

/**
 * Convert time string to minutes (internal helper)
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Get day of week from date
 * @param {string} dateString - Date string
 * @returns {string} Day of week (lowercase)
 */
export const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
};

/**
 * Check if two time slots overlap
 * @param {string} start1 - First slot start
 * @param {string} end1 - First slot end
 * @param {string} start2 - Second slot start
 * @param {string} end2 - Second slot end
 * @param {number} buffer - Buffer time in minutes
 * @returns {boolean} True if slots overlap
 */
export const doSlotsOverlap = (start1, end1, start2, end2, buffer = 0) => {
    const s1 = timeToMinutes(start1) - buffer;
    const e1 = timeToMinutes(end1) + buffer;
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);

    return (s1 < e2) && (s2 < e1);
};

/**
 * Extract time components
 * @param {string} timeString - Time in HH:MM format
 * @returns {Object} Hours and minutes
 */
export const extractTimeComponents = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
};

/**
 * Add minutes to time
 * @param {string} timeString - Base time
 * @param {number} minutesToAdd - Minutes to add
 * @returns {string} New time
 */
export const addMinutesToTime = (timeString, minutesToAdd) => {
    const { hours, minutes } = extractTimeComponents(timeString);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time
 */
export const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
export const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is today
 * @param {string} dateString - Date to check
 * @returns {boolean} True if today
 */
export const isToday = (dateString) => {
    const today = getCurrentDate();
    return dateString === today;
};

/**
 * Check if a date is tomorrow
 * @param {string} dateString - Date to check
 * @returns {boolean} True if tomorrow
 */
export const isTomorrow = (dateString) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return dateString === tomorrowStr;
};

/**
 * Get relative day description
 * @param {string} dateString - Date to describe
 * @returns {string} Relative day
 */
export const getRelativeDay = (dateString) => {
    if (isToday(dateString)) return 'Today';
    if (isTomorrow(dateString)) return 'Tomorrow';
    return formatDate(dateString);
};

/**
 * Extract company ID from booking number
 * @param {string} bookingNumber - Booking number with company prefix
 * @returns {string|null} Company ID prefix or null
 */
export const extractCompanyFromBookingNumber = (bookingNumber) => {
    if (!bookingNumber) return null;
    
    // Format: BK-COMP-20240101-12345
    const parts = bookingNumber.split('-');
    if (parts.length >= 3 && parts[0] === 'BK') {
        return parts[1]; // Return company prefix
    }
    
    return null;
};

/**
 * Validate that booking belongs to company
 * @param {Object} booking - Booking object
 * @param {string} companyId - Expected company ID
 * @returns {boolean} True if valid
 */
export const validateBookingCompany = (booking, companyId) => {
    if (!booking || !companyId) return false;
    
    // Check by companyId field
    if (booking.companyId) {
        return booking.companyId.toString() === companyId.toString();
    }
    
    // Check by booking number prefix (fallback)
    const bookingCompanyPrefix = extractCompanyFromBookingNumber(booking.bookingNumber);
    return bookingCompanyPrefix === String(companyId).substring(0, 4).toUpperCase();
};

/**
 * Get company-specific error message
 * @param {string} errorType - Type of error
 * @param {string} companyId - Company ID
 * @returns {string} Localized error message
 */
export const getCompanyErrorMessage = (errorType, companyId = null) => {
    const messages = {
        'service_not_found': 'Service not available for this business',
        'professional_not_found': 'Professional not found',
        'slot_unavailable': 'This time slot is no longer available',
        'max_bookings_reached': 'Maximum bookings reached for this day',
        'invalid_date': 'Please select a valid future date',
        'invalid_time': 'Please select a valid time slot',
        'booking_failed': 'Failed to create booking. Please try again.',
        'payment_required': 'Payment required to confirm booking',
        'cancellation_failed': 'Failed to cancel booking',
        'unauthorized': 'You are not authorized to access this booking'
    };
    
    return messages[errorType] || 'An error occurred. Please try again.';
};

// Export all functions as default object as well
export default {
    safeNumber,
    safeToFixed,
    generateBookingNumber,
    formatCurrency,
    cleanPhoneNumber,
    validatePhone,
    formatDate,
    formatTime,
    formatDateTime,
    parseDateInput,
    parseTimeInput,
    calculateEndTime,
    isValidFutureDate,
    formatBookingStatus,
    formatPaymentStatus,
    formatServiceType,
    formatProfessionalType,
    formatDuration,
    formatAddress,
    createSessionKey,
    cleanupSessions,
    truncateText,
    isTimeInRange,
    getDayOfWeek,
    doSlotsOverlap,
    extractTimeComponents,
    addMinutesToTime,
    getCurrentTime,
    getCurrentDate,
    isToday,
    isTomorrow,
    getRelativeDay,
    extractCompanyFromBookingNumber,
    validateBookingCompany,
    getCompanyErrorMessage
};

