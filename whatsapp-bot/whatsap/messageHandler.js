
// // whatsapp-bot/handlers/messageHandler.js - PROFESSIONAL MULTI-TENANT VERSION
// // Correctly extracts customer phone numbers and routes messages with company context

// import { handleWelcome } from './handlers/welcomeHandler.js';
// import { handleProducts } from './handlers/productsHandler.js';
// import { handleOrderFlow } from './handlers/orderHandler.js';
// import { handleOrdersHistory } from './handlers/ordersHistoryHandler.js';
// import { handleSupport } from './handlers/supportHandler.js';
// import { 
//     handleCopyCommand, 
//     handleQuickOrder, 
//     handleButtonResponse, 
//     handleAllIds, 
//     handleDirectProductSearch 
// } from './handlers/productsHandler.js';
// import { handlePaymentVerification } from './handlers/paymentVerificationHandler.js';
// import { handleBookingFlow, handleMyBookings } from './handlers/bookingService/index.js';
// import getCompanyMapper from '../services/companyMapper.js';

// // User session management (for order flow state, NOT WhatsApp sessions)
// const userSessions = new Map();

// // Initialize services
// const companyMapper = getCompanyMapper();

// /**
//  * ✅ CORRECT: Extract customer phone number from WhatsApp message
//  * This gets the CUSTOMER'S phone number, not the WhatsApp ID
//  * @param {Object} message - WhatsApp message object
//  * @returns {string} Customer's 10-digit phone number
//  */
// function extractCustomerPhone(message) {
//     if (!message || !message.from) return 'Unknown';
    
//     try {
//         // WhatsApp message.from format: "919876543210@c.us" or "919876543210@lid"
//         const fullId = message.from;
        
//         // Extract the number part (everything before @)
//         const numberPart = fullId.split('@')[0];
        
//         // Remove all non-digit characters
//         const digitsOnly = numberPart.replace(/\D/g, '');
        
//         console.log(`📞 [Phone Extraction] Original: ${fullId}, Digits: ${digitsOnly}`);
        
//         // Handle different country code scenarios
        
//         // SPECIAL CASE: Malawi country code (265) followed by Indian number
//         if (digitsOnly.length === 13 && digitsOnly.startsWith('265')) {
//             const indianNumber = digitsOnly.substring(3); // Remove 265
//             console.log(`📱 [Phone Extraction] Malawi format → Indian: ${indianNumber}`);
//             return indianNumber;
//         }
        
//         // INDIAN NUMBERS (most common)
//         // Format: 91XXXXXXXXXX (12 digits starting with 91)
//         if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
//             const customerPhone = digitsOnly.substring(2); // Remove 91
//             console.log(`📱 [Phone Extraction] Indian format → Customer: ${customerPhone}`);
//             return customerPhone;
//         }
        
//         // Standard 10-digit Indian number (no country code)
//         if (digitsOnly.length === 10) {
//             console.log(`📱 [Phone Extraction] Direct 10-digit → Customer: ${digitsOnly}`);
//             return digitsOnly;
//         }
        
//         // Other country codes - extract last 10 digits
//         if (digitsOnly.length > 10) {
//             const last10 = digitsOnly.slice(-10);
//             console.log(`📱 [Phone Extraction] Foreign format → Last 10 digits: ${last10}`);
//             return last10;
//         }
        
//         console.log(`⚠️ [Phone Extraction] Could not extract, returning: ${digitsOnly}`);
//         return digitsOnly || 'Unknown';
        
//     } catch (error) {
//         console.error('❌ [Phone Extraction] Error:', error);
//         return 'Unknown';
//     }
// }

// /**
//  * ✅ Format phone number for display (with +91 formatting)
//  * @param {string} phoneNumber - 10-digit phone number
//  * @returns {string} Formatted phone number
//  */
// function formatPhoneForDisplay(phoneNumber) {
//     if (!phoneNumber || phoneNumber === 'Unknown') return 'Unknown';
    
