// import pkg from 'whatsapp-web.js';
// import apiService from "../../services/apiService.js";
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
//                 return await handleFinalConfirmation(message, userSession, userSessions, message.from);
            
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

//     try {
//         console.log(`🔍 Fetching product with ID: ${productId}`);
//         const product = await apiService.getProductById(productId);
        
//         // Debug: Log the product response
//         console.log('📦 Product API Response:', product);
        
//         if (!product) {
//             await message.reply(
//                 `❌ *Product Not Found*\n\n` +
//                 `No product found with ID: ${productId}\n\n` +
//                 `💡 *Please check:*\n` +
//                 `• Make sure you typed the ID correctly\n` +
//                 `• Type *Products* to see all available products\n` +
//                 `• Contact support if you need help\n\n` +
//                 `📝 *Enter correct Product ID:*\n\n` +
//                 `💡 Type *CANCEL* to stop order process`
//             );
//             return;
//         }

//         // Check if product is active - handle both isActive and status fields
//         const isProductActive = product.isActive !== false && product.status !== 'inactive';
        
//         if (!isProductActive) {
//             await message.reply(
//                 `❌ *Product Not Available*\n\n` +
//                 `"${product.productName}" is currently not available for purchase.\n\n` +
//                 `💡 Please choose another product by typing *Products*`
//             );
//             userSession.state = 'IDLE';
//             return;
//         }

//         // Handle imageUrls array (multiple images) - take first image
//         const productImageUrl = product.imageUrls && product.imageUrls.length > 0 
//             ? product.imageUrls[0] 
//             : product.imageUrl;

//         // Store product info
//         userSession.orderData = {
//             productId: product._id || product.id,
//             productName: product.productName,
//             price: product.price,
//             imageUrl: productImageUrl,
//             options: product.options,
//             stock: product.stock,
//             address: {} // Initialize address object
//         };

//         // Show product details and ask for quantity
//         let productInfo = 
//             `✅ *Product Found!*\n\n` +
//             `🛍️ *${product.productName}*\n` +
//             `💰 Price: ₹${product.price}\n` +
//             `📦 Available: ${product.stock} units\n`;

//         if (product.description) {
//             productInfo += `📝 ${product.description}\n`;
//         }

//         productInfo += 
//             `\n🎯 *Now, please enter quantity:*\n\n` +
//             `💡 *Note:* Maximum ${product.stock} units available\n` +
//             `📝 *Enter quantity (1-${product.stock}):*\n\n` +
//             `💡 Type *CANCEL* to stop order process`;

//         // Try to send product image
//         try {
//             if (productImageUrl && await isValidImageUrl(productImageUrl)) {
//                 const imageUrl = apiService.getProductImageUrl(productImageUrl);
//                 console.log(`🖼️ Loading product image from: ${imageUrl}`);
                
//                 const media = await MessageMedia.fromUrl(imageUrl, {
//                     unsafeMime: true,
//                     filename: `product-${product._id}.jpg`
//                 });
                
//                 await message.reply(media, null, { caption: productInfo });
//             } else {
//                 await message.reply(productInfo);
//             }
//         } catch (imageError) {
//             console.error('❌ Image load failed:', imageError);
//             await message.reply(productInfo);
//         }

//         userSession.state = 'AWAITING_QUANTITY';

//     } catch (error) {
//         console.error('❌ API Error in product lookup:', error);
//         await message.reply(
//             `❌ *Service Temporarily Unavailable*\n\n` +
//             `Failed to fetch product details. Please try again in a moment.\n\n` +
//             `📝 *Enter Product ID again:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//     }
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

// async function handleFinalConfirmation(message, userSession, userSessions, from) {
//     const response = message.body.trim().toLowerCase();
    
//     if (response === 'place order') {
//         try {
//             // Prepare order data
//             const orderData = {
//                 orderNumber: userSession.orderData.orderNumber,
//                 phoneNumber: from,
//                 items: [{
//                     productId: userSession.orderData.productId,
//                     productName: userSession.orderData.productName,
//                     quantity: userSession.orderData.quantity,
//                     price: userSession.orderData.price,
//                     options: userSession.orderData.selectedOptions
//                 }],
//                 totalPrice: userSession.orderData.totalPrice,
//                 shippingAddress: userSession.orderData.completeAddress,
//                 pincode: userSession.orderData.address.pincode,
//                 status: 'pending',
//                 paymentStatus: 'pending',
//             };

//             console.log('📦 Creating order with data:', orderData);
//             const newOrder = await apiService.createOrder(orderData);

//             // Send payment instructions
//             await message.reply(
//                 `🎉 *ORDER PLACED SUCCESSFULLY!*\n\n` +
//                 `🧾 *Order Number:* ${userSession.orderData.orderNumber}\n` +
//                 `💵 *Amount to Pay:* ₹${userSession.orderData.totalPrice}\n\n` +
//                 `💳 *PAYMENT INSTRUCTIONS*\n\n` +
//                 `Please pay using UPI to:\n` +
//                 `📱 *UPI ID:* posterpro.store@upi\n\n` +
//                 `🔢 *Important:*\n` +
//                 `• Amount must be exact: ₹${userSession.orderData.totalPrice}\n` +
//                 `• Add note: Order ${userSession.orderData.orderNumber}\n\n` +
//                 `We'll send payment details in the next message...`
//             );

//             // Send payment reminder
//             await message.reply(
//                 `📲 *Payment Methods*\n\n` +
//                 `1. *UPI Payment:* posterpro.store@upi\n` +
//                 `2. *QR Code:* (Will be sent if available)\n\n` +
//                 `💰 *Amount:* ₹${userSession.orderData.totalPrice}\n` +
//                 `📝 *Reference:* Order ${userSession.orderData.orderNumber}\n\n` +
//                 `📸 *After payment:*\n` +
//                 `Please send screenshot of payment confirmation\n\n` +
//                 `⏰ *Verification:* 5-15 minutes\n\n` +
//                 `We'll verify and confirm your order immediately!`
//             );

//             userSession.state = 'AWAITING_PAYMENT_PROOF';

