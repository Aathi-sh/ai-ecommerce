// handlers/orderHistoryHandler.js - ENHANCED PROFESSIONAL VERSION
import apiService from "../../services/apiService.js";

// Helper function to format Indian phone numbers
function formatIndianPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'Unknown';
    
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different WhatsApp number formats
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
    }
    else if (cleaned.length === 10) {
        return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    else if (cleaned.startsWith('1') && cleaned.length === 11) {
        const withoutCountryCode = cleaned.substring(1);
        if (withoutCountryCode.length === 10) {
            return `+91 ${withoutCountryCode.substring(0, 5)} ${withoutCountryCode.substring(5)}`;
        }
    }
    
    return phoneNumber;
}

// Helper function to clean phone number for API calls
function cleanPhoneNumberForAPI(phoneNumber) {
    if (!phoneNumber) return '';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return cleaned.substring(2);
    }
    else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return cleaned.substring(1);
    }
    else if (cleaned.length === 10) {
        return cleaned;
    }
    else if (phoneNumber.includes('@')) {
        const numberPart = phoneNumber.split('@')[0];
        return cleanPhoneNumberForAPI(numberPart);
    }

    return cleaned;
}

// Safe number formatter
function safeNumber(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

function safeToFixed(value, digits = 2) {
    const num = safeNumber(value);
    return num.toFixed(digits);
}

// Format order status with proper emoji and text
function formatOrderStatus(status) {
    const statusMap = {
        'pending': { emoji: '⏳', text: 'PENDING', color: '#f39c12' },
        'confirmed': { emoji: '✅', text: 'CONFIRMED', color: '#3498db' },
        'processing': { emoji: '🔄', text: 'PROCESSING', color: '#3498db' },
        'packed': { emoji: '📦', text: 'PACKED', color: '#3498db' },
        'shipped': { emoji: '🚚', text: 'SHIPPED', color: '#9b59b6' },
        'out_for_delivery': { emoji: '🚛', text: 'OUT FOR DELIVERY', color: '#e67e22' },
        'delivered': { emoji: '🎉', text: 'DELIVERED', color: '#27ae60' },
        'completed': { emoji: '✅', text: 'COMPLETED', color: '#27ae60' },
        'cancelled': { emoji: '❌', text: 'CANCELLED', color: '#e74c3c' },
        'returned': { emoji: '🔄', text: 'RETURNED', color: '#95a5a6' },
        'refunded': { emoji: '💸', text: 'REFUNDED', color: '#95a5a6' }
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || { emoji: '📋', text: status?.toUpperCase() || 'UNKNOWN', color: '#7f8c8d' };
    return statusInfo;
}

// Format payment status with proper emoji and text
function formatPaymentStatus(status) {
    const paymentMap = {
        'pending': { emoji: '⏳', text: 'PENDING', color: '#f39c12' },
        'partial': { emoji: '💰', text: 'PARTIAL', color: '#f39c12' },
        'paid': { emoji: '✅', text: 'PAID', color: '#27ae60' },
        'verified': { emoji: '🔒', text: 'VERIFIED', color: '#27ae60' },
        'failed': { emoji: '❌', text: 'FAILED', color: '#e74c3c' },
        'refunded': { emoji: '💸', text: 'REFUNDED', color: '#95a5a6' },
        'rejected': { emoji: '🚫', text: 'REJECTED', color: '#e74c3c' },
        'under_review': { emoji: '🔍', text: 'UNDER REVIEW', color: '#f39c12' }
    };
    
    const paymentInfo = paymentMap[status?.toLowerCase()] || { emoji: '💳', text: status?.toUpperCase() || 'UNKNOWN', color: '#7f8c8d' };
    return paymentInfo;
}

// Format date safely
function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'N/A';
        
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

// Get product names from order
function getProductNames(order) {
    if (!order) return 'N/A';
    
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        return order.items.map(item => item.productName || item.name || 'Product').filter(Boolean).join(', ');
    }
    
    if (order.productName) return order.productName;
    
    return 'Product';
}

// Calculate order totals
function calculateOrderTotals(order) {
    const subtotal = safeNumber(order.subtotal);
    const shippingCharge = safeNumber(order.shippingCharge);
    const totalGst = safeNumber(order.totalGst);
    const totalDiscount = safeNumber(order.totalDiscount);
    const totalPrice = safeNumber(order.totalPrice);
    const paidAmount = safeNumber(order.paidAmount);
    const balanceAmount = safeNumber(order.balanceAmount) || (totalPrice - paidAmount);
    
    return {
        subtotal,
        shippingCharge,
        totalGst,
        totalDiscount,
        totalPrice,
        paidAmount,
        balanceAmount,
        gstRate: order.items?.[0]?.gstRate || 18
    };
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
            return await message.reply(
                `❌ *Invalid Phone Number*\n\n` +
                `I couldn't process your phone number to fetch orders.\n\n` +
                `📞 Please contact support for assistance at +91 98765 43210\n\n` +
                `Or type *Support* for immediate help.`
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
                `Hello! 👋 You haven't placed any orders yet.\n\n` +
                `🛍️ *Start Shopping:*\n` +
                `• Type *Products* to browse our collection\n` +
                `• Type *Order* to place your first order\n` +
                `• Check out our latest arrivals!\n\n` +
                `💡 *Quick Tip:* We have amazing posters and art prints waiting for you!\n\n` +
                `🎯 *Ready to shop?* Type *Products* now!`
            );
        }

        // Sort orders by date (newest first)
        const sortedOrders = orders.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.orderDate || a.updatedAt || 0);
            const dateB = new Date(b.createdAt || b.orderDate || b.updatedAt || 0);
            return dateB - dateA;
        });

        // Calculate statistics
        const totalSpent = sortedOrders.reduce((sum, order) => sum + safeNumber(order.totalPrice), 0);
        const totalPaid = sortedOrders.reduce((sum, order) => sum + safeNumber(order.paidAmount), 0);
        const totalPending = sortedOrders.reduce((sum, order) => sum + (safeNumber(order.totalPrice) - safeNumber(order.paidAmount)), 0);
        
        const pendingOrders = sortedOrders.filter(order => 
            ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'].includes(order.status?.toLowerCase())
        ).length;
        
        const deliveredOrders = sortedOrders.filter(order => 
            ['delivered', 'completed'].includes(order.status?.toLowerCase())
        ).length;
        
        const cancelledOrders = sortedOrders.filter(order => 
            ['cancelled', 'returned', 'refunded'].includes(order.status?.toLowerCase())
        ).length;

        // Build orders text
        let ordersText = `📦 *ORDER HISTORY*\n`;
        ordersText += `═══════════════════\n\n`;
        ordersText += `👤 *Customer:* ${formattedPhone}\n`;
        ordersText += `📊 *Total Orders:* ${sortedOrders.length}\n\n`;

        // Add summary
        ordersText += `📈 *Order Summary:*\n`;
        ordersText += `💰 Total Spent: ₹${safeToFixed(totalSpent)}\n`;
        ordersText += `✅ Paid Amount: ₹${safeToFixed(totalPaid)}\n`;
        ordersText += `⏳ Pending Payment: ₹${safeToFixed(totalPending)}\n`;
        ordersText += `📦 Active Orders: ${pendingOrders}\n`;
        ordersText += `🎉 Delivered: ${deliveredOrders}\n`;
        ordersText += `❌ Cancelled: ${cancelledOrders}\n\n`;
        ordersText += `═══════════════════\n\n`;

        // Check if message is too long (WhatsApp has 4096 character limit)
        const isLongMessage = sortedOrders.length > 5 || ordersText.length > 3000;
        
        if (isLongMessage) {
            ordersText += `📋 *Recent Orders (showing ${Math.min(5, sortedOrders.length)} of ${sortedOrders.length}):*\n\n`;
            
            // Show only recent 5 orders
            const recentOrders = sortedOrders.slice(0, 5);
            
            for (const order of recentOrders) {
                const orderDate = formatDate(order.createdAt || order.orderDate || order.updatedAt);
                const statusInfo = formatOrderStatus(order.status);
                const paymentInfo = formatPaymentStatus(order.paymentStatus);
                const totals = calculateOrderTotals(order);
                const productNames = getProductNames(order);
                
                ordersText += 
                    `🔸 *Order #${order.orderNumber || 'N/A'}*\n` +
                    `📅 Date: ${orderDate}\n` +
                    `📦 Status: ${statusInfo.emoji} ${statusInfo.text}\n` +
                    `💳 Payment: ${paymentInfo.emoji} ${paymentInfo.text}\n` +
                    `💰 Total: ₹${safeToFixed(totals.totalPrice)}\n` +
                    `✅ Paid: ₹${safeToFixed(totals.paidAmount)}\n` +
                    `⏳ Balance: ₹${safeToFixed(totals.balanceAmount)}\n` +
                    `📦 Items: ${order.items?.length || 1}\n` +
                    `🛍️ Product: ${productNames.length > 30 ? productNames.substring(0, 30) + '...' : productNames}\n` +
                    `${'-'.repeat(30)}\n\n`;
            }
            
            ordersText += `📝 *To see all ${sortedOrders.length} orders, please:*\n`;
            ordersText += `• Check your email for order confirmations\n`;
            ordersText += `• Visit our website dashboard\n`;
            ordersText += `• Contact support for detailed history\n\n`;
            
        } else {
            // Show all orders
            ordersText += `📋 *All Orders:*\n\n`;
            
            for (const order of sortedOrders) {
                const orderDate = formatDate(order.createdAt || order.orderDate || order.updatedAt);
                const statusInfo = formatOrderStatus(order.status);
                const paymentInfo = formatPaymentStatus(order.paymentStatus);
                const totals = calculateOrderTotals(order);
                const productNames = getProductNames(order);
                
                ordersText += 
                    `🔸 *Order #${order.orderNumber || 'N/A'}*\n` +
                    `📅 Date: ${orderDate}\n` +
                    `📦 Status: ${statusInfo.emoji} ${statusInfo.text}\n` +
                    `💳 Payment: ${paymentInfo.emoji} ${paymentInfo.text}\n` +
                    `💰 Total: ₹${safeToFixed(totals.totalPrice)}\n` +
                    `✅ Paid: ₹${safeToFixed(totals.paidAmount)}\n` +
                    `⏳ Balance: ₹${safeToFixed(totals.balanceAmount)}\n`;
                
                // Show GST if applicable
                if (totals.totalGst > 0) {
                    ordersText += `💵 GST: ₹${safeToFixed(totals.totalGst)}\n`;
                }
                
                ordersText += `📦 Items: ${order.items?.length || 1}\n`;
                
                // Show item details
                if (order.items && order.items.length > 0) {
                    ordersText += `🛍️ Products:\n`;
                    order.items.forEach((item, idx) => {
                        const itemName = item.productName || item.name || `Item ${idx + 1}`;
                        const itemQty = item.quantity || 1;
                        const itemPrice = safeNumber(item.price);
                        ordersText += `   ${idx + 1}. ${itemName} x${itemQty} - ₹${safeToFixed(itemPrice * itemQty)}\n`;
                    });
                } else {
                    ordersText += `🛍️ Product: ${productNames}\n`;
                }
                
                // Show shipping address if available
                if (order.shippingAddress) {
                    let address = '';
                    if (typeof order.shippingAddress === 'string') {
                        address = order.shippingAddress;
                    } else if (typeof order.shippingAddress === 'object') {
                        const addr = order.shippingAddress;
                        address = `${addr.street || ''}, ${addr.areaLocality || ''}, ${addr.cityDistrict || addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.replace(/^, |, $/g, '');
                    }
                    
                    if (address && address.length > 0) {
                        const shortAddress = address.length > 40 ? address.substring(0, 40) + '...' : address;
                        ordersText += `🏠 Ship to: ${shortAddress}\n`;
                    }
                }
                
                // Show customer name if available
                if (order.customerName) {
                    ordersText += `👤 Name: ${order.customerName}\n`;
                }
                
                // Show tracking if available
                if (order.trackingNumber) {
                    ordersText += `📮 Tracking: ${order.trackingNumber}\n`;
                }
                
                ordersText += `${'─'.repeat(30)}\n\n`;
            }
        }

        // Add footer with actions
        ordersText += 
            `💡 *Need Help?*\n` +
            `• Type *Order* to place new order\n` +
            `• Type *Products* to browse more\n` +
            `• Type *Support* for immediate assistance\n\n` +
            `📞 *Customer Support:* +91 98765 43210\n` +
            `📧 *Email:* support@posterpro.store\n\n` +
            `Thank you for shopping with us! 🎉`;

        await message.reply(ordersText);

    } catch (error) {
        console.error('❌ Error fetching orders history:', error);
        
        let errorMessage = '❌ *Service Temporarily Unavailable*\n\n';
        errorMessage += 'Sorry, I couldn\'t fetch your orders at the moment.\n\n';
        
        if (error.message?.includes('network') || error.message?.includes('timeout')) {
            errorMessage += '🔧 *Network Issue:*\n';
            errorMessage += '• Check your internet connection\n';
            errorMessage += '• Try again in a few moments\n';
        } else if (error.message?.includes('404')) {
            errorMessage += '🔧 *Service Unavailable:*\n';
            errorMessage += '• Order service is temporarily down\n';
            errorMessage += '• Our team is working on it\n';
        } else {
            errorMessage += '🔧 *Possible reasons:*\n';
            errorMessage += '• System maintenance in progress\n';
            errorMessage += '• Temporary technical issue\n';
        }
        
        errorMessage += '\n💡 *What you can do:*\n';
        errorMessage += '• Try again in a few minutes\n';
        errorMessage += '• Type *Support* for immediate help\n';
        errorMessage += '• Continue shopping with *Products*\n\n';
        errorMessage += 'We apologize for the inconvenience! 🙏';
        
        await message.reply(errorMessage);
    }
}

// Get order by ID
export async function getOrderById(message, orderId) {
    try {
        if (!orderId) {
            return await message.reply('❌ Please provide an order ID.');
        }

        const order = await apiService.getOrderById(orderId);
        
        if (!order) {
            return await message.reply(`❌ Order not found with ID: ${orderId}`);
        }

        const statusInfo = formatOrderStatus(order.status);
        const paymentInfo = formatPaymentStatus(order.paymentStatus);
        const totals = calculateOrderTotals(order);
        const productNames = getProductNames(order);

        let orderDetails = 
            `📦 *ORDER DETAILS*\n` +
            `═══════════════════\n\n` +
            `🆔 *Order #:* ${order.orderNumber}\n` +
            `📅 *Date:* ${formatDate(order.createdAt)}\n` +
            `👤 *Customer:* ${order.customerName || 'N/A'}\n` +
            `📱 *Phone:* ${order.phoneNumber || 'N/A'}\n` +
            `📦 *Status:* ${statusInfo.emoji} ${statusInfo.text}\n` +
            `💳 *Payment:* ${paymentInfo.emoji} ${paymentInfo.text}\n` +
            `💰 *Total:* ₹${safeToFixed(totals.totalPrice)}\n` +
            `✅ *Paid:* ₹${safeToFixed(totals.paidAmount)}\n` +
            `⏳ *Balance:* ₹${safeToFixed(totals.balanceAmount)}\n\n`;

        if (order.items && order.items.length > 0) {
            orderDetails += `🛍️ *Items:*\n`;
            order.items.forEach((item, idx) => {
                const itemName = item.productName || item.name || `Item ${idx + 1}`;
                const itemQty = item.quantity || 1;
                const itemPrice = safeNumber(item.price);
                orderDetails += `   ${idx + 1}. ${itemName} x${itemQty} - ₹${safeToFixed(itemPrice * itemQty)}\n`;
            });
            orderDetails += `\n`;
        }

        orderDetails += 
            `📋 *Need help?* Type *Support*\n` +
            `🛍️ *Shop more?* Type *Products*`;

        await message.reply(orderDetails);

    } catch (error) {
        console.error('❌ Error fetching order by ID:', error);
        await message.reply(`❌ Failed to fetch order: ${error.message}`);
    }
}

// Get order statistics for admin
export async function getOrderStats(message) {
    try {
        const stats = await apiService.getOrderStats('month');
        
        const response = 
            `📊 *ORDER STATISTICS*\n` +
            `═══════════════════\n\n` +
            `📦 Total Orders: ${stats.totalOrders || 0}\n` +
            `💰 Total Revenue: ₹${safeToFixed(stats.totalRevenue || 0)}\n` +
            `✅ Paid Amount: ₹${safeToFixed(stats.totalPaid || 0)}\n` +
            `⏳ Pending Amount: ₹${safeToFixed(stats.totalPending || 0)}\n` +
            `📈 Average Order: ₹${safeToFixed(stats.avgOrderValue || 0)}\n` +
            `📊 Min Order: ₹${safeToFixed(stats.minOrderValue || 0)}\n` +
            `📈 Max Order: ₹${safeToFixed(stats.maxOrderValue || 0)}\n\n` +
            `⏳ Pending Orders: ${stats.pendingOrders || 0}\n` +
            `✅ Completed Orders: ${stats.completedOrders || 0}\n`;

        await message.reply(response);

    } catch (error) {
        console.error('❌ Error fetching order stats:', error);
        await message.reply('❌ Failed to fetch order statistics.');
    }
}

export default {
    handleOrdersHistory,
    getOrderById,
    getOrderStats
};