//     // If already has formatting, return as is
//     if (phoneNumber.includes('+')) return phoneNumber;
    
//     // Ensure we have 10 digits
//     const digits = phoneNumber.replace(/\D/g, '');
//     const last10 = digits.slice(-10);
    
//     if (last10.length === 10) {
//         return `+91 ${last10.substring(0, 5)} ${last10.substring(5)}`;
//     }
    
//     return phoneNumber;
// }

// /**
//  * ✅ Get clean 10-digit phone number for database queries
//  * @param {string} whatsappId - WhatsApp ID
//  * @returns {string} 10-digit phone number
//  */
// function getCleanPhoneNumber(whatsappId) {
//     return extractCustomerPhone({ from: whatsappId });
// }

// /**
//  * ✅ Format phone number for display (backward compatibility)
//  */
// function formatIndianPhoneNumber(phoneNumber) {
//     return formatPhoneForDisplay(phoneNumber);
// }

// /**
//  * ✅ Get company ID from message with caching
//  * @param {Object} message - WhatsApp message
//  * @returns {Promise<string|null>} Company ID or null
//  */
// async function getCompanyIdFromMessage(message) {
//     try {
//         // First try to get from the WhatsApp number they messaged
//         // This is the TO number, not the FROM number
//         if (message.to) {
//             const toNumber = extractCustomerPhone({ from: message.to });
            
//             if (toNumber) {
//                 const companyId = await companyMapper.getCompanyIdByPhone(toNumber);
//                 if (companyId) {
//                     console.log(`🏢 [Company] Found by TO number: ${toNumber} → ${companyId}`);
//                     return companyId;
//                 }
//             }
//         }
        
//         // If no company found from TO number, try the FROM number (as fallback)
//         if (message.from) {
//             const fromNumber = extractCustomerPhone(message);
//             console.log(`⚠️ No company found for TO number, checking FROM number: ${fromNumber}`);
            
//             const companyId = await companyMapper.getCompanyIdByPhone(fromNumber);
//             if (companyId) {
//                 console.log(`🏢 [Company] Found by FROM number: ${fromNumber} → ${companyId}`);
//                 return companyId;
//             }
//         }
        
//         console.log(`⚠️ No company found for this message`);
//         return null;
        
//     } catch (error) {
//         console.error('❌ [Company] Error getting company ID:', error);
//         return null;
//     }
// }

// export default async function handleMessage(message, client) {
//     try {
//         const userMessage = message.body.trim();
//         const from = message.from; // This is the customer's WhatsApp ID
//         const to = message.to;     // This is the company's WhatsApp number
//         const lowerMessage = userMessage.toLowerCase();

//         // ✅ CORRECT: Extract customer's actual phone number
//         const customerPhone = extractCustomerPhone(message);
//         const formattedPhone = formatPhoneForDisplay(customerPhone);
        
//         console.log('='.repeat(60));
//         console.log(`📱 INCOMING MESSAGE`);
//         console.log('='.repeat(60));
//         console.log(`📞 Customer: ${formattedPhone} (${customerPhone})`);
//         console.log(`🏢 Company Number: ${to || 'Unknown'}`);
//         console.log(`📨 Message: ${userMessage}`);
//         console.log(`🆔 WhatsApp ID: ${from}`);
//         console.log('='.repeat(60));

//         // ✅ Get company ID from the number they messaged
//         const companyId = await getCompanyIdFromMessage(message);
        
//         if (companyId) {
//             console.log(`🏢 Company ID: ${companyId}`);
//         } else {
//             console.log(`⚠️ No company found for this message`);
//             // Continue processing - some handlers may not need company context
//         }

