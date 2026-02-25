// import { handleWelcome } from './handlers/welcomeHandler.js';
// import { handleProducts } from './handlers/productsHandler.js';
// import { handleOrderFlow } from './handlers/orderHandler.js';
// import { handleOrdersHistory } from './handlers/ordersHistoryHandler.js';
// import { handleSupport } from './handlers/supportHandler.js';
// import { handleCopyCommand, handleQuickOrder, handleButtonResponse, handleAllIds, handleDirectProductSearch } from './handlers/productsHandler.js';
// import { handlePaymentVerification } from './handlers/paymentVerificationHandler.js';
// //import handleMessage from './handlers/messageHandler.js';  // Add this line!

// // User session management
// const userSessions = new Map();

// // Helper function to format Indian phone numbers
// function formatIndianPhoneNumber(phoneNumber) {
//     if (!phoneNumber) return 'Unknown';
    
//     try {
//         // Remove any WhatsApp suffixes like @c.us, @lid, etc.
//         const cleaned = phoneNumber.split('@')[0];
        
//         // Remove any non-digit characters
//         const digitsOnly = cleaned.replace(/\D/g, '');
        
//         // Handle different WhatsApp number formats
//         if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
//             // Format: 91XXXXXXXXXX -> +91 XXXXX XXXXX
//             return `+91 ${digitsOnly.substring(2, 7)} ${digitsOnly.substring(7)}`;
//         }
//         else if (digitsOnly.length === 10) {
//             // Format: XXXXXXXXXX -> +91 XXXXX XXXXX
//             return `+91 ${digitsOnly.substring(0, 5)} ${digitsOnly.substring(5)}`;
//         }
//         else {
//             // Return original if can't format
//             return phoneNumber;
//         }
//     } catch (error) {
//         return phoneNumber;
//     }
// }

// // Helper function to get clean phone number for logging
// function getCleanPhoneNumber(whatsappId) {
//     const formatted = formatIndianPhoneNumber(whatsappId);
//     return formatted;
// }

// export  default async function handleMessage(message, client) {
//     try {
//         const userMessage = message.body.trim();
//         const from = message.from;
//         const lowerMessage = userMessage.toLowerCase();

//         // Format phone number for Indian format
//         const formattedPhone = getCleanPhoneNumber(from);
//         console.log(`📱 Message from ${formattedPhone}: ${userMessage}`);

//         // Get or create user session
//         let userSession = userSessions.get(from);
//         if (!userSession) {
//             userSession = { 
//                 state: 'IDLE', 
//                 orderData: {},
//                 lastActivity: Date.now(),
//                 phoneNumber: formattedPhone // Store formatted number
//             };
//             userSessions.set(from, userSession);
//         }

//         userSession.lastActivity = Date.now();

//         // Clean up old sessions (24 hours)
//         cleanupOldSessions();

//         // Handle payment verification commands first (admin commands)
//         if (userMessage.startsWith('!verify') || 
//             userMessage.startsWith('!reject') || 
//             userMessage.startsWith('!fraud') || 
//             userMessage.startsWith('!pending') ||
//             userMessage.startsWith('!orders')) {
//             return await handlePaymentVerification(message, client);
//         }

//         // Handle button responses
//         if (userMessage.startsWith('copy_') || 
//             userMessage.startsWith('order_') || 
//             userMessage === 'more_products') {
//             return await handleButtonResponse(message, client);
//         }

//         // Handle command-based messages
//         if (lowerMessage.startsWith('!products')) {
//             return await handleProducts(message, client);
//         }
//         else if (lowerMessage.startsWith('!copy ')) {
//             return await handleCopyCommand(message, client);
//         }
//         else if (lowerMessage.startsWith('!order ')) {
//             return await handleQuickOrder(message, client);
//         }
//         else if (lowerMessage.startsWith('!testimage')) {
//             return await handleTestImage(message, client);
//         }
//         else if (lowerMessage.startsWith('!allids')) {
//             return await handleAllIds(message, client);
//         }

//         // Check if user is in order flow
//         if (userSession.state !== 'IDLE') {
//             return await handleOrderFlow(message, client, userSession, userSessions);
//         }

//         // Handle direct product name search (NEW FEATURE)
//         // Check if message might be a product name (not a command, not too short, not in predefined commands)
//         if (userMessage.length >= 2 && 
//             !userMessage.startsWith('!') && 
//             !['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola', 
//               'products', 'product', 'menu', 'items', 'show products', 'all products',
//               'order', 'myorders', 'my orders', 'orders', 'order history', 'my order',
//               'contact', 'support', 'help', 'customer care', 'helpline',
//               'thanks', 'thank you', 'thankyou', 'thnx',
//               'bye', 'goodbye', 'exit', 'quit',
//               'next', 'more', 'more products', 'prev', 'previous', 'back'].includes(lowerMessage)) {
            
