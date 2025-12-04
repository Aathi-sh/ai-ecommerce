// import Order from "../../models/Order.js";
// import PaymentVerification from "../../models/paymentVerification.js";
// import pkg from 'whatsapp-web.js';
// const { MessageMedia } = pkg;

// // Payment verification team (replace with your admin numbers)
// const VERIFICATION_TEAM = [
//     '919876543210@c.us', // Replace with actual admin numbers
//     '919876543211@c.us'
// ];

// // Fraud detection patterns
// const FRAUD_PATTERNS = {
//     editedScreenshots: ['edited', 'modified', 'photoshop', 'paint'],
//     fakeUPI: ['fakeupi', 'testpayment', 'dummy'],
//     amountMismatch: ['amount not matching', 'wrong amount'],
//     timeMismatch: ['old screenshot', 'previous payment']
// };

// export async function handlePaymentVerification(message, client) {
//     try {
//         // Only allow verification team to process payments
//         if (!VERIFICATION_TEAM.includes(message.from)) {
//             await message.reply('❌ Access Denied. Payment verification is restricted to admin team.');
//             return;
//         }

//         const userMessage = message.body.trim();
        
//         if (userMessage.startsWith('!verify ')) {
//             return await verifyPaymentCommand(message, client);
//         }
//         else if (userMessage.startsWith('!reject ')) {
//             return await rejectPaymentCommand(message, client);
//         }
//         else if (userMessage.startsWith('!pending')) {
//             return await showPendingVerifications(message, client);
//         }
//         else if (userMessage.startsWith('!fraud ')) {
//             return await markAsFraudCommand(message, client);
//         }
//         else if (userMessage.startsWith('!orders ')) {
//             return await showCustomerOrders(message, client);
//         }
//         else {
//             await showVerificationHelp(message, client);
//         }

//     } catch (error) {
//         console.error('❌ Payment verification error:', error);
//         await message.reply('❌ Verification failed. Please check the command format.');
//     }
// }

// async function verifyPaymentCommand(message, client) {
//     const args = message.body.split(' ');
//     const orderNumber = args[1];
    
//     if (!orderNumber) {
//         return await message.reply(
//             '❌ Usage: !verify ORDER_NUMBER\n\n' +
//             'Example: !verify ORD-123456789'
//         );
//     }

//     // Find the order
//     const order = await Order.findOne({ orderNumber });
//     if (!order) {
//         return await message.reply(`❌ Order not found: ${orderNumber}`);
//     }

//     // Check if already verified
//     if (order.paymentStatus === 'paid') {
//         return await message.reply(`✅ Order ${orderNumber} is already paid and verified.`);
//     }

//     // Find payment verification record
//     let paymentVerification = await PaymentVerification.findOne({ orderNumber });
    
//     if (!paymentVerification) {
//         // Create a new verification record if none exists
//         paymentVerification = new PaymentVerification({
//             orderNumber: order.orderNumber,
//             customerPhone: order.phoneNumber,
//             orderDetails: {
//                 totalPrice: order.totalPrice,
//                 items: order.items,
//                 shippingAddress: order.shippingAddress,
//                 pincode: order.pincode
//             },
//             status: 'pending'
//         });
//         await paymentVerification.save();
//     }

//     // Perform fraud detection
//     const fraudCheck = await performFraudDetection(paymentVerification, order);
    
//     if (fraudCheck.isFraud) {
//         return await message.reply(
//             `🚨 FRAUD DETECTED!\n\n` +
//             `Order: ${orderNumber}\n` +
//             `Customer: ${formatIndianPhoneNumber(order.phoneNumber)}\n` +
//             `Amount: ₹${order.totalPrice}\n\n` +
//             `🔍 Fraud Reasons:\n${fraudCheck.reasons.join('\n')}\n\n` +
//             `Use !fraud ${orderNumber} to mark as fraud.`
//         );
//     }

//     // Verify the payment
//     await Order.findOneAndUpdate(
//         { orderNumber },
//         { 
//             paymentStatus: 'paid',
//             status: 'processing',
//             updatedBy: message.from
//         }
//     );

