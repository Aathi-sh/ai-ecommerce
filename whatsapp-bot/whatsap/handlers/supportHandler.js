import companyConfig from '../../shared/companyConfig.js';

/**
 * Support Handler - Displays company support information
 * Fetches real-time data from Next.js API via companyConfig
 */
export async function handleSupport(message, client) {
    try {
        console.log('📞 [Support] Fetching support information...');
        
        // Get all settings from API (with caching)
        const settings = await companyConfig.getSettings();
        
        // Get specific support info
        const supportInfo = await companyConfig.getSupportInfo();
        
        // Format phone number nicely
        const formatPhone = (phone) => {
            if (!phone) return 'Not available';
            
            // If already formatted, return as is
            if (phone.includes(' ') || phone.includes('-')) return phone;
            
            // Format Indian numbers
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 10) {
                return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
            } else if (digits.length === 12 && digits.startsWith('91')) {
                return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
            }
            return phone;
        };

        // Get business hours
        const businessHours = settings.businessHours || {};
        let hoursDisplay = '';
        
        // Check if we have custom business hours
        if (Object.keys(businessHours).length > 0) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            hoursDisplay = '\n🕒 *Business Hours:*\n';
            days.forEach((day, index) => {
                const hours = businessHours[day];
                if (hours && hours !== 'Closed') {
                    hoursDisplay += `${dayNames[index]}: ${hours}\n`;
                } else if (hours === 'Closed') {
                    hoursDisplay += `${dayNames[index]}: Closed\n`;
                }
            });
        } else {
            // Use support hours from database
            hoursDisplay = `\n🕒 *Support Hours:*\n${supportInfo.hours || 'Mon-Sat, 9 AM - 8 PM'}\n`;
        }

        // Build social media links if available
        let socialDisplay = '';
        const social = settings.social || {};
        const socialLinks = [];
        
        if (social.instagram) socialLinks.push(`📸 Instagram: ${social.instagram}`);
        if (social.facebook) socialLinks.push(`📘 Facebook: ${social.facebook}`);
        if (social.twitter) socialLinks.push(`🐦 Twitter: ${social.twitter}`);
        if (social.youtube) socialLinks.push(`▶️ YouTube: ${social.youtube}`);
        
        if (socialLinks.length > 0) {
            socialDisplay = '\n🌐 *Connect With Us:*\n' + socialLinks.join('\n') + '\n';
        }

        // Get company name with fallback
        const companyName = settings.companyName || 'POSTERPRO';

        // Build complete support message
        const supportText = 
            `📞 *${companyName} SUPPORT*\n\n` +
            `We're here to help you! 🤝\n\n` +
            `${hoursDisplay}` +
            `\n📱 *Contact Details:*\n` +
            `Phone: ${formatPhone(supportInfo.phone || settings.phone)}\n` +
            `Email: ${supportInfo.email || settings.email}\n` +
            `Website: ${settings.website || 'www.posterpro.com'}\n` +
            (supportInfo.whatsapp ? `WhatsApp: ${formatPhone(supportInfo.whatsapp)}\n` : '') +
            (supportInfo.responseTime ? `⏱️ Response Time: ${supportInfo.responseTime}\n` : '') +
            `${socialDisplay}` +
            `\n💬 *Quick Help:*\n` +
            `• Order Status: Type *MyOrders*\n` +
            `• Browse Products: Type *Products*\n` +
            `• New Order: Type *Order*\n` +
            `• Talk to Agent: Type *Agent*\n\n` +
            `📍 *Address:*\n` +
            `${settings.address || 'PosterPro Studios'}\n` +
            `${settings.city || 'Mumbai, Maharashtra 400001'}\n\n` +
            `✨ *We typically respond within ${supportInfo.responseTime || '30 minutes'} during business hours.*\n` +
            `_For urgent issues, please call us directly._`;

        console.log('✅ [Support] Message sent successfully to:', message.from);
        await message.reply(supportText);

    } catch (error) {
        console.error('❌ [Support] Error:', error);
        
        // Professional fallback message if API fails
        const fallbackText = 
            `📞 *CUSTOMER SUPPORT*\n\n` +
            `We're here to help! 🤝\n\n` +
            `🕒 *Hours:* Mon-Sat, 9 AM - 8 PM\n` +
            `📱 *Phone:* +91 98765 43210\n` +
            `📧 *Email:* support@posterpro.com\n` +
            `🌐 *Website:* www.posterpro.com\n\n` +
            `💬 *Quick Commands:*\n` +
            `• Type *Order* to start shopping\n` +
            `• Type *MyOrders* to check status\n` +
            `• Type *Products* to browse catalog\n\n` +
            `_Our team will respond within 30 minutes._\n` +
            `_Support services may be temporarily unavailable._`;

        await message.reply(fallbackText);
    }
}

