import apiService from "../../services/apiService.js";

// Helper function to format Indian phone numbers
function formatIndianPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'Unknown';
    
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different WhatsApp number formats
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        // Format: 91XXXXXXXXXX -> +91 XXXXX XXXXX
        return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
    }
    else if (cleaned.length === 10) {
        // Format: XXXXXXXXXX -> +91 XXXXX XXXXX
        return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    else if (cleaned.startsWith('1') && cleaned.length === 11) {
        // US format but might be Indian number - convert
        const withoutCountryCode = cleaned.substring(1);
        if (withoutCountryCode.length === 10) {
            return `+91 ${withoutCountryCode.substring(0, 5)} ${withoutCountryCode.substring(5)}`;
        }
    }
    else {
        // Return original if can't format
        return phoneNumber;
    }
}

// Helper function to clean phone number for API calls
function cleanPhoneNumberForAPI(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different phone number formats
    let searchPhone = cleaned;
    
    // If it's 12 digits and starts with 91 (India country code), remove the 91
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        searchPhone = cleaned.substring(2);
    }
    // If it's 11 digits and starts with 1 (US format), remove the 1
    else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        searchPhone = cleaned.substring(1);
    }
    // If it's 10 digits, use as is (Indian number without country code)
    else if (cleaned.length === 10) {
        searchPhone = cleaned;
    }
    // For WhatsApp numbers with @lid suffix, extract the number part
    else if (phoneNumber.includes('@')) {
        const numberPart = phoneNumber.split('@')[0];
        return cleanPhoneNumberForAPI(numberPart);
    }

    return searchPhone;
}