//         } catch (error) {
//             console.error('❌ API Error creating order:', error);
//             await message.reply(
//                 `❌ *Order Failed*\n\n` +
//                 `Failed to create order. Please try again or contact support.\n\n` +
//                 `Error: ${error.message}`
//             );
//             userSession.state = 'IDLE';
//         }

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
//         try {
//             await apiService.verifyPayment({
//                 orderNumber: userSession.orderData.orderNumber,
//                 status: 'paid',
//                 paymentStatus: 'confirmed'
//             });
//         } catch (error) {
//             console.error('❌ API Error updating payment status:', error);
//             // Don't show error to user, just log it
//         }

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


// // handlers/orderHandler.js - COMPLETE FIXED VERSION
// import pkg from 'whatsapp-web.js';
// import apiService from "../../services/apiService.js";
// import handlePaymentVerification from './paymentVerificationHandler.js';

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
//                 return await handleFinalConfirmation(message, userSession, userSessions, message.from, client);
            
//             case 'AWAITING_PAYMENT_PROOF':
//                 return await handlePaymentProof(message, userSession, userSessions, client);
            
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

//     try {
//         console.log(`🔍 Fetching product with ID: ${productId}`);
//         const product = await apiService.getProductById(productId);
        
//         // Debug: Log the product response
//         console.log('📦 Product API Response:', product);
        
//         if (!product) {
//             await message.reply(
//                 `❌ *Product Not Found*\n\n` +
//                 `No product found with ID: ${productId}\n\n` +
//                 `💡 *Please check:*\n` +
//                 `• Make sure you typed the ID correctly\n` +
//                 `• Type *Products* to see all available products\n` +
//                 `• Contact support if you need help\n\n` +
//                 `📝 *Enter correct Product ID:*\n\n` +
//                 `💡 Type *CANCEL* to stop order process`
//             );
//             return;
//         }

//         // Check if product is active - handle both isActive and status fields
//         const isProductActive = product.isActive !== false && product.status !== 'inactive';
        
//         if (!isProductActive) {
//             await message.reply(
//                 `❌ *Product Not Available*\n\n` +
//                 `"${product.productName}" is currently not available for purchase.\n\n` +
//                 `💡 Please choose another product by typing *Products*`
//             );
//             userSession.state = 'IDLE';
//             return;
//         }

//         // Handle imageUrls array (multiple images) - take first image
//         const productImageUrl = product.imageUrls && product.imageUrls.length > 0 
//             ? product.imageUrls[0] 
//             : product.imageUrl;

//         // Store product info
//         userSession.orderData = {
//             productId: product._id || product.id,
//             productName: product.productName,
//             price: product.price,
//             imageUrl: productImageUrl,
//             options: product.options,
//             stock: product.stock,
//             address: {} // Initialize address object
//         };

//         // Show product details and ask for quantity
//         let productInfo = 
//             `✅ *Product Found!*\n\n` +
//             `🛍️ *${product.productName}*\n` +
//             `💰 Price: ₹${product.price}\n` +
//             `📦 Available: ${product.stock} units\n`;

//         if (product.description) {
//             productInfo += `📝 ${product.description}\n`;
//         }

//         productInfo += 
//             `\n🎯 *Now, please enter quantity:*\n\n` +
//             `💡 *Note:* Maximum ${product.stock} units available\n` +
//             `📝 *Enter quantity (1-${product.stock}):*\n\n` +
//             `💡 Type *CANCEL* to stop order process`;

//         // Try to send product image
//         try {
//             if (productImageUrl && await isValidImageUrl(productImageUrl)) {
//                 const imageUrl = apiService.getProductImageUrl(productImageUrl);
//                 console.log(`🖼️ Loading product image from: ${imageUrl}`);
                
//                 const media = await MessageMedia.fromUrl(imageUrl, {
//                     unsafeMime: true,
//                     filename: `product-${product._id}.jpg`
//                 });
                
//                 await message.reply(media, null, { caption: productInfo });
//             } else {
//                 await message.reply(productInfo);
//             }
//         } catch (imageError) {
//             console.error('❌ Image load failed:', imageError);
//             await message.reply(productInfo);
//         }

//         userSession.state = 'AWAITING_QUANTITY';

//     } catch (error) {
//         console.error('❌ API Error in product lookup:', error);
//         await message.reply(
//             `❌ *Service Temporarily Unavailable*\n\n` +
//             `Failed to fetch product details. Please try again in a moment.\n\n` +
//             `📝 *Enter Product ID again:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//     }
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
//          `* please enter the correct details *\n\n` +
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
//         `* please enter the correct details *\n\n` +
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
//         `* please enter the correct details *\n\n` +
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
//         `* please enter the correct details *\n\n` +
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
//         `* please enter the correct details *\n\n` +
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
//         `*please enter the correct details*\n\n` +
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

// async function handleFinalConfirmation(message, userSession, userSessions, from, client) {
//     const response = message.body.trim().toLowerCase();
    
//     if (response === 'place order') {
//         try {
//             // Prepare order data
//             const orderData = {
//                 orderNumber: userSession.orderData.orderNumber,
//                 phoneNumber: from,
//                 items: [{
//                     productId: userSession.orderData.productId,
//                     productName: userSession.orderData.productName,
//                     quantity: userSession.orderData.quantity,
//                     price: userSession.orderData.price,
//                     options: userSession.orderData.selectedOptions
//                 }],
//                 totalPrice: userSession.orderData.totalPrice,
//                 shippingAddress: userSession.orderData.completeAddress,
//                 pincode: userSession.orderData.address.pincode,
//                 status: 'pending',
//                 paymentStatus: 'pending',
//             };

//             console.log('📦 Creating order with data:', orderData);
//             const newOrder = await apiService.createOrder(orderData);

//             // Store the created order ID in session
//             if (newOrder && newOrder._id) {
//                 userSession.orderData.orderId = newOrder._id;
//             }

//             // Send payment instructions
//             await message.reply(
//                 `🎉 * YOUR ORDER IS WAITING FOR PAYMENT!*\n\n` +
//                 `🧾 *Order Number:* ${userSession.orderData.orderNumber}\n` +
//                 `💵 *Amount to Pay:* ₹${userSession.orderData.totalPrice}\n\n` +
//                 `💳 *PAYMENT INSTRUCTIONS*\n\n` +
//                 `Please pay using UPI to:\n` +
//                 `📱 *UPI ID:* posterpro.store@upi\n\n` +
//                 `🔢 *Important:*\n` +
//                 `• Amount must be exact: ₹${userSession.orderData.totalPrice}\n` +
//                 `• Add note: Order ${userSession.orderData.orderNumber}\n\n` +
//                 `We'll send payment details in the next message...`
//             );

