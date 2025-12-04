// import Product from '../../models/Product.js';
// import Order from '../../models/Order.js';
// import pkg from 'whatsapp-web.js';
// const { MessageMedia } = pkg;

// export async function handleOrderFlow(message, client, userSession, userSessions) {
//     const userMessage = message.body.trim();
//     const from = message.from;

//     try {
//         // Check for cancellation at ANY point in the order process (except during cancellation confirmation)
//         if (userSession.state !== 'AWAITING_CANCELLATION_CONFIRMATION' && 
//             await handleCancellationRequest(message, userSession, userSessions)) {
//             return; // Stop further processing if user cancelled
//         }

//         switch (userSession.state) {
//             case 'START_ORDER':
//                 return await startOrderConfirmation(message, userSession);
            
//             case 'AWAITING_ORDER_CONFIRMATION':
//                 return await handleOrderStartConfirmation(message, userSession);
            
//             case 'AWAITING_PRODUCT_ID':
//                 return await handleProductIdInput(message, userSession);
            
//             case 'AWAITING_QUANTITY':
//                 return await handleQuantityInput(message, userSession);
            
//             case 'AWAITING_PRODUCT_CONFIRMATION':
//                 return await handleProductConfirmation(message, userSession);
            
//             case 'AWAITING_OPTIONS':
//                 return await handleOptionsInput(message, userSession);
            
//             case 'AWAITING_DOOR_NUMBER':
//                 return await handleDoorNumber(message, userSession);
            
//             case 'AWAITING_STREET_NAME':
//                 return await handleStreetName(message, userSession);
            
//             case 'AWAITING_AREA_LOCALITY':
//                 return await handleAreaLocality(message, userSession);
            
//             case 'AWAITING_CITY_DISTRICT':
//                 return await handleCityDistrict(message, userSession);
            
//             case 'AWAITING_STATE':
//                 return await handleState(message, userSession);
            
//             case 'AWAITING_PINCODE':
//                 return await handlePincode(message, userSession);
            
//             case 'AWAITING_FINAL_CONFIRMATION':
//                 return await handleFinalConfirmation(message, userSession, userSessions);
            
//             case 'AWAITING_PAYMENT_PROOF':
//                 return await handlePaymentProof(message, userSession, userSessions);
            
//             case 'AWAITING_CANCELLATION_CONFIRMATION':
//                 return await handleCancellationConfirmation(message, userSession, userSessions);
            
//             default:
//                 userSession.state = 'IDLE';
//                 return await message.reply('🔄 Session reset. Type *Products* to browse or *Order* to start again.');
//         }
//     } catch (error) {
//         console.error('Order flow error:', error);
//         userSession.state = 'IDLE';
//         await message.reply('❌ Order process interrupted. Please start again with *Order*.');
//     }
// }

// // NEW FUNCTION: Handle cancellation requests at ANY point
// async function handleCancellationRequest(message, userSession, userSessions) {
//     const userMessage = message.body.trim().toLowerCase();
//     const cancellationKeywords = [
//         'cancel', 'stop', 'quit', 'exit', 'no', 'nevermind', 
//         'never mind', 'forget it', 'abort', 'end', 'bye'
//     ];

//     // Check if user wants to cancel
//     if (cancellationKeywords.some(keyword => userMessage.includes(keyword))) {
//         await message.reply(
//             `🛑 *Cancel Order Process?*\n\n` +
//             `Are you sure you want to cancel the current order process?\n\n` +
//             `✅ Type *YES* to confirm cancellation\n` +
//             `❌ Type *NO* to continue ordering\n\n` +
//             `This will clear all your current order details.`
//         );
        
//         // Store original state to return to if user says NO
//         userSession.previousState = userSession.state;
//         userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
//         return true;
//     }

//     return false;
// }

// // NEW FUNCTION: Handle cancellation confirmation separately
// async function handleCancellationConfirmation(message, userSession, userSessions) {
//     const userMessage = message.body.trim().toLowerCase();
    