//             console.log(`🔍 Attempting direct product search for: "${userMessage}"`);
//             const searchResult = await handleDirectProductSearch(message, client, userMessage);
//             if (searchResult) {
//                 return; // Product was found and shown, exit handler
//             }
//             // If no product found, continue to normal flow
//         }

//         // Route based on natural language commands
//         if (['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola'].includes(lowerMessage)) {
//             return await handleWelcome(message, client);
//         }
//         else if (['products', 'product', 'menu', 'items', 'show products', 'all products'].includes(lowerMessage)) {
//             return await handleProducts(message, client);
//         }
//         else if (lowerMessage.startsWith('order')) {
//             userSession.state = 'START_ORDER';
//             return await handleOrderFlow(message, client, userSession, userSessions);
//         }
//         else if (['myorders', 'my orders', 'orders', 'order history', 'my order'].includes(lowerMessage)) {
//             return await handleOrdersHistory(message, client);
//         }
//         else if (['contact', 'support', 'help', 'customer care', 'helpline'].includes(lowerMessage)) {
//             return await handleSupport(message, client);
//         }
//         else if (['thanks', 'thank you', 'thankyou', 'thnx'].includes(lowerMessage)) {
//             await message.reply(
//                 `You're welcome! 😊\n\n` +
//                 `If you need anything else, just type:\n` +
//                 `• *Products* - Browse our collection\n` +
//                 `• *Order* - Start a new order\n` +
//                 `• *Support* - Get help\n\n` +
//                 `Have a great day! 🌟`
//             );
//             return;
//         }
//         else if (['bye', 'goodbye', 'exit', 'quit'].includes(lowerMessage)) {
//             await message.reply(
//                 `👋 Thank you for visiting PosterPro!\n\n` +
//                 `We hope to see you again soon! 🎨\n\n` +
//                 `Need help later? Just type *Hi* to start again!`
//             );
//             return;
//         }
//         else {
//             // Default message for unknown commands
//             await message.reply(
//                 `🤖 *I didn't understand that command.*\n\n` +
//                 `*Here's what I can help you with:*\n\n` +
//                 `👋 *Hi/Hello* - Welcome message\n` +
//                 `🛍️ *Products* - Browse our collection\n` +
//                 `🎯 *Order* - Start a new order\n` +
//                 `📦 *MyOrders* - View your orders\n` +
//                 `📞 *Support* - Contact help\n\n` +
//                 `💡 *Quick Commands:*\n` +
//                 `• !products - Show all products\n` +
//                 `• !copy PRODUCT_ID - Copy product ID\n` +
//                 `• !order PRODUCT_ID QUANTITY - Quick order\n` +
//                 `• !allids - All product IDs\n\n` +
//                 `🔍 *New!* Type any *product name* to search directly!\n` +
//                 `Example: *neem soap* or *anime poster*\n\n` +
//                 `*Quick Start:* Type *Products* to explore amazing posters! 🎨`
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

// function cleanupOldSessions() {
//     const now = Date.now();
//     const twentyFourHours = 24 * 60 * 60 * 1000;
    
//     for (const [phone, session] of userSessions.entries()) {
//         if (now - session.lastActivity > twentyFourHours) {
//             userSessions.delete(phone);
//             console.log(`🧹 Cleaned up old session for: ${session.phoneNumber}`);
//         }
//     }
// }

// // Export session management for other handlers
// export { userSessions, formatIndianPhoneNumber 
// };





import { handleWelcome } from './handlers/welcomeHandler.js';
import { handleProducts } from './handlers/productsHandler.js';
import { handleOrderFlow } from './handlers/orderHandler.js';
import { handleOrdersHistory } from './handlers/ordersHistoryHandler.js';
import { handleSupport } from './handlers/supportHandler.js';
import { handleCopyCommand, handleQuickOrder, handleButtonResponse, handleAllIds, handleDirectProductSearch } from './handlers/productsHandler.js';
import { handlePaymentVerification } from './handlers/paymentVerificationHandler.js';
//import handleMessage from './handlers/messageHandler.js';  // Add this line!

// User session management
const userSessions = new Map();

/**
 * Enhanced phone number formatter that handles Malawi country code (265)
 * and extracts Indian phone numbers correctly
 */
function formatIndianPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'Unknown';
    
    try {
        // Remove any WhatsApp suffixes like @c.us, @lid, etc.
        const cleaned = phoneNumber.split('@')[0];
        
        // Remove any non-digit characters
        const digitsOnly = cleaned.replace(/\D/g, '');
        
        console.log(`🔍 Formatting phone number: original="${phoneNumber}", digitsOnly="${digitsOnly}"`);
        
        // SPECIAL CASE: Malawi country code (265) followed by Indian number
        // Format: 265XXXXXXXXXX (265 + 10 digits = 13 digits total)
        if (digitsOnly.length === 13 && digitsOnly.startsWith('265')) {
            // Extract the last 10 digits (these are the actual Indian number)
            const indianNumber = digitsOnly.substring(3); // Remove '265' prefix
            console.log(`📱 Detected Malawi format, extracted Indian number: ${indianNumber}`);
            return `+91 ${indianNumber.substring(0, 5)} ${indianNumber.substring(5)}`;
        }
        
        // Handle Indian numbers with country code (91)
        if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
            const number = digitsOnly.substring(2);
            return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
        }
        // Handle standard 10-digit Indian numbers
        else if (digitsOnly.length === 10) {
            return `+91 ${digitsOnly.substring(0, 5)} ${digitsOnly.substring(5)}`;
        }
        // Handle numbers with other country codes (take last 10 digits as fallback)
        else if (digitsOnly.length > 10) {
            const last10Digits = digitsOnly.slice(-10);
            console.log(`📱 Number has country code, extracting last 10 digits: ${last10Digits}`);
            return `+91 ${last10Digits.substring(0, 5)} ${last10Digits.substring(5)} (extracted)`;
        }
        else {
            // Return original if can't format
            console.log(`⚠️ Could not format phone number: ${phoneNumber}`);
            return phoneNumber;
        }
    } catch (error) {
        console.error('❌ Error formatting phone number:', error);
        return phoneNumber;
    }
}

/**
 * Get clean phone number for logging and session storage
 * Returns the 10-digit number for internal use
 */
function getCleanPhoneNumber(whatsappId) {
    if (!whatsappId) return 'Unknown';
    
    try {
        // Remove any WhatsApp suffixes like @c.us, @lid, etc.
        const cleaned = whatsappId.split('@')[0];
        
        // Remove any non-digit characters
        const digitsOnly = cleaned.replace(/\D/g, '');
        
        console.log(`🧹 Cleaning phone: original="${whatsappId}", digits="${digitsOnly}"`);
        
        // SPECIAL CASE: Malawi country code (265) followed by Indian number
        if (digitsOnly.length === 13 && digitsOnly.startsWith('265')) {
            // Extract the last 10 digits (these are the actual Indian number)
            const indianNumber = digitsOnly.substring(3);
            console.log(`📱 Detected Malawi format, extracted: ${indianNumber}`);
            return indianNumber;
        }
        
        // Handle Indian numbers with country code
        if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
            return digitsOnly.substring(2);
        }
        // Handle standard 10-digit numbers
        else if (digitsOnly.length === 10) {
            return digitsOnly;
        }
        // Handle other lengths - take last 10 digits if possible
        else if (digitsOnly.length > 10) {
            const last10 = digitsOnly.slice(-10);
            console.log(`📱 Taking last 10 digits: ${last10}`);
            return last10;
        }
        
        return digitsOnly || 'Unknown';
    } catch (error) {
        console.error('❌ Error cleaning phone number:', error);
        return 'Unknown';
    }
}