//         // Get or create user session with correct customer phone
//         let userSession = userSessions.get(customerPhone);
//         if (!userSession) {
//             userSession = { 
//                 state: 'IDLE', 
//                 orderData: {},
//                 bookingData: {},
//                 bookingState: 'IDLE',
//                 lastActivity: Date.now(),
//                 whatsappId: from,
//                 customerPhone: customerPhone,      // ✅ CORRECT: 10-digit customer phone
//                 formattedPhone: formattedPhone,    // For display
//                 companyId: companyId                // Current company context
//             };
//             userSessions.set(customerPhone, userSession);
//             console.log(`🆕 New session created for: ${formattedPhone}`);
//         } else {
//             // Update company context in existing session
//             userSession.companyId = companyId || userSession.companyId;
//             userSession.lastActivity = Date.now();
//         }

//         // Clean up old sessions
//         cleanupOldSessions();

//         // Handle payment verification commands first (admin commands)
//         if (userMessage.startsWith('!verify') || 
//             userMessage.startsWith('!reject') || 
//             userMessage.startsWith('!fraud') || 
//             userMessage.startsWith('!pending') ||
//             userMessage.startsWith('!orders')) {
//             console.log(`🔐 Admin command from ${formattedPhone}: ${userMessage}`);
//             return await handlePaymentVerification(message, client);
//         }

//         // Handle button responses
//         if (userMessage.startsWith('copy_') || 
//             userMessage.startsWith('order_') || 
//             userMessage === 'more_products') {
//             console.log(`🔘 Button response from ${formattedPhone}: ${userMessage}`);
//             return await handleButtonResponse(message, client);
//         }

//         // Handle command-based messages
//         if (lowerMessage.startsWith('!products')) {
//             console.log(`📋 Products command from ${formattedPhone}`);
//             return await handleProducts(message, client, companyId, userSession);
//         }
//         else if (lowerMessage.startsWith('!copy ')) {
//             console.log(`📋 Copy command from ${formattedPhone}`);
//             return await handleCopyCommand(message, client, companyId);
//         }
//         else if (lowerMessage.startsWith('!order ')) {
//             console.log(`📋 Quick order command from ${formattedPhone}`);
//             return await handleQuickOrder(message, client, companyId, userSession);
//         }
//         else if (lowerMessage.startsWith('!testimage')) {
//             console.log(`📋 Test image command from ${formattedPhone}`);
//             await message.reply('Test image command received');
//             return;
//         }
//         else if (lowerMessage.startsWith('!allids')) {
//             console.log(`📋 All IDs command from ${formattedPhone}`);
//             return await handleAllIds(message, client, companyId);
//         }

//         // Check if user is in order flow
//         if (userSession.state !== 'IDLE') {
//             console.log(`🛒 User ${formattedPhone} in order flow (state: ${userSession.state})`);
//             return await handleOrderFlow(message, client, userSession, userSessions, companyId);
//         }

//         // Check if user is in booking flow
//         if (userSession.bookingState !== 'IDLE') {
//             console.log(`📅 User ${formattedPhone} in booking flow (state: ${userSession.bookingState})`);
//          //   return await handleBookingFlow(message, client, userSession, userSessions);
//             return await handleBookingFlow(message, client, userSession, userSessions, companyId);
//         }

//         // Handle direct product name search
//         if (userMessage.length >= 2 && 
//             !userMessage.startsWith('!') && 
//             !['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola', 
//               'products', 'product', 'menu', 'items', 'show products', 'all products',
//               'order', 'myorders', 'my orders', 'orders', 'order history', 'my order',
//               'book', 'booking', 'appointment', 'schedule', 'reserve',
//               'mybookings', 'my bookings', 'appointments', 'my appointments',
//               'contact', 'support', 'help', 'customer care', 'helpline',
//               'thanks', 'thank you', 'thankyou', 'thnx',
//               'bye', 'goodbye', 'exit', 'quit',
//               'next', 'more', 'more products', 'prev', 'previous', 'back'].includes(lowerMessage)) {
            
//             console.log(`🔍 Direct product search from ${formattedPhone}: "${userMessage}"`);
//             const searchResult = await handleDirectProductSearch(message, client, userMessage, companyId);
//             if (searchResult) {
//                 console.log(`✅ Product found via direct search`);
//                 return;
//             }
//             console.log(`❌ No product found via direct search`);
//         }