//             // Send payment reminder
//             await message.reply(
//                 `📲 *Payment Methods*\n\n` +
//                 `1. *UPI Payment:* posterpro.store@upi\n` +
//                 `2. *QR Code:* (Will be sent if available)\n\n` +
//                 `💰 *Amount:* ₹${userSession.orderData.totalPrice}\n` +
//                 `📝 *Reference:* Order ${userSession.orderData.orderNumber}\n\n` +
//                 `📸 *After payment:*\n` +
//                 `Please send screenshot of payment confirmation\n\n` +
//                 `⏰ *Verification:* 5-15 minutes\n\n` +
//                 `We'll verify and confirm your order immediately!`
//             );

//             userSession.state = 'AWAITING_PAYMENT_PROOF';

//         } catch (error) {
//             console.error('❌ API Error creating order:', error);
//             await message.reply(
//                 `❌ *Order Failed*\n\n` +
//                 `Failed to create order. Please try again or contact support.\n\n` +
//                 `Error: ${error.message}`
//             );
//             userSession.state = 'IDLE';
//         }

//     } else {
//         await message.reply(
//             `❓ Please type *PLACE ORDER* to confirm.\n\n` +
//             `Order Total: ₹${userSession.orderData.totalPrice}\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//     }
// }

// async function handlePaymentProof(message, userSession, userSessions, client) {
//     // Check if message has media (screenshot)
//     if (message.hasMedia) {
//         // Use the payment verification handler to process the screenshot
//         await handlePaymentVerification(message, client);
        
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

//     // Don't clear session immediately - let payment verification handle it
//     // The payment verification handler will handle success/failure responses
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









// handlers/orderHandler.js - COMPLETE PROFESSIONAL VERSION
import pkg from 'whatsapp-web.js';
import apiService from "../../services/apiService.js";
import handlePaymentVerification from './paymentVerificationHandler.js';
import  notificationManager  from "../../services/notifications/notification-manager.js";

const { MessageMedia } = pkg;

export async function handleOrderFlow(message, client, userSession, userSessions) {
    const userMessage = message.body.trim();
    const from = message.from;

    try {
        // Check for cancellation at ANY point in the order process (except during cancellation confirmation)
        if (userSession.state !== 'AWAITING_CANCELLATION_CONFIRMATION' && 
            await handleCancellationRequest(message, userSession, userSessions)) {
            return; // Stop further processing if user cancelled
        }

        switch (userSession.state) {
            case 'START_ORDER':
                return await startOrderConfirmation(message, userSession);
            
            case 'AWAITING_ORDER_CONFIRMATION':
                return await handleOrderStartConfirmation(message, userSession);
            
            case 'AWAITING_PRODUCT_ID':
                return await handleProductIdInput(message, userSession, client);
            
            case 'AWAITING_QUANTITY':
                return await handleQuantityInput(message, userSession);
            
            case 'AWAITING_PRODUCT_CONFIRMATION':
                return await handleProductConfirmation(message, userSession);
            
            case 'AWAITING_OPTIONS':
                return await handleOptionsInput(message, userSession);
            
            case 'AWAITING_NAME':
                return await handleCustomerName(message, userSession);
            
            case 'AWAITING_PRIMARY_PHONE':
                return await handlePrimaryPhone(message, userSession);
            
            case 'AWAITING_SECONDARY_PHONE':
                return await handleSecondaryPhone(message, userSession);
            
            case 'AWAITING_DOOR_NUMBER':
                return await handleDoorNumber(message, userSession);
            
            case 'AWAITING_STREET_NAME':
                return await handleStreetName(message, userSession);
            
            case 'AWAITING_AREA_LOCALITY':
                return await handleAreaLocality(message, userSession);
            
            case 'AWAITING_CITY_DISTRICT':
                return await handleCityDistrict(message, userSession);
            
            case 'AWAITING_STATE':
                return await handleState(message, userSession);
            
            case 'AWAITING_PINCODE':
                return await handlePincode(message, userSession);
            
            case 'AWAITING_FINAL_CONFIRMATION':
                return await handleFinalConfirmation(message, userSession, userSessions, from, client);
            
            case 'AWAITING_PAYMENT_PROOF':
                return await handlePaymentProof(message, userSession, userSessions, client);
            
            case 'AWAITING_CANCELLATION_CONFIRMATION':
                return await handleCancellationConfirmation(message, userSession, userSessions);
            
            default:
                userSession.state = 'IDLE';
                return await message.reply('🔄 Session reset. Type *Products* to browse or *Order* to start again.');
        }
    } catch (error) {
        console.error('❌ Order flow error:', error);
        userSession.state = 'IDLE';
        await message.reply('❌ Order process interrupted. Please start again with *Order*.');
    }
}

// NEW FUNCTION: Handle cancellation requests at ANY point
async function handleCancellationRequest(message, userSession, userSessions) {
    const userMessage = message.body.trim().toLowerCase();
    const cancellationKeywords = [
        'cancel', 'stop', 'quit', 'exit', 'no', 'nevermind', 
        'never mind', 'forget it', 'abort', 'end', 'bye'
    ];

    // Check if user wants to cancel
    if (cancellationKeywords.some(keyword => userMessage.includes(keyword))) {
        await message.reply(
            `🛑 *Cancel Order Process?*\n\n` +
            `Are you sure you want to cancel the current order process?\n\n` +
            `✅ Type *YES* to confirm cancellation\n` +
            `❌ Type *NO* to continue ordering\n\n` +
            `This will clear all your current order details.`
        );
        
        // Store original state to return to if user says NO
        userSession.previousState = userSession.state;
        userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
        return true;
    }

    return false;
}

// NEW FUNCTION: Handle cancellation confirmation separately
async function handleCancellationConfirmation(message, userSession, userSessions) {
    const userMessage = message.body.trim().toLowerCase();
    
    if (userMessage === 'yes' || userMessage === 'y') {
        await message.reply(
            `❌ *Order Process Cancelled*\n\n` +
            `Your order process has been cancelled successfully.\n\n` +
            `🛍️ You can start a new order anytime by typing *Order*\n` +
            `📦 Browse products by typing *Products*\n\n` +
            `Thank you for considering us! 🙏`
        );
        
        // Clear session data
        userSession.state = 'IDLE';
        if (userSession.orderData) {
            delete userSession.orderData;
        }
        if (userSession.previousState) {
            delete userSession.previousState;
        }
        return;
        
    } else if (userMessage === 'no' || userMessage === 'n') {
        // Return to previous state
        const previousState = userSession.previousState;
        userSession.state = previousState;
        delete userSession.previousState;
        
        await message.reply(
            `✅ *Order Process Resumed*\n\n` +
            `Great! Let's continue with your order.\n\n` +
            `${getStateSpecificMessage(previousState)}`
        );
        return;
    } else {
        await message.reply(
            `❓ *Please confirm cancellation*\n\n` +
            `Type *YES* to cancel order process\n` +
            `Type *NO* to continue ordering\n\n` +
            `Your current progress will be saved if you continue.`
        );
        return;
    }
}