//     await PaymentVerification.findOneAndUpdate(
//         { orderNumber },
//         {
//             status: 'verified',
//             verifiedAt: new Date(),
//             verifiedBy: message.from,
//             fraudScore: fraudCheck.score,
//             detectedAmount: order.totalPrice,
//             detectedUPI: 'posterpro.store@upi'
//         }
//     );

//     // Notify customer
//     try {
//         await client.sendMessage(order.phoneNumber,
//             `🎉 *PAYMENT VERIFIED!*\n\n` +
//             `🧾 Order #: ${orderNumber}\n` +
//             `✅ Status: Payment Verified\n` +
//             `💰 Amount: ₹${order.totalPrice}\n\n` +
//             `🚚 *Next Steps:*\n` +
//             `• Order processing started\n` +
//             `• Shipping in 24-48 hours\n` +
//             `• Tracking number will be sent\n\n` +
//             `📦 Expected delivery: 3-5 business days\n\n` +
//             `Thank you for your purchase! 🌟`
//         );
//     } catch (error) {
//         console.error('Failed to notify customer:', error);
//     }

//     await message.reply(
//         `✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n` +
//         `🧾 Order: ${orderNumber}\n` +
//         `👤 Customer: ${formatIndianPhoneNumber(order.phoneNumber)}\n` +
//         `💰 Amount: ₹${order.totalPrice}\n` +
//         `📊 Fraud Score: ${fraudCheck.score}/100\n` +
//         `✅ Status: CLEAN\n\n` +
//         `Customer has been notified. Order is now in processing.`
//     );
// }

// async function rejectPaymentCommand(message, client) {
//     const args = message.body.split(' ');
//     const orderNumber = args[1];
//     const reason = args.slice(2).join(' ') || 'Payment proof unclear or invalid';
    
//     if (!orderNumber) {
//         return await message.reply(
//             '❌ Usage: !reject ORDER_NUMBER [REASON]\n\n' +
//             'Example: !reject ORD-123456789 "Screenshot blurry"\n' +
//             'Example: !reject ORD-123456789 "Amount mismatch"'
//         );
//     }

//     const order = await Order.findOne({ orderNumber });
//     if (!order) {
//         return await message.reply(`❌ Order not found: ${orderNumber}`);
//     }

//     await Order.findOneAndUpdate(
//         { orderNumber },
//         { 
//             paymentStatus: 'failed',
//             status: 'pending',
//             updatedBy: message.from
//         }
//     );

//     await PaymentVerification.findOneAndUpdate(
//         { orderNumber },
//         {
//             status: 'rejected',
//             rejectionReason: reason,
//             rejectedAt: new Date(),
//             rejectedBy: message.from
//         },
//         { upsert: true }
//     );

//     // Notify customer
//     try {
//         await client.sendMessage(order.phoneNumber,
//             `❌ *PAYMENT REJECTED*\n\n` +
//             `🧾 Order #: ${orderNumber}\n` +
//             `💰 Amount: ₹${order.totalPrice}\n\n` +
//             `📝 *Reason:* ${reason}\n\n` +
//             `🔄 *Please Resend:*\n` +
//             `1. Clear screenshot of payment\n` +
//             `2. Make sure amount ₹${order.totalPrice} is visible\n` +
//             `3. UPI ID: posterpro.store@upi\n` +
//             `4. Include order number\n\n` +
//             `Need help? Type *Support*`
//         );
//     } catch (error) {
//         console.error('Failed to notify customer:', error);
//     }

//     await message.reply(
//         `❌ *PAYMENT REJECTED*\n\n` +
//         `🧾 Order: ${orderNumber}\n` +
//         `👤 Customer: ${formatIndianPhoneNumber(order.phoneNumber)}\n` +
//         `📝 Reason: ${reason}\n\n` +
//         `Customer has been asked to resend payment proof.`
//     );
// }

// async function markAsFraudCommand(message, client) {
//     const args = message.body.split(' ');
//     const orderNumber = args[1];
    
//     if (!orderNumber) {
//         return await message.reply(
//             '❌ Usage: !fraud ORDER_NUMBER\n\n' +
//             'Example: !fraud ORD-123456789'
//         );
//     }

//     const order = await Order.findOne({ orderNumber });
//     if (!order) {
//         return await message.reply(`❌ Order not found: ${orderNumber}`);
//     }