/**
 * Handle agent request - Connect customer with human agent
 */
export async function handleAgentRequest(message, client) {
    try {
        const settings = await companyConfig.getSettings();
        const supportInfo = await companyConfig.getSupportInfo();
        
        const agentText = 
            `👨‍💼 *CONNECT WITH AGENT*\n\n` +
            `An agent will assist you shortly.\n\n` +
            `📞 *For immediate assistance:*\n` +
            `Call: ${formatPhone(supportInfo.phone || settings.phone)}\n\n` +
            `⏱️ *Average wait time:* 2-5 minutes\n\n` +
            `💡 *While you wait:*\n` +
            `• Type *Products* to browse catalog\n` +
            `• Type *Order* to place new order\n` +
            `• Type *MyOrders* to check status\n\n` +
            `_We'll notify you when an agent joins._\n` +
            `_This is a simulated agent request - in production, this would notify your support team._`;

        await message.reply(agentText);
        
        // TODO: Implement actual agent notification system
        // await notifySupportTeam(message.from, message.fromName);
        
    } catch (error) {
        console.error('❌ [Agent] Error:', error);
        await message.reply(
            `👨‍💼 *AGENT REQUEST*\n\n` +
            `An agent will assist you shortly.\n\n` +
            `For immediate help, call: +91 98765 43210`
        );
    }
}

/**
 * Handle FAQ request - Show frequently asked questions
 */
export async function handleFAQ(message, client) {
    try {
        const settings = await companyConfig.getSettings();
        const companyName = settings.companyName || 'PosterPro';
        
        const faqText = 
            `❓ *${companyName} - FREQUENTLY ASKED QUESTIONS*\n\n` +
            `*Q: How do I place an order?*\n` +
            `A: Simply type *Order* and follow the step-by-step instructions!\n\n` +
            `*Q: What payment methods do you accept?*\n` +
            `A: We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.\n\n` +
            `*Q: How can I track my order?*\n` +
            `A: Type *MyOrders* to check your order status anytime.\n\n` +
            `*Q: How long does delivery take?*\n` +
            `A: 3-5 business days after payment confirmation.\n\n` +
            `*Q: What is your return policy?*\n` +
            `A: 7 days replacement for manufacturing defects.\n\n` +
            `*Q: Is GST included in the price?*\n` +
            `A: Yes, all prices include applicable GST.\n\n` +
            `*Q: Do you ship internationally?*\n` +
            `A: Currently we ship only within India.\n\n` +
            `💡 *Need more help?* Type *Support* to contact us!`;

        await message.reply(faqText);
        
    } catch (error) {
        console.error('❌ [FAQ] Error:', error);
        await message.reply(
            `❓ *FAQ*\n\n` +
            `• How to order? Type *Order*\n` +
            `• Track order? Type *MyOrders*\n` +
            `• Payment methods? UPI, Cards, NetBanking\n` +
            `• Delivery time? 3-5 business days\n` +
            `• Returns? 7 days replacement\n\n` +
            `Type *Support* for more help.`
        );
    }
}

/**
 * Handle business hours request
 */
export async function handleHours(message, client) {
    try {
        const settings = await companyConfig.getSettings();
        const businessHours = settings.businessHours || {};
        
        let hoursText = `🕒 *BUSINESS HOURS*\n\n`;
        
        // Check if we have custom business hours
        if (Object.keys(businessHours).length > 0) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            days.forEach((day, index) => {
                const hours = businessHours[day];
                if (hours && hours !== 'Closed') {
                    hoursText += `${dayNames[index]}: ${hours}\n`;
                } else if (hours === 'Closed') {
                    hoursText += `${dayNames[index]}: Closed\n`;
                }
            });
        } else {
            // Default hours
            hoursText += `Monday - Saturday: 9 AM to 8 PM\n`;
            hoursText += `Sunday: 10 AM to 6 PM\n`;
        }
        
        hoursText += `\n📞 *Support:* ${settings.phone || '+91 98765 43210'}\n`;
        hoursText += `\n💡 Type *Support* for complete contact information.`;
        
        await message.reply(hoursText);
        
    } catch (error) {
        console.error('❌ [Hours] Error:', error);
        await message.reply(
            `🕒 *BUSINESS HOURS*\n\n` +
            `Monday - Saturday: 9 AM to 8 PM\n` +
            `Sunday: 10 AM to 6 PM\n\n` +
            `📞 Support: +91 98765 43210`
        );
    }
}

/**
 * Helper function to format phone numbers
 */
function formatPhone(phone) {
    if (!phone) return 'Not available';
    
    // If already formatted, return as is
    if (phone.includes(' ') || phone.includes('-')) return phone;
    
    // Format Indian numbers
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phone;
}

// Export all functions
export default {
    handleSupport,
    handleAgentRequest,
    handleFAQ,
    handleHours
};