//         // Route based on natural language commands
//         if (['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola'].includes(lowerMessage)) {
//             console.log(`👋 Welcome message for ${formattedPhone}`);
//             return await handleWelcome(message, client, companyId, userSession);
//         }
//         else if (['products', 'product', 'menu', 'items', 'show products', 'all products'].includes(lowerMessage)) {
//             console.log(`📋 Products listing for ${formattedPhone}`);
//             return await handleProducts(message, client, companyId, userSession);
//         }
//         else if (lowerMessage.startsWith('order')) {
//             console.log(`🛒 Starting order flow for ${formattedPhone}`);
//             userSession.state = 'START_ORDER';
//             return await handleOrderFlow(message, client, userSession, userSessions, companyId);
//         }
//         else if (['myorders', 'my orders', 'orders', 'order history', 'my order'].includes(lowerMessage)) {
//             console.log(`📦 Order history for ${formattedPhone}`);
//             return await handleOrdersHistory(message, client, customerPhone, companyId);
//         }
//         // BOOKING COMMAND
//         else if (['book', 'booking', 'appointment', 'schedule', 'reserve'].includes(lowerMessage)) {
//             console.log(`📅 Starting booking flow for ${formattedPhone}`);
            
//             userSession.bookingState = 'START_BOOKING';
//             userSession.bookingData = {
//                 customerPhone: customerPhone,
//                 companyId: companyId
//             };
            
//             await message.reply(
//                 `📅 *Welcome to Booking Service!*\n\n` +
//                 `I'll help you book an appointment.\n\n` +
//                 `🔄 *Let's start with selecting a service*`
//             );
            
//             return await handleBookingFlow(message, client, userSession, userSessions);
//         }
//         else if (['mybookings', 'my bookings', 'appointments', 'my appointments'].includes(lowerMessage)) {
//             console.log(`📞 Viewing bookings for ${formattedPhone}`);
//             return await handleMyBookings(message, client, userSession, customerPhone, companyId);
//         }
//         else if (['contact', 'support', 'help', 'customer care', 'helpline'].includes(lowerMessage)) {
//             console.log(`📞 Support request from ${formattedPhone}`);
//             return await handleSupport(message, client, companyId);
//         }
//         else if (['thanks', 'thank you', 'thankyou', 'thnx'].includes(lowerMessage)) {
//             console.log(`🙏 Thank you from ${formattedPhone}`);
//             await message.reply(
//                 `You're welcome! 😊\n\n` +
//                 `If you need anything else, just type:\n` +
//                 `• *Products* - Browse our collection\n` +
//                 `• *Book* - Schedule appointments\n` +
//                 `• *Order* - Start a new order\n` +
//                 `• *Support* - Get help\n\n` +
//                 `Have a great day! 🌟`
//             );
//             return;
//         }
//         else if (['bye', 'goodbye', 'exit', 'quit'].includes(lowerMessage)) {
//             console.log(`👋 Goodbye from ${formattedPhone}`);
//             await message.reply(
//                 `👋 Thank you for visiting!\n\n` +
//                 `We hope to see you again soon! 🎯\n\n` +
//                 `Need help later? Just type *Hi* to start again!`
//             );
//             return;
//         }
//         else {
//             console.log(`❓ Unknown command from ${formattedPhone}: "${userMessage}"`);
//             await message.reply(
//                 `🤖 *I didn't understand that command.*\n\n` +
//                 `*Here's what I can help you with:*\n\n` +
//                 `👋 *Hi/Hello* - Welcome message\n` +
//                 `🛍️ *Products* - Browse our collection\n` +
//                 `📅 *Book* - Schedule appointments\n` +
//                 `🎯 *Order* - Start a new order\n` +
//                 `📦 *MyOrders* - View your orders\n` +
//                 `📞 *MyBookings* - View your appointments\n` +
//                 `📞 *Support* - Contact help\n\n` +
//                 `💡 *Quick Commands:*\n` +
//                 `• !products - Show all products\n` +
//                 `• !copy PRODUCT_ID - Copy product ID\n` +
//                 `• !order PRODUCT_ID QUANTITY - Quick order\n` +
//                 `• !allids - All product IDs\n\n` +
//                 `🔍 *New!* Type any *product name* to search directly!\n` +
//                 `Example: *anime poster* or *wall art*\n\n` +
//                 `📅 *New!* Type *Book* to schedule appointments!\n\n` +
//                 `*Quick Start:* Type *Products* to explore! 🎨`
//             );
//             return;
//         }