//     // Mark as fraud and cancel order
//     await Order.findOneAndUpdate(
//         { orderNumber },
//         { 
//             paymentStatus: 'failed',
//             status: 'cancelled',
//             isActive: false,
//             updatedBy: message.from
//         }
//     );

//     await PaymentVerification.findOneAndUpdate(
//         { orderNumber },
//         {
//             status: 'fraud',
//             fraudMarked: true,
//             fraudMarkedAt: new Date(),
//             fraudMarkedBy: message.from,
//             fraudScore: 100
//         },
//         { upsert: true }
//     );

//     // Add to fraud database
//     await addToFraudDatabase(order);

//     await message.reply(
//         `🚨 *MARKED AS FRAUD*\n\n` +
//         `🧾 Order: ${orderNumber}\n` +
//         `👤 Customer: ${formatIndianPhoneNumber(order.phoneNumber)}\n` +
//         `💰 Amount: ₹${order.totalPrice}\n` +
//         `⏰ Time: ${new Date().toLocaleString()}\n\n` +
//         `❌ Order cancelled and customer blocked.`
//     );
// }

// async function showPendingVerifications(message, client) {
//     const pendingOrders = await Order.find({ 
//         paymentStatus: 'pending',
//         status: 'pending'
//     })
//     .sort({ createdAt: -1 })
//     .limit(10)
//     .lean();

//     if (!pendingOrders || pendingOrders.length === 0) {
//         return await message.reply('✅ No pending payment verifications.');
//     }

//     let response = `⏳ *PENDING PAYMENT VERIFICATIONS*\n\n`;
    
//     pendingOrders.forEach((order, index) => {
//         response += 
//             `${index + 1}. *${order.orderNumber}*\n` +
//             `   👤 ${formatIndianPhoneNumber(order.phoneNumber)}\n` +
//             `   💰 ₹${order.totalPrice}\n` +
//             `   📦 ${order.items.length} item(s)\n` +
//             `   ⏰ ${new Date(order.createdAt).toLocaleString()}\n` +
//             `   🏠 ${order.shippingAddress.substring(0, 20)}...\n\n`;
//     });

//     response += `Use !verify ORDER_NUMBER to verify payment.`;

//     await message.reply(response);
// }

// async function showCustomerOrders(message, client) {
//     const args = message.body.split(' ');
//     const phoneNumber = args[1];
    
//     if (!phoneNumber) {
//         return await message.reply(
//             '❌ Usage: !orders PHONE_NUMBER\n\n' +
//             'Example: !orders 919876543210'
//         );
//     }

//     const customerOrders = await Order.find({ 
//         phoneNumber: phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`
//     })
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .lean();

//     if (!customerOrders || customerOrders.length === 0) {
//         return await message.reply(`📭 No orders found for ${formatIndianPhoneNumber(phoneNumber)}`);
//     }

//     let response = `📦 *CUSTOMER ORDER HISTORY*\n\n`;
//     response += `👤 Customer: ${formatIndianPhoneNumber(phoneNumber)}\n\n`;

//     customerOrders.forEach((order, index) => {
//         const statusEmoji = getStatusEmoji(order.status);
//         const paymentEmoji = getPaymentEmoji(order.paymentStatus);
        
//         response += 
//             `${index + 1}. *${order.orderNumber}*\n` +
//             `   📅 ${new Date(order.createdAt).toLocaleDateString()}\n` +
//             `   💰 ₹${order.totalPrice}\n` +
//             `   📊 ${statusEmoji} ${order.status}\n` +
//             `   💳 ${paymentEmoji} ${order.paymentStatus}\n` +
//             `   🏠 ${order.shippingAddress.substring(0, 25)}...\n\n`;
//     });

//     await message.reply(response);
// }

// async function performFraudDetection(paymentVerification, order) {
//     let fraudScore = 0;
//     const reasons = [];

//     // 1. Check amount matching (if detected amount exists)
//     if (paymentVerification.detectedAmount && paymentVerification.detectedAmount !== order.totalPrice) {
//         fraudScore += 30;
//         reasons.push(`❌ Amount mismatch: Detected ₹${paymentVerification.detectedAmount}, Expected ₹${order.totalPrice}`);
//     }