//     if (userMessage === 'yes' || userMessage === 'y') {
//         await message.reply(
//             `❌ *Order Process Cancelled*\n\n` +
//             `Your order process has been cancelled successfully.\n\n` +
//             `🛍️ You can start a new order anytime by typing *Order*\n` +
//             `📦 Browse products by typing *Products*\n\n` +
//             `Thank you for considering us! 🙏`
//         );
        
//         // Clear session data
//         userSession.state = 'IDLE';
//         if (userSession.orderData) {
//             delete userSession.orderData;
//         }
//         if (userSession.previousState) {
//             delete userSession.previousState;
//         }
//         userSessions.delete(message.from);
//         return;
        
//     } else if (userMessage === 'no' || userMessage === 'n') {
//         // Return to previous state
//         const previousState = userSession.previousState;
//         userSession.state = previousState;
//         delete userSession.previousState;
        
//         await message.reply(
//             `✅ *Order Process Resumed*\n\n` +
//             `Great! Let's continue with your order.\n\n` +
//             `${getStateSpecificMessage(previousState)}`
//         );
//         return;
//     } else {
//         await message.reply(
//             `❓ *Please confirm cancellation*\n\n` +
//             `Type *YES* to cancel order process\n` +
//             `Type *NO* to continue ordering\n\n` +
//             `Your current progress will be saved if you continue.`
//         );
//         return;
//     }
// }

// // Helper function to get state-specific messages
// function getStateSpecificMessage(state) {
//     const messages = {
//         'AWAITING_PRODUCT_ID': '📝 Please enter the Product ID:',
//         'AWAITING_QUANTITY': '📝 Please enter the quantity:',
//         'AWAITING_PRODUCT_CONFIRMATION': '🤔 Please confirm the order details:',
//         'AWAITING_OPTIONS': '🎨 Please enter customization options or type SKIP:',
//         'AWAITING_DOOR_NUMBER': '🏠 Please enter your door/flat number:',
//         'AWAITING_STREET_NAME': '🏠 Please enter your street name:',
//         'AWAITING_AREA_LOCALITY': '🏠 Please enter your area/locality:',
//         'AWAITING_CITY_DISTRICT': '🏠 Please enter your city/district:',
//         'AWAITING_STATE': '🏠 Please enter your state:',
//         'AWAITING_PINCODE': '🏠 Please enter your pincode:',
//         'AWAITING_FINAL_CONFIRMATION': '✅ Please confirm to place order:',
//         'AWAITING_PAYMENT_PROOF': '📸 Please send payment screenshot:'
//     };
    
//     return messages[state] || 'Please continue with your order.';
// }

// async function startOrderConfirmation(message, userSession) {
//     await message.reply(
//         `🛒 *Start New Order*\n\n` +
//         `Ready to place an order? I'll guide you through the process step by step! 🎯\n\n` +
//         `📋 *Order Process:*\n` +
//         `1. Enter Product ID\n` +
//         `2. Choose Quantity\n` +
//         `3. Customization (if available)\n` +
//         `4. Shipping Address Details\n` +
//         `5. Confirm & Pay\n\n` +
//         `🤔 *Would you like to continue?*\n\n` +
//         `Type *YES* to start ordering\n` +
//         `Type *NO* to cancel\n\n` +
//         `💡 *You can type CANCEL at any time to stop the process*`
//     );
//     userSession.state = 'AWAITING_ORDER_CONFIRMATION';
// }

// async function handleOrderStartConfirmation(message, userSession) {
//     const response = message.body.trim().toLowerCase();
    
//     if (response === 'yes' || response === 'y') {
//         await message.reply(
//             `🎯 *Let's Start Your Order!*\n\n` +
//             `Please enter the *Product ID* you want to order:\n\n` +
//             `💡 *How to find Product ID:*\n` +
//             `• Type *Products* to see all products with their IDs\n` +
//             `• Look for the ID next to each product\n` +
//             `• Example format: 64abc123def456\n\n` +
//             `📝 *Enter Product ID:*\n\n` +
//             `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
//         );
//         userSession.state = 'AWAITING_PRODUCT_ID';
//     } else if (response === 'no' || response === 'n') {
//         await message.reply(
//             `👋 No problem! Feel free to browse products anytime by typing *Products*.\n\n` +
//             `We're here when you're ready to order! 🛍️`
//         );
//         userSession.state = 'IDLE';
//     } else {
//         await message.reply(
//             `❓ Please type *YES* to start ordering or *NO* to cancel.\n\n` +
//             `Would you like to place an order?`
//         );
//     }
// }