export async function handleOrdersHistory(message, client) {
    try {
        const from = message.from;
        
        // Format the phone number for display
        const formattedPhone = formatIndianPhoneNumber(from);
        
        // Clean the phone number for API call
        const cleanPhone = cleanPhoneNumberForAPI(from);
        
        console.log(`📦 Fetching orders for:`, {
            original: from,
            formatted: formattedPhone,
            cleanForAPI: cleanPhone
        });

        if (!cleanPhone || cleanPhone.length < 10) {
            console.log(`❌ Invalid phone number for API: ${cleanPhone}`);
            return await message.reply(
                `❌ *Invalid Phone Number*\n\n` +
                `I couldn't process your phone number to fetch orders.\n\n` +
                `🔧 Please contact support for assistance.\n\n` +
                `📞 Support will help you access your order history.`
            );
        }

        // 🔄 Use API call to get customer orders
        console.log(`🔍 Calling API for orders with phone: ${cleanPhone}`);
        const orders = await apiService.getCustomerOrders(cleanPhone);

        console.log(`📊 Orders API response:`, {
            ordersCount: orders ? orders.length : 0,
            hasOrders: orders && orders.length > 0
        });

        if (!orders || orders.length === 0) {
            return await message.reply(
                `📭 *No Orders Found*\n\n` +
                `You haven't placed any orders yet.\n\n` +
                `🛍️ Start shopping with *Products* and create amazing spaces! 🎨\n\n` +
                `💡 *Quick Tip:* Browse our collection and place your first order today!\n\n` +
                `🎯 Type *Products* to see what's available!`
            );
        }

        // Sort orders by date (newest first) - REMOVED THE SLICE(0, 5) LIMIT
        const sortedOrders = orders.sort((a, b) => 
            new Date(b.createdAt || b.orderDate || b.date || b.updatedAt) - 
            new Date(a.createdAt || a.orderDate || a.date || a.updatedAt)
        );

        let ordersText = `📦 *YOUR ORDER HISTORY*\n\n`;
        ordersText += `👤 *Customer:* ${formattedPhone}\n`;
        ordersText += `📊 *Total Orders:* ${sortedOrders.length}\n\n`;
        
        // If too many orders, show them in batches
        if (sortedOrders.length > 10) {
            ordersText += `📋 *Showing all ${sortedOrders.length} orders (oldest to newest):*\n\n`;
        } else {
            ordersText += `📋 *All Orders:*\n\n`;
        }

        // Loop through ALL orders (not limited to 5)
        sortedOrders.forEach((order, index) => {
            const orderDate = new Date(order.createdAt || order.orderDate || order.date || order.updatedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const statusEmoji = getStatusEmoji(order.status);
            const paymentEmoji = getPaymentEmoji(order.paymentStatus);
            
            ordersText += 
                `🔸 *Order #${order.orderNumber || order._id || `ORD-${index + 1}`}*\n` +
                `📅 ${orderDate}\n` +
                `🛒 ${order.items ? order.items.length : 1} item(s)\n` +
                `💰 Total: ₹${order.totalPrice || order.amount || 'N/A'}\n` +
                `📊 Status: ${statusEmoji} ${formatStatus(order.status)}\n` +
                `💳 Payment: ${paymentEmoji} ${formatPaymentStatus(order.paymentStatus)}\n`;

            // Show product names if available
            if (order.items && order.items.length > 0) {
                const productNames = order.items.map(item => item.productName || item.name || 'Unnamed Product').join(', ');
                if (productNames.length > 30) {
                    ordersText += `📦 Products: ${productNames.substring(0, 30)}...\n`;
                } else {
                    ordersText += `📦 Products: ${productNames}\n`;
                }
            } else if (order.productName) {
                // Handle single product orders
                ordersText += `📦 Product: ${order.productName}\n`;
            }

            if (order.shippingAddress) {
                const shortAddress = order.shippingAddress.length > 25 
                    ? order.shippingAddress.substring(0, 25) + '...' 
                    : order.shippingAddress;
                ordersText += `🏠 Address: ${shortAddress}\n`;
            }

            // Add customer name if available
            if (order.customerName) {
                ordersText += `👤 Customer: ${order.customerName}\n`;
            }

            ordersText += `\n${'─'.repeat(30)}\n\n`;
        });

        // Add summary
        const totalSpent = sortedOrders.reduce((sum, order) => sum + (order.totalPrice || order.amount || 0), 0);
        const pendingOrders = sortedOrders.filter(order => 
            order.status === 'pending' || order.status === 'processing' || order.status === 'confirmed'
        ).length;
        const deliveredOrders = sortedOrders.filter(order => 
            order.status === 'delivered' || order.status === 'completed'
        ).length;
        const cancelledOrders = sortedOrders.filter(order => 
            order.status === 'cancelled'
        ).length;

        ordersText += 
            `📈 *Order Summary:*\n` +
            `💰 Total Spent: ₹${totalSpent}\n` +
            `⏳ Active Orders: ${pendingOrders}\n` +
            `✅ Delivered: ${deliveredOrders}\n` +
            `❌ Cancelled: ${cancelledOrders}\n` +
            `📦 Total Orders: ${sortedOrders.length}\n\n`;

        // Add message about all orders being shown
        if (sortedOrders.length > 10) {
            ordersText += `📝 *Note:* All ${sortedOrders.length} orders are shown above.\n\n`;
        }

        ordersText += 
            `💡 *Need help with an order?*\n` +
            `Type *Support* for immediate assistance.\n\n` +
            `🛍️ Want to shop more? Type *Products*`;

        // Check if message is too long (WhatsApp has 4096 character limit)
        if (ordersText.length > 4000) {
            ordersText = `📦 *YOUR ORDER HISTORY*\n\n`;
            ordersText += `👤 *Customer:* ${formattedPhone}\n`;
            ordersText += `📊 *Total Orders:* ${sortedOrders.length}\n\n`;
            ordersText += `📈 *Order Summary:*\n` +
                         `💰 Total Spent: ₹${totalSpent}\n` +
                         `⏳ Active Orders: ${pendingOrders}\n` +
                         `✅ Delivered: ${deliveredOrders}\n` +
                         `❌ Cancelled: ${cancelledOrders}\n\n`;
            
            ordersText += 
                `📋 *Recent Orders (showing ${Math.min(10, sortedOrders.length)} of ${sortedOrders.length}):*\n\n`;
            
            // Show only recent 10 orders if message is too long
            const recentOrders = sortedOrders.slice(0, 10);
            recentOrders.forEach((order, index) => {
                const orderDate = new Date(order.createdAt || order.orderDate || order.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                
                ordersText += 
                    `• ${order.orderNumber || `ORD-${index + 1}`} - ₹${order.totalPrice || order.amount || 'N/A'} - ${formatStatus(order.status)}\n`;
            });
            
            ordersText += `\n💡 *To see all ${sortedOrders.length} orders, please check your email or contact support.*\n\n`;
            ordersText += `🛍️ Shop more: Type *Products*`;
        }

        await message.reply(ordersText);

    } catch (error) {
        console.error('❌ Error fetching orders history:', error);
        await message.reply(
            '❌ *Service Temporarily Unavailable*\n\n' +
            'Sorry, I couldn\'t fetch your orders at the moment.\n\n' +
            '🔧 *Possible reasons:*\n' +
            '• Order service is temporarily down\n' +
            '• Network connectivity issue\n' +
            '• System maintenance in progress\n\n' +
            '💡 *What you can do:*\n' +
            '• Try again in a few minutes\n' +
            '• Type *Support* for immediate help\n' +
            '• Continue shopping with *Products*\n\n' +
            'We apologize for the inconvenience! 🙏'
        );
    }
}

function getStatusEmoji(status) {
    const emojiMap = {
        pending: '⏳',
        confirmed: '✅',
        processing: '🔄',
        shipped: '🚚',
        delivered: '🎉',
        completed: '🎉',
        cancelled: '❌',
        'pending_verification': '🔍',
        'under_review': '🔍'
    };
    return emojiMap[status?.toLowerCase()] || '📋';
}

function getPaymentEmoji(paymentStatus) {
    const emojiMap = {
        pending: '⏳',
        paid: '✅',
        failed: '❌',
        refunded: '💸',
        verified: '🔒',
        'under_review': '🔍',
        rejected: '🚫',
        completed: '✅',
        confirmed: '✅'
    };
    return emojiMap[paymentStatus?.toLowerCase()] || '💳';
}

function formatStatus(status) {
    const statusMap = {
        pending: 'PENDING',
        confirmed: 'CONFIRMED',
        processing: 'PROCESSING',
        shipped: 'SHIPPED',
        delivered: 'DELIVERED',
        completed: 'COMPLETED',
        cancelled: 'CANCELLED',
        'pending_verification': 'UNDER REVIEW',
        'under_review': 'UNDER REVIEW'
    };
    return statusMap[status?.toLowerCase()] || status?.toUpperCase() || 'UNKNOWN';
}

function formatPaymentStatus(paymentStatus) {
    const paymentMap = {
        pending: 'PENDING',
        paid: 'PAID',
        failed: 'FAILED',
        refunded: 'REFUNDED',
        verified: 'VERIFIED',
        'under_review': 'UNDER REVIEW',
        rejected: 'REJECTED',
        completed: 'COMPLETED',
        confirmed: 'CONFIRMED'
    };
    return paymentMap[paymentStatus?.toLowerCase()] || paymentStatus?.toUpperCase() || 'UNKNOWN';
}