//     // 2. Check UPI ID (if detected UPI exists)
//     if (paymentVerification.detectedUPI && paymentVerification.detectedUPI !== 'posterpro.store@upi') {
//         fraudScore += 25;
//         reasons.push(`❌ Wrong UPI ID: ${paymentVerification.detectedUPI}`);
//     }

//     // 3. Check time (payment should be recent)
//     const orderTime = order.createdAt;
//     const timeDiff = Math.abs(new Date() - orderTime) / (1000 * 60); // minutes since order
    
//     if (timeDiff > 120) { // More than 2 hours since order
//         fraudScore += 15;
//         reasons.push(`⚠️ Order is ${Math.round(timeDiff/60)} hours old`);
//     }

//     // 4. Check for edited images
//     if (paymentVerification.imageAnalysis?.isEdited) {
//         fraudScore += 50;
//         reasons.push(`🚨 Image appears to be edited`);
//     }

//     // 5. Check customer history
//     const customerOrders = await Order.find({ 
//         phoneNumber: order.phoneNumber
//     });
    
//     const failedPayments = customerOrders.filter(o => o.paymentStatus === 'failed').length;
//     if (failedPayments > 2) {
//         fraudScore += 20;
//         reasons.push(`⚠️ Customer has ${failedPayments} failed payments`);
//     }

//     return {
//         isFraud: fraudScore >= 50,
//         score: fraudScore,
//         reasons: reasons.length > 0 ? reasons : ['✅ No fraud indicators detected']
//     };
// }

// async function showVerificationHelp(message, client) {
//     await message.reply(
//         `🔒 *PAYMENT VERIFICATION SYSTEM*\n\n` +
//         `*Commands:*\n` +
//         `• !verify ORDER_NUMBER - Verify payment\n` +
//         `• !reject ORDER_NUMBER REASON - Reject payment\n` +
//         `• !fraud ORDER_NUMBER - Mark as fraud\n` +
//         `• !pending - Show pending verifications\n` +
//         `• !orders PHONE_NUMBER - Show customer orders\n\n` +
//         `*Order Status Flow:*\n` +
//         `🟡 pending → 🟢 processing (after verification)\n` +
//         `🟡 pending → 🔴 cancelled (if fraud)\n\n` +
//         `*Payment Status:*\n` +
//         `🟡 pending → 🟢 paid (after verification)\n` +
//         `🟡 pending → 🔴 failed (if rejected)\n\n` +
//         `Stay vigilant! 🛡️`
//     );
// }

// async function addToFraudDatabase(order) {
//     // Implement your fraud database logic here
//     console.log(`🚨 Fraud detected: ${order.orderNumber} - ${order.phoneNumber}`);
    
//     // You can create a separate Fraud collection or flag the customer
//     // Example: Add to a fraud collection or mark customer as suspicious
// }

// // Helper functions
// function getStatusEmoji(status) {
//     const emojiMap = {
//         pending: '⏳',
//         processing: '🔄',
//         shipped: '🚚',
//         delivered: '🎉',
//         cancelled: '❌'
//     };
//     return emojiMap[status.toLowerCase()] || '📋';
// }

// function getPaymentEmoji(paymentStatus) {
//     const emojiMap = {
//         pending: '⏳',
//         paid: '✅',
//         failed: '❌',
//         refunded: '💸'
//     };
//     return emojiMap[paymentStatus.toLowerCase()] || '💳';
// }

// // Helper function to format Indian phone numbers
// function formatIndianPhoneNumber(phoneNumber) {
//     if (!phoneNumber) return 'Unknown';
//     try {
//         const numberPart = phoneNumber.split('@')[0];
//         const digitsOnly = numberPart.replace(/\D/g, '');
        
//         if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
//             return `+91 ${digitsOnly.substring(2, 7)} ${digitsOnly.substring(7)}`;
//         }
//         else if (digitsOnly.length === 10) {
//             return `+91 ${digitsOnly.substring(0, 5)} ${digitsOnly.substring(5)}`;
//         }
//         return phoneNumber;
//     } catch {
//         return phoneNumber;
//     }
// }