// async function handleProductIdInput(message, userSession) {
//     const productId = message.body.trim();
    
//     // Validate product ID format (MongoDB ObjectId format)
//     if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
//         await message.reply(
//             `❌ *Invalid Product ID Format*\n\n` +
//             `Please enter a valid Product ID.\n\n` +
//             `💡 *Valid format:* 24-character code like:\n` +
//             `• 64abc123def456789abc1234\n` +
//             `• 507f1f77bcf86cd799439011\n\n` +
//             `📝 *Enter correct Product ID:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     // Find product
//     const product = await Product.findById(productId);
//     if (!product) {
//         await message.reply(
//             `❌ *Product Not Found*\n\n` +
//             `No product found with ID: ${productId}\n\n` +
//             `💡 *Please check:*\n` +
//             `• Make sure you typed the ID correctly\n` +
//             `• Type *Products* to see all available products\n` +
//             `• Contact support if you need help\n\n` +
//             `📝 *Enter correct Product ID:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     if (!product.isActive) {
//         await message.reply(
//             `❌ *Product Not Available*\n\n` +
//             `"${product.productName}" is currently not available for purchase.\n\n` +
//             `💡 Please choose another product by typing *Products*`
//         );
//         userSession.state = 'IDLE';
//         return;
//     }

//     // Store product info
//     userSession.orderData = {
//         productId: product._id,
//         productName: product.productName,
//         price: product.price,
//         imageUrl: product.imageUrl,
//         options: product.options,
//         stock: product.stock,
//         address: {} // Initialize address object
//     };

//     // Show product details and ask for quantity
//     let productInfo = 
//         `✅ *Product Found!*\n\n` +
//         `🛍️ *${product.productName}*\n` +
//         `💰 Price: ₹${product.price}\n` +
//         `📦 Available: ${product.stock} units\n`;

//     if (product.description) {
//         productInfo += `📝 ${product.description}\n`;
//     }

//     productInfo += 
//         `\n🎯 *Now, please enter quantity:*\n\n` +
//         `💡 *Note:* Maximum ${product.stock} units available\n` +
//         `📝 *Enter quantity (1-${product.stock}):*\n\n` +
//         `💡 Type *CANCEL* to stop order process`;

//     // Try to send product image
//     try {
//         if (product.imageUrl && await isValidImageUrl(product.imageUrl)) {
//             const media = await MessageMedia.fromUrl(product.imageUrl);
//             await message.reply(media, null, { caption: productInfo });
//         } else {
//             await message.reply(productInfo);
//         }
//     } catch (error) {
//         await message.reply(productInfo);
//     }

//     userSession.state = 'AWAITING_QUANTITY';
// }

// async function handleQuantityInput(message, userSession) {
//     const quantityInput = message.body.trim();
//     const quantity = parseInt(quantityInput);

//     // Validate quantity
//     if (isNaN(quantity) || quantity < 1) {
//         await message.reply(
//             `❌ *Invalid Quantity*\n\n` +
//             `Please enter a valid number (minimum 1).\n\n` +
//             `📝 *Enter quantity for ${userSession.orderData.productName}:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     if (quantity > userSession.orderData.stock) {
//         await message.reply(
//             `❌ *Insufficient Stock*\n\n` +
//             `Only ${userSession.orderData.stock} units available for "${userSession.orderData.productName}".\n\n` +
//             `💡 Please enter quantity between 1-${userSession.orderData.stock}\n\n` +
//             `📝 *Enter quantity:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     // Update order data with quantity
//     userSession.orderData.quantity = quantity;
//     userSession.orderData.totalPrice = userSession.orderData.price * quantity;

//     // Show order summary and ask for confirmation
//     let confirmationText = 
//         `📋 *Order Summary*\n\n` +
//         `🛍️ *Product:* ${userSession.orderData.productName}\n` +
//         `💰 *Unit Price:* ₹${userSession.orderData.price}\n` +
//         `🛒 *Quantity:* ${quantity}\n` +
//         `💵 *Total Amount:* ₹${userSession.orderData.totalPrice}\n`;