// Helper function to get state-specific messages
function getStateSpecificMessage(state) {
    const messages = {
        'AWAITING_NAME': '👤 Please enter your full name:',
        'AWAITING_PRIMARY_PHONE': '📱 Please enter your primary phone number:',
        'AWAITING_SECONDARY_PHONE': '📱 Please enter secondary phone number (or type SKIP):',
        'AWAITING_PRODUCT_ID': '📝 Please enter the Product ID:',
        'AWAITING_QUANTITY': '📝 Please enter the quantity:',
        'AWAITING_PRODUCT_CONFIRMATION': '🤔 Please confirm the order details:',
        'AWAITING_OPTIONS': '🎨 Please enter customization options or type SKIP:',
        'AWAITING_DOOR_NUMBER': '🏠 Please enter your door/flat number:',
        'AWAITING_STREET_NAME': '🏠 Please enter your street name:',
        'AWAITING_AREA_LOCALITY': '🏠 Please enter your area/locality:',
        'AWAITING_CITY_DISTRICT': '🏠 Please enter your city/district:',
        'AWAITING_STATE': '🏠 Please enter your state:',
        'AWAITING_PINCODE': '🏠 Please enter your pincode:',
        'AWAITING_FINAL_CONFIRMATION': '✅ Please confirm to place order:',
        'AWAITING_PAYMENT_PROOF': '📸 Please send payment screenshot:'
    };
    
    return messages[state] || 'Please continue with your order.';
}

async function startOrderConfirmation(message, userSession) {
    await message.reply(
        `🛒 *Start New Order*\n\n` +
        `Ready to place an order? I'll guide you through the process step by step! 🎯\n\n` +
        `🤔 *Would you like to continue?*\n\n` +
        `Type *YES* to start ordering\n` +
        `Type *NO* to cancel\n\n` +
        `💡 *You can type CANCEL at any time to stop the process*`
    );
    userSession.state = 'AWAITING_ORDER_CONFIRMATION';
}