export default async function handleMessage(message, client) {
    try {
        const userMessage = message.body.trim();
        const from = message.from;
        const lowerMessage = userMessage.toLowerCase();

        // Get clean 10-digit number for internal use
        const cleanPhone = getCleanPhoneNumber(from);
        
        // Get formatted number for display
        const formattedPhone = formatIndianPhoneNumber(from);
        
        console.log(`📱 Message from: ${formattedPhone} (clean: ${cleanPhone})`);
        console.log(`📨 Message: ${userMessage}`);

        // Get or create user session using the original WhatsApp ID as key
        // but store the cleaned number for later use
        let userSession = userSessions.get(from);
        if (!userSession) {
            userSession = { 
                state: 'IDLE', 
                orderData: {},
                lastActivity: Date.now(),
                whatsappId: from, // Store original WhatsApp ID
                cleanPhone: cleanPhone, // Store cleaned 10-digit number
                formattedPhone: formattedPhone // Store formatted display number
            };
            userSessions.set(from, userSession);
            console.log(`🆕 New session created for: ${formattedPhone}`);
        }

        // Update last activity
        userSession.lastActivity = Date.now();

        // Clean up old sessions (24 hours)
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
            return await handleProducts(message, client);
        }
        else if (lowerMessage.startsWith('!copy ')) {
            console.log(`📋 Copy command from ${formattedPhone}`);
            return await handleCopyCommand(message, client);
        }
        else if (lowerMessage.startsWith('!order ')) {
            console.log(`📋 Quick order command from ${formattedPhone}`);
            return await handleQuickOrder(message, client);
        }
        else if (lowerMessage.startsWith('!testimage')) {
            console.log(`📋 Test image command from ${formattedPhone}`);
            // Note: handleTestImage is not imported - you may need to add it
            await message.reply('Test image command received');
            return;
        }
        else if (lowerMessage.startsWith('!allids')) {
            console.log(`📋 All IDs command from ${formattedPhone}`);
            return await handleAllIds(message, client);
        }

        // Check if user is in order flow
        if (userSession.state !== 'IDLE') {
            console.log(`🛒 User ${formattedPhone} in order flow (state: ${userSession.state})`);
            return await handleOrderFlow(message, client, userSession, userSessions);
        }

        // Handle direct product name search
        if (userMessage.length >= 2 && 
            !userMessage.startsWith('!') && 
            !['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola', 
              'products', 'product', 'menu', 'items', 'show products', 'all products',
              'order', 'myorders', 'my orders', 'orders', 'order history', 'my order',
              'contact', 'support', 'help', 'customer care', 'helpline',
              'thanks', 'thank you', 'thankyou', 'thnx',
              'bye', 'goodbye', 'exit', 'quit',
              'next', 'more', 'more products', 'prev', 'previous', 'back'].includes(lowerMessage)) {
            
            console.log(`🔍 Direct product search from ${formattedPhone}: "${userMessage}"`);
            const searchResult = await handleDirectProductSearch(message, client, userMessage);
            if (searchResult) {
                console.log(`✅ Product found via direct search`);
                return; // Product was found and shown, exit handler
            }
            console.log(`❌ No product found via direct search`);
            // If no product found, continue to normal flow
        }

        // Route based on natural language commands
        if (['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola'].includes(lowerMessage)) {
            console.log(`👋 Welcome message for ${formattedPhone}`);
            return await handleWelcome(message, client);
        }
        else if (['products', 'product', 'menu', 'items', 'show products', 'all products'].includes(lowerMessage)) {
            console.log(`📋 Products listing for ${formattedPhone}`);
            return await handleProducts(message, client);
        }
        else if (lowerMessage.startsWith('order')) {
            console.log(`🛒 Starting order flow for ${formattedPhone}`);
            userSession.state = 'START_ORDER';
            return await handleOrderFlow(message, client, userSession, userSessions);
        }
        else if (['myorders', 'my orders', 'orders', 'order history', 'my order'].includes(lowerMessage)) {
            console.log(`📦 Order history for ${formattedPhone}`);
            return await handleOrdersHistory(message, client);
        }
        else if (['contact', 'support', 'help', 'customer care', 'helpline'].includes(lowerMessage)) {
            console.log(`📞 Support request from ${formattedPhone}`);
            return await handleSupport(message, client);
        }
        else if (['thanks', 'thank you', 'thankyou', 'thnx'].includes(lowerMessage)) {
            console.log(`🙏 Thank you from ${formattedPhone}`);
            await message.reply(
                `You're welcome! 😊\n\n` +
                `If you need anything else, just type:\n` +
                `• *Products* - Browse our collection\n` +
                `• *Order* - Start a new order\n` +
                `• *Support* - Get help\n\n` +
                `Have a great day! 🌟`
            );
            return;
        }
        else if (['bye', 'goodbye', 'exit', 'quit'].includes(lowerMessage)) {
            console.log(`👋 Goodbye from ${formattedPhone}`);
            await message.reply(
                `👋 Thank you for visiting PosterPro!\n\n` +
                `We hope to see you again soon! 🎨\n\n` +
                `Need help later? Just type *Hi* to start again!`
            );
            return;
        }
        else {
            // Default message for unknown commands
            console.log(`❓ Unknown command from ${formattedPhone}: "${userMessage}"`);
            await message.reply(
                `🤖 *I didn't understand that command.*\n\n` +
                `*Here's what I can help you with:*\n\n` +
                `👋 *Hi/Hello* - Welcome message\n` +
                `🛍️ *Products* - Browse our collection\n` +
                `🎯 *Order* - Start a new order\n` +
                `📦 *MyOrders* - View your orders\n` +
                `📞 *Support* - Contact help\n\n` +
                `💡 *Quick Commands:*\n` +
                `• !products - Show all products\n` +
                `• !copy PRODUCT_ID - Copy product ID\n` +
                `• !order PRODUCT_ID QUANTITY - Quick order\n` +
                `• !allids - All product IDs\n\n` +
                `🔍 *New!* Type any *product name* to search directly!\n` +
                `Example: *anime poster* or *wall art*\n\n` +
                `*Quick Start:* Type *Products* to explore amazing posters! 🎨`
            );
            return;
        }

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
 * Clean up old sessions (24 hours)
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

// Export session management for other handlers
export { userSessions, formatIndianPhoneNumber, getCleanPhoneNumber };