//     } catch (error) {
//         console.error('❌ Error in message handler:', error);
//         try {
//             await message.reply('⚠️ Sorry, something went wrong. Please try again.');
//         } catch (replyError) {
//             console.error('❌ Failed to send error message:', replyError);
//         }
//     }
// }

// /**
//  * ✅ Clean up old sessions (24 hours)
//  */
// function cleanupOldSessions() {
//     const now = Date.now();
//     const twentyFourHours = 24 * 60 * 60 * 1000;
//     let cleanedCount = 0;
    
//     for (const [phone, session] of userSessions.entries()) {
//         if (now - session.lastActivity > twentyFourHours) {
//             userSessions.delete(phone);
//             cleanedCount++;
//             console.log(`🧹 Cleaned up old session for: ${session.formattedPhone || phone}`);
//         }
//     }
    
//     if (cleanedCount > 0) {
//         console.log(`🧹 Cleaned up ${cleanedCount} old sessions`);
//     }
// }

// // Export session management and utilities for other handlers
// export { 
//     userSessions, 
//     formatIndianPhoneNumber, 
//     getCleanPhoneNumber,
//     extractCustomerPhone,
//     formatPhoneForDisplay,
//     getCompanyIdFromMessage
// };











// whatsapp-bot/handlers/messageHandler.js - PROFESSIONAL MULTI-TENANT VERSION
// Correctly extracts customer phone numbers and routes messages with company context

import { handleWelcome } from './handlers/welcomeHandler.js';
import { handleProducts } from './handlers/productsHandler.js';
import { handleOrderFlow } from './handlers/orderHandler.js';
import { handleOrdersHistory } from './handlers/ordersHistoryHandler.js';
import { handleSupport } from './handlers/supportHandler.js';
import { 
    handleCopyCommand, 
    handleQuickOrder, 
    handleButtonResponse, 
    handleAllIds, 
    handleDirectProductSearch 
} from './handlers/productsHandler.js';
import { handlePaymentVerification } from './handlers/paymentVerificationHandler.js';
import { handleLocation } from './handlers/locationHandler.js';
import getCompanyMapper from '../services/companyMapper.js';

// User session management (for order flow state, NOT WhatsApp sessions)
const userSessions = new Map();

// Initialize services
const companyMapper = getCompanyMapper();

/**
 * ✅ CORRECT: Extract customer phone number from WhatsApp message
 * This gets the CUSTOMER'S phone number, not the WhatsApp ID
 * @param {Object} message - WhatsApp message object
 * @returns {string} Customer's 10-digit phone number
 */