//     if (userSession.orderData.options) {
//         confirmationText += `\n⚙️ *Available Options:* ${userSession.orderData.options}\n\n` +
//         `🎨 *Would you like any customization?*\n\n` +
//         `💡 Example: "Blue, Large" or "With Frame"\n\n` +
//         `Type your preferences or type *SKIP* to continue:\n\n` +
//         `💡 Type *CANCEL* to stop order process`;
        
//         userSession.state = 'AWAITING_OPTIONS';
//     } else {
//         confirmationText += `\n🤔 *Confirm this order?*\n\n` +
//         `*Please give the address details correctly without error*\n\n` +
//         `Type *CONFIRM* to continue\n` +
//         `Type *CANCEL* to stop order process`;
        
//         userSession.state = 'AWAITING_PRODUCT_CONFIRMATION';
//     }

//     await message.reply(confirmationText);
// }

// async function handleOptionsInput(message, userSession) {
//     const options = message.body.trim();
    
//     if (options.toLowerCase() === 'skip') {
//         userSession.orderData.selectedOptions = 'No customization';
//     } else {
//         userSession.orderData.selectedOptions = options;
//     }

//     await message.reply(
//         `✅ ${options.toLowerCase() === 'skip' ? 'Skipped customization' : 'Options saved!'}\n\n` +
//         `🏠 *Shipping Address Details*\n\n` +
//         `Let's collect your shipping address step by step:\n\n` +
//         `1️⃣ *Door/Flat Number:*\n\n` +
//         `📝 *Enter your door or flat number:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_DOOR_NUMBER';
// }

// async function handleProductConfirmation(message, userSession) {
//     const response = message.body.trim().toLowerCase();
    
//     if (response === 'confirm') {
//         await message.reply(
//             `🏠 *Shipping Address Details*\n\n` +
//             `Let's collect your shipping address step by step:\n\n` +
//             `1️⃣ *Door/Flat Number:*\n\n` +
//             `📝 *Enter your door or flat number:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         userSession.state = 'AWAITING_DOOR_NUMBER';
//     } else {
//         await message.reply(
//             `❓ Please type *CONFIRM* to continue.\n\n` +
//             `Product: ${userSession.orderData.productName}\n` +
//             `Quantity: ${userSession.orderData.quantity}\n` +
//             `Total: ₹${userSession.orderData.totalPrice}\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//     }
// }

// async function handleDoorNumber(message, userSession) {
//     const doorNumber = message.body.trim();
    
//     if (doorNumber.length < 1) {
//         await message.reply(
//             `❌ *Please enter a valid door/flat number*\n\n` +
//             `📝 *Enter your door or flat number:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.address.doorNumber = doorNumber;

//     await message.reply(
//         `✅ *Door number saved!*\n\n` +
//         `2️⃣ *Street Name:*\n\n` +
//         `📝 *Enter your street name:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_STREET_NAME';
// }

// async function handleStreetName(message, userSession) {
//     const streetName = message.body.trim();
    
//     if (streetName.length < 2) {
//         await message.reply(
//             `❌ *Please enter a valid street name*\n\n` +
//             `📝 *Enter your street name:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.address.streetName = streetName;

//     await message.reply(
//         `✅ *Street name saved!*\n\n` +
//         `3️⃣ *Area/Locality:*\n\n` +
//         `📝 *Enter your area or locality name:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_AREA_LOCALITY';
// }

// async function handleAreaLocality(message, userSession) {
//     const areaLocality = message.body.trim();
    
//     if (areaLocality.length < 2) {
//         await message.reply(
//             `❌ *Please enter a valid area/locality name*\n\n` +
//             `📝 *Enter your area or locality name:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.address.areaLocality = areaLocality;

//     await message.reply(
//         `✅ *Area/Locality saved!*\n\n` +
//         `4️⃣ *City/District:*\n\n` +
//         `📝 *Enter your city or district name:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_CITY_DISTRICT';
// }

// async function handleCityDistrict(message, userSession) {
//     const cityDistrict = message.body.trim();
    