async function handleOrderStartConfirmation(message, userSession) {
    const response = message.body.trim().toLowerCase();
    
    if (response === 'yes' || response === 'y') {
        await message.reply(
            `🎯 *Let's Start Your Order!*\n\n` +
            `First, let's get your contact details:\n\n` +
            `1️⃣ *Please enter your full name:*\n\n` +
            `📝 *Example:* John Doe\n\n` +
            `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
        );
        userSession.state = 'AWAITING_NAME';
    } else if (response === 'no' || response === 'n') {
        await message.reply(
            `👋 No problem! Feel free to browse products anytime by typing *Products*.\n\n` +
            `We're here when you're ready to order! 🛍️`
        );
        userSession.state = 'IDLE';
    } else {
        await message.reply(
            `❓ Please type *YES* to start ordering or *NO* to cancel.\n\n` +
            `Would you like to place an order?`
        );
    }
}

async function handleCustomerName(message, userSession) {
    const customerName = message.body.trim();
    
    if (customerName.length < 2) {
        await message.reply(
            `❌ *Please enter a valid name*\n\n` +
            `Name should be at least 2 characters long.\n\n` +
            `📝 *Enter your full name:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData = {
        customerName: customerName,
        address: {} // Initialize address object
    };

    await message.reply(
        `✅ *Name saved!* 👤\n\n` +
        `2️⃣ *Please enter your primary phone number:*\n\n` +
        `📱 *Format:* 10-digit mobile number\n` +
        `📝 *Example:* 9876543210\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_PRIMARY_PHONE';
}

async function handlePrimaryPhone(message, userSession) {
    const phoneNumber = message.body.trim().replace(/\D/g, '');
    
    // Validate phone number
    if (phoneNumber.length !== 10) {
        await message.reply(
            `❌ *Invalid Phone Number*\n\n` +
            `Please enter a valid 10-digit mobile number.\n\n` +
            `📱 *Format:* 9876543210\n` +
            `📝 *Example:* 9876543210\n\n` +
            `📝 *Enter your primary phone number:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.phoneNumber = phoneNumber;

    await message.reply(
        `✅ *Primary phone saved!* 📱\n\n` +
        `3️⃣ *Secondary Phone (Optional):*\n\n` +
        `Do you have an alternate phone number?\n\n` +
        `📝 *Enter secondary phone number or type SKIP:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_SECONDARY_PHONE';
}

async function handleSecondaryPhone(message, userSession) {
    const userInput = message.body.trim();
    
    if (userInput.toLowerCase() === 'skip') {
        userSession.orderData.secondaryPhoneNumber = null;
    } else {
        const secondaryPhone = userInput.replace(/\D/g, '');
        
        if (secondaryPhone.length !== 10 && secondaryPhone.length > 0) {
            await message.reply(
                `❌ *Invalid Secondary Phone*\n\n` +
                `Please enter a valid 10-digit mobile number.\n\n` +
                `📱 *Format:* 9876543210\n` +
                `📝 *Example:* 9876543210\n\n` +
                `📝 *Enter secondary phone number or type SKIP:*\n\n` +
                `💡 Type *CANCEL* to stop order process`
            );
            return;
        }
        
        userSession.orderData.secondaryPhoneNumber = secondaryPhone || null;
    }

    await message.reply(
        `✅ *Contact details saved!* ✅\n\n` +
        `4️⃣ *Now let's select your product:*\n\n` +
        `Please enter the *Product ID* you want to order:\n\n` +
        `💡 *How to find Product ID:*\n` +
        `• Type *Products* to see all products with their IDs\n` +
        `• Look for the ID next to each product\n` +
        `• Example format: 64abc123def456\n\n` +
        `📝 *Enter Product ID:*\n\n` +
        `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
    );
    userSession.state = 'AWAITING_PRODUCT_ID';
}

async function handleProductIdInput(message, userSession, client) {
    const productId = message.body.trim();
    
    // Validate product ID format (MongoDB ObjectId format)
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        await message.reply(
            `❌ *Invalid Product ID Format*\n\n` +
            `Please enter a valid Product ID.\n\n` +
            `💡 *Valid format:* 24-character code like:\n` +
            `• 64abc123def456789abc1234\n` +
            `• 507f1f77bcf86cd799439011\n\n` +
            `📝 *Enter correct Product ID:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    try {
        console.log(`🔍 Fetching product with ID: ${productId}`);
        const product = await apiService.getProductById(productId);
        
        // Debug: Log the product response
        console.log('📦 Product API Response:', product);
        
        if (!product) {
            await message.reply(
                `❌ *Product Not Found*\n\n` +
                `No product found with ID: ${productId}\n\n` +
                `💡 *Please check:*\n` +
                `• Make sure you typed the ID correctly\n` +
                `• Type *Products* to see all available products\n` +
                `• Contact support if you need help\n\n` +
                `📝 *Enter correct Product ID:*\n\n` +
                `💡 Type *CANCEL* to stop order process`
            );
            return;
        }

        // Check if product is active - handle both isActive and status fields
        const isProductActive = product.isActive !== false && product.status !== 'inactive';
        
        if (!isProductActive) {
            await message.reply(
                `❌ *Product Not Available*\n\n` +
                `"${product.productName}" is currently not available for purchase.\n\n` +
                `💡 Please choose another product by typing *Products*`
            );
            userSession.state = 'IDLE';
            return;
        }

        // Handle imageUrls array (multiple images) - take first image
        const productImageUrl = product.imageUrls && product.imageUrls.length > 0 
            ? product.imageUrls[0] 
            : product.imageUrl;

        // Store product info in orderData
        userSession.orderData.productId = product._id || product.id;
        userSession.orderData.productName = product.productName;
        userSession.orderData.price = product.price;
        userSession.orderData.imageUrl = productImageUrl;
        userSession.orderData.options = product.options;
        userSession.orderData.stock = product.stock;

        // Show product details and ask for quantity
        let productInfo = 
            `✅ *Product Found!*\n\n` +
            `👤 *Customer:* ${userSession.orderData.customerName}\n` +
            `📱 *Phone:* ${userSession.orderData.phoneNumber}\n` +
            `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
            `🛍️ *Product:* ${product.productName}\n` +
            `💰 Price: ₹${product.price}\n` +
            `📦 Available: ${product.stock} units\n`;

        if (product.description) {
            productInfo += `📝 ${product.description}\n`;
        }

        productInfo += 
            `\n🎯 *Now, please enter quantity:*\n\n` +
            `💡 *Note:* Maximum ${product.stock} units available\n` +
            `📝 *Enter quantity (1-${product.stock}):*\n\n` +
            `💡 Type *CANCEL* to stop order process`;

        // Try to send product image
        try {
            if (productImageUrl && await isValidImageUrl(productImageUrl)) {
                const imageUrl = apiService.getProductImageUrl(productImageUrl);
                console.log(`🖼️ Loading product image from: ${imageUrl}`);
                
                const media = await MessageMedia.fromUrl(imageUrl, {
                    unsafeMime: true,
                    filename: `product-${product._id}.jpg`
                });
                
                await message.reply(media, null, { caption: productInfo });
            } else {
                await message.reply(productInfo);
            }
        } catch (imageError) {
            console.error('❌ Image load failed:', imageError);
            await message.reply(productInfo);
        }

        userSession.state = 'AWAITING_QUANTITY';

    } catch (error) {
        console.error('❌ API Error in product lookup:', error);
        await message.reply(
            `❌ *Service Temporarily Unavailable*\n\n` +
            `Failed to fetch product details. Please try again in a moment.\n\n` +
            `📝 *Enter Product ID again:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
    }
}

async function handleQuantityInput(message, userSession) {
    const quantityInput = message.body.trim();
    const quantity = parseInt(quantityInput);

    // Validate quantity
    if (isNaN(quantity) || quantity < 1) {
        await message.reply(
            `❌ *Invalid Quantity*\n\n` +
            `Please enter a valid number (minimum 1).\n\n` +
            `📝 *Enter quantity for ${userSession.orderData.productName}:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    if (quantity > userSession.orderData.stock) {
        await message.reply(
            `❌ *Insufficient Stock*\n\n` +
            `Only ${userSession.orderData.stock} units available for "${userSession.orderData.productName}".\n\n` +
            `💡 Please enter quantity between 1-${userSession.orderData.stock}\n\n` +
            `📝 *Enter quantity:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    // Update order data with quantity
    userSession.orderData.quantity = quantity;
    userSession.orderData.totalPrice = userSession.orderData.price * quantity;

    // Show order summary and ask for confirmation
    let confirmationText = 
        `📋 *Order Summary*\n\n` +
        `👤 *Customer:* ${userSession.orderData.customerName}\n` +
        `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
        `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
        `🛍️ *Product:* ${userSession.orderData.productName}\n` +
        `💰 *Unit Price:* ₹${userSession.orderData.price}\n` +
        `🛒 *Quantity:* ${quantity}\n` +
        `💵 *Total Amount:* ₹${userSession.orderData.totalPrice}\n`;

    if (userSession.orderData.options) {
        confirmationText += `\n⚙️ *Available Options:* ${userSession.orderData.options}\n\n` +
        `🎨 *Would you like any customization?*\n\n` +
        `💡 Example: "Blue, Large" or "With Frame"\n\n` +
        `Type your preferences or type *SKIP* to continue:\n\n` +
        `💡 Type *CANCEL* to stop order process`;
        
        userSession.state = 'AWAITING_OPTIONS';
    } else {
        confirmationText += `\n🤔 *Confirm this order?*\n\n` +
        `*Please give the address details correctly without error*\n\n` +
        `Type *CONFIRM* to continue\n` +
        `Type *CANCEL* to stop order process`;
        
        userSession.state = 'AWAITING_PRODUCT_CONFIRMATION';
    }

    await message.reply(confirmationText);
}

async function handleOptionsInput(message, userSession) {
    const options = message.body.trim();
    
    if (options.toLowerCase() === 'skip') {
        userSession.orderData.selectedOptions = 'No customization';
    } else {
        userSession.orderData.selectedOptions = options;
    }

    await message.reply(
        `✅ ${options.toLowerCase() === 'skip' ? 'Skipped customization' : 'Options saved!'}\n\n` +
        `🏠 *Shipping Address Details*\n\n` +
        `Let's collect your shipping address step by step:\n\n` +
         `* please enter the correct details *\n\n` +
        `1️⃣ *Door/Flat Number:*\n\n` +
        `📝 *Enter your door or flat number:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_DOOR_NUMBER';
}

async function handleProductConfirmation(message, userSession) {
    const response = message.body.trim().toLowerCase();
    
    if (response === 'confirm') {
        await message.reply(
            `🏠 *Shipping Address Details*\n\n` +
            `Let's collect your shipping address step by step:\n\n` +
            `1️⃣ *Door/Flat Number:*\n\n` +
            `📝 *Enter your door or flat number:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        userSession.state = 'AWAITING_DOOR_NUMBER';
    } else {
        await message.reply(
            `❓ Please type *CONFIRM* to continue.\n\n` +
            `Customer: ${userSession.orderData.customerName}\n` +
            `Phone: ${userSession.orderData.phoneNumber}\n` +
            `Product: ${userSession.orderData.productName}\n` +
            `Quantity: ${userSession.orderData.quantity}\n` +
            `Total: ₹${userSession.orderData.totalPrice}\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
    }
}

async function handleDoorNumber(message, userSession) {
    const doorNumber = message.body.trim();
    
    if (doorNumber.length < 1) {
        await message.reply(
            `❌ *Please enter a valid door/flat number*\n\n` +
            `📝 *Enter your door or flat number:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.address.doorNumber = doorNumber;

    await message.reply(
        `✅ *Door number saved!*\n\n` +
        `* please enter the correct details *\n\n` +
        `2️⃣ *Street Name:*\n\n` +
        `📝 *Enter your street name:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_STREET_NAME';
}

async function handleStreetName(message, userSession) {
    const streetName = message.body.trim();
    
    if (streetName.length < 2) {
        await message.reply(
            `❌ *Please enter a valid street name*\n\n` +
            `📝 *Enter your street name:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.address.streetName = streetName;

    await message.reply(
        `✅ *Street name saved!*\n\n` +
        `* please enter the correct details *\n\n` +
        `3️⃣ *Area/Locality:*\n\n` +
        `📝 *Enter your area or locality name:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_AREA_LOCALITY';
}

async function handleAreaLocality(message, userSession) {
    const areaLocality = message.body.trim();
    
    if (areaLocality.length < 2) {
        await message.reply(
            `❌ *Please enter a valid area/locality name*\n\n` +
            `📝 *Enter your area or locality name:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.address.areaLocality = areaLocality;

    await message.reply(
        `✅ *Area/Locality saved!*\n\n` +
        `* please enter the correct details *\n\n` +
        `4️⃣ *City/District:*\n\n` +
        `📝 *Enter your city or district name:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_CITY_DISTRICT';
}

async function handleCityDistrict(message, userSession) {
    const cityDistrict = message.body.trim();
    
    if (cityDistrict.length < 2) {
        await message.reply(
            `❌ *Please enter a valid city/district name*\n\n` +
            `📝 *Enter your city or district name:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.address.cityDistrict = cityDistrict;

    await message.reply(
        `✅ *City/District saved!*\n\n` +
        `* please enter the correct details *\n\n` +
        `5️⃣ *State:*\n\n` +
        `📝 *Enter your state name:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_STATE';
}

async function handleState(message, userSession) {
    const state = message.body.trim();
    
    if (state.length < 2) {
        await message.reply(
            `❌ *Please enter a valid state name*\n\n` +
            `📝 *Enter your state name:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.address.state = state;

    await message.reply(
        `✅ *State saved!*\n\n` +
        `*please enter the correct details*\n\n` +
        `6️⃣ *Pincode:*\n\n` +
        `Please enter your 6-digit pincode:\n\n` +
        `💡 Example: 400001, 560001, 110001\n\n` +
        `📝 *Enter your pincode:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_PINCODE';
}

async function handlePincode(message, userSession) {
    const pincode = message.body.trim();
    
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
        await message.reply(
            `❌ *Invalid Pincode*\n\n` +
            `Please enter a valid 6-digit pincode.\n\n` +
            `💡 Example: 400001, 560001, 110001\n\n` +
            `📝 *Enter your 6-digit pincode:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.address.pincode = pincode;

    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    userSession.orderData.orderNumber = orderNumber;

    // Build complete address string
    const completeAddress = 
        `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}, ${userSession.orderData.address.areaLocality}, ${userSession.orderData.address.cityDistrict}, ${userSession.orderData.address.state} - ${userSession.orderData.address.pincode}`;

    userSession.orderData.completeAddress = completeAddress;

    // Final confirmation
    let finalSummary = 
        `📋 *FINAL ORDER SUMMARY*\n\n` +
        `👤 *Customer Name:* ${userSession.orderData.customerName}\n` +
        `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
        `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
        `🧾 *Order Number:* ${orderNumber}\n` +
        `🛍️ *Product:* ${userSession.orderData.productName}\n` +
        `🛒 *Quantity:* ${userSession.orderData.quantity}\n` +
        `💰 *Total Amount:* ₹${userSession.orderData.totalPrice}\n`;

    if (userSession.orderData.selectedOptions) {
        finalSummary += `🎨 *Customization:* ${userSession.orderData.selectedOptions}\n`;
    }

    finalSummary += 
        `\n🏠 *Shipping Address:*\n` +
        `📍 ${userSession.orderData.address.doorNumber}\n` +
        `📍 ${userSession.orderData.address.streetName}\n` +
        `📍 ${userSession.orderData.address.areaLocality}\n` +
        `📍 ${userSession.orderData.address.cityDistrict}\n` +
        `📍 ${userSession.orderData.address.state}\n` +
        `📮 ${userSession.orderData.address.pincode}\n\n` +
        `🔒 *Payment Required:* ₹${userSession.orderData.totalPrice}\n\n` +
        `✅ *Ready to place this order?*\n\n` +
        `Type *PLACE ORDER* to confirm and proceed to payment\n` +
        `Type *CANCEL* to abort order process`;

    await message.reply(finalSummary);
    userSession.state = 'AWAITING_FINAL_CONFIRMATION';
}

async function handleFinalConfirmation(message, userSession, userSessions, from, client) {
    const response = message.body.trim().toLowerCase();
    const customerPhone = apiService.cleanPhoneNumber(from);
    
    if (response === 'place order') {
        try {
            // Prepare order data with new fields
            const orderData = {
                orderNumber: userSession.orderData.orderNumber,
                customerName: userSession.orderData.customerName,
                phoneNumber: userSession.orderData.phoneNumber,
                secondaryPhoneNumber: userSession.orderData.secondaryPhoneNumber || null,
                customerPhone: customerPhone,
                items: [{
                    productId: userSession.orderData.productId,
                    productName: userSession.orderData.productName,
                    quantity: userSession.orderData.quantity,
                    price: userSession.orderData.price,
                    options: userSession.orderData.selectedOptions || 'No customization'
                }],
                totalPrice: userSession.orderData.totalPrice,
                shippingAddress: userSession.orderData.completeAddress,
                address: userSession.orderData.address,
                pincode: userSession.orderData.address.pincode,
                status: 'pending',
                paymentStatus: 'pending',
                orderSource: 'whatsapp_bot',
                createdAt: new Date().toISOString()
            };

            console.log('📦 Creating order with data:', {
                orderNumber: orderData.orderNumber,
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                primaryPhone: orderData.phoneNumber,
                secondaryPhone: orderData.secondaryPhoneNumber,
                amount: orderData.totalPrice,
                product: orderData.items[0].productName,
                quantity: orderData.items[0].quantity
            });

            // Create order via API
            const newOrder = await apiService.createOrder(orderData);
            
            if (!newOrder || !newOrder._id) {
                throw new Error('Failed to create order: No order ID returned from API');
            }

            // Store the created order ID in session
            userSession.orderData.orderId = newOrder._id;
            userSession.orderData.apiOrder = newOrder; // Store full order object

            console.log(`✅ Order created successfully:`, {
                orderId: newOrder._id,
                orderNumber: newOrder.orderNumber || orderData.orderNumber,
                customerName: newOrder.customerName || orderData.customerName,
                status: newOrder.status || 'pending'
            });

            // Send new order notification to admin
            try {
                await notificationManager.sendNotification('NEW_ORDER', {
                    ...newOrder,
                    customerPhone: customerPhone,
                    phoneNumber: customerPhone
                });
                console.log(`🔔 New order notification sent for: ${newOrder.orderNumber || orderData.orderNumber}`);
            } catch (notifyError) {
                console.warn('⚠️ Failed to send new order notification:', notifyError.message);
                // Continue anyway - notification failure shouldn't block order creation
            }

            // Send payment instructions
            await sendPaymentInstructions(message, userSession, newOrder);

            // Send order confirmation to customer
            await sendOrderConfirmation(message, userSession, customerPhone);

            // Update user session state
            userSession.state = 'AWAITING_PAYMENT_PROOF';
            userSession.orderData.paymentRequestedAt = new Date().toISOString();

            // Schedule payment reminder (after 1 hour)
            schedulePaymentReminder(userSession, customerPhone, newOrder);

        } catch (error) {
            console.error('❌ API Error creating order:', {
                error: error.message,
                stack: error.stack,
                customerName: userSession.orderData?.customerName,
                customerPhone: customerPhone,
                orderNumber: userSession.orderData?.orderNumber
            });
            
            // Send error notification to admin
            try {
                await notificationManager.sendNotification('ADMIN_ALERT', {
                    title: '❌ Order Creation Failed',
                    body: `Failed to create order for ${userSession.orderData?.customerName} (${customerPhone}). Error: ${error.message.substring(0, 50)}...`,
                    notificationData: {
                        category: 'system',
                        priority: 'high',
                        extraData: {
                            customerName: userSession.orderData?.customerName,
                            customerPhone,
                            orderNumber: userSession.orderData?.orderNumber,
                            error: error.message,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
            } catch (notifyError) {
                console.error('❌ Failed to send error notification:', notifyError.message);
            }

            await message.reply(
                `❌ *Order Failed*\n\n` +
                `We encountered an error while creating your order.\n\n` +
                `*Please try again or contact support:*\n` +
                `📞 Support: +91 XXXXX XXXXX\n` +
                `📧 Email: support@posterpro.store\n\n` +
                `*Error Details:*\n` +
                `\`${error.message.substring(0, 100)}\`\n\n` +
                `🔄 *Please start over by typing:* Order`
            );
            
            // Clear session and reset state
            userSession.state = 'IDLE';
            delete userSession.orderData;
        }

    } else if (response === 'cancel' || response.includes('cancel')) {
        await handleOrderCancellation(message, userSession);
        
    } else {
        await message.reply(
            `❓ *Please confirm your order*\n\n` +
            `To place your order, type: *PLACE ORDER*\n\n` +
            `*Order Summary:*\n` +
            `👤 Customer: ${userSession.orderData.customerName}\n` +
            `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
            `🛍️ Product: ${userSession.orderData.productName}\n` +
            `📦 Quantity: ${userSession.orderData.quantity}\n` +
            `💰 Total: ₹${userSession.orderData.totalPrice}\n\n` +
            `📍 Shipping to:\n${userSession.orderData.completeAddress}\n\n` +
            `💡 *Type CANCEL to stop order process*`
        );
    }
}

/**
 * Send payment instructions to customer
 */
async function sendPaymentInstructions(message, userSession, order) {
    const orderNumber = order.orderNumber || userSession.orderData.orderNumber;
    const amount = order.totalPrice || userSession.orderData.totalPrice;
    
    try {
        await message.reply(
            `🎉 *YOUR ORDER IS CONFIRMED!*\n\n` +
            `👤 *Customer:* ${userSession.orderData.customerName}\n` +
            `🧾 *Order Number:* ${orderNumber}\n` +
            `💵 *Amount to Pay:* ₹${amount}\n` +
            `📦 *Item:* ${userSession.orderData.productName} x${userSession.orderData.quantity}\n\n` +
            `⏰ *Payment Deadline:* 24 hours\n\n` +
            `💳 *PAYMENT INSTRUCTIONS*\n\n` +
            `1️⃣ *UPI Payment (Recommended):*\n` +
            `📱 UPI ID: posterpro.store@upi\n\n` +
            `2️⃣ *QR Code:* Available on request\n\n` +
            `🔢 *MANDATORY PAYMENT NOTES:*\n` +
            `• Amount must be exact: ₹${amount}\n` +
            `• Add note: Order ${orderNumber} - ${userSession.orderData.customerName}\n` +
            `• Keep screenshot of successful payment\n\n` +
            `📸 *After payment:*\n` +
            `Send screenshot here within 24 hours`
        );

        // Send second message with additional details
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await message.reply(
            `📋 *PAYMENT VERIFICATION PROCESS*\n\n` +
            `1. Make payment to subaask21@oksbi\n` +
            `2. Take clear screenshot of:\n` +
            `   ✅ "Payment Successful" message\n` +
            `   ✅ Amount: ₹${amount}\n` +
            `   ✅ UPI ID: subaask21@oksbi\n` +
            `   ✅ Transaction ID\n` +
            `   ✅ Date & Time\n\n` +
            `3. Send screenshot here\n\n` +
            `⏱️ *Verification Time:* 5-15 minutes\n` +
            `✅ *Order Process:* Immediate after verification\n\n` +
            `🔄 *Payment failed?* Try again and send new screenshot\n` +
            `❓ *Need help?* Reply with your question`
        );

    } catch (error) {
        console.error('❌ Error sending payment instructions:', error);
        // Fallback simple message
        await message.reply(
            `🎉 Order confirmed for ${userSession.orderData.customerName}!\n` +
            `Pay ₹${amount} to subaask21@oksbi\n\n` +
            `Order: ${orderNumber}\n` +
            `Send payment screenshot here.`
        );
    }
}

/**
 * Send order confirmation to customer
 */
async function sendOrderConfirmation(message, userSession, customerPhone) {
    try {
        // Send confirmation notification to customer if they have app
        await notificationManager.sendNotification('CUSTOMER_NOTIFICATION', {
            customerPhone: customerPhone,
            customerName: userSession.orderData.customerName,
            title: '🎉 Order Confirmed!',
            body: `${userSession.orderData.customerName}, your order #${userSession.orderData.orderNumber} has been received. Amount: ₹${userSession.orderData.totalPrice}`,
            notificationData: {
                category: 'order',
                priority: 'normal',
                referenceId: userSession.orderData.orderNumber,
                actionUrl: `/orders/${userSession.orderData.orderNumber}`,
                extraData: {
                    customerName: userSession.orderData.customerName,
                    orderNumber: userSession.orderData.orderNumber,
                    amount: userSession.orderData.totalPrice,
                    product: userSession.orderData.productName,
                    quantity: userSession.orderData.quantity,
                    estimatedProcessing: '24-48 hours',
                    supportContact: '+91 XXXXX XXXXX'
                }
            }
        });
        console.log(`📱 Order confirmation sent to customer: ${userSession.orderData.customerName} (${customerPhone})`);
    } catch (error) {
        console.log('ℹ️ Customer notification skipped (no FCM token):', error.message);
    }
}

/**
 * Schedule payment reminder
 */
function schedulePaymentReminder(userSession, customerPhone, order) {
    const reminderTime = 60 * 60 * 1000; // 1 hour
    
    setTimeout(async () => {
        try {
            // Check if payment is still pending
            const currentOrder = await apiService.getOrderById(order._id);
            
            if (currentOrder && currentOrder.paymentStatus === 'pending') {
                console.log(`⏰ Sending payment reminder for order: ${order.orderNumber}`);
                
                // Send reminder notification
                await notificationManager.sendNotification('PAYMENT_REMINDER', {
                    ...order,
                    customerName: userSession.orderData.customerName,
                    isFirstReminder: true
                });
            }
        } catch (error) {
            console.error('❌ Error in payment reminder:', error);
        }
    }, reminderTime);
}

/**
 * Handle order cancellation
 */
async function handleOrderCancellation(message, userSession) {
    await message.reply(
        `🛑 *Cancel Order Process?*\n\n` +
        `Are you sure you want to cancel this order?\n\n` +
        `*Order Details:*\n` +
        `👤 Customer: ${userSession.orderData.customerName}\n` +
        `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
        `🛍️ Product: ${userSession.orderData.productName}\n` +
        `💰 Amount: ₹${userSession.orderData.totalPrice}\n\n` +
        `✅ Type *YES* to cancel and clear all details\n` +
        `❌ Type *NO* to continue with your order\n\n` +
        `*Note:* This action cannot be undone.`
    );
    
    userSession.previousState = userSession.state;
    userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
}

async function handlePaymentProof(message, userSession, userSessions, client) {
    // Check if message has media (screenshot)
    if (message.hasMedia) {
        try {
            // Store the message in session for payment verification handler
            userSession.orderData.lastPaymentMessage = {
                from: message.from,
                timestamp: new Date().toISOString(),
                customerName: userSession.orderData.customerName,
                orderNumber: userSession.orderData.orderNumber,
                amount: userSession.orderData.totalPrice
            };
            
            // Use the payment verification handler to process the screenshot
            await handlePaymentVerification(message, client);
            
        } catch (error) {
            console.error('❌ Error in payment proof handling:', error);
            await message.reply(
                `❌ *Error Processing Payment*\n\n` +
                `Failed to process your payment screenshot. Please try again.\n\n` +
                `*Please ensure:*\n` +
                `✅ Clear screenshot of payment success\n` +
                `✅ Amount ₹${userSession.orderData.totalPrice} visible\n` +
                `✅ UPI ID: subaask21@oksbi visible\n\n` +
                `Send the screenshot again.`
            );
        }
        
    } else {
        // Check if user is trying to cancel
        const userMessage = message.body.trim().toLowerCase();
        if (userMessage.includes('cancel')) {
            await handleOrderCancellation(message, userSession);
            return;
        }
        
        await message.reply(
            `📸 *Payment Proof Required*\n\n` +
            `Dear ${userSession.orderData.customerName}, please send the screenshot of your payment confirmation.\n\n` +
            `💡 *How to take screenshot:*\n` +
            `1. Complete payment to subaask21@oksbi\n` +
            `2. Take screenshot of payment success screen\n` +
            `3. Make sure amount ₹${userSession.orderData.totalPrice} is visible\n` +
            `4. Send the screenshot here\n\n` +
            `If you haven't paid yet, please complete the payment first.\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    // Don't clear session immediately - let payment verification handle it
    // The payment verification handler will handle success/failure responses
}

// Helper function to validate image URLs
async function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        new URL(url);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    } catch {
        return false;
    }
}