function extractCustomerPhone(message) {
    if (!message || !message.from) return 'Unknown';
    
    try {
        // WhatsApp message.from format: "919876543210@c.us" or "919876543210@lid"
        const fullId = message.from;
        
        // Extract the number part (everything before @)
        const numberPart = fullId.split('@')[0];
        
        // Remove all non-digit characters
        const digitsOnly = numberPart.replace(/\D/g, '');
        
        console.log(`📞 [Phone Extraction] Original: ${fullId}, Digits: ${digitsOnly}`);
        
        // Handle different country code scenarios
        
        // SPECIAL CASE: Malawi country code (265) followed by Indian number
        if (digitsOnly.length === 13 && digitsOnly.startsWith('265')) {
            const indianNumber = digitsOnly.substring(3); // Remove 265
            console.log(`📱 [Phone Extraction] Malawi format → Indian: ${indianNumber}`);
            return indianNumber;
        }
        
        // INDIAN NUMBERS (most common)
        // Format: 91XXXXXXXXXX (12 digits starting with 91)
        if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
            const customerPhone = digitsOnly.substring(2); // Remove 91
            console.log(`📱 [Phone Extraction] Indian format → Customer: ${customerPhone}`);
            return customerPhone;
        }
        
        // Standard 10-digit Indian number (no country code)
        if (digitsOnly.length === 10) {
            console.log(`📱 [Phone Extraction] Direct 10-digit → Customer: ${digitsOnly}`);
            return digitsOnly;
        }
        
        // Other country codes - extract last 10 digits
        if (digitsOnly.length > 10) {
            const last10 = digitsOnly.slice(-10);
            console.log(`📱 [Phone Extraction] Foreign format → Last 10 digits: ${last10}`);
            return last10;
        }
        
        console.log(`⚠️ [Phone Extraction] Could not extract, returning: ${digitsOnly}`);
        return digitsOnly || 'Unknown';
        
    } catch (error) {
        console.error('❌ [Phone Extraction] Error:', error);
        return 'Unknown';
    }
}

/**
 * ✅ Format phone number for display (with +91 formatting)
 * @param {string} phoneNumber - 10-digit phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneForDisplay(phoneNumber) {
    if (!phoneNumber || phoneNumber === 'Unknown') return 'Unknown';
    
    // If already has formatting, return as is
    if (phoneNumber.includes('+')) return phoneNumber;
    
    // Ensure we have 10 digits
    const digits = phoneNumber.replace(/\D/g, '');
    const last10 = digits.slice(-10);
    
    if (last10.length === 10) {
        return `+91 ${last10.substring(0, 5)} ${last10.substring(5)}`;
    }
    
    return phoneNumber;
}

/**
 * ✅ Get clean 10-digit phone number for database queries
 * @param {string} whatsappId - WhatsApp ID
 * @returns {string} 10-digit phone number
 */
function getCleanPhoneNumber(whatsappId) {
    return extractCustomerPhone({ from: whatsappId });
}

/**
 * ✅ Format phone number for display (backward compatibility)
 */
function formatIndianPhoneNumber(phoneNumber) {
    return formatPhoneForDisplay(phoneNumber);
}

/**
 * ✅ Get company ID from message with caching
 * @param {Object} message - WhatsApp message
 * @returns {Promise<string|null>} Company ID or null
 */
async function getCompanyIdFromMessage(message) {
    try {
        // First try to get from the WhatsApp number they messaged
        // This is the TO number, not the FROM number
        if (message.to) {
            const toNumber = extractCustomerPhone({ from: message.to });
            
            if (toNumber) {
                const companyId = await companyMapper.getCompanyIdByPhone(toNumber);
                if (companyId) {
                    console.log(`🏢 [Company] Found by TO number: ${toNumber} → ${companyId}`);
                    return companyId;
                }
            }
        }
        
        // If no company found from TO number, try the FROM number (as fallback)
        if (message.from) {
            const fromNumber = extractCustomerPhone(message);
            console.log(`⚠️ No company found for TO number, checking FROM number: ${fromNumber}`);
            
            const companyId = await companyMapper.getCompanyIdByPhone(fromNumber);
            if (companyId) {
                console.log(`🏢 [Company] Found by FROM number: ${fromNumber} → ${companyId}`);
                return companyId;
            }
        }
        
        console.log(`⚠️ No company found for this message`);
        return null;
        
    } catch (error) {
        console.error('❌ [Company] Error getting company ID:', error);
        return null;
    }
}