//     if (cityDistrict.length < 2) {
//         await message.reply(
//             `❌ *Please enter a valid city/district name*\n\n` +
//             `📝 *Enter your city or district name:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.address.cityDistrict = cityDistrict;

//     await message.reply(
//         `✅ *City/District saved!*\n\n` +
//         `5️⃣ *State:*\n\n` +
//         `📝 *Enter your state name:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_STATE';
// }

// async function handleState(message, userSession) {
//     const state = message.body.trim();
    
//     if (state.length < 2) {
//         await message.reply(
//             `❌ *Please enter a valid state name*\n\n` +
//             `📝 *Enter your state name:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.address.state = state;

//     await message.reply(
//         `✅ *State saved!*\n\n` +
//         `6️⃣ *Pincode:*\n\n` +
//         `Please enter your 6-digit pincode:\n\n` +
//         `💡 Example: 400001, 560001, 110001\n\n` +
//         `📝 *Enter your pincode:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_PINCODE';
// }

// async function handlePincode(message, userSession) {
//     const pincode = message.body.trim();
    
//     // Validate pincode format (6 digits)
//     if (!/^\d{6}$/.test(pincode)) {
//         await message.reply(
//             `❌ *Invalid Pincode*\n\n` +
//             `Please enter a valid 6-digit pincode.\n\n` +
//             `💡 Example: 400001, 560001, 110001\n\n` +
//             `📝 *Enter your 6-digit pincode:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.address.pincode = pincode;

//     // Generate order number
//     const orderNumber = 'ORD-' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
//     userSession.orderData.orderNumber = orderNumber;

//     // Build complete address string
//     const completeAddress = 
//         `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}, ${userSession.orderData.address.areaLocality}, ${userSession.orderData.address.cityDistrict}, ${userSession.orderData.address.state} - ${userSession.orderData.address.pincode}`;

//     userSession.orderData.completeAddress = completeAddress;

//     // Final confirmation
//     let finalSummary = 
//         `📋 *FINAL ORDER SUMMARY*\n\n` +
//         `🧾 *Order Number:* ${orderNumber}\n` +
//         `🛍️ *Product:* ${userSession.orderData.productName}\n` +
//         `🛒 *Quantity:* ${userSession.orderData.quantity}\n` +
//         `💰 *Total Amount:* ₹${userSession.orderData.totalPrice}\n`;

//     if (userSession.orderData.selectedOptions) {
//         finalSummary += `🎨 *Customization:* ${userSession.orderData.selectedOptions}\n`;
//     }

//     finalSummary += 
//         `\n🏠 *Shipping Address:*\n` +
//         `📍 ${userSession.orderData.address.doorNumber}\n` +
//         `📍 ${userSession.orderData.address.streetName}\n` +
//         `📍 ${userSession.orderData.address.areaLocality}\n` +
//         `📍 ${userSession.orderData.address.cityDistrict}\n` +
//         `📍 ${userSession.orderData.address.state}\n` +
//         `📮 ${userSession.orderData.address.pincode}\n\n` +
//         `🔒 *Payment Required:* ₹${userSession.orderData.totalPrice}\n\n` +
//         `✅ *Ready to place this order?*\n\n` +
//         `Type *PLACE ORDER* to confirm and proceed to payment\n` +
//         `Type *CANCEL* to abort order process`;

//     await message.reply(finalSummary);
//     userSession.state = 'AWAITING_FINAL_CONFIRMATION';
// }

// async function handleFinalConfirmation(message, userSession, userSessions) {
//     const response = message.body.trim().toLowerCase();
    
//     if (response === 'place order') {
//         // Create order in database
//         const newOrder = new Order({
//             orderNumber: userSession.orderData.orderNumber,
//             phoneNumber: message.from,
//             items: [{
//                 productId: userSession.orderData.productId,
//                 productName: userSession.orderData.productName,
//                 quantity: userSession.orderData.quantity,
//                 price: userSession.orderData.price,
//                 options: userSession.orderData.selectedOptions
//             }],
//             totalPrice: userSession.orderData.totalPrice,
//             shippingAddress: userSession.orderData.completeAddress,
//             pincode: userSession.orderData.address.pincode,
//             status: 'pending',
//             paymentStatus: 'pending',
//         });

