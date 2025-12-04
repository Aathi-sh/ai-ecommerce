import { handleWelcome } from './handlers/welcomeHandler.js';
import { handleProducts } from './handlers/productsHandler.js';
import { handleOrderFlow } from './handlers/orderHandler.js';
import { handleOrdersHistory } from './handlers/ordersHistoryHandler.js';
import { handleSupport } from './handlers/supportHandler.js';
import { handleCopyCommand, handleQuickOrder, handleButtonResponse, handleAllIds, handleDirectProductSearch } from './handlers/productsHandler.js';
import { handlePaymentVerification } from './handlers/paymentVerificationHandler.js';

// User session management
const userSessions = new Map();

// Helper function to format Indian phone numbers
function formatIndianPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'Unknown';
    
    try {
        // Remove any WhatsApp suffixes like @c.us, @lid, etc.
        const cleaned = phoneNumber.split('@')[0];
        
        // Remove any non-digit characters
        const digitsOnly = cleaned.replace(/\D/g, '');
        
        // Handle different WhatsApp number formats
        if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
            // Format: 91XXXXXXXXXX -> +91 XXXXX XXXXX
            return `+91 ${digitsOnly.substring(2, 7)} ${digitsOnly.substring(7)}`;
        }
        else if (digitsOnly.length === 10) {
            // Format: XXXXXXXXXX -> +91 XXXXX XXXXX
            return `+91 ${digitsOnly.substring(0, 5)} ${digitsOnly.substring(5)}`;
        }
        else {
            // Return original if can't format
            return phoneNumber;
        }
    } catch (error) {
        return phoneNumber;
    }
}

// Helper function to get clean phone number for logging
function getCleanPhoneNumber(whatsappId) {
    const formatted = formatIndianPhoneNumber(whatsappId);
    return formatted;
}

export default async function handleMessage(message, client) {
    try {
        const userMessage = message.body.trim();
        const from = message.from;
        const lowerMessage = userMessage.toLowerCase();

        // Format phone number for Indian format
        const formattedPhone = getCleanPhoneNumber(from);
        console.log(`📱 Message from ${formattedPhone}: ${userMessage}`);

        // Get or create user session
        let userSession = userSessions.get(from);
        if (!userSession) {
            userSession = { 
                state: 'IDLE', 
                orderData: {},
                lastActivity: Date.now(),
                phoneNumber: formattedPhone // Store formatted number
            };
            userSessions.set(from, userSession);
        }

        userSession.lastActivity = Date.now();

        // Clean up old sessions (24 hours)
        cleanupOldSessions();

        // Handle payment verification commands first (admin commands)
        if (userMessage.startsWith('!verify') || 
            userMessage.startsWith('!reject') || 
            userMessage.startsWith('!fraud') || 
            userMessage.startsWith('!pending') ||
            userMessage.startsWith('!orders')) {
            return await handlePaymentVerification(message, client);
        }

        // Handle button responses
        if (userMessage.startsWith('copy_') || 
            userMessage.startsWith('order_') || 
            userMessage === 'more_products') {
            return await handleButtonResponse(message, client);
        }

        // Handle command-based messages
        if (lowerMessage.startsWith('!products')) {
            return await handleProducts(message, client);
        }
        else if (lowerMessage.startsWith('!copy ')) {
            return await handleCopyCommand(message, client);
        }
        else if (lowerMessage.startsWith('!order ')) {
            return await handleQuickOrder(message, client);
        }
        else if (lowerMessage.startsWith('!testimage')) {
            return await handleTestImage(message, client);
        }
        else if (lowerMessage.startsWith('!allids')) {
            return await handleAllIds(message, client);
        }

        // Check if user is in order flow
        if (userSession.state !== 'IDLE') {
            return await handleOrderFlow(message, client, userSession, userSessions);
        }

        // Handle direct product name search (NEW FEATURE)
        // Check if message might be a product name (not a command, not too short, not in predefined commands)
        if (userMessage.length >= 2 && 
            !userMessage.startsWith('!') && 
            !['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola', 
              'products', 'product', 'menu', 'items', 'show products', 'all products',
              'order', 'myorders', 'my orders', 'orders', 'order history', 'my order',
              'contact', 'support', 'help', 'customer care', 'helpline',
              'thanks', 'thank you', 'thankyou', 'thnx',
              'bye', 'goodbye', 'exit', 'quit',
              'next', 'more', 'more products', 'prev', 'previous', 'back'].includes(lowerMessage)) {
            
            console.log(`🔍 Attempting direct product search for: "${userMessage}"`);
            const searchResult = await handleDirectProductSearch(message, client, userMessage);
            if (searchResult) {
                return; // Product was found and shown, exit handler
            }
            // If no product found, continue to normal flow
        }

        // Route based on natural language commands
        if (['hi', 'hello', 'hey', 'start', 'hii', 'hai', 'hlw', 'hola'].includes(lowerMessage)) {
            return await handleWelcome(message, client);
        }
        else if (['products', 'product', 'menu', 'items', 'show products', 'all products'].includes(lowerMessage)) {
            return await handleProducts(message, client);
        }
        else if (lowerMessage.startsWith('order')) {
            userSession.state = 'START_ORDER';
            return await handleOrderFlow(message, client, userSession, userSessions);
        }
        else if (['myorders', 'my orders', 'orders', 'order history', 'my order'].includes(lowerMessage)) {
            return await handleOrdersHistory(message, client);
        }
        else if (['contact', 'support', 'help', 'customer care', 'helpline'].includes(lowerMessage)) {
            return await handleSupport(message, client);
        }
        else if (['thanks', 'thank you', 'thankyou', 'thnx'].includes(lowerMessage)) {
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
            await message.reply(
                `👋 Thank you for visiting PosterPro!\n\n` +
                `We hope to see you again soon! 🎨\n\n` +
                `Need help later? Just type *Hi* to start again!`
            );
            return;
        }
        else {
            // Default message for unknown commands
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
                `Example: *neem soap* or *anime poster*\n\n` +
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

function cleanupOldSessions() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    for (const [phone, session] of userSessions.entries()) {
        if (now - session.lastActivity > twentyFourHours) {
            userSessions.delete(phone);
            console.log(`🧹 Cleaned up old session for: ${session.phoneNumber}`);
        }
    }
}

// Export session management for other handlers
export { userSessions, formatIndianPhoneNumber };