export default async function handleMessage(message, client) {
    try {
        const userMessage = message.body.trim();
        const from = message.from; // This is the customer's WhatsApp ID
        const to = message.to;     // This is the company's WhatsApp number
        const lowerMessage = userMessage.toLowerCase();

        // ✅ CORRECT: Extract customer's actual phone number
        const customerPhone = extractCustomerPhone(message);
        const formattedPhone = formatPhoneForDisplay(customerPhone);
        
        console.log('='.repeat(60));
        console.log(`📱 INCOMING MESSAGE`);
        console.log('='.repeat(60));
        console.log(`📞 Customer: ${formattedPhone} (${customerPhone})`);
        console.log(`🏢 Company Number: ${to || 'Unknown'}`);
        console.log(`📨 Message: ${userMessage}`);
        console.log(`🆔 WhatsApp ID: ${from}`);
        console.log('='.repeat(60));

        // ✅ Get company ID from the number they messaged
        const companyId = await getCompanyIdFromMessage(message);
        
        if (companyId) {
            console.log(`🏢 Company ID: ${companyId}`);
        } else {
            console.log(`⚠️ No company found for this message`);
            // Continue processing - some handlers may not need company context
        }

        // Get or create user session with correct customer phone
        let userSession = userSessions.get(customerPhone);
        if (!userSession) {
            userSession = { 
                state: 'IDLE', 
                orderData: {},
                lastActivity: Date.now(),
                whatsappId: from,
                customerPhone: customerPhone,      // ✅ CORRECT: 10-digit customer phone
                formattedPhone: formattedPhone,    // For display
                companyId: companyId                // Current company context
            };
            userSessions.set(customerPhone, userSession);
            console.log(`🆕 New session created for: ${formattedPhone}`);
        } else {
            // Update company context in existing session
            userSession.companyId = companyId || userSession.companyId;
            userSession.lastActivity = Date.now();
        }

        // Clean up old sessions
        cleanupOldSessions();

        // Handle payment verification commands first (admin commands)
        if (userMessage.startsWith('!verify') || 
            userMessage.startsWith('!reject') || 
            userMessage.startsWith('!fraud') || 
            userMessage.startsWith('!pending') ||
            userMessage.startsWith('!orders')) {
            console.log(`🔐 Admin command from ${formattedPhone}: ${userMessage}`);
            return await handlePaymentVerification(message, client);
        }

        // Handle button responses
        if (userMessage.startsWith('copy_') || 
            userMessage.startsWith('order_') || 
            userMessage === 'more_products') {
            console.log(`🔘 Button response from ${formattedPhone}: ${userMessage}`);
            return await handleButtonResponse(message, client);
        }

        // Handle command-based messages
        if (lowerMessage.startsWith('!products')) {
            console.log(`📋 Products command from ${formattedPhone}`);
            return await handleProducts(message, client, companyId, userSession);
        }
        else if (lowerMessage.startsWith('!copy ')) {
            console.log(`📋 Copy command from ${formattedPhone}`);
            return await handleCopyCommand(message, client, companyId);
        }
        else if (lowerMessage.startsWith('!order ')) {
            console.log(`📋 Quick order command from ${formattedPhone}`);
            return await handleQuickOrder(message, client, companyId, userSession);
        }
        else if (lowerMessage.startsWith('!testimage')) {
            console.log(`📋 Test image command from ${formattedPhone}`);
            await message.reply('Test image command received');
            return;
        }
        else if (lowerMessage.startsWith('!allids')) {
            console.log(`📋 All IDs command from ${formattedPhone}`);
            return await handleAllIds(message, client, companyId);
        }

        // Check if user is in order flow
        if (userSession.state !== 'IDLE') {
            console.log(`🛒 User ${formattedPhone} in order flow (state: ${userSession.state})`);
            return await handleOrderFlow(message, client, userSession, userSessions, companyId);
        }

        // Handle direct product name search
        if (userMessage.length >= 2 && 
            !userMessage.startsWith('!') && 
            !['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola', 
              'products', 'product', 'menu', 'items', 'show products', 'all products',
              'order', 'myorders', 'my orders', 'orders', 'order history', 'my order',
              'contact', 'support', 'help', 'customer care', 'helpline',
              'location', 'address', 'store location', 'where', 'map', 'direction', 'directions', 'store address', 'shop location',
              'thanks', 'thank you', 'thankyou', 'thnx',
              'bye', 'goodbye', 'exit', 'quit',
              'next', 'more', 'more products', 'prev', 'previous', 'back'].includes(lowerMessage)) {
            
            console.log(`🔍 Direct product search from ${formattedPhone}: "${userMessage}"`);
            const searchResult = await handleDirectProductSearch(message, client, userMessage, companyId);
            if (searchResult) {
                console.log(`✅ Product found via direct search`);
                return;
            }
            console.log(`❌ No product found via direct search`);
        }

        // Route based on natural language commands
        if (['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola'].includes(lowerMessage)) {
            console.log(`👋 Welcome message for ${formattedPhone}`);
            return await handleWelcome(message, client, companyId, userSession);
        }
        else if (['products', 'product', 'menu', 'items', 'show products', 'all products'].includes(lowerMessage)) {
            console.log(`📋 Products listing for ${formattedPhone}`);
            return await handleProducts(message, client, companyId, userSession);
        }
        else if (lowerMessage.startsWith('order')) {
            console.log(`🛒 Starting order flow for ${formattedPhone}`);
            userSession.state = 'START_ORDER';
            return await handleOrderFlow(message, client, userSession, userSessions, companyId);
        }
        else if (['myorders', 'my orders', 'orders', 'order history', 'my order'].includes(lowerMessage)) {
            console.log(`📦 Order history for ${formattedPhone}`);
            return await handleOrdersHistory(message, client, customerPhone, companyId);
        }
        // LOCATION COMMAND
        else if (['location', 'address', 'store location', 'where', 'map', 'direction', 'directions', 'store address', 'shop location'].includes(lowerMessage)) {
            console.log(`📍 Location request from ${formattedPhone}`);
            return await handleLocation(message, client);
        }
        else if (['contact', 'support', 'help', 'customer care', 'helpline'].includes(lowerMessage)) {
            console.log(`📞 Support request from ${formattedPhone}`);
            return await handleSupport(message, client, companyId);
        }
        else if (['thanks', 'thank you', 'thankyou', 'thnx'].includes(lowerMessage)) {
            console.log(`🙏 Thank you from ${formattedPhone}`);
            await message.reply(
                `You're welcome! 😊\n\n` +
                `If you need anything else, just type:\n` +
                `• *Products* - Browse our collection\n` +
                `• *Location* - Get store address & directions\n` +
                `• *Order* - Start a new order\n` +
                `• *Support* - Get help\n\n` +
                `Have a great day! 🌟`
            );
            return;
        }
        else if (['bye', 'goodbye', 'exit', 'quit'].includes(lowerMessage)) {
            console.log(`👋 Goodbye from ${formattedPhone}`);
            await message.reply(
                `👋 Thank you for visiting!\n\n` +
                `We hope to see you again soon! 🎯\n\n` +
                `Need help later? Just type *Hi* to start again!`
            );
            return;
        }
        // ========== NO FALLBACK ELSE BLOCK ==========
        // If no keyword matches, the bot simply does nothing.
        // This allows customers to type anything without receiving an automated reply.

    } catch (error) {
        console.error('❌ Error in message handler:', error);
        try {
            await message.reply('⚠️ Sorry, something went wrong. Please try again.');
        } catch (replyError) {
            console.error('❌ Failed to send error message:', replyError);
        }
    }
}

/**
 * ✅ Clean up old sessions (24 hours)
 */
function cleanupOldSessions() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    let cleanedCount = 0;
    
    for (const [phone, session] of userSessions.entries()) {
        if (now - session.lastActivity > twentyFourHours) {
            userSessions.delete(phone);
            cleanedCount++;
            console.log(`🧹 Cleaned up old session for: ${session.formattedPhone || phone}`);
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old sessions`);
    }
}

// Export session management and utilities for other handlers
export { 
    userSessions, 
    formatIndianPhoneNumber, 
    getCleanPhoneNumber,
    extractCustomerPhone,
    formatPhoneForDisplay,
    getCompanyIdFromMessage
};