//         await newOrder.save();

//         // Update product stock
//         await Product.findByIdAndUpdate(userSession.orderData.productId, {
//             $inc: { stock: -userSession.orderData.quantity }
//         });

//         // Send payment instructions
//         await message.reply(
//             `🎉 *ORDER PLACED SUCCESSFULLY!*\n\n` +
//             `🧾 *Order Number:* ${userSession.orderData.orderNumber}\n` +
//             `💵 *Amount to Pay:* ₹${userSession.orderData.totalPrice}\n\n` +
//             `💳 *PAYMENT INSTRUCTIONS*\n\n` +
//             `Please pay using UPI to:\n` +
//             `📱 *UPI ID:* posterpro.store@upi\n\n` +
//             `🔢 *Important:*\n` +
//             `• Amount must be exact: ₹${userSession.orderData.totalPrice}\n` +
//             `• Add note: Order ${userSession.orderData.orderNumber}\n\n` +
//             `We'll send payment details in the next message...`
//         );

//         // Send payment reminder
//         await message.reply(
//             `📲 *Payment Methods*\n\n` +
//             `1. *UPI Payment:* posterpro.store@upi\n` +
//             `2. *QR Code:* (Will be sent if available)\n\n` +
//             `💰 *Amount:* ₹${userSession.orderData.totalPrice}\n` +
//             `📝 *Reference:* Order ${userSession.orderData.orderNumber}\n\n` +
//             `📸 *After payment:*\n` +
//             `Please send screenshot of payment confirmation\n\n` +
//             `⏰ *Verification:* 5-15 minutes\n\n` +
//             `We'll verify and confirm your order immediately!`
//         );

//         userSession.state = 'AWAITING_PAYMENT_PROOF';

//     } else {
//         await message.reply(
//             `❓ Please type *PLACE ORDER* to confirm.\n\n` +
//             `Order Total: ₹${userSession.orderData.totalPrice}\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//     }
// }

// async function handlePaymentProof(message, userSession, userSessions) {
//     // Check if message has media (screenshot)
//     if (message.hasMedia) {
//         const media = await message.downloadMedia();
        
//         await message.reply(
//             `✅ *Payment Proof Received!*\n\n` +
//             `🎉 Thank you for your purchase!\n\n` +
//             `🧾 *Order #:* ${userSession.orderData.orderNumber}\n` +
//             `📦 *Product:* ${userSession.orderData.productName}\n` +
//             `💰 *Amount Paid:* ₹${userSession.orderData.totalPrice}\n\n` +
//             `🚚 *What Happens Next?*\n` +
//             `1. Payment verification (5-15 minutes)\n` +
//             `2. Order processing within 24 hours\n` +
//             `3. Shipping & tracking details\n` +
//             `4. Delivery in 3-5 business days\n\n` +
//             `📞 *Support:* Type *Help* for assistance\n` +
//             `📦 *Track Order:* Type *MyOrders*\n\n` +
//             `Thank you for choosing us! 🌟`
//         );

//         // Update order status
//         await Order.findOneAndUpdate(
//             { orderNumber: userSession.orderData.orderNumber },
//             { 
//                 paymentStatus: 'paid',
//                 status: 'confirmed'
//             }
//         );

//     } else {
//         await message.reply(
//             `📸 *Payment Proof Required*\n\n` +
//             `Please send the screenshot of your payment confirmation.\n\n` +
//             `💡 *How to take screenshot:*\n` +
//             `1. Complete payment to posterpro.store@upi\n` +
//             `2. Take screenshot of payment success screen\n` +
//             `3. Make sure amount ₹${userSession.orderData.totalPrice} is visible\n` +
//             `4. Send the screenshot here\n\n` +
//             `If you haven't paid yet, please complete the payment first.\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     // Clear session
//     userSession.state = 'IDLE';
//     userSessions.delete(message.from);
// }

// // Helper function to validate image URLs
// async function isValidImageUrl(url) {
//     if (!url || typeof url !== 'string') return false;
//     try {
//         new URL(url);
//         const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
//         return imageExtensions.some(ext => url.toLowerCase().includes(ext));
//     } catch {
//         return false;
//     }
// }