// import Order from '../../models/Order.js';

// // Helper function to format Indian phone numbers
// function formatIndianPhoneNumber(phoneNumber) {
//     if (!phoneNumber) return 'Unknown';
    
//     // Remove any non-digit characters
//     const cleaned = phoneNumber.replace(/\D/g, '');
    
//     // Handle different WhatsApp number formats
//     if (cleaned.length === 12 && cleaned.startsWith('91')) {
//         // Format: 91XXXXXXXXXX -> +91 XXXXX XXXXX
//         return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
//     }
//     else if (cleaned.length === 10) {
//         // Format: XXXXXXXXXX -> +91 XXXXX XXXXX
//         return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
//     }
//     else if (cleaned.startsWith('1') && cleaned.length === 11) {
//         // US format but might be Indian number - convert
//         const withoutCountryCode = cleaned.substring(1);
//         if (withoutCountryCode.length === 10) {
//             return `+91 ${withoutCountryCode.substring(0, 5)} ${withoutCountryCode.substring(5)}`;
//         }
//     }
//     else {
//         // Return original if can't format
//         return phoneNumber;
//     }
// }

// export async function handleOrdersHistory(message, client) {
//     try {
//         // Format the phone number for display
//         const formattedPhone = formatIndianPhoneNumber(message.from);
//         console.log(`📦 Fetching orders for: ${formattedPhone}`);

//         const orders = await Order.find({ 
//             phoneNumber: message.from 
//         })
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select('orderNumber createdAt items totalPrice status paymentStatus shippingAddress')
//         .lean();

//         if (!orders || orders.length === 0) {
//             return await message.reply(
//                 `📭 *No Orders Found*\n\n` +
//                 `You haven't placed any orders yet.\n\n` +
//                 `🛍️ Start shopping with *Products* and create amazing spaces! 🎨\n\n` +
//                 `💡 *Quick Tip:* Browse our collection and place your first order today!`
//             );
//         }

//         let ordersText = `📦 *YOUR ORDER HISTORY*\n\n`;
//         ordersText += `👤 *Customer:* ${formattedPhone}\n`;
//         ordersText += `📊 *Total Orders:* ${orders.length}\n\n`;

//         orders.forEach((order, index) => {
//             const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//             });

//             const statusEmoji = getStatusEmoji(order.status);
//             const paymentEmoji = getPaymentEmoji(order.paymentStatus);
            
//             ordersText += 
//                 `🔸 *Order #${order.orderNumber}*\n` +
//                 `📅 ${orderDate}\n` +
//                 `🛒 ${order.items.length} item(s)\n` +
//                 `💰 Total: ₹${order.totalPrice}\n` +
//                 `📊 Status: ${statusEmoji} ${formatStatus(order.status)}\n` +
//                 `💳 Payment: ${paymentEmoji} ${formatPaymentStatus(order.paymentStatus)}\n`;

//             // Show product names if available
//             if (order.items && order.items.length > 0) {
//                 const productNames = order.items.map(item => item.productName).join(', ');
//                 if (productNames.length > 30) {
//                     ordersText += `📦 Products: ${productNames.substring(0, 30)}...\n`;
//                 } else {
//                     ordersText += `📦 Products: ${productNames}\n`;
//                 }
//             }

//             if (order.shippingAddress) {
//                 const shortAddress = order.shippingAddress.length > 25 
//                     ? order.shippingAddress.substring(0, 25) + '...' 
//                     : order.shippingAddress;
//                 ordersText += `🏠 Address: ${shortAddress}\n`;
//             }

//             ordersText += `\n${'─'.repeat(30)}\n\n`;
//         });

//         // Add summary
//         const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
//         const pendingOrders = orders.filter(order => 
//             order.status === 'pending' || order.status === 'processing'
//         ).length;
//         const deliveredOrders = orders.filter(order => 
//             order.status === 'delivered'
//         ).length;

//         ordersText += 
//             `📈 *Order Summary:*\n` +
//             `💰 Total Spent: ₹${totalSpent}\n` +
//             `⏳ Active Orders: ${pendingOrders}\n` +
//             `✅ Delivered: ${deliveredOrders}\n\n` +
//             `💡 *Need help with an order?*\n` +
//             `Type *Support* for immediate assistance.\n\n` +
//             `🛍️ Want to shop more? Type *Products*`;

//         await message.reply(ordersText);

//     } catch (error) {
//         console.error('❌ Error fetching orders history:', error);
//         await message.reply(
//             '❌ Sorry, I couldn\'t fetch your orders at the moment.\n\n' +
//             '🔧 Our team has been notified about this issue.\n\n' +
//             '💡 Please try again in a few minutes or contact support if the problem persists.'
//         );
//     }
// }

// function getStatusEmoji(status) {
//     const emojiMap = {
//         pending: '⏳',
//         confirmed: '✅',
//         processing: '🔄',
//         shipped: '🚚',
//         delivered: '🎉',
//         cancelled: '❌',
//         'pending_verification': '🔍'
//     };
//     return emojiMap[status.toLowerCase()] || '📋';
// }

// function getPaymentEmoji(paymentStatus) {
//     const emojiMap = {
//         pending: '⏳',
//         paid: '✅',
//         failed: '❌',
//         refunded: '💸',
//         verified: '🔒',
//         'under_review': '🔍',
//         rejected: '🚫'
//     };
//     return emojiMap[paymentStatus.toLowerCase()] || '💳';
// }

// function formatStatus(status) {
//     const statusMap = {
//         pending: 'PENDING',
//         confirmed: 'CONFIRMED',
//         processing: 'PROCESSING',
//         shipped: 'SHIPPED',
//         delivered: 'DELIVERED',
//         cancelled: 'CANCELLED',
//         'pending_verification': 'UNDER REVIEW'
//     };
//     return statusMap[status.toLowerCase()] || status.toUpperCase();
// }

// function formatPaymentStatus(paymentStatus ) {
//     const paymentMap = {
//         pending: 'PENDING',
//         paid: 'PAID',
//         failed: 'FAILED',
//         refunded: 'REFUNDED',
//         verified: 'VERIFIED',
//         'under_review': 'UNDER REVIEW',
//         rejected: 'REJECTED'
//     };
//     return paymentMap[paymentStatus.toLowerCase()] || paymentStatus.toUpperCase();
// }